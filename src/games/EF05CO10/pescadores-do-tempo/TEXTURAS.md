# Pescadores do Tempo — texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF05CO10/pescadores-do-tempo/`

> **Replanejado em 20/10/2026 (opção A).** A tartaruga saiu: `tuca.png` não
> existe mais. Os ícones e a capa mudaram. Os fundos, o pescador, os peixes e a
> vila continuam iguais.

**Linha de arte: livro ilustrado** (`references/34-livro-ilustrado.jpg`, anexe em
**toda geração**). Pintura digital macia, degradê suave, luz quente de rebote,
granulado fino de aerógrafo dentro das sombras, quase sem contorno, paleta pastel
quente. Combina com o ritmo calmo do jogo (esperar, ver o tempo passar). O
elenco da referência (as crianças, o menino no papelão, o cachorro, a calçada)
vai no negativo de todos os prompts.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código
(`scenes/fallback.ts`) nas mesmas chaves, grades e ordem de células daqui. Um PNG
com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

**Ficam no código para sempre:** a água animada (a linha da superfície e as
ondinhas), o céu passando (sol, lua, nuvens correndo, a noite escurecendo), a
chuva da passagem do tempo, a linha da vara, a **tela do sonar no celular** (o
balão com os peixes tocáveis), os **3 cartões do "o que mudou?"**, o
cabeçalho, as legendas, a faixa do erro, a bolinha de toque com ondinhas e todas
as palavras.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `margem-bisavo.png` | — | — | 1280 × 720 | opaco | o rio no tempo do bisavô (cabana de palha) |
| `margem-vovo.png` | — | — | 1280 × 720 | opaco | o rio no tempo do vovô (casinha de madeira) |
| `margem-hoje.png` | — | — | 1280 × 720 | opaco | o rio hoje (casa de tijolo, prédios) |
| `pescadores.png` | 3 × 3 | 256 × 320 | 768 × 960 | sim | bisavô, vovô e neta: parado, lançando, comemorando |
| `peixes.png` | 4 × 2 | 192 × 128 | 768 × 256 | sim | peixinho, peixe grande, cardume, garrafa, lança, bóia do sonar |
| `vila.png` | 3 × 1 | 320 × 192 | 960 × 192 | sim | a turma da vila do outro lado: parada, comemorando e (N2) olhando o celular |
| `icones.png` | 4 × 2 | 128 × 128 | 512 × 256 | sim | ícones do pedido, os três retratos, o celular |
| `cover-pescadores-do-tempo.png` | — | — | 1672 × 941 | opaco | capa **com o título** |
| `margem-amanha.png` | — | — | 1280 × 720 | opaco | **(N3)** o rio no amanhã (casa com teto verde e placas solares) |
| `pescadores2.png` | 4 × 2 | 256 × 320 | 1024 × 640 | sim | **(N2)** dando o recado; **(N3)** a bisneta |
| `mercado.png` | 3 × 2 | 256 × 256 | 768 × 512 | sim | **(N2)** o vendedor da cidade, dentro da bolha "lá longe" |
| `invencoes.png` | 3 × 2 | 256 × 256 | 768 × 512 | sim | **(N3)** as 3 invenções, dois quadros cada |
| `icones2.png` | 4 × 2 | 128 × 128 | 512 × 256 | sim | **(N2/N3)** ferramentas, pedidos e o retrato da bisneta |

**A ordem das células é contrato com o código.** O tamanho pode variar (o jogo
mede cada célula na carga), mas a grade, a ordem e os pontos marcados (o pé de
cada figura, a ponta da vara) não podem mudar.

## 2. Regras deste jogo

- **Vista de lado**, como um palco ou um jogo de plataforma: nada de perspectiva
  forte, nada de vista de cima. O rio aparece **em corte**: acima da linha da
  água o céu e a outra margem, abaixo dela a água por dentro.
- **As três margens são a MESMA cena em três tempos.** Os pontos fixos abaixo
  valem para os três fundos, ao pixel. Só muda o que o tempo muda: a casa, a vila,
  as árvores, a cor da água.
- **Nenhum texto na arte.** A única exceção é o título da capa.
- **Figuras soltas, sem chão e sem sombra no chão.** Todas olham para a
  **DIREITA** (para o rio).
- **Os peixes ficam no código.** Os fundos não têm peixe nenhum; a água por dentro
  é calma e vazia.

### Os pontos fixos dos três fundos (1280 × 720)

| O quê | Onde |
|---|---|
| topo da margem da esquerda (a grama) | uma linha reta em **y = 452**, de x = 0 até x = 450 |
| a borda da margem (o barranco) | desce de (450, 452) até (535, 720), em diagonal, por baixo da água |
| a linha da água | reta em **y = 470**, de x = 450 até a borda direita |
| o corte de terra embaixo da margem | de y = 470 a 720, de x = 0 até o barranco: terra lisa e calma |
| a cabana / casa | centro em **x = 250**, apoiada em y = 452, ~210 px de largura, ~200 de altura |
| o lugar do pescador | **x = 405**, y = 452: grama vazia, bem na beira |
| a outra margem (ao fundo) | faixa de terra com topo em **y = 405**, de x = 620 até a borda direita, encostando na água em y = 470 |
| a vila | casas sobre a outra margem, entre x = 780 e x = 1260, de y ≈ 250 até 405 |
| o lugar da turma da vila | x = 700, y = 408: vazio |
| o fundo do rio | areia e pedrinhas, uma faixa de ~24 px colada embaixo (y ≈ 696 a 720) |
| a água por dentro | vazia e calma de ponta a ponta (os peixes são tocados ali) |

---

## 3. `margem-bisavo.png` — 1280 × 720, opaco

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — a calm RIVER SCENE long, long ago, seen from the SIDE like a stage, with the river shown IN CROSS-SECTION (above the water line we see the sky and the far bank; below it we see inside the clear water). 16:9, exactly 1280×720. Flat side elevation, no strong perspective.
- LEFT BANK: a grassy bank whose top is a perfectly straight horizontal line at 63% of the image height (y = 452), from the left edge to 35% of the width (x = 450). Below the grass we see the bank in cross-section: smooth warm brown earth with a few tiny pebbles and roots, a calm plain area from y = 470 down to the bottom. The bank's right side is a slanted earth slope going down UNDER the water from (450, 452) to (535, 720).
- On the bank, centered at x = 250 and standing on the grass line: a small round STRAW HUT with a cone-shaped thatched roof, wooden poles and a dark doorway, about 210 px wide and 200 px tall. A wooden drying rack with nothing on it next to it.
- The grass at x = 405, right at the edge of the bank, is EMPTY (a character stands there).
- WATER LINE: a perfectly straight horizontal water surface at y = 470 from the bank to the right edge. Below it, the INSIDE of the river: very clear, clean turquoise water, lighter near the top and gently deeper teal toward the bottom, a few soft light rays, a few tall water plants rooted along the riverbed, a sandy riverbed with round pebbles in a thin strip along the very bottom (y ≈ 696–720). The water is EMPTY: no fish, no animals.
- FAR BANK in the background: a green strip of land whose top is at y = 405, from x = 620 to the right edge, touching the water at y = 470. On it, between x = 780 and x = 1260, three small round straw huts among big round leafy trees and tall palms. The spot at x = 700 on the far bank is EMPTY.
- SKY: soft peach-to-light-blue morning sky with a few round clouds. Lots of trees: the world is wild and green.
- The whole inside of the water is calm and EMPTY.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; people, characters, a fisherman, fish, animals in the water, boats with people; modern things, houses with bricks, electric poles, wires, buildings; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, top-down view, isometric view, strong perspective, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.
~~~

---

## 4. `margem-vovo.png` — 1280 × 720, opaco

