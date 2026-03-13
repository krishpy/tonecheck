import React, { useMemo, useState } from "react";

     const STAT_EXPLANATIONS = {
  risk: "How risky your message sounds. Higher means it could upset someone or escalate the conversation.",
  reply: "How likely the other person is to respond positively.",
  regret: "Chance you may regret sending this later.",
  manipulation: "Whether the message may pressure or guilt the other person.",
};

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

  function getToneTheme() {
    const tone = getToneLabel().toLowerCase();
    const score = Number(result?.risk_score ?? 0);

    if (tone.includes("threat") || score >= 85) {
      return {
        bg: "linear-gradient(135deg, rgba(254,226,226,0.92), rgba(254,242,242,0.88))",
        border: "rgba(239,68,68,0.30)",
        glow: "rgba(239,68,68,0.25)",
        chipBg: "rgba(254,226,226,0.85)",
        chipText: "#b91c1c",
        iconBg: "linear-gradient(135deg, #ef4444, #b91c1c)",
        animation: "tc-threat",
        emoji: "🚨",
      };
    }

    if (tone.includes("aggressive") || score >= 70) {
      return {
        bg: "linear-gradient(135deg, rgba(255,237,213,0.94), rgba(255,247,237,0.88))",
        border: "rgba(249,115,22,0.28)",
        glow: "rgba(249,115,22,0.22)",
        chipBg: "rgba(255,237,213,0.85)",
        chipText: "#c2410c",
        iconBg: "linear-gradient(135deg, #f97316, #ea580c)",
        animation: "tc-aggressive",
        emoji: "😠",
      };
    }

    if (tone.includes("tense") || score >= 40) {
      return {
        bg: "linear-gradient(135deg, rgba(254,249,195,0.92), rgba(255,251,235,0.88))",
        border: "rgba(245,158,11,0.28)",
        glow: "rgba(245,158,11,0.20)",
        chipBg: "rgba(254,249,195,0.85)",
        chipText: "#a16207",
        iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
        animation: "tc-tense",
        emoji: "😬",
      };
    }

    if (tone.includes("passive")) {
      return {
        bg: "linear-gradient(135deg, rgba(237,233,254,0.92), rgba(250,245,255,0.88))",
        border: "rgba(139,92,246,0.24)",
        glow: "rgba(139,92,246,0.18)",
        chipBg: "rgba(237,233,254,0.85)",
        chipText: "#6d28d9",
        iconBg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        animation: "tc-passive",
        emoji: "😒",
      };
    }

    return {
      bg: "linear-gradient(135deg, rgba(236,253,245,0.92), rgba(240,253,250,0.88))",
      border: "rgba(34,197,94,0.22)",
      glow: "rgba(34,197,94,0.16)",
      chipBg: "rgba(220,252,231,0.88)",
      chipText: "#15803d",
      iconBg: "linear-gradient(135deg, #22c55e, #14b8a6)",
      animation: "tc-neutral",
      emoji: "🙂",
    };
  }

  function getMeterWidth(score) {
    const bounded = Math.max(0, Math.min(Number(score ?? 0), 100));
    return `${bounded}%`;
  }

  function getMeterColor(score) {
    const s = Number(score ?? 0);
    if (s >= 85) return "linear-gradient(90deg,#ef4444,#b91c1c,#991b1b)";
    if (s >= 70) return "linear-gradient(90deg,#fb923c,#f97316,#ea580c)";
    if (s >= 40) return "linear-gradient(90deg,#fde047,#f59e0b,#d97706)";
    return "linear-gradient(90deg,#34d399,#22c55e,#14b8a6)";
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
      displayedRewrite
        ? `

✍️ Suggested Rewrite:
${displayedRewrite}`
        : ""
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
  const toneTheme = getToneTheme();

  const pageStyle = {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at 10% 0%, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0.00) 18%), radial-gradient(circle at 100% 0%, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0.00) 22%), radial-gradient(circle at 50% 100%, rgba(56,189,248,0.10) 0%, rgba(56,189,248,0.00) 20%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 48%, #f5f3ff 100%)",
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
    background: "rgba(255,255,255,0.66)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.72)",
    borderRadius: "36px",
    padding: "36px",
    boxShadow:
      "0 14px 40px rgba(15,23,42,0.06), 0 35px 90px rgba(99,102,241,0.10), inset 0 1px 0 rgba(255,255,255,0.70)",
  };

  const glassOrb1 = {
    position: "absolute",
    top: "-90px",
    right: "-70px",
    width: "300px",
    height: "300px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(99,102,241,0.24), rgba(99,102,241,0) 70%)",
    pointerEvents: "none",
    filter: "blur(6px)",
  };

  const glassOrb2 = {
    position: "absolute",
    bottom: "-110px",
    left: "-70px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(236,72,153,0.20), rgba(236,72,153,0) 70%)",
    pointerEvents: "none",
    filter: "blur(8px)",
  };

  const glassOrb3 = {
    position: "absolute",
    top: "35%",
    left: "42%",
    transform: "translate(-50%, -50%)",
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(56,189,248,0.15), rgba(56,189,248,0) 72%)",
    pointerEvents: "none",
    filter: "blur(8px)",
  };

  const chipStyle = {
    border: "1px solid rgba(15,23,42,0.06)",
    borderRadius: "999px",
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "14px",
    color: "#111827",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 18px rgba(15,23,42,0.05)",
    transition: "all 0.2s ease",
  };

  const actionButtonStyle = {
    padding: "15px 22px",
    borderRadius: "18px",
    border: "1px solid rgba(15,23,42,0.08)",
    cursor: "pointer",
    fontWeight: 750,
    fontSize: "15px",
    background: "rgba(255,255,255,0.82)",
    color: "#111827",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  };

  const primaryButtonStyle = {
    padding: "16px 24px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.28)",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "16px",
    color: "#ffffff",
    background:
      "linear-gradient(135deg, #111827 0%, #4338ca 45%, #7c3aed 72%, #ec4899 100%)",
    boxShadow:
      "0 16px 36px rgba(79,70,229,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "28px",
    padding: "22px",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.05), 0 1px 0 rgba(255,255,255,0.6) inset",
  };

  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes tc-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }

        @keyframes tc-aggressive {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-1px); }
          40% { transform: translateX(1px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }

        @keyframes tc-threat {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(239,68,68,0.0)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 10px rgba(239,68,68,0.5)); }
        }

        @keyframes tc-tense {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }

        @keyframes tc-passive {
          0%, 100% { transform: translateY(0px); opacity: 1; }
          50% { transform: translateY(-3px); opacity: 0.9; }
        }

        @keyframes tc-neutral {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        @keyframes tc-gradient-move {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        .tc-tone-emoji {
          animation-duration: 1.8s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          will-change: transform, filter;
        }

        .tc-glow-card {
          position: relative;
          overflow: hidden;
        }

        .tc-glow-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.08), rgba(255,255,255,0.5));
          opacity: 0.45;
          pointer-events: none;
        }

        .tc-shimmer {
          background-size: 200% 200%;
          animation: tc-gradient-move 4.5s linear infinite;
        }

        .tc-chip-hover {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .tc-chip-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 22px rgba(15,23,42,0.08);
        }

        .tc-button-hover {
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .tc-button-hover:hover {
          transform: translateY(-2px);
          filter: saturate(1.05);
        }

        @media (max-width: 980px) {
          .tc-grid-main {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .tc-title {
            font-size: 52px !important;
          }

          .tc-hero {
            padding: 24px !important;
          }

          .tc-textarea {
            min-height: 220px !important;
            font-size: 20px !important;
          }
        }
      `}</style>

      <div style={shellStyle}>
        <div className="tc-hero" style={heroCardStyle}>
          <div style={glassOrb1} />
          <div style={glassOrb2} />
          <div style={glassOrb3} />

          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "74px",
                  height: "74px",
                  borderRadius: "24px",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.96), rgba(236,72,153,0.92))",
                  boxShadow:
                    "0 14px 38px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.36)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "8px",
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "1px",
                    color: "#ffffff",
                    fontWeight: 900,
                    letterSpacing: "-0.08em",
                    textShadow: "0 2px 10px rgba(0,0,0,0.16)",
                  }}
                >
                  <span style={{ fontSize: "28px", lineHeight: 1 }}>T</span>
                  <span style={{ fontSize: "30px", lineHeight: 1 }}>✓</span>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.22em",
                    color: "#6366f1",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Think Before You Send
                </div>

                <h1
                  className="tc-title tc-shimmer"
                  style={{
                    margin: 0,
                    fontSize: "76px",
                    lineHeight: 0.92,
                    letterSpacing: "-0.09em",
                    fontWeight: 950,
                    background:
                      "linear-gradient(135deg, #0f172a 0%, #312e81 30%, #7c3aed 62%, #ec4899 100%)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ToneCheck
                </h1>
              </div>
            </div>

            <p
              style={{
                margin: "10px 0 0 0",
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
            <button
              className="tc-chip-hover"
              style={{ ...chipStyle, background: "rgba(245,232,255,0.9)" }}
              onClick={() => setExample("Fine. Do whatever you want.")}
            >
              😒 Passive aggressive
            </button>
            <button
              className="tc-chip-hover"
              style={{ ...chipStyle, background: "rgba(255,237,213,0.9)" }}
              onClick={() => setExample("Why are you ignoring me?")}
            >
              😠 Angry text
            </button>
            <button
              className="tc-chip-hover"
              style={{ ...chipStyle, background: "rgba(224,242,254,0.9)" }}
              onClick={() => setExample("Send me the file ASAP.")}
            >
              🧾 Work message
            </button>
            <button
              className="tc-chip-hover"
              style={{ ...chipStyle, background: "rgba(220,252,231,0.9)" }}
              onClick={() => setExample("I disagree, but let’s discuss calmly.")}
            >
              🤝 Constructive
            </button>
          </div>

          <div style={{ marginTop: "24px", position: "relative" }}>
            <textarea
              className="tc-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste your message, WhatsApp text, or email here..."
              style={{
                width: "100%",
                minHeight: "240px",
                padding: "24px 24px 72px",
                fontSize: "24px",
                lineHeight: 1.6,
                borderRadius: "28px",
                background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86))",
                color: "#0f172a",
                border: "1px solid rgba(99,102,241,0.10)",
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.86), 0 14px 34px rgba(15,23,42,0.04)",
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
                className="tc-button-hover"
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
                className="tc-button-hover"
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
              background: "rgba(254,242,242,0.92)",
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
              className="tc-grid-main"
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
                gap: "20px",
              }}
            >
              <div
                className="tc-glow-card"
                style={{
                  ...cardStyle,
                  padding: "26px",
                  background: toneTheme.bg,
                  border: `1px solid ${toneTheme.border}`,
                  boxShadow: `0 12px 34px ${toneTheme.glow}, 0 1px 0 rgba(255,255,255,0.7) inset`,
                }}
              >
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
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                      }}
                    >
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
                          width: "62px",
                          height: "62px",
                          borderRadius: "20px",
                          display: "grid",
                          placeItems: "center",
                          background: toneTheme.iconBg,
                          border: `1px solid ${toneTheme.border}`,
                          fontSize: "30px",
                          boxShadow: `0 10px 28px ${toneTheme.glow}`,
                        }}
                      >
                        <span
                          className="tc-tone-emoji"
                          style={{ animationName: toneTheme.animation, display: "inline-block" }}
                        >
                          {toneTheme.emoji}
                        </span>
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
                      background: toneTheme.chipBg,
                      border: `1px solid ${toneTheme.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#64748b",
                        letterSpacing: "0.08em",
                      }}
                    >
                      PRIMARY HIDDEN SIGNAL
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "19px",
                        fontWeight: 750,
                        color: toneTheme.chipText,
                      }}
                    >
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
                      height: "18px",
                      background:
                        "linear-gradient(180deg, rgba(226,232,240,0.78), rgba(241,245,249,0.9))",
                      borderRadius: "999px",
                      overflow: "hidden",
                      boxShadow: "inset 0 2px 6px rgba(15,23,42,0.06)",
                    }}
                  >
                    <div
                      className="tc-shimmer"
                      style={{
                        width: getMeterWidth(riskScore),
                        height: "100%",
                        background: getMeterColor(riskScore),
                        boxShadow: `0 0 26px ${getToneAccent(riskScore)}66`,
                        transition: "width 0.4s ease",
                        borderRadius: "999px",
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
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...cardStyle,
                  padding: "24px",
                  border: "1px solid rgba(56,189,248,0.14)",
                  boxShadow:
                    "0 12px 34px rgba(56,189,248,0.07), 0 1px 0 rgba(255,255,255,0.7) inset",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  QUICK STATS
                </div>

                <div style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
                 <MetricCard
  label="⚠️ Risk Score"
  value={result?.risk_score}
  accent="#7c3aed"
  explanation={STAT_EXPLANATIONS.risk}
/>

<MetricCard
  label="📬 Reply Likelihood"
  value={`${result?.reply_likelihood ?? 0}%`}
  accent="#0f766e"
  explanation={STAT_EXPLANATIONS.reply}
/>

<MetricCard
  label="💭 Regret Risk"
  value={`${result?.regret_risk ?? 0}%`}
  accent="#dc2626"
  explanation={STAT_EXPLANATIONS.regret}
/>

<MetricCard
  label="🕵️ Manipulation Risk"
  value={`${result?.manipulation_risk ?? 0}%`}
  accent="#4f46e5"
  explanation={STAT_EXPLANATIONS.manipulation}
/>/>
                </div>
              </div>
            </div>

            {Array.isArray(result.top_manipulation_signals) &&
              result.top_manipulation_signals.length > 0 && (
                <div style={cardStyle}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
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
                        className="tc-chip-hover"
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
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(255,247,237,0.96))",
                  border: "1px solid rgba(251,146,60,0.22)",
                  boxShadow:
                    "0 12px 34px rgba(251,146,60,0.08), 0 1px 0 rgba(255,255,255,0.75) inset",
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
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#9a3412",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                      }}
                    >
                      ✍️ SUGGESTED REWRITE
                    </div>
                    <div style={{ marginTop: "6px", color: "#7c2d12", fontSize: "14px" }}>
                      A calmer version that keeps the core intent.
                    </div>
                  </div>

                  <button className="tc-button-hover" onClick={copyRewriteOnly} style={actionButtonStyle}>
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
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  💡 ADVISORY
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    lineHeight: 1.8,
                    fontSize: "18px",
                    color: "#111827",
                  }}
                >
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
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
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
                <button className="tc-button-hover" onClick={copyResult} style={primaryButtonStyle}>
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

function MetricCard({ label, value, accent, explanation }) {
  const [showTip, setShowTip] = React.useState(false);

  return (
    <div
      style={{
        ...cardStyle,
        padding: "18px",
        position: "relative",
      }}
    >
      {/* label row */}
      <div
        style={{
          fontSize: "14px",
          opacity: 0.75,
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {label}

        {/* info icon */}
        <span
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          style={{
            fontSize: "13px",
            cursor: "help",
            opacity: 0.6,
          }}
        >
          ⓘ
        </span>
      </div>

      {/* value */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: accent,
        }}
      >
        {value}
      </div>

      {/* tooltip */}
      {showTip && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            transform: "translateY(-100%)",
            background: "rgba(30,41,59,0.95)",
            color: "white",
            fontSize: "13px",
            padding: "10px 12px",
            borderRadius: "10px",
            width: "200px",
            lineHeight: "1.4",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {explanation}
        </div>
      )}
    </div>
  );
}

function MiniTag({ label }) {
  return (
    <div
      className="tc-chip-hover"
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
      className="tc-chip-hover"
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
