
/* ================= AERÓDROMO EJECUTIVO (gráficos) ================= */
const NS={x0:-210,z0:-850,w:1420,h:560},NPX=1.8;
try{if(!matchMedia('(pointer:coarse)').matches){sun.shadow.mapSize.set(4096,4096);sun.shadow.bias=-0.0004;}}catch(e){}
const ncan=document.createElement('canvas');ncan.width=Math.round(NS.w*NPX);ncan.height=Math.round(NS.h*NPX);
const ntex=new TH.CanvasTexture(ncan);ntex.encoding=TH.sRGBEncoding;ntex.anisotropy=renderer.capabilities.getMaxAnisotropy();
const nground=new TH.Mesh(new TH.PlaneGeometry(NS.w,NS.h),new TH.MeshStandardMaterial({map:ntex,roughness:.93}));nground.rotation.x=-Math.PI/2;nground.position.set(NS.x0+NS.w/2,0.02,NS.z0+NS.h/2);nground.receiveShadow=true;scene.add(nground);
/* césped del resto del mundo con textura en vez de color plano */
{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#668843';x.fillRect(0,0,256,256);
 for(let i=0;i<5200;i++){x.fillStyle=['rgba(255,255,255,.05)','rgba(0,0,0,.07)','rgba(130,160,70,.35)','rgba(80,110,40,.3)'][i%4];x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2.6,1+Math.random()*2.6);}
 const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(70,70);t.encoding=TH.sRGBEncoding;t.anisotropy=8;outerM.material=new TH.MeshStandardMaterial({map:t,roughness:1});}
