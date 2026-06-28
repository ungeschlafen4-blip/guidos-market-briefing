import React, { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import NewsTicker from "./components/NewsTicker";
import Modal from "./components/Modal";
import { ASSETS, MACRO_STATS } from "./data/assets";
import { TRADES } from "./data/trades";
import { NEWS_DEFAULT } from "./data/news";
import { C, FONT, RADIUS, BIAS_COL, DIR_ICON } from "./styles/theme";
import {
  LineChart, Line, ResponsiveContainer, YAxis, XAxis,
  Tooltip, CartesianGrid
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// APP v2 — Ohne Ampel-Leiste · NewsTicker · Makro mit TradingView
// ─────────────────────────────────────────────────────────────────────────────

const SNAPSHOT_DEFAULT = {
  time: "28. Juni 2026 · Snapshot",
  signals: [
    { id:"btc",   label:"BTC",    price:"60.254", chg24:+0.3,  bias:"neutral" },
    { id:"eth",   label:"ETH",    price:"1.588",  chg24:+1.0,  bias:"bear"    },
    { id:"sol",   label:"SOL",    price:"72,22",  chg24:+2.7,  bias:"bull"    },
    { id:"gold",  label:"GOLD",   price:"4.036",  chg24:+0.2,  bias:"neutral" },
    { id:"silver",label:"SILBER", price:"57,00",  chg24:-0.3,  bias:"neutral" },
    { id:"makro", label:"S&P",    price:"7.354",  chg24:null,  bias:"neutral" },
  ],
};

// Makro Assets mit TradingView Links
const MACRO_ASSETS = [
  { n:"S&P 500",  p:"7.354",   ch:-0.05, emoji:"📈", tvLink:"https://www.tradingview.com/chart/", tvSymbol:"SPX",    note:"Nach PCE-Daten stabil. Nasdaq -2,2% diese Woche." },
  { n:"Nasdaq",   p:"22.180",  ch:-0.4,  emoji:"💻", tvLink:"https://www.tradingview.com/chart/", tvSymbol:"IXIC",   note:"Tech unter Druck. Micron-Beat gibt Entlastung." },
  { n:"WTI Öl",   p:"$71,90",  ch:+0.30, emoji:"🛢️", tvLink:"https://www.tradingview.com/chart/", tvSymbol:"USOIL",  note:"Vor-Kriegs-Niveau. Iran-MOU normalisiert Hormuz." },
  { n:"DXY",      p:"101,6",   ch:+0.40, emoji:"💵", tvLink:"https://www.tradingview.com/chart/", tvSymbol:"DXY",    note:"Dollar stark nach hawkishem Fed-Ton." },
  { n:"10Y Yield",p:"4,46%",   ch:+0.02, emoji:"📊", tvLink:"https://www.tradingview.com/chart/", tvSymbol:"US10Y",  note:"Sep-Hike 63%. Yield steigt mit Hike-Erwartung." },
  { n:"VIX",      p:"18,89",   ch:-1.20, emoji:"🌡️", tvLink:"https://www.tradingview.com/chart/", tvSymbol:"VIX",    note:"Volatilität leicht rückläufig nach Expiry." },
];

// Makro Tile mit Modal
function MacroTile({ m }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? C.cardHov : C.card,
          border: `1px solid ${hovered ? C.borderHi : C.border}`,
          borderRadius: RADIUS.md, padding: "14px 16px",
          cursor: "pointer", transition: "all 0.15s",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <span style={{ fontSize: 18 }}>{m.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>{m.n}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>
              {m.p}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: m.ch >= 0 ? C.bull : C.bear, marginTop: 3 }}>
              {m.ch >= 0 ? "▲" : "▼"} {Math.abs(m.ch)}%
            </div>
          </div>
          <span style={{ fontSize: 12, color: hovered ? C.blue : C.textLow, transition: "color 0.15s", marginTop: 4 }}>
            {hovered ? "→" : "⊕"}
          </span>
        </div>
        <div style={{ fontSize: 11, color: C.textLow, marginTop: 8, lineHeight: 1.4 }}>{m.note}</div>
      </div>

      {open && (
        <Modal onClose={() => setOpen(false)} maxWidth={500} accentColor={C.blue}>
          <div style={{ padding: "24px 28px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 32 }}>{m.emoji}</span>
              <div>
                <div style={{ fontSize: 12, color: C.textLow }}>{m.n}</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.textHi, fontFamily: FONT.mono }}>{m.p}</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 18, fontWeight: 700, color: m.ch >= 0 ? C.bull : C.bear }}>
                {m.ch >= 0 ? "▲" : "▼"} {Math.abs(m.ch)}%
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, margin: "0 0 20px 0" }}>{m.note}</p>
            <a href={`https://www.tradingview.com/symbols/${m.tvSymbol}/`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.blue, color: "#fff", textDecoration: "none",
                padding: "11px 24px", borderRadius: RADIUS.md, fontSize: 13, fontWeight: 700,
              }}>
              📊 {m.n} auf TradingView öffnen →
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}

