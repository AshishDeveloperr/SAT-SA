import crypto from 'node:crypto';
import { db } from '../core/db/knex.js';

/**
 * Controller handling Supervisory Review Queue (Prioritized Sampling)
 * and cryptographic audit receipt generation for examiner decisions.
 */

/**
 * 1. Prioritized Review Queue
 * GET /api/v1/review-samples
 */
export async function getReviewSamples(req, res) {
  const samples = await db('review_samples')
    .join('entities', 'review_samples.entity_id', 'entities.id')
    .select('review_samples.*', 'entities.code as entity_code', 'entities.name as entity_name')
    .orderBy('priority_score', 'desc');

  const alerts = await db('alerts');

  const formatted = samples.map(s => {
    const alert = alerts.find(a => a.id === s.record_id);
    return {
      ...s,
      reasons: s.reasons_json ? JSON.parse(s.reasons_json) : [],
      alertDetails: alert || null
    };
  });

  res.json({ data: formatted });
}

/**
 * 2. Record Supervisory Examiner Decision with SHA-256 Merkle Chain Logging
 * POST /api/v1/review-samples/:id/decision
 */
export async function recordReviewDecision(req, res) {
  const { id } = req.params;
  const { decision, comment } = req.body;

  await db('review_samples').where('id', id).update({
    reviewed: true,
    examiner_decision: decision,
    examiner_comment: comment,
    decided_at: new Date()
  });

  // Record in hash-chained audit log
  const lastLog = await db('audit_log').orderBy('id', 'desc').first();
  const prevHash = lastLog ? lastLog.hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const entryData = JSON.stringify({ sample_id: id, decision, comment, ts: Date.now() });
  const newHash = crypto.createHash('sha256').update(prevHash + entryData).digest('hex');

  await db('audit_log').insert({
    actor_id: 'examiner_supervisor',
    action: 'EXAMINER_DECISION_RECORDED',
    object_type: 'REVIEW_SAMPLE',
    object_id: id,
    details_json: entryData,
    prev_hash: prevHash,
    hash: newHash
  });

  res.json({
    data: {
      status: 'recorded',
      sampleId: id,
      decision,
      auditHash: newHash
    }
  });
}
