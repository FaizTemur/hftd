import {J,MAX,pool,admin,count} from '@/lib/util';
export async function POST(req){
 if(!admin(req)||req.headers.get('content-type')!=='application/json')return J({error:'Unauthorized'},401);
 const {id,payment_status,notes}=await req.json().catch(()=>({}));
 if(!/^[0-9a-f-]{36}$/.test(String(id)))return J({error:'Bad id'},400);
 if(!['pending','approved','rejected'].includes(payment_status))return J({error:'Bad status'},400);
 const st={pending:'payment_pending_review',approved:'approved',rejected:'rejected'}[payment_status];
 const c=await pool.connect();
 try{
  await c.query('begin');await c.query('select pg_advisory_xact_lock(4242)');
  const r=(await c.query('select verified_at,payment_status from registrations where id=$1 for update',[id])).rows[0];
  if(!r){await c.query('rollback');return J({error:'Registration not found'},404)}
  if(!r.verified_at){await c.query('rollback');return J({error:'This person has not verified their email yet'},409)}
  // Un-rejecting takes a slot again, so make sure there is one.
  if(r.payment_status==='rejected'&&payment_status!=='rejected'&&await count(c)>=MAX){await c.query('rollback');return J({error:'All slots are full. Reject someone else first to restore this one.'},409)}
  await c.query('update registrations set payment_status=$2,status=$3,admin_notes=$4,updated_at=now() where id=$1',[id,payment_status,st,String(notes||'').slice(0,1000)]);
  await c.query('commit');return J({ok:true})}
 catch{await c.query('rollback').catch(()=>{});return J({error:'Something went wrong. Please try again.'},500)}
 finally{c.release()}}