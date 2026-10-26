
/* ================= INTERFAZ ================= */
const $=id=>document.getElementById(id);
let manualRot=false,tool=null,rot=0,cat='s',drag=null,hover=-1,down=null,titleOn=true,AC2=false,pend=null,lastTouch=false,multi=false;const PTRS=new Set();
function toast(msg,kind){if(G&&G.warm)return;const el=document.createElement('div');el.className='toast '+(kind||'');el.textContent=msg;$('toasts').appendChild(el);setTimeout(()=>el.remove(),kind==='star'?6000:3800);while($('toasts').children.length>4)$('toasts').firstChild.remove();}
function ensureAudio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}
function sfx(k){if(!G||!G.sound||!AC)return;switch(k){case 'build':beep(520,0.08,'triangle',0.05);setTimeout(()=>beep(780,0.06,'triangle',0.04),60);break;case 'paint':beep(340,0.04,'triangle',0.03);break;case 'del':beep(200,0.09,'sawtooth',0.03);break;
  case 'chime':chime();break;case 'jet':playJet(0.8);break;case 'star':[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,0.25,'sine',0.06),i*140));break;case 'click':beep(900,0.025,'square',0.02);break;}}

/* ---- barra de construcción ---- */
function actPrice(k,d){if(d.fbo||k==='fboGo')return fbPrice(k);if(k==='expW'||k==='expE')return fmt$(expCost());if(k==='landW'||k==='landE')return fmt$(landCost());if(d.up)return G.up[d.up]?'✓ lista':fmt$(d.cost);return fmt$(d.cost);}
function buildToolbar(){
  $('cats').innerHTML=CATS.map(c=>`<button data-c="${c.k}" aria-pressed="${c.k===cat}">${c.n}</button>`).join('');
  const list=Object.keys(DEF).filter(k=>DEF[k].cat===cat);
  $('tools').innerHTML=list.map(k=>{const d=DEF[k];const lock=d.star&&G.star<d.star;const done=(d.up&&G.up[d.up])||(d.fbo&&fbMaxed(k));
    const pr=k==='erase'?'+50%':d.act?actPrice(k,d):fmt$(d.cost);
    return`<button class="tool${lock?' lock':''}${done?' done':''}${!lock&&!done&&d.cost>G.money?' cant':''}" data-k="${k}" data-star="${d.star||''}" aria-pressed="${tool===k}" title="${d.d}"><span class="ic">${d.ic}</span><span class="nm">${d.n}</span><span class="pr">${pr}</span></button>`;}).join('');
  updHint();
}
$('cats').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cat=b.dataset.c;buildToolbar();sfx('click');});
$('tools').addEventListener('click',e=>{const b=e.target.closest('.tool');if(!b)return;const k=b.dataset.k,d=DEF[k];
  if(d.star&&G.star<d.star){toast('Se desbloquea al llegar a '+d.star+' estrellas','bad');return;}
  if(d.act){let ok=false;if(k==='expW'||k==='expE'){ok=expandTerm(k==='expW'?-1:1);if(ok)focus((k==='expW'?G.tx0:G.tx1)*CELL,(APR+GH)/2*CELL);}
    else if(k==='landW'||k==='landE'){ok=buyLand(k==='landW'?-1:1);if(ok)focus((k==='landW'?G.lot.x0:G.lot.x1)*CELL,(APR+GH)/2*CELL);}
    else if(d.up){ok=buyUpgrade(k);if(ok)focus(THR_X-300,RWY_Z);}
    else if(d.fbo||k==='fboGo'){ok=buyFbo(k);if(k==='fboGo')return;}
    if(ok)buildToolbar();return;}
  setTool(tool===k?null:k);sfx('click');});
function setTool(k,keepMove){if(G.moving&&!keepMove)cancelMove();tool=k;drag=null;manualRot=false;if(!keepMove){G.sel=null;$('info').hidden=true;}const on=!!k;gridM.visible=on;zoneM.visible=on;
  controls.mouseButtons.LEFT=on?-1:TH.MOUSE.PAN;pend=null;hover=-1;
  document.querySelectorAll('.tool').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===k)));hideGhost();updHint();}
function updHint(){const h=$('hint');if(!tool){h.innerHTML=lastTouch?'Toca algo para ver detalles · <b>1 dedo</b> mueve · <b>2 dedos</b> acercan y giran':'Toca algo para ver detalles · <b>arrastra</b> para mover · <b>clic derecho</b> gira · rueda acerca';return;}const d=DEF[tool];
  if(tool==='erase')h.innerHTML='<b>Demoler</b>: toca un objeto para quitarlo · devuelve el 50%'+(lastTouch?' <button data-cancel>Listo</button>':'');
  else h.innerHTML=`${G.moving?'<b>Moviendo</b> ':''}<b>${d.n}</b>: ${lastTouch?'toca donde va':'mueve el cursor'} · se orienta solo hacia la zona correcta${d.apron||d.fix?'':'<button data-rot>⟳ Girar</button>'}${G.moving?'<button data-cancel>Cancelar</button>':lastTouch?'<button data-cancel>Listo</button>':''}`;}

/* ---- vista previa: el modelo real en transparente + flechas en el piso ---- */
const GHM={ok:new TH.MeshBasicMaterial({color:0x46e6a0,transparent:true,opacity:.72,depthWrite:false}),warn:new TH.MeshBasicMaterial({color:0xffb020,transparent:true,opacity:.72,depthWrite:false}),bad:new TH.MeshBasicMaterial({color:0xff5a5f,transparent:true,opacity:.7,depthWrite:false})};
const ghostMat=GHM.ok;const ghost=new TH.Mesh(BOXG,new TH.MeshBasicMaterial({color:0x3ccf91,transparent:true,opacity:.22,depthWrite:false}));ghost.visible=false;ghost.renderOrder=5;scene.add(ghost);
let ghostG=null,ghostKey='',ghostM=null;
function ghostModel(k){if(ghostKey===k&&ghostG)return ghostG;if(ghostG){scene.remove(ghostG);}
  const g=new TH.Group(),d=DEF[k];
  if(d.apron){const T=TYPES[{1:'E190',2:'B738',3:'B788'}[d.size]];const pl=makePlane({T,a:AIRLINES[1],reg:''});scene.remove(pl);g.add(pl);g.userData.plane=pl;g.userData.R=pl.userData.R;g.userData.L=pl.userData.L;}
  else{GHOST=true;buildObj({k,def:d,id:0,a:0,cx:0,cz:0,rw:d.w,rh:d.h,num:'?',lv:1,stand:null,seats:[],cars:[]},g);GHOST=false;}
  g.traverse(o=>{if(o.isSprite)o.visible=false;else if(o.isMesh){o.material=GHM.ok;o.castShadow=false;o.renderOrder=6;}});ghostM=GHM.ok;
  ghostG=g;ghostKey=k;scene.add(g);return g;}