// Live Refresh
async function doLiveRefresh(setSnap, setNews, setLoading, setError, setLastUpd) {
  setLoading(true); setError(null);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: `Suche jetzt im Web nach aktuellen Preisen. Antworte NUR mit JSON ohne Backticks.
JSON: {"time":"Datum Uhrzeit MESZ","signals":[{"id":"btc","label":"BTC","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"eth","label":"ETH","price":"PREIS","chg24":ZAHL,"bias":"bear"},{"id":"sol","label":"SOL","price":"PREIS","chg24":ZAHL,"bias":"bull"},{"id":"gold","label":"GOLD","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"silver","label":"SILBER","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"makro","label":"S&P","price":"PREIS","chg24":null,"bias":"neutral"}],"news":[{"tag":"TAG","date":"Datum","icon":"Emoji","title":"Titel","summary":"1 Satz","full":"Volltext mit Erklärungen","impact":"Auswirkung","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}` }],
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const raw = await res.json();
    const txt = raw.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Kein JSON");
    const d = JSON.parse(m[0]);
    if (d.signals) setSnap({ time: d.time || "Live", signals: d.signals });
    if (d.news) setNews(d.news);
    setLastUpd(new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }));
  } catch (e) {
    setError(`${e.message} — Fallback aktiv`);
  } finally {
    setLoading(false);
  }
}

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

export default function App() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("markets");
  const [snap, setSnap] = useState(SNAPSHOT_DEFAULT);
  const [news, setNews] = useState(NEWS_DEFAULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpd, setLastUpd] = useState(null);

  const handleRefresh = useCallback(() => {
    doLiveRefresh(setSnap, setNews, setLoading, setError, setLastUpd);
  }, []);

  const TABS = [["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textHi, fontFamily: FONT.sans }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: isMobile ? "14px 14px 60px" : "24px 44px 60px" }}>

        {/* HEADER — ohne Ampel-Leiste */}
        <Header
          snap={snap} loading={loading} error={error}
          lastUpd={lastUpd} onRefresh={handleRefresh}
          isMobile={isMobile}
          hideBiasStrip={true}
        />

        {/* NEWS TICKER — ersetzt Ampel-Leiste */}
        <NewsTicker isMobile={isMobile} />

        {/* TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
          {TABS.map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: isMobile ? "10px 0" : "12px 0",
              background: tab === id ? C.surface : "transparent",
              border: tab === id ? `1px solid ${C.gold}55` : `1px solid ${C.border}`,
              borderRadius: RADIUS.md,
              color: tab === id ? C.gold : C.textMid,
              fontSize: isMobile ? 13 : 14.5, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s", fontFamily: FONT.sans,
            }}
              onMouseEnter={e => { if (tab !== id) { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.textHi; }}}
              onMouseLeave={e => { if (tab !== id) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid; }}}
            >{lbl}</button>
          ))}
        </div>

        {/* MÄRKTE */}
        {tab === "markets" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
            {/* Links: Krypto */}
            <div>
              <SectionLabel>KRYPTO — Chart direkt sichtbar · Klicken für Detail-Analyse</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {ASSETS.filter(a => ["sol","btc","eth"].includes(a.id)).map(a => (
                  <AssetCard key={a.id} a={a} />
                ))}
              </div>
            </div>

            {/* Rechts: Rohstoffe + Makro */}
            <div>
              <SectionLabel>ROHSTOFFE — Chart direkt sichtbar · Klicken für Detail-Analyse</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                {ASSETS.filter(a => ["gold","silver"].includes(a.id)).map(a => (
                  <AssetCard key={a.id} a={a} />
                ))}
              </div>

              <SectionLabel>MAKRO — Klicken für TradingView Chart</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {MACRO_ASSETS.map(m => <MacroTile key={m.n} m={m} />)}
              </div>
            </div>
          </div>
        )}

        {/* TRADES */}
        {tab === "trades" && (
          <div>
            <div style={{
              background: C.surface, border: `1px solid ${C.gold}33`,
              borderRadius: RADIUS.md, padding: "14px 18px", marginBottom: 18,
              fontSize: 14, color: C.textMid, lineHeight: 1.6,
            }}>
              <span style={{ color: C.gold, fontWeight: 700 }}>Cross-Check · keine Empfehlung. </span>
              Reihenfolge: SOL (⭐) → Gold (💡) → BTC (⏸) → ETH (⛔). 1H/2H Setups mit Confluence.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              {TRADES.map(g => <TradeGroup key={g.asset} g={g} />)}
            </div>
          </div>
        )}

        {/* NEWS */}
        {tab === "news" && (
          <div>
            <div style={{ fontSize: 13, color: C.textLow, marginBottom: 16 }}>
              Klick auf eine News → vollständige Analyse mit Fachbegriff-Erklärungen im Pop-up
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, alignItems: "start" }}>
              {news.map((n, i) => <NewsCard key={i} n={n} />)}
            </div>
          </div>
        )}

        {/* KALENDER */}
        {tab === "calendar" && <CalendarView />}

        <div style={{ marginTop: 36, fontSize: 11, color: C.textLow, textAlign: "center", lineHeight: 1.8 }}>
          Snapshot · keine Anlageberatung · Elliott-Wave subjektiv ·{" "}
          <span style={{ color: C.gold }}>🔄</span> für Live-Preise
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11.5, color: C.textLow, letterSpacing: "0.07em",
      fontWeight: 700, marginBottom: 14, textTransform: "uppercase",
    }}>{children}</div>
  );
}
