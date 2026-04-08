import React, { useMemo, useRef, useState } from "react";
import { DEFAULT_TEST_CASES } from "../testlab/testCases";
import { evaluateCase } from "../testlab/evaluateCase";
import { parseCsvFile, downloadResultsCsv } from "../testlab/csvUtils";
import { runAllTests, runSingleTest } from "../testlab/testRunner";

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

function FailureHints({ hints = [] }) {
  if (!hints.length) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 800 }}>Why failed</div>

      {hints.map((hint, idx) => (
        <div
          key={`${hint.type}-${idx}`}
          style={{
            padding: 10,
            borderRadius: 10,
            background: "rgba(0,0,0,0.18)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontWeight: 700 }}>{hint.title}</div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
            <strong>Expected:</strong> {hint.expected}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, opacity: 0.9 }}>
            <strong>Actual:</strong> {hint.actual}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.82 }}>
            <strong>Check:</strong> {hint.suggestion}
          </div>
        </div>
      ))}
    </div>
  );
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

function chipStyle(value) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    fontSize: 13,
    fontWeight: 700,
  };
}

export default function TestLab() {
  const [testCases, setTestCases] = useState(DEFAULT_TEST_CASES);
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);
  const [singleRunningId, setSingleRunningId] = useState("");
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

  async function runSingle(row, index) {
    setSingleRunningId(row.id);

    try {
      const apiResult = await runSingleTest(row, API_BASE_URL);

      const evaluated = {
        ...row,
        apiResult,
        error: null,
        evaluation: evaluateCase(row, apiResult),
      };

      setRows((prev) => {
        const copy = [...prev];
        copy[index] = evaluated;
        return copy;
      });
    } catch (err) {
      setRows((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...row,
          apiResult: null,
          error: err?.message || "Request failed",
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
            mismatchReasons: [err?.message || "Request failed"],
            failureHints: [
              {
                type: "error",
                title: "Request/runtime error",
                expected: "successful API response",
                actual: err?.message || "Request failed",
                suggestion:
                  "Check backend logs, endpoint availability, and response schema.",
              },
            ],
          },
        };
        return copy;
      });
    } finally {
      setSingleRunningId("");
    }
  }

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
      await runAllTests(
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

          const evaluatedRow =
            latestRow.error || !latestRow.apiResult
              ? {
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
                    mismatchReasons: [latestRow.error || "no result"],
                    failureHints: [
                      {
                        type: "error",
                        title: "Request/runtime error",
                        expected: "successful API response",
                        actual: latestRow.error || "no result",
                        suggestion:
                          "Check backend logs, endpoint availability, and response schema.",
                      },
                    ],
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
          `Expected tone: ${row.expected_tone || "-"}`,
          `Actual tone: ${e.actualTone || "-"}`,
          `Expected hidden: ${row.expected_hidden_signal || "-"}`,
          `Actual hidden: ${e.actualHidden || "-"}`,
          `Expected regret: ${row.expected_regret_band || "-"}`,
          `Actual regret: ${e.actualRegret || "-"}`,
          `Expected pressure: ${row.expected_emotional_pressure_band || "-"}`,
          `Actual pressure: ${e.actualPressure || "-"}`,
          `Expected reply vibe: ${row.expected_reply_vibe || "-"}`,
          `Actual reply vibe: ${e.actualReply || "-"}`,
          `Expected verdict: ${row.expected_send_verdict || "-"}`,
          `Actual verdict: ${e.actualVerdict || "-"}`,
          `Expected rewrite present: ${row.expected_rewrite_present || "-"}`,
          `Actual rewrite present: ${String(e.actualRewrite)}`,
          `Expected advisory present: ${row.expected_advisory_present || "-"}`,
          `Actual advisory present: ${String(e.actualAdvisory)}`,
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
        String(row.evaluation?.actualRegret || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualPressure || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualReply || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualVerdict || "").toLowerCase().includes(q) ||
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
            ToneCheck Consumer QA
          </div>
          <h1 style={{ margin: 0, fontSize: 34 }}>ToneCheck Test Lab</h1>
          <p
            style={{
              marginTop: 10,
              opacity: 0.8,
              maxWidth: 940,
              lineHeight: 1.5,
            }}
          >
            This lab validates the consumer-facing output only: tone, hidden
            signal, chance of regret, emotional pressure, reply vibe, send
            verdict, advisory, and rewrite presence. No risk score checks here.
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

          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              background: "rgba(93,214,255,0.08)",
              border: "1px solid rgba(93,214,255,0.22)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            CSV columns for this lab:
            <br />
            <strong>
              id, category, input, expected_tone, expected_hidden_signal,
              expected_regret_band, expected_emotional_pressure_band,
              expected_reply_vibe, expected_send_verdict,
              expected_rewrite_present, expected_advisory_present, notes
            </strong>
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
            subtitle="Matches consumer output"
            tone="good"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            subtitle="UI mismatch"
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
            subtitle="Consumer QA score"
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
            <Pill active={filter === "failed"} onClick={() => setFilter("failed")}>
              Failed Only
            </Pill>
            <Pill active={filter === "passed"} onClick={() => setFilter("passed")}>
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
            placeholder="Search by id, category, tone, hidden signal, regret, pressure, reply vibe, verdict, or text"
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
            {filteredRows.map((row) => {
              const e = row.evaluation || {};
              const expanded = expandedId === row.id;
              const tone = statusTone(row);
              const isCurrentRunning = running && progress.currentId === row.id;
              const isSingleRunning = singleRunningId === row.id;

              return (
                <div
                  key={row.id}
                  style={{
                    ...cardStyle(
                      tone === "good"
                        ? { good: true }
                        : tone === "bad"
                          ? { bad: true }
                          : { warn: true }
                    ),
                    padding: 18,
                    outline:
                      isCurrentRunning || isSingleRunning
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
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={chipStyle()}>
                      Tone: {e.actualTone || "—"}
                    </span>
                    <span style={chipStyle()}>
                      Hidden: {e.actualHidden || "—"}
                    </span>
                    <span style={chipStyle()}>
                      Regret: {e.actualRegret || "—"}
                    </span>
                    <span style={chipStyle()}>
                      Pressure: {e.actualPressure || "—"}
                    </span>
                    <span style={chipStyle()}>
                      Reply vibe: {e.actualReply || "—"}
                    </span>
                    <span style={chipStyle()}>
                      Verdict: {e.actualVerdict || "—"}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 10,
                      fontSize: 14,
                      opacity: 0.92,
                    }}
                  >
                    <div>
                      <strong>Expected tone:</strong> {row.expected_tone || "-"}
                    </div>
                    <div>
                      <strong>Actual tone:</strong> {e.actualTone || "-"}
                    </div>
                    <div>
                      <strong>Expected hidden:</strong>{" "}
                      {row.expected_hidden_signal || "-"}
                    </div>
                    <div>
                      <strong>Actual hidden:</strong> {e.actualHidden || "-"}
                    </div>
                    <div>
                      <strong>Expected regret:</strong>{" "}
                      {row.expected_regret_band || "-"}
                    </div>
                    <div>
                      <strong>Actual regret:</strong> {e.actualRegret || "-"}
                    </div>
                    <div>
                      <strong>Expected pressure:</strong>{" "}
                      {row.expected_emotional_pressure_band || "-"}
                    </div>
                    <div>
                      <strong>Actual pressure:</strong> {e.actualPressure || "-"}
                    </div>
                    <div>
                      <strong>Expected reply vibe:</strong>{" "}
                      {row.expected_reply_vibe || "-"}
                    </div>
                    <div>
                      <strong>Actual reply vibe:</strong> {e.actualReply || "-"}
                    </div>
                    <div>
                      <strong>Expected verdict:</strong>{" "}
                      {row.expected_send_verdict || "-"}
                    </div>
                    <div>
                      <strong>Actual verdict:</strong> {e.actualVerdict || "-"}
                    </div>
                    <div>
                      <strong>Expected rewrite:</strong>{" "}
                      {row.expected_rewrite_present || "-"}
                    </div>
                    <div>
                      <strong>Actual rewrite:</strong>{" "}
                      {typeof e.actualRewrite === "boolean"
                        ? String(e.actualRewrite)
                        : "-"}
                    </div>
                    <div>
                      <strong>Expected advisory:</strong>{" "}
                      {row.expected_advisory_present || "-"}
                    </div>
                    <div>
                      <strong>Actual advisory:</strong>{" "}
                      {typeof e.actualAdvisory === "boolean"
                        ? String(e.actualAdvisory)
                        : "-"}
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
                        color: tone === "warn" ? "#ffd38e" : "#ffb7b7",
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

                    <button
                      onClick={() => runSingle(row, rows.findIndex((r) => r.id === row.id))}
                      disabled={running || isSingleRunning}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(124,92,255,0.4)",
                        background: "rgba(124,92,255,0.15)",
                        color: "#fff",
                        cursor: running || isSingleRunning ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        opacity: running || isSingleRunning ? 0.6 : 1,
                      }}
                    >
                      {isSingleRunning ? "Running..." : "🔁 Re-run"}
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

                      <FailureHints hints={row.evaluation?.failureHints || []} />

                      {row.apiResult ? (
                        <div>
                          <strong>Raw API:</strong>
                          <pre
                            style={{
                              fontSize: 12,
                              overflow: "auto",
                              maxHeight: 240,
                              marginTop: 6,
                              padding: 10,
                              background: "#000",
                              borderRadius: 8,
                              color: "#0f0",
                            }}
                          >
                            {JSON.stringify(row.apiResult, null, 2)}
                          </pre>
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

                      {row.apiResult?.policy_profile ? (
                        <div>
                          <strong>Policy profile:</strong> {row.apiResult.policy_profile}
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
                Click <strong>Run All Tests</strong> to validate ToneCheck
                consumer output, or upload a CSV first.
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