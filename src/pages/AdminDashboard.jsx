import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function formatLabel(value) {
  if (!value) return "-";

  return String(value)
    .replace(/_signal$/i, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "18px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}>
        {value}
      </div>
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
        <Card key={item.title} title={item.title} value={item.value} />
      ))}
    </div>
  );
}

function getRiskColor(level) {
  if (level === "high" || level === "severe") return "#ef4444";
  if (level === "medium") return "#f59e0b";
  return "#10b981";
}

function TableBlock({ 
    title, 
    columns, 
    rows, 
    sortByCount = false,
    onRowClick = null,

 }) {
  const finalRows = sortByCount
    ? [...(rows || [])].sort((a, b) => (b.count || 0) - (a.count || 0))
    : rows || [];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "18px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "14px" }}>{title}</h3>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  textAlign: "left",
                  fontSize: "13px",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                  padding: "10px 8px",
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
                    fontWeight: col === "risk_level" ? 700 : 400,
                  }}
                >
  {col === "tone" || col === "hidden_signal" || col === "risk_level"
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
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [selectedRiskEvent, setSelectedRiskEvent] = useState(null);

  async function loadDashboard(selectedDays) {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/admin/analytics/dashboard?days=${selectedDays}`
      );
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Dashboard load failed:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard(days);
  }, [days]);

  const topTone = formatLabel(data?.top_tones?.[0]?.tone || "-");
const topSignal = formatLabel(
  data?.top_hidden_signals?.find((x) => x.hidden_signal !== "none")?.hidden_signal || "-"
);

  const feedbackByRating = data?.feedback_summary?.by_rating || [];
  const negativeByWrongArea = data?.feedback_summary?.negative_by_wrong_area || [];
  const dailyFeedbackTrend = data?.feedback_summary?.daily_feedback_trend || [];

  const positiveFeedback =
    feedbackByRating.find((x) => x.feedback_rating === "positive")?.count || 0;

  const negativeFeedback =
    feedbackByRating.find((x) => x.feedback_rating === "negative")?.count || 0;

  const topWrongArea =
    negativeByWrongArea?.[0]?.wrong_area
      ? formatLabel(negativeByWrongArea[0].wrong_area)
      : "-";

  const apiUsage = data?.api_usage_overview || {};
  const toneLogs = data?.tone_logs_summary || {};
  const topPage =
    data?.page_slug_breakdown?.find((x) => x.page_slug !== "unknown")?.page_slug || "-";
  const rewriteRate =
    data?.overview?.total_analyses
      ? Math.round((data.overview.rewrites_shown / data.overview.total_analyses) * 100)
      : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: "32px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", color: "#111827" }}>
              Analytics Dashboard
            </h1>
            <div style={{ color: "#6b7280", marginTop: "6px" }}>
              Communication Intelligence Platform
            </div>
          </div>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              background: "#fff",
            }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {loading && <div>Loading dashboard...</div>}

        {!loading && data && (
          <>
           <StatGrid
  columns="repeat(5, minmax(0, 1fr))"
  items={[
    { title: "Total Analyses", value: data.overview?.total_analyses || 0 },
    { title: "Unique Visitors", value: data.overview?.unique_visitors || 0 },
    { title: "Unique Sessions", value: data.overview?.unique_sessions || 0 },
    { title: "Unique Users", value: data.overview?.unique_users || 0 },
    { title: "Rewrites Shown", value: data.overview?.rewrites_shown || 0 },
  ]}
/>

       <StatGrid
  columns="repeat(4, minmax(0, 1fr))"
  items={[
    { title: "Top Tone", value: topTone },
    { title: "Top Hidden Signal", value: topSignal },
    { title: "Top Page", value: topPage },
    { title: "Rewrite Rate", value: `${rewriteRate}%` },
  ]}
/>

<StatGrid
  columns="repeat(4, minmax(0, 1fr))"
  items={[
    { title: "Active API Keys", value: apiUsage.active_api_keys || 0 },
    { title: "Active Tenants", value: apiUsage.active_tenants || 0 },
    { title: "API Requests", value: apiUsage.total_requests || 0 },
    { title: "Top Wrong Area", value: topWrongArea },
  ]}
/>

<StatGrid
  columns="repeat(4, minmax(0, 1fr))"
  items={[
    { title: "Positive Feedback", value: positiveFeedback },
    { title: "Negative Feedback", value: negativeFeedback },
    { title: "Tone Logs", value: toneLogs.total_tone_logs || 0 },
    { title: "Avg Aggression", value: toneLogs.avg_aggression || 0 },
  ]}
/>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "20px",
              }}
            >
              <TableBlock
                title="Daily Visits"
                columns={[
                  "day",
                  "unique_visitors",
                  "unique_sessions",
                  "unique_users",
                  "total_analyses",
                ]}
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
                rows={(data.top_hidden_signals || []).filter(
                    (row) => row.hidden_signal !== "none"
                )}
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
                rows={(data.page_slug_breakdown || []).filter(
                  (row) => row.page_slug !== "unknown"
                )}
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
  rows={feedbackByRating}
  sortByCount={true}
/>

<TableBlock
  title="Negative Feedback by Wrong Area"
  columns={["wrong_area", "count"]}
  rows={negativeByWrongArea}
  sortByCount={true}
/>

<TableBlock
  title="Daily Feedback Trend"
  columns={["day", "total_feedback", "positive_count", "negative_count"]}
  rows={dailyFeedbackTrend}
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
          </>
        )}
      </div>
    </div>
  );
}