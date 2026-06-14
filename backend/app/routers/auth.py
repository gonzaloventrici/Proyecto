from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
import os

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        is_organizer=user.is_organizer
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_token({"sub": str(user.id), "is_organizer": user.is_organizer})
    return {"access_token": token, "token_type": "bearer"}


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for key, value in data.items():
        if hasattr(current_user, key) and key not in ['id', 'email', 'password', 'created_at']:
            setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/avatar")
def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    import shutil, uuid
    from pathlib import Path
    UPLOAD_DIR = Path("uploads")
    UPLOAD_DIR.mkdir(exist_ok=True)
    ext = file.filename.split('.')[-1]
    filename = f"avatar_{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    current_user.avatar_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(current_user)
    return {"avatar_url": current_user.avatar_url}

@router.get("/organizer/{user_id}")
def get_organizer_profile(user_id: int, db: Session = Depends(get_db)):
    from app.models.event import Event
    from app.models.review import Review
    
    organizer = db.query(User).filter(User.id == user_id, User.is_organizer == True).first()
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizador no encontrado")
    
    events = db.query(Event).filter(Event.organizer_id == user_id).all()
    
    total_reviews = 0
    total_rating = 0
    for event in events:
        reviews = db.query(Review).filter(Review.event_id == event.id).all()
        total_reviews += len(reviews)
        total_rating += sum(r.rating for r in reviews)
    
    avg_rating = round(total_rating / total_reviews, 1) if total_reviews > 0 else 0

    return {
        "id": organizer.id,
        "producer_name": organizer.producer_name or organizer.email,
        "avatar_url": organizer.avatar_url,
        "avg_rating": avg_rating,
        "total_reviews": total_reviews,
        "total_events": len(events),
        "events": [{"id": e.id, "title": e.title, "location": e.location, "date": str(e.date), "price": e.price, "average_rating": e.average_rating, "image_url": e.image_url} for e in events]
    }