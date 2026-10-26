
/* ================= MUNDO 3D DEL CONSTRUCTOR ================= */
camera.position.set(GW*CELL/2+220,240,GH*CELL/2+360);controls.target.set(GW*CELL/2,0,GH*CELL/2);controls.maxPolarAngle=1.32;controls.minDistance=40;controls.maxDistance=2200;
controls.mouseButtons={LEFT:TH.MOUSE.PAN,MIDDLE:TH.MOUSE.DOLLY,RIGHT:TH.MOUSE.ROTATE};controls.touches={ONE:TH.TOUCH.PAN,TWO:TH.TOUCH.DOLLY_ROTATE};
controls.update();
/* reflejos: mapas de entorno de día, atardecer y noche */
function mkEnv(stops,sun){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);
 stops.forEach(([k,v])=>g.addColorStop(k,v));x.fillStyle=g;x.fillRect(0,0,512,256);if(sun){x.fillStyle=sun;x.beginPath();x.arc(150,60,14,0,TAU);x.fill();}
 const t=new TH.CanvasTexture(c);t.mapping=TH.EquirectangularReflectionMapping;t.encoding=TH.sRGBEncoding;const pm=new TH.PMREMGenerator(renderer);const e=pm.fromEquirectangular(t).texture;t.dispose();pm.dispose();return e;}
const ENV_DAY=mkEnv([[0,'#5d8fd0'],[0.42,'#cfe3f5'],[0.5,'#f4f1ea'],[0.53,'#9aa38c'],[1,'#5b6a48']],'rgba(255,255,255,.9)');
const ENV_DUSK=mkEnv([[0,'#3a4a7a'],[0.4,'#d98a5a'],[0.5,'#f2b07a'],[0.53,'#6a6050'],[1,'#3a3a30']],'rgba(255,200,140,.8)');
const ENV_NIGHT=mkEnv([[0,'#05080f'],[0.45,'#141c2c'],[0.5,'#2a3040'],[0.53,'#141612'],[1,'#080a08']],null);
scene.environment=ENV_DAY;
hemi.intensity=0.55;
const SITE={x0:-260,z0:-290,w:1560,h:910},PXU=2.6;
const sitecan=document.createElement('canvas');sitecan.width=Math.round(SITE.w*PXU);sitecan.height=Math.round(SITE.h*PXU);
const basecan=document.createElement('canvas');basecan.width=sitecan.width;basecan.height=sitecan.height;
const stex=new TH.CanvasTexture(sitecan);stex.encoding=TH.sRGBEncoding;stex.anisotropy=renderer.capabilities.getMaxAnisotropy();
const RGU=0.6,rcan=document.createElement('canvas');rcan.width=Math.round(SITE.w*RGU);rcan.height=Math.round(SITE.h*RGU);const rtex=new TH.CanvasTexture(rcan);
const groundM=new TH.Mesh(new TH.PlaneGeometry(SITE.w,SITE.h),new TH.MeshStandardMaterial({map:stex,roughness:1,roughnessMap:rtex,envMapIntensity:.9}));groundM.rotation.x=-Math.PI/2;groundM.position.set(SITE.x0+SITE.w/2,0,SITE.z0+SITE.h/2);groundM.receiveShadow=true;scene.add(groundM);
const outerM=new TH.Mesh(new TH.PlaneGeometry(14000,14000),mat('#617f42',{roughness:1}));outerM.rotation.x=-Math.PI/2;outerM.position.set(400,-0.5,200);outerM.receiveShadow=true;scene.add(outerM);
function noise(x,n,x0,y0,w,h,cols,sz){for(let i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.fillRect(x0+Math.random()*w,y0+Math.random()*h,sz*(0.5+Math.random()),sz*(0.5+Math.random()));}}
function drawRunway(x,RZ,l1,l2){const RE=THR_X,RL=RE+90;
  x.fillStyle='#55585b';x.fillRect(-96,RZ-26,RL+12,52);x.fillStyle='#37393d';x.fillRect(-90,RZ-23,RL,46);noise(x,4000,-90,RZ-23,RL,46,['rgba(255,255,255,.04)','rgba(0,0,0,.09)','rgba(20,20,20,.12)'],1.2);
  // marcas de caucho en la zona de toma
  noise(x,1400,RE-420,RZ-9,330,18,['rgba(10,10,10,.18)','rgba(25,25,25,.12)'],2.4);
  x.fillStyle='#f4f4f0';x.fillRect(-90,RZ-21.6,RL,0.8);x.fillRect(-90,RZ+21.1,RL,0.8);
  for(let X=-30;X<RE-60;X+=30)x.fillRect(X,RZ-0.4,15,0.8);
  for(let i=0;i<8;i++){if(i===3||i===4)continue;x.fillRect(RE-24,RZ-19.5+i*5.4,20,2.8);x.fillRect(-86,RZ-19.5+i*5.4,20,2.8);}
  for(let k=0;k<6;k++){const X=RE-70-k*30,n=k<2?3:k<4?2:1;for(let j=0;j<n;j++){x.fillRect(X-12,RZ-17+j*2.4,14,1.6);x.fillRect(X-12,RZ+15.4-j*2.4,14,1.6);}}
  x.fillRect(RE-125,RZ-17,32,5);x.fillRect(RE-125,RZ+12,32,5);x.fillRect(-27,RZ-17,32,5);x.fillRect(-27,RZ+12,32,5);
  x.save();x.font='700 20px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.translate(RE-44,RZ);x.rotate(Math.PI/2);x.fillText(l1,0,0);x.restore();
  x.save();x.font='700 20px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.translate(-46,RZ);x.rotate(-Math.PI/2);x.fillText(l2,0,0);x.restore();
  x.fillStyle='rgba(255,255,255,.55)';for(let X=RE+0;X<RE+6;X+=2)x.fillRect(X,RZ-22,0.8,44);}
function drawBase(){
  const x=basecan.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,basecan.width,basecan.height);x.setTransform(PXU,0,0,PXU,-SITE.x0*PXU,-SITE.z0*PXU);
  x.fillStyle='#6d8c47';x.fillRect(SITE.x0,SITE.z0,SITE.w,SITE.h);noise(x,9000,SITE.x0,SITE.z0,SITE.w,SITE.h,['rgba(255,255,255,.05)','rgba(0,0,0,.06)','rgba(120,150,60,.25)'],2.2);
  // franjas de césped cortado
  x.fillStyle='rgba(255,255,255,.035)';for(let Z=SITE.z0;Z<0;Z+=24)x.fillRect(SITE.x0,Z,SITE.w,12);
  const two=G&&G.up&&G.up.rwy2,TZ=TWY_Z;
  drawRunway(x,RWY_Z,two?'27L':'27',two?'09R':'09');if(two)drawRunway(x,RWY2_Z,'27R','09L');
  // calles de rodaje y conectores
  x.fillStyle='#46494d';x.fillRect(-66,TZ-12,DEP_X+78,24);x.fillRect(-66,TWY2_Z-11,EXITS[0]+78,22);
  const rapid=G&&G.up&&G.up.rapid;
  [...EXITS,DEP_X].forEach(X=>{if(!rapid||X===DEP_X||X===-40)x.fillRect(X-12,RWY_Z+18,24,TZ-RWY_Z-18);});
  if(two)x.fillRect(DEP_X-12,RWY2_Z+18,24,RWY_Z-RWY2_Z-18);
  if(G&&G.fbo&&G.fbo.link){const L0=FB.lnk;x.fillStyle='#46494d';x.fillRect(L0-11,-292,22,TZ+292+11);x.fillRect(L0-11,TZ-11,-66-(L0-11),22);x.fillStyle='#f2c230';x.fillRect(L0-0.3,-292,0.6,TZ+292);x.fillRect(L0,TZ-0.3,-66-L0,0.6);
    x.fillStyle='#3f4246';x.fillRect(L0+13,-292,6,TZ+292+30);x.fillRect(L0+13,-8-3,-60-(L0+13),6);}
  if(rapid){x.lineCap='round';EXITS.forEach(X=>{if(X===-40)return;x.strokeStyle='#46494d';x.lineWidth=22;x.beginPath();x.moveTo(X+90,RWY_Z+4);x.quadraticCurveTo(X+20,RWY_Z+8,X,TWY2_Z);x.stroke();
    x.fillStyle='#46494d';x.fillRect(X-12,TWY2_Z,24,TZ-TWY2_Z);x.strokeStyle='#f2c230';x.lineWidth=0.6;x.beginPath();x.moveTo(X+90,RWY_Z+1);x.quadraticCurveTo(X+20,RWY_Z+6,X,TWY2_Z);x.lineTo(X,TZ);x.stroke();
    x.fillStyle='#55d070';for(let k=0;k<5;k++)x.fillRect(X+70-k*16,RWY_Z+3+k*2.4,1.2,1.2);});}
  x.fillStyle='#f2c230';x.fillRect(-60,TZ-0.3,DEP_X+60,0.6);x.fillRect(-60,TWY2_Z-0.3,EXITS[0]+60,0.6);
  [...EXITS,DEP_X].forEach(X=>{if(rapid&&X!==DEP_X&&X!==-40)return;x.fillRect(X-0.3,RWY_Z,0.6,TZ-RWY_Z);x.fillRect(X-12,RWY_Z+27,24,0.8);for(let i=0;i<5;i++)x.fillRect(X-12+i*5,RWY_Z+29,3,0.8);});
  if(two){x.fillRect(DEP_X-0.3,RWY2_Z,0.6,RWY_Z-RWY2_Z);x.fillRect(DEP_X-12,RWY2_Z+27,24,0.8);}
  // bordes amarillos de rodaje
  x.fillStyle='rgba(242,194,48,.7)';x.fillRect(-60,TZ+11,DEP_X+60,0.4);x.fillRect(-60,TZ-11.4,DEP_X+60,0.4);
  // acera, vía y estacionamiento
  const LW=GW*CELL;x.save();x.translate(0,GH*CELL-352);
  x.fillStyle='#cfccc4';x.fillRect(SITE.x0,352,SITE.w,8);x.strokeStyle='rgba(0,0,0,.08)';x.lineWidth=0.15;x.beginPath();for(let X=SITE.x0;X<SITE.x0+SITE.w;X+=3){x.moveTo(X,352);x.lineTo(X,360);}x.moveTo(SITE.x0,356);x.lineTo(SITE.x0+SITE.w,356);x.stroke();
  x.fillStyle='#8f8c85';x.fillRect(SITE.x0,359.4,SITE.w,0.8);
  roadAsphalt(x,SITE.x0,360,SITE.w,36);
  // huellas de rodadura por carril
  x.fillStyle='rgba(0,0,0,.07)';[367,382,392.5].forEach(c=>{x.fillRect(SITE.x0,c-3.2,SITE.w,1.4);x.fillRect(SITE.x0,c+1.8,SITE.w,1.4);});
  x.fillStyle='#f4f4f0';x.fillRect(SITE.x0,360.7,SITE.w,0.45);x.fillRect(SITE.x0,395,SITE.w,0.45);for(let X=SITE.x0;X<SITE.x0+SITE.w;X+=18)x.fillRect(X,374.3,9,0.45);
  x.fillStyle='#f2c230';x.fillRect(SITE.x0,388.3,SITE.w,0.4);x.fillRect(SITE.x0,389.2,SITE.w,0.4);
  for(let X=SITE.x0+40;X<SITE.x0+SITE.w;X+=150){roadArrow(x,X,367,1);roadArrow(x,X+60,382,1);roadArrow(x,X+30,392.5,-1);}
  x.fillStyle='#cfccc4';x.fillRect(SITE.x0,396,SITE.w,5);
  x.fillStyle='#d8d4ca';x.fillRect(SITE.x0,401,SITE.w,3);x.restore();
  G&&(G.baseDirty=false);
}
let tilePat=null,NGF=null;
/* asfalto con parches, grietas y desgaste */
function roadAsphalt(x,x0,z0,w,h,seed){x.fillStyle='#3e4145';x.fillRect(x0,z0,w,h);noise(x,Math.round(w*h/6),x0,z0,w,h,['rgba(255,255,255,.035)','rgba(0,0,0,.08)','rgba(80,80,80,.12)'],0.9);
  const r=rng(seed||Math.round(x0*3+z0*7));for(let i=0;i<w*h/900;i++){x.fillStyle=r()<0.5?'rgba(0,0,0,.09)':'rgba(255,255,255,.035)';x.fillRect(x0+r()*w,z0+r()*h,4+r()*14,2+r()*5);}
  x.strokeStyle='rgba(15,15,15,.32)';x.lineWidth=0.18;for(let i=0;i<w*h/500;i++){let px=x0+r()*w,pz=z0+r()*h;x.beginPath();x.moveTo(px,pz);for(let k=0;k<5;k++){px+=(r()-0.5)*4;pz+=(r()-0.5)*4;x.lineTo(px,pz);}x.stroke();}}
