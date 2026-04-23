import React from "react";
import { RewriteCard, DetectedSignals } from "../results";
import SeoContentBlock from "./SeoContentBlock";
import ShareButton from "../common/ShareButton";
import useIsMobile from "../../hooks/useIsMobile";
import { submitFeedback } from "../../lib/api";
import ShareCard from "../share/ShareCard";

function buildSendVerdict(result) {
  const apiVerdict = String(
    result?.send_decision || result?.send_verdict || ""
  )
    .toLowerCase()
    .trim();

  const risk = Number(result?.communication_risk_score || 0);
  const hidden = String(
    result?.hidden_signal || result?.primary_hidden_signal || ""
  ).toLowerCase();
  const tone = String(result?.tone || "").toLowerCase();

  const isSafeHidden = ["", "none", "none detected"].includes(hidden);

  if (apiVerdict === "do_not_send") {
    return {
      tone: "danger",
      emoji: "⛔",
      label: "Don’t send",
      reason: "This may escalate or cause damage.",
    };
  }

  if (apiVerdict === "rethink") {
    return {
      tone: "danger",
      emoji: "⚠️",
      label: "Rethink before sending",
      reason: "This may create emotional pressure or damage trust.",
    };
  }

  if (apiVerdict === "review" || apiVerdict === "review_before_sending") {
    return {
      tone: "neutral",
      emoji: "🤔",
      label: "Careful — may be misunderstood",
      reason: "Your intent may land as pressure or blame.",
    };
  }

  if (apiVerdict === "send" || apiVerdict === "safe_to_send") {
    return {
      tone: "safe",
      emoji: "✅",
      label: "Safe to send",
      reason: "Clear and unlikely to cause issues.",
    };
  }

  if (risk <= 20 && isSafeHidden) {
    return {
      tone: "safe",
      emoji: "✅",
      label: "Looks good to send",
      reason: "This message looks safe and unlikely to create tension.",
    };
  }

  if (risk <= 60 && isSafeHidden) {
    return {
      tone: "safe",
      emoji: "🙂",
      label: "Looks okay to send",
      reason: "This message appears fairly safe.",
    };
  }

  if (
    hidden.includes("threat") ||
    hidden.includes("hostile") ||
    hidden.includes("insult") ||
    hidden.includes("profanity")
  ) {
    return {
      tone: "warning",
      emoji: "⚠️",
      label: "Risky — rethink before sending",
      reason: "This can trigger defensiveness fast.",
    };
  }

  if (
    hidden.includes("passive") ||
    hidden.includes("pressure") ||
    hidden.includes("guilt") ||
    hidden.includes("blame") ||
    hidden.includes("accus") ||
    tone.includes("manipulative")
  ) {
    return {
      tone: "neutral",
      emoji: "🤔",
      label: "Careful — may be misunderstood",
      reason: "Your intent may land more sharply than you mean.",
    };
  }

  if (risk >= 65) {
    return {
      tone: "warning",
      emoji: "⚠️",
      label: "Risky — rethink before sending",
      reason: "This can trigger defensiveness or conflict.",
    };
  }

  return {
    tone: "neutral",
    emoji: "🤔",
    label: "Might need a quick tweak",
    reason: "This message could be interpreted more sharply than intended.",
  };
}

function getAdaptiveVerdict({ sendVerdict, hiddenSignalLabel, riskScore }) {
  const hidden = String(hiddenSignalLabel || "").toLowerCase();
  const verdictLabel = String(sendVerdict?.label || "").toLowerCase();

  if (verdictLabel.includes("safe")) {
    return {
      title: "Safe to send",
      sublabel: "Clear and unlikely to cause issues.",
      tip: "You can send this as-is.",
      chipLabel: hiddenSignalLabel,
    };
  }

  if (verdictLabel.includes("rethink")) {
    return {
      title: "Rethink before sending",
      sublabel: "This may create emotional pressure or damage trust.",
      tip: "Step back and send the calmer version below instead.",
      chipLabel: hiddenSignalLabel,
    };
  }

  if (
    verdictLabel.includes("careful") ||
    hidden.includes("passive") ||
    hidden.includes("pressure") ||
    hidden.includes("guilt") ||
    hidden.includes("blame") ||
    hidden.includes("accus")
  ) {
    return {
      title: "Careful — may be misunderstood",
      sublabel: "Your intent may land as pressure or blame.",
      tip: "Make the message clearer and more direct before sending.",
      chipLabel: hiddenSignalLabel,
    };
  }

  if (
    hidden.includes("threat") ||
    hidden.includes("hostile") ||
    hidden.includes("insult") ||
    hidden.includes("profanity") ||
    riskScore >= 65
  ) {
    return {
      title: "Risky — rethink before sending",
      sublabel: "This can trigger defensiveness fast.",
      tip: "Strip out harsh wording and send the calmer version below.",
      chipLabel: hiddenSignalLabel,
    };
  }

  return {
    title: "Looks okay to send",
    sublabel: "This message appears fairly safe.",
    tip: "You can still refine it if you want a smoother version.",
    chipLabel: hiddenSignalLabel,
  };
}

