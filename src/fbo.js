
/* ================= AERÓDROMO EJECUTIVO NORTE (simulación) ================= */
const FB={rz:-400,r0:180,tz:-446,nose:-600,tx0:380,tx1:820,tz0:-682,tz1:-614,cz:-706,gw:-201,gy:14,lnk:-118,stn:[322,-700],
  heli:[[1048,-588],[1118,-588],[1048,-518],[1118,-518]],hang:[140,222],hz0:-642,hz1:-578,lake:[-30,-640,110,80],bays:[530,570,610,650,690]};
const fbR1=()=>G.fbo&&G.fbo.rwy?1180:1060;
const fbStX=i=>330+i*78;
const JT={LJ75:{k:'LJ75',n:'Learjet 75',len:17.7,span:15.5,pax:6,fee:1800},C68A:{k:'C68A',n:'Citation Latitude',len:19,span:22,pax:8,fee:2600},
  BBJ:{k:'BBJ',n:'Boeing Business Jet',len:39.5,span:35.8,pax:19,fee:11000,big:1,wing:1},
  G650:{k:'G650',n:'Gulfstream G650',len:30,span:30,pax:12,fee:5200,big:1},GL7T:{k:'GL7T',n:'Bombardier Global 7500',len:33,span:31,pax:14,fee:6800,big:1}};
const JSCH=[['#f7f8fa','#1b2a3a','#c9a24a'],['#f7f8fa','#7a1f2b','#1b1b1b'],['#1d1f22','#c9a24a','#c9a24a'],['#f7f8fa','#2f6db5','#2f6db5'],['#e9edf0','#3a3f45','#8a1f1f'],['#f7f8fa','#0f7a5a','#0f7a5a']];
const HSCH=[['#141414','#c9a24a'],['#f4f6f8','#1f4f8f'],['#8a1f1f','#f4f6f8'],['#1b2a3a','#e9edf0']];
const ROLES=[{k:'art',ic:'🎤',n:'Artista',w:.25},{k:'pol',ic:'🏛️',n:'Político',w:.22},{k:'emp',ic:'💼',n:'Empresario',w:.38},{k:'dep',ic:'⚽',n:'Deportista',w:.15}];
const FBX={on:'Aeródromo ejecutivo',st:'Puestos de jets',heli:'Helipuerto',hang:'Hangar ejecutivo',lv:'Sala FBO',cus:'Aduana privada',rwy:'Pista extendida',link:'Plataforma de enlace',apm:'Tren ligero',bus:'Shuttle'};
const FBMAX={on:1,st:8,heli:2,hang:2,lv:3,cus:1,rwy:3,link:1,apm:1,bus:1,twr:1,fuel:1,cat:1,mro:1,park:1};
const FBKEYS=['on','st','heli','hang','lv','cus','rwy','link','apm','bus','twr','fuel','cat','mro','park','vip','mov'];
function fbInit(){G.fbo={on:0,st:4,heli:0,hang:0,lv:1,cus:0,rwy:0,link:0,apm:0,bus:0,twr:0,fuel:0,cat:0,mro:0,park:0,nj:25,nh:20,mov:0,vip:0};G.pj=[];G.hc=[];G.fa=[];G.fv=[];G.fbT={st:'A',t:0,u:0,pax:[]};}
function fbMaxed(k){const d=DEF[k];if(!d||!d.fbo)return false;return G.fbo[d.fbo]>=FBMAX[d.fbo];}
function buyFbo(k){const d=DEF[k],F=G.fbo;
  if(k==='fboGo'){fbLook();return false;}
  if(d.fbo!=='on'&&!F.on){toast('Primero construye el aeródromo ejecutivo','bad');return false;}
  if(fbMaxed(k)){toast(d.n+': ya está al máximo','bad');return false;}
  if(d.star&&G.star<d.star){toast('Se desbloquea con '+d.star+' estrellas','bad');return false;}
  const c=fbCost(k);if(G.money<c){toast('Falta dinero: cuesta '+fmt$(c),'bad');return false;}
  spend('Construcción',c);
  if(d.fbo==='st')F.st=Math.min(8,F.st+2);else if(['hang','lv','heli','rwy'].includes(d.fbo))F[d.fbo]++;else F[d.fbo]=1;
  G.dirty=true;G.northDirty=true;if(d.fbo==='link')G.baseDirty=true;sfx('star');toast(d.n+' listo','ok');
  if(d.fbo==='on')fbLook(true);return true;}
