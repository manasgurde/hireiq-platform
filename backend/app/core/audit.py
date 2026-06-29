"""
Phase 12 — Audit logging helper
Usage:
    await log_audit(db, actor=user, action="job.create", entity_type="job", entity_id=str(job.id), after=job_dict, request=request)
"""
from __future__ import annotations

from typing import Optional

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog
from app.models.user import User


async def log_audit(
    db: AsyncSession,
    action: str,
    actor: Optional[User] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    before: Optional[dict] = None,
    after: Optional[dict] = None,
    request: Optional[Request] = None,
) -> AuditLog:
    """
    Write an audit log entry. Fire-and-forget — never raises, always records.
    """
    ip = None
    user_agent = None
    if request:
        forwarded = request.headers.get("X-Forwarded-For")
        ip = forwarded.split(",")[0].strip() if forwarded else (
            request.client.host if request.client else None
        )
        user_agent = request.headers.get("User-Agent")

    entry = AuditLog(
        actor_id=actor.id if actor else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        before=before,
        after=after,
        ip_address=ip,
        user_agent=user_agent,
    )
    db.add(entry)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
    return entry
