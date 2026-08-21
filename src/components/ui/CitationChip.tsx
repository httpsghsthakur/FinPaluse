import React, { useState } from "react";
import { Database, ChevronDown, ChevronUp } from "lucide-react";
import { GroundedMetric } from "../../types";
import { cn } from "../../lib/utils/cn";

interface CitationChipProps {
  groundedData: GroundedMetric[];
  className?: string;
}

export const CitationChip: React.FC<CitationChipProps> = ({
  groundedData,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!groundedData || groundedData.length === 0) return null;

  return (
    <div className={cn("inline-block text-xs font-mono", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer text-xs font-medium"
      >
        <Database className="w-3 h-3 text-emerald-400" />
        <span>Grounded in your data ({groundedData.length} signals)</span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5 shadow-xl max-w-sm">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Data Grounding Evidence
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {groundedData.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50"
              >
                <div className="text-[10px] text-slate-400">{item.label}</div>
                <div className="font-semibold text-slate-200 truncate">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
