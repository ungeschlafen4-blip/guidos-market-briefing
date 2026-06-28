import React, { useState } from "react";
import {
  LineChart, Line, ResponsiveContainer, YAxis, XAxis,
  Tooltip, CartesianGrid, ReferenceLine
} from "recharts";
import Modal from "./Modal";
import { C, FONT, RADIUS, BIAS_COL, DIR_ICON } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// ASSET CARD v2 — Großer Chart direkt sichtbar, kein Klick nötig
// Fokus-Modal für noch mehr Detail
// ─────────────────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.borderHi}`,
      borderRadius: RADIUS.md, padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      pointerEvents: "none",
    }}>
      <div style={{ color: C.textMid, marginBottom: 4, fontSize: 11 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 17, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono, color: C.textHi }}>
        {unit}{typeof val === "number" ? val.toLocaleString("de-DE", { maximumFractionDigits: 2 }) : val}
      </div>
    </div>
  );
}

function BigChart({ data, levels = [], unit = "$", color = C.gold, h = 280 }) {
  if (!data || !data.length) return null;
  const displayData = data.filter(d => d.p !== undefined);
  const vals = displayData.map(d => d.p);
  const mn = Math.min(...vals), mx = Math.max(...vals), pad = (mx - mn) * 0.08;
  const yMin = mn - pad, yMax = mx + pad;
  const yTicks = Array.from({ length: 6 }, (_, i) => yMin + ((yMax - yMin) / 5) * i);

  return (
    <ResponsiveContainer width="100%" height={h}>
      <LineChart data={displayData} margin={{ top: 12, right: 16, left: 4, bottom: 24 }}>
        <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
        <YAxis
          domain={[yMin, yMax]}
          ticks={yTicks}
          tick={{ fill: C.textMid, fontSize: 12, fontFamily: FONT.mono }}
          width={72}
          tickFormatter={v => `${unit}${v >= 1000 ? Math.round(v).toLocaleString("de-DE") : parseFloat(v.toFixed(2))}`}
          axisLine={{ stroke: C.borderHi }}
          tickLine={{ stroke: C.border }}
        />
        <XAxis
          dataKey="t"
          tick={{ fill: C.textMid, fontSize: 12 }}
          axisLine={{ stroke: C.borderHi }}
          tickLine={{ stroke: C.border }}
          interval={Math.max(1, Math.floor(displayData.length / 10))}
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
    <Modal onClose={onClose} maxWidth={1000} accentColor={bc}>
      <div style={{ padding: "28px 36px 28px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 22 }}>
          <span style={{ fontSize: 46, lineHeight: 1 }}>{a.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: FONT.serif, fontSize: 30, color: C.textHi, margin: 0 }}>{a.name}</h2>
              <span style={{ fontSize: 13, color: C.textLow }}>{a.ticker}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: bc, border: `1px solid ${bc}44`, borderRadius: 5, padding: "3px 12px" }}>
                {DIR_ICON[a.bias]} {a.bias === "bull" ? "BULLISH" : a.bias === "bear" ? "BEARISH" : "NEUTRAL"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>
                {a.unit}{a.price}
              </span>
              <span style={{ fontSize: 17, fontWeight: 700, color: a.chg24 >= 0 ? C.bull : C.bear }}>
                {a.chg24 >= 0 ? "+" : ""}{a.chg24}% 24h
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: a.chg7 >= 0 ? C.bull : C.bear }}>
                {a.chg7 >= 0 ? "+" : ""}{a.chg7}% 7D
              </span>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 20 }}>
          {a.keyStats.map(([k, v], i) => (
            <div key={i} style={{ background: C.surface, borderRadius: RADIUS.md, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.textLow, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["7d", "7 Tage · 1H"], ["daily", "Daily · 6 Mon."], ["tv", "TradingView öffnen"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)}
              style={{
                flex: 1, padding: "9px 0",
                background: view === v ? C.surface : "transparent",
                border: view === v ? `1px solid ${C.gold}55` : `1px solid ${C.border}`,
                borderRadius: RADIUS.sm, color: view === v ? C.gold : C.textMid,
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}>{l}</button>
          ))}
        </div>

        {view === "7d" && a.path7d && <BigChart data={a.path7d} levels={a.levels} unit={a.unit} color={lc} h={400} />}
        {view === "daily" && <BigChart data={a.pathD} unit={a.unit} color={lc} h={400} />}
        {view === "tv" && (
          <div style={{ height: 400, background: C.surface, borderRadius: RADIUS.md, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 56 }}>{a.emoji}</span>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: C.textHi, marginBottom: 8 }}>Dein gespeicherter TradingView-Chart</div>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>Mit deiner Wellenzählung, Levels und Indikatoren</div>
              <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.blue, color: "#fff", textDecoration: "none",
                padding: "14px 34px", borderRadius: RADIUS.md, fontSize: 15, fontWeight: 700,
              }}>📊 {a.ticker} Chart öffnen →</a>
            </div>
          </div>
        )}

        {/* Wave */}
        <div style={{ marginTop: 16, padding: "18px 22px", background: C.surface, borderRadius: RADIUS.md, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 8 }}>{a.wave}</div>
          <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.75, margin: 0 }}>{a.waveDetail}</p>
        </div>

        <div style={{ marginTop: 14 }}>
          <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", background: C.surface,
            border: `1px solid ${C.blue}44`, borderRadius: RADIUS.sm,
            color: C.blue, fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>📊 In TradingView öffnen (deine Zählung) →</a>
        </div>
      </div>
    </Modal>
  );
}

