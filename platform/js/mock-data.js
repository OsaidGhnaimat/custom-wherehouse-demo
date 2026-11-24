/* Seed generator: builds a realistic but SIMULATED business dataset (Jordan Logistics & Storage). */
(function(){
"use strict";
var W=window.W=window.W||{};
var u=W.u;
var DAY=864e5,HOUR=36e5;

W.LAYOUT={
  ZA:{name:"المنطقة A — تخزين عام",en:"General Storage",type:"general",rows:4,levels:3,pos:6,temp:"محيط"},
  ZB:{name:"المنطقة B — المنتجات الغذائية",en:"Food Products",type:"food",rows:3,levels:3,pos:6,temp:"محيط جاف"},
  ZC:{name:"المنطقة C — المواد الخام",en:"Raw Materials",type:"raw",rows:3,levels:3,pos:5,temp:"محيط"},
  ZD:{name:"المنطقة D — التبريد",en:"Cold Storage",type:"cold",rows:2,levels:3,pos:5,temp:"2°–6° م"},
  ZE:{name:"المنطقة E — التحميل والاستلام",en:"Loading & Receiving",type:"staging",rows:1,levels:1,pos:8,temp:"محيط"}
};
W.ZONE_TYPES={general:"تخزين عام",food:"منتجات غذائية",raw:"مواد خام",cold:"تبريد",staging:"تحميل واستلام"};
W.MAXW=[1500,1200,900];

var FIRST=["أحمد","محمد","خالد","عمر","يوسف","إبراهيم","سامر","ليث","طارق","وليد","ماهر","فادي","بشار","نادر","رامي","هاني","زيد","مالك","علاء","حسام","سعيد","جمال","ثائر","أنس","باسل"];
var LAST=["الخطيب","النعيمات","العبادي","الحداد","المجالي","القضاة","الزعبي","العمري","الطراونة","الشوبكي","الرفاعي","البدور","الخوالدة","المصري","الفاعوري","العجلوني","الصمادي","الحياري","الدويري","السعودي"];

var CUSTOMERS=[
 ["شركة الأفق للتجارة","mixed"],["مجموعة النخبة الصناعية","industrial"],["شركة المدى للمواد الغذائية","food"],["شركة الريادة للتوريدات","consumer"],
 ["شركة الشرق للمواد الخام","raw"],["شركة الواحة للألبان","cold"],["مؤسسة الرافدين للمنظفات","consumer"],["شركة البركة للأغذية","food"],
 ["شركة الجسر للإلكترونيات","electronics"],["مصانع الأردن للتغليف","packaging"],["شركة السلام للمشروبات","food"],["شركة الفجر للأدوات الصناعية","industrial"],
 ["شركة النور للأجهزة المنزلية","electronics"],["شركة التوفيق للحلويات","food"],["مؤسسة الأمل للمعلبات","food"],["شركة الميناء للاستيراد","consumer"],
 ["مجموعة الخليج للتجارة","consumer"],["شركة الأصالة للزيوت","food"],["شركة الرؤية للإلكترونيات","electronics"],["شركة الينابيع للمياه","food"],
 ["مصنع الزيتون الذهبي","cold"],["شركة القمة للبلاستيك","raw"],["شركة الوفاء للمواد الاستهلاكية","consumer"],["شركة الغد للتعبئة","packaging"],
 ["شركة الأردن الحديثة للتجارة","industrial"],["شركة الصفا للبقوليات المجمدة","cold"],["شركة التميز للمواد الخام","raw"],["مؤسسة الخير للتوزيع","cold"]
];
/* name|unit|kg/unit|m3/unit|units per pallet|storage|shelf days (0 = none) */
var TPL={
 food:["زيت طعام 5 لتر|كرتونة|18|.03|60|food|540","سكر أبيض 1 كغ|كرتونة|10|.012|90|food|720","أرز بسمتي 10 كغ|كيس|10|.015|80|food|540","طحين فاخر 25 كغ|كيس|25|.04|40|food|240","معكرونة 500 غ|كرتونة|9|.02|100|food|720","فول مدمس معلب|كرتونة|12|.014|110|food|900","عصير برتقال 1 لتر|كرتونة|12|.016|90|food|300","شاي أسود 400 غ|كرتونة|8|.01|100|food|720","حمص حب 1 كغ|كيس|1|.002|600|food|480","زيت زيتون 1 لتر|كرتونة|11|.014|80|food|540","بسكويت بالحليب|كرتونة|5|.025|100|food|270","شوكولاتة مغلفة|كرتونة|6|.018|100|food|300","مياه معدنية 1.5 لتر|كرتونة|9.5|.011|90|food|730","عدس أحمر 1 كغ|كيس|1|.002|600|food|480"],
 cold:["جبنة بيضاء مبرّدة|كرتونة|10|.02|60|cold|90","لبنة مبرّدة 500 غ|كرتونة|8|.015|80|cold|60","حليب طازج 1 لتر|كرتونة|12|.014|80|cold|14","زبدة مبرّدة|كرتونة|10|.012|80|cold|120","لحم مفروم مجمد|كرتونة|15|.02|50|cold|270","خضار مشكلة مجمدة|كرتونة|10|.018|70|cold|365","دجاج مجمد 1 كغ|كرتونة|12|.02|60|cold|240","آيس كريم 2 لتر|كرتونة|6|.016|80|cold|365"],
 raw:["حبيبات بولي إيثيلين|كيس|25|.03|40|raw|0","حبيبات PVC|كيس|25|.03|40|raw|0","أصباغ صناعية|برميل|50|.07|12|raw|720","صفائح ألمنيوم|لفة|400|.3|3|raw|0","ورق كرافت|لفة|300|.4|4|raw|0","مادة لاصقة صناعية|دلو|20|.03|40|raw|365","زيت محركات|برميل|180|.22|4|raw|0","نشا صناعي|كيس|25|.035|40|raw|730"],
 packaging:["علب كرتون مموّج|حزمة|20|.18|40|general|0","أكياس بلاستيك|كرتونة|12|.12|60|general|0","زجاجات PET فارغة|كيس|6|.35|30|general|0","أغطية معدنية|كرتونة|14|.04|60|general|0","فيلم تغليف|لفة|18|.05|40|general|0","لاصق شفاف|كرتونة|8|.03|80|general|0"],
 industrial:["مسامير وبراغي|كرتونة|25|.012|60|general|0","كابلات كهربائية|بكرة|60|.15|10|general|0","أدوات لحام|كرتونة|18|.05|40|general|0","خراطيم صناعية|لفة|35|.12|12|general|0","قفازات أمان|كرتونة|6|.04|80|general|0","محامل ميكانيكية|كرتونة|22|.015|60|general|0","مفاتيح كهربائية|كرتونة|10|.03|60|general|0"],
 electronics:["شاشات LED 32 بوصة|كرتونة|7|.09|30|general|0","هواتف ذكية|كرتونة|5|.02|120|general|0","شواحن سريعة|كرتونة|4|.015|150|general|0","بطاريات ليثيوم|كرتونة|9|.02|80|general|0","راوترات|كرتونة|5|.03|80|general|0","كاميرات مراقبة|كرتونة|8|.04|50|general|0","سماعات بلوتوث|كرتونة|3|.02|150|general|0"],
 consumer:["مناديل ورقية|كرتونة|6|.08|60|general|0","منظف أرضيات 4 لتر|كرتونة|18|.03|50|general|1095","شامبو 400 مل|كرتونة|9|.018|90|general|900","معجون أسنان|كرتونة|7|.012|120|general|900","حفاضات أطفال|كرتونة|8|.12|40|general|0","أدوات مطبخ|كرتونة|10|.06|40|general|0","ألعاب أطفال|كرتونة|6|.09|40|general|0","مراوح منزلية|كرتونة|9|.1|30|general|0"]
};
var SUPPLIERS=["شركة التوريدات المتحدة","مصنع الأمل للصناعات الغذائية","شركة الصناعات البلاستيكية الأردنية","مؤسسة النقل السريع","شركة الأفق للاستيراد","مصانع الوطنية للألبان","شركة المتحدة للتغليف","مؤسسة الرواد للمواد الخام","شركة الشام للتوريد","مصنع الكرمل للمعلبات","شركة العقبة للاستيراد","مؤسسة الفرات للتجارة","شركة النجمة للإلكترونيات","مصنع البحر الميت للأملاح","شركة الصحراء للمواد الصناعية","مؤسسة الندى للمشروبات","شركة الفيحاء للتوزيع","مصنع الربيع للمجمدات","شركة الوسام للتجارة","مؤسسة الإخلاص للشحن","شركة المسار للتوريدات","مصنع الأزرق للزيوت"];
var DEFECTS=["تلف بالتغليف الخارجي","سقوط طبلية أثناء المناولة","تسرب سائل من العبوات","رطوبة وتعفن بالكراتين","خلل بدرجة حرارة التبريد","فقدان كمية بعد العد"];

W.seed=function(){
  var R=u.rng(20261117),rnd=function(){return R();},ri=function(a,b){return a+Math.floor(rnd()*(b-a+1));},pick=function(a){return a[Math.floor(rnd()*a.length)];};
  var NOW=Date.now();
  var S={meta:{schema:W.SCHEMA,counters:{},clockOffsetDays:0,seededAt:NOW},
    company:{name:"Jordan Logistics & Storage",city:"عمّان، الأردن",phone:"+962 6 555 0100",email:"info@jls-demo.example",taxNo:"DEMO-000000"},
    settings:{vatRate:16,appt:{open:"07:00",close:"17:00",slotMin:30,maxLateMin:30},
      categories:["منتجات غذائية","مواد خام","مواد تغليف","مستلزمات صناعية","إلكترونيات","سلع استهلاكية"],
      units:["كرتونة","كيس","برميل","لفة","بكرة","حزمة","دلو","قطعة"],
      notifPrefs:{request:true,booking:true,receiving:true,damage:true,expiry:true,capacity:true,delay:true,sync:true,invoice:true},
      rolePerms:{}},
    warehouses:[],zones:[],locations:[],employees:[],customers:[],contracts:[],suppliers:[],products:[],pallets:[],movements:[],receivings:[],withdrawals:[],requests:[],appointments:[],invoices:[],inspections:[],incidents:[],counts:[],services:[],notifications:[],integrations:[]};
  var nid=function(p,pad){var c=S.meta.counters;c[p]=(c[p]||0)+1;return p+"-"+String(c[p]).padStart(pad||4,"0");};

  /* role permissions */
  var ALL=["dashboard","warehouse","inventory","ops","movements","customers","requests","suppliers","appointments","billing","inspections","space","expiry","employees","reports","integrations","settings"];
  var OPS=["dashboard","warehouse","inventory","ops","movements","appointments","inspections","expiry"];
  S.settings.rolePerms={admin:ALL.slice(),ops_manager:ALL.filter(function(x){return x!=="settings";}),supervisor:OPS.concat(["space","employees","reports","requests"]),employee:OPS.slice(),receiving:OPS.slice(),dispatch:OPS.slice(),accountant:["dashboard","customers","requests","billing","reports","inventory","movements"]};

  /* warehouses, zones, locations */
  var WHS=[["WH-A","المستودع A — ماركا، عمّان","عمّان"],["WH-B","المستودع B — الزرقاء","الزرقاء"],["WH-C","المستودع C — العقبة","العقبة"]];
  WHS.forEach(function(w,i){S.warehouses.push({id:w[0],name:w[1],city:w[2],docks:i===0?[{id:"D1",maint:false},{id:"D2",maint:false},{id:"D3",maint:false},{id:"D4",maint:true}]:[{id:"D1",maint:false},{id:"D2",maint:false},{id:"D3",maint:false}]});
    Object.keys(W.LAYOUT).forEach(function(zc){var L=W.LAYOUT[zc],zid=w[0]+"-"+zc;S.zones.push({id:zid,wh:w[0],code:zc,name:L.name,type:L.type,temp:L.temp,rows:L.rows,levels:L.levels,pos:L.pos});
      for(var r=1;r<=L.rows;r++)for(var l=1;l<=L.levels;l++)for(var p=1;p<=L.pos;p++){
        S.locations.push({id:zid+"-R"+u.p2(r)+"-L"+u.p2(l)+"-P"+u.p2(p),wh:w[0],zone:zid,zc:zc,row:r,level:l,pos:p,type:L.type,status:"active",maxWeight:L.type==="staging"?2000:W.MAXW[l-1],reservedFor:null,note:""});}});});
  var locById={};S.locations.forEach(function(l){locById[l.id]=l;});

  /* employees (42) */
  var ROLES=[["admin",1],["ops_manager",3],["supervisor",5],["employee",15],["receiving",8],["dispatch",8],["accountant",2]],ei=0;
  var usedNames={};
  ROLES.forEach(function(rr){for(var i=0;i<rr[1];i++){ei++;var nm;do{nm=pick(FIRST)+" "+pick(LAST);}while(usedNames[nm]);usedNames[nm]=1;
    S.employees.push({id:"EMP-"+String(ei).padStart(3,"0"),name:nm,role:rr[0],wh:rr[0]==="admin"||rr[0]==="accountant"?"WH-A":WHS[ei%3<2?0:(ei%2?1:2)][0],zone:rr[0]==="employee"?pick(["ZA","ZB","ZC","ZD"]):(rr[0]==="receiving"||rr[0]==="dispatch"?"ZE":"—"),status:"active",
      phone:"07"+pick([7,8,9])+" "+ri(100,999)+" "+ri(1000,9999),email:"emp"+ei+"@jls-demo.example",avgMin:ri(6,22),errors:ri(0,5),tasks:ri(40,260)});}});
  S.employees[0].name="أحمد الخطيب";
  var empBy=function(role,wh){var a=S.employees.filter(function(e){return e.role===role&&(!wh||e.wh===wh);});if(!a.length)a=S.employees.filter(function(e){return e.role===role;});return pick(a).id;};

  /* customers, contracts, products */
  var modelPool=["pallet_day","pallet_day","pallet_day","m3_day","ton_day","unit_day","monthly_fixed"];
  var pn=0;
  CUSTOMERS.forEach(function(c,i){var id="CUS-"+String(i+1).padStart(3,"0");
    S.customers.push({id:id,name:c[0],cat:c[1],contact:pick(FIRST)+" "+pick(LAST),phone:"07"+pick([7,8,9])+" "+ri(100,999)+" "+ri(1000,9999),email:"contact"+(i+1)+"@"+["alufuq","nukhba","mada","riyada","sharq","waha","rafidain","baraka","jisr","urdun"][i%10]+"-demo.example",address:pick(["ماركا الشمالية","سحاب","طبربور","القسطل","جبل الحسين","الجيزة","ناعور","الرصيفة"])+"، عمّان",taxNo:"DEMO-"+(100000+i*137),
      status:(i===22||i===15)?"suspended":"active",warehouses:[],showLoc:i!==4&&i!==9,since:u.ymd(NOW-ri(120,900)*DAY)});
    var model=i===0?"pallet_day":pick(modelPool);
    var con={id:"CON-"+String(i+1).padStart(3,"0"),customerId:id,model:model,
      rate:model==="pallet_day"?[0.35,0.4,0.45,0.5,0.55,0.6][ri(0,5)]:model==="m3_day"?[0.22,0.28,0.32][ri(0,2)]:model==="ton_day"?[0.45,0.6,0.8][ri(0,2)]:model==="unit_day"?[0.008,0.012,0.015][ri(0,2)]:0,
      monthlyFixed:model==="monthly_fixed"?[180,260,340,420][ri(0,3)]:0,inbound:[1.5,2,2.5][ri(0,2)],outbound:[1.5,2,2.5][ri(0,2)],transfer:[0.75,1,1.5][ri(0,2)],inspection:[3,5,6][ri(0,2)],packaging:[0.5,0.75,1][ri(0,2)],coldExtra:0.2,freeDays:[2,3,5,7][ri(0,3)],minMonthly:[30,50,50,80,120][ri(0,4)],pricePlan:["قياسي","فضي","ذهبي"][ri(0,2)],type:["سنوي","نصف سنوي","شهري"][ri(0,2)]};
    if(i===0){con.rate=0.5;con.inbound=2;con.outbound=2;con.freeDays=2;con.minMonthly=50;con.pricePlan="قياسي";con.type="سنوي";}
    S.contracts.push(con);});
  var CAT_ARRAYS={mixed:["food","food","cold","cold","consumer","consumer"]};
  S.customers.forEach(function(c,i){var cats=CAT_ARRAYS[c.cat]||[c.cat,c.cat];var n=c.cat==="mixed"?6:(i%3===0?3:2);
    for(var k=0;k<n;k++){var cat=c.cat==="mixed"?cats[k]:c.cat;var arr=TPL[cat];var t=arr[(pn+k*3+i)%arr.length].split("|");pn++;
      var dup=S.products.some(function(p){return p.ownerId===c.id&&p.name===t[0];});if(dup){t=arr[(pn+7)%arr.length].split("|");}
      var pcode={food:"FD",cold:"CL",raw:"RW",packaging:"PK",industrial:"IN",electronics:"EL",consumer:"CN"}[cat];
      S.products.push({id:"PRD-"+String(S.products.length+1).padStart(3,"0"),sku:pcode+"-"+(1000+S.products.length*7),name:t[0],unit:t[1],kg:+t[2],m3:+t[3],perPallet:+t[4],storage:t[5],shelf:+t[6],cat:cat,ownerId:c.id});}});
  var catAr={food:"منتجات غذائية",cold:"منتجات مبرّدة/مجمدة",raw:"مواد خام",packaging:"مواد تغليف",industrial:"مستلزمات صناعية",electronics:"إلكترونيات",consumer:"سلع استهلاكية"};
  S.products.forEach(function(p){p.catAr=catAr[p.cat];});
  var prodById={};S.products.forEach(function(p){prodById[p.id]=p;});

  /* suppliers */
  SUPPLIERS.forEach(function(n,i){var cs=[S.customers[i%28].id];if(i%3===0)cs.push(S.customers[(i*5+3)%28].id);if(i===0){cs=["CUS-001","CUS-003"];}
    S.suppliers.push({id:"SUP-"+String(i+1).padStart(3,"0"),name:n,contact:pick(FIRST)+" "+pick(LAST),phone:"07"+pick([7,8,9])+" "+ri(100,999)+" "+ri(1000,9999),email:"sales"+(i+1)+"@supplier-demo.example",customerIds:cs,status:"active"});});

  /* pallets ------------------------------------------------ */
  var PQ=S.pallets,MV=S.movements;
  var freeByZone={};S.zones.forEach(function(z){freeByZone[z.id]=S.locations.filter(function(l){return l.zone===z.id;}).sort(function(){return rnd()-.5;});});
  var arrivalDays={};S.customers.forEach(function(c){arrivalDays[c.id]=[];for(var i=0;i<ri(2,4);i++)arrivalDays[c.id].push(ri(3,125));});
  function mv(type,p,ts,emp,from,to,qb,qa,note){MV.push({id:"",ts:ts,type:type,palletId:p.id,productId:p.productId,customerId:p.customerId,empId:emp,from:from||null,to:to||null,qtyBefore:qb,qtyAfter:qa,status:"completed",ref:note&&note.ref||"",wh:p.wh,note:note&&note.text||""});}
  function prodsFor(storage){var out=[];S.products.forEach(function(p){if(p.storage===storage){out.push(p);if(p.ownerId==="CUS-001")out.push(p);}});return out;}
  var storageOfZone={ZA:"general",ZB:"food",ZC:"raw",ZD:"cold"};
  function mkPallet(prod,wh,loc,withdrawn){
    var days=pick(arrivalDays[prod.ownerId]);
    if(prod.shelf&&prod.shelf<=30)days=ri(1,Math.max(2,prod.shelf-3));
    if(withdrawn)days=ri(25,140);
    var recv=NOW-days*DAY-ri(0,9)*HOUR-ri(0,50)*6e4;
    var qty=Math.max(1,Math.round(prod.perPallet*(0.5+rnd()*0.5)));
    var mfg=recv-(prod.shelf&&prod.shelf<=30?ri(1,3):ri(5,45))*DAY;
    var p={id:nid("PLT",5),productId:prod.id,customerId:prod.ownerId,qty:qty,initQty:qty,unit:prod.unit,wh:wh,locationId:loc?loc.id:null,status:"available",receivedAt:recv,storedAt:recv+3*HOUR,withdrawnAt:null,
      lot:"LOT-"+new Date(mfg).getFullYear().toString().slice(2)+u.p2(new Date(mfg).getMonth()+1)+"-"+ri(100,999),mfg:mfg,expiry:prod.shelf?mfg+prod.shelf*DAY:null,reservedQty:0,receivingId:null,images:0,qtyLog:[{t:recv+3*HOUR,qty:qty}]};
    if(withdrawn){p.withdrawnAt=recv+ri(4,22)*DAY;if(p.withdrawnAt>NOW-DAY)p.withdrawnAt=NOW-DAY-ri(1,40)*HOUR;p.locationId=null;p.qtyLog.push({t:p.withdrawnAt,qty:0});p.qty=0;}
    PQ.push(p);
    var rcv=empBy("receiving",wh);
    mv("receive",p,p.receivedAt,rcv,null,null,0,p.initQty,{text:"استلام من المورد"});
    mv("store",p,p.storedAt,empBy("employee",wh),null,loc?loc.id:"WH-"+wh.slice(3)+"-ZE",p.initQty,p.initQty,{text:"تخزين"});
    if(withdrawn)mv("withdraw",p,p.withdrawnAt,empBy("dispatch",wh),"",null,p.initQty,0,{text:"سحب كامل وتسليم"});
    return p;
  }
  var TARGET={"WH-A":{ZA:40,ZB:38,ZC:22,ZD:28},"WH-B":{ZA:16,ZB:12,ZC:8,ZD:5},"WH-C":{ZA:10,ZB:8,ZC:6,ZD:4}};
  Object.keys(TARGET).forEach(function(wh){Object.keys(TARGET[wh]).forEach(function(zc){var cands=prodsFor(storageOfZone[zc]);if(zc==="ZB"&&!cands.length)cands=prodsFor("general");
    for(var i=0;i<TARGET[wh][zc];i++){var loc=freeByZone[wh+"-"+zc].shift();if(!loc)break;mkPallet(pick(cands),wh,loc,false);}});});
  /* withdrawn history (billing basis) */
  for(var wi=0;wi<30;wi++){var wp=pick(S.products.filter(function(p){return p.storage!=="cold"||rnd()<.4;}));mkPallet(wp,pick(["WH-A","WH-A","WH-B","WH-C"]),null,true);}
  /* make sure CUS-001 has a good number of stored pallets */
  var c1=PQ.filter(function(p){return p.customerId==="CUS-001"&&p.locationId;}).length;
  var guard=0;while(c1<14&&guard++<40){var pr=pick(S.products.filter(function(p){return p.ownerId==="CUS-001";}));var zcc=pr.storage==="cold"?"ZD":pr.storage==="food"?"ZB":"ZA";var lo=freeByZone["WH-A-"+zcc].shift();if(!lo)break;mkPallet(pr,"WH-A",lo,false);c1++;}
  /* expiry scenarios */
  var withExp=PQ.filter(function(p){return p.expiry&&p.locationId;}).sort(function(){return rnd()-.5;});
  withExp.slice(0,5).forEach(function(p){p.expiry=NOW-ri(2,22)*DAY;p.mfg=Math.min(p.mfg,p.expiry-30*DAY);});
  withExp.slice(5,10).forEach(function(p){p.expiry=NOW+ri(1,7)*DAY;});
  withExp.slice(10,20).forEach(function(p){p.expiry=NOW+ri(8,30)*DAY;});
  withExp.slice(20,30).forEach(function(p){p.expiry=NOW+ri(31,90)*DAY;});
  /* partial withdrawals + transfers (history) */
  var stored=PQ.filter(function(p){return p.locationId&&p.qty>10;}).sort(function(){return rnd()-.5;});
  stored.slice(0,16).forEach(function(p){var t=p.storedAt+Math.max(1,Math.floor((NOW-p.storedAt)/DAY*rnd()))*DAY;if(t>NOW-HOUR)t=NOW-DAY;var nq=Math.max(1,Math.round(p.qty*(0.5+rnd()*0.3)));mv("withdraw",p,t,empBy("dispatch",p.wh),p.locationId,null,p.qty,nq,{text:"سحب جزئي"});p.qtyLog.push({t:t,qty:nq});p.qty=nq;});
  stored.slice(16,36).forEach(function(p){var t=p.storedAt+Math.max(1,Math.floor((NOW-p.storedAt)/DAY*rnd()))*DAY;if(t>NOW-HOUR)t=NOW-DAY;var z=p.locationId.split("-R")[0];var alt=pick(S.locations.filter(function(l){return l.zone===z;}));mv("transfer",p,t,empBy("employee",p.wh),alt.id,p.locationId,p.qty,p.qty,{text:"إعادة تنظيم المواقع"});});
  /* special statuses */
  var cand=PQ.filter(function(p){return p.locationId&&p.expiry!==null&&p.expiry>NOW&&p.customerId!=="CUS-001";});
  var incPallets=[];
  cand.slice(0,4).forEach(function(p){p.status="damaged";incPallets.push(p);});
  PQ.filter(function(p){return p.locationId&&p.status==="available"&&p.customerId!=="CUS-001"&&p.qty>5;}).slice(0,3).forEach(function(p){p.status="quarantined";});
  PQ.filter(function(p){return p.locationId&&p.status==="available"&&p.customerId!=="CUS-001"&&p.qty>5;}).slice(5,8).forEach(function(p){p.status="blocked";});
  /* location states */
  var emptyLocs=S.locations.filter(function(l){return l.type!=="staging"&&!PQ.some(function(p){return p.locationId===l.id;});}).sort(function(){return rnd()-.5;});
  emptyLocs.slice(0,6).forEach(function(l){l.status="blocked";l.note=pick(["رف تالف بانتظار الصيانة","تسرب مياه","فحص سلامة","عائق مؤقت"]);});
  emptyLocs.slice(6,10).forEach(function(l){l.status="inactive";l.note="موقع غير مفعّل";});
  emptyLocs.filter(function(l){return l.wh==="WH-A"&&(l.zc==="ZA"||l.zc==="ZB");}).slice(10,16).forEach(function(l){l.reservedFor="CUS-001";l.note="محجوز لشحنة قادمة";});

  /* movement ids in chronological order */
  MV.sort(function(a,b){return a.ts-b.ts;});MV.forEach(function(m,i){m.id="MOV-"+String(i+1).padStart(5,"0");});S.meta.counters.MOV=MV.length;

  /* receivings from pallet groups */
  var groups={};
  PQ.forEach(function(p){var k=p.customerId+"|"+u.dayIdx(p.receivedAt)+"|"+p.wh;(groups[k]=groups[k]||[]).push(p);});
  Object.keys(groups).map(function(k){return groups[k];}).sort(function(a,b){return a[0].receivedAt-b[0].receivedAt;}).forEach(function(g){
    var sup=S.suppliers.filter(function(s){return s.customerIds.indexOf(g[0].customerId)>-1;});var supId=(sup.length?pick(sup):pick(S.suppliers)).id;
    var lines={};g.forEach(function(p){var l=lines[p.productId]||(lines[p.productId]={productId:p.productId,expectedQty:0,qty:0,pallets:0,lot:p.lot,mfg:p.mfg,expiry:p.expiry});l.qty+=p.initQty;l.expectedQty+=p.initQty;l.pallets++;});
    var r={id:nid("RCV"),customerId:g[0].customerId,supplierId:supId,wh:g[0].wh,apptId:null,expectedAt:g[0].receivedAt-2*HOUR,receivedAt:g[0].receivedAt,status:"stored",lines:Object.keys(lines).map(function(k){return lines[k];}),palletIds:g.map(function(p){return p.id;}),createdBy:empBy("receiving",g[0].wh),notes:""};
    S.receivings.push(r);g.forEach(function(p){p.receivingId=r.id;});});

  /* withdrawals: completed history from withdrawn pallets */
  var wg={};PQ.filter(function(p){return p.withdrawnAt;}).forEach(function(p){var k=p.customerId+"|"+u.dayIdx(p.withdrawnAt);(wg[k]=wg[k]||[]).push(p);});
  Object.keys(wg).map(function(k){return wg[k];}).forEach(function(g){var lines={};g.forEach(function(p){var l=lines[p.productId]||(lines[p.productId]={productId:p.productId,qty:0});l.qty+=p.initQty;});
    var t=g[0].withdrawnAt;S.withdrawals.push({id:"",customerId:g[0].customerId,by:"staff",date:u.ymd(t),method:pick(["pickup","delivery"]),status:"completed",kind:"full",lines:Object.keys(lines).map(function(k){return lines[k];}),allocations:g.map(function(p){return {palletId:p.id,qty:p.initQty,picked:p.initQty};}),assignedEmp:empBy("dispatch",g[0].wh),createdAt:t-DAY,completedAt:t,history:[{ts:t-DAY,status:"submitted",by:"customer"},{ts:t,status:"completed",by:"staff"}]});});
  /* open withdrawals on stored pallets */
  var openStatuses=[["submitted","CUS-001"],["submitted",null],["under_review",null],["approved","CUS-001"],["scheduled",null],["in_progress",null],["rejected",null]];
  var freeP=PQ.filter(function(p){return p.locationId&&p.status==="available"&&!p.reservedQty&&p.qty>6;});
  openStatuses.forEach(function(os,i){var p=os[1]?freeP.filter(function(x){return x.customerId===os[1];}).shift():freeP.filter(function(x){return x.customerId!=="CUS-001";}).shift();if(!p)return;freeP.splice(freeP.indexOf(p),1);
    var q=os[0]==="approved"||os[0]==="scheduled"||os[0]==="in_progress"?Math.ceil(p.qty*0.5):Math.ceil(p.qty*0.4);
    var w={id:"",customerId:p.customerId,by:"customer",date:u.ymd(NOW+(i%3)*DAY),method:i%2?"delivery":"pickup",status:os[0],kind:q<p.qty?"partial":"full",lines:[{productId:p.productId,qty:q}],allocations:[],assignedEmp:null,createdAt:NOW-(i+1)*3*HOUR,completedAt:null,history:[{ts:NOW-(i+1)*3*HOUR,status:"submitted",by:"customer"}]};
    if(["approved","scheduled","in_progress"].indexOf(os[0])>-1){w.allocations=[{palletId:p.id,qty:q,picked:null}];p.reservedQty=q;w.history.push({ts:NOW-i*HOUR,status:"approved",by:empBy("supervisor")});}
    if(os[0]==="scheduled"||os[0]==="in_progress"){w.assignedEmp=empBy("dispatch",p.wh);w.history.push({ts:NOW-i*HOUR/2,status:"scheduled",by:empBy("supervisor")});}
    if(os[0]==="in_progress")w.history.push({ts:NOW-HOUR/3,status:"in_progress",by:w.assignedEmp});
    if(os[0]==="rejected")w.history.push({ts:NOW-HOUR,status:"rejected",by:empBy("supervisor"),note:"الكمية المطلوبة غير متوفرة بالمخزون المتاح"});
    S.withdrawals.push(w);});
  S.withdrawals.sort(function(a,b){return a.createdAt-b.createdAt;});S.withdrawals.forEach(function(w){w.id=nid("WDR");});

  /* appointments --------------------------------------- */
  var apStatus=function(d,i){return d<0?"completed":d===0?["approved","arrived","in_progress","approved","requested"][i%5]:["requested","approved","approved","requested"][i%4];};
  var occ=function(wh,dock,dateStr,start,dur){return S.appointments.some(function(a){if(a.wh!==wh||a.dock!==dock||a.date!==dateStr||["rejected","cancelled","requested"].indexOf(a.status)>-1)return false;var s=toMin(a.start),e=s+a.dur,s2=toMin(start);return s2<e&&s2+dur>s;});};
  function toMin(h){var a=h.split(":");return +a[0]*60+ +a[1];}
  function toHm(m){return u.p2(Math.floor(m/60))+":"+u.p2(m%60);}
  var apCount=0;
  for(var ai=0;ai<20;ai++){
    var off=ai<4?-2:ai<8?-1:ai<14?0:(ai<17?1:2+(ai%2)),sup2=ai%3!==2,party=sup2?pick(S.suppliers):null,cust=sup2?S.customers.filter(function(c){return party.customerIds.indexOf(c.id)>-1;})[0]:pick(S.customers),wh=ai%5===4?"WH-B":"WH-A",op=sup2?"inbound":"outbound";
    var ds=u.ymd(NOW+off*DAY),dur=pick([30,45,60,90]),status=apStatus(off,ai),docks=S.warehouses.filter(function(w){return w.id===wh;})[0].docks.filter(function(d){return !d.maint;}).map(function(d){return d.id;});
    var start=toMin("08:00")+ri(0,9)*30,dock=null,tries=0;
    if(off===0){var nm=new Date(NOW);var base=Math.min(14*60,Math.max(10*60,nm.getHours()*60+Math.floor(nm.getMinutes()/30)*30));start=status==="in_progress"?base-60:status==="arrived"?base-30:status==="requested"?base+120:base+(ai%2?60:30);if(ai===9){start=base-90;status="approved";}}
    if(status==="requested"){dock=null;}else{do{dock=docks[(ai+tries)%docks.length];tries++;if(tries>40){start+=30;tries=0;}}while(occ(wh,dock,ds,toHm(start),dur));}
    if(off===0&&status==="in_progress"&&wh==="WH-A")dock="D2";
    if(off===0&&status==="approved"&&wh==="WH-A"&&ai===11)dock="D3";
    var a={id:nid("BK"),party:sup2?{type:"supplier",id:party.id}:{type:"customer",id:cust.id},customerId:cust.id,op:op,wh:wh,dock:dock,date:ds,start:toHm(start),dur:dur,plate:ri(10,99)+"-"+ri(10000,99999),driver:pick(FIRST)+" "+pick(LAST),phone:"07"+pick([7,8,9])+" "+ri(100,999)+" "+ri(1000,9999),pallets:ri(2,9),qty:ri(80,600),emp:empBy("supervisor",wh),status:status,requestedAt:NOW+(off-1)*DAY,arrivedAt:null,startedAt:null,completedAt:null,receivingId:null,note:""};
    var st=u.parseYmd(ds).getTime()+start*6e4;
    if(["arrived","in_progress","completed"].indexOf(status)>-1)a.arrivedAt=st+ri(-5,12)*6e4;
    if(["in_progress","completed"].indexOf(status)>-1)a.startedAt=a.arrivedAt+ri(8,35)*6e4;
    if(status==="completed")a.completedAt=a.startedAt+dur*6e4;
    S.appointments.push(a);apCount++;}
  /* invoices ------------------------------------------- */
  var C=W.core;
  var months=[3,2,1];
  months.forEach(function(mo){var d0=new Date(NOW);var first=new Date(d0.getFullYear(),d0.getMonth()-mo,1),last=new Date(d0.getFullYear(),d0.getMonth()-mo+1,0);
    S.customers.forEach(function(c,ci){if(ci>13)return;var calc=C.calc(c.id,u.dayIdx(first),u.dayIdx(last),S);if(calc.total<=0)return;
      var issued=+new Date(last.getFullYear(),last.getMonth(),last.getDate()+1);var due=issued+30*DAY;var st=mo===3?"paid":mo===2?(ci%4===1?"overdue":"paid"):(ci%5===0?"paid":"issued");
      if(st==="issued"&&due<NOW)st="overdue";
      S.invoices.push({id:nid("INV",4),customerId:c.id,from:u.ymd(first),to:u.ymd(last),lines:calc.lines,subtotal:calc.subtotal,vat:calc.vat,total:calc.total,status:st,issuedAt:issued,dueAt:due,paidAt:st==="paid"?issued+ri(5,25)*DAY:null,sim:true});});});
  S.invoices.sort(function(a,b){return a.issuedAt-b.issuedAt;});

  /* inspections / incidents */
  var recvs=S.receivings.slice(-14);
  recvs.forEach(function(r,i){var good=i%4!==3;S.inspections.push({id:nid("INS"),kind:"receiving",refId:r.id,palletId:r.palletIds[0],customerId:r.customerId,productId:r.lines[0].productId,condition:good?"good":"poor",packaging:good?"good":"acceptable",discrepancy:good?0:ri(2,12),damagedQty:good?0:ri(1,6),missing:good?0:ri(0,4),notes:good?"مطابقة للطلب":"تلف جزئي بالتغليف الخارجي لبعض الكراتين",photos:good?1:2,inspector:empBy("receiving",r.wh),date:r.receivedAt+HOUR});});
  S.inspections.push({id:nid("INS"),kind:"dispatch",refId:S.withdrawals[0].id,palletId:S.withdrawals[0].allocations[0].palletId,customerId:S.withdrawals[0].customerId,productId:S.withdrawals[0].lines[0].productId,condition:"good",packaging:"good",discrepancy:0,damagedQty:0,missing:0,notes:"فحص قبل التحميل",photos:1,inspector:empBy("dispatch"),date:S.withdrawals[0].completedAt-HOUR});
  incPallets.forEach(function(p,i){S.incidents.push({id:nid("INC"),customerId:p.customerId,productId:p.productId,palletId:p.id,locationId:p.locationId,category:DEFECTS[i%DEFECTS.length],desc:"تم رصد "+DEFECTS[i%DEFECTS.length]+" أثناء الفحص الدوري للموقع.",qtyAffected:ri(3,18),dept:pick(["العمليات","الاستلام","النقل الداخلي","التبريد"]),status:["reported","investigating","approved","resolved"][i%4],resolution:i%4===3?"تعويض العميل بخصم من فاتورة الشهر":"",photos:ri(1,3),createdAt:NOW-ri(1,20)*DAY,reporter:empBy("employee")});});
  S.incidents.push({id:nid("INC"),customerId:"CUS-001",productId:S.products.filter(function(p){return p.ownerId==="CUS-001";})[0].id,palletId:null,locationId:null,category:"سقوط طبلية أثناء المناولة",desc:"سقوط طبلية جزئي أثناء النقل الداخلي، لا إصابات.",qtyAffected:4,dept:"النقل الداخلي",status:"resolved",resolution:"تم استبدال الكمية التالفة",photos:2,createdAt:NOW-40*DAY,reporter:empBy("supervisor")});

  /* counts */
  var cz=S.zones[0];var cp=PQ.filter(function(p){return p.locationId&&p.locationId.indexOf("WH-A-ZA-R01")===0;});
  S.counts.push({id:nid("CNT"),wh:"WH-A",zone:"WH-A-ZA",row:1,status:"approved",by:empBy("employee","WH-A"),createdAt:NOW-9*DAY,approvedBy:empBy("ops_manager"),lines:cp.slice(0,8).map(function(p,i){return {palletId:p.id,sysQty:p.qty,actualQty:i===2?p.qty-3:p.qty};})});
  S.counts.push({id:nid("CNT"),wh:"WH-A",zone:"WH-A-ZB",row:2,status:"open",by:empBy("employee","WH-A"),createdAt:NOW-2*HOUR,approvedBy:null,lines:[]});

  /* requests (customer portal) */
  var reqTypes=[["storage","طلب تخزين جديد","status"],["inspection","طلب فحص مخزون","status"],["complaint","شكوى","status"],["question","استفسار","status"],["relocation","طلب إعادة تموضع","status"],["damage","بلاغ بضاعة تالفة","status"]];
  ["submitted","under_review","approved","scheduled","in_progress","completed","rejected","submitted"].forEach(function(st,i){var t=reqTypes[i%reqTypes.length],cid=i<4?"CUS-001":S.customers[(i*3+2)%28].id;
    S.requests.push({id:nid("REQ"),customerId:cid,type:t[0],title:t[1],details:["نرغب بتخزين 12 طبلية مواد غذائية خلال الأسبوع القادم","نحتاج فحص جودة لمنتجات المنطقة D","تأخر في تسليم الطلب الأخير","هل يمكن الحصول على كشف حركة للشهر الماضي؟","نقل الطبالي إلى منطقة أقرب للباب","تلف بكرتونتين أثناء الاستلام","طلب تخزين مؤقت لمدة أسبوعين","استفسار حول رسوم الخدمات الإضافية"][i],status:st,refId:null,createdAt:NOW-(i+1)*5*HOUR,history:[{ts:NOW-(i+1)*5*HOUR,status:"submitted",by:"customer"}].concat(st==="submitted"?[]:[{ts:NOW-(i+1)*3*HOUR,status:st,by:empBy("supervisor")}])});});

  /* notifications */
  var NT=[["request","info","طلب عميل جديد","شركة الأفق للتجارة قدّمت طلب سحب جزئي","requests"],["booking","warn","حجز يحتاج موافقة","طلب موعد استلام جديد من مورد","appointments"],["receiving","warn","فرق بالاستلام","فرق 6 وحدات بين الكمية المتوقعة والمستلمة","ops/receiving"],["damage","err","بضاعة تالفة","تم الإبلاغ عن تلف بطبلية في المنطقة B","inspections"],["expiry","warn","منتجات قاربت الانتهاء","منتجات تنتهي صلاحيتها خلال 7 أيام","expiry"],["capacity","err","سعة المستودع","المنطقة D (التبريد) في المستودع A تجاوزت 90% إشغال","space"],["delay","warn","عملية متأخرة","شاحنة وصلت قبل أكثر من 30 دقيقة ولم يبدأ تفريغها","appointments"],["sync","err","فشل مزامنة","فشلت مزامنة 7 سجلات مع Microsoft Dynamics","integrations"],["invoice","warn","فاتورة متأخرة","فواتير متأخرة السداد تحتاج متابعة","billing"],["request","info","طلب عميل جديد","طلب تخزين جديد بانتظار المراجعة","requests"],["booking","info","موعد مؤكد","تم تأكيد موعد التفريغ على الرصيف D1","appointments"],["receiving","info","استلام غير مؤكد","استلام ينتظر تأكيد التخزين","ops/storage"]];
  NT.forEach(function(n,i){S.notifications.push({id:nid("NTF"),ts:NOW-(i+1)*55*6e4,cat:n[0],level:n[1],title:n[2],body:n[3],read:i>7,link:n[4]});});

  /* integrations */
  var MAPF=[["Product ID","ERP Product ID","Product ID"],["Customer ID","ERP Customer ID","Customer ID"],["Warehouse ID","ERP Warehouse ID","Warehouse ID"],["Inventory Quantity","ERP Stock Quantity","Inventory Quantity"],["Operation Reference","ERP Document Reference","Operation Reference"]];
  [["sap","SAP S/4HANA","connected",1284,0,0],["oracle","Oracle ERP Cloud","disconnected",0,0,0],["dynamics","Microsoft Dynamics 365","error",902,12,7],["odoo","Odoo","syncing",640,18,0],["rest","Custom ERP / REST API","connected",412,0,1],["csv","CSV / Excel","connected",96,0,0]].forEach(function(x,i){
    S.integrations.push({id:x[0],name:x[1],status:x[2],lastSync:x[2]==="disconnected"?null:NOW-(i*17+6)*6e4,synced:x[3],pending:x[4],failed:x[5],
      history:x[2]==="disconnected"?[]:[{ts:NOW-(i*17+6)*6e4,result:x[2]==="error"?"error":"ok",count:ri(20,120),msg:x[2]==="error"?"Timeout while posting stock movements (HTTP 504)":"Delta sync completed"},{ts:NOW-(i*17+60)*6e4,result:"ok",count:ri(20,120),msg:"Delta sync completed"},{ts:NOW-(i*17+240)*6e4,result:"ok",count:ri(20,120),msg:"Master data import"}],
      flags:{masterData:true,stock:true,transactions:i!==1,billing:i===0||i===4,dedupe:true},mapping:MAPF.map(function(m){return {erp:m[1],wms:m[2],key:m[0]};})});});
  return S;
};
})();
