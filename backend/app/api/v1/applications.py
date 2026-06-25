import uuid
from typing import List
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_, update
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_candidate, require_recruiter, get_current_user
from app.core.s3 import generate_presigned_download_url
from app.core.ai_evaluator import evaluate_application
from app.models.application import Application, ApplicationStatus
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
    CandidateInfo,
    ResumeInfo,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


def _build_application_response(app: Application) -> ApplicationResponse:
    # Build candidate and resume info if loaded
    candidate_info = None
    if app.candidate:
        candidate_info = CandidateInfo(id=app.candidate.id, email=app.candidate.email)
    
    resume_info = None
    if app.resume:
        # A bit hacky: we can't async await in this synchronous builder function 
        # for generate_presigned_download_url, so we will do it in the endpoint.
        # But we can set up the basic structure.
        pass

    # Build job info if loaded
    from app.schemas.application import JobInfo
    job_info = None
    if hasattr(app, "job") and app.job:
        job_info = JobInfo(title=app.job.title, company_name="Acme Corp") # Using dummy company for now

    return ApplicationResponse(
        id=app.id,
        job_id=app.job_id,
        candidate_id=app.candidate_id,
        resume_id=app.resume_id,
        status=app.status,
        overall_score=app.overall_score,
        experience_score=app.experience_score,
        skills_score=app.skills_score,
        created_at=app.created_at,
        updated_at=app.updated_at,
        candidate=candidate_info,
        job=job_info,
    )

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    body: ApplicationCreate,
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    result = await db.execute(select(Job).where(Job.id == body.job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if not job.is_active or job.is_deleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job is no longer active.")

    resume_res = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = resume_res.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You must upload a resume before applying.")

    app_res = await db.execute(
        select(Application).where(
            Application.job_id == body.job_id,
            Application.candidate_id == current_user.id
        )
    )
    if app_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this job.")

    # AI Evaluation
    evaluation = await evaluate_application(
        resume_text=resume.raw_text or "",
        job_title=job.title,
        job_description=job.description,
        job_skills=job.skills
    )

    overall = evaluation["overall_score"] if evaluation else None
    exp = evaluation["experience_score"] if evaluation else None
    skills = evaluation["skills_score"] if evaluation else None

    application = Application(
        id=uuid.uuid4(),
        job_id=body.job_id,
        candidate_id=current_user.id,
        resume_id=resume.id,
        status=ApplicationStatus.applied.value,
        overall_score=overall,
        experience_score=exp,
        skills_score=skills,
    )
    db.add(application)
    
    # Generate Notification for the recruiter
    from app.models.notification import Notification
    candidate_name = current_user.full_name or current_user.email
    notification = Notification(
        id=uuid.uuid4(),
        user_id=job.recruiter_id,
        type="application_received",
        title="New Application Received",
        body=f"{candidate_name} has applied for your job '{job.title}'.",
    )
    db.add(notification)
    
    await db.commit()
    stmt = select(Application).options(
        joinedload(Application.job),
        joinedload(Application.candidate),
        joinedload(Application.resume)
    ).where(Application.id == application.id)
    result = await db.execute(stmt)
    application = result.scalar_one()

    return _build_application_response(application)


@router.get("/me", response_model=List[ApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> List[ApplicationResponse]:
    stmt = (
        select(Application)
        .options(
            joinedload(Application.job),
            joinedload(Application.candidate),
            joinedload(Application.resume)
        )
        .where(Application.candidate_id == current_user.id)
        .order_by(Application.created_at.desc())
    )
    result = await db.execute(stmt)
    applications = result.scalars().all()
    return [_build_application_response(app) for app in applications]


@router.get("/recruiter/all", response_model=List[ApplicationResponse])
async def get_all_recruiter_applications(
    current_user: User = Depends(require_recruiter),
    db: AsyncSession = Depends(get_db),
) -> List[ApplicationResponse]:
    from app.models.user import User
    from app.models.profile import Profile
    stmt = (
        select(Application)
        .join(Job, Application.job_id == Job.id)
        .options(
            selectinload(Application.job),
            selectinload(Application.candidate).selectinload(User.profile),
            selectinload(Application.resume)
        )
        .where(Job.recruiter_id == current_user.id)
        .order_by(Application.created_at.desc())
    )
    result = await db.execute(stmt)
    applications = result.scalars().all()
    
    responses = []
    for app in applications:
        resp = _build_application_response(app)
        if app.candidate:
            c_info = CandidateInfo(id=app.candidate.id, email=app.candidate.email)
            if hasattr(app.candidate, "full_name") and app.candidate.full_name:
                pass # email is fine for now
            if getattr(app.candidate, "profile", None):
                c_info.linkedin_url = app.candidate.profile.linkedin_url
                c_info.github_url = app.candidate.profile.github_url
                c_info.phone_number = app.candidate.profile.phone_number
                c_info.location = app.candidate.profile.location
            resp.candidate = c_info
            
        if app.resume:
            resp.resume = ResumeInfo(
                s3_key=app.resume.s3_key,
                presigned_url="", # Omit to save time
                url=f"http://localhost:8000/v1/resumes/{app.resume.id}/download", # Simple download link
                parsed_skills=app.resume.ai_evaluation.get("good_points", []) if app.resume.ai_evaluation else [],
                parsed_organizations=[]
            )
        responses.append(resp)
    return responses



@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
async def get_job_applications(
    job_id: uuid.UUID,
    current_user: User = Depends(require_recruiter),
    db: AsyncSession = Depends(get_db),
) -> List[ApplicationResponse]:
    job_res = await db.execute(select(Job).where(Job.id == job_id))
    job = job_res.scalar_one_or_none()
    if not job or job.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if job.recruiter_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this job.")

    stmt = (
        select(Application)
        .options(joinedload(Application.candidate), joinedload(Application.resume))
        .where(Application.job_id == job_id)
        .order_by(Application.created_at.desc())
    )
    result = await db.execute(stmt)
    applications = result.scalars().all()
    
    responses = []
    
    # Pre-fetch presigned URLs concurrently
    import asyncio
    resume_tasks = []
    for app in applications:
        if app.resume:
            resume_tasks.append(generate_presigned_download_url(app.resume.s3_key))
        else:
            resume_tasks.append(asyncio.sleep(0)) # No-op
            
    presigned_urls = await asyncio.gather(*resume_tasks)
    
    for i, app in enumerate(applications):
        resp = _build_application_response(app)
        
        # Populate candidate and resume fields
        if app.candidate:
            resp.candidate = CandidateInfo(id=app.candidate.id, email=app.candidate.email)
            if hasattr(app.candidate, "name") and app.candidate.name:
                resp.candidate.name = app.candidate.name
        
        if app.resume:
            presigned_url = presigned_urls[i]
            parsed_skills = []
            parsed_orgs = []
            if app.resume.ai_evaluation:
                pass
            
            resp.resume = ResumeInfo(
                s3_key=app.resume.s3_key,
                presigned_url=presigned_url,
                parsed_skills=app.resume.ai_evaluation.get("good_points", []) if app.resume.ai_evaluation else [],
                parsed_organizations=[]
            )
        responses.append(resp)
        
    return responses


@router.patch("/{app_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    app_id: uuid.UUID,
    body: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    stmt = select(Application).options(
        joinedload(Application.job),
        joinedload(Application.candidate),
        joinedload(Application.resume)
    ).where(Application.id == app_id)
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
        
    if current_user.role == "candidate":
        if application.candidate_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this application.")
        if body.status.value != "withdrawn":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Candidates can only withdraw applications.")
    elif current_user.role == "recruiter":
        if application.job.recruiter_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own the job for this application.")
    else:
        if current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions.")

    application.status = body.status.value
    
    # Create notification for candidate on specific statuses
    if application.status in ["interview", "shortlisted", "hired"]:
        from app.models.notification import Notification
        action_text = "selected for an interview for" if application.status == "interview" else "advanced in the process for"
        recruiter_name = current_user.full_name or "the hiring team"
        notification = Notification(
            id=uuid.uuid4(),
            user_id=application.candidate_id,
            type=f"application_{application.status}",
            title=f"Application {application.status.capitalize()}",
            body=f"Congratulations! You have been {action_text} the '{application.job.title}' position by {recruiter_name}.",
        )
        db.add(notification)

    await db.commit()
    await db.refresh(application)

    return _build_application_response(application)

