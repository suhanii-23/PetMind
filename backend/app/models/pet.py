import json
from typing import Optional
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from app.core.database import Base


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    species: Mapped[str] = mapped_column(String(100), nullable=False)
    breed: Mapped[Optional[str]] = mapped_column(String(255))
    dob: Mapped[Optional[str]] = mapped_column(String(30))
    dob_type: Mapped[Optional[str]] = mapped_column(String(20))  # 'birthday' | 'approximate'
    gender: Mapped[Optional[str]] = mapped_column(String(10))
    neutered: Mapped[Optional[str]] = mapped_column(String(20))
    weight_value: Mapped[Optional[float]] = mapped_column(Float)
    weight_unit: Mapped[Optional[str]] = mapped_column(String(5), default="kg")
    vaccinated: Mapped[Optional[str]] = mapped_column(String(20))
    # JSON arrays stored as text
    allergies: Mapped[str] = mapped_column(Text, default="[]")
    medications: Mapped[str] = mapped_column(Text, default="[]")
    surgeries: Mapped[str] = mapped_column(Text, default="[]")
    conditions: Mapped[str] = mapped_column(Text, default="[]")
    free_memory: Mapped[Optional[str]] = mapped_column(Text)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def allergies_list(self):
        return json.loads(self.allergies or "[]")

    def medications_list(self):
        return json.loads(self.medications or "[]")

    def surgeries_list(self):
        return json.loads(self.surgeries or "[]")

    def conditions_list(self):
        return json.loads(self.conditions or "[]")


class PetDocument(Base):
    __tablename__ = "pet_documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(500))
    original_name: Mapped[str] = mapped_column(String(500))
    doc_type: Mapped[str] = mapped_column(String(50))  # vaccination | surgery | medical | memory
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class PetAppointment(Base):
    __tablename__ = "pet_appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id"), nullable=False)
    vet_name: Mapped[Optional[str]] = mapped_column(String(255))
    clinic_name: Mapped[Optional[str]] = mapped_column(String(255))
    date: Mapped[str] = mapped_column(String(30))
    reason: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
