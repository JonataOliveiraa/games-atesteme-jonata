# Rota da Madrugada — texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF05CO11/rota-da-madrugada/`

**O N1 roda inteiro em Graphics** (pedido do usuário, 20/10/2026: *"use Graphics. as texturas eu adicionarei dps"*). Cada desenho de reserva em `scenes/art.ts` é assado numa textura com **a mesma chave e a mesma grade** do PNG abaixo: quando o arquivo chegar na pasta, o `BootScene` carrega e ele toma o lugar do desenho, sem mexer em código.

Fica sempre em Graphics: a estrada e as faixas, o chão, o escuro e o facho do farol, a chuva, as gotas e o vidro embaçado, as colunas do para-brisa, a central e os seus botões, o cabeçalho, as legendas, as ondas da buzina e o envelope da mensagem.

| # | Arquivo | Tamanho | Grade | Alfa | O que é |
|---:|---|---|---|---|---|
| 1 | `ceu.png` | 1280 × 300 | imagem única | opaco | céu da noite com lua, estrelas e morros escuros na base |
| 2 | `painel.png` | 1280 × 200 | imagem única | alfa | o painel do carro, visto do banco do motorista |
| 3 | `volante.png` | 384 × 384 | imagem única | alfa | o volante, com a buzina no miolo |
| 4 | `icones.png` | 768 × 192 | 4 × 1 de 192 | alfa | BUZINA, FAROL, MENSAGEM, LIMPADOR |
| 5 | `cenario.png` | 1152 × 384 | 3 × 1 de 384 | alfa | poste aceso, árvore, arbusto |
| 6 | `casas.png` | 1152 × 768 | 3 × 2 de 384 | alfa | 3 casas; em cima apagadas, embaixo com a janela acesa |
| 7 | `cachorro.png` | 768 × 256 | 3 × 1 de 256 | alfa | dormindo, acordado, correndo |
| 8 | `dona-cida.png` | 512 × 256 | 2 × 1 de 256 | alfa | acenando, segurando a encomenda |
| 9 | `limpador.png` | 512 × 64 | imagem única | alfa | o braço do limpador, deitado, pivô na ponta esquerda |
| 10 | `cover-rota-da-madrugada.png` | 1672 × 941 | — | opaco | a capa, **com o título** |

## 1. A linha de arte: vetor geométrico chapado

A mesma do Pula-Pula e do Cabo Certo ([`references/ESTILO-VETOR-GEOMETRICO.md`](../../../../references/ESTILO-VETOR-GEOMETRICO.md)). Anexe em **toda geração** `references/23-vetor-geometrico-a.webp` e `references/24-vetor-geometrico-b.png`. Forma chapada de canto redondo, sem contorno, sem sombra, cor saturada — é o que o Graphics já desenha, e é o que mantém a arte e a interface na mesma família. O elenco das referências (a coruja verde, o urso, as pessoas da marca) vai no negativo.

**Paleta da noite:** azul-marinho e roxo no céu, verde-petróleo escuro no chão, amarelo-quente nas luzes (postes, janelas, farol), e o carrinho por dentro em azul-petróleo com detalhes turquesa. Nada de preto puro.

## 2. Regras gerais

- **Nenhum texto** nas imagens (só a capa tem o título). O nome dos botões é do código.
- Fundo **transparente** em tudo que tem alfa; nada de chão, sombra projetada ou moldura em volta.
- Cada célula com **uma peça só**, centrada, com uns 8 % de respiro, **com a base no chão da célula** (o pé do poste, da árvore, da casa e do cachorro encostam na borda de baixo).
- Gente de ~4 cabeças, como nas referências, não chibi.

## 3. Os prompts

### `ceu.png` — 1280 × 300, opaco

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: one wide strip, fully OPAQUE, 1280 x 300, full-bleed, no frame.

SCENE: a calm night sky seen through a car windshield, flat deep navy at the top
becoming a flat purple band near the bottom (two flat bands, not a gradient).
A big pale cream full moon on the upper right with three soft round craters.
Small white dot stars and two little four-point sparkles spread across the sky.
Along the bottom edge, a row of low rounded hills in two flat dark teal tones,
their tops between 230 and 285 px from the top, filling the strip to the bottom
edge. No road, no houses, no people.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, frames, borders, outlines, black ink lines, shading, gradients,
3D render, photorealistic, a face on the moon, planets, clouds covering the moon.
~~~

