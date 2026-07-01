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

// ── NEWS: Claude sucht aktiv im Web — Reuters, CNBC, CoinDesk, HKCM YouTube ─
async function fetchNews(apiKey) {
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
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Suche jetzt aktuelle Finanznews für einen Krypto- und Makro-Trader auf Deutsch.

Suche nach:
1. Aktuellen BTC ETH SOL Krypto-News heute
2. Fed Federal Reserve aktuelle Aussagen Zinsen
3. Trump aktuelle Aussagen Märkte Wirtschaft  
4. HKCM Philip Hopf aktuelle Analyse YouTube
5. Geopolitik Kriege Sanktionen Marktauswirkungen heute
6. S&P 500 Nasdaq Gold aktuelle Marktlage

Wähle die 6 wichtigsten News aus und antworte NUR mit diesem JSON (kein anderer Text, keine Backticks, keine Erklärungen):
{"news":[{"tag":"KRYPTO","date":"heute","icon":"📊","title":"Titel","summary":"Kurze Zusammenfassung 2 Sätze","full":"Volltext Analyse.\\n\\n📌 Fachbegriffe:\\n• Begriff: Erklärung\\n\\n📈 Auswirkung:\\nText","impact":"bullisch","impactCol":"#2ecc71","source":"Quelle"}]}

Wichtig: Genau 6 News-Objekte. Tags nur: KRYPTO, MAKRO, POLITIK, REGULIERUNG, ROHSTOFFE.`,
      }],
    }),
  });

  if (!response.ok) throw new Error(`Claude ${response.status}`);
  const data = await response.json();
  const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
  const match = text.match(/\{[\s\S]*"news"\s*:\s*\[[\s\S]*\]\s*\}/);
  if (!match) throw new Error('Kein gültiges JSON gefunden');
  const parsed = JSON.parse(match[0]);
  if (!parsed.news?.length) throw new Error('Leere News-Liste');
  return parsed.news.slice(0, 6); // maximal 6
}

// ── TRADES: Claude mit Web-Suche, JSON-Fehler durch kürzere Prompts vermeiden ─
async function fetchTrades(apiKey) {
  let btcPrice = 60000, ethPrice = 1500, solPrice = 70;
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const d = await r.json();
    btcPrice = Math.round(d.bitcoin?.usd || btcPrice);
    ethPrice = Math.round(d.ethereum?.usd || ethPrice);
    solPrice = parseFloat(d.solana?.usd || solPrice).toFixed(2);
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
      max_tokens: 3000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Du bist ein Elliott-Wellen-Analyst. Aktuelle Preise: BTC $${btcPrice}, ETH $${ethPrice}, SOL $${solPrice}.

Suche: "BTC ETH SOL Elliott Wave analysis today" und "crypto market technical analysis current levels".

Erstelle 4 Trade-Setups (BTC, ETH, SOL, Gold) auf Deutsch. Antworte NUR mit JSON:

{"timestamp":"HH:MM","trades":[{"asset":"Bitcoin","ticker":"BTC/USD","bias":"neutral","biasCol":"#f0b429","priority":"⏸ ABWARTEN","note":"Kurze Begründung","bigPicture":{"timeframe":"Daily","structure":"Struktur","currentWave":"Welle X","nextWaves":[{"wave":"Welle Y","target":"Preis","status":"kommt","desc":"Text"}],"bearCase":"Bedingung"},"setups":[{"type":"long","label":"1H: Setup-Titel","tf":"1H · Scalp","wave":"Elliott-Kontext","entry":"Preis$","stop":"Preis$","t1":"Preis$","t2":"Preis$","crv":"1:2","duration":"4-12h","confluence":[["Signal","Wert ✅"]],"exec":"Hinweis","invalid":"Bedingung","isBWave":false}]}]}`,
      }],
    }),
  });

  if (!response.ok) throw new Error(`Claude Trades ${response.status}`);
  const data = await response.json();
  const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
  
  // Robustes JSON-Parsing: auch bei leicht defektem JSON versuchen zu retten
  const match = text.match(/\{[\s\S]*"trades"\s*:\s*\[/);
  if (!match) throw new Error('Kein trades-JSON gefunden');
  
  // Vollständigen JSON-Block extrahieren
  const startIdx = text.indexOf(match[0]);
  let depth = 0, endIdx = startIdx;
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) { endIdx = i; break; } }
  }
  const jsonStr = text.slice(startIdx, endIdx + 1);
  const parsed = JSON.parse(jsonStr);
  if (!parsed.trades?.length) throw new Error('Keine Trades im JSON');
  return parsed.trades;
}
