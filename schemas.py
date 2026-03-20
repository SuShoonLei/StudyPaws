# app/models/schemas.py
# ─────────────────────────────────────────────────────────────────────────────
# Pydantic v2 models for every request body and response shape used by the
# StudyPaws API.  Models are grouped by domain:
#   • Animal          – catalogue lookup
#   • Timer           – session lifecycle
#   • Game            – reward mini-game
#   • Pet / Inventory – feeding and food tracking
# ─────────────────────────────────────────────────────────────────────────────

from __future__ import annotations

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.constants import (
    MIN_DURATION_MINUTES,
    MAX_DURATION_MINUTES,
    MAX_HAPPINESS,
    MIN_HAPPINESS,
    MAX_FOOD_PER_ANIMAL,
    VALID_ANIMAL_KEYS,
    GAME_DURATION_SECONDS,
)


# ══════════════════════════════════════════════════════════════════════════════
#  Shared / Enums
# ══════════════════════════════════════════════════════════════════════════════

class AnimalKey(str, Enum):
    koala = "koala"
    panda = "panda"
    fox   = "fox"
    puppy = "puppy"
    bunny = "bunny"
    bear  = "bear"


class TimerStatus(str, Enum):
    idle    = "idle"
    running = "running"
    paused  = "paused"
    done    = "done"


class GamePhase(str, Enum):
    intro   = "intro"
    playing = "playing"
    result  = "result"
    feeding = "feeding"


# ══════════════════════════════════════════════════════════════════════════════
#  Animal catalogue
# ══════════════════════════════════════════════════════════════════════════════

class AnimalScene(BaseModel):
    label:    str
    activity: str


class AnimalResponse(BaseModel):
    key:          AnimalKey
    name:         str
    emoji:        str
    food:         str
    food_name:    str
    color:        str
    accent:       str
    msg:          str
    sleep_msg:    str
    hunger_msgs:  list[str]
    scenes:       list[AnimalScene]


# ══════════════════════════════════════════════════════════════════════════════
#  Timer
# ══════════════════════════════════════════════════════════════════════════════

class StartTimerRequest(BaseModel):
    """
    Called when the user hits ▶ Start on the Study Timer screen.

    duration_minutes: how long the session should last (1–180).
    animal_key:       which pet is studying (used for server-side scene logic).
    """
    animal_key:        AnimalKey
    duration_minutes:  int = Field(
        default=25,
        ge=MIN_DURATION_MINUTES,
        le=MAX_DURATION_MINUTES,
        description="Session length in whole minutes (1–180).",
    )

    @field_validator("duration_minutes")
    @classmethod
    def must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("duration_minutes must be ≥ 1")
        return v


class TimerStateResponse(BaseModel):
    """
    Canonical timer state returned after every start / pause / resume / reset.

    elapsed_seconds:   wall-clock seconds that have actually passed.
    remaining_seconds: how many seconds are left (authoritative server value).
    progress:          0.0 → 1.0 fraction completed, ready to drive the ring SVG.
    current_scene_index: which activity scene the animal should be showing (0-4).
    status:            one of idle | running | paused | done.
    formatted_remaining: pre-formatted "MM:SS" string matching the frontend fmt().
    """
    session_id:           str
    animal_key:           AnimalKey
    status:               TimerStatus
    duration_seconds:     int
    elapsed_seconds:      int
    remaining_seconds:    int
    progress:             float = Field(ge=0.0, le=1.0)
    current_scene_index:  int   = Field(ge=0, le=4)
    formatted_remaining:  str
    started_at_ms:        Optional[int] = None   # epoch ms, None when idle/paused
    paused_at_ms:         Optional[int] = None


class PauseTimerRequest(BaseModel):
    session_id:   str
    paused_at_ms: int = Field(description="Client epoch ms at moment of pause.")


class ResumeTimerRequest(BaseModel):
    session_id:    str
    resumed_at_ms: int = Field(description="Client epoch ms at moment of resume.")


class ResetTimerRequest(BaseModel):
    session_id: str


class ValidateTimerRequest(BaseModel):
    """
    The client can POST its local remaining_seconds here at any point;
    the server returns the authoritative value so the UI can self-correct
    if it has drifted (e.g. after a tab was backgrounded).
    """
    session_id:                str
    client_remaining_seconds:  int
    client_timestamp_ms:       int  = Field(description="epoch ms when client took the reading")


class ValidateTimerResponse(BaseModel):
    session_id:                str
    server_remaining_seconds:  int
    client_remaining_seconds:  int
    drift_seconds:             int   # positive = client is behind (too slow)
    authoritative_remaining:   int   # use this value
    formatted_remaining:       str


