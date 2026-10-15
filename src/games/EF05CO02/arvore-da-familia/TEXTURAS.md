# Árvore da Família — texturas

Destino: `src/assets/games/EF05CO02/arvore-da-familia/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 a tela, §6 o N1, §10 o N2, §11 o N3).

**Linha de arte: chibi de caderno (nova, 15/10/2026).** Anexe em **toda geração** as duas referências que o usuário mandou:
`references/37-chibi-caderno-a.png` (folha de uma menina de cabelo preto ondulado, blusa vermelha e saia xadrez) e
`references/38-chibi-caderno-b.png` (seis meninas chibi: cabelo verde-água, loira de maria-chiquinha, rosa de pompom, loira de vestido preto, empregadinha com machado).

- Todo bloco STYLE começa mandando usar as imagens anexadas e termina em *"Take ONLY the art style"*.
- O elenco das referências vai no negativo de **todos** os prompts (inclusive o **machado**, que é arma, e a letra japonesa e a assinatura).
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

**O jogo já roda sem nenhum PNG.** O N1 está desenhado em `Graphics` (rostos de reserva, árvore, moldura). Um PNG com o nome daqui substitui a reserva. Quando a arte chegar, as medidas das células entram no código (§11).

### Em que esta linha difere das vizinhas

| | chibi de caderno (este jogo) | chibi de rabisco (`29`) | chibi voador (`35`) | chibi de figurinha (`19`) |
|---|---|---|---|---|
| traço | caneta fina a média, **marrom-escuro quente**, ponta afinando | caneta-pincel ameixa, sem cor nenhuma | liso médio, tom escuro da própria cor | uniforme, escuro dessaturado |
| cor | **chapada e apagada** (tijolo, cacau, mostarda, sálvia, rosa-velho, ardósia), sem sombra ou com uma só, bem leve | só o papel | chapada + 1 sombra macia | chapada + 1 tom de sombra |
| bochecha | oval rosado **com tracinhos diagonais** (também no joelho) | chapada | rosada | rosada |
| olho | grande, redondo, castanho-escuro, 1–2 brilhos pequenos, cílio curto em cima | traço | enorme, com brilhos | enorme, um brilho |
| proporção | chibi **um pouco alongado** (cabeça ≈ 1/3 a 1/4) | chibi de emote | cabeça ≈ metade | cabeça grande |
| enfeite | florzinhas, brilhinhos e tracinhos de movimento, só onde pedido | — | "+" brancos | marquinhas de emoção |
| keyline branca | **não** | não | não | sim |

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Nível | Uso |
|---|---|---|---|---|---|---|
| `familia.png` | 4 × 4 | 256 | 1024 × 1024 | sim | N1, N2 | os 16 rostos dos cartões (busto de frente) |
| `joao.png` | 4 × 1 | 256 | 1024 × 256 | sim | N1–N2 | o rosto do João falando, com medo do vento, comemorando e triste |
| `arvore.png` | — | — | 1100 × 620 | sim | N1 | a árvore grande (balança com o vento) |
| `parque.png` | — | — | 1280 × 720 | opaco | N1 | o fundo: céu, sol, morro e grama, **sem** a árvore |
| `ui.png` | 4 × 2 | 256 | 1024 × 512 | sim | todos | moldura do cartão, lugar vazio, folha, flor, rajada, concha, cesta, brilho |
| `praia.png` | — | — | 1280 × 720 | opaco | N2 | a praia: mar no alto, areia molhada no meio, areia seca embaixo |
| `onda.png` | — | — | 1280 × 360 | sim | N2 | a frente da onda com espuma, que sobe a areia |
| `bichos.png` | 6 × 4 | 256 | 1536 × 1024 | sim | N3 | gatos, cachorros e coelhos (6 papéis cada) + o pombo-correio |
| `quintal.png` | — | — | 2336 × 724 (largo) | opaco | N3 | o quintal largo, arrastável de lado, com três arvorezinhas |
| `cover-arvore-da-familia.png` | — | — | 1672 × 941 | opaco | — | capa **com o título** |

**Para testar o N1 com arte bastam cinco:** `familia.png`, `joao.png`, `arvore.png`, `parque.png` e `ui.png`.
O **insubstituível** é o `familia.png`: os rostos é que fazem a criança reconhecer cada parente.

**A ordem das células é contrato com o código.** O tamanho pode variar (o jogo mede cada célula), mas a grade, a ordem e o conteúdo não.

## 2. Regras deste jogo

- **Nenhum texto na arte.** O nome no cartão ("Avô", "Tia"), as falas e a ligação do N2 ("mãe da Mãe") são do código. Só a capa tem letreiro.
- **Ninguém se destaca por cor.** Nenhum parente tem moldura, fundo ou brilho diferente: a pista é o rosto e o nome, e o lugar sai das ligações.
- **A família tem cara de família.** O lado do Pai tem pele parda, cabelo preto e o mesmo nariz redondinho. A Mãe e os pais dela têm pele morena-clara e cabelo castanho ondulado. A Tia que casou com o Tio é ruiva de sardas, e os filhos dela herdam o ruivo.
- **Idade lê de longe:** avós de cabelo branco ou grisalho e óculos; pais adultos jovens; tios parecidos com o irmão ou a irmã; crianças com cabeça maior e rosto redondo.
- **Busto de frente**, olhando para quem joga, cortado por uma linha reta e macia na altura do ombro (nunca pela borda da célula), centrado, com cerca de 8 % de margem.

---

## 3. `familia.png` — 4 × 4 células de 256 (1024 × 1024), alfa

| Célula | Quem | Aparência |
|---|---|---|
| 0 | **João** (≈ 9 anos, o dono da árvore) | pele parda, cabelo preto liso curto com franja reta e um topetinho, olhos castanho-escuros, camiseta amarelo-mostarda, sorriso tranquilo |
| 1 | **Pai** | pele parda, cabelo preto curto, bigode preto, camisa xadrez verde-sálvia |
| 2 | **Mãe** | pele morena-clara, cabelo castanho-escuro ondulado até o ombro, brincos de argola pequenos, blusa rosa-velho com botõezinhos |
| 3 | **Irmã** (≈ 6 anos) | pele parda, cabelo castanho em duas marias-chiquinhas com elásticos amarelos, vestido lilás |
| 4 | **Irmão** (≈ 12 anos) | pele parda, cabelo preto, boné azul-ardósia virado para trás, camiseta branca |
| 5 | **Avô** (pai do Pai) | pele parda, cabelo branco curto, bigode branco, óculos redondos, colete marrom sobre camisa creme |
| 6 | **Avó** (mãe do Pai) | pele parda, cabelo branco num coque, óculos de meia-lua, xale verde-musgo |
| 7 | **Tio** (irmão do Pai) | pele parda, cabelo preto cacheado curto, barba curta, camiseta azul-petróleo |
| 8 | **Tia** (casada com o Tio) | pele clara, cabelo ruivo-acobreado em rabo de cavalo, sardas, blusa mostarda |
| 9 | **Primo** (≈ 8 anos, filho do Tio e da Tia) | pele parda-clara, cabelo ruivo-acobreado espetado, sardas, camiseta laranja |
| 10 | **Prima** (≈ 7 anos) | pele parda-clara, cabelo ruivo-acobreado chanel curtinho com um laço verde-sálvia, sardas |
| 11 | **Avô** (pai da Mãe, N2) | pele morena-clara, careca em cima com cabelo grisalho dos lados, sobrancelhas grossas grisalhas, suspensórios sobre camisa creme |
| 12 | **Avó** (mãe da Mãe, N2) | pele morena-clara, cabelo grisalho curto e cacheado, colar de contas, blusa azul-céu |
| 13 | **Tia** (irmã da Mãe, N2) | pele morena-clara, cabelo castanho ondulado como o da Mãe, só que curtinho, óculos de armação vermelho-tijolo |
| 14 | **Tio** (casado com a irmã da Mãe, N2) | pele negra, cabelo crespo curto, sorriso largo, camisa verde-oliva |
| 15 | **Primo bebê** (filho dos dois de cima, N2) | bebê de pele morena, um tufinho de cabelo cacheado, bochechas grandes, babador branco |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading (at most one very faint shadow tone), no gradients; soft rosy blush ovals with a few tiny diagonal hatch lines on the cheeks; big round dark-brown eyes with one or two small white highlights and short upper lashes; small simple mouths; hair drawn as soft locks with a few inner lines; warm muted palette (brick red, cocoa brown, mustard, sage green, dusty pink, slate blue) on warm cream. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 4 rows, each cell 256 x 256 (total 1024 x 1024), read left to right, top row first. Each cell holds ONE head-and-shoulders BUST of a member of the same Brazilian family, facing the viewer, centered, about 84% of the cell tall, the bust cut by a soft straight line at the shoulders (never by the cell edge), friendly calm smile, no frame, no background, no shadow on the ground. The father's side all have warm brown skin, black hair and the same small round nose; the mother's side have light-tan skin and dark-brown wavy hair.
1. JOÃO, a 9-year-old boy: brown skin, short straight black hair with a straight fringe and a little tuft on top, dark-brown eyes, mustard-yellow t-shirt.
2. The FATHER: brown skin, short black hair, black moustache, sage-green plaid shirt.
3. The MOTHER: light-tan skin, shoulder-length wavy dark-brown hair, small hoop earrings, dusty-pink blouse with little buttons.
4. The little SISTER, about 6: brown skin, brown hair in two pigtails with yellow hair ties, lilac dress.
5. The big BROTHER, about 12: brown skin, black hair, slate-blue cap worn backwards, white t-shirt.
6. The GRANDFATHER on the father's side: brown skin, short white hair, white moustache, round glasses, brown vest over a cream shirt.
7. The GRANDMOTHER on the father's side: brown skin, white hair in a bun, half-moon reading glasses, moss-green shawl.
8. The UNCLE, the father's brother: brown skin, short curly black hair, short beard, petrol-blue t-shirt.
9. The AUNT married to that uncle: fair skin, copper-red hair in a ponytail, freckles, mustard blouse.
10. Their son, the COUSIN, about 8: light-brown skin, spiky copper-red hair, freckles, orange t-shirt.
11. Their daughter, the girl COUSIN, about 7: light-brown skin, short copper-red bob with a sage-green bow, freckles.
12. The GRANDFATHER on the mother's side: light-tan skin, bald on top with grey hair on the sides, thick grey eyebrows, suspenders over a cream shirt.
13. The GRANDMOTHER on the mother's side: light-tan skin, short curly grey hair, bead necklace, sky-blue blouse.
14. The AUNT who is the mother's sister: light-tan skin, wavy dark-brown hair like the mother's but short, brick-red glasses.
15. The UNCLE married to the mother's sister: dark-brown (Black) skin, short coily black hair, big smile, olive-green shirt.
16. Their BABY son: tan skin, a little tuft of curly hair, big round cheeks, white bib.

DO NOT INCLUDE: card frames, name tags, text, letters, numbers, backgrounds, colored tiles behind the busts, full bodies, hands covering faces, two people in one cell, items crossing cell borders, busts cut by the cell edge, different art styles between cells, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater and pleated skirt; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, Japanese text, handwritten notes, signatures, "SOORA", watermarks, @handles, white sticker keyline, soft airbrushed gradients, glossy anime shading, painterly rendering, 3D render, photorealistic, harsh pure-black outlines, western cartoon style, adult glamour proportions.
~~~

---

## 4. `joao.png` — 4 × 1 células de 256 (1024 × 256), alfa

O mesmo busto do João da célula 0 do `familia.png` (mesmo enquadramento, mesma escala, mesma camiseta), com quatro expressões. O código troca o rosto do cartão dele quando ele fala ou reage.

| Célula | Expressão |
|---|---|
| 0 | **falando**, contente: boca aberta num "D" pequeno, sobrancelhas para cima |
| 1 | **com medo do vento**: olhos arregalados, franja voando para o lado, uma gotinha de suor |
| 2 | **comemorando**: olhos fechados em arco, sorriso enorme, duas florzinhas e brilhinhos em volta da cabeça |
| 3 | **preocupado**: sobrancelhas caídas, boca ondulada, uma gotinha |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading (at most one very faint shadow tone), no gradients; soft rosy blush ovals with a few tiny diagonal hatch lines on the cheeks; big round dark-brown eyes with one or two small white highlights and short upper lashes; small expressive doodle marks (tiny flowers, sparkles, sweat drops, motion ticks) only where asked; warm muted palette on warm cream. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A game sprite sheet on a fully TRANSPARENT background: 4 columns x 1 row, each cell 256 x 256 (total 1024 x 256), left to right. The SAME head-and-shoulders bust in all four cells, same framing and same size: JOÃO, a 9-year-old Brazilian boy with brown skin, short straight black hair with a straight fringe and a little tuft on top, dark-brown eyes, mustard-yellow t-shirt, facing the viewer, centered, about 84% of the cell tall, cut by a soft straight line at the shoulders.
1. TALKING, cheerful: small open "D" mouth, eyebrows raised.
2. SCARED OF THE WIND: wide eyes, fringe blown to one side, one sweat drop, two little wind ticks beside his head.
3. CELEBRATING: eyes closed in happy arcs, huge smile, two tiny flowers and sparkles around his head.
4. WORRIED: eyebrows down, wavy mouth, one sweat drop.

DO NOT INCLUDE: card frames, name tags, text, letters, backgrounds, colored tiles, full body, hands, other people, a different hairstyle or shirt between cells, items crossing cell borders, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater and pleated skirt; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, soft airbrushed gradients, glossy anime shading, painterly rendering, 3D render, photorealistic, harsh pure-black outlines, western cartoon style.
~~~

---

## 5. `arvore.png` — 1100 × 620, alfa

A árvore onde a família fica pendurada. O código põe a **base do tronco** no meio embaixo (âncora 0,5 × 1) e balança a árvore a partir dali. A copa é **larga e redonda**, ocupando quase toda a imagem (de x 40 a 1060 e de y 0 a 500). **O miolo da copa é calmo e claro** (folhagem lisa, poucos detalhes): é ali que ficam as linhas escuras e os cartões, que precisam ler por cima. O tronco é curto e grosso e sai do meio da base.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading (at most one very faint shadow tone), no gradients; soft rounded shapes; warm muted palette (sage green, olive, moss, cocoa brown) on warm cream. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A single game sprite on a fully TRANSPARENT background, 1100 x 620: ONE big friendly tree seen from the front. A very WIDE, round, cloud-shaped canopy that fills almost the whole image (from about x 40 to x 1060 and from the top down to about y 500), drawn as a few big soft scalloped leaf masses in two sage greens with a few doodled leaf lines only near the outer edge; the CENTER of the canopy is calm and plain, a lighter sage green with almost no detail, because cards and dark lines will be placed on top of it. A short, thick cocoa-brown trunk comes out of the middle of the bottom edge with two small roots, the base of the trunk touching the bottom edge of the image. No ground, no grass, no shadow.

DO NOT INCLUDE: people, faces, cards, frames, circles, lines or diagrams on the tree, fruits, birds, swings, tree houses, ground, grass, sky, background, text, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, busy detailed foliage in the center, dark canopy, soft airbrushed gradients, painterly rendering, 3D render, photorealistic, harsh pure-black outlines.
~~~

---

## 6. `parque.png` — 1280 × 720, opaco

O fundo do N1, **sem a árvore** (ela é o `arvore.png`, posto por cima com a base em x 640, y 600). Céu verde-água claro com nuvens macias, um sol amarelo-manteiga no canto de cima à esquerda, um morro de grama que atravessa a tela e uma **faixa de grama lisa e clara embaixo (y 570 a 720)**, onde os cartões caem. Arbustos baixos só nas laterais.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black); flat, muted colors with NO shading, no gradients; soft rounded shapes; warm muted palette (pale teal sky, butter yellow, sage and moss greens, cream). Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A full game background, 1280 x 720, landscape, opaque, NO white sticker keyline here. A calm park on a sunny day, seen from the front: a pale teal-blue sky with a few soft doodled clouds, a round butter-yellow sun with little ray ticks in the upper-left corner, a gentle rolling grassy hill crossing the image, and a smooth, light sage-green grass band along the bottom (from about y 570 to the bottom edge) with only a few tiny grass ticks, because game cards will lie on it. Low round bushes only at the far left and far right edges. The middle of the image is EMPTY sky and hill (a big tree will be placed there separately).

DO NOT INCLUDE: a tree in the middle, any big tree, people, animals, cards, frames, paths, benches, buildings, flowers in the bottom grass band, text, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, soft airbrushed gradients, painterly rendering, 3D render, photorealistic, harsh pure-black outlines.
~~~

---

## 7. `ui.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Notas |
|---|---|---|
| 0 | **moldura do cartão** vazia | papel creme em pé, proporção 112 × 128 (≈ 196 × 224 na célula), cantos arredondados, contorno marrom-escuro, faixa de baixo (28 % da altura) num creme mais escuro. **Vazia**: sem rosto e sem texto (o código põe o rosto e o nome) |
| 1 | **lugar vazio** | a mesma silhueta da moldura, só que **tracejada**, com o miolo creme bem transparente (≈ 35 %) e uma folhinha no alto |
| 2 | **folha** | uma folha verde-sálvia solta, para o vento |
| 3 | **florzinha** | flor de 5 pétalas rosa-velho com miolo mostarda, para a comemoração |
| 4 | **rajada** | um risco de vento branco-creme, curvo, com um caracol na ponta |
| 5 | **concha** (N2) | concha de vieira creme-rosada, a "tachinha" dos cartões na areia |
| 6 | **cesta** (N3) | cesta de vime de frente, larga e baixa, vazia |
| 7 | **brilho** | estrelinha de 4 pontas mostarda-clara |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading, no gradients; soft rounded shapes; warm muted palette (cream, sage green, dusty pink, mustard, cocoa brown) . Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Each item centered in its cell with about 8% margin, no shadow on the ground.
1. An EMPTY PORTRAIT CARD: an upright cream paper card about 196 x 224 px with rounded corners and a dark-brown outline; the bottom 28% is a slightly darker cream strip separated by a thin line. Completely EMPTY: no face, no picture, no text.
2. An EMPTY CARD SLOT: exactly the same card silhouette as item 1, but drawn with a DASHED dark-brown outline and a very pale, semi-transparent cream inside (about 35% opacity), with one tiny sage leaf at the top edge.
3. A single sage-green LEAF, slightly curled, with one center vein line.
4. A small FLOWER with five dusty-pink petals and a mustard center.
5. A WIND GUST: one long curved cream-white stroke ending in a small curl, with two short parallel strokes beside it.
6. A SCALLOP SEASHELL, pale cream-pink, front view.
7. A WICKER BASKET seen from the front, wide and low, empty, warm tan.
8. A small four-pointed SPARKLE star, pale mustard.

