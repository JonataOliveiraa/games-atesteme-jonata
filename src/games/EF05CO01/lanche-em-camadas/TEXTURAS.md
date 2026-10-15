# Lanche em Camadas — texturas

Destino: `src/assets/games/EF05CO01/lanche-em-camadas/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 o laço, §5 a tela, §6 os lanches).

**Linha de arte: chibi voador** (Dúvida 1 do plano). Anexe em **toda geração** a `references/35-chibi-voador.webp` (os quatro meninos chibi voando entre nuvens, com slimes e arco-íris).
- Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*.
- O elenco da referência vai no negativo de todos os prompts.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código nas mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `ingredientes.png` | 4 × 2 | 256 | 1024 × 512 | sim | as camadas do lanche, **vistas de lado**: caem do alto e empilham na bandeja |
| `ajudante.png` | 4 × 2 | 320 × 400 | 1280 × 800 | sim | a criança que segura a bandeja acima da cabeça |
| `clientes.png` | 3 × 3 | 320 × 400 | 960 × 1200 | sim | 3 clientes × (esperando, comendo feliz, careta) |
| `chef.png` | 4 × 1 | 320 | 1280 × 320 | sim | o chef na janela da cozinha |
| `cozinha.png` | — | — | 1280 × 720 | opaco | o fundo: a parede, a janela da cozinha e o balcão |
| `ui.png` | 3 × 2 | 256 | 768 × 512 | sim | botão de seta, cartão da receita, bandeja, estrelinha, coração, fumacinha |
| `cover-lanche-em-camadas.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Os números da receita (1º, 2º…), os nomes e as falas são do código. A única exceção é o título da capa.
- **Os ingredientes são de lado, chatos e largos**, como fatias de um lanche visto de frente. Cada um tem de ser reconhecível **sozinho, caindo**, e **empilhado** em cima de outro.
- **O pão de baixo e o pão de cima são diferentes de longe:** o de baixo é baixo e reto; o de cima é alto, em cúpula, com gergelim.
- **Nenhum ingrediente brilha mais que outro:** a cor do certo não pode entregar a resposta.
- Peça solta e centrada na célula, com cerca de 8 % de margem. **Personagens pisam no fundo da célula.**

---

## 3. `ingredientes.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Ingrediente | Forma (de lado) |
|---|---|---|
| 0 | **pão de baixo** | metade de pão de hambúrguer, baixa, com o corte reto em cima |
| 1 | **pão de cima** | a cúpula do pão, alta e redonda, com gergelim |
| 2 | **carne** | hambúrguer marrom, grosso, com marquinhas de grelha |
| 3 | **queijo** | fatia amarela fina com as pontas caindo dos lados |
| 4 | **alface** | folha verde ondulada, larga e fina |
| 5 | **tomate** | duas rodelas vermelhas lado a lado, vistas de lado |
| 6 | **ovo frito** (N3) | clara branca ondulada com a gema no meio |
| 7 | **picles** (N3) | três rodelinhas verdes |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Cute, chunky burger INGREDIENTS seen exactly FROM THE SIDE, as flat horizontal layers (like the slices of a burger seen from the front), each about 85% of the cell wide, centered, no plate, no shadow.
1. The BOTTOM BUN: a low, wide golden bun half with a flat top edge, about 25% of the cell tall.
2. The TOP BUN: a tall rounded golden dome with white sesame seeds and a flat bottom edge, about 45% of the cell tall.
3. A thick brown beef PATTY with soft grill marks, about 25% of the cell tall.
4. A thin yellow CHEESE slice with its two corners drooping down at the sides, about 15% of the cell tall.
5. A wavy, ruffled green LETTUCE leaf, wide and thin, about 18% of the cell tall.
6. Two red TOMATO slices side by side seen from the side, about 15% of the cell tall.
7. A FRIED EGG seen from the side: a wavy white edge and a round yellow yolk bump in the middle, about 20% of the cell tall.
8. Three small green PICKLE slices side by side, about 14% of the cell tall.

