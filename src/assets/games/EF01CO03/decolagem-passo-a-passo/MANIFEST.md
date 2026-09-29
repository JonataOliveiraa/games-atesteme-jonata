# Decolagem Passo a Passo — manifesto de assets

Medição: caixa alfa com `alpha > 16`; `base` é o último y ocupado (inclusivo); `originX = (dx + w/2) / célula`; `footPad = célula - base`. Fontes cruas medidas integralmente antes do recorte: ambas 1254×1254 px.

## `cartoes.png`

- Tamanho: 1024×1024 px, PNG RGBA, grade 4×4, `frameWidth=256`, `frameHeight=256`.
- Reempacotamento: ícones 0–8 em escala única `0.750000`; cartão/vaga em escala única `0.845070` (240/284); mão-guia em `0.680000`. Sem upscale.
- Limpeza: as faixas soltas entre fileiras ficaram fora das caixas alfa recortadas. Células 12–15 são 100% transparentes.
- Ponta do dedo: âncora `tipX=128`, `tipY=20`; a primeira linha alfa ocupa x=128–129 (centro medido 128,5).

| quadro | nome | conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | `icon-fuel` | abastecer | 17 | 47 | 222 | 163 | 209 | 0.500000 | 47 |
| 1 | `icon-door` | fechar a porta | 27 | 21 | 203 | 215 | 235 | 0.501953 | 21 |
| 2 | `icon-button` | apertar o botão | 22 | 35 | 212 | 187 | 221 | 0.500000 | 35 |
| 3 | `icon-fill` | encher o balão | 19 | 32 | 218 | 193 | 224 | 0.500000 | 32 |
| 4 | `icon-basket` | prender a cesta | 53 | 16 | 150 | 224 | 239 | 0.500000 | 17 |
| 5 | `icon-ropes` | soltar as cordas | 29 | 54 | 199 | 148 | 201 | 0.501953 | 55 |
| 6 | `icon-knot` | amarrar a linha | 23 | 19 | 210 | 219 | 237 | 0.500000 | 19 |
| 7 | `icon-run` | correr | 21 | 53 | 215 | 151 | 203 | 0.501953 | 53 |
| 8 | `icon-release` | soltar a pipa | 27 | 22 | 203 | 212 | 233 | 0.501953 | 23 |
| 9 | `card` | corpo do cartão | 8 | 54 | 240 | 148 | 201 | 0.500000 | 55 |
| 10 | `slot` | vaga da régua | 9 | 54 | 239 | 148 | 201 | 0.501953 | 55 |
| 11 | `guide-hand` | dedo do guia | 115 | 20 | 141 | 175 | 194 | 0.724609 | 62 |
| 12 | — | vazia | — | — | 0 | 0 | — | — | — |
| 13 | — | vazia | — | — | 0 | 0 | — | — | — |
| 14 | — | vazia | — | — | 0 | 0 | — | — | — |
| 15 | — | vazia | — | — | 0 | 0 | — | — | — |

Observação: cartão e vaga usam o mesmo recorte e a mesma escala; a diferença de 1 px na caixa medida de alfa da vaga é somente a franja antialias (`alpha > 16`). Em `alpha > 8`, ambos medem exatamente 240×148.

## `cena.png`

- Tamanho: 1280×1280 px, PNG RGBA, grade 4×4, `frameWidth=320`, `frameHeight=320`.
- Reempacotamento: escala única da família `1.000000` (sem upscale); centro em x≈160 e base comum. Componentes que cruzavam células na folha crua foram recuperados inteiros antes do reempacotamento.
- Limpeza: componentes alfa foram medidos na folha inteira; ilhas sem vínculo espacial com a peça foram removidas. Gotas, bolhas de fumaça, poeira e as duas estacas foram preservadas como partes legítimas.

