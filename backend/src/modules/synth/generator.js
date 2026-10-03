import crypto from 'node:crypto';
import { db } from '../../core/db/knex.js';

/**
 * SimHash 64-bit implementation for lexical duplicate detection
 * @param {string} text 
 * @returns {string} hex string representation of 64-bit fingerprint
 */
export function computeSimHash(text) {
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

/**
 * Generates synthetic CSE data driven by latent operational maturity profiles.
 */
export async function generateSyntheticData() {
  console.log('[SAT-SA Synth] Generating latent-maturity synthetic CSE population...');

  // 1. Define 5 Representative Entities with latent maturity
  const entitiesConfig = [
    {
      id: 'cse_power_01',
      code: 'CSE-POWER-01',
      name: 'Northern Regional Power Grid Transmission',
      sector_id: 'sec_energy',
      size_tier: 'TIER_1',
      region: 'North',
      maturity: 0.25, // LOW: High metric gaming, silent SCADA, rubber-stamped closures
      description: 'Critical National Grid SCADA operator with prominent operational execution gaps.'
    },
    {
      id: 'cse_bank_01',
      code: 'CSE-BANK-01',
      name: 'Apex National Commercial & Settlement Bank',
      sector_id: 'sec_bfsi',
      size_tier: 'TIER_1',
      region: 'West',
      maturity: 0.92, // HIGH: Strong discipline, proper investigation & escalation
      description: 'Apex banking entity operating a high-discipline 24x7 SOC with rigorous forensics.'
    },
    {
      id: 'cse_telco_01',
      code: 'CSE-TELCO-01',
      name: 'National Backbone Telecommunications & 5G',
      sector_id: 'sec_telecom',
      size_tier: 'TIER_1',
      region: 'Central',
      maturity: 0.58, // MEDIUM: Heavy use of templated responses and SLA bunching
      description: 'Telecom provider exhibiting repetitive scripted closures and playbook copy-pasting.'
    },
    {
      id: 'cse_defense_01',
      code: 'CSE-DEFENSE-01',
      name: 'Strategic Avionics & Defense Manufacturing Hub',
      sector_id: 'sec_defense',
      size_tier: 'TIER_2',
      region: 'South',
      maturity: 0.88, // HIGH DISCIPLINE: Strict escalation, low volume
      description: 'High-security defense enclave with zero un-escalated critical incidents.'
    },
    {
      id: 'cse_health_01',
      code: 'CSE-HEALTH-01',
      name: 'National Telehealth & Health Registry Exchange',
      sector_id: 'sec_health',
      size_tier: 'TIER_2',
      region: 'East',
      maturity: 0.42, // LOW-MEDIUM: Overstretched analysts, slow response, missing cases
      description: 'Healthcare data exchange experiencing alert fatigue and missing investigation files.'
    }
  ];

  // Insert Entities
  for (const ent of entitiesConfig) {
    const existing = await db('entities').where('id', ent.id).orWhere('code', ent.code).first();
    if (!existing) {
      await db('entities').insert({
        id: ent.id,
        code: ent.code,
        name: ent.name,
        sector_id: ent.sector_id,
        size_tier: ent.size_tier,
        region: ent.region,
        metadata_json: JSON.stringify({ maturity: ent.maturity, description: ent.description })
      });
    }
  }

  // 2. Clear old operational data before populating
  await db('finding_evidence').del();
  await db('findings').del();
  await db('review_samples').del();
  await db('entity_scores').del();
  await db('investigation_steps').del();
  await db('escalations').del();
  await db('alerts').del();
  await db('cases').del();
  await db('assets').del();

  const now = Date.now();
  const DAY_MS = 86400000;

  const categories = [
    'Malware Execution',
    'Credential Dumping',
    'Lateral Movement',
    'Privilege Escalation',
    'Data Exfiltration',
    'Ransomware Activity',
    'Unauthorized Remote Access',
    'DDoS Surge'
  ];

  const templateNotes = [
    'Reviewed alert telemetry. IP address checked against external threat list. No immediate IOC matched. Marked benign and closed per standard playbook procedure.',
    'Reviewed alert telemetry. IP address checked against external threat list. No immediate IOC matched. Marked benign and closed per standard playbook procedure.',
    'System health normal. Traffic deemed benign routine backup traffic. Resolving alert without further action required.'
  ];

  for (const ent of entitiesConfig) {
    // Generate 12-15 assets per entity
    const assets = [];
    const isPowerOutlier = ent.code === 'CSE-POWER-01';

    for (let i = 1; i <= 12; i++) {
      const isCritical = i <= 4;
      const assetType = isPowerOutlier && isCritical ? 'SCADA_CONTROLLER' : (isCritical ? 'ACTIVE_DIRECTORY' : 'EDGE_ROUTER');
      const criticality = isCritical ? 5 : 2;

      // In CSE-POWER-01, SCADA assets AST-01..04 have had zero telemetry for 42 days (Silent Critical Asset NS-01)
      const lastSeenDaysAgo = isPowerOutlier && isCritical ? 42 : Math.floor(Math.random() * 2);

      const asset = {
        id: `ast_${ent.code}_${i}`,
        entity_id: ent.id,
        external_id: `AST-${ent.code.replace('CSE-', '')}-${String(i).padStart(2, '0')}`,
        name: `${ent.code} ${assetType.replace('_', ' ')} ${i}`,
        type: assetType,
        criticality: criticality,
        environment: 'PRODUCTION',
        first_seen: new Date(now - 90 * DAY_MS),
        last_seen: new Date(now - lastSeenDaysAgo * DAY_MS)
      };
      assets.push(asset);
    }
    await db('assets').insert(assets);

    // Generate alerts over the last 30 days
    const alertCount = ent.maturity > 0.8 ? 160 : 220;
    const alertsToInsert = [];
    const casesToInsert = [];
    const stepsToInsert = [];
    const escalationsToInsert = [];

    for (let a = 1; a <= alertCount; a++) {
      const alertDaysAgo = Math.random() * 30;
      const createdAt = new Date(now - alertDaysAgo * DAY_MS);
      const isCriticalAlert = Math.random() < 0.22;
      const severity = isCriticalAlert ? 'CRITICAL' : (Math.random() < 0.4 ? 'HIGH' : 'MEDIUM');

      // Asset selection
      let asset = assets[Math.floor(Math.random() * assets.length)];
      // If power outlier, NEVER select the 4 silent SCADA assets for alerts!
      if (isPowerOutlier && asset.criticality === 5) {
        asset = assets[4 + Math.floor(Math.random() * (assets.length - 4))];
      }

      // Category selection (If power outlier, never alert on Ransomware or Credential Dumping - NS-02 missing categories!)
      let category = categories[Math.floor(Math.random() * categories.length)];
      if (isPowerOutlier && (category === 'Ransomware Activity' || category === 'Credential Dumping')) {
        category = 'Malware Execution';
      }

      // Duration: if low maturity (CSE-POWER-01), 82% of critical alerts closed in < 5 mins (EG-01)
      let durationMinutes = 45;
      if (ent.maturity < 0.35 && isCriticalAlert) {
        durationMinutes = 2 + Math.floor(Math.random() * 6); // 2 to 8 mins!
      } else if (ent.maturity > 0.8) {
        durationMinutes = 35 + Math.floor(Math.random() * 80);
      } else {
        durationMinutes = 15 + Math.floor(Math.random() * 50);
      }

      const ackAt = new Date(createdAt.getTime() + 60000 * Math.min(2, durationMinutes * 0.1));
      const closedAt = new Date(createdAt.getTime() + 60000 * durationMinutes);

      const alertId = `alt_${ent.code}_${a}`;
      const caseId = (isCriticalAlert && (ent.maturity > 0.4 || Math.random() < 0.5)) ? `case_${ent.code}_${a}` : null;

      alertsToInsert.push({
        id: alertId,
        entity_id: ent.id,
        batch_id: `batch_${ent.code}_2026_Q3`,
        external_id: `ALT-${ent.code.replace('CSE-', '')}-${1000 + a}`,
        asset_id: asset.id,
        category: category,
        severity: severity,
        source_tool: 'SIEM-EDR',
        rule_name: `CORR-RULE-${category.toUpperCase().replace(/\s+/g, '-')}`,
        created_at: createdAt,
        acknowledged_at: ackAt,
        closed_at: closedAt,
        disposition: Math.random() < 0.85 ? 'false_positive' : 'true_positive',
        closure_reason: 'Closed by operational analyst',
        assignee_hash: `ANALYST_${ent.code}_${1 + (a % 5)}`,
        case_id: caseId
      });

      // Cases & Steps
      if (caseId) {
        casesToInsert.push({
          id: caseId,
          entity_id: ent.id,
          external_id: `CAS-${ent.code.replace('CSE-', '')}-${2000 + a}`,
          opened_at: ackAt,
          closed_at: closedAt,
          status: 'CLOSED',
          severity: severity,
          resolution: 'RESOLVED',
          root_cause_recorded: ent.maturity > 0.7,
          reopened_count: 0
        });

        // If low maturity (CSE-POWER-01), 75% have ZERO investigation steps (EG-03)
        const hasSteps = ent.maturity > 0.5 || Math.random() < 0.25;
        if (hasSteps) {
          const isTemplate = ent.maturity < 0.65;
          const noteText = isTemplate 
            ? templateNotes[0]
            : `Detailed forensic triage conducted on ${asset.name}. Process memory dumped and analyzed. Hash verification completed against local threat intelligence repository.`;

          stepsToInsert.push({
            id: `step_${caseId}`,
            case_id: caseId,
            alert_id: alertId,
            entity_id: ent.id,
            actor_hash: `ANALYST_${ent.code}_${1 + (a % 5)}`,
            step_type: 'TRIAGE_ANALYSIS',
            started_at: ackAt,
            ended_at: closedAt,
            note_len: noteText.length,
            note_simhash: computeSimHash(noteText),
            note_text: noteText
          });
        }

        // Escalation: High maturity escalates 85% of criticals; Low maturity escalates only 8% (EG-02)
        const shouldEscalate = (ent.maturity > 0.7 && Math.random() < 0.85) || (ent.maturity <= 0.7 && Math.random() < 0.08);
        if (shouldEscalate) {
          escalationsToInsert.push({
            id: `esc_${caseId}`,
            entity_id: ent.id,
            case_id: caseId,
            alert_id: alertId,
            from_level: 'L1',
            to_level: 'L2_CIRT',
            escalated_at: new Date(ackAt.getTime() + 10 * 60000),
            acknowledged_at: new Date(ackAt.getTime() + 15 * 60000),
            outcome: 'TRIAGED_ESCALATED'
          });
        }
      }
    }

    if (alertsToInsert.length > 0) await db('alerts').insert(alertsToInsert);
    if (casesToInsert.length > 0) await db('cases').insert(casesToInsert);
    if (stepsToInsert.length > 0) await db('investigation_steps').insert(stepsToInsert);
    if (escalationsToInsert.length > 0) await db('escalations').insert(escalationsToInsert);
  }

  console.log('[SAT-SA Synth] Successfully seeded multi-entity synthetic datasets with latent maturity profiles.');
}

export default generateSyntheticData;
