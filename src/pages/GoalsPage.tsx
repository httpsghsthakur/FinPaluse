import React, { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Goal, Account } from '../types';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { api } from '../lib/api';
import { useUIStore } from '../lib/store/useUIStore';
import { formatCurrency, formatDate } from '../lib/utils/formatters';

export const GoalsPage: React.FC = () => {
  const { openCreateGoalModal, showToast } = useUIStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Contribute Modal State
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('100');
  const [isContributing, setIsContributing] = useState(false);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const [goalList, accList] = await Promise.all([api.getGoals(), api.getAccounts()]);
      setGoals(goalList);
      setAccounts(accList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsContributing(true);
    try {
      const updated = await api.contributeToGoal(contributeGoal.id, amount);
      if (updated.isCompleted) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast({
          type: 'success',
          title: 'Goal Achieved! 🎉',
          description: `Congratulations! You hit your target for ${updated.name}!`,
        });
      } else {
        showToast({
          type: 'success',
          title: 'Contribution Recorded',
          description: `Added ${formatCurrency(amount)} to ${updated.name}.`,
        });
      }
      setContributeGoal(null);
      loadGoals();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Contribution Failed',
      });
    } finally {
      setIsContributing(false);
    }
  };

  const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTargetAcrossGoals = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgressPct = Math.round((totalSavedAcrossGoals / (totalTargetAcrossGoals || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Savings Goals</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active milestone trajectories with dynamic completion forecasting
          </p>
        </div>

        <button
          onClick={openCreateGoalModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer self-start"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Aggregate Goal Progress Banner */}
      <div className="p-6 rounded-[28px] bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
            Total Milestone Reserve
          </span>
          <div className="text-3xl font-extrabold font-mono text-white">
            {formatCurrency(totalSavedAcrossGoals)}{' '}
            <span className="text-sm text-slate-400 font-sans font-normal">
              of {formatCurrency(totalTargetAcrossGoals)} ({overallProgressPct}%)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automating ~{formatCurrency(goals.reduce((a, b) => a + b.monthlyContribution, 0))}/month across {goals.length} target pots.
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-300">
            <span>Portfolio Progress</span>
            <span className="text-emerald-400 font-bold">{overallProgressPct}%</span>
          </div>
          <ProgressBar value={totalSavedAcrossGoals} max={totalTargetAcrossGoals} color="#10B981" size="lg" />
        </div>
      </div>

      {/* Goal Cards Grid */}
      {goals.length === 0 ? (
        <EmptyState
          title="No Active Goals"
          description="Create your first goal to unlock AI savings pacing and runway trajectory tracking."
          actionLabel="Create Goal"
          onAction={openCreateGoalModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const monthsToTarget = (remaining / (goal.monthlyContribution || 100)).toFixed(1);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 hover:border-slate-700/80 rounded-[28px] p-6 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon name={goal.icon || 'Target'} color={goal.color} size="lg" />
                      <div>
                        <h3 className="text-base font-bold text-white">{goal.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono">{formatDate(goal.deadline, 'MMM yyyy')}</span>
                          <span>•</span>
                          <span className="capitalize">{goal.category}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                          : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {isCompleted ? 'Achieved 🎉' : 'On Track'}
                    </span>
                  </div>

                  {/* Progress & Target Details */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold font-mono text-white">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Target: {formatCurrency(goal.targetAmount)} ({pct}%)
                      </span>
                    </div>

                    <ProgressBar value={goal.currentAmount} max={goal.targetAmount} color={goal.color} size="md" />

                    <div className="flex justify-between text-xs text-slate-400 pt-1 font-mono">
                      <span>{formatCurrency(goal.monthlyContribution)}/mo auto-transfer</span>
                      <span>ETA ~{monthsToTarget} months</span>
                    </div>
                  </div>
                </div>

                {/* AI Boost Suggestion Chip */}
                {goal.boostSuggestion && !isCompleted && (
                  <div className="p-3 rounded-2xl bg-indigo-950/30 backdrop-blur-md border border-indigo-500/30 text-xs flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-indigo-300">AI Trajectory Boost: </span>
                      <span className="text-slate-300 text-[11px]">{goal.boostSuggestion}</span>
                    </div>
                  </div>
                )}

                {/* Card Action footer */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Linked to <span className="text-slate-300 font-medium">{accounts.find((a) => a.id === goal.linkedAccountId)?.name || 'Savings'}</span>
                  </span>

                  <button
                    onClick={() => {
                      setContributeGoal(goal);
                      setDepositAmount('250');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                    <span>Quick Boost</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoal && (
        <Modal
          isOpen={Boolean(contributeGoal)}
          onClose={() => setContributeGoal(null)}
          title={`Boost ${contributeGoal.name}`}
          description="Make a one-time manual deposit from your primary checking"
          maxWidth="sm"
        >
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deposit Amount ($)</label>
              <input
                type="number"
                step="10"
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              {['50', '100', '250', '500'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDepositAmount(preset)}
                  className="flex-1 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 rounded-lg cursor-pointer"
                >
                  +${preset}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContributeGoal(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isContributing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                Confirm Transfer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
