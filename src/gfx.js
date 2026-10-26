/* ================= GRÁFICOS AVANZADOS: postproceso, clima, reflejos, FX y cámara cine ================= */
const GFX={q:1,user:false,calls:0,extra:0,fr:0,perf:{t:0,n:0,s:0,done:false},last:performance.now(),rt:0};
{let q=null;try{q=localStorage.getItem('pl_gfx');}catch(e){}const coarse=!!(window.matchMedia&&(matchMedia('(pointer:coarse)').matches||matchMedia('(any-pointer:coarse)').matches))||(navigator.maxTouchPoints>1&&/Android|iPad|Tablet|Mobile|Macintosh/i.test(navigator.userAgent));
 if(q!==null&&q!==''&&!isNaN(+q)){GFX.q=clamp(+q,0,2);GFX.user=true;}else GFX.q=coarse?0:1;}
const GQN=['Baja','Alta','Ultra'];
const GRr=rng(31337),RG=(a,b)=>a+GRr()*(b-a); // azar propio: los efectos no alteran la simulación

/* ---- ruido tileable (nubes, charcos, ondas) ---- */
const NOISET=(()=>{const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,N,N);
  const rr=rng(77);for(let i=0;i<120;i++){const px=rr()*N,py=rr()*N,r=8+rr()*52,a=0.06+rr()*0.2;
    for(const ox of [-N,0,N])for(const oy of [-N,0,N]){const g=x.createRadialGradient(px+ox,py+oy,0,px+ox,py+oy,r);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(px+ox-r,py+oy-r,2*r,2*r);}}
  const d=x.getImageData(0,0,N,N),p=d.data;let mn=255,mx=0;for(let i=0;i<p.length;i+=4){mn=Math.min(mn,p[i]);mx=Math.max(mx,p[i]);}
  const k=255/Math.max(1,mx-mn);for(let i=0;i<p.length;i+=4){const v=(p[i]-mn)*k;p[i]=p[i+1]=p[i+2]=v;p[i+3]=255;}x.putImageData(d,0,0);
  const t=new TH.CanvasTexture(c);t.wrapS=t.wrapT=TH.RepeatWrapping;return t;})();

/* ---- uniformes compartidos por todos los materiales estándar ---- */
const GU={uCl:{value:0.2},uClTex:{value:NOISET},uClOff:{value:new TH.Vector2()},uWet:{value:0},uT:{value:0},
  uRefl:{value:null},uRM:{value:new TH.Matrix4()},uRon:{value:0},uFloor:{value:1}};
const GP_HEAD='uniform float uCl;uniform sampler2D uClTex;uniform vec2 uClOff;uniform float uWet;uniform float uT;uniform sampler2D uRefl;uniform mat4 uRM;uniform float uRon;uniform float uFloor;\n';
const GP_PRE=`
vec3 gWP=(-vViewPosition-viewMatrix[3].xyz)*mat3(viewMatrix);
vec3 gWN=normalize(normal*mat3(viewMatrix));
#ifndef GFX_NOWET
float gWet=uWet*smoothstep(0.55,0.9,gWN.y);
diffuseColor.rgb*=1.0-0.2*gWet;
roughnessFactor=mix(roughnessFactor,roughnessFactor*0.45+0.04,gWet);
#endif
#ifdef GFX_GROUND
float gRg=1.0;
#ifdef USE_ROUGHNESSMAP
gRg=texelRoughness.g;
#endif
float gIn=1.0-smoothstep(0.45,0.6,gRg);
float gPv=smoothstep(0.93,0.86,gRg)*(1.0-gIn);
float gPn=texture2D(uClTex,gWP.xz*0.0105).r*0.6+texture2D(uClTex,gWP.xz*0.031+0.37).r*0.4;
float gPd=smoothstep(0.55,0.68,gPn)*gPv*smoothstep(0.3,0.85,uWet);
roughnessFactor=mix(roughnessFactor,0.16,uWet*gPv*0.8);
roughnessFactor=mix(roughnessFactor,0.03,gPd);
roughnessFactor=mix(roughnessFactor,roughnessFactor*0.5,gIn*uFloor);
diffuseColor.rgb*=1.0-0.25*uWet*gPv-0.2*gPd;
#endif
`;
const GP_POST=`
float gCs=1.0-uCl*0.6*smoothstep(0.4,0.75,texture2D(uClTex,gWP.xz*0.00042+uClOff).r);
reflectedLight.directDiffuse*=gCs;reflectedLight.directSpecular*=gCs;
`;
const GP_GROUND=`
{float gFr=0.04+0.96*pow(1.0-clamp(dot(normal,normalize(vViewPosition)),0.0,1.0),5.0);
 float kW=uWet*gPv*(0.10+0.5*gFr)+gPd*(0.2+0.45*gFr);
 float kF=gIn*uFloor*(0.05+0.3*gFr);
 float gK=clamp((kW+kF)*uRon,0.0,0.9);
 if(gK>0.003){vec4 ru=uRM*vec4(gWP,1.0);vec2 uv=ru.xy/ru.w;
  vec2 rp=vec2(texture2D(uClTex,gWP.xz*0.09+vec2(uT*0.07,0.0)).r,texture2D(uClTex,gWP.zx*0.09+vec2(0.0,uT*0.05)).r)-0.5;
  uv+=rp*0.012*uWet*(1.0-gIn)*(1.0-0.5*gPd);
  float bl=0.003*(1.0-gPd)*(1.0-gIn)+0.0007;
  vec3 rc=sRGBToLinear(texture2D(uRefl,uv)).rgb*0.4+sRGBToLinear(texture2D(uRefl,uv+vec2(bl,0.0))).rgb*0.2+sRGBToLinear(texture2D(uRefl,uv-vec2(bl,0.0))).rgb*0.2+sRGBToLinear(texture2D(uRefl,uv+vec2(0.0,bl*2.0))).rgb*0.2;
  reflectedLight.indirectSpecular=mix(reflectedLight.indirectSpecular,rc,gK);
  reflectedLight.directSpecular*=1.0-gK*0.5;}
 float dk=1.0-0.32*uWet*gPv-0.22*gPd-0.12*uWet*(1.0-gPv)*(1.0-gIn);
 reflectedLight.directDiffuse*=dk;reflectedLight.indirectDiffuse*=dk;}
`;
function gfxPatch(sh,defs){
  for(const k in GU)sh.uniforms[k]=GU[k];
  let f=sh.fragmentShader;
  f=(defs||'')+f.replace('#include <common>','#include <common>\n'+GP_HEAD);
  f=f.replace('#include <lights_physical_fragment>',GP_PRE+'#include <lights_physical_fragment>');
  f=f.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+GP_POST);
  if(defs&&defs.indexOf('GFX_GROUND')>=0)f=f.replace('#include <aomap_fragment>','#include <aomap_fragment>\n'+GP_GROUND);
  if(defs&&defs.indexOf('GFX_GLASS')>=0)f=f.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
    'float gF=pow(1.0-clamp(dot(normalize(vViewPosition),normal),0.0,1.0),3.0);gl_FragColor=vec4(outgoingLight,clamp(diffuseColor.a+gF*0.55+0.25*dot(reflectedLight.indirectSpecular,vec3(0.33)),0.0,0.94));');
  sh.fragmentShader=f;}
TH.MeshStandardMaterial.prototype.onBeforeCompile=function(sh){gfxPatch(sh,'');};
groundM.material.onBeforeCompile=function(sh){gfxPatch(sh,'#define GFX_GROUND\n#define GFX_NOWET\n');};
GLASS.onBeforeCompile=function(sh){gfxPatch(sh,'#define GFX_GLASS\n#define GFX_NOWET\n');};
GLASS.envMapIntensity=1.25;