function nRect(x,x0,z0,x1,z1,c){x.fillStyle=c;x.fillRect(Math.min(x0,x1),Math.min(z0,z1),Math.abs(x1-x0),Math.abs(z1-z0));}
function drawNorth(){const x=ncan.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,ncan.width,ncan.height);x.setTransform(NPX,0,0,NPX,-NS.x0*NPX,-NS.z0*NPX);const F=G.fbo||{};const r1=fbR1();
  x.fillStyle='#6d8c47';x.fillRect(NS.x0,NS.z0,NS.w,NS.h);noise(x,7000,NS.x0,NS.z0,NS.w,NS.h,['rgba(255,255,255,.05)','rgba(0,0,0,.06)','rgba(120,150,60,.25)'],2.2);
  x.fillStyle='rgba(255,255,255,.035)';for(let X=NS.x0;X<NS.x0+NS.w;X+=40)x.fillRect(X,NS.z0,20,NS.h);
  // senderos del parque y orilla del lago
  const [lx,lz,lrx,lrz]=FB.lake;x.fillStyle='#d9c99a';x.beginPath();x.ellipse(lx,lz,lrx+9,lrz+8,0,0,TAU);x.fill();x.fillStyle='#2b5f78';x.beginPath();x.ellipse(lx,lz,lrx,lrz,0,0,TAU);x.fill();
  x.strokeStyle='#d8cfb4';x.lineWidth=3.2;x.beginPath();x.ellipse(lx,lz,lrx+22,lrz+20,0.05,0,TAU);x.stroke();
  x.beginPath();x.moveTo(lx+lrx+22,lz);x.bezierCurveTo(140,-700,200,-760,300,-790);x.stroke();
  for(let i=0;i<40;i++){const a=i/40*TAU;x.fillStyle=['#e86f9a','#f2c230','#ffffff','#b56be0'][i%4];x.beginPath();x.arc(lx+Math.cos(a)*(lrx+30),lz+Math.sin(a)*(lrz+28),1.6,0,TAU);x.fill();}
  if(!F.on){x.save();x.setLineDash([6,5]);x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=1.2;x.strokeRect(90,-830,1100,440);x.setLineDash([]);
    x.fillStyle='rgba(255,255,255,.85)';for(const [a,b] of [[90,-830],[1190,-830],[90,-390],[1190,-390]])x.fillRect(a-2,b-2,4,4);
    x.font='700 26px "Barlow Condensed", sans-serif';x.textAlign='center';x.fillStyle='rgba(255,255,255,.55)';x.fillText('TERRENO DEL AERÓDROMO EJECUTIVO',640,-600);x.font='600 15px "Barlow Condensed", sans-serif';x.fillText('Pestaña Ejecutiva · 3 estrellas',640,-575);x.restore();ntex.needsUpdate=true;return;}
  // pista ejecutiva
  const RZ=FB.rz,r0=FB.r0,hw=F.rwy>=3?23:17;nRect(x,r0-14,RZ-hw-4,r1+14,RZ+hw+4,'#55585b');x.fillStyle=F.rwy>=3?'#323437':'#37393d';x.fillRect(r0-10,RZ-hw,r1-r0+20,hw*2);noise(x,3000,r0,RZ-hw,r1-r0,hw*2,['rgba(255,255,255,.04)','rgba(0,0,0,.09)'],1.2);
  if(F.rwy>=3){x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=0.2;x.beginPath();for(let X=r0;X<r1;X+=1.6){x.moveTo(X,RZ-hw+1);x.lineTo(X,RZ+hw-1);}x.stroke();}
  noise(x,700,r1-330,RZ-8,240,16,['rgba(10,10,10,.18)','rgba(25,25,25,.12)'],2.2);
  x.fillStyle='#f4f4f0';x.fillRect(r0-6,RZ-hw+1.4,r1-r0+12,0.6);x.fillRect(r0-6,RZ+hw-2,r1-r0+12,0.6);for(let X=r0+30;X<r1-40;X+=26)x.fillRect(X,RZ-0.35,13,0.7);
  const nb=Math.floor((hw*2-6)/5);for(let i=0;i<nb;i++){if(i===nb/2||i===(nb-1)/2)continue;x.fillRect(r1-20,RZ-hw+3+i*5,16,2.4);x.fillRect(r0-4,RZ-hw+3+i*5,16,2.4);}
  [r1-110,r0+70].forEach(X=>{x.fillRect(X,RZ-hw+5,26,4);x.fillRect(X,RZ+hw-9,26,4);});for(let k=1;k<4;k++)[r1-110-k*45,r0+70+k*45].forEach(X=>{x.fillRect(X,RZ-hw+5,14,2);x.fillRect(X,RZ+hw-7,14,2);});
  [[r1-40,'27',Math.PI/2],[r0+34,'09',-Math.PI/2]].forEach(([X,t,a])=>{x.save();x.font='700 16px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.translate(X,RZ);x.rotate(a);x.fillText(t,0,0);x.restore();});
  // rodaje, salidas y espera
  const TZ=FB.tz;nRect(x,r0-20,TZ-11,r1+14,TZ+11,'#46494d');[r1-420,300,r1-24].forEach(X=>{nRect(x,X-11,TZ,X+11,RZ-15,'#46494d');x.fillStyle='#f2c230';x.fillRect(X-0.3,TZ,0.6,RZ-TZ-15);
    x.fillRect(X-11,RZ-27,22,0.6);x.fillRect(X-11,RZ-25.8,22,0.6);for(let k=0;k<5;k++){x.fillRect(X-11+k*4.6,RZ-24.2,2.6,0.6);x.fillRect(X-11+k*4.6,RZ-23,2.6,0.6);}});
  x.fillStyle='#f2c230';x.fillRect(r0-18,TZ-0.3,r1-r0+30,0.6);x.fillStyle='rgba(242,194,48,.7)';x.fillRect(r0-18,TZ+10.6,r1-r0+30,0.4);x.fillRect(r0-18,TZ-11,r1-r0+30,0.4);
  // plataforma ejecutiva y de hangares
  x.fillStyle=tilePat?tilePat.c:'#b4b1a8';x.fillRect(100,-602,860,134);if(F.hang)x.fillRect(100,-642,170,40);
  x.strokeStyle='rgba(80,78,70,.22)';x.lineWidth=0.3;x.beginPath();for(let X=100;X<=960;X+=8){x.moveTo(X,-602);x.lineTo(X,-468);}for(let Z=-602;Z<=-468;Z+=8){x.moveTo(100,Z);x.lineTo(960,Z);}x.stroke();
  x.fillStyle='#d23a2f';x.fillRect(100,-604,860,0.6);
  for(let i=0;i<F.st;i++){const sx=fbStX(i);x.strokeStyle='rgba(20,20,20,.5)';x.lineWidth=1.4;x.beginPath();x.moveTo(sx,TZ+11);x.lineTo(sx,-598);x.stroke();x.strokeStyle='#f2c230';x.lineWidth=0.7;x.beginPath();x.moveTo(sx,TZ+11);x.lineTo(sx,-598);x.stroke();
    x.fillStyle='#f2c230';x.fillRect(sx-5,-597,10,1);x.strokeStyle='#d23a2f';x.setLineDash([2,2]);x.lineWidth=0.6;x.strokeRect(sx-36,-600,72,128);x.setLineDash([]);
    x.save();x.fillStyle='#1b1b1b';x.fillRect(sx+8,-596,14,9);x.font='700 8px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f2c230';x.fillText('E'+(i+1),sx+15,-591.4);x.restore();
    const r=rng(i*31+7);for(let k=0;k<14;k++){x.fillStyle='rgba(30,28,24,'+(0.04+r()*0.06)+')';x.beginPath();x.ellipse(sx+(r()-0.5)*40,-560+r()*60,1+r()*3,0.8+r()*2,r()*3,0,TAU);x.fill();}}
  // plataforma de enlace (tramo norte)
  if(F.link){const L0=FB.lnk;nRect(x,L0-11,NS.z0+560,L0+11,TZ-11,'#46494d');nRect(x,L0-11,TZ-11,r0,TZ+11,'#46494d');x.fillStyle='#f2c230';x.fillRect(L0-0.3,-290,0.6,TZ+290);x.fillRect(L0,TZ-0.3,r0-L0,0.6);
    x.fillStyle='#3f4246';x.fillRect(L0+13,-290,6,TZ+290+8);x.fillStyle='rgba(255,255,255,.7)';for(let Z=-290;Z>TZ;Z-=10)x.fillRect(L0+15.7,Z-5,0.5,5);}
  // helipuertos
  if(F.heli)FB.heli.slice(0,F.heli>=2?4:2).forEach(([hx,hz],i)=>{nRect(x,hx-27,hz-27,hx+27,hz+27,'#8d8f92');noise(x,300,hx-27,hz-27,54,54,['rgba(0,0,0,.08)','rgba(255,255,255,.06)'],1.2);x.strokeStyle='#ffffff';x.lineWidth=1.3;x.beginPath();x.arc(hx,hz,19,0,TAU);x.stroke();
    x.strokeStyle='#f2c230';x.setLineDash([3,2]);x.lineWidth=1;x.strokeRect(hx-25,hz-25,50,50);x.setLineDash([]);x.save();x.font='900 30px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffffff';x.fillText('H',hx,hz+1);
    x.font='700 6px "Barlow Condensed", sans-serif';x.fillText('5.0t',hx+14,hz-14);x.restore();});
  if(F.heli){nRect(x,820,-646,1090,-636,'#cfccc4');}
  // lado tierra: vía de acceso, bulevar, glorieta, acera y estacionamiento
  const lane=(pts,w)=>{x.strokeStyle='#cbc7bd';x.lineWidth=w+2.4;x.lineCap='butt';x.lineJoin='round';x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();
    x.strokeStyle='#3e4145';x.lineWidth=w;x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();};
  const dash=(pts,c,on,off,w)=>{x.save();x.strokeStyle=c;x.lineWidth=w||0.5;x.setLineDash(on?[on,off]:[]);x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();x.restore();};
  // sombra de contacto de los edificios
  x.save();try{x.filter='blur('+Math.round(NPX*3)+'px)';}catch(e){}x.fillStyle='rgba(20,22,26,.32)';x.fillRect(FB.tx0-4,FB.tz0-4,FB.tx1-FB.tx0+8,FB.tz1-FB.tz0+8);
  for(let i=0;i<F.hang;i++)x.fillRect(FB.hang[i]-41,FB.hz0-4,82,FB.hz1-FB.hz0+8);if(F.mro)x.fillRect(106,-692,148,44);if(F.cat)x.fillRect(859,-712,92,44);if(F.twr)x.fillRect(975,-683,22,30);if(F.fuel)x.fillRect(994,-760,114,44);x.restore();
  // vía de acceso de doble sentido, conectores de un sentido, glorieta y carril de dejada
  lane([[-210,-792],[575,-792]],20);lane([[593,-852],[593,-818]],13);lane([[607,-852],[607,-818]],13);x.fillStyle='#4f7f38';x.fillRect(598.5,-852,3,32);
  x.strokeStyle='#cbc7bd';x.lineWidth=16.4;x.beginPath();x.arc(600,-792,28,0,TAU);x.stroke();x.strokeStyle='#3e4145';x.lineWidth=14;x.beginPath();x.arc(600,-792,28,0,TAU);x.stroke();
  x.fillStyle='#5f8a40';x.beginPath();x.arc(600,-792,20.6,0,TAU);x.fill();x.strokeStyle='#d6d1c4';x.lineWidth=1.2;x.beginPath();x.arc(600,-792,21,0,TAU);x.stroke();
  lane([[625,-792],[700,-790],[712,-778],[712,-718]],12);lane([[458,-786],[458,-718]],12);nRect(x,446,-718,724,-696,'#cbc7bd');roadAsphalt(x,448,-717,274,20,77);
  roadAsphalt(x,-210,-801,786,18,55);
  // marcas
  dash([[-205,-792],[566,-792]],'#f2c230',0,0,0.4);dash([[-205,-793],[566,-793]],'#f2c230',0,0,0.4);dash([[-205,-800.6],[566,-800.6]],'#f4f4f0',0,0,0.45);dash([[-205,-783.4],[566,-783.4]],'#f4f4f0',0,0,0.45);
  x.save();x.strokeStyle='rgba(244,244,240,.8)';x.lineWidth=0.4;x.setLineDash([2,2]);x.beginPath();x.arc(600,-792,28,0,TAU);x.stroke();x.restore();
  [[600,-821,0],[573,-792,Math.PI/2],[627,-792,-Math.PI/2]].forEach(([a,b,r])=>{x.save();x.translate(a,b);x.rotate(r);x.fillStyle='rgba(244,244,240,.85)';for(let k=-2;k<=2;k++){x.beginPath();x.moveTo(k*2.6-1,0);x.lineTo(k*2.6+1,0);x.lineTo(k*2.6,1.8);x.fill();}x.restore();});
  dash([[452,-707],[718,-707]],'#f4f4f0',3,2.4,0.45);dash([[452,-696.8],[722,-696.8]],'#f4f4f0',0,0,0.45);
  FB.bays.forEach(bx=>{x.save();x.setLineDash([1.4,1]);x.strokeStyle='rgba(201,162,74,.9)';x.lineWidth=0.4;x.strokeRect(bx-15.5,-706.4,31,9.4);x.restore();x.save();x.font='700 3.4px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(201,162,74,.9)';x.fillText('VIP',bx,-701.6);x.restore();});
  x.save();x.strokeStyle='#f2c230';x.lineWidth=0.5;x.strokeRect(466,-706.6,40,9.6);x.font='700 4px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f2c230';x.fillText('SHUTTLE',486,-701.8);x.restore();
  roadArrow(x,500,-712,1);roadArrow(x,640,-712,1);roadArrow(x,458,-760,1,Math.PI/2);roadArrow(x,712,-750,1,-Math.PI/2);roadArrow(x,593,-840,1,Math.PI/2);roadArrow(x,607,-840,1,-Math.PI/2);
  for(let X=-160;X<540;X+=120){roadArrow(x,X,-787,1);roadArrow(x,X+60,-797,-1);}
  zebra(x,600,-717,-697,8);x.save();x.translate(600,-845);x.rotate(Math.PI/2);zebra(x,0,-9,9,6);x.restore();
  x.fillStyle='#d6d1c4';x.fillRect(380,-696.4,344,6);
  nRect(x,724,-790,880,-724,'#3f4246');x.fillStyle='#f4f4f0';for(let X=730;X<878;X+=11){x.fillRect(X,-788,0.45,20);x.fillRect(X,-746,0.45,20);}
  // camino de servicio de la plataforma de enlace hasta el FBO
  if(F.link){x.strokeStyle='#3f4246';x.lineWidth=6;x.lineCap='round';x.beginPath();x.moveTo(FB.lnk+16,-438);x.lineTo(FB.lnk+30,-470);x.lineTo(104,-474);x.stroke();}
  // piso interior de mármol de la terminal
  nRect(x,FB.tx0,FB.tz0,FB.tx1,FB.tz1,'#e6e0d4');x.strokeStyle='rgba(120,110,95,.18)';x.lineWidth=0.3;x.beginPath();for(let X=FB.tx0;X<=FB.tx1;X+=6){x.moveTo(X,FB.tz0);x.lineTo(X,FB.tz1);}for(let Z=FB.tz0;Z<=FB.tz1;Z+=6){x.moveTo(FB.tx0,Z);x.lineTo(FB.tx1,Z);}x.stroke();
  noise(x,500,FB.tx0,FB.tz0,FB.tx1-FB.tx0,FB.tz1-FB.tz0,['rgba(150,140,120,.12)','rgba(255,255,255,.18)'],2.4);
  nRect(x,590,-660,610,-614,'#7a1f2b');nRect(x,592,-690,608,-682,'#7a1f2b');
  // jardines
  for(const [a,b,w,h] of [[380,-612,200,6],[620,-612,200,6],[380,-722,62,10],[730,-722,90,4],[840,-680,24,30]]){nRect(x,a,b,a+w,b-h,'#4a7a34');noise(x,Math.round(w*h/6),a,b-h,w,h,['#e86f9a','#f2c230','#ffffff','#b56be0','#ff7a4a'],1.4);}
  ntex.needsUpdate=true;}
/* ---------- modelos ---------- */
const JMT=new Map();
function bizjetTpl(T,sch){const key=T.k+sch.join();let t=JMT.get(key);if(t)return t;
  const L=T.len*PSCALE,S=T.span*PSCALE,Rr=Math.max(1.6,L*0.05),g=new TH.Group();g.rotation.order='YZX';
  const body=mat(sch[0],{metalness:.3,roughness:.22}),c1=mat(sch[1],{metalness:.3,roughness:.3}),c2=mat(sch[2],{metalness:.35,roughness:.3}),wingM=mat('#cfd5da',{metalness:.45,roughness:.35}),dark=mat('#1d2329',{metalness:.4,roughness:.5}),glassM=mat('#0d1822',{roughness:.06,metalness:.7}),metal=mat('#c9ced3',{metalness:.85,roughness:.2}),tire=mat('#161616',{roughness:.9});
  const add=(geo,m,x,y,z,par)=>{const o=new TH.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;(par||g).add(o);return o;};
  const fus=add(new TH.CylinderGeometry(Rr,Rr,L*0.58,24,1,true),body,L*0.02,0,0);fus.rotation.z=-Math.PI/2;
  const nose=add(new TH.SphereGeometry(Rr,24,14,0,TAU,0,Math.PI/2),body,L*0.31,0,0);nose.rotation.z=-Math.PI/2;nose.scale.set(1,L*0.16/Rr,1);
  const tc=add(new TH.CylinderGeometry(Rr,Rr*0.28,L*0.24,24,1,true),body,-L*0.39,Rr*0.16,0);tc.rotation.z=-Math.PI/2;
  add(new TH.SphereGeometry(Rr*0.3,12,8),body,-L*0.51,Rr*0.16,0);
  [-1,1].forEach(sg=>{const w=add(new TH.BoxGeometry(L*0.03,Rr*0.34,Rr*0.62),glassM,L*0.395,Rr*0.42,sg*Rr*0.4);w.rotation.y=sg*0.55;w.rotation.z=-0.5;});
  const wg=new TH.SphereGeometry(1,10,8),nW=T.big?9:6;for(let k=0;k<nW;k++)[-1,1].forEach(sg=>{const w=add(wg,glassM,L*0.22-k*L*0.052,Rr*0.18,sg*Rr*0.96);w.scale.set(0.55,0.72,0.25);});
  [-1,1].forEach(sg=>{add(new TH.BoxGeometry(L*0.7,Rr*0.15,0.12),c1,-L*0.02,-Rr*0.12,sg*Rr*0.99);add(new TH.BoxGeometry(L*0.62,Rr*0.06,0.12),c2,-L*0.04,-Rr*0.3,sg*Rr*0.955);});
  const belly=add(new TH.SphereGeometry(1,18,10),wingM,-L*0.04,-Rr*0.62,0);belly.scale.set(L*0.15,Rr*0.45,Rr*0.82);
  const wy=-Rr*0.6,wpts=[[L*0.08,0],[-L*0.1,S/2],[-L*0.165,S/2],[-L*0.15,0]];
  [-1,1].forEach(sg=>{const geo=shapeGeo(wpts.map(([a,b])=>[a,b*sg]),0.6);geo.rotateX(Math.PI/2);const w=add(geo,wingM,0,wy+0.3,0);w.rotation.x=-sg*0.06;
    const wl=add(shapeGeo([[0,0],[-L*0.06,0],[-L*0.09,Rr*1.7],[-L*0.065,Rr*1.7]],0.3),c1,-L*0.1,wy+0.35+S*0.03,sg*(S/2)-0.15*sg);wl.rotation.x=sg*0.22;
    const nl=new TH.Mesh(new TH.SphereGeometry(0.35,8,6),new TH.MeshBasicMaterial({color:sg<0?0xff3030:0x30ff60}));nl.position.set(-L*0.13,wy+0.5+S*0.03,sg*S/2);g.add(nl);const q=new TH.Sprite(sg<0?GL_RED:GL_GRN);q.scale.set(5,5,1);nl.add(q);
    if(T.wing){const ez=sg*S*0.27,ey=wy-Rr*0.62,ex0=-L*0.02;const nac=add(new TH.CylinderGeometry(Rr*0.5,Rr*0.44,L*0.15,18),body,ex0,ey,ez);nac.rotation.z=-Math.PI/2;
      const lip=add(new TH.TorusGeometry(Rr*0.47,Rr*0.07,8,18),metal,ex0+L*0.075,ey,ez);lip.rotation.y=Math.PI/2;const fan=add(new TH.CylinderGeometry(Rr*0.44,Rr*0.44,0.2,16),dark,ex0+L*0.07,ey,ez);fan.rotation.z=Math.PI/2;
      add(new TH.BoxGeometry(L*0.1,Rr*0.5,0.4),body,ex0-L*0.02,ey+Rr*0.5,ez);const ec=add(new TH.ConeGeometry(Rr*0.28,L*0.04,14),metal,ex0-L*0.09,ey,ez);ec.rotation.z=Math.PI/2;return;}
    // motores traseros
    const ez=sg*Rr*1.85,ey=Rr*0.42;const nac=add(new TH.CylinderGeometry(Rr*0.6,Rr*0.52,L*0.17,18),body,-L*0.3,ey,ez);nac.rotation.z=-Math.PI/2;
    const band=add(new TH.CylinderGeometry(Rr*0.62,Rr*0.62,L*0.025,18),c1,-L*0.26,ey,ez);band.rotation.z=-Math.PI/2;
    const lip=add(new TH.TorusGeometry(Rr*0.56,Rr*0.08,8,18),metal,-L*0.215,ey,ez);lip.rotation.y=Math.PI/2;
    const fan=add(new TH.CylinderGeometry(Rr*0.52,Rr*0.52,0.2,16),dark,-L*0.218,ey,ez);fan.rotation.z=Math.PI/2;
    const ex=add(new TH.ConeGeometry(Rr*0.35,L*0.05,14),metal,-L*0.4,ey,ez);ex.rotation.z=Math.PI/2;
    add(new TH.BoxGeometry(L*0.09,Rr*0.28,Rr*0.95),body,-L*0.3,ey,sg*Rr*1.05);});
  const fH=L*0.2,fin=shapeGeo([[-L*0.33,0],[-L*0.47,fH],[-L*0.54,fH],[-L*0.5,0]],0.6);add(fin,c2,0,Rr*0.55,-0.3);
  const spts=T.wing?[[-L*0.4,0],[-L*0.48,S*0.2],[-L*0.52,S*0.2],[-L*0.5,0]]:[[-L*0.46,0],[-L*0.52,S*0.18],[-L*0.565,S*0.18],[-L*0.555,0]];[-1,1].forEach(sg=>{const geo=shapeGeo(spts.map(([a,b])=>[a,b*sg]),0.4);geo.rotateX(Math.PI/2);add(geo,T.wing?body:c2,0,T.wing?Rr*0.3:Rr*0.55+fH-0.2,0);});
  // tren
  const gear=new TH.Group();gear.name='gear';g.add(gear);const gh=Rr+2.4;
  const leg=(x,z,two)=>{const st=new TH.Mesh(new TH.CylinderGeometry(0.22,0.22,gh-Rr*0.5,8),metal);st.position.set(x,-Rr*0.5-(gh-Rr*0.5)/2+0.2,z);gear.add(st);
    for(const dz of two?[-0.45,0.45]:[0]){const w=new TH.Mesh(new TH.CylinderGeometry(0.75,0.75,0.5,14),tire);w.rotation.x=Math.PI/2;w.position.set(x,-gh+0.75,z+dz);w.castShadow=true;gear.add(w);}};
  leg(L*0.36,0,true);[-1,1].forEach(sg=>leg(-L*0.08,sg*Rr*0.9,false));
  // escalerilla integrada (lado izquierdo)
  const stair=new TH.Group();stair.name='stair';stair.position.set(L*0.26,-Rr*0.45,-Rr);g.add(stair);const drop=Rr*0.55+2.4,run=4.2,ang=Math.atan2(drop,run),ln=Math.hypot(drop,run);
  const rp=new TH.Mesh(BOXG,mat('#e9edf0'));rp.scale.set(2.4,0.3,ln);rp.rotation.x=-ang;rp.position.set(0,-drop/2,-run/2);stair.add(rp);
  for(let k=1;k<7;k++){const u=k/7,s2=new TH.Mesh(BOXG,mat('#9aa3aa'));s2.scale.set(2.2,0.12,0.5);s2.position.set(0,-drop*u+0.2,-run*u);stair.add(s2);}
  [-1.1,1.1].forEach(xx=>{const h=new TH.Mesh(BOXG,mat('#c9a24a',{metalness:.7,roughness:.3}));h.scale.set(0.12,0.12,ln);h.rotation.x=-ang;h.position.set(xx,-drop/2+1.4,-run/2);stair.add(h);});
  const door=add(new TH.BoxGeometry(2.2,Rr*0.9,0.1),dark,L*0.26,-Rr*0.05,-Rr*0.99);door.name='door';
  const bea=new TH.Mesh(new TH.SphereGeometry(0.45,8,6),new TH.MeshBasicMaterial({color:0xff2a2a}));bea.name='bea';bea.position.set(-L*0.1,Rr+0.25,0);g.add(bea);{const q=new TH.Sprite(GL_RED);q.scale.set(7,7,1);bea.add(q);}
  const ll=new TH.Mesh(new TH.SphereGeometry(0.45,8,6),new TH.MeshBasicMaterial({color:0xffffff}));ll.name='ll';ll.position.set(L*0.4,-Rr*0.7,0);g.add(ll);{const q=new TH.Sprite(GL_WHT);q.scale.set(16,16,1);ll.add(q);}
  mergeByMat(g,g,new Set([gear,stair,door]));mergeByMat(gear,gear,new Set());mergeByMat(stair,stair,new Set());
  JMT.set(key,g);return g;}
const HMT=new Map();
function heliTpl(sch){const key=sch.join();let t=HMT.get(key);if(t)return t;const g=new TH.Group();
  const B=mat(sch[0],{metalness:.35,roughness:.25}),C=mat(sch[1],{metalness:.4,roughness:.3}),gl=mat('#0d1822',{roughness:.06,metalness:.7}),dk=mat('#1d2329',{roughness:.5}),mt=mat('#9aa3aa',{metalness:.7,roughness:.3});
  const add=(geo,m,x,y,z,par)=>{const o=new TH.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;(par||g).add(o);return o;};
  add(new TH.SphereGeometry(1,20,14),B,1.5,4.6,0).scale.set(8,3.8,3.4);add(new TH.SphereGeometry(1,18,12),gl,7.2,4.8,0).scale.set(3.2,2.9,3.1);
  add(new TH.BoxGeometry(7,1.8,3.2),B,0,8.2,0);add(new TH.BoxGeometry(12,0.5,0.12),C,1,3.6,3.35);add(new TH.BoxGeometry(12,0.5,0.12),C,1,3.6,-3.35);
  [-1,1].forEach(sg=>{for(let k=0;k<3;k++)add(new TH.BoxGeometry(1.6,1.3,0.1),gl,3.2-k*2.1,5.4,sg*3.3);});
  const bm=add(new TH.CylinderGeometry(0.55,1.2,14,12),B,-11,6,0);bm.rotation.z=Math.PI/2;
  add(shapeGeo([[0,0],[-1.8,4.4],[-3.4,4.4],[-2.4,0]],0.4),C,-15.6,6.2,-0.2);add(new TH.BoxGeometry(1.4,0.25,5),B,-15.6,6.5,0);
  [-1,1].forEach(sg=>{add(new TH.BoxGeometry(13,0.5,0.5),mt,1,0.4,sg*2.8);add(new TH.BoxGeometry(0.4,2.4,0.4),mt,4,1.4,sg*2.6);add(new TH.BoxGeometry(0.4,2.4,0.4),mt,-2.4,1.4,sg*2.6);});
  const rot=new TH.Group();rot.name='rot';rot.position.set(0.4,10,0);g.add(rot);add(new TH.CylinderGeometry(0.7,0.9,1.2,10),dk,0,-0.4,0,rot);
  for(let k=0;k<5;k++){const b=new TH.Mesh(BOXG,dk);b.scale.set(13.4,0.16,1.05);b.position.set(6.9,0,0);const h=new TH.Group();h.rotation.y=k*TAU/5;h.add(b);rot.add(h);}
  const tr=new TH.Group();tr.name='tr';tr.position.set(-17.2,9.2,0.55);g.add(tr);for(let k=0;k<2;k++){const b=new TH.Mesh(BOXG,dk);b.scale.set(0.35,4.4,0.1);const h=new TH.Group();h.rotation.z=k*Math.PI/2;h.add(b);tr.add(h);}
  const bea=new TH.Mesh(new TH.SphereGeometry(0.35,8,6),new TH.MeshBasicMaterial({color:0xff2a2a}));bea.name='bea';bea.position.set(-3,9.1,0);g.add(bea);{const q=new TH.Sprite(GL_RED);q.scale.set(6,6,1);bea.add(q);}
  mergeByMat(g,g,new Set([rot,tr]));HMT.set(key,g);return g;}
const CMT=new Map();
function carTpl(type,c){const key=type+c;let t=CMT.get(key);if(t)return t;const g=new TH.Group();
  const P=mat(c,{metalness:.55,roughness:.22}),GL=mat('#0e1620',{roughness:.05,metalness:.75}),TR=mat('#121212',{roughness:.9}),CH=mat('#c9ced3',{metalness:.9,roughness:.15});
  const B=(w,h,d,m,x,y,z)=>{const o=new TH.Mesh(BOXG,m);o.scale.set(w,h,d);o.position.set(x,y+h/2,z);o.castShadow=true;g.add(o);return o;};
  const W=(x,z0,r)=>{for(const z of [z0,-z0]){const o=new TH.Mesh(CYLG,TR);o.scale.set(r,1,r);o.rotation.x=Math.PI/2;o.position.set(x,r,z);g.add(o);const h=new TH.Mesh(CYLG,CH);h.scale.set(r*0.55,1.05,r*0.55);h.rotation.x=Math.PI/2;h.position.set(x,r,z);g.add(h);}};
  const lamp=mat('#fff6d8',{emissive:col('#fff2c0'),emissiveIntensity:.9}),tail=mat('#b01818',{emissive:col('#ff2020'),emissiveIntensity:.6});
  if(type==='limo'){B(30,3,7.6,P,0,1,0);B(22,2.4,7,P,-1.5,4,0);B(22.2,1.8,7.1,GL,-1.5,4.2,0);B(30.2,0.3,7.7,CH,0,2.6,0);[-11,-5,5,11].forEach(xx=>W(xx,3.3,1.4));B(0.3,0.6,1.8,lamp,15.1,2.2,2.5);B(0.3,0.6,1.8,lamp,15.1,2.2,-2.5);B(0.3,0.6,1.6,tail,-15.1,2.2,2.5);B(0.3,0.6,1.6,tail,-15.1,2.2,-2.5);B(0.25,1.2,4,CH,15.1,1.1,0);}
  else if(type==='suv'){B(18,4,8,P,0,1,0);B(12,3,7.6,P,-1.5,5,0);B(12.2,2.2,7.7,GL,-1.5,5.3,0);B(4,0.3,7.4,GL,4.6,4.9,0);[-6,6].forEach(xx=>W(xx,3.5,1.7));B(0.3,0.7,1.8,lamp,9.1,3,2.6);B(0.3,0.7,1.8,lamp,9.1,3,-2.6);B(0.3,0.8,1.6,tail,-9.1,3,2.6);B(0.3,0.8,1.6,tail,-9.1,3,-2.6);B(0.25,1.6,5,CH,9.1,1.6,0);B(12,0.3,6,mat('#2b2f36'),-1.5,8,0);}
  else if(type==='van'){B(20,7,7.6,P,0,1,0);B(19,2,7.7,GL,-1,5.2,0);B(3,2.6,7.4,GL,9.2,4.4,0);[-6.5,6.5].forEach(xx=>W(xx,3.4,1.5));B(0.3,0.7,1.8,lamp,10.1,2.6,2.6);B(0.3,0.7,1.8,lamp,10.1,2.6,-2.6);B(20.1,0.4,7.7,mat('#c9a24a',{metalness:.7}),0,3.4,0);}
  else{B(40,7.6,8.6,P,0,0.9,0);B(40.2,2.6,8.8,GL,0,4.6,0);B(40.2,0.9,8.8,mat('#c9a24a',{metalness:.7,roughness:.3}),0,2.4,0);B(0.4,5.4,7.6,GL,20.1,2.8,0);B(40,0.5,8.2,mat('#cfd4d8'),0,8.5,0);[[-13],[13],[-7]].forEach(([xx])=>W(xx,3.9,1.8));B(0.3,0.8,1.6,lamp,20.2,2,3);B(0.3,0.8,1.6,lamp,20.2,2,-3);}
  mergeByMat(g,g,new Set());g.rotation.order='YZX';CMT.set(key,g);return g;}
let TRAINT=null;
function trainTpl(){if(TRAINT)return TRAINT;const g=new TH.Group();const W=mat('#f4f6f8',{metalness:.35,roughness:.25}),GL=mat('#0e1620',{roughness:.05,metalness:.75}),C=mat('#1f6fd1',{metalness:.3}),D=mat('#2b3036');
  [-7.2,7.2].forEach(cx=>{const B=(w,h,d,m,x,y,z)=>{const o=new TH.Mesh(BOXG,m);o.scale.set(w,h,d);o.position.set(cx+x,y+h/2,z);o.castShadow=true;g.add(o);};
    B(13.6,4.6,5.6,W,0,0.8,0);B(13.8,1.6,5.7,GL,0,2.6,0);B(13.8,0.5,5.7,C,0,1.6,0);B(13.4,0.4,5.2,D,0,0,0);B(12,0.6,4.6,mat('#c9ced3',{metalness:.6}),0,5.4,0);
    [-1,1].forEach(s=>B(1.6,3.2,0.1,GL,s*3.6,1.2,2.86));});
  [1,-1].forEach(s=>{const n=new TH.Mesh(new TH.SphereGeometry(1,16,10),W);n.scale.set(2.6,2.4,2.8);n.position.set(s*14.2,3,0);g.add(n);const w=new TH.Mesh(new TH.SphereGeometry(1,16,10),GL);w.scale.set(1.6,1.3,2.4);w.position.set(s*15.3,3.6,0);g.add(w);});
  mergeByMat(g,g,new Set());TRAINT=g;return g;}
/* palmera */
function palm(x,z,h,par){const r=rng(Math.round(x*7+z*13)),lean=(r()-0.5)*0.3;const tr=mat('#8a6a48',{roughness:.9}),lf=mat(r()<0.5?'#3f8a3a':'#4e9a3f',{roughness:.8});
  for(let k=0;k<4;k++){const c=new TH.Mesh(CYLG,tr);c.scale.set(0.75-k*0.1,h/4+0.3,0.75-k*0.1);c.position.set(x+lean*k*h/4,h/8+k*h/4,z);c.castShadow=true;par.add(c);}
  const tx=x+lean*h,ty=h,fm=FRONDM(r()<0.5?'#4f8f3a':'#5e9c42');for(let k=0;k<12;k++){const a=k*TAU/12+r()*0.4,o=new TH.Mesh(FRONDG,fm);o.position.set(tx,ty-0.3,z);o.rotation.y=a;const L=7.5+r()*2.5;o.scale.set(L,4+r()*3,L*0.36);par.add(o);}
  const nut=new TH.Mesh(SPHG,mat('#5a3d22'));nut.scale.setScalar(0.7);nut.position.set(tx,ty-0.6,z+0.5);par.add(nut);}
function treeB(x,z,h,par,c){const r=rng(Math.round(x*3+z*7)),t=new TH.Mesh(CYLG,mat('#6b4a2e',{roughness:.95}));t.scale.set(0.6,h*0.5,0.6);t.position.set(x,h*0.25,z);t.castShadow=true;par.add(t);const m=CROWNM(c||'#3f7f39');
  [[0,0.66,0,0.42],[0.24,0.56,0.2,0.32],[-0.22,0.6,-0.18,0.33],[0.04,0.86,-0.06,0.3],[-0.1,0.52,0.26,0.27]].forEach(([a,b,cz,s])=>{const o=new TH.Mesh(CROWNG,m);const ss=h*s*(0.9+r()*0.2);o.scale.set(ss,ss*0.92,ss);o.rotation.y=r()*TAU;o.position.set(x+a*h,h*b,z+cz*h);o.castShadow=true;o.receiveShadow=true;par.add(o);});}
function treeOld(x,z,h,par,c){const t=new TH.Mesh(CYLG,mat('#6b4a2e'));t.scale.set(0.7,h*0.45,0.7);t.position.set(x,h*0.22,z);par.add(t);[[0,0.72,0,0.48],[0.3,0.6,0.25,0.36],[-0.28,0.62,-0.2,0.36],[0.05,0.9,-0.1,0.3]].forEach(([a,b,cz,s])=>{const m=new TH.Mesh(SPHG,mat(c||'#3f7f39',{roughness:.9}));m.scale.set(h*s,h*s*0.9,h*s);m.position.set(x+a*h,h*b,z+cz*h);m.castShadow=true;par.add(m);});}
/* ---------- escenario fijo del norte ---------- */
let FBROOF=null,FBEM=null,FBWATER=null,FBFOUNT=null,FBGLOW=[];
function buildFbo(W){const F=G.fbo;if(!F)return;FBROOF=null;FBGLOW=[];FBFOUNT=null;FBFOUNT2=null;
  FBEM=FBEM||new TH.MeshStandardMaterial({color:col('#fff1d0'),emissive:col('#ffd890'),emissiveIntensity:0,roughness:.4});
  // lago y parque (siempre)
  {const [lx,lz,rx,rz]=FB.lake;const sh=new TH.Shape();for(let i=0;i<=48;i++){const a=i/48*TAU,k=1+Math.sin(a*3)*0.03+Math.cos(a*5)*0.025;const px=lx+Math.cos(a)*rx*k,pz=lz+Math.sin(a)*rz*k;i?sh.lineTo(px,-pz):sh.moveTo(px,-pz);}
   if(!FBWATER){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#2f6f8c';x.fillRect(0,0,128,128);for(let i=0;i<260;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*0.16})`;x.fillRect(Math.random()*128,Math.random()*128,3+Math.random()*9,1);}
     FBWATER=new TH.CanvasTexture(c);FBWATER.wrapS=FBWATER.wrapT=TH.RepeatWrapping;FBWATER.repeat.set(0.03,0.03);FBWATER.encoding=TH.sRGBEncoding;}
   const wm=new TH.Mesh(new TH.ShapeGeometry(sh,1),new TH.MeshStandardMaterial({map:FBWATER,roughness:.06,metalness:.55,color:col('#ffffff'),normalMap:WATN,normalScale:new TH.Vector2(0.45,0.45)}));wm.rotation.x=-Math.PI/2;wm.position.y=0.25;wm.receiveShadow=true;W.add(wm);
   gbox(4,1,40,'#8a6a48',lx+rx-14,0.6,lz-20,W);for(let k=0;k<5;k++)cyl(0.4,1.4,'#6b4a2e',lx+rx-16+(k%2)*4,0,lz-38+k*8,W);
   for(let i=0;i<22;i++){const a=i/22*TAU+0.1;const px=lx+Math.cos(a)*(rx+36),pz=lz+Math.sin(a)*(rz+34);if(i%3===0)palm(px,pz,16+(i%4)*2,W);else treeB(px,pz,13+(i%5)*2,W,i%2?'#3f7f39':'#4c8c3a');}
   for(let i=0;i<14;i++){const a=i/14*TAU;cyl(0.3,4,'#4a6a2a',lx+Math.cos(a)*(rx-2),0,lz+Math.sin(a)*(rz-2),W);}
   const fj=new TH.Group();fj.position.set(lx,0,lz);W.add(fj);FBFOUNT=fj;}
  // bosquecillos en el verde libre
  {const r=rng(77);for(let i=0;i<60;i++){const px=-150+r()*1330,pz=-846+r()*38;if(F.on&&px>420&&px<900)continue;if(px>-120&&px<-60)continue;treeB(px,pz,12+r()*7,W,['#3f7f39','#4c8c3a','#2f6b33','#5a9a44'][i%4]);}}
  if(!F.on){sign('TERRENO EJECUTIVO · DISPONIBLE',640,6,-386,W,'#1b1b1b','#c9a24a',5);[[90,-390],[1190,-390],[90,-830],[1190,-830]].forEach(([a,b])=>cyl(0.5,4,'#f2b705',a,0,b,W));return;}
  const r1=fbR1();
  // luces de borde de la pista y PAPI
  const hw=F.rwy>=3?23:17;for(let X=FB.r0;X<=r1;X+=40)[-1,1].forEach(s=>{gbox(0.8,0.6,0.8,FBEM,X,0,FB.rz+s*(hw+2),W);});
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)gbox(1.6,0.8,1.6,'#3a3f45',r1-140+k*3,0,FB.rz-(hw+11)*s,W);});
  for(let k=-3;k<=3;k++){gbox(0.8,0.6,0.8,mat('#40ff70',{emissive:col('#20ff50'),emissiveIntensity:.8}),r1+12,0,FB.rz+k*5,W);gbox(0.8,0.6,0.8,mat('#ff3a3a',{emissive:col('#ff2020'),emissiveIntensity:.8}),FB.r0-12,0,FB.rz+k*5,W);}
  {cyl(0.35,9,'#59636c',r1-60,0,FB.rz-34,W);const ws=new TH.Mesh(new TH.ConeGeometry(1.1,6,10,1,true),mat('#ff7a1a',{side:TH.DoubleSide}));ws.rotation.z=Math.PI/2;ws.position.set(r1-63,8.4,FB.rz-34);W.add(ws);}
  // ---- terminal FBO ----
  const X0=FB.tx0,X1=FB.tx1,Z0=FB.tz0,Z1=FB.tz1,XM=(X0+X1)/2,ZM=(Z0+Z1)/2,WD=X1-X0,DP=Z1-Z0;
  const stone=mat('#d8d2c6',{roughness:.6}),white=mat('#f4f4f2',{roughness:.35}),wood=mat('#9a6a42',{roughness:.6}),dkm=mat('#aab2b9',{metalness:.7,roughness:.3}),gold=mat('#c9a24a',{metalness:.8,roughness:.25});
  gbox(WD+8,1.2,DP+8,stone,XM,0,ZM,W);
  // fachadas de vidrio con montantes
  [[Z0,0],[Z1,0]].forEach(([zz])=>{gbox(WD,8.6,0.3,GLASS,XM,1.2,zz,W);for(let X=X0;X<=X1+0.1;X+=12)gbox(0.22,8.6,0.4,dkm,X,1.2,zz,W);gbox(WD,0.5,0.6,dkm,XM,9.6,zz,W);});
  [X0,X1].forEach(xx=>{gbox(0.3,8.6,DP,GLASS,xx,1.2,ZM,W);for(let Z=Z0;Z<=Z1;Z+=12)gbox(0.4,8.6,0.22,dkm,xx,1.2,Z,W);});
  // claristorio: vidrio alto y celosía de madera hacia el lado tierra
  [Z0,Z1].forEach(zz=>{gbox(WD,7.4,0.3,GLASS,XM,10.2,zz,W);for(let X=X0;X<=X1+0.1;X+=24)gbox(0.22,7.4,0.4,dkm,X,10.2,zz,W);});[X0,X1].forEach(xx=>gbox(0.3,7.4,DP,GLASS,xx,10.2,ZM,W));
  for(let X=X0+2;X<=X1-2;X+=2.4)gbox(0.5,7.4,1,wood,X,10.2,Z0-0.8,W);
  [Z0+1.6,Z1-1.6].forEach(zz=>{gbox(WD-4,0.3,0.9,FBEM,XM,17.2,zz,W);for(let X=X0+20;X<X1;X+=40)fbGlow(X,16.4,zz,10,'#ffe2b0');});
  // gran cubierta blanca con lucernario y alero (se oculta al acercar la cámara para ver el interior)
  FBROOF=new TH.Group();FBROOF.userData.nobake=true;W.add(FBROOF);const W0=W;W=FBROOF;
  {const y=17.6,ox0=X0-22,ox1=X1+22,oz0=Z0-26,oz1=Z1+20;const sk=[X0+40,X1-40,Z0+8,Z1-8];
   gbox(sk[1]-sk[0],0.3,sk[3]-sk[2],mat('#cfe6f2',{transparent:true,opacity:.28,roughness:.05,depthWrite:false}),(sk[0]+sk[1])/2,y+0.6,(sk[2]+sk[3])/2,W).castShadow=false;
   gbox(ox1-ox0,1.4,sk[2]-oz0,white,(ox0+ox1)/2,y,(oz0+sk[2])/2,W);gbox(ox1-ox0,1.4,oz1-sk[3],white,(ox0+ox1)/2,y,(sk[3]+oz1)/2,W);
   gbox(sk[0]-ox0,1.4,sk[3]-sk[2],white,(ox0+sk[0])/2,y,(sk[2]+sk[3])/2,W);gbox(ox1-sk[1],1.4,sk[3]-sk[2],white,(sk[1]+ox1)/2,y,(sk[2]+sk[3])/2,W);
   for(let X=sk[0];X<=sk[1];X+=10)gbox(0.5,0.6,sk[3]-sk[2],dkm,X,y+0.8,(sk[2]+sk[3])/2,W);
   gbox(ox1-ox0,0.35,0.5,FBEM,(ox0+ox1)/2,y-0.2,oz0,W);gbox(ox1-ox0,0.35,0.5,FBEM,(ox0+ox1)/2,y-0.2,oz1,W);
   for(let X=ox0+8;X<ox1;X+=40){cyl(0.55,y,'#e9ecef',X,0,oz0+2,W);cyl(0.55,y,'#e9ecef',X,0,oz1-2,W);}
   sign('PISTA LIBRE · EJECUTIVO',XM,y+3.4,oz0-0.4,W,'#141414','#c9a24a',4.2).rotation.y=Math.PI;sign('FBO · AVIACIÓN PRIVADA',XM,y+3.2,oz1+0.4,W,'#141414','#c9a24a',3.6);
   gbox(60,2.6,0.6,dkm,XM,y+1.6,oz0+0.3,W);gbox(60,2.6,0.6,dkm,XM,y+1.6,oz1-0.3,W);}
  W=W0;
  // marquesina de llegada (porte-cochère)
  {gbox(170,1.2,24,white,600,10.4,-712,W);for(const X of [520,560,640,680])cyl(0.7,10.4,'#e9ecef',X,0,-722,W);gbox(170,0.3,0.5,FBEM,600,10.2,-724,W);gbox(14,0.12,22,mat('#7a1f2b'),600,0.05,-692,W);}
  // interior: recepción, seguridad, aduana, salas, bar
  {gbox(26,3.6,3,white,560,1.2,-670,W);gbox(26.2,0.4,3.2,gold,560,4.8,-670,W);gbox(26,3.6,3,white,644,1.2,-670,W);gbox(26.2,0.4,3.2,gold,644,4.8,-670,W);
   STAFF.push({x:556,z:-673,h:Math.PI/2,lk:FSTAFF(1)},{x:648,z:-673,h:Math.PI/2,lk:FSTAFF(2)});
   gbox(1.2,8,1.2,'#9aa3aa',594,1.2,-650,W);gbox(1.2,8,1.2,'#9aa3aa',606,1.2,-650,W);gbox(13,1.4,1.4,'#59636c',600,9,-650,W);gbox(5,3,14,'#3d6f8f',612,1.2,-650,W);STAFF.push({x:592,z:-656,h:0,lk:Object.assign(staffLook(9,'#1e2b45','#1e2b45'),{})});
   if(F.cus){gbox(10,5,6,'#4b5a32',690,1.2,-654,W);gbox(10.2,0.5,6.2,gold,690,6.2,-654,W);STAFF.push({x:690,z:-657,h:Math.PI/2,lk:staffLook(11,'#4b5a32','#4b5a32')});}
   const P=fbSeats();P.forEach(([sx,sz,sh,se],i)=>{const c=i%2?['#8a6a48','#6e5236']:['#d9c9a8','#c2ae8a'];
     if(se){const Y=se;gbox(7,2,5,'#ece4d4',sx,Y,sz-0.6,W);gbox(7,3,1.2,'#d8ccb4',sx,Y+1.4,sz-3.4,W);gbox(1,2.2,5,'#d8ccb4',sx-3.5,Y+1.4,sz-0.6,W);gbox(1,2.2,5,'#d8ccb4',sx+3.5,Y+1.4,sz-0.6,W);gbox(3,1.4,2.2,'#1b1b1b',sx,Y,sz+3.6,W);gbox(3.2,0.2,2.4,gold,sx,Y+1.4,sz+3.6,W);return;}
     gbox(7,2.2,5,c[0],sx,1.2,sz+0.6,W);gbox(7,3.2,1.2,c[1],sx,2.6,sz+3.4,W);gbox(1,2.4,5,c[1],sx-3.5,2.6,sz+0.6,W);gbox(1,2.4,5,c[1],sx+3.5,2.6,sz+0.6,W);
     gbox(9,0.08,9,i%2?'#7a1f2b':'#2b3a4a',sx,1.25,sz-1.5,W);gbox(3.4,1.6,2.4,'#1b1b1b',sx,1.3,sz-4.6,W);gbox(3.6,0.2,2.6,gold,sx,2.9,sz-4.6,W);});
   if(F.f2){const Y=FB2Y,fl=mat('#efe9de',{roughness:.18,metalness:.08});
     gbox(404,0.8,17,white,600,Y-0.8,-623.5,W);gbox(404,0.06,17,fl,600,Y,-623.5,W);gbox(11,0.8,11,white,735.5,Y-0.8,-636,W);gbox(11,0.06,11,fl,735.5,Y,-636,W);
     gbox(328,3,0.25,GLASS,566,Y,-632,W);gbox(60,3,0.25,GLASS,772,Y,-632,W);gbox(0.25,3,11,GLASS,741,Y,-636,W);gbox(11,3,0.25,GLASS,735.5,Y,-641.4,W);
     gbox(328,0.22,0.45,gold,566,Y+3,-632,W);gbox(60,0.22,0.45,gold,772,Y+3,-632,W);gbox(404,0.3,0.5,FBEM,600,Y-1.1,-632,W);
     for(const X of [420,500,580,660,780])cyl(0.6,Y-2,'#e9ecef',X,1.2,-631,W);
     {const th=Math.atan2(Y-1.2,18),len=Math.hypot(18,Y-1.2);const m=new TH.Mesh(BOXG,white);m.scale.set(len,0.8,5.4);m.rotation.z=th;m.position.set(721,(1.2+Y)/2-0.5,-637);m.castShadow=true;W.add(m);
      for(let k=0;k<12;k++)gbox(1.5,0.3,5,wood,712.75+k*1.5,1.2+k*(Y-1.2)/12,-637,W);
      [-2.8,2.8].forEach(dz=>{const g=new TH.Mesh(BOXG,GLASS);g.scale.set(len,2.4,0.15);g.rotation.z=th;g.position.set(721,(1.2+Y)/2+1.4,-637+dz);W.add(g);const h=new TH.Mesh(BOXG,gold);h.scale.set(len,0.2,0.3);h.rotation.z=th;h.position.set(721,(1.2+Y)/2+2.6,-637+dz);W.add(h);});}
     gbox(3,4,15,'#2b3036',405,Y,-623,W);gbox(3.3,0.3,15.3,gold,405,Y+4,-623,W);gbox(1,7,15,'#4a3424',400.6,Y,-623,W);for(let k=0;k<6;k++)gbox(0.5,1.4,0.5,['#2e8b57','#c9a24a','#7a1f2b','#e9ecef'][k%4],401.2,Y+4.4,-629+k*2.4,W);
     STAFF.push({x:402.6,z:-621,h:0,el:Y,lk:FSTAFF(7)});
     for(const X of [450,560,650,770]){cyl(1.1,1.6,'#e9ecef',X,Y,-616.5,W);const m=new TH.Mesh(SPHG,mat('#3f8a3a',{roughness:.9}));m.scale.set(1.8,2.6,1.8);m.position.set(X,Y+3.6,-616.5);W.add(m);}
     sign('SKY LOUNGE',600,Y+4.6,-632.3,W,'#141414','#c9a24a',2.2).rotation.y=Math.PI;}
   gbox(30,4.2,3,'#2b3036',480,1.2,-664,W);gbox(30.2,0.4,3.2,gold,480,5.4,-664,W);gbox(30,7,0.6,FBEM,480,5.6,-667,W);STAFF.push({x:480,z:-667,h:Math.PI/2,lk:staffLook(12,'#141414','#141414')});
   for(const [px,pz] of [[400,-628],[580,-628],[620,-628],[800,-628],[400,-676],[800,-676]]){cyl(1.4,2.6,'#e9ecef',px,1.2,pz,W);const m=new TH.Mesh(SPHG,mat('#3f8a3a',{roughness:.9}));m.scale.set(2.4,3.2,2.4);m.position.set(px,6.4,pz);W.add(m);}
   if(F.lv>=2){gbox(26,1.2,20,'#d8d2c6',800,1.2,-660,W);gbox(23,0.2,17,mat('#3ba3c4',{roughness:.05,metalness:.3,transparent:true,opacity:.85}),800,2.45,-660,W);for(let k=0;k<3;k++)gbox(3,1,6,'#f4f4f2',786+k*7,1.2,-646,W);}
   if(F.lv>=3){for(let k=0;k<4;k++){gbox(0.5,8,16,white,412+k*12,1.2,-660,W);gbox(8,1.2,5,'#e9e3d6',418+k*12,1.2,-664,W);}}
   for(const xx of [470,600,730]){gbox(14,0.3,6,white,xx,9,Z1+4,W);gbox(12,8,0.2,mat('#cfe6f2',{transparent:true,opacity:.35,depthWrite:false}),xx,1.2,Z1+0.2,W);}
   STAFF.push({x:597,z:-608,h:-Math.PI/2,lk:GUARD(31)},{x:603,z:-608,h:-Math.PI/2,lk:GUARD(32)});}
  // palmeras del bulevar, glorieta con fuente y estacionamiento
  for(let Z=-848;Z<-828;Z+=12){palm(579,Z,16,W);palm(621,Z,16,W);}
  for(let X=380;X<=820;X+=40){if(Math.abs(X-458)<16||Math.abs(X-712)<16||X>=720)continue;palm(X,-736,15+(X%80?2:0),W);}
  {cyl(14,1.2,'#d8d2c6',600,0,-792,W);const wd=new TH.Mesh(new TH.CylinderGeometry(13,13,0.2,32),new TH.MeshStandardMaterial({map:FBWATER,roughness:.05,metalness:.5}));wd.position.set(600,1.2,-792);W.add(wd);cyl(3,3,'#d8d2c6',600,1.2,-792,W);
   const fj=new TH.Group();fj.position.set(600,0,-792);W.add(fj);FBFOUNT2=fj;for(let i=0;i<6;i++){const a=i/6*TAU;palm(600+Math.cos(a)*17,-792+Math.sin(a)*17,13,W);}}
  {const r=rng(5);for(let i=0;i<16;i++){const px=736+(i%8)*18,pz=i<8?-776:-738;carMesh(pick(['#0e0f11','#c9a24a','#8a1f1f','#f4f4f4','#1b2a3a','#5a6570']),px,pz,i<8?Math.PI/2:-Math.PI/2,W,r);}}
  // faroles
  for(let X=-190;X<450;X+=60){cyl(0.4,12,'#59636c',X,0,-779.5,W);gbox(1.4,0.6,3,FBEM,X,12,-781.5,W);fbGlow(X,12,-782,9);POOLP.push([X,-783,17]);}
  for(let Z=-840;Z<-760;Z+=30){cyl(0.4,12,'#59636c',620,0,Z,W);gbox(1.4,0.6,3,FBEM,620,12,Z,W);fbGlow(620,12,Z,9);POOLP.push([620,Z,17]);}
  // mástiles de iluminación de plataforma
  for(const X of [200,480,760,960]){cyl(1,34,'#7d868d',X,0,-606,W);gbox(8,2,3,'#3a3f45',X,34,-606,W);gbox(7,0.8,2,FBEM,X,33.4,-604.8,W);fbGlow(X,33,-603,28);POOLP.push([X,-575,48]);}
  // hangares
  for(let i=0;i<F.hang;i++){const hx=FB.hang[i],hz=(FB.hz0+FB.hz1)/2,w=76,d=FB.hz1-FB.hz0;gbox(w,10,d,'#c9ced3',hx,0,hz,W);
    const rg=new TH.Group();rg.position.set(hx,10,hz);rg.scale.set(1,0.32,1);W.add(rg);const roof=new TH.Mesh(new TH.CylinderGeometry(w/2,w/2,d+2,28,1,true,Math.PI/2,Math.PI),mat('#9aa3aa',{metalness:.55,roughness:.35,side:TH.DoubleSide}));roof.rotation.x=Math.PI/2;roof.castShadow=true;rg.add(roof);
    gbox(w*0.42,9,0.6,'#7d868d',hx-w*0.27,0,FB.hz1+0.4,W);gbox(w*0.12,9,0.6,'#7d868d',hx+w*0.4,0,FB.hz1+0.4,W);gbox(w,1.4,1,'#2b3036',hx,9.6,FB.hz1+0.4,W);
    sign('HANGAR '+(i+1),hx,12.2,FB.hz1+1,W,'#141414','#c9a24a',2.6);
    const jt=bizjetTpl(JT[i?'GL7T':'G650'],JSCH[i?2:0]).clone();jt.position.set(hx+10,(Math.max(1.6,JT[i?'GL7T':'G650'].len*PSCALE*0.05)+2.4)*0.62,hz+4);jt.rotation.y=-Math.PI/2;jt.scale.setScalar(0.62);jt.traverse(o=>o.userData.shared=true);const st=jt.getObjectByName('stair');if(st)st.visible=false;W.add(jt);}
  // helipuertos: luces perimetrales, reflectores, manga de viento y pasillo cubierto
  if(F.heli){FB.heli.slice(0,F.heli>=2?4:2).forEach(([hx,hz])=>{for(let k=0;k<16;k++){const a=k/16*TAU;gbox(0.7,0.5,0.7,mat('#40ff70',{emissive:col('#20ff50'),emissiveIntensity:.9}),hx+Math.cos(a)*24,0,hz+Math.sin(a)*24,W);}
      fbGlow(hx-26,1,hz-26,6,'#40ff70');fbGlow(hx+26,1,hz+26,6,'#40ff70');});
    cyl(0.35,8,'#59636c',1150,0,-560,W);{const ws=new TH.Mesh(new TH.ConeGeometry(1,5.5,10,1,true),mat('#ff7a1a',{side:TH.DoubleSide}));ws.rotation.z=Math.PI/2;ws.position.set(1147,7.4,-560);W.add(ws);}
    gbox(270,0.6,11,white,955,11.5,-641,W);gbox(270,0.3,0.6,FBEM,955,11.2,-641,W);for(let X=830;X<1090;X+=24){cyl(0.4,11.5,'#e9ecef',X,0,-646.5,W);cyl(0.4,11.5,'#e9ecef',X,0,-635.5,W);}}
  // tren ligero: viga, pilares, estaciones y pasarelas de vidrio
  if(F.apm){const P=fbGuide(),y=FB.gy;for(let i=1;i<P.p.length;i++){const a=P.p[i-1],b=P.p[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<0.1)continue;const m=new TH.Mesh(BOXG,mat('#d8dde2',{roughness:.5}));m.scale.set(len+0.6,1.6,6.2);m.position.set((a[0]+b[0])/2,y-1.6,(a[1]+b[1])/2);m.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);m.castShadow=true;W.add(m);}
    for(let s=20;s<P.len-10;s+=36){const q=fbAt(P,s);cyl(1.4,y-1.6,'#c9ced3',q[0],0,q[1],W);gbox(5,1,4,'#b8bec4',q[0],y-2.6,q[1],W);}
    const st=(cx,tz,len,ex,ez)=>{gbox(len,1,12,'#cfd4d8',cx,y-1.6,tz+9.2,W);gbox(len,0.6,19,white,cx,y+7.4,tz+5.6,W);gbox(len,7,0.25,GLASS,cx,y,tz+15.2,W);for(let X=cx-len/2;X<=cx+len/2;X+=8){cyl(0.4,7.4,'#e9ecef',X,y,tz+15,W);cyl(0.5,y-1.6,'#c9ced3',X,0,tz+12,W);}
      cyl(3.4,y+8,GLASS,ex,0,ez,W).castShadow=false;cyl(1.1,y+8,'#c9ced3',ex,0,ez,W);cyl(3.7,0.6,'#59636c',ex,y+8,ez,W);gbox(len,0.25,0.6,FBEM,cx,y+7.2,tz+14.6,W);};
    const sx=fbMainSX();st(sx,247,50,sx+16,262);sign('🚝 TREN · TERMINAL EJECUTIVA',sx,y+10,262.6,W,'#14311f','#c9a24a',1.6);
    st(FB.stn[0],FB.stn[1],56,392,-670);
    // pasarela de vidrio del FBO
    {const a=[350,-692],b=[392,-670],len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=-Math.atan2(b[1]-a[1],b[0]-a[0]);const tube=(h,c,yy)=>{const m=new TH.Mesh(BOXG,typeof c==='string'?mat(c):c);m.scale.set(len,h,6);m.position.set((a[0]+b[0])/2,yy,(a[1]+b[1])/2);m.rotation.y=ang;W.add(m);return m;};
     tube(0.6,'#cfd4d8',y-0.6);tube(6.6,GLASS,y+3.3).castShadow=false;tube(0.5,'#e9ecef',y+6.8);}}
  // pista nivel 2: ILS, luces de aproximación, eje y localizador
  if(F.rwy>=2){for(let X=FB.r0+20;X<r1;X+=20)gbox(0.5,0.15,0.5,FBEM,X,0,FB.rz,W);
    for(let k=1;k<=10;k++){const X=r1+14+k*26,h=1.2+k*0.15;cyl(0.3,h,'#888',X,0,FB.rz,W);gbox(0.5,0.5,12,'#555',X,h,FB.rz,W);for(let j=-2;j<=2;j++)gbox(0.6,0.5,0.6,FBEM,X,h+0.5,FB.rz+j*2.6,W);if(k%3===0)fbGlow(X,h+1.4,FB.rz,10,'#fff2c8');}
    [-1,1].forEach(sg=>{for(let k=0;k<4;k++)fbGlow(r1-140+k*3,1.8,FB.rz-(hw+11)*sg,4,k<2?'#ffffff':'#ff3030');});
    for(let j=-5;j<=5;j++){gbox(0.4,3.4,0.4,'#c4c8cc',FB.r0-60,0,FB.rz+j*3,W);gbox(0.3,0.3,2,'#c4c8cc',FB.r0-60,3.4,FB.rz+j*3,W);}gbox(4,3.6,3.4,'#e9ecef',FB.r0-68,0,FB.rz+22,W);}
  // torre de control ejecutiva
  if(F.twr){const tx=985,tz=-672;cyl(4,32,'#d8dde2',tx,0,tz,W);cyl(5.6,1,'#59636c',tx,32,tz,W);const cab=new TH.Mesh(new TH.CylinderGeometry(7.4,6,6,8),GLASS);cab.position.set(tx,36,tz);W.add(cab);
    cyl(7.8,1.2,'#e9ecef',tx,39,tz,W);cyl(0.25,8,'#59636c',tx,40.2,tz,W);fbGlow(tx,48.4,tz,5,'#ff3030');gbox(18,6,12,'#e9ecef',tx,0,tz+8,W);gbox(18.2,0.6,12.2,'#c9a24a',tx,6,tz+8,W);sign('TWR · CONTROL',tx,3.4,tz+14.2,W,'#141414','#c9a24a',1.4);}
  // depósito de combustible
  if(F.fuel){for(let k=0;k<3;k++){const fx=1018+k*32,fz=-738;cyl(12,13,'#f2f4f5',fx,0,fz,W);cyl(12.3,0.8,'#c9a24a',fx,10,fz,W);cyl(12.4,0.6,'#9aa3aa',fx,13,fz,W);gbox(1,13,1,'#9aa3aa',fx+11.5,0,fz,W);}
    gbox(112,2,0.8,'#b8bec4',1050,0,-758,W);gbox(112,2,0.8,'#b8bec4',1050,0,-718,W);gbox(0.8,2,40,'#b8bec4',994,0,-738,W);gbox(0.8,2,40,'#b8bec4',1106,0,-738,W);
    gbox(100,0.8,0.8,'#7d868d',1050,3,-721,W);sign('JET A-1',1050,8,-717.4,W,'#141414','#f2b705',2.4);}
  // centro de mantenimiento
  if(F.mro){const mx=180,mz=-670;gbox(140,14,36,'#d8dde2',mx,0,mz,W);gbox(142,1,38,'#9aa3aa',mx,14,mz,W);gbox(64,12,0.6,'#2b3036',mx+24,0,mz+18.2,W);for(let X=mx-66;X<mx+70;X+=12)gbox(0.5,14,0.6,'#9aa3aa',X,0,mz+18.1,W);
    for(let X=mx-60;X<mx+70;X+=20)gbox(8,0.3,30,mat('#cfe6f2',{transparent:true,opacity:.5}),X,15,mz,W);sign('MANTENIMIENTO · MRO',mx-36,9,mz+18.7,W,'#141414','#c9a24a',2.4);}
  // catering gourmet
  if(F.cat){const cx=905,cz=-690;gbox(84,10,36,'#f4f6f8',cx,0,cz,W);gbox(84.4,1.4,36.4,'#d6343a',cx,8,cz,W);gbox(40,6,0.6,'#3a3f45',cx-10,0,cz+18.2,W);gbox(84,1,4,'#9aa3aa',cx,4,cz+19.6,W);
    sign('CATERING GOURMET',cx+22,6.4,cz+18.7,W,'#d6343a','#ffffff',1.8);for(let k=0;k<2;k++){const tx=cx-22+k*16,tz=cz+28;gbox(8,6,12,'#f4f6f8',tx,2,tz-2,W);gbox(8.2,1,12.2,'#d6343a',tx,7,tz-2,W);gbox(7,4.2,4,'#e9edf0',tx,0.8,tz+6,W);}}
  // estacionamiento VIP de dos pisos con valet
  if(F.park){const x0=724,x1=880,z0=-790,z1=-724;gbox(x1-x0,0.9,z1-z0,'#b8bec4',(x0+x1)/2,9,(z0+z1)/2,W);for(let X=x0+6;X<=x1;X+=25)for(const Z of [z0+3,z1-3,(z0+z1)/2])cyl(0.9,9,'#c9ced3',X,0,Z,W);
    gbox(x1-x0,1.4,0.6,'#e9ecef',(x0+x1)/2,9.9,z0,W);gbox(x1-x0,1.4,0.6,'#e9ecef',(x0+x1)/2,9.9,z1,W);gbox(0.6,1.4,z1-z0,'#e9ecef',x0,9.9,(z0+z1)/2,W);gbox(0.6,1.4,z1-z0,'#e9ecef',x1,9.9,(z0+z1)/2,W);
    const rp=new TH.Mesh(BOXG,mat('#9aa3aa'));rp.scale.set(44,0.8,10);rp.position.set(x0+30,4.6,z1+7);rp.rotation.z=-0.21;rp.castShadow=true;W.add(rp);
    const r=rng(9);for(let i=0;i<14;i++)carMesh(pick(['#0e0f11','#c9a24a','#8a1f1f','#f4f4f4','#1b2a3a','#5a6570','#c0392b']),736+(i%7)*21,i<7?-772:-742,i<7?Math.PI/2:-Math.PI/2,W,r,9.9);
    sign('VALET · ESTACIONAMIENTO VIP',(x0+x1)/2,13.6,z1+0.5,W,'#141414','#c9a24a',2.6);for(let k=0;k<3;k++)STAFF.push({x:700+k*5,z:-694,h:-Math.PI/2,lk:Object.assign(staffLook(40+k,'#141414','#c9a24a'),{pants:'#141414'})});}
  // plataforma de enlace: letreros de rodaje
  if(F.link){[[FB.lnk+16,-120,'L ↑ FBO'],[FB.lnk+16,-420,'L ↗ E1-E8'],[160,-458,'← L PRINCIPAL']].forEach(([a,b,t])=>{gbox(9,3,0.8,'#1b1b1b',a,0.6,b,W);sign(t,a,2.2,b+0.45,W,'#1b1b1b','#f2c230',1.6);});}
}
let FBFOUNT2=null;
function fbGlow(x,y,z,s,c){const sp=new TH.Sprite(glowMat(c||'#ffd890'));sp.scale.set(s,s,1);sp.position.set(x,y,z);OBJG.add(sp);FBGLOW.push(sp);}
function carMesh(c,x,z,h,W,r,y){const P=mat(c,{metalness:.55,roughness:.22});const g=new TH.Group();g.position.set(x,y||0,z);g.rotation.y=-h;W.add(g);gbox(16,3,7.4,P,0,1,0,g);gbox(8.4,2.6,6.8,P,-1,4,0,g);gbox(8.6,2,6.9,'#0e1620',-1,4.2,0,g);}
/* ---------- objetos móviles ---------- */
const JM=new Map(),HM=new Map(),FCM=new Map();let TRAIN=null;
function fbSync(dt){const n=nightFactor();FBGLOW.forEach(q=>q.visible=n>0.25);if(FBEM)FBEM.emissiveIntensity=0.15+n*1.4;if(FBWATER){FBWATER.offset.x+=dt*0.002;FBWATER.offset.y+=dt*0.0013;}
  [FBFOUNT,FBFOUNT2].forEach((f,k)=>{if(f&&f.parent)for(let i=0;i<5;i++)bit(f.position.x+Math.cos(G.t*0.8+i*1.3)*(k?3.6:1),k?4+i*1.6+Math.sin(G.t*3+i)*0.5:1+i*1.4,f.position.z+Math.sin(G.t*0.8+i*1.3)*(k?3.6:1),1.2-i*0.12,1.6,1.2-i*0.12,'#dff3ff');});
  const seen=new Set();
  for(const j of G.pj){let e=JM.get(j.id);if(!e){const g=bizjetTpl(j.T,j.sch).clone();scene.add(g);e={g,stair:g.getObjectByName('stair'),gear:g.getObjectByName('gear'),bea:g.getObjectByName('bea'),ll:g.getObjectByName('ll'),door:g.getObjectByName('door')};JM.set(j.id,e);}seen.add(j.id);
    const Rr=jetR(j);e.g.position.set(j.x,Rr+2.4+(j.alt||0),j.z);let pitch=0;if(j.st==='tko'&&j.spd>48)pitch=Math.min(0.18,(j.spd-48)*0.01);if(j.st==='app')pitch=0.06;e.g.userData.p=lerp(e.g.userData.p||0,pitch,0.08);e.g.rotation.set(0,-j.hdg,e.g.userData.p);
    if(e.stair)e.stair.visible=j.st==='park';if(e.door)e.door.visible=j.st!=='park';if(e.gear)e.gear.visible=!(j.alt>40);if(e.bea)e.bea.visible=j.st!=='park'&&Math.floor(performance.now()/500)%2===0;if(e.ll)e.ll.visible=['app','roll','tko','line'].includes(j.st);
    if(j.st==='park'){const d=jetDoor(j),dx=clamp(d[0]-3,FB.tx0+14,FB.tx1-14);bit((d[0]-3+d[0]-3)/2,0.06,(d[1]+FB.tz1+4)/2,2.6,0.12,Math.abs(FB.tz1+4-d[1]),'#a3172a');
      if(Math.abs(dx-(d[0]-3))>1)bit((dx+d[0]-3)/2,0.06,FB.tz1+5,Math.abs(dx-(d[0]-3))+2.6,0.12,2.6,'#a3172a');
      for(let z=d[1]-2;z>FB.tz1+6;z-=7){bit(d[0]-5,0,z,0.35,2.4,0.35,'#c9a24a');bit(d[0]-1,0,z,0.35,2.4,0.35,'#c9a24a');}
      person3(d[0]-6,d[1]+2,0,FSTAFF(j.id),0,null,false,false,'hand',0);
      const it=j.gi&&j.gi.cater;if(it&&it.body){let lift=0;if(gOn(it)){const u=gPh(it);lift=u<0.15?u/0.15:u>0.85?(1-u)/0.15:1;}const H=Math.max(1,jetSill(j)-2.7)*lift;it.body.position.y=3.4+H/0.8;if(it.sc)it.sc.scale.y=0.2+H/0.8/5.6;}
      const fu=j.gi&&j.gi.fuel;if(fu&&gOn(fu)){const v=fu.v.position,wx=j.x+j.T.span*PSCALE*0.2,wz=j.z+jetL(j)*0.02;hoseBit(v.x,v.z+6,wx,wz,0.35);bit(wx,0,wz,0.4,Rr*0.4+2,0.4,'#151515');person3(wx+2.6,wz+2,Math.PI,RAMP(j.id),0,null,false,false,'reach');}}}
  for(const [id,e] of JM)if(!seen.has(id)){scene.remove(e.g);JM.delete(id);}
  seen.clear();
  for(const h of G.hc){let e=HM.get(h.id);if(!e){const g=heliTpl(h.sch).clone();scene.add(g);e={g,rot:g.getObjectByName('rot'),tr:g.getObjectByName('tr'),bea:g.getObjectByName('bea')};HM.set(h.id,e);}seen.add(h.id);
    e.g.position.set(h.x,h.alt||0,h.z);const tilt=h.st==='in'||h.st==='out'?0.1:0;e.g.rotation.set(0,-h.hdg,-tilt);if(e.rot)e.rot.rotation.y+=dt*28*h.rot;if(e.tr)e.tr.rotation.z+=dt*60*h.rot;if(e.bea)e.bea.visible=h.rot>0.2&&Math.floor(performance.now()/450)%2===0;
    if(h.alt>0&&h.alt<14&&Math.random()<dt*14)G.fx.push({x:h.x+R(-14,14),y:h.z+R(-14,14),h:0.5,r:R(3,6),t:0,life:1,c:'#d9d4c6'});}
  for(const [id,e] of HM)if(!seen.has(id)){scene.remove(e.g);HM.delete(id);}
  seen.clear();
  for(const v of G.fv){let g=FCM.get(v.id);if(!g){g=carTpl(v.type,v.c).clone();scene.add(g);FCM.set(v.id,g);}seen.add(v.id);g.position.set(v.x,0,v.z);const dm=v.type==='bus'?[40,8.6,2.2]:v.type==='limo'?[30,7.6,2.2]:v.type==='van'?[20,7.6,2.6]:[18,8,3];vehFX(v,g,dm[0],dm[1],dm[2]);}
  for(const [id,g] of FCM)if(!seen.has(id)){scene.remove(g);FCM.delete(id);}
  if(G.fbo&&G.fbo.apm){if(!TRAIN){TRAIN=trainTpl().clone();scene.add(TRAIN);}const P=fbGuide(),T=G.fbT,q=fbAt(P,clamp(T.u,15,P.len-15));TRAIN.visible=true;TRAIN.position.set(q[0],FB.gy,q[1]);TRAIN.rotation.y=-q[2];}else if(TRAIN)TRAIN.visible=false;
  // personas del FBO
  for(const a of G.fa){if(a.hidden)continue;if(a.bug){buggy(a);continue;}const bob=a.moving?Math.abs(Math.sin(a.walk))*0.25:0,el=(a.el||0)+(a.sit?0.7:0)+bob;
    let pose=a.pose;if(!pose&&a.sit&&a.id%3===0)pose='drink';if(!pose&&a.sit&&a.id%3===1)pose='phone';
    person3(a.x,a.z,a.hdg,a.lk,a.walk,a.tr&&a.lk&&!a.sit?'suitcase':null,a.moving,a.sit,pose,el,a.tmo?40:92,a.tmo?'wait':null);
    if(a.press&&a.pose==='phone'&&Math.sin(G.t*9+a.id*3)>0.93)bit(a.x+Math.cos(a.hdg)*1.6,9+el,a.z+Math.sin(a.hdg)*1.6,1.4,1.4,1.4,'#ffffff');
    const c=Math.cos(a.hdg),s=Math.sin(a.hdg);a.ent.forEach((e,k)=>{let ox,oz;if(e.k==='cart'){ox=-6.6;oz=0;}else{ox=a.sit?1.5:-3.6;oz=(k%2?1:-1)*(a.sit?5.2:3.2);}
      const ex=a.x+ox*c-oz*s,ez=a.z+ox*s+oz*c;const h=a.sit&&e.k==='g'?a.hdg+(k%2?1:-1)*1.2:a.hdg;
      person3(ex,ez,h,e.lk,a.walk+k,null,a.moving,false,e.k==='cart'?'push':a.moving?null:'hand',(a.el||0)+bob);
      if(e.k==='cart'){const cx=ex+c*3,cz=ez+s*3;bit(cx,1.3+(a.el||0),cz,4,0.4,3,'#c9a24a',-a.hdg);bit(cx,3+(a.el||0),cz,3.2,2.8,2.6,a.lk.bagc||'#3a2a1e',-a.hdg);bit(cx,5,cz,2.4,1.4,2,'#5a3d22',-a.hdg);}});}
}
/* carrito eléctrico entre la terminal y el helipuerto */
function buggy(a){const h=a.hdg,c=Math.cos(h),s=Math.sin(h),X=(lx,lz)=>a.x+lx*c-lz*s,Z=(lx,lz)=>a.z+lx*s+lz*c,B=(lx,lz,y,w,hh,d,col)=>bit(X(lx,lz),y,Z(lx,lz),w,hh,d,col,-h);
  B(0,0,0.9,9.4,1.1,4.6,'#f4f4f2');B(0,0,2.0,9,0.25,4.4,'#c9a24a');B(4.2,0,2.0,1.2,1.4,4.4,'#f4f4f2');
  B(1.2,0,2.2,2,0.9,4,'#3a2a1e');B(-2.1,0,2.2,2,0.9,4,'#3a2a1e');B(0.1,0,3.1,0.4,2.2,4,'#3a2a1e');B(-3.2,0,3.1,0.4,2.2,4,'#3a2a1e');
  B(-0.5,0,9.6,10,0.35,5.2,'#f4f4f2');B(-0.5,0,9.95,10,0.12,5.2,'#c9a24a');[[4.2,2.3],[4.2,-2.3],[-4.8,2.3],[-4.8,-2.3]].forEach(([lx,lz])=>B(lx,lz,2.1,0.3,7.5,0.3,'#c9ced3'));
  B(4.3,0,4.1,0.12,5.2,4.4,'#cfe6f2');[[3,2.35],[3,-2.35],[-3,2.35],[-3,-2.35]].forEach(([lx,lz])=>B(lx,lz,0.1,1.6,1.6,0.7,'#141414'));
  B(4.75,1.5,1.1,0.2,0.5,0.8,'#fff6d8');B(4.75,-1.5,1.1,0.2,0.5,0.8,'#fff6d8');B(-4.75,1.5,1.2,0.2,0.4,0.7,'#d02020');B(-4.75,-1.5,1.2,0.2,0.4,0.7,'#d02020');
  person3(X(1.1,-1),Z(1.1,-1),h,FSTAFF(a.id+5),0,null,false,true,'reach',0.2,80);person3(X(-2.2,1),Z(-2.2,1),h,a.lk,0,null,false,true,a.pose,0.2,92);
  (a.ent||[]).slice(0,2).forEach((e,k)=>{const lz=k?-1:1,lx=k?-2.2:1.1;person3(X(lx,lz),Z(lx,lz),h,e.lk,0,null,false,true,null,0.2,78);});}
