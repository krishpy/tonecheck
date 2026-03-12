import { useMemo, useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copyState, setCopyState] = useState("");

  function getHiddenSignalLabel(signal) {
    const map = {
      threat: "Threat",
      threat_signal: "Threat",
      hostile_command: "Hostile command",
      hostile_command_signal: "Hostile command",
      profanity: "Profanity",
      profanity_signal: "Profanity",
      insult: "Insult",
      insult_signal: "Insult",
      pressure: "Pressure",
      pressure_signal: "Pressure",
      accusatory_pressure_signal: "Accusatory pressure",
      passive_aggression: "Passive aggression",
      passive_aggression_signal: "Passive aggression",
      guilt_pressure: "Guilt pressure",
      emotional_leverage: "Emotional leverage",
      blame_shifting: "Blame shifting",
      gaslighting_signal: "Gaslighting cues",
      subtle_control: "Subtle control",
      forced_reassurance: "Forced reassurance",
      emotional_dependency: "Emotional dependency",
      moral_pressure: "Moral pressure",
      control_disguised_as_care: "Control disguised as care",
      polite_request_signal: "Polite request",
      constructive_disagreement_signal: "Constructive disagreement",
      neutral_information: "Neutral",
      none: "None detected",
    };

    return map[signal] || signal || "None detected";
  }

  function getRiskBand(score) {
    const s = Number(score ?? 0);
    if (s >= 85) return "Severe";
    if (s >= 70) return "High";
    if (s >= 40) return "Medium";
    if (s > 0) return "Low";
    return "None";
  }

  async function analyze() {
    try {
      setLoading(true);
      setResult(null);
      setCopyState("");

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
    setCopyState("");
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
    if (tone.includes("emotionally")) return "🥺";
    if (tone.includes("constructive")) return "🤝";
    if (tone.includes("neutral")) return "🙂";
    if (tone.includes("friendly")) return "😊";
    return "💬";
  }

  function getToneAccent(score) {
    const s = Number(score ?? 0);
    if (s >= 85) return "#ef4444";
    if (s >= 70) return "#f97316";
    if (s >= 40) return "#f59e0b";
    return "#22c55e";
  }

  function getMeterWidth(score) {
    const bounded = Math.max(0, Math.min(Number(score ?? 0), 100));
    return `${bounded}%`;
  }

  function getMeterColor(score) {
    const s = Number(score ?? 0);
    if (s >= 85) return "linear-gradient(90deg,#ef4444,#b91c1c)";
    if (s >= 70) return "linear-gradient(90deg,#fb923c,#f97316)";
    if (s >= 40) return "linear-gradient(90deg,#facc15,#f59e0b)";
    return "linear-gradient(90deg,#34d399,#22c55e)";
  }

  const displayedRewrite = useMemo(() => {
    return (
      result?.rewrite_suggestion ||
      result?.suggested_rewrite ||
      result?.rewrite ||
      result?.rewritten_text ||
      ""
    );
  }, [result]);

  const primaryHiddenSignalLabel = getHiddenSignalLabel(
    result?.primary_hidden_signal || result?.primary_manipulation_signal
  );

  function buildShareText() {
    return `✨ ToneCheck Result

📝 Message:
"${message}"

${getToneEmoji()} Tone: ${getToneLabel()}
⚠️ Risk Score: ${result?.risk_score ?? ""}
📊 Risk Level: ${result?.risk_level ?? ""}
💭 Regret Risk: ${result?.regret_risk ?? ""}
📬 Reply Likelihood: ${result?.reply_likelihood ?? ""}
🕵️ Hidden Signal: ${primaryHiddenSignalLabel}
💡 Advisory: ${result?.advisory ?? ""}${
      displayedRewrite ? `

✍️ Suggested Rewrite:
${displayedRewrite}` : ""
    }

Check yours at:
https://trytonecheck.com`;
  }

  function buildShareHtml() {
    return `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;line-height:1.6;color:#111827;">
        <h2 style="margin:0 0 12px 0;">✨ ToneCheck Result</h2>
        <p style="margin:0 0 12px 0;"><strong>📝 Message:</strong><br/>"${escapeHtml(message)}"</p>
        <p style="margin:0 0 8px 0;"><strong>${getToneEmoji()} Tone:</strong> ${escapeHtml(getToneLabel())}</p>
        <p style="margin:0 0 8px 0;"><strong>⚠️ Risk Score:</strong> ${result?.risk_score ?? ""}</p>
        <p style="margin:0 0 8px 0;"><strong>📊 Risk Level:</strong> ${escapeHtml(result?.risk_level ?? "")}</p>
        <p style="margin:0 0 8px 0;"><strong>💭 Regret Risk:</strong> ${result?.regret_risk ?? ""}</p>
        <p style="margin:0 0 8px 0;"><strong>📬 Reply Likelihood:</strong> ${result?.reply_likelihood ?? ""}</p>
        <p style="margin:0 0 8px 0;"><strong>🕵️ Hidden Signal:</strong> ${escapeHtml(primaryHiddenSignalLabel)}</p>
        <p style="margin:0 0 12px 0;"><strong>💡 Advisory:</strong> ${escapeHtml(result?.advisory ?? "")}</p>
        ${
          displayedRewrite
            ? `<p style="margin:0 0 12px 0;"><strong>✍️ Suggested Rewrite:</strong><br/>${escapeHtml(displayedRewrite)}</p>`
            : ""
        }
        <p style="margin:0;"><strong>🔗 Check yours at:</strong> https://trytonecheck.com</p>
      </div>
    `;
  }

  async function copyResult() {
    try {
      const text = buildShareText();
      const html = buildShareHtml();

      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(text);
      }

      setCopyState("Copied");
      setTimeout(() => setCopyState(""), 1800);
    } catch {
      setCopyState("Copy failed");
      setTimeout(() => setCopyState(""), 1800);
    }
  }

  async function copyRewriteOnly() {
    if (!displayedRewrite) return;
    try {
      await navigator.clipboard.writeText(displayedRewrite);
      setCopyState("Rewrite copied");
      setTimeout(() => setCopyState(""), 1800);
    } catch {
      setCopyState("Copy failed");
      setTimeout(() => setCopyState(""), 1800);
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

  const regretRisk = Number(result?.regret_risk ?? 0);
  const riskScore = Number(result?.risk_score ?? 0);
  const replyLikelihood = Number(result?.reply_likelihood ?? 0);

  const pageStyle = {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.9) 0%, rgba(244,247,255,1) 26%, rgba(234,240,255,1) 45%, rgba(224,231,255,1) 70%, rgba(245,247,250,1) 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "28px 18px 64px",
    boxSizing: "border-box",
    color: "#0f172a",
  };

  const shellStyle = {
    width: "100%",
    maxWidth: "1240px",
    margin: "0 auto",
  };

  const heroCardStyle = {
    position: "relative",
    overflow: "hidden",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    border: "1px solid rgba(255,255,255,0.68)",
    borderRadius: "34px",
    padding: "34px",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06), 0 30px 80px rgba(99,102,241,0.08)",
  };

  const glassOrb1 = {
    position: "absolute",
    top: "-60px",
    right: "-40px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(99,102,241,0.18), rgba(99,102,241,0))",
    pointerEvents: "none",
  };

  const glassOrb2 = {
    position: "absolute",
    bottom: "-90px",
    left: "-60px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(236,72,153,0.14), rgba(236,72,153,0))",
    pointerEvents: "none",
  };

  const chipStyle = {
    border: "1px solid rgba(15,23,42,0.06)",
    borderRadius: "999px",
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "14px",
    color: "#111827",
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 18px rgba(15,23,42,0.05)",
    transition: "all 0.2s ease",
  };

  const actionButtonStyle = {
    padding: "15px 22px",
    borderRadius: "18px",
    border: "1px solid rgba(15,23,42,0.06)",
    cursor: "pointer",
    fontWeight: 750,
    fontSize: "15px",
    background: "rgba(255,255,255,0.78)",
    color: "#111827",
    boxShadow: "0 8px 28px rgba(15,23,42,0.06)",
  };

  const primaryButtonStyle = {
    padding: "16px 24px",
    borderRadius: "18px",
    border: "1px solid rgba(79,70,229,0.18)",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "16px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #111827, #4f46e5 55%, #7c3aed)",
    boxShadow: "0 14px 32px rgba(79,70,229,0.22)",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.74)",
    borderRadius: "26px",
    padding: "22px",
    boxShadow: "0 10px 26px rgba(15,23,42,0.05)",
  };

  const metricValueStyle = {
    marginTop: "10px",
    fontSize: "34px",
    fontWeight: 850,
    letterSpacing: "-0.04em",
    color: "#111827",
  };

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroCardStyle}>
          <div style={glassOrb1} />
          <div style={glassOrb2} />

          <div
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(15,23,42,0.06)",
              borderRadius: "999px",
              padding: "10px 16px",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "18px",
            }}
          >
            <span>✨</span>
            <span>Think before you send</span>
          </div>

          <div style={{ position: "relative" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "60px",
                lineHeight: 1,
                letterSpacing: "-0.06em",
                fontWeight: 850,
                color: "#0f172a",
              }}
            >
              ToneCheck
            </h1>

            <p
              style={{
                margin: "16px 0 0 0",
                maxWidth: "820px",
                color: "#475569",
                fontSize: "19px",
                lineHeight: 1.7,
              }}
            >
              Check how your message may sound, detect hidden communication risk,
              and get a calmer rewrite before you hit send.
            </p>
          </div>

          <div
            style={{
              marginTop: "22px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button style={chipStyle} onClick={() => setExample("Fine. Do whatever you want.")}>
              😒 Passive aggressive
            </button>
            <button style={chipStyle} onClick={() => setExample("Why are you ignoring me?")}>
              😠 Angry text
            </button>
            <button style={chipStyle} onClick={() => setExample("Send me the file ASAP.")}>
              🧾 Work message
            </button>
            <button style={chipStyle} onClick={() => setExample("I disagree, but let’s discuss calmly.")}>
              🤝 Constructive
            </button>
          </div>

          <div style={{ marginTop: "24px", position: "relative" }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste your message, WhatsApp text, or email here..."
              style={{
                width: "100%",
                minHeight: "240px",
                padding: "24px 24px 64px",
                fontSize: "24px",
                lineHeight: 1.6,
                borderRadius: "28px",
                background: "rgba(255,255,255,0.88)",
                color: "#0f172a",
                border: "1px solid rgba(15,23,42,0.08)",
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 28px rgba(15,23,42,0.05)",
              }}
            />

            <div
              style={{
                position: "absolute",
                right: "16px",
                bottom: "16px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  setMessage("");
                  setResult(null);
                  setCopyState("");
                }}
                style={actionButtonStyle}
              >
                Clear
              </button>

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
            </div>
          </div>

          <div
            style={{
              marginTop: "14px",
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            <span>Private by default</span>
            <span>Built by MangoMind Labs</span>
          </div>
        </div>

        {result?.error && (
          <div
            style={{
              marginTop: "22px",
              ...cardStyle,
              background: "rgba(254,242,242,0.9)",
              color: "#b91c1c",
              fontWeight: 700,
            }}
          >
            Error: {result.error}
          </div>
        )}

        {result && !result.error && (
          <div style={{ marginTop: "24px", display: "grid", gap: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
                gap: "20px",
              }}
            >
              <div style={{ ...cardStyle, padding: "26px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 800, letterSpacing: "0.08em" }}>
                      TONE SUMMARY
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "18px",
                          display: "grid",
                          placeItems: "center",
                          background: "rgba(255,255,255,0.88)",
                          border: "1px solid rgba(15,23,42,0.06)",
                          fontSize: "28px",
                        }}
                      >
                        {getToneEmoji()}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "34px",
                            fontWeight: 850,
                            letterSpacing: "-0.04em",
                            color: "#111827",
                          }}
                        >
                          {getToneLabel()}
                        </div>
                        <div style={{ marginTop: "4px", color: "#64748b", fontSize: "15px" }}>
                          {result?.advisory || "Analysis complete"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      minWidth: "180px",
                      padding: "14px 16px",
                      borderRadius: "22px",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))",
                      border: "1px solid rgba(15,23,42,0.06)",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", letterSpacing: "0.08em" }}>
                      PRIMARY HIDDEN SIGNAL
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "19px", fontWeight: 750, color: "#111827" }}>
                      {primaryHiddenSignalLabel}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "22px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      color: "#475569",
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  >
                    <span>Communication Risk</span>
                    <span>{riskScore}/100</span>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "16px",
                      background: "rgba(226,232,240,0.72)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: getMeterWidth(riskScore),
                        height: "100%",
                        background: getMeterColor(riskScore),
                        boxShadow: `0 0 22px ${getToneAccent(riskScore)}55`,
                        transition: "width 0.35s ease",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <MiniTag label={`Risk Level: ${result?.risk_level || getRiskBand(riskScore)}`} />
                    <MiniTag label={`Reply: ${replyLikelihood}%`} />
                    <MiniTag label={`Regret: ${regretRisk}%`} />
                    <MiniTag label={`Confidence: ${result?.confidence ?? "-"}`} />
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: "24px" }}>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 800, letterSpacing: "0.08em" }}>
                  QUICK STATS
                </div>

                <div style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
                  <MetricCard
                    label="Risk Score"
                    value={result?.risk_score}
                    accent="#7c3aed"
                  />
                  <MetricCard
                    label="Reply Likelihood"
                    value={`${result?.reply_likelihood ?? 0}%`}
                    accent="#0f766e"
                  />
                  <MetricCard
                    label="Regret Risk"
                    value={`${result?.regret_risk ?? 0}%`}
                    accent="#dc2626"
                  />
                  <MetricCard
                    label="Manipulation Risk"
                    value={`${result?.manipulation_risk ?? 0}%`}
                    accent="#4f46e5"
                  />
                </div>
              </div>
            </div>

            {Array.isArray(result.top_manipulation_signals) && result.top_manipulation_signals.length > 0 && (
              <div style={cardStyle}>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 800, letterSpacing: "0.08em" }}>
                  DETECTED SIGNALS
                </div>

                <div
                  style={{
                    marginTop: "14px",
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
                        background: "rgba(99,102,241,0.08)",
                        color: "#4338ca",
                        fontWeight: 700,
                        fontSize: "14px",
                        border: "1px solid rgba(99,102,241,0.12)",
                      }}
                    >
                      {getHiddenSignalLabel(item.name)} · {item.score}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {displayedRewrite && (
              <div
                style={{
                  ...cardStyle,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,247,237,0.92))",
                  border: "1px solid rgba(251,146,60,0.18)",
                  padding: "26px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "14px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", color: "#9a3412", fontWeight: 800, letterSpacing: "0.08em" }}>
                      SUGGESTED REWRITE
                    </div>
                    <div style={{ marginTop: "6px", color: "#7c2d12", fontSize: "14px" }}>
                      A calmer version that keeps the core intent.
                    </div>
                  </div>

                  <button onClick={copyRewriteOnly} style={actionButtonStyle}>
                    ✍️ Copy Rewrite
                  </button>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    fontSize: "22px",
                    lineHeight: 1.8,
                    color: "#111827",
                    fontWeight: 650,
                  }}
                >
                  {displayedRewrite}
                </div>
              </div>
            )}

            {result.advisory && (
              <div style={cardStyle}>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 800, letterSpacing: "0.08em" }}>
                  ADVISORY
                </div>
                <div style={{ marginTop: "12px", lineHeight: 1.8, fontSize: "18px", color: "#111827" }}>
                  {result.advisory}
                </div>
              </div>
            )}

            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "14px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 800, letterSpacing: "0.08em" }}>
                    SHARE RESULT
                  </div>
                  <div style={{ marginTop: "6px", color: "#64748b", fontSize: "14px" }}>
                    Copy includes tone, risk, hidden signal, advisory, and suggested rewrite.
                  </div>
                </div>

                <div
                  style={{
                    color: copyState ? "#2563eb" : "#64748b",
                    fontWeight: 700,
                    fontSize: "14px",
                    minHeight: "20px",
                  }}
                >
                  {copyState}
                </div>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <ShareButton onClick={shareWhatsApp} label="WhatsApp" icon="📱" />
                <ShareButton onClick={shareFacebook} label="Facebook" icon="f" />
                <ShareButton onClick={shareX} label="X" icon="𝕏" />
                <ShareButton onClick={shareLinkedIn} label="LinkedIn" icon="in" />
                <button onClick={copyResult} style={primaryButtonStyle}>
                  📋 Copy Full Result
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: "8px",
          fontSize: "28px",
          fontWeight: 850,
          letterSpacing: "-0.04em",
          color: accent,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniTag({ label }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(15,23,42,0.06)",
        color: "#334155",
        fontWeight: 700,
        fontSize: "13px",
      }}
    >
      {label}
    </div>
  );
}

function ShareButton({ onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        minWidth: "112px",
        height: "52px",
        border: "1px solid rgba(15,23,42,0.06)",
        borderRadius: "18px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 800,
        color: "#111827",
        background: "rgba(255,255,255,0.82)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <span style={{ marginRight: "8px" }}>{icon}</span>
      {label}
    </button>
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default App;
