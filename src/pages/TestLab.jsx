import React, { useMemo, useRef, useState } from "react";
import { DEFAULT_TEST_CASES } from "../testlab/testCases";
import { evaluateCase } from "../testlab/evaluateCase";
import { parseCsvFile, downloadResultsCsv } from "../testlab/csvUtils";
import { runAllTests, runSingleTest } from "../testlab/testRunner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function cardStyle({ good = false, bad = false, warn = false, bright = false } = {}) {
  const border = bad
    ? "1px solid rgba(255,107,107,0.28)"
    : good
      ? "1px solid rgba(34,197,94,0.26)"
      : warn
        ? "1px solid rgba(251,191,36,0.28)"
        : bright
          ? "1px solid rgba(124,92,255,0.18)"
          : "1px solid rgba(148,163,184,0.14)";

  const bg = bad
    ? "linear-gradient(135deg, rgba(255,241,242,0.96), rgba(255,247,247,0.94))"
    : good
      ? "linear-gradient(135deg, rgba(240,253,244,0.96), rgba(248,250,252,0.96))"
      : warn
        ? "linear-gradient(135deg, rgba(255,251,235,0.96), rgba(255,247,237,0.94))"
        : bright
          ? "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(245,243,255,0.96))"
          : "rgba(255,255,255,0.88)";

  return {
    border,
    background: bg,
    borderRadius: 22,
    boxShadow: "0 14px 36px rgba(99,102,241,0.08)",
    backdropFilter: "blur(10px)",
  };
}

