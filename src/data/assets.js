// ─────────────────────────────────────────────────────────────────────────────
// ASSET DATA v2 — mit reasons[] (Warum steigt/fällt es?) + Elliott-Wellen-Position
// ─────────────────────────────────────────────────────────────────────────────

// Farben (lokal definiert um Zirkular-Import zu vermeiden)
const COL = {
  bull:"#2ecc71", bear:"#e74c3c", gold:"#f0b429",
  blue:"#3b82f6", textMid:"#8892a4",
};

// 7-Tage stündliche Pfade
function genPath(points) {
  const days = ["Mo","Di","Mi","Do","Fr","Sa","So"];
  return points.map(([h, p]) => {
    const label = h % 24 === 0 ? days[Math.floor(h/24) % 7] : h % 12 === 0 ? `${String(h % 24).padStart(2,"0")}h` : "";
    return { t: label, h, p };
  });
}

export const BTC_7D = genPath([
  [0,63200],[6,62400],[12,62000],[18,61000],
  [24,60400],[30,59400],[36,58700],[42,58400],
  [48,58189],[54,59400],[60,60200],[66,60100],
  [72,60000],[78,60300],[84,60400],[90,60254],
  [96,60254],[102,60254],[108,60254],[114,60254],
  [120,60254],[126,60254],[132,60254],[138,60254],
  [144,60254],[150,60254],[156,60254],[162,60254],[166,60254],
]);

export const ETH_7D = genPath([
  [0,1678],[6,1660],[12,1640],[18,1615],
  [24,1600],[30,1580],[36,1560],[42,1542],
  [48,1542],[54,1555],[60,1568],[66,1572],
  [72,1575],[78,1580],[84,1585],[90,1588],
  [96,1588],[102,1588],[108,1588],[114,1588],
  [120,1588],[126,1588],[132,1588],[138,1588],[166,1588],
]);

export const SOL_7D = genPath([
  [0,74.2],[6,72.5],[12,71.0],[18,69.5],
  [24,68.5],[30,67.2],[36,66.0],[42,65.0],
  [48,64.8],[54,65.5],[60,67.0],[66,69.5],
  [72,70.8],[78,71.5],[84,72.0],[90,72.2],
  [96,72.2],[102,72.2],[108,72.2],[114,72.2],
  [120,72.2],[126,72.2],[132,72.2],[138,72.2],[166,72.22],
]);

export const GOLD_7D = genPath([
  [0,4090],[6,4080],[12,4065],[18,4050],
  [24,4035],[30,4020],[36,4008],[42,3990],
  [48,3978],[54,3985],[60,3995],[66,4010],
  [72,4020],[78,4028],[84,4032],[90,4035],
  [96,4036],[102,4036],[108,4036],[114,4036],
  [120,4036],[126,4036],[132,4036],[138,4036],[166,4036],
]);

export const SILVER_7D = genPath([
  [0,66.2],[6,65.0],[12,63.5],[18,62.0],
  [24,61.0],[30,60.0],[36,59.0],[42,58.0],
  [48,57.5],[54,57.2],[60,57.0],[66,57.0],
  [72,57.0],[78,57.0],[84,57.0],[90,57.0],
  [96,57.0],[102,57.0],[108,57.0],[114,57.0],[166,57.0],
]);

