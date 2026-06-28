import React, { useEffect, useRef, useState } from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CHART v2 — Binance WebSocket + Elliott-Wellen-Labels
// ─────────────────────────────────────────────────────────────────────────────

const SYMBOL_MAP = {
  btc: "BTCUSDT",
  eth: "ETHUSDT",
  sol: "SOLUSDT",
};

function useBinanceKlines(assetId, interval="1h", limit=48) {
  const [candles, setCandles] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const sym = SYMBOL_MAP[assetId];
    if (!sym) return;
    const symLower = sym.toLowerCase();

    // REST: historische Kerzen
    fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        setCandles(data.map(k => ({
          t: new Date(k[0]).toLocaleTimeString("de-AT", {hour:"2-digit", minute:"2-digit"}),
          ts: k[0],
          o: parseFloat(k[1]),
          h: parseFloat(k[2]),
          l: parseFloat(k[3]),
          c: parseFloat(k[4]),
        })));
      })
      .catch(() => {});

    // WS: Live-Update
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symLower}@kline_${interval}`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = e => {
      try {
        const { k } = JSON.parse(e.data);
        if (!k) return;
        const candle = { t: new Date(k.t).toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"}), ts:k.t, o:parseFloat(k.o), h:parseFloat(k.h), l:parseFloat(k.l), c:parseFloat(k.c), live:true };
        setCandles(prev => {
          const upd = [...prev];
          if (upd.length && upd[upd.length-1].ts === candle.ts) upd[upd.length-1] = candle;
          else { upd.push(candle); if (upd.length > limit) upd.shift(); }
          return upd;
        });
      } catch {}
    };
    return () => ws.close();
  }, [assetId, interval, limit]);

  return { candles, connected };
}

export default function LiveChart({ assetId, unit="$", h=280, interval="1h", waveLabels=[] }) {
  const { candles, connected } = useBinanceKlines(assetId, interval, 48);

  if (!SYMBOL_MAP[assetId]) {
    return <div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",color:C.textLow,fontSize:13}}>Kein Live-Chart für diesen Asset</div>;
  }
  if (!candles.length) {
    return <div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",color:C.textLow,fontSize:13,gap:8}}>
      <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span> Lade Kerzen von Binance...
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>;
  }

  const W = 1000, PAD = {t:28, r:78, b:36, l:8};
  const chartW = W - PAD.l - PAD.r;
  const chartH = h - PAD.t - PAD.b;
  const n = candles.length;

  const allH = candles.map(c=>c.h), allL = candles.map(c=>c.l);
  const mx = Math.max(...allH), mn = Math.min(...allL);
  const rng = mx-mn||1, pad = rng*0.08;
  const top = mx+pad, bot = mn-pad, span = top-bot;

  const toY = v => PAD.t + ((top-v)/span)*chartH;
  const gap = chartW/n;
  const cw = Math.max(gap*0.6, 2);
  const cx = i => PAD.l + i*gap + gap/2;

  const yTicks = Array.from({length:6},(_,i) => bot + (span/5)*i);
  const last = candles[candles.length-1];
  const bull = c => c.c >= c.o;

  return (
    <div style={{position:"relative"}}>
      {/* Live Badge */}
      <div style={{position:"absolute",top:6,left:PAD.l+4,display:"flex",alignItems:"center",gap:5,zIndex:1}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:connected?C.bull:C.textLow,display:"inline-block",boxShadow:connected?`0 0 6px ${C.bull}`:"none",animation:connected?"pulse 1.5s infinite":"none"}}/>
        <span style={{fontSize:10,color:connected?C.bull:C.textLow,fontWeight:700}}>{connected?"LIVE":"LADEN"}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${h}`} style={{width:"100%",height:h,display:"block"}}>
        {/* Grid */}
        {yTicks.map((v,i)=>(
          <g key={i}>
            <line x1={PAD.l} y1={toY(v)} x2={W-PAD.r} y2={toY(v)} stroke={C.border} strokeWidth={1}/>
            <text x={W-PAD.r+6} y={toY(v)+4} fill={C.textMid} fontSize={19} fontFamily={FONT.mono}>
              {unit}{v>=10000?Math.round(v).toLocaleString("de-DE"):v>=100?Math.round(v).toLocaleString("de-DE"):v.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Kerzen */}
        {candles.map((c,i)=>{
          const isUp = bull(c);
          const col = isUp ? C.bull : C.bear;
          const x = cx(i);
          const bT = toY(Math.max(c.o,c.c));
          const bB = toY(Math.min(c.o,c.c));
          const bH = Math.max(bB-bT, 1.5);
          const isLast = i===n-1;
          return (
            <g key={i}>
              <line x1={x} y1={toY(c.h)} x2={x} y2={bT} stroke={col} strokeWidth={1.5}/>
              <rect x={x-cw/2} y={bT} width={cw} height={bH} fill={col} fillOpacity={isUp?0.9:0.85} rx={1}/>
              <line x1={x} y1={bB} x2={x} y2={toY(c.l)} stroke={col} strokeWidth={1.5}/>
              {isLast&&c.live&&<rect x={x-cw/2-2} y={bT-2} width={cw+4} height={bH+4} fill="none" stroke={col} strokeWidth={1} strokeDasharray="3 2" rx={2} opacity={0.5}/>}
            </g>
          );
        })}

        {/* Elliott-Wellen-Labels */}
        {waveLabels.map((wl,i)=>{
          // wl = { candleIndex: number, label: "1"|"2"|"3"|"4"|"5"|"A"|"B"|"C", position: "top"|"bottom" }
          const idx = wl.candleIndex;
          if (idx < 0 || idx >= candles.length) return null;
          const c = candles[idx];
          const x = cx(idx);
          const isTop = wl.position === "top";
          const y = isTop ? toY(c.h) - 16 : toY(c.l) + 16;
          const col = ["A","B","C"].includes(wl.label) ? C.bear : C.gold;
          return (
            <g key={i}>
              {/* Verbindungslinie */}
              <line x1={x} y1={isTop?toY(c.h)-2:toY(c.l)+2} x2={x} y2={isTop?y+12:y-12}
                stroke={col} strokeWidth={1} strokeDasharray="2 2" opacity={0.7}/>
              {/* Label-Hintergrund */}
              <rect x={x-10} y={isTop?y-12:y-4} width={20} height={16} fill={C.bg} rx={3} opacity={0.85}/>
              {/* Label-Text */}
              <text x={x} y={isTop?y+1:y+9} textAnchor="middle"
                fill={col} fontSize={16} fontWeight="900" fontFamily={FONT.mono}>{wl.label}</text>
            </g>
          );
        })}

        {/* X-Achse Labels */}
        {candles.map((c,i)=>{
          if (i%Math.max(1,Math.floor(n/8))!==0 && i!==n-1) return null;
          return <text key={i} x={cx(i)} y={h-4} fill={C.textLow} fontSize={18} textAnchor="middle" fontFamily={FONT.mono}>{c.t}</text>;
        })}

        {/* Letzter Preis */}
        {last&&(()=>{
          const y = toY(last.c);
          const col = bull(last)?C.bull:C.bear;
          return (
            <g>
              <line x1={PAD.l} y1={y} x2={W-PAD.r} y2={y} stroke={col} strokeWidth={1} strokeDasharray="4 3" opacity={0.6}/>
              <rect x={W-PAD.r+2} y={y-11} width={74} height={22} fill={col} rx={3}/>
              <text x={W-PAD.r+39} y={y+5} fill="#000" fontSize={17} fontWeight="700" textAnchor="middle" fontFamily={FONT.mono}>
                {unit}{last.c>=1000?Math.round(last.c).toLocaleString("de-DE"):last.c.toFixed(2)}
              </text>
            </g>
          );
        })()}
      </svg>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
