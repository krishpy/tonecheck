import { evaluateCase } from "./evaluateCase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function analyzeMessage(input, signal) {
  const response = await fetch(
    `${API_BASE_URL}/communication-intelligence/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY || "test-key",
      },
      body: JSON.stringify({
        message_text: input,
        rewrite_style: "balanced",
        policy_profile: "default",
      }),
      signal,
    }
  );

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail || `HTTP ${response.status}`);
    throw new Error(detail);
  }

  return data;
}

export async function runSingleTest(testCase, signal) {
  const apiResult = await analyzeMessage(testCase.input, signal);
  return evaluateCase(testCase, apiResult);
}

export async function runAllTests(testCases, onProgress, signal) {
  const results = [];

  for (let i = 0; i < testCases.length; i += 1) {
    const testCase = testCases[i];
    let latestRow = null;

    try {
      const apiResult = await analyzeMessage(testCase.input, signal);

      latestRow = {
        ...testCase,
        apiResult,
        error: "",
      };

      const evaluated = evaluateCase(testCase, apiResult);
      results.push({
        ...latestRow,
        evaluation: evaluated,
      });
    } catch (err) {
      latestRow = {
        ...testCase,
        apiResult: null,
        error: err?.message || "Unknown error",
      };

      results.push({
        ...latestRow,
        evaluation: {
          pass: false,
          status: "ERROR",
          actualTone: "",
          actualHidden: "",
          actualRegret: "",
          actualPressure: "",
          actualReply: "",
          actualVerdict: "",
          actualRewrite: false,
          actualAdvisory: false,
          mismatchReasons: [err?.message || "Unknown error"],
          failureHints: [
            {
              type: "error",
              title: "Request/runtime error",
              expected: "successful API response",
              actual: err?.message || "Unknown error",
              suggestion:
                "Check backend logs, endpoint availability, and response schema.",
            },
          ],
        },
      });
    }

    if (typeof onProgress === "function") {
      onProgress(i + 1, testCases.length, testCase, latestRow);
    }
  }

  return results;
}