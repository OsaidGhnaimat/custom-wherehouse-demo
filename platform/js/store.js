/* Data layer: state, persistence (localStorage), helpers. All data is SIMULATED demo data. */
(function(){
"use strict";
var W=window.W=window.W||{};
W.SCHEMA=3;
var KEY="wms_demo_state_v3", SKEY="wms_demo_session_v3";

/* ---------- helpers ---------- */
var u=W.u={};
u.esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
u.n=function(x,d){d=d||0;return Number(x||0).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});};
u.jod=function(x){return u.n(x,2)+" د.أ";};
u.p2=function(n){return n<10?"0"+n:""+n;};
u.date=function(t){if(!t)return "—";var d=new Date(t);return u.p2(d.getDate())+"/"+u.p2(d.getMonth()+1)+"/"+d.getFullYear();};
u.time=function(t){var d=new Date(t);return u.p2(d.getHours())+":"+u.p2(d.getMinutes());};
u.dt=function(t){return t?u.date(t)+" "+u.time(t):"—";};
u.ymd=function(t){var d=new Date(t);return d.getFullYear()+"-"+u.p2(d.getMonth()+1)+"-"+u.p2(d.getDate());};
u.dayIdx=function(t){var d=new Date(t);return Math.floor((+d-d.getTimezoneOffset()*6e4)/864e5);};
u.fromDayIdx=function(i){var d=new Date(i*864e5);return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());};
u.parseYmd=function(s){var a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2]);};
u.addDays=function(t,n){return new Date(+new Date(t)+n*864e5);};
u.monthStart=function(t){var d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),1);};
u.slug=function(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-");};
u.rng=function(seed){var t=seed>>>0;return function(){t+=0x6D2B79F5;var r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return((r^r>>>14)>>>0)/4294967296;};};
u.csv=function(cols,rows){
  function c(v){v=v==null?"":String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
  return "﻿"+[cols.map(c).join(",")].concat(rows.map(function(r){return r.map(c).join(",");})).join("\n");
};
u.download=function(name,text,type){var b=new Blob([text],{type:type||"text/csv;charset=utf-8"});var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);};

/* demo clock: time-travel supported */
W.now=function(){return new Date(Date.now()+((W.store.state&&W.store.state.meta.clockOffsetDays)||0)*864e5);};

/* ---------- store ---------- */
var store=W.store={state:null,v:0,listeners:[],_t:null,saveFailed:false};
store.on=function(fn){this.listeners.push(fn);};
store.emit=function(){for(var i=0;i<this.listeners.length;i++){try{this.listeners[i]();}catch(e){console.error(e);}}};
store.load=function(){
  try{var raw=localStorage.getItem(KEY);if(raw){var s=JSON.parse(raw);if(s&&s.meta&&s.meta.schema===W.SCHEMA){this.state=s;return;}}}catch(e){}
  this.state=W.seed();this.save(true);
};
store.save=function(now){
  var self=this;clearTimeout(this._t);
  var run=function(){try{localStorage.setItem(KEY,JSON.stringify(self.state));}catch(e){if(!self.saveFailed){self.saveFailed=true;console.warn("localStorage save failed",e);}}};
  if(now)run();else this._t=setTimeout(run,200);
};
store.commit=function(){this.v++;this.save();this.emit();};
store.reset=function(){try{localStorage.removeItem(KEY);}catch(e){}this.state=W.seed();this.v++;this.save(true);this.emit();};
store.id=function(prefix,pad){var c=this.state.meta.counters;c[prefix]=(c[prefix]||0)+1;return prefix+"-"+String(c[prefix]).padStart(pad||4,"0");};

/* session (role + persona) */
W.session={role:null,user:null,wh:"all"};
W.loadSession=function(){try{var s=JSON.parse(sessionStorage.getItem(SKEY)||localStorage.getItem(SKEY)||"null");if(s)W.session=s;}catch(e){}};
W.saveSession=function(){try{var j=JSON.stringify(W.session);sessionStorage.setItem(SKEY,j);localStorage.setItem(SKEY,j);}catch(e){}};
})();
