from pydantic import BaseModel
from datetime import datetime

class TicketCreate(BaseModel):
    event_id: int
    payment_id: str

class TicketResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    payment_id: str
    used: bool
    created_at: datetime

    class Config:
        from_attributes = True