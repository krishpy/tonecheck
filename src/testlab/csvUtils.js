export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const rows = parseCSVText(text);
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read CSV file"));
    reader.readAsText(file);
  });
}

function parseCSVText(text) {
  const normalized = String(text || "").replace(/\r\n/g, "\n");
  const rows = [];

  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i += 1) {
    const ch = normalized[i];
    const next = normalized[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (ch === "\n" && !inQuotes) {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += ch;
  }

  currentRow.push(currentCell);
  if (currentRow.some((cell) => String(cell).trim() !== "")) {
    rows.push(currentRow);
  }

  if (!rows.length) return [];

  const headers = rows[0].map((h) => cleanCell(h));
  const output = [];

  for (let i = 1; i < rows.length; i += 1) {
    const values = rows[i];
    if (!values.length) continue;

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cleanCell(values[idx] ?? "");
    });

    if (!row.input || !row.input.trim()) continue;

    if (!row.id) row.id = `CSV-${i}`;
    if (!row.category) row.category = "uncategorized";

    output.push(row);
  }

  return output;
}

function cleanCell(value) {
  return String(value ?? "").trim();
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadResultsCsv(rows, filename = "tonecheck_test_lab_results.csv") {
  if (!rows || !rows.length) return;

  const output = rows.map((row) => {
    const e = row.evaluation || {};

    return {
      id: row.id,
      category: row.category,
      input: row.input,
      expected_tone: row.expected_tone || "",
      actual_tone: e.actualTone || "",
      expected_hidden_signal: row.expected_hidden_signal || "",
      actual_hidden_signal: e.actualHidden || "",
      expected_regret_band: row.expected_regret_band || "",
      actual_regret_band: e.actualRegret || "",
      expected_emotional_pressure_band:
        row.expected_emotional_pressure_band || "",
      actual_band: e.actualPressure || "",
      expected_reply_vibe: row.expected_reply_vibe || "",
      actual_reply_vibe: e.actualReply || "",
      expected_send_verdict: row.expected_send_verdict || "",
      actual_send_verdict: e.actualVerdict || "",
      expected_rewrite_present: row.expected_rewrite_present || "",
      actual_rewrite_present:
        typeof e.actualRewrite === "boolean" ? String(e.actualRewrite) : "",
      expected_advisory_present: row.expected_advisory_present || "",
      actual_advisory_present:
        typeof e.actualAdvisory === "boolean" ? String(e.actualAdvisory) : "",
      pass:
        e.status === "ERROR"
          ? "ERROR"
          : e.pass
            ? "PASS"
            : "FAIL",
      mismatch_reasons: (e.mismatchReasons || []).join(" | "),
      advisory: row.apiResult?.advisory || "",
      rewrite:
        row.apiResult?.rewrite_suggestion ||
        row.apiResult?.rewritten_text ||
        row.apiResult?.rewrite ||
        "",
      notes: row.notes || "",
      model_version: row.apiResult?.model_version || "",
    };
  });

  const headers = Object.keys(output[0]);
  const csv = [
    headers.join(","),
    ...output.map((record) =>
      headers.map((header) => escapeCsv(record[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}