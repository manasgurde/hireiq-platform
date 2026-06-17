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


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=20)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    skills: Optional[List[str]] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None


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
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    limit: int
    pages: int
