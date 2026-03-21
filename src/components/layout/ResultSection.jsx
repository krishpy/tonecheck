import React from "react";
import { RewriteCard, StatsRow, DetectedSignals } from "../results";
import SeoContentBlock from "./SeoContentBlock";
import ShareButton from "../common/ShareButton";
import useIsMobile from "../../hooks/useIsMobile";

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
  replyLikelihood,
  regretRisk,
  manipulationRisk,
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
  const verdictColors = {
  danger: "#dc2626",
  warning: "#ea580c",
  neutral: "#64748b",
  safe: "#16a34a",
   };

  const dynamicAdvisory =
    result.advisory ||
    (riskScore >= 85
      ? "This message may escalate quickly and be received as threatening."
      : riskScore >= 70
      ? "This message may sound harsh or aggressive and trigger a defensive reaction."
      : riskScore >= 40
      ? "This message may create friction or misunderstanding depending on context."
      : "This message is relatively safe, but the wording can still be smoother.");

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
    padding: "10px 14px",
    borderRadius: "999px",
    background: toneTheme.chipBg,
    border: `1px solid ${toneTheme.border}`,
    color: toneTheme.chipText,
    fontWeight: 800,
    fontSize: "14px",
  };

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
                flexDirection: isMobile ? "column" : "row",
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

              <div style={signalChipStyle}>{hiddenSignalLabel}</div>
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
            background: toneTheme.bg,
            border: `1px solid ${toneTheme.border}`,
            boxShadow: `0 10px 30px ${toneTheme.glow || "rgba(15,23,42,0.06)"}`,
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
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: verdictColors[sendVerdict.tone] || toneTheme.iconBg,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: "22px",
                    flexShrink: 0,
                    boxShadow: `0 12px 24px ${toneTheme.glow || "rgba(15,23,42,0.10)"}`,
                  }}
                >
                  {sendVerdict.emoji}
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        fontSize: isMobile ? "22px" : "30px",
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        color: verdictColors[sendVerdict.tone] || "#111827",
                        lineHeight: 1,
                      }}
                    >
                      {sendVerdict.label}
                    </div>
                    <div style={signalChipStyle}>{hiddenSignalLabel}</div>
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      color: "#475569",
                      maxWidth: "720px",
                    }}
                  >
                    {dynamicAdvisory}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: toneTheme.chipBg,
    color: toneTheme.chipText,
    border: `1px solid ${toneTheme.border}`,
    borderRadius: "16px",
    padding: isMobile ? "10px 12px" : "12px 14px",
    minWidth: isMobile ? "100%" : "120px",
    width: isMobile ? "100%" : "auto",
    marginTop: isMobile ? "12px" : "0",
    boxShadow: `0 8px 22px ${toneTheme.glow || "rgba(15,23,42,0.08)"}`,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#64748b",
                }}
              >
                Tone
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: toneTheme.chipText,
                }}
              >
                {toneEmoji} {toneLabel}
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: "18px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6366f1",
              marginBottom: "12px",
            }}
          >
            What could happen
          </div>

          <StatsRow
            replyLikelihood={replyLikelihood}
            regretRisk={regretRisk}
            manipulationRisk={manipulationRisk}
            hiddenSignal={hiddenSignalKey}
          />
        </div>

        {finalRewrite && (
          <div style={{ display: "grid", gap: "10px" }}>
            <div
              style={{
                ...cardStyle,
                background:
                  "linear-gradient(135deg, rgba(255,250,245,0.98), rgba(255,242,229,0.98))",
                border: "1px solid rgba(251,146,60,0.26)",
                boxShadow:
                  "0 12px 34px rgba(251,146,60,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#c2410c",
                  marginBottom: "8px",
                }}
              >
                Better version to send
              </div>

              <div
                style={{
                  color: "#7c2d12",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                {rewriteIntro}
              </div>
            </div>

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
              whatsappIcon={
                <img
                  src="/whatsapp.svg"
                  alt=""
                  style={{ width: 18, height: 18, display: "block" }}
                />
              }
            />
          </div>
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