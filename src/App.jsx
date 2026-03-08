import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: error.message || "Request failed",
      });
    } finally {
      setLoading(false);
    }
  }

  function setExample(text) {
    setMessage(text);
  }

  function getToneLabel() {
    const tone = result?.tone;
    if (tone) return tone;

    const score = Number(result?.risk_score ?? 0);
    if (score >= 70) return "Aggressive";
    if (score >= 40) return "Tense";
    return "Neutral";
  }

  function getToneEmoji() {
    const tone = getToneLabel().toLowerCase();
    if (tone.includes("aggressive")) return "😠";
    if (tone.includes("tense")) return "😬";
    if (tone.includes("neutral")) return "😌";
    if (tone.includes("friendly")) return "🙂";
    return "💬";
  }

  function getRiskBarWidth() {
    const score = Number(result?.risk_score ?? 0);
    const bounded = Math.max(0, Math.min(score, 100));
    return `${bounded}%`;
  }

  function getRiskBarColor(score) {
    if (score >= 70) return "linear-gradient(90deg, #ff7b7b, #ff4d6d)";
    if (score >= 40) return "linear-gradient(90deg, #ffd166, #f4a261)";
    return "linear-gradient(90deg, #80ed99, #38bdf8)";
  }

  async function copyResult() {
    if (!result) return;

    const shareText = `ToneCheck Result

Message:
"${message}"

Tone: ${getToneLabel()}
Risk Score: ${result.risk_score ?? ""}
Risk Level: ${result.risk_level ?? ""}
Confidence: ${result.confidence ?? ""}
Advisory: ${result.advisory ?? ""}

Check yours at:
https://trytonecheck.com`;

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Result copied.");
    } catch {
      alert("Could not copy result.");
    }
  }

  const rewriteSuggestion =
    result?.rewrite_suggestion ||
    result?.suggested_rewrite ||
    result?.rewrite ||
    result?.rewritten_text ||
    null;

  const riskScore = Number(result?.risk_score ?? 0);

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #6d28d9 0%, #1e1b4b 35%, #0f172a 100%)",
    padding: "40px 16px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const containerStyle = {
    maxWidth: "960px",
    margin: "0 auto",
  };

  const heroCardStyle = {
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "28px",
    padding: "32px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  };

  const chipStyle = {
    border: "none",
    borderRadius: "999px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
    color: "#1f2937",
    background: "linear-gradient(135deg, #ffffff, #e9d5ff)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  };

  const primaryButtonStyle = {
    padding: "16px 24px",
    borderRadius: "14px",
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
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 14px 32px rgba(15,23,42,0.12)",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
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
              fontSize: "60px",
              lineHeight: 1,
              margin: "0 0 14px 0",
              color: "#ffffff",
              letterSpacing: "-1.5px",
            }}
          >
            💬 ToneCheck
          </h1>

          <p
            style={{
              margin: "0 0 28px 0",
              color: "#e9d5ff",
              fontSize: "20px",
              lineHeight: 1.5,
              maxWidth: "700px",
            }}
          >
            Check how your message may sound, spot communication risk, and get a better rewrite before you hit send.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px",
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
              minHeight: "220px",
              padding: "22px",
              fontSize: "22px",
              lineHeight: 1.6,
              borderRadius: "22px",
              background: "rgba(255,255,255,0.92)",
              color: "#111827",
              border: "2px solid rgba(255,255,255,0.16)",
              boxSizing: "border-box",
              outline: "none",
              resize: "vertical",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)",
            }}
          />

          <div
            style={{
              marginTop: "20px",
              display: "flex",
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
                opacity: loading || !message.trim() ? 0.7 : 1,
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
              marginTop: "26px",
              display: "grid",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
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
                    fontSize: "30px",
                    fontWeight: 900,
                    color: "#111827",
                  }}
                >
                  {getToneEmoji()} {getToneLabel()}
                </div>
              </div>

              <div style={resultCardStyle}>
                <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                  Risk Score
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "36px",
                    fontWeight: 900,
                    color: "#7c3aed",
                  }}
                >
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
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "28px",
                    fontWeight: 900,
                    color: "#111827",
                  }}
                >
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
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#374151",
                  marginBottom: "10px",
                }}
              >
                Regret Risk Meter
              </div>

              <div
                style={{
                  width: "100%",
                  height: "18px",
                  background: "#e5e7eb",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: getRiskBarWidth(),
                    height: "100%",
                    background: getRiskBarColor(riskScore),
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#4b5563",
                }}
              >
                {result.risk_score}/100
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
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "30px",
                        fontWeight: 900,
                        color: "#0f766e",
                      }}
                    >
                      {result.reply_likelihood}%
                    </div>
                  </div>
                )}

                {result.regret_risk !== undefined && (
                  <div style={resultCardStyle}>
                    <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                      Regret Risk
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "30px",
                        fontWeight: 900,
                        color: "#dc2626",
                      }}
                    >
                      {result.regret_risk}%
                    </div>
                  </div>
                )}
              </div>
            )}

            {result.advisory && (
              <div style={resultCardStyle}>
                <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 700 }}>
                  Advisory
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    lineHeight: 1.7,
                    fontSize: "18px",
                    color: "#111827",
                  }}
                >
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
                <div
                  style={{
                    marginTop: "12px",
                    lineHeight: 1.8,
                    fontSize: "20px",
                    color: "#111827",
                    fontWeight: 600,
                  }}
                >
                  {rewriteSuggestion}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button
                onClick={copyResult}
                style={{
                  padding: "14px 20px",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                  boxShadow: "0 12px 28px rgba(37,99,235,0.28)",
                }}
              >
                Copy Result
              </button>

              <button
                onClick={() => setMessage("")}
                style={{
                  padding: "14px 20px",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "#111827",
                  background: "linear-gradient(135deg, #ffffff, #e5e7eb)",
                }}
              >
                Clear Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
