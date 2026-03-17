function getLevel(score = 0) {
  if (score >= 70) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function getReplyVibe(score = 0) {
  if (score >= 70) return "Good";
  if (score >= 35) return "Mixed";
  return "Poor";
}

function formatHiddenSignal(signal = "") {
  const map = {
    threat_signal: "Threat",
    hostile_command_signal: "Hostile command",
    profanity_signal: "Profanity",
    insult_signal: "Insult",
    guilt_pressure: "Guilt pressure",
    emotional_leverage: "Emotional leverage",
    blame_shifting: "Blame shifting",
    accusatory_pressure_signal: "Accusatory pressure",
    pressure_signal: "Pressure",
    passive_aggression_signal: "Passive aggression",
    constructive_disagreement_signal: "Constructive disagreement",
    polite_request_signal: "Polite request",
    neutral_information: "Neutral",
  };

  if (!signal) return "Neutral";
  return map[signal] || signal.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
  hiddenSignal = "Neutral",
}) {
  return (
    <div style={{ marginTop: "4px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 900,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: "12px",
        }}
      >
        What could happen
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          label="Reply vibe"
          value={getReplyVibe(replyLikelihood)}
          tooltip="How likely the other person is to respond well."
        />

        <StatCard
          label="Chance of regret"
          value={getLevel(regretRisk)}
          tooltip="How likely you may wish you had worded this differently later."
        />

        <StatCard
          label="Emotional pressure"
          value={getLevel(manipulationRisk)}
          tooltip="How much tension or emotional pressure the message may create."
        />

        <StatCard
          label="Hidden signal"
          value={formatHiddenSignal(hiddenSignal)}
          tooltip="The underlying communication pattern detected in the message."
        />
      </div>
    </div>
  );
}