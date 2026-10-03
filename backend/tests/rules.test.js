import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure analytical helper functions mirroring the supervisory rules engine
 */
function isFastClose(createdAt, closedAt, thresholdMinutes = 10) {
  if (!createdAt || !closedAt) return false;
  const durationMs = new Date(closedAt).getTime() - new Date(createdAt).getTime();
  const durationMinutes = durationMs / 60000;
  return durationMinutes > 0 && durationMinutes < thresholdMinutes;
}

function isUnescalatedCritical(severity, escalationTicket) {
  const isCrit = severity === 'CRITICAL' || severity === 'P1' || severity === 'FATAL';
  if (!isCrit) return false;
  return !escalationTicket || String(escalationTicket).trim() === '';
}

function hasZeroInvestigationSteps(stepsCount, status) {
  const isClosed = status === 'CLOSED' || status === 'RESOLVED' || status === 'RESOLVED_NO_ACTION';
  return isClosed && (stepsCount === 0 || stepsCount === null || stepsCount === undefined);
}

function computeTokenFingerprintDistance(noteA, noteB) {
  const tokenize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const tokensA = new Set(tokenize(noteA));
  const tokensB = new Set(tokenize(noteB));
  const union = new Set([...tokensA, ...tokensB]);
  if (union.size === 0) return 0;
  let intersectionCount = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersectionCount++;
  }
  const jaccardSim = intersectionCount / union.size;
  return 1 - jaccardSim; // 0 = identical, 1 = completely distinct
}

function isRepeatUnremediatedAlert(assetAlerts, lookbackDays = 7) {
  if (!assetAlerts || assetAlerts.length <= 1) return false;
  const sorted = [...assetAlerts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].created_at).getTime();
    const curr = new Date(sorted[i].created_at).getTime();
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diffDays <= lookbackDays) return true;
  }
  return false;
}

function isSlaGamingBunching(closureMinutes, breachThreshold = 60, gamingWindow = 10) {
  // Clustered right before SLA breach (e.g., between 50m and 59m)
  return closureMinutes >= (breachThreshold - gamingWindow) && closureMinutes < breachThreshold;
}

