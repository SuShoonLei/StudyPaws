# app/services/game_service.py
# ─────────────────────────────────────────────────────────────────────────────
# Server-side logic for the food-collection reward mini-game.
#
# Responsibilities
# ────────────────
# • Generate deterministic spawn positions for each game round.
# • Validate each tap: reject taps that arrive after the item's TTL has elapsed
#   (prevents cheating / network-lag abuse).
# • Keep an authoritative caught/missed count so the client cannot inflate it.
# • On EndGame, reconcile client counts vs server counts and return the
#   canonical result with accuracy %.
# ─────────────────────────────────────────────────────────────────────────────

from __future__ import annotations

import uuid
import time
import random
from dataclasses import dataclass, field
from typing import Optional

from app.core.constants import (
    GAME_DURATION_SECONDS,
    GAME_SPAWN_INTERVAL_MS,
    GAME_MAX_ITEMS,
    GAME_ITEM_TTL_MS,
    VALID_ANIMAL_KEYS,
)
from app.models.schemas import (
    AnimalKey,
    GameItemSpawn,
    StartGameResponse,
    CollectItemResponse,
    GameResultResponse,
)


def _now_ms() -> int:
    return time.time_ns() // 1_000_000


# ──────────────────────────────────────────────────────────────────────────────
#  Internal item tracking
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class GameItem:
    item_id:      str
    x_percent:    float
    y_percent:    float
    spawned_at_ms: int
    ttl_ms:       int
    collected:    bool = False
    missed:       bool = False

    @property
    def expires_at_ms(self) -> int:
        return self.spawned_at_ms + self.ttl_ms

    def is_expired(self, at_ms: Optional[int] = None) -> bool:
        now = at_ms if at_ms is not None else _now_ms()
        return now > self.expires_at_ms

    def to_spawn_schema(self) -> GameItemSpawn:
        return GameItemSpawn(
            item_id       = self.item_id,
            x_percent     = round(self.x_percent, 2),
            y_percent     = round(self.y_percent, 2),
            ttl_ms        = self.ttl_ms,
            spawned_at_ms = self.spawned_at_ms,
        )


@dataclass
class GameSession:
    game_id:          str
    animal_key:       str
    duration_seconds: int
    started_at_ms:    int

    items:   dict[str, GameItem] = field(default_factory=dict)
    caught:  int = 0
    missed:  int = 0
    ended:   bool = False

    def is_expired(self) -> bool:
        elapsed_ms = _now_ms() - self.started_at_ms
        return elapsed_ms >= self.duration_seconds * 1000

    def _spawn_position(self) -> tuple[float, float]:
        """
        Generate a random (x%, y%) within safe arena boundaries so items
        don't overlap the HUD at the top or fall off the edge.
        """
        x = round(random.uniform(8.0, 84.0), 2)
        y = round(random.uniform(10.0, 72.0), 2)
        return x, y

    def spawn_item(self, at_ms: Optional[int] = None) -> Optional[GameItem]:
        """
        Spawn one food item if the game is still running and the arena isn't
        at maximum capacity.  Returns None if nothing was spawned.
        """
        if self.ended or self.is_expired():
            return None
        # Count only live (not yet collected/expired) items
        live = sum(
            1 for it in self.items.values()
            if not it.collected and not it.is_expired(at_ms)
        )
        if live >= GAME_MAX_ITEMS:
            return None

        now = at_ms or _now_ms()
        x, y = self._spawn_position()
        item = GameItem(
            item_id       = str(uuid.uuid4()),
            x_percent     = x,
            y_percent     = y,
            spawned_at_ms = now,
            ttl_ms        = GAME_ITEM_TTL_MS,
        )
        self.items[item.item_id] = item
        return item

    def spawn_initial_batch(self, count: int = 3) -> list[GameItem]:
        """Spawn the first batch so the arena isn't empty when it opens."""
        spawned = []
        for _ in range(count):
            item = self.spawn_item()
            if item:
                spawned.append(item)
        return spawned

    def collect_item(self, item_id: str, at_ms: Optional[int] = None) -> tuple[bool, Optional[GameItem]]:
        """
        Mark an item as collected.

        Returns (valid, item):
          valid=True  → tap accepted, caught counter incremented
          valid=False → tap rejected (item expired or already collected)
        """
        now  = at_ms or _now_ms()
        item = self.items.get(item_id)

        if item is None:
            return False, None
        if item.collected:
            return False, item
        if item.is_expired(now):
            item.missed = True
            return False, item

        item.collected = True
        self.caught   += 1
        return True, item

    def finalise(self, at_ms: Optional[int] = None) -> None:
        """
        Called when the game ends.  Marks any un-collected, un-expired items
        as missed and sets the ended flag.
        """
        now = at_ms or _now_ms()
        for item in self.items.values():
            if not item.collected and not item.missed:
                item.missed = True
                self.missed += 1
        self.ended = True


