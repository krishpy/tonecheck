import React from "react";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function cleanLabel(value, fallback = "None") {
  return String(value || fallback)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function riskLevel(risk) {
  if (risk >= 75) return "High Risk";
  if (risk >= 45) return "Medium Risk";
  return "Low Risk";
}

function afterRewriteRisk(risk) {
  if (risk >= 75) return clamp(risk - 54, 18, 35);
  if (risk >= 45) return clamp(risk - 28, 15, 38);
  return clamp(risk - 8, 4, 20);
}

function getOutcomeText(risk, tone = "") {
  const t = String(tone || "").toLowerCase();

  if (t.includes("threat") || risk >= 85) {
    return "High chance this message escalates the conversation.";
  }

  if (risk >= 70) {
    return "High chance this message creates defensiveness.";
  }

  if (risk >= 40) {
    return "This may not get the reply you want.";
  }

  return "This message is likely to land well.";
}

function getSignalChips({ tone, hiddenSignal, risk }) {
  const chips = [];

  const toneText = cleanLabel(tone, "Neutral");
  const hiddenText = cleanLabel(hiddenSignal, "");

  if (toneText && toneText !== "Neutral") {
    chips.push({ icon: "😡", label: toneText, tone: "red" });
  }

  if (hiddenText && hiddenText !== "None" && hiddenText !== "None Detected") {
    chips.push({ icon: "⚠️", label: hiddenText, tone: "orange" });
  }

  if (risk >= 65) {
    chips.push({ icon: "🧍", label: "May trigger defensiveness", tone: "purple" });
  } else if (risk >= 40) {
    chips.push({ icon: "💬", label: "Reply risk", tone: "purple" });
  } else {
    chips.push({ icon: "✅", label: "Likely safe", tone: "green" });
  }

  return chips.slice(0, 3);
}

function SignalChip({ icon, label, tone = "purple" }) {
  const styles = {
    red: {
      bg: "#fff1f2",
      border: "#fecdd3",
      color: "#be123c",
    },
    orange: {
      bg: "#fff7ed",
      border: "#fed7aa",
      color: "#c2410c",
    },
    purple: {
      bg: "#faf5ff",
      border: "#ddd6fe",
      color: "#6d28d9",
    },
    green: {
      bg: "#ecfdf5",
      border: "#bbf7d0",
      color: "#047857",
    },
  }[tone];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 18px",
        borderRadius: 22,
        border: `1.5px solid ${styles.border}`,
        background: styles.bg,
        color: styles.color,
        fontSize: 22,
        fontWeight: 900,
        lineHeight: 1.15,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function ToneCheckIcon({ size = 76 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontWeight: 1000,
        fontSize: Math.round(size * 0.36),
        boxShadow: "0 14px 30px rgba(124,58,237,0.26)",
        flexShrink: 0,
      }}
    >
      T✓
    </div>
  );
}

