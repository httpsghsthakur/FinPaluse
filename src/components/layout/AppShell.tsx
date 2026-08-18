import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../ui/ToastContainer';
import { PlaidModal } from '../ui/PlaidModal';
import { AddTransactionModal } from '../ui/AddTransactionModal';
import { CsvImportModal } from '../ui/CsvImportModal';
import { CreateGoalModal } from '../ui/CreateGoalModal';
import { TransactionDetailDrawer } from '../ui/TransactionDetailDrawer';
import { useUIStore } from '../../lib/store/useUIStore';
import { api } from '../../lib/api';
import { Category, Account, Transaction } from '../../types';

export const AppShell: React.FC = () => {
  const { selectedTxIdForDetail, closeTxDetail } = useUIStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const loadBaseData = async () => {
    try {
      const [catList, accList] = await Promise.all([api.getCategories(), api.getAccounts()]);
      setCategories(catList);
      setAccounts(accList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  // When selectedTxIdForDetail changes, fetch the transaction
  useEffect(() => {
    if (selectedTxIdForDetail) {
      api.getTransactions().then((res) => {
        const found = res.transactions.find((t) => t.id === selectedTxIdForDetail);
        if (found) setSelectedTx(found);
      });
    } else {
      setSelectedTx(null);
    }
  }, [selectedTxIdForDetail]);

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-slate-100 overflow-hidden font-sans relative">
      {/* Frosted Glass Ambient Lighting Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[25%] w-[30%] h-[30%] bg-teal-500/5 rounded-full blur-[110px]" />
      </div>

      {/* Sidebar for desktop/tablet */}
      <Sidebar />

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <PlaidModal onAccountAdded={loadBaseData} />
      <AddTransactionModal categories={categories} accounts={accounts} onAdded={loadBaseData} />
      <CsvImportModal onImported={loadBaseData} />
      <CreateGoalModal accounts={accounts} onGoalCreated={loadBaseData} />
      <TransactionDetailDrawer
        transaction={selectedTx}
        categories={categories}
        accounts={accounts}
        onClose={closeTxDetail}
        onUpdated={(updated) => {
          setSelectedTx(updated);
          loadBaseData();
        }}
      />
    </div>
  );
};
