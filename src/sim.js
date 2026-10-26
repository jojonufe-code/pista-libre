
/* ================= PISTA LIBRE · CONSTRUCTOR: SIMULACIÓN ================= */
const CELL=8,GW=112,GH=36,APR=16,NAVH=GH+1,NC=GW*NAVH,INF=1e9;
const RWY_Z=-150,RWY2_Z=-226,TWY_Z=-80,TWY2_Z=-106,HOLD_Z=-116,APP_ALT=240;
let THR_X=1000,TD_X=930,DEP_X=955,APP_X=2000,EXITS=[];
function setRunway(){const ext=G&&G.up&&G.up.ext;THR_X=ext?1240:1000;TD_X=THR_X-70;DEP_X=THR_X-45;APP_X=THR_X+1000;EXITS=[];for(let x=THR_X-260;x>40;x-=130)EXITS.push(Math.round(x));EXITS.push(-40);}
setRunway();
const PSCALE=2,TAXI=38,PAXCAP=880,MIN_PER_S=1;
const TYPES={
  ATR72:{k:'ATR72',n:'ATR 72-600',pax:40,len:27,span:27,prop:true,size:1,fee:2500},
  E190:{k:'E190',n:'Embraer 190',pax:56,len:36,span:29,size:1,fee:3500},
  A320:{k:'A320',n:'Airbus A320',pax:84,len:38,span:34,size:2,fee:6000},
  B738:{k:'B738',n:'Boeing 737-800',pax:84,len:40,span:36,size:2,fee:6000},
  B788:{k:'B788',n:'Boeing 787-8',pax:130,len:57,span:60,size:3,heavy:true,fee:14000}
};
const SIZEN=['','pequeño','mediano','grande'];
const DEF={
  floor:{n:'Suelo público',ic:'▦',cost:40,paint:1,cat:'x',d:'Hall de llegada y salida. Tiene que tocar la acera (borde inferior).'},
  sterile:{n:'Zona estéril',ic:'▩',cost:60,paint:2,cat:'x',d:'Sala de embarque: solo se entra pasando por seguridad.'},
  expW:{n:'Ampliar oeste',ic:'⬅️',cost:0,act:1,cat:'t',d:'Agrega 8 columnas a la terminal hacia el oeste.'},
  expE:{n:'Ampliar este',ic:'➡️',cost:0,act:1,cat:'t',d:'Agrega 8 columnas a la terminal hacia el este.'},
  landW:{n:'Terreno oeste',ic:'🧭',cost:0,act:1,cat:'t',d:'Compra 16 columnas de terreno hacia el oeste.'},
  landE:{n:'Terreno este',ic:'🧭',cost:0,act:1,cat:'t',d:'Compra 16 columnas de terreno hacia el este.'},
  erase:{n:'Demoler',ic:'✖',cost:0,cat:'t',d:'Toca un objeto para quitarlo. Devuelve el 50%.'},
  upRapid:{n:'Salidas rápidas',ic:'↘️',cost:60000,act:1,up:'rapid',star:2,cat:'p',d:'Calles de salida en ángulo: los aviones dejan la pista antes y aterrizan más seguido.'},
  upIls:{n:'ILS y luces',ic:'🛬',cost:45000,act:1,up:'ils',cat:'p',d:'Luces de aproximación, PAPI y localizador: menos aproximaciones frustradas.'},
  upExt:{n:'Extender pista',ic:'📏',cost:150000,act:1,up:'ext',star:3,cat:'p',d:'Pista 240 m más larga. Necesaria para el Boeing 787.'},
  upRwy2:{n:'Segunda pista',ic:'🛫',cost:260000,act:1,up:'rwy2',star:4,cat:'p',d:'Pista paralela solo para despegues: las llegadas ya no esperan a las salidas.'},
  checkin:{n:'Check-in',ic:'🧳',cost:6000,w:2,h:1,zone:1,svc:2.2,srv:1,staff:10,cat:'s',d:'Documenta maletas. Va en el hall de salidas; la fila se forma al frente.'},
  security:{n:'Seguridad',ic:'🛡️',cost:22000,w:2,h:3,zone:1,exitZone:2,svc:1.6,srv:1,staff:25,cat:'s',d:'Frente al hall de salidas, espalda a la sala estéril. Es la única forma de pasar.'},
  migration:{n:'Migración',ic:'🛂',cost:15000,w:1,h:2,zone:2,svc:1.5,srv:1,staff:18,star:3,cat:'s',d:'Zona estéril. Obligatoria para vuelos internacionales.'},
  claim:{n:'Recogida',ic:'🛄',cost:14000,w:4,h:2,zone:2,exitZone:3,back:true,staff:6,cat:'s',d:'Espalda en la sala estéril, frente al hall de llegadas (verde). Por aquí salen los que llegan.'},
  pasillo:{n:'Pasillo de llegadas',ic:'🚶',cost:18000,w:1,h:3,zone:2,fix:1,facade:1,cat:'s',d:'Corredor de vidrio elevado junto a la fachada. Los que llegan suben al lado de su avión, cruzan por arriba sin mezclarse con las salidas y bajan por esta escalera mecánica. Va pegado a la plataforma.'},
  customs:{n:'Aduana',ic:'🛃',cost:16000,w:2,h:1,zone:3,svc:1.3,srv:1,staff:15,star:3,cat:'s',d:'Hall de llegadas. Revisa a quienes llegan de vuelos internacionales.'},
  gate:{n:'Puerta',ic:'🚪',cost:8000,w:1,h:1,zone:2,svc:0.3,srv:2,staff:12,cat:'g',d:'Zona estéril. Se enlaza sola con el puesto de avión más cercano.'},
  bench:{n:'Asientos',ic:'💺',cost:900,w:2,h:1,zone:0,seats:4,cat:'g',d:'4 plazas. Esperar de pie baja la satisfacción.'},
  wc:{n:'Baños',ic:'🚻',cost:7000,w:2,h:2,zone:0,svc:3,srv:3,staff:4,cat:'g',d:'Sin baños cerca, la satisfacción cae.'},
  food:{n:'Cafetería',ic:'☕',cost:12000,w:2,h:2,zone:0,svc:2.2,srv:2,rev:9,cat:'c',d:'Vende a quien tiene tiempo antes de embarcar.'},
  shop:{n:'Tienda',ic:'🛍️',cost:16000,w:2,h:2,zone:0,svc:2.6,srv:2,rev:15,star:2,cat:'c',d:'Más ingresos por pasajero en la sala.'},
  news:{n:'Kiosko',ic:'📰',cost:4000,w:1,h:1,zone:0,svc:1.2,srv:1,rev:5,cat:'c',d:'Revistas, snacks y agua. Funciona en cualquier zona.'},
  pharmacy:{n:'Farmacia',ic:'💊',cost:9000,w:2,h:2,zone:0,svc:1.8,srv:2,rev:9,cat:'c',d:'Ventas en hall o sala.'},
  wrap:{n:'Envoltura',ic:'🎁',cost:7000,w:2,h:1,zone:1,svc:2.6,srv:1,rev:10,staff:4,cat:'c',d:'Hall de salidas. Envuelven maletas en plástico antes del check-in.'},
  porter:{n:'Maleteros',ic:'🛒',cost:6000,w:1,h:1,zone:0,staff:8,porters:3,cat:'c',d:'Cargan maletas en carrito. Ponlos en el hall de salidas o en el de llegadas.'},
  exchange:{n:'Casa de cambio',ic:'💱',cost:10000,w:2,h:1,zone:3,svc:1.6,srv:1,rev:12,star:3,cat:'c',d:'Hall de llegadas. La usan quienes llegan de vuelos internacionales.'},
  rental:{n:'Alquiler de autos',ic:'🚗',cost:14000,w:2,h:1,zone:3,svc:2.2,srv:2,rev:25,star:2,cat:'c',d:'Hall de llegadas. Renta autos a quienes llegan.'},
  protocol:{n:'Protocolo VIP',ic:'🎩',cost:20000,w:2,h:1,zone:1,svc:1.4,srv:1,rev:35,staff:15,star:2,cat:'v',d:'Hall de salidas. Recibe a los VIP y los acompaña con vía rápida hasta el avión.'},
  lounge:{n:'Sala VIP',ic:'🥂',cost:45000,w:4,h:3,zone:2,seats:12,rev:30,staff:12,star:2,cat:'v',d:'Sala estéril. Los VIP y quienes pagan acceso esperan aquí su vuelo.'},
  parking:{n:'Estacionamiento',ic:'🅿️',cost:20000,w:10,h:12,land:1,spots:26,cat:'l',d:'Frente a la terminal, al otro lado de la vía. Cobra entrada y por hora.'},
  plant:{n:'Planta',ic:'🪴',cost:300,w:1,h:1,zone:0,cat:'g',d:'Mejora el ambiente de la terminal.'},
  fboBase:{n:'Aeródromo ejecutivo',ic:'🛩️',cost:380000,act:1,fbo:'on',star:3,cat:'e',d:'Abre el aeródromo privado al norte: pista ejecutiva, plataforma para 4 jets y terminal FBO de lujo con acceso por el bulevar costero.'},
  fboGo:{n:'Ver aeródromo',ic:'🔭',cost:0,act:1,cat:'e',d:'Mueve la cámara al aeródromo ejecutivo o de vuelta a la terminal principal.'},
  fboStands:{n:'Puestos de jets +2',ic:'🛬',cost:90000,act:1,fbo:'st',cat:'e',d:'Dos puestos más en la plataforma ejecutiva (hasta 8).'},
  fboHeli:{n:'Helipuerto',ic:'🚁',cost:95000,act:1,fbo:'heli',cat:'e',d:'Nivel 1: dos helipuertos con luces. Nivel 2: cuatro helipuertos y más vuelos en helicóptero.'},
  fboHangar:{n:'Hangar ejecutivo',ic:'🏗️',cost:120000,act:1,fbo:'hang',cat:'e',d:'Hangar para jets que pernoctan: cobra estacionamiento y mantenimiento (hasta 2).'},
  fboLounge:{n:'Sala FBO premium',ic:'🥂',cost:140000,act:1,fbo:'lv',cat:'e',d:'Mejora la terminal: piscina y bar (nivel 2), spa y suites (nivel 3). Más ingresos por pasajero.'},
  fboCustoms:{n:'Aduana privada',ic:'🛂',cost:70000,act:1,fbo:'cus',cat:'e',d:'Migración y aduana dentro del FBO: llegan vuelos privados internacionales con tarifa más alta.'},
  fboRwy:{n:'Mejorar pista ejecutiva',ic:'📏',cost:160000,act:1,fbo:'rwy',cat:'e',d:'Nivel 1: 240 m más (Global 7500). Nivel 2: ILS, luces de aproximación, eje y PAPI (más tráfico). Nivel 3: pista ancha ranurada para el Boeing Business Jet.'},
  fboTower:{n:'Torre de control FBO',ic:'🗼',cost:85000,act:1,fbo:'twr',cat:'e',d:'Torre propia para la pista ejecutiva: entran más vuelos privados por hora.'},
  fboFuel:{n:'Depósito de combustible',ic:'⛽',cost:75000,act:1,fbo:'fuel',cat:'e',d:'Tanques propios de Jet A-1: el servicio en plataforma deja 40% más.'},
  fboCater:{n:'Catering gourmet',ic:'🍽️',cost:60000,act:1,fbo:'cat',cat:'e',d:'Cocina propia: todos los jets reciben catering y la sala deja 30% más.'},
  fboMro:{n:'Centro de mantenimiento',ic:'🔧',cost:150000,act:1,fbo:'mro',cat:'e',d:'Taller para jets privados: los hangares facturan el doble.'},
  fboPark:{n:'Estacionamiento VIP',ic:'🅿️',cost:55000,act:1,fbo:'park',cat:'e',d:'Edificio de dos pisos con valet: cobra a cada limusina y camioneta que llega.'},
  fboLink:{n:'Plataforma de enlace',ic:'🛣️',cost:110000,act:1,fbo:'link',cat:'e',d:'Rodaje que rodea la cabecera: camionetas de protocolo buscan a los VIP al pie del avión comercial y los llevan al FBO.'},
  fboApm:{n:'Tren y pasarelas',ic:'🚝',cost:220000,act:1,fbo:'apm',cat:'e',d:'Tren elevado entre la terminal principal y la ejecutiva, con estaciones y pasarelas de vidrio.'},
  fboBus:{n:'Shuttle ejecutivo',ic:'🚌',cost:45000,act:1,fbo:'bus',cat:'e',d:'Autobuses por la vía perimetral entre las dos terminales.'},
  standS:{n:'Puesto S',ic:'🛩️',cost:25000,w:9,h:12,apron:1,size:1,cat:'a',d:'Puesto pequeño: ATR 72 y Embraer 190.'},
  standM:{n:'Puesto M',ic:'✈️',cost:60000,w:11,h:14,apron:1,size:2,star:2,cat:'a',d:'Puesto mediano: hasta A320 y 737.'},
  standL:{n:'Puesto L',ic:'✈️',cost:120000,w:16,h:16,apron:1,size:3,star:4,cat:'a',d:'Puesto grande: hasta Boeing 787.'}
};
const CATS=[{k:'t',n:'Terminal'},{k:'s',n:'Procesos'},{k:'g',n:'Sala'},{k:'c',n:'Comercios'},{k:'v',n:'VIP'},{k:'a',n:'Plataforma'},{k:'l',n:'Accesos'},{k:'p',n:'Pista'},{k:'e',n:'Ejecutiva'}];
/* niveles de mejora por tipo de edificio */
const LV={
  checkin:[null,{n:'Mostrador'},{n:'Dos agentes',srv:2,cost:5000},{n:'Autoentrega de maletas',srv:2,svc:0.6,cost:9000}],
  security:[null,{n:'Arco y rayos X'},{n:'Escáner CT',svc:0.65,cost:18000},{n:'Carril automático',svc:0.45,cost:26000}],
  migration:[null,{n:'Cabina'},{n:'E-gates biométricos',svc:0.5,cost:14000}],
  claim:[null,{n:'Cinta'},{n:'Cinta rápida',bag:-8,cost:12000}],
  gate:[null,{n:'Mostrador'},{n:'Embarque por grupos',svc:0.6,srv:3,cost:7000}],
  wc:[null,{n:'Baños'},{n:'Baños ampliados',srv:5,cost:6000}],
  food:[null,{n:'Cafetería'},{n:'Restaurante',srv:3,rev:1.6,cost:10000},{n:'Patio gourmet',srv:4,rev:2.2,cost:16000}],
  pasillo:[null,{n:'Escalera mecánica'},{n:'Andén móvil',walk:1.8,cost:12000}],
  customs:[null,{n:'Aduana'},{n:'Escáner de equipaje',svc:0.55,cost:14000}],
  lounge:[null,{n:'Sala VIP'},{n:'Sala ampliada',seats:20,rev:1.4,cost:30000},{n:'Sala premium con spa',seats:30,rev:2,cost:55000}],
  parking:[null,{n:'Abierto'},{n:'Techado y cobro automático',rev:1.4,cost:15000},{n:'Edificio de 2 pisos',spots:2,rev:1.6,cost:45000}],
  protocol:[null,{n:'Protocolo'},{n:'Protocolo con valet',svc:0.6,rev:1.5,cost:15000}],
  porter:[null,{n:'3 maleteros'},{n:'6 maleteros',porters:6,cost:6000}],
  news:[null,{n:'Kiosko'},{n:'Tienda de conveniencia',srv:2,rev:1.8,cost:5000}],
  shop:[null,{n:'Tienda'},{n:'Duty free premium',srv:3,rev:1.6,cost:14000},{n:'Boutiques',srv:4,rev:2.3,cost:22000}]
};
const STAND_NEXT={standS:'standM',standM:'standL'};
const LVo=o=>(LV[o.k]&&LV[o.k][o.lv||1])||{};
const seatsOf=o=>LVo(o).seats||o.def.seats||0,spotsOf=o=>(o.def.spots||0)*(LVo(o).spots||1),portersOf=o=>LVo(o).porters||o.def.porters||0;
const srvOf=o=>LVo(o).srv||o.def.srv||1, svcOf=o=>(o.def.svc||1)*(LVo(o).svc||1), revOf=o=>Math.round((o.def.rev||0)*(LVo(o).rev||1)), staffOf=o=>(o.def.staff||0)*(1+0.5*((o.lv||1)-1));
const STARS=[{n:'Terreno'},{n:'Aeródromo regional',pax:0,rat:0},{n:'Aeropuerto regional',pax:600,rat:55},{n:'Aeropuerto nacional',pax:2500,rat:60},{n:'Aeropuerto internacional',pax:7000,rat:65},{n:'Hub continental',pax:16000,rat:70}];
const UNLOCK=['','','Puesto M, A320 y 737, tiendas, salidas rápidas','Migración, vuelos internacionales, extender pista','Puesto L, Boeing 787 y segunda pista','Categoría máxima'];
const STAFFC={checkin:'#24476b',security:'#1e2b45',migration:'#4b5a32',gate:'#2a4d6e',food:'#f4f1ea',shop:'#7b4fb0',claim:'#3a4650',wc:'#5a7a8a'};

