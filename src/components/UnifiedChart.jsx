import React, { useState, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED CHART v2 — Echte Daten + dynamische Datums-Achse
// Krypto (BTC/ETH/SOL): echte historische Daten von Binance REST API (kostenlos, kein Key)
// Metalle/Makro: weiterhin simuliert, aber mit korrektem heutigem Datum auf X-Achse
// X-Achse zeigt immer die letzten 7 Tage bis HEUTE — nicht mehr fest "Mo-So"
// ─────────────────────────────────────────────────────────────────────────────

const BINANCE_SYMBOL = { btc: "BTCUSDT", eth: "ETHUSDT", sol: "SOLUSDT" };

// Wochentag-Kürzel auf Deutsch
const DAY_LABELS = ["So","Mo","Di","Mi","Do","Fr","Sa"];

function formatDayLabel(date) {
  return DAY_LABELS[date.getDay()];
}

// ── Simulierte Daten für Metalle/Makro — jetzt mit echtem heutigem Datum ─────
function genSimulatedPath(startPrice, endPrice, volatility, seed = 42) {
  const points = 56; // alle 3h für 7 Tage
  let price = startPrice;
  const trend = (endPrice - startPrice) / points;
  const data = [];
  let rng = seed;
  const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return (rng >>> 0) / 0xffffffff; };

  const now = new Date();
  const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < points; i++) {
    price += trend + (rand() - 0.5) * volatility;
    const pointTime = new Date(startTime.getTime() + i * (7*24*60*60*1000 / points));
    const isNewDay = i === 0 || new Date(startTime.getTime() + (i-1) * (7*24*60*60*1000/points)).getDate() !== pointTime.getDate();
    const label = isNewDay ? formatDayLabel(pointTime) : "";
    data.push({ t: label, p: parseFloat(price.toFixed(price > 100 ? 0 : 2)), ts: pointTime.getTime() });
  }
  return data;
}

const SIM_CONFIG = {
  gold:   { start: 4090, end: 4036, vol: 8,    seed: 44 },
  silver: { start: 66.5, end: 57.0, vol: 0.4,  seed: 55 },
  spx:    { start: 7530, end: 7354, vol: 25,   seed: 66 },
  ndx:    { start: 22800,end: 22180,vol: 80,   seed: 77 },
  wti:    { start: 74.2, end: 71.9, vol: 0.5,  seed: 88 },
  dxy:    { start: 100.8,end: 101.6,vol: 0.15, seed: 99 },
  us10y:  { start: 4.38, end: 4.46, vol: 0.02, seed: 110 },
  vix:    { start: 21.5, end: 18.89,vol: 0.4,  seed: 121 },
};

// ── ECHTE Binance-Daten holen (für BTC/ETH/SOL) ───────────────────────────────
async function fetchBinanceHistory(symbol) {
  // 7 Tage, 3h-Kerzen = 56 Datenpunkte — REST, kein WebSocket nötig für Linienchart
  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=3h&limit=56`);
  if (!res.ok) throw new Error(`Binance ${res.status}`);
  const raw = await res.json();
  let lastDate = null;
  return raw.map(k => {
    const date = new Date(k[0]);
    const isNewDay = lastDate === null || lastDate.getDate() !== date.getDate();
    lastDate = date;
    return {
      t: isNewDay ? formatDayLabel(date) : "",
      p: parseFloat(k[4]), // Schlusskurs der Kerze
      ts: k[0],
    };
  });
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

export default function UnifiedChart({ assetId, unit="$", h=240, levels=[], color, currentPrice }) {
  const [data, setData] = useState(null);
  const isCrypto = !!BINANCE_SYMBOL[assetId];

  useEffect(() => {
    let cancelled = false;
    setData(null);

    if (isCrypto) {
      fetchBinanceHistory(BINANCE_SYMBOL[assetId])
        .then(d => { if (!cancelled) setData(d); })
        .catch(() => {
          if (!cancelled) {
            // Fallback: simulierte Daten falls Binance nicht erreichbar
            const cfg = { start: 60000, end: 60000, vol: 200, seed: 1 };
            setData(genSimulatedPath(cfg.start, cfg.end, cfg.vol, cfg.seed));
          }
        });
    } else {
      const cfg = SIM_CONFIG[assetId];
      if (cfg) {
        setData(genSimulatedPath(cfg.start, cfg.end, cfg.vol, cfg.seed));
      }
    }

    return () => { cancelled = true; };
  }, [assetId, isCrypto]);

  if (!data) {
    return (
      <div style={{ height:h, display:"flex", alignItems:"center", justifyContent:"center", color:C.textLow, fontSize:13, gap:8 }}>
        <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Lade {isCrypto ? "Binance-Daten" : "Daten"}...
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Letzten Punkt mit Live-Preis überschreiben
  let displayData = [...data];
  if (currentPrice) {
    const numPrice = parseFloat(String(currentPrice).replace(/\./g,"").replace(",","."));
    if (!isNaN(numPrice)) {
      displayData = [...displayData.slice(0,-1), {...displayData[displayData.length-1], p: numPrice}];
    }
  }

  const vals = displayData.map(d=>d.p);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = (mx-mn)*0.1 || mn*0.01;
  const yMin = mn-pad, yMax = mx+pad;

  const decimals = assetId==="us10y" ? 2 : ["vix","sol","silver","wti","dxy"].includes(assetId) ? 2 : 0;

  const start = displayData[0];
  const end   = displayData[displayData.length-1];
  const isUp  = end.p >= start.p;
  const trendCol = isUp ? C.bull : C.bear;
  const pctChange = (((end.p - start.p) / start.p) * 100).toFixed(1);

  return (
    <div style={{ position:"relative" }}>
      <div style={{ position:"absolute", top:4, left:8, zIndex:1, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:trendCol, display:"inline-block", animation:"pulse 2s infinite" }}/>
        <span style={{ fontSize:10, fontWeight:800, color:trendCol }}>
          {isCrypto ? "7 TAGE LIVE" : "7 TAGE"}
        </span>
        <span style={{ fontSize:10, fontWeight:700, color:trendCol }}>{isUp?"+":""}{pctChange}%</span>
      </div>

      <ResponsiveContainer width="100%" height={h}>
        <LineChart data={displayData} margin={{ top:24, right:16, left:4, bottom:24 }}>
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