### `painel.png` — 1280 × 200, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: 1280 x 200, TRANSPARENT background above the dashboard.

SCENE: the dashboard of a small cute electric delivery car, seen from the
driver's seat, filling the full width at the bottom of the image. Its top edge
is one long soft wave that sits about 30 px below the top of the image. Flat
dark petrol-blue body with one slightly darker flat panel along the top lip and
a thin turquoise trim line. Leave the middle-right area plain and empty (a
screen will be drawn there by the game). No steering wheel (it is a separate
image), no buttons, no screen, no gauges with numbers.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, steering wheel, screens, buttons, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, background behind the dashboard.
~~~

### `volante.png` — 384 × 384, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: 384 x 384, TRANSPARENT background, the object centered.

SUBJECT: a chunky round steering wheel seen straight from the driver's seat:
a thick dark navy ring, three capsule spokes, and a big round turquoise hub in
the middle with a simple white horn icon (a little trumpet shape) on it.
Flat, friendly, toy-like.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, car brand emblem, text,
letters, numbers, hands, dashboard, outlines, black ink lines, shading,
gradients, 3D render, photorealistic.
~~~

### `icones.png` — 768 × 192, grade 4 × 1 de 192, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 768 x 192 with FOUR icons side by side, one per 192 x 192
cell, each centered with breathing room, TRANSPARENT background, no cell lines.

ICONS, left to right, chunky and readable at small size, in white and warm
yellow so they read on a dark blue button:
1. HORN: a car horn / little trumpet with three curved sound waves.
2. HEADLIGHT: a rounded car headlight lamp shining three straight light rays
   to the right.
3. MESSAGE: a rounded chat bubble with a tiny paper plane flying out of it.
4. WIPER: a curved windshield with one wiper arm and two water drops.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, button backgrounds, cell lines, outlines, black ink lines, shading,
gradients, 3D render, photorealistic.
~~~

### `cenario.png` — 1152 × 384, grade 3 × 1 de 384, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 1152 x 384 with THREE roadside objects at NIGHT, one per
384 x 384 cell, each standing with its base touching the bottom of its cell,
TRANSPARENT background, no ground, no cast shadow, no cell lines.

OBJECTS, left to right:
1. STREET LAMP: a tall thin dark-blue capsule pole with a curved arm and a
   round warm-yellow lit lamp at the top (no light cone, no glow).
2. TREE: a round night tree, dark teal-green rounded crown made of three
   circles, short brown trunk.
3. BUSH: a low wide rounded bush in dark teal-green.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, ground, grass strip, cast shadows, light cones, glow halos,
outlines, black ink lines, shading, gradients, 3D render, photorealistic.
~~~

### `casas.png` — 1152 × 768, grade 3 × 2 de 384, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 1152 x 768: three small village houses at NIGHT, one per
384 x 384 cell, base touching the bottom of the cell, TRANSPARENT background,
no ground, no cell lines. The TOP ROW has every window DARK (dark navy glass);
the BOTTOM ROW repeats the SAME three houses, identical in shape and position,
with ONE window lit in warm yellow.

HOUSES, left to right, muted night colours:
1. a dusty-lilac house with a rounded-triangle roof and two windows;
2. a muted-mint house, a little wider, with a door and one big window;
3. the delivery house: muted peach walls, a coral roof, a round window and a
   front door with a little doormat. In the bottom row its round window is lit.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers, house
numbers, signs, watermarks, people, ground, cast shadows, glow halos, outlines,
black ink lines, shading, gradients, 3D render, photorealistic.
~~~

### `cachorro.png` — 768 × 256, grade 3 × 1 de 256, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 768 x 256, the SAME cute caramel dog in three poses, one per
256 x 256 cell, base touching the bottom of the cell, TRANSPARENT background,
no ground, no cell lines. Seen from the front, as if lying on the road in front
of a car.

