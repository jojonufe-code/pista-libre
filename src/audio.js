/* ================= SONIDO: mezcla, motores posicionales, ambiente, anuncios y efectos ================= */
const AU={vol:0.8,out:null,voices:[],tU:0,tC:0,tB:4,tK:1,tA:0,lastAnn:-99,ann:new Set(),fl:false,chat:null,cash:0,near:0,rr:rng(4242)};
try{const v=localStorage.getItem('pl_vol');if(v!=null&&v!==''&&!isNaN(+v))AU.vol=clamp(+v,0,1);}catch(e){}
const AR=(a,b)=>a+AU.rr()*(b-a);
/* bus maestro con compresor: todo el audio pasa por aquí */
function auOut(){if(!AC)return null;if(AU.out)return AU.out;
  try{const comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=14;comp.ratio.value=4;comp.attack.value=0.004;comp.release.value=0.3;
    const m=AC.createGain();m.gain.value=AU.vol;m.connect(comp);comp.connect(AC.destination);AU.out=m;}catch(e){AU.out=AC.destination;}return AU.out;}
function setVol(v){AU.vol=clamp(v,0,1);try{localStorage.setItem('pl_vol',String(AU.vol));}catch(e){}if(AU.out&&AU.out.gain)AU.out.gain.setTargetAtTime(AU.vol,AC.currentTime,0.05);}
const S_=(p,v,tc)=>{try{p.setTargetAtTime(v,AC.currentTime,tc||0.12);}catch(e){}};
function tone(f,d,type,vol,t0,f2,dest){try{const t=AC.currentTime+(t0||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(dest||auOut());o.start(t);o.stop(t+d+0.05);}catch(e){}}
function hiss(d,type,f,q,vol,t0,f2,dest,att){try{ensureNoise();const t=AC.currentTime+(t0||0),s=AC.createBufferSource();s.buffer=NOISE;s.playbackRate.value=AR(0.8,1.2);const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);fl.Q.value=q||0.7;
  const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(att||0.01));g.gain.exponentialRampToValueAtTime(0.0001,t+d);s.connect(fl);fl.connect(g);g.connect(dest||auOut());s.start(t,AR(0,2));s.stop(t+d+0.05);}catch(e){}}
/* panorama y atenuación según la cámara */
const _aR=new TH.Vector3();
function auPos(x,y,z){const cp=camera.position,dx=x-cp.x,dy=y-cp.y,dz=z-cp.z,d=Math.hypot(dx,dy,dz);_aR.setFromMatrixColumn(camera.matrixWorld,0);
  return{d,pan:d>1?clamp((dx*_aR.x+dy*_aR.y+dz*_aR.z)/d,-1,1)*0.8:0,amp:1/(1+Math.pow(d/170,1.35))};}
function panned(pan){const o=auOut();if(!AC.createStereoPanner)return o;const p=AC.createStereoPanner();p.pan.value=pan;p.connect(o);return p;}
/* efectos de interfaz y eventos */
function auSfx(k){if(!AC||!G||!G.sound)return;
  switch(k){
    case 'click':tone(1500,0.035,'sine',0.03);tone(3000,0.02,'sine',0.01);break;
    case 'paint':tone(560,0.035,'triangle',0.02);break;
    case 'build':tone(150,0.22,'sine',0.13,0,85);hiss(0.07,'lowpass',1100,0.7,0.07);tone(880,0.1,'triangle',0.035,0.08);tone(1320,0.16,'triangle',0.028,0.15);break;
    case 'del':hiss(0.3,'lowpass',700,0.8,0.12,0,160);tone(120,0.22,'sawtooth',0.03,0,55);break;
    case 'chime':[[784,0],[659,0.42],[523,0.84]].forEach(([f,t])=>{tone(f,1.3,'sine',0.06,t);tone(f*2,0.8,'sine',0.012,t);tone(f,0.9,'triangle',0.015,t);});break;
    case 'star':[523,659,784,1046].forEach((f,i)=>{tone(f,0.35,'triangle',0.05,i*0.12);tone(f*2,0.25,'sine',0.015,i*0.12);});[523,659,784].forEach(f=>tone(f,1.1,'sine',0.035,0.55));break;
    case 'cash':tone(1568,0.07,'square',0.015);tone(2093,0.3,'triangle',0.03,0.06);hiss(0.14,'highpass',5000,0.5,0.03,0.05);break;
    case 'bad':tone(233,0.13,'triangle',0.045);tone(196,0.2,'triangle',0.045,0.13);break;
    case 'jet':break;}}
