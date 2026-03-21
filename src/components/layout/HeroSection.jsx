import React, { useMemo } from "react";
import useIsMobile from "../../hooks/useIsMobile";

function getLevel(score = 0) {
  if (score >= 70) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function getReplyVibe(score = 0) {
  if (score >= 70) return "Good";
  if (score >= 35) return "Mixed";
  return "Poor";
}

function getReplyMeta(score = 0) {
  const value = getReplyVibe(score);

  if (value === "Good") {
    return {
      label: "Reply vibe",
      value,
      emoji: "👍",
      bg: "rgba(34,197,94,0.10)",
      border: "1px solid rgba(34,197,94,0.20)",
      color: "#166534",
      shadow: "0 4px 12px rgba(239,68,68,0.12)",
    };
  }

  if (value === "Mixed") {
    return {
      label: "Reply vibe",
      value,
      emoji: "😐",
      bg: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.20)",
      color: "#b45309",
      shadow: "0 4px 12px rgba(239,68,68,0.12)",
    };
  }

  return {
    label: "Reply vibe",
    value,
    emoji: "👎",
    bg: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.20)",
    color: "#b91c1c",
    shadow: "0 4px 12px rgba(239,68,68,0.12)",
  };
}

function getRiskMeta(label, score = 0, lowEmoji = "✅", mediumEmoji = "😐", highEmoji = "⚠️") {
  const value = getLevel(score);

  if (value === "High") {
    return {
      label,
      value,
      emoji: highEmoji,
      bg: "rgba(236,72,153,0.10)",
      border: "1px solid rgba(236,72,153,0.20)",
      color: "#be185d",
      shadow: "0 4px 12px rgba(239,68,68,0.12)",
    };
  }

  if (value === "Medium") {
    return {
      label,
      value,
      emoji: mediumEmoji,
      bg: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.20)",
      color: "#b45309",
      shadow: "0 4px 12px rgba(239,68,68,0.12)",
    };
  }

  return {
    label,
    value,
    emoji: lowEmoji,
    bg: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "#166534",
    shadow: "0 4px 12px rgba(239,68,68,0.12)",
  };
}

function getHiddenSignalMeta(hiddenSignalLabel = "Neutral") {
  const normalized = String(hiddenSignalLabel || "").trim().toLowerCase();

  if (
    normalized.includes("threat") ||
    normalized.includes("profanity") ||
    normalized.includes("insult") ||
    normalized.includes("hostile")
  ) {
    return {
      label: "Hidden signal",
      value: hiddenSignalLabel,
      emoji: "🔥",
      bg: "rgba(239,68,68,0.10)",
      border: "1px solid rgba(239,68,68,0.20)",
      color: "#b91c1c",
      shadow: "0 4px 12px rgba(239,68,68,0.12)",
    };
  }

  if (
    normalized.includes("pressure") ||
    normalized.includes("passive") ||
    normalized.includes("guilt") ||
    normalized.includes("blame") ||
    normalized.includes("leverage")
  ) {
    return {
      label: "Hidden signal",
      value: hiddenSignalLabel,
      emoji: "⚠️",
      bg: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.20)",
      color: "#b45309",
      shadow: "0 4px 12px rgba(239,68,68,0.12)",
    };
  }

  return {
    label: "Hidden signal",
    value: hiddenSignalLabel || "Neutral",
    emoji: "🌿",
    bg: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "#166534",
    shadow: "0 4px 12px rgba(239,68,68,0.12)",
  };
}

function MiniOutcomeChip({ item }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "999px",
        background: item.bg,
        border: item.border,
        color: item.color,
        fontSize: "13px",
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
        shadow: "0 4px 12px rgba(239,68,68,0.12)",
      }}
    >
      <span>{item.emoji}</span>
      <span style={{ opacity: 0.9 }}>{item.label}:</span>
      <span>{item.value}</span>
    </div>
  );
}

