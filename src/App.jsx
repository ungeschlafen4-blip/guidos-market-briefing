import React, { useState, useCallback, useEffect } from "react";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import NewsTicker from "./components/NewsTicker";
import DashboardLogo from "./components/DashboardLogo";
import SplashScreen from "./components/SplashScreen";
import MacroTile, { MACRO_ASSETS as MACRO_BASE } from "./components/MacroTile_v2";
import { ASSETS, TOTAL_MARKET_CAP_LINK } from "./data/assets";
import { TRADES as DEFAULT_TRADES } from "./data/trades";
import { NEWS_DEFAULT } from "./data/news";
import { C, FONT, RADIUS } from "./styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// APP v12 — Splash-Screen beim Start + neuer Ticker mit Live-Sync
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCryptoPrices() {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_7d_change=true");
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const d = await res.json();
  return {
    btc: {price:d.bitcoin?.usd, chg24:d.bitcoin?.usd_24h_change, chg7:d.bitcoin?.usd_7d_change},
    eth: {price:d.ethereum?.usd,chg24:d.ethereum?.usd_24h_change,chg7:d.ethereum?.usd_7d_change},
    sol: {price:d.solana?.usd,  chg24:d.solana?.usd_24h_change,  chg7:d.solana?.usd_7d_change},
  };
}

async function fetchMetalPrices() {
  const result = { gold: null, silver: null };
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=XAU&to=USD");
    const d = await r.json();
    if (d?.rates?.USD) result.gold = { price: d.rates.USD, chg24: null, chg7: null, live: true };
  } catch {}
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=XAG&to=USD");
    const d = await r.json();
    if (d?.rates?.USD) result.silver = { price: d.rates.USD, chg24: null, chg7: null, live: true };
  } catch {}
  if (!result.gold)   result.gold   = { price: 4036, chg24: +0.2, chg7: -5.1, live: false };
  if (!result.silver) result.silver = { price: 57.00, chg24: -0.3, chg7: -3.2, live: false };
  return result;
}

const YAHOO_SYMBOLS = { spx:"^GSPC", ndx:"^NDX", wti:"CL=F", dxy:"DX-Y.NYB", us10y:"^TNX", vix:"^VIX" };

async function fetchMacroPrices() {
  const out = {};
  await Promise.allSettled(
    Object.entries(YAHOO_SYMBOLS).map(async ([id, sym]) => {
      try {
        const res = await fetch(`/api/yahoo-proxy?symbol=${encodeURIComponent(sym)}&range=5d&interval=1d`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          const price = meta.regularMarketPrice;
          const prevClose = meta.previousClose || meta.chartPreviousClose;
          const chg = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
          out[id] = { price, chg: parseFloat(chg.toFixed(2)), live: true };
        }
      } catch {}
    })
  );
  return out;
}

function fmtPrice(price,id) {
  if (!price && price!==0) return null;
  if (["btc","gold"].includes(id)) return Math.round(price).toLocaleString("de-DE");
  if (id==="eth") return Math.round(price).toLocaleString("de-DE");
  return price.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});
}

async function fetchBackendData() {
  const res = await fetch("/api/get-data");
  if (!res.ok) throw new Error(`Backend ${res.status}`);
  return res.json();
}

