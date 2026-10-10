'use client';
import {useEffect,useState,useCallback,useRef} from 'react';
import './admin.css';

const PAY_NUM='03330866555';
const REASONS=['Fake screenshot','Wrong amount','Unreadable','Wrong account','Edited receipt','Duplicate payment'];
const TABS=[['pending','NEEDS REVIEW'],['approved','APPROVED'],['rejected','REJECTED'],['unverified','UNVERIFIED'],['','ALL']];
const SMAP={pending:'payment_pending_review',approved:'approved',rejected:'rejected'};
const post=(u,b)=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
const call=(u,b)=>post(u,b).then(async r=>({ok:r.ok,st:r.status,j:await r.json().catch(()=>({}))})).catch(()=>({ok:false,st:0,j:{}}));
const ago=t=>{const s=(Date.now()-new Date(t))/1e3;if(s<60)return 'just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';return Math.floor(s/86400)+'d ago'};
const reduced=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

let actx;
function beep(kind){try{actx??=new (window.AudioContext||window.webkitAudioContext)();const t=actx.currentTime;
 const tone=(f,s,d,type='sine',v=.12)=>{const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f,t+s);g.gain.setValueAtTime(0,t+s);g.gain.linearRampToValueAtTime(v,t+s+.01);g.gain.exponentialRampToValueAtTime(.0001,t+s+d);o.connect(g).connect(actx.destination);o.start(t+s);o.stop(t+s+d+.02)};
 if(kind==='approved'){tone(660,0,.16);tone(880,.08,.16);tone(1320,.17,.4)}
 else if(kind==='rejected'){tone(170,0,.3,'sawtooth',.13);tone(85,.04,.45,'square',.09)}
 else tone(520,0,.08,'triangle',.06)}catch{}}

function useCount(v){const [n,setN]=useState(0);const from=useRef(0);
 useEffect(()=>{const a=from.current,t0=performance.now();let raf;
  const step=t=>{const k=Math.min(1,(t-t0)/700),e=1-Math.pow(1-k,3);setN(Math.round(a+(v-a)*e));if(k<1)raf=requestAnimationFrame(step);else from.current=v};
  raf=requestAnimationFrame(step);return()=>cancelAnimationFrame(raf)},[v]);return n}
function Num({v}){return useCount(v)}

function FxCanvas({fxRef}){const cv=useRef();
 useEffect(()=>{const c=cv.current,x=c.getContext('2d');let P=[],raf=0;
  const fit=()=>{c.width=innerWidth;c.height=innerHeight};fit();addEventListener('resize',fit);
  const tick=()=>{x.clearRect(0,0,c.width,c.height);P=P.filter(p=>p.l>0);
   for(const p of P){p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.l--;x.save();x.globalAlpha=Math.min(1,p.l/25);x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()}
   raf=P.length?requestAnimationFrame(tick):0};
  fxRef.current=(px,py,kind)=>{const ok=kind==='approved';
   const cols=ok?['#00ff9c','#22d3ee','#8b5cf6','#ffffff','#b6ffe0']:['#ff5470','#ff2d55','#ff9aa8','#7a0f26','#ffffff'];
   for(let i=0;i<(ok?150:80);i++){const a=ok?(-Math.PI/2+(Math.random()-.5)*2.6):Math.random()*Math.PI*2,s=(ok?6:4)+Math.random()*(ok?11:9);
    P.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:ok?.28:.1,r:Math.random()*6,vr:(Math.random()-.5)*.4,w:4+Math.random()*7,h:ok?3+Math.random()*6:2+Math.random()*12,c:cols[i%cols.length],l:60+Math.random()*50})}
   if(!raf)raf=requestAnimationFrame(tick)};
  return()=>{cancelAnimationFrame(raf);removeEventListener('resize',fit)}},[fxRef]);
 return <canvas ref={cv} className="ad-fx"/>}

function Badge({r}){return !r.verified_at?<span className="ad-b unv">UNVERIFIED</span>:<span className={'ad-b '+r.payment_status}>{r.payment_status==='pending'?'PENDING':r.payment_status.toUpperCase()}</span>}

