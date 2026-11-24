/* Reusable UI components: icons, tables, modals, drawers, toasts, SVG charts, forms. */
(function(){
"use strict";
var W=window.W=window.W||{};
var u=W.u,esc=u.esc;
var UI=W.ui={ts:{},tables:{}};
W.act={};W.chg={};W.inp={};W.sub={};

/* ---------- icons ---------- */
var P={
 dash:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
 map:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 box:'<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
 flow:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 013 3v6.5M6 8.5V12a3 3 0 003 3h6"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.5 3.5 0 010 7M18 14.5c2 .6 3.5 2.4 3.5 5"/>',
 truck:'<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 bill:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 check:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 3v3h8V3M9 13l2.2 2.2L15.5 11"/>',
 grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 badge:'<circle cx="12" cy="8" r="4"/><path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5"/>',
 chart:'<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
 plug:'<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0zM12 17v4"/>',
 bell:'<path d="M6 17h12l-1.5-2V10a4.5 4.5 0 00-9 0v5zM10 20h4"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 car:'<path d="M9 6l6 6-6 6"/>',
 down:'<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
 up:'<path d="M12 20V8M6 13l6-6 6 6M5 4h14"/>',
 swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
 shield:'<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>',
 out:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
 print:'<path d="M7 9V3h10v6M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2M7 14h10v7H7z"/>',
 dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
 warn:'<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 refresh:'<path d="M20 12a8 8 0 10-3 6.2M20 5v5h-5"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
 cube:'<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12L3 7M12 12v10"/>',
 file:'<path d="M6 3h8l5 5v13H6zM14 3v5h5"/>'
};
W.icon=function(n,cls){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'+(cls?' class="'+cls+'"':'')+'>'+(P[n]||P.box)+'</svg>';};
var I=W.icon;

/* ---------- small renderers ---------- */
UI.badge=function(t,c){return '<span class="badge '+(c||"gray")+'">'+esc(t)+'</span>';};
UI.pBadge=function(p){var s=W.core.pstatus(p),m=W.core.PS[s];return UI.badge(m[0],m[1]);};
UI.wBadge=function(s){var m=W.core.WSTAT[s]||[s,"gray"];return UI.badge(m[0],m[1]);};
UI.lBadge=function(s){var m=W.core.LS[s];return UI.badge(m[0],m[1]);};
UI.kv=function(a){return '<dl class="kv">'+a.map(function(x){return '<dt>'+x[0]+'</dt><dd>'+(x[1]==null||x[1]===""?"—":x[1])+'</dd>';}).join("")+'</dl>';};
UI.empty=function(t,d){return '<div class="empty"><b>'+t+'</b>'+(d||"")+'</div>';};
UI.pageHead=function(t,d,actions){return '<div class="ph-h"><div><h1>'+t+'</h1>'+(d?'<p>'+d+'</p>':'')+'</div><div class="row wrap">'+(actions||"")+'</div></div>';};
UI.sim=function(t){return '<span class="sim">'+(t||"بيانات محاكاة")+'</span>';};
UI.opts=function(list,sel,ph){return (ph!=null?'<option value="">'+ph+'</option>':'')+list.map(function(o){var v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+(String(v)===String(sel)?' selected':'')+'>'+esc(l)+'</option>';}).join("");};
UI.field=function(label,name,o){o=o||{};var t=o.type||"text",v=o.value==null?"":o.value,attrs=(o.req?' data-req="1"':'')+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+(o.min!=null?' min="'+o.min+'"':'')+(o.max!=null?' max="'+o.max+'"':'')+(o.step?' step="'+o.step+'"':'')+(o.attrs?' '+o.attrs:'')+(o.dis?' disabled':'')+(o.list?' list="'+o.list+'"':'');
  var inner;if(t==="select")inner='<select name="'+name+'"'+attrs+'>'+(o.options||"")+'</select>';else if(t==="textarea")inner='<textarea name="'+name+'"'+attrs+'>'+esc(v)+'</textarea>';else inner='<input type="'+t+'" name="'+name+'" value="'+esc(v)+'"'+attrs+'>';
  return '<div class="field'+(o.cls?' '+o.cls:'')+'" data-f="'+name+'"><label>'+label+(o.req?' <span style="color:var(--red)">*</span>':'')+'</label>'+inner+'<span class="em"></span></div>';};
UI.form=function(f){var o={};new FormData(f).forEach(function(v,k){o[k]=v;});return o;};
UI.fieldErr=function(form,name,msg){var el=form.querySelector('[data-f="'+name+'"]');if(!el)return;el.classList.add("err");el.querySelector(".em").textContent=msg;};
UI.clearErr=function(form){form.querySelectorAll(".field.err").forEach(function(e){e.classList.remove("err");e.querySelector(".em").textContent="";});};
UI.reqCheck=function(form){UI.clearErr(form);var ok=true;form.querySelectorAll("[data-req]").forEach(function(el){if(!String(el.value).trim()){UI.fieldErr(form,el.name,"هذا الحقل مطلوب");ok=false;}});if(!ok){var f=form.querySelector(".field.err input, .field.err select");if(f)f.focus();}return ok;};
UI.timeline=function(items){return '<div class="tl">'+items.map(function(i){return '<div class="e '+(i.c||"")+'"><div class="b">'+i.title+'</div><div class="sm mute">'+(i.sub||"")+'</div></div>';}).join("")+'</div>';};
UI.stepper=function(steps,cur){var ci=steps.findIndex(function(s){return s[0]===cur;});return '<div class="stepper">'+steps.map(function(s,i){return '<div class="s '+(i<ci?"done":i===ci?"cur":"")+'">'+s[1]+'</div>';}).join("")+'</div>';};
UI.progress=function(pct,cls){return '<div class="progress '+(cls||(pct>=90?"r":pct>=75?"y":""))+'"><i style="width:'+Math.min(100,pct)+'%"></i></div>';};

/* ---------- toast / modal / drawer ---------- */
UI.toast=function(msg,type){var b=document.getElementById("toasts");if(!b)return;var t=document.createElement("div");t.className="toast "+(type||"");t.innerHTML='<div>'+msg+'</div>';b.appendChild(t);setTimeout(function(){t.style.opacity=0;t.style.transition=".3s";setTimeout(function(){t.remove();},300);},type==="err"?5200:3200);};
var modals=[];
UI.modal=function(o){var ov=document.createElement("div");ov.className="ov";ov.innerHTML='<div class="modal '+(o.size||"")+'" role="dialog"><div class="mh"><h2>'+o.title+'</h2><button class="x" data-act="closeModal" aria-label="إغلاق">×</button></div><div class="mb">'+o.body+'</div>'+(o.footer?'<div class="mf">'+o.footer+'</div>':'')+'</div>';
  ov.addEventListener("mousedown",function(e){if(e.target===ov&&!o.sticky)UI.closeModal();});document.body.appendChild(ov);modals.push({el:ov,o:o});var f=ov.querySelector("input:not([type=hidden]),select,textarea");if(f&&!o.noFocus)setTimeout(function(){try{f.focus();}catch(e){}},30);return ov;};
UI.closeModal=function(){var m=modals.pop();if(m){m.el.remove();if(m.o.onClose)m.o.onClose();}};
UI.topModal=function(){return modals.length?modals[modals.length-1].el:null;};
UI.closeAllModals=function(){while(modals.length)UI.closeModal();};
UI.confirm=function(msg,fn,o){o=o||{};UI.modal({title:o.title||"تأكيد العملية",body:'<p>'+msg+'</p>',footer:'<button class="btn" data-act="closeModal">إلغاء</button><button class="btn '+(o.danger?'danger':'primary')+'" id="cfm-ok">'+(o.ok||"تأكيد")+'</button>'});
  document.getElementById("cfm-ok").onclick=function(){UI.closeModal();fn();};};
var drawerEl=null,dovEl=null;
UI.drawer=function(o){UI.closeDrawer();dovEl=document.createElement("div");dovEl.className="dov";dovEl.onclick=UI.closeDrawer;drawerEl=document.createElement("div");drawerEl.className="drawer";
  drawerEl.innerHTML='<div class="dh"><div style="min-width:0"><div class="xs mute">'+(o.kicker||"")+'</div><h2>'+o.title+'</h2></div><button class="x" data-act="closeDrawer" aria-label="إغلاق">×</button></div><div class="db">'+o.body+'</div>'+(o.footer?'<div class="df">'+o.footer+'</div>':'');
  document.body.appendChild(dovEl);document.body.appendChild(drawerEl);};
UI.closeDrawer=function(){if(drawerEl){drawerEl.remove();drawerEl=null;}if(dovEl){dovEl.remove();dovEl=null;}};
UI.drawerOpen=function(){return !!drawerEl;};
document.addEventListener("keydown",function(e){if(e.key==="Escape"){if(modals.length)UI.closeModal();else if(drawerEl)UI.closeDrawer();}});

/* ---------- tables ---------- */
function ts(id){return UI.ts[id]||(UI.ts[id]={q:"",page:1,sort:null,dir:1,f:{},sel:{}});}
function filtered(id){var cfg=UI.tables[id],t=ts(id),rows=cfg.rows.slice();
  (cfg.filters||[]).forEach(function(f){var v=t.f[f.k];if(v!==undefined&&v!==""&&v!=="all")rows=rows.filter(function(r){return f.test(r,v);});});
  if(t.q){var q=t.q.toLowerCase();rows=rows.filter(function(r){return cfg.cols.some(function(c){var v=c.v?c.v(r):"";return String(v==null?"":v).toLowerCase().indexOf(q)>-1;});});}
  if(t.sort){var c=cfg.cols.filter(function(x){return x.k===t.sort;})[0];if(c&&c.v)rows.sort(function(a,b){var x=c.v(a),y=c.v(b);if(x==null)return 1;if(y==null)return -1;return (typeof x==="number"&&typeof y==="number"?x-y:String(x).localeCompare(String(y),"ar"))*t.dir;});}
  return rows;}
function mainHtml(id){var cfg=UI.tables[id],t=ts(id),rows=filtered(id),ps=cfg.pageSize||12,pages=Math.max(1,Math.ceil(rows.length/ps));if(t.page>pages)t.page=pages;var slice=rows.slice((t.page-1)*ps,t.page*ps);
  var selN=Object.keys(t.sel).length,h="";
  if(cfg.select&&selN)h+='<div class="row between" style="padding:8px 12px;background:var(--blue-l)"><b>'+selN+' عنصر محدد</b><div class="row">'+(cfg.bulk?cfg.bulk(Object.keys(t.sel)):"")+'<button class="btn xs" data-tclr="'+id+'">إلغاء التحديد</button></div></div>';
  h+='<div class="tw"><table class="tbl"><thead><tr>'+(cfg.select?'<th style="width:34px"><input type="checkbox" data-tall="'+id+'"'+(slice.length&&slice.every(function(r){return t.sel[cfg.key(r)];})?" checked":"")+'></th>':'')+cfg.cols.map(function(c){return '<th class="'+(c.v?"sortable":"")+(c.num?" num":"")+'"'+(c.v?' data-tsort="'+id+'|'+c.k+'"':'')+'>'+c.label+(t.sort===c.k?(t.dir>0?" ▲":" ▼"):"")+'</th>';}).join("")+'</tr></thead><tbody>';
  if(!slice.length)h+='<tr><td colspan="'+(cfg.cols.length+(cfg.select?1:0))+'">'+UI.empty(cfg.emptyT||"لا توجد نتائج","<span>جرّب تغيير البحث أو الفلاتر</span>")+'</td></tr>';
  slice.forEach(function(r){var key=cfg.key?cfg.key(r):"";h+='<tr'+(cfg.rowAct?' class="clk" data-act="'+cfg.rowAct+'" data-id="'+esc(key)+'"':'')+'>'+(cfg.select?'<td data-stop="1"><input type="checkbox" data-tsel="'+id+'|'+esc(key)+'"'+(t.sel[key]?" checked":"")+'></td>':'')+cfg.cols.map(function(c){return '<td class="'+(c.num?"num":"")+'">'+(c.render?c.render(r):esc(c.v?c.v(r):""))+'</td>';}).join("")+'</tr>';});
  h+='</tbody></table></div><div class="pager"><span>'+u.n(rows.length)+' سجل'+(rows.length!==cfg.rows.length?' (من '+u.n(cfg.rows.length)+')':'')+'</span><div class="pg">';
  if(pages>1){h+='<button data-tpage="'+id+'|'+(t.page-1)+'"'+(t.page<=1?" disabled":"")+'>›</button>';var s0=Math.max(1,t.page-2),e0=Math.min(pages,s0+4);s0=Math.max(1,e0-4);for(var p=s0;p<=e0;p++)h+='<button data-tpage="'+id+'|'+p+'" class="'+(p===t.page?"on":"")+'">'+p+'</button>';h+='<button data-tpage="'+id+'|'+(t.page+1)+'"'+(t.page>=pages?" disabled":"")+'>‹</button>';}
  return h+'</div></div>';}
UI.table=function(id,cfg){UI.tables[id]=cfg;var t=ts(id);
  var tb='<div class="toolbar"><input class="inp sinp" placeholder="'+(cfg.searchPh||"بحث...")+'" value="'+esc(t.q)+'" data-tq="'+id+'">'+(cfg.filters||[]).map(function(f){return '<select class="inp" data-tf="'+id+'|'+f.k+'" title="'+f.label+'">'+UI.opts([["all",f.label+": الكل"]].concat(f.options),t.f[f.k]||"all")+'</select>';}).join("")+(cfg.toolbar||"")+(cfg.exportName?'<button class="btn sm" data-texp="'+id+'" style="margin-inline-start:auto">'+I("dl")+' تصدير CSV</button>':'')+'</div>';
  return '<div data-tbl="'+id+'">'+tb+'<div class="card tbl-main">'+mainHtml(id)+'</div></div>';};
UI.tableRefresh=function(id){var el=document.querySelector('[data-tbl="'+id+'"] .tbl-main');if(el)el.innerHTML=mainHtml(id);};
UI.tableExport=function(id){var cfg=UI.tables[id],rows=filtered(id);var cols=cfg.cols.filter(function(c){return c.v;});u.download((cfg.exportName||id)+".csv",u.csv(cols.map(function(c){return c.label;}),rows.map(function(r){return cols.map(function(c){var v=c.v(r);return v==null?"":v;});})));UI.toast("تم تصدير "+rows.length+" سجل إلى CSV","ok");};
document.addEventListener("input",function(e){var t=e.target;if(t.dataset.tq){var s=ts(t.dataset.tq);s.q=t.value;s.page=1;UI.tableRefresh(t.dataset.tq);}else if(t.dataset.inp&&W.inp[t.dataset.inp])W.inp[t.dataset.inp](t,e);});
document.addEventListener("change",function(e){var t=e.target;
  if(t.dataset.tf){var p=t.dataset.tf.split("|"),s=ts(p[0]);s.f[p[1]]=t.value;s.page=1;UI.tableRefresh(p[0]);}
  else if(t.dataset.tsel){var q=t.dataset.tsel.split("|"),s2=ts(q[0]);if(t.checked)s2.sel[q[1]]=1;else delete s2.sel[q[1]];UI.tableRefresh(q[0]);}
  else if(t.dataset.tall){var id=t.dataset.tall,cfg=UI.tables[id],st=ts(id),rows=filtered(id),ps=cfg.pageSize||12;rows.slice((st.page-1)*ps,st.page*ps).forEach(function(r){if(t.checked)st.sel[cfg.key(r)]=1;else delete st.sel[cfg.key(r)];});UI.tableRefresh(id);}
  else if(t.dataset.chg&&W.chg[t.dataset.chg])W.chg[t.dataset.chg](t,e);
  else if(t.dataset.photo){UI.addPhotos(t);}});
/* ---------- photos (browser file select + preview, downscaled to keep storage small) ---------- */
UI.photoInput=function(name){return '<div class="field full" data-f="'+name+'"><label>صور الفحص (اختر ملفات من جهازك — تُحفظ مصغّرة في المتصفح)</label><input type="file" accept="image/*" multiple data-photo="'+name+'"><div class="photo-grid mt8" id="ph-'+name+'"></div></div>';};
UI.addPhotos=function(inp){var box=document.getElementById("ph-"+inp.dataset.photo);Array.prototype.slice.call(inp.files||[]).slice(0,6).forEach(function(f){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var c=document.createElement("canvas"),k=Math.min(1,160/Math.max(im.width,im.height));c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);var img=document.createElement("img");img.src=c.toDataURL("image/jpeg",.6);box.appendChild(img);};im.src=r.result;};r.readAsDataURL(f);});inp.value="";};
UI.collectPhotos=function(form,name){return Array.prototype.slice.call(form.querySelectorAll("#ph-"+name+" img")).map(function(i){return i.src;});};
UI.photos=function(ph){if(Array.isArray(ph))return '<div class="photo-grid">'+ph.map(function(s){return '<img src="'+s+'" alt="">';}).join("")+'</div>';var n=+ph||0;return n?'<div class="photo-grid">'+Array(n+1).join('<div class="fake-ph">صورة<br>(محاكاة)</div>')+'</div>':'<span class="mute">لا توجد صور</span>';};