function useIsMobile() {
  const [m,setM]=useState(window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

function formatTimestamp(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleString("de-AT", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }); }
  catch { return null; }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Nur beim echten Laden/Refresh zeigen, nicht bei jedem internen State-Update
    return true;
  });

  const isMobile = useIsMobile();
  const [tab,setTab]=useState("markets");
  const [news,setNews]=useState(NEWS_DEFAULT);
  const [trades,setTrades]=useState(DEFAULT_TRADES);
  const [newsUpdated,setNewsUpdated]=useState(null);
  const [tradesUpdated,setTradesUpdated]=useState(null);
  const [backendErr,setBackendErr]=useState(null);
  const [cryptoPrices,setCryptoPrices]=useState(null);
  const [metalPrices,setMetalPrices]=useState(null);
  const [macroPrices,setMacroPrices]=useState(null);
  const [lastFetch,setLastFetch]=useState(null);
  const [priceErr,setPriceErr]=useState(null);

  const loadPrices = useCallback(async () => {
    try {
      const [c,m,mk] = await Promise.allSettled([fetchCryptoPrices(),fetchMetalPrices(),fetchMacroPrices()]);
      if (c.status==="fulfilled") setCryptoPrices(c.value);
      if (m.status==="fulfilled") setMetalPrices(m.value);
      if (mk.status==="fulfilled") setMacroPrices(mk.value);
      setLastFetch(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
      setPriceErr(null);
    } catch(e) { setPriceErr(e.message); }
  },[]);

  const loadBackendData = useCallback(async () => {
    try {
      const data = await fetchBackendData();
      if (data.news?.length) { setNews(data.news); setNewsUpdated(data.newsUpdated); }
      if (data.trades?.length) { setTrades(data.trades); setTradesUpdated(data.tradesUpdated); }
      setBackendErr(null);
    } catch(e) {
      setBackendErr("Backend noch nicht erreichbar — Standarddaten aktiv");
    }
  },[]);

  useEffect(()=>{ loadPrices(); const iv=setInterval(loadPrices,30000); return()=>clearInterval(iv); },[loadPrices]);
  useEffect(()=>{
    loadBackendData();
    const iv = setInterval(loadBackendData, 10*60*1000);
    return()=>clearInterval(iv);
  },[loadBackendData]);

  const liveAssets = ASSETS.map(a => {
    const all = {...cryptoPrices, ...metalPrices};
    if (all[a.id]) {
      const l = all[a.id];
      return {
        ...a,
        price: fmtPrice(l.price,a.id)||a.price,
        chg24: l.chg24!==null && l.chg24!==undefined ? parseFloat((l.chg24).toFixed(1)) : a.chg24,
        chg7:  l.chg7!==null  && l.chg7!==undefined  ? parseFloat((l.chg7).toFixed(1))  : a.chg7,
        isLive: l.live !== false,
      };
    }
    return { ...a, isLive: false };
  });

  const liveMacro = MACRO_BASE.map(m => {
    const live = macroPrices?.[m.id];
    if (live) {
      const decimals = ["wti","dxy","us10y","vix"].includes(m.id) ? 2 : 0;
      return { ...m, p: live.price.toLocaleString("de-DE",{minimumFractionDigits:decimals,maximumFractionDigits:decimals}) + (m.id==="us10y"?"%":""), ch: live.chg, isLive: true };
    }
    return { ...m, isLive: false };
  });

  const TABS=[["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]];

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <div style={{minHeight:"100vh",background:C.bg,color:C.textHi,fontFamily:FONT.sans}}>
        <div style={{maxWidth:1500,margin:"0 auto",padding:isMobile?"14px 14px 60px":"28px 50px 60px"}}>

          <header style={{borderBottom:`1px solid ${C.border}`,paddingBottom:18,marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <DashboardLogo/>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                {lastFetch && (
                  <div style={{fontSize:12,color:C.textLow,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{color:C.bull}}>●</span> Preise: {lastFetch}
                    {newsUpdated && <span>· News: {formatTimestamp(newsUpdated)}</span>}
                    {tradesUpdated && <span>· Trades: {formatTimestamp(tradesUpdated)}</span>}
                  </div>
                )}
                <a href={TOTAL_MARKET_CAP_LINK} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:5,background:C.surface,border:`1px solid ${C.border}`,borderRadius:RADIUS.md,padding:"9px 14px",color:C.textMid,fontSize:12,fontWeight:700,textDecoration:"none"}}>
                  🌐 {isMobile?"TOTAL":"Total Market"}
                </a>
                <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:6,background:C.surface,border:`1px solid ${C.border}`,borderRadius:RADIUS.md,padding:"9px 14px",color:C.textMid,fontSize:12,fontWeight:700,textDecoration:"none"}}>
                  🔗 {isMobile?"MCO":"MCO Terminal"}
                </a>
              </div>
            </div>
            {priceErr&&<div style={{marginTop:8,padding:"6px 12px",background:"#160606",border:`1px solid ${C.bear}44`,borderRadius:RADIUS.sm,fontSize:11,color:C.bear}}>⚠️ {priceErr}</div>}
            {backendErr&&<div style={{marginTop:8,padding:"6px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:RADIUS.sm,fontSize:11,color:C.textMid}}>ℹ️ {backendErr}</div>}
          </header>

          <NewsTicker isMobile={isMobile} liveAssets={liveAssets}/>

          <div style={{display:"flex",gap:7,marginBottom:24}}>
            {TABS.map(([id,lbl])=>(
              <button key={id} onClick={()=>setTab(id)} style={{
                flex:1,padding:isMobile?"11px 0":"14px 0",
                background:tab===id?C.surface:"transparent",
                border:tab===id?`1px solid ${C.borderHi}`:`1px solid ${C.border}`,
                borderRadius:RADIUS.md,color:tab===id?C.textHi:C.textMid,
                fontSize:isMobile?14:16,fontWeight:600,cursor:"pointer",transition:"all 0.15s",
              }}>{lbl}</button>
            ))}
          </div>

          {/* MÄRKTE */}
          {tab==="markets"&&(
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20}}>
              <div>
                <SLabel>KRYPTO — Live via Binance WebSocket</SLabel>
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {liveAssets.filter(a=>["sol","btc","eth"].includes(a.id)).map(a=><AssetCard key={a.id} a={a}/>)}
                </div>
              </div>
              <div>
                <SLabel>ROHSTOFFE — Live via Frankfurter API</SLabel>
                <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:28}}>
                  {liveAssets.filter(a=>["gold","silver"].includes(a.id)).map(a=>(
                    <div key={a.id} style={{position:"relative"}}>
                      <AssetCard a={a}/>
                      {!a.isLive && <div style={{position:"absolute",top:14,right:14,fontSize:10,fontWeight:700,color:C.textLow,background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 8px"}}>SNAPSHOT</div>}
                    </div>
                  ))}
                </div>
                <SLabel>MAKRO — Live via Yahoo Finance</SLabel>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {liveMacro.map(m=>(
                    <div key={m.n} style={{position:"relative"}}>
                      <MacroTile m={m}/>
                      {!m.isLive && <div style={{position:"absolute",top:10,right:10,fontSize:9,fontWeight:700,color:C.textLow,background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px"}}>SNAPSHOT</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TRADES */}
          {tab==="trades"&&(
            <div>
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:RADIUS.md,padding:"16px 20px",marginBottom:22}}>
                <div style={{fontSize:15,color:C.textHi,fontWeight:600,marginBottom:6}}>
                  〰️ Elliott-Wave Trade-Setups
                  {tradesUpdated && <span style={{fontSize:13,color:C.bull,fontWeight:400,marginLeft:12}}>✓ Automatisch aktualisiert: {formatTimestamp(tradesUpdated)}</span>}
                </div>
                <div style={{fontSize:13,color:C.textMid}}>
                  Aktualisiert sich automatisch 1x täglich im Hintergrund (06:00 UTC). Klick auf <strong style={{color:C.textHi}}>「〰️ Übergeordnete Struktur」</strong> für Weekly-Chart + Wellen-Vorschau.
                </div>
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
                <div style={{fontSize:14,color:C.textLow}}>
                  Klick → vollständige Analyse + Fachbegriff-Erklärungen
                  {newsUpdated && <span style={{color:C.bull,marginLeft:8}}>· ✓ Aktualisiert: {formatTimestamp(newsUpdated)}</span>}
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
              <div style={{fontSize:14,color:C.textLow,marginBottom:18}}>Klick auf einen Tag → vollständige Tagesübersicht mit Events und BTC/ETH-Impact</div>
              <CalendarView/>
            </div>
          )}

          <div style={{marginTop:40,fontSize:12,color:C.textLow,textAlign:"center",lineHeight:2}}>
            Binance WebSocket · Yahoo Finance · Claude AI (automatisch täglich) · keine Anlageberatung
          </div>
        </div>
      </div>
    </>
  );
}

function SLabel({children}) {
  return <div style={{fontSize:13,color:C.textLow,letterSpacing:"0.07em",fontWeight:700,marginBottom:16,textTransform:"uppercase"}}>{children}</div>;
}
