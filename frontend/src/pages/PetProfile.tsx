import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { petsApi } from "../api/pets";
import MemorySphere from "../components/MemorySphere";
import RemindersPanel from "../components/RemindersPanel";
import InsightsPanel from "../components/InsightsPanel";
import VisitPrep from "../components/VisitPrep";
import RecordsView from "../components/RecordsView";
import styles from "./PetProfile.module.css";

interface NodeDef {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const NODES: NodeDef[] = [
  { id: "medications",  label: "Medications",       icon: "💊", color: "#a78bfa" },
  { id: "conditions",   label: "Health Conditions", icon: "❤️", color: "#f87171" },
  { id: "vaccinations", label: "Vaccinations",      icon: "💉", color: "#34d399" },
  { id: "vetVisits",    label: "Vet Visits",        icon: "🏥", color: "#38bdf8" },
  { id: "allergies",    label: "Allergies",         icon: "⚠️", color: "#fbbf24" },
  { id: "diet",         label: "Diet & Food",       icon: "🥗", color: "#4ade80" },
  { id: "behavior",     label: "Behavior",          icon: "🎭", color: "#fb923c" },
  { id: "documents",    label: "Documents",         icon: "📄", color: "#c084fc" },
];

interface ChatMsg { role: "user" | "bot"; text: string; cognee?: boolean; }

const SUGGESTIONS = (name: string) => [
  `What are ${name}'s allergies?`,
  `When was ${name} last vaccinated?`,
  `What food does ${name} eat?`,
  `Show ${name}'s medications`,
];

type View = "ask" | "health-map" | "reminders" | "insights" | "visit-prep" | "records";

const NAV_ITEMS: { icon: string; label: string; view: View }[] = [
  { icon: "✦",  label: "Ask",        view: "ask" },
  { icon: "🗺",  label: "Health Map", view: "health-map" },
  { icon: "💉",  label: "Reminders",  view: "reminders" },
  { icon: "🔍",  label: "Insights",   view: "insights" },
  { icon: "📋",  label: "Visit Prep", view: "visit-prep" },
  { icon: "📁",  label: "Records",    view: "records" },
];

export default function PetProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [graphCounts, setGraphCounts] = useState<Record<string, number>>({});
  const [view, setView] = useState<View>("ask");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    petsApi.get(parseInt(id)).then(p => {
      setPet(p);
      setMessages([{
        role: "bot",
        text: `Hi! I'm ${p.name}'s memory assistant. Ask me anything about ${p.name}.`,
      }]);
    }).catch(() => navigate("/")).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8080/api/v1/pets/${id}/graph`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => r.json())
      .then(d => { if (d.counts) setGraphCounts(d.counts); })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || chatLoading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setChatLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/pets/${id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.message || data.detail || "Sorry, I couldn't process that. Try again.";
      setMessages(m => [...m, { role: "bot", text: reply, cognee: !!data.cognee_used }]);
      if (data.category && data.category !== "general") {
        setActiveNode(data.category);
        setTimeout(() => setActiveNode(null), 3000);
      }
    } catch {
      setMessages(m => [...m, { role: "bot", text: "Sorry, I had trouble reaching my memory. Try again." }]);
    }
    setChatLoading(false);
  }

  function memCount(nodeId: string): number {
    if (graphCounts[nodeId] !== undefined) return graphCounts[nodeId];
    if (!pet) return 0;
    switch (nodeId) {
      case "medications":  return (pet.medications || []).length;
      case "conditions":   return (pet.conditions || []).length;
      case "vaccinations": return pet.vaccinated === "Yes" ? 1 : 0;
      case "allergies":    return (pet.allergies || []).length;
      default: return 0;
    }
  }

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingOrb} />
      <span>Loading memory…</span>
    </div>
  );
  if (!pet) return null;

  const photoUrl = pet.photo_url ? `http://localhost:8080${pet.photo_url}` : null;
  const activeColor = NODES.find(n => n.id === activeNode)?.color ?? "#7c6af7";
  const approxAge = pet.dob
    ? `${new Date().getFullYear() - new Date(pet.dob).getFullYear()} yr${new Date().getFullYear() - new Date(pet.dob).getFullYear() !== 1 ? "s" : ""}`
    : pet.approximate_age || null;

