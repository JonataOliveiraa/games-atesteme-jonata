# Pit Stop da Chuva — texturas

Destino: `src/assets/games/EF05CO04/pit-stop-da-chuva/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 o laço, §5 a tela, §7 os erros).

**Linha de arte: moda chapada** (nova, 15/10/2026, pedida pelo usuário). Anexe em **toda geração** as duas referências que ele mandou:
- `references/40-moda-chapada-a.png`: o casal no parque. Ela de cabelo escuro ondulado, laço vermelho, casaquinho amarelo e saia xadrez azul, fazendo "paz e amor"; ele de camisa xadrez azul e calça branca.
- `references/41-moda-chapada-b.png`: o casal de mãos dadas sobre fundo azul-claro. Ela de lenço de bolinhas e bolsa vermelha; ele de suéter azul e creme, fazendo "paz e amor"; com coração, nuvens e brilhinhos.

Regras dos prompts:
- Todo bloco STYLE começa mandando usar as imagens anexadas e termina em *"Take ONLY the art style"*.
- O elenco das referências vai no negativo de **todos** os prompts. Isso inclui o casal, o coração, a pose de "paz e amor" e o xadrez das roupas.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

### Em que esta linha difere das vizinhas

| | moda chapada (este jogo) | chibi de caderno (`37`/`38`) | chibi voador (`35`) |
|---|---|---|---|
| traço | **fino e uniforme, marrom-carvão**, com jeito de feito à mão | fino a médio, marrom quente, ponta afinando | liso médio, tom escuro da própria cor |
| cor | **100 % chapada**, quase sem sombra: no máximo umas manchas lisas mais escuras nas dobras | chapada e apagada, sem sombra | chapada + 1 sombra macia |
| rosto | pequeno e simples: **olho de pontinho ou tracinho**, sorriso curto, bochecha rosa | olho redondo com brilhos, bochecha com tracinhos | olho enorme com brilhos |
| proporção | **esguia, não chibi**: cabeça ≈ 1/6 da altura no adulto e ≈ 1/5 na criança | chibi um pouco alongado | cabeça ≈ metade |
| paleta | pastel apagado (amarelo-manteiga, azul-lavanda, ardósia, sálvia, creme, cinza quente) + acento coral e azul-royal | tijolo, cacau, mostarda, sálvia | lilás, verde-água, creme |
| enfeite | brilhinho de 4 pontas e tracinho de movimento, só onde pedido | florzinhas | "+" brancos |
| keyline branca | não | não | não |

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código nas mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

**Ficam no código para sempre:** o céu (degradê de sol, nublado e chuva), as gotas de chuva, os espirros das poças, a fumaça das rodas, as estrelinhas da tontura, as linhas de velocidade e o confete.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `karts.png` | 3 × 2 | 384 × 256 | 1152 × 512 | sim | o kart da Kika **sem rodas**, de lado e virado para a direita, em 5 expressões, e o kart do rival |
| `equipe.png` | 4 × 2 | 320 × 400 | 1280 × 800 | sim | o Tio Beto (chefe da equipe) e os dois mecânicos |
| `pecas.png` | 4 × 3 | 256 | 1024 × 768 | sim | pneus, carrinhos de pneus (os botões), fardo de feno, nuvens, sol e poça |
| `autodromo.png` | — | — | 1280 × 520 | sim (céu) | a faixa que se repete: arquibancada, mureta, pista e grama |
| `box.png` | — | — | 800 × 400 | sim | o prédio do box da equipe, atrás da pista |
| `cover-pit-stop-da-chuva.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** "SE", "SENÃO", "CHUVA", "LISO", números de kart e patrocínios são do código ou não existem. A única exceção é o título da capa.
- **Os três pneus são diferentes de longe, pela faixa colorida da lateral:** liso = faixa **vermelha** e banda lisa; chuva = faixa **azul** e sulcos fundos; intermediário = faixa **verde** e sulcos rasos. A faixa é o que liga o carrinho ao desenho da regra.
- **Nenhum carrinho brilha mais que o outro:** a cor do certo não pode entregar a resposta.
- **O kart vem SEM RODAS**, com os dois arcos das rodas vazios. É o código que põe o pneu escolhido.
- Tudo de lado, sem perspectiva: a câmera vê a pista de frente, como num jogo de plataforma.
- Peça solta e centrada na célula, com cerca de 8 % de margem. **Personagens pisam no fundo da célula.**
- **Gente com cara de criança e de adulto de verdade, não chibi.** A Kika e os mecânicos têm uns 10 anos e são menores e mais redondinhos que o Tio Beto.

