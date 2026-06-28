import React, { useState } from "react";
import {
  LineChart, Line, ResponsiveContainer, YAxis, XAxis,
  Tooltip, CartesianGrid, ReferenceLine
} from "recharts";
import Modal from "./Modal";
import { C, FONT, RADIUS, BIAS_COL, DIR_ICON } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// ASSET CARD + FOCUS MODAL — Updated
// Größerer Chart, gleichmäßigere Achsen, interaktiver Tooltip
// ─────────────────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.borderHi}`,
      borderRadius: RADIUS.md, padding: "10px 14px",
      fontSize: 13, color: C.textHi,
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      pointerEvents: "none",
    }}>
      <div style={{ color: C.textMid, marginBottom: 5, fontSize: 11 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 18, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>
        {unit}{typeof val === "number" ? val.toLocaleString("de-DE", { maximumFractionDigits: 2 }) : val}
      </div>
    </div>
  );
}

function AssetChart({ data, levels = [], unit = "$", color = C.gold, h = 340, showGrid = true }) {
  if (!data || !data.length) return null;
  const displayData = data.filter(d => d.p !== undefined);
  const vals = displayData.map(d => d.p);
  const mn = Math.min(...vals), mx = Math.max(...vals), pad = (mx - mn) * 0.1;

  // Tick-Anzahl für Y-Achse: 6 gleichmäßige Schritte
  const yMin = mn - pad, yMax = mx + pad;
  const yStep = (yMax - yMin) / 5;
  const yTicks = Array.from({ length: 6 }, (_, i) => yMin + i * yStep);

  // X-Achse: zeige jeden 12. Punkt (alle 12 Stunden) oder bei Daily jeden Punkt mit Label
  const xTickCount = Math.min(displayData.length, 14);

  return (
    <ResponsiveContainer width="100%" height={h}>
      <LineChart
        data={displayData}
        margin={{ top: 14, right: 16, left: 8, bottom: 28 }}
      >
        {showGrid && <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={true} horizontal={true} />}
        <YAxis
          domain={[yMin, yMax]}
          ticks={yTicks}
          tick={{ fill: C.textMid, fontSize: 12, fontFamily: FONT.mono }}
          width={72}
          tickFormatter={v =>
            `${unit}${v >= 10000
              ? Math.round(v).toLocaleString("de-DE")
              : v >= 1000
              ? Math.round(v).toLocaleString("de-DE")
              : parseFloat(v.toFixed(2))}`
          }
          axisLine={{ stroke: C.borderHi }}
          tickLine={{ stroke: C.border }}
        />
        <XAxis
          dataKey="t"
          tick={{ fill: C.textMid, fontSize: 12 }}
          axisLine={{ stroke: C.borderHi }}
          tickLine={{ stroke: C.border }}
          interval={Math.floor(displayData.length / xTickCount)}
          height={32}
        />
        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{ stroke: C.gold, strokeWidth: 1, strokeDasharray: "4 2" }}
        />
        {levels.map((lv, i) => (
          <ReferenceLine key={i} y={lv.v} stroke={lv.col}
            strokeDasharray="5 3" strokeWidth={1.5}
            label={{ value: lv.lbl, position: "insideTopRight", fill: lv.col, fontSize: 11, fontWeight: 700 }}
          />
        ))}
        <Line
          type="monotone" dataKey="p"
          stroke={color} strokeWidth={2.5}
          dot={false} isAnimationActive={false}
          activeDot={{ r: 6, fill: color, stroke: C.bg, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── FOKUS MODAL ───────────────────────────────────────────────────────────────
function FocusModal({ asset: a, onClose }) {
  const [view, setView] = useState("7d");
  const bc = BIAS_COL[a.bias] || C.gold;
  const lc = a.bias === "bull" ? C.bull : a.bias === "bear" ? C.bear : C.gold;

  return (
    <Modal onClose={onClose} maxWidth={960} accentColor={bc}>
      <div style={{ padding: "28px 32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <span style={{ fontSize: 44, lineHeight: 1 }}>{a.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: FONT.serif, fontSize: 28, color: C.textHi, margin: 0 }}>{a.name}</h2>
              <span style={{ fontSize: 13, color: C.textLow }}>{a.ticker}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: bc, border: `1px solid ${bc}44`, borderRadius: 5, padding: "3px 11px" }}>
                {DIR_ICON[a.bias]} {a.bias === "bull" ? "BULLISH" : a.bias === "bear" ? "BEARISH" : "NEUTRAL"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
              <span style={{ fontSize: 38, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>
                {a.unit}{a.price}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: a.chg24 >= 0 ? C.bull : C.bear }}>
                {a.chg24 >= 0 ? "+" : ""}{a.chg24}% 24h
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: a.chg7 >= 0 ? C.bull : C.bear }}>
                {a.chg7 >= 0 ? "+" : ""}{a.chg7}% 7D
              </span>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          {a.keyStats.map(([k, v], i) => (
            <div key={i} style={{ background: C.surface, borderRadius: RADIUS.md, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: C.textLow, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Chart Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[["7d", "7 Tage · 1H-Daten"], ["daily", "Daily · 6 Monate"], ["tv", "TradingView öffnen"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)}
              disabled={v === "7d" && !a.path7d}
              style={{
                flex: 1, padding: "9px 0",
                background: view === v ? C.surface : "transparent",
                border: view === v ? `1px solid ${C.gold}55` : `1px solid ${C.border}`,
                borderRadius: RADIUS.sm, color: view === v ? C.gold : C.textMid,
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                opacity: v === "7d" && !a.path7d ? 0.4 : 1,
              }}>{l}</button>
          ))}
        </div>

        {/* Charts */}
        {view === "7d" && a.path7d && (
          <AssetChart data={a.path7d} levels={a.levels} unit={a.unit} color={lc} h={380} />
        )}
        {view === "daily" && (
          <AssetChart data={a.pathD} unit={a.unit} color={lc} h={380} />
        )}
        {view === "tv" && (
          <div style={{
            height: 380, background: C.surface, borderRadius: RADIUS.md,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 16, border: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 52 }}>{a.emoji}</span>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.textHi, marginBottom: 8 }}>
                Dein gespeicherter TradingView-Chart
              </div>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>
                Mit deiner Wellenzählung, Levels und Indikatoren
              </div>
              <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.blue, color: "#fff", textDecoration: "none",
                padding: "13px 32px", borderRadius: RADIUS.md,
                fontSize: 14, fontWeight: 700,
              }}>
                📊 {a.ticker} Chart öffnen →
              </a>
            </div>
          </div>
        )}

        {/* Wave Analysis */}
        <div style={{ marginTop: 16, padding: "16px 20px", background: C.surface, borderRadius: RADIUS.md, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 8 }}>{a.wave}</div>
          <p style={{ fontSize: 13.5, color: C.textMid, lineHeight: 1.75, margin: 0 }}>{a.waveDetail}</p>
        </div>

        <div style={{ marginTop: 14 }}>
          <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", background: C.surface,
            border: `1px solid ${C.blue}44`, borderRadius: RADIUS.sm,
            color: C.blue, fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            📊 In TradingView öffnen (deine Zählung) →
          </a>
        </div>
      </div>
    </Modal>
  );
}

