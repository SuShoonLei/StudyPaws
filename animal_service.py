# app/services/animal_service.py
# ─────────────────────────────────────────────────────────────────────────────
# Read-only catalogue of all StudyPaws animals.
# ─────────────────────────────────────────────────────────────────────────────

from __future__ import annotations

from app.core.constants import ANIMAL_DEFINITIONS, VALID_ANIMAL_KEYS
from app.models.schemas import AnimalKey, AnimalResponse, AnimalScene


def _to_schema(defn: dict) -> AnimalResponse:
    return AnimalResponse(
        key          = AnimalKey(defn["key"]),
        name         = defn["name"],
        emoji        = defn["emoji"],
        food         = defn["food"],
        food_name    = defn["food_name"],
        color        = defn["color"],
        accent       = defn["accent"],
        msg          = defn["msg"],
        sleep_msg    = defn["sleep_msg"],
        hunger_msgs  = defn["hunger_msgs"],
        scenes       = [AnimalScene(**s) for s in defn["scenes"]],
    )


class AnimalService:

    def list_animals(self) -> list[AnimalResponse]:
        return [_to_schema(ANIMAL_DEFINITIONS[k]) for k in VALID_ANIMAL_KEYS]

    def get_animal(self, key: str) -> AnimalResponse:
        if key not in VALID_ANIMAL_KEYS:
            raise KeyError(f"Animal '{key}' not found.")
        return _to_schema(ANIMAL_DEFINITIONS[key])
