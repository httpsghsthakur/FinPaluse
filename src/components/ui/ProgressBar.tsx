import React from "react";
import { cn } from "../../lib/utils/cn";

interface ProgressBarProps {
  value: number; // 0 to 100 or beyond
  max?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showPercent?: boolean;
  warnThreshold?: number;
  dangerThreshold?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  size = "md",
  className,
  showPercent = false,
  warnThreshold = 80,
  dangerThreshold = 100,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const rawPercentage = (value / max) * 100;

  // Auto determine color based on budget thresholds if color not explicitly passed
  let barColor = color;
  if (!barColor) {
    if (rawPercentage >= dangerThreshold) {
      barColor = "#EF4444"; // Red
    } else if (rawPercentage >= warnThreshold) {
      barColor = "#F59E0B"; // Amber
    } else {
      barColor = "#10B981"; // Emerald
    }
  }

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-slate-800/80 dark:bg-slate-850 rounded-full overflow-hidden p-0.5 border border-slate-800",
          heightClasses[size],
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 10px ${barColor}40`,
          }}
        />
      </div>
      {showPercent && (
        <div className="flex justify-between items-center mt-1 text-xs text-slate-400 font-mono">
          <span>{rawPercentage.toFixed(0)}%</span>
          <span>
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
};
