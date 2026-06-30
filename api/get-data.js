// ─────────────────────────────────────────────────────────────────────────────
// /api/get-data.js
// Liest die zuletzt gespeicherten News + Trades aus Upstash Redis
// Wird vom Dashboard beim Laden aufgerufen — kein CORS-Problem (gleiche Domain)
// ─────────────────────────────────────────────────────────────────────────────

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Cache kurz erlauben, aber nicht zu lang (Vercel Edge Cache)
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    const [news, newsUpdated, trades, tradesUpdated] = await Promise.all([
      kv.get('dashboard:news'),
      kv.get('dashboard:news:updated'),
      kv.get('dashboard:trades'),
      kv.get('dashboard:trades:updated'),
    ]);

    return res.status(200).json({
      news: news || null,
      newsUpdated: newsUpdated || null,
      trades: trades || null,
      tradesUpdated: tradesUpdated || null,
    });
  } catch (e) {
    console.error('get-data error:', e);
    return res.status(500).json({ error: e.message });
  }
}
