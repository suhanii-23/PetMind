import { useRef } from "react";
import type { OnboardingData } from "../onboarding.types";
import styles from "../Onboarding.module.css";

interface Props {
  data: OnboardingData;
  onNext: (u: Partial<OnboardingData>) => void;
}

export default function PhotoStep({ data, onNext }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    onNext({ photo: file, photoPreview: preview });
  }

  return (
    <>
      <h2 className={styles.question}>Add a photo of your pet</h2>
      <p className={styles.subtext}>A great first memory 📸</p>
      <div className={styles.photoArea}>
        <div className={styles.photoCircle} onClick={() => ref.current?.click()}>
          {data.photoPreview
            ? <img src={data.photoPreview} alt="Pet" />
            : (
              <div className={styles.photoPlaceholder}>
                <span className={styles.photoIcon}>📷</span>
                <span>Upload photo</span>
              </div>
            )}
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        {data.photoPreview && (
          <button className={styles.continueBtn} onClick={() => onNext({})}>Continue</button>
        )}
      </div>
      <button className={styles.skipBtn} onClick={() => onNext({ photo: null, photoPreview: null })}>
        Skip for now
      </button>
    </>
  );
}
