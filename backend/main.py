from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import events, tickets, reviews, auth

app = FastAPI(
    title="EventApp API",
    description="API para la plataforma de eventos y reseñas verificadas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de React con Vite
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