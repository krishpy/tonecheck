import React from "react";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function cleanLabel(value, fallback = "None") {
  return String(value || fallback)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isSafeMessage(risk, tone = "", hiddenSignal = "") {
  const t = String(tone || "").toLowerCase();
  const h = String(hiddenSignal || "").toLowerCase();

  return (
    risk <= 25 ||
    t.includes("polite") ||
    t.includes("friendly") ||
    t.includes("neutral") ||
    h.includes("none")
  );
}

function riskLevel(risk) {
  if (risk >= 75) return "High Risk";
  if (risk >= 45) return "Medium Risk";
  return "Low Risk";
}

function improvedRisk(risk) {
  if (risk >= 75) return clamp(risk - 54, 18, 35);
  if (risk >= 45) return clamp(risk - 28, 15, 38);
  return clamp(risk - 8, 4, 20);
}

function ToneCheckIcon({ size = 72 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: "linear-gradient(135deg,#6d28d9,#ec4899)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 1000,
        boxShadow: "0 16px 32px rgba(124,58,237,.22)",
        flexShrink: 0,
      }}
    >
      T✓
    </div>
  );
}

function Pill({ icon, label, safe = false }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 999,
        background: safe ? "#ecfdf5" : "#fff1f2",
        border: `1.5px solid ${safe ? "#bbf7d0" : "#fecdd3"}`,
        color: safe ? "#15803d" : "#be123c",
        fontSize: 21,
        fontWeight: 1000,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function RiskMiniBadge({ risk, safe }) {
  return (
    <div
      style={{
        position: "absolute",
        right: 26,
        top: 24,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 18,
        background: "#ffffff",
        border: `1.5px solid ${safe ? "#bbf7d0" : "#fecdd3"}`,
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontWeight: 1000,
          color: "#101a44",
          letterSpacing: ".03em",
        }}
      >
        CONFLICT RISK
      </span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 1000,
          color: safe ? "#16a34a" : "#f43f5e",
        }}
      >
        {risk}%
      </span>
      <span
        style={{
          padding: "7px 12px",
          borderRadius: 999,
          background: safe ? "#16a34a" : "#f59e0b",
          color: "#fff",
          fontSize: 16,
          fontWeight: 1000,
        }}
      >
        {riskLevel(risk)}
      </span>
    </div>
  );
}