// ── ASSET KARTE — Großer Chart direkt sichtbar ───────────────────────────────
export default function AssetCard({ a }) {
  const [focused, setFocused] = useState(false);
  const [view, setView] = useState("7d");
  const bc = BIAS_COL[a.bias] || C.gold;
  const lc = a.bias === "bull" ? C.bull : a.bias === "bear" ? C.bear : C.gold;

  return (
    <>
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: RADIUS.lg,
        padding: "20px 22px 16px",
        transition: "border-color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = bc}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
      >
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{a.emoji}</span>
              <span style={{ fontFamily: FONT.serif, fontSize: 20, fontWeight: 700, color: C.textHi }}>{a.name}</span>
              <span style={{ fontSize: 12, color: C.textLow }}>{a.ticker}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: bc, border: `1px solid ${bc}44`, borderRadius: 4, padding: "2px 9px" }}>
                {DIR_ICON[a.bias]} {a.bias === "bull" ? "BULL" : a.bias === "bear" ? "BEAR" : "NEUTRAL"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>
                {a.unit}{a.price}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: a.chg24 >= 0 ? C.bull : C.bear }}>
                {a.chg24 >= 0 ? "+" : ""}{a.chg24}% 24h
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: a.chg7 >= 0 ? C.bull : C.bear }}>
                {a.chg7 >= 0 ? "+" : ""}{a.chg7}% 7D
              </span>
            </div>
          </div>

          {/* Detail-Button */}
          <button
            onClick={() => setFocused(true)}
            style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: RADIUS.sm, padding: "7px 14px",
              color: C.textMid, fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = bc; e.currentTarget.style.color = bc; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid; }}
          >
            ⊕ Detail
          </button>
        </div>

        {/* Chart View Tabs */}
        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
          {[["7d", "7 Tage"], ["daily", "6 Monate"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)}
              disabled={v === "7d" && !a.path7d}
              style={{
                padding: "5px 12px",
                background: view === v ? C.surface : "transparent",
                border: view === v ? `1px solid ${C.gold}44` : `1px solid ${C.border}`,
                borderRadius: RADIUS.sm, color: view === v ? C.gold : C.textLow,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                opacity: v === "7d" && !a.path7d ? 0.4 : 1,
              }}>{l}</button>
          ))}
        </div>

        {/* BIG CHART — direkt sichtbar */}
        <BigChart
          data={view === "7d" ? (a.path7d || a.pathD) : a.pathD}
          levels={a.levels}
          unit={a.unit}
          color={lc}
          h={260}
        />

        {/* Wave Label */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, lineHeight: 1.4 }}>
            {a.wave}
          </div>
        </div>
      </div>

      {focused && <FocusModal asset={a} onClose={() => setFocused(false)} />}
    </>
  );
}
