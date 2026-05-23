from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database.connection import Base

class EventImage(Base):
    __tablename__ = "event_images"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)