POSES, left to right:
1. ASLEEP: curled up in a round ball, eyes closed (two little curved lines),
   floppy ears, tail around the body.
2. AWAKE: sitting up, eyes open (rounded square eyes with black pupils), ears
   up, surprised and friendly.
3. RUNNING AWAY: seen from the side running to the right, ears flying, happy.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, "Zzz" letters,
watermarks, collar tags with text, ground, cast shadows, outlines, black ink
lines, shading, gradients, 3D render, photorealistic, angry dog, teeth.
~~~

### `dona-cida.png` — 512 × 256, grade 2 × 1 de 256, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 512 x 256, the SAME friendly elderly woman in two poses, one
per 256 x 256 cell, feet touching the bottom of the cell, TRANSPARENT
background, no cell lines. About 4 heads tall, like the reference people.

CHARACTER: Dona Cida, a cheerful grandmother with a grey bun, round glasses,
a lilac house robe and slippers.
POSES, left to right:
1. waving hello with one hand raised, big smile;
2. holding a small cardboard delivery box with both hands, happy.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, ground, door, cast shadows, outlines, black ink lines, shading,
gradients, 3D render, photorealistic.
~~~

### `limpador.png` — 512 × 64, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: 512 x 64, TRANSPARENT background.

SUBJECT: one car windshield wiper lying perfectly horizontal: a round dark
pivot cap at the far LEFT edge, a thin dark navy arm going right, and a long
flat black-navy rubber blade along the right two thirds. Centered vertically.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, watermarks, glass,
water drops, car, outlines, black ink lines, shading, gradients, 3D render,
photorealistic.
~~~

### `cover-rota-da-madrugada.png` — 1672 × 941, opaco

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

A wide game cover, 1672 x 941, fully opaque. A cute small turquoise electric
delivery car with round headlights drives toward the viewer on a curvy village
road at night, its two warm-yellow headlight beams lighting the road. A
cardboard delivery box on its roof rack. Around it, the things its smart
computer can do, shown as big friendly icons floating in white rounded bubbles:
a horn with sound waves, a headlight with rays, a chat bubble with a paper
plane, a wiper with drops. On the roadside a sleepy caramel dog, little houses
with dark windows and one lit window, a full moon and stars in a navy sky.
Big, round, colorful title "ROTA DA MADRUGADA" centered at the top, with a dark
outline around the letters.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, car brand emblems, other text
besides the title, outlines on the drawing, shading, gradients, 3D render,
photorealistic.
~~~

## 4. Quando a arte chegar

- Meça a caixa alfa de cada célula (`padrao-remake-jogo`: corridas de colunas na folha inteira antes de cortar por célula). Casas, poste, árvore e cachorro são ancorados pela **base da célula** (`setOrigin(0.5, 1)`).
- A janela acesa da casa da Dona Cida é a linha de baixo da `casas.png`; o código só troca o quadro (`c2` → `c5`), não pinta janela por cima.
- `ceu.png` é posto em y 0 e o horizonte da estrada está em y 300: os morros têm de encostar na borda de baixo.
- O braço do limpador gira pelo pivô (`setOrigin(0.06, 0.5)`); se a tampa do pivô sair mais para dentro, ajuste `WIPER.originX` em `data/layout.ts`.

## 5. Níveis 2 e 3 (PLANEJAMENTO §7)

Mesma linha de arte, mesmas regras gerais (§1 e §2), as mesmas duas referências anexadas em toda geração.

| # | Arquivo | Tamanho | Grade | Alfa | O que é |
|---:|---|---|---|---|---|
| 11 | `icones2.png` | 768 × 192 | 4 × 1 de 192 | alfa | GPS, ALTO-FALANTE, MAPA, RÁDIO |
| 12 | `ceu-serra.png` | 1280 × 300 | imagem única | opaco | céu da noite com serras pontudas na base (N2 e N3) |
| 13 | `cenario2.png` | 1536 × 384 | 4 × 1 de 384 | alfa | pinheiro, placa de duas setas, torre de celular, cavalete listrado |
| 14 | `vila-longe.png` | 1536 × 384 | 2 × 1 de 768 × 384 | alfa | a vila no morro do outro lado do vale; à esquerda apagada, à direita acesa |
| 15 | `vaca.png` | 768 × 256 | 3 × 1 de 256 | alfa | parada, assustada, saindo de lado |
| 16 | `guincho.png` | 1024 × 512 | 2 × 1 de 512 | alfa | o guincho de frente; o guincho de costas puxando |
| 17 | `mapa.png` | 768 × 512 | imagem única | alfa | o mapa de papel aberto, sem rota (a rota é desenhada pelo código) |

