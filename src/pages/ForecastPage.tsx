import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import { ChartCard } from '../components/ui/ChartCard';
import { ChartSkeleton } from '../components/ui/Skeletons';
import { ForecastPoint, ForecastEvent } from '../types';
import { api } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils/formatters';

export const ForecastPage: React.FC = () => {
  const [range, setRange] = useState<30 | 60 | 90>(90);
  const [points, setPoints] = useState<ForecastPoint[]>([]);
  const [events, setEvents] = useState<ForecastEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadForecast = async () => {
    setIsLoading(true);
    try {
      const res = await api.getForecast(range);
      setPoints(res.points);
      setEvents(res.events);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [range]);

  const currentLiquidBalance = points.find((p) => p.isActual)?.actualBalance || 43270;
  const minForecastPoint = points.reduce(
    (min, p) => (p.forecastedBalance < min.forecastedBalance ? p : min),
    points[0] || { forecastedBalance: 0, date: '' }
  );
  const endForecastPoint = points[points.length - 1] || { forecastedBalance: 0 };
  const netDelta = (endForecastPoint.forecastedBalance || 0) - currentLiquidBalance;

  return (
    <div className="space-y-6">
      {/* Top Header & Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cash Flow Forecast</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            90-day predictive balance model with automated recurring bill detection
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl self-start">
          {[30, 60, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-xl transition-colors cursor-pointer ${
                range === r
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">Current Total Liquidity</span>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-white">{formatCurrency(currentLiquidBalance)}</div>
          <p className="text-xs text-slate-400">Checking + High-Yield Savings</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">Projected {range}-Day Balance</span>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400">
            {formatCurrency(endForecastPoint.forecastedBalance)}
          </div>
          <p className="text-xs text-emerald-400/90 font-mono">
            {netDelta > 0 ? `+${formatCurrency(netDelta)}` : formatCurrency(netDelta)} net reserve growth
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">Lowest Projected Trough</span>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-white">
            {formatCurrency(minForecastPoint.forecastedBalance)}
          </div>
          <p className="text-xs text-slate-400">
            Occurs on {minForecastPoint.date ? formatDate(minForecastPoint.date, 'MMM d, yyyy') : 'N/A'} (Safe Buffer)
          </p>
        </div>
      </div>

      {/* Main Forecast Composed Chart */}
      {isLoading ? (
        <ChartSkeleton height="h-[360px]" />
      ) : (
        <ChartCard
          title="Predictive Cash Runway & Confidence Cone"
          subtitle="Solid line: Actual balance | Dashed: ML regression | Shaded: ±1.8σ Uncertainty band"
          footerNote="Regression incorporates salary cadences, verified subscriptions, rent leases, and historical burn rate."
          actions={
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-400" /> Actual
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-0.5 border-t-2 border-dashed border-indigo-400" /> Forecast
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2 bg-indigo-500/20 rounded" /> Confidence Band
              </span>
            </div>
          }
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(d) => formatDate(d, 'MMM d')}
                />
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
                    name === 'actualBalance'
                      ? 'Actual Balance'
                      : name === 'forecastedBalance'
                      ? 'Projected Balance'
                      : name === 'upperBound'
                      ? 'Upper Band'
                      : 'Lower Band',
                  ]}
                  labelFormatter={(l) => formatDate(l, 'MMMM d, yyyy')}
                />
                {/* Confidence Area */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="transparent"
                  fill="url(#confidenceGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="transparent"
                  fill="#0B0F19"
                />

                {/* Actual balance line */}
                <Line
                  type="monotone"
                  dataKey="actualBalance"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={false}
                />

                {/* Forecast dashed line */}
                <Line
                  type="monotone"
                  dataKey="forecastedBalance"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Events Timeline & Methodology Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduled Cash-Flow Events */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-6 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Key Forecast Events</h3>
              <p className="text-xs text-slate-400">Identified cash inflections in the next {range} days</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">{events.length} Events</span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {events.map((ev) => {
              const isIncome = ev.amount > 0;
              return (
                <div
                  key={ev.id}
                  className="p-3 rounded-2xl bg-slate-800/30 backdrop-blur-md border border-slate-700/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl font-bold ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{ev.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatDate(ev.date, 'EEEE, MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className={`font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {isIncome ? `+${formatCurrency(ev.amount)}` : formatCurrency(ev.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Methodology Card */}
        <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-6 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Info className="w-4 h-4" />
            <span>Forecasting Methodology</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Finpluse’s predictive engine evaluates 180 days of historical cash-flow data. It factors in:
          </p>

          <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Bi-weekly tech engineering payroll direct deposits on the 1st and 15th.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <span>Fixed apartment rent lease of {formatCurrency(25000, profile.currency)} debited on the 1st of every month.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>High-Yield Savings compound interest yield at 4.75% APY.</span>
            </li>
          </ul>

          <div className="p-3 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-[11px] text-slate-400">
            Confidence bounds widen organically over time to reflect discretionary dining and retail variance.
          </div>
        </div>
      </div>
    </div>
  );
};
