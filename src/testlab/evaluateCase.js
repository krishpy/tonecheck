function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeTone(value) {
  const v = normalize(value).replace(/_/g, " ");

  const map = {
    passiveaggressive: "passive aggressive",
    passive_aggressive: "passive aggressive",
  };

  return map[v] || v;
}

function normalizeSignal(value) {
  const v = normalize(value).replace(/_/g, " ");

  if (!v || v === "none detected" || v === "none" || v === "neutral information") {
    return "none";
  }

  const map = {
  pressure: "pressure",
  "pressure signal": "pressure",
  pressure_signal: "pressure",

  "passive aggression": "passive aggression",
  passive_aggression: "passive aggression",
  "passive aggression signal": "passive aggression",

  threat: "threat",
  "threat signal": "threat",
  threat_signal: "threat",

  ultimatum: "ultimatum",
  "ultimatum signal": "ultimatum",
  ultimatum_signal: "ultimatum",

  insult: "insult",
  "insult signal": "insult",
  insult_signal: "insult",

  profanity: "profanity",
  "profanity signal": "profanity",
  profanity_signal: "profanity",

  boundary: "boundary",
  "boundary setting": "boundary",
  "boundary signal": "boundary",
  boundary_signal: "boundary",
};
  return map[v] || v;
}

function bucketScore(score) {
  const n = Number(score || 0);
  if (n >= 70) return "high";
  if (n >= 40) return "medium";
  return "low";
}

function normalizePressure(value) {
  const v = normalize(value);
  if (!v) return "";

  if (["low", "medium", "high"].includes(v)) return v;

  const map = {
    none: "low",
    mild: "low",
  };

  return map[v] || v;
}


function normalizeRegret(apiResult) {
  // ✅ correct source
  const band = (apiResult.regret_risk_band || "").toLowerCase();

  if (band.includes("high")) return "high";
  if (band.includes("medium")) return "medium";
  if (band.includes("low")) return "low";

  return "";
}

function normalizeReplyVibe(value) {
  const v = normalize(value);
  if (!v) return "";

  const map = {
    good: "good",
    positive: "good",
    likely: "good",

    mixed: "mixed",
    uncertain: "mixed",

    low: "low",
    poor: "low",
    unlikely: "low",
    bad: "low",
  };

  return map[v] || v;
}

function replyBandFromApi(apiResult) {
  if (apiResult?.reply_vibe) {
    return normalizeReplyVibe(apiResult.reply_vibe);
  }

  if (apiResult?.reply_likelihood_band) {
    const band = normalize(apiResult.reply_likelihood_band);
    if (band === "high") return "good";
    if (band === "medium") return "mixed";
    return "low";
  }

  const score = Number(apiResult?.reply_likelihood ?? 0);
  if (score >= 70) return "good";
  if (score >= 40) return "mixed";
  return "low";
}

function regretBandFromApi(apiResult) {
  if (apiResult?.chance_of_regret) {
    return normalize(apiResult.chance_of_regret);
  }

  if (apiResult?.regret_risk_band) {
    return normalize(apiResult.regret_risk_band);
  }

  return bucketScore(apiResult?.regret_risk ?? 0);
}

function pressureBandFromApi(apiResult) {
  if (apiResult?.emotional_pressure) {
    return normalizePressure(apiResult.emotional_pressure);
  }

  return bucketScore(apiResult?.pressure_score ?? 0);
}

function verdictFromApi(apiResult) {
  const sendDecision = normalize(apiResult?.send_decision);
  const sendDecisionLabel = normalize(apiResult?.send_decision_label);
  const sendVerdict = normalize(apiResult?.send_verdict);

  const raw = sendDecision || sendVerdict || sendDecisionLabel;

  if (!raw) return "";

  if (
    raw === "do_not_send" ||
    raw === "dont send" ||
    raw === "don't send" ||
    raw.includes("do not send")
  ) {
    return "dont_send";
  }

  if (
    raw === "review" ||
    raw.includes("review") ||
    raw.includes("careful") ||
    raw.includes("misunderstood")
  ) {
    return "review";
  }

  if (
    raw === "send" ||
    raw.includes("safe to send") ||
    raw.includes("looks okay to send") ||
    raw.includes("safe")
  ) {
    return "send";
  }

  return raw;
}

function normalizeExpectedVerdict(value) {
  const v = normalize(value);
  if (!v) return "";

  if (
    v === "dont_send" ||
    v === "do_not_send" ||
    v === "don't send" ||
    v === "dont send"
  ) {
    return "dont_send";
  }

  if (
    v === "review" ||
    v === "careful" ||
    v.includes("refine") ||
    v.includes("soften") ||
    v.includes("misunderstood")
  ) {
    return "review";
  }

  if (
    v === "send" ||
    v.includes("safe") ||
    v.includes("looks okay") ||
    v.includes("safe to send")
  ) {
    return "send";
  }

  return v;
}

function hasRewrite(apiResult) {
  const rewrite =
    apiResult?.rewrite_suggestion ||
    apiResult?.rewritten_text ||
    "";

  return normalize(rewrite).length > 0;
}

function hasAdvisory(apiResult) {
  return normalize(apiResult?.advisory).length > 0;
}