// ── ASSET MINI CARD ───────────────────────────────────────────────────────────
export default function AssetCard({ a }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const bc = BIAS_COL[a.bias] || C.gold;
  const lc = a.bias === "bull" ? C.bull : a.bias === "bear" ? C.bear : C.gold;

  return (
    <>
      <div
        onClick={() => setFocused(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? C.cardHov : C.card,
          border: `1px solid ${hovered ? bc : C.border}`,
          borderRadius: RADIUS.lg, padding: "20px 22px",
          cursor: "pointer",
          transition: "all 0.18s ease",
          transform: hovered ? "translateY(-3px)" : "none",
          boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px ${bc}22` : "none",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{a.emoji}</span>
              <span style={{ fontFamily: FONT.serif, fontSize: 19, fontWeight: 600, color: C.textHi }}>{a.name}</span>
              <span style={{ fontSize: 11, color: C.textLow }}>{a.ticker}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>
                {a.unit}{a.price}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: a.chg24 >= 0 ? C.bull : C.bear }}>
                {a.chg24 >= 0 ? "+" : ""}{a.chg24}% 24h
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: a.chg7 >= 0 ? C.bull : C.bear }}>
                {a.chg7 >= 0 ? "+" : ""}{a.chg7}% 7D
              </span>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: bc, border: `1px solid ${bc}44`, borderRadius: 5, padding: "4px 10px", flexShrink: 0 }}>
            {DIR_ICON[a.bias]} {a.bias === "bull" ? "BULL" : a.bias === "bear" ? "BEAR" : "NEUTRAL"}
          </span>
        </div>

        {/* Mini Chart — etwas höher */}
        <AssetChart
          data={a.path7d || a.pathD}
          levels={[]}
          unit={a.unit}
          color={lc}
          h={120}
          showGrid={false}
        />

        {/* Wave Label */}
        <div style={{ marginTop: 12, fontSize: 13, color: C.gold, fontWeight: 600, lineHeight: 1.4 }}>
          {a.wave.split("—")[0].trim()}
        </div>

        {/* Click Hint */}
        <div style={{
          marginTop: 8, fontSize: 12,
          color: hovered ? C.blue : C.textLow,
          transition: "color 0.15s",
        }}>
          {hovered ? "→ Fokus-Ansicht öffnen" : "Klicken für Details, Chart & Analyse"}
        </div>
      </div>

      {focused && <FocusModal asset={a} onClose={() => setFocused(false)} />}
    </>
  );
}