export const BTC_D=[{t:"Jan",p:98000},{t:"",p:126080},{t:"Feb",p:104000},{t:"",p:85000},{t:"Mär",p:77623},{t:"",p:65076},{t:"Jun",p:58189},{t:"jetzt",p:60254}];
export const ETH_D=[{t:"Jan",p:3680},{t:"Feb",p:2840},{t:"Mär",p:1920},{t:"Apr",p:1665},{t:"",p:1542},{t:"jetzt",p:1588}];
export const SOL_D=[{t:"Jan",p:198},{t:"Feb",p:235},{t:"Mär",p:128},{t:"Apr",p:88},{t:"",p:64.8},{t:"jetzt",p:72.22}];
export const GOLD_D=[{t:"Jan",p:3800},{t:"",p:5200},{t:"Feb",p:4900},{t:"Mär",p:4200},{t:"",p:3978},{t:"jetzt",p:4036}];
export const SILVER_D=[{t:"Jan",p:72},{t:"",p:121},{t:"Feb",p:105},{t:"Mär",p:75},{t:"Apr",p:62},{t:"",p:57},{t:"jetzt",p:57}];

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
    tvLink:"https://www.tradingview.com/chart/G1bYW1gV/",
    unit:"$", price:"60.254", chg24:+0.3, chg7:-5.4, bias:"neutral",
    path7d:BTC_7D, pathD:BTC_D,
    levels:[
      {v:63430,col:COL.bear,lbl:"Fib 61,8%"},{v:62366,col:COL.gold,lbl:"Fib 50%"},
      {v:61000,col:COL.gold,lbl:"Fib 38,2%"},{v:60170,col:COL.bear,lbl:"Sell-Wall"},
      {v:57400,col:COL.blue,lbl:"Box-Ziel"},
    ],
    currentWave:"B-Welle / (4)",
    waveStructure:"Übergeordnet: (A)-(B)-(C) Korrektur seit ATH $126.080",
    wave:"1H/4H: Bounce in B/4-Welle — Fib-Widerstand $61–63K ⚠️",
    waveDetail:"Der Anstieg von ATH $126.080 (Feb) bis heute ist eine klassische ABC-Korrektur. Welle A fiel auf ~$85.000, Welle B erholte auf ~$104.000, Welle C (läuft) drückt Richtung $55.000–60.000. Kurzfristig: Nach Do.-Tief $58.189 läuft ein B-Wellen-Bounce — typischerweise korrektiv (3-wellig) und trügerisch. Erst Tagesschluss über $63.430 (Fib 61,8%) gibt bullisches Signal.",
    reasons:[
      {icon:"📉", col:COL.bear, title:"200WMA gebrochen", text:"Erstmals seit 2022. Historisch folgen 6–18 Monate darunter. Strukturell bearish."},
      {icon:"🔴", col:COL.bear, title:"ETF-Abflüsse", text:"$692 Mio. Nettoabflüsse Do. — 6 Wochen in Folge negativ. Institutionelle Verkäufer dominieren."},
      {icon:"😰", col:COL.gold, title:"Extreme Fear F&G 12", text:"Tiefster Zykluspunkt. Historisch contrarian bullisch — aber kein präzises Timing-Signal."},
      {icon:"🏢", col:COL.bull, title:"Corporate Accumulation", text:"Strategy (+520 BTC) und Strive (+759 BTC) kaufen weiter. Institutioneller Bodenkauf aktiv."},
      {icon:"📊", col:COL.gold, title:"Post-Expiry-Bounce", text:"Nach Quarterly Options Expiry oft Erholung. Sell-Wall $60.170–$61.200 bremst aktuell."},
    ],
    keyStats:[["ATH 2026","$126.080"],["Zyklusboden","$58.189"],["200WMA","$62.457"],["F&G","12 (Ext. Fear)"],["Sep-Hike","63%"],["ETF 7D","−$692 Mio."]],
  },
  {
    id:"eth", name:"Ethereum", ticker:"ETH/USD", emoji:"Ξ",
    tvLink:"https://www.tradingview.com/chart/UBrQvmXY/",
    unit:"$", price:"1.588", chg24:+1.0, chg7:-8.2, bias:"bear",
    path7d:ETH_7D, pathD:ETH_D,
    levels:[{v:1620,col:COL.bear,lbl:"Widerstand"},{v:1542,col:COL.blue,lbl:"Tief"},{v:1500,col:COL.bull,lbl:"Support"}],
    currentWave:"C-Welle",
    waveStructure:"A-B-C Korrektur — C-Welle noch aktiv",
    wave:"4H: C-Welle aktiv — Foundation-Krise verstärkt Druck ⚠️",
    waveDetail:"ETH fiel von Jan-Hoch $3.680 in A-B-C-Abwärtsstruktur. Welle C (läuft): $1.740 → potenziell $1.400–$1.500. C-Wellen sind typischerweise die längsten und schärfsten. BitMine-Russell-Inclusion ohne Kursimpakt. Erst Tagesschluss über $1.760 neutralisiert die Struktur.",
    reasons:[
      {icon:"🏛️", col:COL.bear, title:"Foundation-Krise", text:"Budget -40%, Personal -20%, 9 Senior-Departures seit Januar. Vertrauensverlust im Ökosystem."},
      {icon:"📉", col:COL.bear, title:"Relative Schwäche", text:"-8,2% 7D vs. BTC -5,4%. ETH verliert überproportional — typisch für Altcoins in Bärenmärkten."},
      {icon:"💸", col:COL.bear, title:"Liquidationen", text:"$169 Mio. ETH-Liquidationen Do. Größte Einzelposition: $15,34 Mio. auf Hyperliquid."},
      {icon:"✅", col:COL.bull, title:"BitMine Russell 1000", text:"BitMine (125.000+ ETH Treasury) im Russell 1000. Strukturell positiv — Kursimpakt bisher null."},
      {icon:"⏳", col:COL.gold, title:"Morgan Stanley MSSE", text:"ETH-ETF (0,14% Fee, Staking) wartet auf SEC-Approval. Bei Genehmigung starker Katalysator."},
    ],
    keyStats:[["Jan-Hoch","$3.680"],["Tief Jun","$1.542"],["7D Perf.","-8,2%"],["Foundation","Krise"],["MSSE ETF","SEC ausst."],["BitMine","Russell ✓"]],
  },
  {
    id:"sol", name:"Solana", ticker:"SOL/USD", emoji:"◎",
    tvLink:"https://www.tradingview.com/chart/PnJ5DSTK/",
    unit:"$", price:"72,22", chg24:+2.7, chg7:+0.5, bias:"bull",
    path7d:SOL_7D, pathD:SOL_D,
    levels:[{v:74.5,col:COL.bear,lbl:"Widerstand"},{v:70.0,col:COL.bull,lbl:"Support"},{v:64.8,col:COL.blue,lbl:"W5-Tief"}],
    currentWave:"Welle 1 (neuer Impuls?)",
    waveStructure:"5-Wellen-Abwärts abgeschlossen → neuer Aufwärts-Impuls möglich",
    wave:"4H: 5-Wellen-Ende $64,80 — Impuls-Bounce +12% 🟢",
    waveDetail:"SOL: 5 klare Impulswellen von $235 → $64,80. Ende einer 5-Wellen-Sequenz = Trendumkehr-Signal. Bounce +12% von $64,80 auf $72,70 mit höherem Volumen als der Abwärts-Move — Qualitätsmerkmal echter Reversals. Wenn Pullback bei $70–71 hält: Trendwende bestätigt. Welle 3 Target: $79–83.",
    reasons:[
      {icon:"〰️", col:COL.bull, title:"5-Wellen-Ende", text:"Sauberste Elliott-Struktur aller drei Coins. Sequenz von $235 → $64,80 vollständig."},
      {icon:"📊", col:COL.bull, title:"Bounce-Qualität", text:"+12% mit höherem Volumen als Abwärts-Move — unterscheidet echte Reversals von Dead-Cat-Bounces."},
      {icon:"🌍", col:COL.bull, title:"Ecosystem-Stärke", text:"KG Group MOU, Toss Bank Validator, Ondo Finance 173 tokenisierte Assets, DEX Vol. #1 global."},
      {icon:"📋", col:COL.bull, title:"ETF-Approval 95%", text:"Bloomberg Intelligence: 95% Wahrscheinlichkeit für weitere SOL-ETF-Genehmigungen der SEC."},
      {icon:"⚠️", col:COL.gold, title:"Bestätigung ausstehend", text:"Wochenendhandel dünn. Echte Bestätigung wenn $70–71 als Pullback-Support hält."},
    ],
    keyStats:[["ATH 2026","$235"],["W5-Tief","$64,80"],["7D Perf.","+0,5%"],["ETF Approval","95% Bloomberg"],["KG Group","MOU Jun 26"],["DEX Vol.","#1 global"]],
  },
  {
    id:"gold", name:"Gold", ticker:"XAU/USD", emoji:"🥇",
    tvLink:"https://www.tradingview.com/chart/mmdbJB1E/",
    unit:"$", price:"4.036", chg24:+0.2, chg7:-5.1, bias:"neutral",
    path7d:GOLD_7D, pathD:GOLD_D,
    levels:[{v:4100,col:COL.bear,lbl:"200WMA"},{v:4000,col:COL.bull,lbl:"Support"},{v:3820,col:COL.blue,lbl:"Fib 38,2%"}],
    currentWave:"C-Welle (Bounce)",
    waveStructure:"Korrektur nach ATH ~$5.200 — C-Wellen-Bounce läuft",
    wave:"4H: PCE-Bounce — 200WMA $4.100 als Deckel ⚠️",
    waveDetail:"Gold fiel von ATH ~$5.200 (Feb) -22% auf $3.978. Aktuell Bounce nach PCE-Daten (Kern +3,4% wie erwartet). Die 200WMA bei $4.100 ist der natürliche Widerstand. Goldman Sachs: Jahresendziel $4.900. Zentralbanken kaufen Rekordmengen. Mittelfristig bullisch wenn CPI 14. Juli unter 3,8%.",
    reasons:[
      {icon:"🏦", col:COL.bear, title:"Hawkisher Fed", text:"Sep-Hike 63%, Dez 80%. Starker Dollar drückt Gold. 10Y-Yield bei 4,46%."},
      {icon:"🕊️", col:COL.bear, title:"Iran-MOU", text:"Waffenstillstand entfernt Geopolitik-Risikoprämie. Öl -40% vom Peak zieht Gold mit runter."},
      {icon:"🏛️", col:COL.bull, title:"Zentralbank-Käufe", text:"Rekord-Goldkäufe 2026. China, Indien, Türkei akkumulieren. Strukturell bullisches Fundament."},
      {icon:"📉", col:COL.bull, title:"CPI-Hoffnung 14. Juli", text:"WTI -40% → CPI-Energiekomponente fällt → Fed-Pivot-Hoffnung steigt → Gold-Rally möglich."},
    ],
    keyStats:[["ATH 2026","~$5.200"],["200WMA","$4.100"],["Goldman","$4.900 Ziel"],["Sep-Hike","63%"],["Iran-MOU","Prämie weg"],["ZB-Käufe","Rekord 2026"]],
  },
  {
    id:"silver", name:"Silber", ticker:"XAG/USD", emoji:"🪙",
    tvLink:"https://www.tradingview.com/chart/AlIePYyu/",
    unit:"$", price:"57,00", chg24:-0.3, chg7:-3.2, bias:"neutral",
    path7d:SILVER_7D, pathD:SILVER_D,
    levels:[{v:60,col:COL.bear,lbl:"Widerstand"},{v:55,col:COL.bull,lbl:"Support"}],
    currentWave:"C-Welle / Überkorrektur",
    waveStructure:"Extremkorrektur nach ATH $121,62",
    wave:"Daily: -53% vom ATH $121,62 — Doppelbelastung Edelmetall + Industrie",
    waveDetail:"Silber fiel von ATH $121,62 (Jan) auf $57 — -53%. Doppelbelastung: 1) Fed-Druck wie Gold, 2) Industrielle Nachfragesorgen durch AI-Chip-Verlangsamung. 6. globales Angebotsdefizit (Silber Institut). Wenn Fed-Pivot + industrielle Erholung kommen, steigt Silber überproportional (2x Beta vs. Gold).",
    reasons:[
      {icon:"💻", col:COL.bear, title:"AI-Chip-Slowdown", text:"KOSPI-Crash zeigt industrielle Nachfragesorgen. Silber wird in Elektronik/Halbleitern genutzt."},
      {icon:"🏦", col:COL.bear, title:"Fed-Druck", text:"Starker Dollar + Hike-Erwartung. Silbers höheres Beta macht es stärker betroffen als Gold."},
      {icon:"📦", col:COL.bull, title:"6. Angebotsdefizit", text:"Sechstes Jahr globales Defizit (Silber Institut). Strukturell bullisch für Trendwende."},
      {icon:"☀️", col:COL.bull, title:"Solar-Nachfrage", text:"Solaranlagen-Boom weltweit. Silber-Intensität pro Panel steigt. Langfristiger Treiber."},
    ],
    keyStats:[["ATH 2026","$121,62"],["Aktuell","$57,00"],["Vom ATH","-53%"],["Defizit","6. Jahr"],["Beta","~2x Gold"],["Solar","steigend"]],
  },
];