function setGhostMat(m){if(ghostM===m)return;ghostM=m;ghostG.traverse(o=>{if(o.isMesh)o.material=m;});}
const DEC=new TH.Group();scene.add(DEC);DEC.visible=false;
const chevG=(()=>{const sh=new TH.Shape();sh.moveTo(1.6,0);sh.lineTo(-1.2,1.6);sh.lineTo(-0.4,0);sh.lineTo(-1.2,-1.6);sh.closePath();const g=new TH.ShapeGeometry(sh);g.rotateX(-Math.PI/2);return g;})();
const chevM=new TH.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,depthWrite:false});const CHEV=new TH.InstancedMesh(chevG,chevM,24);CHEV.instanceMatrix.setUsage(TH.DynamicDrawUsage);CHEV.renderOrder=7;DEC.add(CHEV);
for(let i=0;i<24;i++)CHEV.setColorAt(i,new TH.Color(0xffffff));
const bigArrow=(c)=>{const m=new TH.Mesh(chevG,new TH.MeshBasicMaterial({color:c,transparent:true,opacity:.95,depthWrite:false}));m.scale.set(2.4,1,2.4);m.renderOrder=8;DEC.add(m);return m;};
const ENT=bigArrow(0x3ccf91),EXT=bigArrow(0x2f86ff);
const lbl=(t,bg)=>{const {t:tx,ar}=textTex(t,bg,'#0d1216',64);const sp=new TH.Sprite(new TH.SpriteMaterial({map:tx,depthTest:false,transparent:true}));sp.scale.set(5*ar,5,1);sp.renderOrder=9;DEC.add(sp);return sp;};
const LENT=lbl('ENTRADA','#3ccf91'),LEXT=lbl('SALIDA','#5bc0eb'),LQ=lbl('FILA','#ffffff');
function hideGhost(){ghost.visible=false;if(ghostG)ghostG.visible=false;DEC.visible=false;}
function tmpObj(k,gx,gy,r){const t={k,gx,gy,r,id:-1};initObj(t);return t;}
function anchorFor(k,c,r){const d=DEF[k];if(d.fix)r=0;const rw=r%2?d.h:d.w,rh=r%2?d.w:d.h;const y=((c/GW)|0);return[(c%GW)-Math.floor((rw-1)/2),d.facade&&y>=APR&&y<APR+8?APR:y-Math.floor((rh-1)/2)];}
function effRot(k,c){const d=DEF[k];if(d.apron||d.land||d.fix)return 0;if(manualRot)return rot;
  for(let i=0;i<4;i++){const r=(rot+i)%4,[gx,gy]=anchorFor(k,c,r);if(canPlace(k,gx,gy,r,!!G.moving).ok&&tmpObj(k,gx,gy,r).ok)return r;}return rot;}