/* ---------- charts (SVG) ---------- */
var COL=["#2563eb","#16a34a","#d97706","#7c3aed","#0e7490","#dc2626","#64748b","#db2777"];
UI.COL=COL;
function nice(max){if(max<=0)return 1;var p=Math.pow(10,Math.floor(Math.log10(max))),n=max/p;var m=n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10;return m*p;}
UI.line=function(labels,series,o){o=o||{};var Wd=600,Ht=o.h||220,L=44,R=12,T=12,B=26,max=nice(Math.max.apply(null,[1].concat([].concat.apply([],series.map(function(s){return s.data;}))))*1.05);
  var n=labels.length,x=function(i){return L+(Wd-L-R)*(n<2?.5:i/(n-1));},y=function(v){return T+(Ht-T-B)*(1-v/max);},s='<svg class="ch-svg" viewBox="0 0 '+Wd+' '+Ht+'" role="img">';
  for(var g=0;g<=4;g++){var gy=T+(Ht-T-B)*g/4;s+='<line x1="'+L+'" x2="'+(Wd-R)+'" y1="'+gy+'" y2="'+gy+'" stroke="#e5eaf2"/><text x="'+(L-6)+'" y="'+(gy+4)+'" text-anchor="end">'+u.n(max*(1-g/4),max<10?1:0)+(o.unit||"")+'</text>';}
  var step=Math.ceil(n/8);labels.forEach(function(l,i){if(i%step===0||i===n-1)s+='<text x="'+x(i)+'" y="'+(Ht-8)+'" text-anchor="middle">'+l+'</text>';});
  series.forEach(function(se,si){var c=se.color||COL[si%COL.length],pts=se.data.map(function(v,i){return x(i)+","+y(v);}).join(" ");
    if(o.area&&si===0)s+='<polygon points="'+x(0)+","+y(0)+" "+pts+" "+x(n-1)+","+y(0)+'" fill="'+c+'" opacity=".09"/>';
    s+='<polyline points="'+pts+'" fill="none" stroke="'+c+'" stroke-width="2.2" stroke-linejoin="round"/>';se.data.forEach(function(v,i){s+='<circle cx="'+x(i)+'" cy="'+y(v)+'" r="3" fill="#fff" stroke="'+c+'" stroke-width="2"><title>'+labels[i]+": "+u.n(v,v%1?1:0)+(o.unit||"")+(se.name?" — "+se.name:"")+'</title></circle>';});});
  s+='</svg>';return s+UI.legend(series);};