const cidx=(x,y)=>y*GW+x;
const ccx=i=>(i%GW+0.5)*CELL, ccz=i=>(Math.floor(i/GW)+0.5)*CELL;
function cellAt(x,z){const gx=Math.floor(x/CELL),gy=Math.floor(z/CELL);if(gx<0||gy<0||gx>=GW||gy>=NAVH)return -1;return gy*GW+gx;}
const ZN={1:'el hall de salidas',2:'la sala estéril',3:'el hall de llegadas'};
function walkable(i,z){return i>=0&&(G.floor[i]===z||(i>=GH*GW&&i<NAVH*GW))&&G.cobj[i]===0;}
const objById=id=>G.objs.find(o=>o.id===id);

function newGame(){
  const snd=G?G.sound:false;
  G={t:6*60,money:160000,speed:1,sound:snd,star:1,rating:70,paxTotal:0,paxDay:0,
     floor:new Uint8Array(NC),cobj:new Int32Array(NC),objs:[],seq:1,navVer:0,entries:[],
     contracts:[],offers:[],flights:[],planes:[],pax:[],fx:[],fin:{},finY:null,
     stats:{dep:0,arr:0,missed:0,ontime:0,late:0,cancel:0},nextOffer:6*60+20,lastDay:0,
     dirty:true,rwy:null,npc:[],veh:[],busQ:{dep:[],arr:[]},busT:{dep:0,arr:0},saveT:0,over:false,seen:{},amb:0,tiles:0,alerts:[]};
  for(let x=0;x<GW;x++)G.floor[cidx(x,GH)]=1;
  G.tx0=TB.x0;G.tx1=TB.x1;G.tmid=57;G.exp=0;G.lot={x0:LOT.x0,x1:LOT.x1};G.land=0;G.up={rapid:0,ils:0,ext:0,rwy2:0};setRunway();fillTerm(G.tx0,G.tx1);
  fbInit();
  makeOffer(true);makeOffer(false);
  navChanged();
}
/* ---------- terminal fija: zona pública y estéril ya delimitadas ---------- */
const LAND0=GH+6,LAND1=GH+21,TB={x0:44,x1:67,split:28},LOT={x0:24,x1:87}; // filas APR..split-1 estéril, split..GH-1 pública
function fillTerm(x0,x1){for(let y=APR;y<GH;y++)for(let x=x0;x<=x1;x++)G.floor[cidx(x,y)]=y<TB.split?2:(x<=G.tmid?1:3);}
const expCost=()=>Math.round(30000*Math.pow(1.45,G.exp||0)/1000)*1000;
function expandTerm(dir){const c=expCost();if(dir<0&&G.tx0<=G.lot.x0||dir>0&&G.tx1>=G.lot.x1){toast('La terminal llegó al borde de tu terreno: compra más terreno','bad');return false;}
  if(G.money<c){toast('Falta dinero: la ampliación cuesta '+fmt$(c),'bad');return false;}
  spend('Construcción',c);G.exp++;if(dir<0){const n=Math.max(G.lot.x0,G.tx0-8);fillTerm(n,G.tx0-1);G.tx0=n;}else{const n=Math.min(G.lot.x1,G.tx1+8);fillTerm(G.tx1+1,n);G.tx1=n;}
  navChanged();sfx('build');toast('Terminal ampliada · ahora '+(G.tx1-G.tx0+1)+' columnas','ok');return true;}
const landCost=()=>Math.round(40000*Math.pow(1.5,G.land||0)/1000)*1000;
function buyLand(dir){const c=landCost();if(dir<0&&G.lot.x0<=0||dir>0&&G.lot.x1>=GW-1){toast('No queda más terreno hacia ese lado','bad');return false;}
  if(G.money<c){toast('Falta dinero: el terreno cuesta '+fmt$(c),'bad');return false;}spend('Construcción',c);G.land++;
  if(dir<0)G.lot.x0=Math.max(0,G.lot.x0-16);else G.lot.x1=Math.min(GW-1,G.lot.x1+16);G.dirty=true;G.baseDirty=true;sfx('build');toast('Terreno comprado · ahora '+(G.lot.x1-G.lot.x0+1)+' columnas','ok');return true;}
function buyUpgrade(k){const d=DEF[k];if(G.up[d.up]){toast('Ya tienes '+d.n.toLowerCase(),'bad');return false;}if(d.star&&G.star<d.star){toast('Se desbloquea con '+d.star+' estrellas','bad');return false;}
  if(G.money<d.cost){toast('Falta dinero: cuesta '+fmt$(d.cost),'bad');return false;}spend('Construcción',d.cost);G.up[d.up]=1;setRunway();G.baseDirty=true;G.dirty=true;sfx('star');toast(d.n+' lista','ok');return true;}