function roadArrow(x,X,Z,dir,rot){x.save();x.translate(X,Z);if(rot)x.rotate(rot);x.scale(dir,1);x.fillStyle='rgba(244,244,240,.85)';x.fillRect(-6,-0.35,7,0.7);x.beginPath();x.moveTo(1,-1.6);x.lineTo(4,0);x.lineTo(1,1.6);x.closePath();x.fill();x.restore();}
function zebra(x,X,z0,z1,w){x.fillStyle='rgba(244,244,240,.88)';for(let z=z0+0.5;z<z1-1;z+=2.2)x.fillRect(X-w/2,z,w,1.2);}
function pat(base,spk){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,64,64);noise(x,260,0,0,64,64,spk,1.6);return c;}
function drawSite(){
  if(G.baseDirty||!G._based){drawBase();G._based=true;}
  const x=sitecan.getContext('2d');x.setTransform(1,0,0,1,0,0);x.drawImage(basecan,0,0);x.setTransform(PXU,0,0,PXU,-SITE.x0*PXU,-SITE.z0*PXU);
  if(!tilePat){tilePat={3:x.createPattern(pat('#dfe9d6',['#cbd9c0','#eef4e8','#c2d2b6','#b0c3a2']),'repeat'),1:x.createPattern(pat('#ece6d8',['#d6cfc0','#f6f2ea','#cfc6b4','#b8ae9b']),'repeat'),2:x.createPattern(pat('#8fa6bd',['#7f97b0','#a2b6c9','#7a91aa','#b3c3d3']),'repeat')};
    tilePat.c=x.createPattern(pat('#b4b1a8',['rgba(0,0,0,.08)','rgba(255,255,255,.08)','#a9a69d','#bcb9b0']),'repeat');tilePat.s=x.createPattern(pat('#c4b38a',['rgba(0,0,0,.08)','rgba(255,255,255,.1)','#b3a07a','#cfc09a']),'repeat');
    for(const k in tilePat)tilePat[k].setTransform&&tilePat[k].setTransform(new DOMMatrix().scale(1/PXU*1.4));}
  {const lx0=G.lot.x0*CELL,lx1=(G.lot.x1+1)*CELL,AZ=APR*CELL,TZ=TWY_Z;
   x.fillStyle=tilePat.c;x.fillRect(lx0-12,TZ+12,lx1-lx0+24,AZ-TZ-12);
   x.strokeStyle='rgba(80,78,70,.25)';x.lineWidth=0.3;x.beginPath();for(let X=lx0;X<=lx1;X+=CELL){x.moveTo(X,TZ+12);x.lineTo(X,AZ);}for(let Z=0;Z<=AZ;Z+=CELL){x.moveTo(lx0-12,Z);x.lineTo(lx1+12,Z);}x.stroke();
   x.fillStyle='#d23a2f';x.fillRect(lx0-12,AZ-1.6,lx1-lx0+24,0.6);
   x.fillStyle='rgba(255,255,255,.75)';for(let X=lx0;X<lx1;X+=10)x.fillRect(X,AZ-4.6,5,0.5);
   x.fillStyle=tilePat.s;x.fillRect(lx0,AZ,lx1-lx0,GH*CELL-AZ);
   x.strokeStyle='rgba(255,255,255,.6)';x.setLineDash([3,3]);x.lineWidth=0.6;x.strokeRect(lx0+0.4,AZ+0.4,lx1-lx0-0.8,GH*CELL-AZ-0.8);x.setLineDash([]);}
  {x.save();try{x.filter='blur('+Math.round(PXU*3)+'px)';}catch(e){}x.fillStyle='rgba(20,22,26,.33)';x.fillRect(G.tx0*CELL-3,APR*CELL-3,(G.tx1-G.tx0+1)*CELL+6,(GH-APR)*CELL+6);x.restore();}
  for(let y=APR;y<GH;y++)for(let gx=0;gx<GW;gx++){const v=G.floor[cidx(gx,y)];if(!v)continue;x.fillStyle=tilePat[v];x.fillRect(gx*CELL-0.05,y*CELL-0.05,CELL+0.1,CELL+0.1);}
  x.strokeStyle='rgba(0,0,0,.045)';x.lineWidth=0.15;x.beginPath();
  for(let y=APR;y<GH;y++)for(let gx=0;gx<GW;gx++){if(!G.floor[cidx(gx,y)])continue;x.moveTo(gx*CELL+4,y*CELL);x.lineTo(gx*CELL+4,y*CELL+8);x.moveTo(gx*CELL,y*CELL+4);x.lineTo(gx*CELL+8,y*CELL+4);}x.stroke();
  x.strokeStyle='rgba(0,0,0,.09)';x.lineWidth=0.25;
  for(let y=APR;y<GH;y++)for(let gx=0;gx<GW;gx++){if(G.floor[cidx(gx,y)])x.strokeRect(gx*CELL,y*CELL,CELL,CELL);}
  // rótulos de zona pintados en el piso
  if(G.tx1!==undefined){const cx=(G.tx0+G.tx1+1)/2*CELL,cd=(G.tx0+G.tmid+1)/2*CELL,ca=(G.tmid+1+G.tx1+1)/2*CELL;x.save();x.textAlign='center';x.textBaseline='middle';x.font='700 10px "Barlow Condensed", sans-serif';
    x.fillStyle='rgba(60,50,30,.2)';x.fillText('HALL DE SALIDAS',cd,(TB.split+GH)/2*CELL+4);x.fillStyle='rgba(30,70,30,.22)';x.fillText('HALL DE LLEGADAS',ca,(TB.split+GH)/2*CELL+4);x.fillStyle='rgba(20,40,80,.22)';x.fillText('SALA ESTÉRIL · EMBARQUE',cx,(APR+TB.split)/2*CELL);
    x.fillStyle='#f2c230';x.fillRect(G.tx0*CELL,TB.split*CELL-0.4,(G.tx1-G.tx0+1)*CELL,0.8);x.fillRect((G.tmid+1)*CELL-0.4,TB.split*CELL,0.8,(GH-TB.split)*CELL);x.restore();}
  // estacionamientos en el área de accesos
  for(const o of G.objs){if(!o.def.land)continue;const X0=o.gx*CELL,Z0=o.gy*CELL,w=o.rw*CELL,h=o.rh*CELL;
    x.fillStyle='#3f4246';x.fillRect(X0,Z0,w,h);noise(x,500,X0,Z0,w,h,['rgba(255,255,255,.04)','rgba(0,0,0,.08)'],1);x.fillStyle='#cfccc4';x.fillRect(X0-1,Z0-1,w+2,1.2);x.fillRect(X0-1,Z0+h,w+2,1.2);x.fillRect(X0-1,Z0,1.2,h);x.fillRect(X0+w-0.2,Z0,1.2,h);
    x.fillStyle='#f4f4f0';const per=Math.ceil(o.def.spots/2),sw=(w-12)/(per-1||1);for(let k=0;k<=per;k++){const X=X0+6-sw/2+k*sw;x.fillRect(X,Z0+3,0.45,22);x.fillRect(X,Z0+h-25,0.45,22);}
    x.fillStyle='rgba(255,255,255,.8)';for(let X=X0+8;X<X0+w-8;X+=10)x.fillRect(X,o.cz-0.3,5,0.6);
    x.save();x.font='700 16px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(255,255,255,.5)';x.fillText('P',X0+w-10,o.cz+8);x.restore();}
  // bahías de la acera, cebras y avisos pintados en el asfalto
  {const B=bays(),zc=GH*CELL;x.save();x.setLineDash([1.6,1.2]);x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=0.35;
   B.dep.concat(B.arr).forEach(bx=>x.strokeRect(bx-8.6,zc+9.4,17.2,11));x.setLineDash([]);
   [[B.depBus,'BUS'],[B.arrBus,'BUS']].forEach(([bx,t])=>{x.strokeStyle='#f2c230';x.lineWidth=0.5;x.strokeRect(bx-22,zc+9.2,44,11.4);x.font='700 5px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f2c230';x.fillText(t,bx,zc+15);});
   if(B.arr.length){x.font='700 4px "Barlow Condensed", sans-serif';x.fillStyle='rgba(255,255,255,.8)';x.textAlign='center';x.textBaseline='middle';x.fillText('TAXI',B.arr[0],zc+15);}
   x.font='700 4.2px "Barlow Condensed", sans-serif';x.fillStyle='rgba(255,255,255,.7)';x.textAlign='center';x.textBaseline='middle';
   x.fillText('SALIDAS · SOLO DEJAR',(G.tx0*CELL+(G.tmid+1)*CELL)/2,zc+30);x.fillText('LLEGADAS · RECOGER',((G.tmid+1)*CELL+(G.tx1+1)*CELL)/2,zc+30);
   x.fillStyle='#c0392b';x.fillRect(G.tx0*CELL-60,zc+8.2,60,0.6);x.fillRect((G.tx1+1)*CELL,zc+8.2,60,0.6);
   const zx=[(G.tmid+1)*CELL];G.objs.forEach(o=>{if(o.def.land)zx.push(o.cx);});zx.forEach(X=>{zebra(x,X,zc+8.2,zc+44,7);});x.restore();}
  // tapetes de entrada
  x.fillStyle='#3a3f45';for(let gx=0;gx<GW;gx++)if(G.floor[cidx(gx,GH-1)]===1)x.fillRect(gx*CELL+0.8,(GH-1)*CELL+4.2,CELL-1.6,3.4);
  // puestos de avión
  for(const s of G.objs){if(!s.def.apron)continue;const X0=s.gx*CELL,Z0=s.gy*CELL,w=s.rw*CELL,h=s.rh*CELL;
    x.fillStyle='rgba(60,60,55,.12)';x.fillRect(X0,Z0,w,h);x.strokeStyle='#d23a2f';x.lineWidth=0.7;x.setLineDash([2.5,2]);x.strokeRect(X0+0.6,Z0+0.6,w-1.2,h-1.2);x.setLineDash([]);
    x.strokeStyle='#f2c230';x.lineWidth=0.7;x.beginPath();x.moveTo(s.cx,TWY_Z);x.lineTo(s.cx,s.bottom-5);x.stroke();
    x.fillStyle='#f2c230';x.fillRect(s.cx-5,s.bottom-5.6,10,1.1);
    x.save();x.fillStyle='#1b1b1b';x.fillRect(X0+2,s.bottom-14,10,10);x.font='700 12px "Barlow Condensed", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f2c230';x.fillText(''+s.num,X0+7,s.bottom-8.6);x.restore();
    standDetail(x,s,X0,Z0,w,h);}
  drawRough();
  stex.needsUpdate=true;
}
/* marcas de plataforma: zonas de equipos, parada por tipo, hidrantes, manchas */
function standDetail(x,s,X0,Z0,w,h){const B=s.bottom,cx=s.cx;
  x.save();
  // borde negro bajo la línea guía
  x.strokeStyle='rgba(20,20,20,.55)';x.lineWidth=1.5;x.beginPath();x.moveTo(cx,Z0+2);x.lineTo(cx,B-5);x.stroke();x.strokeStyle='#f2c230';x.lineWidth=0.7;x.beginPath();x.moveTo(cx,Z0+2);x.lineTo(cx,B-5);x.stroke();
  // barras de parada por tamaño de avión
  const lab=['ATR','A320','787'];for(let k=0;k<Math.min(3,s.def.size);k++){const zz=B-5-k*5.5;x.fillStyle='#f2c230';x.fillRect(cx-4,zz-0.5,8,0.9);x.font='600 3px "Barlow Condensed", sans-serif';x.textAlign='left';x.textBaseline='middle';x.fillText(lab[k],cx+4.8,zz);}
  // zonas de equipos (blancas rayadas) a los lados de la nariz
  const box=(bx,bz,bw,bh,c)=>{x.strokeStyle=c;x.lineWidth=0.45;x.strokeRect(bx,bz,bw,bh);x.save();x.beginPath();x.rect(bx,bz,bw,bh);x.clip();x.lineWidth=0.3;for(let k=-bh;k<bw;k+=2.4){x.beginPath();x.moveTo(bx+k,bz+bh);x.lineTo(bx+k+bh,bz);x.stroke();}x.restore();};
  box(X0+3,B-28,10,11,'rgba(255,255,255,.7)');box(X0+w-13,B-28,10,11,'rgba(255,255,255,.7)');
  // zona sin estacionar bajo la pasarela
  if(s.bridge&&typeof bridgeRot==='function'){const [rx]=bridgeRot(s);box(rx-7,B-12,14,10,'rgba(242,194,48,.85)');}
  // línea de seguridad de equipos (roja) y textos
  x.fillStyle='#d23a2f';x.fillRect(X0+1.5,B-31,w-3,0.5);
  x.font='600 2.6px "Barlow Condensed", sans-serif';x.fillStyle='rgba(255,255,255,.75)';x.textAlign='center';x.fillText('LÍMITE DE EQUIPOS',cx-18,B-31.8);x.fillText('LÍMITE DE EQUIPOS',cx+18,B-31.8);
  // hidrantes de combustible
  [-1,1].forEach(k=>{const hx=cx+k*w*0.3,hz=Z0+h*0.42;x.fillStyle='#2b2b2b';x.beginPath();x.arc(hx,hz,1,0,TAU);x.fill();x.strokeStyle='#f2c230';x.lineWidth=0.35;x.beginPath();x.arc(hx,hz,1.6,0,TAU);x.stroke();});
  // manchas de aceite y caucho
  const r=rng(s.id*97+11);for(let i=0;i<26;i++){const a=r(),ox=(r()-0.5)*w*0.7,oz=Z0+h*0.25+r()*h*0.6;x.fillStyle='rgba(30,28,24,'+(0.04+a*0.07)+')';x.beginPath();x.ellipse(cx+ox,oz,1+r()*3,0.8+r()*2,r()*3,0,TAU);x.fill();}
  // juntas del concreto
  x.strokeStyle='rgba(60,58,52,.18)';x.lineWidth=0.25;x.beginPath();for(let X=X0;X<=X0+w;X+=5)x.moveTo(X,Z0),x.lineTo(X,B);for(let Z=Z0;Z<=B;Z+=5)x.moveTo(X0,Z),x.lineTo(X0+w,Z);x.stroke();
  x.restore();}
/* rugosidad: pisos interiores pulidos, plataforma y pistas mates */
function drawRough(){const x=rcan.getContext('2d');x.setTransform(1,0,0,1,0,0);x.fillStyle='rgb(240,240,240)';x.fillRect(0,0,rcan.width,rcan.height);x.setTransform(RGU,0,0,RGU,-SITE.x0*RGU,-SITE.z0*RGU);
  const lx0=G.lot.x0*CELL,lx1=(G.lot.x1+1)*CELL;x.fillStyle='rgb(205,205,205)';x.fillRect(lx0-12,TWY_Z+12,lx1-lx0+24,APR*CELL-TWY_Z-12);
  x.fillStyle='rgb(215,215,215)';x.fillRect(-90,RWY_Z-23,THR_X+90,46);if(G.up&&G.up.rwy2)x.fillRect(-90,RWY2_Z-23,THR_X+90,46);
  x.fillStyle='rgb(212,212,212)';x.fillRect(-90,TWY2_Z-14,THR_X+90,TWY_Z-TWY2_Z+28);x.fillRect(-240,GH*CELL+2,1480,52);
  for(let y=APR;y<GH;y++)for(let gx=0;gx<GW;gx++){const v=G.floor[cidx(gx,y)];if(!v)continue;x.fillStyle=v===2?'rgb(92,92,92)':'rgb(112,112,112)';x.fillRect(gx*CELL,y*CELL,CELL,CELL);}
  x.fillStyle='rgb(140,140,140)';for(let y=APR;y<GH;y++)for(let gx=0;gx<GW;gx++){if(!G.floor[cidx(gx,y)])continue;x.fillRect(gx*CELL,y*CELL,CELL,0.5);x.fillRect(gx*CELL,y*CELL,0.5,CELL);}
  rtex.needsUpdate=true;}
// rejilla de construcción
const gridC=document.createElement('canvas');gridC.width=gridC.height=64;{const x=gridC.getContext('2d');x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=5;x.strokeRect(0,0,64,64);}
const gridT=new TH.CanvasTexture(gridC);gridT.anisotropy=8;gridT.wrapS=gridT.wrapT=TH.RepeatWrapping;gridT.repeat.set(GW,GH);
const gridM=new TH.Mesh(new TH.PlaneGeometry(GW*CELL,GH*CELL),new TH.MeshBasicMaterial({map:gridT,transparent:true,depthWrite:false,opacity:.6}));gridM.rotation.x=-Math.PI/2;gridM.position.set(GW*CELL/2,0.15,GH*CELL/2);gridM.visible=false;gridM.renderOrder=2;scene.add(gridM);
const ZONEC=document.createElement('canvas');ZONEC.width=GW;ZONEC.height=GH;
const zoneT=new TH.CanvasTexture(ZONEC);zoneT.magFilter=TH.NearestFilter;
const zoneM=new TH.Mesh(new TH.PlaneGeometry(GW*CELL,GH*CELL),new TH.MeshBasicMaterial({map:zoneT,transparent:true,depthWrite:false,opacity:.42}));zoneM.rotation.x=-Math.PI/2;zoneM.position.set(GW*CELL/2,0.12,GH*CELL/2);zoneM.visible=false;zoneM.renderOrder=1;scene.add(zoneM);
function drawZones(){const x=ZONEC.getContext('2d');x.clearRect(0,0,GW,GH);for(let y=APR;y<GH;y++)for(let gx=0;gx<GW;gx++){const v=G.floor[cidx(gx,y)];if(v===1)x.fillStyle='rgba(255,214,90,.75)';else if(v===2)x.fillStyle='rgba(40,120,255,.95)';else if(v===3)x.fillStyle='rgba(70,200,110,.85)';else continue;x.fillRect(gx,y,1,1);}zoneT.needsUpdate=true;}

