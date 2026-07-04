import { useEffect, useState } from "react";

interface Reminder {
  id: string;
  kind: "vaccine_due" | "follow_up" | "medication_check";
  title: string;
  details: string;
  due_date: string | null;
  pet_name: string;
}

interface Appointment {
  id: number;
  vet_name: string | null;
  clinic_name: string | null;
  date: string;
  reason: string | null;
}

interface FrequentVet {
  vet_name: string;
  clinic_name: string | null;
}

interface Props { petId: number; }

const CARD: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #30363d",
  borderRadius: 10,
  padding: "14px 16px",
  marginBottom: 10,
};

function ReminderIcon({ kind }: { kind: string }) {
  if (kind === "vaccine_due") return <span>💉</span>;
  if (kind === "follow_up") return <span>📅</span>;
  return <span>💊</span>;
}

function DueBadge({ due_date }: { due_date: string | null }) {
  if (!due_date) return null;
  const diff = (new Date(due_date).getTime() - Date.now()) / 86400000;
  if (diff < 0) return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#dc2626", color: "#fff", marginLeft: 8 }}>Overdue</span>
  );
  if (diff <= 30) return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#d97706", color: "#fff", marginLeft: 8 }}>Due soon</span>
  );
  return null;
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 20, height: 20, border: "2px solid #30363d", borderTopColor: "#7c6af7", borderRadius: "50%", animation: "_spin 0.8s linear infinite", flexShrink: 0 }} />
    </>
  );
}

