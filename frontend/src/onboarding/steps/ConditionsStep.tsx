import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function ConditionsStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>Any major illnesses or ongoing conditions?</h2>
      <div className={styles.optionRow}>
        {(["Yes", "No"] as const).map(opt => (
          <button key={opt} className={`${styles.optionBtn} ${data.hasConditions === opt ? styles.selected : ""}`}
            onClick={() => onNext({ hasConditions: opt })}>
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
