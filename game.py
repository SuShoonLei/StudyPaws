# app/routers/game.py
# ─────────────────────────────────────────────────────────────────────────────
# REST endpoints for the food-collection reward game.
#
# POST /game/start              → start a new game round
# GET  /game/{id}/spawn         → request the next food item spawn
# POST /game/{id}/collect       → tap a food item
# POST /game/{id}/end           → finalise and get the result
# GET  /game/{id}/state         → lightweight status poll
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter, HTTPException, status
from typing import Optional

from app.models.schemas import (
    StartGameRequest,
    StartGameResponse,
    CollectItemRequest,
    CollectItemResponse,
    EndGameRequest,
    GameResultResponse,
    GameItemSpawn,
)
from app.services.game_service import GameService

router = APIRouter(prefix="/game", tags=["Game"])
_svc   = GameService()


def _not_found(game_id: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Game session '{game_id}' not found.",
    )


# ── Start game ────────────────────────────────────────────────────────────────

@router.post(
    "/start",
    response_model=StartGameResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new reward game round",
    description=(
        "Called when the user clicks 🎮 Start Catching! "
        "Returns game metadata and the first batch of food item spawns."
    ),
)
def start_game(body: StartGameRequest) -> StartGameResponse:
    try:
        return _svc.start_game(body.animal_key.value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ── Spawn next item ────────────────────────────────────────────────────────────

@router.get(
    "/{game_id}/spawn",
    response_model=Optional[GameItemSpawn],
    summary="Request the next food item spawn",
    description=(
        "The client calls this on each spawn-interval tick (default 1100 ms). "
        "Returns null when the arena is full or the game has ended."
    ),
)
def request_spawn(game_id: str) -> Optional[GameItemSpawn]:
    try:
        return _svc.request_spawn(game_id)
    except KeyError:
        raise _not_found(game_id)


# ── Collect item (tap) ────────────────────────────────────────────────────────

@router.post(
    "/{game_id}/collect",
    response_model=CollectItemResponse,
    summary="Register a tap on a food item",
    description=(
        "The server validates the tap against the item's server-side TTL. "
        "valid=false means the item had already expired when the tap arrived."
    ),
)
def collect_item(game_id: str, body: CollectItemRequest) -> CollectItemResponse:
    try:
        return _svc.collect_item(
            game_id         = game_id,
            item_id         = body.item_id,
            collected_at_ms = body.collected_at_ms,
        )
    except KeyError:
        raise _not_found(game_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ── End game ──────────────────────────────────────────────────────────────────

@router.post(
    "/{game_id}/end",
    response_model=GameResultResponse,
    summary="Finalise the game and get the authoritative result",
    description=(
        "Call when the 20-second countdown hits zero. "
        "The server reconciles client counts with its own and returns "
        "the canonical caught/missed tallies and food_earned."
    ),
)
def end_game(game_id: str, body: EndGameRequest) -> GameResultResponse:
    try:
        return _svc.end_game(
            game_id        = game_id,
            client_caught  = body.client_caught,
            client_missed  = body.client_missed,
            ended_at_ms    = body.ended_at_ms,
        )
    except KeyError:
        raise _not_found(game_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ── State poll ────────────────────────────────────────────────────────────────

@router.get(
    "/{game_id}/state",
    summary="Lightweight game status poll",
)
def get_state(game_id: str) -> dict:
    try:
        return _svc.get_game_state(game_id)
    except KeyError:
        raise _not_found(game_id)
