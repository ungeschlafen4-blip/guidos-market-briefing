// ─────────────────────────────────────────────────────────────────────────────
// ASSET DATA
// 7-Tage stündliche Pfade · Key Levels · Elliott-Wave-Analyse
// Stand: 28. Juni 2026
// ─────────────────────────────────────────────────────────────────────────────

// Hilfsfunktion: 7-Tage stündliche Punkte generieren
function genPath(startVal, points) {
  // points = array of [hour_offset, price]
  return points.map(([h, p]) => {
    const d = new Date(2026, 5, 22, 0, 0); // 22. Jun 2026 00:00
    d.setHours(d.getHours() + h);
    const label = h % 24 === 0
      ? ["Mo","Di","Mi","Do","Fr","Sa","So"][Math.floor(h/24) % 7]
      : h % 12 === 0 ? `${String(d.getHours()).padStart(2,"0")}h` : "";
    return { t: label, h, p };
  });
}

export const BTC_7D = genPath(60000, [
  [0,63200],[2,63100],[4,62900],[6,62600],[8,62400],[10,62800],[12,63000],[14,63200],[16,62900],[18,62600],[20,62300],[22,62000],
  [24,61800],[26,61500],[28,61200],[30,61000],[32,60800],[34,60600],[36,60200],[38,59800],[40,59400],[42,59000],[44,58700],[46,58400],
  [48,58189],[50,58500],[52,59000],[54,59400],[56,59700],[58,60000],[60,60200],[62,60500],[64,60700],[66,60400],[68,60100],[70,59900],
  [72,60000],[74,60200],[76,60400],[78,60300],[80,60100],[82,60000],[84,60200],[86,60400],[88,60500],[90,60400],[92,60300],[94,60254],
  [96,60254],[98,60300],[100,60400],[102,60350],[104,60254],[106,60254],[108,60254],[110,60254],[112,60254],[114,60254],[116,60254],[118,60254],
  [120,60254],[122,60254],[124,60254],[126,60254],[128,60254],[130,60254],[132,60254],[134,60254],[136,60254],[138,60254],[140,60254],[142,60254],
  [144,60254],[146,60254],[148,60254],[150,60254],[152,60254],[154,60254],[156,60254],[158,60254],[160,60254],[162,60254],[164,60254],[166,60254],
]);

export const ETH_7D = genPath(1680, [
  [0,1678],[4,1670],[8,1660],[12,1650],[16,1640],[20,1625],
  [24,1615],[28,1605],[32,1595],[36,1580],[40,1565],[44,1555],
  [48,1542],[52,1548],[56,1555],[60,1562],[64,1568],[68,1572],
  [72,1575],[76,1578],[80,1582],[84,1585],[88,1588],[92,1588],
  [96,1588],[100,1588],[104,1588],[108,1588],[112,1588],[116,1588],
  [120,1588],[124,1588],[128,1588],[132,1588],[136,1588],[140,1588],
  [144,1588],[148,1588],[152,1588],[156,1588],[160,1588],[164,1588],[166,1588],
]);

export const SOL_7D = genPath(74, [
  [0,74.2],[4,73.8],[8,73.2],[12,72.5],[16,71.8],[20,71.0],
  [24,70.5],[28,69.8],[32,69.2],[36,68.5],[40,67.8],[44,67.2],
  [48,66.5],[52,65.8],[56,65.2],[60,64.9],[64,64.8],[68,65.0],
  [72,65.5],[76,66.2],[80,67.0],[84,68.2],[88,69.5],[92,70.2],
  [96,70.8],[100,71.2],[104,71.5],[108,71.8],[112,72.0],[116,72.1],
  [120,72.2],[124,72.2],[128,72.2],[132,72.2],[136,72.2],[140,72.2],
  [144,72.2],[148,72.2],[152,72.2],[156,72.2],[160,72.2],[164,72.2],[166,72.22],
]);

export const GOLD_7D = genPath(4090, [
  [0,4090],[4,4085],[8,4078],[12,4070],[16,4060],[20,4045],
  [24,4035],[28,4025],[32,4015],[36,4008],[40,4002],[44,3995],
  [48,3988],[52,3982],[56,3978],[60,3982],[64,3988],[68,3995],
  [72,4002],[76,4010],[80,4018],[84,4025],[88,4030],[92,4033],
  [96,4035],[100,4036],[104,4036],[108,4036],[112,4036],[116,4036],
  [120,4036],[124,4036],[128,4036],[132,4036],[136,4036],[140,4036],
  [144,4036],[148,4036],[152,4036],[156,4036],[160,4036],[164,4036],[166,4036],
]);

