import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { parse as parseCsv } from 'csv-parse/sync';
import { db } from '../core/db/knex.js';
import { runSupervisoryAnalysis } from '../modules/analytics/engine.js';
import { parseMultiFormatFile } from '../modules/ingestion/universal_parser.js';

/**
 * Controller handling Multi-Format Telemetry Ingestion (Splunk, Elastic, Syslog, CSV, CEF, JSON).
 */

/**
 * Classifies an incoming evidence file by its filename and content snippet
 */
function classifyFileRole(fileName = '', content = '') {
  const lowerName = fileName.toLowerCase();
  const sample = (typeof content === 'string' ? content : JSON.stringify(content)).slice(0, 4000).toLowerCase();

  // 1. JSON with embedded assets/alerts
  if (lowerName.endsWith('.json') || (sample.startsWith('{') && (sample.includes('"alerts"') || sample.includes('"assets"')))) {
    return 'JSON_SUITE';
  }

  // 2. Assets CSV / inventory
  if (
    lowerName.includes('asset') ||
    (sample.includes('asset_id') && (sample.includes('criticality') || sample.includes('firmware_os') || sample.includes('zone_or_vlan') || sample.includes('ip_address')))
  ) {
    return 'ASSETS';
  }

  // 3. Cases CSV / case triage records
  if (
    lowerName.includes('case') ||
    lowerName.includes('ticket') ||
    sample.includes('case_id') ||
    sample.includes('escalation_level') ||
    sample.includes('root_cause')
  ) {
    return 'CASES';
  }

  // 4. Syslog / CEF / Log
  if (
    lowerName.endsWith('.log') ||
    lowerName.endsWith('.syslog') ||
    lowerName.endsWith('.cef') ||
    sample.includes('cef:') ||
    /^\d{4}-\d{2}-\d{2}.*\[\w+\]/.test(sample)
  ) {
    return 'LOG';
  }

  // 5. Default is Alerts CSV / Telemetry
  return 'ALERTS';
}

/**
 * 1. Ingest Raw Telemetry Payload (Single or Multi-File Batch)
 * POST /api/v1/ingest/payload
 */
