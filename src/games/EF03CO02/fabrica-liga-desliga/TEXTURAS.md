# Fábrica Liga-Desliga — texturas

Destino: `src/assets/games/EF03CO02/fabrica-liga-desliga/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 regras, §13
textura × código).

A linha de arte é a **chibi de figurinha**, o padrão da rodada (sujeita à
dúvida 2 do PLANEJAMENTO). A referência `references/19-chibi-figurinhas.jpg` vai
**anexada em toda geração**. Cada prompt vem inteiro (estilo + corpo +
negativo), pronto para copiar.

> **O elenco da referência entra no negativo.** Da folha de figurinhas sai só a
> técnica, nunca as personagens dela.

> **Serve para as duas mecânicas da dúvida 1.** A folha `pecas.png` já traz o
> **pote de massa** em 3 níveis (opção b). Se ficar a ficha (opção a), essas
> células sobram, e não custa nada: célula a mais não é outra geração.

### Tabela de estilo — chibi de figurinha

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Traço | limpo, nítido, uniforme, em azul-marinho dessaturado; nunca preto puro | vetor de conto (contorno no tom da cor) e desenho de criança (caneta trêmula) |
| Cor | paleta curta, chapada, **um** tom de sombra, nenhum degradê | vetor de conto (degradê macio) e chibi de rabisco (sem cor) |
| Olho | grande e brilhante, com um brilho forte | desenho de criança (pontinho) |
| Silhueta | peça com alfa ganha **keyline branca fina**; cena inteira (fundo, capa) não ganha | vetor de conto e graphic novel (sem keyline) |
| Proporção | chibi; as máquinas são fofas e redondas, com rosto só no forno | graphic novel (quase natural) |

**As três regras deste jogo:**
- **O forno aceso e o apagado são inconfundíveis**, até em miniatura no
  celular. Aceso: chama laranja grande, janela amarela brilhando, olhos
  abertos e sorrindo. Apagado: nenhuma chama, janela cinza-escura, olhos
  fechados dormindo. É **o mesmo forno**, mesmo tamanho e mesma posição nas
  duas células.
- **A esteira é lisa no fundo.** As ripas andam por código: pintadas, ficariam
  paradas com a esteira ligada.
- **O interruptor não diz o que fazer.** As duas células mostram só a alavanca
  para cima (ligado) e para baixo (desligado). A lâmpada de estado é do código.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-fabrica.png` | — | — | 1280 × 720 | opaco | a fábrica com a esteira lisa, o funil da massa e a mesinha da bandeja pintados |
| `forno.png` | 2 × 1 | 512 × 512 | 1024 × 512 | sim | forno aceso, forno apagado |
| `pecas.png` | 4 × 4 | 256 × 256 | 1024 × 1024 | sim | massa, biscoito, bandeja, interruptor, chef, pictogramas, pote |
| `cover-fabrica-liga-desliga.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`).

**Se a arte vier em outro tamanho**, ela é usada como veio: o código mede a
folha (MANIFEST) e o layout se ajusta. O que **não pode** mudar é a **ordem das
células** e o que existe em cada uma.

**O insubstituível para o N1:**
- o `bg-fabrica`;
- os dois fornos;
- em `pecas`: a massa, o biscoito, a bandeja, os dois interruptores e os
  pictogramas da chama e da esteira (0–4, 6 e 7).

O resto é N2/N3 ou a opção (b) da dúvida 1.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. A ficha, o contador e os
  balões são do jogo.
- Peça solta e centrada na célula, com ~8% de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha.
- **O forno tem dois túneis**, um de cada lado, na **mesma altura** (a base dos
  túneis em y ≈ 380 da célula), por onde a esteira passa. A esteira **não** é
  desenhada dentro da célula do forno.

## 3. `bg-fabrica.png` — 1280 × 720, opaco

Uma fábrica de biscoitos aconchegante, vista de lado. Tudo o que se mexe ou
muda de estado (o forno, os biscoitos, a bandeja, o interruptor) entra por
código.

