export async function runSingleTest(testCase, baseUrl, signal) {
  if (!testCase.input || !String(testCase.input).trim()) {
    return {
      skipped: true,
      error: "Skipped empty CSV row",
      mismatch_reasons: ["empty input row in csv"],
    };
  }

  const response = await fetch(`${baseUrl}/communication-intelligence/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_API_KEY || "test-default-key",
    },
    body: JSON.stringify({
      message_text: testCase.input,
    }),
    signal,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload?.detail || `HTTP ${response.status}`);
  }

  return payload;
}

export async function runAllTests(testCases, baseUrl, onProgress, signal) {
  const results = [];

  for (let i = 0; i < testCases.length; i += 1) {
    const testCase = testCases[i];

    if (onProgress) {
      onProgress(i, testCases.length, testCase, null);
    }

    try {
      const apiResult = await runSingleTest(testCase, baseUrl, signal);

      const row = {
        ...testCase,
        apiResult: apiResult?.skipped ? null : apiResult,
        error: apiResult?.skipped ? apiResult.error : null,
        skipped: Boolean(apiResult?.skipped),
        mismatch_reasons: apiResult?.mismatch_reasons || [],
      };

      results.push(row);

      if (onProgress) {
        onProgress(i + 1, testCases.length, testCase, row);
      }
    } catch (error) {
      const row = {
        ...testCase,
        apiResult: null,
        error: error?.message || "Request failed",
        skipped: false,
        mismatch_reasons: [],
      };

      results.push(row);

      if (onProgress) {
        onProgress(i + 1, testCases.length, testCase, row);
      }
    }
  }

  return results;
}