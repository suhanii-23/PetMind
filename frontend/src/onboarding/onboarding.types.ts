export interface Medication {
  name: string;
  reason: string;
  dosage: string;
}

export interface Surgery {
  name: string;
  date: string;
}

export interface OnboardingData {
  // Photo
  photo: File | null;
  photoPreview: string | null;

  // Identity
  name: string;
  species: string;
  breed: string;

  // Bio
  dobType: "birthday" | "approximate" | null;
  dob: string;           // ISO date if birthday
  approximateAge: string; // e.g. "3 years" if approximate
  gender: "Male" | "Female" | null;
  neutered: "Yes" | "No" | "Not sure" | null;

  // Physical
  weightValue: string;
  weightUnit: "kg" | "lbs";

  // Medical
  vaccinated: "Yes" | "No" | "Not sure" | null;
  vaccinationDocs: File[];

  hasAllergies: "Yes" | "No" | "Not sure" | null;
  allergyList: string[];

  hasMedications: "Yes" | "No" | null;
  medicationList: Medication[];

  hasSurgeries: "Yes" | "No" | null;
  surgeryList: Surgery[];
  surgeryDocs: File[];

  hasConditions: "Yes" | "No" | null;
  conditionList: string[];
  conditionDocs: File[];

  medicalRecords: File[];

  // Free memory
  freeMemoryText: string;
  freeMemoryFiles: File[];
}

export const initialData: OnboardingData = {
  photo: null,
  photoPreview: null,
  name: "",
  species: "",
  breed: "",
  dobType: null,
  dob: "",
  approximateAge: "",
  gender: null,
  neutered: null,
  weightValue: "",
  weightUnit: "kg",
  vaccinated: null,
  vaccinationDocs: [],
  hasAllergies: null,
  allergyList: [],
  hasMedications: null,
  medicationList: [],
  hasSurgeries: null,
  surgeryList: [],
  surgeryDocs: [],
  hasConditions: null,
  conditionList: [],
  conditionDocs: [],
  medicalRecords: [],
  freeMemoryText: "",
  freeMemoryFiles: [],
};
