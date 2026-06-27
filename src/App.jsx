import React, { useState, useCallback } from "react";
import {
  LineChart, Line, ResponsiveContainer, YAxis, XAxis,
  Tooltip, CartesianGrid, ReferenceDot, ReferenceLine
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// GUIDO'S MARKET BRIEFING — FINAL
// Features: Live-Refresh · 4H+Daily Charts · Trades 1H/2H · Kalender · MCO Terminal
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:"#08090d", surface:"#111318", card:"#15171e",
  border:"#1e2129", borderHi:"#2a2f3e",
  bull:"#3ddc84", bear:"#ff4d6d", gold:"#f0b429", blue:"#5b9cf6",
  textHi:"#f0ede6", textMid:"#9aa0b4", textLow:"#4e5568",
};

// ── STATISCHE SNAPSHOT-DATEN (werden per Live-Refresh überschrieben) ──────────
const SNAPSHOT_DEFAULT = {
  time: "27. Juni 2026 · ~14:00 MESZ · Snapshot",
  signals: [
    { id:"btc",   label:"BTC",   price:"60.254", chg24:+0.3,  bias:"neutral" },
    { id:"eth",   label:"ETH",   price:"1.588",  chg24:+1.0,  bias:"bear"    },
    { id:"sol",   label:"SOL",   price:"72,22",  chg24:+2.7,  bias:"bull"    },
    { id:"gold",  label:"XAU",   price:"4.036",  chg24:+0.2,  bias:"neutral" },
    { id:"makro", label:"MAKRO", price:"",       chg24:null,  bias:"neutral" },
  ],
};

// ── 4H-PFADE (Do–Sa, letzte 3 Tage) ─────────────────────────────────────────
const BTC_4H = [
  {t:"Do 12h",p:60400},{t:"Do 16h",p:58700},{t:"Do 20h",p:58189},
  {t:"Fr 00h",p:59100},{t:"Fr 08h",p:60200},{t:"Fr 16h",p:60100},
  {t:"Sa 00h",p:60400},{t:"Sa 08h",p:60254},{t:"jetzt",p:60254},
];
const ETH_4H = [
  {t:"Do 12h",p:1580},{t:"Do 16h",p:1555},{t:"Do 20h",p:1542},
  {t:"Fr 00h",p:1558},{t:"Fr 08h",p:1568},{t:"Fr 16h",p:1572},
  {t:"Sa 00h",p:1588},{t:"Sa 08h",p:1588},{t:"jetzt",p:1588},
];
const SOL_4H = [
  {t:"Do 12h",p:65.2},{t:"Do 16h",p:65.0},{t:"Do 20h",p:64.8},
  {t:"Fr 00h",p:66.0},{t:"Fr 08h",p:70.2},{t:"Fr 16h",p:72.0},
  {t:"Sa 00h",p:72.4},{t:"Sa 08h",p:72.2},{t:"jetzt",p:72.22},
];
const GOLD_4H = [
  {t:"Do 08h",p:3978},{t:"Do 12h",p:4010},{t:"Do 16h",p:4025},
  {t:"Do 20h",p:4028},{t:"Fr 00h",p:4035},{t:"Fr 08h",p:4036},
  {t:"Fr 16h",p:4030},{t:"Sa 00h",p:4036},{t:"jetzt",p:4036},
];

// ── DAILY 6-MONATS-PFADE ──────────────────────────────────────────────────────
const BTC_D = [
  {t:"Jan",p:98000},{t:"",p:126080},{t:"Feb",p:104000},{t:"",p:85000},
  {t:"Mär",p:77623},{t:"",p:65076},{t:"Apr",p:62000},{t:"",p:58189},{t:"jetzt",p:60254},
];
const ETH_D = [
  {t:"Jan",p:3680},{t:"Feb",p:2840},{t:"",p:1920},{t:"Mär",p:1810},
  {t:"",p:1665},{t:"Apr",p:1620},{t:"",p:1542},{t:"jetzt",p:1588},
];
const SOL_D = [
  {t:"Jan",p:198},{t:"Feb",p:235},{t:"",p:128},{t:"Mär",p:88},
  {t:"",p:74.5},{t:"Apr",p:68},{t:"",p:64.8},{t:"jetzt",p:72.22},
];
const GOLD_D = [
  {t:"Jan",p:3800},{t:"",p:5200},{t:"Feb",p:4900},{t:"",p:4200},
  {t:"Mär",p:4100},{t:"",p:4250},{t:"Apr",p:4400},{t:"",p:3978},{t:"jetzt",p:4036},
];
const SILVER_D = [
  {t:"Jan",p:72},{t:"",p:121},{t:"Feb",p:105},{t:"",p:85},
  {t:"Mär",p:75},{t:"",p:65},{t:"Apr",p:62},{t:"",p:57},{t:"jetzt",p:57},
];