function fbCost(k){const d=DEF[k],F=G.fbo;if(k==='fboLounge')return F.lv>=2?220000:140000;if(k==='fboRwy')return[160000,140000,260000][Math.min(2,F.rwy)];if(k==='fboHeli')return[95000,120000][Math.min(1,F.heli)];return d.cost;}
function fbPrice(k){const d=DEF[k];if(k==='fboGo')return'🎥';if(fbMaxed(k))return'✓ listo';if(d.fbo!=='on'&&!G.fbo.on)return'🔒 '+fmt$(fbCost(k));const lv={rwy:G.fbo.rwy+1,heli:G.fbo.heli+1,lv:G.fbo.lv+1,hang:G.fbo.hang+1}[d.fbo];return(lv&&FBMAX[d.fbo]>1?'Nv'+lv+' · ':'')+fmt$(fbCost(k));}
let fbLookN=false;function fbLook(force){fbLookN=force?true:!fbLookN;if(fbLookN)focus(600,-540);else focus(GW*CELL/2,GH*CELL/2);}
const rolePick=()=>{let r=Math.random();for(const q of ROLES){if(r<q.w)return q;r-=q.w;}return ROLES[2];};
function vipLook(role){const lk=look();lk.kid=false;lk.glasses=role.k==='art'||Math.random()<0.4;
  if(role.k==='pol'){lk.shirt=pick(['#1b1f26','#20262e','#2b2f36']);lk.pants='#1b1f26';lk.shoe='#111';}
  else if(role.k==='emp'){lk.shirt=pick(['#2b3a4a','#3a3f45','#1b2a3a','#5a4632']);lk.pants=pick(['#1b1f26','#2b2f36']);lk.shoe='#3a2a1e';}
  else if(role.k==='art'){lk.shirt=pick(['#d6343a','#c9a24a','#7b4fb0','#f4f4f4','#ff7a1a','#e84393']);lk.pants=pick(['#141414','#f4f4f4','#2b2f36']);lk.shoe=pick(['#f4f4f4','#141414']);}
  else{lk.shirt=pick(['#1f6fd1','#d6343a','#0f7a5a','#f2b705']);lk.pants='#141414';lk.shoe='#f4f4f4';}
  return lk;}
const GUARD=i=>Object.assign(staffLook(i,'#141414',null,false),{pants:'#141414',glasses:true,shoe:'#111'});
const FSTAFF=i=>Object.assign(staffLook(i,'#1b2a3a',null,false),{pants:'#1b2a3a'});
/* ---- asientos de la sala FBO ---- */
function fbSeats(){const n=G.fbo.lv>=3?26:G.fbo.lv>=2?18:10,P=[];
  for(let i=0;i<n;i++){const side=i%2,k=Math.floor(i/2),col=k%5,row=Math.floor(k/5);P.push([side?650+col*30:410+col*30,-646+row*11,-Math.PI/2]);}return P;}
let FBSEAT=[],FBSG=null;
function fbSeat(a){if(FBSG!==G){FBSEAT=[];FBSG=G;}const P=fbSeats();for(let i=0;i<P.length;i++){const q=FBSEAT[i];if(!q||q.gone||q.seat!==i){FBSEAT[i]=a;a.seat=i;return P[i];}}return null;}
function fbUnseat(a){if(a.seat!=null&&FBSEAT[a.seat]===a)FBSEAT[a.seat]=null;a.seat=null;}
/* ---- agentes del FBO (pasajeros VIP, séquito, prensa) ---- */
function fbAgent(o){const a=Object.assign({id:G.seq++,x:0,z:0,el:0,hdg:0,walk:R(0,6),moving:false,spd:R(13,16),steps:[],hidden:false,sit:false,pose:null,ent:[]},o);G.fa.push(a);return a;}
function fbEnt(a,role){const e=[];const n=role.k==='pol'?2:role.k==='art'?2:role.k==='dep'?1:Math.random()<0.5?1:0;for(let i=0;i<n;i++)e.push({lk:GUARD(a.id*3+i),k:'g'});if(Math.random()<0.55)e.push({lk:FSTAFF(a.id),k:'cart'});return e;}
function fbUpdA(a,dt,dtg){a.moving=false;let st=a.steps[0];let guard=0;
  while(st&&st.f&&guard++<8){a.steps.shift();st.f(a);st=a.steps[0];}
  if(!st){a.gone=true;return;}
  if(st.g){const tx=st.g[0],tz=st.g[1],e0=a.el||0,tE=st.g[2]==null?e0:st.g[2],sp=(st.s||a.spd)*dt,dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);
    if(d<0.05){if(Math.abs(tE-e0)<0.02){a.el=tE;a.steps.shift();return;}const v=Math.min(Math.abs(tE-e0),(st.s||a.spd)*0.6*dt);a.el=e0+Math.sign(tE-e0)*v;a.moving=!st.ride;a.walk+=dt*8;return;}
    if(d<=sp){a.x=tx;a.z=tz;a.el=tE;a.steps.shift();}else{a.x+=dx/d*sp;a.z+=dz/d*sp;a.el=e0+(tE-e0)*(sp/d);a.hdg=lerpAng(a.hdg,Math.atan2(dz,dx),Math.min(1,dt*10));a.walk+=dt*a.spd*0.55;a.moving=!st.ride;}return;}
  if(st.w!=null){a.sit=!!st.sit;a.pose=st.pose||null;if(st.h!=null)a.hdg=lerpAng(a.hdg,st.h,Math.min(1,dt*5));st.w-=dtg;if(st.w<=0){a.steps.shift();a.sit=false;a.pose=null;}return;}
  if(st.u){a.sit=!!st.sit;a.pose=st.pose||null;if(st.h!=null)a.hdg=lerpAng(a.hdg,st.h,Math.min(1,dt*5));if(st.u(a)){a.steps.shift();a.sit=false;a.pose=null;}return;}
  a.steps.shift();}