| quadro | nome | conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | `rocket-open` | foguete com porta aberta | 35 | 0 | 250 | 311 | 310 | 0.500000 | 10 |
| 1 | `rocket-closed` | foguete com porta fechada | 38 | 0 | 244 | 311 | 310 | 0.500000 | 10 |
| 2 | `pump-empty` | bomba com medidor vazio | 44 | 45 | 233 | 266 | 310 | 0.501563 | 10 |
| 3 | `pump-full` | bomba com medidor cheio | 44 | 44 | 233 | 267 | 310 | 0.501563 | 10 |
| 4 | `flame` | chama do motor | 92 | 46 | 136 | 265 | 310 | 0.500000 | 10 |
| 5 | `smoke` | fumaça | 21 | 82 | 279 | 229 | 310 | 0.501563 | 10 |
| 6 | `splash` | jato/respingo | 69 | 44 | 183 | 267 | 310 | 0.501563 | 10 |
| 7 | `dust` | poeira | 27 | 112 | 266 | 199 | 310 | 0.500000 | 10 |
| 8 | `balloon-flat` | balão murcho | 15 | 198 | 291 | 113 | 310 | 0.501563 | 10 |
| 9 | `balloon-full` | balão cheio | 38 | 27 | 245 | 284 | 310 | 0.501563 | 10 |
| 10 | `basket` | cesta | 30 | 135 | 260 | 176 | 310 | 0.500000 | 10 |
| 11 | `stakes` | estacas com cordas | 21 | 65 | 278 | 246 | 310 | 0.500000 | 10 |
| 12 | `kite-ground` | pipa no chão, sem linha | 30 | 117 | 260 | 194 | 310 | 0.500000 | 10 |
| 13 | `kite-tied` | pipa com linha e carretel | 21 | 108 | 278 | 203 | 310 | 0.500000 | 10 |
| 14 | `kite-fly` | pipa voando | 28 | 11 | 264 | 300 | 310 | 0.500000 | 10 |
| 15 | `control-box` | caixa com botão | 34 | 123 | 253 | 188 | 310 | 0.501563 | 10 |

## `crianca.png`

- Tamanho: 1152×768 px, PNG RGBA, grade 3×2, `frameWidth=384`, `frameHeight=384`.
- Fonte: 1536×1024 px, células cruas 512×512.
- Limpeza do halo: alfa bruto `<=96` zerado; alfa restante remapeado até 255; defringe dos pixels de borda pela cor vizinha de maior cobertura. O contorno escuro foi preservado.
- Reempacotamento: escala única da família `0.720000`, centro por caixa alfa e pés em `base=360`.

| quadro | nome | pose | dx | dy | w | h | base | originX | footPad |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | `kid-idle` | parada, sorrindo | 117 | 2 | 151 | 359 | 360 | 0.501302 | 24 |
| 1 | `kid-cheer` | braços para cima | 78 | 3 | 228 | 358 | 360 | 0.500000 | 24 |
| 2 | `kid-run` | correndo de lado | 74 | 9 | 237 | 352 | 360 | 0.501302 | 24 |
| 3 | `kid-sooty` | fuligem, tossindo | 106 | 3 | 173 | 358 | 360 | 0.501302 | 24 |
| 4 | `kid-oops` | surpresa | 120 | 12 | 144 | 349 | 360 | 0.500000 | 24 |
| 5 | `kid-wave` | acenando para cima | 80 | 7 | 224 | 354 | 360 | 0.500000 | 24 |

## `faixa.png`

- Tamanho: 1024×256 px, PNG RGBA, quadro único (`frameWidth=1024`, `frameHeight=256`).
- Fonte: 1983×793 px. Mantido somente o componente alfa principal; pontinhos soltos removidos; escala `0.481928`, sem upscale.
- Caixa alfa: `dx=53`, `dy=9`, `w=919`, `h=238`, `base=246`, `originX=0.500488`, `footPad=10`.
- Miolo confirmado vazio, sem texto.

## `bg-base.png`

- Tamanho: 1280×720 px, PNG RGB opaco, sem grade.
- Fonte: 1672×941 px; redução Lanczos3 para o tamanho de uso, sem upscale.

## `cover-decolagem-passo-a-passo.png`

- Tamanho: 1672×941 px, PNG RGB opaco, sem grade.
- Otimização lossless de PNG; dimensões e composição preservadas.
- Título conferido: **Decolagem Passo a Passo**.

