import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure functions mirroring Negative Space reasoning in SAT-SA
 */
function evaluateSilentAsset(asset, referenceDate = new Date('2026-10-04T00:00:00Z'), thresholdDays = 14) {
  if (!asset || !asset.last_seen) {
    return { isSilent: true, daysSilent: 999, status: 'BLIND_SPOT' };
  }
  const diffMs = referenceDate.getTime() - new Date(asset.last_seen).getTime();
  const daysSilent = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const isSilent = daysSilent > thresholdDays;
  return {
    isSilent,
    daysSilent,
    status: isSilent ? 'BLIND_SPOT' : 'ACTIVE_TELEMETRY'
  };
}

function calculateCategoryVoid(observedCategories, expectedCategory) {
  const count = (observedCategories || []).filter(c => 
    String(c).toLowerCase().trim() === String(expectedCategory).toLowerCase().trim()
  ).length;
  return count === 0;
}

function computeNegativeSpaceRiskScore(silentAssets) {
  if (!silentAssets || silentAssets.length === 0) return 0;
  let totalScore = 0;
  for (const ast of silentAssets) {
    const weight = (ast.criticality || 3) * 15;
    totalScore += weight;
  }
  return Math.min(100, totalScore);
}

describe('Negative Space & Supervisory Void Engine Suite', () => {
  describe('Rule NS-01: Critical Systems Without Telemetry (>14 Days)', () => {
    it('should flag a Tier-1 SCADA node silent for 22 days as a BLIND_SPOT', () => {
      const asset = {
        external_id: 'PLC-TURBINE-01',
        name: 'Turbine Speed Governor PLC',
        criticality: 5,
        last_seen: '2026-09-12T00:00:00Z'
      };
      const res = evaluateSilentAsset(asset, new Date('2026-10-04T00:00:00Z'), 14);
      assert.strictEqual(res.isSilent, true);
      assert.strictEqual(res.daysSilent, 22);
      assert.strictEqual(res.status, 'BLIND_SPOT');
    });

    it('should not flag an active SCADA server seen 2 days ago', () => {
      const asset = {
        external_id: 'EMS-SCADA-CORE-01',
        name: 'Energy Management System Core',
        criticality: 5,
        last_seen: '2026-10-02T00:00:00Z'
      };
      const res = evaluateSilentAsset(asset, new Date('2026-10-04T00:00:00Z'), 14);
      assert.strictEqual(res.isSilent, false);
      assert.strictEqual(res.daysSilent, 2);
      assert.strictEqual(res.status, 'ACTIVE_TELEMETRY');
    });

    it('should treat an asset with null last_seen as completely unobserved (maximum blind spot)', () => {
      const asset = { external_id: 'BACKUP-RTU-09', criticality: 4, last_seen: null };
      const res = evaluateSilentAsset(asset, new Date('2026-10-04T00:00:00Z'), 14);
      assert.strictEqual(res.isSilent, true);
      assert.strictEqual(res.status, 'BLIND_SPOT');
    });

    it('should respect custom regulatory threshold windows (e.g. strict 7-day cutoff)', () => {
      const asset = { external_id: 'SUBSTATION-GATEWAY', last_seen: '2026-09-25T00:00:00Z' };
      const res = evaluateSilentAsset(asset, new Date('2026-10-04T00:00:00Z'), 7);
      assert.strictEqual(res.isSilent, true);
    });
  });

  describe('Expected vs. Observed Category Voids', () => {
    it('should detect when zero Phishing or Credential Theft alerts exist in a financial sector cohort', () => {
      const observed = ['Port Scan', 'Malware Beacon', 'Unauthorized USB Insertion'];
      const isPhishingVoid = calculateCategoryVoid(observed, 'Phishing Credential Harvester');
      assert.strictEqual(isPhishingVoid, true);
    });

    it('should pass when expected telemetry categories are observed', () => {
      const observed = ['Phishing Credential Harvester', 'Port Scan', 'DDoS Threshold Exceeded'];
      const isPhishingVoid = calculateCategoryVoid(observed, 'Phishing Credential Harvester');
      assert.strictEqual(isPhishingVoid, false);
    });
  });

  describe('Negative Space Composite Scoring', () => {
    it('should compute weighted severity based on silent asset criticality', () => {
      const silentAssets = [
        { external_id: 'SCADA-1', criticality: 5 }, // 75
        { external_id: 'PLC-1', criticality: 4 }     // 60
      ];
      const score = computeNegativeSpaceRiskScore(silentAssets);
      assert.strictEqual(score, 100); // capped at 100
    });

    it('should return 0 when zero silent assets are present in the enclave', () => {
      assert.strictEqual(computeNegativeSpaceRiskScore([]), 0);
    });
  });
});
