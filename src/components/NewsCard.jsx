import React, { useState } from "react";
import Modal from "./Modal";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// NEWS CARD + NEWS MODAL
// ─────────────────────────────────────────────────────────────────────────────

function NewsModal({ n, onClose }) {
  return (
    <Modal onClose={onClose} maxWidth={700} accentColor={n.impactCol || C.gold}>
      <div style={{ padding: "28px 32px 24px" }}>
        {/* Tag + Date */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 28 }}>{n.icon || "📰"}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: C.gold,
            border: `1px solid ${C.gold}44`, borderRadius: 4,
            padding: "2px 8px", letterSpacing: "0.05em",
          }}>{n.tag}</span>
          <span style={{ fontSize: 11, color: C.textLow }}>{n.date}</span>
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 700,
            color: n.impactCol || C.gold,
            border: `1px solid ${(n.impactCol || C.gold)}44`,
            borderRadius: 4, padding: "2px 10px",
          }}>{n.impact || ""}</span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: FONT.serif, fontSize: 20, color: C.textHi,
          fontWeight: 600, lineHeight: 1.4, margin: "0 0 16px 0",
        }}>{n.title}</h2>

        {/* Full Content */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          {n.full.split("\n").filter(Boolean).map((line, i) => {
            const isSection = line.startsWith("📌") || line.startsWith("📈") || line.startsWith("⚡");
            const isBullet = line.startsWith("•");
            const isSubBullet = line.startsWith("  •");
            return (
              <p key={i} style={{
                fontSize: isSection ? 13 : 12.5,
                fontWeight: isSection ? 700 : 400,
                color: isSection ? C.gold : isBullet || isSubBullet ? C.textHi : C.textMid,
                lineHeight: 1.75,
                margin: 0,
                marginBottom: isSection ? 8 : 5,
                paddingLeft: isBullet ? 16 : isSubBullet ? 28 : 0,
              }}>{line}</p>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

export default function NewsCard({ n }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? C.cardHov : C.card,
          border: `1px solid ${hovered ? C.borderHi : C.border}`,
          borderRadius: RADIUS.lg, padding: "16px 18px",
          cursor: "pointer",
          transition: "all 0.15s ease",
          transform: hovered ? "translateY(-2px)" : "none",
          boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Top Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{n.icon || "📰"}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: C.gold,
              border: `1px solid ${C.gold}44`, borderRadius: 4,
              padding: "1px 7px", letterSpacing: "0.05em",
            }}>{n.tag}</span>
            <span style={{ fontSize: 10, color: C.textLow }}>{n.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: n.impactCol || C.gold,
              border: `1px solid ${(n.impactCol || C.gold)}44`,
              borderRadius: 4, padding: "1px 7px",
            }}>{n.impact || ""}</span>
            <span style={{ fontSize: 12, color: hovered ? C.blue : C.textLow, transition: "color 0.15s" }}>
              {hovered ? "Öffnen →" : "⊕"}
            </span>
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: FONT.serif, fontSize: 14.5, color: C.textHi,
          fontWeight: 600, lineHeight: 1.45, marginBottom: 8,
        }}>{n.title}</div>

        {/* Summary */}
        <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, margin: 0 }}>{n.summary}</p>

        {/* Read More Hint */}
        <div style={{
          marginTop: 10, fontSize: 11,
          color: hovered ? C.blue : C.textLow,
          transition: "color 0.15s",
        }}>
          {hovered ? "→ Vollständige Analyse mit Fachbegriff-Erklärungen" : "Klicken für vollständige Analyse + Erklärungen"}
        </div>
      </div>

      {open && <NewsModal n={n} onClose={() => setOpen(false)} />}
    </>
  );
}
