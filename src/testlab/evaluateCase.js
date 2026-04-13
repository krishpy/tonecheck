function norm(value) {
  return String(value || "").trim().toLowerCase();
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toneNorm(value) {
  const v = norm(value);
  const map = {
    aggressive: "aggressive",
    threatening: "threatening",
    hostile: "aggressive",
    accusatory: "accusatory",
    manipulative: "manipulative",
    frustrated: "frustrated",
    tense: "tense",
    emotional: "emotional",
    firm: "firm",
    professional: "professional",
    polite: "polite",
    friendly: "friendly",
    neutral: "neutral",
    passive_aggressive: "passive aggressive",
    "passive aggressive": "passive aggressive",
  };
  return map[v] || v;
}

function signalNorm(value) {
  const v = norm(value);
  const map = {
    "": "none",
    none: "none",
    "none detected": "none",
    neutral: "none",
    neutral_information: "none",

    threat: "threat_signal",
    threat_signal: "threat_signal",

    insult: "insult_signal",
    insult_signal: "insult_signal",

    profanity: "profanity_signal",
    profanity_signal: "profanity_signal",

    pressure: "pressure_signal",
    pressure_signal: "pressure_signal",

    accusation: "accusation_signal",
    accusation_signal: "accusation_signal",

    guilt_pressure: "guilt_pressure",
    guilt_tripping: "guilt_pressure",
    guilt_trip_signal: "guilt_pressure",

    emotional_leverage: "emotional_leverage",
    emotional_dependency: "emotional_dependency",

    passive_aggression: "passive_aggression_signal",
    passive_aggression_signal: "passive_aggression_signal",
    "passive aggression": "passive_aggression_signal",

    hostile_command: "hostile_command_signal",
    hostile_command_signal: "hostile_command_signal",

    boundary_signal: "boundary_signal",
  };
  return map[v] || v;
}

function levelNorm(value) {
  const v = norm(value);
  if (["low", "medium", "high"].includes(v)) return v;
  return "low";
}

function verdictNorm(value) {
  const v = norm(value);
  const map = {
    send: "send",
    safe: "send",
    safe_to_send: "send",

    refine: "review",
    review: "review",
    review_before_sending: "review",
    rethink: "review",

    do_not_send: "dont_send",
    dont_send: "dont_send",
    "don't send": "dont_send",
  };
  return map[v] || v;
}

function getActualTone(result) {
  return toneNorm(result?.tone || result?.label);
}

function getActualSignal(result) {
  return signalNorm(
    result?.primary_hidden_signal ||
      result?.hidden_signal ||
      result?.primary_manipulation_signal
  );
}

function getActualRegret(result) {
  return levelNorm(result?.chance_of_regret || result?.regret_risk_band);
}

function getActualPressure(result) {
  return levelNorm(result?.emotional_pressure);
}

function getActualReplyVibe(result) {
  return levelNorm(result?.reply_vibe);
}

function getActualVerdict(result) {
  return verdictNorm(result?.send_decision || result?.send_verdict);
}

function compareField(expected, actual) {
  if (!expected) return { pass: true };
  return {
    pass: expected === actual,
    expected,
    actual,
  };
}

export function evaluateCase(testCase, result) {
  const expectedTone = toneNorm(testCase.expected_tone);
  const expectedSignal = signalNorm(testCase.expected_signal);
  const expectedRegret = levelNorm(testCase.expected_regret);
  const expectedPressure = levelNorm(testCase.expected_pressure);
  const expectedReplyVibe = levelNorm(testCase.expected_reply_vibe);
  const expectedVerdict = verdictNorm(testCase.expected_verdict);

  const actualTone = getActualTone(result);
  const actualSignal = getActualSignal(result);
  const actualRegret = getActualRegret(result);
  const actualPressure = getActualPressure(result);
  const actualReplyVibe = getActualReplyVibe(result);
  const actualVerdict = getActualVerdict(result);

  const toneCheck = compareField(expectedTone, actualTone);
  const signalCheck = compareField(expectedSignal, actualSignal);
  const regretCheck = compareField(expectedRegret, actualRegret);
  const pressureCheck = compareField(expectedPressure, actualPressure);
  const replyCheck = compareField(expectedReplyVibe, actualReplyVibe);
  const verdictCheck = compareField(expectedVerdict, actualVerdict);

  const mismatches = [];

  if (!toneCheck.pass) mismatches.push(`tone: expected ${expectedTone}, got ${actualTone}`);
  if (!signalCheck.pass) mismatches.push(`signal: expected ${expectedSignal}, got ${actualSignal}`);
  if (!regretCheck.pass) mismatches.push(`regret: expected ${expectedRegret}, got ${actualRegret}`);
  if (!pressureCheck.pass) mismatches.push(`pressure: expected ${expectedPressure}, got ${actualPressure}`);
  if (!replyCheck.pass) mismatches.push(`reply_vibe: expected ${expectedReplyVibe}, got ${actualReplyVibe}`);
  if (!verdictCheck.pass) mismatches.push(`verdict: expected ${expectedVerdict}, got ${actualVerdict}`);
  return {
    id: testCase.id,
    category: testCase.category,
    input: testCase.input,

    expected_tone: expectedTone,
    actual_tone: actualTone,
    actualTone,

    expected_signal: expectedSignal,
    actual_signal: actualSignal,
    actualHidden: actualSignal,

    expected_regret: expectedRegret,
    actual_regret: actualRegret,
    actualRegret,

    expected_pressure: expectedPressure,
    actual_pressure: actualPressure,
    actualPressure,

    expected_reply_vibe: expectedReplyVibe,
    actual_reply_vibe: actualReplyVibe,
    actualReply: actualReplyVibe,

    expected_verdict: expectedVerdict,
    actual_verdict: actualVerdict,
    actualVerdict,

    pass: mismatches.length === 0 ? "PASS" : "FAIL",
    mismatch_reasons: mismatches.join(" | "),
    mismatchReasons: mismatches,

    api_tone: result?.tone || "",
    api_hidden_signal: result?.primary_hidden_signal || result?.hidden_signal || "",
    api_risk_score: safeNumber(result?.communication_risk_score ?? result?.risk_score),
    api_regret_risk: safeNumber(result?.regret_risk),
    api_reply_likelihood: safeNumber(result?.reply_likelihood),
    api_send_decision: result?.send_decision || result?.send_verdict || "",
    rewrite: result?.rewritten_text || result?.rewrite_suggestion || "",
    advisory: result?.advisory || "",
  };
}