function auTouch(x,z){if(!AC||!G||!G.sound)return;const P=auPos(x,2,z);if(P.amp<0.03)return;const d=panned(P.pan);
  hiss(0.55,'bandpass',2600,2.2,0.32*P.amp,0,1200,d);hiss(0.4,'bandpass',1900,3,0.18*P.amp,0.18,900,d);tone(70,0.4,'sine',0.25*P.amp,0,40,d);}
function auCash(x,z){if(!AC||!G||!G.sound)return;const n=performance.now();if(n-AU.cash<700)return;const P=auPos(x,10,z);if(P.d>900)return;AU.cash=n;const d=panned(P.pan);
  tone(1568,0.07,'square',0.012*(0.4+P.amp),0,0,d);tone(2093,0.28,'triangle',0.025*(0.4+P.amp),0.06,0,d);}
function auThunder(){if(!AC||!G||!G.sound)return;const t=AR(0.5,2.4);hiss(3.2,'lowpass',180,0.7,0.35,t,60,null,0.08);hiss(1.2,'lowpass',420,0.6,0.18,t,120,null,0.02);}
/* voz de motor: retumbo, soplido de turbina y tono (silbido de turbina, zumbido de hélice o batido de rotor) */
function mkVoice(){ensureNoise();const v={};const n=AC.createBufferSource();n.buffer=NOISE;n.loop=true;n.playbackRate.value=AR(0.85,1.15);
  v.lp=AC.createBiquadFilter();v.lp.type='lowpass';v.lp.frequency.value=300;v.bp=AC.createBiquadFilter();v.bp.type='bandpass';v.bp.frequency.value=2400;v.bp.Q.value=0.9;
  v.gR=AC.createGain();v.gW=AC.createGain();v.gT=AC.createGain();[v.gR,v.gW,v.gT].forEach(g=>g.gain.value=0);n.connect(v.lp);v.lp.connect(v.gR);n.connect(v.bp);v.bp.connect(v.gW);
  v.osc=AC.createOscillator();v.osc.type='sawtooth';v.osc.frequency.value=1800;v.tb=AC.createBiquadFilter();v.tb.type='bandpass';v.tb.Q.value=6;v.tb.frequency.value=1800;v.osc.connect(v.tb);v.tb.connect(v.gT);
  v.out=AC.createGain();v.out.gain.value=0;[v.gR,v.gW,v.gT].forEach(g=>g.connect(v.out));
  if(AC.createStereoPanner){v.pan=AC.createStereoPanner();v.out.connect(v.pan);v.pan.connect(auOut());}else v.out.connect(auOut());
  n.start(0,AR(0,2.5));v.osc.start();return v;}
