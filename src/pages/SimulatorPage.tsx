import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  RotateCcw,
  Save,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ChartCard } from '../components/ui/ChartCard';
import { SimulationScenario, SimulationResult } from '../types';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils/formatters';
import { useUIStore } from '../lib/store/useUIStore';

const PRESET_SCENARIOS: { name: string; params: Partial<SimulationScenario> }[] = [
  {
    name: 'Tech Promotion (+15% Salary)',
    params: {
      name: 'Tech Promotion (+15% Salary)',
      monthlyIncomeDelta: 850,
      monthlyExpenseDelta: 0,
      oneTimeExpense: 0,
      monthsWithoutIncome: 0,
    },
  },
  {
    name: 'Career Break (4-Month Sabbatical)',
    params: {
      name: 'Career Break (4-Month Sabbatical)',
      monthlyIncomeDelta: 0,
      monthlyExpenseDelta: -400, // cut expenses
      oneTimeExpense: 2500, // travel
      monthsWithoutIncome: 4,
    },
  },
  {
    name: 'Major Purchase (Car $12k Down)',
    params: {
      name: 'Major Purchase (Car $12k Down)',
      monthlyIncomeDelta: 0,
      monthlyExpenseDelta: 450, // car payment + insurance
      oneTimeExpense: 12000,
      monthsWithoutIncome: 0,
    },
  },
  {
    name: 'Aggressive F.I.R.E. Cut (-$600/mo)',
    params: {
      name: 'Aggressive F.I.R.E. Cut (-$600/mo)',
      monthlyIncomeDelta: 0,
      monthlyExpenseDelta: -600,
      oneTimeExpense: 0,
      monthsWithoutIncome: 0,
    },
  },
];

