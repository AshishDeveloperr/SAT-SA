import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../storage/satsa.db');
const samplesDir = path.resolve(__dirname, '../../samples/CSE-TELCO-01');

const assetsFile = path.join(samplesDir, 'assets.csv');
const casesFile = path.join(samplesDir, 'cases.csv');
const alertsFile = path.join(samplesDir, 'alerts.csv');

console.log('========================================================================');
console.log('  SAT-SA: Purging Old Hardcoded Data & Injecting Real Telecom Dataset  ');
console.log('========================================================================');
console.log('Database Path:', dbPath);
console.log('Assets File:  ', assetsFile);
console.log('Cases File:   ', casesFile);
console.log('Alerts File:  ', alertsFile);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF'); // Disable during bulk purge & insert

// 1. Purge all existing operational & analytical data
console.log('\n[1/6] Purging old hardcoded data across all tables...');
const tablesToPurge = [
  'finding_evidence',
  'findings',
  'review_samples',
  'entity_scores',
  'investigation_steps',
  'escalations',
  'alerts',
  'cases',
  'assets',
  'entities',
  'analysis_runs',
  'import_batches'
];

for (const tbl of tablesToPurge) {
  const result = db.prepare(`DELETE FROM ${tbl}`).run();
  console.log(`  - Purged ${tbl}: ${result.changes} rows deleted`);
}

// 2. Ensure Telecom Sector exists
const sec = db.prepare("SELECT id FROM sectors WHERE code = 'TELECOM'").get();
let sectorId = sec ? sec.id : 'sec_telecom';
if (!sec) {
  db.prepare("INSERT INTO sectors (id, code, name) VALUES (?, ?, ?)").run(
    'sec_telecom',
    'TELECOM',
    'Telecommunications & Satcom'
  );
  console.log('  + Created Sector: Telecommunications & Satcom');
}

// 3. Insert Monitored Telecom Entity
const entityId = 'cse_telco_01';
const entityCode = 'CSE-TELCO-01';
const entityName = 'National Backbone Telecommunications & 5G';

