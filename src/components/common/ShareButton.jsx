export default function ShareButton({ onClick, label, icon }) {
  return (
    <button
      className="tc-chip-hover"
      onClick={onClick}
      title={label}
      style={{
        minWidth: "112px",
        height: "52px",
        border: "1px solid rgba(15,23,42,0.06)",
        borderRadius: "18px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 800,
        color: "#111827",
        background: "rgba(255,255,255,0.82)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {icon && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "18px",
            height: "18px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}