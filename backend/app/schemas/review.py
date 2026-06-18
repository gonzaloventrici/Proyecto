from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ReviewCreate(BaseModel):
    event_id: int
    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    ticket_id: Optional[int] = None
    rating: float
    comment: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True