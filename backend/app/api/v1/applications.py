import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.core.deps import require_candidate, require_recruiter
from app.models.application import Application, ApplicationStatus
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


# ---------------------------------------------------------------------------
# POST / — Submit Application (HIQ-035, 036, 037)
# ---------------------------------------------------------------------------
@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    body: ApplicationCreate,
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    # 1. Pre-flight: Check if Job exists and is active
    result = await db.execute(select(Job).where(Job.id == body.job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if not job.is_active or job.is_deleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job is no longer active.")

    # 2. Pre-flight: Check if candidate has a resume
    resume_res = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = resume_res.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You must upload a resume before applying.")

    # 3. Pre-flight: Check for duplicate application
    app_res = await db.execute(
        select(Application).where(
            Application.job_id == body.job_id,
            Application.candidate_id == current_user.id
        )
    )
    if app_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this job.")

    # 4. Insert application
    application = Application(
        id=uuid.uuid4(),
        job_id=body.job_id,
        candidate_id=current_user.id,
        resume_id=resume.id,
        status=ApplicationStatus.applied.value,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)

    return ApplicationResponse.model_validate(application)


# ---------------------------------------------------------------------------
# GET /me — Candidate Application History (HIQ-038)
# ---------------------------------------------------------------------------
@router.get("/me", response_model=List[ApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> List[ApplicationResponse]:
    stmt = (
        select(Application)
        .where(Application.candidate_id == current_user.id)
        .order_by(Application.created_at.desc())
    )
    result = await db.execute(stmt)
    applications = result.scalars().all()
    return [ApplicationResponse.model_validate(app) for app in applications]


# ---------------------------------------------------------------------------
# GET /job/{job_id} — Recruiter ATS View (HIQ-039)
# ---------------------------------------------------------------------------
@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
async def get_job_applications(
    job_id: uuid.UUID,
    current_user: User = Depends(require_recruiter),
    db: AsyncSession = Depends(get_db),
) -> List[ApplicationResponse]:
    # Check ownership
    job_res = await db.execute(select(Job).where(Job.id == job_id))
    job = job_res.scalar_one_or_none()
    if not job or job.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if job.recruiter_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this job.")

    stmt = (
        select(Application)
        .where(Application.job_id == job_id)
        .order_by(Application.created_at.desc())
    )
    result = await db.execute(stmt)
    applications = result.scalars().all()
    return [ApplicationResponse.model_validate(app) for app in applications]


# ---------------------------------------------------------------------------
# PATCH /{app_id}/status — Move Candidate Through Pipeline (HIQ-040)
# ---------------------------------------------------------------------------
@router.patch("/{app_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    app_id: uuid.UUID,
    body: ApplicationStatusUpdate,
    current_user: User = Depends(require_recruiter),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    # Eager load the job to verify recruiter ownership
    stmt = select(Application).options(joinedload(Application.job)).where(Application.id == app_id)
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
    if application.job.recruiter_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own the job for this application.")

    application.status = body.status.value
    await db.commit()
    await db.refresh(application)

    return ApplicationResponse.model_validate(application)