O **mesmo enquadramento** do §3, alguns anos depois.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the SAME river scene, some decades later (grandpa's time, about 60 years ago), seen from the SIDE like a stage, with the river shown IN CROSS-SECTION (above the water line the sky and the far bank; below it the inside of the water). 16:9, exactly 1280×720. Flat side elevation, no strong perspective.
- LEFT BANK: a grassy bank whose top is a perfectly straight horizontal line at y = 452, from the left edge to x = 450. Below the grass, the bank in cross-section: smooth warm brown earth, a calm plain area from y = 470 to the bottom. The bank's right side is a slanted earth slope going down UNDER the water from (450, 452) to (535, 720).
- On the bank, centered at x = 250 and standing on the grass line: a small painted WOODEN HOUSE with a pitched tile roof, a little chimney, one window with a flower box and a door, about 210 px wide and 200 px tall. A small wooden fence on its left. A rowing boat tied to a short wooden post floats on the water surface right next to the bank (x 470–620), empty.
- The grass at x = 405, right at the edge of the bank, is EMPTY (a character stands there).
- WATER LINE: a perfectly straight horizontal water surface at y = 470 from the bank to the right edge. Below it, the INSIDE of the river: clear blue-green water, lighter near the top and deeper toward the bottom, soft light rays, a few water plants, a sandy riverbed with pebbles in a thin strip along the very bottom (y ≈ 696–720). The water is EMPTY: no fish, no animals.
- FAR BANK in the background: a green strip whose top is at y = 405, from x = 620 to the right edge, touching the water at y = 470. On it, between x = 780 and x = 1260, a small village of colourful WOODEN HOUSES with tile roofs, a little chapel bell tower, and wooden electric poles with a single wire. Fewer trees than before. The spot at x = 700 on the far bank is EMPTY.
- SKY: soft warm afternoon sky with round clouds.
- The whole inside of the water is calm and EMPTY.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; people, characters, a fisherman, fish, animals in the water; straw huts, brick buildings, tall buildings, cars, phones; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, top-down view, isometric view, strong perspective, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.
~~~

---

## 5. `margem-hoje.png` — 1280 × 720, opaco

O **mesmo enquadramento**, hoje. A água um pouco mais turva e **uma ou duas coisas
de lixo no fundo** (o rio sofreu); nada de cena triste.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the SAME river scene TODAY, seen from the SIDE like a stage, with the river shown IN CROSS-SECTION (above the water line the sky and the far bank; below it the inside of the water). 16:9, exactly 1280×720. Flat side elevation, no strong perspective.
- LEFT BANK: a grassy bank whose top is a perfectly straight horizontal line at y = 452, from the left edge to x = 450, with a short concrete edge at its right end. Below the grass, the bank in cross-section: smooth warm brown earth, a calm plain area from y = 470 to the bottom. The bank's right side is a slanted slope going down UNDER the water from (450, 452) to (535, 720).
- On the bank, centered at x = 250 and standing on the grass line: a small modern BRICK HOUSE painted light coral, flat-ish roof with a TV antenna and a blue water tank, a big window and a door, about 210 px wide and 200 px tall. A small motorboat with an outboard motor tied to a metal post floats on the water surface next to the bank (x 470–640), empty.
- The grass at x = 405, right at the edge of the bank, is EMPTY (a character stands there).
- WATER LINE: a perfectly straight horizontal water surface at y = 470 from the bank to the right edge. Below it, the INSIDE of the river: blue-green water that is a little more cloudy and greyish than a clean river, lighter near the top and deeper toward the bottom, very few water plants, a sandy riverbed in a thin strip along the very bottom (y ≈ 696–720) with one old tyre and a tin can half buried in the sand around x = 900. The water is EMPTY: no fish, no animals.
- FAR BANK in the background: a strip whose top is at y = 405, from x = 620 to the right edge, touching the water at y = 470, partly covered by a concrete riverside wall. On it, between x = 780 and x = 1260, a small town of colourful low apartment buildings with many windows, a street light pole with wires, a mobile phone antenna tower, and a concrete bridge crossing the river far in the background. Only two or three trees. The spot at x = 700 on the far bank is EMPTY.
- SKY: soft bright midday sky, a few clouds, one faint airplane trail.
- The whole inside of the water is calm and EMPTY.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; people, characters, a fisherman, fish, animals in the water; straw huts, wooden houses, sad or dirty polluted scene, smoke, factories; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, top-down view, isometric view, strong perspective, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, brand logos, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.
~~~

---

## 6. `pescadores.png` — 3 × 3 células de 256 × 320 (768 × 960), alfa

Três pessoas **da mesma família**, uma por linha, **na mesma escala**, de corpo
inteiro, **de perfil olhando para a DIREITA** (para o rio). Cabeça ≈ 1/4 da
altura (não chibi). **O pé apoiado fica em y = 304** da célula, centrado em
x = 128. A cabeça não passa de y = 24. A família tem o mesmo nariz redondo e as
mesmas bochechas, para se ver que é a mesma gente.

| Linha | Quem | Ferramenta |
|---|---|---|
| 0 | **o bisavô**: velhinho magro, barba branca, chapéu de palha largo, camisa de algodão cru, calça dobrada, descalço | uma **lança de madeira** comprida |
| 1 | **o vovô**: senhor de cabelo grisalho, boné, camisa xadrez azul, galochas | uma **vara de bambu** com carretilha simples |
| 2 | **a neta**: menina de uns 12 anos, rabo de cavalo, capa de chuva amarela, tênis | uma **vara moderna** numa mão e um **celular** com a tela acesa na outra |

| Coluna | Pose |
|---|---|
| 0 | **parado**, segurando a ferramenta em pé ao lado do corpo |
| 1 | **lançando**: corpo inclinado para a frente, braço esticado para a direita. Bisavô: **a mão vazia** (a lança já saiu, o código desenha ela voando). Vovô e neta: a vara apontando para a direita e para cima, **a ponta da vara em (244, 40) da célula** (é dali que o código puxa a linha) |
| 2 | **comemorando**: os dois braços para cima, mãos abertas, sorriso grande (o código põe o peixe nas mãos). A ferramenta encostada no ombro ou no chão |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites). Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — a character sprite sheet on a fully TRANSPARENT background: a grid of 3 columns × 3 rows, each cell 256×320 px (sheet 768×960), with NO grid lines. Three people of the SAME FAMILY, one per row, all at the SAME SCALE, full body, in SIDE VIEW facing RIGHT. Natural proportions, head about 1/4 of the body height (not chibi), same round nose and rosy cheeks in the whole family. In every cell the standing foot rests at y = 304, centered at x = 128; the top of the head is below y = 24; each figure is complete inside its cell.
ROW 0 — the GREAT-GRANDFATHER: thin old man with a white beard, a wide straw hat, a plain off-white cotton shirt, rolled-up trousers, barefoot; his tool is a long wooden SPEAR.
ROW 1 — the GRANDFATHER: grey-haired man with a cap, a blue plaid shirt and rubber boots; his tool is a BAMBOO FISHING ROD with a simple reel.
ROW 2 — the GRANDDAUGHTER: a girl about 12 years old, ponytail, a yellow raincoat and sneakers; she holds a modern FISHING ROD in one hand and a SMARTPHONE with a glowing blank screen in the other hand.
COLUMN 0 — STANDING still, holding the tool upright next to the body, calm smile.
COLUMN 1 — THROWING / CASTING: body leaning forward, arm stretched to the right. Row 0: the hand is EMPTY (the spear has just been thrown). Rows 1 and 2: the rod points to the upper right with its TIP at (244, 40) of the cell; no fishing line.
COLUMN 2 — CHEERING: both arms raised, hands open and EMPTY, big happy smile; the tool leaning on the shoulder.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; fish, fishing line, water, ground, grass, floor, cast shadows, background, scenery; front view, back view, characters facing left; extra people, animals; white backing, white sticker keyline, grid lines, visible cell borders, cropped heads or feet, figures crossing into neighbouring cells; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, chibi, oversized heads, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, speech bubbles, arrows, icons.
~~~

---

## 7. `peixes.png` — 4 × 2 células de 192 × 128 (768 × 256), alfa

Tudo **de perfil olhando para a DIREITA** (o código espelha), centrado na célula,
com ~8 % de margem.

| Célula | O quê |
|---|---|
| 0 | **peixinho** cinza-prateado com barriga clara, ~110 px, rabo para um lado |
| 1 | o mesmo peixinho, rabo para o outro lado (quadro de nadar) |
| 2 | **peixe grande** (um tambaqui gordo, cinza-esverdeado e laranja na barriga), ~176 px |
| 3 | o mesmo peixe grande, rabo para o outro lado |
| 4 | **cardume**: 5 peixinhos juntos nadando para a direita, ~180 px |
| 5 | **garrafa plástica** vazia, deitada, boiando, com tampa azul |
| 6 | **lança de madeira** deitada, ponta para a DIREITA, ocupando a largura da célula |
| 7 | **bóia do sonar**: bolinha amarela lisa do tamanho de uma laranja, com uma luzinha verde em cima |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an object sprite sheet on a fully TRANSPARENT background: 4 columns × 2 rows, each cell 192×128 px (sheet 768×256), with NO grid lines. Every object in SIDE VIEW pointing or swimming to the RIGHT, centered in its cell with about 8% margin, complete inside the cell.
CELL 0 — a small friendly river FISH, silver-grey with a light belly, about 110 px long, tail bent to one side.
CELL 1 — the SAME small fish with the tail bent to the other side (swim frame).
CELL 2 — a BIG chubby river fish (tambaqui), grey-green back and orange belly, about 176 px long, tail bent to one side.
CELL 3 — the SAME big fish with the tail bent to the other side (swim frame).
CELL 4 — a small SCHOOL of 5 little fish swimming together to the right, about 180 px wide.
CELL 5 — an empty PLASTIC BOTTLE lying on its side, with a blue cap.
CELL 6 — a long wooden fishing SPEAR lying horizontally, sharp tip pointing RIGHT, filling the cell width.
CELL 7 — a smooth round yellow SONAR FLOAT the size of an orange, with a tiny green light on top.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich; water, bubbles, ripples, background, cast shadows; hooks, fishing line, nets, blood, dead fish, fish skeletons, sharks, scary teeth; objects facing left; white backing, white sticker keyline, grid lines, visible cell borders, cropped objects; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, speech bubbles, arrows, icons.
~~~

---

## 8. `vila.png` — 3 × 1 células de 320 × 192 (960 × 192), alfa

A **turma da vila**, vista **de longe** (pequena), de frente: três pessoas da vila
lado a lado (uma senhora, um homem e uma criança), roupas simples sem época
marcada, porque elas aparecem nos três tempos. **Os pés ficam em y = 180**,
centrados em x = 160.

| Célula | Pose |
|---|---|
| 0 | paradas, acenando de leve |
| 1 | **comemorando**: pulando, braços para cima |
| 2 | **(N2) o recado chegou no celular**: o homem e a criança olham o celular na mão, sorrindo; a senhora **não tem celular**: mãos abertas para os lados, sobrancelhas levantadas, sem entender |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — a small sprite sheet on a fully TRANSPARENT background: 3 columns × 1 row, each cell 320×192 px (sheet 960×192), with NO grid lines. In each cell, the SAME group of three villagers seen from the FRONT as if from far away (small, simple): an old woman with a bun, a man with a moustache and a small child between them; simple timeless clothes (plain shirts, skirt, trousers) in soft coral, teal and cream. Feet at y = 180, the group centered at x = 160, complete inside the cell.
CELL 0 — standing, waving gently, smiling.
CELL 1 — CELEBRATING: all three jumping with both arms up, very happy.
CELL 2 — the man and the child each look down at a SMARTPHONE in their hand, smiling; the old woman has NO phone: palms open to the sides, eyebrows raised, puzzled.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; fish, tables, food, flags, ground, grass, cast shadows, background; phones in cells 0 and 1, a phone in the old woman's hands, uniforms, costumes, hats from a specific era; white backing, white sticker keyline, grid lines, visible cell borders, cropped parts; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, watermark, user interface, speech bubbles, arrows, icons.
~~~

---

## 9. `icones.png` — 4 × 2 células de 128 × 128 (512 × 256), alfa

Ícones redondinhos e legíveis em 64 px, centrados, ~10 % de margem.