DO NOT INCLUDE: faces, people, animals, text, letters, numbers on the card, pictures inside the card, colored tiles behind items, items crossing cell borders, items cut by the cell edge, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, soft airbrushed gradients, glossy shading, painterly rendering, 3D render, photorealistic, harsh pure-black outlines.
~~~

---

## 8. `praia.png` (N2) — 1280 × 720, opaco

O mar fica no alto (y 0 a 200), com o céu numa faixa fininha em cima. Do meio para baixo há **areia molhada lisa e mais escura** (y 200 a 560), onde a árvore da família é desenhada (o código cava as linhas e prende os cartões com conchas). Embaixo fica a **areia seca clara** (y 560 a 720), onde a onda larga os cartões. Um guarda-sol e um baldinho, só nos cantos de baixo.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black); flat, muted colors with NO shading, no gradients; soft rounded shapes; warm muted palette (pale teal sea, sand beige, cream, dusty pink, mustard). Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A full game background, 1280 x 720, landscape, opaque, NO white sticker keyline here. A calm beach seen from above at a gentle angle: a thin pale sky strip at the very top, then a teal sea with soft doodled wave lines (from the top down to about y 200), then a wide band of SMOOTH, slightly darker WET SAND with almost no detail (from about y 200 to y 560), then light DRY SAND along the bottom (y 560 to the bottom edge). A small striped dusty-pink beach umbrella at the far bottom-left corner and a little mustard bucket at the far bottom-right corner, both small.

