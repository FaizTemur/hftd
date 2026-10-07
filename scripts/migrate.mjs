import pg from 'pg';import fs from 'fs';
const c=new pg.Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
await c.connect();await c.query(fs.readFileSync('db/schema.sql','utf8'));await c.end();console.log('migrated');
