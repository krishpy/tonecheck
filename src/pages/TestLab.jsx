import React, { useMemo, useRef, useState } from "react";
import { DEFAULT_TEST_CASES } from "../testlab/testCases";
import { runAllTests } from "../testlab/testRunner";
import { evaluateCase } from "../testlab/evaluateCase";
import { parseCsvFile, downloadResultsCsv } from "../testlab/csvUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function StatChip({ label, value, tone = "default" }) {
  const toneMap = {
    default: {
      border: "1px solid rgba(255,255,255,0.08)",
      bg: "rgba(255,255,255,0.04)",
    },
    good: {
      border: "1px solid rgba(58,194,122,0.28)",
      bg: "rgba(58,194,122,0.08)",
    },
    bad: {
      border: "1px solid rgba(255,92,92,0.28)",
      bg: "rgba(255,92,92,0.08)",
    },
    warn: {
      border: "1px solid rgba(255,184,77,0.28)",
      bg: "rgba(255,184,77,0.08)",
    },
  };

  const styles = toneMap[tone] || toneMap.default;

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 14,
        border: styles.border,
        background: styles.bg,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: active ? "1px solid #7c5cff" : "1px solid rgba(255,255,255,0.1)",
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

function SummaryCard({ title, value, subtitle, tone = "default" }) {
  const toneMap = {
    default: {
      border: "1px solid rgba(255,255,255,0.08)",
      bg: "rgba(255,255,255,0.04)",
    },
    bad: {
      border: "1px solid rgba(255,92,92,0.28)",
      bg: "rgba(255,92,92,0.08)",
    },
    warn: {
      border: "1px solid rgba(255,184,77,0.28)",
      bg: "rgba(255,184,77,0.08)",
    },
  };

  const styles = toneMap[tone] || toneMap.default;

  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        border: styles.border,
        background: styles.bg,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.75 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>{subtitle}</div>
    </div>
  );
}

function fileToCasesLabel(sourceName, count) {
  if (!sourceName) return `${count} loaded`;
  return `${sourceName} · ${count} cases`;
}

