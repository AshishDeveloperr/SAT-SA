import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Knapsack Portfolio Optimizer implementation
 */
function buildKnapsackReviewPortfolio(candidateAlerts, budget = 20, priorityRatio = 0.85) {
  if (!candidateAlerts || candidateAlerts.length === 0) return [];

  const targetPriorityCount = Math.round(budget * priorityRatio); // e.g. 17 out of 20
  const targetExploreCount = budget - targetPriorityCount;         // e.g. 3 out of 20

  const priorityCandidates = candidateAlerts
    .filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH' || a.hasDefect)
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  const exploreCandidates = candidateAlerts
    .filter(a => a.severity === 'MEDIUM' || a.severity === 'LOW' || !a.hasDefect);

  const selectedPriority = priorityCandidates.slice(0, targetPriorityCount).map(a => ({
    ...a,
    strategy: 'priority'
  }));

  const selectedExplore = exploreCandidates.slice(0, targetExploreCount).map(a => ({
    ...a,
    strategy: 'exploration'
  }));

  const portfolio = [...selectedPriority, ...selectedExplore];

  // If priority pool was smaller than target, backfill from exploration to fill budget
  if (portfolio.length < budget) {
    const remaining = candidateAlerts
      .filter(a => !portfolio.some(p => p.id === a.id))
      .slice(0, budget - portfolio.length)
      .map(a => ({ ...a, strategy: 'exploration' }));
    portfolio.push(...remaining);
  }

  return portfolio.slice(0, budget);
}

describe('Submodular Knapsack Review Optimizer Suite', () => {
  it('should allocate 85% high-risk priority targets and 15% exploration quota for a budget of 20', () => {
    const alerts = [];
    for (let i = 1; i <= 30; i++) {
      alerts.push({ id: `alt-crit-${i}`, severity: 'CRITICAL', priorityScore: 90 + (i % 10), hasDefect: true });
    }
    for (let i = 1; i <= 20; i++) {
      alerts.push({ id: `alt-norm-${i}`, severity: 'LOW', priorityScore: 20, hasDefect: false });
    }

    const portfolio = buildKnapsackReviewPortfolio(alerts, 20, 0.85);
    assert.strictEqual(portfolio.length, 20);

    const priorityCount = portfolio.filter(p => p.strategy === 'priority').length;
    const exploreCount = portfolio.filter(p => p.strategy === 'exploration').length;

    assert.strictEqual(priorityCount, 17, 'Priority target count must be exactly 17 (85%)');
    assert.strictEqual(exploreCount, 3, 'Exploration quota count must be exactly 3 (15%)');
  });

  it('should rank priority candidates strictly by descending risk score', () => {
    const alerts = [
      { id: 'alt-1', severity: 'HIGH', priorityScore: 82, hasDefect: true },
      { id: 'alt-2', severity: 'CRITICAL', priorityScore: 98, hasDefect: true },
      { id: 'alt-3', severity: 'HIGH', priorityScore: 89, hasDefect: true },
      { id: 'alt-4', severity: 'LOW', priorityScore: 10, hasDefect: false }
    ];

    const portfolio = buildKnapsackReviewPortfolio(alerts, 3, 0.85);
    const priorityItems = portfolio.filter(p => p.strategy === 'priority');
    assert.strictEqual(priorityItems[0].id, 'alt-2', 'Highest priority score (98) must be first');
    assert.strictEqual(priorityItems[1].id, 'alt-3', 'Second highest priority score (89) must be second');
  });

  it('should backfill exploration items if high-severity alerts are fewer than the 85% quota', () => {
    const alerts = [
      { id: 'alt-crit-1', severity: 'CRITICAL', priorityScore: 95, hasDefect: true },
      { id: 'alt-norm-1', severity: 'LOW', priorityScore: 20, hasDefect: false },
      { id: 'alt-norm-2', severity: 'LOW', priorityScore: 20, hasDefect: false },
      { id: 'alt-norm-3', severity: 'LOW', priorityScore: 20, hasDefect: false }
    ];

    const portfolio = buildKnapsackReviewPortfolio(alerts, 4, 0.85);
    assert.strictEqual(portfolio.length, 4);
    assert.strictEqual(portfolio.filter(p => p.strategy === 'priority').length, 1);
    assert.strictEqual(portfolio.filter(p => p.strategy === 'exploration').length, 3);
  });
});
