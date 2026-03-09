import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

function getManipulationLabel(signal) {
  const map = {
    guilt_pressure: "Guilt pressure",
    emotional_leverage: "Emotional leverage",
    blame_shifting: "Blame shifting",
    gaslighting_signal: "Gaslighting cues",
    subtle_control: "Subtle control",
    forced_reassurance: "Forced reassurance",
    emotional_dependency: "Emotional dependency",
    moral_pressure: "Moral pressure",
    control_disguised_as_care: "Control disguised as care",
    none: "None detected",
  };

  return map[signal] || signal || "None detected";
}

function getRiskBand(score) {
  const s = Number(score ?? 0);
  if (s >= 70) return "High";
  if (s >= 40) return "Medium";
  if (s > 0) return "Low";
  return "None";
}

async function analyze() {
  try {
    setLoading(true);
    setResult(null);

    const response = await fetch(
      "https://communication-intelligence-api.onrender.com/communication-intelligence/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "test-default-key",
        },
        body: JSON.stringify({
          message_text: message,
        }),
      }
    );

    const rawText = await response.text();

    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data?.detail || "Something went wrong. Please try again.");
    }

    setResult(data);
  } catch (error) {
    console.error("Analyze failed:", error);
    setResult({
      error: "Something went wrong while analyzing the message. Please try again.",
    });
  } finally {
    setLoading(false);
  }
}
  function setExample(text) {
    setMessage(text);
  }

 function getToneLabel() {
  if (result?.tone) return result.tone;
  if (result?.label) return result.label;

  const score = Number(result?.risk_score ?? 0);
  if (score >= 85) return "Threatening";
  if (score >= 70) return "Aggressive";
  if (score >= 40) return "Tense";
  return "Neutral";
}

function getToneEmoji() {
  const tone = getToneLabel().toLowerCase();

  if (tone.includes("threat")) return "🚨";
  if (tone.includes("passive")) return "😒";
  if (tone.includes("aggressive")) return "😠";
  if (tone.includes("tense")) return "😬";
  if (tone.includes("neutral")) return "🙂";
  if (tone.includes("friendly")) return "😊";

  return "💬";
}

