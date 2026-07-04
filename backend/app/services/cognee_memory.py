"""
Cognee memory layer — calls the Cognee REST API service over HTTP.

The Cognee container runs at COGNEE_API_URL (default: http://cognee:8000).
Auth: FastAPI-Users JWT; we register/login once per process and cache the token.

Flow:
  store_pet_to_cognee(pet)  →  POST /api/v1/add/  +  POST /api/v1/cognify/
  recall_for_chat(pet, q)   →  POST /api/v1/search/
  get_graph_summary(pet_id) →  uses last known node counts (updated after cognify)
"""

import asyncio
import json
from typing import Optional

import httpx

_token: Optional[str] = None
_token_lock = asyncio.Lock()

COGNEE_USER = "petmind@app.com"
COGNEE_PASS = "petmind123!"


async def _get_token(base_url: str) -> Optional[str]:
    """Login to Cognee and return Bearer token. Cached per process."""
    global _token
    if _token:
        return _token

    async with _token_lock:
        if _token:  # double-check inside lock
            return _token
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                # Try login first
                r = await client.post(
                    f"{base_url}/auth/jwt/login",
                    data={"username": COGNEE_USER, "password": COGNEE_PASS},
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
                if r.status_code == 400:
                    # Register then login
                    await client.post(
                        f"{base_url}/auth/register",
                        json={"email": COGNEE_USER, "password": COGNEE_PASS},
                    )
                    r = await client.post(
                        f"{base_url}/auth/jwt/login",
                        data={"username": COGNEE_USER, "password": COGNEE_PASS},
                        headers={"Content-Type": "application/x-www-form-urlencoded"},
                    )
                if r.status_code == 200:
                    _token = r.json().get("access_token")
                    return _token
        except Exception as e:
            print(f"[cognee] auth failed: {e}")
    return None


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _pet_dataset(pet_id: int) -> str:
    return f"petmind_pet_{pet_id}"


def _build_memory_text(pet_data: dict) -> str:
    """Format a pet dict as a rich text document for Cognee to index."""
    lines = [
        f"PET PROFILE: {pet_data.get('name', 'Unknown')}",
        f"Species: {pet_data.get('species', '')}  Breed: {pet_data.get('breed', '')}",
        f"DOB: {pet_data.get('dob', '')}  Gender: {pet_data.get('gender', '')}",
        f"Weight: {pet_data.get('weight_value', '')} {pet_data.get('weight_unit', '')}",
        f"Neutered: {pet_data.get('neutered', '')}  Vaccinated: {pet_data.get('vaccinated', '')}",
        "",
    ]

    allergies = pet_data.get("allergies", [])
    if allergies:
        lines.append("ALLERGIES: " + ", ".join(str(a) for a in allergies))

    medications = pet_data.get("medications", [])
    if medications:
        lines.append("MEDICATIONS:")
        for m in medications:
            lines.append(f"  - {m.get('name')}: {m.get('reason','')} | {m.get('dosage','')}")

    conditions = pet_data.get("conditions", [])
    if conditions:
        lines.append("HEALTH CONDITIONS:")
        for c in conditions:
            lines.append(f"  - {c}")

    surgeries = pet_data.get("surgeries", [])
    if surgeries:
        lines.append("SURGERIES:")
        for s in surgeries:
            lines.append(f"  - {s.get('name')} ({s.get('date', 'unknown date')})")

    free = pet_data.get("free_memory") or ""
    if free:
        lines.append("")
        lines.append(free)

    return "\n".join(lines)


async def store_pet_to_cognee(pet_data: dict, base_url: str) -> bool:
    """Upload pet memory to Cognee and trigger cognify (graph building)."""
    token = await _get_token(base_url)
    if not token:
        print("[cognee] store skipped — no auth token")
        return False

    text = _build_memory_text(pet_data)
    dataset = _pet_dataset(pet_data["id"])

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            headers = _auth_headers(token)

            # Upload the text document
            r = await client.post(
                f"{base_url}/api/v1/add/",
                headers=headers,
                files={"data": (f"pet_{pet_data['id']}.txt", text.encode(), "text/plain")},
                data={"datasetName": dataset},
            )
            if r.status_code not in (200, 201):
                print(f"[cognee] add failed {r.status_code}: {r.text[:200]}")
                return False

            print(f"[cognee] added text for pet {pet_data['id']} (dataset={dataset})")

            # Trigger cognify in background — this is slow, fire and forget
            asyncio.create_task(_cognify(base_url, token, dataset))
            return True

    except Exception as e:
        print(f"[cognee] store_pet_to_cognee error: {e}")
        return False


async def _cognify(base_url: str, token: str, dataset: str) -> None:
    """Run cognify to build the semantic graph. Slow — runs in background."""
    try:
        async with httpx.AsyncClient(timeout=300) as client:
            r = await client.post(
                f"{base_url}/api/v1/cognify/",
                headers={**_auth_headers(token), "Content-Type": "application/json"},
                json={"datasets": [dataset]},
            )
            print(f"[cognee] cognify done for {dataset}: {r.status_code}")
    except Exception as e:
        print(f"[cognee] cognify error for {dataset}: {e}")


async def recall_for_chat(pet_id: int, query: str, base_url: str) -> str:
    """Search Cognee for relevant pet memory. Returns context string for Claude."""
    token = await _get_token(base_url)
    if not token:
        return ""

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                f"{base_url}/api/v1/search/",
                headers={**_auth_headers(token), "Content-Type": "application/json"},
                json={
                    "searchType": "RAG_COMPLETION",
                    "query": query,
                    "topK": 5,
                    "datasets": [_pet_dataset(pet_id)],
                },
            )
            if r.status_code == 200:
                results = r.json()
                if isinstance(results, list) and results:
                    texts = []
                    for item in results[:5]:
                        text = (
                            item.get("payload", {}).get("text")
                            or item.get("text")
                            or str(item)
                        )
                        if text and len(text) > 10:
                            texts.append(text)
                    if texts:
                        return "--- COGNEE MEMORY RECALL ---\n" + "\n\n".join(texts) + "\n---"
    except Exception as e:
        print(f"[cognee] recall error for pet {pet_id}: {e}")

    return ""


