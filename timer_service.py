# app/services/timer_service.py
# ─────────────────────────────────────────────────────────────────────────────
# Server-side study timer.
#
# Design principles
# ─────────────────
# • All time arithmetic uses wall-clock milliseconds (time.time_ns() // 1_000_000)
#   so the server is immune to the same interval-drift problem the frontend had.
# • A TimerSession stores the epoch-ms timestamps of every start/pause/resume
#   event.  The authoritative "elapsed" is always recalculated on-the-fly from
#   those timestamps – it is never accumulated in a counter.
# • The client can POST /timer/validate at any time; the server will return the
#   drift between the client's local value and the server's authoritative value.
# ─────────────────────────────────────────────────────────────────────────────

from __future__ import annotations

import uuid
import time
from dataclasses import dataclass, field
from typing import Optional

from app.core.constants import (
    DEFAULT_DURATION_MINUTES,
    MIN_DURATION_MINUTES,
    MAX_DURATION_MINUTES,
    VALID_ANIMAL_KEYS,
)
from app.models.schemas import (
    AnimalKey,
    TimerStatus,
    TimerStateResponse,
    ValidateTimerResponse,
)


def _now_ms() -> int:
    """Current epoch time in milliseconds."""
    return time.time_ns() // 1_000_000


def _fmt(seconds: int) -> str:
    """Format seconds as MM:SS — mirrors the frontend fmt() function exactly."""
    seconds = max(0, seconds)
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def _scene_index(elapsed_seconds: int, total_seconds: int, num_scenes: int = 5) -> int:
    """
    Divide the session into equal-length scene windows and return which window
    the current elapsed time falls into.

    e.g. 25-minute session, 5 scenes → each scene lasts 300 seconds.
    elapsed=0-299 → scene 0, 300-599 → scene 1, … 1200-1499 → scene 4.
    """
    if total_seconds <= 0 or num_scenes <= 0:
        return 0
    window = total_seconds / num_scenes
    idx = int(elapsed_seconds / window)
    return min(idx, num_scenes - 1)


