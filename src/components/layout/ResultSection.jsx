import React from "react";
import { RewriteCard, DetectedSignals } from "../results";
import SeoContentBlock from "./SeoContentBlock";
import ShareButton from "../common/ShareButton";
import useIsMobile from "../../hooks/useIsMobile";

function getAdaptiveVerdict({ sendVerdict, toneLabel, hiddenSignalLabel, riskScore }) {
  const tone = String(toneLabel || "").toLowerCase();
  const hidden = String(hiddenSignalLabel || "").toLowerCase();
  const verdictTone = sendVerdict?.tone || "neutral";

  if (
    verdictTone === "danger" ||
    riskScore >= 85 ||
    hidden.includes("threat") ||
    hidden.includes("hostile")
  ) {
    return {
      title: "Don’t send this yet",
      sublabel: "Likely to escalate quickly.",
      tip: "Pause and use the rewrite below before sending anything.",
      chipLabel: hiddenSignalLabel,
    };
  }

  if (
    verdictTone === "warning" ||
    riskScore >= 65 ||
    hidden.includes("profanity") ||
    hidden.includes("insult")
  ) {
    return {
      title: "Risky — rethink before sending",
      sublabel: "This can trigger defensiveness fast.",
      tip: "Strip out harsh wording and send the calmer version below.",
      chipLabel: hiddenSignalLabel,
    };
  }

  if (
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

  if (tone.includes("neutral") || verdictTone === "neutral" || riskScore >= 40) {
    return {
      title: "Safe — but could be clearer",
      sublabel: "This may come across differently than you intend.",
      tip: "Try the rewrite below to make it warmer or clearer.",
      chipLabel: hiddenSignalLabel,
    };
  }

  return {
    title: "Safe to send",
    sublabel: "Clear and unlikely to cause issues.",
    tip: "You can still use the rewrite below if you want a smoother version.",
    chipLabel: hiddenSignalLabel,
  };
}

function getToneCardStyle({ isMobile, toneTheme, hiddenSignalLabel, toneLabel, riskScore }) {
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
      background: "linear-gradient(135deg, rgba(254,249,195,0.92), rgba(255,251,235,0.9))",
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
      iconBg: "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #b91c1c 100%)",
      iconGlow: "rgba(239,68,68,0.26)",
      tipBg: "rgba(254,242,242,0.92)",
      tipBorder: "1px solid rgba(239,68,68,0.18)",
      tipColor: "#b91c1c",
    },
    warning: {
      title: "#d97706",
      subtitle: "#9a3412",
      iconBg: "linear-gradient(135deg, #fb923c 0%, #f97316 55%, #ea580c 100%)",
      iconGlow: "rgba(249,115,22,0.24)",
      tipBg: "rgba(255,247,237,0.94)",
      tipBorder: "1px solid rgba(249,115,22,0.18)",
      tipColor: "#c2410c",
    },
    neutral: {
      title: "#475569",
      subtitle: "#64748b",
      iconBg: "linear-gradient(135deg, #94a3b8 0%, #64748b 55%, #475569 100%)",
      iconGlow: "rgba(100,116,139,0.22)",
      tipBg: "rgba(239,246,255,0.92)",
      tipBorder: "1px solid rgba(59,130,246,0.16)",
      tipColor: "#1d4ed8",
    },
    safe: {
      title: "#15803d",
      subtitle: "#166534",
      iconBg: "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
      iconGlow: "rgba(34,197,94,0.24)",
      tipBg: "rgba(240,253,244,0.94)",
      tipBorder: "1px solid rgba(34,197,94,0.16)",
      tipColor: "#15803d",
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
  finalRewrite,
  riskScore,
  rewriteRiskScore,
  rewriteLoading,
  riskImprovement,
  rewriteTone,
  setRewriteTone,
  copyRewriteOnly,
  useRewriteMessage,
  sendRewriteWhatsApp,
  copyState,
  sendVerdict,
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
  if (!result || result.error) return null;

  const hiddenSignalKey =
    result.primary_hidden_signal ||
    result.hidden_signal ||
    result.primary_manipulation_signal ||
    "none";

  const hiddenSignalLabel = getHiddenSignalLabel(hiddenSignalKey);
  const toneLabel = getToneLabel();
  const toneEmoji = getToneEmoji();
  const isMobile = useIsMobile();

  const adaptiveVerdict = getAdaptiveVerdict({
    sendVerdict,
    toneLabel,
    hiddenSignalLabel,
    riskScore,
  });

  const rewriteIntro =
    riskScore >= 70
      ? "A calmer version that lowers the chance of escalation."
      : riskScore >= 40
      ? "A cleaner version that sounds easier to receive."
      : "A polished version that keeps your meaning but sounds smoother.";

  const signalChipStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: isMobile ? "9px 12px" : "10px 14px",
    borderRadius: "999px",
    background: toneTheme.chipBg,
    border: `1px solid ${toneTheme.border}`,
    color: toneTheme.chipText,
    fontWeight: 800,
    fontSize: isMobile ? "13px" : "14px",
  };

  const toneCard = getToneCardStyle({
    isMobile,
    toneTheme,
    hiddenSignalLabel,
    toneLabel,
    riskScore,
  });

  const verdictTheme = getVerdictTheme(sendVerdict?.tone);
  const shouldShowSignalChip = !["neutral", "none", "none detected"].includes(
    String(adaptiveVerdict.chipLabel || "").trim().toLowerCase()
  );

  return (
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
                flexDirection: "row",
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

              {shouldShowSignalChip ? <div style={signalChipStyle}>{hiddenSignalLabel}</div> : null}
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
                {message}
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
                    width: isMobile ? "48px" : "56px",
                    height: isMobile ? "48px" : "56px",
                    borderRadius: isMobile ? "16px" : "18px",
                    background: verdictTheme.iconBg,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: isMobile ? "24px" : "28px",
                    flexShrink: 0,
                    boxShadow: `0 16px 30px ${verdictTheme.iconGlow}`,
                    border: "1px solid rgba(255,255,255,0.28)",
                    transform: "translateY(1px)",
                  }}
                >
                  {sendVerdict.emoji}
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
                    </div>

                    {shouldShowSignalChip ? (
                      <div
                        style={{
                          ...signalChipStyle,
                          background: "rgba(255,255,255,0.56)",
                        }}
                      >
                        {adaptiveVerdict.chipLabel}
                      </div>
                    ) : null}
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
                boxShadow: `0 8px 22px ${toneCard.glow || "rgba(15,23,42,0.08)"}`,
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

        {finalRewrite && (
          <RewriteCard
            cardStyle={cardStyle}
            chipStyle={chipStyle}
            finalRewrite={finalRewrite}
            rewriteRiskScore={rewriteRiskScore}
            riskScore={riskScore}
            riskImprovement={riskImprovement}
            rewriteTone={rewriteTone}
            rewriteloading={rewriteLoading}
            setRewriteTone={setRewriteTone}
            copyRewriteOnly={copyRewriteOnly}
            useRewriteMessage={useRewriteMessage}
            sendRewriteWhatsApp={sendRewriteWhatsApp}
            copyState={copyState}
            rewriteIntro={rewriteIntro}
            whatsappIcon={
              <img
                src="/whatsapp.svg"
                alt=""
                style={{ width: 18, height: 18, display: "block" }}
              />
            }
          />
        )}

        {!!result.top_manipulation_signals?.length && (
          <DetectedSignals
            signals={result.top_manipulation_signals}
            getHiddenSignalLabel={getHiddenSignalLabel}
          />
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
              icon={
                <img
                  src="/whatsapp.svg"
                  alt=""
                  style={{ width: 18, height: 18, display: "block" }}
                />
              }
            />
            <button className="tc-button-hover" onClick={copyResult} style={actionButtonStyle}>
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
            <button className="tc-button-hover" onClick={downloadCard} style={primaryButtonStyle}>
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
                setRewriteTone("balanced");
                if (setMessage) setMessage("");
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
    </>
  );
}