from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date
from sqlalchemy.sql import func
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_organizer = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    avatar_url = Column(String(500), nullable=True)

    # Fiestero
    name = Column(String(100), nullable=True)
    birth_date = Column(Date, nullable=True)
    dni = Column(String(20), nullable=True)
    gender = Column(String(1), nullable=True)  # M, F, X

    # Organizador
    producer_name = Column(String(150), nullable=True)
    cuit = Column(String(20), nullable=True)
    razon_social = Column(String(150), nullable=True)
    corporate_email = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    cbu = Column(String(30), nullable=True)