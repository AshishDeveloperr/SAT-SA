import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Data Ingestion, Field Mapping & Normalization Engine
 */
function normalizeSeverity(input) {
  if (input === null || input === undefined) return 'UNKNOWN';
  const str = String(input).trim().toUpperCase();

  // Numerical 0-10 or 1-5
  if (!isNaN(str)) {
    const num = Number(str);
    if (num >= 8) return 'CRITICAL';
    if (num >= 6) return 'HIGH';
    if (num >= 3) return 'MEDIUM';
    return 'LOW';
  }

  // Priority aliases
  if (str === 'P1' || str === 'PRIORITY 1' || str === 'CRIT' || str === 'FATAL') return 'CRITICAL';
  if (str === 'P2' || str === 'PRIORITY 2' || str === 'MAJOR' || str === 'ERROR') return 'HIGH';
  if (str === 'P3' || str === 'PRIORITY 3' || str === 'WARN' || str === 'WARNING') return 'MEDIUM';
  if (str === 'P4' || str === 'P5' || str === 'INFO' || str === 'INFORMATIONAL' || str === 'DEBUG') return 'LOW';

  // Direct string matches
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(str)) return str;

  return 'UNKNOWN';
}

function parseUniversalTimestamp(val) {
  if (!val) return null;
  // Unix timestamp in seconds (10 digits)
  if (typeof val === 'number' || (/^\d{10}$/.test(String(val).trim()))) {
    const d = new Date(Number(val) * 1000);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  // Epoch in milliseconds (13 digits)
  if (/^\d{13}$/.test(String(val).trim())) {
    const d = new Date(Number(val));
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  // Standard string parse
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function mapSiemVendorSchema(record, format = 'AUTO') {
  if (!record) return null;

  // Auto-detect format if not explicitly passed
  let detected = format;
  if (detected === 'AUTO') {
    if (record.cefVersion !== undefined || record.deviceVendor !== undefined) detected = 'CEF';
    else if (record.leefVersion !== undefined) detected = 'LEEF';
    else if (record['@timestamp'] !== undefined) detected = 'ECS';
    else detected = 'GENERIC';
  }

  const mapped = {
    alertId: null,
    assetId: null,
    severity: 'UNKNOWN',
    timestamp: null,
    title: 'Untitled Alert',
    format: detected
  };

  if (detected === 'CEF') {
    mapped.alertId = record.externalId || record.eventId || 'CEF-GEN';
    mapped.assetId = record.dst || record.destinationHostName || record.dhost || 'UNKNOWN_ASSET';
    mapped.severity = normalizeSeverity(record.severity);
    mapped.timestamp = parseUniversalTimestamp(record.deviceReceiptTime || record.rt);
    mapped.title = record.name || record.deviceEventClassId || 'CEF Alert';
  } else if (detected === 'LEEF') {
    mapped.alertId = record.ident || record.eventId || 'LEEF-GEN';
    mapped.assetId = record.dst || record.identHostName || 'UNKNOWN_ASSET';
    mapped.severity = normalizeSeverity(record.sev);
    mapped.timestamp = parseUniversalTimestamp(record.devTime);
    mapped.title = record.eventName || 'LEEF Alert';
  } else if (detected === 'ECS') {
    mapped.alertId = record.event?.id || record._id || 'ECS-GEN';
    mapped.assetId = record.host?.hostname || record.host?.ip || 'UNKNOWN_ASSET';
    mapped.severity = normalizeSeverity(record.event?.severity || record.log?.level);
    mapped.timestamp = parseUniversalTimestamp(record['@timestamp']);
    mapped.title = record.message || 'ECS Log Event';
  } else {
    mapped.alertId = record.alert_id || record.id || 'GEN-01';
    mapped.assetId = record.asset_id || record.asset || record.hostname || 'UNKNOWN_ASSET';
    mapped.severity = normalizeSeverity(record.severity || record.priority);
    mapped.timestamp = parseUniversalTimestamp(record.timestamp || record.created_at);
    mapped.title = record.title || record.alert_name || 'Standard Alert';
  }

  return mapped;
}

function sanitizeCsvLine(line) {
  // Simple regex parser handling quoted fields containing commas
  const re = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
  const fields = [];
  let match;
  while ((match = re.exec(line)) !== null) {
    if (match[1] !== undefined) {
      fields.push(match[1].replace(/""/g, '"'));
    } else if (match[2] !== undefined) {
      fields.push(match[2].trim());
    }
  }
  return fields;
}

describe('Universal SIEM Ingestion & Normalization Suite', () => {
  describe('Severity Normalization Engine', () => {
    it('should map numeric severities 8-10 to CRITICAL', () => {
      assert.strictEqual(normalizeSeverity(10), 'CRITICAL');
      assert.strictEqual(normalizeSeverity('9'), 'CRITICAL');
      assert.strictEqual(normalizeSeverity(8), 'CRITICAL');
    });

    it('should map numeric severities 6-7 to HIGH', () => {
      assert.strictEqual(normalizeSeverity(7), 'HIGH');
      assert.strictEqual(normalizeSeverity('6'), 'HIGH');
    });

    it('should map numeric severities 3-5 to MEDIUM', () => {
      assert.strictEqual(normalizeSeverity(5), 'MEDIUM');
      assert.strictEqual(normalizeSeverity('3'), 'MEDIUM');
    });

    it('should map numeric severities 0-2 to LOW', () => {
      assert.strictEqual(normalizeSeverity(2), 'LOW');
      assert.strictEqual(normalizeSeverity('0'), 'LOW');
    });

    it('should normalize P1-P4 priority classifications', () => {
      assert.strictEqual(normalizeSeverity('P1'), 'CRITICAL');
      assert.strictEqual(normalizeSeverity('P2'), 'HIGH');
      assert.strictEqual(normalizeSeverity('P3'), 'MEDIUM');
      assert.strictEqual(normalizeSeverity('P4'), 'LOW');
    });

    it('should handle syslog / logging level aliases gracefully', () => {
      assert.strictEqual(normalizeSeverity('FATAL'), 'CRITICAL');
      assert.strictEqual(normalizeSeverity('ERROR'), 'HIGH');
      assert.strictEqual(normalizeSeverity('WARN'), 'MEDIUM');
      assert.strictEqual(normalizeSeverity('INFO'), 'LOW');
    });

    it('should return UNKNOWN for null, undefined or unsupported strings', () => {
      assert.strictEqual(normalizeSeverity(null), 'UNKNOWN');
      assert.strictEqual(normalizeSeverity(undefined), 'UNKNOWN');
      assert.strictEqual(normalizeSeverity('unrecognized_code'), 'UNKNOWN');
    });
  });

  describe('Timestamp Normalization Engine', () => {
    it('should normalize ISO-8601 UTC timestamp', () => {
      const ts = '2026-10-04T00:30:00.000Z';
      assert.strictEqual(parseUniversalTimestamp(ts), '2026-10-04T00:30:00.000Z');
    });

    it('should normalize Unix seconds epoch integer', () => {
      const unixSec = 1791073800; // valid future timestamp
      const parsed = parseUniversalTimestamp(unixSec);
      assert.ok(parsed !== null && parsed.endsWith('Z'));
    });

    it('should normalize 13-digit millisecond epoch string', () => {
      const msStr = '1791073800000';
      const parsed = parseUniversalTimestamp(msStr);
      assert.ok(parsed !== null && parsed.endsWith('Z'));
    });

    it('should return null for corrupt or unparseable timestamps', () => {
      assert.strictEqual(parseUniversalTimestamp('not_a_valid_date'), null);
      assert.strictEqual(parseUniversalTimestamp(''), null);
      assert.strictEqual(parseUniversalTimestamp(null), null);
    });
  });

  describe('Multi-Vendor SIEM Schema Mapping', () => {
    it('should accurately auto-detect and map ArcSight CEF schema', () => {
      const cefRecord = {
        cefVersion: '0',
        deviceVendor: 'CheckPoint',
        deviceEventClassId: 'FW-DROP',
        severity: '8',
        name: 'Firewall Drop Action',
        dst: '192.168.10.50',
        rt: '2026-10-03T18:00:00Z',
        externalId: 'CEF-9901'
      };
      const mapped = mapSiemVendorSchema(cefRecord);
      assert.strictEqual(mapped.format, 'CEF');
      assert.strictEqual(mapped.alertId, 'CEF-9901');
      assert.strictEqual(mapped.assetId, '192.168.10.50');
      assert.strictEqual(mapped.severity, 'CRITICAL');
      assert.strictEqual(mapped.title, 'Firewall Drop Action');
    });

    it('should accurately auto-detect and map IBM QRadar LEEF schema', () => {
      const leefRecord = {
        leefVersion: '2.0',
        ident: 'LEEF-401',
        identHostName: 'db-scada-core-01',
        sev: 'P1',
        eventName: 'Unauthorized SQL Dump Attempt',
        devTime: '1791073800'
      };
      const mapped = mapSiemVendorSchema(leefRecord);
      assert.strictEqual(mapped.format, 'LEEF');
      assert.strictEqual(mapped.alertId, 'LEEF-401');
      assert.strictEqual(mapped.assetId, 'db-scada-core-01');
      assert.strictEqual(mapped.severity, 'CRITICAL');
    });

    it('should accurately auto-detect and map Elastic ECS schema', () => {
      const ecsRecord = {
        '@timestamp': '2026-10-03T20:00:00Z',
        event: { id: 'ECS-EVT-77', severity: 7 },
        host: { hostname: 'scada-gateway.cne.grid' },
        message: 'Multiple failed SSH authentication attempts'
      };
      const mapped = mapSiemVendorSchema(ecsRecord);
      assert.strictEqual(mapped.format, 'ECS');
      assert.strictEqual(mapped.alertId, 'ECS-EVT-77');
      assert.strictEqual(mapped.assetId, 'scada-gateway.cne.grid');
      assert.strictEqual(mapped.severity, 'HIGH');
    });

    it('should return null when record is empty or invalid', () => {
      assert.strictEqual(mapSiemVendorSchema(null), null);
    });
  });

  describe('RFC-4180 CSV Sanitation & Quoting', () => {
    it('should parse basic comma-separated tokens', () => {
      const tokens = sanitizeCsvLine('ALT-101,scada-rtu-01,CRITICAL,2026-10-04');
      assert.deepStrictEqual(tokens, ['ALT-101', 'scada-rtu-01', 'CRITICAL', '2026-10-04']);
    });

    it('should correctly handle commas inside double-quoted fields', () => {
      const line = 'ALT-102,"Substation 4, Transformer Unit",HIGH,"False alarm, operator notified"';
      const tokens = sanitizeCsvLine(line);
      assert.strictEqual(tokens[1], 'Substation 4, Transformer Unit');
      assert.strictEqual(tokens[3], 'False alarm, operator notified');
    });

    it('should handle escaped double-quotes within fields', () => {
      const line = 'ALT-103,Asset-A,LOW,"Operator said ""All clear"" after check"';
      const tokens = sanitizeCsvLine(line);
      assert.strictEqual(tokens[3], 'Operator said "All clear" after check');
    });
  });
});
