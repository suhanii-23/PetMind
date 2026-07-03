import { useState } from "react";
import type { OnboardingData } from "../onboarding.types";
import FileUpload from "../components/FileUpload";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function ConditionDetailsStep({ data, onNext }: Props) {
  const [input, setInput] = useState("");
  const [list, setList] = useState<string[]>(data.conditionList);
  const [docs, setDocs] = useState<File[]>(data.conditionDocs);

  function add() {
    const v = input.trim();
    if (!v || list.includes(v)) return;
    setList(l => [...l, v]);
    setInput("");
  }

  return (
    <>
      <h2 className={styles.question}>What conditions does {data.name} have?</h2>
      <p className={styles.subtext}>Add each condition — press Enter or tap Add</p>
      {list.length > 0 && (
        <div className={styles.chipArea}>
          {list.map(c => (
            <div key={c} className={styles.chip}>
              {c}<button className={styles.chipX} onClick={() => setList(l => l.filter(x => x !== c))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.chipInputRow}>
        <input className={styles.chipInput} value={input} onChange={e => setInput(e.target.value)}
          placeholder="e.g. Hip Dysplasia" onKeyDown={e => e.key === "Enter" && add()} autoFocus />
        <button className={styles.addBtn} onClick={add}>Add</button>
      </div>
      <FileUpload files={docs} onChange={setDocs} label="Upload related medical documents" />
      <button className={styles.continueBtn} disabled={list.length === 0}
        onClick={() => onNext({ conditionList: list, conditionDocs: docs })}>Continue</button>
    </>
  );
}
