"""
Phase 14 — ML Operations API
Model registry, feature snapshots, feedback loop, and monitoring (backed by MLflow).
"""
from __future__ import annotations

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.core.config import settings
from app.models.ml_ops import ModelVersion, ModelFeedback
from app.models.user import User

router = APIRouter(prefix="/ml", tags=["ML Operations"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ModelVersionCreate(BaseModel):
    name: str
    version: str
    mlflow_run_id: Optional[str] = None
    artifact_path: Optional[str] = None
    metrics: Optional[dict] = None


class ModelVersionOut(BaseModel):
    id: uuid.UUID
    name: str
    version: str
    mlflow_run_id: Optional[str]
    artifact_path: Optional[str]
    metrics: Optional[dict]
    status: str

    class Config:
        from_attributes = True


class FeedbackCreate(BaseModel):
    feature_snapshot_id: uuid.UUID
    model_version_id: uuid.UUID
    predicted_score: Optional[float] = None
    actual_outcome: Optional[str] = None  # "hired" | "rejected" | "interviewed"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/models", response_model=list[ModelVersionOut])
async def list_models(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    result = await db.execute(select(ModelVersion).order_by(ModelVersion.created_at.desc()))
    return result.scalars().all()


@router.post("/models", response_model=ModelVersionOut, status_code=201)
async def register_model(
    body: ModelVersionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    mv = ModelVersion(**body.model_dump(), promoted_by=current_user.id)
    db.add(mv)
    await db.commit()
    await db.refresh(mv)
    return mv


@router.put("/models/{model_id}/promote", response_model=ModelVersionOut)
async def promote_model(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Promote a staging model to production (demotes current production model)."""
    result = await db.execute(select(ModelVersion).where(ModelVersion.id == model_id))
    mv = result.scalar_one_or_none()
    if not mv:
        raise HTTPException(status_code=404, detail="Model version not found")

    # Demote current production model
    await db.execute(
        update(ModelVersion)
        .where(ModelVersion.name == mv.name, ModelVersion.status == "production")
        .values(status="deprecated")
    )

    mv.status = "production"
    mv.promoted_by = current_user.id
    await db.commit()
    await db.refresh(mv)
    return mv


@router.post("/feedback", status_code=201)
async def submit_feedback(
    body: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Submit human feedback on a model prediction for the online learning loop."""
    fb = ModelFeedback(
        feature_snapshot_id=body.feature_snapshot_id,
        model_version_id=body.model_version_id,
        predicted_score=body.predicted_score,
        actual_outcome=body.actual_outcome,
        feedback_by=current_user.id,
    )
    db.add(fb)
    await db.commit()
    return {"success": True}


@router.get("/monitoring")
async def model_monitoring(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    """
    Return model health metrics: prediction counts, outcome distribution, and drift signals.
    """
    from sqlalchemy import text

    rows = await db.execute(
        text("""
            SELECT
                mv.name,
                mv.version,
                mv.status,
                mv.metrics,
                COUNT(mf.id)                                        AS feedback_count,
                AVG(mf.predicted_score)                            AS avg_predicted_score,
                COUNT(CASE WHEN mf.actual_outcome='hired' THEN 1 END)      AS hired_count,
                COUNT(CASE WHEN mf.actual_outcome='rejected' THEN 1 END)   AS rejected_count
            FROM model_versions mv
            LEFT JOIN model_feedback mf ON mf.model_version_id = mv.id
            GROUP BY mv.id
            ORDER BY mv.created_at DESC
        """)
    )

    return {
        "success": True,
        "data": [
            {
                "name": r.name,
                "version": r.version,
                "status": r.status,
                "metrics": r.metrics,
                "feedback_count": int(r.feedback_count),
                "avg_predicted_score": round(float(r.avg_predicted_score or 0), 4),
                "hired_count": int(r.hired_count),
                "rejected_count": int(r.rejected_count),
            }
            for r in rows.mappings()
        ],
        "mlflow_uri": settings.MLFLOW_TRACKING_URI,
    }
