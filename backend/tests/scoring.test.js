import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Scoring functions mirroring the supervisory analytics engine
 */
function computeCompositeAttentionScore(dimensionScores, weights = {}) {
  // 8 Dimensions default weights sum to 1.0
  const defaultWeights = {
    IncidentResponse: 0.18,
    EscalationProtocols: 0.16,
    OperationalDiscipline: 0.15,
    ThreatDetection: 0.14,
    InvestigationQuality: 0.14,
    CyberResilience: 0.10,
    GovernanceOversight: 0.08,
    SecurityOperations: 0.05
  };
  const activeWeights = { ...defaultWeights, ...weights };
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [dim, weight] of Object.entries(activeWeights)) {
    const rawVal = dimensionScores[dim] ?? 50; // 50 = neutral baseline
    const score = Math.min(100, Math.max(0, rawVal));
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 50;
  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

function getRiskTier(score) {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

function computeExecutionDivergenceGap(reportedHeadlineSla, evidenceQualityScore) {
  // Divergence = Reported Paper SLA (%) - Evidence Quality Score (0-100)
  const gap = reportedHeadlineSla - evidenceQualityScore;
  return Math.max(0, Number(gap.toFixed(1)));
}

function computeCohortMedian(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

describe('Supervisory Scoring & Peer Benchmarking Suite', () => {
  describe('Composite Attention Score Formula (0–100 Bounded)', () => {
    it('should compute high attention score (>70) when critical dimensions are compromised', () => {
      const dimensionScores = {
        IncidentResponse: 85,
        EscalationProtocols: 90,
        OperationalDiscipline: 80,
        ThreatDetection: 75,
        InvestigationQuality: 82,
        CyberResilience: 70,
        GovernanceOversight: 65,
        SecurityOperations: 60
      };
      const score = computeCompositeAttentionScore(dimensionScores);
      assert.ok(score >= 75, `Expected >= 75, got ${score}`);
      assert.strictEqual(getRiskTier(score), 'CRITICAL');
    });

    it('should compute low attention score (<25) for disciplined, well-operated SOCs', () => {
      const dimensionScores = {
        IncidentResponse: 15,
        EscalationProtocols: 10,
        OperationalDiscipline: 12,
        ThreatDetection: 18,
        InvestigationQuality: 14,
        CyberResilience: 20,
        GovernanceOversight: 15,
        SecurityOperations: 10
      };
      const score = computeCompositeAttentionScore(dimensionScores);
      assert.ok(score < 25, `Expected < 25, got ${score}`);
      assert.strictEqual(getRiskTier(score), 'LOW');
    });

    it('should strictly clamp scores within 0 to 100 boundaries', () => {
      const extremeHigh = {
        IncidentResponse: 200,
        EscalationProtocols: 150,
        OperationalDiscipline: 120,
        ThreatDetection: 110,
        InvestigationQuality: 130,
        CyberResilience: 105,
        GovernanceOversight: 100,
        SecurityOperations: 100
      };
      assert.strictEqual(computeCompositeAttentionScore(extremeHigh), 100);

      const extremeLow = {
        IncidentResponse: -50,
        EscalationProtocols: -10,
        OperationalDiscipline: 0,
        ThreatDetection: -5,
        InvestigationQuality: 0,
        CyberResilience: 0,
        GovernanceOversight: 0,
        SecurityOperations: 0
      };
      assert.strictEqual(computeCompositeAttentionScore(extremeLow), 0);
    });
  });

  describe('Execution Divergence Gap Metric', () => {
    it('should calculate divergence exposing paper metric gaming (+53.5 pts to +95 pts)', () => {
      const headlineSla = 99.5; // Reported 99.5% on paper
      const evidenceQuality = 46.0; // Actual forensic evidence score
      const gap = computeExecutionDivergenceGap(headlineSla, evidenceQuality);
      assert.strictEqual(gap, 53.5);
    });

    it('should report 0 gap when evidence quality matches or exceeds reported metrics', () => {
      assert.strictEqual(computeExecutionDivergenceGap(95.0, 98.0), 0);
    });
  });

  describe('Cross-Entity Peer Median Calculation', () => {
    it('should accurately compute median for odd-length peer cohorts', () => {
      assert.strictEqual(computeCohortMedian([12, 45, 88]), 45);
    });

    it('should accurately compute average of middle two for even-length cohorts', () => {
      assert.strictEqual(computeCohortMedian([10, 20, 40, 80]), 30);
    });

    it('should handle unsorted cohort input arrays', () => {
      assert.strictEqual(computeCohortMedian([88, 12, 45]), 45);
    });
  });
});