// ── ASSET-DEFINITIONEN ────────────────────────────────────────────────────────
const ASSETS = [
  {
    id:"btc", name:"Bitcoin", ticker:"BTC/USD", unit:"$",
    price:"60.254", chg24:+0.3, chg7:-5.4, bias:"neutral",
    path4h:BTC_4H, pathD:BTC_D,
    levels:[
      {v:63430,col:C.bear,lbl:"Fib 61,8%"},{v:62366,col:C.gold,lbl:"Fib 50%"},
      {v:61000,col:C.gold,lbl:"Fib 38,2%"},{v:60170,col:C.bear,lbl:"Sell-Wall"},
      {v:57400,col:C.blue,lbl:"Box-Ziel"},
    ],
    wave4h:"4H: Bounce in (4)/B-Welle — Fib-Widerstand $61–63K entscheidend ⚠️\nDeine Wellenzählung (TradingView): Bounce im Fib-Band 38,2–61,8% ($61.000–$63.430). Sell-Walls $60.170–$61.200 decken sich mit Fib 38,2%. Zielzone wenn Bounce scheitert: $55.400–$57.400 (blaue Box). Bullisch erst bei 1H-Schlusskurs über $63.430.",
    waveD:"Übergeordnete (A)-(B)-(C)-Korrektur nach ATH $126.080 (Feb). 200WMA $62.457 gebrochen. Historisch: 2018 = 9 Monate darunter, 2022 = 6 Quartale. Zyklusboden-Erwartung: Oktober 2026.",
    tv:"https://www.tradingview.com/chart/G1bYW1gV/",
  },
  {
    id:"eth", name:"Ethereum", ticker:"ETH/USD", unit:"$",
    price:"1.588", chg24:+1.0, chg7:-8.2, bias:"bear",
    path4h:ETH_4H, pathD:ETH_D,
    levels:[
      {v:1620,col:C.bear,lbl:"Widerstand"},{v:1542,col:C.blue,lbl:"Tief"},
      {v:1500,col:C.bull,lbl:"Support"},
    ],
    wave4h:"4H: Schwacher Bounce ohne Impuls — strukturell bearish ⚠️\nETH Tief $1.542 (Do.). Bounce auf $1.588 mit niedrigem Volumen — korrektiv. BitMine-Russell-Inclusion ohne Kursimpakt. Relative Schwäche: -8,2% 7D vs. BTC -5,4%. Widerstand $1.620.",
    waveD:"-57% vom Jan-Hoch $3.680. Foundation: -40% Budget, -20% Personal, 9 Senior-Departures. Morgan Stanley MSSE ETF (Staking, 0,14%) wartet auf SEC.",
    tv:"https://www.tradingview.com/chart/UBrQvmXY/",
  },
  {
    id:"sol", name:"Solana", ticker:"SOL/USD", unit:"$",
    price:"72,22", chg24:+2.7, chg7:+0.5, bias:"bull",
    path4h:SOL_4H, pathD:SOL_D,
    levels:[
      {v:74.5,col:C.bear,lbl:"Widerstand"},{v:70.0,col:C.bull,lbl:"Support"},
      {v:64.8,col:C.blue,lbl:"W5-Tief"},
    ],
    wave4h:"4H: 5-Wellen-Ende $64,80 — impulsiver Bounce +12% 🟢\n5 klare Abwärtswellen Do. auf $64,80. Dann Impuls-Bounce mit höherem Volumen als Abwärts-Move — echtes Reversal-Signal. Höhere Highs + Highere Lows. Für Einstieg: Pullback auf $70–71 abwarten.",
    waveD:"SOL stärkster Major: +0,5% 7D vs. Markt -5%. ATH $235 → Tief $64,80 (-72%). Sauberste 5-Wellen-Abwärtsbewegung. Bloomberg: 95% ETF-Approval. KG Group + Toss Bank + Forward Industries (6,9 Mio. SOL).",
    tv:"https://www.tradingview.com/chart/PnJ5DSTK/",
  },
  {
    id:"gold", name:"Gold", ticker:"XAU/USD", unit:"$",
    price:"4.036", chg24:+0.2, chg7:-5.1, bias:"neutral",
    path4h:GOLD_4H, pathD:GOLD_D,
    levels:[
      {v:4100,col:C.bear,lbl:"200WMA"},{v:4000,col:C.bull,lbl:"Support"},
      {v:3820,col:C.blue,lbl:"Fib 38,2%"},
    ],
    wave4h:"4H: PCE-Erholungs-Bounce — strukturell noch bearish ⚠️\nNach PCE (Kern +3,4% wie erwartet) Erholung von $3.978 auf $4.036. Widerstand: $4.100 (200WMA). Sep-Hike 63%, Dez 80%. Iran-MOU = Geopolitik-Prämie weg.",
    waveD:"-22% vom ATH ~$5.200 (Feb). Goldman Jahres-Ziel: $4.900. Zentralbanken: Rekord-Goldkäufe. Ölpreis -40% vom Kriegspeak → CPI-Entlastung → hilft Fed-Pivot ab CPI 14.7.",
    tv:"https://www.tradingview.com/chart/mmdbJB1E/",
  },
  {
    id:"silver", name:"Silber", ticker:"XAG/USD", unit:"$",
    price:"57,00", chg24:-0.3, chg7:-3.2, bias:"neutral",
    path4h:null, pathD:SILVER_D,
    levels:[{v:60,col:C.bear,lbl:"Widerstand"},{v:55,col:C.bull,lbl:"Support"}],
    wave4h:"Silber: -53% vom ATH $121,62 (Jan). 6. globales Angebotsdefizit strukturell bullisch. Doppelbelastung: Fed-Druck + industrielle Nachfragesorgen.",
    waveD:"Strukturell: 6 Jahre Angebotsdefizit. Langfristig bullisch sobald Fed-Pivot sichtbar wird. Kurzfristig: Dollar-Druck dominiert.",
    tv:"https://www.tradingview.com/chart/AlIePYyu/",
  },
];

