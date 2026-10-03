import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * KPI Gaming & Goodhart's Law Behavioral Detection Engine
 */
function detectGoodhartsLawPattern(reportedSla, forensicDepthScore, thresholdDivergence = 30) {
  const divergence = reportedSla - forensicDepthScore;
  return {
    isGamingDetected: divergence >= thresholdDivergence,
    divergenceGap: Math.max(0, Number(divergence.toFixed(1))),
    riskSeverity: divergence >= 50 ? 'CRITICAL' : divergence >= 30 ? 'HIGH' : 'LOW'
  };
}

function detectMttaSuppression(acknowledgementTimesInMinutes, autoAckThresholdMinutes = 1.0) {
  // If >80% of alerts are acknowledged in < 60 seconds by automated scripts without human triage
  if (!acknowledgementTimesInMinutes || acknowledgementTimesInMinutes.length === 0) {
    return { isSuppressed: false, automatedRatio: 0 };
  }
  const autoAcks = acknowledgementTimesInMinutes.filter(t => t <= autoAckThresholdMinutes);
  const ratio = autoAcks.length / acknowledgementTimesInMinutes.length;
  return {
    isSuppressed: ratio >= 0.8,
    automatedRatio: Number(ratio.toFixed(2)),
    sampleCount: acknowledgementTimesInMinutes.length
  };
}

function detectMttrClustering(closeDurationsMinutes, slaLimitMinutes = 60, gamingWindowStartMinutes = 50) {
  // Checks if anomalous fraction of tickets close right before SLA expiration
  if (!closeDurationsMinutes || closeDurationsMinutes.length === 0) {
    return { isClusterDetected: false, clusteringRatio: 0 };
  }
  const clustered = closeDurationsMinutes.filter(t => t >= gamingWindowStartMinutes && t < slaLimitMinutes);
  const clusteringRatio = clustered.length / closeDurationsMinutes.length;
  return {
    isClusterDetected: clusteringRatio >= 0.35, // 35%+ closing in the final 10-minute window
    clusteringRatio: Number(clusteringRatio.toFixed(2)),
    clusteredCount: clustered.length
  };
}

function calculateForensicInvestigationDepth(steps, noteWordCount, artifactCount) {
  let score = 0;
  // Steps weight (up to 40 pts)
  score += Math.min(40, steps * 10);
  // Word count weight (up to 40 pts)
  if (noteWordCount > 50) score += 40;
  else if (noteWordCount > 20) score += 25;
  else if (noteWordCount > 5) score += 10;
  // Evidence Artifact attachments (up to 20 pts)
  score += Math.min(20, artifactCount * 10);
  return Math.min(100, score);
}

describe('KPI Gaming & Behavioral Distortion Detection Suite', () => {
  describe('Goodhart’s Law Divergence Detection', () => {
    it('should flag severe divergence when paper SLA is 99% but forensic depth is 20%', () => {
      const result = detectGoodhartsLawPattern(99.0, 20.0);
      assert.strictEqual(result.isGamingDetected, true);
      assert.strictEqual(result.riskSeverity, 'CRITICAL');
      assert.strictEqual(result.divergenceGap, 79.0);
    });

    it('should flag moderate divergence when gap is between 30 and 50 points', () => {
      const result = detectGoodhartsLawPattern(95.0, 60.0);
      assert.strictEqual(result.isGamingDetected, true);
      assert.strictEqual(result.riskSeverity, 'HIGH');
      assert.strictEqual(result.divergenceGap, 35.0);
    });

    it('should not flag divergence when reported metrics match deep forensic evidence', () => {
      const result = detectGoodhartsLawPattern(92.0, 88.0);
      assert.strictEqual(result.isGamingDetected, false);
      assert.strictEqual(result.riskSeverity, 'LOW');
    });

    it('should not produce negative divergence when evidence exceeds nominal SLA target', () => {
      const result = detectGoodhartsLawPattern(85.0, 95.0);
      assert.strictEqual(result.isGamingDetected, false);
      assert.strictEqual(result.divergenceGap, 0);
    });
  });

  describe('MTTA (Mean Time to Acknowledge) Artificial Suppression', () => {
    it('should flag bot auto-acknowledgement gaming when >80% alerts acked under 60 seconds', () => {
      const ackTimes = [0.1, 0.2, 0.1, 0.4, 0.3, 0.2, 0.5, 0.2, 5.0, 12.0]; // 8/10 < 1 min
      const result = detectMttaSuppression(ackTimes);
      assert.strictEqual(result.isSuppressed, true);
      assert.strictEqual(result.automatedRatio, 0.8);
      assert.strictEqual(result.sampleCount, 10);
    });

    it('should not flag genuine human triage with distributed acknowledgement times', () => {
      const ackTimes = [2.5, 5.1, 8.0, 1.2, 4.3, 15.0, 7.2, 0.5, 9.1, 3.4]; // 1/10 < 1 min
      const result = detectMttaSuppression(ackTimes);
      assert.strictEqual(result.isSuppressed, false);
      assert.strictEqual(result.automatedRatio, 0.1);
    });

    it('should safely handle empty acknowledgement sample arrays', () => {
      const result = detectMttaSuppression([]);
      assert.strictEqual(result.isSuppressed, false);
      assert.strictEqual(result.automatedRatio, 0);
    });
  });

  describe('MTTR (Mean Time to Resolve) Pre-Cutoff SLA Gaming', () => {
    it('should detect bunching right before 60-minute SLA breach penalty', () => {
      // 5 out of 10 tickets closed between 52m and 58m
      const closeTimes = [15, 20, 52, 55, 57, 58, 59, 72, 85, 90]; // 5/10 = 50%
      const result = detectMttrClustering(closeTimes, 60, 50);
      assert.strictEqual(result.isClusterDetected, true);
      assert.strictEqual(result.clusteringRatio, 0.5);
      assert.strictEqual(result.clusteredCount, 5);
    });

    it('should not flag normally distributed resolution durations', () => {
      const closeTimes = [10, 15, 25, 30, 40, 65, 80, 120, 140, 180]; // 0/10 in 50-60m window
      const result = detectMttrClustering(closeTimes, 60, 50);
      assert.strictEqual(result.isClusterDetected, false);
      assert.strictEqual(result.clusteringRatio, 0);
    });
  });

  describe('Forensic Investigation Depth Score Calculator', () => {
    it('should score 100 for comprehensive investigation with steps, thorough notes, and artifacts', () => {
      const score = calculateForensicInvestigationDepth(4, 85, 2);
      assert.strictEqual(score, 100);
    });

    it('should score zero for closed alerts with 0 steps, empty notes, and 0 artifacts', () => {
      const score = calculateForensicInvestigationDepth(0, 0, 0);
      assert.strictEqual(score, 0);
    });

    it('should cap depth score strictly at 100 even with excessive steps or words', () => {
      const score = calculateForensicInvestigationDepth(20, 500, 10);
      assert.strictEqual(score, 100);
    });

    it('should assign partial score for minimal checklist acknowledgment', () => {
      const score = calculateForensicInvestigationDepth(1, 10, 0);
      // 1 step (10) + 10 words (10) + 0 artifacts = 20
      assert.strictEqual(score, 20);
    });
  });
});
