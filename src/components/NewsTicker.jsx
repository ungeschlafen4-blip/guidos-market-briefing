import React, { useEffect, useState } from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// NEWS TICKER v2 — Echte Live-Preise statt fester Texte
// Nimmt liveAssets als Prop entgegen (von App.jsx übergeben)
// ─────────────────────────────────────────────────────────────────────────────

// Statische Alert-Items bleiben (Termine, Kalender-Hinweise) — die ändern sich nicht stündlich
const STATIC_ALERTS = [
  { type:"alert", color:C.bear, text:"📅 CPI Juni am 14. Juli — wichtigster Makro-Event" },
  { type:"alert", color:C.textMid, text:"📅 FOMC 28.–29. Juli — möglicher erster Hike" },
];

export default function NewsTicker({ isMobile, liveAssets = [] }) {
  const [paused, setPaused] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlinkOn(b => !b), 800);
    return () => clearInterval(t);
  }, []);

  // Live-Preis-Items aus den übergebenen Assets bauen
  const priceItems = liveAssets.map(a => ({
    type: "price",
    color: a.chg24 >= 0 ? C.bull : C.bear,
    text: `${a.emoji} ${a.name.toUpperCase()}  ${a.unit}${a.price}  ${a.chg24 >= 0 ? "+" : ""}${a.chg24}%`,
  }));

  const allItems = [...priceItems, ...STATIC_ALERTS];
  const fullItems = allItems.length ? [...allItems, ...allItems] : [];

  return (
    <div style={{
      background: C.surface, border:`1px solid ${C.border}`, borderRadius:RADIUS.md,
      overflow:"hidden", marginBottom:18, display:"flex", alignItems:"center", height:42,
    }}>
      <div style={{ background:C.bg, borderRight:`1px solid ${C.border}`, padding:"0 14px", height:"100%", display:"flex", alignItems:"center", flexShrink:0, gap:6 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:C.bull, display:"inline-block", boxShadow:`0 0 6px ${C.bull}`, animation:"pulse 1.5s infinite" }} />
        <span style={{ fontSize:11, fontWeight:800, color:C.textMid, letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
          {isMobile ? "LIVE" : "LIVE TICKER"}
        </span>
      </div>

      <div style={{ overflow:"hidden", flex:1, position:"relative", cursor:"pointer" }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} title="Hover zum Anhalten">
        {fullItems.length === 0 ? (
          <div style={{ padding:"0 20px", fontSize:13, color:C.textLow }}>Lade Live-Preise...</div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", animation: paused ? "none" : "ticker 60s linear infinite", whiteSpace:"nowrap" }}>
            {fullItems.map((item, i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center" }}>
                <span style={{
                  fontSize:13, fontWeight: item.type==="alert" ? 700 : 700,
                  color: item.type==="alert" && blinkOn ? item.color : item.type==="alert" ? `${item.color}88` : item.color,
                  padding:"0 20px", fontFamily: item.type==="price" ? FONT.mono : FONT.sans,
                  transition:"color 0.3s",
                }}>{item.text}</span>
                <span style={{ color:C.textLow, fontSize:16, opacity:0.3 }}>·</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {paused && <div style={{ position:"absolute", right:14, fontSize:10, color:C.textLow, background:C.surface, padding:"2px 8px", borderRadius:4, pointerEvents:"none" }}>⏸ pausiert</div>}

      <style>{`
        @keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
      `}</style>
    </div>
  );
}
