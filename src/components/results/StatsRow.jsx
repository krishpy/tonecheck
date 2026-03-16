function getLevel(score = 0) {
  if (score >= 70) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function StatCard({ label, value, tooltip }) {
  return (
    <div
      title={tooltip}
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: "24px",
        padding: "18px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        cursor: "help",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 900,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "#64748b",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "28px",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatsRow({
  replyLikelihood = 0,
  regretRisk = 0,
  manipulationRisk = 0,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      <StatCard
        label="Reply Chance"
        value={getLevel(replyLikelihood)}
        tooltip="How likely the other person is to respond well."
      />

      <StatCard
        label="Second Thoughts"
        value={getLevel(regretRisk)}
        tooltip="How likely you may wish you had worded this differently later."
      />

      <StatCard
        label="Pressure Level"
        value={getLevel(manipulationRisk)}
        tooltip="How much emotional pressure the message may create."
      />
    </div>
  );
}