| Célula | O quê | Uso |
|---|---|---|
| 0 | peixinho cinza (de lado) | pedido "peixe no raso" |
| 1 | peixe grande laranja (de lado) | pedido "peixe grande" |
| 2 | três peixinhos com uma lua amarela em cima | pedido "Pesque no escuro!" |
| 3 | **bandeirinhas** de festa coloridas num cordão | pedido "Peixe para a festa!" |
| 4 | **retrato** do bisavô (cabeça e ombros, chapéu de palha, barba branca), num círculo creme | legenda "TEMPO DO BISAVÔ" |
| 5 | **retrato** do vovô (boné, cabelo grisalho), num círculo creme | legenda "TEMPO DO VOVÔ" |
| 6 | **retrato** da neta (rabo de cavalo, capuz amarelo), num círculo creme | legenda "HOJE" |
| 7 | **celular** com a tela acesa mostrando dois peixinhos verdes | cartão do celular e ajuda do sonar |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients and gentle warm shading; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes, very readable at small size. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an icon sheet on a fully TRANSPARENT background: 4 columns × 2 rows, each cell 128×128 px (sheet 512×256), with NO grid lines. Each icon centered with about 10% margin, simple and clear at 64 px.
CELL 0 — a small silver-grey fish in side view, facing right.
CELL 1 — a big chubby orange-bellied fish in side view, facing right.
CELL 2 — three little fish swimming together, with a small yellow crescent moon above them.
CELL 3 — a short string of colourful party FLAGS (bunting), gently curved.
CELL 4 — a round PORTRAIT (head and shoulders) of an old great-grandfather with a white beard and a wide straw hat, inside a cream circle.
CELL 5 — a round PORTRAIT of a grey-haired grandfather wearing a cap, inside a cream circle.
CELL 6 — a round PORTRAIT of a 12-year-old girl with a ponytail and a yellow raincoat hood, inside a cream circle.
CELL 7 — a SMARTPHONE seen from the front, dark rounded body, its glowing teal screen showing two small bright-green fish shapes, like a fish-finder app.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; background, water, cast shadows; white backing, white sticker keyline, square frames, grid lines, visible cell borders, cropped icons; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, buttons, speech bubbles, arrows.
~~~

---

## 10. `cover-pescadores-do-tempo.png` — 1672 × 941, opaco, **com o título**

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the cover of a children's game, 16:9, 1672×941. A calm river seen from the side, the water shown in cross-section with a few friendly fish inside and one big chubby orange-bellied fish near the bottom. Across the image, the river bank changes from LEFT to RIGHT as if time passes: on the left a straw hut and a great-grandfather with a straw hat throwing a wooden spear; in the middle a wooden house and a grandfather with a bamboo fishing rod; on the right a modern brick house and a girl in a yellow raincoat holding a fishing rod and a glowing smartphone; above them the sky goes from sunrise to day, with a soft golden swirl of time and falling leaves connecting the three. At the top, a big rounded hand-lettered title "Pescadores do Tempo" in creamy white with a soft honey shadow, perfectly readable, spelled exactly like this.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; turtles, tortoises, animal mascots; any other text besides the title, misspelled title, extra letters, subtitles, logos, watermark, signature; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, harsh contrast, neon colours, dark or gloomy lighting, scary fish, dead fish, blood, pollution scenes; user interface, buttons, frames, speech bubbles, arrows, icons, HUD.
~~~

---

# Níveis 2 e 3 (20/10/2026)

Mesma linha de arte (**livro ilustrado**, anexe `references/34-livro-ilustrado.jpg`
em toda geração), mesmas regras do §2. A família é a mesma gente do
`pescadores.png`: **mesmo traço, mesma escala, mesmo nariz redondo**. Anexe também
o `pescadores.png` pronto como referência de personagem no §12.

## 11. `margem-amanha.png` — 1280 × 720, opaco

O **mesmo enquadramento** do §3, no **amanhã**: um futuro gentil e verde. **Os
pontos fixos do §2 valem ao pixel.** A água vem **limpa e vazia**: quem suja o rio
no começo do N3 é o código (véu turvo + garrafa), e a invenção limpa.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the SAME river scene in a gentle, green FUTURE (tomorrow), seen from the SIDE like a stage, with the river shown IN CROSS-SECTION (above the water line the sky and the far bank; below it the inside of the water). 16:9, exactly 1280×720. Flat side elevation, no strong perspective.
- LEFT BANK: a grassy bank whose top is a perfectly straight horizontal line at y = 452, from the left edge to x = 450, with a few flowers. Below the grass, the bank in cross-section: smooth warm brown earth, a calm plain area from y = 470 to the bottom. The bank's right side is a slanted slope going down UNDER the water from (450, 452) to (535, 720).
- On the bank, centered at x = 250 and standing on the grass line: a small rounded FUTURE HOUSE with a green garden roof (grass and little plants on top), a row of small solar panels, a big round window and a door, about 210 px wide and 200 px tall. A little electric boat with a solar canopy tied next to the bank (x 470–640), empty.
- The grass at x = 405, right at the edge of the bank, is EMPTY (a character stands there).
- WATER LINE: a perfectly straight horizontal water surface at y = 470 from the bank to the right edge. Below it, the INSIDE of the river: very clear, clean turquoise water, lighter near the top and deeper toward the bottom, soft light rays, many healthy water plants, a sandy riverbed with pebbles in a thin strip along the very bottom (y ≈ 696–720). The water is EMPTY: no fish, no animals, no trash.
- FAR BANK in the background: a green strip whose top is at y = 405, from x = 620 to the right edge, touching the water at y = 470. On it, between x = 780 and x = 1260, a small friendly future town: rounded buildings covered with plants, two slim white wind turbines, a light green bridge far in the background, many trees again. The spot at x = 700 on the far bank is EMPTY.
- SKY: soft bright morning sky with round clouds.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; people, characters, a fisherman, robots, drones, fish, animals in the water, trash, tyres, cans; flying cars, spaceships, sci-fi chrome city, tall skyscrapers, smoke, factories; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, top-down view, isometric view, strong perspective, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, brand logos, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.
~~~

---

## 12. `pescadores2.png` — 4 × 2 células de 256 × 320 (1024 × 640), alfa

As mesmas regras do §6: **de perfil olhando para a DIREITA**, pé apoiado em
**y = 304**, centrado em x = 128, cabeça abaixo de y = 24, mesma escala do
`pescadores.png`.

| Célula | Quem | Pose |
|---|---|---|
| 0 | **bisavô** (o mesmo do §6, sem a lança) | soprando um **búzio** (concha grande) com as duas mãos, bochechas cheias, a boca da concha virada para a direita |
| 1 | **vovô** (o mesmo do §6, sem a vara) | ao lado de uma mesinha de madeira baixa com um **telefone antigo de disco**, segurando o **fone com fio enrolado** na orelha, falando e sorrindo |
| 2 | **neta** (a mesma do §6, sem a vara) | **gravando um áudio**: segura o celular deitado perto da boca, falando, olhos alegres |
| 3 | **neta** | **chamando com a voz**: as duas mãos em concha na boca, gritando para a direita, sem celular na mão |
| 4 | **bisneta**: menina de uns 8 anos, cabelo cacheado preso em dois coquinhos, jardineira verde-água, botinhas de chuva amarelas | **parada**, mãos livres, sorrindo |
| 5 | bisneta | **lançando**: inclinada para a frente, braço esticado para a direita, **mão vazia** |
| 6 | bisneta | **comemorando**: braços para cima, mãos abertas e vazias |
| 7 | bisneta | **com a vara**: segura uma vara de pescar apontando para a direita e para cima, **a ponta em (244, 40)** da célula, sem linha |

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites). Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference. The SECOND attached image is the character sheet of this family: keep the great-grandfather, the grandfather and the granddaughter EXACTLY as drawn there (face, clothes, proportions, scale).

SUBJECT — a character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns × 2 rows, each cell 256×320 px (sheet 1024×640), with NO grid lines. Every figure full body, SIDE VIEW facing RIGHT, natural proportions (head about 1/4 of the body, not chibi), all at the SAME SCALE as the second reference. In every cell the standing foot rests at y = 304, centered at x = 128; the top of the head is below y = 24; each figure complete inside its cell.
CELL 0 — the GREAT-GRANDFATHER (white beard, wide straw hat, off-white cotton shirt, rolled-up trousers, barefoot) blowing a big SEA-SHELL HORN (conch) held with both hands, cheeks puffed, the open end of the shell pointing right.
CELL 1 — the GRANDFATHER (grey hair, cap, blue plaid shirt, rubber boots) standing next to a small low wooden side table with an OLD ROTARY TELEPHONE on it, holding the handset with its curly cord to his ear, talking and smiling.
CELL 2 — the GRANDDAUGHTER (12 years old, ponytail, yellow raincoat, sneakers) RECORDING A VOICE MESSAGE: holding her smartphone flat near her mouth, talking, happy eyes.
CELL 3 — the GRANDDAUGHTER CALLING OUT with her voice: both hands cupped around her mouth, shouting toward the right, no phone in her hands.
CELL 4 — the GREAT-GRANDDAUGHTER, a girl about 8 years old, curly hair in two little buns, a soft teal dungaree, yellow rain boots, same round nose and rosy cheeks as the family: STANDING, hands free, smiling.
CELL 5 — the great-granddaughter THROWING: leaning forward, arm stretched to the right, hand EMPTY.
CELL 6 — the great-granddaughter CHEERING: both arms up, hands open and EMPTY, big smile.
CELL 7 — the great-granddaughter holding a FISHING ROD that points to the upper right with its TIP at (244, 40) of the cell; no fishing line.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; fish, fishing line, sound waves, speech bubbles, music notes, water, ground, grass, floor, cast shadows, background, scenery; spears, fishing rods in cells 0 to 6; front view, back view, characters facing left; extra people, animals; white backing, white sticker keyline, grid lines, visible cell borders, cropped heads or feet, figures crossing into neighbouring cells; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, chibi, oversized heads, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, arrows, icons.
~~~

