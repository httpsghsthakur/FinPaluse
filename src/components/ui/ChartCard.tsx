import React from 'react';
import { cn } from '../../lib/utils/cn';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footerNote?: string;
  className?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  actions,
  footerNote,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[28px] p-5 md:p-6 transition-all duration-200 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.2)]',
        className
      )}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <div className="w-full relative min-h-[260px] flex items-center justify-center">
          {children}
        </div>
      </div>

      {footerNote && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>{footerNote}</span>
        </div>
      )}
    </div>
  );
};
