interface Document {
  id: number;
  original_name: string;
  doc_type: string;
  filename: string;
}

interface Props {
  petId: number;
  petName: string;
  documents: Document[];
}

const CARD: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #30363d",
  borderRadius: 10,
  padding: "14px 18px",
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  gap: 14,
};

function docIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("vaccine") || lower.includes("vacc")) return "💉";
  if (lower.includes("xray") || lower.includes("x-ray") || lower.includes("scan")) return "🩻";
  if (lower.includes("blood") || lower.includes("lab")) return "🧪";
  if (lower.includes("surgery") || lower.includes("dental")) return "🏥";
  if (lower.includes("prescription") || lower.includes("rx")) return "💊";
  return "📄";
}

export default function RecordsView({ petId, petName, documents }: Props) {
  return (
    <div style={{ color: "#e6edf3", padding: "0 4px" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#e6edf3", display: "flex", alignItems: "center", gap: 8 }}>
          <span>📁</span> Records
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8b949e" }}>
          Medical documents and files uploaded for {petName}
        </p>
      </div>

      {documents.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 0", color: "#8b949e",
          background: "#161b22", borderRadius: 10, border: "1px solid #30363d",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 14, marginBottom: 6 }}>No records uploaded yet</div>
          <div style={{ fontSize: 12, color: "#6e7681" }}>
            Upload discharge notes, lab results, or visit summaries when adding a pet.
          </div>
        </div>
      ) : (
        documents.map(doc => (
          <div key={doc.id} style={CARD}>
            <span style={{ fontSize: 26, flexShrink: 0 }}>{docIcon(doc.original_name)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#e6edf3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {doc.original_name}
              </div>
              <div style={{ fontSize: 12, color: "#8b949e", marginTop: 2, textTransform: "capitalize" }}>
                {doc.doc_type} record
              </div>
            </div>
            <a
              href={`http://localhost:8080${doc.filename}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "rgba(124,106,247,0.1)",
                border: "1px solid rgba(124,106,247,0.3)",
                borderRadius: 7,
                padding: "6px 12px",
                fontSize: 12,
                color: "#a78bfa",
                textDecoration: "none",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              View
            </a>
          </div>
        ))
      )}
    </div>
  );
}
