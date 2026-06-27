import React, { useState } from "react";
import { CALENDAR_EVENTS, CALENDAR_WEEKS } from "../data/calendar";
import Modal from "./Modal";
import { C, FONT, RADIUS, IMP_COL } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR VIEW — Wochenansicht + Event-Detail-Modal
// ─────────────────────────────────────────────────────────────────────────────

const WEEK_DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function EventModal({ event: e, onClose }) {
  const ic = IMP_COL[e.imp] || C.gold;
  return (
    <Modal onClose={onClose} maxWidth={560} accentColor={ic}>
      <div style={{ padding: "24px 28px 20px" }}>
        {/* Impact badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: ic, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: ic }}>
            {e.imp === "H" ? "Hoher Impact" : e.imp === "M" ? "Mittlerer Impact" : e.imp === "N" ? "Feiertag" : "Niedriger Impact"}
          </span>
          <span style={{ fontSize: 11, color: C.textLow, marginLeft: "auto" }}>{e.time}</span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: FONT.serif, fontSize: 20, color: C.textHi,
          fontWeight: 600, lineHeight: 1.4, margin: "0 0 16px 0",
        }}>{e.name}</h2>

        {/* Detail */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          {e.detail.split("\n").filter(Boolean).map((line, i) => {
            const isImpact = line.startsWith("⚡");
            const isBullet = line.startsWith("•");
            return (
              <p key={i} style={{
                fontSize: isImpact ? 13 : 12.5,
                fontWeight: isImpact ? 700 : 400,
                color: isImpact ? C.gold : isBullet ? C.textHi : C.textMid,
                lineHeight: 1.7, margin: 0, marginBottom: 5,
                paddingLeft: isBullet ? 14 : 0,
              }}>{line}</p>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function DayCell({ dateStr, dayLabel }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const events = CALENDAR_EVENTS[dateStr] || [];
  const hasHigh = events.some(e => e.imp === "H");
  const hasMid = events.some(e => e.imp === "M");
  const hasHoliday = events.some(e => e.imp === "N");
  const isEmpty = events.length === 0;

  const borderCol = hasHigh ? C.impH : hasMid ? C.impM : hasHoliday ? C.impN : C.border;
  const dayNum = dateStr.split("-")[2];

  return (
    <>
      <div style={{
        background: isEmpty ? C.surface : C.card,
        border: `1px solid ${borderCol}${isEmpty ? "44" : "88"}`,
        borderRadius: RADIUS.md, padding: "8px 7px",
        minHeight: 80, opacity: isEmpty ? 0.35 : 1,
        transition: "all 0.15s",
      }}>
        {/* Day Label */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 9, color: C.textLow, fontWeight: 600 }}>{dayLabel}</span>
          <span style={{ fontSize: 9, color: C.textLow }}>{dayNum}.</span>
        </div>

        {/* Event Chips */}
        {events.map((ev, i) => {
          const ic = IMP_COL[ev.imp] || C.gray;
          return (
            <div
              key={i}
              onClick={() => setSelectedEvent(ev)}
              style={{
                background: ic, borderRadius: 3,
                padding: "3px 5px", marginBottom: 3, cursor: "pointer",
                transition: "opacity 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <div style={{
                fontSize: 8.5, color: ev.imp === "N" ? "#555" : "#000",
                fontWeight: 700, lineHeight: 1.2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{ev.short || ev.name}</div>
            </div>
          );
        })}
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}

export default function CalendarView() {
  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 20, fontSize: 11.5, color: C.textMid, marginBottom: 18, flexWrap: "wrap" }}>
        {[["H", "Hoher Impact", C.impH], ["M", "Mittlerer Impact", C.impM], ["L", "Niedriger Impact", C.impL], ["N", "Feiertag / Kein Markt", C.impN]].map(([k, l, c]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: c, display: "inline-block" }} />
            {l}
          </div>
        ))}
        <span style={{ color: C.textLow, marginLeft: "auto", fontSize: 11 }}>Klick auf Event für Details</span>
      </div>

      {/* Week Grids */}
      {CALENDAR_WEEKS.map((week, wi) => (
        <div key={wi} style={{ marginBottom: 20 }}>
          {/* Week Label */}
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.textLow,
            letterSpacing: "0.06em", marginBottom: 8,
            paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
          }}>{week.label}</div>

          {/* Day Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 5 }}>
            {WEEK_DAYS.map(d => (
              <div key={d} style={{ fontSize: 10, fontWeight: 700, color: C.textLow, textAlign: "center" }}>{d}</div>
            ))}
          </div>

          {/* Day Cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
            {week.days.map((dateStr, di) => (
              <DayCell key={di} dateStr={dateStr} dayLabel={WEEK_DAYS[di]} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
