import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Onboarding.module.css";
import axios from "axios";

const api = axios.create({ baseURL: "/api/v1" });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);

  async function handleSeedData() {
    setSeeding(true);
    try {
      await api.post("/dev/seed");
      navigate("/dashboard");
    } catch {
      setSeeding(false);
    }
  }

  return (
    <div className={styles.welcome}>
      <button className={styles.backToDashBtn} onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>
      <div className={styles.welcomeEmoji}>🐾</div>
      <h1 className={styles.welcomeTitle}>Hi! Let's meet your pet.</h1>
      <p className={styles.welcomeSub}>
        This takes about 2 minutes and helps me build their lifelong memory — medical history, personality, and everything in between.
      </p>
      <button className={styles.startBtn} onClick={onNext}>Get Started</button>
      <div className={styles.seedDivider}>or</div>
      <button
        className={styles.seedBtn}
        onClick={handleSeedData}
        disabled={seeding}
      >
        {seeding ? "Loading demo pets…" : "✦ Load Demo Data for Testing"}
      </button>
    </div>
  );
}
