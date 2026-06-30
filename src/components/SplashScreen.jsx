import React, { useEffect, useState, useRef } from "react";
import { C } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN v5 — Dreistufiger Wort-für-Wort-Aufbau über die volle 7s:
// 1) Logo poppt auf
// 2) "Guido's" "Dashboard" — Wort für Wort
// 3) "Herzlich" "willkommen" "zurück," "Guido." — Wort für Wort
// Alles über die gesamte Sound-Länge verteilt, damit es nie "leer" wirkt
// ─────────────────────────────────────────────────────────────────────────────

const TITLE_WORDS = ["Guido's", "Dashboard"];
const GREETING_WORDS = ["Herzlich", "willkommen", "zurück,", "Guido."];

const AUDIO_DURATION = 7.0;
const FADE_OUT_START = AUDIO_DURATION - 1.0;
const TOTAL_DURATION = AUDIO_DURATION + 0.4;

export default function SplashScreen({ onDone }) {
  const [logoVisible, setLogoVisible] = useState(false);
  const [visibleTitleWords, setVisibleTitleWords] = useState(0);
  const [visibleGreetWords, setVisibleGreetWords] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  useEffect(() => {
    const tryPlay = () => {
      if (!audioRef.current) return;
      audioRef.current.volume = 0.55;
      const p = audioRef.current.play();
      if (p) {
        p.catch(() => {
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

    // ── Zeitplan über die volle Audiolänge verteilt ──────────────────────
    // 0.0s        Logo poppt auf
    // 0.6s, 1.0s  Titel-Wörter ("Guido's", "Dashboard")
    // 2.0s, 2.6s, 3.2s, 3.8s   Begrüßungs-Wörter (4 Stück, schön verteilt)
    // 6.0s        Sound-Fadeout beginnt (1s lang)
    // 6.8s        visueller Fadeout
    // 7.4s        Ende, Dashboard wird gezeigt

    const logoTimer = setTimeout(() => setLogoVisible(true), 0);

    const titleTimers = TITLE_WORDS.map((_, i) =>
      setTimeout(() => setVisibleTitleWords(i + 1), 600 + i * 450)
    );

    const greetStart = 600 + TITLE_WORDS.length * 450 + 500; // kleine Pause nach Titel
    const greetTimers = GREETING_WORDS.map((_, i) =>
      setTimeout(() => setVisibleGreetWords(i + 1), greetStart + i * 600)
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

    const visualFadeTimer = setTimeout(() => setFadeOut(true), (TOTAL_DURATION - 0.6) * 1000);
    const doneTimer = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      onDone();
    }, TOTAL_DURATION * 1000);

    return () => {
      clearTimeout(logoTimer);
      titleTimers.forEach(clearTimeout);
      greetTimers.forEach(clearTimeout);
      clearTimeout(fadeStart);
      clearTimeout(visualFadeTimer);
      clearTimeout(doneTimer);
      clearInterval(fadeIntervalRef.current);
    };
  }, [onDone]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"#000000",
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:30,
      opacity: fadeOut ? 0 : 1,
      transition:"opacity 0.6s ease",
      pointerEvents: fadeOut ? "none" : "auto",
    }}>
      <audio ref={audioRef} src="/intro-sound.mp3" preload="auto" playsInline />

      {/* Logo */}
      <div style={{
        width:96, height:96,
        background:"linear-gradient(135deg,#1a1a1a,#000000)",
        border:`2px solid ${C.borderHi}`,
        borderRadius:18,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 0 60px rgba(255,255,255,0.08)",
        transform: logoVisible ? "scale(1)" : "scale(0.3)",
        opacity: logoVisible ? 1 : 0,
        transition:"transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease",
      }}>
        <span style={{ fontFamily:"Georgia,serif", fontSize:52, fontWeight:900, color:"#fafafa", lineHeight:1 }}>G</span>
      </div>

      {/* Titel — Wort für Wort */}
      <div style={{ display:"flex", gap:10, minHeight:30 }}>
        {TITLE_WORDS.map((word, i) => (
          <span key={i} style={{
            fontFamily:"Georgia,serif", fontSize:20, fontWeight:700,
            color: i === 0 ? C.textHi : C.textMid,
            letterSpacing:"0.1em", textTransform:"uppercase",
            opacity: i < visibleTitleWords ? 1 : 0,
            transform: i < visibleTitleWords ? "translateY(0)" : "translateY(8px)",
            transition:"opacity 0.5s ease, transform 0.5s ease",
          }}>{word}</span>
        ))}
      </div>

      {/* Begrüßung — Wort für Wort, schön über die Zeit verteilt */}
      <div style={{ display:"flex", gap:10, minHeight:32, flexWrap:"wrap", justifyContent:"center", maxWidth:400 }}>
        {GREETING_WORDS.map((word, i) => (
          <span key={i} style={{
            fontFamily:"Georgia,serif", fontSize:24, fontWeight:400,
            color: i === GREETING_WORDS.length - 1 ? C.textHi : C.textMid,
            opacity: i < visibleGreetWords ? 1 : 0,
            transform: i < visibleGreetWords ? "translateY(0)" : "translateY(8px)",
            transition:"opacity 0.5s ease, transform 0.5s ease",
          }}>{word}</span>
        ))}
      </div>
    </div>
  );
}
