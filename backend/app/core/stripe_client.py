"""
Phase 11 — Stripe billing client
"""
from __future__ import annotations

import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

STRIPE_BASE = "https://api.stripe.com/v1"

# ── Plan metadata ─────────────────────────────────────────────────────────────

PLANS = {
    "free": {
        "name": "Free",
        "price_usd": 0,
        "job_limit": settings.FREE_JOB_LIMIT,
        "ai_access": False,
        "features": [
            f"Up to {settings.FREE_JOB_LIMIT} active job posts",
            "Basic candidate search",
            "Email support",
        ],
    },
    "pro": {
        "name": "Pro",
        "price_usd": 49,
        "job_limit": settings.PRO_JOB_LIMIT,
        "ai_access": True,
        "features": [
            f"Up to {settings.PRO_JOB_LIMIT} active job posts",
            "AI semantic search & matching",
            "Recruiter Intelligence dashboard",
            "Company profiles",
            "Priority support",
        ],
    },
    "enterprise": {
        "name": "Enterprise",
        "price_usd": 199,
        "job_limit": None,
        "ai_access": True,
        "features": [
            "Unlimited job posts",
            "Full AI & ML Operations suite",
            "Advanced analytics",
            "Audit logs & compliance",
            "Dedicated account manager",
            "SLA guarantee",
        ],
    },
}


# ── Low-level Stripe API helper ───────────────────────────────────────────────

async def _stripe_post(endpoint: str, data: dict) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{STRIPE_BASE}/{endpoint}",
            data=data,
            auth=(settings.STRIPE_SECRET_KEY or "", ""),
        )
        resp.raise_for_status()
        return resp.json()


async def _stripe_get(endpoint: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{STRIPE_BASE}/{endpoint}",
            auth=(settings.STRIPE_SECRET_KEY or "", ""),
        )
        resp.raise_for_status()
        return resp.json()


# ── Public helpers ────────────────────────────────────────────────────────────

async def create_customer(email: str, name: Optional[str] = None) -> str:
    """Create a Stripe customer and return their customer ID."""
    data: dict = {"email": email}
    if name:
        data["name"] = name
    result = await _stripe_post("customers", data)
    return result["id"]


async def create_checkout_session(
    customer_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
) -> str:
    """Create a hosted Stripe Checkout session and return the URL."""
    result = await _stripe_post(
        "checkout/sessions",
        {
            "customer": customer_id,
            "mode": "subscription",
            "line_items[0][price]": price_id,
            "line_items[0][quantity]": "1",
            "success_url": success_url,
            "cancel_url": cancel_url,
        },
    )
    return result["url"]


async def create_portal_session(customer_id: str, return_url: str) -> str:
    """Create a Stripe Customer Portal session for self-serve billing management."""
    result = await _stripe_post(
        "billing_portal/sessions",
        {"customer": customer_id, "return_url": return_url},
    )
    return result["url"]


async def list_invoices(customer_id: str, limit: int = 10) -> list[dict]:
    """Retrieve the latest invoices for a customer."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{STRIPE_BASE}/invoices",
            params={"customer": customer_id, "limit": limit},
            auth=(settings.STRIPE_SECRET_KEY or "", ""),
        )
        resp.raise_for_status()
        return resp.json().get("data", [])


def construct_webhook_event(payload: bytes, sig_header: str) -> dict:
    """
    Verify and parse a Stripe webhook payload.
    Uses HMAC-SHA256 signature verification.
    """
    import hashlib
    import hmac
    import time

    secret = settings.STRIPE_WEBHOOK_SECRET or ""
    timestamp, *signatures = sig_header.split(",")
    ts = timestamp.split("=")[1]
    signed_payload = f"{ts}.{payload.decode()}"
    expected = hmac.new(
        secret.encode(), signed_payload.encode(), hashlib.sha256
    ).hexdigest()

    for sig in signatures:
        if sig.startswith("v1=") and hmac.compare_digest(expected, sig[3:]):
            # Check timestamp is within 5 min
            if abs(time.time() - int(ts)) < 300:
                import json
                return json.loads(payload)

    raise ValueError("Invalid Stripe webhook signature")
