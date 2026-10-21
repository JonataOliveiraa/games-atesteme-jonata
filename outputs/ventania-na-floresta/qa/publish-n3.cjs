const {components,sharp,fs,path,root,out,assets,crypto}=require('./process-n3.cjs');
const gen='C:/Users/teste123/.codex/generated_images/01a15e79-b93d-7cb3-b587-5e9d48485ab4';
const files={
 'bg-lagoa':'exec-fe982ec6-b8ea-45bc-906e-12a2eded2f52.png',
 'bg-noite':'exec-c8e8e18f-aed4-4524-bba6-b3553953a5e6.png',
 turma:'exec-913218e8-3bd5-4305-9087-df5939f5ddb8.png',
 peixes:'exec-a669d162-fe56-4b8c-9a3a-ddeb1d349582.png'
};
function bbox(d,w,h,t=96){let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>t){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return x1<0?null:[x0,y0,x1-x0+1,y1-y0+1];}
function rgbHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,l=(mx+mn)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,s,l];}
function hslRgb(h,s,l){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let v=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return v.map(a=>Math.round((a+m)*255));}
function remapPixel(rgb,target,src){const [h,s,l]=rgbHsl(...rgb),[th,ts,tl]=rgbHsl(...target),[sh,ss,sl]=rgbHsl(...src);if(l<.12||s<.18)return rgb;const nl=Math.max(.05,Math.min(.94,tl+(l-sl)*.85));return hslRgb(th,Math.min(1,ts*(s/ss)),nl);}
async function isolate(file,cols,rows){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const cc=components(data,info.width,info.height).filter(c=>c.area>1000);
 if(cc.length!==cols*rows)throw Error('Unexpected major component count: '+cc.length);
 // The generated layouts drift across nominal cell lines. Sort intact connected pieces by rows, then x.
 cc.sort((a,b)=>(a.y+a.h/2)-(b.y+b.h/2));
 const ordered=[];for(let row=0;row<rows;row++)ordered.push(...cc.slice(row*cols,(row+1)*cols).sort((a,b)=>a.x-b.x));
 return ordered.map(c=>{
  const d=Buffer.alloc(c.w*c.h*4);for(const i of c.pixels){const x=i%info.width-c.x,y=Math.floor(i/info.width)-c.y,j=(y*c.w+x)*4;data.copy(d,j,i*4,i*4+3);d[j+3]=255;}
  const {pixels,...source}=c;return {data:d,w:c.w,h:c.h,source};
 });
}
async function fit(piece,base=false){
 const k=Math.min(215/piece.w,215/piece.h),w=Math.round(piece.w*k),h=Math.round(piece.h*k);
 const {data}=await sharp(piece.data,{raw:{width:piece.w,height:piece.h,channels:4}}).resize(w,h,{kernel:'lanczos3'}).raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<data.length;i+=4)if(data[i+3]<48)data.fill(0,i,i+4);
 const b=bbox(data,w,h),x=Math.round((256-b[2])/2)-b[0],y=(base?236-b[3]:Math.round((256-b[3])/2))-b[1];
 const cell=Buffer.alloc(256*256*4);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(xx+x>=0&&xx+x<256&&yy+y>=0&&yy+y<256)data.copy(cell,((yy+y)*256+xx+x)*4,(yy*w+xx)*4,(yy*w+xx)*4+4);
 return {data:cell,box:bbox(cell,256,256),source:piece.source};
}
function cloneRecolor(piece,fn){const d=Buffer.from(piece.data);for(let y=0;y<piece.h;y++)for(let x=0;x<piece.w;x++){let i=(y*piece.w+x)*4;if(!d[i+3])continue;const rgb=fn([...d.subarray(i,i+3)],x,y);for(let c=0;c<3;c++)d[i+c]=rgb[c];}return {...piece,data:d};}
function palette(rgb,target,anchor=.64,sourceS=.85){
 const [h,s,l]=rgbHsl(...rgb);if(s<.20||l>.94)return rgb;
 if(l>=anchor-.025&&l<=anchor+.025&&s>.30)return target;
 const [th,ts,tl]=rgbHsl(...target);
 return hslRgb(th,Math.min(1,ts*(s/sourceS)),Math.max(.10,Math.min(.95,tl+(l-anchor)*.80)));
}
async function saveSheet(name,cells,cols,rows){
 const d=Buffer.alloc(cols*256*rows*256*4);const W=cols*256;
 for(let i=0;i<cells.length;i++){const cx=i%cols*256,cy=Math.floor(i/cols)*256;for(let y=0;y<256;y++)cells[i].data.copy(d,((cy+y)*W+cx)*4,y*256*4,(y+1)*256*4);}
 const dest=path.join(out,'qa',name+'-final.png');
 await sharp(d,{raw:{width:W,height:rows*256,channels:4}}).png().toFile(dest);
 for(const [suffix,bg] of [['claro','#F5F0E8'],['escuro','#182238']])await sharp({create:{width:W,height:rows*256,channels:3,background:bg}}).composite([{input:dest}]).png().toFile(path.join(out,'qa',name+'-'+suffix+'-n3.png'));
 return cells.map((c,i)=>({index:i,box:c.box,source:c.source}));
}
async function main(){
 for(const [name,file]of Object.entries(files)){const dest=path.join(out,'raw',name+'.png');if(!fs.existsSync(dest))fs.copyFileSync(path.join(gen,file),dest);}
 for(const [name,file]of [['peixes-v1', 'exec-843d8b4a-c96d-4395-a224-a507207b29da.png'],['bg-noite-v1','exec-78d6555f-085d-4dae-92ca-28a8bc7b10f2.png']]){const dest=path.join(out,'raw',name+'.png');if(!fs.existsSync(dest))fs.copyFileSync(path.join(gen,file),dest);}
 for(const name of ['bg-lagoa','bg-noite'])await sharp(path.join(out,'raw',name+'.png')).resize(1672,941).removeAlpha().png().toFile(path.join(out,'qa',name+'-final.png'));
 const turma=await isolate(path.join(out,'raw/turma.png'),4,4);
 // Paired mushrooms and the four fireflies share the same drawing, as required by the contract.
 const red=[232,87,74],blue=[90,169,240];
 for(const i of [4,6]){
  const original=turma[i+1];
  const cap=(rgb,x,y,target)=>{const [h,s,l]=rgbHsl(...rgb);return s>.25&&h>185&&h<255?palette(rgb,target,.65,.85):rgb;};
  turma[i]=cloneRecolor(original,(rgb,x,y)=>cap(rgb,x,y,red));
  turma[i+1]=cloneRecolor(original,(rgb,x,y)=>cap(rgb,x,y,blue));
 }
 const lightColors=[[255,228,92],[143,240,106],[111,210,255],[255,143,210]],firefly=turma[8];
 for(let k=0;k<4;k++)turma[8+k]=cloneRecolor(firefly,(rgb,x,y)=>{const [h,s,l]=rgbHsl(...rgb);const belly=x>firefly.w*.27&&x<firefly.w*.67&&y>firefly.h*.57;const tips=y<firefly.h*.23;return (belly||tips)&&h>35&&h<75&&s>.30?palette(rgb,lightColors[k],.66):rgb;});
 for(const i of [13,14])turma[i]=cloneRecolor(turma[i],rgb=>{const [h,s,l]=rgbHsl(...rgb);return l<.91?[138,144,149]:rgb;});
 const turmaCells=[];for(let i=0;i<16;i++)turmaCells.push(await fit(turma[i],i<3));
 const fish=await isolate(path.join(out,'raw/peixes.png'),3,3);
 // Save canonical clean fish for the color-mask inspection before any palette conversion.
 await sharp(fish[0].data,{raw:{width:fish[0].w,height:fish[0].h,channels:4}}).flatten({background:'#ffffff'}).png().toFile(path.join(out,'qa/peixe-canonico.png'));
 const colors=[[240,138,60],[93,187,99],[155,123,216]],canonical=fish[1],fishCells=[];
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  const variant=cloneRecolor(canonical,(rgb,x,y)=>{
   const [h,s,l]=rgbHsl(...rgb);
   // Eye/iris, mouth and pink cheek keep their original colors. The source has orange body, green tail.
   if(((x-96)/24)**2+((y-181)/17)**2<1)return rgb;
   if(s>.22&&h>68&&h<155)return palette(rgb,colors[col],.58,.45);
   if(s>.22&&h>=15&&h<=60)return palette(rgb,colors[row],.61,.90);
   return rgb;
  });
  fishCells.push(await fit(variant));
 }
 const measurements={turma:await saveSheet('turma',turmaCells,4,4),peixes:await saveSheet('peixes',fishCells,3,3)};
 fs.writeFileSync(path.join(out,'qa/medidas-n3.json'),JSON.stringify(measurements,null,2));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exit(1)});
module.exports={bbox,rgbHsl,hslRgb,remapPixel,isolate,fit,saveSheet,files};
