from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: str
    date: datetime
    price: float
    capacity: int
    image_url: Optional[str] = None
    is_recurring: bool = False

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    location: str
    date: datetime
    price: float
    capacity: int
    image_url: Optional[str] = None
    organizer_id: int
    average_rating: float
    created_at: datetime
    is_recurring: bool
    tickets_sold: int = 0
    organizer_rating: Optional[float] = None

    class Config:
        from_attributes = True