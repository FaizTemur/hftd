'use client';
import dynamic from 'next/dynamic';import {useEffect,useRef,useState} from 'react';
const Scene=dynamic(()=>import('./Scene'),{ssr:false});
const pad=(n,l=3)=>String(n).padStart(l,'0'),CH='!<>-_/[]{}=+*^?#01';
function Scr({t}){const [v,setV]=useState(t);useEffect(()=>{let i=0;const x=setInterval(()=>{setV([...t].map((c,k)=>k<i||c===' '?c:CH[Math.random()*CH.length|0]).join(''));if(i++>=t.length)clearInterval(x)},35);return()=>clearInterval(x)},[t]);return v}
function useCount(n){const [v,setV]=useState(0);const from=useRef(0);useEffect(()=>{let f;const s=performance.now(),a=from.current;const st=t=>{const p=Math.min((t-s)/1400,1);const x=Math.round(a+(n-a)*(1-(1-p)**3));setV(x);from.current=x;if(p<1)f=requestAnimationFrame(st)};f=requestAnimationFrame(st);return()=>cancelAnimationFrame(f)},[n]);return v}
const post=async(u,b)=>{const r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});return {ok:r.ok,d:await r.json().catch(()=>({error:'Something went wrong. Please try again shortly.'}))}};
const send=(fd,on)=>new Promise(res=>{const x=new XMLHttpRequest();x.open('POST','/api/register');x.upload.onprogress=e=>e.lengthComputable&&on(e.loaded/e.total);
 x.onload=()=>{let d;try{d=JSON.parse(x.responseText)}catch{d={error:'Something went wrong. Please try again shortly.'}}res({ok:x.status<300,d})};x.onerror=()=>res({ok:false,d:{error:'Network error. Please try again.'}});x.send(fd)});
