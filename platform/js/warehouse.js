/* Digital twin: 3D / 2D / list views of locations and pallets, filters, suggestions. */
(function(){
"use strict";
var W=window.W,u=W.u,esc=u.esc,C=W.core,UI=W.ui,I=W.icon,store=W.store,F=W.fn,P=W.pages;
function S(){return store.state;}
var WS={view:"3d",wh:null,zone:"all",f:{status:"all",cus:"all",q:""},hl:[],cam:null,sugFor:null,q0:""};
var LC={av:0x4ade80,oc:0x2563eb,rs:0xeab308,bl:0xef4444,"in":0xcbd5e1};
var ORG={ZA:{x:0,z:0},ZB:{x:0,z:13},ZC:{x:13,z:0},ZD:{x:13,z:10.5},ZE:{x:0,z:-7}};
var SX=1.4,SZ=2.6,SY=1.15;
function whId(){if(W.session.wh&&W.session.wh!=="all")return W.session.wh;return WS.wh||"WH-A";}
function locPos(l){var o=ORG[l.zc];return {x:o.x+(l.pos-1)*SX,y:0.18+(l.level-1)*SY,z:o.z+(l.row-1)*SZ};}
function match(l){var f=WS.f,p=C.idx().palByLoc[l.id],st=C.lstat(l);if(f.status!=="all"&&st!==f.status)return false;if(f.cus!=="all"&&(!p||p.customerId!==f.cus))return false;
  if(f.q){var q=f.q.toLowerCase(),hay=(l.id+" "+(p?p.id+" "+p.lot+" "+C.prodName(p.productId)+" "+C.cusName(p.customerId):"")).toLowerCase();if(hay.indexOf(q)<0)return false;}return true;}
function active(){return WS.f.status!=="all"||WS.f.cus!=="all"||!!WS.f.q;}
function locs(){var wh=whId();return S().locations.filter(function(l){return l.wh===wh&&(WS.zone==="all"||l.zc===WS.zone);});}

/* ---------- 2D ---------- */
function plan2d(){var wh=whId(),zs=S().zones.filter(function(z){return z.wh===wh&&(WS.zone==="all"||z.code===WS.zone);}),h='<div class="plan">';
  zs.forEach(function(z){var zl=S().locations.filter(function(l){return l.zone===z.id;}),o=C.occ(function(l){return l.zone===z.id;});
    h+='<div class="zone"><div class="row between"><div><b>'+esc(z.name)+'</b> <span class="mute sm">('+z.temp+')</span></div><div class="sm">إشغال <b>'+o.util+'%</b> • متاح '+o.available+'</div></div>';
    for(var r=1;r<=z.rows;r++)for(var lv=z.levels;lv>=1;lv--){h+='<div class="rowline"><span class="rl">R'+u.p2(r)+' L'+u.p2(lv)+'</span>';
      zl.filter(function(l){return l.row===r&&l.level===lv;}).sort(function(a,b){return a.pos-b.pos;}).forEach(function(l){var p=C.idx().palByLoc[l.id],st=C.lstat(l),hl=WS.hl.indexOf(l.id)>-1;
        h+='<div class="cell '+st+(active()&&!match(l)?" dim":"")+'" style="'+(hl?"outline:3px solid #ff2d95;outline-offset:1px;":"")+'" data-act="go" data-link="loc/'+l.id+'" title="'+C.locShort(l.id)+(p?" — "+esc(C.prodName(p.productId)):" — فارغ")+'">'+(p?"●":l.pos)+'</div>';});
      h+='</div>';}
    h+='</div>';});
  return h+'</div>';}

/* ---------- list ---------- */
function listView(){var rows=locs().map(function(l){return {l:l,p:C.idx().palByLoc[l.id]};}).filter(function(r){return !active()||match(r.l);});
  return UI.table("whlist",{rows:rows,key:function(r){return r.l.id;},rowAct:"whRow",pageSize:14,exportName:"locations",searchPh:"بحث في القائمة...",cols:[{k:"loc",label:"الموقع",v:function(r){return C.locShort(r.l.id);},render:function(r){return '<span class="mono">'+C.locShort(r.l.id)+'</span>';}},{k:"zone",label:"المنطقة",v:function(r){return C.zoneLabel(r.l.zone);}},{k:"st",label:"الحالة",v:function(r){return C.LS[C.lstat(r.l)][0];},render:function(r){return UI.lBadge(C.lstat(r.l));}},{k:"pal",label:"الطبلية",v:function(r){return r.p?r.p.id:"";},render:function(r){return r.p?'<span class="mono">'+r.p.id+'</span>':"—";}},{k:"prod",label:"المنتج",v:function(r){return r.p?C.prodName(r.p.productId):"";}},{k:"cus",label:"العميل",v:function(r){return r.p?C.cusName(r.p.customerId):"";}},{k:"qty",label:"الكمية",num:true,v:function(r){return r.p?r.p.qty:null;},render:function(r){return r.p?u.n(r.p.qty)+" "+r.p.unit:"—";}},{k:"exp",label:"الصلاحية",v:function(r){return r.p&&r.p.expiry?r.p.expiry:null;},render:function(r){return r.p?F.expBadge(r.p.expiry):"—";}}]});}
W.act.whRow=function(el){F.openLoc(el.dataset.id);};

/* ---------- page ---------- */
function stats(){var wh=whId(),o=C.occ(function(l){return l.wh===wh;});return o;}
function legend(){return '<div class="legendbar">'+Object.keys(C.LS).map(function(k){return '<span class="chip '+(WS.f.status===k?"on":"")+'" data-act="whStatus" data-s="'+k+'"><i class="c-'+k+'"></i>'+C.LS[k][0]+'</span>';}).join("")+(WS.f.status!=="all"?'<span class="chip" data-act="whStatus" data-s="all">إلغاء الفلتر</span>':"")+'</div>';}
function sugPanel(){var pend=S().pallets.filter(function(p){return !p.locationId&&!p.withdrawnAt&&p.wh===whId();}),ops=W.canDo("ops");
  var sel=WS.sugFor&&C.pallet(WS.sugFor)&&!C.pallet(WS.sugFor).locationId?C.pallet(WS.sugFor):pend[0];
  var h='<div class="card"><div class="ch"><h2>اقتراحات التخزين الذكية <span class="sim">قواعد ثابتة</span></h2><span class="sm mute">'+pend.length+' طبلية بانتظار التخزين في هذا المستودع</span></div><div class="cb">';
  if(!sel)return h+UI.empty("لا توجد طبالي بانتظار التخزين","<span>عند استلام شحنة جديدة تظهر طبالها هنا مع المواقع المقترحة.</span>")+'</div></div>';
  var sug=C.suggest(sel,{wh:whId(),limit:5});
  h+='<div class="row wrap mb12"><select class="inp" style="max-width:380px" data-chg="whSugSel">'+UI.opts(pend.map(function(p){return [p.id,p.id+" — "+C.prodName(p.productId)+" — "+C.cusName(p.customerId)];}),sel.id)+'</select><span class="sm mute">الوزن '+u.n(C.palletWeight(sel))+' كغ • '+({cold:"مبرّد",food:"غذائي",raw:"مواد خام",general:"عام"}[C.product(sel.productId).storage])+'</span></div>';
  h+=sug.length?'<div class="col gap6">'+sug.map(function(s,i){return '<div class="row between wrap" style="border:1px solid var(--line);border-radius:8px;padding:8px 12px"><div><b class="mono">'+C.locShort(s.loc.id)+'</b> <span class="badge '+(i===0?"green":"blue")+'">'+(i===0?"الأفضل • ":"")+'تطابق '+s.score+'</span><div class="xs mute">'+s.reasons.map(esc).join(" • ")+'</div></div><div class="row"><button class="btn xs" data-act="whShow" data-l="'+s.loc.id+'">'+I("eye")+' إظهار على الخريطة</button>'+(ops?'<button class="btn xs success" data-act="whStore" data-p="'+sel.id+'" data-l="'+s.loc.id+'">تأكيد التخزين هنا</button>':"")+'</div></div>';}).join("")+'</div>':'<div class="note warn">لا توجد مواقع مناسبة (تحقق من السعة أو نوع التخزين).</div>';
  return h+'</div></div>';}
P.warehouse={perm:"warehouse",title:"خريطة المستودع",render:function(ctx){
  if(ctx.q.pallet&&ctx.q.pallet!==WS.q0){var pp=C.pallet(ctx.q.pallet);WS.q0=ctx.q.pallet;if(pp&&pp.locationId){WS.hl=[pp.locationId];WS.wh=pp.wh;WS.zone="all";WS.cam=null;if(WS.view==="list")WS.view="3d";}}
  else if(ctx.q.loc&&ctx.q.loc!==WS.q0){WS.q0=ctx.q.loc;var ll=C.loc(ctx.q.loc);if(ll){WS.hl=[ll.id];WS.wh=ll.wh;WS.cam=null;}}
  else if(!ctx.q.pallet&&!ctx.q.loc)WS.q0="";
  var wh=whId(),o=stats(),zs=S().zones.filter(function(z){return z.wh===wh;}),cuss=S().customers;
  var h=UI.pageHead("المستودعات والخريطة الرقمية","شاهد كل موقع وطبلية في المستودع: 3D أو مخطط 2D أو قائمة. اضغط على أي موقع لعرض تفاصيله.",'<div class="seg" role="group">'+[["3d","3D"],["2d","مخطط 2D"],["list","قائمة"]].map(function(v){return '<button class="'+(WS.view===v[0]?"on":"")+'" data-act="whView" data-v="'+v[0]+'">'+v[1]+'</button>';}).join("")+'</div>');
  h+='<div class="toolbar">'+(W.session.wh==="all"||!W.session.wh?'<select class="inp" data-chg="whSel">'+F.whOpts(wh)+'</select>':'<span class="badge blue">'+esc(C.whName(wh))+'</span>')+'<select class="inp" data-chg="whZone">'+UI.opts([["all","كل المناطق"]].concat(zs.map(function(z){return [z.code,z.name];})),WS.zone)+'</select>'+
   '<select class="inp" data-chg="whCus">'+UI.opts([["all","كل العملاء"]].concat(cuss.map(function(c){return [c.id,c.name];})),WS.f.cus)+'</select><input class="inp sinp" placeholder="بحث: طبلية، منتج، عميل، Lot، موقع..." value="'+esc(WS.f.q)+'" data-inp="whq">'+(WS.hl.length||active()?'<button class="btn sm" data-act="whClear">إلغاء التحديد والفلاتر</button>':"")+'</div>';
  h+='<div class="grid g5 mb12">'+F.kpi("الإشغال",o.util+"%",u.n(o.occupied)+" من "+u.n(o.usable)+" موقع")+F.kpi("المواقع المتاحة",u.n(o.available))+F.kpi("محجوزة",u.n(o.reserved))+F.kpi("محظورة / تحتاج مراجعة",u.n(o.blocked+o.attention),o.attention+" بها بضاعة مشكلة",null,o.attention?"warn2":"")+F.kpi("غير مفعّلة",u.n(o.inactive))+'</div>';
  h+='<div class="card mb16"><div class="ch">'+legend()+'<span class="sm mute">'+(WS.view==="3d"?"اسحب للتدوير • عجلة الفأرة للتكبير • اضغط لفتح الموقع":"")+'</span></div><div class="cb" style="padding:12px" id="whview">'+(WS.view==="3d"?'<div class="view3d" id="v3d"><div class="hint3d" id="v3msg">جاري تحميل العرض ثلاثي الأبعاد…</div></div>':WS.view==="2d"?plan2d():listView())+'</div></div>';
  return h+sugPanel();},
  after:function(){if(WS.view==="3d")start3d();}};
function refreshView(){if(WS.view==="3d"){if(WS.repaint)WS.repaint();}else{var b=document.getElementById("whview");if(b)b.innerHTML=WS.view==="2d"?plan2d():listView();}}
W.act.whView=function(el){WS.view=el.dataset.v;W.app.renderPage();};
W.chg.whSel=function(el){WS.wh=el.value;WS.zone="all";WS.hl=[];WS.cam=null;W.app.renderPage();};
W.chg.whZone=function(el){WS.zone=el.value;WS.cam=null;W.app.renderPage();};
W.chg.whCus=function(el){WS.f.cus=el.value;W.app.renderPage();};
var qt=null;W.inp.whq=function(el){WS.f.q=el.value;clearTimeout(qt);qt=setTimeout(refreshView,200);};
W.act.whStatus=function(el){WS.f.status=el.dataset.s;W.app.renderPage();};
W.act.whClear=function(){WS.f={status:"all",cus:"all",q:""};WS.hl=[];WS.q0="";if(location.hash.indexOf("?")>-1)location.hash="#/warehouse";else W.app.renderPage();};
W.chg.whSugSel=function(el){WS.sugFor=el.value;W.app.renderPage();};
W.act.whShow=function(el){WS.hl=[el.dataset.l];var l=C.loc(el.dataset.l);WS.wh=l.wh;WS.zone="all";WS.cam=null;if(WS.view==="list")WS.view="3d";W.app.renderPage();window.scrollTo(0,0);};
W.act.whStore=function(el){var r=C.storePallet(el.dataset.p,el.dataset.l,F.emp());if(!r.ok)return F.errs(r);WS.hl=[el.dataset.l];WS.sugFor=null;F.done("تم تخزين الطبلية في "+C.locShort(el.dataset.l)+" — الخريطة محدّثة");};
F.focusLoc=function(id){WS.hl=[id];var l=C.loc(id);WS.wh=l.wh;WS.zone="all";WS.cam=null;};

/* ---------- three.js ---------- */
function loadScript(src){return new Promise(function(res,rej){var s=document.createElement("script");s.src=src;s.onload=res;s.onerror=function(){rej(new Error("load "+src));};document.head.appendChild(s);});}
function ensureThree(){if(window.THREE&&THREE.OrbitControls)return Promise.resolve();if(W._thp)return W._thp;W._thp=loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js").then(function(){return loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js");}).catch(function(e){W._thp=null;throw e;});return W._thp;}
function label(txt,sub){var c=document.createElement("canvas");c.width=512;c.height=96;var g=c.getContext("2d");g.fillStyle="rgba(15,27,51,.82)";g.fillRect(0,0,512,96);g.fillStyle="#fff";g.font="bold 34px 'IBM Plex Sans Arabic',Cairo,Tahoma,sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(txt,256,36);g.font="22px sans-serif";g.fillStyle="#9fb4dd";g.fillText(sub,256,72);var t=new THREE.CanvasTexture(c);var s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(5.6,1.05,1);s.renderOrder=10;return s;}
function start3d(){var box=document.getElementById("v3d"),msg=document.getElementById("v3msg");if(!box)return;
  ensureThree().then(function(){if(!document.getElementById("v3d")||document.getElementById("v3d")!==box)return;try{build3d(box);if(msg)msg.textContent="اسحب للتدوير • عجلة الفأرة للتكبير";}catch(e){console.error(e);fallback(box,e);}}).catch(function(e){fallback(box,e);});}
function fallback(box,e){box.innerHTML='<div style="padding:30px;text-align:center"><div class="note warn" style="display:inline-block;text-align:start">تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز/الاتصال ('+esc(e&&e.message||"WebGL")+'). تم التحويل إلى المخطط ثنائي الأبعاد.<br><button class="btn primary mt8" data-act="whView" data-v="2d">فتح مخطط 2D</button></div></div>';}
function build3d(box){var T=THREE,L=locs(),wh=whId(),w=box.clientWidth||800,h=box.clientHeight||500;
  var renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setClearColor(0xdde4ef,1);renderer.setSize(w,h);box.insertBefore(renderer.domElement,box.firstChild);
  var scene=new T.Scene(),cam=new T.PerspectiveCamera(42,w/h,0.5,300);
  scene.add(new T.HemisphereLight(0xffffff,0x8fa3c4,.95));var dl=new T.DirectionalLight(0xffffff,.65);dl.position.set(18,30,20);scene.add(dl);
  /* floor + zones */
  var fl=new T.Mesh(new T.PlaneGeometry(400,400),new T.MeshLambertMaterial({color:0xdde4ef}));fl.rotation.x=-Math.PI/2;fl.position.set(10,-0.02,6);scene.add(fl);
  var zs=S().zones.filter(function(z){return z.wh===wh&&(WS.zone==="all"||z.code===WS.zone);}),bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;
  zs.forEach(function(z){var o=ORG[z.code],wd=z.pos*SX+1.2,dp=z.rows*SZ+0.6,col={general:0xf1f5fb,food:0xf4f1e6,raw:0xeee9e4,cold:0xdaf0f8,staging:0xfaf0cc}[z.type];
    var p=new T.Mesh(new T.PlaneGeometry(wd,dp),new T.MeshLambertMaterial({color:col}));p.rotation.x=-Math.PI/2;p.position.set(o.x+(z.pos-1)*SX/2,0.01,o.z+(z.rows-1)*SZ/2);scene.add(p);
    var lb=label(z.name.split("—")[0].trim()+" — "+W.ZONE_TYPES[z.type],z.temp);lb.position.set(o.x+(z.pos-1)*SX/2,z.levels*SY+1.4,o.z-1.6);scene.add(lb);
    bx0=Math.min(bx0,o.x-1);bx1=Math.max(bx1,o.x+z.pos*SX);bz0=Math.min(bz0,o.z-2);bz1=Math.max(bz1,o.z+z.rows*SZ);});
  /* racks: posts */
  var postG=new T.BoxGeometry(0.07,1,0.07),posts=[];zs.forEach(function(z){if(z.type==="staging")return;var o=ORG[z.code],H=z.levels*SY+0.1;for(var r=1;r<=z.rows;r++)for(var i=0;i<=z.pos;i++)for(var s=-1;s<=1;s+=2)posts.push([o.x+(i-0.5)*SX-0.0,H,o.z+(r-1)*SZ+s*0.72]);});
  var pm=new T.InstancedMesh(postG,new T.MeshLambertMaterial({color:0x475569}),posts.length),d=new T.Object3D();posts.forEach(function(p,i){d.position.set(p[0],p[1]/2,p[2]);d.scale.set(1,p[1],1);d.updateMatrix();pm.setMatrixAt(i,d.matrix);});scene.add(pm);
  /* planks (one per location) + pallets */
  var plankG=new T.BoxGeometry(1.2,0.07,1.5),palG=new T.BoxGeometry(1.0,1,1.2),pl=new T.InstancedMesh(plankG,new T.MeshLambertMaterial({color:0xffffff}),L.length);
  var pls=[];L.forEach(function(l){if(C.idx().palByLoc[l.id])pls.push(l);});var pa=new T.InstancedMesh(palG,new T.MeshLambertMaterial({color:0xffffff}),Math.max(1,pls.length));pa.count=pls.length;
  scene.add(pl);scene.add(pa);
  var dim=new T.Color(0xe5e9f0),col=new T.Color();
  function paint(){var act=active();L.forEach(function(l,i){var p=locPos(l),st=C.lstat(l),m=!act||match(l);d.position.set(p.x,p.y,p.z);d.scale.set(1,1,1);d.rotation.set(0,0,0);d.updateMatrix();pl.setMatrixAt(i,d.matrix);col.setHex(st==="oc"?0x94a3b8:LC[st]);if(!m)col.lerp(dim,.8);pl.setColorAt(i,col);});
    pls.forEach(function(l,i){var p=locPos(l),pal=C.idx().palByLoc[l.id],st=C.lstat(l),pr=C.product(pal.productId),f=Math.max(.35,Math.min(1,pal.qty/(pr.perPallet||1))),hh=0.35+0.55*f,m=!act||match(l);d.position.set(p.x,p.y+0.04+hh/2,p.z);d.scale.set(m?1:.7,hh,m?1:.7);d.updateMatrix();pa.setMatrixAt(i,d.matrix);col.setHex(LC[st]);if(!m)col.lerp(dim,.8);pa.setColorAt(i,col);});
    pl.instanceMatrix.needsUpdate=true;pa.instanceMatrix.needsUpdate=true;if(pl.instanceColor)pl.instanceColor.needsUpdate=true;if(pa.instanceColor)pa.instanceColor.needsUpdate=true;}
  paint();WS.repaint=paint;
  /* docks */
  var whO=C.wh(wh);if(WS.zone==="all"||WS.zone==="ZE"){whO.docks.forEach(function(dk,i){var stt=C.dockStatus(wh,dk.id),c={available:0x22c55e,occupied:0xef4444,reserved:0xeab308,maintenance:0x94a3b8}[stt],m=new T.Mesh(new T.BoxGeometry(2.2,1.6,0.3),new T.MeshLambertMaterial({color:c}));m.position.set(1+i*3,0.8,-11.2);scene.add(m);var t=label(dk.id,C.DOCKS[stt][0]);t.scale.set(2.4,.45,1);t.position.set(1+i*3,2.1,-11.2);scene.add(t);});bz0=Math.min(bz0,-12);}
  /* highlight */
  var hls=WS.hl.map(function(id){return C.loc(id);}).filter(function(l){return l&&l.wh===wh;}).map(function(l){var m=new T.Mesh(new T.BoxGeometry(1.35,1.05,1.65),new T.MeshBasicMaterial({color:0xff2d95,transparent:true,opacity:.5,depthWrite:false})),p=locPos(l);m.position.set(p.x,p.y+0.5,p.z);scene.add(m);return m;});
  /* camera */
  var cx=(bx0+bx1)/2,cz=(bz0+bz1)/2,span=Math.max(bx1-bx0,bz1-bz0),ctl=new T.OrbitControls(cam,renderer.domElement);ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.maxPolarAngle=Math.PI/2.05;ctl.minDistance=4;ctl.maxDistance=90;
  if(WS.cam){cam.position.fromArray(WS.cam.p);ctl.target.fromArray(WS.cam.t);}
  else if(hls.length){var hp=hls[0].position;ctl.target.copy(hp);cam.position.set(hp.x+11,hp.y+11,hp.z+17);}
  else{ctl.target.set(cx,1,cz);cam.position.set(cx+span*0.1,span*0.6,cz+span*0.78);}
  ctl.update();
  /* picking + tooltip */
  var ray=new T.Raycaster(),mouse=new T.Vector2(),tt=document.createElement("div");tt.style.cssText="position:absolute;pointer-events:none;background:#0f1b33;color:#fff;font-size:12px;padding:5px 9px;border-radius:6px;display:none;z-index:5;max-width:260px;direction:rtl";box.appendChild(tt);
  function pick(e){var r=renderer.domElement.getBoundingClientRect();mouse.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mouse,cam);var a=ray.intersectObject(pa)[0],b=ray.intersectObject(pl)[0],hit=a&&(!b||a.distance<=b.distance+0.3)?pls[a.instanceId]:b?L[b.instanceId]:null;return hit;}
  var down=null;renderer.domElement.addEventListener("pointerdown",function(e){down=[e.clientX,e.clientY];});
  renderer.domElement.addEventListener("pointerup",function(e){if(!down)return;var mv=Math.abs(e.clientX-down[0])+Math.abs(e.clientY-down[1]);down=null;if(mv>6)return;var l=pick(e);if(l)F.openLoc(l.id);});
  var last=0;renderer.domElement.addEventListener("pointermove",function(e){var n=performance.now();if(n-last<60)return;last=n;var l=pick(e);if(l){var p=C.idx().palByLoc[l.id];tt.innerHTML='<b class="mono" style="direction:ltr;display:inline-block">'+C.locShort(l.id)+'</b> — '+C.LS[C.lstat(l)][0]+(p?'<br>'+esc(C.prodName(p.productId))+' • '+u.n(p.qty)+' '+p.unit+'<br>'+esc(C.cusName(p.customerId)):"");tt.style.display="block";var r=box.getBoundingClientRect();tt.style.left=Math.min(e.clientX-r.left+14,r.width-200)+"px";tt.style.top=(e.clientY-r.top+14)+"px";renderer.domElement.style.cursor="pointer";}else{tt.style.display="none";renderer.domElement.style.cursor="grab";}});
  renderer.domElement.addEventListener("pointerleave",function(){tt.style.display="none";});
  /* buttons */
  var rb=document.createElement("button");rb.className="btn xs";rb.style.cssText="position:absolute;top:10px;inset-inline-end:10px";rb.textContent="إعادة ضبط الكاميرا";rb.onclick=function(){WS.cam=null;W.app.renderPage();};box.appendChild(rb);
  /* loop */
  var raf=0,alive=true,t0=performance.now();function loop(){if(!alive)return;raf=requestAnimationFrame(loop);var t=(performance.now()-t0)/1000;hls.forEach(function(m){var s=1+Math.sin(t*4)*0.06;m.scale.set(s,s,s);m.material.opacity=.38+Math.sin(t*4)*.14;});ctl.update();renderer.render(scene,cam);}loop();
  function onResize(){var b=document.getElementById("v3d");if(!b)return;var w2=b.clientWidth,h2=b.clientHeight;renderer.setSize(w2,h2);cam.aspect=w2/h2;cam.updateProjectionMatrix();}window.addEventListener("resize",onResize);
  W.cleanup.push(function(){alive=false;cancelAnimationFrame(raf);window.removeEventListener("resize",onResize);WS.cam={p:cam.position.toArray(),t:ctl.target.toArray()};WS.repaint=null;ctl.dispose();renderer.dispose();});
  window.__wh3d={scene:scene,cam:cam,ready:true,locs:L.length,pallets:pls.length};}
})();