| Região | O que tem |
|---|---|
| y 0–190 | parede calma e clara (HUD e ficha da regra), com no máximo uma janelinha e bandeirinhas nas pontas |
| funil da massa | à esquerda, x 60–240, y 230–400: um funil grande de massa, creme e menta, com a **boca embaixo em (150, 400)**, apontando para a esteira |
| **esteira** | de x 90 a x 1060: uma esteira comprida com **faixa de cima lisa** (cinza-azulada, sem ripas) em y 455–475, um rolo redondo em cada ponta e perninhas até o chão |
| **meio vazio** | x 440–840, y 200–560: **nada** além da esteira passando (o forno entra por cima) |
| mesinha da bandeja | à direita, x 1070–1260: uma mesinha baixa com o tampo em y ≈ 525, **vazia** |
| chão | y 560–720: piso de madeira calmo; no centro, x 520–760, y 580–700, um **espaço livre** (o interruptor entra ali) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 game about a cookie factory conveyor belt, for Brazilian children aged 8–9.
Primary request: create one opaque 1280 × 720 px straight-on SIDE view of a cosy cute cookie factory interior. Preserve these exact functional regions: y 0–190 is a calm light wall band with at most one small window and a few bunting flags near the corners; on the left, x 60–240, y 230–400, a big cute dough funnel in cream and mint whose narrow mouth points DOWN and opens at (150, 400) right above the belt; from x 90 to x 1060 one long conveyor belt seen from the side, whose TOP SURFACE is a PLAIN flat blue-grey band between y 455 and y 475 with NO slats, NO lines and NOTHING on it, a round roller at each end and short legs down to the floor; the CENTRE area x 440–840, y 200–560 must stay EMPTY except for the belt passing through it (an oven will be placed there later); on the right, x 1070–1260, a low small table whose top is at y ≈ 525, EMPTY; y 560–720 is a calm warm wooden floor, and its centre x 520–760, y 580–700 stays EMPTY.

Palette: warm cream walls, soft peach, mint, light wood, blue-grey metal, tiny touches of coral and butter yellow.

Composition and technical constraints: exact 16:9 canvas; straight-on side view, no perspective; all listed coordinates respected; centre area, belt top, table top and floor centre empty; opaque; no white sticker keyline; no embedded user interface.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, chefs, bakers, animals, an oven, ovens, fire, flames, cookies, dough, biscuits, trays, switches, buttons, levers, lamps on the belt, slats or stripes on the belt, objects on the belt, machines in the centre, text, letters, words, labels, digits, numbers, signs with writing, captions, watermark, logo, title lettering, score, counter, HUD, question mark, speech bubbles, arrows, icons, perspective vanishing point, top-down view, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 4. `forno.png` — grade 2 × 1, célula 512 × 512

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `ovenLit` | forno **aceso**: tijolinho coral e creme, uma porta redonda com **janela amarela brilhando** e uma **chama laranja grande** visível nela, chaminé pequena, **olhos abertos e sorriso** no corpo, ~420 × 400 |
| 1 | `ovenOut` | **o mesmo forno, apagado**: nenhuma chama, janela **cinza-escura**, **olhos fechados** dormindo (dois arquinhos), mesmo tamanho e mesma posição |

Nas duas células: um **túnel** de cada lado do corpo (arco escuro aberto) com a
**base em y ≈ 380 da célula**, por onde a esteira passa. O forno fica de pé com
o pé em y ≈ 470.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact two-state sprite sheet of one cute oven for a Phaser 3 game.
Primary request: create ONE exact 2 columns × 1 row sprite sheet on a transparent 1024 × 512 px canvas. Every cell is exactly 512 × 512 px. Each oven is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. BOTH cells show the SAME oven, same size, same position, same outline, seen from the SIDE: a cute rounded brick oven in coral and cream, about 420 × 400 px, its feet at local y ≈ 470, a small chimney on top, a round front door with a window, and on EACH side of the body one open dark arched tunnel whose bottom is at local y ≈ 380, so a conveyor belt could pass straight through it. The oven has a face on its body.

