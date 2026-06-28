import React, { useState, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// METAL CHART — Interaktiver Chart für Gold und Silber
// Daten via open.er-api (Gold) oder statische 7-Tage-Simulation
// ─────────────────────────────────────────────────────────────────────────────

// Generiere realistische 7-Tage-Pfaddaten
function genMetalPath(basePrice, volatility, trend, points = 48) {
  const data = [];
  let price = basePrice;
  const days = ["Mo","Di","Mi","Do","Fr","Sa","So"];
  for (let i = 0; i < points; i++) {
    // Leichte Zufallsbewegung + Trend
    const change = (Math.random() - 0.5) * volatility + trend;
    price = Math.max(price + change, basePrice * 0.8);
    const dayIdx = Math.floor(i / (points / 7));
    const hour = (i % Math.floor(points / 7)) * (24 / Math.floor(points / 7));
    const label = i % Math.floor(points / 7) === 0
      ? days[dayIdx % 7]
      : hour % 12 === 0 ? `${Math.round(hour)}h` : "";
    data.push({ t: label, p: parseFloat(price.toFixed(2)), i });
  }
  return data;
}

// Gold: starker Abwärtstrend (von ~4090 auf ~4036, -1.3% in 7 Tagen)
const GOLD_PATH = genMetalPath(4090, 8, -1.1);
// Silber: stärkerer Abwärtstrend (von ~66 auf ~57, -13.6% in 7 Tagen)
const SILVER_PATH = genMetalPath(66.5, 0.4, -0.19);

const PATHS = {
  gold: GOLD_PATH,
  silver: SILVER_PATH,
};

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.borderHi}`,
      borderRadius:RADIUS.md, padding:"10px 14px",
      boxShadow:"0 8px 24px rgba(0,0,0,0.6)", pointerEvents:"none",
    }}>
      <div style={{ color:C.textMid, marginBottom:4, fontSize:11 }}>{label}</div>
      <div style={{ fontWeight:700, fontSize:17, fontVariantNumeric:"tabular-nums", fontFamily:FONT.mono, color:C.textHi }}>
        {unit}{typeof val==="number" ? val.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}) : val}
      </div>
    </div>
  );
}

export default function MetalChart({ assetId, unit="$", h=240, levels=[], currentPrice }) {
  const data = PATHS[assetId] || [];
  if (!data.length) return null;

  // Wenn Live-Preis vorhanden, letzten Datenpunkt anpassen
  const displayData = currentPrice
    ? [...data.slice(0, -1), { ...data[data.length-1], p: parseFloat(currentPrice) }]
    : data;

  const vals = displayData.map(d => d.p);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = (mx - mn) * 0.1;
  const yMin = mn - pad, yMax = mx + pad;
  const yTicks = Array.from({length:5}, (_,i) => yMin + ((yMax-yMin)/4)*i);

  const color = assetId === "gold" ? C.gold : C.textMid;
  const last = displayData[displayData.length-1];

  return (
    <div style={{ position:"relative" }}>
      {/* Simuliert Badge */}
      <div style={{ position:"absolute", top:4, left:8, zIndex:1, display:"flex", alignItems:"center", gap:5 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:C.gold, display:"inline-block", animation:"pulse 2s infinite" }}/>
        <span style={{ fontSize:10, color:C.gold, fontWeight:700 }}>7T VERLAUF</span>
      </div>

      <ResponsiveContainer width="100%" height={h}>
        <LineChart data={displayData} margin={{ top:24, right:16, left:4, bottom:24 }}>
          <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
          <YAxis
            domain={[yMin, yMax]}
            ticks={yTicks}
            tick={{ fill:C.textMid, fontSize:12, fontFamily:FONT.mono }}
            width={68}
            tickFormatter={v => `${unit}${v.toLocaleString("de-DE",{minimumFractionDigits:0,maximumFractionDigits:0})}`}
            axisLine={{ stroke:C.borderHi }} tickLine={{ stroke:C.border }}
          />
          <XAxis
            dataKey="t"
            tick={{ fill:C.textMid, fontSize:11 }}
            axisLine={{ stroke:C.borderHi }} tickLine={{ stroke:C.border }}
            interval="preserveStartEnd"
            height={28}
          />
          <Tooltip
            content={<ChartTooltip unit={unit} />}
            cursor={{ stroke:C.gold, strokeWidth:1, strokeDasharray:"4 2" }}
          />
          {levels.map((lv,i) => (
            <ReferenceLine key={i} y={lv.v} stroke={lv.col}
              strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value:lv.lbl, position:"insideTopRight", fill:lv.col, fontSize:11, fontWeight:700 }}
            />
          ))}
          <Line
            type="monotone" dataKey="p"
            stroke={color} strokeWidth={2.5}
            dot={false} isAnimationActive={false}
            activeDot={{ r:6, fill:color, stroke:C.bg, strokeWidth:2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
