import React from "react";
import { C, FONT, BIAS_COL, DIR_ICON } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// HEADER — Logo · Timestamp · MCO Terminal · Live Refresh
// ─────────────────────────────────────────────────────────────────────────────

function BiasChip({ signal }) {
  const bc = BIAS_COL[signal.bias] || C.gold;
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${bc}44`,
      borderRadius: 8,
      padding: "7px 8px",
      textAlign: "center",
      minWidth: 70,
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: bc, letterSpacing: "0.04em", marginBottom: 1 }}>
        {signal.label}
      </div>
      {signal.price && (
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
          {signal.price}
        </div>
      )}
      <div style={{ fontSize: 13, color: bc, lineHeight: 1, margin: "2px 0" }}>
        {DIR_ICON[signal.bias] || "◆"}
      </div>
      {signal.chg24 !== null && (
        <div style={{ fontSize: 9, color: signal.chg24 >= 0 ? C.bull : C.bear, fontVariantNumeric: "tabular-nums" }}>
          {signal.chg24 > 0 ? "+" : ""}{signal.chg24}%
        </div>
      )}
    </div>
  );
}

export default function Header({ snap, loading, error, lastUpd, onRefresh, isMobile }) {
  const signals = snap?.signals || [];

  return (
    <header style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 18 }}>
      {/* Top Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <h1 style={{
            fontFamily: FONT.serif,
            fontSize: isMobile ? 20 : 30,
            margin: 0, letterSpacing: "0.01em", color: C.textHi,
            fontWeight: 700,
          }}>
            Guido's{" "}
            <span style={{ color: C.gold }}>Market</span>{" "}
            Briefing
          </h1>
          <div style={{ fontSize: 11, color: C.textLow, marginTop: 4, letterSpacing: "0.02em" }}>
            {lastUpd
              ? <><span style={{ color: C.bull }}>●</span> Live: {lastUpd} MESZ</>
              : snap?.time || "Snapshot"
            }
            {" · "}Elliott-Wave{" · "}1H/2H Trades
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <a
            href="https://terminal.mcoglobal.live/"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.surface, border: `1px solid ${C.purple}55`,
              borderRadius: 8, padding: "9px 14px",
              color: C.purple, fontSize: 12, fontWeight: 700,
              textDecoration: "none", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1528"; e.currentTarget.style.borderColor = `${C.purple}aa`; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = `${C.purple}55`; }}
          >
            🔗 {isMobile ? "MCO" : "MCO Terminal"}
          </a>

          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              background: C.surface,
              border: `1px solid ${loading ? C.textLow : C.gold}`,
              borderRadius: 8, padding: "9px 14px",
              color: loading ? C.textLow : C.gold,
              fontSize: 12, fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#1a1500"; e.currentTarget.style.borderColor = C.gold; }}}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; }}
          >
            <span style={{
              display: "inline-block",
              animation: loading ? "spin 0.8s linear infinite" : "none",
              fontSize: 14,
            }}>{loading ? "⟳" : "🔄"}</span>
            {isMobile ? "" : " Live Update"}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{ padding: "7px 12px", background: "#160606", border: `1px solid ${C.bear}44`, borderRadius: 7, fontSize: 11, color: C.bear, marginBottom: 10 }}>
          ⚠️ {error}
        </div>
      )}
      {loading && (
        <div style={{ padding: "7px 12px", background: C.surface, border: `1px solid ${C.gold}33`, borderRadius: 7, fontSize: 11, color: C.textMid, marginBottom: 10 }}>
          🔍 Claude sucht aktuelle Preise: BTC · ETH · SOL · Gold · Silber + News...
        </div>
      )}

      {/* Ampel-Leiste */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${isMobile ? 3 : 6}, 1fr)`, gap: 6 }}>
        {signals.map(s => <BiasChip key={s.id} signal={s} />)}
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </header>
  );
}
