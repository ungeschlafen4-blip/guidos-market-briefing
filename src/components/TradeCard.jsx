import React, { useState } from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// TRADE CARD — Größere Schrift, luftiger, besser lesbar
// ─────────────────────────────────────────────────────────────────────────────

function SetupCard({ s }) {
  const isLong = s.type === "long";
  const col = isLong ? C.bull : C.bear;

  return (
    <div style={{
      background: C.bg,
      border: `2px solid ${col}44`,
      borderRadius: RADIUS.lg,
      padding: "22px 24px",
    }}>
      {/* Type + Timeframe + Label */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
          fontSize: 13, fontWeight: 900, color: col,
          border: `2px solid ${col}66`, borderRadius: 5,
          padding: "5px 14px", letterSpacing: "0.08em",
        }}>{isLong ? "▲ LONG" : "▼ SHORT"}</span>
        <span style={{
          fontSize: 12, color: C.textMid,
          border: `1px solid ${C.border}`, borderRadius: 5,
          padding: "5px 12px", fontWeight: 600,
        }}>{s.tf}</span>
      </div>

      <div style={{
        fontSize: 16, fontWeight: 700, color: C.textHi,
        lineHeight: 1.4, marginBottom: 10,
      }}>{s.label}</div>

      {/* B-Wave Warning */}
      {s.isBWave && (
        <div style={{
          background: "#1f1800", border: `1px solid ${C.gold}55`,
          borderRadius: RADIUS.md, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: C.gold, lineHeight: 1.5,
        }}>
          ⚠️ Kontra-Trend / B-Welle — kleiner Size, enger Stop
        </div>
      )}

      <div style={{
        fontSize: 13, fontStyle: "italic", color: C.gold,
        marginBottom: 18, lineHeight: 1.5,
      }}>{s.wave}</div>

      {/* Entry / Stop / Targets — 2x2 Grid, große Zahlen */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          ["ENTRY", s.entry, C.textHi],
          ["STOP", s.stop, C.bear],
          ["ZIEL 1", s.t1, C.bull],
          ["ZIEL 2", s.t2, C.bull],
        ].map(([l, v, c]) => (
          <div key={l} style={{
            background: C.surface, borderRadius: RADIUS.md,
            padding: "14px 16px",
            border: `1px solid ${c}22`,
          }}>
            <div style={{
              fontSize: 11, color: C.textLow,
              letterSpacing: "0.07em", marginBottom: 6,
              textTransform: "uppercase", fontWeight: 700,
            }}>{l}</div>
            <div style={{
              fontSize: 17, fontWeight: 800, color: c,
              fontVariantNumeric: "tabular-nums",
              fontFamily: FONT.mono, lineHeight: 1.2,
            }}>{v}</div>
          </div>
        ))}
      </div>

      {/* CRV + Duration — prominent */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 16 }}>
        <div style={{
          background: C.surface, borderRadius: RADIUS.md, padding: "14px 16px",
          border: `1px solid ${C.gold}33`,
        }}>
          <div style={{ fontSize: 11, color: C.textLow, letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>CRV</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.gold, fontFamily: FONT.mono }}>{s.crv}</div>
        </div>
        <div style={{ background: C.surface, borderRadius: RADIUS.md, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: C.textLow, letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>DAUER</div>
          <div style={{ fontSize: 15, color: C.textMid, fontWeight: 600, lineHeight: 1.3 }}>{s.duration}</div>
        </div>
      </div>

      {/* Confluence Table */}
      {s.confluence && (
        <div style={{
          background: C.surface, borderRadius: RADIUS.md,
          padding: "14px 18px", marginBottom: 16,
        }}>
          <div style={{
            fontSize: 11, color: C.textLow, fontWeight: 700,
            letterSpacing: "0.07em", marginBottom: 12,
            textTransform: "uppercase",
          }}>CONFLUENCE — Bestätigungssignale</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {s.confluence.map(([k, v], i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingBottom: i < s.confluence.length - 1 ? 8 : 0,
                borderBottom: i < s.confluence.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <span style={{ fontSize: 13, color: C.textMid }}>{k}</span>
                <span style={{ fontSize: 13, color: C.textHi, fontWeight: 700, textAlign: "right", marginLeft: 16 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution */}
      <div style={{
        fontSize: 14, color: C.textMid, lineHeight: 1.7,
        marginBottom: 14, padding: "12px 16px",
        background: C.surface, borderRadius: RADIUS.md,
        borderLeft: `3px solid ${col}`,
      }}>{s.exec}</div>

      {/* Invalidation */}
      <div style={{
        fontSize: 13, color: C.textLow,
        paddingTop: 12, borderTop: `1px solid ${C.border}`,
      }}>
        <span style={{ fontWeight: 700, color: C.textMid }}>❌ Invalidiert: </span>{s.invalid}
      </div>
    </div>
  );
}

export default function TradeGroup({ g }) {
  const [open, setOpen] = useState(g.asset === "Solana");

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${g.biasCol}44`,
      borderRadius: RADIUS.lg,
      padding: "20px 24px 18px",
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", userSelect: "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontFamily: FONT.serif, fontSize: 20, fontWeight: 700, color: C.textHi }}>{g.asset}</span>
            <span style={{ fontSize: 12, color: C.textLow }}>{g.ticker}</span>
            <span style={{
              fontSize: 12, fontWeight: 700, color: g.biasCol,
              border: `1px solid ${g.biasCol}44`, borderRadius: 5, padding: "3px 10px",
            }}>{g.priority}</span>
          </div>
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>{g.note}</div>
        </div>
        <span style={{ color: C.textLow, fontSize: 26, marginLeft: 14, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
          {g.setups.map((s, i) => <SetupCard key={i} s={s} />)}
        </div>
      )}
    </div>
  );
}
