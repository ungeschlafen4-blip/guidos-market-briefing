import React, { useState } from "react";
import Modal from "./Modal";
import UnifiedChart from "./UnifiedChart";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// MACRO TILE v5 — 7-Tage Chart im Modal + TradingView Link
// ─────────────────────────────────────────────────────────────────────────────

export const MACRO_ASSETS = [
  {
    id:"spx",  n:"S&P 500",    p:"7.354",  ch:-0.05, emoji:"📈", unit:"",   decimals:0,
    tvUrl:"https://www.tradingview.com/chart/?symbol=SP%3ASPX",
    note:"Wichtigster US-Aktienindex. 500 größte US-Unternehmen.",
    wave:"Kämpft um 7.400 als Support nach KOSPI-Shock. PCE-Daten neutral.",
    analysis:"S&P 500 kämpft nach dem KOSPI-induzierten Selloff (-10% Korea) um 7.400 als Schlüsselsupport. Micron-Beat (+14,6% AH) gibt Tech-Sektor Entlastung. Wochenschluss 7.354. PCE war neutral → kein weiterer Fed-Schock. VIX unter 20 = moderates Risiko.",
  },
  {
    id:"ndx",  n:"Nasdaq 100", p:"22.180", ch:-0.40, emoji:"💻", unit:"",   decimals:0,
    tvUrl:"https://www.tradingview.com/chart/?symbol=NASDAQ%3ANDX",
    note:"Tech-Index. Nvidia, Apple, Microsoft, Meta, Amazon.",
    wave:"AI-Chip-Sektor unter Druck nach KOSPI. Micron-Beat als Gegenpol.",
    analysis:"Nasdaq -2,2% diese Woche nach KOSPI-Chip-Selloff (Samsung/SK Hynix -12%). Micron-Beat dreht das Narrativ: AI-CAPEX-Thesis bestätigt. Schlüsselunterstützung 21.800. Nvidia-Earnings August als nächster Katalysator.",
  },
  {
    id:"wti",  n:"WTI Öl",     p:"71,90",  ch:+0.30, emoji:"🛢️", unit:"$",  decimals:2,
    tvUrl:"https://www.tradingview.com/chart/?symbol=NYMEX%3ACL1!",
    note:"US-Rohölpreis. Iran-MOU drückte -40% vom Kriegspeak.",
    wave:"Stabilisiert nach Extremfall. Brent in Contango. Vor-Kriegs-Niveau.",
    analysis:"WTI fiel von >$100 (Kriegspeak) auf $71,90 nach US-Iran-MOU. Hormuz wieder offen. UAE exportiert 85% des Normalniveaus. Öl-Deflation dämpft CPI → positive Auswirkung auf Inflation und damit Fed-Zinspfad. Brent in Contango (bearish Signal).",
  },
  {
    id:"dxy",  n:"DXY Dollar", p:"101,6",  ch:+0.40, emoji:"💵", unit:"",   decimals:2,
    tvUrl:"https://www.tradingview.com/chart/?symbol=TVC%3ADXY",
    note:"US-Dollar-Index. Steigt = Druck auf Gold, Krypto, EM.",
    wave:"Über 101. Warsh-Fed hawkish. Sep-Hike 63% eingepreist.",
    analysis:"DXY über 101 — getrieben durch hawkishen Fed-Chair Warsh. Sep-Hike 63%, Dez 80%. Starker Dollar drückt Gold, Krypto und Emerging Markets. Wenn CPI 14. Juli überraschend niedrig → DXY fällt → Risk-on in Krypto.",
  },
  {
    id:"us10y",n:"10Y Yield",  p:"4,46%",  ch:+0.02, emoji:"📊", unit:"",   decimals:2,
    tvUrl:"https://www.tradingview.com/chart/?symbol=TVC%3AUS10Y",
    note:"US 10-Jahres-Staatsanleihe. Wichtigster Zins-Indikator.",
    wave:"Über 4,4%. Druck auf Growth-Assets und Krypto.",
    analysis:"10Y-Yield bei 4,46% — höchster Stand seit März. Direkte Auswirkung: teurerer Kredit, weniger Risikobereitschaft, Druck auf BTC/ETH und Growth-Aktien. Bei Yield-Rückgang unter 4,2% → strukturell bullisch für Krypto.",
  },
  {
    id:"vix",  n:"VIX",        p:"18,89",  ch:-1.20, emoji:"🌡️", unit:"",   decimals:2,
    tvUrl:"https://www.tradingview.com/chart/?symbol=CBOE%3AVIX",
    note:"Volatilitäts-Index. Unter 20 = ruhig. Über 30 = Panik.",
    wave:"Normalisiert nach KOSPI-Spike. Unter 20 = Beruhigung.",
    analysis:"VIX von ~25 (KOSPI-Panik) auf 18,89 normalisiert. Unter 20 = Markt ist relativ entspannt. Über 25 = erhöhte Absicherungsnachfrage. Aktuell: kein Panic-Modus mehr, aber auch kein Euphorie (wäre unter 15).",
  },
];

