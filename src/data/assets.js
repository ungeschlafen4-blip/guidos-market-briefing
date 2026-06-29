// ─────────────────────────────────────────────────────────────────────────────
// ASSETS v3 — Mit langfristigen Charts (6 Monate Weekly) + TradingView-Links
// ─────────────────────────────────────────────────────────────────────────────

const COL = {
  bull:"#2ecc71", bear:"#e74c3c", gold:"#f0b429",
  blue:"#3b82f6", textMid:"#8892a4",
};

// ── KURZFRISTIG: 7-Tage Pfade ─────────────────────────────────────────────────
function gen7D(points) {
  const days = ["Mo","Di","Mi","Do","Fr","Sa","So"];
  return points.map(([h,p]) => ({
    t: h%24===0 ? days[Math.floor(h/24)%7] : h%12===0 ? `${h%24}h` : "",
    p,
  }));
}

export const BTC_7D = gen7D([[0,63200],[8,62400],[16,61000],[24,60400],[32,59400],[40,58189],[48,59100],[56,60200],[64,60100],[72,60000],[80,60300],[88,60254],[96,60254]]);
export const ETH_7D = gen7D([[0,1678],[8,1660],[16,1615],[24,1600],[32,1565],[40,1542],[48,1555],[56,1568],[64,1575],[72,1580],[80,1585],[88,1588],[96,1588]]);
export const SOL_7D = gen7D([[0,74.2],[8,72.5],[16,70.0],[24,68.5],[32,66.0],[40,64.8],[48,65.5],[56,68.2],[64,70.2],[72,71.5],[80,72.0],[88,72.2],[96,72.22]]);
export const GOLD_7D = gen7D([[0,4090],[8,4080],[16,4065],[24,4035],[32,4008],[40,3978],[48,3985],[56,3995],[64,4010],[72,4020],[80,4030],[88,4036],[96,4036]]);
export const SILVER_7D = gen7D([[0,66.2],[8,65.0],[16,63.0],[24,61.0],[32,59.0],[40,57.5],[48,57.2],[56,57.0],[64,57.0],[72,57.0],[80,57.0],[88,57.0],[96,57.0]]);

// ── LANGFRISTIG: 6-Monate Weekly (Jan–Jun 2026) ───────────────────────────────
// Echte historische Näherungswerte — kein Copy der 7-Tage-Daten!

export const BTC_WEEKLY = [
  {t:"Jan W1",p:98000},{t:"Jan W2",p:108000},{t:"Jan W3",p:118000},{t:"Jan W4",p:126080},
  {t:"Feb W1",p:120000},{t:"Feb W2",p:108000},{t:"Feb W3",p:98000},{t:"Feb W4",p:88000},
  {t:"Mär W1",p:82000},{t:"Mär W2",p:77623},{t:"Mär W3",p:73000},{t:"Mär W4",p:70000},
  {t:"Apr W1",p:68000},{t:"Apr W2",p:65076},{t:"Apr W3",p:63000},{t:"Apr W4",p:62000},
  {t:"Mai W1",p:63500},{t:"Mai W2",p:62000},{t:"Mai W3",p:61000},{t:"Mai W4",p:60500},
  {t:"Jun W1",p:62000},{t:"Jun W2",p:61000},{t:"Jun W3",p:58189},{t:"Jun W4",p:60254},
];

export const ETH_WEEKLY = [
  {t:"Jan W1",p:3680},{t:"Jan W2",p:3500},{t:"Jan W3",p:3350},{t:"Jan W4",p:3200},
  {t:"Feb W1",p:3000},{t:"Feb W2",p:2700},{t:"Feb W3",p:2400},{t:"Feb W4",p:2200},
  {t:"Mär W1",p:2000},{t:"Mär W2",p:1850},{t:"Mär W3",p:1750},{t:"Mär W4",p:1750},
  {t:"Apr W1",p:1800},{t:"Apr W2",p:1740},{t:"Apr W3",p:1700},{t:"Apr W4",p:1680},
  {t:"Mai W1",p:1700},{t:"Mai W2",p:1670},{t:"Mai W3",p:1640},{t:"Mai W4",p:1620},
  {t:"Jun W1",p:1640},{t:"Jun W2",p:1600},{t:"Jun W3",p:1542},{t:"Jun W4",p:1588},
];