const G_=(x,z,e,s,ride)=>({g:[x,z,e],s,ride}),W_=(w,pose,h,sit)=>({w,pose,h,sit}),F_=f=>({f}),U_=(u,pose,h,sit)=>({u,pose,h,sit});
/* recorrido dentro de la terminal FBO */
function fbDepartSteps(a,intl){const S=[G_(600+R(-6,6),-690),G_(600+R(-3,3),-675),G_(a.desk||560,-668),W_(1.2,null,-Math.PI/2),G_(600,-656),W_(0.6,null,Math.PI/2),G_(600,-646)];
  if(intl&&G.fbo.cus)S.push(G_(686,-650),W_(1,null,-Math.PI/2),G_(660,-640));
  S.push(F_(fbLounge));return S;}
function fbLounge(a){const p=fbSeat(a);a.lounge=1;a.tT=G.t+120;a.steps.unshift(p?G_(p[0],p[1]):G_(600+R(-40,40),-634),U_(q=>q.call||q.tmo,null,p?p[2]:Math.PI/2,!!p));}
function fbAirsideOut(a,dx,dz){return[F_(fbUnseat),G_(clamp(dx,FB.tx0+14,FB.tx1-14),-626),G_(clamp(dx,FB.tx0+14,FB.tx1-14),-610)];}
/* ---- llegada en limusina / camioneta ---- */
function fbBayFree(){for(const x of FB.bays)if(!G.fv.some(v=>v.bay===x&&!v.gone))return x;return null;}
function fbCar(type,o){const v=Object.assign({id:G.seq++,type,x:593,z:-890,hdg:Math.PI/2,sp:26,spd:type==='bus'?32:38,path:[],st:'drive',t:0,c:type==='limo'?'#0e0f11':type==='suv'?'#111316':pick(['#0e0f11','#c9a24a','#8a1f1f','#f4f4f4']),grp:[]},o||{});if(G.fbo&&G.fbo.park&&(type==='limo'||type==='suv'))earn('Aviación ejecutiva',60);G.fv.push(v);return v;}
/* red vial del lado tierra: bulevar de doble sentido, glorieta antihoraria y carril de dejada en sentido este (terminal a la derecha) */
const ringArc=(a0,a1)=>{const o=[],n=Math.ceil(Math.abs(a1-a0)/0.2);for(let k=0;k<=n;k++){const a=a0+(a1-a0)*k/n;o.push([600+28*Math.cos(a),-792+28*Math.sin(a)]);}return o;};
const FB_IN=bx=>[[593,-890],[593,-828],...ringArc(-1.82,-2.95),[560,-797],[482,-797],[458,-782],[458,-726],[474,-712],[bx-30,-712],[bx,-702]];
const FB_OUT=bx=>[[bx+24,-712],[700,-712],[712,-724],[712,-776],[700,-788],[640,-794],...ringArc(-0.1,-1.32),[607,-832],[607,-890]];
function fbSpawnDepGroup(j,pre){const role=pre?pre.role:rolePick();const bx=fbBayFree();
  const lead=fbAgent({role,lk:vipLook(role),name:pick(FIRST)+' '+pick(LAST),dep:j,hidden:true,x:bx||600,z:-700,hdg:-Math.PI/2});lead.ent=fbEnt(lead,role);lead.desk=pick([556,644]);
  const v=fbCar(Math.random()<0.6?'limo':'suv',{grp:[lead]});lead.car=v;
  v.bay=bx;v.path=FB_IN(bx||530);
  lead.steps=[U_(q=>!q.car),F_(a=>{if(a.role.k==='art')fbPress(a.x,a.z,4);})];lead.steps.push(...fbDepartSteps(lead,j.intl));
  return lead;}
function fbBoardSteps(a,j){const d=jetDoor(j);return[...fbAirsideOut(a,d[0]),G_(d[0]-3,-608),G_(d[0]-3,d[1]),G_(d[0],d[1],0),G_(d[0]+3.6,d[1],jetSill(j)),F_(a=>{a.hidden=true;a.boarded=true;}),U_(()=>false)];}
/* ---- prensa en la acera (artistas) ---- */
function fbPress(x,z,n){for(let i=0;i<n;i++){const px=x+R(-14,14),pz=z-R(12,20);fbAgent({press:1,lk:look({glasses:false}),x:px+R(-30,30),z:pz-30,steps:[G_(px,pz),W_(R(5,8),'phone',Math.atan2(z-pz,x-px)),G_(px+R(-40,40),pz-60)]});}}
/* ---- jets privados ---- */
const jetL=j=>j.T.len*PSCALE,jetR=j=>Math.max(1.6,jetL(j)*0.05);
function jetDoor(j){const L=jetL(j),Rr=jetR(j);return[j.x-Rr-4.2,j.z-L*0.26];}
function jetSill(j){return jetR(j)*0.55+2.4;}
function jetSpawn(){const n=G.fbo.st;const free=[];for(let i=0;i<n;i++)if(!G.pj.some(j=>j.si===i))free.push(i);if(!free.length)return false;
  if(G.pj.some(j=>['app','roll'].includes(j.st))||G.fbo.rl)return false;
  const ks=['LJ75','C68A','G650','C68A'];if(G.fbo.rwy)ks.push('GL7T','G650');if(G.fbo.rwy>=3)ks.push('BBJ','BBJ');const T=JT[pick(ks)],r1=fbR1();
  const j={id:G.seq++,T,lead:null,sch:pick(JSCH),reg:(Math.random()<0.6?'YV':'N')+(100+Math.floor(Math.random()*899))+pick(['GA','JX','VP','LS','']),x:r1+980,z:FB.rz,hdg:Math.PI,alt:170,spd:70,st:'app',path:[],si:pick(free),intl:!!G.fbo.cus&&Math.random()<0.45,role:rolePick(),wait:0};
  G.pj.push(j);G.fbo.rl=j;return true;}
