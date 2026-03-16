function getToneAnimation(label = "") {
  const tone = String(label).toLowerCase();

  if (tone.includes("tense")) return "tc-tone-tense";
  if (tone.includes("aggressive")) return "tc-tone-aggressive";
  if (tone.includes("passive")) return "tc-tone-passive";
  if (tone.includes("friendly") || tone.includes("polite")) return "tc-tone-friendly";
  return "tc-tone-neutral";
}

function getToneTooltip(label = "") {
  const tone = String(label).toLowerCase();

  if (tone.includes("neutral")) {
    return "Neutral means the message sounds fairly calm and not emotionally loaded.";
  }
  if (tone.includes("tense")) {
    return "Tense means the message may feel stressed, pressuring, or slightly confrontational.";
  }
  if (tone.includes("aggressive")) {
    return "Aggressive means the message may feel harsh, hostile, or likely to start conflict.";
  }
  if (tone.includes("passive")) {
    return "Passive aggressive means the message may sound indirect, resentful, or sarcastic.";
  }
  if (tone.includes("friendly") || tone.includes("polite")) {
    return "This tone sounds warm, respectful, and easier for the other person to receive.";
  }

  return "This shows how the message is likely to come across emotionally.";
}

export default function ToneSummaryCard({
  toneTheme,
  getToneLabel,
  getToneEmoji,
  sendVerdict,
}) {
  const toneLabel = getToneLabel();
  const toneAnimationClass = getToneAnimation(toneLabel);
  const toneTooltip = getToneTooltip(toneLabel);

  return (
    <section
      className="tc-glow-card"
      style={{
        background: toneTheme.bg,
        border: `1px solid ${toneTheme.border}`,
        borderRadius: "30px",
        padding: "24px",
        boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div
            style={{
              fontSize: "34px",
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "#111827",
            }}
          >
            Should I send this?
          </div>

          <div
            style={{
              marginTop: "14px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "20px",
                display: "grid",
                placeItems: "center",
                background: toneTheme.iconBg,
                color: "#fff",
                fontSize: "36px",
                boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
                overflow: "hidden",
              }}
            >
              <span className={toneAnimationClass}>{getToneEmoji()}</span>
            </div>

            <div>
              <div
                style={{
                  fontSize: "26px",
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "#111827",
                }}
              >
                {sendVerdict?.label}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "15px",
                  color: "#475569",
                  maxWidth: "760px",
                }}
              >
                {sendVerdict?.reason}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            minWidth: "200px",
            padding: "16px 18px",
            borderRadius: "22px",
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          <div
            title={toneTooltip}
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#64748b",
              cursor: "help",
            }}
          >
            Tone
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "24px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#111827",
            }}
          >
            {toneLabel}
          </div>
        </div>
      </div>
    </section>
  );
}