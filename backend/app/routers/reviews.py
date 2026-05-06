from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.review import Review
from app.models.ticket import Ticket
from app.models.event import Event
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.routers.events import get_current_user

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verificar que el evento existe
    event = db.query(Event).filter(Event.id == review.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Verificar que el usuario compró una entrada
    ticket = db.query(Ticket).filter(
        Ticket.user_id == current_user.id,
        Ticket.event_id == review.event_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=403, detail="Necesitás haber comprado una entrada para reseñar este evento")

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
        ticket_id=ticket.id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Actualizar el promedio del evento
    reviews = db.query(Review).filter(Review.event_id == review.event_id).all()
    event.average_rating = sum(r.rating for r in reviews) / len(reviews)
    db.commit()

    return new_review

@router.get("/{event_id}", response_model=list[ReviewResponse])
def get_reviews(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return db.query(Review).filter(Review.event_id == event_id).all()