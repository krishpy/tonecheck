import { getSendVerdict } from "../../utils/sendDecision";

function getVerdictTheme(toneClass) {
  if (toneClass === "safe") {
    return {
      bg: "linear-gradient(135deg, rgba(236,253,245,0.95), rgba(240,253,250,0.92))",
      border: "1px solid rgba(34,197,94,0.20)",
      pillBg: "rgba(34,197,94,0.14)",
      pillText: "#15803d",
      title: "Safe to send",
    };
  }

  if (toneClass === "maybe") {
    return {
      bg: "linear-gradient(135deg, rgba(255,251,235,0.96), rgba(255,247,237,0.92))",
      border: "1px solid rgba(245,158,11,0.20)",
      pillBg: "rgba(245,158,11,0.14)",
      pillText: "#b45309",
      title: "Pause and rethink",
    };
  }

  return {
    bg: "linear-gradient(135deg, rgba(254,242,242,0.96), rgba(255,247,237,0.92))",
    border: "1px solid rgba(239,68,68,0.20)",
    pillBg: "rgba(239,68,68,0.14)",
    pillText: "#b91c1c",
    title: "Better not send",
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
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
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
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(15,23,42,0.06)",
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