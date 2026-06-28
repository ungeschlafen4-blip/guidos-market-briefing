// ─────────────────────────────────────────────────────────────────────────────
// useLivePrices — CoinGecko API + automatisches Polling alle 30 Sekunden
// Kein API-Key nötig · Free Tier: 30 Requests/Minute
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,gold,silver&vs_currencies=usd&include_24hr_change=true&include_7d_change=true";

const CG_MAP = {
  bitcoin:  "btc",
  ethereum: "eth",
  solana:   "sol",
  gold:     "gold",
  silver:   "silver",
};

export function useLivePrices(intervalMs = 30000) {
  const [prices, setPrices] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(COINGECKO_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mapped = {};
      for (const [cgId, assetId] of Object.entries(CG_MAP)) {
        if (data[cgId]) {
          mapped[assetId] = {
            price: data[cgId].usd,
            chg24: parseFloat((data[cgId].usd_24h_change ?? 0).toFixed(1)),
            chg7:  parseFloat((data[cgId].usd_7d_change  ?? 0).toFixed(1)),
          };
        }
      }

      setPrices(mapped);
      setLastFetch(new Date().toLocaleTimeString("de-AT", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
      setError(null);
    } catch (e) {
      setError(`CoinGecko nicht verfügbar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  useEffect(() => {
    const interval = setInterval(fetchPrices, intervalMs);
    return () => clearInterval(interval);
  }, [fetchPrices, intervalMs]);

  return { prices, lastFetch, error, loading, refetch: fetchPrices };
}

export function formatPrice(price, assetId) {
  if (!price && price !== 0) return null;
  if (assetId === "btc" || assetId === "gold") return Math.round(price).toLocaleString("de-DE");
  if (assetId === "eth") return Math.round(price).toLocaleString("de-DE");
  return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
