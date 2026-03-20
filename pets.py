# app/routers/pets.py
# ─────────────────────────────────────────────────────────────────────────────
# REST endpoints for pet inventory and feeding.
#
# GET  /pets/inventory          → full inventory + all pet states
# GET  /pets/{key}              → single pet state
# POST /pets/inventory/add      → add food after a game round
# POST /pets/{key}/feed         → feed a pet one unit
# POST /pets/{key}/reset-happiness → reset happiness to 0
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    AddFoodRequest,
    FeedPetRequest,
    FeedPetResponse,
    InventoryResponse,
    PetState,
)
from app.services.pet_service import PetService

router = APIRouter(prefix="/pets", tags=["Pets & Inventory"])
_svc   = PetService()


def _not_found(key: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Animal '{key}' not found.",
    )


# ── Full inventory ────────────────────────────────────────────────────────────

@router.get(
    "/inventory",
    response_model=InventoryResponse,
    summary="Get food inventory and pet states for all animals",
)
def get_inventory() -> InventoryResponse:
    return _svc.get_inventory()


# ── Single pet state ──────────────────────────────────────────────────────────

@router.get(
    "/{animal_key}",
    response_model=PetState,
    summary="Get state for a single pet",
)
def get_pet(animal_key: str) -> PetState:
    try:
        return _svc.get_pet_state(animal_key)
    except ValueError:
        raise _not_found(animal_key)


# ── Add food (after game) ─────────────────────────────────────────────────────

@router.post(
    "/inventory/add",
    response_model=InventoryResponse,
    summary="Add earned food to inventory",
    description="Called after EndGame to credit the player's food_earned into inventory.",
)
def add_food(body: AddFoodRequest) -> InventoryResponse:
    try:
        return _svc.add_food(body.animal_key.value, body.amount)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ── Feed a pet ────────────────────────────────────────────────────────────────

@router.post(
    "/{animal_key}/feed",
    response_model=FeedPetResponse,
    summary="Feed a pet one unit of food",
    description=(
        "Deducts 1 food, increases happiness by 20 (capped at 100). "
        "Returns 400 if the pet has no food left."
    ),
)
def feed_pet(animal_key: str) -> FeedPetResponse:
    try:
        return _svc.feed_pet(animal_key)
    except KeyError:
        raise _not_found(animal_key)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ── Reset happiness ───────────────────────────────────────────────────────────

@router.post(
    "/{animal_key}/reset-happiness",
    response_model=PetState,
    summary="Reset a pet's happiness to 0",
    description="Called at the start of a new study session.",
)
def reset_happiness(animal_key: str) -> PetState:
    try:
        return _svc.reset_happiness(animal_key)
    except ValueError:
        raise _not_found(animal_key)
