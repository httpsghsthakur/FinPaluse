import React from "react";
import { NavLink } from "react-router-dom";
import {
  Bot,
  TrendingUp,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  ArrowRight,
  PieChart,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  Receipt,
  LineChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const DEMO_DATA = [
  { month: "Jan", balance: 32400, forecast: 32400 },
  { month: "Feb", balance: 35100, forecast: 35100 },
  { month: "Mar", balance: 38200, forecast: 38200 },
  { month: "Apr", balance: 41800, forecast: 41800 },
  { month: "May", balance: 43270, forecast: 43270 },
  { month: "Jun", balance: null, forecast: 46800 },
  { month: "Jul", balance: null, forecast: 50400 },
  { month: "Aug", balance: null, forecast: 54100 },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans relative overflow-x-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Finpluse
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              AI Copilot
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <NavLink
            to="/app"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2 cursor-pointer"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Autonomous Personal Finance</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Your money, explained by{" "}
          <span className="text-emerald-400">Grounded AI</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          Ask your finances anything. Predict 90-day cash-flow runway, test
          what-if scenarios, detect spend anomalies, and hit savings goals with
          deterministic intelligence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <NavLink
            to="/app"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Live Sandbox</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/app/copilot"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md text-slate-200 border border-slate-700/50 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Ask AI a Question</span>
          </NavLink>
        </div>

        {/* Hero Interactive Chart Preview Mockup */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-[28px] border border-slate-800/60 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/60 gap-4">
            <div className="text-left">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
                Net Worth Trajectory
              </div>
              <div className="mt-2 mb-6">
                <div className="text-slate-400 text-sm mb-1">
                  Total Net Worth
                </div>
                <div className="text-4xl font-mono font-medium text-white tracking-tight flex items-baseline gap-3">
                  ₹24,43,270.75{" "}
                  <span className="text-xs text-emerald-500 font-sans font-medium">
                    (+18.4% YTD)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 font-mono">
                90-Day Predictive Model
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Confidence: 98.2%
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_DATA}>
                <defs>
                  <linearGradient
                    id="actualGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient
                    id="forecastGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "rgba(51, 65, 85, 0.6)",
                    borderRadius: 16,
                    backdropFilter: "blur(8px)",
                  }}
                  formatter={(val: any) => [
                    `₹${Number(val).toLocaleString()}`,
                    "Balance",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#actualGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="url(#forecastGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 6 Feature Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white">
            Engineered for absolute financial clarity
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Combining deterministic balance math with streaming AI insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: "Conversational AI Engine",
              description:
                'Ask questions like "Can I afford a ₹6,500 purchase?" and get answers calculated directly from your real balances and bills.',
              color: "#10B981",
            },
            {
              icon: TrendingUp,
              title: "90-Day Cash Runway Forecast",
              description:
                "Visualizes future balances with confidence bands, automated bill detection, and low-balance warnings.",
              color: "#6366F1",
            },
            {
              icon: SlidersHorizontal,
              title: "What-If Scenario Engine",
              description:
                "Simulate salary changes, job sabbaticals, major purchases, or subscription cuts on your 12-month net worth.",
              color: "#F59E0B",
            },
            {
              icon: ShieldCheck,
              title: "Anomaly & Overspend Guard",
              description:
                "Detects 3x+ statistical spikes in merchant categories and warns you before monthly budgets overrun.",
              color: "#EF4444",
            },
            {
              icon: PieChart,
              title: "Predictive Category Budgets",
              description:
                "Calculates month-end projected spending rather than just static spent totals.",
              color: "#06B6D4",
            },
            {
              icon: Lock,
              title: "Pluggable Architecture",
              description:
                "100% standalone seed engine with zero vendor lock-in. Switch to real REST/WebSocket backends in one config line.",
              color: "#8B5CF6",
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-[28px] bg-slate-900/40 backdrop-blur-md border border-slate-800/60 hover:border-slate-700/80 transition-all hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${f.color}15`, color: f.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3-Step "How it Works" */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white">
            How Finpluse Works
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            From raw transactions to intelligent financial decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Aggregate & Index Accounts",
              desc: "Seamlessly link checking, high-yield savings, and credit cards with read-only encryption.",
            },
            {
              step: "02",
              title: "Continuous Pattern Analysis",
              desc: "Deterministic models calculate burn rates, recurring cash outflows, and net savings pacing.",
            },
            {
              step: "03",
              title: "Conversational Optimization",
              desc: "Ask your copilot anything or simulate scenarios to reach major financial milestones faster.",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="relative p-6 rounded-[28px] bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            >
              <div className="text-3xl font-extrabold font-mono text-emerald-400/40 mb-3">
                {s.step}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">
            Finpluse AI Systems
          </span>
          <span>© 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <NavLink
            to="/app"
            className="hover:text-emerald-400 transition-colors"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/app/copilot"
            className="hover:text-emerald-400 transition-colors"
          >
            AI Copilot
          </NavLink>
          <NavLink
            to="/app/simulator"
            className="hover:text-emerald-400 transition-colors"
          >
            Simulator
          </NavLink>
          <NavLink
            to="/app/settings"
            className="hover:text-emerald-400 transition-colors"
          >
            Settings
          </NavLink>
        </div>
      </footer>
    </div>
  );
};