/* ---- estructuras: paredes y objetos ---- */
let OBJG=new TH.Group();scene.add(OBJG);let TRUSS=null;let STAFF=[],SIGNS3=[];
function bake(root){root.updateMatrixWorld(true);const groups=new Map();
  root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;for(let q=o.parent;q;q=q.parent)if(q.userData.nobake)return;if(o.geometry!==BOXG&&o.geometry!==CYLG&&o.geometry!==SPHG)return;const k=o.geometry.uuid+'|'+o.material.uuid+'|'+o.castShadow;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
  groups.forEach(list=>{const im=new TH.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((o,i)=>{im.setMatrixAt(i,o.matrixWorld);o.parent.remove(o);});im.castShadow=list[0].castShadow;im.receiveShadow=true;root.add(im);});}
function gbox(w,h,d,c,x,y,z,par,o){const m=box(w,h,d,c,x,y,z,par,o);if(c===GLASS||(o&&o.transparent))m.castShadow=false;return m;}
function sign(text,x,y,z,par,bg,fg,hgt){const {t,ar}=textTex(text,bg||'#ffc629',fg||'#141414',64);const m=new TH.Mesh(new TH.PlaneGeometry(hgt*ar,hgt),new TH.MeshBasicMaterial({map:t,side:TH.DoubleSide,toneMapped:false}));m.material.color=SIGNC;m.material.userData.own=true;m.position.set(x,y,z);par.add(m);return m;}
let GHOST=false;
function staffAt(o,lx,lz,lh,shirt,cap,sit,vest){if(GHOST)return;const [x,z]=l2w(o,lx,lz);STAFF.push({x,z,h:lh+o.a,lk:staffLook(o.id*7+Math.round(lx*3+lz),shirt,cap,vest),sit});}
function buildWorld(){
  scene.remove(OBJG);disposeGroup(OBJG);OBJG=new TH.Group();scene.add(OBJG);STAFF=[];fidsReset();
  drawSite();drawZones();
  const W=OBJG;
  // paredes automáticas
  const inT=(gx,gy)=>gx>=0&&gx<GW&&gy>=APR&&gy<GH;
  for(let gy=APR;gy<GH;gy++)for(let gx=0;gx<GW;gx++){const i=cidx(gx,gy),f=G.floor[i];if(!f)continue;
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const nx=gx+dx,ny=gy+dy;const nf=inT(nx,ny)?G.floor[cidx(nx,ny)]:0;
      const cx=(gx+0.5)*CELL+dx*CELL/2,cz=(gy+0.5)*CELL+dy*CELL/2,horiz=dy!==0,w=horiz?CELL:0.7,d=horiz?0.7:CELL;
      if(!nf){if(dy===1&&gy===GH-1&&f===1){gbox(horiz?1:0.9,12.6,horiz?0.9:1,'#8b959d',cx-CELL/2+0.5,0,cz,W);gbox(CELL,2.6,1.6,'#e9ecef',cx,12.6,cz,W);gbox(CELL,0.5,0.4,'#7fd1ff',cx,11.3,cz-0.4,W,{emissive:col('#2a90d0'),emissiveIntensity:.4});return;}
        gbox(w,10.6,d,GLASS,cx,2,cz,W);gbox(horiz?CELL:1.3,2,horiz?1.3:CELL,'#cfd4d8',cx,0,cz,W);gbox(horiz?CELL:1.6,2.6,horiz?1.6:CELL,'#e9ecef',cx,12.6,cz,W);
        const px=horiz?cx-CELL/2:cx,pz=horiz?cz:cz-CELL/2;gbox(0.6,12.6,0.6,'#8b959d',px,0,pz,W);}
      else if(nf!==f&&f<nf&&!G.cobj[i]&&!G.cobj[cidx(nx,ny)]){gbox(w*(horiz?1:0.6),6,d*(horiz?0.6:1),GLASS,cx,0,cz,W);gbox(horiz?CELL:0.6,0.5,horiz?0.6:CELL,'#8a949c',cx,6,cz,W);}
    });}
  // objetos
  for(const o of G.objs){const lg=new TH.Group();lg.position.set(o.cx,0,o.cz);lg.rotation.y=-o.a;W.add(lg);buildObj(o,lg);}
  // postes de luz en plataforma y acera
  for(let x=40;x<GW*CELL;x+=150){cyl(0.9,46,'#7d868d',x,0,TWY_Z+17,W);gbox(9,1.8,3.4,'#3a3f45',x,46,TWY_Z+17,W);}
  for(let x=-200;x<1280;x+=130){cyl(0.6,22,'#7d868d',x,0,GH*CELL+46.5,W);gbox(5,1,2,'#3a3f45',x,22,GH*CELL+46.5,W);}
  // torre de control y estación de bomberos (decorado fijo)
  cyl(8,70,'#c9ced3',-150,0,40,W);{const cab=new TH.Mesh(new TH.CylinderGeometry(16,13,11,8),GLASS);cab.position.set(-150,75.5,40);W.add(cab);}cyl(17,1.5,'#59636c',-150,70,40,W);
  {const roof=new TH.Mesh(new TH.CylinderGeometry(4,18,4,8),mat('#59636c'));roof.position.set(-150,83,40);W.add(roof);}cyl(0.6,16,'#333',-150,85,40,W);
  gbox(70,14,40,'#b8302a',-160,0,170,W);gbox(72,1.4,42,'#7a1f1b',-160,14,170,W);for(let i=0;i<3;i++)gbox(16,10,0.6,'#e8e8e8',-185+i*24,0,190.4,W);
  sign('BOMBEROS ARFF',-160,17,191,W,'#b8302a','#ffffff',4);
  // depósito de combustible
  [[-170,270],[-130,270]].forEach(([x,z])=>{cyl(16,14,'#eef1f3',x,0,z,W,{metalness:.3,roughness:.4});cyl(16.4,1,'#9aa3aa',x,14,z,W);});
  // valla del terreno comprado
  {const lx0=G.lot.x0*CELL-8,lx1=(G.lot.x1+1)*CELL+8,z0=TWY_Z+14,z1=GH*CELL;for(const X of [lx0,lx1]){for(let z=z0;z<=z1;z+=16)cyl(0.4,7,'#8a9399',X,0,z,W);gbox(0.2,6,z1-z0,'#9aa3a9',X,0.6,(z0+z1)/2,W,{transparent:true,opacity:.35});}}
  // marquesina de la acera frente a la terminal
  {const x0=G.tx0*CELL,x1=(G.tx1+1)*CELL,zf=GH*CELL+9;gbox(x1-x0,1.2,11,'#e9ecef',(x0+x1)/2,14,GH*CELL+4,W);gbox(x1-x0,1.8,0.8,'#2b3a4a',(x0+x1)/2,13.4,zf+0.6,W);
   for(let X=x0+6;X<x1;X+=24)cyl(0.6,14,'#8b959d',X,0,zf-1,W);
   sign('AEROPUERTO PISTA LIBRE',(x0+x1)/2,18.6,GH*CELL+9.5,W,'#ffc629','#141414',4.4);
   const xd=(x0+(G.tmid+1)*CELL)/2,xa=((G.tmid+1)*CELL+x1)/2;sign('✈ SALIDAS · DEPARTURES',xd,13.8,GH*CELL+10.2,W,'#1b1b1b','#ffc629',2.6);sign('✈ LLEGADAS · ARRIVALS',xa,13.8,GH*CELL+10.2,W,'#1b1b1b','#7fe0a0',2.6);
   const B=bays();[[B.depBus,'BUS'],[B.arrBus,'BUS']].forEach(([bx,t])=>{gbox(22,0.6,6,'#3a4650',bx,9,GH*CELL+3,W);gbox(0.5,9,0.5,'#59636c',bx-10,0,GH*CELL+5.5,W);gbox(0.5,9,0.5,'#59636c',bx+10,0,GH*CELL+5.5,W);gbox(20,6,0.3,GLASS,bx,2,GH*CELL+0.6,W);gbox(14,1.4,2.2,'#7d6a52',bx,1.8,GH*CELL+2,W);
     gbox(0.4,10,0.4,'#59636c',bx+13,0,GH*CELL+7.4,W);sign('🚌 '+t,bx+13,10.6,GH*CELL+7.4,W,'#2f6db5','#ffffff',2.2);});
   if(B.arr.length){const tx=B.arr[0]-10;gbox(0.4,10,0.4,'#59636c',tx,0,GH*CELL+7.4,W);sign('TAXI',tx,10.6,GH*CELL+7.4,W,'#f2b705','#141414',2.2);}}
  // estructura del techo (cerchas) para que se lea como edificio sin tapar el interior
  {const x0=G.tx0*CELL,x1=(G.tx1+1)*CELL,z0=APR*CELL,z1=GH*CELL;for(let X=x0;X<=x1+0.1;X+=32){gbox(1.4,17.2,1.4,'#b8bec4',X,0,z0+1,W);gbox(1.4,17.2,1.4,'#b8bec4',X,0,z1-1,W);}
   const CV=hasCorr(),za=CV?z0+9:z0;
   TRUSS=new TH.Group();TRUSS.userData.nobake=true;W.add(TRUSS);const tm=mat('#aeb5bc',{metalness:.5,roughness:.4});for(let X=x0;X<=x1+0.1;X+=32){const b=new TH.Mesh(BOXG,tm);b.scale.set(0.6,0.9,z1-za);b.position.set(X,17.6,(za+z1)/2);TRUSS.add(b);}
   for(let Z=z0;Z<=z1+0.1;Z+=(z1-z0)/4){if(Z<za)continue;const b=new TH.Mesh(BOXG,tm);b.scale.set(x1-x0,0.5,0.5);b.position.set((x0+x1)/2,18.3,Z);TRUSS.add(b);}}
  // pasillo elevado de llegadas (vidrio) y núcleos de subida junto a cada puesto
  if(hasCorr()){const Y=CORR_Y,x0=G.tx0*CELL+0.8,x1=(G.tx1+1)*CELL-0.8,zA=APR*CELL+1.2,zB=APR*CELL+8.4,zc=(zA+zB)/2,L=x1-x0,xm=(x0+x1)/2,Dz=zB-zA;
    const FL=mat('#d4ebf5',{transparent:true,opacity:.5,roughness:.08,metalness:.25,depthWrite:false}),RF=mat('#e6f2f8',{transparent:true,opacity:.16,roughness:.05,metalness:.3,depthWrite:false});
    gbox(L,0.6,Dz,FL,xm,Y-0.6,zc,W).castShadow=false;gbox(L,1.2,0.8,'#6b757e',xm,Y-1.8,zA,W);gbox(L,1.2,0.8,'#6b757e',xm,Y-1.8,zB,W);
    gbox(L,0.06,0.7,'#2fbf71',xm,Y+0.02,zc,W,{emissive:col('#1f9f5a'),emissiveIntensity:.5});
    gbox(L,6.8,0.25,GLASS,xm,Y,zB,W);gbox(L,6.8,0.25,GLASS,xm,Y,zA,W);gbox(L,0.5,0.3,'#2b3036',xm,Y+3.1,zB-0.35,W);
    gbox(L,0.3,Dz+1,RF,xm,Y+6.8,zc,W).castShadow=false;gbox(L,0.7,0.7,'#8b959d',xm,Y+6.6,zA,W);gbox(L,0.7,0.7,'#8b959d',xm,Y+6.6,zB,W);
    gbox(L,0.2,0.6,'#ffffff',xm,Y+6.35,zc,W,{emissive:col('#e8f6ff'),emissiveIntensity:.9});
    for(let X=x0;X<=x1+0.1;X+=8){gbox(0.35,6.8,0.4,'#8b959d',X,Y,zB,W);gbox(0.35,6.8,0.4,'#8b959d',X,Y,zA,W);gbox(0.4,0.4,Dz,'#8b959d',X,Y+6.7,zc,W);}
    for(let X=G.tx0*CELL;X<=(G.tx1+1)*CELL+0.1;X+=32)gbox(1.4,Y+7.2-17.2,1.4,'#b8bec4',X,17.2,APR*CELL+1,W);
    for(let X=x0+40;X<x1-20;X+=96)sign('LLEGADAS · ARRIVALS  ➜',X,Y+4.7,zB+0.3,W,'#14311f','#7fe0a0',1.5);
    for(const s of G.objs){if(!s.def.apron)continue;const [rx,rz]=bridgeRot(s);
      if(s.bridge){cyl(3.4,Y+7-10.8,GLASS,rx,10.8,rz,W).castShadow=false;cyl(3.9,0.6,'#59636c',rx,Y+7,rz,W);cyl(3.7,0.4,'#59636c',rx,Y-0.4,rz,W);}
      else{cyl(3.6,Y+7,GLASS,rx,0,rz,W).castShadow=false;cyl(1.2,Y+7,'#c9ced3',rx,0,rz,W);cyl(3.9,0.7,'#59636c',rx,0,rz,W);cyl(4,0.7,'#59636c',rx,Y+6.6,rz,W);cyl(3.8,0.4,'#59636c',rx,Y-0.4,rz,W);
        for(let k=0;k<15;k++){const a=k*0.85,st=new TH.Mesh(BOXG,mat('#d6dadd'));st.scale.set(2.3,0.35,1.3);st.position.set(rx+Math.cos(a)*2.4,0.7+k*(Y-1)/15,rz+Math.sin(a)*2.4);st.rotation.y=-a;st.castShadow=true;W.add(st);}
        for(let k=0;k<6;k++){const a=k*Math.PI/3;gbox(0.3,Y+7,0.3,'#8b959d',rx+Math.cos(a)*3.6,0,rz+Math.sin(a)*3.6,W);}
        gbox(3.2,6,0.5,'#2b3a4a',rx,0,rz-3.8,W);gbox(2.6,5.2,0.2,'#7fd1ff',rx,0.2,rz-4.05,W,{emissive:col('#2a90d0'),emissiveIntensity:.35});
        sign('LLEGADAS',rx,7.2,rz-4.2,W,'#14311f','#7fe0a0',1.4);}}}
  // árboles y jardineras en el área de accesos
  {const zt=(LAND1)*CELL+8;for(let X=-180;X<1190;X+=34){if((X/34|0)%3===0)palm(X,zt,15+(X%5),W);else treeB(X,zt,13+(X%7),W,X%68?'#3f7f39':'#4f8f3f');}
   for(let X=-132;X<1160;X+=68){if(G.objs.some(o=>o.def.land&&X>o.gx*CELL-12&&X<(o.gx+o.rw)*CELL+12))continue;treeB(X,GH*CELL+48,11,W,'#3f7f39');}}
  {const z0=GH*CELL;gbox(SITE.w,0.45,0.55,'#bdb9b0',SITE.x0+SITE.w/2,0,z0+8.1,W);gbox(SITE.w,0.45,0.55,'#bdb9b0',SITE.x0+SITE.w/2,0,z0+43.9,W);
   for(let X=G.tx0*CELL-56;X<=(G.tx1+1)*CELL+56;X+=9){if(X>G.tx0*CELL-2&&X<(G.tx1+1)*CELL+2)continue;cyl(0.35,2.2,'#59636c',X,0,z0+6.6,W);gbox(0.75,0.3,0.75,'#f2b705',X,2.2,z0+6.6,W);}
   const gant=(X,t1,t2,c)=>{cyl(0.7,18,'#8b959d',X,0,z0+5,W);cyl(0.7,18,'#8b959d',X,0,z0+47,W);gbox(1.2,1.2,44,'#8b959d',X,17.4,z0+26,W);gbox(0.8,0.6,42,'#59636c',X,15.8,z0+26,W);
     [[t1,z0+16],[t2,z0+33]].forEach(([t,zz])=>{gbox(0.6,5.4,14,'#1d5a3a',X,12,zz,W);const m=sign(t,X-0.4,14.7,zz,W,'#1d5a3a','#ffffff',2.1);m.rotation.y=-Math.PI/2;});};
   gant(G.tx0*CELL-150,'↓ SALIDAS','↓ PARQUEO');gant((G.tmid+1)*CELL+10,'↓ LLEGADAS','→ SALIDA');}
  if(G.northDirty||NGF!==G){drawNorth();G.northDirty=false;NGF=G;}
  buildFbo(W);
  bake(W);
  buildBridges(W);
  // enlaces puerta → puesto
  for(const s of G.objs){if(!s.def.apron||!s.gate)continue;const g=s.gate;const geo=new TH.BufferGeometry().setFromPoints([new TH.Vector3(g.cx,0.6,g.cz),new TH.Vector3(s.cx,0.6,s.bottom-4)]);
    const ln=new TH.Line(geo,new TH.LineDashedMaterial({color:0xffc629,dashSize:4,gapSize:3,transparent:true,opacity:.8}));ln.computeLineDistances();W.add(ln);}
  if(G.baseDirty||!RWG||RWG.userData.k!==JSON.stringify(G.up)){buildRunway3D();RWG.userData.k=JSON.stringify(G.up);}
}
function buildObj(o,g){
  const d=o.def,B=(w,h,dd,c,x,y,z,op)=>gbox(w,h,dd,c,x,y,z,g,op),H2=Math.PI/2;
  switch(o.k){
    case 'pasillo':{const Y=CORR_Y,z0=-5,z1=11.5,len=Math.hypot(z1-z0,Y),th=Math.atan2(Y,z1-z0),zm=(z0+z1)/2;
      const ramp=(w,h,c,x,yo,op)=>{const m=new TH.Mesh(BOXG,typeof c==='string'?mat(c,op):c);m.scale.set(w,h,len);m.rotation.x=th;m.position.set(x,Y/2+yo,zm);m.castShadow=c!==GLASS;m.receiveShadow=true;g.add(m);return m;};
      ramp(7.4,1.8,'#3a4048',0,-1.1);ramp(5.4,0.14,'#8f979e',0,0);ramp(0.45,3.2,GLASS,-3,1.7);ramp(0.45,3.2,GLASS,3,1.7);ramp(0.55,0.5,'#151515',-3,3.45);ramp(0.55,0.5,'#151515',3,3.45);
      ramp(0.35,1.6,'#c9ced3',-3.5,-0.3);ramp(0.35,1.6,'#c9ced3',3.5,-0.3);
      for(let k=1;k<18;k++){const u=k/18,m=new TH.Mesh(BOXG,mat('#c4c9ce',{metalness:.5,roughness:.35}));m.scale.set(5.2,0.16,0.3);m.position.set(0,Y*(1-u)+0.12,z0+(z1-z0)*u);g.add(m);}
      B(6.4,0.25,3,'#9aa3aa',0,0,z1+1.4);B(6.4,0.25,4,'#9aa3aa',0,Y-0.25,z0-2);B(1.3,Y/2-1.6,1.3,'#59636c',0,0,zm);B(7.8,0.12,4.4,'#2b3036',0,0,z1+1.4);
      B(0.5,2.2,0.5,'#59636c',-3.4,0,z1+3.4);B(0.5,2.2,0.5,'#59636c',3.4,0,z1+3.4);B(1.6,0.9,0.3,'#14311f',3.4,2.2,z1+3.4);
      sign('⬇ LLEGADAS · RECOGIDA',0,Y+4.4,z0+0.6,g,'#14311f','#7fe0a0',1.3);break;}
    case 'checkin':
      B(16,13,0.8,'#2b3a4a',0,0,-3.4);sign('CHECK-IN',0,11.3,-2.9,g,'#ffc629','#141414',3.4);if(!GHOST)fidsMesh(FIDS.dep.m,5.8,3.6,0,7.4,-2.82,g);
      B(13,4.6,3.2,'#8f979e',0,0,1.4);B(13.4,0.5,3.6,'#dfe3e6',0,4.6,1.4);B(3.6,1,3.6,'#3a3f45',5.4,0,3.4);B(2.6,1.2,6,'#2f343a',5.6,0,-0.8);
      B(3.2,2.4,0.3,'#15191d',-3,5.1,0.6);B(2.8,2,0.1,'#3aa0ff',-3,5.3,0.8,{emissive:col('#1a6fd0'),emissiveIntensity:.8});
      staffAt(o,-1,-1.4,H2,STAFFC.checkin);break;
    case 'security':
      B(6,0.15,24,'#3a4048',-3,0,0);
      B(6,3.4,9,'#9aa3aa',4,0,7);B(6.2,0.4,9.2,'#c9ced2',4,3.4,7);
      B(7,7.4,9,'#3d6f8f',4,0,-1);B(5,4,0.3,'#11171c',4,1.2,3.55);B(5,4,0.3,'#11171c',4,1.2,-5.55);B(7.2,0.6,9.2,'#2b5068',4,7.4,-1);
      B(5,3.4,6,'#5d656c',4,0,-8.5);
      B(1.2,10,1.2,'#b9c0c6',-6.6,0,0);B(1.2,10,1.2,'#b9c0c6',0.6,0,0);B(8.4,1.4,1.4,'#b9c0c6',-3,9.6,0);B(0.6,1,0.6,'#3ccf91',-3,10.6,0.8,{emissive:col('#22aa66'),emissiveIntensity:1});
      B(2.6,3.6,2.6,'#22272c',7.6,0,-7);B(2.4,1.8,0.2,'#3aa0ff',7.6,3.6,-6,{emissive:col('#1a6fd0'),emissiveIntensity:.8});
      [-11,-7].forEach(z=>{cyl(0.4,3.4,'#9aa3aa',-7,0,z+18,g);});
      sign('CONTROL DE SEGURIDAD',-3,14,11.5,g,'#ffc629','#141414',3);B(0.5,14,0.5,'#59636c',-7.6,0,11.5);B(0.5,14,0.5,'#59636c',1.6,0,11.5);
      staffAt(o,7.8,6,Math.PI,STAFFC.security,'#141c2e');staffAt(o,7.6,-4.5,Math.PI,STAFFC.security,'#141c2e',true);staffAt(o,-7.3,-4,0,STAFFC.security,'#141c2e');break;
    case 'migration':
      B(7,4.4,3,'#6f777e',0,0,1.6);gbox(7,5.6,0.3,GLASS,0,4.4,3,g);B(7.4,0.6,7.4,'#4b5a32',0,10,-0.5);B(0.6,10,7,'#4b5a32',-3.5,0,-0.5);B(0.6,10,7,'#4b5a32',3.5,0,-0.5);B(7,10,0.6,'#3f4c2a',0,0,-4.2);
      sign('MIGRACIÓN',0,12.6,3.2,g,'#2a3d1a','#ffffff',2.6);staffAt(o,0,-1.2,H2,STAFFC.migration,'#3a4626',true);break;
    case 'claim':{
      const sh=new TH.Shape(),rrs=(s,x,y,w,h,r)=>{s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.absarc(x+w-r,y+r,r,-H2,0);s.lineTo(x+w,y+h-r);s.absarc(x+w-r,y+h-r,r,0,H2);s.lineTo(x+r,y+h);s.absarc(x+r,y+h-r,r,H2,Math.PI);s.lineTo(x,y+r);s.absarc(x+r,y+r,r,Math.PI,Math.PI*1.5);};
      rrs(sh,-14,-5,28,10,5);const hole=new TH.Path();rrs(hole,-10.5,-1.5,21,3,1.5);sh.holes.push(hole);
      const geo=new TH.ExtrudeGeometry(sh,{depth:3.2,bevelEnabled:false,curveSegments:14});geo.rotateX(H2);const m=new TH.Mesh(geo,mat('#8f989f',{metalness:.4,roughness:.4}));m.position.y=3.2;m.castShadow=m.receiveShadow=true;g.add(m);
      const sh2=new TH.Shape();rrs(sh2,-13.4,-4.4,26.8,8.8,4.4);const h2=new TH.Path();rrs(h2,-11.2,-2.2,22.4,4.4,2.2);sh2.holes.push(h2);const g2=new TH.ExtrudeGeometry(sh2,{depth:0.3,bevelEnabled:false,curveSegments:14});g2.rotateX(H2);const m2=new TH.Mesh(g2,mat('#2f353a'));m2.position.y=3.5;g.add(m2);
      B(21,4.2,3,'#59636c',0,0,0);B(3,4,6,'#575f65',0,0,-6.5);
      B(0.6,13,0.6,'#59636c',-13,0,6.6);sign('EQUIPAJE',-13,13,6.6,g,'#1d3a52','#ffffff',2.6);if(!GHOST){B(0.5,7,0.5,'#59636c',13,0,6.4);fidsMesh(FIDS.arr.m,6.4,4,13,9,6.85,g);}staffAt(o,13.4,-6.6,Math.PI,STAFFC.claim,null,false,true);break;}
    case 'gate':
      B(6,4.4,2.6,'#3a3f45',0,0,0.6);B(6.3,0.4,2.9,'#d0d6db',0,4.4,0.6);B(2.4,1.8,0.2,'#3aa0ff',-1.5,4.8,-0.4,{emissive:col('#1a6fd0'),emissiveIntensity:.8});
      B(0.6,15,0.6,'#59636c',-3.4,0,-3.4);sign('PUERTA '+(o.stand?o.stand.num:'?'),-0.6,13.6,-3.3,g,o.stand?'#ffc629':'#ff5a5f','#141414',3.2);if(!GHOST)fidsMesh(fidsGate(o),4.8,2.4,-0.6,9.9,-3.15,g);
      staffAt(o,0.6,-1.6,H2,STAFFC.gate);break;
    case 'bench':
      B(15.6,0.6,3.2,'#59636c',0,2.1,0.4);[-6,-2,2,6].forEach(x=>{B(3.4,0.8,3.2,'#2f3b4b',x,2.6,0.4);B(3.4,4.2,0.7,'#252e3a',x,2.6,-1.5);});B(0.6,2.2,2.6,'#59636c',-7.4,0,0.4);B(0.6,2.2,2.6,'#59636c',7.4,0,0.4);break;
    case 'wc':
      B(16,12,0.8,'#d8e4ec',0,0,-7.6);B(0.8,12,16,'#d8e4ec',-7.6,0,0);B(0.8,12,16,'#d8e4ec',7.6,0,0);B(5,12,0.8,'#d8e4ec',-5.5,0,7.6);B(5,12,0.8,'#d8e4ec',5.5,0,7.6);
      B(0.6,9,10,'#9fb3c2',0,0,-2.5);B(12,3.4,2,'#f4f6f8',0,0,-6);B(16.4,0.8,16.4,'#c3cdd5',0,12,0);B(6,1.4,0.8,'#3b6ea5',0,12.8,7.9);
      sign('WC',0,15.6,8.2,g,'#2f6db5','#ffffff',3.2);break;
    case 'food':{const cc=pick(['#d6343a','#ec8a2f','#1f9e6a','#6d4c41']);
      B(16,10,1,'#4a3a2a',0,0,-7.4);B(14,4.6,3,'#3a2c20',0,0,-3);B(14.4,0.5,3.4,'#e6dccb',0,4.6,-3);B(16,1.4,5,cc,0,12,-5.4);
      B(2.4,2.6,2,'#1b1b1b',4,5.1,-3.4);gbox(4,2.6,2.4,GLASS,-3,5.1,-3,g);B(3.6,1.4,2,'#c98a4a',-3,5.2,-3);
      cyl(2.2,0.4,'#7a5c3c',-4,4,4,g);cyl(0.4,4,'#3a3a3a',-4,0,4,g);cyl(2.2,0.4,'#7a5c3c',4,4,4,g);cyl(0.4,4,'#3a3a3a',4,0,4,g);
      [[-7,4],[-1,4],[1,4],[7,4]].forEach(([x,z])=>B(1.6,2.6,1.6,'#2b2b2b',x,0,z));
      sign('CAFÉ',0,12.7,-2.8,g,cc,'#ffffff',2.4);staffAt(o,-2.5,-5.6,H2,STAFFC.food,cc);staffAt(o,3,-5.6,H2,STAFFC.food,cc);break;}
    case 'shop':
      B(16,11,0.8,'#3d2f55',0,0,-7.6);B(0.8,11,16,'#3d2f55',-7.6,0,0);B(0.8,11,16,'#3d2f55',7.6,0,0);
      [-4.5,1].forEach(x=>{B(3,7,10,'#6a4f8f',x,0,-1.5);for(let k=0;k<4;k++)B(3.2,1.2,2,pick(['#f2b705','#d6343a','#2f6db5','#1f9e6a','#f4f1ea']),x,2+k*1.6,-5+k*2.4);});
      B(5,4.4,2.6,'#2b2b2b',5,0,4.6);B(16.4,1.4,1,'#7b4fb0',0,11,7.8);sign('DUTY FREE',0,13.6,8,g,'#7b4fb0','#ffffff',2.8);staffAt(o,5,2,H2,STAFFC.shop);break;
    case 'customs':
      B(16,0.12,8,'#2b2f33',0,0,1);B(12,4.4,3,'#b9c0c6',0,0,-0.4,{metalness:.5,roughness:.3});B(12.4,0.4,3.4,'#e9ecef',0,4.4,-0.4);
      B(0.5,13,0.5,'#59636c',-7.4,0,-3.4);B(0.5,13,0.5,'#59636c',7.4,0,-3.4);sign('NADA QUE DECLARAR',-3.6,12.6,-3.3,g,'#1f9e6a','#ffffff',2.2);sign('DECLARAR',4.4,12.6,-3.3,g,'#d6343a','#ffffff',2.2);
      staffAt(o,-2,-2.6,H2,'#20374f','#172838');staffAt(o,3,-2.6,H2,'#20374f','#172838');break;
    case 'wrap':
      B(14,0.12,7,'#2b2f33',0,0,0);cyl(2.8,1.6,'#3a3f45',-3,0,0,g);cyl(2.6,0.3,'#9aa3aa',-3,1.6,0,g);B(0.7,8,0.7,'#59636c',-3,0,-3.2);B(1.4,1.6,1.4,'#59636c',-3,6,-2.4);
      {const film=new TH.Mesh(new TH.CylinderGeometry(2,2,3.4,16,1,true),new TH.MeshStandardMaterial({color:col('#9be8c0'),transparent:true,opacity:.45,side:TH.DoubleSide,roughness:.2}));film.position.set(-3,3.6,0);g.add(film);}
      B(5,4,3,'#e9ecef',4,0,-1);B(5.2,0.4,3.2,'#2f6db5',4,4,-1);sign('ENVOLTURA',0,10,-3.4,g,'#2f6db5','#ffffff',2.4);B(0.5,10,0.5,'#59636c',-6.6,0,-3.4);
      staffAt(o,1,-2.4,H2,'#2f6db5');break;
    case 'porter':
      B(4,4.4,4,'#2f6db5',0,0,-1);B(4.2,0.4,4.2,'#f2b705',0,4.4,-1);B(0.5,12,0.5,'#59636c',0,0,-3);sign('MALETEROS',0,12,-2.7,g,'#f2b705','#141414',2.2);
      [-2.6,2.6].forEach(x=>{B(2.6,0.3,4,'#9aa3aa',x,1.2,2.6);B(0.3,4,0.3,'#9aa3aa',x,0,4.4);});break;
    case 'news':
      B(6,9,6,'#2b3a4a',0,0,-0.6);B(6.4,0.6,6.4,'#d6343a',0,9,-0.6);B(5.6,3.6,1,'#e9ecef',0,0,2.6);
      for(let k=0;k<6;k++)B(0.9,1.2,0.3,pick(['#f2b705','#d6343a','#2f6db5','#1f9e6a','#f4f1ea']),-2.2+(k%3)*2.2,4.6+Math.floor(k/3)*1.5,2.5);
      sign('KIOSKO',0,10.8,2.4,g,'#d6343a','#ffffff',1.8);staffAt(o,0,-1,H2,'#d6343a');break;
    case 'pharmacy':
      B(16,11,0.8,'#e9f2ee',0,0,-7.6);B(0.8,11,16,'#e9f2ee',-7.6,0,0);B(0.8,11,16,'#e9f2ee',7.6,0,0);
      [-4,1.5].forEach(x=>{B(3,7.5,10,'#f4f6f8',x,0,-1.5);for(let k=0;k<5;k++)B(3.2,0.9,1.6,pick(['#1f9e6a','#2f6db5','#f4f1ea','#d6343a']),x,1.6+k*1.4,-5+k*2);});
      B(5,4.4,2.6,'#1f9e6a',5,0,4.6);B(16.4,1.4,1,'#1f9e6a',0,11,7.8);B(1.2,3.6,0.4,'#3ccf91',-6,11.4,8.4,{emissive:col('#22cc66'),emissiveIntensity:1});B(3.6,1.2,0.4,'#3ccf91',-6,12.6,8.4,{emissive:col('#22cc66'),emissiveIntensity:1});
      sign('FARMACIA',1.5,13.4,8.1,g,'#1f9e6a','#ffffff',2.6);staffAt(o,5,2,H2,'#f4f6f8');break;
    case 'exchange':
      B(14,4.4,3,'#3a3f45',0,0,0);gbox(14,5,0.3,GLASS,0,4.4,1.2,g);B(14.4,0.5,3.4,'#c9a05a',0,9.4,0);B(14,9.4,0.6,'#2b2f33',0,0,-3.2);
      B(10,3.6,0.3,'#141414',0,10,-3);B(9.4,3,0.2,'#ffb000',0,10.3,-2.8,{emissive:col('#ff9000'),emissiveIntensity:.9});sign('CAMBIO · EXCHANGE',0,15,-3,g,'#c9a05a','#141414',2.4);
      staffAt(o,-3,-1.6,H2,'#2b2f33');staffAt(o,3,-1.6,H2,'#2b2f33');break;
    case 'rental':
      B(14,4.4,3,'#e9ecef',0,0,0);B(14.4,0.5,3.4,'#d6343a',0,4.4,0);B(14,11,0.6,'#d6343a',0,0,-3.2);sign('ALQUILER DE AUTOS',0,8.6,-2.8,g,'#ffffff','#d6343a',2.2);
      B(4,1.4,2,'#2f6db5',-4,0,2.6);B(2.2,1.2,1.8,'#1b2733',-4.4,1.4,2.6);staffAt(o,-3,-1.6,H2,'#d6343a');staffAt(o,3,-1.6,H2,'#d6343a');break;
    case 'protocol':
      B(14,0.1,4,'#8b1a1a',0,0.02,4.6);B(12,4.4,3,'#3a2416',0,0,-0.2);B(12.4,0.4,3.4,'#c9a05a',0,4.4,-0.2);B(14,12,0.6,'#141414',0,0,-3.4);
      sign('PROTOCOLO · VIP',0,10,-3,g,'#141414','#e6c27a',2.4);cyl(0.4,3.6,'#c9a05a',-6,0,6.6,g);cyl(0.4,3.6,'#c9a05a',6,0,6.6,g);B(12,0.3,0.3,'#8b1a1a',0,3.2,6.6);
      staffAt(o,-2.5,-1.8,H2,'#141414','#141414');staffAt(o,2.5,-1.8,H2,'#141414','#141414');break;
    case 'lounge':{const lv=o.lv||1;
      B(32,0.12,24,'#3b2f2a',0,0,0);B(32,12,0.8,'#5a3f2c',0,0,-11.6);
      [-15.6,15.6].forEach(x=>{gbox(0.6,12,24,GLASS,x,0,0,g);B(0.7,1.2,24,'#c9a05a',x,12,0);B(0.7,2.4,24,'#e9ecef',x,4.6,0,{transparent:true,opacity:.55});});
      [-9.5,9.5].forEach(x=>{gbox(13,12,0.6,GLASS,x,0,11.6,g);B(13,1.2,0.7,'#c9a05a',x,12,11.6);B(13,2.4,0.7,'#e9ecef',x,4.6,11.6,{transparent:true,opacity:.55});});
      sign(lv>=3?'SALA VIP · SPA':'SALA VIP',0,14.6,11.9,g,'#141414','#e6c27a',3.2);B(10,1.6,0.6,'#141414',0,13.8,11.9);
      const n=seatsOf(o),cols=n>20?6:n>12?5:4,rows=Math.ceil(n/cols);for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols),lx=-12+c*(24/(cols-1)),lz=-8.5+r*(13/Math.max(1,rows-1));
        B(3.4,2.2,3.4,i%2?'#3a2f4f':'#4a3a5f',lx,0,lz);B(3.4,2.4,0.8,'#2b2238',lx,2.2,lz-1.4);}
      B(10,4.6,2.6,'#2b1d14',8,0,-8.4);B(10.4,0.4,3,'#c9a05a',8,4.6,-8.4);for(let k=0;k<5;k++)B(0.6,1.6,0.6,pick(['#7a1f2b','#c9a05a','#1f9e6a','#e9ecef']),4.6+k*1.6,6.4,-10.6);
      staffAt(o,8,-10.4,H2,'#141414','#141414');cyl(1.6,3,'#6b4b2e',-14,0,-10,g);{const b=new TH.Mesh(SPHG,mat('#3f7f39',{roughness:.9}));b.scale.set(2.4,3.6,2.4);b.position.set(-14,5.4,-10);g.add(b);}
      if(lv>=3){cyl(3,0.8,'#5bc0eb',-6,0,-6,g);B(6,0.4,0.4,'#c9a05a',-6,0.8,-6);}break;}
    case 'plant':cyl(3,4,'#6b4b2e',0,0,0,g);{const b=new TH.Mesh(SPHG,mat('#3f7f39',{roughness:.9}));b.scale.set(3.6,4.6,3.6);b.position.set(0,8,0);b.castShadow=true;g.add(b);}break;
    default:if(d.land){const w=o.rw*CELL,h=o.rh*CELL;const lv=o.lv||1;
        B(5,6,5,'#e9ecef',-w/2+8,0,-h/2-1);B(5.4,0.6,5.4,'#2f6db5',-w/2+8,6,-h/2-1);B(0.4,1,10,'#f2b705',-w/2+8,3,-h/2+5);
        B(0.6,12,0.6,'#59636c',w/2-6,0,-h/2-1);sign('P',w/2-6,12,-h/2-1,g,'#2f6db5','#ffffff',4);
        [[-w/2+2,-h/2+2],[w/2-2,h/2-2],[-w/2+2,h/2-2],[w/2-2,-h/2+2]].forEach(([x,z])=>{cyl(0.5,18,'#7d868d',x,0,z,g);B(4,0.8,2,'#3a3f45',x,18,z);});
        if(lv>=2){[-h/2+14,h/2-14].forEach(z=>{for(let x=-w/2+6;x<=w/2-6;x+=w/4)B(0.6,7,0.6,'#8b959d',x,0,z+(z<0?-7:7));B(w-6,0.6,13,'#d5d9dd',0,7,z);B(w-6,0.2,12,'#1d3346',0,7.6,z,{metalness:.6,roughness:.25});});}
        if(lv>=3){B(w,0.8,h,'#b9bec3',0,12,0);for(let x=-w/2+4;x<=w/2-4;x+=w/5)for(const z of [-h/2+4,0,h/2-4])B(1.2,12,1.2,'#9aa3aa',x,0,z);B(w,2,0.6,'#9aa3aa',0,12.8,h/2);B(w,2,0.6,'#9aa3aa',0,12.8,-h/2);B(10,0.6,30,'#a9aeb3',w/2+5,0,0);}
        break;}
      if(d.apron&&!GHOST){const lx=-o.rw*CELL/2+3,lz=o.rh*CELL/2-3;B(0.6,12,0.6,'#59636c',lx,0,lz);sign('P'+o.num,lx,12,lz,g,'#ffc629','#141414',4);
      B(1.2,0.8,1.2,'#ffcc00',0,0,o.rh*CELL/2-5.4);
      // guía de atraque visual (VDGS) en el borde de la terminal
      if(o.gy+o.rh===APR){B(0.5,9,0.5,'#59636c',0,0,o.rh*CELL/2+1.5);B(5,3.4,0.8,'#141414',0,9,o.rh*CELL/2+1.5);B(4.2,2.6,0.2,'#ffb000',0,9.4,o.rh*CELL/2+1.05,{emissive:col('#ff9000'),emissiveIntensity:.9});}}
  }
  const lv=o.lv||1;if(lv<2)return;
  switch(o.k){
    case 'checkin':B(3.2,2.4,0.3,'#15191d',3,5.1,0.6);B(2.8,2,0.1,'#3aa0ff',3,5.3,0.8,{emissive:col('#1a6fd0'),emissiveIntensity:.8});staffAt(o,4,-1.4,H2,STAFFC.checkin);
      if(lv>=3){[-5.5,5.5].forEach(x=>{B(2.4,5.6,1.6,'#e9ecef',x,0,3.4);B(1.8,1.4,0.2,'#3aa0ff',x,4,4.25,{emissive:col('#1a6fd0'),emissiveIntensity:.9});});}break;
    case 'security':{const ring=new TH.Mesh(new TH.TorusGeometry(3.4,0.9,10,22),mat(lv>=3?'#e9ecef':'#cfd6dc',{metalness:.3,roughness:.35}));ring.position.set(4,4.2,-1);g.add(ring);ring.castShadow=true;
      if(lv>=3){B(1.2,3.4,22,'#7d868d',8.2,0,0);for(let z=-9;z<10;z+=3)B(1.6,0.3,2.2,'#b9c0c6',8.2,3.5,z);}break;}
    case 'migration':[-2.4,2.4].forEach(x=>{gbox(0.6,4.6,4,GLASS,x,0,6,g);B(0.7,0.3,4,'#3ccf91',x,4.6,6,{emissive:col('#22aa66'),emissiveIntensity:1});});break;
    case 'claim':B(4,2.4,0.3,'#15191d',-13,10,7);B(3.6,2,0.1,'#ffb000',-13,10.2,7.2,{emissive:col('#ff9000'),emissiveIntensity:.9});break;
    case 'gate':B(4,4.4,2,'#3a3f45',0,0,3.2);B(0.8,1.6,1.2,'#3ccf91',2.6,4.4,3.2,{emissive:col('#22aa66'),emissiveIntensity:.8});staffAt(o,-1.6,1.6,H2,STAFFC.gate);break;
    case 'wc':B(16.4,1,1,'#3b6ea5',0,13.6,7.9);break;
    case 'food':cyl(2.2,0.4,'#c9a05a',0,4,-0.4+4.6,g);cyl(0.4,4,'#3a3a3a',0,0,4.2,g);B(16.2,0.6,5.2,'#f2c230',0,13.4,-5.4);if(lv>=3){B(16,8,0.4,'#e6dccb',0,2,7.6,{transparent:true,opacity:.0});B(2,2,2,'#3f7f39',-7,0,7);B(2,2,2,'#3f7f39',7,0,7);}break;
    case 'shop':B(16.4,0.5,1,'#ffd21a',0,12.4,7.9,{emissive:col('#ffb000'),emissiveIntensity:.6});if(lv>=3)gbox(15,9,0.3,GLASS,0,0,7.7,g);break;
  }
}
/* ---- pasarelas telescópicas ---- */
let BRIDGES=[];
function bridgeRot(s){const side=(s.gate&&s.gate.cx>=s.cx)?1:-1;return[clamp(s.cx+side*20,s.gx*CELL+6,(s.gx+s.rw)*CELL-6),APR*CELL-3];}
function buildBridges(W){BRIDGES=[];for(const s of G.objs){if(!s.def.apron||!s.bridge)continue;const [rx,rz]=bridgeRot(s);
  cyl(3.6,10,'#8d969d',rx,0,rz,W);cyl(3.9,0.8,'#59636c',rx,10,rz,W);
  const tun=new TH.Group();tun.position.set(rx,6,rz);W.add(tun);const parts=[];
  const mk=(w,h,d,c,x,y,z,o)=>{const m=new TH.Mesh(BOXG,typeof c==='string'?mat(c,o):c);m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;tun.add(m);parts.push(m);return m;};
  const body=mk(1,4.2,4.6,'#c9ced3',0.5,2.1,0),win=mk(1,1,4.7,'#1d3346',0.5,3,0),roof=mk(1,0.5,5,'#8d969d',0.5,4.4,0);
  const cab=new TH.Group();W.add(cab);const cb=new TH.Mesh(BOXG,mat('#aeb5bb'));cb.scale.set(5,5,6);cb.position.y=2.4;cb.castShadow=true;cab.add(cb);const hood=new TH.Mesh(BOXG,mat('#2b3036'));hood.scale.set(1,4.4,6.2);hood.position.set(3,2.4,0);cab.add(hood);
  const leg=new TH.Mesh(BOXG,mat('#3a3f45'));leg.scale.set(1.4,1,1.4);W.add(leg);const wh=new TH.Mesh(BOXG,mat('#1c1c1c'));wh.scale.set(5,2,3);W.add(wh);
  BRIDGES.push({s,rx,rz,tun,parts:[body,win,roof],cab,leg,wh,cur:null});}}
