import React, { useState } from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// TRADE CARD — Setup-Karte mit Confluence-Tabelle
// ─────────────────────────────────────────────────────────────────────────────

function SetupCard({ s }) {
  const isLong = s.type === "long";
  const col = isLong ? C.bull : C.bear;

  return (
    <div style={{
      background: C.bg,
      border: `1px solid ${col}33`,
      borderRadius: RADIUS.md, padding: "16px 18px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, color: col,
          border: `1px solid ${col}55`, borderRadius: 4,
          padding: "3px 10px", letterSpacing: "0.06em",
        }}>{isLong ? "LONG" : "SHORT"}</span>
        <span style={{
          fontSize: 10, color: C.textMid,
          border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px",
        }}>{s.tf}</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.textHi, flex: 1 }}>{s.label}</span>
      </div>

      {/* B-Wave Warning */}
      {s.isBWave && (
        <div style={{
          background: "#1a1400", border: `1px solid ${C.gold}44`,
          borderRadius: RADIUS.sm, padding: "7px 11px", marginBottom: 10,
          fontSize: 11.5, color: C.gold,
        }}>
          ⚠️ Kontra-Trend / B-Welle — kleiner Size, enger Stop
        </div>
      )}

      <div style={{ fontSize: 11, fontStyle: "italic", color: C.gold, marginBottom: 12 }}>{s.wave}</div>

      {/* Entry / Stop / Targets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginBottom: 10 }}>
        {[["ENTRY", s.entry, C.textHi], ["STOP", s.stop, C.bear], ["ZIEL 1", s.t1, C.bull], ["ZIEL 2", s.t2, C.bull]].map(([l, v, c]) => (
          <div key={l} style={{ background: C.surface, borderRadius: RADIUS.sm, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, color: C.textLow, letterSpacing: "0.06em", marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: c, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>{v}</div>
          </div>
        ))}
      </div>

      {/* CRV + Duration */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ background: C.surface, borderRadius: RADIUS.sm, padding: "7px 12px", flex: 1 }}>
          <div style={{ fontSize: 9, color: C.textLow, marginBottom: 2 }}>CRV</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, fontFamily: FONT.mono }}>{s.crv}</div>
        </div>
        <div style={{ background: C.surface, borderRadius: RADIUS.sm, padding: "7px 12px", flex: 2 }}>
          <div style={{ fontSize: 9, color: C.textLow, marginBottom: 2 }}>DAUER</div>
          <div style={{ fontSize: 12, color: C.textMid, fontWeight: 600 }}>{s.duration}</div>
        </div>
      </div>

      {/* Confluence Table */}
      {s.confluence && (
        <div style={{ background: C.surface, borderRadius: RADIUS.md, padding: "10px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.textLow, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>CONFLUENCE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
            {s.confluence.map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 10.5, color: C.textMid }}>{k}</span>
                <span style={{ fontSize: 10.5, color: C.textHi, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Note */}
      <div style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.6, marginBottom: 10 }}>{s.exec}</div>

      {/* Invalidation */}
      <div style={{ fontSize: 11.5, color: C.textLow, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontWeight: 700, color: C.textMid }}>Invalidiert: </span>{s.invalid}
      </div>
    </div>
  );
}

export default function TradeGroup({ g }) {
  const [open, setOpen] = useState(g.asset === "Solana");

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${g.biasCol}33`,
      borderRadius: RADIUS.lg, padding: "16px 20px 14px",
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", userSelect: "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: FONT.serif, fontSize: 16, fontWeight: 600, color: C.textHi }}>{g.asset}</span>
            <span style={{ fontSize: 11, color: C.textLow }}>{g.ticker}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: g.biasCol,
              border: `1px solid ${g.biasCol}44`, borderRadius: 4, padding: "2px 8px",
            }}>{g.priority}</span>
          </div>
          <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>{g.note}</div>
        </div>
        <span style={{ color: C.textLow, fontSize: 22, marginLeft: 12 }}>{open ? "−" : "+"}</span>
      </div>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          {g.setups.map((s, i) => <SetupCard key={i} s={s} />)}
        </div>
      )}
    </div>
  );
}
