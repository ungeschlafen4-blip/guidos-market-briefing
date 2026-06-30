import React, { useEffect, useState, useRef } from "react";
import { C } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN v3 — Spy/007-Style Intro, abgestimmt auf 7s Sound-Clip
// - Logo zoomt mit kurzem "Schärfe rein"-Effekt (wie ein Kamera-Fokus)
// - Text wird Buchstabe für Buchstabe getippt (Schreibmaschinen-Effekt)
// - Dezente Scanline/Glow-Bewegung im Hintergrund für "Geheimagent"-Feeling
// - Sound spielt automatisch, fadet in der letzten Sekunde sanft aus
// - Gesamtdauer: ~7.2s, synchron zur Musiklänge
// ─────────────────────────────────────────────────────────────────────────────

const GREETING_TEXT = "Willkommen, Guido.";
const AUDIO_DURATION = 7.0; // Sekunden, ermittelt aus der Datei
const FADE_OUT_START = AUDIO_DURATION - 1.0; // letzte Sekunde fadet aus
const TOTAL_DURATION = AUDIO_DURATION + 0.3; // kleiner Puffer bis Übergang

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("focus"); // focus -> typing -> hold -> fadeOut
  const [typedChars, setTypedChars] = useState(0);
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  useEffect(() => {
    // Sound starten
    if (audioRef.current) {
      audioRef.current.volume = 0.55;
      audioRef.current.play().catch(() => { /* Autoplay evtl. blockiert — Intro läuft optisch trotzdem */ });
    }

    // Logo-Fokus-Phase
    const t1 = setTimeout(() => setPhase("typing"), 900);

    // Schreibmaschinen-Effekt: Buchstabe für Buchstabe, etwas unregelmäßig wie echtes Tippen
    let charIndex = 0;
    const typeNextChar = () => {
      if (charIndex <= GREETING_TEXT.length) {
        setTypedChars(charIndex);
        charIndex++;
        const delay = 55 + Math.random() * 70; // leicht unregelmäßiges Tippen
        typingTimerRef.current = setTimeout(typeNextChar, delay);
      }
    };
    const typingTimerRef = { current: null };
    const typingStart = setTimeout(typeNextChar, 950);

    // Sound-Fadeout in der letzten Sekunde
    const fadeStart = setTimeout(() => {
      if (!audioRef.current) return;
      const fadeSteps = 20;
      const stepTime = 1000 / fadeSteps;
      let step = 0;
      fadeIntervalRef.current = setInterval(() => {
        step++;
        if (audioRef.current) {
          audioRef.current.volume = Math.max(0, 0.55 * (1 - step / fadeSteps));
        }
        if (step >= fadeSteps) clearInterval(fadeIntervalRef.current);
      }, stepTime);
    }, FADE_OUT_START * 1000);

    // Visueller Fadeout kurz vor Ende
    const t2 = setTimeout(() => setPhase("fadeOut"), (TOTAL_DURATION - 0.6) * 1000);
    const t3 = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      onDone();
    }, TOTAL_DURATION * 1000);

    return () => {
      clearTimeout(t1); clearTimeout(typingStart); clearTimeout(fadeStart);
      clearTimeout(t2); clearTimeout(t3);
      clearTimeout(typingTimerRef.current);
      clearInterval(fadeIntervalRef.current);
    };
  }, [onDone]);

  const displayedText = GREETING_TEXT.slice(0, typedChars);
  const showCursor = phase === "typing" && typedChars < GREETING_TEXT.length;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"#000000",
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:32,
      opacity: phase==="fadeOut" ? 0 : 1,
      transition:"opacity 0.6s ease",
      pointerEvents: phase==="fadeOut" ? "none" : "auto",
      overflow:"hidden",
    }}>
      <audio ref={audioRef} src="/intro-sound.mp3" preload="auto" />

      {/* Dezente bewegte Scanline im Hintergrund — Spy-Feeling */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
        backgroundSize:"100% 200%",
        animation:"scanMove 4s linear infinite",
      }}/>

      {/* Logo mit Kamera-Fokus-Effekt */}
      <div style={{
        width:100, height:100,
        background:"linear-gradient(135deg,#1a1a1a,#000000)",
        border:`2px solid ${C.borderHi}`,
        borderRadius:18,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: phase==="focus" ? "0 0 0 rgba(255,255,255,0)" : "0 0 70px rgba(255,255,255,0.1)",
        transform: phase==="focus" ? "scale(1.4)" : "scale(1)",
        filter: phase==="focus" ? "blur(8px)" : "blur(0px)",
        opacity: phase==="focus" ? 0.3 : 1,
        transition:"transform 0.9s cubic-bezier(0.16,1,0.3,1), filter 0.9s ease, opacity 0.7s ease, box-shadow 0.9s ease",
      }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:54, fontWeight:900, color:"#fafafa", lineHeight:1 }}>G</span>
      </div>

      <div style={{
        fontFamily:"Georgia,serif", fontSize:18, fontWeight:700,
        color:C.textHi, letterSpacing:"0.2em", textTransform:"uppercase",
        opacity: phase==="focus" ? 0 : 1,
        transition:"opacity 0.7s ease 0.2s",
      }}>
        MEIN <span style={{ color:C.textMid }}>DASHBOARD</span>
      </div>

      {/* Schreibmaschinen-Begrüßung */}
      <div style={{ minHeight:36, display:"flex", alignItems:"center" }}>
        <span style={{
          fontFamily:"'Courier New', monospace", fontSize:22, fontWeight:600,
          color:C.textHi, letterSpacing:"0.04em",
        }}>
          {displayedText}
          {showCursor && (
            <span style={{
              display:"inline-block", width:11, height:22, background:C.textHi,
              marginLeft:3, animation:"blink 0.7s step-end infinite", verticalAlign:"text-bottom",
            }}/>
          )}
        </span>
      </div>

      <style>{`
        @keyframes blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }
        @keyframes scanMove { 0% { background-position: 0 -100% } 100% { background-position: 0 200% } }
      `}</style>
    </div>
  );
}
