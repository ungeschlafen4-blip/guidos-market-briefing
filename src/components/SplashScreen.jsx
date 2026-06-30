import React, { useEffect, useState } from "react";
import { C } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN — kurze Intro-Animation beim Laden/Refresh
// Logo zoomt rein, dann verblasst der Screen und gibt das Dashboard frei
// Dauer: ca. 1.8 Sekunden gesamt
// ─────────────────────────────────────────────────────────────────────────────

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("zoom"); // zoom -> hold -> fadeOut -> done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 700);
    const t2 = setTimeout(() => setPhase("fadeOut"), 1200);
    const t3 = setTimeout(() => onDone(), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"#000000",
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:20,
      opacity: phase==="fadeOut" ? 0 : 1,
      transition:"opacity 0.6s ease",
      pointerEvents: phase==="fadeOut" ? "none" : "auto",
    }}>
      <div style={{
        width:96, height:96,
        background:"linear-gradient(135deg,#1a1a1a,#000000)",
        border:`2px solid ${C.borderHi}`,
        borderRadius:18,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 0 60px rgba(255,255,255,0.08)",
        transform: phase==="zoom" ? "scale(0.3)" : "scale(1)",
        opacity: phase==="zoom" ? 0 : 1,
        transition:"transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease",
      }}>
        <span style={{
          fontFamily:"Georgia,serif", fontSize:52, fontWeight:900,
          color:"#fafafa", lineHeight:1,
        }}>G</span>
      </div>

      <div style={{
        fontFamily:"Georgia,serif", fontSize:18, fontWeight:700,
        color:C.textHi, letterSpacing:"0.18em", textTransform:"uppercase",
        opacity: phase==="zoom" ? 0 : 1,
        transition:"opacity 0.6s ease 0.3s",
      }}>
        MEIN <span style={{ color:C.textMid }}>DASHBOARD</span>
      </div>
    </div>
  );
}
