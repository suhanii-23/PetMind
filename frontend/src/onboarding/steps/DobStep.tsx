import { useState } from "react";
import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

const AGE_OPTIONS = ["Less than 1 year","1 year","2 years","3 years","4 years","5 years","6 years","7 years","8 years","9 years","10+ years"];

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function DobStep({ data, onNext }: Props) {
  const [mode, setMode] = useState<"birthday" | "approximate" | null>(data.dobType as any ?? null);
  const [dob, setDob] = useState(data.dob);
  const [approx, setApprox] = useState(data.approximateAge);

  function submit() {
    if (mode === "birthday") onNext({ dobType: "birthday", dob, approximateAge: "" });
    else onNext({ dobType: "approximate", approximateAge: approx, dob: "" });
  }

  const canContinue = mode === "birthday" ? !!dob : !!approx;

  return (
    <>
      <h2 className={styles.question}>When was {data.name} born?</h2>
      <div className={styles.optionRow} style={{ marginBottom: 20 }}>
        <button className={`${styles.optionBtn} ${mode === "birthday" ? styles.selected : ""}`} onClick={() => setMode("birthday")}>🎂 Known birthday</button>
        <button className={`${styles.optionBtn} ${mode === "approximate" ? styles.selected : ""}`} onClick={() => setMode("approximate")}>📅 Approximate age</button>
      </div>

      {mode === "birthday" && (
        <input type="date" className={styles.dateInput} value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} />
      )}

      {mode === "approximate" && (
        <div className={styles.optionGrid}>
          {AGE_OPTIONS.map(a => (
            <button key={a} className={`${styles.optionBtn} ${approx === a ? styles.selected : ""}`} onClick={() => setApprox(a)}>{a}</button>
          ))}
        </div>
      )}

      {mode && (
        <button className={styles.continueBtn} disabled={!canContinue} onClick={submit}>Continue</button>
      )}
      {!mode && <button className={styles.skipBtn} onClick={() => onNext({ dobType: null, dob: "", approximateAge: "" })}>Skip</button>}
    </>
  );
}
