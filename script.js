/* ============================================================
   NFAuth · North Fairview Authentication
   ============================================================ */

/* ---------- staff accounts (private) ---------- */
const STAFF = [
  { role:'admin',   user:'nfadmin',   pass:'NFAuth@2025!Adm',  name:'Administrator' },
  { role:'faculty', user:'nffaculty', pass:'NFAuth@2025!Fac',  name:'Faculty' }
];

const KS='nf_students', KM='nf_me', TH='nf_theme', WIN=90000;
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;

const load=()=>{try{return JSON.parse(localStorage.getItem(KS))||[]}catch{return[]}};
const save=a=>{try{localStorage.setItem(KS,JSON.stringify(a));return true}catch{return false}};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let me=null, viewId=null, F='all', searchQ='';
try{me=JSON.parse(sessionStorage.getItem(KM))}catch{}
try{const t=localStorage.getItem(TH);if(t)document.documentElement.dataset.theme=t}catch{}
const setMe=v=>{me=v;try{v?sessionStorage.setItem(KM,JSON.stringify(v)):sessionStorage.removeItem(KM)}catch{}};

const sha=async s=>{
  if(!(window.crypto&&crypto.subtle))return btoa(unescape(encodeURIComponent(s)));
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
};

function theme(){
  const d=document.documentElement;
  const dark=d.dataset.theme?d.dataset.theme=='dark':matchMedia('(prefers-color-scheme:dark)').matches;
  d.dataset.theme=dark?'light':'dark';
  try{localStorage.setItem(TH,d.dataset.theme)}catch{}
}

const isOn=u=>!!u.start&&Date.now()-u.seen<WIN;
const isBanned=u=>!!u.bannedUntil&&u.bannedUntil>Date.now();
const onMs=u=>u.on+(u.start?Math.max(0,(isOn(u)?Date.now():u.seen)-u.start):0);
const offMs=u=>Math.max(0,Date.now()-u.created-onMs(u));
const fmt=ms=>{const m=Math.floor(Math.max(0,ms)/60000);return Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m'};
const ini=n=>n.trim().split(/\s+/).map((w,i,a)=>i==0||i==a.length-1?w[0]:'').join('').toUpperCase();
const hue=s=>Math.abs([...s].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7))%360;
const av=n=>`<i class="av" style="--h:${hue(n)}">${esc(ini(n))}</i>`;
const shake=x=>{x.classList.remove('sk');void x.offsetWidth;x.classList.add('sk')};

function badge(u){
  if(isBanned(u))return `<span class="st banned"><i class="dot"></i>Banned</span>`;
  return `<span class="st ${isOn(u)?'on':''}"><i class="dot"></i>${isOn(u)?'Online':'Offline'}</span>`;
}
function toast(msg,bad){
  const t=document.createElement('div');t.className='toast'+(bad?' bad':'');t.textContent=msg;
  $('t').append(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300)},3000);
}
function count(el,n){
  el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');
  const f=+el.textContent||0,t0=performance.now();
  if(RM){el.textContent=n;return}
  (function s(t){const p=Math.min(1,(t-t0)/700);
    el.textContent=Math.round(f+(n-f)*(1-(1-p)**3));if(p<1)requestAnimationFrame(s)})(t0);
}

/* ---------- registration rules ---------- */
const EMAIL=/^[A-Za-z0-9]+(\.[A-Za-z0-9]+)*@[A-Za-z0-9]+(\.[A-Za-z0-9]+)+$/;
const FIELDS=[
  {k:'name',l:'Full name',a:'name',ok:v=>v.trim().length>0,m:'Enter your full name.'},
  {k:'lrn',l:'LRN',a:'off',inp:'numeric',d:1,max:12,h:'12 digits',ok:v=>/^\d{12}$/.test(v),m:'LRN must be exactly 12 digits.'},
  {k:'email',l:'Email',a:'email',inp:'email',h:'Letters, numbers, @ and dots only',ok:v=>EMAIL.test(v),m:'Use only letters, numbers, one @ and dots. No symbols like # $ _ ( ).'},
  {k:'phone',l:'Mobile number',a:'tel',inp:'numeric',d:1,max:11,h:'11 digits',ok:v=>/^\d{11}$/.test(v),m:'Mobile number must be exactly 11 digits.'},
  {k:'section',l:'Section',a:'off',ok:v=>v.trim().length>0,m:'Enter your section.'},
  {k:'strand',l:'Strand',a:'off',ok:v=>v.trim().length>0,m:'Enter your strand.'},
  {k:'pw',l:'Password',t:'password',a:'new-password',ok:v=>v.length>0,m:'Enter a password.'}
];

