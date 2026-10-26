const R=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,u)=>a+(b-a)*u;
const fmt$=n=>(n<0?'-$':'$')+Math.abs(Math.round(n)).toLocaleString('es-VE');
const fmtN=n=>Math.round(n).toLocaleString('es-VE');
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const AIRLINES=[
  {code:'TU',name:'Turpial Air',c1:'#f2b705',c2:'#1b1b1b',c3:'#1b1b1b',em:'bird',style:'cheat',fleet:['ATR72','E190','A320']},
  {code:'CZ',name:'Caribe Azul',c1:'#1f6fd1',c2:'#eaf2ff',c3:'#0b2e66',em:'wave',style:'swoosh',fleet:['A320','B738','B788']},
  {code:'AJ',name:'Andes Jet',c1:'#d6343a',c2:'#ffffff',c3:'#7a1218',em:'peak',style:'tail',fleet:['B738','A320','B788']},
  {code:'OX',name:'Orinoco Express',c1:'#1f9e6a',c2:'#ffffff',c3:'#0d3b28',em:'river',style:'belly',fleet:['ATR72','E190']},
  {code:'AG',name:'Araguaney',c1:'#ec8a2f',c2:'#2a1500',c3:'#f6c33a',em:'flower',style:'full',fleet:['E190','A320','B738']},
  {code:'MS',name:'Margarita Sky',c1:'#12b3c4',c2:'#ffffff',c3:'#0b4f6c',em:'wave',style:'full',fleet:['A320','E190','B738']},
  {code:'LL',name:'Llanos Air',c1:'#6b3fb0',c2:'#ffffff',c3:'#f2b705',em:'peak',style:'nose',fleet:['ATR72','A320','B788']}
];
const DEST=[
  {c:'BOG',n:'Bogotá',b:235},{c:'PTY',n:'Panamá',b:262},{c:'MIA',n:'Miami',b:345},{c:'MAD',n:'Madrid',b:62},{c:'LIM',n:'Lima',b:205},
  {c:'SDQ',n:'Santo Domingo',b:22},{c:'AUA',n:'Aruba',b:318},{c:'CUR',n:'Curazao',b:330},
  {c:'PMV',n:'Porlamar',d:1,b:80},{c:'MAR',n:'Maracaibo',d:1,b:282},{c:'PZO',n:'Puerto Ordaz',d:1,b:130},{c:'BLA',n:'Barcelona',d:1,b:95}
];
const FIRST=['María','José','Luis','Ana','Carlos','Daniela','Gabriela','Andrés','Valentina','Miguel','Sofía','Jesús','Carmen','Pedro','Isabel','Rafael','Lucía','Diego','Paola','Alejandro','Rosa','Juan','Mariana','Eduardo'];
const LAST=['González','Rodríguez','Pérez','Hernández','García','Martínez','López','Díaz','Ramírez','Torres','Suárez','Rojas','Mendoza','Silva','Castillo','Medina','Romero','Vargas'];
function shade(hex,a){const n=parseInt(hex.slice(1),16);const r=clamp((n>>16)+a,0,255),g=clamp(((n>>8)&255)+a,0,255),b=clamp((n&255)+a,0,255);return'rgb('+r+','+g+','+b+')';}
const SKIN=['#f6d2b0','#e8b98f','#d39b6a','#b07a4f','#8a5a36','#5e3b22'];
const HAIR=['#1a1410','#2e2016','#4b3020','#6b4a2b','#a07a4a','#c9b48a','#8f8f8f','#d8d0c0'];
const SHIRT=['#2f6db5','#c0392b','#2e8b57','#f2c14e','#8e44ad','#f4f4f2','#34495e','#e67e22','#16a085','#d35d8a','#7f8c8d','#1f1f1f','#f5b7b1','#a3c4f3','#6d4c41'];
const BAGC=['#1f1f1f','#2c3e50','#7a1f2b','#3d5a80','#c0392b','#5d4037','#95a5a6','#e67e22','#1abc9c'];
const PANTS=['#2d3440','#1f2a44','#3b3b3b','#5a4632','#7d8a96','#2f4f3a','#e8e2d0','#4a2f3a'];
function look(o){return Object.assign({skin:pick(SKIN),hair:pick(HAIR),shirt:pick(SHIRT),bagc:pick(BAGC),pants:pick(PANTS),hs:pick(['short','short','long','long','bun','curly','bald']),phone:Math.random()<0.45,glasses:Math.random()<0.18,reader:Math.random()<0.2,shoe:pick(['#1b1b1b','#3a2a1e','#f4f4f4','#2c3e50'])},o||{});}
function staffLook(seed,shirt,cap,vest){const r=rng(seed);return{skin:SKIN[Math.floor(r()*SKIN.length)],hair:HAIR[Math.floor(r()*5)],shirt,cap,vest};}
let AC=null;
function beep(f,d,type,vol){if(!G||!G.sound||!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(vol||0.035,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d+0.02);}catch(e){}}
let NOISE=null,AMB=null;
const NUMS=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
function callsign(a,n){return a.name.split(' ')[0]+' '+String(n).split('').map(d=>NUMS[+d]).join(' ');}
function speak(text,low){if(!G||!G.sound||G.warm)return;try{const ss=window.speechSynthesis;if(!ss||(low&&ss.speaking))return;if(ss.pending)ss.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-ES';u.rate=1.12;u.pitch=0.9;u.volume=0.8;
  const v=ss.getVoices().find(v=>/^es/i.test(v.lang));if(v)u.voice=v;ss.speak(u);}catch(e){}}
function ensureNoise(){if(!NOISE&&AC){NOISE=AC.createBuffer(1,AC.sampleRate*3,AC.sampleRate);const d=NOISE.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+0.04*(Math.random()*2-1))/1.04;d[i]=l*3.2;}}}
function startAmbient(){if(AMB||!AC)return;try{ensureNoise();const mk=(type,fq,q)=>{const s0=AC.createBufferSource();s0.buffer=NOISE;s0.loop=true;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=fq;fl.Q.value=q;const g=AC.createGain();g.gain.value=0;s0.connect(fl);fl.connect(g);g.connect(AC.destination);s0.start();return g;};
  AMB={mur:mk('bandpass',520,0.7),rain:mk('highpass',2400,0.3),wind:mk('lowpass',160,0.5)};}catch(e){}}
function playJet(vol){if(!G||!G.sound||!AC)return;try{if(!NOISE&&false){NOISE=AC.createBuffer(1,AC.sampleRate*3,AC.sampleRate);const d=NOISE.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+0.04*(Math.random()*2-1))/1.04;d[i]=l*3.2;}}
  ensureNoise();const src=AC.createBufferSource();src.buffer=NOISE;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(380,AC.currentTime);lp.frequency.linearRampToValueAtTime(900,AC.currentTime+1.4);
  const g=AC.createGain();const t=AC.currentTime;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.18*vol,t+0.6);g.gain.exponentialRampToValueAtTime(0.0001,t+2.9);src.connect(lp);lp.connect(g);g.connect(AC.destination);src.start();src.stop(t+3);}catch(e){}}
function radio(){beep(1450,0.05);setTimeout(()=>beep(950,0.07),70);}
function chime(){beep(660,0.25,'sine',0.05);setTimeout(()=>beep(520,0.35,'sine',0.05),220);}
function moveTo(o,t,dt,s){const dx=t[0]-o.x,dy=t[1]-o.y,d=Math.hypot(dx,dy),step=(s||o.spd)*dt;if(d<=step||d<0.01){o.x=t[0];o.y=t[1];return true;}o.x+=dx/d*step;o.y+=dy/d*step;return false;}
function smooth(p0,pts,r){const out=[];let prev=p0;for(let i=0;i<pts.length;i++){const c=pts[i],n=pts[i+1];if(!n){out.push(c);break;}
  const a=Math.atan2(c[1]-prev[1],c[0]-prev[0]),b=Math.atan2(n[1]-c[1],n[0]-c[0]),d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;if(Math.abs(d)<0.15){out.push(c);prev=c;continue;}
  const rr=Math.min(r,Math.hypot(c[0]-prev[0],c[1]-prev[1])*0.48,Math.hypot(n[0]-c[0],n[1]-c[1])*0.48);const s0=[c[0]-Math.cos(a)*rr,c[1]-Math.sin(a)*rr],e0=[c[0]+Math.cos(b)*rr,c[1]+Math.sin(b)*rr];
  for(let k=0;k<=8;k++){const u=k/8;out.push([(1-u)*(1-u)*s0[0]+2*(1-u)*u*c[0]+u*u*e0[0],(1-u)*(1-u)*s0[1]+2*(1-u)*u*c[1]+u*u*e0[1]]);}prev=c;}return out;}
