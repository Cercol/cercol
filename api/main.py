"""
Cèrcol API — FastAPI backend skeleton.

Phase 4 foundation: health check + CORS.
Future routes: /auth/*, /results/*, /reports/*
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Cèrcol API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

ALLOWED_ORIGINS = [
    "https://cercol.team",
    "http://localhost:5173",   # Vite dev server
    "http://localhost:4173",   # Vite preview
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "version": app.version}
