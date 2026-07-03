import { useState } from "react";
import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function AllergyDetailsStep({ data, onNext }: Props) {
  const [input, setInput] = useState("");
  const [list, setList] = useState<string[]>(data.allergyList);

  function add() {
    const v = input.trim();
    if (!v || list.includes(v)) return;
    setList(l => [...l, v]);
    setInput("");
  }

  return (
    <>
      <h2 className={styles.question}>What is {data.name} allergic to?</h2>
      <p className={styles.subtext}>Add each allergy — press Enter or tap Add</p>
      {list.length > 0 && (
        <div className={styles.chipArea}>
          {list.map(a => (
            <div key={a} className={styles.chip}>
              {a}<button className={styles.chipX} onClick={() => setList(l => l.filter(x => x !== a))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.chipInputRow}>
        <input className={styles.chipInput} value={input} onChange={e => setInput(e.target.value)}
          placeholder="e.g. Chicken, Dust mites" onKeyDown={e => e.key === "Enter" && add()} autoFocus />
        <button className={styles.addBtn} onClick={add}>Add</button>
      </div>
      <button className={styles.continueBtn} disabled={list.length === 0}
        onClick={() => onNext({ allergyList: list })}>Continue</button>
    </>
  );
}
