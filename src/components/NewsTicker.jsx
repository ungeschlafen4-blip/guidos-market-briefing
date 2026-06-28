import React, { useEffect, useRef, useState } from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// NEWS TICKER — Ersatz für die Ampel-Leiste
// Scrollende aktuelle Schlagzeilen + blinkende wichtige Events
// ─────────────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  { type: "alert", color: C.bear,  text: "⚡ HEUTE: PCE Mai +3,4% YoY — Sep-Hike 63% — Kein Bounce für BTC" },
  { type: "price", color: C.bull,  text: "₿ BTC  $60.254  +0,3%" },
  { type: "price", color: C.bear,  text: "Ξ ETH  $1.588  +1,0%" },
  { type: "price", color: C.bull,  text: "◎ SOL  $72,22  +2,7%  ⭐ Stärkster Major" },
  { type: "price", color: C.gold,  text: "🥇 Gold  $4.036  +0,2%" },
  { type: "news",  color: C.textMid, text: "SOL +8% Post-Expiry-Rebound — 5-Wellen-Ende bei $64,80 bestätigt" },
  { type: "news",  color: C.textMid, text: "Ethereum Foundation: Budget −40%, Personal −20%, 9 Senior-Departures" },
  { type: "alert", color: C.gold,  text: "📅 KW 29: CPI Juni am 14. Juli — Ölpreis-Effekt erwartet — wichtigster Makro-Event" },
  { type: "news",  color: C.textMid, text: "KG Group (Südkorea): Solana-Payments-Netzwerk MOU unterzeichnet" },
  { type: "alert", color: C.bear,  text: "⚠️ BTC unter 200-Wochen-MA — ETF-Abflüsse $692 Mio. Do. — F&G: 12 Extreme Fear" },
  { type: "news",  color: C.textMid, text: "Micron Q3: EPS +24%, Revenue $41,5 Mrd. — AI-Thesis bestätigt" },
  { type: "price", color: C.gold,  text: "🪙 Silber  $57,00  −0,3%  |  WTI Öl  $71,90  +0,3%  |  S&P  7.354" },
  { type: "alert", color: C.gold,  text: "📅 Nächste Woche: FOMC 28.–29. Jul — Erster möglicher Hike (25bp)" },
];

export default function NewsTicker({ isMobile }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);

  // Blink-Effekt für Alert-Items
  useEffect(() => {
    const t = setInterval(() => setBlinkOn(b => !b), 800);
    return () => clearInterval(t);
  }, []);

  const fullItems = [...TICKER_ITEMS, ...TICKER_ITEMS]; // Doppelt für nahtlose Schleife

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: RADIUS.md,
      overflow: "hidden",
      marginBottom: 18,
      display: "flex",
      alignItems: "center",
      height: 42,
    }}>
      {/* Live Badge */}
      <div style={{
        background: C.bg,
        borderRight: `1px solid ${C.border}`,
        padding: "0 14px",
        height: "100%",
        display: "flex", alignItems: "center",
        flexShrink: 0,
        gap: 6,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: C.bull,
          display: "inline-block",
          boxShadow: `0 0 6px ${C.bull}`,
          animation: "pulse 1.5s infinite",
        }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: C.textMid, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
          {isMobile ? "LIVE" : "LIVE TICKER"}
        </span>
      </div>

      {/* Scrolling Track */}
      <div
        style={{ overflow: "hidden", flex: 1, position: "relative", cursor: "pointer" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        title="Hover zum Anhalten"
      >
        <div
          ref={trackRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            animation: paused ? "none" : "ticker 80s linear infinite",
            whiteSpace: "nowrap",
          }}
        >
          {fullItems.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              <span style={{
                fontSize: 13, fontWeight: item.type === "alert" ? 700 : item.type === "price" ? 700 : 500,
                color: item.type === "alert" && blinkOn ? item.color : item.type === "alert" ? `${item.color}88` : item.color,
                padding: "0 20px",
                fontFamily: item.type === "price" ? FONT.mono : FONT.sans,
                transition: "color 0.3s",
                letterSpacing: item.type === "price" ? "0.02em" : "normal",
              }}>
                {item.text}
              </span>
              <span style={{ color: C.textLow, fontSize: 16, opacity: 0.3 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Pause Hint */}
      {paused && (
        <div style={{
          position: "absolute", right: 14,
          fontSize: 10, color: C.textLow,
          background: C.surface, padding: "2px 8px",
          borderRadius: 4, pointerEvents: "none",
        }}>⏸ pausiert</div>
      )}

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50%       { opacity: 0.3 }
        }
      `}</style>
    </div>
  );
}
