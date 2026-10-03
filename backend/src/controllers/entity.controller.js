import { db } from '../core/db/knex.js';

/**
 * Controller handling Entity surveillance, KPI evidence gap scoring,
 * and negative space asset coverage.
 */

/**
 * 1. Entities list with latest attention scores & risk tiers
 * GET /api/v1/entities
 */
export async function getEntities(req, res) {
  const entities = await db('entities')
    .leftJoin('sectors', 'entities.sector_id', 'sectors.id')
    .select(
      'entities.*',
      'sectors.code as sector_code',
      'sectors.name as sector_name'
    );

  // Get latest score for each entity
  const scores = await db('entity_scores').orderBy('created_at', 'desc');
  const alertCounts = await db('alerts').groupBy('entity_id').select('entity_id').count('id as alert_count');
  const assetCounts = await db('assets').groupBy('entity_id').select('entity_id').count('id as asset_count');

  const result = entities.map(ent => {
    const latestScore = scores.find(s => s.entity_id === ent.id);
    const score = latestScore ? latestScore.composite_score : 0;
    const alertRow = alertCounts.find(a => a.entity_id === ent.id);
    const assetRow = assetCounts.find(a => a.entity_id === ent.id);
    const alert_count = alertRow ? parseInt(alertRow.alert_count, 10) : 0;
    const asset_count = assetRow ? parseInt(assetRow.asset_count, 10) : 0;

    let riskLevel = 'LOW';
    if (score >= 75) riskLevel = 'CRITICAL';
    else if (score >= 60) riskLevel = 'HIGH';
    else if (score >= 30) riskLevel = 'MEDIUM';

    return {
      ...ent,
      score,
      riskLevel,
      rank: latestScore ? latestScore.rank : 99,
      percentile: latestScore ? latestScore.percentile : 50,
      alert_count,
      asset_count,
      dimension_scores: latestScore && latestScore.dimension_scores_json 
        ? JSON.parse(latestScore.dimension_scores_json) 
        : {},
      contributing_findings: latestScore ? latestScore.contributing_findings : 0
    };
  });

  result.sort((a, b) => b.score - a.score);
  res.json({ data: result });
}

/**
 * 2. Detailed Entity Profile & Operational Breakdown
 * GET /api/v1/entities/:id/summary
 */
export async function getEntitySummary(req, res) {
  const { id } = req.params;
  const entity = await db('entities').where('id', id).first();
  if (!entity) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Entity not found' } });
  }

  const sector = await db('sectors').where('id', entity.sector_id).first();
  const assets = await db('assets').where('entity_id', id);
  const findings = await db('findings').where('entity_id', id);
  const scoreRow = await db('entity_scores').where('entity_id', id).orderBy('created_at', 'desc').first();

  const dimensionScores = scoreRow && scoreRow.dimension_scores_json 
    ? JSON.parse(scoreRow.dimension_scores_json) 
    : {};

  res.json({
    data: {
      entity,
      sector,
      assetCount: assets.length,
      criticalAssets: assets.filter(a => a.criticality >= 4),
      score: scoreRow ? scoreRow.composite_score : 0,
      dimensionScores,
      findingsCount: findings.length,
      findings
    }
  });
}

/**
 * 3. Headline Reported KPIs vs Underlying Evidence (Key Supervisory Feature)
 * GET /api/v1/kpis-vs-evidence
 */
export async function getKpisVsEvidence(req, res) {
  const entities = await db('entities');
  const alerts = await db('alerts');
  const steps = await db('investigation_steps');
  const escalations = await db('escalations');
  const findings = await db('findings');

  const result = entities.map(ent => {
    const entAlerts = alerts.filter(a => a.entity_id === ent.id);
    const criticalAlerts = entAlerts.filter(a => a.severity === 'CRITICAL');
    const entSteps = steps.filter(s => s.entity_id === ent.id);
    const entEsc = escalations.filter(e => e.entity_id === ent.id);

    // Headline Reported SLA: e.g. alerts closed under 60 mins SLA target
    const closedInSla = entAlerts.filter(a => {
      if (!a.created_at || !a.closed_at) return true;
      const dur = (new Date(a.closed_at) - new Date(a.created_at)) / 60000;
      return dur <= 60;
    });
    const headlineSlaPct = entAlerts.length > 0 ? (closedInSla.length / entAlerts.length) * 100 : 95.0;

    // Evidence Quality Indicators
    const fastCritical = criticalAlerts.filter(a => {
      const dur = (new Date(a.closed_at) - new Date(a.created_at)) / 60000;
      return dur < 10;
    });
    const fastClosePct = criticalAlerts.length > 0 ? (fastCritical.length / criticalAlerts.length) * 100 : 0;

    const escalatedIds = new Set(entEsc.map(e => e.alert_id));
    const unescalatedCrit = criticalAlerts.filter(a => !escalatedIds.has(a.id));
    const unescalatedPct = criticalAlerts.length > 0 ? (unescalatedCrit.length / criticalAlerts.length) * 100 : 0;

    // Evidence Quality Score (0 to 100)
    const evidenceQuality = Math.max(5, Math.round(100 - (fastClosePct * 0.5 + unescalatedPct * 0.5)));

    // Execution Gap Size: High reported SLA vs Low Evidence Quality
    const executionGap = Math.max(0, Math.round(headlineSlaPct - evidenceQuality));

    return {
      entityId: ent.id,
      entityCode: ent.code,
      entityName: ent.name,
      headlineSlaPct: Number(headlineSlaPct.toFixed(1)),
      evidenceQualityScore: evidenceQuality,
      executionGapSize: executionGap,
      fastClosePct: Number(fastClosePct.toFixed(1)),
      unescalatedCriticalPct: Number(unescalatedPct.toFixed(1)),
      findingsCount: findings.filter(f => f.entity_id === ent.id).length
    };
  });

  result.sort((a, b) => b.executionGapSize - a.executionGapSize);
  res.json({ data: result });
}

/**
 * 4. Negative Space Coverage & Silent Critical Assets
 * GET /api/v1/negative-space
 */
export async function getNegativeSpace(req, res) {
  const assets = await db('assets');
  const entities = await db('entities');

  const silentAssets = assets
    .filter(a => a.criticality >= 4)
    .map(a => {
      const daysSilent = Math.round((Date.now() - new Date(a.last_seen)) / 86400000);
      const entity = entities.find(e => e.id === a.entity_id);
      return {
        ...a,
        entityCode: entity ? entity.code : 'UNKNOWN',
        entityName: entity ? entity.name : 'Unknown Entity',
        daysSilent,
        status: daysSilent > 14 ? 'SILENT_CRITICAL' : 'ACTIVE_MONITORED'
      };
    })
    .filter(a => a.daysSilent > 10);

  silentAssets.sort((a, b) => b.daysSilent - a.daysSilent);

  res.json({
    data: {
      silentAssets,
      totalSilent: silentAssets.length
    }
  });
}
