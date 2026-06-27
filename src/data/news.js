// ─────────────────────────────────────────────────────────────────────────────
// NEWS DATA — mit Fachbegriff-Erklärungen
// ─────────────────────────────────────────────────────────────────────────────

export const NEWS_DEFAULT = [
  {
    tag:"KRYPTO", date:"27.06.", icon:"📊", impactCol:"#2ecc71", impact:"Bullisch kurz/mittelfristig",
    title:"SOL +8% führt Post-Expiry-Rebound — stärkster Major-Coin",
    summary:"SOL +8% nach Quarterly Options Expiry. Einziger Major mit positivem 7D-Return.",
    full:`Nach dem Zyklusboden bei $58.189 (BTC) dreht der Markt am Freitag. Solana führt mit +8% auf $72,22 — angeführt von Aave und SOL-Ecosystem-Token.

📌 Fachbegriffe erklärt:
• Quarterly Options Expiry: Vierteljährlicher Verfallstag von Optionskontrakten. An diesem Tag werden Milliarden an Derivate-Positionen abgerechnet — oft erhöhte Volatilität, danach oft Richtungsumkehr.
• Max Pain ($61.000): Der Preis, bei dem die meisten Optionen wertlos verfallen. Kurs wird oft magnetisch angezogen.
• Fear & Greed Index (12): Misst Marktsentiment von 0 (Extreme Fear = panikartiger Ausverkauf) bis 100 (Extreme Greed = euphorische Käufe). Wert 12 = historisch oft in Bodennähe — contrarian bullisch.
• Post-Expiry-Bounce: Typische Erholung nach Verfallstag wenn der Liquidationsdruck nachlässt.

📈 Auswirkung auf Krypto:
Extreme Fear + Post-Expiry-Bounce ist historisch ein starkes mittelfristiges Setup. SOL zeigt die sauberste Elliott-Wellen-Struktur (5-Wellen-Ende bei $64,80) und stärkste relative Performance (+0,5% 7D vs. Markt -5%).`,
  },
  {
    tag:"KRYPTO", date:"26.06.", icon:"💥", impactCol:"#e74c3c", impact:"Bearisch strukturell",
    title:"$1,09 Mrd. Liquidationen — $692 Mio. ETF-Abflüsse (Rekord seit Mai)",
    summary:"$846 Mio. Long-Liquidationen. Größte Order: $38 Mio. BTC auf Hyperliquid.",
    full:`Donnerstag war die härteste Session der Woche: BTC traf $58.189 — tiefster Stand seit September 2024.

📌 Fachbegriffe erklärt:
• Liquidation: Wenn ein gehebelter Trade (z.B. 10x Long) gegen dich läuft und die Sicherheitsleistung nicht mehr reicht, schließt die Börse die Position zwangsweise. Das verstärkt Kursabfälle durch Kaskaden-Effekte massiv.
• Hyperliquid: Dezentrale Derivate-Börse on-chain (kein zentrales Unternehmen, kein KYC). $38 Mio. Einzelliquidation dort ist außergewöhnlich groß — zeigt institutionelle Größen auf DeFi.
• ETF Nettoabflüsse ($692 Mio.): Mehr Geld floss aus BTC-ETFs ab als hinein. 6 Wochen in Folge Nettoabflüsse = institutionelle Verkäufer dominieren.
• "Basically zero" ETF-Wachstum: Die ursprüngliche Thesis: ETFs bringen permanent neue institutionelle Käufer. Das trifft aktuell nicht zu — ETFs sind netto Verkäufer.
• Cascade Liquidations: Wenn erste Liquidationen den Kurs drücken, werden weitere Stop-Losses getriggert, was weitere Liquidationen auslöst — selbstverstärkender Abwärtsdruck.

📈 Auswirkung:
Strukturell bearisch für BTC kurzfristig. Erst wenn ETF-Flows wieder positiv werden (positive Nettozuflüsse über mehrere Tage), ändert sich das übergeordnete institutionelle Bild.`,
  },
  {
    tag:"REGULIERUNG", date:"25.06.", icon:"⚖️", impactCol:"#f0b429", impact:"Neutral bis leicht bearisch",
    title:"CLARITY Act auf Herbst verschoben — Binance EU-Deadline 30.6.",
    summary:"Senatsopposition verzögert wichtigstes US-Krypto-Gesetz. Binance sucht EU-Lizenz-Alternative.",
    full:`Der CLARITY Act — das wichtigste US-Krypto-Regulierungsgesetz seit Jahren — wird wahrscheinlich auf die Herbst-Session verschoben.

📌 Fachbegriffe erklärt:
• CLARITY Act: US-Gesetz das klären soll, welche Kryptowährungen als Wertpapiere (SEC-Kontrolle) und welche als Rohstoffe (CFTC-Kontrolle) gelten. Massive Rechtsunsicherheit für US-Krypto-Unternehmen würde damit enden.
• SEC vs. CFTC: Zwei verschiedene US-Behörden. SEC (Securities) reguliert Aktien/Wertpapiere. CFTC (Commodities) reguliert Bitcoin, Rohstoffe. Kampf beider Behörden um Krypto-Zuständigkeit ist ein Kernproblem.
• MiCA (EU): Markets in Crypto-Assets — das europäische Krypto-Regulierungsframework. Bereits in Kraft. Alle Krypto-Börsen brauchen eine MiCA-Lizenz für EU-Betrieb.
• Binance EU-Deadline: Binance muss bis 30. Juni eine MiCA-konforme Lizenz vorweisen oder Services für EU-Nutzer einstellen. Millionen EU-Nutzer, darunter viele österreichische Trader, betroffen.

📈 Auswirkung:
CLARITY-Verschiebung entfernt einen wichtigen kurzfristigen Policy-Tailwind. Binance-Problem könnte kurzfristig Sell-Druck durch erzwungene Nutzer-Exits auf andere Plattformen erzeugen.`,
  },
  {
    tag:"MAKRO", date:"25.06.", icon:"📉", impactCol:"#f0b429", impact:"Neutral",
    title:"PCE Mai: Kern +3,4% YoY — Sep-Hike 63%, Dez 80%",
    summary:"Personal Spending +0,7% MoM (beat). Wie erwartet — kein Bounce, aber auch kein Schock.",
    full:`Der PCE-Preisindex (Fed's bevorzugtes Inflationsmaß) für Mai: Kern +3,4% YoY — genau wie erwartet.

📌 Fachbegriffe erklärt:
• PCE (Personal Consumption Expenditures): Misst Inflation aus Konsumentenperspektive. Die Fed bevorzugt PCE gegenüber CPI da er breiter und methodisch konsistenter ist.
• Kern-PCE: PCE ohne Nahrung und Energie (zu volatil für Zinsentscheid). Das ist das eigentliche Fed-Ziel (langfristig 2%). Aktuell 3,4% = noch zu hoch.
• Fed Funds Rate / Hike: US-Leitzins. "Hike" = Anhebung um 0,25%. Bei 3,50–3,75% aktuell. Höhere Zinsen = teurerer Kredit = weniger Risikobereitschaft = Krypto leidet.
• Hawkish / Dovish: Hawkish = Fed will Zinsen erhöhen (Inflationsbekämpfung priorisiert). Dovish = Fed will Zinsen senken (Wirtschaftswachstum priorisiert). Warsh ist klar hawkish.
• Dot Plot: War die Prognose aller Fed-Mitglieder für zukünftige Zinsen (jetzt abgeschafft von Warsh).

📈 Auswirkung:
PCE wie erwartet → kein September-Hike-Schock, aber auch keine Erleichterung. Entscheidend wird CPI 14. Juli — wenn der Ölpreis-Effekt sichtbar wird und CPI unter 3,8% fällt.`,
  },
  {
    tag:"AKTIEN", date:"24.06.", icon:"🤖", impactCol:"#2ecc71", impact:"Bullisch Risk-on",
    title:"Micron: EPS +24%, Q4-Guidance $50 Mrd. — AI-Thesis bestätigt",
    summary:"MU EPS $25,11 vs. $20,20. Revenue $41,5 Mrd. MU +14,6% AH. Anthropic-Chip-Deal.",
    full:`Micron Technology lieferte einen der stärksten Quartalsberichte der Unternehmensgeschichte.

📌 Fachbegriffe erklärt:
• EPS (Earnings Per Share): Gewinn pro Aktie. $25,11 vs. $20,20 erwartet = +24% über Konsens.
• HBM (High Bandwidth Memory): Hochleistungs-RAM-Chips speziell für KI-Training und -Inferenz (Nvidia H100/H200 nutzen HBM). Microns HBM-Kapazität bis 2026 vollständig ausverkauft = enorme, strukturelle AI-Nachfrage bestätigt.
• Guidance: Unternehmensausblick. Q4-Guidance $50 Mrd. Revenue vs. $43,4 Mrd. erwartet = massiver Upside-Surprise.
• AI-CAPEX-Thesis: Die Theorie dass große Tech-Unternehmen (Microsoft, Google, Amazon) massiv in KI-Infrastruktur investieren → gut für Chip-Hersteller (Nvidia, Micron, TSMC) → Risk-on-Sentiment.
• Risk-on/Risk-off: Marktphasen. Risk-on = Investoren kaufen riskante Assets (Aktien, Krypto). Micron-Beat = Risk-on-Impuls der sich auf Krypto überträgt.

📈 Auswirkung:
BTC bouncte von $58.189 auf $63.500 nach dem Beat. Zeigt direkte Korrelation: Wenn AI-Thesis bestätigt → Tech-Sentiment steigt → Risk-on → Krypto profitiert. Anthropic-Chip-Deal (Micron liefert Chips für Claude-Infrastruktur) ist strategisch bedeutsam.`,
  },
  {
    tag:"KRYPTO", date:"26.06.", icon:"🌐", impactCol:"#2ecc71", impact:"Bullisch strukturell SOL",
    title:"KG Group (Südkorea): Solana-Payments-Netzwerk MOU",
    summary:"KG Group + Solana Foundation MOU für SOL-basiertes Digital-Asset-Payments-Netzwerk.",
    full:`KG Group — eines der größten südkoreanischen Konglomerate (Zahlungsabwicklung, Fintech) — unterzeichnete einen MOU mit der Solana Foundation.

📌 Fachbegriffe erklärt:
• MOU (Memorandum of Understanding): Absichtserklärung / Vorvertrag. Kein definitiver Vertrag, zeigt aber ernsthafte Intention beider Parteien und oft Vorstufe zu echtem Vertrag.
• Payments-Netzwerk auf Solana: Nutzt Solanas Vorteile: ~65.000 TPS (Transaktionen pro Sekunde), Gebühren von ~$0,0001 pro Transaktion, Finalität in <1 Sekunde. Ideal für Zahlungsabwicklung.
• Validator-Node: Computer der das Solana-Netzwerk betreibt und Transaktionen bestätigt. Toss Bank betreibt bereits eine. KG Group plant ebenfalls eine. Je mehr renommierte Institutionen Nodes betreiben, desto dezentraler und sicherer wird das Netzwerk.
• Treasury: Wenn Unternehmen Krypto als Unternehmensreserve halten (wie Strategy/MicroStrategy mit BTC). Forward Industries hält 6,9 Mio. SOL als Treasury.

📈 Auswirkung:
Strukturell bullisch für SOL. Reale Adoption in Südkorea — einem der weltweit aktivsten Krypto-Märkte. Kombiniert mit Bloomberg 95% ETF-Approval-Wahrscheinlichkeit ist das fundamentale Basis für SOL-Outperformance.`,
  },
];
