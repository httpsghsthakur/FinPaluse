"""
FinPilot — Goal Projection Engine (Model 9)

Computes deterministic completion probabilities, projected completion dates,
required monthly contributions, shortfalls, and acceleration opportunities.
"""
from __future__ import annotations

from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from typing import Any
import math


class GoalProjectionEngine:
    """Calculates deterministic goal progress metrics and timeline projections."""

    def evaluate_goal(
        self,
        target_amount: float,
        current_amount: float,
        monthly_contribution: float,
        deadline_date_str: str,
        expected_annual_return_pct: float = 4.5,
    ) -> dict[str, Any]:
        """
        Evaluate goal completion feasibility, timeline, and required contributions.
        """
        remaining = max(0.0, target_amount - current_amount)
        if remaining <= 0:
            return {
                "is_completed": True,
                "completion_probability": 1.0,
                "projected_completion_date": datetime.now().strftime("%Y-%m-%d"),
                "months_remaining": 0,
                "required_monthly_contribution": 0.0,
                "shortfall": 0.0,
                "boost_suggestion": "Goal achieved! Consider starting a new goal.",
            }

        effective_contribution = max(10.0, monthly_contribution)
        months_to_complete = math.ceil(remaining / effective_contribution)

        today = datetime.now()
        projected_date = today + relativedelta(months=months_to_complete)

        # Parse deadline
        try:
            deadline = datetime.strptime(deadline_date_str, "%Y-%m-%d")
        except ValueError:
            deadline = today + relativedelta(years=1)

        months_until_deadline = max(
            1,
            (deadline.year - today.year) * 12 + (deadline.month - today.month)
        )

        required_monthly = round(remaining / months_until_deadline, 2)
        shortfall = max(0.0, target_amount - (current_amount + effective_contribution * months_until_deadline))
        on_track = projected_date <= deadline

        # Probability score based on timeline ratio
        time_ratio = months_until_deadline / months_to_complete if months_to_complete > 0 else 1.0
        prob = min(0.98, max(0.20, time_ratio * 0.90))

        # Boost suggestions
        if not on_track:
            monthly_diff = required_monthly - effective_contribution
            boost_suggestion = f"Increase contribution by ₹{monthly_diff:.2f}/mo to meet your deadline."
        else:
            accelerate_months = 2
            accel_contrib = round(remaining / max(1, months_to_complete - accelerate_months), 2)
            boost_suggestion = f"Adding ₹{accel_contrib - effective_contribution:.2f}/mo will complete this {accelerate_months} months earlier."

        return {
            "is_completed": False,
            "completion_probability": round(prob, 2),
            "projected_completion_date": projected_date.strftime("%Y-%m-%d"),
            "months_to_complete": months_to_complete,
            "months_until_deadline": months_until_deadline,
            "required_monthly_contribution": required_monthly,
            "shortfall": round(shortfall, 2),
            "on_track": on_track,
            "boost_suggestion": boost_suggestion,
        }


goal_engine = GoalProjectionEngine()
