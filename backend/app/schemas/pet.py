from typing import Optional, List
from pydantic import BaseModel


class MedicationIn(BaseModel):
    name: str
    reason: str = ""
    dosage: str = ""


class SurgeryIn(BaseModel):
    name: str
    date: str = ""


class WeightIn(BaseModel):
    value: Optional[float] = None
    unit: str = "kg"


class OnboardingPayload(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    dob: Optional[str] = None
    dob_type: Optional[str] = None
    gender: Optional[str] = None
    neutered: Optional[str] = None
    weight: Optional[WeightIn] = None
    vaccinated: Optional[str] = None
    allergies: List[str] = []
    medications: List[MedicationIn] = []
    surgeries: List[SurgeryIn] = []
    conditions: List[str] = []
    free_memory: Optional[str] = None


class DocumentOut(BaseModel):
    id: int
    original_name: str
    doc_type: str
    filename: str

    model_config = {"from_attributes": True}


class PetOut(BaseModel):
    id: int
    name: str
    species: str
    breed: Optional[str]
    dob: Optional[str]
    dob_type: Optional[str]
    gender: Optional[str]
    neutered: Optional[str]
    weight_value: Optional[float]
    weight_unit: Optional[str]
    vaccinated: Optional[str]
    allergies: List[str] = []
    medications: List[dict] = []
    surgeries: List[dict] = []
    conditions: List[str] = []
    free_memory: Optional[str]
    photo_url: Optional[str]
    documents: List[DocumentOut] = []

    model_config = {"from_attributes": True}