function getLivePreview(message = "") {
  const text = String(message || "").trim().toLowerCase();

  if (!text) {
    return {
      emoji: "🧠",
      text: "Live typing analysis will appear here as you type.",
      color: "#64748b",
      bg: "rgba(255,255,255,0.70)",
      border: "1px solid rgba(15,23,42,0.06)",
    };
  }

  if (
    text.includes("fuck") ||
    text.includes("stupid") ||
    text.includes("idiot") ||
    text.includes("moron")
  ) {
    return {
      emoji: "🔥",
      text: "This may be read as hostile or insulting.",
      color: "#b91c1c",
      bg: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.16)",
    };
  }

  if (
    text.includes("whatever") ||
    text.includes("fine.") ||
    text.includes("fine,") ||
    text.includes("do whatever") ||
    text.includes("forget it")
  ) {
    return {
      emoji: "😒",
      text: "This may sound passive-aggressive.",
      color: "#b45309",
      bg: "rgba(245,158,11,0.08)",
      border: "1px solid rgba(245,158,11,0.16)",
    };
  }

  if (
    text.includes("you always") ||
    text.includes("you never") ||
    text.includes("did you even") ||
    text.includes("as usual")
  ) {
    return {
      emoji: "⚠️",
      text: "This may sound accusatory and trigger defensiveness.",
      color: "#b45309",
      bg: "rgba(245,158,11,0.08)",
      border: "1px solid rgba(245,158,11,0.16)",
    };
  }

  if (
    text.includes("can we talk") ||
    text.includes("i feel") ||
    text.includes("i'm upset") ||
    text.includes("i am upset")
  ) {
    return {
      emoji: "🤝",
      text: "This sounds more constructive and easier to receive.",
      color: "#166534",
      bg: "rgba(34,197,94,0.08)",
      border: "1px solid rgba(34,197,94,0.16)",
    };
  }

  return {
    emoji: "💬",
    text: "Checking tone, emotional pressure, and hidden signals…",
    color: "#475569",
    bg: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(15,23,42,0.06)",
  };
}

export default function HeroSection({
  location,
  navigate,
  currentTool,
  message,
  setMessage,
  setResult,
  setCopyState,
  analyze,
  loading,
  setExample,
  heroCardStyle,
  chipStyle,
  actionButtonStyle,
  primaryButtonStyle,
  result,
  getHiddenSignalLabel,
}) {
  const isMobile = useIsMobile();

  const glassOrb1 = {
    position: "absolute",
    top: "-90px",
    right: "-70px",
    width: "300px",
    height: "300px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(99,102,241,0.24), rgba(99,102,241,0) 70%)",
    pointerEvents: "none",
    filter: "blur(6px)",
  };

  const glassOrb2 = {
    position: "absolute",
    bottom: "-110px",
    left: "-70px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(236,72,153,0.20), rgba(236,72,153,0) 70%)",
    pointerEvents: "none",
    filter: "blur(8px)",
  };

  const glassOrb3 = {
    position: "absolute",
    top: "35%",
    left: "42%",
    transform: "translate(-50%, -50%)",
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(56,189,248,0.15), rgba(56,189,248,0) 72%)",
    pointerEvents: "none",
    filter: "blur(8px)",
  };

  const hiddenSignalKey =
    result?.primary_hidden_signal ||
    result?.hidden_signal ||
    result?.primary_manipulation_signal ||
    "none";

  const hiddenSignalLabel = getHiddenSignalLabel
    ? getHiddenSignalLabel(hiddenSignalKey)
    : "Neutral";

  const topOutcomes = result
    ? [
        getReplyMeta(Number(result?.reply_likelihood ?? 0)),
        getRiskMeta("Chance of regret", Number(result?.regret_risk ?? 0), "✅", "😐", "😬"),
        getRiskMeta("Emotional pressure", Number(result?.manipulation_risk ?? 0), "🌿", "😐", "⚠️"),
        getHiddenSignalMeta(hiddenSignalLabel),
      ]
    : [];

  const livePreview = useMemo(() => getLivePreview(message), [message]);

  {!result && (
  <div
    style={{
      marginTop: "12px",
      padding: "10px 14px",
      borderRadius: "16px",
      background: livePreview.bg,
      border: livePreview.border,
      color: livePreview.color,
      fontSize: "13px",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    }}
  >
    <span>{livePreview.emoji}</span>
    <span>{livePreview.text}</span>
  </div>
)}

  const heroRiskScore = Number(result?.risk_score ?? 0);

const displayDescription =
  location.pathname === "/"
    ? heroRiskScore >= 80
      ? "Pause. This message might escalate."
      : heroRiskScore >= 50
      ? "Think before you send this."
      : "Check how this message may sound."
    : currentTool.description;