const PJL=s=>s.startsWith('park')?0:s.startsWith('push')?0.2:s.startsWith('taxo')||s==='taxi'?0.3:s.startsWith('hold')?0.28:s==='line'?0.4:s==='app'?0.5:s==='roll'?0.75:s==='tko'?1:0.25;
const PLL={approach:0.55,goaround:0.95,takeoff:1,lineup:0.42,taxiIn:0.32,taxiOut:0.32,push:0.18,holdShort:0.3,hold2:0.3,cross:0.32};
function auEngines(){const src=[];
  for(const p of G.planes){if(!p.engines)continue;const L=p.state==='roll'?(p.rev>0?1:0.6):(PLL[p.state]||0.25);src.push({x:p.x,y:(p.alt||0)+5,z:p.z,L,k:p.T.prop?'prop':'jet',h:p.T.heavy});}
  for(const j of G.pj||[]){const L=PJL(j.st||'');if(L>0)src.push({x:j.x,y:(j.alt||0)+4,z:j.z,L:L*0.8,k:'jet'});}
  for(const h of G.hc||[]){if(h.rot>0.04)src.push({x:h.x,y:(h.alt||0)+6,z:h.z,L:h.rot,k:'heli'});}
  src.forEach(s=>{s.P=auPos(s.x,s.y,s.z);s.sc=s.L*s.P.amp;});src.sort((a,b)=>b.sc-a.sc);
  const N=Math.min(AU.voices.length,src.length);
  for(let i=0;i<AU.voices.length;i++){const v=AU.voices[i],s=i<N?src[i]:null;
    if(!s||s.sc<0.004){S_(v.out.gain,0,0.25);continue;}const L=s.L,P=s.P,air=Math.max(500,9000/(1+P.d/350));
    if(v.pan)S_(v.pan.pan,P.pan,0.08);
    if(s.k==='jet'){S_(v.lp.frequency,Math.min(air,(s.h?200:260)+950*L));S_(v.gR.gain,0.12+0.6*L);S_(v.bp.frequency,Math.min(air,1800+1600*L));S_(v.gW.gain,0.05+0.3*L*L);
      v.osc.type!=='sawtooth'&&(v.osc.type='sawtooth');S_(v.osc.frequency,(s.h?1300:1600)+1700*L,0.4);S_(v.tb.frequency,Math.min(air,(s.h?1300:1600)+1700*L),0.4);v.tb.Q.value=6;S_(v.gT.gain,0.02+0.05*L);}
    else if(s.k==='prop'){S_(v.lp.frequency,Math.min(air,380+500*L));S_(v.gR.gain,0.1+0.35*L);S_(v.bp.frequency,Math.min(air,2600));S_(v.gW.gain,0.04+0.08*L);
      S_(v.osc.frequency,82+34*L,0.3);S_(v.tb.frequency,170+60*L,0.3);v.tb.Q.value=1.2;S_(v.gT.gain,0.12+0.3*L);}
    else{S_(v.lp.frequency,Math.min(air,520));S_(v.gR.gain,0.2*L);S_(v.bp.frequency,Math.min(air,4200));S_(v.gW.gain,0.06*L);S_(v.osc.frequency,15+3*L,0.3);S_(v.tb.frequency,115,0.3);v.tb.Q.value=0.8;S_(v.gT.gain,1.1*L);}
    S_(v.out.gain,clamp(P.amp*(0.35+0.65*L),0,1)*0.9,0.15);}}
/* ambiente: murmullo de terminal con voces, viento, lluvia, aves de día y grillos de noche */
function mkChat(){ensureNoise();const s=AC.createBufferSource();s.buffer=NOISE;s.loop=true;s.playbackRate.value=1.6;const b1=AC.createBiquadFilter();b1.type='bandpass';b1.frequency.value=480;b1.Q.value=1.4;
  const b2=AC.createBiquadFilter();b2.type='bandpass';b2.frequency.value=1150;b2.Q.value=2.2;const g1=AC.createGain(),g2=AC.createGain(),o=AC.createGain();g1.gain.value=0;g2.gain.value=0;o.gain.value=0;
  s.connect(b1);b1.connect(g1);s.connect(b2);b2.connect(g2);g1.connect(o);g2.connect(o);o.connect(auOut());s.start();return{g1,g2,o,b2};}
