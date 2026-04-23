import React from "react";

function getToneConfig(tone = "", risk = 0) {
  const t = String(tone || "").toLowerCase();

  if (t.includes("threat") || risk >= 85) {
    return {
      emoji: "🚨",
      title: "Threatening",
      subtitle: "Severe intensity",
      bg: "linear-gradient(180deg, #fff1f2 0%, #ffffff 100%)",
      border: "#fecdd3",
      iconBg: "#fda4af",
      iconFg: "#b91c1c",
      chipBg: "#ffe4e6",
      chipFg: "#be123c",
    };
  }

  if (t.includes("aggressive") || risk >= 70) {
    return {
      emoji: "😡",
      title: "Aggressive",
      subtitle: "High intensity",
      bg: "linear-gradient(180deg, #fff1f2 0%, #ffffff 100%)",
      border: "#fecdd3",
      iconBg: "#fbcfe8",
      iconFg: "#dc2626",
      chipBg: "#ffe4e6",
      chipFg: "#e11d48",
    };
  }

  if (t.includes("passive")) {
    return {
      emoji: "😒",
      title: "Passive aggressive",
      subtitle: "Indirect tension",
      bg: "linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)",
      border: "#e9d5ff",
      iconBg: "#e9d5ff",
      iconFg: "#7c3aed",
      chipBg: "#f3e8ff",
      chipFg: "#7e22ce",
    };
  }

  if (t.includes("frustrated") || t.includes("tense") || risk >= 40) {
    return {
      emoji: "😬",
      title: tone || "Tense",
      subtitle: "Moderate intensity",
      bg: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)",
      border: "#fde68a",
      iconBg: "#fde68a",
      iconFg: "#d97706",
      chipBg: "#fef3c7",
      chipFg: "#b45309",
    };
  }

  return {
    emoji: "🙂",
    title: tone || "Neutral",
    subtitle: "Low intensity",
    bg: "linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)",
    border: "#bbf7d0",
    iconBg: "#bbf7d0",
    iconFg: "#15803d",
    chipBg: "#dcfce7",
    chipFg: "#166534",
  };
}

function getOutcomeConfig(risk = 0, tone = "") {
  const t = String(tone || "").toLowerCase();

  if (t.includes("threat") || risk >= 85) {
    return {
      title: "Conflict or escalation",
      subtitle: "Very high chance",
      bg: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)",
      border: "#fed7aa",
      iconBg: "#fde68a",
      iconFg: "#c2410c",
      chipBg: "#ffedd5",
      chipFg: "#c2410c",
      emoji: "⚠️",
    };
  }

  if (t.includes("aggressive") || risk >= 70) {
    return {
      title: "Conflict or escalation",
      subtitle: "High chance",
      bg: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)",
      border: "#fed7aa",
      iconBg: "#fde68a",
      iconFg: "#c2410c",
      chipBg: "#ffedd5",
      chipFg: "#d97706",
      emoji: "⚠️",
    };
  }

  if (risk >= 40) {
    return {
      title: "May create defensiveness",
      subtitle: "Medium chance",
      bg: "linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)",
      border: "#fde68a",
      iconBg: "#fde68a",
      iconFg: "#a16207",
      chipBg: "#fef3c7",
      chipFg: "#a16207",
      emoji: "⚠️",
    };
  }

  return {
    title: "Likely to land well",
    subtitle: "Low chance of conflict",
    bg: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
    border: "#bbf7d0",
    iconBg: "#bbf7d0",
    iconFg: "#166534",
    chipBg: "#dcfce7",
    chipFg: "#166534",
    emoji: "✅",
  };
}

function getSignalConfig(hiddenSignal = "") {
  const value = String(hiddenSignal || "").trim();
  const lower = value.toLowerCase();

  if (!value || lower === "none" || lower === "none detected") {
    return {
      title: "None detected",
      subtitle: "No clear hidden signal",
      bg: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
      border: "#bbf7d0",
      iconBg: "#d1fae5",
      iconFg: "#15803d",
      chipBg: "#dcfce7",
      chipFg: "#15803d",
      emoji: "🌿",
    };
  }

  if (lower.includes("shock") || lower.includes("disrespect")) {
    return {
      title: value,
      subtitle: "Provokes, not connects",
      bg: "linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)",
      border: "#e9d5ff",
      iconBg: "#e9d5ff",
      iconFg: "#7c3aed",
      chipBg: "#f3e8ff",
      chipFg: "#7e22ce",
      emoji: "👁️",
    };
  }

  if (lower.includes("pressure") || lower.includes("guilt")) {
    return {
      title: value,
      subtitle: "May feel emotionally heavy",
      bg: "linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)",
      border: "#e9d5ff",
      iconBg: "#e9d5ff",
      iconFg: "#7c3aed",
      chipBg: "#f3e8ff",
      chipFg: "#7e22ce",
      emoji: "👁️",
    };
  }

  return {
    title: value,
    subtitle: "Could change how this lands",
    bg: "linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)",
    border: "#e9d5ff",
    iconBg: "#e9d5ff",
    iconFg: "#7c3aed",
    chipBg: "#f3e8ff",
    chipFg: "#7e22ce",
    emoji: "👁️",
  };
}