Fica em Graphics também: a estrada que se divide, a lama do atoleiro, as barrinhas do sinal, o mapinha da tela do GPS, a rota no mapa de papel, a seta verde na estrada, as ondas do alto-falante e do rádio.

### `icones2.png` — 768 × 192, grade 4 × 1 de 192, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 768 x 192 with FOUR icons side by side, one per 192 x 192
cell, each centered with breathing room, TRANSPARENT background, no cell lines.

ICONS, left to right, chunky and readable at small size, in white and warm
yellow so they read on a dark blue button, the same family as a horn, a
headlight, a chat bubble and a wiper icon:
1. GPS: a round map pin (teardrop shape with a hole) standing on a short
   curved route line made of three dots.
2. LOUDSPEAKER: a megaphone / roof loudspeaker horn pointing right with three
   BIG curved sound waves, bigger and wider than a car horn.
3. PAPER MAP: a folded paper map in three panels (zig-zag folds), with one
   curvy road line across it, no pin.
4. RADIO: a walkie-talkie two-way radio standing upright, a short antenna on
   top, a speaker grille of round dots, and two small signal arcs beside the
   antenna.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, button backgrounds, cell lines, outlines, black ink lines, shading,
gradients, 3D render, photorealistic, smartphone.
~~~

### `ceu-serra.png` — 1280 × 300, opaco

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: one wide strip, fully OPAQUE, 1280 x 300, full-bleed, no frame.

SCENE: a calm night sky over a mountain range seen through a car windshield,
flat deep navy at the top becoming a flat purple band near the bottom (two flat
bands, not a gradient). A thin pale cream crescent moon on the upper left.
Small white dot stars and two little four-point sparkles. Along the bottom, a
row of TALL rounded-triangle mountains (soft rounded peaks, like rounded
trapezoids) in two flat dark teal tones, the back row taller, their peaks
between 150 and 240 px from the top, filling the strip to the bottom edge. No
road, no houses, no lights on the mountains, no people.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, frames, borders, outlines, black ink lines, shading, gradients,
3D render, photorealistic, a face on the moon, snow caps, clouds, houses.
~~~

### `cenario2.png` — 1536 × 384, grade 4 × 1 de 384, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 1536 x 384 with FOUR roadside objects at NIGHT, one per
384 x 384 cell, each standing with its base touching the bottom of its cell,
TRANSPARENT background, no ground, no cast shadow, no cell lines.

OBJECTS, left to right, muted night colours:
1. PINE TREE: a tall mountain pine made of three stacked rounded triangles in
   dark teal-green, a short brown trunk.
2. FORK SIGN: a road sign on one dark-blue capsule post: a rounded yellow
   board with one arrow pointing up-left and one arrow pointing up-right
   (a "Y" fork), no words.
3. CELL TOWER: a tall thin lattice phone tower made of capsules, dark blue,
   with two small rounded antenna panels near the top and one tiny warm red
   light on the tip (no glow, no waves).
4. ROAD BARRIER: a short wooden roadblock trestle with two legs and one wide
   board striped in coral and cream diagonal stripes, a small round warm
   amber lamp on top.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, ground, grass strip, cast shadows, light cones, glow halos, radio
waves, outlines, black ink lines, shading, gradients, 3D render, photorealistic.
~~~

### `vila-longe.png` — 1536 × 384, grade 2 × 1 de 768 × 384, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 1536 x 384 made of TWO cells of 768 x 384, TRANSPARENT
background, no cell lines. Both cells show the SAME far-away little village on
a rounded hill at NIGHT, identical in shape and position: about nine tiny
houses with rounded-triangle roofs and a small church with a bell tower,
spread on a low wide dark-teal hill whose base touches the bottom of the cell.
LEFT cell: every window DARK (dark navy). RIGHT cell: EVERY window lit in warm
yellow. Tiny and simple, seen from far across a valley.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, sky, moon, stars, road, people, glow halos, light beams, outlines,
black ink lines, shading, gradients, 3D render, photorealistic.
~~~