DO NOT INCLUDE: people, animals, cards, frames, drawings or lines in the sand, footprints, sandcastles in the middle, shells in the middle, boats, text, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, soft airbrushed gradients, painterly rendering, 3D render, photorealistic, harsh pure-black outlines.
~~~

---

## 9. `onda.png` (N2) — 1280 × 360, alfa

A frente da onda vista de cima, que o código sobe pela areia e puxa de volta. Água verde-água chapada na metade de cima, terminando numa **borda de espuma branco-creme ondulada** na metade de baixo, com bolinhas de espuma soltas na ponta. Ela atravessa a imagem de ponta a ponta.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black); flat, muted colors with NO shading, no gradients; soft rounded shapes. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A single game sprite on a fully TRANSPARENT background, 1280 x 360: the FRONT OF A WAVE seen from above, spanning the full width edge to edge. The top half is flat teal sea water; it ends in a wide, wavy, scalloped cream-white FOAM edge across the lower half, with a few loose round foam bubbles at the very tip. The bottom of the image below the foam is transparent.

DO NOT INCLUDE: sand, beach, sky, people, animals, cards, surfers, boats, a side view of a curling wave, text, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, soft airbrushed gradients, painterly rendering, 3D render, photorealistic, harsh pure-black outlines.
~~~