  return (
    <div className={styles.page}>
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoIcon}>🐾</span>
          <span className={styles.logoText}>PetMind</span>
        </div>

        {/* Back to pets */}
        <button
          className={styles.navItem}
          style={{ margin: "0 10px 8px", width: "auto" }}
          onClick={() => navigate("/")}
        >
          <span className={styles.navIcon}>⌂</span>
          <span className={styles.navLabel}>Home</span>
        </button>

        <div style={{ padding: "0 18px 8px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {pet.name}'s Profile
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.view}
              className={`${styles.navItem} ${view === item.view ? styles.navActive : ""}`}
              onClick={() => setView(item.view)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ margin: "0 10px 12px", padding: "8px 10px", borderRadius: 8, background: "rgba(124,106,247,0.08)", border: "1px solid rgba(124,106,247,0.15)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>Cognee</span>
          <span style={{ fontSize: 10, color: "#8b949e" }}>memory active</span>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>S</div>
          <span className={styles.userName}>suhani</span>
          <span className={styles.chevron}>▾</span>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate("/")}>
            ← Back to Pets
          </button>
          <button className={styles.notifBtn}>🔔</button>
        </div>

        {/* Pet header — always visible */}
        <div className={styles.petHeader}>
          <div className={styles.petHeaderLeft}>
            <div className={styles.petAvatarSmall}>
              {photoUrl
                ? <img src={photoUrl} alt={pet.name} />
                : <span style={{ fontSize: 22 }}>🐾</span>}
            </div>
            <div>
              <div className={styles.petNameRow}>
                <h1 className={styles.petName}>{pet.name}</h1>
                <button className={styles.editPen}>✏</button>
              </div>
              <div className={styles.petMeta}>
                {[pet.breed || pet.species, pet.gender, approxAge].filter(Boolean).join(" · ")}
              </div>
              <div className={styles.chips}>
                {pet.vaccinated === "Yes" && <span className={`${styles.chip} ${styles.chipBlue}`}>Vaccinated</span>}
                {(pet.conditions?.length === 0 || !pet.conditions) && <span className={`${styles.chip} ${styles.chipGreen}`}>Healthy</span>}
                {pet.weight_value && <span className={`${styles.chip} ${styles.chipGray}`}>{pet.weight_value} {pet.weight_unit}</span>}
                {(pet.allergies?.length > 0) && <span className={`${styles.chip} ${styles.chipRed}`}>⚠️ Allergies</span>}
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.addMemoryBtn}>+ Add Memory</button>
            <button className={styles.moreBtn}>⋯</button>
          </div>
        </div>

