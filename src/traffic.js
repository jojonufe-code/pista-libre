
/* ================= CONDUCCIÓN REALISTA: curvas suaves, aceleración, frenado y distancia ================= */
const DRV={acc:10,brk:18,lat:24};
const VLEN={car:16,taxi:16,bus:40,rent:16,limo:30,suv:18,van:20};
const vlen=q=>VLEN[q.type]||16;
function drvRound(pts,r){if(pts.length<3)return pts.slice();const out=[pts[0]];
  for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1];const d1=Math.hypot(b[0]-a[0],b[1]-a[1]),d2=Math.hypot(c[0]-b[0],c[1]-b[1]);
    const t1=Math.atan2(b[1]-a[1],b[0]-a[0]),t2=Math.atan2(c[1]-b[1],c[0]-b[0]);const dd=Math.abs(((t2-t1+Math.PI*3)%(Math.PI*2))-Math.PI);
    if(dd<0.06||d1<0.5||d2<0.5){out.push(b);continue;}const rr=Math.min(r,d1*0.45,d2*0.45);
    const p1=[b[0]+(a[0]-b[0])/d1*rr,b[1]+(a[1]-b[1])/d1*rr],p2=[b[0]+(c[0]-b[0])/d2*rr,b[1]+(c[1]-b[1])/d2*rr];const n=Math.max(3,Math.ceil(dd*7));
    for(let k=0;k<=n;k++){const t=k/n,u=1-t;out.push([u*u*p1[0]+2*u*t*b[0]+t*t*p2[0],u*u*p1[1]+2*u*t*b[1]+t*t*p2[1]]);}}
  out.push(pts[pts.length-1]);return out;}
function drvKey(v){const p=v.path;if(!p.length)return'0';const a=p[0],b=p[p.length-1];return p.length+'|'+a[0].toFixed(2)+','+a[1].toFixed(2)+'|'+b[0].toFixed(2)+','+b[1].toFixed(2);}
function drvBuild(v,stop){const raw=[[v.x,v.z]].concat(v.path);const pts=[raw[0]];for(let i=1;i<raw.length;i++){const q=pts[pts.length-1];if(Math.hypot(raw[i][0]-q[0],raw[i][1]-q[1])>0.25)pts.push(raw[i]);}
  if(pts.length<2)pts.push([v.x+Math.cos(v.hdg)*0.5,v.z+Math.sin(v.hdg)*0.5]);
  // si el primer tramo va hacia atrás, el vehículo no gira en seco: lo dejamos arrancar recto
  const P=drvRound(pts,v.rr||9),n=P.length,L=new Float32Array(n);for(let i=1;i<n;i++)L[i]=L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
  const lim=new Float32Array(n);for(let i=0;i<n;i++){if(i===0||i===n-1){lim[i]=1e3;continue;}const t1=Math.atan2(P[i][1]-P[i-1][1],P[i][0]-P[i-1][0]),t2=Math.atan2(P[i+1][1]-P[i][1],P[i+1][0]-P[i][0]);
    const dd=Math.abs(((t2-t1+Math.PI*3)%(Math.PI*2))-Math.PI),ds=Math.max(0.3,(L[i+1]-L[i-1])/2),k=dd/ds;lim[i]=k>1e-4?Math.max(5,Math.sqrt(DRV.lat/k)):1e3;}
  if(stop)lim[n-1]=0;for(let i=n-2;i>=0;i--)lim[i]=Math.min(lim[i],Math.sqrt(lim[i+1]*lim[i+1]+2*DRV.brk*(L[i+1]-L[i])));
  v.dr={P,L,lim,len:L[n-1],s:0,i:1,key:drvKey(v),stop};}
function drvLeader(v,list){const c=Math.cos(v.hdg),s=Math.sin(v.hdg);let best=null;
  for(const q of list){if(q===v||q.gone||q.state==='park')continue;const dx=q.x-v.x,dz=q.z-v.z,fw=dx*c+dz*s;if(fw<=2||fw>60)continue;
    if(Math.abs(-dx*s+dz*c)>3.8)continue;if(Math.cos((q.hdg||0)-v.hdg)<0.2)continue;const d=fw-(vlen(v)+vlen(q))/2;if(!best||d<best.d)best={q,d};}return best;}