function jFollow(j,dt,spd,rev){let rem=spd*dt;while(rem>0&&j.path.length){const t=j.path[0],dx=t[0]-j.x,dz=t[1]-j.z,d=Math.hypot(dx,dz);
    if(d>0.05){const h=Math.atan2(dz,dx);j.hdg=rev?lerpAng(j.hdg,h+Math.PI,Math.min(1,dt*3)):lerpAng(j.hdg,h,Math.min(1,dt*(spd>30?2:4)));}
    if(d<=rem){j.x=t[0];j.z=t[1];rem-=d;j.path.shift();}else{j.x+=dx/d*rem;j.z+=dz/d*rem;rem=0;}}return!j.path.length;}
function jetArrPax(j){const role=j.role,d=jetDoor(j);const lead=fbAgent({role,lk:vipLook(role),name:pick(FIRST)+' '+pick(LAST),x:d[0]+3.6,z:d[1],el:jetSill(j),hdg:Math.PI});lead.ent=fbEnt(lead,role);
  const S=[G_(d[0],d[1],0),G_(d[0]-3,d[1]),G_(d[0]-3,-608),G_(clamp(d[0],FB.tx0+14,FB.tx1-14),-612),G_(clamp(d[0],FB.tx0+14,FB.tx1-14),-630)];
  if(j.intl&&G.fbo.cus)S.push(G_(686,-640),W_(1,null,-Math.PI/2));
  const toHeli=G.fbo.heli&&Math.random()<0.18;
  if(toHeli){S.push(F_(a=>{a.wantHeli=1;fbLounge(a);}));}
  else S.push(G_(600,-660),G_(600,-686),F_(a=>{if(a.role.k==='art')fbPress(a.x,a.z,4);a.steps.unshift(...fbPickup(a));}));
  lead.steps=S;G.fbo.vip++;G.paxTotal++;G.paxDay++;return lead;}
function fbPickup(a){const bx=fbBayFree();const x=bx||530;const v=fbCar(a.role.k==='pol'?'suv':Math.random()<0.5?'limo':'suv',{wantP:a,bay:bx});v.path=FB_IN(x);
  return[G_(x+R(-4,4),-694),U_(q=>v.st!=='drive',null,Math.PI/2),F_(q=>{if(v.st!=='stop'||v.gone){q.gone=true;return;}q.steps.unshift(G_(v.x,-702),F_(z=>{if(v.st!=='stop'){z.gone=true;return;}z.hidden=true;v.grp.push(z);v.loaded=true;}));}),U_(()=>false)];}
function updJet(j,dt){const r1=fbR1(),TD=r1-90;
  switch(j.st){
    case 'app':j.x-=j.spd*dt;j.alt=Math.max(0,(j.x-TD)/980*170);if(j.alt<=0){j.st='roll';const fee=Math.round(j.T.fee*(j.intl?1.4:1));earn('Aviación ejecutiva',fee);pop3(j.x,FB.rz,'+'+fmt$(fee));G.fbo.mov++;
        for(let i=0;i<4;i++)G.fx.push({x:j.x+R(-4,4),y:j.z+R(-6,6),h:1,r:R(2,4),t:0,life:R(0.7,1.3),c:'#e8e8e8'});}break;
    case 'roll':{j.spd=Math.max(20,j.spd-26*dt);j.x-=j.spd*dt;if(j.spd<=20.1){const exs=[r1-420,300];const ex=exs.find(x=>x<j.x-30)??300;const sx=fbStX(j.si),pz=FB.nose+jetL(j)/2,dr=sx>=ex?1:-1;
        j.path=[[ex+16,FB.rz],[ex,FB.rz-16],[ex,FB.tz+10],[ex+dr*12,FB.tz],[sx-dr*12,FB.tz],[sx,FB.tz-12],[sx,pz]];j.st='taxi';}break;}
    case 'taxi':if(G.fbo.rl===j&&j.z<FB.rz-26)G.fbo.rl=null;if(jFollow(j,dt,j.path.length<2?10:22)){j.st='park';j.parkT=G.t;j.depT=G.t+R(50,110);j.hdg=-Math.PI/2;
        earn('Aviación ejecutiva',Math.round((j.T.big?1300:700)*(1+(G.fbo.lv-1)*0.25)*(G.fbo.fuel?1.4:1)));jetArrPax(j);if(typeof fbJetGSE==='function')fbJetGSE(j);}break;
    case 'park':
      if(!j.dg&&G.t>=j.depT-55){j.dg=1;const tq=G.fa.find(a=>a.wantJet&&a.lounge&&!a.call&&!a.gone&&!a.dep&&!a.tmo);if(tq){j.lead=tq;tq.dep=j;}else j.lead=fbSpawnDepGroup(j);}
      if(j.lead&&!j.called&&G.t>=j.depT-14){const l=j.lead;if(l.lounge&&!l.gone&&!l.tmo){j.called=1;l.call=1;l.steps=fbBoardSteps(l,j);}}
      if(G.t>=j.depT&&((j.lead&&j.lead.boarded)||G.t>j.depT+25||(j.lead&&j.lead.gone))){if(j.lead&&!j.lead.boarded){j.lead.call=1;}
        if(j.lead&&j.lead.boarded){j.lead.gone=true;G.fbo.vip++;G.paxTotal++;G.paxDay++;earn('Aviación ejecutiva',Math.round(450*(1+(G.fbo.lv-1)*0.6)*(G.fbo.cat?1.3:1)));}
        j.st='push';j.path=[[j.x,FB.tz-6]];if(typeof fbJetGSEOff==='function')fbJetGSEOff(j);}break;
    case 'push':if(jFollow(j,dt,8,true)){j.st='taxo';j.path=[[j.x+16,FB.tz],[r1-40,FB.tz],[r1-24,FB.tz+10]];}break;
    case 'taxo':if(jFollow(j,dt,22)){j.st='hold';}break;
    case 'hold':if(!G.fbo.rl&&!G.pj.some(q=>q.st==='app'&&q.x<r1+500)){G.fbo.rl=j;j.st='line';j.path=[[r1-24,FB.rz],[r1-50,FB.rz]];}break;
    case 'line':if(jFollow(j,dt,14)){j.st='tko';j.spd=18;j.hdg=Math.PI;}break;
    case 'tko':j.spd=Math.min(90,j.spd+17*dt);j.x-=j.spd*dt;j.hdg=Math.PI;if(j.spd>48)j.alt+=dt*(j.spd-42)*0.85;if(j.alt>6&&G.fbo.rl===j){G.fbo.rl=null;G.fbo.mov++;}
      if(j.alt>320||j.x<-900){j.gone=true;if(G.fbo.rl===j)G.fbo.rl=null;}break;
  }}
