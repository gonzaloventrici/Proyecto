from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    location = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)
    image_url = Column(String(500))
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    average_rating = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())

    organizer = relationship("User", backref="events")
    tickets = relationship("Ticket", backref="event")
    reviews = relationship("Review", backref="event")