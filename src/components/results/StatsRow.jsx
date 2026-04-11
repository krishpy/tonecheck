import useIsMobile from "../../hooks/useIsMobile";

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
    passive_aggression: "Passive aggression",
    constructive_disagreement_signal: "Constructive disagreement",
    polite_request_signal: "Polite request",
    neutral_information: "Neutral",
    none: "Neutral",
  };

  if (!signal) return "Neutral";
  return map[signal] || signal.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPressureLevel(value = "") {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  if (normalized === "low") return "Low";

  return "Low";
}

function StatCard({ label, value, tooltip }) {
  return (
    <div
      title={tooltip}
      style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(15,23,42,0.05)",
        borderRadius: "20px",
        padding: "16px 18px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        minHeight: "108px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "help",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "#64748b",
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "24px",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: "#111827",
          lineHeight: 1.1,
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
  emotionalPressure = "low",
  hiddenSignal = "Neutral",
}) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "repeat(2, 1fr)"
          : "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "14px",
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
        value={formatPressureLevel(emotionalPressure)}
        tooltip="How much tension or emotional pressure the message may create."
      />

      <StatCard
        label="Hidden signal"
        value={formatHiddenSignal(hiddenSignal)}
        tooltip="The underlying communication pattern detected in the message."
      />
    </div>
  );
}