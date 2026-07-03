import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function VaccinationStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>Has {data.name} been vaccinated?</h2>
      <div className={styles.optionGrid}>
        {(["Yes", "No", "Not sure"] as const).map(opt => (
          <button key={opt} className={`${styles.optionBtn} ${data.vaccinated === opt ? styles.selected : ""}`}
            onClick={() => onNext({ vaccinated: opt })}>
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
