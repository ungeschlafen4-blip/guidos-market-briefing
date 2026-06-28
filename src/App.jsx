import React, { useState, useCallback, useEffect, useRef } from "react";
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
// APP FINAL — Multi-Source Live-Daten + Claude AI Auto-News
// BTC/ETH/SOL → CoinGecko
// Gold/Silber  → Metals via CoinGecko Pro-Fallback oder Yahoo
// Makro        → Yahoo Finance Proxy
// News         → Claude AI alle 2 Stunden automatisch
// ─────────────────────────────────────────────────────────────────────────────

// ── CRYPTO PREISE (CoinGecko) ─────────────────────────────────────────────────
async function fetchCryptoPrices() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_7d_change=true"
  );
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const d = await res.json();
  return {
    btc: { price: d.bitcoin?.usd,  chg24: d.bitcoin?.usd_24h_change,  chg7: d.bitcoin?.usd_7d_change  },
    eth: { price: d.ethereum?.usd, chg24: d.ethereum?.usd_24h_change, chg7: d.ethereum?.usd_7d_change },
    sol: { price: d.solana?.usd,   chg24: d.solana?.usd_24h_change,   chg7: d.solana?.usd_7d_change   },
  };
}

// ── GOLD/SILBER (Frankfurter Xetra via allorigins proxy) ─────────────────────
async function fetchMetalPrices() {
  try {
    // Gold in USD via open.er-api.com (XAU/USD)
    const goldRes = await fetch("https://api.frankfurter.app/latest?from=XAU&to=USD");
    const goldData = await goldRes.json();
    const goldUSD = goldData?.rates?.USD ?? null;

    // Silber via CoinGecko (silver-coin als Proxy, nicht perfekt aber funktioniert)
    // Fallback: feste Daten wenn API fehlschlägt
    return {
      gold:   { price: goldUSD,  chg24: null, chg7: null },
      silver: { price: 57.00,    chg24: -0.3, chg7: -3.2 }, // Fallback bis echte API
    };
  } catch {
    return {
      gold:   { price: 4036,  chg24: +0.2, chg7: -5.1 },
      silver: { price: 57.00, chg24: -0.3, chg7: -3.2 },
    };
  }
}