export default function RemindersPanel({ petId }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [frequentVets, setFrequentVets] = useState<FrequentVet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Add appointment form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vet_name: "", clinic_name: "", date: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [vetSuggestions, setVetSuggestions] = useState<FrequentVet[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const base = `http://localhost:8080/api/v1/pets/${petId}`;

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      fetch(`${base}/reminders`, { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`${base}/appointments`, { headers }).then(r => r.json()),
      fetch(`${base}/frequent-vets`, { headers }).then(r => r.json()),
    ])
      .then(([rem, appts, vets]) => {
        setReminders(Array.isArray(rem) ? rem : []);
        setAppointments(Array.isArray(appts) ? appts : []);
        setFrequentVets(Array.isArray(vets) ? vets : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [petId]);

  function handleVetInput(val: string) {
    setForm(f => ({ ...f, vet_name: val }));
    if (val.length > 0) {
      const matches = frequentVets.filter(v =>
        v.vet_name.toLowerCase().includes(val.toLowerCase())
      );
      setVetSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(frequentVets.length > 0);
      setVetSuggestions(frequentVets);
    }
  }

  function selectVet(vet: FrequentVet) {
    setForm(f => ({ ...f, vet_name: vet.vet_name, clinic_name: vet.clinic_name || "" }));
    setShowSuggestions(false);
  }

  async function saveAppointment() {
    if (!form.date) return;
    setSaving(true);
    try {
      const res = await fetch(`${base}/appointments`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const newAppt = await res.json();
      setAppointments(a => [...a, newAppt].sort((x, y) => x.date.localeCompare(y.date)));
      if (form.vet_name && !frequentVets.find(v => v.vet_name === form.vet_name)) {
        setFrequentVets(v => [...v, { vet_name: form.vet_name, clinic_name: form.clinic_name || null }]);
      }
      setForm({ vet_name: "", clinic_name: "", date: "", reason: "" });
      setShowForm(false);
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function deleteAppointment(id: number) {
    await fetch(`${base}/appointments/${id}`, { method: "DELETE", headers });
    setAppointments(a => a.filter(x => x.id !== id));
  }

  const upcoming = appointments.filter(a => a.date >= new Date().toISOString().slice(0, 10));
  const past = appointments.filter(a => a.date < new Date().toISOString().slice(0, 10));

  return (
    <div style={{ color: "#e6edf3", padding: "0 4px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#e6edf3", display: "flex", alignItems: "center", gap: 8 }}>
            <span>💉</span> Reminders
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8b949e" }}>
            Upcoming vaccinations, follow-ups, and scheduled appointments
          </p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{
            background: showForm ? "rgba(124,106,247,0.12)" : "linear-gradient(135deg, #7c6af7, #9d8dfa)",
            color: showForm ? "#a78bfa" : "white",
            border: showForm ? "1px solid rgba(124,106,247,0.3)" : "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add Appointment"}
        </button>
      </div>

      {/* Add appointment form */}
      {showForm && (
        <div style={{ ...CARD, border: "1px solid rgba(124,106,247,0.3)", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", marginBottom: 14 }}>Schedule Appointment</div>

          {/* Vet name with autocomplete */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#8b949e", display: "block", marginBottom: 4 }}>Vet / Doctor name</label>
            <input
              value={form.vet_name}
              onChange={e => handleVetInput(e.target.value)}
              onFocus={() => { setShowSuggestions(frequentVets.length > 0); setVetSuggestions(frequentVets); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Dr. Priya Sharma"
              style={inputStyle}
            />
            {showSuggestions && vetSuggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                background: "#1c2128", border: "1px solid #30363d", borderRadius: 8,
                marginTop: 2, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}>
                <div style={{ padding: "6px 10px", fontSize: 10, color: "#6e7681", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Frequently visited
                </div>
                {vetSuggestions.map((v, i) => (
                  <div
                    key={i}
                    onMouseDown={() => selectVet(v)}
                    style={{
                      padding: "8px 12px", cursor: "pointer", fontSize: 13,
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#21262d")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 16 }}>🩺</span>
                    <div>
                      <div style={{ color: "#e6edf3", fontWeight: 500 }}>{v.vet_name}</div>
                      {v.clinic_name && <div style={{ fontSize: 11, color: "#8b949e" }}>{v.clinic_name}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#8b949e", display: "block", marginBottom: 4 }}>Clinic / Hospital</label>
            <input
              value={form.clinic_name}
              onChange={e => setForm(f => ({ ...f, clinic_name: e.target.value }))}
              placeholder="e.g. PawsCare Clinic"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "#8b949e", display: "block", marginBottom: 4 }}>Date <span style={{ color: "#f87171" }}>*</span></label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#8b949e", display: "block", marginBottom: 4 }}>Reason / Notes</label>
            <input
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Annual checkup, vaccine booster"
              style={inputStyle}
            />
          </div>

          <button
            onClick={saveAppointment}
            disabled={!form.date || saving}
            style={{
              background: !form.date ? "#21262d" : "linear-gradient(135deg, #7c6af7, #9d8dfa)",
              color: !form.date ? "#6e7681" : "white",
              border: "none", borderRadius: 8,
              padding: "9px 18px", fontSize: 13, fontWeight: 600,
              cursor: !form.date ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {saving && <Spinner />}
            {saving ? "Saving…" : "Save Appointment"}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#8b949e" }}>
          <style>{`@keyframes _spin2 { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: 28, height: 28, border: "3px solid #30363d", borderTopColor: "#7c6af7", borderRadius: "50%", animation: "_spin2 0.8s linear infinite", margin: "0 auto 12px" }} />
          Analyzing health records…
        </div>
      )}

      {error && !loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#f87171" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          Could not load reminders. Check your connection.
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Upcoming manual appointments */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Scheduled Appointments
              </div>
              {upcoming.map(a => (
                <div key={a.id} style={{ ...CARD, border: "1px solid rgba(124,106,247,0.25)", background: "rgba(124,106,247,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>📅</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {a.vet_name || "Vet appointment"}
                        {a.clinic_name && <span style={{ fontSize: 12, color: "#8b949e", fontWeight: 400 }}>at {a.clinic_name}</span>}
                        {(() => {
                          const diff = (new Date(a.date).getTime() - Date.now()) / 86400000;
                          if (diff <= 7) return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#d97706", color: "#fff" }}>Soon</span>;
                          return null;
                        })()}
                      </div>
                      <div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>{a.date}</div>
                      {a.reason && <div style={{ fontSize: 13, color: "#c9d1d9", marginTop: 4 }}>{a.reason}</div>}
                    </div>
                    <button
                      onClick={() => deleteAppointment(a.id)}
                      style={{ background: "none", border: "none", color: "#6e7681", cursor: "pointer", fontSize: 16, padding: "0 2px", lineHeight: 1 }}
                      title="Remove"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI reminders */}
          {reminders.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                From Health Records
              </div>
              {reminders.map(r => (
                <div key={r.id} style={CARD}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 20 }}><ReminderIcon kind={r.kind} /></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        {r.title}
                        <DueBadge due_date={r.due_date} />
                      </div>
                      <div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>
                        {r.kind.replace(/_/g, " ")}
                        {r.due_date ? ` · Due ${r.due_date}` : ""}
                      </div>
                      {r.details && <div style={{ fontSize: 13, color: "#c9d1d9", marginTop: 6 }}>{r.details}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past appointments */}
          {past.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Past Appointments
              </div>
              {past.slice().reverse().map(a => (
                <div key={a.id} style={{ ...CARD, opacity: 0.6 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>✓</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.vet_name || "Vet visit"}</div>
                      <div style={{ fontSize: 12, color: "#8b949e" }}>
                        {a.date}{a.clinic_name ? ` · ${a.clinic_name}` : ""}
                      </div>
                      {a.reason && <div style={{ fontSize: 12, color: "#6e7681", marginTop: 2 }}>{a.reason}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcoming.length === 0 && reminders.length === 0 && past.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#8b949e", background: "#161b22", borderRadius: 10, border: "1px solid #30363d" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 14 }}>No reminders yet. Add an upcoming appointment above.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 13,
  color: "#e6edf3",
  outline: "none",
  boxSizing: "border-box",
};