function earn(cat,a){G.money+=a;G.fin[cat]=(G.fin[cat]||0)+a;}
function spend(cat,a){G.money-=a;G.fin[cat]=(G.fin[cat]||0)-a;}
function clockStr(t){const m=Math.floor(t)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
const dayOf=t=>Math.floor(t/1440);

/* ---------- objetos y cuadrícula ---------- */
function geom(k,gx,gy,r){const d=DEF[k];r=(d.apron||d.land||d.fix)?0:(r||0);const rw=r%2?d.h:d.w,rh=r%2?d.w:d.h;return{r,rw,rh,cx:(gx+rw/2)*CELL,cz:(gy+rh/2)*CELL,a:r*Math.PI/2};}
function l2w(o,lx,lz){const c=Math.cos(o.a),s=Math.sin(o.a);return[o.cx+lx*c-lz*s,o.cz+lx*s+lz*c];}
function canPlace(k,gx,gy,r,free){
  const d=DEF[k];if(!d||d.paint||d.act||k==='erase')return{ok:false};
  if(d.star&&G.star<d.star)return{ok:false,why:'Se desbloquea con '+d.star+' estrellas'};
  const g=geom(k,gx,gy,r);
  if(gx<G.lot.x0||gy<0||gx+g.rw-1>G.lot.x1)return{ok:false,why:'Fuera de tu terreno'};
  if(d.land){if(gy<LAND0||gy+g.rh>LAND1)return{ok:false,why:'Va en el área de accesos, al otro lado de la vía'};
    for(const o of G.objs)if(o.def.land&&gx<o.gx+o.rw&&gx+g.rw>o.gx&&gy<o.gy+o.rh&&gy+g.rh>o.gy)return{ok:false,why:'Se solapa con otro estacionamiento'};}
  else if(d.apron){if(gy+g.rh>APR)return{ok:false,why:'Los puestos van en la plataforma (zona gris)'};
    for(const o of G.objs)if(o.def.apron&&gx<o.gx+o.rw&&gx+g.rw>o.gx&&gy<o.gy+o.rh&&gy+g.rh>o.gy)return{ok:false,why:'Se solapa con otro puesto'};}
  else{if(gy<APR||gy+g.rh>GH)return{ok:false,why:'Va dentro de la terminal'};
    if(d.facade&&gy!==APR)return{ok:false,why:'Va pegado a la fachada de la plataforma (primera fila de la sala estéril)'};
    for(let y=gy;y<gy+g.rh;y++)for(let x=gx;x<gx+g.rw;x++){const i=cidx(x,y);if(!G.floor[i])return{ok:false,why:'Fuera de la terminal'};if(G.cobj[i])return{ok:false,why:'Ocupado'};}}
  if(!free&&G.money<d.cost)return{ok:false,why:'Falta dinero'};
  return{ok:true};
}
function placeObj(k,gx,gy,r,free){
  const c=canPlace(k,gx,gy,r);if(!c.ok&&!free)return c;
  const d=DEF[k],g=geom(k,gx,gy,r);const o={id:G.seq++,k,gx,gy,r:g.r,lv:1};
  if(!free)spend('Construcción',d.cost);
  G.objs.push(o);initObj(o);if(!d.apron&&!d.land)o.cells.forEach(i=>G.cobj[i]=o.id);
  navChanged();sfx('build');return{ok:true,o};
}
function removeObj(o,refund){
  if(o.def.apron&&o.f){toast('Ese puesto tiene un avión asignado','bad');return false;}
  if(o.def.land&&o.cars&&o.cars.some(c=>c)){toast('Hay carros estacionados: espera a que salgan','bad');return false;}
  G.objs=G.objs.filter(q=>q!==o);if(!o.def.apron&&!o.def.land)o.cells.forEach(i=>{if(G.cobj[i]===o.id)G.cobj[i]=0;});
  if(refund)earn('Construcción',Math.round(investOf(o)*0.5));
  detachPax(o);
  navChanged();sfx('del');return true;
}
function detachPax(o){o.queue=[];o.serving=[];if(o.seats)o.seats=[null,null,null,null];
  for(const p of G.pax)if(p.o===o||(p.seat&&p.seat.b===o)){p.seat=null;p.sit=false;p.o=null;p.hidden=false;p.mode='replan';}
}
function investOf(o){let c=o.def.cost;const L=LV[o.k];if(L)for(let i=2;i<=(o.lv||1);i++)c+=L[i].cost;if(o.bridge)c+=30000;return c;}
/* ---------- edición: mover, girar, mejorar ---------- */
function liftObj(o){ // saca el objeto de la cuadrícula sin borrarlo
  G.objs=G.objs.filter(q=>q!==o);if(!o.def.apron&&!o.def.land)o.cells.forEach(i=>{if(G.cobj[i]===o.id)G.cobj[i]=0;});detachPax(o);navChanged();}
function dropObj(o,gx,gy,r){const g=geom(o.k,gx,gy,r);Object.assign(o,{gx,gy,r:g.r});G.objs.push(o);initObj(o);if(!o.def.apron&&!o.def.land)o.cells.forEach(i=>G.cobj[i]=o.id);navChanged();}
function rotateObj(o){if(o.def.apron||o.def.fix)return false;const old={gx:o.gx,gy:o.gy,r:o.r};liftObj(o);
  for(let k=1;k<4;k++){const r=(old.r+k)%4,g=geom(o.k,old.gx,old.gy,r);const cx=Math.round(o.cx/CELL-g.rw/2),cy=Math.round(o.cz/CELL-g.rh/2);
    for(const [gx,gy] of [[cx,cy],[old.gx,old.gy]])if(canPlace(o.k,gx,gy,r,true).ok){dropObj(o,gx,gy,r);sfx('click');return true;}}
  dropObj(o,old.gx,old.gy,old.r);toast('No hay espacio para girarlo aquí','bad');return false;}
function nextUp(o){if(o.def.apron){const nk=STAND_NEXT[o.k];if(!nk)return null;const nd=DEF[nk];return{n:'Ampliar a '+nd.n,cost:nd.cost-o.def.cost,star:nd.star,stand:nk};}
  const L=LV[o.k];if(!L||!L[(o.lv||1)+1])return null;const l=L[(o.lv||1)+1];return{n:l.n,cost:l.cost,lv:(o.lv||1)+1};}
function upgradeObj(o){const u=nextUp(o);if(!u)return false;if(u.star&&G.star<u.star){toast('Se desbloquea con '+u.star+' estrellas','bad');return false;}
  if(G.money<u.cost){toast('Falta dinero: cuesta '+fmt$(u.cost),'bad');return false;}
  if(u.stand){if(o.f){toast('Espera a que el puesto quede libre','bad');return false;}const nd=DEF[u.stand];const bottomRow=o.gy+o.rh;const gx=Math.round(o.cx/CELL-nd.w/2),gy=bottomRow-nd.h;
    const old={k:o.k,gx:o.gx,gy:o.gy};liftObj(o);o.k=u.stand;o.def=nd;
    if(gy<0||!canPlace(u.stand,gx,gy,0,true).ok){o.k=old.k;o.def=DEF[old.k];dropObj(o,old.gx,old.gy,0);toast('No hay espacio en la plataforma para ampliarlo','bad');return false;}
    spend('Construcción',u.cost);dropObj(o,gx,gy,0);}
  else{spend('Construcción',u.cost);o.lv=u.lv;G.dirty=true;}
  sfx('star');pop3(o.cx,o.cz,'Nivel ↑');return true;}
function bridgeOk(s){if(!s.def.apron||s.bridge)return false;if(s.gy+s.rh!==APR)return false;const row=APR;let n=0;for(let x=s.gx;x<s.gx+s.rw;x++)if(G.floor[cidx(x,row)]===2)n++;return n>=2&&!!s.gate;}
function buildBridge(s){if(!bridgeOk(s)){toast('La pasarela necesita el puesto pegado a la sala estéril y con puerta enlazada','bad');return false;}
  if(G.money<30000){toast('Falta dinero: cuesta $30.000','bad');return false;}spend('Construcción',30000);s.bridge=true;G.dirty=true;sfx('star');return true;}

function paintRect(a,b,v){ // v: 1,2 o 0 (borrar)
  const x0=Math.min(a%GW,b%GW),x1=Math.max(a%GW,b%GW),y0=Math.max(APR,Math.min((a/GW)|0,(b/GW)|0)),y1=Math.min(GH-1,Math.max((a/GW)|0,(b/GW)|0));
  let n=0,cells=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=cidx(x,y);if(v===0){if(G.floor[i]&&!G.cobj[i])cells.push(i);}else if(G.floor[i]!==v)cells.push(i);}
  if(!cells.length)return 0;
  if(v){const cost=cells.length*DEF[v===1?'floor':'sterile'].cost;if(cost>G.money){toast('Falta dinero: '+cells.length+' baldosas cuestan '+fmt$(cost),'bad');return 0;}spend('Construcción',cost);}
  else earn('Construcción',Math.round(cells.reduce((s,i)=>s+DEF[G.floor[i]===1?'floor':'sterile'].cost,0)*0.5));
  cells.forEach(i=>G.floor[i]=v);navChanged();sfx(v?'paint':'del');return cells.length;
}
function rectCost(a,b,v){const x0=Math.min(a%GW,b%GW),x1=Math.max(a%GW,b%GW),y0=Math.max(APR,Math.min((a/GW)|0,(b/GW)|0)),y1=Math.min(GH-1,Math.max((a/GW)|0,(b/GW)|0));let n=0;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=cidx(x,y);if(v===0?(G.floor[i]&&!G.cobj[i]):G.floor[i]!==v)n++;}return{n,cost:v?n*DEF[v===1?'floor':'sterile'].cost:0,x0,x1,y0,y1};}

function initObj(o){
  if(!o.lv)o.lv=1;const d=DEF[o.k];o.def=d;Object.assign(o,geom(o.k,o.gx,o.gy,o.r));
  o.cells=[];for(let y=o.gy;y<o.gy+o.rh;y++)for(let x=o.gx;x<o.gx+o.rw;x++)o.cells.push(cidx(x,y));
  o.queue=o.queue||[];o.serving=o.serving||[];o.served=o.served||0;
  if(d.apron){o.ok=true;o.bottom=(o.gy+o.rh)*CELL;return;}
  if(d.land){o.ok=true;const n=spotsOf(o);o.cars=o.cars||[];o.cars.length=n;for(let i=0;i<n;i++)if(o.cars[i]===undefined)o.cars[i]=null;o.spotPos=parkSpots(o);return;}
  const ax=(Math.floor((d.w-1)/2)+0.5-d.w/2)*CELL,fz=(d.h/2+0.5)*CELL;
  const fr=l2w(o,ax,fz),bk=l2w(o,ax,-fz);const front=cellAt(fr[0],fr[1]),back=cellAt(bk[0],bk[1]);
  o.fd=[-Math.sin(o.a),Math.cos(o.a)];
  if(d.back){o.acc=back;o.ex=front;o.qd=[-o.fd[0],-o.fd[1]];}else{o.acc=front;o.ex=d.exitZone?back:-1;o.qd=o.fd;}
  const accRow=o.acc>=0?(o.acc/GW)|0:-1;
  o.accZone=d.zone||(o.acc>=0?G.floor[o.acc]:0);
  o.why='';
  if(o.acc<0||accRow>=GH||!G.floor[o.acc])o.why=d.back?'La espalda no da a la sala estéril':'El frente no da a ningún piso';
  else if(G.cobj[o.acc])o.why=d.back?'Algo bloquea la espalda':'Algo bloquea el frente';
  else if(d.zone&&G.floor[o.acc]!==d.zone)o.why=d.back?'La espalda debe dar a la sala estéril':'El frente debe dar a '+ZN[d.zone];
  else if(false)o.why=d.back?'La espalda debe dar a zona estéril':d.zone===1?'El frente debe dar a zona pública':'Debe estar en zona estéril';
  else if(d.exitZone&&(o.ex<0||((o.ex/GW)|0)>=GH||G.floor[o.ex]!==d.exitZone||G.cobj[o.ex]))o.why=(d.back?'El frente':'La espalda')+' debe dar libre a '+ZN[d.exitZone];
  else if(false)o.why=d.exitZone===2?'La espalda debe dar a zona estéril libre':'El frente debe dar a zona pública libre';
  o.ok=!o.why;
  o.spots=[];o.wait=[];o.seats=o.seats||[null,null,null,null];
  if(!o.ok)return;
  // fila en zigzag desde el frente
  const used=new Set();let c=o.acc,dir=[Math.round(o.qd[0]),Math.round(o.qd[1])],prev=null;const cells=[];
  for(let k=0;k<16;k++){if(c<0||!walkable(c,o.accZone)||used.has(c))break;used.add(c);cells.push(c);
    const tryC=(dx,dy)=>{const nx=c%GW+dx,ny=((c/GW)|0)+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)return -1;const n=cidx(nx,ny);return walkable(n,o.accZone)&&!used.has(n)?n:-1;};
    let n=tryC(dir[0],dir[1]);if(n>=0){c=n;continue;}
    let moved=false;for(const pd of [[dir[1],-dir[0]],[-dir[1],dir[0]]]){const m=tryC(pd[0],pd[1]);if(m>=0){c=m;dir=[-dir[0],-dir[1]];moved=true;break;}}if(!moved)break;}
  cells.forEach((ci,k)=>{const x=ccx(ci),z=ccz(ci);let dx,dz;if(k===0){dx=o.qd[0];dz=o.qd[1];}else{dx=x-ccx(cells[k-1]);dz=z-ccz(cells[k-1]);const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;}
    o.spots.push([x-dx*2.2,z-dz*2.2],[x+dx*2.2,z+dz*2.2]);});
  // zona de espera alrededor (recogida, puertas)
  if(o.k==='claim'||o.k==='gate'){const seen=new Set([o.acc]);let fr2=[o.acc];for(let r=0;r<4;r++){const nx=[];for(const ci of fr2){o.wait.push(ci);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=ci%GW+dx,y=((ci/GW)|0)+dy;if(x<0||y<0||x>=GW||y>=GH)continue;const n=cidx(x,y);if(!seen.has(n)&&walkable(n,o.accZone)){seen.add(n);nx.push(n);}}}fr2=nx;}
    if(o.k==='claim'){const bx=o.cx,bz=o.cz;o.wait.sort((a,b)=>Math.hypot(ccx(a)-bx,ccz(a)-bz)-Math.hypot(ccx(b)-bx,ccz(b)-bz));}}
  if(o.k==='bench'){o.seatPos=[-6,-2,2,6].map(lx=>l2w(o,lx,0.4));}
  if(o.k==='lounge'){const n=seatsOf(o);if(o.seats.length<n)for(let i=o.seats.length;i<n;i++)o.seats.push(null);o.seatPos=[];const cols=n>20?6:n>12?5:4,rows=Math.ceil(n/cols);
    for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols);o.seatPos.push(l2w(o,-12+c*(24/(cols-1)),-8.5+r*(13/Math.max(1,rows-1))));}}
  if(o.k==='porter'){const n=portersOf(o);o.ag=o.ag||[];while(o.ag.length<n){const k=o.ag.length;o.ag.push({o,k,x:o.cx,z:o.cz,hdg:Math.PI/2,st:'idle',p:null,walk:0,moving:false,lk:staffLook(o.id*13+k,'#2f6db5','#f2b705',false)});}
    o.ag.length=n;o.ag.forEach((a,k)=>{const h=[ccx(o.acc)+(k-(n-1)/2)*3.2*o.fd[1]+o.fd[0]*3,ccz(o.acc)+(k-(n-1)/2)*3.2*o.fd[0]+o.fd[1]*3];a.home=h;if(a.st==='idle'){a.x=h[0];a.z=h[1];}});}
}
function spotPos(o,i){if(!o.spots.length)return[ccx(o.acc),ccz(o.acc)];return o.spots[Math.min(i,o.spots.length-1)];}
function serverPos(o,k){const n=srvOf(o),lat=[o.qd[1],-o.qd[0]];const x=ccx(o.acc)-o.qd[0]*2.6+lat[0]*(k-(n-1)/2)*3.6,z=ccz(o.acc)-o.qd[1]*2.6+lat[1]*(k-(n-1)/2)*3.6;return[x,z];}

