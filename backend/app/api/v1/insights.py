"""Insights endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.insight import Insight
from app.schemas.insight import InsightResponse, WeeklyDigestResponse
from app.services.seed_service import DEMO_USER_ID

router = APIRouter()


def _insight_to_response(ins: Insight) -> dict:
    grounded = ins.grounded_data if isinstance(ins.grounded_data, list) else []
    return {
        "id": ins.id,
        "title": ins.title,
        "description": ins.description,
        "severity": ins.severity,
        "type": ins.type,
        "date": ins.date.isoformat() if ins.date else "",
        "isDismissed": ins.is_dismissed,
        "isLiked": ins.is_liked,
        "whyExplanation": ins.why_explanation or "",
        "groundedData": grounded,
        "actionLabel": ins.action_label,
        "actionPath": ins.action_path,
    }


@router.get("", response_model=list[InsightResponse])
async def get_insights(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Insight).where(Insight.user_id == DEMO_USER_ID).order_by(Insight.date.desc())
    )
    return [_insight_to_response(i) for i in result.scalars().all()]


@router.post("/{insight_id}/dismiss", status_code=204)
async def dismiss_insight(insight_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Insight).where(Insight.id == insight_id, Insight.user_id == DEMO_USER_ID)
    )
    ins = result.scalar_one_or_none()
    if not ins:
        raise HTTPException(status_code=404, detail="Insight not found")
    ins.is_dismissed = True
    await db.flush()


@router.post("/{insight_id}/like", status_code=204)
async def like_insight(insight_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Insight).where(Insight.id == insight_id, Insight.user_id == DEMO_USER_ID)
    )
    ins = result.scalar_one_or_none()
    if not ins:
        raise HTTPException(status_code=404, detail="Insight not found")
    ins.is_liked = not (ins.is_liked or False)
    await db.flush()


@router.get("/digest/weekly", response_model=WeeklyDigestResponse)
async def get_weekly_digest(db: AsyncSession = Depends(get_db)):
    """Weekly digest — Phase 1: static, Phase 7: computed from analytics."""
    from datetime import datetime, timedelta
    now = datetime.now()
    week_start = now - timedelta(days=7)
    return {
        "weekRange": f"{week_start.strftime('%b %d')} – {now.strftime('%b %d, %Y')}",
        "summaryTitle": "High savings momentum, watch dining pace",
        "totalIncome": 3850.0,
        "totalExpenses": 1120.4,
        "netSavings": 2729.6,
        "topCategoryName": "Dining & Drinks",
        "topCategorySpend": 298.5,
        "vsLastWeekPct": -8.4,
        "bullets": [
            "Total spending was 8.4% lower than last week, led by fewer discretionary retail purchases.",
            "Marcus HYSA yield generated +$34.60 in accrued interest this week.",
            "1 unusual transaction flagged at Apple Store ($489.00), Amex card balance is within standard cycle limit.",
        ],
        "actionableTip": "Moving $150 from this week's surplus to your Tokyo Trip goal will bring completion 18 days forward.",
        "anomaliesDetectedCount": 1,
    }
