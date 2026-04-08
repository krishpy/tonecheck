function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getSendVerdict(
  risk,
  regret,
  manipulation,
  threat = 0,
  tone = "",
  hiddenSignal = ""
) {
  const riskScore = toNumber(risk);
  const regretScore = toNumber(regret);
  const manipulationScore = toNumber(manipulation);
  const threatScore = toNumber(threat);

  const toneLabel = normalize(tone);
  const hidden = normalize(hiddenSignal);

  const combined = riskScore + regretScore * 0.3 + manipulationScore * 0.3;

  const isPassiveAggressive =
    toneLabel === "passive aggressive" ||
    toneLabel === "passive" ||
    hidden === "passive aggression" ||
    hidden === "passive_aggression_signal";

  const isAccusatory =
    toneLabel === "accusatory" ||
    hidden === "accusation signal" ||
    hidden === "accusation_signal" ||
    hidden === "accusatory pressure signal" ||
    hidden === "accusatory_pressure_signal";

  const isManipulative =
    toneLabel === "manipulative" ||
    hidden === "guilt tripping" ||
    hidden === "guilt trip signal" ||
    hidden === "guilt_trip_signal" ||
    hidden === "emotional leverage" ||
    hidden === "emotional_leverage";

  const isTense =
    toneLabel === "tense" ||
    toneLabel === "frustrated" ||
    toneLabel === "aggressive";

  // 🚫 DIRECT THREAT / SEVERE
  if (threatScore >= 70 || riskScore >= 85) {
    return {
      label: "Do Not Send",
      sublabel: "Threat or severe escalation detected",
      emoji: "🚫",
      tone: "danger",
    };
  }

  // ⚠️ CONSUMER-SPECIFIC REVIEW RULES
  // These are important for ToneCheck even when raw risk is not high enough.
  if (isPassiveAggressive || isAccusatory || isManipulative) {
    return {
      label: "Review Before Sending",
      sublabel: "Could trigger defensiveness or confusion",
      emoji: "⚠️",
      tone: "warning",
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

  // 🤔 MEDIUM RISK / TENSE DELIVERY
  if (combined >= 40 || isTense) {
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