import React, { useState, useCallback, useEffect, useRef } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// GUIDO'S MARKET BRIEFING — Terminal Edition
// Fokus-Modal · News-Expand · Kalender-Wochenansicht · TradingView-Overlay
// Desktop 2-Spalten · Mobile 1-Spalte · Live-Refresh
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:"#07080c", surface:"#0f1116", card:"#13151c", cardHover:"#181b24",
  border:"#1c1f2a", borderHi:"#2a2f3e",
  bull:"#3ddc84", bear:"#ff4d6d", gold:"#f0b429", blue:"#5b9cf6", purple:"#a78bfa",
  textHi:"#f0ede6", textMid:"#9aa0b4", textLow:"#4e5568",
};

function useIsMobile() {
  const [m,setM]=useState(window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

// ── DATEN ─────────────────────────────────────────────────────────────────────
const SNAP_DEFAULT = {
  time:"28. Juni 2026 · Snapshot",
  signals:[
    {id:"btc",  label:"BTC",   price:"60.254",chg24:+0.3, bias:"neutral"},
    {id:"eth",  label:"ETH",   price:"1.588", chg24:+1.0, bias:"bear"  },
    {id:"sol",  label:"SOL",   price:"72,22", chg24:+2.7, bias:"bull"  },
    {id:"gold", label:"GOLD",  price:"4.036", chg24:+0.2, bias:"neutral"},
    {id:"silver",label:"SILBER",price:"57,00",chg24:-0.3, bias:"neutral"},
    {id:"makro",label:"MAKRO", price:"S&P 7354",chg24:null,bias:"neutral"},
  ],
};

const BTC_4H=[{t:"Do 12h",p:60400},{t:"Do 16h",p:58700},{t:"Do 20h",p:58189},{t:"Fr 00h",p:59100},{t:"Fr 08h",p:60200},{t:"Fr 16h",p:60100},{t:"Sa 00h",p:60400},{t:"jetzt",p:60254}];
const ETH_4H=[{t:"Do 12h",p:1580},{t:"Do 16h",p:1555},{t:"Do 20h",p:1542},{t:"Fr 00h",p:1558},{t:"Fr 08h",p:1568},{t:"Fr 16h",p:1572},{t:"Sa 00h",p:1588},{t:"jetzt",p:1588}];
const SOL_4H=[{t:"Do 12h",p:65.2},{t:"Do 16h",p:65.0},{t:"Do 20h",p:64.8},{t:"Fr 00h",p:66.0},{t:"Fr 08h",p:70.2},{t:"Fr 16h",p:72.0},{t:"Sa 00h",p:72.4},{t:"jetzt",p:72.22}];
const GOLD_4H=[{t:"Do 08h",p:3978},{t:"Do 12h",p:4010},{t:"Do 16h",p:4025},{t:"Fr 00h",p:4035},{t:"Fr 08h",p:4036},{t:"Fr 16h",p:4030},{t:"Sa 00h",p:4036},{t:"jetzt",p:4036}];
const BTC_D=[{t:"Jan",p:98000},{t:"",p:126080},{t:"Feb",p:104000},{t:"",p:85000},{t:"Mär",p:77623},{t:"",p:65076},{t:"Jun",p:58189},{t:"jetzt",p:60254}];
const ETH_D=[{t:"Jan",p:3680},{t:"Feb",p:2840},{t:"Mär",p:1920},{t:"Apr",p:1665},{t:"",p:1542},{t:"jetzt",p:1588}];
const SOL_D=[{t:"Jan",p:198},{t:"Feb",p:235},{t:"Mär",p:128},{t:"Apr",p:88},{t:"",p:64.8},{t:"jetzt",p:72.22}];
const GOLD_D=[{t:"Jan",p:3800},{t:"",p:5200},{t:"Feb",p:4900},{t:"Mär",p:4200},{t:"",p:3978},{t:"jetzt",p:4036}];
const SILVER_D=[{t:"Jan",p:72},{t:"",p:121},{t:"Feb",p:105},{t:"Mär",p:75},{t:"Apr",p:62},{t:"",p:57},{t:"jetzt",p:57}];

const ASSETS=[
  {id:"btc",name:"Bitcoin",ticker:"BTC/USD",emoji:"₿",tvSymbol:"BINANCE:BTCUSDT",
   tvLink:"https://www.tradingview.com/chart/G1bYW1gV/",
   unit:"$",price:"60.254",chg24:+0.3,chg7:-5.4,bias:"neutral",
   path4h:BTC_4H,pathD:BTC_D,
   levels:[{v:63430,col:C.bear,lbl:"Fib 61,8%"},{v:62366,col:C.gold,lbl:"Fib 50%"},{v:61000,col:C.gold,lbl:"Fib 38,2%"},{v:60170,col:C.bear,lbl:"Sell-Wall"},{v:57400,col:C.blue,lbl:"Box-Ziel"}],
   wave:"1H/4H: Bounce in B/4-Welle — Fib $61–63K Widerstand ⚠️",
   waveDetail:"Fib-Band 38,2–61,8% ($61–63,4K) ist der entscheidende Widerstand. Sell-Walls $60.170–$61.200 decken sich exakt mit Fib 38,2%. Zielzone wenn Bounce scheitert: $55.400–57.400 (blaue Box aus deiner TradingView-Zählung). Bullisch erst bei 1H-Schlusskurs über $63.430.",
   keyStats:[["ATH 2026","$126.080"],["Zyklusboden","$58.189"],["200WMA","$62.457"],["F&G","12 (Ext. Fear)"],["Sep-Hike","63%"],["ETF 7D","−$692 Mio."]],
  },
  {id:"eth",name:"Ethereum",ticker:"ETH/USD",emoji:"Ξ",tvSymbol:"BINANCE:ETHUSDT",
   tvLink:"https://www.tradingview.com/chart/UBrQvmXY/",
   unit:"$",price:"1.588",chg24:+1.0,chg7:-8.2,bias:"bear",
   path4h:ETH_4H,pathD:ETH_D,
   levels:[{v:1620,col:C.bear,lbl:"Widerstand"},{v:1542,col:C.blue,lbl:"Tief"},{v:1500,col:C.bull,lbl:"Support"}],
   wave:"4H: Schwacher Bounce — Foundation-Krise, rel. Schwäche ⚠️",
   waveDetail:"ETH Tief $1.542. Bounce mit niedrigem Volumen — korrektiv, kein Impuls. Foundation: -40% Budget, 9 Senior-Departures. Relative Schwäche: -8,2% 7D vs. BTC -5,4%. Widerstand $1.620. Nächster Katalysator: CPI 14.7. oder SEC MSSE-Approval.",
   keyStats:[["Jan-Hoch","$3.680"],["Aktuell","$1.588"],["7D Perf.","-8,2%"],["Foundation","Krise"],["MSSE ETF","SEC ausstehend"],["BitMine","Russell 1000"]],
  },
  {id:"sol",name:"Solana",ticker:"SOL/USD",emoji:"◎",tvSymbol:"BINANCE:SOLUSDT",
   tvLink:"https://www.tradingview.com/chart/PnJ5DSTK/",
   unit:"$",price:"72,22",chg24:+2.7,chg7:+0.5,bias:"bull",
   path4h:SOL_4H,pathD:SOL_D,
   levels:[{v:74.5,col:C.bear,lbl:"Widerstand"},{v:70.0,col:C.bull,lbl:"Support"},{v:64.8,col:C.blue,lbl:"W5-Tief"}],
   wave:"4H: 5-Wellen-Ende $64,80 — impulsiver Bounce +12% 🟢",
   waveDetail:"Sauberste Struktur aller drei Coins. Impuls-Bounce mit höherem Volumen als Abwärts-Move — echtes Reversal-Signal. Höhere Highs + Lows seit Do. Stärkster Major: einziger mit positivem 7D-Return (+0,5%). Für Einstieg: Pullback auf $70–71 abwarten.",
   keyStats:[["ATH 2026","$235"],["W5-Tief","$64,80"],["7D Perf.","+0,5%"],["ETF Approval","95% (Bloomberg)"],["KG Group","MOU Jun 2026"],["DEX Vol.","#1 global"]],
  },
  {id:"gold",name:"Gold",ticker:"XAU/USD",emoji:"🥇",tvSymbol:"TVC:GOLD",
   tvLink:"https://www.tradingview.com/chart/mmdbJB1E/",
   unit:"$",price:"4.036",chg24:+0.2,chg7:-5.1,bias:"neutral",
   path4h:GOLD_4H,pathD:GOLD_D,
   levels:[{v:4100,col:C.bear,lbl:"200WMA"},{v:4000,col:C.bull,lbl:"Support"},{v:3820,col:C.blue,lbl:"Fib 38,2%"}],
   wave:"4H: PCE-Bounce — 200WMA $4.100 als Deckel ⚠️",
   waveDetail:"Erholung von $3.978 auf $4.036 nach neutralem PCE-Druck. Widerstand: 200WMA $4.100. Sep-Hike 63%, Dez 80% → Dollar bleibt stark. Iran-MOU = Geopolitik-Prämie weg. Goldman Jahres-Ziel: $4.900. Zentralbanken kaufen Rekord-Gold.",
   keyStats:[["ATH 2026","~$5.200"],["200WMA","$4.100"],["Goldman Ziel","$4.900"],["Sep-Hike","63%"],["Iran-MOU","Prämie weg"],["Zentralbanken","Rekord-Käufe"]],
  },
  {id:"silver",name:"Silber",ticker:"XAG/USD",emoji:"🪙",tvSymbol:"TVC:SILVER",
   tvLink:"https://www.tradingview.com/chart/AlIePYyu/",
   unit:"$",price:"57,00",chg24:-0.3,chg7:-3.2,bias:"neutral",
   path4h:null,pathD:SILVER_D,
   levels:[{v:60,col:C.bear,lbl:"Widerstand"},{v:55,col:C.bull,lbl:"Support"}],
   wave:"Daily: -53% vom ATH $121,62 — 6. Angebotsdefizit",
   waveDetail:"Doppelbelastung: Fed-Druck + industrielle Nachfragesorgen durch AI-Chip-Slowdown. Strukturell bullisch: 6. globales Angebotsdefizit in Folge (Silber Institut). Langfristig starkes Setup sobald Fed-Pivot sichtbar.",
   keyStats:[["ATH 2026","$121,62"],["Aktuell","$57,00"],["Vom ATH","-53%"],["Defizit","6. Jahr in Folge"],["Polymarket","42% <$60 Ende Jun"],["Industriell","AI-Chip-Slowdown"]],
  },
];

// ── TRADES ────────────────────────────────────────────────────────────────────
const TRADES=[
  {asset:"Solana",ticker:"SOL/USD",bias:"bull",biasCol:C.bull,priority:"⭐ PRIORISIERT",note:"Sauberste Struktur · stärkste rel. Performance",
   setups:[
    {type:"long",label:"1H: Pullback $70–71 → Welle 1 neuer Impuls",tf:"1H · Scalp",wave:"Post-5W-Reversal: Erste Korrektur auf Support",
     entry:"70,00–71,20$",stop:"68,80$",t1:"73,50$",t2:"76,00$",crv:"1:1,8 · 1:3,5",duration:"T1: 4–12h · T2: 24–48h",
     confluence:[["Elliott","5-Wellen-Ende $64,80 ✅"],["Volume","Impuls > Abwärts-Vol ✅"],["Rel. Stärke","+0,5% 7D vs −5% ✅"],["ETF","95% Approval ✅"]],
     exec:"Kein Entry bei $72. Pullback auf $70–71 abwarten. Signal: 1H-Bullish-Kerze bei $70,5+.",invalid:"Tagesschluss unter $68,80.",isBWave:false},
    {type:"long",label:"2H: Breakout $74,50 → Welle 3",tf:"2H · Intraday",wave:"Welle 3 — stärkstes Segment",
     entry:"74,60–75,00$ (2H-Schluss über $74,50)",stop:"72,50$",t1:"79,00$",t2:"83,50$",crv:"1:1,9 · 1:4,1",duration:"T1: 6–16h · T2: 48–72h",
     confluence:[["Elliott","Welle 3 nach 1+2 ✅"],["Breakout","$74,50 Jun-Hoch ✅"],["Struktur","Higher High + Low ✅"]],
     exec:"Erst nach 2H-Schlusskurs über $74,50. Nicht antizipieren.",invalid:"2H-Schluss unter $72,50.",isBWave:false},
  ]},
  {asset:"Bitcoin",ticker:"BTC/USD",bias:"neutral",biasCol:C.gold,priority:"⏸ ABWARTEN",note:"Deine Fib-Levels (TradingView 27.6.) · Sell-Walls bremsen",
   setups:[
    {type:"short",label:"1H: Sell Fib 38,2–50% ($61–62,4K)",tf:"1H · Scalp",wave:"B/4-Wellen-Ende — Bounce scheitert",
     entry:"61.000–62.400$",stop:"63.200$",t1:"59.000$",t2:"57.400$",crv:"1:1,6 · 1:2,5",duration:"T1: 4–12h · T2: 24–48h",
     confluence:[["Fib 38,2%","~$61.000 dein Chart ✅"],["Sell-Wall","$60.170–$61.200 ✅"],["Volume","Bounce < Abwärts ✅"]],
     exec:"1H-Bearish-Ablehnung in Fib-Zone abwarten.",invalid:"1H-Schluss über $63.430.",isBWave:true},
    {type:"long",label:"1H: Breakout $63.430 (Fib 61,8%) → (5) aufwärts",tf:"1H · Intraday",wave:"Alternative: (4) fertig → (5)",
     entry:"63.500–64.000$",stop:"62.000$",t1:"66.960$",t2:"69.961$",crv:"1:2,1 · 1:4,0",duration:"T1: 12–24h · T2: 48–72h",
     confluence:[["Fib 61,8%","$63.430 Trigger ✅"],["F&G 12","Extreme Fear contrarian ✅"],["Corporate","Strategy kauft ✅"]],
     exec:"Nur bei echtem Breakout mit Volumen über $63.430.",invalid:"Tagesschluss unter $62.000.",isBWave:false},
  ]},
  {asset:"Gold",ticker:"XAU/USD",bias:"neutral",biasCol:C.gold,priority:"💡 SETUP",note:"Klare Levels · Fed-Korrelation · Short + mittelfristiger Long",
   setups:[
    {type:"short",label:"1H: Bounce-Sell 200WMA $4.085–$4.115",tf:"1H · Scalp",wave:"C-Welle Bounce — 200WMA als Deckel",
     entry:"4.085–4.115$",stop:"4.175$",t1:"3.978$",t2:"3.900$",crv:"1:1,7 · 1:3,0",duration:"T1: 6–24h · T2: 3–7 Tage",
     confluence:[["200WMA","$4.100 Widerstand ✅"],["Fed","Sep 63%, Dez 80% ✅"],["Iran-MOU","Geopolitik-Prämie weg ✅"]],
     exec:"1H-Bearish-Ablehnung bei $4.100 abwarten.",invalid:"Tagesschluss über $4.200.",isBWave:false},
    {type:"long",label:"Daily: Fib $3.820 — CPI 14.7. Katalysator",tf:"Daily · Mittelfristig",wave:"Ende C-Welle bei Fib 38,2%",
     entry:"3.820–3.900$",stop:"3.680$",t1:"4.200$",t2:"4.500$",crv:"1:2,4 · 1:4,4",duration:"T1: 1–2 Wo · T2: 3–4 Wo",
     confluence:[["Fib 38,2%","$3.820 ✅"],["Ölpreis","−40% → CPI fällt ✅"],["Goldman","Ziel $4.900 ✅"]],
     exec:"Erst bei $3.820–3.900 mit Bestätigungskerze. Nur wenn CPI 14.7. < 3,8%.",invalid:"Wochenschluss unter $3.680.",isBWave:false},
  ]},
  {asset:"Ethereum",ticker:"ETH/USD",bias:"bear",biasCol:C.bear,priority:"⛔ VORSICHT",note:"Relative Schwäche · Foundation-Krise · nur Short",
   setups:[
    {type:"short",label:"1H: Bounce-Sell $1.615–$1.650",tf:"1H · Scalp",wave:"C-Welle — Bounce = Sell-Gelegenheit",
     entry:"1.615–1.645$",stop:"1.690$",t1:"1.540$",t2:"1.480$",crv:"1:1,7 · 1:3,0",duration:"T1: 4–16h · T2: 24–48h",
     confluence:[["Rel. Schwäche","−8,2% 7D vs BTC ✅"],["Foundation","Budget −40% ✅"],["Widerstand","$1.620 ehem. Support ✅"]],
     exec:"Kleiner Size. Erst bei Bounce auf $1.615+. Nächster Katalysator: CPI 14.7.",invalid:"Schluss über $1.700.",isBWave:false},
  ]},
];

// ── NEWS (mit Fachbegriff-Erklärungen) ───────────────────────────────────────
const NEWS_DEFAULT=[
  {tag:"KRYPTO",date:"27.06.",icon:"📊",
   title:"SOL +8% führt Post-Expiry-Rebound — stärkster Major-Coin",
   summary:"SOL +8% nach Quarterly Options Expiry. Einziger Major mit positivem 7D-Return.",
   full:`Nach dem Zyklusboden bei $58.189 (BTC) dreht der Markt am Freitag. Solana führt mit +8% auf $72,22 — angeführt von Aave und SOL-Ecosystem-Token.

📌 Wichtige Begriffe erklärt:
• Quarterly Options Expiry: Vierteljährlicher Verfallstag von Optionskontrakten. An diesem Tag werden Milliarden an Derivate-Positionen abgerechnet — oft erhöhte Volatilität, danach oft Richtungsumkehr.
• Max Pain ($61.000): Der Preis, bei dem die meisten Optionen wertlos verfallen. Kurs wird oft magnetisch angezogen.
• Fear & Greed Index (12): Misst Marktsentiment von 0 (Extreme Fear) bis 100 (Extreme Greed). Wert 12 = historisch oft Bodennähe — contrarian bullisch.

📈 Auswirkung:
Extreme Fear kombiniert mit Post-Expiry-Bounce ist historisch ein starkes Setup für mittelfristige Erholung. SOL zeigt dabei die sauberste Elliott-Struktur (5-Wellen-Ende bei $64,80).`,
   impact:"bullisch kurz/mittelfristig",impactCol:C.bull},
  {tag:"KRYPTO",date:"26.06.",icon:"💥",
   title:"$1,09 Mrd. Liquidationen — $692 Mio. ETF-Abflüsse (Rekord seit Mai)",
   summary:"$846 Mio. Long-Liquidationen. Größte Order: $38 Mio. BTC auf Hyperliquid.",
   full:`Donnerstag war die härteste Session der Woche: BTC traf $58.189 — tiefster Stand seit September 2024.

📌 Begriffe erklärt:
• Liquidation: Wenn ein gehebelter Trade (z.B. 10x Long) gegen dich läuft und die Sicherheitsleistung nicht mehr reicht, schließt die Börse zwangsweise. Das verstärkt Kursabfälle massiv.
• Hyperliquid: Dezentrale Derivate-Börse on-chain (kein zentrales Unternehmen). $38 Mio. Einzelliquidation dort ist außergewöhnlich groß.
• ETF Nettoabflüsse ($692 Mio.): Investoren zogen mehr Geld aus BTC-ETFs ab als sie einzahlten. 6 Wochen in Folge Abflüsse = institutionelle Verkäufer dominieren den Markt.
• "Basically zero" ETF-Wachstum: Die ursprüngliche Thesis war, dass ETFs permanent neue Käufer bringen. Das trifft aktuell nicht zu — ETFs sind eher Verkäufer.

📈 Auswirkung:
Strukturell bearisch für BTC kurzfristig. Erst wenn ETF-Flows wieder positiv werden, ändert sich das übergeordnete Bild.`,
   impact:"bearisch strukturell",impactCol:C.bear},
  {tag:"REGULIERUNG",date:"25.06.",icon:"⚖️",
   title:"CLARITY Act auf Herbst verschoben — Binance EU-Deadline 30.6.",
   summary:"Senatsopposition. Binance sucht Alternativwege für EU-Nutzer bis 30.6.",
   full:`Der CLARITY Act — das wichtigste US-Krypto-Regulierungsgesetz seit Jahren — wird wahrscheinlich auf die Herbst-Session verschoben.

📌 Begriffe erklärt:
• CLARITY Act: US-Gesetz das klären soll, welche Kryptowährungen als Wertpapiere (SEC-Kontrolle) und welche als Rohstoffe (CFTC-Kontrolle) gelten. Massive Rechtsunsicherheit würde damit enden.
• MiCA (EU): Markets in Crypto-Assets — das europäische Krypto-Regulierungsframework. Bereits in Kraft. Alle Krypto-Börsen brauchen eine MiCA-Lizenz für EU-Betrieb.
• Binance EU-Deadline: Binance muss bis 30. Juni eine MiCA-konforme Lizenz vorweisen oder EU-Services einstellen. Millionen EU-Nutzer betroffen.

📈 Auswirkung:
CLARITY-Verschiebung entfernt kurzfristigen Policy-Tailwind. Binance-Lizenz-Problem könnte kurzfristig Sell-Druck durch erzwungene Nutzer-Exits erzeugen.`,
   impact:"neutral bis leicht bearisch",impactCol:C.gold},
  {tag:"MAKRO",date:"25.06.",icon:"📉",
   title:"PCE Mai: Kern +3,4% YoY — Sep-Hike 63%, Dez 80%",
   summary:"Personal Spending +0,7% MoM (beat). Kein Bounce für Krypto trotz neutraler Daten.",
   full:`Der PCE-Preisindex (Fed's bevorzugtes Inflationsmaß) für Mai: Kern +3,4% YoY — genau wie erwartet.

📌 Begriffe erklärt:
• PCE (Personal Consumption Expenditures): Misst Inflation aus Konsumentenperspektive. Die Fed bevorzugt PCE gegenüber CPI da er breiter gefasst ist.
• Kern-PCE: PCE ohne Nahrung und Energie (volatile Komponenten). Das ist das eigentliche Fed-Ziel (2% langfristig).
• Fed Funds Rate / Hike: Der US-Leitzins. "Hike" = Zinserhöhung. Bei höheren Zinsen wird Kredit teurer → weniger Risikobereitschaft → Krypto leidet.
• Dot Plot (abgeschafft von Warsh): War die Prognose aller Fed-Mitglieder für zukünftige Zinsen. Warsh hat das abgeschafft — mehr Unsicherheit für Märkte.

📈 Auswirkung:
PCE wie erwartet → kein September-Hike-Schock, aber auch keine Erleichterung. Markt bleibt in Warteposition bis CPI 14. Juli.`,
   impact:"neutral",impactCol:C.gold},
  {tag:"AKTIEN",date:"24.06.",icon:"🤖",
   title:"Micron: EPS +24%, Q4-Guidance $50 Mrd. — AI-Thesis bestätigt",
   summary:"MU EPS $25,11 vs. $20,20. Revenue $41,5 Mrd. MU +14,6% AH. Anthropic-Chip-Deal.",
   full:`Micron Technology lieferte einen der stärksten Quartalsberichte der Unternehmensgeschichte.

📌 Begriffe erklärt:
• EPS (Earnings Per Share): Gewinn pro Aktie. $25,11 vs. $20,20 erwartet = +24% Beat.
• HBM (High Bandwidth Memory): Spezielle RAM-Chips für KI-Training (Nvidia, AMD). Microns HBM-Kapazität bis 2026 ausverkauft = massive AI-Nachfrage bestätigt.
• Guidance: Ausblick des Unternehmens für nächstes Quartal. Q4-Guidance $50 Mrd. vs. $43,4 Mrd. erwartet = massiver Upside-Surprise.
• Risk-on/Risk-off: Marktphasen. Risk-on = Investoren kaufen risikoreiche Assets (Aktien, Krypto). Micron-Beat = Risk-on-Impuls.

📈 Auswirkung:
Bestätigt AI-CAPEX-Investitions-Thesis strukturell. BTC bouncte von $58.189 auf $63.500 nach dem Beat — zeigt wie direkt Krypto-Sentiment mit Tech-Earnings korreliert.`,
   impact:"bullisch Risk-on",impactCol:C.bull},
  {tag:"KRYPTO",date:"26.06.",icon:"🌐",
   title:"KG Group (Südkorea): Solana-Payments-Netzwerk MOU",
   summary:"KG Group + Solana Foundation MOU. Zweites großes koreanisches Unternehmen auf Solana.",
   full:`KG Group — eines der größten südkoreanischen Konglomerate — unterzeichnete einen MOU (Memorandum of Understanding) mit der Solana Foundation für ein SOL-basiertes Digital-Asset-Payments-Netzwerk.

📌 Begriffe erklärt:
• MOU (Memorandum of Understanding): Absichtserklärung / Vorvertrag. Kein definitiver Vertrag, aber zeigt ernsthafte Intention beider Parteien.
• Payments-Netzwerk auf Solana: Nutzt Solanas niedrige Transaktionsgebühren (~$0,0001) und hohe Geschwindigkeit (65.000 TPS) für Zahlungsabwicklung.
• Toss Bank: Südkoreas größte digitale Bank — hat ebenfalls eine Solana-Validator-Node. KG Group ist bereits das zweite große koreanische Unternehmen.

📈 Auswirkung:
Strukturell bullisch für SOL-Ecosystem. Zeigt reale Adoption in Asien. Kombiniert mit Bloomberg 95% ETF-Approval-Wahrscheinlichkeit und Forward Industries Treasury (6,9 Mio. SOL) ist das fundamentale Basis für SOL-Outperformance.`,
   impact:"bullisch strukturell SOL",impactCol:C.bull},
];

// ── KALENDER ──────────────────────────────────────────────────────────────────
const CAL_EVENTS={
  "2026-06-30":[
    {imp:"M",time:"—",name:"Binance EU-MiCA-Deadline",short:"Lizenz oder Service-Stop",
     detail:"Binance muss bis heute eine MiCA-konforme EU-Lizenz vorweisen. Ohne Lizenz müssen Services für Millionen EU-Nutzer eingestellt werden.\n\n⚡ BTC/ETH-Impact: Lizenz-Verlust → kurzfristiger Sell-Druck durch erzwungene Exits. Gesichert → kein Impact."},
    {imp:"M",time:"16:00",name:"US Consumer Confidence (Juni)",short:"Konsument-Stimmungsbarometer",
     detail:"Misst wie optimistisch US-Konsumenten über die Wirtschaft sind. Nach dem hawkishen Fed-Schock und PCE-Daten besonders beachtet.\n\n⚡ Impact: Schwach → Rezessionsangst steigt, Risk-off. Stark → Soft-Landing-Narrativ gestützt."},
  ],
  "2026-07-03":[
    {imp:"M",time:"AH",name:"Nike + Constellation Brands Earnings",short:"Consumer-Spending-Test",
     detail:"Consumer-Earnings als Proxy für reale Wirtschaftsstärke. Nach Personal Spending Beat (+0,7%) interessant ob Stärke anhält.\n\n⚡ Impact: Beat → Soft-Landing gestützt, Risk-on. Miss → Rezessionssorgen steigen."},
  ],
  "2026-07-14":[
    {imp:"H",time:"14:30",name:"US CPI Juni — Ölpreis-Entlastung?",short:"Wichtigster Makro-Event Juli",
     detail:"CPI (Consumer Price Index) misst Inflation aus Konsumentensicht. WTI Öl fiel von >$100 (Kriegspeak) auf $72 (-40%). Diese Energiedeflation sollte Juni-CPI deutlich drücken — möglicherweise unter 3,8%.\n\n⚡ BTC/ETH-Impact: CPI < 3,8% → September-Hike unter 50%, BTC Short-Squeeze möglich, Gold-Rally. CPI über Erwartung → weiterer Druck auf alle Risk-Assets."},
  ],
  "2026-07-28":[
    {imp:"H",time:"20:00",name:"FOMC (Warsh) — Erster möglicher Hike",short:"Fed-Entscheidung Juli",
     detail:"Deutsche Bank erwartet ersten 25bp-Hike auf 3,75–4,00%. Bank of America sogar 3 Hikes 2026 gesamt. PCE und CPI-Daten bis dahin entscheiden den Pfad.\n\n⚡ BTC/ETH-Impact: Hike + hawkischer Ton = ernsthafter Sell-off. Überraschende Pause = Short-Squeeze möglich."},
  ],
  "2026-08-26":[
    {imp:"M",time:"AH",name:"Nvidia Q3 Earnings",short:"AI-Sektor Stimmungsbarometer",
     detail:"Nvidia gilt als ultimativer Proxy für AI-CAPEX-Stärke. Nach Micron-Beat sind Erwartungen hoch.\n\n⚡ Impact: Beat → Risk-on stützt Krypto. Miss → AI-Bubble-Narrativ kehrt zurück, breiter Risk-off."},
  ],
};
const WEEK_DAYS=["Mo","Di","Mi","Do","Fr","Sa","So"];

// ── UTILS ─────────────────────────────────────────────────────────────────────
const BIAS_COL={bull:C.bull,neutral:C.gold,bear:C.bear};
const DIR_ICON={bull:"▲",neutral:"◆",bear:"▼"};
const IMP_COL={H:C.bear,M:C.gold,L:C.blue};

// ── AI REFRESH ────────────────────────────────────────────────────────────────
async function doRefresh(setSnap,setNews,setLoading,setError,setLastUpd){
  setLoading(true);setError(null);
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
        tools:[{type:"web_search_20250305",name:"web_search"}],
        messages:[{role:"user",content:`Suche jetzt im Web nach aktuellen Preisen. Antworte NUR mit JSON ohne Backticks.
Such: Bitcoin Preis USD, Ethereum Preis, Solana Preis, Gold Preis, Silber Preis, aktuelle Krypto-News heute.
JSON: {"time":"Datum Uhrzeit MESZ","signals":[{"id":"btc","label":"BTC","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"eth","label":"ETH","price":"PREIS","chg24":ZAHL,"bias":"bear"},{"id":"sol","label":"SOL","price":"PREIS","chg24":ZAHL,"bias":"bull"},{"id":"gold","label":"GOLD","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"silver","label":"SILBER","price":"PREIS","chg24":ZAHL,"bias":"neutral"},{"id":"makro","label":"MAKRO","price":"S&P PREIS","chg24":null,"bias":"neutral"}],"news":[{"tag":"TAG","date":"Datum","icon":"Emoji","title":"Titel","summary":"1 Satz","full":"Volltext mit Erklärungen","impact":"Auswirkung","impactCol":"#3ddc84 oder #ff4d6d oder #f0b429"}]}`}]}),
    });
    if(!res.ok)throw new Error(`Status ${res.status}`);
    const raw=await res.json();
    const txt=raw.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
    const m=txt.match(/\{[\s\S]*\}/);
    if(!m)throw new Error("Kein JSON");
    const d=JSON.parse(m[0]);
    if(d.signals)setSnap({time:d.time||"Live",signals:d.signals});
    if(d.news)setNews(d.news);
    setLastUpd(new Date().toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"}));
  }catch(e){setError(`${e.message} — Fallback aktiv`);}
  finally{setLoading(false);}
}

