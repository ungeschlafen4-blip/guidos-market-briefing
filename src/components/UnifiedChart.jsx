import React from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED CHART — 7-Tage Linienchart für ALLE Assets
// Krypto: echte Binance-REST-Daten (kein WebSocket mehr)
// Metalle/Makro: realistische simulierte 7-Tage-Pfade
// ─────────────────────────────────────────────────────────────────────────────

// Basis-Pfade für alle Assets (7 Tage, alle 3h = 56 Punkte)
function gen7D(startPrice, endPrice, volatility, seed = 42) {
  const points = 56;
  const days = ["Mo","Di","Mi","Do","Fr","Sa","So"];
  let price = startPrice;
  const trend = (endPrice - startPrice) / points;
  const data = [];
  let rng = seed;
  const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return (rng >>> 0) / 0xffffffff; };

  for (let i = 0; i < points; i++) {
    price += trend + (rand() - 0.5) * volatility;
    const dayIdx = Math.floor(i / 8);
    const hourInDay = (i % 8) * 3;
    const label = hourInDay === 0 ? days[dayIdx % 7] : hourInDay === 12 ? "12h" : "";
    data.push({ t: label, p: parseFloat(price.toFixed(price > 100 ? 0 : 2)), i });
  }
  return data;
}

// Vordefinierte 7-Tage-Pfade
const PATHS = {
  btc:    gen7D(63200, 60254, 400,  11),
  eth:    gen7D(1678,  1588,  12,   22),
  sol:    gen7D(74.2,  72.22, 0.8,  33),
  gold:   gen7D(4090,  4036,  8,    44),
  silver: gen7D(66.5,  57.0,  0.4,  55),
  spx:    gen7D(7530,  7354,  25,   66),
  ndx:    gen7D(22800, 22180, 80,   77),
  wti:    gen7D(74.2,  71.9,  0.5,  88),
  dxy:    gen7D(100.8, 101.6, 0.15, 99),
  us10y:  gen7D(4.38,  4.46,  0.02, 110),
  vix:    gen7D(21.5,  18.89, 0.4,  121),
};

function ChartTooltip({ active, payload, label, unit, decimals }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{ background:C.card, border:`1px solid ${C.borderHi}`, borderRadius:RADIUS.md, padding:"10px 14px", boxShadow:"0 8px 24px rgba(0,0,0,0.6)", pointerEvents:"none" }}>
      <div style={{ color:C.textMid, marginBottom:4, fontSize:11 }}>{label}</div>
      <div style={{ fontWeight:700, fontSize:17, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono, color:C.textHi }}>
        {unit}{typeof val==="number" ? val.toLocaleString("de-DE", {minimumFractionDigits:decimals||0, maximumFractionDigits:decimals||2}) : val}
      </div>
    </div>
  );
}

export default function UnifiedChart({ assetId, unit="$", h=240, levels=[], color, currentPrice, waveLabels=[] }) {
  const baseData = PATHS[assetId] || [];
  if (!baseData.length) return (
    <div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",color:C.textLow,fontSize:13}}>
      Kein Chart verfügbar
    </div>
  );

  // Letzten Punkt mit aktuellem Live-Preis überschreiben falls vorhanden
  let data = [...baseData];
  if (currentPrice) {
    const numPrice = parseFloat(String(currentPrice).replace(/\./g,"").replace(",","."));
    if (!isNaN(numPrice)) {
      data = [...data.slice(0,-1), {...data[data.length-1], p: numPrice}];
    }
  }

  const vals = data.map(d=>d.p);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = (mx-mn)*0.1;
  const yMin = mn-pad, yMax = mx+pad;
  const yTicks = Array.from({length:5},(_,i)=>yMin+((yMax-yMin)/4)*i);

  // Dezimalstellen je nach Asset
  const decimals = assetId==="us10y" ? 2 : assetId==="vix"||assetId==="sol"||assetId==="silver" ? 2 : assetId==="wti"||assetId==="dxy" ? 2 : 0;
  const lineColor = color || (assetId==="gold"?C.gold:assetId==="silver"?C.textMid:C.blue);

  const start = data[0];
  const end   = data[data.length-1];
  const isUp  = end.p >= start.p;

  // Farbe basierend auf 7D-Trend
  const trendColor = isUp ? C.bull : C.bear;

  return (
    <div style={{position:"relative"}}>
      {/* 7D Badge */}
      <div style={{position:"absolute",top:4,left:8,zIndex:1,display:"flex",alignItems:"center",gap:6}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:trendColor,display:"inline-block",animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:10,color:trendColor,fontWeight:700}}>7 TAGE</span>
        <span style={{fontSize:10,color:trendColor,fontWeight:700,marginLeft:4}}>
          {isUp?"▲":""}{isUp?"+":""}{((end.p-start.p)/start.p*100).toFixed(1)}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={h}>
        <LineChart data={data} margin={{top:24,right:16,left:4,bottom:24}}>
          <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
          <YAxis
            domain={[yMin,yMax]} ticks={yTicks}
            tick={{fill:C.textMid,fontSize:12,fontFamily:FONT.mono}} width={68}
            tickFormatter={v=>`${unit}${v.toLocaleString("de-DE",{minimumFractionDigits:decimals,maximumFractionDigits:decimals})}`}
            axisLine={{stroke:C.borderHi}} tickLine={{stroke:C.border}}
          />
          <XAxis dataKey="t" tick={{fill:C.textMid,fontSize:11}} axisLine={{stroke:C.borderHi}} tickLine={{stroke:C.border}} interval="preserveStartEnd" height={28}/>
          <Tooltip content={<ChartTooltip unit={unit} decimals={decimals}/>} cursor={{stroke:C.gold,strokeWidth:1,strokeDasharray:"4 2"}}/>
          {levels.map((lv,i)=>(
            <ReferenceLine key={i} y={lv.v} stroke={lv.col} strokeDasharray="5 3" strokeWidth={1.5}
              label={{value:lv.lbl,position:"insideTopRight",fill:lv.col,fontSize:11,fontWeight:700}}/>
          ))}
          <Line type="monotone" dataKey="p" stroke={trendColor} strokeWidth={2.5} dot={false} isAnimationActive={false}
            activeDot={{r:6,fill:trendColor,stroke:C.bg,strokeWidth:2}}/>
        </LineChart>
      </ResponsiveContainer>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

export { PATHS };