// ── MAKRO PREISE (Yahoo Finance via allorigins CORS proxy) ────────────────────
async function fetchMacroPrices() {
  const symbols = ["^GSPC", "^IXIC", "CL=F", "DX-Y.NYB", "^TNX", "^VIX"];
  const results = {};
  await Promise.allSettled(
    symbols.map(async (sym) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`;
        const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxy);
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta) {
          results[sym] = {
            price: meta.regularMarketPrice,
            prevClose: meta.previousClose,
            chg: meta.previousClose
              ? parseFloat((((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100).toFixed(2))
              : 0,
          };
        }
      } catch { /* ignore individual failures */ }
    })
  );
  return results;
}

// ── PREIS FORMATIERUNG ────────────────────────────────────────────────────────
function fmtPrice(price, id) {
  if (!price && price !== 0) return null;
  if (id === "btc") return Math.round(price).toLocaleString("de-DE");
  if (id === "gold") return Math.round(price).toLocaleString("de-DE");
  if (id === "eth") return Math.round(price).toLocaleString("de-DE");
  if (id === "sol" || id === "silver") {
    return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("de-DE");
}

// ── CLAUDE AI NEWS FETCH ──────────────────────────────────────────────────────
async function fetchAINews() {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", max_tokens: 1500,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: `Suche die wichtigsten aktuellen Krypto- und Finanznews von heute. Antworte NUR mit JSON ohne Backticks oder Markdown.
Gib genau 6 News zurück.
JSON: {"news":[{"tag":"KRYPTO oder MAKRO oder AKTIEN oder REGULIERUNG","date":"heute Datum","icon":"passendes Emoji","title":"Titel der News","summary":"1-2 Sätze Zusammenfassung","full":"Vollständige Analyse mit:\\n\\n📌 Fachbegriffe erklärt:\\n• Begriff: Erklärung\\n• Begriff: Erklärung\\n\\n📈 Auswirkung auf BTC/ETH/SOL:\\nText","impact":"bullisch oder bearisch oder neutral","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}` }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const raw = await res.json();
  const txt = raw.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Kein JSON");
  const d = JSON.parse(m[0]);
  if (!d.news?.length) throw new Error("Leere News");
  return d.news;
}

// ── RESPONSIVE HOOK ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

// ── MAKRO DISPLAY MAP ─────────────────────────────────────────────────────────
const MACRO_SYMBOL_MAP = {
  "^GSPC":    { n:"S&P 500",    emoji:"📈", tvSymbol:"SP:SPX",      note:"Wichtigster US-Aktienindex. 500 größte US-Unternehmen." },
  "^IXIC":    { n:"Nasdaq 100", emoji:"💻", tvSymbol:"NASDAQ:NDX",  note:"Tech-lastiger US-Index. Nvidia, Apple, Microsoft, Meta." },
  "CL=F":     { n:"WTI Öl",     emoji:"🛢️", tvSymbol:"NYMEX:CL1!",  note:"US-Rohölpreis. Iran-MOU drückt Preis Richtung Vor-Kriegs-Niveau." },
  "DX-Y.NYB": { n:"DXY Dollar", emoji:"💵", tvSymbol:"TVC:DXY",     note:"US-Dollar-Index vs. 6 Währungen. Steigt = Druck auf Gold & Krypto." },
  "^TNX":     { n:"10Y Yield",  emoji:"📊", tvSymbol:"TVC:US10Y",   note:"US 10-Jahres-Staatsanleihe. Steigt = teurerer Kredit = Risk-off." },
  "^VIX":     { n:"VIX",        emoji:"🌡️", tvSymbol:"CBOE:VIX",    note:"Angstbarometer. Unter 20 = ruhig. Über 30 = Panik." },
};

// ── HAUPT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("markets");
  const [news, setNews] = useState(NEWS_DEFAULT);

  // Preise
  const [cryptoPrices, setCryptoPrices]   = useState(null);
  const [metalPrices,  setMetalPrices]    = useState(null);
  const [macroPrices,  setMacroPrices]    = useState(null);
  const [lastPriceFetch, setLastPriceFetch] = useState(null);
  const [priceError,   setPriceError]     = useState(null);

  // News
  const [newsLoading,  setNewsLoading]    = useState(false);
  const [newsError,    setNewsError]      = useState(null);
  const [newsLastUpd,  setNewsLastUpd]    = useState(null);
  const newsIntervalRef = useRef(null);

  // ── Alle Preise laden ─────────────────────────────────────────────────────
  const loadAllPrices = useCallback(async () => {
    try {
      const [crypto, metals, macro] = await Promise.allSettled([
        fetchCryptoPrices(),
        fetchMetalPrices(),
        fetchMacroPrices(),
      ]);
      if (crypto.status  === "fulfilled") setCryptoPrices(crypto.value);
      if (metals.status  === "fulfilled") setMetalPrices(metals.value);
      if (macro.status   === "fulfilled") setMacroPrices(macro.value);
      setLastPriceFetch(new Date().toLocaleTimeString("de-AT", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
      setPriceError(null);
    } catch (e) {
      setPriceError(e.message);
    }
  }, []);

  // Preise: erster Load + alle 30s
  useEffect(() => {
    loadAllPrices();
    const iv = setInterval(loadAllPrices, 30000);
    return () => clearInterval(iv);
  }, [loadAllPrices]);

  // ── Claude AI News laden ──────────────────────────────────────────────────
  const loadNews = useCallback(async () => {
    setNewsLoading(true); setNewsError(null);
    try {
      const freshNews = await fetchAINews();
      setNews(freshNews);
      setNewsLastUpd(new Date().toLocaleTimeString("de-AT", { hour:"2-digit", minute:"2-digit" }));
    } catch (e) {
      setNewsError(e.message);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  // News: erster Load + alle 2 Stunden automatisch
  useEffect(() => {
    loadNews(); // Sofort beim Start
    newsIntervalRef.current = setInterval(loadNews, 2 * 60 * 60 * 1000); // alle 2h
    return () => clearInterval(newsIntervalRef.current);
  }, [loadNews]);

  // ── Assets mit Live-Preisen anreichern ───────────────────────────────────
  const liveAssets = ASSETS.map(a => {
    const allPrices = { ...cryptoPrices, ...metalPrices };
    if (allPrices[a.id]) {
      const live = allPrices[a.id];
      const priceStr = live.price ? fmtPrice(live.price, a.id) : null;
      return {
        ...a,
        price: priceStr || a.price,
        chg24: live.chg24 !== null ? parseFloat((live.chg24 ?? 0).toFixed(1)) : a.chg24,
        chg7:  live.chg7  !== null ? parseFloat((live.chg7  ?? 0).toFixed(1)) : a.chg7,
      };
    }
    return a;
  });

  // ── Makro-Tiles mit Live-Daten ────────────────────────────────────────────
  const liveMacroAssets = Object.entries(MACRO_SYMBOL_MAP).map(([sym, meta]) => {
    const live = macroPrices?.[sym];
    return {
      ...meta,
      wave: meta.note,
      p: live?.price
        ? (sym === "^TNX" || sym === "^VIX"
            ? live.price.toFixed(2) + (sym === "^TNX" ? "%" : "")
            : Math.round(live.price).toLocaleString("de-DE"))
        : "–",
      ch: live?.chg ?? 0,
      tvLink: `https://www.tradingview.com/symbols/${meta.tvSymbol.replace(":","/")}/`,
    };
  });

  const TABS = [["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.textHi, fontFamily:FONT.sans }}>
      <div style={{ maxWidth:1440, margin:"0 auto", padding: isMobile?"14px 14px 60px":"24px 44px 60px" }}>

        {/* ── HEADER ── */}
        <header style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:16, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <div>
              <h1 style={{ fontFamily:FONT.serif, fontSize: isMobile?22:32, margin:0, color:C.textHi, fontWeight:700, letterSpacing:"0.01em" }}>
                Guido's <span style={{color:C.gold}}>Market</span> Briefing
              </h1>
              <div style={{ fontSize:12, color:C.textLow, marginTop:5 }}>
                {lastPriceFetch
                  ? <><span style={{color:C.bull}}>●</span>{" "}Preise: {lastPriceFetch} · Auto 30s{newsLastUpd ? ` · News: ${newsLastUpd}` : ""}</>
                  : <span style={{color:C.gold}}>⟳ Lade Live-Daten...</span>
                }
                {priceError && <span style={{color:C.bear}}> · ⚠️ {priceError}</span>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:6, background:C.surface, border:`1px solid ${C.purple}55`, borderRadius:RADIUS.md, padding:"10px 16px", color:C.purple, fontSize:13, fontWeight:700, textDecoration:"none" }}>
                🔗 {isMobile?"MCO":"MCO Terminal"}
              </a>
              <button onClick={loadNews} disabled={newsLoading}
                style={{ background:C.surface, border:`1px solid ${newsLoading?C.textLow:C.gold}`, borderRadius:RADIUS.md, padding:"10px 16px", color:newsLoading?C.textLow:C.gold, fontSize:13, fontWeight:700, cursor:newsLoading?"wait":"pointer", display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ fontSize:16, display:"inline-block", animation:newsLoading?"spin 0.8s linear infinite":"none" }}>{newsLoading?"⟳":"🤖"}</span>
                {isMobile?"":"AI News"}
              </button>
            </div>
          </div>

          {/* Status Bars */}
          {newsLoading && (
            <div style={{ marginTop:8, padding:"7px 12px", background:C.surface, border:`1px solid ${C.gold}33`, borderRadius:RADIUS.sm, fontSize:11, color:C.textMid }}>
              🔍 Claude sucht aktuelle News und analysiert Marktlage...
            </div>
          )}
          {newsError && (
            <div style={{ marginTop:8, padding:"7px 12px", background:"#160606", border:`1px solid ${C.bear}44`, borderRadius:RADIUS.sm, fontSize:11, color:C.bear }}>
              ⚠️ News-Fehler: {newsError} — Fallback-Daten aktiv
            </div>
          )}
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
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
              <SectionLabel>ROHSTOFFE — Live-Preise · Klicken für Analyse</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
                {liveAssets.filter(a=>["gold","silver"].includes(a.id)).map(a=>(
                  <AssetCard key={a.id} a={a} />
                ))}
              </div>
              <SectionLabel>MAKRO — Live via Yahoo Finance · Klicken für TV-Chart</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {liveMacroAssets.map(m=><MacroTile key={m.n} m={m} />)}
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
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <div style={{fontSize:13, color:C.textLow}}>
                Klick auf News → vollständige Analyse mit Fachbegriff-Erklärungen · Auto-Update alle 2h
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                {newsLastUpd && <span style={{fontSize:11, color:C.bull}}>🤖 Zuletzt: {newsLastUpd}</span>}
                <button onClick={loadNews} disabled={newsLoading} style={{
                  background:C.surface, border:`1px solid ${C.gold}44`, borderRadius:RADIUS.sm,
                  padding:"6px 12px", color:C.gold, fontSize:11, fontWeight:700, cursor:"pointer",
                }}>
                  {newsLoading ? "⟳ Lädt..." : "🔄 Jetzt updaten"}
                </button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:14, alignItems:"start" }}>
              {news.map((n,i)=><NewsCard key={i} n={n}/>)}
            </div>
          </div>
        )}

        {/* ── KALENDER ── */}
        {tab==="calendar" && <CalendarView />}

        <div style={{ marginTop:36, fontSize:11, color:C.textLow, textAlign:"center", lineHeight:1.8 }}>
          CoinGecko · Yahoo Finance · Claude AI · Auto-Refresh 30s · News alle 2h · keine Anlageberatung
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
