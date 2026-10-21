# Operação Formiga — MANIFEST

Publicação: 21/10/2026. Preparação pela Tesoura com sharp do projeto.

Destino: `D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO04/operacao-formiga/`.

Brutos preservados em `D:/Documentos/Atesteme Jogos Fund 1/outputs/operacao-formiga/raw/`. Temporários, scripts de processamento, medições e prévias em `D:/Documentos/Atesteme Jogos Fund 1/outputs/operacao-formiga/` (somente D:). Nenhum código do jogo foi editado pela Tesoura.

## Convenções

Índices começam em 0, da esquerda para a direita e de cima para baixo. Todas as caixas são `x, y, largura, altura` em pixels locais da célula, medidas sobre alfa maior que zero. O último pixel fica em `x + largura - 1, y + altura - 1`. Para obter coordenadas da folha, somar a origem da célula na grade.

As bases das formigas são o último pixel em y=182; rainhas, pedras, formigueiro e plantas em y=246. O prato e os itens de sujeira ficam centrados. A keyline branca intencional dos bichos e objetos foi preservada.

## Arquivos publicados

| Arquivo | Dimensões | Grade / célula | Alfa |
|---|---|---|---|
| `jardim.png` | 1672 × 941 | — | opaco RGB |
| `formiga.png` | 768 × 384 | 4 × 2 / 192 × 192 | RGBA |
| `rainha.png` | 768 × 256 | 3 × 1 / 256 × 256 | RGBA |
| `frutas.png` | 1536 × 512 | 3 × 1 / 512 × 512 | RGBA |
| `cenario.png` | 1024 × 512 | 4 × 2 / 256 × 256 | RGBA |
| `folhas.png` | 1024 × 1280 | 1 × 2 / 1024 × 640 | RGBA |
| `folha-gigante.png` | 1024 × 768 | 1 × 1 / 1024 × 768 | RGBA |
| `sujeira.png` | 512 × 128 | 4 × 1 / 128 × 128 | RGBA |
| `amigas.png` | 768 × 384 | 4 × 2 / 192 × 192 | RGBA |
| `cover-operacao-formiga.png` | 1672 × 941 | — | opaco RGB |

## formiga.png — caixas reais

| Célula | Conteúdo | Caixa local (x, y, largura, altura) | Base |
|---|---|---|---|
| 0 | parada | (18, 22, 156, 161) | y=182 |
| 1 | andando A | (17, 22, 157, 161) | y=182 |
| 2 | andando B | (19, 22, 154, 161) | y=182 |
| 3 | carregando parada | (20, 28, 130, 155) | y=182 |
| 4 | carregando A | (22, 28, 130, 155) | y=182 |
| 5 | carregando B | (25, 28, 130, 155) | y=182 |
| 6 | feliz | (19, 22, 154, 161) | y=182 |
| 7 | esforco | (15, 45, 161, 138) | y=182 |

Células 0, 1, 2, 6 e 7 extraídas do bruto `formiga.png`. Células 3, 4 e 5 extraídas, na ordem, das três poses de `formiga-carregando.png`. O ajuste de registro desloca suavemente a parte superior para alinhar as palmas, preservando o centro da parte inferior. Não há pixels acima de y=28 nas três poses de carregar.

| Célula de carregar | Centro registrado entre as palmas (aprox.) | Limite superior | Pés |
|---|---|---|---|
| 3 | (110, 40) | y=28 | y=182 |
| 4 | (110, 39) | y=28 | y=182 |
| 5 | (110, 40) | y=28 | y=182 |

Apoio solicitado: (110,40). Centro do pedaço no contrato do código: (110,34). As mãos estão vazias.

## rainha.png — caixas reais

| Célula | Conteúdo | Caixa local (x, y, largura, altura) | Base |
|---|---|---|---|
| 0 | calma | (20, 38, 215, 209) | y=246 |
| 1 | pedindo | (20, 41, 215, 206) | y=246 |
| 2 | feliz | (23, 32, 210, 215) | y=246 |

## frutas.png — caixas reais

| Célula | Conteúdo | Caixa local (x, y, largura, altura) | Base |
|---|---|---|---|
| 0 | morango | (67, 51, 378, 410) | centrada |
| 1 | laranja | (26, 26, 460, 460) | centrada |
| 2 | maca | (50, 62, 412, 388) | centrada |