// ── TRADE SETUPS ──────────────────────────────────────────────────────────────
const TRADES = [
  {
    asset:"Solana", ticker:"SOL/USD", bias:"bull", biasCol:C.bull,
    priority:"⭐ PRIORISIERT",
    note:"Sauberste Struktur · stärkste rel. Performance · beide Horizonte",
    setups:[
      {
        type:"long", label:"1H: Pullback $70–71 → Welle 1 des neuen Impulses",
        tf:"1H · Scalp", wave:"Post-5W-Reversal: Erste Korrektur auf Support",
        entry:"70,00–71,20$", stop:"68,80$ (−2,0%)", t1:"73,50$ (+3,6%)", t2:"76,00$ (+7,0%)",
        crv:"1:1,8 (T1) · 1:3,5 (T2)", duration:"T1: 4–12h · T2: 24–48h",
        confluence:[
          ["Elliott","Welle 1 nach 5W-Abschluss ✅"],
          ["Volume","Bounce-Vol > Abwärts-Vol ✅"],
          ["Rel. Stärke","+0,5% 7D vs. Markt −5% ✅"],
          ["Fib 61,8%","~$70,80 aus Do-Tief ✅"],
          ["ETF","95% Approval Bloomberg ✅"],
        ],
        exec:"Kein Entry jetzt bei $72. Auf Pullback warten. Signal: 1H-Bullish-Kerze bei $70,5+.",
        invalid:"Tagesschluss unter $68,80.",
        isBWave:false,
      },
      {
        type:"long", label:"2H: Breakout über $74,50 → Welle 3 Anfang",
        tf:"2H · Intraday", wave:"Welle 3 (stärkstes Segment des neuen Impulses)",
        entry:"74,60–75,00$ (2H-Schluss über $74,50)", stop:"72,50$ (−2,8%)",
        t1:"79,00$ (+5,2%)", t2:"83,50$ (+11,4%)",
        crv:"1:1,9 (T1) · 1:4,1 (T2)", duration:"T1: 6–16h · T2: 48–72h",
        confluence:[
          ["Elliott","Welle 3 — typisch stärkstes Segment ✅"],
          ["Breakout","$74,50 = Jun-Hoch Widerstand ✅"],
          ["Struktur","Höheres Hoch + Höheres Tief ✅"],
        ],
        exec:"Erst nach 2H-Schlusskurs über $74,50. Nicht antizipieren.",
        invalid:"2H-Schluss unter $72,50.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Bitcoin", ticker:"BTC/USD", bias:"neutral", biasCol:C.gold,
    priority:"⏸ ABWARTEN — deine Fib-Levels",
    note:"Basierend auf deiner TradingView-Wellenzählung (Screenshot 27.6.)",
    setups:[
      {
        type:"short", label:"1H: Sell bei Fib 38,2%–50% ($61–62,4K) — Bounce scheitert",
        tf:"1H · Scalp", wave:"B/4-Wellen-Ende nach deiner Zählung",
        entry:"61.000–62.400$ (1H-Bearish-Kerze abwarten)",
        stop:"63.200$ (über Fib 61,8%)", t1:"59.000$ (−3,3%)", t2:"57.400$ (−5,9%)",
        crv:"1:1,6 (T1) · 1:2,5 (T2)", duration:"T1: 4–12h · T2: 24–48h",
        confluence:[
          ["Fib 38,2%","~$61.000 (dein Chart) ✅"],
          ["Fib 50%","~$62.366 (dein Chart) ✅"],
          ["Sell-Wall","$60.170–$61.200 Whale OB ✅"],
          ["Volume","Bounce-Vol < Abwärts-Vol ✅"],
        ],
        exec:"Warte auf 1H-Bearish-Ablehnung in der Fib-Zone. Kein Entry darunter.",
        invalid:"1H-Schluss über $63.430 (dein Fib 61,8%).",
        isBWave:true,
      },
      {
        type:"long", label:"1H: Breakout über $63.430 (Fib 61,8%) → (4) abgeschlossen",
        tf:"1H · Intraday", wave:"Alternative: (4) fertig → (5) aufwärts",
        entry:"63.500–64.000$ (1H-Schluss über Fib 61,8%)",
        stop:"62.000$", t1:"66.960$ (+4,7%)", t2:"69.961$ (+9,8%)",
        crv:"1:2,1 (T1) · 1:4,0 (T2)", duration:"T1: 12–24h · T2: 48–72h",
        confluence:[
          ["Fib 61,8%","$63.430 als Trigger (dein Chart) ✅"],
          ["Level $66.960","Nächster Widerstand dein Chart ✅"],
          ["F&G 12","Extreme Fear contrarian ✅"],
        ],
        exec:"Nur bei echtem Ausbruch mit Volumen über $63.430.",
        invalid:"Tagesschluss unter $62.000.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Gold", ticker:"XAU/USD", bias:"neutral", biasCol:C.gold,
    priority:"💡 NEUES SETUP",
    note:"Klare Levels · direkte Fed-Korrelation · Short + mittelfristiger Long",
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell an 200WMA $4.085–$4.115",
        tf:"1H · Scalp", wave:"Bounce in C-Welle — 200WMA als Deckel",
        entry:"4.085–4.115$", stop:"4.175$ (−1,5%)",
        t1:"3.978$ (−2,6%)", t2:"3.900$ (−4,5%)",
        crv:"1:1,7 (T1) · 1:3,0 (T2)", duration:"T1: 6–24h · T2: 3–7 Tage",
        confluence:[
          ["200WMA","$4.100 starker Widerstand ✅"],
          ["Fed","Sep-Hike 63%, Dez 80% ✅"],
          ["Iran-MOU","Geopolitik-Prämie weg ✅"],
          ["Struktur","Lower Highs seit Feb-ATH ✅"],
        ],
        exec:"Warte auf 1H-Bearish-Ablehnung bei $4.100. Signal: Wick + bearisher Schlusskurs.",
        invalid:"Tagesschluss über $4.200.",
        isBWave:false,
      },
      {
        type:"long", label:"Daily: Fib 38,2% ($3.820) — CPI 14.7. als Katalysator",
        tf:"Daily · Mittelfristig", wave:"Ende C-Welle wenn CPI Energie-Entlastung zeigt",
        entry:"3.820–3.900$", stop:"3.680$ (−3,7%)",
        t1:"4.200$ (+8,8%)", t2:"4.500$ (+16,4%)",
        crv:"1:2,4 (T1) · 1:4,4 (T2)", duration:"T1: 1–2 Wochen · T2: 3–4 Wochen",
        confluence:[
          ["Fib 38,2%","$3.820 starke Zone ✅"],
          ["Ölpreis","−40% → CPI fällt ✅"],
          ["Zentralbanken","Rekord-Goldkäufe strukturell ✅"],
          ["Goldman","Jahresendziel $4.900 ✅"],
        ],
        exec:"Mittelfristig. Erst bei $3.820–3.900 mit Bestätigungskerze. Nur wenn CPI 14.7. < 3,8%.",
        invalid:"Wochenschluss unter $3.680.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Ethereum", ticker:"ETH/USD", bias:"bear", biasCol:C.bear,
    priority:"⛔ VORSICHT — nur Short",
    note:"Relative Schwäche · Foundation-Krise · kein Long kurzfristig",
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell $1.615–$1.650 → C-Welle weiter",
        tf:"1H · Scalp", wave:"Bounce in C-Welle — ehem. Support = neuer Widerstand",
        entry:"1.615–1.645$", stop:"1.690$ (−2,7%)",
        t1:"1.540$ (−4,5%)", t2:"1.480$ (−8,2%)",
        crv:"1:1,7 (T1) · 1:3,0 (T2)", duration:"T1: 4–16h · T2: 24–48h",
        confluence:[
          ["Rel. Schwäche","−8,2% 7D vs. BTC −5,4% ✅"],
          ["Foundation","Budget −40%, 9 Departures ✅"],
          ["Widerstand","$1.620 ehem. Support ✅"],
        ],
        exec:"Kleiner Size. Erst bei Bounce auf $1.615+. Nächster echter Katalysator: CPI 14.7.",
        invalid:"Schluss über $1.700.",
        isBWave:false,
      },
    ],
  },
];

// ── NEWS ──────────────────────────────────────────────────────────────────────
const NEWS_DEFAULT = [
  {tag:"KRYPTO",date:"26.–27.06.",title:"SOL +8% führt Post-Expiry-Rebound — stärkster Major",body:"Nach $58.189 BTC-Tief dreht der Markt. SOL +8%, einziger Major mit positivem 7D-Return. Aave + SOL-Ecosystem voran. F&G: 12 (Extreme Fear)."},
  {tag:"KRYPTO",date:"26.06.",title:"$1,09 Mrd. Liquidationen — $692 Mio. ETF-Abflüsse (Rekord seit Mai)",body:"$846 Mio. Long-Liquidationen. Größte Order: $38 Mio. BTC auf Hyperliquid. ETF-Jahreswachstum 'basically zero'. Strategy: BTC-Reserven 'indestructible'."},
  {tag:"KRYPTO",date:"26.06.",title:"KG Group (Südkorea): Solana-Payments-Netzwerk",body:"KG Group + Solana Foundation MOU. Zweites großes koreanisches Unternehmen nach Toss Bank auf Solana. Strukturell positiv für SOL."},
  {tag:"REGULIERUNG",date:"25.06.",title:"CLARITY Act auf Herbst verschoben — Binance EU-Deadline 30.6.",body:"Senatsopposition. Binance sucht Alternativwege für EU-Nutzer bis 30.6."},
  {tag:"MAKRO",date:"25.06.",title:"PCE Mai: Kern +3,4% YoY wie erwartet — Sep-Hike 63%, Dez 80%",body:"Personal Spending +0,7% MoM (beat). Dollar + Yields fielen leicht. Kein Bounce für Krypto."},
  {tag:"AKTIEN",date:"24.06.",title:"Micron: EPS +24%, Q4-Guidance $50 Mrd. — AI-Thesis bestätigt",body:"MU EPS $25,11 vs. $20,20. Revenue $41,5 Mrd. MU +14,6% AH. Anthropic-Chip-Deal. HBM bis 2026 ausverkauft."},
];

// ── KALENDER ──────────────────────────────────────────────────────────────────
const CALENDAR = [
  {date:"30.06.2026",items:[
    {imp:"M",time:"—",name:"Binance EU-MiCA-Deadline",eff:"Lizenz-Verlust → Sell-Druck. Gesichert → kein Impact."},
    {imp:"M",time:"16:00",name:"US Consumer Confidence",eff:"Schwach → Rezessionsangst. Stark → Soft-Landing."},
  ]},
  {date:"03.07.2026",items:[
    {imp:"M",time:"AH",name:"Nike + Constellation Brands Earnings",eff:"Beat → Soft-Landing. Miss → Rezessionssorgen."},
  ]},
  {date:"14.07.2026",items:[
    {imp:"H",time:"14:30",name:"US CPI Juni — Ölpreis-Entlastung?",eff:"< 3,8% → Sep-Hike unter 50%, BTC Short-Squeeze, Gold-Rally. Über Erw. → weiterer Druck."},
  ]},
  {date:"28.–29.07.2026",items:[
    {imp:"H",time:"20:00",name:"FOMC (Warsh) — Erster möglicher Hike",eff:"Hike + hawkisch = Sell-off. Pause + neutral = Short-Squeeze möglich."},
  ]},
  {date:"Herbst 2026",items:[
    {imp:"M",time:"—",name:"CLARITY Act + SEC ETF-Entscheidungen",eff:"Verabschiedung/Approval → strukturell bullisch Krypto."},
    {imp:"L",time:"—",name:"Nvidia Q3 Earnings (~Aug.)",eff:"Beat → Risk-on stützt Krypto. Miss → AI-Bubble-Narrativ."},
  ]},
];

const IMP_COL = {H:C.bear, M:C.gold, L:C.blue};
const BIAS_COL = {bull:C.bull, neutral:C.gold, bear:C.bear};
const DIR_ICON = {bull:"▲", neutral:"◆", bear:"▼"};

// ── AI LIVE REFRESH ───────────────────────────────────────────────────────────
async function doLiveRefresh(setSnap, setNews, setLoading, setError, setLastUpd) {
  setLoading(true); setError(null);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-6", max_tokens:1000,
        tools:[{type:"web_search_20250305",name:"web_search"}],
        messages:[{role:"user",content:`Suche jetzt im Web nach aktuellen Preisen und antworte NUR mit JSON, kein anderer Text, keine Backticks.

Such nach: Bitcoin Preis USD, Ethereum Preis USD, Solana Preis USD, Gold Preis USD, aktuelle Krypto-News heute.

JSON-Format:
{"time":"Datum Uhrzeit MESZ","signals":[{"id":"btc","label":"BTC","price":"PREIS","chg24":ZAHL,"bias":"bull|neutral|bear"},{"id":"eth","label":"ETH","price":"PREIS","chg24":ZAHL,"bias":"bear"},{"id":"sol","label":"SOL","price":"PREIS","chg24":ZAHL,"bias":"bull|neutral|bear"},{"id":"gold","label":"XAU","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"makro","label":"MAKRO","price":"","chg24":null,"bias":"neutral"}],"news":[{"tag":"TAG","date":"Datum","title":"Titel","body":"2-3 Sätze"}]}`}],
      }),
    });
    if(!res.ok) throw new Error(`Status ${res.status}`);
    const raw = await res.json();
    const txt = raw.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if(!m) throw new Error("Kein JSON");
    const d = JSON.parse(m[0]);
    if(d.signals) setSnap({time:d.time||"Live",signals:d.signals});
    if(d.news) setNews(d.news);
    setLastUpd(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"}));
  } catch(e) {
    setError(`${e.message} — Fallback-Daten aktiv`);
  } finally { setLoading(false); }
}

