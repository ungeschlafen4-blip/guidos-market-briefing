// /api/update-data.js — Cron: täglich 18:00 UTC = 20:00 MESZ
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
    results.news = 'ok';
  } catch(e) { results.errors.push(`news: ${e.message}`); }

  try {
    const trades = await fetchTrades(apiKey);
    await kv.set('dashboard:trades', trades);
    await kv.set('dashboard:trades:updated', now);
    results.trades = 'ok';
  } catch(e) { results.errors.push(`trades: ${e.message}`); }

  return res.status(200).json(results);
}

// Hilfsfunktion: extrahiert den ersten gültigen JSON-Block aus einem Text
function extractJSON(text) {
  // Alle {...} Blöcke finden und den ersten gültigen parsen
  let depth = 0, start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          const candidate = text.slice(start, i + 1);
          const parsed = JSON.parse(candidate);
          return parsed;
        } catch(e) {
          // Dieser Block war ungültig, weitersuchen
          start = -1;
        }
      }
    }
  }
  throw new Error('Kein gültiges JSON in der Antwort');
}

async function claudeCall(apiKey, prompt, useWebSearch = true) {
  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  };
  if (useWebSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Claude API ${response.status}: ${t.slice(0, 100)}`);
  }

  const data = await response.json();
  // Nur text-Blöcke zusammenführen, tool_use und tool_result ignorieren
  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');
  return text;
}

async function fetchNews(apiKey) {
  const text = await claudeCall(apiKey, `Suche nach den 6 wichtigsten aktuellen Finanznews für einen Krypto-Trader (BTC ETH SOL Gold, Fed, Trump Märkte, Geopolitik).

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt. Kein Text davor oder danach. Kein Markdown. Keine Backticks.

Format (genau so, ersetze die Beispielwerte):
{"news":[{"tag":"KRYPTO","date":"01.07.2026","icon":"📊","title":"Titel hier","summary":"Zusammenfassung hier.","full":"Volltext hier.","impact":"bullisch","impactCol":"#2ecc71","source":"Reuters"}]}

Genau 6 Einträge. Tags: KRYPTO, MAKRO, POLITIK, REGULIERUNG, ROHSTOFFE.`);

  const parsed = extractJSON(text);
  if (!Array.isArray(parsed.news) || parsed.news.length === 0) {
    throw new Error('news-Array leer oder fehlt');
  }
  return parsed.news.slice(0, 6);
}

async function fetchTrades(apiKey) {
  // Preise holen
  let btcPrice = 60000, ethPrice = 1500, solPrice = 70;
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const d = await r.json();
    btcPrice = Math.round(d.bitcoin?.usd || btcPrice);
    ethPrice = Math.round(d.ethereum?.usd || ethPrice);
    solPrice = parseFloat(d.solana?.usd || solPrice).toFixed(2);
  } catch {}

  const text = await claudeCall(apiKey, `Suche nach aktueller BTC ETH SOL Marktlage und Elliott Wave Analyse.

Aktuelle Preise: BTC $${btcPrice}, ETH $${ethPrice}, SOL $${solPrice}.

Erstelle 3 Trade-Setups (BTC, ETH, SOL) auf Deutsch.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt. Kein Text davor oder danach. Kein Markdown. Keine Backticks.

Format:
{"timestamp":"20:00","trades":[{"asset":"Bitcoin","ticker":"BTC/USD","bias":"neutral","biasCol":"#f0b429","priority":"⏸ ABWARTEN","note":"Begründung","bigPicture":{"timeframe":"Daily","structure":"ABC Korrektur","currentWave":"B-Welle","nextWaves":[{"wave":"C-Welle","target":"$55.000","status":"kommt","desc":"Zielzone der C-Welle"}],"bearCase":"Schluss unter $58.000"},"setups":[{"type":"short","label":"1H: Bounce-Sell $61k","tf":"1H · Scalp","wave":"B-Welle Bounce","entry":"$61.000","stop":"$63.000","t1":"$58.000","t2":"$55.000","crv":"1:1.5","duration":"12-24h","confluence":[["Widerstand","$61k ✅"]],"exec":"Ablehnung abwarten","invalid":"Schluss über $63.000","isBWave":false}]}]}`);

  const parsed = extractJSON(text);
  if (!Array.isArray(parsed.trades) || parsed.trades.length === 0) {
    throw new Error('trades-Array leer oder fehlt');
  }
  return parsed.trades;
}
