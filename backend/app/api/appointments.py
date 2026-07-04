from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.pet import Pet, PetAppointment

router = APIRouter()


class AppointmentIn(BaseModel):
    vet_name: Optional[str] = None
    clinic_name: Optional[str] = None
    date: str
    reason: Optional[str] = None


@router.get("/{pet_id}/appointments")
async def list_appointments(
    pet_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(404, "Pet not found")

    appts = await db.execute(
        select(PetAppointment)
        .where(PetAppointment.pet_id == pet_id)
        .order_by(PetAppointment.date)
    )
    rows = appts.scalars().all()
    return [
        {
            "id": a.id,
            "vet_name": a.vet_name,
            "clinic_name": a.clinic_name,
            "date": a.date,
            "reason": a.reason,
        }
        for a in rows
    ]


@router.post("/{pet_id}/appointments", status_code=201)
async def create_appointment(
    pet_id: int,
    body: AppointmentIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(404, "Pet not found")

    appt = PetAppointment(
        pet_id=pet_id,
        vet_name=body.vet_name,
        clinic_name=body.clinic_name,
        date=body.date,
        reason=body.reason,
    )
    db.add(appt)
    await db.commit()
    await db.refresh(appt)
    return {
        "id": appt.id,
        "vet_name": appt.vet_name,
        "clinic_name": appt.clinic_name,
        "date": appt.date,
        "reason": appt.reason,
    }


@router.delete("/{pet_id}/appointments/{appt_id}", status_code=204)
async def delete_appointment(
    pet_id: int,
    appt_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(404, "Pet not found")

    appt = await db.execute(
        select(PetAppointment).where(PetAppointment.id == appt_id, PetAppointment.pet_id == pet_id)
    )
    a = appt.scalar_one_or_none()
    if not a:
        raise HTTPException(404, "Appointment not found")
    await db.delete(a)
    await db.commit()


@router.get("/{pet_id}/frequent-vets")
async def frequent_vets(
    pet_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return unique (vet_name, clinic_name) pairs from past appointments, most recent first."""
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(404, "Pet not found")

    appts = await db.execute(
        select(PetAppointment)
        .where(PetAppointment.pet_id == pet_id, PetAppointment.vet_name.isnot(None))
        .order_by(PetAppointment.date.desc())
    )
    seen = set()
    vets = []
    for a in appts.scalars().all():
        key = (a.vet_name, a.clinic_name)
        if key not in seen:
            seen.add(key)
            vets.append({"vet_name": a.vet_name, "clinic_name": a.clinic_name})
    return vets
