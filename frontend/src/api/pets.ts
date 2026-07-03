import api from "./auth";
import type { OnboardingData } from "../onboarding/onboarding.types";

export const petsApi = {
  async onboard(data: OnboardingData) {
    const form = new FormData();

    const payload = {
      name: data.name,
      species: data.species,
      breed: data.breed || null,
      dob: data.dobType === "birthday" ? data.dob : null,
      dob_type: data.dobType,
      gender: data.gender,
      neutered: data.neutered,
      weight: data.weightValue ? { value: parseFloat(data.weightValue), unit: data.weightUnit } : null,
      vaccinated: data.vaccinated,
      allergies: data.hasAllergies === "Yes" ? data.allergyList : [],
      medications: data.hasMedications === "Yes" ? data.medicationList : [],
      surgeries: data.hasSurgeries === "Yes" ? data.surgeryList : [],
      conditions: data.hasConditions === "Yes" ? data.conditionList : [],
      free_memory: data.freeMemoryText || null,
    };

    form.append("data", JSON.stringify(payload));
    if (data.photo) form.append("photo", data.photo);
    [...data.vaccinationDocs, ...data.surgeryDocs, ...data.conditionDocs, ...data.medicalRecords, ...data.freeMemoryFiles]
      .forEach(f => form.append("docs", f));

    const res = await api.post("/pets/onboard", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  list: () => api.get<any[]>("/pets/").then(r => r.data),

  get: (id: number) => api.get(`/pets/${id}`).then(r => r.data),

  chat: (id: number, message: string) =>
    api.post<{ message: string; category: string }>(`/pets/${id}/chat`, { message }).then(r => r.data),
};
