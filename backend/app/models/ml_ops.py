"""
Phase 14 — ML Operations Models
Model registry, feature snapshots, and feedback loop.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func, Float
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.user import Base


class ModelVersion(Base):
    """Registry entry for each trained ML model version."""
    __tablename__ = "model_versions"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(128), nullable=False)             # e.g. "candidate-matcher"
    version: Mapped[str] = mapped_column(String(64), nullable=False)           # e.g. "v1.2.3"
    mlflow_run_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    artifact_path: Mapped[str | None] = mapped_column(String(512), nullable=True)  # S3 / MLflow path
    metrics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)         # accuracy, F1, etc.
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="staging")  # staging | production | deprecated
    promoted_by: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class FeatureSnapshot(Base):
    """Point-in-time feature vector for a candidate or job at prediction time."""
    __tablename__ = "feature_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type: Mapped[str] = mapped_column(String(32), nullable=False)        # "candidate" | "job"
    entity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False, index=True)
    features: Mapped[dict] = mapped_column(JSONB, nullable=False)               # computed feature dict
    model_version_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("model_versions.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ModelFeedback(Base):
    """Human feedback on a model prediction for the online learning loop."""
    __tablename__ = "model_feedback"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_snapshot_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("feature_snapshots.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("model_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    actual_outcome: Mapped[str | None] = mapped_column(String(64), nullable=True)   # "hired" | "rejected" | "interviewed"
    feedback_by: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