UI.legend=function(series){if(series.length<2)return "";return '<div class="legend">'+series.map(function(se,i){return '<span><i style="background:'+(se.color||COL[i%COL.length])+'"></i>'+se.name+'</span>';}).join("")+'</div>';};
UI.bar=function(labels,series,o){o=o||{};var Wd=600,Ht=o.h||220,L=44,R=12,T=12,B=26,n=labels.length,stacked=o.stacked,tot=labels.map(function(_,i){return stacked?series.reduce(function(a,s){return a+(s.data[i]||0);},0):Math.max.apply(null,series.map(function(s){return s.data[i]||0;}));}),max=nice(Math.max.apply(null,[1].concat(tot))*1.05),
  y=function(v){return T+(Ht-T-B)*(1-v/max);},bw=(Wd-L-R)/n,s='<svg class="ch-svg" viewBox="0 0 '+Wd+' '+Ht+'" role="img">';
  for(var g=0;g<=4;g++){var gy=T+(Ht-T-B)*g/4;s+='<line x1="'+L+'" x2="'+(Wd-R)+'" y1="'+gy+'" y2="'+gy+'" stroke="#e5eaf2"/><text x="'+(L-6)+'" y="'+(gy+4)+'" text-anchor="end">'+u.n(max*(1-g/4),max<10?1:0)+(o.unit||"")+'</text>';}
  labels.forEach(function(l,i){var gx=L+bw*i,inner=bw*.66,k=series.length;if(stacked){var acc=0;series.forEach(function(se,si){var v=se.data[i]||0;s+='<rect x="'+(gx+(bw-inner)/2)+'" y="'+y(acc+v)+'" width="'+inner+'" height="'+Math.max(0,y(acc)-y(acc+v))+'" fill="'+(se.color||COL[si%COL.length])+'"><title>'+l+" — "+se.name+": "+u.n(v)+'</title></rect>';acc+=v;});}
    else{var w2=inner/k;series.forEach(function(se,si){var v=se.data[i]||0;s+='<rect x="'+(gx+(bw-inner)/2+w2*si)+'" y="'+y(v)+'" width="'+(w2-2)+'" height="'+Math.max(0,y(0)-y(v))+'" rx="2" fill="'+(se.color||COL[si%COL.length])+'"><title>'+l+(se.name?" — "+se.name:"")+": "+u.n(v,v%1?1:0)+(o.unit||"")+'</title></rect>';});}
    s+='<text x="'+(gx+bw/2)+'" y="'+(Ht-8)+'" text-anchor="middle">'+l+'</text>';});
  return s+'</svg>'+UI.legend(series);};
