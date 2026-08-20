
"""
FinPilot — Centralized Feature Store

Calculates reusable personal financial features across accounts, transactions,
and time horizons without duplication.
"""
from __future__ import annotations

from typing import Any
import pandas as pd
import numpy as np


class FeatureStore:
    """Centralized feature computation engine."""

    @staticmethod
    def compute_user_aggregate_features(transactions_df: pd.DataFrame) -> dict[str, float]:
        """Compute user-level aggregate financial metrics."""
        if transactions_df.empty:
            return {
                "monthly_income": 0.0,
                "monthly_expense": 0.0,
                "income_volatility": 0.0,
                "expense_volatility": 0.0,
                "savings_rate": 0.0,
                "avg_transaction_amount": 0.0,
                "transaction_frequency_weekly": 0.0,
            }

        df = transactions_df.copy()
        if not pd.api.types.is_datetime64_any_dtype(df["date"]):
            df["date"] = pd.to_datetime(df["date"])

        inflows = df[df["amount"] > 0]["amount"]
        outflows = df[df["amount"] < 0]["amount"].abs()

        total_income = inflows.sum()
        total_expense = outflows.sum()

        days_span = max(1, (df["date"].max() - df["date"].min()).days)
        months_span = max(1.0, days_span / 30.4)

        monthly_income = float(total_income / months_span)
        monthly_expense = float(total_expense / months_span)

        income_volatility = float(inflows.std() if len(inflows) > 1 else 0.0)
        expense_volatility = float(outflows.std() if len(outflows) > 1 else 0.0)

        savings_rate = float(
            max(0.0, (monthly_income - monthly_expense) / monthly_income * 100)
            if monthly_income > 0 else 0.0
        )

        return {
            "monthly_income": round(monthly_income, 2),
            "monthly_expense": round(monthly_expense, 2),
            "income_volatility": round(income_volatility, 2),
            "expense_volatility": round(expense_volatility, 2),
            "savings_rate": round(savings_rate, 2),
            "avg_transaction_amount": round(float(df["amount"].abs().mean()), 2),
            "transaction_frequency_weekly": round(float(len(df) / (days_span / 7.0)), 2),
        }

    @staticmethod
    def compute_merchant_profile(transactions_df: pd.DataFrame) -> pd.DataFrame:
        """Compute historical merchant statistics for contextual transaction features."""
        if transactions_df.empty:
            return pd.DataFrame(columns=["merchant", "merchant_tx_count", "merchant_avg_amount", "merchant_std_amount"])

        df = transactions_df.copy()
        df["abs_amount"] = df["amount"].abs()

        grouped = df.groupby("merchant").agg(
            merchant_tx_count=("abs_amount", "count"),
            merchant_avg_amount=("abs_amount", "mean"),
            merchant_std_amount=("abs_amount", "std"),
        ).reset_index()

        grouped["merchant_std_amount"] = grouped["merchant_std_amount"].fillna(0.0)
        return grouped
