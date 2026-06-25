from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.event import Event
from app.models.user import User
from app.schemas.event import EventCreate, EventResponse
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
import os
import requests  # Importamos requests para conectar con Cloudinary
from app.models.ticket import Ticket
from app.models.event_image import EventImage
from app.schemas.event_image import EventImageResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# CONFIGURACIÓN DE CLOUDINARY
CLOUDINARY_CLOUD_NAME = "dji2bw4ph"
CLOUDINARY_PRESET = "wharty"

def add_tickets_sold(event, db):
    from app.models.review import Review
    event.tickets_sold = db.query(Ticket).filter(Ticket.event_id == event.id).count()
    
    # rating promedio del organizador
    from app.models.event import Event as EventModel
    org_events = db.query(EventModel).filter(EventModel.organizer_id == event.organizer_id).all()
    total_rating = 0
    total_reviews = 0
    for e in org_events:
        reviews = db.query(Review).filter(Review.event_id == e.id).all()
        total_rating += sum(r.rating for r in reviews)
        total_reviews += len(reviews)
    event.organizer_rating = round(total_rating / total_reviews, 1) if total_reviews > 0 else None
    return event

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

@router.get("/", response_model=list[EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    return [add_tickets_sold(e, db) for e in events]

@router.get("/my-events", response_model=list[EventResponse])
def get_my_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_organizer:
        raise HTTPException(status_code=403, detail="Solo organizadores")
    events = db.query(Event).filter(Event.organizer_id == current_user.id).all()
    return [add_tickets_sold(e, db) for e in events]

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return add_tickets_sold(event, db)

@router.post("/", response_model=EventResponse)
def create_event(event: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_organizer:
        raise HTTPException(status_code=403, detail="Solo los organizadores pueden crear eventos")
    new_event = Event(**event.model_dump(), organizer_id=current_user.id)
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tenés permiso para eliminar este evento")
    db.delete(event)
    db.commit()
    return {"message": "Evento eliminado"}

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, data: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tenés permiso para editar este evento")
    for key, value in data.model_dump().items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


# --- ENDPOINTS MODIFICADOS PARA CLOUDINARY ---

@router.post("/{event_id}/upload-image")
def upload_image(event_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tenés permiso")
    
    cloudinary_url = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload"
    try:
        files = {"file": (file.filename, file.file, file.content_type)}
        data = {"upload_preset": CLOUDINARY_PRESET}
        response = requests.post(cloudinary_url, files=files, data=data)
        response_data = response.json()
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Error Cloudinary: {response_data.get('error', {}).get('message')}")
        
        uploaded_url = response_data.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión: {str(e)}")
    
    event.image_url = uploaded_url
    db.commit()
    db.refresh(event)
    return {"image_url": event.image_url}


@router.get("/{event_id}/images", response_model=list[EventImageResponse])
def get_event_images(event_id: int, db: Session = Depends(get_db)):
    return db.query(EventImage).filter(EventImage.event_id == event_id).all()


@router.post("/{event_id}/images", response_model=EventImageResponse)
def upload_event_image(event_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tenés permiso")

    cloudinary_url = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload"
    try:
        files = {"file": (file.filename, file.file, file.content_type)}
        data = {"upload_preset": CLOUDINARY_PRESET}
        response = requests.post(cloudinary_url, files=files, data=data)
        response_data = response.json()
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Error Cloudinary: {response_data.get('error', {}).get('message')}")
        
        uploaded_url = response_data.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión: {str(e)}")

    has_primary = db.query(EventImage).filter(EventImage.event_id == event_id, EventImage.is_primary == True).first()
    new_image = EventImage(
        event_id=event_id,
        url=uploaded_url,
        is_primary=not has_primary
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image


@router.put("/{event_id}/images/{image_id}/set-primary")
def set_primary_image(event_id: int, image_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event or event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tenés permiso")
    db.query(EventImage).filter(EventImage.event_id == event_id).update({"is_primary": False})
    db.query(EventImage).filter(EventImage.id == image_id).update({"is_primary": True})
    db.commit()
    return {"message": "Imagen principal actualizada"}


@router.delete("/{event_id}/images/{image_id}")
def delete_event_image(event_id: int, image_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event or event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tenés permiso")
    image = db.query(EventImage).filter(EventImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    db.delete(image)
    db.commit()
    return {"message": "Imagen eliminada"}