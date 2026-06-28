import React, { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import NewsTicker from "./components/NewsTicker";
import MacroTile, { MACRO_ASSETS } from "./components/MacroTile_v2";
import { ASSETS } from "./data/assets_v2";
import { TRADES } from "./data/trades";
import { NEWS_DEFAULT } from "./data/news";
import { useLivePrices, formatPrice } from "./hooks/useLivePrices";
import { C, FONT, RADIUS } from "./styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// APP v3 — CoinGecko Auto-Refresh + TradingView Makro + Elliott-Analyse
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("markets");
  const [news, setNews] = useState(NEWS_DEFAULT);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiLastUpd, setAiLastUpd] = useState(null);

  // ── CoinGecko Live-Preise (automatisch alle 30s) ──────────────────────────
  const { prices, lastFetch, error: priceError, loading: priceLoading } = useLivePrices(30000);

  // ── Assets mit Live-Preisen anreichern ───────────────────────────────────
  const liveAssets = ASSETS.map(a => {
    if (prices && prices[a.id]) {
      const live = prices[a.id];
      const priceStr = formatPrice(live.price, a.id);
      return { ...a, price: priceStr || a.price, chg24: live.chg24, chg7: live.chg7 };
    }
    return a;
  });

  // ── Ampel-Signale aus Live-Daten ──────────────────────────────────────────
  const signals = liveAssets.map(a => ({
    id: a.id, label: a.id.toUpperCase(),
    price: a.unit + a.price,
    chg24: a.chg24,
    bias: a.bias,
  })).concat([{ id:"makro", label:"S&P", price:"7.354", chg24: null, bias:"neutral" }]);

  // ── AI News Refresh ───────────────────────────────────────────────────────
  const handleAIRefresh = useCallback(async () => {
    setAiLoading(true); setAiError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1000,
          tools:[{type:"web_search_20250305", name:"web_search"}],
          messages:[{role:"user", content:`Suche nach aktuellen Krypto und Finanz-News von heute. Antworte NUR mit JSON ohne Backticks.
JSON: {"news":[{"tag":"TAG","date":"heute","icon":"Emoji","title":"Titel","summary":"1 Satz","full":"Volltext mit • Aufzählungen und Fachbegriff-Erklärungen","impact":"Impact-Beschreibung","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}`}],
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const raw = await res.json();
      const txt = raw.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
      const m = txt.match(/\{[\s\S]*\}/);
      if (m) { const d = JSON.parse(m[0]); if (d.news) setNews(d.news); }
      setAiLastUpd(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"}));
    } catch(e) { setAiError(e.message); }
    finally { setAiLoading(false); }
  }, []);

  const TABS = [["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.textHi, fontFamily:FONT.sans }}>
      <div style={{ maxWidth:1440, margin:"0 auto", padding: isMobile ? "14px 14px 60px" : "24px 44px 60px" }}>

        {/* HEADER */}
        <header style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:16, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <div>
              <h1 style={{ fontFamily:FONT.serif, fontSize: isMobile?22:32, margin:0, color:C.textHi, fontWeight:700 }}>
                Guido's <span style={{color:C.gold}}>Market</span> Briefing
              </h1>
              <div style={{ fontSize:12, color:C.textLow, marginTop:5 }}>
                {priceLoading && <span style={{color:C.gold}}>⟳ Preise laden... · </span>}
                {lastFetch
                  ? <><span style={{color:C.bull}}>●</span>{" "}Preise: {lastFetch} · Auto-Refresh 30s</>
                  : "Snapshot · Elliott-Wave · 1H/2H Trades"
                }
                {priceError && <span style={{color:C.bear}}> · {priceError}</span>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:6, background:C.surface, border:`1px solid ${C.purple}55`, borderRadius:RADIUS.md, padding:"10px 16px", color:C.purple, fontSize:13, fontWeight:700, textDecoration:"none" }}>
                🔗 {isMobile?"MCO":"MCO Terminal"}
              </a>
              <button onClick={handleAIRefresh} disabled={aiLoading}
                style={{ background:C.surface, border:`1px solid ${aiLoading?C.textLow:C.gold}`, borderRadius:RADIUS.md, padding:"10px 16px", color:aiLoading?C.textLow:C.gold, fontSize:13, fontWeight:700, cursor:aiLoading?"wait":"pointer", display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ fontSize:16, display:"inline-block", animation:aiLoading?"spin 0.8s linear infinite":"none" }}>{aiLoading?"⟳":"🤖"}</span>
                {isMobile ? "" : "AI News Update"}
              </button>
            </div>
          </div>
          {aiError && <div style={{marginTop:8, padding:"7px 12px", background:"#160606", border:`1px solid ${C.bear}44`, borderRadius:RADIUS.sm, fontSize:11, color:C.bear}}>⚠️ {aiError}</div>}
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </header>

        {/* NEWS TICKER */}
        <NewsTicker isMobile={isMobile} />

        {/* TABS */}
        <div style={{ display:"flex", gap:6, marginBottom:22 }}>
          {TABS.map(([id,lbl]) => (
            <button key={id} onClick={()=>setTab(id)} style={{
              flex:1, padding: isMobile?"10px 0":"12px 0",
              background: tab===id ? C.surface : "transparent",
              border: tab===id ? `1px solid ${C.gold}55` : `1px solid ${C.border}`,
              borderRadius:RADIUS.md, color: tab===id ? C.gold : C.textMid,
              fontSize: isMobile?13:14.5, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
            }}>{lbl}</button>
          ))}
        </div>

        {/* MÄRKTE */}
        {tab==="markets" && (
          <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:18 }}>
            <div>
              <SectionLabel>KRYPTO — Live-Preise via CoinGecko · Klicken für Detail & Analyse</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {liveAssets.filter(a=>["sol","btc","eth"].includes(a.id)).map(a=>(
                  <AssetCard key={a.id} a={a} />
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>ROHSTOFFE — Live-Preise via CoinGecko · Klicken für Detail & Analyse</SectionLabel>
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

        {/* TRADES */}
        {tab==="trades" && (
          <div>
            <div style={{ background:C.surface, border:`1px solid ${C.gold}33`, borderRadius:RADIUS.md, padding:"14px 18px", marginBottom:18, fontSize:14, color:C.textMid, lineHeight:1.6 }}>
              <span style={{color:C.gold, fontWeight:700}}>Cross-Check · keine Empfehlung. </span>
              SOL (⭐) → Gold (💡) → BTC (⏸) → ETH (⛔). 1H/2H mit Confluence.
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:16 }}>
              {TRADES.map(g=><TradeGroup key={g.asset} g={g}/>)}
            </div>
          </div>
        )}

        {/* NEWS */}
        {tab==="news" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{fontSize:13, color:C.textLow}}>Klick auf News → vollständige Analyse mit Erklärungen</div>
              {aiLastUpd && <div style={{fontSize:11, color:C.bull}}>🤖 AI-Update: {aiLastUpd}</div>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:14, alignItems:"start" }}>
              {news.map((n,i)=><NewsCard key={i} n={n}/>)}
            </div>
          </div>
        )}

        {/* KALENDER */}
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

function useIsMobile() {
  const [m,setM] = useState(window.innerWidth<768);
  useEffect(()=>{ const h=()=>setM(window.innerWidth<768); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);
  return m;
}