---

## 13. `mercado.png` — 3 × 2 células de 256 × 256 (768 × 512), alfa

O **vendedor do mercado da cidade**, mostrado dentro de uma **bolha redonda** "lá
longe". Cada célula é um **retrato redondo** (busto e balcão) num **círculo de
fundo creme** de ~236 px de diâmetro, centrado. Atrás dele, dentro do círculo,
uma banca de feira com caixotes de frutas. Fora do círculo, transparente.

| Célula | Quem | Momento |
|---|---|---|
| 0 | **Seu Juca** (senhor de bigode, avental verde, chapéu de feltro), mercado antigo | parado atrás do balcão, sorrindo |
| 1 | Seu Juca | **ao telefone de disco**: fone de fio na orelha, sorrindo, mão livre levantada de alegria |
| 2 | Seu Juca | **ocupado**: as duas mãos entregando sacolas para fregueses (só ombros e braços dos fregueses aparecem na borda), o **telefone de disco tocando sozinho** no balcão (sem linhas de som: o tremor é do código) |
| 3 | **Bia** (vendedora jovem de hoje, cabelo curto, avental coral), mercado de hoje | **ocupada**: pesando frutas na balança para um freguês, o **celular deitado no balcão** com a tela acesa |
| 4 | Bia | **ouvindo o áudio**: segura o celular perto do ouvido, sorrindo grande, a outra mão em joinha |
| 5 | Bia | parada atrás do balcão, sorrindo |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes, very readable at small size. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — a portrait sheet on a fully TRANSPARENT background: 3 columns × 2 rows, each cell 256×256 px (sheet 768×512), with NO grid lines. Each cell is a ROUND PORTRAIT: a cream-coloured circle about 236 px wide, centered in the cell; inside the circle, a market vendor seen from the FRONT from the waist up behind a wooden market counter, with a little fruit stall (crates of oranges, bananas and greens) behind. Everything outside the circle is transparent.
CELL 0 — SEU JUCA, an old-time market man with a moustache, a green apron and a felt hat, standing behind the counter, smiling.
CELL 1 — Seu Juca TALKING ON AN OLD ROTARY TELEPHONE: the corded handset at his ear, smiling, his free hand raised happily.
CELL 2 — Seu Juca BUSY: both hands handing paper bags to customers (only the customers' shoulders and arms show at the edge of the circle); on the counter an old rotary telephone that nobody is answering.
CELL 3 — BIA, a young market woman of today with short hair and a coral apron, BUSY weighing fruit on a scale for a customer; her smartphone lies on the counter with its screen lit.
CELL 4 — Bia LISTENING TO A VOICE MESSAGE: holding her smartphone near her ear, big smile, other hand giving a thumbs up.
CELL 5 — Bia standing behind the counter, smiling.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; fish, sound wave lines, ringing marks, speech bubbles, music notes, emojis; square frames, borders around the circle, background outside the circle, white backing, white sticker keyline, grid lines, visible cell borders, cropped circles; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic; text, letters, words, labels, price tags with numbers, digits, numbers, brand logos, watermark, user interface, arrows, icons.
~~~

---

## 14. `invencoes.png` — 3 × 2 células de 256 × 256 (768 × 512), alfa

As três invenções do amanhã, **de perfil olhando para a DIREITA**, centradas,
~8 % de margem. Coisas **simples, redondas e simpáticas**, nada de ficção
científica cromada.

| Célula | O quê |
|---|---|
| 0 | **robô limpador**: barquinho-robô redondo, branco e verde-água, olhinhos de tela, uma rede na frente, vazia |
| 1 | o mesmo robô com a **rede cheia de lixo** (uma garrafa plástica, uma lata, um pneu velho) |
| 2 | **berçário de peixes**: um cesto redondo de palha boiando sobre uma boia de madeira, fechado com uma tampinha |
| 3 | o mesmo cesto **aberto**, com três filhotes de peixe prateados pulando para fora |
| 4 | **drone de árvores**: drone pequeno de quatro hélices, verde-folha, segurando embaixo um vasinho com uma **muda** |
| 5 | uma **árvore nova** de folhas redondas, plantada (só o tronco e a copa, a base reta embaixo, sem chão) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an object sprite sheet on a fully TRANSPARENT background: 3 columns × 2 rows, each cell 256×256 px (sheet 768×512), with NO grid lines. Every object in SIDE VIEW facing RIGHT, centered in its cell with about 8% margin, complete inside the cell. Simple, round, friendly inventions for a children's book, NOT sci-fi.
CELL 0 — a little round CLEANING ROBOT BOAT, white and soft teal, with two friendly screen eyes and a small net held in front of it, the net EMPTY.
CELL 1 — the SAME robot boat with its net FULL of trash: a plastic bottle, a tin can and an old small tyre.
CELL 2 — a FISH NURSERY: a round woven straw basket floating on a wooden ring float, closed with a little lid.
CELL 3 — the SAME basket OPEN, with three tiny silver baby fish jumping out of it.
CELL 4 — a small friendly four-propeller DRONE, leaf green, carrying underneath a little pot with a young tree SEEDLING.
CELL 5 — a YOUNG TREE with a round leafy crown and a thin trunk, the base of the trunk cut flat at the bottom, no ground.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich; people, hands, water, waves, splashes, ground, grass, cast shadows, background; weapons, claws, scary robots, chrome sci-fi, lasers, neon; objects facing left; white backing, white sticker keyline, grid lines, visible cell borders, cropped objects; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, speech bubbles, arrows, icons.
~~~

---

## 15. `icones2.png` — 4 × 2 células de 128 × 128 (512 × 256), alfa

Mesmas regras do §9: redondinhos, legíveis em 64 px, centrados, ~10 % de margem.

| Célula | O quê | Uso |
|---|---|---|
| 0 | **lança de madeira** na diagonal, ponta para cima à direita | botão da caixa de ferramentas (N3) |
| 1 | **vara de bambu** com carretilha, na diagonal | botão da caixa de ferramentas (N3) |
| 2 | **búzio** (concha) | crachá do bisavô no N2 |
| 3 | **casinhas da vila**: três casinhas juntas com um peixinho em cima | pedido "Avise a vila" (N2) |
| 4 | **banca do mercado**: toldo listrado com caixotes de frutas | pedido "Avise o mercado" (N2) |
| 5 | **retrato da bisneta** (dois coquinhos cacheados), num círculo creme | crachá do amanhã (N3) |
| 6 | **lâmpada de ideia** com uma folhinha verde dentro | pedido "Invente!" (N3) |
| 7 | **retrato da vovó da vila** (coque, cabelo branco), num círculo creme | pedido "Chame a vovó" (N2) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients and gentle warm shading; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes, very readable at small size. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an icon sheet on a fully TRANSPARENT background: 4 columns × 2 rows, each cell 128×128 px (sheet 512×256), with NO grid lines. Each icon centered with about 10% margin, simple and clear at 64 px.
CELL 0 — a wooden fishing SPEAR, diagonal, sharp tip to the upper right.
CELL 1 — a BAMBOO FISHING ROD with a simple reel, diagonal, tip to the upper right, a little curl of line.
CELL 2 — a big SEA-SHELL HORN (conch), cream and pink.
CELL 3 — three little village HOUSES side by side with a small silver fish floating above them.
CELL 4 — a MARKET STALL: a striped awning over crates of oranges and greens.
CELL 5 — a round PORTRAIT (head and shoulders) of an 8-year-old girl with curly hair in two little buns and a soft teal dungaree, inside a cream circle.
CELL 6 — an IDEA LIGHT BULB, glowing warm yellow, with a tiny green leaf sprout inside.
CELL 7 — a round PORTRAIT of a kind old village woman with white hair in a bun, inside a cream circle.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; background, water, cast shadows; white backing, white sticker keyline, square frames, grid lines, visible cell borders, cropped icons; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, buttons, speech bubbles, arrows.
~~~


## Registro de geração — Codex #6 / Aquarela (20/10/2026)

Brief executado: `.maestri/briefs/pescadores-arte.md`, somente §§6–9. Ferramenta: `image_gen` integrada, sempre anexando `references/34-livro-ilustrado.jpg`. Nenhum código do jogo alterado.

### Arquivos entregues e conferência

| Arquivo | Tamanho final | Grade / célula | Origem do bruto selecionado |
|---|---|---|---|
| `pescadores.png` | 768 × 960 | 3 × 3 / 256 × 320 | 1122 × 1402, segunda geração |
| `peixes.png` | 768 × 256 | 4 × 2 / 192 × 128 | 2172 × 724, segunda geração |
| `vila.png` | 960 × 192 | 3 × 1 / 320 × 192 | 2172 × 724, primeira geração |
| `icones.png` | 512 × 256 | 4 × 2 / 128 × 128 | 1774 × 887, primeira geração |

Todos os PNGs finais têm alfa real. Brutos sem modificação preservados em `src/assets/games/EF05CO10/pescadores-do-tempo/raw/` e `outputs/pescadores-do-tempo/raw/`, com os mesmos nomes dos finais. As margens e a capa ficaram fora desta entrega.

Processamento solicitado pelo brief: extração das figuras por componentes conectados, limpeza de alfa abaixo de 32/255 e de resíduos soltos, reempacotamento sem vazamentos. UMA escala comum por folha inteira (0,59 nos pescadores; 0,35 nos peixes; 0,295 na vila; 0,24 nos ícones), sem normalizar personagens ou quadros individualmente. Nos pescadores, os pés apoiados estão em y=304, centro arredondado x=128; na vila, o grupo está centrado em x=160 e a base em y=180. As pontas livres das duas varas de lançamento foram prolongadas/reposicionadas no processamento, sem mudar corpo ou mãos, para chegar exatamente a **(244,40)** nas células 4 e 7; a parte livre ganhou uma leve curvatura. Os brutos continuam intactos.

Verificações finais: nenhum pixel com alfa maior que zero nas bordas das células; nenhum pixel com 0<alfa<32; todos os personagens/peixes orientados para a direita, com a exceção intencional da vila vista de frente; sem texto, chão ou sombra anexados. As duas pontas foram medidas em (244,40) usando alfa≥128. Celular visível na mão da neta parada e lançando; mãos vazias nos quadros de comemoração. Na vila, somente homem e criança têm celular no quadro 2.

Variações em relação às larguras aproximadas do §7, necessárias para manter uma escala única: peixinhos com 119–121 px de largura visível (pedido ~110), peixes grandes com 163–170 px (~176), cardume com 157 px (~180). A lança ficou com 173 px de largura e margem de 9 px em cada lado. Sem alterações na grade, ordem, direção ou dimensões finais.

Células, leitura da esquerda para a direita, linha superior primeiro:

- `pescadores.png`: 0 bisavô parado; 1 bisavô lançando de mão vazia; 2 bisavô comemorando; 3 vovô parado; 4 vovô lançando; 5 vovô comemorando; 6 neta parada com vara e celular; 7 neta lançando com vara e celular; 8 neta comemorando.
- `peixes.png`: 0–1 peixinho, dois quadros; 2–3 peixe grande, dois quadros; 4 cardume de cinco; 5 garrafa com tampa azul; 6 lança apontando à direita; 7 bóia amarela com luz verde.
- `vila.png`: 0 turma acenando; 1 turma pulando e comemorando; 2 homem e criança no celular, senhora sem celular com as mãos abertas.
- `icones.png`: 0 peixinho; 1 peixe grande; 2 três peixes com lua; 3 bandeirinhas; 4 retrato do bisavô; 5 retrato do vovô; 6 retrato da neta; 7 celular com dois peixes verdes na tela.

As primeiras gerações de pescadores e peixes foram descartadas: a neta não segurava o celular ao lançar; o segundo peixe pequeno olhava para a esquerda e a lança invadia a célula vizinha.

### Prompt completo usado — pescadores.png (versão selecionada)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites). Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — a character sprite sheet on a fully TRANSPARENT background: a grid of 3 columns × 3 rows, each cell 256×320 px (sheet 768×960), with NO grid lines. Three people of the SAME FAMILY, one per row, all at the SAME SCALE, full body, in SIDE VIEW facing RIGHT. Natural proportions, head about 1/4 of the body height (not chibi), same round nose and rosy cheeks in the whole family. In every cell the standing foot rests at y = 304, centered at x = 128; the top of the head is below y = 24; each figure is complete inside its cell.
ROW 0 — the GREAT-GRANDFATHER: thin old man with a white beard, a wide straw hat, a plain off-white cotton shirt, rolled-up trousers, barefoot; his tool is a long wooden SPEAR.
ROW 1 — the GRANDFATHER: grey-haired man with a cap, a blue plaid shirt and rubber boots; his tool is a BAMBOO FISHING ROD with a simple reel.
ROW 2 — the GRANDDAUGHTER: a girl about 12 years old, ponytail, a yellow raincoat and sneakers; she holds a modern FISHING ROD in one hand and a SMARTPHONE with a glowing blank screen in the other hand.
COLUMN 0 — STANDING still, holding the tool upright next to the body, calm smile.
COLUMN 1 — THROWING / CASTING: body leaning forward, arm stretched to the right. Row 0: the hand is EMPTY (the spear has just been thrown). Rows 1 and 2: the rod points to the upper right with its TIP at (244, 40) of the cell; no fishing line.
COLUMN 2 — CHEERING: both arms raised, hands open and EMPTY, big happy smile; the tool leaning on the shoulder.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; fish, fishing line, water, ground, grass, floor, cast shadows, background, scenery; front view, back view, characters facing left; extra people, animals; white backing, white sticker keyline, grid lines, visible cell borders, cropped heads or feet, figures crossing into neighbouring cells; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, chibi, oversized heads, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, speech bubbles, arrows, icons.

PRODUCTION CORRECTION: keep all nine characters strictly in RIGHT-FACING SIDE PROFILE in every pose, including celebrating; noses point right, never a front view. In ROW 2 COLUMN 1 (girl CASTING), her left hand MUST visibly hold a small smartphone with a blank lit screen, while her right hand alone grips the modern fishing rod. Only the cheering poses have both hands empty as instructed. No fishing line. Maintain one consistent family identity, matching hair, nose, hat and clothes across poses. Make each figure and every upright tool slightly smaller with broad transparent gaps between all nine cells, so every tool stays fully inside its cell. Standing soles at 95% of cell height. For both casting rods, tip at 95.3% of cell width, 12.5% of cell height, while the weight-bearing front foot is centered at 50% of the cell width and 95% of cell height. The tools are slim, no giant thick poles. Great-grandfather casting hand empty. Do not put a phone in the hands of the two old men. No ground, no shadow, no loose grain outside silhouettes. The girl's yellow jacket stays the same in every cell.
~~~

### Prompt completo usado — peixes.png (versão selecionada)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an object sprite sheet on a fully TRANSPARENT background: 4 columns × 2 rows, each cell 192×128 px (sheet 768×256), with NO grid lines. Every object in SIDE VIEW pointing or swimming to the RIGHT, centered in its cell with about 8% margin, complete inside the cell.
CELL 0 — a small friendly river FISH, silver-grey with a light belly, about 110 px long, tail bent to one side.
CELL 1 — the SAME small fish with the tail bent to the other side (swim frame).
CELL 2 — a BIG chubby river fish (tambaqui), grey-green back and orange belly, about 176 px long, tail bent to one side.
CELL 3 — the SAME big fish with the tail bent to the other side (swim frame).
CELL 4 — a small SCHOOL of 5 little fish swimming together to the right, about 180 px wide.
CELL 5 — an empty PLASTIC BOTTLE lying on its side, with a blue cap.
CELL 6 — a long wooden fishing SPEAR lying horizontally, sharp tip pointing RIGHT, filling the cell width.
CELL 7 — a smooth round yellow SONAR FLOAT the size of an orange, with a tiny green light on top.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich; water, bubbles, ripples, background, cast shadows; hooks, fishing line, nets, blood, dead fish, fish skeletons, sharks, scary teeth; objects facing left; white backing, white sticker keyline, grid lines, visible cell borders, cropped objects; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, speech bubbles, arrows, icons.

STRICT GRID CORRECTION: exactly four equal columns and two equal rows. Both small fish in cells 0 and 1 MUST face RIGHT (nose to right, tail to left); do not turn the second fish around to show tail movement. Both big fish also face right. Match the same small fish and same big fish across their two swimming frames. Keep the spear entirely within the THIRD cell of the bottom row: its left handle begins at 8% of that cell width and its right sharp tip ends at 92%, so it cannot enter the sonar-float cell. All eight objects are separately centered inside their equal cells, with wide transparent gutters and no detached speckles outside their silhouettes. Big fish and spear have the same maximum width, roughly 84% of their own cells; small fish about 57% of cell width. The school is exactly FIVE fish, all facing right. No extra objects. No glowing halo around the float; only its small top light is green.
~~~

### Prompt completo usado — vila.png (versão selecionada)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — a small sprite sheet on a fully TRANSPARENT background: 3 columns × 1 row, each cell 320×192 px (sheet 960×192), with NO grid lines. In each cell, the SAME group of three villagers seen from the FRONT as if from far away (small, simple): an old woman with a bun, a man with a moustache and a small child between them; simple timeless clothes (plain shirts, skirt, trousers) in soft coral, teal and cream. Feet at y = 180, the group centered at x = 160, complete inside the cell.
CELL 0 — standing, waving gently, smiling.
CELL 1 — CELEBRATING: all three jumping with both arms up, very happy.
CELL 2 — the man and the child each look down at a SMARTPHONE in their hand, smiling; the old woman has NO phone: palms open to the sides, eyebrows raised, puzzled.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; fish, tables, food, flags, ground, grass, cast shadows, background; phones in cells 0 and 1, a phone in the old woman's hands, uniforms, costumes, hats from a specific era; white backing, white sticker keyline, grid lines, visible cell borders, cropped parts; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, watermark, user interface, speech bubbles, arrows, icons.
~~~

### Prompt completo usado — icones.png (versão selecionada)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients and gentle warm shading; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes, very readable at small size. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an icon sheet on a fully TRANSPARENT background: 4 columns × 2 rows, each cell 128×128 px (sheet 512×256), with NO grid lines. Each icon centered with about 10% margin, simple and clear at 64 px.
CELL 0 — a small silver-grey fish in side view, facing right.
CELL 1 — a big chubby orange-bellied fish in side view, facing right.
CELL 2 — three little fish swimming together, with a small yellow crescent moon above them.
CELL 3 — a short string of colourful party FLAGS (bunting), gently curved.
CELL 4 — a round PORTRAIT (head and shoulders) of an old great-grandfather with a white beard and a wide straw hat, inside a cream circle.
CELL 5 — a round PORTRAIT of a grey-haired grandfather wearing a cap, inside a cream circle.
CELL 6 — a round PORTRAIT of a 12-year-old girl with a ponytail and a yellow raincoat hood, inside a cream circle.
CELL 7 — a SMARTPHONE seen from the front, dark rounded body, its glowing teal screen showing two small bright-green fish shapes, like a fish-finder app.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; background, water, cast shadows; white backing, white sticker keyline, square frames, grid lines, visible cell borders, cropped icons; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, buttons, speech bubbles, arrows.
~~~




## Registro de geração — Codex #6 / Aquarela, 2ª leva N2/N3 (20/10/2026)

Brief atualizado executado: somente §12 `pescadores2.png` e §15 `icones2.png`. Ferramenta `image_gen` integrada, uma geração por folha, sempre com `references/34-livro-ilustrado.jpg`. Para `pescadores2.png`, o segundo anexo foi o `src/assets/games/EF05CO10/pescadores-do-tempo/pescadores.png` pronto, para identidade e escala da família. Para `icones2.png`, além da referência de estilo, foram anexados o bruto selecionado de `pescadores2.png` e o `vila.png` pronto, para casar os retratos da bisneta e da senhora.

### Arquivos e conferência

- `pescadores2.png`: **1024 × 640**, **4 × 2**, células **256 × 320**, alfa. Bruto **1586 × 992** preservado sem modificações.
- `icones2.png`: **512 × 256**, **4 × 2**, células **128 × 128**, alfa. Bruto **1774 × 887** preservado sem modificações.

Finais em `src/assets/games/EF05CO10/pescadores-do-tempo/`; originais intactos nos subdiretórios `raw/` dos assets e de `outputs/pescadores-do-tempo/`. Nenhum código do jogo alterado. Não houve erro de espaço no C: (estava com cerca de 102 MiB livres antes desta leva).

Reempacotamento com uma escala por folha: 0,49 em todos os oito quadros de `pescadores2.png`, 0,24 em todos os oito ícones. A altura do bisavô ficou com 233 px visíveis, igual à primeira folha; as diferenças na resolução dos brutos não mudaram a escala visual da família. As posições dos pés foram acertadas dentro das células, com base em **y=304** e âncora horizontal arredondada em **x=128**. A parte livre da vara da bisneta foi prolongada/reposicionada para que a ponta medida com alfa≥128 esteja exatamente em **(244,40)** da célula 7, preservando mão e corpo. O conjunto das casinhas no ícone 3 foi espelhado para o peixinho olhar para a direita. Alfa abaixo de 32/255 e resíduos isolados foram zerados; nenhum pixel com alfa>0 toca as bordas de nenhuma célula. Sem texto, chão, sombras anexadas ou vazamentos. Esses ajustes geométricos ocorreram somente nos finais; os brutos continuam intactos.

A conferência final abrangeu as **seis folhas das duas levas**: tamanhos e grades exatos, alfa limpo, conteúdo correto, pés em y=304 ou y=180, e as três pontas de vara de lançamento em (244,40). Sem desvios adicionais de conteúdo nesta leva; permanecem as variações de largura dos peixes da primeira leva já registradas acima.

Células de `pescadores2.png`, da esquerda para a direita e de cima para baixo: **0** bisavô soprando búzio; **1** vovô falando no telefone de disco com fio sobre mesinha; **2** neta gravando áudio com celular deitado perto da boca; **3** neta chamando com as mãos em concha, sem celular; **4** bisneta parada; **5** bisneta lançando com mão vazia; **6** bisneta comemorando com mãos vazias; **7** bisneta com vara, sem linha.

Células de `icones2.png`: **0** lança diagonal para cima à direita; **1** vara de bambu e carretilha diagonal para cima à direita; **2** búzio; **3** três casinhas e peixinho; **4** banca de frutas com toldo; **5** retrato da bisneta; **6** lâmpada com folhinha; **7** retrato da senhora da vila. Retratos em círculo creme.

### Prompt completo usado — pescadores2.png

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites). Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference. The SECOND attached image is the character sheet of this family: keep the great-grandfather, the grandfather and the granddaughter EXACTLY as drawn there (face, clothes, proportions, scale).

