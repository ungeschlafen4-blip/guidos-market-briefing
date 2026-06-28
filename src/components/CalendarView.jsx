import React, { useState } from "react";
import { CALENDAR_EVENTS, CALENDAR_WEEKS } from "../data/calendar";
import Modal from "./Modal";
import { C, FONT, RADIUS, IMP_COL } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR VIEW — Klick auf Tag → ganzer Tag als Modal
// ─────────────────────────────────────────────────────────────────────────────

const WEEK_DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const MONTH_NAMES = {
  "01":"Jänner","02":"Februar","03":"März","04":"April",
  "05":"Mai","06":"Juni","07":"Juli","08":"August",
  "09":"September","10":"Oktober","11":"November","12":"Dezember",
};

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d)}. ${MONTH_NAMES[m]} ${y}`;
}

// ── EINZELNES EVENT INNERHALB DES TAGES-MODALS ────────────────────────────────
function EventItem({ e }) {
  const [expanded, setExpanded] = useState(false);
  const ic = IMP_COL[e.imp] || C.gray;
  const impLabel = e.imp === "H" ? "Hoher Impact" : e.imp === "M" ? "Mittlerer Impact" : e.imp === "N" ? "Feiertag" : "Niedriger Impact";

  return (
    <div style={{
      background: C.surface, borderRadius: RADIUS.md,
      border: `1px solid ${ic}44`,
      overflow: "hidden",
    }}>
      {/* Header — immer sichtbar */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "14px 18px", cursor: "pointer",
          display: "flex", alignItems: "flex-start", gap: 12,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = C.card}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {/* Impact Dot */}
        <span style={{
          width: 10, height: 10, borderRadius: 3,
          background: ic, display: "inline-block",
          flexShrink: 0, marginTop: 4,
        }} />

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: ic,
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>{impLabel}</span>
            {e.time !== "—" && (
              <span style={{
                fontSize: 11, color: C.textLow,
                background: C.card, borderRadius: 4,
                padding: "1px 8px", border: `1px solid ${C.border}`,
              }}>⏰ {e.time} MESZ</span>
            )}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textHi, lineHeight: 1.4 }}>{e.name}</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>{e.short}</div>
        </div>

        <span style={{
          color: C.textLow, fontSize: 18, flexShrink: 0, marginTop: 2,
          transition: "transform 0.15s",
          display: "inline-block",
          transform: expanded ? "rotate(180deg)" : "none",
        }}>⌄</span>
      </div>

      {/* Detail — ausgeklappt */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "16px 18px 18px",
          background: C.bg,
        }}>
          {e.detail.split("\n").filter(Boolean).map((line, i) => {
            const isImpact = line.startsWith("⚡");
            const isBullet = line.startsWith("•");
            return (
              <p key={i} style={{
                fontSize: isImpact ? 14 : 13,
                fontWeight: isImpact ? 700 : 400,
                color: isImpact ? C.gold : isBullet ? C.textHi : C.textMid,
                lineHeight: 1.75, margin: 0, marginBottom: 6,
                paddingLeft: isBullet ? 16 : 0,
              }}>{line}</p>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TAGES-MODAL ────────────────────────────────────────────────────────────────
function DayModal({ dateStr, dayLabel, onClose }) {
  const events = CALENDAR_EVENTS[dateStr] || [];
  const hasEvents = events.length > 0;
  const hasHigh = events.some(e => e.imp === "H");
  const accentCol = hasHigh ? C.impH : C.gold;

  return (
    <Modal onClose={onClose} maxWidth={680} accentColor={accentCol}>
      <div style={{ padding: "28px 32px 24px" }}>
        {/* Tag Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.textLow, letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase" }}>
            {dayLabel}
          </div>
          <h2 style={{
            fontFamily: FONT.serif, fontSize: 26, color: C.textHi,
            fontWeight: 700, margin: 0,
          }}>{formatDate(dateStr)}</h2>
          {hasEvents && (
            <div style={{ fontSize: 13, color: C.textMid, marginTop: 6 }}>
              {events.length} Event{events.length > 1 ? "s" : ""} an diesem Tag · Klick für Details
            </div>
          )}
        </div>

        {/* Events */}
        {hasEvents ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {events.map((e, i) => <EventItem key={i} e={e} />)}
          </div>
        ) : (
          <div style={{
            padding: "32px 20px", textAlign: "center",
            color: C.textLow, fontSize: 14,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
            Keine geplanten Events an diesem Tag.
          </div>
        )}

        {/* Tipp */}
        {hasEvents && (
          <div style={{
            marginTop: 16, padding: "10px 14px",
            background: C.surface, borderRadius: RADIUS.sm,
            fontSize: 12, color: C.textLow,
          }}>
            💡 Klick auf ein Event zum Auf- und Zuklappen der vollständigen Analyse
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── TAG ZELLE ─────────────────────────────────────────────────────────────────
function DayCell({ dateStr, dayLabel }) {
  const [modalOpen, setModalOpen] = useState(false);
  const events = CALENDAR_EVENTS[dateStr] || [];
  const hasHigh = events.some(e => e.imp === "H");
  const hasMid = events.some(e => e.imp === "M");
  const hasHoliday = events.some(e => e.imp === "N");
  const isEmpty = events.length === 0;
  const [hovered, setHovered] = useState(false);

  const borderCol = hasHigh ? C.impH : hasMid ? C.impM : hasHoliday ? C.impN : C.border;
  const dayNum = dateStr.split("-")[2];

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered && !isEmpty ? C.cardHov : isEmpty ? C.surface : C.card,
          border: `1px solid ${hovered && !isEmpty ? borderCol : borderCol}${isEmpty ? "33" : "77"}`,
          borderRadius: RADIUS.md,
          padding: "9px 8px",
          minHeight: 88,
          opacity: isEmpty ? 0.3 : 1,
          cursor: "pointer",
          transition: "all 0.15s",
          transform: hovered && !isEmpty ? "translateY(-2px)" : "none",
          boxShadow: hovered && !isEmpty ? "0 6px 16px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Day header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: C.textLow, fontWeight: 700 }}>{dayLabel}</span>
          <span style={{ fontSize: 10, color: C.textLow }}>{dayNum}.</span>
        </div>

        {/* Event Chips */}
        {events.map((ev, i) => {
          const ic = IMP_COL[ev.imp] || C.gray;
          return (
            <div key={i} style={{
              background: ic,
              borderRadius: 3, padding: "3px 6px", marginBottom: 3,
            }}>
              <div style={{
                fontSize: 9, color: ev.imp === "N" ? "#444" : "#000",
                fontWeight: 700, lineHeight: 1.3,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{ev.short || ev.name}</div>
            </div>
          );
        })}

        {/* Hover Hint */}
        {!isEmpty && hovered && (
          <div style={{ fontSize: 9, color: C.blue, marginTop: 4 }}>→ Tag öffnen</div>
        )}
      </div>

      {modalOpen && (
        <DayModal dateStr={dateStr} dayLabel={dayLabel} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ── HAUPTKOMPONENTE ────────────────────────────────────────────────────────────
export default function CalendarView() {
  return (
    <div>
      {/* Legende */}
      <div style={{ display: "flex", gap: 20, fontSize: 12, color: C.textMid, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[["H", "Hoher Impact", C.impH], ["M", "Mittlerer Impact", C.impM], ["L", "Niedriger Impact", C.impL], ["N", "Feiertag / Kein Markt", C.impN]].map(([k, l, c]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: "inline-block" }} />
            <span>{l}</span>
          </div>
        ))}
        <span style={{ color: C.textLow, marginLeft: "auto", fontSize: 11 }}>
          Klick auf einen Tag → vollständige Tagesübersicht
        </span>
      </div>

      {/* Wochen */}
      {CALENDAR_WEEKS.map((week, wi) => (
        <div key={wi} style={{ marginBottom: 24 }}>
          {/* Woche Label */}
          <div style={{
            fontSize: 12, fontWeight: 700, color: C.textLow,
            letterSpacing: "0.06em", marginBottom: 10,
            paddingBottom: 8, borderBottom: `1px solid ${C.border}`,
            textTransform: "uppercase",
          }}>{week.label}</div>

          {/* Wochentag-Header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 6 }}>
            {WEEK_DAYS.map(d => (
              <div key={d} style={{
                fontSize: 11, fontWeight: 700, color: C.textMid,
                textAlign: "center", padding: "4px 0",
              }}>{d}</div>
            ))}
          </div>

          {/* Tag-Zellen */}
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