describe('Supervisory Defect Rules Suite (EG-01 to EG-06)', () => {
  describe('Rule EG-01: Critical Alerts Closed Unusually Quickly (<10m)', () => {
    it('should flag a critical alert closed in 3 minutes as an execution gap', () => {
      const created = '2026-10-01T10:00:00.000Z';
      const closed = '2026-10-01T10:03:00.000Z';
      assert.strictEqual(isFastClose(created, closed, 10), true);
    });

    it('should flag an alert closed in exactly 9m 59s', () => {
      const created = '2026-10-01T10:00:00.000Z';
      const closed = '2026-10-01T10:09:59.000Z';
      assert.strictEqual(isFastClose(created, closed, 10), true);
    });

    it('should not flag a normal triage investigation taking 45 minutes', () => {
      const created = '2026-10-01T10:00:00.000Z';
      const closed = '2026-10-01T10:45:00.000Z';
      assert.strictEqual(isFastClose(created, closed, 10), false);
    });

    it('should not flag alerts at exactly the 10-minute threshold boundary', () => {
      const created = '2026-10-01T10:00:00.000Z';
      const closed = '2026-10-01T10:10:00.000Z';
      assert.strictEqual(isFastClose(created, closed, 10), false);
    });

    it('should gracefully handle missing or invalid timestamps without throwing', () => {
      assert.strictEqual(isFastClose(null, '2026-10-01T10:00:00.000Z'), false);
      assert.strictEqual(isFastClose('2026-10-01T10:00:00.000Z', null), false);
      assert.strictEqual(isFastClose(undefined, undefined), false);
    });
  });

  describe('Rule EG-02: Critical Incidents Closed Without CIRT Escalation', () => {
    it('should flag a CRITICAL alert closed with null escalation ticket', () => {
      assert.strictEqual(isUnescalatedCritical('CRITICAL', null), true);
    });

    it('should flag a P1 alert closed with an empty whitespace escalation field', () => {
      assert.strictEqual(isUnescalatedCritical('P1', '   '), true);
    });

    it('should not flag a CRITICAL alert with a verified CIRT dispatch ticket', () => {
      assert.strictEqual(isUnescalatedCritical('CRITICAL', 'CIRT-INC-2026-9812'), false);
    });

    it('should not flag LOW or MEDIUM severity alerts when unescalated', () => {
      assert.strictEqual(isUnescalatedCritical('MEDIUM', null), false);
      assert.strictEqual(isUnescalatedCritical('LOW', null), false);
    });
  });

  describe('Rule EG-03: Alerts Acknowledged and Closed With Zero Forensic Steps', () => {
    it('should flag a CLOSED alert having 0 recorded investigation steps', () => {
      assert.strictEqual(hasZeroInvestigationSteps(0, 'CLOSED'), true);
    });

    it('should flag a RESOLVED_NO_ACTION alert with null steps', () => {
      assert.strictEqual(hasZeroInvestigationSteps(null, 'RESOLVED_NO_ACTION'), true);
    });

    it('should not flag an OPEN alert currently pending operator triage', () => {
      assert.strictEqual(hasZeroInvestigationSteps(0, 'IN_PROGRESS'), false);
      assert.strictEqual(hasZeroInvestigationSteps(0, 'OPEN'), false);
    });

    it('should not flag a closed alert that has verified investigative steps', () => {
      assert.strictEqual(hasZeroInvestigationSteps(4, 'CLOSED'), false);
    });
  });

  describe('Rule EG-04: Repetitive / Templated Investigation Notes', () => {
    it('should detect identical boilerplate notes with 0 distance (100% similarity)', () => {
      const note1 = 'Alert reviewed and cleared as routine system heartbeat telemetry. No malicious IOC found.';
      const note2 = 'Alert reviewed and cleared as routine system heartbeat telemetry. No malicious IOC found.';
      const distance = computeTokenFingerprintDistance(note1, note2);
      assert.strictEqual(distance, 0);
    });

    it('should detect near-identical templated notes with minor variable changes', () => {
      const note1 = 'Alert reviewed and cleared by operator 01 per standard playbook.';
      const note2 = 'Alert reviewed and cleared by operator 02 per standard playbook.';
      const distance = computeTokenFingerprintDistance(note1, note2);
      assert.ok(distance < 0.25, 'Distance between templated notes must be less than 0.25');
    });

    it('should distinguish genuinely distinct, evidence-backed forensic notes', () => {
      const note1 = 'DNS beaconing observed to C2 IP 198.51.100.44 on port 443 with anomalous jitter.';
      const note2 = 'Failed SSH brute force attempts originating from internal jumpbox bastion-01.';
      const distance = computeTokenFingerprintDistance(note1, note2);
      assert.ok(distance > 0.75, 'Distance between distinct notes must be greater than 0.75');
    });
  });

  describe('Rule EG-05: Repeat Alerts on Same Asset Without Remediation', () => {
    it('should flag an asset triggering multiple critical alerts within 7 days', () => {
      const alerts = [
        { id: 'alt-1', created_at: '2026-10-01T10:00:00Z', asset_id: 'PLC-TURBINE-01' },
        { id: 'alt-2', created_at: '2026-10-04T12:00:00Z', asset_id: 'PLC-TURBINE-01' }
      ];
      assert.strictEqual(isRepeatUnremediatedAlert(alerts, 7), true);
    });

    it('should not flag repeat alerts spaced beyond the 7-day supervisory window', () => {
      const alerts = [
        { id: 'alt-1', created_at: '2026-10-01T10:00:00Z', asset_id: 'PLC-TURBINE-01' },
        { id: 'alt-2', created_at: '2026-10-18T12:00:00Z', asset_id: 'PLC-TURBINE-01' }
      ];
      assert.strictEqual(isRepeatUnremediatedAlert(alerts, 7), false);
    });

    it('should not flag isolated single alerts on an asset', () => {
      const alerts = [{ id: 'alt-1', created_at: '2026-10-01T10:00:00Z', asset_id: 'PLC-TURBINE-01' }];
      assert.strictEqual(isRepeatUnremediatedAlert(alerts, 7), false);
    });
  });

  describe('Rule EG-06: Metric-Driven SLA Gaming Prior to 60m Cutoff', () => {
    it('should flag alerts clustered between 50 and 59 minutes to prevent SLA breach penalties', () => {
      assert.strictEqual(isSlaGamingBunching(52, 60, 10), true);
      assert.strictEqual(isSlaGamingBunching(58, 60, 10), true);
    });

    it('should not flag natural rapid triage (<15m) or breached tickets (>60m)', () => {
      assert.strictEqual(isSlaGamingBunching(15, 60, 10), false);
      assert.strictEqual(isSlaGamingBunching(65, 60, 10), false);
    });
  });
});