### `vaca.png` — 768 × 256, grade 3 × 1 de 256, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 768 x 256, the SAME cute round cow in three poses, one per
256 x 256 cell, hooves touching the bottom of the cell, TRANSPARENT background,
no ground, no cell lines. Cream-white cow with big soft brown patches, a pink
round muzzle, little curved horns, a small bell on the neck.

POSES, left to right:
1. STANDING CALM: facing the viewer straight on, as if standing on the road
   in front of a car, sleepy half-closed eyes, chewing.
2. STARTLED: facing the viewer, eyes wide open (rounded square eyes with
   black pupils), ears up, all four hooves a little off the ground.
3. WALKING AWAY: seen from the side walking to the right, calm, tail swinging.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, "Moo",
watermarks, ground, grass, cast shadows, outlines, black ink lines, shading,
gradients, 3D render, photorealistic, angry cow, bull, udder details.
~~~

### `guincho.png` — 1024 × 512, grade 2 × 1 de 512, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 1024 x 512, the SAME small friendly tow truck in two views,
one per 512 x 512 cell, wheels touching the bottom of the cell, TRANSPARENT
background, no ground, no cell lines. Warm orange cab, a round amber roof
beacon, big round headlights, chunky dark wheels.

VIEWS, left to right:
1. FRONT: seen straight from the front, as if coming toward the viewer on a
   road at night: round warm-yellow headlights ON (flat yellow circles, no
   glow), the roof beacon, a friendly grille.
2. BACK: seen straight from behind, driving away: the tow boom with a hook and
   a short cable hanging down in the middle, two small red rear lights.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, car brand emblems, text,
letters, numbers, license plates, watermarks, driver, people, ground, cast
shadows, light beams, glow halos, outlines, black ink lines, shading,
gradients, 3D render, photorealistic.
~~~

### `mapa.png` — 768 × 512, alfa

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: 768 x 512, TRANSPARENT background, the map filling about 90 % of the
image, seen straight from above.

SUBJECT: an old unfolded paper road map with four vertical fold panels (each
panel a slightly different flat cream tone, like folds), rounded corners.
On it, flat simple shapes only: soft green hill blobs, a light blue river
curving across, two little pine clusters, a few tiny house squares in one
corner, and a grey road network: one road coming from the bottom middle and
splitting into two roads, one to the upper left and one to the upper right.
NO route highlight, NO pin, NO arrow (the game draws those).

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
compass letters, legend, watermarks, hands, table, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, coffee stains, torn edges.
~~~

### Quando a arte dos N2/N3 chegar

- `icones2.png` entra na mesma central: o ícone de cada aparelho vem de `ICON_CELL` (folha + célula).
- `vila-longe.png` é posta fixa no horizonte (não vem pela estrada); o código troca a célula da apagada para a acesa (o alto-falante) ou acende só uma janelinha em Graphics (a mensagem errada). Meça a caixa alfa das janelas no MANIFEST e copie os centros (em px da célula 768 × 384) para `VILLAGE.windows` em `data/layout.ts`; a 5ª janela (índice 4) é a que a mensagem errada acende.
- `guincho.png`: a célula da frente chega pela estrada como os outros adereços (`setOrigin(0.5, 1)`); a de costas aparece quando ele puxa o carro.
- `mapa.png` abre por cima do painel com um `scaleY` de 0 a 1; a rota é desenhada pelo código sobre as estradas da imagem: anote no MANIFEST onde ficam a boca da estrada e as duas pontas da forquilha (em fração da imagem).


## Registro de geração N1 e capa — Aquarela — 20/10/2026