SUBJECT — a character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns × 2 rows, each cell 256×320 px (sheet 1024×640), with NO grid lines. Every figure full body, SIDE VIEW facing RIGHT, natural proportions (head about 1/4 of the body, not chibi), all at the SAME SCALE as the second reference. In every cell the standing foot rests at y = 304, centered at x = 128; the top of the head is below y = 24; each figure complete inside its cell.
CELL 0 — the GREAT-GRANDFATHER (white beard, wide straw hat, off-white cotton shirt, rolled-up trousers, barefoot) blowing a big SEA-SHELL HORN (conch) held with both hands, cheeks puffed, the open end of the shell pointing right.
CELL 1 — the GRANDFATHER (grey hair, cap, blue plaid shirt, rubber boots) standing next to a small low wooden side table with an OLD ROTARY TELEPHONE on it, holding the handset with its curly cord to his ear, talking and smiling.
CELL 2 — the GRANDDAUGHTER (12 years old, ponytail, yellow raincoat, sneakers) RECORDING A VOICE MESSAGE: holding her smartphone flat near her mouth, talking, happy eyes.
CELL 3 — the GRANDDAUGHTER CALLING OUT with her voice: both hands cupped around her mouth, shouting toward the right, no phone in her hands.
CELL 4 — the GREAT-GRANDDAUGHTER, a girl about 8 years old, curly hair in two little buns, a soft teal dungaree, yellow rain boots, same round nose and rosy cheeks as the family: STANDING, hands free, smiling.
CELL 5 — the great-granddaughter THROWING: leaning forward, arm stretched to the right, hand EMPTY.
CELL 6 — the great-granddaughter CHEERING: both arms up, hands open and EMPTY, big smile.
CELL 7 — the great-granddaughter holding a FISHING ROD that points to the upper right with its TIP at (244, 40) of the cell; no fishing line.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; fish, fishing line, sound waves, speech bubbles, music notes, water, ground, grass, floor, cast shadows, background, scenery; spears, fishing rods in cells 0 to 6; front view, back view, characters facing left; extra people, animals; white backing, white sticker keyline, grid lines, visible cell borders, cropped heads or feet, figures crossing into neighbouring cells; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, chibi, oversized heads, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, arrows, icons.
~~~

