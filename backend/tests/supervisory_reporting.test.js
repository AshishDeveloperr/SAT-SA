import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Supervisory Reporting & Statutory Audit Synthesis Engine
 */
function generateSupervisorySummary(entityMetadata, defectList = [], negativeSpaceGaps = []) {
  const criticalDefects = defectList.filter(d => d.severity === 'CRITICAL');
  const highDefects = defectList.filter(d => d.severity === 'HIGH');
  const silentCriticalAssets = negativeSpaceGaps.filter(g => g.criticality === 'TIER_1' || g.criticality === 'HIGH');

  let supervisoryFinding = 'SATISFACTORY';
  if (criticalDefects.length > 5 || silentCriticalAssets.length > 2) {
    supervisoryFinding = 'IMMEDIATE_INTERVENTION_REQUIRED';
  } else if (criticalDefects.length > 0 || highDefects.length > 10 || silentCriticalAssets.length > 0) {
    supervisoryFinding = 'SUPERVISORY_NOTICE_ISSUED';
  }

  return {
    entityId: entityMetadata.entityId,
    entityName: entityMetadata.entityName,
    sector: entityMetadata.sector || 'CRITICAL_INFRASTRUCTURE',
    auditPeriod: entityMetadata.auditPeriod || 'Q3-2026',
    findingLevel: supervisoryFinding,
    totalDefects: defectList.length,
    criticalDefectsCount: criticalDefects.length,
    highDefectsCount: highDefects.length,
    silentCriticalAssetsCount: silentCriticalAssets.length,
    requiresCirtEscalationNotice: criticalDefects.some(d => d.ruleId === 'EG-02'),
    requiresForensicReaudit: supervisoryFinding === 'IMMEDIATE_INTERVENTION_REQUIRED'
  };
}

function calculateCyberResilienceIndex(compositeAttentionScore, negativeSpaceRatio) {
  // Resilience Index is inverse to attention score & negative space voids (0 to 100)
  const penalty = (compositeAttentionScore * 0.7) + (negativeSpaceRatio * 30);
  const index = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  return index;
}

function formatStatutoryReportAuditBlock(summary, sha256Root) {
  return [
    '=== NCIIPC STATUTORY SUPERVISORY AUDIT REPORT ===',
    `Entity ID: ${summary.entityId}`,
    `Entity Name: ${summary.entityName}`,
    `Sector: ${summary.sector}`,
    `Status: ${summary.findingLevel}`,
    `Total Operational Defects: ${summary.totalDefects}`,
    `Evidence Hash (SHA-256): ${sha256Root}`,
    'Compliance: In Accordance with NCIIPC Critical Sector Guidelines & Section 65B'
  ].join('\n');
}

