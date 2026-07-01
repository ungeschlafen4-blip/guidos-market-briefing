// ─────────────────────────────────────────────────────────────────────────────
// /api/update-data.js — Cron-Job: täglich 16:00 UTC (18:00 MESZ)
// Holt News aus echten RSS-Quellen + Trades via Claude mit Web-Suche
// Speichert in Upstash Redis (KV)
// ─────────────────────────────────────────────────────────────────────────────

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Sicherheit: nur Vercel Cron oder manuell mit Secret
  const isCron = req.headers['x-vercel-cron'] !== undefined;
  const hasSecret = req.query.secret === process.env.UPDATE_SECRET;
  if (!isCron && !hasSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY nicht gesetzt' });
  }

  const now = new Date().toISOString();
  const results = { timestamp: now, news: null, trades: null, errors: [] };

  // ── NEWS: aus echten RSS-Feeds ────────────────────────────────────────────
  try {
    const news = await fetchNewsFromRSS(apiKey);
    await kv.set('dashboard:news', news);
    await kv.set('dashboard:news:updated', now);
    results.news = 'ok';
  } catch(e) {
    results.errors.push(`news: ${e.message}`);
  }

  // ── TRADES: via Claude mit Web-Suche ─────────────────────────────────────
  try {
    const trades = await fetchTrades(apiKey);
    await kv.set('dashboard:trades', trades);
    await kv.set('dashboard:trades:updated', now);
    results.trades = 'ok';
  } catch(e) {
    results.errors.push(`trades: ${e.message}`);
  }

  return res.status(200).json(results);
}

// ── RSS-Feeds der Quellen ─────────────────────────────────────────────────────
const RSS_FEEDS = [
  // Krypto
  { url: 'https://cointelegraph.com/rss', label: 'CoinTelegraph' },
  { url: 'https://coindesk.com/arc/outboundfeeds/rss/', label: 'CoinDesk' },
  // Finanzen / Makro
  { url: 'https://feeds.reuters.com/reuters/businessNews', label: 'Reuters Business' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', label: 'CNBC Economy' },
  // Politik (Trump, Fed, Geopolitik)
  { url: 'https://feeds.reuters.com/Reuters/PoliticsNews', label: 'Reuters Politics' },
];

async function fetchRSSFeed(feedUrl) {
  try {
    // RSS via eigenem Yahoo-Proxy nicht möglich — wir nutzen rss2json.com (kostenlos, 10k req/Tag)
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=5`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`RSS ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('RSS parse error');
    return (data.items || []).map(item => ({
      title: item.title?.trim() || '',
      description: item.description?.replace(/<[^>]*>/g,'').slice(0, 300).trim() || '',
      pubDate: item.pubDate || '',
      link: item.link || '',
    }));
  } catch(e) {
    return []; // einzelne Feeds dürfen scheitern
  }
}

async function fetchNewsFromRSS(apiKey) {
  // Alle Feeds parallel abrufen
  const feedResults = await Promise.all(RSS_FEEDS.map(f => fetchRSSFeed(f.url)));
  const allItems = RSS_FEEDS.map((f, i) =>
    feedResults[i].map(item => `[${f.label}] ${item.title}: ${item.description}`)
  ).flat().slice(0, 25); // max 25 Artikel als Kontext

  if (!allItems.length) throw new Error('Keine RSS-Artikel gefunden');

  const articlesText = allItems.join('\n\n');

  // Claude fasst die echten Artikel zusammen und strukturiert sie
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
      messages: [{
        role: 'user',
        content: `Hier sind aktuelle Nachrichtenartikel von heute aus RSS-Feeds:

${articlesText}

Wähle die 6 wichtigsten Artikel für einen Krypto/Finanz-Trader aus und fasse sie auf Deutsch zusammen. Priorisiere: Krypto-News, Fed/Zentralbank, wichtige Wirtschaftsdaten, Geopolitik die Märkte bewegt (Trump-Aussagen, Kriege, Sanktionen).

Antworte NUR mit JSON, kein anderer Text, keine Backticks:
{"news":[{"tag":"KRYPTO oder MAKRO oder POLITIK oder REGULIERUNG","date":"heute","icon":"passendes Emoji","title":"Titel auf Deutsch","summary":"2-3 Sätze Zusammenfassung auf Deutsch","full":"Ausführliche Analyse auf Deutsch.\\n\\n📌 Fachbegriffe:\\n• Begriff: Erklärung\\n\\n📈 Auswirkung auf BTC/ETH/Märkte:\\nText","impact":"bullisch oder bearisch oder neutral","impactCol":"#2ecc71 oder #e74c3c oder #f0b429","source":"Quellenname"}]}`,
      }],
    }),
  });

  if (!response.ok) throw new Error(`Claude ${response.status}`);
  const data = await response.json();
  const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Kein JSON in Claude-Antwort');
  const parsed = JSON.parse(match[0]);
  if (!parsed.news?.length) throw new Error('Leere News-Liste');
  return parsed.news;
}

// ── Trades via Claude mit Web-Suche ──────────────────────────────────────────
async function fetchTrades(apiKey) {
  // Aktuelle Preise für Kontext
  let btcPrice = 60000, ethPrice = 1500, solPrice = 70;
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const d = await r.json();
    btcPrice = Math.round(d.bitcoin?.usd || btcPrice);
    ethPrice = Math.round(d.ethereum?.usd || ethPrice);
    solPrice = (d.solana?.usd || solPrice).toFixed(2);
  } catch {}

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Analysiere den aktuellen Krypto-Markt und erstelle Elliott-Wave Trade-Setups auf Deutsch.
Aktuelle Preise: BTC $${btcPrice}, ETH $${ethPrice}, SOL $${solPrice}

Suche nach aktuellen BTC ETH SOL Marktlage, wichtige Support/Resistance Levels, Elliott Wave Zählung.

Erstelle Setups für BTC, ETH, SOL und mindestens ein Rohstoff-/Makro-Setup (Gold oder S&P).

Antworte NUR mit JSON, kein anderer Text, keine Backticks:
{"timestamp":"HH:MM","trades":[{"asset":"Name","ticker":"X/USD","bias":"bull|neutral|bear","biasCol":"#2ecc71 oder #f0b429 oder #e74c3c","priority":"⭐ PRIORISIERT oder 💡 SETUP oder ⏸ ABWARTEN oder ⛔ VORSICHT","note":"Kurze Begründung","bigPicture":{"timeframe":"Daily/Weekly","structure":"Übergeordnete Struktur","currentWave":"Aktuelle Welle","nextWaves":[{"wave":"Name","target":"Ziel","status":"läuft|kommt|später","desc":"Kurze Erklärung"}],"bearCase":"Invalidierungsbedingung"},"setups":[{"type":"long|short","label":"TF: Beschreibung","tf":"1H · Scalp","wave":"Elliott-Kontext","entry":"Preis","stop":"Preis (-X%)","t1":"Preis (+X%)","t2":"Preis (+X%)","crv":"1:X · 1:X","duration":"T1: Xh · T2: Xh","confluence":[["Signal","Wert ✅"]],"exec":"Ausführungshinweis","invalid":"Invalidierung","isBWave":false}]}]}`,
      }],
    }),
  });

  if (!response.ok) throw new Error(`Claude Trades ${response.status}`);
  const data = await response.json();
  const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Kein JSON');
  const parsed = JSON.parse(match[0]);
  if (!parsed.trades?.length) throw new Error('Keine Trades');
  return parsed.trades;
}