function parkSpots(o){const P=[],x0=o.gx*CELL,z0=o.gy*CELL,w=o.rw*CELL,h=o.rh*CELL,n=o.def.spots;const per=Math.ceil(n/2);
  for(let i=0;i<n;i++){const row=i<per?0:1,k=row?i-per:i;P.push({x:x0+6+k*((w-12)/(per-1||1)),z:row?z0+h-14:z0+14,h:row?-Math.PI/2:Math.PI/2,lv:0});}
  if(spotsOf(o)>n)for(let i=0;i<n;i++)P.push(Object.assign({},P[i],{lv:1}));return P;}
const FIELDS=new Map();
const NB=[[1,0,10],[-1,0,10],[0,1,10],[0,-1,10],[1,1,14],[1,-1,14],[-1,1,14],[-1,-1,14]];
function field(z,src){
  const key=z+':'+src;let f=FIELDS.get(key);if(f)return f;
  f=new Int32Array(NC).fill(INF);const h=[];
  const push=(i,d)=>{h.push(d*8192+i);let k=h.length-1;while(k>0){const p=(k-1)>>1;if(h[p]<=h[k])break;const t=h[p];h[p]=h[k];h[k]=t;k=p;}};
  const pop=()=>{const top=h[0],last=h.pop();if(h.length){h[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<h.length&&h[l]<h[m])m=l;if(r<h.length&&h[r]<h[m])m=r;if(m===k)break;const t=h[m];h[m]=h[k];h[k]=t;k=m;}}return top;};
  const srcs=src==='exit'?Array.from({length:GW},(_,x)=>x).filter(x=>G.floor[cidx(x,GH-1)]===z).map(x=>cidx(x,GH)):[src];
  for(const s of srcs)if(walkable(s,z)){f[s]=0;push(s,0);}
  while(h.length){const v=pop(),i=v%8192,d=(v-i)/8192;if(d>f[i])continue;const x=i%GW,y=(i/GW)|0;
    for(const [dx,dy,c] of NB){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GW||ny>=NAVH)continue;const n=ny*GW+nx;if(!walkable(n,z))continue;
      if(dx&&dy&&(!walkable(y*GW+nx,z)||!walkable(ny*GW+x,z)))continue;const nd=d+c;if(nd<f[n]){f[n]=nd;push(n,nd);}}}
  FIELDS.set(key,f);return f;
}
function navChanged(){
  G.navVer++;FIELDS.clear();
  G.objs.forEach(initObj);
  G.entries=[];G.arrExits=[];for(let x=0;x<GW;x++){const i=cidx(x,GH-1);if(G.floor[i]===1&&!G.cobj[i])G.entries.push(cidx(x,GH));if(G.floor[i]===3&&!G.cobj[i])G.arrExits.push(cidx(x,GH));}
  G.tiles=0;for(let i=0;i<GH*GW;i++)if(G.floor[i])G.tiles++;
  relink();G.dirty=true;G.alertT=0;
}
function relink(){
  const stands=G.objs.filter(o=>o.def.apron),gates=G.objs.filter(o=>o.k==='gate'&&o.ok);
  stands.forEach((s,i)=>{s.num=i+1;s.gate=null;});gates.forEach(g=>g.stand=null);
  for(const s of stands){let best=null,bd=1e9;const sx=s.cx,sz=s.bottom;for(const g of gates){if(g.stand)continue;const d=Math.hypot(g.cx-sx,g.cz-sz);if(d<bd){bd=d;best=g;}}if(best){s.gate=best;best.stand=s;}}
}

/* ---------- contratos y vuelos ---------- */
function allowedTypes(){const t=['ATR72','E190'];if(G.star>=2)t.push('A320','B738');if(G.star>=4&&G.up.ext)t.push('B788');return t;}
function makeOffer(first){
  const types=allowedTypes();let type=first?'ATR72':pick(types);if(G.star>=2&&!first&&Math.random()<0.55)type=pick(types.filter(t=>t!=='ATR72'));
  const al=AIRLINES.map((a,i)=>i).filter(i=>AIRLINES[i].fleet.includes(type));const ai=pick(al.length?al:[0]);
  const intl=!first&&G.star>=3&&Math.random()<0.55;
  let per=1;if(!first&&Math.random()<0.35+G.star*0.1)per++;if(G.star>=3&&Math.random()<0.3)per++;if(G.star>=4&&Math.random()<0.3)per++;
  const load=R(0.72,0.95);const times=[];const start=6*60+Math.floor(R(20,140)),span=(22*60-start);
  for(let i=0;i<per;i++){let tm=start+Math.floor(span*i/per+R(0,span/per*0.6));tm=Math.min(22*60,Math.round(tm/5)*5);times.push(tm);}
  const T=TYPES[type];const est=Math.round(per*(T.fee*(intl?1.3:1)+T.pax*load*((intl?110:60)+20)));
  G.offers.push({id:G.seq++,a:ai,type,intl,per,load,times,est,exp:G.t+18*60});
}
function hasStandFor(type){return G.objs.some(o=>o.def.apron&&o.def.size>=TYPES[type].size);}
function hasMig(){return G.objs.some(o=>o.k==='migration'&&o.ok);}
function offerBlock(of){if(of.intl&&!G.objs.some(o=>o.k==='customs'&&o.ok)&&hasMig())return'Necesitas aduana';
  if(TYPES[of.type].heavy&&!G.up.ext)return'Necesitas extender la pista';if(!hasStandFor(of.type))return'Necesitas un puesto '+SIZEN[TYPES[of.type].size];if(of.intl&&!hasMig())return'Necesitas migración';return'';}
function acceptOffer(id){const of=G.offers.find(o=>o.id===id);if(!of||offerBlock(of))return;
  G.offers=G.offers.filter(o=>o!==of);const c={id:of.id,a:of.a,type:of.type,intl:of.intl,per:of.per,load:of.load,times:of.times,sat:80,nums:of.times.map(()=>100+Math.floor(Math.random()*890))};
  G.contracts.push(c);genFlights(c,dayOf(G.t),G.t+35);if(dayOf(G.t+600)>dayOf(G.t))genFlights(c,dayOf(G.t)+1,G.t+35);
  toast('Contrato firmado con '+AIRLINES[c.a].name,'ok');sfx('chime');}
function dropContract(id){const c=G.contracts.find(q=>q.id===id);if(!c)return;G.contracts=G.contracts.filter(q=>q!==c);
  G.flights.forEach(f=>{if(f.c===c&&f.state==='sched'&&!f.plane&&f.ds===0)f.state='cancel';});G.rating=Math.max(0,G.rating-3);toast('Contrato con '+AIRLINES[c.a].name+' cancelado','bad');}
function genFlights(c,day,minT){
  const a=AIRLINES[c.a],T=TYPES[c.type];
  c.times.forEach((tm,i)=>{const std=day*1440+tm,sta=std-120;if(sta-40<minT)return;if(G.flights.some(f=>f.c===c&&f.std===std))return;
    const dests=DEST.filter(d=>c.intl?!d.d:d.d);
    const dep=Math.min(T.pax,Math.round(T.pax*c.load*R(0.85,1.08))),arr=Math.min(T.pax,Math.round(T.pax*c.load*R(0.85,1.08)));
    const depT=[];for(let k=0;k<dep;k++)depT.push(std-63-105*((Math.random()+Math.random())/2));depT.sort((x,y)=>x-y);
    G.flights.push({id:G.seq++,c,a,T,intl:c.intl,num:a.code+' '+c.nums[i],orig:pick(dests),dest:pick(dests),sta,std,dep,arr,depT,ds:0,live:0,walking:0,boarded:0,missed:0,dpl:0,dT:0,
      state:'sched',stand:null,plane:null,arrDone:false,boardOpen:false,bagT:1e9});
  });
  G.flights.sort((x,y)=>x.sta-y.sta);
}
function assignStand(f){
  const ok=G.objs.filter(s=>s.def.apron&&s.def.size>=f.T.size&&s.gate&&s.gate.ok&&!s.f).sort((a,b)=>a.def.size-b.def.size);
  if(ok.length){f.stand=ok[0];ok[0].f=f;}
}
function cancelFlight(f,why){f.state='cancel';if(f.stand){f.stand.f=null;f.stand=null;}G.stats.cancel++;f.c.sat-=20;G.rating=Math.max(0,G.rating-2.5);
  for(const p of G.pax)if(p.f===f&&p.dep&&!p.gone){finishPax(p,15);}toast('Vuelo '+f.num+' cancelado: '+why,'bad');}

/* ---------- pasajeros ---------- */
function mkPax(f,dep,x,z){const p={id:G.seq++,f,dep,x,z,zone:1,hdg:-Math.PI/2,spd:R(15,19),walk:R(0,6),ox:R(-2.2,2.2),oz:R(-2.2,2.2),lk:look(),name:pick(FIRST)+' '+pick(LAST),
  plan:[],si:-1,mode:'idle',wait:0,pen:0,lost:0,stuck:0,carry:null,moving:false,sit:false,hidden:false,gone:false};G.pax.push(p);return p;}
