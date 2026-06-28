import React, { useEffect, useRef, useState } from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CHART — Binance WebSocket Candlestick-Daten
// Echte Kerzen die sich live updaten wenn neuer Preis kommt
// ─────────────────────────────────────────────────────────────────────────────

const BINANCE_WS = "wss://stream.binance.com:9443/ws";

// Symbol-Mapping: unser ID → Binance Symbol
const SYMBOL_MAP = {
  btc: "btcusdt",
  eth: "ethusdt",
  sol: "solusdt",
};

// Farben
const BULL_COL = C.bull;
const BEAR_COL = C.bear;
const GRID_COL = C.border;

function useBinanceKlines(symbol, interval = "1h", limit = 48) {
  const [candles, setCandles] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!symbol) return;
    const binanceSym = SYMBOL_MAP[symbol] || symbol;

    // 1. Historische Kerzen via REST
    fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSym.toUpperCase()}&interval=${interval}&limit=${limit}`)
      .then(r => r.json())
      .then(data => {
        const parsed = data.map(k => ({
          t: new Date(k[0]).toLocaleTimeString("de-AT", { hour:"2-digit", minute:"2-digit" }),
          o: parseFloat(k[1]),
          h: parseFloat(k[2]),
          l: parseFloat(k[3]),
          c: parseFloat(k[4]),
        }));
        setCandles(parsed);
      })
      .catch(() => {});

    // 2. Live-Update via WebSocket
    const ws = new WebSocket(`${BINANCE_WS}/${binanceSym}@kline_${interval}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      const k = msg.k;
      if (!k) return;
      const candle = {
        t: new Date(k.t).toLocaleTimeString("de-AT", { hour:"2-digit", minute:"2-digit" }),
        o: parseFloat(k.o),
        h: parseFloat(k.h),
        l: parseFloat(k.l),
        c: parseFloat(k.c),
        live: true,
      };
      setCandles(prev => {
        const updated = [...prev];
        // Letzte Kerze updaten oder neue hinzufügen
        if (updated.length > 0 && updated[updated.length-1].t === candle.t) {
          updated[updated.length-1] = candle;
        } else {
          updated.push(candle);
          if (updated.length > limit) updated.shift();
        }
        return updated;
      });
    };

    return () => { ws.close(); };
  }, [symbol, interval, limit]);

  return { candles, connected };
}

