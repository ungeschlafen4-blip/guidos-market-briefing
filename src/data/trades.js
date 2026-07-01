// TRADES — Stand: 1. Juli 2026 — Preise: BTC $58.543 · ETH $1.571 · SOL $74,29
export const TRADES = [
  {
    asset:"Solana", ticker:"SOL/USD", bias:"bull", biasCol:"#2ecc71",
    priority:"⭐ PRIORISIERT", note:"Stärkster Major · +6,7% 7D · Alpenglow Q3 · ETF-Flows positiv",
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"5-Wellen-Abwärts von ATH $295 → $60,20 abgeschlossen — neuer Impuls läuft",
      currentWave:"Welle 1 des neuen Aufwärtsimpulses",
      nextWaves:[
        {wave:"Welle 2",target:"$68–70",status:"kommt",desc:"Fibonacci 50–62% Korrektur von Welle 1. Beste Einstiegszone für Long."},
        {wave:"Welle 3",target:"$95–110",status:"später",desc:"Stärkstes Segment. Trigger: ETF-Approval + Alpenglow-Launch Q3."},
        {wave:"Welle 4",target:"$85–90",status:"später",desc:"Korrektive Phase vor dem letzten Push."},
        {wave:"Welle 5",target:"$130–150",status:"später",desc:"Finalwelle. Marktbreite Euphorie erforderlich."},
      ],
      bearCase:"Wochenschluss unter $67 → 5-Wellen-Abwärts noch nicht abgeschlossen",
    },
    setups:[
      {
        type:"long", label:"1H: Pullback $70–72 — Welle 2 Einstieg",
        tf:"1H · Swing", wave:"Welle 2 Fibonacci-Korrektur — klassischer Retest",
        entry:"70,00–72,00$", stop:"67,50$ (−3,5%)", t1:"78,00$ (+8,3%)", t2:"85,00$ (+18,1%)",
        crv:"1:2,4 · 1:5,2", duration:"T1: 1–3 Tage · T2: 1–2 Wochen",
        confluence:[
          ["Elliott","Welle 2 auf Fibonacci 50–62% ✅"],
          ["Rel. Stärke","SOL +6,7% vs. Markt −4,8% ✅"],
          ["ETF","95% Bloomberg Approval-Chance ✅"],
          ["Alpenglow","Q3 2026 Mainnet → Katalysator ✅"],
          ["Corporate","Forward Industries 6,9M SOL Treasury ✅"],
        ],
        exec:"Auf Pullback auf $70–72 warten. Einstieg bei bullischer 1H-Kerze mit Volumen. Kein Chase über $76.",
        invalid:"Tagesschluss unter $67,50.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Bitcoin", ticker:"BTC/USD", bias:"neutral", biasCol:"#f0b429",
    priority:"⏸ ABWARTEN", note:"Unter 200WMA · ETF-Abflüsse 6 Wochen · kein klares Setup",
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"ABC-Korrektur nach ATH $126.080 (Feb 2026) — C-Welle läuft",
      currentWave:"C-Welle — Zielzone $55.000–58.000",
      nextWaves:[
        {wave:"C-Welle Ende",target:"$54.000–58.000",status:"läuft",desc:"C = A in Länge. A-Welle war ~$47k Rückgang → Ziel ~$55k."},
        {wave:"Neuer Impuls",target:"$75.000–85.000",status:"kommt",desc:"Nach ABC-Boden: neuer 5-Wellen-Aufwärtsimpuls. Timing: Q4 2026 (B. Cowen)."},
        {wave:"Welle 3 neu",target:"$95.000–115.000",status:"später",desc:"Wenn CLARITY Act + ETF-Flows positiv → Welle 3 des neuen Zyklus."},
      ],
      bearCase:"Wochenschluss unter $54.000 → tiefere C-Welle bis $48.000 möglich",
    },
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell $60.500–$62.000",
        tf:"1H · Scalp", wave:"Korrektiver Bounce in C-Welle — Bounces sind Verkaufschancen",
        entry:"60.500–62.000$", stop:"63.500$ (−2,5%)", t1:"58.000$ (−4,1%)", t2:"55.000$ (−9,1%)",
        crv:"1:1,6 · 1:3,6", duration:"T1: 12–24h · T2: 3–7 Tage",
        confluence:[
          ["Elliott","C-Welle — Bounces sind Sell-Gelegenheiten ✅"],
          ["200WMA","$62.457 = übergeordneter Widerstand ✅"],
          ["ETF-Abflüsse","6 Wochen negativ ✅"],
          ["F&G Index","12 — Extreme Fear ✅"],
        ],
        exec:"Erst bei 1H-Bearish-Kerze in der $60.500–$62k Zone. Kein Blind-Short.",
        invalid:"4H-Schluss über $63.500.",
        isBWave:false,
      },
      {
        type:"long", label:"Daily: C-Wellen-Boden $54.000–57.000 — Neuer Zyklus",
        tf:"Daily · Mittelfristig", wave:"Ende C-Welle → Beginn neuer 5-Wellen-Aufwärtsimpuls",
        entry:"54.000–57.000$ (Daily-Bullish + Volumen-Spike)", stop:"50.000$ (−8,7%)",
        t1:"68.000$ (+21%)", t2:"78.000$ (+40%)",
        crv:"1:2,4 · 1:4,6", duration:"T1: 4–8 Wochen · T2: 3–6 Monate",
        confluence:[
          ["Elliott","C-Wellen-Ende = starke Kaufzone ✅"],
          ["F&G","Extreme Fear = contrarian bullisch ✅"],
          ["Strategy","Akkumuliert weiter ✅"],
          ["Cowen","Boden Q3/Q4 2026 Szenario ✅"],
        ],
        exec:"⚠️ Mittelfristig. Nicht antizipieren — erst klare Bodenbildung abwarten (2 bullische Tageskerzen + Volumen). Benjamin Cowen: Boden Oktober 2026 wahrscheinlich.",
        invalid:"Wochenschluss unter $50.000.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Ethereum", ticker:"ETH/USD", bias:"bear", biasCol:"#e74c3c",
    priority:"⛔ VORSICHT", note:"Multi-Jahres-Tief · $1.547 letzter Support · nur Short",
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"C-Welle von ATH $3.400 (Jan 2026) — noch kein Boden",
      currentWave:"C-Welle aktiv — Ziel $1.400–1.500",
      nextWaves:[
        {wave:"C-Welle Ende",target:"$1.400–1.547",status:"läuft",desc:"$1.547 ist letzter bedeutender Support. Bruch öffnet $1.400 und $1.200."},
        {wave:"Boden-Formation",target:"$1.400–1.600",status:"kommt",desc:"MSSE-ETF-Approval oder starker CPI-Rückgang als möglicher Katalysator."},
        {wave:"Erholung",target:"$2.200–2.800",status:"später",desc:"5-Wellen-Aufwärts nach Bodenbildung. Trigger: SEC MSSE + Fed-Pivot."},
      ],
      bearCase:"Schluss unter $1.400 → tiefere Korrektur bis $1.100–1.200 möglich",
    },
    setups:[
      {
        type:"short", label:"1H: Bounce-Sell $1.600–$1.650",
        tf:"1H · Scalp", wave:"C-Welle — jeder Bounce ist Verkaufschance",
        entry:"1.600–1.650$", stop:"1.700$ (−3,0%)", t1:"1.547$ (−3,3%)", t2:"1.450$ (−9,4%)",
        crv:"1:1,1 · 1:3,1", duration:"T1: 6–24h · T2: 2–5 Tage",
        confluence:[
          ["Elliott","C-Welle aktiv ✅"],
          ["Rel. Schwäche","−8% 7D vs. BTC ✅"],
          ["Foundation","Budget −40%, Departures ✅"],
          ["Widerstand","$1.600–1.650 ehem. Support ✅"],
        ],
        exec:"Kleiner Size. Bounce auf $1.600–1.650 abwarten, dann bearische Kerze als Signal.",
        invalid:"Tagesschluss über $1.700.",
        isBWave:false,
      },
    ],
  },
  {
    asset:"Gold", ticker:"XAU/USD", bias:"neutral", biasCol:"#f0b429",
    priority:"💡 SETUP AKTIV", note:"200WMA $4.100 als Schlüssel · CPI 14. Juli entscheidend",
    bigPicture:{
      timeframe:"Daily / Weekly",
      structure:"ABC-Korrektur nach ATH ~$5.200 (Feb 2026)",
      currentWave:"B-Welle Bounce — Test der 200WMA $4.100",
      nextWaves:[
        {wave:"B-Welle Ende",target:"$4.085–4.150",status:"läuft",desc:"200WMA bei $4.100 = natürlicher B-Wellen-Deckel. Hawkisher Fed stützt diese Zone."},
        {wave:"C-Welle",target:"$3.700–3.900",status:"kommt",desc:"Wenn Fed hawkish bleibt → C-Welle. Öl-Deflation könnte das verhindern."},
        {wave:"Neuer Aufwärts",target:"$4.500–4.900",status:"später",desc:"Goldman Jahresendziel $4.900. Zentralbanken kaufen Rekordmengen."},
      ],
      bearCase:"Tagesschluss unter $3.800 → tiefere C-Welle bis $3.500",
    },
    setups:[
      {
        type:"short", label:"1H: B-Wellen-Top an 200WMA $4.085–$4.115",
        tf:"1H · Scalp", wave:"B-Wellen-Ende — 200WMA als Deckel",
        entry:"4.085–4.115$", stop:"4.175$ (−1,5%)", t1:"3.978$ (−2,6%)", t2:"3.820$ (−6,5%)",
        crv:"1:1,7 · 1:4,3", duration:"T1: 2–5 Tage · T2: 1–2 Wochen",
        confluence:[
          ["200WMA","$4.100 = starker Widerstand ✅"],
          ["Elliott","B-Wellen-Top = Sell-Zone ✅"],
          ["Fed","Sep-Hike 63%, Dez 80% ✅"],
          ["Iran-MOU","Geopolitik-Prämie weg ✅"],
        ],
        exec:"1H-Bearish-Kerze bei $4.100 abwarten. Kein Entry blind.",
        invalid:"Tagesschluss über $4.200.",
        isBWave:false,
      },
    ],
  },
];
