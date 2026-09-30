# Fábrica de Carimbos — texturas

Destino: `src/assets/games/EF02CO01/fabrica-de-carimbos/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 atributos e
fases, §13 textura × código).

A linha de arte é a **chibi de figurinha**, o padrão da rodada, com a
referência `references/19-chibi-figurinhas.jpg` **anexada em toda geração**.
Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

> **O elenco da referência entra no negativo.** Da folha de figurinhas sai só a
> técnica, nunca as personagens dela.

### Tabela de estilo — chibi de figurinha

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Traço | limpo, nítido, uniforme, em azul-marinho dessaturado; nunca preto puro | vetor de conto (contorno no tom da cor) e desenho de criança (caneta trêmula) |
| Cor | paleta curta, chapada, **um** tom de sombra, nenhum degradê | vetor de conto (degradê macio) e chibi de rabisco (sem cor) |
| Olho | grande e brilhante, com um brilho forte | desenho de criança (pontinho) |
| Silhueta | peça com alfa ganha **keyline branca fina**; cena inteira (fundo, capa) não ganha | vetor de conto e graphic novel (sem keyline) |
| Proporção | chibi: cabeça grande, corpo pequeno; objetos simples e legíveis no tamanho do jogo | graphic novel (quase natural) |

**A regra de cor deste jogo:** **azul, vermelho e amarelo são atributos.** Os
brinquedos vêm **brancos** e o código os pinta com `tint`. O resto da arte
(fábrica, esteira, carimbo, caixa) usa **menta, lilás, creme, madeira clara e
cinza-azulado**, sem azul, vermelho ou amarelo fortes, para nenhuma cor da
fábrica parecer atributo.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-fabrica.png` | — | — | 1280 × 720 | opaco | a fábrica com o pórtico, a estrutura da esteira, os túneis e o nicho da caixa |
| `esteira.png` | — | — | 512 × 96, emenda horizontal | opaco | a lona que rola (`TileSprite`) |
| `carimbo.png` | 2 × 1 | 512 × 512 | 1024 × 512 | sim | cabeça do carimbo com 2 janelinhas vazias; com 3 (N3) |
| `pecas.png` | 4 × 2 | 256 × 256 | 1024 × 512 | sim | robô branco, antena, bola branca, listras, caixa (fundo e frente), dedo, 1 livre |
| `cover-fabrica-de-carimbos.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`). Se trocar
uma célula, avise o Ferro e a Brasa.

**O insubstituível:** o **robô branco**, a **bola branca**, a **antena** e as
**listras** (são os atributos) e a **cabeça do carimbo com as janelinhas
vazias** (é o modelo).

**Opcional para o N1:** `carimbo` célula 1 (3 janelinhas, N3).

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. As palavras das janelinhas,
  ✓/✗ e a marca APROVADO são do jogo.
- Objeto solto e centrado na célula, com ~8% de margem, sem sombra caída na
  célula. Nada vaza para a célula vizinha.
- **Robô e bola são brancos** e só levam sombra em **cinza neutro**. O contorno
  é azul-marinho. Cor na arte vira cor errada depois do `tint`.
- **Antena e listras não levam cor de atributo**: a antena é prateada com a
  bolinha da ponta **branca**, e as listras são **creme com contorno
  azul-marinho**. Nenhuma das duas pode puxar para azul, vermelho ou amarelo.
- **As janelinhas do carimbo são vazias**: um quadrado de cantos redondos com
  o fundo creme liso.

## 3. `bg-fabrica.png` — 1280 × 720, opaco

