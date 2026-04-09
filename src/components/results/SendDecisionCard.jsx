function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function verdictFromApiValue(sendVerdict) {
  const v = normalize(sendVerdict);

  if (v === "do_not_send" || v === "do not send" || v === "dont_send") {
    return {
      label: "Do Not Send",
      sublabel: "This may escalate badly",
      emoji: "🚫",
      tone: "danger",
    };
  }

  if (v === "rethink" || v === "rethink_before_sending") {
    return {
      label: "Rethink Before Sending",
      sublabel: "This may create emotional pressure or damage trust",
      emoji: "⚠️",
      tone: "danger",
    };
  }

  if (v === "review" || v === "review_before_sending") {
    return {
      label: "Careful — may be misunderstood",
      sublabel: "Your intent may land as pressure or blame",
      emoji: "⚠️",
      tone: "warning",
    };
  }

  if (v === "send" || v === "safe" || v === "safe_to_send") {
    return {
      label: "Safe to Send",
      sublabel: "Clear and unlikely to cause issues",
      emoji: "✅",
      tone: "safe",
    };
  }

  return null;
}

function inferVerdictFromSignals(
  risk,
  regret,
  manipulation,
  threat = 0,
  tone = "",
  hiddenSignal = "",
  replyVibe = ""
) {
  const riskScore = toNumber(risk);
  const regretScore = toNumber(regret);
  const manipulationScore = toNumber(manipulation);
  const threatScore = toNumber(threat);

  const toneLabel = normalize(tone);
  const hidden = normalize(hiddenSignal);
  const reply = normalize(replyVibe);

  const combined = riskScore + regretScore * 0.3 + manipulationScore * 0.3;

  const isPassiveAggressive =
    toneLabel === "passive aggressive" ||
    toneLabel === "passive" ||
    hidden === "passive aggression" ||
    hidden === "passive_aggression" ||
    hidden === "passive_aggression_signal";

  const isAccusatory =
    toneLabel === "accusatory" ||
    hidden === "accusation signal" ||
    hidden === "accusation_signal" ||
    hidden === "accusatory pressure signal" ||
    hidden === "accusatory_pressure_signal";

  const isManipulative =
    toneLabel === "manipulative" ||
    hidden === "guilt tripping" ||
    hidden === "guilt trip signal" ||
    hidden === "guilt_trip_signal" ||
    hidden === "guilt_tripping" ||
    hidden === "emotional leverage" ||
    hidden === "emotional_leverage" ||
    hidden === "emotional dependency" ||
    hidden === "emotional_dependency" ||
    hidden === "moral_pressure";

  const isTense =
    toneLabel === "tense" ||
    toneLabel === "frustrated" ||
    toneLabel === "aggressive";

  if (threatScore >= 60 || riskScore >= 85) {
    return {
      label: "Do Not Send",
      sublabel: "This may escalate badly",
      emoji: "🚫",
      tone: "danger",
    };
  }

   // 🔥 Stronger review tier for manipulation / very poor reply outlook
  if (isManipulative || reply === "poor") {
    return {
      label: "Rethink Before Sending",
      sublabel: "This may create emotional pressure or damage trust",
      emoji: "⚠️",
      tone: "danger",
    };
  }

  // ⚠️ Medium review tier for passive-aggressive / accusatory tone
  if (isPassiveAggressive || isAccusatory) {
    return {
      label: "Careful — may be misunderstood",
      sublabel: "Your intent may land as pressure or blame",
      emoji: "⚠️",
      tone: "warning",
    };
  }

  if (combined >= 65 || riskScore >= 50) {
    return {
      label: "Careful — may be misunderstood",
      sublabel: "Your message may trigger defensiveness",
      emoji: "⚠️",
      tone: "warning",
    };
  }

  if (combined >= 40 || isTense) {
    return {
      label: "Send — but refine it",
      sublabel: "Could be misunderstood",
      emoji: "😐",
      tone: "neutral",
    };
  }

  return {
    label: "Safe to Send",
    sublabel: "Clear and unlikely to cause issues",
    emoji: "✅",
    tone: "safe",
  };
}

function getSendVerdict(payload) {
  const apiVerdict = verdictFromApiValue(
    payload?.sendVerdict || payload?.send_verdict
  );
  if (apiVerdict) return apiVerdict;

  return inferVerdictFromSignals(
    payload?.risk,
    payload?.regret,
    payload?.manipulation,
    payload?.threat,
    payload?.tone,
    payload?.hiddenSignal || payload?.hidden_signal,
    payload?.replyVibe || payload?.reply_vibe
  );
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

  if (toneClass === "neutral" || toneClass === "warning") {
    return {
      bg: "linear-gradient(135deg, rgba(254,249,195,0.96), rgba(255,251,235,0.94))",
      border: "1px solid rgba(245,158,11,0.28)",
      pillBg: "rgba(245,158,11,0.16)",
      pillText: "#b45309",
      title: "Review before sending",
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

function getReadableSignal(signal) {
  const map = {
    polite_request_signal: "a polite ask",
    accusatory_pressure_signal: "blame or pressure",
    accusation_signal: "blame or pressure",
    pressure_signal: "urgency or pressure",
    passive_aggression_signal: "passive aggression",
    passive_aggression: "passive aggression",
    guilt_tripping: "guilt-tripping",
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
  if (typeof score === "string") return score;
  if (score >= 70) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

export default function SendDecisionCard({
  result = null,
  riskScore = 0,
  regretRisk = 0,
  manipulationRisk = 0,
  threatScore = 0,
  tone = "",
  hiddenSignal = "",
  replyVibe = "",
}) {
  const effectiveResult = result || {
    communication_risk_score: riskScore,
    regret_risk: regretRisk,
    manipulation_risk: manipulationRisk,
    threat_score: threatScore,
    tone,
    primary_hidden_signal: hiddenSignal,
    reply_vibe: replyVibe,
    send_verdict: "",
  };

  const theme = getVerdictTheme(verdict.tone);

  const displayTone = effectiveResult?.tone || tone;
  const displayHiddenSignal =
    effectiveResult?.primary_hidden_signal || hiddenSignal;

  const displayRegret =
    effectiveResult?.chance_of_regret ??
    effectiveResult?.regret_risk_band ??
    regretRisk;

  const regretLabel = getLevelLabel(displayRegret);

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
            {verdict.sublabel}
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
        {displayTone ? (
          <div
            title="How your message emotionally comes across."
            style={chipStyle}
          >
            Comes across as: <strong>{displayTone}</strong>
          </div>
        ) : null}

        {displayHiddenSignal ? (
          <div
            title="The main feeling or pattern detected in the message."
            style={chipStyle}
          >
            Feels like: <strong>{getReadableSignal(displayHiddenSignal)}</strong>
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