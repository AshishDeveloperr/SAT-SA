import { db } from '../core/db/knex.js';

/**
 * Controller handling Cryptographic Audit Ledger & Tamper Verification.
 */

/**
 * 1. Hash-Chained Audit Log & Tamper Verification
 * GET /api/v1/audit-log
 */
export async function getAuditLog(req, res) {
  const logs = await db('audit_log').orderBy('id', 'asc');
  
  // Verify hash chain
  let isChainValid = true;
  for (let i = 1; i < logs.length; i++) {
    if (logs[i].prev_hash !== logs[i - 1].hash) {
      isChainValid = false;
      break;
    }
  }

  res.json({
    data: {
      isChainValid,
      totalEntries: logs.length,
      logs: logs.reverse().slice(0, 50)
    }
  });
}
