import {J,MAX,count} from '@/lib/util';export const dynamic='force-dynamic';
export async function GET(){try{const n=await count();return J({count:n,max:MAX,closed:n>=MAX})}catch{return J({error:'Something went wrong. Please try again shortly.'},500)}}
