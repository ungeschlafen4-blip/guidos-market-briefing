import React from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// Header ohne Ampel-Leiste (wird durch NewsTicker ersetzt)
export default function Header({ snap, loading, error, lastUpd, onRefresh, isMobile, hideBiasStrip }) {
  return (
    <header style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{
            fontFamily: FONT.serif,
            fontSize: isMobile ? 22 : 32,
            margin: 0, letterSpacing: "0.01em", color: C.textHi, fontWeight: 700,
          }}>
            Guido's <span style={{ color: C.gold }}>Market</span> Briefing
          </h1>
          <div style={{ fontSize: 12, color: C.textLow, marginTop: 5, letterSpacing: "0.02em" }}>
            {lastUpd
              ? <><span style={{ color: C.bull }}>●</span>{" "}Live Update: {lastUpd} MESZ</>
              : snap?.time || "Snapshot"
            }
            {" · "}Elliott-Wave{" · "}1H/2H Trades{" · "}Desktop + Mobile
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.surface, border: `1px solid ${C.purple}55`,
              borderRadius: RADIUS.md, padding: "10px 16px",
              color: C.purple, fontSize: 13, fontWeight: 700,
              textDecoration: "none", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1528"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; }}
          >🔗 {isMobile ? "MCO" : "MCO Terminal"}</a>

          <button onClick={onRefresh} disabled={loading}
            style={{
              background: C.surface, border: `1px solid ${loading ? C.textLow : C.gold}`,
              borderRadius: RADIUS.md, padding: "10px 16px",
              color: loading ? C.textLow : C.gold,
              fontSize: 13, fontWeight: 700, cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1a1500"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; }}
          >
            <span style={{ fontSize: 16, display: "inline-block", animation: loading ? "spin 0.8s linear infinite" : "none" }}>
              {loading ? "⟳" : "🔄"}
            </span>
            {isMobile ? "" : "Live Update"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 10, padding: "8px 14px", background: "#160606", border: `1px solid ${C.bear}44`, borderRadius: RADIUS.sm, fontSize: 12, color: C.bear }}>
          ⚠️ {error}
        </div>
      )}
      {loading && (
        <div style={{ marginTop: 10, padding: "8px 14px", background: C.surface, border: `1px solid ${C.gold}33`, borderRadius: RADIUS.sm, fontSize: 12, color: C.textMid }}>
          🔍 Claude sucht: BTC · ETH · SOL · Gold · Silber + News...
        </div>
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </header>
  );
}