function objAnchor(k,c){const r=effRot(k,c);const [gx,gy]=anchorFor(k,c,r);return[gx,gy,r];}
function updGhost(){
  if(!tool||hover<0){hideGhost();return;}const d=DEF[tool];
  if(tool==='erase'){DEC.visible=false;if(ghostG)ghostG.visible=false;const o=objAtPt([ccx(hover),ccz(hover)]);if(!o){ghost.visible=false;return;}ghost.visible=true;ghost.material.color.set(0xff5a5f);ghost.material.opacity=.4;ghost.scale.set(o.rw*CELL,o.def.apron?1:12,o.rh*CELL);ghost.position.set(o.cx,o.def.apron?0.5:6,o.cz);return;}
  const [gx,gy,r]=objAnchor(tool,hover);const g=geom(tool,gx,gy,r),ok=canPlace(tool,gx,gy,r,!!G.moving);
  const gm=ghostModel(tool);gm.visible=true;let state=ok.ok?'ok':'bad',why=ok.why||'';
  ghost.visible=true;ghost.material.opacity=.32;ghost.scale.set(g.rw*CELL,0.4,g.rh*CELL);ghost.position.set(g.cx,0.3,g.cz);
  if(d.land){gm.position.set(g.cx,0,g.cz);gm.rotation.y=0;DEC.visible=false;}
  else if(d.apron){const L=gm.userData.L,R0=gm.userData.R,bottom=(gy+g.rh)*CELL;gm.position.set(g.cx,0,0);gm.userData.plane.position.set(0,R0+2.6,bottom-L/2-5);gm.userData.plane.rotation.set(0,-Math.PI/2,0);
    DEC.visible=ok.ok;if(ok.ok){CHEV.count=0;const M=new TH.Matrix4();let n=0;for(let z=TWY_Z+14;z<bottom-8&&n<24;z+=12){M.makeRotationY(-Math.PI/2);M.setPosition(g.cx,0.4,z);CHEV.setMatrixAt(n,M);CHEV.setColorAt(n,new TH.Color(0xffd21a));n++;}CHEV.count=n;CHEV.instanceMatrix.needsUpdate=true;if(CHEV.instanceColor)CHEV.instanceColor.needsUpdate=true;
      ENT.visible=false;EXT.visible=false;LEXT.visible=false;LQ.visible=false;LENT.visible=true;LENT.material.map=LENT.material.map;LENT.position.set(g.cx,12,bottom-4);}}
  else{gm.position.set(g.cx,0,g.cz);gm.rotation.y=-g.a;
    const t=tmpObj(tool,gx,gy,r);if(ok.ok&&!t.ok){state='warn';why=t.why;}
    DEC.visible=true;CHEV.count=0;
    if(t.acc>=0){const M=new TH.Matrix4(),n=Math.min(t.spots.length-1,22);let c=0;for(let i=2;i<n;i+=2){const a=t.spots[i],b=t.spots[i-1]||a;M.makeRotationY(-Math.atan2(b[1]-a[1],b[0]-a[0]));M.setPosition(a[0],0.35,a[1]);M.scale(new TH.Vector3(1.5,1,1.5));CHEV.setMatrixAt(c,M);CHEV.setColorAt(c,new TH.Color(0xffd21a));c++;}CHEV.count=c;CHEV.instanceMatrix.needsUpdate=true;if(CHEV.instanceColor)CHEV.instanceColor.needsUpdate=true;
      const ax=ccx(t.acc),az=ccz(t.acc);ENT.visible=true;ENT.position.set(ax,0.5,az);ENT.rotation.y=-Math.atan2(g.cz-az,g.cx-ax);LENT.visible=true;LENT.position.set(ax,9,az);
      LQ.visible=c>1&&t.ok;if(LQ.visible){const q=t.spots[Math.min(t.spots.length-1,8)];LQ.position.set(q[0],7,q[1]);}}
    else{ENT.visible=false;LENT.visible=false;LQ.visible=false;}
    if(d.exitZone&&t.ex>=0){const ex=ccx(t.ex),ez=ccz(t.ex);EXT.visible=true;EXT.position.set(ex,0.5,ez);EXT.rotation.y=-Math.atan2(ez-g.cz,ex-g.cx);LEXT.visible=true;LEXT.position.set(ex,9,ez);}else{EXT.visible=false;LEXT.visible=false;}}
  setGhostMat(GHM[state]);ghost.material.color.set(state==='ok'?0x3ccf91:state==='warn'?0xffb020:0xff5a5f);
  const cost=G.moving?'gratis':fmt$(d.cost);
  $('hint').innerHTML=(state==='ok'?`<b>${d.n}</b> · ${cost} · ${lastTouch?'':'clic para colocar'}`:state==='warn'?`<b style="color:var(--warn)">⚠ ${why}</b>`:`<b style="color:var(--bad)">${why||'No se puede'}</b>`)+(d.apron||d.fix?'':`<button data-rot>⟳ Girar${lastTouch?'':' (R)'}</button>`)+(lastTouch&&ok.ok?'<button data-ok>✓ Colocar</button>':'')+(G.moving?'<button data-cancel>Cancelar</button>':lastTouch?'<button data-cancel>✕</button>':'');
}
const ray=new TH.Raycaster(),gplane=new TH.Plane(new TH.Vector3(0,1,0),0),_hit=new TH.Vector3(),_ndc=new TH.Vector2();
function groundAt(e){const r=cv.getBoundingClientRect();_ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(_ndc,camera);return ray.ray.intersectPlane(gplane,_hit)?[_hit.x,_hit.z]:null;}
function cellFromPt(pt){if(!pt)return -1;const gx=Math.floor(pt[0]/CELL),gy=Math.floor(pt[1]/CELL);const maxY=tool&&DEF[tool]&&DEF[tool].land?LAND1:GH;if(gx<0||gy<0||gx>=GW||gy>=maxY)return -1;return cidx(gx,gy);}
/* ---- mover objetos ---- */
function startMove(o){if(o.def.apron&&o.f){toast('Ese puesto tiene un avión asignado','bad');return;}G.moving={o,gx:o.gx,gy:o.gy,r:o.r};liftObj(o);cat=o.def.cat;buildToolbar();setTool(o.k,true);rot=o.r;manualRot=!o.def.apron;G.sel=null;$('info').hidden=true;updHint();}
function finishMove(gx,gy,r){const m=G.moving;if(!canPlace(m.o.k,gx,gy,r,true).ok){toast('No cabe ahí','bad');return;}dropObj(m.o,gx,gy,r);G.moving=null;sfx('build');const o=m.o;setTool(null);G.sel={type:'obj',ref:o};showInfo();}
function cancelMove(){const m=G.moving;if(!m)return;G.moving=null;dropObj(m.o,m.gx,m.gy,m.r);}
function tryPlace(c){if(c<0)return;const [gx,gy,r]=objAnchor(tool,c);if(G.moving){finishMove(gx,gy,r);return;}const res=placeObj(tool,gx,gy,r);if(!res.ok&&res.why)toast(res.why,'bad');else if(res.ok){buildToolbar();updGhost();}}
/* ---- entrada ---- */
cv.addEventListener('pointerdown',e=>{ensureAudio();if(titleOn)return;PTRS.add(e.pointerId);const touch=e.pointerType!=='mouse';
  if(touch!==lastTouch){lastTouch=touch;updHint();}
  if(PTRS.size>1){multi=true;drag=null;down=null;updGhost();return;}multi=false;
  if(e.button!==0)return;down={x:e.clientX,y:e.clientY,t:performance.now(),touch};
  if(tool&&!touch){const c=cellFromPt(groundAt(e));const d=DEF[tool];if(d.paint&&c>=0){drag={a:c,b:c};updGhost();}}});
cv.addEventListener('pointermove',e=>{if(titleOn||e.pointerType!=='mouse')return;const c=cellFromPt(groundAt(e));if(c!==hover||drag){hover=c;if(drag&&c>=0)drag.b=c;updGhost();}});
const endPtr=e=>{PTRS.delete(e.pointerId);};
window.addEventListener('pointercancel',e=>{endPtr(e);down=null;drag=null;});
window.addEventListener('pointerup',e=>{endPtr(e);if(titleOn||!down||multi){if(!PTRS.size)multi=false;down=null;return;}
  const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y)>(down.touch?12:6);const pt=groundAt(e);const c=cellFromPt(pt);
  if(down.touch){down=null;if(moved||e.target!==cv)return;touchTap(pt,c,e);return;}
  if(tool){const d=DEF[tool];
    if(tool==='erase'){const o=objAtPt(pt);if(o&&removeObj(o,true))buildToolbar();}
    else if(d.paint){if(drag)paintRect(drag.a,drag.b,d.paint);}
    else if(c>=0)tryPlace(c);
    drag=null;updGhost();}
  else if(!moved&&e.target===cv)select(pt,e);
  down=null;});
function touchTap(pt,c,e){
  if(!tool){select(pt,e);return;}const d=DEF[tool];
  if(tool==='erase'){const o=objAtPt(pt);if(o&&removeObj(o,true))buildToolbar();return;}
  if(d.paint){
    if(!pend){if(c<0)return;pend={a:c};hover=c;drag=null;updGhost();return;}
    if(c<0)return;const n=paintRect(pend.a,c,d.paint||0);pend=null;hover=-1;updGhost();updHint();if(n)buildToolbar();return;}
  if(c<0)return;
  if(hover===c&&ghost.visible){placeHere();return;}
  hover=c;updGhost();
}
function placeHere(){if(!tool||hover<0)return;tryPlace(hover);}
cv.addEventListener('contextmenu',e=>e.preventDefault());
function objAtPt(pt){if(!pt)return null;const gx=Math.floor(pt[0]/CELL),gy=Math.floor(pt[1]/CELL);if(gx<0||gy<0||gx>=GW||gy>=LAND1)return null;const id=gy<GH?G.cobj[cidx(gx,gy)]:0;if(id)return objById(id);
  const L=G.objs.find(o=>o.def.land&&gx>=o.gx&&gx<o.gx+o.rw&&gy>=o.gy&&gy<o.gy+o.rh);if(L)return L;
  return G.objs.find(o=>o.def.apron&&gx>=o.gx&&gx<o.gx+o.rw&&gy>=o.gy&&gy<o.gy+o.rh)||null;}
