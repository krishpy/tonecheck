import { getSendVerdict } from "../../utils/sendDecision";

export default function SendDecisionCard({
  riskScore = 0,
  regretRisk = 0,
  manipulationRisk = 0,
  tone = "",
  hiddenSignal = "",
}) {
  const verdict = getSendVerdict(riskScore, regretRisk, manipulationRisk);

  return (
    <section className={`tc-glow-card send-decision-card send-decision-card--${verdict.toneClass}`}>
      <div className="send-decision-card__header">
        <p className="results-section-label">Should I Send This?</p>
        <div className={`send-decision-badge send-decision-badge--${verdict.toneClass}`}>
          <span>{verdict.emoji}</span>
          <span>{verdict.label}</span>
        </div>
      </div>

      <p className="send-decision-card__reason">{verdict.reason}</p>

      <div className="send-decision-card__meta">
        <span><strong>Risk:</strong> {riskScore}/100</span>
        <span><strong>Regret:</strong> {regretRisk}%</span>
        <span><strong>Manipulation:</strong> {manipulationRisk}%</span>
      </div>

      {(tone || hiddenSignal) && (
        <div className="send-decision-card__insight">
          {tone ? <span><strong>Tone:</strong> {tone}</span> : null}
          {hiddenSignal ? <span><strong>Signal:</strong> {hiddenSignal}</span> : null}
        </div>
      )}
    </section>
  );
}