function syncBridges(dt){for(const b of BRIDGES){const s=b.s,f=s.f,p=f&&f.plane;let tx,tz,ty;
    if(p&&(p.state==='parked'||(p.state==='taxiIn'&&p.path.length<3))&&p.state==='parked'){const d=door(p),R0=Math.max(1.8,p.T.len*PSCALE*0.058);const side=d[0]>=p.x?1:-1;tx=d[0]+side*3.2;tz=d[1];ty=R0+2.6-2.6;}
    else{tx=b.rx+((s.gate&&s.gate.cx>=s.cx)?1:-1)*6;tz=b.rz-32;ty=4;}
    if(!b.cur)b.cur=[tx,tz,ty];const k=Math.min(1,dt*0.9);b.cur[0]=lerp(b.cur[0],tx,k);b.cur[1]=lerp(b.cur[1],tz,k);b.cur[2]=lerp(b.cur[2],ty,k);
    const dx=b.cur[0]-b.rx,dz=b.cur[1]-b.rz,len=Math.max(6,Math.hypot(dx,dz)-4),ang=Math.atan2(dz,dx);
    b.tun.rotation.y=-ang;b.tun.position.y=6;b.tun.rotation.z=Math.atan2(b.cur[2]+2-6,len);b.parts.forEach(m=>{m.scale.x=len;m.position.x=len/2;});
    b.cab.position.set(b.rx+Math.cos(ang)*(len+3),b.cur[2],b.rz+Math.sin(ang)*(len+3));b.cab.rotation.y=-ang;
    const lx=b.rx+Math.cos(ang)*len*0.72,lz=b.rz+Math.sin(ang)*len*0.72,ly=6+(b.cur[2]+2-6)*0.72;b.leg.scale.y=ly;b.leg.position.set(lx,ly/2,lz);b.wh.position.set(lx,1,lz);b.wh.rotation.y=-ang;}}