---

## 3. `karts.png` — 3 × 2 células de 384 × 256 (1152 × 512), alfa

A pilota é a **Kika**, uma menina de uns 10 anos de pele morena e cabelo preto cacheado preso num rabo alto que sai por trás do capacete. Usa capacete **verde-água** com a viseira levantada (o rosto aparece), macacão de corrida verde-água e amarelo e um cachecolzinho amarelo. O kart é baixinho, verde-água com faixas amarelas, visto **exatamente de lado, virado para a DIREITA**.

**Em todas as células o kart tem o mesmo tamanho, na mesma posição**, com a base do chassi na mesma altura: o código põe as rodas sempre no mesmo lugar.

| Célula | Conteúdo |
|---|---|
| 0 | Kika parada, sorrindo, as duas mãos no volante |
| 1 | Kika correndo: inclinada para a frente, cachecol e rabo de cavalo voando para trás |
| 2 | Kika comemorando: um punho no ar, boca aberta de alegria |
| 3 | Kika tonta: olhos em espiral, língua de fora, capacete torto |
| 4 | Kika preocupada: careta, gota de suor, as duas mãos firmes no volante |
| 5 | o **rival**: um menino de capacete lilás num kart lilás, correndo, inclinado para a frente |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: a trendy flat hand-drawn illustration, like a Korean fashion illustration; thin, clean lineart of even weight in a dark charcoal-brown, slightly hand-drawn, never thick and never pure black; 100% flat fill colors with almost no shading (at most a few simple flat darker shapes on clothing folds), no gradients, no glossy highlights; small, simple faces with tiny dot or short-line eyes, a small curved smile and soft pink blush ovals on the cheeks; slender, natural proportions with small heads (NOT chibi); a soft, muted palette (butter yellow, periwinkle and slate blue, sage green, cream, white, warm gray) with a few clear accents (coral red, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 384 x 256 (total 1152 x 512), read left to right, top row first. In every cell a low, chunky go-KART seen EXACTLY FROM THE SIDE, facing RIGHT, flat side view with no perspective, about 85% of the cell wide, centered, the same size and the same position in every cell, with the bottom of the chassis at the same height in every cell. IMPORTANT: the kart has NO WHEELS: the two round wheel arches (one at the back, one at the front) are EMPTY, the game draws the wheels. Cells 1 to 5 show the same mint-teal kart with yellow stripes driven by KIKA, a 10-year-old girl with brown skin, curly black hair in a high ponytail coming out of the back of her helmet, a mint-teal racing helmet with the visor raised so her face shows, a mint-teal and yellow racing suit and a small yellow scarf.
1. Kika stopped, smiling, both hands on the steering wheel.
2. Kika racing: leaning forward, scarf and ponytail flying backward.
3. Kika celebrating: one fist raised high, mouth open with joy.
4. Kika dizzy: spiral eyes, tongue out, helmet a little crooked.
5. Kika worried: a grimace, a sweat drop, both hands tight on the wheel.
6. The RIVAL: a boy of about 10 with a lilac helmet in a lilac kart with white stripes, racing, leaning forward.

DO NOT INCLUDE: wheels, tires, rims, the ground, a road, shadows on the ground, motion lines, dust, smoke, numbers, letters, text, sponsor logos, brand marks, real racing brands, 3/4 or top-down views, karts facing left, different kart sizes between cells, other characters, ghost duplicates, items crossing cell borders, items cut by the cell edge, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a blue plaid skirt; a young man in a blue plaid overshirt and white pants; a woman with a polka-dot neckerchief and a red shoulder bag; a young man in a blue-and-cream sweater), couples, holding hands, romantic poses, hearts, peace-sign gestures, plaid clothes, chibi proportions, big anime eyes with highlights, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 4. `equipe.png` — 4 × 2 células de 320 × 400 (1280 × 800), alfa

