# app/routers/timer.py
# ─────────────────────────────────────────────────────────────────────────────
# REST endpoints for the study timer.
#
# POST /timer/session          → create a new idle session
# POST /timer/session/{id}/start   → start / resume
# POST /timer/session/{id}/pause   → pause
# POST /timer/session/{id}/resume  → resume from pause
# POST /timer/session/{id}/reset   → reset to idle
# POST /timer/session/{id}/complete→ mark as done
# GET  /timer/session/{id}         → poll current state
# POST /timer/session/{id}/validate→ drift check
# DELETE /timer/session/{id}       → clean up
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    StartTimerRequest,
    TimerStateResponse,
    PauseTimerRequest,
    ResumeTimerRequest,
    ResetTimerRequest,
    ValidateTimerRequest,
    ValidateTimerResponse,
    ErrorResponse,
)
from app.services.timer_service import TimerService

router = APIRouter(prefix="/timer", tags=["Timer"])
_svc   = TimerService()


def _not_found(session_id: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Timer session '{session_id}' not found.",
    )


def _bad_request(msg: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)


# ── Create session ────────────────────────────────────────────────────────────

@router.post(
    "/session",
    response_model=TimerStateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new study timer session",
    description=(
        "Creates an idle session for the chosen animal and duration. "
        "Call /start on the returned session_id when the user clicks ▶."
    ),
)
def create_session(body: StartTimerRequest) -> TimerStateResponse:
    try:
        return _svc.create_session(
            animal_key       = body.animal_key.value,
            duration_minutes = body.duration_minutes,
        )
    except ValueError as exc:
        raise _bad_request(str(exc))


# ── Start ─────────────────────────────────────────────────────────────────────

@router.post(
    "/session/{session_id}/start",
    response_model=TimerStateResponse,
    summary="Start an idle session",
)
def start_session(session_id: str) -> TimerStateResponse:
    try:
        return _svc.start(session_id)
    except KeyError:
        raise _not_found(session_id)
    except ValueError as exc:
        raise _bad_request(str(exc))


# ── Pause ─────────────────────────────────────────────────────────────────────

@router.post(
    "/session/{session_id}/pause",
    response_model=TimerStateResponse,
    summary="Pause a running session",
)
def pause_session(session_id: str, body: PauseTimerRequest) -> TimerStateResponse:
    try:
        return _svc.pause(session_id, body.paused_at_ms)
    except KeyError:
        raise _not_found(session_id)
    except ValueError as exc:
        raise _bad_request(str(exc))


# ── Resume ────────────────────────────────────────────────────────────────────

@router.post(
    "/session/{session_id}/resume",
    response_model=TimerStateResponse,
    summary="Resume a paused session",
)
def resume_session(session_id: str, body: ResumeTimerRequest) -> TimerStateResponse:
    try:
        return _svc.resume(session_id, body.resumed_at_ms)
    except KeyError:
        raise _not_found(session_id)
    except ValueError as exc:
        raise _bad_request(str(exc))


# ── Reset ─────────────────────────────────────────────────────────────────────

@router.post(
    "/session/{session_id}/reset",
    response_model=TimerStateResponse,
    summary="Reset session back to idle",
)
def reset_session(session_id: str) -> TimerStateResponse:
    try:
        return _svc.reset(session_id)
    except KeyError:
        raise _not_found(session_id)


# ── Complete ──────────────────────────────────────────────────────────────────

@router.post(
    "/session/{session_id}/complete",
    response_model=TimerStateResponse,
    summary="Mark session as done",
)
def complete_session(session_id: str) -> TimerStateResponse:
    try:
        return _svc.complete(session_id)
    except KeyError:
        raise _not_found(session_id)


# ── Poll state ────────────────────────────────────────────────────────────────

@router.get(
    "/session/{session_id}",
    response_model=TimerStateResponse,
    summary="Get current timer state (poll)",
    description=(
        "The frontend calls this every second while the timer is running. "
        "The server auto-transitions to 'done' when remaining reaches 0."
    ),
)
def get_session(session_id: str) -> TimerStateResponse:
    try:
        return _svc.tick(session_id)
    except KeyError:
        raise _not_found(session_id)


# ── Validate / drift check ────────────────────────────────────────────────────

@router.post(
    "/session/{session_id}/validate",
    response_model=ValidateTimerResponse,
    summary="Validate client remaining time against server",
    description=(
        "Send the client's current remaining_seconds and the epoch-ms timestamp "
        "it was sampled at. The server returns the authoritative value and the "
        "drift in seconds so the UI can self-correct."
    ),
)
def validate_timer(session_id: str, body: ValidateTimerRequest) -> ValidateTimerResponse:
    try:
        return _svc.validate(
            session_id           = session_id,
            client_remaining     = body.client_remaining_seconds,
            client_timestamp_ms  = body.client_timestamp_ms,
        )
    except KeyError:
        raise _not_found(session_id)


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete(
    "/session/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a session from memory",
)
def delete_session(session_id: str) -> None:
    _svc.delete_session(session_id)
