import type { OnboardingData } from "../onboarding.types";
import FileUpload from "../components/FileUpload";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function VaccinationDocsStep({ data, onNext }: Props) {
  return (
    <>
      <h2 className={styles.question}>Want to upload vaccination records?</h2>
      <p className={styles.subtext}>PDFs, photos — anything works</p>
      <FileUpload files={data.vaccinationDocs} onChange={docs => onNext({ vaccinationDocs: docs })} accept=".pdf,.jpg,.jpeg,.png" label="Upload vaccination records" />
      <button className={styles.continueBtn} onClick={() => onNext({})}>
        {data.vaccinationDocs.length > 0 ? "Continue" : "Skip"}
      </button>
    </>
  );
}