| Célula | Quem | Pose |
|---|---|---|
| 0 | **Tio Beto** | parado, de frente virado um pouco para a direita, segurando uma prancheta |
| 1 | Tio Beto | falando: uma mão aberta explicando, sorriso, prancheta na outra mão |
| 2 | Tio Beto | feliz, agitando no alto uma **bandeira quadriculada** preta e branca |
| 3 | Tio Beto | "ops": mão na testa, olhos fechados |
| 4 | **mecânica Lua** | parada, de frente |
| 5 | Lua | agachada, de lado, virada para a **DIREITA**, segurando uma parafusadeira apontada para a frente |
| 6 | **mecânico Davi** | parado, de frente |
| 7 | Davi | agachado, de lado, virado para a **ESQUERDA**, segurando uma parafusadeira apontada para a frente |

O Tio Beto é um senhor gordinho e simpático, de bigode grosso grisalho, boné verde-água da equipe e camisa polo verde-água e amarela. Os mecânicos são crianças de uns 10 anos de macacão verde-água: **Lua** tem cabelo ruivo curto e boné virado para trás; **Davi** tem pele escura e cabelo bem curtinho.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: a trendy flat hand-drawn illustration, like a Korean fashion illustration; thin, clean lineart of even weight in a dark charcoal-brown, slightly hand-drawn, never thick and never pure black; 100% flat fill colors with almost no shading (at most a few simple flat darker shapes on clothing folds), no gradients, no glossy highlights; small, simple faces with tiny dot or short-line eyes, a small curved smile and soft pink blush ovals on the cheeks; slender, natural proportions with small heads (NOT chibi); a soft, muted palette (butter yellow, periwinkle and slate blue, sage green, cream, white, warm gray) with a few clear accents (coral red, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 400 (total 1280 x 800), read left to right, top row first. STRICT CELL SEPARATION: each figure fits fully within the CENTRAL 80% WIDTH of its cell, with empty transparent space on both sides. The PIT CREW of a kids' kart racing team, all in mint-teal team clothes with yellow details. Natural proportions: the adult's head is about 1/6 of his height, the kids' heads about 1/5 of theirs. Every figure is complete, with the soles of the shoes touching the BOTTOM edge of the cell, one single fully opaque figure per cell.
1. UNCLE BETO, the team boss: a chubby, friendly older man with a thick gray mustache, a mint-teal team cap and a mint-teal and yellow polo shirt, standing, facing the viewer turned slightly to the right, holding a clipboard.
2. Uncle Beto talking: one open hand explaining, smiling, the clipboard in the other hand.
3. Uncle Beto very happy, waving a black-and-white CHECKERED FLAG high above his head.
4. Uncle Beto "oops": a hand on his forehead, eyes closed.
5. LUA, a 10-year-old girl mechanic: short ginger hair, a backwards mint-teal cap, mint-teal overalls, standing, facing the viewer.
6. Lua crouching, seen from the SIDE facing RIGHT, holding a chunky yellow power wrench pointed forward.
7. DAVI, a 10-year-old boy mechanic: dark skin, very short hair, mint-teal overalls, standing, facing the viewer.
8. Davi crouching, seen from the SIDE facing LEFT, holding a chunky yellow power wrench pointed forward.

DO NOT INCLUDE: karts, wheels, tires, tools other than the clipboard, the flag and the power wrenches, ground, shadows on the ground, backgrounds, text, letters, numbers, logos, sponsor marks, different outfits or faces for the same person, ghost duplicates, items crossing cell borders, items cut by the cell edge, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a blue plaid skirt; a young man in a blue plaid overshirt and white pants; a woman with a polka-dot neckerchief and a red shoulder bag; a young man in a blue-and-cream sweater), couples, holding hands, romantic poses, hearts, peace-sign gestures, plaid clothes, fashion poses, chibi proportions, big anime eyes with highlights, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 5. `pecas.png` — 4 × 3 células de 256 (1024 × 768), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **pneu LISO**, de lado: banda lisa, **faixa vermelha** na lateral, aro prateado | roda do kart e regra |
| 1 | **pneu de CHUVA**, de lado: sulcos fundos aparecendo na borda, **faixa azul** na lateral, aro prateado | roda do kart e regra |
| 2 | **pneu INTERMEDIÁRIO** (N3), de lado: sulcos rasos, **faixa verde**, aro prateado | N3 |
| 3 | **pneu de chuva murcho**: o mesmo pneu de faixa azul, achatado embaixo e mole | o erro do pneu de chuva no seco |
| 4 | **carrinho com 2 pneus LISOS** em pé (faixa vermelha) | botão da direita |
| 5 | **carrinho com 2 pneus de CHUVA** em pé (faixa azul) | botão da esquerda |
| 6 | **carrinho com 2 pneus INTERMEDIÁRIOS** (faixa verde) | N3 |
| 7 | **fardo de feno** redondo, de lado | onde o kart para quando aquaplana |
| 8 | **nuvem de chuva**: cinza-escura, com três gotas azuis caindo | céu de chuva e ícone da regra |
| 9 | **nuvem cinza** fofa, sem gotas | céu nublado |
| 10 | **sol** amarelo com raios, sem rosto | céu de sol |
| 11 | **poça d'água** achatada, vista de lado na pista (uma elipse azul brilhante, bem larga e fina) | pista molhada |

