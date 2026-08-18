import React, { useEffect, useState } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { useUserStore } from '../../lib/store/useUserStore';
import { formatCurrency } from '../../lib/utils/formatters';

interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  changePct?: number;
  changePeriodText?: string;
  icon?: LucideIcon;
  subtext?: string;
  badge?: {
    text: string;
    variant?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
  };
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  isCurrency = true,
  changePct,
  changePeriodText = 'vs last month',
  icon: Icon,
  subtext,
  badge,
  onClick,
}) => {
  const currency = useUserStore((s) => s.profile.currency);
  const [displayValue, setDisplayValue] = useState(0);

  // Smooth Count-Up Effect on mount or value change
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 600;
    const steps = 24;
    const increment = (end - start) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        start += increment;
        setDisplayValue(start);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formattedDisplay = isCurrency
    ? formatCurrency(displayValue, currency, { showDecimals: true })
    : `${prefix}${displayValue.toLocaleString('en-US', { maximumFractionDigits: 1 })}${suffix}`;

  const isPositive = (changePct ?? 0) > 0;
  const isNegative = (changePct ?? 0) < 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-slate-900/40 backdrop-blur-md border border-slate-800/60 hover:border-slate-700/80 rounded-[24px] p-5.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]',
        onClick ? 'cursor-pointer' : ''
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
          {formattedDisplay}
        </div>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {badge.text}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        {changePct !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center font-bold font-mono px-1.5 py-0.5 rounded-lg text-xs',
                isPositive
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : isNegative
                  ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                  : 'text-slate-400 bg-slate-800/50 border border-slate-700/50'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : isNegative ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <Minus className="w-3 h-3 mr-1" />
              )}
              {isPositive ? '+' : ''}
              {changePct.toFixed(1)}%
            </span>
            <span className="text-slate-400 text-xs truncate">{changePeriodText}</span>
          </div>
        ) : subtext ? (
          <span className="text-slate-400 text-xs truncate">{subtext}</span>
        ) : null}
      </div>
    </div>
  );
};