export default function ShareCard({
  toolTitle = "ToneCheck",
  message = "",
  rewrite = "",
  tone = "Neutral",
  risk = 0,
  hiddenSignal = "",
  showSignalChip = true,
}) {
  const safeRisk = clamp(Number(risk || 0), 0, 100);
  const improvedRisk = afterRewriteRisk(safeRisk);
  const chips = getSignalChips({
    tone,
    hiddenSignal: showSignalChip ? hiddenSignal : "",
    risk: safeRisk,
  });

  return (
    <div
      id="tone-share-card"
      style={{
        width: 1200,
        background: "linear-gradient(180deg, #f7f2ff 0%, #ffffff 100%)",
        borderRadius: 42,
        padding: 28,
        boxSizing: "border-box",
        fontFamily:
          "Inter, ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#101a44",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 36,
          padding: "42px 44px 34px",
          boxShadow: "0 16px 42px rgba(80,70,160,0.10)",
          border: "1px solid rgba(129,140,248,0.16)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            marginBottom: 34,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <ToneCheckIcon size={72} />

            <div
              style={{
                fontSize: 58,
                lineHeight: 1,
                fontWeight: 1000,
                letterSpacing: "-0.06em",
                color: "#172554",
              }}
            >
              Tone
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 55%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Check
              </span>
            </div>

            <div
              style={{
                padding: "13px 18px",
                borderRadius: 999,
                background: "#f3e8ff",
                border: "1px solid #ddd6fe",
                color: "#7c3aed",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              ✨ Spellcheck for Tone
            </div>
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#312e81",
              whiteSpace: "nowrap",
            }}
          >
            Better messages. Stronger connections. 💜
          </div>
        </div>

        {/* Top hero */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: 34,
            alignItems: "stretch",
            marginBottom: 34,
          }}
        >
          {/* Message left */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                color: "#f43f5e",
                fontSize: 25,
                fontWeight: 1000,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 22,
              }}
            >
              <span style={{ fontSize: 32 }}>⚠️</span>
              You almost sent this
            </div>

            <div
              style={{
                borderRadius: 28,
                border: "2px solid #fecdd3",
                background:
                  "linear-gradient(180deg, #fff1f2 0%, #fff7f8 100%)",
                padding: "34px 36px",
                minHeight: 178,
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: 24,
                  fontSize: 54,
                  color: "#fb7185",
                  fontWeight: 1000,
                }}
              >
                “
              </div>

              <div
                style={{
                  fontSize: message.length > 120 ? 34 : 46,
                  lineHeight: 1.18,
                  fontWeight: 1000,
                  letterSpacing: "-0.04em",
                  color: "#101a44",
                  textAlign: "left",
                  padding: "22px 12px 12px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 190,
                  overflow: "hidden",
                }}
              >
                {message || "No message provided."}
              </div>

              <div
                style={{
                  position: "absolute",
                  right: 24,
                  bottom: 10,
                  fontSize: 54,
                  color: "#fb7185",
                  fontWeight: 1000,
                }}
              >
                ”
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 18,
              }}
            >
              {chips.map((chip, idx) => (
                <SignalChip key={idx} {...chip} />
              ))}
            </div>
          </div>

          {/* Risk right */}
          <div
            style={{
              borderLeft: "2px solid #e5e7eb",
              paddingLeft: 34,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 1000,
                color: "#f43f5e",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Conflict Risk
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 112,
                    lineHeight: 0.95,
                    fontWeight: 1000,
                    letterSpacing: "-0.07em",
                    color: "#f43f5e",
                  }}
                >
                  {safeRisk}
                  <span style={{ fontSize: 42, letterSpacing: "-0.04em" }}>
                    %
                  </span>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginTop: 12,
                    padding: "12px 24px",
                    borderRadius: 999,
                    background:
                      safeRisk >= 70
                        ? "#f43f5e"
                        : safeRisk >= 40
                        ? "#f59e0b"
                        : "#16a34a",
                    color: "#ffffff",
                    fontSize: 22,
                    fontWeight: 1000,
                  }}
                >
                  {riskLevel(safeRisk)}
                </div>
              </div>

              <div
                style={{
                  width: 168,
                  height: 100,
                  borderRadius: "168px 168px 0 0",
                  background:
                    "conic-gradient(from 270deg, #f59e0b 0deg, #f59e0b 105deg, #ef4444 105deg, #ef4444 180deg, transparent 180deg)",
                  position: "relative",
                  marginTop: 20,
                }}
              >
                <div
                  style={{
                    width: 116,
                    height: 68,
                    borderRadius: "116px 116px 0 0",
                    background: "#ffffff",
                    position: "absolute",
                    left: 26,
                    bottom: 0,
                  }}
                />
                <div
                  style={{
                    width: 72,
                    height: 10,
                    borderRadius: 999,
                    background: "#101a44",
                    position: "absolute",
                    right: 28,
                    bottom: 26,
                    transform: `rotate(${safeRisk >= 70 ? "-32deg" : "-48deg"})`,
                    transformOrigin: "62px 5px",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                fontSize: 27,
                lineHeight: 1.42,
                color: "#1f2a5b",
                maxWidth: 430,
              }}
            >
              {getOutcomeText(safeRisk, tone)}
            </div>
          </div>
        </div>

        {/* Signals strip */}
        <div
          style={{
            borderRadius: 28,
            border: "1.5px solid #e5e7eb",
            background: "#ffffff",
            padding: "28px 30px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 25,
              fontWeight: 1000,
              color: "#101a44",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 22,
              textAlign: "left",
            }}
          >
            Detected Signals
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 22,
            }}
          >
            <div style={{ display: "flex", gap: 16, textAlign: "left" }}>
              <div style={{ fontSize: 44 }}>🎯</div>
              <div>
                <div style={{ fontSize: 25, fontWeight: 1000 }}>
                  {cleanLabel(hiddenSignal, "Tone Signal")}
                </div>
                <div style={{ fontSize: 20, lineHeight: 1.35, marginTop: 6 }}>
                  Blame or criticism may be detected.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, textAlign: "left" }}>
              <div style={{ fontSize: 44 }}>🛡️</div>
              <div>
                <div style={{ fontSize: 25, fontWeight: 1000 }}>
                  Defensive Trigger
                </div>
                <div style={{ fontSize: 20, lineHeight: 1.35, marginTop: 6 }}>
                  May make the other person defensive.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, textAlign: "left" }}>
              <div style={{ fontSize: 44 }}>💬</div>
              <div>
                <div style={{ fontSize: 25, fontWeight: 1000 }}>Reply Risk</div>
                <div style={{ fontSize: 20, lineHeight: 1.35, marginTop: 6 }}>
                  Medium chance of a negative or no reply.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewrite hero */}
        {!!rewrite && (
          <div
            style={{
              borderRadius: 30,
              border: "2px solid #86efac",
              background:
                "linear-gradient(180deg, #ecfdf5 0%, #f7fffb 100%)",
              padding: "34px 38px 30px",
              position: "relative",
              overflow: "hidden",
              textAlign: "left",
              marginBottom: 26,
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 42,
                top: 34,
                width: 128,
                height: 128,
                borderRadius: "999px",
                border: "4px solid #16a34a",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-10deg)",
                fontSize: 18,
                fontWeight: 1000,
                textAlign: "center",
                lineHeight: 1.15,
                opacity: 0.9,
              }}
            >
              SAVED BY
              <br />
              T✓
            </div>

            <div
              style={{
                fontSize: 29,
                fontWeight: 1000,
                color: "#16a34a",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 26,
              }}
            >
              ✨ Message I’d Send Instead
            </div>

            <div
              style={{
                fontSize: rewrite.length > 180 ? 34 : 43,
                lineHeight: 1.35,
                fontWeight: 1000,
                color: "#101a44",
                maxWidth: 860,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              “{rewrite}”
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 28,
              }}
            >
              {["Calmer", "Clearer", "More likely reply"].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 20px",
                    borderRadius: 999,
                    background: "#dcfce7",
                    border: "1.5px solid #86efac",
                    color: "#166534",
                    fontSize: 22,
                    fontWeight: 1000,
                  }}
                >
                  ✅ {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk delta */}
        {!!rewrite && (
          <div
            style={{
              borderRadius: 26,
              border: "1.5px solid #e5e7eb",
              background: "#ffffff",
              padding: "24px 34px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
              marginBottom: 26,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 1000,
                  color: "#101a44",
                  textTransform: "uppercase",
                }}
              >
                Conflict Risk
              </div>
              <div
                style={{
                  fontSize: 58,
                  fontWeight: 1000,
                  color: "#f43f5e",
                  lineHeight: 1,
                }}
              >
                {safeRisk}%
              </div>
              <div style={{ fontSize: 20, color: "#64748b", fontWeight: 800 }}>
                Before
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                color: "#16a34a",
                fontSize: 42,
                fontWeight: 1000,
              }}
            >
              ⟶
              <div style={{ fontSize: 22, marginTop: 2 }}>
                Risk reduced 🎉
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 58,
                  fontWeight: 1000,
                  color: "#16a34a",
                  lineHeight: 1,
                }}
              >
                {improvedRisk}%
              </div>
              <div style={{ fontSize: 20, color: "#64748b", fontWeight: 800 }}>
                After rewrite
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderRadius: 26,
            background: "linear-gradient(90deg, #faf5ff 0%, #ffffff 100%)",
            border: "1.5px solid #e9d5ff",
            padding: "22px 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <ToneCheckIcon size={64} />
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 1000,
                  color: "#6d28d9",
                  lineHeight: 1.1,
                }}
              >
                Saved by {toolTitle} 💜
              </div>
              <div style={{ fontSize: 20, color: "#334155", marginTop: 6 }}>
                Better messages. Stronger connections.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              fontWeight: 900,
              color: "#4f46e5",
            }}
          >
            <span>🌐 Check yours at</span>
            <span
              style={{
                background: "#7c3aed",
                color: "#ffffff",
                padding: "13px 22px",
                borderRadius: 16,
              }}
            >
              trytonecheck.com
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            borderRadius: 24,
            background: "#fafafa",
            padding: "18px 24px",
            fontSize: 21,
            color: "#312e81",
            fontWeight: 800,
          }}
        >
          ✨ Would you send this? ToneCheck helps you send messages you’ll feel
          good about.
        </div>
      </div>
    </div>
  );
}