function select(pt,e){
  const r=cv.getBoundingClientRect();_ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(_ndc,camera);
  const groups=[...P3.values()];const hit=ray.intersectObjects(groups,true)[0];
  if(hit){let g=hit.object;while(g&&!groups.includes(g))g=g.parent;for(const [id,gg] of P3)if(gg===g){const p=G.planes.find(q=>q.id===id);if(p){G.sel={type:'plane',ref:p};showInfo();return;}}}
  if(pt){let best=null,bd=lastTouch?34:20;const rr=cv.getBoundingClientRect();for(const p of G.pax){if(p.hidden)continue;const sc=proj(p.x,5,p.z);if(!sc)continue;const d=Math.hypot(sc[0]-(e.clientX-rr.left),sc[1]-(e.clientY-rr.top));if(d<bd){bd=d;best=p;}}if(best){G.sel={type:'pax',ref:best};showInfo();return;}
    let o=objAtPt(pt);if(!o){const m=lastTouch?6:3;o=G.objs.find(q=>!q.def.apron&&pt[0]>q.gx*CELL-m&&pt[0]<(q.gx+q.rw)*CELL+m&&pt[1]>q.gy*CELL-m&&pt[1]<(q.gy+q.rh)*CELL+m)||null;}if(o){G.sel={type:'obj',ref:o};showInfo();return;}}
  G.sel=null;$('info').hidden=true;
}
window.addEventListener('keydown',e=>{if(titleOn||e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();
  if(k==='r'&&tool&&!DEF[tool].apron&&!DEF[tool].paint){rot=((hover>=0?effRot(tool,hover):rot)+1)%4;manualRot=true;updGhost();sfx('click');}
  else if(k==='r'&&G.sel&&G.sel.type==='obj'){rotateObj(G.sel.ref);}
  else if(k==='m'&&G.sel&&G.sel.type==='obj'){startMove(G.sel.ref);}
  else if((k==='delete'||k==='backspace'||k==='supr')&&G.sel&&G.sel.type==='obj'){if(removeObj(G.sel.ref,true)){G.sel=null;$('info').hidden=true;buildToolbar();}}
  else if(k==='escape'){if(tool)setTool(null);else{G.sel=null;$('info').hidden=true;}}
  else if(k===' '){e.preventDefault();setSpeed(G.speed?0:(G.lastSpeed||1));}
  else if(k==='1')setSpeed(1);else if(k==='2')setSpeed(2);else if(k==='3')setSpeed(4);else if(k==='4')setSpeed(8);
  else if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){const f=new TH.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const rt=new TH.Vector3(-f.z,0,f.x);const st=camera.position.distanceTo(controls.target)*0.06;
    const m=(k==='w'||k==='arrowup')?f.multiplyScalar(st):(k==='s'||k==='arrowdown')?f.multiplyScalar(-st):(k==='d'||k==='arrowright')?rt.multiplyScalar(st):rt.multiplyScalar(-st);camera.position.add(m);controls.target.add(m);}
});
function setSpeed(s){if(s)G.lastSpeed=s;G.speed=s;document.querySelectorAll('.spd button[data-s]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.s===s)));}
document.querySelectorAll('.spd button[data-s]').forEach(b=>b.addEventListener('click',()=>{setSpeed(+b.dataset.s);sfx('click');}));
$('bSound').addEventListener('click',()=>{ensureAudio();G.sound=!G.sound;$('bSound').textContent=G.sound?'🔊':'🔇';if(G.sound){try{AC.resume();}catch(e){}startAmbient();sfx('chime');}});
$('bMenu').addEventListener('click',()=>showOver('menu'));
$('hint').addEventListener('click',e=>{if(e.target.closest('[data-rot]')&&tool&&!DEF[tool].apron){rot=((hover>=0?effRot(tool,hover):rot)+1)%4;manualRot=true;updGhost();sfx('click');}
  if(e.target.closest('[data-ok]'))placeHere();
  if(e.target.closest('[data-cancel]')){if(pend){pend=null;hover=-1;updGhost();updHint();}else setTool(null);}});
/* ---- barra de acciones del objeto seleccionado ---- */
const SB=$('selbar');
function selActions(o){const a=[];a.push(['move','✥','Mover']);if(!o.def.apron&&!o.def.land&&!o.def.fix)a.push(['rot','⟳','Girar']);const u=nextUp(o);
  if(u)a.push(['up','⬆',u.n+' · '+fmt$(u.cost),u.star&&G.star<u.star?'★'+u.star:'']);if(o.def.apron&&!o.bridge&&o.gy+o.rh===APR)a.push(['br','🛬','Pasarela · $30.000',bridgeOk(o)?'':'necesita puerta']);
  a.push(['del','✖','Demoler +'+fmt$(investOf(o)*0.5)]);return a;}
function updSelBar(){const s=G.sel;if(!s||s.type!=='obj'||tool||titleOn||!G.objs.includes(s.ref)){SB.hidden=true;return;}const o=s.ref;
  const key=o.id+'|'+o.k+'|'+o.lv+'|'+(o.bridge?1:0)+'|'+G.star+'|'+Math.floor(G.money/1000)+'|'+(o.gate?1:0);
  if(SB._k!==key){SB._k=key;SB.innerHTML=selActions(o).map(([k,ic,t,x])=>`<button data-a="${k}" ${x?'disabled title="'+x+'"':''}><span>${ic}</span>${t}</button>`).join('');}
  const p=proj(o.cx,o.def.apron?28:20,o.def.apron?o.bottom-30:o.def.land?o.gy*CELL+10:o.cz);if(!p){SB.hidden=true;return;}SB.hidden=false;
  const w=SB.offsetWidth;SB.style.left=clamp(p[0]-w/2,8,innerWidth-w-8)+'px';SB.style.top=clamp(p[1]-58,70,innerHeight-240)+'px';}
SB.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||!G.sel)return;const o=G.sel.ref,a=b.dataset.a;
  if(a==='move')startMove(o);if(a==='rot')rotateObj(o);if(a==='up'){if(upgradeObj(o))buildToolbar();}if(a==='br')buildBridge(o);
  if(a==='del'){if(removeObj(o,true)){G.sel=null;$('info').hidden=true;buildToolbar();}}SB._k='';showInfo();});
