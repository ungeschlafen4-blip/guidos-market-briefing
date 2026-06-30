// ─────────────────────────────────────────────────────────────────────────────
// /api/assistant.js
// Server-seitiger Endpunkt für den Sprachassistenten — nutzt Claude mit
// Web-Suche, damit Antworten auf echten, aktuellen Informationen basieren.
// Läuft serverseitig (kein CORS-Problem), genau wie update-data.js.
//
// POST Body: { message: string, history: [{role, content}, ...] }
// Antwort: { reply: string }
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    // Nachrichtenverlauf zusammenbauen — History plus neue Nachricht
    const messages = [
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })), // letzte 8 Nachrichten als Kontext
      { role: 'user', content: message },
    ];

    const systemPrompt = `Du bist ein gesprächiger Finanz- und Markt-Sprachassistent für Guido, einen österreichischen Trader. Du sprichst Deutsch, locker und direkt — wie eine kompetente Kollegin, nicht förmlich.

WICHTIGE REGELN:
- Suche IMMER aktiv im Web nach aktuellen Informationen, bevor du antwortest. Verlasse dich nie nur auf dein Trainingswissen für aktuelle Ereignisse, Zahlen oder Aussagen.
- Antworte KURZ und gesprochen-tauglich (2-5 Sätze normalerweise), da deine Antwort vorgelesen wird. Keine Aufzählungen, keine Markdown-Formatierung, keine Sternchen — reiner Fließtext zum Sprechen.
- Bei der allerersten Nachricht "Was gibt's Neues?" gibst du einen kompakten Überblick über die wichtigsten aktuellen Markt-News (Krypto, Fed, Aktien, wichtige Politik-Aussagen die Märkte bewegen).
- Bei Nachfragen gehst du gezielt ins Detail zu dem, was gefragt wurde.
- Nenne konkrete Zahlen, Daten und Quellen-Hinweise wenn vorhanden, aber bleib im Gesprächston.
- Keine Anlageberatung — du informierst, du empfiehlst keine Trades.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const reply = data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();

    if (!reply) {
      throw new Error('Leere Antwort von Claude');
    }

    return res.status(200).json({ reply });
  } catch (e) {
    console.error('assistant error:', e);
    return res.status(500).json({ error: e.message });
  }
}
