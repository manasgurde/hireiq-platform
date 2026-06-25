import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    job_id: uuid.UUID


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class CandidateInfo(BaseModel):
    email: str
    id: uuid.UUID
    linkedin_url: str | None = None
    github_url: str | None = None
    phone_number: str | None = None
    location: str | None = None

class ResumeInfo(BaseModel):
    parsed_skills: list[str] | None = None
    parsed_organizations: list[str] | None = None
    s3_key: str | None = None
    presigned_url: str | None = None
    url: str | None = None

    model_config = {"from_attributes": True}

class JobInfo(BaseModel):
    title: str
    company_name: str | None = None

class ApplicationResponse(BaseModel):
    id: uuid.UUID
    job_id: uuid.UUID
    candidate_id: uuid.UUID
    resume_id: uuid.UUID
    status: ApplicationStatus
    overall_score: float | None = None
    experience_score: float | None = None
    skills_score: float | None = None
    created_at: datetime
    updated_at: datetime
    
    candidate: CandidateInfo | None = None
    resume: ResumeInfo | None = None
    job: JobInfo | None = None

    model_config = {"from_attributes": True}