function getToneCardStyle({
  isMobile,
  toneTheme,
  hiddenSignalLabel,
  toneLabel,
  riskScore,
}) {
  const hidden = String(hiddenSignalLabel || "").toLowerCase();
  const tone = String(toneLabel || "").toLowerCase();

  const shouldWarmNeutral =
    (tone.includes("neutral") && riskScore >= 40) ||
    hidden.includes("passive") ||
    hidden.includes("pressure") ||
    hidden.includes("guilt") ||
    hidden.includes("blame") ||
    hidden.includes("accus");

  if (shouldWarmNeutral) {
    return {
      background:
        "linear-gradient(135deg, rgba(254,249,195,0.92), rgba(255,251,235,0.9))",
      color: "#a16207",
      border: "rgba(245,158,11,0.24)",
      glow: "rgba(245,158,11,0.14)",
      chipText: "#a16207",
      titleText: "#8a6407",
      padding: isMobile ? "10px 12px" : "12px 14px",
      minWidth: isMobile ? "100%" : "148px",
      width: isMobile ? "100%" : "auto",
      marginTop: isMobile ? "12px" : "0",
    };
  }

  return {
    background: toneTheme.chipBg,
    color: toneTheme.chipText,
    border: toneTheme.border,
    glow: toneTheme.glow,
    chipText: toneTheme.chipText,
    titleText: "#64748b",
    padding: isMobile ? "10px 12px" : "12px 14px",
    minWidth: isMobile ? "100%" : "148px",
    width: isMobile ? "100%" : "auto",
    marginTop: isMobile ? "12px" : "0",
  };
}

function getVerdictTheme(tone) {
  const map = {
    danger: {
      title: "#c81e1e",
      subtitle: "#7f1d1d",
      iconBg:
        "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #b91c1c 100%)",
      iconGlow: "rgba(239,68,68,0.26)",
      tipBg: "rgba(254,242,242,0.92)",
      tipBorder: "1px solid rgba(239,68,68,0.18)",
      tipColor: "#b91c1c",
    },
    warning: {
      title: "#d97706",
      subtitle: "#9a3412",
      iconBg:
        "linear-gradient(135deg, #fb923c 0%, #f97316 55%, #ea580c 100%)",
      iconGlow: "rgba(249,115,22,0.24)",
      tipBg: "rgba(255,247,237,0.94)",
      tipBorder: "1px solid rgba(249,115,22,0.18)",
      tipColor: "#c2410c",
    },
    neutral: {
      title: "#374151",
      subtitle: "#6b7280",
      iconBg:
        "linear-gradient(135deg, #eab308 0%, #f59e0b 55%, #d97706 100%)",
      iconGlow: "rgba(245,158,11,0.25)",
      tipBg: "rgba(255,251,235,0.9)",
      tipBorder: "1px solid rgba(245,158,11,0.2)",
      tipColor: "#b45309",
    },
    safe: {
      title: "#166534",
      subtitle: "#15803d",
      iconBg:
        "linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)",
      iconGlow: "rgba(34,197,94,0.28)",
      tipBg: "rgba(240,253,244,0.9)",
      tipBorder: "1px solid rgba(34,197,94,0.2)",
      tipColor: "#166534",
    },
  };

  return map[tone] || map.neutral;
}

