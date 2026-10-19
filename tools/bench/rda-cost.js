// RDA 模块的真实成本：加载瞬间 vs 活对象 vs 空闲后
'use strict';
const MB=b=>+(b/1048576).toFixed(2);
const mods=[
 ['project/murda-tree','@box/schema/project/murda-tree'],
 ['project/project-rda','@box/schema/project/project-rda'],
];
let fnCalls=0, srcBytes=0;
const OF=Function;
const PF=function(...a){fnCalls++;srcBytes+=(a[a.length-1]||'').length;return OF.apply(null,a);};
PF.apply=OF.apply.bind(OF);
global.Function=PF;
function forceGC(){for(let i=0;i<10;i++)global.gc({execution:'sync',type:'major'});}
forceGC();
const b=process.memoryUsage();
for(const [label,m] of mods){ try{require(m);}catch(e){console.log('  skip',m,e.message.split('\n')[0].slice(0,60));} }
const immediate=process.memoryUsage();
forceGC();
const afterGC=process.memoryUsage();
console.log(`  加载瞬间:   rss +${MB(immediate.rss-b.rss)}  ht +${MB(immediate.heapTotal-b.heapTotal)}  hu +${MB(immediate.heapUsed-b.heapUsed)}`);
console.log(`  强制GC后:   rss +${MB(afterGC.rss-b.rss)}  ht +${MB(afterGC.heapTotal-b.heapTotal)}  hu +${MB(afterGC.heapUsed-b.heapUsed)}   ← 活对象`);
console.log(`  Function(): ${fnCalls} 次, 源码 ${(srcBytes/1024).toFixed(0)} KB`);
setTimeout(()=>{
  const late=process.memoryUsage();
  console.log(`  等 10s 后:  rss +${MB(late.rss-b.rss)}  ht +${MB(late.heapTotal-b.heapTotal)}  hu +${MB(late.heapUsed-b.heapUsed)}   ← 不强制GC`);
  process.exit(0);
},10000);
