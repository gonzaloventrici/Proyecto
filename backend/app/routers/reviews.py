from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.review import Review
from app.models.ticket import Ticket
from app.models.event import Event
from app.models.user import User  # <-- Import único y limpio
from app.schemas.review import ReviewCreate, ReviewResponse
from app.routers.events import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Organizadores no pueden reseñar
    if current_user.is_organizer:
        raise HTTPException(status_code=403, detail="Los organizadores no pueden dejar reseñas")

    # Verificar que el evento existe
    event = db.query(Event).filter(Event.id == review.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # [CORRECCIÓN] Comparación segura de fechas:
    # Si event.date es "naive" (sin zona horaria), usamos datetime.now()
    # Si llega a tener zona horaria en la DB, recordá usar datetime.now(timezone.utc)
    if event.date > datetime.now():
        raise HTTPException(status_code=403, detail="Solo podés reseñar eventos que ya ocurrieron")

    # Verificar que no haya reseñado antes
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.event_id == review.event_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya reseñaste este evento")

    new_review = Review(
        user_id=current_user.id,
        event_id=review.event_id,
        ticket_id=None,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Actualizar promedio
    reviews = db.query(Review).filter(Review.event_id == review.event_id).all()
    event.average_rating = sum(r.rating for r in reviews) / len(reviews)
    db.commit()

    return new_review

@router.get("/me", response_model=list[ReviewResponse])
def get_my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    for r in reviews:
        r.user_name = current_user.name
    return reviews

@router.get("/{event_id}", response_model=list[ReviewResponse])
def get_reviews(event_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.event_id == event_id).all()
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        r.user_name = user.name if user else None
    return reviews