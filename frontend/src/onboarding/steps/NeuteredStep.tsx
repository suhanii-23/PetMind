import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function NeuteredStep({ data, onNext }: Props) {
  const label = data.gender === "Female" ? "spayed" : "neutered";
  return (
    <>
      <h2 className={styles.question}>Is {data.name} {label}?</h2>
      <div className={styles.optionGrid}>
        {(["Yes", "No", "Not sure"] as const).map(opt => (
          <button key={opt} className={`${styles.optionBtn} ${data.neutered === opt ? styles.selected : ""}`} onClick={() => onNext({ neutered: opt })}>{opt}</button>
        ))}
      </div>
    </>
  );
}
