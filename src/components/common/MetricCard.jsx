import React from "react";

export default function MetricCard({ label, value, accent, explanation }) {
  const [showTip, setShowTip] = React.useState(false);

  return (
    <div
      className="tc-chip-hover"
      style={{
        padding: "16px 18px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(15,23,42,0.05)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>{label}</span>
        <span
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          style={{
            fontSize: "12px",
            cursor: "help",
            opacity: 0.65,
            userSelect: "none",
          }}
        >
          ⓘ
        </span>
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "28px",
          fontWeight: 850,
          letterSpacing: "-0.04em",
          color: accent,
        }}
      >
        {value}
      </div>

      {showTip && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "10px",
            transform: "translateY(-100%)",
            background: "rgba(15,23,42,0.96)",
            color: "#fff",
            fontSize: "12px",
            lineHeight: 1.45,
            padding: "10px 12px",
            borderRadius: "12px",
            width: "210px",
            boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
            zIndex: 20,
          }}
        >
          {explanation}
        </div>
      )}
    </div>
  );
}