| Região | O que tem |
|---|---|
| y 0–96 | parede calma (HUD) |
| pórtico, x 330–710, y 96–260 | um **pórtico/braço** de máquina fofa, menta e lilás, com um pistão vertical que **termina em y ≈ 240** e **não tem cabeça de carimbo** (ela entra pelo código) |
| área do carimbo, x 330–710, y 240–470 | parede lisa, **vazia** (a cabeça sobe e desce aqui) |
| esteira, x 60–1000, y 530–640 | a **estrutura** da esteira: pés de madeira, rolos nas pontas e uma **faixa vazia** onde a lona vai rolar (o código desenha a lona, então a faixa tem só uma cor lisa) |
| túneis, x 0–90 e x 970–1060, y 440–640 | duas bocas de túnel arredondadas, uma em cada ponta, de onde a esteira entra e sai |
| caixa, x 1060–1260, y 420–640 | um **nicho vazio** com um tapete, onde a caixa fica (a caixa entra por código) |
| fundo | parede de fábrica fofa: prateleiras com engrenagens, janelinhas redondas, luzinhas; tudo **fora** das regiões acima |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 conveyor-belt game for Brazilian children aged 7–8.
Primary request: create one opaque 1280 × 720 px straight-on side view of a cosy, cute toy factory. Preserve these exact functional regions: y 0–96 is a calm plain wall; at x 330–710, y 96–260, a cute rounded machine gantry in mint and lilac with ONE vertical piston rod that ends at about y 240 with NOTHING attached below it; the wall area x 330–710, y 240–470 is plain and EMPTY; a conveyor-belt STRUCTURE spans x 60–1000, y 530–640 with light-wood legs and round rollers at both ends, and its belt surface is ONE plain flat colour with nothing on it; two rounded tunnel mouths, one at each end, x 0–90 and x 970–1060, y 440–640; on the right, x 1060–1260, y 420–640, an EMPTY alcove with a small rug where a box will sit. Around these regions, a friendly factory wall with shelves of big cute gears, round windows and small warm lights.

Palette rule: mint, lilac, cream, light wood, soft blue-grey. NO strong blue, NO strong red and NO strong yellow anywhere, because those three colours are toy attributes in the game.

Composition and technical constraints: exact 16:9 canvas; straight-on side view; all listed coordinates respected; the gantry, the belt surface and the alcove stay plain and empty; opaque; no white sticker keyline; no embedded user interface.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, robots, toys, balls, dolls, boxes, a stamp head, stamps, stamp marks, objects on the belt, strong blue, strong red, strong yellow, text, letters, words, labels, digits, numbers, signs, posters with writing, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, check marks, crosses, perspective view, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 4. `esteira.png` — 512 × 96, opaco, emenda horizontal

A lona da esteira vista de lado, de cima: uma faixa cinza-azulada com
**ripinhas** transversais a cada 64 px (8 ripas no arquivo), para o movimento
se ver. A borda esquerda **continua** a direita.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image. NO white sticker keyline — this is a tiling texture.

Use case: stylized-concept
Asset type: horizontally SEAMLESS tiling texture for a scrolling conveyor belt in a Phaser 3 game.
Primary request: create one opaque 512 × 96 px strip of conveyor-belt surface seen slightly from above: a soft blue-grey rubber belt with a thin darker edge line along the top and the bottom, and exactly EIGHT evenly spaced vertical slats every 64 px so movement is visible. The left edge must continue seamlessly into the right edge.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, objects on the belt, toys, rollers, legs, text, letters, words, labels, digits, numbers, logos, arrows, strong blue, strong red, strong yellow, uneven slat spacing, a visible seam, perspective vanishing point, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, 3D render, photorealism, blur, heavy noise.
~~~

## 5. `carimbo.png` — grade 2 × 1, célula 512 × 512

A **cabeça do carimbo**: uma caixa fofa de máquina, menta e lilás, com um
encaixe redondo em cima (onde o pistão do fundo se liga) e, embaixo, a
**almofada de borracha** do carimbo, lisa, creme. Na frente ficam as
**janelinhas**: quadrados de cantos redondos com moldura prateada e **fundo
creme liso e vazio**. O código escreve o atributo dentro de cada uma.

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `stamp-2` | cabeça de ~440 × 220 com **2 janelinhas** lado a lado, cada uma de ~150 × 120, centros em (**x 166** e **x 346**, y 250) locais |
| 1 | `stamp-3` | a mesma cabeça, mais larga (~490 × 220), com **3 janelinhas** de ~130 × 120, centros em x 116, 256 e 396 (N3) |

O encaixe de cima fica centrado em (256, 130) nas duas células, e a base da
borracha em y ≈ 380.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact machine-part sprite sheet for a Phaser 3 game; the code writes content inside the empty windows.
Primary request: create ONE exact 2 columns × 1 row sprite sheet on a transparent 1024 × 512 px canvas. Every cell is exactly 512 × 512 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

The object: the cute head of a big toy-factory stamping machine, seen straight from the front: a rounded chunky box in mint and lilac with a round coupling on top centred at local (256, 130), a few tiny rivets, and underneath it a flat cream rubber stamp pad whose bottom edge sits at about local y = 380. On its front face there are WINDOWS: rounded squares with a thin silver frame and a PLAIN, FLAT, EMPTY cream inside — never draw anything inside them.

