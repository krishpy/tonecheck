import { getSendVerdict } from "../../utils/sendDecision";

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

export default function SendDecisionCard({
  riskScore = 0,
  regretRisk = 0,
  manipulationRisk = 0,
  tone = "",
  hiddenSignal = "",
}) {
  const verdict = getSendVerdict(riskScore, regretRisk, manipulationRisk);
  const theme = getVerdictTheme(verdict.toneClass);

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
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Should I Send This?
          </div>

          <div
            style={{
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "#111827",
              }}
            >
              {theme.title}
            </div>

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
              <span>{verdict.label}</span>
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
            minWidth: "120px",
            padding: "14px 16px",
            borderRadius: "20px",
            background: theme.pillBg,
            border: theme.border,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Risk
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "30px",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "#111827",
            }}
          >
            {riskScore}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {tone ? (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.74)",
              border: "1px solid rgba(15,23,42,0.06)",
              fontSize: "13px",
              color: "#334155",
            }}
          >
            Tone: <strong>{tone}</strong>
          </div>
        ) : null}

        {hiddenSignal ? (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.74)",
              border: "1px solid rgba(15,23,42,0.06)",
              fontSize: "13px",
              color: "#334155",
            }}
          >
            Signal: <strong>{hiddenSignal}</strong>
          </div>
        ) : null}

        <div
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.74)",
            border: "1px solid rgba(15,23,42,0.06)",
            fontSize: "13px",
            color: "#334155",
          }}
        >
          Second-thought risk: <strong>{regretRisk}</strong>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.74)",
            border: "1px solid rgba(15,23,42,0.06)",
            fontSize: "13px",
            color: "#334155",
          }}
        >
          Pressure risk: <strong>{manipulationRisk}</strong>
        </div>
      </div>
    </section>
  );
}