import React, { useState } from "react";
import Modal from "./Modal";
import UnifiedChart from "./UnifiedChart";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// TRADE CARD v2
// - Großes Detail-Modal mit übergeordneter Elliott-Struktur
// - 4-Wochen-Chart pro Asset
// - "Was kommt als nächstes?" Wellen-Vorschau
// ─────────────────────────────────────────────────────────────────────────────

// Asset-ID Mapping für Charts
const ASSET_CHART_ID = {
  "Solana":"sol", "Bitcoin":"btc", "Ethereum":"eth",
  "Gold":"gold", "Silber":"silver", "S&P 500":"spx", "Nasdaq 100":"ndx",
};

// Wellen-Farben
const WAVE_STATUS_COL = { "läuft":C.bull, "kommt":C.gold, "später":C.textMid };
const WAVE_STATUS_ICON = { "läuft":"●", "kommt":"○", "später":"·" };

// ── ÜBERGEORDNETES WELLEN-MODAL ───────────────────────────────────────────────
function BigPictureModal({ g, onClose }) {
  const bp = g.bigPicture;
  const chartId = ASSET_CHART_ID[g.asset] || "btc";

  return (
    <Modal onClose={onClose} maxWidth={920} accentColor={g.biasCol}>
      <div style={{ padding:"32px 40px 32px" }}>
        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <span style={{ fontFamily:FONT.serif, fontSize:28, fontWeight:700, color:C.textHi }}>{g.asset}</span>
            <span style={{ fontSize:14, color:C.textLow }}>{g.ticker}</span>
            <span style={{ fontSize:13, fontWeight:700, color:g.biasCol, border:`1px solid ${g.biasCol}44`, borderRadius:5, padding:"3px 12px" }}>
              {bp.timeframe}
            </span>
          </div>
          <div style={{ fontSize:15, color:C.textMid }}>{bp.structure}</div>
        </div>

        {/* Aktuelle Welle */}
        <div style={{ background:C.surface, border:`1px solid ${C.gold}55`, borderRadius:RADIUS.lg, padding:"16px 20px", marginBottom:20 }}>
          <div style={{ fontSize:12, color:C.gold, fontWeight:700, letterSpacing:"0.06em", marginBottom:6, textTransform:"uppercase" }}>Aktuelle Position</div>
          <div style={{ fontSize:22, fontWeight:800, color:C.gold, fontFamily:FONT.mono, marginBottom:4 }}>{bp.currentWave}</div>
        </div>

        {/* 4-Wochen Chart */}
        <div style={{ border:`1px solid ${C.border}`, borderRadius:RADIUS.md, overflow:"hidden", padding:"8px 4px", background:C.surface, marginBottom:20 }}>
          <div style={{ fontSize:11, color:C.textLow, fontWeight:700, letterSpacing:"0.06em", padding:"4px 12px 0", textTransform:"uppercase" }}>
            4-Wochen Verlauf — Elliott-Kontext
          </div>
          <UnifiedChart assetId={chartId} unit={g.ticker.includes("XAU")||g.ticker.includes("XAG")?"$":g.ticker.includes("USD")?"$":""} h={280} />
        </div>

        {/* Wellen-Vorschau — was kommt als nächstes */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.textHi, marginBottom:14 }}>〰️ Elliott-Wellen-Vorschau — was ist möglich?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {bp.nextWaves.map((w,i)=>(
              <div key={i} style={{
                background:C.surface, borderRadius:RADIUS.md,
                border:`1px solid ${WAVE_STATUS_COL[w.status]}33`,
                padding:"14px 18px",
                display:"flex", gap:16, alignItems:"flex-start",
              }}>
                {/* Status Indicator */}
                <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:18, color:WAVE_STATUS_COL[w.status], fontWeight:900 }}>
                    {WAVE_STATUS_ICON[w.status]}
                  </span>
                  {i < bp.nextWaves.length-1 && (
                    <div style={{ width:2, height:20, background:C.border, borderRadius:1 }}/>
                  )}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5, flexWrap:"wrap" }}>
                    <span style={{ fontSize:15, fontWeight:800, color:WAVE_STATUS_COL[w.status], fontFamily:FONT.mono }}>{w.wave}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:C.textHi, fontVariantNumeric:"tabular-nums" }}>→ {w.target}</span>
                    <span style={{ fontSize:11, color:WAVE_STATUS_COL[w.status], border:`1px solid ${WAVE_STATUS_COL[w.status]}44`, borderRadius:4, padding:"1px 8px", fontWeight:700, textTransform:"uppercase" }}>
                      {w.status}
                    </span>
                  </div>
                  <p style={{ fontSize:13, color:C.textMid, lineHeight:1.65, margin:0 }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bear Case */}
        <div style={{ background:"#160a0a", border:`1px solid ${C.bear}33`, borderRadius:RADIUS.md, padding:"14px 18px" }}>
          <div style={{ fontSize:12, color:C.bear, fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>⚠️ Bear Case / Invalidierung</div>
          <p style={{ fontSize:14, color:C.textMid, lineHeight:1.65, margin:0 }}>{bp.bearCase}</p>
        </div>
      </div>
    </Modal>
  );
}

