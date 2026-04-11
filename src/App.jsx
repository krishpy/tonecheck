import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import { Helmet } from "react-helmet-async";
import STAT_EXPLANATIONS from "./config/statExplanations";
import { MINI_TOOLS, getToolConfigFromPath } from "./config/miniTools";
import SendDecisionCard from "./components/results/SendDecisionCard";
import SeoContentBlock from "./components/layout/SeoContentBlock";
import HeroSection from "./components/layout/HeroSection";
import ResultSection from "./components/layout/ResultSection";
import TestLab from "./pages/TestLab";
import AdminDashboard from "./pages/AdminDashboard";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSessionId() {
  let sessionId = localStorage.getItem("tonecheck_session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("tonecheck_session_id", sessionId);
  }

  return sessionId;
}


function getTonecheckSessionId() {
  let sessionId = localStorage.getItem("tonecheck_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("tonecheck_session_id", sessionId);
  }
  return sessionId;
}

function RedirectHome() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
}

function AppContent() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [rewriteTone, setRewriteTone] = useState("balanced");
  const [rewriteLoading, setRewriteLoading] = useState(false);

  useEffect(() => {
    if (!result || !message.trim()) return;
    analyze(rewriteTone, { isRewriteOnly: true });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewriteTone]);

  const location = useLocation();
  const navigate = useNavigate();

  const currentTool = useMemo(() => {
    return getToolConfigFromPath(location.pathname) || MINI_TOOLS.home;
  }, [location.pathname]);

  const pageTitle =
    location.pathname === "/"
      ? "ToneCheck — Check how your message may land before you send it"
      : `${currentTool.title} | ToneCheck`;

  const pageDescription =
    location.pathname === "/"
      ? "Check tone, aggression, manipulation, reply chance, regret risk, and get a calmer rewrite before sending."
      : currentTool.description;

  const displayedRewrite = useMemo(() => {
    return (
      result?.rewrite_suggestion ||
      result?.suggested_rewrite ||
      result?.rewrite ||
      result?.rewritten_text ||
      ""
    );
  }, [result]);

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

  const finalRewrite = displayedRewrite;

  const primaryHiddenSignalLabel = getHiddenSignalLabel(
    result?.primary_hidden_signal || result?.primary_manipulation_signal
  );

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

  function buildShareText() {
    return `✨ ToneCheck Result

📝 Message:
"${message}"

${getToneEmoji()} Tone: ${getToneLabel()}
⚠️ Risk Score: ${result?.risk_score ?? ""}/100
📊 Risk Level: ${result?.risk_level ?? ""}
💭 Regret Risk: ${result?.regret_risk ?? ""}
📬 Reply Likelihood: ${result?.reply_likelihood ?? ""}
🕵️ Hidden Signal: ${primaryHiddenSignalLabel}
💡 Advisory: ${result?.advisory ?? ""}${
      finalRewrite
        ? `

✍️ Suggested Rewrite:
${finalRewrite}`
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
          finalRewrite
            ? `<p style="margin:0 0 12px 0;"><strong>✍️ Suggested Rewrite:</strong><br/>${escapeHtml(finalRewrite)}</p>`
            : ""
        }
        <p style="margin:0;"><strong>🔗 Check yours at:</strong> https://trytonecheck.com</p>
      </div>
    `;
  }

  async function copyRewriteOnly() {
    if (!finalRewrite) return;
    try {
      await navigator.clipboard.writeText(finalRewrite);
      setCopyState("Rewrite copied");
      setTimeout(() => setCopyState(""), 1800);
    } catch {
      setCopyState("Copy failed");
      setTimeout(() => setCopyState(""), 1800);
    }
  }

  function useRewriteMessage() {
    if (!finalRewrite) return;
    setMessage(finalRewrite);
    setResult(null);

    setTimeout(() => {
      const textarea = document.querySelector(".tc-textarea");
      if (textarea) textarea.focus();
    }, 50);
  }

  function openShare(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function sendRewriteWhatsApp() {
    if (!finalRewrite) return;
    openShare(`https://wa.me/?text=${encodeURIComponent(finalRewrite)}`);
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

  async function analyze(selectedStyleArg = rewriteTone, options = {}) {
    const startedAt = Date.now();
    const selectedStyle =
      typeof selectedStyleArg === "string" ? selectedStyleArg : rewriteTone;

    const { isRewriteOnly = false } = options;

    try {
      if (isRewriteOnly) {
        setRewriteLoading(true);
      } else {
        setLoading(true);
        setResult(null);
      }

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
      rewrite_style: selectedStyle,
      session_id: getSessionId(),
      user_id: null,
      page_slug: window.location.pathname,
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
      const elapsed = Date.now() - startedAt;
      const minVisible = 300;
      const remaining = Math.max(0, minVisible - elapsed);

      if (isRewriteOnly) {
        setTimeout(() => {
          setRewriteLoading(false);
        }, remaining);
      } else {
        setLoading(false);
        setRewriteLoading(false);
      }
    }
  }

  async function downloadCard() {
    try {
      const node = document.getElementById("tone-share-card");
      if (!node) {
        setCopyState("Card not found");
        setTimeout(() => setCopyState(""), 1800);
        return;
      }

      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = "tonecheck-result.png";
      link.href = dataUrl;
      link.click();

      setCopyState("Card downloaded");
      setTimeout(() => setCopyState(""), 1800);
    } catch (err) {
      console.error("Download card failed:", err);
      setCopyState("Download failed");
      setTimeout(() => setCopyState(""), 1800);
    }
  }

  function setExample(text) {
    setMessage(text);
    setCopyState("");
  }

  const regretRisk = Number(result?.regret_risk ?? 0);
  const riskScore = Number(result?.risk_score ?? 0);
  const rewriteRiskScore = Math.max(0, riskScore - 40);
  const riskImprovement = riskScore - rewriteRiskScore;
  const replyLikelihood = Number(result?.reply_likelihood ?? 0);
  const manipulationRisk = Number(result?.manipulation_risk ?? 0);
  const toneTheme = getToneTheme();

  const resultBadge = getResultBadge(result, riskImprovement);

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
      "0 18px 44px rgba(79,70,229,0.30), 0 8px 22px rgba(236,72,153,0.16), inset 0 1px 0 rgba(255,255,255,0.18)",
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
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://trytonecheck.com${location.pathname}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <div style={shellStyle}>
        <div
          className="tc-grid-main"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          <div>
            <HeroSection
              location={location}
              navigate={navigate}
              currentTool={currentTool}
              message={message}
              setMessage={setMessage}
              setResult={setResult}
              setCopyState={setCopyState}
              analyze={analyze}
              loading={loading}
              setExample={setExample}
              heroCardStyle={heroCardStyle}
              chipStyle={chipStyle}
              actionButtonStyle={actionButtonStyle}
              primaryButtonStyle={primaryButtonStyle}
              result={result}
              getHiddenSignalLabel={getHiddenSignalLabel}
            />

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

            <ResultSection
              result={result}
              message={message}
              location={location}
              currentTool={currentTool}
              cardStyle={cardStyle}
              chipStyle={chipStyle}
              primaryButtonStyle={primaryButtonStyle}
              actionButtonStyle={actionButtonStyle}
              toneTheme={toneTheme}
              primaryHiddenSignalLabel={primaryHiddenSignalLabel}
              finalRewrite={finalRewrite}
              riskScore={riskScore}
              rewriteRiskScore={rewriteRiskScore}
              riskImprovement={riskImprovement}
              rewriteTone={rewriteTone}
              setRewriteTone={setRewriteTone}
              rewriteLoading={rewriteLoading}
              copyRewriteOnly={copyRewriteOnly}
              useRewriteMessage={useRewriteMessage}
              copyState={copyState}
              getToneLabel={getToneLabel}
              getToneEmoji={getToneEmoji}
              getMeterWidth={getMeterWidth}
              getMeterColor={getMeterColor}
              getToneAccent={getToneAccent}
              replyLikelihood={replyLikelihood}
              regretRisk={regretRisk}
              manipulationRisk={manipulationRisk}
              statExplanations={STAT_EXPLANATIONS}
              getHiddenSignalLabel={getHiddenSignalLabel}
              sendRewriteWhatsApp={sendRewriteWhatsApp}
              shareWhatsApp={shareWhatsApp}
              copyResult={copyResult}
              shareFacebook={shareFacebook}
              shareX={shareX}
              shareLinkedIn={shareLinkedIn}
              downloadCard={downloadCard}
              setResult={setResult}
              setCopyState={setCopyState}
              setMessage={setMessage}
              resultBadge={resultBadge}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/tools/:slug" element={<AppContent />} />
      <Route path="/should-i-send-this" element={<AppContent />} />
      <Route path="/passive-aggressive-text" element={<AppContent />} />
      <Route path="/manipulative-text-checker" element={<AppContent />} />
      <Route path="/is-this-message-rude" element={<AppContent />} />
      <Route path="/desperate-text-checker" element={<AppContent />} />
      <Route path="/test-lab" element={<TestLab />} />
      <Route path="*" element={<RedirectHome />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

function getResultBadge(result, riskImprovement) {
  if (!result) return null;

  if (result.risk_score >= 70) {
    return {
      text: "⚠️ High-risk message caught",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.10)",
      border: "1px solid rgba(239,68,68,0.25)",
    };
  }

  if (riskImprovement > 20) {
    return {
      text: "✨ Safer rewrite found",
      color: "#16a34a",
      bg: "rgba(34,197,94,0.10)",
      border: "1px solid rgba(34,197,94,0.25)",
    };
  }

  return {
    text: "✅ Message already safe",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.25)",
  };
}