function drvStep(v,dt,vmax,list,stop){if(!v.path.length)return true;if(!v.dr||v.dr.key!==drvKey(v)||v.dr.stop!==!!stop)drvBuild(v,!!stop);
  const D=v.dr;if(v.sp==null)v.sp=0;let i=D.i;while(i<D.L.length-1&&D.L[i]<=D.s)i++;D.i=i;
  let tgt=Math.min(vmax,Math.sqrt(D.lim[i]*D.lim[i]+2*DRV.brk*Math.max(0,D.L[i]-D.s)));
  if(list){const ld=drvLeader(v,list);if(ld){const need=3.5+v.sp*1.05;if(ld.d<-1.5)tgt=Math.min(tgt,Math.max((ld.q.sp||0)*0.85,4));else if(ld.d<need)tgt=Math.min(tgt,Math.max(0,(ld.d-3)/1.05));}}
  if(tgt<0.5&&!(stop&&D.len-D.s<1)){v.wt=(v.wt||0)+dt;if(v.wt>7)tgt=Math.max(tgt,5);}else v.wt=0;
  const prev=v.sp;v.sp=tgt>v.sp?Math.min(tgt,v.sp+DRV.acc*dt):Math.max(tgt,v.sp-DRV.brk*1.5*dt);v.acc=(v.sp-prev)/Math.max(dt,1e-4);
  D.s=Math.min(D.len,D.s+v.sp*dt);while(i<D.L.length-1&&D.L[i]<D.s)i++;D.i=i;
  const a=D.P[i-1],b=D.P[i],sl=D.L[i]-D.L[i-1]||1,t=clamp((D.s-D.L[i-1])/sl,0,1);v.x=a[0]+(b[0]-a[0])*t;v.z=a[1]+(b[1]-a[1])*t;
  const h=Math.atan2(b[1]-a[1],b[0]-a[0]),h0=v.hdg;v.hdg=lerpAng(v.hdg,h,Math.min(1,dt*Math.max(4,v.sp*0.45)));v.yr=(((v.hdg-h0+Math.PI*3)%(Math.PI*2))-Math.PI)/Math.max(dt,1e-4);
  // giro próximo (para las direccionales)
  let turn=0;for(let k=i;k<D.P.length-1&&D.L[k]-D.s<30;k++){const q1=D.P[k],q2=D.P[k+1];const hh=Math.atan2(q2[1]-q1[1],q2[0]-q1[0]);const dd=(((hh-v.hdg+Math.PI*3)%(Math.PI*2))-Math.PI);if(Math.abs(dd)>Math.abs(turn))turn=dd;}v.turn=Math.abs(turn)>0.5?Math.sign(turn):0;
  if(D.s>=D.len-0.05){v.path.length=0;v.dr=null;if(stop)v.sp=0;v.turn=0;return true;}return false;}

/* ================= TRÁFICO DE ACCESO: taxis, buses, carros y estacionamiento ================= */
const ROAD={side:()=>GH*CELL+4,curb:()=>GH*CELL+15,thru:()=>GH*CELL+30,west:()=>GH*CELL+40.5,get x0(){return G.lot.x0*CELL-170;},get x1(){return (G.lot.x1+1)*CELL+170;}};
const VSPEC={car:{len:16,spd:42},taxi:{len:16,spd:44},bus:{len:40,spd:32},rent:{len:16,spd:40}};
const CARC=['#c0392b','#ecf0f1','#2c3e50','#7f8c8d','#16a085','#d35400','#1f1f1f','#2f6db5','#8e44ad','#b9bec3','#e9e4d8','#3d4a3a'];
/* entrada desde la avenida oeste y salida por la avenida este (carriles con sentido) */
const RIN={x:-214,z:GH*CELL+150},ROUT={x:1214,z:GH*CELL+140};
const entryPath=()=>[[RIN.x,ROAD.thru()+26],[RIN.x+22,ROAD.thru()],[-150,ROAD.thru()]];
const exitPath=(x)=>[[Math.max(x+30,1150),ROAD.thru()],[ROUT.x,ROAD.thru()+22],[ROUT.x,ROUT.z]];
function bays(){const d0=G.tx0*CELL,dm=(G.tmid+1)*CELL,a1=(G.tx1+1)*CELL,L0=G.lot.x0*CELL+30,L1=(G.lot.x1+1)*CELL-30;
  const depBus=d0+26,arrBus=a1-26,dep=[],arr=[];for(let x=dm-12;x>L0;x-=18)if(Math.abs(x-depBus)>34)dep.push(x);for(let x=dm+12;x<L1;x+=18)if(Math.abs(x-arrBus)>34)arr.push(x);
  return{dep,arr,depBus,arrBus};}
