/* Business logic: indexes, validation, operations, billing, audit. Everything is a frontend simulation. */
(function(){
"use strict";
var W=window.W=window.W||{};
var u=W.u,store=W.store;
var C=W.core={};
var DAY=864e5,HOUR=36e5;
function ST(){return store.state;}
var _ix=null,_ixv=-1,_ixs=null;
C.dirty=function(){_ix=null;};

C.PS={available:["متاح","green"],reserved:["محجوز جزئياً","yellow"],pending_withdrawal:["بانتظار السحب","purple"],damaged:["تالف","red"],quarantined:["حجر صحي","red"],expired:["منتهي الصلاحية","red"],blocked:["موقوف","gray"],withdrawn:["مسحوب","gray"],pending_storage:["بانتظار التخزين","cyan"]};
C.LS={av:["متاح","green"],oc:["مشغول","blue"],rs:["محجوز","yellow"],bl:["محظور / يحتاج مراجعة","red"],"in":["غير مفعّل","gray"]};
C.WSTAT={submitted:["مقدّم","gray"],under_review:["قيد المراجعة","yellow"],approved:["معتمد","blue"],scheduled:["مجدول","purple"],in_progress:["قيد التنفيذ","cyan"],completed:["مكتمل","green"],rejected:["مرفوض","red"]};
C.ROLES={admin:"مدير النظام",ops_manager:"مدير العمليات",supervisor:"مشرف مستودع",employee:"موظف مستودع",receiving:"موظف استلام",dispatch:"موظف تسليم",accountant:"محاسب"};
C.MOVT={receive:["استلام","green"],store:["تخزين","blue"],transfer:["نقل داخلي","purple"],withdraw:["سحب","yellow"],adjust:["تسوية جرد","red"],inspect:["فحص","cyan"],damage:["تلف","red"]};
C.PERM_LABELS={dashboard:"لوحة التحكم",warehouse:"المستودعات والخريطة",inventory:"المخزون",ops:"العمليات التشغيلية",movements:"سجل الحركات",customers:"العملاء",requests:"طلبات العملاء",suppliers:"الموردون",appointments:"حجوزات المواعيد",billing:"الفوترة والتسعير",inspections:"الفحص والتوثيق",space:"إدارة المساحات",expiry:"الصلاحية والتشغيلات",employees:"الموظفون والأداء",reports:"التقارير",integrations:"التكاملات",settings:"الإعدادات"};

C.idx=function(){
  if(_ix&&_ixv===store.v&&_ixs===ST())return _ix;
  var s=ST(),x={};
  function map(a){var m={};a.forEach(function(o){m[o.id]=o;});return m;}
  x.wh=map(s.warehouses);x.zone=map(s.zones);x.loc=map(s.locations);x.pal=map(s.pallets);x.cus=map(s.customers);x.prod=map(s.products);x.emp=map(s.employees);x.sup=map(s.suppliers);x.rcv=map(s.receivings);x.wdr=map(s.withdrawals);x.appt=map(s.appointments);x.inv=map(s.invoices);x.inc=map(s.incidents);x.req=map(s.requests);
  x.con={};s.contracts.forEach(function(c){x.con[c.customerId]=c;});
  x.palByLoc={};s.pallets.forEach(function(p){if(p.locationId&&!p.withdrawnAt)x.palByLoc[p.locationId]=p;});
  _ix=x;_ixv=store.v;_ixs=s;return x;
};
["wh","zone","loc","pallet:pal","cus","prod:prod","emp","sup","rcv","wdr","appt","inv","inc","req"].forEach(function(k){var p=k.split(":"),n=p[0],f=p[1]||p[0];C[n]=function(id){return C.idx()[f][id];};});
C.pallet=function(id){return C.idx().pal[id];};C.product=function(id){return C.idx().prod[id];};C.contract=function(cid,st){if(st){return st.contracts.filter(function(c){return c.customerId===cid;})[0];}return C.idx().con[cid];};
C.name=function(kind,id){var o=C.idx()[kind][id];return o?o.name:"—";};
C.cusName=function(id){return C.name("cus",id);};C.empName=function(id){return id?(C.idx().emp[id]?C.idx().emp[id].name:id):"—";};C.prodName=function(id){return C.name("prod",id);};C.whName=function(id){return id==="all"?"كل المستودعات":C.name("wh",id);};
C.supName=function(id){return C.name("sup",id);};
C.zoneLabel=function(zid){var z=C.zone(zid);return z?z.name:zid;};
C.locShort=function(id){return id?id.replace(/^WH-/,""):"—";};

C.pstatus=function(p){
  if(p.withdrawnAt)return "withdrawn";
  if(!p.locationId)return "pending_storage";
  if(p.status==="damaged"||p.status==="quarantined"||p.status==="blocked")return p.status;
  if(p.expiry&&p.expiry<+W.now())return "expired";
  if(p.reservedQty>0)return p.reservedQty>=p.qty?"pending_withdrawal":"reserved";
  return "available";
};
C.lstat=function(l){
  if(l.status==="blocked")return "bl";if(l.status==="inactive")return "in";
  var p=C.idx().palByLoc[l.id];
  if(p){var ps=C.pstatus(p);if(ps==="damaged"||ps==="quarantined"||ps==="blocked"||ps==="expired")return "bl";if(ps==="reserved"||ps==="pending_withdrawal")return "rs";return "oc";}
  return l.reservedFor?"rs":"av";
};
C.occ=function(filter){
  var r={total:0,occupied:0,reserved:0,blocked:0,inactive:0,available:0,attention:0};
  ST().locations.forEach(function(l){if(filter&&!filter(l))return;r.total++;var p=C.idx().palByLoc[l.id],s=C.lstat(l);
    if(s==="in")r.inactive++;else if(l.status==="blocked")r.blocked++;else if(p){r.occupied++;if(s==="bl")r.attention++;}else if(s==="rs")r.reserved++;else r.available++;});
  var usable=r.total-r.inactive-r.blocked;r.usable=usable;r.util=usable?Math.round(r.occupied/usable*100):0;return r;
};
C.palletWeight=function(p){var pr=C.product(p.productId);return Math.round((p.qty||p.initQty)*(pr?pr.kg:1));};
C.palletVolume=function(p){var pr=C.product(p.productId);return +(p.qty*(pr?pr.m3:0)).toFixed(2);};
C.days=function(p){var end=p.withdrawnAt||+W.now();return Math.max(0,u.dayIdx(end)-u.dayIdx(p.storedAt||p.receivedAt));};

/* ---------- audit + notifications ---------- */
C.log=function(type,p,o){o=o||{};var s=ST();
  var m={id:store.id("MOV",5),ts:o.ts||+W.now(),type:type,palletId:p?p.id:null,productId:p?p.productId:o.productId||null,customerId:p?p.customerId:o.customerId||null,empId:o.emp||null,from:o.from||null,to:o.to||null,qtyBefore:o.qb!=null?o.qb:null,qtyAfter:o.qa!=null?o.qa:null,status:o.status||"completed",ref:o.ref||"",wh:p?p.wh:o.wh||null,note:o.note||""};
  s.movements.push(m);return m;};
C.notify=function(cat,level,title,body,link){var s=ST();if(s.settings.notifPrefs[cat]===false)return;s.notifications.unshift({id:store.id("NTF"),ts:+W.now(),cat:cat,level:level,title:title,body:body,read:false,link:link||""});if(s.notifications.length>150)s.notifications.length=150;};

/* ---------- suggestions & validation ---------- */
var ALLOWED={cold:["ZD"],food:["ZB","ZA"],raw:["ZC"],general:["ZA"]};
C.allowedZones=function(prod){return ALLOWED[prod.storage]||["ZA"];};
C.checkDest=function(p,locId,ignorePalletId){
  var errs=[],l=C.loc(locId),prod=C.product(p.productId);
  if(!l){return {ok:false,errors:["رمز الموقع غير موجود في النظام"]};}
  if(l.status==="blocked")errs.push("الموقع محظور ("+(l.note||"غير متاح")+")");
  if(l.status==="inactive")errs.push("الموقع غير مفعّل");
  var o=C.idx().palByLoc[l.id];if(o&&o.id!==(ignorePalletId||p.id))errs.push("الموقع ممتلئ، مشغول بالطبلية "+o.id);
  if(l.reservedFor&&l.reservedFor!==p.customerId)errs.push("الموقع محجوز لعميل آخر");
  if(l.type==="staging"){if(prod.storage==="cold")errs.push("بضاعة مبرّدة لا تُترك في منطقة التحميل");}
  else if(C.allowedZones(prod).indexOf(l.zc)<0)errs.push("نوع التخزين غير مناسب: المنتج ("+({cold:"مبرّد",food:"غذائي",raw:"مواد خام",general:"عام"}[prod.storage])+") والموقع ("+W.ZONE_TYPES[l.type]+")");
  var w=C.palletWeight(p);if(w>l.maxWeight)errs.push("الوزن "+u.n(w)+" كغ يتجاوز الحد الأقصى للموقع ("+u.n(l.maxWeight)+" كغ)");
  var c=C.cus(p.customerId);if(c&&c.status==="suspended")errs.push("حساب العميل موقوف");
  return {ok:!errs.length,errors:errs,loc:l};
};
C.suggest=function(p,opts){
  opts=opts||{};var prod=C.product(p.productId),cus=C.cus(p.customerId),w=C.palletWeight(p),zs=C.allowedZones(prod),out=[];
  var sameRow={};ST().pallets.forEach(function(x){if(x.customerId===p.customerId&&x.locationId&&!x.withdrawnAt){var k=x.locationId.split("-L")[0];sameRow[k]=(sameRow[k]||0)+1;}});
  var ex=opts.exclude||[];
  ST().locations.forEach(function(l){
    if(l.type==="staging"||l.status!=="active"||ex.indexOf(l.id)>-1)return;
    var zi=zs.indexOf(l.zc);if(zi<0)return;if(C.idx().palByLoc[l.id])return;if(l.reservedFor&&l.reservedFor!==p.customerId)return;if(w>l.maxWeight)return;
    var sc=100,rs=[];sc-=zi*18;if(zi>0)rs.push("منطقة بديلة مناسبة للتخزين");
    if(opts.wh&&l.wh===opts.wh){sc+=20;}else if(cus&&cus.warehouses&&cus.warehouses.indexOf(l.wh)>-1){sc+=10;}
    var k=l.id.split("-L")[0];if(sameRow[k]){sc+=12;rs.push("بجانب بضاعة نفس العميل");}
    if(l.reservedFor===p.customerId){sc+=25;rs.push("موقع محجوز لهذا العميل");}
    if(w>600){sc+=(4-l.level)*7;if(l.level===1)rs.push("وزن ثقيل: الطابق الأرضي");}else{sc+=(4-l.level)*2;}
    sc-=l.row*2+l.pos*0.6;if(l.pos<=2)rs.push("قريب من منطقة التحميل");
    if(prod.storage==="cold")rs.push("غرفة تبريد "+W.LAYOUT.ZD.temp);
    rs.push("الحمولة "+u.n(w)+" كغ ضمن الحد ("+u.n(l.maxWeight)+" كغ)");
    out.push({loc:l,score:Math.round(sc),reasons:rs});});
  out.sort(function(a,b){return b.score-a.score;});return out.slice(0,opts.limit||5);
};

/* ---------- receiving ---------- */
C.createReceiving=function(d,emp){var s=ST();
  var r={id:store.id("RCV"),customerId:d.customerId,supplierId:d.supplierId||null,wh:d.wh,apptId:d.apptId||null,expectedAt:d.expectedAt,receivedAt:null,status:"expected",
    lines:d.lines.map(function(l){return {productId:l.productId,expectedQty:+l.qty,qty:0,pallets:+l.pallets||1,lot:l.lot||"",mfg:null,expiry:l.expiry||null};}),palletIds:[],createdBy:emp,notes:d.notes||""};
  s.receivings.push(r);if(r.apptId){var a=C.appt(r.apptId);if(a)a.receivingId=r.id;}
  C.dirty();return r;};
C.confirmReceiving=function(rid,d,emp){var s=ST(),r=C.rcv(rid),now=+W.now(),pals=[];
  r.lines=d.lines;var expTot=0,recTot=0;
  d.lines.forEach(function(l){var prod=C.product(l.productId),n=Math.max(1,+l.pallets||1),base=Math.floor(l.qty/n),rem=l.qty-base*n;expTot+=+l.expectedQty;recTot+=+l.qty;
    for(var i=0;i<n;i++){var q=base+(i===0?rem:0);if(q<=0)continue;var mfg=l.mfg||now-7*DAY;
      var p={id:store.id("PLT",5),productId:l.productId,customerId:r.customerId,qty:q,initQty:q,unit:prod.unit,wh:r.wh,locationId:null,status:d.inspection&&d.inspection.condition==="poor"&&i===0?"quarantined":"available",receivedAt:now,storedAt:null,withdrawnAt:null,lot:l.lot||("LOT-"+new Date(now).getFullYear().toString().slice(2)+u.p2(new Date(now).getMonth()+1)+"-"+(100+Math.floor(Math.random()*899))),mfg:mfg,expiry:l.expiry||(prod.shelf?mfg+prod.shelf*DAY:null),reservedQty:0,receivingId:r.id,images:(d.inspection&&d.inspection.photos?d.inspection.photos.length:0),qtyLog:[]};
      s.pallets.push(p);pals.push(p);r.palletIds.push(p.id);C.log("receive",p,{emp:emp,qb:0,qa:q,ref:r.id,note:"استلام من "+(r.supplierId?C.supName(r.supplierId):"المورد")});}});
  r.status="pending_storage";r.receivedAt=now;r.confirmedBy=emp;
  var ins=d.inspection;if(ins){var first=pals[0];s.inspections.push({id:store.id("INS"),kind:"receiving",refId:r.id,palletId:first?first.id:null,customerId:r.customerId,productId:d.lines[0].productId,condition:ins.condition,packaging:ins.packaging,discrepancy:Math.abs(expTot-recTot),damagedQty:+ins.damagedQty||0,missing:+ins.missing||0,notes:ins.notes||"",photos:ins.photos||[],inspector:emp,date:now});
    if(+ins.damagedQty>0){var inc={id:store.id("INC"),customerId:r.customerId,productId:d.lines[0].productId,palletId:first?first.id:null,locationId:null,category:"تلف بالتغليف الخارجي",desc:ins.notes||"تلف ملاحظ أثناء الاستلام",qtyAffected:+ins.damagedQty,dept:"الاستلام",status:"reported",resolution:"",photos:(ins.photos||[]).length,createdAt:now,reporter:emp};s.incidents.push(inc);C.notify("damage","err","بضاعة تالفة عند الاستلام",inc.id+" — "+C.cusName(r.customerId),"inspections");}}
  if(expTot!==recTot)C.notify("receiving","warn","فرق بالاستلام",r.id+": المتوقع "+u.n(expTot)+" والمستلم "+u.n(recTot),"ops/receiving");
  if(r.apptId){var a=C.appt(r.apptId);if(a&&a.status==="arrived"){a.status="in_progress";a.startedAt=now;}}
  C.dirty();return {receiving:r,pallets:pals};};
C.storePallet=function(pid,locId,emp){var p=C.pallet(pid),chk=C.checkDest(p,locId);if(!chk.ok)return chk;
  var now=+W.now();p.locationId=locId;p.storedAt=now;p.qtyLog=[{t:now,qty:p.qty}];if(!C.cus(p.customerId).warehouses.length||C.cus(p.customerId).warehouses.indexOf(p.wh)<0)C.cus(p.customerId).warehouses.push(p.wh);
  C.log("store",p,{emp:emp,from:"منطقة الاستلام",to:locId,qb:p.qty,qa:p.qty,ref:p.receivingId,note:"تأكيد التخزين"});
  var r=C.rcv(p.receivingId);if(r&&r.palletIds.every(function(id){return !!C.pallet(id).locationId;})){r.status="stored";r.storedAt=now;}
  C.dirty();return {ok:true};};
C.transfer=function(pid,locId,emp,note){var p=C.pallet(pid),chk=C.checkDest(p,locId);if(!chk.ok)return chk;
  if(p.locationId===locId)return {ok:false,errors:["الموقع الجديد هو نفس الموقع الحالي"]};
  var from=p.locationId;p.locationId=locId;p.wh=C.loc(locId).wh;C.log("transfer",p,{emp:emp,from:from,to:locId,qb:p.qty,qa:p.qty,note:note||"نقل داخلي"});C.dirty();return {ok:true};};

/* ---------- withdrawals ---------- */
C.availableQty=function(cid,prodId){var t=0;ST().pallets.forEach(function(p){if(p.customerId===cid&&p.productId===prodId&&p.locationId&&!p.withdrawnAt){var s=C.pstatus(p);if(s==="available"||s==="reserved")t+=p.qty-(p.reservedQty||0);}});return t;};
C.createWithdrawal=function(d){var s=ST(),errs=[];
  d.lines=d.lines.filter(function(l){return +l.qty>0;});if(!d.lines.length)return {ok:false,errors:["أضف منتجاً وكمية"]};
  d.lines.forEach(function(l){var av=C.availableQty(d.customerId,l.productId);if(+l.qty>av)errs.push(C.prodName(l.productId)+": المطلوب "+u.n(l.qty)+" والمتاح "+u.n(av));});
  if(errs.length)return {ok:false,errors:errs};
  var now=+W.now(),total=0,avail=0;d.lines.forEach(function(l){total+=+l.qty;});
  var w={id:store.id("WDR"),customerId:d.customerId,by:d.by||"staff",date:d.date,method:d.method||"pickup",status:"submitted",kind:"full",lines:d.lines.map(function(l){return {productId:l.productId,qty:+l.qty};}),allocations:[],assignedEmp:null,createdAt:now,completedAt:null,history:[{ts:now,status:"submitted",by:d.byId||d.by||"staff"}]};
  var all=0;d.lines.forEach(function(l){all+=C.availableQty(d.customerId,l.productId);});w.kind=total<all?"partial":"full";
  s.withdrawals.push(w);C.notify("request","info","طلب سحب جديد",w.id+" — "+C.cusName(w.customerId),"ops/outbound");C.dirty();return {ok:true,withdrawal:w};};
C.allocate=function(w){
  var plan=[],errs=[];
  w.lines.forEach(function(l){var need=l.qty;var pals=ST().pallets.filter(function(p){return p.customerId===w.customerId&&p.productId===l.productId&&p.locationId&&!p.withdrawnAt&&["available","reserved"].indexOf(C.pstatus(p))>-1&&p.qty-(p.reservedQty||0)>0;});
    pals.sort(function(a,b){return (a.expiry||9e15)-(b.expiry||9e15)||a.receivedAt-b.receivedAt;});
    pals.forEach(function(p){if(need<=0)return;var free=p.qty-(p.reservedQty||0),q=Math.min(free,need);plan.push({palletId:p.id,qty:q,picked:null});need-=q;});
    if(need>0)errs.push(C.prodName(l.productId)+": ينقص "+u.n(need));});
  return {plan:plan,errors:errs};};
C.wdAct=function(id,act,d,emp){var w=C.wdr(id),now=+W.now();d=d||{};
  function h(st,note){w.history.push({ts:now,status:st,by:emp,note:note||""});w.status=st;}
  if(act==="review"){if(w.status!=="submitted")return {ok:false,errors:["الحالة الحالية لا تسمح"]};h("under_review");}
  else if(act==="approve"){if(["submitted","under_review"].indexOf(w.status)<0)return {ok:false,errors:["الحالة الحالية لا تسمح"]};
    var al=C.allocate(w);if(al.errors.length)return {ok:false,errors:["المخزون المتاح لا يكفي: "+al.errors.join("، ")]};
    w.allocations=al.plan;al.plan.forEach(function(a){var p=C.pallet(a.palletId);p.reservedQty=(p.reservedQty||0)+a.qty;C.log("inspect",p,{emp:emp,qb:p.qty,qa:p.qty,ref:w.id,note:"حجز "+a.qty+" "+p.unit+" لطلب السحب (FEFO)"});});h("approved","تم حجز المخزون حسب FEFO/FIFO");}
  else if(act==="reject"){if(["completed","rejected"].indexOf(w.status)>-1)return {ok:false,errors:["الحالة الحالية لا تسمح"]};w.allocations.forEach(function(a){var p=C.pallet(a.palletId);if(p)p.reservedQty=Math.max(0,(p.reservedQty||0)-a.qty);});w.allocations=[];h("rejected",d.reason||"");}
  else if(act==="schedule"){if(w.status!=="approved")return {ok:false,errors:["يجب الموافقة أولاً"]};w.assignedEmp=d.emp;w.date=d.date||w.date;h("scheduled","تعيين "+C.empName(d.emp)+" وإنشاء قائمة السحب");}
  else if(act==="start"){if(w.status!=="scheduled")return {ok:false,errors:["يجب الجدولة أولاً"]};h("in_progress","بدء التجهيز");}
  else if(act==="complete"){if(w.status!=="in_progress")return {ok:false,errors:["ابدأ التجهيز أولاً"]};
    w.allocations.forEach(function(a,i){var p=C.pallet(a.palletId),pk=d.picked&&d.picked[i]!=null?Math.max(0,Math.min(a.qty,+d.picked[i])):a.qty;a.picked=pk;var qb=p.qty;
      p.reservedQty=Math.max(0,(p.reservedQty||0)-a.qty);p.qty=qb-pk;
      if(pk>0){p.qtyLog.push({t:now,qty:p.qty});var from=p.locationId;if(p.qty<=0){p.withdrawnAt=now;p.locationId=null;p.reservedQty=0;}C.log("withdraw",p,{emp:w.assignedEmp||emp,from:from,qb:qb,qa:p.qty,ref:w.id,note:p.qty<=0?"سحب كامل وتسليم":"سحب جزئي وتسليم"});}});
    w.completedAt=now;h("completed","تم التحميل وتأكيد التسليم");C.notify("request","info","اكتمل طلب السحب",w.id+" — "+C.cusName(w.customerId),"ops/outbound");}
  C.dirty();return {ok:true};};

/* ---------- cycle count ---------- */
C.createCount=function(wh,zone,row,emp){var s=ST();
  var lines=s.pallets.filter(function(p){return p.locationId&&!p.withdrawnAt&&p.locationId.indexOf(zone+"-R"+u.p2(row)+"-")===0;}).map(function(p){return {palletId:p.id,sysQty:p.qty,actualQty:p.qty};});
  var c={id:store.id("CNT"),wh:wh,zone:zone,row:row,status:"open",by:emp,createdAt:+W.now(),approvedBy:null,lines:lines};s.counts.push(c);C.dirty();return c;};
C.approveCount=function(id,emp,ok){var c=C.idx().cnt?null:null;var cnt=ST().counts.filter(function(x){return x.id===id;})[0];var now=+W.now();
  if(!ok){cnt.status="rejected";cnt.approvedBy=emp;C.dirty();return;}
  var disc=0;cnt.lines.forEach(function(l){var p=C.pallet(l.palletId);if(!p||l.actualQty===l.sysQty)return;disc++;var qb=p.qty;p.qty=Math.max(0,l.actualQty);p.qtyLog.push({t:now,qty:p.qty});
    C.log("adjust",p,{emp:emp,from:p.locationId,qb:qb,qa:p.qty,ref:id,note:"تسوية جرد: "+u.n(qb)+" ← "+u.n(p.qty)});if(p.qty<=0){p.withdrawnAt=now;p.locationId=null;}});
  cnt.status="approved";cnt.approvedBy=emp;if(disc)C.notify("receiving","warn","فروقات جرد معتمدة",id+": "+disc+" طبلية بها فروقات","ops/counts");C.dirty();};

/* ---------- billing ---------- */
C.model={pallet_day:"لكل طبلية / يوم",m3_day:"لكل م³ / يوم",ton_day:"لكل طن / يوم",unit_day:"لكل وحدة / يوم",monthly_fixed:"اشتراك شهري ثابت"};
C.calc=function(cid,fromDay,toDay,st){
  st=st||ST();var con=C.contract(cid,st),vat=st.settings.vatRate/100,nowDay=u.dayIdx(Date.now()+(st.meta.clockOffsetDays||0)*DAY);
  var prodMap={};st.products.forEach(function(p){prodMap[p.id]=p;});
  var lines=[],pd=0,m3=0,tn=0,ud=0,cold=0,freeSaved=0,periodDays=toDay-fromDay+1;
  st.pallets.forEach(function(p){if(p.customerId!==cid||!p.storedAt)return;var pr=prodMap[p.productId],sD=u.dayIdx(p.storedAt),log=p.qtyLog.length?p.qtyLog:[{t:p.storedAt,qty:p.initQty}],isCold=p.locationId&&p.locationId.indexOf("-ZD-")>-1||(!p.locationId&&p.coldStored);
    var endD=p.withdrawnAt?u.dayIdx(p.withdrawnAt):nowDay+1;
    for(var i=0;i<log.length;i++){var q=log[i].qty;if(q<=0)continue;var a=u.dayIdx(log[i].t),b=i<log.length-1?u.dayIdx(log[i+1].t)-1:endD-1;if(b<a)b=a;
      var billFrom=sD+(con.freeDays||0),aa=Math.max(a,billFrom,fromDay),bb=Math.min(b,toDay);
      var fa=Math.max(a,fromDay),fb=Math.min(b,toDay,billFrom-1);if(fb>=fa)freeSaved+=fb-fa+1;
      if(bb<aa)continue;var d=bb-aa+1;pd+=d;ud+=d*q;m3+=d*q*pr.m3;tn+=d*q*pr.kg/1000;if(pr.storage==="cold")cold+=d;}});
  var f=Math.min(1,periodDays/30);
  var mdl=con.model;
  if(mdl==="pallet_day"&&pd)lines.push({key:"storage",label:"رسوم التخزين",qty:pd,unit:"طبلية-يوم",rate:con.rate,amount:pd*con.rate});
  if(mdl==="m3_day"&&m3)lines.push({key:"storage",label:"رسوم التخزين",qty:+m3.toFixed(2),unit:"م³-يوم",rate:con.rate,amount:m3*con.rate});
  if(mdl==="ton_day"&&tn)lines.push({key:"storage",label:"رسوم التخزين",qty:+tn.toFixed(2),unit:"طن-يوم",rate:con.rate,amount:tn*con.rate});
  if(mdl==="unit_day"&&ud)lines.push({key:"storage",label:"رسوم التخزين",qty:ud,unit:"وحدة-يوم",rate:con.rate,amount:ud*con.rate});
  if(mdl==="monthly_fixed"&&pd)lines.push({key:"storage",label:"اشتراك تخزين شهري ثابت"+(f<1?" (نسبة وتناسب)":""),qty:1,unit:"شهر",rate:con.monthlyFixed*f,amount:con.monthlyFixed*f});
  if(cold&&con.coldExtra)lines.push({key:"cold",label:"إضافة غرف التبريد",qty:cold,unit:"طبلية-يوم",rate:con.coldExtra,amount:cold*con.coldExtra});
  function cnt(type){return st.movements.filter(function(m){var d=u.dayIdx(m.ts);return m.customerId===cid&&m.type===type&&d>=fromDay&&d<=toDay;}).length;}
  var inb=cnt("receive"),outb=cnt("withdraw"),tr=cnt("transfer");
  var insp=st.inspections.filter(function(x){var d=u.dayIdx(x.date);return x.customerId===cid&&d>=fromDay&&d<=toDay;}).length;
  if(inb)lines.push({key:"inbound",label:"مناولة الاستلام",qty:inb,unit:"طبلية",rate:con.inbound,amount:inb*con.inbound});
  var partialOut=outb;if(outb)lines.push({key:"outbound",label:"مناولة السحب والتسليم",qty:outb,unit:"عملية",rate:con.outbound,amount:outb*con.outbound});
  if(tr)lines.push({key:"transfer",label:"النقل الداخلي",qty:tr,unit:"عملية",rate:con.transfer,amount:tr*con.transfer});
  if(insp)lines.push({key:"inspection",label:"رسوم الفحص",qty:insp,unit:"فحص",rate:con.inspection,amount:insp*con.inspection});
  st.services.forEach(function(sv){var d=u.dayIdx(sv.ts);if(sv.customerId!==cid||d<fromDay||d>toDay)return;lines.push({key:"service",label:sv.desc,qty:sv.qty,unit:"خدمة",rate:sv.unitPrice,amount:sv.qty*sv.unitPrice});});
  var sub=0;lines.forEach(function(l){l.amount=+l.amount.toFixed(2);l.rate=+(+l.rate).toFixed(3);sub+=l.amount;});
  var minV=+(con.minMonthly*f).toFixed(2);
  if(minV>0&&sub<minV&&(pd||inb||outb)){var adj=+(minV-sub).toFixed(2);lines.push({key:"min",label:"تسوية الحد الأدنى الشهري",qty:1,unit:"",rate:adj,amount:adj});sub=minV;}
  sub=+sub.toFixed(2);var v=+(sub*vat).toFixed(2);
  return {lines:lines,subtotal:sub,vat:v,total:+(sub+v).toFixed(2),stats:{palletDays:pd,freeSaved:freeSaved,inbound:inb,outbound:outb,transfers:tr,inspections:insp,periodDays:periodDays}};};
C.lastInvoiced=function(cid){var d=null;ST().invoices.forEach(function(i){if(i.customerId===cid&&i.status!=="cancelled"){var t=u.dayIdx(u.parseYmd(i.to));if(d===null||t>d)d=t;}});return d;};
C.accruedRange=function(cid){var today=u.dayIdx(+W.now()),ms=u.dayIdx(u.monthStart(+W.now())),li=C.lastInvoiced(cid);var from=li!==null?Math.max(li+1,ms):ms;if(li!==null&&li+1>ms)from=li+1;return {from:from,to:today};};
C.accrued=function(cid){var r=C.accruedRange(cid);if(r.to<r.from)return {lines:[],subtotal:0,vat:0,total:0,stats:{}};return C.calc(cid,r.from,r.to);};
C.generateInvoice=function(cid,fromY,toY,emp){var s=ST(),f=u.dayIdx(u.parseYmd(fromY)),t=u.dayIdx(u.parseYmd(toY));
  if(t<f)return {ok:false,errors:["تاريخ النهاية قبل البداية"]};
  var ov=s.invoices.filter(function(i){if(i.customerId!==cid||i.status==="cancelled")return false;return f<=u.dayIdx(u.parseYmd(i.to))&&t>=u.dayIdx(u.parseYmd(i.from));})[0];
  if(ov)return {ok:false,errors:["الفترة تتداخل مع الفاتورة "+ov.id+" ("+ov.from+" → "+ov.to+")"]};
  var c=C.calc(cid,f,t);if(c.total<=0)return {ok:false,errors:["لا توجد رسوم مستحقة للفترة المحددة"]};
  var now=+W.now(),inv={id:store.id("INV",4),customerId:cid,from:fromY,to:toY,lines:c.lines,subtotal:c.subtotal,vat:c.vat,total:c.total,status:"issued",issuedAt:now,dueAt:now+30*DAY,paidAt:null,sim:true,by:emp};
  s.invoices.push(inv);C.dirty();return {ok:true,invoice:inv};};
C.invStatus=function(i){if(i.status==="issued"&&i.dueAt<+W.now())return "overdue";return i.status;};
C.monthlyRevenue=function(n){var key=store.v+"|"+n+"|"+(ST().meta.clockOffsetDays||0);if(C._mr&&C._mr.k===key)return C._mr.v;var now=new Date(+W.now()),out=[];
  for(var i=n-1;i>=0;i--){var f=new Date(now.getFullYear(),now.getMonth()-i,1),l=new Date(now.getFullYear(),now.getMonth()-i+1,0);var to=Math.min(u.dayIdx(l),u.dayIdx(+W.now()));var sum=0;ST().customers.forEach(function(c){sum+=C.calc(c.id,u.dayIdx(f),to).subtotal;});out.push({label:u.p2(f.getMonth()+1)+"/"+String(f.getFullYear()).slice(2),value:Math.round(sum)});}
  C._mr={k:key,v:out};return out;};

/* ---------- expiry ---------- */
C.expClass=function(ts){if(!ts)return "none";var d=(ts-+W.now())/DAY;if(d<0)return "expired";if(d<=7)return "d7";if(d<=30)return "d30";if(d<=90)return "d90";return "safe";};
C.EXP={expired:["منتهي","red"],d7:["خلال 7 أيام","red"],d30:["خلال 30 يوم","yellow"],d90:["خلال 90 يوم","blue"],safe:["آمن","green"],none:["بدون صلاحية","gray"]};

/* ---------- appointments ---------- */
function mins(h){var a=h.split(":");return +a[0]*60+ +a[1];}
C.mins=mins;C.hm=function(m){return u.p2(Math.floor(m/60))+":"+u.p2(m%60);};
C.apptStart=function(a){return +u.parseYmd(a.date)+mins(a.start)*6e4;};
C.apptConflict=function(a,ign){return ST().appointments.filter(function(b){if(b.id===a.id||b.id===ign||b.wh!==a.wh||b.dock!==a.dock||b.date!==a.date)return false;if(["rejected","cancelled","requested"].indexOf(b.status)>-1)return false;var s1=mins(a.start),e1=s1+a.dur,s2=mins(b.start);return s1<s2+b.dur&&e1>s2;})[0];};
C.findSlot=function(wh,date,dur,ign){var rules=ST().settings.appt,o=mins(rules.open),c=mins(rules.close),docks=C.wh(wh).docks.filter(function(d){return !d.maint;});
  for(var m=o;m+dur<=c;m+=rules.slotMin){for(var i=0;i<docks.length;i++){var t={id:"_",wh:wh,dock:docks[i].id,date:date,start:C.hm(m),dur:dur};if(!C.apptConflict(t,ign))return {dock:docks[i].id,start:t.start};}}return null;};
C.isLate=function(a){return a.status==="approved"&&+W.now()>C.apptStart(a)+(ST().settings.appt.maxLateMin||30)*6e4;};
C.dockStatus=function(wh,dockId){var w=C.wh(wh),d=w.docks.filter(function(x){return x.id===dockId;})[0];if(d&&d.maint)return "maintenance";var today=u.ymd(+W.now()),now=+W.now();
  var as=ST().appointments.filter(function(a){return a.wh===wh&&a.dock===dockId&&a.date===today;});
  if(as.some(function(a){return a.status==="in_progress";}))return "occupied";
  if(as.some(function(a){return a.status==="arrived"||(a.status==="approved"&&C.apptStart(a)-now<90*6e4&&C.apptStart(a)+a.dur*6e4>now);}))return "reserved";return "available";};
C.DOCKS={available:["متاح","green"],occupied:["مشغول","red"],reserved:["محجوز","yellow"],maintenance:["صيانة","gray"]};
C.APPT={requested:["بانتظار الموافقة","yellow"],approved:["مؤكد","blue"],arrived:["وصل — بالانتظار","purple"],in_progress:["قيد التفريغ/التحميل","cyan"],completed:["مكتمل","green"],rejected:["مرفوض","red"],cancelled:["ملغي","gray"],late:["متأخر","red"]};
C.apptAct=function(id,act,d,emp){var a=C.appt(id),now=+W.now();d=d||{};
  if(act==="approve"){if(a.status!=="requested")return {ok:false,errors:["الحالة الحالية لا تسمح"]};var t=Object.assign({},a,{dock:d.dock,date:d.date||a.date,start:d.start||a.start,dur:d.dur||a.dur});
    if(!t.dock)return {ok:false,errors:["اختر رصيف التحميل"]};var wh=C.wh(a.wh),dk=wh.docks.filter(function(x){return x.id===t.dock;})[0];if(dk&&dk.maint)return {ok:false,errors:["الرصيف تحت الصيانة"]};
    var rules=ST().settings.appt;if(mins(t.start)<mins(rules.open)||mins(t.start)+t.dur>mins(rules.close))return {ok:false,errors:["الموعد خارج ساعات العمل ("+rules.open+" - "+rules.close+")"]};
    var cf=C.apptConflict(t);if(cf)return {ok:false,errors:["تعارض مع الموعد "+cf.id+" على نفس الرصيف ("+cf.start+")"]};
    a.dock=t.dock;a.date=t.date;a.start=t.start;a.dur=t.dur;a.status="approved";a.emp=d.emp||emp;a.approvedAt=now;C.notify("booking","info","تم تأكيد موعد",a.id+" — الرصيف "+a.dock+" الساعة "+a.start,"appointments");}
  else if(act==="reject"){if(a.status!=="requested")return {ok:false,errors:["الحالة الحالية لا تسمح"]};a.status="rejected";a.note=d.reason||"";}
  else if(act==="arrive"){if(a.status!=="approved")return {ok:false,errors:["يجب أن يكون الموعد مؤكداً"]};a.status="arrived";a.arrivedAt=now;}
  else if(act==="start"){if(a.status!=="arrived")return {ok:false,errors:["سجّل وصول الشاحنة أولاً"]};a.status="in_progress";a.startedAt=now;}
  else if(act==="complete"){if(a.status!=="in_progress")return {ok:false,errors:["ابدأ العملية أولاً"]};a.status="completed";a.completedAt=now;}
  else if(act==="cancel"){if(["completed","cancelled","rejected"].indexOf(a.status)>-1)return {ok:false,errors:["الحالة الحالية لا تسمح"]};a.status="cancelled";}
  else if(act==="reschedule"){if(["completed","cancelled","rejected","in_progress"].indexOf(a.status)>-1)return {ok:false,errors:["لا يمكن إعادة الجدولة"]};
    var t2=Object.assign({},a,{date:d.date,start:d.start,dock:a.dock||d.dock});if(a.status==="requested"){a.date=d.date;a.start=d.start;}else{var c2=C.apptConflict(t2);if(c2)return {ok:false,errors:["تعارض مع "+c2.id]};a.date=d.date;a.start=d.start;if(a.status==="arrived")a.status="approved";}}
  C.dirty();return {ok:true};};
C.createAppt=function(d,emp){var a={id:store.id("BK"),party:d.party,customerId:d.customerId,op:d.op,wh:d.wh,dock:null,date:d.date,start:d.start,dur:+d.dur||60,plate:d.plate,driver:d.driver,phone:d.phone,pallets:+d.pallets||1,qty:+d.qty||0,emp:null,status:"requested",requestedAt:+W.now(),arrivedAt:null,startedAt:null,completedAt:null,receivingId:null,note:d.note||""};
  var rules=ST().settings.appt;if(mins(a.start)<mins(rules.open)||mins(a.start)+a.dur>mins(rules.close))return {ok:false,errors:["الوقت خارج ساعات العمل ("+rules.open+" - "+rules.close+")"]};
  ST().appointments.push(a);C.notify("booking","warn","حجز يحتاج موافقة",a.id+" — "+(a.party.type==="supplier"?C.supName(a.party.id):C.cusName(a.party.id)),"appointments");C.dirty();return {ok:true,appt:a};};

/* ---------- dashboards / alerts ---------- */
C.pending=function(){var s=ST();return {requests:s.requests.filter(function(r){return r.status==="submitted"||r.status==="under_review";}).length+s.withdrawals.filter(function(w){return w.status==="submitted"||w.status==="under_review";}).length,
  bookings:s.appointments.filter(function(a){return a.status==="requested";}).length};};
C.alerts=function(){var s=ST(),out=[],now=+W.now();
  s.warehouses.forEach(function(w){s.zones.filter(function(z){return z.wh===w.id&&z.type!=="staging";}).forEach(function(z){var o=C.occ(function(l){return l.zone===z.id;});if(o.util>=85)out.push({lvl:"r",title:"سعة المنطقة تقترب من الحد",body:z.name+" — "+w.name+": إشغال "+o.util+"%",link:"space"});});});
  var ex7=s.pallets.filter(function(p){return p.locationId&&!p.withdrawnAt&&p.expiry&&p.expiry>=now&&p.expiry-now<=7*DAY;}).length,exd=s.pallets.filter(function(p){return p.locationId&&!p.withdrawnAt&&p.expiry&&p.expiry<now;}).length;
  if(ex7)out.push({lvl:"y",title:"منتجات تنتهي صلاحيتها خلال 7 أيام",body:ex7+" طبلية تحتاج إجراء (FEFO)",link:"expiry"});
  if(exd)out.push({lvl:"r",title:"منتجات منتهية الصلاحية",body:exd+" طبلية منتهية داخل المستودعات",link:"expiry"});
  var late=s.appointments.filter(C.isLate).length;if(late)out.push({lvl:"y",title:"مواعيد متأخرة",body:late+" موعد لم تصل شاحنته في الوقت المحدد",link:"appointments"});
  var pend=C.pending();if(pend.requests)out.push({lvl:"b",title:"طلبات عملاء بانتظار المراجعة",body:pend.requests+" طلب",link:"requests"});if(pend.bookings)out.push({lvl:"b",title:"حجوزات بانتظار الموافقة",body:pend.bookings+" حجز",link:"appointments"});
  var unc=s.pallets.filter(function(p){return !p.locationId&&!p.withdrawnAt;}).length;if(unc)out.push({lvl:"y",title:"استلام غير مؤكد التخزين",body:unc+" طبلية بانتظار تحديد الموقع",link:"ops/storage"});
  var od=s.invoices.filter(function(i){return C.invStatus(i)==="overdue";}).length;if(od)out.push({lvl:"r",title:"فواتير متأخرة السداد",body:od+" فاتورة",link:"billing"});
  var sh=s.withdrawals.filter(function(w){return ["approved","scheduled","in_progress"].indexOf(w.status)>-1&&u.parseYmd(w.date)<+u.parseYmd(u.ymd(now));}).length;if(sh)out.push({lvl:"r",title:"طلبات سحب متأخرة",body:sh+" طلب تجاوز تاريخه المطلوب",link:"ops/outbound"});
  return out;};
C.needReview=function(){return ST().pallets.filter(function(p){var s=C.pstatus(p);return s==="damaged"||s==="quarantined"||s==="blocked"||s==="expired";});};

/* ---------- employee metrics ---------- */
C.empStats=function(eid,from,to,type){var m=ST().movements.filter(function(x){return x.empId===eid&&(!from||x.ts>=from)&&(!to||x.ts<=to)&&(!type||x.type===type);});var e=C.emp(eid);
  var r={receive:0,transfer:0,withdraw:0,store:0,adjust:0,total:m.length};m.forEach(function(x){if(r[x.type]!=null)r[x.type]++;});
  r.pending=ST().withdrawals.filter(function(w){return w.assignedEmp===eid&&["scheduled","in_progress"].indexOf(w.status)>-1;}).length+ST().appointments.filter(function(a){return a.emp===eid&&["approved","arrived","in_progress"].indexOf(a.status)>-1;}).length;
  r.avgMin=e.avgMin;r.errors=e.errors;r.tasks=e.tasks+r.total;return r;};

/* ---------- search ---------- */
C.search=function(q){q=q.trim().toLowerCase();if(!q)return [];var s=ST(),out=[];
  function has(x){return String(x||"").toLowerCase().indexOf(q)>-1;}
  s.customers.forEach(function(c){if(has(c.name)||has(c.id))out.push({t:"عميل",txt:c.name,sub:c.id,link:"customers/"+c.id});});
  s.products.forEach(function(p){if(has(p.name)||has(p.sku))out.push({t:"منتج",txt:p.name,sub:p.sku+" — "+C.cusName(p.ownerId),link:"inventory?q="+encodeURIComponent(p.sku)});});
  s.pallets.forEach(function(p){if(!p.withdrawnAt&&(has(p.id)||has(p.lot)))out.push({t:"طبلية",txt:p.id,sub:C.prodName(p.productId)+" — "+(p.locationId?C.locShort(p.locationId):"بانتظار التخزين"),link:"pallet/"+p.id});});
  s.locations.forEach(function(l){if(q.length>=4&&has(l.id))out.push({t:"موقع",txt:C.locShort(l.id),sub:C.zoneLabel(l.zone),link:"loc/"+l.id});});
  s.invoices.forEach(function(i){if(has(i.id))out.push({t:"فاتورة",txt:i.id,sub:C.cusName(i.customerId),link:"billing?inv="+i.id});});
  s.appointments.forEach(function(a){if(has(a.id)||has(a.plate))out.push({t:"موعد",txt:a.id,sub:a.date+" "+a.start+" — "+a.plate,link:"appt/"+a.id});});
  s.receivings.forEach(function(r){if(has(r.id))out.push({t:"استلام",txt:r.id,sub:C.cusName(r.customerId),link:"ops/receiving"});});
  return out.slice(0,14);};
})();
