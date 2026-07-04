import { useState } from "react";

interface Props {
  petId: number;
  petName: string;
}

const CARD: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #30363d",
  borderRadius: 10,
  padding: "16px 20px",
  marginBottom: 12,
};

export default function VisitPrep({ petId, petName }: Props) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [concern, setConcern] = useState("");

  async function generate() {
    setLoading(true);
    setSummary("");
    setGenerated(false);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/pets/${petId}/visit-prep`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ concern }),
      });
      const data = await res.json();
      setSummary(data.summary || "Could not generate summary.");
      setGenerated(true);
    } catch {
      setSummary("Error generating summary. Please try again.");
      setGenerated(true);
    }
    setLoading(false);
  }

  return (
    <div style={{ color: "#e6edf3", padding: "0 4px" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#e6edf3", display: "flex", alignItems: "center", gap: 8 }}>
          <span>📋</span> Visit Prep
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8b949e" }}>
          AI-powered pre-visit summary for {petName}'s next vet appointment
        </p>
      </div>

      <div style={CARD}>
        <label style={{ fontSize: 13, color: "#8b949e", display: "block", marginBottom: 8 }}>
          Any specific concern for this visit? (optional)
        </label>
        <input
          value={concern}
          onChange={e => setConcern(e.target.value)}
          placeholder={`e.g. ${petName} has been scratching a lot lately`}
          style={{
            width: "100%",
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            color: "#e6edf3",
            outline: "none",
            boxSizing: "border-box",
          }}
          onKeyDown={e => e.key === "Enter" && generate()}
        />
        <button
          onClick={generate}
          disabled={loading}
          style={{
            marginTop: 12,
            background: loading ? "#21262d" : "linear-gradient(135deg, #7c6af7, #9d8dfa)",
            color: loading ? "#8b949e" : "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
          }}
        >
          {loading ? "Generating…" : "Generate Visit Summary"}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#8b949e" }}>
          <div style={{
            width: 28, height: 28, border: "3px solid #30363d",
            borderTopColor: "#7c6af7", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Analyzing {petName}'s health records…
        </div>
      )}

      {generated && !loading && (
        <div style={CARD}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span>✦</span> Pre-Visit Summary for {petName}
          </div>
          {summary.split("\n").filter(Boolean).map((line, i) => {
            const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
            const isHeader = line.endsWith(":") || line.startsWith("**");
            const clean = line.replace(/\*\*/g, "").replace(/^[-•*]\s*/, "");
            return (
              <div key={i} style={{
                fontSize: 13.5,
                color: isHeader ? "#e6edf3" : "#c9d1d9",
                fontWeight: isHeader ? 600 : 400,
                marginBottom: isBullet ? 6 : isHeader ? 10 : 4,
                paddingLeft: isBullet ? 12 : 0,
                display: "flex",
                gap: isBullet ? 6 : 0,
                lineHeight: 1.6,
              }}>
                {isBullet && <span style={{ color: "#7c6af7", flexShrink: 0 }}>•</span>}
                {clean}
              </div>
            );
          })}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #21262d", fontSize: 12, color: "#8b949e", fontStyle: "italic" }}>
            Share this summary with your vet at the start of the appointment.
          </div>
        </div>
      )}
    </div>
  );
}
