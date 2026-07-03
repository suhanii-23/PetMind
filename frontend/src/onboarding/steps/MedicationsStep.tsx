import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function MedicationsStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>Is {data.name} on any regular medications?</h2>
      <div className={styles.optionRow}>
        {(["Yes", "No"] as const).map(opt => (
          <button key={opt} className={`${styles.optionBtn} ${data.hasMedications === opt ? styles.selected : ""}`}
            onClick={() => onNext({ hasMedications: opt })}>
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
