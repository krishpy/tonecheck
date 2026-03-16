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
            background: "rgba(248,250,252,0.88)",
            border: "1px solid rgba(15,23,42,0.06)",
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
            Before
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "18px",
              lineHeight: 1.65,
              color: "#334155",
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
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
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
                ✨ Send this instead
              </div>

              <div
                title="This rewrite is less likely to create tension."
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(251,146,60,0.18)",
                  color: "#d97706",
                  fontSize: "13px",
                  cursor: "help",
                }}
              >
                💡
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "999px",
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.18)",
                color: "#15803d",
                fontSize: "14px",
                fontWeight: 800,
                boxShadow: "0 0 0 rgba(34,197,94,0)",
                animation: "tc-safer-pop 1.6s ease-out",
              }}
            >
              <span style={{ fontSize: "15px" }}>↑</span>
              <span>{riskImprovement} points safer</span>
              <span style={{ fontSize: "14px", animation: "tc-safer-sparkle 1.2s ease-out" }}>
                ✨
              </span>
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