export default function ResultSection({
  result,
  location,
  currentTool,
  cardStyle,
  chipStyle,
  primaryButtonStyle,
  actionButtonStyle,
  toneTheme,
  message,
  rewriteLoading,
  rewriteTone,
  setRewriteTone,
  copyRewriteOnly,
  useRewriteMessage,
  sendRewriteWhatsApp,
  copyState,
  getToneLabel,
  getToneEmoji,
  getHiddenSignalLabel,
  shareWhatsApp,
  copyResult,
  shareFacebook,
  shareX,
  shareLinkedIn,
  downloadCard,
  setResult,
  setCopyState,
  setMessage,
}) {
  const isMobile = useIsMobile();

  const [feedbackSent, setFeedbackSent] = React.useState(false);
  const [showNegativeOptions, setShowNegativeOptions] = React.useState(false);
  const [feedbackLoading, setFeedbackLoading] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState("");

  React.useEffect(() => {
    setFeedbackSent(false);
    setShowNegativeOptions(false);
    setFeedbackLoading(false);
    setFeedbackError("");
  }, [result?.analysis_event_id]);

  if (!result || result.error) return null;

  async function handleFeedback(feedback_rating, wrong_area = null) {
    if (!result?.analysis_event_id) {
      setFeedbackError("Feedback is unavailable for this result.");
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackError("");

      await submitFeedback({
        analysis_event_id: result.analysis_event_id,
        feedback_rating,
        wrong_area,
        comment: null,
      });

      setFeedbackSent(true);
      setShowNegativeOptions(false);
    } catch (err) {
      console.error(err);
      setFeedbackError("Could not save feedback. Please try again.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  const backendRisk = Number(result?.communication_risk_score || 0);

  const hiddenSignalKey =
    result.primary_hidden_signal ||
    result.hidden_signal ||
    result.primary_manipulation_signal ||
    "none";

  const hiddenSignalLabel = getHiddenSignalLabel(hiddenSignalKey);
  const backendHidden = String(hiddenSignalLabel || "").toLowerCase();
  const backendRewrite =
    result?.rewritten_text || result?.rewrite_suggestion || "";

  const toneLabel = result?.tone || result?.label || "Neutral";
  const toneEmoji =
    String(toneLabel).toLowerCase() === "aggressive"
      ? "😠"
      : String(toneLabel).toLowerCase() === "threatening"
      ? "⛔"
      : String(toneLabel).toLowerCase() === "accusatory"
      ? "⚠️"
      : String(toneLabel).toLowerCase() === "frustrated"
      ? "😤"
      : String(toneLabel).toLowerCase() === "tense"
      ? "😬"
      : String(toneLabel).toLowerCase() === "friendly"
      ? "🙂"
      : String(toneLabel).toLowerCase() === "polite"
      ? "🙂"
      : "🙂";

  const sendVerdict = buildSendVerdict(result);

  const adaptiveVerdict = getAdaptiveVerdict({
    sendVerdict,
    hiddenSignalLabel,
    riskScore: backendRisk,
  });

  const safeRewrite =
    backendRisk <= 20 && ["none", "none detected", ""].includes(backendHidden)
      ? ""
      : backendRewrite;

  const shouldShowRewriteCard = safeRewrite.trim() !== "";

  const rewriteIntro =
    backendRisk >= 70
      ? "A calmer version that lowers the chance of escalation."
      : backendRisk >= 40
      ? "A cleaner version that sounds easier to receive."
      : "A polished version that keeps your meaning but sounds smoother.";

  const toneCard = getToneCardStyle({
    isMobile,
    toneTheme,
    hiddenSignalLabel,
    toneLabel,
    riskScore: backendRisk,
  });

  const verdictTheme = getVerdictTheme(sendVerdict?.tone);

  const topCardChipHiddenLabels = new Set([
    "neutral",
    "none",
    "none detected",
    "profanity",
    "accusation",
    "accusatory pressure",
    "guilt pressure",
    "emotional leverage",
    "blame shifting",
    "pressure",
    "passive aggression",
    "hostile command",
    "insult",
    "threat",
  ]);

  const shouldShowSignalChip = !topCardChipHiddenLabels.has(
    String(adaptiveVerdict.chipLabel || "").trim().toLowerCase()
  );

  const feedbackButtonStyle = {
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.92)",
    color: "#0f172a",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  };

  return (
    <>
      <div
        style={{
           position: "fixed",
          left: "-20000px",
          top: 0,
          opacity: 1,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <ShareCard
         toolTitle={location.pathname === "/" ? "ToneCheck" : currentTool.title}
        message={message}
        rewrite={shouldShowRewriteCard ? safeRewrite : ""}
        tone={toneLabel}
        risk={backendRisk}
        hiddenSignal={shouldShowSignalChip ? hiddenSignalLabel : ""}
        showSignalChip={shouldShowSignalChip}
        />
      </div>

      <div style={{ marginTop: "24px", display: "grid", gap: "18px" }}>
        <div
          style={{
            ...cardStyle,
            background:
              sendVerdict?.tone === "safe"
                ? "linear-gradient(135deg, rgba(240,253,244,0.94), rgba(254,252,232,0.88))"
                : sendVerdict?.tone === "neutral"
                ? "linear-gradient(135deg, rgba(248,250,252,0.96), rgba(254,252,232,0.88))"
                : toneTheme.bg,
            border: `1px solid ${
              sendVerdict?.tone === "safe"
                ? "rgba(34,197,94,0.18)"
                : sendVerdict?.tone === "neutral"
                ? "rgba(245,158,11,0.18)"
                : toneTheme.border
            }`,
            boxShadow:
              sendVerdict?.tone === "safe"
                ? "0 12px 30px rgba(34,197,94,0.08)"
                : sendVerdict?.tone === "neutral"
                ? "0 12px 30px rgba(245,158,11,0.08)"
                : `0 10px 30px ${toneTheme.glow || "rgba(15,23,42,0.06)"}`,
            padding: isMobile ? "14px" : "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 420px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Should I send this?
              </div>

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: isMobile ? "12px" : "14px",
                }}
              >
                <div
                  style={{
                    width: isMobile ? "52px" : "60px",
                    height: isMobile ? "52px" : "60px",
                    borderRadius: "20px",
                    background: verdictTheme.iconBg,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: isMobile ? "26px" : "30px",
                    flexShrink: 0,
                    boxShadow: `0 18px 34px ${verdictTheme.iconGlow}`,
                    border: "1px solid rgba(255,255,255,0.35)",
                    transform: "translateY(1px)",
                    animation: "tc-breathe 2.6s ease-in-out infinite",
                  }}
                >
                  <span style={{ transform: "translateY(1px)" }}>
                    {sendVerdict.emoji}
                  </span>
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: isMobile ? "flex-start" : "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: isMobile ? "22px" : "30px",
                          fontWeight: 900,
                          letterSpacing: "-0.04em",
                          color: verdictTheme.title,
                          lineHeight: 1.02,
                        }}
                      >
                        {adaptiveVerdict.title}
                      </div>

                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: isMobile ? "14px" : "15px",
                          color: verdictTheme.subtitle,
                          fontWeight: 650,
                          lineHeight: 1.45,
                        }}
                      >
                        {adaptiveVerdict.sublabel}
                      </div>

                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "12px",
                          color: "#94a3b8",
                          fontWeight: 600,
                        }}
                      >
                        Based on tone + hidden signals detected
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      padding: "10px 13px",
                      borderRadius: "999px",
                      background: verdictTheme.tipBg,
                      border: verdictTheme.tipBorder,
                      color: verdictTheme.tipColor,
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>✨</span>
                    <span>{adaptiveVerdict.tip}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: toneCard.background,
                color: toneCard.color,
                border: `1px solid ${toneCard.border}`,
                borderRadius: "18px",
                padding: toneCard.padding,
                minWidth: toneCard.minWidth,
                width: toneCard.width,
                marginTop: toneCard.marginTop,
                boxShadow: `0 8px 22px ${
                  toneCard.glow || "rgba(15,23,42,0.08)"
                }`,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: toneCard.titleText,
                }}
              >
                Tone
              </div>
              <div
                style={{
                  marginTop: "7px",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: toneCard.chipText,
                }}
              >
                {toneEmoji} {toneLabel}
              </div>
            </div>
          </div>
        </div>

        {shouldShowRewriteCard ? (
          <RewriteCard
            cardStyle={cardStyle}
            chipStyle={chipStyle}
            finalRewrite={safeRewrite}
            rewriteTone={rewriteTone}
            rewriteloading={rewriteLoading || false}
            setRewriteTone={setRewriteTone}
            copyRewriteOnly={copyRewriteOnly}
            useRewriteMessage={useRewriteMessage}
            sendRewriteWhatsApp={sendRewriteWhatsApp}
            copyState={copyState}
            rewriteIntro={rewriteIntro}
            riskScore={backendRisk}
            hiddenSignal={backendHidden}
            toneLabel={result?.tone || ""}
            whatsappIcon={
              <img
                src="/whatsapp.svg"
                alt=""
                style={{ width: 18, height: 18, display: "block" }}
              />
            }
          />
        ) : null}

        {!!result.top_manipulation_signals?.length && (
          <DetectedSignals
            signals={result.top_manipulation_signals}
            getHiddenSignalLabel={getHiddenSignalLabel}
          />
        )}

        <div
          style={{
            ...cardStyle,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(248,250,252,0.96))",
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        >
          {!feedbackSent ? (
            <>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                }}
              >
                HELP IMPROVE TONECHECK
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "18px",
                  color: "#111827",
                  fontWeight: 700,
                }}
              >
                Was this result accurate?
              </div>

              <div
                style={{
                  marginTop: "8px",
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Your feedback helps improve tone, hidden signal, rewrite, and
                verdict quality.
              </div>

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="tc-button-hover"
                  disabled={feedbackLoading}
                  onClick={() => handleFeedback("positive")}
                  style={feedbackButtonStyle}
                >
                  👍 Yes, accurate
                </button>

                <button
                  type="button"
                  className="tc-button-hover"
                  disabled={feedbackLoading}
                  onClick={() => setShowNegativeOptions((prev) => !prev)}
                  style={feedbackButtonStyle}
                >
                  👎 Not quite
                </button>
              </div>

              {showNegativeOptions && (
                <div
                  style={{
                    marginTop: "14px",
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="tc-button-hover"
                    disabled={feedbackLoading}
                    onClick={() => handleFeedback("negative", "tone")}
                    style={feedbackButtonStyle}
                  >
                    Wrong tone
                  </button>

                  <button
                    type="button"
                    className="tc-button-hover"
                    disabled={feedbackLoading}
                    onClick={() =>
                      handleFeedback("negative", "hidden_signal")
                    }
                    style={feedbackButtonStyle}
                  >
                    Wrong hidden signal
                  </button>

                  <button
                    type="button"
                    className="tc-button-hover"
                    disabled={feedbackLoading}
                    onClick={() => handleFeedback("negative", "rewrite")}
                    style={feedbackButtonStyle}
                  >
                    Bad rewrite
                  </button>

                  <button
                    type="button"
                    className="tc-button-hover"
                    disabled={feedbackLoading}
                    onClick={() => handleFeedback("negative", "verdict")}
                    style={feedbackButtonStyle}
                  >
                    Wrong verdict
                  </button>
                </div>
              )}

              {feedbackError ? (
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#b91c1c",
                  }}
                >
                  {feedbackError}
                </div>
              ) : null}
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#166534",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                }}
              >
                FEEDBACK SAVED
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "18px",
                  color: "#111827",
                  fontWeight: 700,
                }}
              >
                Thanks — this helps improve ToneCheck.
              </div>

              <div
                style={{
                  marginTop: "8px",
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                We’ll use this to improve tone, hidden signal, rewrite, and
                verdict accuracy.
              </div>
            </div>
          )}
        </div>

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
              <div
                style={{
                  marginTop: "6px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Copy includes tone, risk, hidden signal, advisory, and suggested
                rewrite.
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
              icon={
                <img
                  src="/whatsapp.svg"
                  alt=""
                  style={{ width: 18, height: 18, display: "block" }}
                />
              }
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
              icon={
                <img
                  src="/facebook.svg"
                  alt=""
                  style={{ width: 18, height: 18, display: "block" }}
                />
              }
            />
            <ShareButton onClick={shareX} label="X" icon="𝕏" />
            <ShareButton
              onClick={shareLinkedIn}
              label="LinkedIn"
              icon={
                <img
                  src="/linkedin.svg"
                  alt=""
                  style={{ width: 18, height: 18, display: "block" }}
                />
              }
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
            if (setMessage) setMessage("");
            setResult(null);
            setCopyState("");
            setRewriteTone("balanced");
            setConsentToSaveText(false);

            setTimeout(() => {
              window.location.reload();
            }, 100);
          }}
          style={primaryButtonStyle}
        >
          ✨ Try Another Message
        </button>
      </div>
        </div>

        {location.pathname !== "/" && <SeoContentBlock tool={currentTool} />}
      </div>
    </>
  );
}