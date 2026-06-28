import React, { useState, useCallback, useEffect, useRef } from "react";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import NewsTicker from "./components/NewsTicker";
import MacroTile, { MACRO_ASSETS } from "./components/MacroTile_v2";
import { ASSETS } from "./data/assets";
import { NEWS_DEFAULT } from "./data/news";
import { C, FONT, RADIUS } from "./styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// APP v5
// - Claude AI analysiert beim Start aktuelle Preise → updated Trades + Wave-Labels
// - Max 2x täglich automatisch (gespeichert in sessionStorage)
// - CoinGecko Preise alle 30s
// - News alle 2h
// ─────────────────────────────────────────────────────────────────────────────

// ── PREIS-FETCH ───────────────────────────────────────────────────────────────
async function fetchCryptoPrices() {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_7d_change=true");
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const d = await res.json();
  return {
    btc: { price:d.bitcoin?.usd,  chg24:d.bitcoin?.usd_24h_change,  chg7:d.bitcoin?.usd_7d_change  },
    eth: { price:d.ethereum?.usd, chg24:d.ethereum?.usd_24h_change, chg7:d.ethereum?.usd_7d_change },
    sol: { price:d.solana?.usd,   chg24:d.solana?.usd_24h_change,   chg7:d.solana?.usd_7d_change   },
  };
}

async function fetchMetalPrices() {
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=XAU&to=USD");
    const d = await r.json();
    return {
      gold:   { price:d?.rates?.USD ?? 4036, chg24:null, chg7:null },
      silver: { price:57.00, chg24:-0.3, chg7:-3.2 },
    };
  } catch {
    return {
      gold:   { price:4036, chg24:+0.2, chg7:-5.1 },
      silver: { price:57.00, chg24:-0.3, chg7:-3.2 },
    };
  }
}

function fmtPrice(price, id) {
  if (!price && price !== 0) return null;
  if (["btc","gold"].includes(id)) return Math.round(price).toLocaleString("de-DE");
  if (id === "eth") return Math.round(price).toLocaleString("de-DE");
  return price.toLocaleString("de-DE", {minimumFractionDigits:2, maximumFractionDigits:2});
}

// ── CLAUDE AI ANALYSE — Trades + Wave Labels ──────────────────────────────────
async function fetchClaudeAnalysis(btcPrice, ethPrice, solPrice) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-6", max_tokens:2000,
      tools:[{type:"web_search_20250305",name:"web_search"}],
      messages:[{role:"user", content:`Analysiere die aktuellen Krypto-Märkte und erstelle Trade-Setups.
Aktuelle Preise: BTC $${btcPrice}, ETH $${ethPrice}, SOL $${solPrice}

Suche im Web nach: aktuelle BTC ETH SOL Marktlage, Elliott Wave Analyse heute, wichtige Support/Resistance Levels.

Antworte NUR mit JSON ohne Backticks:
{
  "timestamp": "HH:MM MESZ",
  "trades": [
    {
      "asset": "Solana",
      "ticker": "SOL/USD",
      "bias": "bull",
      "biasCol": "#2ecc71",
      "priority": "⭐ PRIORISIERT",
      "note": "Kurze Begründung warum dieses Asset priorisiert",
      "setups": [
        {
          "type": "long",
          "label": "1H: Konkrete Setup-Beschreibung",
          "tf": "1H · Scalp",
          "wave": "Elliott-Wellen-Kontext",
          "entry": "Preis$",
          "stop": "Preis$ (X%)",
          "t1": "Preis$ (+X%)",
          "t2": "Preis$ (+X%)",
          "crv": "1:X · 1:X",
          "duration": "T1: Xh · T2: Xh",
          "confluence": [["Signal","Beschreibung ✅"]],
          "exec": "Konkrete Ausführungsanweisung",
          "invalid": "Invalidierungsbedingung",
          "isBWave": false
        }
      ]
    }
  ],
  "waveLabels": {
    "btc": [{"candleIndex": 40, "label": "C", "position": "bottom"}, {"candleIndex": 10, "label": "B", "position": "top"}],
    "eth": [{"candleIndex": 40, "label": "C", "position": "bottom"}],
    "sol": [{"candleIndex": 40, "label": "5", "position": "bottom"}, {"candleIndex": 20, "label": "4", "position": "top"}]
  }
}`}],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const raw = await res.json();
  const txt = raw.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Kein JSON");
  return JSON.parse(m[0]);
}