---

## 10. `bichos.png` (N3) — 6 × 4 células de 256 (1536 × 1024), alfa

Fileiras 0 a 2: uma família por fileira (gatos, cachorros, coelhos). Colunas: **avô, avó, pai, mãe, filhote (o dono da árvore), irmão do filhote**. Fileira 3: o pombo-correio (2 quadros) e quatro células vazias.

| Fileira | Família | Traço comum | Filhote (col. 4) |
|---|---|---|---|
| 0 | **gatos** | pelo laranja-caramelo com listras | **Mimi**, gatinha com laço rosa-velho |
| 1 | **cachorros** | pelo bege com orelhas marrom-cacau caídas | **Totó**, cachorrinho com lenço sálvia no pescoço |
| 2 | **coelhos** | pelo cinza-claro com orelhas compridas de dentro rosa | **Pipoca**, coelhinha com uma florzinha na orelha |

Os avós têm o focinho e as sobrancelhas grisalhos e óculos; o pai tem gravata-borboleta; a mãe tem um colarzinho; o irmão é um pouco maior que o filhote e usa boné.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading (at most one very faint shadow tone), no gradients; soft rosy blush ovals with tiny diagonal hatch lines; big round dark-brown eyes with one or two small white highlights; warm muted palette (caramel orange, cocoa brown, beige, light grey, dusty pink, sage). Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A game sprite sheet on a fully TRANSPARENT background: a grid of 6 columns x 4 rows, each cell 256 x 256 (total 1536 x 1024), read left to right, top row first. Rows 1 to 3: round, cute kawaii ANIMAL head-and-shoulders busts facing the viewer (animals, NOT people), centered, about 82% of the cell tall, cut by a soft line at the shoulders. Columns in every family row, in order: GRANDFATHER (grey muzzle and eyebrows, round glasses), GRANDMOTHER (grey muzzle, half-moon glasses), FATHER (small bow tie), MOTHER (small bead necklace), the YOUNG CHILD (the smallest, rounder head), the OLDER BROTHER (a bit bigger than the young child, small cap). All members of a row share the same fur colors.
Row 1, the CAT family: caramel-orange striped fur; the young child is a little girl kitten with a dusty-pink bow.
Row 2, the DOG family: beige fur with floppy cocoa-brown ears; the young child is a puppy with a sage-green neckerchief.
Row 3, the RABBIT family: light-grey fur with long ears pink inside; the young child is a bunny girl with a small flower on one ear.
Row 4: cell 1 = a cute grey-and-white CARRIER PIGEON flying, holding a small blank cream card in its beak; cell 2 = the same pigeon landed, wings half open, the beak empty; cells 3 to 6 empty.

