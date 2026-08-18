"""
FinPilot — Monte Carlo Financial Simulator (Model 8)

Performs stochastic simulations of personal financial trajectories across 12, 24, 36 months,
sampling from historical income volatility, expense shocks, and market returns.
"""
from __future__ import annotations

from typing import Any
import numpy as np


class MonteCarloSimulator:
    """Simulates financial trajectories under uncertainty."""

    def __init__(self, num_simulations: int = 1000, random_seed: int = 42):
        self.num_simulations = num_simulations
        self.random_seed = random_seed

    def simulate(
        self,
        initial_net_worth: float,
        monthly_income: float,
        monthly_expense: float,
        income_std: float = 400.0,
        expense_std: float = 300.0,
        months: int = 12,
        one_time_expense: float = 0.0,
    ) -> dict[str, Any]:
        """
        Run N simulations to compute percentiles (10th, 50th, 90th) of net worth.
        """
        np.random.seed(self.random_seed)

        trajectories = np.zeros((self.num_simulations, months + 1))
        trajectories[:, 0] = initial_net_worth - one_time_expense

        for t in range(1, months + 1):
            # Stochastic income and expense shock sampling
            incomes = np.random.normal(monthly_income, max(1.0, income_std), self.num_simulations)
            expenses = np.random.normal(monthly_expense, max(1.0, expense_std), self.num_simulations)
            net_flows = incomes - expenses

            trajectories[:, t] = trajectories[:, t - 1] + net_flows

        p10 = np.percentile(trajectories, 10, axis=0)
        p50 = np.percentile(trajectories, 50, axis=0)
        p90 = np.percentile(trajectories, 90, axis=0)

        return {
            "months": months,
            "simulations_count": self.num_simulations,
            "p10_conservative": [round(float(x), 2) for x in p10],
            "p50_median": [round(float(x), 2) for x in p50],
            "p90_optimistic": [round(float(x), 2) for x in p90],
            "final_median_net_worth": round(float(p50[-1]), 2),
            "probability_of_growth": round(float(np.mean(trajectories[:, -1] > initial_net_worth)), 2),
        }


monte_carlo_simulator = MonteCarloSimulator()
