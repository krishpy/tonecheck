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
  <button
    onClick={() => {
      if (!finalRewrite) return;
      window.open(
        `https://wa.me/?text=${encodeURIComponent(finalRewrite)}`,
        "_blank"
      );
    }}
    className="tc-button-hover"
    style={{
      padding: "16px 22px",
      borderRadius: "18px",
      border: "1px solid rgba(255,255,255,0.28)",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: "15px",
      color: "#ffffff",
      background:
        "linear-gradient(135deg, #16a34a 0%, #22c55e 45%, #4ade80 100%)",
      boxShadow:
        "0 12px 28px rgba(34,197,94,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
    }}
  >
    Send via WhatsApp
  </button>

  <button
    onClick={copyRewriteOnly}
    className="tc-button-hover"
    style={{
      padding: "15px 22px",
      borderRadius: "18px",
      border: "1px solid rgba(15,23,42,0.12)",
      cursor: "pointer",
      fontWeight: 750,
      fontSize: "15px",
      background: "rgba(255,255,255,0.9)",
      color: "#111827",
      boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    }}
  >
    ✍️ Copy rewrite
  </button>

  <button
    onClick={useRewriteMessage}
    className="tc-button-hover"
    style={{
      padding: "16px 22px",
      borderRadius: "18px",
      border: "1px solid rgba(255,255,255,0.28)",
      cursor: "pointer",
      fontWeight: 900,
      fontSize: "15px",
      color: "#ffffff",
      background:
        "linear-gradient(135deg, #111827 0%, #4338ca 45%, #7c3aed 72%, #ec4899 100%)",
      boxShadow:
        "0 16px 36px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.22)",
    }}
  >
    ✏️ Use This Message
  </button>

  {copyState && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontWeight: 700,
        color: "#2563eb",
      }}
    >
      ✓ {copyState}
    </div>
  )}
</div>
    </div>
  );
}