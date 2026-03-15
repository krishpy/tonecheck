import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import { Helmet } from "react-helmet-async";
import { ToneSummaryCard, StatsRow } from "./components/results";
import ShareButton from "./components/common/ShareButton";

const STAT_EXPLANATIONS = {
  risk: "How risky your message sounds. Higher means it could upset someone or escalate the conversation.",
  reply: "How likely the other person is to respond positively.",
  regret: "Chance you may regret sending this later.",
  manipulation: "Whether the message may pressure or guilt the other person.",
};

const MINI_TOOLS = {
  home: {
    slug: "home",
    title: "ToneCheck",
    eyebrow: "Think Before You Send",
    description:
      "Check how your message may sound, detect hidden communication risk, and get a calmer rewrite before you hit send.",
    placeholder: "Paste your message, WhatsApp text, or email here...",
    analyzeLabel: "Analyze Tone",
    examples: [
      { label: "😒 Passive aggressive", text: "Fine. Do whatever you want." },
      { label: "😠 Angry text", text: "Why are you ignoring me?" },
      { label: "🧾 Work message", text: "Send me the file ASAP." },
      { label: "🤝 Constructive", text: "I disagree, but let’s discuss calmly." },
    ],
    badge: "Communication Intelligence Demo",
    resultMode: "default",
  },
  "should-i-send-this": {
    slug: "should-i-send-this",
    title: "Should I Send This?",
    eyebrow: "Send Decision Tool",
    description:
      "Check whether your message may come off too aggressive, risky, manipulative, or regrettable before you hit send.",
    placeholder: "Paste the message you're thinking of sending...",
    analyzeLabel: "Check Message",
    examples: [
      { label: "Ignored?", text: "You keep ignoring me." },
      { label: "No reply", text: "Why haven’t you answered me???" },
      { label: "Soft ask", text: "Can we talk when you get a chance?" },
      { label: "Passive", text: "Fine. Do whatever you want." },
    ],
    badge: "Mini Tool",
    resultMode: "send_decision",
  },
  "passive-aggressive-detector": {
    slug: "passive-aggressive-detector",
    title: "Passive Aggressive Detector",
    eyebrow: "Tone Signal Tool",
    description:
      "See whether your message sounds cold, sarcastic, dismissive, guilt-tripping, or indirectly hostile.",
    placeholder: "Paste a message to check for passive aggression...",
    analyzeLabel: "Detect Tone",
    examples: [
      { label: "Classic passive", text: "Fine. Do whatever you want." },
      { label: "Dismissive", text: "Thanks for nothing." },
      { label: "Cold compliance", text: "I’ll just do it myself." },
      { label: "Fake polite", text: "No worries. Clearly you're busy." },
    ],
    badge: "Mini Tool",
    resultMode: "passive_aggressive",
  },
  "manipulation-detector": {
    slug: "manipulation-detector",
    title: "Manipulation Detector",
    eyebrow: "Hidden Signal Tool",
    description:
      "Check for guilt pressure, emotional leverage, reassurance demands, blame shifting, and hidden control.",
    placeholder: "Paste a message to check for manipulation...",
    analyzeLabel: "Analyze Message",
    examples: [
      { label: "Guilt", text: "After all I’ve done for you..." },
      { label: "Leverage", text: "If you cared, you’d reply." },
      { label: "Gaslight", text: "You’re overreacting." },
      { label: "Control", text: "I only say this because I care about you." },
    ],
    badge: "Mini Tool",
    resultMode: "manipulation",
  },
  "rude-or-polite": {
    slug: "rude-or-polite",
    title: "Rude or Polite?",
    eyebrow: "Politeness Tool",
    description:
      "See whether your message sounds respectful, blunt, rude, insulting, or hostile.",
    placeholder: "Paste a message to check how it may come across...",
    analyzeLabel: "Check Tone",
    examples: [
      { label: "Blunt", text: "Send me the file today." },
      { label: "Polite", text: "Can you please send me the file today?" },
      { label: "Rude", text: "Shut up." },
      { label: "Constructive", text: "I disagree, but let’s discuss calmly." },
    ],
    badge: "Mini Tool",
    resultMode: "politeness",
  },
  "desperate-text-checker": {
    slug: "desperate-text-checker",
    title: "Desperate Text Checker",
    eyebrow: "Relationship Tone Tool",
    description:
      "Check whether your message sounds clingy, needy, pressuring, over-eager, or emotionally dependent.",
    placeholder: "Paste your text message...",
    analyzeLabel: "Check Text",
    examples: [
      { label: "Hello??", text: "Hello??" },
      { label: "Are you there?", text: "Are you there?" },
      { label: "No reply", text: "Why aren’t you replying?" },
      { label: "Needy", text: "Please answer me." },
    ],
    badge: "Mini Tool",
    resultMode: "desperation",
  },
};

