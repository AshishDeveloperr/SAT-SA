import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * NCIIPC 8 Core Capability Dimensions Evaluator
 */
const NCIIPC_DIMENSIONS = [
  'ThreatDetection',
  'Investigation',
  'Escalation',
  'IncidentResponse',
  'SecurityOperations',
  'GovernanceOversight',
  'OperationalDiscipline',
  'CyberResilience'
];

function evaluateEntityCapabilities(defectCounts = {}) {
  // defectCounts maps dimension -> number of supervisory flags
  const scores = {};
  for (const dim of NCIIPC_DIMENSIONS) {
    const defects = defectCounts[dim] || 0;
    // Base 100 minus penalty per defect (up to max 100 penalty)
    scores[dim] = Math.max(0, 100 - defects * 12);
  }
  return scores;
}

function calculateCohortPercentileRank(entityScore, cohortScores) {
  if (!cohortScores || cohortScores.length === 0) return 100;
  const lowerCount = cohortScores.filter(s => s < entityScore).length;
  const equalCount = cohortScores.filter(s => s === entityScore).length;
  // Standard percentile formula: (lower + 0.5 * equal) / total * 100
  const percentile = ((lowerCount + 0.5 * equalCount) / cohortScores.length) * 100;
  return Number(percentile.toFixed(1));
}

function validateSection65BCertificate(cert) {
  if (!cert) return { valid: false, reason: 'Missing certificate' };
  if (!cert.signatory || typeof cert.signatory !== 'string' || cert.signatory.trim() === '') {
    return { valid: false, reason: 'Invalid or missing signatory' };
  }
  if (!cert.hashSha256 || !/^[a-f0-9]{64}$/i.test(cert.hashSha256)) {
    return { valid: false, reason: 'Invalid SHA-256 hash format' };
  }
  if (!cert.timestamp || isNaN(new Date(cert.timestamp).getTime())) {
    return { valid: false, reason: 'Invalid ISO timestamp' };
  }
  if (!cert.legalActReference || !cert.legalActReference.includes('Section 65B')) {
    return { valid: false, reason: 'Missing statutory Section 65B citation' };
  }
  return { valid: true };
}

describe('NCIIPC 8 Core Capability Dimensions & Supervisory Governance Suite', () => {
  describe('8 Capability Dimensions Evaluation', () => {
    it('should evaluate all 8 mandatory NCIIPC dimensions', () => {
      const evaluation = evaluateEntityCapabilities({});
      assert.strictEqual(Object.keys(evaluation).length, 8);
      for (const dim of NCIIPC_DIMENSIONS) {
        assert.strictEqual(evaluation[dim], 100, `Expected 100 for ${dim}`);
      }
    });

    it('should degrade dimension score proportionally to defect occurrences', () => {
      const evaluation = evaluateEntityCapabilities({
        ThreatDetection: 3,     // 100 - 36 = 64
        Escalation: 5,          // 100 - 60 = 40
        IncidentResponse: 10    // 100 - 120 -> clamped to 0
      });
      assert.strictEqual(evaluation.ThreatDetection, 64);
      assert.strictEqual(evaluation.Escalation, 40);
      assert.strictEqual(evaluation.IncidentResponse, 0);
      assert.strictEqual(evaluation.CyberResilience, 100);
    });

    it('should never produce negative dimension capability scores', () => {
      const evaluation = evaluateEntityCapabilities({ OperationalDiscipline: 50 });
      assert.strictEqual(evaluation.OperationalDiscipline, 0);
    });
  });

  describe('Cohort Peer Percentile Ranking Engine', () => {
    it('should score 100th percentile for the top-performing entity in cohort', () => {
      const cohort = [40, 50, 60, 70, 80];
      const rank = calculateCohortPercentileRank(90, cohort);
      assert.strictEqual(rank, 100);
    });

    it('should score around 50th percentile for median cohort performance', () => {
      const cohort = [10, 20, 30, 40, 50];
      const rank = calculateCohortPercentileRank(30, cohort);
      assert.strictEqual(rank, 50);
    });

    it('should score low percentile for bottom-quartile entity', () => {
      const cohort = [50, 60, 70, 80, 90];
      const rank = calculateCohortPercentileRank(40, cohort);
      assert.strictEqual(rank, 0);
    });

    it('should handle empty cohort safely without divide-by-zero errors', () => {
      const rank = calculateCohortPercentileRank(75, []);
      assert.strictEqual(rank, 100);
    });
  });

  describe('Section 65B Indian Evidence Act Statutory Attestation', () => {
    it('should validate valid Section 65B certificate with SHA-256 and signatory', () => {
      const cert = {
        signatory: 'Dr. V. K. Sharma, Director of Supervisory Audits',
        hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        timestamp: '2026-10-04T00:30:00.000Z',
        legalActReference: 'Indian Evidence Act Section 65B / BSA 2023 Section 63'
      };
      const result = validateSection65BCertificate(cert);
      assert.strictEqual(result.valid, true);
    });

    it('should reject certificate missing signatory name', () => {
      const cert = {
        signatory: '',
        hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        timestamp: '2026-10-04T00:30:00.000Z',
        legalActReference: 'Indian Evidence Act Section 65B'
      };
      const result = validateSection65BCertificate(cert);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.reason, 'Invalid or missing signatory');
    });

    it('should reject certificate with malformed or non-64-char SHA-256 hash', () => {
      const cert = {
        signatory: 'Supervisory Officer',
        hashSha256: 'bad_hash_xyz',
        timestamp: '2026-10-04T00:30:00.000Z',
        legalActReference: 'Indian Evidence Act Section 65B'
      };
      const result = validateSection65BCertificate(cert);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.reason, 'Invalid SHA-256 hash format');
    });

    it('should reject certificate with missing statutory legal reference', () => {
      const cert = {
        signatory: 'Supervisory Officer',
        hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        timestamp: '2026-10-04T00:30:00.000Z',
        legalActReference: 'Standard Internal Memo'
      };
      const result = validateSection65BCertificate(cert);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.reason, 'Missing statutory Section 65B citation');
    });
  });
});
