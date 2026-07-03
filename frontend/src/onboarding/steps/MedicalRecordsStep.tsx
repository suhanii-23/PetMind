import type { OnboardingData } from "../onboarding.types";
import FileUpload from "../components/FileUpload";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function MedicalRecordsStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>Any other medical records to upload?</h2>
      <p className={styles.subtext}>X-rays, blood reports, prescriptions — anything you'd like me to remember</p>
      <FileUpload
        files={data.medicalRecords}
        onChange={docs => onNext({ medicalRecords: docs })}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        label="Upload blood reports, X-rays, prescriptions…"
      />
      <button className={styles.continueBtn} onClick={() => onNext({})}>
        {data.medicalRecords.length > 0 ? "Continue" : "Skip"}
      </button>
    </>
  );
}
