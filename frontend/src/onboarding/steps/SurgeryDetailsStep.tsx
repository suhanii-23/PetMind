import { useState } from "react";
import type { OnboardingData, Surgery } from "../onboarding.types";
import FileUpload from "../components/FileUpload";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

const empty = (): Surgery => ({ name: "", date: "" });

export default function SurgeryDetailsStep({ data, onNext }: Props) {
  const [list, setList] = useState<Surgery[]>(data.surgeryList);
  const [docs, setDocs] = useState<File[]>(data.surgeryDocs);
  const [draft, setDraft] = useState<Surgery>(empty());
  const [adding, setAdding] = useState(list.length === 0);

  function saveDraft() {
    if (!draft.name.trim()) return;
    setList(l => [...l, draft]);
    setDraft(empty());
    setAdding(false);
  }

  return (
    <>
      <h2 className={styles.question}>Tell me about {data.name}'s surgeries</h2>
      <div className={styles.cardList}>
        {list.map((s, i) => (
          <div key={i} className={styles.card}>
            <div>
              <div className={styles.cardName}>🔪 {s.name}</div>
              {s.date && <div className={styles.cardDetail}>{s.date}</div>}
            </div>
            <button className={styles.removeBtn} onClick={() => setList(l => l.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
      </div>

      {adding && (
        <div className={styles.inlineForm}>
          <div><div className={styles.fieldLabel}>Surgery name *</div>
            <input className={styles.fieldInput} value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. ACL Repair" autoFocus /></div>
          <div><div className={styles.fieldLabel}>Approximate date</div>
            <input className={styles.fieldInput} value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} placeholder="e.g. March 2024" /></div>
          <button className={styles.addBtn} onClick={saveDraft}>Save</button>
        </div>
      )}

      {!adding && <button className={styles.addCardBtn} onClick={() => setAdding(true)}>+ Add another surgery</button>}
      <FileUpload files={docs} onChange={setDocs} label="Upload surgery reports or discharge summaries" />
      <button className={styles.continueBtn} disabled={list.length === 0}
        onClick={() => onNext({ surgeryList: list, surgeryDocs: docs })}>Continue</button>
    </>
  );
}
