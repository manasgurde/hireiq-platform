"""
Phase 14 — Feature Store
Computes structured feature vectors for candidates and jobs.
These features are used by the ML matching model at scoring time.
"""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.profile import Profile
from app.models.job import Job


async def compute_candidate_features(user_id: uuid.UUID, db: AsyncSession) -> dict[str, Any]:
    """
    Compute a rich feature dict for a candidate.
    """
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalar_one_or_none()

    if not profile:
        return {}

    return {
        "skill_count": len(profile.skills or []),
        "skills": profile.skills or [],
        "has_bio": bool(profile.bio),
        "bio_length": len(profile.bio or ""),
        "has_avatar": bool(profile.avatar_url),
        "has_embedding": bool(profile.embedding),
    }


async def compute_job_features(job_id: uuid.UUID, db: AsyncSession) -> dict[str, Any]:
    """
    Compute a rich feature dict for a job posting.
    """
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        return {}

    return {
        "title": job.title,
        "location": job.location,
        "skill_count": len(job.skills or []),
        "skills": job.skills or [],
        "has_salary_range": bool(job.salary_min and job.salary_max),
        "salary_min": float(job.salary_min) if job.salary_min else None,
        "salary_max": float(job.salary_max) if job.salary_max else None,
        "description_length": len(job.description or ""),
        "has_embedding": bool(job.embedding),
    }


def compute_match_features(
    candidate_features: dict[str, Any],
    job_features: dict[str, Any],
) -> dict[str, Any]:
    """
    Compute pairwise match features between a candidate and job.
    """
    candidate_skills = set(s.lower() for s in candidate_features.get("skills", []))
    job_skills = set(s.lower() for s in job_features.get("skills", []))

    overlap = candidate_skills & job_skills
    union = candidate_skills | job_skills
    jaccard = len(overlap) / len(union) if union else 0.0

    return {
        "skill_overlap_count": len(overlap),
        "skill_jaccard": round(jaccard, 4),
        "overlapping_skills": sorted(overlap),
        "candidate_skill_count": len(candidate_skills),
        "job_skill_count": len(job_skills),
        "candidate_has_bio": candidate_features.get("has_bio", False),
        "candidate_has_avatar": candidate_features.get("has_avatar", False),
        "job_has_salary": job_features.get("has_salary_range", False),
    }
