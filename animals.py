# app/routers/animals.py
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import AnimalResponse
from app.services.animal_service import AnimalService

router = APIRouter(prefix="/animals", tags=["Animals"])
_svc   = AnimalService()


@router.get(
    "",
    response_model=list[AnimalResponse],
    summary="List all available animals",
)
def list_animals() -> list[AnimalResponse]:
    return _svc.list_animals()


@router.get(
    "/{animal_key}",
    response_model=AnimalResponse,
    summary="Get a single animal definition",
)
def get_animal(animal_key: str) -> AnimalResponse:
    try:
        return _svc.get_animal(animal_key)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Animal '{animal_key}' not found.",
        )
