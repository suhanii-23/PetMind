import { useState, useMemo } from "react";
import type { OnboardingData } from "./onboarding.types";
import { initialData } from "./onboarding.types";
import StepWrapper from "./components/StepWrapper";
import WelcomeStep from "./steps/WelcomeStep";
import PhotoStep from "./steps/PhotoStep";
import NameStep from "./steps/NameStep";
import SpeciesStep from "./steps/SpeciesStep";
import BreedStep from "./steps/BreedStep";
import DobStep from "./steps/DobStep";
import GenderStep from "./steps/GenderStep";
import NeuteredStep from "./steps/NeuteredStep";
import WeightStep from "./steps/WeightStep";
import VaccinationStep from "./steps/VaccinationStep";
import VaccinationDocsStep from "./steps/VaccinationDocsStep";
import AllergiesStep from "./steps/AllergiesStep";
import AllergyDetailsStep from "./steps/AllergyDetailsStep";
import MedicationsStep from "./steps/MedicationsStep";
import MedicationDetailsStep from "./steps/MedicationDetailsStep";
import SurgeriesStep from "./steps/SurgeriesStep";
import SurgeryDetailsStep from "./steps/SurgeryDetailsStep";
import ConditionsStep from "./steps/ConditionsStep";
import ConditionDetailsStep from "./steps/ConditionDetailsStep";
import MedicalRecordsStep from "./steps/MedicalRecordsStep";
import FreeMemoryStep from "./steps/FreeMemoryStep";
import SummaryStep from "./steps/SummaryStep";

interface StepDef {
  id: string;
  shouldShow: (d: OnboardingData) => boolean;
}

const STEP_DEFS: StepDef[] = [
  { id: "welcome",            shouldShow: () => true },
  { id: "photo",              shouldShow: () => true },
  { id: "name",               shouldShow: () => true },
  { id: "species",            shouldShow: () => true },
  { id: "breed",              shouldShow: d => ["Dog", "Cat", "Rabbit"].includes(d.species) },
  { id: "dob",                shouldShow: () => true },
  { id: "gender",             shouldShow: () => true },
  { id: "neutered",           shouldShow: () => true },
  { id: "weight",             shouldShow: () => true },
  { id: "vaccination",        shouldShow: () => true },
  { id: "vaccinationDocs",    shouldShow: d => d.vaccinated === "Yes" },
  { id: "allergies",          shouldShow: () => true },
  { id: "allergyDetails",     shouldShow: d => d.hasAllergies === "Yes" },
  { id: "medications",        shouldShow: () => true },
  { id: "medicationDetails",  shouldShow: d => d.hasMedications === "Yes" },
  { id: "surgeries",          shouldShow: () => true },
  { id: "surgeryDetails",     shouldShow: d => d.hasSurgeries === "Yes" },
  { id: "conditions",         shouldShow: () => true },
  { id: "conditionDetails",   shouldShow: d => d.hasConditions === "Yes" },
  { id: "medicalRecords",     shouldShow: () => true },
  { id: "freeMemory",         shouldShow: () => true },
  { id: "summary",            shouldShow: () => true },
];

export default function OnboardingFlow() {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [stepIndex, setStepIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const activeSteps = useMemo(
    () => STEP_DEFS.filter(s => s.shouldShow(data)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.species, data.vaccinated, data.hasAllergies, data.hasMedications, data.hasSurgeries, data.hasConditions]
  );

  const currentStepId = activeSteps[stepIndex]?.id ?? "summary";
  const totalSteps = activeSteps.length - 1;
  const progress = stepIndex === 0 ? 0 : Math.round((stepIndex / totalSteps) * 100);
  const stepLabel = stepIndex === 0 ? "" : `${stepIndex} of ${totalSteps}`;

  function next(update: Partial<OnboardingData> = {}) {
    const merged = { ...data, ...update };
    const nextActive = STEP_DEFS.filter(s => s.shouldShow(merged));
    setData(merged);
    setStepIndex(Math.min(stepIndex + 1, nextActive.length - 1));
    setAnimKey(k => k + 1);
  }

  function back() {
    setAnimKey(k => k + 1);
    setStepIndex(i => Math.max(i - 1, 0));
  }

  function goToStart() {
    setAnimKey(k => k + 1);
    setStepIndex(0);
  }

  const isWelcome = currentStepId === "welcome";
  const isSummary = currentStepId === "summary";

  function renderStep() {
    switch (currentStepId) {
      case "welcome":           return <WelcomeStep onNext={next} />;
      case "photo":             return <PhotoStep data={data} onNext={next} />;
      case "name":              return <NameStep data={data} onNext={next} />;
      case "species":           return <SpeciesStep data={data} onNext={next} />;
      case "breed":             return <BreedStep data={data} onNext={next} />;
      case "dob":               return <DobStep data={data} onNext={next} />;
      case "gender":            return <GenderStep data={data} onNext={next} />;
      case "neutered":          return <NeuteredStep data={data} onNext={next} />;
      case "weight":            return <WeightStep data={data} onNext={next} />;
      case "vaccination":       return <VaccinationStep data={data} onNext={next} />;
      case "vaccinationDocs":   return <VaccinationDocsStep data={data} onNext={next} />;
      case "allergies":         return <AllergiesStep data={data} onNext={next} />;
      case "allergyDetails":    return <AllergyDetailsStep data={data} onNext={next} />;
      case "medications":       return <MedicationsStep data={data} onNext={next} />;
      case "medicationDetails": return <MedicationDetailsStep data={data} onNext={next} />;
      case "surgeries":         return <SurgeriesStep data={data} onNext={next} />;
      case "surgeryDetails":    return <SurgeryDetailsStep data={data} onNext={next} />;
      case "conditions":        return <ConditionsStep data={data} onNext={next} />;
      case "conditionDetails":  return <ConditionDetailsStep data={data} onNext={next} />;
      case "medicalRecords":    return <MedicalRecordsStep data={data} onNext={next} />;
      case "freeMemory":        return <FreeMemoryStep data={data} onNext={next} />;
      case "summary":           return <SummaryStep data={data} onEdit={goToStart} />;
      default:                  return null;
    }
  }

  if (isWelcome) {
    return (
      <StepWrapper showBack={false} progress={0} stepLabel="" animKey={animKey}>
        {renderStep()}
      </StepWrapper>
    );
  }

  return (
    <StepWrapper
      onBack={isSummary ? undefined : back}
      showBack={!isSummary}
      progress={progress}
      stepLabel={stepLabel}
      animKey={animKey}
    >
      {renderStep()}
    </StepWrapper>
  );
}
