import { useState } from "react";
import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function NameStep({ data, onNext }: Props) {
  const [name, setName] = useState(data.name);

  return (
    <>
      <h2 className={styles.question}>What is your pet's name?</h2>
      <p className={styles.subtext}>We'll use this throughout the app</p>
      <input
        className={styles.textInput}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="e.g. Bella"
        autoFocus
        onKeyDown={e => e.key === "Enter" && name.trim() && onNext({ name: name.trim() })}
      />
      <button className={styles.continueBtn} disabled={!name.trim()} onClick={() => onNext({ name: name.trim() })}>
        Continue
      </button>
    </>
  );
}