export default function Admin(){
 const [ok,setOk]=useState(null),[rows,setRows]=useState([]),[s,setS]=useState(null),[tab,setTab]=useState('pending'),[q,setQ]=useState(''),[sortSel,setSortSel]=useState(''),[err,setErr]=useState('');
 const [deck,setDeck]=useState(null),[pos,setPos]=useState(0),[end,setEnd]=useState(false),[notes,setNotes]=useState(''),[zoom,setZoom]=useState(false),[chk,setChk]=useState({}),[img,setImg]=useState('load');
 const [exit,setExit]=useState(null),[fxKey,setFxKey]=useState(0),[busy,setBusy]=useState(false),[sess,setSess]=useState({a:0,r:0}),[sound,setSound]=useState(true),[toasts,setToasts]=useState([]),[flash,setFlash]=useState({}),[sync,setSync]=useState(Date.now()),[,tick]=useState(0);
 const fx=useRef(),inflight=useRef(0),kb=useRef();
 const rowsRef=useRef(rows),deckRef=useRef(deck),posRef=useRef(pos),soundRef=useRef(sound);rowsRef.current=rows;deckRef.current=deck;posRef.current=pos;soundRef.current=sound;
 const sort=sortSel||(tab==='pending'?'old':'new');
 const qs=`q=${encodeURIComponent(q)}&f=${tab}&sort=${sort}`;
 const cur=deck&&!end?rows.find(r=>r.id===deck[pos]):null;

 const load=useCallback(async()=>{try{const r=await fetch('/api/admin/list?'+qs);if(r.status===401){setOk(false);return}if(!r.ok)return;const j=await r.json();setOk(true);setRows(j.rows);setS(j.stats);setSync(Date.now())}catch{}},[qs]);
 useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[load]);
 useEffect(()=>{const t=setInterval(()=>{if(document.visibilityState==='visible'&&!deckRef.current&&!inflight.current)load();tick(n=>n+1)},15000);return()=>clearInterval(t)},[load]);
 useEffect(()=>{document.body.style.overflow=deck?'hidden':'';return()=>{document.body.style.overflow=''}},[deck]);
 useEffect(()=>{setNotes(cur?.admin_notes||'');setZoom(false);setChk({});setImg('load')},[cur?.id]);
 useEffect(()=>{if(!deck)return;for(const id of deck.slice(pos+1,pos+3)){const x=rowsRef.current.find(r=>r.id===id);if(x?.verified_at)new Image().src='/api/admin/shot?id='+id}},[deck,pos]);
 useEffect(()=>{if(end&&sess.a>0&&!reduced())setTimeout(()=>fx.current?.(innerWidth/2,innerHeight/2,'approved'),400)},[end]);// eslint-disable-line

 const dismiss=id=>setToasts(t=>t.filter(x=>x.id!==id));
 const toast=(msg,o={})=>{const id=Math.random().toString(36).slice(2);setToasts(t=>[...t.slice(-3),{id,msg,...o}]);setTimeout(()=>dismiss(id),o.undo?7000:3500)};
 const copy=v=>{navigator.clipboard?.writeText(v);toast('Copied '+v)};

 const applyLocal=(r,status,nt)=>{
  setRows(rs=>rs.map(x=>x.id===r.id?{...x,payment_status:status,status:SMAP[status],admin_notes:nt}:x));
  setS(st=>{if(!st||r.payment_status===status)return st;const n={...st};n[r.payment_status]--;n[status]++;n.active+=Number(status!=='rejected')-Number(r.payment_status!=='rejected');return n})};
 const finish=()=>{if(!inflight.current&&!deckRef.current)load()};

 async function login(e){e.preventDefault();setErr('');const b=Object.fromEntries(new FormData(e.target));const r=await call('/api/admin/login',b);if(r.ok)load();else setErr(r.j.error||'Login failed')}
 function openReview(ids,i){setDeck(ids);setPos(i);setEnd(false);setExit(null);setBusy(false);setSess({a:0,r:0})}
 function closeReview(){setDeck(null);setEnd(false);setExit(null);setBusy(false);setTimeout(finish,50)}
 async function startReview(){const r=await fetch('/api/admin/list?f=pending&sort=old');if(!r.ok)return;const j=await r.json();
  if(!j.rows.length){toast('Nothing waiting for review 🎉');return}setTab('pending');setQ('');setRows(j.rows);setS(j.stats);openReview(j.rows.map(x=>x.id),0)}
 const nav=d=>{if(!deck||busy)return;setPos(p=>Math.max(0,Math.min(deck.length-1,p+d)));if(soundRef.current)beep('tick')};
 const advance=()=>{const d=deckRef.current;if(!d)return;const R=rowsRef.current;
  const isP=id=>{const x=R.find(r=>r.id===id);return x&&x.verified_at&&x.payment_status==='pending'};
  for(let k=1;k<=d.length;k++){const i=(posRef.current+k)%d.length;if(isP(d[i])){setPos(i);return}}
  setEnd(true)};

 async function decide(status){
  const r=cur;if(!r||busy||exit)return;
  if(!r.verified_at){toast('This person has not verified their email yet',{kind:'error'});return}
  if(r.payment_status===status){toast('Already '+status);return}
  const wasPending=r.payment_status==='pending',prev={ps:r.payment_status,notes:r.admin_notes||''};
  setBusy(true);setExit(status);setFxKey(k=>k+1);
  if(soundRef.current)beep(status);
  const b=document.querySelector('.ad-shotw')?.getBoundingClientRect();
  if(status!=='pending'&&b&&!reduced())fx.current?.(b.left+b.width/2,b.top+b.height/2,status);
  setFlash(f=>({...f,[r.id]:status}));setTimeout(()=>setFlash(f=>{const n={...f};delete n[r.id];return n}),1500);
  applyLocal(r,status,notes);
  if(status==='approved')setSess(x=>({...x,a:x.a+1}));if(status==='rejected')setSess(x=>({...x,r:x.r+1}));
  inflight.current++;
  const req=call('/api/admin/update',{id:r.id,payment_status:status,notes});
  setTimeout(()=>{setExit(null);setBusy(false);if(wasPending)advance()},status==='pending'?250:600);
  const res=await req;inflight.current--;
  if(!res.ok){
   applyLocal({...r,payment_status:status},prev.ps,prev.notes);
   if(status==='approved')setSess(x=>({...x,a:x.a-1}));if(status==='rejected')setSess(x=>({...x,r:x.r-1}));
   const i=deckRef.current?.indexOf(r.id);if(i>=0){setEnd(false);setPos(i)}
   if(res.st===401){setOk(false);toast('Session expired — log in again',{kind:'error'})}else toast(res.j.error||'Could not save — change reverted',{kind:'error'});
   finish();return}
  if(status!=='pending')toast((status==='approved'?'✓ Approved ':'✕ Rejected ')+r.full_name,{kind:status,undo:()=>undoIt(r,prev,status)});
  finish()}

 async function undoIt(r,prev,status){
  inflight.current++;const res=await call('/api/admin/update',{id:r.id,payment_status:prev.ps,notes:prev.notes});inflight.current--;
  if(!res.ok){toast(res.j.error||'Could not undo',{kind:'error'});finish();return}
  const now=rowsRef.current.find(x=>x.id===r.id)||r;applyLocal(now,prev.ps,prev.notes);
  if(status==='approved')setSess(x=>({...x,a:x.a-1}));if(status==='rejected')setSess(x=>({...x,r:x.r-1}));
  if(deckRef.current){const i=deckRef.current.indexOf(r.id);if(i>=0){setEnd(false);setPos(i)}}
  toast('↺ Restored '+r.full_name);finish()}

 kb.current=e=>{if(!deck||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)){if(e.key==='Escape')t.blur();return}
  const k=e.key.toLowerCase();
  if(k==='escape')closeReview();else if(end)return;
  else if(k==='a')decide('approved');else if(k==='r')decide('rejected');else if(k==='u')decide('pending');
  else if(k==='arrowright'||k==='k')nav(1);else if(k==='arrowleft'||k==='j')nav(-1);else if(k==='z')setZoom(z=>!z)};
 useEffect(()=>{const h=e=>kb.current(e);addEventListener('keydown',h);return()=>removeEventListener('keydown',h)},[]);

 const slotUsed=useCount(s?.active||0),cP=useCount(s?.pending||0),cA=useCount(s?.approved||0),cR=useCount(s?.rejected||0),cU=useCount(s?.unverified||0);
 const toggleReason=x=>setNotes(n=>n.includes(x)?n.replace(x+'. ','').replace(x+'.','').replace(x,'').trim():(n?n.trimEnd()+' ':'')+x+'. ');

 if(ok===null)return <main><section>Loading…</section></main>;
 if(!ok)return <main><section style={{maxWidth:420}}><h2>ADMIN ACCESS</h2><form key={err} className={'card ad-login'+(err?' bad':'')} onSubmit={login}><input name="username" placeholder="Username" required/><input name="password" type="password" placeholder="Password" required/><button className="btn">LOGIN →</button>{err&&<p className="err">{err}</p>}</form></section></main>;

 const secs=Math.round((Date.now()-sync)/1000);
 const full=s&&s.active>=s.max,hot=s&&s.active/s.max>=.9;
 const remaining=deck?deck.filter(id=>{const x=rows.find(r=>r.id===id);return x&&x.verified_at&&x.payment_status==='pending'}).length:0;

 return <main><section style={{maxWidth:1300}}>
  <div className="ad-top"><h2>HFTD // CONTROL</h2>
   <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}><span className="ad-live"><i className="ad-dot"/>LIVE · synced {secs<5?'now':secs+'s ago'}</span>
    <button className="ad-btn" onClick={load}>↻ REFRESH</button>
    <button className="ad-btn" onClick={async()=>{await fetch('/api/admin/logout',{method:'POST'});setOk(false)}}>LOGOUT</button></div></div>

  {s&&<div className="ad-stats">
   <div className="ad-stat ad-slot"><span className="big">{slotUsed} / {s.max}</span>SLOTS TAKEN{full&&<b style={{color:'#ff5470'}}> · FULL</b>}
    <div className={'ad-meter'+(hot?' hot':'')}><i style={{width:`${Math.min(100,s.active/s.max*100)}%`}}/></div>
    {Math.max(0,s.max-s.active)} REMAINING · REJECTED DON'T COUNT</div>
   <button className="ad-stat p" onClick={()=>setTab('pending')}><span className="big">{cP}</span>NEEDS REVIEW</button>
   <button className="ad-stat" onClick={()=>setTab('approved')}><span className="big">{cA}</span>APPROVED</button>
   <button className="ad-stat r" onClick={()=>setTab('rejected')}><span className="big">{cR}</span>REJECTED</button>
   <button className="ad-stat u" onClick={()=>setTab('unverified')}><span className="big">{cU}</span>UNVERIFIED</button></div>}

  {s?.pending>0&&<div className="ad-banner"><div><b>{s.pending} PAYMENT{s.pending>1?'S':''} WAITING FOR REVIEW</b><br/><span>OLDEST FIRST · A = APPROVE · R = REJECT</span></div><button className="ad-go" onClick={startReview}>START REVIEWING →</button></div>}

  <div className="ad-tabs">{TABS.map(([k,l])=><button key={k} className={'ad-tab'+(tab===k?' on':'')+(k==='pending'&&s?.pending>0?' hot':'')} onClick={()=>setTab(k)}>{l}{s&&<em>{{pending:s.pending,approved:s.approved,rejected:s.rejected,unverified:s.unverified,'':s.total}[k]}</em>}</button>)}</div>
  <div className="ad-filters">
   <input style={{flex:'1 1 240px'}} placeholder="Search name, email, phone, ID" value={q} onChange={e=>setQ(e.target.value)}/>
   <select style={{width:'auto'}} value={sort} onChange={e=>setSortSel(e.target.value)}><option value="new">Newest first</option><option value="old">Oldest first</option><option value="name">Name</option><option value="status">Status</option></select></div>
  <p style={{display:'flex',gap:8,flexWrap:'wrap'}}><a className="ad-btn" href="/api/admin/export?">EXPORT ALL</a><a className="ad-btn" href="/api/admin/export?f=active">EXPORT REGISTERED</a><a className="ad-btn" href="/api/admin/export?f=approved">EXPORT APPROVED</a><a className="ad-btn" href={'/api/admin/export?'+qs}>EXPORT FILTERED</a></p>

  <div className="wrap ad-tbl"><table><thead><tr>{['#','ID','Name','Email','Phone','Status','Registered',''].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
   {rows.length===0&&<tr><td colSpan={8} className="ad-empty">{tab==='pending'?'INBOX ZERO — NOTHING WAITING 🎉':'NOTHING HERE'}</td></tr>}
   {rows.map((r,i)=><tr key={r.id} className={'ad-row'+(r.payment_status==='rejected'?' rej':'')+(flash[r.id]?' fl-'+flash[r.id]:'')} style={{animationDelay:Math.min(i,14)*28+'ms'}} onClick={()=>openReview(rows.map(x=>x.id),i)}>
    <td>{i+1}</td><td>{r.regId}</td><td>{r.full_name}</td><td>{r.email}</td><td>{r.phone}</td><td><Badge r={r}/></td><td title={new Date(r.created_at).toLocaleString()}>{ago(r.created_at)}</td>
    <td><button className="ad-btn" onClick={e=>{e.stopPropagation();openReview(rows.map(x=>x.id),i)}}>REVIEW</button></td></tr>)}</tbody></table></div>

  {deck&&<div className="ad-ov" onClick={closeReview}>
   <div className={'ad-rv'+(exit==='rejected'?' ad-shake':'')} onClick={e=>e.stopPropagation()}>
    <div className="ad-rvtop"><span>{end?'DONE':`CARD ${pos+1}/${deck.length} · ${remaining} LEFT`}</span><div className="ad-prog"><i style={{width:`${end?100:(deck.length-remaining)/deck.length*100}%`}}/></div>
     <button className="ad-x" onClick={()=>setSound(v=>!v)}>{sound?'🔊 SOUND':'🔇 MUTED'}</button><button className="ad-x" onClick={closeReview}>ESC ✕</button></div>

    {end&&<div className="ad-end"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"/><path d="M36 62l17 17 32-36"/></svg><h3>ALL CAUGHT UP</h3><p>{sess.a} APPROVED · {sess.r} REJECTED THIS SESSION</p><br/><button className="ad-go" onClick={closeReview}>BACK TO DASHBOARD</button></div>}

    {cur&&<div key={cur.id} className={'ad-card '+(exit||'')}>
     <div className="ad-shotw"><div className={'ad-shot'+(zoom?' z':'')}>
       <img src={'/api/admin/shot?id='+cur.id} alt="Payment proof" onClick={()=>setZoom(z=>!z)} onLoad={()=>setImg('ok')} onError={()=>setImg('err')} style={{opacity:img==='ok'?1:0}}/></div>
      {img!=='ok'&&<div className="ad-sk">{img==='err'?'SCREENSHOT MISSING':'LOADING PROOF…'}</div>}
      {exit&&exit!=='pending'&&<div className={'ad-stamp '+exit}>{exit==='approved'?'APPROVED':'REJECTED'}</div>}</div>

     <div className="ad-info">
      <h3>{cur.full_name}</h3>
      <div className="ad-meta"><Badge r={cur}/><span>{cur.regId}</span><span>· {ago(cur.created_at)}</span></div>
      <div className="ad-meta">✉ <button className="ad-copy" onClick={()=>copy(cur.email)}>{cur.email}</button></div>
      <div className="ad-meta">☎ <button className="ad-copy" onClick={()=>copy(cur.phone)}>{cur.phone}</button></div>
      {!cur.verified_at&&<div className="ad-warn">EMAIL NOT VERIFIED YET — CAN'T APPROVE OR REJECT</div>}
      <div className="ad-box"><small>CHECK BEFORE APPROVING</small>
       {[`Sent to ${PAY_NUM}`,'Amount is correct','Date / time looks right','Has a transaction ID','Looks untouched (no edits)'].map(t=><label key={t} className="ad-ck"><input type="checkbox" checked={!!chk[t]} onChange={()=>setChk(c=>({...c,[t]:!c[t]}))}/><b>✓</b><span>{t}</span></label>)}</div>
      <div className="ad-chips">{REASONS.map(x=><button key={x} type="button" className={'ad-chip'+(notes.includes(x)?' on':'')} onClick={()=>toggleReason(x)}>{x}</button>)}</div>
      <textarea rows={2} placeholder="Notes / reason (saved with the decision)" value={notes} onChange={e=>setNotes(e.target.value)}/>
      <div className="ad-acts"><button className="ad-no" disabled={busy||!cur.verified_at} onClick={()=>decide('rejected')}>✕ REJECT<kbd>R</kbd></button><button className="ad-yes" disabled={busy||!cur.verified_at} onClick={()=>decide('approved')}>✓ APPROVE<kbd>A</kbd></button></div>
      <div className="ad-sub"><button className="ad-btn" onClick={()=>nav(-1)}>← PREV</button><button className="ad-btn" onClick={()=>nav(1)}>SKIP →</button>{cur.payment_status!=='pending'&&cur.verified_at&&<button className="ad-btn" disabled={busy} onClick={()=>decide('pending')}>RESET (U)</button>}<a className="ad-btn" target="_blank" href={'/api/admin/shot?id='+cur.id}>FULL IMAGE</a></div>
      <div className="ad-hint">A APPROVE · R REJECT · ← → NAVIGATE · Z ZOOM · ESC CLOSE</div></div></div>}
   </div>
   {exit&&exit!=='pending'&&<div key={'f'+fxKey} className={'ad-flash '+exit}/>}
  </div>}

  <FxCanvas fxRef={fx}/>
  <div className="ad-toasts">{toasts.map(t=><div key={t.id} className={'ad-toast '+(t.kind||'')}><span>{t.msg}</span>{t.undo&&<button onClick={()=>{dismiss(t.id);t.undo()}}>UNDO</button>}{t.undo&&<i/>}</div>)}</div>
 </section></main>}