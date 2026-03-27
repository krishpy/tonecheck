import React, { useMemo, useRef, useState } from "react";
import { DEFAULT_TEST_CASES } from "../testlab/testCases";
import { runAllTests } from "../testlab/testRunner";
import { evaluateCase } from "../testlab/evaluateCase";
import { parseCsvFile, downloadResultsCsv } from "../testlab/csvUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function cardStyle({ good = false, bad = false, warn = false } = {}) {
  const border = bad
    ? "1px solid rgba(255,92,92,0.28)"
    : good
      ? "1px solid rgba(58,194,122,0.28)"
      : warn
        ? "1px solid rgba(255,196,92,0.28)"
        : "1px solid rgba(255,255,255,0.08)";

  const bg = bad
    ? "rgba(255,92,92,0.08)"
    : good
      ? "rgba(58,194,122,0.08)"
      : warn
        ? "rgba(255,196,92,0.08)"
        : "rgba(255,255,255,0.04)";

  return {
    border,
    background: bg,
    borderRadius: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  };
}

function StatCard({ label, value, subtitle, tone = "default" }) {
  const props =
    tone === "good"
      ? { good: true }
      : tone === "bad"
        ? { bad: true }
        : tone === "warn"
          ? { warn: true }
          : {};

  return (
    <div style={{ ...cardStyle(props), padding: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{value}</div>
      {subtitle ? (
        <div style={{ fontSize: 13, opacity: 0.72, marginTop: 6 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: active
          ? "1px solid #7c5cff"
          : "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(124,92,255,0.18)" : "rgba(255,255,255,0.04)",
        color: "#fff",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

function ProgressBar({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          height: 10,
          width: "100%",
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: "linear-gradient(90deg, #7c5cff, #5dd6ff)",
            transition: "width 180ms ease",
          }}
        />
      </div>
      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.76 }}>
        {done}/{total} completed · {pct}%
      </div>
    </div>
  );
}

function fileToCasesLabel(sourceName, count) {
  if (!sourceName) return `${count} loaded`;
  return `${sourceName} · ${count} cases`;
}

function groupByCategory(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const key = row.category || "uncategorized";

    if (!grouped.has(key)) {
      grouped.set(key, {
        category: key,
        total: 0,
        passed: 0,
        failed: 0,
        errored: 0,
      });
    }

    const bucket = grouped.get(key);
    bucket.total += 1;

    if (row.evaluation?.status === "ERROR") bucket.errored += 1;
    else if (row.evaluation?.pass) bucket.passed += 1;
    else bucket.failed += 1;
  });

  return Array.from(grouped.values()).sort(
    (a, b) =>
      b.failed - a.failed ||
      b.errored - a.errored ||
      a.category.localeCompare(b.category)
  );
}

function mismatchSummary(rows) {
  const counts = new Map();

  rows.forEach((row) => {
    (row.evaluation?.mismatchReasons || []).forEach((reason) => {
      counts.set(reason, (counts.get(reason) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

function statusTone(row) {
  if (row.evaluation?.status === "ERROR") return "warn";
  return row.evaluation?.pass ? "good" : "bad";
}

function statusLabel(row) {
  if (row.evaluation?.status === "ERROR") return "ERROR";
  return row.evaluation?.pass ? "PASS" : "FAIL";
}

function topModelVersion(rows) {
  const versions = rows.map((r) => r.apiResult?.model_version).filter(Boolean);
  return versions[0] || "—";
}

export default function TestLab() {
  const [testCases, setTestCases] = useState(DEFAULT_TEST_CASES);
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState("all");
  const [progress, setProgress] = useState({
    done: 0,
    total: DEFAULT_TEST_CASES.length,
    currentId: "",
    currentInput: "",
  });
  const [sourceName, setSourceName] = useState("default");
  const [uploadError, setUploadError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);

  async function handleRunAll() {
    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setRows([]);
    setExpandedId(null);
    setProgress({
      done: 0,
      total: testCases.length,
      currentId: "",
      currentInput: "",
    });

    try {
      const rawResults = await runAllTests(
        testCases,
        API_BASE_URL,
        (done, total, currentCase, latestRow) => {
          setProgress({
            done,
            total,
            currentId: currentCase?.id || "",
            currentInput: currentCase?.input || "",
          });

          if (!latestRow) return;

          const evaluatedRow = latestRow.error || !latestRow.apiResult
            ? {
                ...latestRow,
                evaluation: {
                  pass: false,
                  status: "ERROR",
                  actualTone: "",
                  actualHidden: "",
                  actualRisk: 0,
                  mismatchReasons: [latestRow.error || "no result"],
                },
              }
            : {
                ...latestRow,
                evaluation: evaluateCase(latestRow, latestRow.apiResult),
              };

          setRows((prev) => [...prev, evaluatedRow]);
        },
        controller.signal
      );

      return rawResults;
    } finally {
      setRunning(false);
      abortRef.current = null;
      setProgress((prev) => ({
        ...prev,
        currentId: "",
        currentInput: "",
      }));
    }
  }

  function handleStop() {
    if (abortRef.current) abortRef.current.abort();
    setRunning(false);
  }

  async function handleCsvUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");

    try {
      const parsed = await parseCsvFile(file);

      if (!parsed.length) {
        setUploadError("CSV loaded, but no valid rows were found.");
        return;
      }

      setTestCases(parsed);
      setRows([]);
      setProgress({
        done: 0,
        total: parsed.length,
        currentId: "",
        currentInput: "",
      });
      setSourceName(file.name);
      setSearch("");
      setExpandedId(null);
    } catch (err) {
      setUploadError(err?.message || "Failed to parse CSV.");
    }
  }

  function handleResetDefault() {
    setTestCases(DEFAULT_TEST_CASES);
    setRows([]);
    setProgress({
      done: 0,
      total: DEFAULT_TEST_CASES.length,
      currentId: "",
      currentInput: "",
    });
    setSourceName("default");
    setUploadError("");
    setSearch("");
    setExpandedId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleCopyFailures() {
    const failed = rows
      .filter((row) => !row.evaluation?.pass || row.evaluation?.status === "ERROR")
      .map((row) => {
        const e = row.evaluation || {};
        return [
          `${row.id} · ${row.category}`,
          row.input,
          `Expected tone: ${row.expected_tone}`,
          `Actual tone: ${e.actualTone || "-"}`,
          `Expected hidden: ${row.expected_hidden_signal}`,
          `Actual hidden: ${e.actualHidden || "-"}`,
          `Expected risk: ${row.expected_risk_min}–${row.expected_risk_max}`,
          `Actual risk: ${e.actualRisk ?? "-"}`,
          `Issues: ${(e.mismatchReasons || []).join(", ")}`,
        ].join("\n");
      })
      .join("\n\n--------------------\n\n");

    navigator.clipboard.writeText(failed || "No failures");
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const passed = rows.filter((row) => row.evaluation?.pass).length;
    const errored = rows.filter((row) => row.evaluation?.status === "ERROR").length;
    const failed = total - passed - errored;
    const passRate = total ? Math.round((passed / total) * 100) : 0;
    const summary = mismatchSummary(rows);

    return {
      total,
      passed,
      failed,
      errored,
      passRate,
      topMismatch: summary[0]?.reason || "—",
      topMismatchCount: summary[0]?.count || 0,
    };
  }, [rows]);

  const categoryStats = useMemo(() => groupByCategory(rows), [rows]);
  const mismatchStats = useMemo(() => mismatchSummary(rows), [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((row) => {
      const status = row.evaluation?.status;
      const pass = row.evaluation?.pass;

      const inFilter =
        filter === "all"
          ? true
          : filter === "failed"
            ? !pass && status !== "ERROR"
            : filter === "passed"
              ? !!pass
              : filter === "error"
                ? status === "ERROR"
                : row.category === filter;

      const inSearch =
        !q ||
        String(row.id || "").toLowerCase().includes(q) ||
        String(row.category || "").toLowerCase().includes(q) ||
        String(row.input || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualTone || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualHidden || "").toLowerCase().includes(q) ||
        String(row.evaluation?.mismatchReasons || [])
          .join(" ")
          .toLowerCase()
          .includes(q);

      return inFilter && inSearch;
    });
  }, [rows, filter, search]);

  const allCategories = useMemo(
    () => [...new Set(testCases.map((c) => c.category).filter(Boolean))].sort(),
    [testCases]
  );

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gap: 18 }}>
        <div
          style={{
            position: "sticky",
            top: 12,
            zIndex: 10,
            borderRadius: 24,
            padding: 24,
            background:
              "linear-gradient(180deg, rgba(27,27,40,0.98) 0%, rgba(20,20,30,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
            Internal QA
          </div>
          <h1 style={{ margin: 0, fontSize: 34 }}>Production Test Lab</h1>
          <p
            style={{
              marginTop: 10,
              opacity: 0.8,
              maxWidth: 900,
              lineHeight: 1.5,
            }}
          >
            Upload a CSV or use the built-in set, run it against the live
            CommIntel endpoint, and see exactly which case is running, where the
            failures cluster, and what changed.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            <button
              onClick={handleRunAll}
              disabled={running || !testCases.length}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontWeight: 800,
                background: "linear-gradient(90deg, #7c5cff, #5dd6ff)",
                color: "#101018",
              }}
            >
              {running
                ? `Running ${progress.done}/${progress.total}`
                : "Run All Tests"}
            </button>

            <button
              onClick={handleStop}
              disabled={!running}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: running ? "pointer" : "not-allowed",
                fontWeight: 700,
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
              }}
            >
              Stop
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={running}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                fontWeight: 700,
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
              }}
            >
              Upload CSV
            </button>

            <button
              onClick={handleResetDefault}
              disabled={running}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                fontWeight: 700,
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
              }}
            >
              Load Default Cases
            </button>

            <button
              onClick={() => downloadResultsCsv(rows)}
              disabled={!rows.length || running}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: rows.length ? "pointer" : "not-allowed",
                fontWeight: 700,
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
              }}
            >
              Download Results
            </button>

            <button
              onClick={handleCopyFailures}
              disabled={!rows.length}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: rows.length ? "pointer" : "not-allowed",
                fontWeight: 700,
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
              }}
            >
              Copy Failures
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.76 }}>
            Dataset: {fileToCasesLabel(sourceName, testCases.length)} · Model:{" "}
            {topModelVersion(rows)}
          </div>

          {running ? (
            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <ProgressBar done={progress.done} total={progress.total} />
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.72 }}>
                  Currently running
                </div>
                <div style={{ marginTop: 6, fontWeight: 800 }}>
                  {progress.currentId || "—"}
                </div>
                <div style={{ marginTop: 4, opacity: 0.88 }}>
                  {progress.currentInput || "Waiting..."}
                </div>
              </div>
            </div>
          ) : null}

          {uploadError ? (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: "rgba(255,92,92,0.08)",
                border: "1px solid rgba(255,92,92,0.28)",
                color: "#ffb7b7",
                fontWeight: 700,
              }}
            >
              {uploadError}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 12,
          }}
        >
          <StatCard label="Total" value={stats.total} subtitle="Completed cases" />
          <StatCard
            label="Passed"
            value={stats.passed}
            subtitle="Green cases"
            tone="good"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            subtitle="Needs tuning"
            tone="bad"
          />
          <StatCard
            label="Errors"
            value={stats.errored}
            subtitle="Request/runtime issues"
            tone="warn"
          />
          <StatCard
            label="Pass Rate"
            value={`${stats.passRate}%`}
            subtitle="Overall score"
          />
          <StatCard
            label="Top mismatch"
            value={stats.topMismatchCount}
            subtitle={stats.topMismatch}
          />
        </div>

        <div style={{ ...cardStyle(), padding: 16, display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Filters</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Pill active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </Pill>
            <Pill
              active={filter === "failed"}
              onClick={() => setFilter("failed")}
            >
              Failed Only
            </Pill>
            <Pill
              active={filter === "passed"}
              onClick={() => setFilter("passed")}
            >
              Passed Only
            </Pill>
            <Pill active={filter === "error"} onClick={() => setFilter("error")}>
              Errors
            </Pill>
            {allCategories.map((category) => (
              <Pill
                key={category}
                active={filter === category}
                onClick={() => setFilter(category)}
              >
                {category}
              </Pill>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by id, category, tone, hidden signal, mismatch, or text"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 400px)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 14 }}>
            {filteredRows.map((row, idx) => {
              const e = row.evaluation || {};
              const expanded = expandedId === row.id;
              const tone = statusTone(row);
              const isCurrentRunning =
                running &&
                progress.currentId === row.id &&
                progress.done <= idx + 1;

              return (
                <div
                  key={`${row.id}-${idx}`}
                  style={{
                    ...cardStyle(
                      tone === "good"
                        ? { good: true }
                        : tone === "bad"
                          ? { bad: true }
                          : { warn: true }
                    ),
                    padding: 18,
                    outline: isCurrentRunning
                      ? "2px solid rgba(93,214,255,0.9)"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      {row.id} · {row.category}
                    </div>
                    <div
                      style={{
                        fontWeight: 900,
                        color:
                          tone === "good"
                            ? "#7df0a8"
                            : tone === "bad"
                              ? "#ff8e8e"
                              : "#ffd38e",
                      }}
                    >
                      {statusLabel(row)}
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 17, lineHeight: 1.45 }}>
                    {row.input}
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                      fontSize: 14,
                      opacity: 0.92,
                    }}
                  >
                    <div>
                      <strong>Expected tone:</strong> {row.expected_tone}
                    </div>
                    <div>
                      <strong>Actual tone:</strong> {e.actualTone || "-"}
                    </div>
                    <div>
                      <strong>Expected hidden:</strong>{" "}
                      {row.expected_hidden_signal}
                    </div>
                    <div>
                      <strong>Actual hidden:</strong> {e.actualHidden || "-"}
                    </div>
                    <div>
                      <strong>Expected risk:</strong> {row.expected_risk_min}–{row.expected_risk_max}
                    </div>
                    <div>
                      <strong>Actual risk:</strong> {e.actualRisk ?? "-"}
                    </div>
                  </div>

                  {row.apiResult?.model_version ? (
                    <div style={{ marginTop: 10, fontSize: 13, opacity: 0.72 }}>
                      <strong>Model:</strong> {row.apiResult.model_version}
                    </div>
                  ) : null}

                  {(e.mismatchReasons || []).length ? (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 12,
                        background: "rgba(0,0,0,0.18)",
                        color:
                          tone === "warn" ? "#ffd38e" : "#ffb7b7",
                        fontWeight: 700,
                      }}
                    >
                      {(e.mismatchReasons || []).join(", ")}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setExpandedId(expanded ? null : row.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {expanded ? "Hide Details" : "Show Details"}
                    </button>
                  </div>

                  {expanded ? (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 14,
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      {row.notes ? (
                        <div>
                          <strong>Notes:</strong> {row.notes}
                        </div>
                      ) : null}

                      {row.apiResult?.advisory ? (
                        <div>
                          <strong>Advisory:</strong> {row.apiResult.advisory}
                        </div>
                      ) : null}

                      {(row.apiResult?.rewritten_text ||
                        row.apiResult?.rewrite_suggestion ||
                        row.apiResult?.rewrite) ? (
                        <div>
                          <strong>Rewrite:</strong>{" "}
                          {row.apiResult.rewritten_text ||
                            row.apiResult.rewrite_suggestion ||
                            row.apiResult.rewrite}
                        </div>
                      ) : null}

                      {row.apiResult?.risk_level ? (
                        <div>
                          <strong>Risk level:</strong> {row.apiResult.risk_level}
                        </div>
                      ) : null}

                      {row.apiResult?.policy_profile ? (
                        <div>
                          <strong>Policy profile:</strong>{" "}
                          {row.apiResult.policy_profile}
                        </div>
                      ) : null}

                      {row.error ? (
                        <div>
                          <strong>Error:</strong> {row.error}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {!running && rows.length === 0 ? (
              <div
                style={{
                  ...cardStyle(),
                  padding: 18,
                  borderStyle: "dashed",
                  opacity: 0.75,
                }}
              >
                Click <strong>Run All Tests</strong> to validate the engine, or
                upload a CSV first.
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ ...cardStyle(), padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
                Category Summary
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {categoryStats.length ? (
                  categoryStats.map((item) => (
                    <div
                      key={item.category}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <strong>{item.category}</strong>
                        <span>
                          {item.passed}/{item.total} pass
                        </span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.72 }}>
                        Failed: {item.failed} · Error: {item.errored}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ opacity: 0.7 }}>Run tests to see grouped failures.</div>
                )}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
                Mismatch Summary
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {mismatchStats.length ? (
                  mismatchStats.map((item) => (
                    <div
                      key={item.reason}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <strong>{item.reason}</strong>
                        <span>{item.count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ opacity: 0.7 }}>No mismatches yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}