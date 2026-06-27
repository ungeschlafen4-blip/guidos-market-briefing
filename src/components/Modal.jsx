import React, { useEffect } from "react";
import { C, RADIUS, SHADOW } from "../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// MODAL — Basis-Overlay-Komponente
// Alle Pop-ups im Dashboard nutzen diese Basis
// ─────────────────────────────────────────────────────────────────────────────

export default function Modal({ children, onClose, maxWidth = 860, title, accentColor }) {
  const accent = accentColor || C.gold;

  // ESC-Taste zum Schließen
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:C.overlay,
        backdropFilter:"blur(10px)",
        WebkitBackdropFilter:"blur(10px)",
        display:"flex", alignItems:"flex-start", justifyContent:"center",
        padding:"40px 20px 20px",
        overflowY:"auto",
        animation:"fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:C.card,
          border:`1px solid ${accent}44`,
          borderRadius:RADIUS.xl,
          width:"100%", maxWidth,
          boxShadow:SHADOW.modal,
          position:"relative",
          animation:"slideUp 0.18s ease",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position:"absolute", top:16, right:16,
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:RADIUS.sm, width:36, height:36,
            color:C.textMid, fontSize:18, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.15s",
            zIndex:1,
          }}
          onMouseEnter={e=>{e.currentTarget.style.background=C.borderHi;e.currentTarget.style.color=C.textHi;}}
          onMouseLeave={e=>{e.currentTarget.style.background=C.surface;e.currentTarget.style.color=C.textMid;}}
        >✕</button>

        {children}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