function makeDepPax(f,px,pz,e){
  const p=mkPax(f,true,px,pz);
  p.bag=Math.random()<0.62;p.bp=!p.bag||Math.random()<0.4;p.carry=p.bag?'suitcase':p.bp?'backpack':null;
  if(Math.random()<0.12)p.lk.kid=false;
  const slack=f.std-G.t;
  p.vip=Math.random()<0.08;p.prem=!p.vip&&Math.random()<0.1;
  p.plan=[];if(p.vip)p.plan.push({k:'go',kind:'protocol',opt:1});
  if(p.bag&&Math.random()<0.2)p.plan.push({k:'go',kind:'wrap',opt:1});
  if(p.bag)p.plan.push({k:'go',kind:'checkin'});
  if(Math.random()<0.25)p.plan.push({k:'go',kind:'news',opt:1});if(Math.random()<0.12)p.plan.push({k:'go',kind:'pharmacy',opt:1});if(Math.random()<0.15)p.plan.push({k:'go',kind:'food',opt:1});
  p.plan.push({k:'go',kind:'security'});if(f.intl)p.plan.push({k:'go',kind:'migration'});
  if(Math.random()<0.4)p.plan.push({k:'go',kind:'wc',opt:1});if(Math.random()<0.45)p.plan.push({k:'go',kind:'food',opt:1});if(Math.random()<0.4)p.plan.push({k:'go',kind:'shop',opt:1});if(Math.random()<0.15)p.plan.push({k:'go',kind:'news',opt:1});
  p.plan.push({k:'gate'});
  enterTerminal(p,e);return p;
}
function spawnArr(f){
  const pl=f.plane,d=door(pl);const p=mkPax(f,false,d[0],d[1]);p.zone=2;p.carry=Math.random()<0.5?'backpack':null;p.bp=!!p.carry;
  p.vip=Math.random()<0.06;if(p.vip&&G.objs.some(o=>o.k==='protocol'&&o.ok)){p.escort={lk:staffLook(p.id,'#1b1b1b','#1b1b1b')};const pr=G.objs.find(o=>o.k==='protocol');earn('VIP y protocolo',Math.round(revOf(pr)*0.6));}
  p.plan=[];if(f.intl)p.plan.push({k:'go',kind:'migration'});if(Math.random()<0.25)p.plan.push({k:'go',kind:'wc',opt:1});p.plan.push({k:'claim'});
  if(f.intl)p.plan.push({k:'go',kind:'customs'});if(f.intl&&Math.random()<0.4)p.plan.push({k:'go',kind:'exchange',opt:1});if(Math.random()<0.12)p.plan.push({k:'go',kind:'rental',opt:1});
  if(Math.random()<0.1)p.plan.push({k:'go',kind:'food',opt:1});if(Math.random()<0.08)p.plan.push({k:'go',kind:'news',opt:1});p.plan.push({k:'exit'});
  const g=f.stand&&f.stand.gate;const tgt=g?[ccx(g.acc)+R(-2,2),ccz(g.acc)+R(-2,2)]:[d[0],d[1]+40];
  p.bagD=R(0,14);if(fbVanPax(p))return;
  const e=f.stand?corrEsc(f,bridgeRot(f.stand)[0]):null;
  if(e){const rx=bridgeRot(f.stand)[0]+(p.id%2?0.9:-0.9),rz=APR*CELL-3;
    if(f.stand.bridge){p.x=rx;p.z=rz;p.el=6;corridorWalk(p,rx,e);return;}
    line(p,[d[0]+R(-3,3),d[1]+(g&&g.cz>d[1]?6:-6)],()=>line(p,[rx,rz-10],()=>line(p,[rx,rz,0],()=>corridorWalk(p,rx,e))));return;}
  if(f.stand&&f.stand.bridge){const be=bridgeIn(f.stand,pl);p.x=be[0];p.z=be[1];line(p,tgt,()=>nextStep(p));return;}line(p,[d[0]+R(-3,3),d[1]+(g&&g.cz>d[1]?6:-6)],()=>line(p,tgt,()=>nextStep(p)));
}
const CORR_Y=13.4;
function hasCorr(){return G.objs.some(o=>o.k==='pasillo'&&o.ok);}
function corrEsc(f,rx){const es=G.objs.filter(o=>o.k==='pasillo'&&o.ok);if(!es.length)return null;
  const k=f.intl&&G.objs.some(o=>o.k==='migration'&&o.ok)?'migration':'claim';const tg=G.objs.filter(o=>o.k===k&&o.ok);
  let tx=rx;if(tg.length){let b=tg[0];for(const o of tg)if(Math.abs(o.cx-rx)<Math.abs(b.cx-rx))b=o;tx=b.cx;}
  let best=es[0],bd=1e9;for(const o of es){const d=Math.abs(o.cx-tx)+0.25*Math.abs(o.cx-rx);if(d<bd){bd=d;best=o;}}return best;}
function corridorWalk(p,rx,e){const zc=APR*CELL+4.8+((p.id%3)-1)*1.3,ln=p.id%2?1.5:-1.5,fast=LVo(e).walk||1;p.corr=true;
  p.lspd=p.spd*0.8;
  line(p,[rx,APR*CELL-3,CORR_Y],()=>line(p,[rx,zc,CORR_Y],()=>{p.lspd=p.spd*fast;
    line(p,[e.cx+ln,zc,CORR_Y],()=>line(p,[e.cx+ln,APR*CELL+7,CORR_Y],()=>{p.ride=true;p.lspd=p.spd*0.85;
      line(p,[e.cx+ln,APR*CELL+23.5,0],()=>{p.ride=false;p.corr=false;p.el=0;p.pen=Math.max(0,p.pen-4);
        line(p,[ccx(e.acc)+R(-2,2),ccz(e.acc)],()=>nextStep(p));});}));}));}
/* ---- lugares de espera sin encimarse ---- */
function cellPts(cells){const P=[];for(const c of cells){const x0=ccx(c),z0=ccz(c);for(const [a,b] of [[-2,-2],[2,-2],[-2,2],[2,2]]){const j=((c*7+a*3+b*5+70)%7)*0.12;P.push([x0+a+j-0.36,z0+b+0.36-j]);}}return P;}
function grabPt(p,h,gen){dropSpot(p);if(h.spV!==G.navVer||!h.spP){h.spP=gen();h.spU=new Map();h.spV=G.navVer;}const P=h.spP;
  for(let i=0;i<P.length;i++){const q=h.spU.get(i);if(q&&q!==p&&!q.gone&&q.slot&&q.slot.h===h&&q.slot.i===i)continue;h.spU.set(i,p);p.slot={h,i};return[P[i][0],P[i][1]];}return null;}
function dropSpot(p){const s=p.slot;if(!s)return;if(s.h.spU&&s.h.spU.get(s.i)===p)s.h.spU.delete(s.i);p.slot=null;}
function enterTerminal(p,e){line(p,[ccx(e)+R(-2.5,2.5),ccz(e)],()=>{hirePorter(p,1);nextStep(p);});}
function hirePorter(p,zone){if(!p.bag||Math.random()>0.28)return;for(const o of G.objs){if(o.k!=='porter'||!o.ok||o.accZone!==zone)continue;const a=(o.ag||[]).find(a=>a.st==='idle');if(a){a.st='go';a.p=p;p.porter=a;return;}}}
function releasePorter(p){const a=p.porter;if(!a)return;p.porter=null;if(a.p===p){a.p=null;a.st='back';}earn('Servicios',6);p.pen=Math.max(0,p.pen-3);}
function updPorters(dt){for(const o of G.objs){if(o.k!=='porter')continue;for(const a of o.ag||[]){a.moving=false;
  const go=(tx,tz,sp)=>{const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz),st=sp*dt;if(d<0.3)return true;a.moving=true;a.hdg=lerpAng(a.hdg,Math.atan2(dz,dx),Math.min(1,dt*8));a.walk+=dt*sp*0.5;if(d<=st){a.x=tx;a.z=tz;return true;}a.x+=dx/d*st;a.z+=dz/d*st;return false;};
  if(a.st!=='idle'&&a.st!=='back'&&(!a.p||a.p.gone)){a.p=null;a.st='back';}
  if(a.st==='go'){if(go(a.p.x,a.p.z,24)||Math.hypot(a.p.x-a.x,a.p.z-a.z)<5)a.st='srv';}
  else if(a.st==='srv'){const p=a.p;const tx=p.x-Math.cos(p.hdg)*5.5,tz=p.z-Math.sin(p.hdg)*5.5;go(tx,tz,Math.max(10,p.spd*1.4));if(!a.moving)a.hdg=lerpAng(a.hdg,p.hdg,dt*4);}
  else if(a.st==='back'){if(go(a.home[0],a.home[1],18))a.st='idle';}
  else{a.hdg=lerpAng(a.hdg,Math.atan2(o.fd[1],o.fd[0]),dt*3);}}}}
/* ---- recibidores en el hall de llegadas ---- */
function spawnGreeters(f){if(!G.arrExits.length)return;const cl=G.objs.filter(o=>o.k==='claim'&&o.ok);if(!cl.length)return;const n=Math.round(f.arr*0.2);
  for(let i=0;i<n;i++){const c=pick(cl);const e=pick(G.arrExits);const spots=[];for(let dx=-4;dx<=4;dx++)for(let dy=1;dy<=4;dy++){const ci=cidx((c.ex%GW)+dx,((c.ex/GW)|0)+dy);if(ci>=0&&ci<GH*GW&&walkable(ci,3))spots.push(ci);}if(!spots.length)continue;const t=pick(spots);const nn={};const sp=grabPt(nn,c.gh||(c.gh={}),()=>cellPts(spots));
    G.npc.push(Object.assign(nn,{f,x:ccx(e)+R(-3,3),z:ccz(e)+R(2,6),tx:sp?sp[0]:ccx(t)+R(-2.5,2.5),tz:sp?sp[1]:ccz(t)+R(-2.5,2.5),st:'in',hdg:-Math.PI/2,walk:0,moving:false,lk:look(),sign:Math.random()<0.55,flowers:Math.random()<0.2,p:null,t:0}));}}
function updNpc(dt){for(const n of G.npc){n.moving=false;n.t+=dt;
  const go=(tx,tz,sp)=>{const dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz),st=sp*dt;if(d<0.3)return true;n.moving=true;n.hdg=lerpAng(n.hdg,Math.atan2(dz,dx),Math.min(1,dt*8));n.walk+=dt*sp*0.55;if(d<=st){n.x=tx;n.z=tz;return true;}n.x+=dx/d*st;n.z+=dz/d*st;return false;};
  if(n.st==='in'){if(go(n.tx,n.tz,15)){n.st='wait';n.t=0;}}
  else if(n.st==='wait'){const c=G.pax.find(p=>p.f===n.f&&!p.dep&&p.zone===3&&!p.greeted&&!p.gone&&Math.hypot(p.x-n.x,p.z-n.z)<45);
    if(c){dropSpot(n);c.greeted=n;n.p=c;n.st='hug';n.t=0;}else{const tgt=G.objs.find(o=>o.k==='claim');if(tgt)n.hdg=lerpAng(n.hdg,Math.atan2(tgt.cz-n.z,tgt.cx-n.x),dt*2);}
    if(n.f.arrDone&&!G.pax.some(p=>p.f===n.f&&!p.dep&&!p.gone)&&n.t>20){dropSpot(n);n.st='out';}}
  else if(n.st==='hug'){const p=n.p;if(!p||p.gone){n.st='out';continue;}const d=Math.hypot(p.x-n.x,p.z-n.z);if(d>4)go(p.x,p.z,18);else if(n.t>1.4)n.st='follow';}
  else if(n.st==='follow'){const p=n.p;if(!p||p.gone){n.gone=true;continue;}const sx=Math.cos(p.hdg+Math.PI/2)*4,sz=Math.sin(p.hdg+Math.PI/2)*4;go(p.x+sx,p.z+sz,Math.max(8,p.spd*1.3));if(!n.moving)n.hdg=p.hdg;}
  else if(n.st==='out'){if(!n.ox){const e=G.arrExits.length?pick(G.arrExits):cidx(10,GH);n.ox=ccx(e);n.oz=ccz(e)+14;}if(go(n.ox,n.oz,15))n.gone=true;}}
  if(G.npc.some(n=>n.gone)){G.npc.forEach(n=>{if(n.gone)dropSpot(n);});G.npc=G.npc.filter(n=>!n.gone);}}
function line(p,t,cb){p.mode='line';p.lt=t;p.lcb=cb;}
function mv(p,tx,tz,dt,spd){const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),st=(spd||p.spd)*dt;if(d<=st||d<0.05){p.x=tx;p.z=tz;return true;}
  p.x+=dx/d*st;p.z+=dz/d*st;p.hdg=lerpAng(p.hdg,Math.atan2(dz,dx),Math.min(1,dt*10));p.walk+=dt*p.spd*0.55;p.moving=true;return false;}
