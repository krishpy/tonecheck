export default function ToneSummaryCard({
  cardStyle,
  toneTheme,
  getToneLabel,
  getToneEmoji,
  riskScore,
  sendVerdict,
  primaryHiddenSignalLabel,
  getMeterWidth,
  getMeterColor,
  getToneAccent,
}) {
  return (
    <div
      className="tc-glow-card"
      style={{
        ...cardStyle,
        padding: "26px",
        background: toneTheme.bg,
        border: `1px solid ${toneTheme.border}`,
        boxShadow: `0 12px 34px ${toneTheme.glow}, 0 1px 0 rgba(255,255,255,0.7) inset`,
        backgroundSize: "200% 200%",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          fontWeight: 800,
          letterSpacing: "0.08em",
        }}
      >
        TONE SUMMARY
      </div>

      <div
        style={{
          marginTop: "14px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          fontSize: "15px",
          color: "#334155",
        }}
      >
        <span>
          <strong>{getToneLabel()}</strong> {getToneEmoji()}
        </span>
        <span>•</span>
        <span>
          <strong>Risk:</strong> {riskScore}/100
        </span>
        <span>•</span>
        <span>
          <strong>{sendVerdict.label}</strong>
        </span>
        <span>•</span>
        <span>{primaryHiddenSignalLabel}</span>
      </div>

      <div style={{ marginTop: "22px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            color: "#475569",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <span>Overall Risk</span>
          <span>{riskScore}/100</span>
        </div>

        <div
          style={{
            width: "100%",
            height: "18px",
            background:
              "linear-gradient(180deg, rgba(226,232,240,0.78), rgba(241,245,249,0.9))",
            borderRadius: "999px",
            overflow: "hidden",
            boxShadow: "inset 0 2px 6px rgba(15,23,42,0.06)",
          }}
        >
          <div
            className="tc-shimmer"
            style={{
              width: getMeterWidth(riskScore),
              height: "100%",
              background: getMeterColor(riskScore),
              boxShadow: `0 0 26px ${getToneAccent(riskScore)}66`,
              transition: "width 0.4s ease",
              borderRadius: "999px",
            }}
          />
        </div>
      </div>
    </div>
  );
}