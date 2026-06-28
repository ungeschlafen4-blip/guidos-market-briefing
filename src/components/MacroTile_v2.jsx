import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import TVWidget from "./TVWidget";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// MACRO TILE v3 — TradingView Widget direkt eingebettet im Modal
// ─────────────────────────────────────────────────────────────────────────────

export const MACRO_ASSETS = [
  { n:"S&P 500",    p:"7.354",  ch:-0.05, emoji:"📈", tvSymbol:"SP:SPX",       note:"Wichtigster US-Aktienindex. 500 größte US-Unternehmen.", wave:"Nach PCE-Daten stabil. Kämpft um 7.400 als Support nach KOSPI-Shock." },
  { n:"Nasdaq 100", p:"22.180", ch:-0.40, emoji:"💻", tvSymbol:"NASDAQ:NDX",   note:"Tech-Index. Nvidia, Apple, Microsoft, Meta, Amazon.", wave:"AI-Chip-Sektor unter Druck. Micron-Beat gibt Entlastung. Schlüsselunterstützung 21.800." },
  { n:"WTI Öl",     p:"71,90",  ch:+0.30, emoji:"🛢️", tvSymbol:"NYMEX:CL1!",   note:"US-Rohölpreis. Iran-MOU drückte Preis -40% vom Kriegspeak.", wave:"Stabilisiert nach Extremfall. Brent in Contango. Vor-Kriegs-Niveau erreicht." },
  { n:"DXY Dollar", p:"101,6",  ch:+0.40, emoji:"💵", tvSymbol:"TVC:DXY",      note:"US-Dollar-Index. Steigt = Druck auf Gold, Krypto, Emerging Markets.", wave:"DXY über 101. Hawkisher Warsh-Fed treibt Dollar. Sep-Hike 63% eingepreist." },
  { n:"10Y Yield",  p:"4,46%",  ch:+0.02, emoji:"📊", tvSymbol:"TVC:US10Y",    note:"US 10-Jahres-Staatsanleihe. Wichtigster Zins-Indikator.", wave:"Yield über 4,4%. Kreditkosten steigen. Druck auf Growth-Assets und Krypto." },
  { n:"VIX",        p:"18,89",  ch:-1.20, emoji:"🌡️", tvSymbol:"CBOE:VIX",     note:"Volatilitäts-Index. Unter 20 = ruhig. Über 30 = Panik-Zone.", wave:"Normalisiert nach KOSPI-Spike. Unter 20 signalisiert beruhigten Markt." },
];

function MacroModal({ m, onClose }) {
  return (
    <Modal onClose={onClose} maxWidth={740} accentColor={C.blue}>
      <div style={{ padding:"24px 28px 22px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
          <span style={{ fontSize:40 }}>{m.emoji}</span>
          <div>
            <div style={{ fontSize:13, color:C.textLow, marginBottom:4 }}>{m.n}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
              <span style={{ fontSize:34, fontWeight:700, color:C.textHi, fontFamily:FONT.mono }}>{m.p}</span>
              <span style={{ fontSize:20, fontWeight:700, color:m.ch>=0?C.bull:C.bear }}>
                {m.ch>=0?"▲":"▼"} {Math.abs(m.ch)}%
              </span>
            </div>
          </div>
        </div>

        {/* Wave/Technisch */}
        <div style={{ background:C.surface, borderRadius:RADIUS.md, padding:"14px 18px", marginBottom:16, border:`1px solid ${C.gold}33` }}>
          <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Technische Einschätzung</div>
          <p style={{ fontSize:14, color:C.textMid, lineHeight:1.65, margin:0 }}>{m.wave}</p>
        </div>

        {/* TradingView Live-Widget — echte Kerzen */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:11, color:C.textLow, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.bull, display:"inline-block", animation:"pulse 1.5s infinite" }} />
            TradingView Live-Chart
          </div>
          <TVWidget symbol={m.tvSymbol} height={360} interval="D" />
        </div>

        <div style={{ marginTop:12, fontSize:13, color:C.textLow }}>{m.note}</div>

        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
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
          background: hovered ? C.cardHov : C.card,
          border:`1px solid ${hovered?C.borderHi:C.border}`,
          borderRadius:RADIUS.md, padding:"16px 18px",
          cursor:"pointer", transition:"all 0.15s",
          transform: hovered?"translateY(-2px)":"none",
          boxShadow: hovered?"0 6px 20px rgba(0,0,0,0.4)":"none",
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>{m.emoji}</span>
              <span style={{ fontSize:14, fontWeight:600, color:C.textMid }}>{m.n}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:C.textHi, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono }}>
              {m.p}
            </div>
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
