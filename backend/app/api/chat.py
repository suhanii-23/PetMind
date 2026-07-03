import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import anthropic

from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user
from app.models.user import User
from app.models.pet import Pet

router = APIRouter()

CATEGORY_KEYWORDS = {
    "medications":  ["medication", "medicine", "drug", "pill", "treatment", "dose", "supplement", "taking", "prescribed"],
    "conditions":   ["condition", "illness", "disease", "sick", "diagnos", "chronic", "disorder", "hcm", "dysplasia", "kidney", "heart"],
    "vaccinations": ["vaccin", "shot", "immuniz", "booster", "rabies", "dhpp", "fvrcp", "felv", "bordetella"],
    "allergies":    ["allerg", "reaction", "sensitiv", "intoleran", "toxic", "can't eat", "cannot eat"],
    "diet":         ["food", "eat", "fed", "diet", "feeding", "meal", "nutrition", "kibble", "treat", "drink", "water", "hungry", "appetite", "portion"],
    "behavior":     ["behav", "temperament", "personality", "mood", "play", "scared", "fear", "anxi", "calm", "energy", "habit", "routine", "word", "phrase", "talk"],
    "vetVisits":    ["vet", "doctor", "visit", "appointment", "clinic", "checkup", "exam", "echo", "bloodwork", "next due", "schedule"],
    "documents":    ["document", "record", "file", "report", "paper", "certificate"],
}


def detect_category(message: str) -> str:
    msg = message.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in msg for kw in keywords):
            return category
    return "general"


def build_system_prompt(pet: Pet, allergies: list, medications: list, conditions: list, surgeries: list) -> str:
    from datetime import date
    age_str = ""
    if pet.dob:
        born = date.fromisoformat(pet.dob)
        years = (date.today() - born).days // 365
        age_str = f"{years} years old"

    return f"""You are a knowledgeable, warm, and concise pet memory assistant for {pet.name}.
Your job is to answer questions about {pet.name} accurately using the health profile below.

RULES:
- Answer directly and specifically — never be vague
- If the user asks what to do in a worrying situation (not eating, limping, etc.), give practical advice based on {pet.name}'s profile
- Format with **bold** for important info, bullet points where helpful
- Keep responses under 120 words unless listing many items
- Never say "I don't have that information" if it's in the profile — look carefully
- If genuinely not in the profile, say so briefly and suggest adding it via '+ Add Memory'
- Always reference {pet.name} by name, not "the pet"
- Today's date is {date.today().isoformat()}

--- {pet.name.upper()}'S COMPLETE HEALTH PROFILE ---

Species: {pet.species}
Breed: {pet.breed or "Unknown"}
Age: {age_str or pet.approximate_age or "Unknown"}
DOB: {pet.dob or "Not set"}
Gender: {pet.gender or "Unknown"}
Neutered/Spayed: {pet.neutered or "Unknown"}
Weight: {f"{pet.weight_value} {pet.weight_unit}" if pet.weight_value else "Not recorded"}
Vaccinated: {pet.vaccinated or "Unknown"}

ALLERGIES: {json.dumps(allergies) if allergies else "None recorded"}

MEDICATIONS:
{chr(10).join(f"- {m['name']}: {m.get('reason','')} | Dosage: {m.get('dosage','unspecified')}" for m in medications) if medications else "None"}

HEALTH CONDITIONS:
{chr(10).join(f"- {c}" for c in conditions) if conditions else "None recorded"}

SURGERY HISTORY:
{chr(10).join(f"- {s['name']} ({s.get('date','date unknown')})" for s in surgeries) if surgeries else "None"}

DETAILED MEMORY (vaccinations, vet visits, diet, behaviour, grooming, emergency contacts):
{pet.free_memory or "Not yet recorded."}
---"""


class ChatRequest(BaseModel):
    message: str


@router.post("/{pet_id}/chat")
async def chat_with_pet(
    pet_id: int,
    body: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id, Pet.owner_id == user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(404, "Pet not found")

    allergies  = json.loads(pet.allergies)  if pet.allergies  else []
    medications = json.loads(pet.medications) if pet.medications else []
    conditions  = json.loads(pet.conditions)  if pet.conditions  else []
    surgeries   = json.loads(pet.surgeries)   if pet.surgeries   else []

    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(503, "ANTHROPIC_API_KEY not configured. Add it to your .env file.")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    system = build_system_prompt(pet, allergies, medications, conditions, surgeries)

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=400,
        system=system,
        messages=[{"role": "user", "content": body.message}],
    )

    reply = response.content[0].text.strip()
    category = detect_category(body.message)

    return {"message": reply, "category": category}