function SavedStamp() {
  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        bottom: 30,
        width: 108,
        height: 108,
        borderRadius: "50%",
        border: "4px double #16a34a",
        color: "#16a34a",
        background: "rgba(236,253,245,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(-12deg)",
        fontWeight: 1000,
        textAlign: "center",
        lineHeight: 1.05,
        boxShadow: "0 8px 18px rgba(22,163,74,0.12)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, letterSpacing: ".08em" }}>SAVED BY</div>
        <div style={{ fontSize: 38 }}>T✓</div>
        <div style={{ fontSize: 11, letterSpacing: ".1em" }}>TONECHECK</div>
      </div>
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
}) {
  const safeRisk = clamp(Number(risk || 0), 0, 100);
  const safe = isSafeMessage(safeRisk, tone, hiddenSignal);
  const afterRisk = improvedRisk(safeRisk);

  const primaryColor = safe ? "#16a34a" : "#f43f5e";
  const lightBg = safe ? "#ecfdf5" : "#fff1f2";
  const borderColor = safe ? "#bbf7d0" : "#fecdd3";

  const titleText = safe ? "YOU’RE GOOD TO SEND THIS" : "YOU ALMOST SENT THIS";
  const outcomeText = safe
    ? "This message is likely to land well."
    : safeRisk >= 70
    ? "High chance this message creates defensiveness."
    : "This may not get the reply you want.";

  const toneLabel = safe ? cleanLabel(tone, "Polite") : cleanLabel(tone, "Accusatory");
  const signalLabel = safe ? "Likely safe" : cleanLabel(hiddenSignal, "Accusation Signal");

  return (
    <div
      id="tone-share-card"
      style={{
        width: 1200,
        background: "linear-gradient(180deg,#f7f2ff,#ffffff)",
        borderRadius: 42,
        padding: 28,
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#101a44",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 36,
          padding: "42px 44px 34px",
          boxShadow: "0 16px 42px rgba(80,70,160,.10)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 34,
          }}
        >
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <ToneCheckIcon size={74} />
            <div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 1000,
                  letterSpacing: "-.06em",
                  lineHeight: 1,
                }}
              >
                Tone
                <span
                  style={{
                    background: "linear-gradient(135deg,#4f46e5,#8b5cf6,#ec4899)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Check
                </span>
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#7c3aed",
                  marginTop: 8,
                }}
              >
                ✨ Spellcheck for Tone
              </div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              fontSize: 34,
              fontWeight: 800,
              color: "#7c3aed",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.12,
              minWidth: 500,
              paddingTop: 4,
            }}
          >
            Better messages.
            <br />
            Stronger connections.

            <div
              style={{
                position: "absolute",
                left: 140,
                bottom: -14,
                width: 260,
                height: 4,
                background: "#7c3aed",
                borderRadius: 999,
                transform: "rotate(-3deg)",
              }}
            />

            <div
              style={{
                position: "absolute",
                right: 12,
                top: 14,
                fontSize: 34,
              }}
            >
              💕💜
            </div>

            <div
              style={{
                position: "absolute",
                right: 52,
                top: 54,
                fontSize: 24,
                color: "#a855f7",
              }}
            >
              ⤳ · · ·
            </div>
          </div>
        </div>

        {/* Message Hero */}
        <div
          style={{
            borderRadius: 32,
            border: `2px solid ${borderColor}`,
            background: `linear-gradient(180deg,${lightBg},#ffffff)`,
            padding: "34px 38px",
            marginBottom: 28,
            position: "relative",
            textAlign: "left",
          }}
        >
          <RiskMiniBadge risk={safeRisk} safe={safe} />

          <div
            style={{
              color: primaryColor,
              fontSize: 30,
              fontWeight: 1000,
              letterSpacing: ".04em",
              marginBottom: 26,
              paddingRight: 360,
            }}
          >
            {safe ? "✅" : "⚠️"} {titleText}
          </div>

          <div
            style={{
              fontSize: message.length > 160 ? 32 : message.length > 90 ? 40 : 48,
              fontWeight: 1000,
              lineHeight: 1.28,
              letterSpacing: "-.035em",
              color: "#101a44",
              whiteSpace: "normal",
              wordBreak: "normal",
              overflowWrap: "break-word",
              paddingRight: 90,
            }}
          >
            “{message || "No message provided."}”
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              marginTop: 30,
            }}
          >
            <Pill icon={safe ? "😊" : "😡"} label={toneLabel} safe={safe} />
            <Pill icon={safe ? "✅" : "⚠️"} label={signalLabel} safe={safe} />
            {!safe && <Pill icon="💬" label="Reply risk" safe={false} />}
          </div>

          <div
            style={{
              marginTop: 24,
              color: "#1f2a5b",
              fontSize: 26,
              lineHeight: 1.4,
            }}
          >
            {outcomeText}
          </div>
        </div>

        {/* Detected Signals */}
        <div
          style={{
            borderRadius: 28,
            border: "1.5px solid #e5e7eb",
            padding: "28px 30px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 27,
              fontWeight: 1000,
              letterSpacing: ".04em",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            DETECTED SIGNALS
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 28,
            }}
          >
            {[
              {
                icon: "🎯",
                title: safe ? "Tone Signal" : signalLabel,
                body: safe ? "Polite and respectful." : "Blame or criticism may be detected.",
              },
              {
                icon: "🛡️",
                title: "Defensive Trigger",
                body: safe ? "Very low chance." : "May make the other person defensive.",
              },
              {
                icon: "💬",
                title: "Reply Risk",
                body: safe
                  ? "High chance of a positive reply."
                  : "Medium chance of a negative or no reply.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: 44,
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: safe ? "#dcfce7" : "#fff1f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 25,
                      fontWeight: 1000,
                      color: safe ? "#16a34a" : "#101a44",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 20, lineHeight: 1.35, marginTop: 6 }}>
                    {item.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewrite only if risky */}
        {!safe && rewrite && (
          <>
            <div
              style={{
                borderRadius: 30,
                border: "2px solid #86efac",
                background: "linear-gradient(180deg,#ecfdf5,#f7fffb)",
                padding: "34px 38px",
                marginBottom: 26,
                position: "relative",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: 26,
                  top: 22,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  borderRadius: 16,
                  background: "#ffffff",
                  border: "1.5px solid #bbf7d0",
                  color: "#16a34a",
                  fontWeight: 1000,
                  fontSize: 20,
                }}
              >
                CONFLICT RISK <span style={{ fontSize: 27 }}>{afterRisk}%</span>
              </div>

              <SavedStamp />

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 1000,
                  color: "#16a34a",
                  marginBottom: 26,
                  letterSpacing: ".03em",
                  paddingRight: 260,
                }}
              >
                ✨ MESSAGE I’D SEND INSTEAD
              </div>

              <div
                style={{
                  fontSize: rewrite.length > 220 ? 30 : rewrite.length > 140 ? 36 : 42,
                  fontWeight: 1000,
                  lineHeight: 1.35,
                  color: "#101a44",
                  whiteSpace: "normal",
                  wordBreak: "normal",
                  overflowWrap: "break-word",
                  paddingRight: 130,
                }}
              >
                “{rewrite}”
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
                {["Calmer", "Clearer", "More likely reply"].map((x) => (
                  <Pill key={x} icon="✅" label={x} safe />
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: 26,
                border: "1.5px solid #e5e7eb",
                padding: "24px 34px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                alignItems: "center",
                marginBottom: 26,
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 1000 }}>CONFLICT RISK</div>
                <div style={{ fontSize: 58, fontWeight: 1000, color: "#f43f5e" }}>
                  {safeRisk}%
                </div>
                <div style={{ fontSize: 19, color: "#64748b", fontWeight: 800 }}>
                  Before
                </div>
              </div>

              <div style={{ color: "#16a34a", fontSize: 42, fontWeight: 1000 }}>
                →
                <div style={{ fontSize: 22 }}>Risk reduced 🎉</div>
              </div>

              <div>
                <div style={{ fontSize: 58, fontWeight: 1000, color: "#16a34a" }}>
                  {afterRisk}%
                </div>
                <div style={{ fontSize: 19, color: "#64748b", fontWeight: 800 }}>
                  After rewrite
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div
          style={{
            borderRadius: 26,
            background: "linear-gradient(90deg,#faf5ff,#fff)",
            border: "1.5px solid #e9d5ff",
            padding: "22px 26px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <ToneCheckIcon size={64} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 30, fontWeight: 1000, color: "#6d28d9" }}>
                Saved by {toolTitle} 💜
              </div>
              <div style={{ fontSize: 20, color: "#334155" }}>
                Better messages. Stronger connections.
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 1000,
              color: "#4f46e5",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            🌐 Check yours at
            <span
              style={{
                background: "#7c3aed",
                color: "#fff",
                padding: "14px 24px",
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
            fontWeight: 900,
          }}
        >
          ✨ Would you send this? ToneCheck helps you send messages you’ll feel good about. 💜
        </div>
      </div>
    </div>
  );
}