Os três carrinhos (4, 5, 6) são **o mesmo carrinho**, do mesmo tamanho e na mesma posição: só muda o pneu.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: a trendy flat hand-drawn illustration, like a Korean fashion illustration; thin, clean lineart of even weight in a dark charcoal-brown, slightly hand-drawn, never thick and never pure black; 100% flat fill colors with almost no shading (at most a few simple flat darker shapes), no gradients, no glossy highlights; a soft, muted palette (butter yellow, periwinkle and slate blue, sage green, cream, white, warm gray) with a few clear accents (coral red, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 3 rows, each cell 256 x 256 (total 1024 x 768), read left to right, top row first. Simple, chunky pieces for a kids' go-kart racing game, each centered with about 8% margin, flat side view, no ground, no shadow. The three tire types must be easy to tell apart by the COLORED STRIPE on the sidewall.
1. A SLICK kart TIRE seen exactly from the side: a black tire with a perfectly smooth tread, a bright RED stripe ring on the sidewall, a silver rim in the middle.
2. A RAIN kart TIRE seen exactly from the side: a black tire with deep chunky grooves visible all around the edge, a bright BLUE stripe ring on the sidewall, a silver rim.
3. An INTERMEDIATE kart TIRE seen exactly from the side: a black tire with shallow small grooves around the edge, a bright GREEN stripe ring on the sidewall, a silver rim.
4. The same RAIN tire (blue stripe) but FLAT and squashed at the bottom, soft and saggy.
5. A small red-and-gray pit-lane TIRE CART on two little wheels, carrying TWO SLICK tires standing upright side by side (red stripes).
6. The SAME tire cart, same size and position, carrying TWO RAIN tires (blue stripes, deep grooves).
7. The SAME tire cart, same size and position, carrying TWO INTERMEDIATE tires (green stripes).
8. A round golden HAY BALE seen from the side.
9. A RAIN CLOUD: a puffy dark gray cloud with three blue rain drops falling below it.
10. A puffy light GRAY CLOUD with no drops.
11. A bright yellow SUN with short rounded rays, no face.
12. A flat shiny blue WATER PUDDLE seen from the side on a road: a very wide, very thin ellipse with a white shine.

DO NOT INCLUDE: karts, cars, people, hands, faces or eyes on any object, text, letters, numbers, brand names on tires, logos, rainbows, lightning, sparkles, hearts, the ground, shadows, backgrounds, items crossing cell borders, items cut by the cell edge, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a blue plaid skirt; a young man in a blue plaid overshirt and white pants; a woman with a polka-dot neckerchief and a red shoulder bag; a young man in a blue-and-cream sweater), plaid patterns, polka dots, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 6. `autodromo.png` — 1280 × 520, alfa só no céu