Exact cells:
0. ovenLit — the oven ON: a big bright orange flame clearly visible through a glowing yellow window, a warm glow around the door, eyes OPEN and happy, a smile.
1. ovenOut — the SAME oven OFF: NO flame at all, the window plain dark grey, eyes CLOSED like sleeping (two little arcs), a small calm mouth.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a conveyor belt, cookies, dough, trays, people, chefs, smoke clouds, sparks, a different oven in each cell, a different size or position between cells, a flame in cell 1, a dark window in cell 0, text, letters, words, labels, digits, numbers, temperature dials with numbers, logos, captions, watermark, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, ground, floor, shadow, background, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

## 5. `pecas.png` — grade 4 × 4, célula 256 × 256

| Célula | Nome no código | O quê | Uso |
|---|---|---|---|
| 0 | `dough` | bolinha de **massa crua**, creme-pálida, fofinha, ~110 px | N1 |
| 1 | `cookie` | **biscoito assado** redondo, dourado, com gotinhas de chocolate, ~120 px | N1 |
| 2 | `tray` | **bandeja** retangular baixa de metal, vista de lado, vazia, ~220 × 70 | N1 |
| 3 | `switchOff` | interruptor gigante numa caixinha: alavanca **para baixo**, ~200 × 200 | N1 |
| 4 | `switchOn` | o **mesmo** interruptor com a alavanca **para cima** | N1 |
| 5 | `chef` | chef chibi da cintura para cima, apitando num apito, bochechas cheias | N3 |
| 6 | `iconFlame` | pictograma: uma chama laranja simples | ficha |
| 7 | `iconBelt` | pictograma: um pedacinho de esteira com 2 rolos e uma seta → | ficha |
| 8 | `iconTray` | pictograma: uma bandeja cheia de biscoitos | ficha N2 |
| 9 | `iconWhistle` | pictograma: um apito com 2 risquinhos de som | ficha N3 |
| 10 | `broken` | biscoito **quebrado** em 3 pedaços e farelos (caiu no chão) | erro N2 |
| 11 | `potFull` | pote de massa **cheio** até a boca | opção (b) |
| 12 | `potHalf` | o **mesmo** pote pela **metade** | opção (b) |
| 13 | `potEmpty` | o **mesmo** pote **vazio** (só raspinhas no fundo) | opção (b) |
| 14 | `iconPot` | pictograma: um pote com massa | opção (b) |
| 15 | — | **vazia** | — |

Os pictogramas (6–9 e 14) são simples, de ~150 px, e vão **dentro da ficha**,
ao lado da frase.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight where there are eyes; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact item sprite sheet for a Phaser 3 cookie factory game.
Primary request: create ONE exact 4 columns × 4 rows sprite sheet on a transparent 1024 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. Cell 15 stays COMPLETELY EMPTY and transparent.