DO NOT INCLUDE: humans, human hair, clothes beyond the small accessories listed, card frames, name tags, text, letters, backgrounds, colored tiles, full bodies (except the pigeon), animals crossing cell borders, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), animal ears on humans, weapons, axes, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, soft airbrushed gradients, glossy shading, painterly rendering, 3D render, photorealistic, harsh pure-black outlines.
~~~

---

## 11. `quintal.png` (N3) — largo (entregue com 2336 × 724), opaco

> **Entregue mais largo de propósito** (o usuário, 15/10/2026): o quintal é arrastável na horizontal no N3. O prompt abaixo é o que gerou a primeira versão; numa nova geração, pedir **2336 × 720**, com as árvores mais afastadas.

Um quintal com **três arvorezinhas iguais lado a lado** (centros em x 215, 640 e 1065, copas de ≈ 400 × 380 com o miolo calmo e claro), cada uma com um detalhe da família no pé do tronco: um novelo de lã (gatos), um osso e uma tigelinha (cachorros), uma cenoura (coelhos). Embaixo, uma faixa de grama lisa (y 590 a 720), onde ficam a cesta e o pombo.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black); flat, muted colors with NO shading, no gradients; soft rounded shapes; warm muted palette (pale teal sky, sage and moss greens, cocoa brown, cream). Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A full game background, 1280 x 720, landscape, opaque, NO white sticker keyline here. A cozy backyard on a sunny day with THREE identical small round trees standing side by side, their trunks centered at about x 215, x 640 and x 1065, each canopy about 400 px wide and 380 px tall with a calm, plain, lighter sage-green center (cards will be placed on top). At the foot of each trunk one small clue: a ball of yarn under the left tree, a bone and a little bowl under the middle tree, a carrot under the right tree. A low wooden fence far behind, pale teal sky. A smooth, light grass band along the bottom (from about y 590 to the bottom edge).