db.prepare(`
  INSERT INTO entities (id, code, name, sector_id, size_tier, region, metadata_json, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  entityId,
  entityCode,
  entityName,
  sectorId,
  'TIER_1',
  'National Carrier Core',
  JSON.stringify({
    operator_type: 'Tier-1 MNO & 5G Core Provider',
    circles: 8,
    carrier_nodes: 160,
    compliance_frameworks: ['3GPP TS 33.501', 'GSMA FS.11', 'GSMA FS.19', 'RFC 6811 BGP ROV', 'RFC 7908']
  }),
  1
);
console.log(`\n[2/6] Registered Monitored Entity: ${entityCode} (${entityName})`);

// 4. Ingest 160 Carrier-Grade Assets
console.log('\n[3/6] Ingesting Carrier Assets from assets.csv...');
const assetLines = fs.readFileSync(assetsFile, 'utf-8').split(/\r?\n/).filter(l => l.trim().length > 0);
const assetHeader = assetLines[0].split(',');
const assetInsert = db.prepare(`
  INSERT INTO assets (id, entity_id, external_id, name, type, criticality, environment, first_seen, last_seen)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Specific assets to make silent (>14 days) to demonstrate NS-01 detection
const SILENT_TARGETS = {
  'SIGTRAN-STP-KOL-02': 24, // 24 days silent
  'NG-RAN-CSR-AMD-02': 19, // 19 days silent
  'ROADM-DWDM-PNE-01': 28, // 28 days silent
  'IMS-SBC-HYD-02': 16     // 16 days silent
};

const DAY_MS = 86400000;
const now = Date.now();
let assetsInserted = 0;
let silentCreated = 0;

const insertAssetsTx = db.transaction(() => {
  for (let i = 1; i < assetLines.length; i++) {
    const cols = assetLines[i].split(',');
    if (cols.length < 8) continue;

    const assetId = cols[0].trim();
    const name = cols[1].trim();
    const type = cols[2].trim();
    const crit = parseInt(cols[3].trim() || '4', 10);
    const env = cols[4].trim() || 'PRODUCTION_CARRIER';

    let lastSeen;
    if (SILENT_TARGETS[assetId]) {
      lastSeen = new Date(now - SILENT_TARGETS[assetId] * DAY_MS).toISOString();
      silentCreated++;
    } else {
      lastSeen = new Date(now - Math.floor(Math.random() * 3600000 * 4)).toISOString();
    }

    const firstSeen = new Date(now - 90 * DAY_MS).toISOString();

    assetInsert.run(
      assetId,
      entityId,
      assetId,
      name,
      type,
      crit,
      env,
      firstSeen,
      lastSeen
    );
    assetsInserted++;
  }
});
insertAssetsTx();
console.log(`  + Inserted ${assetsInserted} carrier infrastructure assets (${silentCreated} configured as Silent Critical Assets for NS-01).`);

// SimHash 64-bit implementation
function computeSimHash(text) {
  if (!text || text.trim().length === 0) return '0000000000000000';
  const tokens = text.toLowerCase().match(/\w+/g) || [];
  const v = new Array(64).fill(0);

  for (const token of tokens) {
    const hash = crypto.createHash('md5').update(token).digest();
    for (let i = 0; i < 64; i++) {
      const byteIdx = Math.floor(i / 8);
      const bitIdx = i % 8;
      const bit = (hash[byteIdx] >> bitIdx) & 1;
      v[i] += bit ? 1 : -1;
    }
  }

  let fingerprint = 0n;
  for (let i = 0; i < 64; i++) {
    if (v[i] > 0) {
      fingerprint |= 1n << BigInt(i);
    }
  }
  return fingerprint.toString(16).padStart(16, '0');
}

// 5. Ingest Cases, Escalations, and Investigation Steps
console.log('\n[4/6] Ingesting Telecom Cases, Escalations & Forensic Steps from cases.csv...');
const caseInsert = db.prepare(`
  INSERT INTO cases (id, entity_id, external_id, opened_at, closed_at, status, severity, resolution, root_cause_recorded, reopened_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const escInsert = db.prepare(`
  INSERT INTO escalations (id, entity_id, case_id, alert_id, from_level, to_level, escalated_at, acknowledged_at, outcome)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const stepInsert = db.prepare(`
  INSERT INTO investigation_steps (id, case_id, alert_id, entity_id, actor_hash, step_type, started_at, ended_at, note_len, note_simhash, note_text)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Read all cases from cases.csv
const caseStream = fs.createReadStream(casesFile);
const rlCases = readline.createInterface({ input: caseStream, crlfDelay: Infinity });

let caseCount = 0;
let escCount = 0;
let stepCount = 0;
let caseBatch = [];

for await (const line of rlCases) {
  if (caseCount === 0 && line.startsWith('case_id')) {
    caseCount++;
    continue;
  }
  if (!line.trim()) continue;

  const parts = line.split(',');
  if (parts.length < 9) continue;

  const caseId = parts[0].trim();
  const alertId = parts[1].trim();
  const severity = parts[2].trim();
  const status = parts[3].trim() || 'CLOSED';
  const openedAt = parts[4].trim();
  const closedAt = parts[5].trim();
  const assignee = parts[6].trim();
  const escLevel = parts[7].trim();
  const rootCause = parts[8].trim();
  const notes = parts.slice(9).join(',').replace(/^"|"$/g, '').trim();

  caseBatch.push({
    caseId, alertId, severity, status, openedAt, closedAt, assignee, escLevel, rootCause, notes
  });
  caseCount++;

  if (caseBatch.length >= 5000) {
    const insertCaseBatchTx = db.transaction((batch) => {
      for (const item of batch) {
        caseInsert.run(
          item.caseId,
          entityId,
          item.caseId,
          item.openedAt,
          item.closedAt,
          item.status,
          item.severity,
          'RESOLVED',
          item.rootCause ? 1 : 0,
          0
        );

        if (item.escLevel && item.escLevel !== 'NONE') {
          escInsert.run(
            `esc_${item.caseId}`,
            entityId,
            item.caseId,
            item.alertId,
            'L1_OPERATOR',
            item.escLevel,
            item.openedAt,
            item.closedAt,
            'RESOLVED'
          );
          escCount++;
        }

        if (item.notes) {
          stepInsert.run(
            `stp_${item.caseId}`,
            item.caseId,
            item.alertId,
            entityId,
            crypto.createHash('sha256').update(item.assignee || 'anon').digest('hex').slice(0, 16),
            'TRIAGE_FORENSIC',
            item.openedAt,
            item.closedAt,
            item.notes.length,
            computeSimHash(item.notes),
            item.notes
          );
          stepCount++;
        }
      }
    });
    insertCaseBatchTx(caseBatch);
    caseBatch = [];
    if (caseCount % 50000 === 0) {
      console.log(`  ... Ingested ${caseCount} cases`);
    }
  }
}

if (caseBatch.length > 0) {
  const insertCaseBatchTx = db.transaction((batch) => {
    for (const item of batch) {
      caseInsert.run(
        item.caseId,
        entityId,
        item.caseId,
        item.openedAt,
        item.closedAt,
        item.status,
        item.severity,
        'RESOLVED',
        item.rootCause ? 1 : 0,
        0
      );
      if (item.escLevel && item.escLevel !== 'NONE') {
        escInsert.run(
          `esc_${item.caseId}`,
          entityId,
          item.caseId,
          item.alertId,
          'L1_OPERATOR',
          item.escLevel,
          item.openedAt,
          item.closedAt,
          'RESOLVED'
        );
        escCount++;
      }
      if (item.notes) {
        stepInsert.run(
          `stp_${item.caseId}`,
          item.caseId,
          item.alertId,
          entityId,
          crypto.createHash('sha256').update(item.assignee || 'anon').digest('hex').slice(0, 16),
          'TRIAGE_FORENSIC',
          item.openedAt,
          item.closedAt,
          item.notes.length,
          computeSimHash(item.notes),
          item.notes
        );
        stepCount++;
      }
    }
  });
  insertCaseBatchTx(caseBatch);
}
console.log(`  + Ingested ${caseCount - 1} cases, ${escCount} carrier escalations, and ${stepCount} investigation steps.`);

// 6. Ingest Alerts from alerts.csv
console.log('\n[5/6] Ingesting Telecom Alerts from alerts.csv...');
const alertInsert = db.prepare(`
  INSERT INTO alerts (id, entity_id, batch_id, external_id, asset_id, category, severity, source_tool, rule_name, created_at, acknowledged_at, closed_at, disposition, closure_reason, assignee_hash, case_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const alertStream = fs.createReadStream(alertsFile);
const rlAlerts = readline.createInterface({ input: alertStream, crlfDelay: Infinity });

let alertCount = 0;
let alertBatch = [];

for await (const line of rlAlerts) {
  if (alertCount === 0 && line.startsWith('alert_id')) {
    alertCount++;
    continue;
  }
  if (!line.trim()) continue;

  const parts = line.split(',');
  if (parts.length < 8) continue;

  const alertId = parts[0].trim();
  const category = parts[1].trim();
  const severity = parts[2].trim();
  const createdAt = parts[3].trim();
  const closedAt = parts[4].trim();
  const disposition = parts[5].trim();
  const assignee = parts[6].trim();
  const assetId = parts[7].trim();

  // Acknowledged timestamp is 1-2 mins after created
  const ackAt = new Date(new Date(createdAt).getTime() + 90000).toISOString();

  alertBatch.push({
    alertId,
    category,
    severity,
    createdAt,
    ackAt,
    closedAt,
    disposition,
    assignee,
    assetId
  });
  alertCount++;

  if (alertBatch.length >= 10000) {
    const insertAlertBatchTx = db.transaction((batch) => {
      for (const a of batch) {
        alertInsert.run(
          a.alertId,
          entityId,
          'batch_TELCO_2026_Q3',
          a.alertId,
          a.assetId,
          a.category,
          a.severity,
          'CARRIER-SIEM-EDR',
          `RULE-${a.category.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
          a.createdAt,
          a.ackAt,
          a.closedAt,
          a.disposition,
          'Carrier SOC Operation Closure',
          crypto.createHash('sha256').update(a.assignee || 'anon').digest('hex').slice(0, 16),
          null
        );
      }
    });
    insertAlertBatchTx(alertBatch);
    alertBatch = [];
    if (alertCount % 100000 === 0) {
      console.log(`  ... Ingested ${alertCount} alerts`);
    }
  }
}

if (alertBatch.length > 0) {
  const insertAlertBatchTx = db.transaction((batch) => {
    for (const a of batch) {
      alertInsert.run(
        a.alertId,
        entityId,
        'batch_TELCO_2026_Q3',
        a.alertId,
        a.assetId,
        a.category,
        a.severity,
        'CARRIER-SIEM-EDR',
        `RULE-${a.category.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
        a.createdAt,
        a.ackAt,
        a.closedAt,
        a.disposition,
        'Carrier SOC Operation Closure',
        crypto.createHash('sha256').update(a.assignee || 'anon').digest('hex').slice(0, 16),
        null
      );
    }
  });
  insertAlertBatchTx(alertBatch);
}
console.log(`  + Total Alerts Ingested: ${alertCount - 1} records into SQLite database.`);

db.pragma('foreign_keys = ON');

console.log('\n[6/6] Executing Supervisory Analytics Pipeline on Telecom Telemetry...');
db.close();

// Now launch engine via Node process to populate findings, entity scores & review queue
import('../src/modules/analytics/engine.js').then(async ({ runSupervisoryAnalysis }) => {
  try {
    const result = await runSupervisoryAnalysis('telecom_ingest_verification');
    console.log('\n========================================================================');
    console.log('  SUCCESS: Telecom Dataset Ingestion & Supervisory Analytics Complete   ');
    console.log('========================================================================');
    console.log('Run ID:              ', result.runId);
    console.log('Findings Discovered: ', result.findingsCount);
    console.log('Entities Evaluated:  ', result.entitiesEvaluated);
    process.exit(0);
  } catch (err) {
    console.error('Supervisory Analysis Error:', err);
    process.exit(1);
  }
});
