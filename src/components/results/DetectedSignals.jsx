import React from "react";

function formatSignalLabel(signal = "") {
  const map = {
    threat_signal: "Threat",
    hostile_command_signal: "Hostile command",
    profanity_signal: "Profanity",
    insult_signal: "Insult",
    guilt_pressure: "Guilt pressure",
    emotional_leverage: "Emotional leverage",
    blame_shifting: "Blame shifting",
    accusatory_pressure_signal: "Accusatory pressure",
    pressure_signal: "Pressure",
    passive_aggression_signal: "Passive aggression",
    passive_aggression: "Passive aggression",
    constructive_disagreement_signal: "Constructive disagreement",
    polite_request_signal: "Polite request",
    neutral_information: "Neutral",
    none: "Neutral",
  };

  if (!signal) return "";
  return map[signal] || signal.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isMeaningfulSignal(signal = "") {
  const normalized = String(signal || "").trim().toLowerCase();

  if (!normalized) return false;

  const hiddenSignalsToHide = new Set([
    "none",
    "neutral",
    "neutral_information",
    "polite_request_signal",
    "constructive_disagreement_signal",
  ]);

  return !hiddenSignalsToHide.has(normalized);
}

export default function DetectedSignals({ signals = [], getHiddenSignalLabel }) {
  const cleanedSignals = (Array.isArray(signals) ? signals : [])
    .map((signal) => {
      if (typeof signal === "string") {
        return {
          key: signal,
          label: getHiddenSignalLabel ? getHiddenSignalLabel(signal) : formatSignalLabel(signal),
        };
      }

      const key =
        signal?.signal ||
        signal?.name ||
        signal?.label ||
        "";

      return {
        key,
        label: getHiddenSignalLabel ? getHiddenSignalLabel(key) : formatSignalLabel(key),
      };
    })
    .filter((item) => isMeaningfulSignal(item.key))
    .filter((item) => item.label && item.label.trim())
    .filter(
      (item, index, arr) =>
        arr.findIndex((x) => x.label.toLowerCase() === item.label.toLowerCase()) === index
    )
    .slice(0, 4);

  if (!cleanedSignals.length) return null;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: "24px",
        padding: "18px 20px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 900,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: "12px",
        }}
      >
        Detected signals
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {cleanedSignals.map((signal) => (
          <div
            key={signal.key}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: "999px",
              background: "rgba(248,250,252,0.95)",
              border: "1px solid rgba(15,23,42,0.08)",
              color: "#334155",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            {signal.label}
          </div>
        ))}
      </div>
    </div>
  );
}