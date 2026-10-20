# Circuito de Bolinha — texturas

Destino: `src/assets/games/EF15CO02/circuito-de-bolinha/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 o laço, §5 a tela, §6 as peças).

**Linha de arte: chibi de figurinha**, a padrão da rodada. Anexe em **toda geração** a `references/19-chibi-figurinhas.jpg`.
- Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*.
- A referência tem elenco de RPG anime (tapa-olho, chifres, orelhas pontudas, cabelo enorme com enfeite, olho que brilha): ele vai no negativo de todos os prompts.
- Keyline branca só no que tem alfa. O quarto e a capa são cena inteira, sem keyline.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código nas mesmas folhas, grades e ordem de células daqui (`scenes/fallback.ts`). Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

## A linha, comparada às vizinhas

| | **Chibi de figurinha** (`19`, este jogo) | Doodle de lápis de cor (`39`) | Chibi de caderno (`37`, `38`) |
|---|---|---|---|
| Traço | limpo, espessura uniforme, tom escuro dessaturado | lápis grafite rabiscado | marrom fino, ponta afinando |
| Cor | chapada com **um** tom de sombra | hachura de lápis à vista | chapada e apagada |
| Olho | grande, brilhante, com brilho | dois pontinhos | redondo escuro com 1–2 brilhos |
| Corpo | cabeça grande, corpo pequeno | cabeça redonda, braços finos | chibi um pouco alongado |
| Contorno branco | **sim** (só nas peças com alfa) | não | não |

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Nível | Uso |
|---|---|---|---|---|---|---|
| `quarto.png` | — | — | 1280 × 720 | opaco | todos | o quarto de brinquedos, **sem mesa** |
| `mesa.png` | — | — | 720 × 320 | sim | todos | a mesa de brincar, vista de frente |
| `pecas.png` | 4 × 2 | 256 | 1024 × 512 | sim | todos | 4 blocos, 2 rampas, o sino e a bolinha |
| `nico.png` | 4 × 2 | 256 × 320 | 1024 × 640 | sim | todos | o Nico, virado para a **direita** |
| `caixa.png` | 2 × 1 | 384 × 320 | 768 × 320 | sim | todos | a caixa do brinquedo, fechada e aberta |
| `ui.png` | 2 × 2 | 256 × 192 | 512 × 384 | sim | todos | a página, o espaço vazio e o botão MONTAR |
| `pipoca.png` | 3 × 1 | 320 × 256 | 960 × 256 | sim | **N3** | a gata Pipoca |
| `pagina-se.png` | — | — | 512 × 256 | sim | **N3** | a página SE com dois bolsos |
| `cover-circuito-de-bolinha.png` | — | — | 1672 × 941 | opaco | — | capa **com o título** |

Para jogar o N1 bastam os seis primeiros. `pipoca.png` e `pagina-se.png` só entram com o N3.

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** O MONTAR, os números das páginas, o ×3, as falas e o pedido são do código. A única exceção é o título da capa.
- **Vista de frente, reta.** A mesa, as peças e o sino são desenhados de frente, sem perspectiva de cima: os blocos são quadrados que empilham, e a rampa é um triângulo retângulo visto de lado.
- **Os blocos encaixam.** Cada bloco preenche a célula de ponta a ponta (cerca de 4 % de margem), com a base no fundo da célula. Dois blocos empilhados têm de parecer uma torre, sem vão.
- **A rampa desce para a direita** (célula 4): a ponta alta fica à esquerda, a baixa à direita, e a canaleta corre pelo lado inclinado. A célula 5 é a mesma rampa espelhada.
- **As cores dos blocos** são de brinquedo de madeira pintado: amarelo `#FFD34D`, azul `#5FA8F5`, verde `#7CCB6A` e coral `#FF8A6B`. A rampa é lilás `#B79CF0` com a canaleta mais escura. Nada de vermelho, que é cor de erro.
- **O Nico e a caixa não usam lilás** como cor principal, para não se misturarem à rampa.
- Peça solta e centrada na célula. **O Nico pisa no fundo da célula**; o sino e as peças também.

---

## 3. `quarto.png` — 1280 × 720, opaco

O fundo do quarto. A mesa é outro arquivo e entra por cima, à esquerda; a bandeja das páginas cobre toda a coluna da direita; o manual cobre a faixa de baixo. Por isso: **meio e direita calmos**, detalhe só no canto de cima à esquerda e na faixa do alto.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art style applied to a background; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; big simple friendly shapes; a short soft palette over warm near-white. NO white sticker keyline here — this is a full scene, not a sticker. Crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