Encaixe pela silhueta real, com remapeamento da superfície, esticamento proporcional ao contorno por linhas/colunas e recorte final pelos 64 vértices de `D:/Documentos/Atesteme Jogos Fund 1/src/games/EF15CO04/operacao-formiga/data/fruits.ts`. Detalhes, nervuras e contorno escuro preservados; cabos e sépalas permanecem dentro da máscara.

| Célula | Centro | Parâmetros (a, b, e) | Pixels preenchidos | Fora / vazios |
|---|---|---|---|---|
| 0 | (256, 256) | (185, 205, 0.22) | 118940 | 0 / 0 |
| 1 | (256, 256) | (230, 230, 0) | 165916 | 0 / 0 |
| 2 | (256, 256) | (205, 194, 0.08) | 124734 | 0 / 0 |

A comparação usa o centro de cada pixel contra o polígono exato. Antialiasing de cobertura fica restrito aos pixels internos; todos os pixels externos têm RGBA (0,0,0,0).

## cenario.png — caixas reais

| Célula | Conteúdo | Caixa local (x, y, largura, altura) | Base |
|---|---|---|---|
| 0 | formigueiro | (13, 122, 230, 125) | y=246 |
| 1 | pedra A | (28, 97, 200, 150) | y=246 |
| 2 | pedra B | (43, 67, 170, 180) | y=246 |
| 3 | pedra C | (23, 117, 210, 130) | y=246 |
| 4 | prato | (20, 24, 215, 208) | centrada |
| 5 | arbusto | (20, 49, 215, 198) | y=246 |
| 6 | tufo | (20, 79, 215, 168) | y=246 |
| 7 | dente-de-leao | (40, 32, 175, 215) | y=246 |

## folhas.png — caixas reais

| Célula | Conteúdo | Caixa local (x, y, largura, altura) | Base |
|---|---|---|---|
| 0 | folha verde | (112, 95, 800, 450) | centrada |
| 1 | folha grande | (72, 58, 880, 524) | centrada |

Encaixe pela silhueta real, com remapeamento da superfície, esticamento proporcional ao contorno por linhas/colunas e recorte final pelos 64 vértices de `D:/Documentos/Atesteme Jogos Fund 1/src/games/EF15CO04/operacao-formiga/data/fruits.ts`. Detalhes, nervuras e contorno escuro preservados; cabos e sépalas permanecem dentro da máscara.

| Célula | Centro | Parâmetros (a, b, e) | Pixels preenchidos | Fora / vazios |
|---|---|---|---|---|
| 0 | (512, 320) | (400, 223, 0.12) | 279748 | 0 / 0 |
| 1 | (512, 320) | (440, 260, 0.12) | 358828 | 0 / 0 |

A comparação usa o centro de cada pixel contra o polígono exato. Antialiasing de cobertura fica restrito aos pixels internos; todos os pixels externos têm RGBA (0,0,0,0).

As alturas medidas são 450 e 524 px. São os limites do polígono paramétrico de 64 vértices; a tabela descritiva do contrato usa alturas aproximadas de 446 e 520 px.

## folha-gigante.png — caixas reais

| Célula | Conteúdo | Caixa local (x, y, largura, altura) | Base |
|---|---|---|---|
| 0 | folha gigante | (32, 84, 960, 600) | centrada |

## sujeira.png — caixas reais

| Célula | Conteúdo | Caixa local (x, y, largura, altura) | Base |
|---|---|---|---|
| 0 | gota | (19, 21, 90, 86) | centrada |
| 1 | terra | (19, 19, 90, 89) | centrada |
| 2 | raminho | (13, 9, 101, 110) | centrada |
| 3 | petala | (16, 18, 95, 91) | centrada |

Os pequenos grãos marrons junto ao torrão são parte intencional da sujeira. Pontos coloridos sem relação com as peças foram descartados.

## amigas.png — caixas reais

