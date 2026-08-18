import { Account, Category, Goal, Transaction, Insight } from '../../../types';
import { format, subDays, addDays, subMonths } from 'date-fns';

export interface StorageData {
  accounts: Account[];
  categories: Category[];
  goals: Goal[];
  transactions: Transaction[];
  insights: Insight[];
}

const STORAGE_KEY = 'finpilot_data_v2';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-income', name: 'Income', icon: 'Wallet', color: '#10B981', type: 'income', monthlyBudget: 0, isSystem: true },
  { id: 'cat-housing', name: 'Housing & Rent', icon: 'Home', color: '#6366F1', type: 'expense', monthlyBudget: 2200, isSystem: true },
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingBag', color: '#3B82F6', type: 'expense', monthlyBudget: 650, isSystem: true },
  { id: 'cat-dining', name: 'Dining & Drinks', icon: 'Utensils', color: '#F59E0B', type: 'expense', monthlyBudget: 450, isSystem: true },
  { id: 'cat-transport', name: 'Transport & Auto', icon: 'Car', color: '#EC4899', type: 'expense', monthlyBudget: 280, isSystem: true },
  { id: 'cat-utilities', name: 'Utilities & Bills', icon: 'Zap', color: '#8B5CF6', type: 'expense', monthlyBudget: 240, isSystem: true },
  { id: 'cat-subscriptions', name: 'Subscriptions', icon: 'Layers', color: '#14B8A6', type: 'expense', monthlyBudget: 180, isSystem: true },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#F43F5E', type: 'expense', monthlyBudget: 200, isSystem: true },
  { id: 'cat-health', name: 'Health & Fitness', icon: 'Activity', color: '#10B981', type: 'expense', monthlyBudget: 220, isSystem: true },
  { id: 'cat-shopping', name: 'Shopping & Gear', icon: 'Package', color: '#06B6D4', type: 'expense', monthlyBudget: 400, isSystem: true },
  { id: 'cat-transfers', name: 'Transfers & Savings', icon: 'ArrowLeftRight', color: '#64748B', type: 'transfer', monthlyBudget: 0, isSystem: true },
  { id: 'cat-other', name: 'Other Expenses', icon: 'MoreHorizontal', color: '#94A3B8', type: 'expense', monthlyBudget: 150, isSystem: true },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-checking',
    name: 'Chase Total Checking',
    type: 'checking',
    balance: 8450.25,
    currency: 'USD',
    institution: 'Chase Bank',
    mask: '4821',
    color: '#3B82F6',
    lastSynced: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'acc-savings',
    name: 'Marcus High-Yield Savings (4.75%)',
    type: 'savings',
    balance: 34820.50,
    currency: 'USD',
    institution: 'Goldman Sachs',
    mask: '9034',
    color: '#10B981',
    lastSynced: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'acc-credit',
    name: 'American Express Gold Card',
    type: 'credit',
    balance: -1340.80,
    currency: 'USD',
    institution: 'American Express',
    mask: '1004',
    color: '#F59E0B',
    lastSynced: new Date().toISOString(),
    isActive: true,
  },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    name: 'Emergency Fund (6 Months)',
    targetAmount: 40000,
    currentAmount: 34820,
    deadline: '2026-12-31',
    category: 'Safety',
    linkedAccountId: 'acc-savings',
    monthlyContribution: 800,
    color: '#10B981',
    icon: 'ShieldCheck',
    isCompleted: false,
    boostSuggestion: 'Move $80/mo from Dining to hit this 1.5 months earlier.',
  },
  {
    id: 'goal-2',
    name: 'Tokyo Autumn Trip',
    targetAmount: 4500,
    currentAmount: 3450,
    deadline: '2026-10-20',
    category: 'Travel',
    linkedAccountId: 'acc-checking',
    monthlyContribution: 450,
    color: '#6366F1',
    icon: 'Plane',
    isCompleted: false,
    boostSuggestion: 'Cancel 2 unused subscriptions to reach target by September.',
  },
  {
    id: 'goal-3',
    name: 'New MacBook Pro M4',
    targetAmount: 2800,
    currentAmount: 2450,
    deadline: '2026-09-30',
    category: 'Gear',
    linkedAccountId: 'acc-checking',
    monthlyContribution: 350,
    color: '#06B6D4',
    icon: 'Laptop',
    isCompleted: false,
  },
  {
    id: 'goal-4',
    name: 'Home Down Payment (20%)',
    targetAmount: 120000,
    currentAmount: 48500,
    deadline: '2028-06-30',
    category: 'Real Estate',
    linkedAccountId: 'acc-savings',
    monthlyContribution: 1500,
    color: '#F59E0B',
    icon: 'Home',
    isCompleted: false,
    boostSuggestion: 'Automate $200 from monthly freelance surplus directly to Marcus HYSA.',
  },
];

