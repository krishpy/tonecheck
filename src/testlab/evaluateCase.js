function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function isNoneLike(value) {
  const v = normalize(value);
  return v === "" || v === "none" || v === "null" || v === "undefined";
}

function includesExpected(expected, actual) {
  const e = normalize(expected);
  const a = normalize(actual);

  if (e === "none") {
    return isNoneLike(a);
  }

  return a.includes(e);
}

export function evaluateCase(testCase, apiResult) {
  const actualTone = normalize(apiResult?.tone || apiResult?.label);
  const actualHidden = normalize(apiResult?.primary_hidden_signal);
  const actualRisk = Number(apiResult?.communication_risk_score ?? 0);

  const tonePass = includesExpected(testCase.expected_tone, actualTone);
  const hiddenPass = includesExpected(testCase.expected_hidden_signal, actualHidden);
  const riskPass =
    actualRisk >= Number(testCase.expected_risk_min) &&
    actualRisk <= Number(testCase.expected_risk_max);

  const mismatchReasons = [];
  if (!tonePass) mismatchReasons.push("tone mismatch");
  if (!hiddenPass) mismatchReasons.push("hidden signal mismatch");
  if (!riskPass) mismatchReasons.push("risk out of range");

  return {
    pass: tonePass && hiddenPass && riskPass,
    actualTone,
    actualHidden,
    actualRisk,
    mismatchReasons,
  };
}