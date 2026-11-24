function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Expected an object');
}
function array(value) {
  if (!Array.isArray(value) || value.length > 500) throw Error('Expected an array of at most 500 items');
  return Array.from(value);
}
function text(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 100000) throw Error('Expected nonempty text');
  return value;
}
function index(contracts) {
  const result=new Map();
  for(const contract of array(contracts)) {
    object(contract);text(contract.route);object(contract.fields);
    const fields=new Map(Object.entries(contract.fields).map(([name,type])=>[text(name),text(type)]));
    const required=new Set(array(contract.required).map(text));
    if([...required].some(name=>!fields.has(name)))throw Error('Required field missing from fields');
    if(result.has(contract.route))throw Error('Duplicate route');
    result.set(contract.route,{fields,required});
  }
  return result;
}
export function run(input) {
  object(input);
  if(JSON.stringify(input).length>200000)throw Error('Input exceeds 200000 serialized characters');
  const mode=input.mode===undefined?'request':input.mode;
  if(!['request','response'].includes(mode))throw Error('Mode must be request or response');
  const before=index(input.before),after=index(input.after),rows=[];
  for(const [route,a] of before) {
    const b=after.get(route);
    if(!b){rows.push({route,issue:'endpoint removed',mode});continue;}
    for(const [field,type] of a.fields) {
      if(!b.fields.has(field)||b.fields.get(field)!==type)
        rows.push({route,issue:'field removed or type changed',field,mode,
          beforeType:type,afterType:b.fields.get(field)??null,
          reason:b.fields.has(field)?'exact type label changed':'declared field removed'});
    }
    if(mode==='request') {
      for(const field of b.required)if(!a.required.has(field))
        rows.push({route,issue:'new required field',field,mode,reason:'previous callers may omit this field'});
    } else {
      for(const field of a.required)if(b.fields.has(field)&&!b.required.has(field))
        rows.push({route,issue:'required response field became optional',field,mode,reason:'previous consumers may rely on field presence'});
    }
  }
  return {metrics:{before:before.size,after:after.size,breakingSignals:rows.length},rows,mode};
}
