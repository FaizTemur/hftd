import {J,pool,newOtp,sendOtp} from '@/lib/util';
export async function POST(req){try{const {id}=await req.json();
 const r=(await pool.query('select email,verified_at from registrations where id=$1',[id])).rows[0];
 if(!r||r.verified_at)return J({error:'Invalid request.'},400);
 const {code,hash}=newOtp(id);
 const u=await pool.query("update registrations set otp_hash=$2,otp_expires=now()+interval '10 minutes',otp_attempts=0,otp_sent_at=now() where id=$1 and otp_sent_at<now()-interval '60 seconds'",[id,hash]);
 if(!u.rowCount)return J({error:'Please wait a minute before requesting another code.'},429);
 await sendOtp(r.email,code);return J({ok:true})}catch{return J({error:'Something went wrong. Please try again shortly.'},500)}}