// ── CLAUDE AI NEWS ────────────────────────────────────────────────────────────
async function fetchAINews() {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-6", max_tokens:1500,
      tools:[{type:"web_search_20250305",name:"web_search"}],
      messages:[{role:"user",content:`Suche die wichtigsten aktuellen Krypto- und Finanznews. Antworte NUR mit JSON ohne Backticks.
JSON: {"news":[{"tag":"KRYPTO oder MAKRO","date":"heute","icon":"Emoji","title":"Titel","summary":"1-2 Sätze","full":"Analyse mit\\n\\n📌 Fachbegriffe:\\n• Begriff: Erklärung\\n\\n📈 Auswirkung:\\nText","impact":"bullisch oder bearisch oder neutral","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}`}],
    }),
  });
  if (!res.ok) throw new Error(`Claude News ${res.status}`);
  const raw = await res.json();
  const txt = raw.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Kein JSON");
  const d = JSON.parse(m[0]);
  return d.news;
}

function useIsMobile() {
  const [m,setM]=useState(window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

// ── STANDARD TRADES (Fallback) ────────────────────────────────────────────────
import { TRADES as DEFAULT_TRADES } from "./data/trades";

export default function App() {
  const isMobile = useIsMobile();
  const [tab,setTab]=useState("markets");
  const [news,setNews]=useState(NEWS_DEFAULT);
  const [trades,setTrades]=useState(DEFAULT_TRADES);
  const [waveLabels,setWaveLabels]=useState({});
  const [cryptoPrices,setCryptoPrices]=useState(null);
  const [metalPrices,setMetalPrices]=useState(null);
  const [lastFetch,setLastFetch]=useState(null);
  const [priceErr,setPriceErr]=useState(null);
  const [aiStatus,setAiStatus]=useState(null); // "loading"|"done"|"error"|null
  const [aiTime,setAiTime]=useState(null);
  const [newsUpd,setNewsUpd]=useState(null);

  // ── Preise ────────────────────────────────────────────────────────────────
  const loadPrices = useCallback(async () => {
    try {
      const [c,m] = await Promise.allSettled([fetchCryptoPrices(), fetchMetalPrices()]);
      if (c.status==="fulfilled") setCryptoPrices(c.value);
      if (m.status==="fulfilled") setMetalPrices(m.value);
      setLastFetch(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
      setPriceErr(null);
    } catch(e) { setPriceErr(e.message); }
  },[]);

  useEffect(()=>{ loadPrices(); const iv=setInterval(loadPrices,30000); return()=>clearInterval(iv); },[loadPrices]);

  // ── Claude AI Analyse (max 2x täglich) ───────────────────────────────────
  const runClaudeAnalysis = useCallback(async (btc, eth, sol) => {
    // Check: Heute schon 2x analysiert?
    const today = new Date().toDateString();
    const key = "claude_analysis_count";
    const stored = JSON.parse(sessionStorage.getItem(key)||"{}");
    const todayCount = stored.date === today ? stored.count : 0;
    if (todayCount >= 2) {
      setAiStatus("done");
      setAiTime(`${stored.lastTime} (max 2x/Tag erreicht)`);
      return;
    }

    setAiStatus("loading");
    try {
      const result = await fetchClaudeAnalysis(btc, eth, sol);
      if (result.trades?.length) setTrades(result.trades);
      if (result.waveLabels) setWaveLabels(result.waveLabels);
      const now = new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"});
      setAiTime(now);
      setAiStatus("done");
      // Zähler erhöhen
      sessionStorage.setItem(key, JSON.stringify({date:today, count:todayCount+1, lastTime:now}));
    } catch(e) {
      setAiStatus("error");
      console.error("Claude Analyse:", e);
    }
  },[]);

  // ── News ──────────────────────────────────────────────────────────────────
  const loadNews = useCallback(async () => {
    try {
      const n = await fetchAINews();
      if (n?.length) setNews(n);
      setNewsUpd(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"}));
    } catch {}
  },[]);

  useEffect(()=>{ loadNews(); const iv=setInterval(loadNews,2*60*60*1000); return()=>clearInterval(iv); },[loadNews]);

  // ── Wenn Preise geladen: Claude Analyse starten ───────────────────────────
  useEffect(()=>{
    if (cryptoPrices?.btc?.price && cryptoPrices?.eth?.price && cryptoPrices?.sol?.price) {
      runClaudeAnalysis(
        Math.round(cryptoPrices.btc.price),
        Math.round(cryptoPrices.eth.price),
        cryptoPrices.sol.price.toFixed(2)
      );
    }
  },[cryptoPrices?.btc?.price]); // Nur einmal wenn BTC-Preis erstmals geladen

  // ── Assets mit Live-Preisen ───────────────────────────────────────────────
  const liveAssets = ASSETS.map(a => {
    const all = {...cryptoPrices,...metalPrices};
    const wl = waveLabels[a.id] || a.waveLabels || [];
    if (all[a.id]) {
      const l = all[a.id];
      return { ...a, price:fmtPrice(l.price,a.id)||a.price, chg24:l.chg24!==null?parseFloat((l.chg24??0).toFixed(1)):a.chg24, chg7:l.chg7!==null?parseFloat((l.chg7??0).toFixed(1)):a.chg7, waveLabels:wl };
    }
    return { ...a, waveLabels:wl };
  });

  const TABS=[["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.textHi,fontFamily:FONT.sans}}>
      <div style={{maxWidth:1500,margin:"0 auto",padding:isMobile?"14px 14px 60px":"28px 50px 60px"}}>

        {/* HEADER */}
        <header style={{borderBottom:`1px solid ${C.border}`,paddingBottom:18,marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <div>
              <h1 style={{fontFamily:FONT.serif,fontSize:isMobile?24:36,margin:0,color:C.textHi,fontWeight:700,letterSpacing:"0.01em"}}>
                Guido's <span style={{color:C.gold}}>Market</span> Briefing
              </h1>
              <div style={{fontSize:13,color:C.textLow,marginTop:6,display:"flex",flexWrap:"wrap",gap:"6px 16px"}}>
                {lastFetch && <span><span style={{color:C.bull}}>●</span>{" "}Live: {lastFetch} · Auto 30s</span>}
                {newsUpd && <span style={{color:C.textLow}}>🤖 News: {newsUpd}</span>}
                {aiStatus==="loading" && <span style={{color:C.gold}}>〰️ Claude analysiert Markt...</span>}
                {aiStatus==="done" && aiTime && <span style={{color:C.bull}}>✓ Trades: {aiTime}</span>}
                {aiStatus==="error" && <span style={{color:C.bear}}>⚠️ AI-Analyse fehlgeschlagen</span>}
                {priceErr && <span style={{color:C.bear}}>⚠️ {priceErr}</span>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:6,background:C.surface,border:`1px solid ${C.purple}55`,borderRadius:RADIUS.md,padding:"11px 18px",color:C.purple,fontSize:14,fontWeight:700,textDecoration:"none"}}>
                🔗 {isMobile?"MCO":"MCO Terminal"}
              </a>
              <button onClick={()=>{ loadNews(); runClaudeAnalysis(Math.round(cryptoPrices?.btc?.price||60000),Math.round(cryptoPrices?.eth?.price||1500),(cryptoPrices?.sol?.price||70).toFixed(2)); }}
                style={{background:C.surface,border:`1px solid ${C.gold}`,borderRadius:RADIUS.md,padding:"11px 18px",color:C.gold,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
                🤖 {isMobile?"AI":"AI Analyse"}
              </button>
            </div>
          </div>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </header>

        {/* NEWS TICKER */}
        <NewsTicker isMobile={isMobile}/>

        {/* TABS */}
        <div style={{display:"flex",gap:7,marginBottom:24}}>
          {TABS.map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              flex:1,padding:isMobile?"11px 0":"14px 0",
              background:tab===id?C.surface:"transparent",
              border:tab===id?`1px solid ${C.gold}55`:`1px solid ${C.border}`,
              borderRadius:RADIUS.md,color:tab===id?C.gold:C.textMid,
              fontSize:isMobile?14:16,fontWeight:600,cursor:"pointer",transition:"all 0.15s",
            }}>{lbl}</button>
          ))}
        </div>

        {/* MÄRKTE */}
        {tab==="markets"&&(
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20}}>
            <div>
              <SLabel>KRYPTO — Live Candlesticks + Elliott-Wellen · Detail-Analyse klicken</SLabel>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                {liveAssets.filter(a=>["sol","btc","eth"].includes(a.id)).map(a=><AssetCard key={a.id} a={a}/>)}
              </div>
            </div>
            <div>
              <SLabel>ROHSTOFFE — Live-Preise · Klicken für Analyse</SLabel>
              <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:28}}>
                {liveAssets.filter(a=>["gold","silver"].includes(a.id)).map(a=><AssetCard key={a.id} a={a}/>)}
              </div>
              <SLabel>MAKRO — Klicken für TradingView Chart</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {MACRO_ASSETS.map(m=><MacroTile key={m.n} m={m}/>)}
              </div>
            </div>
          </div>
        )}

        {/* TRADES */}
        {tab==="trades"&&(
          <div>
            <div style={{background:C.surface,border:`1px solid ${C.gold}33`,borderRadius:RADIUS.md,padding:"16px 20px",marginBottom:20,fontSize:15,color:C.textMid,lineHeight:1.65,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div>
                <span style={{color:C.gold,fontWeight:700}}>Claude AI Trade-Analyse. </span>
                {aiStatus==="done"&&aiTime?<span style={{color:C.bull}}>✓ Zuletzt analysiert: {aiTime}</span>:<span>SOL (⭐) → Gold (💡) → BTC (⏸) → ETH (⛔)</span>}
              </div>
              <span style={{fontSize:12,color:C.textLow}}>Kein Trading-Signal — Cross-Check only</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:18}}>
              {trades.map((g,i)=><TradeGroup key={g.asset||i} g={g}/>)}
            </div>
          </div>
        )}

        {/* NEWS */}
        {tab==="news"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
              <div style={{fontSize:14,color:C.textLow}}>Klick → vollständige Analyse + Fachbegriff-Erklärungen · Auto alle 2h</div>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {newsUpd&&<span style={{fontSize:12,color:C.bull}}>🤖 {newsUpd}</span>}
                <button onClick={loadNews} style={{background:C.surface,border:`1px solid ${C.gold}44`,borderRadius:RADIUS.sm,padding:"8px 16px",color:C.gold,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  🔄 Jetzt updaten
                </button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16,alignItems:"start"}}>
              {news.map((n,i)=><NewsCard key={i} n={n}/>)}
            </div>
          </div>
        )}

        {/* KALENDER */}
        {tab==="calendar"&&(
          <div>
            <div style={{fontSize:14,color:C.textLow,marginBottom:18}}>
              Klick auf einen Tag → vollständige Tagesübersicht mit Events und BTC/ETH-Impact-Analyse
            </div>
            <CalendarView/>
          </div>
        )}

        <div style={{marginTop:40,fontSize:12,color:C.textLow,textAlign:"center",lineHeight:2}}>
          Binance Live-Kerzen · CoinGecko Preise · Claude AI Trades+News · Auto-Refresh · keine Anlageberatung
        </div>
      </div>
    </div>
  );
}

function SLabel({children}) {
  return <div style={{fontSize:13,color:C.textLow,letterSpacing:"0.07em",fontWeight:700,marginBottom:16,textTransform:"uppercase"}}>{children}</div>;
}