export const SimulatorPage: React.FC = () => {
  const { showToast } = useUIStore();
  const [scenarioName, setScenarioName] = useState('Custom Scenario');
  const [monthlyIncomeDelta, setMonthlyIncomeDelta] = useState<number>(0);
  const [monthlyExpenseDelta, setMonthlyExpenseDelta] = useState<number>(0);
  const [oneTimeExpense, setOneTimeExpense] = useState<number>(0);
  const [monthsWithoutIncome, setMonthsWithoutIncome] = useState<number>(0);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const scenario: SimulationScenario = {
        id: 'sim-active',
        name: scenarioName,
        monthlyIncomeDelta,
        monthlyExpenseDelta,
        oneTimeExpense,
        monthsWithoutIncome,
      };
      const res = await api.runSimulation(scenario);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [monthlyIncomeDelta, monthlyExpenseDelta, oneTimeExpense, monthsWithoutIncome]);

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setScenarioName(preset.name);
    setMonthlyIncomeDelta(preset.params.monthlyIncomeDelta || 0);
    setMonthlyExpenseDelta(preset.params.monthlyExpenseDelta || 0);
    setOneTimeExpense(preset.params.oneTimeExpense || 0);
    setMonthsWithoutIncome(preset.params.monthsWithoutIncome || 0);
    showToast({
      type: 'info',
      title: 'Preset Applied',
      description: `Loaded scenario parameters for "${preset.name}".`,
    });
  };

  const handleReset = () => {
    setScenarioName('Custom Scenario');
    setMonthlyIncomeDelta(0);
    setMonthlyExpenseDelta(0);
    setOneTimeExpense(0);
    setMonthsWithoutIncome(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">What-If Scenario Simulator</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test life decisions against your real baseline to forecast 12-month net worth and runway impacts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md text-slate-300 border border-slate-700/50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono text-slate-400 shrink-0">Quick Presets:</span>
        {PRESET_SCENARIOS.map((p, i) => (
          <button
            key={i}
            onClick={() => applyPreset(p)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-700/50 text-xs text-slate-200 whitespace-nowrap transition-all cursor-pointer shadow-sm hover:border-emerald-500/40"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Controls on Left, Live Chart & Outcomes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-6 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Simulation Levers</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Calc
            </span>
          </div>

          {/* Lever 1: Monthly Income Change */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300 font-medium">Monthly Income Delta</label>
              <span
                className={`font-mono font-bold ${
                  monthlyIncomeDelta > 0
                    ? 'text-emerald-400'
                    : monthlyIncomeDelta < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {monthlyIncomeDelta > 0 ? `+${formatCurrency(monthlyIncomeDelta)}` : formatCurrency(monthlyIncomeDelta)}/mo
              </span>
            </div>
            <input
              type="range"
              min="-4000"
              max="5000"
              step="100"
              value={monthlyIncomeDelta}
              onChange={(e) => setMonthlyIncomeDelta(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-$4,000</span>
              <span>$0</span>
              <span>+$5,000</span>
            </div>
          </div>

          {/* Lever 2: Monthly Expense Change */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300 font-medium">Monthly Expense Delta</label>
              <span
                className={`font-mono font-bold ${
                  monthlyExpenseDelta > 0
                    ? 'text-rose-400'
                    : monthlyExpenseDelta < 0
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {monthlyExpenseDelta > 0 ? `+${formatCurrency(monthlyExpenseDelta)}` : formatCurrency(monthlyExpenseDelta)}/mo
              </span>
            </div>
            <input
              type="range"
              min="-2000"
              max="3000"
              step="50"
              value={monthlyExpenseDelta}
              onChange={(e) => setMonthlyExpenseDelta(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-$2,000 (Cuts)</span>
              <span>$0</span>
              <span>+$3,000 (Lifestyle)</span>
            </div>
          </div>

          {/* Lever 3: One-time Lump-sum Purchase */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300 font-medium">One-Time Big Purchase</label>
              <span className="font-mono font-bold text-white">
                {formatCurrency(oneTimeExpense)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="500"
              value={oneTimeExpense}
              onChange={(e) => setOneTimeExpense(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$0</span>
              <span>$15,000</span>
              <span>$30,000</span>
            </div>
          </div>

          {/* Lever 4: Months without income (Sabbatical / Job Search) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300 font-medium">Months Without Income</label>
              <span className="font-mono font-bold text-amber-400">
                {monthsWithoutIncome} {monthsWithoutIncome === 1 ? 'Month' : 'Months'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={monthsWithoutIncome}
              onChange={(e) => setMonthsWithoutIncome(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 mo</span>
              <span>6 mo</span>
              <span>12 mo</span>
            </div>
          </div>
        </div>

        {/* Results and Comparison Chart */}
        <div className="lg:col-span-2 space-y-6">
          {results && (() => {
            const finalPoint = results.monthlyPoints[11] || results.monthlyPoints[results.monthlyPoints.length - 1] || { baseline: 0, scenario: 0 };
            const netWorthDelta = finalPoint.scenario - finalPoint.baseline;
            const runwayDeltaMonths = results.scenarioRunwayMonths - results.baselineRunwayMonths;
            return (
            <>
              {/* Impact KPI Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">12-Month Net Difference</span>
                  <div
                    className={`text-2xl lg:text-3xl font-bold font-mono ${
                      netWorthDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {netWorthDelta >= 0
                      ? `+${formatCurrency(netWorthDelta)}`
                      : formatCurrency(netWorthDelta)}
                  </div>
                  <p className="text-xs text-slate-400">compared to current status quo</p>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">Runway Shift</span>
                  <div
                    className={`text-2xl lg:text-3xl font-bold font-mono ${
                      runwayDeltaMonths >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {runwayDeltaMonths >= 0
                      ? `+${runwayDeltaMonths.toFixed(1)} Mo`
                      : `${runwayDeltaMonths.toFixed(1)} Mo`}
                  </div>
                  <p className="text-xs text-slate-400">Survival cash buffer adjustment</p>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">Simulated 1-Yr Net Worth</span>
                  <div className="text-2xl lg:text-3xl font-bold font-mono text-white">
                    {formatCurrency(finalPoint.scenario || 0)}
                  </div>
                  <p className="text-xs text-slate-400">
                    Baseline: {formatCurrency(finalPoint.baseline || 0)}
                  </p>
                </div>
              </div>

              {/* 12-Month Comparison Line Chart */}
              <ChartCard
                title="12-Month Trajectory: Baseline vs Scenario"
                subtitle="Comparing status quo financial trajectory with active simulated levers"
                actions={
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2.5 h-0.5 bg-slate-400" /> Baseline (Status Quo)
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-0.5 bg-emerald-400" /> Simulated Path
                    </span>
                  </div>
                }
              >
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.monthlyPoints} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                      <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 12 }}
                        formatter={(val: any, name: any) => [
                          `$${Number(val).toLocaleString()}`,
                          name === 'baseline' ? 'Baseline Path' : 'Simulated Path',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="baseline"
                        stroke="#64748B"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="scenario"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#10B981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Goal Impact Table */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-6 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span>Impact on Active Savings Goals</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.goalImpacts.map((g, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-800/30 backdrop-blur-md border border-slate-700/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-100">{g.goalName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          New Target: <span className="font-mono text-slate-300">{g.newTargetDate}</span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                          g.impactMonths > 0
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : g.impactMonths < 0
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {g.impactMonths > 0
                          ? `+${g.impactMonths} mo delay`
                          : g.impactMonths < 0
                          ? `${g.impactMonths} mo earlier!`
                          : 'No change'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
