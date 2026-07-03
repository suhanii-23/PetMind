import { useState } from "react";
import type { OnboardingData, Medication } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

const empty = (): Medication => ({ name: "", reason: "", dosage: "" });

export default function MedicationDetailsStep({ data, onNext }: Props) {
  const [list, setList] = useState<Medication[]>(data.medicationList);
  const [draft, setDraft] = useState<Medication>(empty());
  const [adding, setAdding] = useState(list.length === 0);

  function saveDraft() {
    if (!draft.name.trim()) return;
    setList(l => [...l, draft]);
    setDraft(empty());
    setAdding(false);
  }

  return (
    <>
      <h2 className={styles.question}>What medications does {data.name} take?</h2>
      <div className={styles.cardList}>
        {list.map((m, i) => (
          <div key={i} className={styles.card}>
            <div>
              <div className={styles.cardName}>💊 {m.name}</div>
              <div className={styles.cardDetail}>{m.reason}{m.dosage ? ` · ${m.dosage}` : ""}</div>
            </div>
            <button className={styles.removeBtn} onClick={() => setList(l => l.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
      </div>

      {adding && (
        <div className={styles.inlineForm}>
          <div><div className={styles.fieldLabel}>Medication name *</div>
            <input className={styles.fieldInput} value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Omega-3" autoFocus /></div>
          <div><div className={styles.fieldLabel}>Reason</div>
            <input className={styles.fieldInput} value={draft.reason} onChange={e => setDraft(d => ({ ...d, reason: e.target.value }))} placeholder="e.g. Coat health" /></div>
          <div><div className={styles.fieldLabel}>Dosage</div>
            <input className={styles.fieldInput} value={draft.dosage} onChange={e => setDraft(d => ({ ...d, dosage: e.target.value }))} placeholder="e.g. 1 capsule/day" /></div>
          <button className={styles.addBtn} onClick={saveDraft}>Save</button>
        </div>
      )}

      {!adding && <button className={styles.addCardBtn} onClick={() => setAdding(true)}>+ Add another medication</button>}

      <button className={styles.continueBtn} disabled={list.length === 0}
        onClick={() => onNext({ medicationList: list })}>Continue</button>
    </>
  );
}
