import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import init_db
from app.api import auth, pets, dev, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("data", exist_ok=True)
    os.makedirs("uploads/photos", exist_ok=True)
    os.makedirs("uploads/documents", exist_ok=True)
    await init_db()
    yield


# Create dirs before app starts so StaticFiles mount succeeds at import time
os.makedirs("uploads/photos", exist_ok=True)
os.makedirs("uploads/documents", exist_ok=True)

app = FastAPI(title="PetMind API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(pets.router, prefix="/api/v1")
app.include_router(dev.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1/pets", tags=["chat"])


@app.get("/health")
async def health():
    return {"status": "ok"}