function MacroModal({ m, onClose }) {
  const [view, setView] = useState("chart");

  return (
    <Modal onClose={onClose} maxWidth={800} accentColor={C.blue}>
      <div style={{ padding:"28px 32px 26px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <span style={{ fontSize:44 }}>{m.emoji}</span>
          <div>
            <div style={{ fontSize:13, color:C.textLow, marginBottom:4 }}>{m.n}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
              <span style={{ fontSize:36, fontWeight:700, color:C.textHi, fontFamily:FONT.mono }}>{m.unit}{m.p}</span>
              <span style={{ fontSize:20, fontWeight:700, color:m.ch>=0?C.bull:C.bear }}>
                {m.ch>=0?"▲":"▼"} {Math.abs(m.ch)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:14 }}>
          {[["chart","7-Tage Chart"],["analysis","Marktanalyse"],["tv","TradingView öffnen"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{
              flex:1, padding:"9px 0",
              background:view===v?C.surface:"transparent",
              border:view===v?`1px solid ${C.gold}55`:`1px solid ${C.border}`,
              borderRadius:RADIUS.sm, color:view===v?C.gold:C.textMid,
              fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
            }}>{l}</button>
          ))}
        </div>

        {/* 7-Tage Chart */}
        {view==="chart" && (
          <div style={{ border:`1px solid ${C.border}`, borderRadius:RADIUS.md, overflow:"hidden", padding:"8px 4px", background:C.surface, marginBottom:16 }}>
            <UnifiedChart assetId={m.id} unit={m.unit} h={360} />
          </div>
        )}

        {/* Analyse */}
        {view==="analysis" && (
          <div style={{ marginBottom:16 }}>
            <div style={{ background:C.surface, borderRadius:RADIUS.md, padding:"16px 20px", marginBottom:14, border:`1px solid ${C.gold}33` }}>
              <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Technische Einschätzung</div>
              <p style={{ fontSize:14, color:C.textMid, lineHeight:1.7, margin:0 }}>{m.wave}</p>
            </div>
            <div style={{ background:C.surface, borderRadius:RADIUS.md, padding:"16px 20px", border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, color:C.blue, fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Vollständige Analyse</div>
              <p style={{ fontSize:14, color:C.textMid, lineHeight:1.75, margin:0 }}>{m.analysis}</p>
            </div>
          </div>
        )}

        {/* TradingView Link */}
        {view==="tv" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, padding:"40px 20px", background:C.surface, borderRadius:RADIUS.lg, border:`1px solid ${C.blue}44`, marginBottom:16 }}>
            <span style={{ fontSize:52 }}>{m.emoji}</span>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color:C.textHi, marginBottom:8 }}>{m.n} auf TradingView</div>
              <div style={{ fontSize:14, color:C.textMid, marginBottom:24 }}>Live-Kerzen · Indikatoren · Vollständiger Chart</div>
              <a href={m.tvUrl} target="_blank" rel="noopener noreferrer" style={{
                display:"inline-flex", alignItems:"center", gap:10,
                background:C.blue, color:"#fff", textDecoration:"none",
                padding:"14px 36px", borderRadius:RADIUS.md, fontSize:16, fontWeight:700,
                boxShadow:`0 4px 20px ${C.blue}44`,
              }}>📊 {m.n} öffnen →</a>
            </div>
          </div>
        )}

        <div style={{ fontSize:13, color:C.textLow }}>{m.note}</div>
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
            <div style={{ fontSize:22, fontWeight:700, color:C.textHi, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono }}>{m.unit}{m.p}</div>
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
