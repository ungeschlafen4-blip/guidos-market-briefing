import React, { useEffect, useState } from "react";
import { useLivePrice } from "../hooks/useLivePrice";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// NEWS TICKER v3 — nutzt denselben WebSocket-Live-Preis wie die Asset-Karten
// statt der separaten 30s-REST-Preise. Damit ist der Ticker garantiert
// im selben Sekundentakt synchron mit dem, was unten in den Karten steht.
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_ALERTS = [
  { type:"alert", color:C.bear, text:"📅 CPI Juni am 14. Juli — wichtigster Makro-Event" },
  { type:"alert", color:C.textMid, text:"📅 FOMC 28.–29. Juli — möglicher erster Hike" },
];

function fmtTickerPrice(price, id) {
  if (price === null || price === undefined) return null;
  if (id === "btc" || id === "eth") return Math.round(price).toLocaleString("de-DE");
  return price.toLocaleString("de-DE", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

// Einzelne Live-Preis-Komponenten für BTC/ETH/SOL — jede hängt am selben
// WebSocket-Hook wie die jeweilige Asset-Karte
function LiveTickerPrice({ assetId, emoji, name, unit, fallbackPrice, fallbackChg }) {
  const { price } = useLivePrice(assetId);
  const displayPrice = fmtTickerPrice(price, assetId) || fallbackPrice;
  // Trend grob aus 24h-Veränderung (vom Snapshot) ableiten, da der reine
  // Trade-Preis keine Richtung direkt mitliefert
  const color = (fallbackChg ?? 0) >= 0 ? C.bull : C.bear;
  return (
    <span style={{ fontSize:13, fontWeight:700, color, padding:"0 20px", fontFamily:FONT.mono }}>
      {emoji} {name}  {unit}{displayPrice}  {(fallbackChg ?? 0) >= 0 ? "+" : ""}{fallbackChg}%
    </span>
  );
}

export default function NewsTicker({ isMobile, liveAssets = [] }) {
  const [paused, setPaused] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlinkOn(b => !b), 800);
    return () => clearInterval(t);
  }, []);

  const cryptoAssets = liveAssets.filter(a => ["btc","eth","sol"].includes(a.id));
  const otherAssets  = liveAssets.filter(a => !["btc","eth","sol"].includes(a.id));

  return (
    <div style={{
      background: C.surface, border:`1px solid ${C.border}`, borderRadius:RADIUS.md,
      overflow:"hidden", marginBottom:18, display:"flex", alignItems:"center", height:42,
    }}>
      <div style={{ background:C.bg, borderRight:`1px solid ${C.border}`, padding:"0 14px", height:"100%", display:"flex", alignItems:"center", flexShrink:0, gap:6 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:C.bull, display:"inline-block", boxShadow:`0 0 6px ${C.bull}`, animation:"pulse 1.5s infinite" }} />
        <span style={{ fontSize:11, fontWeight:800, color:C.textMid, letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
          {isMobile ? "LIVE" : "LIVE TICKER"}
        </span>
      </div>

      <div style={{ overflow:"hidden", flex:1, position:"relative", cursor:"pointer" }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} title="Hover zum Anhalten">
        {liveAssets.length === 0 ? (
          <div style={{ padding:"0 20px", fontSize:13, color:C.textLow }}>Lade Live-Preise...</div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", animation: paused ? "none" : "ticker 60s linear infinite", whiteSpace:"nowrap" }}>
            {/* Zweimal hintereinander für nahtlose Schleife */}
            {[0, 1].map(loop => (
              <React.Fragment key={loop}>
                {cryptoAssets.map(a => (
                  <span key={`${loop}-${a.id}`} style={{ display:"inline-flex", alignItems:"center" }}>
                    <LiveTickerPrice assetId={a.id} emoji={a.emoji} name={a.name.toUpperCase()} unit={a.unit} fallbackPrice={a.price} fallbackChg={a.chg24}/>
                    <span style={{ color:C.textLow, fontSize:16, opacity:0.3 }}>·</span>
                  </span>
                ))}
                {otherAssets.map(a => (
                  <span key={`${loop}-${a.id}`} style={{ display:"inline-flex", alignItems:"center" }}>
                    <span style={{ fontSize:13, fontWeight:700, color: a.chg24>=0?C.bull:C.bear, padding:"0 20px", fontFamily:FONT.mono }}>
                      {a.emoji} {a.name.toUpperCase()}  {a.unit}{a.price}  {a.chg24>=0?"+":""}{a.chg24}%
                    </span>
                    <span style={{ color:C.textLow, fontSize:16, opacity:0.3 }}>·</span>
                  </span>
                ))}
                {STATIC_ALERTS.map((item,i) => (
                  <span key={`${loop}-alert-${i}`} style={{ display:"inline-flex", alignItems:"center" }}>
                    <span style={{ fontSize:13, fontWeight:700, color: blinkOn ? item.color : `${item.color}88`, padding:"0 20px", transition:"color 0.3s" }}>{item.text}</span>
                    <span style={{ color:C.textLow, fontSize:16, opacity:0.3 }}>·</span>
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {paused && <div style={{ position:"absolute", right:14, fontSize:10, color:C.textLow, background:C.surface, padding:"2px 8px", borderRadius:4, pointerEvents:"none" }}>⏸ pausiert</div>}

      <style>{`
        @keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
      `}</style>
    </div>
  );
}
