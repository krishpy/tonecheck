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
  const rows = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  if (!lines.length) return rows;
  

  const headers = splitCsvLine(lines[0]).map((h) => cleanCell(h));

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    if (!values.length) continue;

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cleanCell(values[idx] ?? "");
    });

    if (!row.input || !row.input.trim()) return null;

    if (Object.values(row).some((v) => String(v).trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function splitCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  out.push(current);
  return out;
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

export function downloadResultsCsv(rows, filename = "test_lab_results.csv") {
  if (!rows || !rows.length) return;

  const output = rows.map((row) => {
    const e = row.evaluation || {};

    return {
      id: row.id,
      category: row.category,
      input: row.input,
      expected_tone: row.expected_tone,
      actual_tone: e.actualTone || "",
      expected_hidden_signal: row.expected_hidden_signal,
      actual_hidden_signal: e.actualHidden || "",
      expected_risk_min: row.expected_risk_min,
      expected_risk_max: row.expected_risk_max,
      actual_risk: e.actualRisk ?? "",
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
      risk_level: row.apiResult?.risk_level || "",
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