function fbJetGSE(j){if(typeof makeVeh!=='function')return;const L=jetL(j),S=j.T.span*PSCALE,Rr=jetR(j),T0=G.t,Wd=Math.max(25,j.depT-T0);j.gi={};
  const add=(type,key,x,z,h,a,b)=>{const v=makeVeh(type);v.visible=false;const tin=T0+a*Wd,tout=Math.max(tin+GDR+1,T0+b*Wd-GDR);const T=[x,z],A=[x-Math.cos(h)*18,z-Math.sin(h)*18],O=[x+(x>j.x?1:-1)*70,j.z+L/2+40];
    const it={v,p:j,type,key,T,A,O,h,tin,tout,hc:Math.atan2(A[1]-O[1],A[0]-O[0])};if(type==='cater'){it.body=v.getObjectByName('body');it.sc=v.getObjectByName('sc');}GSEL.push(it);j.gi[key]=it;};
  add('gpu','gpu',j.x+Rr+5,j.z-L/2+9,-Math.PI/2,0,0.9);add('fuel','fuel',j.x+S*0.36,j.z+L*0.1,-Math.PI/2,0.15,0.6);if(j.T.big||G.fbo.cat)add('cater','cater',j.x+Rr+9.4,j.z+L*0.28,Math.PI,0.1,0.55);}
function fbJetGSEOff(j){rmGSE(j);}
function fbOverlay(){if(!G.fbo||!G.fbo.on)return;const dist=camera.position.distanceTo(controls.target);if(dist>1500)return;
  for(const j of G.pj)if(j.alt<60)tag(j.x,jetR(j)*2+12+(j.alt||0),j.z,'✈ '+j.reg+' · '+j.T.n,'pl');
  if(dist<900)for(const a of G.fa)if(a.name&&a.role&&!a.press&&!a.hidden&&!a.sit)tag(a.x,15+(a.el||0),a.z,a.role.ic+' '+a.name,'vip');
  if(dist<1200)for(const h of G.hc)tag(h.x,(h.alt||0)+16,h.z,'🚁 '+h.reg,'pl');}