function getToolConfigFromPath(pathname) {
  if (pathname === "/") return MINI_TOOLS.home;

  const SEO_ROUTE_MAP = {
    "/should-i-send-this": "should-i-send-this",
    "/passive-aggressive-text": "passive-aggressive-detector",
    "/manipulative-text-checker": "manipulation-detector",
    "/is-this-message-rude": "rude-or-polite",
    "/desperate-text-checker": "desperate-text-checker",
  };

  if (SEO_ROUTE_MAP[pathname]) {
    return MINI_TOOLS[SEO_ROUTE_MAP[pathname]];
  }

  if (pathname.startsWith("/tools/")) {
    const slug = pathname.replace("/tools/", "");
    return MINI_TOOLS[slug] || null;
  }

  return null;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function MiniToolGrid () {
  const [showMore, setShowMore] = React.useState(false);

  const featuredTools = [
    MINI_TOOLS["desperate-text-checker"],
    MINI_TOOLS["rude-or-polite"],
  ];

  const moreTools = [
    MINI_TOOLS["should-i-send-this"],
    MINI_TOOLS["passive-aggressive-detector"],
    MINI_TOOLS["manipulation-detector"],
  ];

  const toolRouteMap = {
    "should-i-send-this": "/should-i-send-this",
    "passive-aggressive-detector": "/passive-aggressive-text",
    "manipulation-detector": "/manipulative-text-checker",
    "rude-or-polite": "/is-this-message-rude",
    "desperate-text-checker": "/desperate-text-checker",
  };

 return (
  <div style={{ marginTop: "28px" }}>
    <div
      style={{
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "0.08em",
        color: "#6366f1",
        textTransform: "uppercase",
        marginBottom: "12px",
      }}
    >
      Try other checks
    </div>

    <div
      style={{
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.5,
        marginBottom: "14px",
      }}
    >
      Quick shortcuts for the most-used checks.
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
      }}
    >
      {featuredTools.map((tool) => (
        <Link
          key={tool.slug}
          to={toolRouteMap[tool.slug] || `/tools/${tool.slug}`}
          style={{
            textDecoration: "none",
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(15,23,42,0.06)",
            boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#6366f1",
              textTransform: "uppercase",
            }}
          >
            {tool.eyebrow}
          </div>

          <div
            style={{
              marginTop: "7px",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            {tool.title}
          </div>

          <div
            style={{
              marginTop: "6px",
              color: "#475569",
              fontSize: "13px",
              lineHeight: 1.55,
            }}
          >
            {tool.description}
          </div>
        </Link>
      ))}

      <div
        onClick={() => setShowMore(!showMore)}
        style={{
          padding: "18px",
          borderRadius: "18px",
          background: "rgba(99,102,241,0.05)",
          border: "1px dashed rgba(99,102,241,0.35)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          color: "#4338ca",
          fontSize: "14px",
        }}
      >
        + More tools
      </div>
    </div>

    {showMore && (
      <div
        style={{
          display: "grid",
          gap: "10px",
          marginTop: "14px",
        }}
      >
        {moreTools.map((tool) => (
          <Link
            key={tool.slug}
            to={toolRouteMap[tool.slug] || `/tools/${tool.slug}`}
            style={{
              textDecoration: "none",
              display: "block",
              padding: "13px 14px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.86)",
              border: "1px solid rgba(15,23,42,0.06)",
              color: "#0f172a",
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
            }}
          >
            {tool.title}
          </Link>
        ))}
      </div>
    )}
  </div>
);

}

function SeoContentBlock({ tool }) {
  if (!tool || tool.slug === "home") return null;

  const contentMap = {
    "should-i-send-this": {
      h2: "Should you send this message?",
      p1: "This tool helps you check whether a message may come across as aggressive, manipulative, emotionally loaded, or risky before you hit send.",
      p2: "It is useful for texts, WhatsApp messages, emails, relationship conversations, and tense replies.",
    },
    "passive-aggressive-detector": {
      h2: "Check if a message sounds passive aggressive",
      p1: "This detector looks for sarcasm, dismissive compliance, cold phrasing, guilt pressure, and indirect hostility.",
      p2: "Use it for texts like 'Fine. Do whatever you want.' or 'No worries. Clearly you're busy.'",
    },
    "manipulation-detector": {
      h2: "Check for manipulation, guilt pressure, and hidden control",
      p1: "This tool highlights emotional leverage, reassurance demands, blame shifting, control disguised as care, and subtle pressure.",
      p2: "It is especially useful for emotionally loaded relationship and conflict messages.",
    },
    "rude-or-polite": {
      h2: "See whether your message sounds rude or polite",
      p1: "This checker helps you understand whether your wording sounds blunt, respectful, hostile, or unnecessarily harsh.",
      p2: "It is useful for work messages, emails, feedback, Slack messages, and difficult conversations.",
    },
    "desperate-text-checker": {
      h2: "Check whether your text sounds desperate or clingy",
      p1: "This tool looks for repeated urgency, emotional dependency, over-eagerness, pressure, and reply-chasing language.",
      p2: "It is useful before sending follow-ups, relationship texts, and unanswered messages.",
    },
  };

  const c = contentMap[tool.slug];
  if (!c) return null;

  return (
    <div
      style={{
        marginTop: "22px",
        background: "rgba(255,255,255,0.74)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: "28px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "28px",
          lineHeight: 1.2,
          letterSpacing: "-0.03em",
          color: "#111827",
        }}
      >
        {c.h2}
      </h2>

      <p style={{ marginTop: "12px", color: "#475569", lineHeight: 1.8, fontSize: "16px" }}>
        {c.p1}
      </p>

      <p style={{ marginTop: "10px", color: "#475569", lineHeight: 1.8, fontSize: "16px" }}>
        {c.p2}
      </p>
    </div>
  );
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
  const [rewriteTone, setRewriteTone] = useState("default");

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

  function getSendVerdict(score) {
    const s = Number(score ?? 0);
    const isSendDecisionTool = currentTool?.resultMode === "send_decision";

    if (isSendDecisionTool) {
      if (s >= 55) {
        return {
          emoji: "🔴",
          label: "No",
          text: "This message has enough friction or emotional charge that you should reconsider before sending.",
          color: "#dc2626",
          bg: "rgba(254,226,226,0.85)",
          border: "rgba(239,68,68,0.22)",
        };
      }

      if (s >= 25) {
        return {
          emoji: "🟡",
          label: "Maybe",
          text: "This message may still work, but softening it could improve how it lands.",
          color: "#b45309",
          bg: "rgba(254,249,195,0.88)",
          border: "rgba(245,158,11,0.22)",
        };
      }

      return {
        emoji: "🟢",
        label: "Safe",
        text: "This message looks fairly safe to send as-is.",
        color: "#15803d",
        bg: "rgba(220,252,231,0.88)",
        border: "rgba(34,197,94,0.22)",
      };
    }

    if (s >= 70) {
      return {
        emoji: "🔴",
        label: "No",
        text: "This message is risky enough that most people should pause before sending.",
        color: "#dc2626",
        bg: "rgba(254,226,226,0.85)",
        border: "rgba(239,68,68,0.22)",
      };
    }

    if (s >= 40) {
      return {
        emoji: "🟡",
        label: "Maybe",
        text: "This message may still work, but softening it could improve how it lands.",
        color: "#b45309",
        bg: "rgba(254,249,195,0.88)",
        border: "rgba(245,158,11,0.22)",
      };
    }

    return {
      emoji: "🟢",
      label: "Safe",
      text: "This message looks fairly safe to send as-is.",
      color: "#15803d",
      bg: "rgba(220,252,231,0.88)",
      border: "rgba(34,197,94,0.22)",
    };
  }

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

  function adjustRewriteTone(text, tone) {
    if (!text) return text;

    if (tone === "calmer") {
      return text.replace(/\?+/g, ".").replace(/!/g, ".");
    }

    if (tone === "professional") {
      return `Hi,\n\n${text}\n\nThank you.`;
    }

    if (tone === "friendlier") {
      if (text.endsWith(".")) return text.replace(/\.$/, " 🙂");
      return `${text} 🙂`;
    }

    if (tone === "direct") {
      return text
        .replace("Could you please", "Please")
        .replace("when you get a chance", "today");
    }

    return text;
  }

  const finalRewrite = adjustRewriteTone(displayedRewrite, rewriteTone);

  const primaryHiddenSignalLabel = getHiddenSignalLabel(
    result?.primary_hidden_signal || result?.primary_manipulation_signal
  );

  function getClampedMessage(text, max = 180) {
    const value = String(text || "").trim();
    if (value.length <= max) return value;
    return `${value.slice(0, max).trim()}…`;
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
      setRewriteTone("default");
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

  const regretRisk = Number(result?.regret_risk ?? 0);
  const riskScore = Number(result?.risk_score ?? 0);
  const rewriteRiskScore = Math.max(0, riskScore - 40);
  const riskImprovement = riskScore - rewriteRiskScore;
  const replyLikelihood = Number(result?.reply_likelihood ?? 0);
  const manipulationRisk = Number(result?.manipulation_risk ?? 0);
  const toneTheme = getToneTheme();
  const sendVerdict = getSendVerdict(riskScore);

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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: location.pathname === "/" ? "ToneCheck" : currentTool.title,
            applicationCategory: "Communication Tool",
            operatingSystem: "Any",
            url: `https://trytonecheck.com${location.pathname}`,
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <style>{`
        @keyframes tc-aggressive {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }

        @keyframes tc-light-sweep {
          0% { transform: translateX(-120%); opacity: 0; }
          40% { opacity: 0.5; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        .tc-light-sweep {
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            110deg,
            transparent,
            rgba(255,255,255,0.35),
            transparent
          );
          filter: blur(10px);
          animation: tc-light-sweep 8s linear infinite;
          pointer-events: none;
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
          transform-origin: center;
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

            
            <div className="tc-hero" style={heroCardStyle}>
              <div className="tc-light-sweep"></div>
              <div style={glassOrb1} />
              <div style={glassOrb2} />
              <div style={glassOrb3} />

              <div style={{ marginBottom: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className="tc-chip-hover"
                  onClick={() => navigate("/")}
                  style={{ ...chipStyle, background: "rgba(255,255,255,0.82)" }}
                >
                  Home
                </button>

                {location.pathname !== "/" && (
                  <div
                    style={{
                      ...chipStyle,
                      background: "rgba(99,102,241,0.10)",
                      color: "#4338ca",
                      cursor: "default",
                    }}
                  >
                    {currentTool.title}
                  </div>
                )}
              </div>

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
                      {currentTool.eyebrow}
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
                      {location.pathname === "/" ? "ToneCheck" : currentTool.title}
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
                  {currentTool.description}
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
                {currentTool.examples.map((example) => (
                  <button
                    key={example.label}
                    className="tc-chip-hover"
                    style={{ ...chipStyle, background: "rgba(255,255,255,0.78)" }}
                    onClick={() => setExample(example.text)}
                  >
                    {example.label}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "24px", position: "relative" }}>
                <textarea
                  className="tc-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={currentTool.placeholder}
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
                    {loading ? "Analyzing..." : currentTool.analyzeLabel}
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
              </div>
            {location.pathname === "/" && (
              <div style={{ marginTop: "28px" }}>
                <MiniToolGrid />
              </div>
            )}
                          
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
	      <>
                <div
                  style={{
                    position: "absolute",
                    left: "-99999px",
                    top: 0,
                    pointerEvents: "none",
                    opacity: 0,
                  }}
                >
                  <div
                    id="tone-share-card"
                    style={{
                      width: "1080px",
                      background:
                        "linear-gradient(180deg, #f8fafc 0%, #eef2ff 52%, #f5f3ff 100%)",
                      padding: "40px",
                      fontFamily:
                        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      color: "#0f172a",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid rgba(255,255,255,0.82)",
                        borderRadius: "32px",
                        padding: "32px",
                        boxShadow:
                          "0 18px 46px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "24px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 800,
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              color: "#6366f1",
                            }}
                          >
                            ToneCheck Result
                          </div>

                          <div
                            style={{
                              marginTop: "10px",
                              fontSize: "44px",
                              lineHeight: 1,
                              fontWeight: 900,
                              letterSpacing: "-0.06em",
                              background:
                                "linear-gradient(135deg, #0f172a 0%, #312e81 30%, #7c3aed 62%, #ec4899 100%)",
                              backgroundSize: "200% 200%",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {location.pathname === "/" ? "ToneCheck" : currentTool.title}
                          </div>
                        </div>

                        <div
                          style={{
                            minWidth: "220px",
                            borderRadius: "22px",
                            padding: "16px 18px",
                            background: toneTheme.chipBg,
                            border: `1px solid ${toneTheme.border}`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                              color: "#64748b",
                            }}
                          >
                            What’s Coming Through
                          </div>
                          <div
                            style={{
                              marginTop: "8px",
                              fontSize: "24px",
                              fontWeight: 800,
                              color: toneTheme.chipText,
                            }}
                          >
                            {primaryHiddenSignalLabel}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "26px",
                          borderRadius: "24px",
                          padding: "22px",
                          background: "rgba(255,255,255,0.84)",
                          border: "1px solid rgba(15,23,42,0.06)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            color: "#64748b",
                          }}
                        >
                          MESSAGE
                        </div>
                        <div
                          style={{
                            marginTop: "10px",
                            fontSize: "28px",
                            lineHeight: 1.6,
                            color: "#111827",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {getClampedMessage(message, 220)}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "22px",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            borderRadius: "22px",
                            padding: "18px",
                            background: "rgba(255,255,255,0.84)",
                            border: "1px solid rgba(15,23,42,0.06)",
                          }}
                        >
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b" }}>
                            Tone
                          </div>
                          <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>
                            {getToneEmoji()} {getToneLabel()}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: "22px",
                            padding: "18px",
                            background: "rgba(255,255,255,0.84)",
                            border: "1px solid rgba(15,23,42,0.06)",
                          }}
                        >
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b" }}>
                            Overall Risk
                          </div>
                          <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>
                            {riskScore}/100
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: "22px",
                            padding: "18px",
                            background: "rgba(255,255,255,0.84)",
                            border: "1px solid rgba(15,23,42,0.06)",
                          }}
                        >
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b" }}>
                            Verdict
                          </div>
                          <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800 }}>
                            {sendVerdict.emoji} {sendVerdict.label}
                          </div>
                        </div>
                      </div>

                      {finalRewrite ? (
                        <div
                          style={{
                            marginTop: "22px",
                            borderRadius: "24px",
                            padding: "22px",
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(255,247,237,0.96))",
                            border: "1px solid rgba(251,146,60,0.18)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                              color: "#9a3412",
                            }}
                          >
                            BETTER VERSION
                          </div>
                          <div
                            style={{
                              marginTop: "10px",
                              fontSize: "26px",
                              lineHeight: 1.7,
                              color: "#111827",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {finalRewrite}
                          </div>
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: "28px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <div style={{ color: "#64748b", fontSize: "18px" }}>
                          Check yours at trytonecheck.com
                        </div>
                        <div
                          style={{
                            fontSize: "22px",
                            fontWeight: 900,
                            letterSpacing: "-0.04em",
                            color: "#312e81",
                          }}
                        >
                          T✓ ToneCheck
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "24px", display: "grid", gap: "20px" }}>
  			<ToneSummaryCard
    				cardStyle={cardStyle}
   				 toneTheme={toneTheme}
   				 getToneLabel={getToneLabel}
    				getToneEmoji={getToneEmoji}
   				 riskScore={riskScore}
   				 sendVerdict={sendVerdict}
    				primaryHiddenSignalLabel={primaryHiddenSignalLabel}
    				getMeterWidth={getMeterWidth}
    				getMeterColor={getMeterColor}
    				getToneAccent={getToneAccent}
  				/>
        

                  {finalRewrite && (
                    <div
                      style={{
                        ...cardStyle,
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,247,237,0.98) 55%, rgba(255,237,213,0.92) 100%)",
                        border: "1px solid rgba(251,146,60,0.28)",
                        boxShadow:
                          "0 18px 44px rgba(251,146,60,0.14), 0 1px 0 rgba(255,255,255,0.82) inset",
                        padding: "30px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "6px",
                          background: "linear-gradient(90deg, #fb923c, #f59e0b, #f97316)",
                          opacity: 0.95,
                        }}
                      />

                      <div
                        style={{
                          fontSize: "13px",
                          color: "#9a3412",
                          fontWeight: 900,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        ✨ Better Version
                      </div>

                      <div
                        style={{
                          marginTop: "8px",
                          color: "#7c2d12",
                          fontSize: "15px",
                          lineHeight: 1.6,
                          maxWidth: "780px",
                        }}
                      >
                        This version keeps your meaning, but is more likely to land well.
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          padding: "14px",
                          borderRadius: "12px",
                          background: "rgba(34,197,94,0.08)",
                          border: "1px solid rgba(34,197,94,0.18)",
                          display: "flex",
                          gap: "18px",
                          flexWrap: "wrap",
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        <span>Your message risk: {riskScore}</span>
                        <span>Rewrite risk: {rewriteRiskScore}</span>
                        <span style={{ color: "#15803d", fontWeight: 800 }}>
                        ↑ {riskImprovement} points safer
                      </span>
                      </div>

                      <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => setRewriteTone("default")}
                          style={{
                            ...chipStyle,
                            background: rewriteTone === "default" ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.8)",
                            color: rewriteTone === "default" ? "#4338ca" : "#111827",
                          }}
                        >
                          Default
                        </button>
                        <button
                          onClick={() => setRewriteTone("calmer")}
                          style={{
                            ...chipStyle,
                            background: rewriteTone === "calmer" ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.8)",
                            color: rewriteTone === "calmer" ? "#4338ca" : "#111827",
                          }}
                        >
                          Calmer
                        </button>
                        <button
                          onClick={() => setRewriteTone("professional")}
                          style={{
                            ...chipStyle,
                            background: rewriteTone === "professional" ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.8)",
                            color: rewriteTone === "professional" ? "#4338ca" : "#111827",
                          }}
                        >
                          Professional
                        </button>
                        <button
                          onClick={() => setRewriteTone("friendlier")}
                          style={{
                            ...chipStyle,
                            background: rewriteTone === "friendlier" ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.8)",
                            color: rewriteTone === "friendlier" ? "#4338ca" : "#111827",
                          }}
                        >
                          Friendlier
                        </button>
                        <button
                          onClick={() => setRewriteTone("direct")}
                          style={{
                            ...chipStyle,
                            background: rewriteTone === "direct" ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.8)",
                            color: rewriteTone === "direct" ? "#4338ca" : "#111827",
                          }}
                        >
                          Direct
                        </button>
                      </div>

                      <div style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
                        <div
                          style={{
                            padding: "16px",
                            borderRadius: "14px",
                            background: "rgba(248,250,252,0.9)",
                            border: "1px solid rgba(15,23,42,0.06)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              letterSpacing: "0.06em",
                              color: "#64748b",
                            }}
                          >
                            YOUR MESSAGE
                          </div>

                          <div
                            style={{
                              marginTop: "8px",
                              fontSize: "18px",
                              lineHeight: 1.6,
                              color: "#111827",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            "{message}"
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "18px",
                            borderRadius: "14px",
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid rgba(251,146,60,0.25)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              letterSpacing: "0.06em",
                              color: "#9a3412",
                            }}
                          >
                            BETTER VERSION
                          </div>

                          <div
                            style={{
                              marginTop: "10px",
                              fontSize: "22px",
                              lineHeight: 1.7,
                              fontWeight: 700,
                              color: "#111827",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            "{finalRewrite}"
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "12px",
                          fontSize: "15px",
                          color: "#64748b",
                          lineHeight: 1.6,
                        }}
                      >
                        Messages like this usually receive better responses because they reduce pressure and sound calmer.
                      </div>

                      <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>

                          <button
                        onClick={() =>
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(finalRewrite)}`,
                            "_blank"
                          )
                        }
                        className="tc-button-hover"
                        style={{
                          padding: "16px 22px",
                          borderRadius: "18px",
                          border: "1px solid rgba(255,255,255,0.28)",
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: "15px",
                          color: "#ffffff",
                          background:
                            "linear-gradient(135deg, #16a34a 0%, #22c55e 45%, #4ade80 100%)",
                          boxShadow:
                            "0 12px 28px rgba(34,197,94,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
                        }}
                      >
                        Send via WhatsApp
                      </button>



                        
                        <button
                            onClick={copyRewriteOnly}
                            className="tc-button-hover"
                            style={{
                              ...actionButtonStyle,
                              background: "rgba(255,255,255,0.9)",
                              border: "1px solid rgba(15,23,42,0.12)",
                              color: "#111827",
                            }}
                          >
                            ✍️ Copy rewrite
                          </button>
                        
                       <button
                        onClick={useRewriteMessage}
                        className="tc-button-hover"
                        style={{
                          padding: "16px 22px",
                          borderRadius: "18px",
                          border: "1px solid rgba(255,255,255,0.28)",
                          cursor: "pointer",
                          fontWeight: 900,
                          fontSize: "15px",
                          color: "#ffffff",
                          background:
                            "linear-gradient(135deg, #111827 0%, #4338ca 45%, #7c3aed 72%, #ec4899 100%)",
                          boxShadow:
                            "0 16px 36px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.22)",
                        }}
                      >
                        ✏️ Use This Message
                      </button>

                        
                      

                        {copyState && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 700,
                              color: "#2563eb",
                            }}
                          >
                            ✓ {copyState}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: "18px",
                          paddingTop: "14px",
                          borderTop: "1px solid rgba(15,23,42,0.06)",
                          fontSize: "14px",
                          color: "#64748b",
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                 
                        <span style={{ fontWeight: 700, color: "#4338ca" }}>
                          trytonecheck.com
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                      gap: "16px",
                    }}
                  >
                    <StatsRow
  			replyLikelihood={replyLikelihood}
 			 regretRisk={regretRisk}
  			manipulationRisk={manipulationRisk}
  			statExplanations={STAT_EXPLANATIONS}
		      />
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
                        💡 Why This Matters
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
                          Share ToneCheck Result
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
                      <ShareButton 
                        onClick={shareWhatsApp} 
                        label="WhatsApp" 
                        icon={<img src="/whatsapp.svg" alt="" style={{ width: 18, height: 18, display: "block"}} />}
                        />
                      <button
                        className="tc-button-hover"
                        onClick={copyResult}
                        style={actionButtonStyle}
                      >
                        📋 Copy result
                      </button>
                       <ShareButton 
                        onClick={shareFacebook} 
                        label="Facebook" 
                        icon={<img src="/facebook.svg" alt="" style={{ width: 18, height: 18,  display: "block" }} />}
                        />
                      <ShareButton onClick={shareX} label="X" icon="𝕏" />
                    <ShareButton 
                        onClick={shareLinkedIn} 
                        label="LinkedIn" 
                        icon={<img src="/linkedin.svg" alt="" style={{ width: 18, height: 18,  display: "block" }} />}
                        />
                      <button
                        className="tc-button-hover"
                        onClick={downloadCard}
                        style={primaryButtonStyle}
                      >
                        📸 Download Share Card
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      ...cardStyle,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(238,242,255,0.94))",
                      border: "1px solid rgba(99,102,241,0.14)",
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
                      TRY YOUR MESSAGE
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "18px",
                        color: "#111827",
                        fontWeight: 700,
                      }}
                    >
                      Paste another message and see how it sounds.
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        color: "#64748b",
                        fontSize: "14px",
                        lineHeight: 1.6,
                      }}
                    >
                      Great for texts, emails, Slack messages, and difficult conversations.
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <button
                        className="tc-button-hover"
                        onClick={() => {
                          setResult(null);
                          setCopyState("");
                          setRewriteTone("default");
                          setTimeout(() => {
                            const textarea = document.querySelector(".tc-textarea");
                            if (textarea) textarea.focus();
                          }, 50);
                        }}
                        style={primaryButtonStyle}
                      >
                        ✨ Try Another Message
                      </button>
                    </div>
                  </div>

                  {location.pathname !== "/" && <SeoContentBlock tool={currentTool} />}
                </div>
            )}
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
      <Route path="*" element={<RedirectHome />} />
    </Routes>
  );
}
