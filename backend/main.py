"""Pymmys Mission Control — FastAPI backend.

Start with:
    uvicorn backend.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, SessionLocal
from .models import Base
from .seed import seed
from . import simulator
from .routers import agents, missions, activity, system


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ────────────────────────────────────────────────────────────
    Base.metadata.create_all(bind=engine)  # create tables if they don't exist

    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()

    simulator.start()
    print("[startup] Pymmys backend ready")

    yield  # app is running

    # ── Shutdown ───────────────────────────────────────────────────────────
    simulator.stop()
    print("[shutdown] Pymmys backend stopped")


app = FastAPI(
    title="Pymmys Mission Control API",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allow the Next.js dev server (3000) and any localhost port during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(agents.router)
app.include_router(missions.router)
app.include_router(activity.router)
app.include_router(system.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "pymmys-mission-control"}
