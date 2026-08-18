"""
FinPilot — Recurring Payment Detector (Model 2)

Detects recurring subscriptions, rent, insurance, utility bills, and salary patterns
using time-interval clustering, date-of-month recurrence, and amount variance scoring.
"""
from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Any
import numpy as np
import pandas as pd


class RecurringPaymentDetector:
    """Detects recurring financial obligations and subscriptions."""

    def __init__(self, min_occurrences: int = 2, max_amount_cv: float = 0.15):
        self.min_occurrences = min_occurrences
        self.max_amount_cv = max_amount_cv  # Coefficient of variation threshold for amount

    def detect_recurring(self, transactions_df: pd.DataFrame) -> list[dict[str, Any]]:
        """
        Analyze a DataFrame of transactions to identify recurring payment series.
        Expected columns: ['merchant', 'amount', 'date', 'account_id', 'category_id'].
        """
        if transactions_df.empty:
            return []

        df = transactions_df.copy()
        if not pd.api.types.is_datetime64_any_dtype(df["date"]):
            df["date"] = pd.to_datetime(df["date"])

        df["abs_amount"] = df["amount"].abs()
        recurring_list: list[dict[str, Any]] = []

        for merchant, group in df.groupby("merchant"):
            if len(group) < self.min_occurrences:
                continue

            sorted_group = group.sort_values("date").reset_index(drop=True)
            dates = sorted_group["date"].values
            amounts = sorted_group["abs_amount"].values

            # Time intervals between consecutive transactions in days
            intervals = np.diff(dates).astype("timedelta64[D]").astype(int)
            if len(intervals) == 0:
                continue

            mean_interval = float(np.mean(intervals))
            std_interval = float(np.std(intervals)) if len(intervals) > 1 else 0.0

            mean_amount = float(np.mean(amounts))
            std_amount = float(np.std(amounts)) if len(amounts) > 1 else 0.0
            amount_cv = (std_amount / mean_amount) if mean_amount > 0 else 0.0

            # Classify interval frequency
            frequency = "unknown"
            is_recurring = False
            confidence = 0.0

            if 25 <= mean_interval <= 35 and std_interval <= 5.0:
                frequency = "monthly"
                is_recurring = True
                confidence = max(0.6, 0.98 - (std_interval * 0.04) - (amount_cv * 0.2))
            elif 6 <= mean_interval <= 8 and std_interval <= 2.0:
                frequency = "weekly"
                is_recurring = True
                confidence = max(0.6, 0.95 - (std_interval * 0.05) - (amount_cv * 0.2))
            elif 13 <= mean_interval <= 16 and std_interval <= 3.0:
                frequency = "biweekly"
                is_recurring = True
                confidence = max(0.6, 0.95 - (std_interval * 0.04) - (amount_cv * 0.2))
            elif 80 <= mean_interval <= 100 and std_interval <= 10.0:
                frequency = "quarterly"
                is_recurring = True
                confidence = max(0.6, 0.90 - (std_interval * 0.02) - (amount_cv * 0.2))
            elif 350 <= mean_interval <= 380 and std_interval <= 15.0:
                frequency = "yearly"
                is_recurring = True
                confidence = max(0.6, 0.90 - (std_interval * 0.01) - (amount_cv * 0.2))

            # Additional check: same date of month
            day_of_months = sorted_group["date"].dt.day.values
            dom_std = float(np.std(day_of_months)) if len(day_of_months) > 1 else 0.0
            if dom_std <= 2.0 and len(group) >= 3 and not is_recurring:
                frequency = "monthly"
                is_recurring = True
                confidence = 0.88

            if is_recurring and amount_cv <= self.max_amount_cv + 0.10:
                last_tx_date = pd.to_datetime(sorted_group["date"].max())
                
                # Predict next date
                if frequency == "monthly":
                    expected_next = last_tx_date + pd.DateOffset(months=1)
                elif frequency == "weekly":
                    expected_next = last_tx_date + pd.DateOffset(weeks=1)
                elif frequency == "biweekly":
                    expected_next = last_tx_date + pd.DateOffset(weeks=2)
                elif frequency == "quarterly":
                    expected_next = last_tx_date + pd.DateOffset(months=3)
                elif frequency == "yearly":
                    expected_next = last_tx_date + pd.DateOffset(years=1)
                else:
                    expected_next = last_tx_date + timedelta(days=int(mean_interval))

                cat_id = sorted_group["category_id"].iloc[0] if "category_id" in sorted_group.columns else "cat-subscriptions"
                acc_id = sorted_group["account_id"].iloc[0] if "account_id" in sorted_group.columns else "acc-checking"

                recurring_list.append({
                    "merchant": str(merchant),
                    "is_recurring": True,
                    "frequency": frequency,
                    "expected_next_date": expected_next.strftime("%Y-%m-%d"),
                    "expected_amount": round(mean_amount, 2),
                    "amount_variance": round(std_amount, 2),
                    "confidence": round(float(confidence), 2),
                    "occurrence_count": int(len(group)),
                    "last_seen_date": last_tx_date.strftime("%Y-%m-%d"),
                    "category_id": cat_id,
                    "account_id": acc_id,
                })

        # Sort by expected next date ascending
        recurring_list.sort(key=lambda x: x["expected_next_date"])
        return recurring_list


recurring_detector = RecurringPaymentDetector()