/* ---- helicópteros ---- */
function heliSpawn(){const busy=G.hc.map(h=>h.pad);const free=(G.fbo.heli>=2?[0,1,2,3]:[0,1]).filter(i=>!busy.includes(i));if(!free.length)return false;const pad=pick(free),P=FB.heli[pad];
  const h={id:G.seq++,pad,sch:pick(HSCH),x:P[0]+520,z:P[1]-640,alt:190,hdg:0,st:'in',rot:1,t:0,role:rolePick(),reg:'YV'+(1000+Math.floor(Math.random()*8999))};h.hdg=Math.atan2(P[1]-h.z,P[0]-h.x);G.hc.push(h);return true;}
function updHeli(h,dt,dtg){const P=FB.heli[h.pad];
  switch(h.st){
    case 'in':{const dx=P[0]-h.x,dz=P[1]-h.z,d=Math.hypot(dx,dz),sp=48*dt;h.hdg=lerpAng(h.hdg,Math.atan2(dz,dx),Math.min(1,dt*2));h.alt=Math.max(36,h.alt-dt*14);if(d<=sp){h.x=P[0];h.z=P[1];h.st='land';}else{h.x+=dx/d*sp;h.z+=dz/d*sp;}break;}
    case 'land':h.alt=Math.max(0,h.alt-dt*9);h.hdg=lerpAng(h.hdg,Math.PI,dt*0.8);if(h.alt<=0){h.st='park';h.t=0;h.depT=G.t+R(20,45);const fee=2600;earn('Aviación ejecutiva',fee);pop3(h.x,h.z,'+'+fmt$(fee));G.fbo.mov++;heliArrPax(h);}break;
    case 'park':h.rot=Math.max(0.0,h.rot-dt*0.25);
      if(!h.lead&&G.t>=h.depT-25){const tq=G.fa.find(a=>a.wantHeli&&a.lounge&&!a.call&&!a.gone&&!a.heli&&!a.tmo);if(tq){h.lead=tq;tq.heli=h;}else{h.lead=fbSpawnDepGroup({intl:false});h.lead.heli=h;}}
      if(h.lead&&!h.called&&G.t>=h.depT-10&&h.lead.lounge&&!h.lead.gone&&!h.lead.tmo){h.called=1;const l=h.lead;l.call=1;l.steps=[F_(fbUnseat),G_(812,-640),G_(840,-640),G_(P[0]-34,P[1]+4),G_(P[0]-6,P[1]+3),F_(a=>{a.hidden=true;a.boarded=true;}),U_(()=>false)];}
      if(G.t>=h.depT&&((h.lead&&h.lead.boarded)||G.t>h.depT+25||(h.lead&&h.lead.gone))){if(h.lead&&h.lead.boarded){h.lead.gone=true;G.fbo.vip++;G.paxTotal++;G.paxDay++;earn('Aviación ejecutiva',1900);}h.st='spin';}break;
    case 'spin':h.rot=Math.min(1,h.rot+dt*0.35);if(h.rot>=1){h.st='up';}break;
    case 'up':h.alt+=dt*12;if(h.alt>45){h.st='out';G.fbo.mov++;}break;
    case 'out':{h.hdg=lerpAng(h.hdg,Math.atan2(-1,0.6),dt*1.2);const sp=55*dt;h.x+=Math.cos(h.hdg)*sp;h.z+=Math.sin(h.hdg)*sp;h.alt=Math.min(260,h.alt+dt*16);if(h.z<-1500||h.alt>=260)h.gone=true;break;}
  }}
