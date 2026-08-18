import React, { useState } from 'react';
import { Modal } from './Modal';
import { useUIStore } from '../../lib/store/useUIStore';
import { Category, Account } from '../../types';
import { api } from '../../lib/api';
import { format } from 'date-fns';

interface AddTransactionModalProps {
  categories: Category[];
  accounts: Account[];
  onAdded: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  categories,
  accounts,
  onAdded,
}) => {
  const { isAddTxModalOpen, closeAddTxModal, showToast } = useUIStore();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState(categories[1]?.id || 'cat-groceries');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-checking');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setIsSubmitting(true);
    try {
      const finalAmount = type === 'expense' ? -num : num;
      await api.addTransaction({
        merchant,
        amount: finalAmount,
        categoryId: type === 'income' ? 'cat-income' : categoryId,
        accountId,
        date,
        status: 'settled',
        isRecurring: false,
        notes: notes || undefined,
      });

      showToast({
        type: 'success',
        title: 'Transaction Logged',
        description: `Added ${merchant} (${type === 'expense' ? '-' : '+'}$${num.toFixed(2)})`,
      });

      setMerchant('');
      setAmount('');
      setNotes('');
      closeAddTxModal();
      onAdded();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to record transaction.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAddTxModalOpen}
      onClose={closeAddTxModal}
      title="Add Transaction"
      description="Record a manual expense or income entry"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income (+)
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Merchant / Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Trader Joe's, Uber, Client Wire..."
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {categories
                .filter((c) => c.type === 'expense')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (•••• {a.mask})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Optional)</label>
          <input
            type="text"
            placeholder="Tags or item breakdown"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={closeAddTxModal}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            Save Transaction
          </button>
        </div>
      </form>
    </Modal>
  );
};
