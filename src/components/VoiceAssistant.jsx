import React, { useState, useRef, useEffect, useCallback } from "react";
import { C, FONT, RADIUS } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// VOICE ASSISTANT — "Jarvis"-Stil Sprachassistent für Markt-News
// - Begrüßt automatisch beim Öffnen mit "Was gibt's Neues?"
// - Antwortet per Sprachausgabe (Browser SpeechSynthesis, weibliche Stimme)
// - Mikrofon-Eingabe per Browser SpeechRecognition (Chrome/Edge unterstützt das gut,
//   Safari/Firefox eingeschränkter — Fallback ist immer das Textfeld)
// ─────────────────────────────────────────────────────────────────────────────

// ── Weibliche deutsche Stimme finden ──────────────────────────────────────────
function findGermanFemaleVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  // Bevorzugt: deutsche Stimme mit weiblich klingendem Namen
  const femaleNames = ["female", "anna", "petra", "helena", "martina", "katja", "google deutsch"];
  const german = voices.filter(v => v.lang?.toLowerCase().startsWith("de"));
  const femaleMatch = german.find(v => femaleNames.some(n => v.name.toLowerCase().includes(n)));
  return femaleMatch || german[0] || voices[0] || null;
}

function speak(text, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel(); // vorherige Sprache abbrechen falls noch läuft
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = 1.0;
  utterance.pitch = 1.05; // leicht höher = klingt tendenziell weiblicher
  const voice = findGermanFemaleVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

// ── Mikrofon-Spracherkennung (falls vom Browser unterstützt) ─────────────────
function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = "de-DE";
  rec.continuous = false;
  rec.interimResults = false;
  return rec;
}

async function askAssistant(message, history) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error(`Assistant ${res.status}`);
  const data = await res.json();
  return data.reply;
}

export default function VoiceAssistant({ onClose }) {
  const [messages, setMessages] = useState([]); // {role:"user"|"assistant", content}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);
  const hasGreetedRef = useRef(false);

  // ── Automatische Begrüßung beim ersten Öffnen ──────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setError(null);
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const reply = await askAssistant(text, history);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setSpeaking(true);
      speak(reply, () => setSpeaking(false));
    } catch (e) {
      setError("Verbindung fehlgeschlagen — Backend evtl. noch nicht eingerichtet");
    } finally {
      setLoading(false);
    }
  }, [messages]);

  useEffect(() => {
    if (!hasGreetedRef.current) {
      hasGreetedRef.current = true;
      sendMessage("Was gibt's Neues?");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Stimmen-Liste laden (manche Browser laden sie asynchron nach)
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMessage(text);
  };

  const handleMicClick = () => {
    const rec = getSpeechRecognition();
    if (!rec) {
      setError("Mikrofon-Spracheingabe wird von diesem Browser nicht unterstützt — bitte tippen");
      return;
    }
    recognitionRef.current = rec;
    setListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      sendMessage(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.92)",
      backdropFilter:"blur(10px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:640, height:"min(720px, 85vh)",
        background:C.card, border:`1px solid ${C.borderHi}`,
        borderRadius:RADIUS.xl, display:"flex", flexDirection:"column",
        boxShadow:"0 24px 80px rgba(0,0,0,0.8)", overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:44, height:44, borderRadius:"50%",
            background: speaking ? "linear-gradient(135deg,#2ecc71,#1a8a4a)" : "linear-gradient(135deg,#1a1a1a,#000000)",
            border:`2px solid ${speaking?C.bull:C.borderHi}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.3s ease",
            animation: speaking ? "voicePulse 1s ease-in-out infinite" : "none",
            flexShrink:0,
          }}>
            <span style={{ fontSize:20 }}>{speaking ? "🔊" : "🎙️"}</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:FONT.serif, fontSize:18, fontWeight:700, color:C.textHi }}>Markt-Assistentin</div>
            <div style={{ fontSize:12, color: speaking ? C.bull : listening ? C.gold : C.textLow }}>
              {speaking ? "spricht..." : listening ? "hört zu..." : loading ? "denkt nach..." : "bereit"}
            </div>
          </div>
          {speaking && (
            <button onClick={stopSpeaking} style={{
              background:C.surface, border:`1px solid ${C.border}`, borderRadius:RADIUS.sm,
              padding:"6px 12px", color:C.textMid, fontSize:12, fontWeight:600, cursor:"pointer",
            }}>⏸ Stumm</button>
          )}
          <button onClick={onClose} style={{
            background:C.surface, border:`1px solid ${C.border}`, borderRadius:RADIUS.sm,
            width:36, height:36, color:C.textMid, fontSize:18, cursor:"pointer",
          }}>✕</button>
        </div>

        {/* Chat-Verlauf */}
        <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth:"85%",
              background: m.role === "user" ? C.surface : C.bg,
              border:`1px solid ${C.border}`,
              borderRadius:RADIUS.lg,
              padding:"12px 16px",
            }}>
              <div style={{ fontSize:11, color:C.textLow, marginBottom:5, fontWeight:700 }}>
                {m.role === "user" ? "Du" : "Assistentin"}
              </div>
              <div style={{ fontSize:14, color:C.textHi, lineHeight:1.6 }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf:"flex-start", fontSize:13, color:C.textLow, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> sucht aktuelle Infos...
            </div>
          )}
          {error && (
            <div style={{ alignSelf:"flex-start", fontSize:13, color:C.bear, background:"#160606", border:`1px solid ${C.bear}44`, borderRadius:RADIUS.md, padding:"10px 14px" }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Eingabe */}
        <div style={{ padding:"16px 20px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={handleMicClick} disabled={listening || loading} style={{
            width:44, height:44, borderRadius:"50%", flexShrink:0,
            background: listening ? C.bull : C.surface,
            border:`1px solid ${listening?C.bull:C.border}`,
            color: listening ? "#000" : C.textMid,
            fontSize:18, cursor: listening||loading ? "wait" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.2s",
          }}>🎤</button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            placeholder="Frag nach Details, oder nutz das Mikrofon..."
            style={{
              flex:1, background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:RADIUS.md, padding:"12px 16px", color:C.textHi,
              fontSize:14, outline:"none",
            }}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} style={{
            background:C.textHi, color:C.bg, border:"none", borderRadius:RADIUS.md,
            padding:"12px 20px", fontSize:14, fontWeight:700, cursor: loading?"wait":"pointer",
            opacity: !input.trim() ? 0.4 : 1,
          }}>Senden</button>
        </div>
      </div>

      <style>{`
        @keyframes voicePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(46,204,113,0.5); } 50% { box-shadow: 0 0 0 10px rgba(46,204,113,0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
