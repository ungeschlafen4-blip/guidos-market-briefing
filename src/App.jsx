import React, { useState, useCallback, useEffect } from "react";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import NewsTicker from "./components/NewsTicker";
import DashboardLogo from "./components/DashboardLogo";
import SplashScreen from "./components/SplashScreen";
import VoiceAssistant from "./components/VoiceAssistant";
import MacroTile, { MACRO_ASSETS as MACRO_BASE } from "./components/MacroTile_v2";
import { ASSETS, TOTAL_MARKET_CAP_LINK } from "./data/assets";
import { TRADES as DEFAULT_TRADES } from "./data/trades";
import { NEWS_DEFAULT } from "./data/news";
import { C, FONT, RADIUS } from "./styles/theme";

async function fetchCryptoPrices() {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_7d_change=true");
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const d = await res.json();
  return {
    btc:{price:d.bitcoin?.usd,chg24:d.bitcoin?.usd_24h_change,chg7:d.bitcoin?.usd_7d_change},
    eth:{price:d.ethereum?.usd,chg24:d.ethereum?.usd_24h_change,chg7:d.ethereum?.usd_7d_change},
    sol:{price:d.solana?.usd,chg24:d.solana?.usd_24h_change,chg7:d.solana?.usd_7d_change},
  };
}

async function fetchMetalPrices() {
  const r = {gold:null,silver:null};
  try { const d=(await(await fetch("https://api.frankfurter.app/latest?from=XAU&to=USD")).json()); if(d?.rates?.USD) r.gold={price:d.rates.USD,chg24:null,chg7:null,live:true}; } catch {}
  try { const d=(await(await fetch("https://api.frankfurter.app/latest?from=XAG&to=USD")).json()); if(d?.rates?.USD) r.silver={price:d.rates.USD,chg24:null,chg7:null,live:true}; } catch {}
  if(!r.gold)   r.gold   = {price:4036,chg24:+0.2,chg7:-5.1,live:false};
  if(!r.silver) r.silver = {price:57.00,chg24:-0.3,chg7:-3.2,live:false};
  return r;
}

const YAHOO_SYMS = {spx:"^GSPC",ndx:"^NDX",wti:"CL=F",dxy:"DX-Y.NYB",us10y:"^TNX",vix:"^VIX"};
async function fetchMacroPrices() {
  const out={};
  await Promise.allSettled(Object.entries(YAHOO_SYMS).map(async([id,sym])=>{
    try {
      const res = await fetch(`/api/yahoo-proxy?symbol=${encodeURIComponent(sym)}&range=5d&interval=1d`);
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if(meta?.regularMarketPrice){const p=meta.regularMarketPrice,pc=meta.previousClose||meta.chartPreviousClose;out[id]={price:p,chg:pc?parseFloat(((p-pc)/pc*100).toFixed(2)):0,live:true};}
    } catch {}
  }));
  return out;
}

function fmtPrice(p,id) {
  if(!p&&p!==0) return null;
  if(["btc","gold"].includes(id)) return Math.round(p).toLocaleString("de-DE");
  if(id==="eth") return Math.round(p).toLocaleString("de-DE");
  return p.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});
}

async function fetchBackendData() {
  const res = await fetch("/api/get-data");
  if(!res.ok) throw new Error(`Backend ${res.status}`);
  return res.json();
}

