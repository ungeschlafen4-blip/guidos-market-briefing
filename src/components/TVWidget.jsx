import React, { useEffect, useRef } from "react";
import { C, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// TRADINGVIEW WIDGET — Echter eingebetteter Live-Chart
// Funktioniert für alle TradingView-Symbole
// ─────────────────────────────────────────────────────────────────────────────

export default function TVWidget({ symbol, height = 400, interval = "60" }) {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Vorherigen Inhalt löschen
    containerRef.current.innerHTML = "";

    // Widget-Div erstellen
    const widgetDiv = document.createElement("div");
    widgetDiv.style.height = `${height}px`;
    widgetDiv.style.width = "100%";
    containerRef.current.appendChild(widgetDiv);

    // TradingView Script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: "Europe/Vienna",
      theme: "dark",
      style: "1",           // Candlestick
      locale: "de_DE",
      backgroundColor: "#0f1116",
      gridColor: "#1c1f2a",
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol, interval, height]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{
        height,
        width: "100%",
        borderRadius: RADIUS.md,
        overflow: "hidden",
        background: "#0f1116",
        border: `1px solid ${C.border}`,
      }}
    />
  );
}