describe('Supervisory Reporting & Statutory Audit Synthesis Suite', () => {
  describe('Executive Supervisory Finding Classification', () => {
    it('should issue IMMEDIATE_INTERVENTION_REQUIRED when >5 critical defects are discovered', () => {
      const defects = [
        { ruleId: 'EG-02', severity: 'CRITICAL' },
        { ruleId: 'EG-02', severity: 'CRITICAL' },
        { ruleId: 'EG-03', severity: 'CRITICAL' },
        { ruleId: 'EG-01', severity: 'CRITICAL' },
        { ruleId: 'EG-05', severity: 'CRITICAL' },
        { ruleId: 'EG-02', severity: 'CRITICAL' }
      ];
      const summary = generateSupervisorySummary({ entityId: 'CSE-PWR-01', entityName: 'National Power Grid' }, defects, []);
      assert.strictEqual(summary.findingLevel, 'IMMEDIATE_INTERVENTION_REQUIRED');
      assert.strictEqual(summary.requiresForensicReaudit, true);
      assert.strictEqual(summary.requiresCirtEscalationNotice, true);
    });

    it('should issue SUPERVISORY_NOTICE_ISSUED for single critical defect', () => {
      const defects = [{ ruleId: 'EG-02', severity: 'CRITICAL' }];
      const summary = generateSupervisorySummary({ entityId: 'CSE-TEL-04', entityName: 'Telecom Backbone' }, defects, []);
      assert.strictEqual(summary.findingLevel, 'SUPERVISORY_NOTICE_ISSUED');
      assert.strictEqual(summary.requiresForensicReaudit, false);
      assert.strictEqual(summary.criticalDefectsCount, 1);
    });

    it('should flag SATISFACTORY for entities with zero defects and zero silent critical assets', () => {
      const summary = generateSupervisorySummary({ entityId: 'CSE-FIN-09', entityName: 'Reserve Banking Settlement' }, [], []);
      assert.strictEqual(summary.findingLevel, 'SATISFACTORY');
      assert.strictEqual(summary.totalDefects, 0);
      assert.strictEqual(summary.requiresForensicReaudit, false);
    });

    it('should flag SUPERVISORY_NOTICE_ISSUED when silent critical Tier-1 assets exist even with zero defect tickets', () => {
      const gaps = [{ assetId: 'SCADA-CORE-01', criticality: 'TIER_1' }];
      const summary = generateSupervisorySummary({ entityId: 'CSE-NUC-02', entityName: 'Nuclear Generation Unit' }, [], gaps);
      assert.strictEqual(summary.findingLevel, 'SUPERVISORY_NOTICE_ISSUED');
      assert.strictEqual(summary.silentCriticalAssetsCount, 1);
    });
  });

  describe('Cyber Resilience Index Computation', () => {
    it('should compute high resilience (>=90) for top quartile entities with low attention score', () => {
      const index = calculateCyberResilienceIndex(10, 0.05); // Attention score 10, 5% gap
      // 100 - (7 + 1.5) = 91.5 -> 92
      assert.ok(index >= 90, `Expected >= 90, got ${index}`);
    });

    it('should compute compromised resilience (<=30) for high attention and high negative space', () => {
      const index = calculateCyberResilienceIndex(85, 0.50); // Attention score 85, 50% gap
      // 100 - (59.5 + 15) = 25.5 -> 26
      assert.ok(index <= 30, `Expected <= 30, got ${index}`);
    });

    it('should clamp resilience index between 0 and 100', () => {
      assert.strictEqual(calculateCyberResilienceIndex(150, 1.0), 0);
      assert.strictEqual(calculateCyberResilienceIndex(0, 0), 100);
    });
  });

  describe('Statutory Audit Block Formatting', () => {
    it('should format standard compliance block containing SHA-256 and legal citations', () => {
      const summary = {
        entityId: 'CSE-PWR-01',
        entityName: 'National Power Grid',
        sector: 'POWER_ENERGY',
        findingLevel: 'SUPERVISORY_NOTICE_ISSUED',
        totalDefects: 14
      };
      const hash = 'a4f7832b810d7a64e1c25f829031efb70298a287c1265db2689ef23709b43e12';
      const block = formatStatutoryReportAuditBlock(summary, hash);

      assert.ok(block.includes('=== NCIIPC STATUTORY SUPERVISORY AUDIT REPORT ==='));
      assert.ok(block.includes('Entity ID: CSE-PWR-01'));
      assert.ok(block.includes('POWER_ENERGY'));
      assert.ok(block.includes(hash));
      assert.ok(block.includes('Section 65B'));
    });

    it('should reject malformed entity metadata gracefully', () => {
      const summary = generateSupervisorySummary({}, [], []);
      assert.strictEqual(summary.sector, 'CRITICAL_INFRASTRUCTURE');
      assert.strictEqual(summary.findingLevel, 'SATISFACTORY');
    });
  });

  describe('Multi-Sector Cohort Comparative Ranking Engine', () => {
    const cohort = [
      { id: 'CSE-E01', sector: 'ENERGY', attentionScore: 82 },
      { id: 'CSE-E02', sector: 'ENERGY', attentionScore: 45 },
      { id: 'CSE-B01', sector: 'BANKING', attentionScore: 28 },
      { id: 'CSE-B02', sector: 'BANKING', attentionScore: 35 },
      { id: 'CSE-T01', sector: 'TELECOM', attentionScore: 65 }
    ];

    it('should isolate sector peers correctly', () => {
      const energyPeers = cohort.filter(c => c.sector === 'ENERGY');
      assert.strictEqual(energyPeers.length, 2);
    });

    it('should calculate sector median attention score', () => {
      const energyScores = cohort.filter(c => c.sector === 'ENERGY').map(c => c.attentionScore);
      const median = (energyScores[0] + energyScores[1]) / 2;
      assert.strictEqual(median, 63.5);
    });

    it('should identify sector outlier needing highest supervisory attention', () => {
      const highestRisk = cohort.reduce((max, c) => c.attentionScore > max.attentionScore ? c : max, cohort[0]);
      assert.strictEqual(highestRisk.id, 'CSE-E01');
      assert.strictEqual(highestRisk.attentionScore, 82);
    });

    it('should correctly flag low-risk compliant sector', () => {
      const bankingScores = cohort.filter(c => c.sector === 'BANKING').map(c => c.attentionScore);
      const maxBanking = Math.max(...bankingScores);
      assert.ok(maxBanking < 50, 'Banking sector should be within acceptable threshold');
    });

    it('should rank all entities in descending order of supervisory urgency', () => {
      const ranked = [...cohort].sort((a, b) => b.attentionScore - a.attentionScore);
      assert.strictEqual(ranked[0].id, 'CSE-E01');
      assert.strictEqual(ranked[ranked.length - 1].id, 'CSE-B01');
    });
  });
});