DO NOT INCLUDE: animals, people, cards, frames, lines or diagrams on the trees, a house, text, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, busy foliage, soft airbrushed gradients, painterly rendering, 3D render, photorealistic, harsh pure-black outlines.
~~~

---

## 12. `cover-arvore-da-familia.png` — 1672 × 941, opaco, com o título

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading (at most one very faint shadow tone), no gradients; soft rosy blush ovals with tiny diagonal hatch lines; big round dark-brown eyes with small white highlights; small doodle flowers, sparkles and wind ticks; warm muted palette (pale teal, sage green, mustard, brick red, dusty pink, cocoa brown) on warm cream. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A game cover illustration, 1672 x 941, landscape, opaque, NO white sticker keyline here. A big friendly round tree in a sunny park; on its canopy hangs a FAMILY TREE made of little cream portrait cards joined by dark-brown lines: grandparents at the top, parents and an uncle in the middle, children below. A gust of wind blows from the left: leaves fly and two cards are flipping in the air. In front, at the bottom center, JOÃO, a 9-year-old Brazilian boy with brown skin, short straight black hair with a fringe and a mustard-yellow t-shirt, reaches up happily to hang a card back. At the top center, a big rounded TITLE that reads exactly "Árvore da Família" (with the accent on the first Á), in chunky colorful letters with a thick dark-brown outline and a slight volume, easy to read.

