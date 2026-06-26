import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: str
    title: str
    body: str
    read: bool
    payload: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    unread_count: int
