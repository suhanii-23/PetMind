import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { petsApi } from "../api/pets";
import api from "../api/auth";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  function loadPets() {
    return petsApi.list().then(setPets).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { loadPets(); }, []);

  async function handleSeed() {
    setSeeding(true);
    try {
      await api.post("/dev/seed");
      await loadPets();
    } catch {
      alert("Seed failed — make sure the backend is running.");
    }
    setSeeding(false);
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "rgba(255,255,255,0.4)", background: "#0d0b14" }}>
      Loading…
    </div>
  );

  // Empty state — don't auto-redirect, show choices instead
  if (pets.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyEmoji}>🐾</div>
          <h1 className={styles.emptyTitle}>Welcome to PetMind</h1>
          <p className={styles.emptySub}>Your AI-powered pet memory assistant. Add your first pet or explore with demo data.</p>
          <div className={styles.emptyActions}>
            <button className={styles.primaryBtn} onClick={() => navigate("/onboarding")}>
              + Add Your First Pet
            </button>
            <button className={styles.demoBtn} onClick={handleSeed} disabled={seeding}>
              {seeding ? "Loading demo…" : "✦ Try with Demo Data"}
            </button>
          </div>
          <p className={styles.emptyHint}>Demo creates 3 pets: Bella, Oliver & Mango with rich health histories</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>🐾 PetMind</span>
        <div className={styles.user}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{user?.name}</span>
          <button className={styles.logout} onClick={logout}>Logout</button>
        </div>
      </header>
      <main className={styles.main}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 className={styles.title}>Your Pets</h1>
            <p className={styles.sub}>{pets.length} pet{pets.length !== 1 ? "s" : ""} in your care</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {pets.length > 0 && pets.every(p => !p.photo_url) && (
              <button onClick={handleSeed} disabled={seeding} style={{
                background: "rgba(124,106,247,0.12)", color: "#a78bfa",
                border: "1px solid rgba(124,106,247,0.25)", borderRadius: 10,
                padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                {seeding ? "Loading…" : "✦ Reload Demo"}
              </button>
            )}
            <button onClick={() => navigate("/onboarding")} style={{
              background: "linear-gradient(135deg, #7c6af7, #9d8dfa)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
            }}>
              + Add Pet
            </button>
          </div>
        </div>

        <div className={styles.petGrid}>
          {pets.map(pet => (
            <button key={pet.id} className={styles.petCard} onClick={() => navigate(`/pets/${pet.id}`)}>
              <div className={styles.cardPhoto}>
                {pet.photo_url
                  ? <img src={`http://localhost:8080${pet.photo_url}`} alt={pet.name} />
                  : <span style={{ fontSize: 32 }}>🐾</span>}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{pet.name}</div>
                <div className={styles.cardMeta}>{pet.breed || pet.species}{pet.gender ? ` · ${pet.gender}` : ""}</div>
                <div className={styles.cardChips}>
                  {pet.weight_value && <span className={styles.ccGray}>{pet.weight_value} {pet.weight_unit}</span>}
                  {pet.vaccinated === "Yes" && <span className={styles.ccPurple}>Vaccinated</span>}
                  {pet.allergies?.length > 0 && <span className={styles.ccRed}>⚠️ {pet.allergies.length} allerg{pet.allergies.length === 1 ? "y" : "ies"}</span>}
                  {pet.conditions?.length > 0 && <span className={styles.ccOrange}>{pet.conditions.length} condition{pet.conditions.length !== 1 ? "s" : ""}</span>}
                </div>
              </div>
              <div className={styles.cardArrow}>→</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
