"""
Phase 10 — Notifications API
"""
from __future__ import annotations

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.notification import Notification, NotificationPreference
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    body: str
    read: bool
    payload: Optional[dict]

    class Config:
        from_attributes = True


class PreferenceUpdate(BaseModel):
    email_on_apply: Optional[bool] = None
    email_on_status_change: Optional[bool] = None
    email_on_match: Optional[bool] = None
    in_app_on_apply: Optional[bool] = None
    in_app_on_status_change: Optional[bool] = None
    in_app_on_match: Optional[bool] = None


class PreferenceOut(BaseModel):
    email_on_apply: bool
    email_on_status_change: bool
    email_on_match: bool
    in_app_on_apply: bool
    in_app_on_status_change: bool
    in_app_on_match: bool

    class Config:
        from_attributes = True


# ── Helpers ───────────────────────────────────────────────────────────────────

async def create_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    type: str,
    title: str,
    body: str,
    payload: Optional[dict] = None,
) -> Notification:
    """Helper callable from other modules to create in-app notifications."""
    notif = Notification(user_id=user_id, type=type, title=title, body=body, payload=payload)
    db.add(notif)
    await db.commit()
    return notif


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    q = select(Notification).where(Notification.user_id == current_user.id)
    if unread_only:
        q = q.where(Notification.read == False)  # noqa: E712
    q = q.order_by(Notification.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/{notification_id}/read", status_code=200)
async def mark_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    await db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
        .values(read=True)
    )
    await db.commit()
    return {"success": True}


@router.post("/read-all", status_code=200)
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.read == False)  # noqa: E712
        .values(read=True)
    )
    await db.commit()
    return {"success": True}


@router.get("/preferences", response_model=PreferenceOut)
async def get_preferences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == current_user.id)
    )
    pref = result.scalar_one_or_none()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return pref


@router.put("/preferences", response_model=PreferenceOut)
async def update_preferences(
    body: PreferenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == current_user.id)
    )
    pref = result.scalar_one_or_none()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(pref, field, value)
    await db.commit()
    await db.refresh(pref)
    return pref