export default function TestLab() {
  const [testCases, setTestCases] = useState(DEFAULT_TEST_CASES);
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState("all");
  const [progress, setProgress] = useState({ done: 0, total: DEFAULT_TEST_CASES.length });
  const [sourceName, setSourceName] = useState("default");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);

  async function handleRunAll() {
    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setRows([]);
    setProgress({ done: 0, total: testCases.length });

    try {
      const rawResults = await runAllTests(
        testCases,
        API_BASE_URL,
        (done, total) => setProgress({ done, total }),
        controller.signal
      );

      const evaluated = rawResults.map((row) => {
        if (row.error || !row.apiResult) {
          return {
            ...row,
            evaluation: {
              pass: false,
              actualTone: "",
              actualHidden: "",
              actualRisk: 0,
              mismatchReasons: [row.error || "no result"],
            },
          };
        }

        return {
          ...row,
          evaluation: evaluateCase(row, row.apiResult),
        };
      });

      setRows(evaluated);
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
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
      setProgress({ done: 0, total: parsed.length });
      setSourceName(file.name);
    } catch (err) {
      setUploadError(err?.message || "Failed to parse CSV.");
    }
  }

  function handleResetDefault() {
    setTestCases(DEFAULT_TEST_CASES);
    setRows([]);
    setProgress({ done: 0, total: DEFAULT_TEST_CASES.length });
    setSourceName("default");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const passed = rows.filter((row) => row.evaluation?.pass).length;
    const failed = total - passed;
    const passRate = total ? Math.round((passed / total) * 100) : 0;

    const safeFalsePositives = rows.filter((row) => {
      const e = row.evaluation || {};
      return (
        row.category === "safe" &&
        !e.pass &&
        e.actualHidden &&
        e.actualHidden !== "none"
      );
    }).length;

    const profanityMisreadAsManipulation = rows.filter((row) => {
      const e = row.evaluation || {};
      return (
        row.category === "profanity" &&
        e.actualHidden &&
        (e.actualHidden.includes("guilt") ||
          e.actualHidden.includes("emotional") ||
          e.actualHidden.includes("manip"))
      );
    }).length;

    const boundaryMisreadAsHostility = rows.filter((row) => {
      const e = row.evaluation || {};
      return (
        row.category === "boundary" &&
        e.actualHidden &&
        (e.actualHidden.includes("hostile") || e.actualTone.includes("aggressive"))
      );
    }).length;

    const riskCalibrationMisses = rows.filter((row) =>
      (row.evaluation?.mismatchReasons || []).includes("risk out of range")
    ).length;

    return {
      total,
      passed,
      failed,
      passRate,
      safeFalsePositives,
      profanityMisreadAsManipulation,
      boundaryMisreadAsHostility,
      riskCalibrationMisses,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "failed") return rows.filter((row) => !row.evaluation?.pass);
    return rows.filter((row) => row.category === filter);
  }, [rows, filter]);

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gap: 18 }}>
        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background:
              "linear-gradient(180deg, rgba(27,27,40,0.95) 0%, rgba(20,20,30,0.95) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Internal QA</div>
          <h1 style={{ margin: 0, fontSize: 34 }}>Production Test Lab</h1>
          <p style={{ marginTop: 10, opacity: 0.8, maxWidth: 820, lineHeight: 1.5 }}>
            Upload a CSV or use the built-in gold set, run one click against the live
            CommIntel endpoint, and catch false positives before deploy.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
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
              {running ? `Running ${progress.done}/${progress.total}` : "Run All Tests"}
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

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.76 }}>
            Dataset: {fileToCasesLabel(sourceName, testCases.length)}
          </div>

          {uploadError && (
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
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <StatChip label="Total" value={stats.total} />
            <StatChip label="Passed" value={stats.passed} tone="good" />
            <StatChip label="Failed" value={stats.failed} tone="bad" />
            <StatChip label="Pass Rate" value={`${stats.passRate}%`} tone="warn" />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <SummaryCard
            title="Safe false positives"
            value={stats.safeFalsePositives}
            subtitle="Safe messages wrongly got a hidden risk label."
            tone="bad"
          />
          <SummaryCard
            title="Profanity → manipulation"
            value={stats.profanityMisreadAsManipulation}
            subtitle="Profanity got misread as guilt or emotional leverage."
            tone="warn"
          />
          <SummaryCard
            title="Boundary → hostility"
            value={stats.boundaryMisreadAsHostility}
            subtitle="Healthy boundaries got read as aggressive or hostile."
            tone="warn"
          />
          <SummaryCard
            title="Risk calibration misses"
            value={stats.riskCalibrationMisses}
            subtitle="Cases where score fell outside expected range."
            tone="default"
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterButton>
          <FilterButton active={filter === "failed"} onClick={() => setFilter("failed")}>
            Failed Only
          </FilterButton>
          <FilterButton active={filter === "safe"} onClick={() => setFilter("safe")}>
            Safe
          </FilterButton>
          <FilterButton active={filter === "boundary"} onClick={() => setFilter("boundary")}>
            Boundary
          </FilterButton>
          <FilterButton active={filter === "profanity"} onClick={() => setFilter("profanity")}>
            Profanity
          </FilterButton>
          <FilterButton active={filter === "passive"} onClick={() => setFilter("passive")}>
            Passive
          </FilterButton>
          <FilterButton active={filter === "manipulation"} onClick={() => setFilter("manipulation")}>
            Manipulation
          </FilterButton>
          <FilterButton active={filter === "aggression"} onClick={() => setFilter("aggression")}>
            Aggression
          </FilterButton>
          <FilterButton active={filter === "work"} onClick={() => setFilter("work")}>
            Work
          </FilterButton>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {filteredRows.map((row) => {
            const e = row.evaluation || {};
            const pass = !!e.pass;

            return (
              <div
                key={row.id}
                style={{
                  borderRadius: 20,
                  padding: 18,
                  border: pass
                    ? "1px solid rgba(58,194,122,0.28)"
                    : "1px solid rgba(255,92,92,0.28)",
                  background: pass
                    ? "rgba(58,194,122,0.08)"
                    : "rgba(255,92,92,0.08)",
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
                      color: pass ? "#7df0a8" : "#ff8e8e",
                    }}
                  >
                    {pass ? "PASS" : "FAIL"}
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
                  <div><strong>Expected tone:</strong> {row.expected_tone}</div>
                  <div><strong>Actual tone:</strong> {e.actualTone || "-"}</div>
                  <div><strong>Expected hidden:</strong> {row.expected_hidden_signal}</div>
                  <div><strong>Actual hidden:</strong> {e.actualHidden || "-"}</div>
                  <div>
                    <strong>Expected risk:</strong> {row.expected_risk_min}–{row.expected_risk_max}
                  </div>
                  <div><strong>Actual risk:</strong> {e.actualRisk ?? "-"}</div>
                </div>

                {!pass && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 12,
                      background: "rgba(0,0,0,0.18)",
                      color: "#ffb7b7",
                      fontWeight: 700,
                    }}
                  >
                    {(e.mismatchReasons || []).join(", ")}
                  </div>
                )}

                {row.notes && (
                  <div style={{ marginTop: 10, opacity: 0.76 }}>
                    <strong>Notes:</strong> {row.notes}
                  </div>
                )}

                {row.apiResult?.advisory && (
                  <div style={{ marginTop: 12, opacity: 0.88 }}>
                    <strong>Advisory:</strong> {row.apiResult.advisory}
                  </div>
                )}

                {row.apiResult?.rewrite && (
                  <div style={{ marginTop: 8, opacity: 0.92 }}>
                    <strong>Rewrite:</strong> {row.apiResult.rewrite}
                  </div>
                )}
              </div>
            );
          })}

          {!running && rows.length === 0 && (
            <div
              style={{
                borderRadius: 18,
                padding: 18,
                border: "1px dashed rgba(255,255,255,0.16)",
                opacity: 0.75,
              }}
            >
              Click <strong>Run All Tests</strong> to validate the engine, or upload a CSV first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}