async def get_graph_summary(pet_id: int, base_url: str) -> dict:
    """
    Return category node counts for the MemorySphere.
    Falls back gracefully — the sphere still works with zeros.
    """
    counts = {
        "medications": 0, "conditions": 0, "surgeries": 0,
        "allergies": 0, "vaccinations": 0, "vet_visits": 0,
        "diet": 0, "behavior": 0,
    }
    try:
        token = await _get_token(base_url)
        if not token:
            return counts

        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(
                f"{base_url}/api/v1/visualize/",
                headers=_auth_headers(token),
            )
            if r.status_code == 200:
                graph = r.json()
                nodes = graph.get("nodes", [])
                for node in nodes:
                    ntype = (node.get("type") or node.get("node_type") or "").lower()
                    label = (node.get("label") or node.get("name") or "").lower()
                    if "medic" in ntype or "medic" in label:
                        counts["medications"] += 1
                    elif "condition" in ntype or "diagnos" in label or "disease" in label:
                        counts["conditions"] += 1
                    elif "surg" in ntype or "surg" in label:
                        counts["surgeries"] += 1
                    elif "allerg" in ntype or "allerg" in label:
                        counts["allergies"] += 1
                    elif "vaccin" in ntype or "vaccin" in label:
                        counts["vaccinations"] += 1
                    elif "vet" in label or "visit" in label or "clinic" in label:
                        counts["vet_visits"] += 1
                    elif "diet" in label or "food" in label or "feed" in label:
                        counts["diet"] += 1
                    elif "behav" in label or "personalit" in label:
                        counts["behavior"] += 1
    except Exception as e:
        print(f"[cognee] get_graph_summary error: {e}")

    return counts