// ── LINE CHART ────────────────────────────────────────────────────────────────
function AssetLineChart({data,levels=[],unit="$",color=C.gold,h=220}){
  if(!data||!data.length)return null;
  const vals=data.map(d=>d.p),mn=Math.min(...vals),mx=Math.max(...vals),pad=(mx-mn)*0.12;
  return(
    <ResponsiveContainer width="100%" height={h}>
      <LineChart data={data} margin={{top:8,right:8,left:0,bottom:4}}>
        <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
        <YAxis domain={[mn-pad,mx+pad]} tick={{fill:C.textLow,fontSize:10}} width={62}
          tickFormatter={v=>`${unit}${v>=1000?Math.round(v).toLocaleString("de-DE"):parseFloat(v.toFixed(2))}`}
          axisLine={{stroke:C.border}} tickLine={false}/>
        <XAxis dataKey="t" tick={{fill:C.textLow,fontSize:9}} axisLine={{stroke:C.border}} tickLine={false} interval="preserveStartEnd"/>
        <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.borderHi}`,borderRadius:6,fontSize:11,color:C.textHi}}
          formatter={v=>[`${unit}${v.toLocaleString("de-DE")}`,""]} labelStyle={{color:C.textMid}}/>
        {levels.map((lv,i)=><ReferenceLine key={i} y={lv.v} stroke={lv.col} strokeDasharray="5 3" strokeWidth={1.2}
          label={{value:lv.lbl,position:"insideTopLeft",fill:lv.col,fontSize:9,fontWeight:600}}/>)}
        <Line type="monotone" dataKey="p" stroke={color} strokeWidth={2.2} dot={false} isAnimationActive={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── FOKUS MODAL ───────────────────────────────────────────────────────────────
function FocusModal({asset,onClose}){
  const a=asset;
  const bc=BIAS_COL[a.bias]||C.gold;
  const lc=a.bias==="bull"?C.bull:a.bias==="bear"?C.bear:C.gold;
  const [view,setView]=useState("4h");
  useEffect(()=>{document.body.style.overflow="hidden";return()=>{document.body.style.overflow="";};},[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px",overflowY:"auto"}}>
      <div style={{background:C.card,border:`1px solid ${bc}55`,borderRadius:14,width:"100%",maxWidth:900,padding:"24px 28px",position:"relative"}}>
        {/* Close */}
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,width:36,height:36,color:C.textMid,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>

        {/* Header */}
        <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:6}}>
          <span style={{fontSize:32}}>{a.emoji}</span>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:26,color:C.textHi,margin:0}}>{a.name}</h2>
          <span style={{fontSize:13,color:C.textLow}}>{a.ticker}</span>
          <span style={{fontSize:12,fontWeight:700,color:bc,border:`1px solid ${bc}44`,borderRadius:5,padding:"2px 9px"}}>{DIR_ICON[a.bias]} {a.bias==="bull"?"BULL":a.bias==="bear"?"BEAR":"NEUTRAL"}</span>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"baseline",marginBottom:20}}>
          <span style={{fontSize:34,fontWeight:700,color:C.textHi,fontVariantNumeric:"tabular-nums"}}>{a.unit}{a.price}</span>
          <span style={{fontSize:15,fontWeight:700,color:a.chg24>=0?C.bull:C.bear}}>{a.chg24>=0?"+":""}{a.chg24}% 24h</span>
          <span style={{fontSize:13,fontWeight:600,color:a.chg7>=0?C.bull:C.bear}}>{a.chg7>=0?"+":""}{a.chg7}% 7D</span>
        </div>

        {/* Key Stats Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
          {a.keyStats.map(([k,v],i)=>(
            <div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:C.textLow,marginBottom:3}}>{k}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.textHi,fontVariantNumeric:"tabular-nums"}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Chart Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {[["4h","4H-Chart"],["daily","Daily (6 Mon.)"],["tv","TradingView Live"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} disabled={v==="4h"&&!a.path4h} style={{
              flex:1,padding:"8px 0",background:view===v?C.surface:"transparent",
              border:view===v?`1px solid ${C.gold}55`:`1px solid ${C.border}`,
              borderRadius:7,color:view===v?C.gold:C.textMid,fontSize:12,fontWeight:600,cursor:"pointer",
              opacity:v==="4h"&&!a.path4h?0.4:1,
            }}>{l}</button>
          ))}
        </div>

        {view==="4h"&&a.path4h&&<AssetLineChart data={a.path4h} levels={a.levels} unit={a.unit} color={lc} h={300}/>}
        {view==="daily"&&<AssetLineChart data={a.pathD} unit={a.unit} color={lc} h={300}/>}
        {view==="tv"&&(
          <div style={{height:400,background:C.surface,borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:28}}>{a.emoji}</div>
            <div style={{fontSize:14,color:C.textMid,textAlign:"center",maxWidth:400,lineHeight:1.6}}>
              Dein gespeicherter TradingView-Chart mit Wellenzählung<br/>
              <span style={{color:C.textLow,fontSize:12}}>(öffnet in neuem Tab)</span>
            </div>
            <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{
              background:C.blue,color:"#fff",textDecoration:"none",
              padding:"10px 24px",borderRadius:8,fontSize:13,fontWeight:700,
              display:"flex",alignItems:"center",gap:8,
            }}>
              📊 Chart öffnen — {a.ticker}
            </a>
          </div>
        )}

        {/* Wave Analysis */}
        <div style={{marginTop:16,padding:"14px 16px",background:C.surface,borderRadius:9,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:6}}>{a.wave}</div>
          <p style={{fontSize:12.5,color:C.textMid,lineHeight:1.7,margin:0}}>{a.waveDetail}</p>
        </div>

        {/* TV Link */}
        <div style={{marginTop:14,display:"flex",gap:10}}>
          <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{
            display:"flex",alignItems:"center",gap:6,padding:"8px 14px",
            background:C.surface,border:`1px solid ${C.blue}55`,borderRadius:7,
            color:C.blue,fontSize:12,fontWeight:600,textDecoration:"none",
          }}>📊 In TradingView öffnen (deine Zählung) →</a>
        </div>
      </div>
    </div>
  );
}

// ── AMPEL LEISTE ──────────────────────────────────────────────────────────────
function BiasStrip({signals,isMobile}){
  return(
    <div style={{display:"grid",gridTemplateColumns:`repeat(${isMobile?3:6},1fr)`,gap:6,marginBottom:16}}>
      {signals.map(s=>{
        const bc=BIAS_COL[s.bias]||C.gold;
        return(
          <div key={s.id} style={{background:C.card,border:`1px solid ${bc}55`,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:10,fontWeight:800,color:bc,letterSpacing:"0.03em"}}>{s.label}</div>
            {s.price&&<div style={{fontSize:10,fontWeight:700,color:C.textHi,marginTop:1,lineHeight:1.2,wordBreak:"break-all",fontVariantNumeric:"tabular-nums"}}>{s.price}</div>}
            <div style={{fontSize:14,color:bc,lineHeight:1,marginTop:1}}>{DIR_ICON[s.bias]||"◆"}</div>
            {s.chg24!==null&&<div style={{fontSize:9,color:s.chg24>=0?C.bull:C.bear,marginTop:1,fontVariantNumeric:"tabular-nums"}}>{s.chg24>0?"+":""}{s.chg24}%</div>}
          </div>
        );
      })}
    </div>
  );
}

// ── ASSET MINI CARD (Märkte-Tab) ──────────────────────────────────────────────
function AssetMiniCard({a,onFocus}){
  const bc=BIAS_COL[a.bias]||C.gold;
  const lc=a.bias==="bull"?C.bull:a.bias==="bear"?C.bear:C.gold;
  const [hovered,setHovered]=useState(false);
  return(
    <div
      onClick={()=>onFocus(a)}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        background:hovered?C.cardHover:C.card,
        border:`1px solid ${hovered?bc:C.border}`,
        borderRadius:10,padding:"14px 16px",cursor:"pointer",
        transition:"all 0.18s ease",transform:hovered?"translateY(-2px)":"none",
        boxShadow:hovered?`0 8px 24px rgba(0,0,0,0.4)`:"none",
      }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>{a.emoji}</span>
            <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:600,color:C.textHi}}>{a.name}</span>
            <span style={{fontSize:10,color:C.textLow}}>{a.ticker}</span>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:4}}>
            <span style={{fontSize:20,fontWeight:700,color:C.textHi,fontVariantNumeric:"tabular-nums"}}>{a.unit}{a.price}</span>
            <span style={{fontSize:11,fontWeight:700,color:a.chg24>=0?C.bull:C.bear}}>{a.chg24>=0?"+":""}{a.chg24}% 24h</span>
            <span style={{fontSize:10,fontWeight:600,color:a.chg7>=0?C.bull:C.bear}}>{a.chg7>=0?"+":""}{a.chg7}% 7D</span>
          </div>
        </div>
        <span style={{fontSize:11,fontWeight:700,color:bc,border:`1px solid ${bc}44`,borderRadius:5,padding:"2px 8px",flexShrink:0}}>
          {DIR_ICON[a.bias]} {a.bias==="bull"?"BULL":a.bias==="bear"?"BEAR":"NEUTRAL"}
        </span>
      </div>
      {/* Mini Chart */}
      <AssetLineChart data={a.path4h||a.pathD} levels={[]} unit={a.unit} color={lc} h={90}/>
      {/* Wave label */}
      <div style={{marginTop:8,fontSize:11,color:C.gold,fontWeight:600,lineHeight:1.4}}>{a.wave.split("—")[0]}</div>
      {/* Click hint */}
      <div style={{marginTop:6,fontSize:10,color:hovered?C.blue:C.textLow,transition:"color 0.18s"}}>
        {hovered?"→ Klick für Fokus-Ansicht":"Klicken für Details & Chart"}
      </div>
    </div>
  );
}

// ── NEWS CARD ─────────────────────────────────────────────────────────────────
function NewsCard({n}){
  const [expanded,setExpanded]=useState(false);
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",transition:"all 0.2s"}}>
      {/* Header (immer sichtbar) */}
      <div onClick={()=>setExpanded(!expanded)} style={{padding:"14px 16px",cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>{n.icon||"📰"}</span>
            <span style={{fontSize:10,fontWeight:700,color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:4,padding:"1px 7px",letterSpacing:"0.05em"}}>{n.tag}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:10,color:C.textLow}}>{n.date}</span>
            <span style={{fontSize:11,fontWeight:700,color:n.impactCol||C.gold,border:`1px solid ${n.impactCol||C.gold}44`,borderRadius:4,padding:"1px 7px"}}>{n.impact||""}</span>
            <span style={{fontSize:16,color:C.textLow,transition:"transform 0.2s",display:"inline-block",transform:expanded?"rotate(180deg)":"none"}}>⌄</span>
          </div>
        </div>
        <div style={{fontFamily:"Georgia,serif",fontSize:14.5,color:C.textHi,fontWeight:600,marginBottom:5}}>{n.title}</div>
        <p style={{fontSize:12,color:C.textMid,lineHeight:1.55,margin:0}}>{n.summary}</p>
      </div>

      {/* Expanded Content */}
      {expanded&&(
        <div style={{borderTop:`1px solid ${C.border}`,padding:"16px 16px 14px",background:C.surface}}>
          {n.full.split("\n").filter(Boolean).map((line,i)=>{
            const isHeader=line.startsWith("📌")||line.startsWith("📈")||line.startsWith("⚡");
            const isBullet=line.startsWith("•");
            return(
              <p key={i} style={{
                fontSize:isHeader?12.5:isBullet?12:12,
                fontWeight:isHeader?700:400,
                color:isHeader?C.gold:isBullet?C.textHi:C.textMid,
                lineHeight:1.7,
                margin:0,marginBottom:isHeader?6:4,
                paddingLeft:isBullet?12:0,
              }}>{line}</p>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SETUP CARD ────────────────────────────────────────────────────────────────
function SetupCard({s}){
  const isLong=s.type==="long",col=isLong?C.bull:C.bear;
  return(
    <div style={{background:C.bg,border:`1px solid ${col}33`,borderRadius:9,padding:14}}>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:7,marginBottom:8}}>
        <span style={{fontSize:10,fontWeight:800,color:col,border:`1px solid ${col}55`,borderRadius:4,padding:"2px 9px",letterSpacing:"0.05em"}}>{isLong?"LONG":"SHORT"}</span>
        <span style={{fontSize:10,color:C.textMid,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 8px"}}>{s.tf}</span>
        <span style={{fontSize:13,fontWeight:600,color:C.textHi,flex:1}}>{s.label}</span>
      </div>
      {s.isBWave&&<div style={{background:"#1a1400",border:`1px solid ${C.gold}44`,borderRadius:6,padding:"6px 10px",marginBottom:9,fontSize:11,color:C.gold}}>⚠️ Kontra-Trend / B-Welle — kleiner Size, enger Stop</div>}
      <div style={{fontSize:11,fontStyle:"italic",color:C.gold,marginBottom:10}}>{s.wave}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
        {[["ENTRY",s.entry,C.textHi],["STOP",s.stop,C.bear],["ZIEL 1",s.t1,C.bull],["ZIEL 2",s.t2,C.bull]].map(([l,v,c])=>(
          <div key={l} style={{background:C.surface,borderRadius:6,padding:"7px 10px"}}>
            <div style={{fontSize:9,color:C.textLow,letterSpacing:"0.05em",marginBottom:2}}>{l}</div>
            <div style={{fontSize:11.5,fontWeight:700,color:c,fontVariantNumeric:"tabular-nums"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <div style={{background:C.surface,borderRadius:6,padding:"6px 10px",flex:1}}>
          <div style={{fontSize:9,color:C.textLow,marginBottom:1}}>CRV</div>
          <div style={{fontSize:12,fontWeight:700,color:C.gold}}>{s.crv}</div>
        </div>
        <div style={{background:C.surface,borderRadius:6,padding:"6px 10px",flex:2}}>
          <div style={{fontSize:9,color:C.textLow,marginBottom:1}}>DAUER</div>
          <div style={{fontSize:11,color:C.textMid,fontWeight:600}}>{s.duration}</div>
        </div>
      </div>
      <div style={{background:C.surface,borderRadius:7,padding:"8px 12px",marginBottom:10}}>
        <div style={{fontSize:9,color:C.textLow,fontWeight:700,letterSpacing:"0.05em",marginBottom:6}}>CONFLUENCE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px"}}>
          {s.confluence.map(([k,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:10,color:C.textMid}}>{k}</span>
              <span style={{fontSize:10,color:C.textHi,fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{fontSize:12,color:C.textMid,lineHeight:1.55,marginBottom:8}}>{s.exec}</div>
      <div style={{fontSize:11,color:C.textLow,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
        <span style={{fontWeight:700,color:C.textMid}}>Invalidiert: </span>{s.invalid}
      </div>
    </div>
  );
}

function TradeGroup({g}){
  const [open,setOpen]=useState(g.asset==="Solana");
  return(
    <div style={{background:C.card,border:`1px solid ${g.biasCol}33`,borderRadius:10,padding:"14px 16px 12px"}}>
      <div onClick={()=>setOpen(!open)} style={{cursor:"pointer",userSelect:"none",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:600,color:C.textHi}}>{g.asset}</span>
            <span style={{fontSize:10,color:C.textLow}}>{g.ticker}</span>
            <span style={{fontSize:10,fontWeight:700,color:g.biasCol,border:`1px solid ${g.biasCol}44`,borderRadius:4,padding:"1px 7px"}}>{g.priority}</span>
          </div>
          <div style={{fontSize:11,color:C.textMid,marginTop:3}}>{g.note}</div>
        </div>
        <span style={{color:C.textLow,fontSize:20,marginLeft:10}}>{open?"−":"+"}</span>
      </div>
      {open&&<div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>{g.setups.map((s,i)=><SetupCard key={i} s={s}/>)}</div>}
    </div>
  );
}

// ── KALENDER WOCHENANSICHT ────────────────────────────────────────────────────
function CalendarView(){
  const [selectedEvent,setSelectedEvent]=useState(null);
  const weeks=[
    {label:"KW 27 — 30. Jun",days:["2026-06-29","2026-06-30","2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05"]},
    {label:"KW 28 — 6. Jul",days:["2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12"]},
    {label:"KW 29 — 13. Jul",days:["2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19"]},
    {label:"KW 30 — 27. Jul",days:["2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02"]},
    {label:"KW 35 — 24. Aug",days:["2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30"]},
  ];
  return(
    <div>
      {/* Legende */}
      <div style={{display:"flex",gap:16,fontSize:11,color:C.textMid,marginBottom:14}}>
        {[["H","Hoch",C.bear],["M","Mittel",C.gold],["L","Niedrig",C.blue]].map(([k,l,c])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:8,height:8,borderRadius:2,background:c,display:"inline-block"}}/>{l}
          </div>
        ))}
        <span style={{color:C.textLow,marginLeft:"auto"}}>Klick auf Event für Details</span>
      </div>

      {/* Wochen */}
      {weeks.map((week,wi)=>(
        <div key={wi} style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textLow,letterSpacing:"0.06em",marginBottom:6}}>{week.label}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {WEEK_DAYS.map((day,di)=>{
              const dateStr=week.days[di];
              const events=CAL_EVENTS[dateStr]||[];
              const hasHigh=events.some(e=>e.imp==="H");
              const hasMid=events.some(e=>e.imp==="M");
              return(
                <div key={di} style={{
                  background:events.length?C.card:C.surface,
                  border:`1px solid ${hasHigh?C.bear:hasMid?C.gold:C.border}`,
                  borderRadius:7,padding:"6px 5px",minHeight:64,
                  cursor:events.length?"pointer":"default",
                  transition:"all 0.15s",
                  opacity:events.length?1:0.4,
                }}
                  onMouseEnter={e=>{if(events.length)e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";}}
                >
                  <div style={{fontSize:9,color:C.textLow,marginBottom:3}}>{day}</div>
                  <div style={{fontSize:9,color:C.textLow,marginBottom:4}}>{dateStr.split("-")[2]+"."}</div>
                  {events.map((ev,ei)=>(
                    <div key={ei} onClick={()=>setSelectedEvent(ev)}
                      style={{background:IMP_COL[ev.imp]||C.gold,borderRadius:3,padding:"2px 4px",marginBottom:2,cursor:"pointer"}}>
                      <div style={{fontSize:8,color:"#000",fontWeight:700,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.name}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Event Detail Modal */}
      {selectedEvent&&(
        <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
          onClick={()=>setSelectedEvent(null)}>
          <div style={{background:C.card,border:`1px solid ${IMP_COL[selectedEvent.imp]}55`,borderRadius:12,padding:"20px 24px",maxWidth:500,width:"100%",position:"relative"}}
            onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setSelectedEvent(null)} style={{position:"absolute",top:12,right:12,background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,width:30,height:30,color:C.textMid,fontSize:16,cursor:"pointer"}}>✕</button>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{width:8,height:8,borderRadius:2,background:IMP_COL[selectedEvent.imp],display:"inline-block",flexShrink:0}}/>
              <span style={{fontSize:11,color:C.textLow}}>{selectedEvent.time}</span>
              <span style={{fontSize:11,fontWeight:700,color:C.textLow}}>Impact: {selectedEvent.imp==="H"?"Hoch":selectedEvent.imp==="M"?"Mittel":"Niedrig"}</span>
            </div>
            <div style={{fontFamily:"Georgia,serif",fontSize:17,color:C.textHi,fontWeight:600,marginBottom:10}}>{selectedEvent.name}</div>
            {selectedEvent.detail.split("\n").filter(Boolean).map((line,i)=>{
              const isImpact=line.startsWith("⚡");
              return(
                <p key={i} style={{fontSize:12.5,color:isImpact?C.gold:C.textMid,fontWeight:isImpact?600:400,lineHeight:1.65,margin:0,marginBottom:4}}>{line}</p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── HAUPT APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const isMobile=useIsMobile();
  const [tab,setTab]=useState("markets");
  const [snap,setSnap]=useState(SNAP_DEFAULT);
  const [news,setNews]=useState(NEWS_DEFAULT);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [lastUpd,setLastUpd]=useState(null);
  const [focusAsset,setFocusAsset]=useState(null);

  const handleRefresh=useCallback(()=>{doRefresh(setSnap,setNews,setLoading,setError,setLastUpd);},[]);
  const sigs=snap.signals||SNAP_DEFAULT.signals;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.textHi,fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>
      <div style={{maxWidth:1400,margin:"0 auto",padding:isMobile?"14px 12px 60px":"22px 36px 60px"}}>

        {/* ── HEADER ── */}
        <div style={{borderBottom:`1px solid ${C.border}`,paddingBottom:14,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <div>
              <h1 style={{fontFamily:"Georgia,serif",fontSize:isMobile?20:28,margin:0,color:C.textHi,letterSpacing:"0.01em"}}>
                Guido's Market Briefing
              </h1>
              <div style={{fontSize:11,color:C.textLow,marginTop:3}}>
                {lastUpd?`🟢 Live: ${lastUpd} MESZ`:snap.time} · Elliott-Wave · 1H/2H Trades
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <a href="https://terminal.mcoglobal.live/" target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:6,background:C.surface,border:`1px solid ${C.purple}55`,borderRadius:8,padding:"8px 14px",textDecoration:"none",color:C.purple,fontSize:12,fontWeight:700}}>
                🔗 {isMobile?"MCO":"MCO Terminal"}
              </a>
              <button onClick={handleRefresh} disabled={loading}
                style={{background:C.surface,border:`1px solid ${loading?C.textLow:C.gold}`,borderRadius:8,padding:"8px 14px",color:loading?C.textLow:C.gold,fontSize:12,fontWeight:700,cursor:loading?"wait":"pointer",display:"flex",alignItems:"center",gap:6}}>
                {loading?"⟳":"🔄"}{isMobile?"":" Live Update"}
              </button>
            </div>
          </div>
          {error&&<div style={{marginTop:8,padding:"6px 12px",background:"#180808",border:`1px solid ${C.bear}44`,borderRadius:6,fontSize:11,color:C.bear}}>{error}</div>}
          {loading&&<div style={{marginTop:8,padding:"7px 12px",background:C.surface,border:`1px solid ${C.gold}33`,borderRadius:6,fontSize:11,color:C.textMid}}>🔍 Claude sucht BTC · ETH · SOL · Gold · Silber + News...</div>}
        </div>

        {/* ── AMPEL ── */}
        <BiasStrip signals={sigs} isMobile={isMobile}/>

        {/* ── TABS ── */}
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[["markets","Märkte"],["trades","Trades"],["news","News"],["calendar","Kalender"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              flex:1,padding:"10px 0",background:tab===id?C.surface:"transparent",
              border:tab===id?`1px solid ${C.gold}55`:`1px solid ${C.border}`,
              borderRadius:8,color:tab===id?C.gold:C.textMid,
              fontSize:isMobile?12:13,fontWeight:600,cursor:"pointer",
              transition:"all 0.15s",
            }}>{lbl}</button>
          ))}
        </div>

        {/* ── MÄRKTE ── */}
        {tab==="markets"&&(
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
            <div>
              <div style={{fontSize:10.5,color:C.textLow,letterSpacing:"0.06em",fontWeight:700,marginBottom:10}}>KRYPTO — Klicken für Fokus-Ansicht</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {ASSETS.filter(a=>["sol","btc","eth"].includes(a.id)).map(a=>(
                  <AssetMiniCard key={a.id} a={a} onFocus={setFocusAsset}/>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:10.5,color:C.textLow,letterSpacing:"0.06em",fontWeight:700,marginBottom:10}}>ROHSTOFFE — Klicken für Fokus-Ansicht</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                {ASSETS.filter(a=>["gold","silver"].includes(a.id)).map(a=>(
                  <AssetMiniCard key={a.id} a={a} onFocus={setFocusAsset}/>
                ))}
              </div>
              <div style={{fontSize:10.5,color:C.textLow,letterSpacing:"0.06em",fontWeight:700,marginBottom:10}}>MAKRO</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                {[{n:"S&P 500",p:"7.354",ch:-0.05},{n:"WTI Öl",p:"$71,90",ch:+0.3},{n:"DXY",p:"101,6",ch:+0.4},{n:"10Y Yield",p:"4,46%",ch:+0.02},{n:"VIX",p:"18,89",ch:-1.2},{n:"BTC Dom.",p:"52,4%",ch:+0.3}].map(m=>(
                  <div key={m.n} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 11px",transition:"background 0.15s"}}>
                    <div style={{fontSize:10.5,fontWeight:600,color:C.textMid}}>{m.n}</div>
                    <div style={{fontSize:15,fontWeight:700,color:C.textHi,marginTop:2,fontVariantNumeric:"tabular-nums"}}>{m.p}</div>
                    <div style={{fontSize:12,fontWeight:700,color:m.ch>=0?C.bull:C.bear,marginTop:1}}>{m.ch>=0?"▲":"▼"} {Math.abs(m.ch)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TRADES ── */}
        {tab==="trades"&&(
          <div>
            <div style={{background:C.surface,border:`1px solid ${C.gold}33`,borderRadius:9,padding:"10px 14px",marginBottom:12,fontSize:12,color:C.textMid,lineHeight:1.55}}>
              <span style={{color:C.gold,fontWeight:700}}>Cross-Check · keine Empfehlung. </span>
              SOL (⭐) → Gold (💡) → BTC (⏸) → ETH (⛔). 1H/2H Setups mit Confluence-Tabelle.
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
              {TRADES.map(g=><TradeGroup key={g.asset} g={g}/>)}
            </div>
          </div>
        )}

        {/* ── NEWS ── */}
        {tab==="news"&&(
          <div>
            <div style={{fontSize:11,color:C.textLow,marginBottom:12}}>Klick auf eine News für vollständige Analyse mit Fachbegriff-Erklärungen ↓</div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,alignItems:"start"}}>
              {news.map((n,i)=><NewsCard key={i} n={n}/>)}
            </div>
          </div>
        )}

        {/* ── KALENDER ── */}
        {tab==="calendar"&&<CalendarView/>}

        <div style={{marginTop:28,fontSize:10,color:C.textLow,textAlign:"center",lineHeight:1.6}}>
          Snapshot · keine Anlageberatung · Elliott-Wave subjektiv · 🔄 für Live-Preise · Klick auf Asset für Fokus-Ansicht
        </div>
      </div>

      {/* ── FOKUS MODAL ── */}
      {focusAsset&&<FocusModal asset={focusAsset} onClose={()=>setFocusAsset(null)}/>}
    </div>
  );
}
