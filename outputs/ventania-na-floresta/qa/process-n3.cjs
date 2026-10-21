const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../../..');
const out = path.join(root,'outputs/ventania-na-floresta');
const assets = path.join(root,'src/assets/games/EF15CO01/ventania-na-floresta');
function components(data,w,h,threshold=159) {
 const seen=new Uint8Array(w*h), result=[];
 for(let i=0;i<w*h;i++) {
  if(seen[i] || data[i*4+3]<=threshold) continue;
  const q=[i]; seen[i]=1; let x0=w,y0=h,x1=0,y1=0;
  for(let j=0;j<q.length;j++) {
   const p=q[j],x=p%w,y=Math.floor(p/w); x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(const n of [x? p-1:-1,x<w-1?p+1:-1,y?p-w:-1,y<h-1?p+w:-1]) if(n>=0&&!seen[n]&&data[n*4+3]>threshold){seen[n]=1;q.push(n);}
  }
  result.push({x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,area:q.length,pixels:q});
 }
 return result;
}
async function main(){
 const f=process.argv[2];
 const {data,info}=await sharp(f).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const cc=components(data,info.width,info.height).filter(c=>c.area>100);
 console.log(JSON.stringify({file:f,info,components:cc.map(({pixels,...c})=>c)},null,2));
}
if(require.main===module)main();
module.exports={components,sharp,fs,path,root,out,assets,crypto};