function getDecisionConfig(risk = 0, tone = "") {
  const t = String(tone || "").toLowerCase();

  if (t.includes("threat") || risk >= 85) {
    return {
      title: "Do not send",
      subtitle: "Severe risk to relationship",
      bg: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
      border: "#bbf7d0",
      iconBg: "#bbf7d0",
      iconFg: "#15803d",
      chipBg: "#dcfce7",
      chipFg: "#15803d",
      emoji: "🛩️",
    };
  }

  if (t.includes("aggressive") || risk >= 70) {
    return {
      title: "Not recommended",
      subtitle: "High risk to relationship",
      bg: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
      border: "#bbf7d0",
      iconBg: "#bbf7d0",
      iconFg: "#15803d",
      chipBg: "#dcfce7",
      chipFg: "#15803d",
      emoji: "🛩️",
    };
  }

  if (risk >= 40) {
    return {
      title: "Send after softening",
      subtitle: "A calmer version is better",
      bg: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
      border: "#bbf7d0",
      iconBg: "#bbf7d0",
      iconFg: "#15803d",
      chipBg: "#dcfce7",
      chipFg: "#15803d",
      emoji: "🛩️",
    };
  }

  return {
    title: "Safe to send",
    subtitle: "Low risk to relationship",
    bg: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
    border: "#bbf7d0",
    iconBg: "#bbf7d0",
    iconFg: "#15803d",
    chipBg: "#dcfce7",
    chipFg: "#15803d",
    emoji: "🛩️",
  };
}

function getPunchLine({ risk, hiddenSignal, tone }) {
  const hidden = String(hiddenSignal || "").toLowerCase();
  const toneLabel = String(tone || "").toLowerCase();

  if (
    risk >= 75 ||
    hidden.includes("threat") ||
    hidden.includes("hostile") ||
    hidden.includes("insult") ||
    hidden.includes("profanity") ||
    toneLabel.includes("threat")
  ) {
    return "This could escalate fast.";
  }

  if (
    hidden.includes("accus") ||
    toneLabel.includes("accusatory") ||
    hidden.includes("blame")
  ) {
    return "Most arguments start like this.";
  }

  if (
    hidden.includes("passive") ||
    hidden.includes("pressure") ||
    hidden.includes("guilt")
  ) {
    return "This can create pressure without sounding obvious.";
  }

  if (
    toneLabel.includes("frustrated") ||
    toneLabel.includes("tense") ||
    risk >= 40
  ) {
    return "A small wording change can change the whole outcome.";
  }

  if (
    toneLabel.includes("friendly") ||
    toneLabel.includes("polite") ||
    risk <= 20
  ) {
    return "Clear messages build better conversations.";
  }

  return "How you say it changes what happens next.";
}