function follow(o,dt){if(!o.path.length)return true;const t=o.path[0];const dx=t[0]-o.x,dy=t[1]-o.y;if(Math.hypot(dx,dy)>0.5)o.th=o.reverse?Math.atan2(-dy,-dx):Math.atan2(dy,dx);if(moveTo(o,t,dt,o.spd))o.path.shift();return !o.path.length;}
function lerpAng(a,b,k){let d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+d*k;}
let ctx=null;
function emblem(a,x,y,r){
  ctx.save();ctx.translate(x,y);ctx.fillStyle=a.c1;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
  ctx.strokeStyle=a.c2;ctx.fillStyle=a.c2;ctx.lineWidth=Math.max(1,r*0.22);ctx.lineCap='round';ctx.beginPath();
  if(a.em==='bird'){ctx.moveTo(-r*.6,-r*.05);ctx.quadraticCurveTo(-r*.3,-r*.45,0,r*.1);ctx.quadraticCurveTo(r*.3,-r*.45,r*.6,-r*.05);ctx.stroke();}
  else if(a.em==='wave'){ctx.moveTo(-r*.65,r*.1);ctx.bezierCurveTo(-r*.3,-r*.4,0,r*.5,r*.65,-r*.15);ctx.stroke();}
  else if(a.em==='peak'){ctx.moveTo(-r*.6,r*.4);ctx.lineTo(-r*.15,-r*.4);ctx.lineTo(r*.1,r*.05);ctx.lineTo(r*.3,-r*.15);ctx.lineTo(r*.6,r*.4);ctx.closePath();ctx.fill();}
  else if(a.em==='river'){ctx.moveTo(-r*.2,-r*.65);ctx.bezierCurveTo(r*.6,-r*.3,-r*.6,r*.3,r*.2,r*.65);ctx.stroke();}
  else if(a.em==='flower'){for(let i=0;i<5;i++){const an=i*TAU/5;ctx.moveTo(Math.cos(an)*r*.35+r*.24,Math.sin(an)*r*.35);ctx.arc(Math.cos(an)*r*.35,Math.sin(an)*r*.35,r*.24,0,TAU);}ctx.fill();}
  ctx.restore();
}
/* ===== MOTOR 3D ===== */
const TH=THREE;
const renderer=new TH.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(1.75,window.devicePixelRatio||1));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=TH.PCFSoftShadowMap;
renderer.outputEncoding=TH.sRGBEncoding;renderer.toneMapping=TH.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.physicallyCorrectLights=false;
const scene=new TH.Scene();
const SKY_DAY=new TH.Color('#9cc8ec'),SKY_DUSK=new TH.Color('#f0a868'),SKY_NIGHT=new TH.Color('#0b1430'),SKY_RAIN=new TH.Color('#7d8a99');
scene.background=SKY_DAY.clone();renderer.setClearColor(0x9cc8ec);scene.fog=new TH.Fog(scene.background.clone(),2200,7200);
const skyU={top:{value:new TH.Color('#3f7fd0')},bot:{value:new TH.Color('#cfe6f7')},sunDir:{value:new TH.Vector3(0.4,0.6,0.7).normalize()},sunCol:{value:new TH.Color('#fff2d0')},sunAmt:{value:1}};
const skyDome=new TH.Mesh(new TH.SphereGeometry(8500,32,16),new TH.ShaderMaterial({uniforms:skyU,side:TH.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top;uniform vec3 bot;uniform vec3 sunDir;uniform vec3 sunCol;uniform float sunAmt;varying vec3 vP;void main(){float h=clamp(vP.y*1.6+0.05,0.0,1.0);vec3 c=mix(bot,top,pow(h,0.7));float d=max(dot(vP,sunDir),0.0);c+=sunCol*(pow(d,900.0)*2.0+pow(d,12.0)*0.25)*sunAmt;gl_FragColor=vec4(c,1.0);}'}));
skyDome.renderOrder=-10;
const CLOUDS=[];
const camera=new TH.PerspectiveCamera(40,1.6,2,9000);
camera.position.set(400,320,980);
const controls=new TH.OrbitControls(camera,cv);
controls.target.set(400,0,650);controls.enableDamping=true;controls.dampingFactor=0.09;controls.maxPolarAngle=1.36;controls.minDistance=45;controls.maxDistance=3800;controls.screenSpacePanning=false;
controls.mouseButtons={LEFT:TH.MOUSE.PAN,MIDDLE:TH.MOUSE.DOLLY,RIGHT:TH.MOUSE.ROTATE};
controls.touches={ONE:TH.TOUCH.PAN,TWO:TH.TOUCH.DOLLY_ROTATE};
controls.panSpeed=1.1;controls.rotateSpeed=0.6;
scene.add(skyDome);
{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');for(let i=0;i<14;i++){const px=60+Math.random()*136,py=90+Math.random()*76,r=30+Math.random()*50;const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,256,256);}
 const t=new TH.CanvasTexture(c);for(let i=0;i<34;i++){const m=new TH.SpriteMaterial({map:t,transparent:true,depthWrite:false,opacity:.85,fog:false});const sp=new TH.Sprite(m);const s2=R(500,1100);sp.scale.set(s2,s2*0.55,1);sp.position.set(R(-2500,3800),R(520,820),R(-2400,3200));scene.add(sp);CLOUDS.push(sp);}}
const hemi=new TH.HemisphereLight(0xeaf3ff,0x4f6a3a,0.7);scene.add(hemi);
const sun=new TH.DirectionalLight(0xfff1dc,1.05);sun.position.set(640+520,950,440+760);sun.target.position.set(640,0,440);scene.add(sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);{const c=sun.shadow.camera;c.left=-820;c.right=820;c.top=820;c.bottom=-820;c.near=50;c.far=3200;}
sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.8;
const COLC={};function col(h){return COLC[h]||(COLC[h]=new TH.Color(h).convertSRGBToLinear());}
const MATC={};function mat(h,o){const k=h+(o?JSON.stringify(o):'');if(!MATC[k])MATC[k]=new TH.MeshStandardMaterial(Object.assign({color:col(h),roughness:.7,metalness:.05},o||{}));return MATC[k];}
const GLASS=new TH.MeshStandardMaterial({color:col('#a9d8f0'),transparent:true,opacity:.28,roughness:.05,metalness:.3,depthWrite:false});
const BOXG=new TH.BoxGeometry(1,1,1),CYLG=new TH.CylinderGeometry(1,1,1,18),SPHG=new TH.SphereGeometry(1,16,12);
function box(w,h,d,c,x,y,z,par,o){const m=new TH.Mesh(BOXG,typeof c==='string'?mat(c,o):c);m.scale.set(w,h,d);m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;(par||scene).add(m);return m;}
function cyl(r,h,c,x,y,z,par,o){const m=new TH.Mesh(CYLG,typeof c==='string'?mat(c,o):c);m.scale.set(r,h,r);m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;(par||scene).add(m);return m;}

/* ---- texturas de letreros ---- */
function textTex(text,bg,fg,h){const c=document.createElement('canvas');const x=c.getContext('2d');x.font=`700 ${h*0.62}px "Barlow Condensed", "Arial Narrow", sans-serif`;const w=Math.ceil(x.measureText(text).width+h*0.6);c.width=w;c.height=h;
  x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;x.font=`700 ${h*0.62}px "Barlow Condensed", "Arial Narrow", sans-serif`;x.textBaseline='middle';x.fillText(text,h*0.3,h*0.54);const t=new TH.CanvasTexture(c);t.encoding=TH.sRGBEncoding;t.anisotropy=8;return{t,ar:w/h};}
function liveryTex(a,reg){const c=document.createElement('canvas');c.width=512;c.height=2048;const x=c.getContext('2d');
  // u: 0 y 0.5 = costados, 0.25 = panza, 0.75 = techo; v (canvas y): 0 = nariz, 2048 = cola
  const U=(side,deg)=>side?(0.5+deg/360)*512:(((-deg/360)%1)+1)%1*512;
  const band=(d0,d1,col,y0,y1)=>{x.fillStyle=col;[0,1].forEach(sd=>{let a=U(sd,d0),b=U(sd,d1);if(sd===0){const t=a;a=b;b=t;}if(b<a){x.fillRect(a,y0,512-a,y1-y0);x.fillRect(0,y0,b,y1-y0);}else x.fillRect(a,y0,b-a,y1-y0);});};
  x.fillStyle='#f7f8f9';x.fillRect(0,0,512,2048);
  const st=a.style;
  if(st==='full'){x.fillStyle=a.c1;x.fillRect(0,0,512,2048);band(-90,-40,a.c2==='#ffffff'?'#e9eef2':shade(a.c1,40),0,2048);}
  if(st==='belly'){band(-90,-6,a.c1,140,2048);band(-6,0,a.c3,140,2048);}
  if(st==='cheat'){band(-8,4,a.c1,120,2048);band(-12,-8,a.c3,120,2048);}
  if(st==='nose'){x.fillStyle=a.c1;x.fillRect(0,0,512,300);band(-90,90,a.c1,1550,2048);band(-30,-14,a.c3,300,1550);}
  if(st==='swoosh'){[0,1].forEach(sd=>{x.fillStyle=a.c1;x.beginPath();for(let y=0;y<=2048;y+=32){const k=y/2048,deg=-70+k*k*150;const u=U(sd,deg);y===0?x.moveTo(u,y):x.lineTo(u,y);}for(let y=2048;y>=0;y-=32){const k=y/2048,deg=-90;x.lineTo(U(sd,deg),y);}x.fill();});
    band(-90,-70,a.c3,0,2048);}
  if(st==='tail'){x.fillStyle=a.c1;x.fillRect(0,1700,512,348);band(-90,-60,'#dfe3e7',0,2048);}
  if(st!=='full'&&st!=='swoosh')band(-90,-55,'#dfe3e6',0,2048);
  // ventanillas, puertas y cabina
  const wc=st==='full'?'#0f1e2c':'#1e2a36';
  [0,1].forEach(sd=>{const u=U(sd,14);x.fillStyle=wc;for(let y=260;y<1720;y+=26){if(Math.abs(y-560)<30||Math.abs(y-1500)<30)continue;x.fillRect(u-7,y,14,12);}
    x.strokeStyle=st==='full'?shade(a.c1,-50):'#9aa3aa';x.lineWidth=3;[[540,92],[1480,92],[230,92]].forEach(([y,h])=>x.strokeRect(u-14,y,28,h));
    x.fillStyle='#101a24';x.fillRect(U(sd,30)-16,60,32,40);});
  // líneas de paneles, puertas de carga y salidas sobre el ala
  x.strokeStyle='rgba(0,0,0,.09)';x.lineWidth=1.2;for(let y=120;y<1960;y+=86){x.beginPath();x.moveTo(0,y);x.lineTo(512,y);x.stroke();}
  x.strokeStyle='rgba(0,0,0,.06)';[0,1].forEach(sd=>[-62,-28,42,70].forEach(dg=>{const u=U(sd,dg);x.beginPath();x.moveTo(u,90);x.lineTo(u,1980);x.stroke();}));
  x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=2;[0,1].forEach(sd=>{x.strokeRect(U(sd,-36)-18,640,36,110);x.strokeRect(U(sd,-36)-18,1310,36,96);x.strokeRect(U(sd,14)-11,1010,22,50);x.strokeRect(U(sd,14)-11,1090,22,50);});
  x.fillStyle='rgba(255,255,255,.18)';for(let y=200;y<1900;y+=43){x.fillRect(U(0,64),y,2,2);x.fillRect(U(1,64),y,2,2);}
  // nombre de la aerolínea y matrícula
  const tcol=st==='full'?a.c2:st==='tail'?a.c1:a.c3==='#1b1b1b'?a.c1:a.c3;
  [0,1].forEach(sd=>{const u=U(sd,32);x.save();x.translate(u,980);x.rotate(sd?Math.PI/2:-Math.PI/2);x.font='700 74px "Barlow Condensed", sans-serif';x.fillStyle=tcol;x.textAlign='center';x.textBaseline='middle';x.fillText(a.name.toUpperCase(),0,0);x.restore();
    if(reg){const u2=U(sd,8);x.save();x.translate(u2,1800);x.rotate(sd?Math.PI/2:-Math.PI/2);x.font='600 34px "Barlow Condensed", sans-serif';x.fillStyle='#2a2f35';x.textAlign='center';x.fillText(reg,0,0);x.restore();}});
  const t=new TH.CanvasTexture(c);t.encoding=TH.sRGBEncoding;t.anisotropy=8;return t;}
function finTex(a){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const bg=a.style==='full'?a.c1:a.style==='belly'?a.c1:a.style==='cheat'?a.c1:a.style==='nose'?a.c1:a.c1;x.fillStyle=bg;x.fillRect(0,0,256,256);
  if(a.style==='swoosh'||a.style==='full'){x.fillStyle=a.c3;x.beginPath();x.moveTo(0,256);x.lineTo(256,90);x.lineTo(256,140);x.lineTo(60,256);x.fill();}
  const sv=ctx;ctx=x;const ac=Object.assign({},a,{c1:a.style==='full'?a.c2:'#ffffff',c2:a.style==='full'?a.c1:a.c1});emblem(ac,150,150,62);ctx=sv;
  const t=new TH.CanvasTexture(c);t.encoding=TH.sRGBEncoding;return t;}
const LIV={};
const GLOWT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.25,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new TH.CanvasTexture(c);})();
const GLOWS=[];function glowMat(c){const m=new TH.SpriteMaterial({map:GLOWT,color:c,blending:TH.AdditiveBlending,transparent:true,depthWrite:false,fog:false,toneMapped:false});GLOWS.push(m);return m;}
const GL_RED=glowMat(0xff3030),GL_GRN=glowMat(0x30ff70),GL_WHT=glowMat(0xffffff);
function disposeGroup(g){g.traverse(o=>{if(o.userData.shared)return;if(o.geometry&&![BOXG,CYLG,SPHG].includes(o.geometry))o.geometry.dispose();if(o.material&&o.material.map&&o.material.userData.own){o.material.map.dispose();o.material.dispose();}});}
function instanceStatic(par,DYN){const groups=new Map();
  par.children.slice().forEach(o=>{if(!o.isMesh||o.isInstancedMesh||DYN.has(o))return;if(o.geometry!==BOXG&&o.geometry!==CYLG&&o.geometry!==SPHG)return;
    const k=o.geometry.uuid+'|'+o.material.uuid+'|'+o.castShadow;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
  groups.forEach(list=>{if(list.length<2)return;const im=new TH.InstancedMesh(list[0].geometry,list[0].material,list.length);
    list.forEach((o,i)=>{o.updateMatrix();im.setMatrixAt(i,o.matrix);par.remove(o);});im.castShadow=list[0].castShadow;im.receiveShadow=true;par.add(im);});}

/* ---- personas instanciadas ---- */
const MAXP=1600;
function imesh(geo,n,o){const m=new TH.InstancedMesh(geo,new TH.MeshStandardMaterial(Object.assign({roughness:.75},o||{})),n);m.castShadow=true;m.instanceMatrix.setUsage(TH.DynamicDrawUsage);const w=col('#ffffff');for(let i=0;i<n;i++)m.setColorAt(i,w);m.count=0;m.frustumCulled=false;scene.add(m);return m;}
const PM={torso:imesh(new TH.CylinderGeometry(1,0.85,1,10),MAXP),limb:imesh(BOXG,MAXP*4),head:imesh(new TH.SphereGeometry(1,14,10),MAXP),hair:imesh(new TH.SphereGeometry(1,14,8,0,TAU,0,Math.PI*0.58),MAXP),bag:imesh(new TH.BoxGeometry(1,1,1),MAXP*2),small:imesh(BOXG,MAXP*6,{roughness:.6}),bit:imesh(BOXG,3000,{roughness:.6})};
{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
 const geo=new TH.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);const m=new TH.InstancedMesh(geo,new TH.MeshBasicMaterial({map:new TH.CanvasTexture(c),transparent:true,depthWrite:false}),MAXP*2);m.instanceMatrix.setUsage(TH.DynamicDrawUsage);m.count=0;m.frustumCulled=false;m.renderOrder=1;scene.add(m);PM.blob=m;}
{const m=new TH.InstancedMesh(BOXG,new TH.MeshBasicMaterial({toneMapped:false}),1800);m.instanceMatrix.setUsage(TH.DynamicDrawUsage);const w=col('#ffffff');for(let i=0;i<1800;i++)m.setColorAt(i,w);m.count=0;m.frustumCulled=false;scene.add(m);PM.lit=m;}
{const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,128,0);g.addColorStop(0,'rgba(255,240,200,.55)');g.addColorStop(1,'rgba(255,240,200,0)');x.fillStyle=g;x.fillRect(0,0,128,64);
 x.globalCompositeOperation='destination-in';const v=x.createLinearGradient(0,0,0,64);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(0.5,'rgba(0,0,0,1)');v.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=v;x.fillRect(0,0,128,64);
 const geo=new TH.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);const m=new TH.InstancedMesh(geo,new TH.MeshBasicMaterial({map:new TH.CanvasTexture(c),transparent:true,depthWrite:false,blending:TH.AdditiveBlending,toneMapped:false}),500);m.instanceMatrix.setUsage(TH.DynamicDrawUsage);m.count=0;m.frustumCulled=false;m.renderOrder=3;scene.add(m);PM.beam=m;}