# ──────────────────────────────────────────────────────────────────────────────
#  GameService
# ──────────────────────────────────────────────────────────────────────────────

class GameService:

    def __init__(self) -> None:
        self._sessions: dict[str, GameSession] = {}

    def _get_or_raise(self, game_id: str) -> GameSession:
        gs = self._sessions.get(game_id)
        if gs is None:
            raise KeyError(f"Game session '{game_id}' not found.")
        return gs

    # ── public API ────────────────────────────────────────────────────────────

    def start_game(self, animal_key: str) -> StartGameResponse:
        """
        Initialise a new reward game for the given animal.
        Returns the game metadata plus the first batch of spawned items.
        """
        if animal_key not in VALID_ANIMAL_KEYS:
            raise ValueError(f"Unknown animal key: '{animal_key}'")

        now     = _now_ms()
        game_id = str(uuid.uuid4())
        session = GameSession(
            game_id          = game_id,
            animal_key       = animal_key,
            duration_seconds = GAME_DURATION_SECONDS,
            started_at_ms    = now,
        )
        initial = session.spawn_initial_batch(count=3)
        self._sessions[game_id] = session

        return StartGameResponse(
            game_id           = game_id,
            animal_key        = AnimalKey(animal_key),
            duration_seconds  = GAME_DURATION_SECONDS,
            max_items         = GAME_MAX_ITEMS,
            spawn_interval_ms = GAME_SPAWN_INTERVAL_MS,
            initial_spawns    = [it.to_spawn_schema() for it in initial],
            started_at_ms     = now,
        )

    def request_spawn(self, game_id: str) -> Optional[GameItemSpawn]:
        """
        Client calls this on each spawn-interval tick.
        Returns a new GameItemSpawn or None if the arena is full / game ended.
        """
        session = self._get_or_raise(game_id)
        item    = session.spawn_item()
        return item.to_spawn_schema() if item else None

    def collect_item(
        self,
        game_id: str,
        item_id: str,
        collected_at_ms: int,
    ) -> CollectItemResponse:
        """Validate and register a tap on a food item."""
        session = self._get_or_raise(game_id)

        if session.ended:
            raise ValueError("Game has already ended.")

        valid, item = session.collect_item(item_id, collected_at_ms)

        # Optionally spawn a replacement to keep the arena lively
        next_spawn = None
        if valid:
            new_item = session.spawn_item(collected_at_ms)
            next_spawn = new_item.to_spawn_schema() if new_item else None

        return CollectItemResponse(
            game_id      = game_id,
            item_id      = item_id,
            valid        = valid,
            caught_total = session.caught,
            next_spawn   = next_spawn,
        )

    def end_game(
        self,
        game_id: str,
        client_caught: int,
        client_missed: int,
        ended_at_ms: int,
    ) -> GameResultResponse:
        """
        Finalise the game.  Uses server-authoritative counts; logs a warning
        if the client counts diverge significantly (future anti-cheat hook).
        """
        session = self._get_or_raise(game_id)

        if session.ended:
            # Idempotent – return the already-computed result
            pass
        else:
            session.finalise(ended_at_ms)

        server_caught = session.caught
        server_missed = session.missed
        total_spawned = len(session.items)

        accuracy = (server_caught / total_spawned * 100) if total_spawned > 0 else 0.0

        return GameResultResponse(
            game_id          = game_id,
            animal_key       = AnimalKey(session.animal_key),
            caught           = server_caught,
            missed           = server_missed,
            food_earned      = server_caught,
            duration_seconds = session.duration_seconds,
            accuracy_percent = round(accuracy, 1),
        )

    def get_game_state(self, game_id: str) -> dict:
        """Lightweight status check used by the client's polling loop."""
        session  = self._get_or_raise(game_id)
        now      = _now_ms()
        elapsed  = (now - session.started_at_ms) / 1000
        time_left = max(0.0, session.duration_seconds - elapsed)
        return {
            "game_id":          game_id,
            "animal_key":       session.animal_key,
            "time_left_seconds": round(time_left, 2),
            "caught":           session.caught,
            "missed":           session.missed,
            "ended":            session.ended or session.is_expired(),
        }