/* ---- pista en 3D: luces, PAPI, ALS, manga de viento, letreros ---- */
let RWG=null,RWYGLOW=null,WSOCK=null,ALS=[];
function rwSign(text,x,z,par,bg,fg,face){const g=new TH.Group();g.position.set(x,0,z);g.rotation.y=face||0;par.add(g);
  const {t,ar}=textTex(text,bg,fg,64);const w=3.4*ar+1.2;gbox(w,3.8,1.2,'#1b1b1b',0,0.9,0,g);[[-w/2+0.6],[w/2-0.6]].forEach(([lx])=>gbox(0.5,1,0.5,'#555',lx,0,0,g));
  [-0.62,0.62].forEach(dz=>{const m=new TH.Mesh(new TH.PlaneGeometry(w-0.6,3.2),new TH.MeshBasicMaterial({map:t,toneMapped:false}));m.material.userData.own=true;m.position.set(0,2.8,dz);if(dz<0)m.rotation.y=Math.PI;g.add(m);});}
function buildRunway3D(){
  if(RWG){scene.remove(RWG);disposeGroup(RWG);}RWG=new TH.Group();scene.add(RWG);ALS=[];
  const pos=[],colr=[];const add=(x,y,z,c)=>{pos.push(x,y,z);const cc=new TH.Color(c);colr.push(cc.r,cc.g,cc.b);};
  const two=G.up.rwy2,ils=G.up.ils,rapid=G.up.rapid;
  const rws=[RWY_Z];if(two)rws.push(RWY2_Z);
  for(const RZ of rws){
    for(let x=-90;x<=THR_X;x+=40){[RZ-23,RZ+23].forEach(z=>{gbox(0.9,1.2,0.9,'#e8e6dc',x,0,z,RWG);add(x,1.6,z,x>THR_X-600?0xffe0a0:0xfff4e0);});}
    for(let x=-60;x<THR_X;x+=16)add(x,0.3,RZ,x<-60+600&&false?0xff4040:0xffffff);
    for(let i=0;i<9;i++){add(THR_X+2,1.2,RZ-20+i*5,0x30ff70);add(-92,1.2,RZ-20+i*5,0xff3b30);gbox(1,0.8,1,'#556',THR_X+2,0,RZ-20+i*5,RWG);}
    // letrero de cabecera
    rwSign(RZ===RWY_Z?(two?'27L-09R':'27-09'):'27R-09L',DEP_X+20,RZ+34,RWG,'#c8202a','#ffffff',Math.PI/2);}
  for(let x=-60;x<=DEP_X+10;x+=34){add(x,1,TWY_Z+12,0x3d8bff);add(x,1,TWY_Z-12,0x3d8bff);if(x<EXITS[0]+10)add(x,1,TWY2_Z-11,0x3d8bff);}
  for(let x=-60;x<=DEP_X;x+=17)add(x,0.3,TWY_Z,0x40ff90);
  // letreros de calles de salida
  const LET='ABCDEFGHJK';EXITS.forEach((X,i)=>{if(X===-40)return;rwSign(LET[i],X+(rapid?40:22),RWY_Z+(rapid?30:36),RWG,'#1b1b1b','#ffd21a',Math.PI/2);});
  rwSign('A',DEP_X-40,TWY_Z-20,RWG,'#1b1b1b','#ffd21a',Math.PI/2);
  // manga de viento
  {const wx=TD_X-60,wz=RWY_Z-46;cyl(0.5,16,'#d7d7d7',wx,0,wz,RWG);const pv=new TH.Group();pv.position.set(wx,15.5,wz);RWG.add(pv);
   for(let i=0;i<5;i++){const c=new TH.Mesh(new TH.CylinderGeometry(1.6-i*0.22,1.38-i*0.22,2.2,10,1,true),mat(i%2?'#ffffff':'#ff6a00',{side:TH.DoubleSide}));c.rotation.z=Math.PI/2;c.position.x=1.1+i*2.2;c.castShadow=true;pv.add(c);}WSOCK=pv;}
  if(ils){// PAPI
    for(let i=0;i<4;i++){const z=RWY_Z-34-i*5;gbox(2.6,1.6,2.2,'#2b2f33',TD_X-40,0,z,RWG);add(TD_X-41.4,1.2,z,i<2?0xffffff:0xff3030);}
    // luces de aproximación con destellos secuenciales
    for(let k=1;k<=12;k++){const X=THR_X+k*26,h=1.5+k*0.18;cyl(0.35,h,'#888',X,0,RWY_Z,RWG);gbox(0.6,0.6,14,'#555',X,h,RWY_Z,RWG);for(let j=-2;j<=2;j++)add(X,h+0.6,RWY_Z+j*3,0xfff2c8);
      if(k%3===0){gbox(0.6,0.6,26,'#555',X,h,RWY_Z,RWG);[-11,-9,9,11].forEach(j=>add(X,h+0.6,RWY_Z+j,0xfff2c8));}ALS.push([X,h+1.2,RWY_Z]);}
    // localizador al otro extremo
    for(let j=-7;j<=7;j++){gbox(0.5,4,0.5,'#c4c8cc',-150,0,RWY_Z+j*3,RWG);gbox(0.4,0.4,2.2,'#c4c8cc',-150,4,RWY_Z+j*3,RWG);}gbox(5,4,4,'#e9ecef',-160,0,RWY_Z+26,RWG);
    // antena de senda de planeo
    cyl(0.5,22,'#c8202a',TD_X-20,0,RWY_Z-52,RWG);gbox(4,3,4,'#e9ecef',TD_X-24,0,RWY_Z-52,RWG);}
  bake(RWG);
  const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(pos,3));g.setAttribute('color',new TH.Float32BufferAttribute(colr,3));
  RWYGLOW=new TH.Points(g,new TH.PointsMaterial({size:8,map:GLOWT,vertexColors:true,transparent:true,depthWrite:false,blending:TH.AdditiveBlending,opacity:0,fog:false,toneMapped:false}));RWG.add(RWYGLOW);
  const rab=new TH.Sprite(GL_WHT.clone());rab.scale.set(26,26,1);rab.visible=false;RWG.add(rab);RWG.userData.rab=rab;
}
const nightLights=[];[[90,170],[256,170],[420,170],[90,250],[256,250],[420,250]].forEach(([x,z])=>{const l=new TH.PointLight(0xffe7c2,0,360,1.6);l.position.set(x,46,z);scene.add(l);nightLights.push(l);});