function bayUsed(x){return G.veh.some(v=>v.bay===x&&!v.gone);}
function freeBay(list,near,minX){let best=null,bd=1e9;for(const x of list){if(bayUsed(x)||(minX!=null&&x<minX))continue;const d=Math.abs(x-(near??x));if(d<bd){bd=d;best=x;}}return best;}
function mkVeh(type,o){const v=Object.assign({id:G.seq++,type,x:RIN.x,z:RIN.z,hdg:-Math.PI/2,spd:VSPEC[type].spd,state:'drive',path:entryPath(),wait:0,pax:[],c:type==='taxi'?'#f2b705':type==='bus'?'#e9edf0':pick(CARC),body:Math.floor(Math.random()*4)},o||{});
  if(v.x===RIN.x&&v.z===RIN.z){entryZ(v);if(v.sp==null)v.sp=v.spd*0.7;}
  if(v.sp==null)v.sp=0;G.veh.push(v);return v;}
function entryZ(v){let zm=-1e9;for(const q of G.veh)if(q!==v&&Math.abs(q.x-RIN.x)<5&&q.z>GH*CELL+20)zm=Math.max(zm,q.z);v.x=RIN.x;v.z=RIN.z;if(zm>RIN.z-vlen(v)-8)v.z=zm+vlen(v)/2+14;}
function routeToBay(v,x){const L=ROAD.curb(),T=ROAD.thru();v.bay=x;v.path=[[x-40,T],[x-12,L],[x,L]];}
function routeAway(v){const L=ROAD.curb(),T=ROAD.thru();v.bay=null;v.path=[[v.x+9,L+1],[v.x+34,T]].concat(exitPath(v.x+34));v.state='drive';v.leaving=true;}
function aroundBlock(v,after){v.path=exitPath(v.x);v.ab=after;v.bay=null;}
/* ---- salidas: alguien llega en carro, taxi o bus ---- */
function spawnDep(f){if(G.veh.length>46){dropDep(f,null);return;}
  const r=Math.random(),mode=r<0.22?'bus':r<0.58?'taxi':'car';
  if(mode==='bus'){G.busQ.dep.push(f);return;}
  const B=bays();const near=G.entries.length?ccx(pick(G.entries)):B.dep[0];const v=mkVeh(mode,{pax:[f],drop:true});v.want=near;}
function dropDep(f,v){if(!G.entries.length){f.live--;f.missed++;G.stats.missed++;return;}
  if(!['sched','inbound','parked'].includes(f.state)){f.live--;f.missed++;G.stats.missed++;return;}
  const vx=v?v.x:R(40,GW*CELL-40);let e=G.entries[0],bd=1e9;for(const c of G.entries){const d=Math.abs(ccx(c)-vx);if(d<bd){bd=d;e=c;}}
  const p=makeDepPax(f,vx+R(-3,3),v?ROAD.curb()-5:ROAD.side(),e);p.hdg=-Math.PI/2;
  if(v){p.mode='line';p.lt=[vx+R(-4,4),ROAD.side()-1];p.lcb=()=>enterTerminal(p,e);if(v.type!=='bus')p.fromCar=v.type;}}
