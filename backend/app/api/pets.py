import asyncio
import json
import uuid
import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user
from app.models.user import User
from app.models.pet import Pet, PetDocument
from app.schemas.pet import OnboardingPayload, PetOut, DocumentOut
from app.services import cognee_memory

router = APIRouter(prefix="/pets", tags=["pets"])

UPLOAD_DIR = Path("uploads")


async def save_upload(file: UploadFile, subfolder: str) -> str:
    dest = UPLOAD_DIR / subfolder
    os.makedirs(dest, exist_ok=True)
    ext = Path(file.filename).suffix if file.filename else ""
    filename = f"{uuid.uuid4()}{ext}"
    content = await file.read()
    (dest / filename).write_bytes(content)
    return f"/uploads/{subfolder}/{filename}"


def pet_to_out(pet: Pet, docs: list[PetDocument] = []) -> dict:
    return {
        "id": pet.id,
        "name": pet.name,
        "species": pet.species,
        "breed": pet.breed,
        "dob": pet.dob,
        "dob_type": pet.dob_type,
        "gender": pet.gender,
        "neutered": pet.neutered,
        "weight_value": pet.weight_value,
        "weight_unit": pet.weight_unit,
        "vaccinated": pet.vaccinated,
        "allergies": json.loads(pet.allergies or "[]"),
        "medications": json.loads(pet.medications or "[]"),
        "surgeries": json.loads(pet.surgeries or "[]"),
        "conditions": json.loads(pet.conditions or "[]"),
        "free_memory": pet.free_memory,
        "photo_url": pet.photo_url,
        "documents": [
            {"id": d.id, "original_name": d.original_name, "doc_type": d.doc_type, "filename": d.filename}
            for d in docs
        ],
    }


@router.post("/onboard", status_code=201)
async def onboard_pet(
    data: str = Form(...),
    photo: Optional[UploadFile] = File(None),
    docs: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payload = OnboardingPayload.model_validate_json(data)

    photo_url = None
    if photo and photo.filename:
        photo_url = await save_upload(photo, "photos")

    pet = Pet(
        owner_id=current_user.id,
        name=payload.name,
        species=payload.species,
        breed=payload.breed,
        dob=payload.dob,
        dob_type=payload.dob_type,
        gender=payload.gender,
        neutered=payload.neutered,
        weight_value=payload.weight.value if payload.weight else None,
        weight_unit=payload.weight.unit if payload.weight else "kg",
        vaccinated=payload.vaccinated,
        allergies=json.dumps(payload.allergies),
        medications=json.dumps([m.model_dump() for m in payload.medications]),
        surgeries=json.dumps([s.model_dump() for s in payload.surgeries]),
        conditions=json.dumps(payload.conditions),
        free_memory=payload.free_memory,
        photo_url=photo_url,
    )
    db.add(pet)
    await db.flush()

    saved_docs = []
    for doc in docs:
        if doc and doc.filename:
            filename = await save_upload(doc, "documents")
            pet_doc = PetDocument(
                pet_id=pet.id,
                filename=filename,
                original_name=doc.filename,
                doc_type="medical",
            )
            db.add(pet_doc)
            saved_docs.append(pet_doc)

    await db.commit()
    await db.refresh(pet)

    # Store pet memory in Cognee graph (background — never blocks the response)
    pet_out = pet_to_out(pet, saved_docs)
    if settings.COGNEE_API_URL:
        pet_dict = {
            **pet_out,
            "allergies": json.loads(pet.allergies or "[]"),
            "medications": json.loads(pet.medications or "[]"),
            "surgeries": json.loads(pet.surgeries or "[]"),
            "conditions": json.loads(pet.conditions or "[]"),
            "free_memory": pet.free_memory or "",
        }
        asyncio.create_task(
            cognee_memory.store_pet_to_cognee(pet_dict, settings.COGNEE_API_URL)
        )

    return pet_out


@router.get("/", response_model=List[dict])
async def list_pets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.owner_id == current_user.id))
    pets = result.scalars().all()
    return [pet_to_out(p) for p in pets]


@router.get("/{pet_id}")
async def get_pet(
    pet_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == current_user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    docs_result = await db.execute(select(PetDocument).where(PetDocument.pet_id == pet_id))
    return pet_to_out(pet, docs_result.scalars().all())


@router.get("/{pet_id}/graph")
async def get_pet_graph(
    pet_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return Cognee graph node counts for the MemorySphere visualization."""
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == current_user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if not settings.COGNEE_API_URL:
        return {"counts": {}, "source": "none"}

    counts = await cognee_memory.get_graph_summary(pet_id, settings.COGNEE_API_URL)
    return {"counts": counts, "source": "cognee"}
