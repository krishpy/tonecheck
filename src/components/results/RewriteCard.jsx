const rewriteOptions = [
  { value: "balanced", label: "Balanced" },
  { value: "softer", label: "Softer" },
  { value: "warmer", label: "Warmer" },
  { value: "professional", label: "Professional" },
  { value: "direct", label: "More Direct" },
];

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
  copyState,
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
      <div style={{ display: "grid", gap: "16px" }}>
        <div
          style={{
           padding: "16px",
            borderRadius: "16px",
            background: "rgba(254,226,226,0.55)",
            border: "1px solid rgba(239,68,68,0.20)",
            boxShadow: "0 6px 18px rgba(239,68,68,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            ⚠️ Original message
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "18px",
              lineHeight: 1.65,
              color: "#7f1d1d",
              fontWeight: 600,
            }}
          >
            “{message}”
          </div>
        </div>

        <div
          style={{
            padding: "20px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(251,146,60,0.24)",
            boxShadow: "0 10px 24px rgba(251,146,60,0.06)",
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
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 900,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "#9a3412",
                  }}
                >
                  ✨ Try saying it like this
                </div>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Less likely to create tension
              </div>

              <div
  style={{
    marginTop: "14px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  {rewriteOptions.map((option) => {
    const active = rewriteTone === option.value;

    return (
      <button
      type="button"
        key={option.value}
        className="tc-chip-hover"
        onClick={() => setRewriteTone(option.value)}
        style={{
          ...chipStyle,
          padding: "10px 14px",
          fontSize: "13px",
          fontWeight: 800,
          background: active ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.82)",
          color: active ? "#4338ca" : "#111827",
          border: active
            ? "1px solid rgba(99,102,241,0.24)"
            : "1px solid rgba(15,23,42,0.08)",
          boxShadow: active
            ? "0 8px 20px rgba(99,102,241,0.10)"
            : "0 4px 12px rgba(15,23,42,0.04)",
        }}
      >
        {option.label}
      </button>
    );
  })}
</div>

              

              <div
                style={{
                  marginTop: "12px",
                  fontSize: "30px",
                  fontWeight: 800,
                  lineHeight: 1.45,
                  letterSpacing: "-0.03em",
                  color: "#111827",
                }}
              >
                “{finalRewrite}”
              </div>
            </div>

            {riskImprovement > 8 && (
              <div
                title={`${riskImprovement} points safer than the original message`}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "999px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(134,239,172,0.28))",
                  border: "1px solid rgba(34,197,94,0.30)",
                  color: "#15803d",
                  fontWeight: 900,
                  boxShadow: "0 10px 28px rgba(34,197,94,0.16)",
                  animation: "tc-safer-pop 0.7s ease-out",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                  }}
                >
                  ↑{riskImprovement}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    opacity: 0.8,
                    marginTop: "2px",
                  }}
                >
                  safer
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
         type="button"
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

        <button
        type="button"
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
        type="button"
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