A faixa do autódromo, **de frente e sem perspectiva**, que se repete na horizontal: a borda da esquerda tem de **emendar** com a da direita (tileable). O alto é **transparente** (o código pinta o céu atrás) e a faixa entra na tela em y 200.

| Faixa (y) | O que tem |
|---|---|
| 0–60 | transparente, acima do telhado da arquibancada |
| 60–260 | **arquibancada** com cobertura e uma torcida pequenininha e colorida (cabecinhas, bandeirinhas, mãos para cima) |
| 260–300 | **mureta** de concreto clara, com painéis lisos (sem letra nenhuma) |
| 300–450 | **pista** de asfalto cinza-escuro, com zebra vermelha e branca na borda de cima e na de baixo |
| 450–520 | **grama** verde |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: a trendy flat hand-drawn illustration, like a Korean fashion illustration; thin, clean lineart of even weight in a dark charcoal-brown, slightly hand-drawn, never thick and never pure black; 100% flat fill colors with almost no shading, no gradients, no glossy highlights; tiny, simple people with dot eyes; a soft, muted palette (butter yellow, periwinkle and slate blue, sage green, cream, white, warm gray) with a few clear accents (coral red, royal blue), like the calm sage bushes and warm gray ground of the reference. Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A horizontal background STRIP for a side-view kids' kart racing game, 1280 x 520, SEAMLESS: the left edge must tile perfectly with the right edge. Flat front view with NO perspective, like a 2D platformer. The top part (above the grandstand roof, about the top 60 pixels) is fully TRANSPARENT: the game paints the sky behind it. From top to bottom: (1) a long covered GRANDSTAND full of a tiny, cheerful, colorful crowd (little heads, raised hands, small plain flags), about 200 pixels tall; (2) a light concrete PIT WALL with plain panels, about 40 pixels tall; (3) the RACE TRACK: a wide dark gray asphalt band about 150 pixels tall, with red-and-white KERBS along its top and bottom edges and a faint dashed center line; (4) a band of soft green GRASS at the bottom, about 70 pixels tall. Calm, readable, not too busy, so the karts in front stand out.

DO NOT INCLUDE: the sky, clouds, sun, karts, cars, characters in front of the wall, a pit garage, text, letters, numbers, sponsor logos, ad boards with words, brand marks, perspective, vanishing points, curves in the track, trees in front of the track, night, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a blue plaid skirt; a young man in a blue plaid overshirt and white pants; a woman with a polka-dot neckerchief and a red shoulder bag; a young man in a blue-and-cream sweater), couples, hearts, sparkles, plaid patterns, cel shading, gradients, glossy highlights, thick outlines, NO white sticker keyline here, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 7. `box.png` — 800 × 400, alfa

