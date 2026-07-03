import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

const SPECIES = [
  { label: "Dog", emoji: "🐶" },
  { label: "Cat", emoji: "🐱" },
  { label: "Rabbit", emoji: "🐰" },
  { label: "Bird", emoji: "🐦" },
  { label: "Hamster", emoji: "🐹" },
  { label: "Turtle", emoji: "🐢" },
  { label: "Fish", emoji: "🐠" },
  { label: "Reptile", emoji: "🐍" },
  { label: "Other", emoji: "🐾" },
];

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function SpeciesStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>What kind of pet is {data.name}?</h2>
      <p className={styles.subtext}>Choose one</p>
      <div className={styles.speciesGrid}>
        {SPECIES.map(s => (
          <button
            key={s.label}
            className={`${styles.speciesBtn} ${data.species === s.label ? styles.selected : ""}`}
            onClick={() => onNext({ species: s.label, breed: "" })}
          >
            <span className={styles.speciesEmoji}>{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>
    </>
  );
}
