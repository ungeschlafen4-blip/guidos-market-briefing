import React, { useEffect, useState, useRef } from "react";
import { C } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN v4 — Sanftes Wort-für-Wort-Einblenden (wie v2) + Sound mit Fadeout
// Sound-Autoplay-Hinweis: Browser blockieren Ton ohne vorherige Nutzer-Interaktion
// auf der Domain. Lösung hier: Audio wird bereits beim allerersten Klick/Touch
// irgendwo auf der Seite "freigeschaltet" (stummer Play+Pause-Trick), sodass
// der Sound ab dem nächsten Laden zuverlässig abspielt.
// ─────────────────────────────────────────────────────────────────────────────

const GREETING_WORDS = ["Willkommen", "zurück,", "Guido."];
const AUDIO_DURATION = 7.0;
const FADE_OUT_START = AUDIO_DURATION - 1.0;
const TOTAL_DURATION = AUDIO_DURATION + 0.4;

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("zoom"); // zoom -> words -> hold -> fadeOut
  const [visibleWords, setVisibleWords] = useState(0);
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  useEffect(() => {
    // Sound-Versuch: direkt abspielen
    const tryPlay = () => {
      if (!audioRef.current) return;
      audioRef.current.volume = 0.55;
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay blockiert — wir hängen einen einmaligen Listener an,
          // der beim allerersten Klick/Touch irgendwo auf der Seite den Sound
          // alternativ startet, damit zumindest dieser Durchlauf noch Ton bekommt
          const unlock = () => {
            audioRef.current?.play().catch(() => {});
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("keydown", unlock);
          };
          window.addEventListener("click", unlock, { once:true });
          window.addEventListener("touchstart", unlock, { once:true });
          window.addEventListener("keydown", unlock, { once:true });
        });
      }
    };
    tryPlay();

    const t1 = setTimeout(() => setPhase("words"), 800);

    const wordTimers = GREETING_WORDS.map((_, i) =>
      setTimeout(() => setVisibleWords(i + 1), 800 + i * 500)
    );

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

    const t2 = setTimeout(() => setPhase("fadeOut"), (TOTAL_DURATION - 0.6) * 1000);
    const t3 = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      onDone();
    }, TOTAL_DURATION * 1000);

    return () => {
      clearTimeout(t1); clearTimeout(fadeStart); clearTimeout(t2); clearTimeout(t3);
      wordTimers.forEach(clearTimeout);
      clearInterval(fadeIntervalRef.current);
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
      <audio ref={audioRef} src="/intro-sound.mp3" preload="auto" playsInline />

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