DO NOT INCLUDE: a whole assembled burger, plates, hands, faces or eyes on the food, characters, text, letters, numbers, steam, sparkles that make one item glow more than another, top-down views, 3/4 perspective views, shadows on the ground, backgrounds, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `ajudante.png` — 4 × 2 células de 320 × 400 (1280 × 800), alfa

A criança que joga: um menino chibi de pele parda, cabelo castanho espetado, olhos grandes castanhos, avental verde-água sobre camiseta creme, bermuda marrom, tênis brancos e uma touquinha de cozinheiro pequena. Nos quadros 0 a 3 ele está **de frente, com os dois braços levantados**, segurando **algo invisível** acima da cabeça (o código desenha a bandeja e o lanche).

| Célula | Pose |
|---|---|
| 0 | parado, de frente, braços para cima (mãos espalmadas a ~1/6 da célula do topo) |
| 1 | andando de lado sem virar o corpo (passinho): perna esquerda levantada, braços para cima |
| 2 | o **espelho** do 1: perna direita levantada, braços para cima |
| 3 | equilibrando: corpo inclinado, língua de fora de concentração, braços para cima |
| 4 | comemorando, de frente, pulinho, braços abertos |
| 5 | ops, de frente, as duas mãos nas bochechas |
| 6 | entregando, de lado olhando para a **direita**, braços esticados para a frente na altura do peito |
| 7 | joinha, de frente |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 400 (total 1280 x 800), read left to right, top row first. The SAME cute chibi boy in every cell, a little kitchen HELPER: light brown skin, spiky brown hair, big round brown eyes, a small white chef toque, a mint-teal apron over a cream T-shirt, brown shorts, white sneakers. Head about half of his height. In every cell he is complete, centered horizontally, with the soles of his shoes touching the BOTTOM edge of the cell, one single fully opaque figure per cell, the same size in all cells. In cells 1 to 4 his empty hands are raised flat ABOVE HIS HEAD as if holding an invisible tray (the game draws the tray), palms up, at the same height in every one of those cells.
1. Standing, facing the viewer, both arms raised, palms up above his head, smiling.
2. Side-stepping while still facing the viewer: his LEFT foot lifted, arms raised, palms up above his head.
3. The MIRROR of cell 2: his RIGHT foot lifted, arms raised, palms up above his head.
4. Balancing: body tilted to one side, tongue out in concentration, arms raised, palms up above his head.
5. Cheering, facing the viewer, a happy little jump, arms wide open, big smile.
6. "Oops" pose, facing the viewer, both hands on his cheeks, worried eyes.
7. Delivering: seen from the SIDE facing RIGHT, both arms stretched forward at chest height, palms up, smiling.
8. Facing the viewer, a happy thumbs-up.

DO NOT INCLUDE: a tray, plates, food, burgers, objects in his hands, other characters, ghost duplicates, semi-transparent copies, motion blur, speed lines, ground, floor, shadows on the ground, backgrounds, different outfits or faces between cells, different sizes between cells, text, letters, numbers, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `clientes.png` — 3 × 3 células de 320 × 400 (960 × 1200), alfa

Uma linha por cliente, e as colunas são **esperando · comendo feliz · careta**. Todos vistos **de frente, virados um pouco para a esquerda** (olhando para o ajudante), do peito para cima já basta, mas o corpo inteiro também serve (o balcão tapa as pernas).

| Linha | Cliente |
|---|---|
| 0 | **Nina**: menina de cabelo preto com duas marias-chiquinhas, moletom lilás |
| 1 | **Caio**: menino ruivo de cabelo curto, óculos redondos, camiseta azul-céu |
| 2 | **Vovó Zezé**: senhora de coque branco, óculos na ponta do nariz, cardigã coral |

