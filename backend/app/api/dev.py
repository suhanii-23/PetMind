"""
Seed endpoint — demo/hackathon use only.
Creates 3 richly detailed pets for the currently logged-in user.
"""
import asyncio
import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user
from app.models.user import User
from app.models.pet import Pet, PetDocument, PetAppointment
from app.services import cognee_memory

router = APIRouter(prefix="/dev", tags=["dev"])

SEED_PETS = [
    {
        "name": "Bella",
        "species": "Dog",
        "breed": "Labrador Retriever",
        "dob": "2021-03-15",
        "dob_type": "birthday",
        "gender": "Female",
        "neutered": "Yes",
        "weight_value": 26.5,
        "weight_unit": "kg",
        "vaccinated": "Yes",
        "allergies": json.dumps(["Chicken", "Dust mites", "Pollen"]),
        "medications": json.dumps([
            {"name": "Omega-3 Fish Oil", "reason": "Coat health & joint support", "dosage": "1000mg capsule with morning meal"},
            {"name": "Cetirizine (Zyrtec)", "reason": "Seasonal pollen & dust mite allergies", "dosage": "10mg once daily"},
            {"name": "Carprofen (Rimadyl)", "reason": "Post-ACL surgery pain management", "dosage": "50mg twice daily with food"},
        ]),
        "surgeries": json.dumps([
            {"name": "ACL Repair (TPLO — Tibial Plateau Leveling Osteotomy)", "date": "February 2024"},
            {"name": "Spay (Ovariohysterectomy)", "date": "June 2022"},
        ]),
        "conditions": json.dumps([
            "Hip Dysplasia (mild, left hip — diagnosed Jan 2024)",
            "Environmental Allergies (pollen, dust mites)",
        ]),
        "free_memory": (
            # Vaccinations
            "VACCINATION RECORD: "
            "Rabies — last given 10 March 2024, next due March 2027. "
            "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) — last given 10 March 2024, next due March 2025. "
            "Bordetella (Kennel Cough) — last given 15 Jan 2024, next due Jan 2025. "
            "Leptospirosis — last given 10 March 2024, next due March 2025. "
            "All vaccines administered by Dr. Priya Sharma at PawsCare Clinic, Mumbai. "

            # Vet visits
            "VET VISITS: "
            "15 Jan 2024 — Annual wellness check at PawsCare Clinic. Dr. Sharma noted mild hip dysplasia on X-ray. Weight 26.5 kg, heart and lungs clear, teeth healthy. "
            "05 Feb 2024 — TPLO surgery consultation at Mumbai Veterinary Hospital. Surgery confirmed for 14 Feb 2024. "
            "14 Feb 2024 — TPLO surgery performed on left knee by Dr. Arun Mehta. Surgery successful, 6-week recovery protocol initiated. "
            "28 Mar 2024 — Post-surgery follow-up. X-ray shows bone healing well. Cleared for short leash walks. "
            "10 June 2024 — Full recovery confirmed. Cleared for normal activity. "
            "Next annual check-up due: March 2025. "

            # Diet
            "DIET & FEEDING: "
            "Bella eats Royal Canin Labrador Adult dry kibble — 280g in the morning at 7am and 280g in the evening at 6pm. "
            "She must NEVER be fed chicken or any chicken-based products (causes severe itching and hives). "
            "Favourite treats: peanut butter, blueberries, carrots. "
            "She gets a dental chew every night before bed. "
            "Drinks about 800ml of water daily — always keep bowl fresh. "
            "She tends to eat very fast — use a slow-feeder bowl to prevent bloat. "

            # Behaviour
            "BEHAVIOUR & PERSONALITY: "
            "Bella is extremely affectionate and gets separation anxiety if left alone more than 4 hours. "
            "Gets scared during thunderstorms — needs to be held or placed in her crate with a thundershirt. "
            "Loves playing fetch with tennis balls — this is her favourite activity. "
            "Best friends with the neighbour's cat Whiskers — they play together every evening. "
            "Hates baths but loves swimming in the lake near the park. "
            "Very food-motivated — responds well to treat-based training. "
            "Currently knows: sit, stay, shake, roll over, fetch, leave it. "
            "Energy level: very high — needs at least 60 min of exercise daily. "
            "Gets anxious at the vet — bring her favourite toy (yellow tennis ball) to calm her. "

            # Grooming
            "GROOMING: "
            "Brushed 3x per week to manage shedding. "
            "Bathed once a month using hypoallergenic oatmeal shampoo (no fragrance due to allergies). "
            "Nails trimmed every 6 weeks at PawsCare Clinic. "
            "Ears cleaned weekly — prone to ear infections if not maintained. "

            # Emergency info
            "EMERGENCY: "
            "Emergency contact: Dr. Priya Sharma, PawsCare Clinic, +91-98200-11234. "
            "Blood type: DEA 1.1 positive. "
            "Microchip ID: 956000012345678. "
            "Pet insurance: Trupanion India, policy #TI-20241234. "
        ),
        "photo_url": None,
    },
    {
        "name": "Oliver",
        "species": "Cat",
        "breed": "Persian",
        "dob": "2017-08-20",
        "dob_type": "birthday",
        "gender": "Male",
        "neutered": "Yes",
        "weight_value": 5.2,
        "weight_unit": "kg",
        "vaccinated": "Yes",
        "allergies": json.dumps(["Certain plastic food bowls (causes chin acne)"]),
        "medications": json.dumps([
            {"name": "Furosemide (Lasix)", "reason": "Hypertrophic Cardiomyopathy — reduces fluid accumulation", "dosage": "5mg twice daily, mixed into wet food"},
            {"name": "Enalapril", "reason": "Hypertrophic Cardiomyopathy — reduces cardiac workload", "dosage": "2.5mg once daily at night"},
            {"name": "Clopidogrel (Plavix)", "reason": "Prevents blood clots — HCM complication risk", "dosage": "18.75mg once daily"},
            {"name": "Atenolol", "reason": "Controls heart rate — HCM management", "dosage": "6.25mg once daily morning"},
        ]),
        "surgeries": json.dumps([
            {"name": "Neuter (Orchidectomy)", "date": "October 2018"},
            {"name": "Dental Cleaning under general anaesthesia", "date": "March 2022"},
        ]),
        "conditions": json.dumps([
            "Hypertrophic Cardiomyopathy — HCM (diagnosed September 2022)",
            "Chronic Kidney Disease — Stage 1 (early, monitoring only, diagnosed Jan 2024)",
        ]),
        "free_memory": (
            # Vaccinations
            "VACCINATION RECORD: "
            "Rabies — last given 5 Aug 2023, next due August 2026 (3-year vaccine). "
            "FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) — last given 5 Aug 2023, next due August 2024. "
            "FeLV (Feline Leukaemia) — last given 5 Aug 2023, next due August 2024. "
            "All vaccines given by Dr. Neha Kapoor at WhiskersCare Clinic, Bengaluru. "

            # Vet & cardiology
            "VET & CARDIOLOGY VISITS: "
            "Sep 2022 — HCM diagnosed via echocardiogram at Bengaluru Animal Hospital. Cardiologist: Dr. Vikram Rao. "
            "Feb 2023 — Echo follow-up: left ventricular wall thickening stable. Medications adjusted. "
            "Aug 2023 — Annual wellness. Weight 5.2kg, kidneys borderline (creatinine mildly elevated). "
            "Jan 2024 — Kidney function recheck: CKD Stage 1 confirmed. Diet change initiated. "
            "Mar 2024 — Cardiac echo: condition stable, no progression. Next echo due September 2024. "
            "IMPORTANT: Oliver must have a cardiac echo every 6 months. Next one due: September 2024. "
            "Cardiologist contact: Dr. Vikram Rao, Bengaluru Animal Hospital, +91-80-4567-8901. "

            # Diet
            "DIET & FEEDING: "
            "Oliver eats Hill's Prescription Diet k/d (kidney support) wet food — 60g pouch twice daily (8am and 7pm). "
            "He absolutely refuses dry kibble of any kind — wet food only. "
            "Fresh water available at all times — uses a pet fountain (encourages hydration for kidneys). "
            "Use ceramic or stainless steel bowls ONLY — plastic causes chin acne. "
            "Low-phosphorus, low-protein diet is essential for his kidneys. "
            "Treats: small pieces of cooked salmon (no salt) only — maximum 2x per week. "

            # Behaviour
            "BEHAVIOUR & PERSONALITY: "
            "Oliver is extremely gentle, calm, and quiet. Perfect with children and strangers. "
            "Sleeps 20+ hours a day — this is normal for him. "
            "Favourite spot: sunny windowsill in the study room from 8am-11am. "
            "Grooms himself obsessively after every meal — this is normal behaviour. "
            "Does not like being picked up but enjoys sitting beside people. "
            "Signs of cardiac distress to watch for: open-mouth breathing, blue gums, sudden hind leg paralysis (aortic thromboembolism — EMERGENCY). "
            "Exercise: only light play — no high-intensity play due to heart condition. "
            "Stress is dangerous for HCM — keep his environment calm and routine. "

            # Grooming
            "GROOMING: "
            "Daily brushing required to prevent Persian coat matting. "
            "Professional grooming every 6 weeks — a lion cut in summer. "
            "Eye discharge (typical for Persians) cleaned daily with damp cotton ball. "
            "Teeth brushed 3x per week. Last dental cleaning March 2022. "

            # Emergency
            "EMERGENCY: "
            "If Oliver shows difficulty breathing or sudden hind leg paralysis — go to emergency vet IMMEDIATELY (aortic thromboembolism). "
            "Emergency vet: Bengaluru 24hr Animal Emergency, +91-80-9876-5432. "
            "Microchip ID: 985112004567890. "
            "Pet insurance: Bajaj Allianz Pet Shield, policy #BA-CAT-2022-9988. "
        ),
        "photo_url": None,
    },
    {
        "name": "Mango",
        "species": "Bird",
        "breed": "African Grey Parrot",
        "dob": "2022-06-01",
        "dob_type": "birthday",
        "gender": "Male",
        "neutered": "Not sure",
        "weight_value": 0.42,
        "weight_unit": "kg",
        "vaccinated": "No",
        "allergies": json.dumps(["Avocado (toxic)", "Chocolate (toxic)", "Non-stick cookware fumes (PTFE/Teflon — can be fatal)"]),
        "medications": json.dumps([
            {"name": "Vitamin D3 supplement", "reason": "Supports calcium metabolism — essential for indoor parrots", "dosage": "2 drops in water bowl, 3x per week"},
            {"name": "Calcium gluconate", "reason": "Bone strength and feather quality", "dosage": "Pinch added to soft food twice weekly"},
        ]),
        "surgeries": json.dumps([]),
        "conditions": json.dumps([
            "Feather plucking — mild (stress-related, started Jan 2024, under monitoring)",
        ]),
        "free_memory": (
            # Vaccinations
            "VACCINATION RECORD: "
            "Birds do not receive standard vaccinations in India. "
            "Annual avian vet wellness check is performed instead. "
            "Last wellness check: February 2024 at Mumbai Avian & Exotic Animal Clinic with Dr. Sunita Patel. "
            "All bloodwork normal. Psittacosis (Chlamydiosis) test: negative. "
            "Next wellness check due: February 2025. "

            # Vet visits
            "VET VISITS: "
            "Dec 2022 — Initial health check post-purchase. All clear. Weight 380g (underweight). Diet improved. "
            "Aug 2023 — Wellness check. Weight 420g, healthy. Beak and nails trimmed. "
            "Jan 2024 — Feather plucking noticed on chest. Dr. Patel advised environmental enrichment and stress reduction. "
            "Feb 2024 — Follow-up. Plucking reduced. Vitamin D3 supplement prescribed. "
            "Avian vet: Dr. Sunita Patel, Mumbai Avian & Exotic Clinic, +91-98334-56789. "

            # Diet
            "DIET & FEEDING: "
            "Morning (7am): Roudybush pellets (40% of diet) — 30g. "
            "Afternoon (1pm): Fresh vegetables and fruits — chopped bell peppers, leafy greens, broccoli, mango (his namesake favourite), pomegranate seeds, papaya. "
            "Evening (6pm): Small mixed seed blend (10% of diet) as a treat/enrichment. "
            "Fresh water changed twice daily. "
            "NEVER feed: avocado (toxic), chocolate, onions, garlic, caffeine, alcohol, apple seeds. "
            "NEVER cook with non-stick (Teflon) pans in the same room — fumes are fatal to birds. "
            "Favourite treat: fresh mango slices and sunflower seeds. "
            "Sunflower seeds only as treats — too high in fat for daily feeding. "

            # Behaviour
            "BEHAVIOUR & PERSONALITY: "
            "Mango knows approximately 40 words and phrases. "
            "Favourite phrases: 'Pretty bird!', 'Hello Mango!', 'Want a treat?', and perfectly mimics the microwave beep. "
            "Gets extremely loud between 6am-7am every morning — this is normal flock calling behaviour. "
            "Terrified of cucumbers — never leave near his cage (unknown reason, common in parrots). "
            "Enjoys watching TV — especially nature documentaries and wildlife shows. "
            "Highly intelligent — needs at least 3-4 hours of out-of-cage time and mental stimulation daily. "
            "Toys: foraging toys, puzzle feeders, wooden chews. Replace toys monthly to prevent boredom. "
            "Bonded primarily to owner (Suhani) — may bite strangers initially. "
            "Lifespan: African Greys live 50-70 years — long-term commitment required. "
            "Warning signs of illness: fluffed feathers all day, nasal discharge, loss of voice, not eating. "

            # Environment
            "ENVIRONMENT: "
            "Cage size: minimum 90cm x 90cm x 120cm — currently has a Prevue Hendryx F070 travel cage + large play gym. "
            "Temperature: keep between 20-30°C. Avoid draughts and direct AC. "
            "Sleep: needs 10-12 hours of darkness per night (use cage cover). "
            "Humidity: 50-70% — a humidifier helps prevent feather plucking. "

            # Emergency
            "EMERGENCY: "
            "Birds hide illness — by the time symptoms show, it may be serious. Act quickly. "
            "Emergency avian vet: 24hr Mumbai Pet Emergency, +91-22-6789-0123. "
            "Ring number: PH-2024-BRD-7654. "
        ),
        "photo_url": None,
    },
]