export const SILVER_7D = genPath(66, [
  [0,66.2],[4,65.8],[8,65.2],[12,64.5],[16,63.8],[20,63.0],
  [24,62.5],[28,62.0],[32,61.5],[36,61.0],[40,60.5],[44,60.0],
  [48,59.5],[52,59.0],[56,58.5],[60,58.8],[64,59.0],[68,59.2],
  [72,59.0],[76,58.8],[80,58.5],[84,58.2],[88,57.8],[92,57.5],
  [96,57.3],[100,57.1],[104,57.0],[108,57.0],[112,57.0],[116,57.0],
  [120,57.0],[124,57.0],[128,57.0],[132,57.0],[136,57.0],[140,57.0],
  [144,57.0],[148,57.0],[152,57.0],[156,57.0],[160,57.0],[164,57.0],[166,57.0],
]);

// Daily 6-Monats-Daten (für Daily-Tab)
export const BTC_D = [
  {t:"Jan",p:98000},{t:"",p:112000},{t:"Feb",p:126080},{t:"",p:104000},
  {t:"Mär",p:85000},{t:"",p:77623},{t:"Apr",p:65076},{t:"",p:62000},
  {t:"Mai",p:60500},{t:"",p:58189},{t:"Jun",p:60254},
];
export const ETH_D = [
  {t:"Jan",p:3680},{t:"Feb",p:3210},{t:"",p:2840},{t:"Mär",p:1920},
  {t:"",p:1810},{t:"Apr",p:1740},{t:"",p:1665},{t:"Mai",p:1620},
  {t:"",p:1542},{t:"Jun",p:1588},
];
export const SOL_D = [
  {t:"Jan",p:198},{t:"Feb",p:235},{t:"",p:160},{t:"Mär",p:128},
  {t:"",p:88},{t:"Apr",p:74.5},{t:"",p:68},{t:"Mai",p:64.8},{t:"Jun",p:72.22},
];
export const GOLD_D = [
  {t:"Jan",p:3800},{t:"",p:5200},{t:"Feb",p:4900},{t:"",p:4200},
  {t:"Mär",p:4100},{t:"",p:4250},{t:"Apr",p:4400},{t:"",p:3978},{t:"Jun",p:4036},
];
export const SILVER_D = [
  {t:"Jan",p:72},{t:"",p:121},{t:"Feb",p:105},{t:"Mär",p:75},
  {t:"Apr",p:62},{t:"",p:57},{t:"Jun",p:57},
];

