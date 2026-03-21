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
  rewriteIntro,
  whatsappIcon,
}) {
  const isMobile = useIsMobile();

  if (!finalRewrite && !rewriteloading) return null;

  const actionButtonBase = {
    width: isMobile ? "100%" : "auto",
    justifyContent: "center",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <div
      style={{
        ...cardStyle,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,247,237,0.98))",
        border: "1px solid rgba(251,146,60,0.18)",
        boxShadow:
          "0 16px 40px rgba(15,23,42,0.05), 0 1px 0 rgba(255,255,255,0.72) inset",
        display: "grid",
        gap: "16px",
        padding: isMobile ? "14px" : "20px",
      }}
    >
      <div style={{ display: "grid", gap: "8px" }}>
        <div
  style={{
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#c2410c",
  }}
>
  Better version to send
</div>
</div>

<div
  style={{
    marginTop: "10px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  }}
>
  {["balanced", "softer", "direct", "professional"].map((style) => {
    const isActive = rewriteTone === style;
    return (
      <button
        key={style}
        onClick={() => setRewriteTone(style)}
        style={{
          padding: "8px 14px",
          borderRadius: "999px",
          border: isActive
            ? "1px solid #6366f1"
            : "1px solid rgba(0,0,0,0.08)",
          background: isActive
            ? "rgba(99,102,241,0.12)"
            : "rgba(255,255,255,0.7)",
          color: isActive ? "#4338ca" : "#374151",
          fontWeight: 700,
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {style.charAt(0).toUpperCase() + style.slice(1)}
      </button>
    );
  })}
</div>



      <div
        style={{
          borderRadius: "24px",
          padding: isMobile ? "16px" : "22px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,251,235,0.98))",
          border: "1px solid rgba(251,146,60,0.16)",
          minHeight: isMobile ? "120px" : "140px",
          display: "flex",
          alignItems: "center",
          boxShadow:
            "0 10px 28px rgba(251,146,60,0.06), inset 0 1px 0 rgba(255,255,255,0.80)",
        }}
      >
        {rewriteloading ? (
          <div
            style={{
              color: "#64748b",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            Rewriting...
          </div>
        ) : (
          <div
            style={{
              color: "#111827",
              fontSize: isMobile ? "20px" : "28px",
              lineHeight: 1.7,
              fontWeight: 800,
              whiteSpace: "pre-wrap",
              letterSpacing: "-0.02em",
            }}
          >
            “{finalRewrite}”
          </div>
        )}
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
            ...actionButtonBase,
            padding: "15px 20px",
            borderRadius: "16px",
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
          onClick={sendRewriteWhatsApp}
          style={{
            ...actionButtonBase,
            padding: "15px 18px",
            borderRadius: "16px",
            border: "1px solid rgba(34,197,94,0.16)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "15px",
            background: "rgba(240,253,244,0.95)",
            color: "#166534",
            boxShadow: "0 8px 22px rgba(34,197,94,0.08)",
          }}
        >
          {whatsappIcon}
          <span>Send on WhatsApp</span>
        </button>

        <button
          type="button"
          className="tc-button-hover"
          onClick={copyRewriteOnly}
          style={{
            ...actionButtonBase,
            padding: "15px 18px",
            borderRadius: "16px",
            border: "1px solid rgba(15,23,42,0.08)",
            cursor: "pointer",
            fontWeight: 750,
            fontSize: "15px",
            background: "rgba(255,255,255,0.90)",
            color: "#111827",
            boxShadow: "0 8px 22px rgba(15,23,42,0.05)",
          }}
        >
          Copy
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

      <div style={{ display: "grid", gap: "10px" }}>
       

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
                  padding: isMobile ? "9px 12px" : "10px 14px",
                  fontSize: "14px",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(236,72,153,0.10))"
                    : "rgba(255,255,255,0.82)",
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
    </div>
  );
}