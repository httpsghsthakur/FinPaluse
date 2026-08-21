import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Receipt,
  PieChart,
  Target,
  TrendingUp,
  SlidersHorizontal,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useUIStore } from "../../lib/store/useUIStore";
import { cn } from "../../lib/utils/cn";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/app", icon: LayoutDashboard },
  { name: "AI Copilot", path: "/app/copilot", icon: Bot, highlight: true },
  { name: "Transactions", path: "/app/transactions", icon: Receipt },
  { name: "Budgets", path: "/app/budgets", icon: PieChart },
  { name: "Goals", path: "/app/goals", icon: Target },
  { name: "Forecast", path: "/app/forecast", icon: TrendingUp },
  {
    name: "What-If Simulator",
    path: "/app/simulator",
    icon: SlidersHorizontal,
  },
  { name: "Insights & Digest", path: "/app/insights", icon: Lightbulb },
  { name: "Settings", path: "/app/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar, openPlaidModal } = useUIStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between bg-[#0B0F19]/40 backdrop-blur-xl border-r border-slate-800/60 transition-all duration-300 z-30 shrink-0 select-none",
        isSidebarCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Top Logo & App Brand */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/60">
          <NavLink
            to="/app"
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
              <svg
                className="w-5 h-5 text-slate-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Finpluse
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  AI
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/app"
                ? location.pathname === "/app"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-400 group-hover:text-slate-200",
                    item.highlight && !isActive && "text-emerald-400",
                  )}
                />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}
                {!isSidebarCollapsed && item.highlight && (
                  <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full border border-indigo-500/30 font-bold ml-auto">
                    LIVE
                  </span>
                )}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-slate-100 text-xs rounded-lg border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom CTA & Runway Widget */}
      <div className="p-3 border-t border-slate-800/60 space-y-3">
        {!isSidebarCollapsed ? (
          <>
            {/* AI Runway Widget */}
            <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/30">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                AI Runway
              </p>
              <div className="flex items-end gap-1.5">
                <span className="text-lg font-mono font-bold text-white">
                  8.4
                </span>
                <span className="text-xs text-slate-400 pb-0.5 font-medium">
                  months
                </span>
              </div>
              <div className="w-full bg-slate-700/40 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[70%]" />
              </div>
            </div>

            <button
              onClick={openPlaidModal}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Link Account</span>
            </button>
          </>
        ) : (
          <button
            onClick={openPlaidModal}
            className="w-full p-2.5 flex items-center justify-center rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
            title="Link Account"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
