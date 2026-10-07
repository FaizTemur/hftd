import crypto from 'crypto';import {J,MAX,pool,sb,BUCKET,count,newOtp,sendOtp} from '@/lib/util';
const T={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
const magic=b=>b.slice(0,4).equals(Buffer.from([0x89,0x50,0x4e,0x47]))||b.slice(0,3).equals(Buffer.from([0xff,0xd8,0xff]))||(b.slice(0,4).toString()==='RIFF'&&b.slice(8,12).toString()==='WEBP');
export async function POST(req){let path;try{
 const f=await req.formData();const name=String(f.get('name')||'').trim().replace(/\s+/g,' ');const email=String(f.get('email')||'').trim().toLowerCase();
 let ph=String(f.get('phone')||'').replace(/[\s\-()]/g,'').replace(/^\+/,'');ph=ph.replace(/^92/,'').replace(/^0/,'');const file=f.get('file');
 if(name.length<3||name.length>80)return J({error:'Enter your full name.'},400);
 const doms=(process.env.ALLOWED_EMAIL_DOMAINS||'').split(',').map(s=>s.trim()).filter(Boolean);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>120||(doms.length&&!doms.some(d=>email.endsWith('@'+d))))return J({error:'Enter a valid email.'},400);
 if(!/^3\d{9}$/.test(ph))return J({error:'Enter a valid Pakistani mobile number.'},400);ph='+92'+ph;
 if(!file||typeof file==='string'||!T[file.type]||file.size>4e6||!file.size)return J({error:'Upload a PNG/JPG/WebP screenshot under 4MB.'},400);
 const buf=Buffer.from(await file.arrayBuffer());if(!magic(buf))return J({error:'Upload a PNG/JPG/WebP screenshot under 4MB.'},400);
 if(await count()>=MAX)return J({error:'REGISTRATION CLOSED',closed:true},409);
 path=`${crypto.randomUUID()}.${T[file.type]}`;
 const up=await sb().storage.from(BUCKET).upload(path,buf,{contentType:file.type});
 if(up.error){path=null;return J({error:'Payment screenshot upload failed. Please try again.'},502)}
 const old=await pool.query('delete from registrations where verified_at is null and (lower(email)=$1 or phone=$2) returning screenshot_path',[email,ph]);
 if(old.rows.length)await sb().storage.from(BUCKET).remove(old.rows.map(r=>r.screenshot_path));
 const id=crypto.randomUUID(),{code,hash}=newOtp(id);
 await pool.query("insert into registrations(id,full_name,email,phone,screenshot_path,otp_hash,otp_expires,otp_sent_at) values($1,$2,$3,$4,$5,$6,now()+interval '10 minutes',now())",[id,name,email,ph,path,hash]);
 try{await sendOtp(email,code)}catch{await pool.query('delete from registrations where id=$1',[id]);await sb().storage.from(BUCKET).remove([path]);return J({error:'Could not send verification email. Please try again.'},502)}
 return J({id})}
 catch(e){if(path)await sb().storage.from(BUCKET).remove([path]).catch(()=>{});
  if(e.code==='23505')return J({error:e.constraint?.includes('phone')?'This phone number has already been registered.':'This email has already been registered.'},409);
  return J({error:'Something went wrong. Please try again shortly.'},500)}}