/* ---- mando de cámara táctil ---- */
function camOp(k){const off=new TH.Vector3().subVectors(camera.position,controls.target);const sp=new TH.Spherical().setFromVector3(off);
  if(k==='l')sp.theta+=0.35;if(k==='r')sp.theta-=0.35;if(k==='in')sp.radius=Math.max(controls.minDistance,sp.radius*0.75);if(k==='out')sp.radius=Math.min(controls.maxDistance,sp.radius/0.75);
  if(k==='up')sp.phi=Math.max(0.25,sp.phi-0.15);if(k==='dn')sp.phi=Math.min(controls.maxPolarAngle,sp.phi+0.15);
  off.setFromSpherical(sp);camera.position.copy(controls.target).add(off);controls.update();}
$('campad').addEventListener('click',e=>{const b=e.target.closest('[data-cam]');if(b){camOp(b.dataset.cam);}});

/* ---- panel lateral ---- */
let tab='goals',sideHTML='';
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=b.dataset.tab;
  if(t==='min'){$('side').classList.toggle('min');b.textContent=$('side').classList.contains('min')?'▴':'▾';return;}
  $('side').classList.remove('min');tab=t;document.querySelectorAll('.tabs button[data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab===t)));sideHTML='';renderSide();sfx('click');});
const GTOOL=['checkin','security','standS','gate','bench','claim','con',null];
const logo=a=>`<span class="logo" style="background:${a.c1};color:${a.style==='full'?a.c2:a.c3==='#1b1b1b'?'#1b1b1b':'#fff'}">${a.code}</span>`;
function renderSide(){
  let h='';
  if(tab==='goals'){const gi=GOALS.findIndex(g=>!g[1]());
    if(gi>=0){h+=`<div class="h3">Primeros pasos</div>`;GOALS.forEach((g,i)=>{const done=g[1]();if(i>gi+2)return;const gt=GTOOL[i];h+=`<div class="goal${done?' done':i===gi?' now':''}"><span class="ck">${done?'✓':i+1}</span><span>${g[0]}</span>${i===gi&&gt?`<button class="go" data-goal="${gt}">${gt==='con'?'Ver':'Usar'}</button>`:''}</div>`;});}
    const nx=STARS[G.star+1];if(nx){const pp=Math.min(1,G.paxTotal/nx.pax);h+=`<div class="h3">Siguiente categoría: ${'★'.repeat(G.star+1)} ${nx.n}</div><div class="card"><div class="row muted">Pasajeros atendidos ${fmtN(G.paxTotal)} / ${fmtN(nx.pax)}</div><div class="bar"><i style="width:${pp*100}%"></i></div><div class="row muted">Satisfacción ${Math.round(G.rating)}% / mínimo ${nx.rat}% ${G.rating>=nx.rat?'✓':''}</div><div class="muted">Desbloquea: ${UNLOCK[G.star+1]}</div></div>`;}
    h+=`<div class="h3">Alertas</div>`;if(!G.alerts.length)h+=`<div class="muted">Todo en orden.</div>`;
    G.alerts.slice(0,9).forEach((a,i)=>h+=`<div class="al ${a.s==='w'?'w':a.s==='i'?'i':''}" data-al="${i}">${a.t}</div>`);}
  if(tab==='con'){
    h+=`<div class="h3">Ofertas de aerolíneas</div>`;if(!G.offers.length)h+=`<div class="muted">Sin ofertas por ahora. Llegan nuevas cada pocas horas.</div>`;
    for(const of of G.offers){const a=AIRLINES[of.a],T=TYPES[of.type],bl=offerBlock(of);
      h+=`<div class="card"><div class="top">${logo(a)}<div><div class="t1">${a.name}</div><div class="t2">${T.n} · ${of.per} vuelo${of.per>1?'s':''} al día · ${T.pax} asientos</div></div></div>
      <div class="row"><span class="pill ${of.intl?'y':''}">${of.intl?'Internacional':'Nacional'}</span><span class="pill">Puesto ${SIZEN[T.size]}</span><span class="pill">${of.times.map(t=>clockStr(t)).join(' · ')}</span></div>
      <div class="row"><span class="muted">≈ <b style="color:var(--ok)">${fmt$(of.est)}</b> por día</span><span class="grow"></span>${bl?`<span class="pill r">${bl}</span>`:''}<button class="btn" data-acc="${of.id}" ${bl?'disabled':''}>Firmar</button><button class="btn g" data-rej="${of.id}">✕</button></div></div>`;}
    h+=`<div class="h3">Contratos activos</div>`;if(!G.contracts.length)h+=`<div class="muted">Aún ninguno.</div>`;
    for(const c of G.contracts){const a=AIRLINES[c.a],T=TYPES[c.type];h+=`<div class="card"><div class="top">${logo(a)}<div><div class="t1">${a.name}</div><div class="t2">${T.n} · ${c.times.map(t=>clockStr(t)).join(' · ')}${c.intl?' · intl':''}</div></div><span class="grow"></span><button class="btn g" data-drop="${c.id}" title="Cancelar contrato">✕</button></div>
      <div class="row muted" style="justify-content:space-between"><span>Satisfacción de la aerolínea</span><b>${Math.round(c.sat)}%</b></div><div class="bar"><i style="width:${clamp(c.sat,0,100)}%;background:${c.sat<40?'var(--bad)':c.sat<65?'var(--warn)':'var(--ok)'}"></i></div></div>`;}}
  if(tab==='fl'){const list=G.flights.filter(f=>f.state!=='done'||G.t-f.doneT<90).slice(0,26);if(!list.length)h+=`<div class="muted">No hay vuelos programados. Firma un contrato.</div>`;
    else h+=`<div class="h3">Llegadas y salidas</div>`;
    for(const f of list){const [s,c]=flStatus(f);h+=`<div class="fl"><span class="tm">${clockStr(f.std)}</span><span class="nm" style="color:${f.a.c1==='#1b1b1b'?'#fff':f.a.c1}">${f.num}</span><span class="s ${c}">${s}</span></div>`;}}
  if(tab==='fin'){const cats=Object.entries(G.fin).sort((a,b)=>b[1]-a[1]);const tot=cats.reduce((s,c)=>s+c[1],0);
    h+=`<div class="h3">Hoy</div>`;cats.forEach(([k,v])=>h+=`<div class="fin"><span>${k}</span><b class="${v>=0?'p':'n'}">${fmt$(v)}</b></div>`);const op=tot-(G.fin['Construcción']||0);h+=`<div class="fin"><span><b>Balance operativo</b></span><b class="${op>=0?'p':'n'}">${fmt$(op)}</b></div><div class="fin"><span>Con obras</span><b class="${tot>=0?'p':'n'}">${fmt$(tot)}</b></div>`;
    if(G.finY){const ty=Object.values(G.finY).reduce((a,b)=>a+b,0)-(G.finY['Construcción']||0);h+=`<div class="fin"><span>Ayer (operativo)</span><b class="${ty>=0?'p':'n'}">${fmt$(ty)}</b></div>`;}
    const staff=G.objs.reduce((s,o)=>s+staffOf(o),0);const st=G.stats,tot2=st.ontime+st.late;
    h+=`<div class="h3">Operación</div><div class="fin"><span>Nómina por hora</span><b class="n">${fmt$(-staff)}</b></div><div class="fin"><span>Puntualidad</span><b>${tot2?Math.round(st.ontime/tot2*100)+'%':'—'}</b></div>
    <div class="fin"><span>Pasajeros embarcados</span><b>${fmtN(st.dep)}</b></div><div class="fin"><span>Pasajeros llegados</span><b>${fmtN(st.arr)}</b></div><div class="fin"><span>Perdieron su vuelo</span><b class="${st.missed?'n':''}">${fmtN(st.missed)}</b></div><div class="fin"><span>Vuelos cancelados</span><b class="${st.cancel?'n':''}">${st.cancel}</b></div>
    <div class="muted">Ingresos: tasa por pasajero, aterrizajes y comercios. Gastos: nómina de cada mostrador, filtro y puerta, más mantenimiento del suelo.</div>`;}
  if(tab==='fin'){}
  if(h!==sideHTML){sideHTML=h;$('sbody').innerHTML=h;}
  const gi=GOALS.findIndex(g=>!g[1]());$('nGoals').hidden=!G.alerts.filter(a=>a.s==='b').length;$('nGoals').textContent=G.alerts.filter(a=>a.s==='b').length;$('nGoals').className='n';
  $('nCon').hidden=!G.offers.length;$('nCon').textContent=G.offers.length;
}
function flStatus(f){const p=f.plane;
  if(f.state==='cancel')return['Cancelado','r'];if(f.state==='done')return['Despegó'+(f.delay>15?' +'+Math.round(f.delay)+'′':''),f.delay>15?'r':'g'];
  if(f.state==='departed')return['Rodando a pista','g'];
  if(f.state==='parked'){if(f.boardOpen)return['Embarcando '+f.boarded+'/'+f.dep+' · P'+f.stand.num,'y'];return['En P'+f.stand.num+' · desembarque '+f.dpl+'/'+f.arr,'y'];}
  if(p){if(p.state==='approach')return['Aproximación','y'];if(p.state==='goaround')return['Motor y al aire','r'];return['Rodando a P'+f.stand.num,'y'];}
  if(G.t>f.sta+10)return['Retrasado'+(f.stand?'':' · sin puesto'),'r'];return['Llega '+clockStr(f.sta)+(f.stand?' · P'+f.stand.num:''),''];}
$('sbody').addEventListener('click',e=>{const b=e.target.closest('[data-acc],[data-rej],[data-drop],[data-al],[data-goal]');if(!b)return;
  if(b.dataset.goal){const k=b.dataset.goal;if(k==='con'){document.querySelector('.tabs [data-tab="con"]').click();return;}cat=DEF[k].cat;buildToolbar();setTool(k);return;}
  if(b.dataset.acc){acceptOffer(+b.dataset.acc);sideHTML='';}if(b.dataset.rej){G.offers=G.offers.filter(o=>o.id!==+b.dataset.rej);sideHTML='';}
  if(b.dataset.drop){if(confirmDrop===+b.dataset.drop){dropContract(+b.dataset.drop);confirmDrop=null;}else{confirmDrop=+b.dataset.drop;toast('Toca ✕ otra vez para cancelar el contrato (baja la satisfacción)','bad');}sideHTML='';}
  if(b.dataset.al){const a=G.alerts[+b.dataset.al];if(a&&a.o){focus(a.o.cx,a.o.def.apron?a.o.bottom-40:a.o.cz);G.sel={type:'obj',ref:a.o};showInfo();}}
  renderSide();});
let confirmDrop=null;
function focus(x,z){const d=new TH.Vector3().subVectors(camera.position,controls.target);controls.target.set(x,0,z);camera.position.set(x+d.x,d.y,z+d.z);}

/* ---- tarjeta de información ---- */
function showInfo(){const s=G.sel;const el=$('info');if(!s){el.hidden=true;return;}el.hidden=false;let h='';
  if(s.type==='obj'){const o=s.ref;if(!G.objs.includes(o)){G.sel=null;el.hidden=true;return;}const d=o.def;
    h=`<h4><span>${d.ic}</span>${d.apron?'Puesto P'+o.num:d.n}${LV[o.k]?' <span class="pill y">Nv '+o.lv+'</span>':''}<button class="x" data-x>✕</button></h4>`;if(LV[o.k])h+=`<div class="ln muted">${LV[o.k][o.lv].n}</div>`;
    if(!o.ok)h+=`<div class="ln" style="color:var(--bad)">⚠ ${o.why}</div>`;
    if(d.land){h+=`<div class="ln">Ocupados <b>${o.occ||0}/${spotsOf(o)}</b> puestos · cobra entrada y ${fmt$(3*(LVo(o).rev||1))} por hora</div>`;}
    if(d.apron){h+=`<div class="ln">Tamaño ${SIZEN[d.size]} · ${o.gate?'Enlazado a una puerta':'<b style="color:var(--bad)">Sin puerta enlazada</b>'}</div><div class="ln">${o.f?'Asignado a <b>'+o.f.num+'</b> ('+o.f.T.n+')':'Libre'}</div>`;}
    else{if(d.svc)h+=`<div class="ln">En cola <b>${o.queue.length}</b> · atendiendo <b>${o.serving.length}</b> · atendidos <b>${o.served}</b></div>`;
      if(o.k==='gate')h+=`<div class="ln">${o.stand?'Sirve al puesto <b>P'+o.stand.num+'</b>':'Sin puesto: construye uno en la plataforma'}</div>`;
      if(o.k==='bench')h+=`<div class="ln">Ocupados <b>${o.seats.filter(p=>p&&!p.gone).length}/4</b></div>`;
      if(o.k==='lounge')h+=`<div class="ln">Ocupada <b>${o.seats.filter(p=>p&&!p.gone).length}/${seatsOf(o)}</b> · acceso ${fmt$(revOf(o))}</div>`;
      if(o.k==='porter')h+=`<div class="ln">Maleteros libres <b>${(o.ag||[]).filter(a=>a.st==='idle').length}/${portersOf(o)}</b></div>`;
      if(o.k==='claim')h+=`<div class="ln">Esperando maletas <b>${G.pax.filter(p=>p.o===o&&p.mode==='bagwait').length}</b> · salieron <b>${o.served}</b></div>`;
      if(d.svc)h+=`<div class="ln muted">${srvOf(o)} puesto${srvOf(o)>1?'s':''} de atención · ${svcOf(o).toFixed(1)} s por pasajero</div>`;if(d.staff)h+=`<div class="ln muted">Personal: ${fmt$(staffOf(o))}/h</div>`;if(d.rev)h+=`<div class="ln muted">Vende ${fmt$(revOf(o))} por cliente</div>`;}
    if(d.apron&&o.bridge)h+=`<div class="ln">🛬 Con pasarela telescópica</div>`;h+=`<div class="ln muted">Atajos: M mover · R girar · Supr demoler</div>`;}
  else if(s.type==='plane'){const p=s.ref;if(!G.planes.includes(p)){G.sel=null;el.hidden=true;return;}const f=p.f;
    h=`<h4>${logo(f.a)}${f.num}<button class="x" data-x>✕</button></h4><div class="ln">${f.a.name} · ${f.T.n} · ${p.reg}</div><div class="ln">${f.orig.n} → aquí → ${f.dest.n}${f.intl?' (internacional)':''}</div>
    <div class="ln">Llegada ${clockStr(f.sta)} · Salida <b>${clockStr(f.std)}</b></div><div class="ln">${flStatus(f)[0]}</div><div class="ln muted">Llegan ${f.arr} · salen ${f.dep} · embarcados ${f.boarded}${f.missed?' · perdieron el vuelo '+f.missed:''}</div>`;}
  else if(s.type==='pax'){const p=s.ref;if(p.gone){G.sel=null;el.hidden=true;return;}const f=p.f,sc=Math.round(score(p));
    const doing=p.mode==='queue'?'En la cola de '+p.o.def.n.toLowerCase():p.mode==='svc'?'Siendo atendido':p.mode==='seat'?'Sentado esperando':p.mode==='standby'?'De pie esperando':p.mode==='bagwait'?'Esperando su maleta':p.mode==='stuck'?'Perdido: no encuentra '+(p.need?DEF[p.need].n.toLowerCase():'el camino'):p.boarded?'Abordando':'Caminando';
    h=`<h4>${p.lk.kid?'🧒':'🧑'} ${p.name}<button class="x" data-x>✕</button></h4><div class="ln">${p.dep?'Sale en':'Llegó en'} <b>${f.num}</b> ${p.dep?'a '+f.dest.n+' · '+clockStr(f.std):'desde '+f.orig.n}</div><div class="ln">${doing}</div>
    <div class="ln">Ánimo ${sc>=75?'😊':sc>=50?'😐':'😠'} <b>${sc}%</b> · esperó ${Math.round(p.wait*MIN_PER_S)} min</div>`;}
  if(el.innerHTML!==h)el.innerHTML=h;}
$('info').addEventListener('click',e=>{if(e.target.closest('[data-x]')){G.sel=null;$('info').hidden=true;}if(e.target.closest('[data-sell]')&&G.sel){const o=G.sel.ref;if(removeObj(o,true)){G.sel=null;$('info').hidden=true;buildToolbar();}}});

/* ---- HUD ---- */
function updHUD(){$('vMoney').textContent=fmt$(G.money);$('hMoney').classList.toggle('neg',G.money<0);$('vClock').textContent=clockStr(G.t);$('vDay').textContent='Día '+(dayOf(G.t)+1);
  $('vStars').innerHTML='★'.repeat(G.star)+'<i>'+'★'.repeat(5-G.star)+'</i>';$('vRating').textContent='satisfacción '+Math.round(G.rating)+'%';$('vPax').textContent=fmtN(G.paxDay);
  document.querySelectorAll('.tool').forEach(b=>{const d=DEF[b.dataset.k];b.classList.toggle('cant',!(d.star&&G.star<d.star)&&d.cost>G.money);});}

/* ---- guardado ---- */
const SKEY='pistalibre_builder_v5';
function save(){if(!G||titleOn||G.over)return;try{let rle='',cur=G.floor[0],n=0;for(let i=0;i<GW*GH;i++){if(G.floor[i]===cur)n++;else{rle+=cur+':'+n+',';cur=G.floor[i];n=1;}}rle+=cur+':'+n;
  const d={v:1,t:G.t,money:G.money,star:G.star,rating:G.rating,paxTotal:G.paxTotal,paxDay:G.paxDay,stats:G.stats,seq:G.seq,floor:rle,objs:G.objs.concat(G.moving?[G.moving.o]:[]).map(o=>o===(G.moving&&G.moving.o)?[o.id,o.k,G.moving.gx,G.moving.gy,G.moving.r,o.lv,o.bridge?1:0]:[o.id,o.k,o.gx,o.gy,o.r,o.lv||1,o.bridge?1:0]),lot:G.lot,land:G.land,up:G.up,tmid:G.tmid,
    contracts:G.contracts,offers:G.offers,nextOffer:G.nextOffer,lastDay:G.lastDay,tx0:G.tx0,tx1:G.tx1,exp:G.exp,fbo:(()=>{const o={};FBKEYS.forEach(k=>o[k]=G.fbo[k]);return o;})(),fin:G.fin,finY:G.finY,sound:G.sound};localStorage.setItem(SKEY,JSON.stringify(d));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(SKEY)||'null');if(!d||d.v!==1)return false;newGame();
  Object.assign(G,{tmid:d.tmid||57,lot:d.lot||G.lot,land:d.land||0,up:Object.assign(G.up,d.up||{}),tx0:d.tx0,tx1:d.tx1,exp:d.exp||0,t:d.t,money:d.money,star:d.star,rating:d.rating,paxTotal:d.paxTotal,paxDay:d.paxDay||0,stats:d.stats,seq:d.seq,contracts:d.contracts||[],offers:d.offers||[],nextOffer:d.nextOffer,lastDay:d.lastDay,fin:d.fin||{},finY:d.finY,sound:false});
  if(d.fbo)FBKEYS.forEach(k=>{if(typeof d.fbo[k]==='number')G.fbo[k]=d.fbo[k];});G.northDirty=true;
  let i=0;d.floor.split(',').forEach(s=>{const [v,n]=s.split(':').map(Number);for(let k=0;k<n;k++)G.floor[i++]=v;});
  setRunway();G.baseDirty=true;G.objs=d.objs.map(([id,k,gx,gy,r,lv,br])=>({id,k,gx,gy,r,lv:lv||1,bridge:!!br}));G.objs.forEach(o=>{initObj(o);if(!o.def.apron&&!o.def.land)o.cells.forEach(c=>G.cobj[c]=o.id);});navChanged();
  G.contracts.forEach(c=>{genFlights(c,dayOf(G.t),G.t+30);genFlights(c,dayOf(G.t)+1,G.t+30);});return true;}catch(e){console.warn(e);return false;}}
