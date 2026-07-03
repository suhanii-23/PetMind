import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function SurgeriesStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>Has {data.name} had any surgeries?</h2>
      <div className={styles.optionRow}>
        {(["Yes", "No"] as const).map(opt => (
          <button key={opt} className={`${styles.optionBtn} ${data.hasSurgeries === opt ? styles.selected : ""}`}
            onClick={() => onNext({ hasSurgeries: opt })}>
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
