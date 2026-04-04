export function getSendVerdict(risk, regret, manipulation, threat = 0) {
  const riskScore = Number(risk || 0);
  const regretScore = Number(regret || 0);
  const manipulationScore = Number(manipulation || 0);
  const threatScore = Number(threat || 0);

  const combined = riskScore + regretScore * 0.3 + manipulationScore * 0.3;

  // 🚫 DIRECT THREAT / SEVERE
  if (threatScore >= 70 || riskScore >= 85) {
    return {
      label: "Do Not Send",
      sublabel: "Threat or severe escalation detected",
      emoji: "🚫",
      tone: "danger",
    };
  }

  // ⚠️ HIGH RISK
  if (combined >= 65 || riskScore >= 50) {
    return {
      label: "Review Before Sending",
      sublabel: "May trigger defensiveness or conflict",
      emoji: "⚠️",
      tone: "warning",
    };
  }

  // 🤔 MEDIUM RISK
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
    label: "Safe to Send",
    sublabel: "Clear and unlikely to cause issues",
    emoji: "✅",
    tone: "safe",
  };
}

export function getDecisionTheme(toneClass) {
  if (toneClass === "safe") {
    return {
      bg: "linear-gradient(135deg, rgba(220,252,231,0.96), rgba(240,253,244,0.94))",
      border: "rgba(34,197,94,0.35)",
      iconBg: "linear-gradient(135deg,#22c55e,#16a34a)",
    };
  }

  if (toneClass === "neutral" || toneClass === "warning") {
    return {
      bg: "linear-gradient(135deg, rgba(254,249,195,0.96), rgba(255,251,235,0.94))",
      border: "rgba(245,158,11,0.35)",
      iconBg: "linear-gradient(135deg,#f59e0b,#d97706)",
    };
  }

  return {
    bg: "linear-gradient(135deg, rgba(254,226,226,0.96), rgba(254,242,242,0.94))",
    border: "rgba(239,68,68,0.35)",
    iconBg: "linear-gradient(135deg,#ef4444,#dc2626)",
  };
}