function auAmbient(rdt){const tg=controls.target,cp=camera.position,cd=cp.distanceTo(tg),n=nightFactor(),r=typeof WX!=='undefined'?WX.r:0;
  // murmullo según la gente cerca de lo que miras
  AU.tC-=rdt;if(AU.tC<=0){AU.tC=0.5;let k=0;for(const p of G.pax){if(p.hidden)continue;const dx=p.x-tg.x,dz=p.z-tg.z;if(dx*dx+dz*dz<160*160)k++;}for(const a of G.fa||[]){const dx=a.x-tg.x,dz=a.z-tg.z;if(dx*dx+dz*dz<160*160)k++;}AU.near=k;}
  const close=clamp(1-cd/650,0,1),crowd=clamp(AU.near/70,0,1)*close;
  if(!AU.chat)AU.chat=mkChat();S_(AU.chat.o.gain,crowd*0.22,0.4);S_(AU.chat.g1.gain,AR(0.4,1),0.08);S_(AU.chat.g2.gain,AR(0.1,0.7),0.06);S_(AU.chat.b2.frequency,AR(900,1500),0.1);
  if(AMB){S_(AMB.wind.gain,0.02+0.05*clamp(cp.y/1400,0,1)+r*0.07,0.6);S_(AMB.rain.gain,r*0.22,0.5);S_(AMB.mur.gain,crowd*0.06,0.5);}
  if(r>0.15&&AR(0,1)<rdt*30*r*close)hiss(0.05,'highpass',AR(3000,6000),1,0.02*r,0,0,null,0.003);
  if(typeof WX!=='undefined'){if(WX.flash>0.9&&!AU.fl){AU.fl=true;auThunder();}else if(WX.flash<0.2)AU.fl=false;}
  const low=cp.y<520&&r<0.15;
  AU.tB-=rdt;if(AU.tB<=0){AU.tB=AR(2.5,8);if(low&&n<0.3){const b=AR(2400,3600),k=2+Math.floor(AR(0,4)),v=0.018*(1-n);for(let i=0;i<k;i++){const f=b*AR(0.9,1.25);tone(f,0.09,'sine',v,i*0.11,f*AR(1.15,1.5));}}}
  AU.tK-=rdt;if(AU.tK<=0){AU.tK=AR(0.5,1.3);if(low&&n>0.7){const f=AR(4100,4700);for(let i=0;i<3;i++)tone(f,0.035,'sine',0.009*n,i*0.06);}}}
/* anuncios de embarque por megafonía */
function auAnnounce(rdt){AU.tA-=rdt;if(AU.tA>0)return;AU.tA=0.6;
  for(const f of G.flights){if(!f.boardOpen||AU.ann.has(f.id))continue;AU.ann.add(f.id);
    const tg=controls.target,tc=((G.tx0+G.tx1)/2)*CELL,near=Math.abs(tg.x-tc)<(G.tx1-G.tx0)*CELL*0.7+150&&tg.z>-80&&tg.z<GH*CELL+120&&camera.position.distanceTo(tg)<950;
    const now=performance.now()/1000;if(!near||now-AU.lastAnn<18||!f.stand)continue;AU.lastAnn=now;auSfx('chime');
    const txt='Atención por favor. Pasajeros del vuelo '+f.num+' con destino a '+((f.dest&&f.dest.n)||'')+', favor abordar por la puerta '+f.stand.num+'.';setTimeout(()=>speak(txt,true),1500);break;}
  if(AU.ann.size>400)AU.ann=new Set([...AU.ann].slice(-150));}
function audUpd(rdt){if(!AC||!G)return;const on=G.sound&&!titleOnSafe();
  if(!on){AU.voices.forEach(v=>S_(v.out.gain,0,0.2));if(AU.chat)S_(AU.chat.o.gain,0,0.2);return;}
  AU.tU-=rdt;if(AU.tU>0)return;AU.tU=0.05;
  try{if(!AU.voices.length){const n=matchMedia&&matchMedia('(pointer:coarse)').matches?4:6;for(let i=0;i<n;i++)AU.voices.push(mkVoice());}
    auEngines();auAmbient(0.05);auAnnounce(0.05);}catch(e){AU.err=String(e&&e.stack||e).slice(0,300);}}
