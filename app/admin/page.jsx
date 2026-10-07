'use client';
import {useEffect,useState,useCallback} from 'react';
export default function Admin(){
 const [ok,setOk]=useState(null),[d,setD]=useState(),[q,setQ]=useState(''),[f,setF]=useState(''),[sort,setSort]=useState('new'),[sel,setSel]=useState(),[z,setZ]=useState(false),[err,setErr]=useState(''),[notes,setNotes]=useState('');
 const qs=`q=${encodeURIComponent(q)}&f=${f}&sort=${sort}`;
 const load=useCallback(async()=>{const r=await fetch('/api/admin/list?'+qs);if(r.status===401){setOk(false);return}setOk(true);setD(await r.json())},[qs]);
 useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[load]);
 async function login(e){e.preventDefault();setErr('');const b=Object.fromEntries(new FormData(e.target));
  const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});if(r.ok)load();else setErr((await r.json()).error)}
 async function act(p){await fetch('/api/admin/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sel.id,payment_status:p,notes})});setSel();load()}
 if(ok===null)return <main><section>Loading…</section></main>;
 if(!ok)return <main><section style={{maxWidth:420}}><h2>ADMIN ACCESS</h2><form className="card" onSubmit={login}><input name="username" placeholder="Username" required/><input name="password" type="password" placeholder="Password" required/><button className="btn">LOGIN →</button>{err&&<p className="err">{err}</p>}</form></section></main>;
 const s=d?.stats;
 return <main><section style={{maxWidth:1300}}>
  <div style={{display:'flex',justifyContent:'space-between'}}><h2>HFTD // CONTROL</h2><button className="btn o" onClick={async()=>{await fetch('/api/admin/logout',{method:'POST'});setOk(false)}}>LOGOUT</button></div>
  {s&&<div className="grid" style={{marginBottom:20}}>
   <div className="card"><div className="big">{s.verified} / {s.max}</div>REGISTRATIONS<div className="bar"><i style={{width:`${s.verified/s.max*100}%`}}/></div>{Math.max(0,s.max-s.verified)} SLOTS REMAINING</div>
   {[['Total',s.total],['Unverified',s.unverified],['Approved',s.approved],['Rejected',s.rejected]].map(([k,v])=><div className="card" key={k}><div className="big">{v}</div>{k}</div>)}</div>}
  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
   <input style={{flex:'1 1 240px'}} placeholder="Search name, email, phone, ID" value={q} onChange={e=>setQ(e.target.value)}/>
   <select style={{width:'auto'}} value={f} onChange={e=>setF(e.target.value)}><option value="">All</option><option value="verified">Verified</option><option value="unverified">Unverified</option><option value="pending">Payment pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
   <select style={{width:'auto'}} value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Newest</option><option value="old">Oldest</option><option value="name">Name</option><option value="status">Status</option></select></div>
  <p><a className="btn o" href={'/api/admin/export?'}>EXPORT ALL</a> <a className="btn o" href={'/api/admin/export?f=verified'}>EXPORT VERIFIED</a> <a className="btn o" href={'/api/admin/export?f=approved'}>EXPORT APPROVED</a> <a className="btn o" href={'/api/admin/export?'+qs}>EXPORT FILTERED</a></p>
  <div className="wrap"><table><thead><tr>{['#','ID','Name','Email','Phone','Status','Verified','Payment','Date',''].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
   {d?.rows.map((r,i)=><tr key={r.id}><td>{i+1}</td><td>{r.regId}</td><td>{r.full_name}</td><td>{r.email}</td><td>{r.phone}</td><td>{r.status}</td><td>{r.verified_at?'yes':'no'}</td><td>{r.payment_status}</td><td>{new Date(r.created_at).toLocaleString()}</td>
   <td><button className="btn o" onClick={()=>{setSel(r);setNotes(r.admin_notes);setZ(false)}}>REVIEW</button></td></tr>)}</tbody></table></div>
  {sel&&<div className="modal" onClick={()=>setSel()}><div className="card" onClick={e=>e.stopPropagation()}><b>{sel.full_name}</b> — {sel.regId}<br/>
   <div style={{overflow:'auto',maxHeight:'50vh',margin:'12px 0'}}><img className={z?'z':''} onClick={()=>setZ(!z)} src={'/api/admin/shot?id='+sel.id} alt="Payment proof"/></div>
   <a className="btn o" target="_blank" href={'/api/admin/shot?id='+sel.id}>OPEN FULL IMAGE</a>
   <textarea rows={3} placeholder="Admin notes" value={notes} onChange={e=>setNotes(e.target.value)}/>
   <button className="btn" onClick={()=>act('approved')}>APPROVE</button> <button className="btn o" onClick={()=>act('rejected')}>REJECT</button> <button className="btn o" onClick={()=>act('pending')}>RESET</button> <button className="btn o" onClick={()=>setSel()}>CLOSE</button></div></div>}
 </section></main>}
