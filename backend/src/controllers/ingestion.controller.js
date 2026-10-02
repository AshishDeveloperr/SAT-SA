import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../core/db/knex.js';
import { runSupervisoryAnalysis } from '../modules/analytics/engine.js';
import { parseMultiFormatFile } from '../modules/ingestion/universal_parser.js';

/**
 * Controller handling Multi-Format Telemetry Ingestion (Splunk, Elastic, Syslog, CSV, CEF, JSON).
 */

/**
 * 1. Ingest Raw Telemetry Payload
 * POST /api/v1/ingest/payload
 */
export async function ingestPayload(req, res) {
  const { payload, format = 'JSON', entityCode = 'CSE-INGEST-01' } = req.body;
  if (!payload) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Payload is required' } });
  }

  // Save payload to a temp scratch file to run multi-format parser
  const tempFile = path.resolve(process.cwd(), `scratch_ingest_${Date.now()}.${format.toLowerCase()}`);
  fs.writeFileSync(tempFile, typeof payload === 'string' ? payload : JSON.stringify(payload));
  
  const parsed = await parseMultiFormatFile(tempFile, entityCode);
  try { fs.unlinkSync(tempFile); } catch (e) {}

  // Verify / create entity
  let entity = await db('entities').where('code', parsed.entityCode).first();
  if (!entity) {
    const entityId = `ent_${parsed.entityCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    await db('entities').insert({
      id: entityId,
      code: parsed.entityCode,
      name: parsed.entityName,
      sector_id: parsed.sectorId || 'sec_energy',
      size_tier: 'TIER_1',
      active: true
    });
    entity = await db('entities').where('id', entityId).first();
  }

  // Ingest discovered / parsed assets first to satisfy foreign keys
  if (parsed.assets && parsed.assets.length > 0) {
    for (const ast of parsed.assets) {
      const astId = ast.external_id || ast.asset_id || ast.id;
      const existingAst = await db('assets').where('id', astId).first();
      if (!existingAst) {
        await db('assets').insert({
          id: astId,
          entity_id: entity.id,
          external_id: ast.external_id || astId,
          name: ast.name || `${astId} Monitored Device`,
          type: ast.type || 'SERVER',
          criticality: ast.criticality || 3,
          environment: ast.environment || 'PRODUCTION',
          first_seen: new Date(),
          last_seen: ast.last_seen ? new Date(ast.last_seen) : new Date()
        });
      }
    }
  }

  // Ingest normalized alerts
  let insertedAlerts = 0;
  for (const al of parsed.alerts) {
    // Ensure specific referenced asset exists
    if (al.asset_id) {
      const ast = await db('assets').where('id', al.asset_id).first();
      if (!ast) {
        await db('assets').insert({
          id: al.asset_id,
          entity_id: entity.id,
          external_id: al.asset_id,
          name: `${al.asset_id} Supervised Device`,
          type: al.asset_id.toLowerCase().includes('scada') ? 'SCADA_RTU' : (al.asset_id.toLowerCase().includes('plc') ? 'PLC_CONTROLLER' : 'NETWORK_NODE'),
          criticality: al.severity === 'CRITICAL' ? 5 : (al.severity === 'HIGH' ? 4 : 3),
          environment: 'PRODUCTION',
          first_seen: new Date(),
          last_seen: new Date(al.created_at)
        });
      }
    }

    const alId = `alt_${entity.id}_${al.external_id}`;
    const existing = await db('alerts').where('id', alId).first();
    if (!existing) {
      await db('alerts').insert({
        id: alId,
        entity_id: entity.id,
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

  // Trigger fresh analytics run
  await runSupervisoryAnalysis('multi_format_ingest');

  res.json({
    data: {
      status: 'SUCCESS',
      detectedFormat: parsed.format,
      entityCode: parsed.entityCode,
      totalAlertsParsed: parsed.alerts.length,
      newAlertsInserted: insertedAlerts,
      assetsDiscovered: parsed.assets.length
    }
  });
}