function heliArrPax(h){const P=FB.heli[h.pad],role=h.role;const lead=fbAgent({role,lk:vipLook(role),name:pick(FIRST)+' '+pick(LAST),x:P[0]-6,z:P[1]+3,hdg:Math.PI});lead.ent=fbEnt(lead,role).filter(e=>e.k==='g');
  lead.steps=[G_(P[0]-34,P[1]+4),G_(840,-640),G_(812,-640),G_(600,-660),G_(600,-686),F_(a=>{if(a.role.k==='art')fbPress(a.x,a.z,3);a.steps.unshift(...fbPickup(a));})];G.fbo.vip++;G.paxTotal++;G.paxDay++;}
/* ---- transbordos desde la terminal principal ---- */
function fbTransferOK(){return G.fbo.on&&(G.fbo.apm||G.fbo.bus);}
function fbMainSX(){return G.tx0*CELL-30;}
function fboTransfer(p){if(!fbTransferOK()||!(p.vip||p.prem))return false;if(Math.random()>(p.vip?0.85:0.3))return false;
  const role=p.vip?rolePick():ROLES[2];const a=fbAgent({role,lk:p.lk,name:p.name,x:p.x,z:p.z,hdg:p.hdg,spd:p.spd*1.05,tr:1});a.ent=p.escort?[{lk:p.escort.lk,k:'g'}]:[];
  const sx=fbMainSX(),useT=G.fbo.apm&&(!G.fbo.bus||Math.random()<0.65);
  a.steps=[G_(p.x,GH*CELL+2.5),G_(sx+30,GH*CELL+2.5)];
  if(useT)a.steps.push(G_(sx+16,GH*CELL+2.5),G_(sx+16,262),G_(sx+16,262,FB.gy),G_(sx+16,256,FB.gy),G_(sx+R(-14,10),254+R(-1.5,1.5),FB.gy),F_(q=>{q.waitT='A';}),U_(q=>q.onT,null,Math.PI/2));
  else{const k=G.fa.filter(q=>q.waitBus==='M').length;a.steps.push(G_(sx-6-(k%8)*3.2,GH*CELL+3+Math.floor(k/8)*3),F_(q=>{q.waitBus='M';}),U_(q=>q.onBus,null,Math.PI/2));}
  a.steps.push(F_(q=>{q.wantJet=Math.random()<0.45;q.wantHeli=!q.wantJet&&G.fbo.heli;}));
  a.steps.push(F_(q=>{const S=q.viaT?[G_(350,-692,FB.gy),G_(392,-670,FB.gy),G_(392,-670,0),G_(430,-656)]:[G_(600,-690),G_(600,-670)];q.steps.unshift(...S,F_(fbLounge));}));
  finishPax(p,Math.max(score(p),92));earn('Aviación ejecutiva',p.vip?260:120);return true;}
/* tren ligero: va y vuelve entre las dos estaciones */
let FBGW=null,FBGWK='';
function fbGuide(){const sx=fbMainSX(),k=sx+'';if(FBGWK===k&&FBGW)return FBGW;FBGWK=k;
  const raw=[[sx,247],[FB.gw,247],[FB.gw,FB.stn[1]],[FB.stn[0],FB.stn[1]]];FBGW=fbRound(raw,34);return FBGW;}
function fbRound(pts,r){const out=[pts[0]];for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1];const d1=Math.hypot(b[0]-a[0],b[1]-a[1]),d2=Math.hypot(c[0]-b[0],c[1]-b[1]);const rr=Math.min(r,d1/2,d2/2);
    const p1=[b[0]+(a[0]-b[0])/d1*rr,b[1]+(a[1]-b[1])/d1*rr],p2=[b[0]+(c[0]-b[0])/d2*rr,b[1]+(c[1]-b[1])/d2*rr];for(let k=0;k<=8;k++){const t=k/8,u=1-t;out.push([u*u*p1[0]+2*u*t*b[0]+t*t*p2[0],u*u*p1[1]+2*u*t*b[1]+t*t*p2[1]]);}}
  out.push(pts[pts.length-1]);const L=[0];for(let i=1;i<out.length;i++)L.push(L[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));return{p:out,L,len:L[L.length-1]};}
function fbAt(path,s){s=clamp(s,0,path.len);let i=1;while(i<path.L.length-1&&path.L[i]<s)i++;const a=path.p[i-1],b=path.p[i],seg=path.L[i]-path.L[i-1]||1,t=(s-path.L[i-1])/seg;return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[1]-a[1],b[0]-a[0])];}
function updTrain(dt,dtg){const T=G.fbT,P=fbGuide();
  if(T.st==='A'||T.st==='B'){T.t+=dtg;T.u=T.st==='A'?0:P.len;
    const here=T.st;// suben los que esperan en esta estación; bajan los que llegaron
    if(T.t>1.2)for(const a of G.fa)if(a.waitT===here&&!a.onT&&!a.gone&&T.pax.length<24){a.onT=1;a.hidden=true;a.viaT=1;T.pax.push(a);a.waitT=null;}
    if(T.t>=6){T.st=here==='A'?'AB':'BA';T.t=0;}}
  else{const dir=T.st==='AB'?1:-1,sp=58*dt;T.u+=dir*sp;if(T.u>=P.len||T.u<=0){T.u=clamp(T.u,0,P.len);const arr=T.st==='AB'?'B':'A';T.st=arr;T.t=0;
      if(arr==='B'){for(const a of T.pax){const q=fbAt(P,P.len-R(4,22));a.x=q[0];a.z=q[1]+6+R(-1.5,1.5);a.el=FB.gy;a.hidden=false;}T.pax.length=0;}}}}
