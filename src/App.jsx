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

  async function copyResult() {
    if (!result) return;

    const shareText = `ToneCheck Result

Message:
"${message}"

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

  return (
    <div
      style={{
        fontFamily: "Arial",
        padding: "60px",
        maxWidth: "700px",
        margin: "auto",
      }}
    >
      <h1>🧠 ToneCheck</h1>

      <p>Check a message before you send it.</p>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setExample("Fine. Do whatever you want.")}>
          Passive aggressive
        </button>

        <button
          onClick={() => setExample("Why are you ignoring me?")}
          style={{ marginLeft: "10px" }}
        >
          Angry text
        </button>

        <button
          onClick={() => setExample("Send me the file ASAP.")}
          style={{ marginLeft: "10px" }}
        >
          Work message
        </button>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste your message here..."
        style={{ width: "100%", height: "120px", padding: "10px", fontSize: "16px" }}
      />

      <br />
      <br />

      <button onClick={analyze} disabled={loading || !message.trim()}>
        {loading ? "Analyzing..." : "Analyze Message"}
      </button>

      {result?.error && (
        <div
          style={{
            marginTop: "20px",
            background: "#ffe8e8",
            padding: "16px",
            borderRadius: "10px",
            color: "#a00000",
          }}
        >
          <b>Error:</b> {result.error}
        </div>
      )}

      {result && !result.error && (
        <div
          style={{
            marginTop: "30px",
            background: "#f3f6ff",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <p><b>Tone:</b> {result.tone ?? "N/A"}</p>
          <p><b>Risk Score:</b> {result.risk_score ?? "N/A"}</p>
          <p><b>Risk Level:</b> {result.risk_level ?? "N/A"}</p>
          <p><b>Confidence:</b> {result.confidence ?? "N/A"}</p>
          <p><b>Advisory:</b> {result.advisory ?? "N/A"}</p>

          <button
            onClick={copyResult}
            style={{
              marginTop: "12px",
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Copy Result
          </button>
        </div>
      )}

      <pre style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}>
        {JSON.stringify(result, null, 2)}
      </pre>

      <p style={{ marginTop: "50px", fontSize: "14px", color: "#888" }}>
        Built by MangoMind Labs
      </p>
    </div>
  );
}

export default App;
