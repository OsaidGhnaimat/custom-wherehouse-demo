/* Shared detail views and helpers used across pages. */
(function(){
"use strict";
var W=window.W,u=W.u,esc=u.esc,C=W.core,UI=W.ui,I=W.icon,store=W.store,F=W.fn;

F.kpi=function(label,val,sub,link,cls){return '<div class="card kpi '+(cls||"")+'"'+(link?' data-act="go" data-link="'+link+'" role="link" tabindex="0"':'')+'><div class="l">'+label+'</div><div class="v">'+val+'</div><div class="s">'+(sub||"&nbsp;")+'</div></div>';};
F.done=function(msg,type){C.dirty();store.commit();if(msg)UI.toast(msg,type||"ok");};
F.errs=function(res){UI.toast((res.errors||["تعذّر تنفيذ العملية"]).map(esc).join("<br>"),"err");};
F.link=function(link,txt,cls){return '<a data-act="go" data-link="'+link+'" class="b" style="color:var(--blue);cursor:pointer'+(cls||"")+'">'+esc(txt)+'</a>';};
F.cusLink=function(id){return W.isStaff()?F.link("customers/"+id,C.cusName(id)):esc(C.cusName(id));};
F.palLink=function(id){return '<a data-act="go" data-link="pallet/'+id+'" class="mono" style="color:var(--blue);cursor:pointer">'+id+'</a>';};
F.locLink=function(id){return id?'<a data-act="go" data-link="loc/'+id+'" class="mono" style="color:var(--blue);cursor:pointer">'+C.locShort(id)+'</a>':'<span class="mute">—</span>';};
F.expBadge=function(ts){if(!ts)return UI.badge("بدون صلاحية","gray");var c=C.EXP[C.expClass(ts)];return UI.badge(u.date(ts)+" • "+c[0],c[1]);};
F.movBadge=function(t){var m=C.MOVT[t]||[t,"gray"];return UI.badge(m[0],m[1]);};
F.emp=function(){return W.empId();};
F.empOpts=function(roles,wh,sel,ph){var l=store.state.employees.filter(function(e){return (!roles||roles.indexOf(e.role)>-1)&&(!wh||e.wh===wh||e.role==="admin");});return UI.opts(l.map(function(e){return [e.id,e.name+" — "+C.ROLES[e.role]];}),sel,ph);};
F.cusOpts=function(sel,ph){return UI.opts(store.state.customers.filter(function(c){return c.status==="active";}).map(function(c){return [c.id,c.name];}),sel,ph);};
F.whOpts=function(sel,ph){return UI.opts(store.state.warehouses.map(function(w){return [w.id,w.name];}),sel,ph);};
F.prodOpts=function(cid,sel,ph){return UI.opts(store.state.products.filter(function(p){return !cid||p.ownerId===cid;}).map(function(p){return [p.id,p.name+" ("+p.sku+")"];}),sel,ph);};
F.normLoc=function(v){v=String(v||"").trim().toUpperCase().replace(/\s+/g,"");if(v&&v.indexOf("WH-")!==0)v="WH-"+v;return v;};
F.whScope=function(list,key){if(W.session.wh==="all"||!W.session.wh)return list;return list.filter(function(x){return x[key||"wh"]===W.session.wh;});};
F.tabs=function(id,list,cur){return '<div class="tabs" role="tablist">'+list.map(function(t){return '<button role="tab" class="'+(t[0]===cur?"on":"")+'" data-act="tab" data-tabs="'+id+'" data-t="'+t[0]+'">'+t[1]+'</button>';}).join("")+'</div>';};
var TAB={};F.tabState=function(id,def){return TAB[id]||def;};
W.act.tab=function(el){TAB[el.dataset.tabs]=el.dataset.t;W.app.renderPage();};
F.pageSimple=function(o){W.pages[o.key]={perm:o.perm,title:o.title,render:o.render,after:o.after,onData:o.onData};};
F.photoCount=function(x){return Array.isArray(x)?x.length:(+x||0);};

/* ---------- pallet drawer ---------- */
F.openPallet=function(id){var p=C.pallet(id);if(!p)return UI.toast("الطبلية غير موجودة","err");var role=W.session.role;
  if(role==="customer"&&p.customerId!==W.session.user)return UI.toast("لا تملك صلاحية عرض هذه الطبلية","err");
  var staff=W.isStaff(),prod=C.product(p.productId),cus=C.cus(p.customerId),hide=role==="customer"&&!cus.showLoc,st=C.pstatus(p),ops=W.canDo("ops");
  var movs=store.state.movements.filter(function(m){return m.palletId===p.id;}).sort(function(a,b){return b.ts-a.ts;});
  var body='<div class="row wrap mb12">'+UI.pBadge(p)+(prod.storage==="cold"?UI.badge("مبرّد","cyan"):"")+(p.expiry?F.expBadge(p.expiry):"")+'</div>'+
  UI.kv([["رقم الطبلية",'<span class="mono">'+p.id+'</span>'],["المنتج",esc(prod.name)+' <span class="mute mono">'+prod.sku+'</span>'],["العميل",F.cusLink(p.customerId)],["رقم التشغيلة (Lot)",'<span class="mono">'+esc(p.lot)+'</span>'],["تاريخ الإنتاج",u.date(p.mfg)],["تاريخ الانتهاء",p.expiry?u.date(p.expiry):"لا يوجد"],
    ["الكمية الحالية",u.n(p.qty)+" "+p.unit+(p.qty!==p.initQty?' <span class="mute">(من '+u.n(p.initQty)+')</span>':"")],["المحجوز لطلبات سحب",p.reservedQty?u.n(p.reservedQty)+" "+p.unit:"—"],["الوزن / الحجم التقديري",u.n(C.palletWeight(p))+" كغ • "+C.palletVolume(p)+" م³"],
    ["المستودع",C.whName(p.wh)],["الموقع",hide?'<span class="mute">غير معروض (إعداد العميل)</span>':p.locationId?F.locLink(p.locationId)+' <span class="mute sm">'+esc(C.zoneLabel(C.loc(p.locationId).zone))+'</span>':(p.withdrawnAt?"—":"منطقة الاستلام — بانتظار التخزين")],
    ["تاريخ الاستلام",u.dt(p.receivedAt)],["تاريخ التخزين",p.storedAt?u.dt(p.storedAt):"—"],["مدة التخزين",C.days(p)+" يوم"],p.withdrawnAt?["تاريخ السحب",u.dt(p.withdrawnAt)]:null,["رقم الاستلام",p.receivingId||"—"],["صور الاستلام",p.images?p.images+" (محاكاة)":"—"]].filter(Boolean))+
  '<h3 class="mt16 mb8">سجل حركة الطبلية</h3>'+(movs.length?UI.timeline(movs.slice(0,12).map(function(m){var cl={receive:"g",store:"",transfer:"",withdraw:"y",adjust:"r",damage:"r",inspect:""}[m.type];return {c:cl,title:(C.MOVT[m.type]||[m.type])[0]+(m.qtyBefore!=null&&m.qtyAfter!=null&&m.qtyBefore!==m.qtyAfter?" — "+u.n(m.qtyBefore)+" ← "+u.n(m.qtyAfter):""),sub:u.dt(m.ts)+" • "+esc(C.empName(m.empId))+(m.from||m.to?" • "+(hide?"":C.locShort(m.from)+" ← "+C.locShort(m.to)):"")+(m.note?" • "+esc(m.note):"")};})):UI.empty("لا توجد حركات"));
  var ft="";
  if(staff&&ops&&!p.withdrawnAt){
    if(p.locationId)ft+='<button class="btn primary" data-act="palTransfer" data-id="'+p.id+'">'+I("swap")+' نقل داخلي</button><button class="btn" data-act="go" data-link="warehouse?pallet='+p.id+'">'+I("map")+' عرض على الخريطة</button>';
    else ft+='<button class="btn primary" data-act="go" data-link="ops/storage">'+I("box")+' تحديد موقع التخزين</button>';
    if(st==="available"||st==="reserved"||st==="pending_withdrawal"||st==="pending_storage"){ft+='<button class="btn danger" data-act="palStatus" data-id="'+p.id+'" data-s="damaged">تعليم كتالفة</button><button class="btn" data-act="palStatus" data-id="'+p.id+'" data-s="quarantined">حجر صحي</button><button class="btn" data-act="palStatus" data-id="'+p.id+'" data-s="blocked">إيقاف</button>';}
    else if(["damaged","quarantined","blocked"].indexOf(p.status)>-1)ft+='<button class="btn success" data-act="palStatus" data-id="'+p.id+'" data-s="available">'+I("check")+' إعادة للمخزون المتاح</button>';}
  UI.drawer({kicker:"ملف طبلية",title:esc(prod.name),body:body,footer:ft});};
W.act.palTransfer=function(el){UI.closeDrawer();F.transferModal(el.dataset.id);};
W.act.palStatus=function(el){var p=C.pallet(el.dataset.id),s=el.dataset.s,lbl={damaged:"تالفة",quarantined:"حجر صحي",blocked:"موقوفة",available:"متاحة"}[s];
  UI.confirm("تغيير حالة الطبلية "+p.id+" إلى «"+lbl+"»؟ سيتم تسجيل الإجراء في سجل المراجعة.",function(){var old=p.status;p.status=s;
    C.log(s==="damaged"?"damage":"inspect",p,{emp:F.emp(),from:p.locationId,qb:p.qty,qa:p.qty,note:"تغيير الحالة: "+old+" ← "+s});
    if(s==="damaged")C.notify("damage","err","بضاعة تالفة",p.id+" — "+C.cusName(p.customerId),"inspections");
    UI.closeDrawer();F.done("تم تحديث حالة الطبلية");},{danger:s==="damaged",ok:"تأكيد"});};

/* ---------- location drawer ---------- */
F.openLoc=function(id){var l=C.loc(id);if(!l)return UI.toast("الموقع غير موجود","err");var p=C.idx().palByLoc[id],s=C.lstat(l),ops=W.canDo("space")||W.canDo("ops"),z=C.zone(l.zone);
  var body='<div class="row wrap mb12">'+UI.lBadge(s)+(l.reservedFor?UI.badge("محجوز: "+C.cusName(l.reservedFor),"yellow"):"")+'</div>'+
   UI.kv([["رمز الموقع",'<span class="mono">'+C.locShort(l.id)+'</span>'],["المستودع",C.whName(l.wh)],["المنطقة",esc(z.name)],["الصف / الطابق / الموضع",l.row+" / "+l.level+" / "+l.pos],["نوع التخزين",W.ZONE_TYPES[l.type]],["درجة الحرارة",W.LAYOUT[l.zc].temp],["الحد الأقصى للوزن",u.n(l.maxWeight)+" كغ"],["ملاحظات",esc(l.note||"—")]])+
   '<h3 class="mt16 mb8">المحتوى الحالي</h3>'+(p?'<div class="card pad"><div class="row between"><div><div class="b">'+esc(C.prodName(p.productId))+'</div><div class="sm mute">'+esc(C.cusName(p.customerId))+' • '+F.palLink(p.id)+'</div></div>'+UI.pBadge(p)+'</div><div class="sm mt8">الكمية: <b>'+u.n(p.qty)+'</b> '+p.unit+' • الوزن: '+u.n(C.palletWeight(p))+' كغ / '+u.n(l.maxWeight)+' كغ</div>'+UI.progress(C.palletWeight(p)/l.maxWeight*100)+'</div>':'<div class="note">الموقع فارغ.</div>');
  var ft="";if(ops&&W.isStaff()){
    if(p)ft+='<button class="btn primary" data-act="go" data-link="pallet/'+p.id+'">فتح ملف الطبلية</button>';
    if(l.status==="active"&&!p)ft+='<button class="btn danger" data-act="locSet" data-id="'+l.id+'" data-s="blocked">حظر الموقع</button><button class="btn" data-act="locSet" data-id="'+l.id+'" data-s="inactive">تعطيل الموقع</button>';
    if(l.status!=="active")ft+='<button class="btn success" data-act="locSet" data-id="'+l.id+'" data-s="active">إعادة تفعيل</button>';
    if(l.status==="active"&&!p&&!l.reservedFor)ft+='<button class="btn" data-act="locReserve" data-id="'+l.id+'">حجز لعميل</button>';
    if(l.reservedFor)ft+='<button class="btn" data-act="locRelease" data-id="'+l.id+'">إلغاء الحجز</button>';}
  UI.drawer({kicker:"تفاصيل الموقع",title:'<span class="mono">'+C.locShort(l.id)+'</span>',body:body,footer:ft});};
W.act.locSet=function(el){var l=C.loc(el.dataset.id),s=el.dataset.s;
  if(s!=="active"&&C.idx().palByLoc[l.id])return UI.toast("لا يمكن حظر موقع مشغول. انقل الطبلية أولاً.","err");
  if(s==="active"){l.status="active";l.note="";C.log("inspect",null,{emp:F.emp(),wh:l.wh,to:l.id,note:"إعادة تفعيل الموقع"});UI.closeDrawer();return F.done("تم تفعيل الموقع");}
  UI.modal({title:s==="blocked"?"حظر الموقع":"تعطيل الموقع",body:'<form data-sub="locSetOk" data-id="'+l.id+'" data-s="'+s+'" id="lsf">'+UI.field("سبب الإجراء","note",{req:1,ph:"مثال: رف تالف بانتظار الصيانة"})+'</form>',footer:'<button class="btn" data-act="closeModal">إلغاء</button><button class="btn danger" onclick="document.getElementById(\'lsf\').requestSubmit()">تأكيد</button>'});};
W.sub.locSetOk=function(f){if(!UI.reqCheck(f))return;var l=C.loc(f.dataset.id),d=UI.form(f);l.status=f.dataset.s;l.note=d.note;C.log("inspect",null,{emp:F.emp(),wh:l.wh,to:l.id,note:(l.status==="blocked"?"حظر موقع: ":"تعطيل موقع: ")+d.note});UI.closeModal();UI.closeDrawer();F.done("تم تحديث حالة الموقع");};
W.act.locReserve=function(el){UI.modal({title:"حجز موقع لعميل",body:'<form data-sub="locResOk" data-id="'+el.dataset.id+'" id="lrf">'+UI.field("العميل","cid",{type:"select",req:1,options:F.cusOpts("","اختر العميل")})+UI.field("ملاحظة","note",{ph:"مثال: لشحنة قادمة"})+'</form>',footer:'<button class="btn" data-act="closeModal">إلغاء</button><button class="btn primary" onclick="document.getElementById(\'lrf\').requestSubmit()">حجز</button>'});};
W.sub.locResOk=function(f){if(!UI.reqCheck(f))return;var d=UI.form(f),l=C.loc(f.dataset.id);l.reservedFor=d.cid;l.note=d.note||"محجوز";C.log("inspect",null,{emp:F.emp(),wh:l.wh,to:l.id,customerId:d.cid,note:"حجز الموقع للعميل "+C.cusName(d.cid)});UI.closeModal();UI.closeDrawer();F.done("تم حجز الموقع");};
W.act.locRelease=function(el){var l=C.loc(el.dataset.id);l.reservedFor=null;l.note="";C.log("inspect",null,{emp:F.emp(),wh:l.wh,to:l.id,note:"إلغاء حجز الموقع"});UI.closeDrawer();F.done("تم إلغاء الحجز");};

/* ---------- transfer modal (validated) ---------- */
F.transferModal=function(pid,pre){var p=C.pallet(pid),sug=C.suggest(p,{exclude:[p.locationId],limit:5,wh:p.wh});
  var body='<div class="note mb12">الطبلية <b class="mono">'+p.id+'</b> — '+esc(C.prodName(p.productId))+' — '+esc(C.cusName(p.customerId))+'<br>الموقع الحالي: <span class="mono">'+C.locShort(p.locationId)+'</span> • الوزن '+u.n(C.palletWeight(p))+' كغ</div>'+
  '<form data-sub="transferOk" data-id="'+p.id+'" id="trf"><div class="fgrid">'+UI.field("الموقع الجديد","dest",{req:1,value:pre||"",ph:"مثال: A-ZA-R03-L01-P02",cls:"full",attrs:'class="mono ltr" autocomplete="off" data-inp="trLive" data-pid="'+p.id+'"'})+'<div class="full" id="trChk"></div>'+UI.field("ملاحظة","note",{cls:"full",ph:"سبب النقل (اختياري)"})+'</div></form>'+
  '<h3 class="mt16 mb8">اقتراحات النظام (حسب القواعد)</h3>'+(sug.length?'<div class="col gap6">'+sug.map(function(s){return '<div class="card pad row between" style="padding:9px 12px"><div><b class="mono">'+C.locShort(s.loc.id)+'</b> <span class="badge blue">تطابق '+s.score+'</span><div class="xs mute">'+s.reasons.slice(0,3).map(esc).join(" • ")+'</div></div><button class="btn xs" data-act="pickDest" data-v="'+C.locShort(s.loc.id)+'">اختيار</button></div>';}).join("")+'</div>':'<div class="note warn">لا توجد مواقع مناسبة متاحة حالياً.</div>');
  UI.modal({title:"نقل داخلي لطبلية",size:"lg",body:body,footer:'<button class="btn" data-act="closeModal">إلغاء</button><button class="btn primary" onclick="document.getElementById(\'trf\').requestSubmit()">'+I("swap")+' تأكيد النقل</button>'});if(pre)W.inp.trLive(document.querySelector('#trf [name=dest]'));};
function chkHtml(p,v){if(!v)return "";var id=F.normLoc(v),r=C.checkDest(p,id);if(id===p.locationId)return '<div class="note err">هذا هو الموقع الحالي للطبلية</div>';return r.ok?'<div class="note ok">'+I("check","")+' الموقع صالح — '+esc(C.zoneLabel(r.loc.zone))+'</div>':'<div class="note err"><b>لا يمكن النقل:</b><ul style="margin:4px 18px 0">'+r.errors.map(function(e){return '<li>'+esc(e)+'</li>';}).join("")+'</ul></div>';}
W.inp.trLive=function(el){var p=C.pallet(el.dataset.pid||(el.form&&el.form.dataset.id)),box=document.getElementById("trChk");if(box)box.innerHTML=chkHtml(p,el.value);};
W.act.pickDest=function(el){var i=document.querySelector("#trf [name=dest]");i.value=el.dataset.v;W.inp.trLive(i);};
W.sub.transferOk=function(f){if(!UI.reqCheck(f))return;var d=UI.form(f),id=F.normLoc(d.dest),r=C.transfer(f.dataset.id,id,F.emp(),d.note);if(!r.ok){document.getElementById("trChk").innerHTML='<div class="note err"><ul style="margin:0 18px">'+r.errors.map(function(e){return '<li>'+esc(e)+'</li>';}).join("")+'</ul></div>';return;}UI.closeModal();UI.closeDrawer();F.done("تم نقل الطبلية إلى "+C.locShort(id)+" وتحديث الخريطة");};

/* ---------- movement detail ---------- */
F.openMov=function(id){var m=store.state.movements.filter(function(x){return x.id===id;})[0];if(!m)return;var hide=W.session.role==="customer";
  UI.drawer({kicker:"سجل المراجعة (للقراءة فقط)",title:id,body:UI.kv([["نوع الحركة",F.movBadge(m.type)],["التاريخ والوقت",u.dt(m.ts)],["الطبلية",m.palletId?F.palLink(m.palletId):"—"],["المنتج",esc(C.prodName(m.productId))],["العميل",esc(C.cusName(m.customerId))],["المنفّذ",esc(C.empName(m.empId))],["من",m.from?C.locShort(m.from):"—"],["إلى",m.to?C.locShort(m.to):"—"],["الكمية قبل",m.qtyBefore!=null?u.n(m.qtyBefore):"—"],["الكمية بعد",m.qtyAfter!=null?u.n(m.qtyAfter):"—"],["المرجع",m.ref||"—"],["الحالة","مكتملة"],["ملاحظات",esc(m.note||"—")]])+'<div class="note mt16">سجل المراجعة لا يمكن تعديله أو حذفه — أي تصحيح يُسجّل كحركة جديدة.</div>'});};

/* ---------- print helper for documents ---------- */
F.docHead=function(title){var c=store.state.company;return '<div class="row between" style="border-bottom:2px solid var(--navy);padding-bottom:10px;margin-bottom:12px"><div><b style="font-size:16px">'+esc(c.name)+'</b><div class="sm mute">'+esc(c.city)+' • '+esc(c.phone)+'</div></div><div style="text-align:end"><b style="font-size:16px">'+title+'</b><div class="mt8">'+UI.sim("مستند تجريبي — ليس مستنداً ضريبياً")+'</div></div></div>';};
})();