function fld(f){
  const attrs=`${f.inp?` inputmode="${f.inp}"`:''}${f.max?` maxlength="${f.max}"`:''}`;
  return `<label for="r_${f.k}">${f.l}</label>
  <div class="fx${f.t?' pw':''}">
    <input id="r_${f.k}" name="${f.k}" type="${f.t||'text'}" autocomplete="${f.a}"${attrs}
      oninput="onFieldInput(this)" onblur="chk(this,1)">
    ${f.max?`<span class="ct">0/${f.max}</span>`:''}
    ${f.t?`<button type="button" class="eye" onclick="eye('r_${f.k}',this)">Show</button>`:''}
    <small class="msg">${f.h||''}</small>
  </div>`;
}

function regForm(){
  return `<form onsubmit="register(event)" novalidate>
    <div class="pgw"><div class="pg" id="pg"></div></div>
    <small class="mut" id="pgt">0 of ${FIELDS.length} done</small>
    ${FIELDS.map(fld).join('')}
    <small class="msg err" id="r_err" role="alert"></small>
    <button class="btn">Create account</button></form>`;
}
function signForm(){
  return `<form onsubmit="signIn(event)" novalidate>
    <label for="l_id">Email / LRN / username</label>
    <div class="fx"><input id="l_id" autocomplete="username" autocapitalize="none"></div>
    <label for="l_pw">Password</label>
    <div class="fx pw"><input id="l_pw" type="password" autocomplete="current-password">
      <button type="button" class="eye" onclick="eye('l_pw',this)">Show</button></div>
    <small class="msg err" id="l_err" role="alert"></small>
    <button class="btn">Sign in</button></form>`;
}
function eye(id,b){const i=$(id),h=i.type=='password';i.type=h?'text':'password';b.textContent=h?'Hide':'Show'}

function onFieldInput(el){
  const f=FIELDS.find(x=>x.k==el.name);if(!f)return;
  if(f.d)el.value=el.value.replace(/\D/g,'');
  chk(el,false);
}
function chk(el,show){
  const f=FIELDS.find(x=>x.k==el.name);if(!f)return;
  const ok=f.ok(el.value),fx=el.closest('.fx');
  if(show)el.dataset.t=1;
  const bad=!ok&&!!el.dataset.t;
  fx.classList.toggle('ok',ok);fx.classList.toggle('bad',bad);
  el.setAttribute('aria-invalid',bad);
  fx.querySelector('.msg').textContent=bad?f.m:(f.h||'');
  const c=fx.querySelector('.ct');if(c)c.textContent=el.value.length+'/'+f.max;
  const n=FIELDS.filter(g=>g.ok($('r_'+g.k).value)).length;
  $('pg').style.width=(n/FIELDS.length*100)+'%';
  $('pgt').textContent=n+' of '+FIELDS.length+' done';
}

/* ---------- auth screen ---------- */
function renderAuth(){
  $('app').innerHTML=`<div class="auth">
    <section class="hero">
      <button class="ib th" onclick="theme()" aria-label="Switch theme">&#9680;</button>
      <span class="d"></span><span class="d"></span><span class="d"></span>
      <svg class="cap" viewBox="0 0 120 70" aria-hidden="true">
        <path pathLength="1" d="M60 8 114 30 60 52 6 30Z"/>
        <path pathLength="1" d="M28 42v16c0 9 64 9 64 0V42"/>
        <path pathLength="1" d="M108 33v22"/>
      </svg>
      <h1><span>NFAuth</span><span>North Fairview</span></h1>
      <p>Register once, sign in, and watch the room fill up live.</p>
      <svg class="pulse" viewBox="0 0 300 50" aria-hidden="true">
        <path class="b" d="M0 25H92L106 6 126 44 140 25H300"/>
        <path class="r" pathLength="100" d="M0 25H92L106 6 126 44 140 25H300"/>
      </svg>
    </section>
    <section class="panel">
      <div class="tabs" id="tabs" data-t="in">
        <i class="ind"></i>
        <button onclick="auth('in')">Sign in</button>
        <button onclick="auth('up')">Register</button>
      </div>
      <div id="af"></div>
    </section>
  </div>`;
  auth('in');
}
function auth(t,note){
  $('tabs').dataset.t=t;
  $('af').innerHTML=`<div class="fm">${note?`<p class="ok" role="status">${esc(note)}</p>`:''}${t=='in'?signForm():regForm()}</div>`;
}