/* ---- vehículos de rampa ---- */
const GSEL=[];let GSEG=null;const GDR=2.4;
function mkGSE(p){if(typeof makeVeh!=='function')return;
  const L=p.T.len*PSCALE,S=p.T.span*PSCALE,R0=Math.max(1.8,L*0.058);const g=p.f.stand&&p.f.stand.gate;const s=g&&g.cx>=p.x?-1:1;const T0=G.t,W=Math.max(30,(p.f.std+3)-T0),big=p.T.size>=2;
  p.gseS=s;p.gi={};
  const add=(type,key,x,z,h,a,b)=>{const v=makeVeh(type);v.visible=false;const tin=T0+a*W,tout=Math.max(tin+GDR+1,T0+b*W-GDR);
    const T=[x,z],A=[x-Math.cos(h)*18,z-Math.sin(h)*18],sd=Math.sign(x-p.x)||s,O=[x+sd*80,p.z-L/2-34];
    const it={v,p,type,key,T,A,O,h,tin,tout,hc:Math.atan2(A[1]-O[1],A[0]-O[0])};
    if(type==='tug')it.ld=[1,2,3].map(c=>v.getObjectByName('ld'+c));if(type==='cater'){it.body=v.getObjectByName('body');it.sc=v.getObjectByName('sc');}if(type==='stairs')it.st=v.getObjectByName('st');
    GSEL.push(it);p.gi[key]=it;return it;};
  const tw=s>0?Math.PI:0,tn=s>0?0:Math.PI,H2=Math.PI/2;
  add('gpu','gpu',p.x+s*(R0+5),p.z+L/2-9,H2,0,0.95);
  add('belt','belt',p.x+s*(R0+8.5),p.z-L*0.2,tw,0.03,0.9);
  add('tug','tug',p.x+s*(R0+22),p.z-L*0.16,H2,0.05,0.88);
  add('fuel','fuel',p.x+s*S*0.34,p.z+L*0.02,H2,0.14,0.62);
  add('stairs','stairs',p.x+s*(R0+7.6),p.z-L*0.3,tw,0.08,0.68);
  add('clean','clean',p.x+s*(R0+33),p.z-L*0.42,tw,0.09,0.64);
  if(big){add('cater','cater',p.x-s*(R0+9.2),p.z-L*0.3,tn,0.12,0.6);add('water','water',p.x-s*(R0+8.4),p.z-L*0.44,tn,0.18,0.36);add('lav','lav',p.x-s*(R0+8.4),p.z-L*0.44,tn,0.4,0.58);}
}
function rmGSE(p){const t=G.t;for(const it of GSEL){if(it.p!==p)continue;if(t<it.tin){it.tin=it.tout=t-10*GDR;}else if(t<it.tin+GDR)it.tout=it.tin+GDR;else if(t<it.tout)it.tout=t;}}
function gseAt(it,t){const {T,A,O}=it;const ease=u=>u<.5?2*u*u:1-2*(1-u)*(1-u);
  if(t<it.tin)return null;
  if(t<it.tin+GDR){const u=ease((t-it.tin)/GDR),a=1-u;const x=a*a*O[0]+2*a*u*A[0]+u*u*T[0],z=a*a*O[1]+2*a*u*A[1]+u*u*T[1];
    const dx=2*a*(A[0]-O[0])+2*u*(T[0]-A[0]),dz=2*a*(A[1]-O[1])+2*u*(T[1]-A[1]);return[x,z,Math.atan2(dz,dx),0];}
  if(t<=it.tout)return[T[0],T[1],it.h,1];
  if(t<it.tout+GDR){const u=ease((t-it.tout)/GDR);if(u<0.3){const k=u/0.3;return[T[0]+(A[0]-T[0])*k,T[1]+(A[1]-T[1])*k,it.h,0];}
    const k=(u-0.3)/0.7;return[A[0]+(O[0]-A[0])*k,A[1]+(O[1]-A[1])*k,Math.atan2(O[1]-A[1],O[0]-A[0]),0];}
  return false;}
function updGSE(dt){if(GSEG!==G){GSEL.forEach(it=>scene.remove(it.v));GSEL.length=0;GSEG=G;}const sp=Math.max(1,G.speed||1);
  for(let i=GSEL.length-1;i>=0;i--){const it=GSEL[i],r=gseAt(it,G.t);
    if(r===false){scene.remove(it.v);GSEL.splice(i,1);if(it.p.gi&&it.p.gi[it.key]===it)delete it.p.gi[it.key];continue;}
    if(!r){it.v.visible=false;continue;}if(!it.v.visible){it.v.visible=true;it.hc=r[2];}
    it.hc=r[3]?r[2]:lerpAng(it.hc,r[2],Math.min(1,dt*5*sp));it.v.position.set(r[0],0,r[1]);it.v.rotation.y=-it.hc;}}