SEED_DOCS = {
    "Bella": [
        ("Vaccination Certificate 2024.pdf", "vaccination"),
        ("TPLO Surgery Report Feb 2024.pdf", "surgery"),
        ("Post-Surgery X-Ray Mar 2024.pdf", "medical"),
        ("Blood Work Panel Jan 2024.pdf", "medical"),
        ("Pet Insurance Policy Trupanion.pdf", "medical"),
    ],
    "Oliver": [
        ("Echocardiogram Report Mar 2024.pdf", "medical"),
        ("HCM Diagnosis Report Sep 2022.pdf", "medical"),
        ("Kidney Function Test Jan 2024.pdf", "medical"),
        ("Vaccination Record Aug 2023.pdf", "vaccination"),
        ("Dental Cleaning Report Mar 2022.pdf", "surgery"),
    ],
    "Mango": [
        ("Annual Wellness Check Feb 2024.pdf", "medical"),
        ("Psittacosis Test Result 2024.pdf", "medical"),
        ("Feather Plucking Assessment Jan 2024.pdf", "medical"),
    ],
}

SEED_APPOINTMENTS = {
    "Bella": [
        {"vet_name": "Dr. Priya Sharma", "clinic_name": "PawsCare Clinic", "date": "2024-01-15", "reason": "Annual wellness check"},
        {"vet_name": "Dr. Arun Mehta", "clinic_name": "Mumbai Veterinary Hospital", "date": "2024-02-14", "reason": "TPLO surgery"},
        {"vet_name": "Dr. Priya Sharma", "clinic_name": "PawsCare Clinic", "date": "2024-03-28", "reason": "Post-surgery follow-up"},
        {"vet_name": "Dr. Priya Sharma", "clinic_name": "PawsCare Clinic", "date": "2024-06-10", "reason": "Full recovery check"},
    ],
    "Oliver": [
        {"vet_name": "Dr. Vikram Rao", "clinic_name": "Bengaluru Animal Hospital", "date": "2024-03-15", "reason": "Cardiac echo — HCM monitoring"},
        {"vet_name": "Dr. Neha Kapoor", "clinic_name": "WhiskersCare Clinic", "date": "2024-01-20", "reason": "CKD Stage 1 recheck"},
    ],
    "Mango": [
        {"vet_name": "Dr. Sunita Patel", "clinic_name": "Mumbai Avian & Exotic Clinic", "date": "2024-02-10", "reason": "Annual avian wellness check"},
        {"vet_name": "Dr. Sunita Patel", "clinic_name": "Mumbai Avian & Exotic Clinic", "date": "2024-01-18", "reason": "Feather plucking follow-up"},
    ],
}