Exact cells:
0. stamp-2 — the head about 440 × 220 px with TWO windows side by side, each about 150 × 120 px, centred at local x = 166 and x = 346, y = 250.
1. stamp-3 — the same head a little wider, about 490 × 220 px, with THREE windows, each about 130 × 120 px, centred at local x = 116, 256 and 396, y = 250.

Consistency constraints: both cells are the same machine design, colours and line weight; only the width and the number of windows change.

Palette rule: mint, lilac, cream, silver. No strong blue, red or yellow.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, faces or eyes on the machine, anything inside the windows, check marks, crosses, icons, symbols, a stamp mark or text on the rubber pad, the piston rod above the coupling, toys, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, arrows, HUD, question mark, strong blue, strong red, strong yellow, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, perspective view, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 6. `pecas.png` — grade 4 × 2, célula 256 × 256

| Célula | Nome no código | O quê | Medida que vai para o MANIFEST |
|---|---|---|---|
| 0 | `robot` | robô de brinquedo fofo, **de frente, todo BRANCO** com sombra cinza-neutra: cabeça quadrada de cantos redondos, rostinho sorridente (olhos azul-marinho), corpo quadradinho, bracinhos e pés curtos, **sem antena** | a **âncora da antena**: o ponto no meio do topo da cabeça |
| 1 | `antenna` | uma antena de brinquedo: hastezinha prateada com uma **bolinha branca** na ponta, reta, de pé | a **base** da haste |
| 2 | `ball` | bola de brinquedo redonda, **toda BRANCA** com sombra cinza-neutra e um brilho, **sem listras**, ~200 px de diâmetro | o centro e o diâmetro |
| 3 | `stripes` | **só as listras** da bola: 3 faixas **creme** curvas com contorno azul-marinho, no **mesmo círculo** de ~200 px da célula 2 e no mesmo centro, o resto **transparente** | o mesmo centro e diâmetro da célula 2 |
| 4 | `box-back` | a caixa de papelão aberta, **só o fundo e as abas de trás** (creme e madeira clara), vista de frente | a base |
| 5 | `box-front` | **só a frente** da mesma caixa, na mesma escala e na mesma base | a base |
| 6 | `guide-hand` | mãozinha chibi no ângulo de `references/mao-toque-angulo.png` | `tipX`/`tipY` |
| 7 | — | vazia | — |

As células 2 e 3 são **uma sobre a outra**: a bola listrada é a bola (tingida)
com as listras (sem tingir) por cima, no mesmo centro e na mesma escala. As
células 4 e 5 também: o brinquedo cai **entre** o fundo e a frente.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight where there are eyes; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. The second attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 6.

Use case: stylized-concept
Asset type: exact toy-parts sprite sheet for a Phaser 3 game; the code TINTS the white toys blue, red or yellow and attaches parts, so the toys must be pure white with neutral grey shading.
Primary request: create ONE exact 4 columns × 2 rows sprite sheet on a transparent 1024 × 512 px canvas. Every cell is exactly 256 × 256 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

Exact cells, left to right and then top to bottom:
0. robot — one cute toy robot seen from the front, ENTIRELY WHITE with only neutral light-grey shading: a rounded square head with a friendly smiling face (navy dot eyes with one highlight, small smile), a small square body, short stubby arms and feet. NO antenna, nothing on top of the head.
1. antenna — one toy antenna standing straight up: a thin silver rod with one round WHITE ball on its tip, and a small round silver base.
2. ball — one round toy ball about 200 px across, ENTIRELY WHITE with neutral light-grey shading and one glossy highlight, NO stripes, no pattern.
3. stripes — ONLY the stripes of that same ball: three curved cream bands with navy outlines lying exactly on a circle of the same size and centre as cell 2; everything else in the cell is TRANSPARENT (no ball body).
4. box-back — the BACK half of an open cardboard toy box seen from the front: only its inner back wall and the two rear flaps, cream and light wood.
5. box-front — the FRONT half of the same box at the same scale and baseline: only its front wall, cream and light wood.
6. guide-hand — use references/mao-toque-angulo.png ONLY as the angle and silhouette reference. Create one cute light-brown childlike chibi hand with the same dark uniform outline, one-tone flat cel shading and white sticker keyline as the other cells. The index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT; its tip is crisp and clearly the touch point. The other THREE fingers fold into distinct descending steps on the RIGHT; the THUMB folds inward across the palm; the short bare wrist descends toward the LOWER RIGHT. Exactly five digits. No click lines, no face, no sleeve.
7. completely EMPTY and genuinely transparent reserved cell.

