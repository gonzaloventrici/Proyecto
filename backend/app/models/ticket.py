from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    payment_id = Column(String(255), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", backref="tickets")