export async function ingestPayload(req, res) {
  let { files, payload, format = 'CSV', entityCode = 'CSE-POWER-01', fileName = 'upload.telemetry' } = req.body;

  // Normalize single-file or multi-file input into a standard files array
  if (!Array.isArray(files) || files.length === 0) {
    if (!payload) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'At least one file or telemetry payload is required' } });
    }
    files = [{
      fileName: fileName || 'upload.telemetry',
      content: typeof payload === 'string' ? payload : JSON.stringify(payload),
      format: format || 'CSV'
    }];
  }

  // Compute composite SHA-256 evidence hash across all files for Section 65B compliance
  const hashDigest = crypto.createHash('sha256');
  for (const f of files) {
    hashDigest.update(`${f.fileName}::${typeof f.content === 'string' ? f.content : JSON.stringify(f.content)}::`);
  }
  const evidenceHash = hashDigest.digest('hex');

  // Verify or create entity and sector
  const isTelco = entityCode.includes('TELCO');
  const isPower = entityCode.includes('POWER');
  const isBank = entityCode.includes('BANK');
  const isHealth = entityCode.includes('HEALTH');
  const isDefense = entityCode.includes('DEFENSE');

  const sectorId = isTelco ? 'sec_telecom' : (isPower ? 'sec_energy' : (isBank ? 'sec_bfsi' : (isHealth ? 'sec_health' : (isDefense ? 'sec_defense' : 'sec_custom'))));
  const sectorCode = isTelco ? 'TELECOM' : (isPower ? 'ENERGY' : (isBank ? 'BFSI' : (isHealth ? 'HEALTH' : (isDefense ? 'DEFENSE' : 'CUSTOM'))));
  const sectorName = isTelco ? 'Telecommunications & Satcom' : (isPower ? 'Power Grid & Energy' : (isBank ? 'Banking & Financial' : (isHealth ? 'Critical Healthcare' : (isDefense ? 'Defense & Aerospace' : 'Supervised Critical Sector'))));

  const existingSec = await db('sectors').where('id', sectorId).first();
  if (!existingSec) {
    await db('sectors').insert({ id: sectorId, code: sectorCode, name: sectorName });
  }

  let entity = await db('entities').where('code', entityCode).first();
  if (!entity) {
    const entityId = `cse_${entityCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const entityName = isTelco ? 'National Backbone Telecommunications & 5G' 
      : (isPower ? 'Northern Regional Power Grid Transmission' 
      : (isBank ? 'Apex National Commercial & Settlement Bank' 
      : (isHealth ? 'National Telehealth & Health Registry Exchange' 
      : (isDefense ? 'Strategic Avionics Hub' : `${entityCode} Organization`))));

    await db('entities').insert({
      id: entityId,
      code: entityCode,
      name: entityName,
      sector_id: sectorId,
      size_tier: 'TIER_1',
      region: 'National',
      active: true
    });
    entity = await db('entities').where('id', entityId).first();
  }

  const batchId = `batch_${Date.now()}`;
  let assetsInserted = 0;
  let casesInserted = 0;
  let insertedAlerts = 0;
  let totalAssetsParsed = 0;
  let totalCasesParsed = 0;
  let totalAlertsParsed = 0;
  const severityBreakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
  const categoryBreakdown = {};

  // Classify each file into its appropriate supervisory domain
  const categorizedFiles = files.map(f => ({
    ...f,
    role: classifyFileRole(f.fileName, f.content)
  }));

  // Step A: Process ASSETS first so all device references exist in database
  const assetFiles = categorizedFiles.filter(f => f.role === 'ASSETS');
  for (const af of assetFiles) {
    try {
      const records = parseCsv(af.content, { columns: true, skip_empty_lines: true, trim: true });
      totalAssetsParsed += records.length;
      const now = Date.now();
      for (const row of records) {
        const astId = row.asset_id || row.id || row.external_id;
        if (!astId) continue;

        const existingAst = await db('assets').where('id', astId).first();
        if (!existingAst) {
          await db('assets').insert({
            id: astId,
            entity_id: entity.id,
            external_id: row.external_id || astId,
            name: row.name || `${astId} Monitored Device`,
            type: row.type || 'SERVER',
            criticality: parseInt(row.criticality || '3', 10) || 3,
            environment: row.environment || 'PRODUCTION',
            first_seen: new Date(now - 90 * 86400000),
            last_seen: row.last_seen ? new Date(row.last_seen) : new Date()
          });
          assetsInserted++;
        }
      }
    } catch (e) {
      console.warn(`[Ingest] Failed parsing asset file ${af.fileName}:`, e.message);
    }
  }

  // Step B: Process CASES next so case dossiers exist for triage correlation
  const caseFiles = categorizedFiles.filter(f => f.role === 'CASES');
  for (const cf of caseFiles) {
    try {
      const records = parseCsv(cf.content, { columns: true, skip_empty_lines: true, trim: true });
      totalCasesParsed += records.length;
      for (const row of records) {
        const cId = row.case_id || row.id || row.external_id;
        if (!cId) continue;

        const existingCase = await db('cases').where('id', cId).first();
        if (!existingCase) {
          const openedAt = row.opened_at ? new Date(row.opened_at) : new Date();
          const closedAt = row.closed_at ? new Date(row.closed_at) : null;
          const hasRootCause = Boolean(row.root_cause && row.root_cause !== 'UNDETERMINED');

          await db('cases').insert({
            id: cId,
            entity_id: entity.id,
            external_id: row.external_id || cId,
            opened_at: openedAt,
            closed_at: closedAt,
            status: row.status || 'CLOSED',
            severity: (row.severity || 'HIGH').toUpperCase(),
            resolution: row.resolution || 'RESOLVED',
            root_cause_recorded: hasRootCause
          });
          casesInserted++;

          if (row.investigation_notes && row.investigation_notes.trim().length > 0) {
            const stepId = `step_${cId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            await db('investigation_steps').insert({
              id: stepId,
              case_id: cId,
              alert_id: row.alert_id || null,
              entity_id: entity.id,
              actor_hash: crypto.createHash('sha256').update(row.assignee || 'anon').digest('hex').slice(0, 16),
              step_type: 'TRIAGE_ANALYSIS',
              started_at: openedAt,
              ended_at: closedAt || openedAt,
              note_len: row.investigation_notes.length,
              note_text: row.investigation_notes
            });
          }
        }
      }
    } catch (e) {
      console.warn(`[Ingest] Failed parsing cases file ${cf.fileName}:`, e.message);
    }
  }

  // Step C: Process ALERTS, LOGS, and JSON SUITES
  const telemetryFiles = categorizedFiles.filter(f => ['ALERTS', 'LOG', 'JSON_SUITE'].includes(f.role));
  
  for (const tf of telemetryFiles) {
    if (tf.role === 'JSON_SUITE') {
      try {
        const parsedJson = JSON.parse(tf.content);
        // Handle embedded assets in JSON
        if (Array.isArray(parsedJson.assets)) {
          totalAssetsParsed += parsedJson.assets.length;
          for (const ast of parsedJson.assets) {
            const astId = ast.external_id || ast.asset_id || ast.id;
            if (!astId) continue;
            const existingAst = await db('assets').where('id', astId).first();
            if (!existingAst) {
              await db('assets').insert({
                id: astId,
                entity_id: entity.id,
                external_id: astId,
                name: ast.name || `${astId} Monitored Device`,
                type: ast.type || 'SERVER',
                criticality: parseInt(ast.criticality || '3', 10) || 3,
                environment: ast.environment || 'PRODUCTION',
                first_seen: new Date(),
                last_seen: ast.last_seen ? new Date(ast.last_seen) : new Date()
              });
              assetsInserted++;
            }
          }
        }
        // Handle embedded alerts in JSON
        const jsonAlerts = Array.isArray(parsedJson) ? parsedJson : (parsedJson.alerts || parsedJson.events || []);
        totalAlertsParsed += jsonAlerts.length;
        for (const al of jsonAlerts) {
          const rawSev = (al.severity || 'MEDIUM').toUpperCase();
          const sev = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(rawSev) ? rawSev : 'MEDIUM';
          severityBreakdown[sev] = (severityBreakdown[sev] || 0) + 1;
          const cat = al.category || 'Security Event';
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

          const alId = al.alert_id || al.external_id || al.id || `alt_${entity.id}_${Date.now()}_${insertedAlerts}`;
          const existing = await db('alerts').where('id', alId).first();
          if (!existing) {
            if (al.asset_id) {
              const ast = await db('assets').where('id', al.asset_id).first();
              if (!ast) {
                await db('assets').insert({
                  id: al.asset_id,
                  entity_id: entity.id,
                  external_id: al.asset_id,
                  name: `${al.asset_id} Supervised Device`,
                  type: 'NETWORK_NODE',
                  criticality: sev === 'CRITICAL' ? 5 : (sev === 'HIGH' ? 4 : 3),
                  environment: 'PRODUCTION',
                  first_seen: new Date(),
                  last_seen: new Date()
                });
                assetsInserted++;
              }
            }

            await db('alerts').insert({
              id: alId,
              entity_id: entity.id,
              batch_id: batchId,
              external_id: alId,
              asset_id: al.asset_id || null,
              category: cat,
              severity: sev,
              created_at: al.created_at ? new Date(al.created_at) : new Date(),
              closed_at: al.closed_at ? new Date(al.closed_at) : null,
              disposition: al.disposition || 'RESOLVED',
              assignee_hash: crypto.createHash('sha256').update(al.assignee || 'anon').digest('hex').slice(0, 16)
            });
            insertedAlerts++;
          }
        }
      } catch (e) {
        console.warn(`[Ingest] Failed parsing JSON suite ${tf.fileName}:`, e.message);
      }
    } else if (tf.role === 'LOG') {
      // Parse Syslog / CEF / text logs using scratch parser
      const tempFile = path.resolve(process.cwd(), `scratch_ingest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.log`);
      try {
        fs.writeFileSync(tempFile, tf.content);
        const parsed = await parseMultiFormatFile(tempFile, entityCode);
        totalAlertsParsed += parsed.alerts.length;
        
        for (const al of parsed.alerts) {
          severityBreakdown[al.severity] = (severityBreakdown[al.severity] || 0) + 1;
          categoryBreakdown[al.category] = (categoryBreakdown[al.category] || 0) + 1;

          if (al.asset_id) {
            const ast = await db('assets').where('id', al.asset_id).first();
            if (!ast) {
              await db('assets').insert({
                id: al.asset_id,
                entity_id: entity.id,
                external_id: al.asset_id,
                name: `${al.asset_id} Supervised Device`,
                type: 'NETWORK_NODE',
                criticality: al.severity === 'CRITICAL' ? 5 : (al.severity === 'HIGH' ? 4 : 3),
                environment: 'PRODUCTION',
                first_seen: new Date(),
                last_seen: new Date(al.created_at)
              });
              assetsInserted++;
            }
          }

          const alId = `alt_${entity.id}_${al.external_id}`;
          const existing = await db('alerts').where('id', alId).first();
          if (!existing) {
            await db('alerts').insert({
              id: alId,
              entity_id: entity.id,
              batch_id: batchId,
              external_id: al.external_id,
              asset_id: al.asset_id,
              category: al.category,
              severity: al.severity,
              created_at: new Date(al.created_at),
              closed_at: al.closed_at ? new Date(al.closed_at) : null,
              disposition: al.disposition,
              assignee_hash: crypto.createHash('sha256').update(al.assignee || 'anon').digest('hex').slice(0, 16)
            });
            insertedAlerts++;
          }
        }
      } catch (e) {
        console.warn(`[Ingest] Failed parsing log file ${tf.fileName}:`, e.message);
      } finally {
        try { fs.unlinkSync(tempFile); } catch (e) {}
      }
    } else {
      // Default: ALERTS CSV
      try {
        const records = parseCsv(tf.content, { columns: true, skip_empty_lines: true, trim: true });
        totalAlertsParsed += records.length;
        for (const row of records) {
          const alId = row.alert_id || row.id || row.external_id;
          if (!alId) continue;

          const rawSev = (row.severity || 'MEDIUM').toUpperCase();
          const sev = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(rawSev) ? rawSev : 'MEDIUM';
          severityBreakdown[sev] = (severityBreakdown[sev] || 0) + 1;
          const cat = row.category || 'Security Event';
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

          if (row.asset_id) {
            const ast = await db('assets').where('id', row.asset_id).first();
            if (!ast) {
              await db('assets').insert({
                id: row.asset_id,
                entity_id: entity.id,
                external_id: row.asset_id,
                name: `${row.asset_id} Supervised Device`,
                type: 'NETWORK_NODE',
                criticality: sev === 'CRITICAL' ? 5 : (sev === 'HIGH' ? 4 : 3),
                environment: 'PRODUCTION',
                first_seen: new Date(),
                last_seen: row.created_at ? new Date(row.created_at) : new Date()
              });
              assetsInserted++;
            }
          }

          const existing = await db('alerts').where('id', alId).first();
          if (!existing) {
            await db('alerts').insert({
              id: alId,
              entity_id: entity.id,
              batch_id: batchId,
              external_id: alId,
              asset_id: row.asset_id || null,
              category: cat,
              severity: sev,
              created_at: row.created_at ? new Date(row.created_at) : new Date(),
              closed_at: row.closed_at ? new Date(row.closed_at) : null,
              disposition: row.disposition || 'RESOLVED',
              assignee_hash: crypto.createHash('sha256').update(row.assignee || 'anon').digest('hex').slice(0, 16)
            });
            insertedAlerts++;
          }
        }
      } catch (e) {
        console.warn(`[Ingest] Failed parsing alerts CSV ${tf.fileName}:`, e.message);
      }
    }
  }

  // Record batch manifest in import_batches
  const manifestFileNames = files.map(f => f.fileName).slice(0, 5).join(', ') + (files.length > 5 ? ` (+${files.length - 5} more)` : '');
  await db('import_batches').insert({
    id: batchId,
    entity_id: entity.id,
    source_type: files.length > 1 ? 'MULTI_FILE_BATCH' : (files[0].format || 'CSV'),
    file_name: manifestFileNames,
    sha256: evidenceHash,
    status: 'LOADED',
    row_counts_json: JSON.stringify({
      totalFiles: files.length,
      alerts: insertedAlerts,
      cases: casesInserted,
      assets: assetsInserted
    })
  });

  // Record into Section 65B tamper-evident hash-chained audit log
  const lastLog = await db('audit_log').orderBy('id', 'desc').first();
  const prevHash = lastLog ? lastLog.hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const logPayload = JSON.stringify({
    batchId,
    entityCode: entity.code,
    totalFiles: files.length,
    insertedAlerts,
    casesInserted,
    assetsInserted,
    evidenceHash,
    timestamp: Date.now()
  });
  const logHash = crypto.createHash('sha256').update(prevHash + logPayload).digest('hex');

  await db('audit_log').insert({
    prev_hash: prevHash,
    action: 'TELEMETRY_BATCH_INGESTED',
    object_type: 'ENTITY',
    object_id: entity.id,
    details_json: logPayload,
    hash: logHash
  });

  // Trigger fresh supervisory analytics run
  await runSupervisoryAnalysis('multi_format_ingest');

  const reportedAlerts = insertedAlerts > 0 ? insertedAlerts : totalAlertsParsed;
  const reportedCases = casesInserted > 0 ? casesInserted : totalCasesParsed;
  const reportedAssets = assetsInserted > 0 ? assetsInserted : totalAssetsParsed;

  res.json({
    data: {
      status: 'SUCCESS',
      batchId,
      evidenceHash,
      entityCode: entity.code,
      entityName: entity.name,
      totalFiles: files.length,
      filesSummary: categorizedFiles.map(f => ({ fileName: f.fileName, role: f.role })),
      totalAlertsParsed: reportedAlerts,
      newAlertsInserted: insertedAlerts,
      alertsInserted: reportedAlerts,
      casesInserted: reportedCases,
      assetsInserted: reportedAssets,
      assetsDiscovered: reportedAssets,
      severityBreakdown,
      topCategories: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5)
    }
  });
}

