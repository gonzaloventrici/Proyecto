from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ReviewCreate(BaseModel):
    event_id: int
    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    ticket_id: int
    rating: float
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True