/* ---- posproceso propio: bloom HDR + gradación + sRGB ---- */
const PP={ok:false,tried:false,rt:null,lv:[],w:0,h:0};
const FSCAM=new TH.OrthographicCamera(-1,1,1,-1,0,1),FSQ=new TH.Mesh(new TH.PlaneGeometry(2,2),null),FSS=new TH.Scene();FSQ.frustumCulled=false;FSS.add(FSQ);
const FSV='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
const ppBright=new TH.ShaderMaterial({uniforms:{tD:{value:null},uTh:{value:1},uK:{value:0.35}},vertexShader:FSV,depthTest:false,depthWrite:false,
  fragmentShader:'uniform sampler2D tD;uniform float uTh;uniform float uK;varying vec2 vUv;void main(){vec3 c=min(texture2D(tD,vUv).rgb,vec3(12.0));float l=dot(c,vec3(0.2126,0.7152,0.0722));gl_FragColor=vec4(c*smoothstep(uTh,uTh+uK,l),1.0);}'});
const ppBlur=new TH.ShaderMaterial({uniforms:{tD:{value:null},uDir:{value:new TH.Vector2()}},vertexShader:FSV,depthTest:false,depthWrite:false,
  fragmentShader:'uniform sampler2D tD;uniform vec2 uDir;varying vec2 vUv;void main(){vec3 c=texture2D(tD,vUv).rgb*0.2270270;c+=(texture2D(tD,vUv+uDir*1.3846154).rgb+texture2D(tD,vUv-uDir*1.3846154).rgb)*0.3162162;c+=(texture2D(tD,vUv+uDir*3.2307692).rgb+texture2D(tD,vUv-uDir*3.2307692).rgb)*0.0702703;gl_FragColor=vec4(c,1.0);}'});
const ppFinal=new TH.ShaderMaterial({uniforms:{tS:{value:null},b0:{value:null},b1:{value:null},b2:{value:null},b3:{value:null},b4:{value:null},uStr:{value:0.4},uSat:{value:1.06},uVig:{value:0.18},uTint:{value:new TH.Vector3(1,1,1)}},vertexShader:FSV,depthTest:false,depthWrite:false,
  fragmentShader:'uniform sampler2D tS,b0,b1,b2,b3,b4;uniform float uStr,uSat,uVig;uniform vec3 uTint;varying vec2 vUv;void main(){vec3 c=texture2D(tS,vUv).rgb;'+
  'vec3 b=texture2D(b0,vUv).rgb*1.0+texture2D(b1,vUv).rgb*0.85+texture2D(b2,vUv).rgb*0.7+texture2D(b3,vUv).rgb*0.55+texture2D(b4,vUv).rgb*0.45;b*=0.2817;'+
  'c=c+b*uStr;c=min(c,vec3(1.6));c=c/(1.0+max(vec3(0.0),c-vec3(0.92))*0.9);float l=dot(c,vec3(0.2126,0.7152,0.0722));c=mix(vec3(l),c,uSat)*uTint;'+
  'vec2 q=vUv-0.5;c*=1.0-uVig*dot(q,q)*2.2;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}'});
function ppSize(){const v=renderer.getDrawingBufferSize(new TH.Vector2());return[Math.max(2,v.x|0),Math.max(2,v.y|0)];}
function ppInit(){PP.tried=true;try{
  const [w,h]=ppSize(),gl2=renderer.capabilities.isWebGL2,hf=gl2&&renderer.extensions.has('EXT_color_buffer_float')?TH.HalfFloatType:TH.UnsignedByteType;
  const o={type:hf,format:TH.RGBAFormat,minFilter:TH.LinearFilter,magFilter:TH.LinearFilter,encoding:TH.sRGBEncoding,stencilBuffer:true};
  PP.rt=gl2?new TH.WebGLMultisampleRenderTarget(w,h,o):new TH.WebGLRenderTarget(w,h,o);if(gl2)PP.rt.samples=4;PP.rt.texture.encoding=TH.sRGBEncoding;
  PP.lv=[];for(let i=0;i<5;i++){const s=2<<i,lw=Math.max(1,Math.round(w/s)),lh=Math.max(1,Math.round(h/s)),oo={type:hf,format:TH.RGBAFormat,minFilter:TH.LinearFilter,magFilter:TH.LinearFilter,depthBuffer:false};
    PP.lv.push([new TH.WebGLRenderTarget(lw,lh,oo),new TH.WebGLRenderTarget(lw,lh,oo)]);}
  PP.w=w;PP.h=h;PP.ok=true;}catch(e){console.warn('posproceso no disponible',e);PP.ok=false;}}
function ppResize(){if(!PP.ok)return;const [w,h]=ppSize();if(w===PP.w&&h===PP.h)return;PP.w=w;PP.h=h;PP.rt.setSize(w,h);PP.lv.forEach((l,i)=>{const s=2<<i;l[0].setSize(Math.max(1,Math.round(w/s)),Math.max(1,Math.round(h/s)));l[1].setSize(Math.max(1,Math.round(w/s)),Math.max(1,Math.round(h/s)));});}
function fsPass(m,target){FSQ.material=m;renderer.setRenderTarget(target);renderer.render(FSS,FSCAM);}
function ppPost(n){
  ppBright.uniforms.tD.value=PP.rt.texture;ppBright.uniforms.uTh.value=lerp(1.0,0.8,n)-WX.r*0.05;fsPass(ppBright,PP.lv[0][1]);
  let src=PP.lv[0][1].texture;
  for(let i=0;i<PP.lv.length;i++){const [a,b]=PP.lv[i];const lw=a.width,lh=a.height;
    ppBlur.uniforms.tD.value=src;ppBlur.uniforms.uDir.value.set(1/lw,0);fsPass(ppBlur,a);
    ppBlur.uniforms.tD.value=a.texture;ppBlur.uniforms.uDir.value.set(0,1/lh);fsPass(ppBlur,b);src=b.texture;}
  const u=ppFinal.uniforms;u.tS.value=PP.rt.texture;['b0','b1','b2','b3','b4'].forEach((k,i)=>u[k].value=PP.lv[i][1].texture);
  u.uStr.value=0.55+n*0.5+WX.r*0.3;u.uSat.value=1.07-WX.r*0.12;u.uVig.value=0.16+n*0.1;
  const dk=duskAmt();u.uTint.value.set(1+dk*0.04,1,1-dk*0.05-WX.r*0.0).multiplyScalar(1);
  fsPass(ppFinal,null);}
function duskAmt(){const h=(G.t/60)%24;return (h>17.5&&h<19.8)||(h>5.2&&h<7)?clamp(1-Math.min(1,Math.abs(h<12?h-6.1:h-18.6)/0.9),0,1):0;}

