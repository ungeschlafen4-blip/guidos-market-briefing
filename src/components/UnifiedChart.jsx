import React, { useState, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED CHART v3
// - Krypto: echte Binance-Historie (REST, kein Key)
// - Gold/Silber/Makro: echte Yahoo-Finance-Historie via CORS-Proxy
// - Kein hartes Überschreiben des letzten Punkts mehr (das verursachte den "Sprung")
//   Stattdessen: Live-Preis wird nur als zusätzlicher, klar markierter Punkt angehängt
//   wenn er sich sinnvoll an die Historie anschließt — sonst wird die echte Historie
//   unverändert gezeigt, damit die Kurvenform nicht verzerrt wird.
// ─────────────────────────────────────────────────────────────────────────────

const BINANCE_SYMBOL = { btc: "BTCUSDT", eth: "ETHUSDT", sol: "SOLUSDT" };
const YAHOO_SYMBOL = {
  gold:   "GC=F",      // Gold Futures
  silver: "SI=F",      // Silber Futures
  spx:    "^GSPC",
  ndx:    "^NDX",
  wti:    "CL=F",
  dxy:    "DX-Y.NYB",
  us10y:  "^TNX",
  vix:    "^VIX",
};

const DAY_LABELS = ["So","Mo","Di","Mi","Do","Fr","Sa"];
function formatDayLabel(date) { return DAY_LABELS[date.getDay()]; }

// ── BINANCE: echte Krypto-Historie ────────────────────────────────────────────
async function fetchBinanceHistory(symbol) {
  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=3h&limit=56`);
  if (!res.ok) throw new Error(`Binance ${res.status}`);
  const raw = await res.json();
  let lastDate = null;
  return raw.map(k => {
    const date = new Date(k[0]);
    const isNewDay = lastDate === null || lastDate.getDate() !== date.getDate();
    lastDate = date;
    return { t: isNewDay ? formatDayLabel(date) : "", p: parseFloat(k[4]), ts: k[0] };
  });
}

// ── YAHOO FINANCE: echte Historie für Gold/Silber/Makro ──────────────────────
async function fetchYahooHistory(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1h&range=7d`;
  const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied);
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error("Keine Yahoo-Daten");

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  let lastDate = null;
  const points = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] === null || closes[i] === undefined) continue; // Marktschluss-Lücken überspringen
    const date = new Date(timestamps[i] * 1000);
    const isNewDay = lastDate === null || lastDate.getDate() !== date.getDate();
    lastDate = date;
    points.push({ t: isNewDay ? formatDayLabel(date) : "", p: closes[i], ts: timestamps[i] * 1000 });
  }
  if (!points.length) throw new Error("Leere Yahoo-Datenreihe");
  return points;
}

function ChartTooltip({ active, payload, label, unit, decimals }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const point = payload[0]?.payload;
  const dateStr = point?.ts ? new Date(point.ts).toLocaleString("de-AT", { weekday:"short", day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }) : label;
  return (
    <div style={{ background:C.card, border:`1px solid ${C.borderHi}`, borderRadius:RADIUS.md, padding:"10px 14px", boxShadow:"0 8px 24px rgba(0,0,0,0.6)", pointerEvents:"none" }}>
      <div style={{ color:C.textMid, marginBottom:4, fontSize:11 }}>{dateStr}</div>
      <div style={{ fontWeight:700, fontSize:17, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono, color:C.textHi }}>
        {unit}{typeof val==="number" ? val.toLocaleString("de-DE", { minimumFractionDigits:decimals||0, maximumFractionDigits:decimals||2 }) : val}
      </div>
    </div>
  );
}

export default function UnifiedChart({ assetId, unit="$", h=240, levels=[] }) {
  const [data, setData] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const isCrypto = !!BINANCE_SYMBOL[assetId];
  const hasYahoo = !!YAHOO_SYMBOL[assetId];

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setIsLive(false);

    async function load() {
      if (isCrypto) {
        try {
          const d = await fetchBinanceHistory(BINANCE_SYMBOL[assetId]);
          if (!cancelled) { setData(d); setIsLive(true); }
          return;
        } catch { /* fällt durch zu Fehlerzustand unten */ }
      } else if (hasYahoo) {
        try {
          const d = await fetchYahooHistory(YAHOO_SYMBOL[assetId]);
          if (!cancelled) { setData(d); setIsLive(true); }
          return;
        } catch { /* fällt durch */ }
      }
      // Kein echter Datensatz verfügbar
      if (!cancelled) { setData([]); setIsLive(false); }
    }

    load();
    return () => { cancelled = true; };
  }, [assetId, isCrypto, hasYahoo]);

  if (data === null) {
    return (
      <div style={{ height:h, display:"flex", alignItems:"center", justifyContent:"center", color:C.textLow, fontSize:13, gap:8 }}>
        <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Lade echte Marktdaten...
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ height:h, display:"flex", alignItems:"center", justifyContent:"center", color:C.textLow, fontSize:13, textAlign:"center", padding:"0 20px" }}>
        Chart-Daten aktuell nicht verfügbar (Quelle nicht erreichbar)
      </div>
    );
  }

  const vals = data.map(d=>d.p);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = (mx-mn)*0.1 || mn*0.01;
  const yMin = mn-pad, yMax = mx+pad;

  const decimals = assetId==="us10y" ? 2 : ["vix","sol","silver","wti","dxy"].includes(assetId) ? 2 : 0;

  const start = data[0];
  const end   = data[data.length-1];
  const isUp  = end.p >= start.p;
  const trendCol = isUp ? C.bull : C.bear;
  const pctChange = (((end.p - start.p) / start.p) * 100).toFixed(1);

  return (
    <div style={{ position:"relative" }}>
      <div style={{ position:"absolute", top:4, left:8, zIndex:1, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background: isLive ? trendCol : C.textLow, display:"inline-block", animation: isLive ? "pulse 2s infinite" : "none" }}/>
        <span style={{ fontSize:10, fontWeight:800, color: isLive ? trendCol : C.textLow }}>
          {isLive ? "7 TAGE LIVE" : "7 TAGE"}
        </span>
        <span style={{ fontSize:10, fontWeight:700, color:trendCol }}>{isUp?"+":""}{pctChange}%</span>
      </div>

      <ResponsiveContainer width="100%" height={h}>
        <LineChart data={data} margin={{ top:24, right:16, left:4, bottom:24 }}>
          <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill:C.textMid, fontSize:12, fontFamily:FONT.mono }} width={68}
            tickFormatter={v=>`${unit}${v>=1000?Math.round(v).toLocaleString("de-DE"):v.toFixed(decimals)}`}
            axisLine={{ stroke:C.borderHi }} tickLine={{ stroke:C.border }}
          />
          <XAxis
            dataKey="t"
            tick={{ fill:C.textMid, fontSize:11 }}
            axisLine={{ stroke:C.borderHi }} tickLine={{ stroke:C.border }}
            interval={0}
            height={28}
          />
          <Tooltip content={<ChartTooltip unit={unit} decimals={decimals}/>} cursor={{ stroke:C.textHi, strokeWidth:1, strokeDasharray:"4 2" }}/>
          {levels.map((lv,i) => (
            <ReferenceLine key={i} y={lv.v} stroke={lv.col} strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value:lv.lbl, position:"insideTopRight", fill:lv.col, fontSize:11, fontWeight:700 }}/>
          ))}
          <Line type="monotone" dataKey="p" stroke={trendCol} strokeWidth={2.5} dot={false} isAnimationActive={false}
            activeDot={{ r:6, fill:trendCol, stroke:C.bg, strokeWidth:2 }}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