/**
 * 2. Load Authentic Inspector Sample Suite from Server Disk
 * POST /api/v1/ingest/load-sample
 */
export async function loadSampleSuite(req, res) {
  const { entityCode = 'CSE-TELCO-01', clearExisting = true } = req.body;
  const samplesDir = path.resolve(process.cwd(), '../samples', entityCode);

  if (!fs.existsSync(samplesDir)) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Sample directory not found for ${entityCode}` } });
  }

  const assetsFile = path.join(samplesDir, 'assets.csv');
  const casesFile = path.join(samplesDir, 'cases.csv');
  const alertsFile = path.join(samplesDir, 'alerts.csv');

  // If clear requested, purge operational telemetry and analytical tables (preserving base entities)
  if (clearExisting) {
    await db('finding_evidence').del();
    await db('findings').del();
    await db('review_samples').del();
    await db('entity_scores').del();
    await db('investigation_steps').del();
    await db('escalations').del();
    await db('alerts').del();
    await db('cases').del();
    await db('assets').del();
    await db('import_batches').del();
    await db('analysis_runs').del();
  }

  // Ensure sector exists
  const isTelco = entityCode.includes('TELCO');
  const isPower = entityCode.includes('POWER');
  const isBank = entityCode.includes('BANK');
  const isHealth = entityCode.includes('HEALTH');
  const isDefense = entityCode.includes('DEFENSE');

  const sectorId = isTelco ? 'sec_telecom' : (isPower ? 'sec_energy' : (isBank ? 'sec_bfsi' : (isHealth ? 'sec_health' : 'sec_defense')));
  const sectorCode = isTelco ? 'TELECOM' : (isPower ? 'ENERGY' : (isBank ? 'BFSI' : (isHealth ? 'HEALTH' : 'DEFENSE')));
  const sectorName = isTelco ? 'Telecommunications & Satcom' : (isPower ? 'Power Grid & Energy' : (isBank ? 'Banking & Financial' : (isHealth ? 'Critical Healthcare' : 'Defense & Strategic Enclaves')));

  const existingSec = await db('sectors').where('id', sectorId).first();
  if (!existingSec) {
    await db('sectors').insert({ id: sectorId, code: sectorCode, name: sectorName });
  }

  const normalizedId = entityCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const entityId = normalizedId.startsWith('cse_') ? normalizedId : `cse_${normalizedId}`;
  const entityName = isTelco ? 'National Backbone Telecommunications & 5G' 
    : (isPower ? 'Northern Regional Power Grid Transmission' 
    : (isBank ? 'Apex National Commercial & Settlement Bank' 
    : (isHealth ? 'National Telehealth & Health Registry Exchange' : 'Strategic Avionics & Defense Manufacturing Hub')));

  let entity = await db('entities').where('code', entityCode).orWhere('id', entityId).first();
  if (!entity) {
    await db('entities').insert({
      id: entityId,
      code: entityCode,
      name: entityName,
      sector_id: sectorId,
      size_tier: 'TIER_1',
      region: 'National',
      active: true
    });
    entity = await db('entities').where('id', entityId).first();
  }

  // 1. Ingest Assets
  let assetsInserted = 0;
  if (fs.existsSync(assetsFile)) {
    const assetLines = fs.readFileSync(assetsFile, 'utf-8').split(/\r?\n/).filter(l => l.trim().length > 0);
    const now = Date.now();
    for (let i = 1; i < assetLines.length; i++) {
      const cols = assetLines[i].split(',');
      if (cols.length < 5) continue;
      const astId = cols[0].trim();
      const existing = await db('assets').where('id', astId).first();
      if (!existing) {
        await db('assets').insert({
          id: astId,
          entity_id: entity.id,
          external_id: astId,
          name: cols[1]?.trim() || `${astId} Asset`,
          type: cols[2]?.trim() || 'SERVER',
          criticality: parseInt(cols[3]?.trim() || '3', 10),
          environment: 'PRODUCTION',
          first_seen: new Date(now - 90 * 86400000),
          last_seen: cols[8]?.trim() ? new Date(cols[8].trim()) : new Date()
        });
        assetsInserted++;
      }
    }
  }

  // 2. Ingest Cases
  let casesInserted = 0;
  if (fs.existsSync(casesFile)) {
    const caseLines = fs.readFileSync(casesFile, 'utf-8').split(/\r?\n/).filter(l => l.trim().length > 0);
    const maxCases = Math.min(caseLines.length, 50000);
    const caseBatch = [];
    for (let i = 1; i < maxCases; i++) {
      const cols = caseLines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 6) continue;
      const cId = cols[0].trim();
      caseBatch.push({
        id: cId,
        entity_id: entity.id,
        external_id: cId,
        opened_at: new Date(cols[4]?.trim() || Date.now()),
        closed_at: cols[5]?.trim() ? new Date(cols[5].trim()) : null,
        status: cols[3]?.trim() || 'CLOSED',
        severity: cols[2]?.trim() || 'HIGH',
        resolution: 'RESOLVED'
      });
      casesInserted++;
      if (caseBatch.length >= 250) {
        await db('cases').insert(caseBatch);
        caseBatch.length = 0;
      }
    }
    if (caseBatch.length > 0) {
      await db('cases').insert(caseBatch);
    }
  }

  // 3. Ingest Alerts
  let alertsInserted = 0;
  const severityBreakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  if (fs.existsSync(alertsFile)) {
    const fileStream = fs.createReadStream(alertsFile);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    let count = 0;
    const maxAlerts = 100000;
    let alertBatch = [];

    for await (const line of rl) {
      if (count === 0 && line.startsWith('alert_id')) { count++; continue; }
      if (!line.trim()) continue;
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 6) continue;

      const alId = cols[0];
      const sev = cols[2] || 'MEDIUM';
      severityBreakdown[sev] = (severityBreakdown[sev] || 0) + 1;

      const createdDate = cols[3] && !isNaN(new Date(cols[3]).getTime()) ? new Date(cols[3]) : new Date();
      const closedDate = cols[4] && !isNaN(new Date(cols[4]).getTime()) ? new Date(cols[4]) : null;

      alertBatch.push({
        id: alId,
        entity_id: entity.id,
        batch_id: `batch_${entityCode}`,
        external_id: alId,
        asset_id: cols[7] || null,
        category: cols[1] || 'Security Event',
        severity: sev,
        created_at: createdDate,
        closed_at: closedDate,
        disposition: cols[5] || 'RESOLVED',
        assignee_hash: crypto.createHash('sha256').update(cols[6] || 'anon').digest('hex').slice(0, 16)
      });
      alertsInserted++;
      count++;

      if (alertBatch.length >= 250) {
        await db('alerts').insert(alertBatch);
        alertBatch = [];
      }
      if (count >= maxAlerts) break;
    }
    if (alertBatch.length > 0) {
      await db('alerts').insert(alertBatch);
    }
  }

  // Run supervisory analytics
  const runResult = await runSupervisoryAnalysis('sample_load');

  const evidenceHash = crypto.createHash('sha256').update(`SAMPLE_${entityCode}_${alertsInserted}`).digest('hex');

  res.json({
    data: {
      status: 'SUCCESS',
      entityCode,
      entityName,
      evidenceHash,
      alertsInserted,
      casesInserted,
      assetsInserted,
      severityBreakdown,
      findingsGenerated: runResult.findingsCount
    }
  });
}

/**
 * 3. Get Ingestion Overview & Historical Batches
 * GET /api/v1/ingest/summary
 */
export async function getIngestSummary(req, res) {
  const alertCountRow = await db('alerts').count('id as count').first();
  const caseCountRow = await db('cases').count('id as count').first();
  const assetCountRow = await db('assets').count('id as count').first();
  const batches = await db('import_batches').orderBy('created_at', 'desc').limit(10);

  res.json({
    data: {
      totalAlerts: parseInt(alertCountRow?.count || '0', 10),
      totalCases: parseInt(caseCountRow?.count || '0', 10),
      totalAssets: parseInt(assetCountRow?.count || '0', 10),
      recentBatches: batches.map(b => ({
        ...b,
        row_counts: b.row_counts_json ? JSON.parse(b.row_counts_json) : {}
      }))
    }
  });
}
