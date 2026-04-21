import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_KEY =
  import.meta.env.VITE_API_KEY || "test-default-key";

const ADMIN_API_KEY =
  import.meta.env.VITE_ADMIN_API_KEY || "abc123";

function formatLabel(value) {
  if (!value) return "-";

  return String(value)
    .replace(/_signal$/i, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function safePct(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? `${num.toFixed(2)}%` : `${fallback.toFixed(2)}%`;
}

function getRiskColor(level) {
  const normalized = String(level || "").toLowerCase();
  if (normalized === "high" || normalized === "severe") return "#dc2626";
  if (normalized === "medium") return "#d97706";
  return "#16a34a";
}

function getHealthTone(score) {
  if (score >= 80) return { label: "Strong", color: "#166534", bg: "#ecfdf5", border: "#bbf7d0" };
  if (score >= 60) return { label: "Watch", color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  return { label: "Weak", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" };
}

function getDecisionTone(severity) {
  const s = String(severity || "").toLowerCase();
  if (s === "danger") return { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c" };
  if (s === "warning") return { bg: "#fffbeb", border: "#fde68a", color: "#b45309" };
  if (s === "success") return { bg: "#ecfdf5", border: "#bbf7d0", color: "#166534" };
  return { bg: "#f8fafc", border: "#e2e8f0", color: "#334155" };
}

function Card({ title, value, subtitle = "", accent = "#111827" }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ fontSize: "30px", fontWeight: 900, color: accent, letterSpacing: "-0.04em" }}>
        {value}
      </div>
      {subtitle ? (
        <div style={{ marginTop: "8px", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function StatGrid({ items, columns = "repeat(4, minmax(0, 1fr))" }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      {items.map((item) => (
        <Card
          key={item.title}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle || ""}
          accent={item.accent || "#111827"}
        />
      ))}
    </div>
  );
}

function SectionCard({ title, subtitle = "", children }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>{title}</div>
        {subtitle ? (
          <div style={{ marginTop: "6px", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function InsightRow({ label, value, tone = "neutral" }) {
  const map = {
    danger: {
      bg: "#fef2f2",
      border: "#fecaca",
      color: "#b91c1c",
    },
    warning: {
      bg: "#fffbeb",
      border: "#fde68a",
      color: "#b45309",
    },
    success: {
      bg: "#ecfdf5",
      border: "#bbf7d0",
      color: "#166534",
    },
    neutral: {
      bg: "#f8fafc",
      border: "#e2e8f0",
      color: "#334155",
    },
  };

  const theme = map[tone] || map.neutral;

  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "14px",
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: 900, color: theme.color, textAlign: "right" }}>{value}</div>
    </div>
  );
}

function TableBlock({
  title,
  columns,
  rows,
  sortByCount = false,
  onRowClick = null,
}) {
  const finalRows = sortByCount
    ? [...(rows || [])].sort((a, b) => safeNumber(b.count) - safeNumber(a.count))
    : rows || [];

  return (
    <SectionCard title={title}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  textAlign: "left",
                  fontSize: "12px",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                  padding: "10px 8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {finalRows.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                cursor: onRowClick ? "pointer" : "default",
              }}
            >
              {columns.map((col) => (
                <td
                  key={col}
                  style={{
                    padding: "10px 8px",
                    borderBottom: "1px solid #f3f4f6",
                    color:
                      col === "risk_level"
                        ? getRiskColor(String(row[col] || "").toLowerCase())
                        : "#111827",
                    fontWeight: col === "risk_level" ? 800 : 500,
                    fontSize: "14px",
                  }}
                >
                  {col === "tone" ||
                  col === "hidden_signal" ||
                  col === "risk_level" ||
                  col === "wrong_area" ||
                  col === "feedback_rating" ||
                  col === "label"
                    ? formatLabel(row[col])
                    : row[col] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {(!rows || rows.length === 0) && (
        <div style={{ color: "#6b7280", fontSize: "14px", paddingTop: "8px" }}>
          No data yet.
        </div>
      )}
    </SectionCard>
  );
}

function ActionItem({ title, reason, severity = "neutral" }) {
  const colors = {
    danger: { bg: "#fef2f2", border: "#fecaca", title: "#b91c1c" },
    warning: { bg: "#fffbeb", border: "#fde68a", title: "#b45309" },
    success: { bg: "#ecfdf5", border: "#bbf7d0", title: "#166534" },
    neutral: { bg: "#f8fafc", border: "#e2e8f0", title: "#334155" },
  };

  const theme = colors[severity] || colors.neutral;

  return (
    <div
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: "14px",
        padding: "14px",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 900, color: theme.title }}>{title}</div>
      <div style={{ marginTop: "6px", fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>{reason}</div>
    </div>
  );
}

function AutoDecisionCard({ item }) {
  const tone = getDecisionTone(item?.severity);
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        background: tone.bg,
        border: `1px solid ${tone.border}`,
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 900, color: tone.color }}>
        {item?.title || "Decision"}
      </div>
      <div style={{ marginTop: "6px", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
        {item?.reason || ""}
      </div>
      {item?.action ? (
        <div style={{ marginTop: "8px", fontSize: "13px", color: "#0f172a", fontWeight: 700 }}>
          Next action: {item.action}
        </div>
      ) : null}
      {item?.metric && item.metric !== "none" ? (
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
          Metric: {item.metric} {item?.value !== null && item?.value !== undefined ? `(${item.value})` : ""}
        </div>
      ) : null}
    </div>
  );
}

function RiskDetailDrawer({ item, onClose }) {
  if (!item) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.42)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          height: "100%",
          background: "#ffffff",
          padding: "24px",
          boxShadow: "-12px 0 30px rgba(15,23,42,0.16)",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b" }}>
              Risk Event
            </div>
            <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 900, color: "#111827", letterSpacing: "-0.04em" }}>
              Message #{item.id}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: "12px",
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Close
          </button>
        </div>

        <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
          <InsightRow label="Risk Score" value={item.risk_score} tone={item.risk_score >= 75 ? "danger" : item.risk_score >= 40 ? "warning" : "success"} />
          <InsightRow label="Risk Level" value={formatLabel(item.risk_level)} tone={String(item.risk_level).toLowerCase() === "high" || String(item.risk_level).toLowerCase() === "severe" ? "danger" : String(item.risk_level).toLowerCase() === "medium" ? "warning" : "success"} />
          <InsightRow label="Tone" value={formatLabel(item.tone)} />
          <InsightRow label="Hidden Signal" value={formatLabel(item.hidden_signal)} />
          <InsightRow label="Page" value={item.page_slug || "-"} />
          <InsightRow label="Created At" value={item.created_at || "-"} />
        </div>

        <div style={{ marginTop: "22px" }}>
          <div style={{ fontSize: "13px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
            Message Preview
          </div>
          <div
            style={{
              marginTop: "10px",
              padding: "14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#111827",
              whiteSpace: "pre-wrap",
            }}
          >
            {item.message_preview || "Message text not saved for this event."}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [selectedRiskEvent, setSelectedRiskEvent] = useState(null);
  const [error, setError] = useState("");

  async function loadDashboard(selectedDays) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE_URL}/admin/analytics/dashboard?days=${selectedDays}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ADMIN_API_KEY,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load dashboard");
      }

      const json = await res.json();
      setData(json);
    } catch (loadError) {
      console.error("Dashboard load failed:", loadError);
      setError(loadError.message || "Dashboard load failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard(days);
  }, [days]);

  const derived = useMemo(() => {
    const overview = data?.overview || {};
    const topTones = data?.top_tones || [];
    const topHiddenSignals = data?.top_hidden_signals || [];
    const feedbackByRating = data?.feedback_summary?.by_rating || [];
    const negativeByWrongArea = data?.feedback_summary?.negative_by_wrong_area || [];
    const dailyFeedbackTrend = data?.feedback_summary?.daily_feedback_trend || [];
    const apiUsage = data?.api_usage_overview || {};
    const toneLogs = data?.tone_logs_summary || {};
    const riskDistribution = data?.risk_distribution || [];
    const topRiskMessages = data?.top_risk_messages || [];
    const pageBreakdown = data?.page_slug_breakdown || [];
    const frontendFunnel = data?.frontend_funnel || {};
    const autoDecisions = data?.auto_decisions || [];

    const totalAnalyses = safeNumber(overview.total_analyses);
    const rewritesShown = safeNumber(overview.rewrites_shown);
    const rewriteRate = totalAnalyses ? Math.round((rewritesShown / totalAnalyses) * 100) : 0;

    const positiveFeedback =
      safeNumber(feedbackByRating.find((x) => x.feedback_rating === "positive")?.count);
    const negativeFeedback =
      safeNumber(feedbackByRating.find((x) => x.feedback_rating === "negative")?.count);
    const totalFeedback = positiveFeedback + negativeFeedback;
    const feedbackAccuracyRate = totalFeedback
      ? Math.round((positiveFeedback / totalFeedback) * 100)
      : 0;

    const topTone = formatLabel(topTones[0]?.tone || "-");
    const topSignal = formatLabel(
      topHiddenSignals.find((x) => x.hidden_signal !== "none")?.hidden_signal || "-"
    );
    const topWrongArea = formatLabel(negativeByWrongArea?.[0]?.wrong_area || "-");
    const topPage = pageBreakdown.find((x) => x.page_slug !== "unknown")?.page_slug || "-";

    const highRiskCount = safeNumber(
      riskDistribution.find(
        (x) =>
          String(x.risk_level).toLowerCase() === "high" ||
          String(x.risk_level).toLowerCase() === "severe"
      )?.count
    );
    const mediumRiskCount = safeNumber(
      riskDistribution.find((x) => String(x.risk_level).toLowerCase() === "medium")?.count
    );

    const highestRisk = topRiskMessages[0] || null;

    const funnelSessions = frontendFunnel.sessions || {};
    const funnelEvents = frontendFunnel.events || {};
    const funnelRates = frontendFunnel.rates || {};
    const funnelPages = frontendFunnel.pages || [];

    const riskPenalty = Math.min(35, highRiskCount * 2 + mediumRiskCount * 0.75);
    const rewritePenalty = Math.min(25, rewriteRate * 0.25);
    const feedbackPenalty =
      totalFeedback > 0 ? Math.min(30, Math.round((negativeFeedback / totalFeedback) * 100 * 0.4)) : 0;

    const funnelPenalty =
      (safeNumber(funnelRates.typing_to_abandon_pct) > 35 ? 10 : 0) +
      (safeNumber(funnelRates.analyze_to_result_pct) < 90 && safeNumber(funnelSessions.analyze_click) >= 10 ? 10 : 0) +
      (safeNumber(funnelRates.typing_to_analyze_pct) < 45 && safeNumber(funnelSessions.typing_started) >= 10 ? 8 : 0);

    const healthScore = Math.max(
      0,
      Math.min(100, Math.round(100 - riskPenalty - rewritePenalty - feedbackPenalty - funnelPenalty))
    );
    const healthTone = getHealthTone(healthScore);

    const decisionSummary = [];
    if (healthScore < 60) {
      decisionSummary.push({
        title: "Stability risk is too high",
        reason:
          "Dashboard health is weak. Stop adding features and fix output quality before pushing more traffic.",
        severity: "danger",
      });
    } else {
      decisionSummary.push({
        title: "System is stable enough to iterate",
        reason:
          "The core engine is usable. Move with targeted fixes instead of broad tuning.",
        severity: "success",
      });
    }

    if (rewriteRate >= 70) {
      decisionSummary.push({
        title: "Rewrite dependency is too high",
        reason:
          "Too many messages need rewriting. Base detection and original-message safety need improvement.",
        severity: "warning",
      });
    } else if (rewriteRate >= 40) {
      decisionSummary.push({
        title: "Rewrite is doing meaningful work",
        reason:
          "This is acceptable, but monitor whether rewrites are compensating for weak tone classification.",
        severity: "neutral",
      });
    } else {
      decisionSummary.push({
        title: "Rewrite usage is controlled",
        reason:
          "Base output is standing on its own more often. That is healthier long term.",
        severity: "success",
      });
    }

    if (negativeFeedback > 0) {
      decisionSummary.push({
        title: `Top user complaint: ${topWrongArea}`,
        reason:
          topWrongArea === "-"
            ? "Negative feedback exists, but the reason is not being captured cleanly yet."
            : `User feedback says the main issue is ${topWrongArea.toLowerCase()}. That should drive the next tuning pass.`,
        severity: "warning",
      });
    } else {
      decisionSummary.push({
        title: "No negative feedback trend yet",
        reason:
          "Good sign, but volume may still be low. Keep collecting data before declaring the engine strong.",
        severity: "success",
      });
    }

    if (String(topSignal).toLowerCase() !== "-" && String(topSignal).toLowerCase() !== "none") {
      decisionSummary.push({
        title: `Dominant risk pattern: ${topSignal}`,
        reason:
          "This signal is showing up most often. Check whether it reflects real user traffic or false positives from one pattern family.",
        severity: "neutral",
      });
    }

    return {
      overview,
      topTones,
      topHiddenSignals,
      feedbackByRating,
      negativeByWrongArea,
      dailyFeedbackTrend,
      apiUsage,
      toneLogs,
      riskDistribution,
      topRiskMessages,
      pageBreakdown,
      topTone,
      topSignal,
      topWrongArea,
      topPage,
      rewriteRate,
      positiveFeedback,
      negativeFeedback,
      totalFeedback,
      feedbackAccuracyRate,
      highRiskCount,
      mediumRiskCount,
      highestRisk,
      healthScore,
      healthTone,
      decisionSummary,
      frontendFunnel,
      funnelSessions,
      funnelEvents,
      funnelRates,
      funnelPages,
      autoDecisions,
    };
  }, [data]);

  const headlineCards = [
    {
      title: "Platform Health",
      value: `${derived.healthScore}/100`,
      subtitle: derived.healthTone.label,
      accent: derived.healthTone.color,
    },
    {
      title: "Total Analyses",
      value: safeNumber(derived.overview.total_analyses),
      subtitle: `${safeNumber(derived.overview.unique_visitors)} unique visitors`,
    },
    {
      title: "High Risk Cases",
      value: derived.highRiskCount,
      subtitle: `${derived.mediumRiskCount} medium-risk cases`,
      accent: derived.highRiskCount > 0 ? "#dc2626" : "#111827",
    },
    {
      title: "Rewrite Rate",
      value: `${derived.rewriteRate}%`,
      subtitle: `${safeNumber(derived.overview.rewrites_shown)} rewrites shown`,
      accent: derived.rewriteRate >= 70 ? "#b45309" : "#111827",
    },
  ];

  const businessCards = [
    {
      title: "Top Tone",
      value: derived.topTone,
      subtitle: "Most common tone classification",
    },
    {
      title: "Top Hidden Signal",
      value: derived.topSignal,
      subtitle: "Most common hidden signal",
    },
    {
      title: "Top Page",
      value: derived.topPage,
      subtitle: "Most active tool/page",
    },
    {
      title: "API Requests",
      value: safeNumber(derived.apiUsage.total_requests),
      subtitle: `${safeNumber(derived.apiUsage.active_api_keys)} active API keys`,
    },
  ];

  const feedbackCards = [
    {
      title: "Positive Feedback",
      value: derived.positiveFeedback,
      subtitle: "User-confirmed accurate results",
      accent: "#166534",
    },
    {
      title: "Negative Feedback",
      value: derived.negativeFeedback,
      subtitle: "User-reported misses",
      accent: derived.negativeFeedback > 0 ? "#b91c1c" : "#111827",
    },
    {
      title: "Accuracy Rate",
      value: derived.totalFeedback ? `${derived.feedbackAccuracyRate}%` : "-",
      subtitle: "Positive / total feedback",
      accent: derived.totalFeedback && derived.feedbackAccuracyRate < 70 ? "#b45309" : "#111827",
    },
    {
      title: "Top Wrong Area",
      value: derived.topWrongArea,
      subtitle: "Biggest user complaint",
    },
  ];

  const toneLogCards = [
    {
      title: "Tone Logs",
      value: safeNumber(derived.toneLogs.total_tone_logs),
      subtitle: "Raw tone log entries",
    },
    {
      title: "Avg Aggression",
      value: safeNumber(derived.toneLogs.avg_aggression),
      subtitle: "Mean aggression score",
    },
    {
      title: "Avg Politeness",
      value: safeNumber(derived.toneLogs.avg_politeness),
      subtitle: "Mean politeness score",
    },
    {
      title: "Avg Clarity",
      value: safeNumber(derived.toneLogs.avg_clarity),
      subtitle: "Mean clarity score",
    },
  ];

  const funnelCards = [
    {
      title: "Page View Sessions",
      value: safeNumber(derived.funnelSessions.page_view),
      subtitle: `${safeNumber(derived.funnelEvents.page_view)} total events`,
    },
    {
      title: "Typing Started",
      value: safeNumber(derived.funnelSessions.typing_started),
      subtitle: safePct(derived.funnelRates.page_to_typing_pct),
      accent: safeNumber(derived.funnelRates.page_to_typing_pct) < 35 ? "#b91c1c" : "#111827",
    },
    {
      title: "Analyze Clicked",
      value: safeNumber(derived.funnelSessions.analyze_click),
      subtitle: safePct(derived.funnelRates.typing_to_analyze_pct),
      accent: safeNumber(derived.funnelRates.typing_to_analyze_pct) < 45 ? "#b91c1c" : "#111827",
    },
    {
      title: "Results Shown",
      value: safeNumber(derived.funnelSessions.result_shown),
      subtitle: safePct(derived.funnelRates.analyze_to_result_pct),
      accent: safeNumber(derived.funnelRates.analyze_to_result_pct) < 90 ? "#b91c1c" : "#111827",
    },
    {
      title: "Abandon Sessions",
      value: safeNumber(derived.funnelSessions.abandon),
      subtitle: safePct(derived.funnelRates.typing_to_abandon_pct),
      accent: safeNumber(derived.funnelRates.typing_to_abandon_pct) > 35 ? "#b91c1c" : "#111827",
    },
    {
      title: "Rewrite Used",
      value: safeNumber(derived.funnelSessions.rewrite_used),
      subtitle: safePct(derived.funnelRates.result_to_rewrite_used_pct),
      accent: safeNumber(derived.funnelRates.result_to_rewrite_used_pct) >= 20 ? "#166534" : "#111827",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#6366f1",
              }}
            >
              Admin
            </div>
            <h1 style={{ margin: "10px 0 0 0", fontSize: "36px", color: "#111827", letterSpacing: "-0.05em" }}>
              Product Decision Dashboard
            </h1>
            <div style={{ color: "#64748b", marginTop: "8px", fontSize: "15px" }}>
              Backend-driven analytics, funnel visibility, and automatic next actions.
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                background: "#fff",
                fontWeight: 700,
              }}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            <button
              type="button"
              onClick={() => loadDashboard(days)}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <SectionCard title="Loading dashboard">
            <div style={{ color: "#64748b", fontSize: "14px" }}>Fetching latest analytics...</div>
          </SectionCard>
        )}

        {!loading && error && (
          <SectionCard title="Dashboard error" subtitle="The admin payload did not load.">
            <div style={{ color: "#b91c1c", fontSize: "14px", fontWeight: 700 }}>{error}</div>
          </SectionCard>
        )}

        {!loading && !error && data && (
          <>
            <div
              style={{
                marginBottom: "24px",
                padding: "22px",
                borderRadius: "20px",
                background: derived.healthTone.bg,
                border: `1px solid ${derived.healthTone.border}`,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: derived.healthTone.color,
                }}
              >
                Executive Read
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "30px",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  color: "#111827",
                }}
              >
                Platform health is {derived.healthTone.label.toLowerCase()} at {derived.healthScore}/100.
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "15px",
                  color: "#334155",
                  lineHeight: 1.7,
                  maxWidth: "980px",
                }}
              >
                {derived.healthScore < 60
                  ? "Do not chase new features. Fix the weakest output areas and funnel breakdowns first."
                  : derived.healthScore < 80
                  ? "The system is usable, but still needs guided improvement. Focus on the top complaint area and the biggest funnel drop."
                  : "The system is in a healthy state for controlled growth. Use message-level feedback and funnel analytics to choose the next iteration."}
              </div>
            </div>

            <StatGrid columns="repeat(4, minmax(0, 1fr))" items={headlineCards} />
            <StatGrid columns="repeat(4, minmax(0, 1fr))" items={businessCards} />
            <StatGrid columns="repeat(4, minmax(0, 1fr))" items={feedbackCards} />
            <StatGrid columns="repeat(4, minmax(0, 1fr))" items={toneLogCards} />

            <SectionCard
              title="Frontend Funnel"
              subtitle="This tells you where users are dropping. Fix these before doing random model tuning."
            >
              <StatGrid columns="repeat(3, minmax(0, 1fr))" items={funnelCards} />
            </SectionCard>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: "18px",
                marginTop: "24px",
                marginBottom: "24px",
              }}
            >
              <SectionCard
                title="Auto Decisions"
                subtitle="Backend-generated next actions. This should remove guesswork from what to fix next."
              >
                <div style={{ display: "grid", gap: "12px" }}>
                  {(derived.autoDecisions || []).map((item, index) => (
                    <AutoDecisionCard key={`${item.title}-${index}`} item={item} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Quick Product Signals"
                subtitle="A hard read of current behavior."
              >
                <div style={{ display: "grid", gap: "12px" }}>
                  <InsightRow
                    label="Page → Typing"
                    value={safePct(derived.funnelRates.page_to_typing_pct)}
                    tone={
                      safeNumber(derived.funnelRates.page_to_typing_pct) < 35
                        ? "danger"
                        : safeNumber(derived.funnelRates.page_to_typing_pct) < 50
                        ? "warning"
                        : "success"
                    }
                  />

                  <InsightRow
                    label="Typing → Analyze"
                    value={safePct(derived.funnelRates.typing_to_analyze_pct)}
                    tone={
                      safeNumber(derived.funnelRates.typing_to_analyze_pct) < 45
                        ? "danger"
                        : safeNumber(derived.funnelRates.typing_to_analyze_pct) < 60
                        ? "warning"
                        : "success"
                    }
                  />

                  <InsightRow
                    label="Analyze → Result"
                    value={safePct(derived.funnelRates.analyze_to_result_pct)}
                    tone={
                      safeNumber(derived.funnelRates.analyze_to_result_pct) < 90
                        ? "danger"
                        : "success"
                    }
                  />

                  <InsightRow
                    label="Typing → Abandon"
                    value={safePct(derived.funnelRates.typing_to_abandon_pct)}
                    tone={
                      safeNumber(derived.funnelRates.typing_to_abandon_pct) > 35
                        ? "danger"
                        : safeNumber(derived.funnelRates.typing_to_abandon_pct) > 20
                        ? "warning"
                        : "success"
                    }
                  />

                  <InsightRow
                    label="Result → Rewrite Used"
                    value={safePct(derived.funnelRates.result_to_rewrite_used_pct)}
                    tone={
                      safeNumber(derived.funnelRates.result_to_rewrite_used_pct) >= 20
                        ? "success"
                        : safeNumber(derived.funnelRates.result_to_rewrite_used_pct) >= 10
                        ? "warning"
                        : "neutral"
                    }
                  />

                  <InsightRow
                    label="Dominant Complaint"
                    value={derived.topWrongArea}
                    tone={derived.topWrongArea === "-" ? "neutral" : "warning"}
                  />
                </div>
              </SectionCard>
            </div>

            {derived.highestRisk && (
              <SectionCard
                title="Highest-Risk Message Right Now"
                subtitle="Fastest way to inspect whether the engine is seeing real danger or just noise."
              >
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#991b1b" }}>
                      Risk {derived.highestRisk.risk_score} • {formatLabel(derived.highestRisk.risk_level)} • {formatLabel(derived.highestRisk.tone)}
                    </div>

                    <div style={{ fontSize: "13px", color: "#7f1d1d", fontWeight: 700 }}>
                      Signal: {formatLabel(derived.highestRisk.hidden_signal)}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "14px",
                      color: "#111827",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {derived.highestRisk.message_preview || "Message text not saved for this event."}
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedRiskEvent(derived.highestRisk)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "12px",
                        border: "1px solid #fca5a5",
                        background: "#ffffff",
                        cursor: "pointer",
                        fontWeight: 800,
                        color: "#991b1b",
                      }}
                    >
                      Inspect this event
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            <details
              open={false}
              style={{
                marginTop: "24px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "18px",
                boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 900,
                  color: "#111827",
                  fontSize: "18px",
                  outline: "none",
                }}
              >
                Detailed Analytics
              </summary>

              <div
                style={{
                  marginTop: "18px",
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "20px",
                }}
              >
                <TableBlock
                  title="Frontend Funnel by Page"
                  columns={[
                    "page_slug",
                    "page_view_sessions",
                    "typing_started_sessions",
                    "analyze_click_sessions",
                    "result_shown_sessions",
                    "abandon_sessions",
                    "rewrite_used_sessions",
                  ]}
                  rows={derived.funnelPages}
                />

                <TableBlock
                  title="Daily Visits"
                  columns={["day", "unique_visitors", "unique_sessions", "unique_users", "total_analyses"]}
                  rows={data.daily_visits}
                />

                <TableBlock
                  title="Top Tones"
                  columns={["tone", "count"]}
                  rows={data.top_tones}
                  sortByCount={true}
                />

                <TableBlock
                  title="Top Hidden Signals"
                  columns={["hidden_signal", "count"]}
                  rows={(data.top_hidden_signals || []).filter((row) => row.hidden_signal !== "none")}
                  sortByCount={true}
                />

                <TableBlock
                  title="Risk Distribution"
                  columns={["risk_level", "count"]}
                  rows={data.risk_distribution}
                  sortByCount={true}
                />

                <TableBlock
                  title="Page Breakdown"
                  columns={["page_slug", "total_analyses", "unique_visitors"]}
                  rows={(data.page_slug_breakdown || []).filter((row) => row.page_slug !== "unknown")}
                />

                <TableBlock
                  title="Rewrite Trend"
                  columns={["day", "total", "rewrites_shown"]}
                  rows={data.rewrite_trend}
                />

                <TableBlock
                  title="API Usage by Endpoint"
                  columns={["endpoint", "total_requests"]}
                  rows={data.api_usage_overview?.top_endpoints || []}
                />

                <TableBlock
                  title="Feedback by Rating"
                  columns={["feedback_rating", "count"]}
                  rows={derived.feedbackByRating}
                  sortByCount={true}
                />

                <TableBlock
                  title="Negative Feedback by Wrong Area"
                  columns={["wrong_area", "count"]}
                  rows={derived.negativeByWrongArea}
                  sortByCount={true}
                />

                <TableBlock
                  title="Daily Feedback Trend"
                  columns={["day", "total_feedback", "positive_count", "negative_count"]}
                  rows={derived.dailyFeedbackTrend}
                />

                <TableBlock
                  title="Top Tone Log Labels"
                  columns={["label", "count"]}
                  rows={data.tone_logs_summary?.top_tone_log_labels || []}
                  sortByCount={true}
                />

                <TableBlock
                  title="Top Risk Messages"
                  columns={[
                    "id",
                    "risk_score",
                    "risk_level",
                    "tone",
                    "hidden_signal",
                    "page_slug",
                    "message_preview",
                    "created_at",
                  ]}
                  rows={data.top_risk_messages}
                  sortByCount={false}
                  onRowClick={setSelectedRiskEvent}
                />
              </div>
            </details>
          </>
        )}
      </div>

      <RiskDetailDrawer item={selectedRiskEvent} onClose={() => setSelectedRiskEvent(null)} />
    </div>
  );
}