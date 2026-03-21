export function getSendVerdict(risk, regret, manipulation) {
  const combined = risk + regret * 0.3 + manipulation * 0.3;

  // 🚨 DO NOT SEND
  if (combined >= 85) {
    return {
      label: "Don’t send",
      sublabel: "Likely to escalate",
      emoji: "⛔",
      tone: "danger",
    };
  }

  // ⚠️ RISKY
  if (combined >= 65) {
    return {
      label: "Send, but soften tone",
      sublabel: "May trigger defensiveness",
      emoji: "⚠️",
      tone: "warning",
    };
  }

  // 🤔 MAYBE
  if (combined >= 40) {
    return {
      label: "Send — but refine it",
      sublabel: "Could be misunderstood",
      emoji: "😐",
      tone: "neutral",
    };
  }

  // ✅ SAFE
  return {
    label: "Safe to send",
    sublabel: "Clear and unlikely to cause issues",
    emoji: "✅",
    tone: "safe",
  };
}

/*const combined = risk + regret * 0.3 + manipulation * 0.3;*/

export function getDecisionTheme(toneClass) {

  if (toneClass === "safe") {
    return {
      bg: "linear-gradient(135deg, rgba(220,252,231,0.96), rgba(240,253,244,0.94))",
      border: "rgba(34,197,94,0.35)",
      iconBg: "linear-gradient(135deg,#22c55e,#16a34a)"
    };
  }

  if (toneClass === "maybe") {
    return {
      bg: "linear-gradient(135deg, rgba(254,249,195,0.96), rgba(255,251,235,0.94))",
      border: "rgba(245,158,11,0.35)",
      iconBg: "linear-gradient(135deg,#f59e0b,#d97706)"
    };
  }

  return {
    bg: "linear-gradient(135deg, rgba(254,226,226,0.96), rgba(254,242,242,0.94))",
    border: "rgba(239,68,68,0.35)",
    iconBg: "linear-gradient(135deg,#ef4444,#dc2626)"
  };
}