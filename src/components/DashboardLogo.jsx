import React from "react";
import { C } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD LOGO — Batman-Stil, schwarz-weiß
// "G" Monogramm statt goldenem "M"
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardLogo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
      {/* Monogramm — schwarz/weiß, dezenter weißer Glow statt Gold-Schimmer */}
      <div style={{
        width:44, height:44,
        background:"linear-gradient(135deg,#1a1a1a,#000000)",
        border:`1px solid ${C.borderHi}`,
        borderRadius:8,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 4px 16px rgba(255,255,255,0.06)",
        flexShrink:0,
      }}>
        <span style={{
          fontFamily:"Georgia,serif", fontSize:22, fontWeight:900,
          color:C.textHi, letterSpacing:"-0.02em", lineHeight:1,
        }}>G</span>
      </div>
      <div>
        <div style={{
          fontFamily:"Georgia,serif",
          fontSize:26, fontWeight:700,
          color:C.textHi, letterSpacing:"0.08em",
          textTransform:"uppercase", lineHeight:1,
        }}>
          MEIN <span style={{ color:C.textMid, letterSpacing:"0.12em" }}>DASHBOARD</span>
        </div>
        <div style={{ fontSize:11, color:C.textLow, marginTop:3, letterSpacing:"0.04em" }}>
          Elliott-Wave · Live Markets · AI Analysis
        </div>
      </div>
    </div>
  );
}
