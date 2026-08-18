import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface ConfidenceBadgeProps {
  confidence?: 'High' | 'Medium' | 'Low';
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence = 'High',
  className,
}) => {
  const styles = {
    High: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      text: 'High Confidence',
    },
    Medium: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: Sparkles,
      text: 'Medium Confidence',
    },
    Low: {
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: ShieldAlert,
      text: 'Low Confidence (Estimate)',
    },
  };

  const current = styles[confidence];
  const Icon = current.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border',
        current.bg,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {current.text}
    </span>
  );
};
