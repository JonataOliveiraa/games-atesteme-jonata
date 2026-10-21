const fs = require('fs');
const sharp = require('D:/Documentos/Atesteme Jogos Fund 1/node_modules/sharp');
const root = 'D:/Documentos/Atesteme Jogos Fund 1';
const work = root + '/outputs/operacao-formiga';
const raw = work + '/raw';
const out = root + '/src/assets/games/EF15CO04/operacao-formiga';
fs.mkdirSync(out, {recursive:true}); fs.mkdirSync(work+'/qa', {recursive:true});
const sources = new Map();
const records = {};
async function source(name) {
 if(sources.has(name)) return sources.get(name);
 const {data,info} = await sharp(raw+'/'+name+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height,labels=new Int32Array(w*h),queue=new Int32Array(w*h); let id=0;const components=[];
 for(let p=0;p<w*h;p++) {
  if(labels[p] || data[p*4+3]<128) continue;
  id++; let n=0,e=1;queue[0]=p;labels[p]=id;let x0=w,y0=h,x1=0,y1=0;
  while(n<e) {const v=queue[n++],x=v%w,y=(v/w)|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(const z of [v-1,v+1,v-w,v+w]) {if(z<0||z>=w*h||Math.abs(z%w-x)>1||labels[z]||data[z*4+3]<128)continue;labels[z]=id;queue[e++]=z;}
  } components.push({id,area:e,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1});
 }
 const result={data,w,h,labels,components};sources.set(name,result);return result;
}
async function crop(name,ids) {
 const s=await source(name),c=s.components.filter(c=>ids.includes(c.id));
 const x=Math.min(...c.map(c=>c.x)),y=Math.min(...c.map(c=>c.y));
 const w=Math.max(...c.map(c=>c.x+c.w))-x,h=Math.max(...c.map(c=>c.y+c.h))-y;
 const data=Buffer.alloc(w*h*4);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){let p=(j+y)*s.w+i+x;if(ids.includes(s.labels[p]))s.data.copy(data,(j*w+i)*4,p*4,p*4+4);}
 return {data,w,h,source:name,sourceBox:[x,y,w,h],ids};
}
function clean(data,threshold=24) {for(let p=0;p<data.length;p+=4)if(data[p+3]<threshold){data[p]=data[p+1]=data[p+2]=data[p+3]=0;}return data;}
function box(data,w,h,ox=0,oy=0,cw=w,ch=h){let x0=cw,y0=ch,x1=-1,y1=-1,pixels=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){if(data[((y+oy)*w+x+ox)*4+3]){pixels++;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}return {x:x0,y:y0,width:x1-x0+1,height:y1-y0+1,pixels};}
async function output(name,data,w,h,cw=w,ch=h,details=[]) {
 clean(data); await sharp(data,{raw:{width:w,height:h,channels:4}}).png().toFile(out+'/'+name+'.png');
 const cells=[];for(let y=0;y<h;y+=ch)for(let x=0;x<w;x+=cw){const i=cells.length;cells.push({index:i,box:box(data,w,h,x,y,cw,ch),...details[i]});}
 records[name]={width:w,height:h,cell:[cw,ch],cells};
 for(const [label,color] of [['claro','#f6f3e9'],['escuro','#182637']]){await sharp(out+'/'+name+'.png').flatten({background:color}).resize({width:1152,height:900,fit:'inside',withoutEnlargement:true}).png().toFile(work+'/qa/'+name+'-'+label+'.png');}
 console.log(name,w+'x'+h,JSON.stringify(cells.map(c=>({index:c.index,box:c.box,handCenter:c.handCenter}))));
}
async function repack(name,cell,cols,rows,items) {
 const w=cell*cols,h=cell*rows,canvas=Buffer.alloc(w*h*4),details=[];
 for(let i=0;i<items.length;i++) {
  const a=items[i],c=await crop(a.src||name,a.ids);let dw,dh;
  if(a.size){[dw,dh]=a.size;}else {const k=Math.min((a.maxW||cell*.84)/c.w,(a.maxH||cell*.84)/c.h);dw=Math.round(c.w*k);dh=Math.round(c.h*k);}
  const resized=await sharp(c.data,{raw:{width:c.w,height:c.h,channels:4}}).resize(dw,dh,{fit:'fill',kernel:'lanczos3'}).raw().toBuffer();clean(resized);
  let px=Math.floor((cell-dw)/2),py=a.base!==undefined?a.base-dh+1:Math.floor((cell-dh)/2);
  let image=resized,handCenter;
  if(a.carry){
   // Register palm midpoint to x110 while leaving the lower body centred.
   const centerSource=a.palms.reduce((v,p)=>v+p[0],0)/2;
   const hx=px+(centerSource-c.sourceBox[0])*dw/c.w;
   const delta=110-hx,warped=Buffer.alloc(resized.length);
   for(let y=0;y<dh;y++) {const gy=py+y;const t=Math.max(0,Math.min(1,(gy-60)/60));const shift=delta*(1-t*t*(3-2*t));for(let x=0;x<dw;x++){const sx=x-shift,lo=Math.floor(sx),f=sx-lo;if(lo<0||lo+1>=dw)continue;const p0=(y*dw+lo)*4,p1=p0+4,dst=(y*dw+x)*4,aa=resized[p0+3]*(1-f)+resized[p1+3]*f;warped[dst+3]=Math.round(aa);if(aa)for(let k=0;k<3;k++)warped[dst+k]=Math.round((resized[p0+k]*resized[p0+3]*(1-f)+resized[p1+k]*resized[p1+3]*f)/aa);}}
   image=clean(warped);handCenter=[110,Math.round(py+(a.palms.reduce((v,p)=>v+p[1],0)/2-c.sourceBox[1])*dh/c.h)];
  }
  for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){if(px+x<0||px+x>=cell||py+y<0||py+y>=cell)throw Error('Clipping '+name+' '+i);const from=(y*dw+x)*4,to=(((i/cols|0)*cell+py+y)*w+(i%cols)*cell+px+x)*4;image.copy(canvas,to,from,from+4);}
  details.push({name:a.label,source:c.source+'.png',sourceBox:c.sourceBox,handCenter,base:a.base});
 }
 await output(name,canvas,w,h,cell,cell,details);
}
function polygon(form,a,b,e,cx,cy){return Array.from({length:64},(_,i)=>{let t=i/64*Math.PI*2;return form==='leaf'?[cx-a*Math.cos(t),cy+b*Math.sin(t)*(1+e*Math.cos(t))]:[cx+a*Math.sin(t)*(1+e*Math.cos(t)),cy-b*Math.cos(t)];});}
function interval(poly,v,axis){const hits=[];for(let j=0;j<poly.length;j++){const p=poly[j],q=poly[(j+1)%poly.length];if((p[axis]<=v&&q[axis]>v)||(q[axis]<=v&&p[axis]>v)){let t=(v-p[axis])/(q[axis]-p[axis]);hits.push(p[1-axis]+t*(q[1-axis]-p[1-axis]));}}return hits.length?[Math.min(...hits),Math.max(...hits)]:null;}
async function conform(name,cw,ch,items){
 const canvas=Buffer.alloc(cw*ch*items.length*4),details=[];
 for(let i=0;i<items.length;i++){
  const a=items[i],c=await crop(name,a.ids),poly=polygon(a.form,a.a,a.b,a.e,cw/2,ch/2),axis=a.form==='leaf'?0:1;
  const vmin=Math.min(...poly.map(p=>p[axis])),vmax=Math.max(...poly.map(p=>p[axis])),n=axis===0?c.w:c.h,span=[];
  for(let v=0;v<n;v++){let lo=Infinity,hi=-1;for(let u=0;u<(axis===0?c.h:c.w);u++){let x=axis===0?v:u,y=axis===0?u:v;if(c.data[(y*c.w+x)*4+3]>=128){lo=Math.min(lo,u);hi=Math.max(hi,u);}}span.push(hi<0?null:[lo,hi]);}
  for(let v=0;v<n;v++)if(!span[v]){let k=v;while(k<n&&!span[k])k++;span[v]=k<n?span[k]:span[v-1];}
  const smooth=span.map((p,v)=>{let lo=0,hi=0,weights=0;for(let k=-3;k<=3;k++){const z=Math.max(0,Math.min(n-1,v+k)),weight=4-Math.abs(k);lo+=span[z][0]*weight;hi+=span[z][1]*weight;weights+=weight;}return [lo/weights,hi/weights];});let count=0,missed=0;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
   const v=axis===0?x+.5:y+.5,u=axis===0?y+.5:x+.5,bounds=interval(poly,v,axis);if(!bounds||u<bounds[0]||u>bounds[1])continue;
   let coverage=0;for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){const vv=axis===0?x+(sx+.5)/4:y+(sy+.5)/4,uu=axis===0?y+(sy+.5)/4:x+(sx+.5)/4,ss=interval(poly,vv,axis);if(ss&&uu>=ss[0]&&uu<=ss[1])coverage++;}
   let alpha=Math.round(coverage/16*255);if(alpha<24)continue;
   let sv=Math.max(0,Math.min(n-1,(v-vmin)/(vmax-vmin)*(n-1))),vi=Math.floor(sv),vf=sv-vi,sp=smooth[vi].map((q,k)=>q*(1-vf)+smooth[Math.min(n-1,vi+1)][k]*vf);
   // Inverse contour mapping: sample inside the original outline, stretching only the mismatch in silhouette.
   const su=sp[0]+(u-bounds[0])/(bounds[1]-bounds[0])*(sp[1]-sp[0]);
   let sx=axis===0?sv:su,sy=axis===0?su:sv;
   let ix=Math.max(0,Math.min(c.w-1,Math.round(sx))),iy=Math.max(0,Math.min(c.h-1,Math.round(sy)));
   let spx=(iy*c.w+ix)*4;
   if(c.data[spx+3]<128){let found=false;for(let rad=1;rad<=8&&!found;rad++)for(let dy=-rad;dy<=rad&&!found;dy++)for(let dx=-rad;dx<=rad;dx++){let xx=ix+dx,yy=iy+dy;if(xx>=0&&xx<c.w&&yy>=0&&yy<c.h&&c.data[(yy*c.w+xx)*4+3]>=128){spx=(yy*c.w+xx)*4;found=true;break;}}if(!found)missed++;}
   const dst=(((name==='frutas'?y:i*ch+y)*(name==='frutas'?cw*3:cw))+(name==='frutas'?i*cw+x:x))*4;
   const x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0;let weightSum=0;const rgb=[0,0,0];for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++){const bx=Math.max(0,Math.min(c.w-1,x0+xx)),by=Math.max(0,Math.min(c.h-1,y0+yy)),bp=(by*c.w+bx)*4,ww=(xx?fx:1-fx)*(yy?fy:1-fy)*c.data[bp+3]/255;weightSum+=ww;for(let k=0;k<3;k++)rgb[k]+=c.data[bp+k]*ww;}for(let k=0;k<3;k++)canvas[dst+k]=weightSum?Math.round(rgb[k]/weightSum):c.data[spx+k];canvas[dst+3]=alpha;count++;
  }
  details.push({name:a.label,source:name+'.png',sourceBox:c.sourceBox,polygon:{form:a.form,a:a.a,b:a.b,e:a.e,vertices:64,center:[cw/2,ch/2]},coveredPixels:count,missingSourcePixels:missed});
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+cw+'" height="'+ch+'"><polygon points="'+poly.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="#ff00ff" stroke-width="1"/></svg>';
  await sharp(Buffer.from(svg)).png().toFile(work+'/qa/'+name+'-polygon-'+i+'.png');
 }
 await output(name,canvas,name==='frutas'?cw*3:cw,name==='frutas'?ch:ch*items.length,cw,ch,details);
}
async function main(){
 await repack('formiga',192,4,2,[
  {ids:[1],label:'parada',base:182},{ids:[2],label:'andando A',base:182},{ids:[3],label:'andando B',base:182},
  {src:'formiga-carregando',ids:[1],label:'carregando parada',size:[151,155],base:182,carry:true,palms:[[404,111],[565,120]]},
  {src:'formiga-carregando',ids:[2],label:'carregando A',size:[147,155],base:182,carry:true,palms:[[1101,118],[1270,126]]},
  {src:'formiga-carregando',ids:[3],label:'carregando B',size:[142,155],base:182,carry:true,palms:[[1805,120],[1974,126]]},
  {ids:[5],label:'feliz',base:182},{ids:[6],label:'esforco',base:182}
 ]);
 await repack('amigas',192,4,2,[
  {ids:[4],label:'cochilando',base:182},{ids:[1,5,6],label:'acordando',base:182},{ids:[3],label:'andando A',base:182},{ids:[2],label:'andando B',base:182},
  {src:'amigas-carregando',ids:[2],label:'carregando A',size:[149,155],base:182,carry:true,palms:[[1091,108],[1267,124]]},
  {src:'amigas-carregando',ids:[3],label:'carregando B',size:[147,155],base:182,carry:true,palms:[[1798,110],[1973,124]]},
  {ids:[7],label:'feliz',base:182},{ids:[10],label:'empurrando',base:182}
 ]);
 await repack('rainha',256,3,1,[{ids:[2],label:'calma',base:246},{ids:[3],label:'pedindo',base:246},{ids:[1],label:'feliz',base:246}]);
 await repack('cenario',256,4,2,[{ids:[2],label:'formigueiro',size:[230,125],base:246},{ids:[3],label:'pedra A',size:[200,150],base:246},{ids:[1],label:'pedra B',size:[170,180],base:246},{ids:[4],label:'pedra C',size:[210,130],base:246},{ids:[5],label:'prato',maxW:215,maxH:215},{ids:[7],label:'arbusto',maxW:215,maxH:215,base:246},{ids:[8],label:'tufo',maxW:215,maxH:215,base:246},{ids:[6],label:'dente-de-leao',maxW:215,maxH:215,base:246}]);
 await repack('sujeira',128,4,1,[{ids:[3],label:'gota',maxW:90,maxH:90},{ids:[2,5],label:'terra',maxW:90,maxH:90},{ids:[1],label:'raminho',maxW:110,maxH:110},{ids:[4],label:'petala',maxW:95,maxH:95}]);
 const giant=await crop('folha-gigante',[1]);const g=await sharp(giant.data,{raw:{width:giant.w,height:giant.h,channels:4}}).resize(960,600,{fit:'fill'}).raw().toBuffer();clean(g);const gc=Buffer.alloc(1024*768*4);for(let y=0;y<600;y++)g.copy(gc,((y+84)*1024+32)*4,y*960*4,(y+1)*960*4);await output('folha-gigante',gc,1024,768,1024,768,[{name:'folha gigante',source:'folha-gigante.png',sourceBox:giant.sourceBox}]);
 await conform('frutas',512,512,[{ids:[2],label:'morango',form:'egg',a:185,b:205,e:.22},{ids:[1],label:'laranja',form:'egg',a:230,b:230,e:0},{ids:[3],label:'maca',form:'egg',a:205,b:194,e:.08}]);
 await conform('folhas',1024,640,[{ids:[1],label:'folha verde',form:'leaf',a:400,b:223,e:.12},{ids:[2],label:'folha grande',form:'leaf',a:440,b:260,e:.12}]);
 await sharp(raw+'/jardim.png').resize(1672,941,{fit:'fill'}).flatten({background:'#ffffff'}).removeAlpha().png().toFile(out+'/jardim.png');records.jardim={width:1672,height:941,opaque:true};
 if(fs.existsSync(raw+'/cover-operacao-formiga.png')){await sharp(raw+'/cover-operacao-formiga.png').resize(1672,941,{fit:'fill'}).flatten({background:'#ffffff'}).removeAlpha().png().toFile(out+'/cover-operacao-formiga.png');records['cover-operacao-formiga']={width:1672,height:941,opaque:true};}
 fs.writeFileSync(work+'/qa/measurements.json',JSON.stringify(records,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
