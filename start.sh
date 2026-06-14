#!/bin/bash

# Matar procesos anteriores
fuser -k 8000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

# Backend
cd backend
. venv/bin/activate
export DATABASE_URL=mysql+pymysql://eventuser:eventpass123@localhost:3306/eventapp
export SECRET_KEY=clave_super_secreta_123
export ALGORITHM=HS256
uvicorn main:app --reload &

# Frontend
cd ../frontend
npm run dev

# ./start.sh -> ejecucion