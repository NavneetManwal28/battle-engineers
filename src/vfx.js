/* WebGL GPU Particle System — Dramatic Bloom + Glow */
const VERT=`
attribute vec2 aPos;
attribute vec2 aVel;
attribute vec4 aColor;
attribute vec2 aLifeSize;
uniform vec2 uRes;
varying vec4 vColor;
varying float vLife;
void main(){
  float life=aLifeSize.x;
  float maxLife=aLifeSize.y;
  float age=1.0-life/maxLife;
  vec2 pos=aPos+aVel*age*maxLife*0.001;
  pos.y+=age*age*40.0;
  vec2 clip=(pos/uRes)*2.0-1.0;
  clip.y=-clip.y;
  gl_Position=vec4(clip,0.0,1.0);
  float baseSize=aColor.a*100.0;
  gl_PointSize=max(2.0,baseSize*(0.2+0.8*(life/maxLife)));
  vColor=vec4(aColor.rgb,1.0);
  vLife=life/maxLife;
}`;
const FRAG=`
precision mediump float;
varying vec4 vColor;
varying float vLife;
void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  if(d>1.0)discard;
  float alpha=smoothstep(1.0,0.2,d)*vLife;
  float core=smoothstep(0.4,0.0,d);
  vec3 col=vColor.rgb+core*vec3(0.5,0.3,0.1);
  gl_FragColor=vec4(col,alpha*0.8);
}`;

const MAX_P=3000;
const STRIDE=10;// x,y,vx,vy,r,g,b,sizeFlag,life,maxLife

