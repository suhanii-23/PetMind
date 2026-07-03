import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { petsApi } from "../api/pets";
import MemorySphere from "../components/MemorySphere";
import styles from "./PetProfile.module.css";

// ── Graph node definitions ─────────────────────────────────────────────────
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

// ── Chat message type ──────────────────────────────────────────────────────
interface ChatMsg { role: "user" | "bot"; text: string; }

// ── Suggestion chips ───────────────────────────────────────────────────────
const SUGGESTIONS = (name: string) => [
  `What are ${name}'s allergies?`,
  `When was ${name} last vaccinated?`,
  `What food does ${name} eat?`,
  `Show ${name}'s medications`,
];

// ── Component ──────────────────────────────────────────────────────────────
export default function PetProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [dogTilt, setDogTilt] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tiltTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!id) return;
    petsApi.get(parseInt(id)).then(p => {
      setPet(p);
      setMessages([{
        role: "bot",
        text: `Hi! I'm ${p.name}'s memory assistant. Ask me anything about ${p.name === "Bella" || p.name === "Mango" ? "her" : "him"}.`,
      }]);
    }).catch(() => navigate("/")).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const triggerTilt = useCallback(() => {
    setDogTilt(1);
    clearTimeout(tiltTimer.current);
    tiltTimer.current = setTimeout(() => setDogTilt(0), 2000);
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || chatLoading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setChatLoading(true);
    triggerTilt();
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
      setMessages(m => [...m, { role: "bot", text: reply }]);
      if (data.category && data.category !== "general") {
        setActiveNode(data.category);
        setTimeout(() => setActiveNode(null), 3000);
      }
    } catch {
      setMessages(m => [...m, { role: "bot", text: "Sorry, I had trouble reaching my memory. Try again." }]);
    }
    setChatLoading(false);
  }

  // ── Memory counts from pet data ──────────────────────────────────────────
  function memCount(nodeId: string): number {
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
        <nav className={styles.nav}>
          {[
            { icon: "⌂", label: "Home", path: "/" },
            { icon: "🐾", label: "Pets", path: "/", active: true },
            { icon: "⏱", label: "Timeline" },
            { icon: "❤", label: "Health" },
            { icon: "🧠", label: "Memories" },
            { icon: "✦", label: "Insights" },
            { icon: "☰", label: "Documents" },
            { icon: "⚙", label: "Settings" },
          ].map(item => (
            <button
              key={item.label}
              className={`${styles.navItem} ${item.active ? styles.navActive : ""}`}
              onClick={() => item.path && navigate(item.path)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
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

        {/* ── Memory Sphere Hero ───────────────────────────────── */}
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
        </div>

        {/* ── Chatbot ───────────────────────────────────────── */}
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

          {/* Suggestion chips */}
          <div className={styles.suggestions}>
            {SUGGESTIONS(pet.name).map(s => (
              <button key={s} className={styles.suggestionChip} onClick={() => sendMessage(s)}>
                ✦ {s}
              </button>
            ))}
            <button className={styles.refreshSuggestions}>↺</button>
          </div>

          {/* Input */}
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
      </main>
    </div>
  );
}