/* ---- reflejo plano (suelo mojado, charcos y pisos pulidos) ---- */
const MIR={rt:null,cam:new TH.PerspectiveCamera(),w:0,h:0,on:false};
function mirSize(){const [w,h]=ppSize(),k=GFX.q>=2?0.6:0.5;return[Math.max(2,Math.round(w*k)),Math.max(2,Math.round(h*k))];}
function mirrorPass(){const [w,h]=mirSize();
  if(!MIR.rt){MIR.rt=new TH.WebGLRenderTarget(w,h,{minFilter:TH.LinearFilter,magFilter:TH.LinearFilter,format:TH.RGBAFormat,encoding:TH.sRGBEncoding,stencilBuffer:true});MIR.rt.texture.encoding=TH.sRGBEncoding;GU.uRefl.value=MIR.rt.texture;}
  else if(MIR.rt.width!==w||MIR.rt.height!==h)MIR.rt.setSize(w,h);
  const cam=camera,vc=MIR.cam,N=_mN.set(0,1,0),P0=_mP.set(0,0.05,0);
  camera.updateMatrixWorld();const cp=_mC.setFromMatrixPosition(cam.matrixWorld);if(cp.y<=0.3)return false;
  const view=_mV.subVectors(P0,cp);view.reflect(N).negate();view.add(P0);
  _mR.extractRotation(cam.matrixWorld);const look=_mL.set(0,0,-1).applyMatrix4(_mR).add(cp);const tg=_mT.subVectors(P0,look);tg.reflect(N).negate();tg.add(P0);
  vc.position.copy(view);vc.up.set(0,1,0).applyMatrix4(_mR).reflect(N);vc.lookAt(tg);vc.far=cam.far;vc.near=cam.near;vc.updateMatrixWorld();vc.projectionMatrix.copy(cam.projectionMatrix);
  GU.uRM.value.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);GU.uRM.value.multiply(vc.projectionMatrix);GU.uRM.value.multiply(vc.matrixWorldInverse);
  const pl=_mPl.setFromNormalAndCoplanarPoint(N,P0);pl.applyMatrix4(vc.matrixWorldInverse);const cl=_mQ4.set(pl.normal.x,pl.normal.y,pl.normal.z,pl.constant);
  const pm=vc.projectionMatrix,q=_mQ;q.x=(Math.sign(cl.x)+pm.elements[8])/pm.elements[0];q.y=(Math.sign(cl.y)+pm.elements[9])/pm.elements[5];q.z=-1;q.w=(1+pm.elements[10])/pm.elements[14];
  cl.multiplyScalar(2/cl.dot(q));pm.elements[2]=cl.x;pm.elements[6]=cl.y;pm.elements[10]=cl.z+1-0.003;pm.elements[14]=cl.w;
  const hide=[groundM,RAINM,SPLM];const vis=hide.map(o=>o&&o.visible);hide.forEach(o=>{if(o)o.visible=false;});
  renderer.setRenderTarget(MIR.rt);renderer.clear();renderer.render(scene,vc);GFX.extra+=renderer.info.render.calls;
  hide.forEach((o,i)=>{if(o)o.visible=vis[i];});return true;}
const _mN=new TH.Vector3(),_mP=new TH.Vector3(),_mC=new TH.Vector3(),_mV=new TH.Vector3(),_mL=new TH.Vector3(),_mT=new TH.Vector3(),_mR=new TH.Matrix4(),_mPl=new TH.Plane(),_mQ4=new TH.Vector4(),_mQ=new TH.Vector4();

/* ---- cubo dinámico: las fachadas de vidrio reflejan cielo, aviones y entorno ---- */
const CUBE={rt:null,cam:null,face:0,size:0};
function cubeEnsure(){const sz=GFX.q>=2?256:128;if(CUBE.rt&&CUBE.size===sz)return;
  if(CUBE.rt)CUBE.rt.dispose();CUBE.size=sz;CUBE.rt=new TH.WebGLCubeRenderTarget(sz,{format:TH.RGBAFormat,generateMipmaps:false,minFilter:TH.LinearFilter,magFilter:TH.LinearFilter,encoding:TH.sRGBEncoding,stencilBuffer:true});CUBE.rt.texture.encoding=TH.sRGBEncoding;
  CUBE.cam=new TH.CubeCamera(1,12000,CUBE.rt);GLASS.envMap=CUBE.rt.texture;GLASS.needsUpdate=true;CUBE.face=0;}
function cubeDrop(){if(!CUBE.rt)return;GLASS.envMap=null;GLASS.needsUpdate=true;CUBE.rt.dispose();CUBE.rt=null;CUBE.size=0;}
function cubeFace(){cubeEnsure();const c=CUBE.cam;if(CUBE.face===0){const t=controls.target;c.position.set(t.x,16,t.z);c.updateMatrixWorld(true);}
  const cam=c.children[CUBE.face];GLASS.visible=false;const rv=RAINM&&RAINM.visible;if(RAINM)RAINM.visible=false;
  renderer.setRenderTarget(CUBE.rt,CUBE.face);renderer.render(scene,cam);GFX.extra+=renderer.info.render.calls;GLASS.visible=true;if(RAINM)RAINM.visible=rv;CUBE.face=(CUBE.face+1)%6;}

/* ---- clima ---- */
const WX={r:0,tgt:0,mode:'auto',next:-1,wet:0,flash:0,fT:8};
try{const m=localStorage.getItem('pl_wx');if(m==='rain'||m==='clear'||m==='auto')WX.mode=m;}catch(e){}
function updWeather(rdt,gdt){
  if(WX.next<0||WX.next-G.t>3000||G.t-WX.next>3000)WX.next=G.t+RG(90,360);
  if(WX.mode==='auto'){if(G.t>=WX.next){if(WX.tgt>0){WX.tgt=0;WX.next=G.t+RG(300,900);}else{WX.tgt=GRr()<0.55?RG(0.35,0.7):RG(0.75,1);WX.next=G.t+RG(45,150);}}}
  else WX.tgt=WX.mode==='rain'?0.9:0;
  WX.r+=(WX.tgt-WX.r)*Math.min(1,rdt*0.18);if(Math.abs(WX.r-WX.tgt)<0.002)WX.r=WX.tgt;
  if(WX.r>0.08)WX.wet=Math.min(1,WX.wet+Math.max(gdt/9,rdt*0.06)*WX.r);else WX.wet=Math.max(0,WX.wet-gdt/110);
  WX.fT-=rdt;if(WX.r>0.85&&WX.fT<=0){WX.flash=1;WX.fT=RG(16,40);}WX.flash=Math.max(0,WX.flash-rdt*3);
  if(typeof AMB!=='undefined'&&AMB&&AC){try{AMB.rain.gain.setTargetAtTime(G.sound?WX.r*0.2:0,AC.currentTime,0.4);AMB.wind.gain.setTargetAtTime(G.sound?0.03+WX.r*0.08:0,AC.currentTime,0.6);}catch(e){}}}
function setWeather(m){WX.mode=m;try{localStorage.setItem('pl_wx',m);}catch(e){}if(m==='auto')WX.next=G.t+RG(30,200);}

