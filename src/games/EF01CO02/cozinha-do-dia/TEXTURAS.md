# Cozinha do Dia — texturas

Destino: `src/assets/games/EF01CO02/cozinha-do-dia/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 a tela, §6 os pedidos, §7 os estragos).

**Linha de arte: livro ilustrado** (pedido do usuário em 04/11/2026). Anexe em **toda geração** a `references/34-livro-ilustrado.jpg`.
Cada prompt vem inteiro, pronto para copiar.

**O jogo já roda sem nenhum PNG.** A reserva é desenhada em código nas mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `cozinha.png` | — | — | 1280 × 720 | opaco | a parede da cozinha |
| `bancada.png` | — | — | 1280 × 340 | sim | a bancada de frente, por cima do animal |
| `clientes.png` | 3 × 3 | 320 × 400 | 960 × 1200 | sim | gato, cachorro, macaco × esperando, comendo, careta |
| `objetos.png` | 3 × 3 | 256 | 768 × 768 | sim | os 9 objetos da bancada (também são as figuras da receita) |
| `preparo-cereal.png` | 4 × 2 | 320 | 1280 × 640 | sim | os estados da tigela |
| `preparo-hotdog.png` | 4 × 2 | 320 | 1280 × 640 | sim | os estados do prato |
| `preparo-vitamina.png` | 4 × 3 | 320 | 1280 × 960 | sim | os estados do liquidificador |
| `cover-cozinha-do-dia.png` | — | — | 1672 × 941 | opaco | capa **com o título** |
| `objetos-2.png` | 3 × 3 | 256 | 768 × 768 | sim | **N2:** os 8 objetos novos da bancada |
| `preparo-sanduiche.png` | 4 × 2 | 320 | 1280 × 640 | sim | **N2:** os estados do sanduíche |
| `preparo-sorvete.png` | 4 × 2 | 320 | 1280 × 640 | sim | **N2:** os estados da taça de sorvete |
| `preparo-pave.png` | 4 × 2 | 320 | 1280 × 640 | sim | **N2:** os estados do pavê |

**O N3 não pede arte nova:** ele reaproveita os pratos do N1. Os animais e o cenário são os mesmos nos três níveis.

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede na carga, mas a grade, a ordem e o conteúdo não podem mudar.

**Entrega de 04/11/2026:** os PNGs vieram menores que a tabela (`clientes` 579 × 679, `preparo-vitamina` 724 × 543). Na pasta estão as versões tratadas: névoa de alfa limpa, poses do mesmo animal alinhadas, bancada sem as faixas vazias, ampliação até o tamanho da tabela. Em `clientes` e nas folhas de preparo a arte fica um pouco macia, mais ainda no close do animal.

## 2. Regras deste jogo

- **Nenhum texto na arte**, nem na caixa de cereal, nem no leite. A única exceção é o título da capa.
- **Os animais existem de verdade:** gato, cachorro e macaco, com cara de bicho, **sem roupa**, sem chapéu e nada de monstrinho.
- **O cachorro do jogo não é o da referência:** o nosso é caramelo, de orelhas caídas; o da imagem é creme, de orelhas em pé. Por isso o negativo cita o da imagem.
- **Nenhum objeto brilha mais que outro:** a cor não pode entregar o passo certo.
- **Os quadros do preparo têm o mesmo enquadramento.** A tigela, o prato ou o liquidificador ficam no **mesmo lugar e tamanho** em todas as células, com a base a cerca de 94 % da altura da célula. O jogo troca um quadro pelo outro e nada pode pular de lugar.
- **O liquidificador não tem botão desenhado:** o botão é a célula 8 de `objetos.png` e o jogo o põe na base dele.

**Por causa do estilo:**
- **O granulado fica dentro das formas.** A referência espalha pontilhado em volta das figuras, e num PNG com alfa isso vira sujeira. Está no prompt e no negativo; na entrega, limpe o alfa baixo antes de medir.
- **Quase sem contorno, então branco precisa de sombra.** Leite, prato e caixinha branca vão sobre fundo creme: precisam de sombra quente e linha suave para não sumir.

---

## 3. `cozinha.png` — 1280 × 720, opaco

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a full-scene game background, 16:9, exactly 1280 x 720: a cozy home KITCHEN WALL seen straight from the front, flat elevation with no strong perspective, calm and soft so that game objects read clearly on top of it.
- A warm cream wall, with pale peach tiles on the lower part from y = 260 down.
- The top 72 pixels are plain wall (a game header goes there).
- From x = 240 to x = 1110 and from y = 80 to y = 300, the wall is EMPTY and plain (a thought cloud and a recipe go there).
- From x = 0 to x = 340 the wall is plain too (an animal goes there).
- On the far right, from x = 1118 to x = 1258, a small window with a peach curtain and a soft blue sky, and below it a small shelf with two little pots.
- Everything from y = 390 down is plain tile, because a counter covers it.
Low contrast, gentle light coming from the window, no strong saturated colours.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a puppy, a street, pavement, a sandwich, a water bottle; characters, animals, people, food, a counter, a table, a stove, a recipe, clutter on the wall; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, strong perspective, harsh contrast, neon colours, dark or gloomy lighting; text, letters, words, labels, digits, numbers, captions, watermark, signature, user interface, buttons, frames, speech bubbles, arrows, icons, HUD.
~~~

## 4. `bancada.png` — 1280 × 340, alfa

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture kept strictly INSIDE the shape, so the edge stays clean; almost no outlines — thin, soft edge lines in a deeper tone of its own colour, never black. Warm pastel palette (honey wood, warm browns, creamy whites). Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game asset on a fully TRANSPARENT background, exactly 1280 x 340: a wide kitchen COUNTER seen from the front and slightly above, spanning the whole width edge to edge.
- The flat, light honey-wood top surface takes the upper 280 pixels, clean and empty, in one calm light tone with only very soft wood grain.
- The bottom 60 pixels are the darker front edge.
- The top edge of the counter is a perfectly straight horizontal line at the very top of the image; above it there is nothing.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement; food, plates, tools, objects on the counter, characters, a wall, floor, background, shadows on the ground, speckle or grain spraying outside the shape, white halo, white sticker keyline; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic, strong perspective; text, letters, numbers, watermark, signature.
~~~

## 5. `clientes.png` — 3 × 3 células de 320 × 400 (960 × 1200), alfa

| Linha | Animal | Coluna 0: esperando | Coluna 1: comendo | Coluna 2: careta |
|---|---|---|---|---|
| 0 | **gato** laranja rajado | olhos grandes, boquinha aberta de fome | olhos fechados de alegria, bochecha cheia | olhos apertados, língua para fora, gota de suor |
| 1 | **cachorro** caramelo, orelhas caídas | idem, língua de fora | idem | idem |
| 2 | **macaco** marrom, rosto claro | idem | idem | idem |

O animal aparece **do peito para cima**, de frente, com as duas patas à frente do peito. O corpo vai até o fundo da célula, porque a bancada o corta.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes; big expressive eyes with dark brown irises and one big soft highlight, like the eyes of the reference. Warm pastel palette with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 3 rows, each cell 320 x 400 (total 960 x 1200), read left to right, top row first. Three REAL ANIMALS, clearly recognizable as real species, with natural fur and no clothes, seen from the front from the chest up. The body reaches the bottom edge of the cell and is cut there. The head is big and takes the upper 60% of the cell. Two paws in front of the chest. Same animal, same size and same position in all three cells of a row, so that only the face changes.
Row 1: an ORANGE TABBY CAT with pointed ears, soft darker stripes, whiskers and a pink nose.
Row 2: a CARAMEL DOG with long FLOPPY ears hanging down, a cream muzzle and a black nose.
Row 3: a BROWN MONKEY with round ears on the sides and a light peach face.
Column 1 (hungry): big round eyes looking forward, small open mouth, a hopeful face.
Column 2 (eating): eyes closed in happy arcs, one puffed cheek, chewing, a blissful face.
Column 3 (yuck): eyes squeezed shut, tongue out, a grimace, one small sweat drop.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, the cream puppy with pointed ears from the reference, a street, pavement, a sandwich, a water bottle; clothes, hats, aprons, bows, collars, monsters, fantasy creatures, humans, food, bowls, plates; speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline, background, ground shadow; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic; text, letters, numbers, speech bubbles, grid lines, cell borders, items crossing cell borders, items cut by the sides or the top of the cell, watermark, signature.
~~~

## 6. `objetos.png` — 3 × 3 células de 256 (768 × 768), alfa

| Célula | Objeto | Como é |
|---|---|---|
| 0 | **tigela** | tigela azul vazia, vista de lado e um pouco de cima |
| 1 | **cereal** | caixa alta com bolinhas de cereal desenhadas, sem letras |
| 2 | **leite** | caixinha branca e azul, com uma gota de leite desenhada |
| 3 | **pão** | pão de cachorro-quente comprido, aberto no meio |
| 4 | **salsicha** | salsicha grande sozinha, avermelhada, com brilho |
| 5 | **ketchup** | bisnaga vermelha de bico fino, com um tomate desenhado |
| 6 | **banana** | banana amarela inteira, descascada até a metade |
| 7 | **tampa** | tampa de liquidificador escura, com pegador |
| 8 | **botão** | botão redondo grande laranja, com o símbolo de ligar, numa basezinha |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette with a few clear accents. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 3 rows, each cell 256 x 256 (total 768 x 768), read left to right, top row first. Nine chunky, simple kitchen objects, each alone, centered, filling about 80% of its cell, all with the same visual weight so that none stands out. White parts have a warm soft shadow, so they still read on a cream background. No faces on the objects.
1. An empty BLUE BOWL seen from the side and slightly above.
2. A tall CEREAL BOX with cereal balls painted on the front, no letters.
3. A white and blue MILK CARTON with a milk drop painted on the front, no letters.
4. A long HOT DOG BUN, open in the middle, empty.
5. One big reddish SAUSAGE with a soft shiny highlight.
6. A red KETCHUP squeeze bottle with a thin nozzle and a small tomato painted on it, no letters.
7. One yellow BANANA, half peeled.
8. A dark BLENDER LID with a small handle on top.
9. A big round ORANGE PUSH BUTTON with a power symbol, on a small base.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement, a sandwich, a water bottle; faces or eyes on the objects, hands, characters, a table, backgrounds, ground shadows, speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline, sparkles that make one item glow more than another; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic; text, letters, numbers, logos, grid lines, cell borders, items crossing cell borders, watermark, signature.
~~~

## 7. As três folhas do preparo — células de 320, alfa

Todas têm a mesma regra: **o recipiente não muda de lugar nem de tamanho entre as células**, centrado na largura, com a base a cerca de 94 % da altura da célula.

### `preparo-cereal.png` — 4 × 2

| Célula | Quadro |
|---|---|
| 0 | jogo americano vazio, em cima da mesa |
| 1 | tigela azul vazia no jogo americano |
| 2 | tigela com cereal, sem leite |
| 3 | **pronto:** tigela com cereal, leite e uma colher |
| 4 | **estrago:** cereal espalhado no jogo americano, sem tigela |
| 5 | **estrago:** poça de leite no jogo americano, sem tigela |
| 6 | **estrago:** tigela só com leite, gotas pulando |
| 7 | **estrago:** tigela transbordando de cereal, bolinhas caindo pelos lados |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. IMPORTANT: this is ONE place changing state, so the oval mint-green PLACEMAT and the blue BOWL stay in EXACTLY the same position and size in every cell. The placemat is an oval about 90% of the cell wide, centered, with its bottom at 94% of the cell height. The bowl is about 70% of the cell wide, sitting on the placemat, with its rim at 66% of the cell height. No faces on the food.
1. Only the empty placemat.
2. The empty blue bowl on the placemat.
3. The bowl with golden cereal balls inside, no milk.
4. FINISHED: the bowl with cereal balls floating in white milk and a spoon sticking out to the right.
5. MESS: no bowl; golden cereal balls scattered in a pile on the placemat.
6. MESS: no bowl; a wide puddle of white milk on the placemat, dripping over the edges.
7. MESS: the bowl with only white milk, and milk drops jumping out above it.
8. MESS: the bowl overflowing with a tall heap of cereal balls, some falling on the placemat.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement, a sandwich, a water bottle; hands, characters, faces on the food, a table edge, backgrounds, ground shadows, speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic; text, letters, numbers, logos, grid lines, cell borders, items crossing cell borders, the bowl changing size or position between cells, watermark, signature.
~~~

### `preparo-hotdog.png` — 4 × 2

| Célula | Quadro |
|---|---|
| 0 | prato branco vazio |
| 1 | prato com o pão aberto, vazio |
| 2 | prato com o pão e a salsicha |
| 3 | **pronto:** cachorro-quente com ketchup em zigue-zague |
| 4 | **estrago:** prato sem pão, com uma poça de ketchup |
| 5 | **estrago:** pão só com ketchup, escorrendo, sem salsicha |
| 6 | **estrago:** pão com duas salsichas, a de cima escorregando |
| 7 | livre (deixe vazia) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. IMPORTANT: this is ONE plate changing state, so the white oval PLATE and the BUN stay in EXACTLY the same position and size in every cell where they appear. The plate is about 90% of the cell wide, centered, with its bottom at 94% of the cell height, and has a warm soft shadow so it reads on a cream background. The long hot dog bun, seen from the side, is about 72% of the cell wide and rests on the plate, with its opening at 75% of the cell height. No faces on the food.
1. Only the empty white plate.
2. The plate with the open empty bun.
3. The plate with the bun and one reddish sausage inside it.
4. FINISHED: the hot dog with a red ketchup zigzag on top of the sausage.
5. MESS: no bun; a red ketchup puddle on the plate.
6. MESS: the bun with no sausage, full of ketchup dripping down its sides.
7. MESS: the bun with two sausages, the top one tilted and sliding off.
8. Leave this cell completely EMPTY.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement, a sandwich, a water bottle; hands, characters, faces on the food, a table edge, backgrounds, ground shadows, speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic; text, letters, numbers, logos, grid lines, cell borders, items crossing cell borders, the plate changing size or position between cells, watermark, signature.
~~~

### `preparo-vitamina.png` — 4 × 3

| Célula | Quadro |
|---|---|
| 0 | liquidificador: base e copo vazio, sem tampa |
| 1 | copo com banana, sem tampa |
| 2 | copo com banana e leite, sem tampa |
| 3 | copo com banana e leite, **com tampa** |
| 4 | **batendo:** tampa, mistura bege girando |
| 5 | **pronto:** um copo de vidro alto cheio de vitamina, com canudo (sem liquidificador) |
| 6 | **estrago:** copo só com leite, gotas pulando, sem tampa |
| 7 | **estrago:** copo vazio com tampa |
| 8 | **estrago:** copo transbordando, leite escorrendo |
| 9 | **estrago:** copo vazio todo respingado de vitamina, sem tampa |
| 10 | **estrago:** copo só com banana, com tampa |
| 11 | livre (deixe vazia) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 3 rows, each cell 320 x 320 (total 1280 x 960), read left to right, top row first. IMPORTANT: this is ONE kitchen BLENDER changing state, so it stays in EXACTLY the same position and size in every cell where it appears. The blender is seen from the front, centered: a plain, smooth, grey-blue base block with NO buttons, with its bottom at 94% of the cell height and about 16% of the cell tall; on top of it a clear pale-blue glass jar that gets wider toward the top, with a handle on the right and its open mouth at 20% of the cell height. The dark lid, when present, sits exactly on the mouth. No faces on the food.
1. The blender with the empty jar, no lid.
2. The jar with a peeled banana inside, no lid.
3. The jar with the banana and white milk up to the middle, no lid.
4. The same with the dark lid on.
5. BLENDING: lid on, a beige smoothie swirling inside the jar, with soft spiral motion.
6. FINISHED: no blender; one tall drinking glass full of beige banana smoothie with a pink straw, centered, with its bottom at 94% of the cell height.
7. MESS: the jar with only white milk and milk drops jumping out, no lid.
8. MESS: the empty jar with the dark lid on.
9. MESS: the jar overflowing, white milk running down its outside and pooling beside the base, no lid.
10. MESS: the empty jar splattered all over with beige smoothie, no lid.
11. MESS: the jar with only a banana, lid on.
12. Leave this cell completely EMPTY.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement, a sandwich, a water bottle; buttons or dials on the blender, hands, characters, faces on the food, a table edge, backgrounds, ground shadows, speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic; text, letters, numbers, logos, grid lines, cell borders, items crossing cell borders, the blender changing size or position between cells, watermark, signature.
~~~

## 8. `cover-cozinha-do-dia.png` — 1672 × 941, opaco

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes; big expressive eyes with dark brown irises and one big soft highlight. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game cover, exactly 1672 x 941. A cozy kitchen seen from the front. Behind a honey-wood counter, three REAL ANIMALS with natural fur and no clothes, an orange tabby cat, a caramel dog with long floppy ears and a brown monkey, look hungry and happy at the food on the counter: a bowl of cereal with milk, a hot dog with ketchup and a blender with a banana smoothie. A paper recipe made only of small pictures hangs on the wall behind them. At the top, centered, the game title in big, colourful, rounded letters with a dark outline, exactly: "Cozinha do Dia".

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, the cream puppy with pointed ears from the reference, a street, pavement, a sandwich, a water bottle; any other text, monsters, humans, clothes on the animals; black outlines on the characters, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, photorealistic, harsh contrast, neon colours, dark lighting; watermark, signature, logos, user interface, buttons.
~~~

---

# N2 — quatro folhas novas

Mesma linha (**livro ilustrado**) e mesma referência: anexe a `references/34-livro-ilustrado.jpg` em toda geração. **Entregues em 04/11/2026:** vieram alinhadas e só precisaram de limpeza da névoa de alfa; as três de preparo foram ampliadas de 887 × 443 para 1280 × 640.

**Peça a maior resolução que o gerador der.** As folhas do N1 vieram pequenas e precisaram ser ampliadas.

## 9. `objetos-2.png` — 3 × 3 células de 256 (768 × 768), alfa

| Célula | Objeto | Como é |
|---|---|---|
| 0 | **pão** | uma fatia de pão de forma, de frente |
| 1 | **queijo** | uma fatia grossa de queijo amarelo com furinhos |
| 2 | **taça** | taça de sorvete de vidro, vazia, com pé |
| 3 | **sorvete** | uma bola de sorvete de morango, sozinha |
| 4 | **calda** | bisnaga marrom de calda de chocolate, de bico fino |
| 5 | **biscoito** | um biscoito retangular dourado |
| 6 | **creme** | bisnaga branca de creme, de bico fino, com uma gota desenhada |
| 7 | **morango** | um morango vermelho inteiro, com folhinha |
| 8 | livre | deixe vazia |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette with a few clear accents. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background, in the highest resolution available: a grid of 3 columns x 3 rows, each cell 256 x 256 (total 768 x 768), read left to right, top row first. Eight chunky, simple kitchen objects, each alone, centered, filling about 80% of its cell, with a clear empty gap between it and the cell borders, all with the same visual weight so that none stands out. White parts have a warm soft shadow, so they still read on a cream background. No faces on the objects.
1. One square slice of SANDWICH BREAD seen from the front, with a golden crust.
2. One thick slice of YELLOW CHEESE with round holes.
3. An empty glass ICE CREAM SUNDAE CUP with a short stem and a round foot.
4. One round scoop of pink STRAWBERRY ICE CREAM, alone, with no cup and no cone.
5. A brown CHOCOLATE SYRUP squeeze bottle with a thin nozzle, no letters.
6. One rectangular golden COOKIE, seen from the front.
7. A white CREAM squeeze bottle with a thin nozzle and a small drop painted on it, no letters.
8. One whole red STRAWBERRY with a green leaf on top.
9. Leave this cell completely EMPTY.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement, a water bottle; faces or eyes on the objects, hands, characters, a table, backgrounds, ground shadows, speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline, sparkles that make one item glow more than another; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic; text, letters, numbers, logos, grid lines, cell borders, items touching or crossing cell borders, watermark, signature.
~~~

## 10. `preparo-sanduiche.png` — 4 × 2 células de 320 (1280 × 640), alfa

| Célula | Quadro |
|---|---|
| 0 | tábua de madeira vazia |
| 1 | tábua com uma fatia de pão |
| 2 | + queijo |
| 3 | + ketchup em zigue-zague em cima do queijo |
| 4 | **pronto:** + a segunda fatia de pão por cima |
| 5, 6, 7 | livres (deixe vazias) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background, in the highest resolution available: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. IMPORTANT: this is ONE sandwich being built, seen from the SIDE, so the wooden BOARD and every layer stay in EXACTLY the same position and size in every cell where they appear. The board is about 88% of the cell wide, centered, with its bottom at 94% of the cell height. Each new layer is stacked flat on top of the previous one, and the layers are about 72% of the cell wide. No faces on the food.
1. Only the empty wooden board.
2. The board with one slice of bread lying flat.
3. The same, with a slice of yellow cheese on top of the bread.
4. The same, with a red ketchup zigzag on top of the cheese.
5. FINISHED: the same, with a second slice of bread on top, closing the sandwich.
6, 7, 8. Leave these cells completely EMPTY.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement, a water bottle; hands, characters, faces on the food, a table edge, backgrounds, ground shadows, speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic; text, letters, numbers, logos, grid lines, cell borders, items crossing cell borders, the board or the layers changing size or position between cells, watermark, signature.
~~~

## 11. `preparo-sorvete.png` — 4 × 2 células de 320 (1280 × 640), alfa

| Célula | Quadro |
|---|---|
| 0 | pratinho vazio |
| 1 | pratinho com a taça vazia |
| 2 | + uma bola de sorvete de morango na taça |
| 3 | + calda de chocolate escorrendo na bola |
| 4 | + a segunda bola, em cima |
| 5 | **pronto:** + calda na segunda bola |
| 6, 7 | livres (deixe vazias) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background, in the highest resolution available: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. IMPORTANT: this is ONE sundae being built, seen from the SIDE, so the SAUCER and the glass CUP stay in EXACTLY the same position and size in every cell where they appear. The white saucer is about 70% of the cell wide, centered, with its bottom at 94% of the cell height. The glass cup stands on it, about 46% of the cell wide, with its rim at 40% of the cell height. The two scoops are stacked above the rim, and the top of the second scoop stays inside the cell, at about 8% of the cell height. No faces on the food.
1. Only the empty white saucer.
2. The saucer with the empty glass cup on it.
3. The same, with one round scoop of pink strawberry ice cream resting in the cup.
4. The same, with brown chocolate syrup dripping over that scoop.
5. The same, with a second pink scoop on top of the first.
6. FINISHED: the same, with chocolate syrup dripping over the second scoop too.
7, 8. Leave these cells completely EMPTY.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement, a water bottle; spoons, cherries, sprinkles, wafers, hands, characters, faces on the food, a table edge, backgrounds, ground shadows, speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic; text, letters, numbers, logos, grid lines, cell borders, items crossing cell borders, the saucer or the cup changing size or position between cells, watermark, signature.
~~~

## 12. `preparo-pave.png` — 4 × 2 células de 320 (1280 × 640), alfa

| Célula | Quadro |
|---|---|
| 0 | prato vazio |
| 1 | prato com uma camada de biscoitos |
| 2 | + creme em cima dos biscoitos |
| 3 | + a segunda camada de biscoitos |
| 4 | + creme em cima da segunda camada |
| 5 | **pronto:** + um morango no topo |
| 6, 7 | livres (deixe vazias) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows, kept strictly INSIDE each shape so the silhouette edge stays clean; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the puppy, the cardboard, the street or the composition of the reference.

SUBJECT — a game sprite sheet on a fully TRANSPARENT background, in the highest resolution available: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. IMPORTANT: this is ONE layered cookie-and-cream dessert being built, seen from the SIDE, so the PLATE and every layer stay in EXACTLY the same position and size in every cell where they appear. The white plate is about 90% of the cell wide, centered, with its bottom at 94% of the cell height. The layers are about 70% of the cell wide, stacked flat. No faces on the food.
1. Only the empty white plate.
2. The plate with one layer of golden rectangular cookies.
3. The same, with a layer of white cream on top of the cookies.
4. The same, with a second layer of golden cookies on top of the cream.
5. The same, with a second layer of white cream on top.
6. FINISHED: the same, with one whole red strawberry on the very top.
7, 8. Leave these cells completely EMPTY.

DO NOT INCLUDE: the children from the reference image, a boy sitting on cardboard, a puppy, a street, pavement, a water bottle; candles, spoons, sprinkles, hands, characters, faces on the food, a table edge, backgrounds, ground shadows, speckle or grain spraying outside the shapes onto the transparent background, white halo, white sticker keyline; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, 3D render, photorealistic; text, letters, numbers, logos, grid lines, cell borders, items crossing cell borders, the plate or the layers changing size or position between cells, watermark, signature.
~~~