# ──────────────────────────────────────────────────────────────────────────────
#  Session dataclass (in-memory store – replace with DB for multi-user)
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class TimerSession:
    session_id:       str
    animal_key:       str
    duration_seconds: int

    # timestamps (epoch ms); None = not yet reached that state
    started_at_ms:    Optional[int] = None
    paused_at_ms:     Optional[int] = None

    # accumulated pause duration in ms (so pauses don't count as study time)
    total_paused_ms:  int = 0

    status: TimerStatus = TimerStatus.idle

    def elapsed_seconds(self, at_ms: Optional[int] = None) -> int:
        """
        Wall-clock seconds of actual study time that have elapsed.
        Paused intervals are subtracted out.
        """
        if self.started_at_ms is None:
            return 0

        now = at_ms if at_ms is not None else _now_ms()

        if self.status == TimerStatus.paused and self.paused_at_ms is not None:
            # Time stopped at the moment of pause
            raw_ms = self.paused_at_ms - self.started_at_ms - self.total_paused_ms
        elif self.status == TimerStatus.done:
            raw_ms = self.duration_seconds * 1000
        else:
            # running
            raw_ms = now - self.started_at_ms - self.total_paused_ms

        return max(0, raw_ms // 1000)

    def remaining_seconds(self, at_ms: Optional[int] = None) -> int:
        return max(0, self.duration_seconds - self.elapsed_seconds(at_ms))

    def progress(self, at_ms: Optional[int] = None) -> float:
        if self.duration_seconds == 0:
            return 1.0
        return min(1.0, self.elapsed_seconds(at_ms) / self.duration_seconds)

    def to_response(self, at_ms: Optional[int] = None) -> TimerStateResponse:
        now      = at_ms or _now_ms()
        elapsed  = self.elapsed_seconds(now)
        remaining = self.remaining_seconds(now)
        from app.core.constants import ANIMAL_DEFINITIONS
        num_scenes = len(ANIMAL_DEFINITIONS.get(self.animal_key, {}).get("scenes", [1]*5))
        return TimerStateResponse(
            session_id          = self.session_id,
            animal_key          = AnimalKey(self.animal_key),
            status              = self.status,
            duration_seconds    = self.duration_seconds,
            elapsed_seconds     = elapsed,
            remaining_seconds   = remaining,
            progress            = self.progress(now),
            current_scene_index = _scene_index(elapsed, self.duration_seconds, num_scenes),
            formatted_remaining = _fmt(remaining),
            started_at_ms       = self.started_at_ms,
            paused_at_ms        = self.paused_at_ms,
        )


# ──────────────────────────────────────────────────────────────────────────────
#  TimerService
# ──────────────────────────────────────────────────────────────────────────────

class TimerService:
    """
    Manages the lifecycle of study timer sessions.

    All mutating methods return a fresh TimerStateResponse so the router
    never has to touch session internals.
    """

    def __init__(self) -> None:
        self._sessions: dict[str, TimerSession] = {}

    # ── helpers ───────────────────────────────────────────────────────────────

    def _get_or_raise(self, session_id: str) -> TimerSession:
        session = self._sessions.get(session_id)
        if session is None:
            raise KeyError(f"Session '{session_id}' not found.")
        return session

    # ── public API ────────────────────────────────────────────────────────────

    def create_session(
        self,
        animal_key: str,
        duration_minutes: int = DEFAULT_DURATION_MINUTES,
    ) -> TimerStateResponse:
        """
        Create a new idle timer session.  The session is NOT started yet;
        the client controls when to call start().
        """
        if animal_key not in VALID_ANIMAL_KEYS:
            raise ValueError(f"Unknown animal key: '{animal_key}'")

        duration_minutes = max(MIN_DURATION_MINUTES, min(MAX_DURATION_MINUTES, duration_minutes))
        session = TimerSession(
            session_id       = str(uuid.uuid4()),
            animal_key       = animal_key,
            duration_seconds = duration_minutes * 60,
        )
        self._sessions[session.session_id] = session
        return session.to_response()

    def start(self, session_id: str) -> TimerStateResponse:
        """
        Start (or restart after reset) a session.
        Raises ValueError if the session is already running or done.
        """
        session = self._get_or_raise(session_id)
        if session.status == TimerStatus.running:
            raise ValueError("Timer is already running.")
        if session.status == TimerStatus.done:
            raise ValueError("Session is complete. Create a new session or reset.")

        now = _now_ms()
        if session.status == TimerStatus.idle:
            session.started_at_ms   = now
            session.total_paused_ms = 0
        # If resuming from paused, account for the paused interval
        elif session.status == TimerStatus.paused and session.paused_at_ms is not None:
            session.total_paused_ms += now - session.paused_at_ms
            session.paused_at_ms    = None

        session.status = TimerStatus.running
        return session.to_response(now)

    def pause(self, session_id: str, paused_at_ms: Optional[int] = None) -> TimerStateResponse:
        """
        Pause a running session.  Uses client-supplied timestamp when provided
        (keeps the server consistent with what the user actually saw).
        """
        session = self._get_or_raise(session_id)
        if session.status != TimerStatus.running:
            raise ValueError(f"Cannot pause a timer that is '{session.status}'.")

        now = paused_at_ms or _now_ms()
        session.paused_at_ms = now
        session.status       = TimerStatus.paused
        return session.to_response(now)

    def resume(self, session_id: str, resumed_at_ms: Optional[int] = None) -> TimerStateResponse:
        """Resume a paused session."""
        session = self._get_or_raise(session_id)
        if session.status != TimerStatus.paused:
            raise ValueError(f"Cannot resume a timer that is '{session.status}'.")

        now = resumed_at_ms or _now_ms()
        if session.paused_at_ms is not None:
            session.total_paused_ms += now - session.paused_at_ms
            session.paused_at_ms    = None

        session.status = TimerStatus.running
        return session.to_response(now)

    def reset(self, session_id: str) -> TimerStateResponse:
        """
        Reset a session back to idle, keeping the same duration and animal.
        """
        session = self._get_or_raise(session_id)
        session.started_at_ms   = None
        session.paused_at_ms    = None
        session.total_paused_ms = 0
        session.status          = TimerStatus.idle
        return session.to_response()

    def tick(self, session_id: str) -> TimerStateResponse:
        """
        Called by the client on each polling interval to get the authoritative
        remaining time.  Auto-transitions to 'done' when time expires.
        """
        session = self._get_or_raise(session_id)
        now = _now_ms()

        if session.status == TimerStatus.running:
            if session.remaining_seconds(now) <= 0:
                session.status = TimerStatus.done

        return session.to_response(now)

    def complete(self, session_id: str) -> TimerStateResponse:
        """Explicitly mark a session as done (called when client confirms completion)."""
        session = self._get_or_raise(session_id)
        session.status = TimerStatus.done
        return session.to_response()

    def validate(
        self,
        session_id: str,
        client_remaining: int,
        client_timestamp_ms: int,
    ) -> ValidateTimerResponse:
        """
        Compare client's local remaining value against server's authoritative
        calculation.  Returns the drift so the frontend can self-correct.
        """
        session  = self._get_or_raise(session_id)
        server_r = session.remaining_seconds(client_timestamp_ms)
        drift    = client_remaining - server_r   # positive = client is ahead of server

        return ValidateTimerResponse(
            session_id               = session_id,
            server_remaining_seconds = server_r,
            client_remaining_seconds = client_remaining,
            drift_seconds            = drift,
            authoritative_remaining  = server_r,
            formatted_remaining      = _fmt(server_r),
        )

    def get_state(self, session_id: str) -> TimerStateResponse:
        """Fetch current state without mutating anything."""
        session = self._get_or_raise(session_id)
        return session.to_response()

    def delete_session(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)
