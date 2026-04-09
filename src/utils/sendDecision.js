function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function verdictFromApiValue(sendVerdict) {
  const v = normalize(sendVerdict);

  if (v === "do_not_send" || v === "do not send" || v === "dont_send") {
    return {
      label: "Do Not Send",
      sublabel: "This may escalate badly",
      emoji: "🚫",
      tone: "danger",
    };
  }

  if (v === "review" || v === "review_before_sending") {
    return {
      label: "Careful — may be misunderstood",
      sublabel: "Your intent may land as pressure or blame",
      emoji: "⚠️",
      tone: "warning",
    };
  }

  if (v === "send" || v === "safe" || v === "safe_to_send") {
    return {
      label: "Safe to Send",
      sublabel: "Clear and unlikely to cause issues",
      emoji: "✅",
      tone: "safe",
    };
  }

  return null;
}

function inferVerdictFromSignals(
  risk,
  regret,
  manipulation,
  threat = 0,
  tone = "",
  hiddenSignal = "",
  replyVibe = ""
) {
  const riskScore = toNumber(risk);
  const regretScore = toNumber(regret);
  const manipulationScore = toNumber(manipulation);
  const threatScore = toNumber(threat);

  const toneLabel = normalize(tone);
  const hidden = normalize(hiddenSignal);
  const reply = normalize(replyVibe);

  const combined = riskScore + regretScore * 0.3 + manipulationScore * 0.3;

  const isPassiveAggressive =
    toneLabel === "passive aggressive" ||
    toneLabel === "passive" ||
    hidden === "passive aggression" ||
    hidden === "passive_aggression" ||
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
    hidden === "guilt_tripping" ||
    hidden === "emotional leverage" ||
    hidden === "emotional_leverage" ||
    hidden === "emotional dependency" ||
    hidden === "emotional_dependency" ||
    hidden === "moral_pressure";

  const isTense =
    toneLabel === "tense" ||
    toneLabel === "frustrated" ||
    toneLabel === "aggressive";

  // 🚫 DIRECT THREAT / SEVERE
  if (threatScore >= 60 || riskScore >= 85) {
    return {
      label: "Do Not Send",
      sublabel: "This may escalate badly",
      emoji: "🚫",
      tone: "danger",
    };
  }

  // ⚠️ ToneCheck review cases
  if (
    isPassiveAggressive ||
    isAccusatory ||
    isManipulative ||
    reply === "poor"
  ) {
    return {
      label: "Careful — may be misunderstood",
      sublabel: "Your intent may land as pressure or blame",
      emoji: "⚠️",
      tone: "warning",
    };
  }

  // ⚠️ Higher risk fallback
  if (combined >= 65 || riskScore >= 50) {
    return {
      label: "Careful — may be misunderstood",
      sublabel: "Your message may trigger defensiveness",
      emoji: "⚠️",
      tone: "warning",
    };
  }

  // 🤔 Medium-risk / tense fallback
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

/**
 * Backward-compatible signature.
 * Existing calls like:
 *   getSendVerdict(risk, regret, manipulation, threat, tone, hiddenSignal)
 * still work.
 *
 * New preferred usage:
 *   getSendVerdict({
 *     sendVerdict,
 *     risk,
 *     regret,
 *     manipulation,
 *     threat,
 *     tone,
 *     hiddenSignal,
 *     replyVibe,
 *   })
 */
export function getSendVerdict({
  sendVerdict: apiResult?.send_verdict,
  risk: apiResult?.communication_risk_score,
  regret: apiResult?.regret_risk,
  manipulation: apiResult?.manipulation_risk,
  threat: apiResult?.threat_score,
  tone: apiResult?.tone,
  hiddenSignal: apiResult?.primary_hidden_signal,
  replyVibe: apiResult?.reply_vibe,
}) {
  // Preferred object-style usage
  if (
    riskOrPayload &&
    typeof riskOrPayload === "object" &&
    !Array.isArray(riskOrPayload)
  ) {
    const payload = riskOrPayload;

    const apiVerdict = verdictFromApiValue(payload.sendVerdict || payload.send_verdict);
    if (apiVerdict) return apiVerdict;

    return inferVerdictFromSignals(
      payload.risk,
      payload.regret,
      payload.manipulation,
      payload.threat,
      payload.tone,
      payload.hiddenSignal || payload.hidden_signal,
      payload.replyVibe || payload.reply_vibe
    );
  }

  // Backward-compatible positional usage
  return inferVerdictFromSignals(
    riskOrPayload,
    regret,
    manipulation,
    threat,
    tone,
    hiddenSignal,
    replyVibe
  );
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