function FailureHints({ hints = [] }) {
  if (!hints.length) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(254,242,242,0.96))",
        border: "1px solid rgba(255,107,107,0.18)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 900, color: "#7f1d1d" }}>Why failed</div>

      {hints.map((hint, idx) => (
        <div
          key={`${hint.type}-${idx}`}
          style={{
            padding: 12,
            borderRadius: 14,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(239,68,68,0.10)",
            color: "#1f2937",
          }}
        >
          <div style={{ fontWeight: 800 }}>{hint.title}</div>
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
          : { bright: true };

  const valueColor =
    tone === "good"
      ? "#15803d"
      : tone === "bad"
        ? "#dc2626"
        : tone === "warn"
          ? "#b45309"
          : "#312e81";

  return (
    <div style={{ ...cardStyle(props), padding: 18 }}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8, color: valueColor }}>
        {value}
      </div>
      {subtitle ? (
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
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
          ? "1px solid rgba(124,92,255,0.35)"
          : "1px solid rgba(148,163,184,0.18)",
        background: active
          ? "linear-gradient(135deg, rgba(124,92,255,0.16), rgba(93,214,255,0.14))"
          : "rgba(255,255,255,0.72)",
        color: active ? "#312e81" : "#334155",
        cursor: "pointer",
        fontWeight: 800,
        boxShadow: active ? "0 8px 22px rgba(124,92,255,0.10)" : "none",
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
          height: 12,
          width: "100%",
          borderRadius: 999,
          background: "rgba(226,232,240,0.8)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: "linear-gradient(90deg, #7c5cff, #5dd6ff, #22c55e)",
            transition: "width 180ms ease",
          }}
        />
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
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
    const reasons = row.evaluation?.mismatch_reasons
      ? String(row.evaluation.mismatch_reasons).split(" | ")
      : row.evaluation?.mismatchReasons || [];

    reasons.forEach((reason) => {
      if (!reason) return;
      counts.set(reason, (counts.get(reason) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

function statusTone(row) {
  if (row.evaluation?.status === "ERROR") return "warn";
  return row.evaluation?.pass === "PASS" || row.evaluation?.pass === true ? "good" : "bad";
}

function statusLabel(row) {
  if (row.evaluation?.status === "ERROR") return "ERROR";
  if (row.evaluation?.pass === "PASS" || row.evaluation?.pass === true) return "PASS";
  return "FAIL";
}

function topModelVersion(rows) {
  const versions = rows.map((r) => r.apiResult?.model_version).filter(Boolean);
  return versions[0] || "—";
}

function chipStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
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
          `Actual tone: ${e.actualTone || e.actual_tone || "-"}`,
          `Expected hidden: ${row.expected_hidden_signal || row.expected_signal || "-"}`,
          `Actual hidden: ${e.actualHidden || e.actual_signal || "-"}`,
          `Expected regret: ${row.expected_regret_band || row.expected_regret || "-"}`,
          `Actual regret: ${e.actualRegret || e.actual_regret || "-"}`,
          `Expected pressure: ${row.expected_emotional_pressure_band || row.expected_pressure || "-"}`,
          `Actual pressure: ${e.actualPressure || e.actual_pressure || "-"}`,
          `Expected reply vibe: ${row.expected_reply_vibe || "-"}`,
          `Actual reply vibe: ${e.actualReply || e.actual_reply_vibe || "-"}`,
          `Expected verdict: ${row.expected_send_verdict || row.expected_verdict || "-"}`,
          `Actual verdict: ${e.actualVerdict || e.actual_verdict || "-"}`,
          `Issues: ${(e.mismatchReasons || e.mismatch_reasons || []).join ? (e.mismatchReasons || []).join(", ") : String(e.mismatch_reasons || "")}`,
        ].join("\n");
      })
      .join("\n\n--------------------\n\n");

    navigator.clipboard.writeText(failed || "No failures");
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const passed = rows.filter((row) => row.evaluation?.pass === "PASS" || row.evaluation?.pass === true).length;
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
            ? !(pass === "PASS" || pass === true) && status !== "ERROR"
            : filter === "passed"
              ? pass === "PASS" || pass === true
              : filter === "error"
                ? status === "ERROR"
                : row.category === filter;

      const inSearch =
        !q ||
        String(row.id || "").toLowerCase().includes(q) ||
        String(row.category || "").toLowerCase().includes(q) ||
        String(row.input || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualTone || row.evaluation?.actual_tone || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualHidden || row.evaluation?.actual_signal || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualRegret || row.evaluation?.actual_regret || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualPressure || row.evaluation?.actual_pressure || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualReply || row.evaluation?.actual_reply_vibe || "").toLowerCase().includes(q) ||
        String(row.evaluation?.actualVerdict || row.evaluation?.actual_verdict || "").toLowerCase().includes(q) ||
        String(row.evaluation?.mismatch_reasons || row.evaluation?.mismatchReasons || "")
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
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        color: "#0f172a",
        background:
          "radial-gradient(circle at top left, rgba(93,214,255,0.20), transparent 26%), radial-gradient(circle at top right, rgba(124,92,255,0.18), transparent 22%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 52%, #fdf2f8 100%)",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gap: 18 }}>
        <div
          style={{
            position: "sticky",
            top: 12,
            zIndex: 10,
            borderRadius: 28,
            padding: 24,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(245,243,255,0.95))",
            border: "1px solid rgba(124,92,255,0.16)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 18px 42px rgba(99,102,241,0.10)",
          }}
        >
          <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 800, marginBottom: 8 }}>
            ToneCheck Consumer QA
          </div>
          <h1 style={{ margin: 0, fontSize: 36, color: "#1e1b4b" }}>ToneCheck Test Lab</h1>
          <p
            style={{
              marginTop: 10,
              color: "#475569",
              maxWidth: 940,
              lineHeight: 1.6,
              fontSize: 15,
            }}
          >
            Make troubleshooting feel fast and visual. Validate tone, hidden signals,
            regret, emotional pressure, reply vibe, verdict, rewrite quality, and advisory
            without getting lost in backend noise.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 18,
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
                color: "#fff",
                boxShadow: "0 12px 26px rgba(124,92,255,0.20)",
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
                border: "1px solid rgba(239,68,68,0.16)",
                cursor: running ? "pointer" : "not-allowed",
                fontWeight: 700,
                background: "rgba(255,255,255,0.88)",
                color: "#b91c1c",
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
                border: "1px solid rgba(148,163,184,0.18)",
                cursor: "pointer",
                fontWeight: 700,
                background: "rgba(255,255,255,0.88)",
                color: "#334155",
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
                border: "1px solid rgba(148,163,184,0.18)",
                cursor: "pointer",
                fontWeight: 700,
                background: "rgba(255,255,255,0.88)",
                color: "#334155",
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
                border: "1px solid rgba(148,163,184,0.18)",
                cursor: rows.length ? "pointer" : "not-allowed",
                fontWeight: 700,
                background: "rgba(255,255,255,0.88)",
                color: "#334155",
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
                border: "1px solid rgba(148,163,184,0.18)",
                cursor: rows.length ? "pointer" : "not-allowed",
                fontWeight: 700,
                background: "rgba(255,255,255,0.88)",
                color: "#334155",
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

          <div style={{ marginTop: 14, fontSize: 13, color: "#64748b" }}>
            Dataset: {fileToCasesLabel(sourceName, testCases.length)} · Model:{" "}
            {topModelVersion(rows)}
          </div>

          {running ? (
            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <ProgressBar done={progress.done} total={progress.total} />
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.96))",
                  border: "1px solid rgba(93,214,255,0.20)",
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Currently running
                </div>
                <div style={{ marginTop: 6, fontWeight: 900, color: "#1e1b4b" }}>
                  {progress.currentId || "—"}
                </div>
                <div style={{ marginTop: 4, color: "#334155" }}>
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
                borderRadius: 14,
                background: "rgba(254,242,242,0.96)",
                border: "1px solid rgba(239,68,68,0.18)",
                color: "#b91c1c",
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
            subtitle="Needs tuning"
            tone="bad"
          />
          <StatCard
            label="Errors"
            value={stats.errored}
            subtitle="Runtime or API issues"
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

        <div style={{ ...cardStyle({ bright: true }), padding: 16, display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#1e1b4b" }}>Filters</div>

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
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(255,255,255,0.90)",
              color: "#0f172a",
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
                    <div style={{ fontWeight: 900, color: "#1e1b4b" }}>
                      {row.id} · {row.category}
                    </div>
                    <div
                      style={{
                        fontWeight: 900,
                        color:
                          tone === "good"
                            ? "#15803d"
                            : tone === "bad"
                              ? "#dc2626"
                              : "#b45309",
                      }}
                    >
                      {statusLabel(row)}
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 17, lineHeight: 1.5, color: "#0f172a" }}>
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
                    <span style={chipStyle()}>Tone: {e.actualTone || e.actual_tone || "—"}</span>
                    <span style={chipStyle()}>Hidden: {e.actualHidden || e.actual_signal || "—"}</span>
                    <span style={chipStyle()}>Regret: {e.actualRegret || e.actual_regret || "—"}</span>
                    <span style={chipStyle()}>Pressure: {e.actualPressure || e.actual_pressure || "—"}</span>
                    <span style={chipStyle()}>Reply vibe: {e.actualReply || e.actual_reply_vibe || "—"}</span>
                    <span style={chipStyle()}>Verdict: {e.actualVerdict || e.actual_verdict || "—"}</span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 10,
                      fontSize: 14,
                      color: "#334155",
                    }}
                  >
                    <div><strong>Expected tone:</strong> {row.expected_tone || "-"}</div>
                    <div><strong>Actual tone:</strong> {e.actualTone || e.actual_tone || "-"}</div>
                    <div><strong>Expected hidden:</strong> {row.expected_hidden_signal || row.expected_signal || "-"}</div>
                    <div><strong>Actual hidden:</strong> {e.actualHidden || e.actual_signal || "-"}</div>
                    <div><strong>Expected regret:</strong> {row.expected_regret_band || row.expected_regret || "-"}</div>
                    <div><strong>Actual regret:</strong> {e.actualRegret || e.actual_regret || "-"}</div>
                    <div><strong>Expected pressure:</strong> {row.expected_emotional_pressure_band || row.expected_pressure || "-"}</div>
                    <div><strong>Actual pressure:</strong> {e.actualPressure || e.actual_pressure || "-"}</div>
                    <div><strong>Expected reply vibe:</strong> {row.expected_reply_vibe || "-"}</div>
                    <div><strong>Actual reply vibe:</strong> {e.actualReply || e.actual_reply_vibe || "-"}</div>
                    <div><strong>Expected verdict:</strong> {row.expected_send_verdict || row.expected_verdict || "-"}</div>
                    <div><strong>Actual verdict:</strong> {e.actualVerdict || e.actual_verdict || "-"}</div>
                  </div>

                  {row.apiResult?.model_version ? (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
                      <strong>Model:</strong> {row.apiResult.model_version}
                    </div>
                  ) : null}

                  {(e.mismatchReasons || e.mismatch_reasons || []).length ? (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 14,
                        background: tone === "warn" ? "rgba(255,247,237,0.96)" : "rgba(254,242,242,0.96)",
                        color: tone === "warn" ? "#b45309" : "#b91c1c",
                        fontWeight: 700,
                        border: tone === "warn"
                          ? "1px solid rgba(245,158,11,0.18)"
                          : "1px solid rgba(239,68,68,0.14)",
                      }}
                    >
                      {Array.isArray(e.mismatchReasons)
                        ? e.mismatchReasons.join(", ")
                        : e.mismatch_reasons || ""}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setExpandedId(expanded ? null : row.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(148,163,184,0.18)",
                        background: "rgba(255,255,255,0.88)",
                        color: "#334155",
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
                        border: "1px solid rgba(124,92,255,0.24)",
                        background: "linear-gradient(135deg, rgba(124,92,255,0.12), rgba(93,214,255,0.12))",
                        color: "#312e81",
                        cursor: running || isSingleRunning ? "not-allowed" : "pointer",
                        fontWeight: 800,
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
                        borderRadius: 16,
                        background: "rgba(255,255,255,0.86)",
                        border: "1px solid rgba(148,163,184,0.14)",
                        display: "grid",
                        gap: 10,
                        color: "#334155",
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
                              background: "#0f172a",
                              borderRadius: 10,
                              color: "#c7f9cc",
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
                  ...cardStyle({ bright: true }),
                  padding: 18,
                  borderStyle: "dashed",
                  opacity: 0.92,
                  color: "#475569",
                }}
              >
                Click <strong>Run All Tests</strong> to validate ToneCheck consumer output, or upload a CSV first.
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ ...cardStyle({ bright: true }), padding: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12, color: "#1e1b4b" }}>
                Category Summary
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {categoryStats.length ? (
                  categoryStats.map((item) => (
                    <div
                      key={item.category}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid rgba(148,163,184,0.14)",
                        background: "rgba(255,255,255,0.82)",
                        color: "#334155",
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
                      <div style={{ marginTop: 6, fontSize: 13, color: "#64748b" }}>
                        Failed: {item.failed} · Error: {item.errored}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#64748b" }}>Run tests to see grouped failures.</div>
                )}
              </div>
            </div>

            <div style={{ ...cardStyle({ bright: true }), padding: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12, color: "#1e1b4b" }}>
                Mismatch Summary
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {mismatchStats.length ? (
                  mismatchStats.map((item) => (
                    <div
                      key={item.reason}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid rgba(148,163,184,0.14)",
                        background: "rgba(255,255,255,0.82)",
                        color: "#334155",
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
                  <div style={{ color: "#64748b" }}>No mismatches yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}