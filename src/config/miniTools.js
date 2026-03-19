export const MINI_TOOLS = {
  home: {
    slug: "home",
    title: "ToneCheck",
    eyebrow: "Think Before You Send",
    description:
      "Check how your message may sound, detect hidden communication risk, and get a calmer rewrite before you hit send.",
    placeholder: "Paste your message, WhatsApp text, or email here...",
    analyzeLabel: "Check Before Sending",
    examples: [
      { label: "😒 Why didn't you reply?", text: "Fine. Do whatever you want." },
      { label: "😠 Fine. Do whatever you want.", text: "Why are you ignoring me?" },
      { label: "🧾 I was there for you everytime", text: "Send me the file ASAP." },
      { label: "🤝 Can we talk about this?", text: "I disagree, but let’s discuss calmly." },
    ],
    badge: "Communication Intelligence Demo",
    resultMode: "default",
  },

  "should-i-send-this": {
    slug: "should-i-send-this",
    title: "Should I Send This?",
    eyebrow: "Send Decision Tool",
    description:
      "Don’t send a message you’ll regret.",
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

export function getToolConfigFromPath(pathname) {
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