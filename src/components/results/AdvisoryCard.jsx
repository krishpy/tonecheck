export default function AdvisoryCard({ advisory, cardStyle }) {
  if (!advisory) return null;

  return (
    <div style={cardStyle}>
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          fontWeight: 800,
          letterSpacing: "0.08em",
        }}
      >
        💡 Why This Matters
      </div>

      <div style={{ marginTop: "12px", lineHeight: 1.8, fontSize: "18px" }}>
        {advisory}
      </div>
    </div>
  );
}