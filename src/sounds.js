let ctx=null;
function gc(){if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();return ctx;}
function noise(d,v=0.2,dc=0.15){const c=gc(),l=c.sampleRate*d,b=c.createBuffer(1,l,c.sampleRate),dd=b.getChannelData(0);for(let i=0;i<l;i++)dd[i]=(Math.random()*2-1)*Math.exp(-i/(l*dc));const s=c.createBufferSource();s.buffer=b;const g=c.createGain();s.connect(g);g.connect(c.destination);g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);s.start();}
function tone(f,d,t="sine",v=0.15,fe=null){const c=gc(),o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.setValueAtTime(f,c.currentTime);if(fe)o.frequency.exponentialRampToValueAtTime(fe,c.currentTime+d);o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);o.start();o.stop(c.currentTime+d);}
function filtered(f,d,t,v,fe,fType,fFreq){const c=gc(),o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type=t;o.frequency.setValueAtTime(f,c.currentTime);if(fe)o.frequency.exponentialRampToValueAtTime(fe,c.currentTime+d);fl.type=fType;fl.frequency.setValueAtTime(fFreq,c.currentTime);o.connect(fl);fl.connect(g);g.connect(c.destination);g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);o.start();o.stop(c.currentTime+d);}
export const SFX={
  click(){tone(900,0.05,"square",0.04);},
  select(){tone(600,0.08,"sine",0.06);setTimeout(()=>tone(900,0.08,"sine",0.06),60);},
  // LAUNCH — per player type
  fire(){noise(0.2,0.2,0.08);tone(200,0.15,"sawtooth",0.1,50);},
  shellWhistle(){filtered(800,0.6,"sine",0.03,300,"highpass",400);},
  fireElectric(){tone(2000,0.2,"sawtooth",0.08,150);noise(0.12,0.08,0.05);},
  // SLOW-MO
  slowmo(){filtered(45,0.8,"sine",0.08,20,"lowpass",200);},
  slowmoEnd(){tone(300,0.1,"sine",0.04,600);},
  // IMPACT — dramatically different per weapon
  explosion(){// Standard cannon — deep thud + crunch
    tone(80,0.5,"sine",0.25,20);noise(0.4,0.18,0.1);},
  explosionBounce(){// Bouncer — metallic ping + sharp crack
    tone(400,0.2,"square",0.1,100);tone(150,0.3,"sine",0.12,30);
    setTimeout(()=>noise(0.15,0.1,0.06),30);},
  explosionTire(){// Tire — heavy crunch + rolling rumble
    tone(60,0.8,"triangle",0.2,12);noise(0.6,0.2,0.05);
    filtered(40,0.5,"sawtooth",0.08,15,"lowpass",120);},
  explosionElectric(){// Lightning — high zap + electric crackle
    tone(1500,0.15,"sawtooth",0.06,80);tone(600,0.2,"square",0.04,100);
    noise(0.2,0.1,0.03);setTimeout(()=>tone(2500,0.1,"sawtooth",0.03,200),50);},
  explosionFire(){// Napalm — whoosh + sustained burn
    noise(0.8,0.15,0.04);tone(120,0.6,"sine",0.1,25);
    filtered(200,0.4,"sawtooth",0.05,50,"lowpass",400);},
  explosionCluster(){// Cluster sub-hit — sharp pop
    tone(300,0.1,"sine",0.08,80);noise(0.1,0.1,0.08);},
  explosionBig(){// Heavy — massive bass boom + shockwave
    tone(40,1.0,"sine",0.3,8);noise(0.7,0.25,0.06);
    tone(30,0.6,"triangle",0.12,6);setTimeout(()=>noise(0.4,0.1,0.12),60);},
  explosionDrone(){// Drone bomb — whistling descent + pop
    tone(800,0.2,"sine",0.06,200);noise(0.3,0.15,0.08);},
  explosionChemical(){// Chemical — hissing sizzle
    noise(0.5,0.12,0.03);filtered(1000,0.3,"sawtooth",0.04,300,"highpass",500);},
  impact(){tone(200,0.12,"triangle",0.08,80);noise(0.15,0.08,0.08);},
  debris(){noise(0.2,0.06,0.1);},
  damage(){tone(180,0.1,"sawtooth",0.05,60);},
  move(){tone(400,0.04,"sine",0.03);},
  weaponSwitch(){tone(500,0.04,"square",0.03);setTimeout(()=>tone(700,0.04,"square",0.03),40);},
  build(){tone(300,0.1,"triangle",0.08);setTimeout(()=>tone(500,0.08,"triangle",0.06),80);setTimeout(()=>tone(700,0.06,"triangle",0.05),160);},
  victory(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.3,"sine",0.07),i*150));},
};