// ── SETUP CARD ────────────────────────────────────────────────────────────────
function SetupCard({ s }) {
  const isLong = s.type === "long";
  const col = isLong ? C.bull : C.bear;

  return (
    <div style={{ background:C.bg, border:`2px solid ${col}44`, borderRadius:RADIUS.lg, padding:"22px 24px" }}>
      {/* Type + TF + Label */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:10, marginBottom:14 }}>
        <span style={{ fontSize:13, fontWeight:900, color:col, border:`2px solid ${col}66`, borderRadius:5, padding:"5px 14px", letterSpacing:"0.08em" }}>
          {isLong?"▲ LONG":"▼ SHORT"}
        </span>
        <span style={{ fontSize:12, color:C.textMid, border:`1px solid ${C.border}`, borderRadius:5, padding:"5px 12px", fontWeight:600 }}>{s.tf}</span>
      </div>
      <div style={{ fontSize:17, fontWeight:700, color:C.textHi, lineHeight:1.4, marginBottom:10 }}>{s.label}</div>
      {s.isBWave && (
        <div style={{ background:"#1f1800", border:`1px solid ${C.gold}55`, borderRadius:RADIUS.md, padding:"10px 14px", marginBottom:14, fontSize:13, color:C.gold }}>
          ⚠️ Kontra-Trend / B-Welle — kleiner Size, enger Stop
        </div>
      )}
      <div style={{ fontSize:13, fontStyle:"italic", color:C.gold, marginBottom:16, lineHeight:1.5 }}>{s.wave}</div>

      {/* Entry/Stop/Ziele */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
        {[["ENTRY",s.entry,C.textHi],["STOP",s.stop,C.bear],["ZIEL 1",s.t1,C.bull],["ZIEL 2",s.t2,C.bull]].map(([l,v,c])=>(
          <div key={l} style={{ background:C.surface, borderRadius:RADIUS.md, padding:"14px 16px", border:`1px solid ${c}22` }}>
            <div style={{ fontSize:11, color:C.textLow, letterSpacing:"0.07em", marginBottom:6, textTransform:"uppercase", fontWeight:700 }}>{l}</div>
            <div style={{ fontSize:17, fontWeight:800, color:c, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono }}>{v}</div>
          </div>
        ))}
      </div>

      {/* CRV + Duration */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10, marginBottom:14 }}>
        <div style={{ background:C.surface, borderRadius:RADIUS.md, padding:"12px 16px", border:`1px solid ${C.gold}33` }}>
          <div style={{ fontSize:11, color:C.textLow, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700 }}>CRV</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.gold, fontFamily:FONT.mono }}>{s.crv}</div>
        </div>
        <div style={{ background:C.surface, borderRadius:RADIUS.md, padding:"12px 16px" }}>
          <div style={{ fontSize:11, color:C.textLow, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700 }}>DAUER</div>
          <div style={{ fontSize:15, color:C.textMid, fontWeight:600, lineHeight:1.3 }}>{s.duration}</div>
        </div>
      </div>

      {/* Confluence */}
      {s.confluence && (
        <div style={{ background:C.surface, borderRadius:RADIUS.md, padding:"14px 18px", marginBottom:14 }}>
          <div style={{ fontSize:11, color:C.textLow, fontWeight:700, letterSpacing:"0.07em", marginBottom:10, textTransform:"uppercase" }}>CONFLUENCE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {s.confluence.map(([k,v],i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:i<s.confluence.length-1?8:0, borderBottom:i<s.confluence.length-1?`1px solid ${C.border}`:"none" }}>
                <span style={{ fontSize:13, color:C.textMid }}>{k}</span>
                <span style={{ fontSize:13, color:C.textHi, fontWeight:700, textAlign:"right", marginLeft:16 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution */}
      <div style={{ fontSize:14, color:C.textMid, lineHeight:1.7, marginBottom:12, padding:"12px 16px", background:C.surface, borderRadius:RADIUS.md, borderLeft:`3px solid ${col}` }}>
        {s.exec}
      </div>

      {/* Invalidation */}
      <div style={{ fontSize:13, color:C.textLow, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
        <span style={{ fontWeight:700, color:C.textMid }}>❌ Invalidiert: </span>{s.invalid}
      </div>
    </div>
  );
}

// ── TRADE GROUP ───────────────────────────────────────────────────────────────
export default function TradeGroup({ g }) {
  const [open, setOpen] = useState(g.asset === "Solana");
  const [showBigPicture, setShowBigPicture] = useState(false);

  return (
    <>
      <div style={{ background:C.card, border:`1px solid ${g.biasCol}44`, borderRadius:RADIUS.lg, padding:"20px 24px 18px" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:open?14:0 }}>
          <div onClick={()=>setOpen(!open)} style={{ cursor:"pointer", userSelect:"none", flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:6 }}>
              <span style={{ fontFamily:FONT.serif, fontSize:20, fontWeight:700, color:C.textHi }}>{g.asset}</span>
              <span style={{ fontSize:12, color:C.textLow }}>{g.ticker}</span>
              <span style={{ fontSize:12, fontWeight:700, color:g.biasCol, border:`1px solid ${g.biasCol}44`, borderRadius:4, padding:"2px 9px" }}>{g.priority}</span>
            </div>
            <div style={{ fontSize:13, color:C.textMid }}>{g.note}</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0, marginLeft:12 }}>
            {/* Big Picture Button */}
            {g.bigPicture && (
              <button
                onClick={()=>setShowBigPicture(true)}
                style={{
                  background:C.surface, border:`1px solid ${C.gold}55`,
                  borderRadius:RADIUS.sm, padding:"7px 12px",
                  color:C.gold, fontSize:12, fontWeight:700, cursor:"pointer",
                  transition:"all 0.15s", whiteSpace:"nowrap",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.background="#1a1500"; e.currentTarget.style.borderColor=C.gold; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.surface; e.currentTarget.style.borderColor=`${C.gold}55`; }}
              >〰️ Übergeordnete Struktur</button>
            )}
            <span onClick={()=>setOpen(!open)} style={{ color:C.textLow, fontSize:24, cursor:"pointer" }}>{open?"−":"+"}</span>
          </div>
        </div>

        {open && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {g.setups.map((s,i)=><SetupCard key={i} s={s}/>)}
          </div>
        )}
      </div>

      {showBigPicture && g.bigPicture && (
        <BigPictureModal g={g} onClose={()=>setShowBigPicture(false)} />
      )}
    </>
  );
}