/* ---- llegadas: los recogen en la acera de llegadas ---- */
function curbArrival(p){const B=bays();
  const lots=G.objs.filter(o=>o.def.land&&o.cars&&o.cars.some(c=>c&&c.state==='park'));
  const r=Math.random();
  if((p.rental||r<0.18)&&lots.length){const o=pick(lots);const i=o.cars.findIndex(c=>c&&c.state==='park'&&!c.claimed);if(i>=0){const car=o.cars[i];car.claimed=p;const sp=o.spotPos[i];
      p.mode='line';p.lt=[p.x,ROAD.side()];p.lcb=()=>{line(p,[o.cx+R(-3,3),ROAD.side()+1],()=>line(p,[o.cx+R(-2,2),ROAD.west()+9],()=>line(p,[sp.x,sp.z+(sp.h>0?-8:8)],()=>{carLeave(o,i);finishPax(p,score(p));})));};return;}}
  const mode=r<0.4?'bus':r<0.72?'taxi':'car';
  if(mode==='bus'||G.veh.length>46){const sp=grabPt(p,G.busH||(G.busH={}),()=>{const P=[];for(let r=0;r<4;r++)for(let k=-5;k<=5;k++)P.push([B.arrBus+k*3+(r%2)*1.5,ROAD.side()-1.2-r*3]);return P;});p.mode='line';p.lt=sp||[B.arrBus+R(-14,14),ROAD.side()-R(0,3)];p.lcb=()=>{p.mode='curbwait';p.cw=0;p.hdg=Math.PI/2;G.busQ.arr.push(p);};return;}
  const x=freeBay(B.arr,p.x);const tx=x??(B.arr[0]??p.x);p.mode='line';p.lt=[tx+R(-3,3),ROAD.side()-R(0,2)];
  p.lcb=()=>{p.mode='curbwait';p.cw=0;p.hdg=Math.PI/2;const v=mkVeh(mode,{pick:p});v.want=tx;};}
/* ---- estacionamiento ---- */
function freeSpot(){for(const o of G.objs){if(!o.def.land)continue;const i=o.cars.findIndex(c=>!c);if(i>=0)return{o,i};}return null;}
function lotPts(o,i){const sp=o.spotPos[i],ex=o.cx,top=o.gy*CELL,aisle=o.cz;return[[ex-30,ROAD.thru()],[ex-6,ROAD.west()],[ex,top+6],[ex,aisle],[sp.x+(sp.x>ex?-8:8),aisle],[sp.x,sp.z]];}
function lotRoute(v,o,i){v.state='drive';v.toPark={o,i};v.want=undefined;v.spd=22;v.rr=6;
  if(o.cx-30<v.x+50){v.path=[[v.x+9,ROAD.curb()+1],[v.x+34,ROAD.thru()]].concat(exitPath(v.x+34));v.ab='lot';}else v.path=[[v.x+9,ROAD.curb()+1],[v.x+34,ROAD.thru()]].concat(lotPts(o,i));}
function carLeave(o,i){const car=o.cars[i];if(!car)return;o.cars[i]=null;const sp=o.spotPos[i];
  const v=mkVeh('car',{x:sp.x,z:sp.z,hdg:sp.h,c:car.c,spd:30,leaving:true,sp:0,rr:6});v.lv=sp.lv;v.path=[[sp.x,sp.z+(sp.h>0?-6:6)],[sp.x,o.cz],[o.cx+30,o.cz],[o.cx+30,o.gy*CELL+2],[o.cx+44,ROAD.west()],[o.cx+70,ROAD.thru()]].concat(exitPath(o.cx+70));}