function MiniStatCard({
  eyebrow,
  title,
  subtitle,
  emoji,
  bg,
  border,
  iconBg,
  chipBg,
  chipFg,
}) {
  return (
    <div
      style={{
        borderRadius: "24px",
        border: `1.5px solid ${border}`,
        background: bg,
        padding: "20px 22px",
        minHeight: "150px",
        boxSizing: "border-box",
        boxShadow: "0 3px 12px rgba(15,23,42,0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "999px",
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            flexShrink: 0,
          }}
        >
          {emoji}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: "8px",
            }}
          >
            {eyebrow}
          </div>

          <div
            style={{
              fontSize: "22px",
              lineHeight: 1.2,
              fontWeight: 900,
              color: "#18214d",
            }}
          >
            {title}
          </div>

          {!!subtitle && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginTop: "12px",
                padding: "8px 14px",
                borderRadius: "999px",
                background: chipBg,
                color: chipFg,
                fontSize: "14px",
                fontWeight: 800,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShareCard({
  toolTitle = "ToneCheck",
  message = "",
  rewrite = "",
  tone = "Neutral",
  risk = 0,
  hiddenSignal = "",
  showSignalChip = true,
}) {
  const toneCard = getToneConfig(tone, risk);
  const outcomeCard = getOutcomeConfig(risk, tone);
  const signalCard = getSignalConfig(
    showSignalChip ? hiddenSignal : "None detected"
  );
  const decisionCard = getDecisionConfig(risk, tone);
  const punchLine = getPunchLine({ risk, hiddenSignal, tone });

  return (
    <div
      id="tone-share-card"
      style={{
        width: 1600,
        background: "linear-gradient(180deg, #f7f2ff 0%, #ffffff 100%)",
        borderRadius: 42,
        padding: 30,
        boxSizing: "border-box",
        fontFamily:
          "Inter, ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#18214d",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 38,
          padding: "44px 46px 34px",
          boxShadow: "0 10px 30px rgba(80,70,160,0.08)",
          border: "1px solid rgba(129,140,248,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#e11d48",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              You almost sent this
            </div>

            <div
              style={{
                fontSize: 74,
                lineHeight: 1,
                fontWeight: 1000,
                letterSpacing: "-0.05em",
                color: "#172554",
              }}
            >
              Tone
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Check
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: 72,
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            ✨
          </div>
        </div>

        <div
          style={{
            borderRadius: 34,
            border: "2px solid #e5e7eb",
            padding: "34px 36px",
            background: "#ffffff",
            marginTop: 8,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#60708f",
              marginBottom: 18,
            }}
          >
            Message
          </div>

          <div
            style={{
              fontSize: 28,
              lineHeight: 1.75,
              color: "#1f2a5b",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message || "No message provided."}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 26,
          }}
        >
          <MiniStatCard
            eyebrow="Tone"
            title={toneCard.title}
            subtitle={toneCard.subtitle}
            emoji={toneCard.emoji}
            bg={toneCard.bg}
            border={toneCard.border}
            iconBg={toneCard.iconBg}
            chipBg={toneCard.chipBg}
            chipFg={toneCard.chipFg}
          />

          <MiniStatCard
            eyebrow="Likely outcome"
            title={outcomeCard.title}
            subtitle={outcomeCard.subtitle}
            emoji={outcomeCard.emoji}
            bg={outcomeCard.bg}
            border={outcomeCard.border}
            iconBg={outcomeCard.iconBg}
            chipBg={outcomeCard.chipBg}
            chipFg={outcomeCard.chipFg}
          />

          <MiniStatCard
            eyebrow="Hidden signal"
            title={signalCard.title}
            subtitle={signalCard.subtitle}
            emoji={signalCard.emoji}
            bg={signalCard.bg}
            border={signalCard.border}
            iconBg={signalCard.iconBg}
            chipBg={signalCard.chipBg}
            chipFg={signalCard.chipFg}
          />

          <MiniStatCard
            eyebrow="Should send or not?"
            title={decisionCard.title}
            subtitle={decisionCard.subtitle}
            emoji={decisionCard.emoji}
            bg={decisionCard.bg}
            border={decisionCard.border}
            iconBg={decisionCard.iconBg}
            chipBg={decisionCard.chipBg}
            chipFg={decisionCard.chipFg}
          />
        </div>

        {!!rewrite && (
          <div
            style={{
              marginTop: 28,
              borderRadius: 34,
              border: "2px solid #bfdbfe",
              background: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)",
              padding: "24px 26px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "999px",
                  background: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                ✨
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#2563eb",
                }}
              >
                Better version
              </div>
            </div>

            <div
              style={{
                fontSize: 26,
                lineHeight: 1.8,
                color: "#21356b",
                maxWidth: 1050,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {rewrite}
            </div>

            <div
              style={{
                position: "absolute",
                right: 40,
                bottom: 20,
                width: 180,
                height: 120,
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
                filter: "blur(18px)",
              }}
            />

            <img
              src="/share-pen.png"
              alt=""
              style={{
                position: "absolute",
                right: 28,
                bottom: 12,
                width: 180,
                height: "auto",
                opacity: 0.95,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                right: 170,
                top: 40,
                fontSize: 28,
                opacity: 0.7,
              }}
            >
              ✨
            </div>

            <div
              style={{
                position: "absolute",
                right: 120,
                top: 80,
                fontSize: 18,
                opacity: 0.5,
              }}
            >
              ✦
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            borderRadius: 18,
            background: "#eef4ff",
            padding: "16px 18px",
            color: "#365fc9",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 22 }}>💡</span>
          <span>
            <strong>{punchLine}</strong> Consider how the other person may feel
            before sending.
          </span>
        </div>

        <div
          style={{
            marginTop: 30,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#4169e1",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 21,
              color: "#3b82f6",
            }}
          >
            <span style={{ fontSize: 28 }}>🌐</span>
            <span>
              Check yours at{" "}
              <span style={{ textDecoration: "underline" }}>
                trytonecheck.com
              </span>
            </span>
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 1000,
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