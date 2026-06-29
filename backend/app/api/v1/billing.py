"""
Phase 11 — Billing API (Stripe)
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.stripe_client import (
    PLANS, create_customer, create_checkout_session,
    create_portal_session, list_invoices, construct_webhook_event,
)
from app.core.config import settings
from app.models.subscription import Subscription
from app.models.user import User

router = APIRouter(prefix="/billing", tags=["Billing"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    plan: str  # "pro" | "enterprise"
    success_url: str = "http://localhost:3000/billing?success=1"
    cancel_url: str = "http://localhost:3000/billing?cancelled=1"


class SubscriptionOut(BaseModel):
    plan: str
    status: str
    current_period_end: str | None

    class Config:
        from_attributes = True


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_or_create_subscription(user: User, db: AsyncSession) -> Subscription:
    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = result.scalar_one_or_none()
    if not sub:
        sub = Subscription(user_id=user.id, plan="free", status="active")
        db.add(sub)
        await db.commit()
        await db.refresh(sub)
    return sub


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/plans")
async def get_plans() -> dict:
    """Return all available plan definitions with features and limits."""
    return {"success": True, "data": PLANS}


@router.get("/me", response_model=SubscriptionOut)
async def get_my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    sub = await _get_or_create_subscription(current_user, db)
    return SubscriptionOut(
        plan=sub.plan,
        status=sub.status,
        current_period_end=sub.current_period_end.isoformat() if sub.current_period_end else None,
    )


@router.post("/subscribe")
async def start_checkout(
    body: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Create a Stripe Checkout session for plan upgrade."""
    if body.plan not in ("pro", "enterprise"):
        raise HTTPException(status_code=400, detail="Invalid plan")
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    price_id = (
        settings.STRIPE_PRO_PRICE_ID if body.plan == "pro" else settings.STRIPE_ENTERPRISE_PRICE_ID
    )
    if not price_id:
        raise HTTPException(status_code=503, detail="Stripe price ID not configured")

    sub = await _get_or_create_subscription(current_user, db)

    # Create Stripe customer if needed
    if not sub.stripe_customer_id:
        customer_id = await create_customer(current_user.email)
        sub.stripe_customer_id = customer_id
        await db.commit()
    else:
        customer_id = sub.stripe_customer_id

    url = await create_checkout_session(customer_id, price_id, body.success_url, body.cancel_url)
    return {"success": True, "data": {"checkout_url": url}}


@router.post("/portal")
async def billing_portal(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Create a Stripe Customer Portal session."""
    sub = await _get_or_create_subscription(current_user, db)
    if not sub.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found")
    url = await create_portal_session(
        sub.stripe_customer_id,
        return_url="http://localhost:3000/billing",
    )
    return {"success": True, "data": {"portal_url": url}}


@router.get("/invoices")
async def get_invoices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    sub = await _get_or_create_subscription(current_user, db)
    if not sub.stripe_customer_id:
        return {"success": True, "data": []}
    invoices = await list_invoices(sub.stripe_customer_id)
    return {"success": True, "data": invoices}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle Stripe webhooks to sync subscription status."""
    payload = await request.body()
    try:
        event = construct_webhook_event(payload, stripe_signature or "")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "customer.subscription.updated":
        stripe_sub = event["data"]["object"]
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub["id"])
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.status = stripe_sub["status"]
            import datetime
            sub.current_period_end = datetime.datetime.fromtimestamp(
                stripe_sub["current_period_end"], tz=datetime.timezone.utc
            )
            await db.commit()

    elif event["type"] == "customer.subscription.deleted":
        stripe_sub = event["data"]["object"]
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub["id"])
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.plan = "free"
            sub.status = "cancelled"
            sub.stripe_subscription_id = None
            await db.commit()

    return {"received": True}
