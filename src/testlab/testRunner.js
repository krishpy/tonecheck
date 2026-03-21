export async function runSingleTest(testCase, baseUrl, signal) {
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

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}

export async function runAllTests(testCases, baseUrl, onProgress, signal) {
  const results = [];

  for (let i = 0; i < testCases.length; i += 1) {
    const testCase = testCases[i];

    try {
      const apiResult = await runSingleTest(testCase, baseUrl, signal);
      results.push({
        ...testCase,
        apiResult,
        error: null,
      });
    } catch (error) {
      results.push({
        ...testCase,
        apiResult: null,
        error: error?.message || "Request failed",
      });
    }

    if (onProgress) {
      onProgress(i + 1, testCases.length);
    }
  }

  return results;
}