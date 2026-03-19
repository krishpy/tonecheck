import React from "react";


export default function HeroSection({
  location,
  navigate,
  currentTool,
  message,
  setMessage,
  setResult,
  setCopyState,
  analyze,
  loading,
  setExample,
  heroCardStyle,
  chipStyle,
  actionButtonStyle,
  primaryButtonStyle,
}) {
  const glassOrb1 = {
    position: "absolute",
    top: "-90px",
    right: "-70px",
    width: "300px",
    height: "300px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(99,102,241,0.24), rgba(99,102,241,0) 70%)",
    pointerEvents: "none",
    filter: "blur(6px)",
  };

  const glassOrb2 = {
    position: "absolute",
    bottom: "-110px",
    left: "-70px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(236,72,153,0.20), rgba(236,72,153,0) 70%)",
    pointerEvents: "none",
    filter: "blur(8px)",
  };

  const glassOrb3 = {
    position: "absolute",
    top: "35%",
    left: "42%",
    transform: "translate(-50%, -50%)",
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(56,189,248,0.15), rgba(56,189,248,0) 72%)",
    pointerEvents: "none",
    filter: "blur(8px)",
  };

  return (
    <div className="tc-hero" style={heroCardStyle}>
      <div className="tc-light-sweep"></div>
      <div style={glassOrb1} />
      <div style={glassOrb2} />
      <div style={glassOrb3} />

      <div style={{ marginBottom: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          className="tc-chip-hover"
          onClick={() => navigate("/")}
          style={{ ...chipStyle, background: "rgba(255,255,255,0.82)" }}
        >
          Home
        </button>

        {location.pathname !== "/" && (
          <div
            style={{
              ...chipStyle,
              background: "rgba(99,102,241,0.10)",
              color: "#4338ca",
              cursor: "default",
            }}
          >
            {currentTool.title}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "14px",
            flexWrap: "wrap",
          }}
        >
          <div
            className="tc-logo-glow"
            style={{
              position: "relative",
              width: "74px",
              height: "74px",
              borderRadius: "24px",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.96), rgba(236,72,153,0.92))",
              boxShadow:
                "0 14px 38px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.36)",
              border: "1px solid rgba(255,255,255,0.28)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "8px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            />
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "baseline",
                gap: "1px",
                color: "#ffffff",
                fontWeight: 900,
                letterSpacing: "-0.08em",
                textShadow: "0 2px 10px rgba(0,0,0,0.16)",
              }}
            >
              <span style={{ fontSize: "28px", lineHeight: 1 }}>T</span>
              <span style={{ fontSize: "30px", lineHeight: 1 }}>✓</span>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.22em",
                color: "#6366f1",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              {currentTool.eyebrow}
            </div>

            <h1
              className="tc-title tc-shimmer"
              style={{
                margin: 0,
                fontSize: "76px",
                lineHeight: 0.92,
                letterSpacing: "-0.09em",
                fontWeight: 950,
                background:
                  "linear-gradient(135deg, #0f172a 0%, #312e81 30%, #7c3aed 62%, #ec4899 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {location.pathname === "/" ? "ToneCheck" : currentTool.title}
            </h1>
          </div>
        </div>

        <p
         style={{
            margin: "10px 0 0 0",
            maxWidth: "760px",
            color: "#475569",
            fontSize: "20px",
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          {currentTool.description}
        </p>
      </div>

      <div
        style={{
          marginTop: "22px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {currentTool.examples.map((example) => (
          <button
            key={example.label}
            className="tc-chip-hover"
            style={{ ...chipStyle, background: "rgba(255,255,255,0.78)" }}
            onClick={() => setExample(example.text)}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "24px", position: "relative" }}>
        <textarea
          className="tc-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={currentTool.placeholder}
          style={{
            width: "100%",
            minHeight: "240px",
            padding: "24px 24px 72px",
            fontSize: "24px",
            lineHeight: 1.6,
            borderRadius: "28px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86))",
            color: "#0f172a",
            border: "1px solid rgba(99,102,241,0.10)",
            boxSizing: "border-box",
            outline: "none",
            resize: "vertical",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.86), 0 14px 34px rgba(15,23,42,0.04)",
          }}
        />

 

        <div
          style={{
            position: "absolute",
            right: "16px",
            bottom: "16px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="tc-button-hover"
            onClick={() => {
              setMessage("");
              setResult(null);
              setCopyState("");
            }}
            style={actionButtonStyle}
          >
            Clear
          </button>

          <button
            className="tc-button-hover"
            onClick={analyze}
            disabled={loading || !message.trim()}
            style={{
              ...primaryButtonStyle,
              opacity: loading || !message.trim() ? 0.7 : 1,
            }}
          >
            {loading ? "Analyzing..." : currentTool.analyzeLabel}
          </button>
        </div>
      </div>
             <div
  style={{
    marginTop: "14px",
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(71,85,105,0.78)",
    letterSpacing: "0.01em",
  }}
>
  Used before sending by thousands of messages every week
   </div>
   <div
  style={{
    marginTop: "14px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  <div
    style={{
      padding: "10px 14px",
      borderRadius: "999px",
      background: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.20)",
      color: "#b45309",
      fontSize: "13px",
      fontWeight: 700,
    }}
  >
    ⚠️ May sound: passive aggressive
  </div>

  <div
    style={{
      padding: "10px 14px",
      borderRadius: "999px",
      background: "rgba(59,130,246,0.10)",
      border: "1px solid rgba(59,130,246,0.20)",
      color: "#1d4ed8",
      fontSize: "13px",
      fontWeight: 700,
    }}
  >
    💬 Reply chance: low
  </div>

  <div
    style={{
      padding: "10px 14px",
      borderRadius: "999px",
      background: "rgba(236,72,153,0.10)",
      border: "1px solid rgba(236,72,153,0.20)",
      color: "#be185d",
      fontSize: "13px",
      fontWeight: 700,
    }}
  >
    😬 Regret risk: high
  </div>
</div>
    </div>
  );
}