/* ---- shuttle por la vía perimetral ---- */
let FBBUS=null,FBBUSK='';
function fbBusPath(){const sx=fbMainSX(),k=sx+'';if(FBBUS&&FBBUSK===k)return FBBUS;FBBUSK=k;
  const raw=[[486,-702],[520,-712],[700,-712],[712,-724],[712,-776],[700,-788],[640,-794],...ringArc(-0.1,-2.95),[560,-797],[-200,-797],[-226,-776],[-226,312],[-206,303],[sx-34,303],[sx-8,314],[sx-40,328.5],[-200,328.5],[-214,316],[-214,-772],[-196,-788],[440,-788],[458,-772],[458,-726],[470,-712],[486,-702]];
  FBBUS=fbRound(raw,14);const P=FBBUS;let bm=0,bd=1e9;P.p.forEach((q,i)=>{const d=Math.hypot(q[0]-(sx-34),q[1]-303);if(d<bd){bd=d;bm=i;}});P.stopM=P.L[bm];P.stopF=0;return P;}
function updBuses(dt,dtg){if(!G.fbo.bus)return;const P=fbBusPath();
  for(let k=0;k<2;k++){let b=G.fv.find(v=>v.type==='bus'&&v.k===k);if(!b){b=fbCar('bus',{k,u:k?P.len*0.5:1,st:'run',c:'#1b2a3a',pax:[]});}
    if(b.st==='stop'){b.t+=dtg;const atM=Math.abs(b.u-P.stopM)<30;
      if(atM&&b.t>1)for(const a of G.fa)if(a.waitBus==='M'&&!a.onBus&&!a.gone&&b.pax.length<20){a.onBus=1;a.hidden=true;a.waitBus=null;b.pax.push(a);}
      if(!atM&&b.t>0.8&&b.pax.length){for(const a of b.pax){a.x=486+R(-8,8);a.z=-697+R(-1.5,1.5);a.hidden=false;a.el=0;}b.pax.length=0;}
      if(b.t>=4){b.st='run';b.u+=1;}continue;}
    const nx=b.u<P.stopM?P.stopM:P.len-0.5,dist=Math.max(0,nx-b.u);let tgt=Math.min(34,Math.sqrt(2*DRV.brk*0.7*dist)+0.6);
    const ld=drvLeader(b,G.fv.concat(G.veh));if(ld&&ld.d<4+b.sp*1.1)tgt=Math.min(tgt,Math.max(0,(ld.d-3)/1.1));
    const pv=b.sp||0;b.sp=tgt>pv?Math.min(tgt,pv+DRV.acc*0.8*dt):Math.max(tgt,pv-DRV.brk*dt);b.acc=(b.sp-pv)/Math.max(dt,1e-4);
    const prev=b.u;b.u+=b.sp*dt;if(b.u>=P.len)b.u-=P.len;
    for(const s of [P.stopM,P.len-0.5]){if(prev<s&&b.u>=s){b.u=s>=P.len-1?0.01:s;b.st='stop';b.t=0;b.sp=0;}}
    const q=fbAt(P,b.u);b.x=q[0];b.z=q[1];b.hdg=lerpAng(b.hdg||q[2],q[2],Math.min(1,dt*6));}}
/* ---- camionetas de protocolo por la plataforma de enlace ---- */
function fbVanFor(f,pl){if(!G.fbo.on||!G.fbo.link||!f.stand||f.stand.bridge)return;if(G.fv.filter(v=>v.type==='van').length>=3)return;
  const s=pl.x>=f.stand.cx?1:-1,dd=door(pl),L=pl.T.len*PSCALE,S=pl.T.span*PSCALE,ds=dd[0]>pl.x?1:-1;const ox=pl.x+ds*(S/2+12),pz=dd[1]+9,px=dd[0]+ds*11;
  if(Math.random()<0.35)return;const v=fbCar('van',{x:400,z:-606,hdg:Math.PI,c:'#111316',fl:f,pt:[px,pz],ox,st:'go',t:0,grp:[]});
  v.path=[[380,-560],[180,-474],[100,-474],[FB.lnk+30,-470],[FB.lnk+16,-440],[FB.lnk+16,-20],[FB.lnk+30,-8],[-60,-8],[ox,-8],[ox,pz],[px+ds*2,pz]];f.van=v;}
function fbVanPax(p){const f=p.f,v=f&&f.van;if(!v||v.gone||v.st==='back'||!(p.vip||Math.random()<0.05))return false;
  const a=fbAgent({role:rolePick(),lk:p.lk,name:p.name,x:p.x,z:p.z,hdg:p.hdg,spd:p.spd});a.ent=p.escort?[{lk:p.escort.lk,k:'g'}]:[];
  a.steps=[G_(v.pt[0]+R(-2,2),v.pt[1]-4),U_(q=>v.st!=='go',null,Math.PI/2),F_(q=>{if(v.st!=='wait'){q.gone=true;return;}q.hidden=true;v.grp.push(q);}),U_(()=>false)];
  finishPax(p,96);earn('Aviación ejecutiva',420);return true;}
