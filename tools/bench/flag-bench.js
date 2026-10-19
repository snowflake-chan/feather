const R=require('@box/mudb/schema');
const S=new R.MuStruct({a:new R.MuFloat64(),b:new R.MuVarint(),c:new R.MuUTF8(''),d:new R.MuBoolean(),e:new R.MuUint32(),f:new R.MuVector(new R.MuFloat32(),3)});
function run(label,fn,n){for(let i=0;i<Math.min(n,20000);i++)fn();const t=process.hrtime.bigint();for(let i=0;i<n;i++)fn();const ns=Number(process.hrtime.bigint()-t)/n;return ns;}
const v=S.clone(S.identity);
const alloc=run('alloc',()=>{const o={a:1,b:2,c:3};return o.a+o.b;},5e6);
const clone=run('clone',()=>S.clone(v),2e6);
const assign=run('assign',()=>S.assign(v,v),2e6);
const eq=run('equal',()=>S.equal(v,v),2e6);
console.log(JSON.stringify({alloc:+alloc.toFixed(1),clone:+clone.toFixed(1),assign:+assign.toFixed(1),equal:+eq.toFixed(1)}));