| Célula | Conteúdo | Caixa local (x, y, largura, altura) | Base |
|---|---|---|---|
| 0 | cochilando | (15, 83, 161, 100) | y=182 |
| 1 | acordando | (35, 22, 121, 161) | y=182 |
| 2 | andando A | (15, 23, 161, 160) | y=182 |
| 3 | andando B | (17, 22, 158, 161) | y=182 |
| 4 | carregando A | (21, 28, 134, 155) | y=182 |
| 5 | carregando B | (22, 28, 130, 155) | y=182 |
| 6 | feliz | (25, 22, 142, 161) | y=182 |
| 7 | empurrando | (15, 45, 161, 138) | y=182 |

Células 4 e 5 usam os passos A e B (índices 1 e 2) da faixa auxiliar `amigas-carregando.png`; as demais usam `amigas.png`. Os dois pequenos traços de bocejo da célula 1 são intencionais e foram preservados. Não há pixels acima de y=28 nas poses de carregar.

| Célula de carregar | Centro registrado entre as palmas (aprox.) | Limite superior | Pés |
|---|---|---|---|
| 4 | (110, 40) | y=28 | y=182 |
| 5 | (110, 41) | y=28 | y=182 |

Apoio solicitado: (110,40). Centro do pedaço no contrato do código: (110,34). As mãos estão vazias.

## Jardim — trilha em coordenadas de 1280 × 720

Fundo final opaco de 1672 × 941. Medidas abaixo feitas após escalá-lo para a tela de 1280 × 720. São os limites visuais aproximados da terra clara; tufos que avançam na borda não definem uma colisão. Centro = média dos limites superior e inferior de cada seção.

| x | y superior | y central | y inferior |
|---|---|---|---|
| 0 | 184 | 252 | 319 |
| 80 | 176 | 245 | 314 |
| 160 | 175 | 244 | 312 |
| 240 | 190 | 258 | 325 |
| 320 | 214 | 288 | 361 |
| 400 | 238 | 323 | 408 |
| 480 | 274 | 360 | 445 |
| 560 | 311 | 405 | 499 |
| 640 | 350 | 442 | 533 |
| 720 | 389 | 474 | 558 |
| 800 | 406 | 490 | 573 |
| 880 | 423 | 503 | 582 |
| 960 | 417 | 493 | 569 |
| 1040 | 411 | 493 | 575 |
| 1120 | 385 | 473 | 561 |
| 1200 | 368 | 457 | 546 |
| 1279 | 356 | 441 | 526 |

A trilha entra pela esquerda em torno de (0,252), cruza x=640 em torno de y=442 e sai à direita em torno de (1279,441). Envelope amostrado: x=0–1279 e y=175–582. A faixa lisa para o joystick ocupa principalmente o gramado inferior esquerdo.

Prévia com o centro em magenta e as duas bordas em azul: `D:/Documentos/Atesteme Jogos Fund 1/outputs/operacao-formiga/qa/jardim-trilha.png`.

## Capa

`cover-operacao-formiga.png`: 1672 × 941, RGB opaco. Título conferido visualmente: “Operação Formiga”.

## Limpeza e conferência

- Componentes conectados extraídos com alfa mínimo de 128 no bruto; ilhas sem relação com as peças descartadas. Mantidos os grãos de terra e sinais de expressão intencionais.
- Após reamostragem, alfa menor que 24 zerado; RGB zerado sempre que alfa=0. Interpolação de bordas com alfa premultiplicado nas poses registradas, para evitar franja escura.
- Todos os arquivos têm as dimensões finais do contrato. Nenhuma peça atravessa a sua célula.
- Conferência visual das folhas sobre fundos claro (#F6F3E9) e escuro (#182637), com as respectivas prévias em `D:/Documentos/Atesteme Jogos Fund 1/outputs/operacao-formiga/qa/`.
- Conferência numérica: zero pixels com RGB oculto no alfa 0; zero pixels com alfa de 1 a 23. Nas cinco silhuetas contratuais: zero pixels externos e zero pixels internos vazios. Jardim e capa possuem três canais, sem alfa.

Medições completas e caixas de origem: `D:/Documentos/Atesteme Jogos Fund 1/outputs/operacao-formiga/qa/measurements.json`.

Auditoria e SHA-256 dos PNGs publicados: `D:/Documentos/Atesteme Jogos Fund 1/outputs/operacao-formiga/qa/verification.json`.