Exact cells, left to right and then top to bottom:
0. dough — one soft round ball of pale cream raw cookie dough, about 110 px, no face.
1. cookie — one round golden baked cookie with a few chocolate chips, seen slightly from the side, about 120 px, no face.
2. tray — one low rectangular metal baking tray seen from the side, EMPTY, about 220 × 70 px.
3. switchOff — one giant cute toggle switch on a small rounded box, about 200 × 200 px, the lever pointing DOWN; a small round lamp on the box, UNLIT and grey.
4. switchOn — the SAME switch, same box, same size and position, the lever pointing UP; the small round lamp still UNLIT and grey (the game lights it).
5. chef — one cute chibi chef from the waist up, white hat and apron, blowing a whistle with puffed cheeks.
6. iconFlame — a simple pictogram of one orange flame, about 150 px.
7. iconBelt — a simple pictogram of a short conveyor belt with two rollers and a small arrow pointing right, about 150 px.
8. iconTray — a simple pictogram of a tray full of round cookies, about 150 px.
9. iconWhistle — a simple pictogram of one whistle with two small sound lines, about 150 px.
10. broken — one round cookie broken into three pieces with a few crumbs, lying flat.
11. potFull — one cute round mixing pot seen from the side, FULL of pale cream dough up to the rim, about 190 px.
12. potHalf — the SAME pot, same size and position, the dough only HALF way up.
13. potEmpty — the SAME pot, same size and position, EMPTY with only a few scraps at the bottom.
14. iconPot — a simple pictogram of a pot with dough, about 150 px.
15. EMPTY.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, faces on the dough, cookies, tray, switch or pot, a lit lamp on the switches, different switches in cells 3 and 4, different pots in cells 11–13, a conveyor belt behind the items, an oven, text, letters, words, labels, digits, numbers, ON/OFF words, logos, captions, watermark, title lettering, user interface, buttons, panels, frames, speech bubbles with words, HUD, question mark, anything in cell 15, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

## 6. `cover-fabrica-liga-desliga.png` — 1672 × 941, opaco

A capa mostra a fábrica de lado, com o **forno aceso** sorrindo no meio e a
esteira passando por dentro dele. À esquerda entram bolinhas de massa e à
direita saem biscoitos dourados para a bandeja. Embaixo, uma **mão de criança**
aperta o **interruptor gigante** com a alavanca para cima. O título vai em
cima. Anexe a referência `19` e as folhas `forno.png` e `pecas.png` aprovadas.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover, not a sticker.
OBJECTS — THE OTHER ATTACHED IMAGES (forno.png and pecas.png) ARE THE REFERENCES FOR THE OVEN, THE DOUGH, THE COOKIES, THE TRAY AND THE SWITCH: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Fábrica Liga-Desliga”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Fábrica Liga-Desliga” in large chunky rounded playful multicolour letters with a thick dark outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly these words, letter for letter, with capitalization, accent and hyphen exactly: F-á-b-r-i-c-a [space] L-i-g-a [hyphen] D-e-s-l-i-g-a. The “á” in “Fábrica” MUST carry its acute accent, and the hyphen must join “Liga” and “Desliga”. No extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, a cosy cookie factory seen from the side: the cute coral oven, ON, with a big orange flame in its glowing window and a happy face, stands in the centre; a conveyor belt passes straight through its side tunnels; pale dough balls ride in from the left and golden chocolate-chip cookies come out on the right and drop onto a tray; at the bottom centre a child's hand presses a giant toggle switch whose lever is UP and whose lamp glows green. Make "switch the belt ON while the oven is lit" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; oven, belt, cookies and switch large beneath it and fully visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, adult bakers, extra words, misspelled title, missing accent, missing hyphen, subtitle, punctuation, numbers, ON/OFF words, labels, logos, brand marks, captions, signs with writing, watermark, score, HUD, buttons other than the switch, question mark, speech bubbles with words, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped oven, sad faces, crying, angry faces.
~~~

## 7. O que conferir quando a arte chegar

- as grades (ou o tamanho que vier, medido): `forno` 2 × 1, `pecas` 4 × 4; o
  corte medido na folha inteira, sem peça cruzando célula;
- no `forno`: **os dois estados no mesmo lugar e no mesmo tamanho**, a
  diferença legível em miniatura (chama e olhos), e a **base dos túneis**
  medida (é onde a esteira tem de passar);
- no `bg-fabrica`: a **faixa de cima da esteira** (medir y), a **boca do funil**,
  o **tampo da mesinha** e o meio vazio, em 1280 × 720;
- os dois interruptores e os três potes **iguais fora o que muda**, e a lâmpada
  apagada nos dois interruptores;
- nenhum número, letra ou "ON/OFF" em lugar nenhum;
- a grafia do título da capa, **com o "á" e o hífen**.
