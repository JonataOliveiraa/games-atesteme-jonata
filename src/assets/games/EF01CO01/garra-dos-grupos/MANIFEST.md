# Garra dos Grupos — manifesto de assets

Status: **5/5 folhas entregues**.

Medições consideram alfa `> 16`. `base` é o último `y` com alfa dentro da célula;
`footPad = célula - base`; `originX = (dx + w/2) / célula`.

## `itens.png`

- Arquivo: 1024 × 1024 px, RGBA, 670999 bytes.
- Grade: 4 × 4; `frameWidth: 256`, `frameHeight: 256`.
- Escalas da arte bruta: frutas/formas 0.718121; cabo 0.842105; mão-guia
  1.000000 (fonte final 256 × 256, sem resize).
- A folha bruta foi medida inteira antes do recorte. Corridas de colunas: `28–316`,
  `339–626`, `640–925`, `975–1216`; bordas lógicas: `0/314/627/941/1254`.
  As cerejas cruzavam `x=314`; cabo e mão cruzavam a borda horizontal `y=941`.
  Cada componente foi recortado inteiro e centralizado, com ilhas de alfa removidas.
- Cabo: ocupa `y=0–255`; primeira e última scanline são idênticas
  (`sumAbsDiff=0`), portanto a repetição vertical não tem costura.
- Mão-guia: `tipX=91.5`, `tipY=38`; faixa superior real `x=88–95`.
  A célula não contém linhas de clique; elas permanecem responsabilidade do código.
- Células 14 e 15 são integralmente transparentes.

| # | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | apple-red | 33 | 28 | 191 | 199 | 226 | 0.501953 | 30 |
| 1 | apple-yellow | 32 | 29 | 191 | 199 | 227 | 0.498047 | 29 |
| 2 | apple-green | 33 | 28 | 191 | 199 | 226 | 0.501953 | 30 |
| 3 | strawberry | 43 | 25 | 171 | 207 | 231 | 0.501953 | 25 |
| 4 | cherry | 24 | 29 | 208 | 198 | 226 | 0.500000 | 30 |
| 5 | banana | 24 | 32 | 208 | 190 | 221 | 0.500000 | 35 |
| 6 | pear-yellow | 49 | 21 | 158 | 214 | 234 | 0.500000 | 22 |
| 7 | pear-green | 49 | 22 | 158 | 213 | 234 | 0.500000 | 22 |
| 8 | shape-circle | 34 | 33 | 189 | 190 | 222 | 0.501953 | 34 |
| 9 | shape-square | 34 | 37 | 189 | 184 | 220 | 0.501953 | 36 |
| 10 | shape-triangle | 25 | 38 | 206 | 180 | 217 | 0.500000 | 39 |
| 11 | grape-green | 43 | 21 | 171 | 215 | 235 | 0.501953 | 21 |
| 12 | cable | 89 | 0 | 80 | 256 | 255 | 0.503906 | 1 |
| 13 | guide-hand | 75 | 38 | 135 | 180 | 217 | 0.556641 | 39 |
| 14 | reserved-empty | — | — | 0 | 0 | — | — | — |
| 15 | reserved-empty | — | — | 0 | 0 | — | — | — |

Cores GetPixel: vermelho `#EE473A`; amarelo `#FCCA39`; verde `#67BC58`;
neutro das formas `#EDE9E3`; metal do cabo `#A4A4AB`; pele `#FEC795`.

## `maquina.png`

- Arquivo: 1280 × 640 px, RGBA, 554714 bytes.
- Grade: 4 × 2; `frameWidth: 320`, `frameHeight: 320`.
- Escalas por família: garras 0.665025; cadeado 0.547009; laço/gota 0.681934.
  As caixas foram registradas no mesmo retângulo final 268 × 206: `box-back`
  partiu de 427 × 328 e `box-front` de 398 × 322.
- Pivô funcional comum das garras: engate `(160,24)`; centro previsto do item
  em `claw-closed`: `(160,250)`. A mesma escala foi usada em 0/1/2.