/* ---- lluvia en GPU: gotas ancladas al mundo alrededor de la cámara ---- */
const VTX=renderer.capabilities.maxVertexTextures>0;
const SITEU={value:new TH.Vector4(SITE.x0,SITE.z0,SITE.w,SITE.h)};
const RAIN_SZ=760;
const RAINU={uC:{value:new TH.Vector3()},uT:{value:0},uH:{value:420},uAmt:{value:0},uCol:{value:new TH.Color(0xc8d8ec)},uOp:{value:0.4},uMask:{value:rtex},uSite:SITEU};
let RAINM=null,SPLM=null;
{const N=5200,pos=new Float32Array(N*6),ar=new Float32Array(N*8),ae=new Float32Array(N*2);
 for(let i=0;i<N;i++){const a=[GRr(),GRr(),GRr(),GRr()];ar.set(a,i*8);ar.set(a,i*8+4);ae[i*2]=0;ae[i*2+1]=1;}
 const g=new TH.BufferGeometry();g.setAttribute('position',new TH.BufferAttribute(pos,3));g.setAttribute('aR',new TH.BufferAttribute(ar,4));g.setAttribute('aE',new TH.BufferAttribute(ae,1));
 RAINM=new TH.LineSegments(g,new TH.ShaderMaterial({uniforms:RAINU,transparent:true,depthWrite:false,fog:false,defines:VTX?{USE_MASK:''}:{},
  vertexShader:`attribute vec4 aR;attribute float aE;uniform vec3 uC;uniform float uT,uH,uAmt;uniform vec4 uSite;uniform sampler2D uMask;varying float vA;
  void main(){float S=${RAIN_SZ.toFixed(1)};vec3 p;p.x=uC.x-S*0.5+fract(aR.x-uC.x/S)*S;p.z=uC.z-S*0.5+fract(aR.z-uC.z/S)*S;
   float sp=0.55+aR.w*0.25;p.y=fract(aR.y-uT*sp)*uH;float len=7.0+aR.w*6.0;p.y-=aE*len;p.x-=aE*len*0.18;
   vA=(1.0-aE*0.7)*step(aR.w,uAmt);
   #ifdef USE_MASK
   vec2 mu=(p.xz-uSite.xy)/uSite.zw;if(mu.x>0.0&&mu.x<1.0&&mu.y>0.0&&mu.y<1.0){if(texture2D(uMask,vec2(mu.x,1.0-mu.y)).g<0.55)vA=0.0;}
   #endif
   gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);if(vA<0.01)gl_Position=vec4(2.0,2.0,2.0,1.0);}`,
  fragmentShader:'uniform vec3 uCol;uniform float uOp;varying float vA;void main(){gl_FragColor=vec4(uCol,uOp*vA);}'}));
 RAINM.frustumCulled=false;RAINM.visible=false;RAINM.renderOrder=5;scene.add(RAINM);}
/* salpicaduras en el suelo y ondas en el agua */
const SPLU={uC:{value:new TH.Vector3()},uT:{value:0},uAmt:{value:0},uCol:{value:new TH.Color(0xdfe9f2)},uOp:{value:0.5},uMask:{value:rtex},uSite:SITEU};
{const NS=1400,base=new TH.PlaneGeometry(1,1);base.rotateX(-Math.PI/2);const ig=new TH.InstancedBufferGeometry();ig.index=base.index;ig.setAttribute('position',base.attributes.position);ig.setAttribute('uv',base.attributes.uv);
 const ar=new Float32Array(NS*4);for(let i=0;i<NS*4;i++)ar[i]=GRr();ig.setAttribute('aR',new TH.InstancedBufferAttribute(ar,4));ig.instanceCount=NS;
 SPLM=new TH.Mesh(ig,new TH.ShaderMaterial({uniforms:SPLU,transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,
  vertexShader:`attribute vec4 aR;uniform vec3 uC;uniform float uT,uAmt;varying float vA;varying vec2 vUv;varying vec2 vW;
  void main(){float S=420.0;float cyc=uT*1.7+aR.z;float f=fract(cyc);float k=floor(cyc);
   vec2 j=fract(vec2(k*0.6180339,k*0.4142135)+aR.xy*7.31)-0.5;
   vec2 w=uC.xz-S*0.5+fract(aR.xy+j*0.15-uC.xz/S)*S;
   float rad=(0.35+aR.w*0.9)*(0.25+f*1.1);vec3 p=vec3(w.x+position.x*rad*2.0,0.32,w.y+position.z*rad*2.0);
   vA=(1.0-f)*step(aR.w,uAmt);vUv=uv;vW=w;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);}`,
  fragmentShader:`uniform vec3 uCol;uniform float uOp;uniform sampler2D uMask;uniform vec4 uSite;varying float vA;varying vec2 vUv;varying vec2 vW;
  void main(){float d=length(vUv-0.5)*2.0;float a=smoothstep(0.62,0.85,d)*smoothstep(1.0,0.9,d)*vA*uOp;
   vec2 mu=(vW-uSite.xy)/uSite.zw;if(mu.x>0.0&&mu.x<1.0&&mu.y>0.0&&mu.y<1.0){if(texture2D(uMask,vec2(mu.x,1.0-mu.y)).g<0.55)discard;}
   if(a<0.01)discard;gl_FragColor=vec4(uCol,a);}`}));
 SPLM.frustumCulled=false;SPLM.visible=false;SPLM.renderOrder=4;scene.add(SPLM);}

/* ---- partículas: rocío, humo de neumáticos, calor de motores, vapor en puntas de ala ---- */
const PN=2600,PT={n:0,p:new Float32Array(PN*3),v:new Float32Array(PN*3),a:new Float32Array(PN*4),c:new Float32Array(PN*4),s:new Float32Array(PN)};
// a: edad, vida, crecimiento, arrastre ; c: r,g,b,alfa0
const PGEO=new TH.BufferGeometry();const PPOS=new Float32Array(PN*3),PCOL=new Float32Array(PN*4),PSZ=new Float32Array(PN);
PGEO.setAttribute('position',new TH.BufferAttribute(PPOS,3).setUsage(TH.DynamicDrawUsage));PGEO.setAttribute('aC',new TH.BufferAttribute(PCOL,4).setUsage(TH.DynamicDrawUsage));PGEO.setAttribute('aS',new TH.BufferAttribute(PSZ,1).setUsage(TH.DynamicDrawUsage));
const PU={uScale:{value:600},uL:{value:new TH.Color(1,1,1)}};
const PTS=new TH.Points(PGEO,new TH.ShaderMaterial({uniforms:PU,transparent:true,depthWrite:false,fog:false,
  vertexShader:'attribute vec4 aC;attribute float aS;uniform float uScale;varying vec4 vC;void main(){vC=aC;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(aS*uScale/max(1.0,-mv.z),1.0,320.0);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 uL;varying vec4 vC;void main(){vec2 d=gl_PointCoord-0.5;float r=dot(d,d)*4.0;if(r>1.0)discard;float a=1.0-r;a*=a;gl_FragColor=vec4(vC.rgb*uL,vC.a*a);}'}));
PTS.frustumCulled=false;PTS.renderOrder=6;scene.add(PTS);PGEO.setDrawRange(0,0);
function emit(x,y,z,vx,vy,vz,size,grow,life,alpha,r,g,b,drag){if(PT.n>=PN)return;const i=PT.n++;
  PT.p[i*3]=x;PT.p[i*3+1]=y;PT.p[i*3+2]=z;PT.v[i*3]=vx;PT.v[i*3+1]=vy;PT.v[i*3+2]=vz;PT.a[i*4]=0;PT.a[i*4+1]=life;PT.a[i*4+2]=grow;PT.a[i*4+3]=drag||0.8;
  PT.c[i*4]=r;PT.c[i*4+1]=g;PT.c[i*4+2]=b;PT.c[i*4+3]=alpha;PT.s[i]=size;}
