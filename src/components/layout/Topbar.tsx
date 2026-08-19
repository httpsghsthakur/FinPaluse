import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Sun,
  Moon,
  Plus,
  Bell,
  Menu,
  X,
  Bot,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useUserStore } from '../../lib/store/useUserStore';
import { useUIStore } from '../../lib/store/useUIStore';
import { CurrencyCode } from '../../types';
import { CURRENCY_SYMBOLS } from '../../lib/utils/formatters';
import { cn } from '../../lib/utils/cn';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const currency = useUserStore((s) => s.profile.currency);
  const setCurrency = useUserStore((s) => s.setCurrency);
  const theme = useUserStore((s) => s.profile.theme);
  const toggleTheme = useUserStore((s) => s.toggleTheme);

  const { isMobileNavOpen, toggleMobileNav, openAddTxModal, openPlaidModal, showToast } = useUIStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast({
        type: 'success',
        title: 'All Accounts Synced',
        description: 'Updated 3 bank connections and recomputed forecast bands.',
      });
    }, 800);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/transactions?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-[#0B0F19]/30 backdrop-blur-md border-b border-slate-800/60 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Mobile brand & hamburger */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={toggleMobileNav}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <NavLink to="/app" className="font-extrabold text-sm text-white flex items-center gap-1">
          <span>Finpluse</span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1 rounded border border-emerald-500/30">AI</span>
        </NavLink>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search transactions, merchants, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
        />
      </form>

      {/* Right actions toolbar */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Quick Add Transaction Button */}
        <button
          onClick={openAddTxModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 hover:bg-slate-800/60 backdrop-blur-md text-slate-200 text-xs font-semibold rounded-xl border border-slate-800/80 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Expense</span>
        </button>

        {/* Currency Switcher */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 text-slate-200 text-xs font-mono font-medium rounded-xl px-2.5 py-1.5 appearance-none pr-6 focus:outline-none focus:border-emerald-500 cursor-pointer"
            aria-label="Currency selection"
          >
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="INR">₹ INR</option>
          </select>
          <span className="absolute right-2 top-2 pointer-events-none text-[10px] text-slate-400">▾</span>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="p-2 rounded-xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition-all cursor-pointer"
          title="Sync Bank Feeds"
          aria-label="Sync all accounts"
        >
          <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin text-emerald-400')} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 text-slate-400 hover:text-amber-400 hover:border-slate-700 transition-all cursor-pointer"
          title="Toggle Light / Dark Mode"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Ask AI quick pill */}
        <NavLink
          to="/app/copilot"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ask Copilot</span>
        </NavLink>

        {/* User avatar menu */}
        <NavLink to="/app/settings" className="flex items-center gap-2 pl-1 group">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-8 h-8 rounded-xl object-cover border border-slate-700 group-hover:border-emerald-400 transition-colors"
          />
        </NavLink>
      </div>
    </header>
  );
};
