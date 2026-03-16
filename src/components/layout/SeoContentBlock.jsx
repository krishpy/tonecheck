import React from "react";

export default function SeoContentBlock({ tool }) {
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

      <p
        style={{
          marginTop: "12px",
          color: "#475569",
          lineHeight: 1.8,
          fontSize: "16px",
        }}
      >
        {c.p1}
      </p>

      <p
        style={{
          marginTop: "10px",
          color: "#475569",
          lineHeight: 1.8,
          fontSize: "16px",
        }}
      >
        {c.p2}
      </p>
    </div>
  );
}