O **box da equipe**: o prédio da garagem, de frente, que fica atrás da pista no lugar onde a Kika para. A base é reta e encosta no fundo da imagem (ela pousa na mureta).

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: a trendy flat hand-drawn illustration, like a Korean fashion illustration; thin, clean lineart of even weight in a dark charcoal-brown, slightly hand-drawn, never thick and never pure black; 100% flat fill colors with almost no shading (at most a few simple flat darker shapes), no gradients, no glossy highlights; a soft, muted palette (butter yellow, periwinkle and slate blue, sage green, cream, white, warm gray) with a few clear accents (coral red, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A single object on a fully TRANSPARENT background, 800 x 400: the front of a kids' racing team PIT GARAGE, seen straight from the front with no perspective. A wide, OPEN garage door shows a cozy, tidy inside: a tool wall, a few stacked kart tires and a warm hanging light. Above the door, a mint-teal and yellow striped AWNING, and two small plain mint-teal team pennants. The bottom edge of the building is straight and touches the bottom of the image.

DO NOT INCLUDE: karts, people, characters, the race track, the ground, the sky, text, letters, numbers, logos, sponsor marks, team names, perspective, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a blue plaid skirt; a young man in a blue plaid overshirt and white pants; a woman with a polka-dot neckerchief and a red shoulder bag; a young man in a blue-and-cream sweater), hearts, sparkles, plaid patterns, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 8. `cover-pit-stop-da-chuva.png` — 1672 × 941, opaco, com o título

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: a trendy flat hand-drawn illustration, like a Korean fashion illustration; thin, clean lineart of even weight in a dark charcoal-brown, slightly hand-drawn, never thick and never pure black; 100% flat fill colors with almost no shading (at most a few simple flat darker shapes on clothing folds), no gradients, no glossy highlights; small, simple faces with tiny dot or short-line eyes, a small curved smile and soft pink blush ovals on the cheeks; slender, natural proportions with small heads (NOT chibi); a soft, muted palette (butter yellow, periwinkle and slate blue, sage green, cream, white, warm gray) with a few clear accents (coral red, royal blue); a few small 4-point sparkles are welcome. Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A cover illustration for a children's game, 16:9 (1672 x 941), opaque. At the TOP, a big, bold, friendly title lettering that reads exactly "Pit Stop da Chuva" (Portuguese), in chunky rounded letters, white with a mint-teal outline. Below: a kart race on a rainy day, side view. In front of a mint-teal and yellow pit garage, two kid mechanics of about 10 in mint-teal overalls change the tires of a mint-teal kart with power wrenches, while the driver KIKA (a 10-year-old girl with brown skin, a curly black ponytail, a mint-teal helmet with the visor up and a yellow scarf) gives a big smile. A chubby mustached team boss in a mint-teal cap holds a clipboard. Half of the sky is sunny and half has a gray rain cloud with falling drops; water splashes from a puddle on the track. A lilac rival kart races by in the background. Bright, playful, energetic mood.

DO NOT INCLUDE: any text other than the title "Pit Stop da Chuva", misspelled title, extra titles, numbers on karts, sponsor logos, real racing brands, car crashes, fire, scary elements, lightning, night, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a blue plaid skirt; a young man in a blue plaid overshirt and white pants; a woman with a polka-dot neckerchief and a red shoulder bag; a young man in a blue-and-cream sweater), couples, holding hands, romantic poses, hearts, peace-sign gestures, plaid clothes, chibi proportions, big anime eyes with highlights, cel shading, gradients, glossy highlights, thick outlines, NO white sticker keyline here, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 9. Quando a arte chegar

- Medir cada folha por colunas antes de medir por célula (objeto que vaza para a vizinha pede reempacotar) e zerar a franja de alfa baixo.
- **Karts:** medir o centro dos dois arcos das rodas, a altura do eixo e a base do chassi (em fração da célula), e ajustar `KART.rearFX`, `KART.frontFX`, `KART.axleFY`, `KART.wheelFR` e `KART.bottomFY` em `data/layout.ts`. Os arcos têm de estar no mesmo lugar nas 6 células, porque a folha é cortada pela grade, sem medir o alfa.
- **Equipe:** com proporção esguia, a cabeça fica mais alta na figura. Conferir `betoHead()` em `scenes/crew.ts` (0,62 da altura), que é de onde sai o balão do Tio Beto.
- **Autódromo:** conferir onde ficaram a mureta e a pista e ajustar `GROUND`, `RIVAL.ground`, `LAP.puddleY` e `LAP.hayY`. Se a emenda não fechar, espelhar a metade da direita.
- **Box:** conferir a base e a porta, e ajustar `BOX` e `CREW.idleFeet` (os mecânicos esperam na porta).
- **Capa:** ligar no `catalog.ts` e gerar o `public/og/pit-stop-da-chuva.jpg` (1200 × 630).
- Registrar medidas e limpezas no `MANIFEST.md` da pasta de assets.
