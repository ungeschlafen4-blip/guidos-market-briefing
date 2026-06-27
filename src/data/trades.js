// ─────────────────────────────────────────────────────────────────────────────
// TRADE SETUPS — 1H/2H Scalp + Intraday
// ─────────────────────────────────────────────────────────────────────────────

export const TRADES = [
  {
    asset:"Solana", ticker:"SOL/USD", bias:"bull", biasCol:"#2ecc71",
    priority:"⭐ PRIORISIERT", note:"Sauberste Struktur · stärkste rel. Performance · Beides: Scalp + Intraday",
    setups:[
      {
        type:"long", label:"1H: Pullback $70–71 → Welle 1 neuer Impuls",
        tf:"1H · Scalp", wave:"Post-5W-Reversal: Erste Korrektur auf ehemaligen Widerstand",
        entry:"70,00–71,20$", stop:"68,80$ (−2,0%)", t1:"73,50$ (+3,6%)", t2:"76,00$ (+7,0%)",
        crv:"1:1,8 · 1:3,5", duration:"T1: 4–12h · T2: 24–48h",
        confluence:[
          ["Elliott","5-Wellen-Ende bei $64,80 ✅"],
          ["Volume","Impuls-Bounce > Abwärts-Vol ✅"],
          ["Rel. Stärke","+0,5% 7D vs. Markt −5% ✅"],
          ["Fib 61,8%","~$70,80 aus Do-Tief ✅"],
          ["ETF","Bloomberg 95% Approval ✅"],
        ],
        exec:"Kein Entry bei $72 jetzt. Pullback auf $70–71 abwarten. Signal: 1H-Bullish-Kerze bei $70,5+ mit erhöhtem Volumen.",
        invalid:"Tagesschluss unter $68,80 (Welle-2 darf nicht unter Welle-1-Start).",
        isBWave:false,
      },
      {
        type:"long", label:"2H: Breakout $74,50 → Welle 3 (stärkstes Segment)",
        tf:"2H · Intraday", wave:"Welle 3 — typisch stärkstes und schnellstes Segment",
        entry:"74,60–75,00$ (2H-Schlusskurs über $74,50 nötig)", stop:"72,50$ (−2,8%)",
        t1:"79,00$ (+5,2%)", t2:"83,50$ (+11,4%)",
        crv:"1:1,9 · 1:4,1", duration:"T1: 6–16h · T2: 48–72h",
        confluence:[
          ["Elliott","Welle 3 nach bestätigter 1+2 ✅"],
          ["Breakout","$74,50 = Jun-Hoch, starker Widerstand ✅"],
          ["Struktur","Higher High + Higher Low bestätigt ✅"],
          ["Momentum","RSI monatlich war auf Rekord-Tief ✅"],
        ],
        exec:"Erst nach 2H-Schlusskurs über $74,50 mit Volumen. Nicht antizipieren — Wochenend-False-Breaks möglich.",
        invalid:"2H-Schlusskurs unter $72,50.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Gold", ticker:"XAU/USD", bias:"neutral", biasCol:"#f0b429",
    priority:"💡 NEUES SETUP", note:"Klare Levels · direkte Fed-Korrelation · Short kurzfristig + Long mittelfristig",
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell an 200WMA $4.085–$4.115",
        tf:"1H · Scalp", wave:"Bounce in C-Welle — 200WMA als natürlicher Deckel",
        entry:"4.085–4.115$", stop:"4.175$ (−1,5%)", t1:"3.978$ (−2,6%)", t2:"3.900$ (−4,5%)",
        crv:"1:1,7 · 1:3,0", duration:"T1: 6–24h · T2: 3–7 Tage",
        confluence:[
          ["200WMA","$4.100 — starker struktureller Widerstand ✅"],
          ["Fed","Sep-Hike 63%, Dez 80% → Dollar stark ✅"],
          ["Iran-MOU","Geopolitik-Prämie vollständig weg ✅"],
          ["Struktur","Lower Highs seit Feb-ATH $5.200 ✅"],
        ],
        exec:"Warte auf 1H-Bearish-Engulfing oder Wick-Ablehnung bei $4.100. Kein Entry darunter — erst die Ablehnung sehen.",
        invalid:"Tagesschluss über $4.200.",
        isBWave:false,
      },
      {
        type:"long", label:"Daily: Fib 38,2% ($3.820) — CPI 14.7. als Katalysator",
        tf:"Daily · Mittelfristig", wave:"Ende C-Welle wenn CPI Energie-Entlastung zeigt",
        entry:"3.820–3.900$", stop:"3.680$ (−3,7%)", t1:"4.200$ (+8,8%)", t2:"4.500$ (+16,4%)",
        crv:"1:2,4 · 1:4,4", duration:"T1: 1–2 Wochen · T2: 3–4 Wochen",
        confluence:[
          ["Fib 38,2%","$3.820 — starke historische Zone ✅"],
          ["Ölpreis","−40% vom Kriegspeak → CPI fällt ✅"],
          ["Zentralbanken","Rekord-Goldkäufe strukturell ✅"],
          ["Goldman","Jahresendziel $4.900 ✅"],
        ],
        exec:"Mittelfristiges Setup. Erst bei $3.820–3.900 mit Daily-Bestätigungskerze. Nur wenn CPI 14.7. < 3,8%.",
        invalid:"Wochenschluss unter $3.680.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Bitcoin", ticker:"BTC/USD", bias:"neutral", biasCol:"#f0b429",
    priority:"⏸ ABWARTEN", note:"Deine Fib-Levels (TradingView 27.6.) · Sell-Walls bremsen · CRV noch nicht optimal",
    setups:[
      {
        type:"short", label:"1H: Sell Fib 38,2–50% ($61.000–$62.366)",
        tf:"1H · Scalp", wave:"B/4-Wellen-Ende — Bounce scheitert an Fib-Zone",
        entry:"61.000–62.400$", stop:"63.200$ (über Fib 61,8%)",
        t1:"59.000$ (−3,3%)", t2:"57.400$ (−5,9%)",
        crv:"1:1,6 · 1:2,5", duration:"T1: 4–12h · T2: 24–48h",
        confluence:[
          ["Fib 38,2%","~$61.000 aus deinem TradingView-Chart ✅"],
          ["Fib 50%","~$62.366 ✅"],
          ["Sell-Wall","$60.170–$61.200 Whale Order Block ✅"],
          ["Volume","Bounce-Vol < Abwärts-Volumen ✅"],
        ],
        exec:"1H-Bearish-Ablehnung (Wick + bearisher Schlusskurs) in der Fib-Zone abwarten. Nicht antizipieren.",
        invalid:"1H-Schlusskurs über $63.430 (dein Fib 61,8%).",
        isBWave:true,
      },
      {
        type:"long", label:"1H: Breakout $63.430 (Fib 61,8%) → (5) aufwärts",
        tf:"1H · Intraday", wave:"Alternative Elliott-Zählung: (4) fertig → (5) aufwärts",
        entry:"63.500–64.000$ (1H-Schlusskurs über Fib 61,8%)", stop:"62.000$",
        t1:"66.960$ (+4,7%)", t2:"69.961$ (+9,8%)",
        crv:"1:2,1 · 1:4,0", duration:"T1: 12–24h · T2: 48–72h",
        confluence:[
          ["Fib 61,8%","$63.430 = dein Trigger aus TradingView ✅"],
          ["Level $66.960","Nächster Widerstand aus deinem Chart ✅"],
          ["F&G 12","Extreme Fear — contrarian bullisch ✅"],
          ["Corporate","Strategy + Strive akkumulieren ✅"],
        ],
        exec:"Nur bei echtem Ausbruch mit Volumen. CRV erst gut nach Break über die Sell-Wall-Zone.",
        invalid:"Tagesschluss unter $62.000.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Ethereum", ticker:"ETH/USD", bias:"bear", biasCol:"#e74c3c",
    priority:"⛔ VORSICHT", note:"Relative Schwäche · Foundation-Krise · nur Short-Setups empfohlen",
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell $1.615–$1.650 → C-Welle weiter",
        tf:"1H · Scalp", wave:"C-Welle läuft — ehem. Support wird zu Widerstand",
        entry:"1.615–1.645$", stop:"1.690$ (−2,7%)",
        t1:"1.540$ (−4,5%)", t2:"1.480$ (−8,2%)",
        crv:"1:1,7 · 1:3,0", duration:"T1: 4–16h · T2: 24–48h",
        confluence:[
          ["Rel. Schwäche","−8,2% 7D vs. BTC −5,4% ✅"],
          ["Foundation","Budget −40%, 9 Senior-Departures ✅"],
          ["Widerstand","$1.620 = ehem. starker Support ✅"],
          ["BitMine","Russell-Inclusion ohne Kursimpakt ✅"],
        ],
        exec:"Kleiner Size. Erst bei Bounce auf $1.615+. Bearish-Kerze auf 1H abwarten. Nächster echter Katalysator: CPI 14.7. oder SEC MSSE-Approval.",
        invalid:"Schlusskurs über $1.700.",
        isBWave:false,
      },
    ],
  },
];
