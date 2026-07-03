import { useState } from "react";
import type { OnboardingData } from "../onboarding.types";
import VoiceRecorder from "../components/VoiceRecorder";
import FileUpload from "../components/FileUpload";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

type Tab = "text" | "voice" | "files";

export default function FreeMemoryStep({ data, onNext }: Props) {
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState(data.freeMemoryText);
  const [files, setFiles] = useState<File[]>(data.freeMemoryFiles);

  const TABS: { id: Tab; label: string }[] = [
    { id: "text", label: "✏️ Type" },
    { id: "voice", label: "🎙️ Voice" },
    { id: "files", label: "📎 Files" },
  ];

  return (
    <>
      <h2 className={styles.question}>Anything else I should know about {data.name}?</h2>
      <p className={styles.subtext}>Personality, quirks, fears, favourite things — this becomes their core memory</p>

      <div className={styles.memoryTabs}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.memTab} ${tab === t.id ? styles.active : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "text" && (
        <textarea
          className={styles.memTextarea}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`e.g. ${data.name} gets scared during thunderstorms. Loves tennis balls. Scratches after eating chicken.`}
          autoFocus
        />
      )}

      {tab === "voice" && (
        <VoiceRecorder onTranscript={t => setText(prev => prev ? `${prev} ${t}` : t)} />
      )}

      {tab === "files" && (
        <FileUpload files={files} onChange={setFiles} label="Upload notes, photos, or any supporting documents" />
      )}

      <button className={styles.continueBtn} onClick={() => onNext({ freeMemoryText: text, freeMemoryFiles: files })}>
        {text || files.length > 0 ? "Continue" : "Skip"}
      </button>
    </>
  );
}
