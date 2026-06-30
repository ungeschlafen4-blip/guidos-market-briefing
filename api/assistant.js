// /api/assistant.js — Sprachassistentin Backend

export default async function handler(req, res) {
  // CORS Headers damit der Browser keinen Fehler wirft
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY nicht gesetzt in Vercel Environment Variables' });
  }

  const { message, history = [] } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Kein message Feld' });

  try {
    const messages = [
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: `Du bist eine Finanz-Sprachassistentin für Guido, einen österreichischen Trader. Sprich Deutsch, locker und direkt. Antworte IMMER in maximal 3-4 kurzen Sätzen, ohne Aufzählungen oder Markdown — nur Fließtext, weil deine Antwort vorgelesen wird. Suche immer nach aktuellen Informationen wenn du nach News gefragt wirst. Keine Anlageberatung.`,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Claude ${response.status}: ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    const reply = data.content?.filter(b => b.type === 'text').map(b => b.text).join(' ').trim();
    if (!reply) throw new Error('Leere Antwort');

    return res.status(200).json({ reply });
  } catch (e) {
    console.error('assistant error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
