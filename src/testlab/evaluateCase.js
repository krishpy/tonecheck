

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeLoose(value) {
  return normalize(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isNoneLike(value) {
  const v = normalizeLoose(value);
  return (
    v === "" ||
    v === "none" ||
    v === "null" ||
    v === "undefined" ||
    v === "none detected" ||
    v === "nothing tricky detected"
  );
}

const TONE_ALIASES = {
  calm: ["calm", "neutral", "polite"],
  neutral: ["neutral", "calm", "polite", "direct"],
  polite: ["polite", "neutral", "calm", "direct"],
  direct: ["direct", "neutral", "polite"],
  tense: ["tense", "frustrated", "firm", "aggressive", "accusatory"],
  frustrated: ["frustrated", "tense", "aggressive", "accusatory"],
  aggressive: ["aggressive", "frustrated", "tense", "accusatory"],
  accusatory: ["accusatory", "aggressive", "tense"],
  manipulative: ["manipulative", "passive aggressive", "tense"],
  passive: ["passive", "passive aggressive"],
  "passive aggressive": ["passive aggressive", "passive", "manipulative"],
  threat: ["threat", "threatening"],
  threatening: ["threatening", "threat"],
};

const HIDDEN_ALIASES = {
  none: ["none", "none detected", "nothing tricky detected"],
  passive: [
    "passive",
    "passive aggression",
    "passive aggression signal",
  ],
  guilt: [
    "guilt",
    "guilt tripping",
    "guilt trip",
    "guilt trip signal",
    "emotional leverage",
  ],
  emotional: [
    "emotional",
    "emotional pressure",
    "emotional leverage",
    "guilt tripping",
    "guilt trip signal",
  ],
  pressure: [
    "pressure",
    "emotional pressure",
    "accusation signal",
    "accusatory pressure signal",
  ],
};

const BAND_ALIASES = {
  low: ["low", "poor"],
  medium: ["medium", "mixed"],
  high: ["high", "good"],
  poor: ["poor", "low"],
  mixed: ["mixed", "medium"],
  good: ["good", "high", "medium"],
};

const VERDICT_ALIASES = {
  send: ["send", "safe to send", "send as is"],
  review: [
    "review",
    "review before sending",
    "check before sending",
    "send but refine it",
    "send — but refine it",
    "careful",
    "careful — may be misunderstood",
  ],
  "do not send": ["do not send", "don't send", "better not send"],
};

function readTone(apiResult) {
  return normalizeLoose(
    apiResult?.tone ||
      apiResult?.tone_label ||
      apiResult?.label ||
      apiResult?.detected_tone
  );
}

function readHidden(apiResult) {
  return normalizeLoose(
    apiResult?.primary_hidden_signal ||
      apiResult?.hidden_signal ||
      apiResult?.hidden_signal_label ||
      apiResult?.what_could_happen?.hidden_signal
  );
}

function readRegretBand(apiResult) {
  return normalizeLoose(
    apiResult?.chance_of_regret ||
      apiResult?.regret_band ||
      apiResult?.regret_risk_label ||
      apiResult?.regret_level
  );
}

function readPressureBand(apiResult) {
  return normalizeLoose(
    apiResult?.emotional_pressure ||
      apiResult?.emotional_pressure_band ||
      apiResult?.pressure_label ||
      apiResult?.manipulation_band
  );
}

function readReplyVibe(apiResult) {
  return normalizeLoose(
    apiResult?.reply_vibe ||
      apiResult?.reply_likelihood_band ||
      apiResult?.reply_likelihood_label ||
      apiResult?.reply_outlook
  );
}
function readConsumerVerdict(apiResult) {
  const explicitVerdict = normalizeLoose(
    apiResult?.send_decision_label ||
    apiResult?.send_decision ||
    apiResult?.send_verdict ||
    apiResult?.verdict
  );

  if (explicitVerdict) return explicitVerdict;

  const tone = readTone(apiResult);
  const hidden = readHidden(apiResult);

  const risk =
    Number(apiResult?.communication_risk_score) ||
    Number(apiResult?.risk_score) ||
    Number(apiResult?.risk) ||
    0;

  const regret =
    Number(apiResult?.regret_risk) ||
    Number(apiResult?.regret_score) ||
    0;

  const manipulation =
    Number(apiResult?.manipulation_risk) ||
    Number(apiResult?.manipulation_score) ||
    0;

  const threat =
    Number(apiResult?.threat_score) ||
    0;

  if (
    threat >= 60 ||
    tone.includes("threat") ||
    hidden.includes("threat")
  ) {
    return "do not send";
  }

  if (
    tone.includes("manipulative") ||
    hidden.includes("guilt") ||
    hidden.includes("emotional leverage") ||
    manipulation >= 40
  ) {
    return "review";
  }

  if (
    tone.includes("passive aggressive") ||
    tone.includes("accusatory") ||
    hidden.includes("pressure") ||
    hidden.includes("accusation") ||
    risk >= 50 ||
    regret >= 60
  ) {
    return "review";
  }

  return "send";
}

function hasRewrite(apiResult) {
  return Boolean(
    normalize(apiResult?.rewritten_text) ||
      normalize(apiResult?.rewrite_suggestion) ||
      normalize(apiResult?.rewrite)
  );
}

function hasAdvisory(apiResult) {
  return Boolean(normalize(apiResult?.advisory));
}

function matchExpected(expected, actual, aliases = {}) {
  const e = normalizeLoose(expected);
  const a = normalizeLoose(actual);

  if (!e && !a) return true;
  if (e === a) return true;
  if (e === "none") return isNoneLike(a);
  if (aliases[e]?.includes(a)) return true;

  return false;
}

function parseBooleanExpected(value) {
  const v = normalizeLoose(value);
  if (!v) return null;
  if (["yes", "true", "1", "y"].includes(v)) return true;
  if (["no", "false", "0", "n"].includes(v)) return false;
  return null;
}

function buildFailureHints({
  tonePass,
  hiddenPass,
  regretPass,
  pressurePass,
  replyPass,
  verdictPass,
  rewritePass,
  advisoryPass,
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
  expectedRewrite,
  actualRewrite,
  expectedAdvisory,
  actualAdvisory,
}) {
  const hints = [];

  if (!tonePass) {
    hints.push({
      type: "tone",
      title: "Tone mismatch",
      expected: expectedTone || "not set",
      actual: actualTone || "none",
      suggestion: "Check final consumer tone label mapping.",
    });
  }

  if (!hiddenPass) {
    hints.push({
      type: "hidden",
      title: "Hidden signal mismatch",
      expected: expectedHidden || "not set",
      actual: actualHidden || "none",
      suggestion: "Check hidden-signal label aliases for ToneCheck.",
    });
  }

  if (!regretPass) {
    hints.push({
      type: "regret",
      title: "Chance of regret mismatch",
      expected: expectedRegret || "not set",
      actual: actualRegret || "none",
      suggestion: "Either expose regret band in API output or skip this field until wired.",
    });
  }

  if (!pressurePass) {
    hints.push({
      type: "pressure",
      title: "Emotional pressure mismatch",
      expected: expectedPressure || "not set",
      actual: actualPressure || "none",
      suggestion: "Either expose emotional pressure band in API output or skip this field until wired.",
    });
  }

  if (!replyPass) {
    hints.push({
      type: "reply",
      title: "Reply vibe mismatch",
      expected: expectedReply || "not set",
      actual: actualReply || "none",
      suggestion: "Check reply vibe band mapping used in consumer UI.",
    });
  }

  if (!verdictPass) {
    hints.push({
      type: "verdict",
      title: "Send verdict mismatch",
      expected: expectedVerdict || "not set",
      actual: actualVerdict || "none",
      suggestion: "Check ToneCheck consumer decision mapping.",
    });
  }

  if (!rewritePass) {
    hints.push({
      type: "rewrite",
      title: "Rewrite presence mismatch",
      expected: String(expectedRewrite),
      actual: String(actualRewrite),
      suggestion: "Do not require rewrite for clearly safe/simple inputs unless product wants it always.",
    });
  }

  if (!advisoryPass) {
    hints.push({
      type: "advisory",
      title: "Advisory presence mismatch",
      expected: String(expectedAdvisory),
      actual: String(actualAdvisory),
      suggestion: "Check advisory generation and fallback mapping.",
    });
  }

  return hints;
}

export function evaluateCase(testCase, apiResult) {
  const actualTone = readTone(apiResult);
  const actualHidden = readHidden(apiResult);
  const actualRegret = readRegretBand(apiResult);
  const actualPressure = readPressureBand(apiResult);
  const actualReply = readReplyVibe(apiResult);
  const actualVerdict = readConsumerVerdict(apiResult);
  const actualRewrite = hasRewrite(apiResult);
  const actualAdvisory = hasAdvisory(apiResult);

  const expectedRewrite = parseBooleanExpected(testCase.expected_rewrite_present);
  const expectedAdvisory = parseBooleanExpected(testCase.expected_advisory_present);

  const tonePass = matchExpected(testCase.expected_tone, actualTone, TONE_ALIASES);
  const hiddenPass = matchExpected(
    testCase.expected_hidden_signal,
    actualHidden,
    HIDDEN_ALIASES
  );

  const regretPass = !normalize(testCase.expected_regret_band)
    ? true
    : !actualRegret
      ? true
      : matchExpected(testCase.expected_regret_band, actualRegret, BAND_ALIASES);

  const pressurePass = !normalize(testCase.expected_emotional_pressure_band)
    ? true
    : !actualPressure
      ? true
      : matchExpected(
          testCase.expected_emotional_pressure_band,
          actualPressure,
          BAND_ALIASES
        );

  const replyPass = !normalize(testCase.expected_reply_vibe)
    ? true
    : matchExpected(testCase.expected_reply_vibe, actualReply, BAND_ALIASES);

  const verdictPass = !normalize(testCase.expected_send_verdict)
    ? true
    : matchExpected(testCase.expected_send_verdict, actualVerdict, VERDICT_ALIASES);

  const rewritePass =
    expectedRewrite === null ? true : expectedRewrite === actualRewrite;

  const advisoryPass =
    expectedAdvisory === null ? true : expectedAdvisory === actualAdvisory;

  const mismatchReasons = [];
  if (!tonePass) mismatchReasons.push("tone mismatch");
  if (!hiddenPass) mismatchReasons.push("hidden signal mismatch");
  if (!regretPass) mismatchReasons.push("chance of regret mismatch");
  if (!pressurePass) mismatchReasons.push("emotional pressure mismatch");
  if (!replyPass) mismatchReasons.push("reply vibe mismatch");
  if (!verdictPass) mismatchReasons.push("send verdict mismatch");
  if (!rewritePass) mismatchReasons.push("rewrite presence mismatch");
  if (!advisoryPass) mismatchReasons.push("advisory presence mismatch");

  const failureHints = buildFailureHints({
    tonePass,
    hiddenPass,
    regretPass,
    pressurePass,
    replyPass,
    verdictPass,
    rewritePass,
    advisoryPass,
    expectedTone: testCase.expected_tone,
    actualTone,
    expectedHidden: testCase.expected_hidden_signal,
    actualHidden,
    expectedRegret: testCase.expected_regret_band,
    actualRegret,
    expectedPressure: testCase.expected_emotional_pressure_band,
    actualPressure,
    expectedReply: testCase.expected_reply_vibe,
    actualReply,
    expectedVerdict: testCase.expected_send_verdict,
    actualVerdict,
    expectedRewrite,
    actualRewrite,
    expectedAdvisory,
    actualAdvisory,
  });

  return {
    pass:
      tonePass &&
      hiddenPass &&
      regretPass &&
      pressurePass &&
      replyPass &&
      verdictPass &&
      rewritePass &&
      advisoryPass,
    status: "DONE",
    actualTone,
    actualHidden,
    actualRegret,
    actualPressure,
    actualReply,
    actualVerdict,
    actualRewrite,
    actualAdvisory,
    mismatchReasons,
    failureHints,
  };
}