Foram usados **integralmente e sem alteração os dez prompts completos do §3** (STYLE + corpo + DO NOT INCLUDE), com as duas referências `23-vetor-geometrico-a.webp` e `24-vetor-geometrico-b.png` anexadas em cada geração. Ferramenta: built-in `image_gen`. Os textos exatos usados e caminhos dos originais também estão registrados em `outputs/rota-da-madrugada/raw/prompts-n1-aquarela.json`.

Todos os PNGs finais foram salvos no destino deste documento, nos tamanhos e grades da tabela; oito com alfa e céu/capa opacos. Originais em `outputs/rota-da-madrugada/raw/`. Grades, conteúdos, caixas e bases: `src/assets/games/EF05CO11/rota-da-madrugada/MANIFEST-N1-AQUARELA.md`. Título da capa conferido: **ROTA DA MADRUGADA**. Sem alteração de código nem dos arquivos do §5.

| Arquivo | SHA-256 do prompt integral (UTF-8) |
|---|---|
| ceu.png | 0cc80742155d4164b4408b7c51955598a547337259e9318459d4a4a82dd4f9c5 |
| painel.png | 3d08c5fac28cda6fa3a6f5d17a5291bd891294754965079c2e312baccbdeaecb |
| volante.png | eb9a0a15dd9b6db192710f1a732302c811c2bc494c8b83f52c28a7eb801de1fa |
| icones.png | e1b2f999e4086aeba71489b64029815a0931c85c514f5d6116b7efacc4d621eb |
| cenario.png | 5d201b25c79b42df3317d6435ba46c0d003f1de22d5561ae0e5436c042844f11 |
| casas.png | 7d3ddfe4520ae61f251d805582992070775c70034c7b8e59fdccd638905b3aaa |
| cachorro.png | 0b6721e35554eb5d1d5e510ecc51ae3fe808d1ca9356f6d7db3683c3beb6d133 |
| dona-cida.png | c3d4ada8d673eec106efc8327a250c29dc8c7e309dd06a8d56172d1abfe0a1dc |
| limpador.png | 2608e75146b846eeaa90d64552f7e9e659c0dc03b69ef70bea114ee7befc8d1f |
| cover-rota-da-madrugada.png | 8901f5a5e05bd45c1ac0eed7886ebce369bdb201a410e71b9e6065a45b5fb449 |


## Registro de geração N2/N3 — Guache — 20/10/2026

Ferramenta: imagegen integrada. Referências 23 e 24 anexadas a todas as gerações. Cada prompt do §5 enviado inteiro. Originais em `outputs/rota-da-madrugada/raw/`. Ajustes finais por recorte e escala uniforme por folha; céu recortado na base após escala proporcional. Nenhum código de jogo alterado.

### Prompt executado: `icones2.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 768 x 192 with FOUR icons side by side, one per 192 x 192
cell, each centered with breathing room, TRANSPARENT background, no cell lines.

ICONS, left to right, chunky and readable at small size, in white and warm
yellow so they read on a dark blue button, the same family as a horn, a
headlight, a chat bubble and a wiper icon:
1. GPS: a round map pin (teardrop shape with a hole) standing on a short
   curved route line made of three dots.
2. LOUDSPEAKER: a megaphone / roof loudspeaker horn pointing right with three
   BIG curved sound waves, bigger and wider than a car horn.
3. PAPER MAP: a folded paper map in three panels (zig-zag folds), with one
   curvy road line across it, no pin.
4. RADIO: a walkie-talkie two-way radio standing upright, a short antenna on
   top, a speaker grille of round dots, and two small signal arcs beside the
   antenna.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, button backgrounds, cell lines, outlines, black ink lines, shading,
gradients, 3D render, photorealistic, smartphone.
~~~

### Prompt executado: `ceu-serra.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: one wide strip, fully OPAQUE, 1280 x 300, full-bleed, no frame.

SCENE: a calm night sky over a mountain range seen through a car windshield,
flat deep navy at the top becoming a flat purple band near the bottom (two flat
bands, not a gradient). A thin pale cream crescent moon on the upper left.
Small white dot stars and two little four-point sparkles. Along the bottom, a
row of TALL rounded-triangle mountains (soft rounded peaks, like rounded
trapezoids) in two flat dark teal tones, the back row taller, their peaks
between 150 and 240 px from the top, filling the strip to the bottom edge. No
road, no houses, no lights on the mountains, no people.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, frames, borders, outlines, black ink lines, shading, gradients,
3D render, photorealistic, a face on the moon, snow caps, clouds, houses.
~~~

