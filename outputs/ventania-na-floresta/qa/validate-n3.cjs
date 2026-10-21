const {fs,path,sharp,out,assets,crypto,components}=require('./process-n3.cjs');
const {bbox}=require('./publish-n3.cjs');
const assert=require('assert/strict');
async function main(){
 const result={date:'2026-10-21',threshold:96,sheets:{},backgrounds:{},prior_pngs_unchanged:[],checks:[]};
 const prior=JSON.parse(fs.readFileSync(path.join(out,'qa/pre-n3-hashes.json')));
 for(const [name,hash]of Object.entries(prior)){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(assets,name))).digest('hex'),hash,name+' modified');result.prior_pngs_unchanged.push(name);}
 const colors=[[240,138,60],[93,187,99],[155,123,216]];
 let canonicalAlpha;
 for(const [name,cols,rows]of [['turma',4,4],['peixes',3,3]]){
  const {data,info}=await sharp(path.join(out,'qa',name+'-final.png')).raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,cols*256);assert.equal(info.height,rows*256);assert.equal(info.channels,4);
  let low=0,hidden=0;for(let i=0;i<data.length;i+=4){if(data[i+3]>0&&data[i+3]<48)low++;if(!data[i+3]&&(data[i]||data[i+1]||data[i+2]))hidden++;}assert.equal(low,0);assert.equal(hidden,0);
  const cells=[];for(let index=0;index<cols*rows;index++){
   const cell=Buffer.alloc(256*256*4);for(let y=0;y<256;y++)data.copy(cell,y*256*4,((Math.floor(index/cols)*256+y)*info.width+index%cols*256)*4,((Math.floor(index/cols)*256+y)*info.width+index%cols*256+256)*4);
   const box=bbox(cell,256,256),cc=components(cell,256,256,96);assert(box);assert(box[0]>=20&&box[1]>=20&&box[0]+box[2]<=237&&box[1]+box[3]<=237);assert.equal(cc.filter(c=>c.area<4).length,0);
   if(name==='turma'&&index<3)assert.equal(box[1]+box[3]-1,235);
   const entry={index,box,lastY:box[1]+box[3]-1,components:cc.map(c=>c.area)};
   if(name==='peixes'){
    const alpha=Buffer.alloc(65536);for(let i=0;i<65536;i++)alpha[i]=cell[i*4+3];if(index===0)canonicalAlpha=alpha;else assert(alpha.equals(canonicalAlpha),'fish silhouette mismatch');
    const body=colors[Math.floor(index/3)],tail=colors[index%3];let bodyPixels=0,tailPixels=0;
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){let j=(y*256+x)*4;if(x<165&&body.every((v,c)=>cell[j+c]===v))bodyPixels++;if(x>170&&tail.every((v,c)=>cell[j+c]===v))tailPixels++;}
    assert(bodyPixels>100);assert(tailPixels>100);entry.exactBodyPixels=bodyPixels;entry.exactTailPixels=tailPixels;entry.bodyHex='#'+body.map(c=>c.toString(16).padStart(2,'0')).join('');entry.tailHex='#'+tail.map(c=>c.toString(16).padStart(2,'0')).join('');
   }
   if(name==='turma'&&(index===13||index===14)){let exactGray=0;for(let i=0;i<cell.length;i+=4)if(cell[i]===138&&cell[i+1]===144&&cell[i+2]===149)exactGray++;assert(exactGray>5000);entry.exactGrayPixels=exactGray;}
   cells.push(entry);
  }
  result.sheets[name]={width:info.width,height:info.height,lowAlphaPixels:low,hiddenRGBPixels:hidden,cells};
 }
 for(const name of ['bg-lagoa','bg-noite']){const info=await sharp(path.join(out,'qa',name+'-final.png')).metadata();assert.equal(info.width,1672);assert.equal(info.height,941);assert.equal(info.channels,3);assert.equal(info.hasAlpha,false);result.backgrounds[name]={width:1672,height:941,channels:3};}
 result.checks=['25 células com arte; ordem conferida visualmente','pata e patinho à esquerda; caracol à direita; todos os peixes à esquerda','pedra sem escrita; ícones 13 e 14 cinza','peixes: linha=corpo, coluna=rabo; hex exatos verificados separadamente','nove silhuetas/posições de peixes idênticas','fundos sem animais; noite sem vaga-lumes ou luzes na clareira','alfa 1–47 ausente; alfa 0 com RGB 0; margens e bases verificadas'];
 fs.writeFileSync(path.join(out,'qa/validation-n3.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({cells:25,priorUnchanged:result.prior_pngs_unchanged.length,fish:result.sheets.peixes.cells.map(c=>({index:c.index,box:c.box,body:c.exactBodyPixels,tail:c.exactTailPixels}))},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
