import { useEffect, useState } from "react";

interface Reminder {
  id: string;
  kind: "vaccine_due" | "follow_up" | "medication_check";
  title: string;
  details: string;
  due_date: string | null;
  pet_name: string;
}

interface Insight {
  id: string;
  kind: "recurring_pattern" | "overdue_vaccine" | "checkup_gap" | "life_stage" | "diet_concern" | "medication_note";
  title: string;
  body: string;
  why: string;
  source: "pet_records" | "general_guideline";
  pet_name: string;
}

interface Conflict {
  conflict_key: string;
  type: "medication_interaction" | "allergy_conflict" | "medication_condition_concern";
  severity: "high" | "medium" | "low";
  description: string;
  suggested_question: string;
  medication?: string;
  involved_nodes: string[];
}

interface Props {
  petId: number;
  defaultTab?: "reminders" | "insights" | "conflicts" | "alerts";
}

const CARD: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #30363d",
  borderRadius: 10,
  padding: "14px 16px",
  marginBottom: 10,
};

const TABS = ["Reminders", "Insights", "Conflicts"];

function ReminderIcon({ kind }: { kind: string }) {
  if (kind === "vaccine_due") return <span>💉</span>;
  if (kind === "follow_up") return <span>📅</span>;
  return <span>💊</span>;
}

function InsightIcon({ kind }: { kind: string }) {
  const map: Record<string, string> = {
    recurring_pattern: "🔁",
    overdue_vaccine: "💉",
    checkup_gap: "🩺",
    life_stage: "🎂",
    diet_concern: "🥗",
    medication_note: "💊",
  };
  return <span>{map[kind] || "✦"}</span>;
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 20,
      background: color,
      color: "#fff",
      marginLeft: 8,
    }}>{text}</span>
  );
}

function Collapsible({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none",
          border: "none",
          color: "#7c6af7",
          cursor: "pointer",
          fontSize: 12,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {open ? "▾" : "▸"} {label}
      </button>
      {open && <div style={{ marginTop: 6 }}>{children}</div>}
    </div>
  );
}

const TAB_INDEX: Record<string, number> = { reminders: 0, insights: 1, conflicts: 2, alerts: 2 };

export default function HealthIntelligence({ petId, defaultTab }: Props) {
  const [tab, setTab] = useState(defaultTab ? (TAB_INDEX[defaultTab] ?? 0) : 0);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    const base = `http://localhost:8080/api/v1/pets/${petId}`;

    Promise.all([
      fetch(`${base}/reminders`, { headers }).then(r => r.json()),
      fetch(`${base}/insights`, { headers }).then(r => r.json()),
      fetch(`${base}/conflicts`, { headers }).then(r => r.json()),
    ]).then(([r, i, c]) => {
      setReminders(Array.isArray(r) ? r : []);
      setInsights(Array.isArray(i) ? i : []);
      setConflicts(Array.isArray(c) ? c : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [petId]);

  const today = new Date();
  function dueBadge(due_date: string | null) {
    if (!due_date) return null;
    const d = new Date(due_date);
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return <Badge text="Overdue" color="#dc2626" />;
    if (diff <= 30) return <Badge text="Due soon" color="#d97706" />;
    return null;
  }

  return (
    <div style={{
      background: "#0d1117",
      borderRadius: 14,
      border: "1px solid #30363d",
      padding: "20px 24px",
      marginTop: defaultTab ? 0 : 24,
      color: "#e6edf3",
      minHeight: defaultTab ? "calc(100vh - 200px)" : undefined,
    }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#e6edf3", display: "flex", alignItems: "center", gap: 8 }}>
          <span>✦</span> Health Intelligence
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8b949e" }}>
          AI-powered analysis of your pet's health records
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #30363d" }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              background: "none",
              border: "none",
              color: tab === i ? "#7c6af7" : "#8b949e",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: tab === i ? 600 : 400,
              padding: "8px 14px",
              borderBottom: tab === i ? "2px solid #7c6af7" : "2px solid transparent",
              marginBottom: -1,
              transition: "color 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#8b949e" }}>
          <div style={{
            width: 28, height: 28, border: "3px solid #30363d",
            borderTopColor: "#7c6af7", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Analyzing health records…
        </div>
      ) : (
        <>
          {/* Reminders */}
          {tab === 0 && (
            reminders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#8b949e" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                No upcoming reminders found in the records.
              </div>
            ) : reminders.map(r => (
              <div key={r.id} style={CARD}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 20 }}><ReminderIcon kind={r.kind} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                      {r.title}
                      {dueBadge(r.due_date)}
                    </div>
                    <div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>
                      {r.kind.replace(/_/g, " ")}
                      {r.due_date ? ` · Due ${r.due_date}` : ""}
                    </div>
                    {r.details && (
                      <div style={{ fontSize: 13, color: "#c9d1d9", marginTop: 6 }}>{r.details}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Insights */}
          {tab === 1 && (
            insights.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#8b949e" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                No additional insights at this time.
              </div>
            ) : insights.map(ins => (
              <div key={ins.id} style={CARD}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 20 }}><InsightIcon kind={ins.kind} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                      {ins.title}
                      {ins.source === "pet_records"
                        ? <Badge text="From records" color="#1d4ed8" />
                        : <Badge text="General guideline" color="#7c3aed" />}
                    </div>
                    <div style={{ fontSize: 13, color: "#c9d1d9", marginTop: 6 }}>{ins.body}</div>
                    {ins.why && (
                      <Collapsible label="Why was this flagged?">
                        <div style={{ fontSize: 12, color: "#8b949e" }}>{ins.why}</div>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Conflicts */}
          {tab === 2 && (
            conflicts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#8b949e" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👍</div>
                No conflicts or concerns detected in the records.
              </div>
            ) : conflicts.map(c => (
              <div key={c.conflict_key} style={{
                ...CARD,
                borderColor: c.severity === "high" ? "#7f1d1d" : c.severity === "medium" ? "#78350f" : "#30363d",
                background: c.severity === "high" ? "#1c0a0a" : c.severity === "medium" ? "#1c1208" : "#161b22",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: c.severity === "high" ? "#dc2626" : c.severity === "medium" ? "#d97706" : "#4b5563",
                        color: "#fff",
                      }}>{c.severity.toUpperCase()}</span>
                      {c.type.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontSize: 13, color: "#c9d1d9", marginTop: 6 }}>{c.description}</div>
                    {c.suggested_question && (
                      <Collapsible label="Ask your vet:">
                        <div style={{ fontSize: 13, color: "#60a5fa", fontStyle: "italic" }}>
                          {c.suggested_question}
                        </div>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
