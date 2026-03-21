import React from "react";
import useIsMobile from "../../hooks/useIsMobile";

const TONE_OPTIONS = [
  { value: "balanced", label: "Balanced" },
  { value: "softer", label: "Softer" },
  { value: "more_direct", label: "More Direct" },
];

export default function RewriteCard({
  cardStyle,
  chipStyle,
  finalRewrite,
  rewriteTone,
  rewriteloading,
  setRewriteTone,
  copyRewriteOnly,
  useRewriteMessage,
  sendRewriteWhatsApp,
  copyState,
  whatsappIcon,
}) {
  if (!finalRewrite && !rewriteloading) return null;

  const isMobile = useIsMobile();

  return (
    <div
      style={{
        ...cardStyle,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,247,237,0.98))",
        border: "1px solid rgba(251,146,60,0.16)",
        boxShadow:
          "0 12px 32px rgba(15,23,42,0.05), 0 1px 0 rgba(255,255,255,0.7) inset",
        display: "grid",
        gap: "18px",
      }}
    >
      <div style={{ display: "grid", gap: "8px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9a3412",
          }}
        >
          Suggested rewrite
        </div>

        <div
          style={{
            color: "#64748b",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Cleaner, calmer, and easier to receive.
        </div>
      </div>

      <div
        style={{
          borderRadius: "22px",
          padding: "18px",
          background: "rgba(255,255,255,0.88)",
          border: "1px solid rgba(15,23,42,0.06)",
          minHeight: "112px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {rewriteloading ? (
          <div
            style={{
              color: "#64748b",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            Rewriting...
          </div>
        ) : (
          <div
            style={{
              color: "#111827",
              fontSize: isMobile ? "20px" : "26px",
              lineHeight: 1.7,
              fontWeight: 700,
              whiteSpace: "pre-wrap",
            }}
          >
            “{finalRewrite}”
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "#64748b",
            textTransform: "uppercase",
          }}
        >
          Change the style
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {TONE_OPTIONS.map((option) => {
            const isActive = rewriteTone === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className="tc-button-hover"
                onClick={() => setRewriteTone(option.value)}
                style={{
                  ...chipStyle,
                  padding: "10px 14px",
                  fontSize: "14px",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(236,72,153,0.10))"
                    : "rgba(255,255,255,0.78)",
                  color: isActive ? "#312e81" : "#334155",
                  border: isActive
                    ? "1px solid rgba(99,102,241,0.22)"
                    : "1px solid rgba(15,23,42,0.08)",
                  boxShadow: isActive
                    ? "0 10px 24px rgba(99,102,241,0.10)"
                    : "0 4px 14px rgba(15,23,42,0.04)",
                  fontWeight: isActive ? 800 : 700,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          className="tc-button-hover"
          onClick={useRewriteMessage}
          style={{
            padding: "15px 20px",
            borderRadius: "16px",
            width: isMobile ? "100%" : "auto",
             justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.26)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "15px",
            color: "#ffffff",
            background:
              "linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)",
            boxShadow:
              "0 14px 34px rgba(34,197,94,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          Use This Message
        </button>

        <button
          type="button"
          className="tc-button-hover"
          onClick={copyRewriteOnly}
          style={{
            padding: "15px 18px",
            borderRadius: "16px",
            width: isMobile ? "100%" : "auto",
justifyContent: "center",
            border: "1px solid rgba(15,23,42,0.08)",
            cursor: "pointer",
            fontWeight: 750,
            fontSize: "15px",
            background: "rgba(255,255,255,0.86)",
            color: "#111827",
            boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
          }}
        >
          Copy
        </button>

        <button
          type="button"
          className="tc-button-hover"
          onClick={sendRewriteWhatsApp}
          style={{
            padding: "15px 18px",
            borderRadius: "16px",
            width: isMobile ? "100%" : "auto",
justifyContent: "center",
            border: "1px solid rgba(34,197,94,0.16)",
            cursor: "pointer",
            fontWeight: 750,
            fontSize: "15px",
            background: "rgba(240,253,244,0.95)",
            color: "#166534",
            boxShadow: "0 8px 22px rgba(34,197,94,0.08)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {whatsappIcon}
          <span>Send on WhatsApp</span>
        </button>

        <div
          style={{
            minHeight: "20px",
            color: copyState ? "#2563eb" : "#94a3b8",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {copyState === "Rewrite copied" ? copyState : ""}
        </div>
      </div>
    </div>
  );
}