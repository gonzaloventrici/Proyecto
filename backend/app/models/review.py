from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", backref="reviews")