## Cores amostradas (`GetPixel`)

Coordenadas abaixo são globais na respectiva folha final.

| arquivo | amostra | x,y | RGBA | hex para `Graphics` |
|---|---|---:|---|---|
| `cartoes.png` | creme do cartão | 384,640 | 251,241,217,254 | `#FBF1D9` |
| `cartoes.png` | creme da vaga | 640,640 | 243,221,182,253 | `#F3DDB6` |
| `cartoes.png` | verde-folha | 728,188 | 105,145,58,253 | `#69913A` |
| `cartoes.png` | azul-ardósia | 400,162 | 16,86,152,253 | `#105698` |
| `cena.png` | creme do foguete | 100,120 | 250,231,198,253 | `#FAE7C6` |
| `cena.png` | terracota do foguete | 160,30 | 228,103,53,253 | `#E46735` |
| `cena.png` | creme da bomba | 790,110 | 252,233,195,253 | `#FCE9C3` |
| `cena.png` | azul do balão | 480,740 | 75,138,197,252 | `#4B8AC5` |
| `cena.png` | castanho da cesta | 800,850 | 146,83,30,252 | `#92531E` |
| `cena.png` | areia da poeira | 1120,520 | 251,209,158,253 | `#FBD19E` |
| `cena.png` | amarelo do botão | 1120,1125 | 252,206,51,252 | `#FCCE33` |
| `crianca.png` | pele | 192,100 | 244,138,67,253 | `#F48A43` |
| `crianca.png` | azul do macacão | 192,210 | 40,95,136,253 | `#285F88` |
| `crianca.png` | castanho do cabelo | 192,35 | 77,43,27,253 | `#4D2B1B` |
| `faixa.png` | creme | 512,100 | 250,234,206,253 | `#FAEACE` |
| `faixa.png` | terracota | 512,18 | 220,114,74,253 | `#DC724A` |
| `faixa.png` | azul-ardósia | 512,27 | 93,128,153,253 | `#5D8099` |
| `bg-base.png` | céu | 640,100 | 123,182,238,255 | `#7BB6EE` |
| `bg-base.png` | grama | 640,600 | 153,163,57,255 | `#99A339` |
| `cover-decolagem-passo-a-passo.png` | amarelo do título | 800,80 | 251,207,57,255 | `#FBCF39` |
| `cover-decolagem-passo-a-passo.png` | azul do título | 650,240 | 85,180,251,255 | `#55B4FB` |
| `cover-decolagem-passo-a-passo.png` | terracota do título | 1050,250 | 250,118,55,255 | `#FA7637` |

## `cartoes-2.png`

- Tamanho: 1024×512 px, PNG RGBA, grade 4×2, `frameWidth=256`, `frameHeight=256`.
- Fonte: 1774×887 px; a folha inteira foi medida por corridas de colunas antes do recorte.
- Reempacotamento: escala única da família `0.520000`, sem upscale; cada pictograma foi centrado pela caixa alfa. A célula 7 é 100% transparente.
- Limpeza: removido um ponto isolado de 1 px na mão de contagem; os quatro traços separados do movimento do guarda-chuva foram preservados.

| quadro | nome | conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | `icon-count` | mão com 3 dedos levantados | 71 | 28 | 116 | 201 | 228 | 0.503906 | 28 |
| 1 | `icon-umbrella` | guarda-chuva abrindo | 17 | 28 | 224 | 201 | 228 | 0.503906 | 28 |
| 2 | `icon-toothbrush` | escova de dentes com pasta | 24 | 48 | 209 | 161 | 208 | 0.501953 | 48 |
| 3 | `icon-icecream` | casquinha de sorvete | 65 | 34 | 127 | 190 | 223 | 0.501953 | 33 |
| 4 | `icon-helmet` | capacete de astronauta | 35 | 42 | 187 | 174 | 215 | 0.501953 | 41 |
| 5 | `icon-climb` | pé subindo na cesta | 33 | 25 | 192 | 207 | 231 | 0.503906 | 25 |
| 6 | `icon-tail` | rabiola sendo amarrada | 27 | 23 | 204 | 212 | 234 | 0.503906 | 22 |
| 7 | — | vazia | — | — | 0 | 0 | — | — | — |

