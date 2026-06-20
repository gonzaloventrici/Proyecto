from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.ticket import Ticket
from app.models.event import Event
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketResponse
from app.routers.events import get_current_user

router = APIRouter()

@router.post("/", response_model=TicketResponse)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == ticket.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    tickets_sold = db.query(Ticket).filter(Ticket.event_id == ticket.event_id).count()
    if tickets_sold >= event.capacity:
        raise HTTPException(status_code=400, detail="Evento agotado")

    new_ticket = Ticket(
        user_id=current_user.id,
        event_id=ticket.event_id,
        payment_id=ticket.payment_id
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

@router.get("/me", response_model=list[TicketResponse])
def get_my_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Ticket).filter(Ticket.user_id == current_user.id).all()