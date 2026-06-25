import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=20)
    location: str = Field(..., min_length=2, max_length=255)
    skills: List[str] = Field(default=[])
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=20)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    skills: Optional[List[str]] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class JobResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    location: str
    skills: List[str]
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    is_active: bool
    recruiter_id: uuid.UUID
    application_count: int = 0
    hired_count: int = 0
    rejected_count: int = 0
    interview_count: int = 0
    created_at: datetime
    updated_at: datetime
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    limit: int
    pages: int