export const SOL_WEEKLY = [
  {t:"Jan W1",p:198},{t:"Jan W2",p:210},{t:"Jan W3",p:220},{t:"Jan W4",p:235},
  {t:"Feb W1",p:215},{t:"Feb W2",p:190},{t:"Feb W3",p:165},{t:"Feb W4",p:145},
  {t:"Mär W1",p:128},{t:"Mär W2",p:112},{t:"Mär W3",p:100},{t:"Mär W4",p:92},
  {t:"Apr W1",p:88},{t:"Apr W2",p:82},{t:"Apr W3",p:78},{t:"Apr W4",p:74.5},
  {t:"Mai W1",p:76},{t:"Mai W2",p:72},{t:"Mai W3",p:70},{t:"Mai W4",p:68},
  {t:"Jun W1",p:72},{t:"Jun W2",p:70},{t:"Jun W3",p:64.8},{t:"Jun W4",p:72.22},
];

export const GOLD_WEEKLY = [
  {t:"Jan W1",p:3800},{t:"Jan W2",p:4000},{t:"Jan W3",p:4300},{t:"Jan W4",p:4600},
  {t:"Feb W1",p:4900},{t:"Feb W2",p:5100},{t:"Feb W3",p:5200},{t:"Feb W4",p:5050},
  {t:"Mär W1",p:4800},{t:"Mär W2",p:4500},{t:"Mär W3",p:4300},{t:"Mär W4",p:4200},
  {t:"Apr W1",p:4150},{t:"Apr W2",p:4100},{t:"Apr W3",p:4050},{t:"Apr W4",p:4100},
  {t:"Mai W1",p:4200},{t:"Mai W2",p:4300},{t:"Mai W3",p:4350},{t:"Mai W4",p:4200},
  {t:"Jun W1",p:4150},{t:"Jun W2",p:4080},{t:"Jun W3",p:3978},{t:"Jun W4",p:4036},
];

export const SILVER_WEEKLY = [
  {t:"Jan W1",p:72},{t:"Jan W2",p:85},{t:"Jan W3",p:100},{t:"Jan W4",p:121},
  {t:"Feb W1",p:112},{t:"Feb W2",p:105},{t:"Feb W3",p:98},{t:"Feb W4",p:90},
  {t:"Mär W1",p:82},{t:"Mär W2",p:76},{t:"Mär W3",p:72},{t:"Mär W4",p:70},
  {t:"Apr W1",p:68},{t:"Apr W2",p:65},{t:"Apr W3",p:63},{t:"Apr W4",p:62},
  {t:"Mai W1",p:62},{t:"Mai W2",p:61},{t:"Mai W3",p:60},{t:"Mai W4",p:59},
  {t:"Jun W1",p:60},{t:"Jun W2",p:59},{t:"Jun W3",p:57},{t:"Jun W4",p:57},
];

export const MACRO_STATS = [
  {n:"S&P 500",   p:"7.354",  ch:-0.05},
  {n:"Nasdaq",    p:"22.180", ch:-0.40},
  {n:"WTI Öl",    p:"$71,90", ch:+0.30},
  {n:"DXY",       p:"101,6",  ch:+0.40},
  {n:"10Y Yield", p:"4,46%",  ch:+0.02},
  {n:"VIX",       p:"18,89",  ch:-1.20},
];