## `cena-2.png`

- Tamanho: 960×640 px, PNG RGBA, grade 3×2, `frameWidth=320`, `frameHeight=320`.
- Fonte: 1254×1254 px, com conteúdo 3×2. A folha inteira foi medida por corridas: guarda-chuva e capacete cruzavam as bordas teóricas, por isso os seis objetos foram tratados como componentes inteiros e reempacotados sem esticar.
- Escala da família de cena: `1.000000` em relação a `cena.png`. A conversão dos componentes crus 0–3 usa redução única `0.500000`, sem upscale, com centro x=160 e base=310.
- Pipas 4/5: corpos derivados 1:1 dos quadros 12/13 de `cena.png`, removendo somente a rabiola. Corpo, ângulo, escala e posição dentro da célula permanecem idênticos ao respectivo quadro N1; use o mesmo pivô geométrico da célula (`x=160`) na troca de estado. O `originX` alfa abaixo muda porque a rabiola deixou de fazer parte da caixa, não porque o corpo foi recentrado.
- Limpeza: nenhum componente solto permaneceu; linha e carretel legítimos do quadro 5 foram preservados.

| quadro | nome | conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | `umbrella` | guarda-chuva aberto | 42 | 61 | 237 | 250 | 310 | 0.501563 | 10 |
| 1 | `toothbrush` | escova com espuma | 106 | 60 | 109 | 251 | 310 | 0.501563 | 10 |
| 2 | `icecream` | sorvete com gota | 92 | 83 | 138 | 228 | 310 | 0.503125 | 10 |
| 3 | `helmet` | capacete frontal | 55 | 119 | 211 | 192 | 310 | 0.501563 | 10 |
| 4 | `kite-bare` | pipa sem rabiola, deitada, sem linha | 78 | 117 | 212 | 112 | 228 | 0.575000 | 92 |
| 5 | `kite-bare-tied` | pipa sem rabiola, com linha e carretel | 60 | 107 | 239 | 204 | 310 | 0.560938 | 10 |

## Cores amostradas das folhas N2/N3 (`GetPixel`)

Coordenadas abaixo são globais na respectiva folha final.

| arquivo | amostra | x,y | RGBA | hex para `Graphics` |
|---|---|---:|---|---|
| `cartoes-2.png` | pele da mão | 128,100 | 251,185,130,254 | `#FBB982` |
| `cartoes-2.png` | verde do punho | 128,210 | 117,156,62,253 | `#759C3E` |
| `cartoes-2.png` | amarelo do guarda-chuva | 350,85 | 252,193,39,254 | `#FCC127` |
| `cartoes-2.png` | azul do guarda-chuva | 430,110 | 37,122,194,254 | `#257AC2` |
| `cartoes-2.png` | vermelho da escova | 590,180 | 200,39,30,253 | `#C8271E` |
| `cartoes-2.png` | creme do sorvete | 896,90 | 250,232,195,254 | `#FAE8C3` |
| `cartoes-2.png` | vime da cesta | 384,430 | 205,130,55,253 | `#CD8237` |
| `cena-2.png` | azul do guarda-chuva | 160,100 | 53,129,202,253 | `#3581CA` |
| `cena-2.png` | verde da escova | 480,200 | 50,145,20,253 | `#329114` |
| `cena-2.png` | espuma | 490,80 | 233,244,250,253 | `#E9F4FA` |
| `cena-2.png` | creme do sorvete | 800,140 | 252,236,197,253 | `#FCECC5` |
| `cena-2.png` | castanho da casquinha | 800,250 | 220,139,44,253 | `#DC8B2C` |
| `cena-2.png` | visor do capacete | 160,520 | 37,38,46,253 | `#25262E` |
| `cena-2.png` | azul da pipa | 450,500 | 43,127,211,253 | `#2B7FD3` |
| `cena-2.png` | amarelo da pipa | 520,460 | 253,191,41,253 | `#FDBF29` |
