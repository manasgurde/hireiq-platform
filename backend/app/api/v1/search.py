"""
Phase 7 — Vector Search API
Provides semantic search over candidates and jobs using cosine similarity on pgvector embeddings.
"""
from __future__ import annotations

import uuid
from typing import Optional, Any

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_recruiter
from app.core.embeddings import get_embedding
from app.models.user import User

router = APIRouter(prefix="/search", tags=["Search"])


# ── Request / Response schemas ────────────────────────────────────────────────

class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 10


class CandidateResult(BaseModel):
    user_id: uuid.UUID
    email: str
    bio: Optional[str]
    skills: list[str]
    avatar_url: Optional[str]
    similarity: float


class JobResult(BaseModel):
    id: uuid.UUID
    title: str
    location: str
    skills: list[str]
    salary_min: Optional[float]
    salary_max: Optional[float]
    similarity: float


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _require_embedding(query: str) -> list[float]:
    vec = await get_embedding(query)
    if vec is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Embedding service unavailable — check OPENAI_API_KEY",
        )
    return vec


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/candidates", response_model=list[CandidateResult])
async def semantic_candidate_search(
    body: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_recruiter),
) -> Any:
    """Search candidates by natural language query using cosine similarity."""
    vec = await _require_embedding(body.query)
    limit = min(body.limit, 50)

    rows = await db.execute(
        text(
            """
            SELECT
                u.id        AS user_id,
                u.email,
                p.bio,
                p.skills,
                p.avatar_url,
                1 - (p.embedding <=> CAST(:vec AS vector)) AS similarity
            FROM profiles p
            JOIN users u ON u.id = p.id
            WHERE p.embedding IS NOT NULL
            ORDER BY p.embedding <=> CAST(:vec AS vector)
            LIMIT :lim
            """
        ),
        {"vec": str(vec), "lim": limit},
    )
    return [
        CandidateResult(
            user_id=r.user_id,
            email=r.email,
            bio=r.bio,
            skills=r.skills or [],
            avatar_url=r.avatar_url,
            similarity=round(float(r.similarity), 4),
        )
        for r in rows.mappings()
    ]


@router.post("/jobs", response_model=list[JobResult])
async def semantic_job_search(
    body: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Search jobs by natural language query using cosine similarity."""
    vec = await _require_embedding(body.query)
    limit = min(body.limit, 50)

    rows = await db.execute(
        text(
            """
            SELECT
                j.id,
                j.title,
                j.location,
                j.skills,
                j.salary_min,
                j.salary_max,
                1 - (j.embedding <=> CAST(:vec AS vector)) AS similarity
            FROM jobs j
            WHERE j.embedding IS NOT NULL
              AND j.is_active = TRUE
              AND j.is_deleted = FALSE
            ORDER BY j.embedding <=> CAST(:vec AS vector)
            LIMIT :lim
            """
        ),
        {"vec": str(vec), "lim": limit},
    )
    return [
        JobResult(
            id=r.id,
            title=r.title,
            location=r.location,
            skills=r.skills or [],
            salary_min=float(r.salary_min) if r.salary_min else None,
            salary_max=float(r.salary_max) if r.salary_max else None,
            similarity=round(float(r.similarity), 4),
        )
        for r in rows.mappings()
    ]


@router.get("/candidates/{candidate_id}/similar", response_model=list[CandidateResult])
async def similar_candidates(
    candidate_id: uuid.UUID,
    limit: int = Query(5, le=20),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_recruiter),
) -> Any:
    """Find candidates similar to a given candidate."""
    row = await db.execute(
        text("SELECT embedding FROM profiles WHERE id = :id"),
        {"id": str(candidate_id)},
    )
    rec = row.mappings().first()
    if not rec or rec["embedding"] is None:
        raise HTTPException(status_code=404, detail="Candidate embedding not found")

    rows = await db.execute(
        text(
            """
            SELECT
                u.id AS user_id, u.email, p.bio, p.skills, p.avatar_url,
                1 - (p.embedding <=> CAST(:vec AS vector)) AS similarity
            FROM profiles p
            JOIN users u ON u.id = p.id
            WHERE p.embedding IS NOT NULL AND p.id != :skip
            ORDER BY p.embedding <=> CAST(:vec AS vector)
            LIMIT :lim
            """
        ),
        {"vec": str(rec["embedding"]), "skip": str(candidate_id), "lim": limit},
    )
    return [
        CandidateResult(
            user_id=r.user_id,
            email=r.email,
            bio=r.bio,
            skills=r.skills or [],
            avatar_url=r.avatar_url,
            similarity=round(float(r.similarity), 4),
        )
        for r in rows.mappings()
    ]


@router.get("/jobs/{job_id}/similar", response_model=list[JobResult])
async def similar_jobs(
    job_id: uuid.UUID,
    limit: int = Query(5, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Find jobs similar to a given job."""
    row = await db.execute(
        text("SELECT embedding FROM jobs WHERE id = :id"),
        {"id": str(job_id)},
    )
    rec = row.mappings().first()
    if not rec or rec["embedding"] is None:
        raise HTTPException(status_code=404, detail="Job embedding not found")

    rows = await db.execute(
        text(
            """
            SELECT
                j.id, j.title, j.location, j.skills, j.salary_min, j.salary_max,
                1 - (j.embedding <=> CAST(:vec AS vector)) AS similarity
            FROM jobs j
            WHERE j.embedding IS NOT NULL
              AND j.id != :skip
              AND j.is_active = TRUE AND j.is_deleted = FALSE
            ORDER BY j.embedding <=> CAST(:vec AS vector)
            LIMIT :lim
            """
        ),
        {"vec": str(rec["embedding"]), "skip": str(job_id), "lim": limit},
    )
    return [
        JobResult(
            id=r.id,
            title=r.title,
            location=r.location,
            skills=r.skills or [],
            salary_min=float(r.salary_min) if r.salary_min else None,
            salary_max=float(r.salary_max) if r.salary_max else None,
            similarity=round(float(r.similarity), 4),
        )
        for r in rows.mappings()
    ]
