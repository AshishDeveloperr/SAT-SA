import crypto from 'node:crypto';
import { db } from '../core/db/knex.js';

/**
 * Controller handling Statutory Supervisory Sanctions & Legal Directives
 * under NCIIPC Rule 12 and Section 70B of the Information Technology Act.
 */

/**
 * 1. Issue Statutory Directive / Sanction to CSE Leadership
 * POST /api/v1/entities/:id/sanction
 */
export async function issueSanction(req, res) {
  const { id } = req.params;
  const {
    sanctionType = 'ISSUE_RULE_12_EXPLANATION_NOTICE',
    legalBasis = 'Section 70B Information Technology Act / NCIIPC Rule 12',
    deadlineDays = 14,
    notes = 'Formal written explanation required for persistent execution gap.'
  } = req.body;

  const entity = await db('entities').where('id', id).orWhere('code', id).first();
  if (!entity) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Entity not found' } });
  }

  const sanctionId = `snc_${Date.now()}`;
  const entryData = JSON.stringify({
    sanctionId,
    entityId: entity.id,
    entityCode: entity.code,
    sanctionType,
    legalBasis,
    deadlineDays,
    deadlineDate: new Date(Date.now() + deadlineDays * 86400000).toISOString(),
    notes,
    issuedAt: new Date().toISOString()
  });

  // Hash chain into cryptographic audit log
  const lastLog = await db('audit_log').orderBy('id', 'desc').first();
  const prevHash = lastLog ? lastLog.hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const newHash = crypto.createHash('sha256').update(prevHash + entryData).digest('hex');

  await db('audit_log').insert({
    actor_id: 'supervisory_officer_nciipc',
    action: 'SUPERVISORY_SANCTION_ISSUED',
    object_type: 'ENTITY',
    object_id: entity.id,
    details_json: entryData,
    prev_hash: prevHash,
    hash: newHash
  });

  res.json({
    data: {
      status: 'SUCCESS',
      sanctionId,
      entityCode: entity.code,
      sanctionType,
      legalBasis,
      deadlineDays,
      auditHash: newHash,
      message: `Statutory directive successfully issued to ${entity.name}. Document recorded in cryptographic ledger.`
    }
  });
}