@router.post("/seed")
async def seed_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Wipe existing pets for the logged-in user so seed is idempotent
    await db.execute(delete(Pet).where(Pet.owner_id == current_user.id))
    await db.flush()

    created_pets = []
    for p in SEED_PETS:
        pet = Pet(owner_id=current_user.id, **p)
        db.add(pet)
        created_pets.append(pet)

    await db.flush()  # get IDs assigned

    # Add seed documents and appointments for each pet
    for pet, seed in zip(created_pets, SEED_PETS):
        for (original_name, doc_type) in SEED_DOCS.get(seed["name"], []):
            doc = PetDocument(
                pet_id=pet.id,
                filename=f"/uploads/documents/seed_{original_name.replace(' ', '_')}",
                original_name=original_name,
                doc_type=doc_type,
            )
            db.add(doc)
        for appt_data in SEED_APPOINTMENTS.get(seed["name"], []):
            appt = PetAppointment(pet_id=pet.id, **appt_data)
            db.add(appt)

    await db.flush()

    # Index each seed pet in Cognee in the background
    async def _index_all(pets_snapshot):
        for pet, seed in pets_snapshot:
            pet_dict = {
                "id": pet.id,
                "name": pet.name,
                "species": pet.species,
                "breed": pet.breed,
                "dob": pet.dob,
                "gender": pet.gender,
                "neutered": pet.neutered,
                "weight_value": pet.weight_value,
                "weight_unit": pet.weight_unit,
                "vaccinated": pet.vaccinated,
                "allergies": json.loads(seed["allergies"]),
                "medications": json.loads(seed["medications"]),
                "surgeries": json.loads(seed["surgeries"]),
                "conditions": json.loads(seed["conditions"]),
                "free_memory": seed.get("free_memory", ""),
            }
            await cognee_memory.store_pet_to_cognee(pet_dict, settings.COGNEE_API_URL)

    await db.commit()

    if settings.COGNEE_API_URL:
        asyncio.create_task(_index_all(list(zip(created_pets, SEED_PETS))))

    return {
        "message": "Seeded 3 pets successfully",
        "pets": [p["name"] for p in SEED_PETS],
    }