export const INITIAL_INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    title: 'Dining spending pacing 24% over budget',
    description: 'You have spent $398 of your $450 dining budget with 12 days left in the billing cycle.',
    severity: 'warning',
    type: 'alert',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    isDismissed: false,
    whyExplanation: 'Detected 14 transactions at coffee shops and restaurants totaling $398. Your average daily burn rate in Dining is $22.11 vs budgeted $15.00.',
    groundedData: [
      { label: 'Current Dining Spend', value: '$398.00' },
      { label: 'Monthly Limit', value: '$450.00' },
      { label: 'Projected Overage', value: '$112.50' },
      { label: 'Top Merchant', value: 'Sweetgreen ($84.20)' },
    ],
    actionLabel: 'Adjust Dining Budget',
    actionPath: '/app/budgets',
  },
  {
    id: 'ins-2',
    title: 'High-Yield Savings earned $138.40 interest',
    description: 'Your Marcus HYSA balance of $34,820 generated a monthly yield at 4.75% APY.',
    severity: 'success',
    type: 'win',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    isDismissed: false,
    whyExplanation: 'Calculated from 30-day compound interest rate across your liquid cash balance.',
    groundedData: [
      { label: 'APY Rate', value: '4.75%' },
      { label: 'Monthly Gain', value: '+$138.40' },
      { label: 'Annualized Passive Return', value: '$1,654.00' },
    ],
    actionLabel: 'View HYSA Balance',
    actionPath: '/app/forecast',
  },
  {
    id: 'ins-3',
    title: 'Unusual transaction flagged: Apple Store $489.00',
    description: 'This transaction is 3.4x higher than your typical shopping transaction of $142.00.',
    severity: 'alert',
    type: 'alert',
    date: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    isDismissed: false,
    whyExplanation: 'AI anomaly detection model evaluates 180-day baseline per merchant category. 98th percentile spend spike detected on Amex Gold card.',
    groundedData: [
      { label: 'Merchant', value: 'Apple Store NYC' },
      { label: 'Amount', value: '$489.00' },
      { label: 'Typical Category Avg', value: '$142.00' },
      { label: 'Account', value: 'Amex Gold (1004)' },
    ],
    actionLabel: 'Inspect Transaction',
    actionPath: '/app/transactions',
  },
  {
    id: 'ins-4',
    title: 'Upcoming quarterly insurance bill in 9 days',
    description: 'State Farm Auto Insurance ($324.50) is scheduled to be debited on Chase Checking.',
    severity: 'info',
    type: 'tip',
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    isDismissed: false,
    whyExplanation: 'Identified recurring quarterly frequency matching past payments in February, May, and August.',
    groundedData: [
      { label: 'Amount Due', value: '$324.50' },
      { label: 'Due Date', value: format(addDays(new Date(), 9), 'MMM d, yyyy') },
      { label: 'Post-Debit Runway', value: '7.4 Months' },
    ],
    actionLabel: 'Check Cash Flow',
    actionPath: '/app/forecast',
  },
];