function nextStep(p){p.si++;p.o=null;p.sub=null;const s=p.plan[p.si];if(!s){if(p.dep)finishPax(p,score(p));else finishPax(p,score(p));return;}runStep(p);}
function choose(p,kind){
  const pc=cellAt(p.x,p.z);let best=null,bs=1e9;
  for(const o of G.objs){if(o.k!==kind||!o.ok||o.accZone!==p.zone)continue;const f=field(p.zone,o.acc);if(pc<0||f[pc]>=INF)continue;const s=f[pc]/10+(o.queue.length+o.serving.length)*svcOf(o)*5/srvOf(o);if(s<bs){bs=s;best=o;}}
  return best;
}
function runStep(p){
  const s=p.plan[p.si];
  if(s.k==='go'||s.k==='claim'){
    const kind=s.k==='claim'?'claim':s.kind;
    if(s.opt&&p.dep&&G.t>p.f.std-80)return nextStep(p);
    const o=choose(p,kind);
    if(!o){if(s.opt){if(kind==='wc')p.pen+=10;return nextStep(p);}p.mode='stuck';p.need=kind;p.retry=1.2;return;}
    p.o=o;p.mode='nav';p.tgt=o.acc;p.need=null;return;
  }
  if(s.k==='gate')return gateLogic(p);
  if(s.k==='exit'){p.mode='nav';p.tgt='exit';p.o=null;return;}
}
function gateLogic(p){
  const f=p.f,g=f.stand&&f.stand.gate&&f.stand.gate.ok?f.stand.gate:null;
  if(g&&f.boardOpen){p.o=g;p.sub='board';p.mode='nav';p.tgt=g.acc;return;}
  if((p.vip||p.prem)&&!p.inLounge){const ls=findLounge(p);if(ls){ls.b.seats[ls.i]=p;p.seat=ls;p.sub='toLounge';p.mode='nav';p.tgt=ls.b.acc;p.o=null;return;}}
  const seat=findSeat(p,g);
  if(seat){seat.b.seats[seat.i]=p;p.seat=seat;p.sub='toSeat';p.mode='nav';p.tgt=seat.b.acc;p.o=null;return;}
  if(g){p.sub='toStand';p.mode='nav';p.tgt=g.acc;p.o=null;return;}
  p.sub='standby';p.mode='standby';p.chk=1;
}
function findSeat(p,g){
  const pc=cellAt(p.x,p.z);let best=null,bs=1e9;
  for(const b of G.objs){if(b.k!=='bench'||!b.ok||b.accZone!==p.zone)continue;const free=b.seats.findIndex(q=>!q||q.gone);if(free<0)continue;
    const f=field(p.zone,b.acc);if(pc<0||f[pc]>=INF)continue;const dg=g?Math.hypot(b.cx-g.cx,b.cz-g.cz):0;if(g&&dg>140)continue;const s=dg*2+f[pc]/10;if(s<bs){bs=s;best={b,i:free};}}
  return best;
}
function findLounge(p){const pc=cellAt(p.x,p.z);for(const b of G.objs){if(b.k!=='lounge'||!b.ok||b.accZone!==p.zone)continue;const i=b.seats.findIndex(q=>!q||q.gone);if(i<0)continue;const f=field(p.zone,b.acc);if(pc<0||f[pc]>=INF)continue;return{b,i};}return null;}
function leaveSeat(p){if(p.seat){const b=p.seat.b;if(b.seats[p.seat.i]===p)b.seats[p.seat.i]=null;p.seat=null;}p.sit=false;}
function nav(p,dt){
  const f=field(p.zone,p.tgt),c=cellAt(p.x,p.z);
  if(c<0||f[c]>=INF){p.lost+=dt;return -1;}
  p.lost=0;
  if(f[c]===0){if(mv(p,ccx(c)+p.ox*0.4,ccz(c)+p.oz*0.4,dt))return 1;return 0;}
  const x=c%GW,y=(c/GW)|0;let best=c,bd=f[c];
  for(const [dx,dy] of NB){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GW||ny>=NAVH)continue;const n=ny*GW+nx;if(f[n]>=bd)continue;
    if(dx&&dy&&(f[y*GW+nx]>=INF||f[ny*GW+x]>=INF))continue;bd=f[n];best=n;}
  mv(p,ccx(best)+p.ox,ccz(best)+p.oz,dt);return 0;
}
function unstick(p){const c0=cellAt(p.x,p.z);if(c0<0)return false;const seen=new Set([c0]);let fr=[c0];
  for(let r=0;r<8;r++){const nx=[];for(const c of fr){if(walkable(c,p.zone)){p.x=ccx(c);p.z=ccz(c);return true;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=c%GW+dx,y=((c/GW)|0)+dy;if(x<0||y<0||x>=GW||y>=NAVH)continue;const n=cidx(x,y);if(!seen.has(n)){seen.add(n);nx.push(n);}}}fr=nx;}return false;}
function score(p){const w=p.wait*MIN_PER_S;return clamp(100-Math.max(0,w-25)*1.2-p.pen+G.amb,0,100);}
function finishPax(p,sc){if(p.gone)return;releasePorter(p);dropSpot(p);p.gone=true;leaveSeat(p);G.rating=G.rating*0.985+sc*0.015;
  if(p.dep&&!p.boarded){p.f.live--;p.f.missed++;G.stats.missed++;}
  if(!p.dep){earn('Tasas de pasajeros',20);G.stats.arr++;G.paxTotal++;G.paxDay++;}}
function updPax(p,dt){
  p.moving=false;if(p.el&&p.mode!=='line'){p.el=Math.max(0,p.el-dt*30);p.corr=false;p.ride=false;}
  switch(p.mode){
    case 'line':{const t=p.lt;let done;
      if(t.length>2){const e0=p.el||0,d0=Math.hypot(t[0]-p.x,t[1]-p.z);
        if(d0<0.05){const st=(p.lspd||p.spd)*0.6*dt,de=t[2]-e0;if(Math.abs(de)<=st){p.el=t[2];done=true;}else{p.el=e0+Math.sign(de)*st;p.moving=true;p.walk+=dt*p.spd*0.55;done=false;}}
        else{done=mv(p,t[0],t[1],dt,p.lspd);const d1=Math.hypot(t[0]-p.x,t[1]-p.z);p.el=done?t[2]:e0+(t[2]-e0)*(1-d1/d0);}}
      else done=mv(p,t[0],t[1],dt,p.lspd);
      if(p.ride)p.moving=false;
      if(done){const cb=p.lcb;p.lcb=null;p.mode='idle';p.lspd=0;cb&&cb();}break;}
    case 'nav':{const r=nav(p,dt);
      if(r===-1){if(p.lost>1.5){if(!unstick(p)||p.lost>20){p.mode='stuck';p.retry=1;p.lost=0;}}break;}
      const o=p.o;
      if(o&&o.def.svc&&!p.sit){const tail=spotPos(o,o.queue.length+1);const f=field(p.zone,o.acc),c=cellAt(p.x,p.z);
        if(Math.hypot(tail[0]-p.x,tail[1]-p.z)<9||(c>=0&&f[c]<=24)||r===1||(p.vip&&c>=0&&f[c]<=60)){if(p.vip){let k=o.queue.findIndex(q=>!q.vip);if(k<0)k=o.queue.length;o.queue.splice(k,0,p);}else o.queue.push(p);p.mode='queue';break;}}
      if(r===1)arrived(p);break;}
    case 'queue':{const o=p.o;if(!o||!G.objs.includes(o)){p.mode='replan';break;}const i=o.queue.indexOf(p);if(i<0){break;}const sp=spotPos(o,i+1);
      if(!mv(p,sp[0]+p.ox*0.15,sp[1]+p.oz*0.15,dt,p.spd*0.6)){}else p.hdg=lerpAng(p.hdg,Math.atan2(-o.qd[1],-o.qd[0]),Math.min(1,dt*4));p.wait+=dt;break;}
    case 'svc':break;
    case 'curbwait':p.cw+=dt;p.wait+=dt*0.15;if(p.cw>75)finishPax(p,score(p));break;
    case 'stuck':p.retry-=dt;p.stuck+=dt;p.wait+=dt*0.5;if(p.retry<=0){p.retry=1.5;runStep(p);}
      if(p.stuck>45){finishPax(p,p.dep?0:5);}break;
    case 'replan':p.o=null;leaveSeat(p);p.hidden=false;unstick(p);if(p.si<0)nextStep(p);else runStep(p);break;
    case 'seat':case 'standby':p.chk-=dt;if(p.mode==='standby')p.pen=Math.min(p.pen+dt*0.25,14);
      if(p.chk<=0){p.chk=0.8+Math.random()*0.6;const f=p.f,g=f.stand&&f.stand.gate&&f.stand.gate.ok?f.stand.gate:null;
        if(g&&f.boardOpen){dropSpot(p);const sb=p.seat?p.seat.b:null;leaveSeat(p);if(sb&&sb.k==='lounge'){const sp=[p.x,p.z];line(p,[sb.cx+(sp[0]-sb.cx)*0.2,sb.cz+(sp[1]-sb.cz)*0.2],()=>line(p,[ccx(sb.acc),ccz(sb.acc)],()=>{p.o=g;p.sub='board';p.mode='nav';p.tgt=g.acc;}));}else if(sb)line(p,[ccx(sb.acc),ccz(sb.acc)],()=>{p.o=g;p.sub='board';p.mode='nav';p.tgt=g.acc;});else{p.o=g;p.sub='board';p.mode='nav';p.tgt=g.acc;}}
        else if(p.mode==='standby'&&!p.moved&&g){p.moved=true;gateLogic(p);}
        else if(p.mode==='seat'&&g&&p.seat&&!p.inLounge&&Math.hypot(p.seat.b.cx-g.cx,p.seat.b.cz-g.cz)>140&&!p.moved){p.moved=true;const sb=p.seat.b;leaveSeat(p);line(p,[ccx(sb.acc),ccz(sb.acc)],()=>gateLogic(p));}}
      break;
    case 'bagwait':if(G.t>=p.f.bagT+p.bagD+(p.o?(LVo(p.o).bag||0):0)){const o=p.o;if(!o||!G.objs.includes(o)||!o.ok){p.mode='replan';break;}
        dropSpot(p);p.carry='suitcase';p.bag=true;line(p,[o.cx+R(-6,6),o.cz],()=>{p.zone=3;line(p,[ccx(o.ex)+R(-2,2),ccz(o.ex)],()=>{o.served++;hirePorter(p,3);nextStep(p);});});}
      else p.wait+=dt*0.25;break;
  }
}
function arrived(p){
  if(p.sub==='toLounge'&&p.seat){const b=p.seat.b,sp=b.seatPos[p.seat.i];const v=Math.round(revOf(b)*(p.vip?1.3:1));earn('VIP y protocolo',v);pop3(b.cx,b.cz,'+$'+v);p.pen=Math.max(0,p.pen-6);
    line(p,[ccx(b.acc),ccz(b.acc)],()=>line(p,sp,()=>{p.mode='seat';p.sit=true;p.inLounge=true;p.chk=0.5;p.hdg=Math.atan2(sp[1]-b.cz,sp[0]-b.cx)+Math.PI;}));return;}
  if(p.sub==='toSeat'&&p.seat){const sp=p.seat.b.seatPos[p.seat.i];line(p,sp,()=>{p.mode='seat';p.sit=true;p.chk=0.5;p.hdg=Math.atan2(p.seat.b.fd[1],p.seat.b.fd[0]);});return;}
  if(p.sub==='toStand'){const g=p.f.stand&&p.f.stand.gate;const c=g&&g.wait.length?pick(g.wait):cellAt(p.x,p.z);const sp=g&&g.wait.length?grabPt(p,g,()=>cellPts(g.wait)):null;line(p,sp||[ccx(c)+R(-2.5,2.5),ccz(c)+R(-2.5,2.5)],()=>{p.mode='standby';p.chk=0.5;});return;}
  const s=p.plan[p.si];
  if(s&&s.k==='claim'&&p.o){const o=p.o;const c=o.wait.length?o.wait[Math.min(o.wait.length-1,Math.floor(Math.random()*Math.min(o.wait.length,10)))]:o.acc;const sp=grabPt(p,o,()=>cellPts(o.wait.length?o.wait:[o.acc]));line(p,sp||[ccx(c)+R(-3,3),ccz(c)+R(-3,3)],()=>{p.mode='bagwait';p.hdg=Math.atan2(o.cz-p.z,o.cx-p.x);});return;}
  if(s&&s.k==='exit'){releasePorter(p);if(fboTransfer(p))return;curbArrival(p);return;}
  p.mode='idle';nextStep(p);
}
function updObjs(dt){
  for(const o of G.objs){if(!o.def.svc)continue;
    if(o.queue.length)o.queue=o.queue.filter(p=>!p.gone&&p.mode==='queue'&&p.o===o);
    for(let k=o.serving.length-1;k>=0;k--){const e=o.serving[k],p=e.p;if(p.gone){o.serving.splice(k,1);continue;}
      if(!e.go){const sp=serverPos(o,e.idx);if(o.k==='security'||mv(p,sp[0],sp[1],dt,p.spd*0.7)){e.go=true;if(o.k==='wc')p.hidden=true;}else continue;}
      e.t-=dt;
      if(o.k==='security'){const u=clamp(1-e.t/e.T,0,1),A=l2w(o,-3,o.def.h*CELL/2+2),M=l2w(o,-3,0),B=[ccx(o.ex),ccz(o.ex)];const pt=u<0.5?[lerp(A[0],M[0],u*2),lerp(A[1],M[1],u*2)]:[lerp(M[0],B[0],(u-0.5)*2),lerp(M[1],B[1],(u-0.5)*2)];
        p.moving=Math.abs(u-0.5)>0.08;if(p.moving)p.walk+=dt*8;p.hdg=Math.atan2(-o.fd[1],-o.fd[0]);p.x=pt[0];p.z=pt[1];p.pose=Math.abs(u-0.5)<0.08?'armsUp':null;}
      else{p.hdg=lerpAng(p.hdg,Math.atan2(-o.qd[1],-o.qd[0]),Math.min(1,dt*6));p.pose='hand';}
      if(e.t<=0){o.serving.splice(k,1);finishSvc(o,p);}}
    let guard=0;while(o.serving.length<srvOf(o)&&o.queue.length&&guard++<4){const h=o.queue[0],sp=spotPos(o,1);if(Math.hypot(h.x-sp[0],h.z-sp[1])>3.5)break;
      o.queue.shift();const used=new Set(o.serving.map(e=>e.idx));let idx=0;while(used.has(idx))idx++;const T=svcOf(o)*R(0.8,1.25)*(h.vip?0.6:1);o.serving.push({p:h,t:T,T,idx,go:false});h.mode='svc';h.wait+=0;}
  }
}
function finishSvc(o,p){
  p.pose=null;o.served++;
  switch(o.k){
    case 'checkin':p.carry=p.bp?'backpack':null;p.bag=false;releasePorter(p);break;
    case 'wrap':{p.wrapped=true;p.lk=Object.assign({},p.lk,{bagc:'#7fd3a6'});const v=revOf(o);earn('Servicios',v);pop3(o.cx,o.cz,'+$'+v);break;}
    case 'news':case 'pharmacy':case 'exchange':case 'rental':{const v=revOf(o);earn('Comercios',v);pop3(o.cx,o.cz,'+$'+v);if(o.k!=='exchange'&&o.k!=='rental'&&!p.carry)p.carry='shopbag';if(o.k==='rental')p.rental=true;break;}
    case 'protocol':{const v=revOf(o);earn('VIP y protocolo',v);pop3(o.cx,o.cz,'+$'+v);p.escort={lk:staffLook(p.id,'#1b1b1b','#1b1b1b')};p.pen=Math.max(0,p.pen-4);break;}
    case 'security':p.zone=2;p.x=ccx(o.ex);p.z=ccz(o.ex);break;
    case 'wc':p.hidden=false;p.pen=Math.max(0,p.pen-4);break;
    case 'food':{const v=revOf(o);earn('Comercios',v);pop3(o.cx,o.cz,'+$'+v);break;}
    case 'shop':{const v=revOf(o);earn('Comercios',v);p.carry='shopbag';pop3(o.cx,o.cz,'+$'+v);break;}
    case 'gate':{const f=p.f;if(!f.plane||f.plane.state!=='parked'){p.mode='replan';return;}p.boarded=true;f.boarded++;f.live--;f.walking++;G.stats.dep++;G.paxTotal++;G.paxDay++;
      const d=door(f.plane);const st=f.stand;
      if(st&&st.bridge){const be=bridgeIn(st,f.plane);p.pen=Math.max(0,p.pen-5);line(p,be,()=>{f.walking--;p.gone=true;G.rating=G.rating*0.985+score(p)*0.015;});return;}
      line(p,[ccx(o.acc)-o.qd[0]*9+o.qd[1]*7,ccz(o.acc)-o.qd[1]*9-o.qd[0]*7],()=>line(p,[d[0],d[1]+(o.cz>d[1]?6:-6)],()=>line(p,d,()=>{f.walking--;p.gone=true;G.rating=G.rating*0.985+score(p)*0.015;})));return;}
  }
  nextStep(p);
}
function bridgeIn(s,pl){const r=bridgeRot(s);return[r[0],APR*CELL+5];}
function door(pl){const R0=Math.max(1.8,pl.T.len*PSCALE*0.058),L=pl.T.len*PSCALE;const g=pl.f.stand&&pl.f.stand.gate;const s=g?(g.cx>=pl.x?1:-1):1;return[pl.x+s*(R0+3.5),pl.z+L*0.3];}