/* ---------- register / sign in ---------- */
async function register(e){
  e.preventDefault();
  const err=$('r_err');err.textContent='';
  const data={};
  for(const f of FIELDS){
    const el=$('r_'+f.k);const v=el.value.trim();
    if(!f.ok(v)){
      el.dataset.t=1;chk(el,true);shake(el.closest('.fx'));
      err.textContent='Please fix the highlighted fields.';
      el.focus();return;
    }
    data[f.k]=v;
  }
  const list=load();
  if(list.some(s=>s.email.toLowerCase()===data.email.toLowerCase())){
    err.textContent='That email is already registered.';return;
  }
  if(list.some(s=>s.lrn===data.lrn)){
    err.textContent='That LRN is already registered.';return;
  }
  const u={
    id:'s_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    name:data.name,lrn:data.lrn,email:data.email,phone:data.phone,
    section:data.section,strand:data.strand,
    pw:await sha(data.pw),
    created:Date.now(),on:0,start:null,seen:0,
    banned:false,bannedUntil:0,messages:[]
  };
  list.push(u);
  if(!save(list)){err.textContent='Storage failed. Try again.';return;}
  auth('in','Account created! You can sign in now.');
}

async function signIn(e){
  e.preventDefault();
  const err=$('l_err');err.textContent='';
  const id=$('l_id').value.trim(), pw=$('l_pw').value;
  if(!id||!pw){err.textContent='Enter your credentials.';return;}
  const st=STAFF.find(s=>s.user===id&&s.pass===pw);
  if(st){
    setMe({role:st.role,name:st.name,id:'staff_'+st.role});
    renderDash();return;
  }
  const list=load();
  const hash=await sha(pw);
  const u=list.find(s=>s.email.toLowerCase()===id.toLowerCase()||s.lrn===id);
  if(!u||u.pw!==hash){err.textContent='Invalid credentials.';return;}
  if(isBanned(u)){
    const mins=Math.ceil((u.bannedUntil-Date.now())/60000);
    err.textContent=`You are banned for ${mins} more minute(s).`;return;
  }
  u.start=Date.now();u.seen=Date.now();
  save(list);
  setMe({role:'student',id:u.id,name:u.name});
  renderDash();
}

function signOut(){
  if(me&&me.role==='student'){
    const list=load();const u=list.find(s=>s.id===me.id);
    if(u&&u.start){u.on+=(Date.now()-u.start);u.start=null;}
    save(list);
  }
  setMe(null);renderAuth();
}

/* ---------- heartbeat ---------- */
setInterval(()=>{
  if(!me||me.role!=='student')return;
  const list=load();const u=list.find(s=>s.id===me.id);
  if(u&&u.start){u.seen=Date.now();save(list);}
},15000);

/* ============================================================
   DASHBOARDS
   ============================================================ */
function renderDash(){
  if(!me)return renderAuth();
  if(me.role==='student')return renderStudent();
  return renderStaff();
}

/* ---------- student dashboard ---------- */
function renderStudent(){
  const u=load().find(s=>s.id===me.id);
  if(!u){signOut();return;}
  const on=onMs(u), total=Date.now()-u.created, pct=Math.min(100,Math.round(on/total*100));
  const C=2*Math.PI*52;
  const myMsgs=(u.messages||[]).slice().reverse();
  $('app').innerHTML=`
    <div class="top">
      <span class="role-badge">STUDENT</span>
      <div class="gap"></div>
      <button class="ib" onclick="theme()">&#9680;</button>
      <div class="chip">${av(u.name)}<div><b>${esc(u.name)}</b><small>${esc(u.strand)} · ${esc(u.section)}</small></div></div>
      <button class="ib" onclick="signOut()">Sign out</button>
    </div>
    <div class="wrap">
      ${myMsgs.length?`<div class="notice"><b>Message from admin</b>${esc(myMsgs[0].text)}</div>`:''}
      <h2 class="hi">Hello, ${esc(u.name.split(' ')[0])}</h2>
      <p class="mut hi">Here's your live attendance snapshot.</p>
      <div class="stats" style="margin-top:18px">
        <div class="gauge">
          <svg viewBox="0 0 120 120"><circle class="g0" cx="60" cy="60" r="52"/>
          <circle class="g1" cx="60" cy="60" r="52" stroke-dasharray="${C}"
            stroke-dashoffset="${C-pct/100*C}"/></svg>
          <div><b id="pct">${pct}</b><small>% online</small></div>
        </div>
        <div>
          <p><strong>${fmt(on)}</strong><br><span class="mut">total online</span></p>
          <p style="margin-top:8px">${badge(u)}</p>
        </div>
      </div>
      <div class="section-title">Your ID</div>
      <div class="idc" id="me">
        <div class="idh">${av(u.name)}<div><b>${esc(u.name)}</b><small>Student · ${esc(u.strand)}</small></div></div>
        <dl>
          <dt>LRN</dt><dd>${esc(u.lrn)}</dd>
          <dt>Email</dt><dd>${esc(u.email)}</dd>
          <dt>Mobile</dt><dd>${esc(u.phone)}</dd>
          <dt>Section</dt><dd>${esc(u.section)}</dd>
          <dt>Strand</dt><dd>${esc(u.strand)}</dd>
        </dl>
      </div>
    </div>`;
}