function updParticles(dt){let n=PT.n;const P=PT.p,V=PT.v,A=PT.a,C=PT.c,S=PT.s;
  for(let i=0;i<n;i++){A[i*4]+=dt;if(A[i*4]>=A[i*4+1]){n--;if(i!==n){for(let k=0;k<3;k++){P[i*3+k]=P[n*3+k];V[i*3+k]=V[n*3+k];}for(let k=0;k<4;k++){A[i*4+k]=A[n*4+k];C[i*4+k]=C[n*4+k];}S[i]=S[n];}i--;continue;}
    const dg=Math.max(0,1-A[i*4+3]*dt);V[i*3]*=dg;V[i*3+1]*=dg;V[i*3+2]*=dg;P[i*3]+=V[i*3]*dt;P[i*3+1]=Math.max(0.2,P[i*3+1]+V[i*3+1]*dt);P[i*3+2]+=V[i*3+2]*dt;S[i]+=A[i*4+2]*dt;}
  PT.n=n;
  for(let i=0;i<n;i++){const u=A[i*4]/A[i*4+1];PPOS[i*3]=P[i*3];PPOS[i*3+1]=P[i*3+1];PPOS[i*3+2]=P[i*3+2];PCOL[i*4]=C[i*4];PCOL[i*4+1]=C[i*4+1];PCOL[i*4+2]=C[i*4+2];PCOL[i*4+3]=C[i*4+3]*(1-u)*Math.min(1,u*8);PSZ[i]=S[i];}
  PGEO.setDrawRange(0,n);PGEO.attributes.position.needsUpdate=true;PGEO.attributes.aC.needsUpdate=true;PGEO.attributes.aS.needsUpdate=true;}

/* ---- marcas de caucho que se acumulan en la zona de toma ---- */
const RUB={x0:-120,w:1500,h:48,c:document.createElement('canvas'),day:-1,n:0};RUB.c.width=2048;RUB.c.height=64;
const RUBT=new TH.CanvasTexture(RUB.c);RUBT.anisotropy=8;
const RUBM=new TH.Mesh(new TH.PlaneGeometry(RUB.w,RUB.h),new TH.MeshBasicMaterial({map:RUBT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-8,opacity:0.9}));
RUBM.rotation.x=-Math.PI/2;RUBM.position.set(RUB.x0+RUB.w/2,0.18,RWY_Z);RUBM.renderOrder=1;scene.add(RUBM);
function rubberMark(x,z,len,wid){const X=v=>(v-RUB.x0)/RUB.w*RUB.c.width,Z=v=>(v-(RWY_Z-RUB.h/2))/RUB.h*RUB.c.height;const c=RUB.c.getContext('2d');
  const g=c.createLinearGradient(X(x),0,X(x-len),0);g.addColorStop(0,'rgba(12,12,12,.55)');g.addColorStop(0.25,'rgba(14,14,14,.32)');g.addColorStop(1,'rgba(14,14,14,0)');c.fillStyle=g;
  c.fillRect(X(x-len),Z(z)-wid*0.7,X(x)-X(x-len),wid*1.4);RUBT.needsUpdate=true;RUB.n++;}
function rubberDay(){const d=dayOf(G.t);if(RUB.day<0){RUB.day=d;return;}if(d!==RUB.day){RUB.day=d;const c=RUB.c.getContext('2d');c.globalCompositeOperation='destination-out';c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,0,RUB.c.width,RUB.c.height);c.globalCompositeOperation='source-over';RUBT.needsUpdate=true;}}

/* ---- sombra de contacto bajo los aviones ---- */
const AOT=(()=>{const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');x.filter='blur(14px)';x.fillStyle='rgba(0,0,0,.85)';
  x.beginPath();x.ellipse(128,128,118,15,0,0,TAU);x.fill();x.beginPath();x.ellipse(122,128,22,112,0,0,TAU);x.fill();x.beginPath();x.ellipse(28,128,10,34,0,0,TAU);x.fill();
  const t=new TH.CanvasTexture(c);return t;})();
const _v1=new TH.Vector3(),_v2=new TH.Vector3();
const PST=new Map();
function planeFX(dt){if(!(dt>0))return;const rn=WX.r,wet=WX.wet,humid=Math.max(rn,duskAmt()*0.5,nightFactor()*0.35);
  for(const p of G.planes){const g=P3.get(p.id);if(!g)continue;const ud=g.userData,L=ud.L,S=ud.S,R0=ud.R,alt=p.alt||0,sp=p.spd||0;
    if(!ud.ao){const m=new TH.Mesh(new TH.PlaneGeometry(1,1),new TH.MeshBasicMaterial({map:AOT,transparent:true,depthWrite:false,opacity:.5,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-8}));m.rotation.x=-Math.PI/2;m.scale.set(L*1.08,S*1.04,1);m.renderOrder=1;g.add(m);ud.ao=m;ud.aoM=m.material;}
    ud.ao.position.y=-(R0+2.6+alt)+0.3;ud.ao.visible=alt<60;ud.aoM.opacity=(0.34+rn*0.3)*Math.max(0,1-alt/50);
    const s=PST.get(p.id)||{st:p.state,alt};g.updateMatrixWorld();
    const loc=(x,y,z)=>g.localToWorld(_v1.set(x,y,z));const fx=Math.cos(p.hdg),fz=Math.sin(p.hdg);
    const gx=-L*0.07,gy=-(R0+2.6)+0.6;
    const onG=alt<0.6;
    if(onG&&sp>26&&(p.state==='roll'||p.state==='takeoff')&&wet>0.25){const k=Math.min(1,(sp-26)/50)*wet;const n=Math.round(dt*90*k+GRr());
      for(let i=0;i<n;i++){const sg=GRr()<0.5?-1:1;const w=GRr()<0.6?loc(gx-RG(0,3),gy,sg*R0*RG(0.8,1.2)):loc(ud.eng[0][0]-L*0.06,gy+1,sg*Math.abs(ud.eng[0][2]));
        emit(w.x,w.y+RG(0,1),w.z,-fx*sp*RG(0.05,0.25)+RG(-3,3),RG(2,7),-fz*sp*RG(0.05,0.25)+RG(-3,3),RG(4,8),RG(8,16),RG(1.2,2.4),0.42*k+0.12,0.88,0.9,0.92,0.7);}}
    if(p.engines&&GFX.q>0&&alt<30&&['taxiOut','taxiIn','lineup','takeoff','push','holdShort','hold2','roll','cross'].includes(p.state)){const pw=p.state==='takeoff'?1:0.35;const n=Math.round(dt*(p.state==='takeoff'?70:16)+GRr()*0.6);
      for(let i=0;i<n;i++){const e=ud.eng[i%2];const w=loc(e[0]-L*0.05,e[1],e[2]);emit(w.x,w.y,w.z,-fx*RG(6,14)*pw*2+RG(-1,1),RG(0.4,1.4),-fz*RG(6,14)*pw*2+RG(-1,1),RG(2,3.5),RG(3,6),RG(0.6,1.2),0.06+pw*0.05,0.82,0.78,0.72,1.2);}}
    if(humid>0.25&&((p.state==='takeoff'&&alt>1&&alt<170)||(p.state==='approach'&&alt<70&&alt>0.5)||p.state==='goaround')){const n=Math.round(dt*60+GRr());
      for(let i=0;i<n;i++){const sg=i%2?1:-1;const w=loc(ud.tip?ud.tip[0]:-L*0.12,ud.tip?ud.tip[1]:0,sg*(ud.tip?ud.tip[2]:S/2));emit(w.x,w.y,w.z,RG(-0.5,0.5),RG(-0.4,0.2),RG(-0.5,0.5),RG(0.8,1.5),RG(0.8,1.6),RG(1.2,2.2),0.2+humid*0.25,0.95,0.97,1,0.3);}}
    s.st=p.state;s.alt=alt;PST.set(p.id,s);}
  if(PST.size>G.planes.length+8){const ids=new Set(G.planes.map(p=>p.id));for(const k of PST.keys())if(!ids.has(k))PST.delete(k);}}

