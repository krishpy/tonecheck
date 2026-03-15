export default function DetectedSignals({ signals, getHiddenSignalLabel }) {
  if (!signals?.length) return null;

  return (
    <div>
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

      <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {signals.map((item, idx) => (
          <div key={idx}>
            {getHiddenSignalLabel(item.name)} · {item.score}
          </div>
        ))}
      </div>
    </div>
  );
}