setInterval(save,20000);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});

/* ---- pantallas ---- */
function showOver(kind){const el=$('over'),c=$('overCard');el.hidden=false;
  if(kind==='bank'){setSpeed(0);c.innerHTML=`<div class="t1" style="font-size:30px">Quiebra</div><div class="muted">La caja bajó de −$60.000. Los acreedores toman el aeropuerto.</div><div class="row" style="justify-content:center"><button class="btn" data-o="new">Empezar de nuevo</button></div>`;}
  else c.innerHTML=`<div class="t1" style="font-size:26px">Pista Libre</div><div class="muted">La partida se guarda sola en este navegador.</div><div class="row" style="justify-content:center;gap:6px;flex-wrap:wrap"><span class="muted">Gráficos:</span>${GQN.map((n,i)=>`<button class="btn${GFX.q===i?'':' g'}" data-q="${i}">${n}</button>`).join('')}</div><div class="muted" style="font-size:12px">Baja: ideal para teléfono · Alta: bloom, reflejos y sombras de nubes · Ultra: reflejos en tiempo real y pintura con barniz</div><div class="row" style="justify-content:center"><button class="btn" data-o="close">Seguir</button><button class="btn g" data-o="save">Guardar ahora</button><button class="btn r" data-o="new">Nueva partida</button></div>`;}
