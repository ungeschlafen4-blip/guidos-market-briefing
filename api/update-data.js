// ─────────────────────────────────────────────────────────────────────────────
// /api/update-data.js
// Server-seitige Funktion: ruft Claude auf (kein CORS-Problem hier, da Server→Server)
// Speichert Ergebnis in Upstash Redis (über Vercel KV env vars)
// Wird automatisch 2x täglich per Vercel Cron getriggert (siehe vercel.json)
// Kann auch manuell aufgerufen werden: GET /api/update-data?secret=DEIN_SECRET
// ─────────────────────────────────────────────────────────────────────────────

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Schutz: nur Vercel Cron oder mit korrektem Secret darf das auslösen
  const isCron = req.headers['x-vercel-cron'] !== undefined;
  const hasSecret = req.query.secret === process.env.UPDATE_SECRET;

  if (!isCron && !hasSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [newsResult, tradesResult] = await Promise.allSettled([
      fetchNews(),
      fetchTrades(),
    ]);

    const now = new Date().toISOString();
    const results = { timestamp: now, news: null, trades: null, errors: [] };

    if (newsResult.status === 'fulfilled') {
      await kv.set('dashboard:news', newsResult.value);
      await kv.set('dashboard:news:updated', now);
      results.news = 'ok';
    } else {
      results.errors.push(`news: ${newsResult.reason?.message || 'failed'}`);
    }

    if (tradesResult.status === 'fulfilled') {
      await kv.set('dashboard:trades', tradesResult.value);
      await kv.set('dashboard:trades:updated', now);
      results.trades = 'ok';
    } else {
      results.errors.push(`trades: ${tradesResult.reason?.message || 'failed'}`);
    }

    return res.status(200).json(results);
  } catch (e) {
    console.error('update-data error:', e);
    return res.status(500).json({ error: e.message });
  }
}

// ── NEWS VON CLAUDE HOLEN ─────────────────────────────────────────────────────
async function fetchNews() {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Suche die wichtigsten aktuellen Krypto- und Finanznews von heute (BTC, ETH, SOL, Gold, Makro). Antworte NUR mit JSON ohne Backticks oder zusätzlichen Text.
Gib genau 6 News zurück, auf Deutsch.
JSON: {"news":[{"tag":"KRYPTO oder MAKRO oder AKTIEN oder REGULIERUNG","date":"heutiges Datum","icon":"passendes Emoji","title":"Titel der News","summary":"1-2 Sätze Zusammenfassung","full":"Vollständige Analyse mit:\\n\\n📌 Fachbegriffe erklärt:\\n• Begriff: Erklärung\\n• Begriff: Erklärung\\n\\n📈 Auswirkung auf BTC/ETH/SOL:\\nText","impact":"bullisch oder bearisch oder neutral","impactCol":"#2ecc71 oder #e74c3c oder #f0b429"}]}`,
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Kein JSON in Claude-Antwort gefunden');

  const parsed = JSON.parse(match[0]);
  if (!parsed.news?.length) throw new Error('Leere News-Liste');
  return parsed.news;
}

// ── TRADES VON CLAUDE HOLEN ───────────────────────────────────────────────────
async function fetchTrades() {
  // Aktuelle Preise als Kontext holen
  let btcPrice = 60000, ethPrice = 1500, solPrice = 70;
  try {
    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const priceData = await priceRes.json();
    btcPrice = Math.round(priceData.bitcoin?.usd || btcPrice);
    ethPrice = Math.round(priceData.ethereum?.usd || ethPrice);
    solPrice = (priceData.solana?.usd || solPrice).toFixed(2);
  } catch { /* Fallback-Preise verwenden */ }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Analysiere den aktuellen Krypto-Markt und erstelle frische Trade-Setups auf Deutsch.
Aktuelle Preise: BTC $${btcPrice}, ETH $${ethPrice}, SOL $${solPrice}

Suche im Web nach aktueller Marktlage BTC ETH SOL, wichtigen Support/Resistance Levels und Elliott Wave Analyse.

Erstelle Setups für mindestens BTC, ETH, SOL und optional Gold. Antworte NUR mit JSON, kein anderer Text, keine Backticks:
{"timestamp":"HH:MM","trades":[{"asset":"Name","ticker":"X/USD","bias":"bull|neutral|bear","biasCol":"#2ecc71 oder #f0b429 oder #e74c3c","priority":"⭐ oder 💡 oder ⏸ oder ⛔ + kurzer Text","note":"Kurze Begründung","bigPicture":{"timeframe":"Daily / Weekly","structure":"Kurzbeschreibung übergeordnete Struktur","currentWave":"z.B. C-Welle / (4)","nextWaves":[{"wave":"Name","target":"Preis-Range","status":"läuft|kommt|später","desc":"Kurzbeschreibung"}],"bearCase":"Was das Setup invalidiert"},"setups":[{"type":"long|short","label":"Timeframe: Setup-Beschreibung","tf":"1H · Scalp","wave":"Elliott-Kontext","entry":"Preis$","stop":"Preis$ (-X%)","t1":"Preis$ (+X%)","t2":"Preis$ (+X%)","crv":"1:X · 1:X","duration":"T1: Xh · T2: Xh","confluence":[["Signal","Wert ✅"]],"exec":"Ausführungshinweis","invalid":"Invalidierungsbedingung","isBWave":false}]}]}`,
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Kein JSON in Claude-Antwort gefunden');

  const parsed = JSON.parse(match[0]);
  if (!parsed.trades?.length) throw new Error('Leere Trades-Liste');
  return parsed.trades;
}