function useIsMobile() {
  const [m,setM]=useState(window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

function formatTs(iso) {
  if(!iso) return null;
  try{return new Date(iso).toLocaleString("de-AT",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}catch{return null;}
}

function splitCols(items,n=2){const cols=Array.from({length:n},()=>[]);items.forEach((x,i)=>cols[i%n].push(x));return cols;}

export default function App() {
  const [showSplash,setShowSplash]=useState(true);
  const [showAssistant,setShowAssistant]=useState(false);
  const isMobile=useIsMobile();
  const [tab,setTab]=useState("markets");
  const [news,setNews]=useState(NEWS_DEFAULT);
  const [trades,setTrades]=useState(DEFAULT_TRADES);
  const [newsUpd,setNewsUpd]=useState(null);
  const [tradesUpd,setTradesUpd]=useState(null);
  const [backendErr,setBackendErr]=useState(null);
  const [cryptoPrices,setCryptoPrices]=useState(null);
  const [metalPrices,setMetalPrices]=useState(null);
  const [macroPrices,setMacroPrices]=useState(null);
  const [lastFetch,setLastFetch]=useState(null);
  const [priceErr,setPriceErr]=useState(null);

  const loadPrices=useCallback(async()=>{
    try{const[c,m,mk]=await Promise.allSettled([fetchCryptoPrices(),fetchMetalPrices(),fetchMacroPrices()]);
      if(c.status==="fulfilled")setCryptoPrices(c.value);if(m.status==="fulfilled")setMetalPrices(m.value);if(mk.status==="fulfilled")setMacroPrices(mk.value);
      setLastFetch(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));setPriceErr(null);}
    catch(e){setPriceErr(e.message);}
  },[]);

  const loadBackend=useCallback(async()=>{
    try{const d=await fetchBackendData();
      if(d.news?.length){setNews(d.news);setNewsUpd(d.newsUpdated);}
      if(d.trades?.length){setTrades(d.trades);setTradesUpd(d.tradesUpdated);}
      setBackendErr(null);}
    catch(e){setBackendErr("Backend noch nicht erreichbar — Standarddaten aktiv");}
  },[]);

  useEffect(()=>{loadPrices();const iv=setInterval(loadPrices,30000);return()=>clearInterval(iv);},[loadPrices]);
  useEffect(()=>{loadBackend();const iv=setInterval(loadBackend,10*60*1000);return()=>clearInterval(iv);},[loadBackend]);

  const liveAssets=ASSETS.map(a=>{
    const all={...cryptoPrices,...metalPrices};
    if(all[a.id]){const l=all[a.id];return{...a,price:fmtPrice(l.price,a.id)||a.price,chg24:l.chg24!=null?parseFloat((l.chg24).toFixed(1)):a.chg24,chg7:l.chg7!=null?parseFloat((l.chg7).toFixed(1)):a.chg7,isLive:l.live!==false};}
    return{...a,isLive:false};
  });

  const liveMacro=MACRO_BASE.map(m=>{
    const live=macroPrices?.[m.id];
    if(live){const d=["wti","dxy","us10y","vix"].includes(m.id)?2:0;return{...m,p:live.price.toLocaleString("de-DE",{minimumFractionDigits:d,maximumFractionDigits:d})+(m.id==="us10y"?"%":""),ch:live.chg,isLive:true};}
    return{...m,isLive:false};
  });

  // Tabs — Assistentin als letzter Tab
  const TABS=[["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"],["assistant","🎙️"]];

  return (
    <>
      {showSplash && <SplashScreen onDone={()=>setShowSplash(false)}/>}
      {showAssistant && <VoiceAssistant onClose={()=>{setShowAssistant(false);setTab("markets");}}/>}

      <div style={{minHeight:"100vh",background:C.bg,color:C.textHi,fontFamily:FONT.sans}}>
        <div style={{maxWidth:1500,margin:"0 auto",padding:isMobile?"14px 14px 60px":"28px 50px 60px"}}>

          <header style={{borderBottom:`1px solid ${C.border}`,paddingBottom:18,marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <DashboardLogo/>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                {lastFetch&&<div style={{fontSize:12,color:C.textLow,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:C.bull}}>●</span> {lastFetch}
                  {newsUpd&&<span>· News: {formatTs(newsUpd)}</span>}
                </div>}
                <a href={TOTAL_MARKET_CAP_LINK} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:5,background:C.surface,border:`1px solid ${C.border}`,borderRadius:RADIUS.md,padding:"9px 14px",color:C.textMid,fontSize:12,fontWeight:700,textDecoration:"none"}}>
                  🌐 {isMobile?"":"Total Market"}
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

          {/* TABS — Assistentin-Tab öffnet Overlay */}
          <div style={{display:"flex",gap:7,marginBottom:24}}>
            {TABS.map(([id,lbl])=>(
              <button key={id} onClick={()=>{ if(id==="assistant"){setShowAssistant(true);}else{setTab(id);} }} style={{
                flex: id==="assistant" ? "0 0 auto" : 1,
                padding:isMobile?"11px 0":"14px 0",
                paddingLeft: id==="assistant" ? 16 : undefined,
                paddingRight: id==="assistant" ? 16 : undefined,
                background: tab===id&&id!=="assistant" ? C.surface : "transparent",
                border: id==="assistant" ? `1px solid rgba(46,204,113,0.4)` : tab===id ? `1px solid ${C.borderHi}` : `1px solid ${C.border}`,
                borderRadius:RADIUS.md,
                color: id==="assistant" ? C.bull : tab===id ? C.textHi : C.textMid,
                fontSize:isMobile?14:16,fontWeight:600,cursor:"pointer",transition:"all 0.15s",
              }}
                onMouseEnter={e=>{if(id!=="assistant"&&tab!==id){e.currentTarget.style.borderColor=C.borderHi;e.currentTarget.style.color=C.textHi;}}}
                onMouseLeave={e=>{if(id!=="assistant"&&tab!==id){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid;}}}
              >{lbl}</button>
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
                      {!a.isLive&&<div style={{position:"absolute",top:14,right:14,fontSize:10,fontWeight:700,color:C.textLow,background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 8px"}}>SNAPSHOT</div>}
                    </div>
                  ))}
                </div>
                <SLabel>MAKRO — Live via Yahoo Finance</SLabel>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {liveMacro.map(m=>(
                    <div key={m.n} style={{position:"relative"}}>
                      <MacroTile m={m}/>
                      {!m.isLive&&<div style={{position:"absolute",top:10,right:10,fontSize:9,fontWeight:700,color:C.textLow,background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px"}}>SNAPSHOT</div>}
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
                  {tradesUpd&&<span style={{fontSize:13,color:C.bull,fontWeight:400,marginLeft:12}}>✓ {formatTs(tradesUpd)}</span>}
                </div>
                <div style={{fontSize:13,color:C.textMid}}>Klick auf <strong style={{color:C.textHi}}>「〰️ Übergeordnete Struktur」</strong> für Weekly-Chart + Wellen-Vorschau.</div>
              </div>
              <div style={{display:"flex",gap:18,alignItems:"flex-start",flexWrap:isMobile?"wrap":"nowrap"}}>
                {splitCols(trades,isMobile?1:2).map((col,ci)=>(
                  <div key={ci} style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:18}}>
                    {col.map((g,i)=><TradeGroup key={g.asset||`${ci}-${i}`} g={g}/>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEWS */}
          {tab==="news"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
                <div style={{fontSize:14,color:C.textLow}}>
                  Klick → vollständige Analyse + Fachbegriff-Erklärungen
                  {newsUpd&&<span style={{color:C.bull,marginLeft:8}}>· ✓ {formatTs(newsUpd)}</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:isMobile?"wrap":"nowrap"}}>
                {splitCols(news,isMobile?1:2).map((col,ci)=>(
                  <div key={ci} style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:16}}>
                    {col.map((n,i)=><NewsCard key={`${ci}-${i}`} n={n}/>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KALENDER */}
          {tab==="calendar"&&(
            <div>
              <div style={{fontSize:14,color:C.textLow,marginBottom:18}}>Klick auf einen Tag → vollständige Tagesübersicht</div>
              <CalendarView/>
            </div>
          )}

          <div style={{marginTop:40,fontSize:12,color:C.textLow,textAlign:"center",lineHeight:2}}>
            Binance WebSocket · Yahoo Finance · Claude AI · keine Anlageberatung
          </div>
        </div>
      </div>
    </>
  );
}

function SLabel({children}){return <div style={{fontSize:13,color:C.textLow,letterSpacing:"0.07em",fontWeight:700,marginBottom:16,textTransform:"uppercase"}}>{children}</div>;}
