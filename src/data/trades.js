// ─────────────────────────────────────────────────────────────────────────────
// TRADES v3 — Stand: 29. Juni 2026
// Mit übergeordneter Elliott-Struktur + 4-Wochen-Kontext pro Setup
// Update-Workflow: Button im Dashboard → schickt Preise → Claude antwortet mit neuen Trades
// ─────────────────────────────────────────────────────────────────────────────

export const TRADES = [
  {
    asset:"Solana", ticker:"SOL/USD", bias:"bull", biasCol:"#2ecc71",
    priority:"⭐ PRIORISIERT", note:"SOL TP bei $73,50 gehittet — neues Setup nach Pullback",
    // Übergeordnete Elliott-Struktur (Daily/Weekly)
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"5-Wellen-Abwärts von ATH $235 → $64,80 abgeschlossen",
      currentWave:"Welle 1 des neuen Aufwärtsimpulses (möglicherweise)",
      nextWaves:[
        {wave:"Welle 1",target:"$76–80",status:"läuft","desc":"Erste Aufwärtswelle nach 5-Wellen-Ende. Typisch: scharf und impulsiv."},
        {wave:"Welle 2",target:"$68–72",status:"kommt","desc":"Korrektur auf 50–62% Fibonacci des Welle-1-Anstiegs. Pullback-Chance."},
        {wave:"Welle 3",target:"$95–110",status:"später","desc":"Stärkstes Segment. Typisch 1,618x Welle 1. Wenn SOL-ETF approved → Welle 3."},
        {wave:"Welle 4",target:"$80–90",status:"später","desc":"Erneute Korrektur vor dem letzten Push."},
        {wave:"Welle 5",target:"$130–150",status:"später","desc":"Finalwelle. Oft schwächer als Welle 3."},
      ],
      bearCase:"Tagesschluss unter $67,50 → 5-Wellen-Abwärts noch nicht komplett, neues Tief möglich",
    },
    setups:[
      {
        type:"long", label:"1H: Neuer Pullback $68–70 nach TP-Hit — Welle 2 Einstieg",
        tf:"1H · Scalp", wave:"Welle 2 Korrektur — klassische Bounce-Korrektur nach Welle 1",
        entry:"68,00–70,00$", stop:"66,50$ (−2,2%)", t1:"74,00$ (+5,7%)", t2:"79,00$ (+12,9%)",
        crv:"1:2,6 · 1:5,9", duration:"T1: 12–24h · T2: 48–96h",
        confluence:[
          ["Elliott","Welle 2 Korrektur auf Fibonacci 50–62% ✅"],
          ["Fib 50%","~$69,50 aus Welle 1 ✅"],
          ["Volume","Korrektur auf niedrigem Volumen = gesund ✅"],
          ["ETF","95% Bloomberg Approval ✅"],
          ["Rel. Stärke","SOL outperformt weiterhin ✅"],
        ],
        exec:"SOL hat TP $73,50 gehittet — gut gemacht! Jetzt auf Pullback auf $68–70 warten (Welle 2). Wenn SOL dort mit bullischer 1H-Kerze dreht → Welle 3 Entry. Kein Chase nach oben.",
        invalid:"Tagesschluss unter $66,50.",
        isBWave:false,
      },
      {
        type:"long", label:"2H: Breakout $76 → Welle 3 Beginn (stärkstes Segment)",
        tf:"2H · Intraday", wave:"Welle 3 — typisch 1,618x Welle 1 = Ziel $95–110",
        entry:"76,20–77,00$ (2H-Schluss über $76)", stop:"73,50$ (−3,6%)",
        t1:"83,00$ (+9,2%)", t2:"90,00$ (+18,4%)",
        crv:"1:2,6 · 1:5,1", duration:"T1: 2–4 Tage · T2: 1–2 Wochen",
        confluence:[
          ["Elliott","Welle 3 = stärkstes Segment ✅"],
          ["Breakout","$76 = Welle-1-Hoch als Bestätigung ✅"],
          ["ETF-Katalysator","Bei Approval Welle 3 sehr stark ✅"],
          ["Momentum","Höhere Highs + Lows bestätigt ✅"],
        ],
        exec:"Nur bei echtem 2H-Schlusskurs über $76 mit Volumen. Nicht antizipieren.",
        invalid:"2H-Schluss unter $73,50.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Bitcoin", ticker:"BTC/USD", bias:"neutral", biasCol:"#f0b429",
    priority:"⏸ ABWARTEN", note:"Unter 200WMA · Sell-Walls bremsen · kein klares Setup",
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"Übergeordnete ABC-Korrektur nach ATH $126.080 (Feb 2026)",
      currentWave:"C-Welle läuft — Zielzone $55.000–60.000",
      nextWaves:[
        {wave:"C-Welle Ende",target:"$55.000–58.000",status:"läuft","desc":"C-Wellen sind typisch gleich lang wie A-Wellen oder 1,618x. Ziel: $55.000–58.000 Bereich."},
        {wave:"Neuer Aufwärts-Impuls",target:"$75.000–85.000",status:"kommt","desc":"Nach ABC-Korrektur folgt neuer 5-Wellen-Impuls. Timing: Q4 2026 (Cowen-Szenario)."},
        {wave:"Welle 3 neu",target:"$95.000–115.000",status:"später","desc":"Wenn ETF-Flows wieder positiv + CLARITY Act → Welle 3 des neuen Zyklus."},
      ],
      bearCase:"Schlusskurs unter $55.000 → tiefere C-Welle bis $48.000–50.000 möglich (2022-Tief-Retest)",
    },
    setups:[
      {
        type:"short", label:"1H: Sell-Wall Ablehnung $60.500–$61.200 → Retest Tief",
        tf:"1H · Scalp", wave:"Korrektiver Bounce in C-Welle — Sell-Wall als Deckel",
        entry:"60.500–61.200$", stop:"62.000$ (−1,3%)", t1:"59.000$ (−2,5%)", t2:"57.500$ (−4,5%)",
        crv:"1:1,9 · 1:3,5", duration:"T1: 4–12h · T2: 24–48h",
        confluence:[
          ["Sell-Wall","$60.170–$61.200 Whale OB ✅"],
          ["Elliott","Korrektiver Bounce in C-Welle ✅"],
          ["200WMA","$62.457 = übergeordneter Widerstand ✅"],
          ["ETF-Flows","Negativ 6 Wochen in Folge ✅"],
        ],
        exec:"1H-Bearish-Kerze bei Sell-Wall abwarten. Nicht blind shorten — erst Ablehnung sehen.",
        invalid:"4H-Schlusskurs über $62.000.",
        isBWave:false,
      },
      {
        type:"long", label:"Daily: C-Wellen-Boden $55.000–58.000 — Neuer Zyklus",
        tf:"Daily · Swing", wave:"Ende C-Welle → Beginn neuer 5-Wellen-Aufwärtsimpuls",
        entry:"55.000–58.000$ (Daily-Bullish-Kerze + Volumen-Spike)", stop:"51.000$ (−7,3%)",
        t1:"68.000$ (+17%)", t2:"78.000$ (+34%)",
        crv:"1:2,3 · 1:4,7", duration:"T1: 4–8 Wochen · T2: 3–6 Monate",
        confluence:[
          ["Elliott","C-Wellen-Ende = starke Boden-Zone ✅"],
          ["200WMA Abstand","Historisch = Kaufzone ✅"],
          ["F&G 12","Extreme Fear = contrarian bullisch ✅"],
          ["Corporate","Strategy akkumuliert ✅"],
        ],
        exec:"⚠️ Mittelfristiges Setup. Nicht antizipieren. Erst wenn klare Bodenbildung sichtbar (2 Daily-Bullish-Kerzen + Volumen-Bestätigung). Benjamin Cowen: Boden Oktober 2026.",
        invalid:"Wochenschluss unter $51.000.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Gold", ticker:"XAU/USD", bias:"neutral", biasCol:"#f0b429",
    priority:"💡 SETUP AKTIV", note:"200WMA $4.100 als Schlüsselzone · CPI 14. Juli entscheidend",
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"Korrektur nach ATH ~$5.200 (Feb 2026) — ABC-Struktur",
      currentWave:"B-Welle Bounce läuft — Test der 200WMA",
      nextWaves:[
        {wave:"B-Welle Ende",target:"$4.100–4.150",status:"läuft","desc":"B-Wellen-Bounce typisch bis 50–61,8% des A-Wellen-Falls. 200WMA bei $4.100 = natürlicher B-Wellen-Deckel."},
        {wave:"C-Welle",target:"$3.700–3.900",status:"kommt","desc":"C-Wellen sind typisch gleich lang wie A-Wellen. Wenn Fed hawkish bleibt → C-Welle nach unten."},
        {wave:"Neuer Aufwärts",target:"$4.500–4.900",status:"später","desc":"Nach ABC-Korrektur: Goldman Ziel $4.900. Zentralbanken kaufen Rekord. Bei Fed-Pivot → neues ATH."},
      ],
      bearCase:"Tagesschluss unter $3.800 → tiefere C-Welle bis $3.500 möglich (Fib 61,8%)",
    },
    setups:[
      {
        type:"short", label:"1H: B-Wellen-Ende an 200WMA $4.085–$4.115",
        tf:"1H · Scalp", wave:"B-Wellen-Top — 200WMA als Deckel für B-Welle",
        entry:"4.085–4.115$", stop:"4.175$ (−1,5%)", t1:"3.978$ (−2,6%)", t2:"3.850$ (−5,8%)",
        crv:"1:1,7 · 1:3,9", duration:"T1: 1–3 Tage · T2: 1–2 Wochen",
        confluence:[
          ["200WMA","$4.100 = starker Widerstand ✅"],
          ["Elliott","B-Wellen-Top = Sell-Zone ✅"],
          ["Fed","Sep-Hike 63%, Dez 80% ✅"],
          ["Iran-MOU","Geopolitik-Prämie weg ✅"],
        ],
        exec:"1H-Bearish-Ablehnung bei $4.100 abwarten. Kein Entry darunter.",
        invalid:"Tagesschluss über $4.200.",
        isBWave:false,
      },
      {
        type:"long", label:"Daily: C-Wellen-Ende Fib $3.820 — CPI 14. Juli Katalysator",
        tf:"Daily · Mittelfristig", wave:"Ende C-Welle bei Fib 38,2% — Fed-Pivot Hoffnung",
        entry:"3.820–3.900$", stop:"3.680$ (−3,7%)", t1:"4.200$ (+8,8%)", t2:"4.500$ (+16,4%)",
        crv:"1:2,4 · 1:4,4", duration:"T1: 1–2 Wo · T2: 3–4 Wo",
        confluence:[
          ["Fib 38,2%","$3.820 = historisch starke Zone ✅"],
          ["Ölpreis","−40% → CPI Energie-Komponente fällt ✅"],
          ["Zentralbanken","Rekord-Goldkäufe 2026 ✅"],
          ["Goldman","Jahresendziel $4.900 ✅"],
        ],
        exec:"Mittelfristig. Erst bei $3.820–3.900 mit Bestätigungskerze. Nur wenn CPI 14.7. < 3,8%.",
        invalid:"Wochenschluss unter $3.680.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Ethereum", ticker:"ETH/USD", bias:"bear", biasCol:"#e74c3c",
    priority:"⛔ VORSICHT", note:"Relative Schwäche · Foundation-Krise · nur Short",
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"C-Welle einer übergeordneten ABC-Korrektur von ATH $3.680",
      currentWave:"C-Welle aktiv — kein Boden-Signal sichtbar",
      nextWaves:[
        {wave:"C-Welle",target:"$1.400–1.500",status:"läuft","desc":"C-Wellen typisch = A-Wellen-Länge. A-Welle: $3.680→$2.840 = $840. C-Ziel: $1.542 − $840 = ~$700? Alternativ: 1:1 = $1.400–1.500."},
        {wave:"Boden-Suche",target:"$1.400–1.600",status:"kommt","desc":"Wenn MSSE-ETF approved oder CPI-Überraschung → mögliche Bodenbildung."},
        {wave:"Neuer Impuls",target:"$2.200–2.800",status:"später","desc":"Nach Bodenbildung: 5-Wellen-Aufwärts. Trigger: SEC MSSE-Approval + Fed-Pivot."},
      ],
      bearCase:"Schluss unter $1.400 → tieferes C-Wellen-Ziel $1.100–1.200 (2023-Niveau)",
    },
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell $1.615–$1.650 → C-Welle weiter",
        tf:"1H · Scalp", wave:"Schwacher Bounce in C-Welle — jeder Bounce = Sell",
        entry:"1.615–1.645$", stop:"1.690$ (−2,7%)", t1:"1.540$ (−4,5%)", t2:"1.480$ (−8,2%)",
        crv:"1:1,7 · 1:3,0", duration:"T1: 4–16h · T2: 24–48h",
        confluence:[
          ["Elliott","C-Welle aktiv ✅"],["Rel. Schwäche","−8,2% 7D vs. BTC ✅"],
          ["Foundation","Budget −40% ✅"],["Widerstand","$1.620 ehem. Support ✅"],
        ],
        exec:"Kleiner Size. Erst bei Bounce auf $1.615+. Nächster Katalysator: CPI 14.7. oder MSSE.",
        invalid:"Schluss über $1.700.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Silber", ticker:"XAG/USD", bias:"neutral", biasCol:"#9aa0b4",
    priority:"🥈 LANGFRISTIG", note:"6. Angebotsdefizit · höheres Beta als Gold · Solar-Treiber",
    bigPicture:{
      timeframe:"Weekly / Monthly",
      structure:"Extreme Korrektur nach ATH $121,62 — möglicherweise Ende C-Welle",
      currentWave:"Mögliches Ende einer ABC-Überkorrektur",
      nextWaves:[
        {wave:"Boden-Formation",target:"$52–58",status:"läuft","desc":"$55–57 = historische Unterstützungszone + Fib-Cluster. Wenn Wochenschluss über $60 → Bodenbildung bestätigt."},
        {wave:"Erholung Welle 1",target:"$70–80",status:"kommt","desc":"Erste Erholungswelle nach Überkorrektur. Silber hat 2x Beta zu Gold."},
        {wave:"Welle 3 (Silber-Rally)",target:"$90–110",status:"später","desc":"Strukturelles Angebotsdefizit + Fed-Pivot + Solar-Boom → Welle 3 könnte sehr stark werden."},
      ],
      bearCase:"Wochenschluss unter $52 → neue Tiefs bis $45–48 möglich",
    },
    setups:[
      {
        type:"long", label:"Weekly: Boden-Zone $55–57 — 6. Angebotsdefizit als Fundament",
        tf:"Weekly · Langfristig", wave:"Mögliches C-Wellen-Ende — struktureller Boden",
        entry:"55,00–57,50$", stop:"52,00$ (−6%)", t1:"65,00$ (+14%)", t2:"75,00$ (+32%)",
        crv:"1:2,4 · 1:5,3", duration:"T1: 1–2 Monate · T2: 3–6 Monate",
        confluence:[
          ["Angebotsdefizit","6. Jahr in Folge ✅"],["Solar","Industrielle Nachfrage steigt ✅"],
          ["Beta","2x Gold bei Pivot ✅"],["RSI","Monatlich überverkauft ✅"],
        ],
        exec:"⚠️ Langfristiges Setup. Nur bei Wochenschluss über $57,50 mit Volumen einsteigen. Kein Blind-Buy in Abwärtstrend.",
        invalid:"Wochenschluss unter $52,00.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"S&P 500", ticker:"SPX", bias:"neutral", biasCol:"#f0b429",
    priority:"📈 MAKRO-BAROMETER", note:"Direkter Einfluss auf Krypto Risk-on/off Sentiment",
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"Korrekturbewegung nach Wochenhoch 7.530 — übergeordneter Aufwärtstrend intakt",
      currentWave:"4-Welle Korrektur im übergeordneten Aufwärtstrend",
      nextWaves:[
        {wave:"Welle 4 Ende",target:"7.300–7.400",status:"läuft","desc":"4-Wellen korrektiv und treten oft als Flat oder Dreieck auf. Support: 7.400."},
        {wave:"Welle 5",target:"7.700–7.900",status:"kommt","desc":"Letzte Aufwärtswelle des aktuellen Zyklus. Micron-Beat + AI-Thesis als Treiber."},
        {wave:"Übergeordnete Korrektur",target:"6.800–7.100",status:"später","desc":"Nach Welle 5: größere ABC-Korrektur möglich wenn Fed tatsächlich hikt."},
      ],
      bearCase:"Tagesschluss unter 7.200 → tiefere Korrektur bis 6.800 (Fib 38,2%)",
    },
    setups:[
      {
        type:"long", label:"Daily: 7.400 Support hält → Welle 5 Beginn",
        tf:"Daily · Swing", wave:"Ende 4-Welle — Welle 5 aufwärts",
        entry:"7.380–7.420", stop:"7.280 (−1,4%)", t1:"7.600 (+2,7%)", t2:"7.800 (+5,4%)",
        crv:"1:1,9 · 1:3,9", duration:"T1: 3–7 Tage · T2: 2–3 Wochen",
        confluence:[
          ["Elliott","Ende 4-Welle ✅"],["Support","7.400 = ehem. Widerstand ✅"],
          ["Micron","AI-CAPEX bestätigt ✅"],["VIX","Unter 20 ✅"],
        ],
        exec:"S&P Long → Risk-on → BTC/ETH profitieren überproportional. Erst Bestätigungskerze bei 7.400.",
        invalid:"Tagesschluss unter 7.280.",
        isBWave:false,
      },
    ],
  },
];
