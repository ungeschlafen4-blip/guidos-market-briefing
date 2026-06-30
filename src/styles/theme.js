// ─────────────────────────────────────────────────────────────────────────────
// THEME v2 — Schwarz-Weiß / Batman-Stil
// Nur Grün (bullish) und Rot (bearish) als Akzentfarben — Gold raus
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  // Backgrounds — reines Schwarz/Grau, kein Gold-Touch mehr
  bg:       "#000000",   // tiefstes Schwarz
  surface:  "#0a0a0a",   // Karten, Panels
  card:     "#101010",   // erhöhte Karten
  cardHov:  "#161616",   // Hover-Zustand
  overlay:  "rgba(0,0,0,0.92)", // Modal-Backdrop

  // Borders — neutrale Graustufen
  border:   "#1f1f1f",
  borderHi: "#2e2e2e",
  borderGlow: "rgba(255,255,255,0.12)", // weißes Glow statt Gold

  // Semantische Farben — NUR Grün/Rot bleiben farbig
  bull:     "#2ecc71",   // grün — up/long/bullish
  bear:     "#e74c3c",   // rot — down/short/bearish
  gold:     "#e8e8e8",   // "gold" jetzt eigentlich helles Grau/Weiß als Akzent
  blue:     "#9ca3af",   // statt blau: neutrales Grau
  purple:   "#d1d5db",   // statt lila: helles Grau
  gray:     "#374151",   // bleibt für Kalender-Feiertage

  // Text-Hierarchie
  textHi:   "#fafafa",   // primärer Text — fast reines Weiß
  textMid:  "#9ca3af",   // sekundärer Text — neutrales Grau
  textLow:  "#52525b",   // gedämpfter Text
  textGold: "#e8e8e8",   // Highlight-Text — jetzt Weiß statt Gold

  // Impact-Farben (Kalender)
  impH:     "#e74c3c",   // hoher Impact — bleibt rot
  impM:     "#a3a3a3",   // mittlerer Impact — grau statt gold
  impL:     "#6b7280",   // niedriger Impact — dunkleres grau statt blau
  impN:     "#374151",   // Feiertag/kein Markt
};

export const FONT = {
  serif:  "'Georgia', 'Times New Roman', serif",
  sans:   "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono:   "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
};

export const SHADOW = {
  card:  "0 4px 20px rgba(0,0,0,0.6)",
  modal: "0 24px 80px rgba(0,0,0,0.9)",
  glow:  (color) => `0 0 20px ${color}33, 0 0 40px ${color}11`,
};

export const BIAS_COL = {
  bull:    C.bull,
  neutral: C.textMid,   // statt Gold: neutrales Grau
  bear:    C.bear,
};

export const DIR_ICON = {
  bull:    "▲",
  neutral: "◆",
  bear:    "▼",
};

export const IMP_COL = {
  H: C.impH,
  M: C.impM,
  L: C.impL,
  N: C.impN,
};
