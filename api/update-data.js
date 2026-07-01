// /api/update-data.js — Cron: täglich 18:00 UTC = 20:00 MESZ
// Strategie: 2-Schritt-Prozess
// Schritt 1: Web-Suche → roher Text
// Schritt 2: Zweiter Claude-Aufruf ohne Tools → sauberes JSON aus dem rohen Text
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const isCron = req.headers['x-vercel-cron'] !== undefined;
  const hasSecret = req.query.secret === process.env.UPDATE_SECRET;
  if (!isCron && !hasSecret) return res.status(401).json({ error: 'Unauthorized' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY nicht gesetzt' });

  const now = new Date().toISOString();
  const results = { timestamp: now, news: null, trades: null, errors: [] };

  try {
    const news = await fetchNews(apiKey);
    await kv.set('dashboard:news', news);
    await kv.set('dashboard:news:updated', now);
    results.news = `ok (${news.length} Artikel)`;
  } catch(e) { results.errors.push(`news: ${e.message}`); }

  try {
    const trades = await fetchTrades(apiKey);
    await kv.set('dashboard:trades', trades);
    await kv.set('dashboard:trades:updated', now);
    results.trades = `ok (${trades.length} Trades)`;
  } catch(e) { results.errors.push(`trades: ${e.message}`); }

  return res.status(200).json(results);
}

// ── Schritt 1: Web-Suche → roher Text ────────────────────────────────────────
async function webSearch(apiKey, query) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: query }],
    }),
  });
  if (!response.ok) throw new Error(`Suche ${response.status}`);
  const data = await response.json();
  // Nur Text-Blöcke extrahieren
  return (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();
}

// ── Schritt 2: Text → JSON (ohne Web-Suche, deterministisch) ─────────────────
async function textToJSON(apiKey, systemPrompt, userContent) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  if (!response.ok) throw new Error(`JSON-Konvertierung ${response.status}`);
  const data = await response.json();
  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim();

  // JSON aus Backtick-Blöcken extrahieren falls vorhanden
  const backtickMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = backtickMatch ? backtickMatch[1].trim() : text;

  try {
    return JSON.parse(jsonText);
  } catch(e) {
    // Letzter Versuch: ersten { bis letzten } nehmen
    const start = jsonText.indexOf('{');
    const end = jsonText.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(jsonText.slice(start, end + 1));
    }
    throw new Error(`JSON Parse fehlgeschlagen: ${e.message}`);
  }
}

// ── NEWS ─────────────────────────────────────────────────────────────────────
async function fetchNews(apiKey) {
  // Schritt 1: aktuelle News sammeln
  const rawText = await webSearch(apiKey,
    'Fasse die wichtigsten Finanz- und Krypto-News von heute zusammen: ' +
    'BTC ETH SOL Preisbewegungen, Fed Zinsentscheidungen, Trump Wirtschaftsaussagen, ' +
    'Geopolitik die Märkte bewegt, Gold Rohstoffe. Schreib auf Deutsch, 6-8 Themen.'
  );

  if (!rawText || rawText.length < 50) throw new Error('Keine Suchergebnisse');

  // Schritt 2: strukturiertes JSON daraus bauen
  const parsed = await textToJSON(apiKey,
    'Du bist ein JSON-Generator. Du gibst AUSSCHLIESSLICH valides JSON aus, ohne jeden anderen Text.',
    `Basierend auf diesen aktuellen News, erstelle ein JSON-Objekt mit 6 News-Einträgen auf Deutsch:

${rawText}

Gib NUR dieses JSON aus, nichts anderes:
{
  "news": [
    {
      "tag": "KRYPTO",
      "date": "${new Date().toLocaleDateString('de-AT')}",
      "icon": "📊",
      "title": "Titel",
      "summary": "2 Sätze Zusammenfassung",
      "full": "Ausführliche Analyse.\\n\\n📌 Fachbegriffe:\\n• Begriff: Erklärung\\n\\n📈 Auswirkung auf BTC/ETH:\\nText",
      "impact": "bullisch",
      "impactCol": "#2ecc71",
      "source": "Reuters"
    }
  ]
}

Erlaubte tags: KRYPTO, MAKRO, POLITIK, REGULIERUNG, ROHSTOFFE.
Erlaubte impactCol: #2ecc71 (bullisch), #e74c3c (bearisch), #f0b429 (neutral).
Genau 6 Einträge.`
  );

  if (!Array.isArray(parsed.news) || parsed.news.length === 0) {
    throw new Error('news-Array fehlt oder leer');
  }
  return parsed.news.slice(0, 6);
}

// ── TRADES ────────────────────────────────────────────────────────────────────
async function fetchTrades(apiKey) {
  let btcPrice = 60000, ethPrice = 1500, solPrice = 70;
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const d = await r.json();
    btcPrice = Math.round(d.bitcoin?.usd || btcPrice);
    ethPrice = Math.round(d.ethereum?.usd || ethPrice);
    solPrice = parseFloat(d.solana?.usd || solPrice).toFixed(2);
  } catch {}

  // Schritt 1: Marktlage recherchieren
  const rawText = await webSearch(apiKey,
    `Aktuelle technische Analyse für BTC ($${btcPrice}), ETH ($${ethPrice}), SOL ($${solPrice}). ` +
    'Wichtige Support/Resistance Levels, Elliott Wave Struktur, Trend. Auf Deutsch.'
  );

  if (!rawText || rawText.length < 50) throw new Error('Keine Marktdaten gefunden');

  // Schritt 2: Trade-Setups als JSON
  const parsed = await textToJSON(apiKey,
    'Du bist ein JSON-Generator für Trading-Setups. Du gibst AUSSCHLIESSLICH valides JSON aus.',
    `Erstelle basierend auf dieser Marktanalyse 3 Elliott-Wellen-Trade-Setups (BTC, ETH, SOL) auf Deutsch:

${rawText}

Aktuelle Preise: BTC $${btcPrice}, ETH $${ethPrice}, SOL $${solPrice}

Gib NUR dieses JSON aus:
{
  "timestamp": "${new Date().toLocaleTimeString('de-AT', {hour:'2-digit', minute:'2-digit'})}",
  "trades": [
    {
      "asset": "Bitcoin",
      "ticker": "BTC/USD",
      "bias": "neutral",
      "biasCol": "#f0b429",
      "priority": "⏸ ABWARTEN",
      "note": "Begründung",
      "bigPicture": {
        "timeframe": "Daily",
        "structure": "ABC Korrektur von ATH",
        "currentWave": "B-Welle",
        "nextWaves": [
          {"wave": "C-Welle", "target": "$55.000", "status": "kommt", "desc": "Zielzone"}
        ],
        "bearCase": "Schluss unter $58.000"
      },
      "setups": [
        {
          "type": "short",
          "label": "1H: Bounce-Sell",
          "tf": "1H · Scalp",
          "wave": "B-Welle",
          "entry": "$61.000",
          "stop": "$63.000",
          "t1": "$58.000",
          "t2": "$55.000",
          "crv": "1:1.5 · 1:3",
          "duration": "T1: 12h · T2: 48h",
          "confluence": [["Widerstand", "$61k ✅"]],
          "exec": "Ablehnung abwarten",
          "invalid": "Schluss über $63.000",
          "isBWave": false
        }
      ]
    }
  ]
}

Bias-Optionen: bull, neutral, bear. Status-Optionen: läuft, kommt, später.`
  );

  if (!Array.isArray(parsed.trades) || parsed.trades.length === 0) {
    throw new Error('trades-Array fehlt oder leer');
  }
  return parsed.trades;
}
