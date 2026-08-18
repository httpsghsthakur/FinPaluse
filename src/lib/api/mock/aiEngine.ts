import { ChatMessage, GroundedMetric } from '../../../types';
import { StorageData } from './seed';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface AIResponseResult {
  content: string;
  groundedData?: GroundedMetric[];
  confidence?: 'High' | 'Medium' | 'Low';
  quickActions?: {
    label: string;
    action: string;
    path?: string;
  }[];
}

export function generateAICopilotResponse(
  query: string,
  data: StorageData,
  personality: 'concise' | 'balanced' | 'detailed' = 'balanced'
): AIResponseResult {
  const q = query.toLowerCase();

  // Compute live financial figures from data
  const totalChecking = data.accounts.find(a => a.type === 'checking')?.balance || 0;
  const totalSavings = data.accounts.find(a => a.type === 'savings')?.balance || 0;
  const totalCredit = data.accounts.find(a => a.type === 'credit')?.balance || 0;
  const liquidCash = totalChecking + totalSavings;
  const netWorth = liquidCash + totalCredit; // totalCredit is negative

  // Compute 30-day spending & income
  const recent30DaysTx = data.transactions.slice(0, 75);
  const totalExpense30d = Math.abs(
    recent30DaysTx.filter(t => t.amount < 0 && t.categoryId !== 'cat-transfers').reduce((acc, t) => acc + t.amount, 0)
  );
  const totalIncome30d = recent30DaysTx.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const monthlyBurn = totalExpense30d > 0 ? totalExpense30d : 4200;
  const runwayMonths = (liquidCash / monthlyBurn).toFixed(1);
  const savingsRate = totalIncome30d > 0 ? Math.max(0, ((totalIncome30d - totalExpense30d) / totalIncome30d) * 100) : 38;

  // Category breakdown
  const diningTx = recent30DaysTx.filter(t => t.categoryId === 'cat-dining');
  const diningSpend = Math.abs(diningTx.reduce((acc, t) => acc + t.amount, 0));
  const diningBudget = data.categories.find(c => c.id === 'cat-dining')?.monthlyBudget || 450;

  const groceryTx = recent30DaysTx.filter(t => t.categoryId === 'cat-groceries');
  const grocerySpend = Math.abs(groceryTx.reduce((acc, t) => acc + t.amount, 0));

  const shoppingTx = recent30DaysTx.filter(t => t.categoryId === 'cat-shopping');
  const shoppingSpend = Math.abs(shoppingTx.reduce((acc, t) => acc + t.amount, 0));

  // 1. "Can I afford" / "afford" query
  if (q.includes('afford') || q.includes('buy') || q.includes('purchase')) {
    // Extract any number from query
    const match = q.match(/\$?(\d+[\d,]*)/);
    const amountToTest = match ? parseFloat(match[1].replace(/,/g, '')) : 650;
    const postPurchaseChecking = totalChecking - amountToTest;
    const isSafe = postPurchaseChecking > 2500;

    if (personality === 'concise') {
      return {
        content: isSafe
          ? `**Yes, you can afford ${formatCurrency(amountToTest)}.** Your checking account will retain **${formatCurrency(postPurchaseChecking)}**, and your overall cash runway remains strong at **${runwayMonths} months**.`
          : `**Caution on spending ${formatCurrency(amountToTest)}.** While you have sufficient funds, this would reduce your checking cushion to **${formatCurrency(postPurchaseChecking)}**, dropping below your ideal 1-month liquid reserve ($2,500).`,
        groundedData: [
          { label: 'Proposed Purchase', value: formatCurrency(amountToTest) },
          { label: 'Current Checking', value: formatCurrency(totalChecking) },
          { label: 'Post-Purchase Buffer', value: formatCurrency(postPurchaseChecking) },
          { label: 'Liquid Runway', value: `${runwayMonths} Mo` },
        ],
        confidence: 'High',
        quickActions: [
          { label: 'Simulate in What-If', action: 'navigate', path: '/app/simulator' },
          { label: 'View Checking Balance', action: 'navigate', path: '/app/forecast' },
        ],
      };
    }

    return {
      content: `### Affordability Assessment for ${formatCurrency(amountToTest)}
Based on your real-time liquidity and automated cash-flow obligations:

1. **Checking Account Liquidity**: You currently hold **${formatCurrency(totalChecking)}** in your primary checking.
2. **Buffer After Purchase**: Deducting ${formatCurrency(amountToTest)} leaves **${formatCurrency(postPurchaseChecking)}** in liquid checking reserves.
3. **Upcoming Cash Outflows**: Over the next 14 days, you have scheduled rent and subscription debits of approximately **$2,320.00**.
4. **Recommendation**: ${
        isSafe
          ? `**Comfortable to proceed.** Your Marcus High-Yield Savings (${formatCurrency(totalSavings)}) guarantees **${runwayMonths} months of emergency runway**, so this single expense will not compromise your safety buffer.`
          : `**Exercise caution.** Consider delaying until your next paycheck on the 15th, or transferring $500 from your discretionary dining allocation.`
      }`,
      groundedData: [
        { label: 'Proposed Item', value: formatCurrency(amountToTest) },
        { label: 'Checking Balance', value: formatCurrency(totalChecking) },
        { label: 'HYSA Backup', value: formatCurrency(totalSavings) },
        { label: 'Monthly Burn Rate', value: formatCurrency(monthlyBurn) },
      ],
      confidence: 'High',
      quickActions: [
        { label: 'Simulate Purchase Impact', action: 'navigate', path: '/app/simulator' },
        { label: 'Check Upcoming Bills', action: 'navigate', path: '/app' },
      ],
    };
  }

  // 2. Spending comparison / "how is my spending"
  if (q.includes('spending') || q.includes('spent') || q.includes('dining') || q.includes('groceries') || q.includes('breakdown')) {
    const isDiningOver = diningSpend > diningBudget;
    return {
      content: `### Monthly Spending & Category Health

Here is your verified 30-day outflow breakdown across top active categories:

- **Dining & Drinks**: **${formatCurrency(diningSpend)}** (${isDiningOver ? 'Over budget by ' + formatCurrency(diningSpend - diningBudget) : 'Within limit of ' + formatCurrency(diningBudget)})
- **Groceries**: **${formatCurrency(grocerySpend)}** (Target: $650.00)
- **Shopping & Gear**: **${formatCurrency(shoppingSpend)}** (Target: $400.00)
- **Total Discretionary Burn**: **${formatCurrency(totalExpense30d)}**

${
  isDiningOver
    ? `> **AI Alert**: Dining pace is currently **${((diningSpend / diningBudget) * 100).toFixed(0)}% of your monthly budget**. We recommend swapping 2 weekend dinners for cooking to save ~$120 this month.`
    : `> **On Track**: Your overall spending pace is well within your calculated income baseline.`
}`,
      groundedData: [
        { label: '30-Day Outflows', value: formatCurrency(totalExpense30d) },
        { label: 'Dining Spend', value: formatCurrency(diningSpend) },
        { label: 'Dining Budget', value: formatCurrency(diningBudget) },
        { label: 'Savings Rate', value: formatPercent(savingsRate, false) },
      ],
      confidence: 'High',
      quickActions: [
        { label: 'Open Budgets', action: 'navigate', path: '/app/budgets' },
        { label: 'View Dining Transactions', action: 'navigate', path: '/app/transactions' },
      ],
    };
  }

  // 3. Runway / Net Worth / Cash Flow query
  if (q.includes('runway') || q.includes('net worth') || q.includes('cash flow') || q.includes('balance')) {
    return {
      content: `### Net Worth & Runway Diagnostics

- **Total Net Worth**: **${formatCurrency(netWorth)}** (+4.2% MoM)
- **Liquid Cash Reserves**: **${formatCurrency(liquidCash)}** (Checking: ${formatCurrency(totalChecking)} + Savings: ${formatCurrency(totalSavings)})
- **Credit Card Liability**: **${formatCurrency(Math.abs(totalCredit))}** (Amex Gold)
- **Calculated Cash Runway**: **${runwayMonths} months** without any new income.

Your financial cushion is in the **top tier (6+ months threshold)**. Your Marcus HYSA is compounding ~$138/month in zero-effort passive yield.`,
      groundedData: [
        { label: 'Net Worth', value: formatCurrency(netWorth) },
        { label: 'Liquid Cash', value: formatCurrency(liquidCash) },
        { label: 'Monthly Burn', value: formatCurrency(monthlyBurn) },
        { label: 'Runway', value: `${runwayMonths} Months` },
      ],
      confidence: 'High',
      quickActions: [
        { label: 'Open Cash Flow Forecast', action: 'navigate', path: '/app/forecast' },
        { label: 'Review Accounts', action: 'navigate', path: '/app/settings' },
      ],
    };
  }

  // 4. Goals / Savings query
  if (q.includes('goal') || q.includes('emergency fund') || q.includes('save') || q.includes('trip') || q.includes('house')) {
    const goalsList = data.goals.map(g => {
      const pct = ((g.currentAmount / g.targetAmount) * 100).toFixed(0);
      const remaining = g.targetAmount - g.currentAmount;
      const monthsLeft = (remaining / (g.monthlyContribution || 100)).toFixed(1);
      return `- **${g.name}**: **${formatCurrency(g.currentAmount)}** of ${formatCurrency(g.targetAmount)} (${pct}%) — ETA **~${monthsLeft} months** at ${formatCurrency(g.monthlyContribution)}/mo`;
    }).join('\n');

    return {
      content: `### Savings Goals Trajectory

Here is the progress and estimated completion timeline for your active goals:

${goalsList}

**Optimization Tip**: You can accelerate your *Tokyo Autumn Trip* goal by 3 weeks by reallocating $60 from your Subscriptions budget.`,
      groundedData: [
        { label: 'Active Goals', value: `${data.goals.length}` },
        { label: 'Total Saved for Goals', value: formatCurrency(data.goals.reduce((a, b) => a + b.currentAmount, 0)) },
        { label: 'Monthly Goal Outflows', value: formatCurrency(data.goals.reduce((a, b) => a + b.monthlyContribution, 0)) },
      ],
      confidence: 'High',
      quickActions: [
        { label: 'Manage Goals', action: 'navigate', path: '/app/goals' },
        { label: 'Adjust Contributions', action: 'navigate', path: '/app/budgets' },
      ],
    };
  }

  // 5. General fallback financial inquiry
  return {
    content: `### FinPilot AI Financial Assessment

Here is a live snapshot grounded in your connected accounts:

- **Net Worth**: **${formatCurrency(netWorth)}** across 3 linked accounts.
- **Available Liquidity**: **${formatCurrency(liquidCash)}** (${runwayMonths} months cash runway).
- **Current Savings Rate**: **${savingsRate.toFixed(1)}%** of monthly tech engineering & consulting income.
- **Immediate Attention**: Review your **Dining & Drinks** category pacing (${formatCurrency(diningSpend)} / ${formatCurrency(diningBudget)}) and confirm the recent **Apple Store** charge anomaly.

Feel free to ask me to analyze specific transactions, test a what-if scenario, or compute your goal achievement dates!`,
    groundedData: [
      { label: 'Net Worth', value: formatCurrency(netWorth) },
      { label: 'Liquid Runway', value: `${runwayMonths} Mo` },
      { label: 'Transactions Indexed', value: `${data.transactions.length}` },
      { label: 'Connected Accounts', value: `${data.accounts.length}` },
    ],
    confidence: 'High',
    quickActions: [
      { label: 'Explore What-If Simulator', action: 'navigate', path: '/app/simulator' },
      { label: 'View Insights Feed', action: 'navigate', path: '/app/insights' },
    ],
  };
}
