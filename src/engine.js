/* BATTLE ENGINEERS v11 — Cinematic VFX Overhaul */
import { SFX } from "./sounds.js";
export const W=1200,H=600;
const GRAVITY=0.13,MAX_P=12,MOVE_T=150,MOVE_S=5;
const PCOLS=["#f97316","#3b82f6","#a855f7","#22c55e"];

export const WEAPONS=[
  {id:"basic",name:"Cannon Shot",icon:"💣",damage:18,radius:70,terrain:30,desc:"Standard shot",type:"arc",shake:6},
  {id:"bouncer",name:"Bouncer",icon:"🔴",damage:25,radius:75,terrain:25,desc:"Bounces 3 times",type:"bounce",bounces:3,shake:8},
  {id:"tire",name:"Tire Roll",icon:"⭕",damage:30,radius:65,terrain:20,desc:"Arc then rolls on fire",type:"tire_arc",shake:10},
  {id:"lightning",name:"Lightning",icon:"⚡",damage:28,radius:80,terrain:15,desc:"Arc then lightning strike",type:"lightning_arc",shake:12},
  {id:"cluster",name:"Cluster Rockets",icon:"🚀",damage:12,radius:60,terrain:22,desc:"3 rapid rockets",type:"rapid",count:3,shake:6},
  {id:"napalm",name:"Napalm",icon:"🔥",damage:10,radius:70,terrain:20,desc:"Fire pool 3 turns",type:"pool",poolTurns:3,poolDmg:8,shake:8},
  {id:"drone",name:"Drone Kill",icon:"🛸",damage:12,radius:55,terrain:18,desc:"Hovers then drops bombs",type:"hover_drop",drops:3,shake:6},
  {id:"chemical",name:"Chemical Rain",icon:"☣️",damage:8,radius:80,terrain:10,desc:"Hovers then rains acid",type:"hover_rain",drops:5,shake:4},
];
export const THEME_KEYS=["lab","mars","factory","campus"];
const THEMES={lab:{name:"Research Facility",sky:["#0a1628","#101e3a","#162850","#1e3060"],terrain:["#2a3a5a","#1e2e48","#142236","#0c1625"],surface:"rgba(100,160,255,0.25)",star:true,ambient:"#3b82f620"},mars:{name:"Mars Colony",sky:["#1a0a08","#2a1410","#3a1a12","#4a2018"],terrain:["#6a3020","#4a2218","#341810","#201008"],surface:"rgba(200,100,60,0.3)",star:true,ambient:"#f9731620"},arctic:{name:"Arctic Lab",sky:["#0a1420","#142838","#1e3a4a","#284a5a"],terrain:["#b8c8d8","#98acb8","#7a90a0","#5a7888"],surface:"rgba(200,230,255,0.35)",star:false,ambient:"#38bdf820"},factory:{name:"Abandoned Factory",sky:["#0e0c0a","#1a1614","#24201c","#2e2a24"],terrain:["#3a3028","#2a2218","#1e1810","#141008"],surface:"rgba(180,140,80,0.25)",star:false,ambient:"#f59e0b15"},campus:{name:"University Campus",sky:["#081420","#102a40","#184060","#206080"],terrain:["#2a5a1a","#1e4212","#14300c","#0c2008"],surface:"rgba(100,200,80,0.3)",star:false,ambient:"#22c55e18"}};
const GEN={lab:{a1:40,f1:0.008,a2:20,f2:0.025,a3:8,f3:0.07,base:400},mars:{a1:70,f1:0.012,a2:35,f2:0.03,a3:15,f3:0.08,base:370},arctic:{a1:50,f1:0.006,a2:25,f2:0.02,a3:6,f3:0.05,base:390},factory:{a1:45,f1:0.01,a2:30,f2:0.035,a3:12,f3:0.09,base:380},campus:{a1:55,f1:0.007,a2:20,f2:0.022,a3:8,f3:0.06,base:385}};

export class GameEngine{
  constructor(canvas,configs,themeKey,vfx){
    this.canvas=canvas;this.ctx=canvas.getContext("2d");this.terrain=[];this.players=[];this.currentPlayer=0;
    this.vfx=vfx||null;
    this.angle=60;this.power=50;this.wind=0;this.projectiles=[];this.explosions=[];this.particles=[];
    this.phase="aiming";this.mode="attack";this.turnCount=0;this.winner=null;this.onUpdate=null;
    this.raf=null;this.lastTime=0;
    // VFX State
    this.shakeTimer=0;this.shakeIntensity=0;this.shakeX=0;this.shakeY=0;
    this.freezeTimer=0; // impact freeze
    this.slowMo=false;this.slowMoTimer=0;this.slowMoAlpha=0;this.slowMoCenter=null;
    this.lightFlashes=[]; // dynamic lighting
    this.trailPoints=[];this.damagePopups=[];this.zones=[];this.beams=[];
    this.turnBanner=1500;this.turnBannerName="";
    this.ambientP=[];
    this.themeKey=themeKey||THEME_KEYS[Math.floor(Math.random()*THEME_KEYS.length)];
    this.theme=THEMES[this.themeKey];
    this._initTerrain();this._initPlayers(configs);this._newWind();
    for(let i=0;i<25;i++)this.ambientP.push({x:Math.random()*W,y:Math.random()*H*0.6,s:0.5+Math.random()*2,sp:0.1+Math.random()*0.25,d:Math.random()*Math.PI*2});
  }
  _initTerrain(){const p=GEN[this.themeKey]||GEN.lab;const s=Math.random()*1000;this.terrain=new Array(W);for(let x=0;x<W;x++)this.terrain[x]=p.base-p.a1*Math.sin((x+s)*p.f1)-p.a2*Math.sin((x+s*1.7)*p.f2)-p.a3*Math.sin((x+s*2.3)*p.f3)-(Math.random()*3-1.5);for(let i=0;i<3;i++){const c=[...this.terrain];for(let x=1;x<W-1;x++)this.terrain[x]=(c[x-1]+c[x]+c[x+1])/3;}}
  _initPlayers(configs){const n=configs.length;const pos=n===2?[250,950]:n===3?[180,600,1020]:[150,430,770,1050];
    this.players=configs.map((cfg,i)=>{const x=pos[i];const wpns=[];cfg.weapons.forEach(wId=>{wpns.push(wId);wpns.push(wId);});
      return{name:cfg.name,color:PCOLS[i],x,y:this.terrain[Math.floor(x)],hp:100,alive:true,weapons:wpns,currentWeapon:0,movesLeft:MOVE_T,lastAngle:60,lastPower:50,facing:i<n/2?1:-1,tilt:0,recoilPos:0,recoilVel:0,muzzleFlash:0};});}
  _newWind(){this.wind=(Math.random()-0.5)*0.04;}
  start(){this.lastTime=performance.now();const loop=n=>{let dt=Math.min(n-this.lastTime,33);this.lastTime=n;
    if(this.freezeTimer>0){this.freezeTimer-=16;this.render();this.raf=requestAnimationFrame(loop);return;}
    if(this.slowMo){dt*=0.4;this.slowMoTimer-=16;this.slowMoAlpha=Math.min(1,this.slowMoAlpha+0.1);if(this.slowMoTimer<=0){this.slowMo=false;this.slowMoCenter=null;SFX.slowmoEnd();}}
    else this.slowMoAlpha=Math.max(0,this.slowMoAlpha-0.04);
    try{this.update(dt);this.render();if(this.vfx){this.vfx.update(dt);this.vfx.render(W,H);}}catch(e){console.error(e);}this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);}
  stop(){if(this.raf)cancelAnimationFrame(this.raf);}

