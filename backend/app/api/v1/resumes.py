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


# ---------------------------------------------------------------------------
# POST /me/evaluate  — run Gemini AI evaluation on the stored resume text
# ---------------------------------------------------------------------------
@router.post("/me/evaluate", response_model=ResumeResponse)
async def evaluate_resume(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    result = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = result.scalar_one_or_none()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found.")
    if not resume.raw_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resume has no parsed text to evaluate.")

    try:
        from app.core.config import settings
        import json
        from google import genai

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = f"""You are an expert resume analyst. Analyze the following resume text and return a JSON object with these fields:
- rating: integer 0-100 (overall score)
- candidate_name: string (full name extracted from resume, or "Unknown")
- extracted_skills: array of strings (technical and soft skills)
- good_points: array of strings (strengths, max 5)
- bad_points: array of strings (weaknesses, max 5)
- suggestions: array of strings (actionable improvements, max 5)

Return ONLY valid JSON, no markdown.

RESUME TEXT:
{resume.raw_text[:8000]}"""

        response = client.models.generate_content(
            model="gemini-1.5-pro",
            contents=prompt,
        )
        raw = response.text.strip()
        # Strip markdown code block if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        evaluation = json.loads(raw.strip())
    except Exception as exc:
        import traceback
        traceback.print_exc()
        # Fallback if Gemini fails: return minimal evaluation without crashing
        evaluation = {
            "rating": 50,
            "candidate_name": "Unknown",
            "extracted_skills": [],
            "good_points": ["Resume uploaded successfully"],
            "bad_points": [f"AI evaluation unavailable: {str(exc)}"],
            "suggestions": ["Try again later"],
        }

    resume.ai_evaluation = evaluation
    await db.commit()
    await db.refresh(resume)

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


# ---------------------------------------------------------------------------
# DELETE /me  — delete candidate's resume
# ---------------------------------------------------------------------------
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Resume).where(Resume.candidate_id == current_user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found.")

    # Also delete the associated file record if exists
    if resume.file_record_id:
        file_result = await db.execute(
            select(FileRecord).where(FileRecord.id == resume.file_record_id)
        )
        file_record = file_result.scalar_one_or_none()
        if file_record:
            await db.delete(file_record)

    await db.delete(resume)
    await db.commit()