UI.donut=function(items,o){o=o||{};var tot=items.reduce(function(a,i){return a+i.value;},0)||1,off=25,s='<svg viewBox="0 0 42 42" style="width:'+(o.size||150)+'px;flex:none"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="#eef1f6" stroke-width="6"/>';
  items.forEach(function(i,k){var pct=i.value/tot*100;s+='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="'+(i.color||COL[k%COL.length])+'" stroke-width="6" stroke-dasharray="'+pct+' '+(100-pct)+'" stroke-dashoffset="'+off+'"><title>'+i.label+": "+u.n(i.value)+'</title></circle>';off-=pct;});
  s+='<text x="21" y="22.5" text-anchor="middle" style="font-size:6.5px;font-weight:700;fill:#142033">'+(o.center!=null?o.center:u.n(tot))+'</text><text x="21" y="27.5" text-anchor="middle" style="font-size:3px;fill:#64748b">'+(o.sub||"")+'</text></svg>';
  return '<div class="row" style="align-items:center;gap:16px;flex-wrap:wrap">'+s+'<div class="col gap6 grow" style="min-width:140px">'+items.map(function(i,k){return '<div class="row between sm"><span><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:'+(i.color||COL[k%COL.length])+';margin-inline-end:6px"></i>'+i.label+'</span><b>'+u.n(i.value)+'</b></div>';}).join("")+'</div></div>';};