  _triggerSlowMo(x,y){if(!this.slowMo){this.slowMo=true;this.slowMoTimer=400;this.slowMoCenter={x,y};SFX.slowmo();}}
  _triggerFreeze(ms){this.freezeTimer=ms;}
  _triggerShake(intensity,duration,x,y){this.shakeIntensity=intensity;this.shakeTimer=duration;this.shakeX=x||W/2;this.shakeY=y||H/2;}
  _addFlash(x,y,radius,color,duration){this.lightFlashes.push({x,y,r:radius,color,t:duration,maxT:duration});}

  update(dt){
    if(this.shakeTimer>0)this.shakeTimer-=dt;
    this.damagePopups=this.damagePopups.filter(p=>{p.t-=dt;p.y-=0.4;return p.t>0;});
    this.particles=this.particles.filter(p=>{if(this.slowMo&&this.slowMoCenter){const dx=this.slowMoCenter.x-p.x,dy=this.slowMoCenter.y-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d>5&&d<150){p.vx+=dx/d*0.15;p.vy+=dy/d*0.15;}}
      p.x+=p.vx;p.y+=p.vy;p.vy+=p.grav||0.04;p.life-=dt;return p.life>0;});
    this.explosions=this.explosions.filter(e=>{e.t-=dt;e.r+=e.speed;return e.t>0;});
    this.beams=this.beams.filter(b=>{b.t-=dt;return b.t>0;});
    this.lightFlashes=this.lightFlashes.filter(f=>{f.t-=dt;return f.t>0;});
    this.ambientP.forEach(p=>{p.x+=Math.cos(p.d)*p.sp;p.y+=Math.sin(p.d)*p.sp*0.5;if(p.x>W)p.x=0;if(p.x<0)p.x=W;if(p.y>H*0.6)p.y=0;});
    // Spring-damper recoil + tilt
    this.players.forEach(pl=>{if(pl.tilt)pl.tilt*=0.9;if(Math.abs(pl.tilt)<0.002)pl.tilt=0;
      // Spring recoil: F = -k*x, damped
      pl.recoilVel=pl.recoilVel||0;pl.recoilPos=pl.recoilPos||0;
      pl.recoilVel+=(-pl.recoilPos*0.18);pl.recoilVel*=0.82;pl.recoilPos+=pl.recoilVel;
      if(Math.abs(pl.recoilPos)<0.3&&Math.abs(pl.recoilVel)<0.1){pl.recoilPos=0;pl.recoilVel=0;}
      if(pl.muzzleFlash>0)pl.muzzleFlash-=16;});
    if(this.phase==="firing")this._updateProjectiles();
    else if(this.phase==="falling")this._updateFalling();
  }

  _updateProjectiles(){
    if(!this.projectiles.length){this.phase="falling";this._startFalling();return;}
    const rm=[];
    for(let i=0;i<this.projectiles.length;i++){
      const p=this.projectiles[i],mt=p.moveType||"arc";
      if(mt==="arc"){
        p.vx+=this.wind;p.vy+=GRAVITY;p.x+=p.vx;p.y+=p.vy;
        p._prevVy=p.vy;
      }
      else if(mt==="roll"){
        // Squash animation on landing
        if(p.squashTimer>0){p.squashTimer-=16;continue;}
        const spd=p.rollSpeed||3,dir=p.rollDir||1,nx=p.x+dir*spd;
        if(nx<5||nx>W-5){this._explode(p.x,p.y,p.weapon);rm.push(i);continue;}
        const ny=this.terrain[Math.floor(nx)]||H,slope=(ny-(this.terrain[Math.floor(p.x)]||H))/spd;
        p.rollSpeed=Math.max(0.3,Math.min(10,spd+slope*2.5));p.x=nx;p.y=ny-20;
        if(Math.random()>0.3)this.particles.push({x:p.x+(Math.random()-0.5)*30,y:p.y+15,vx:(Math.random()-0.5)*2,vy:-2-Math.random()*4,life:400,color:Math.random()>0.5?"#ef4444":"#f97316",size:2+Math.random()*4,grav:0.02});
        let hit=false;this.players.forEach(pl=>{if(!pl.alive)return;if(Math.abs(pl.x-p.x)<25)hit=true;});
        p.rollDist=(p.rollDist||0)+spd;
        if(hit||p.rollSpeed<0.3||p.rollDist>600){this._explode(p.x,p.y+20,p.weapon);rm.push(i);continue;}
      }
      else if(mt==="bounce"){
        p.vx+=this.wind;p.vy+=GRAVITY;p.x+=p.vx;p.y+=p.vy;
        const tx=Math.floor(p.x);if(tx>=0&&tx<W&&p.y>=this.terrain[tx]){
          p.bouncesLeft=(p.bouncesLeft??3)-1;
          if(p.bouncesLeft<=0){this._explode(p.x,this.terrain[tx],p.weapon);rm.push(i);continue;}
          p.y=this.terrain[tx]-2;p.vy*=-0.6;p.vx*=0.8;SFX.impact();
          // Bounce sparks
          for(let s=0;s<12;s++){const a=Math.random()*Math.PI,sp=1+Math.random()*5;this.particles.push({x:p.x+(Math.random()-0.5)*8,y:p.y,vx:Math.cos(a)*sp*(Math.random()>0.5?1:-1),vy:-Math.sin(a)*sp,life:400,color:["#facc15","#fff","#f97316"][Math.floor(Math.random()*3)],size:1+Math.random()*2,grav:0.06});}
          this._triggerShake(3,80,p.x,p.y);continue;}
      }
      else if(mt==="hover"){
        p.hoverTime=(p.hoverTime||0)+16;p.y=p.hoverY+Math.sin(p.hoverTime*0.005)*3;
        if(p.hoverTime>400&&p.dropsLeft>0){const interval=p.weapon.type==="hover_rain"?200:500;
          if(p.hoverTime%interval<20){p.dropsLeft--;
            this.projectiles.push({x:p.x+(Math.random()-0.5)*30,y:p.y+10,vx:0,vy:2,weapon:{...p.weapon,_isSub:true,type:"arc",shake:4},trail:true,trailColor:p.weapon.type==="hover_rain"?"#4ade80":"#f97316",moveType:"arc",_slowed:true});SFX.fire();}}
        if(p.dropsLeft<=0&&p.hoverTime>1200){rm.push(i);continue;}
        if(Math.random()>0.6){const col=p.weapon.type==="hover_rain"?"#4ade80":"#888";this.particles.push({x:p.x+(Math.random()-0.5)*20,y:p.y+(Math.random()-0.5)*10,vx:(Math.random()-0.5),vy:Math.random()*-0.5,life:400,color:col,size:2,grav:0});}
      }
      if(p.trail){const n=this.slowMo?4:1;for(let t=0;t<n;t++)this.trailPoints.push({x:p.x+(Math.random()-0.5)*3,y:p.y+(Math.random()-0.5)*3,t:this.slowMo?600:350,color:p.trailColor||"#facc15"});}
      if(p.x<-50||p.x>W+50||p.y>H+50){rm.push(i);continue;}
      if(mt==="arc"){const tx=Math.floor(p.x);if(tx>=0&&tx<W&&p.y>=this.terrain[tx]){
        if(p.weapon?.type==="tire_arc"&&!p._converted){p._converted=true;p.moveType="roll";p.y=this.terrain[tx]-20;p.rollSpeed=Math.abs(p.vx)*0.8+3;p.rollDir=p.vx>0?1:-1;p.rollDist=0;p.shape="tire";p.squashTimer=120;SFX.impact();
          this._triggerShake(3,80,p.x,p.y);
          // Landing dust burst
          for(let di=0;di<8;di++){const da=Math.random()*Math.PI,ds=1+Math.random()*3;this.particles.push({x:p.x+(Math.random()-0.5)*20,y:this.terrain[tx],vx:Math.cos(da)*ds*(Math.random()>0.5?1:-1),vy:-Math.random()*2,life:300,color:"#5a4a38",size:2+Math.random()*3,grav:0.04});}
          continue;}
        if(p.weapon?.type==="lightning_arc"&&!p._converted){p._converted=true;this._lightningStrike(p.x,this.terrain[tx],p.weapon);rm.push(i);continue;}
        if((p.weapon?.type==="hover_drop"||p.weapon?.type==="hover_rain")&&!p._converted&&p.vy>0){p._converted=true;p.moveType="hover";p.hoverY=p.y;p.hoverTime=0;p.dropsLeft=p.weapon.drops||3;
          if(p.weapon.type==="hover_drop")p.droneHP=20;// Drone can be shot down
          continue;}
        this._explode(p.x,this.terrain[tx],p.weapon);rm.push(i);}}
    }
    for(let i=rm.length-1;i>=0;i--)this.projectiles.splice(rm[i],1);
    this.trailPoints=this.trailPoints.filter(t=>{t.t-=16;return t.t>0;});
  }

  _lightningStrike(x,y,weapon){
    SFX.fireElectric();this._triggerSlowMo(x,y);
    this.players.forEach(pl=>{if(!pl.alive)return;if(Math.abs(pl.x-x)<200){this.beams.push({x1:x,y1:y,x2:pl.x,y2:pl.y-15,t:800,color:"#60a5fa"});}});
    this.beams.push({x1:x,y1:y,x2:x+(Math.random()-0.5)*40,y2:-20,t:600,color:"#93c5fd80"});
    this._addFlash(x,y,200,"#3b82f6",400);
    this._explode(x,y,weapon);
  }

  _explode(x,y,weapon){
    const w=weapon||WEAPONS[0];
    if(w.isBuild){for(let dx=-45;dx<=45;dx++){const tx=Math.floor(x+dx);if(tx>=0&&tx<W){const d=Math.abs(dx)/45;this.terrain[tx]=Math.max(50,this.terrain[tx]-40*(1-d*d));}}
      for(let p=0;p<3;p++){const c=[...this.terrain];for(let dx=-55;dx<=55;dx++){const tx=Math.floor(x+dx);if(tx>0&&tx<W-1)this.terrain[tx]=(c[tx-1]+c[tx]+c[tx+1])/3;}}
      SFX.build();this.damagePopups.push({x,y:y-50,dmg:0,t:1200,text:"⛰️ BUILT"});
      for(let i=0;i<20;i++)this.particles.push({x:x+(Math.random()-0.5)*60,y:y-Math.random()*30,vx:(Math.random()-0.5)*3,vy:-Math.random()*5,life:600,color:"#4ade80",size:2+Math.random()*4,grav:0.04});
      this._triggerShake(3,150,x,y);this._syncState();return;}

    // === IMPACT ===
    const shakeI=w.shake||8;
    this._triggerFreeze(w.damage>20?40:25);
    this._triggerShake(shakeI,shakeI*20,x,y);
    if(!w._isSub)this._triggerSlowMo(x,y);// No slow-mo for drone/cluster sub-drops
    const flashColor=w.type==="lightning_arc"?"#3b82f6":w.type==="pool"?"#ef4444":"#f97316";
    this._addFlash(x,y,w.radius*1.2,flashColor,250);
    // GPU particle explosion
    if(this.vfx)this.vfx.explode(x,y,flashColor,w.damage/15);
    // Weapon-specific explosion sound
    if(w.type==="bounce")SFX.explosionBounce();
    else if(w.type==="lightning_arc")SFX.explosionElectric();
    else if(w.type==="pool")SFX.explosionFire();
    else if(w.type==="tire_arc")SFX.explosionTire();
    else if(w.type==="hover_drop")SFX.explosionDrone();
    else if(w.type==="hover_rain")SFX.explosionChemical();
    else if(w._isSub)SFX.explosionCluster();
    else if(w.damage>=25)SFX.explosionBig();
    else SFX.explosion();setTimeout(()=>SFX.debris(),60);
    this.explosions.push({x,y,r:3,t:600,speed:w.radius/8,color:flashColor,wR:w.radius,stage:"fire"});
    this.explosions.push({x,y,r:w.radius*0.2,t:300,speed:2.5,color:"#fff",wR:0,stage:"ring"});

    // DIG TERRAIN — varied crater, capped depth
    const tR=Math.max(w._isSub?10:w.terrain,15);const cR=Math.max(tR,22);
    const craterOff=Math.random()*4-2;
    for(let dx=-cR;dx<=cR;dx++){const tx=Math.floor(x+dx+craterOff);if(tx>=0&&tx<W){const d=Math.abs(dx)/cR;
      const v=0.7+Math.random()*0.6;
      this.terrain[tx]=Math.min(H-50,this.terrain[tx]+tR*(1-d*d)*1.0*v);}}
    for(let p=0;p<2;p++){const c=[...this.terrain];for(let dx=-cR-5;dx<=cR+5;dx++){const tx=Math.floor(x+dx);if(tx>0&&tx<W-1)this.terrain[tx]=(c[tx-1]+c[tx]+c[tx+1])/3;}}

    // Sparks — few, small, fire-colored only
    for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*5;
      this.particles.push({x:x+(Math.random()-0.5)*12,y:y-Math.random()*5,vx:Math.cos(a)*sp,vy:-2-Math.random()*5,life:250+Math.random()*300,color:["#ff8020","#ff5010","#ffb040"][Math.floor(Math.random()*3)],size:1+Math.random()*1.5,grav:0.06});}
    // Dirt — brown chunks flying up from crater
    for(let i=0;i<8;i++){const a=-Math.PI*0.2-Math.random()*Math.PI*0.6,sp=2+Math.random()*4;
      this.particles.push({x:x+(Math.random()-0.5)*cR*0.4,y,vx:Math.cos(a)*sp*(Math.random()>0.5?1:-1),vy:-2-Math.random()*5,life:400+Math.random()*500,color:"#4a3a28",size:2+Math.random()*3,grav:0.08});}
    // Smoke — just 3 puffs, dark, slow rising
    for(let i=0;i<3;i++)this.particles.push({x:x+(Math.random()-0.5)*12,y:y-5-i*4,vx:(Math.random()-0.5)*0.2,vy:-0.1-Math.random()*0.15,life:600+Math.random()*300,color:"rgba(40,35,30,0.35)",size:5+Math.random()*6,grav:-0.002});

    if(w.type==="pool")this.zones.push({x,y,radius:w.radius,turns:w.poolTurns||3,dmg:w.poolDmg||8,type:"pool",color:"#ef4444"});

    // Damage with sparkle range
    this.players.forEach(pl=>{if(!pl.alive)return;const hD=Math.abs(pl.x-x);const eR=w.radius*1.2;
      if(hD<eR){const nd=hD/eR;const fo=nd<0.3?1:1-Math.pow((nd-0.3)/0.7,1.3);const dmg=Math.round(w.damage*fo);
        if(dmg>0){pl.hp=Math.max(0,pl.hp-dmg);SFX.damage();this.damagePopups.push({x:pl.x,y:pl.y-50,dmg,t:1400});if(pl.hp<=0)pl.alive=false;}}});
    // 6. Damage drones in blast radius
    this.projectiles.forEach(proj=>{if(proj.moveType!=="hover"||!proj.droneHP)return;
      const dist=Math.sqrt((proj.x-x)**2+(proj.y-y)**2);
      if(dist<w.radius*1.5){const dmg=Math.round(w.damage*(1-dist/(w.radius*1.5))*0.8);
        if(dmg>0){proj.droneHP-=dmg;if(proj.droneHP<=0){proj.dropsLeft=0;proj.hoverTime=9999;
          this.damagePopups.push({x:proj.x,y:proj.y-20,dmg:0,t:1500,text:"🛸 DESTROYED"});
          for(let di=0;di<12;di++){const da=Math.random()*Math.PI*2,ds=1+Math.random()*4;this.particles.push({x:proj.x,y:proj.y,vx:Math.cos(da)*ds,vy:Math.sin(da)*ds-2,life:400,color:["#888","#666","#f97316"][Math.floor(Math.random()*3)],size:2+Math.random()*3,grav:0.05});}
          this._addFlash(proj.x,proj.y,40,"#f97316",200);SFX.explosionCluster();}}}});
    this._syncState();
  }

  _applyZones(){this.zones.forEach(z=>{this.players.forEach(pl=>{if(!pl.alive)return;if(Math.abs(pl.x-z.x)<z.radius){pl.hp=Math.max(0,pl.hp-z.dmg);SFX.damage();this.damagePopups.push({x:pl.x,y:pl.y-50,dmg:z.dmg,t:1000,text:"🔥 BURN"});if(pl.hp<=0)pl.alive=false;}});z.turns--;if(z.type==="pool")for(let dx=-z.radius/2;dx<=z.radius/2;dx++){const tx=Math.floor(z.x+dx);if(tx>=0&&tx<W)this.terrain[tx]=Math.min(H,this.terrain[tx]+0.5);}});this.zones=this.zones.filter(z=>z.turns>0);}
  _startFalling(){let a=false;this.players.forEach(pl=>{if(!pl.alive)return;const gy=this.terrain[Math.floor(pl.x)]||H;if(pl.y<gy-2){a=true;pl._fs=pl.y;}});if(!a)this._endTurn();}
  _updateFalling(){let s=false;this.players.forEach(pl=>{if(!pl.alive)return;const gy=Math.min(H-50,this.terrain[Math.floor(Math.max(0,Math.min(W-1,pl.x)))]||H);if(pl.y<gy-1){pl.y=Math.min(gy,pl.y+2.5);s=true;}else{pl.y=gy;if(pl._fs!==undefined){const f=pl.y-pl._fs;if(f>10){const d=Math.min(20,Math.floor(f/10)*2);if(d>0){pl.hp=Math.max(0,pl.hp-d);SFX.damage();this.damagePopups.push({x:pl.x,y:pl.y-50,dmg:d,t:1000});if(pl.hp<=0)pl.alive=false;}}delete pl._fs;}}});if(!s)this._endTurn();}

  _endTurn(){
    const alive=this.players.filter(p=>p.alive);
    if(alive.length<=1){this.winner=alive[0]||null;this.phase="gameOver";this._syncState();return;}
    this.turnCount++;let next=(this.currentPlayer+1)%this.players.length,tries=0;
    while(!this.players[next].alive&&tries<this.players.length){next=(next+1)%this.players.length;tries++;}
    if(!this.players[next].weapons.length){let nx=(next+1)%this.players.length;while((!this.players[nx].alive||!this.players[nx].weapons.length)&&nx!==next)nx=(nx+1)%this.players.length;
      if(nx===next){this.winner=alive.reduce((a,b)=>a.hp>=b.hp?a:b);this.phase="gameOver";this._syncState();return;}next=nx;}
    this.currentPlayer=next;this._newWind();this.angle=this.players[next].lastAngle||60;this.power=this.players[next].lastPower||50;
    this.players[next].movesLeft=MOVE_T;this.mode="attack";this._applyZones();this.phase="aiming";this.trailPoints=[];
    this.turnBanner=1500;this.turnBannerName=this.players[next].name;
    this._syncState();
  }

  fire(){
    if(this.phase!=="aiming")return;const pl=this.players[this.currentPlayer];if(!pl.alive)return;
    const isBuild=this.mode==="build";let weapon;
    if(isBuild){weapon={damage:0,radius:0,terrain:0,type:"arc",isBuild:true};}
    else{if(!pl.weapons.length)return;const wId=pl.weapons[pl.currentWeapon];weapon=WEAPONS.find(w=>w.id===wId)||WEAPONS[0];
      pl.weapons.splice(pl.currentWeapon,1);if(pl.currentWeapon>=pl.weapons.length)pl.currentWeapon=Math.max(0,pl.weapons.length-1);}
    pl.lastAngle=this.angle;pl.lastPower=this.power;
    const rad=(this.angle*Math.PI)/180,spd=(this.power/100)*MAX_P,f=pl.facing,tc=isBuild?"#4ade80":pl.color;
    const lx=pl.x+f*Math.cos(rad)*55,ly=pl.y-28-Math.sin(rad)*55;
    SFX.fire();if(weapon.type==="arc"&&!weapon.isBuild&&weapon.id==="basic")setTimeout(()=>SFX.shellWhistle(),100);
    if(weapon.type==="bounce"){this.projectiles.push({x:lx,y:ly,vx:Math.cos(rad)*spd*f,vy:-Math.sin(rad)*spd,weapon,trail:true,trailColor:tc,moveType:"bounce",bouncesLeft:weapon.bounces||3,shape:"ball"});}
    else if(weapon.type==="rapid"){
      // First rocket fires immediately (synchronous), rest delayed
      this.projectiles.push({x:lx,y:ly,vx:Math.cos(rad-0.08)*spd*f,vy:-Math.sin(rad-0.08)*spd,weapon:{...weapon,_isSub:true,type:"arc",shake:4},trail:true,trailColor:tc,moveType:"arc"});
      for(let i=1;i<(weapon.count||3);i++){setTimeout(()=>{if(this.phase!=="firing")return;this.projectiles.push({x:lx,y:ly,vx:Math.cos(rad+(i-1)*0.08)*spd*f,vy:-Math.sin(rad+(i-1)*0.08)*spd,weapon:{...weapon,_isSub:true,type:"arc",shake:4},trail:true,trailColor:tc,moveType:"arc"});SFX.fire();},i*180);}}
    else{this.projectiles.push({x:lx,y:ly,vx:Math.cos(rad)*spd*f,vy:-Math.sin(rad)*spd,weapon,trail:true,trailColor:tc,moveType:"arc"});}
    // Recoil + muzzle flash
    const pi=this.currentPlayer;
    pl.recoilVel=pi===0?-6:-9;// P1 light, P2 heavy impulse
    pl.muzzleFlash=180;
    const mfx=pl.x+pl.facing*Math.cos(rad)*60,mfy=pl.y-28-Math.sin(rad)*60;
    const mfCol=pi===0?"#60a5fa":"#f97316";
    this._addFlash(mfx,mfy,40,mfCol,150);
    if(this.vfx)this.vfx.muzzleFlash(mfx,mfy,mfCol,rad,pl.facing);
    for(let mi=0;mi<15;mi++){const ma=rad+(Math.random()-0.5)*0.8,ms=2+Math.random()*6;
      this.particles.push({x:mfx,y:mfy,vx:Math.cos(ma)*ms*pl.facing,vy:-Math.sin(ma)*ms,life:200+Math.random()*300,
        color:pi===0?["#60a5fa","#93c5fd","#3b82f6","#dbeafe"][Math.floor(Math.random()*4)]:["#f97316","#fb923c","#fdba74","#fef3c7"][Math.floor(Math.random()*4)],size:1+Math.random()*2.5,grav:0.03});}
    this.phase="firing";this._syncState();
  }

  toggleMode(){this.mode=this.mode==="attack"?"build":"attack";SFX.click();this._syncState();}
  moveLeft(){if(this.phase!=="aiming")return;const p=this.players[this.currentPlayer];if(p.movesLeft<MOVE_S)return;p.x=Math.max(30,p.x-MOVE_S);p.y=this.terrain[Math.floor(p.x)]||H;p.movesLeft-=MOVE_S;p.tilt=-0.08;SFX.move();this._syncState();}
  moveRight(){if(this.phase!=="aiming")return;const p=this.players[this.currentPlayer];if(p.movesLeft<MOVE_S)return;p.x=Math.min(W-30,p.x+MOVE_S);p.y=this.terrain[Math.floor(p.x)]||H;p.movesLeft-=MOVE_S;p.tilt=0.08;SFX.move();this._syncState();}
  setAngle(a){this.angle=Math.max(5,Math.min(175,a));this._syncState();}
  setPower(p){this.power=Math.max(5,Math.min(100,p));this._syncState();}
  nextWeapon(){const p=this.players[this.currentPlayer];if(p.weapons.length)p.currentWeapon=(p.currentWeapon+1)%p.weapons.length;SFX.weaponSwitch();this._syncState();}
  prevWeapon(){const p=this.players[this.currentPlayer];if(p.weapons.length)p.currentWeapon=(p.currentWeapon-1+p.weapons.length)%p.weapons.length;SFX.weaponSwitch();this._syncState();}
  _syncState(){if(this.onUpdate)this.onUpdate(this.getState());}
  getState(){const pl=this.players[this.currentPlayer];return{phase:this.phase,mode:this.mode,currentPlayer:this.currentPlayer,players:this.players.map(p=>({...p,weapons:[...p.weapons]})),angle:this.angle,power:this.power,wind:this.wind,turnCount:this.turnCount,winner:this.winner,currentWeapon:pl?.weapons?.[pl?.currentWeapon],weaponCount:pl?.weapons?.length||0,movesLeft:pl?.movesLeft||0,zones:this.zones.length,turnBanner:this.turnBanner>0?this.turnBanner:0,turnBannerName:this.turnBannerName};}

  /* ═══ CINEMATIC RENDERING ═══ */
  render(){
    const ctx=this.ctx,cw=this.canvas.width,ch=this.canvas.height;ctx.save();
    // Directional screen shake
    if(this.shakeTimer>0){const t=this.shakeTimer/300,s=this.shakeIntensity*t;ctx.translate((Math.random()-0.5)*s*2,(Math.random()-0.5)*s*2);}
    ctx.scale(cw/W,ch/H);

    // Sky
    const sky=ctx.createLinearGradient(0,0,0,H);this.theme.sky.forEach((c,i)=>sky.addColorStop(i/(this.theme.sky.length-1),c));ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    if(this.theme.star){if(!this._stars)this._stars=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H*0.5,s:0.3+Math.random()*1.2,b:0.15+Math.random()*0.7}));this._stars.forEach(s=>{ctx.fillStyle=`rgba(255,255,255,${s.b*(0.3+0.7*Math.sin(Date.now()*0.0006+s.x))})`;ctx.beginPath();ctx.arc(s.x,s.y,s.s*0.4,0,Math.PI*2);ctx.fill();});}
    ctx.fillStyle=this.theme.ambient;this.ambientP.forEach(p=>{ctx.globalAlpha=0.3+0.2*Math.sin(Date.now()*0.002+p.x);ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;

    // Dynamic light flashes — illuminate terrain
    this.lightFlashes.forEach(f=>{const a=f.t/f.maxT;ctx.globalAlpha=a*0.4;const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,f.color);g.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=g;ctx.fillRect(f.x-f.r,f.y-f.r,f.r*2,f.r*2);ctx.globalAlpha=1;});

    // Terrain
    const tg=ctx.createLinearGradient(0,200,0,H);this.theme.terrain.forEach((c,i)=>tg.addColorStop(i/(this.theme.terrain.length-1),c));ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<W;x++)ctx.lineTo(x,this.terrain[x]);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    // Surface glow
    ctx.strokeStyle=this.theme.surface;ctx.lineWidth=2;ctx.shadowColor=this.theme.surface;ctx.shadowBlur=8;ctx.beginPath();for(let x=0;x<W;x++){if(x===0)ctx.moveTo(x,this.terrain[x]);else ctx.lineTo(x,this.terrain[x]);}ctx.stroke();ctx.shadowBlur=0;
    // Sub-surface lines
    for(let d=18;d<90;d+=22){ctx.strokeStyle=`rgba(255,255,255,${0.02-d*0.0002})`;ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<W;x+=3){const ty=this.terrain[x]+d+Math.sin(x*0.04+d)*3;if(ty<H){if(x===0)ctx.moveTo(x,ty);else ctx.lineTo(x,ty);}}ctx.stroke();}

    // Zones
    this.zones.forEach(z=>{ctx.globalAlpha=0.35+0.15*Math.sin(Date.now()*0.005);ctx.fillStyle=z.color;ctx.beginPath();for(let dx=-z.radius;dx<=z.radius;dx++){const tx=Math.floor(z.x+dx);if(tx>=0&&tx<W){const ty=this.terrain[tx];if(dx===-z.radius)ctx.moveTo(tx,ty);else ctx.lineTo(tx,ty);}}ctx.lineTo(Math.floor(z.x+z.radius),H);ctx.lineTo(Math.floor(z.x-z.radius),H);ctx.closePath();ctx.fill();
      if(Math.random()>0.5)this.particles.push({x:z.x+(Math.random()-0.5)*z.radius,y:this.terrain[Math.floor(z.x)]-Math.random()*6,vx:(Math.random()-0.5),vy:-1-Math.random()*3,life:350,color:"#ef4444",size:2+Math.random()*3,grav:0.01});ctx.globalAlpha=1;});

    // Trails
    this.trailPoints.forEach(p=>{ctx.fillStyle=p.color;ctx.globalAlpha=(p.t/500)*(this.slowMo?1.5:1);ctx.shadowColor=p.color;ctx.shadowBlur=this.slowMo?12:4;ctx.beginPath();ctx.arc(p.x,p.y,this.slowMo?3:1.5,0,Math.PI*2);ctx.fill();});ctx.shadowBlur=0;ctx.globalAlpha=1;

    // Beams
    this.beams.forEach(b=>{ctx.strokeStyle=b.color;ctx.lineWidth=4;ctx.globalAlpha=b.t/800;ctx.shadowColor="#3b82f6";ctx.shadowBlur=25;ctx.beginPath();ctx.moveTo(b.x1,b.y1);const bx=b.x2-b.x1,by=b.y2-b.y1;for(let i=1;i<=15;i++){const t=i/15;ctx.lineTo(b.x1+bx*t+(Math.random()-0.5)*16,b.y1+by*t+(Math.random()-0.5)*16);}ctx.stroke();ctx.lineWidth=1.5;ctx.strokeStyle="#dbeafe";ctx.beginPath();ctx.moveTo(b.x1,b.y1);for(let i=1;i<=15;i++){const t=i/15;ctx.lineTo(b.x1+bx*t+(Math.random()-0.5)*8,b.y1+by*t+(Math.random()-0.5)*8);}ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;});

    // ═══ ENGINEERING LAUNCHER PLATFORMS ═══
    this.players.forEach((pl,i)=>{if(!pl.alive)return;const x=pl.x,y=pl.y,f=pl.facing,isCur=i===this.currentPlayer,angle=isCur?this.angle:(pl.lastAngle||60),rad=(angle*Math.PI)/180,c=pl.color;
      ctx.save();
      // Smooth terrain following — wide sample + interpolation
      const sL=Math.max(0,Math.floor(x-20)),sR=Math.min(W-1,Math.floor(x+20));
      const rawA=Math.atan2(this.terrain[sR]-this.terrain[sL],40);
      const tAngle=Math.max(-0.2,Math.min(0.2,rawA));
      // Store & lerp for smoothness
      pl._renderAngle=pl._renderAngle||0;pl._renderAngle+=(tAngle-pl._renderAngle)*0.08;
      ctx.translate(x,y);ctx.rotate(pl._renderAngle);
      const rc=pl.recoilPos||0;ctx.translate(f*rc*0.5,0);
      ctx.translate(-x,-y);

      // === CHASSIS ===
      const bw=60,bh=16,bx=x-bw/2,by=y-bh;
      const bodyG=ctx.createLinearGradient(bx,by,bx,by+bh);
      if(i===0){bodyG.addColorStop(0,"#5a6577");bodyG.addColorStop(0.3,"#4b5563");bodyG.addColorStop(0.7,"#374151");bodyG.addColorStop(1,"#1f2937");}
      else{bodyG.addColorStop(0,"#5a5248");bodyG.addColorStop(0.3,"#44403c");bodyG.addColorStop(0.7,"#352f2a");bodyG.addColorStop(1,"#1c1917");}
      ctx.fillStyle=bodyG;ctx.beginPath();ctx.roundRect(bx,by,bw,bh,3);ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(bx+3,by+0.5);ctx.lineTo(bx+bw-3,by+0.5);ctx.stroke();
      ctx.strokeStyle="rgba(0,0,0,0.2)";ctx.lineWidth=0.5;
      ctx.beginPath();ctx.moveTo(bx+16,by+2);ctx.lineTo(bx+16,by+bh-2);ctx.moveTo(bx+bw-16,by+2);ctx.lineTo(bx+bw-16,by+bh-2);ctx.stroke();

      // === WHEELS ===
      for(let wi=0;wi<6;wi++){const wx=bx+6+wi*10,wy=y-8;
        ctx.fillStyle="#0e0e0e";ctx.beginPath();ctx.arc(wx,wy,5.5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#1a1a1a";ctx.lineWidth=3;ctx.beginPath();ctx.arc(wx,wy,5.5,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle="#333";ctx.beginPath();ctx.arc(wx,wy,2.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#555";ctx.beginPath();ctx.arc(wx,wy,0.8,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#0a0a0a";ctx.fillRect(bx+3,y-10,bw-6,3);

      // === TURRET ===
      const tpw=23,tph=9;
      const tpG=ctx.createLinearGradient(x-tpw/2,by-tph,x-tpw/2,by);tpG.addColorStop(0,"#4a4a4a");tpG.addColorStop(1,"#2a2a2a");
      ctx.fillStyle=tpG;ctx.beginPath();ctx.roundRect(x-tpw/2,by-tph,tpw,tph,2);ctx.fill();

      // === PIVOT ===
      const pivotX=x-f*8,pivotY=by-tph-2;
      const pvG=ctx.createRadialGradient(pivotX,pivotY,0,pivotX,pivotY,8);pvG.addColorStop(0,"#777");pvG.addColorStop(0.4,"#555");pvG.addColorStop(1,"#222");
      ctx.fillStyle=pvG;ctx.beginPath();ctx.arc(pivotX,pivotY,8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#666";ctx.beginPath();ctx.arc(pivotX,pivotY,3,0,Math.PI*2);ctx.fill();

      // === BARREL — clean cylindrical tube ===
      ctx.save();ctx.translate(pivotX,pivotY);ctx.rotate(-pl._renderAngle);ctx.rotate(f===1?-rad:-(Math.PI-rad));
      const barLen=58,barW=6;
      // Simple metallic tube
      const barG=ctx.createLinearGradient(0,-barW,0,barW);
      barG.addColorStop(0,"#8a8a8a");barG.addColorStop(0.15,"#6a6a6a");barG.addColorStop(0.4,"#555");
      barG.addColorStop(0.6,"#444");barG.addColorStop(0.85,"#333");barG.addColorStop(1,"#222");
      ctx.fillStyle=barG;ctx.fillRect(0,-barW,barLen,barW*2);
      // Highlight + shadow
      ctx.fillStyle="rgba(255,255,255,0.1)";ctx.fillRect(2,-barW,barLen-4,1.5);
      ctx.fillStyle="rgba(0,0,0,0.15)";ctx.fillRect(2,barW-1.5,barLen-4,1.5);
      // 3 reinforcement bands
      for(const bp of [14,30,46]){const rG=ctx.createLinearGradient(bp,-barW-1,bp,barW+1);
        rG.addColorStop(0,"#999");rG.addColorStop(0.5,"#666");rG.addColorStop(1,"#444");
        ctx.fillStyle=rG;ctx.fillRect(bp,-barW-1,3,barW*2+2);}
      // Muzzle end cap
      ctx.fillStyle="#333";ctx.fillRect(barLen-4,-barW-1.5,6,barW*2+3);
      // Muzzle flash
      if(pl.muzzleFlash>0){ctx.fillStyle=c;ctx.globalAlpha=pl.muzzleFlash/180*0.4;ctx.beginPath();ctx.arc(barLen+2,0,8+Math.random()*3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
      // Idle animations
      if(i===0){const pulse=(Date.now()%3000)/3000;ctx.strokeStyle="#3b82f6";ctx.lineWidth=1;ctx.globalAlpha=0.12*(1-pulse);ctx.beginPath();ctx.ellipse(8+pulse*45,0,3+pulse*2,barW+pulse,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
      ctx.restore();

      // Distance only
      if(isCur){this.players.forEach((op,oi)=>{if(oi===this.currentPlayer||!op.alive)return;ctx.font="10px 'Share Tech Mono'";ctx.textAlign="center";ctx.fillStyle="rgba(200,200,200,0.15)";ctx.fillText(`${Math.round(Math.abs(op.x-x))}px`,op.x,op.y-45);});}
      ctx.restore();});

    // Aim guide 30%
    if(this.phase==="aiming"){const pl=this.players[this.currentPlayer];if(pl?.alive){
      const f=pl.facing,rad=(this.angle*Math.PI)/180,spd=(this.power/100)*MAX_P;
      const pivotOff=28;
      let sx=pl.x+f*Math.cos(rad)*60,sy=pl.y-pivotOff-Math.sin(rad)*60,vx=Math.cos(rad)*spd*f,vy=-Math.sin(rad)*spd;
      const pts=[{x:sx,y:sy}];for(let i=0;i<200;i++){vx+=this.wind;vy+=GRAVITY;sx+=vx;sy+=vy;pts.push({x:sx,y:sy});if(sy>H||sx<0||sx>W)break;const tx=Math.floor(sx);if(tx>=0&&tx<W&&sy>=this.terrain[tx])break;}
      const dc=Math.max(3,Math.floor(pts.length*0.3)),col=this.mode==="build"?"#4ade80":pl.color;
      ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<dc;i++)ctx.lineTo(pts[i].x,pts[i].y);
      ctx.strokeStyle=col+"50";ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.stroke();ctx.setLineDash([]);
      if(dc>0){const ep=pts[dc-1];ctx.fillStyle=col+"50";ctx.beginPath();ctx.arc(ep.x,ep.y,3,0,Math.PI*2);ctx.fill();}}}

    // Projectiles
    this.projectiles.forEach(p=>{const pc=p.trailColor||"#facc15";ctx.save();
      if(p.shape==="tire"||p.moveType==="roll"){
        ctx.translate(p.x,p.y);
        const squashScale=p.squashTimer>0?1+0.3*(p.squashTimer/120):1;
        ctx.scale(squashScale,1/squashScale);
        const rot=p.rollDist?p.rollDist*0.08*(p.rollDir||1):Date.now()*0.02*(p.rollDir||1);
        ctx.rotate(rot);
        // Outer rubber tire
        ctx.fillStyle="#1a1a1a";ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#222";ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.stroke();
        // Tread marks — visible pattern that shows rotation
        ctx.strokeStyle="#333";ctx.lineWidth=2;
        for(let t=0;t<12;t++){const a=t*Math.PI/6;
          ctx.beginPath();ctx.moveTo(Math.cos(a)*17,Math.sin(a)*17);ctx.lineTo(Math.cos(a)*23,Math.sin(a)*23);ctx.stroke();}
        // Inner rim
        ctx.fillStyle="#2a2a2a";ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#3a3a3a";ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.stroke();
        // Spokes — clearly visible
        ctx.strokeStyle="#4a4a4a";ctx.lineWidth=2;
        for(let s=0;s<5;s++){const a=s*Math.PI*2/5;
          ctx.beginPath();ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4);ctx.lineTo(Math.cos(a)*12,Math.sin(a)*12);ctx.stroke();}
        // Hub
        ctx.fillStyle="#555";ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#666";ctx.beginPath();ctx.arc(0,0,2,0,Math.PI*2);ctx.fill();
        // Fire glow
        ctx.shadowColor="#f97316";ctx.shadowBlur=25;ctx.strokeStyle="#f9731640";ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
      }else if(p.shape==="ball"){ctx.shadowColor="#ef4444";ctx.shadowBlur=15;ctx.fillStyle="#e44";ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f88";ctx.beginPath();ctx.arc(p.x-2,p.y-2,3,0,Math.PI*2);ctx.fill();
      }else if(p.moveType==="hover"){const col=p.weapon?.type==="hover_rain"?"#22c55e":"#888";ctx.shadowColor=col;ctx.shadowBlur=20;ctx.fillStyle=col;ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=1;ctx.globalAlpha=0.5;ctx.beginPath();ctx.arc(p.x,p.y,12+Math.sin(Date.now()*0.005)*3,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      }else{const sz=this.slowMo?5:3;ctx.shadowColor=pc;ctx.shadowBlur=this.slowMo?28:14;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x,p.y,sz,0,Math.PI*2);ctx.fill();ctx.fillStyle=pc;ctx.beginPath();ctx.arc(p.x,p.y,sz-1,0,Math.PI*2);ctx.fill();}
      ctx.restore();});

    // ═══ EXPLOSIONS — toned down, natural ═══
    this.explosions.forEach(e=>{const life=e.t/(e.stage==="ring"?300:700);
      if(e.stage==="ring"){ctx.globalAlpha=life*0.4;ctx.strokeStyle="rgba(255,230,200,0.35)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      }else{
        // Core fireball — SMALL, brief
        if(life>0.4){ctx.globalAlpha=(life-0.4)*1.5;
          const g=ctx.createRadialGradient(e.x,e.y-3,0,e.x,e.y-3,e.r*0.5);
          g.addColorStop(0,"rgba(255,240,200,0.7)");g.addColorStop(0.3,"rgba(255,150,40,0.4)");g.addColorStop(0.7,"rgba(200,60,10,0.15)");g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y-3,e.r*0.5,0,Math.PI*2);ctx.fill();}
        // Rising smoke — appears as fire fades
        if(life<0.6){ctx.globalAlpha=(0.6-life)*0.4;
          const sy=e.y-e.r*0.5-(1-life)*25;const sr=e.r*0.3;
          ctx.fillStyle="rgba(50,40,35,0.5)";ctx.beginPath();ctx.arc(e.x+(Math.sin(Date.now()*0.005)*4),sy,sr,0,Math.PI*2);ctx.fill();}
        ctx.globalAlpha=1;}});

    // Particles
    this.particles.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life/400);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*0.5,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;

    // Popups
    this.damagePopups.forEach(p=>{const a=Math.min(1,p.t/700),sc=1+(1-p.t/1400)*0.5;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);ctx.font="bold 18px 'Share Tech Mono'";ctx.textAlign="center";ctx.strokeStyle=`rgba(0,0,0,${a})`;ctx.lineWidth=4;const tx=p.text||`-${p.dmg}`;ctx.strokeText(tx,0,0);ctx.fillStyle=p.text?.includes("+")?`rgba(100,220,150,${a})`:`rgba(255,60,30,${a})`;ctx.fillText(tx,0,0);ctx.restore();});

    // Slow-mo — subtle space distortion
    if(this.slowMoAlpha>0.01){
      // Gentle vignette — not too dark
      const vg=ctx.createRadialGradient(W/2,H/2,W*0.25,W/2,H/2,W*0.55);
      vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,`rgba(0,0,0,${this.slowMoAlpha*0.3})`);
      ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
      // Heat haze ripples around projectile
      if(this.slowMoCenter){const c=this.slowMoCenter;
        ctx.strokeStyle=`rgba(255,220,180,${this.slowMoAlpha*0.06})`;ctx.lineWidth=1;
        for(let i=0;i<4;i++){const r=20+i*18+Math.sin(Date.now()*0.004+i*1.5)*6;ctx.globalAlpha=this.slowMoAlpha*(0.1-i*0.02);ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);ctx.stroke();}
        ctx.globalAlpha=1;}
    }
    ctx.restore();
  }
}
