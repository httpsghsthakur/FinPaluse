import React from "react";
import { useUserStore } from "../../lib/store/useUserStore";
import { formatCurrency } from "../../lib/utils/formatters";
import { cn } from "../../lib/utils/cn";

interface AmountTextProps {
  amount: number;
  showSign?: boolean;
  colored?: boolean;
  className?: string;
  compact?: boolean;
  showDecimals?: boolean;
  currencyOverride?: "USD" | "EUR" | "GBP" | "INR";
}

export const AmountText: React.FC<AmountTextProps> = ({
  amount,
  showSign = false,
  colored = false,
  className,
  compact = false,
  showDecimals = true,
  currencyOverride,
}) => {
  const userCurrency = useUserStore((s) => s.profile.currency);
  const currency = currencyOverride || userCurrency;

  const isPositive = amount > 0;
  const isNegative = amount < 0;

  const colorClass = colored
    ? isPositive
      ? "text-emerald-400 dark:text-emerald-400"
      : isNegative
        ? "text-slate-200 dark:text-slate-100"
        : "text-slate-400"
    : "";

  return (
    <span
      className={cn(
        "tabular-nums font-mono font-medium",
        colorClass,
        className,
      )}
    >
      {formatCurrency(amount, currency, {
        showSign,
        compact,
        showDecimals,
      })}
    </span>
  );
};
