import React, { useState } from "react";
import Modal from "./Modal";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// NEWS CARD v3 — Doppelt so großes Modal
// ─────────────────────────────────────────────────────────────────────────────

function NewsModal({ n, onClose }) {
  return (
    <Modal onClose={onClose} maxWidth={900} accentColor={n.impactCol || C.gold}>
      <div style={{ padding:"36px 44px 36px" }}>
        {/* Top Row */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          <span style={{ fontSize:40 }}>{n.icon || "📰"}</span>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:6 }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.gold, border:`1px solid ${C.gold}44`, borderRadius:5, padding:"3px 12px", letterSpacing:"0.05em" }}>{n.tag}</span>
              <span style={{ fontSize:13, color:C.textLow }}>{n.date}</span>
              <span style={{ marginLeft:"auto", fontSize:13, fontWeight:700, color:n.impactCol||C.gold, border:`1px solid ${(n.impactCol||C.gold)}44`, borderRadius:5, padding:"3px 14px" }}>{n.impact||""}</span>
            </div>
            <h2 style={{ fontFamily:FONT.serif, fontSize:26, color:C.textHi, fontWeight:700, lineHeight:1.4, margin:0 }}>
              {n.title}
            </h2>
          </div>
        </div>

        {/* Summary Box */}
        <div style={{ background:C.surface, borderRadius:RADIUS.md, padding:"16px 20px", marginBottom:22, border:`1px solid ${C.border}` }}>
          <p style={{ fontSize:16, color:C.textMid, lineHeight:1.7, margin:0, fontStyle:"italic" }}>{n.summary}</p>
        </div>

        {/* Full Content */}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:22 }}>
          {(n.full || "").split("\n").filter(Boolean).map((line, i) => {
            const isSection = line.startsWith("📌") || line.startsWith("📈") || line.startsWith("⚡");
            const isBullet  = line.startsWith("•");
            return (
              <p key={i} style={{
                fontSize:  isSection ? 16 : isBullet ? 15 : 15,
                fontWeight: isSection ? 700 : 400,
                color:      isSection ? C.gold : isBullet ? C.textHi : C.textMid,
                lineHeight: 1.85,
                margin: 0,
                marginBottom: isSection ? 12 : 7,
                paddingLeft: isBullet ? 22 : 0,
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
          padding: "22px 24px",
          cursor: "pointer",
          transition: "all 0.15s ease",
          transform: hovered ? "translateY(-2px)" : "none",
          boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Top Row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:26 }}>{n.icon || "📰"}</span>
            <div>
              <span style={{ fontSize:12, fontWeight:700, color:C.gold, border:`1px solid ${C.gold}44`, borderRadius:4, padding:"2px 9px", letterSpacing:"0.05em" }}>{n.tag}</span>
              <span style={{ fontSize:12, color:C.textLow, marginLeft:10 }}>{n.date}</span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <span style={{ fontSize:12, fontWeight:700, color:n.impactCol||C.gold, border:`1px solid ${(n.impactCol||C.gold)}44`, borderRadius:4, padding:"2px 9px" }}>{n.impact||""}</span>
            <span style={{ fontSize:16, color:hovered?C.blue:C.textLow, transition:"color 0.15s" }}>{hovered?"→":"⊕"}</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontFamily:FONT.serif, fontSize:17, color:C.textHi, fontWeight:700, lineHeight:1.45, marginBottom:10 }}>
          {n.title}
        </div>

        {/* Summary */}
        <p style={{ fontSize:14, color:C.textMid, lineHeight:1.65, margin:0, marginBottom:12 }}>{n.summary}</p>

        {/* Read More */}
        <div style={{ fontSize:13, color:hovered?C.blue:C.textLow, transition:"color 0.15s", paddingTop:10, borderTop:`1px solid ${C.border}` }}>
          {hovered ? "→ Vollständige Analyse mit Fachbegriff-Erklärungen öffnen" : "Klicken für vollständige Analyse + Erklärungen"}
        </div>
      </div>

      {open && <NewsModal n={n} onClose={() => setOpen(false)} />}
    </>
  );
}
