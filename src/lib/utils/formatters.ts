import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { CurrencyCode } from '../../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    showSign?: boolean;
  }
): string {
  const { showDecimals = true, compact = false, showSign = false } = options || {};
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber = '';

  if (compact && absAmount >= 1000) {
    if (absAmount >= 1000000) {
      formattedNumber = (absAmount / 1000000).toFixed(1) + 'M';
    } else {
      formattedNumber = (absAmount / 1000).toFixed(1) + 'k';
    }
  } else {
    formattedNumber = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
  }

  const sign = isNegative ? '-' : showSign && amount > 0 ? '+' : '';
  return `${sign}${symbol}${formattedNumber}`;
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(dateString: string, formatPattern = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateString), formatPattern);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}
