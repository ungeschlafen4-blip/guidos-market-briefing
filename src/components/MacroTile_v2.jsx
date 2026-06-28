import React, { useState } from "react";
import Modal from "./Modal";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// MACRO TILE v4 — Sauberer TradingView-Link-Button statt eingebettetem Widget
// ─────────────────────────────────────────────────────────────────────────────

export const MACRO_ASSETS = [
  { n:"S&P 500",    p:"7.354",  ch:-0.05, emoji:"📈", tvSymbol:"SP:SPX",      tvUrl:"https://www.tradingview.com/chart/?symbol=SP%3ASPX",     note:"Wichtigster US-Aktienindex. 500 größte US-Unternehmen.", wave:"Kämpft um 7.400 als Support nach KOSPI-Shock. PCE neutral." },
  { n:"Nasdaq 100", p:"22.180", ch:-0.40, emoji:"💻", tvSymbol:"NASDAQ:NDX",  tvUrl:"https://www.tradingview.com/chart/?symbol=NASDAQ%3ANDX",  note:"Tech-Index. Nvidia, Apple, Microsoft, Meta, Amazon.", wave:"AI-Chip-Sektor unter Druck. Micron-Beat gibt Entlastung." },
  { n:"WTI Öl",     p:"71,90",  ch:+0.30, emoji:"🛢️", tvSymbol:"NYMEX:CL1!",  tvUrl:"https://www.tradingview.com/chart/?symbol=NYMEX%3ACL1!",  note:"US-Rohölpreis. Iran-MOU drückte -40% vom Kriegspeak.", wave:"Stabilisiert nach Extremfall. Brent in Contango." },
  { n:"DXY Dollar", p:"101,6",  ch:+0.40, emoji:"💵", tvSymbol:"TVC:DXY",     tvUrl:"https://www.tradingview.com/chart/?symbol=TVC%3ADXY",     note:"US-Dollar-Index. Steigt = Druck auf Gold & Krypto.", wave:"Über 101. Warsh-Fed hawkish. Sep-Hike 63%." },
  { n:"10Y Yield",  p:"4,46%",  ch:+0.02, emoji:"📊", tvSymbol:"TVC:US10Y",   tvUrl:"https://www.tradingview.com/chart/?symbol=TVC%3AUS10Y",   note:"US 10-Jahres-Staatsanleihe. Wichtigster Zins-Indikator.", wave:"Über 4,4%. Druck auf Growth-Assets und Krypto." },
  { n:"VIX",        p:"18,89",  ch:-1.20, emoji:"🌡️", tvSymbol:"CBOE:VIX",    tvUrl:"https://www.tradingview.com/chart/?symbol=CBOE%3AVIX",    note:"Volatilitäts-Index. Unter 20 = ruhig. Über 30 = Panik.", wave:"Normalisiert nach KOSPI-Spike. Unter 20 = Beruhigung." },
];

function MacroModal({ m, onClose }) {
  return (
    <Modal onClose={onClose} maxWidth={600} accentColor={C.blue}>
      <div style={{ padding:"28px 32px 26px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <span style={{ fontSize:44 }}>{m.emoji}</span>
          <div>
            <div style={{ fontSize:14, color:C.textLow, marginBottom:4 }}>{m.n}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
              <span style={{ fontSize:36, fontWeight:700, color:C.textHi, fontFamily:FONT.mono }}>{m.p}</span>
              <span style={{ fontSize:20, fontWeight:700, color:m.ch>=0?C.bull:C.bear }}>
                {m.ch>=0?"▲":"▼"} {Math.abs(m.ch)}%
              </span>
            </div>
          </div>
        </div>

        {/* Technische Einschätzung */}
        <div style={{ background:C.surface, borderRadius:RADIUS.md, padding:"16px 20px", marginBottom:18, border:`1px solid ${C.gold}33` }}>
          <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Technische Einschätzung</div>
          <p style={{ fontSize:15, color:C.textMid, lineHeight:1.7, margin:0 }}>{m.wave}</p>
        </div>

        {/* Info */}
        <p style={{ fontSize:14, color:C.textLow, lineHeight:1.6, marginBottom:24 }}>{m.note}</p>

        {/* TradingView Button — groß und klar */}
        <a href={m.tvUrl} target="_blank" rel="noopener noreferrer" style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:12,
          background:C.blue, color:"#fff", textDecoration:"none",
          padding:"16px 32px", borderRadius:RADIUS.md,
          fontSize:16, fontWeight:700, letterSpacing:"0.02em",
          boxShadow:`0 4px 20px ${C.blue}44`,
          transition:"all 0.15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.background="#2563eb"}
          onMouseLeave={e=>e.currentTarget.style.background=C.blue}
        >
          📊 {m.n} auf TradingView öffnen →
        </a>
      </div>
    </Modal>
  );
}

export default function MacroTile({ m }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        onClick={()=>setOpen(true)}
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        style={{
          background:hovered?C.cardHov:C.card,
          border:`1px solid ${hovered?C.borderHi:C.border}`,
          borderRadius:RADIUS.md, padding:"16px 18px",
          cursor:"pointer", transition:"all 0.15s",
          transform:hovered?"translateY(-2px)":"none",
          boxShadow:hovered?"0 6px 20px rgba(0,0,0,0.4)":"none",
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>{m.emoji}</span>
              <span style={{ fontSize:14, fontWeight:600, color:C.textMid }}>{m.n}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:C.textHi, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono }}>{m.p}</div>
            <div style={{ fontSize:15, fontWeight:700, color:m.ch>=0?C.bull:C.bear, marginTop:4 }}>
              {m.ch>=0?"▲":"▼"} {Math.abs(m.ch)}%
            </div>
          </div>
          <span style={{ fontSize:13, color:hovered?C.blue:C.textLow, transition:"color 0.15s", marginTop:4, fontWeight:600 }}>
            {hovered?"→ Chart":"⊕"}
          </span>
        </div>
        <div style={{ fontSize:12, color:C.textLow, marginTop:10, lineHeight:1.5 }}>{m.note}</div>
      </div>

      {open && <MacroModal m={m} onClose={()=>setOpen(false)} />}
    </>
  );
}
