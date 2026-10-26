const {chromium}=require('playwright');const fs=require('fs');
const Q=process.env.Q||'2',MOB=!!process.env.MOB;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage(MOB?{viewport:{width:412,height:860},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1300,height:820}});
await p.addInitScript((q)=>{try{if(q!=='auto')localStorage.setItem('pl_gfx',q);localStorage.setItem('pl_wx','clear');}catch(e){}let a=4242;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};},Q);
const errs=[];p.on('pageerror',e=>errs.push(e.message+' | '+(e.stack||'').split('\n').slice(1,4).join(' ')));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push('C:'+m.text().slice(0,300))});
await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync('lib/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/OrbitControls\.js/,r=>r.fulfill({body:fs.readFileSync('lib/node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'application/javascript'}));
await p.route(/fonts\.googleapis/,r=>r.fulfill({body:'',contentType:'text/css'}));
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(2000);await p.evaluate(()=>document.getElementById('bNew').click());await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const P=window.PL,G=P.G;G.money=9e6;G.star=4;const out=[];
 P.expandTerm(-1);P.expandTerm(1);[38,41,44,47].forEach(x=>P.placeObj('checkin',x,31,0));P.placeObj('security',50,26,0);P.placeObj('claim',62,26,0);
 P.placeObj('gate',42,19,0);P.placeObj('gate',52,19,0);P.placeObj('gate',66,19,0);P.placeObj('standL',36,0,0);P.placeObj('standL',53,0,0);P.placeObj('standM',70,2,0);
 [[40,22],[44,22],[48,22]].forEach(([x,y])=>P.placeObj('bench',x,y,0));P.placeObj('food',46,26,0);
 ['fboBase','fboStands','fboRwy','fboLounge'].forEach(k=>out.push(k+':'+P.buyFbo(k)));P.setSpeed(0);return out.join(' ')+' gfx='+JSON.stringify(P.gfx());});
console.log(r);
for(let k=0;k<14;k++){await p.evaluate(()=>{const P=window.PL,G=P.G;for(let i=0;i<500;i++)P.step(0.05);if(G.offers.length)G.offers.forEach(o=>P.acceptOffer(o.id));});await p.waitForTimeout(60);}
const shot=async(n,fn)=>{await p.evaluate(fn);await p.waitForTimeout(900);await p.screenshot({path:n});const i=await p.evaluate(()=>({...window.PL.info(),...window.PL.gfx(),t:Math.round(window.PL.G.t)}));console.log(n,JSON.stringify(i));};
const cam=(x,y,z,tx,tz)=>`(()=>{const P=window.PL;P.controls.target.set(${tx},0,${tz});P.camera.position.set(${x},${y},${z});P.controls.update();})()`;
await shot('g1_day.png',()=>{const P=window.PL;P.G.t=Math.floor(P.G.t/1440)*1440+11*60;P.setSpeed(1);});
await p.evaluate(cam(520,260,520,450,180));await p.waitForTimeout(700);await p.screenshot({path:'g2_term.png'});
await p.evaluate(cam(380,40,250,430,215));await p.waitForTimeout(700);await p.screenshot({path:'g3_floor.png'});console.log('floor',JSON.stringify(await p.evaluate(()=>window.PL.gfx())));
await p.evaluate(()=>{window.PL.setWeather('rain');window.PL.WX.r=0.95;window.PL.WX.wet=1;});
await p.evaluate(cam(700,120,60,560,-150));await p.waitForTimeout(1200);await p.screenshot({path:'g4_rain.png'});console.log('rain',JSON.stringify(await p.evaluate(()=>({...window.PL.gfx(),...window.PL.info()}))));
await p.evaluate(()=>{const G=window.PL.G;G.t=Math.floor(G.t/1440)*1440+21*60;});await p.waitForTimeout(1200);await p.screenshot({path:'g5_rainnight.png'});
await p.evaluate(()=>{window.PL.setWeather('clear');window.PL.WX.r=0;window.PL.WX.wet=0;const G=window.PL.G;G.t=Math.floor(G.t/1440)*1440+22*60;});
await p.evaluate(cam(400,420,700,400,100));await p.waitForTimeout(1200);await p.screenshot({path:'g6_night.png'});
await p.evaluate(()=>{const G=window.PL.G;G.t=Math.floor(G.t/1440)*1440+18*60+35;});await p.waitForTimeout(1200);await p.screenshot({path:'g7_dusk.png'});
await p.evaluate(()=>{const G=window.PL.G;G.t=Math.floor(G.t/1440)*1440+12*60;window.PL.setSpeed(2);window.PL.cineStart();});
for(let k=0;k<6;k++){await p.waitForTimeout(2500);await p.screenshot({path:'g8_cine'+k+'.png'});console.log('cine',JSON.stringify(await p.evaluate(()=>window.PL.gfx())));}
await p.evaluate(()=>window.PL.cineStop());
// stress: run long with rain to check particles/rubber
await p.evaluate(()=>{window.PL.setWeather('rain');});
for(let k=0;k<10;k++){await p.evaluate(()=>{const P=window.PL;for(let i=0;i<300;i++)P.step(0.05);});await p.waitForTimeout(150);}
console.log('end',JSON.stringify(await p.evaluate(()=>({...window.PL.gfx(),...window.PL.info(),st:window.PL.G.stats}))));
for(const q of [0,1,2]){await p.evaluate(q=>window.PL.setQ(q,true),q);await p.waitForTimeout(800);}
console.log('ERR',errs.slice(0,12));await b.close();})();
