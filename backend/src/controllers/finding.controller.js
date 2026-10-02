import { db } from '../core/db/knex.js';

/**
 * Controller handling Supervisory Findings exploration and evidence drill-down.
 */

/**
 * 1. List findings with filtering & parsed metrics
 * GET /api/v1/findings
 */
export async function getFindings(req, res) {
  const { entity_id, kind, rule_key } = req.query;
  let query = db('findings')
    .join('entities', 'findings.entity_id', 'entities.id')
    .select('findings.*', 'entities.code as entity_code', 'entities.name as entity_name')
    .orderBy('severity_score', 'desc');

  if (entity_id) query = query.where('findings.entity_id', entity_id);
  if (kind) query = query.where('findings.kind', kind);
  if (rule_key) query = query.where('findings.rule_key', rule_key);

  const findings = await query;
  const formatted = findings.map(f => ({
    ...f,
    metrics: f.metrics_json ? JSON.parse(f.metrics_json) : {},
    thresholds: f.thresholds_json ? JSON.parse(f.thresholds_json) : {},
    peer_context: f.peer_context_json ? JSON.parse(f.peer_context_json) : {}
  }));

  res.json({ data: formatted });
}

/**
 * 2. Finding Detail with "Why Flagged" and Forensic Evidence Records
 * GET /api/v1/findings/:id
 */
export async function getFindingById(req, res) {
  const { id } = req.params;
  const finding = await db('findings').where('id', id).first();
  if (!finding) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Finding not found' } });
  }

  const entity = await db('entities').where('id', finding.entity_id).first();
  const rule = await db('rules').where('key', finding.rule_key).first();
  const evidence = await db('finding_evidence').where('finding_id', id);

  res.json({
    data: {
      ...finding,
      entity,
      rule: rule ? {
        ...rule,
        benign_explanations: rule.benign_explanations_json ? JSON.parse(rule.benign_explanations_json) : [],
        references: rule.references_json ? JSON.parse(rule.references_json) : []
      } : null,
      metrics: finding.metrics_json ? JSON.parse(finding.metrics_json) : {},
      thresholds: finding.thresholds_json ? JSON.parse(finding.thresholds_json) : {},
      peer_context: finding.peer_context_json ? JSON.parse(finding.peer_context_json) : {},
      evidence: evidence.map(e => ({
        ...e,
        raw_record: e.raw_record_json ? JSON.parse(e.raw_record_json) : null
      }))
    }
  });
}
