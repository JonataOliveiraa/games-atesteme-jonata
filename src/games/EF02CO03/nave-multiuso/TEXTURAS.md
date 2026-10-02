# Nave Multiuso — texturas

Destino: `src/assets/games/EF02CO03/nave-multiuso/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§4 os pares, §6 a tela).

> **O estilo deste jogo é uma linha NOVA: POP CHAPADO** (escolha do usuário em
> 02/10/2026). As referências são as três imagens que ele anexou, guardadas em:
> - [`references/30-pop-chapado-a.jpg`](../../../../references/30-pop-chapado-a.jpg)
> - [`references/31-pop-chapado-b.jpg`](../../../../references/31-pop-chapado-b.jpg)
> - [`references/32-pop-chapado-c.webp`](../../../../references/32-pop-chapado-c.webp)
>
> **As três vão anexadas em TODAS as gerações.** Cada prompt abaixo já vem
> inteiro (estilo, corpo e negativo), pronto para copiar e colar.

### Tabela de estilo: pop chapado e as outras linhas

| Critério | Pop chapado (este jogo) | Diferente de |
|---|---|---|
| Traço | contorno **azul-marinho quase preto**, de espessura **uniforme e média**, liso e confiante | graphic novel (marrom, espessura variável) e vetor geométrico (sem contorno) |
| Cor | **100% chapada, sem sombra**. Degradê só nos **brilhos/luzes** (o cabelo da Zuri é **preto chapado**, com uma faixa de brilho). Paleta de bala: rosa-choque, ciano elétrico, índigo, amarelo-limão, violeta | chibi (um tom de sombra) e graphic novel (sombra macia) |
| Olho | grande, com **íris colorida, pupila pequena e cílio superior grosso**, ar de "blasé fofo" | chibi (olho enorme e redondo) |
| Silhueta | formas **angulosas e esguias**, pontas afiadas, cabelo em mechas pontudas; **sem keyline branca** | chibi de figurinha (roliço, com keyline) |
| Enfeite | **estrelinhas de 4 pontas** e explosões estreladas | — |

> **O elenco da referência entra no NEGATIVO**, como sempre. As imagens mostram
> moças-demônio vermelhas com chifre, uma loira de vestido vermelho, auréolas,
> um homem de black power, um bichinho verde, armas e poses adultas. Nada disso
> entra no jogo. Todo prompt fecha com esse elenco e com `guns, weapons,
> suggestive poses, revealing clothes, high heels`. **A piloto é uma criança de
> uns 12 anos**, de macacão fechado.

**A regra de cor deste jogo:** cada ferramenta tem **uma cor só sua**, igual no
bico da nave e no botão:
- **assoprador:** ciano `#2EC5FF`;
- **água:** azul-royal `#2E6BFF`;
- **raio-puxa:** rosa-choque `#FF3FA4`.

O corpo da nave é **índigo `#3A2A8C` com branco**, para não brigar com as três.
As coisas usam as cores delas: folhas laranja e amarelas, fogo vermelho e
amarelo, ovelha branca. O **caminho do meio do mapa é um gramado claro**, para tudo isso saltar.

## 1. Os arquivos

> **O jogo é visto DE CIMA** (*top-down*, como os shooters verticais que o
> usuário mostrou em 02/10/2026). A nave fica embaixo, de bico para cima. O chão
> (grama e rio, em código) rola de cima para baixo, e as coisas vêm de cima, em 3 colunas. Toda arte de
> jogo é desenhada **vista de cima**, exceto a Zuri (retrato do tutorial) e a
> capa.

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `cenario.png` | 4 × 3 | 256 × 256 (veio 300) | 1024 × 768 | sim | elementos soltos do cenário (árvores, telhados, plantações…); o chão é do código |
| `nave.png` | 3 × 1 | 320 × 384 | 960 × 384 | sim | a nave vista de cima, com a Zuri na cabine × as 3 ferramentas no bico |
| `zuri.png` | 3 × 1 | 512 × 640 | 1536 × 640 | sim | a Zuri da cintura para cima: fala, ops e vitória (retrato, de frente) |
| `coisas.png` | 4 × 3 | 384 × 384 | 1536 × 1152 | sim | as coisas do caminho e todos os estados delas (§6) |
| `pecas.png` | 3 × 2 | 256 × 256 | 768 × 512 | sim | ícones das 3 ferramentas, seta, gota e brilho |
| `coisas-espaco.png` | 4 × 3 | 384 × 384 | 1536 × 1152 | sim | as coisas no espaço, mesmo layout da `coisas.png` (§9) |
| `coisas-lua.png` | 4 × 3 | 384 × 384 | 1536 × 1152 | sim | as coisas na Lua, mesmo layout (§9) |
| `cenario-espaco.png` | 4 × 3 | 256 × 256 | 1024 × 768 | sim | planetas, asteroides, cometa, galáxia… (§9) |
| `cenario-lua.png` | 4 × 3 | 256 × 256 | 1024 × 768 | sim | crateras, pedras, base, antena… (§9) |
| `cover-nave-multiuso.png` | — | — | 1672 × 941 | opaco | capa, **com o título** |

