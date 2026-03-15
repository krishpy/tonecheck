export default function MiniTag({ label }) {
  return (
    <div
      className="tc-chip-hover"
      style={{
        padding: "10px 14px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(15,23,42,0.06)",
        color: "#334155",
        fontWeight: 700,
        fontSize: "13px",
      }}
    >
      {label}
    </div>
  );
}