import React, { useState, useCallback, useEffect, useRef } from "react";
import AssetCard from "./components/AssetCard";
import TradeGroup from "./components/TradeCard";
import NewsCard from "./components/NewsCard";
import CalendarView from "./components/CalendarView";
import NewsTicker from "./components/NewsTicker";
import MacroTile, { MACRO_ASSETS } from "./components/MacroTile_v2";
import { ASSETS, TOTAL_MARKET_CAP_LINK } from "./data/assets";
import { TRADES as DEFAULT_TRADES } from "./data/trades";
import { NEWS_DEFAULT } from "./data/news";
import { C, FONT, RADIUS } from "./styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// APP v8 — "Mein Dashboard" · Trade Auto-Update Button · Total Market Cap
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
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=XAU&to=USD");
    const d = await r.json();
    return {
      gold:  {price:d?.rates?.USD??4036,chg24:null,chg7:null},
      silver:{price:57.00,chg24:-0.3,chg7:-3.2},
    };
  } catch {
    return {gold:{price:4036,chg24:+0.2,chg7:-5.1},silver:{price:57.00,chg24:-0.3,chg7:-3.2}};
  }
}

function fmtPrice(price,id) {
  if (!price && price!==0) return null;
  if (["btc","gold"].includes(id)) return Math.round(price).toLocaleString("de-DE");
  if (id==="eth") return Math.round(price).toLocaleString("de-DE");
  return price.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});
}

async function fetchAINews() {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-6",max_tokens:1500,
      tools:[{type:"web_search_20250305",name:"web_search"}],
      messages:[{role:"user",content:`Suche die wichtigsten aktuellen Krypto und Finanz-News. NUR JSON ohne Backticks.
JSON: {"news":[{"tag":"TAG","date":"heute","icon":"Emoji","title":"Titel","summary":"1-2 Sätze","full":"Analyse mit\\n\\n📌 Fachbegriffe:\\n• Begriff: Erklärung\\n\\n📈 Auswirkung:\\nText","impact":"bullisch oder bearisch oder neutral","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}`}],
    }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const raw = await res.json();
  const txt = raw.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Kein JSON");
  return JSON.parse(m[0]).news;
}

// ── TRADE AUTO-UPDATE VIA CLAUDE ─────────────────────────────────────────────
async function fetchAITrades(btcPrice, ethPrice, solPrice) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-6",max_tokens:2000,
      tools:[{type:"web_search_20250305",name:"web_search"}],
      messages:[{role:"user",content:`Analysiere den aktuellen Krypto-Markt und erstelle frische Trade-Setups.
Aktuelle Preise: BTC $${btcPrice}, ETH $${ethPrice}, SOL $${solPrice}

Suche im Web nach aktueller Marktlage BTC ETH SOL, wichtige Levels und Elliott Wave Analyse.

Antworte NUR mit JSON, kein anderer Text, keine Backticks:
{"timestamp":"HH:MM","trades":[{"asset":"Name","ticker":"X/USD","bias":"bull|neutral|bear","biasCol":"#2ecc71 oder #f0b429 oder #e74c3c","priority":"⭐ oder 💡 oder ⏸ oder ⛔ + Text","note":"Kurze Begründung","setups":[{"type":"long|short","label":"Timeframe: Setup-Beschreibung","tf":"1H · Scalp","wave":"Elliott-Kontext","entry":"Preis$","stop":"Preis$ (-X%)","t1":"Preis$ (+X%)","t2":"Preis$ (+X%)","crv":"1:X · 1:X","duration":"T1: Xh · T2: Xh","confluence":[["Signal","Wert ✅"]],"exec":"Ausführungshinweis","invalid":"Invalidierung","isBWave":false}]}]}`}],
    }),
  });
  if (!res.ok) throw new Error(`Claude Trades ${res.status}`);
  const raw = await res.json();
  const txt = raw.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Kein JSON");
  const d = JSON.parse(m[0]);
  if (!d.trades?.length) throw new Error("Keine Trades");
  return d;
}

