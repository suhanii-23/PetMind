import { useEffect, useState } from "react";

interface Insight {
  id: string;
  kind: "recurring_pattern" | "overdue_vaccine" | "checkup_gap" | "life_stage" | "diet_concern" | "medication_note";
  title: string;
  body: string;
  why: string;
  source: "pet_records" | "general_guideline";
  pet_name: string;
}

interface Props { petId: number; }

const CARD: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #30363d",
  borderRadius: 10,
  padding: "14px 16px",
  marginBottom: 10,
};

const KIND_ICONS: Record<string, string> = {
  recurring_pattern: "🔁",
  overdue_vaccine: "💉",
  checkup_gap: "🩺",
  life_stage: "🎂",
  diet_concern: "🥗",
  medication_note: "💊",
};

function Collapsible({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", color: "#7c6af7", cursor: "pointer", fontSize: 12, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
        {open ? "▾" : "▸"} {label}
      </button>
      {open && <div style={{ marginTop: 6, fontSize: 12, color: "#8b949e" }}>{children}</div>}
    </div>
  );
}

export default function InsightsPanel({ petId }: Props) {
  const [items, setItems] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`http://localhost:8080/api/v1/pets/${petId}/insights`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [petId]);

  return (
    <div style={{ color: "#e6edf3", padding: "0 4px" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#e6edf3", display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔍</span> Insights
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8b949e" }}>
          AI-generated health insights based on your pet's records
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#8b949e" }}>
          <div style={{ width: 28, height: 28, border: "3px solid #30363d", borderTopColor: "#7c6af7", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Generating insights…
        </div>
      )}

      {error && !loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#f87171" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          Could not load insights. Check your connection.
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#8b949e", background: "#161b22", borderRadius: 10, border: "1px solid #30363d" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌱</div>
          <div style={{ fontSize: 14 }}>No additional insights at this time.</div>
        </div>
      )}

      {!loading && !error && items.map(ins => (
        <div key={ins.id} style={CARD}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{KIND_ICONS[ins.kind] || "✦"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                {ins.title}
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                  background: ins.source === "pet_records" ? "#1d4ed8" : "#7c3aed",
                  color: "#fff",
                }}>
                  {ins.source === "pet_records" ? "From records" : "General guideline"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#c9d1d9", marginTop: 6 }}>{ins.body}</div>
              {ins.why && (
                <Collapsible label="Why was this flagged?">
                  {ins.why}
                </Collapsible>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
