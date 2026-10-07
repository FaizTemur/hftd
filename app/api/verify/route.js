import {J,MAX,pool,count,hmac,fmtId} from '@/lib/util';import crypto from 'crypto';
export async function POST(req){const c=await pool.connect();try{
 const {id,code}=await req.json();if(!/^[0-9a-f-]{36}$/.test(String(id))||!/^\d{6}$/.test(String(code)))return J({error:'Invalid verification code.'},400);
 await c.query('begin');await c.query('select pg_advisory_xact_lock(4242)');
 const r=(await c.query('select * from registrations where id=$1 for update',[id])).rows[0];
 if(!r){await c.query('rollback');return J({error:'Registration not found. Please start again.'},404)}
 if(r.verified_at){await c.query('commit');return J({regId:fmtId(r.reg_no)})}
 if(r.otp_attempts>=5){await c.query('rollback');return J({error:'Too many attempts. Request a new code.'},429)}
 if(!r.otp_expires||r.otp_expires<new Date()){await c.query('rollback');return J({error:'This verification code has expired. Request a new code.'},410)}
 const h=hmac(id+code);
 if(!(h.length===r.otp_hash.length&&crypto.timingSafeEqual(Buffer.from(h),Buffer.from(r.otp_hash)))){
  await c.query('update registrations set otp_attempts=otp_attempts+1 where id=$1',[id]);await c.query('commit');return J({error:'Invalid verification code.'},400)}
 if(await count(c)>=MAX){await c.query('rollback');return J({error:'REGISTRATION CLOSED',closed:true},409)}
 const u=(await c.query("update registrations set verified_at=now(),status='payment_pending_review',otp_hash=null,otp_expires=null,updated_at=now(),reg_no=(select coalesce(max(reg_no),0)+1 from registrations) where id=$1 returning reg_no",[id])).rows[0];
 await c.query('commit');return J({regId:fmtId(u.reg_no)})}
 catch{await c.query('rollback').catch(()=>{});return J({error:'Something went wrong. Please try again shortly.'},500)}finally{c.release()}}
