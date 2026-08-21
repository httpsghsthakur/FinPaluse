import React from "react";
import { LucideIcon, FolderSearch } from "lucide-react";
import { cn } from "../../lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = FolderSearch,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30",
        className,
      )}
    >
      <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs md:text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