/* ---------- staff dashboard ---------- */
function renderStaff(){
  const isAdmin=me.role==='admin';
  const all=load();
  const online=all.filter(isOn).length;
  const banned=all.filter(isBanned).length;
  const sorted=all.slice().sort((a,b)=>(isOn(b)-isOn(a))||a.name.localeCompare(b.name));
  const visible=sorted.filter(u=>{
    if(F==='on'&&!isOn(u))return false;
    if(F==='off'&&isOn(u))return false;
    if(F==='banned'&&!isBanned(u))return false;
    if(searchQ){
      const q=searchQ.toLowerCase();
      return u.name.toLowerCase().includes(q)||u.lrn.includes(q)||
             u.email.toLowerCase().includes(q)||u.section.toLowerCase().includes(q);
    }
    return true;
  });
  $('app').innerHTML=`
    <div class="top">
      <span class="role-badge">${me.role.toUpperCase()}</span>
      <div class="gap"></div>
      <button class="ib" onclick="theme()">&#9680;</button>
      <div class="chip">${av(me.name)}<div><b>${esc(me.name)}</b><small>${esc(me.role)}</small></div></div>
      <button class="ib" onclick="signOut()">Sign out</button>
    </div>
    <div class="wrap">
      <h2 class="hi">Student Monitor</h2>
      <p class="mut hi">${online} online · ${all.length-online-banned} offline · ${banned} banned</p>
      <div class="tools">
        <div class="search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="q" placeholder="Search name, LRN, email, section…"
            value="${esc(searchQ)}" oninput="onSearch(this.value)">
        </div>
        <div class="chips" id="chips">
          <button data-f="all" class="${F==='all'?'on':''}" onclick="setFilter('all')">All<span>${all.length}</span></button>
          <button data-f="on" class="${F==='on'?'on':''}" onclick="setFilter('on')">Online<span>${online}</span></button>
          <button data-f="off" class="${F==='off'?'on':''}" onclick="setFilter('off')">Offline<span>${all.length-online-banned}</span></button>
          <button data-f="banned" class="${F==='banned'?'on':''}" onclick="setFilter('banned')">Banned<span>${banned}</span></button>
        </div>
      </div>
      ${visible.length?`<ul class="list in" id="rows">${visible.map((u,i)=>rowHtml(u,i,isAdmin)).join('')}</ul>`
        :`<div class="empty">No students match.</div>`}
    </div>`;
}

function rowHtml(u,i,isAdmin){
  const on=isOn(u), bd=isBanned(u);
  const pct=Math.min(100,Math.round(onMs(u)/(Date.now()-u.created)*100))||0;
  return `<li class="row ${on?'on':''} ${bd?'banned':''}" style="--i:${i}">
    ${av(u.name)}
    <button class="nm" onclick="openView('${u.id}')">${esc(u.name)}</button>
    <div style="display:flex;gap:6px;align-items:center;justify-content:flex-end;flex-wrap:wrap">
      ${badge(u)}
      ${isAdmin?`<div class="row-actions">
        <button onclick="openEdit('${u.id}')">Edit</button>
        <button onclick="openMsg('${u.id}')">Msg</button>
        ${bd?`<button onclick="unban('${u.id}')">Unban</button>`
            :`<button class="danger" onclick="openBan('${u.id}')">Ban</button>`}
        <button class="danger" onclick="removeStudent('${u.id}')">Delete</button>
      </div>`:''}
    </div>
    <small><span>${esc(u.strand)}</span><span>${esc(u.section)}</span><span>${esc(u.lrn)}</span></small>
    <div class="bar"><b class="${bd?'banned':''}" style="--w:${pct}%"></b></div>
    <div class="tm">Online: ${fmt(onMs(u))} · Offline: ${fmt(offMs(u))}</div>
  </li>`;
}

