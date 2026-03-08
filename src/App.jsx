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
    if (tone.includes("neutral")) return "😐";
    if (tone.includes("friendly")) return "🙂";
    return "🧠";
  }

  function getRiskBarWidth() {
    const score = Number(result?.risk_score ?? 0);
    const bounded = Math.max(0, Math.min(score, 100));
    return `${bounded}%`;
  }

  async function copyResult() {
    if (!result) return;

    const shareText = `ToneCheck Result

Message:
"${message}"

Tone: ${getToneLabel()}
Risk Score: ${result.risk_score ?? "N/A"}
Risk Level: ${result.risk_level ?? "N/A"}
Confidence: ${result.confidence ?? "N/A"}
Advisory: ${result.advisory ?? "N/A"}

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
    null;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "48px 20px",
        maxWidth: "760px",
        margin: "0 auto",
        color: "#ffffff",
      }}
    >
      <h1 style={{ fontSize: "52px", marginBottom: "10px" }}>🧠 ToneCheck</h1>

      <p style={{ marginBottom: "22px", color: "#d6d6d6" }}>
        Check a message before you send it.
      </p>

      <div
        style={{
          marginBottom: "14px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setExample("Fine. Do whatever you want.")}>
          Passive aggressive
        </button>

        <button onClick={() => setExample("Why are you ignoring me?")}>
          Angry text
        </button>

        <button onClick={() => setExample("Send me the file ASAP.")}>
          Work message
        </button>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste your message here..."
        style={{
          width: "100%",
          height: "140px",
          padding: "14px",
          fontSize: "20px",
          borderRadius: "10px",
          background: "#3c3c3c",
          color: "#ffffff",
          border: "1px solid #777",
          boxSizing: "border-box",
        }}
      />

      <div style={{ marginTop: "18px" }}>
        <button
          onClick={analyze}
          disabled={loading || !message.trim()}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Analyzing..." : "Analyze Message"}
        </button>
      </div>

      {result?.error && (
        <div
          style={{
            marginTop: "22px",
            background: "#ffe8e8",
            color: "#a10000",
            padding: "16px",
            borderRadius: "12px",
          }}
        >
          <b>Error:</b> {result.error}
        </div>
      )}

      {result && !result.error && (
        <>
          <div
            style={{
              marginTop: "30px",
              background: "#eef2ff",
              color: "#1c1c1c",
              padding: "22px",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>Tone</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", marginTop: "8px" }}>
                  {getToneEmoji()} {getToneLabel()}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>Risk Score</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}>
                  {result.risk_score ?? "N/A"}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>Risk Level</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", marginTop: "8px" }}>
                  {result.risk_level ?? "N/A"}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>Confidence</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", marginTop: "8px" }}>
                  {result.confidence ?? "N/A"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "22px" }}>
              <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
                Regret Risk Meter
              </div>

              <div
                style={{
                  width: "100%",
                  height: "14px",
                  background: "#d7ddf5",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: getRiskBarWidth(),
                    height: "100%",
                    background: "linear-gradient(90deg, #7dd3fc, #facc15, #f87171)",
                  }}
                />
              </div>

              <div style={{ marginTop: "8px", fontSize: "14px", color: "#555" }}>
                {result.risk_score ?? "N/A"} / 100
              </div>
            </div>

            <div
              style={{
                marginTop: "22px",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666" }}>Advisory</div>
              <div style={{ marginTop: "8px", lineHeight: 1.5 }}>
                {result.advisory ?? "No advisory available."}
              </div>
            </div>

            {rewriteSuggestion && (
              <div
                style={{
                  marginTop: "18px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>Suggested Rewrite</div>
                <div style={{ marginTop: "8px", lineHeight: 1.5 }}>
                  {rewriteSuggestion}
                </div>
              </div>
            )}

            <button
              onClick={copyResult}
              style={{
                marginTop: "18px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Copy Result
            </button>
          </div>

          <details style={{ marginTop: "18px", color: "#cfcfcf" }}>
            <summary>Show raw response</summary>
            <pre style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </>
      )}

      <p style={{ marginTop: "48px", fontSize: "14px", color: "#8f8f8f" }}>
        Built by MangoMind Labs
      </p>
    </div>
  );
}

export default App;
