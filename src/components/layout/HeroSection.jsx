import React, { useMemo } from "react";
import useIsMobile from "../../hooks/useIsMobile";

const TOOLTIP_MAP = {
  "Reply vibe": "How the other person may emotionally react to your message.",
  "Chance of regret": "How likely you may regret sending this later.",
  "Emotional pressure": "Whether the message puts pressure or guilt on the other person.",
  "Hidden signal": "Subtle meaning your message may carry beyond what you intended.",
};

const VIRAL_HOME_EXAMPLES = [
  {
    label: "😬 Why are you ignoring me?",
    text: "Why are you ignoring me?",
  },
  {
    label: "😒 Fine. Do whatever you want.",
    text: "Fine. Do whatever you want.",
  },
  {
    label: "💔 I was there for you every time.",
    text: "I was there for you every time.",
  },
  {
    label: "😤 You always do this.",
    text: "You always do this.",
  },
  {
    label: "🤝 Can we talk about this calmly?",
    text: "Can we talk about this calmly?",
  },
];

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
      emoji: "😊",
      bg: "rgba(34,197,94,0.10)",
      border: "1px solid rgba(34,197,94,0.20)",
      color: "#166534",
      shadow: "0 4px 12px rgba(34,197,94,0.14)",
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
      shadow: "0 4px 12px rgba(245,158,11,0.14)",
    };
  }

  return {
    label: "Reply vibe",
    value,
    emoji: "👎",
    bg: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.20)",
    color: "#b91c1c",
    shadow: "0 4px 12px rgba(239,68,68,0.14)",
  };
}

function getRegretMeta(level = "low") {
  const value = String(level || "low").trim().toLowerCase();

  if (value === "high") {
    return {
      label: "Chance of regret",
      value: "High",
      emoji: "😬",
      bg: "rgba(236,72,153,0.10)",
      border: "1px solid rgba(236,72,153,0.20)",
      color: "#be185d",
      shadow: "0 4px 12px rgba(236,72,153,0.14)",
    };
  }

  if (value === "medium") {
    return {
      label: "Chance of regret",
      value: "Medium",
      emoji: "🤔",
      bg: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.20)",
      color: "#b45309",
      shadow: "0 4px 12px rgba(245,158,11,0.14)",
    };
  }

  return {
    label: "Chance of regret",
    value: "Low",
    emoji: "😌",
    bg: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "#166534",
    shadow: "0 4px 12px rgba(34,197,94,0.14)",
  };
}

function getPressureMeta(level = "low") {
  const value = String(level || "low").trim().toLowerCase();

  if (value === "high") {
    return {
      label: "Emotional pressure",
      value: "High",
      emoji: "⚠️",
      bg: "rgba(236,72,153,0.10)",
      border: "1px solid rgba(236,72,153,0.20)",
      color: "#be185d",
      shadow: "0 4px 12px rgba(236,72,153,0.14)",
    };
  }

  if (value === "medium") {
    return {
      label: "Emotional pressure",
      value: "Medium",
      emoji: "😕",
      bg: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.20)",
      color: "#b45309",
      shadow: "0 4px 12px rgba(245,158,11,0.14)",
    };
  }

  return {
    label: "Emotional pressure",
    value: "Low",
    emoji: "🌿",
    bg: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "#166534",
    shadow: "0 4px 12px rgba(34,197,94,0.14)",
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
      shadow: "0 4px 12px rgba(239,68,68,0.14)",
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
      shadow: "0 4px 12px rgba(245,158,11,0.14)",
    };
  }

  return {
    label: "Hidden signal",
    value: hiddenSignalLabel || "None detected",
    emoji: "🌿",
    bg: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "#166534",
    shadow: "0 4px 12px rgba(34,197,94,0.14)",
  };
}