export const ASSETS = [
  {
    id:"btc", name:"Bitcoin", ticker:"BTC/USD", emoji:"₿",
    tvLink:"https://www.tradingview.com/chart/G1bYW1gV/",
    tvSymbol:"BINANCE:BTCUSDT",
    unit:"$", price:"60.254", chg24:+0.3, chg7:-5.4, bias:"neutral",
    path7d: BTC_7D, pathD: BTC_D,
    levels:[
      {v:63430,col:"#e74c3c",lbl:"Fib 61,8%"},
      {v:62366,col:"#f0b429",lbl:"Fib 50%"},
      {v:61000,col:"#f0b429",lbl:"Fib 38,2%"},
      {v:60170,col:"#e74c3c",lbl:"Sell-Wall"},
      {v:57400,col:"#3b82f6",lbl:"Box-Ziel"},
    ],
    wave:"1H/4H: Bounce in B/4-Welle — Fib-Widerstand $61–63K ⚠️",
    waveDetail:"Fib-Band 38,2–61,8% ($61–63,4K) ist der entscheidende Widerstand. Sell-Walls $60.170–$61.200 decken sich exakt mit Fib 38,2%. Zielzone wenn Bounce scheitert (aus deiner TradingView-Zählung): $55.400–57.400. Bullisch erst bei 1H-Schlusskurs über $63.430.",
    keyStats:[
      ["ATH 2026","$126.080"],["Zyklusboden","$58.189"],
      ["200WMA","$62.457"],["Fear & Greed","12 (Ext. Fear)"],
      ["Sep-Hike","63%"],["ETF 7D","−$692 Mio."],
    ],
  },
  {
    id:"eth", name:"Ethereum", ticker:"ETH/USD", emoji:"Ξ",
    tvLink:"https://www.tradingview.com/chart/UBrQvmXY/",
    tvSymbol:"BINANCE:ETHUSDT",
    unit:"$", price:"1.588", chg24:+1.0, chg7:-8.2, bias:"bear",
    path7d: ETH_7D, pathD: ETH_D,
    levels:[
      {v:1620,col:"#e74c3c",lbl:"Widerstand"},
      {v:1542,col:"#3b82f6",lbl:"Tief"},
      {v:1500,col:"#2ecc71",lbl:"Support"},
    ],
    wave:"4H: Schwacher Bounce — Foundation-Krise, rel. Schwäche ⚠️",
    waveDetail:"ETH Tief $1.542. Bounce mit niedrigem Volumen — korrektiv. -8,2% 7D vs. BTC -5,4%. Foundation: -40% Budget, 9 Senior-Departures. Widerstand $1.620. Nächster Katalysator: CPI 14.7. oder SEC MSSE-Approval.",
    keyStats:[
      ["Jan-Hoch","$3.680"],["Tief Jun","$1.542"],
      ["7D Perf.","-8,2%"],["Foundation","Krise"],
      ["MSSE ETF","SEC ausstehend"],["BitMine","Russell 1000 ✓"],
    ],
  },
  {
    id:"sol", name:"Solana", ticker:"SOL/USD", emoji:"◎",
    tvLink:"https://www.tradingview.com/chart/PnJ5DSTK/",
    tvSymbol:"BINANCE:SOLUSDT",
    unit:"$", price:"72,22", chg24:+2.7, chg7:+0.5, bias:"bull",
    path7d: SOL_7D, pathD: SOL_D,
    levels:[
      {v:74.5,col:"#e74c3c",lbl:"Widerstand"},
      {v:70.0,col:"#2ecc71",lbl:"Support"},
      {v:64.8,col:"#3b82f6",lbl:"W5-Tief"},
    ],
    wave:"4H: 5-Wellen-Ende $64,80 — impulsiver Bounce +12% 🟢",
    waveDetail:"Sauberste Struktur aller Coins. Impuls-Bounce mit höherem Volumen als Abwärts-Move. Höhere Highs + Lows seit Do. Stärkster Major: einziger mit positivem 7D-Return (+0,5%). Pullback auf $70–71 für Einstieg abwarten.",
    keyStats:[
      ["ATH 2026","$235"],["W5-Tief","$64,80"],
      ["7D Perf.","+0,5%"],["ETF Approval","95% (Bloomberg)"],
      ["KG Group","MOU Jun 2026"],["DEX Vol.","#1 global"],
    ],
  },
  {
    id:"gold", name:"Gold", ticker:"XAU/USD", emoji:"🥇",
    tvLink:"https://www.tradingview.com/chart/mmdbJB1E/",
    tvSymbol:"TVC:GOLD",
    unit:"$", price:"4.036", chg24:+0.2, chg7:-5.1, bias:"neutral",
    path7d: GOLD_7D, pathD: GOLD_D,
    levels:[
      {v:4100,col:"#e74c3c",lbl:"200WMA"},
      {v:4000,col:"#2ecc71",lbl:"Support"},
      {v:3820,col:"#3b82f6",lbl:"Fib 38,2%"},
    ],
    wave:"4H: PCE-Bounce — 200WMA $4.100 als Deckel ⚠️",
    waveDetail:"Erholung von $3.978 auf $4.036 nach neutralem PCE. Widerstand: 200WMA $4.100. Sep-Hike 63%, Dez 80% → Dollar stark. Iran-MOU = Geopolitik-Prämie weg. Goldman Jahres-Ziel: $4.900.",
    keyStats:[
      ["ATH 2026","~$5.200"],["200WMA","$4.100"],
      ["Goldman Ziel","$4.900"],["Sep-Hike","63%"],
      ["Iran-MOU","Prämie weg"],["ZB-Käufe","Rekord"],
    ],
  },
  {
    id:"silver", name:"Silber", ticker:"XAG/USD", emoji:"🪙",
    tvLink:"https://www.tradingview.com/chart/AlIePYyu/",
    tvSymbol:"TVC:SILVER",
    unit:"$", price:"57,00", chg24:-0.3, chg7:-3.2, bias:"neutral",
    path7d: SILVER_7D, pathD: SILVER_D,
    levels:[
      {v:60,col:"#e74c3c",lbl:"Widerstand"},
      {v:55,col:"#2ecc71",lbl:"Support"},
    ],
    wave:"Daily: -53% vom ATH $121,62 — 6. Angebotsdefizit strukturell",
    waveDetail:"Doppelbelastung: Fed-Druck + industrielle Nachfragesorgen. 6. globales Angebotsdefizit in Folge (Silber Institut). Langfristig bullisch sobald Fed-Pivot sichtbar.",
    keyStats:[
      ["ATH 2026","$121,62"],["Aktuell","$57,00"],
      ["Vom ATH","-53%"],["Defizit","6. Jahr"],
      ["Polymarket","42% <$60 Jun"],["Industriell","AI-Chip-Slow"],
    ],
  },
];

export const MACRO_STATS = [
  {n:"S&P 500",  p:"7.354",  ch:-0.05},
  {n:"WTI Öl",   p:"$71,90", ch:+0.30},
  {n:"DXY",      p:"101,6",  ch:+0.40},
  {n:"10Y Yield",p:"4,46%",  ch:+0.02},
  {n:"VIX",      p:"18,89",  ch:-1.20},
  {n:"BTC Dom.", p:"52,4%",  ch:+0.30},
];
