// ─────────────────────────────────────────────────────────────────────────────
// TRADES v2 — Erweitert mit Silber, S&P, Nasdaq und Makro-Setups
// ─────────────────────────────────────────────────────────────────────────────

export const TRADES = [
  // ── KRYPTO ────────────────────────────────────────────────────────────────
  {
    asset:"Solana", ticker:"SOL/USD", bias:"bull", biasCol:"#2ecc71",
    priority:"⭐ PRIORISIERT", note:"Sauberste Struktur · stärkste rel. Performance",
    setups:[
      {
        type:"long", label:"1H: Pullback $70–71 → Welle 1 neuer Impuls",
        tf:"1H · Scalp", wave:"Post-5W-Reversal: Erste Korrektur auf Support",
        entry:"70,00–71,20$", stop:"68,80$ (−2,0%)", t1:"73,50$ (+3,6%)", t2:"76,00$ (+7,0%)",
        crv:"1:1,8 · 1:3,5", duration:"T1: 4–12h · T2: 24–48h",
        confluence:[
          ["Elliott","5-Wellen-Ende $64,80 ✅"],["Volume","Impuls > Abwärts-Vol ✅"],
          ["Rel. Stärke","+0,5% 7D vs. Markt −5% ✅"],["ETF","95% Approval ✅"],
        ],
        exec:"Pullback auf $70–71 abwarten. Signal: 1H-Bullish-Kerze bei $70,5+.",
        invalid:"Tagesschluss unter $68,80.", isBWave:false,
      },
      {
        type:"long", label:"2H: Breakout $74,50 → Welle 3",
        tf:"2H · Intraday", wave:"Welle 3 — stärkstes Segment",
        entry:"74,60–75,00$ (2H-Schluss über $74,50)", stop:"72,50$ (−2,8%)",
        t1:"79,00$ (+5,2%)", t2:"83,50$ (+11,4%)",
        crv:"1:1,9 · 1:4,1", duration:"T1: 6–16h · T2: 48–72h",
        confluence:[
          ["Elliott","Welle 3 nach 1+2 ✅"],["Breakout","$74,50 Jun-Hoch ✅"],
          ["Struktur","Higher High + Low ✅"],
        ],
        exec:"Erst nach 2H-Schlusskurs über $74,50.",
        invalid:"2H-Schluss unter $72,50.", isBWave:false,
      },
    ],
  },
  {
    asset:"Gold", ticker:"XAU/USD", bias:"neutral", biasCol:"#f0b429",
    priority:"💡 ROHSTOFF-SETUP", note:"Klare Levels · direkte Fed-Korrelation",
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell an 200WMA $4.085–$4.115",
        tf:"1H · Scalp", wave:"C-Welle Bounce — 200WMA als Deckel",
        entry:"4.085–4.115$", stop:"4.175$ (−1,5%)", t1:"3.978$ (−2,6%)", t2:"3.900$ (−4,5%)",
        crv:"1:1,7 · 1:3,0", duration:"T1: 6–24h · T2: 3–7 Tage",
        confluence:[
          ["200WMA","$4.100 Widerstand ✅"],["Fed","Sep 63%, Dez 80% ✅"],
          ["Iran-MOU","Geopolitik-Prämie weg ✅"],
        ],
        exec:"1H-Bearish-Ablehnung bei $4.100 abwarten.",
        invalid:"Tagesschluss über $4.200.", isBWave:false,
      },
      {
        type:"long", label:"Daily: Fib $3.820 — CPI 14.7. Katalysator",
        tf:"Daily · Mittelfristig", wave:"Ende C-Welle bei Fib 38,2%",
        entry:"3.820–3.900$", stop:"3.680$ (−3,7%)", t1:"4.200$ (+8,8%)", t2:"4.500$ (+16,4%)",
        crv:"1:2,4 · 1:4,4", duration:"T1: 1–2 Wo · T2: 3–4 Wo",
        confluence:[
          ["Fib 38,2%","$3.820 ✅"],["Ölpreis","−40% → CPI fällt ✅"],["Goldman","Ziel $4.900 ✅"],
        ],
        exec:"Erst bei $3.820–3.900 mit Daily-Kerze. Nur wenn CPI 14.7. < 3,8%.",
        invalid:"Wochenschluss unter $3.680.", isBWave:false,
      },
    ],
  },
  {
    asset:"Silber", ticker:"XAG/USD", bias:"neutral", biasCol:"#9aa0b4",
    priority:"🥈 ROHSTOFF-SETUP", note:"Höheres Beta als Gold · 6. Angebotsdefizit · Solar-Treiber",
    setups:[
      {
        type:"long", label:"Daily: Fib-Support $55–57 — 6. Angebotsdefizit",
        tf:"Daily · Mittelfristig", wave:"Überkorrektur nach ATH $121,62 — Boden-Suche",
        entry:"55,00–57,50$", stop:"52,00$ (−5,5%)", t1:"64,00$ (+12%)", t2:"72,00$ (+27%)",
        crv:"1:2,2 · 1:4,9", duration:"T1: 2–4 Wo · T2: 2–3 Monate",
        confluence:[
          ["Angebotsdefizit","6. Jahr in Folge (Silber Institut) ✅"],
          ["Beta","~2x Gold — überproportionaler Aufschwung bei Pivot ✅"],
          ["Solar","Solaranlagen-Boom treibt industrielle Nachfrage ✅"],
          ["RSI","Monatlich überverkauft ✅"],
        ],
        exec:"⚠️ Mittelfristiges Setup. Silber ist derzeit im Abwärtstrend — Einstieg nur bei klarer Bodenbildung (Bullish-Wochenkerze über $57,50). Kein Blind-Buy in fallendes Messer.",
        invalid:"Wochenschluss unter $52,00.", isBWave:false,
      },
      {
        type:"short", label:"1H: Bounce-Sell bei $60–62 — Momentum bearish",
        tf:"1H · Scalp", wave:"C-Welle läuft — Bounces sind Sell-Gelegenheiten",
        entry:"60,00–62,00$", stop:"64,00$ (−3,3%)", t1:"55,00$ (−8,3%)", t2:"52,00$ (−13,3%)",
        crv:"1:1,5 · 1:2,4", duration:"T1: 3–7 Tage · T2: 2–3 Wo",
        confluence:[
          ["Momentum","Abwärtstrend seit ATH $121,62 ✅"],["Fed-Druck","Starker Dollar belastet ✅"],
          ["Industrie","AI-Chip-Slowdown drückt Industrienachfrage ✅"],
        ],
        exec:"Bounce auf $60–62 abwarten, dann Bearish-Signal auf 1H-Chart.",
        invalid:"Wochenschluss über $64,00.", isBWave:false,
      },
    ],
  },
  {
    asset:"Bitcoin", ticker:"BTC/USD", bias:"neutral", biasCol:"#f0b429",
    priority:"⏸ ABWARTEN", note:"Sell-Walls bremsen · deine Fib-Levels (TradingView 27.6.)",
    setups:[
      {
        type:"short", label:"1H: Sell Fib 38,2–50% ($61.000–$62.400)",
        tf:"1H · Scalp", wave:"B/4-Wellen-Bounce scheitert",
        entry:"61.000–62.400$", stop:"63.200$", t1:"59.000$", t2:"57.400$",
        crv:"1:1,6 · 1:2,5", duration:"T1: 4–12h · T2: 24–48h",
        confluence:[
          ["Fib 38,2%","~$61.000 dein Chart ✅"],["Sell-Wall","$60.170–$61.200 ✅"],["Volume","Bounce < Abwärts ✅"],
        ],
        exec:"1H-Bearish-Ablehnung in Fib-Zone abwarten.",
        invalid:"1H-Schluss über $63.430.", isBWave:true,
      },
      {
        type:"long", label:"1H: Breakout $63.430 (Fib 61,8%) → (5) aufwärts",
        tf:"1H · Intraday", wave:"Alternative: (4) fertig → (5)",
        entry:"63.500–64.000$", stop:"62.000$", t1:"66.960$", t2:"69.961$",
        crv:"1:2,1 · 1:4,0", duration:"T1: 12–24h · T2: 48–72h",
        confluence:[
          ["Fib 61,8%","$63.430 Trigger ✅"],["F&G 12","Extreme Fear contrarian ✅"],["Corporate","Strategy kauft ✅"],
        ],
        exec:"Nur bei echtem Breakout mit Volumen.",
        invalid:"Tagesschluss unter $62.000.", isBWave:false,
      },
    ],
  },
  // ── MAKRO ─────────────────────────────────────────────────────────────────
  {
    asset:"S&P 500", ticker:"SPX", bias:"neutral", biasCol:"#f0b429",
    priority:"📈 MAKRO-SETUP", note:"Indirekter Einfluss auf Krypto-Sentiment",
    setups:[
      {
        type:"long", label:"Daily: 7.400 Support hält → Bounce Richtung 7.600",
        tf:"Daily · Swing", wave:"Korrektur nach Wochenhoch 7.530 — Test des Supports",
        entry:"7.380–7.420 (Daily-Bullish-Kerze bei Support)", stop:"7.280 (−1,4%)", t1:"7.530 (+1,5%)", t2:"7.650 (+3,3%)",
        crv:"1:1,1 · 1:2,4", duration:"T1: 2–5 Tage · T2: 1–2 Wo",
        confluence:[
          ["Support","7.400 — ehem. Widerstand wird Support ✅"],["Micron-Beat","AI-Thesis bestätigt ✅"],
          ["VIX","Unter 20 = ruhiger Markt ✅"],["PCE","Wie erwartet = kein Schock ✅"],
        ],
        exec:"⚠️ Makro-Setup für indirektes Krypto-Sentiment. S&P Long → Risk-on → BTC/ETH profitieren. Nur bei klarer Bestätigungskerze bei 7.400.",
        invalid:"Tagesschluss unter 7.280.", isBWave:false,
      },
    ],
  },
  {
    asset:"Nasdaq 100", ticker:"NDX", bias:"neutral", biasCol:"#f0b429",
    priority:"💻 MAKRO-SETUP", note:"Direkte Korrelation zu Krypto in Risk-on/off-Phasen",
    setups:[
      {
        type:"long", label:"Daily: Micron-Bounce bestätigt — 22.500 als Ziel",
        tf:"Daily · Swing", wave:"Korrektur nach Tech-Hochs — Micron als Katalysator",
        entry:"21.800–22.200 (bei Support nach Rücksetzer)", stop:"21.200 (−2,7%)", t1:"22.500 (+2,3%)", t2:"23.200 (+6,4%)",
        crv:"1:0,9 · 1:2,4", duration:"T1: 3–7 Tage · T2: 2–3 Wo",
        confluence:[
          ["Micron","EPS +24%, AI-Thesis bestätigt ✅"],["Support","21.800 = ehem. Basis ✅"],
          ["AI-CAPEX","Strukturell intakt ✅"],
        ],
        exec:"⚠️ Makro-Setup. Nasdaq Long → Risk-on → Krypto profitiert überproportional. Bei Rücksetzer auf 21.800 mit Bestätigungskerze.",
        invalid:"Tagesschluss unter 21.200.", isBWave:false,
      },
    ],
  },
  {
    asset:"Ethereum", ticker:"ETH/USD", bias:"bear", biasCol:"#e74c3c",
    priority:"⛔ VORSICHT", note:"Relative Schwäche · Foundation-Krise · nur Short",
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell $1.615–$1.650",
        tf:"1H · Scalp", wave:"C-Welle — Bounce = Sell-Gelegenheit",
        entry:"1.615–1.645$", stop:"1.690$ (−2,7%)", t1:"1.540$ (−4,5%)", t2:"1.480$ (−8,2%)",
        crv:"1:1,7 · 1:3,0", duration:"T1: 4–16h · T2: 24–48h",
        confluence:[
          ["Rel. Schwäche","−8,2% 7D vs. BTC ✅"],["Foundation","Budget −40% ✅"],["Widerstand","$1.620 ehem. Support ✅"],
        ],
        exec:"Kleiner Size. Erst bei Bounce auf $1.615+.",
        invalid:"Schluss über $1.700.", isBWave:false,
      },
    ],
  },
];
