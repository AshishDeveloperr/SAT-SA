import fs from 'node:fs';
import path from 'node:path';
import { parse as parseCsv } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

/**
 * Normalizes field names across heterogeneous telemetry sources
 */
const FIELD_ALIASES = {
  external_id: ['id', 'alert_id', 'alert_code', 'incident_id', 'event_id', 'ticket_id', 'alertId', 'record_id'],
  category: ['category', 'threat_category', 'signature', 'rule_name', 'event_type', 'threat_type', 'activity', 'attack_technique'],
  severity: ['severity', 'priority', 'level', 'urgency', 'severity_level', 'risk_level'],
  created_at: ['created_at', 'timestamp', 'event_time', 'start_time', 'occurred_at', 'log_date', 'datetime', 'time'],
  closed_at: ['closed_at', 'resolved_at', 'end_time', 'cleared_at', 'resolution_time', 'close_time'],
  disposition: ['disposition', 'status', 'resolution', 'verdict', 'closure_reason', 'outcome'],
  assignee: ['assignee', 'analyst', 'operator', 'handler', 'owner', 'analyst_id', 'user'],
  asset_id: ['asset_id', 'asset', 'host', 'hostname', 'device', 'ip', 'src_ip', 'destination', 'target', 'scada_node', 'plc_id'],
  investigation_notes: ['notes', 'investigation_notes', 'closing_notes', 'comment', 'description', 'message', 'msg', 'analyst_notes']
};

/**
 * Resolves a canonical key from an object with arbitrary casing/naming
 */
function extractCanonicalField(record, canonicalKey) {
  const aliases = FIELD_ALIASES[canonicalKey] || [canonicalKey];
  for (const alias of aliases) {
    for (const [key, val] of Object.entries(record)) {
      if (key.toLowerCase().replace(/[\s_-]/g, '') === alias.toLowerCase().replace(/[\s_-]/g, '')) {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return val;
        }
      }
    }
  }
  return null;
}

/**
 * Normalizes severity value to CRITICAL | HIGH | MEDIUM | LOW | INFO
 */
function normalizeSeverity(raw) {
  if (!raw) return 'MEDIUM';
  const str = String(raw).trim().toUpperCase();
  if (str.includes('CRIT') || str === '5' || str === 'FATAL' || str === 'P1') return 'CRITICAL';
  if (str.includes('HIGH') || str === '4' || str === 'ERROR' || str === 'P2') return 'HIGH';
  if (str.includes('MED') || str === '3' || str === 'WARN' || str === 'P3') return 'MEDIUM';
  if (str.includes('LOW') || str === '2' || str === 'NOTICE' || str === 'P4') return 'LOW';
  return 'INFO';
}

/**
 * Standardizes a raw record into canonical SAT-SA Alert Schema
 */
function standardizeAlert(raw, idx, entityCode) {
  const externalId = extractCanonicalField(raw, 'external_id') || `ALT-${entityCode}-${String(idx + 1).padStart(4, '0')}`;
  const category = extractCanonicalField(raw, 'category') || 'Anomalous System Activity';
  const rawSev = extractCanonicalField(raw, 'severity');
  const severity = normalizeSeverity(rawSev);
  
  let createdAt = extractCanonicalField(raw, 'created_at');
  let closedAt = extractCanonicalField(raw, 'closed_at');
  
  const createdDate = createdAt ? new Date(createdAt) : new Date(Date.now() - (idx + 1) * 3600000);
  const validCreated = !isNaN(createdDate.getTime()) ? createdDate.toISOString() : new Date().toISOString();
  
  let validClosed = null;
  if (closedAt) {
    const closedDate = new Date(closedAt);
    if (!isNaN(closedDate.getTime())) validClosed = closedDate.toISOString();
  } else {
    // If closed disposition exists but closed_at is missing, extrapolate realistically
    const disposition = extractCanonicalField(raw, 'disposition');
    if (disposition && disposition.toUpperCase() !== 'OPEN') {
      validClosed = new Date(new Date(validCreated).getTime() + 1800000).toISOString();
    }
  }

  return {
    external_id: String(externalId),
    category: String(category),
    severity,
    created_at: validCreated,
    closed_at: validClosed,
    disposition: extractCanonicalField(raw, 'disposition') || (validClosed ? 'RESOLVED' : 'OPEN'),
    assignee: extractCanonicalField(raw, 'assignee') || 'soc_analyst_01',
    asset_id: extractCanonicalField(raw, 'asset_id') || `NODE-${entityCode}-01`,
    investigation_notes: extractCanonicalField(raw, 'investigation_notes') || 'Standard supervisory telemetry record ingest.'
  };
}