Wide background illustration, 1280 x 720, 16:9, fully opaque. A cozy kids' playroom seen straight from the front: a soft butter-yellow painted wall with a thin pastel stripe, a light wooden floor of wide planks filling the bottom 25% of the image. In the TOP-LEFT corner, from 2% to 20% of the width, a small window with a light-blue sky, one cloud and short curtains, and under it a tiny wall shelf with a teddy bear and a toy rocket. A few small paper bunting flags hang along the very top edge. Everything else stays EMPTY and calm — plain wall only, low contrast: the centre, where a play table and building blocks will be placed by the game, and the whole RIGHT THIRD, where game cards will sit. Soft even daylight.

DO NOT INCLUDE: tables, desks, chairs, beds, rugs in the centre, building blocks, marble runs, ramps, bells, marbles, toy boxes, any furniture in the centre, characters, people, children, animals, cats, text, letters, words, labels, digits, numbers, captions, signs, writing on the books, watermark, artist signature, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, white sticker keyline, sticker border, strong contrast in the centre, busy patterns, clutter, anime video game characters, horns, pointed elf ears, eyepatch, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, cropped edges.
~~~

---

## 4. `mesa.png` — 720 × 320, alfa

A mesa baixa de brincar, vista de frente. O **tampo** é uma faixa reta e larga no alto da imagem (o jogo apoia as peças em cima da linha de cima do tampo); embaixo, a frente da mesa e quatro pernas curtas até o fundo da imagem.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; big simple friendly shapes; a short palette over near-white and warm neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

A single game asset on a fully TRANSPARENT background, 720 x 320: a low wooden kids' play table seen perfectly straight from the FRONT, with no top-down perspective. The tabletop is a straight horizontal plank, light honey wood, as wide as the whole image, its flat top edge a perfectly straight line near the very top of the image (about 4% from the top), the plank about 14% of the image tall. Under it a slightly darker wooden front apron with rounded corners, and four short straight legs in a soft mint colour reaching the bottom of the image. Nothing on the table. Centered, symmetrical.

DO NOT INCLUDE: anything on the table, toys, blocks, books, cups, a tablecloth, chairs, a floor, a rug, a wall, a shadow on the ground, perspective from above, a visible table surface seen from above, drawers, text, letters, words, labels, digits, numbers, watermark, artist signature, logo, user interface, buttons, frames, anime video game characters, horns, pointed elf ears, eyepatch, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy noise, cropped edges, white backing in transparent assets.
~~~

---