| Coluna | Expressão |
|---|---|
| 0 | esperando, sorrindo, mãos juntas |
| 1 | comendo feliz: segurando um lanche **pequeno** com as duas mãos, mordendo, olhos fechados de prazer |
| 2 | careta: língua para fora, olhos apertados, mãos na barriga |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 3 rows, each cell 320 x 400 (total 960 x 1200), read left to right, top row first. STRICT CELL SEPARATION: each figure including hair, shoes and hands fits fully within the CENTRAL 70% WIDTH of its cell; leave at least 15% completely transparent EMPTY SPACE on both sides of EVERY cell. Do not let any hair from one cell enter another cell. Keep characters a little smaller if needed. Three cute chibi CUSTOMERS of a cozy burger shop, one per row, each facing the viewer and turned slightly to the LEFT, full body, standing on the bottom edge of the cell, the same size and outfit in the three cells of their row. Row 1: NINA, a girl with black hair in two compact pigtails and a lilac hoodie. Row 2: CAIO, a boy with short ginger hair, round glasses and a sky-blue T-shirt. Row 3: GRANNY ZEZÉ, an old lady with a white hair bun, little glasses on the tip of her nose and a coral cardigan. Columns, the same for every row: (1) waiting with a happy smile, hands together; (2) happily eating a SMALL burger held in both hands, taking a bite, eyes closed with delight; (3) a funny "yuck" face, tongue out, eyes squeezed, hands on the belly. One single fully opaque figure per cell.

DO NOT INCLUDE: counters, tables, backgrounds, ground, shadows on the ground, other characters in the same cell, ghost duplicates, text, letters, numbers, money, phones, different outfits or faces inside a row, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `chef.png` — 4 × 1 células de 320 (1280 × 320), alfa

O chef aparece **do peito para cima** na janela da cozinha: um senhor gordinho e simpático de bigode grande, chapéu de cozinheiro alto e dólmã branco.

| Célula | Pose |
|---|---|
| 0 | parado, sorrindo |
| 1 | **jogando** algo para o alto: um braço erguido, mão aberta (sem nada na mão) |
| 2 | surpreso, mãos no rosto |
| 3 | feliz, piscando, joinha |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 1 row, each cell 320 x 320 (total 1280 x 320). The SAME friendly chubby CHEF in every cell, seen from the CHEST UP (cut flat at the bottom edge of the cell, as if behind a kitchen window sill): a big curly mustache, rosy cheeks, a tall white chef hat and a white chef jacket. One single fully opaque figure per cell, the same size in all cells.
1. Standing and smiling.
2. Tossing something upward: one arm raised high with an open empty hand, cheerful.
3. Surprised: both hands on his cheeks, mouth open.
4. Happy, winking, giving a thumbs-up.

DO NOT INCLUDE: food in his hands, pans, knives, the window frame, kitchen background, other characters, legs, text, letters, numbers, items crossing cell borders, items cut by the cell edge (except the flat cut at the bottom), the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `cozinha.png` — 1280 × 720, opaco

O fundo da lanchonete. O código desenha por cima o chef (na janela), os ingredientes caindo, o ajudante, o cliente e o cabeçalho, então **o meio tem de ficar calmo**.

| Região (y, x) | O que tem |
|---|---|
| 0–96 | parede (o cabeçalho cobre) |
| x 500–780, y 130–300 | a **janela da cozinha** (passa-pratos): uma abertura larga com peitoril, e lá dentro a cozinha escurinha, vazia (o chef entra pelo código) |
| x 1080–1280, y 430–720 | o **balcão** de atendimento, de frente, com tampo de madeira (o cliente fica atrás, x ≈ 1180) |
| y 660–720 | o chão de ladrilhos xadrez clarinho |
| o resto | parede de azulejos creme e verde-menta, quadrinho de lanche, luminária; pouco contraste |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 1280 x 720, opaque: the inside of a cute, cozy little BURGER SHOP seen straight from the FRONT (flat, no strong perspective). The back wall has soft cream and mint-teal tiles. In the upper middle of the wall (x about 500 to 780, y about 130 to 300) there is a wide KITCHEN SERVING WINDOW with a wooden sill; inside it, a dim, EMPTY kitchen. On the far right (x from about 1080, from y about 430 down) a front-facing wooden SERVICE COUNTER. The floor at the very bottom is light checkered tiles. A cute burger picture frame and a hanging lamp add charm. The big middle area of the wall must stay calm, plain and uncluttered (food will fall through it).

