import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_candidate
from app.core.pdf_parser import parse_resume_text
from app.models.resume import Resume
from app.models.file_storage import FileRecord
from app.models.user import User
from app.schemas.resume import ResumeResponse

router = APIRouter(prefix="/resumes", tags=["Resumes"])

ALLOWED_CONTENT_TYPES = {"application/pdf", "application/octet-stream"}
MAX_RESUME_SIZE = 10 * 1024 * 1024  # 10 MB


# ---------------------------------------------------------------------------
# POST /upload  — unified single-step upload (replaces presigned URL flow)
# ---------------------------------------------------------------------------
@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    """Accept PDF upload, parse text, and store bytes in PostgreSQL."""
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_CONTENT_TYPES and not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted.",
        )

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_RESUME_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large. Maximum size is 10 MB.",
        )

    # Parse text from PDF
    raw_text = await parse_resume_text(pdf_bytes)

    # Save binary to file_records table
    file_record = FileRecord(
        id=uuid.uuid4(),
        filename=file.filename or "resume.pdf",
        content_type="application/pdf",
        file_data=pdf_bytes,
        file_size=len(pdf_bytes),
    )
    db.add(file_record)
    await db.flush()  # get file_record.id without committing yet

    # Upsert resume record
    result = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = result.scalar_one_or_none()

    if resume:
        resume.file_record_id = file_record.id
        resume.s3_key = None
        resume.raw_text = raw_text
    else:
        resume = Resume(
            id=uuid.uuid4(),
            candidate_id=current_user.id,
            file_record_id=file_record.id,
            s3_key=None,
            raw_text=raw_text,
        )
        db.add(resume)

    await db.commit()
    await db.refresh(resume)

    return ResumeResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        s3_url=f"/v1/files/{file_record.id}",
        ai_evaluation=resume.ai_evaluation,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


# ---------------------------------------------------------------------------
# GET /me
# ---------------------------------------------------------------------------
@router.get("/me", response_model=ResumeResponse)
async def get_my_resume(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    result = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = result.scalar_one_or_none()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found.")

    # Build file URL
    if resume.file_record_id:
        file_url = f"/v1/files/{resume.file_record_id}"
    elif resume.s3_key:
        file_url = resume.s3_key
    else:
        file_url = ""

    return ResumeResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        s3_url=file_url,
        ai_evaluation=resume.ai_evaluation,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )
