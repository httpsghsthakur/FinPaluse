import React, { useEffect, useState } from "react";
import {
  PieChart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  DollarSign,
} from "lucide-react";
import { Category, Budget } from "../types";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { AmountText } from "../components/ui/AmountText";
import { ProgressBar } from "../components/ui/ProgressBar";
import { EditBudgetModal } from "../components/ui/EditBudgetModal";
import { TableSkeleton } from "../components/ui/Skeletons";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/utils/formatters";
import { format, subMonths, addMonths } from "date-fns";

export const BudgetsPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);

  const monthString = format(currentDate, "yyyy-MM");
  const monthDisplay = format(currentDate, "MMMM yyyy");

  const loadBudgetsData = async () => {
    setIsLoading(true);
    try {
      const [cats, bgtList] = await Promise.all([
        api.getCategories(),
        api.getBudgets(monthString),
      ]);
      setCategories(cats);
      setBudgets(bgtList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetsData();
  }, [monthString]);

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalPredicted = budgets.reduce((acc, b) => acc + b.predictedSpend, 0);
  const overallPacingOverage = totalPredicted - totalBudgeted;

  const handleOpenEdit = (category: Category, budget: Budget) => {
    setActiveCategory(category);
    setActiveBudget(budget);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Predictive Budgets
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Machine-learning pacing forecasts based on daily velocity and
            historical cadence
          </p>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-1.5 self-start">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold px-3 font-mono text-slate-200">
            {monthDisplay}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Total Budgeted
          </span>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-white">
            {formatCurrency(totalBudgeted)}
          </div>
          <div className="text-xs text-slate-400">
            Across {budgets.length} expense categories
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Current Spent
          </span>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-white">
            {formatCurrency(totalSpent)}
          </div>
          <div className="text-xs text-slate-400">
            {((totalSpent / (totalBudgeted || 1)) * 100).toFixed(0)}% of monthly
            ceiling used
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5.5 space-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Predicted Month-End
          </span>
          <div
            className={`text-2xl lg:text-3xl font-bold font-mono ${
              overallPacingOverage > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {formatCurrency(totalPredicted)}
          </div>
          <div className="text-xs text-slate-400">
            {overallPacingOverage > 0
              ? `On pace to overspend by ${formatCurrency(overallPacingOverage)}`
              : `On pace to finish under budget by ${formatCurrency(Math.abs(overallPacingOverage))}`}
          </div>
        </div>
      </div>

      {/* Categories Budget Cards Grid */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const cat = categories.find((c) => c.id === budget.categoryId);
            if (!cat) return null;

            const percentSpent =
              (budget.spent / (budget.monthlyLimit || 1)) * 100;
            const isPredictedOver = budget.predictedSpend > budget.monthlyLimit;
            const overage = budget.predictedSpend - budget.monthlyLimit;

            return (
              <div
                key={budget.id}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 hover:border-slate-700/80 rounded-[28px] p-5.5 transition-all space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CategoryIcon name={cat.icon} color={cat.color} size="md" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Target: {formatCurrency(budget.monthlyLimit)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(cat, budget)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 text-xs font-semibold border border-slate-700/50 transition-colors cursor-pointer"
                  >
                    Edit Target
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold">
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className="text-slate-400">
                      {percentSpent.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={budget.spent}
                    max={budget.monthlyLimit}
                    color={
                      percentSpent > 100
                        ? "#EF4444"
                        : percentSpent > 80
                          ? "#F59E0B"
                          : cat.color
                    }
                    size="md"
                  />
                </div>

                {/* Predictive AI Pacing Callout */}
                <div
                  className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                    isPredictedOver
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isPredictedOver ? (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">
                      {isPredictedOver
                        ? `On pace to overspend by ${formatCurrency(overage)}`
                        : `On pace to save ${formatCurrency(Math.abs(overage))}`}
                    </span>
                  </div>
                  <span className="font-mono font-semibold shrink-0">
                    Est: {formatCurrency(budget.predictedSpend)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        category={activeCategory}
        budget={activeBudget}
        onSaved={loadBudgetsData}
      />
    </div>
  );
};
