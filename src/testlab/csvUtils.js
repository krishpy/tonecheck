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

    // Accept multiple source column names for the message text
    row.input = row.input || row.message || row.text || row.message_text || "";

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

export function downloadResultsCsv(results, filename = "tonecheck_test_results.csv") {
  const columns = [
    "id",
    "category",
    "input",
    "expected_tone",
    "actual_tone",
    "expected_signal",
    "actual_signal",
    "expected_regret",
    "actual_regret",
    "expected_pressure",
    "actual_pressure",
    "expected_reply_vibe",
    "actual_reply_vibe",
    "expected_verdict",
    "actual_verdict",
    "pass",
    "mismatch_reasons",
    "api_tone",
    "api_hidden_signal",
    "api_risk_score",
    "api_regret_risk",
    "api_reply_likelihood",
    "api_send_decision",
    "rewrite",
    "advisory",
  ];

  const escapeCell = (value) => {
    const s = String(value ?? "");
    return `"${s.replaceAll('"', '""')}"`;
  };

  const rows = [
    columns.join(","),
    ...results.map((row) => columns.map((col) => escapeCell(row[col])).join(",")),
  ];

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}