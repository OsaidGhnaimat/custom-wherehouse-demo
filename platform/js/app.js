/* App shell: router, roles, sidebar, top bar, search, notifications, demo bar, portals shell. */
(function(){
"use strict";
var W=window.W=window.W||{};
var u=W.u,esc=u.esc,C=W.core,UI=W.ui,I=W.icon,store=W.store;
W.pages={};W.fn={};W.cleanup=[];
var App=W.app={};

W.me=function(){var s=W.session;if(s.role==="customer")return C.cus(s.user);if(s.role==="supplier")return C.sup(s.user);return C.emp(s.user)||C.emp("EMP-001");};
W.empId=function(){var s=W.session;return (s.role==="admin"||s.role==="employee")?(s.user||"EMP-001"):"EMP-001";};
W.isStaff=function(){return W.session.role==="admin"||W.session.role==="employee";};
W.inWh=function(wh){return W.session.wh==="all"||!W.session.wh||W.session.wh===wh;};
W.canDo=function(k){if(!W.isStaff())return false;var e=W.me();var p=store.state.settings.rolePerms[e.role]||[];return p.indexOf(k)>-1;};

var MENU=[
 {k:"dashboard",t:"لوحة التحكم",r:"dashboard",i:"dash"},
 {k:"warehouse",t:"المستودعات والخريطة",r:"warehouse",i:"map"},
 {k:"inventory",t:"المخزون",r:"inventory",i:"box"},
 {k:"ops",t:"العمليات التشغيلية",i:"flow",sub:[["الاستلام","ops/receiving","ops"],["التخزين","ops/storage","ops"],["النقل الداخلي","ops/transfers","ops"],["التسليم والسحب","ops/outbound","ops"],["الجرد","ops/counts","ops"],["سجل الحركات والمسؤولية","movements","movements"]]},
 {k:"cust",t:"العملاء",i:"users",sub:[["قائمة العملاء","customers","customers"],["طلبات العملاء","requests","requests"]]},
 {k:"suppliers",t:"بوابة الموردين",r:"suppliers",i:"truck"},
 {k:"appointments",t:"حجوزات المواعيد",r:"appointments",i:"cal"},
 {k:"billing",t:"الفوترة والتسعير",r:"billing",i:"bill"},
 {k:"inspections",t:"الفحص والتوثيق",r:"inspections",i:"check"},
 {k:"space",t:"إدارة المساحات",r:"space",i:"grid"},
 {k:"expiry",t:"الصلاحية والتشغيلات",r:"expiry",i:"clock"},
 {k:"employees",t:"الموظفون والأداء",r:"employees",i:"badge"},
 {k:"reports",t:"التقارير والتحليلات",r:"reports",i:"chart"},
 {k:"sys",t:"إعدادات النظام والتكاملات",i:"plug",sub:[["التكاملات مع ERP","integrations","integrations"],["إعدادات النظام","settings","settings"],["مركز الإشعارات","notifications","dashboard"]]}
];
var PORTAL_NAV={customer:[["الرئيسية","portal/home"],["مخزوني","portal/stock"],["طلباتي","portal/requests"],["سجل الحركات","portal/moves"],["الفواتير","portal/billing"]],supplier:[["الرئيسية","supplier/home"],["حجز موعد توريد","supplier/book"],["موادي","supplier/materials"],["سجل التسليمات","supplier/history"]]};

/* ---------- routing ---------- */
App.parse=function(){var h=location.hash.replace(/^#\/?/,""),q={},i=h.indexOf("?");if(i>-1){h.slice(i+1).split("&").forEach(function(p){var kv=p.split("=");q[kv[0]]=decodeURIComponent(kv[1]||"");});h=h.slice(0,i);}return {seg:h.split("/").filter(Boolean),q:q,raw:h};};
App.home=function(){var r=W.session.role;return r==="customer"?"portal/home":r==="supplier"?"supplier/home":"dashboard";};
W.go=function(link){if(!link)return;var m;
  if((m=link.match(/^pallet\/(.+)$/)))return W.fn.openPallet(m[1]);
  if((m=link.match(/^loc\/(.+)$/)))return W.fn.openLoc(m[1]);
  if((m=link.match(/^appt\/(.+)$/)))return W.fn.openAppt(m[1]);
  if((m=link.match(/^mov\/(.+)$/)))return W.fn.openMov(m[1]);
  UI.closeDrawer();UI.closeAllModals();if(location.hash==="#/"+link)App.renderPage();else location.hash="#/"+link;};
W.act.go=function(el){W.go(el.dataset.link);};
function resolve(ctx){var s=ctx.seg,k2=s[0]+"/"+(s[1]||""),pg=W.pages[k2]||W.pages[s[0]];return pg;}
function allowed(key){if(!W.isStaff())return true;return W.canDo(key);}
App.renderPage=function(){var ctx=App.parse(),role=W.session.role,box=document.getElementById("page");if(!box)return;
  var inPortal=ctx.seg[0]==="portal"||ctx.seg[0]==="supplier";
  if((role==="customer"&&ctx.seg[0]!=="portal")||(role==="supplier"&&ctx.seg[0]!=="supplier")||(W.isStaff()&&inPortal)){location.replace("#/"+App.home());return;}
  var pg=resolve(ctx);if(!pg){location.replace("#/"+App.home());return;}
  if(pg.perm&&!allowed(pg.perm)){box.innerHTML='<div class="card pad">'+UI.empty("لا تملك صلاحية الوصول","<span>دورك الحالي لا يسمح بفتح هذه الصفحة. بدّل الدور من أعلى الصفحة لعرضها.</span>")+'</div>';return;}
  W.cleanup.forEach(function(f){try{f();}catch(e){}});W.cleanup=[];
  var sy=window.scrollY;
  try{box.innerHTML=pg.render(ctx);if(pg.after)pg.after(ctx);}catch(e){console.error(e);box.innerHTML='<div class="card pad"><div class="note err">حدث خطأ أثناء عرض الصفحة: '+esc(e.message)+'</div></div>';}
  if(App._lastKey===ctx.raw)window.scrollTo(0,sy);else window.scrollTo(0,0);App._lastKey=ctx.raw;
  document.title=(pg.title||"المنصة")+" — Jordan Logistics & Storage";App.markNav(ctx);App.updateBadges();};
App.markNav=function(ctx){document.querySelectorAll("[data-nav]").forEach(function(a){var r=a.dataset.nav,on=r===ctx.seg.slice(0,r.split("/").length).join("/")&&(r.split("/").length>1||ctx.seg[0]===r);a.classList.toggle("on",on);if(on){var g=a.closest(".grp");if(g)g.classList.add("open");}});};

/* ---------- shell ---------- */
function navHtml(){var h="";MENU.forEach(function(m){
  if(m.sub){var subs=m.sub.filter(function(s){return allowed(s[2]);});if(!subs.length)return;
    h+='<div class="grp" data-g="'+m.k+'"><button data-act="toggleGrp">'+I(m.i)+'<span>'+m.t+'</span><span class="car">'+I("car")+'</span></button><div class="sub">'+subs.map(function(s){return '<a href="#/'+s[1]+'" data-nav="'+s[1]+'" data-act="navClick">'+s[0]+(s[1]==="requests"?'<span class="badge-n" id="nb-req" style="display:none"></span>':s[1]==="notifications"?'<span class="badge-n" id="nb-ntf" style="display:none"></span>':'')+'</a>';}).join("")+'</div></div>';}
  else if(allowed(m.k))h+='<a href="#/'+m.r+'" data-nav="'+m.r+'" data-act="navClick">'+I(m.i)+'<span>'+m.t+'</span>'+(m.k==="appointments"?'<span class="badge-n" id="nb-bk" style="display:none"></span>':'')+'</a>';});return h;}
W.act.navClick=function(){document.querySelector(".side")&&document.querySelector(".side").classList.remove("open");};
W.act.toggleGrp=function(el){el.parentNode.classList.toggle("open");};
var ROLE_LBL={admin:"مدير النظام",employee:"موظف مستودع",customer:"عميل",supplier:"مورّد"};
App.demoBar=function(){var off=store.state.meta.clockOffsetDays||0;return '<div class="demobar"><button class="btn xs primary" data-act="logout" title="الرجوع لاختيار البوابة">→ تبديل الدور / البوابة</button><b>DEMO</b><span>نسخة تجريبية ببيانات محاكاة — التغييرات تُحفظ في متصفحك فقط. تاريخ النظام: <strong class="ltr">'+u.date(+W.now())+'</strong>'+(off?' (+'+off+' يوم)':'')+'</span><span class="lnk"><span class="mute">تقديم الوقت لمحاكاة الفوترة:</span><button class="btn xs" data-act="timeTravel" data-d="1">+1 يوم</button><button class="btn xs" data-act="timeTravel" data-d="7">+7 أيام</button><button class="btn xs" data-act="timeTravel" data-d="30">+30 يوم</button><button class="btn xs danger" data-act="resetDemo">إعادة ضبط البيانات</button></span></div>';};
W.act.timeTravel=function(el){store.state.meta.clockOffsetDays=(store.state.meta.clockOffsetDays||0)+(+el.dataset.d);C.dirty();store.commit();UI.toast("تم تقديم تاريخ النظام "+el.dataset.d+" يوم — الفوترة والصلاحيات تتحدّث تلقائياً","ok");};
W.act.resetDemo=function(){UI.confirm("سيتم حذف كل التغييرات واستعادة البيانات التجريبية الأصلية. هل تريد المتابعة؟",function(){store.reset();C.dirty();UI.toast("تمت إعادة ضبط بيانات العرض","ok");App.mount();},{danger:true,ok:"إعادة الضبط"});};

App.mount=function(){var root=document.getElementById("root"),r=W.session.role;UI.closeAllModals();UI.closeDrawer();
  if(!r){root.innerHTML=loginHtml();return;}
  if(r==="customer"||r==="supplier"){var me=W.me(),nav=PORTAL_NAV[r];
    root.innerHTML=App.demoBar()+'<div class="pt-top"><div class="in"><div class="row"><div class="brand" style="border:0;padding:0"><div class="lg">'+(r==="customer"?"C":"S")+'</div><b style="color:var(--text)">'+(r==="customer"?"بوابة العملاء":"بوابة الموردين")+'<span style="color:var(--mute)">Jordan Logistics & Storage</span></b></div></div><nav class="pt-nav grow">'+nav.map(function(n){return '<a data-nav="'+n[1]+'" href="#/'+n[1]+'">'+n[0]+'</a>';}).join("")+'</nav><div class="row relw"><button class="ib" data-act="togglePop" data-pop="ntf" aria-label="الإشعارات">'+I("bell")+'<span class="dot" id="ntf-dot" style="display:none"></span></button><button class="btn sm" data-act="togglePop" data-pop="role">'+I("user")+'<span>'+esc(me.name)+'</span></button><div id="pop-host"></div></div></div></div><div class="pt-body" id="page"></div>';}
  else{var me2=W.me();
    root.innerHTML='<div class="app"><aside class="side" id="side"><div class="brand"><div class="lg">J</div><div><b>Jordan Logistics</b><span>Warehouse Operations Platform</span></div></div><nav class="nav">'+navHtml()+'</nav></aside><div class="main">'+App.demoBar()+
    '<header class="top"><button class="ib menu-btn" data-act="toggleSide" aria-label="القائمة">'+I("menu")+'</button><div class="search"><span>'+I("search")+'</span><input id="gs" placeholder="بحث شامل: طبلية، منتج، عميل، موقع، فاتورة..." autocomplete="off" data-inp="gsearch"><div class="sres" id="sres" style="display:none"></div></div>'+
    '<div class="tb relw"><select class="sel-top" data-chg="whsel" title="المستودع الحالي"><option value="all">كل المستودعات</option>'+store.state.warehouses.map(function(w){return '<option value="'+w.id+'"'+(W.session.wh===w.id?" selected":"")+'>'+w.name+'</option>';}).join("")+'</select>'+
    '<button class="btn primary sm" data-act="togglePop" data-pop="quick">'+I("plus")+'<span>إجراء سريع</span></button><button class="ib" data-act="togglePop" data-pop="ntf" aria-label="الإشعارات">'+I("bell")+'<span class="dot" id="ntf-dot" style="display:none"></span></button><button class="btn sm" data-act="togglePop" data-pop="role">'+I("user")+'<span>'+esc(me2.name)+'</span></button><div id="pop-host"></div></div></header><div class="content" id="page"></div></div></div>';}
  App.renderPage();};
W.act.toggleSide=function(){document.getElementById("side").classList.toggle("open");};
W.chg.whsel=function(el){W.session.wh=el.value;W.saveSession();App.renderPage();};

/* ---------- popovers ---------- */
function closePop(){var h=document.getElementById("pop-host");if(h)h.innerHTML="";App.popOpen=null;}
W.act.togglePop=function(el){var k=el.dataset.pop;if(App.popOpen===k){closePop();return;}App.popOpen=k;var h=document.getElementById("pop-host");
  if(k==="ntf")h.innerHTML='<div class="pop" id="pop">'+ntfPop()+'</div>';
  else if(k==="quick")h.innerHTML='<div class="pop" style="width:280px"><div class="ph"><b>إجراءات سريعة</b></div>'+[["استلام شحنة جديدة","newReceiving","down"],["طلب سحب جديد","newWithdrawal","up"],["نقل داخلي لطبلية","goTransfer","swap"],["حجز موعد جديد","newAppt","cal"],["فحص / توثيق جديد","newInspection","check"],["عميل جديد","newCustomer","users"]].filter(function(q){return true;}).map(function(q){return '<div class="it" data-act="quick" data-q="'+q[1]+'"><span class="ico">'+I(q[2])+'</span><div class="grow b">'+q[0]+'</div></div>';}).join("")+'</div>';
  else if(k==="role")h.innerHTML='<div class="pop" style="width:330px"><div class="ph"><b>الدور التجريبي</b><span class="badge blue">'+ROLE_LBL[W.session.role]+'</span></div><div style="padding:12px" class="col">'+personaHtml()+'</div></div>';};
document.addEventListener("click",function(e){if(App.popOpen&&!e.target.closest(".pop")&&!e.target.closest("[data-pop]"))closePop();var sr=document.getElementById("sres");if(sr&&!e.target.closest(".search"))sr.style.display="none";});
function personaHtml(){var s=W.session,st=store.state;
  var emps=st.employees.filter(function(e){return e.role!=="admin";});
  return '<div class="sm mute">اختر الدور لمعاينة النظام من منظور مختلف. البيانات والتغييرات مشتركة بين الأدوار.</div>'+
  ['admin','employee','customer','supplier'].map(function(r){var extra="";
    if(r==="employee")extra='<select class="inp mt8" data-chg="persona" data-r="employee">'+UI.opts(emps.map(function(e){return [e.id,e.name+" — "+C.ROLES[e.role]];}),s.role==="employee"?s.user:"EMP-004")+'</select>';
    if(r==="customer")extra='<select class="inp mt8" data-chg="persona" data-r="customer">'+UI.opts(st.customers.map(function(c){return [c.id,c.name];}),s.role==="customer"?s.user:"CUS-001")+'</select>';
    if(r==="supplier")extra='<select class="inp mt8" data-chg="persona" data-r="supplier">'+UI.opts(st.suppliers.map(function(c){return [c.id,c.name];}),s.role==="supplier"?s.user:"SUP-001")+'</select>';
    return '<div class="card pad" style="'+(s.role===r?'border-color:var(--blue)':'')+'"><div class="row between"><b>'+ROLE_LBL[r]+'</b><button class="btn xs '+(s.role===r?'':'primary')+'" data-act="setRole" data-r="'+r+'">'+(s.role===r?'الحالي':'دخول')+'</button></div>'+extra+'</div>';}).join("")+'<button class="btn" data-act="logout">'+I("out")+' الرجوع لشاشة اختيار الدور</button>';}
function selUser(role,el){var sel=el&&el.parentNode.querySelector('select[data-r="'+role+'"]');if(sel)return sel.value;return {admin:"EMP-001",employee:"EMP-004",customer:"CUS-001",supplier:"SUP-001"}[role];}
W.chg.persona=function(el){if(W.session.role===el.dataset.r){W.session.user=el.value;W.saveSession();closePop();App.mount();}};
W.act.setRole=function(el){var r=el.dataset.r;W.session.role=r;W.session.user=selUser(r,el);if(r==="admin")W.session.user="EMP-001";W.saveSession();closePop();location.hash="#/"+App.home();App.mount();};
W.act.logout=function(){W.session.role=null;W.saveSession();closePop();location.hash="";App.mount();};
W.act.quick=function(el){closePop();var q=el.dataset.q;if(q==="goTransfer")W.go("ops/transfers");else if(W.fn[q])W.fn[q]();};

/* notifications popover + page */
var NCAT={request:"طلبات",booking:"حجوزات",receiving:"استلام",damage:"أضرار",expiry:"صلاحية",capacity:"سعة",delay:"تأخير",sync:"مزامنة",invoice:"فواتير"};
App.NCAT=NCAT;
function ntfItems(list){return list.map(function(n){return '<div class="it '+(n.read?"rd":"un")+'" data-act="openNtf" data-id="'+n.id+'"><span class="d"></span><div class="grow"><div class="b">'+esc(n.title)+'</div><div class="sm mute">'+esc(n.body)+'</div><div class="xs mute">'+u.dt(n.ts)+' • '+NCAT[n.cat]+'</div></div></div>';}).join("")||UI.empty("لا توجد إشعارات");}
function myNtf(){var st=store.state,r=W.session.role;if(r==="customer"){return st.notifications.filter(function(n){return false;});}return st.notifications;}
function ntfPop(){var list=store.state.notifications.slice(0,8);if(W.session.role==="customer"||W.session.role==="supplier")list=portalNtf();
  return '<div class="ph"><b>الإشعارات</b>'+(W.isStaff()?'<button class="btn xs" data-act="readAll">تعليم الكل كمقروء</button>':'')+'</div>'+ntfItems(list)+(W.isStaff()?'<div class="it" data-act="go" data-link="notifications" style="justify-content:center;color:var(--blue)">عرض كل الإشعارات</div>':'');}
function portalNtf(){var out=[],st=store.state,s=W.session;if(s.role==="customer"){st.requests.filter(function(r){return r.customerId===s.user;}).slice(-3).forEach(function(r){out.push({id:"x"+r.id,read:true,title:r.title,body:"الحالة: "+(C.WSTAT[r.status]||[r.status])[0],ts:r.history[r.history.length-1].ts,cat:"request"});});st.withdrawals.filter(function(w){return w.customerId===s.user;}).slice(-3).forEach(function(w){out.push({id:"y"+w.id,read:true,title:"طلب سحب "+w.id,body:"الحالة: "+C.WSTAT[w.status][0],ts:w.history[w.history.length-1].ts,cat:"request"});});}
  else{st.appointments.filter(function(a){return a.party.id===s.user;}).slice(-5).forEach(function(a){out.push({id:"z"+a.id,read:true,title:"موعد "+a.id,body:"الحالة: "+C.APPT[a.status][0],ts:+W.now(),cat:"booking"});});}return out.sort(function(a,b){return b.ts-a.ts;}).slice(0,6);}
W.act.openNtf=function(el){var n=store.state.notifications.filter(function(x){return x.id===el.dataset.id;})[0];if(n){n.read=true;store.commit();closePop();if(n.link)W.go(n.link);}else closePop();};
W.act.readAll=function(){store.state.notifications.forEach(function(n){n.read=true;});store.commit();closePop();};
App.updateBadges=function(){var un=store.state.notifications.filter(function(n){return !n.read;}).length;var d=document.getElementById("ntf-dot");if(d){var show=W.isStaff()&&un>0;d.style.display=show?"grid":"none";d.textContent=un;}
  var nn=document.getElementById("nb-ntf");if(nn){nn.style.display=un?"":"none";nn.textContent=un;}
  var p=C.pending(),r=document.getElementById("nb-req");if(r){r.style.display=p.requests?"":"none";r.textContent=p.requests;}var b=document.getElementById("nb-bk");if(b){b.style.display=p.bookings?"":"none";b.textContent=p.bookings;}};

/* ---------- global search ---------- */
W.inp.gsearch=function(el){var box=document.getElementById("sres"),q=el.value;if(q.trim().length<2){box.style.display="none";return;}var res=C.search(q);
  box.innerHTML=res.length?res.map(function(r){return '<a data-act="searchGo" data-link="'+esc(r.link)+'"><span class="t">'+r.t+'</span><div class="grow"><div class="b">'+esc(r.txt)+'</div><div class="xs mute">'+esc(r.sub)+'</div></div></a>';}).join(""):'<div class="empty">لا نتائج مطابقة</div>';box.style.display="block";};
W.act.searchGo=function(el){document.getElementById("sres").style.display="none";document.getElementById("gs").value="";W.go(el.dataset.link);};

/* ---------- login / demo entry ---------- */
function loginHtml(){var st=store.state;
  var roles=[["admin","مدير المستودع","إدارة كاملة: العمليات، العملاء، الفوترة، التقارير والتكاملات.","dash"],["employee","موظف مستودع","الاستلام، التخزين، النقل، السحب والجرد حسب صلاحيات دوره.","truck"],["customer","عميل","بوابة العميل: مخزونه، طلباته، حركاته وفواتيره فقط.","users"],["supplier","مورّد","حجز مواعيد التوريد وتتبع التسليمات.","cal"]];
  return '<div class="login"><div class="box"><div class="row"><div class="brand" style="border:0;padding:0"><div class="lg" style="width:44px;height:44px">J</div><div><b style="font-size:17px">Jordan Logistics & Storage</b><span>Warehouse Operations & Visibility Platform</span></div></div></div><div style="margin-top:14px"><a href="index.html" style="color:#b6c6ea;font-size:13px">→ العودة للصفحة الرئيسية</a></div><h1 style="margin-top:14px">اعرف أين بضاعتك، ومن المسؤول عنها، وكم تكلّفك.</h1><p style="color:#b6c6ea;max-width:640px">منصة تشغيل ورؤية للمستودعات تعمل بجانب نظام الـ ERP الحالي (SAP، Oracle، Odoo، Dynamics وغيرها) وليست بديلاً عنه. اختر دوراً لتجربة النظام. لا يوجد تسجيل دخول حقيقي، والبيانات كلها محاكاة.</p>'+
  '<div class="roles">'+roles.map(function(r){var extra="";if(r[0]==="employee")extra='<select data-chg="loginPersona" data-r="employee" onclick="event.stopPropagation()">'+UI.opts(st.employees.filter(function(e){return e.role!=="admin"&&e.role!=="accountant";}).map(function(e){return [e.id,e.name+" — "+C.ROLES[e.role]];}),"EMP-004")+'</select>';
    if(r[0]==="customer")extra='<select data-chg="loginPersona" data-r="customer" onclick="event.stopPropagation()">'+UI.opts(st.customers.map(function(c){return [c.id,c.name];}),"CUS-001")+'</select>';
    if(r[0]==="supplier")extra='<select data-chg="loginPersona" data-r="supplier" onclick="event.stopPropagation()">'+UI.opts(st.suppliers.map(function(c){return [c.id,c.name];}),"SUP-001")+'</select>';
    return '<div class="role" data-act="enterRole" data-r="'+r[0]+'" role="button" tabindex="0"><div class="ri">'+I(r[3])+'</div><b style="font-size:16px">'+r[1]+'</b><span>'+r[2]+'</span>'+extra+'</div>';}).join("")+'</div><p style="margin-top:22px;font-size:12.5px;color:#8fa2c6">وضع عرض تجريبي — لا ترتبط هذه النسخة بأي نظام ERP حقيقي، والفواتير والأسعار والأداء كلها بيانات محاكاة.</p></div></div>';}
W.chg.loginPersona=function(){};
W.act.enterRole=function(el){var r=el.dataset.r,sel=el.querySelector("select");W.session.role=r;W.session.user=r==="admin"?"EMP-001":(sel?sel.value:selUser(r));W.saveSession();location.hash="#/"+App.home();App.mount();};

/* ---------- boot ---------- */
window.addEventListener("hashchange",function(){if(W.session.role){UI.closeDrawer();App.renderPage();}});
var rt=null;store.on(function(){if(!W.session.role)return;clearTimeout(rt);rt=setTimeout(function(){var pg=resolve(App.parse());if(pg&&pg.onData){try{pg.onData();}catch(e){console.error(e);}}else App.renderPage();var d=document.querySelector(".demobar");if(d)d.outerHTML=App.demoBar();},30);});
W.boot=function(){W.loadSession();store.load();C.dirty();
  if(W.session.role==="admin"&&!C.emp(W.session.user))W.session.user="EMP-001";
  if(W.session.role&&((W.session.role==="customer"&&!C.cus(W.session.user))||(W.session.role==="supplier"&&!C.sup(W.session.user))||(W.isStaff()&&!C.emp(W.session.user))))W.session.role=null;
  var d=document.createElement("div");d.className="toasts";d.id="toasts";document.body.appendChild(d);
  App.mount();};
})();