Palette rule: the robot and the ball are pure white with neutral grey shading and navy outlines only; the antenna is silver with a white tip; the stripes are cream; the box is cream and light wood. No blue, red or yellow anywhere in the sheet.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, colour on the robot, colour on the ball, coloured eyes, coloured tip on the antenna, an antenna on the robot, stripes on the ball in cell 2, a ball body in cell 3, toys inside the box, a closed box, tape, labels or logos on the box, strong blue, strong red, strong yellow, extra objects, extra hands, extra fingers, missing fingers, click lines, radiating lines, object in cell 7, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

## 7. `cover-fabrica-de-carimbos.png` — 1672 × 941, opaco

A capa: a fábrica fofa, com o carimbo descendo sobre um robô **azul pequeno**,
as duas janelinhas com um ✓ verde cada. Na esteira passam robôs de outras cores
e tamanhos. À direita, a caixa com dois robôs azuis pequenos (um com antena,
outro sem). Em cima vai o título `Fábrica de Carimbos`. Anexe a referência `19`
e as `carimbo.png` e `pecas.png` aprovadas.

Na capa, **as três cores e os ✓ aparecem de propósito**, e as janelinhas
mostram só um pictograma (uma bolinha azul, um robô pequeno), sem palavra.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover, not a sticker.
OBJECTS — THE OTHER ATTACHED IMAGES (carimbo.png and pecas.png) ARE THE REFERENCES FOR THE STAMP HEAD, THE TOY ROBOT AND THE BOX: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Fábrica de Carimbos”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Fábrica de Carimbos” in large chunky rounded playful multicolour letters with a thick dark outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly three words, letter for letter, with capitalization and the accent exactly: F-á-b-r-i-c-a [space] d-e [space] C-a-r-i-m-b-o-s. The “á” in “Fábrica” MUST carry its acute accent. No extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, a cosy cute toy factory: the mint-and-lilac stamping machine head presses down on a small BLUE toy robot standing on a conveyor belt; the machine's two windows show a small blue dot and a small robot silhouette, each with a green check mark; along the belt, other toy robots in red, yellow and blue, big and small, some with antennas, roll by; on the right, an open cardboard box holds two small blue robots, one with an antenna and one without. Make "the stamp checks each toy against the model" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; the stamp, the blue robot, the belt and the box large beneath it and fully visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, scary machines, sharp parts, extra words, misspelled title, missing accent, subtitle, punctuation, numbers, words inside the windows, labels, captions, signs with writing, watermark, logo, score, HUD, buttons, question mark, speech bubbles, arrows, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped machine, cropped box, sad faces, crying, angry faces.
~~~

## 8. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades exatas: `carimbo` 1024 × 512, `pecas` 1024 × 512; o corte medido
  por colunas na folha inteira, sem peça cruzando célula;
- `esteira.png` em 512 × 96, **com a emenda testada** (duas cópias lado a lado,
  sem degrau) e as 8 ripas iguais;
- **robô e bola brancos de verdade**: testar o `tint` nas 3 cores (azul,
  vermelho, amarelo) e conferir que cada uma sai pura, sem puxar para outra
  cor, e que o contorno continua escuro;
- a antena e as listras **sem cor de atributo**;
- **as listras encaixando na bola**: sobrepor as células 2 e 3 no mesmo centro
  e na mesma escala e conferir; registrar centro e diâmetro das duas;
- a **âncora da antena** no robô e a **base** da antena, medidas;
- as janelinhas do carimbo **vazias**, com os centros medidos;
- a caixa (fundo e frente) na mesma escala e na mesma base;
- no `bg-fabrica`, o pistão sem cabeça, a faixa da esteira lisa e o nicho da
  caixa vazio; nenhum azul, vermelho ou amarelo forte;
- `tipX`/`tipY` do dedo medidos;
- a grafia do título da capa conferida letra a letra, **com o acento de
  "Fábrica"**.
