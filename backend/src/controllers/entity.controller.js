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
  const entities = await db('entities')
    .leftJoin('sectors', 'entities.sector_id', 'sectors.id')
    .select(
      'entities.*',
      'sectors.code as sector_code',
      'sectors.name as sector_name'
    );
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
      sectorCode: ent.sector_code || 'OTHER',
      sectorName: ent.sector_name || 'Critical Infrastructure',
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

/**
 * 5. Peer Cohort Comparison
 * GET /api/v1/entities/compare?codes=CSE-BANK-01,CSE-BANK-02
 * Enforces strict same-sector cohort constraint.
 */
export async function compareEntities(req, res) {
  const codesParam = req.query.codes || req.query.entities || '';
  const requestedCodes = codesParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

  if (requestedCodes.length < 2) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'At least 2 entity codes must be specified for peer comparison (e.g. ?codes=CSE-BANK-01,CSE-BANK-02)'
      }
    });
  }

  const entities = await db('entities')
    .leftJoin('sectors', 'entities.sector_id', 'sectors.id')
    .select(
      'entities.*',
      'sectors.code as sector_code',
      'sectors.name as sector_name'
    );

  const matchedEntities = entities.filter(e => requestedCodes.includes(e.code.toUpperCase()) || requestedCodes.includes(e.id));

  if (matchedEntities.length < 2) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Could not find all specified entities. Found ${matchedEntities.length} of ${requestedCodes.length}`
      }
    });
  }

  // Strict Same-Sector Check
  const sectors = new Set(matchedEntities.map(e => e.sector_code));
  if (sectors.size > 1) {
    return res.status(400).json({
      error: {
        code: 'CROSS_SECTOR_COMPARISON_PROHIBITED',
        message: `Cross-sector comparison is prohibited by supervisory policy. Selected entities belong to multiple sectors: ${Array.from(sectors).join(', ')}`
      }
    });
  }

  const sectorCode = matchedEntities[0].sector_code;
  const sectorName = matchedEntities[0].sector_name;

  // Fetch KPI Gap data & Operational tables
  const alerts = await db('alerts');
  const escalations = await db('escalations');
  const findings = await db('findings');
  const scores = await db('entity_scores');
  const assets = await db('assets');

  // Compute profile for each matched entity
  const entityProfiles = matchedEntities.map(ent => {
    const entAlerts = alerts.filter(a => a.entity_id === ent.id);
    const criticalAlerts = entAlerts.filter(a => a.severity === 'CRITICAL');
    const entEsc = escalations.filter(e => e.entity_id === ent.id);
    const entFindings = findings.filter(f => f.entity_id === ent.id);
    const entAssets = assets.filter(a => a.entity_id === ent.id);
    const entScore = scores.find(s => s.entity_id === ent.id);

    const closedInSla = entAlerts.filter(a => {
      if (!a.created_at || !a.closed_at) return true;
      const dur = (new Date(a.closed_at) - new Date(a.created_at)) / 60000;
      return dur <= 60;
    });
    const headlineSlaPct = entAlerts.length > 0 ? (closedInSla.length / entAlerts.length) * 100 : 95.0;

    const fastCritical = criticalAlerts.filter(a => {
      const dur = (new Date(a.closed_at) - new Date(a.created_at)) / 60000;
      return dur < 10;
    });
    const fastClosePct = criticalAlerts.length > 0 ? (fastCritical.length / criticalAlerts.length) * 100 : 0;

    const escalatedIds = new Set(entEsc.map(e => e.alert_id));
    const unescalatedCrit = criticalAlerts.filter(a => !escalatedIds.has(a.id));
    const unescalatedPct = criticalAlerts.length > 0 ? (unescalatedCrit.length / criticalAlerts.length) * 100 : 0;

    const evidenceQuality = Math.max(5, Math.round(100 - (fastClosePct * 0.5 + unescalatedPct * 0.5)));
    const executionGap = Math.max(0, Math.round(headlineSlaPct - evidenceQuality));

    let dimensionScores = {};
    if (entScore && entScore.dimension_scores_json) {
      try {
        dimensionScores = JSON.parse(entScore.dimension_scores_json);
      } catch (e) {
        dimensionScores = {};
      }
    }

    const compositeScore = (entScore && typeof entScore.score === 'number') ? entScore.score : (typeof ent.score === 'number' ? ent.score : (100 - (executionGap || 0)));

    return {
      id: ent.id,
      code: ent.code,
      name: ent.name,
      sectorCode,
      sectorName,
      compositeScore,
      riskLevel: entScore ? entScore.risk_level : (ent.risk_level || 'MEDIUM'),
      rank: entScore ? entScore.rank : 1,
      percentile: entScore ? entScore.percentile : 50,
      headlineSlaPct: Number(headlineSlaPct.toFixed(1)),
      evidenceQualityScore: evidenceQuality,
      executionGapSize: executionGap,
      fastClosePct: Number(fastClosePct.toFixed(1)),
      unescalatedCriticalPct: Number(unescalatedPct.toFixed(1)),
      alertCount: entAlerts.length,
      assetCount: entAssets.length,
      findingsCount: entFindings.length,
      dimensionScores: {
        Detection: dimensionScores.Detection || 50,
        Investigation: dimensionScores.Investigation || 50,
        Escalation: dimensionScores.Escalation || 50,
        IncidentResponse: dimensionScores.IncidentResponse || 50,
        SecOps: dimensionScores.SecOps || 50,
        Governance: dimensionScores.Governance || 50,
        Discipline: dimensionScores.Discipline || 50,
        Resilience: dimensionScores.Resilience || 50,
        ...dimensionScores
      },
      topFindings: entFindings.slice(0, 5).map(f => ({
        id: f.id,
        rule_key: f.rule_key,
        title: f.title,
        severity_score: f.severity_score,
        dimension_code: f.dimension_code
      }))
    };
  });

  // Calculate Deltas between entities (primary pair)
  const [e1, e2] = entityProfiles;
  const deltas = {
    scoreDiff: Number(((e1.compositeScore || 0) - (e2.compositeScore || 0)).toFixed(1)),
    slaDiff: Number(((e1.headlineSlaPct || 0) - (e2.headlineSlaPct || 0)).toFixed(1)),
    evidenceQualityDiff: (e1.evidenceQualityScore || 0) - (e2.evidenceQualityScore || 0),
    gapDiff: (e1.executionGapSize || 0) - (e2.executionGapSize || 0),
    fastCloseDiff: Number(((e1.fastClosePct || 0) - (e2.fastClosePct || 0)).toFixed(1)),
    unescalatedDiff: Number(((e1.unescalatedCriticalPct || 0) - (e2.unescalatedCriticalPct || 0)).toFixed(1)),
    findingsDiff: (e1.findingsCount || 0) - (e2.findingsCount || 0)
  };

  // Cryptographic audit verification hash for Section 65B statutory compliance
  const crypto = await import('crypto');
  const certificateHash = crypto.createHash('sha256')
    .update(`PEER_COMPARE:${matchedEntities.map(e => e.code).sort().join(':')}:${sectorCode}:${Date.now()}`)
    .digest('hex');

  res.json({
    data: {
      sectorCode,
      sectorName,
      entities: entityProfiles,
      deltas,
      certificateHash,
      evaluatedAt: new Date().toISOString()
    }
  });
}
