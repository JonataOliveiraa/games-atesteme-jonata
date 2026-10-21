const {fs,path,sharp,out}=require('./process-n3.cjs');
function maxrect(data,W,H,predicate,region){
 const [x0,y0,rw,rh]=region,heights=new Uint16Array(rw);let best=[0,0,0,0],area=0;
 for(let y=y0;y<y0+rh;y++){
  for(let x=0;x<rw;x++){const i=(y*W+x+x0)*3;heights[x]=predicate(data[i],data[i+1],data[i+2])?heights[x]+1:0;}
  const stack=[];for(let x=0;x<=rw;x++){const h=x===rw?0:heights[x];let start=x;while(stack.length&&stack.at(-1)[1]>h){const [sx,sh]=stack.pop();if((x-sx)*sh>area){area=(x-sx)*sh;best=[x0+sx,y-sh+1,x-sx,sh];}start=sx;}if(h&&(!stack.length||stack.at(-1)[1]<h))stack.push([start,h]);}
 }return best;
}
async function main(){
 const result={scale:[1280,720],method:'Retângulos contidos na superfície por segmentação de cor a 1280x720, conferidos visualmente; caixas úteis conservadoras, tolerância visual de 5–10 px.',regions:{}};
 for(const name of ['bg-lagoa','bg-noite']){
  const {data,info}=await sharp(path.join(out,'qa',name+'-final.png')).resize(1280,720).removeAlpha().raw().toBuffer({resolveWithObject:true});
  if(name==='bg-noite')result.regions.clareira=maxrect(data,1280,720,(r,g,b)=>r>=26&&r<=39&&g>=44&&g<=64&&b>=88&&b<=119,[256,108,768,468]);
  else{
   result.regions.agua=maxrect(data,1280,720,(r,g,b)=>(b>r+15&&g>r+20&&b>=g*.94)||(r>225&&g>235&&b>235),[128,125,1024,350]);
   result.regions.areia=maxrect(data,1280,720,(r,g,b)=>r>215&&g>160&&g<r&&b<g*.94,[128,450,1024,270]);
  }
 }
 fs.writeFileSync(path.join(out,'qa/cenarios-n3-1280x720.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
 for(const [name,regions]of [['bg-lagoa',['agua','areia']],['bg-noite',['clareira']]]){
  const shapes=regions.map((k,i)=>{const [x,y,w,h]=result.regions[k];return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${i?'#ee247d':'#fbdf40'}" stroke-width="3"/><text x="${x+8}" y="${y+22}" fill="#ffffff" stroke="#172238" stroke-width=".7" font-size="18" font-family="Arial">${k} (${x},${y},${w},${h})</text>`;}).join('');
  await sharp(path.join(out,'qa',name+'-final.png')).resize(1280,720).composite([{input:Buffer.from(`<svg width="1280" height="720">${shapes}</svg>`)}]).png().toFile(path.join(out,'qa',name+'-coordenadas-1280x720.png'));
 }
}
main();
