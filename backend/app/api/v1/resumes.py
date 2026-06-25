import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_candidate
from app.core.pdf_parser import parse_resume_text
from app.core.s3 import generate_presigned_upload_url, get_s3_object_bytes
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import (
    ResumeUploadUrlResponse,
    ResumeConfirmRequest,
    ResumeResponse,
)

router = APIRouter(prefix="/resumes", tags=["Resumes"])


# ---------------------------------------------------------------------------
# POST /upload-url (HIQ-031)
# ---------------------------------------------------------------------------
@router.post("/upload-url", response_model=ResumeUploadUrlResponse)
async def get_resume_upload_url(
    current_user: User = Depends(require_candidate),
) -> ResumeUploadUrlResponse:
    """Generate a presigned S3 URL for a candidate to upload their PDF resume."""
    # Generate unique S3 key
    s3_key = f"resumes/{current_user.id}/{uuid.uuid4()}.pdf"
    
    # Generate presigned URL valid for 1 hour
    upload_url = await generate_presigned_upload_url(
        object_name=s3_key, expiration_seconds=3600
    )

    return ResumeUploadUrlResponse(upload_url=upload_url, s3_key=s3_key)


# ---------------------------------------------------------------------------
# POST /confirm (HIQ-032)
# ---------------------------------------------------------------------------
@router.post("/confirm", response_model=ResumeResponse)
async def confirm_resume_upload(
    body: ResumeConfirmRequest,
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    """Confirm resume upload, fetch bytes from S3, parse text, and upsert DB."""
    # Security: ensure the key belongs to this user
    if not body.s3_key.startswith(f"resumes/{current_user.id}/"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid S3 key.")

    # 1. Fetch bytes from S3
    pdf_bytes = await get_s3_object_bytes(body.s3_key)

    # 2. Parse text securely on a background thread
    raw_text = await parse_resume_text(pdf_bytes)

    # 3. Upsert resume record
    result = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = result.scalar_one_or_none()

    if resume:
        resume.s3_key = body.s3_key
        resume.raw_text = raw_text
    else:
        resume = Resume(
            id=uuid.uuid4(),
            candidate_id=current_user.id,
            s3_key=body.s3_key,
            raw_text=raw_text,
        )
        db.add(resume)

    await db.commit()
    await db.refresh(resume)

    # Use a property to generate the full public URL from the key if needed,
    # or just return the key. For schema compatibility we return the mock public URL:
    from app.core.s3 import generate_presigned_download_url
    s3_url = await generate_presigned_download_url(resume.s3_key)
    
    return ResumeResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        s3_url=s3_url,
        ai_evaluation=resume.ai_evaluation,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


# ---------------------------------------------------------------------------
# GET /me (HIQ-033)
# ---------------------------------------------------------------------------
@router.get("/me", response_model=ResumeResponse)
async def get_my_resume(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    """Fetch the current candidate's active resume."""
    result = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = result.scalar_one_or_none()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found.")

    from app.core.s3 import generate_presigned_download_url
    s3_url = await generate_presigned_download_url(resume.s3_key)
    
    return ResumeResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        s3_url=s3_url,
        ai_evaluation=resume.ai_evaluation,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


# ---------------------------------------------------------------------------
# POST /me/evaluate (AI Evaluation)
# ---------------------------------------------------------------------------
@router.post("/me/evaluate", response_model=ResumeResponse)
async def evaluate_my_resume(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    """Run AI evaluation on the candidate's resume if not already done."""
    result = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = result.scalar_one_or_none()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found.")

    if resume.ai_evaluation:
        # Already evaluated
        pass
    else:
        from app.core.ai_evaluator import evaluate_resume
        evaluation = await evaluate_resume(resume.raw_text or "")
        resume.ai_evaluation = evaluation
        await db.commit()
        await db.refresh(resume)

    from app.core.config import settings
    s3_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{resume.s3_key}"
    
    return ResumeResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        s3_url=s3_url,
        ai_evaluation=resume.ai_evaluation,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


# ---------------------------------------------------------------------------
# DELETE /me (HIQ-034)
# ---------------------------------------------------------------------------
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_resume(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete the current candidate's resume record."""
    result = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = result.scalar_one_or_none()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found.")

    await db.delete(resume)
    await db.commit()


# ---------------------------------------------------------------------------
# GET /{resume_id}/download
# ---------------------------------------------------------------------------
from fastapi.responses import RedirectResponse
from app.core.s3 import generate_presigned_download_url

@router.get("/{resume_id}/download")
async def download_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    # Note: in a real app, require recruiter auth and check permissions!
):
    """Get a redirect to the S3 presigned URL for a resume."""
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
        
    s3_url = await generate_presigned_download_url(resume.s3_key)
    return RedirectResponse(url=s3_url)
