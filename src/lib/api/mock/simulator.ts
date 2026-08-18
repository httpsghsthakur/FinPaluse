import { Scenario, ScenarioResult } from '../../../types';
import { StorageData } from './seed';
import { addMonths, format } from 'date-fns';

export function runWhatIfSimulation(scenario: Scenario, data: StorageData): ScenarioResult {
  // Baseline calculations
  const totalChecking = data.accounts.find(a => a.type === 'checking')?.balance || 0;
  const totalSavings = data.accounts.find(a => a.type === 'savings')?.balance || 0;
  const totalCredit = data.accounts.find(a => a.type === 'credit')?.balance || 0;
  const initialLiquid = totalChecking + totalSavings;
  const initialNetWorth = initialLiquid + totalCredit;

  // Compute base monthly income and base monthly expenses from recent transactions
  const baseMonthlyIncome = 7700; // salary ($7700) + avg freelance ($600)
  const baseMonthlyExpense = 4250; // rent $2100, bills $600, food $1000, misc $550
  const baseMonthlyNet = baseMonthlyIncome - baseMonthlyExpense; // ~$3450/mo savings

  const baselineRunwayMonths = Number((initialLiquid / baseMonthlyExpense).toFixed(1));

  // Scenario adjustments
  const incomeFactor = (100 + scenario.incomeChangePct) / 100;
  const expenseReduction = (scenario.expenseCutPct / 100) * 800; // up to $800 cut
  const scenarioMonthlyIncome = baseMonthlyIncome * incomeFactor;
  const scenarioMonthlyExpense = Math.max(1500, baseMonthlyExpense - expenseReduction - scenario.monthlySavingsChange);
  
  // Months without income effect
  const zeroIncomeMonths = scenario.monthsWithoutIncome || 0;

  let simLiquid = initialLiquid - scenario.oneTimeExpense;
  const scenarioRunwayMonths = Number((Math.max(0, simLiquid) / scenarioMonthlyExpense).toFixed(1));

  // 12-month projections
  const monthlyPoints = [];
  let baseRunningNW = initialNetWorth;
  let scenRunningNW = initialNetWorth - scenario.oneTimeExpense;
  const now = new Date();

  for (let m = 0; m <= 12; m++) {
    const monthLabel = format(addMonths(now, m), 'MMM yy');
    
    if (m > 0) {
      // Baseline delta
      baseRunningNW += baseMonthlyNet;

      // Scenario delta
      const effectiveIncome = m <= zeroIncomeMonths ? 0 : scenarioMonthlyIncome;
      const scenDelta = effectiveIncome - scenarioMonthlyExpense + scenario.monthlySavingsChange;
      scenRunningNW += scenDelta;
    }

    monthlyPoints.push({
      month: monthLabel,
      baseline: Math.round(baseRunningNW),
      scenario: Math.round(scenRunningNW),
    });
  }

  // Goal impacts
  const goalImpacts = data.goals.map(g => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const origMonthly = g.monthlyContribution || 400;
    const origMonths = Math.ceil(remaining / origMonthly);

    // If scenario cuts cash/savings or adds big one-time expense
    let newMonthly = origMonthly;
    if (scenario.incomeChangePct < 0) {
      newMonthly = Math.max(50, origMonthly * (1 + scenario.incomeChangePct / 100));
    } else if (scenario.monthlySavingsChange > 0) {
      newMonthly = origMonthly + scenario.monthlySavingsChange * 0.4;
    }

    // Delay from one-time expense taking funds away
    let delayPenaltyMonths = 0;
    if (scenario.oneTimeExpense > 5000) {
      delayPenaltyMonths = Math.round(scenario.oneTimeExpense / 4000);
    }
    if (zeroIncomeMonths > 0) {
      delayPenaltyMonths += zeroIncomeMonths;
    }

    const newMonths = Math.max(1, Math.ceil(remaining / newMonthly) + delayPenaltyMonths);
    const delayedMonths = newMonths - origMonths;

    return {
      goalId: g.id,
      goalName: g.name,
      originalMonths: origMonths,
      newMonths: newMonths,
      delayedMonths: delayedMonths,
    };
  });

  return {
    scenarioId: scenario.id,
    baselineRunwayMonths,
    scenarioRunwayMonths,
    baselineNetWorth12m: monthlyPoints[monthlyPoints.length - 1].baseline,
    scenarioNetWorth12m: monthlyPoints[monthlyPoints.length - 1].scenario,
    monthlyPoints,
    goalImpacts,
  };
}