# ══════════════════════════════════════════════════════════════════════════════
#  Reward Game
# ══════════════════════════════════════════════════════════════════════════════

class StartGameRequest(BaseModel):
    """Initialises a new reward-game round after a completed study session."""
    animal_key: AnimalKey


class GameItemSpawn(BaseModel):
    """
    Describes a single food item the server has decided to spawn.
    The client places it on screen and starts its TTL countdown.
    """
    item_id:      str
    x_percent:    float = Field(ge=8.0,  le=92.0)   # left % in the arena
    y_percent:    float = Field(ge=8.0,  le=92.0)   # top  % in the arena
    ttl_ms:       int                                # how long before it vanishes
    spawned_at_ms: int                               # server epoch ms


class StartGameResponse(BaseModel):
    game_id:          str
    animal_key:       AnimalKey
    duration_seconds: int
    max_items:        int
    spawn_interval_ms: int
    initial_spawns:   list[GameItemSpawn]   # first batch so screen isn't empty
    started_at_ms:    int


class CollectItemRequest(BaseModel):
    """Sent when the user taps a food item."""
    game_id:        str
    item_id:        str
    collected_at_ms: int  = Field(description="Client epoch ms of the tap.")


class CollectItemResponse(BaseModel):
    game_id:     str
    item_id:     str
    valid:       bool    # False if item had already expired server-side
    caught_total: int
    next_spawn:  Optional[GameItemSpawn] = None   # server pushes the next item


class EndGameRequest(BaseModel):
    """
    Called when the 20-second countdown reaches zero.
    Client sends its own tallies; server validates and returns the canonical result.
    """
    game_id:        str
    client_caught:  int = Field(ge=0)
    client_missed:  int = Field(ge=0)
    ended_at_ms:    int


class GameResultResponse(BaseModel):
    game_id:         str
    animal_key:      AnimalKey
    caught:          int   # server-authoritative count
    missed:          int
    food_earned:     int   # same as caught (1:1 for now)
    duration_seconds: int
    accuracy_percent: float


# ══════════════════════════════════════════════════════════════════════════════
#  Pet / Inventory / Feeding
# ══════════════════════════════════════════════════════════════════════════════

class FoodInventory(BaseModel):
    """Current food counts for every animal.  Capped at MAX_FOOD_PER_ANIMAL."""
    koala: int = Field(default=0, ge=0, le=MAX_FOOD_PER_ANIMAL)
    panda: int = Field(default=0, ge=0, le=MAX_FOOD_PER_ANIMAL)
    fox:   int = Field(default=0, ge=0, le=MAX_FOOD_PER_ANIMAL)
    puppy: int = Field(default=0, ge=0, le=MAX_FOOD_PER_ANIMAL)
    bunny: int = Field(default=0, ge=0, le=MAX_FOOD_PER_ANIMAL)
    bear:  int = Field(default=0, ge=0, le=MAX_FOOD_PER_ANIMAL)

    def get(self, key: str) -> int:
        return getattr(self, key, 0)

    def set(self, key: str, value: int) -> None:
        setattr(self, key, max(0, min(MAX_FOOD_PER_ANIMAL, value)))

    @property
    def total(self) -> int:
        return self.koala + self.panda + self.fox + self.puppy + self.bunny + self.bear


class AddFoodRequest(BaseModel):
    """Called after a game round to add earned food to inventory."""
    animal_key:   AnimalKey
    amount:       int = Field(ge=1, description="Number of food items to add (≥ 1).")


class FeedPetRequest(BaseModel):
    """Called every time the user taps the Feed button on the feeding screen."""
    animal_key: AnimalKey


class PetState(BaseModel):
    """Full state for a single pet on the feeding screen."""
    animal_key:       AnimalKey
    food_available:   int
    happiness:        int   = Field(ge=MIN_HAPPINESS, le=MAX_HAPPINESS)
    happiness_emoji:  str
    happiness_msg:    str
    can_feed:         bool
    food_progress_pct: float = Field(ge=0.0, le=100.0)


class FeedPetResponse(BaseModel):
    animal_key:        AnimalKey
    food_remaining:    int
    happiness:         int
    happiness_emoji:   str
    happiness_msg:     str
    happiness_gained:  int
    inventory:         FoodInventory


class InventoryResponse(BaseModel):
    inventory:  FoodInventory
    pet_states: list[PetState]


# ══════════════════════════════════════════════════════════════════════════════
#  Generic responses
# ══════════════════════════════════════════════════════════════════════════════

class ErrorResponse(BaseModel):
    detail: str


class HealthResponse(BaseModel):
    status:  str = "ok"
    version: str = "1.0.0"
    service: str = "StudyPaws API"
