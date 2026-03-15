export default function RewriteCard({
  cardStyle,
  chipStyle,
  message,
  finalRewrite,
  riskScore,
  rewriteRiskScore,
  riskImprovement,
  rewriteTone,
  setRewriteTone,
  copyRewriteOnly,
  useRewriteMessage,
  copyState
}) {
  return (
    <div
      style={{
        ...cardStyle,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,247,237,0.98) 55%, rgba(255,237,213,0.92) 100%)",
        border: "1px solid rgba(251,146,60,0.28)",
        padding: "30px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#9a3412",
          fontWeight: 900,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        ✨ Better Version
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "14px",
          borderRadius: "12px",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.18)",
          display: "flex",
          gap: "18px",
          flexWrap: "wrap",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        <span>Your message risk: {riskScore}</span>
        <span>Rewrite risk: {rewriteRiskScore}</span>
        <span style={{ color: "#15803d", fontWeight: 800 }}>
          ↑ {riskImprovement} points safer
        </span>
      </div>

      <div style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: "rgba(248,250,252,0.9)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b" }}>
            YOUR MESSAGE
          </div>

          <div style={{ marginTop: "8px", fontSize: "18px" }}>
            "{message}"
          </div>
        </div>

        <div
          style={{
            padding: "18px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(251,146,60,0.25)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#9a3412" }}>
            BETTER VERSION
          </div>

          <div style={{ marginTop: "10px", fontSize: "22px", fontWeight: 700 }}>
            "{finalRewrite}"
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button onClick={copyRewriteOnly}>✍️ Copy rewrite</button>
        <button onClick={useRewriteMessage}>✏️ Use This Message</button>

        {copyState && (
          <div style={{ fontWeight: 700, color: "#2563eb" }}>
            ✓ {copyState}
          </div>
        )}
      </div>
    </div>
  );
}