function MiniOutcomeChip({ item }) {
  const [showTip, setShowTip] = React.useState(false);
  const [tipPinned, setTipPinned] = React.useState(false);
  const [tipPos, setTipPos] = React.useState({ x: 0, y: 0 });
  const chipRef = React.useRef(null);
  const tooltip = TOOLTIP_MAP[item.label] || "";

  React.useEffect(() => {
    if (!tipPinned || !showTip) return;

    const timer = setTimeout(() => {
      setShowTip(false);
      setTipPinned(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, [tipPinned, showTip]);

  function updateTooltipPosition(clientX, clientY) {
    const rect = chipRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTipPos({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  }

  function handleMouseEnter(e) {
    if (!tooltip) return;
    updateTooltipPosition(e.clientX, e.clientY);
    setShowTip(true);
  }

  function handleMouseMove(e) {
    if (!tooltip || !showTip || tipPinned) return;
    updateTooltipPosition(e.clientX, e.clientY);
  }

  function handleMouseLeave() {
    if (tipPinned) return;
    setShowTip(false);
  }

  function handleInfoClick(e) {
    e.stopPropagation();
    if (!tooltip) return;

    const rect = chipRef.current?.getBoundingClientRect();
    if (rect) {
      setTipPos({
        x: rect.width / 2,
        y: 0,
      });
    }

    setTipPinned((prev) => {
      const next = !prev;
      setShowTip(next);
      return next;
    });
  }

  return (
    <div
      ref={chipRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        borderRadius: "999px",
        background: item.bg,
        border: item.border,
        color: item.color,
        fontWeight: 700,
        fontSize: "13px",
        cursor: "default",
        boxShadow: item.shadow || "none",
        transition: "transform 180ms ease, box-shadow 180ms ease",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          item.shadow || "0 6px 16px rgba(15,23,42,0.10)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = item.shadow || "none";
      }}
    >
      <span>{item.emoji}</span>

      <span>
        {item.label}: {item.value}
      </span>

      <button
        type="button"
        onClick={handleInfoClick}
        aria-label={`More info about ${item.label}`}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          marginLeft: "2px",
          opacity: 0.68,
          fontSize: "12px",
          lineHeight: 1,
          cursor: "pointer",
          color: "inherit",
        }}
      >
        ℹ
      </button>

      <div
        style={{
          position: "absolute",
          left: `${tipPos.x}px`,
          top: `${tipPos.y - 12}px`,
          transform: showTip
            ? "translate(-50%, -100%) scale(1)"
            : "translate(-50%, -96%) scale(0.96)",
          transformOrigin: "bottom center",
          background: "#111827",
          color: "#fff",
          padding: "8px 10px",
          borderRadius: "10px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          zIndex: 10,
          boxShadow: "0 10px 26px rgba(0,0,0,0.22)",
          opacity: showTip && tooltip ? 1 : 0,
          pointerEvents: "none",
          transition:
            "opacity 160ms ease, transform 180ms ease, left 80ms linear, top 80ms linear",
        }}
      >
        {tooltip}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "-5px",
            width: "10px",
            height: "10px",
            background: "#111827",
            transform: "translateX(-50%) rotate(45deg)",
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}

function getLivePreview(message = "") {
  const text = String(message || "").trim().toLowerCase();

  if (!text) {
    return {
      emoji: "🧠",
      text: "Paste a text and we’ll check tone, hidden pressure, and regret risk.",
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
  consentToSaveText,
  setConsentToSaveText,
}) {
  const isMobile = useIsMobile();

  const isHome = location.pathname === "/";

  const glassOrb1 = {
    position: "absolute",
    top: "-90px",
    right: "-70px",
    width: "300px",
    height: "300px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.24), rgba(99,102,241,0) 70%)",
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
    background:
      "radial-gradient(circle, rgba(236,72,153,0.20), rgba(236,72,153,0) 70%)",
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
    background:
      "radial-gradient(circle, rgba(56,189,248,0.15), rgba(56,189,248,0) 72%)",
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
    : "None detected";

  const topOutcomes = result
    ? [
        getReplyMeta(Number(result?.reply_likelihood ?? 0)),
        getRegretMeta(result?.chance_of_regret),
        getPressureMeta(result?.emotional_pressure),
        getHiddenSignalMeta(hiddenSignalLabel),
      ]
    : [];

  const livePreview = useMemo(() => getLivePreview(message), [message]);

  const displayDescription = isHome
    ? "Catch texts you may regret before you send."
    : currentTool.description;

  const subDescription = isHome
    ? "See if your message sounds angry, passive-aggressive, guilt-tripping, or likely to start conflict — before you hit send."
    : "Get instant feedback before your message lands the wrong way.";

  const examplesToShow = isHome ? VIRAL_HOME_EXAMPLES : currentTool.examples;

  return (
    <div
      className="tc-hero"
      style={{
        ...heroCardStyle,
        background:
          "radial-gradient(circle at top right, rgba(99,102,241,0.10), rgba(99,102,241,0) 24%), radial-gradient(circle at bottom left, rgba(236,72,153,0.10), rgba(236,72,153,0) 28%), rgba(255,255,255,0.68)",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: isMobile ? "20px 16px 24px" : heroCardStyle?.padding,
      }}
    >
      <div className="tc-light-sweep" />
      <div style={glassOrb1} />
      <div style={glassOrb2} />
      <div style={glassOrb3} />

      <div style={{ marginBottom: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {!isHome && (
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
              flexShrink: 0,
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
              <span style={{ fontSize: isMobile ? "24px" : "28px", lineHeight: 1 }}>
                T
              </span>
              <span style={{ fontSize: isMobile ? "26px" : "30px", lineHeight: 1 }}>
                ✓
              </span>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
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
                fontSize: isMobile ? "clamp(42px, 12vw, 56px)" : "76px",
                lineHeight: 0.92,
                letterSpacing: "-0.09em",
                fontWeight: 950,
                background:
                  "linear-gradient(135deg, #0f172a 0%, #312e81 30%, #7c3aed 62%, #ec4899 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                wordBreak: "break-word",
              }}
            >
              {isHome ? "ToneCheck" : currentTool.title}
            </h1>

            {isHome && (
              <div
                style={{
                  marginTop: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg,#eef2ff,#fdf2f8)",
                  fontWeight: 850,
                  fontSize: "14px",
                  color: "#4338ca",
                  boxShadow: "0 8px 22px rgba(99,102,241,0.10)",
                  border: "1px solid rgba(99,102,241,0.12)",
                }}
              >
                ✨ The spellcheck for tone
              </div>
            )}
          </div>
        </div>

        <p
          style={{
            margin: "10px 0 0 0",
            maxWidth: "760px",
            color: "#334155",
            fontSize: isMobile ? "clamp(28px, 8vw, 38px)" : "42px",
            lineHeight: isMobile ? 1.1 : 1.12,
            fontWeight: 900,
            letterSpacing: "-0.055em",
          }}
        >
          {displayDescription}
        </p>

        <p
          style={{
            margin: "14px 0 0 0",
            maxWidth: "800px",
            color: "#475569",
            fontSize: isMobile ? "16px" : "19px",
            lineHeight: 1.65,
            fontWeight: 560,
          }}
        >
          {subDescription}
        </p>

        <div
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "#64748b",
            fontWeight: 650,
          }}
        >
          AI can miss nuance. Use judgment.
        </div>
      </div>

      <div
        style={{
          marginTop: "24px",
          marginBottom: "10px",
          fontWeight: 850,
          fontSize: "14px",
          color: "#64748b",
        }}
      >
        Try an example:
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {examplesToShow.map((example) => (
          <button
            type="button"
            key={example.label}
            className="tc-chip-hover"
            style={{
              ...chipStyle,
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(15,23,42,0.06)",
              fontWeight: 750,
              width: isMobile ? "100%" : "auto",
              justifyContent: "flex-start",
              textAlign: "left",
              padding: isMobile ? "14px 16px" : chipStyle?.padding,
              lineHeight: 1.35,
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
            padding: isMobile ? "16px" : "10px 14px",
            borderRadius: "16px",
            background: livePreview.bg,
            border: livePreview.border,
            color: livePreview.color,
            fontSize: isMobile ? "14px" : "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: isMobile ? "100%" : "inline-flex",
            boxSizing: "border-box",
          }}
        >
          <span>{livePreview.emoji}</span>
          <span>{livePreview.text}</span>
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <textarea
          className="tc-textarea"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setResult(null);
            setCopyState("");
          }}
          placeholder={
            isHome
              ? "Paste the message you're about to send..."
              : currentTool.placeholder
          }
          style={{
            width: "100%",
            minHeight: isMobile ? "180px" : "240px",
            padding: isMobile ? "18px" : "24px 24px 72px",
            fontSize: isMobile ? "18px" : "24px",
            lineHeight: 1.6,
            borderRadius: "28px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86))",
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
            marginTop: "12px",
            display: "flex",
            gap: "10px",
            flexWrap: isMobile ? "nowrap" : "wrap",
            flexDirection: "row",
            alignItems: "stretch",
          }}
        >
          <button
            type="button"
            className="tc-button-hover"
            onClick={() => {
              setMessage("");
              setResult(null);
              setCopyState("");
              setConsentToSaveText(false);
            }}
            style={{
              ...actionButtonStyle,
              minWidth: isMobile ? "96px" : actionButtonStyle?.minWidth,
              width: isMobile ? "auto" : actionButtonStyle?.width,
              padding: isMobile ? "0 18px" : actionButtonStyle?.padding,
              minHeight: isMobile ? "54px" : actionButtonStyle?.minHeight,
              flexShrink: 0,
            }}
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
              minHeight: isMobile ? "54px" : primaryButtonStyle?.minHeight,
              width: isMobile ? "100%" : primaryButtonStyle?.width,
              flex: isMobile ? 1 : "unset",
            }}
          >
            {loading
              ? "Checking..."
              : isHome
              ? "Should I Send This?"
              : currentTool.analyzeLabel}
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: "14px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div
          style={{
            ...chipStyle,
            cursor: "default",
            background: "rgba(255,255,255,0.72)",
          }}
        >
          ✓ Detect hidden tone
        </div>
        <div
          style={{
            ...chipStyle,
            cursor: "default",
            background: "rgba(255,255,255,0.72)",
          }}
        >
          ✓ Spot pressure or blame
        </div>
        <div
          style={{
            ...chipStyle,
            cursor: "default",
            background: "rgba(255,255,255,0.72)",
          }}
        >
          ✓ Get calmer rewrites
        </div>
      </div>

      <div
        style={{
          marginTop: "14px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          color: "#475569",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        <input
          id="consent-to-save-text"
          type="checkbox"
          checked={consentToSaveText}
          onChange={(e) => setConsentToSaveText(e.target.checked)}
          style={{
            marginTop: "2px",
            width: "16px",
            height: "16px",
            accentColor: "#6366f1",
            flexShrink: 0,
          }}
        />
        <label htmlFor="consent-to-save-text" style={{ cursor: "pointer" }}>
          Allow saving this message to improve ToneCheck.
        </label>
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
          style={{
            ...chipStyle,
            cursor: "default",
            background: "rgba(238,242,255,0.70)",
            color: "#4338ca",
          }}
        >
          Used for difficult texts
        </div>
        <div
          style={{
            ...chipStyle,
            cursor: "default",
            background: "rgba(238,242,255,0.70)",
            color: "#4338ca",
          }}
        >
          Family conflict
        </div>
        <div
          style={{
            ...chipStyle,
            cursor: "default",
            background: "rgba(238,242,255,0.70)",
            color: "#4338ca",
          }}
        >
          Sensitive work replies
        </div>
        <div
          style={{
            ...chipStyle,
            cursor: "default",
            background: "rgba(238,242,255,0.70)",
            color: "#4338ca",
          }}
        >
          Apology messages
        </div>
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