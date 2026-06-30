// ─────────────────────────────────────────────────────────────────────────────
// /api/yahoo-proxy.js
// Eigener, zuverlässiger Proxy für Yahoo Finance — läuft serverseitig,
// kein CORS-Problem, kein Drittanbieter-Dienst wie allorigins.win nötig.
//
// Aufruf vom Frontend: /api/yahoo-proxy?symbol=GC=F&range=7d&interval=1h
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const { symbol, range = "7d", interval = "1h" } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol parameter" });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const response = await fetch(url, {
      headers: {
        // Yahoo blockt manchmal Anfragen ohne einen halbwegs normalen User-Agent
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo responded ${response.status}`);
    }

    const data = await response.json();

    // Kurzes Caching am Edge, damit wir Yahoo nicht bei jedem Seitenaufruf erneut belasten
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');

    return res.status(200).json(data);
  } catch (e) {
    console.error('yahoo-proxy error:', e);
    return res.status(502).json({ error: e.message });
  }
}