$('over').addEventListener('click',e=>{const bq=e.target.closest('[data-q]');if(bq){setQ(+bq.dataset.q,true);toast('Gráficos: '+GQN[GFX.q]);showOver('menu');return;}const b=e.target.closest('[data-o]');if(!b)return;const o=b.dataset.o;
  if(o==='close'){$('over').hidden=true;}if(o==='save'){save();toast('Partida guardada','ok');$('over').hidden=true;}
  if(o==='new'){if(b.dataset.sure||G.over){try{localStorage.removeItem(SKEY);}catch(e){}newGame();G.dirty=true;$('over').hidden=true;buildToolbar();setSpeed(1);sideHTML='';introCam();}else{b.dataset.sure=1;b.textContent='¿Seguro? Se borra la partida';}}});
function introCam(){focus((TB.x0+TB.x1+1)/2*CELL,(APR+GH)/2*CELL-20);camera.position.set((TB.x0+TB.x1+1)/2*CELL+170,230,(APR+GH)/2*CELL+290);controls.update();}
function startGame(loaded){titleOn=false;$('title').remove();document.body.classList.remove('intitle');if(innerWidth<760){$('side').classList.add('min');document.querySelector('.tabs [data-tab="min"]').textContent='▴';}if(!loaded)newGame();buildToolbar();setSpeed(1);introCam();renderSide();
  if(!loaded)setTimeout(()=>toast('La terminal ya está lista: hall público abajo, sala estéril (azul) arriba. Sigue las Metas.'),600);}
