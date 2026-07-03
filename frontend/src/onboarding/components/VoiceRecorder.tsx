import { useState, useRef } from "react";
import styles from "../Onboarding.module.css";

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: Props) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const recognitionRef = useRef<any>(null);

  function toggle() {
    if (!supported) return;

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(text);
      onTranscript(text);
    };

    rec.onend = () => setRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
  }

  if (!supported) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
        Voice recording not supported in this browser. Use text instead.
      </p>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <button
        className={`${styles.voiceBtn} ${recording ? styles.recording : ""}`}
        onClick={toggle}
        type="button"
      >
        {recording ? "🔴 Recording… tap to stop" : "🎙️ Tap to record"}
      </button>
      {transcript && (
        <p style={{ marginTop: 12, fontSize: 14, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.6 }}>
          "{transcript}"
        </p>
      )}
    </div>
  );
}