- `box-back` e `box-front`: retângulo idêntico `(26,95,268,206)`, base `y=300`.
- O miolo bruto de `box-front` tinha alfa médio 252/255. O miolo final foi
  limitado a 89/255 (34,9%); medição final: média 89, máximo 89. Bordas ficaram
  opacas e as diferenças RGB dos reflexos foram preservadas.
- Pontos soltos entre as linhas foram removidos por componentes conectados.

| # | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | claw-open | 42 | 24 | 236 | 271 | 294 | 0.500000 | 26 |
| 1 | claw-closed | 79 | 24 | 162 | 267 | 290 | 0.500000 | 30 |
| 2 | claw-stuck | 61 | 24 | 200 | 267 | 290 | 0.503125 | 30 |
| 3 | lock | 82 | 64 | 157 | 192 | 255 | 0.501563 | 65 |
| 4 | box-back | 26 | 95 | 268 | 206 | 300 | 0.500000 | 20 |
| 5 | box-front | 26 | 95 | 268 | 206 | 300 | 0.500000 | 20 |
| 6 | ribbon | 26 | 53 | 269 | 215 | 267 | 0.501563 | 53 |
| 7 | color-drop | 81 | 65 | 158 | 189 | 253 | 0.500000 | 67 |

Cores GetPixel: creme da garra `#DFD6CD`; lilás `#C0B8D6`; dourado
`#FBC34F`; vidro traseiro `#E9EAF1`; vidro frontal `#EAEAF0` com alfa 89;
laço lilás `#9F95C1`; gota branca `#FAFAFA`.

## `bandeja.png`

- Arquivo: 768 × 768 px, RGBA, 405699 bytes; peça única, sem grade.
- Caixa alfa final: `dx=60`, `dy=61`, `w=648`, `h=646`, `base=706`,
  `originX=0.500000`, `footPad=62`.
- Caixa bruta: 1100 × 1080. A leve elipse de geração foi corrigida para um
  recorte quadrado antes da redução, preservando o disco circular para o
  achatamento feito pelo runtime. Nenhum corte e nenhuma cor-resposta.
- Cores GetPixel: centro creme `#F5EEE5`; aro/raios lilás `#CDC5D7`;
  contorno azul-marinho `#1E2644`.

## `bg-fliperama.png`

- Arquivo: 1280 × 720 px, RGB opaco, 759440 bytes; cena única, sem grade.
- Escala: `x=0.765550`, `y=0.765143`; nenhum corte. A diferença é somente a
  normalização do bruto 1672 × 941 para o quadro 16:9 exato.
- Quadro opaco completo: `dx=0`, `dy=0`, `w=1280`, `h=720`; origem `(0,0)`.
- Regiões funcionais preservadas no quadro: faixa HUD `y=0–82`; visor
  `x=300–640, y=92–184`; trilho funcional `y=214`; vitrine
  `x=40–900, y=200–700`; nicho direito `x=920–1260`, base próxima de `y=630`.
- Sem garra, cabo, bandeja, itens ou caixinha incorporados.
- Cores GetPixel: topo turquesa `#6ABFD4`; vidro `#ACD2F1`; gabinete creme
  `#FAE9CE`; nicho `#EED9C6`; trilho `#B7AFCD`; visor escuro `#3A4361`.

## `cover-garra-dos-grupos.png`

- Arquivo: 1672 × 941 px, RGB opaco, 1676824 bytes; cena única, sem grade.
- A folha já estava no tamanho final: nenhum resize e nenhum corte. Apenas
  remoção garantida do canal alfa e compressão PNG.
- Composição conferida: título exato **“Garra dos Grupos”** no alto; garra
  central com maçã vermelha; caixa transparente com itens predominantemente
  vermelhos de tipos distintos; bandeja com distratores amarelos, verdes,
  azuis e rosas; nenhum outro texto.
- Quadro opaco completo: `dx=0`, `dy=0`, `w=1672`, `h=941`; origem `(0,0)`.
- Cores GetPixel: vermelho `#F84355`; amarelo `#FDD849`; verde `#6DC966`;
  azul `#3E9FFB`; rosa `#FD99C5`; azul do título `#06C1FE`.