function gfxTouch(p){try{const g=P3.get(p.id),L=g?g.userData.L:p.T.len*PSCALE,R0=g?g.userData.R:Math.max(1.8,L*0.058),sp=p.spd||100,fx=Math.cos(p.hdg),fz=Math.sin(p.hdg);
  for(const sg of [-1,1]){const x=p.x-fx*L*0.07,z=p.z+sg*R0*0.95;for(let k=0;k<16;k++)emit(x+RG(-2,2),RG(0.4,2),z+RG(-1.5,1.5),fx*sp*0.2+RG(-4,4),RG(1,5),fz*sp*0.2+RG(-4,4),RG(3,6),RG(5,9),RG(1.6,3.2),0.55,0.86,0.86,0.86,0.9);
    if(Math.abs(z-RWY_Z)<RUB.h/2)rubberMark(x,z,RG(28,60),2.6);}}catch(e){}}
/* ---- pantallas de vuelos (FIDS) y letreros iluminados ---- */
const SIGNC=new TH.Color(1,1,1),SCRC=new TH.Color(1,1,1);
function mkBoard(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const t=new TH.CanvasTexture(c);t.encoding=TH.sRGBEncoding;t.anisotropy=4;const m=new TH.MeshBasicMaterial({map:t,toneMapped:false});m.color=SCRC;return{c,t,m};}
const FIDS={dep:mkBoard(512,320),arr:mkBoard(512,320),gates:[],t:0};
function fidsReset(){FIDS.gates.forEach(b=>{b.t.dispose();b.m.dispose();});FIDS.gates=[];FIDS.t=0;}
function fidsGate(o){const b=mkBoard(256,128);b.o=o;FIDS.gates.push(b);return b.m;}
function fidsMesh(m,w,h,x,y,z,par,ry){const me=new TH.Mesh(new TH.PlaneGeometry(w,h),m);me.position.set(x,y,z);if(ry)me.rotation.y=ry;me.userData.shared=true;par.add(me);
  const fr=new TH.Mesh(BOXG,mat('#15191d',{roughness:.5,metalness:.4}));fr.scale.set(w+0.5,h+0.5,0.25);fr.position.set(x,y,z-0.35*(ry?-1:1));if(ry)fr.rotation.y=ry;par.add(fr);return me;}
function boardRows(arr){const out=[];const L=G.flights;for(const f of L){if(f.state==='cancel'&&!arr&&G.t>f.std+30)continue;const t=arr?f.sta:f.std;if(t<G.t-45)continue;out.push(f);if(out.length>40)break;}
  out.sort((a,b)=>(arr?a.sta-b.sta:a.std-b.std));return out.slice(0,7);}
function stDep(f){if(f.state==='cancel')return['CANCELADO','#ff5a5f'];if(f.state==='done')return['DESPEGÓ','#7d8a96'];if(f.state==='departed')return['CERRADO','#9fb3c2'];
  if(f.state==='parked'&&f.boardOpen)return[Math.floor(performance.now()/600)%2?'EMBARCANDO':'','#ffc629'];if(G.t>f.std)return['DEMORADO','#ff5a5f'];return['A TIEMPO','#4be08a'];}
function stArr(f){const p=f.plane;if(f.state==='cancel')return['CANCELADO','#ff5a5f'];if(f.state==='done'||f.state==='departed'||f.state==='parked')return['ATERRIZÓ','#4be08a'];
  if(p&&p.state==='approach')return['APROXIMACIÓN','#ffc629'];if(p)return['EN TIERRA','#4be08a'];if(G.t>f.sta+10)return['RETRASADO','#ff5a5f'];return['PROGRAMADO','#cfd8e0'];}
function drawBoard(b,arr){const x=b.c.getContext('2d'),W=b.c.width,H=b.c.height;x.fillStyle='#061019';x.fillRect(0,0,W,H);
  x.fillStyle=arr?'#1f9e6a':'#ffc629';x.fillRect(0,0,W,40);x.fillStyle='#0b0d10';x.font='700 26px "Barlow Condensed", sans-serif';x.textBaseline='middle';
  x.fillText(arr?'✈ LLEGADAS · ARRIVALS':'✈ SALIDAS · DEPARTURES',12,21);x.textAlign='right';x.fillText(clockStr(G.t),W-12,21);x.textAlign='left';
  const rows=boardRows(arr);x.font='600 22px "Barlow Condensed", sans-serif';
  rows.forEach((f,i)=>{const y=62+i*37;x.fillStyle=i%2?'#0a1722':'#0d1c29';x.fillRect(0,y-17,W,36);
    x.fillStyle='#e8edf2';x.fillText(clockStr(arr?f.sta:f.std),10,y);x.fillStyle=f.a.c1;x.fillRect(72,y-11,8,22);x.fillStyle='#e8edf2';x.fillText(f.num,88,y);
    x.fillText(((arr?f.orig:f.dest)||{n:'—'}).n.toUpperCase().slice(0,15),190,y);x.fillStyle='#9fb3c2';x.fillText(f.stand?'P'+f.stand.num:'—',338,y);
    const [s,c]=arr?stArr(f):stDep(f);x.fillStyle=c;x.fillText(s,384,y);});
  if(!rows.length){x.fillStyle='#9fb3c2';x.fillText('Sin vuelos programados',12,80);}b.t.needsUpdate=true;}
function drawGate(b){const o=b.o,x=b.c.getContext('2d'),f=o.stand&&o.stand.f;x.fillStyle='#061019';x.fillRect(0,0,256,128);
  x.fillStyle='#ffc629';x.fillRect(0,0,256,34);x.fillStyle='#0b0d10';x.font='700 26px "Barlow Condensed", sans-serif';x.textBaseline='middle';x.fillText('PUERTA '+(o.stand?o.stand.num:'?'),10,18);
  if(f&&f.state!=='done'&&f.state!=='cancel'){x.fillStyle=f.a.c1;x.fillRect(10,48,8,30);x.fillStyle='#e8edf2';x.font='700 30px "Barlow Condensed", sans-serif';x.fillText(f.num,26,64);
    x.font='600 24px "Barlow Condensed", sans-serif';x.fillText((f.dest||{n:''}).n.toUpperCase().slice(0,14)+'  '+clockStr(f.std),10,98);const [s,c]=stDep(f);x.fillStyle=c;x.fillText(s||' ',10,120);}
  else{x.fillStyle='#9fb3c2';x.font='600 26px "Barlow Condensed", sans-serif';x.fillText('SIN VUELO',10,70);x.font='500 20px "Barlow Condensed", sans-serif';x.fillText(clockStr(G.t),10,104);}b.t.needsUpdate=true;}
function updFIDS(rdt){FIDS.t-=rdt;if(FIDS.t>0)return;FIDS.t=1.2;const near=camera.position.distanceTo(controls.target)<1100;if(!near)return;
  try{drawBoard(FIDS.dep,false);drawBoard(FIDS.arr,true);FIDS.gates.forEach(drawGate);}catch(e){}}

/* ---- calidad ---- */
function applyQ(){if(GFX.q<1){cubeDrop();GU.uRon.value=0;}GU.uFloor.value=GFX.q>=1?1:0.55;
  renderer.shadowMap.needsUpdate=true;}
function setQ(q,user){GFX.q=clamp(q,0,2);if(user){GFX.user=true;try{localStorage.setItem('pl_gfx',String(GFX.q));}catch(e){}}applyQ();}
applyQ();

