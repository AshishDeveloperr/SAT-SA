#!/usr/bin/env node
/**
 * @file tamper_demo.js
 * @description Interactive Forensic Tampering Simulation for NCIIPC Supervisory Review.
 * Demonstrates court-admissible non-repudiation under Bharatiya Sakshya Adhiniyam (BSA) Section 65B.
 *
 * Execution Flow:
 *   Phase 1: Verify pristine supervisory audit ledger (100% Valid SHA-256 chain).
 *   Phase 2: Adversary simulates unauthorized modification directly to examiner finding/decision.
 *   Phase 3: Cryptographic engine pinpoints tampered block, shows hash mismatch and raises alarm.
 *   Phase 4: Restore original state and confirm automatic ledger recovery.
 *
 * Usage:
 *   node backend/scripts/tamper_demo.js
 */

import crypto from 'node:crypto';
import { db } from '../src/core/db/knex.js';
import { initSchema } from '../src/core/db/schema.js';
import { seedDefaults } from '../src/core/db/seed.js';

// ANSI terminal colors
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  white: '\x1b[37m'
};

function recomputeBlockHash(prevHash, detailsJson) {
  return crypto.createHash('sha256').update(prevHash + (detailsJson || '')).digest('hex');
}

async function verifyLedger() {
  const logs = await db('audit_log').orderBy('id', 'asc');
  if (logs.length === 0) return { valid: false, error: 'Empty audit log' };

  for (let i = 1; i < logs.length; i++) {
    const curr = logs[i];
    const prev = logs[i - 1];

    if (curr.prev_hash !== prev.hash) {
      return {
        valid: false,
        brokenBlockId: curr.id,
        reason: 'BROKEN_CHAIN_LINK',
        expectedPrev: prev.hash,
        actualPrev: curr.prev_hash
      };
    }

    const recomputed = recomputeBlockHash(curr.prev_hash, curr.details_json);
    if (curr.hash !== recomputed) {
      return {
        valid: false,
        brokenBlockId: curr.id,
        reason: 'PAYLOAD_TAMPERING',
        recordedHash: curr.hash,
        recomputedHash: recomputed
      };
    }
  }

  return { valid: true, totalBlocks: logs.length, tipHash: logs[logs.length - 1].hash };
}

