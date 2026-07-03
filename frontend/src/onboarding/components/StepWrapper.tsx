import styles from "../Onboarding.module.css";

interface Props {
  children: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  progress: number;   // 0–100
  stepLabel: string;  // e.g. "3 of 16"
  animKey: number;
}

export default function StepWrapper({ children, onBack, showBack = true, progress, stepLabel, animKey }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        {showBack
          ? <button className={styles.back} onClick={onBack} aria-label="Back">←</button>
          : <div className={styles.backSpacer} />}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.stepCount}>{stepLabel}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.step} key={animKey}>
          {children}
        </div>
      </div>
    </div>
  );
}