// ── CHART-KOMPONENTE ──────────────────────────────────────────────────────────
function AssetChart({ data, levels=[], unit="$", h=200, color=C.gold }) {
  const domain = (() => {
    const vals = data.map(d=>d.p);
    const mn = Math.min(...vals), mx = Math.max(...vals), pad=(mx-mn)*0.12;
    return [mn-pad, mx+pad];
  })();
  return (
    <ResponsiveContainer width="100%" height={h}>
      <LineChart data={data} margin={{top:8,right:8,left:0,bottom:4}}>
        <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
        <YAxis domain={domain} tick={{fill:C.textLow,fontSize:10}} width={56}
          tickFormatter={v=>`${unit}${v>=1000?Math.round(v).toLocaleString("de-DE"):v.toFixed(unit==="$"&&v<100?2:0)}`}
          axisLine={{stroke:C.border}} tickLine={false} />
        <XAxis dataKey="t" tick={{fill:C.textLow,fontSize:9}}
          axisLine={{stroke:C.border}} tickLine={false} interval="preserveStartEnd"/>
        <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.borderHi}`,borderRadius:6,fontSize:11,color:C.textHi}}
          formatter={v=>[`${unit}${v.toLocaleString("de-DE")}`,""]} labelStyle={{color:C.textMid}}/>
        {levels.map((lv,i)=>(
          <ReferenceLine key={i} y={lv.v} stroke={lv.col} strokeDasharray="5 3" strokeWidth={1.2}
            label={{value:lv.lbl,position:"insideTopLeft",fill:lv.col,fontSize:9,fontWeight:600}}/>
        ))}
        <Line type="monotone" dataKey="p" stroke={color} strokeWidth={2.2}
          dot={false} isAnimationActive={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── ASSET CARD ────────────────────────────────────────────────────────────────
function AssetCard({ a, defaultOpen=false }) {
  const [open,setOpen]=useState(defaultOpen);
  const [view,setView]=useState("4h");
  const bc = BIAS_COL[a.bias]||C.gold;
  const activeData = view==="4h" ? a.path4h : a.pathD;
  const activeText = view==="4h" ? a.wave4h : a.waveD;
  const [waveLabel,...waveRest] = activeText.split("\n");

  return (
    <div style={{background:C.card,border:`1px solid ${bc}33`,borderRadius:10,padding:"13px 13px 10px"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",cursor:"pointer",userSelect:"none"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:15.5,fontWeight:600,color:C.textHi}}>{a.name}</span>
            <span style={{fontSize:10,color:C.textLow}}>{a.ticker}</span>
            <span style={{fontSize:10,fontWeight:700,color:bc,border:`1px solid ${bc}44`,borderRadius:4,padding:"1px 6px"}}>
              {DIR_ICON[a.bias]} {a.bias==="bull"?"BULL":a.bias==="bear"?"BEAR":"NEUTRAL"}
            </span>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:3,flexWrap:"wrap"}}>
            <span style={{fontSize:19,fontWeight:700,color:C.textHi,fontVariantNumeric:"tabular-nums"}}>{a.unit}{a.price}</span>
            <span style={{fontSize:12,fontWeight:700,color:a.chg24>=0?C.bull:C.bear,fontVariantNumeric:"tabular-nums"}}>
              {a.chg24>=0?"+":""}{a.chg24}% 24h
            </span>
            <span style={{fontSize:11,fontWeight:600,color:a.chg7>=0?C.bull:C.bear,fontVariantNumeric:"tabular-nums"}}>
              {a.chg7>=0?"+":""}{a.chg7}% 7D
            </span>
          </div>
        </div>
        <span style={{color:C.textLow,fontSize:18,marginLeft:8,flexShrink:0}}>{open?"−":"+"}</span>
      </div>

      {open && (
        <>
          {/* View Toggle */}
          <div style={{display:"flex",gap:6,marginTop:11,marginBottom:8}}>
            {[["4h","4H-Chart (3 Tage)"],["daily","Daily (6 Monate)"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} disabled={v==="4h"&&!a.path4h} style={{
                flex:1,padding:"6px 0",
                background:view===v?C.surface:"transparent",
                border:view===v?`1px solid ${C.gold}55`:`1px solid ${C.border}`,
                borderRadius:6,color:view===v?C.gold:C.textMid,
                fontSize:11,fontWeight:600,cursor:"pointer",opacity:v==="4h"&&!a.path4h?0.4:1,
              }}>{l}</button>
            ))}
          </div>

          {activeData && (
            <AssetChart data={activeData} levels={view==="4h"?a.levels:[]} unit={a.unit}
              color={a.bias==="bull"?C.bull:a.bias==="bear"?C.bear:C.gold} h={210}/>
          )}

          {/* Wave Text */}
          <div style={{marginTop:9,paddingTop:9,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:4}}>{waveLabel}</div>
            {waveRest.length>0 && <p style={{fontSize:11.5,color:C.textMid,lineHeight:1.6,margin:0}}>{waveRest.join(" ")}</p>}
          </div>

          {/* TradingView Link */}
          <a href={a.tv} target="_blank" rel="noopener noreferrer" style={{
            display:"inline-flex",alignItems:"center",gap:5,marginTop:8,
            fontSize:11,color:C.blue,textDecoration:"none",
          }}>
            📊 Chart auf TradingView öffnen →
          </a>
        </>
      )}
    </div>
  );
}

// ── SETUP CARD ────────────────────────────────────────────────────────────────
function SetupCard({s}) {
  const isLong=s.type==="long", col=isLong?C.bull:C.bear;
  return (
    <div style={{background:C.bg,border:`1px solid ${col}33`,borderRadius:9,padding:12}}>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:6,marginBottom:7}}>
        <span style={{fontSize:10,fontWeight:800,color:col,border:`1px solid ${col}55`,borderRadius:4,padding:"2px 8px",letterSpacing:"0.05em"}}>{isLong?"LONG":"SHORT"}</span>
        <span style={{fontSize:10,color:C.textMid,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 7px"}}>{s.tf}</span>
        <span style={{fontSize:12.5,fontWeight:600,color:C.textHi,flex:1}}>{s.label}</span>
      </div>
      {s.isBWave&&(
        <div style={{background:"#1a1400",border:`1px solid ${C.gold}44`,borderRadius:6,padding:"5px 9px",marginBottom:8,fontSize:10.5,color:C.gold}}>
          ⚠️ Kontra-Trend / B-Welle — kleiner Size, enger Stop
        </div>
      )}
      <div style={{fontSize:10.5,fontStyle:"italic",color:C.gold,marginBottom:8}}>{s.wave}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
        {[["ENTRY",s.entry,C.textHi],["STOP",s.stop,C.bear],["ZIEL 1",s.t1,C.bull],["ZIEL 2",s.t2,C.bull]].map(([l,v,c])=>(
          <div key={l} style={{background:C.surface,borderRadius:6,padding:"6px 9px"}}>
            <div style={{fontSize:9,color:C.textLow,letterSpacing:"0.05em",marginBottom:2}}>{l}</div>
            <div style={{fontSize:12,fontWeight:700,color:c,fontVariantNumeric:"tabular-nums"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:7,marginBottom:9}}>
        <div style={{background:C.surface,borderRadius:5,padding:"5px 9px",flex:1}}>
          <div style={{fontSize:9,color:C.textLow,marginBottom:1}}>CRV</div>
          <div style={{fontSize:11.5,fontWeight:700,color:C.gold}}>{s.crv}</div>
        </div>
        <div style={{background:C.surface,borderRadius:5,padding:"5px 9px",flex:2}}>
          <div style={{fontSize:9,color:C.textLow,marginBottom:1}}>DAUER</div>
          <div style={{fontSize:11,color:C.textMid,fontWeight:600}}>{s.duration}</div>
        </div>
      </div>
      {s.confluence&&(
        <div style={{background:C.surface,borderRadius:6,padding:"7px 10px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.textLow,fontWeight:700,letterSpacing:"0.05em",marginBottom:5}}>CONFLUENCE</div>
          {s.confluence.map(([k,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:i<s.confluence.length-1?3:0}}>
              <span style={{fontSize:10,color:C.textMid}}>{k}</span>
              <span style={{fontSize:10,color:C.textHi,fontWeight:600,textAlign:"right",marginLeft:8}}>{v}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{fontSize:11.5,color:C.textMid,lineHeight:1.55,marginBottom:7}}>{s.exec}</div>
      <div style={{fontSize:10.5,color:C.textLow,paddingTop:7,borderTop:`1px solid ${C.border}`}}>
        <span style={{fontWeight:700,color:C.textMid}}>Invalidiert: </span>{s.invalid}
      </div>
    </div>
  );
}

function TradeGroup({g}) {
  const [open,setOpen]=useState(g.asset==="Solana");
  return (
    <div style={{background:C.card,border:`1px solid ${g.biasCol}33`,borderRadius:10,padding:"13px 13px 11px"}}>
      <div onClick={()=>setOpen(!open)} style={{cursor:"pointer",userSelect:"none",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:14.5,fontWeight:600,color:C.textHi}}>{g.asset}</span>
            <span style={{fontSize:10,color:C.textLow}}>{g.ticker}</span>
            <span style={{fontSize:10,fontWeight:700,color:g.biasCol,border:`1px solid ${g.biasCol}44`,borderRadius:4,padding:"1px 6px"}}>{g.priority}</span>
          </div>
          <div style={{fontSize:10.5,color:C.textMid,marginTop:2}}>{g.note}</div>
        </div>
        <span style={{color:C.textLow,fontSize:18,marginLeft:8,flexShrink:0}}>{open?"−":"+"}</span>
      </div>
      {open&&<div style={{display:"flex",flexDirection:"column",gap:9,marginTop:11}}>{g.setups.map((s,i)=><SetupCard key={i} s={s}/>)}</div>}
    </div>
  );
}

// ── HAUPTAPP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("markets");
  const [snap,setSnap]=useState(SNAPSHOT_DEFAULT);
  const [news,setNews]=useState(NEWS_DEFAULT);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [lastUpd,setLastUpd]=useState(null);

  const handleRefresh=useCallback(()=>{
    doLiveRefresh(setSnap,setNews,setLoading,setError,setLastUpd);
  },[]);

  const sigs=snap.signals||SNAPSHOT_DEFAULT.signals;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.textHi,fontFamily:"'Helvetica Neue',Arial,sans-serif",padding:"16px 12px 60px"}}>
      <div style={{maxWidth:740,margin:"0 auto"}}>

        {/* ── HEADER ── */}
        <div style={{borderBottom:`1px solid ${C.border}`,paddingBottom:12,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
            <div style={{flex:1,minWidth:0}}>
              <h1 style={{fontFamily:"Georgia,serif",fontSize:20,margin:0,color:C.textHi,letterSpacing:"0.01em"}}>Guido's Market Briefing</h1>
              <div style={{fontSize:10,color:C.textLow,marginTop:2}}>
                {lastUpd ? `🟢 Live: ${lastUpd} MESZ` : snap.time}
              </div>
            </div>
            {/* Refresh Button */}
            <button onClick={handleRefresh} disabled={loading} style={{
              background:C.surface, border:`1px solid ${loading?C.textLow:C.gold}`,
              borderRadius:8, padding:"8px 12px",
              color:loading?C.textLow:C.gold, fontSize:12, fontWeight:700,
              cursor:loading?"wait":"pointer", flexShrink:0,
              display:"flex",alignItems:"center",gap:5,
            }}>
              <span style={{fontSize:13,display:"inline-block",transform:loading?"rotate(45deg)":"none",transition:"transform 0.3s"}}>
                {loading?"⟳":"🔄"}
              </span>
              {loading?"Suche...":"Live Update"}
            </button>
          </div>
          {error&&<div style={{marginTop:7,padding:"5px 10px",background:"#180808",border:`1px solid ${C.bear}44`,borderRadius:6,fontSize:10.5,color:C.bear}}>{error}</div>}
          {loading&&<div style={{marginTop:7,padding:"7px 11px",background:C.surface,border:`1px solid ${C.gold}33`,borderRadius:6,fontSize:10.5,color:C.textMid}}>🔍 Claude sucht BTC · ETH · SOL · Gold Preise + News...</div>}
        </div>

        {/* ── AMPEL ── */}
        <div style={{display:"flex",gap:5,marginBottom:14}}>
          {sigs.map(s=>{
            const bc=BIAS_COL[s.bias]||C.gold;
            return (
              <div key={s.id} style={{flex:1,background:C.card,border:`1px solid ${bc}55`,borderRadius:8,padding:"7px 4px",textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:800,color:bc,letterSpacing:"0.03em"}}>{s.label}</div>
                {s.price&&<div style={{fontSize:10,fontWeight:700,color:C.textHi,marginTop:1,fontVariantNumeric:"tabular-nums",lineHeight:1.1,wordBreak:"break-all"}}>{s.price}</div>}
                <div style={{fontSize:13,color:bc,lineHeight:1,marginTop:1}}>{DIR_ICON[s.bias]||"◆"}</div>
                {s.chg24!==null&&<div style={{fontSize:9,color:s.chg24>=0?C.bull:C.bear,fontVariantNumeric:"tabular-nums",marginTop:1}}>
                  {s.chg24>0?"+":""}{s.chg24}%
                </div>}
              </div>
            );
          })}
        </div>

        {/* ── TABS ── */}
        <div style={{display:"flex",gap:5,marginBottom:14}}>
          {[["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              flex:1,padding:"9px 0",
              background:tab===id?C.surface:"transparent",
              border:tab===id?`1px solid ${C.gold}55`:`1px solid ${C.border}`,
              borderRadius:8,color:tab===id?C.gold:C.textMid,
              fontSize:12.5,fontWeight:600,cursor:"pointer",
            }}>{lbl}</button>
          ))}
        </div>

        {/* ── MÄRKTE ── */}
        {tab==="markets"&&(
          <>
            {/* MCO Terminal Banner */}
            <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer" style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              background:C.surface, border:`1px solid ${C.blue}44`,
              borderRadius:9,padding:"10px 14px",marginBottom:12,textDecoration:"none",
            }}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.blue}}>🔗 MCO Terminal</div>
                <div style={{fontSize:10,color:C.textMid,marginTop:1}}>Zeitzyklen · Rainbow Chart · Live-Daten von Ben</div>
              </div>
              <span style={{fontSize:11,color:C.textLow}}>Öffnen →</span>
            </a>

            <div style={{fontSize:10.5,color:C.textLow,marginBottom:9,letterSpacing:"0.06em",fontWeight:700}}>KRYPTO — 4H + DAILY CHARTS</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
              {ASSETS.filter(a=>["sol","btc","eth"].includes(a.id)).map(a=>(
                <AssetCard key={a.id} a={a} defaultOpen={a.id==="sol"}/>
              ))}
            </div>

            <div style={{fontSize:10.5,color:C.textLow,marginBottom:9,letterSpacing:"0.06em",fontWeight:700}}>ROHSTOFFE — GOLD & SILBER</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
              {ASSETS.filter(a=>["gold","silver"].includes(a.id)).map(a=>(
                <AssetCard key={a.id} a={a}/>
              ))}
            </div>

            <div style={{fontSize:10.5,color:C.textLow,marginBottom:9,letterSpacing:"0.06em",fontWeight:700}}>MAKRO — ÜBERBLICK</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
              {[{n:"S&P 500",p:"7.354",ch:-0.05},{n:"WTI Öl",p:"$71,90",ch:+0.3},{n:"DXY",p:"101,6",ch:+0.4}].map(m=>(
                <div key={m.n} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 10px"}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.textMid}}>{m.n}</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.textHi,marginTop:2,fontVariantNumeric:"tabular-nums"}}>{m.p}</div>
                  <div style={{fontSize:13,fontWeight:700,color:m.ch>=0?C.bull:C.bear,marginTop:1}}>{m.ch>=0?"▲":"▼"} {Math.abs(m.ch)}%</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TRADES ── */}
        {tab==="trades"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:C.surface,border:`1px solid ${C.gold}33`,borderRadius:9,padding:"9px 12px",fontSize:11,color:C.textMid,lineHeight:1.55}}>
              <span style={{color:C.gold,fontWeight:700}}>Cross-Check · keine Empfehlung. </span>
              SOL (⭐) → Gold (💡) → BTC (⏸ deine Fib-Levels) → ETH (⛔). 1H/2H-Setups. Confluence-Tabelle pro Setup.
            </div>
            {TRADES.map(g=><TradeGroup key={g.asset} g={g}/>)}
          </div>
        )}

        {/* ── NEWS ── */}
        {tab==="news"&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {news.map((n,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:13}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:4,padding:"1px 6px",letterSpacing:"0.05em"}}>{n.tag}</span>
                  <span style={{fontSize:10,color:C.textLow}}>{n.date}</span>
                </div>
                <div style={{fontFamily:"Georgia,serif",fontSize:14.5,color:C.textHi,fontWeight:600,marginBottom:5}}>{n.title}</div>
                <p style={{fontSize:11.5,color:C.textMid,lineHeight:1.55,margin:0}}>{n.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── KALENDER ── */}
        {tab==="calendar"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",gap:12,fontSize:10.5,color:C.textMid}}>
              {[["H","Hoch",C.bear],["M","Mittel",C.gold],["L","Niedrig",C.blue]].map(([k,l,c])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:7,height:7,borderRadius:99,background:c,display:"inline-block"}}/>{l}
                </div>
              ))}
            </div>
            {CALENDAR.map((g,gi)=>(
              <div key={gi}>
                <div style={{fontSize:12.5,fontWeight:700,color:C.textHi,fontFamily:"Georgia,serif",marginBottom:7,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{g.date}</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {g.items.map((e,i)=>(
                    <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:7,height:7,borderRadius:99,background:IMP_COL[e.imp],display:"inline-block",flexShrink:0}}/>
                        <span style={{fontSize:10.5,color:C.textLow}}>{e.time}</span>
                        <span style={{fontFamily:"Georgia,serif",fontSize:13.5,color:C.textHi,fontWeight:600}}>{e.name}</span>
                      </div>
                      <div style={{fontSize:11.5,color:C.textMid,lineHeight:1.55,marginTop:8,marginLeft:15,paddingTop:7,borderTop:`1px solid ${C.border}`}}>
                        <span style={{color:C.textLow,fontWeight:700}}>Impact: </span>{e.eff}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{marginTop:24,fontSize:10,color:C.textLow,textAlign:"center",lineHeight:1.6}}>
          Snapshot · keine Anlageberatung · Elliott-Wave subjektiv · "🔄 Live Update" für aktuelle Preise
        </div>
      </div>
    </div>
  );
}
