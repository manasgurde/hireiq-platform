import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel


class ResumeUploadUrlResponse(BaseModel):
    upload_url: str
    s3_key: str


class ResumeConfirmRequest(BaseModel):
    s3_key: str


class ResumeResponse(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    s3_url: str
    ai_evaluation: Optional[Dict[str, Any]] = None
    # Omit raw_text by default to keep responses lightweight
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
