import {J} from '@/lib/util';
export async function POST(){const r=J({ok:true});r.headers.append('Set-Cookie','s=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');return r}
