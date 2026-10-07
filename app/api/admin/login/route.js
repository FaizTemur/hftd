import {J,pool,checkPw,makeSession} from '@/lib/util';
export async function POST(req){try{const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'x';
 if(+(await pool.query("select count(*) from login_attempts where ip=$1 and at>now()-interval '15 minutes'",[ip])).rows[0].count>=5)return J({error:'Too many attempts. Try again later.'},429);
 const {username,password}=await req.json();const a=(await pool.query('select * from admins where username=$1',[String(username)])).rows[0];
 if(!a||!checkPw(String(password),a.password_hash)){await pool.query('insert into login_attempts(ip) values($1)',[ip]);return J({error:'Invalid credentials.'},401)}
 const res=J({ok:true});res.headers.append('Set-Cookie',`s=${makeSession(a.username)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);return res}
 catch{return J({error:'Something went wrong.'},500)}}
