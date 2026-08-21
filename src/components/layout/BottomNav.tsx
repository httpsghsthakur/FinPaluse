import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Bot,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils/cn";

const MOBILE_TABS = [
  { name: "Dashboard", path: "/app", icon: LayoutDashboard },
  { name: "Transactions", path: "/app/transactions", icon: Receipt },
  { name: "Copilot", path: "/app/copilot", icon: Bot, isCenter: true },
  { name: "Goals", path: "/app/goals", icon: Target },
  { name: "Forecast", path: "/app/forecast", icon: TrendingUp },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0E131F]/95 backdrop-blur-lg border-t border-[#1F2937] z-40 px-3 flex items-center justify-around">
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.path === "/app"
            ? location.pathname === "/app"
            : location.pathname.startsWith(tab.path);

        if (tab.isCenter) {
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center -mt-5 group"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95",
                  isActive
                    ? "bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/20"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold mt-1",
                  isActive ? "text-emerald-400" : "text-slate-400",
                )}
              >
                {tab.name}
              </span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={cn(
              "flex flex-col items-center py-1 px-2 rounded-xl transition-colors",
              isActive
                ? "text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{tab.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