const gOn=it=>it&&G.t>=it.tin+GDR&&G.t<=it.tout,gPh=it=>clamp((G.t-it.tin-GDR)/Math.max(1,it.tout-it.tin-GDR),0,1);
const CLEANL=i=>staffLook(i,'#7b4fb0','#7b4fb0',false),CATL=i=>staffLook(i,'#f4f6f8','#d6343a',false);
function hoseBit(x0,z0,x1,z1,y,c){const dx=x1-x0,dz=z1-z0,l=Math.hypot(dx,dz);if(l<0.2)return;bit((x0+x1)/2,y,(z0+z1)/2,l,0.4,0.4,c||'#151515',-Math.atan2(dz,dx));}
function rampFX(p,L,R0){const gi=p.gi||{},s=p.gseS||1,t=G.t,S=p.T.span*PSCALE,sill=0.45*R0+2.6;
  const at=(it,lx,lz)=>{const v=it.v.position,c=Math.cos(it.hc),sn=Math.sin(it.hc);return[v.x+lx*c-lz*sn,v.z+lx*sn+lz*c];};
  // GPU: cable a la nariz
  if(gOn(gi.gpu)){const v=gi.gpu.v.position;hoseBit(v.x,v.z,p.x+s*1.5,p.z+L/2-6,0.3);}
  // combustible: manguera por el piso, columna al ala, operador
  if(gOn(gi.fuel)){const u=gPh(gi.fuel);if(u>0.04&&u<0.96){const [hx,hz]=at(gi.fuel,-11*0.8,0),wx=p.x+s*S*0.22,wz=p.z-L*0.06,wy=0.62*R0+2.4;
      hoseBit(hx,hz,wx,wz,0.35);bit(wx,0,wz,0.5,wy,0.5,'#151515');bit(wx,wy-0.3,wz,1.6,0.6,1.6,'#59636c');
      person3(wx+s*2.6,wz+2,s>0?Math.PI:0,RAMP(p.id+9),0,null,false,false,'reach');
      const [lx,lz]=at(gi.fuel,9,2.9);bit(lx,5.4,lz,0.6,0.6,0.6,Math.floor(t*2)%2?'#3cff7a':'#1d6b3a');}}
  // cinta y carros: bajan maletas al llegar, suben al salir
  if(gOn(gi.belt)){const u=gPh(gi.belt),up=u>0.55,act=u<0.45||u>0.55;const [l0x,l0z]=at(gi.belt,-8,0),[l1x,l1z]=at(gi.belt,9.6,0);
    if(act&&p.f)for(let k=0;k<4;k++){let q=((t*0.9+k/4)%1);if(!up)q=1-q;bit(l0x+(l1x-l0x)*q,1.9+q*4.3,l0z+(l1z-l0z)*q,2.2,1.5,2.6,BAGC[(k+p.id)%BAGC.length],-gi.belt.hc);}
    person3(l0x+Math.cos(gi.belt.hc)*-2.4,l0z+Math.sin(gi.belt.hc)*-2.4+1.6,gi.belt.hc,RAMP(p.id+3),0,null,false,false,act?'reach':null);}
  if(gi.tug&&gi.tug.ld){const it=gi.tug,u=gOn(it)?gPh(it):(G.t<it.tin+GDR?0:1);const n=u<0.45?Math.ceil(u/0.45*3):u<0.55?3:Math.max(0,3-Math.floor((u-0.55)/0.45*3.2));it.ld.forEach((m,i)=>{if(m)m.visible=i<n;});
    if(it.v.visible){const [dx,dz]=at(it,-1.8,0);person3(dx,dz,it.hc,RAMP(p.id+4),0,null,false,true,null,1.5);}}
  // catering: la caja sube hasta la puerta
  if(gi.cater&&gi.cater.body){const it=gi.cater;let lift=0;if(gOn(it)){const u=gPh(it);lift=u<0.15?u/0.15:u>0.85?(1-u)/0.15:1;}const H=Math.max(1.2,sill-2.7)*lift;
    it.body.position.y=3.4+H/0.8;if(it.sc)it.sc.scale.y=0.2+H/0.8/5.6;
    if(lift>0.98){const [cx,cz]=at(it,8.6,1.6);person3(cx,cz,it.hc,CATL(p.id),G.t*2,null,false,false,'push',2.7+H);bit(cx+Math.cos(it.hc)*1.8,2.7+H+1.4,cz+Math.sin(it.hc)*1.8,2.2,3,1.6,'#c9ced3',-it.hc);}}
  // escalera de servicio y cuadrilla de limpieza
  let top=null,foot=null;if(gi.stairs&&gi.stairs.st){const it=gi.stairs,Hs=Math.max(0.5,sill/0.8-2.4);it.st.scale.y=Hs;top=at(it,10.6*0.8,0);foot=at(it,-2.6*0.8,0);
    if(gOn(it)&&!(p.f.stand&&p.f.stand.bridge))bit(top[0],sill,top[1],1.4,0.2,1.4,'#9aa3aa');}
  if(gOn(gi.clean)&&top){const u=gPh(gi.clean),van=at(gi.clean,-6.5*0.8,2.6);
    for(let k=0;k<3;k++){const a=u-k*0.035;let x=null,z,y=0,h=0,mv=true;
      if(a>=0&&a<0.1){const q=a/0.1;x=van[0]+(foot[0]-van[0])*q;z=van[1]+(foot[1]-van[1])*q;h=Math.atan2(foot[1]-van[1],foot[0]-van[0]);}
      else if(a>=0.1&&a<0.16){const q=(a-0.1)/0.06;x=foot[0]+(top[0]-foot[0])*q;z=foot[1]+(top[1]-foot[1])*q;y=sill*q;h=Math.atan2(top[1]-foot[1],top[0]-foot[0]);}
      else if(a>=0.8&&a<0.86){const q=(a-0.8)/0.06;x=top[0]+(foot[0]-top[0])*q;z=top[1]+(foot[1]-top[1])*q;y=sill*(1-q);h=Math.atan2(foot[1]-top[1],foot[0]-top[0]);}
      else if(a>=0.86&&a<0.96){const q=(a-0.86)/0.1;x=foot[0]+(van[0]-foot[0])*q;z=foot[1]+(van[1]-foot[1])*q;h=Math.atan2(van[1]-foot[1],van[0]-foot[0]);}
      if(x!==null){const o=(k-1)*1.4;person3(x+Math.sin(h)*o,z-Math.cos(h)*o,h,CLEANL(p.id*3+k),t*9+k,k===1?'backpack':null,mv,false,k===0?'push':null,y);if(k===0)bit(x+Math.cos(h)*2.2,y+1.6,z+Math.sin(h)*2.2,2,2.6,1.6,'#5e3c8f',-h);}}}
  // agua potable y servicio sanitario
  [gi.water,gi.lav].forEach((it,j)=>{if(!gOn(it))return;const [hx,hz]=at(it,-10,0);const fx=p.x-s*(R0*0.8),fz=hz;hoseBit(hx,hz,fx,fz,j?0.4:4.6,j?'#2a2a2a':'#3b82c4');person3(hx-Math.cos(it.hc)*1.4,hz+2.2,it.hc,RAMP(p.id+20+j),0,null,false,false,'reach');});
}

/* ---- vehículos de acceso ---- */
const VM=new Map();
function vehModel(v){const g=new TH.Group(),c=v.c,B=(w,h,d,cc,x,y,z,o)=>{const m=new TH.Mesh(BOXG,typeof cc==='string'?mat(cc,o):cc);m.scale.set(w,h,d);m.position.set(x,y+h/2,z);m.castShadow=true;g.add(m);return m;};
  const glass=mat('#16212b',{roughness:.06,metalness:.75}),tire=mat('#151515',{roughness:.9}),rim=mat('#b9bfc5',{metalness:.85,roughness:.2}),chrome=mat('#d5d9dd',{metalness:.9,roughness:.15}),dark=mat('#1b1d20',{roughness:.6}),lamp=mat('#fff6d8',{emissive:col('#fff2c0'),emissiveIntensity:.9}),tail=mat('#b01818',{emissive:col('#ff2020'),emissiveIntensity:.6}),P={metalness:.55,roughness:.22};
  const wheel=(x,z,r,w)=>{for(const s of [1,-1]){const t=new TH.Mesh(CYLG,tire);t.scale.set(r,w||0.9,r);t.rotation.x=Math.PI/2;t.position.set(x,r,s*z);g.add(t);const h=new TH.Mesh(CYLG,rim);h.scale.set(r*0.58,(w||0.9)+0.06,r*0.58);h.rotation.x=Math.PI/2;h.position.set(x,r,s*z);g.add(h);}};
  if(v.type==='bus'){B(40,7.6,8.6,c,0,0.9,0,{metalness:.25,roughness:.35});B(40.2,2.6,8.8,glass,0,4.6,0);B(40.2,1,8.8,'#2f6db5',0,2.4,0);B(0.4,5.4,7.6,glass,20.1,2.8,0);B(40,0.5,8.2,'#cfd4d8',0,8.5,0);B(10,1.2,6,'#b8bec4',-8,9,0);
    B(40.3,0.6,8.9,dark,0,0.6,0);[-13,13,-7].forEach(x=>wheel(x,3.9,1.8,1));B(0.3,0.8,1.6,lamp,20.2,2,-3);B(0.3,0.8,1.6,lamp,20.2,2,3);B(0.3,0.9,1.6,tail,-20.2,2,-3);B(0.3,0.9,1.6,tail,-20.2,2,3);B(0.3,1.2,6,dark,20.25,6.8,0);}
  else{const k=v.type==='taxi'?0:(v.body||0)%4;
    if(k===3){B(17,3,7.4,c,0,1,0,P);B(7,3,6.8,c,3,4,0,P);B(7.2,2.2,6.9,glass,3,4.3,0);B(8,1.6,7.2,dark,-4.2,3.8,0);B(0.4,1.8,7.2,c,-8.3,3.6,0);}
    else if(k===2){B(17,4,7.8,c,0,1,0,P);B(11,3.2,7.2,c,-1.5,5,0,P);B(11.2,2.4,7.3,glass,-1.5,5.3,0);B(3.4,0.3,7.2,glass,4.4,5,0);B(10,0.3,6,dark,-1.5,8.3,0);}
    else if(k===1){B(14.5,3,7.4,c,0,1,0,P);B(8.6,2.8,6.8,c,-1.6,4,0,P);B(8.8,2.1,6.9,glass,-1.4,4.25,0);B(3.4,0.3,6.8,c,4.8,3.8,0,P);}
    else{B(16,3,7.4,c,0,1,0,P);B(8.4,2.6,6.6,c,-1,4,0,P);B(8.6,2,6.8,glass,-1,4.2,0);B(4,0.3,6.8,c,5,3.8,0,P);B(3,0.3,6.6,c,-6.2,3.8,0,P);}
    const L=k===1?14.5:k===3?17:k===2?17:16,H=k===2?1.4:1;B(L+0.3,0.7,7.6,dark,0,0.75,0);B(0.25,0.9,4.2,chrome,L/2+0.1,1.6*H,0);B(0.2,0.6,2.2,'#f4f4f4',L/2+0.15,1.1,0);B(0.2,0.6,2.2,'#f4f4f4',-L/2-0.15,1.4,0);
    [1,-1].forEach(sd=>{B(0.8,0.6,0.5,c,2.2,4.1,sd*3.75,P);B(3.4,0.35,0.15,dark,-1,3,sd*3.72);});
    wheel(-L/2+3.4,3.45,1.45);wheel(L/2-3.4,3.45,1.45);B(0.3,0.7,1.6,lamp,L/2+0.1,2.4,-2.6);B(0.3,0.7,1.6,lamp,L/2+0.1,2.4,2.6);B(0.3,0.7,1.6,tail,-L/2-0.1,2.4,-2.6);B(0.3,0.7,1.6,tail,-L/2-0.1,2.4,2.6);
    if(v.type==='taxi'){B(3,1.2,2,'#141414',-1,6.6,0);B(3.2,0.4,2.2,'#f2b705',-1,7.8,0);B(16.1,0.5,7.5,'#141414',0,2.2,0);}}
  mergeByMat(g,g,new Set());g.rotation.order='YZX';scene.add(g);return g;}
/* dinámica visual y luces: cabeceo al frenar, balanceo en curvas, stop, faros de noche y direccionales */
function litBox(x,y,z,w,h,d,c,hd){_b.makeRotationY(-hd);_b.setPosition(x,y,z);_s.makeScale(w,h,d);_b.multiply(_s);put('lit',_b,c);}
function vehFX(v,g,L,W,H){const u=g.userData,acc=v.acc||0,sp=v.sp||0,yr=v.yr||0;u.pt=lerp(u.pt||0,clamp(acc*0.0035,-0.05,0.03),0.12);u.rl=lerp(u.rl||0,clamp(-yr*sp*0.0012,-0.05,0.05),0.12);
  g.rotation.set(u.rl,-v.hdg,u.pt);const c=Math.cos(v.hdg),s=Math.sin(v.hdg),n=nightFactor(),Pt=(lx,lz)=>[v.x+lx*c-lz*s,v.z+lx*s+lz*c];
  const brake=acc<-2.2||sp<0.6,blink=Math.floor(performance.now()/380)%2===0;
  for(const sd of [-1,1]){const t=Pt(-L/2-0.12,sd*W*0.35);if(brake||n>0.3)litBox(t[0],H,t[1],0.3,brake?0.75:0.5,1.5,brake?'#ff2a2a':'#8a0d0d',v.hdg);
    if(n>0.25){const f=Pt(L/2+0.12,sd*W*0.35);litBox(f[0],H,f[1],0.3,0.55,1.5,'#fff3d6',v.hdg);}
    if(v.turn===sd&&blink){const a=Pt(L/2,sd*W*0.47),b=Pt(-L/2,sd*W*0.47);litBox(a[0],H+0.2,a[1],0.5,0.45,0.6,'#ffae00',v.hdg);litBox(b[0],H+0.2,b[1],0.5,0.45,0.6,'#ffae00',v.hdg);}}
  if(n>0.25){const q=Pt(L/2+15,0);_b.makeRotationY(-v.hdg);_b.setPosition(q[0],0.14,q[1]);_s.makeScale(30,1,W*2.2);_b.multiply(_s);put('beam',_b);}}
function syncVehicles(){const seen=new Set();for(const v of G.veh){let g=VM.get(v.id);if(!g){g=vehModel(v);VM.set(v.id,g);}seen.add(v.id);g.position.set(v.x,0,v.z);if(v.type==='bus')vehFX(v,g,40,8.6,2.2);else vehFX(v,g,v.body===1&&v.type!=='taxi'?14.5:16,7.4,2.4);}
  for(const [id,g] of VM)if(!seen.has(id)){scene.remove(g);g.traverse(o=>{if(o.geometry&&![BOXG,CYLG,SPHG].includes(o.geometry))o.geometry.dispose();});VM.delete(id);}}
function carBits(x,y,z,h,c){bit(x,y+2.5,z,16,3,7.4,c,-h);bit(x-Math.cos(h)*1,y+5.3,z-Math.sin(h)*1,8.4,2.6,6.6,'#1d2833',-h);}
/* ---- aviones ---- */

function syncPlanes(dt){
  const seen=new Set();
  for(const p of G.planes){let g=P3.get(p.id);if(!g){g=makePlane(p);P3.set(p.id,g);g.userData.ph=p.hdg;}seen.add(p.id);
    const R0=g.userData.R,alt=p.alt||0;g.position.set(p.x,R0+2.6+alt,p.z);
    const dh=((p.hdg-g.userData.ph+Math.PI*3)%(Math.PI*2))-Math.PI;g.userData.ph=p.hdg;const roll=clamp(-dh/Math.max(dt,1e-3)*0.35,-0.5,0.5);
    g.userData.roll=lerp(g.userData.roll||0,alt>8?roll:0,0.08);
    let pitch=0;if(p.state==='takeoff'&&p.spd>56)pitch=Math.min(0.2,(p.spd-56)*0.012);if(p.state==='approach')pitch=alt<20?0.09:0.03;if(p.state==='goaround')pitch=0.12;
    g.userData.pitch=lerp(g.userData.pitch||0,pitch,0.08);g.rotation.set(g.userData.roll,-p.hdg,g.userData.pitch);
    g.userData.gear.visible=!((p.state==='takeoff'&&alt>30)||(p.state==='goaround'&&alt>40)||(p.state==='approach'&&alt>150));
    const bl=Math.floor(performance.now()/500)%2===0;g.userData.bea.visible=p.engines&&bl;if(g.userData.bea2)g.userData.bea2.visible=p.engines&&!bl;
    if(g.userData.strobes){const on=p.state!=='parked'&&p.state!=='push'&&(performance.now()%1100)<90;g.userData.strobes.forEach(x=>x.visible=on);}g.userData.ll.visible=['approach','roll','takeoff','lineup','taxiIn','taxiOut'].includes(p.state);
    if(g.userData.props)g.userData.props.forEach(pr=>{pr.rotation.x+=p.engines?dt*50:dt*2;});}
  for(const [id,g] of P3){if(!seen.has(id)){scene.remove(g);g.traverse(o=>{if(o.geometry&&![BOXG,CYLG,SPHG].includes(o.geometry))o.geometry.dispose();});g.userData.bodyM.map.dispose();g.userData.bodyM.dispose();if(g.userData.aoM)g.userData.aoM.dispose();if(g.userData.finM){g.userData.finM.map.dispose();g.userData.finM.dispose();}P3.delete(id);}}
}