const subDescription =
  location.pathname === "/"
    ? heroRiskScore >= 80
      ? "This wording may trigger conflict, defensiveness, or regret."
      : heroRiskScore >= 50
      ? "Check tone, emotional pressure, and hidden signals before you hit send."
      : "Get quick feedback on tone, clarity, and hidden meaning before you send."
    : "Get instant feedback before your message lands the wrong way.";

  return (
    <div
      className="tc-hero"
      style={{
        ...heroCardStyle,
        background:
          "radial-gradient(circle at top right, rgba(99,102,241,0.10), rgba(99,102,241,0) 24%), radial-gradient(circle at bottom left, rgba(236,72,153,0.10), rgba(236,72,153,0) 28%), rgba(255,255,255,0.68)",
      }}
    >
      <div className="tc-light-sweep" />
      <div style={glassOrb1} />
      <div style={glassOrb2} />
      <div style={glassOrb3} />

      <div style={{ marginBottom: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {location.pathname !== "/" && (
          <div
            style={{
              ...chipStyle,
              background: "rgba(99,102,241,0.10)",
              color: "#4338ca",
              cursor: "default",
            }}
          >
            {currentTool.title}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: isMobile ? "12px" : "16px",
            marginBottom: "14px",
            flexWrap: "wrap",
          }}
        >
          <div
            className="tc-logo-glow"
            style={{
              position: "relative",
              width: isMobile ? "62px" : "74px",
              height: isMobile ? "62px" : "74px",
              borderRadius: "24px",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.96), rgba(236,72,153,0.92))",
              boxShadow:
                "0 14px 38px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.36)",
              border: "1px solid rgba(255,255,255,0.28)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "8px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            />
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "baseline",
                gap: "1px",
                color: "#ffffff",
                fontWeight: 900,
                letterSpacing: "-0.08em",
                textShadow: "0 2px 10px rgba(0,0,0,0.16)",
              }}
            >
              <span style={{ fontSize: isMobile ? "24px" : "28px", lineHeight: 1 }}>T</span>
              <span style={{ fontSize: isMobile ? "26px" : "30px", lineHeight: 1 }}>✓</span>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.22em",
                color: "#6366f1",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              {currentTool.eyebrow}
            </div>

            <h1
              className="tc-title tc-shimmer"
              style={{
                margin: 0,
                fontSize: isMobile ? "50px" : "76px",
                lineHeight: 0.92,
                letterSpacing: "-0.09em",
                fontWeight: 950,
                background:
                  "linear-gradient(135deg, #0f172a 0%, #312e81 30%, #7c3aed 62%, #ec4899 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {location.pathname === "/" ? "ToneCheck" : currentTool.title}
            </h1>
          </div>
        </div>

        <p
          style={{
            margin: "10px 0 0 0",
            maxWidth: "720px",
            color: "#334155",
            fontSize: isMobile ? "28px" : "34px",
            lineHeight: 1.18,
            fontWeight: 850,
            letterSpacing: "-0.04em",
          }}
        >
          {displayDescription}
        </p>

        <p
          style={{
            margin: "12px 0 0 0",
            maxWidth: "760px",
            color: "#475569",
            fontSize: isMobile ? "16px" : "19px",
            lineHeight: 1.65,
            fontWeight: 550,
          }}
        >
          {subDescription}
        </p>
      </div>

      <div
        style={{
          marginTop: "22px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {currentTool.examples.map((example) => (
          <button
            type="button"
            key={example.label}
            className="tc-chip-hover"
            style={{
              ...chipStyle,
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(15,23,42,0.06)",
              fontWeight: 750,
            }}
            onClick={() => setExample(example.text)}
          >
            {example.label}
          </button>
        ))}
      </div>

      {!result && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            borderRadius: "16px",
            background: livePreview.bg,
            border: livePreview.border,
            color: livePreview.color,
            fontSize: "13px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{livePreview.emoji}</span>
          <span>{livePreview.text}</span>
        </div>
      )}

      <div style={{ marginTop: "24px", position: "relative" }}>
        <textarea
          className="tc-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={currentTool.placeholder}
          style={{
            width: "100%",
            minHeight: isMobile ? "190px" : "240px",
            padding: isMobile ? "18px 18px 74px" : "24px 24px 72px",
            fontSize: isMobile ? "18px" : "24px",
            lineHeight: 1.6,
            borderRadius: "28px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86))",
            color: "#0f172a",
            border: "1px solid rgba(99,102,241,0.18)",
            boxSizing: "border-box",
            outline: "none",
            resize: "vertical",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.86), 0 16px 38px rgba(15,23,42,0.06)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "16px",
            bottom: "16px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="tc-button-hover"
            onClick={() => {
              setMessage("");
              setResult(null);
              setCopyState("");
            }}
            style={actionButtonStyle}
          >
            Clear
          </button>

          <button
            type="button"
            className="tc-button-hover"
            onClick={() => analyze()}
            disabled={loading || !message.trim()}
            style={{
              ...primaryButtonStyle,
              opacity: loading || !message.trim() ? 0.7 : 1,
            }}
          >
            {loading ? "Analyzing..." : currentTool.analyzeLabel}
          </button>
        </div>
      </div>

    <div
        style={{
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          color: "#64748b",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        <span>🧠 Live tone check</span>
        <span style={{ opacity: 0.45 }}>•</span>
        <span>⚡ Instant feedback</span>
        <span style={{ opacity: 0.45 }}>•</span>
        <span>🔒 No signup</span>
      </div>

      {result && (
        <div
          style={{
            marginTop: "14px",
            padding: isMobile ? "14px" : "16px",
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(248,250,252,0.92))",
            border: "1px solid rgba(99,102,241,0.10)",
            boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6366f1",
              marginBottom: "12px",
            }}
          >
            What could happen
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {topOutcomes.map((item) => (
              <MiniOutcomeChip key={`${item.label}-${item.value}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}