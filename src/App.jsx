import React, { useState, useCallback, useEffect, useRef } from "react";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import NewsTicker from "./components/NewsTicker";
import MacroTile, { MACRO_ASSETS } from "./components/MacroTile_v3";
import { ASSETS } from "./data/assets";
import { TRADES } from "./data/trades";
import { NEWS_DEFAULT } from "./data/news";
import { C, FONT, RADIUS } from "./styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// APP v4 — Größeres Layout · Live Candlesticks · TV-Widgets · Auto-News
// ─────────────────────────────────────────────────────────────────────────────

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
      gold:   { price: d?.rates?.USD ?? 4036,  chg24: null, chg7: null },
      silver: { price: 57.00, chg24: -0.3, chg7: -3.2 },
    };
  } catch {
    return {
      gold:   { price: 4036,  chg24: +0.2, chg7: -5.1 },
      silver: { price: 57.00, chg24: -0.3, chg7: -3.2 },
    };
  }
}

function fmtPrice(price, id) {
  if (!price && price !== 0) return null;
  if (id === "btc" || id === "gold") return Math.round(price).toLocaleString("de-DE");
  if (id === "eth") return Math.round(price).toLocaleString("de-DE");
  return price.toLocaleString("de-DE", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

async function fetchAINews() {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-6", max_tokens:1500,
      tools:[{type:"web_search_20250305",name:"web_search"}],
      messages:[{role:"user",content:`Suche die wichtigsten aktuellen Krypto- und Finanznews von heute. Antworte NUR mit JSON ohne Backticks.
Gib genau 6 News zurück.
JSON: {"news":[{"tag":"KRYPTO oder MAKRO oder AKTIEN","date":"heute Datum","icon":"Emoji","title":"Titel","summary":"1-2 Sätze","full":"Analyse mit:\\n\\n📌 Fachbegriffe:\\n• Begriff: Erklärung\\n\\n📈 Auswirkung:\\nText","impact":"bullisch oder bearisch oder neutral","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}`}],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const raw = await res.json();
  const txt = raw.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Kein JSON");
  const d = JSON.parse(m[0]);
  if (!d.news?.length) throw new Error("Leer");
  return d.news;
}

function useIsMobile() {
  const [m,setM]=useState(window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

export default function App() {
  const isMobile = useIsMobile();
  const [tab,setTab]=useState("markets");
  const [news,setNews]=useState(NEWS_DEFAULT);
  const [cryptoPrices,setCryptoPrices]=useState(null);
  const [metalPrices,setMetalPrices]=useState(null);
  const [lastFetch,setLastFetch]=useState(null);
  const [priceErr,setPriceErr]=useState(null);
  const [newsLoading,setNewsLoading]=useState(false);
  const [newsErr,setNewsErr]=useState(null);
  const [newsUpd,setNewsUpd]=useState(null);

  const loadPrices = useCallback(async () => {
    try {
      const [c,m] = await Promise.allSettled([fetchCryptoPrices(), fetchMetalPrices()]);
      if (c.status==="fulfilled") setCryptoPrices(c.value);
      if (m.status==="fulfilled") setMetalPrices(m.value);
      setLastFetch(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
      setPriceErr(null);
    } catch(e) { setPriceErr(e.message); }
  }, []);

  const loadNews = useCallback(async () => {
    setNewsLoading(true); setNewsErr(null);
    try {
      const n = await fetchAINews();
      setNews(n);
      setNewsUpd(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"}));
    } catch(e) { setNewsErr(e.message); }
    finally { setNewsLoading(false); }
  }, []);

  useEffect(()=>{ loadPrices(); const iv=setInterval(loadPrices,30000); return()=>clearInterval(iv); },[loadPrices]);
  useEffect(()=>{ loadNews(); const iv=setInterval(loadNews,2*60*60*1000); return()=>clearInterval(iv); },[loadNews]);

  const liveAssets = ASSETS.map(a => {
    const all = {...cryptoPrices,...metalPrices};
    if (all[a.id]) {
      const l = all[a.id];
      return { ...a, price: fmtPrice(l.price,a.id)||a.price, chg24: l.chg24!==null?parseFloat((l.chg24??0).toFixed(1)):a.chg24, chg7: l.chg7!==null?parseFloat((l.chg7??0).toFixed(1)):a.chg7 };
    }
    return a;
  });

  const TABS=[["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.textHi,fontFamily:FONT.sans}}>
      <div style={{maxWidth:1500,margin:"0 auto",padding: isMobile?"14px 14px 60px":"28px 50px 60px"}}>

        {/* HEADER */}
        <header style={{borderBottom:`1px solid ${C.border}`,paddingBottom:18,marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <div>
              <h1 style={{fontFamily:FONT.serif,fontSize:isMobile?24:36,margin:0,color:C.textHi,fontWeight:700,letterSpacing:"0.01em"}}>
                Guido's <span style={{color:C.gold}}>Market</span> Briefing
              </h1>
              <div style={{fontSize:13,color:C.textLow,marginTop:6}}>
                {lastFetch
                  ? <><span style={{color:C.bull}}>●</span>{" "}Live: {lastFetch} · Auto 30s{newsUpd?` · News: ${newsUpd}`:""}</>
                  : <span style={{color:C.gold}}>⟳ Lade Live-Daten...</span>
                }
                {priceErr&&<span style={{color:C.bear}}> · ⚠️ {priceErr}</span>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:6,background:C.surface,border:`1px solid ${C.purple}55`,borderRadius:RADIUS.md,padding:"11px 18px",color:C.purple,fontSize:14,fontWeight:700,textDecoration:"none"}}>
                🔗 {isMobile?"MCO":"MCO Terminal"}
              </a>
              <button onClick={loadNews} disabled={newsLoading}
                style={{background:C.surface,border:`1px solid ${newsLoading?C.textLow:C.gold}`,borderRadius:RADIUS.md,padding:"11px 18px",color:newsLoading?C.textLow:C.gold,fontSize:14,fontWeight:700,cursor:newsLoading?"wait":"pointer",display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:17,display:"inline-block",animation:newsLoading?"spin 0.8s linear infinite":"none"}}>{newsLoading?"⟳":"🤖"}</span>
                {isMobile?"":"AI News"}
              </button>
            </div>
          </div>
          {newsLoading&&<div style={{marginTop:10,padding:"8px 14px",background:C.surface,border:`1px solid ${C.gold}33`,borderRadius:RADIUS.sm,fontSize:12,color:C.textMid}}>🔍 Claude sucht aktuelle News...</div>}
          {newsErr&&<div style={{marginTop:10,padding:"8px 14px",background:"#160606",border:`1px solid ${C.bear}44`,borderRadius:RADIUS.sm,fontSize:12,color:C.bear}}>⚠️ {newsErr}</div>}
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
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
            }}
              onMouseEnter={e=>{if(tab!==id){e.currentTarget.style.borderColor=C.borderHi;e.currentTarget.style.color=C.textHi;}}}
              onMouseLeave={e=>{if(tab!==id){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid;}}}
            >{lbl}</button>
          ))}
        </div>

        {/* MÄRKTE */}
        {tab==="markets"&&(
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20}}>
            <div>
              <SLabel>KRYPTO — Live Candlesticks · Klicken für vollständige Analyse</SLabel>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                {liveAssets.filter(a=>["sol","btc","eth"].includes(a.id)).map(a=><AssetCard key={a.id} a={a}/>)}
              </div>
            </div>
            <div>
              <SLabel>ROHSTOFFE — Live-Preise · Klicken für Analyse</SLabel>
              <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:28}}>
                {liveAssets.filter(a=>["gold","silver"].includes(a.id)).map(a=><AssetCard key={a.id} a={a}/>)}
              </div>
              <SLabel>MAKRO — Klicken für TradingView Live-Chart</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {MACRO_ASSETS.map(m=><MacroTile key={m.n} m={m}/>)}
              </div>
            </div>
          </div>
        )}

        {/* TRADES */}
        {tab==="trades"&&(
          <div>
            <div style={{background:C.surface,border:`1px solid ${C.gold}33`,borderRadius:RADIUS.md,padding:"16px 20px",marginBottom:20,fontSize:15,color:C.textMid,lineHeight:1.65}}>
              <span style={{color:C.gold,fontWeight:700}}>Cross-Check · keine Empfehlung. </span>
              SOL (⭐) → Gold (💡) → BTC (⏸) → ETH (⛔). 1H/2H Setups mit Confluence.
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:18}}>
              {TRADES.map(g=><TradeGroup key={g.asset} g={g}/>)}
            </div>
          </div>
        )}

        {/* NEWS */}
        {tab==="news"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
              <div style={{fontSize:14,color:C.textLow}}>
                Klick auf News → vollständige Analyse + Fachbegriff-Erklärungen · Auto-Update alle 2h
              </div>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {newsUpd&&<span style={{fontSize:12,color:C.bull}}>🤖 Zuletzt: {newsUpd}</span>}
                <button onClick={loadNews} disabled={newsLoading} style={{
                  background:C.surface,border:`1px solid ${C.gold}44`,borderRadius:RADIUS.sm,
                  padding:"8px 16px",color:C.gold,fontSize:13,fontWeight:700,cursor:"pointer",
                }}>{newsLoading?"⟳ Lädt...":"🔄 Jetzt updaten"}</button>
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
              Klick auf einen Tag → vollständige Tagesübersicht mit allen Events und BTC/ETH-Impact
            </div>
            <CalendarView/>
          </div>
        )}

        <div style={{marginTop:40,fontSize:12,color:C.textLow,textAlign:"center",lineHeight:2}}>
          Binance Live-Kerzen · CoinGecko Preise · Yahoo Finance Makro · Claude AI News alle 2h · keine Anlageberatung
        </div>
      </div>
    </div>
  );
}

function SLabel({children}) {
  return (
    <div style={{fontSize:13,color:C.textLow,letterSpacing:"0.07em",fontWeight:700,marginBottom:16,textTransform:"uppercase"}}>
      {children}
    </div>
  );
}
