import { Scenario, ScenarioResult } from '../../../types';
import { StorageData } from './seed';
import { addMonths, format, subDays, parseISO, isBefore } from 'date-fns';

export function runWhatIfSimulation(scenario: Scenario, data: StorageData): ScenarioResult {
  // Baseline calculations from real account balances
  const totalChecking = data.accounts.find(a => a.type === 'checking')?.balance || 0;
  const totalSavings = data.accounts.find(a => a.type === 'savings')?.balance || 0;
  const totalCredit = data.accounts.find(a => a.type === 'credit')?.balance || 0;
  const initialLiquid = totalChecking + totalSavings;
  const initialNetWorth = initialLiquid + totalCredit;

  // ── Compute REAL base monthly income and expenses from last 30 days of transactions ──
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const recentTx = data.transactions.filter((t) => {
    const d = parseISO(t.date);
    return !isBefore(d, thirtyDaysAgo);
  });

  const baseMonthlyIncome = recentTx
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const baseMonthlyExpense = Math.abs(
    recentTx
      .filter(t => t.amount < 0 && t.categoryId !== 'cat-transfers')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const baseMonthlyNet = baseMonthlyIncome - baseMonthlyExpense;

  const baselineRunwayMonths = baseMonthlyExpense > 0
    ? Number((initialLiquid / baseMonthlyExpense).toFixed(1))
    : 999;

  // ── Apply scenario adjustments using the CORRECT delta fields ──
  // SimulatorPage sends: monthlyIncomeDelta, monthlyExpenseDelta, oneTimeExpense, monthsWithoutIncome
  const incomeDelta = scenario.monthlyIncomeDelta || 0;
  const expenseDelta = scenario.monthlyExpenseDelta || 0;

  const scenarioMonthlyIncome = baseMonthlyIncome + incomeDelta;
  const scenarioMonthlyExpense = Math.max(0, baseMonthlyExpense + expenseDelta);

  // Months without income
  const zeroIncomeMonths = scenario.monthsWithoutIncome || 0;

  // One-time expense impact
  let simLiquid = initialLiquid - scenario.oneTimeExpense;
  const scenarioRunwayMonths = scenarioMonthlyExpense > 0
    ? Number((Math.max(0, simLiquid) / scenarioMonthlyExpense).toFixed(1))
    : 999;

  // ── 12-month projections ──
  const monthlyPoints = [];
  let baseRunningNW = initialNetWorth;
  let scenRunningNW = initialNetWorth - scenario.oneTimeExpense;
  const now = new Date();

  for (let m = 0; m <= 12; m++) {
    const monthLabel = format(addMonths(now, m), 'MMM yy');
    
    if (m > 0) {
      // Baseline delta (no changes applied)
      baseRunningNW += baseMonthlyNet;

      // Scenario delta
      const effectiveIncome = m <= zeroIncomeMonths ? 0 : scenarioMonthlyIncome;
      const scenDelta = effectiveIncome - scenarioMonthlyExpense;
      scenRunningNW += scenDelta;
    }

    monthlyPoints.push({
      month: monthLabel,
      baseline: Math.round(baseRunningNW),
      scenario: Math.round(scenRunningNW),
    });
  }

  // ── Goal impacts computed from REAL goal data ──
  const goalImpacts = data.goals.map(g => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const origMonthly = g.monthlyContribution || 1;
    const origMonths = Math.ceil(remaining / origMonthly);

    // Estimate how scenario affects contribution capacity
    const scenarioNetChange = incomeDelta - expenseDelta;
    let newMonthly = origMonthly;

    // If scenario improves net cash flow, contributions can increase proportionally
    if (scenarioNetChange > 0) {
      newMonthly = origMonthly + scenarioNetChange * 0.3; // 30% of improvement goes to goals
    } else if (scenarioNetChange < 0) {
      // If scenario worsens cash flow, contributions may be reduced
      newMonthly = Math.max(100, origMonthly + scenarioNetChange * 0.3);
    }

    // Delay from one-time expense reducing available capital
    let delayPenaltyMonths = 0;
    if (scenario.oneTimeExpense > 0) {
      delayPenaltyMonths = Math.round(scenario.oneTimeExpense / (origMonthly * 3));
    }
    if (zeroIncomeMonths > 0) {
      delayPenaltyMonths += zeroIncomeMonths;
    }

    const newMonths = Math.max(1, Math.ceil(remaining / newMonthly) + delayPenaltyMonths);
    const impactMonths = newMonths - origMonths;

    const newTargetDate = format(addMonths(now, newMonths), 'MMM yyyy');

    return {
      goalId: g.id,
      goalName: g.name,
      originalMonths: origMonths,
      newMonths: newMonths,
      delayedMonths: impactMonths,
      impactMonths: impactMonths,
      newTargetDate,
    };
  });

  return {
    scenarioId: scenario.id || 'sim-active',
    baselineRunwayMonths,
    scenarioRunwayMonths,
    baselineNetWorth12m: monthlyPoints[monthlyPoints.length - 1].baseline,
    scenarioNetWorth12m: monthlyPoints[monthlyPoints.length - 1].scenario,
    monthlyPoints,
    goalImpacts,
  };
}