DO NOT INCLUDE: people, the chef, customers, food in the air, burgers on the counter, text, letters, numbers, menus with writing, prices, logos, signs with words, strong perspective, night, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `ui.png` — 3 × 2 células de 256 (768 × 512), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | botão **redondo** creme com uma **seta grossa para a DIREITA** | ▶; o código espelha para o ◀ |
| 1 | **cartão da receita** em branco: um papelzinho em pé, com uma faixa no alto (para o número) e o miolo vazio (para o ingrediente) | a receita |
| 2 | **bandeja** redonda de lanchonete, vista de lado (uma elipse achatada) | onde o lanche é montado |
| 3 | **estrelinha** dourada | acerto |
| 4 | **coração** rosa | o cliente feliz |
| 5 | **fumacinha** (três nuvenzinhas) | o ingrediente que caiu no chão some |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 256 x 256 (total 768 x 512), read left to right, top row first. Cute, puffy, chunky interface pieces for a children's burger-shop game, each centered with about 8% margin, no ground, no shadow.
1. A big ROUND cream push button with a thick rounded teal ARROW pointing to the RIGHT, soft highlight.
2. A small upright RECIPE CARD: cream paper with a soft colored band across the top and a completely BLANK middle, slightly rounded corners.
3. A round diner SERVING TRAY seen from the side (a flat wide ellipse with a rim), metallic mint-teal.
4. A small golden STAR with a shine.
5. A pink HEART.
6. A small PUFF of smoke: three soft round white clouds.

DO NOT INCLUDE: text, letters, numbers, words on the button or card, food, burgers, hands, characters, faces, backgrounds, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. `cover-lanche-em-camadas.png` — 1672 × 941, opaco, com o título

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A cover illustration for a children's game, 16:9 (1672 x 941), opaque. At the TOP, a big, bold, friendly title lettering that reads exactly "Lanche em Camadas" (Portuguese), in chunky rounded letters, cream with a warm brown outline. Below: inside a cozy burger shop, a cute chibi kitchen HELPER boy (light brown skin, spiky brown hair, small chef toque, mint-teal apron) runs holding a serving tray high above his head with a tall, wobbly burger on it, catching a slice of cheese that falls from the air; other ingredients (a lettuce leaf, a tomato slice, a top bun) fly through the air, tossed by a friendly mustached CHEF from the kitchen window. A happy customer girl with black pigtails waits at the counter. Bright, playful, energetic mood.

DO NOT INCLUDE: any text other than the title "Lanche em Camadas", misspelled title, extra titles, menus with writing, prices, logos, brand marks, real fast-food brands, weapons, scary elements, night, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 10. Quando a arte chegar

- Medir cada folha por colunas antes de medir por célula (objeto que vaza para a vizinha pede reempacotar) e zerar a franja de alfa baixo.
- **Ingredientes:** medir a altura de cada camada. É ela que dá a **espessura** na pilha (`INGREDIENTS[*].thick` em `data/ingredients.ts`).
- **Ajudante:** medir a altura das mãos nos quadros 0–3 e ajustar `HELPER.hands` (onde a bandeja fica).
- **Cozinha:** conferir onde caíram a janela e o balcão e ajustar `CHEF` e `COUNTER` em `data/layout.ts`.
- Registrar medidas e limpezas no `MANIFEST.md` da pasta de assets.