const PC={};function resetPM(){for(const k in PM)PC[k]=0;}
const _m=new TH.Matrix4(),_b=new TH.Matrix4(),_t=new TH.Matrix4(),_r=new TH.Matrix4(),_s=new TH.Matrix4();
function put(k,M,c){const i=PC[k];if(i>=PM[k].instanceMatrix.count)return;PC[k]=i+1;PM[k].setMatrixAt(i,M);if(c)PM[k].setColorAt(i,col(c));}
function part(ox,oy,oz,rz,sx,sy,sz,piv,rx){_m.copy(_b);_t.makeTranslation(ox,oy,oz);_m.multiply(_t);if(rx){_r.makeRotationX(rx);_m.multiply(_r);}if(rz){_r.makeRotationZ(rz);_m.multiply(_r);}if(piv){_t.makeTranslation(0,-sy/2,0);_m.multiply(_t);}_s.makeScale(sx,sy,sz);_m.multiply(_s);return _m;}
function person3(x,y,h,lk,walk,carry,moving,sit,pose,elev){
  {const kk=(lk.kid?0.68:1)*1.2;_m.makeTranslation(x,(elev||0)+0.07,y);_s.makeScale(4.6*kk,1,4.6*kk);_m.multiply(_s);put('blob',_m);}
  const k=(lk.kid?0.68:1)*1.2;_b.makeRotationY(-h);_b.setPosition(x,elev||0,y);if(k!==1){_s.makeScale(k,k,k);_b.multiply(_s);}
  const sw=moving?Math.sin(walk)*0.62:0,LEG=2.9,hip=sit?2.6:LEG,pants=lk.pants||'#2d3440',shirt=lk.shirt;
  if(sit){put('limb',part(0.2,hip,-0.62,Math.PI/2,0.95,LEG,1,true),pants);put('limb',part(0.2,hip,0.62,Math.PI/2,0.95,LEG,1,true),pants);}
  else{put('limb',part(0,hip,-0.62,sw,0.95,LEG,1,true),pants);put('limb',part(0,hip,0.62,-sw,0.95,LEG,1,true),pants);}
  put('torso',part(0,hip+1.55,0,0,1.05,3.1,1.65,false),shirt);
  let al=-sw,ar=sw,alx=0,arx=0;
  if(pose==='armsUp'){al=ar=Math.PI*0.5;}else if(pose==='phone'){ar=2.3;}else if(pose==='pass'){ar=0.9;}else if(pose==='hand'){ar=1.45;al=0.1;}else if(pose==='reach'){al=ar=1.25;}
  else if(pose==='wave'){al=Math.PI-0.5+Math.sin(G.t*6)*0.5;ar=Math.PI+0.5-Math.sin(G.t*6)*0.5;}else if(pose==='push'){al=ar=1.15;}else if(pose==='sign'){al=ar=2.55;}else if(pose==='flowers'){ar=1.3;al=0.3;}
  else if(pose==='read'){al=ar=1.05;}else if(pose==='drink'){ar=2.2;al=0.6;}else if(sit){al=ar=0.7;}
  if(carry==='suitcase'&&!pose&&!sit){ar=-0.45;}
  if(pose==='armsUp'){alx=-1.35;arx=1.35;al=ar=0;}
  put('limb',part(0,hip+2.85,-1.95,al,0.75,2.6,0.75,true,alx),shirt);put('limb',part(0,hip+2.85,1.95,ar,0.75,2.6,0.75,true,arx),shirt);
  // manos, zapatos y cinturón
  if(pose!=='armsUp'){put('small',part(Math.sin(al)*2.75,hip+2.85-Math.cos(al)*2.75,-1.95,0,0.7,0.7,0.7,false),lk.skin);put('small',part(Math.sin(ar)*2.75,hip+2.85-Math.cos(ar)*2.75,1.95,0,0.7,0.7,0.7,false),lk.skin);}
  if(sit){put('small',part(0.2+LEG+0.4,hip-0.3,-0.62,0,1.5,0.7,1,false),lk.shoe||'#1b1b1b');put('small',part(0.2+LEG+0.4,hip-0.3,0.62,0,1.5,0.7,1,false),lk.shoe||'#1b1b1b');}
  else{put('small',part(Math.sin(sw)*LEG+0.35,hip-Math.cos(sw)*LEG+0.3,-0.62,0,1.6,0.6,1,false),lk.shoe||'#1b1b1b');put('small',part(-Math.sin(sw)*LEG+0.35,hip-Math.cos(sw)*LEG+0.3,0.62,0,1.6,0.6,1,false),lk.shoe||'#1b1b1b');}
  put('small',part(0,hip+0.15,0,0,1.12,0.35,1.72,false),'#2b2b2b');
  if(pose==='pass'||pose==='hand'||pose==='phone'){const hx=Math.sin(ar)*2.6,hy2=hip+2.85-Math.cos(ar)*2.6;put('bag',part(hx+0.2,hy2,1.95,0,pose==='phone'?0.3:0.9,pose==='phone'?1.2:0.7,pose==='phone'?0.7:0.5,false),pose==='phone'?'#1b1b1b':pose==='hand'?'#7a1f2b':'#ffffff');}
  if(pose==='sign')put('bag',part(1.4,hip+6.6,0,0,0.25,2.4,4.6,false),'#ffffff');
  if(pose==='flowers'){put('bag',part(2.6,hip+2.2,1.95,0,0.5,1.8,0.5,false),'#2e8b57');put('bag',part(2.7,hip+3.4,1.95,0,1.4,1.2,1.4,false),pick(['#e74c3c','#f5b7b1','#f2c14e']));}
  if(pose==='read')put('bag',part(2.3,hip+2.1,0,0,0.2,2.2,3.4,false),'#f1efe8');
  if(pose==='drink')put('small',part(Math.sin(ar)*2.75,hip+2.85-Math.cos(ar)*2.75+0.8,1.95,0,0.6,1,0.6,false),'#c9a05a');
  const hy=hip+4.15;put('head',part(0.05,hy,0,0,1.05,1.15,1.05,false),lk.skin);put('small',part(0,hip+3.25,0,0,0.6,0.5,0.6,false),lk.skin);
  if(lk.glasses&&!lk.cap)put('small',part(1.02,hy+0.1,0,0,0.12,0.32,1.25,false),'#141414');
  if(lk.cap)put('hair',part(0,hy+0.05,0,0,1.12,1.0,1.12,false),lk.cap);
  else if(lk.hs!=='bald'){const lg=lk.hs==='long';put('hair',part(-0.12,hy+(lg?-0.25:0.02),0,0,lg?1.18:1.1,lg?1.35:1.0,lg?1.18:1.1,false),lk.hair);if(lk.hs==='bun')put('bag',part(-1.05,hy+0.35,0,0,0.7,0.7,0.7,false),lk.hair);}
  if(carry==='suitcase'){put('bag',part(-2.4,0.15+1.25,1.75,-0.35,1.25,2.5,1.9,false),lk.bagc);put('small',part(-1.3,2.9,1.85,-0.35,0.18,2.6,0.18,false),'#555');}
  else if(carry==='backpack')put('bag',part(-1.1,hip+1.7,0,0,0.9,1.9,1.9,false),lk.bagc);
  else if(carry==='shopbag')put('bag',part(0.2,hip-0.4,2.1,0,0.6,1.1,1.4,false),'#b98be0');
  if(lk.vest)put('bag',part(0,hip+1.6,0,0,1.15,2.2,1.75,false),'#f6ff3d');
}
function bit(x,y,z,w,h,d,c,ry){_b.makeRotationY(ry||0);_b.setPosition(x,y,z);_s.makeScale(w,h,d);_b.multiply(_s);put('bit',_b,c);}