export const ASSETS = [
  {
    id:"btc", name:"Bitcoin", ticker:"BTC/USD", emoji:"₿",
    tvLink:"https://www.tradingview.com/chart/G1bYW1gV/",      // kurzfristig (dein Chart)
    tvLinkLong:"https://www.tradingview.com/chart/E95kzPbv/",  // langfristig (dein Chart)
    unit:"$", price:"60.254", chg24:+0.3, chg7:-5.4, bias:"neutral",
    path7d:BTC_7D, pathWeekly:BTC_WEEKLY,
    levels:[
      {v:63430,col:COL.bear,lbl:"Fib 61,8%"},{v:62366,col:COL.gold,lbl:"Fib 50%"},
      {v:61000,col:COL.gold,lbl:"Fib 38,2%"},{v:60170,col:COL.bear,lbl:"Sell-Wall"},
      {v:57400,col:COL.blue,lbl:"Box-Ziel"},
    ],
    levelsWeekly:[
      {v:126080,col:COL.bear,lbl:"ATH Feb"},{v:77623,col:COL.gold,lbl:"Mär-Tief"},
      {v:62457,col:COL.bear,lbl:"200WMA"},{v:58189,col:COL.blue,lbl:"Jun-Tief"},
    ],
    currentWave:"B-Welle / (4)", waveStructure:"(A)-(B)-(C) Korrektur seit ATH",
    nextWaves:"C→$55K · Dann: neuer 5W-Impuls",
    wave:"1H/4H: Bounce in B/4-Welle — Fib $61–63K Widerstand ⚠️",
    waveWeekly:"Weekly: ABC-Korrektur nach ATH $126.080 — C-Welle Zielzone $55.000–58.000. Nach C-Ende: neuer 5-Wellen-Aufwärtsimpuls Richtung $95K–115K (Q4 2026 Szenario Benjamin Cowen).",
    waveDetail:"Fib-Band 38,2–61,8% ($61–63,4K) ist der entscheidende Widerstand. Sell-Walls $60.170–$61.200 decken sich mit Fib 38,2%. Zielzone wenn Bounce scheitert: $55.400–57.400. Bullisch erst bei Tagesschluss über $63.430.",
    reasons:[
      {icon:"📉",col:COL.bear,title:"200WMA gebrochen",text:"Erstmals seit 2022. Historisch 6–18 Monate darunter."},
      {icon:"🔴",col:COL.bear,title:"ETF-Abflüsse",text:"$692 Mio. Do. — 6 Wochen in Folge negativ."},
      {icon:"😰",col:COL.gold,title:"F&G 12",text:"Extreme Fear — contrarian bullisch aber kein Timing-Signal."},
      {icon:"🏢",col:COL.bull,title:"Corporate Accumulation",text:"Strategy + Strive kaufen weiter."},
    ],
    keyStats:[["ATH 2026","$126.080"],["Jun-Tief","$58.189"],["200WMA","$62.457"],["F&G","12"],["Sep-Hike","63%"],["ETF 7D","−$692M"]],
  },
  {
    id:"eth", name:"Ethereum", ticker:"ETH/USD", emoji:"Ξ",
    tvLink:"https://www.tradingview.com/chart/UBrQvmXY/",
    tvLinkLong:"https://www.tradingview.com/chart/ucctUcu1/",
    unit:"$", price:"1.588", chg24:+1.0, chg7:-8.2, bias:"bear",
    path7d:ETH_7D, pathWeekly:ETH_WEEKLY,
    levels:[{v:1620,col:COL.bear,lbl:"Widerstand"},{v:1542,col:COL.blue,lbl:"Tief"},{v:1500,col:COL.bull,lbl:"Support"}],
    levelsWeekly:[{v:3680,col:COL.bear,lbl:"Jan-Hoch"},{v:1740,col:COL.gold,lbl:"Mai-Tief"},{v:1542,col:COL.blue,lbl:"Jun-Tief"}],
    currentWave:"C-Welle", waveStructure:"A-B-C Korrektur von ATH $3.680",
    nextWaves:"C→$1.400–1.500 · MSSE Approval = Katalysator",
    wave:"4H: C-Welle aktiv — Foundation-Krise, rel. Schwäche ⚠️",
    waveWeekly:"Weekly: Saubere A-B-C-Korrektur von $3.680. Welle A: $3.680→$2.840. Welle B: Bounce. Welle C (läuft): Ziel $1.400–$1.500. Bei MSSE-ETF-Approval oder CPI-Überraschung mögliche Bodenbildung. Danach: 5-Wellen-Aufwärts Richtung $2.200–$2.800.",
    waveDetail:"ETH Tief $1.542. Bounce mit niedrigem Volumen — korrektiv. Foundation: -40% Budget, 9 Departures. Relative Schwäche: -8,2% 7D vs. BTC -5,4%.",
    reasons:[
      {icon:"🏛️",col:COL.bear,title:"Foundation-Krise",text:"Budget -40%, 9 Senior-Departures."},
      {icon:"📉",col:COL.bear,title:"Relative Schwäche",text:"-8,2% 7D vs. BTC -5,4%."},
      {icon:"✅",col:COL.bull,title:"BitMine Russell 1000",text:"Strukturell positiv — Kursimpakt bisher null."},
      {icon:"⏳",col:COL.gold,title:"MSSE ETF",text:"Bei Genehmigung starker Katalysator."},
    ],
    keyStats:[["Jan-Hoch","$3.680"],["Jun-Tief","$1.542"],["7D","-8,2%"],["Foundation","Krise"],["MSSE","ausstehend"],["BitMine","Russell ✓"]],
  },
  {
    id:"sol", name:"Solana", ticker:"SOL/USD", emoji:"◎",
    tvLink:"https://www.tradingview.com/chart/PnJ5DSTK/",
    tvLinkLong:"https://www.tradingview.com/chart/g23bVOfB/",
    unit:"$", price:"72,22", chg24:+2.7, chg7:+0.5, bias:"bull",
    path7d:SOL_7D, pathWeekly:SOL_WEEKLY,
    levels:[{v:74.5,col:COL.bear,lbl:"Widerstand"},{v:70.0,col:COL.bull,lbl:"Support"},{v:64.8,col:COL.blue,lbl:"W5-Tief"}],
    levelsWeekly:[{v:235,col:COL.bear,lbl:"ATH Feb"},{v:128,col:COL.gold,lbl:"Mär-Tief"},{v:74.5,col:COL.gold,lbl:"Widerstand"},{v:64.8,col:COL.blue,lbl:"W5-Tief"}],
    currentWave:"Welle 1 (neuer Impuls)", waveStructure:"5-Wellen-Abwärts $235→$64,80 abgeschlossen",
    nextWaves:"W2: $68–72 · W3: $95–110 · W5: $130–150",
    wave:"4H: 5-Wellen-Ende $64,80 — Impuls-Bounce +12% 🟢",
    waveWeekly:"Weekly: Perfekte 5-Wellen-Abwärtssequenz von ATH $235 → $64,80 auf Weekly-Basis abgeschlossen. Welle 1 des neuen Aufwärtsimpulses läuft ($64,80→$72+). Welle 2: Pullback auf $68–72 (Fibonacci 50–62%). Welle 3: stärkstes Segment, Ziel $95–110. Welle 5: $130–150 wenn ETF-Approval + Ecosystem-Stärke.",
    waveDetail:"Sauberste Elliott-Struktur. Impuls-Bounce +12% mit höherem Volumen als Abwärts-Move. SOL stärkster Major: +0,5% 7D vs. Markt -5%.",
    reasons:[
      {icon:"〰️",col:COL.bull,title:"5-Wellen-Ende",text:"Sauberste Abwärtsstruktur, abgeschlossen bei $64,80."},
      {icon:"📊",col:COL.bull,title:"Impuls-Qualität",text:"+12% mit höherem Vol. als Abwärts-Move."},
      {icon:"🌍",col:COL.bull,title:"Ecosystem",text:"KG Group MOU, Toss Bank, DEX Vol. #1."},
      {icon:"📋",col:COL.bull,title:"ETF 95%",text:"Bloomberg: 95% Approval-Wahrscheinlichkeit."},
    ],
    keyStats:[["ATH","$235"],["W5-Tief","$64,80"],["7D","+0,5%"],["ETF","95% Bloomberg"],["KG Group","MOU Jun"],["DEX","#1 global"]],
  },
  {
    id:"gold", name:"Gold", ticker:"XAU/USD", emoji:"🥇",
    tvLink:"https://www.tradingview.com/chart/mmdbJB1E/",
    tvLinkLong:"https://www.tradingview.com/chart/GePOBs8s/",
    unit:"$", price:"4.036", chg24:+0.2, chg7:-5.1, bias:"neutral",
    path7d:GOLD_7D, pathWeekly:GOLD_WEEKLY,
    levels:[{v:4100,col:COL.bear,lbl:"200WMA"},{v:4000,col:COL.bull,lbl:"Support"},{v:3820,col:COL.blue,lbl:"Fib 38,2%"}],
    levelsWeekly:[{v:5200,col:COL.bear,lbl:"ATH Feb"},{v:4100,col:COL.bear,lbl:"200WMA"},{v:3820,col:COL.blue,lbl:"Fib 38,2%"}],
    currentWave:"B-Welle Bounce", waveStructure:"ABC-Korrektur nach ATH ~$5.200",
    nextWaves:"B-Ende: $4.100 · C: $3.700–3.900 · Dann: $4.500–4.900",
    wave:"4H: PCE-Bounce — 200WMA $4.100 als Deckel ⚠️",
    waveWeekly:"Weekly: Klare ABC-Korrektur nach ATH ~$5.200 (Feb). A-Welle: $5.200→$3.978. B-Welle (läuft): Bounce bis 200WMA $4.100. C-Welle: Ziel $3.700–3.900 (wenn Fed hawkish bleibt). Langfristig bullisch: Goldman Jahresendziel $4.900, Zentralbanken kaufen Rekordmengen.",
    waveDetail:"Erholung von $3.978 auf $4.036 nach PCE. 200WMA $4.100 = natürlicher B-Wellen-Deckel. Sep-Hike 63%, Dez 80%.",
    reasons:[
      {icon:"🏦",col:COL.bear,title:"Hawkisher Fed",text:"Sep-Hike 63%, Dez 80%. Dollar stark."},
      {icon:"🕊️",col:COL.bear,title:"Iran-MOU",text:"Geopolitik-Prämie weg."},
      {icon:"🏛️",col:COL.bull,title:"Zentralbanken",text:"Rekord-Goldkäufe 2026."},
      {icon:"📉",col:COL.bull,title:"CPI-Hoffnung",text:"Öl -40% → CPI fällt → Fed-Pivot möglich."},
    ],
    keyStats:[["ATH","~$5.200"],["200WMA","$4.100"],["Goldman","$4.900"],["Sep-Hike","63%"],["Iran","Prämie weg"],["ZB","Rekord"]],
  },
  {
    id:"silver", name:"Silber", ticker:"XAG/USD", emoji:"🪙",
    tvLink:"https://www.tradingview.com/chart/AlIePYyu/",
    tvLinkLong:"https://www.tradingview.com/chart/AlIePYyu/",
    unit:"$", price:"57,00", chg24:-0.3, chg7:-3.2, bias:"neutral",
    path7d:SILVER_7D, pathWeekly:SILVER_WEEKLY,
    levels:[{v:60,col:COL.bear,lbl:"Widerstand"},{v:55,col:COL.bull,lbl:"Support"}],
    levelsWeekly:[{v:121,col:COL.bear,lbl:"ATH Jan"},{v:70,col:COL.gold,lbl:"Mär-Niveau"},{v:57,col:COL.blue,lbl:"aktuell"}],
    currentWave:"C-Welle / Überkorrektur", waveStructure:"Extreme Korrektur nach ATH $121,62",
    nextWaves:"Boden: $52–57 · Erholung: $70–80 · W3: $90–110",
    wave:"Daily: -53% vom ATH — 6. Angebotsdefizit strukturell bullisch",
    waveWeekly:"Weekly: Extreme Korrektur von ATH $121,62 (Jan) auf $57 (-53%). Mögliches Ende einer ABC-Überkorrektur im $55–57-Bereich. 6. globales Angebotsdefizit (Silber Institut) + Solar-Boom als strukturelle Treiber. 2x Beta zu Gold: bei Fed-Pivot überproportionaler Aufschwung möglich.",
    waveDetail:"Doppelbelastung: Fed-Druck + AI-Chip-Slowdown (industrielle Nachfrage). 6. Angebotsdefizit in Folge strukturell bullisch.",
    reasons:[
      {icon:"💻",col:COL.bear,title:"AI-Chip-Slowdown",text:"Industrielle Nachfragesorgen."},
      {icon:"🏦",col:COL.bear,title:"Fed-Druck",text:"2x Beta zu Gold = stärker betroffen."},
      {icon:"📦",col:COL.bull,title:"6. Defizit",text:"6. globales Angebotsdefizit in Folge."},
      {icon:"☀️",col:COL.bull,title:"Solar",text:"Solaranlagen-Boom steigert Silbernachfrage."},
    ],
    keyStats:[["ATH","$121,62"],["Aktuell","$57,00"],["Vom ATH","-53%"],["Defizit","6. Jahr"],["Beta","2x Gold"],["Solar","↑"]],
  },
];

// Total Market Cap — nur für TradingView Link
export const TOTAL_MARKET_CAP_LINK = "https://www.tradingview.com/chart/Jjkw6MaQ/";
