import React, { useState } from "react";
import Modal from "./Modal";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// NEWS CARD v2 — Größer, luftiger, Pop-up Modal
// ─────────────────────────────────────────────────────────────────────────────

function NewsModal({ n, onClose }) {
  return (
    <Modal onClose={onClose} maxWidth={740} accentColor={n.impactCol || C.gold}>
      <div style={{ padding: "30px 36px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>{n.icon || "📰"}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, border: `1px solid ${C.gold}44`, borderRadius: 4, padding: "3px 10px", letterSpacing: "0.05em" }}>{n.tag}</span>
          <span style={{ fontSize: 12, color: C.textLow }}>{n.date}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: n.impactCol || C.gold, border: `1px solid ${(n.impactCol || C.gold)}44`, borderRadius: 4, padding: "3px 12px" }}>{n.impact || ""}</span>
        </div>

        <h2 style={{ fontFamily: FONT.serif, fontSize: 22, color: C.textHi, fontWeight: 700, lineHeight: 1.4, margin: "0 0 20px 0" }}>{n.title}</h2>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
          {n.full.split("\n").filter(Boolean).map((line, i) => {
            const isSection = line.startsWith("📌") || line.startsWith("📈") || line.startsWith("⚡");
            const isBullet = line.startsWith("•");
            return (
              <p key={i} style={{
                fontSize: isSection ? 14 : 13.5,
                fontWeight: isSection ? 700 : 400,
                color: isSection ? C.gold : isBullet ? C.textHi : C.textMid,
                lineHeight: 1.8, margin: 0,
                marginBottom: isSection ? 10 : 6,
                paddingLeft: isBullet ? 18 : 0,
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
          borderRadius: RADIUS.lg,
          padding: "20px 22px",
          cursor: "pointer",
          transition: "all 0.15s ease",
          transform: hovered ? "translateY(-2px)" : "none",
          boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Top Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{n.icon || "📰"}</span>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, border: `1px solid ${C.gold}44`, borderRadius: 4, padding: "2px 8px", letterSpacing: "0.05em" }}>{n.tag}</span>
              <span style={{ fontSize: 11, color: C.textLow, marginLeft: 10 }}>{n.date}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: n.impactCol || C.gold,
              border: `1px solid ${(n.impactCol || C.gold)}44`,
              borderRadius: 4, padding: "2px 9px",
            }}>{n.impact || ""}</span>
            <span style={{ fontSize: 14, color: hovered ? C.blue : C.textLow, transition: "color 0.15s" }}>
              {hovered ? "→" : "⊕"}
            </span>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontFamily: FONT.serif, fontSize: 16, color: C.textHi, fontWeight: 700, lineHeight: 1.45, marginBottom: 10 }}>
          {n.title}
        </div>

        {/* Summary */}
        <p style={{ fontSize: 13.5, color: C.textMid, lineHeight: 1.65, margin: 0, marginBottom: 12 }}>{n.summary}</p>

        {/* Read More */}
        <div style={{
          fontSize: 12,
          color: hovered ? C.blue : C.textLow,
          transition: "color 0.15s",
          display: "flex", alignItems: "center", gap: 5,
          paddingTop: 10, borderTop: `1px solid ${C.border}`,
        }}>
          {hovered ? "→ Vollständige Analyse mit Fachbegriff-Erklärungen öffnen" : "Klicken für vollständige Analyse + Erklärungen"}
        </div>
      </div>

      {open && <NewsModal n={n} onClose={() => setOpen(false)} />}
    </>
  );
}
