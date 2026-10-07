import {J,pool,admin} from '@/lib/util';
export async function POST(req){if(!admin(req)||req.headers.get('content-type')!=='application/json')return J({error:'Unauthorized'},401);
 const {id,payment_status,notes}=await req.json();if(!['pending','approved','rejected'].includes(payment_status))return J({error:'Bad status'},400);
 const st={pending:'payment_pending_review',approved:'approved',rejected:'rejected'}[payment_status];
 await pool.query("update registrations set payment_status=$2,status=case when verified_at is null then status else $3 end,admin_notes=$4,updated_at=now() where id=$1",[id,payment_status,st,String(notes||'').slice(0,1000)]);return J({ok:true})}
