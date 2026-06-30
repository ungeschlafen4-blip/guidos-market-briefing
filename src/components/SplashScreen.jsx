import React, { useEffect, useState, useRef } from "react";
import { C } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN v2 — Länger (4s), Wort-für-Wort-Begrüßung, optionaler Sound
// Sound-Datei: /public/intro-sound.mp3 (falls vorhanden, sonst stumm)
// Browser blocken Auto-Play mit Ton ohne Nutzer-Interaktion teilweise —
// daher try/catch beim Abspielen, damit nichts crasht falls es blockiert wird.
// ─────────────────────────────────────────────────────────────────────────────

const GREETING_WORDS = ["Willkommen", "Guido."];

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("zoom"); // zoom -> words -> hold -> fadeOut
  const [visibleWords, setVisibleWords] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Sound versuchen abzuspielen (falls Datei vorhanden)
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => { /* Autoplay blockiert — kein Problem, läuft stumm weiter */ });
    }

    const t1 = setTimeout(() => setPhase("words"), 800);

    // Wörter nacheinander einblenden
    const wordTimers = GREETING_WORDS.map((_, i) =>
      setTimeout(() => setVisibleWords(i + 1), 800 + i * 450)
    );

    const t2 = setTimeout(() => setPhase("hold"), 800 + GREETING_WORDS.length * 450 + 600);
    const t3 = setTimeout(() => setPhase("fadeOut"), 3400);
    const t4 = setTimeout(() => onDone(), 4000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      wordTimers.forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"#000000",
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:28,
      opacity: phase==="fadeOut" ? 0 : 1,
      transition:"opacity 0.6s ease",
      pointerEvents: phase==="fadeOut" ? "none" : "auto",
    }}>
      {/* Optionaler Sound — Datei muss unter /public/intro-sound.mp3 liegen */}
      <audio ref={audioRef} src="/intro-sound.mp3" preload="auto" />

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
        <span style={{ fontFamily:"Georgia,serif", fontSize:52, fontWeight:900, color:"#fafafa", lineHeight:1 }}>G</span>
      </div>

      <div style={{
        fontFamily:"Georgia,serif", fontSize:18, fontWeight:700,
        color:C.textHi, letterSpacing:"0.18em", textTransform:"uppercase",
        opacity: phase==="zoom" ? 0 : 1,
        transition:"opacity 0.6s ease 0.3s",
      }}>
        MEIN <span style={{ color:C.textMid }}>DASHBOARD</span>
      </div>

      {/* Wort-für-Wort Begrüßung */}
      <div style={{ display:"flex", gap:10, minHeight:32 }}>
        {GREETING_WORDS.map((word, i) => (
          <span key={i} style={{
            fontFamily:"Georgia,serif", fontSize:24, fontWeight:400,
            color: i === GREETING_WORDS.length - 1 ? C.textHi : C.textMid,
            opacity: i < visibleWords ? 1 : 0,
            transform: i < visibleWords ? "translateY(0)" : "translateY(8px)",
            transition:"opacity 0.5s ease, transform 0.5s ease",
          }}>{word}</span>
        ))}
      </div>
    </div>
  );
}
