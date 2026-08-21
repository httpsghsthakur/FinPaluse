import React, { useState } from "react";
import {
  X,
  Sparkles,
  AlertCircle,
  Building2,
  Calendar,
  Tag,
  FileText,
  Check,
} from "lucide-react";
import { Transaction, Category, Account } from "../../types";
import { CategoryIcon } from "./CategoryIcon";
import { AmountText } from "./AmountText";
import { formatDate } from "../../lib/utils/formatters";
import { api } from "../../lib/api";
import { useUIStore } from "../../lib/store/useUIStore";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
  onUpdated: (updated: Transaction) => void;
}

export const TransactionDetailDrawer: React.FC<
  TransactionDetailDrawerProps
> = ({ transaction, categories, accounts, onClose, onUpdated }) => {
  const { showToast } = useUIStore();
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [notes, setNotes] = useState(transaction?.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!transaction) return null;

  const currentCategory = categories.find(
    (c) => c.id === transaction.categoryId,
  );
  const currentAccount = accounts.find((a) => a.id === transaction.accountId);

  const handleCategoryChange = async (newCategoryId: string) => {
    try {
      const updated = await api.updateTransaction(transaction.id, {
        categoryId: newCategoryId,
      });
      onUpdated(updated);
      setIsEditingCategory(false);
      const newCatName = categories.find((c) => c.id === newCategoryId)?.name;
      showToast({
        type: "success",
        title: "Category Updated",
        description: `AI is retraining on your correction to ${newCatName}.`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Update Failed",
        description: "Could not update transaction category.",
      });
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const updated = await api.updateTransaction(transaction.id, { notes });
      onUpdated(updated);
      showToast({
        type: "success",
        title: "Notes Saved",
      });
    } catch (e) {
      showToast({
        type: "error",
        title: "Save Failed",
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#0B0F19]/90 backdrop-blur-2xl border-l border-slate-800/80 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Transaction Details
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main info */}
          <div className="py-6 space-y-4">
            <div className="flex items-start gap-4">
              <CategoryIcon
                name={currentCategory?.icon || "Tag"}
                color={currentCategory?.color || "#10B981"}
                size="lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-100">
                  {transaction.merchant}
                </h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(transaction.date, "MMMM d, yyyy")}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Total Amount
              </span>
              <AmountText
                amount={transaction.amount}
                colored
                className="text-xl font-bold font-mono"
              />
            </div>

            {/* Anomaly banner if flagged */}
            {transaction.isAnomaly && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>AI Anomaly Flagged</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {transaction.anomalyReason ||
                    "This transaction deviates from your typical spending pattern."}
                </p>
              </div>
            )}

            {/* Category selection */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Category
                </span>
                <button
                  onClick={() => setIsEditingCategory(!isEditingCategory)}
                  className="text-emerald-400 hover:underline cursor-pointer text-[11px]"
                >
                  {isEditingCategory ? "Done" : "Change"}
                </button>
              </div>

              {isEditingCategory ? (
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-900 border border-slate-800 rounded-xl">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(c.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        c.id === transaction.categoryId
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <CategoryIcon name={c.icon} color={c.color} size="sm" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <CategoryIcon
                    name={currentCategory?.icon || "Tag"}
                    color={currentCategory?.color}
                    size="sm"
                  />
                  <span className="font-semibold text-slate-200">
                    {currentCategory?.name || "Uncategorized"}
                  </span>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Account
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-200 font-medium">
                  {currentAccount?.name || "Primary Account"}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  •••• {currentAccount?.mask || "0000"}
                </span>
              </div>
            </div>

            {/* AI Note: Why this category? */}
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Categorization Reasoning</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Categorized based on merchant keyword fingerprint (
                <span className="font-mono text-indigo-300">
                  {transaction.merchant}
                </span>
                ) and matched against the standard merchant classification
                register.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Personal Notes
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add receipt notes, tax deduction flags..."
                rows={2}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
