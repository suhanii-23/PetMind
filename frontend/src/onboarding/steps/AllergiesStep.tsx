import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function AllergiesStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>Does {data.name} have any known allergies?</h2>
      <div className={styles.optionGrid}>
        {(["Yes", "No", "Not sure"] as const).map(opt => (
          <button key={opt} className={`${styles.optionBtn} ${data.hasAllergies === opt ? styles.selected : ""}`}
            onClick={() => onNext({ hasAllergies: opt })}>
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