UI.hbar=function(items,o){o=o||{};var max=Math.max.apply(null,[1].concat(items.map(function(i){return i.value;})));return '<div class="col gap6">'+items.map(function(i,k){return '<div><div class="row between sm"><span>'+i.label+'</span><b>'+u.n(i.value,o.d||0)+(o.unit||"")+'</b></div><div class="progress"><i style="width:'+(i.value/max*100)+'%;background:'+(i.color||COL[0])+'"></i></div></div>';}).join("")+'</div>';};

/* ---------- print helper ---------- */
UI.printModal=function(title,html){var m=UI.modal({title:title,size:"lg",body:'<div class="print-area">'+html+'</div>',footer:'<button class="btn" data-act="closeModal">إغلاق</button><button class="btn primary" data-act="doPrint">'+I("print")+' طباعة / حفظ PDF</button>'});return m;};
W.act.doPrint=function(){window.print();};
W.act.closeModal=function(){UI.closeModal();};
W.act.closeDrawer=function(){UI.closeDrawer();};

/* ---------- global event delegation ---------- */
document.addEventListener("click",function(e){var t=e.target;
  var sort=t.closest("[data-tsort]");if(sort){var p=sort.dataset.tsort.split("|"),s=ts(p[0]);if(s.sort===p[1])s.dir*=-1;else{s.sort=p[1];s.dir=1;}UI.tableRefresh(p[0]);return;}
  var pg=t.closest("[data-tpage]");if(pg&&!pg.disabled){var q=pg.dataset.tpage.split("|");ts(q[0]).page=+q[1];UI.tableRefresh(q[0]);return;}
  var ex=t.closest("[data-texp]");if(ex){UI.tableExport(ex.dataset.texp);return;}
  var cl=t.closest("[data-tclr]");if(cl){ts(cl.dataset.tclr).sel={};UI.tableRefresh(cl.dataset.tclr);return;}
  var st=t.closest("[data-stop]"),a=t.closest("[data-act]");
  if(st&&a&&a!==st&&a.contains(st))return;
  if(st&&!a)return;
  if(a&&W.act[a.dataset.act]){if(a.tagName==="A"&&!/^#/.test(a.getAttribute("href")||""))e.preventDefault();W.act[a.dataset.act](a,e);}});
document.addEventListener("submit",function(e){var f=e.target;if(f.dataset&&f.dataset.sub){e.preventDefault();if(W.sub[f.dataset.sub])W.sub[f.dataset.sub](f,e);}});
UI.busy=function(btn,ms,fn){btn.classList.add("loading");setTimeout(function(){btn.classList.remove("loading");fn();},ms||900);};
})();
