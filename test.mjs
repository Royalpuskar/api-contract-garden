import test from 'node:test';
import assert from 'node:assert/strict';
import {run} from './engine.mjs';
import {sample} from './sample.mjs';
test('domain behavior and boundary cases',()=>{assert.equal(run(sample).metrics.breakingSignals,2);assert.equal(run({before:sample.before,after:sample.before}).metrics.breakingSignals,0);assert.equal(run({before:sample.before,after:[]}).rows[0].issue,'endpoint removed');});
test('deterministic result and input preservation',()=>{const copy=JSON.stringify(sample);assert.deepEqual(run(sample),run(sample));assert.equal(JSON.stringify(sample),copy);});
test('reject malformed root and oversized input',()=>{assert.throws(()=>run(null));assert.throws(()=>run([]));assert.throws(()=>run({...sample,oversized:'x'.repeat(200001)}));});

test('response mode reports lost presence guarantees',()=>{
 const a={route:'GET /x',fields:{id:'string'},required:['id']};
 const b={...a,required:[]};
 assert.equal(run({mode:'response',before:[a],after:[b]}).rows[0].issue,'required response field became optional');
 assert.equal(run({mode:'request',before:[a],after:[b]}).metrics.breakingSignals,0);
});
test('new required response fields do not trigger request-only signals',()=>{
 assert.equal(run({...sample,mode:'response'}).metrics.breakingSignals,1);
 assert.equal(run({...sample,mode:'request'}).metrics.breakingSignals,2);
});
test('removed response fields produce one removal signal rather than a duplicate optionality signal',()=>{
 const before=[{route:'GET /x',fields:{id:'string'},required:['id']}];
 const after=[{route:'GET /x',fields:{},required:[]}];
 const r=run({mode:'response',before,after});
 assert.equal(r.rows.length,1);assert.equal(r.rows[0].afterType,null);
});
test('duplicate required declarations do not inflate signal counts',()=>{
 const a={route:'x',fields:{id:'number'},required:[]};
 assert.equal(run({before:[a],after:[{...a,required:['id','id']}]}).metrics.breakingSignals,1);
});
test('type labels must be strings and modes must be explicit supported values',()=>{
 for(const type of [null,{},1,''])assert.throws(()=>run({before:[{route:'x',fields:{id:type},required:[]}],after:[]}));
 for(const mode of [null,'both',''])assert.throws(()=>run({...sample,mode}));
});
test('all requiredness pairs follow the selected direction',()=>{
 for(const oldRequired of [false,true])for(const newRequired of [false,true])for(const mode of ['request','response']){
 const contract=required=>({route:'x',fields:{id:'string'},required:required?['id']:[]});
 const r=run({mode,before:[contract(oldRequired)],after:[contract(newRequired)]});
 assert.equal(r.metrics.breakingSignals,Number(mode==='request'?!oldRequired&&newRequired:oldRequired&&!newRequired));
 }
});
