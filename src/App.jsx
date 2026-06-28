import React, { useState, useCallback, useEffect } from "react";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import NewsTicker from "./components/NewsTicker";
import MacroTile, { MACRO_ASSETS } from "./components/MacroTile_v2";
import { ASSETS } from "./data/assets";
import { TRADES } from "./data/trades";
import { NEWS_DEFAULT } from "./data/news";
import { C, FONT, RADIUS } from "./styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// APP v3 FIXED — CoinGecko direkt im App, kein separater Hook
// ─────────────────────────────────────────────────────────────────────────────

// CoinGecko Fetch direkt hier (kein separater Import nötig)
const CG_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,gold,silver&vs_currencies=usd&include_24hr_change=true&include_7d_change=true";
const CG_MAP = { bitcoin:"btc", ethereum:"eth", solana:"sol", gold:"gold", silver:"silver" };

function fmtPrice(price, id) {
  if (!price && price !== 0) return null;
  if (id === "btc" || id === "gold") return Math.round(price).toLocaleString("de-DE");
  if (id === "eth") return Math.round(price).toLocaleString("de-DE");
  return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  const [news, setNews] = useState(NEWS_DEFAULT);
  const [livePrices, setLivePrices] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [priceError, setPriceError] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiLastUpd, setAiLastUpd] = useState(null);

  // ── CoinGecko Auto-Fetch ──────────────────────────────────────────────────
  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(CG_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const mapped = {};
      for (const [cgId, assetId] of Object.entries(CG_MAP)) {
        if (data[cgId]) {
          mapped[assetId] = {
            price: data[cgId].usd,
            chg24: parseFloat((data[cgId].usd_24h_change ?? 0).toFixed(1)),
            chg7:  parseFloat((data[cgId].usd_7d_change  ?? 0).toFixed(1)),
          };
        }
      }
      setLivePrices(mapped);
      setLastFetch(new Date().toLocaleTimeString("de-AT", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
      setPriceError(null);
    } catch (e) {
      setPriceError(`CoinGecko: ${e.message}`);
    }
  }, []);

  // Erster Fetch + 30s Interval
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // ── Live-Assets zusammenführen ────────────────────────────────────────────
  const liveAssets = ASSETS.map(a => {
    if (livePrices && livePrices[a.id]) {
      const live = livePrices[a.id];
      return {
        ...a,
        price: fmtPrice(live.price, a.id) || a.price,
        chg24: live.chg24,
        chg7:  live.chg7,
      };
    }
    return a;
  });

  // ── AI News Refresh ───────────────────────────────────────────────────────
  const handleAIRefresh = useCallback(async () => {
    setAiLoading(true); setAiError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `Suche aktuelle Krypto und Finanz-News. Antworte NUR mit JSON ohne Backticks.
JSON: {"news":[{"tag":"TAG","date":"heute","icon":"Emoji","title":"Titel","summary":"1 Satz","full":"Volltext mit Fachbegriff-Erklärungen und Bullet Points mit •","impact":"Impact","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}` }],
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const raw = await res.json();
      const txt = raw.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      const m = txt.match(/\{[\s\S]*\}/);
      if (m) {
        const d = JSON.parse(m[0]);
        if (d.news) setNews(d.news);
      }
      setAiLastUpd(new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  }, []);

  const TABS = [["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.textHi, fontFamily:FONT.sans }}>
      <div style={{ maxWidth:1440, margin:"0 auto", padding: isMobile ? "14px 14px 60px" : "24px 44px 60px" }}>

        {/* ── HEADER ── */}
        <header style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:16, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <div>
              <h1 style={{ fontFamily:FONT.serif, fontSize: isMobile?22:32, margin:0, color:C.textHi, fontWeight:700, letterSpacing:"0.01em" }}>
                Guido's <span style={{color:C.gold}}>Market</span> Briefing
              </h1>
              <div style={{ fontSize:12, color:C.textLow, marginTop:5 }}>
                {lastFetch
                  ? <><span style={{color:C.bull}}>●</span>{" "}Live: {lastFetch} · Auto-Refresh 30s · Elliott-Wave · 1H/2H Trades</>
                  : "Lade Preise... · Elliott-Wave · 1H/2H Trades"
                }
                {priceError && <span style={{color:C.bear}}> · ⚠️ {priceError}</span>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:6, background:C.surface, border:`1px solid ${C.purple}55`, borderRadius:RADIUS.md, padding:"10px 16px", color:C.purple, fontSize:13, fontWeight:700, textDecoration:"none" }}>
                🔗 {isMobile?"MCO":"MCO Terminal"}
              </a>
              <button onClick={handleAIRefresh} disabled={aiLoading}
                style={{ background:C.surface, border:`1px solid ${aiLoading?C.textLow:C.gold}`, borderRadius:RADIUS.md, padding:"10px 16px", color:aiLoading?C.textLow:C.gold, fontSize:13, fontWeight:700, cursor:aiLoading?"wait":"pointer", display:"flex", alignItems:"center", gap:7, transition:"all 0.15s" }}>
                <span style={{ fontSize:16, display:"inline-block", animation:aiLoading?"spin 0.8s linear infinite":"none" }}>{aiLoading?"⟳":"🤖"}</span>
                {isMobile ? "" : "AI News Update"}
              </button>
            </div>
          </div>
          {aiError && (
            <div style={{ marginTop:8, padding:"7px 12px", background:"#160606", border:`1px solid ${C.bear}44`, borderRadius:RADIUS.sm, fontSize:11, color:C.bear }}>
              ⚠️ AI Fehler: {aiError}
            </div>
          )}
          {aiLoading && (
            <div style={{ marginTop:8, padding:"7px 12px", background:C.surface, border:`1px solid ${C.gold}33`, borderRadius:RADIUS.sm, fontSize:11, color:C.textMid }}>
              🔍 Claude sucht aktuelle News...
            </div>
          )}
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </header>

        {/* ── NEWS TICKER ── */}
        <NewsTicker isMobile={isMobile} />

        {/* ── TABS ── */}
        <div style={{ display:"flex", gap:6, marginBottom:22 }}>
          {TABS.map(([id,lbl]) => (
            <button key={id} onClick={()=>setTab(id)} style={{
              flex:1, padding: isMobile?"10px 0":"12px 0",
              background: tab===id ? C.surface : "transparent",
              border: tab===id ? `1px solid ${C.gold}55` : `1px solid ${C.border}`,
              borderRadius:RADIUS.md, color: tab===id ? C.gold : C.textMid,
              fontSize: isMobile?13:14.5, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
            }}
              onMouseEnter={e=>{ if(tab!==id){e.currentTarget.style.borderColor=C.borderHi;e.currentTarget.style.color=C.textHi;}}}
              onMouseLeave={e=>{ if(tab!==id){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid;}}}
            >{lbl}</button>
          ))}
        </div>

        {/* ── MÄRKTE ── */}
        {tab==="markets" && (
          <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:18 }}>
            <div>
              <SectionLabel>KRYPTO — Live via CoinGecko · Klicken für Analyse</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {liveAssets.filter(a=>["sol","btc","eth"].includes(a.id)).map(a=>(
                  <AssetCard key={a.id} a={a} />
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>ROHSTOFFE — Live via CoinGecko · Klicken für Analyse</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
                {liveAssets.filter(a=>["gold","silver"].includes(a.id)).map(a=>(
                  <AssetCard key={a.id} a={a} />
                ))}
              </div>
              <SectionLabel>MAKRO — Klicken für TradingView Live-Chart</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {MACRO_ASSETS.map(m=><MacroTile key={m.n} m={m} />)}
              </div>
            </div>
          </div>
        )}

        {/* ── TRADES ── */}
        {tab==="trades" && (
          <div>
            <div style={{ background:C.surface, border:`1px solid ${C.gold}33`, borderRadius:RADIUS.md, padding:"14px 18px", marginBottom:18, fontSize:14, color:C.textMid, lineHeight:1.6 }}>
              <span style={{color:C.gold,fontWeight:700}}>Cross-Check · keine Empfehlung. </span>
              SOL (⭐) → Gold (💡) → BTC (⏸) → ETH (⛔). 1H/2H Setups mit Confluence.
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:16 }}>
              {TRADES.map(g=><TradeGroup key={g.asset} g={g}/>)}
            </div>
          </div>
        )}

        {/* ── NEWS ── */}
        {tab==="news" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{fontSize:13,color:C.textLow}}>Klick auf News → vollständige Analyse mit Fachbegriff-Erklärungen</div>
              {aiLastUpd && <div style={{fontSize:11,color:C.bull}}>🤖 AI-Update: {aiLastUpd}</div>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:14, alignItems:"start" }}>
              {news.map((n,i)=><NewsCard key={i} n={n}/>)}
            </div>
          </div>
        )}

        {/* ── KALENDER ── */}
        {tab==="calendar" && <CalendarView />}

        <div style={{ marginTop:36, fontSize:11, color:C.textLow, textAlign:"center", lineHeight:1.8 }}>
          CoinGecko Live-Preise · Auto-Refresh 30s · Elliott-Wave subjektiv · keine Anlageberatung
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:11.5, color:C.textLow, letterSpacing:"0.07em", fontWeight:700, marginBottom:14, textTransform:"uppercase" }}>
      {children}
    </div>
  );
}
