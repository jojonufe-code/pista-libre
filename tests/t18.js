const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl']});
const p=await b.newPage({viewport:{width:1300,height:850}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split('\n').slice(1,3).join(' ')));p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text())});
await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync('lib/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/OrbitControls\.js/,r=>r.fulfill({body:fs.readFileSync('lib/node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'application/javascript'}));
await p.route(/fonts\.googleapis/,r=>r.fulfill({body:'',contentType:'text/css'}));
await p.goto('file://'+process.cwd()+'/pista-libre-v2.html');await p.waitForTimeout(2000);await p.evaluate(()=>document.getElementById('bNew').click());await p.waitForTimeout(1200);
const r=await p.evaluate(()=>{const P=window.PL,G=P.G;G.money=5e6;G.star=2;const out=[];const L=(n,x)=>out.push(n+':'+(x&&x.why||(x&&x.ok?'ok':String(x))));
 [46,49].forEach(x=>L('ci',P.placeObj('checkin',x,31,0)));
 L('sec',P.placeObj('security',54,26,0));L('claim',P.placeObj('claim',60,26,0));
 L('g1',P.placeObj('gate',49,17,0));L('g2',P.placeObj('gate',58,17,0));
 L('s1',P.placeObj('standS',45,4,0));L('s2',P.placeObj('standS',56,4,0));
 [[46,20],[50,20],[54,20]].forEach(([x,y])=>L('b',P.placeObj('bench',x,y,0)));
 L('wc',P.placeObj('wc',62,18,0));L('food',P.placeObj('food',50,23,0));
 L('pasBad',P.placeObj('pasillo',66,20,0));L('pas',P.placeObj('pasillo',65,16,0));
 const st=G.objs.find(o=>o.k==='standS');L('br',{ok:P.buildBridge(st)});
 G.offers.forEach(o=>P.acceptOffer(o.id));
 return {out,objs:G.objs.map(o=>o.k+':'+(o.ok?'ok':o.why))};});
console.log(JSON.stringify(r));
// simular por tramos dejando que renderice
let maxPM={},stats;
for(let k=0;k<40;k++){stats=await p.evaluate(()=>{const P=window.PL,G=P.G;for(let i=0;i<900;i++)P.step(0.05);if(G.offers.length)G.offers.forEach(o=>P.acceptOffer(o.id));
   const pc=G.pax.filter(q=>!q.dep).length;const corr=G.pax.filter(q=>q.corr).length;const el=G.pax.filter(q=>q.el>0).length;return {t:Math.round(G.t),pax:G.pax.length,arr:pc,corr,el,npc:G.npc.length,veh:G.veh.length,gse:P.gse(),st:G.stats,rat:Math.round(G.rating)};});
  await p.waitForTimeout(150);const pm=await p.evaluate(()=>window.PL.pm());for(const k in pm){maxPM[k]=Math.max(maxPM[k]||0,pm[k][0]);maxPM[k+'_cap']=pm[k][1];}
  if(k%8==0)console.log(JSON.stringify(stats));}
console.log(JSON.stringify(stats));console.log('PM',JSON.stringify(maxPM));
console.log('ERR',errs.slice(0,8));await b.close();})();