/* ---- cielo: neblina en el horizonte y rayos de sol al atardecer ---- */
skyU.fogc={value:new TH.Color()};skyU.ray={value:0};skyU.hz={value:0.75};
skyDome.material.fragmentShader='uniform vec3 top;uniform vec3 bot;uniform vec3 sunDir;uniform vec3 sunCol;uniform float sunAmt;uniform vec3 fogc;uniform float ray;uniform float hz;varying vec3 vP;void main(){float h=clamp(vP.y*1.6+0.05,0.0,1.0);vec3 c=mix(bot,top,pow(h,0.7));float d=max(dot(vP,sunDir),0.0);'+
 'c+=sunCol*(pow(d,900.0)*2.0+pow(d,12.0)*0.25)*sunAmt;vec3 e1=normalize(cross(sunDir,vec3(0.0,1.0,0.0))+vec3(0.0001));vec3 e2=cross(e1,sunDir);float an=atan(dot(vP,e2),dot(vP,e1));'+
 'float rs=0.5+0.5*sin(an*13.0)*sin(an*7.0+1.3);c+=sunCol*pow(d,5.0)*rs*ray*0.45;c=mix(c,fogc,(1.0-smoothstep(-0.02,0.2,vP.y))*hz);gl_FragColor=vec4(c,1.0);}';
skyDome.material.uniforms=skyU;skyDome.material.needsUpdate=true;

/* ---- por cuadro ---- */
const _skyR=new TH.Color(),_c1=new TH.Color();const HEMI_D=new TH.Color(0xeaf3ff),HEMI_N=new TH.Color(0x7d95c8),HEMG_D=new TH.Color(0x4f6a3a),HEMG_N=new TH.Color(0x1c2433),MOONC=new TH.Color(0xa9bde6);
function gfxFrame(dt){
  const now=performance.now(),rdt=Math.min(0.1,(now-GFX.last)/1000);GFX.last=now;GFX.rt+=rdt;GFX.fr++;
  updWeather(rdt,titleOnSafe()?0:dt*MIN_PER_S);rubberDay();
  const n=nightFactor(),r=WX.r,dk=duskAmt();
  // cielo y luz con lluvia
  _skyR.copy(SKY_RAIN).multiplyScalar(1-n*0.82);scene.background.lerp(_skyR,r*0.78);scene.fog.color.copy(scene.background);
  skyU.top.value.lerp(_c1.copy(_skyR).multiplyScalar(0.8),r*0.8);skyU.bot.value.lerp(_skyR,r*0.8);skyU.sunAmt.value*=1-r*0.95;skyU.fogc.value.copy(scene.fog.color);skyU.ray.value=dk*(1-r)*(1-n*0.5);skyU.hz.value=0.7+r*0.3;
  scene.fog.near=lerp(1150,140,r);scene.fog.far=lerp(7000,2700,r);
  hemi.color.copy(HEMI_D).lerp(HEMI_N,n);hemi.groundColor.copy(HEMG_D).lerp(HEMG_N,n);sun.color.lerp(MOONC,n*0.85);
  sun.intensity*=1-r*0.72;hemi.intensity*=1-r*0.18;hemi.intensity+=WX.flash*1.1;renderer.toneMappingExposure+=WX.flash*0.22-r*0.04;
  CLOUDS.forEach(c=>{c.material.opacity=Math.min(1,c.material.opacity+r*0.25);c.material.color.multiplyScalar(1-r*0.5);});
  // nubes que proyectan sombra
  GU.uCl.value=(0.35+r*0.45)*(1-n);GU.uClOff.value.x-=dt*14*0.00042;GU.uClOff.value.y-=dt*3*0.00042;GU.uWet.value=WX.wet;GU.uT.value=GFX.rt;
  // lluvia
  const lv=0.25+0.75*(1-n);RAINM.visible=r>0.02;SPLM.visible=r>0.05&&camera.position.y<900;
  if(RAINM.visible){const tg=controls.target,cp=camera.position;RAINU.uC.value.set(lerp(tg.x,cp.x,0.45),0,lerp(tg.z,cp.z,0.45));RAINU.uT.value=GFX.rt;RAINU.uH.value=clamp(cp.y+60,260,700);
    RAINU.uAmt.value=r*(GFX.q>0?1:0.4);RAINU.uOp.value=0.22+r*0.3;RAINU.uCol.value.setRGB(0.78*lv+WX.flash*0.4,0.84*lv+WX.flash*0.4,0.92*lv+WX.flash*0.4);}
  if(SPLM.visible){SPLU.uC.value.copy(controls.target);SPLU.uT.value=GFX.rt;SPLU.uAmt.value=r*(GFX.q>0?1:0.35);SPLU.uCol.value.setRGB(0.85*lv,0.9*lv,0.95*lv);}
  // luces: letreros, pantallas y faros brillan de noche (bloom)
  SIGNC.setScalar(1+n*0.55);SCRC.setScalar(0.92+n*0.45);if(PM.lit)PM.lit.material.color.setScalar(1+n*1.6);
  // partículas
  PU.uScale.value=renderer.domElement.height*0.5/Math.tan(camera.fov*Math.PI/360);PU.uL.value.setScalar(0.3+0.7*(1-n)*(1-r*0.25)+WX.flash*0.5);
  if(!titleOnSafe())planeFX(dt);updParticles(dt);updFIDS(rdt);cineUpd(rdt);nearFit();
  perfWatch(rdt);}
/* plano cercano dinámico: más precisión de profundidad (evita parpadeo del suelo en tabletas y teléfonos) */
function nearFit(){const d=camera.position.distanceTo(controls.target),nr=clamp(Math.min(d,camera.position.y*1.5)*0.02,1,30);if(Math.abs(nr-camera.near)>camera.near*0.08){camera.near=nr;camera.updateProjectionMatrix();}}
function titleOnSafe(){try{return titleOn;}catch(e){return true;}}
function perfWatch(rdt){const P=GFX.perf;if(P.done||GFX.user||GFX.q===0||titleOnSafe()||document.hidden)return;P.t+=rdt;if(P.t<6)return;P.n++;P.s+=rdt;
  if(P.n>=150){const avg=P.s/P.n;P.n=0;P.s=0;if(avg>1/24){setQ(GFX.q-1,false);try{toast('Gráficos ajustados a calidad '+GQN[GFX.q]+' para mantener la fluidez (cámbialo en ☰)');}catch(e){}}else P.done=true;}}
function gfxRender(){GFX.extra=0;
  try{const q=GFX.q,n=nightFactor();
    if(q>0&&!PP.tried)ppInit();if(PP.ok)ppResize();
    if(q>0){renderer.shadowMap.autoUpdate=false;
      const dist=camera.position.distanceTo(controls.target),want=WX.wet>0.03||dist<560;
      if(want){if(GFX.fr%(q>=2?1:2)===0)MIR.on=mirrorPass();}else MIR.on=false;GU.uRon.value=MIR.on&&MIR.rt?1:0;
      if(GFX.fr%(q>=2?1:3)===0)cubeFace();
      renderer.shadowMap.autoUpdate=true;}else GU.uRon.value=0;
    if(q>0&&PP.ok){renderer.setRenderTarget(PP.rt);renderer.render(scene,camera);GFX.calls=renderer.info.render.calls;ppPost(n);}
    else{renderer.setRenderTarget(null);renderer.render(scene,camera);GFX.calls=renderer.info.render.calls;}
  }catch(e){console.warn('gfx',e);GFX.q=0;PP.ok=false;applyQ();renderer.shadowMap.autoUpdate=true;renderer.setRenderTarget(null);renderer.render(scene,camera);}}