// Seeded deterministic pseudo-random number generator
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateSeedTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const rng = seededRandom(42);
  const today = new Date();

  // Merchants database
  const merchantsByCategory: Record<string, { name: string; min: number; max: number; account: string }[]> = {
    'cat-groceries': [
      { name: 'Whole Foods Market', min: 45, max: 180, account: 'acc-credit' },
      { name: "Trader Joe's", min: 35, max: 110, account: 'acc-credit' },
      { name: 'Costco Wholesale', min: 120, max: 320, account: 'acc-checking' },
      { name: 'Safeway', min: 25, max: 85, account: 'acc-credit' },
      { name: 'Local Farmers Market', min: 20, max: 65, account: 'acc-checking' },
    ],
    'cat-dining': [
      { name: 'Blue Bottle Coffee', min: 6.5, max: 14.5, account: 'acc-credit' },
      { name: 'Sweetgreen', min: 14, max: 24, account: 'acc-credit' },
      { name: 'Chipotle Mexican Grill', min: 12, max: 22, account: 'acc-credit' },
      { name: 'Tartine Bakery', min: 15, max: 35, account: 'acc-credit' },
      { name: 'Nobu Japanese Cuisine', min: 140, max: 280, account: 'acc-credit' },
      { name: 'Local Trattoria', min: 45, max: 110, account: 'acc-credit' },
      { name: 'Shake Shack', min: 16, max: 28, account: 'acc-credit' },
    ],
    'cat-transport': [
      { name: 'Uber Trips', min: 15, max: 45, account: 'acc-credit' },
      { name: 'Lyft Ride', min: 14, max: 38, account: 'acc-credit' },
      { name: 'Chevron Gas Station', min: 45, max: 68, account: 'acc-credit' },
      { name: 'Metropolitan Transit Authority', min: 34, max: 34, account: 'acc-checking' },
    ],
    'cat-shopping': [
      { name: 'Amazon.com', min: 22, max: 140, account: 'acc-credit' },
      { name: 'Apple Store NYC', min: 150, max: 489, account: 'acc-credit' },
      { name: 'Target', min: 30, max: 120, account: 'acc-credit' },
      { name: 'Uniqlo App', min: 40, max: 110, account: 'acc-credit' },
      { name: 'REI Co-op', min: 65, max: 210, account: 'acc-credit' },
    ],
    'cat-entertainment': [
      { name: 'AMC Theatres', min: 28, max: 45, account: 'acc-credit' },
      { name: 'Steam Games', min: 15, max: 60, account: 'acc-credit' },
      { name: 'Live Nation Concerts', min: 85, max: 180, account: 'acc-credit' },
      { name: 'Audible Audiobooks', min: 15, max: 15, account: 'acc-credit' },
    ],
    'cat-health': [
      { name: 'CVS Pharmacy', min: 12, max: 45, account: 'acc-credit' },
      { name: 'Equinox Fitness Club', min: 220, max: 220, account: 'acc-checking' },
      { name: 'CorePower Yoga', min: 35, max: 35, account: 'acc-credit' },
    ],
    'cat-utilities': [
      { name: 'Pacific Gas & Electric', min: 85, max: 145, account: 'acc-checking' },
      { name: 'Verizon Wireless', min: 85, max: 95, account: 'acc-checking' },
      { name: 'Sonic Fiber Internet', min: 65, max: 65, account: 'acc-checking' },
    ],
  };

  // 1. Generate 6 months of historical transactions (180 days)
  let txCounter = 1;

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthDate = subMonths(today, monthOffset);
    const daysInMonth = 30;

    // Monthly Salary (1st and 15th)
    const d1 = format(subDays(monthDate, 14), 'yyyy-MM-dd');
    const d2 = format(subDays(monthDate, 0), 'yyyy-MM-dd');

    transactions.push({
      id: `tx-sal-${monthOffset}-1`,
      date: d1,
      merchant: 'Acme Corp Direct Deposit',
      categoryId: 'cat-income',
      accountId: 'acc-checking',
      amount: 3850.00,
      status: 'settled',
      isRecurring: true,
      notes: 'Bi-weekly tech engineering payroll',
    });

    transactions.push({
      id: `tx-sal-${monthOffset}-2`,
      date: d2,
      merchant: 'Acme Corp Direct Deposit',
      categoryId: 'cat-income',
      accountId: 'acc-checking',
      amount: 3850.00,
      status: 'settled',
      isRecurring: true,
      notes: 'Bi-weekly tech engineering payroll',
    });

    // Freelance design income on some months
    if (monthOffset % 2 === 0) {
      transactions.push({
        id: `tx-free-${monthOffset}`,
        date: format(subDays(monthDate, 7), 'yyyy-MM-dd'),
        merchant: 'Stripe Payout - UI Consultancy',
        categoryId: 'cat-income',
        accountId: 'acc-checking',
        amount: 1450.00 + Math.floor(rng() * 600),
        status: 'settled',
        isRecurring: false,
        notes: 'Design system consulting milestone',
      });
    }

    // Rent on 1st
    transactions.push({
      id: `tx-rent-${monthOffset}`,
      date: format(subDays(monthDate, 28), 'yyyy-MM-dd'),
      merchant: 'Avalon Bay Communities Rent',
      categoryId: 'cat-housing',
      accountId: 'acc-checking',
      amount: -2100.00,
      status: 'settled',
      isRecurring: true,
      notes: 'Monthly 1BR apartment lease',
    });

    // Subscriptions
    const subs = [
      { name: 'Netflix Premium 4K', amount: -22.99 },
      { name: 'Spotify Duo', amount: -14.99 },
      { name: 'ChatGPT Plus Subscription', amount: -20.00 },
      { name: 'GitHub Copilot Pro', amount: -10.00 },
      { name: 'iCloud 2TB Storage', amount: -9.99 },
      { name: 'Equinox Gym Membership', amount: -220.00 },
      { name: 'Notion Plus Workspace', amount: -10.00 },
    ];

    subs.forEach((sub, sIdx) => {
      transactions.push({
        id: `tx-sub-${monthOffset}-${sIdx}`,
        date: format(subDays(monthDate, 20 - sIdx * 2), 'yyyy-MM-dd'),
        merchant: sub.name,
        categoryId: sub.name.includes('Gym') ? 'cat-health' : 'cat-subscriptions',
        accountId: 'acc-credit',
        amount: sub.amount,
        status: 'settled',
        isRecurring: true,
      });
    });

    // Interest on HYSA
    transactions.push({
      id: `tx-interest-${monthOffset}`,
      date: format(subDays(monthDate, 1), 'yyyy-MM-dd'),
      merchant: 'Marcus Interest Paid (4.75%)',
      categoryId: 'cat-income',
      accountId: 'acc-savings',
      amount: 135.00 + rng() * 10,
      status: 'settled',
      isRecurring: true,
    });

    // Random daily variable expenses for this month
    for (let day = 0; day < daysInMonth; day += 2) {
      const txDate = format(subDays(monthDate, day), 'yyyy-MM-dd');
      const cats = Object.keys(merchantsByCategory);
      const chosenCat = cats[Math.floor(rng() * cats.length)];
      const merchantList = merchantsByCategory[chosenCat];
      const merchant = merchantList[Math.floor(rng() * merchantList.length)];
      
      const rawAmount = merchant.min + rng() * (merchant.max - merchant.min);
      const roundedAmount = -(Math.round(rawAmount * 100) / 100);

      const isAnomaly = roundedAmount < -350 && (chosenCat === 'cat-shopping' || chosenCat === 'cat-dining');

      transactions.push({
        id: `tx-var-${txCounter++}`,
        date: txDate,
        merchant: merchant.name,
        categoryId: chosenCat,
        accountId: merchant.account,
        amount: roundedAmount,
        status: 'settled',
        isRecurring: false,
        isAnomaly,
        anomalyReason: isAnomaly ? `Spike alert: ${Math.abs(roundedAmount).toFixed(0)} is ~3.2x higher than typical ${chosenCat.replace('cat-', '')} expense.` : undefined,
      });
    }
  }

  // Sort descending by date
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function loadStoredData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accounts && parsed.transactions && parsed.categories && parsed.goals) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored FinPilot data, resetting seed:', e);
  }

  // Fallback to generating fresh seed
  const initialData: StorageData = {
    accounts: INITIAL_ACCOUNTS,
    categories: INITIAL_CATEGORIES,
    goals: INITIAL_GOALS,
    transactions: generateSeedTransactions(),
    insights: INITIAL_INSIGHTS,
  };

  saveStoredData(initialData);
  return initialData;
}

export function saveStoredData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}