DO NOT INCLUDE: misspelled title, extra text, subtitles, logos, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, Japanese text, signatures, "SOORA", watermarks, white sticker keyline, soft airbrushed gradients, glossy anime shading, painterly rendering, 3D render, photorealistic, harsh pure-black outlines, western cartoon style.
~~~

---

## 13. A entrega (15/10/2026)

Chegaram as 9 folhas e, depois, a capa (§12), já registrada no catálogo. Medidas reais e como o código usa cada uma:

| Arquivo | Chegou | No jogo |
|---|---|---|
| `familia.png` | 1024 × 1024, 4 × 4 de 256 | célula **inteira** (o busto é cortado na base da célula), escala 96 / 256, base do busto na linha da faixa do nome. Nenhum busto vaza para a vizinha; a borda avermelhada do alfa some sobre o creme |
| `joao.png` | **1200 × 300**, 4 × 1 de **300** | igual, escala 96 / 300 (o busto fica do mesmo tamanho do `familia`) |
| `ui.png` | 1024 × 512, 4 × 2 de 256 | recorte pela caixa alfa. Moldura **189 × 241** (faixa do nome a 77,6 %): o cartão do jogo virou **104 × 133**. Lugar vazio: corpo tracejado de 172 × 230 a partir de y 22 da caixa (a folhinha fica acima) |
| `arvore.png` | **1671 × 941** | âncora no pé do tronco, altura 607 na tela, base em y 657 |
| `parque.png` | **1672 × 941** (16:9) | esticado para 1280 × 720 |
| `praia.png` | 1672 × 940 | N2 |
| `onda.png` | **1983 × 793** | N2 |
| `bichos.png` | 1536 × 1024, 6 × 4 de 256 | N3 |
| `quintal.png` | **2336 × 724**, as **8 linhas de cima transparentes** | N3: mundo largo e arrastável (PLANEJAMENTO §11). Cortar as 8 linhas ao encaixar |

O cartão do João ganha a faixa do nome em coral por cima da moldura (pintada no código).