$('bNew').addEventListener('click',()=>{ensureAudio();startGame(false);});
$('bCont').addEventListener('click',()=>{ensureAudio();startGame(load());});
try{if(localStorage.getItem(SKEY))$('bCont').hidden=false;}catch(e){}

/* ---- arranque ---- */
newGame();G.t=11*60;buildCity();if(CITY&&CITY.grp)CITY.grp.position.set(-140,0,-254);drawBase();
function resize(){const w=Math.max(200,innerWidth),h=Math.max(200,innerHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);resize();
let last=performance.now(),uiT=0,orbit=0;
function frame(now){const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(titleOn){orbit+=dt*0.05;camera.position.set(GW*CELL/2+Math.cos(orbit)*560,280,150+Math.sin(orbit)*560);controls.target.set(GW*CELL/2,0,120);camera.lookAt(controls.target);G.t+=dt*4;}
  else{let tot=dt*G.speed;while(tot>1e-6){const s=Math.min(tot,0.05);step(s);tot-=s;}controls.update();}
  render3D(dt*(G.speed||0.0001));if(!titleOn)updSelBar();
  uiT-=dt;if(uiT<=0&&!titleOn){uiT=0.35;updHUD();renderSide();if(G.sel)showInfo();}
  requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.PL={dbgLeader:(v)=>{const l=drvLeader(v,G.veh.concat(G.fv||[]));return l?{t:l.q.type,x:Math.round(l.q.x),z:Math.round(l.q.z),d:l.d.toFixed(1),st:l.q.state,sp:l.q.sp}:null;},buyFbo,fbs:()=>({pj:G.pj.map(j=>j.st+(j.lead?(j.lead.boarded?"B":j.lead.lounge?"L":"w"):"")),hc:G.hc.map(h=>h.st),fa:G.fa.length,fv:G.fv.map(v=>v.type+":"+v.st),tr:G.fbT.st,mov:G.fbo.mov,vip:G.fbo.vip}),pm:()=>{const o={};for(const k in PM)o[k]=[PC[k],PM[k].instanceMatrix.count];return o;},gse:()=>GSEL.length,bays:()=>bays(),info:()=>({calls:GFX.calls,extra:GFX.extra,tris:renderer.info.render.triangles}),gfx:()=>({q:GFX.q,pp:PP.ok,mir:MIR.on,wx:WX.r,wet:WX.wet,parts:PT.n,rub:RUB.n,cine:CINE.on,shot:CINE.shot&&CINE.shot.cap}),setQ,setWeather,WX,cineStart,cineStop,_gx:{GU,PP,MIR,CUBE,GLASS,groundM,ppFinal},startMove,upgradeObj,rotateObj,buildBridge,buyLand,buyUpgrade,expandTerm,scr:(x,z)=>{const v=new TH.Vector3(x,0,z).project(camera);return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight];},get G(){return G;},placeObj,paintRect,acceptOffer,step,setSpeed,startGame,cidx,DEF,save,load,focus,camera,controls,setTool};
})();
