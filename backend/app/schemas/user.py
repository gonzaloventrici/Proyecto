from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    is_organizer: bool = False

    # Fiestero
    name: Optional[str] = None
    birth_date: Optional[date] = None
    dni: Optional[str] = None
    gender: Optional[str] = None

    # Organizador
    producer_name: Optional[str] = None
    cuit: Optional[str] = None
    razon_social: Optional[str] = None
    corporate_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    cbu: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    is_organizer: bool
    name: Optional[str]
    producer_name: Optional[str]
    corporate_email: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_organizer: bool
    name: Optional[str] = None
    birth_date: Optional[date] = None
    dni: Optional[str] = None
    gender: Optional[str] = None
    producer_name: Optional[str] = None
    cuit: Optional[str] = None
    razon_social: Optional[str] = None
    corporate_email: Optional[str] = None
    phone: Optional[str] = None
    cbu: Optional[str] = None
    created_at: datetime
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True