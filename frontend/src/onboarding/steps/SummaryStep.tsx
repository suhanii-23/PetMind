import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OnboardingData } from "../onboarding.types";
import { petsApi } from "../../api/pets";
import styles from "../Onboarding.module.css";

interface Props { data: OnboardingData; onEdit: () => void; }

function age(data: OnboardingData): string {
  if (data.dobType === "birthday" && data.dob) {
    const years = Math.floor((Date.now() - new Date(data.dob).getTime()) / (365.25 * 24 * 3600 * 1000));
    return years < 1 ? "< 1 year old" : `${years} year${years !== 1 ? "s" : ""} old`;
  }
  if (data.dobType === "approximate" && data.approximateAge) return data.approximateAge;
  return "";
}

export default function SummaryStep({ data, onEdit }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function finish() {
    setLoading(true);
    setError("");
    try {
      await petsApi.onboard(data);
      navigate("/");
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const docCount = data.vaccinationDocs.length + data.surgeryDocs.length + data.conditionDocs.length + data.medicalRecords.length + data.freeMemoryFiles.length;

  return (
    <>
      <h2 className={styles.question} style={{ marginBottom: 20 }}>Here's what I know about {data.name} 🐾</h2>

      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <div className={styles.summaryPhoto}>
            {data.photoPreview ? <img src={data.photoPreview} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🐾"}
          </div>
          <div>
            <div className={styles.summaryName}>{data.name}</div>
            <div className={styles.summaryBreed}>{[data.breed, data.species].filter(Boolean).join(" · ")}</div>
          </div>
        </div>

        <div className={styles.summarySection}>
          <div className={styles.summarySectionTitle}>Profile</div>
          <div className={styles.summaryRow}>
            {age(data) && <span className={styles.summaryPill}>🎂 {age(data)}</span>}
            {data.gender && <span className={styles.summaryPill}>{data.gender === "Female" ? "♀" : "♂"} {data.gender}</span>}
            {data.neutered && data.neutered !== "Not sure" && <span className={styles.summaryPill}>{data.neutered === "Yes" ? (data.gender === "Female" ? "✂️ Spayed" : "✂️ Neutered") : "Not neutered"}</span>}
            {data.weightValue && <span className={styles.summaryPill}>⚖️ {data.weightValue} {data.weightUnit}</span>}
            {data.vaccinated && <span className={styles.summaryPill}>{data.vaccinated === "Yes" ? "💉 Vaccinated" : `💉 Vaccines: ${data.vaccinated}`}</span>}
          </div>
        </div>

        {data.hasAllergies === "Yes" && data.allergyList.length > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summarySectionTitle}>Allergies</div>
            <div className={styles.summaryRow}>
              {data.allergyList.map(a => <span key={a} className={styles.summaryPillAccent}>⚠️ {a}</span>)}
            </div>
          </div>
        )}

        {data.hasMedications === "Yes" && data.medicationList.length > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summarySectionTitle}>Medications</div>
            <div className={styles.summaryRow}>
              {data.medicationList.map((m, i) => <span key={i} className={styles.summaryPill}>💊 {m.name}{m.dosage ? ` (${m.dosage})` : ""}</span>)}
            </div>
          </div>
        )}

        {data.hasSurgeries === "Yes" && data.surgeryList.length > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summarySectionTitle}>Surgeries</div>
            <div className={styles.summaryRow}>
              {data.surgeryList.map((s, i) => <span key={i} className={styles.summaryPill}>🔪 {s.name}{s.date ? ` · ${s.date}` : ""}</span>)}
            </div>
          </div>
        )}

        {data.hasConditions === "Yes" && data.conditionList.length > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summarySectionTitle}>Conditions</div>
            <div className={styles.summaryRow}>
              {data.conditionList.map((c, i) => <span key={i} className={styles.summaryPillAccent}>🩺 {c}</span>)}
            </div>
          </div>
        )}

        {data.freeMemoryText && (
          <div className={styles.summarySection}>
            <div className={styles.summarySectionTitle}>Memory</div>
            <div className={styles.summaryMemory}>"{data.freeMemoryText}"</div>
          </div>
        )}

        {docCount > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summarySectionTitle}>Documents</div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryPill}>📄 {docCount} file{docCount !== 1 ? "s" : ""} uploaded</span>
            </div>
          </div>
        )}

        <p className={styles.summaryMeta}>
          I'll continue learning about {data.name} every time you add vet visits, daily logs, photos, or medical documents.
        </p>

        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{error}</p>}

        <div className={styles.summaryActions}>
          <button className={styles.finishBtn} onClick={finish} disabled={loading}>
            {loading ? "Saving…" : "Finish"}
          </button>
          <button className={styles.editBtn} onClick={onEdit}>Edit</button>
        </div>
      </div>
    </>
  );
}