function buildFailureHints({
  expectedTone,
  actualTone,
  expectedHidden,
  actualHidden,
  expectedRegret,
  actualRegret,
  expectedPressure,
  actualPressure,
  expectedReply,
  actualReply,
  expectedVerdict,
  actualVerdict,
}) {
  const hints = [];

  if (expectedTone && expectedTone !== actualTone) {
    hints.push({
      type: "tone",
      title: "Tone mismatch",
      expected: expectedTone,
      actual: actualTone || "(empty)",
      suggestion: "Check tone_label ordering and phrase guards before fallback scoring.",
    });
  }

  if (expectedHidden && expectedHidden !== actualHidden) {
    hints.push({
      type: "hidden_signal",
      title: "Hidden signal mismatch",
      expected: expectedHidden,
      actual: actualHidden || "(empty)",
      suggestion: "Check primary_hidden_signal derivation and phrase override ordering.",
    });
  }

  if (expectedRegret && expectedRegret !== actualRegret) {
    hints.push({
      type: "regret",
      title: "Regret band mismatch",
      expected: expectedRegret,
      actual: actualRegret || "(empty)",
      suggestion: "Check regret_risk band mapping and UI output mapping.",
    });
  }

  if (expectedPressure && expectedPressure !== actualPressure) {
    hints.push({
      type: "pressure",
      title: "Pressure mismatch",
      expected: expectedPressure,
      actual: actualPressure || "(empty)",
      suggestion: "Check pressure signal thresholds and emotional_pressure mapping.",
    });
  }

  if (expectedReply && expectedReply !== actualReply) {
    hints.push({
      type: "reply_vibe",
      title: "Reply vibe mismatch",
      expected: expectedReply,
      actual: actualReply || "(empty)",
      suggestion: "Check reply likelihood to reply vibe conversion.",
    });
  }

  if (expectedVerdict && expectedVerdict !== actualVerdict) {
    hints.push({
      type: "verdict",
      title: "Verdict mismatch",
      expected: expectedVerdict,
      actual: actualVerdict || "(empty)",
      suggestion: "Check send_decision and consumer output layer mapping.",
    });
  }

  return hints;
}

export function evaluateCase(testCase, apiResult) {
  const expectedTone = normalizeTone(testCase?.expected_tone);
  const actualTone = normalizeTone(apiResult?.tone || apiResult?.label);

  const expectedHidden = normalizeSignal(testCase?.expected_signal);
  const actualHidden = normalizeSignal(
    apiResult?.hidden_signal || apiResult?.primary_hidden_signal
  );

  const expectedRegret = normalize(testCase?.expected_regret || testCase?.expected_regret_band);
  const actualRegret = regretBandFromApi(apiResult);

  const expectedPressure = normalizePressure(testCase?.expected_pressure);
  const actualPressure = pressureBandFromApi(apiResult);

  const expectedReply = normalizeReplyVibe(testCase?.expected_reply_vibe);
  const actualReply = replyBandFromApi(apiResult);

  const expectedVerdict = normalizeExpectedVerdict(testCase?.expected_verdict);
  const actualVerdict = verdictFromApi(apiResult);

  const tonePass = !expectedTone || expectedTone === actualTone;
  const hiddenPass = !expectedHidden || expectedHidden === actualHidden;
  const regretPass = !expectedRegret || expectedRegret === actualRegret;
  const pressurePass = !expectedPressure || expectedPressure === actualPressure;
  const replyPass = !expectedReply || expectedReply === actualReply;
  const verdictPass = !expectedVerdict || expectedVerdict === actualVerdict;

  const mismatchReasons = [];
  if (!tonePass) mismatchReasons.push(`tone expected "${expectedTone}" got "${actualTone}"`);
  if (!hiddenPass) mismatchReasons.push(`signal expected "${expectedHidden}" got "${actualHidden}"`);
  if (!regretPass) mismatchReasons.push(`regret expected "${expectedRegret}" got "${actualRegret}"`);
  if (!pressurePass) mismatchReasons.push(`pressure expected "${expectedPressure}" got "${actualPressure}"`);
  if (!replyPass) mismatchReasons.push(`reply vibe expected "${expectedReply}" got "${actualReply}"`);
  if (!verdictPass) mismatchReasons.push(`verdict expected "${expectedVerdict}" got "${actualVerdict}"`);

  const pass =
    tonePass &&
    hiddenPass &&
    regretPass &&
    pressurePass &&
    replyPass &&
    verdictPass;

  return {
    pass,
    status: pass ? "PASS" : "FAIL",

    expectedTone,
    actualTone,

    expectedHidden,
    actualHidden,

    expectedRegret,
    actualRegret,

    expectedPressure,
    actualPressure,

    expectedReply,
    actualReply,

    expectedVerdict,
    actualVerdict,

    actualRewrite: hasRewrite(apiResult),
    actualAdvisory: hasAdvisory(apiResult),

    mismatchReasons,
    failureHints: buildFailureHints({
      expectedTone,
      actualTone,
      expectedHidden,
      actualHidden,
      expectedRegret,
      actualRegret,
      expectedPressure,
      actualPressure,
      expectedReply,
      actualReply,
      expectedVerdict,
      actualVerdict,
    }),

    apiTone: apiResult?.tone || apiResult?.label || "",
    apiHiddenSignal:
      apiResult?.hidden_signal || apiResult?.primary_hidden_signal || "",
    apiRiskScore: apiResult?.communication_risk_score ?? apiResult?.risk_score ?? "",
    apiRegretRisk: apiResult?.regret_risk ?? "",
    apiReplyLikelihood: apiResult?.reply_likelihood ?? "",
    apiSendDecision:
      apiResult?.send_decision ||
      apiResult?.send_decision_label ||
      apiResult?.send_verdict ||
      "",
    rewrite:
      apiResult?.rewrite_suggestion ||
      apiResult?.rewritten_text ||
      "",
    advisory: apiResult?.advisory || "",
  };
}