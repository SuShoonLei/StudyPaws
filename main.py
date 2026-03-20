# app/main.py
# ─────────────────────────────────────────────────────────────────────────────
# StudyPaws API — FastAPI application entry point
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import animals, timer, game, pets
from app.models.schemas import HealthResponse

app = FastAPI(
    title       = "StudyPaws API 🐾",
    description = (
        "Backend for the StudyPaws study-timer companion app.\n\n"
        "**Domains**\n"
        "- `/animals` — animal catalogue (read-only)\n"
        "- `/timer`   — study timer sessions with wall-clock accuracy\n"
        "- `/game`    — reward mini-game (food collection)\n"
        "- `/pets`    — food inventory and pet feeding\n"
    ),
    version     = "1.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the React dev server (and any deployed origin) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["http://localhost:3000", "http://localhost:5173", "*"],
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(animals.router)
app.include_router(timer.router)
app.include_router(game.router)
app.include_router(pets.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health() -> HealthResponse:
    return HealthResponse()


@app.get("/", tags=["Health"])
def root() -> dict:
    return {
        "service": "StudyPaws API 🐾",
        "docs":    "/docs",
        "health":  "/health",
    }