/* ---- entorno ---- */
function nightFactor(){const h=(G.t/60)%24;if(h<5.5||h>=19.5)return 1;if(h<6.5)return 6.5-h;if(h>=18.5)return h-18.5;return 0;}
function updEnv(dt){
  const n=nightFactor(),h=(G.t/60)%24,dusk=(h>17.5&&h<19.8)||(h>5.2&&h<7)?1-Math.min(1,Math.abs(h<12?h-6.1:h-18.6)/0.9):0;
  const sky=SKY_DAY.clone().lerp(SKY_DUSK,clamp(dusk,0,1)*0.7).lerp(SKY_NIGHT,n);scene.background.copy(sky);scene.fog.color.copy(sky);
  skyU.bot.value.copy(sky.clone().lerp(new TH.Color('#ffffff'),0.35*(1-n)));skyU.top.value.copy(sky.clone().multiplyScalar(0.62));skyU.sunAmt.value=1-n;
  const ang=((h-6)/12)*Math.PI;skyU.sunDir.value.set(Math.cos(ang)*0.8,Math.max(0.05,Math.sin(ang)),0.45).normalize();
  const tg=controls.target;sun.target.position.set(tg.x,0,tg.z);{const dist=camera.position.distanceTo(tg),sz=clamp(dist*0.8,140,900),c=sun.shadow.camera;if(Math.abs(c.right-sz)>sz*0.12){c.left=-sz;c.right=sz;c.top=sz;c.bottom=-sz;c.updateProjectionMatrix();}}sun.position.set(tg.x+skyU.sunDir.value.x*1100,Math.max(300,skyU.sunDir.value.y*1100),tg.z+500);
  skyU.sunCol.value.setHSL(0.1,0.8,0.75+0.2*(1-dusk));skyDome.position.copy(camera.position);
  CLOUDS.forEach(c=>{c.position.x+=dt*14;if(c.position.x>4200)c.position.x=-2800;c.material.opacity=0.8*(1-n*0.75);c.material.color.setScalar(1-n*0.6);});
  sun.intensity=1.05*(1-n*0.92);hemi.intensity=0.55*(1-n*0.7);renderer.toneMappingExposure=1.05-n*0.25;sun.color.setHSL(0.09,0.6+dusk*0.3,0.92-dusk*0.15);
  {const want=n>0.6?ENV_NIGHT:(n>0.15||dusk>0.45)?ENV_DUSK:ENV_DAY;if(scene.environment!==want)scene.environment=want;}
  nightLights.forEach(l=>l.intensity=n*1.15);if(RWYGLOW)RWYGLOW.material.opacity=Math.min(1,0.18+n*1.1);
  if(WSOCK){WSOCK.rotation.y=0.5+Math.sin(G.t*0.07)*0.35;WSOCK.rotation.z=-0.15+Math.sin(G.t*0.9)*0.05;}
  if(RWG&&RWG.userData.rab){const r=RWG.userData.rab;if(ALS.length&&n>0.2){const k=Math.floor(performance.now()/60)%(ALS.length+6);r.visible=k<ALS.length;if(r.visible){const a=ALS[ALS.length-1-k];r.position.set(a[0],a[1],a[2]);}}else r.visible=false;}GLOWS.forEach(m=>m.opacity=0.35+n*0.65);updCity(dt,n);
}

/* ---- superposición DOM ---- */
const OL=document.getElementById('ol'),TAGS=[];let tagN=0;const _v=new TH.Vector3();
function proj(x,y,z){_v.set(x,y,z).project(camera);if(_v.z>1||_v.z<-1)return null;return[(_v.x+1)/2*innerWidth,(1-_v.y)/2*innerHeight];}
function tag(x,y,z,txt,cls,title){const s=proj(x,y,z);if(!s||s[0]<-50||s[1]<-50||s[0]>innerWidth+50||s[1]>innerHeight+50)return;let el=TAGS[tagN];if(!el){el=document.createElement('div');OL.appendChild(el);TAGS.push(el);}tagN++;
  if(el._t!==txt){el.textContent=txt;el._t=txt;}if(el.className!=='tag '+cls)el.className='tag '+cls;el.title=title||'';el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px';}
const POPS=[];function pop3(x,z,txt){if(POPS.length>14)return;POPS.push({x,z,txt,t:0});}
function syncOverlay(dt){tagN=0;const far=camera.position.distanceTo(controls.target)>1300;
  for(const o of G.objs){if(o.def.apron){if(!far)tag(o.cx,26,o.bottom-10,'P'+o.num+(o.f&&o.f.plane&&o.f.plane.state==='parked'?' · '+o.f.num:''),o.gate?'st':'bad',o.gate?'':'Sin puerta enlazada');continue;}
    if(!o.ok){tag(o.cx,18,o.cz,'⚠ '+o.why,'bad');continue;}
    const q=o.queue?o.queue.length:0;if(q>=4&&!far)tag(o.cx,18,o.cz,'👥 '+q,'q'+(q>=14?' hi':q>=8?' mid':''));
    if(o.k==='claim'&&!far){const n=G.pax.filter(p=>p.o===o&&p.mode==='bagwait').length;if(n)tag(o.cx,14,o.cz,'🧳 esperan '+n,'q');}}
  if(!far)for(const p of G.planes){if(p.alt>60)continue;tag(p.x,p.T.len*0.25+16,p.z,p.f.num,'pl');}
  if(G.sel&&G.sel.type==='pax'&&!G.sel.ref.gone){const p=G.sel.ref;tag(p.x,12,p.z,p.name.split(' ')[0],'st');}
  fbOverlay();
  for(let i=TAGS.length-1;i>=tagN;i--)TAGS[i].style.display='none';
  for(let i=POPS.length-1;i>=0;i--){const q=POPS[i];q.t+=dt;if(!q.el){q.el=document.createElement('div');q.el.className='pop';q.el.textContent=q.txt;OL.appendChild(q.el);}
    const s=proj(q.x,20+q.t*14,q.z);if(!s||q.t>1.6){q.el.remove();POPS.splice(i,1);continue;}q.el.style.left=s[0]+'px';q.el.style.top=s[1]+'px';q.el.style.opacity=String(1-q.t/1.6);}
}

/* ---- render por cuadro ---- */
const RAMP=i=>staffLook(i,'#ff7a1a','#1a1a1a',true);
function render3D(dt){
  if(G.dirty){buildWorld();G.dirty=false;}
  resetPM();
  for(const s of STAFF)person3(s.x,s.z,s.h,s.lk,0,null,false,!!s.sit,null,0);
  for(const p of G.pax){if(p.hidden)continue;let pose=p.pose||null;if(!pose&&p.sit&&p.lk.phone)pose='phone';if(!pose&&p.mode==='standby'&&p.lk.phone)pose='phone';
    const elev=(p.el||0)+(p.sit?0.7:0)+(p.moving?Math.abs(Math.sin(p.walk))*0.28:0);let hh=p.hdg;if(p.mode==='queue'&&!p.moving)hh+=Math.sin(G.t*0.6+p.id)*0.3;
    if(!pose&&p.sit&&p.lk.reader)pose='read';if(!pose&&p.inLounge&&p.id%3===0)pose='drink';
    person3(p.x,p.z,hh,p.lk,p.walk,(p.porter&&p.porter.st==='srv')?null:p.carry,p.moving,p.sit,pose,elev);if(G.sel&&G.sel.ref===p)bit(p.x,0.1+(p.el||0),p.z,7,0.15,7,'#ffc629',G.t*2);}
  // maleteros con carrito
  for(const o of G.objs){if(o.k!=='porter')continue;for(const a of o.ag||[]){const pushing=a.st==='srv'||a.st==='go';person3(a.x,a.z,a.hdg,a.lk,a.walk,null,a.moving,false,pushing?'push':null,a.moving?Math.abs(Math.sin(a.walk))*0.25:0);
    if(a.st!=='idle'){const cx=a.x+Math.cos(a.hdg)*4.2,cz=a.z+Math.sin(a.hdg)*4.2;bit(cx,1.3,cz,4.4,0.4,3.2,'#9aa3aa',-a.hdg);bit(a.x+Math.cos(a.hdg)*2.2,3,a.z+Math.sin(a.hdg)*2.2,0.4,4,3.2,'#9aa3aa',-a.hdg);
      if(a.st==='srv'&&a.p){bit(cx,2.9,cz,3.2,2.8,2.6,a.p.lk.bagc,-a.hdg);bit(cx-Math.cos(a.hdg)*0.4,4.9,cz-Math.sin(a.hdg)*0.4,2.6,1.6,2.2,BAGC[a.p.id%BAGC.length],-a.hdg);}}}}
  // recibidores con letreros y flores
  for(const n of G.npc){const pose=n.st==='hug'?'reach':n.st==='wait'?(n.sign?'sign':n.flowers?'flowers':'phone'):null;person3(n.x,n.z,n.hdg,n.lk,n.walk,null,n.moving,false,pose,n.moving?Math.abs(Math.sin(n.walk))*0.25:0);}
  // escoltas de protocolo
  for(const p of G.pax){if(!p.escort||p.hidden||p.gone||p.sit)continue;const bk=p.el>0.5,ex=bk?p.x-Math.cos(p.hdg)*3.4:p.x+Math.cos(p.hdg-Math.PI/2)*4.2,ez=bk?p.z-Math.sin(p.hdg)*3.4:p.z+Math.sin(p.hdg-Math.PI/2)*4.2;person3(ex,ez,p.hdg,p.escort.lk,p.walk+0.6,null,p.moving,false,p.moving?null:'hand',p.el||0);}
  // carros estacionados
  for(const o of G.objs){if(!o.def.land)continue;o.cars.forEach((c,i)=>{if(!c||c.state!=='park')return;const sp=o.spotPos[i];carBits(sp.x,sp.lv?12.8:0,sp.z,sp.h,c.c);});}
  // detalles animados en procesos
  for(const o of G.objs){
    if(o.k==='wrap')for(const e of o.serving){if(!e.go)continue;const [x,z]=l2w(o,-3,0);bit(x,3.4,z,2.4,2.8,1.8,'#7fd3a6',G.t*6);}
    if(o.k==='checkin')for(const e of o.serving){if(!e.go)continue;const u=1-e.t/e.T;if(u>0.95||!e.p.bag)continue;const lz=u<0.4?3.4:lerp(3.4,-3,(u-0.4)/0.55),[x,z]=l2w(o,5.6,lz);bit(x,u<0.4?1.1:1.3,z,2.6,2.2,3.2,e.p.lk.bagc,o.a);}
    if(o.k==='security')for(const e of o.serving){const u=1-e.t/e.T,[x,z]=l2w(o,4,lerp(10,-10,clamp(u,0,1)));bit(x,3.5,z,4.6,0.7,4,'#9aa3aa',o.a);bit(x,4.2,z,3,1.5,2.6,e.p.lk.bagc,o.a);}
    if(o.k==='claim'){const n=G.pax.filter(p=>p.o===o&&p.mode==='bagwait'&&G.t>=p.f.bagT-3).length;if(n){const m=Math.min(14,n+3);for(let i=0;i<m;i++){const u=((G.t*0.012+i/m)%1);const P=2*(21)+Math.PI*2*3.6;let s=u*P,lx,lz;
      if(s<21){lx=-10.5+s;lz=-3.6;}else if((s-=21)<Math.PI*3.6){const a=-H2b+s/3.6;lx=10.5+Math.cos(a)*3.6;lz=Math.sin(a)*3.6;}else if((s-=Math.PI*3.6)<21){lx=10.5-s;lz=3.6;}else{s-=21;const a=H2b+s/3.6;lx=-10.5+Math.cos(a)*3.6;lz=Math.sin(a)*3.6;}
      const [x,z]=l2w(o,lx,lz);bit(x,3.6,z,2.6,1.8,2,BAGC[i%BAGC.length],o.a+i);}}}}
  // aviones: escaleras, cuadrillas, señalero
  for(const p of G.planes){if(p.alt>2)continue;const L=p.T.len*PSCALE,R0=Math.max(1.8,L*0.058);
    if(p.state==='parked'){const d=door(p),s=d[0]>p.x?1:-1;if(!(p.f.stand&&p.f.stand.bridge))for(let k=0;k<5;k++)bit(d[0]+s*(1.5+k*1.6),k*(R0+1.6)/5,d[1],1.8,(R0+2.6)/5+0.4,3.6,'#d0d5da');if(!(p.f.stand&&p.f.stand.bridge))bit(d[0]+s*0.8,R0+2.2,d[1],1.6,0.4,4,'#9aa3aa');
      const g=p.f.stand&&p.f.stand.gate,s2=g&&g.cx>=p.x?-1:1;
      person3(p.x-s2*4,p.z+L*0.38,Math.PI/2,RAMP(p.id+2),0,null,false);bit(p.x,1.2,p.z+L/2+3,1.6,2.4,1.6,'#ff6a00');bit(p.x-p.T.span*PSCALE*0.45,1.2,p.z,1.6,2.4,1.6,'#ff6a00');bit(p.x+p.T.span*PSCALE*0.45,1.2,p.z,1.6,2.4,1.6,'#ff6a00');}
    if(p.state==='parked'){rampFX(p,L,R0);bit(p.x,0.5,p.z+L*0.36,2.6,1,1,'#f2b705');bit(p.x,1.2,p.z-L/2-3,1.6,2.4,1.6,'#ff6a00');}
    if(p.state==='taxiIn'&&p.path.length<14&&p.f.stand){const s=p.f.stand;person3(s.cx,s.bottom-2,-Math.PI/2,RAMP(p.id+5),0,null,false,false,'wave');
      const sw=Math.sin(G.t*6)*0.5;bit(s.cx-2.6,7.6+sw,s.bottom-2,0.5,2.6,0.5,'#ff6a00');bit(s.cx+2.6,7.6-sw,s.bottom-2,0.5,2.6,0.5,'#ff6a00');}
    if(p.state==='push'){const S2=p.T.span*PSCALE/2;[1,-1].forEach(k=>person3(p.x+Math.cos(p.hdg+k*Math.PI/2)*(S2+3),p.z+Math.sin(p.hdg+k*Math.PI/2)*(S2+3),p.hdg+Math.PI,RAMP(p.id+11+k),G.t*4,null,true,false,'hand'));}
    if(p.state==='push'){const h=p.hdg,ch=Math.cos(h),sh=Math.sin(h);person3(p.x+ch*(L/2+20),p.z+sh*(L/2+20),h,RAMP(p.id+6),G.t*4,null,true);
      bit(p.x+ch*(L/2+12),2.2,p.z+sh*(L/2+12),12,3.2,7,'#f2b705',-h);bit(p.x+ch*(L/2+12),4.6,p.z+sh*(L/2+12),3,2.2,5,'#1d2126',-h);bit(p.x+ch*(L/2+4),1.4,p.z+sh*(L/2+4),8,0.6,0.6,'#3a3f45',-h);}}
  syncVehicles();fbSync(dt);
  for(const k in PM){PM[k].count=PC[k];PM[k].instanceMatrix.needsUpdate=true;if(PM[k].instanceColor)PM[k].instanceColor.needsUpdate=true;}
  if(TRUSS)TRUSS.visible=camera.position.distanceTo(controls.target)>330;
  if(FBROOF)FBROOF.visible=camera.position.distanceTo(controls.target)>430;
  updGSE(dt);syncPlanes(dt);syncBridges(dt);syncFx();updEnv(dt);
  gfxFrame(dt);gfxRender();
  syncOverlay(dt);
}
const H2b=Math.PI/2;
rain.visible=false;