function onSearch(v){searchQ=v;renderStaff();
  const q=$('q');if(q){q.focus();q.setSelectionRange(v.length,v.length);}}
function setFilter(f){F=f;renderStaff();}

/* ============================================================
   MODAL
   ============================================================ */
function openModal(html){
  const m=$('m');m.hidden=false;m.classList.remove('out');
  m.innerHTML=`<div class="sheet" onclick="event.stopPropagation()">${html}</div>`;
}
function closeView(){
  const m=$('m');m.classList.add('out');
  setTimeout(()=>{m.hidden=true;m.innerHTML='';m.classList.remove('out')},200);
  viewId=null;
}
$('m').addEventListener('click',e=>{if(e.target===$('m'))closeView();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeView();});

function openView(id){
  const u=load().find(s=>s.id===id);if(!u)return;viewId=id;
  const on=onMs(u), off=offMs(u), bd=isBanned(u);
  const msgs=(u.messages||[]).slice().reverse();
  openModal(`
    <div class="bn"><b>Student record</b><button class="ib" onclick="closeView()">Close</button></div>
    ${msgs.length?`<div class="notice"><b>Admin messages</b>${msgs.map(m=>`<div style="margin-top:6px">• ${esc(m.text)} <small class="mut">(${new Date(m.at).toLocaleString()})</small></div>`).join('')}</div>`:''}
    <div class="idc">
      <div class="idh">${av(u.name)}<div><b>${esc(u.name)}</b><small>Student · ${esc(u.strand)}</small></div></div>
      <dl>
        <dt>LRN</dt><dd>${esc(u.lrn)}</dd>
        <dt>Email</dt><dd>${esc(u.email)}</dd>
        <dt>Mobile</dt><dd>${esc(u.phone)}</dd>
        <dt>Section</dt><dd>${esc(u.section)}</dd>
        <dt>Strand</dt><dd>${esc(u.strand)}</dd>
        <dt>Registered</dt><dd>${new Date(u.created).toLocaleString()}</dd>
      </dl>
    </div>
    <div class="dyn">
      <p>${badge(u)}${bd?` <small class="mut">until ${new Date(u.bannedUntil).toLocaleString()}</small>`:''}</p>
      <div class="tiles">
        <div><small>Online</small><b>${fmt(on)}</b></div>
        <div><small>Offline</small><b>${fmt(off)}</b></div>
        <div><small>Total</small><b>${fmt(on+off)}</b></div>
      </div>
    </div>
    ${me.role==='admin'?`
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="openEdit('${u.id}')">Edit info</button>
      <button class="btn btn-outline btn-sm" onclick="openMsg('${u.id}')">Send message</button>
      ${bd?`<button class="btn btn-sm" onclick="unban('${u.id}')">Unban</button>`
          :`<button class="btn btn-danger btn-sm" onclick="openBan('${u.id}')">Ban</button>`}
      <button class="btn btn-danger btn-sm" onclick="removeStudent('${u.id}')">Delete account</button>
    </div>`:''}
  `);
}