### Prompt completo usado — icones2.png

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients and gentle warm shading; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes, very readable at small size. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an icon sheet on a fully TRANSPARENT background: 4 columns × 2 rows, each cell 128×128 px (sheet 512×256), with NO grid lines. Each icon centered with about 10% margin, simple and clear at 64 px.
CELL 0 — a wooden fishing SPEAR, diagonal, sharp tip to the upper right.
CELL 1 — a BAMBOO FISHING ROD with a simple reel, diagonal, tip to the upper right, a little curl of line.
CELL 2 — a big SEA-SHELL HORN (conch), cream and pink.
CELL 3 — three little village HOUSES side by side with a small silver fish floating above them.
CELL 4 — a MARKET STALL: a striped awning over crates of oranges and greens.
CELL 5 — a round PORTRAIT (head and shoulders) of an 8-year-old girl with curly hair in two little buns and a soft teal dungaree, inside a cream circle.
CELL 6 — an IDEA LIGHT BULB, glowing warm yellow, with a tiny green leaf sprout inside.
CELL 7 — a round PORTRAIT of a kind old village woman with white hair in a bun, inside a cream circle.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; background, water, cast shadows; white backing, white sticker keyline, square frames, grid lines, visible cell borders, cropped icons; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, buttons, speech bubbles, arrows.

INPUT ROLES: image 1 is the mandatory picture-book STYLE reference only. Image 2 is the finished new family sheet: match the great-granddaughter's face, brown curly twin buns, pink shirt and soft-teal dungaree in portrait cell 5. Image 3 is the village group sheet: match its kind white-haired old woman with a bun in portrait cell 7, including her soft coral cardigan. Copy only these requested character identities from images 2 and 3. Keep every icon complete inside its own equal cell with broad transparent gutters. No letters or numerals anywhere.
~~~




## Registro de geração — Codex/Aquarela, margens e capa (20/10/2026)

Brief: `.maestri/briefs/pescadores-arte.md`, parte do Codex (§§3, 4, 5 e 10). Ferramenta: `image_gen` integrada; referência `references/34-livro-ilustrado.jpg` anexada em **todas** as gerações. A referência foi usada só pelo estilo; nenhum personagem ou cenário dela foi copiado.

Entregas em `src/assets/games/EF05CO10/pescadores-do-tempo/`: `margem-bisavo.png`, `margem-vovo.png`, `margem-hoje.png` em **1280 × 720**, RGB opaco, cenas inteiras sem grade; `cover-pescadores-do-tempo.png` em **1672 × 941**, RGB opaco, cena inteira sem grade. Originais selecionados, todos em 1672 × 941, preservados sem redimensionamento em `raw/` nessa mesma pasta.

### Registro e conferência

- As margens do vovô e de hoje foram derivadas por edição da mesma margem do bisavô. Só foram alterados elementos da época: habitação, vila, vegetação, barco, céu e água. As tentativas com enquadramento/perspectiva errados foram corrigidas.
- Foi usado um guia geométrico local e registro técnico com `sharp`/Node para os pontos do §2, sem alterar código do jogo. Originais permanecem intactos. As linhas de referência usadas na QA **não** fazem parte dos PNGs finais.
- Registro: topo do terreno esquerdo y=452 até x=450; barranco de (450,452) a (535,720); água y=470; outra margem com topo y=405, iniciando em x=620; casas centradas em x=250 e apoiadas em y=452, aproximadamente 210 × 200; faixa de areia y=696–720. Os dois pontos de personagem, (405,452) e (700,408), ficam livres de objetos de interação.
- Conferência visual dos quatro finais e sobreposição de guias: fundos sem pessoas, peixes, texto ou UI; água por dentro calma. Hoje tem somente um pneu e uma lata no fundo e um barco a motor vazio. O vovô tem barco de remo vazio e vila de madeira. A margem do bisavô tem cabanas de palha e mata mais densa.
- A capa foi corrigida para mostrar claramente a neta com vara e celular em mãos separadas. Título conferido letra a letra: **Pescadores do Tempo**. Nenhum outro letreiro, nenhuma tartaruga ou mascote.
- Ajuste técnico em relação à resolução pedida ao gerador: os brutos das margens vieram em 1672 × 941 e foram normalizados/registrados para 1280 × 720. Não ficou pendência de tamanho, grade ou alfa. Nenhum desvio de conteúdo identificado na conferência final.
- Fontes e registro reproduzível: helpers locais `pescadores-layout.cjs`, `pescadores-register.cjs` e `pescadores-prepare.cjs` na pasta de trabalho do Codex; não integram o código do jogo.

