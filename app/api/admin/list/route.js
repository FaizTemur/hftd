import {J,MAX,pool,admin,filterSql,fmtId} from '@/lib/util';export const dynamic='force-dynamic';
export async function GET(req){if(!admin(req))return J({error:'Unauthorized'},401);
 const {sql,a}=filterSql(req.nextUrl.searchParams);
 const rows=(await pool.query(sql,a)).rows.map(({otp_hash,otp_expires,otp_attempts,otp_sent_at,...r})=>({...r,regId:r.reg_no?fmtId(r.reg_no):'—'}));
 const s=(await pool.query("select count(*) filter(where verified_at is not null) v,count(*) filter(where verified_at is null) u,count(*) filter(where verified_at is not null and status<>'rejected') act,count(*) filter(where verified_at is not null and payment_status='pending') p,count(*) filter(where status='approved') a,count(*) filter(where status='rejected') r,count(*) t from registrations")).rows[0];
 return J({rows,stats:{total:+s.t,verified:+s.v,unverified:+s.u,active:+s.act,pending:+s.p,approved:+s.a,rejected:+s.r,max:MAX}})}