/* ---- ciclo ---- */
function updTraffic(dt,dtg){const B=bays();
  // buses periódicos
  for(const k of ['dep','arr']){G.busT[k]-=dt;const q=G.busQ[k];if(q.length&&G.busT[k]<=0&&!G.veh.some(v=>v.type==='bus'&&v.line===k&&!v.leaving)){G.busT[k]=k==='dep'?14:12;
      const v=mkVeh('bus',{line:k});if(k==='dep'){v.pax=q.splice(0,24);v.drop=true;}v.want=k==='dep'?B.depBus:B.arrBus;}}
  const T=ROAD.thru();
  for(const v of G.veh){
    if(v.state==='drive'){
      if(!v.leaving&&!v.toPark&&!v.loop&&v.bay==null&&v.want!=null&&v.x>-160&&!v.ab){const list=v.type==='bus'?[v.want]:(v.drop?B.dep:B.arr);
        let x=null,bd=1e9;for(const bx of list){if(bx<v.x+70||bx>v.x+200||bayUsed(bx))continue;const d=Math.abs(bx-v.want)+(bx<v.want-60?60:0);if(d<bd){bd=d;x=bx;}}
        if(x!=null&&(Math.abs(x-v.want)<50||v.x>v.want-150||!list.some(bx=>bx>v.x+200&&!bayUsed(bx))))routeToBay(v,x);
        else if(!list.some(bx=>bx>=v.x+70)){v.loop=true;aroundBlock(v,'loop');}
        if(!v.path.length&&!v.loop)v.path=[[v.x+60,T]];}
      const stop=(v.bay!=null&&!v.leaving)||(!!v.toPark&&!v.ab);
      const done=drvStep(v,dt,v.spd,G.veh,stop);
      if(done){if(v.ab){// dio la vuelta a la manzana: vuelve a entrar por la avenida oeste
          const ab=v.ab;v.ab=null;entryZ(v);v.hdg=-Math.PI/2;v.sp=v.spd*0.8;v.dr=null;
          if(ab==='lot'&&v.toPark){const {o,i}=v.toPark;v.path=entryPath().concat(lotPts(o,i));}else{v.loop=false;v.path=entryPath();}continue;}
        if(v.toPark){const {o,i}=v.toPark;if(!G.objs.includes(o)||o.cars[i]!==v.slot){v.gone=true;continue;}o.cars[i]={c:v.c,state:'park',until:G.t+R(240,1500),lv:o.spotPos[i].lv};v.gone=true;earn('Estacionamiento',Math.round(5*(LVo(o).rev||1)));continue;}
        if(v.leaving){v.gone=true;continue;}
        if(v.bay!=null){v.state='stop';v.t=0;v.unloaded=0;v.sp=0;}}}
    else if(v.state==='stop'){v.t+=dt;
      if(v.drop&&v.unloaded<v.pax.length&&v.t>0.8+v.unloaded*0.45){const f=v.pax[v.unloaded++];const sx=v.x;dropDep(f,{x:sx+(v.type==='bus'?R(-14,14):R(-3,3)),type:v.type});}
      if(v.pick){const p=v.pick;if(!p.gone&&p.mode==='curbwait'){p.mode='line';p.lt=[v.x+R(-2,2),ROAD.curb()-4];p.lcb=()=>finishPax(p,score(p));v.got=true;}else if(p.gone||v.t>6)v.got=true;}
      if(v.type==='bus'&&v.line==='arr'){if(!v.boarding){v.boarding=G.busQ.arr.splice(0,30);v.boarding.forEach(p=>{if(!p.gone){dropSpot(p);p.mode='line';p.lt=[v.x+R(-12,12),ROAD.curb()-4];p.lcb=()=>finishPax(p,score(p));}});}}
      const ready=v.drop?(v.unloaded>=v.pax.length&&v.t>1.6+v.pax.length*0.45):v.type==='bus'?(v.t>5&&v.boarding.every(p=>p.gone)):(v.got&&(!v.pick||v.pick.gone)&&v.t>1.4);
      if(ready||v.t>14){if(v.type==='car'&&v.drop&&Math.random()<0.6){const sp=freeSpot();if(sp){sp.o.cars[sp.i]={c:v.c,state:'coming'};v.slot=sp.o.cars[sp.i];v.bay=null;lotRoute(v,sp.o,sp.i);continue;}}routeAway(v);}}}
  if(G.veh.some(v=>v.gone))G.veh=G.veh.filter(v=>!v.gone);
  // carros estacionados: cobro por hora y salidas
  for(const o of G.objs){if(!o.def.land)continue;let n=0;o.cars.forEach((c,i)=>{if(!c)return;if(c.state==='park'){n++;if(G.t>c.until&&!c.claimed)carLeave(o,i);}});o.occ=n;
    if(n)earn('Estacionamiento',n*3*(LVo(o).rev||1)*dtg/60);}
}
