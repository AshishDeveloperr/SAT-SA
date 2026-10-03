import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Normalization helpers matching backend/src/modules/ingestion/universal_parser.js
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

function parseCefLine(line) {
  // CEF:Version|Device Vendor|Device Product|Device Version|Signature ID|Name|Severity|Extension
  if (!line || !line.startsWith('CEF:')) return null;
  const parts = line.split('|');
  if (parts.length < 7) return null;
  return {
    version: parts[0].replace('CEF:', ''),
    vendor: parts[1],
    product: parts[2],
    deviceVersion: parts[3],
    signatureId: parts[4],
    name: parts[5],
    severity: normalizeSeverity(parts[6]),
    rawExtension: parts.slice(7).join('|')
  };
}

function parseSyslogLine(line) {
  // <134>1 2026-10-01T11:00:00.910Z host.scada.net PLC-TURBINE-01 - - [CRITICAL] message
  const match = line.match(/^<(\d+)>(\d+)?\s*(\S+)\s+(\S+)\s+(\S+)\s+.*\[(\w+)\]\s+(.*)$/);
  if (match) {
    return {
      pri: match[1],
      timestamp: match[3],
      host: match[4],
      app: match[5],
      severity: normalizeSeverity(match[6]),
      message: match[7]
    };
  }
  // Generic fallback match
  return {
    raw: line,
    severity: line.toUpperCase().includes('CRIT') ? 'CRITICAL' : (line.toUpperCase().includes('WARN') ? 'MEDIUM' : 'INFO')
  };
}

describe('Universal Multi-Format SIEM Parser Suite', () => {
  describe('Severity Normalization Engine', () => {
    it('should map ArcSight/QRadar numeric ratings (5 -> CRITICAL, 4 -> HIGH, 3 -> MEDIUM)', () => {
      assert.strictEqual(normalizeSeverity('5'), 'CRITICAL');
      assert.strictEqual(normalizeSeverity('4'), 'HIGH');
      assert.strictEqual(normalizeSeverity('3'), 'MEDIUM');
      assert.strictEqual(normalizeSeverity('2'), 'LOW');
    });

    it('should map Incident Priority codes (P1 -> CRITICAL, P2 -> HIGH, P3 -> MEDIUM)', () => {
      assert.strictEqual(normalizeSeverity('P1'), 'CRITICAL');
      assert.strictEqual(normalizeSeverity('p1'), 'CRITICAL');
      assert.strictEqual(normalizeSeverity('P2'), 'HIGH');
      assert.strictEqual(normalizeSeverity('P4'), 'LOW');
    });

    it('should map Syslog severity names (FATAL, ERROR, WARN, NOTICE)', () => {
      assert.strictEqual(normalizeSeverity('FATAL'), 'CRITICAL');
      assert.strictEqual(normalizeSeverity('ERROR'), 'HIGH');
      assert.strictEqual(normalizeSeverity('WARN'), 'MEDIUM');
      assert.strictEqual(normalizeSeverity('NOTICE'), 'LOW');
    });

    it('should default empty or undefined values to MEDIUM', () => {
      assert.strictEqual(normalizeSeverity(null), 'MEDIUM');
      assert.strictEqual(normalizeSeverity(undefined), 'MEDIUM');
      assert.strictEqual(normalizeSeverity(''), 'MEDIUM');
    });
  });

  describe('Common Event Format (CEF) Ingestion', () => {
    it('should extract canonical alert fields from an ArcSight CEF event', () => {
      const cef = 'CEF:0|Schneider Electric|Modbus PLC|4.2|MODBUS-ILLEGAL-FUNC|Modbus Illegal Function Override|5|src=192.168.1.50 dst=192.168.1.10';
      const parsed = parseCefLine(cef);
      assert.ok(parsed, 'Parsed CEF object must exist');
      assert.strictEqual(parsed.vendor, 'Schneider Electric');
      assert.strictEqual(parsed.name, 'Modbus Illegal Function Override');
      assert.strictEqual(parsed.severity, 'CRITICAL');
      assert.ok(parsed.rawExtension.includes('src=192.168.1.50'));
    });

    it('should return null for malformed or non-CEF lines', () => {
      assert.strictEqual(parseCefLine('Invalid plain log message'), null);
      assert.strictEqual(parseCefLine('CEF:0|incomplete'), null);
    });
  });

  describe('Syslog RFC-5424 Telemetry Parsing', () => {
    it('should parse timestamp, host, and severity from RFC-5424 kinetic telemetry', () => {
      const syslog = '<134>1 2026-10-01T11:00:00.910Z scada-node-01.grid.internal PLC-TURBINE-01 - - [CRITICAL] Emergency SIS valve bypass commanded via unauthenticated Profinet telegram';
      const parsed = parseSyslogLine(syslog);
      assert.strictEqual(parsed.timestamp, '2026-10-01T11:00:00.910Z');
      assert.strictEqual(parsed.host, 'scada-node-01.grid.internal');
      assert.strictEqual(parsed.app, 'PLC-TURBINE-01');
      assert.strictEqual(parsed.severity, 'CRITICAL');
      assert.ok(parsed.message.includes('Emergency SIS valve bypass'));
    });

    it('should provide fallback severity classification for non-RFC syslog lines', () => {
      const line = '2026-10-01 12:00:00 [CRITICAL ERROR] Core relay trip disconnected';
      const parsed = parseSyslogLine(line);
      assert.strictEqual(parsed.severity, 'CRITICAL');
    });
  });
});
