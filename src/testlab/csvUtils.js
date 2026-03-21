import Papa from "papaparse";

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const cleaned = (results.data || [])
            .map((row) => ({
              id: String(row.id || "").trim(),
              category: String(row.category || "").trim().toLowerCase(),
              input: String(row.input || "").trim(),
              expected_tone: String(row.expected_tone || "").trim().toLowerCase(),
              expected_hidden_signal: String(row.expected_hidden_signal || "").trim().toLowerCase(),
              expected_risk_min: Number(row.expected_risk_min || 0),
              expected_risk_max: Number(row.expected_risk_max || 0),
              notes: String(row.notes || "").trim(),
            }))
            .filter((row) => row.id && row.input);

          resolve(cleaned);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadResultsCsv(rows, filename = "test_lab_results.csv") {
  const headers = [
    "id",
    "category",
    "input",
    "expected_tone",
    "actual_tone",
    "expected_hidden_signal",
    "actual_hidden_signal",
    "expected_risk_min",
    "expected_risk_max",
    "actual_risk",
    "pass",
    "mismatch_reasons",
    "advisory",
    "rewrite",
    "notes",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) => {
      const e = row.evaluation || {};
      return [
        row.id,
        row.category,
        row.input,
        row.expected_tone,
        e.actualTone || "",
        row.expected_hidden_signal,
        e.actualHidden || "",
        row.expected_risk_min,
        row.expected_risk_max,
        e.actualRisk ?? "",
        e.pass ? "PASS" : "FAIL",
        (e.mismatchReasons || []).join(" | "),
        row.apiResult?.advisory || "",
        row.apiResult?.rewrite || "",
        row.notes || "",
      ]
        .map(escapeCsv)
        .join(",");
    }),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}