const TICK=['[ERROR: GOOD IDEA NOT FOUND]','SYSTEM STATUS: QUESTIONABLE','IQ REQUIRED: OPTIONAL','BRAIN.EXE HAS STOPPED RESPONDING','404: GOOD IDEA','BUILD SOMETHING STUPID'];
const FAQ=[['who-can-participate','ANYONE CRAZY ENOUGH TO BUILD SOMETHING. Students, mainly. Organizers have the final say.'],['what-do-i-need','Full name, email, Pakistani phone number, and a screenshot of your JazzCash payment.'],['how-do-i-pay','Send the fee to JazzCash 03330866555 (Anshal Abbas), then upload the screenshot in the form.'],['how-do-i-verify','We email a 6-digit code right after you submit. It expires in 10 minutes.'],['what-happens-next','You get a registration ID instantly. Organizers review your payment and update your status.'],['how-many-slots','Strictly limited. When the counter hits zero, registration closes automatically.']];
export default function Home(){
 const [s,setS]=useState(null),[step,setStep]=useState(0),[id,setId]=useState(),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[reg,setReg]=useState(),[pr,setPr]=useState(0),[fn,setFn]=useState(''),[nm,setNm]=useState(''),[ph,setPh]=useState(''),[em,setEm]=useState(''),[left,setLeft]=useState(600),[cp,setCp]=useState(false),[open,setOpen]=useState(0),[clock,setClock]=useState(''),[msg,setMsg]=useState(''),[g3,setG3]=useState(false);
 const cur=useRef();const n=useCount(s?.count||0);
 const load=()=>fetch('/api/stats',{cache:'no-store'}).then(r=>r.json()).then(setS).catch(()=>{});
 useEffect(()=>{setG3(!matchMedia('(prefers-reduced-motion: reduce)').matches);load();const a=setInterval(load,15000),b=setInterval(()=>setClock(new Date().toISOString().slice(11,19)+'Z'),1000);return()=>{clearInterval(a);clearInterval(b)}},[]);
 useEffect(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.15});document.querySelectorAll('.rv').forEach(el=>io.observe(el));
  let mv;if(matchMedia('(pointer:fine)').matches){mv=e=>{const c=cur.current;c.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;const t=e.target.closest?.('.mag');
   if(t){const r=t.getBoundingClientRect();t.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`}
   document.querySelectorAll('.mag').forEach(x=>x!==t&&(x.style.transform=''));c.classList.toggle('hv',!!e.target.closest?.('a,button,label,summary'))};addEventListener('mousemove',mv)}
  return()=>{io.disconnect();mv&&removeEventListener('mousemove',mv)}},[]);
 useEffect(()=>{if(step!==1)return;setLeft(600);const t=setInterval(()=>setLeft(l=>Math.max(0,l-1)),1000);return()=>clearInterval(t)},[step]);
 const closed=s?.closed,max=s?.max??100;
 async function submit(e){e.preventDefault();setErr('');setBusy(true);setPr(0);const {ok,d}=await send(new FormData(e.target),setPr);setBusy(false);
  if(ok){setId(d.id);setStep(1)}else{setErr(d.error);d.closed&&load()}}
 async function verify(e){e.preventDefault();setErr('');setBusy(true);const {ok,d}=await post('/api/verify',{id,code:new FormData(e.target).get('code')});setBusy(false);
  if(ok){setReg(d.regId);setStep(2);load()}else{setErr(d.error);d.closed&&load()}}
 async function resend(){setErr('');setMsg('');const {ok,d}=await post('/api/resend',{id});if(ok){setMsg('NEW CODE TRANSMITTED');setLeft(600)}else setErr(d.error)}
 const copy=()=>navigator.clipboard.writeText('03330866555').then(()=>{setCp(true);setTimeout(()=>setCp(false),1800)});
 const C=2*Math.PI*90,frac=s?s.count/s.max:0;
 return <main>{g3&&<Scene/>}<div className="cur" ref={cur}/><div className="noise"/>
 <header className="bar-top"><span>HFTD//SYS</span><span className="hide-s">31.5204°N 74.3587°E — LAHORE</span><span>{clock||'--:--:--Z'}</span></header>
 <section className="hero"><div className="micro">SECTION 01 // ENTER THE SYSTEM</div>
  <h1><span className="gl" data-t="HACKATHON">HACKATHON</span><span className="ol">FOR THE</span><span className="gl gr" data-t="DUMBEST">DUMBEST</span></h1>
  <p className="tag">&gt; <Scr t="Because the worst ideas sometimes make the best hacks."/><i className="blink">_</i></p>
  <div className="row"><a className="btn mag" href="#register">REGISTER NOW →</a><div className="pill">{s?(closed?'REGISTRATION CLOSED':`${pad(s.max-s.count)} / ${s.max} SLOTS OPEN`):'SYNCING…'}</div></div>
  <div className="tick"><div>{[...TICK,...TICK].map((t,i)=><span key={i}>{t}</span>)}</div></div></section>
 <section className="idea"><div className="micro rv">SECTION 02 // THE IDEA</div>
  {['THE PROBLEM','People keep trying to build "the next big thing."','We decided to remove the pressure.','Build something dumb.','Build something useless.','Build something hilarious.','Just BUILD.'].map((t,i)=><p key={i} className={`rv ${i===0?'micro':i>2?'bigline':'midline'}`} style={{transitionDelay:`${i*70}ms`}}>{t}</p>)}</section>
 <section><div className="micro rv">SECTION 03 // PROCESS</div><ol className="tl">{[['REGISTER','Fill the form.'],['VERIFY','6-digit code by email.'],['PAY','JazzCash transfer.'],['BUILD','Make something stupid.'],['BREAK EVERYTHING','Demo day.']].map(([a,b],i)=><li key={a} className="rv" style={{transitionDelay:`${i*90}ms`}}><b>{pad(i+1,2)}</b><h3>{a}</h3><span>{b}</span></li>)}</ol></section>
 <section id="register"><div className="micro rv">SECTION 04 // REGISTRATION + PAYMENT</div>
  <div className="two">
  <div className="term rv"><div className="th"><i/><i/><i/>TRANSACTION NODE // 01</div><div className="tb">
   <div className="micro">SEND REGISTRATION PAYMENT TO</div><div className="jc">JAZZCASH</div><div className="num">03330866555</div><div className="micro">ACCOUNT NAME</div><div className="nm">ANSHAL ABBAS</div>
   <button type="button" className={`btn o mag ${cp?'ok':''}`} onClick={copy}>{cp?'COPIED ✓':'COPY NUMBER'}</button>
   <div className="micro" style={{marginTop:18}}>STATUS<br/><b className="st">{step===2?'PROOF RECEIVED':fn?'PROOF ATTACHED':'AWAITING PAYMENT PROOF'}</b></div></div></div>
  <div className="term rv"><div className="th"><i/><i/><i/>{step===0?'INITIATE REGISTRATION':step===1?'SECURE CHANNEL ESTABLISHED':'ACCESS GRANTED'}</div><div className="tb">
  {closed&&step<2?<div><div className="huge sm">REGISTRATION CLOSED</div>All {max} slots have been filled.</div>:<>
  {step===0&&<form onSubmit={submit} className="fadein">
   <label className="f"><span>USER.IDENTITY &gt; FULL_NAME</span><input name="name" required maxLength={80} autoComplete="name" value={nm} onChange={e=>setNm(e.target.value)}/><em>{nm.trim().length>=3?'IDENTITY.LOCKED ✓':'AWAITING INPUT'}</em></label>
   <label className="f"><span>USER.EMAIL &gt; EMAIL</span><input name="email" type="email" required autoComplete="email" value={em} onChange={e=>setEm(e.target.value)}/><em>{/^\S+@\S+\.\S+$/.test(em)?'CHANNEL.VALID ✓':'AWAITING INPUT'}</em></label>
   <label className="f"><span>CONTACT.NODE &gt; PHONE_NUMBER</span><input name="phone" type="tel" required placeholder="03XX XXXXXXX" autoComplete="tel" value={ph} onChange={e=>setPh(e.target.value)}/><em>{/^(\+?92|0)?3\d{9}$/.test(ph.replace(/[\s-]/g,''))?'NODE.VALID ✓':'AWAITING INPUT'}</em></label>
   <label className={`drop ${fn?'has':''}`}><span>PAYMENT.PROOF &gt; UPLOAD_TRANSACTION</span><b>{fn||'[ DROP FILE HERE ]'}</b><small>PNG / JPG / WEBP — MAX 4MB</small><input name="file" type="file" required accept="image/png,image/jpeg,image/webp" onChange={e=>setFn(e.target.files[0]?.name||'')}/></label>
   {busy&&<div className="prog"><i style={{width:`${pr*100}%`}}/><span>UPLOADING {Math.round(pr*100)}%</span></div>}
   <button className="btn mag" disabled={busy}>{busy?'TRANSMITTING…':'[ INITIALIZE REGISTRATION ]'}</button></form>}
  {step===1&&<form onSubmit={verify} className="fadein"><div className="micro">VERIFICATION CODE SENT TO</div><div className="nm">{em.replace(/(.{2}).*(@.*)/,'$1•••••$2')}</div><div className="micro" style={{margin:'16px 0 4px'}}>ENTER 6-DIGIT CODE</div>
   <input className="otp" name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoFocus placeholder="______" autoComplete="one-time-code"/>
   <div className="micro">CODE EXPIRES IN {pad(left/60|0,2)}:{pad(left%60,2)}</div><br/>
   <button className="btn mag" disabled={busy||left===0}>{busy?'VERIFYING…':'[ VERIFY ]'}</button> <button type="button" className="btn o" onClick={resend}>RESEND CODE</button></form>}
  {step===2&&<div className="fadein"><div className="micro">✓ REGISTRATION COMPLETE</div><div className="huge sm">WELCOME TO THE CHAOS.</div><div className="micro">REGISTRATION ID</div><div className="num">{reg}</div>
   <p>You're officially registered for HACKATHON FOR THE DUMBEST. See you at COMSATS Lahore. Organizers will review your payment.</p><button className="btn o" onClick={()=>window.print()}>DOWNLOAD / PRINT TICKET</button></div>}
  {err&&<p className="err">! {err}</p>}{msg&&<p className="micro">{msg}</p>}</>}</div></div></div></section>
 <section className="cnt"><div className="micro rv">SECTION 05 // {max} SLOTS // 0 BRAIN CELLS</div>
  <div className="ringw rv"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" className="r0"/><circle cx="100" cy="100" r="90" className="r1" style={{strokeDasharray:C,strokeDashoffset:C*(1-frac)}}/></svg>
   <div className="huge">{pad(n)}</div></div>
  <div className="mid rv">REGISTRATIONS</div><div className="micro rv">{s?(closed?'REGISTRATION CLOSED':`${pad(s.max-s.count)} SLOTS REMAINING`):'SYNCING…'}</div></section>
 <section><div className="micro rv">SECTION 06 // FAQ.TERMINAL</div><div className="term rv"><div className="th"><i/><i/><i/>faq@hftd:~$</div><div className="tb">
  {FAQ.map(([q,a],i)=><div key={q}><button className="faq" aria-expanded={open===i} onClick={()=>setOpen(open===i?-1:i)}>&gt; ./faq --{q}</button>{open===i&&<p className="ans">{a}</p>}</div>)}</div></div></section>
 <section className="fin"><div className="micro rv">SECTION 07 // END OF LINE</div><h2 className="rv">READY TO BUILD SOMETHING QUESTIONABLE?</h2><a className="btn mag" href="#register">REGISTER NOW →</a></section>
 <footer><div className="micro">SYSTEM TERMINATED</div><div className="foot">HACKATHON<br/>FOR THE<br/>DUMBEST</div><div className="micro">COMSATS UNIVERSITY ISLAMABAD // LAHORE CAMPUS — STATUS: <b style={{color:'var(--g)'}}>ONLINE</b></div></footer></main>}