# Pit Stop da Chuva — texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 o laço, §5 a tela, §6 os níveis, §8 os erros).

Destino: `src/assets/games/EF05CO04/pit-stop-da-chuva/`

## A linha de arte: moda chapada

São as duas imagens que o usuário mandou (15/10 e de novo em 20/10/2026). **Anexe as duas em toda geração:**
- `references/40-moda-chapada-a.png`: o casal no parque, sobre fundo bege. Ela de cabelo escuro ondulado, laço vermelho, casaquinho amarelo e saia xadrez lavanda; ele de camisa xadrez lavanda e calça branca. Atrás, arbustos sálvia e o chão cinza quente.
- `references/41-moda-chapada-b.png`: o casal de mãos dadas sobre fundo azul-água. Ela de camisa ardósia, lenço azul de bolinhas, calça sálvia clara e bolsa coral; ele de suéter creme com painel azul-royal e calça verde-oliva. Em volta, um coração, nuvens brancas e brilhinhos de 4 pontas.

**O que define o estilo (é o que os prompts descrevem):**

| Traço | Como é nas referências |
|---|---|
| contorno | **fino, uniforme, marrom-carvão**, com jeito de feito à mão: às vezes a linha não fecha, e alguns tracinhos soltos marcam dobra ou movimento |
| cor | **chapada**, sem degradê e sem brilho |
| sombra | **manchas chapadas** um tom mais escuro, de borda irregular, só nas dobras (como as manchas na calça verde da ref. 41) |
| cabelo | um bloco de cor só, com 2 ou 3 linhas finas de mecha |
| rosto | pequeno: **olhos de pontinho** ou arquinho, nariz de um traço, sorriso curto e **oval rosa** na bochecha |
| proporção | **esguia, não chibi**: cabeça ≈ 1/7 da altura no adulto e ≈ 1/5,5 na criança, pernas longas e tênis brancos robustos |
| paleta | pastel apagado (sálvia, ardósia, lavanda, amarelo-manteiga, creme, verde-oliva, cinza quente, azul-água) com acentos pontuais (coral, azul-royal, vermelho do laço) |
| enfeite | **brilhinho branco de 4 pontas**, nuvem branca chapada e tracinho de movimento, só onde o prompt pedir |
| keyline branca | não |

**Regras dos prompts:**
- Todo bloco STYLE começa mandando usar as imagens anexadas e termina em *"Take ONLY the art style"*.
- O elenco das referências vai no negativo de todos os prompts: o casal, as roupas, o coração, a pose de "paz e amor" e o xadrez.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

**O jogo já roda sem nenhum PNG.** A arte de reserva em `scenes/fallback.ts` desenha as mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