export class VFXOverlay{
  constructor(canvas){
    this.canvas=canvas;
    const gl=canvas.getContext("webgl",{alpha:true,premultipliedAlpha:false,antialias:false});
    if(!gl){console.warn("No WebGL");this.gl=null;return;}
    this.gl=gl;
    this.data=new Float32Array(MAX_P*STRIDE);
    this.pCount=0;
    this.w=0;this.h=0;
    this._init();
  }
  _sh(src,type){const gl=this.gl,s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  _init(){
    const gl=this.gl;
    const vs=this._sh(VERT,gl.VERTEX_SHADER),fs=this._sh(FRAG,gl.FRAGMENT_SHADER);
    this.prog=gl.createProgram();gl.attachShader(this.prog,vs);gl.attachShader(this.prog,fs);gl.linkProgram(this.prog);
    this.uRes=gl.getUniformLocation(this.prog,"uRes");
    this.vbo=gl.createBuffer();
  }
  _add(x,y,vx,vy,r,g,b,size,life){
    if(this.pCount>=MAX_P)this.pCount=0;
    const i=this.pCount*STRIDE;
    this.data[i]=x;this.data[i+1]=y;
    this.data[i+2]=vx;this.data[i+3]=vy;
    this.data[i+4]=r;this.data[i+5]=g;this.data[i+6]=b;
    this.data[i+7]=size;// encoded as 0-1, multiplied by 100 in shader
    this.data[i+8]=life;this.data[i+9]=life;
    this.pCount++;
  }
  explode(x,y,color,intensity=1){
    if(!this.gl)return;
    const r=parseInt(color.slice(1,3),16)/255;
    const g=parseInt(color.slice(3,5),16)/255;
    const b=parseInt(color.slice(5,7),16)/255;
    const n=Math.floor(60*Math.min(intensity,3));
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,sp=0.5+Math.random()*5*intensity;
      const cv=0.6+Math.random()*0.4;
      // Bright sparks
      this._add(x,y,Math.cos(a)*sp,Math.sin(a)*sp-Math.random()*3,
        Math.min(1,r*cv+0.2),g*cv*0.9,b*cv*0.7,
        0.04+Math.random()*0.08, 200+Math.random()*500);
    }
    // BIG glow particles — these create the bloom
    for(let i=0;i<8;i++){
      const a=Math.random()*Math.PI*2,sp=Math.random()*2;
      this._add(x+Math.cos(a)*10,y+Math.sin(a)*10,
        Math.cos(a)*sp,Math.sin(a)*sp-0.5,
        Math.min(1,r+0.3),Math.min(1,g+0.1),b*0.5,
        0.3+Math.random()*0.4, 300+Math.random()*400);// size 0.3-0.7 = 30-70px!
    }
    // White-hot core flash
    for(let i=0;i<4;i++){
      this._add(x+(Math.random()-0.5)*5,y+(Math.random()-0.5)*5,
        (Math.random()-0.5)*1,(Math.random()-0.5)*1,
        1,0.95,0.8, 0.5+Math.random()*0.3, 100+Math.random()*150);
    }
  }
  muzzleFlash(x,y,color,angle,facing){
    if(!this.gl)return;
    const r=parseInt(color.slice(1,3),16)/255;
    const g=parseInt(color.slice(3,5),16)/255;
    const b=parseInt(color.slice(5,7),16)/255;
    for(let i=0;i<20;i++){
      const spread=angle+(Math.random()-0.5)*0.5;
      const sp=3+Math.random()*7;
      this._add(x,y,Math.cos(spread)*sp*facing,-Math.sin(spread)*sp,
        Math.min(1,r+0.3),Math.min(1,g+0.2),b,
        0.03+Math.random()*0.06, 80+Math.random()*200);
    }
    // Flash glow
    this._add(x,y,0,0,1,0.9,0.7,0.6,80);
  }
  update(dt){
    if(!this.gl)return;
    let i=0;
    while(i<this.pCount){
      const idx=i*STRIDE;
      this.data[idx+8]-=dt;
      if(this.data[idx+8]<=0){
        const last=(this.pCount-1)*STRIDE;
        for(let j=0;j<STRIDE;j++)this.data[idx+j]=this.data[last+j];
        this.pCount--;
      }else i++;
    }
  }
  render(gameW,gameH){
    if(!this.gl||this.pCount===0)return;
    const gl=this.gl,c=this.canvas;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const tw=Math.floor((c.parentElement?.clientWidth||800)*dpr);
    const th=Math.floor((c.parentElement?.clientHeight||400)*dpr);
    // Only resize when dimensions change — avoids WebGL state reset
    if(this.w!==tw||this.h!==th){c.width=tw;c.height=th;this.w=tw;this.h=th;}
    gl.viewport(0,0,tw,th);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);// Additive = bloom
    gl.useProgram(this.prog);
    gl.uniform2f(this.uRes,gameW,gameH);
    // Scale particle positions from game coords to canvas pixels
    const sx=tw/gameW,sy=th/gameH,ss=Math.min(sx,sy);
    const upload=new Float32Array(this.pCount*STRIDE);
    for(let i=0;i<this.pCount;i++){
      const s=i*STRIDE;
      upload[s]=this.data[s]*sx;upload[s+1]=this.data[s+1]*sy;
      upload[s+2]=this.data[s+2]*sx;upload[s+3]=this.data[s+3]*sy;
      for(let j=4;j<STRIDE;j++)upload[s+j]=this.data[s+j];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER,upload,gl.DYNAMIC_DRAW);
    const B=STRIDE*4;
    const aPos=gl.getAttribLocation(this.prog,"aPos");
    const aVel=gl.getAttribLocation(this.prog,"aVel");
    const aColor=gl.getAttribLocation(this.prog,"aColor");
    const aLifeSize=gl.getAttribLocation(this.prog,"aLifeSize");
    gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,B,0);
    gl.enableVertexAttribArray(aVel);gl.vertexAttribPointer(aVel,2,gl.FLOAT,false,B,8);
    gl.enableVertexAttribArray(aColor);gl.vertexAttribPointer(aColor,4,gl.FLOAT,false,B,16);
    gl.enableVertexAttribArray(aLifeSize);gl.vertexAttribPointer(aLifeSize,2,gl.FLOAT,false,B,32);
    gl.drawArrays(gl.POINTS,0,this.pCount);
  }
}