/* ---- cámara cinematográfica ---- */
const CINE={on:false,i:-1,t:0,shot:null,pos:new TH.Vector3(),look:new TH.Vector3(),save:null,plane:null,n:0};
const CSEQ=['land','side','term','apron','fbo','pano'];
function cineStart(){if(titleOnSafe()||CINE.on)return;CINE.on=true;CINE.save={p:camera.position.clone(),t:controls.target.clone(),fov:camera.fov};controls.enabled=false;
  document.body.classList.add('cine');CINE.i=-1;CINE.plane=null;cineNext();}
function cineStop(){if(!CINE.on)return;CINE.on=false;document.body.classList.remove('cine');camera.fov=CINE.save.fov;camera.updateProjectionMatrix();camera.position.copy(CINE.save.p);controls.target.copy(CINE.save.t);controls.enabled=true;controls.update();}
function cineNext(){for(let k=0;k<CSEQ.length;k++){CINE.i=(CINE.i+1)%CSEQ.length;const s=cineShot(CSEQ[CINE.i]);if(s){CINE.shot=s;CINE.t=0;CINE.snap=true;const c=document.getElementById('cineCap');if(c)c.textContent=s.cap;return;}}
  CINE.shot=cineShot('pano');CINE.t=0;CINE.snap=true;}
function plPos(p,g){return _v2.set(p.x,(g?g.position.y:6),p.z);}
function cineShot(k){const tx0=G.tx0*CELL,tx1=(G.tx1+1)*CELL,tzA=APR*CELL,tzB=GH*CELL;
  if(k==='land'){const c=G.planes.filter(p=>p.state==='approach').sort((a,b)=>a.alt-b.alt)[0]||G.planes.find(p=>p.state==='takeoff'||p.state==='roll'||p.state==='lineup')||G.planes.find(p=>p.state==='taxiIn'||p.state==='taxiOut');
    if(!c)return null;CINE.plane=c;const lab=c.state==='approach'?'Aproximación final':c.state==='takeoff'||c.state==='lineup'?'Despegue':'Rodaje';
    return{cap:'✈ '+c.f.num+' · '+lab,dur:12,fov:38,upd(t,P,L){const p=CINE.plane,g=p&&P3.get(p.id);if(!g||!G.planes.includes(p))return false;const ln=g.userData.L,h=p.hdg,fx=Math.cos(h),fz=Math.sin(h),sw=Math.sin(t*0.25)*0.35;
      P.set(p.x-fx*ln*1.5-fz*ln*(0.75+sw),g.position.y+ln*0.28+6,p.z-fz*ln*1.5+fx*ln*(0.75+sw));L.set(p.x+fx*ln*0.6,g.position.y+2,p.z+fz*ln*0.6);return true;}};}
  if(k==='side'){const p=CINE.plane&&G.planes.includes(CINE.plane)?CINE.plane:G.planes.find(q=>['approach','roll','takeoff','taxiIn','taxiOut'].includes(q.state));if(!p)return null;CINE.plane=p;
    const ox=clamp(p.state==='approach'?TD_X-120:p.x-160,-40,THR_X),oz=(p.alt>0||p.state==='roll'||p.state==='takeoff')?RWY_Z+58:p.z+70;const cam=new TH.Vector3(ox,5,oz);
    return{cap:'✈ '+p.f.num+' · Vista desde la pista',dur:9,fov:30,upd(t,P,L){const g=P3.get(p.id);if(!g||!G.planes.includes(p))return false;P.copy(cam);L.set(p.x,g.position.y,p.z);return true;}};}
  if(k==='term'){if(!(tx1>tx0))return null;const zm=(tzA+tzB)/2;return{cap:'🏢 Terminal de pasajeros',dur:14,fov:50,upd(t,P,L){const u=t/14,x=lerp(tx0+8,tx1-8,u);P.set(x,9+Math.sin(t*0.4)*1.5,zm+Math.sin(t*0.3)*12);L.set(x+40,4,zm+Math.sin(t*0.3+0.6)*16);return true;}};}
  if(k==='apron'){const p=G.planes.find(q=>q.state==='parked');if(!p)return null;return{cap:'🛫 '+p.f.num+' · Atención en plataforma',dur:11,fov:42,upd(t,P,L){const g=P3.get(p.id);if(!g)return false;const ln=g.userData.L,a=t*0.22+0.6;
    P.set(p.x+Math.cos(a)*ln*1.25,ln*0.32+10,p.z+Math.sin(a)*ln*1.25);L.set(p.x,6,p.z);return true;}};}
  if(k==='fbo'){if(!(G.fbo&&G.fbo.on))return null;return{cap:'💼 Aeródromo ejecutivo',dur:11,fov:45,upd(t,P,L){const a=t*0.12-1.9;P.set(560+Math.cos(a)*300,110,-700+Math.sin(a)*300);L.set(560,0,-700);return true;}};}
  if(k==='pano'){const cx=GW*CELL/2,cz=0;return{cap:'🌅 '+((G.name||'Pista Libre'))+' · Panorámica',dur:13,fov:40,upd(t,P,L){const a=t*0.08+2.2;P.set(cx+Math.cos(a)*1050,420+Math.sin(t*0.2)*40,cz+Math.sin(a)*1050);L.set(cx,0,cz+60);return true;}};}
  return null;}
function cineUpd(rdt){if(!CINE.on)return;const s=CINE.shot;CINE.t+=rdt;const P=_cP,L=_cL;const ok=s&&s.upd(CINE.t,P,L);
  if(!ok||CINE.t>s.dur){cineNext();return;}
  if(CINE.snap){CINE.pos.copy(P);CINE.look.copy(L);CINE.snap=false;if(camera.fov!==s.fov){camera.fov=s.fov;camera.updateProjectionMatrix();}}
  else{const k=1-Math.exp(-rdt*3.2);CINE.pos.lerp(P,k);CINE.look.lerp(L,1-Math.exp(-rdt*5));}
  camera.position.copy(CINE.pos);controls.target.copy(CINE.look);camera.lookAt(CINE.look);}
const _cP=new TH.Vector3(),_cL=new TH.Vector3();

/* ---- UI: botones de cine y clima ---- */
{const bm=document.getElementById('bMenu');if(bm){bm.insertAdjacentHTML('beforebegin','<button id="bWx" title="Clima">🌦</button><button id="bCine" title="Cámara cinematográfica">🎬</button>');}
 document.body.insertAdjacentHTML('beforeend','<div id="cine"><div class="lb t"></div><div class="lb b"><span id="cineCap"></span><button id="cineX">✕ Salir</button></div></div>');
 const wxI={auto:'🌦',rain:'🌧',clear:'☀️'},wxN={auto:'Clima automático',rain:'Lluvia',clear:'Despejado'};
 const sw=()=>{const b=document.getElementById('bWx');if(b){b.textContent=wxI[WX.mode];b.title='Clima: '+wxN[WX.mode];}};sw();
 document.getElementById('bWx').addEventListener('click',()=>{const o=['auto','rain','clear'];setWeather(o[(o.indexOf(WX.mode)+1)%3]);sw();try{toast('Clima: '+wxN[WX.mode]);}catch(e){}});
 document.getElementById('bCine').addEventListener('click',()=>{CINE.on?cineStop():cineStart();});
 document.getElementById('cineX').addEventListener('click',e=>{e.stopPropagation();cineStop();});
 window.addEventListener('keydown',e=>{if(CINE.on&&(e.key==='Escape'||e.key===' ')){e.preventDefault();e.stopImmediatePropagation();cineStop();}},true);
 cv.addEventListener('pointerdown',e=>{if(CINE.on){e.stopImmediatePropagation();e.preventDefault();cineStop();}},true);
 window.addEventListener('resize',()=>{if(PP.ok)ppResize();});}