/**
 * Universal Multi-Format Telemetry Parser
 * Supports: JSON (.json), CSV (.csv), Excel (.xlsx/.xls), Syslog/CEF/Text (.log/.syslog/.txt)
 */
export async function parseMultiFormatFile(filePath, defaultEntityCode = 'CSE-INGEST-01') {
  const ext = path.extname(filePath).toLowerCase();
  let entityCode = defaultEntityCode;
  let entityName = `${entityCode} Organization`;
  let sectorId = 'sec_energy';
  let rawAlerts = [];
  let rawAssets = [];

  if (ext === '.json') {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed)) {
      rawAlerts = parsed;
    } else {
      entityCode = parsed.entity_code || parsed.entity?.code || defaultEntityCode;
      entityName = parsed.entity_name || parsed.entity?.name || `${entityCode} Organization`;
      sectorId = parsed.sector_id || parsed.sector || 'sec_energy';
      rawAlerts = parsed.alerts || parsed.events || parsed.data || [];
      rawAssets = parsed.assets || [];
    }
  } else if (ext === '.csv') {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const records = parseCsv(rawContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    rawAlerts = records;
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    rawAlerts = XLSX.utils.sheet_to_json(worksheet);
  } else if (ext === '.log' || ext === '.syslog' || ext === '.txt') {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const lines = rawContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // Parse CEF, Syslog, or Standard Log lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('CEF:')) {
        // CEF format: CEF:Version|Device Vendor|Device Product|Device Version|SignatureID|Name|Severity|Extension
        const parts = line.split('|');
        if (parts.length >= 7) {
          rawAlerts.push({
            external_id: `CEF-${i + 1}`,
            asset_id: parts[1] || 'OT-DEVICE',
            category: parts[5] || parts[4] || 'CEF Security Event',
            severity: parts[6] || 'HIGH',
            investigation_notes: line
          });
          continue;
        }
      }
      
      // Standard Syslog / PLC Line: [TIMESTAMP] [SEVERITY] [ASSET] [MSG]
      const match = line.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\s*(?:\[(\w+)\])?\s*(?:([A-Za-z0-9_-]+):)?\s*(.*)$/);
      if (match) {
        rawAlerts.push({
          created_at: match[1],
          severity: match[2] || 'MEDIUM',
          asset_id: match[3] || 'PLC-CORE-01',
          category: 'Telemetry Log Event',
          investigation_notes: match[4] || line
        });
      } else {
        // Generic fallback line
        rawAlerts.push({
          external_id: `LOG-${i + 1}`,
          category: 'System Diagnostic Log',
          severity: line.toLowerCase().includes('error') || line.toLowerCase().includes('fail') ? 'HIGH' : 'MEDIUM',
          investigation_notes: line
        });
      }
    }
  } else {
    throw new Error(`Unsupported file format: ${ext}. Supported: .json, .csv, .xlsx, .xls, .log, .syslog, .txt`);
  }

  // Standardize all alerts
  const normalizedAlerts = rawAlerts.map((raw, idx) => standardizeAlert(raw, idx, entityCode));
  
  // Extract discovered assets if none explicitly provided
  let normalizedAssets = rawAssets;
  if (normalizedAssets.length === 0) {
    const assetMap = new Map();
    for (const a of normalizedAlerts) {
      if (!assetMap.has(a.asset_id)) {
        assetMap.set(a.asset_id, {
          external_id: a.asset_id,
          name: `${a.asset_id} Supervised Device`,
          type: a.asset_id.toLowerCase().includes('scada') ? 'SCADA_RTU' : (a.asset_id.toLowerCase().includes('plc') ? 'PLC_CONTROLLER' : 'NETWORK_NODE'),
          criticality: a.severity === 'CRITICAL' ? 5 : (a.severity === 'HIGH' ? 4 : 3),
          last_seen: a.created_at
        });
      }
    }
    normalizedAssets = Array.from(assetMap.values());
  }

  return {
    format: ext.toUpperCase().replace('.', ''),
    entityCode,
    entityName,
    sectorId,
    alerts: normalizedAlerts,
    assets: normalizedAssets
  };
}
