"""
Phase 12 — Audit System Model
Immutable, append-only log of all significant actions in the platform.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.user import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(64), nullable=False, index=True)   # e.g. "job.create", "user.login"
    entity_type: Mapped[str | None] = mapped_column(String(64), nullable=True)    # e.g. "job", "application"
    entity_id: Mapped[str | None] = mapped_column(String(255), nullable=True)     # UUID or slug
    before: Mapped[dict | None] = mapped_column(JSONB, nullable=True)             # state before change
    after: Mapped[dict | None] = mapped_column(JSONB, nullable=True)              # state after change
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)     # IPv4 or IPv6
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