### Prompt executado: `cenario2.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 1536 x 384 with FOUR roadside objects at NIGHT, one per
384 x 384 cell, each standing with its base touching the bottom of its cell,
TRANSPARENT background, no ground, no cast shadow, no cell lines.

OBJECTS, left to right, muted night colours:
1. PINE TREE: a tall mountain pine made of three stacked rounded triangles in
   dark teal-green, a short brown trunk.
2. FORK SIGN: a road sign on one dark-blue capsule post: a rounded yellow
   board with one arrow pointing up-left and one arrow pointing up-right
   (a "Y" fork), no words.
3. CELL TOWER: a tall thin lattice phone tower made of capsules, dark blue,
   with two small rounded antenna panels near the top and one tiny warm red
   light on the tip (no glow, no waves).
4. ROAD BARRIER: a short wooden roadblock trestle with two legs and one wide
   board striped in coral and cream diagonal stripes, a small round warm
   amber lamp on top.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, ground, grass strip, cast shadows, light cones, glow halos, radio
waves, outlines, black ink lines, shading, gradients, 3D render, photorealistic.
~~~

### Prompt executado: `vila-longe.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 1536 x 384 made of TWO cells of 768 x 384, TRANSPARENT
background, no cell lines. Both cells show the SAME far-away little village on
a rounded hill at NIGHT, identical in shape and position: about nine tiny
houses with rounded-triangle roofs and a small church with a bell tower,
spread on a low wide dark-teal hill whose base touches the bottom of the cell.
LEFT cell: every window DARK (dark navy). RIGHT cell: EVERY window lit in warm
yellow. Tiny and simple, seen from far across a valley.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
watermarks, sky, moon, stars, road, people, glow halos, light beams, outlines,
black ink lines, shading, gradients, 3D render, photorealistic.
~~~

### Prompt executado: `vaca.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 768 x 256, the SAME cute round cow in three poses, one per
256 x 256 cell, hooves touching the bottom of the cell, TRANSPARENT background,
no ground, no cell lines. Cream-white cow with big soft brown patches, a pink
round muzzle, little curved horns, a small bell on the neck.

POSES, left to right:
1. STANDING CALM: facing the viewer straight on, as if standing on the road
   in front of a car, sleepy half-closed eyes, chewing.
2. STARTLED: facing the viewer, eyes wide open (rounded square eyes with
   black pupils), ears up, all four hooves a little off the ground.
3. WALKING AWAY: seen from the side walking to the right, calm, tail swinging.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, "Moo",
watermarks, ground, grass, cast shadows, outlines, black ink lines, shading,
gradients, 3D render, photorealistic, angry cow, bull, udder details.

