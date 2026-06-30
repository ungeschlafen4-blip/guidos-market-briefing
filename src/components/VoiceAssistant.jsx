import React, { useState, useRef, useEffect, useCallback } from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// VOICE ASSISTANT v2 — Iron-Man-Style
// Animierter Orb: Punkte vibrieren wenn die Assistentin spricht
// Öffnet als Vollbild-Overlay wenn der Tab gedrückt wird
// ─────────────────────────────────────────────────────────────────────────────

// ── Weibliche deutsche Stimme ────────────────────────────────────────────────
function getBestVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  const pref = ["google deutsch", "anna", "helena", "petra", "female", "google de"];
  const de = voices.filter(v => v.lang?.toLowerCase().startsWith("de"));
  return de.find(v => pref.some(p => v.name.toLowerCase().includes(p))) || de[0] || voices[0] || null;
}

function speak(text, onStart, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.95;
  u.pitch = 1.1;
  // Stimmen evtl. noch nicht geladen — kurz warten
  const setVoice = () => { const v = getBestVoice(); if (v) u.voice = v; };
  setVoice();
  u.onstart = () => onStart?.();
  u.onend   = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

// ── Animierter Orb ────────────────────────────────────────────────────────────
const ORB_DOTS = 24;
function AssistantOrb({ speaking, loading }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 240;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2, cy = size / 2, r = 80;

    const draw = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      ctx.clearRect(0, 0, size, size);

      // Hintergrund-Glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.4);
      grad.addColorStop(0, speaking ? "rgba(46,204,113,0.08)" : "rgba(255,255,255,0.04)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Orb-Ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = speaking ? "rgba(46,204,113,0.3)" : "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Punkte auf dem Ring
      for (let i = 0; i < ORB_DOTS; i++) {
        const angle = (i / ORB_DOTS) * Math.PI * 2;
        const wave = speaking
          ? Math.sin(t * 3 + i * 0.8) * 12 + Math.sin(t * 5 + i * 1.3) * 6
          : loading
          ? Math.sin(t * 2 + i * 0.5) * 4
          : Math.sin(t * 0.8 + i * 0.4) * 2;

        const dotR = r + wave;
        const x = cx + Math.cos(angle) * dotR;
        const y = cy + Math.sin(angle) * dotR;

        // Farbe der Punkte — Regenbogen-Spektrum im speaking-Modus, sonst Graustufen
        let hue, sat, lit;
        if (speaking) {
          hue = (i / ORB_DOTS) * 360 + t * 40;
          sat = 80;
          lit = 55 + Math.sin(t * 4 + i) * 15;
        } else if (loading) {
          hue = 140;
          sat = 60;
          lit = 40 + Math.sin(t * 3 + i) * 10;
        } else {
          hue = 0;
          sat = 0;
          lit = 25 + Math.sin(t + i * 0.3) * 8;
        }

        const dotSize = speaking ? 3 + Math.abs(wave) / 6 : 2.5;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue},${sat}%,${lit}%)`;
        ctx.fill();
      }

      // Mittlerer Puls
      const innerR = speaking ? 20 + Math.sin(t * 5) * 8 : 14;
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR * 1.5);
      innerGrad.addColorStop(0, speaking ? "rgba(46,204,113,0.6)" : "rgba(200,200,200,0.2)");
      innerGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, innerR * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [speaking, loading]);

  return (
    <canvas ref={canvasRef} style={{ width:240, height:240, display:"block" }}/>
  );
}

// ── Spracherkennung ──────────────────────────────────────────────────────────
function getSpeechRec() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "de-DE";
  r.continuous = false;
  r.interimResults = false;
  return r;
}

async function callAssistant(message, history) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data.reply;
}

// ── Hauptkomponente ──────────────────────────────────────────────────────────
export default function VoiceAssistant({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const hasGreeted = useRef(false);
  const recRef = useRef(null);

  // Stimmen vorladen
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setError(null);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setMessages(prev => [...prev, { role:"user", content:text }]);
    setLoading(true);
    try {
      const hist = messages.map(m => ({ role:m.role, content:m.content }));
      const reply = await callAssistant(text, hist);
      setMessages(prev => [...prev, { role:"assistant", content:reply }]);
      setLoading(false);
      setSpeaking(true);
      speak(reply, () => setSpeaking(true), () => setSpeaking(false));
    } catch(e) {
      setError(e.message);
      setLoading(false);
    }
  }, [messages, loading]);

  // Auto-Begrüßung
  useEffect(() => {
    if (!hasGreeted.current) {
      hasGreeted.current = true;
      setTimeout(() => sendMessage("Was gibt es Neues an den Märkten heute?"), 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior:"smooth" });
  }, [messages]);

  const handleMic = () => {
    if (listening) { recRef.current?.stop(); return; }
    const rec = getSpeechRec();
    if (!rec) return;
    recRef.current = rec;
    setListening(true);
    rec.onresult = e => {
      const t = e.results[0][0].transcript;
      setListening(false);
      setInput("");
      sendMessage(t);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    rec.start();
  };

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    setInput("");
    sendMessage(t);
  };

  const statusText = speaking ? "spricht..." : listening ? "hört zu..." : loading ? "sucht Infos..." : "bereit";
  const statusColor = speaking ? C.bull : listening ? "#f0b429" : loading ? C.textMid : C.textLow;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.95)",
      backdropFilter:"blur(16px)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"space-between",
      padding:"40px 20px 24px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:680,
        display:"flex", flexDirection:"column", alignItems:"center",
        gap:0, height:"100%",
      }}>
        {/* Header */}
        <div style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
          <div>
            <div style={{ fontFamily:FONT.serif, fontSize:22, fontWeight:700, color:C.textHi, letterSpacing:"0.05em" }}>
              Markt-Assistentin
            </div>
            <div style={{ fontSize:13, color:statusColor, marginTop:4, transition:"color 0.3s" }}>
              {statusText}
            </div>
          </div>
          <button onClick={onClose} style={{
            background:C.surface, border:`1px solid ${C.border}`, borderRadius:RADIUS.sm,
            width:38, height:38, color:C.textMid, fontSize:18, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>✕</button>
        </div>

        {/* Orb */}
        <div style={{ marginBottom:28 }}>
          <AssistantOrb speaking={speaking} loading={loading} />
        </div>

        {/* Chat-Verlauf */}
        <div ref={scrollRef} style={{
          width:"100%", flex:1, overflowY:"auto", marginBottom:20,
          display:"flex", flexDirection:"column", gap:12,
          maxHeight:"30vh",
        }}>
          {messages.map((m,i) => (
            <div key={i} style={{
              alignSelf: m.role==="user" ? "flex-end" : "flex-start",
              maxWidth:"85%",
              background: m.role==="user" ? "rgba(255,255,255,0.06)" : "rgba(46,204,113,0.06)",
              border:`1px solid ${m.role==="user"?C.border:"rgba(46,204,113,0.2)"}`,
              borderRadius:RADIUS.lg, padding:"10px 14px",
            }}>
              <div style={{ fontSize:10, color:C.textLow, marginBottom:4, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {m.role==="user" ? "Du" : "Assistentin"}
              </div>
              <div style={{ fontSize:14, color:C.textHi, lineHeight:1.65 }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf:"flex-start", fontSize:13, color:C.textLow, display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> sucht aktuelle Infos im Web...
            </div>
          )}
          {error && (
            <div style={{ alignSelf:"flex-start", fontSize:12, color:C.bear, background:"#160606", border:`1px solid ${C.bear}33`, borderRadius:RADIUS.md, padding:"10px 14px", maxWidth:"90%" }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Eingabe */}
        <div style={{ width:"100%", display:"flex", gap:10, alignItems:"center" }}>
          {micSupported && (
            <button onClick={handleMic} style={{
              width:48, height:48, borderRadius:"50%", flexShrink:0,
              background: listening ? C.bull : "rgba(255,255,255,0.06)",
              border:`1px solid ${listening?C.bull:C.border}`,
              color: listening ? "#000" : C.textMid,
              fontSize:20, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.2s",
              animation: listening ? "micPulse 1s ease-in-out infinite" : "none",
            }}>🎤</button>
          )}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleSend()}
            placeholder={micSupported ? "Tippen oder Mikrofon..." : "Frag nach Details..."}
            style={{
              flex:1, background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
              borderRadius:RADIUS.md, padding:"13px 16px", color:C.textHi,
              fontSize:14, outline:"none",
              fontFamily:FONT.sans,
            }}
          />
          <button onClick={handleSend} disabled={!input.trim() || loading} style={{
            background: input.trim() ? C.bull : "rgba(255,255,255,0.08)",
            color: input.trim() ? "#000" : C.textLow,
            border:"none", borderRadius:RADIUS.md,
            padding:"13px 20px", fontSize:14, fontWeight:700, cursor: input.trim()?"pointer":"default",
            transition:"all 0.2s",
            flexShrink:0,
          }}>Senden</button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0)}to{transform:rotate(360deg)} }
        @keyframes micPulse { 0%,100%{box-shadow:0 0 0 0 rgba(46,204,113,0.5)} 50%{box-shadow:0 0 0 10px rgba(46,204,113,0)} }
      `}</style>
    </div>
  );
}
