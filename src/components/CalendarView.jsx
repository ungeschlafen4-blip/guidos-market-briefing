import React, { useState } from "react";
import { CALENDAR_EVENTS, CALENDAR_WEEKS } from "../data/calendar";
import Modal from "./Modal";
import { C, FONT, RADIUS } from "../styles/theme";
import { CAL_IMP_COL } from "../styles/calendarColors";

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR VIEW v3 — Eigene bunte Farben (Rot/Gold/Blau/Grau), unabhängig
// vom Schwarz-Weiß-Haupttheme. Sonst identisch zur vorherigen Version.
// ─────────────────────────────────────────────────────────────────────────────

const WEEK_DAYS = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const MONTH_NAMES = {"01":"Jänner","02":"Februar","03":"März","04":"April","05":"Mai","06":"Juni","07":"Juli","08":"August","09":"September","10":"Oktober","11":"November","12":"Dezember"};

function formatDate(dateStr) {
  const [y,m,d] = dateStr.split("-");
  return `${parseInt(d)}. ${MONTH_NAMES[m]} ${y}`;
}

function EventItem({ e }) {
  const [expanded, setExpanded] = useState(false);
  const ic = CAL_IMP_COL[e.imp] || C.gray;
  const impLabel = e.imp==="H"?"⚡ Hoher Impact":e.imp==="M"?"📊 Mittlerer Impact":e.imp==="N"?"🏖️ Feiertag":"📌 Niedriger Impact";

  return (
    <div style={{ background:C.surface, borderRadius:RADIUS.lg, border:`1px solid ${ic}55`, overflow:"hidden" }}>
      <div onClick={()=>setExpanded(!expanded)} style={{ padding:"20px 24px", cursor:"pointer", display:"flex", alignItems:"flex-start", gap:16, transition:"background 0.15s" }}
        onMouseEnter={e=>e.currentTarget.style.background=C.card} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <span style={{ width:14, height:14, borderRadius:4, background:ic, display:"inline-block", flexShrink:0, marginTop:4 }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:ic, textTransform:"uppercase", letterSpacing:"0.05em" }}>{impLabel}</span>
            {e.time !== "—" && <span style={{ fontSize:13, color:C.textLow, background:C.card, borderRadius:5, padding:"2px 10px", border:`1px solid ${C.border}` }}>⏰ {e.time} MESZ</span>}
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:C.textHi, lineHeight:1.4, marginBottom:6 }}>{e.name}</div>
          <div style={{ fontSize:14, color:C.textMid, lineHeight:1.5 }}>{e.short}</div>
        </div>
        <span style={{ color:C.textLow, fontSize:22, flexShrink:0, marginTop:4, display:"inline-block", transition:"transform 0.2s", transform:expanded?"rotate(180deg)":"none" }}>⌄</span>
      </div>
      {expanded && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"22px 24px 24px", background:C.bg }}>
          {e.detail.split("\n").filter(Boolean).map((line,i)=>{
            const isImpact = line.startsWith("⚡");
            const isBullet = line.startsWith("•");
            return (
              <p key={i} style={{
                fontSize: isImpact?16:15, fontWeight: isImpact?700:400,
                color: isImpact?CAL_IMP_COL.M:isBullet?C.textHi:C.textMid,
                lineHeight:1.8, margin:0, marginBottom:8, paddingLeft:isBullet?20:0,
              }}>{line}</p>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DayModal({ dateStr, dayLabel, onClose }) {
  const events = CALENDAR_EVENTS[dateStr] || [];
  const hasHigh = events.some(e=>e.imp==="H");
  const accentCol = hasHigh ? CAL_IMP_COL.H : CAL_IMP_COL.M;

  return (
    <Modal onClose={onClose} maxWidth={900} accentColor={accentCol}>
      <div style={{ padding:"40px 48px 40px" }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:14, color:C.textLow, letterSpacing:"0.08em", marginBottom:8, textTransform:"uppercase", fontWeight:700 }}>{dayLabel}</div>
          <h2 style={{ fontFamily:FONT.serif, fontSize:34, color:C.textHi, fontWeight:700, margin:"0 0 10px 0" }}>{formatDate(dateStr)}</h2>
          {events.length>0 && (
            <div style={{ fontSize:15, color:C.textMid, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:accentCol, display:"inline-block" }}/>
              {events.length} Event{events.length>1?"s":""} — Klick auf Event für Details
            </div>
          )}
        </div>
        {events.length>0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {events.map((e,i)=><EventItem key={i} e={e}/>)}
          </div>
        ) : (
          <div style={{ padding:"60px 20px", textAlign:"center", color:C.textLow, fontSize:16 }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📅</div>
            <div style={{ fontFamily:FONT.serif, fontSize:20, color:C.textMid, marginBottom:8 }}>Keine Events an diesem Tag</div>
            <div style={{ fontSize:14 }}>Kein geplanter Wirtschaftsevent oder Feiertag.</div>
          </div>
        )}
        {events.length>0 && (
          <div style={{ marginTop:24, padding:"12px 18px", background:C.surface, borderRadius:RADIUS.md, fontSize:13, color:C.textLow, display:"flex", alignItems:"center", gap:8 }}>
            <span>💡</span> Klick auf ein Event zum Auf-/Zuklappen der vollständigen Analyse mit BTC/ETH-Impact
          </div>
        )}
      </div>
    </Modal>
  );
}

function DayCell({ dateStr, dayLabel }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const events = CALENDAR_EVENTS[dateStr] || [];
  const hasHigh = events.some(e=>e.imp==="H");
  const hasMid = events.some(e=>e.imp==="M");
  const hasHoliday = events.some(e=>e.imp==="N");
  const isEmpty = events.length===0;
  const borderCol = hasHigh?CAL_IMP_COL.H:hasMid?CAL_IMP_COL.M:hasHoliday?CAL_IMP_COL.N:C.border;
  const dayNum = dateStr.split("-")[2];

  return (
    <>
      <div onClick={()=>setModalOpen(true)} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{
          background: hovered && !isEmpty ? C.cardHov : isEmpty ? C.surface : C.card,
          border:`1px solid ${isEmpty?C.border:borderCol}${isEmpty?"33":"77"}`,
          borderRadius:RADIUS.md, padding:"9px 8px", minHeight:90,
          opacity:isEmpty?0.3:1, cursor:"pointer", transition:"all 0.15s",
          transform: hovered && !isEmpty ? "translateY(-2px)" : "none",
          boxShadow: hovered && !isEmpty ? "0 6px 16px rgba(0,0,0,0.4)" : "none",
        }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:10, color:C.textLow, fontWeight:700 }}>{dayLabel}</span>
          <span style={{ fontSize:10, color:C.textLow }}>{dayNum}.</span>
        </div>
        {events.map((ev,i)=>(
          <div key={i} style={{ background:CAL_IMP_COL[ev.imp]||C.gray, borderRadius:3, padding:"3px 6px", marginBottom:3 }}>
            <div style={{ fontSize:9, color: ev.imp==="N"?"#444":"#000", fontWeight:700, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.short||ev.name}</div>
          </div>
        ))}
        {!isEmpty && hovered && <div style={{ fontSize:9, color:CAL_IMP_COL.L, marginTop:4, fontWeight:600 }}>→ Tag öffnen</div>}
      </div>
      {modalOpen && <DayModal dateStr={dateStr} dayLabel={dayLabel} onClose={()=>setModalOpen(false)} />}
    </>
  );
}

export default function CalendarView() {
  return (
    <div>
      <div style={{ display:"flex", gap:20, fontSize:13, color:C.textMid, marginBottom:22, flexWrap:"wrap", alignItems:"center" }}>
        {[["H","Hoher Impact",CAL_IMP_COL.H],["M","Mittlerer Impact",CAL_IMP_COL.M],["L","Niedriger Impact",CAL_IMP_COL.L],["N","Feiertag",CAL_IMP_COL.N]].map(([k,l,c])=>(
          <div key={k} style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ width:10, height:10, borderRadius:3, background:c, display:"inline-block" }}/>
            <span>{l}</span>
          </div>
        ))}
        <span style={{ color:C.textLow, marginLeft:"auto", fontSize:12 }}>Klick auf Tag → großes Tages-Modal mit vollem Detail</span>
      </div>
      {CALENDAR_WEEKS.map((week,wi)=>(
        <div key={wi} style={{ marginBottom:24 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.textLow, letterSpacing:"0.07em", marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${C.border}`, textTransform:"uppercase" }}>{week.label}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginBottom:6 }}>
            {WEEK_DAYS.map(d=><div key={d} style={{ fontSize:11, fontWeight:700, color:C.textMid, textAlign:"center", padding:"4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5 }}>
            {week.days.map((dateStr,di)=><DayCell key={di} dateStr={dateStr} dayLabel={WEEK_DAYS[di]} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
