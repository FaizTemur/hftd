import pg from 'pg';import crypto from 'crypto';
const {ADMIN_USERNAME:u,ADMIN_PASSWORD:p}=process.env;if(!u||!p)throw new Error('set ADMIN_USERNAME/ADMIN_PASSWORD');
const salt=crypto.randomBytes(16).toString('hex');const h=salt+':'+crypto.scryptSync(p,salt,64).toString('hex');
const c=new pg.Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();
await c.query('insert into admins values($1,$2) on conflict(username) do update set password_hash=$2',[u,h]);await c.end();console.log('admin ready');