function getToneAnimation() {
  const tone = getToneLabel().toLowerCase();

  if (tone.includes("threat")) return "emoji-shake";
  if (tone.includes("aggressive")) return "emoji-pulse";
  if (tone.includes("tense")) return "emoji-wiggle";
  if (tone.includes("passive")) return "emoji-slow-bounce";
  return "emoji-float";
}

  function getMeterWidth(score) {
    const bounded = Math.max(0, Math.min(Number(score ?? 0), 100));
    return `${bounded}%`;
  }

  function getMeterColor(score) {
    const s = Number(score ?? 0);
    if (s >= 70) return "linear-gradient(90deg,#ef4444,#dc2626)";
    if (s >= 40) return "linear-gradient(90deg,#f59e0b,#f97316)";
    return "linear-gradient(90deg,#22c55e,#06b6d4)";
  }

  function buildShareText() {
    return `ToneCheck Result

Message:
"${message}"

Tone: ${getToneLabel()}
Risk Score: ${result?.risk_score ?? ""}
Risk Level: ${result?.risk_level ?? ""}
Regret Risk: ${result?.regret_risk ?? ""}
Reply Likelihood: ${result?.reply_likelihood ?? ""}
Advisory: ${result?.advisory ?? ""}

Check yours at:
https://trytonecheck.com`;
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(buildShareText());
      alert("Result copied.");
    } catch {
      alert("Could not copy result.");
    }
  }

  function openShare(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function shareWhatsApp() {
    openShare(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`);
  }

  function shareFacebook() {
    openShare(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        "https://trytonecheck.com"
      )}&quote=${encodeURIComponent(buildShareText())}`
    );
  }

  function shareX() {
    openShare(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`
    );
  }

  function shareLinkedIn() {
    openShare(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        "https://trytonecheck.com"
      )}`
    );
  }

  const rewriteSuggestion =
    result?.rewrite_suggestion ||
    result?.suggested_rewrite ||
    result?.rewrite ||
    result?.rewritten_text ||
    null;

  const regretRisk = Number(result?.regret_risk ?? 0);

  const pageStyle = {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at top left, #7c3aed 0%, #312e81 35%, #0f172a 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "32px 20px 56px 20px",
    boxSizing: "border-box",
  };

  const shellStyle = {
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
  };

  const heroCardStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "30px",
    padding: "38px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
    textAlign: "center",
    boxSizing: "border-box",
  };

  const chipStyle = {
    border: "none",
    borderRadius: "999px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    color: "#1f2937",
    background: "linear-gradient(135deg, #ffffff, #ede9fe)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.14)",
  };

  const primaryButtonStyle = {
    padding: "16px 26px",
    borderRadius: "16px",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "17px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    boxShadow: "0 12px 30px rgba(139,92,246,0.35)",
  };

  const resultCardStyle = {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 14px 32px rgba(15,23,42,0.12)",
  };

  const socialBtnStyle = {
    width: "54px",
    height: "54px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "24px",
    fontWeight: 800,
    color: "#111827",
    background: "linear-gradient(135deg, #ffffff, #e5e7eb)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  };

  const copyBtnStyle = {
    padding: "14px 18px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "15px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #2563eb, #06b6d4)",
    boxShadow: "0 12px 28px rgba(37,99,235,0.28)",
  };

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroCardStyle}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "999px",
              padding: "10px 16px",
              color: "#f8fafc",
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            <span>✨</span>
            <span>Think before you send</span>
          </div>

          <h1
            style={{
              fontSize: "64px",
              lineHeight: 1,
              margin: "0 0 14px 0",
              color: "#ffffff",
              letterSpacing: "-1.8px",
            }}
          >
            ✨💬 ToneCheck
          </h1>

          <p
            style={{
              margin: "0 auto 28px auto",
              color: "#e9d5ff",
              fontSize: "21px",
              lineHeight: 1.6,
              maxWidth: "820px",
            }}
          >
            Check how your message may sound, spot communication risk, and get a better rewrite before you hit send.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <button style={chipStyle} onClick={() => setExample("Fine. Do whatever you want.")}>
              Passive aggressive
            </button>

            <button style={chipStyle} onClick={() => setExample("Why are you ignoring me?")}>
              Angry text
            </button>

            <button style={chipStyle} onClick={() => setExample("Send me the file ASAP.")}>
              Work message
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste your message, WhatsApp text, or email here..."
            style={{
              width: "100%",
              minHeight: "300px",
              padding: "24px",
              fontSize: "26px",
              lineHeight: 1.6,
              borderRadius: "24px",
              background: "rgba(255,255,255,0.95)",
              color: "#111827",
              border: "2px solid rgba(255,255,255,0.18)",
              boxSizing: "border-box",
              outline: "none",
              resize: "vertical",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.06)",
            }}
          />

          <div
            style={{
              marginTop: "22px",
              display: "flex",
              justifyContent: "center",
              gap: "14px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={analyze}
              disabled={loading || !message.trim()}
              style={{
                ...primaryButtonStyle,
                opacity: loading || !message.trim() ? 0.75 : 1,
              }}
            >
              {loading ? "Analyzing..." : "Analyze Message"}
            </button>

            <span style={{ color: "#ddd6fe", fontSize: "15px", fontWeight: 600 }}>
              Private by default. Built by MangoMind Labs.
            </span>
          </div>
        </div>

        {result?.error && (
          <div
            style={{
              marginTop: "24px",
              background: "#fff1f2",
              color: "#be123c",
              padding: "18px 20px",
              borderRadius: "18px",
              fontWeight: 700,
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            }}
          >
            Error: {result.error}
          </div>
        )}

        {result && !result.error && (
          <div
            style={{
              marginTop: "30px",
              display: "grid",
              gap: "22px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >
              <div style={resultCardStyle}>
                <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                  Tone
                </div>
                <div
                  style={{
                  marginTop: "10px",
                  fontSize: "32px",
                  fontWeight: 900,
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span 
                   className={getToneAnimation()}
                   style={{ fontSize: "40px", lineHeight: 1 }}
                  >
                  {getToneEmoji()}
                </span>
                <span>{getToneLabel()}</span>
              </div>
              </div>

              <div style={resultCardStyle}>
                <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                  Risk Score
                </div>
                <div style={{ marginTop: "10px", fontSize: "38px", fontWeight: 900, color: "#7c3aed" }}>
                  {result.risk_score}
                </div>
              </div>

              <div style={resultCardStyle}>
                <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                  Risk Level
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "28px",
                    fontWeight: 900,
                    color: "#111827",
                    textTransform: "capitalize",
                  }}
                >
                  {result.risk_level}
                </div>
              </div>

              <div style={resultCardStyle}>
                <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                  Confidence
                </div>
                <div style={{ marginTop: "10px", fontSize: "28px", fontWeight: 900, color: "#111827" }}>
                  {result.confidence}
                </div>
              </div>
            </div>

            <div
              style={{
                ...resultCardStyle,
                background: "linear-gradient(135deg, #ffffff, #f5f3ff)",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#374151", marginBottom: "10px" }}>
                Regret Risk Meter
              </div>

              <div
                style={{
                  width: "100%",
                  height: "28px",
                  background: "#d1d5db",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: getMeterWidth(regretRisk),
                    height: "100%",
                    background: getMeterColor(regretRisk),
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              <div style={{ marginTop: "10px", fontSize: "16px", fontWeight: 700, color: "#4b5563" }}>
                {result.regret_risk}% regret risk
              </div>
            </div>

            {(result.reply_likelihood !== undefined || result.regret_risk !== undefined) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                {result.reply_likelihood !== undefined && (
                  <div style={resultCardStyle}>
                    <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                      Reply Likelihood
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "30px", fontWeight: 900, color: "#0f766e" }}>
                      {result.reply_likelihood}%
                    </div>
                  </div>
                )}

                {result.regret_risk !== undefined && (
                  <div style={resultCardStyle}>
                    <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                      Regret Risk
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "30px", fontWeight: 900, color: "#dc2626" }}>
                      {result.regret_risk}%
                    </div>
                  </div>
                )}
              </div>
            )}

            {(result.primary_manipulation_signal || result.manipulation_risk !== undefined) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "18px",
                  }}
                >
                  <div style={resultCardStyle}>
                    <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                      Primary Hidden Signal
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "26px", fontWeight: 900, color: "#111827" }}>
                      {getManipulationLabel(result.primary_manipulation_signal)}
                    </div>
                  </div>
              
                  <div style={resultCardStyle}>
                    <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                      Manipulation Risk
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "30px", fontWeight: 900, color: "#7c3aed" }}>
                      {result.manipulation_risk ?? 0}%
                    </div>
                    <div style={{ marginTop: "6px", fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                      {getRiskBand(result.manipulation_risk)}
                    </div>
                  </div>
                </div>
              )}

            {Array.isArray(result.top_manipulation_signals) && result.top_manipulation_signals.length > 0 && (
                <div style={resultCardStyle}>
                  <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                    Detected Hidden Signals
                  </div>
              
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    {result.top_manipulation_signals.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "999px",
                          background: "#f5f3ff",
                          color: "#5b21b6",
                          fontWeight: 700,
                          fontSize: "14px",
                          border: "1px solid #ddd6fe",
                        }}
                      >
                        {getManipulationLabel(item.name)} · {item.score}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {result.advisory && (
              <div style={resultCardStyle}>
                <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                  Advisory
                </div>
                <div style={{ marginTop: "10px", lineHeight: 1.7, fontSize: "18px", color: "#111827" }}>
                  {result.advisory}
                </div>
              </div>
            )}

            {rewriteSuggestion && (
              <div
                style={{
                  ...resultCardStyle,
                  background: "linear-gradient(135deg, #fff7ed, #ffffff)",
                  border: "1px solid #fed7aa",
                }}
              >
                <div style={{ fontSize: "14px", color: "#9a3412", fontWeight: 800 }}>
                  Suggested Rewrite
                </div>
                <div style={{ marginTop: "12px", lineHeight: 1.8, fontSize: "20px", color: "#111827", fontWeight: 600 }}>
                  {rewriteSuggestion}
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <button onClick={shareWhatsApp} style={socialBtnStyle} title="Share on WhatsApp">
                📱
              </button>
              <button onClick={shareFacebook} style={socialBtnStyle} title="Share on Facebook">
                f
              </button>
              <button onClick={shareX} style={socialBtnStyle} title="Share on X">
                𝕏
              </button>
              <button onClick={shareLinkedIn} style={socialBtnStyle} title="Share on LinkedIn">
                in
              </button>
              <button onClick={copyResult} style={copyBtnStyle}>
                Copy Result
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
