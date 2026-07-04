import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import anthropic

from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user
from app.models.user import User
from app.models.pet import Pet

router = APIRouter()


class VisitPrepRequest(BaseModel):
    concern: str = ""


def build_pet_context(pet: Pet, allergies: list, medications: list, conditions: list, surgeries: list) -> str:
    med_lines = ", ".join(
        f"{m['name']}: {m.get('reason', '')} | {m.get('dosage', 'unspecified')}"
        for m in medications
    ) if medications else "None"

    return f"""Pet: {pet.name}, {pet.species}, {pet.breed or "unknown breed"}, DOB: {pet.dob or "unknown"}
Allergies: {json.dumps(allergies) if allergies else "None"}
Medications: {med_lines}
Conditions: {json.dumps(conditions) if conditions else "None"}
Surgeries: {json.dumps(surgeries) if surgeries else "None"}
{pet.free_memory or ""}"""


def call_claude(prompt: str) -> list:
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(503, "ANTHROPIC_API_KEY not configured.")
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        system="You are a JSON API. You MUST respond with ONLY a valid JSON array. No markdown, no explanation, no backticks. Start your response with [ and end with ].",
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text.strip()
    # Strip markdown code fences (```json ... ```)
    if raw.startswith("```"):
        lines = raw.split("\n")
        # drop first line (```json) and last line (```) if it closes
        inner = lines[1:] if lines[-1].strip() == "```" else lines[1:]
        if inner and inner[-1].strip() == "```":
            inner = inner[:-1]
        raw = "\n".join(inner).strip()
    try:
        result = json.loads(raw)
        if isinstance(result, list):
            return result
        for v in result.values():
            if isinstance(v, list):
                return v
        return []
    except Exception:
        try:
            start = raw.index("[")
            end = raw.rindex("]") + 1
            return json.loads(raw[start:end])
        except Exception:
            return []


@router.get("/{pet_id}/reminders")
async def get_reminders(
    pet_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(404, "Pet not found")

    allergies = json.loads(pet.allergies) if pet.allergies else []
    medications = json.loads(pet.medications) if pet.medications else []
    conditions = json.loads(pet.conditions) if pet.conditions else []
    surgeries = json.loads(pet.surgeries) if pet.surgeries else []

    context = build_pet_context(pet, allergies, medications, conditions, surgeries)
    prompt = f"""Here is a pet's health record:

{context}

Extract all upcoming care dates from this pet's records. Return a JSON array of objects with: {{id, kind (vaccine_due|follow_up|medication_check), title, details, due_date (YYYY-MM-DD or null), pet_name}}. Focus on: vaccination next-due dates, vet recheck appointments, medication review dates. Return only the JSON array, no markdown."""

    data = call_claude(prompt)
    return data


@router.get("/{pet_id}/insights")
async def get_insights(
    pet_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(404, "Pet not found")

    allergies = json.loads(pet.allergies) if pet.allergies else []
    medications = json.loads(pet.medications) if pet.medications else []
    conditions = json.loads(pet.conditions) if pet.conditions else []
    surgeries = json.loads(pet.surgeries) if pet.surgeries else []

    from datetime import date
    age_years = 0
    if pet.dob:
        try:
            age_years = (date.today() - date.fromisoformat(pet.dob)).days // 365
        except Exception:
            pass

    # Use a shorter focused context (not full free_memory) so haiku doesn't lose track
    context_short = f"""Pet: {pet.name}, {pet.species}, {pet.breed or ''}, Age: {age_years} years
Allergies: {', '.join(allergies) if allergies else 'None'}
Medications: {', '.join(m['name'] for m in medications) if medications else 'None'}
Conditions: {', '.join(conditions) if conditions else 'None'}
Surgeries: {', '.join(s.get('name','') for s in surgeries) if surgeries else 'None'}
Free notes (excerpt): {(pet.free_memory or '')[:600]}"""

    prompt = f"""{context_short}

Generate 3 to 5 proactive health insights for this pet's owner. You MUST return at least 3.
Each insight should be actionable and specific to this pet's actual data.
Return a JSON array of objects. Each object must have exactly these fields:
- id: unique string
- kind: one of recurring_pattern, overdue_vaccine, checkup_gap, life_stage, diet_concern, medication_note
- title: short title (max 10 words)
- body: 1-2 sentence explanation referencing the pet's actual data
- why: 1 sentence explaining why this was flagged
- source: pet_records or general_guideline
- pet_name: the pet's name"""

    data = call_claude(prompt)
    return data


@router.get("/{pet_id}/conflicts")
async def get_conflicts(
    pet_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(404, "Pet not found")

    allergies = json.loads(pet.allergies) if pet.allergies else []
    medications = json.loads(pet.medications) if pet.medications else []
    conditions = json.loads(pet.conditions) if pet.conditions else []
    surgeries = json.loads(pet.surgeries) if pet.surgeries else []

    context = build_pet_context(pet, allergies, medications, conditions, surgeries)
    prompt = f"""Here is a pet's health record:

{context}

Review this pet's medications, conditions, and allergies for potential conflicts or concerns. Return a JSON array of objects with: {{conflict_key, type (medication_interaction|allergy_conflict|medication_condition_concern), severity (high|medium|low), description, suggested_question, medication (name if applicable), involved_nodes: []}}. Only flag real concerns visible in the data. Return only the JSON array, no markdown."""

    data = call_claude(prompt)
    return data


@router.post("/{pet_id}/visit-prep")
async def get_visit_prep(
    pet_id: int,
    body: VisitPrepRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(404, "Pet not found")

    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(503, "ANTHROPIC_API_KEY not configured.")

    allergies = json.loads(pet.allergies) if pet.allergies else []
    medications = json.loads(pet.medications) if pet.medications else []
    conditions = json.loads(pet.conditions) if pet.conditions else []
    surgeries = json.loads(pet.surgeries) if pet.surgeries else []

    from datetime import date
    age_years = 0
    if pet.dob:
        try:
            age_years = (date.today() - date.fromisoformat(pet.dob)).days // 365
        except Exception:
            pass

    concern_line = f"\nOwner's specific concern for this visit: {body.concern}" if body.concern else ""

    prompt = f"""You are a veterinary assistant helping a pet owner prepare for a vet visit.

Pet: {pet.name}, {pet.species}, {pet.breed or "unknown breed"}, Age: {age_years} years, Gender: {pet.gender or "unknown"}, Weight: {pet.weight_value or "unknown"} {pet.weight_unit or ""}
Vaccinated: {pet.vaccinated}
Allergies: {", ".join(allergies) if allergies else "None known"}
Current Medications: {", ".join(m["name"] for m in medications) if medications else "None"}
Health Conditions: {", ".join(conditions) if conditions else "None"}
Past Surgeries: {", ".join(s.get("name","") for s in surgeries) if surgeries else "None"}
Health notes: {(pet.free_memory or "")[:800]}{concern_line}

Generate a concise pre-visit summary the owner can share with the vet. Include:
- Current health status overview
- Active medications and conditions to mention
- Key questions to ask the vet
- Any urgent items that need attention

Format with clear sections. Use bullet points with • for lists."""

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
    )
    summary = response.content[0].text.strip()
    return {"summary": summary}