FINAL TECHNICAL CLARIFICATION (reinforces the prompt's exclusions): the cow chews with an EMPTY mouth. No grass, no leaves, no green object anywhere. Use uniform solid flat color fills, with no gradients. Three complete separate poses.
~~~

### Prompt executado: `guincho.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: a sheet of 1024 x 512, the SAME small friendly tow truck in two views,
one per 512 x 512 cell, wheels touching the bottom of the cell, TRANSPARENT
background, no ground, no cell lines. Warm orange cab, a round amber roof
beacon, big round headlights, chunky dark wheels.

VIEWS, left to right:
1. FRONT: seen straight from the front, as if coming toward the viewer on a
   road at night: round warm-yellow headlights ON (flat yellow circles, no
   glow), the roof beacon, a friendly grille.
2. BACK: seen straight from behind, driving away: the tow boom with a hook and
   a short cable hanging down in the middle, two small red rear lights.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, car brand emblems, text,
letters, numbers, license plates, watermarks, driver, people, ground, cast
shadows, light beams, glow halos, outlines, black ink lines, shading,
gradients, 3D render, photorealistic.
~~~

### Prompt executado: `mapa.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: 768 x 512, TRANSPARENT background, the map filling about 90 % of the
image, seen straight from above.

SUBJECT: an old unfolded paper road map with four vertical fold panels (each
panel a slightly different flat cream tone, like folds), rounded corners.
On it, flat simple shapes only: soft green hill blobs, a light blue river
curving across, two little pine clusters, a few tiny house squares in one
corner, and a grey road network: one road coming from the bottom middle and
splitting into two roads, one to the upper left and one to the upper right.
NO route highlight, NO pin, NO arrow (the game draws those).

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
compass letters, legend, watermarks, hands, table, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, coffee stains, torn edges.

TECHNICAL CHROMA-KEY BACKING EXCEPTION: For this render ONLY, replace the requested transparent empty space with a perfectly uniform pure magenta #FF00FF backing, so it can be removed losslessly in postproduction. The final game file will be transparent. Magenta is strictly OUTSIDE the paper only. NO glow, NO cast shadow, NO lighting, NO haze, NO gradient into magenta. Crisp flat vector map silhouette directly against SOLID #FF00FF. Keep the paper and all map details exactly as specified above. No magenta in the map itself.
~~~

### Tentativas anteriores e revisão visual

As sete primeiras gerações usaram só os prompts do §5, integralmente. A primeira vaca tinha uma folha na boca e foi substituída. O mapa inicial e duas tentativas de correção vieram com halo; foi escolhida a geração final com fundo magenta e remoção dessa cor, prevista no ESTILO.md. As duas tentativas de mapa preservaram o prompt integral do §5 e acrescentaram respectivamente os blocos abaixo.

#### mapaEdit

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: 768 x 512, TRANSPARENT background, the map filling about 90 % of the
image, seen straight from above.

SUBJECT: an old unfolded paper road map with four vertical fold panels (each
panel a slightly different flat cream tone, like folds), rounded corners.
On it, flat simple shapes only: soft green hill blobs, a light blue river
curving across, two little pine clusters, a few tiny house squares in one
corner, and a grey road network: one road coming from the bottom middle and
splitting into two roads, one to the upper left and one to the upper right.
NO route highlight, NO pin, NO arrow (the game draws those).

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
compass letters, legend, watermarks, hands, table, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, coffee stains, torn edges.

FINAL TECHNICAL CORRECTION: The first TWO attached images are STYLE REFERENCES ONLY. The THIRD attached image is the map to correct. Preserve its composition and exact Y road geometry. Remove ALL backdrop, ALL glow, ALL outer shadow: only the paper and its printed shapes, with a clean cutout silhouette and truly zero-alpha empty space outside the paper. Every interior fill must be fully opaque. The four cream paper panels must be uniform flat colors, without gradients or texture. Retain the whole map with transparent breathing room. No new subjects.
~~~

#### mapaRetry

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: 768 x 512, TRANSPARENT background, the map filling about 90 % of the
image, seen straight from above.

SUBJECT: an old unfolded paper road map with four vertical fold panels (each
panel a slightly different flat cream tone, like folds), rounded corners.
On it, flat simple shapes only: soft green hill blobs, a light blue river
curving across, two little pine clusters, a few tiny house squares in one
corner, and a grey road network: one road coming from the bottom middle and
splitting into two roads, one to the upper left and one to the upper right.
NO route highlight, NO pin, NO arrow (the game draws those).

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, numbers,
compass letters, legend, watermarks, hands, table, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, coffee stains, torn edges.

TECHNICAL OUTPUT REQUIREMENT, highest priority: generate the map as a CLEAN FLAT VECTOR CUTOUT on a fully transparent canvas, exactly like a flat game sprite. NO background of any color and NO background haze. NO glow. NO cast shadow. NO lighting effects. The paper silhouette is the only boundary: outside that silhouette alpha must be 0, inside it alpha must be 255. All paper panels are uniform solid cream colors. This is an unfolded MAP ICON, not a photograph of paper.
~~~

Validação de dimensões, alfa, grade e apoio inferior concluída. Caixas alfa, janelas e pontos do mapa no `MANIFEST-N2-N3.md`. Pendências de revisão: vila com seis casas mais igreja, pequenas diferenças nos estados e poses e variação tonal suave em algumas áreas, apesar do pedido 100% chapado.