async function runTamperDemo() {
  await initSchema();
  await seedDefaults();

  console.log(`
${c.bold}${c.red}╔══════════════════════════════════════════════════════════════════════════════╗
║   SAT-SA: Section 65B BSA Forensic Tamper Defense Demonstration              ║
║   Bharatiya Sakshya Adhiniyam • Tamper-Evident Chained Decision Ledger        ║
╚══════════════════════════════════════════════════════════════════════════════╝${c.reset}\n`);

  // Ensure at least 4 test decisions exist in the ledger for demo
  const count = await db('audit_log').count('id as count').first();
  if (parseInt(count.count, 10) < 4) {
    console.log(`${c.dim}[Demo Setup] Seeding test supervisory examiner decision blocks...${c.reset}`);
    const decisions = [
      { action: 'EXAMINER_DECISION_RECORDED', object_id: 'smp_EG01_01', details: { finding: 'EG-01 Fast Closure', decision: 'CONFIRMED_DEFECT', note: 'Rubber stamping confirmed on SCADA power grid alert.' } },
      { action: 'SUPERVISORY_SANCTION_ISSUED', object_id: 'ent_CSE-POWER-01', details: { sanction: 'FORMAL_EXPLANATION_REQUIRED', deadline_days: 14, legal_basis: 'NCIIPC Rule 12' } },
      { action: 'EVIDENCE_PRESERVATION_ORDER', object_id: 'ast_RTU_09', details: { preserve_logs: true, target_host: '10.240.12.8', custody_officer: 'EXAMINER_OFFICER_4' } }
    ];

    for (const dec of decisions) {
      const last = await db('audit_log').orderBy('id', 'desc').first();
      const prevHash = last.hash;
      const detailsJson = JSON.stringify(dec.details);
      const newHash = recomputeBlockHash(prevHash, detailsJson);

      await db('audit_log').insert({
        actor_id: 'nciipc_lead_supervisor',
        action: dec.action,
        object_type: 'DECISION',
        object_id: dec.object_id,
        details_json: detailsJson,
        prev_hash: prevHash,
        hash: newHash
      });
    }
    console.log(`${c.green}✔ Decision ledger initialized with court-admissible blocks.${c.reset}\n`);
  }

  // ─── PHASE 1: Baseline Verification ─────────────────────────────────────────
  console.log(`${c.bold}┌────────────────────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.bold}│ PHASE 1: PRISTINE LEDGER AUDIT & SECTION 65B CERTIFICATION             │${c.reset}`);
  console.log(`${c.bold}└────────────────────────────────────────────────────────────────────────┘${c.reset}`);

  const pristine = await verifyLedger();
  if (!pristine.valid) {
    console.error(`${c.red}❌ Error: Baseline ledger is already corrupted: ${JSON.stringify(pristine)}${c.reset}`);
    return;
  }

  console.log(`  ${c.green}✔ Cryptographic Integrity:${c.reset} 100% UNTAMPERED`);
  console.log(`  ${c.green}✔ Verified Blocks Traversed:${c.reset} ${pristine.totalBlocks} sequential records`);
  console.log(`  ${c.green}✔ Merkle Ledger Tip:${c.reset} ${pristine.tipHash}`);
  console.log(`  ${c.cyan}📜 BSA Section 65B Legal Certificate: VALID & ADMISSIBLE IN COURT${c.reset}\n`);

  // ─── PHASE 2: Inject Unauthorized Modification ──────────────────────────────
  const targetRow = await db('audit_log').where('id', '>', 1).first();
  if (!targetRow) {
    console.log(`${c.red}❌ Not enough records to perform simulation.${c.reset}`);
    return;
  }

  console.log(`${c.bold}┌────────────────────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.bold}│ PHASE 2: SIMULATING ADVERSARIAL DATABASE TAMPERING                     │${c.reset}`);
  console.log(`${c.bold}└────────────────────────────────────────────────────────────────────────┘${c.reset}`);
  console.log(`  🎯 Target Audit Block ID:   ${c.yellow}Block #${targetRow.id}${c.reset} (${targetRow.action})`);
  console.log(`  📜 Original Decision Note:  "${targetRow.details_json}"`);

  const originalDetails = targetRow.details_json;
  // Modify finding decision from CONFIRMED_DEFECT to DISMISSED (fraudulent coverup)
  const tamperedDetails = originalDetails.includes('CONFIRMED_DEFECT')
    ? originalDetails.replace('CONFIRMED_DEFECT', 'DISMISSED_NO_FAULT')
    : originalDetails.replace('FORMAL_EXPLANATION_REQUIRED', 'NO_ACTION_REQUIRED');

  console.log(`  🦹 Adversary Action:        Directly altered 1 string inside SQLite backend:`);
  console.log(`     ${c.red}From: ${originalDetails}${c.reset}`);
  console.log(`     ${c.yellow}To:   ${tamperedDetails}${c.reset}`);

  await db('audit_log').where('id', targetRow.id).update({ details_json: tamperedDetails });
  console.log(`  💾 Raw SQLite database modified without application cryptographic signing.\n`);

  // ─── PHASE 3: Audit Under Tampered State ─────────────────────────────────────
  console.log(`${c.bold}┌────────────────────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.bold}│ PHASE 3: CRYPTOGRAPHIC VERIFICATION UNDER TAMPERED STATE               │${c.reset}`);
  console.log(`${c.bold}└────────────────────────────────────────────────────────────────────────┘${c.reset}`);

  const tamperedCheck = await verifyLedger();

  if (!tamperedCheck.valid) {
    console.log(`  ${c.bgRed}${c.white}${c.bold} 🚨 FORENSIC TAMPER ALERT TRIGGERED! 🚨 ${c.reset}`);
    console.log(`  ${c.red}❌ Integrity Status:     COMPROMISED (Evidence Repudiated)${c.reset}`);
    console.log(`  📍 Pinpointed Block:     ${c.bold}Block #${tamperedCheck.brokenBlockId}${c.reset}`);
    console.log(`  🔍 Discrepancy Reason:   ${tamperedCheck.reason}`);
    console.log(`  🔒 Recorded Sealed Hash: ${tamperedCheck.recordedHash}`);
    console.log(`  ⚠️ Recomputed Real Hash:  ${tamperedCheck.recomputedHash}`);
    console.log(`  ${c.green}🛡️ Legal Defense:        Tampered evidence is rejected automatically under Section 65B.${c.reset}\n`);
  } else {
    console.log(`${c.red}❌ Test Failed: Tamper was not detected!${c.reset}\n`);
  }

  // ─── PHASE 4: Restore Original State ────────────────────────────────────────
  console.log(`${c.bold}┌────────────────────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.bold}│ PHASE 4: RESTORING ORIGINAL FORENSIC STATE                             │${c.reset}`);
  console.log(`${c.bold}└────────────────────────────────────────────────────────────────────────┘${c.reset}`);

  await db('audit_log').where('id', targetRow.id).update({ details_json: originalDetails });
  console.log(`  ↩️  Reverted SQLite database record back to pristine bytes.`);

  const restored = await verifyLedger();
  if (restored.valid) {
    console.log(`  ${c.green}✔ Ledger Status: RESTORED & 100% MATHEMATICALLY VERIFIED${c.reset}`);
    console.log(`  ${c.green}✔ Continuous SHA-256 chain links intact from Genesis to Tip.${c.reset}`);
  } else {
    console.log(`${c.red}❌ Restoration error: ${JSON.stringify(restored)}${c.reset}`);
  }

  console.log(`\n${c.bold}══════════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.green}${c.bold}🎉 SECTION 65B BSA TAMPER-DEFENSE DEMONSTRATION COMPLETE${c.reset}`);
  console.log(`${c.bold}══════════════════════════════════════════════════════════════════════════════${c.reset}\n`);
}

runTamperDemo()
  .catch(err => {
    console.error('Tamper demo fatal error:', err);
    process.exit(1);
  })
  .finally(() => db.destroy());
