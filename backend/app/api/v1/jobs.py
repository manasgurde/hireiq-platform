import hashlib
import json
import math
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_recruiter
from app.core.redis import redis_client
from app.models.job import Job
from app.models.application import Application
from app.models.user import User
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse
from sqlalchemy import select, func, and_, case

router = APIRouter(prefix="/jobs", tags=["Jobs"])

JOBS_CACHE_TTL = 300  # 5 minutes
JOBS_VERSION_KEY = "jobs:version"


async def _get_jobs_version() -> int:
    """Get current cache version (used for cache busting on mutations)."""
    if not redis_client:
        return 0
    v = await redis_client.get(JOBS_VERSION_KEY)
    return int(v) if v else 1


async def _bump_jobs_version() -> None:
    """Increment the global jobs cache version, busting all cached search results."""
    if not redis_client:
        return
    await redis_client.incr(JOBS_VERSION_KEY)


def _make_cache_key(params: dict, version: int) -> str:
    sorted_params = sorted(params.items())
    serialized = json.dumps(sorted_params, default=str)
    param_hash = hashlib.md5(serialized.encode()).hexdigest()
    return f"jobs:search:v{version}:{param_hash}"


# ---------------------------------------------------------------------------
# POST / — Create job (HIQ-024)
# ---------------------------------------------------------------------------
@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    body: JobCreate,
    current_user: User = Depends(require_recruiter),
    db: AsyncSession = Depends(get_db),
) -> JobResponse:
    job = Job(
        id=uuid.uuid4(),
        title=body.title,
        description=body.description,
        location=body.location,
        skills=body.skills,
        salary_min=body.salary_min,
        salary_max=body.salary_max,
        recruiter_id=current_user.id,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    await _bump_jobs_version()
    return JobResponse.model_validate(job)


# ---------------------------------------------------------------------------
# GET /{job_id} — Get single job (HIQ-025)
# ---------------------------------------------------------------------------
@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> JobResponse:
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job or job.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return JobResponse.model_validate(job)


# ---------------------------------------------------------------------------
# GET / — Paginated job search with FTS + caching (HIQ-026)
# ---------------------------------------------------------------------------
@router.get("/", response_model=JobListResponse)
async def list_jobs(
    q: Optional[str] = Query(None, description="Full-text search query"),
    skills: Optional[List[str]] = Query(None, description="Required skills (all must match)"),
    location: Optional[str] = Query(None),
    min_salary: Optional[int] = Query(None),
    recruiter_id: Optional[uuid.UUID] = Query(None, description="Filter by recruiter ID"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> JobListResponse:
    cache_params = {
        "q": q, "skills": skills, "location": location,
        "min_salary": min_salary, "recruiter_id": recruiter_id, "page": page, "limit": limit,
    }
    version = await _get_jobs_version()
    cache_key = _make_cache_key(cache_params, version)

    # Try cache first
    if redis_client:
        cached = await redis_client.get(cache_key)
        if cached:
            return JobListResponse.model_validate_json(cached)

    # Build query filters
    filters = [Job.is_deleted == False]  # noqa: E712
    if not recruiter_id:
        filters.append(Job.is_active == True)

    if q:
        filters.append(
            Job.search_vector.bool_op("@@")(func.websearch_to_tsquery("english", q))
        )
    if skills:
        filters.append(Job.skills.contains(skills))
    if location:
        filters.append(Job.location.ilike(f"%{location}%"))
    if min_salary is not None:
        filters.append(Job.salary_min >= min_salary)
    if recruiter_id:
        filters.append(Job.recruiter_id == recruiter_id)

    # Count total
    count_stmt = select(func.count()).select_from(Job).where(and_(*filters))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    # Fetch page
    offset = (page - 1) * limit
    stmt = (
        select(
            Job,
            func.count(Application.id).label("application_count"),
            func.sum(case((Application.status == "hired", 1), else_=0)).label("hired_count"),
            func.sum(case((Application.status == "rejected", 1), else_=0)).label("rejected_count"),
            func.sum(case((Application.status == "interview", 1), else_=0)).label("interview_count"),
        )
        .outerjoin(Application, Application.job_id == Job.id)
        .where(and_(*filters))
        .group_by(Job.id)
        .order_by(Job.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()

    items = []
    for row in rows:
        j_resp = JobResponse.model_validate(row.Job)
        j_resp.application_count = row.application_count or 0
        j_resp.hired_count = row.hired_count or 0
        j_resp.rejected_count = row.rejected_count or 0
        j_resp.interview_count = row.interview_count or 0
        items.append(j_resp)

    response = JobListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=math.ceil(total / limit) if total > 0 else 0,
    )

    # Cache the result
    if redis_client:
        await redis_client.setex(cache_key, JOBS_CACHE_TTL, response.model_dump_json())

    return response


# ---------------------------------------------------------------------------
# PUT /{job_id} — Update job (HIQ-027)
# ---------------------------------------------------------------------------
@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: uuid.UUID,
    body: JobUpdate,
    current_user: User = Depends(require_recruiter),
    db: AsyncSession = Depends(get_db),
) -> JobResponse:
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job or job.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.recruiter_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't own this job")

    if body.title is not None:
        job.title = body.title
    if body.description is not None:
        job.description = body.description
    if body.location is not None:
        job.location = body.location
    if body.skills is not None:
        job.skills = body.skills
    if body.salary_min is not None:
        job.salary_min = body.salary_min
    if body.salary_max is not None:
        job.salary_max = body.salary_max

    await db.commit()
    await db.refresh(job)
    await _bump_jobs_version()
    return JobResponse.model_validate(job)


# ---------------------------------------------------------------------------
# DELETE /{job_id} — Soft delete (HIQ-028)
# ---------------------------------------------------------------------------
@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: uuid.UUID,
    current_user: User = Depends(require_recruiter),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job or job.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.recruiter_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't own this job")

    job.is_deleted = True
    await db.commit()
    await _bump_jobs_version()


# ---------------------------------------------------------------------------
# PATCH /{job_id}/close — Close job (HIQ-029)
# ---------------------------------------------------------------------------
@router.patch("/{job_id}/close", response_model=JobResponse)
async def close_job(
    job_id: uuid.UUID,
    current_user: User = Depends(require_recruiter),
    db: AsyncSession = Depends(get_db),
) -> JobResponse:
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job or job.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.recruiter_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't own this job")

    job.is_active = False
    await db.commit()
    await db.refresh(job)
    await _bump_jobs_version()
    return JobResponse.model_validate(job)
