from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.models import user, event, ticket, review
from app.routers import events, tickets, reviews, auth
from fastapi.staticfiles import StaticFiles
import os
from app.models import user, event, ticket, review, event_image

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WHARTY API",
    description="API para la plataforma de eventos y reseñas verificadas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])

@app.get("/health")
def health_check():
    return {"status": "ok"}

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")