// SVG Candlestick Chart
function CandleChart({ candles, unit = "$", h = 280, connected = false }) {
  if (!candles.length) {
    return (
      <div style={{ height: h, display:"flex", alignItems:"center", justifyContent:"center", color: C.textLow, fontSize:13 }}>
        ⟳ Lade Kerzen-Daten...
      </div>
    );
  }

  const W = 1000;
  const PAD = { t: 20, r: 72, b: 36, l: 8 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = h - PAD.t - PAD.b;
  const n = candles.length;

  const allH = candles.map(c => c.h);
  const allL = candles.map(c => c.l);
  const mx = Math.max(...allH);
  const mn = Math.min(...allL);
  const rng = mx - mn || 1;
  const pad = rng * 0.08;
  const top = mx + pad;
  const bot = mn - pad;
  const span = top - bot;

  const toY = v => PAD.t + ((top - v) / span) * chartH;
  const gap = chartW / n;
  const cw = Math.max(gap * 0.6, 2);
  const cx = i => PAD.l + i * gap + gap / 2;

  // Y-Achse Ticks
  const yTicks = Array.from({ length: 6 }, (_, i) => bot + (span / 5) * i);

  // X-Achse Labels (jeden 8. Punkt)
  const xLabels = candles.filter((_, i) => i % Math.max(1, Math.floor(n / 8)) === 0 || i === n - 1);

  return (
    <div style={{ position:"relative" }}>
      {/* Live-Badge */}
      <div style={{ position:"absolute", top:4, left:PAD.l, display:"flex", alignItems:"center", gap:5, zIndex:1 }}>
        <span style={{
          width:7, height:7, borderRadius:"50%",
          background: connected ? C.bull : C.textLow,
          display:"inline-block",
          boxShadow: connected ? `0 0 6px ${C.bull}` : "none",
          animation: connected ? "pulse 1.5s infinite" : "none",
        }} />
        <span style={{ fontSize:10, color: connected ? C.bull : C.textLow, fontWeight:700 }}>
          {connected ? "LIVE" : "LADEN"}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${h}`} style={{ width:"100%", height:h, display:"block" }}>
        {/* Grid-Linien */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)}
              stroke={GRID_COL} strokeWidth={1} />
            <text x={W - PAD.r + 6} y={toY(v) + 4}
              fill={C.textMid} fontSize={20} fontFamily={FONT.mono}>
              {unit}{v >= 10000
                ? Math.round(v).toLocaleString("de-DE")
                : v >= 1000
                ? Math.round(v).toLocaleString("de-DE")
                : v.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Kerzen */}
        {candles.map((c, i) => {
          const bull = c.c >= c.o;
          const col = bull ? BULL_COL : BEAR_COL;
          const x = cx(i);
          const bodyT = toY(Math.max(c.o, c.c));
          const bodyB = toY(Math.min(c.o, c.c));
          const bodyH = Math.max(bodyB - bodyT, 1.5);
          const isLast = i === candles.length - 1;

          return (
            <g key={i}>
              {/* Docht oben */}
              <line x1={x} y1={toY(c.h)} x2={x} y2={bodyT}
                stroke={col} strokeWidth={1.5} />
              {/* Körper */}
              <rect x={x - cw / 2} y={bodyT} width={cw} height={bodyH}
                fill={col} fillOpacity={bull ? 0.9 : 0.85} rx={1}
                stroke={isLast ? "#fff" : col} strokeWidth={isLast ? 0.8 : 0}
              />
              {/* Docht unten */}
              <line x1={x} y1={bodyB} x2={x} y2={toY(c.l)}
                stroke={col} strokeWidth={1.5} />
              {/* Live-Kerze Glow */}
              {isLast && c.live && (
                <rect x={x - cw / 2 - 2} y={bodyT - 2} width={cw + 4} height={bodyH + 4}
                  fill="none" stroke={col} strokeWidth={1} strokeDasharray="3 2" rx={2} opacity={0.5} />
              )}
            </g>
          );
        })}

        {/* X-Achse Labels */}
        {candles.map((c, i) => {
          if (i % Math.max(1, Math.floor(n / 8)) !== 0 && i !== n - 1) return null;
          return (
            <text key={i} x={cx(i)} y={h - 4}
              fill={C.textLow} fontSize={19} textAnchor="middle" fontFamily={FONT.mono}>
              {c.t}
            </text>
          );
        })}

        {/* Letzter Preis als horizontale Linie */}
        {candles.length > 0 && (() => {
          const last = candles[candles.length - 1];
          const y = toY(last.c);
          const bull = last.c >= last.o;
          const col = bull ? BULL_COL : BEAR_COL;
          return (
            <g>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                stroke={col} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
              <rect x={W - PAD.r + 2} y={y - 11} width={68} height={22} fill={col} rx={3} />
              <text x={W - PAD.r + 36} y={y + 5}
                fill="#000" fontSize={18} fontWeight="700" textAnchor="middle" fontFamily={FONT.mono}>
                {unit}{last.c >= 1000 ? Math.round(last.c).toLocaleString("de-DE") : last.c.toFixed(2)}
              </text>
            </g>
          );
        })()}
      </svg>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

// ── Haupt-Export: LiveChart Komponente ────────────────────────────────────────
export default function LiveChart({ assetId, unit = "$", h = 280, interval = "1h" }) {
  const binanceSym = SYMBOL_MAP[assetId];

  // Nur für Krypto-Assets die Binance-WebSocket nutzen
  if (!binanceSym) {
    return (
      <div style={{ height: h, display:"flex", alignItems:"center", justifyContent:"center",
        color: C.textLow, fontSize:13, background: C.surface, borderRadius: RADIUS.md }}>
        Chart nicht verfügbar
      </div>
    );
  }

  return <LiveChartInner assetId={assetId} unit={unit} h={h} interval={interval} />;
}

function LiveChartInner({ assetId, unit, h, interval }) {
  const { candles, connected } = useBinanceKlines(assetId, interval, 48);
  return <CandleChart candles={candles} unit={unit} h={h} connected={connected} />;
}