        {/* ── Ask view: MemorySphere + chat ───────────────────── */}
        {view === "ask" && (
          <>
            <div className={styles.heroWrapper}>
              <MemorySphere
                nodes={NODES}
                petName={pet.name}
                activeNode={activeNode}
                thinking={chatLoading}
                memCount={memCount}
              />
              <div className={styles.liveBadge}>
                <span className={styles.liveDot} />
                Live
              </div>
              <div style={{
                position: "absolute", top: 14, left: 14,
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(124,106,247,0.15)",
                border: "1px solid rgba(124,106,247,0.35)",
                borderRadius: 99, padding: "5px 12px",
                backdropFilter: "blur(8px)",
              }}>
                <span style={{ fontSize: 13 }}>🧠</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.04em" }}>Powered by Cognee</span>
              </div>
            </div>

            <div className={styles.chatSection}>
              <div className={styles.chatHeader}>
                <span className={styles.chatSpark}>✦</span>
                <span>Ask about {pet.name}</span>
              </div>

              <div className={styles.messages}>
                {messages.map((m, i) => (
                  <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.msgUser : styles.msgBot}`}>
                    {m.role === "bot" && (
                      <div className={styles.botAvatar}>
                        {photoUrl ? <img src={photoUrl} alt="" /> : "🐾"}
                      </div>
                    )}
                    <div className={styles.msgBubble}>
                      {m.text.split("\n").map((line, li) => <p key={li}>{line}</p>)}
                      {m.role === "bot" && m.cognee && (
                        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4, opacity: 0.7 }}>
                          <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600, letterSpacing: "0.04em" }}>⚡ Retrieved from Cognee memory graph</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className={`${styles.msg} ${styles.msgBot}`}>
                    <div className={styles.botAvatar}>{photoUrl ? <img src={photoUrl} alt="" /> : "🐾"}</div>
                    <div className={styles.msgBubble}><span className={styles.typing}><i/><i/><i/></span></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className={styles.suggestions}>
                {SUGGESTIONS(pet.name).map(s => (
                  <button key={s} className={styles.suggestionChip} onClick={() => sendMessage(s)}>
                    ✦ {s}
                  </button>
                ))}
                <button className={styles.refreshSuggestions}>↺</button>
              </div>

              <div className={styles.inputRow}>
                <button className={styles.micBtn}>🎙</button>
                <input
                  ref={inputRef}
                  className={styles.chatInput}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                  placeholder={`Type your question…`}
                />
                <button
                  className={styles.sendBtn}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || chatLoading}
                >
                  ▶
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Health Map view: Cognee knowledge graph ──────────── */}
        {view === "health-map" && (
          <div style={{ padding: "0 24px 24px" }}>
            {/* Cognee branding header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(124,106,247,0.12), rgba(167,139,250,0.06))",
              border: "1px solid rgba(124,106,247,0.25)",
              borderRadius: 14, padding: "18px 22px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #7c6af7, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>🧠</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e6edf3", display: "flex", alignItems: "center", gap: 8 }}>
                  Cognee Knowledge Graph
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>LIVE</span>
                </div>
                <div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>
                  {pet.name}'s health records are indexed as a semantic knowledge graph — powering memory recall and AI chat
                </div>
              </div>
            </div>

            {/* Node counts grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {NODES.map(n => {
                const count = memCount(n.id);
                return (
                  <div key={n.id} style={{
                    background: "#161b22", border: "1px solid #30363d",
                    borderRadius: 10, padding: "14px 16px",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 18 }}>{n.icon}</span>
                      <span style={{ fontSize: 11, color: "#8b949e", fontWeight: 500 }}>{n.label}</span>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: n.color, lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: 10, color: "#6e7681" }}>graph nodes</div>
                  </div>
                );
              })}
            </div>

            {/* How Cognee is used */}
            <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", marginBottom: 14 }}>How Cognee powers PetMind</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: "📥", step: "Ingest", desc: `${pet.name}'s full health record is uploaded as a rich text document to Cognee` },
                  { icon: "🕸", step: "Cognify", desc: "Cognee builds a semantic knowledge graph — extracting entities, relationships, and facts" },
                  { icon: "🔍", step: "Recall", desc: "Every chat query triggers a RAG search over the graph, retrieving the most relevant memory nodes" },
                  { icon: "💬", step: "Augment", desc: "Retrieved context is injected into Claude's prompt — making answers accurate and grounded" },
                ].map(({ icon, step, desc }) => (
                  <div key={step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: "rgba(124,106,247,0.1)",
                      border: "1px solid rgba(124,106,247,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>{step}</div>
                      <div style={{ fontSize: 12, color: "#8b949e", marginTop: 1 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini MemorySphere */}
            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", height: 320, background: "linear-gradient(135deg, #12102a 0%, #0f0d1f 40%, #0a0814 100%)", border: "1px solid rgba(124,106,247,0.15)" }}>
              <MemorySphere nodes={NODES} petName={pet.name} activeNode={null} thinking={false} memCount={memCount} />
              <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                Node sizes reflect Cognee graph entity counts
              </div>
            </div>
          </div>
        )}

        {/* ── Reminders ─────────────────────────────────────────── */}
        {view === "reminders" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
            <RemindersPanel petId={parseInt(id!)} />
          </div>
        )}

        {/* ── Insights ──────────────────────────────────────────── */}
        {view === "insights" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
            <InsightsPanel petId={parseInt(id!)} />
          </div>
        )}

        {/* ── Visit Prep ────────────────────────────────────────── */}
        {view === "visit-prep" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
            <VisitPrep petId={parseInt(id!)} petName={pet.name} />
          </div>
        )}

        {/* ── Records ───────────────────────────────────────────── */}
        {view === "records" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
            <RecordsView
              petId={parseInt(id!)}
              petName={pet.name}
              documents={pet.documents || []}
            />
          </div>
        )}
      </main>
    </div>
  );
}
