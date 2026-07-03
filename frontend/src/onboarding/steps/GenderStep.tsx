import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function GenderStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>What is {data.name}'s gender?</h2>
      <div className={styles.optionRow}>
        <button className={`${styles.optionBtn} ${data.gender === "Male" ? styles.selected : ""}`} onClick={() => onNext({ gender: "Male" })}>♂ Male</button>
        <button className={`${styles.optionBtn} ${data.gender === "Female" ? styles.selected : ""}`} onClick={() => onNext({ gender: "Female" })}>♀ Female</button>
      </div>
      <button className={styles.skipBtn} onClick={() => onNext({ gender: null })}>Skip</button>
    </>
  );
}
