
function obj(v){if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Expected an object');return v;}
function arr(v,label='array'){if(!Array.isArray(v)||v.length>500)throw Error(label+' must be an array with at most 500 items');return v;}
function str(v){if(typeof v!=='string'||!v.trim()||v.length>100000)throw Error('Expected nonempty text (max 100000 characters)');return v;}
function num(v,label='number',min=-1e12){if(typeof v!=='number'||!Number.isFinite(v)||v<min||Math.abs(v)>1e12)throw Error(label+' must be a finite number in range');return v;}
function bool(v){if(typeof v!=='boolean')throw Error('Expected a boolean');return v;}
function date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('Expected YYYY-MM-DD');const t=Date.parse(v+'T00:00:00Z');if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==v)throw Error('Invalid calendar date');return t;}
export function run(x){obj(x);if(JSON.stringify(x).length>200000)throw Error('Input exceeds 200 KB limit');

const index=a=>{const m=new Map();for(const e of arr(a,'contracts')){str(e.route);obj(e.fields);arr(e.required,'required').forEach(k=>{str(k);if(!Object.hasOwn(e.fields,k))throw Error('Required field missing from fields');});if(m.has(e.route))throw Error('Duplicate route');m.set(e.route,e);}return m;};const old=index(x.before),next=index(x.after),rows=[];for(const [route,a]of old){const b=next.get(route);if(!b){rows.push({route,issue:'endpoint removed'});continue;}for(const [field,type]of Object.entries(a.fields))if(!Object.hasOwn(b.fields,field)||b.fields[field]!==type)rows.push({route,issue:'field removed or type changed',field});for(const field of b.required)if(!a.required.includes(field))rows.push({route,issue:'new required field',field});}return {metrics:{before:old.size,after:next.size,breakingSignals:rows.length},rows};

}
