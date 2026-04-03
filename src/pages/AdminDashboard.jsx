import React, { useEffect, useState } from "react";

const API =
  "http://127.0.0.1:8000/admin/analytics/dashboard?days=30";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: "30px", fontFamily: "Inter" }}>
      <h2>📊 Communication Intelligence Dashboard</h2>

      <div style={{ marginTop: 20 }}>
        <h3>Overview</h3>
        <p>Total Analyses: {data.overview.total_analyses}</p>
        <p>Unique Visitors: {data.overview.unique_visitors}</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Daily Visits</h3>
        {data.daily_visits.map((d, i) => (
          <div key={i}>
            {d.day} → {d.unique_visitors} users
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Top Tones</h3>
        {data.top_tones.map((t, i) => (
          <div key={i}>
            {t.tone}: {t.count}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Top Hidden Signals</h3>
        {data.top_hidden_signals.map((s, i) => (
          <div key={i}>
            {s.signal}: {s.count}
          </div>
        ))}
      </div>
    </div>
  );
}