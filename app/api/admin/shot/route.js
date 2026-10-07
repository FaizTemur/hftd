import {J,pool,admin,sb,BUCKET} from '@/lib/util';
export async function GET(req){if(!admin(req))return J({error:'Unauthorized'},401);
 const r=(await pool.query('select screenshot_path from registrations where id=$1',[req.nextUrl.searchParams.get('id')])).rows[0];if(!r)return J({error:'Not found'},404);
 const {data}=await sb().storage.from(BUCKET).createSignedUrl(r.screenshot_path,60);return data?Response.redirect(data.signedUrl,302):J({error:'Not found'},404)}
