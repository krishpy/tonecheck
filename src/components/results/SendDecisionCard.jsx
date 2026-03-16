import { getSendVerdict } from "../../utils/sendDecision";

function getReadableSignal(signal) {
  const map = {
    polite_request_signal: "a polite ask",
    accusatory_pressure_signal: "blame or pressure",
    pressure_signal: "urgency or pressure",
    passive_aggression_signal: "passive aggression",
    hostility_signal: "hostility",
    threat_signal: "a threat",
    profanity_signal: "harsh language",
    insult_signal: "an insult",
    hostile_command_signal: "a harsh command",
    constructive_disagreement_signal: "calm disagreement",
    neutral_information: "neutral",
  };

  return map[String(signal || "").trim()] || String(signal || "neutral").replaceAll("_", " ");
}

function getVerdictTheme(toneClass) {
  if (toneClass === "safe") {
    return {
      bg: "linear-gradient(135deg, rgba(220,252,231,0.96), rgba(240,253,244,0.94))",
      border: "1px solid rgba(34,197,94,0.28)",
      pillBg: "rgba(34,197,94,0.16)",
      pillText: "#15803d",
      title: "Safe to send",
      shadow: "0 12px 30px rgba(34,197,94,0.10)",
    };
  }

  if (toneClass === "maybe") {
    return {
      bg: "linear-gradient(135deg, rgba(254,249,195,0.96), rgba(255,251,235,0.94))",
      border: "1px solid rgba(245,158,11,0.28)",
      pillBg: "rgba(245,158,11,0.16)",
      pillText: "#b45309",
      title: "Pause and rethink",
      shadow: "0 12px 30px rgba(245,158,11,0.10)",
    };
  }

  return {
    bg: "linear-gradient(135deg, rgba(254,226,226,0.96), rgba(254,242,242,0.94))",
    border: "1px solid rgba(239,68,68,0.28)",
    pillBg: "rgba(239,68,68,0.16)",
    pillText: "#b91c1c",
    title: "Better not send",
    shadow: "0 12px 30px rgba(239,68,68,0.10)",
  };
}

const chipStyle = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.74)",
  border: "1px solid rgba(15,23,42,0.06)",
  fontSize: "13px",
  color: "#334155",
  cursor: "help",
};

function getLevelLabel(score = 0) {
  if (score >= 70) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

export default function SendDecisionCard({
  riskScore = 0,
  regretRisk = 0,
  manipulationRisk = 0,
  tone = "",
  hiddenSignal = "",
}) {
  const verdict = getSendVerdict(riskScore, regretRisk, manipulationRisk);
  const theme = getVerdictTheme(verdict.toneClass);
  const regretLabel = getLevelLabel(regretRisk);

  return (
    <section
      className="tc-glow-card"
      style={{
        background: theme.bg,
        border: theme.border,
        borderRadius: "28px",
        padding: "22px",
        boxShadow: theme.shadow,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Should I Send This?
            </div>

            <div
              title="This is the quick answer based on tone, emotional pressure, and chance of regret."
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                fontSize: "11px",
                fontWeight: 800,
                color: "#475569",
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(15,23,42,0.08)",
                cursor: "help",
              }}
            >
              i
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "999px",
                background: theme.pillBg,
                color: theme.pillText,
                fontWeight: 800,
                fontSize: "14px",
              }}
            >
              <span>{verdict.emoji}</span>
              <span>{theme.title}</span>
            </div>
          </div>

          <div
            style={{
              marginTop: "10px",
              color: "#475569",
              fontSize: "15px",
              lineHeight: 1.6,
              maxWidth: "760px",
            }}
          >
            {verdict.reason}
          </div>
        </div>

        <div
          style={{
            minWidth: "160px",
            padding: "14px 16px",
            borderRadius: "20px",
            background: theme.pillBg,
            border: theme.border,
            textAlign: "center",
          }}
        >
          <div
            title="Quick read on whether this is okay to send as-is."
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#64748b",
              textTransform: "uppercase",
              cursor: "help",
            }}
          >
            Decision
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "24px",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "#111827",
              lineHeight: 1.1,
            }}
          >
            {theme.title}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {tone ? (
          <div
            title="How your message emotionally comes across."
            style={chipStyle}
          >
            Comes across as: <strong>{tone}</strong>
          </div>
        ) : null}

        {hiddenSignal ? (
          <div
            title="The main feeling or pattern detected in the message."
            style={chipStyle}
          >
            Feels like: <strong>{getReadableSignal(hiddenSignal)}</strong>
          </div>
        ) : null}

        <div
          title="Chance you may wish you had worded this differently later."
          style={chipStyle}
        >
          Second thoughts: <strong>{regretLabel}</strong>
        </div>
      </div>
    </section>
  );
}