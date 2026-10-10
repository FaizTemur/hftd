import crypto from 'crypto';import nodemailer from 'nodemailer';import pg from 'pg';import {createClient} from '@supabase/supabase-js';
export const J=(d,s=200)=>Response.json(d,{status:s});
export const MAX=+process.env.MAX_SLOTS||50;
export const BUCKET='payment-proofs';
export const pool=(globalThis._pool??=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:5}));
export const sb=()=>createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_KEY,{auth:{persistSession:false}});
export const count=async(c=pool)=>+(await c.query('select count(*) from registrations where verified_at is not null and status<>\'rejected\'')).rows[0].count;
export const fmtId=n=>'HFTD-'+String(n).padStart(4,'0');
export const hmac=s=>crypto.createHmac('sha256',process.env.AUTH_SECRET).update(s).digest('hex');
const eq=(a,b)=>a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
export const makeSession=u=>{const p=`${u}.${Date.now()+8*36e5}`;return `${p}.${hmac(p)}`};
export function admin(req){const v=req.cookies.get('s')?.value;if(!v)return null;const [u,e,s]=v.split('.');
 return s&&+e>Date.now()&&eq(hmac(`${u}.${e}`),s)?u:null}
export function checkPw(pw,stored){const [salt,h]=stored.split(':');return eq(crypto.scryptSync(pw,salt,64).toString('hex'),h)}
export function newOtp(id){const code=String(crypto.randomInt(0,1e6)).padStart(6,'0');return {code,hash:hmac(id+code)}}
const mailer=()=>(globalThis._mailer??=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}}));
export async function sendOtp(email,code){
 try{await mailer().sendMail({from:process.env.EMAIL_FROM||process.env.GMAIL_USER,to:email,subject:'Your HFTD verification code',text:`Your verification code is ${code}. It expires in 10 minutes.`})}
 catch(e){console.error('Mail error',e.message);throw new Error('mail')}}
export function filterSql(sp){const w=['1=1'],a=[];const q=sp.get('q')?.trim();
 if(q){a.push(`%${q}%`);w.push(`(full_name ilike $1 or email ilike $1 or phone ilike $1 or 'HFTD-'||lpad(reg_no::text,4,'0') ilike $1 or id::text ilike $1)`)}
 const f=sp.get('f');const F={verified:'verified_at is not null',unverified:'verified_at is null',approved:"status='approved'",rejected:"status='rejected'",pending:"verified_at is not null and payment_status='pending'",active:"verified_at is not null and status<>'rejected'"};
 if(F[f])w.push(F[f]);
 const o={new:'created_at desc',old:'created_at asc',name:'full_name asc',status:'status asc, created_at desc'}[sp.get('sort')]||'created_at desc';
 return {sql:`select * from registrations where ${w.join(' and ')} order by ${o}`,a}}