import React, { useState } from "react";
import { Modal } from "./Modal";
import { useUIStore } from "../../lib/store/useUIStore";
import { Account } from "../../types";
import { api } from "../../lib/api";
import { Sparkles, Calendar, DollarSign, Tag } from "lucide-react";

interface CreateGoalModalProps {
  accounts: Account[];
  onGoalCreated: () => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  accounts,
  onGoalCreated,
}) => {
  const { isCreateGoalModalOpen, closeCreateGoalModal, showToast } =
    useUIStore();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("2026-12-31");
  const [category, setCategory] = useState("Savings");
  const [linkedAccountId, setLinkedAccountId] = useState(
    accounts[0]?.id || "acc-savings",
  );
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [color, setColor] = useState("#10B981");
  const [icon, setIcon] = useState("ShieldCheck");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    const monthly =
      parseFloat(monthlyContribution) || Math.round((target - current) / 6);

    if (isNaN(target) || target <= 0) return;

    setIsSubmitting(true);
    try {
      await api.addGoal({
        name,
        targetAmount: target,
        currentAmount: current,
        deadline,
        category,
        linkedAccountId,
        monthlyContribution: monthly,
        color,
        icon,
        boostSuggestion: `Automating ₹${Math.round(monthly * 0.2)}/mo more will achieve this 3 weeks earlier.`,
      });

      showToast({
        type: "success",
        title: "Goal Created",
        description: `Tracking "${name}" with monthly target of ₹${monthly}.`,
      });

      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      setMonthlyContribution("");
      closeCreateGoalModal();
      onGoalCreated();
    } catch (e) {
      showToast({
        type: "error",
        title: "Failed",
        description: "Unable to save savings goal.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isCreateGoalModalOpen}
      onClose={closeCreateGoalModal}
      title="Create New Savings Goal"
      description="Set a financial milestone with intelligent pace projections"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Goal Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Vacation to Iceland, Car Down Payment..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Amount ($)
            </label>
            <input
              type="number"
              step="10"
              required
              placeholder="5000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Starting Amount ($)
            </label>
            <input
              type="number"
              step="10"
              placeholder="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Date
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Monthly Auto-Save ($)
            </label>
            <input
              type="number"
              step="10"
              placeholder="350"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Linked Funding Account
          </label>
          <select
            value={linkedAccountId}
            onChange={(e) => setLinkedAccountId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color / Icon Theme */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Theme Accent
            </label>
            <div className="flex items-center gap-2">
              {[
                "#10B981",
                "#6366F1",
                "#3B82F6",
                "#F59E0B",
                "#EC4899",
                "#06B6D4",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c
                      ? "ring-2 ring-white scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Icon Badge
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="ShieldCheck">Shield (Emergency)</option>
              <option value="Plane">Plane (Travel)</option>
              <option value="Laptop">Laptop (Tech)</option>
              <option value="Home">Home (Property)</option>
              <option value="Car">Car (Vehicle)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={closeCreateGoalModal}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            Save Goal
          </button>
        </div>
      </form>
    </Modal>
  );
};
