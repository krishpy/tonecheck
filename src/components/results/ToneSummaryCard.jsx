export default function ToneSummaryCard({
  toneTheme,
  getToneLabel,
  getToneEmoji,
  riskScore,
  sendVerdict,
  primaryHiddenSignalLabel,
}) {
  return (
    <section
      className="tc-glow-card"
      style={{
        background: toneTheme.bg,
        border: `1px solid ${toneTheme.border}`,
        borderRadius: "30px",
        padding: "24px",
        boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Tone Summary
          </div>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "18px",
                display: "grid",
                placeItems: "center",
                background: toneTheme.iconBg,
                color: "#fff",
                fontSize: "28px",
                boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
              }}
            >
              {getToneEmoji()}
            </div>

            <div>
              <div
                style={{
                  fontSize: "32px",
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  color: "#111827",
                }}
              >
                {getToneLabel()}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "15px",
                  color: "#475569",
                }}
              >
                This is how your message is likely to come across.
              </div>
            </div>
          </div>
        </div>

            <div
            style={{
              minWidth: "200px",
              padding: "16px 18px",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <div
              title="The quick overall read of how this message may land."
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#64748b",
                cursor: "help",
              }}
            >
              How it sounds
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "22px",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              {sendVerdict?.emoji} {sendVerdict?.label}
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "14px",
                color: "#64748b",
              }}
            >
              Intensity: <strong style={{ color: "#111827" }}>{riskScore}/100</strong>
            </div>
          </div>

      </div>

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div
          title="The strongest communication pattern detected."
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(15,23,42,0.06)",
            fontSize: "13px",
            color: "#334155",
            cursor: "help",
          }}
        >
          Main signal: <strong>{String(primaryHiddenSignalLabel || "none").replaceAll("_", " ")}</strong>
        </div>
      </div>
    </section>
  );
}