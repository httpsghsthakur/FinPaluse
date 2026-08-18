"""
FinPilot — Simulator Service

Deterministic financial simulation engine.
Matches the frontend's mock simulator logic but with proper backend calculation.
"""
from __future__ import annotations

from datetime import datetime
from dateutil.relativedelta import relativedelta

from app.schemas.simulator import (
    ScenarioRequest,
    ScenarioResultResponse,
    ScenarioResultPoint,
    GoalImpact,
)


class SimulatorService:
    """What-if financial simulator engine."""

    def run_simulation(
        self,
        scenario: ScenarioRequest,
        accounts: list[dict],
        goals: list[dict],
        base_monthly_income: float = 7700.0,
        base_monthly_expense: float = 4250.0,
    ) -> ScenarioResultResponse:
        """Run a deterministic what-if simulation matching frontend contract."""

        # Calculate baseline figures
        total_checking = sum(
            a.get("balance", 0) for a in accounts if a.get("type") == "checking"
        )
        total_savings = sum(
            a.get("balance", 0) for a in accounts if a.get("type") == "savings"
        )
        total_credit = sum(
            a.get("balance", 0) for a in accounts if a.get("type") == "credit"
        )
        initial_liquid = total_checking + total_savings
        initial_net_worth = initial_liquid + total_credit

        base_monthly_net = base_monthly_income - base_monthly_expense
        baseline_runway = round(initial_liquid / base_monthly_expense, 1) if base_monthly_expense else 0

        # Scenario adjustments
        income_change_pct = scenario.income_change_pct or 0
        income_factor = (100 + income_change_pct) / 100
        expense_cut_pct = scenario.expense_cut_pct or 0
        expense_reduction = (expense_cut_pct / 100) * 800
        monthly_savings_change = scenario.monthly_savings_change or 0
        one_time_expense = scenario.one_time_expense or 0
        zero_income_months = scenario.months_without_income or 0

        scenario_monthly_income = base_monthly_income * income_factor
        scenario_monthly_expense = max(
            1500, base_monthly_expense - expense_reduction - monthly_savings_change
        )

        sim_liquid = initial_liquid - one_time_expense
        scenario_runway = round(
            max(0, sim_liquid) / scenario_monthly_expense, 1
        ) if scenario_monthly_expense else 0

        # 12-month projections
        monthly_points: list[ScenarioResultPoint] = []
        base_running_nw = initial_net_worth
        scen_running_nw = initial_net_worth - one_time_expense
        now = datetime.now()

        for m in range(13):
            month_label = (now + relativedelta(months=m)).strftime("%b %y")

            if m > 0:
                base_running_nw += base_monthly_net
                effective_income = 0.0 if m <= zero_income_months else scenario_monthly_income
                scen_delta = effective_income - scenario_monthly_expense + monthly_savings_change
                scen_running_nw += scen_delta

            monthly_points.append(
                ScenarioResultPoint(
                    month=month_label,
                    baseline=round(base_running_nw),
                    scenario=round(scen_running_nw),
                )
            )

        # Goal impacts
        goal_impacts: list[GoalImpact] = []
        for g in goals:
            remaining = max(0, g.get("target_amount", 0) - g.get("current_amount", 0))
            orig_monthly = g.get("monthly_contribution", 400) or 400
            orig_months = max(1, -(-remaining // orig_monthly))  # ceiling division

            new_monthly = orig_monthly
            if income_change_pct < 0:
                new_monthly = max(50, orig_monthly * (1 + income_change_pct / 100))
            elif monthly_savings_change > 0:
                new_monthly = orig_monthly + monthly_savings_change * 0.4

            delay_penalty = 0
            if one_time_expense > 5000:
                delay_penalty = round(one_time_expense / 4000)
            if zero_income_months > 0:
                delay_penalty += zero_income_months

            new_months = max(1, -(-remaining // new_monthly) + delay_penalty)
            delayed = new_months - orig_months

            goal_impacts.append(
                GoalImpact(
                    goal_id=g.get("id", ""),
                    goal_name=g.get("name", ""),
                    original_months=int(orig_months),
                    new_months=int(new_months),
                    delayed_months=int(delayed),
                )
            )

        return ScenarioResultResponse(
            scenario_id=scenario.id,
            baseline_runway_months=baseline_runway,
            scenario_runway_months=scenario_runway,
            baseline_net_worth_12m=monthly_points[-1].baseline if monthly_points else 0,
            scenario_net_worth_12m=monthly_points[-1].scenario if monthly_points else 0,
            monthly_points=monthly_points,
            goal_impacts=goal_impacts,
        )


simulator_service = SimulatorService()