**Ficam no código para sempre:**
- o céu (degradê de sol, nublado e chuva), as gotas de chuva e os respingos de água e de barro;
- a fumaça, as estrelinhas da tontura, as linhas de velocidade, o vento da rajada e o confete;
- o retângulo de parada, a linha de chegada com o pórtico e as placas dos botões (o desenho dentro de cada botão vem de `controles.png`).

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `karts.png` | 4 × 2 | 384 × 256 | 1536 × 512 | sim | o kart **sem rodas**: a Kika em 5 caras, os 2 rivais e o kart vazio |
| `motos.png` | 4 × 2 | 384 × 256 | 1536 × 512 | sim | a moto **sem rodas**, na mesma ordem (pista estreita do N2 e do N3) |
| `equipe.png` | 4 × 2 | 320 × 400 | 1280 × 800 | sim | o Tio Beto e os dois mecânicos |
| `pecas.png` | 6 × 3 | 256 × 256 | 1536 × 768 | sim | pneus, carrinhos de pneu, fardo, nuvens, sol, poças e bandeira |
| `controles.png` | 3 × 1 | 256 × 256 | 768 × 256 | sim | os desenhos dos botões: acelerador, freio e chave com pneu |
| `autodromo.png` | — | — | 1280 × 520 | sim (céu) | a faixa que se repete: arquibancada, faixa do box, pista e grama |
| `lama.png` | — | — | 1280 × 204 | não | a faixa do box e a pista **de terra**, nos trechos de lama (N2) |
| `trilha.png` | — | — | 1280 × 204 | não | a faixa do box e a **pista estreita**: uma trilha de terra entre pedras e arbustos, onde só a moto passa (N2 e N3) |
| `trilha-pecas.png` | 2 × 1 | 256 × 256 | 512 × 256 | sim | a placa de "pista estreita" e o cone |
| `tenda.png` | — | — | 600 × 360 | sim | a tenda da equipe, onde a Kika para |
| `mao.png` | — | — | 256 × 256 | sim | a mãozinha da demonstração |
| `cover-pit-stop-da-chuva.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada folha na carga. O que não pode mudar é a grade, a ordem, o conteúdo e a **direção** de cada peça.

## 2. Regras deste jogo

- **Nenhum texto na arte.** "SE", "SENÃO", os nomes dos pneus, números de kart e patrocínios são do código ou não existem. A única exceção é o título da capa.
- **Os pneus se distinguem de longe pela faixa colorida da lateral**, e é ela que liga o carrinho ao desenho da regra:

  | Pneu | Faixa | Banda |
  |---|---|---|
  | LISO | **vermelha** | lisa |
  | CHUVA | **azul** | sulcos fundos |
  | CRAVOS | **verde** | blocos grandes e separados |

  Os **pneus de moto** têm a mesma faixa do pneu de carro equivalente, mas são **altos e finos**: borracha estreita, aro grande e raios.
- **Nenhum carrinho brilha mais que o outro:** a cor do certo não pode entregar a resposta.
- **Os veículos vêm SEM RODAS**, com os arcos das rodas vazios. É o código que põe o pneu escolhido.
- Tudo é visto **exatamente de lado**, sem perspectiva, como num jogo de plataforma: a câmera vê a pista de frente.
- Cada peça fica solta e centrada na célula, com cerca de 8 % de margem. **Personagens pisam no fundo da célula.**
- **Gente com cara de criança e de adulto de verdade, não chibi.** A Kika, os rivais e os mecânicos têm uns 10 anos e são menores e mais redondinhos que o Tio Beto.

---

## 3. `karts.png` — 4 × 2 células de 384 × 256 (1536 × 512), alfa

A pilota é a **Kika**: uma menina de uns 10 anos, de pele morena e cabelo preto cacheado preso num rabo alto que sai por trás do capacete. Ela usa:
- capacete **verde-menta** com a viseira levantada (o rosto aparece);
- macacão de corrida verde-menta e amarelo-manteiga;
- um cachecolzinho amarelo.

O kart é baixinho, verde-menta com faixas amarelas, visto **exatamente de lado e virado para a DIREITA**.

**Em todas as células o kart tem o mesmo tamanho e a mesma posição**, com os dois arcos das rodas no mesmo lugar: o código põe as rodas sempre ali.

| Célula | Conteúdo |
|---|---|
| 0 | Kika parada, sorrindo, as duas mãos no volante |
| 1 | Kika correndo: inclinada para a frente, cachecol e rabo de cavalo voando para trás |
| 2 | Kika comemorando: um punho no ar, boca aberta de alegria |
| 3 | Kika tonta: olhos em espiral, língua de fora, capacete torto |
| 4 | Kika preocupada: careta, gota de suor, as duas mãos firmes no volante |
| 5 | **rival lilás**: um menino de capacete e kart lilás com faixas brancas, inclinado para a frente |
| 6 | **rival coral**: uma menina de rabo de cavalo castanho, capacete e kart coral com faixas creme, inclinada para a frente |
| 7 | o **kart da Kika vazio**, sem ninguém (é também o desenho de "carro" na bandeja do N3) |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick), with lines that sometimes do not fully close and a few tiny loose strokes for folds or motion; 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches on folds; hair as one flat color mass with two or three thin strand lines; small simple faces with tiny dot or short-arc eyes, a one-stroke nose, a short curved smile and soft pink oval blush; slender natural proportions with small heads (NOT chibi); a muted pastel palette (sage, slate and lavender blue, butter yellow, cream, olive green, warm gray, pale aqua) with a few clear accents (coral, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 384 x 256 (total 1536 x 512), read left to right, top row first. In every cell a low, chunky go-KART seen EXACTLY FROM THE SIDE, facing RIGHT, flat side view with no perspective, about 85% of the cell wide, centered, the same size and the same position in every cell, with the bottom of the chassis at the same height in every cell. IMPORTANT: the kart has NO WHEELS: the two round wheel arches (one at the back, one at the front) are EMPTY, the game draws the wheels. Cells 1 to 5 show the same mint-green kart with butter-yellow stripes driven by KIKA, a 10-year-old girl with brown skin, curly black hair in a high ponytail coming out of the back of her helmet, a mint-green racing helmet with the visor raised so her face shows, a mint and butter-yellow racing suit and a small yellow scarf.
1. Kika stopped, smiling, both hands on the steering wheel.
2. Kika racing: leaning forward, scarf and ponytail flying backward, two tiny motion strokes behind her.
3. Kika celebrating: one fist raised high, mouth open with joy.
4. Kika dizzy: spiral eyes, tongue out, helmet a little crooked.
5. Kika worried: a grimace, a sweat drop, both hands tight on the wheel.
6. RIVAL ONE: a 10-year-old boy in a lavender helmet and suit, in the same kart shape painted lavender with white stripes, racing, leaning forward.
7. RIVAL TWO: a 10-year-old girl with a brown ponytail, a coral helmet and suit, in the same kart shape painted coral with cream stripes, racing, leaning forward.
8. Kika's mint-green kart EMPTY, with nobody in it.

DO NOT INCLUDE: wheels, tires, rims, the ground, a road, shadows on the ground, smoke, dust, numbers, letters, text, sponsor logos, brand marks, real racing brands, 3/4 or top-down views, karts facing left, different kart sizes between cells, ghost duplicates, items crossing cell borders, items cut by the cell edge, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a lavender plaid skirt; a young man in a lavender plaid overshirt and white pants; a woman with a blue polka-dot neckerchief and a coral shoulder bag; a young man in a cream sweater with a royal-blue panel), couples, holding hands, romantic poses, hearts, peace-sign gestures, plaid clothes, chibi proportions, big anime eyes with highlights, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 4. `motos.png` — 4 × 2 células de 384 × 256 (1536 × 512), alfa

É a **mesma ordem e as mesmas pessoas** de `karts.png`, mas numa **moto de corrida infantil** (uma pit bike baixinha, de trilha leve), vista **de lado e virada para a DIREITA**. As duas rodas são **grandes e altas**, com os espaços **vazios**:
- o centro da roda de trás fica em ~21 % da largura e o da roda da frente em ~80 %;
- os eixos ficam a ~75 % da altura, e as rodas descem até ~96 %.

O piloto vai sentado, com as mãos no guidão e um pé na pedaleira. O garfo da frente desce até o eixo vazio.

| Célula | Conteúdo |
|---|---|
| 0–4 | Kika na moto verde-menta: parada, correndo, comemorando, tonta e preocupada (as mesmas caras do kart) |
| 5 | rival lilás na moto lilás |
| 6 | rival coral na moto coral |
| 7 | a **moto da Kika vazia** (é também o desenho de "moto" na regra e na bandeja) |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick), with lines that sometimes do not fully close and a few tiny loose strokes for folds or motion; 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches on folds; hair as one flat color mass with two or three thin strand lines; small simple faces with tiny dot or short-arc eyes, a one-stroke nose, a short curved smile and soft pink oval blush; slender natural proportions with small heads (NOT chibi); a muted pastel palette (sage, slate and lavender blue, butter yellow, cream, olive green, warm gray, pale aqua) with a few clear accents (coral, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 384 x 256 (total 1536 x 512), read left to right, top row first. In every cell a small kids' racing MOTORBIKE (a low pit bike) seen EXACTLY FROM THE SIDE, facing RIGHT, flat side view with no perspective, about 85% of the cell wide, centered, the same size and the same position in every cell. IMPORTANT: the motorbike has NO WHEELS: the two large round wheel spaces are EMPTY (rear wheel center at about 21% of the cell width, front wheel center at about 80%, both axles at about 75% of the cell height, wheels reaching about 96% of the height); the front fork goes down to the empty front axle. The rider sits on the seat, hands on the handlebar, one foot on the footpeg. Cells 1 to 5: the mint-green bike with butter-yellow stripes ridden by KIKA, a 10-year-old girl with brown skin, curly black hair in a high ponytail coming out of the back of her helmet, a mint-green helmet with the visor raised, a mint and butter-yellow racing suit and a small yellow scarf.
1. Kika stopped, smiling.
2. Kika racing: leaning forward, scarf and ponytail flying backward, two tiny motion strokes behind her.
3. Kika celebrating: one fist raised high, mouth open with joy.
4. Kika dizzy: spiral eyes, tongue out, helmet a little crooked.
5. Kika worried: a grimace, a sweat drop, both hands tight on the handlebar.
6. RIVAL ONE: a 10-year-old boy in a lavender helmet and suit on the same bike shape painted lavender with white stripes, racing, leaning forward.
7. RIVAL TWO: a 10-year-old girl with a brown ponytail, a coral helmet and suit, on the same bike shape painted coral with cream stripes, racing, leaning forward.
8. Kika's mint-green motorbike EMPTY, with nobody on it.

DO NOT INCLUDE: wheels, tires, rims, spokes, the ground, a road, shadows on the ground, smoke, dust, a kickstand, numbers, letters, text, sponsor logos, brand marks, real motorcycle brands, 3/4 or top-down views, bikes facing left, different bike sizes between cells, ghost duplicates, items crossing cell borders, items cut by the cell edge, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a lavender plaid skirt; a young man in a lavender plaid overshirt and white pants; a woman with a blue polka-dot neckerchief and a coral shoulder bag; a young man in a cream sweater with a royal-blue panel), couples, holding hands, romantic poses, hearts, peace-sign gestures, plaid clothes, chibi proportions, big anime eyes with highlights, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 5. `equipe.png` — 4 × 2 células de 320 × 400 (1280 × 800), alfa

| Célula | Quem | Pose |
|---|---|---|
| 0 | **Tio Beto** | parado, de frente e virado um pouco para a direita, segurando uma prancheta |
| 1 | Tio Beto | acenando com uma mão aberta, sorrindo, com a prancheta na outra mão |
| 2 | Tio Beto | feliz, agitando no alto uma **bandeira quadriculada** preta e branca |
| 3 | Tio Beto | "ops": mão na testa, olhos fechados |
| 4 | **mecânica Lua** | parada, de frente |
| 5 | Lua | agachada, de lado, virada para a **DIREITA**, segurando uma parafusadeira apontada para a frente |
| 6 | **mecânico Davi** | parado, de frente |
| 7 | Davi | agachado, de lado, virado para a **ESQUERDA**, segurando uma parafusadeira apontada para a frente |

- **O Tio Beto** é um senhor gordinho e simpático, de bigode grosso grisalho, boné verde-menta da equipe e camisa polo verde-menta e amarela.
- **Os mecânicos** são crianças de uns 10 anos de macacão verde-menta:
  - **Lua** tem cabelo ruivo curto e boné virado para trás;
  - **Davi** tem pele escura e cabelo bem curtinho.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick), with lines that sometimes do not fully close and a few tiny loose strokes for folds or motion; 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches on clothing folds; hair as one flat color mass with two or three thin strand lines; small simple faces with tiny dot or short-arc eyes, a one-stroke nose, a short curved smile and soft pink oval blush; slender natural proportions with small heads (NOT chibi) and chunky white sneakers; a muted pastel palette (sage, slate and lavender blue, butter yellow, cream, olive green, warm gray, pale aqua) with a few clear accents (coral, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 400 (total 1280 x 800), read left to right, top row first. STRICT CELL SEPARATION: each figure fits fully within the CENTRAL 80% WIDTH of its cell, with empty transparent space on both sides. The PIT CREW of a kids' racing team, all in mint-green team clothes with butter-yellow details. Natural proportions: the adult's head is about 1/7 of his height, the kids' heads about 1/5.5 of theirs. Every figure is complete, with the soles of the shoes touching the BOTTOM edge of the cell, one single fully opaque figure per cell.
1. UNCLE BETO, the team boss: a chubby, friendly older man with a thick gray mustache, a mint-green team cap and a mint and butter-yellow polo shirt, standing, facing the viewer turned slightly to the right, holding a clipboard.
2. Uncle Beto waving one open hand, smiling, the clipboard in the other hand.
3. Uncle Beto very happy, waving a black-and-white CHECKERED FLAG high above his head.
4. Uncle Beto "oops": a hand on his forehead, eyes closed.
5. LUA, a 10-year-old girl mechanic: short ginger hair, a backwards mint-green cap, mint-green overalls, standing, facing the viewer.
6. Lua crouching, seen from the SIDE facing RIGHT, holding a chunky yellow power wrench pointed forward.
7. DAVI, a 10-year-old boy mechanic: dark skin, very short hair, mint-green overalls, standing, facing the viewer.
8. Davi crouching, seen from the SIDE facing LEFT, holding a chunky yellow power wrench pointed forward.

DO NOT INCLUDE: karts, motorbikes, wheels, tires, tools other than the clipboard, the flag and the power wrenches, ground, shadows on the ground, backgrounds, text, letters, numbers, logos, sponsor marks, different outfits or faces for the same person, ghost duplicates, items crossing cell borders, items cut by the cell edge, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a lavender plaid skirt; a young man in a lavender plaid overshirt and white pants; a woman with a blue polka-dot neckerchief and a coral shoulder bag; a young man in a cream sweater with a royal-blue panel), couples, holding hands, romantic poses, hearts, peace-sign gestures, plaid clothes, fashion poses, chibi proportions, big anime eyes with highlights, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 6. `pecas.png` — 6 × 3 células de 256 (1536 × 768), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **pneu LISO** de carro, de lado: banda lisa, **faixa vermelha**, aro prateado | roda do kart e regra |
| 1 | **pneu de CHUVA** de carro: sulcos fundos na borda, **faixa azul** | roda do kart e regra |
| 2 | **pneu de CRAVOS** de carro: blocos grandes e separados, **faixa verde** | N2 |
| 3 | o pneu de chuva **murcho**: achatado embaixo e mole | o erro do pneu de chuva no seco |
| 4 | **pneu LISO de moto**: alto e fino, aro grande com raios, **faixa vermelha** | N3 |
| 5 | **pneu de CHUVA de moto**: alto e fino, sulcos rasos, raios, **faixa azul** | N3 |
| 6 | carrinho com 2 pneus LISOS de carro em pé | botão |
| 7 | o mesmo carrinho com 2 pneus de CHUVA de carro | botão |
| 8 | o mesmo carrinho com 2 pneus de CRAVOS | botão (N2) |
| 9 | o mesmo carrinho com 2 pneus LISOS de moto | botão (N3) |
| 10 | o mesmo carrinho com 2 pneus de CHUVA de moto | botão (N3) |
| 11 | **fardo de feno** redondo, de lado | onde o carro para quando aquaplana |
| 12 | **nuvem de chuva** cinza-escura com três gotas azuis caindo | céu e ícone da regra |
| 13 | **nuvem cinza** fofa, sem gotas | céu nublado |
| 14 | **sol** amarelo com raios curtos, sem rosto | céu de sol |
| 15 | **poça d'água**: elipse azul bem larga e fina, com um brilho branco | pista molhada |
| 16 | **poça de lama**: mancha marrom de borda ondulada, com três respingos | ícone "lama" da regra |
| 17 | **bandeira quadriculada** num mastro | mapa da corrida |

Os cinco carrinhos (6 a 10) são **o mesmo carrinho**, do mesmo tamanho e na mesma posição: só mudam os pneus.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches; a muted pastel palette (sage, slate and lavender blue, butter yellow, cream, olive green, warm gray, pale aqua) with a few clear accents (coral, royal blue); white flat clouds like the reference. Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A game sprite sheet on a fully TRANSPARENT background: a grid of 6 columns x 3 rows, each cell 256 x 256 (total 1536 x 768), read left to right, top row first. Simple, chunky pieces for a kids' racing game, each centered with about 8% margin, flat side view, no ground, no shadow. The tire types must be easy to tell apart by the COLORED STRIPE ring on the sidewall: RED = slick, BLUE = rain, GREEN = knobby.
1. A SLICK kart TIRE seen exactly from the side: a black tire with a perfectly smooth tread, a RED stripe ring on the sidewall, a silver rim.
2. A RAIN kart TIRE: a black tire with deep grooves all around the edge, a BLUE stripe ring, a silver rim.
3. A KNOBBY mud kart TIRE: a black tire with big, chunky, widely spaced blocks around the edge, a GREEN stripe ring, a silver rim.
4. The same RAIN kart tire (blue stripe) but FLAT and squashed at the bottom, soft and saggy.
5. A SLICK MOTORBIKE TIRE: tall and thin, a narrow smooth black rubber ring, a big silver rim with thin spokes, a thin RED stripe.
6. A RAIN MOTORBIKE TIRE: the same tall thin shape with small grooves around the edge, spokes, a thin BLUE stripe.
7. A small coral-and-gray pit-lane TIRE CART on two little wheels, carrying TWO SLICK kart tires standing upright side by side.
8. The SAME tire cart, same size and position, carrying TWO RAIN kart tires.
9. The SAME tire cart, same size and position, carrying TWO KNOBBY kart tires.
10. The SAME tire cart, same size and position, carrying TWO SLICK motorbike tires.
11. The SAME tire cart, same size and position, carrying TWO RAIN motorbike tires.
12. A round golden HAY BALE seen from the side.
13. A RAIN CLOUD: a puffy dark gray cloud with three blue rain drops falling below it.
14. A puffy light GRAY CLOUD with no drops.
15. A butter-yellow SUN with short rounded rays, no face.
16. A flat shiny blue WATER PUDDLE seen from the side: a very wide, very thin ellipse with a white shine.
17. A MUD PUDDLE: a brown splat with a wavy edge, a darker center and three small mud drops flying up.
18. A black-and-white CHECKERED FLAG on a short pole.

DO NOT INCLUDE: karts, cars, motorbikes, people, hands, faces or eyes on any object, text, letters, numbers, brand names on tires, logos, rainbows, lightning, sparkles, hearts, the ground, shadows, backgrounds, items crossing cell borders, items cut by the cell edge, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a lavender plaid skirt; a young man in a lavender plaid overshirt and white pants; a woman with a blue polka-dot neckerchief and a coral shoulder bag; a young man in a cream sweater with a royal-blue panel), plaid patterns, polka dots, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 6b. `pneus.png` — 6 × 1 células de 256 (1536 × 256), alfa

As rodas que **giram** no veículo (20/10/2026). Os pneus 0–5 do §6 vieram em 3/4, com a banda de rodagem à mostra de um lado: no arco do kart, que é de perfil, a roda não encaixa, e ao girar a banda dá voltas em torno do aro. Aqui eles vêm em **perfil puro**: um círculo perfeito, aro no centro exato, nenhuma espessura à vista. Os do §6 continuam nos carrinhos e na regra.

| Célula | Peça |
|---|---|
| 0 | pneu LISO de carro, faixa vermelha |
| 1 | pneu de CHUVA de carro, faixa azul |
| 2 | pneu de CRAVOS de carro, faixa verde |
| 3 | o pneu de chuva MURCHO, achatado embaixo |
| 4 | pneu LISO de moto, faixa vermelha, raios |
| 5 | pneu de CHUVA de moto, faixa azul, raios |

Contrato: em 0, 1, 2, 4 e 5 o pneu é um círculo cujo centro é o centro da célula, com o mesmo diâmetro dentro de cada tipo (carro: 0–2 iguais; moto: 4–5 iguais), ~8% de margem. Girado em qualquer ângulo, o desenho não pode "andar".

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches; a muted pastel palette (sage, slate and lavender blue, butter yellow, cream, olive green, warm gray, pale aqua) with a few clear accents (coral, royal blue); white flat clouds like the reference. Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A game sprite sheet on a fully TRANSPARENT background: a single row of 6 cells, each cell 256 x 256 (total 1536 x 256), read left to right. Wheels for a kids' racing game that will SPIN in the game, so each one is drawn in a PERFECTLY FLAT, ORTHOGRAPHIC SIDE VIEW, exactly like a wheel seen straight from the side of a car: a PERFECT CIRCLE, the hub EXACTLY in the center of the circle, all rings concentric, NO perspective, NO three-quarter view, NO visible tread width, NO visible thickness of the tire on any side. Each wheel is centered in its cell with about 8% margin. The tire types must be easy to tell apart by the COLORED STRIPE ring on the sidewall: RED = slick, BLUE = rain, GREEN = knobby.
1. A SLICK kart WHEEL: a perfect circle of smooth black rubber, a RED stripe ring, a silver rim with five thick spokes and a round hub in the exact center.
2. A RAIN kart WHEEL, same diameter as wheel 1: black rubber with short grooves notched evenly all around the outer edge, a BLUE stripe ring, the same silver rim.
3. A KNOBBY mud kart WHEEL, same diameter as wheel 1: big chunky blocks sticking out evenly all around the outer edge, a GREEN stripe ring, the same silver rim.
4. The RAIN kart wheel (blue stripe) gone FLAT: still seen straight from the side, the bottom squashed flat and bulging sideways, soft and saggy, its bottom edge touching the lower part of the cell.
5. A SLICK MOTORBIKE WHEEL: a tall perfect circle, a narrow smooth black rubber ring, a big silver rim with thin straight spokes from the center hub, a thin RED stripe.
6. A RAIN MOTORBIKE WHEEL, same diameter as wheel 5: the same narrow ring with small even grooves all around the edge, thin spokes, a thin BLUE stripe.

DO NOT INCLUDE: three-quarter view, perspective, visible tread surface, tire thickness, cylinders, ellipses, tilted wheels, karts, cars, motorbikes, axles, people, hands, faces or eyes on any object, text, letters, numbers, brand names on tires, logos, sparkles, the ground, shadows, backgrounds, items crossing cell borders, items cut by the cell edge, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a lavender plaid skirt; a young man in a lavender plaid overshirt and white pants; a woman with a blue polka-dot neckerchief and a coral shoulder bag; a young man in a cream sweater with a royal-blue panel), plaid patterns, polka dots, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

**Geração Aquarela — 20/10/2026:** ferramenta integrada, uma única geração com o bloco completo acima, sem cortes, e as duas referências 40/41 anexadas. Bruto original 2172 × 724 preservado em `outputs/pit-stop-da-chuva/raw/pneus.png` e `src/assets/games/EF05CO04/pit-stop-da-chuva/raw/pneus.png`. Final reempacotado com sharp em 1536 × 256, grade 6 × 1 de 256; origem de rotação (128,128), calculada pelos anéis circulares, sem centralizar pelo bbox. Diâmetro externo nominal 216 px nos pneus redondos de cada tipo; ajuste de escala e circularidade, com variação raster de até 1 px. Murcha com base em y=235, alinhada aos pneus redondos de carro. Alfa abaixo de 32 zerado antes e depois do reempacotamento. Medidas em `MANIFEST.md`; código e `pecas.png` preservados.

---

## 7. `controles.png` — 3 × 1 células de 256 (768 × 256), alfa

São só os desenhos que ficam dentro dos botões. A placa colorida e a palavra (ACELERAR, FREIO, TROCAR PNEU) são do código.

| Célula | Desenho |
|---|---|
| 0 | o **pedal do acelerador**: comprido e estreito, de metal, com frisos, inclinado |
| 1 | o **pedal do freio**: largo e baixo, de metal, com frisos |
| 2 | uma **chave de roda** cruzando um **pneu** de carro (faixa azul) |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches; a muted pastel palette (sage, slate blue, butter yellow, cream, warm gray) with a few clear accents (coral, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A game icon sheet on a fully TRANSPARENT background: a grid of 3 columns x 1 row, each cell 256 x 256 (total 768 x 256), read left to right. Simple, bold, readable icons centered with about 10% margin.
1. A car ACCELERATOR PEDAL: long and narrow, light metal with horizontal ridges, tilted slightly.
2. A car BRAKE PEDAL: wide and short, light metal with horizontal ridges, tilted slightly.
3. A silver LUG WRENCH crossing in front of a black kart tire with a blue stripe ring on its sidewall.

DO NOT INCLUDE: feet, shoes, hands, people, cars, text, letters, numbers, arrows, logos, backgrounds, shadows, the people from the reference images, hearts, sparkles, plaid patterns, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, 3D render, photorealistic.
~~~

---

## 8. `autodromo.png` — 1280 × 520, alfa só no céu

A faixa do autódromo, **de frente e sem perspectiva**, que se repete na horizontal: a borda da esquerda tem de **emendar** com a da direita (tileable). O alto é **transparente** (o código pinta o céu atrás), e a faixa entra na tela em y 200.

| Faixa (y) | O que tem |
|---|---|
| 0–60 | transparente |
| 60–220 | **arquibancada** coberta, com uma torcida pequenininha e colorida (cabecinhas, bandeirinhas lisas, mãos para cima) |
| 220–236 | **mureta** baixa de concreto claro |
| 236–290 | **faixa do box**: asfalto cinza mais claro, com um tracejado branco fino |
| 290–300 | **linha branca** cheia, separando o box da pista |
| 300–440 | **pista** de asfalto cinza-escuro com duas faixas (tracejado no meio) e zebra vermelha e branca em cima e embaixo |
| 440–520 | **grama** sálvia |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; tiny simple people with dot eyes; a muted pastel palette (sage, slate and lavender blue, butter yellow, cream, olive green, warm gray) with a few clear accents (coral, royal blue), like the calm sage bushes and warm gray ground of the reference. Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A horizontal background STRIP for a side-view kids' racing game, 1280 x 520, SEAMLESS: the left edge must tile perfectly with the right edge. Flat front view with NO perspective, like a 2D platformer. From top to bottom: (1) the top 60 pixels fully TRANSPARENT (the game paints the sky); (2) a long covered GRANDSTAND full of a tiny, cheerful, colorful crowd (little heads, raised hands, small plain flags), about 160 pixels tall; (3) a low light concrete WALL, about 16 pixels tall; (4) the PIT LANE: a lighter gray asphalt band about 54 pixels tall with a thin dashed white line; (5) a solid white line about 10 pixels tall; (6) the RACE TRACK: a dark gray asphalt band about 140 pixels tall with two lanes (a dashed center line) and red-and-white KERBS along its top and bottom edges; (7) a band of soft sage GRASS at the bottom, about 80 pixels tall. Calm, readable, not too busy, so the karts in front stand out.

DO NOT INCLUDE: the sky, clouds, sun, karts, cars, motorbikes, characters in front of the wall, pit garages or tents, text, letters, numbers, sponsor logos, ad boards with words, brand marks, perspective, vanishing points, curves in the track, trees in front of the track, night, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a lavender plaid skirt; a young man in a lavender plaid overshirt and white pants; a woman with a blue polka-dot neckerchief and a coral shoulder bag; a young man in a cream sweater with a royal-blue panel), couples, hearts, sparkles, plaid patterns, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 9. `lama.png` — 1280 × 204, opaco

É a mesma faixa do box e da pista de `autodromo.png` (y 236 a 440 dela), agora **de terra molhada**. Também se repete na horizontal. O código a põe por cima do asfalto nos trechos de lama do N2.

| Faixa (y) | O que tem |
|---|---|
| 0–56 | **faixa do box de terra** batida, marrom-claro, com marcas de pneu |
| 56–64 | uma cerquinha baixa de madeira, no lugar da linha branca |
| 64–204 | **pista de lama**: marrom, com sulcos de roda compridos e manchas mais escuras e mais claras |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches; a muted warm palette (cocoa, clay brown, sand, olive). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A horizontal ground STRIP for a side-view kids' racing game, 1280 x 204, opaque, SEAMLESS: the left edge must tile perfectly with the right edge. Flat front view with NO perspective. From top to bottom: (1) a packed light-brown DIRT pit lane about 56 pixels tall with faint tire marks; (2) a low wooden rail about 8 pixels tall; (3) a MUDDY race track about 140 pixels tall: wet brown mud with long wheel ruts running left to right and flat patches of darker wet mud and lighter dry mud.

DO NOT INCLUDE: sky, grass, grandstand, karts, motorbikes, people, puddles of water, rocks, text, letters, numbers, logos, perspective, curves, the people from the reference images, hearts, sparkles, plaid patterns, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 10. `tenda.png` — 600 × 360, alfa

É a **tenda da equipe**, onde a Kika para, vista de frente. Ela fica na frente da arquibancada, com a base apoiada na faixa do box. A base é reta e encosta no fundo da imagem.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches; a muted pastel palette (sage, slate blue, butter yellow, cream, warm gray) with a few clear accents (coral, royal blue). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A single object on a fully TRANSPARENT background, 600 x 360: a kids' racing team PIT TENT seen straight from the front with no perspective. A cream canopy roof with a scalloped mint-green and butter-yellow striped valance, two thin metal poles at the sides and a small mint pennant on top. Under it, an open, cozy work area: a back wall with a pegboard of tools, two small stacks of kart tires at the sides and a warm hanging lamp. The bottom edge is straight and touches the bottom of the image.

DO NOT INCLUDE: karts, motorbikes, people, characters, the race track, the ground, the sky, text, letters, numbers, logos, sponsor marks, team names, perspective, the people from the reference images, hearts, sparkles, plaid patterns, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 11. `mao.png` — 256 × 256, alfa

É a mãozinha da demonstração, com o **dedo indicador em pé**. **A ponta do dedo fica em (87, 18)**: é o `HAND_TIP` (0,34 · 0,07) em `data/files.ts`. Ela tem uma borda branca grossa para aparecer em cima de tudo.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: thin, even, slightly sketchy lineart in dark charcoal-brown; 100% flat fill colors, no gradients; one flat darker patch for shading. Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A single cartoon HAND on a fully TRANSPARENT background, 256 x 256: a child's hand seen from the back, the index finger pointing straight UP with its tip at about x 87, y 18, the other fingers curled, light peach skin, and a thick WHITE outline all around the hand so it reads over any background.

DO NOT INCLUDE: arms beyond the wrist, sleeves, rings, nails painted, peace-sign or other gestures, text, backgrounds, shadows, hearts, sparkles, gradients, 3D render, photorealistic.
~~~

---

## 12. `cover-pit-stop-da-chuva.png` — 1672 × 941, opaco, com o título

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches on folds; small simple faces with tiny dot eyes, a one-stroke nose, a short curved smile and soft pink oval blush; slender natural proportions with small heads (NOT chibi); a muted pastel palette (sage, slate and lavender blue, butter yellow, cream, olive green, warm gray, pale aqua) with a few clear accents (coral, royal blue); a few small white 4-point sparkles and flat white clouds are welcome. Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A cover illustration for a children's game, 16:9 (1672 x 941), opaque. At the TOP, a big, bold, friendly title lettering that reads exactly "Pit Stop da Chuva" (Portuguese), in chunky rounded letters, white with a mint-green outline. Below: a kids' race on a side-view track, half of the sky sunny and half with a gray rain cloud and falling drops. In front of a cream-and-mint pit tent, two kid mechanics of about 10 in mint-green overalls change the tires of a mint-green kart with yellow power wrenches, while the driver KIKA (a 10-year-old girl with brown skin, a curly black ponytail, a mint-green helmet with the visor up and a yellow scarf) gives a big smile. A chubby mustached team boss in a mint-green cap waves a checkered flag. A lavender kart and a coral motorbike race by on the track, one splashing a puddle and the other throwing a little mud. Bright, playful, energetic mood.

DO NOT INCLUDE: any text other than the title "Pit Stop da Chuva", misspelled title, extra titles, numbers on karts, sponsor logos, real racing brands, crashes, fire, scary elements, lightning, night, the people from the reference images (a girl with long wavy dark hair, a red bow headband, a yellow cardigan and a lavender plaid skirt; a young man in a lavender plaid overshirt and white pants; a woman with a blue polka-dot neckerchief and a coral shoulder bag; a young man in a cream sweater with a royal-blue panel), couples, holding hands, romantic poses, hearts, peace-sign gestures, plaid clothes, chibi proportions, big anime eyes with highlights, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 13a. `trilha.png` — 1280 × 204, opaco

É a mesma faixa de `lama.png` (y 236 a 440 do `autodromo.png`), agora com a **pista estreita**, e também se repete na horizontal. O código a põe por cima do asfalto nos trechos estreitos, que dão motivo à moto: a pista larga vira uma trilha onde o kart **não cabe**.

| Faixa (y) | O que tem |
|---|---|
| 0–56 | a **faixa do box** de terra batida, igual à de `lama.png` (a moto e o carro param nas tendas daqui) |
| 56–64 | a cerquinha baixa de madeira |
| 64–110 | **pedras cinza-quente e arbustos sálvia** cobrindo a metade de cima da pista |
| 110–160 | a **trilha**: uma faixa estreita de terra batida, cor de areia, com um sulco fino de roda de moto no meio |
| 160–204 | **pedras e arbustos** de novo, cobrindo a metade de baixo |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches; a muted warm palette (sand, clay brown, warm gray, sage green, olive). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A horizontal ground STRIP for a side-view kids' racing game, 1280 x 204, opaque, SEAMLESS: the left edge must tile perfectly with the right edge. Flat front view with NO perspective. From top to bottom: (1) a packed light-brown DIRT pit lane about 56 pixels tall with faint tire marks; (2) a low wooden rail about 8 pixels tall; (3) a band about 46 pixels tall of rounded warm-gray ROCKS and small sage-green BUSHES, crowding in; (4) a NARROW sandy DIRT TRAIL about 50 pixels tall running left to right, with one thin single-wheel rut in its middle, clearly too narrow for a car; (5) another band about 44 pixels tall of rocks and bushes at the bottom. The trail must read instantly as "a narrow path between rocks".

DO NOT INCLUDE: sky, grandstand, trees taller than the strip, karts, motorbikes, people, signs, cones, mud puddles, water, text, letters, numbers, logos, perspective, curves, the people from the reference images, hearts, sparkles, plaid patterns, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 13b. `trilha-pecas.png` — 2 × 1 células de 256 (512 × 256), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | a **placa de pista estreita**: placa amarela em losango num poste, com o desenho de duas linhas pretas se aproximando no meio (o funil), **sem letras** | aparece na beira da pista antes do trecho estreito |
| 1 | um **cone** laranja com faixa branca | na boca da trilha; balança quando o carro bate |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their rendering exactly: a trendy flat hand-drawn fashion illustration; thin, even, slightly sketchy lineart in dark charcoal-brown (never black, never thick); 100% flat fill colors, no gradients, no glossy highlights; shading only as a few flat, irregular, slightly darker patches; a muted palette with a few clear accents (butter yellow, coral orange, cream). Take ONLY the art style: do NOT copy their characters, couples, outfits, poses, hearts or backgrounds.

A game sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 1 row, each cell 256 x 256 (total 512 x 256). Each object centered, standing on the bottom of its cell with about 8% margin, seen from the FRONT.
1. A roadside "ROAD NARROWS" sign: a butter-yellow diamond sign on a thin wooden post, with a simple pictogram of two dark lines that come closer together in the middle (a funnel shape). No letters.
2. A coral-orange TRAFFIC CONE with one cream stripe, flat base.

DO NOT INCLUDE: letters, words, numbers, arrows other than the funnel lines, karts, motorbikes, people, ground, shadows on the ground, backgrounds, items crossing cell borders, items cut by the cell edge, the people from the reference images, hearts, sparkles, plaid patterns, cel shading, gradients, glossy highlights, thick outlines, white sticker keyline, watermarks, signatures, @handles, website names, painterly rendering, 3D render, photorealistic.
~~~

---

## 13. Quando a arte chegar

- **Todas as folhas:** medir por colunas antes de medir por célula (objeto que vaza para a vizinha pede reempacotar) e zerar a franja de alfa baixo.
- **`karts.png` e `motos.png`** (são cortadas pela grade, sem medir o alfa):
  - medir o centro dos dois arcos das rodas, a altura do eixo e a base do chassi, em fração da célula;
  - ajustar `GEOMETRY.carro` e `GEOMETRY.moto` em `data/layout.ts` (`rearFX`, `frontFX`, `axleFY`, `wheelFR`, `bottomFY`);
  - os arcos têm de estar no mesmo lugar nas 8 células.
- **`equipe.png`:** com proporção esguia, a cabeça fica mais alta na figura. Conferir `betoHead()` em `scenes/crew.ts`.
- **`autodromo.png` e `lama.png`:**
  - conferir onde ficaram a faixa do box e as duas faixas da pista, e ajustar `LANES`, `PIT_LANE`, `TRACK_BAND` e `MUD`;
  - se a emenda não fechar, espelhar a metade da direita.
- **`tenda.png`:** conferir a base e ajustar `TENT` e `CREW.idleFeet` (os mecânicos esperam na frente da tenda).
- **`mao.png`:** conferir a ponta do dedo contra o `HAND_TIP`.
- **Capa:** ligar no `catalog.ts` e gerar o `public/og/pit-stop-da-chuva.jpg` (1200 × 630).
- Registrar medidas e limpezas no `MANIFEST.md` da pasta de assets.
