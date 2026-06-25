from app.models.ticket import Ticket
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
import requests  # Importamos requests para conectar con Cloudinary

router = APIRouter()

# CONFIGURACIÓN DE CLOUDINARY
CLOUDINARY_CLOUD_NAME = "dji2bw4ph"
CLOUDINARY_PRESET = "wharty"

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

    user_data = user.model_dump(exclude={"password"})
    new_user = User(
        **user_data,
        password=hash_password(user.password)
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


# --- ENDPOINT MODIFICADO PARA CLOUDINARY ---

@router.post("/me/avatar")
def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cloudinary_url = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload"
    
    try:
        files = {"file": (file.filename, file.file, file.content_type)}
        data = {
            "upload_preset": CLOUDINARY_PRESET,
            "folder": "wharty/avatars"
        }
        
        response = requests.post(cloudinary_url, files=files, data=data)
        response_data = response.json()
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Error Cloudinary: {response_data.get('error', {}).get('message')}")
        
        uploaded_url = response_data.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión: {str(e)}")

    current_user.avatar_url = uploaded_url
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
    all_reviews = []
    for event in events:
        reviews = db.query(Review).filter(Review.event_id == event.id).all()
        total_reviews += len(reviews)
        total_rating += sum(r.rating for r in reviews)
        for r in reviews:
            all_reviews.append({
                "id": r.id,
                "event_id": r.event_id,
                "event_title": event.title,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": str(r.created_at)
            })

    avg_rating = round(total_rating / total_reviews, 1) if total_reviews > 0 else 0

    return {
        "id": organizer.id,
        "producer_name": organizer.producer_name or organizer.email,
        "avatar_url": organizer.avatar_url,
        "avg_rating": avg_rating,
        "total_reviews": total_reviews,
        "total_events": len(events),
        "events": [{"id": e.id, "title": e.title, "location": e.location, "date": str(e.date), "price": e.price, "average_rating": e.average_rating, "image_url": e.image_url, "capacity": e.capacity, "tickets_sold": db.query(Ticket).filter(Ticket.event_id == e.id).count()} for e in events],
        "reviews": all_reviews
    }

@router.delete("/me/avatar")
def delete_avatar(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.avatar_url = None
    db.commit()
    return {"message": "Foto eliminada"}

@router.get("/user/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    from app.models.review import Review
    from app.models.event import Event

    user = db.query(User).filter(User.id == user_id, User.is_organizer == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    reviews = db.query(Review).filter(Review.user_id == user_id).all()
    all_reviews = []
    for r in reviews:
        event = db.query(Event).filter(Event.id == r.event_id).first()
        all_reviews.append({
            "id": r.id,
            "event_id": r.event_id,
            "event_title": event.title if event else "Evento eliminado",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": str(r.created_at)
        })

    return {
        "id": user.id,
        "name": user.name,
        "avatar_url": user.avatar_url,
        "total_reviews": len(all_reviews),
        "reviews": all_reviews
    }