// ─────────────────────────────────────────────────────────────────────────────
// THEME — Design Tokens
// Dark Terminal · Minimalist · High Contrast
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  // Backgrounds — layered depth
  bg:       "#06070a",   // deepest background
  surface:  "#0c0e14",   // cards, panels
  card:     "#111420",   // elevated cards
  cardHov:  "#161a27",   // hover state
  overlay:  "rgba(0,0,0,0.88)", // modal backdrop

  // Borders
  border:   "#1a1e2c",
  borderHi: "#252b3e",
  borderGlow: "rgba(240,180,41,0.2)", // gold glow on focus

  // Semantic colors
  bull:     "#2ecc71",   // green — up/long/bullish
  bear:     "#e74c3c",   // red — down/short/bearish
  gold:     "#f0b429",   // gold — neutral/highlight
  blue:     "#3b82f6",   // blue — info/links
  purple:   "#8b5cf6",   // purple — MCO/special
  gray:     "#374151",   // gray — low-impact events

  // Text hierarchy
  textHi:   "#eceae2",   // primary text
  textMid:  "#8892a4",   // secondary text
  textLow:  "#3d4455",   // muted text
  textGold: "#f0b429",   // highlight text

  // Impact colors
  impH:     "#e74c3c",   // high impact
  impM:     "#f0b429",   // medium impact
  impL:     "#3b82f6",   // low impact
  impN:     "#374151",   // no impact / holiday
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
  card:  "0 4px 20px rgba(0,0,0,0.4)",
  modal: "0 24px 80px rgba(0,0,0,0.8)",
  glow:  (color) => `0 0 20px ${color}33, 0 0 40px ${color}11`,
};

export const BIAS_COL = {
  bull:    C.bull,
  neutral: C.gold,
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
  N: C.impN,  // holiday/no market
};