/* ---------- aviones ---------- */
function canSpawnApproach(){if(!G.up.rwy2){if(G.planes.some(q=>q.state==='lineup'))return false;if(G.lastRwy!=='dep'&&G.planes.some(q=>q.state==='holdShort'))return false;}else if(G.planes.some(q=>q.state==='cross'))return false;
  const ap=G.planes.filter(q=>q.state==='approach');if(ap.length>=(G.up.rapid?3:2))return false;return ap.every(q=>q.x<TD_X+(G.up.rapid?520:250));}
function spawnPlane(f){
  const p={id:G.seq++,f,T:f.T,a:f.a,reg:'YV'+(1000+Math.floor(Math.random()*8999)),x:APP_X,z:RWY_Z,alt:APP_ALT,hdg:Math.PI,spd:110,state:'approach',engines:true,path:[],wait:0};
  const L=p.T.len*PSCALE,s=f.stand;p.park=[s.cx,s.bottom-L/2-5];f.plane=p;f.state='inbound';G.planes.push(p);
}
function blockedAhead(p,rev){const mh=rev?p.hdg+Math.PI:p.hdg,mx=Math.cos(mh),mz=Math.sin(mh);
  for(const q of G.planes){if(q===p||q.alt>2||q.state==='parked'||q.state==='approach'||q.state==='goaround')continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d>85||d<1)continue;const fw=dx*mx+dz*mz,lat=Math.abs(-dx*mz+dz*mx);if(fw>0&&lat<15)return true;}return false;}
function follow(p,dt,spd,rev){let rem=spd*dt;while(rem>0&&p.path.length){const t=p.path[0],dx=t[0]-p.x,dz=t[1]-p.z,d=Math.hypot(dx,dz);
    if(d>0.01){const h=Math.atan2(dz,dx);p.hdg=rev?h+Math.PI:h;}
    if(d<=rem){p.x=t[0];p.z=t[1];rem-=d;p.path.shift();}else{p.x+=dx/d*rem;p.z+=dz/d*rem;rem=0;}}
  return p.path.length===0;}
