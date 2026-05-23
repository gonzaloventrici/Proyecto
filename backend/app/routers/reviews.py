from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.review import Review
from app.models.ticket import Ticket
from app.models.event import Event
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.routers.events import get_current_user
from datetime import datetime, timezone

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

    # Verificar que el evento ya ocurrió
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
    return db.query(Review).filter(Review.user_id == current_user.id).all()

@router.get("/{event_id}", response_model=list[ReviewResponse])
def get_reviews(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return db.query(Review).filter(Review.event_id == event_id).all()
