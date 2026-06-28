import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// MACRO TILE v2 — TradingView Live-Widget eingebettet
// ─────────────────────────────────────────────────────────────────────────────

const MACRO_ASSETS = [
  {
    n:"S&P 500", p:"7.354", ch:-0.05, emoji:"📈",
    tvSymbol:"SP:SPX", tvLink:"https://www.tradingview.com/chart/",
    note:"Nach PCE-Daten stabil. Nasdaq -2,2% diese Woche. Micron-Beat gibt Entlastung.",
    wave:"SPX kämpft um 7.400 als Support. Sell-off von 7.530 Wochenhoch nach KOSPI-Crash.",
  },
  {
    n:"Nasdaq 100", p:"22.180", ch:-0.40, emoji:"💻",
    tvSymbol:"NASDAQ:NDX", tvLink:"https://www.tradingview.com/chart/",
    note:"AI-Chip-Sektor unter Druck nach KOSPI. Micron-Beat stoppt Abwärtstrend.",
    wave:"NDX in Korrekturphase nach Tech-Hochs. Micron-Beat Katalysator für Erholung.",
  },
  {
    n:"WTI Öl", p:"$71,90", ch:+0.30, emoji:"🛢️",
    tvSymbol:"NYMEX:CL1!", tvLink:"https://www.tradingview.com/chart/",
    note:"Vor-Kriegs-Niveau. Iran-MOU normalisiert Hormuz. Brent in Contango (bearish).",
    wave:"WTI stabilisiert nach -40% vom Kriegspeak. Kein weiterer Abwärtstrend erwartet.",
  },
  {
    n:"DXY Dollar", p:"101,6", ch:+0.40, emoji:"💵",
    tvSymbol:"TVC:DXY", tvLink:"https://www.tradingview.com/chart/",
    note:"Dollar stark nach hawkishem Warsh-Fed. Sep-Hike 63% treibt Dollar.",
    wave:"DXY über 101 — Schlüsselwiderstand. Stärke belastet Gold, Krypto und Emerging Markets.",
  },
  {
    n:"10Y US Yield", p:"4,46%", ch:+0.02, emoji:"📊",
    tvSymbol:"TVC:US10Y", tvLink:"https://www.tradingview.com/chart/",
    note:"Yield steigt mit Hike-Erwartung. Sep-Hike 63%, Dez 80%.",
    wave:"10Y über 4,4% — erhöhter Druck auf Growth-Assets und Krypto.",
  },
  {
    n:"VIX", p:"18,89", ch:-1.20, emoji:"🌡️",
    tvSymbol:"CBOE:VIX", tvLink:"https://www.tradingview.com/chart/",
    note:"Volatilität leicht rückläufig nach Expiry. Unter 20 = moderates Risiko.",
    wave:"VIX normalisiert nach KOSPI-Spike. Unter 20 beruhigt Märkte kurzfristig.",
  },
];

function TVWidget({ symbol, height = 350 }) {
  const containerId = `tv_macro_${symbol.replace(/[^a-zA-Z0-9]/g, "_")}`;

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = `${height}px`;
    widgetDiv.style.width = "100%";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: height,
      locale: "de_DE",
      dateRange: "1W",
      colorTheme: "dark",
      trendLineColor: "rgba(41, 98, 255, 1)",
      underLineColor: "rgba(41, 98, 255, 0.3)",
      underLineBottomColor: "rgba(41, 98, 255, 0)",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
      noTimeScale: false,
    });

    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => { container.innerHTML = ""; };
  }, [symbol, height, containerId]);

  return (
    <div
      id={containerId}
      className="tradingview-widget-container"
      style={{ height, width: "100%", overflow: "hidden" }}
    />
  );
}

function MacroModal({ m, onClose }) {
  const [liveChart, setLiveChart] = useState(true);

  return (
    <Modal onClose={onClose} maxWidth={680} accentColor={C.blue}>
      <div style={{ padding: "24px 28px 22px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 36 }}>{m.emoji}</span>
          <div>
            <div style={{ fontSize: 13, color: C.textLow, marginBottom: 3 }}>{m.n}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: C.textHi, fontFamily: FONT.mono }}>{m.p}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: m.ch >= 0 ? C.bull : C.bear }}>
                {m.ch >= 0 ? "▲" : "▼"} {Math.abs(m.ch)}%
              </span>
            </div>
          </div>
        </div>

        {/* Wave Note */}
        <div style={{ background: C.surface, borderRadius: RADIUS.md, padding: "12px 16px", marginBottom: 14, border: `1px solid ${C.gold}33` }}>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 4 }}>ELLIOTT / TECHNISCH</div>
          <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65, margin: 0 }}>{m.wave}</p>
        </div>

        {/* Toggle: Live Chart vs. Hinweis */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[["live","TradingView Live-Chart"], ["link","Direkt öffnen"]].map(([v, l]) => (
            <button key={v} onClick={() => setLiveChart(v === "live")} style={{
              flex: 1, padding: "8px 0",
              background: (v === "live") === liveChart ? C.surface : "transparent",
              border: (v === "live") === liveChart ? `1px solid ${C.gold}55` : `1px solid ${C.border}`,
              borderRadius: RADIUS.sm, color: (v === "live") === liveChart ? C.gold : C.textMid,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>

        {liveChart ? (
          <div style={{ borderRadius: RADIUS.md, overflow: "hidden", border: `1px solid ${C.border}`, background: C.surface }}>
            <TVWidget symbol={m.tvSymbol} height={320} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{m.note}</p>
            <a href={`https://www.tradingview.com/symbols/${m.tvSymbol.replace(":", "/")}/`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.blue, color: "#fff", textDecoration: "none",
                padding: "12px 24px", borderRadius: RADIUS.md, fontSize: 13, fontWeight: 700,
              }}>
              📊 {m.n} auf TradingView öffnen →
            </a>
          </div>
        )}
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
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? C.cardHov : C.card,
          border: `1px solid ${hovered ? C.borderHi : C.border}`,
          borderRadius: RADIUS.md, padding: "14px 16px",
          cursor: "pointer", transition: "all 0.15s",
          transform: hovered ? "translateY(-2px)" : "none",
          boxShadow: hovered ? "0 6px 20px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <span style={{ fontSize: 18 }}>{m.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>{m.n}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>
              {m.p}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: m.ch >= 0 ? C.bull : C.bear, marginTop: 3 }}>
              {m.ch >= 0 ? "▲" : "▼"} {Math.abs(m.ch)}%
            </div>
          </div>
          <span style={{ fontSize: 12, color: hovered ? C.blue : C.textLow, transition: "color 0.15s", marginTop: 4 }}>
            {hovered ? "→ Chart" : "⊕"}
          </span>
        </div>
        <div style={{ fontSize: 11, color: C.textLow, marginTop: 8, lineHeight: 1.4 }}>{m.note}</div>
      </div>

      {open && <MacroModal m={m} onClose={() => setOpen(false)} />}
    </>
  );
}

export { MACRO_ASSETS };