**A ordem das células e as coordenadas são contrato com o código**
(`data/files.ts`). Se a arte vier em outro tamanho, tudo bem: eu meço as células
e ajusto o layout, como no Robô Pintor.

**O insubstituível:**
- os 3 **bicos da nave** e os 3 **ícones** das ferramentas: a criança escolhe
  pelo desenho, então assoprador, água e raio-puxa têm de ser **diferentes de
  longe**;
- as coisas vêm **recortadas, sem chão nem canteiro**: o chão é só o
  chão de grama que o código desenha.

## 2. Regras para toda a arte

- **Nenhum texto, número ou letra**, exceto o título na capa.
- **Sem keyline branca.** O contorno marinho segura a silhueta.
- Os efeitos das ferramentas (vento, jato d'água, raio rosa, faixa de alcance)
  e o fogo do motor **são do código**. Nenhuma célula desenha o jato saindo.

---

## 3. `cenario.png` — 4 × 3 células, alfa (entregue em 300 × 300)

**O chão é do código** (Graphics, `scenes/fallback.ts` → `paintGround`):
- grama em toda a tela, **sem estrada** (pedido do usuário em 02/10/2026:
  *"nao coloque estrada, quero tudo grama"*);
- um rio serpenteando à esquerda.

Sobre ele, `scenes/world.ts` espalha os **elementos desta folha** pequenos,
nas laterais, rolando junto com o chão, e passa **nuvens** translúcidas mais
rápido que o chão. Tudo pequeno, para dar a impressão de altitude (*"quero uma
impressao que é uma nave voando mesmo"*). O caminho do meio, onde as coisas
passam, fica só com grama.

| # | Elemento | Lado |
|---|---|---|
| 0 | copa de árvore | os dois |
| 1 | trio de copas | os dois |
| 2 | arbusto com florzinhas | esquerda |
| 3 | telhado rosa | os dois |
| 4 | telhado amarelo | esquerda |
| 5 | telhado de celeiro violeta | direita |
| 6 | plantação amarela | direita |
| 7 | plantação verde | direita |
| 8 | canteiro de flores | os dois |
| 9 | pedras | esquerda |
| 10 | laguinho | direita |
| 11 | cerca | direita |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, fresh mint and green); angular stylized shapes; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

CAMERA: strict TOP-DOWN view — the camera looks STRAIGHT DOWN at the ground, 90 degrees, orthographic, like the map of a classic vertical shoot-em-up game. We only see the TOPS of things: roofs, tree crowns, fields. No side walls, no trunks, no horizon, no perspective.

SUBJECT: a sprite sheet of ISOLATED COUNTRYSIDE SCENERY PIECES for a top-down scrolling game, 4 columns x 3 rows, each cell 256x256, full sheet 1024x768, FULLY TRANSPARENT BACKGROUND. Each piece floats alone on transparency, centered in its cell, filling about 80% of it: NO ground under it, NO grass disc, NO base, NO drop shadow — the game draws the grass and the river separately.
Row 1:
cell 1 — a round bushy TREE CROWN seen from above, medium green, bumpy scalloped edge, one lighter flat highlight blob;
cell 2 — a cluster of three round TREE CROWNS seen from above, mint-teal green, overlapping;
cell 3 — a low round BUSH seen from above, bright green, with two tiny hot pink flowers on it;
cell 4 — a small HOUSE ROOF seen from above: a hot pink gabled roof as a rectangle split by a ridge line, a tiny chimney square;
Row 2:
cell 5 — a small HOUSE ROOF seen from above: lemon yellow gabled roof with a ridge line and a tiny chimney;
cell 6 — a wider BARN ROOF seen from above: violet gabled roof with a ridge line;
cell 7 — a square CROP FIELD seen from above: lemon yellow with straight vertical crop rows, rounded corners, navy outline;
cell 8 — a square CROP FIELD seen from above: fresh green with straight vertical crop rows, rounded corners, navy outline;
Row 3:
cell 9 — a patch of small FLOWERS seen from above: six five-petal flowers in hot pink, lemon yellow and violet, loosely grouped;
cell 10 — a cluster of three smooth ROCKS seen from above, soft lilac-grey;
cell 11 — a small round POND seen from above: cyan water, a white flat highlight, one green lily pad;
cell 12 — a short white picket FENCE segment seen from above, running vertically: a thin vertical rail with three small square posts.

COMPOSITION: 12 evenly spaced cells in a 4x3 grid, every piece centered in its cell, isolated cutouts on a fully transparent background, no text.

DO NOT INCLUDE: grass under the pieces, ground tiles, round green bases, drop shadows, cell borders, side view, front view, three-quarter view, isometric view, perspective, walls of houses, doors, windows seen from the front, tree trunks, roads, rivers, sky, clouds, piles of leaves, fire, animals, sheep, characters, people, vehicles, spaceships, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, guns, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 4. `nave.png` — 3 × 1 células de 320 × 384, alfa

**A mesma nave três vezes, vista DE CIMA, de bico para CIMA.** Só o **bico**
muda. A Zuri aparece na cabine de vidro, vista de cima: o alto da cabeça com o
cabelo **preto liso** e o laço ciano. **Sem capacete.**

| Célula | Bico (ferramenta) |
|---|---|
| 0 | **assoprador**: boca larga de funil abrindo para cima, ciano `#2EC5FF` |
| 1 | **água**: mangueira-canhão com tanquinho e bocal, azul-royal `#2E6BFF` |
| 2 | **raio-puxa**: ferradura/prato aberto para cima, rosa-choque `#FF3FA4` |

**Contrato por célula:**
- o centro da nave fica em (160, 200);
- o **bico termina em y ≈ 14**, centrado em x 160;
- as asas vão de x ≈ 10 a 310;
- os **dois motores** ficam na traseira, em x ≈ 103 e 217, terminando em
  y ≈ 370.

O fogo do motor é do código, então não desenhe chama.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; only small two-color gradients in glass; super-saturated candy palette; angular stylized shapes with sharp points; four-point sparkle highlights. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

SUBJECT: a sprite sheet of 3 cells in one row (each cell 320x384, full sheet 960x384), transparent background. Each cell shows the SAME cute small spaceship seen from DIRECTLY ABOVE (top-down view, like a vertical shoot-em-up game), POINTING UP, identical body, size and position in all three cells — only the tool on its nose changes. The ship: a rounded teardrop body in deep indigo (#3A2A8C) with a white belly stripe and a hot pink center stripe, two swept-back hot pink wings, two small engines at the back (at x about 103 and 217, ending at y about 370), and a round clear cyan glass bubble cockpit in the middle. Inside the cockpit, seen from above, ZURI's head: the top of her very long straight sleek JET-BLACK hair (black, with one flat blue-grey shine band) and a small cyan ribbon bow; NO helmet. The ship center is at (160, 200); the nose tool ends at y about 14, centered on x 160.
Cell 1 (left): nose tool = a LEAF BLOWER — a wide cone-shaped funnel nozzle in electric cyan (#2EC5FF) with a white rim, opening UPWARD.
Cell 2 (middle): nose tool = a WATER CANNON HOSE — a chunky royal-blue (#2E6BFF) nozzle with a small round water tank on one side and a white ring valve, opening UPWARD.
Cell 3 (right): nose tool = a PULL-BEAM DISH — a horseshoe-shaped antenna in hot pink (#FF3FA4) with two white tips, opening UPWARD.
No engine flame, no beams, no water, no wind coming out — the effects are added later.

COMPOSITION: three evenly spaced cells, each ship centered in its cell, pure top-down view, transparent background, no ground, no shadow, no text.

DO NOT INCLUDE: purple hair, violet hair, indigo hair, pink hair, pink hair streaks, dyed hair, colored hair, hair gradients, side view, three-quarter view, perspective, helmet, goggles, engine flames, laser beams, water jets, wind lines, cannons that look like weapons, missiles, guns, extra characters, different ship shapes between cells, background, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 5. `zuri.png` — 3 × 1 células de 512 × 640, alfa

A Zuri **da cintura para cima**, de frente (um pouco de três quartos), para o
close do tutorial. **Mesma roupa, mesmo cabelo, mesmo tamanho** nas três células.
A cabeça fica no alto, com o topo do cabelo em y ≈ 40, e a cintura é cortada na
borda de baixo.

| Célula | Expressão |
|---|---|
| 0 | **fala**: sorriso calmo, uma mão acenando na altura do ombro |
| 1 | **ops**: olhos arregalados, as duas mãos nas bochechas |
| 2 | **vitória**: punho para cima, piscando um olho, sorriso aberto |

**De quem ela é parecida:** a moça gótica de cabelo roxo das referências. Dela
vêm o **corte** (liso, muito comprido, franja reta, corte *hime*), o laço, o olhar
calmo de cílio grosso e o toque gótico-fofo. **O que muda:** a Zuri é **negra**,
de **olhos verdes**, **cabelo PRETO liso** (nada de roxo nem de mecha rosa,
pedido do usuário em 02/10/2026), **criança** e usa **roupa de piloto**.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; no gradients; the hair is flat jet-black with one flat blue-grey shine band; super-saturated candy palette; angular stylized shapes, long pointed hair strands; eyes with big colored iris, small pupil and thick upper lashes; four-point sparkles. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

SUBJECT: a character sheet of 3 cells in one row (each cell 512x640, full sheet 1536x640), transparent background, the SAME girl from the waist up in all three, same size and position, facing the viewer in a slight three-quarter turn. She is ZURI, a spaceship pilot: a Black girl about 12 years old, deep brown skin, big bright emerald-green eyes with thick upper lashes and a calm, cool, gothic-cute look; very long straight sleek hair in a hime cut — blunt straight bangs, blunt side locks to the chin, the rest falling straight down past the waist — the hair is JET-BLACK, flat, with one flat blue-grey shine band — NOT purple, NOT pink; a small cyan ribbon bow on one side of the hair. Outfit: a pilot jumpsuit in navy-black with a big white collar, a cyan ribbon bow at the neck, hot pink stripes on the shoulders, a small winged badge on the chest with no letters, lace-trimmed cuffs, black fingerless pilot gloves. NO helmet, NO goggles. Modest, fully covered, kid-friendly.
Cell 1 (left) TALK: calm friendly smile, mouth slightly open as if speaking, one hand raised at shoulder height waving.
Cell 2 (middle) OOPS: eyes wide open, small round mouth, both hands on her cheeks, a little sweat drop.
Cell 3 (right) WIN: big open smile, one eye winking, one fist raised above her head, two small sparkles near her.
In every cell the top of the hair is at about y 40 and the body is cut by the bottom edge at the waist.

COMPOSITION: three evenly spaced cells, figure centered in each, transparent background, no ground, no text.

DO NOT INCLUDE: purple hair, violet hair, indigo hair, pink hair, pink hair streaks, dyed hair, colored hair, hair gradients, helmet, goggles, adult woman, mature body, makeup, earrings, short skirt, dress, thigh-high stockings, high heels, revealing clothes, suggestive poses, light skin, blue eyes, curly hair, afro hair, different outfits between cells, background, the characters from the reference images, the purple-haired girl copied exactly, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, cat plush, ghosts, guns, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 6. `coisas.png` — 4 × 3 células de 384 × 384, alfa

**Vista 100% DE CIMA** (*top-down* de verdade, a câmera olhando reto para o
chão, como no mapa dos shooters verticais), igual à nave e ao cenário. Nada de
3/4 nem de lado. Cada coisa é desenhada **pelo que se vê do alto**:
- o montão de folhas é um **monte redondo**;
- a árvore é uma **copa redonda**, com o fogo **saindo da copa** em labaredas
  achatadas para fora, como um sol;
- a ovelha é um **corpo de lã oval** com a **cabeça para fora numa ponta**.

O rostinho fica **em cima** da copa e da cabeça da ovelha.

> **SEM FUNDO, SEM CANTEIRO** (correção do usuário em 02/10/2026: *"as texturas
> tem um fundo de grama verde. o certo é NÃO ter isso"*). A coisa vem
> **sozinha, recortada, sobre transparente**. O chão é a grama do código, que
> rola por baixo, e um disco de grama na célula vira um "botão" redondo
> carimbado no mapa.

Leitura por linha, da esquerda para a direita:

| # | Célula |
|---|---|
| 0 | **montão de folhas** laranja/amarelas/vermelhas |
| 1 | **o que sobra depois do vento:** uma florzinha rosa e um brilho, pequenos |
| 2 | **copa de árvore pegando fogo** (labaredas vermelho-amarelas em volta, rostinho aflito) |
| 3 | a mesma copa **apagada e sorrindo**, com gotinhas |
| 4 | **ovelhinha perdida**, encolhida, olhos assustados |
| 5 | a ovelhinha **feliz** (sendo puxada para cima), patinhas abertas em X |
| 6 | **vazia, 100% transparente**. O código esconde a coisa e não usa esta célula |
| 7 | **folhas encharcadas**, achatadas e escuras, com uma poça azul |
| 8 | copa com o **fogo grande**, labaredas o dobro de compridas |
| 9 | ovelhinha **molhada e brava**, lã murcha, com uma poça azul |
| 10 | ovelhinha **tonta**, de barriga para cima, espiral nos olhos, estrelinhas |
| 11 | **uma folha solta** (partícula), laranja, grande na célula |

**Tamanho e posição:**
- toda coisa fica **centrada em (192, 192)**, com no máximo **250 px** de
  largura;
- as labaredas do fogo podem chegar a **340 px** no total;
- a poça das células 7 e 9 faz parte da coisa e fica dentro desses 250 px.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette; angular stylized shapes with sharp points; four-point sparkle accents; cute expressive faces with simple eyes. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

CAMERA: strict TOP-DOWN view — the camera looks STRAIGHT DOWN at the ground, 90 degrees, orthographic, exactly like the map of a classic vertical shoot-em-up game. We only see the TOPS of things. No horizon, no side faces, no trunks, no legs standing, no three-quarter angle, no perspective.

SUBJECT: a game sprite sheet of ISOLATED CUTOUT OBJECTS, 4 columns x 3 rows, each cell 384x384, full sheet 1536x1152, FULLY TRANSPARENT BACKGROUND. Each object floats alone on transparency: NO ground under it, NO grass disc, NO circle, NO badge, NO base, NO patch, NO drop shadow — the game draws the ground separately. Every object is centered at (192, 192), at most 250 px wide (flames may reach 340 px). Faces are drawn ON TOP of the objects (on the tree crown, on the lamb's head), the way cute top-down games do it.
Row 1:
cell 1 — a PILE OF AUTUMN LEAVES seen from above: a round mound made of many pointy flat leaves in orange, yellow and red, overlapping in a spiral;
cell 2 — what is left after the wind: ONE small hot pink five-petal flower seen from above and one tiny four-point sparkle next to it, small, nothing else;
cell 3 — a TREE ON FIRE seen from above: a round bumpy green tree crown, with flat red and yellow flame tongues sticking OUTWARD all around its edge like a sun, and a worried little face on top of the crown;
cell 4 — the same tree crown SAVED: no flames, bright green, a happy smiling face on top, a few blue water drops on it;
Row 2:
cell 5 — a LOST LAMB seen from above: a fluffy white oval wool body made of round puffs, the small dark head poking out at the top end with two ears and big scared eyes, curled up;
cell 6 — the same lamb HAPPY, seen from above, four little legs spread out in an X like a starfish, big smile, as if being lifted toward the camera;
cell 7 — EMPTY: leave this cell completely transparent, draw nothing;
cell 8 — the leaf pile SOAKED: flattened into a dark brown wet mat lying in a small blue puddle, a few blue drops;
Row 3:
cell 9 — the tree crown with a BIG FIRE: flame tongues twice as long all around, the face scared;
cell 10 — the lamb WET and GRUMPY, seen from above: wool flattened and grey, lying in a small blue puddle, frowning face on its head;
cell 11 — the lamb DIZZY, seen from above lying on its back with legs up, spiral eyes, little stars circling;
cell 12 — ONE single big orange autumn LEAF seen flat from above, centered.

COMPOSITION: 12 evenly spaced cells in a 4x3 grid, every object centered in its cell, isolated cutouts on a fully transparent background, no text.

DO NOT INCLUDE: green grass circles, grass discs, round grass patches, ground tiles, bases, badges, round backgrounds behind the objects, drop shadows, cell borders, side view, front view, three-quarter view, isometric view, perspective, horizon, tree trunks, standing legs seen from the side, floating islands, full ground or background scenery, smoke clouds covering the cell, scary or realistic fire, burnt animals, injuries, characters, people, spaceship, beams, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, guns, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 7. `pecas.png` — 3 × 2 células de 256 × 256, alfa

O fundo redondo e colorido de cada botão é do **código**. Aqui vêm só os
**ícones**, que cabem num círculo de **~190 px** no meio da célula.

| # | Ícone |
|---|---|
| 0 | **assoprador**: o mesmo funil ciano do bico da nave, com 3 risquinhos de vento saindo |
| 1 | **água**: o mesmo bocal azul-royal, com um jatinho de 3 gotas saindo |
| 2 | **raio-puxa**: a mesma ferradura rosa, com 2 anéis de luz rosa à frente |
| 3 | **seta para CIMA**, gorda e arredondada, branca com contorno marinho (o código gira para os lados) |
| 4 | **uma gota d'água** azul (partícula) |
| 5 | **uma estrelinha de 4 pontas** amarelo-limão (partícula de brilho) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette; bold simple icon shapes readable at small size; four-point sparkles. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

SUBJECT: a game icon sheet, 3 columns x 2 rows, each cell 256x256, full sheet 768x512, transparent background. Each icon is centered and fits inside a 190 px circle in the middle of its cell, side view, pointing RIGHT where it has a direction:
cell 1 — LEAF BLOWER: a wide cone funnel nozzle in electric cyan (#2EC5FF) with a white rim, three short white wind swoosh lines coming out to the right;
cell 2 — WATER: a chunky royal-blue (#2E6BFF) hose nozzle with a ring valve, three blue water drops flying out to the right;
cell 3 — PULL BEAM: a horseshoe-shaped dish antenna in hot pink (#FF3FA4) with two white tips, two thin pink light rings in front of it to the right;
cell 4 — a chunky rounded ARROW POINTING UP, white fill with navy outline (the game rotates it to point left and right);
cell 5 — one blue WATER DROP;
cell 6 — one lemon-yellow (#FFE14D) FOUR-POINT SPARKLE STAR.

COMPOSITION: 6 evenly spaced cells, each icon centered, no circle background behind the icons, transparent background, no text.

DO NOT INCLUDE: round button backgrounds, frames, guns, pistols, cannons that look like weapons, magnets with red and blue poles, characters, faces, hands, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 8. `cover-nave-multiuso.png` — 1672 × 941, opaco, COM título

A capa tem o nome escrito: **NAVE MULTIUSO**, num letreiro no alto, em letras
gordas pop com contorno marinho e degradê rosa→violeta. Na cena:
- a nave da Zuri subindo pela cena, vista de cima e um pouco inclinada, sobre o mapa da cidadezinha (rio, plantações, telhados);
- o assoprador soltando um vento que espalha folhas coloridas;
- mais acima, no chão, uma arvorezinha pegando fogo e uma ovelhinha assustada;
- estrelinhas de 4 pontas.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design, like a bold animated-series poster; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; smooth two-color gradients only in hair, sky and glows; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, deep indigo #241A5E, lemon yellow #FFE14D, violet #9B5CFF); angular stylized shapes; lots of four-point sparkle stars and starbursts. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

SUBJECT: the cover of a kids' game called "NAVE MULTIUSO", 1672x941, landscape. At the top center, a big pop LOGO with the exact words "NAVE MULTIUSO" in chunky rounded letters with a thick navy outline and a hot pink to violet gradient fill, with a small cyan lightning-spark accent — spelled exactly N-A-V-E M-U-L-T-I-U-S-O. Below, a cheerful countryside town seen from above at a steep angle, like a vertical shoot-em-up map: a winding cyan river, striped crop fields, little house roofs, round tree crowns. In the lower center, a cute small spaceship seen from above at a slight angle (rounded deep indigo and white body with hot pink wings, a clear cyan glass bubble cockpit, a cyan funnel leaf-blower nozzle on its nose) flies UP the image; in the cockpit sits ZURI, a Black girl about 12 years old with deep brown skin, bright emerald-green eyes with thick lashes, very long straight sleek JET-BLACK hair in a hime cut with blunt bangs, a navy-black pilot jumpsuit with a white collar and a cyan ribbon bow, NO helmet, confident smile. A wide stream of white wind from the nozzle scatters a swirl of orange, yellow and red autumn leaves ahead of it. Further up on the ground: a little cartoon tree with a small flat flame on its crown and a worried face, and a scared fluffy white lamb. Sparkles everywhere.

COMPOSITION: full-bleed opaque poster, logo on top with clear space, ship in the lower center, the tree and the lamb in the middle band, only the title text, no other words.

DO NOT INCLUDE: purple hair, violet hair, indigo hair, pink hair, pink hair streaks, dyed hair, colored hair, hair gradients, any other text, misspelled title, helmet, goggles, adult woman, guns, lasers, weapons, explosions, scary fire, dark night sky, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, suggestive poses, revealing clothes, high heels, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 9. Espaço e Lua (N2 onda 3, N3)

O **chão do espaço** (fundo escuro estrelado) e o **chão da Lua** (cinza com
crateras) são do código, em Graphics, assim como os rastros de velocidade.

As **coisas** têm o **mesmo layout de 12 células** da `coisas.png`, porque o
código usa os mesmos números de célula. Muda só o desenho:

| Célula | Terra | Espaço | Lua |
|---|---|---|---|
| 0 (assoprador) | montão de folhas | nuvem de poeira das estrelas | montinho de poeira da Lua |
| 1 (sobra) | florzinha | estrelinha | cristalzinho |
| 2 (água) | árvore pegando fogo | meteoro pegando fogo | robô lunar pegando fogo |
| 3 (salvo) | árvore salva | meteoro apagado | robô salvo |
| 4 (raio-puxa) | ovelhinha | ovelha astronauta | coelhinho da Lua |
| 5 | ovelha feliz | ovelha astronauta feliz | coelhinho feliz |
| 6 | vazia | vazia | vazia |
| 7 (água errada) | folhas encharcadas | poeira encharcada | poeira virou lama |
| 8 (vento errado) | fogo grande | meteoro com fogo grande | robô com fogo grande |
| 9 (água errada) | ovelha molhada | ovelha astronauta molhada | coelhinho molhado |
| 10 (vento errado) | ovelha tonta | ovelha astronauta tonta | coelhinho tonto |
| 11 (partícula) | folha | pedacinho de poeira violeta | pedacinho de poeira cinza |

### `coisas-espaco.png` — 4 × 3 células de 384 × 384, alfa

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette; angular stylized shapes with sharp points; four-point sparkle accents; cute expressive faces with simple eyes. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

CAMERA: strict TOP-DOWN view — the camera looks STRAIGHT DOWN, 90 degrees, orthographic, exactly like a classic vertical shoot-em-up game in outer space. No horizon, no side view, no perspective.

SUBJECT: a game sprite sheet of ISOLATED CUTOUT OBJECTS floating in OUTER SPACE, 4 columns x 3 rows, each cell 384x384, full sheet 1536x1152, FULLY TRANSPARENT BACKGROUND. Each object floats alone on transparency: NO background, NO stars behind it, NO base, NO disc, NO drop shadow. Every object is centered at (192, 192), at most 250 px wide (flames may reach 340 px). Faces are drawn ON TOP of the objects.
Row 1:
cell 1 — a STARDUST CLOUD seen from above: a round fluffy cluster of overlapping violet, hot pink and lilac dust puffs with three tiny yellow sparkles;
cell 2 — what is left after the wind: ONE small twinkling lemon-yellow four-point star, small, nothing else;
cell 3 — a METEOR ON FIRE seen from above: a cute round lilac-grey space rock with two small craters and a worried little face, flat red and yellow flame tongues sticking OUTWARD all around its edge like a sun;
cell 4 — the same meteor SAVED: no flames, happy smiling face, a few blue water drops on it and one small white steam puff;
Row 2:
cell 5 — a LOST ASTRONAUT LAMB seen from above: a fluffy white lamb curled up, small dark head with big scared eyes, inside a round clear glass SPACE HELMET bubble with a cyan rim and a white shine;
cell 6 — the same astronaut lamb HAPPY, four little legs spread out in an X like a starfish, big smile, still inside the glass bubble helmet;
cell 7 — EMPTY: leave this cell completely transparent, draw nothing;
cell 8 — the stardust SOAKED: clumped into one flat dark purple wet blob with blue water drops around it;
Row 3:
cell 9 — the meteor with a BIG FIRE: flame tongues twice as long all around, the face scared;
cell 10 — the astronaut lamb WET and GRUMPY: wool flattened and grey, blue water drops on the inside of the glass helmet, frowning;
cell 11 — the astronaut lamb DIZZY, upside down inside its glass helmet, spiral eyes, little yellow stars circling;
cell 12 — ONE small round violet stardust puff with a tiny white sparkle (a particle), centered.

COMPOSITION: 12 evenly spaced cells in a 4x3 grid, every object centered in its cell, isolated cutouts on a fully transparent background, no text.

DO NOT INCLUDE: black or starry backgrounds, planets behind the objects, round bases, discs, drop shadows, cell borders, side view, front view, three-quarter view, perspective, explosions, scary or realistic fire, burnt animals, injuries, people, characters, spaceships, beams, lasers, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, guns, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

### `coisas-lua.png` — 4 × 3 células de 384 × 384, alfa

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette; angular stylized shapes with sharp points; four-point sparkle accents; cute expressive faces with simple eyes. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

CAMERA: strict TOP-DOWN view — the camera looks STRAIGHT DOWN at the surface of the MOON, 90 degrees, orthographic, like a classic vertical shoot-em-up game. We only see the TOPS of things. No horizon, no side view, no perspective.

SUBJECT: a game sprite sheet of ISOLATED CUTOUT OBJECTS on the MOON, 4 columns x 3 rows, each cell 384x384, full sheet 1536x1152, FULLY TRANSPARENT BACKGROUND. Each object floats alone on transparency: NO moon ground under it, NO craters behind it, NO base, NO disc, NO drop shadow. Every object is centered at (192, 192), at most 250 px wide (flames may reach 340 px). Faces are drawn ON TOP of the objects.
Row 1:
cell 1 — a MOON DUST PILE seen from above: a round mound of overlapping soft grey and lilac-grey dust puffs;
cell 2 — what is left after the wind: ONE small shiny cyan moon crystal with a tiny white sparkle, small, nothing else;
cell 3 — a little MOON ROVER ON FIRE seen from above: a cute lemon-yellow box-shaped rover with four dark round wheels at the corners, a tiny antenna with a pink ball, a worried little face on its top, flat red and yellow flame tongues sticking OUTWARD all around it like a sun;
cell 4 — the same rover SAVED: no flames, happy smiling face on top, a few blue water drops on it;
Row 2:
cell 5 — a LOST MOON BUNNY seen from above: a small white bunny curled up, two long ears with pink insides, big scared eyes, inside a round clear glass SPACE HELMET bubble with a cyan rim and a white shine;
cell 6 — the same moon bunny HAPPY, little legs spread out like a starfish, big smile, still inside the glass bubble helmet;
cell 7 — EMPTY: leave this cell completely transparent, draw nothing;
cell 8 — the moon dust turned into MUD: one flat dark grey wet blob with blue water drops around it;
Row 3:
cell 9 — the rover with a BIG FIRE: flame tongues twice as long all around, the face scared;
cell 10 — the moon bunny WET and GRUMPY: fur flattened and bluish, blue water drops inside the glass helmet, frowning;
cell 11 — the moon bunny DIZZY, upside down inside its glass helmet, spiral eyes, little yellow stars circling;
cell 12 — ONE small round soft grey dust puff (a particle), centered.

COMPOSITION: 12 evenly spaced cells in a 4x3 grid, every object centered in its cell, isolated cutouts on a fully transparent background, no text.

DO NOT INCLUDE: grey moon ground under the objects, crater backgrounds, starry backgrounds, round bases, discs, drop shadows, cell borders, side view, front view, three-quarter view, perspective, explosions, scary or realistic fire, burnt animals, injuries, people, astronauts, characters, spaceships, beams, lasers, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, guns, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

### `cenario-espaco.png` — 4 × 3 células de 256 × 256, alfa

Os elementos aparecem pequenos nas laterais e passam mais devagar que as
coisas, dando a impressão de que estão longe.

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF); angular stylized shapes; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

CAMERA: strict TOP-DOWN view of outer space, like the background of a classic vertical shoot-em-up game. No horizon, no perspective.

SUBJECT: a sprite sheet of ISOLATED OUTER-SPACE SCENERY PIECES, 4 columns x 3 rows, each cell 256x256, full sheet 1024x768, FULLY TRANSPARENT BACKGROUND. Each piece floats alone on transparency, centered in its cell, filling about 80% of it: NO black background, NO stars behind it, NO drop shadow — the game draws the dark starry sky separately.
Row 1:
cell 1 — a small hot pink PLANET with a lemon-yellow ring around it;
cell 2 — a cyan PLANET with three darker round craters;
cell 3 — a tiny lemon-yellow PLANET with orange stripes;
cell 4 — one lilac-grey ASTEROID rock with two small craters;
Row 2:
cell 5 — a cluster of three lilac-grey ASTEROIDS of different sizes;
cell 6 — a small white COMET with a pale cyan glowing tail pointing UP;
cell 7 — a small violet SPIRAL GALAXY with hot pink arms and a white center;
cell 8 — a soft NEBULA puff: overlapping translucent violet, pink and lilac clouds, no outline;
Row 3:
cell 9 — a cluster of five lemon-yellow four-point SPARKLE STARS of different sizes;
cell 10 — a small SATELLITE seen from above: white body, two royal-blue solar panels with a grid, a pink dot;
cell 11 — a small ring-shaped SPACE STATION seen from above: a white ring with four spokes and a cyan hub;
cell 12 — a tiny grey MOON with two craters.

COMPOSITION: 12 evenly spaced cells in a 4x3 grid, every piece centered in its cell, isolated cutouts on a fully transparent background, no text.

DO NOT INCLUDE: black backgrounds, starfield backgrounds, cell borders, drop shadows, side view, perspective, the Earth, rockets, spaceships, astronauts, aliens, characters, people, animals, faces, explosions, lasers, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, guns, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

### `cenario-lua.png` — 4 × 3 células de 256 × 256, alfa

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette with soft lilac-greys for the moon; angular stylized shapes; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

CAMERA: strict TOP-DOWN view — the camera looks STRAIGHT DOWN at the surface of the MOON, 90 degrees, orthographic, like a classic vertical shoot-em-up game map. We only see the tops of things. No horizon, no perspective.

SUBJECT: a sprite sheet of ISOLATED MOON-SURFACE SCENERY PIECES, 4 columns x 3 rows, each cell 256x256, full sheet 1024x768, FULLY TRANSPARENT BACKGROUND. Each piece floats alone on transparency, centered in its cell, filling about 80% of it: NO grey ground around it, NO drop shadow — the game draws the grey moon ground separately.
Row 1:
cell 1 — one BIG round CRATER seen from above: lilac-grey bowl with a darker inside, navy rim and a white flat highlight;
cell 2 — one SMALL round CRATER, same style;
cell 3 — a cluster of three CRATERS of different sizes;
cell 4 — one grey BOULDER seen from above with a white flat highlight;
Row 2:
cell 5 — a cluster of three small grey ROCKS;
cell 6 — a small LUNAR BASE DOME seen from above: a round clear cyan glass dome with a grey ring around it and white shine;
cell 7 — a white RADAR DISH antenna seen from above with three thin legs and a pink center;
cell 8 — a vertical TRAIL of five astronaut boot FOOTPRINTS pressed into the dust;
Row 3:
cell 9 — a cluster of three shiny cyan MOON CRYSTALS seen from above;
cell 10 — a short vertical segment of ROVER TRACKS: two parallel rows of small dark rectangles;
cell 11 — a round LANDING PAD seen from above: grey circle with two lemon-yellow rings, no letters;
cell 12 — a few scattered small grey PEBBLES.

COMPOSITION: 12 evenly spaced cells in a 4x3 grid, every piece centered in its cell, isolated cutouts on a fully transparent background, no text.

DO NOT INCLUDE: grey ground squares, full moon surface backgrounds, starry sky, cell borders, drop shadows, side view, perspective, flags with symbols, astronauts, aliens, characters, people, animals, faces, rockets, spaceships, explosions, lasers, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, angel halos, afro man, green dog creature, ghosts, guns, weapons, logos, text, letters, numbers, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