### Prompt completo usado — margem-bisavo.png (geração selecionada)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — a calm RIVER SCENE long, long ago, seen from the SIDE like a stage, with the river shown IN CROSS-SECTION (above the water line we see the sky and the far bank; below it we see inside the clear water). 16:9, exactly 1280×720. Flat side elevation, no strong perspective.
- LEFT BANK: a grassy bank whose top is a perfectly straight horizontal line at 63% of the image height (y = 452), from the left edge to 35% of the width (x = 450). Below the grass we see the bank in cross-section: smooth warm brown earth with a few tiny pebbles and roots, a calm plain area from y = 470 down to the bottom. The bank's right side is a slanted earth slope going down UNDER the water from (450, 452) to (535, 720).
- On the bank, centered at x = 250 and standing on the grass line: a small round STRAW HUT with a cone-shaped thatched roof, wooden poles and a dark doorway, about 210 px wide and 200 px tall. A wooden drying rack with nothing on it next to it.
- The grass at x = 405, right at the edge of the bank, is EMPTY (a character stands there).
- WATER LINE: a perfectly straight horizontal water surface at y = 470 from the bank to the right edge. Below it, the INSIDE of the river: very clear, clean turquoise water, lighter near the top and gently deeper teal toward the bottom, a few soft light rays, a few tall water plants rooted along the riverbed, a sandy riverbed with round pebbles in a thin strip along the very bottom (y ≈ 696–720). The water is EMPTY: no fish, no animals.
- FAR BANK in the background: a green strip of land whose top is at y = 405, from x = 620 to the right edge, touching the water at y = 470. On it, between x = 780 and x = 1260, three small round straw huts among big round leafy trees and tall palms. The spot at x = 700 on the far bank is EMPTY.
- SKY: soft peach-to-light-blue morning sky with a few round clouds. Lots of trees: the world is wild and green.
- The whole inside of the water is calm and EMPTY.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; people, characters, a fisherman, fish, animals in the water, boats with people; modern things, houses with bricks, electric poles, wires, buildings; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, top-down view, isometric view, strong perspective, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.

EDIT TARGET: image 2. Image 1 is the mandatory picture-book STYLE reference. Image 3 is the exact composition guide.
The current waterline and left cliff are now close, so PRESERVE the left diagonal edge's current horizontal location. Make the following final geometry corrections:
- The FAR BANK must be a RAISED FLAT PLATFORM, as in guide image3, with a clearly VISIBLE VERTICAL EARTH FACE 65px TALL below its grassy top. Its grass TOP is at 56.25% of canvas height (y405/720), while the water touches the BOTTOM of this earth wall at65.2778% (y470/720). The current image's far bank is too LOW and too THIN: raise the entire far grassy ledge, three straw huts and trees ABOVE it by about6% of the full image height, and extend the exposed mossy earth wall DOWN to the unchanged waterline. Do not turn it into a thin receding distant rim. It is an elevated platform shown straight from the side, the same side-elevation construction as the near bank. Its LEFT end is x620/1280 (48.4375% image width), with clear flat grass at x700 for villagers.
- The near grassy TOP is exactly62.7778% of height (y452), fromx0 tox450, a single STRAIGHT horizontal ledge. Water is exactly65.2778%(y470), a straight line across the whole river. Move these two horizontal levels UP by about1% of image height compared with the current target.
- Make the LEFT straw hut a little taller and wider: centeredx250/1280, fromx145 tox355, topy252/720, bottomy452/720. Keep the standing spot x405,y452 free.
- Riverbed sand: a thin final24px strip (last3.3333% of height), not a broad beach.
Preserve the calm painted river, wild tropical forest, soft sky and fine airbrushed grain. No people, no fish, no text. Use the exact SHAPES and positions of guide image3 for the near grass, slanted cliff, far raised platform and waterline, but paint them naturally in image1's style.
~~~

### Prompt completo usado — margem-vovo.png (geração selecionada)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the SAME river scene, some decades later (grandpa's time, about 60 years ago), seen from the SIDE like a stage, with the river shown IN CROSS-SECTION (above the water line the sky and the far bank; below it the inside of the water). 16:9, exactly 1280×720. Flat side elevation, no strong perspective.
- LEFT BANK: a grassy bank whose top is a perfectly straight horizontal line at y = 452, from the left edge to x = 450. Below the grass, the bank in cross-section: smooth warm brown earth, a calm plain area from y = 470 to the bottom. The bank's right side is a slanted earth slope going down UNDER the water from (450, 452) to (535, 720).
- On the bank, centered at x = 250 and standing on the grass line: a small painted WOODEN HOUSE with a pitched tile roof, a little chimney, one window with a flower box and a door, about 210 px wide and 200 px tall. A small wooden fence on its left. A rowing boat tied to a short wooden post floats on the water surface right next to the bank (x 470–620), empty.
- The grass at x = 405, right at the edge of the bank, is EMPTY (a character stands there).
- WATER LINE: a perfectly straight horizontal water surface at y = 470 from the bank to the right edge. Below it, the INSIDE of the river: clear blue-green water, lighter near the top and deeper toward the bottom, soft light rays, a few water plants, a sandy riverbed with pebbles in a thin strip along the very bottom (y ≈ 696–720). The water is EMPTY: no fish, no animals.
- FAR BANK in the background: a green strip whose top is at y = 405, from x = 620 to the right edge, touching the water at y = 470. On it, between x = 780 and x = 1260, a small village of colourful WOODEN HOUSES with tile roofs, a little chapel bell tower, and wooden electric poles with a single wire. Fewer trees than before. The spot at x = 700 on the far bank is EMPTY.
- SKY: soft warm afternoon sky with round clouds.
- The whole inside of the water is calm and EMPTY.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; people, characters, a fisherman, fish, animals in the water; straw huts, brick buildings, tall buildings, cars, phones; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, top-down view, isometric view, strong perspective, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.

ONE FINAL COMPOSITION CORRECTION TO IMAGE2. Image1 is the art style reference. Keep image2's house, roof/chimney, fence, left tree, near grass, near sloping cliff, small empty boat, water surface, underwater plants, riverbed and sky framing all EXACTLY unchanged.
The FAR BANK currently begins too far LEFT, around44% of canvas WIDTH. Move the ENTIRE FAR BANK AND ITS VILLAGE about5% of canvas WIDTH to the RIGHT, so the flat grass platform's LEFT EDGE is at EXACTLY48.4375% of canvas WIDTH (x620 on a1280-wide frame). Extend the open atmospheric river gap to its left to fill the vacated space, continuing the soft distant trees and sky naturally. The whole raised far platform, trees, wooden houses, chapel, electric poles and wire shift right together; compact the village's rightmost spacing slightly if needed to fit. Preserve the far grass TOP at56.25% image HEIGHT(y405), with exposed earth face down to65.2778%(y470). The left end of the far platform is a nearly VERTICAL front wall atx620, not a diagonal receding shore. Keep EMPTY flat grass fromx620 tox780 for the villagers, all village houses further right ofx780.
Do NOT move the near bank or change the left house size. Do NOT move the small rowboat beyondx620; it stays beside the NEAR bank and is fully visible, empty, with no vertical crop seam. Preserve the near grass TOP aty452 endingx450 and its slope to(535,720), the single straight waterlineaty470 and the thin bottom sand aty696..720. These coordinates are on1280x720; preserve them proportionally at other output resolutions.
No new props, no people, no fish, no text or guide lines, no smearing, no horizontal texture stretch, no perspective surface plane. Only slide the distant bank/village right to its correct fixed point and naturally repaint the small gap left behind.
~~~

### Prompt completo usado — margem-hoje.png (geração selecionada)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the SAME river scene TODAY, seen from the SIDE like a stage, with the river shown IN CROSS-SECTION (above the water line the sky and the far bank; below it the inside of the water). 16:9, exactly 1280×720. Flat side elevation, no strong perspective.
- LEFT BANK: a grassy bank whose top is a perfectly straight horizontal line at y = 452, from the left edge to x = 450, with a short concrete edge at its right end. Below the grass, the bank in cross-section: smooth warm brown earth, a calm plain area from y = 470 to the bottom. The bank's right side is a slanted slope going down UNDER the water from (450, 452) to (535, 720).
- On the bank, centered at x = 250 and standing on the grass line: a small modern BRICK HOUSE painted light coral, flat-ish roof with a TV antenna and a blue water tank, a big window and a door, about 210 px wide and 200 px tall. A small motorboat with an outboard motor tied to a metal post floats on the water surface next to the bank (x 470–640), empty.
- The grass at x = 405, right at the edge of the bank, is EMPTY (a character stands there).
- WATER LINE: a perfectly straight horizontal water surface at y = 470 from the bank to the right edge. Below it, the INSIDE of the river: blue-green water that is a little more cloudy and greyish than a clean river, lighter near the top and deeper toward the bottom, very few water plants, a sandy riverbed in a thin strip along the very bottom (y ≈ 696–720) with one old tyre and a tin can half buried in the sand around x = 900. The water is EMPTY: no fish, no animals.
- FAR BANK in the background: a strip whose top is at y = 405, from x = 620 to the right edge, touching the water at y = 470, partly covered by a concrete riverside wall. On it, between x = 780 and x = 1260, a small town of colourful low apartment buildings with many windows, a street light pole with wires, a mobile phone antenna tower, and a concrete bridge crossing the river far in the background. Only two or three trees. The spot at x = 700 on the far bank is EMPTY.
- SKY: soft bright midday sky, a few clouds, one faint airplane trail.
- The whole inside of the water is calm and EMPTY.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; people, characters, a fisherman, fish, animals in the water; straw huts, wooden houses, sad or dirty polluted scene, smoke, factories; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, top-down view, isometric view, strong perspective, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, brand logos, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.

