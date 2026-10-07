import {J,pool,admin,filterSql,fmtId} from '@/lib/util';
const q=v=>`"${String(v??'').replace(/"/g,'""').replace(/^([=+\-@])/,"'$1")}"`;
export async function GET(req){if(!admin(req))return J({error:'Unauthorized'},401);
 const {sql,a}=filterSql(req.nextUrl.searchParams);const rows=(await pool.query(sql,a)).rows;
 const H=['Registration ID','Full Name','Email','Phone','Status','Verified','Payment Status','Registered At','Screenshot Path','Admin Notes'];
 const L=rows.map(r=>[r.reg_no?fmtId(r.reg_no):r.id,r.full_name,r.email,r.phone,r.status,r.verified_at?'yes':'no',r.payment_status,r.created_at.toISOString(),r.screenshot_path,r.admin_notes].map(q).join(','));
 return new Response('\uFEFF'+[H.map(q).join(','),...L].join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="hftd-registrations.csv"'}})}
