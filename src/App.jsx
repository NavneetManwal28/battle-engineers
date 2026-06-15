import { useState,useEffect,useRef,useCallback } from "react";
import { GameEngine,WEAPONS,THEME_KEYS } from "./engine.js";
import { SFX } from "./sounds.js";
import { VFXOverlay } from "./vfx.js";
const HD={fontFamily:"'Fredoka',sans-serif",fontWeight:700};
const MN={fontFamily:"'Share Tech Mono',monospace"};
const GREEN="#7cfc00",PCOLS=["#f97316","#3b82f6","#a855f7","#22c55e"];
function NeuBtn({children,onClick,disabled,active,style}){return <button onClick={()=>{if(!disabled){SFX.click();onClick?.();}}} disabled={disabled} className={`btn-neu ${active?"active":""}`} style={{padding:"6px 12px",fontSize:13,...MN,...style}}>{children}</button>;}

export default function App(){
  const [phase,setPhase]=useState("menu");
  const [pCount,setPCount]=useState(2);
  const [pNames,setPNames]=useState(["Player 1","Player 2","Player 3","Player 4"]);
  const [picks,setPicks]=useState([[],[]]);
  const [picker,setPicker]=useState(0);
  const [gs,setGs]=useState(null);
  const [terrain,setTerrain]=useState(null);
  const [isMobilePortrait,setIsMobilePortrait]=useState(false);
  const [isMobile,setIsMobile]=useState(false);
  const [tipDismissed,setTipDismissed]=useState(false);
  const [pending,setPending]=useState(false);
  useEffect(()=>{
    try{screen.orientation?.lock?.("landscape-primary").catch(()=>{});}catch(e){}
    const check=()=>{const touch='ontouchstart' in window;const portrait=window.innerHeight>window.innerWidth;setIsMobilePortrait(touch&&portrait);setIsMobile(touch);};
    check();window.addEventListener("resize",check);return()=>window.removeEventListener("resize",check);
  },[]);
  // Prevent page scroll/drag on mobile — allow only on range inputs
  useEffect(()=>{const handler=e=>{if(e.target.tagName==='INPUT'&&e.target.type==='range')return;e.preventDefault();};
    document.addEventListener('touchmove',handler,{passive:false});
    return()=>document.removeEventListener('touchmove',handler);
  },[]);
  const engRef=useRef(null),canRef=useRef(null),vfxCanRef=useRef(null),vfxRef=useRef(null);
  const resize=useCallback(()=>{const c=canRef.current;if(!c)return;const p=c.parentElement;const dpr=Math.min(window.devicePixelRatio||1,2);c.width=p.clientWidth*dpr;c.height=p.clientHeight*dpr;},[]);
  useEffect(()=>{window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize);},[resize]);
  const startGame=useCallback(()=>{setPhase("playing");setPending(true);},[]);
  useEffect(()=>{if(!pending)return;const t=setTimeout(()=>{const c=canRef.current;if(!c)return;setPending(false);resize();
    const cfgs=Array.from({length:pCount},(_,i)=>({name:pNames[i],weapons:[...(picks[i]||[])]}));
    if(engRef.current)engRef.current.stop();
    // Init WebGL VFX overlay
    const vc=vfxCanRef.current;let vfx=null;
    if(vc){vc.width=c.width;vc.height=c.height;vfx=new VFXOverlay(vc);vfxRef.current=vfx;}
    const e=new GameEngine(c,cfgs,terrain||undefined,vfx);e.onUpdate=s=>setGs({...s});engRef.current=e;e.start();setGs(e.getState());
  },100);return()=>clearTimeout(t);},[pending]);
  useEffect(()=>{const h=e=>{const eng=engRef.current;if(!eng||eng.phase!=="aiming")return;
    if(e.key==="ArrowLeft")eng.setAngle(eng.angle+2);else if(e.key==="ArrowRight")eng.setAngle(eng.angle-2);
    else if(e.key==="ArrowUp")eng.setPower(eng.power+2);else if(e.key==="ArrowDown")eng.setPower(eng.power-2);
    else if(e.key===" "||e.key==="Enter"){e.preventDefault();eng.fire();}
    else if(e.key==="a")eng.moveLeft();else if(e.key==="d")eng.moveRight();
    else if(e.key==="b")eng.toggleMode();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
  useEffect(()=>()=>{if(engRef.current)engRef.current.stop();},[]);
  const eng=engRef.current;

  if(phase==="menu")return(
    <div className="screen"><div className="metal-bg"/>
      <div className="metal-panel" style={{maxWidth:440,width:"90%",padding:"30px 28px",animation:"fadeUp 0.4s",zIndex:1,textAlign:"center"}}>
        <svg viewBox="0 0 140 100" width="170" height="122" style={{margin:"0 auto 4px",display:"block",filter:"drop-shadow(0 6px 20px rgba(0,0,0,0.6))"}}>
          <defs><linearGradient id="stl" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stopColor="#aaa"/><stop offset="30%" stopColor="#777"/><stop offset="60%" stopColor="#555"/><stop offset="100%" stopColor="#333"/></linearGradient>
            <linearGradient id="gld" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d4a020"/><stop offset="50%" stopColor="#b8860b"/><stop offset="100%" stopColor="#8b6914"/></linearGradient>
            <linearGradient id="hdl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5a3a1a"/><stop offset="100%" stopColor="#3a2510"/></linearGradient></defs>
          <g transform="translate(70,50) rotate(-40)"><rect x="-3" y="-10" width="6" height="50" rx="2" fill="url(#hdl)"/><rect x="-2" y="-8" width="1.5" height="46" rx="1" fill="#6a4a2a" opacity="0.4"/><rect x="-12" y="-22" width="24" height="14" rx="2" fill="url(#stl)"/><rect x="-14" y="-20" width="4" height="10" rx="1" fill="url(#stl)"/><rect x="10" y="-20" width="4" height="10" rx="1" fill="url(#stl)"/></g>
          <g transform="translate(70,50) rotate(40) scale(-1,1)"><rect x="-3" y="-10" width="6" height="50" rx="2" fill="url(#hdl)"/><rect x="-2" y="-8" width="1.5" height="46" rx="1" fill="#6a4a2a" opacity="0.4"/><rect x="-12" y="-22" width="24" height="14" rx="2" fill="url(#stl)"/><rect x="-14" y="-20" width="4" height="10" rx="1" fill="url(#stl)"/><rect x="10" y="-20" width="4" height="10" rx="1" fill="url(#stl)"/></g>
          <ellipse cx="70" cy="50" rx="16" ry="18" fill="#1a1a1e" stroke="url(#gld)" strokeWidth="2.5"/><text x="70" y="55" textAnchor="middle" fill="url(#gld)" fontSize="14" fontFamily="Fredoka" fontWeight="700">BE</text>
        </svg>
        <h1 style={{...HD,fontSize:26,color:"#eee",textTransform:"uppercase",letterSpacing:3}}>Battle Engineers</h1>
        <div style={{height:2,background:"linear-gradient(90deg,transparent,#d4a020,transparent)",margin:"6px auto",width:"50%"}}/>
        <p style={{...MN,color:"#555",fontSize:10,margin:"0 0 20px",letterSpacing:3}}>ATTACK · BUILD · CONQUER</p>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[2,3,4].map(n=>(<NeuBtn key={n} onClick={()=>setPCount(n)} active={pCount===n} style={{flex:1,fontSize:18,padding:"10px"}}>{n}</NeuBtn>))}
        </div>
        {Array.from({length:pCount},(_,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:12,height:12,borderRadius:"50%",background:PCOLS[i],boxShadow:`0 0 8px ${PCOLS[i]}40`}}/>
          <input value={pNames[i]} onChange={e=>{const n=[...pNames];n[i]=e.target.value;setPNames(n);}} className="panel-inset" style={{flex:1,padding:"9px 12px",color:"#aaa",fontSize:13,...MN,outline:"none",border:"none"}}/>
        </div>))}
        <div style={{display:"flex",gap:4,margin:"12px 0 16px",flexWrap:"wrap"}}>
          <NeuBtn onClick={()=>setTerrain(null)} active={!terrain} style={{fontSize:9}}>🎲 RNG</NeuBtn>
          {THEME_KEYS.map(k=>(<NeuBtn key={k} onClick={()=>setTerrain(k)} active={terrain===k} style={{fontSize:9,textTransform:"uppercase"}}>{k}</NeuBtn>))}
        </div>
        <NeuBtn onClick={()=>{SFX.select();setPicker(0);setPicks(Array(pCount).fill([]));setPhase("weapons");}} style={{width:"100%",padding:"14px",fontSize:15,color:GREEN,borderColor:`${GREEN}30`}}>▸ SELECT WEAPONS</NeuBtn>
      </div>
    </div>);

  if(phase==="weapons"){
    const cur=picks[picker]||[];const done=cur.length>=5;
    const pick=wId=>{SFX.select();const np=[...picks];np[picker]=[...(np[picker]||[]),wId];setPicks(np);};
    const next=()=>{if(picker<pCount-1)setPicker(picker+1);else startGame();};
    return(
      <div className="screen"><div className="metal-bg"/>
        <div style={{animation:"fadeUp 0.3s",width:"94%",maxWidth:700,zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:PCOLS[picker],boxShadow:`0 0 10px ${PCOLS[picker]}50`}}/>
              <span style={{...HD,color:PCOLS[picker],fontSize:18}}>{pNames[picker]}</span>
            </div>
            <div style={{...MN,color:done?GREEN:"#666",fontSize:12}}>{cur.length}/5 · EACH FIRES 2x · 10 SHOTS TOTAL</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:12}}>
            {WEAPONS.map(w=>{const has=cur.includes(w.id);const canP=!done&&!has;
              return(<button key={w.id} onClick={()=>canP&&pick(w.id)} disabled={!canP} className="metal-panel" style={{
                padding:"14px 8px",cursor:canP?"pointer":"not-allowed",opacity:canP?1:has?0.5:0.12,
                textAlign:"center",border:has?`2px solid ${GREEN}40`:"2px solid transparent",transition:"all 0.15s",position:"relative",overflow:"hidden",
              }}>
                <div style={{fontSize:30,marginBottom:4,filter:has?`drop-shadow(0 0 10px ${GREEN}60)`:"none",transition:"all 0.2s"}}>{w.icon}</div>
                <div style={{...MN,color:has?GREEN:"#ccc",fontSize:10}}>{w.name}</div>
                <div style={{...MN,color:"#444",fontSize:8,marginTop:2}}>{w.desc}</div>
                {has&&<div style={{position:"absolute",top:4,right:6,...MN,color:GREEN,fontSize:10}}>✓</div>}
              </button>);})}
          </div>
          <div className="panel-inset" style={{padding:"6px 12px",display:"flex",gap:8,alignItems:"center",marginBottom:12,minHeight:32}}>
            {cur.length?cur.map((wId,i)=>{const w=WEAPONS.find(ww=>ww.id===wId);return <span key={i} style={{fontSize:20}} title={w?.name}>{w?.icon}</span>;}):
              <span style={{...MN,color:"#333",fontSize:10}}>Pick 5 weapons — each fires twice</span>}
          </div>
          {done&&<NeuBtn onClick={next} style={{width:"100%",padding:14,fontSize:14,color:GREEN,borderColor:`${GREEN}30`}}>{picker<pCount-1?`▸ ${pNames[picker+1]}'s Turn`:"▸ START BATTLE"}</NeuBtn>}
        </div>
      </div>);}

  // Game over is now shown as overlay on battle screen

  // ═══ PLAYING ═══
  const cp=gs?.players?.[gs?.currentPlayer];const isAim=gs?.phase==="aiming";
  const curW=gs?.currentWeapon?WEAPONS.find(w=>w.id===gs.currentWeapon):null;
  const isBuild=gs?.mode==="build";const windDir=gs?.wind>0?"→":"←",windStr=Math.abs((gs?.wind||0)*500).toFixed(0);
  return(
    <div style={{width:"100vw",height:"100dvh",background:"#18181b",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Landscape tip — dismissable, not blocking */}
      {isMobilePortrait&&!tipDismissed&&<div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#27272a",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",...MN,fontSize:11,color:"#a1a1aa"}}>
        <span>📱 Rotate to landscape for best experience</span>
        <button onClick={()=>setTipDismissed(true)} style={{background:"none",border:"1px solid #444",borderRadius:4,color:"#888",padding:"2px 8px",cursor:"pointer",fontSize:10,...MN}}>✕ OK</button>
      </div>}
      {/* ═══ SCORECARDS — compact on mobile ═══ */}
      {isMobile?
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"3px 8px",background:"#18181b",borderBottom:"1px solid #27272a",zIndex:10,flexShrink:0}}>
        {gs?.players?.map((p,pi)=>{const isCur=pi===gs.currentPlayer,hpC=p.hp>50?"#4ade80":p.hp>25?"#facc15":"#f44";return(
          <div key={pi} style={{display:"flex",alignItems:"center",gap:4,opacity:p.alive?1:0.2}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:`conic-gradient(${hpC} ${p.hp*3.6}deg, #1a1a1e ${p.hp*3.6}deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:16,height:16,borderRadius:"50%",background:"#18181b",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{...MN,color:hpC,fontSize:8,fontWeight:700}}>{p.hp}</span></div></div>
            <span style={{...MN,color:isCur?p.color:"#555",fontSize:9}}>{p.name}</span>
          </div>);})}
        <div style={{...MN,color:"#52525b",fontSize:8}}>{windDir}{windStr}</div>
      </div>
      :
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,padding:"5px 14px",background:"#18181b",borderBottom:"1px solid #27272a",zIndex:10,flexShrink:0}}>
        {gs?.players?.[0]&&(()=>{const p=gs.players[0],isCur=0===gs.currentPlayer,hpC=p.hp>50?"#4ade80":p.hp>25?"#facc15":"#f44";return(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"5px 14px",borderRadius:6,background:isCur?"#222228":"#111114",border:isCur?`1px solid ${p.color}30`:"1px solid #1e1e22",opacity:p.alive?1:0.12}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`conic-gradient(${hpC} ${p.hp*3.6}deg, #1a1a1e ${p.hp*3.6}deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:28,height:28,borderRadius:"50%",background:isCur?"#222228":"#111114",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{...MN,color:hpC,fontSize:12,fontWeight:700,lineHeight:1}}>{p.hp}</span><span style={{...MN,color:hpC,fontSize:5,opacity:0.6}}>HP</span></div></div>
            <div><div style={{...MN,color:isCur?p.color:"#666",fontSize:10}}>{p.name}</div><div style={{...MN,color:"#3f3f46",fontSize:8}}>{p.weapons?.length} shots</div></div>
          </div>);})()}
        <div style={{display:"flex",gap:14,padding:"4px 14px",background:"#111114",borderRadius:6,border:"1px solid #1e1e22"}}>
          <div style={{textAlign:"center"}}><div style={{...MN,color:"#3f3f46",fontSize:6}}>🌬️ WIND</div><div style={{...MN,color:"#71717a",fontSize:11}}>{windDir} {windStr} mph</div></div>
          <div style={{width:1,background:"#27272a"}}/>
          <div style={{textAlign:"center"}}><div style={{...MN,color:"#3f3f46",fontSize:7}}>TURN</div><div style={{...MN,color:"#52525b",fontSize:11}}>{(gs?.turnCount||0)+1}</div></div>
        </div>
        {gs?.players?.[1]&&(()=>{const p=gs.players[1],isCur=1===gs.currentPlayer,hpC=p.hp>50?"#4ade80":p.hp>25?"#facc15":"#f44";return(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"5px 14px",borderRadius:6,background:isCur?"#222228":"#111114",border:isCur?`1px solid ${p.color}30`:"1px solid #1e1e22",opacity:p.alive?1:0.12,flexDirection:"row-reverse"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`conic-gradient(${hpC} ${p.hp*3.6}deg, #1a1a1e ${p.hp*3.6}deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:28,height:28,borderRadius:"50%",background:isCur?"#222228":"#111114",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{...MN,color:hpC,fontSize:12,fontWeight:700,lineHeight:1}}>{p.hp}</span><span style={{...MN,color:hpC,fontSize:5,opacity:0.6}}>HP</span></div></div>
            <div style={{textAlign:"right"}}><div style={{...MN,color:isCur?p.color:"#666",fontSize:10}}>{p.name}</div><div style={{...MN,color:"#3f3f46",fontSize:8}}>{p.weapons?.length} shots</div></div>
          </div>);})()}
      </div>}

      {/* CANVAS */}
      <div style={{flex:1,position:"relative",padding:isMobile?"1px 2px 0":"0.5% 1.5% 0",overflow:"hidden"}}>
        <canvas ref={canRef} style={{width:"100%",height:"100%",display:"block",borderRadius:isMobile?2:6,touchAction:"none"}}/>
        <canvas ref={vfxCanRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",borderRadius:isMobile?2:6}}/>
        {/* Winner overlay on battle screen */}
        {gs?.phase==="gameOver"&&(()=>{const w=gs.winner;return(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",borderRadius:isMobile?2:6,zIndex:30}}>
            <div style={{textAlign:"center",padding:"24px 40px",background:"rgba(20,20,24,0.95)",borderRadius:10,border:`2px solid ${w?.color||GREEN}30`,boxShadow:"0 8px 40px rgba(0,0,0,0.6)",animation:"fadeUp 0.4s",maxWidth:340}}>
              <div style={{fontSize:48,marginBottom:4}}>🏆</div>
              <h1 style={{...HD,fontSize:22,color:w?.color||GREEN,textTransform:"uppercase",letterSpacing:2}}>{w?.name||"Draw"} Wins!</h1>
              <div style={{height:1,background:`linear-gradient(90deg,transparent,${w?.color||GREEN}40,transparent)`,margin:"10px 0"}}/>
              {gs.players?.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",marginTop:4,background:"rgba(0,0,0,0.3)",borderRadius:4}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:p.color}}/>
                <span style={{...MN,color:p.alive?"#aaa":"#444",flex:1,fontSize:11}}>{p.name}</span>
                <span style={{...MN,color:p.alive?"#4ade80":"#f44",fontSize:14,fontWeight:700}}>{p.hp} HP</span>
              </div>))}
              <button onClick={()=>{if(engRef.current)engRef.current.stop();engRef.current=null;setGs(null);setPicks([[],[]]);setPicker(0);setPhase("menu");}}
                className="btn-neu" style={{width:"100%",padding:12,fontSize:13,color:GREEN,marginTop:14,...MN,borderColor:`${GREEN}30`}}>▸ PLAY AGAIN</button>
            </div>
          </div>);})()}
        {!isMobile&&isAim&&cp&&(<div style={{position:"absolute",top:"2.5%",left:"50%",transform:"translateX(-50%)",padding:"4px 16px",borderRadius:6,
          background:"rgba(0,0,0,0.7)",border:`1px solid ${cp.color}20`,backdropFilter:"blur(4px)",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:cp.color,boxShadow:`0 0 8px ${cp.color}60`}}/>
          <span style={{...MN,color:cp.color,fontSize:10}}>{cp.name}</span>
          <span style={{...MN,color:isBuild?GREEN:"#666",fontSize:9,padding:"1px 6px",background:isBuild?"#4ade8015":"transparent",borderRadius:3}}>{isBuild?"⛰️ BUILD":"⚔️ ATTACK"}</span>
          <span style={{...MN,color:"#444",fontSize:9}}>|</span>
          <span style={{...MN,color:"#555",fontSize:9}}>{cp.weapons?.length} shots</span>
        </div>)}
      </div>

      {/* ═══ CONTROLS — single row on mobile landscape ═══ */}
      <div style={{flexShrink:0,background:"#18181b",borderTop:"1px solid #27272a",zIndex:20,position:"relative",touchAction:"none",
        opacity:isAim?1:0.15,pointerEvents:isAim?"auto":"none",transition:"opacity 0.3s"}}>
        {isMobile&&!isMobilePortrait?
        /* Mobile landscape: everything in ONE row */
        <div style={{display:"flex",alignItems:"center",height:40,gap:2,padding:"0 4px"}}>
          <NeuBtn onClick={()=>eng?.toggleMode()} active={isBuild} style={{padding:"4px 6px",fontSize:10,color:isBuild?GREEN:"#f97316",...MN}}>{isBuild?"⛰️":"⚔️"}</NeuBtn>
          <div style={{display:"flex",alignItems:"center",gap:2}}>
            <NeuBtn onClick={()=>eng?.moveLeft()} disabled={!gs?.movesLeft} style={{padding:"2px 5px",fontSize:11}}>◀</NeuBtn>
            <span style={{...MN,color:"#888",fontSize:10,minWidth:14,textAlign:"center"}}>{Math.floor((gs?.movesLeft||0)/5)}</span>
            <NeuBtn onClick={()=>eng?.moveRight()} disabled={!gs?.movesLeft} style={{padding:"2px 5px",fontSize:11}}>▶</NeuBtn>
          </div>
          <div style={{width:1,height:20,background:"#27272a"}}/>
          <NeuBtn onClick={()=>eng?.prevWeapon()} disabled={isBuild} style={{padding:"2px 4px",fontSize:10}}>◀</NeuBtn>
          <span style={{...MN,color:"#888",fontSize:9,maxWidth:60,overflow:"hidden",whiteSpace:"nowrap"}}>{curW?.icon}{curW?.name?.split(" ")[0]||"—"}</span>
          <NeuBtn onClick={()=>eng?.nextWeapon()} disabled={isBuild} style={{padding:"2px 4px",fontSize:10}}>▶</NeuBtn>
          <div style={{width:1,height:20,background:"#27272a"}}/>
          <div style={{display:"flex",alignItems:"center",gap:2,flex:1}}>
            <span style={{...MN,color:"#555",fontSize:7}}>A</span>
            <input type="range" min="5" max="175" value={gs?.angle||60} onChange={e=>eng?.setAngle(+e.target.value)} style={{flex:1}}/>
            <span style={{...MN,color:"#aaa",fontSize:9,minWidth:22}}>{gs?.angle||60}°</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:2,flex:1}}>
            <span style={{...MN,color:"#555",fontSize:7}}>P</span>
            <input type="range" min="5" max="100" value={gs?.power||50} onChange={e=>eng?.setPower(+e.target.value)} style={{flex:1}}/>
            <span style={{...MN,color:"#fb0",fontSize:9,minWidth:22}}>{gs?.power||50}%</span>
          </div>
          <button onClick={()=>eng?.fire()} className={`btn-neu ${isBuild?"":"fire-btn"}`} style={{
            padding:"6px 14px",fontSize:13,...HD,fontStyle:"italic",letterSpacing:2,textTransform:"uppercase",borderRadius:4,
            color:isBuild?GREEN:"#ff4400"}}>FIRE</button>
        </div>
        :
        /* Desktop + mobile portrait: 2-row layout */
        isMobilePortrait?
        <>
        <div style={{display:"grid",gridTemplateColumns:"50px 1fr 1.5fr auto",alignItems:"center",height:46}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",borderRight:"1px solid #27272a"}}>
            <NeuBtn onClick={()=>eng?.toggleMode()} active={isBuild} style={{padding:"5px 8px",fontSize:11,color:isBuild?GREEN:"#f97316",...MN}}>{isBuild?"⛰️BLD":"⚔️ATK"}</NeuBtn>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,height:"100%",borderRight:"1px solid #27272a"}}>
            <NeuBtn onClick={()=>eng?.moveLeft()} disabled={!gs?.movesLeft} style={{padding:"3px 8px"}}>◀</NeuBtn>
            <span style={{...MN,color:"#a1a1aa",fontSize:13,minWidth:16,textAlign:"center"}}>{Math.floor((gs?.movesLeft||0)/5)}</span>
            <NeuBtn onClick={()=>eng?.moveRight()} disabled={!gs?.movesLeft} style={{padding:"3px 8px"}}>▶</NeuBtn>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height:"100%",borderRight:"1px solid #27272a",opacity:isBuild?0.25:1}}>
            <NeuBtn onClick={()=>eng?.prevWeapon()} disabled={isBuild} style={{padding:"3px 6px"}}>◀</NeuBtn>
            <div style={{display:"flex",alignItems:"center",gap:3,padding:"2px 6px",background:"#111114",borderRadius:4,border:"1px solid #27272a"}}>
              <span style={{fontSize:14}}>{curW?.icon||"💣"}</span><span style={{...MN,color:"#a1a1aa",fontSize:9}}>{curW?.name||"—"}</span>
            </div>
            <NeuBtn onClick={()=>eng?.nextWeapon()} disabled={isBuild} style={{padding:"3px 6px"}}>▶</NeuBtn>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 10px"}}>
            <button onClick={()=>eng?.fire()} className={`btn-neu ${isBuild?"":"fire-btn"}`} style={{
              padding:"8px 18px",fontSize:14,...HD,fontStyle:"italic",letterSpacing:3,textTransform:"uppercase",borderRadius:6,
              color:isBuild?GREEN:"#ff4400"}}>FIRE</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:"1px solid #27272a",height:38}}>
          <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 8px",borderRight:"1px solid #27272a"}}>
            <span style={{...MN,color:"#52525b",fontSize:7,flexShrink:0}}>ANGLE</span>
            <span style={{...MN,color:isBuild?GREEN:"#e4e4e7",fontSize:13,fontWeight:700,flexShrink:0,minWidth:28}}>{gs?.angle||60}°</span>
            <input type="range" min="5" max="175" value={gs?.angle||60} onChange={e=>eng?.setAngle(+e.target.value)} style={{flex:1}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 8px"}}>
            <span style={{...MN,color:"#52525b",fontSize:7,flexShrink:0}}>POWER</span>
            <span style={{...MN,color:"#fbbf24",fontSize:13,fontWeight:700,flexShrink:0,minWidth:28}}>{gs?.power||50}%</span>
            <input type="range" min="5" max="100" value={gs?.power||50} onChange={e=>eng?.setPower(+e.target.value)} style={{flex:1}}/>
          </div>
        </div>
        </>
        :
        /* Desktop: original 6-column single row */
        <div style={{display:"grid",gridTemplateColumns:"55px 1fr 1.2fr auto 1.2fr 1fr",alignItems:"center",height:68}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",borderRight:"1px solid #27272a"}}>
            <NeuBtn onClick={()=>eng?.toggleMode()} active={isBuild} style={{padding:"6px 10px",fontSize:12,color:isBuild?GREEN:"#f97316",...MN}}>{isBuild?"⛰️ BLD":"⚔️ ATK"}</NeuBtn>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",borderRight:"1px solid #27272a"}}>
            <span style={{...MN,color:"#52525b",fontSize:7,letterSpacing:2}}>MOVE</span>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
              <NeuBtn onClick={()=>eng?.moveLeft()} disabled={!gs?.movesLeft} style={{padding:"3px 8px"}}>◀</NeuBtn>
              <span style={{...MN,color:"#a1a1aa",fontSize:14,minWidth:18,textAlign:"center"}}>{Math.floor((gs?.movesLeft||0)/5)}</span>
              <NeuBtn onClick={()=>eng?.moveRight()} disabled={!gs?.movesLeft} style={{padding:"3px 8px"}}>▶</NeuBtn>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",borderRight:"1px solid #27272a",opacity:isBuild?0.25:1}}>
            <span style={{...MN,color:"#52525b",fontSize:7,letterSpacing:2}}>WEAPON</span>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
              <NeuBtn onClick={()=>eng?.prevWeapon()} disabled={isBuild} style={{padding:"3px 6px"}}>◀</NeuBtn>
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",background:"#111114",borderRadius:4,border:"1px solid #27272a",minWidth:100}}>
                <span style={{fontSize:15}}>{curW?.icon||"💣"}</span><span style={{...MN,color:"#a1a1aa",fontSize:10}}>{curW?.name||"—"}</span>
              </div>
              <NeuBtn onClick={()=>eng?.nextWeapon()} disabled={isBuild} style={{padding:"3px 6px"}}>▶</NeuBtn>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 16px",borderRight:"1px solid #27272a"}}>
            <button onClick={()=>eng?.fire()} className={`btn-neu ${isBuild?"":"fire-btn"}`} style={{
              padding:"12px 36px",fontSize:18,...HD,fontStyle:"italic",letterSpacing:4,textTransform:"uppercase",borderRadius:6,
              color:isBuild?GREEN:"#ff4400",minWidth:120}}>{isBuild?"BUILD":"FIRE"}</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,height:"100%",borderRight:"1px solid #27272a",padding:"0 8px"}}>
            <div style={{display:"flex",flexDirection:"column",flex:1}}>
              <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{...MN,color:"#52525b",fontSize:7,letterSpacing:2}}>ANGLE</span><span style={{...MN,color:isBuild?GREEN:"#e4e4e7",fontSize:15,fontWeight:700}}>{gs?.angle||60}°</span></div>
              <input type="range" min="5" max="175" value={gs?.angle||60} onChange={e=>eng?.setAngle(+e.target.value)} style={{width:"100%",marginTop:2}}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,height:"100%",padding:"0 8px"}}>
            <div style={{display:"flex",flexDirection:"column",flex:1,gap:4}}>
              <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{...MN,color:"#52525b",fontSize:7,letterSpacing:2}}>POWER</span><span style={{...MN,color:"#fbbf24",fontSize:15,fontWeight:700}}>{gs?.power||50}%</span></div>
              <input type="range" min="5" max="100" value={gs?.power||50} onChange={e=>eng?.setPower(+e.target.value)} style={{width:"100%"}}/>
            </div>
          </div>
        </div>}
      </div>
    </div>);
}
