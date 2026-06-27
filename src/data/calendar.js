// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR DATA
// H = Hoch · M = Mittel · L = Niedrig · N = Feiertag/Kein Markt
// ─────────────────────────────────────────────────────────────────────────────

export const CALENDAR_EVENTS = {
  // ── KW 27 — 29. Jun – 5. Jul ──────────────────────────────────────────────
  "2026-06-29": [
    {imp:"L", time:"—", name:"Eurozone Verbraucherpreise (Flash, Jun)", short:"CPI-Vorabschätzung EU",
     detail:"Erste Schätzung der Eurozone-Inflation für Juni. Energiedeflation durch Ölpreisrückgang (-40% vom Kriegspeak) könnte überraschend niedrig ausfallen.\n\n⚡ Impact: Niedrig für Krypto direkt. Relevant für EUR/USD und Gold indirekt."},
  ],
  "2026-06-30": [
    {imp:"M", time:"—",   name:"Binance EU-MiCA-Deadline", short:"Lizenz oder Service-Stop",
     detail:"Binance muss bis heute eine MiCA-konforme EU-Lizenz vorweisen.\n\n⚡ BTC/ETH-Impact: Lizenz-Verlust → kurzfristiger Sell-Druck. Gesichert → kein Impact."},
    {imp:"M", time:"16:00", name:"US Consumer Confidence (Jun)", short:"Konsument-Stimmungsbarometer",
     detail:"Misst Konsumentenoptimismus. Nach hawkishem Fed-Schock + PCE-Daten interessant.\n\n⚡ Impact: Schwach → Rezessionsangst, Risk-off. Stark → Soft-Landing gestützt."},
    {imp:"L", time:"—",   name:"Quartalsende Q2 2026 — Portfolio-Rebalancing", short:"Fond-Umschichtungen zum Quartalsende",
     detail:"Große Fonds rebalancen ihre Portfolios zum Quartalsende. Kann ungewöhnliche Kursbewegungen in beide Richtungen erzeugen.\n\n⚡ Impact: Erhöhte Volatilität möglich, keine klare Richtung."},
  ],
  "2026-07-01": [
    {imp:"N", time:"—", name:"🇨🇦 Canada Day — Bank of Canada geschlossen", short:"Feiertag Kanada",
     detail:"Kanadischer Nationalfeiertag. Börsen und Banken in Kanada geschlossen. Dünnere Liquidität in CAD-Paaren.\n\n⚡ Impact: Minimal für Krypto/US-Märkte."},
    {imp:"L", time:"14:30", name:"US ISM Manufacturing PMI (Jun)", short:"Industrieaktivität USA",
     detail:"Purchasing Managers Index für US-Industrie. Über 50 = Wachstum, unter 50 = Schrumpfung.\n\n⚡ Impact: Gering für Krypto, relevant für Dollar und Aktien."},
  ],
  "2026-07-02": [
    {imp:"L", time:"14:30", name:"US Initial Jobless Claims", short:"Wöchentliche Arbeitslosenmeldungen",
     detail:"Wöchentlicher Indikator für Arbeitsmarkt. Konsens ~225.000. Bei erhöhter Rezessionsangst mehr beachtet.\n\n⚡ Impact: Höher → Rezessionsangst. Niedriger → Arbeitsmarkt stark, Fed hat Spielraum für Hike."},
  ],
  "2026-07-03": [
    {imp:"M", time:"AH",  name:"Nike (NKE) + Constellation Brands Earnings", short:"Consumer-Spending-Test",
     detail:"Consumer-Earnings als Proxy für reale Wirtschaftsstärke.\n\n⚡ Impact: Beat → Soft-Landing gestützt, Risk-on. Miss → Rezessionssorgen steigen."},
    {imp:"L", time:"14:30", name:"US Nonfarm Payrolls (Jun)", short:"Wichtigster Arbeitsmarktbericht",
     detail:"Monatlicher US-Jobsbericht. Konsens ~180.000 neue Stellen. Starker Arbeitsmarkt = Fed kann hiken.\n\n⚡ Impact: Stark → Hike-Chance steigt, Dollar stärker, Krypto unter Druck. Schwach → Rezessionsangst."},
  ],
  "2026-07-04": [
    {imp:"N", time:"—", name:"🇺🇸 Independence Day — US-Märkte geschlossen", short:"US-Feiertag 4. Juli",
     detail:"US Independence Day. NYSE, NASDAQ und CME geschlossen. Extrem dünner Krypto-Handel — anfällig für Manipulation und False-Breaks.\n\n⚡ Impact: Kein US-Handel. Krypto läuft weiter aber mit niedriger Liquidität."},
  ],

  // ── KW 28 — 6.–12. Jul ────────────────────────────────────────────────────
  "2026-07-07": [
    {imp:"L", time:"14:30", name:"US Initial Jobless Claims", short:"Wöchentliche Arbeitslosenmeldungen",
     detail:"Wöchentlicher Arbeitsmarkt-Indikator.\n\n⚡ Impact: Standard-Volatilität um 14:30 MESZ."},
    {imp:"L", time:"11:00", name:"Eurozone Retail Sales (Mai)", short:"EU-Einzelhandelsumsätze",
     detail:"Misst Konsumstärke in der Eurozone.\n\n⚡ Impact: Gering für Krypto/US-Märkte."},
  ],
  "2026-07-09": [
    {imp:"L", time:"—", name:"FOMC Meeting Minutes (Jun-Sitzung)", short:"Protokoll der Juni-FOMC-Sitzung",
     detail:"Detailliertes Protokoll der Juni-Fed-Sitzung (Warsh). Kann neue Hinweise auf zukünftigen Zinspfad liefern.\n\n⚡ Impact: Hawkishe Töne → Dollar stärker, Krypto unter Druck. Überraschend dovish → kurzfristiger Bounce."},
  ],

  // ── KW 29 — 13.–19. Jul ───────────────────────────────────────────────────
  "2026-07-13": [
    {imp:"L", time:"—", name:"🇺🇸 Vorbereitungstag CPI — Märkte nervös", short:"Tag vor CPI-Veröffentlichung",
     detail:"Erfahrungsgemäß erhöhte Volatilität am Tag vor großen Inflationsdaten.\n\n⚡ Impact: Positionierungen und Hedges — kann zu ungewöhnlichen Bewegungen führen."},
  ],
  "2026-07-14": [
    {imp:"H", time:"14:30", name:"🔴 US CPI Juni — Ölpreis-Entlastung?", short:"Wichtigster Makro-Event Juli",
     detail:"CPI (Consumer Price Index) misst Inflation. WTI Öl fiel von >$100 auf $72 (-40%). Diese Energiedeflation sollte Juni-CPI deutlich drücken — möglicherweise unter 3,8%.\n\n⚡ BTC/ETH-Impact: CPI < 3,8% → Sep-Hike unter 50%, BTC Short-Squeeze, Gold-Rally. CPI über Erwartung → weiterer Druck auf alle Risk-Assets."},
    {imp:"M", time:"14:30", name:"US Initial Jobless Claims", short:"Wöchentliche Arbeitslosenmeldungen",
     detail:"Doppel-Event-Tag: CPI + Claims zur gleichen Zeit.\n\n⚡ Impact: Erhöhte Volatilität durch zwei gleichzeitige Datenpunkte."},
  ],
  "2026-07-15": [
    {imp:"M", time:"14:30", name:"US Retail Sales (Jun)", short:"US-Einzelhandelsumsätze",
     detail:"Misst Konsumstärke direkt. Nach CPI-Daten Vortag wichtiger Folgeindikator.\n\n⚡ Impact: Stark → Stagflations-Angst (hohe Inflation + hoher Konsum). Schwach → Rezessionssorgen."},
    {imp:"L", time:"TBD", name:"JPMorgan, Wells Fargo Earnings (Q2)", short:"Banken-Earnings-Season Start",
     detail:"Beginn der Q2-Earnings-Saison mit den großen US-Banken. Finanzsektorsentiment.\n\n⚡ Impact: Starke Banken-Earnings → Risk-on. Schwache → Systemische Bedenken."},
  ],

  // ── KW 30 — 27.–31. Jul ───────────────────────────────────────────────────
  "2026-07-27": [
    {imp:"L", time:"—", name:"Vorbereitungstag FOMC — Märkte in Warteposition", short:"Tag vor Fed-Entscheidung",
     detail:"Erfahrungsgemäß reduzierte Volatilität vor FOMC. Händler warten ab.\n\n⚡ Impact: Krypto oft seitwärts bis zur Entscheidung."},
  ],
  "2026-07-28": [
    {imp:"H", time:"20:00", name:"🔴 FOMC — Erster möglicher Hike (Warsh)", short:"Fed-Zinsentscheidung Juli",
     detail:"Deutsche Bank erwartet ersten 25bp-Hike auf 3,75–4,00%. BofA: sogar 3 Hikes 2026 gesamt. PCE und CPI-Daten entscheiden den Pfad.\n\n⚡ BTC/ETH-Impact: Hike + hawkischer Ton = ernsthafter Sell-off. Pause + neutral = Short-Squeeze möglich."},
    {imp:"M", time:"14:30", name:"US Q2 GDP (Erstschätzung)", short:"Erstschätzung US-Wirtschaftswachstum Q2",
     detail:"Erste Schätzung des US-BIP für Q2 2026. Nach KOSPI-Selloff und Marktturbulenzen ein wichtiger Realwirtschafts-Check.\n\n⚡ Impact: Über 2% → Soft-Landing bestätigt. Unter 1% oder negativ → Rezessionsangst dominant."},
  ],
  "2026-07-29": [
    {imp:"M", time:"14:30", name:"US PCE (Jun) — Nach FOMC", short:"Fed-Inflationsmaß Juni nach Zinsentscheid",
     detail:"Kern-PCE für Juni, einen Tag nach FOMC. Bietet Kontext für Warsh's Entscheidung.\n\n⚡ Impact: Höher → Bestätigt Hike-Kurs. Niedriger → Märkte fragen ob Hike nötig war."},
  ],

  // ── KW 35 — 24.–28. Aug ───────────────────────────────────────────────────
  "2026-08-24": [
    {imp:"L", time:"—", name:"Jackson Hole Economic Symposium beginnt", short:"Jährliches Fed-Notenbanker-Treffen",
     detail:"Jährliches Treffen wichtiger Notenbanker in Wyoming. Warsh könnte hier künftigen Zinspfad signalisieren.\n\n⚡ Impact: Hawkishe Rede = Sell-off. Dovish = Bounce-Möglichkeit."},
  ],
  "2026-08-25": [
    {imp:"M", time:"16:00", name:"Warsh Rede — Jackson Hole", short:"Fed-Chair spricht in Jackson Hole",
     detail:"Warsh's Rede beim Jackson Hole Symposium. Historisch bewegen diese Reden Märkte stark.\n\n⚡ Impact: Sehr hoch — jedes Wort wird analysiert. Krypto typischerweise volatile Reaktion."},
  ],
  "2026-08-26": [
    {imp:"M", time:"AH",  name:"Nvidia Q3 Earnings", short:"AI-Sektor Stimmungsbarometer",
     detail:"Nvidia gilt als ultimativer Proxy für AI-CAPEX. Nach Micron-Beat sind Erwartungen hoch.\n\n⚡ Impact: Beat → Risk-on stützt Krypto. Miss → AI-Bubble-Narrativ kehrt zurück."},
  ],

  // ── Feiertage ─────────────────────────────────────────────────────────────
  "2026-07-14-fr": [], // Bastille Day FR — kein separates Entry nötig, in Events
  "2026-08-15": [
    {imp:"N", time:"—", name:"🇦🇹🇩🇪 Mariä Himmelfahrt — AT/IT/FR/ES teilweise geschlossen", short:"Europäischer Feiertag",
     detail:"Mariä Himmelfahrt. In Österreich, Bayern, Teilen Frankreichs, Italiens und Spaniens Feiertag. Dünnere europäische Liquidität.\n\n⚡ Impact: Etwas dünner europäischer Handel. Krypto läuft normal."},
  ],
  "2026-08-31": [
    {imp:"N", time:"—", name:"🇬🇧 UK Summer Bank Holiday", short:"Feiertag UK",
     detail:"Britischer Sommer-Bankfeiertag. London-Märkte geschlossen.\n\n⚡ Impact: Geringere GBP-Liquidität. Krypto normal."},
  ],
};

export const CALENDAR_WEEKS = [
  {
    label: "KW 27 · 29. Jun – 5. Jul",
    days: ["2026-06-29","2026-06-30","2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05"],
  },
  {
    label: "KW 28 · 6. – 12. Jul",
    days: ["2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12"],
  },
  {
    label: "KW 29 · 13. – 19. Jul",
    days: ["2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19"],
  },
  {
    label: "KW 30 · 27. – 31. Jul",
    days: ["2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02"],
  },
  {
    label: "KW 35 · 24. – 28. Aug",
    days: ["2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30"],
  },
];
