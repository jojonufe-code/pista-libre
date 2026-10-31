const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl']});
const p=await b.newPage({viewport:{width:600,height:400}});await p.addInitScript((sd)=>{let a=sd;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};},+process.argv[2]);const errs=[];p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split('\n').slice(1,3).join(' ')));p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text())});
await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync('lib/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/OrbitControls\.js/,r=>r.fulfill({body:fs.readFileSync('lib/node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'application/javascript'}));
await p.route(/fonts\.googleapis/,r=>r.fulfill({body:'',contentType:'text/css'}));
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(2000);await p.evaluate(()=>{let a=4242;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};const r0=Math.random;document.getElementById('bNew').click();window.PL.setSpeed(0);let b=777;window.__rs=()=>{Math.random=function(){b|=0;b=b+0x6D2B79F5|0;let t=Math.imul(b^b>>>15,1|b);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};});await p.waitForTimeout(1200);
const r=await p.evaluate(()=>{window.__rs();const P=window.PL,G=P.G;G.money=3e6;const out=[];const L=(x)=>out.push(x&&x.why||(x&&x.ok?'ok':String(x)));
 [46,49].forEach(x=>L(P.placeObj('checkin',x,31,0)));
 L(P.placeObj('security',54,26,0));L(P.placeObj('claim',60,26,0));
 L(P.placeObj('gate',49,17,0));L(P.placeObj('gate',58,17,0));
 L(P.placeObj('standS',45,4,0));L(P.placeObj('standS',56,4,0));
 [[46,20],[50,20],[54,20]].forEach(([x,y])=>L(P.placeObj('bench',x,y,0)));
 L(P.placeObj('wc',62,18,0));L(P.placeObj('food',50,23,0));
 if(window.BR){const st=G.objs.find(o=>o.k==='standS');L(P.buildBridge(st));}
 G.offers.forEach(o=>P.acceptOffer(o.id));
 return {out,objs:G.objs.map(o=>o.k+(o.lv>1?'@'+o.lv:'')+(o.bridge?'B':'')+':'+(o.ok?'ok':o.why)),lot:G.lot,exits:window.PL.G.up};});
console.log(JSON.stringify(r));
console.log(JSON.stringify(await p.evaluate(()=>{const P=window.PL,G=P.G;const all=[];const bl=[];for(let i=0;i<36000;i++){P.step(0.05);G.flights.forEach(f=>{if(!all.includes(f))all.push(f);});
  if(i%200==0){const b=G.veh.filter(v=>v.type==='bus'&&v.line==='dep');if(b.length||G.busQ.dep.length)bl.push(Math.round(G.t)+':Q'+G.busQ.dep.length+':'+b.map(v=>Math.round(v.x)+','+Math.round(v.z)+','+v.state+(v.ab?'ab':'')+(v.loop?'L':'')+',sp'+Math.round(v.sp)+(v.bay!=null?',bay'+v.bay:'')+',want'+v.want).join(';'));}}
  return {st:G.stats,fl:all.filter(f=>f.delay!==undefined).map(f=>[f.num,f.boarded+'/'+f.dep,f.missed]),bl:bl.slice(0,80)};})));
console.log('ERR',errs.slice(0,8));await b.close();})();
