function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function isNoneLike(value) {
  const v = normalize(value);
  return v === "" || v === "none" || v === "null" || v === "undefined";
}

const TONE_ALIASES = {
  passive: ["passive", "passive aggressive"],
  "passive aggressive": ["passive", "passive aggressive"],
  threat: ["threat", "threatening"],
  threatening: ["threat", "threatening"],
};

const HIDDEN_ALIASES = {
  passive: ["passive", "passive_aggression_signal"],
  guilt: ["guilt", "guilt_tripping", "guilt_trip_signal"],
  emotional: ["emotional", "emotional_leverage"],
};

function includesExpectedTone(expected, actual) {
  const e = normalize(expected);
  const a = normalize(actual);

  if (e === a) return true;
  if (TONE_ALIASES[e]?.includes(a)) return true;
  return false;
}

function includesExpectedHidden(expected, actual) {
  const e = normalize(expected);
  const a = normalize(actual);

  if (e === "none") return isNoneLike(a);
  if (e === a) return true;
  if (HIDDEN_ALIASES[e]?.includes(a)) return true;
  return false;
}

export function displayHiddenSignal(signal) {
  if (!signal || signal === "none") return "Nothing tricky detected";
  return signal
    .replace(/_signal$/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function evaluateCase(testCase, apiResult) {
  const actualTone = normalize(apiResult?.tone || apiResult?.label);
  const actualHidden = normalize(apiResult?.primary_hidden_signal);
  const actualRisk = Number(apiResult?.communication_risk_score ?? 0);

  const tonePass = includesExpectedTone(testCase.expected_tone, actualTone);
  const hiddenPass = includesExpectedHidden(testCase.expected_hidden_signal, actualHidden);
  const riskPass =
    actualRisk >= Number(testCase.expected_risk_min) &&
    actualRisk <= Number(testCase.expected_risk_max);

  const mismatchReasons = [];
  if (!tonePass) mismatchReasons.push("tone mismatch");
  if (!hiddenPass) mismatchReasons.push("hidden signal mismatch");
  if (!riskPass) mismatchReasons.push("risk out of range");

  return {
    pass: tonePass && hiddenPass && riskPass,
    status: "DONE",
    actualTone,
    actualHidden,
    actualRisk,
    mismatchReasons,
  };
}