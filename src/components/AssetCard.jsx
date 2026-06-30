import React, { useState } from "react";
import Modal from "./Modal";
import UnifiedChart from "./UnifiedChart";
import { useLivePrice } from "../hooks/useLivePrice";
import { C, FONT, RADIUS, BIAS_COL, DIR_ICON } from "../styles/theme";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// ASSET CARD v10
// Preis-Anzeige (Header der Karte) und Chart teilen jetzt denselben
// Live-Preis-State (useLivePrice via Binance WebSocket, Sekundentakt) —
// garantiert synchron für BTC/ETH/SOL. Gold/Silber bleiben bei ihrem
// 30s-REST-Update, da Yahoo keinen kostenlosen WebSocket anbietet.
// ─────────────────────────────────────────────────────────────────────────────

function WeeklyChart({ data, levels=[], unit="$", h=380 }) {
  if (!data?.length) return null;
  const vals = data.map(d=>d.p);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = (mx-mn)*0.08;
  const yMin = mn-pad, yMax = mx+pad;
  const start = data[0], end = data[data.length-1];
  const isUp = end.p >= start.p;
  const pct = ((end.p-start.p)/start.p*100).toFixed(1);
  const trendCol = isUp ? C.bull : C.bear;
  return (
    <div style={{position:"relative"}}>
      <div style={{position:"absolute",top:6,left:8,zIndex:1,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:11,fontWeight:800,color:trendCol}}>6 MONATE WEEKLY</span>
        <span style={{fontSize:11,fontWeight:700,color:trendCol}}>{isUp?"+":""}{pct}%</span>
      </div>
      <ResponsiveContainer width="100%" height={h}>
        <LineChart data={data} margin={{top:28,right:16,left:4,bottom:24}}>
          <CartesianGrid stroke={C.border} strokeDasharray="3 3"/>
          <YAxis domain={[yMin,yMax]} tick={{fill:C.textMid,fontSize:11,fontFamily:FONT.mono}} width={72}
            tickFormatter={v=>`${unit}${v>=1000?Math.round(v).toLocaleString("de-DE"):v.toFixed(2)}`}
            axisLine={{stroke:C.borderHi}} tickLine={{stroke:C.border}}/>
          <XAxis dataKey="t" tick={{fill:C.textMid,fontSize:10}} axisLine={{stroke:C.borderHi}} tickLine={{stroke:C.border}} interval={Math.floor(data.length/6)} height={28}/>
          <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:6,fontSize:12,color:C.textHi}} formatter={v=>[`${unit}${v.toLocaleString("de-DE")}`,""]} labelStyle={{color:C.textMid}}/>
          {levels.map((lv,i)=>(<ReferenceLine key={i} y={lv.v} stroke={lv.col} strokeDasharray="5 3" strokeWidth={1.5} label={{value:lv.lbl,position:"insideTopRight",fill:lv.col,fontSize:11,fontWeight:700}}/>))}
          <Line type="monotone" dataKey="p" stroke={trendCol} strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{r:6,fill:trendCol,stroke:C.bg,strokeWidth:2}}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function WaveBox({ currentWave, waveStructure, nextWaves, waveDetail, title="Elliott-Wellen-Position" }) {
  return (
    <div style={{background:C.surface,border:`1px solid ${C.gold}33`,borderRadius:RADIUS.lg,padding:"18px 22px",marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <span style={{fontSize:20}}>〰️</span>
        <span style={{fontSize:15,fontWeight:800,color:C.gold}}>{title}</span>
        {waveStructure && <span style={{fontSize:13,color:C.textMid,marginLeft:"auto"}}>{waveStructure}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:C.bg,borderRadius:RADIUS.md,padding:"12px 16px"}}>
          <div style={{fontSize:11,color:C.textLow,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Aktuelle Welle</div>
          <div style={{fontSize:22,fontWeight:800,color:C.gold,fontFamily:FONT.mono}}>{currentWave||"?"}</div>
        </div>
        <div style={{background:C.bg,borderRadius:RADIUS.md,padding:"12px 16px"}}>
          <div style={{fontSize:11,color:C.textLow,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Nächste Szenarien</div>
          <div style={{fontSize:14,fontWeight:700,color:C.textMid}}>{nextWaves||"Abwarten"}</div>
        </div>
      </div>
      <p style={{fontSize:14,color:C.textMid,lineHeight:1.8,margin:0}}>{waveDetail}</p>
    </div>
  );
}

function fmtLivePrice(price, id) {
  if (price === null || price === undefined) return null;
  if (id === "btc") return Math.round(price).toLocaleString("de-DE");
  if (id === "eth") return Math.round(price).toLocaleString("de-DE");
  return price.toLocaleString("de-DE", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function FocusModal({ asset: a, livePrice, onClose }) {
  const [view, setView] = useState("short");
  const bc = BIAS_COL[a.bias] || C.gold;
  const displayPrice = fmtLivePrice(livePrice, a.id) || a.price;
  const dirReason = a.chg24>0
    ? {icon:"📈",color:C.bull,label:"Aktuell steigend — Warum?"}
    : a.chg24<0
    ? {icon:"📉",color:C.bear,label:"Aktuell fallend — Warum?"}
    : {icon:"➡️",color:C.gold,label:"Seitwärts — Warum?"};

  return (
    <Modal onClose={onClose} maxWidth={1020} accentColor={bc}>
      <div style={{padding:"28px 36px 28px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:22}}>
          <span style={{fontSize:46,lineHeight:1}}>{a.emoji}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <h2 style={{fontFamily:FONT.serif,fontSize:30,color:C.textHi,margin:0}}>{a.name}</h2>
              <span style={{fontSize:13,color:C.textLow}}>{a.ticker}</span>
              <span style={{fontSize:12,fontWeight:700,color:bc,border:`1px solid ${bc}44`,borderRadius:5,padding:"3px 12px"}}>
                {DIR_ICON[a.bias]} {a.bias==="bull"?"BULLISH":a.bias==="bear"?"BEARISH":"NEUTRAL"}
              </span>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:14,marginTop:8}}>
              <span style={{fontSize:40,fontWeight:700,color:C.textHi,fontVariantNumeric:"tabular-nums",fontFamily:FONT.mono}}>{a.unit}{displayPrice}</span>
              <span style={{fontSize:17,fontWeight:700,color:a.chg24>=0?C.bull:C.bear}}>{a.chg24>=0?"+":""}{a.chg24}% 24h</span>
              <span style={{fontSize:14,fontWeight:600,color:a.chg7>=0?C.bull:C.bear}}>{a.chg7>=0?"+":""}{a.chg7}% 7D</span>
            </div>
          </div>
        </div>

        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["short","📊 Kurzfristig (7 Tage)"],["long","📈 Langfristig (6 Monate Weekly)"],["tv","🔗 TradingView Charts"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{
              flex:1,padding:"10px 0", background:view===v?C.surface:"transparent",
              border:view===v?`1px solid ${C.gold}55`:`1px solid ${C.border}`,
              borderRadius:RADIUS.sm,color:view===v?C.gold:C.textMid,
              fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s",
            }}>{l}</button>
          ))}
        </div>

        {view==="short" && (
          <div>
            <div style={{border:`1px solid ${C.border}`,borderRadius:RADIUS.md,overflow:"hidden",padding:"8px 4px",background:C.surface,marginBottom:16}}>
              <UnifiedChart assetId={a.id} unit={a.unit} h={360} levels={a.levels||[]} livePrice={livePrice}/>
            </div>
            <WaveBox title="Kurzfristige Elliott-Wellen-Position (1H/4H)" currentWave={a.currentWave} waveStructure={a.wave?.split("—")[0]?.trim()} nextWaves={a.nextWaves} waveDetail={a.waveDetail}/>
          </div>
        )}

        {view==="long" && (
          <div>
            <div style={{border:`1px solid ${C.border}`,borderRadius:RADIUS.md,overflow:"hidden",padding:"8px 4px",background:C.surface,marginBottom:16}}>
              <WeeklyChart data={a.pathWeekly} levels={a.levelsWeekly||[]} unit={a.unit} h={380}/>
            </div>
            <WaveBox title="Übergeordnete Elliott-Struktur (Weekly)" currentWave={a.currentWave} waveStructure={a.waveStructure} nextWaves={a.nextWaves} waveDetail={a.waveWeekly||a.waveDetail}/>
          </div>
        )}

        {view==="tv" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={{background:C.surface,borderRadius:RADIUS.lg,border:`1px solid ${C.blue}44`,padding:"28px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:14,textAlign:"center"}}>
              <span style={{fontSize:36}}>⚡</span>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.textHi,marginBottom:6}}>Kurzfristiger Chart</div>
                <div style={{fontSize:13,color:C.textMid,marginBottom:16}}>1H / 4H mit Wellenzählung<br/>und kurzfristigen Levels</div>
                <a href={a.tvLink} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:C.blue,color:"#fff",textDecoration:"none",padding:"12px 24px",borderRadius:RADIUS.md,fontSize:14,fontWeight:700}}>📊 Öffnen →</a>
              </div>
            </div>
            <div style={{background:C.surface,borderRadius:RADIUS.lg,border:`1px solid ${C.gold}44`,padding:"28px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:14,textAlign:"center"}}>
              <span style={{fontSize:36}}>📈</span>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.textHi,marginBottom:6}}>Langfristiger Chart</div>
                <div style={{fontSize:13,color:C.textMid,marginBottom:16}}>Weekly / Daily mit<br/>übergeordneter Struktur</div>
                <a href={a.tvLinkLong||a.tvLink} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:C.gold,color:C.bg,textDecoration:"none",padding:"12px 24px",borderRadius:RADIUS.md,fontSize:14,fontWeight:700}}>📊 Öffnen →</a>
              </div>
            </div>
          </div>
        )}

        {view!=="tv" && (
          <div style={{background:C.surface,border:`1px solid ${dirReason.color}33`,borderRadius:RADIUS.lg,padding:"18px 22px",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:22}}>{dirReason.icon}</span>
              <span style={{fontSize:15,fontWeight:800,color:dirReason.color}}>{dirReason.label}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(a.reasons||[]).map((r,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{r.icon}</span>
                  <div>
                    <span style={{fontSize:14,fontWeight:700,color:r.col||C.textHi}}>{r.title}: </span>
                    <span style={{fontSize:14,color:C.textMid,lineHeight:1.65}}>{r.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {a.keyStats && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
            {a.keyStats.map(([k,v],i)=>(
              <div key={i} style={{background:C.surface,borderRadius:RADIUS.md,padding:"12px 14px"}}>
                <div style={{fontSize:10,color:C.textLow,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>{k}</div>
                <div style={{fontSize:14,fontWeight:700,color:C.textHi,fontVariantNumeric:"tabular-nums",fontFamily:FONT.mono}}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AssetCard({ a }) {
  const [focused, setFocused] = useState(false);
  const bc = BIAS_COL[a.bias] || C.gold;

  // Zentraler Live-Preis-Hook — wird für Header UND Chart genutzt
  const { price: livePrice, connected } = useLivePrice(a.id);
  const displayPrice = fmtLivePrice(livePrice, a.id) || a.price;

  return (
    <>
      <div style={{ background:C.card,border:`1px solid ${C.border}`, borderRadius:RADIUS.lg,padding:"20px 22px 16px", transition:"border-color 0.15s" }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=bc}
        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
      >
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:22}}>{a.emoji}</span>
              <span style={{fontFamily:FONT.serif,fontSize:21,fontWeight:700,color:C.textHi}}>{a.name}</span>
              <span style={{fontSize:12,color:C.textLow}}>{a.ticker}</span>
              <span style={{fontSize:12,fontWeight:700,color:bc,border:`1px solid ${bc}44`,borderRadius:4,padding:"2px 9px"}}>
                {DIR_ICON[a.bias]} {a.bias==="bull"?"BULL":a.bias==="bear"?"BEAR":"NEUTRAL"}
              </span>
              {connected && (
                <span style={{ width:6, height:6, borderRadius:"50%", background:C.bull, display:"inline-block", animation:"pulse 1.5s infinite" }} title="Live via WebSocket"/>
              )}
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:12}}>
              <span style={{fontSize:30,fontWeight:700,color:C.textHi,fontVariantNumeric:"tabular-nums",fontFamily:FONT.mono}}>{a.unit}{displayPrice}</span>
              <span style={{fontSize:16,fontWeight:700,color:a.chg24>=0?C.bull:C.bear}}>{a.chg24>=0?"+":""}{a.chg24}% 24h</span>
              <span style={{fontSize:14,fontWeight:600,color:a.chg7>=0?C.bull:C.bear}}>{a.chg7>=0?"+":""}{a.chg7}% 7D</span>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
            <button onClick={()=>setFocused(true)} style={{
              background:C.surface,border:`1px solid ${C.border}`, borderRadius:RADIUS.sm,padding:"8px 16px",
              color:C.textMid,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=bc;e.currentTarget.style.color=bc;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid;}}
            >⊕ Detail & Analyse</button>
            <a href={a.tvLinkLong||a.tvLink} target="_blank" rel="noopener noreferrer" style={{
              display:"inline-flex",alignItems:"center",gap:5, background:"transparent",border:`1px solid ${C.gold}44`,
              borderRadius:RADIUS.sm,padding:"6px 12px", color:C.gold,fontSize:11,fontWeight:600,textDecoration:"none",transition:"all 0.15s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.background="#1a1200";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${C.gold}44`;e.currentTarget.style.background="transparent";}}
            >📈 Langfristig</a>
          </div>
        </div>

        <div style={{border:`1px solid ${C.border}`,borderRadius:RADIUS.md,overflow:"hidden",padding:"6px 2px",background:C.surface}}>
          <UnifiedChart assetId={a.id} unit={a.unit} h={220} levels={a.levels||[]} livePrice={livePrice}/>
        </div>

        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:14,fontWeight:700,color:C.gold,lineHeight:1.4,marginBottom:6}}>{a.wave}</div>
          {a.reasons?.[0] && (
            <div style={{fontSize:13,color:C.textMid,display:"flex",gap:6}}>
              <span>{a.reasons[0].icon}</span>
              <span><strong style={{color:C.textHi}}>{a.reasons[0].title}:</strong> {a.reasons[0].text}</span>
            </div>
          )}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>

      {focused && <FocusModal asset={a} livePrice={livePrice} onClose={()=>setFocused(false)}/>}
    </>
  );
}
