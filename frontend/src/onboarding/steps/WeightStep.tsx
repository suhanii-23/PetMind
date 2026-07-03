import { useState } from "react";
import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function WeightStep({ data, onNext }: Props) {
  const [value, setValue] = useState(data.weightValue);
  const [unit, setUnit] = useState<"kg" | "lbs">(data.weightUnit);

  return (
    <>
      <h2 className={styles.question}>How much does {data.name} weigh?</h2>
      <p className={styles.subtext}>Approximate is fine</p>
      <div className={styles.weightRow}>
        <input
          className={styles.weightInput}
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="0.0"
          autoFocus
        />
        <div className={styles.unitToggle}>
          <button className={`${styles.unitBtn} ${unit === "kg" ? styles.active : ""}`} onClick={() => setUnit("kg")}>kg</button>
          <button className={`${styles.unitBtn} ${unit === "lbs" ? styles.active : ""}`} onClick={() => setUnit("lbs")}>lbs</button>
        </div>
      </div>
      <button className={styles.continueBtn} disabled={!value} onClick={() => onNext({ weightValue: value, weightUnit: unit })}>Continue</button>
      <button className={styles.skipBtn} onClick={() => onNext({ weightValue: "", weightUnit: unit })}>Skip</button>
    </>
  );
}
