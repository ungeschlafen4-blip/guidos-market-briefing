import React, { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import { ASSETS, MACRO_STATS } from "./data/assets";
import { TRADES } from "./data/trades";
import { NEWS_DEFAULT } from "./data/news";
import { C, FONT, RADIUS } from "./styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// APP — Guido's Market Briefing Terminal Edition
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
Such: Bitcoin Preis USD, Ethereum Preis, Solana Preis, Gold Preis, Silber Preis, aktuelle Krypto-News heute.
JSON: {"time":"Datum Uhrzeit MESZ","signals":[{"id":"btc","label":"BTC","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"eth","label":"ETH","price":"PREIS","chg24":ZAHL,"bias":"bear"},{"id":"sol","label":"SOL","price":"PREIS","chg24":ZAHL,"bias":"bull"},{"id":"gold","label":"GOLD","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"silver","label":"SILBER","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"makro","label":"S&P","price":"PREIS","chg24":null,"bias":"neutral"}],"news":[{"tag":"TAG","date":"Datum","icon":"Emoji","title":"Titel","summary":"1 Satz","full":"Volltext mit Erklärungen und Fachbegriffen in Aufzählungszeichen","impact":"Auswirkung","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}` }],
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const raw = await res.json();
    const txt = raw.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Kein JSON in Antwort");
    const d = JSON.parse(m[0]);
    if (d.signals) setSnap({ time: d.time || "Live", signals: d.signals });
    if (d.news) setNews(d.news);
    setLastUpd(new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }));
  } catch (e) {
    setError(`${e.message} — Fallback-Daten aktiv`);
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
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.textHi,
      fontFamily: FONT.sans,
    }}>
      <div style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: isMobile ? "14px 14px 60px" : "24px 44px 60px",
      }}>

        {/* HEADER */}
        <Header
          snap={snap}
          loading={loading}
          error={error}
          lastUpd={lastUpd}
          onRefresh={handleRefresh}
          isMobile={isMobile}
        />

        {/* TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {TABS.map(([id, lbl]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, padding: isMobile ? "9px 0" : "11px 0",
                background: tab === id ? C.surface : "transparent",
                border: tab === id ? `1px solid ${C.gold}55` : `1px solid ${C.border}`,
                borderRadius: RADIUS.md,
                color: tab === id ? C.gold : C.textMid,
                fontSize: isMobile ? 12.5 : 14,
                fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: FONT.sans,
              }}
              onMouseEnter={e => { if (tab !== id) { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.textHi; }}}
              onMouseLeave={e => { if (tab !== id) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid; }}}
            >{lbl}</button>
          ))}
        </div>

        {/* MÄRKTE */}
        {tab === "markets" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {/* Left: Krypto */}
            <div>
              <SectionLabel>KRYPTO — Klicken für Fokus & Chart-Analyse</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ASSETS.filter(a => ["sol","btc","eth"].includes(a.id)).map(a => (
                  <AssetCard key={a.id} a={a} />
                ))}
              </div>
            </div>

            {/* Right: Rohstoffe + Makro */}
            <div>
              <SectionLabel>ROHSTOFFE — Klicken für Fokus & Chart-Analyse</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {ASSETS.filter(a => ["gold","silver"].includes(a.id)).map(a => (
                  <AssetCard key={a.id} a={a} />
                ))}
              </div>

              <SectionLabel>MAKRO — ÜBERBLICK</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {MACRO_STATS.map(m => (
                  <MacroTile key={m.n} m={m} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRADES */}
        {tab === "trades" && (
          <div>
            <div style={{
              background: C.surface,
              border: `1px solid ${C.gold}33`,
              borderRadius: RADIUS.md, padding: "12px 16px", marginBottom: 16,
              fontSize: 13, color: C.textMid, lineHeight: 1.6,
            }}>
              <span style={{ color: C.gold, fontWeight: 700 }}>Cross-Check · keine Empfehlung. </span>
              Reihenfolge nach Setup-Qualität: SOL (⭐) → Gold (💡) → BTC (⏸) → ETH (⛔). 1H/2H Setups. Alle mit Confluence-Tabelle.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              {TRADES.map(g => <TradeGroup key={g.asset} g={g} />)}
            </div>
          </div>
        )}

        {/* NEWS */}
        {tab === "news" && (
          <div>
            <div style={{ fontSize: 12, color: C.textLow, marginBottom: 14 }}>
              Klick auf eine News → vollständige Analyse mit Fachbegriff-Erklärungen im Pop-up
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, alignItems: "start" }}>
              {news.map((n, i) => <NewsCard key={i} n={n} />)}
            </div>
          </div>
        )}

        {/* KALENDER */}
        {tab === "calendar" && <CalendarView />}

        {/* Footer */}
        <div style={{ marginTop: 32, fontSize: 11, color: C.textLow, textAlign: "center", lineHeight: 1.8 }}>
          Snapshot · keine Anlageberatung · Elliott-Wave subjektiv ·{" "}
          <span style={{ color: C.gold }}>🔄</span> für Live-Preise ·{" "}
          Klick auf Asset oder News für Details
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, color: C.textLow, letterSpacing: "0.07em",
      fontWeight: 700, marginBottom: 12, textTransform: "uppercase",
    }}>{children}</div>
  );
}

function MacroTile({ m }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.cardHov : C.card,
        border: `1px solid ${hovered ? C.borderHi : C.border}`,
        borderRadius: RADIUS.md, padding: "12px 13px",
        transition: "all 0.15s",
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textMid, marginBottom: 4 }}>{m.n}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.textHi, fontVariantNumeric: "tabular-nums", fontFamily: FONT.mono }}>{m.p}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: m.ch >= 0 ? C.bull : C.bear, marginTop: 3 }}>
        {m.ch >= 0 ? "▲" : "▼"} {Math.abs(m.ch)}%
      </div>
    </div>
  );
}
