"""Ads Manager: accounts, campaigns, metrics."""
from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..deps import current_user
from ..models import AdAccount, AdCampaign, AdMetric, Person
from ..schemas import (
    AdAccountOut, AdAccountIn,
    AdCampaignOut, AdCampaignIn, AdCampaignPatch,
    AdMetricOut, AdMetricIn,
)

router = APIRouter()


# ---------------- Ad Accounts ----------------
@router.get("/ads/accounts", response_model=list[AdAccountOut])
async def list_accounts(
    business_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    q = select(AdAccount)
    if business_id:
        q = q.where(AdAccount.business_id == business_id)
    return (await db.execute(q.order_by(AdAccount.platform))).scalars().all()


@router.post("/ads/accounts", response_model=AdAccountOut, status_code=201)
async def create_account(
    data: AdAccountIn,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    acc = AdAccount(**data.model_dump())
    db.add(acc)
    await db.commit()
    await db.refresh(acc)
    return acc


@router.delete("/ads/accounts/{aid}", status_code=204)
async def delete_account(
    aid: UUID,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    acc = (await db.execute(select(AdAccount).where(AdAccount.id == aid))).scalar_one_or_none()
    if not acc:
        raise HTTPException(404, "account not found")
    await db.delete(acc)
    await db.commit()


# ---------------- Campaigns ----------------
@router.get("/ads/campaigns", response_model=list[AdCampaignOut])
async def list_campaigns(
    account_id: Optional[UUID] = None,
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    q = select(AdCampaign)
    if account_id:
        q = q.where(AdCampaign.ad_account_id == account_id)
    if platform:
        q = q.join(AdAccount).where(AdAccount.platform == platform)
    return (await db.execute(q.order_by(AdCampaign.name))).scalars().all()


@router.post("/ads/campaigns", response_model=AdCampaignOut, status_code=201)
async def create_campaign(
    data: AdCampaignIn,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    camp = AdCampaign(**data.model_dump())
    db.add(camp)
    await db.commit()
    await db.refresh(camp)
    return camp


@router.patch("/ads/campaigns/{cid}", response_model=AdCampaignOut)
async def patch_campaign(
    cid: UUID,
    data: AdCampaignPatch,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    camp = (await db.execute(select(AdCampaign).where(AdCampaign.id == cid))).scalar_one_or_none()
    if not camp:
        raise HTTPException(404, "campaign not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(camp, k, v)
    await db.commit()
    await db.refresh(camp)
    return camp


@router.delete("/ads/campaigns/{cid}", status_code=204)
async def delete_campaign(
    cid: UUID,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    camp = (await db.execute(select(AdCampaign).where(AdCampaign.id == cid))).scalar_one_or_none()
    if not camp:
        raise HTTPException(404, "campaign not found")
    await db.delete(camp)
    await db.commit()


# ---------------- Metrics ----------------
@router.get("/ads/metrics", response_model=list[AdMetricOut])
async def list_metrics(
    campaign_id: Optional[UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    q = select(AdMetric)
    if campaign_id:
        q = q.where(AdMetric.campaign_id == campaign_id)
    if date_from:
        q = q.where(AdMetric.date >= date_from)
    if date_to:
        q = q.where(AdMetric.date <= date_to)
    return (await db.execute(q.order_by(AdMetric.date.desc()))).scalars().all()


@router.post("/ads/metrics", response_model=AdMetricOut, status_code=201)
async def create_metric(
    data: AdMetricIn,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    m = AdMetric(**data.model_dump())
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return m


# ---------------- Aggregated Summary ----------------
@router.get("/ads/summary")
async def ads_summary(
    business_id: Optional[UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    p: Person = Depends(current_user),
):
    """Aggregated KPIs across all campaigns."""
    q = select(
        func.coalesce(func.sum(AdMetric.spend), 0).label("total_spend"),
        func.coalesce(func.sum(AdMetric.clicks), 0).label("total_clicks"),
        func.coalesce(func.sum(AdMetric.impressions), 0).label("total_impressions"),
        func.coalesce(func.sum(AdMetric.conversions), 0).label("total_conversions"),
    ).join(AdCampaign, AdMetric.campaign_id == AdCampaign.id)

    if business_id:
        q = q.join(AdAccount, AdCampaign.ad_account_id == AdAccount.id).where(AdAccount.business_id == business_id)
    if date_from:
        q = q.where(AdMetric.date >= date_from)
    if date_to:
        q = q.where(AdMetric.date <= date_to)

    row = (await db.execute(q)).one()
    total_spend = float(row.total_spend)
    total_conversions = int(row.total_conversions)
    avg_cpa = round(total_spend / total_conversions, 2) if total_conversions else 0
    return {
        "total_spend": total_spend,
        "total_clicks": int(row.total_clicks),
        "total_impressions": int(row.total_impressions),
        "total_conversions": total_conversions,
        "avg_cpa": avg_cpa,
    }