function useIsMobile() {
  const [m,setM]=useState(window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

// ── LOGO KOMPONENTE ───────────────────────────────────────────────────────────
function DashboardLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      {/* Batman-Style Monogramm */}
      <div style={{
        width:44,height:44,
        background:"linear-gradient(135deg,#f0b429,#d4920a)",
        borderRadius:8,
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 4px 16px rgba(240,180,41,0.35)",
        flexShrink:0,
      }}>
        <span style={{
          fontFamily:"Georgia,serif",fontSize:22,fontWeight:900,
          color:C.bg,letterSpacing:"-0.02em",lineHeight:1,
        }}>M</span>
      </div>
      <div>
        <div style={{
          fontFamily:"Georgia,serif",
          fontSize:26,fontWeight:700,
          color:C.textHi,letterSpacing:"0.08em",
          textTransform:"uppercase",lineHeight:1,
        }}>
          MEIN <span style={{color:C.gold,letterSpacing:"0.12em"}}>DASHBOARD</span>
        </div>
        <div style={{fontSize:11,color:C.textLow,marginTop:3,letterSpacing:"0.04em"}}>
          Elliott-Wave · Live Markets · AI Analysis
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [tab,setTab]=useState("markets");
  const [news,setNews]=useState(NEWS_DEFAULT);
  const [trades,setTrades]=useState(DEFAULT_TRADES);
  const [tradeTimestamp,setTradeTimestamp]=useState(null);
  const [cryptoPrices,setCryptoPrices]=useState(null);
  const [metalPrices,setMetalPrices]=useState(null);
  const [lastFetch,setLastFetch]=useState(null);
  const [priceErr,setPriceErr]=useState(null);
  const [newsLoading,setNewsLoading]=useState(false);
  const [newsUpd,setNewsUpd]=useState(null);
  const [tradeLoading,setTradeLoading]=useState(false);
  const [tradeErr,setTradeErr]=useState(null);

  const loadPrices = useCallback(async () => {
    try {
      const [c,m] = await Promise.allSettled([fetchCryptoPrices(),fetchMetalPrices()]);
      if (c.status==="fulfilled") setCryptoPrices(c.value);
      if (m.status==="fulfilled") setMetalPrices(m.value);
      setLastFetch(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
      setPriceErr(null);
    } catch(e) { setPriceErr(e.message); }
  },[]);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const n = await fetchAINews();
      if (n?.length) setNews(n);
      setNewsUpd(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"}));
    } catch {}
    finally { setNewsLoading(false); }
  },[]);

  // ── Trade Update Button Handler ────────────────────────────────────────────
  const updateTrades = useCallback(async () => {
    if (tradeLoading) return;
    setTradeLoading(true); setTradeErr(null);
    try {
      const btc = Math.round(cryptoPrices?.btc?.price||60000);
      const eth = Math.round(cryptoPrices?.eth?.price||1500);
      const sol = (cryptoPrices?.sol?.price||70).toFixed(2);
      const result = await fetchAITrades(btc, eth, sol);
      if (result.trades?.length) {
        setTrades(result.trades);
        setTradeTimestamp(result.timestamp || new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"}));
      }
    } catch(e) {
      setTradeErr("Update fehlgeschlagen — statische Trades aktiv");
      console.error(e);
    } finally { setTradeLoading(false); }
  },[cryptoPrices,tradeLoading]);

  useEffect(()=>{ loadPrices(); const iv=setInterval(loadPrices,30000); return()=>clearInterval(iv); },[loadPrices]);
  useEffect(()=>{ loadNews(); const iv=setInterval(loadNews,2*60*60*1000); return()=>clearInterval(iv); },[loadNews]);

  const liveAssets = ASSETS.map(a => {
    const all = {...cryptoPrices,...metalPrices};
    if (all[a.id]) {
      const l = all[a.id];
      return {...a,price:fmtPrice(l.price,a.id)||a.price,chg24:l.chg24!==null?parseFloat((l.chg24??0).toFixed(1)):a.chg24,chg7:l.chg7!==null?parseFloat((l.chg7??0).toFixed(1)):a.chg7};
    }
    return a;
  });

  const TABS=[["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.textHi,fontFamily:FONT.sans}}>
      <div style={{maxWidth:1500,margin:"0 auto",padding:isMobile?"14px 14px 60px":"28px 50px 60px"}}>

        {/* HEADER */}
        <header style={{borderBottom:`1px solid ${C.border}`,paddingBottom:18,marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <DashboardLogo/>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              {/* Live Status */}
              {lastFetch && (
                <div style={{fontSize:12,color:C.textLow,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:C.bull}}>●</span> {lastFetch} · 30s
                  {newsUpd&&<span style={{marginLeft:8}}>· 🤖 {newsUpd}</span>}
                </div>
              )}
              {/* Total Market Cap Link */}
              <a href={TOTAL_MARKET_CAP_LINK} target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:5,background:C.surface,border:`1px solid ${C.blue}44`,borderRadius:RADIUS.md,padding:"9px 14px",color:C.blue,fontSize:12,fontWeight:700,textDecoration:"none"}}>
                🌐 {isMobile?"TOTAL":"Total Market"}
              </a>
              <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:6,background:C.surface,border:`1px solid ${C.purple}55`,borderRadius:RADIUS.md,padding:"9px 14px",color:C.purple,fontSize:12,fontWeight:700,textDecoration:"none"}}>
                🔗 {isMobile?"MCO":"MCO Terminal"}
              </a>
              <button onClick={loadNews} disabled={newsLoading}
                style={{background:C.surface,border:`1px solid ${C.gold}`,borderRadius:RADIUS.md,padding:"9px 14px",color:newsLoading?C.textLow:C.gold,fontSize:12,fontWeight:700,cursor:newsLoading?"wait":"pointer",display:"flex",alignItems:"center",gap:6}}>
                <span style={{animation:newsLoading?"spin 0.8s linear infinite":"none",display:"inline-block"}}>{newsLoading?"⟳":"🤖"}</span>
                {isMobile?"":"News"}
              </button>
            </div>
          </div>
          {priceErr&&<div style={{marginTop:8,padding:"6px 12px",background:"#160606",border:`1px solid ${C.bear}44`,borderRadius:RADIUS.sm,fontSize:11,color:C.bear}}>⚠️ {priceErr}</div>}
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </header>

        <NewsTicker isMobile={isMobile}/>

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
              <SLabel>KRYPTO — 7 Tage · Detail: Kurzfristig · Langfristig · TV-Charts</SLabel>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                {liveAssets.filter(a=>["sol","btc","eth"].includes(a.id)).map(a=><AssetCard key={a.id} a={a}/>)}
              </div>
            </div>
            <div>
              <SLabel>ROHSTOFFE — Detail: 7 Tage · Weekly 6 Monate · TV-Charts</SLabel>
              <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:28}}>
                {liveAssets.filter(a=>["gold","silver"].includes(a.id)).map(a=><AssetCard key={a.id} a={a}/>)}
              </div>
              <SLabel>MAKRO — 7-Tage Chart · Analyse · TradingView</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {MACRO_ASSETS.map(m=><MacroTile key={m.n} m={m}/>)}
              </div>
            </div>
          </div>
        )}

        {/* TRADES */}
        {tab==="trades"&&(
          <div>
            {/* Update Panel */}
            <div style={{
              background:C.surface,border:`1px solid ${C.gold}44`,
              borderRadius:RADIUS.md,padding:"18px 22px",marginBottom:22,
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{fontSize:16,color:C.textHi,fontWeight:700,marginBottom:6}}>
                    〰️ Elliott-Wave Trade-Setups
                    {tradeTimestamp&&<span style={{fontSize:13,color:C.bull,fontWeight:400,marginLeft:12}}>✓ Claude Update: {tradeTimestamp}</span>}
                  </div>
                  <div style={{fontSize:13,color:C.textMid}}>
                    Klick auf <strong style={{color:C.gold}}>「〰️ Übergeordnete Struktur」</strong> für Weekly-Chart + Wellen-Vorschau.
                    {tradeLoading&&<span style={{color:C.gold,marginLeft:8}}>〰️ Claude analysiert Markt...</span>}
                    {tradeErr&&<span style={{color:C.bear,marginLeft:8}}>⚠️ {tradeErr}</span>}
                  </div>
                </div>
                {/* Trade Update Button — direkt im Dashboard */}
                <button
                  onClick={updateTrades}
                  disabled={tradeLoading}
                  style={{
                    background:tradeLoading?"#1a1a00":C.gold,
                    color:tradeLoading?C.textLow:C.bg,
                    border:"none",borderRadius:RADIUS.md,
                    padding:"12px 22px",fontSize:14,fontWeight:800,
                    cursor:tradeLoading?"wait":"pointer",
                    display:"flex",alignItems:"center",gap:8,
                    flexShrink:0,transition:"all 0.15s",
                    letterSpacing:"0.02em",
                    boxShadow:tradeLoading?"none":`0 4px 16px rgba(240,180,41,0.3)`,
                  }}
                  onMouseEnter={e=>{if(!tradeLoading)e.currentTarget.style.background="#d4920a";}}
                  onMouseLeave={e=>{if(!tradeLoading)e.currentTarget.style.background=C.gold;}}
                >
                  <span style={{fontSize:16,display:"inline-block",animation:tradeLoading?"spin 0.8s linear infinite":"none"}}>
                    {tradeLoading?"⟳":"🤖"}
                  </span>
                  {tradeLoading?"Analysiere...":"Trades jetzt updaten"}
                </button>
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
              <div style={{fontSize:14,color:C.textLow}}>Klick → vollständige Analyse + Fachbegriff-Erklärungen · Auto alle 2h</div>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {newsUpd&&<span style={{fontSize:12,color:C.bull}}>🤖 {newsUpd}</span>}
                <button onClick={loadNews} disabled={newsLoading} style={{background:C.surface,border:`1px solid ${C.gold}44`,borderRadius:RADIUS.sm,padding:"8px 16px",color:C.gold,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  {newsLoading?"⟳ Lädt...":"🔄 Jetzt updaten"}
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
              Klick auf einen Tag → vollständige Tagesübersicht mit Events und BTC/ETH-Impact
            </div>
            <CalendarView/>
          </div>
        )}

        <div style={{marginTop:40,fontSize:12,color:C.textLow,textAlign:"center",lineHeight:2}}>
          CoinGecko Live-Preise · Claude AI News · Elliott-Wave · keine Anlageberatung
        </div>
      </div>
    </div>
  );
}

function SLabel({children}) {
  return <div style={{fontSize:13,color:C.textLow,letterSpacing:"0.07em",fontWeight:700,marginBottom:16,textTransform:"uppercase"}}>{children}</div>;
}