function updPlane(p,dt){
  const f=p.f;
  switch(p.state){
    case 'approach':{p.x-=p.spd*dt;p.alt=Math.max(0,(p.x-TD_X)/(APP_X-TD_X)*APP_ALT);
      if(p.x<=TD_X+(G.up.ils?160:40)&&!p.cleared&&G.up.ils&&G.rwy&&G.rwy!==p&&p.spd>62){p.spd=Math.max(62,p.spd-40*dt);}
      if(p.x<=TD_X+40&&!p.cleared){if(G.rwy&&G.rwy!==p){p.state='goaround';toast(f.num+' sube y da otra vuelta: pista ocupada','bad');break;}G.rwy=p;p.cleared=true;}
      if(p.alt<=0){p.state='roll';gfxTouch(p);p.rev=2.2;earn('Aterrizajes',Math.round(f.T.fee*(f.intl?1.3:1)));pop3(p.x,RWY_Z,'+'+fmt$(f.T.fee*(f.intl?1.3:1)));sfx('jet');
        for(let i=0;i<6;i++)G.fx.push({x:p.x+R(-6,6),y:p.z+R(-12,12),h:1,r:R(3,6),t:0,life:R(0.8,1.6),c:'#e8e8e8'});}break;}
    case 'goaround':p.x-=p.spd*dt;p.alt=Math.min(260,p.alt+dt*14);if(p.x<-500){G.planes=G.planes.filter(q=>q!==p);f.plane=null;f.state='sched';f.ga=(f.ga||0)+1;}break;
    case 'roll':{const ex2=G.up.rapid?55:TAXI;p.spd=Math.max(ex2,p.spd-(G.up.rapid?40:30)*dt);p.x-=p.spd*dt;if(p.rev>0){p.rev-=dt;if(Math.random()<dt*20)G.fx.push({x:p.x+18,y:p.z+R(-14,14),h:1.5,r:R(2,4),t:0,life:0.9,c:'#dfe6ea'});}
      if(p.spd<=ex2+0.1){const s=p.park;if(G.up.rapid){const ex=EXITS.find(x=>x<p.x-60)??EXITS[EXITS.length-1];p.path=smooth([p.x,p.z],[[ex+70,RWY_Z],[ex,TWY2_Z],[s[0],TWY2_Z],[s[0],s[1]]],26);}
        else{const ex=EXITS.find(x=>x<p.x-25)??EXITS[EXITS.length-1];p.path=smooth([p.x,p.z],[[ex+16,RWY_Z],[ex,RWY_Z+16],[ex,TWY2_Z],[s[0],TWY2_Z],[s[0],s[1]]],22);}p.state='taxiIn';}break;}
    case 'taxiIn':if(G.rwy===p&&p.z>RWY_Z+26){G.rwy=null;G.lastRwy='arr';}
      if(blockedAhead(p)&&p.wait<7){p.wait+=dt;break;}if(p.wait>=7){p.wait+=dt;if(p.wait>10)p.wait=0;}
      if(follow(p,dt,p.path.length<12?TAXI*0.6:TAXI)){p.state='parked';spawnGreeters(f);fbVanFor(f,p);p.engines=false;f.parkT=G.t;f.bagT=G.t+18;f.dT=1.2;mkGSE(p);sfx('chime');
        if(G.sound)speak('Vuelo '+f.num.replace(' ',' ')+' procedente de '+f.orig.n+' en el puesto '+f.stand.num,true);}break;
    case 'parked':break;
    case 'push':if(follow(p,dt,10,true)){p.state='taxiOut';p.engines=true;f.stand.f=null;p.path=[[DEP_X-34,TWY_Z]];}break;
    case 'taxiOut':if(blockedAhead(p)&&p.wait<7){p.wait+=dt;break;}if(p.wait>=7){p.wait+=dt;if(p.wait>10)p.wait=0;}
      if(follow(p,dt,TAXI)){p.state='holdShort';}break;
    case 'holdShort':if(G.up.rwy2){if(!G.rwy&&!G.planes.some(q=>q.state==='approach'&&q.x<TD_X+450)){G.rwy=p;p.state='cross';p.path=smooth([p.x,p.z],[[DEP_X,TWY_Z],[DEP_X,RWY2_Z+30]],20);}break;}
      if(!G.rwy&&!G.planes.some(q=>q.state==='approach')){G.rwy=p;p.state='lineup';p.path=smooth([p.x,p.z],[[DEP_X,TWY_Z],[DEP_X,RWY_Z],[DEP_X-50,RWY_Z]],20);}break;
    case 'cross':if(G.rwy===p&&p.z<RWY_Z-28){G.rwy=null;}if(follow(p,dt,32)){if(G.rwy===p)G.rwy=null;p.state='hold2';}break;
    case 'hold2':if(!G.rwy2){G.rwy2=p;p.state='lineup';p.path=smooth([p.x,p.z],[[DEP_X,RWY2_Z],[DEP_X-50,RWY2_Z]],20);}break;
    case 'lineup':if(follow(p,dt,28)){p.state='takeoff';p.spd=22;sfx('jet');}break;
    case 'takeoff':p.spd=Math.min(95,p.spd+16*dt);p.x-=p.spd*dt;p.hdg=Math.PI;if(p.spd>56)p.alt+=dt*(p.spd-50)*0.9;
      if(Math.random()<dt*12&&p.alt<4)G.fx.push({x:p.x+30,y:p.z+R(-10,10),h:2,r:R(3,5),t:0,life:1.2,c:'#d8d8d8'});
      if(p.alt>5&&G.rwy===p){G.rwy=null;G.lastRwy='dep';}if(p.alt>5&&G.rwy2===p)G.rwy2=null;
      if(p.alt>60&&Math.random()<dt*14)G.fx.push({x:p.x+40,y:p.z+R(-20,20),h:p.alt+8,r:R(5,8),t:0,life:2.5,c:'#ffffff'});if(p.x<-1300||p.alt>320){G.planes=G.planes.filter(q=>q!==p);f.state='done';f.doneT=G.t;}break;
  }
}
function requestPush(f){const p=f.plane;const sx=p.x;
  if(G.planes.some(q=>q!==p&&q.alt<2&&['taxiIn','taxiOut','push'].includes(q.state)&&Math.abs(q.z-TWY_Z)<40&&Math.abs(q.x-sx)<120))return false;
  for(const q of G.pax)if(q.f===f&&q.dep&&!q.boarded&&!q.gone)finishPax(q,0);
  const delay=Math.max(0,G.t-f.std);f.delay=delay;
  if(delay<=15){G.stats.ontime++;f.c.sat=Math.min(100,f.c.sat+3);}else{G.stats.late++;f.c.sat-=Math.min(14,delay/5);G.rating=Math.max(0,G.rating-Math.min(3,delay/30));}
  const rev=f.boarded*(f.intl?110:60);earn('Tasas de pasajeros',rev);pop3(p.x,p.z,'+'+fmt$(rev));
  rmGSE(p);p.state='push';f.state='departed';f.boardOpen=false;
  const s=f.stand;p.path=smooth([p.x,p.z],[[s.cx,TWY_Z+28],[s.cx-6,TWY_Z],[s.cx-60,TWY_Z]],22);
  if(f.c.sat<25&&G.contracts.includes(f.c)){G.contracts=G.contracts.filter(c=>c!==f.c);toast(f.a.name+' rescindió el contrato por mal servicio','bad');G.rating=Math.max(0,G.rating-4);}
  return true;
}
function updFlights(dt){
  for(const f of G.flights){
    if(f.state==='cancel'||f.state==='done')continue;
    if(!f.stand&&f.state==='sched'&&G.t>=f.sta-80)assignStand(f);
    if(f.state==='sched'||f.state==='inbound'||f.state==='parked'){
      while(f.ds<f.depT.length&&G.t>=f.depT[f.ds]){if(!G.entries.length||G.pax.length>=PAXCAP){f.depT[f.ds]+=3;break;}f.live++;spawnDep(f);f.ds++;}
    }
    if(f.state==='sched'&&!f.plane){if(f.stand&&G.t>=f.sta-14&&canSpawnApproach())spawnPlane(f);else if(G.t>f.sta+150)cancelFlight(f,f.stand?'demasiado retraso':'no hay puesto libre con puerta');}
    const p=f.plane;
    if(p&&p.state==='parked'){f.state='parked';
      f.dT-=dt;if(f.dpl<f.arr&&f.dT<=0){if(G.pax.length<PAXCAP){spawnArr(f);f.dpl++;}f.dT=0.18;}
      if(f.dpl>=f.arr)f.arrDone=true;
      f.boardOpen=f.arrDone&&G.t>=f.std-55;if(f.boardOpen&&!f.boardT)f.boardT=G.t;
      if(f.boardOpen){const allIn=f.ds>=f.depT.length;const atGate=f.walking>0||G.pax.some(q=>q.f===f&&q.sub==='board'&&!q.gone&&!q.boarded&&(q.mode==='queue'||q.mode==='svc'));
        if((allIn&&f.live<=0&&f.walking<=0&&G.t>=f.std-20)||(G.t>=f.std+3&&!atGate&&G.t>=f.boardT+15)||G.t>=Math.max(f.std+25,f.boardT+40))requestPush(f);}
    }
  }
  G.flights=G.flights.filter(f=>!((f.state==='done'||f.state==='cancel')&&G.t-(f.doneT||f.std)>600&&!G.pax.some(p=>p.f===f)));
}

/* ---------- negocio, estrellas, alertas ---------- */
function updBusiness(dtg){
  let staff=0;for(const o of G.objs)staff+=staffOf(o);if(staff)spend('Personal',staff*dtg/60);
  const tiles=G.tiles||0;if(tiles)spend('Mantenimiento',tiles*0.04*dtg/60);
  if(G.t>=G.nextOffer){G.nextOffer=G.t+R(180,300);G.offers=G.offers.filter(o=>o.exp>G.t);if(G.offers.length<4)makeOffer(false);}
  const d=dayOf(G.t);if(d>G.lastDay){G.lastDay=d;G.finY=G.fin;G.fin={};const tot=Object.values(G.finY).reduce((a,b)=>a+b,0);
    toast('Día '+(d+1)+' · ayer: '+G.paxDay+' pasajeros, balance '+fmt$(tot),tot>=0?'ok':'bad');G.paxDay=0;G.contracts.forEach(c=>genFlights(c,d,G.t));}
  const plants=G.objs.filter(o=>o.k==='plant').length,ntile=Math.max(1,tiles);G.amb=Math.min(6,plants*60/ntile*3)+(G.objs.some(o=>o.k==='food'&&o.ok)?2:0)+(G.objs.some(o=>o.k==='shop'&&o.ok)?2:0);
  const nx=STARS[G.star+1];if(nx&&G.paxTotal>=nx.pax&&G.rating>=nx.rat){G.star++;toast('★ '+STARS[G.star].n+' · Nuevo: '+UNLOCK[G.star],'star');sfx('star');buildToolbar();}
  if(G.money<-60000&&!G.over){G.over=true;showOver('bank');}
}
function computeAlerts(){
  const A=[],O=k=>G.objs.filter(o=>o.k===k),has=k=>O(k).some(o=>o.ok);
  if(!G.entries.length)A.push({s:'b',t:'La terminal no tiene entrada: pinta suelo público tocando la acera (borde inferior).'});
  for(const o of G.objs)if(!o.def.apron&&!o.ok&&o.why)A.push({s:'b',t:o.def.n+': '+o.why+'.',o});
  const stands=G.objs.filter(o=>o.def.apron);
  stands.forEach(s=>{if(!s.gate)A.push({s:'b',t:'Puesto P'+s.num+' sin puerta de embarque enlazada.',o:s});});
  if(G.contracts.length){if(!has('checkin'))A.push({s:'b',t:'Falta un check-in en zona pública.'});if(!has('security'))A.push({s:'b',t:'Falta un filtro de seguridad entre zona pública y estéril.'});if(!has('claim'))A.push({s:'b',t:'Falta la recogida de equipaje: los que llegan no pueden salir.'});
    if(G.contracts.some(c=>c.intl)&&!has('migration'))A.push({s:'b',t:'Hay vuelos internacionales y no hay migración.'});
    if(G.contracts.some(c=>c.intl)&&!has('customs'))A.push({s:'b',t:'Hay vuelos internacionales y no hay aduana en el hall de llegadas.'});
    if(!G.arrExits.length)A.push({s:'b',t:'El hall de llegadas no tiene salida a la acera.'});
    if(G.star>=3&&G.fbo&&!G.fbo.on)A.push({s:'i',t:'Ya puedes abrir el aeródromo ejecutivo al norte (pestaña Ejecutiva).'});
    if(G.star>=2&&!hasCorr())A.push({s:'i',t:'Construye un Pasillo de llegadas (Procesos) pegado a la plataforma: los que llegan no se mezclan con las salidas.'});
    if(!G.objs.some(o=>o.def.land))A.push({s:'i',t:'Construye un estacionamiento (pestaña Accesos): cobra a quienes llegan en carro.'});
    if(!has('wc'))A.push({s:'w',t:'Sin baños: la satisfacción baja.'});if(!O('bench').length)A.push({s:'w',t:'Sin asientos: los pasajeros esperan de pie.'});}
  for(const o of G.objs)if(o.queue&&o.queue.length>=14)A.push({s:'w',t:'Cola larga en '+o.def.n+' ('+o.queue.length+'). Construye otro.',o});
  const stuck={};for(const p of G.pax)if(p.mode==='stuck'&&p.need)stuck[p.need]=(stuck[p.need]||0)+1;
  for(const k in stuck)A.push({s:'b',t:stuck[k]+' pasajeros no encuentran '+DEF[k].n.toLowerCase()+' alcanzable.'});
  if(G.money<0)A.push({s:'b',t:'Caja en negativo. Si baja de −$60.000 quiebras.'});
  if(G.offers.length&&!G.contracts.length&&stands.length)A.push({s:'i',t:'Tienes ofertas de aerolíneas en Contratos.'});
  G.alerts=A;
}
const GOALS=[
  ['Coloca un check-in en el hall de salidas (piso claro, a la izquierda)',()=>G.objs.some(o=>o.k==='checkin'&&o.ok)],
  ['Pon un filtro de seguridad entre el hall de salidas y la sala estéril (azul)',()=>G.objs.some(o=>o.k==='security'&&o.ok)],
  ['Construye un puesto S en la plataforma gris',()=>G.objs.some(o=>o.def.apron)],
  ['Coloca una puerta de embarque en la zona estéril',()=>G.objs.some(o=>o.k==='gate'&&o.ok&&o.stand)],
  ['Agrega asientos y baños en la sala',()=>G.objs.some(o=>o.k==='bench'&&o.ok)&&G.objs.some(o=>o.k==='wc'&&o.ok)],
  ['Coloca la recogida de equipaje: espalda en la sala estéril, frente al hall de llegadas (verde)',()=>G.objs.some(o=>o.k==='claim'&&o.ok)],
  ['Firma tu primer contrato en la pestaña Contratos',()=>G.contracts.length>0],
  ['Atiende tu primer vuelo completo',()=>G.stats.ontime+G.stats.late>0]
];

/* ---------- ciclo ---------- */
function step(dt){ // dt en segundos reales ya multiplicados por la velocidad
  const dtg=dt*MIN_PER_S;G.t+=dtg;
  updFlights(dt);
  for(const p of G.planes)updPlane(p,dt);
  updObjs(dt);updPorters(dt);updNpc(dt);updTraffic(dt,dtg);updFbo(dt,dtg);
  for(const p of G.pax)if(!p.gone)updPax(p,dt);
  if(G.pax.some(p=>p.gone))G.pax=G.pax.filter(p=>!p.gone);
  for(const f of G.fx)f.t+=dt;G.fx=G.fx.filter(f=>f.t<f.life);
  updBusiness(dtg);
  G.alertT=(G.alertT||0)-dt;if(G.alertT<=0){G.alertT=1;computeAlerts();}
}
