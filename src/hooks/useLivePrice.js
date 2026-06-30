// ─────────────────────────────────────────────────────────────────────────────
// useLivePrice — zentraler Hook für Sekundentakt-Live-Preise via Binance WebSocket
// Wird von Asset-Karte UND Chart gemeinsam genutzt → garantiert synchron,
// da beide denselben State lesen statt zwei getrennte Abfragen zu machen.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

const BINANCE_SYMBOL = { btc: "btcusdt", eth: "ethusdt", sol: "solusdt" };

export function useLivePrice(assetId) {
  const [price, setPrice] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const sym = BINANCE_SYMBOL[assetId];
    if (!sym) return;

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.p) setPrice(parseFloat(msg.p));
      } catch {}
    };

    return () => { ws.close(); };
  }, [assetId]);

  return { price, connected };
}