LOCAL PAINT REPAIR OF IMAGE2. Image1 is the required style reference. Image2 is the otherwise approved REGISTERED modern scene and is the EDIT TARGET. Preserve its exact framing, small coral brick house, TV antenna, blue water tank, buildings, streetlight, phone antenna, bridge, three trees, boat, river geometry, tire and tin can. Only correct the PLANE CONTRAIL in the sky: it currently has an unnatural sharp elbow near the middle. Remove the bent trail and paint ONE FAINT, STRAIGHT, soft diagonal airplane contrail across the upper sky, with no elbow, as a subtle background detail. Repair any visible warp seams in the surrounding clouds by softly repainting them, without changing the clouds' general placement. No other elements move.
LOCK the existing registered geometry: near grass TOP y452 throughx450, bank slope (450,452) to(535,720), perfectly horizontal waterliney470, raised far-bank grass TOPy405 with its wall below to470, thin sandy bottomy696..720, small house centerx250 and basey452. Keep the empty standing spots at(405,452) and(700,408). These are coordinates on the supplied1280x720 target; preserve them proportionally if output resolution differs. Keep all four pictured modern props (TV antenna, water tank, empty outboard motorboat, phone tower) clearly visible. No fish, no people, no text or guide lines.
~~~

### Prompt completo usado — cover-pescadores-do-tempo.png (geração selecionada)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the cover of a children's game, 16:9, 1672×941. A calm river seen from the side, the water shown in cross-section with a few friendly fish inside and one big chubby orange-bellied fish near the bottom. Across the image, the river bank changes from LEFT to RIGHT as if time passes: on the left a straw hut and a great-grandfather with a straw hat throwing a wooden spear; in the middle a wooden house and a grandfather with a bamboo fishing rod; on the right a modern brick house and a girl in a yellow raincoat holding a fishing rod and a glowing smartphone; above them the sky goes from sunrise to day, with a soft golden swirl of time and falling leaves connecting the three. At the top, a big rounded hand-lettered title "Pescadores do Tempo" in creamy white with a soft honey shadow, perfectly readable, spelled exactly like this.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; turtles, tortoises, animal mascots; any other text besides the title, misspelled title, extra letters, subtitles, logos, watermark, signature; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, harsh contrast, neon colours, dark or gloomy lighting, scary fish, dead fish, blood, pollution scenes; user interface, buttons, frames, speech bubbles, arrows, icons, HUD.

EDIT TARGET: second attached image. First image is the mandatory picture-book art style reference. Preserve the current cover, all three family generations, all buildings, river cutaway, fish, golden time swirl and EXACT title "Pescadores do Tempo" unchanged. Make the granddaughter's smartphone CLEARLY VISIBLE as a separate object: her left hand holds a dark rounded rectangular SMARTPHONE with a bright glowing teal blank screen facing the viewer, at chest height; her other hand holds her modern fishing rod. The phone must be a visibly complete rectangle with its own hand, easy to identify in a thumbnail, separate from the fishing rod handle. No letters, numbers or app labels on the screen, only glow. Keep her youthful twelve-year-old face, ponytail, fully covering yellow raincoat and all other details. Do not add any extra title words or alter the existing correct lettering.
~~~


# Registro de geração — Codex/Aquarela — 2ª leva N2/N3

## Correções por image_gen — 2ª leva

### §11 — segunda geração / correção

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the SAME river scene in a gentle, green FUTURE (tomorrow), seen from the SIDE like a stage, with the river shown IN CROSS-SECTION (above the water line the sky and the far bank; below it the inside of the water). 16:9, exactly 1280×720. Flat side elevation, no strong perspective.
- LEFT BANK: a grassy bank whose top is a perfectly straight horizontal line at y = 452, from the left edge to x = 450, with a few flowers. Below the grass, the bank in cross-section: smooth warm brown earth, a calm plain area from y = 470 to the bottom. The bank's right side is a slanted slope going down UNDER the water from (450, 452) to (535, 720).
- On the bank, centered at x = 250 and standing on the grass line: a small rounded FUTURE HOUSE with a green garden roof (grass and little plants on top), a row of small solar panels, a big round window and a door, about 210 px wide and 200 px tall. A little electric boat with a solar canopy tied next to the bank (x 470–640), empty.
- The grass at x = 405, right at the edge of the bank, is EMPTY (a character stands there).
- WATER LINE: a perfectly straight horizontal water surface at y = 470 from the bank to the right edge. Below it, the INSIDE of the river: very clear, clean turquoise water, lighter near the top and deeper toward the bottom, soft light rays, many healthy water plants, a sandy riverbed with pebbles in a thin strip along the very bottom (y ≈ 696–720). The water is EMPTY: no fish, no animals, no trash.
- FAR BANK in the background: a green strip whose top is at y = 405, from x = 620 to the right edge, touching the water at y = 470. On it, between x = 780 and x = 1260, a small friendly future town: rounded buildings covered with plants, two slim white wind turbines, a light green bridge far in the background, many trees again. The spot at x = 700 on the far bank is EMPTY.
- SKY: soft bright morning sky with round clouds.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; people, characters, a fisherman, robots, drones, fish, animals in the water, trash, tyres, cans; flying cars, spaceships, sci-fi chrome city, tall skyscrapers, smoke, factories; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, top-down view, isometric view, strong perspective, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, brand logos, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.

LOCAL REPAIR OF EDIT TARGET: The FIRST attached image is the art-style reference, the SECOND is the finished tomorrow scene to repair. Keep its terrain and water geometry EXACTLY unchanged: near grass y452 up to x450, straight slanted bank to535720, waterline y470, far grass y405 and bank face down to470. Keep the current house bounding box x145–355 and y252–452, the boat, village, turbines, plants, camera and sky. Repair only two local rendering problems: make the house's large window perfectly round (it is currently too narrow), and smooth the background foliage/clouds and the small far bridge immediately to the right of the house, where resizing stretched a few details. Paint those small repaired patches seamlessly in the same picture-book brushwork. No new objects; no sun, moon, animals or text.
~~~

### §14 — segunda geração / correção

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept INSIDE the shapes; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an object sprite sheet on a fully TRANSPARENT background: 3 columns × 2 rows, each cell 256×256 px (sheet 768×512), with NO grid lines. Every object in SIDE VIEW facing RIGHT, centered in its cell with about 8% margin, complete inside the cell. Simple, round, friendly inventions for a children's book, NOT sci-fi.
CELL 0 — a little round CLEANING ROBOT BOAT, white and soft teal, with two friendly screen eyes and a small net held in front of it, the net EMPTY.
CELL 1 — the SAME robot boat with its net FULL of trash: a plastic bottle, a tin can and an old small tyre.
CELL 2 — a FISH NURSERY: a round woven straw basket floating on a wooden ring float, closed with a little lid.
CELL 3 — the SAME basket OPEN, with three tiny silver baby fish jumping out of it.
CELL 4 — a small friendly four-propeller DRONE, leaf green, carrying underneath a little pot with a young tree SEEDLING.
CELL 5 — a YOUNG TREE with a round leafy crown and a thin trunk, the base of the trunk cut flat at the bottom, no ground.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich; people, hands, water, waves, splashes, ground, grass, cast shadows, background; weapons, claws, scary robots, chrome sci-fi, lasers, neon; objects facing left; white backing, white sticker keyline, grid lines, visible cell borders, cropped objects; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, photorealistic; text, letters, words, labels, digits, numbers, brand logos, watermark, user interface, speech bubbles, arrows, icons.

CORRECTION AND REGISTRATION: The first attached image is the art-style reference. The second attached image is the previous sheet to correct. Keep the six subjects and their order but remove EVERY droplet, splash and water mark around the three baby fish; fish only. Use genuine alpha transparency outside objects, no glowing/blurred background. Leave at least 20 pixels of empty transparent margin on every side of each 256x256 cell. Each boat AND its entire net must fit within its cell, facing right. The identical empty/full robot boats must have EXACTLY the same size and anchor; likewise the closed/open baskets must have the SAME base shape, size and anchor. The drone has exactly FOUR propellers and a single seedling pot. Keep the whole sheet simple, soft, painted picture-book style, no extra objects or text.
~~~

## Arquivos selecionados e acabamento

- `margem-amanha.png`: original selecionado `exec-a2d2ebd2-c3ff-43c5-bb0a-fb91d946e568.png` (1672×941); edição da margem-bisavô, seguida de reparo localizado na janela e na ponte. Final 1280×720, opaco, com registro do barranco e pontos fixos do §2. Sem peixe, personagem, lixo, sol ou lua.
- `mercado.png`: original `exec-2e7090e1-e764-441b-8982-3fa560dc4f88.png` (1536×1024, alfa). Reempacotado em 3×2 células de256×256 (768×512); recortes quadrados iguais de464px e uma única escala240/464 para todas as células; máscaras circulares idênticas de236px, centradas em128,128. Nada fora dos círculos.
- `invencoes.png`: original selecionado `exec-932a9c89-4e7e-4b68-91f0-1a4971f440af.png` (1536×1024, alfa); regenerado para remover os respingos. Reempacotado em 3×2 células de256×256 (768×512), UMA escala0,4 para a folha inteira, sem normalização de tamanho por peça. Centralização por célula; menor margem final21px. Sem vazamento nem pixels na borda das células.
- Nas duas folhas, franja de alfa abaixo de16 zerada; fundo alfa preservado, nenhum texto. Previews de conferência têm fundo cinza apenas para inspeção e não foram entregues como assets.
- Brutos selecionados preservados em `src/assets/games/EF05CO10/pescadores-do-tempo/raw/` com os mesmos nomes dos finais. Ferramenta: image_gen integrada; acabamento autorizado pelo brief: sharp/Node. Código do jogo não alterado.
- Ordem do mercado: linha1 Seu Juca parado / ao telefone / ocupado entregando sacolas; linha2 Bia pesando frutas / ouvindo áudio com joinha / parada.
- Ordem das invenções: linha1 robô com rede vazia / robô com lixo na rede / berçário fechado; linha2 berçário aberto com3 filhotes / drone com muda / árvore jovem.


Built-in image_gen; referência anexada em todas as gerações: `references/34-livro-ilustrado.jpg`. Na margem do amanhã, também anexada como alvo de edição a `margem-bisavo.png` final.

## Prompt integral usado — §11

~~~text
undefined
~~~

## Prompt integral usado — §13

~~~text
undefined
~~~

## Prompt integral usado — §14

~~~text
undefined
~~~


