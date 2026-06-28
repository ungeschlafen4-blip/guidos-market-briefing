import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import LiveChart from "./LiveChart";
import { C, FONT, RADIUS, BIAS_COL, DIR_ICON } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// ASSET CARD v5
// - Live Candlestick Chart mit Elliott-Wellen-Labels
// - Kein eingebettetes TV-Widget — sauberer Link-Button zu deinem Chart
// - Warum steigt/fällt + Wellen-Position im Modal
// ─────────────────────────────────────────────────────────────────────────────

function FocusModal({ asset: a, onClose }) {
  const [view, setView] = useState("live");
  const bc = BIAS_COL[a.bias] || C.gold;
  const dirReason = a.chg24 > 0
    ? { icon:"📈", color:C.bull,  label:"Aktuell steigend — Warum?" }
    : a.chg24 < 0
    ? { icon:"📉", color:C.bear,  label:"Aktuell fallend — Warum?" }
    : { icon:"➡️", color:C.gold,  label:"Seitwärts — Warum?" };

  return (
    <Modal onClose={onClose} maxWidth={1020} accentColor={bc}>
      <div style={{ padding:"28px 36px 28px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:22 }}>
          <span style={{ fontSize:46, lineHeight:1 }}>{a.emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <h2 style={{ fontFamily:FONT.serif, fontSize:30, color:C.textHi, margin:0 }}>{a.name}</h2>
              <span style={{ fontSize:13, color:C.textLow }}>{a.ticker}</span>
              <span style={{ fontSize:12, fontWeight:700, color:bc, border:`1px solid ${bc}44`, borderRadius:5, padding:"3px 12px" }}>
                {DIR_ICON[a.bias]} {a.bias==="bull"?"BULLISH":a.bias==="bear"?"BEARISH":"NEUTRAL"}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:14, marginTop:8 }}>
              <span style={{ fontSize:40, fontWeight:700, color:C.textHi, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono }}>{a.unit}{a.price}</span>
              <span style={{ fontSize:17, fontWeight:700, color:a.chg24>=0?C.bull:C.bear }}>{a.chg24>=0?"+":""}{a.chg24}% 24h</span>
              <span style={{ fontSize:14, fontWeight:600, color:a.chg7>=0?C.bull:C.bear }}>{a.chg7>=0?"+":""}{a.chg7}% 7D</span>
            </div>
          </div>
        </div>

        {/* Chart Tabs — OBEN */}
        <div style={{ display:"flex", gap:6, marginBottom:14 }}>
          {[["live","Live Kerzen + Elliott-Wellen"],["tv","Mein TradingView-Chart öffnen"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{
              flex:1, padding:"10px 0",
              background:view===v?C.surface:"transparent",
              border:view===v?`1px solid ${C.gold}55`:`1px solid ${C.border}`,
              borderRadius:RADIUS.sm, color:view===v?C.gold:C.textMid,
              fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
            }}>{l}</button>
          ))}
        </div>

        {/* Live Chart mit Elliott-Wellen */}
        {view==="live" && (
          <div style={{ border:`1px solid ${C.border}`, borderRadius:RADIUS.md, overflow:"hidden", padding:"8px 4px", background:C.surface, marginBottom:18 }}>
            <LiveChart assetId={a.id} unit={a.unit} h={400} interval="1h" waveLabels={a.waveLabels} />
          </div>
        )}

        {/* TradingView Link — sauber und groß */}
        {view==="tv" && (
          <div style={{
            background:C.surface, borderRadius:RADIUS.lg,
            border:`1px solid ${bc}44`,
            padding:"40px 30px",
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:20, marginBottom:18,
            minHeight:280,
          }}>
            <span style={{ fontSize:60 }}>{a.emoji}</span>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:700, color:C.textHi, marginBottom:8 }}>
                Dein gespeicherter TradingView-Chart
              </div>
              <div style={{ fontSize:14, color:C.textMid, marginBottom:24, lineHeight:1.6 }}>
                Mit deiner Wellenzählung, Fibonacci-Levels und Indikatoren.<br/>
                Öffnet in neuem Tab.
              </div>
              <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{
                display:"inline-flex", alignItems:"center", gap:10,
                background:C.blue, color:"#fff", textDecoration:"none",
                padding:"14px 36px", borderRadius:RADIUS.md,
                fontSize:16, fontWeight:700, letterSpacing:"0.02em",
                boxShadow:`0 4px 20px ${C.blue}44`,
              }}>
                📊 {a.ticker} Chart öffnen →
              </a>
            </div>
          </div>
        )}

        {/* Warum steigt/fällt es */}
        <div style={{ background:C.surface, border:`1px solid ${dirReason.color}33`, borderRadius:RADIUS.lg, padding:"18px 22px", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <span style={{ fontSize:22 }}>{dirReason.icon}</span>
            <span style={{ fontSize:15, fontWeight:800, color:dirReason.color }}>{dirReason.label}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(a.reasons||[]).map((r,i)=>(
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{r.icon}</span>
                <div>
                  <span style={{ fontSize:14, fontWeight:700, color:r.col||C.textHi }}>{r.title}: </span>
                  <span style={{ fontSize:14, color:C.textMid, lineHeight:1.65 }}>{r.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Elliott-Wellen-Position */}
        <div style={{ background:C.surface, border:`1px solid ${C.gold}33`, borderRadius:RADIUS.lg, padding:"16px 20px", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <span style={{ fontSize:20 }}>〰️</span>
            <span style={{ fontSize:15, fontWeight:800, color:C.gold }}>Elliott-Wellen-Position</span>
            <span style={{ fontSize:13, color:C.textMid, marginLeft:"auto" }}>{a.waveStructure}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            <div style={{ background:C.bg, borderRadius:RADIUS.md, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:C.textLow, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>Aktuelle Welle</div>
              <div style={{ fontSize:24, fontWeight:800, color:C.gold, fontFamily:FONT.mono }}>{a.currentWave||"?"}</div>
            </div>
            <div style={{ background:C.bg, borderRadius:RADIUS.md, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:C.textLow, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>Nächste mögliche Wellen</div>
              <div style={{ fontSize:15, fontWeight:700, color:C.textMid }}>{a.nextWaves||"Abwarten"}</div>
            </div>
          </div>
          <p style={{ fontSize:14, color:C.textMid, lineHeight:1.75, margin:0 }}>{a.waveDetail}</p>
        </div>

        {/* Key Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
          {(a.keyStats||[]).map(([k,v],i)=>(
            <div key={i} style={{ background:C.surface, borderRadius:RADIUS.md, padding:"12px 14px" }}>
              <div style={{ fontSize:10, color:C.textLow, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>{k}</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.textHi, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function AssetCard({ a }) {
  const [focused, setFocused] = useState(false);
  const bc = BIAS_COL[a.bias] || C.gold;

  return (
    <>
      <div style={{
        background:C.card, border:`1px solid ${C.border}`,
        borderRadius:RADIUS.lg, padding:"20px 22px 16px",
        transition:"border-color 0.15s",
      }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=bc}
        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
      >
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:22 }}>{a.emoji}</span>
              <span style={{ fontFamily:FONT.serif, fontSize:21, fontWeight:700, color:C.textHi }}>{a.name}</span>
              <span style={{ fontSize:12, color:C.textLow }}>{a.ticker}</span>
              <span style={{ fontSize:12, fontWeight:700, color:bc, border:`1px solid ${bc}44`, borderRadius:4, padding:"2px 9px" }}>
                {DIR_ICON[a.bias]} {a.bias==="bull"?"BULL":a.bias==="bear"?"BEAR":"NEUTRAL"}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:12 }}>
              <span style={{ fontSize:30, fontWeight:700, color:C.textHi, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono }}>{a.unit}{a.price}</span>
              <span style={{ fontSize:16, fontWeight:700, color:a.chg24>=0?C.bull:C.bear }}>{a.chg24>=0?"+":""}{a.chg24}% 24h</span>
              <span style={{ fontSize:14, fontWeight:600, color:a.chg7>=0?C.bull:C.bear }}>{a.chg7>=0?"+":""}{a.chg7}% 7D</span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
            <button onClick={()=>setFocused(true)} style={{
              background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:RADIUS.sm, padding:"8px 16px",
              color:C.textMid, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=bc; e.currentTarget.style.color=bc; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textMid; }}
            >⊕ Detail & Analyse</button>
            <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{
              display:"inline-flex", alignItems:"center", gap:5,
              background:"transparent", border:`1px solid ${C.blue}44`,
              borderRadius:RADIUS.sm, padding:"6px 12px",
              color:C.blue, fontSize:11, fontWeight:600, textDecoration:"none",
              transition:"all 0.15s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background="#0d1a2a"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${C.blue}44`; e.currentTarget.style.background="transparent"; }}
            >📊 TV Chart</a>
          </div>
        </div>

        {/* Live Candlestick Chart */}
        <div style={{ border:`1px solid ${C.border}`, borderRadius:RADIUS.md, overflow:"hidden", padding:"6px 2px", background:C.surface }}>
          <LiveChart assetId={a.id} unit={a.unit} h={240} interval="1h" waveLabels={a.waveLabels} />
        </div>

        {/* Wave Label + erster Grund */}
        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.gold, lineHeight:1.4, marginBottom:6 }}>{a.wave}</div>
          {a.reasons?.[0] && (
            <div style={{ fontSize:13, color:C.textMid, display:"flex", gap:6 }}>
              <span>{a.reasons[0].icon}</span>
              <span><strong style={{color:C.textHi}}>{a.reasons[0].title}:</strong> {a.reasons[0].text}</span>
            </div>
          )}
        </div>
      </div>

      {focused && <FocusModal asset={a} onClose={()=>setFocused(false)} />}
    </>
  );
}
