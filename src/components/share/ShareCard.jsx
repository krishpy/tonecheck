import React from "react";

function getShareMode({ risk, hiddenSignal, tone }) {
  const hidden = String(hiddenSignal || "").toLowerCase();
  const toneLabel = String(tone || "").toLowerCase();

  if (
    risk >= 70 ||
    hidden.includes("threat") ||
    hidden.includes("hostile") ||
    hidden.includes("insult") ||
    hidden.includes("profanity") ||
    toneLabel.includes("threat")
  ) {
    return {
      eyebrow: "YOU ALMOST SENT THIS",
      title: "ToneCheck",
      outcomeLabel: "Likely outcome",
      outcomeValue: "Conflict or escalation",
      rewriteLabel: "BETTER VERSION",
      accent: "#dc2626",
      rewriteBorder: "rgba(251,146,60,0.18)",
      rewriteBg:
        "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(255,247,237,0.96))",
    };
  }

  if (risk >= 40 || hidden.includes("pressure") || hidden.includes("passive")) {
    return {
      eyebrow: "THIS MIGHT BACKFIRE",
      title: "ToneCheck",
      outcomeLabel: "Likely outcome",
      outcomeValue: "Misunderstanding or defensiveness",
      rewriteLabel: "SMOOTHER VERSION",
      accent: "#d97706",
      rewriteBorder: "rgba(245,158,11,0.18)",
      rewriteBg:
        "linear-gradient(135deg, rgba(255,251,235,0.96), rgba(255,255,255,0.94))",
    };
  }

  return {
    eyebrow: "THIS LOOKS GOOD",
    title: "ToneCheck",
    outcomeLabel: "Likely outcome",
    outcomeValue: "Clear and safe delivery",
    rewriteLabel: "POLISHED VERSION",
    accent: "#16a34a",
    rewriteBorder: "rgba(34,197,94,0.18)",
    rewriteBg:
      "linear-gradient(135deg, rgba(240,253,244,0.96), rgba(255,255,255,0.94))",
  };
}

export default function ShareCard({
  toolTitle,
  message,
  rewrite,
  tone,
  risk,
  hiddenSignal,
  showSignalChip = true,
}) {
  const shareMode = getShareMode({ risk, hiddenSignal, tone });

  return (
    <div
      id="tone-share-card"
      style={{
        width: "1080px",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2ff 52%, #f5f3ff 100%)",
        padding: "40px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(255,255,255,0.82)",
          borderRadius: "32px",
          padding: "32px",
          boxShadow:
            "0 18px 46px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
          }}
        >
          <div style={{ maxWidth: "760px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 900,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: shareMode.accent,
              }}
            >
              {shareMode.eyebrow}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "44px",
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: "-0.06em",
                background:
                  "linear-gradient(135deg, #0f172a 0%, #312e81 30%, #7c3aed 62%, #ec4899 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {toolTitle || "ToneCheck"}
            </div>
          </div>

          {showSignalChip && hiddenSignal ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(15,23,42,0.08)",
                color: "#334155",
                fontWeight: 800,
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              {hiddenSignal}
            </div>
          ) : null}
        </div>

        <div
          style={{
            marginTop: "26px",
            borderRadius: "24px",
            padding: "22px",
            background: "rgba(255,255,255,0.84)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#64748b",
            }}
          >
            MESSAGE
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "28px",
              lineHeight: 1.6,
              color: "#111827",
              whiteSpace: "pre-wrap",
            }}
          >
            {message}
          </div>
        </div>

        <div
          style={{
            marginTop: "18px",
            display: "flex",
            gap: "14px",
          }}
        >
          <div
            style={{
              flex: 1,
              borderRadius: "20px",
              padding: "18px 20px",
              background: "rgba(248,250,252,0.9)",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#64748b",
              }}
            >
              TONE
            </div>
            <div
              style={{
                marginTop: "8px",
                fontSize: "22px",
                fontWeight: 850,
                color: "#111827",
              }}
            >
              {tone || "Neutral"}
            </div>
          </div>

          <div
            style={{
              flex: 1.3,
              borderRadius: "20px",
              padding: "18px 20px",
              background: "rgba(248,250,252,0.9)",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#64748b",
              }}
            >
              {shareMode.outcomeLabel}
            </div>
            <div
              style={{
                marginTop: "8px",
                fontSize: "22px",
                fontWeight: 850,
                color: "#111827",
              }}
            >
              {shareMode.outcomeValue}
            </div>
          </div>
        </div>

        {rewrite ? (
          <div
            style={{
              marginTop: "22px",
              borderRadius: "24px",
              padding: "22px",
              background: shareMode.rewriteBg,
              border: `1px solid ${shareMode.rewriteBorder}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#9a3412",
              }}
            >
              {shareMode.rewriteLabel}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "26px",
                lineHeight: 1.7,
                color: "#111827",
                whiteSpace: "pre-wrap",
              }}
            >
              {rewrite}
            </div>
          </div>
        ) : null}

        <div
          style={{
            marginTop: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ color: "#64748b", fontSize: "18px" }}>
            Check yours at trytonecheck.com
          </div>

          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#312e81",
            }}
          >
            T✓ ToneCheck
          </div>
        </div>
      </div>
    </div>
  );
}