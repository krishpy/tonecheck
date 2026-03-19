import React from "react";
import { Link } from "react-router-dom";
import { MINI_TOOLS } from "../../config/miniTools";

export default function MiniToolGrid() {
  const [showMore, setShowMore] = React.useState(false);

  const featuredTools = [
    MINI_TOOLS["desperate-text-checker"],
    MINI_TOOLS["rude-or-polite"],
  ];

  const moreTools = [
    MINI_TOOLS["should-i-send-this"],
    MINI_TOOLS["passive-aggressive-detector"],
    MINI_TOOLS["manipulation-detector"],
  ];

  const toolRouteMap = {
    "should-i-send-this": "/should-i-send-this",
    "passive-aggressive-detector": "/passive-aggressive-text",
    "manipulation-detector": "/manipulative-text-checker",
    "rude-or-polite": "/is-this-message-rude",
    "desperate-text-checker": "/desperate-text-checker",
  };

  /*return (
    <div style={{ marginTop: "28px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: "#6366f1",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        Try other checks
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          lineHeight: 1.5,
          marginBottom: "14px",
        }}
      >
        Quick shortcuts for the most-used checks.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {featuredTools.map((tool) => (
          <Link
            key={tool.slug}
            to={toolRouteMap[tool.slug] || `/tools/${tool.slug}`}
            style={{
              textDecoration: "none",
              padding: "18px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(15,23,42,0.06)",
              boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
              color: "#0f172a",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#6366f1",
                textTransform: "uppercase",
              }}
            >
              {tool.eyebrow}
            </div>

            <div
              style={{
                marginTop: "7px",
                fontSize: "18px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              {tool.title}
            </div>

            <div
              style={{
                marginTop: "6px",
                color: "#475569",
                fontSize: "13px",
                lineHeight: 1.55,
              }}
            >
              {tool.description}
            </div>
          </Link>
        ))}

        <div
          onClick={() => setShowMore(!showMore)}
          style={{
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(99,102,241,0.05)",
            border: "1px dashed rgba(99,102,241,0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#4338ca",
            fontSize: "14px",
          }}
        >
          + More tools
        </div>
      </div> 

      {showMore && (
        <div
          style={{
            display: "grid",
            gap: "10px",
            marginTop: "14px",
          }}
        >
          {moreTools.map((tool) => (
            <Link
              key={tool.slug}
              to={toolRouteMap[tool.slug] || `/tools/${tool.slug}`}
              style={{
                textDecoration: "none",
                display: "block",
                padding: "13px 14px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.86)",
                border: "1px solid rgba(15,23,42,0.06)",
                color: "#0f172a",
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
              }}
            >
              {tool.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );*/
}