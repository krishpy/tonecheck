import { evaluateCase } from "./evaluateCase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function analyzeMessage(input) {
  const response = await fetch(`${API_BASE_URL}/communication-intelligence/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_API_KEY || "test-key",
    },
    body: JSON.stringify({
      text: input,
      rewrite_style: "balanced",
      policy_profile: "default",
    }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.detail || `HTTP ${response.status}`);
  }

  return data;
}

export async function runSingleTest(testCase) {
  const result = await analyzeMessage(testCase.input);
  return evaluateCase(testCase, result);
}

export async function runAllTests(testCases, onProgress) {
  const results = [];

  for (let i = 0; i < testCases.length; i += 1) {
    const testCase = testCases[i];

    try {
      const evaluated = await runSingleTest(testCase);
      results.push(evaluated);
    } catch (err) {
      results.push({
        id: testCase.id,
        category: testCase.category,
        input: testCase.input,
        expected_tone: testCase.expected_tone || "",
        actual_tone: "",
        expected_signal: testCase.expected_signal || "",
        actual_signal: "",
        expected_regret: testCase.expected_regret || "",
        actual_regret: "",
        expected_pressure: testCase.expected_pressure || "",
        actual_pressure: "",
        expected_reply_vibe: testCase.expected_reply_vibe || "",
        actual_reply_vibe: "",
        expected_verdict: testCase.expected_verdict || "",
        actual_verdict: "",
        pass: "ERROR",
        mismatch_reasons: err.message || "Unknown error",
        api_tone: "",
        api_hidden_signal: "",
        api_risk_score: "",
        api_regret_risk: "",
        api_reply_likelihood: "",
        api_send_decision: "",
        rewrite: "",
        advisory: "",
      });
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: testCases.length,
      });
    }
  }

  return results;
}