import MetricCard from "../common/MetricCard";

export default function StatsRow({
  replyLikelihood,
  regretRisk,
  manipulationRisk,
  statExplanations,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
        gap: "16px",
      }}
    >
      <MetricCard
        label="Reply chance"
        value={`${replyLikelihood}%`}
        accent="#0f766e"
        explanation={statExplanations.reply}
      />

      <MetricCard
        label="Regret risk"
        value={`${regretRisk}%`}
        accent="#dc2626"
        explanation={statExplanations.regret}
      />

      <MetricCard
        label="Manipulation risk"
        value={`${manipulationRisk}%`}
        accent="#4f46e5"
        explanation={statExplanations.manipulation}
      />
    </div>
  );
}