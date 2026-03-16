import React from "react";
import MiniToolGrid from "./MiniToolGrid";

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
  return (
    <div className="tc-hero" style={heroCardStyle}>

      {/* TITLE AREA */}
      <h1>{location.pathname === "/" ? "ToneCheck" : currentTool.title}</h1>

      {/* EXAMPLE CHIPS */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {currentTool.examples.map((example) => (
          <button
            key={example.label}
            style={chipStyle}
            onClick={() => setExample(example.text)}
          >
            {example.label}
          </button>
        ))}
      </div>

      {/* TEXTAREA */}
      <div style={{ marginTop: "24px" }}>
        <textarea
          className="tc-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={currentTool.placeholder}
          style={{
            width: "100%",
            minHeight: "240px",
            padding: "24px",
            fontSize: "24px",
            borderRadius: "28px",
          }}
        />
      </div>

      {/* BUTTONS */}
      <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
        <button
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
          onClick={analyze}
          disabled={loading || !message.trim()}
          style={primaryButtonStyle}
        >
          {loading ? "Analyzing..." : currentTool.analyzeLabel}
        </button>
      </div>

      {location.pathname === "/" && (
        <div style={{ marginTop: "28px" }}>
          <MiniToolGrid />
        </div>
      )}
    </div>
  );
}