function openEdit(id){
  const u=load().find(s=>s.id===id);if(!u)return;viewId=id;
  openModal(`
    <div class="bn"><b>Edit student</b><button class="ib" onclick="closeView()">Close</button></div>
    <form onsubmit="saveEdit(event,'${id}')">
      <div class="field-row"><label>Full name</label><input name="name" value="${esc(u.name)}" required></div>
      <div class="field-row"><label>LRN</label><input name="lrn" value="${esc(u.lrn)}" maxlength="12" inputmode="numeric" required></div>
      <div class="field-row"><label>Email</label><input name="email" type="email" value="${esc(u.email)}" required></div>
      <div class="field-row"><label>Mobile</label><input name="phone" value="${esc(u.phone)}" maxlength="11" inputmode="numeric" required></div>
      <div class="field-row"><label>Section</label><input name="section" value="${esc(u.section)}" required></div>
      <div class="field-row"><label>Strand</label><input name="strand" value="${esc(u.strand)}" required></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeView()">Cancel</button>
        <button class="btn btn-sm">Save changes</button>
      </div>
    </form>`);
}
function saveEdit(e,id){
  e.preventDefault();
  const fd=new FormData(e.target);
  const list=load();const u=list.find(s=>s.id===id);if(!u)return;
  const email=fd.get('email').trim(), lrn=fd.get('lrn').trim(), phone=fd.get('phone').trim();
  if(!EMAIL.test(email)){toast('Invalid email format.',true);return;}
  if(!/^\d{12}$/.test(lrn)){toast('LRN must be 12 digits.',true);return;}
  if(!/^\d{11}$/.test(phone)){toast('Mobile must be 11 digits.',true);return;}
  if(list.some(s=>s.id!==id&&s.email.toLowerCase()===email.toLowerCase())){toast('Email already used.',true);return;}
  if(list.some(s=>s.id!==id&&s.lrn===lrn)){toast('LRN already used.',true);return;}
  u.name=fd.get('name').trim();u.email=email;u.lrn=lrn;u.phone=phone;
  u.section=fd.get('section').trim();u.strand=fd.get('strand').trim();
  save(list);toast('Student updated.');closeView();renderStaff();
}

function openBan(id){
  const u=load().find(s=>s.id===id);if(!u)return;viewId=id;
  openModal(`
    <div class="bn"><b>Ban ${esc(u.name)}</b><button class="ib" onclick="closeView()">Close</button></div>
    <form onsubmit="doBan(event,'${id}')">
      <div class="field-row"><label>Duration</label>
        <select name="dur">
          <option value="60">1 hour</option>
          <option value="180">3 hours</option>
          <option value="360">6 hours</option>
          <option value="720">12 hours</option>
          <option value="1440">1 day</option>
          <option value="4320">3 days</option>
          <option value="10080">7 days</option>
          <option value="0">Permanent</option>
        </select>
      </div>
      <div class="field-row"><label>Reason (optional)</label><input name="reason" placeholder="e.g. Disruptive behavior"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeView()">Cancel</button>
        <button class="btn btn-danger btn-sm">Ban student</button>
      </div>
    </form>`);
}
function doBan(e,id){
  e.preventDefault();
  const fd=new FormData(e.target);
  const mins=parseInt(fd.get('dur'),10);
  const reason=fd.get('reason').trim();
  const list=load();const u=list.find(s=>s.id===id);if(!u)return;
  u.banned=true;
  u.bannedUntil=mins>0?Date.now()+mins*60000:Date.now()+100*365*24*60*60000;
  if(reason)u.messages=[...(u.messages||[]),{text:'Banned: '+reason,at:Date.now()}];
  save(list);toast('Student banned.');closeView();renderStaff();
}
function unban(id){
  const list=load();const u=list.find(s=>s.id===id);if(!u)return;
  u.banned=false;u.bannedUntil=0;save(list);toast('Student unbanned.');closeView();renderStaff();
}

function openMsg(id){
  const u=load().find(s=>s.id===id);if(!u)return;viewId=id;
  openModal(`
    <div class="bn"><b>Message ${esc(u.name)}</b><button class="ib" onclick="closeView()">Close</button></div>
    <form onsubmit="sendMsg(event,'${id}')">
      <div class="field-row"><label>Message</label>
        <textarea name="text" rows="4" required></textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeView()">Cancel</button>
        <button class="btn btn-sm">Send</button>
      </div>
    </form>`);
}
function sendMsg(e,id){
  e.preventDefault();
  const fd=new FormData(e.target);const text=fd.get('text').trim();if(!text)return;
  const list=load();const u=list.find(s=>s.id===id);if(!u)return;
  u.messages=[...(u.messages||[]),{text,at:Date.now()}];
  save(list);toast('Message sent.');closeView();renderStaff();
}

function removeStudent(id){
  const u=load().find(s=>s.id===id);if(!u)return;
  if(!confirm(`Delete ${u.name}'s account permanently?`))return;
  save(load().filter(s=>s.id!==id));toast('Account deleted.');closeView();renderStaff();
}

/* ============================================================
   INTRO SPLASH + BOOT
   ============================================================ */
(function boot(){
  const intro=$('intro');
  const reduce=RM;
  const dur=reduce?200:3000;
  setTimeout(()=>{
    intro.classList.add('done');
    setTimeout(()=>{intro.remove();},900);
  },dur);
  renderDash();
})();