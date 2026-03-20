# app/services/pet_service.py
# ─────────────────────────────────────────────────────────────────────────────
# Manages per-user food inventory and pet happiness.
#
# In this single-user version state is kept in memory.  Swapping
# self._inventory / self._happiness for SQLAlchemy models or Redis hashes
# is the only change needed for a multi-user deployment.
# ─────────────────────────────────────────────────────────────────────────────

from __future__ import annotations

from app.core.constants import (
    ANIMAL_DEFINITIONS,
    HAPPINESS_PER_FEED,
    MAX_HAPPINESS,
    MIN_HAPPINESS,
    MAX_FOOD_PER_ANIMAL,
    VALID_ANIMAL_KEYS,
)
from app.models.schemas import (
    AnimalKey,
    FoodInventory,
    FeedPetResponse,
    InventoryResponse,
    PetState,
)


def _happiness_emoji(happiness: int) -> str:
    if happiness >= 80:
        return "😄"
    if happiness >= 60:
        return "😊"
    if happiness >= 40:
        return "🙂"
    if happiness >= 20:
        return "😐"
    return "😕"


def _happiness_msg(happiness: int) -> str:
    if happiness >= 80:
        return "So happy! 💖"
    if happiness >= 60:
        return "Loving it!"
    if happiness >= 40:
        return "Feeling good~"
    if happiness >= 20:
        return "Getting better!"
    return "Still hungry…"


class PetService:

    def __init__(self) -> None:
        # food counts keyed by animal key
        self._inventory: dict[str, int] = {k: 0 for k in VALID_ANIMAL_KEYS}
        # happiness 0-100 per animal
        self._happiness: dict[str, int] = {k: 0 for k in VALID_ANIMAL_KEYS}

    # ── internal helpers ──────────────────────────────────────────────────────

    def _clamp_food(self, value: int) -> int:
        return max(0, min(MAX_FOOD_PER_ANIMAL, value))

    def _clamp_happiness(self, value: int) -> int:
        return max(MIN_HAPPINESS, min(MAX_HAPPINESS, value))

    def _build_inventory_schema(self) -> FoodInventory:
        return FoodInventory(**{k: self._inventory[k] for k in VALID_ANIMAL_KEYS})

    def _build_pet_state(self, key: str) -> PetState:
        food      = self._inventory[key]
        happiness = self._happiness[key]
        return PetState(
            animal_key        = AnimalKey(key),
            food_available    = food,
            happiness         = happiness,
            happiness_emoji   = _happiness_emoji(happiness),
            happiness_msg     = _happiness_msg(happiness),
            can_feed          = food > 0,
            food_progress_pct = round((food / MAX_FOOD_PER_ANIMAL) * 100, 1),
        )

    # ── public API ────────────────────────────────────────────────────────────

    def get_inventory(self) -> InventoryResponse:
        """Return the full inventory plus the computed state for every pet."""
        return InventoryResponse(
            inventory  = self._build_inventory_schema(),
            pet_states = [self._build_pet_state(k) for k in VALID_ANIMAL_KEYS],
        )

    def add_food(self, animal_key: str, amount: int) -> InventoryResponse:
        """
        Add food to an animal's inventory (called after a game round).
        Caps at MAX_FOOD_PER_ANIMAL and returns the updated inventory.
        """
        if animal_key not in VALID_ANIMAL_KEYS:
            raise ValueError(f"Unknown animal key: '{animal_key}'")
        if amount < 1:
            raise ValueError("Amount must be ≥ 1.")

        current = self._inventory[animal_key]
        self._inventory[animal_key] = self._clamp_food(current + amount)
        return self.get_inventory()

    def feed_pet(self, animal_key: str) -> FeedPetResponse:
        """
        Feed a pet one unit of food.

        Rules
        ─────
        • Deducts 1 from inventory.
        • Increases happiness by HAPPINESS_PER_FEED (default 20), capped at 100.
        • Raises ValueError if there is no food available.
        """
        if animal_key not in VALID_ANIMAL_KEYS:
            raise ValueError(f"Unknown animal key: '{animal_key}'")

        food = self._inventory[animal_key]
        if food <= 0:
            raise ValueError(
                f"No {ANIMAL_DEFINITIONS[animal_key]['food_name']} left for "
                f"{ANIMAL_DEFINITIONS[animal_key]['name']}!"
            )

        self._inventory[animal_key] = food - 1
        old_happiness = self._happiness[animal_key]
        new_happiness = self._clamp_happiness(old_happiness + HAPPINESS_PER_FEED)
        self._happiness[animal_key] = new_happiness

        return FeedPetResponse(
            animal_key       = AnimalKey(animal_key),
            food_remaining   = self._inventory[animal_key],
            happiness        = new_happiness,
            happiness_emoji  = _happiness_emoji(new_happiness),
            happiness_msg    = _happiness_msg(new_happiness),
            happiness_gained = HAPPINESS_PER_FEED,
            inventory        = self._build_inventory_schema(),
        )

    def reset_happiness(self, animal_key: str) -> PetState:
        """Reset a pet's happiness to 0 (e.g. on a new study session start)."""
        if animal_key not in VALID_ANIMAL_KEYS:
            raise ValueError(f"Unknown animal key: '{animal_key}'")
        self._happiness[animal_key] = 0
        return self._build_pet_state(animal_key)

    def get_pet_state(self, animal_key: str) -> PetState:
        if animal_key not in VALID_ANIMAL_KEYS:
            raise ValueError(f"Unknown animal key: '{animal_key}'")
        return self._build_pet_state(animal_key)