/* ---- aviones 3D ---- */
const P3=new Map();
function shapeGeo(pts,depth){const s=new TH.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();return new TH.ExtrudeGeometry(s,{depth,bevelEnabled:false});}
/* une las piezas del avión por material para bajar las llamadas de dibujo */
function mergeByMat(root,par,skip){root.updateMatrixWorld(true);const inv=new TH.Matrix4().copy(root.matrixWorld).invert();const groups=new Map();
  par.traverse(o=>{if(!o.isMesh||o.children.length||!o.geometry||!o.geometry.attributes.uv)return;let q=o.parent;while(q&&q!==par){if(skip.has(q))return;q=q.parent;}if(skip.has(o))return;
    const k=o.material.uuid;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
  groups.forEach(list=>{if(list.length<2)return;const pos=[],nor=[],uv=[];const m=new TH.Matrix4(),nm=new TH.Matrix3();
    for(const o of list){let g2=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();m.multiplyMatrices(inv,o.matrixWorld);g2.applyMatrix4(m);
      pos.push(...g2.attributes.position.array);nor.push(...g2.attributes.normal.array);uv.push(...g2.attributes.uv.array);g2.dispose();o.parent.remove(o);}
    const bg=new TH.BufferGeometry();bg.setAttribute('position',new TH.Float32BufferAttribute(pos,3));bg.setAttribute('normal',new TH.Float32BufferAttribute(nor,3));bg.setAttribute('uv',new TH.Float32BufferAttribute(uv,2));
    const mm=new TH.Mesh(bg,list[0].material);mm.castShadow=true;mm.receiveShadow=true;root.add(mm);});}
function makePlane(p){
  const T=p.T,L=T.len*PSCALE,S=T.span*PSCALE,R=Math.max(1.8,L*0.058),g=new TH.Group();g.rotation.order='YZX';
  const bodyM=GFX.q>=2?new TH.MeshPhysicalMaterial({map:liveryTex(p.a,p.reg),roughness:.3,metalness:.24,clearcoat:.75,clearcoatRoughness:.08,envMapIntensity:1.1}):new TH.MeshStandardMaterial({map:liveryTex(p.a,p.reg),roughness:.26,metalness:.26,envMapIntensity:1.15});
  if(!LIV['fin'+p.a.code])LIV['fin'+p.a.code]=finTex(p.a);
  const wingM=mat('#cfd5da',{metalness:.38,roughness:.4}),wingD=mat('#aeb6bd',{metalness:.4,roughness:.45}),c1=mat(p.a.c1,{roughness:.42}),dark=mat('#1d2329',{metalness:.4,roughness:.5}),metal=mat('#c9ced3',{metalness:.85,roughness:.22}),tire=mat('#161616',{roughness:.9}),glassM=mat('#0d1822',{roughness:.08,metalness:.6});
  const add=(geo,m,x,y,z,par)=>{const o=new TH.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;(par||g).add(o);return o;};
  // fuselaje
  const fus=add(new TH.CylinderGeometry(R,R,L*0.76,28,1,true),bodyM,-L*0.03,0,0);fus.rotation.z=-Math.PI/2;
  const nose=add(new TH.SphereGeometry(R,28,16,0,TAU,0,Math.PI/2),bodyM,L*0.35,0,0);nose.rotation.z=-Math.PI/2;nose.scale.set(1,L*0.12/R,1);
  const tail=add(new TH.CylinderGeometry(R,R*0.22,L*0.17,28,1,true),c1,-L*0.495,R*0.2,0);tail.rotation.z=-Math.PI/2;
  const apu=add(new TH.CylinderGeometry(R*0.2,R*0.16,L*0.02,12),dark,-L*0.588,R*0.36,0);apu.rotation.z=Math.PI/2;
  // parabrisas de cabina
  [-1,1].forEach(sg=>{const w=add(new TH.BoxGeometry(L*0.03,R*0.32,R*0.62),glassM,L*0.41,R*0.46,sg*R*0.38);w.rotation.y=sg*0.55;w.rotation.z=-0.45;});
  add(new TH.BoxGeometry(L*0.022,R*0.3,R*0.5),glassM,L*0.425,R*0.42,0).rotation.z=-0.55;
  // carenado ventral
  const wx=T.prop?L*0.06:-L*0.02,sw=T.prop?0:L*0.16;
  const belly=add(new TH.SphereGeometry(1,20,12),wingM,wx-L*0.03,-R*0.62,0);belly.scale.set(L*0.17,R*0.5,R*0.86);
  // alas con diedro, borde de ataque y flaps
  const wy=T.prop?R*0.85:-R*0.45;
  const wpts=[[wx+L*0.11,0],[wx-sw+L*0.025,S/2],[wx-sw-L*0.045,S/2],[wx-L*0.13,0]];
  [-1,1].forEach(sg=>{const wg=new TH.Group();wg.position.set(0,wy,0);wg.rotation.x=T.prop?0:-sg*0.055;g.add(wg);
    const geo=shapeGeo(wpts.map(([a,b])=>[a,b*sg]),0.9);geo.rotateX(Math.PI/2);add(geo,wingM,0,0.45,0,wg);
    const fl=shapeGeo([[wx-L*0.11,sg*R*1.1],[wx-sw-L*0.03,sg*S*0.47],[wx-sw-L*0.05,sg*S*0.47],[wx-L*0.135,sg*R*1.1]],0.5);fl.rotateX(Math.PI/2);add(fl,wingD,0,0.25,0,wg);
    if(!T.prop){for(let k=1;k<=3;k++){const zz=sg*S*0.5*(0.22+k*0.18),xx=wx-L*0.11-sw*(k*0.18+0.1);const ft=add(new TH.CylinderGeometry(0.42,0.18,L*0.075,8),wingD,xx-L*0.02,-0.25,zz,wg);ft.rotation.z=Math.PI/2;}
      // winglets / sharklets
      if(!T.heavy){const wl=add(shapeGeo([[0,0],[-L*0.05,0],[-L*0.075,R*1.5],[-L*0.045,R*1.5]],0.35),c1,wx-sw-L*0.0,0.45,sg*(S/2)-0.17,wg);wl.rotation.x=sg*0.25;}
      else{const tip=add(new TH.BoxGeometry(L*0.05,0.4,S*0.03),wingM,wx-sw-L*0.05,0.45,sg*(S/2+S*0.012),wg);tip.rotation.y=sg*0.4;}}
    // luces de navegación y estrobos en la punta
    const tipX=wx-sw-L*0.02;const nl=new TH.Mesh(new TH.SphereGeometry(0.45,8,6),new TH.MeshBasicMaterial({color:sg<0?0xff3030:0x30ff60}));nl.position.set(tipX,0.6,sg*S/2);wg.add(nl);
    const q=new TH.Sprite(sg<0?GL_RED:GL_GRN);q.scale.set(6,6,1);nl.add(q);
    const st=new TH.Sprite(GL_WHT);st.scale.set(16,16,1);st.position.set(tipX-L*0.03,0.6,sg*S/2);st.visible=false;wg.add(st);(g.userData.strobes=g.userData.strobes||[]).push(st);});
  // estabilizadores
  const tx=-L*0.4,spts=[[tx+L*0.06,0],[tx-L*0.04,S*0.19],[tx-L*0.09,S*0.19],[tx-L*0.07,0]];
  [-1,1].forEach(sg=>{const geo=shapeGeo(spts.map(([a,b])=>[a,b*sg]),0.55);geo.rotateX(Math.PI/2);const h=add(geo,wingM,0,R*0.38,0);h.rotation.x=-sg*0.06;});
  const fH=L*0.17,fin=shapeGeo([[-L*0.3,0],[-L*0.47,fH],[-L*0.54,fH],[-L*0.53,0]],0.7);
  {const ft=LIV['fin'+p.a.code].clone();ft.needsUpdate=true;ft.wrapS=ft.wrapT=TH.ClampToEdgeWrapping;ft.repeat.set(1/(0.24*L),1/fH);ft.offset.set(0.54/0.24,0);const fm=new TH.MeshStandardMaterial({map:ft,roughness:.38});add(fin,fm,0,R*0.6,-0.35);g.userData.finM=fm;}
  add(shapeGeo([[-L*0.22,0],[-L*0.32,R*0.75],[-L*0.32,0]],0.6),c1,0,R*0.62,-0.3);
  // antenas
  add(new TH.BoxGeometry(L*0.012,R*0.3,0.2),dark,L*0.12,R*1.05,0);add(new TH.BoxGeometry(L*0.012,R*0.25,0.2),dark,-L*0.12,R*1.02,0);
  // motores
  if(!g.userData.props)g.userData.props=[];
  if(T.prop){[-1,1].forEach(sg=>{const n=add(new TH.CylinderGeometry(R*0.42,R*0.36,L*0.22,14),mat('#e6e9ec',{metalness:.3}),wx+L*0.02,R*0.7,sg*S*0.22);n.rotation.z=-Math.PI/2;
      const sp=add(new TH.ConeGeometry(R*0.26,R*0.5,12),metal,wx+L*0.145,R*0.7,sg*S*0.22);sp.rotation.z=-Math.PI/2;
      const pr=new TH.Group();pr.position.set(wx+L*0.13,R*0.7,sg*S*0.22);g.add(pr);for(let i=0;i<6;i++){const bl=new TH.Mesh(BOXG,mat('#1e1e1e'));bl.scale.set(0.3,S*0.075,0.9);bl.position.y=S*0.0375;const h=new TH.Group();h.rotation.x=i*TAU/6;h.add(bl);pr.add(h);}g.userData.props.push(pr);
      const ex=add(new TH.CylinderGeometry(R*0.12,R*0.12,R*0.5,8),dark,wx-L*0.05,R*0.62,sg*S*0.22+sg*R*0.35);ex.rotation.z=Math.PI/2;});}
  else{const er=T.heavy?R*0.58:R*0.44,el=L*(T.heavy?0.17:0.15),nac=['full','swoosh','nose'].includes(p.a.style)?mat(p.a.c1,{metalness:.35,roughness:.32}):mat('#d6dadf',{metalness:.5,roughness:.3});
    [-1,1].forEach(sg=>{const ex0=wx-sw*0.33,ez=sg*S*0.27,ey=-R*0.95-(T.heavy?R*0.1:0);
      const e=add(new TH.CylinderGeometry(er,er*0.82,el,22),nac,ex0,ey,ez);e.rotation.z=-Math.PI/2;
      const lip=add(new TH.TorusGeometry(er*0.93,er*0.1,8,22),metal,ex0+el/2,ey,ez);lip.rotation.y=Math.PI/2;
      const fan=add(new TH.CircleGeometry(er*0.86,22),dark,ex0+el/2-0.25,ey,ez);fan.rotation.y=Math.PI/2;
      const sp=add(new TH.ConeGeometry(er*0.28,er*0.6,14),metal,ex0+el/2-0.1,ey,ez);sp.rotation.z=-Math.PI/2;
      const noz=add(new TH.CylinderGeometry(er*0.62,er*0.5,el*0.25,16),mat('#6d7378',{metalness:.7,roughness:.35}),ex0-el/2-el*0.1,ey,ez);noz.rotation.z=-Math.PI/2;
      const plug=add(new TH.ConeGeometry(er*0.32,el*0.3,12),dark,ex0-el/2-el*0.3,ey,ez);plug.rotation.z=Math.PI/2;
      const py=add(new TH.BoxGeometry(el*0.75,R*0.55,0.6),wingD,ex0-el*0.05,ey+er*0.95,ez);py.rotation.z=0.08;
      g.userData.fans=g.userData.fans||[];g.userData.fans.push(sp);});}
  // tren de aterrizaje con ruedas dobles
  const gear=new TH.Group();g.add(gear);const gh=R+2.6,wr=T.heavy?1.25:1.05;
  const leg=(x,z,n,bogie)=>{const st=new TH.Mesh(new TH.CylinderGeometry(0.3,0.3,gh-R*0.6,8),metal);st.position.set(x,-R*0.6-(gh-R*0.6)/2+0.2,z);gear.add(st);
    const wheels=[];for(let i=0;i<n;i++){for(const dz of [-0.65,0.65]){const w=new TH.Mesh(new TH.CylinderGeometry(wr,wr,0.7,14),tire);w.rotation.x=Math.PI/2;w.position.set(x+(n>1?(i-0.5)*wr*2.3:0),-gh+wr,z+dz*(bogie?1.4:1));w.castShadow=true;gear.add(w);
      const hub=new TH.Mesh(new TH.CylinderGeometry(wr*0.45,wr*0.45,0.74,10),metal);hub.rotation.x=Math.PI/2;hub.position.copy(w.position);gear.add(hub);}}};
  leg(L*0.33,0,1,false);[-1,1].forEach(sg=>leg(wx-L*0.05,sg*R*0.95,T.heavy?2:1,T.heavy));
  [-1,1].forEach(sg=>{const d=new TH.Mesh(BOXG,bodyM);d.scale.set(L*0.06,R*0.5,0.15);d.position.set(wx-L*0.05,-R*0.85,sg*R*0.62);d.rotation.x=sg*0.6;gear.add(d);});
  // luces
  const bea=new TH.Mesh(new TH.SphereGeometry(0.55,8,6),new TH.MeshBasicMaterial({color:0xff2a2a}));bea.position.set(0,R+0.3,0);g.add(bea);
  const bea2=new TH.Mesh(new TH.SphereGeometry(0.5,8,6),new TH.MeshBasicMaterial({color:0xff2a2a}));bea2.position.set(-L*0.05,-R-0.2,0);g.add(bea2);
  const ll=new TH.Mesh(new TH.SphereGeometry(0.6,8,6),new TH.MeshBasicMaterial({color:0xffffff}));ll.position.set(L*0.44,-R*0.6,0);g.add(ll);
  {const sp=(m,s0)=>{const q=new TH.Sprite(m);q.scale.set(s0,s0,1);return q;};bea.add(sp(GL_RED,9));bea2.add(sp(GL_RED,8));ll.add(sp(GL_WHT,22));}
  mergeByMat(g,g,new Set([gear,...g.userData.props]));mergeByMat(gear,gear,new Set());
  g.userData.tip=[wx-sw-L*0.02,wy+0.6,S/2];g.userData.R=R;g.userData.L=L;g.userData.S=S;g.userData.bea=bea;g.userData.bea2=bea2;g.userData.ll=ll;g.userData.gear=gear;g.userData.bodyM=bodyM;g.userData.eng=[[wx-sw*0.35-L*0.08,T.prop?R*0.7:-R*0.95,S*(T.prop?0.22:0.27)],[wx-sw*0.35-L*0.08,T.prop?R*0.7:-R*0.95,-S*(T.prop?0.22:0.27)]];
  scene.add(g);return g;
}
/* ---- humo, polvo y spray ---- */
const FXN=140,FXP=[];{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
  const t=new TH.CanvasTexture(c);for(let i=0;i<FXN;i++){const sp=new TH.Sprite(new TH.SpriteMaterial({map:t,transparent:true,depthWrite:false}));sp.visible=false;scene.add(sp);FXP.push(sp);}}
function syncFx(){let i=0;for(const f of G.fx){if(i>=FXN)break;const sp=FXP[i++];const u=f.t/f.life;sp.visible=true;sp.position.set(f.x,(f.h||1)+u*6,f.y);const sc=f.r*3.2;sp.scale.set(sc,sc,1);sp.material.opacity=0.7*(1-u);sp.material.color.set(f.c||'#eeeeee');}for(;i<FXN;i++)FXP[i].visible=false;}
const V3=new Map();
const GSET=new Map();
function makeVeh(type){let t=GSET.get(type);if(!t){t=gseModel(type);const keep=new Set();t.traverse(o=>{if(o.name)keep.add(o);});mergeByMat(t,t,keep);GSET.set(type,t);}const g=t.clone();scene.add(g);return g;}
function gseModel(type){const g=new TH.Group();
  const B=(w,h,d,c,x,y,z,o)=>box(w,h,d,c,x,y,z,g,o);
  const DK=mat('#1b2a36',{roughness:.12,metalness:.6}),TR=mat('#141414',{roughness:.9}),HB=mat('#9aa3aa',{metalness:.6,roughness:.35});
  const wheel=(x,z,r,w)=>{const m=new TH.Mesh(CYLG,TR);m.scale.set(r,w,r);m.rotation.x=Math.PI/2;m.position.set(x,r,z);m.castShadow=true;g.add(m);const h=new TH.Mesh(CYLG,HB);h.scale.set(r*0.5,w+0.12,r*0.5);h.rotation.x=Math.PI/2;h.position.set(x,r,z);g.add(h);};
  const axle=(x,half,r,w)=>{wheel(x,half,r,w||1);wheel(x,-half,r,w||1);};
  const lamp=(x,y,z)=>B(0.25,0.55,1,'#fff6d8',x,y,z,{emissive:col('#fff2c0'),emissiveIntensity:.8});
  const beacon=(x,y)=>B(0.9,0.6,0.9,'#ffb000',x,y,0,{emissive:col('#ff9000'),emissiveIntensity:.9});
  const cab=(x,len,wd,h,c,y0,back)=>{const f=back?-1:1;B(len,h,wd,c,x,y0,0,{metalness:.2,roughness:.45});B(0.3,h*0.42,wd*0.86,DK,x+f*len/2,y0+h*0.48,0);B(len*0.62,h*0.38,wd+0.1,DK,x-f*len*0.08,y0+h*0.5,0);
    B(len+0.3,0.5,wd+0.2,'#1d2126',x,y0-0.25,0);B(0.4,0.7,wd*0.9,'#1d2126',x+f*(len/2+0.15),y0+0.1,0);lamp(x+f*(len/2+0.2),y0+0.9,wd*0.36);lamp(x+f*(len/2+0.2),y0+0.9,-wd*0.36);beacon(x,y0+h);};
  const tankX=(r,len,c,x,y,o)=>{const t=new TH.Mesh(CYLG,mat(c,o||{metalness:.4,roughness:.3}));t.scale.set(r,len,r);t.rotation.z=Math.PI/2;t.position.set(x,y,0);t.castShadow=true;g.add(t);return t;};
  switch(type){
    case 'fuel':B(23,1,6,'#2b3036',0,1.6,0);cab(8.8,5,6.6,4.6,'#e8ebee',2.3);tankX(3.2,14,'#eef1f3',-2.6,6);[-8.4,-2.6,3.2].forEach(x=>tankX(3.3,0.6,'#ec8a2f',x,6,{}));
      B(13,0.3,1.8,'#9aa3aa',-2.6,9.25,0);for(let x=-8;x<=3;x+=2.75){B(0.2,1.2,0.2,'#c9ced3',x,9.5,0.9);}B(13,0.15,0.15,'#c9ced3',-2.6,10.6,0.9);
      B(0.3,6,1.2,'#9aa3aa',-10.1,3.2,2.6);B(3.2,2.8,5.6,'#3a3f45',-11.2,2.6,0);{const r=new TH.Mesh(CYLG,mat('#151515',{roughness:.8}));r.scale.set(1.4,4.8,1.4);r.rotation.x=Math.PI/2;r.position.set(-11.2,4.4,0);g.add(r);}
      B(23.2,0.45,6.3,'#ec8a2f',0,2.65,0);axle(7.4,3.1,1.5,1.2);axle(-5,3.1,1.5,1.2);axle(-8.3,3.1,1.5,1.2);break;
    case 'belt':{B(20,1.2,5.4,'#3a3f45',0,1.4,0);cab(-7.4,5,5,3.4,'#f2b705',2.6);
      const cv=new TH.Group();cv.position.set(1.5,4.2,0);cv.rotation.z=0.26;g.add(cv);
      box(23,0.8,3.2,'#1d2126',0,0,0,cv);box(23,1.3,0.3,'#f2b705',0,0.4,1.75,cv);box(23,1.3,0.3,'#f2b705',0,0.4,-1.75,cv);for(let k=-10;k<=10;k+=2.5)box(0.3,0.2,3,'#59636c',k,0.8,0,cv);
      B(1,3.4,1,'#59636c',-2.4,2.6,1.6);B(1,3.4,1,'#59636c',-2.4,2.6,-1.6);B(2.2,0.3,5.6,'#f2b705',9.6,1.4,0);axle(6,2.5,1.2,0.9);axle(-6,2.5,1.2,0.9);break;}
    case 'tug':B(8,2.4,5.4,'#f4f4f4',0,1.2,0);B(3,1.7,5.4,'#1f6fd1',2.3,3.6,0);B(4.4,0.3,5.6,'#1f6fd1',-1.6,7.6,0);[[-3.6,2.5],[-3.6,-2.5],[0.4,2.5],[0.4,-2.5]].forEach(([x,z])=>B(0.3,4,0.3,'#2b3036',x,3.6,z));B(2.2,1.4,3,'#2b3036',-2.2,3.6,0);
      lamp(4.1,2.4,1.8);lamp(4.1,2.4,-1.8);beacon(-1.6,7.9);axle(2.6,2.5,1.3);axle(-2.6,2.5,1.3);
      for(let c=1;c<=3;c++){const cx=-5.6-c*9.4;B(2.4,0.3,0.4,'#3a3f45',cx+5,1.2,0);B(7.6,0.5,6,'#7f8a93',cx,1.6,0);B(7.6,2.6,0.25,'#9aa3aa',cx,2.1,3);B(7.6,2.6,0.25,'#9aa3aa',cx,2.1,-3);B(0.25,4.6,6,'#9aa3aa',cx+3.7,2.1,0);
        [[3.7,3],[3.7,-3],[-3.7,3],[-3.7,-3]].forEach(([a,b])=>B(0.3,4.6,0.3,'#7f8a93',cx+a,2.1,b));B(7.9,0.3,6.3,'#c9ced3',cx,6.7,0);axle(cx+2.6,2.6,0.9,0.7);axle(cx-2.6,2.6,0.9,0.7);
        const ld=new TH.Group();ld.name='ld'+c;g.add(ld);for(let b=0;b<6;b++)box(2.2,1.9+(b%2)*0.5,2.5,['#c0392b','#2c3e50','#16a085','#8e44ad','#d35400','#1f1f1f','#2f6db5'][(c*3+b)%7],cx-2.4+(b%3)*2.4,2.2,b>=3?1.4:-1.4,ld);}break;
    case 'cater':{B(21,1.2,7,'#2b3036',0,1.4,0);cab(-7.6,5,7.2,4.8,'#e9edf0',2.4,true);
      const sc=new TH.Group();sc.name='sc';sc.position.set(2,2.6,0);g.add(sc);[0.55,-0.55].forEach(a=>[3.3,-3.3].forEach(z=>{const m=new TH.Mesh(BOXG,mat('#59636c'));m.scale.set(11,0.45,0.45);m.position.set(0,0.5,z);m.rotation.z=a;m.castShadow=true;sc.add(m);}));
      const body=new TH.Group();body.name='body';body.position.set(0,3.4,0);g.add(body);box(13,7.6,8.2,'#f4f6f8',1.4,0,0,body);box(13.2,1.1,8.4,'#d6343a',1.4,5.8,0,body);box(13.2,0.5,8.4,'#c9ced3',1.4,7.6,0,body);
      box(0.25,6.2,5.4,'#c9ced3',8,0.4,0,body);box(2.6,0.35,7.4,'#9aa3aa',9.2,0,0,body);box(0.2,2.2,7.4,'#e9edf0',10.4,0.35,0,body);box(2.6,2.2,0.2,'#e9edf0',9.2,0.35,3.6,body);box(2.6,2.2,0.2,'#e9edf0',9.2,0.35,-3.6,body);
      axle(6.5,3.2,1.4);axle(-6,3.2,1.4);break;}
    case 'water':B(15,1,5.6,'#2b3036',0,1.4,0);cab(5,4.4,5.8,4.2,'#e9edf0',2.2);tankX(2.5,8.5,'#3b82c4',-3,5);B(3.4,0.4,4.6,'#9aa3aa',-8.6,5.4,0);B(0.2,2,4.6,'#c9ced3',-10.2,5.8,0);B(1.6,3.6,1.6,'#59636c',-8.6,1.8,0);axle(4.5,2.8,1.3);axle(-5,2.8,1.3);break;
    case 'lav':B(15,1,5.6,'#2b3036',0,1.4,0);cab(5,4.4,5.8,4.2,'#e9edf0',2.2);tankX(2.5,8.5,'#6c7782',-3,5);tankX(2.56,0.5,'#2b3036',-3,5,{});B(3.4,0.4,4.6,'#9aa3aa',-8.6,5.4,0);B(1.6,3.6,1.6,'#59636c',-8.6,1.8,0);
      {const r=new TH.Mesh(CYLG,mat('#151515',{roughness:.8}));r.scale.set(1.1,3.6,1.1);r.rotation.x=Math.PI/2;r.position.set(-5.4,8.4,0);g.add(r);}axle(4.5,2.8,1.3);axle(-5,2.8,1.3);break;
    case 'gpu':B(7,3.8,4.6,'#e9edf0',0,1,0);B(7.2,0.6,4.8,'#1f6fd1',0,4.6,0);for(let k=-2.4;k<=2.4;k+=1.2)B(0.5,2.2,0.1,'#59636c',k,1.8,2.35);{const r=new TH.Mesh(CYLG,mat('#151515',{roughness:.8}));r.scale.set(1.2,1.2,1.2);r.position.set(-1.8,5.4,0);g.add(r);}
      B(3,0.3,0.4,'#3a3f45',4.8,1.2,0);axle(2.2,2.1,0.9,0.7);axle(-2.2,2.1,0.9,0.7);break;
    case 'stairs':{B(16,1,5.6,'#2b3036',0,1.4,0);cab(-5.4,4.2,5.8,3.8,'#e9edf0',2.2,true);
      const st=new TH.Group();st.name='st';st.position.set(0,2.4,0);g.add(st);
      for(let k=0;k<10;k++)box(1.3,0.12,4.2,'#c9ced3',-1.6+k*1.08,k*0.1,0,st);box(3,0.1,4.4,'#9aa3aa',10,0.98,0,st);
      [2.25,-2.25].forEach(z=>{const r=new TH.Mesh(BOXG,mat('#e9edf0'));r.scale.set(11.4,0.06,0.2);r.position.set(4.2,0.75,z);r.rotation.z=Math.atan2(1,10.8);st.add(r);const s2=new TH.Mesh(BOXG,mat('#d6d9dc'));s2.scale.set(11.4,0.4,0.15);s2.position.set(4.2,0.3,z);s2.rotation.z=Math.atan2(1,10.8);st.add(s2);});
      axle(4.6,2.8,1.2);axle(-4.6,2.8,1.2);break;}
    case 'clean':B(13,5,6,'#f4f6f8',0,1.2,0,{metalness:.2,roughness:.4});B(13.1,0.9,6.1,'#7b4fb0',0,3,0);B(3,2.4,5.6,DK,4.7,3.6,0);B(9,1.6,6.15,DK,-1.8,4.2,0);B(13.2,0.6,6.2,'#1d2126',0,0.9,0);B(9,0.3,4.6,'#2b3036',-1,6.2,0);
      lamp(6.55,2.4,2.2);lamp(6.55,2.4,-2.2);B(0.8,0.5,0.8,'#ffb000',2,6.2,0,{emissive:col('#ff9000'),emissiveIntensity:.9});axle(4,2.9,1.2,0.9);axle(-4,2.9,1.2,0.9);break;
    case 'maint':B(13,6,6.5,'#f4f6f8',0,0.6,0);B(13.2,1.2,6.7,'#ff7a1a',0,3,0);B(2.6,2.6,5.6,'#1b2a36',5,3.6,0);B(1.2,0.8,3,'#ffb000',-1,6.6,0);axle(4,3,1.1);axle(-4,3,1.1);break;
    case 'push':B(12,3,8,'#f2b705',0,0.6,0);B(4,2.5,4,'#1d2126',-2,3.6,0);axle(4,4,1.4);axle(-4,4,1.4);break;
    case 'car':case 'taxi':{const c=type==='taxi'?'#f2b705':pick(['#c0392b','#ecf0f1','#2c3e50','#7f8c8d','#16a085','#d35400','#1f1f1f']);B(18,3.2,8.4,c,0,1,0,{metalness:.4,roughness:.35});B(9,2.6,7.6,c,-1,4.2,0,{metalness:.4,roughness:.35});B(9.2,2,7.8,'#1b2733',-1,4.3,0,{roughness:.1,metalness:.6,transparent:true,opacity:.85});break;}
    case 'dog':B(5.5,2.6,2.6,'#8a5a2b',0,2,0);B(2.4,2.2,2.2,'#5e3c1b',3.6,3.4,0);[[-2,-.8],[-2,.8],[2,-.8],[2,.8]].forEach(([a,b])=>B(.6,2,.6,'#5e3c1b',a,0,b));B(2.4,.5,.5,'#8a5a2b',-3.6,4,0);break;
  }
  if(type!=='car'&&type!=='taxi')g.scale.setScalar(0.8);return g;}
/* ---- lluvia ---- */
const RAIN_N=3000,rainGeo=new TH.BufferGeometry(),rainPos=new Float32Array(RAIN_N*6);
for(let i=0;i<RAIN_N;i++){const x=R(-500,500),y=R(0,400),z=R(-500,500);rainPos.set([x,y,z,x-1,y-9,z],i*6);}
rainGeo.setAttribute('position',new TH.BufferAttribute(rainPos,3));
const rain=new TH.LineSegments(rainGeo,new TH.LineBasicMaterial({color:0xc8d8ec,transparent:true,opacity:.45}));rain.frustumCulled=false;scene.add(rain);
function signMesh(text,x,y,z,bg,fg,hgt,par,face){const {t,ar}=textTex(text,bg||'#ffc629',fg||'#141414',64);const m=new TH.Mesh(new TH.PlaneGeometry(hgt*ar,hgt),new TH.MeshBasicMaterial({map:t,side:TH.DoubleSide,toneMapped:false}));m.material.color=SIGNC;m.material.userData.own=true;m.position.set(x,y,z);if(face)m.rotation.y=face;(par||scene).add(m);return m;}
/* ---- ciudad alrededor (solo visual) ---- */
let CITY=null,CITYWATER=null;
function buildCity(){
  const r=rng(2026),RR=(a,b)=>a+r()*(b-a),PK=a=>a[Math.floor(r()*a.length)];
  const grp=new TH.Group();scene.add(grp);
  function M(){this.p=[];this.n=[];this.u=[];this.c=[];this.i=[];}
  M.prototype.quad=function(a,b,c2,d,n,uv,colr){const o=this.p.length/3;[a,b,c2,d].forEach(v=>this.p.push(v[0],v[1],v[2]));for(let k=0;k<4;k++){this.n.push(n[0],n[1],n[2]);this.c.push(colr.r,colr.g,colr.b);}uv.forEach(t=>this.u.push(t[0],t[1]));this.i.push(o,o+1,o+2,o,o+2,o+3);};
  M.prototype.tri=function(a,b,c2,n,colr){const o=this.p.length/3;[a,b,c2].forEach(v=>this.p.push(v[0],v[1],v[2]));for(let k=0;k<3;k++){this.n.push(n[0],n[1],n[2]);this.c.push(colr.r,colr.g,colr.b);this.u.push(0.02,0.02);}this.i.push(o,o+1,o+2);};
  M.prototype.box=function(x,y,z,w,h,d,colr,su,sv,top){const x0=x-w/2,x1=x+w/2,y0=y,y1=y+h,z0=z-d/2,z1=z+d/2,U=s=>s/su,Vh=h/sv,uvs=s=>[[0,0],[U(s),0],[U(s),Vh],[0,Vh]];
    this.quad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],uvs(d),colr);this.quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],uvs(d),colr);
    this.quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],uvs(w),colr);this.quad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],uvs(w),colr);
    const tc=top||colr;this.quad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0],[[0.02,0.02],[0.02,0.02],[0.02,0.02],[0.02,0.02]],tc);};
  M.prototype.roof=function(x,y,z,w,d,h,colr){const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,yt=y+h;const l=Math.hypot(d/2,h);const nz=h/l,ny=(d/2)/l;
    this.quad([x0,y,z1],[x1,y,z1],[x1,yt,z],[x0,yt,z],[0,ny,nz],[[0,0],[0,0],[0,0],[0,0]],colr);this.quad([x1,y,z0],[x0,y,z0],[x0,yt,z],[x1,yt,z],[0,ny,-nz],[[0,0],[0,0],[0,0],[0,0]],colr);
    this.tri([x1,y,z1],[x1,y,z0],[x1,yt,z],[1,0,0],colr);this.tri([x0,y,z0],[x0,y,z1],[x0,yt,z],[-1,0,0],colr);};
  M.prototype.flat=function(x0,z0,x1,z1,y,colr){this.quad([x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0],[0,1,0],[[0,0],[0,0],[0,0],[0,0]],colr);};
  M.prototype.mesh=function(material){const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new TH.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new TH.Float32BufferAttribute(this.u,2));g.setAttribute('color',new TH.Float32BufferAttribute(this.c,3));g.setIndex(new TH.Uint32BufferAttribute(this.i,1));const m=new TH.Mesh(g,material);grp.add(m);return m;};
  const C=h=>new TH.Color(h).convertSRGBToLinear();
  function wtex(kind){const a=document.createElement('canvas'),e=document.createElement('canvas');a.width=a.height=e.width=e.height=128;const x=a.getContext('2d'),y=e.getContext('2d');
    x.fillStyle=kind==='glass'?'#8fb3cf':'#efece6';x.fillRect(0,0,128,128);y.fillStyle='#000';y.fillRect(0,0,128,128);
    if(kind==='glass'){for(let j=0;j<4;j++)for(let i=0;i<4;i++){const g=x.createLinearGradient(i*32,j*32,i*32+32,j*32+32);g.addColorStop(0,'#5e86a8');g.addColorStop(1,'#2f4f6e');x.fillStyle=g;x.fillRect(i*32+2,j*32+3,28,26);if(r()<0.4){y.fillStyle='#ffe2a8';y.fillRect(i*32+2,j*32+3,28,26);}}x.fillStyle='#8fb3cf';x.fillRect(0,0,4,4);}
    else if(kind==='house'){x.fillStyle='#3a4a5a';x.fillRect(20,40,30,34);x.fillRect(78,40,30,34);x.fillStyle='#6b4a2e';x.fillRect(54,70,20,58);if(r()<1){y.fillStyle='#ffd890';y.fillRect(20,40,30,34);}}
    else{for(let j=0;j<4;j++)for(let i=0;i<4;i++){x.fillStyle='#34495b';x.fillRect(i*32+7,j*32+9,18,15);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(i*32+7,j*32+9,18,3);if(r()<0.38){y.fillStyle='#ffd48a';y.fillRect(i*32+7,j*32+9,18,15);}}}
    const t=new TH.CanvasTexture(a),te=new TH.CanvasTexture(e);[t,te].forEach(q=>{q.wrapS=q.wrapT=TH.RepeatWrapping;q.anisotropy=4;});t.encoding=TH.sRGBEncoding;return[t,te];}
  const [wt,we]=wtex('win'),[gt2,ge]=wtex('glass'),[ht,he]=wtex('house');
  const winMat=new TH.MeshStandardMaterial({map:wt,vertexColors:true,emissiveMap:we,emissive:new TH.Color(1,1,1),emissiveIntensity:0,roughness:.8});
  const glassMat=new TH.MeshStandardMaterial({map:gt2,vertexColors:true,emissiveMap:ge,emissive:new TH.Color(1,1,1),emissiveIntensity:0,roughness:.25,metalness:.45});
  const houseMat=new TH.MeshStandardMaterial({map:ht,vertexColors:true,emissiveMap:he,emissive:new TH.Color(1,1,1),emissiveIntensity:0,roughness:.85});
  const plainMat=new TH.MeshStandardMaterial({vertexColors:true,roughness:.85});
  const mW=new M(),mG=new M(),mH=new M(),mP=new M(),mR=new M();
  const AIRP={x0:-70,z0:-585,x1:1350,z1:950};
  const inAir=(x,z,m)=>x>AIRP.x0-m&&x<AIRP.x1+m&&z>AIRP.z0-m&&z<AIRP.z1+m;
  const corridor=(x,z)=>z>-80&&z<300&&(x>1280||x<0);
  const trees=[],palms=[],roads=[],cars=[],lamps=[];
  // suelos urbanos y carreteras
  const asph=C('#3f4246'),side=C('#a7a399'),urb=C('#b9b2a2'),dash=C('#e9e6dc');
  mP.flat(-1500,980,2800,2700,0.05,urb);mP.flat(-1500,-560,-90,960,0.05,C('#c2b79f'));mP.flat(1370,300,2400,960,0.05,C('#a9a9a2'));
  function road(x0,z0,x1,z1,w){roads.push({x0,z0,x1,z1,w});const hor=Math.abs(z1-z0)<Math.abs(x1-x0);
    if(hor){mP.flat(Math.min(x0,x1),z0-w/2,Math.max(x0,x1),z0+w/2,0.12,asph);for(let x=Math.min(x0,x1);x<Math.max(x0,x1);x+=26)mP.flat(x,z0-0.6,x+12,z0+0.6,0.16,dash);}
    else{mP.flat(x0-w/2,Math.min(z0,z1),x0+w/2,Math.max(z0,z1),0.12,asph);for(let z=Math.min(z0,z1);z<Math.max(z0,z1);z+=26)mP.flat(x0-0.6,z,x0+0.6,z+12,0.16,dash);}}
  road(-1500,905,2800,905,30);road(640,880,640,2700,36);road(-3000,-610,4200,-610,26);road(-80,-610,-80,905,24);road(1360,-610,1360,905,24);
  const GX=[],GZ=[];for(let x=-1400;x<=2700;x+=140){if(Math.abs(x-640)>40){road(x,980,x,2700,18);GX.push(x);}}for(let z=1120;z<=2700;z+=140){road(-1500,z,2800,z,18);GZ.push(z);}
  for(let x=-1390;x<-100;x+=110)road(x,-560,x,905,12);for(let z=-450;z<900;z+=110)road(-1500,z,-90,z,12);
  for(let x=-1500;x<2800;x+=60){lamps.push([x,909+16]);}for(let z=900;z<2700;z+=60){lamps.push([640+20,z]);lamps.push([640-20,z]);}
  // cerca perimetral del aeropuerto
  const fence=C('#9aa1a7');[[AIRP.x0,AIRP.z0,AIRP.x1,AIRP.z0],[AIRP.x0,AIRP.z1,560,AIRP.z1],[720,AIRP.z1,AIRP.x1,AIRP.z1],[AIRP.x0,AIRP.z0,AIRP.x0,-530],[AIRP.x0,-500,AIRP.x0,540],[AIRP.x0,598,AIRP.x0,AIRP.z1],[AIRP.x1,AIRP.z0,AIRP.x1,AIRP.z1]].forEach(([a,b,c2,d])=>{const w=Math.abs(c2-a)||0.8,dd=Math.abs(d-b)||0.8;mP.box((a+c2)/2,0,(b+d)/2,w,4,dd,fence,9999,9999);});
  // centro comercial
  const mall={x:260,z:1250};mW.box(mall.x,0,mall.z,300,26,150,C('#ece4d4'),40,40,C('#d9d2c4'));mG.box(mall.x,0,mall.z-78,90,34,12,C('#ffffff'),40,40);mP.box(mall.x+120,0,mall.z-60,40,46,40,C('#d6343a'),9999,9999);
  mP.flat(mall.x-150,1000,mall.x+150,mall.z-80,0.14,C('#4a4d50'));for(let x=mall.x-145;x<mall.x+150;x+=12)for(const z of [1030,1080,1130]){mP.flat(x,z-10,x+0.8,z+10,0.18,dash);if(r()<0.6)cars.push({park:1,x:x+6,z,h:Math.PI/2,c:PK(['#c0392b','#ecf0f1','#2c3e50','#7f8c8d','#16a085','#1f1f1f','#f2b705'])});}
  const msign=signMesh('CENTRO COMERCIAL TIERRA FIRME',mall.x,20,mall.z-76.2,'#d6343a','#ffffff',11,grp,Math.PI);
  // estadio
  {const st=new TH.Mesh(new TH.CylinderGeometry(150,165,34,40,1,true),new TH.MeshStandardMaterial({color:C('#d9dde2'),side:TH.DoubleSide,roughness:.7}));st.scale.z=0.7;st.position.set(-560,17,1560);grp.add(st);
   const fld=new TH.Mesh(new TH.CircleGeometry(140,40),mat('#3f8f3a'));fld.rotation.x=-Math.PI/2;fld.scale.y=0.7;fld.position.set(-560,0.3,1560);grp.add(fld);}
  const busy=(x,z)=>(Math.abs(x-mall.x)<190&&z>990&&z<1340)||(Math.hypot(x+560,(z-1560)/0.7)<190);
  // ciudad al sur: edificios por manzana
  const DC={x:1900,z:1950};const pal=['#efe9df','#e3d6c3','#d8dde3','#f0e0c8','#c9cfd6','#e8d2c0','#dcd3e6','#cfe0d6'];
  for(let i=0;i<GX.length-1;i++)for(let j=-1;j<GZ.length-1;j++){
    const x0=GX[i]+12,x1=GX[i+1]-12,z0=(j<0?920:GZ[j])+12,z1=GZ[j+1]-12;if(x1-x0<30)continue;const cx=(x0+x1)/2,cz=(z0+z1)/2;if(busy(cx,cz))continue;
    if(r()<0.1){for(let k=0;k<10;k++)trees.push([RR(x0,x1),RR(z0,z1),RR(9,15)]);mP.flat(x0,z0,x1,z1,0.1,C('#6f9a4f'));continue;}
    const dist=Math.hypot(cx-DC.x,cz-DC.z),hmax=Math.max(30,330*Math.exp(-dist/560));
    const n=PK([1,2,2,3,4]);const cols=n>=3?2:n,rows=Math.ceil(n/cols);const cw=(x1-x0)/cols,ch=(z1-z0)/rows;
    for(let q=0;q<n;q++){const a=q%cols,b=Math.floor(q/cols);const bw=cw*RR(.6,.85),bd=ch*RR(.6,.85),bx=x0+cw*(a+.5),bz=z0+ch*(b+.5);
      const h=Math.round(RR(0.45,1)*hmax/10)*10+10;
      if(h>150)mG.box(bx,0,bz,bw,h,bd,C(PK(['#ffffff','#e6f0ff','#dfe9f2','#f2f7ff'])),40,40,C('#9aa4ad'));
      else mW.box(bx,0,bz,bw,h,bd,C(PK(pal)),40,40,C('#a39d93'));
      if(h>120&&r()<0.5)mP.box(bx,h,bz,bw*0.4,8,bd*0.4,C('#8a9097'),9999,9999);}
    if(r()<0.6)for(let k=0;k<3;k++)trees.push([RR(x0,x1),z0-6,RR(8,11)]);}
  // barrios al oeste: casas de colores
  const hc=['#f6d365','#fda085','#84fab0','#8fd3f4','#f5576c','#ffffff','#fbc2eb','#a1c4fd','#ffecd2','#c3e88d','#ff9a8b','#e0c3fc'];const roofs=['#b5532c','#a0412a','#8a3b25','#c4693d','#6b6b6b'];
  for(let x=-1390;x<-110;x+=110)for(let z=-450;z<900;z+=110){const x0=x+8,x1=x+102,z0=z+8,z1=z+102;if(x1>-95)continue;
    if(corridor((x0+x1)/2,(z0+z1)/2)&&r()<0.4){trees.push([(x0+x1)/2,(z0+z1)/2,12]);continue;}
    if(r()<0.12){mW.box((x0+x1)/2,0,(z0+z1)/2,70,RR(30,50),60,C(PK(pal)),40,40,C('#a39d93'));continue;}
    for(let a=0;a<3;a++)for(let b=0;b<3;b++){if(r()<0.15){palms.push([x0+15+a*32,z0+15+b*32]);continue;}const w=RR(18,24),d=RR(16,22),h=RR(9,14),hx=x0+15+a*32,hz=z0+15+b*32;
      mH.box(hx,0,hz,w,h,d,C(PK(hc)),20,14,C('#cfc8bc'));mR.roof(hx,h,hz,w+1.5,d+1.5,RR(5,8),C(PK(roofs)));}}
  // zona industrial al este
  for(let x=1420;x<2350;x+=130)for(let z=330;z<900;z+=120){if(r()<0.15)continue;const w=RR(70,105),d=RR(50,80),h=RR(16,26);mP.box(x+55,0,z+40,w,h,d,C(PK(['#9fb0bf','#c9ced3','#8fa3b5','#d8d2c4'])),9999,9999,C('#7d8790'));
    mR.roof(x+55,h,z+40,w,d,6,C('#7d8790'));}
  // costa, mar y montañas
  const wc=document.createElement('canvas');wc.width=wc.height=256;{const x=wc.getContext('2d');x.fillStyle='#2f7fb5';x.fillRect(0,0,256,256);for(let i=0;i<900;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*0.18})`;x.fillRect(Math.random()*256,Math.random()*256,4+Math.random()*14,1);}}
  const wtx=new TH.CanvasTexture(wc);wtx.wrapS=wtx.wrapT=TH.RepeatWrapping;wtx.repeat.set(60,22);wtx.encoding=TH.sRGBEncoding;
  const sea=new TH.Mesh(new TH.PlaneGeometry(12000,4200),new TH.MeshStandardMaterial({map:wtx,roughness:.12,metalness:.25}));CITYWATER=wtx;sea.rotation.x=-Math.PI/2;sea.position.set(640,0.25,-2790);grp.add(sea);
  const beach=new TH.Mesh(new TH.PlaneGeometry(12000,80),mat('#e8d9ad'));beach.rotation.x=-Math.PI/2;beach.position.set(640,0.2,-650);grp.add(beach);
  for(let x=-2800;x<4000;x+=55)palms.push([x+RR(-10,10),-660+RR(-12,12)]);
  for(let x=-1300;x<2600;x+=130)if((!corridor(x,-500)||x<-100)&&!(x>-150&&x<1420)){mW.box(x,0,-560,RR(40,60),RR(20,60),RR(25,35),C(PK(pal)),40,40,C('#a39d93'));}
  const mm=new TH.MeshStandardMaterial({vertexColors:false,color:C('#4f6b3c'),roughness:1,flatShading:true});
  [[-2600,2900,600,520],[-2000,3300,700,620],[-1300,3100,520,430],[-3200,1800,650,560],[-3300,600,560,480],[-2900,-200,480,380],[2400,3300,600,440],[3200,2800,520,380],[-400,3400,560,400],[900,3500,620,470]].forEach(([x,z,rad,h])=>{const c=new TH.Mesh(new TH.ConeGeometry(rad,h,9,3),mm);c.position.set(x,h/2-5,z);c.rotation.y=r()*3;grp.add(c);});
  mW.mesh(winMat);mG.mesh(glassMat);mH.mesh(houseMat);mP.mesh(plainMat);mR.mesh(plainMat);
  // árboles y palmeras
  for(let x=-1500;x<2800;x+=45){if(r()<0.6)trees.push([x,922,RR(8,12)]);}for(let z=920;z<2700;z+=40){trees.push([640+28,z,RR(8,11)]);trees.push([640-28,z,RR(8,11)]);}
  for(let k=0;k<500;k++){const x=RR(-1600,2900),z=RR(-600,960);if(!inAir(x,z,30)&&!corridor(x,z)&&!(x<-90))trees.push([x,z,RR(9,16)]);}
  const trunk=new TH.InstancedMesh(new TH.CylinderGeometry(0.7,1,1,6),mat('#6b4a2e'),trees.length+palms.length),crown=new TH.InstancedMesh(new TH.SphereGeometry(1,8,6),new TH.MeshStandardMaterial({roughness:.9,flatShading:true}),trees.length+palms.length);
  const tm=new TH.Matrix4(),ts=new TH.Matrix4();let ti=0;
  trees.forEach(([x,z,h])=>{tm.makeTranslation(x,h*0.25,z);ts.makeScale(1,h*0.5,1);tm.multiply(ts);trunk.setMatrixAt(ti,tm);tm.makeTranslation(x,h*0.7,z);ts.makeScale(h*0.42,h*0.45,h*0.42);tm.multiply(ts);crown.setMatrixAt(ti,tm);crown.setColorAt(ti,C(PK(['#3f7f39','#4c8c3a','#2f6b33','#5a9a44'])));ti++;});
  palms.forEach(([x,z])=>{const h=RR(16,24);tm.makeTranslation(x,h/2,z);ts.makeScale(0.6,h,0.6);tm.multiply(ts);trunk.setMatrixAt(ti,tm);tm.makeTranslation(x,h,z);ts.makeScale(6,1.6,6);tm.multiply(ts);crown.setMatrixAt(ti,tm);crown.setColorAt(ti,C('#4f9a3c'));ti++;});
  grp.add(trunk,crown);
  // faroles (brillan de noche)
  const lampMat=new TH.MeshStandardMaterial({color:C('#fff2cc'),emissive:C('#ffd890'),emissiveIntensity:0});const lamp=new TH.InstancedMesh(new TH.BoxGeometry(2.4,1.2,2.4),lampMat,lamps.length);lamps.forEach(([x,z],k)=>{tm.makeTranslation(x,14,z);lamp.setMatrixAt(k,tm);});grp.add(lamp);
  // carros en movimiento
  const movers=[];const segs=roads.filter(s=>s.w>=18);
  for(let k=0;k<260;k++){const s=PK(segs);const dir=r()<0.5?1:-1;movers.push({s,u:r(),dir,spd:RR(40,90)/Math.hypot(s.x1-s.x0,s.z1-s.z0),c:PK(['#c0392b','#ecf0f1','#2c3e50','#7f8c8d','#16a085','#1f1f1f','#f2b705','#2f80ed','#e67e22'])});}
  const carM=new TH.InstancedMesh(new TH.BoxGeometry(1,1,1),new TH.MeshStandardMaterial({roughness:.35,metalness:.4}),movers.length+cars.length);carM.instanceMatrix.setUsage(TH.DynamicDrawUsage);
  movers.concat(cars).forEach((m,k)=>carM.setColorAt(k,C(m.c)));grp.add(carM);
  grp.traverse(o=>{o.castShadow=false;o.receiveShadow=false;});
  CITY={grp,winMat,glassMat,houseMat,lampMat,movers,cars,carM};
}
function updCity(dt,n){
  if(!CITY)return;if(CITYWATER){CITYWATER.offset.x+=dt*0.004;CITYWATER.offset.y+=dt*0.0025;}CITY.winMat.emissiveIntensity=n*1.25;CITY.glassMat.emissiveIntensity=n*1.1;CITY.houseMat.emissiveIntensity=n*0.9;CITY.lampMat.emissiveIntensity=n*2.5;
  const tm=new TH.Matrix4(),ts=new TH.Matrix4(),tr=new TH.Matrix4();let k=0;
  for(const m of CITY.movers){m.u+=m.spd*m.dir*dt;if(m.u>1)m.u-=1;if(m.u<0)m.u+=1;const s=m.s,dx=s.x1-s.x0,dz=s.z1-s.z0,L=Math.hypot(dx,dz),nx=-dz/L,nz=dx/L,off=m.dir*s.w*0.22;
    const x=s.x0+dx*m.u+nx*off,z=s.z0+dz*m.u+nz*off,h=Math.atan2(dz*m.dir,dx*m.dir);tm.makeTranslation(x,2.6,z);tr.makeRotationY(-h);tm.multiply(tr);ts.makeScale(15,4.6,7.4);tm.multiply(ts);CITY.carM.setMatrixAt(k++,tm);}
  if(!CITY.parked){for(const c of CITY.cars){tm.makeTranslation(c.x,2.6,c.z);tr.makeRotationY(-c.h);tm.multiply(tr);ts.makeScale(15,4.6,7.4);tm.multiply(ts);CITY.carM.setMatrixAt(CITY.movers.length+CITY.cars.indexOf(c),tm);}CITY.parked=true;}
  CITY.carM.instanceMatrix.needsUpdate=true;
}

