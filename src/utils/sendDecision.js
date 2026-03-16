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