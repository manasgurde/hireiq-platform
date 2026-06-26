"""
Phase 13 — Advanced Analytics API
Hiring funnel, time-to-hire, recruiter performance, and platform usage metrics.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_recruiter, require_admin
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/funnel")
async def hiring_funnel(
    job_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> dict:
    """
    Application funnel: applied → reviewing → shortlisted → interview → hired/rejected.
    """
    where = "WHERE jobs.recruiter_id = :recruiter_id"
    params: dict = {"recruiter_id": current_user.id}
    if job_id:
        where += " AND applications.job_id = :job_id"
        params["job_id"] = job_id

    rows = await db.execute(
        text(f"""
            SELECT applications.status, COUNT(*) AS count
            FROM applications
            JOIN jobs ON applications.job_id = jobs.id
            {where}
            GROUP BY applications.status
            ORDER BY applications.status
        """),
        params,
    )
    counts = {r.status: int(r.count) for r in rows.mappings()}
    funnel_stages = ["applied", "reviewing", "shortlisted", "interview", "hired", "rejected"]
    return {
        "success": True,
        "data": {
            "funnel": {stage: counts.get(stage, 0) for stage in funnel_stages},
            "total": sum(counts.values()),
        },
    }


@router.get("/time-to-hire")
async def time_to_hire(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> dict:
    """Average days from job posting creation to first hire, grouped by job."""
    rows = await db.execute(
        text("""
            SELECT
                j.title,
                j.id,
                MIN(EXTRACT(EPOCH FROM (a.updated_at - j.created_at)) / 86400) AS avg_days_to_hire
            FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.status = 'hired'
              AND j.recruiter_id = :rid
            GROUP BY j.id, j.title
            ORDER BY avg_days_to_hire ASC
            LIMIT 20
        """),
        {"rid": str(current_user.id)},
    )
    return {
        "success": True,
        "data": [
            {"job_id": str(r.id), "title": r.title, "avg_days_to_hire": round(float(r.avg_days_to_hire or 0), 1)}
            for r in rows.mappings()
        ],
    }


@router.get("/recruiter-performance")
async def recruiter_performance(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    """Per-recruiter metrics: jobs posted, applications received, hires made."""
    rows = await db.execute(
        text("""
            SELECT
                u.id,
                u.email,
                COUNT(DISTINCT j.id)        AS jobs_posted,
                COUNT(DISTINCT a.id)        AS applications_received,
                COUNT(DISTINCT CASE WHEN a.status='hired' THEN a.id END) AS hires
            FROM users u
            LEFT JOIN jobs j ON j.recruiter_id = u.id
            LEFT JOIN applications a ON a.job_id = j.id
            WHERE u.role = 'recruiter'
            GROUP BY u.id, u.email
            ORDER BY hires DESC
            LIMIT 50
        """),
    )
    return {
        "success": True,
        "data": [
            {
                "recruiter_id": str(r.id),
                "email": r.email,
                "jobs_posted": int(r.jobs_posted),
                "applications_received": int(r.applications_received),
                "hires": int(r.hires),
            }
            for r in rows.mappings()
        ],
    }


@router.get("/platform")
async def platform_usage(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    """Platform-wide stats: total users, jobs, applications, hires."""
    rows = await db.execute(
        text("""
            SELECT
                (SELECT COUNT(*) FROM users)                                    AS total_users,
                (SELECT COUNT(*) FROM users WHERE role='candidate')             AS candidates,
                (SELECT COUNT(*) FROM users WHERE role='recruiter')             AS recruiters,
                (SELECT COUNT(*) FROM jobs WHERE is_active=TRUE)                AS active_jobs,
                (SELECT COUNT(*) FROM applications)                             AS total_applications,
                (SELECT COUNT(*) FROM applications WHERE status='hired')        AS total_hires,
                (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS new_users_7d,
                (SELECT COUNT(*) FROM jobs WHERE created_at > NOW() - INTERVAL '7 days')  AS new_jobs_7d
        """),
    )
    r = rows.mappings().first()
    return {
        "success": True,
        "data": dict(r) if r else {},
    }