## 5. `pecas.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça |
|---|---|
| 0 | bloco **amarelo** |
| 1 | bloco **azul** |
| 2 | bloco **verde** |
| 3 | bloco **coral** |
| 4 | rampa lilás, **desce para a direita** (ponta alta à esquerda) |
| 5 | rampa lilás, **desce para a esquerda** (a 4 espelhada) |
| 6 | o sino dourado no suporte, com um copinho na frente para a bolinha |
| 7 | a bolinha de gude |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; big simple friendly shapes; a short palette — bright toy colours over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first, no grid lines drawn. Pieces of a wooden toy MARBLE RUN, every piece seen perfectly straight from the FRONT (no perspective, no top face visible), each one sitting on the BOTTOM edge of its cell.
1. A wooden building CUBE painted bright YELLOW (#FFD34D): a square that fills the whole cell edge to edge with only a tiny margin, slightly rounded corners, a soft shadow band on the right side, a small round hole in the middle of the front face.
2. The same cube painted BLUE (#5FA8F5).
3. The same cube painted GREEN (#7CCB6A).
4. The same cube painted CORAL (#FF8A6B).
5. A wooden RAMP block painted LILAC (#B79CF0), seen from the side as a right triangle that fills the cell width: its tall vertical side on the LEFT (about 80% of the cell tall), its flat bottom on the cell bottom, and the sloped top going DOWN TO THE RIGHT, ending low near the bottom-right corner (about 12% of the cell tall). A darker purple groove channel runs along the whole sloped top for a marble to roll in.
6. The exact same ramp MIRRORED: tall side on the RIGHT, sloping down to the LEFT.
7. A shiny GOLDEN BELL hanging from a small wooden arch-shaped stand, the stand's feet on the cell bottom, about 85% of the cell tall, with a small round wooden cup at the front-left foot to catch a marble.
8. One glass MARBLE, a sphere with a swirl of blue and white inside and one bright highlight, about 45% of the cell wide, centered.
All cubes have exactly the same size. Both ramps have exactly the same size.

DO NOT INCLUDE: faces or eyes on the pieces, letters or numbers on the cubes, alphabet blocks, stacked pieces, several pieces in one cell, marbles inside the ramps, tracks or rails connecting pieces, red pieces, perspective views, isometric views, top faces of cubes, shadows on the ground, a table, a floor, text, letters, words, labels, digits, numbers, watermark, artist signature, logo, user interface, buttons, panels, frames, arrows, icons, stars, HUD, anime video game characters, horns, pointed elf ears, eyepatch, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, items crossing cell borders, cropped edges, drop shadow on the cell, white backing in transparent assets.
~~~

---

## 6. `nico.png` — 4 × 2 células de 256 × 320 (1024 × 640), alfa

O Nico, um menino de uns 7 anos: pele marrom, cabelo cacheado castanho-escuro, camiseta laranja-clara com uma listra branca, jardineira jeans azul, tênis amarelos. Em **todos** os quadros ele está **virado para a direita** (é lá que fica a mesa), e pisa no fundo da célula.

| Célula | Pose |
|---|---|
| 0 | parado, sorrindo, braços soltos |
| 1 | segurando a caixa fechada do brinquedo com as duas mãos, orgulhoso (a caixa igual à da `caixa.png`, célula 0) |
| 2 | pondo uma peça: os dois braços esticados para a frente e um pouco para cima, mãos vazias, concentrado |
| 3 | comemorando: pulinho, os dois punhos para cima, olhos fechados de alegria |
| 4 | ops: inclinado para trás, mãos na cabeça, boca aberta, uma gota de suor |
| 5 | lendo o manual: olhando para baixo, segurando uma folha de papel em branco com as duas mãos |
| 6 | soltando a bolinha: um braço esticado para cima e para a frente, a mão aberta, sorrindo |
| 7 | pensando: uma mão no queixo, olhar para cima (usado no N3) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; small chibi proportions, big head and little body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks (small sparkles, a sweat drop, motion ticks); a short palette — one strong accent colour over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 320 (total 1024 x 640), read left to right, top row first, no grid lines drawn. The same character in all eight cells, at the same scale: NICO, a cheerful 7-year-old boy in chibi proportions — brown skin, short curly dark-brown hair, big friendly eyes, a light-orange t-shirt with one white stripe, blue denim overalls, yellow sneakers. In EVERY cell his body and face are turned three-quarters to the RIGHT, he is about 88% of the cell tall, and his feet touch the bottom of the cell.
1. Standing still, smiling, arms relaxed.
2. Proudly holding a closed cardboard toy box in front of his chest with both hands; the box is pastel blue with a simple picture of colored wooden blocks and a golden bell on its front, no writing.
3. Placing a piece: both arms stretched forward and a little up, hands open and empty, focused face with the tongue slightly out.
4. Celebrating: a little hop, both fists up, eyes closed as two happy arcs, small sparkles.
5. Oops: leaning back, both hands on his head, mouth open, one sweat drop.
6. Reading: looking down at a blank sheet of paper held in both hands, calm face.
7. Releasing a marble: one arm stretched up and forward with the hand open, smiling.
8. Thinking: one hand on his chin, eyes looking up, a small curious smile.

DO NOT INCLUDE: girls, other characters, pets, a table, building blocks, ramps, marbles, bells (except the small picture on the box in cell 2), text, letters, words, numbers, writing on the box or on the paper, hats, capes, costumes, backpacks, glasses, ground, floor, shadow under the feet, scenery, anime video game characters, character roster sheets, RPG costume props, weapons, horns, wings, pointed elf ears, eyepatch, glowing eyes, ornate hair accessories, huge spiky hair, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, items crossing cell borders, cropped edges, drop shadow on the cell, white backing in transparent assets, sad faces, crying, angry faces.
~~~

---

## 7. `caixa.png` — 2 × 1 células de 384 × 320 (768 × 320), alfa

A caixa do brinquedo. Na abertura o Nico a segura (`nico.png`, célula 1); depois ela fica no chão ao lado da mesa, e as páginas e as peças saem dela.

| Célula | Estado |
|---|---|
| 0 | fechada, de frente, com o desenho do circuito na tampa |
| 1 | aberta: a tampa levantada para trás, o interior vazio à vista |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; big simple friendly shapes; a short palette over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 1 row, each cell 384 x 320 (total 768 x 320), no grid lines drawn. A toy box made of sturdy cardboard, pastel BLUE, seen from the front and a little from above, sitting on the bottom edge of each cell, about 80% of the cell wide, the same size in both cells.
1. CLOSED: on its front a simple cheerful picture of a little marble run — a stack of yellow, blue and green wooden cubes with a lilac ramp and a small golden bell — no writing at all.
2. OPEN: the same box with its lid flipped up and back, the inside empty and lighter, the same picture still on the front.

DO NOT INCLUDE: text, letters, words, logos, brand names, age labels, barcodes, numbers, toys spilling out, pieces inside the box, hands, characters, a table, a floor, shadow on the ground, watermark, artist signature, user interface, buttons, frames, arrows, icons, stars, HUD, anime video game characters, horns, pointed elf ears, eyepatch, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, items crossing cell borders, cropped edges, drop shadow on the cell, white backing in transparent assets.
~~~

---

## 8. `ui.png` — 2 × 2 células de 256 × 192 (512 × 384), alfa

| Célula | Peça |
|---|---|
| 0 | a **página** do manual: papel creme com o cantinho de cima à direita dobrado; o meio fica liso, porque o jogo desenha a miniatura ali |
| 1 | o **espaço vazio** da fita: a mesma forma, com contorno tracejado e o miolo bem claro e meio transparente |
| 2 | o botão **MONTAR ligado**: botão verde arredondado com degrau embaixo e um martelinho de brinquedo no terço da esquerda; os dois terços da direita lisos, porque o código escreve MONTAR ali |
| 3 | o mesmo botão **desligado**, cinza-claro, martelinho cinza |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; big simple friendly shapes; a short palette over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 2 rows, each cell 256 x 192 (total 512 x 384), read left to right, top row first, no grid lines drawn. Each item fills about 92% of its cell, centered, straight and flat to the viewer.
1. A PAGE of a toy instruction booklet: a sheet of warm cream paper with softly rounded corners, the top-right corner folded down as a small triangle, a thin soft-blue border line inside the edge; the middle completely plain and empty.
2. An EMPTY PAGE SLOT with the exact same shape: no fill except a very pale see-through cream, the outline drawn as a soft grey DASHED line.
3. A big chunky GAME BUTTON, a rounded rectangle in bright GREEN (#49C27C) with a darker green step under it so it looks pressable and a small white highlight on top; on its LEFT third a small cute wooden toy hammer icon; the right two thirds plain green and empty.
4. The exact same button DISABLED: flat light grey with a darker grey step, the hammer icon in grey.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, page numbers, drawings or pictures on the page, lines of writing, check marks, crosses, arrows, stars, icons other than the hammer, hands, characters, a table, watermark, artist signature, logo, anime video game characters, horns, pointed elf ears, eyepatch, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, items crossing cell borders, cropped edges, drop shadow on the cell, white backing in transparent assets.
~~~

---

## 9. `pipoca.png` — 3 × 1 células de 320 × 256 (960 × 256), alfa · **só no N3**

A Pipoca, a gata da casa: gata rajada laranja e creme, olhos verdes grandes, rabo fofo. Vista de **lado**, virada para a **esquerda** (ela entra pela direita).

| Célula | Pose |
|---|---|
| 0 | dormindo enroladinha como um pãozinho, olhos fechados, um "z" **não** (o código desenha) |
| 1 | acordando num pulo: as quatro patas no ar, pelo arrepiado, olhos arregalados |
| 2 | andando, uma pata da frente levantada, rabo para cima |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; small chibi proportions, big head and little body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; a short palette over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 1 row, each cell 320 x 256 (total 960 x 256), read left to right, no grid lines drawn. The same cat in all three cells at the same scale: PIPOCA, a chubby chibi house cat with orange and cream tabby stripes, big green eyes, a fluffy tail, a tiny pink nose. Seen from the SIDE, facing LEFT, sitting or standing on the bottom edge of the cell.
1. Sleeping curled up into a round bun, eyes closed as two calm arcs, tail wrapped around.
2. Startled awake: jumping up with all four paws in the air, fur puffed, eyes wide, a small surprise mark.
3. Walking to the left: one front paw raised, tail up, happy face.

DO NOT INCLUDE: letters, a "z" letter, text, words, numbers, other animals, dogs, kittens, people, a collar with a name tag, a cushion, a basket, a table, a floor, shadow on the ground, scenery, watermark, artist signature, logo, user interface, buttons, frames, arrows, icons, stars, HUD, anime video game characters, horns, pointed elf ears, eyepatch, wings, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, items crossing cell borders, cropped edges, drop shadow on the cell, white backing in transparent assets, angry faces.
~~~

---

## 10. `pagina-se.png` — 512 × 256, alfa · **só no N3**

A página SE: uma página larga do manual com **dois bolsos** lado a lado. No alto à esquerda, um espaço liso onde o código põe a foto da condição; os bolsos são dois retângulos de papel um pouco mais escuro, colados na página, com a boca aberta para cima. O da esquerda tem a borda verde (SE sim) e o da direita a borda laranja (SENÃO).

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; big simple friendly shapes; a short palette over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

A single game UI asset on a fully TRANSPARENT background, 512 x 256: a wide page of a toy instruction booklet made of warm cream paper with softly rounded corners and the top-right corner folded down. The top 30% of the page is plain and empty. Below it, two equal PAPER POCKETS side by side, each about 45% of the page wide and 60% tall, made of slightly darker cream paper glued onto the page with their open mouths at the top; the LEFT pocket has a soft GREEN (#49C27C) border, the RIGHT pocket a soft ORANGE (#FF9D57) border. The pockets are empty.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, YES or NO words, check marks, crosses, arrows, pictures, cats, blocks, ramps, things inside the pockets, hands, characters, watermark, artist signature, logo, anime video game characters, horns, pointed elf ears, eyepatch, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy noise, cropped edges, drop shadow, white backing in transparent assets.
~~~

---

## 11. `cover-circuito-de-bolinha.png` — 1672 × 941, opaco

A capa do catálogo, **com o título** escrito.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art style applied to a full illustration; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; small chibi proportions, big head and little body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; bright cheerful toy colours over warm near-white. NO white sticker keyline here — this is a full scene, not a sticker. Crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, its clothes, its hair, its poses, its scenes or its framing.

Cover illustration, 1672 x 941, fully opaque; the main action must read at thumbnail size. A cozy kids' playroom with a butter-yellow wall. On a low wooden play table stands a little toy MARBLE RUN built from stacked wooden cubes (yellow, blue, green, coral) and lilac ramps going down from left to right, ending at a shiny golden BELL on a small stand. A blue-and-white glass marble is rolling down the ramps, with small motion lines, and the bell is ringing with tiny sound marks. On the left, NICO — a cheerful chibi boy with brown skin, short curly dark-brown hair, a light-orange t-shirt with one white stripe, blue denim overalls and yellow sneakers — cheers with both fists up, holding an open instruction booklet page in one hand. A pastel-blue toy box sits open on the floor next to him.
At the top, centered, the title lettering "Circuito de Bolinha" in big chubby rounded colourful letters with a thick dark outline and a little volume, easy to read. Spell it exactly: C-i-r-c-u-i-t-o d-e B-o-l-i-n-h-a.

DO NOT INCLUDE: any other text, subtitles, logos, brand names, numbers, watermark, artist signature, website address, other children, adults, pets, red pieces, metal tracks, plastic tubes, a computer, a screen, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, white sticker keyline, sticker border, anime video game characters, character roster sheets, RPG costume props, weapons, horns, wings, pointed elf ears, eyepatch, glowing eyes, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, cropped edges, sad faces, crying, angry faces.
~~~

---

## 12. Depois que a arte chegar

- Medir a folha inteira por colunas antes de medir por célula (objeto vazando para a célula vizinha pede reempacotar, não pivô).
- `mesa.png`: medir onde fica a linha de cima do tampo e ajustar `TABLE.top` em `data/layout.ts`.
- `pecas.png`: medir a canaleta da rampa (ponta alta e ponta baixa) e ajustar `RAMP` em `data/layout.ts`, para a bolinha rolar em cima da canaleta; medir o copinho do sino (`BELL.cup`).
- `nico.png`: medir os pés por quadro e onde ficam as mãos na pose 2 (é de lá que a peça sai).