function updVan(v,dt,dtg){const blocked=()=>G.planes.some(q=>q.alt<3&&q.state!=='parked'&&Math.hypot(q.x-v.x,q.z-v.z)<70)||G.pj.some(j=>j.alt<3&&j.st!=='park'&&Math.hypot(j.x-v.x,j.z-v.z)<50);
  if(v.st==='go'||v.st==='back'){if(blocked()){v.blk=(v.blk||0)+dt;if(v.blk<6)return;}else v.blk=0;
    if(drvStep(v,dt,26,G.fv,v.st==='go')){if(v.st==='go'){v.st='wait';v.t=0;}else{for(const a of v.grp){a.hidden=false;a.x=402;a.z=-600;a.steps=[G_(404,-616),G_(430,-632),F_(q=>{q.wantHeli=G.fbo.heli&&Math.random()<0.4;q.wantJet=!q.wantHeli;q.steps.unshift(F_(fbLounge));})];}v.grp=[];v.gone=true;}}return;}
  if(v.st==='wait'){v.t+=dtg;const f=v.fl;const more=f&&f.plane&&f.plane.state==='parked'&&!f.arrDone;if(v.t>(more?30:3)&&!G.fa.some(a=>a.steps[0]&&a.steps[0].u&&!a.hidden&&Math.hypot(a.x-v.x,a.z-v.z)<26)){v.st='back';
      v.path=[[v.ox,v.pt[1]],[v.ox,-8],[-60,-8],[FB.lnk+30,-8],[FB.lnk+16,-20],[FB.lnk+16,-440],[FB.lnk+30,-470],[100,-474],[180,-474],[380,-560],[402,-604]];}}}
function fbDrive(v,dt,spd){let rem=spd*dt;while(rem>0&&v.path.length){const t=v.path[0],dx=t[0]-v.x,dz=t[1]-v.z,d=Math.hypot(dx,dz);if(d>0.05)v.hdg=lerpAng(v.hdg,Math.atan2(dz,dx),Math.min(1,dt*6));
    if(d<=rem){v.x=t[0];v.z=t[1];rem-=d;v.path.shift();}else{v.x+=dx/d*rem;v.z+=dz/d*rem;rem=0;}}return!v.path.length;}
function updCar(v,dt,dtg){
  if(v.st==='drive'){if(drvStep(v,dt,32,G.fv,true)){v.st='stop';v.t=0;v.sp=0;for(const a of v.grp){a.car=null;a.hidden=false;a.x=v.x+R(-3,3);a.z=-696;a.el=0;}v.grp=[];}}
  else if(v.st==='stop'){v.t+=dtg;if(v.wantP){if(v.loaded||v.wantP.gone||v.t>40){v.st='out';v.path=FB_OUT(v.x);v.bay=null;}}else if(v.t>2.5){v.st='out';v.path=FB_OUT(v.x);v.bay=null;}}
  else if(v.st==='out'){if(drvStep(v,dt,34,G.fv,false)){v.gone=true;for(const a of v.grp)a.gone=true;}}}
/* ---- ciclo ---- */
function updFbo(dt,dtg){if(!G.fbo)fbInit();const F=G.fbo;if(!F.on)return;
  const dem=0.8+Math.max(0,G.star-3)*0.35+(F.cus?0.55:0)+(F.rwy?0.35:0)+(F.rwy>=2?0.3:0)+(F.twr?0.35:0)+(F.lv-1)*0.25;
  F.nj-=dtg;if(F.nj<=0){F.nj=60/dem*R(0.6,1.4);if(!jetSpawn())F.nj=6;}
  if(F.heli){F.nh-=dtg;if(F.nh<=0){F.nh=60/(0.7+dem*0.4+(F.heli>=2?0.6:0))*R(0.6,1.4);if(!heliSpawn())F.nh=8;}}
  for(const j of G.pj)updJet(j,dt);for(const h of G.hc)updHeli(h,dt,dtg);
  if(F.apm)updTrain(dt,dtg);updBuses(dt,dtg);
  for(const v of G.fv){if(v.type==='van')updVan(v,dt,dtg);else if(v.type!=='bus')updCar(v,dt,dtg);}
  for(const a of G.fa){if(a.tT&&!a.call&&G.t>a.tT&&a.steps[0]&&a.steps[0].u&&!a.tmo){a.tmo=1;fbUnseat(a);a.wantJet=a.wantHeli=false;a.steps=[G_(600,-660),G_(600,-686),F_(q=>q.steps.unshift(...fbPickup(q)))];}
    fbUpdA(a,dt,dtg);}
  if(F.hang){F.hT=(F.hT||0)+dtg;if(F.hT>60){F.hT=0;earn('Aviación ejecutiva',Math.round(F.hang*380*(F.mro?2:1)));}}
  if(G.pj.some(j=>j.gone))G.pj=G.pj.filter(j=>!j.gone);if(G.hc.some(h=>h.gone))G.hc=G.hc.filter(h=>!h.gone);
  if(G.fa.some(a=>a.gone)){G.fa.forEach(a=>{if(a.gone)fbUnseat(a);});G.fa=G.fa.filter(a=>!a.gone);}if(G.fv.some(v=>v.gone))G.fv=G.fv.filter(v=>!v.gone);}
