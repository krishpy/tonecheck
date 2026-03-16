export function getSendVerdict(risk = 0, regret = 0, manipulation = 0) {
  const combined = risk * 0.6 + regret * 0.3 + manipulation * 0.1;

  if (combined < 25) {
    return {
      label: "Send",
      emoji: "🟢",
      toneClass: "safe",
      reason: "This message looks relatively safe to send.",
    };
  }

  if (combined < 55) {
    return {
      label: "Maybe",
      emoji: "🟡",
      toneClass: "maybe",
      reason: "This message may create some tension. Consider softening it.",
    };
  }

  return {
    label: "Don't Send",
    emoji: "🔴",
    toneClass: "danger",
    reason: "This message has a higher chance of causing regret or escalation.",
  };
}

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