# Ventania na Floresta — texturas

Destino: `src/assets/games/EF15CO01/ventania-na-floresta/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 a tela, §6 os bichos e as coisas, §7 o N1).

**Com imagem de referência:** anexe em **toda geração** a `references/35-chibi-voador.webp` (os quatro meninos chibi voando entre nuvens, com slimes e arco-íris). É a linha de chibi mais leve do projeto e combina com o vento do jogo. Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*. O elenco da referência vai no negativo de todos os prompts. Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar. Se quiser outra linha, é a Dúvida 1 do PLANEJAMENTO.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código (`scenes/fallback.ts`) nas mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-trilha.png` | — | — | 1672 × 941 (escalado para 1280 × 720) | opaco | o chão da floresta com o formigueiro e a trilha (fases de FILA) |
| `bg-jardim.png` | — | — | 1672 × 941 (escalado para 1280 × 720) | opaco | a clareira com a colmeia na árvore (fases de GRADE) |
| `formigas.png` | 4 × 2 | 256 | 1024 × 512 | sim | a formiga em 8 poses, virada para a **esquerda** |
| `zuzu.png` | 3 × 2 | 256 | 768 × 512 | sim | a abelha Zuzu em 6 poses |
| `flores.png` | 3 × 3 | 256 | 768 × 768 | sim | 3 tipos × 3 cores de flor |
| `pipa.png` | 4 × 2 | 256 × 320 | 1024 × 640 | sim | a esquilinha Pipa em 8 poses |
| `objetos.png` | 4 × 2 | 256 | 1024 × 512 | sim | estacas, casinha do canteiro, folhas, marca da fila, poeira |
| `cover-ventania-na-floresta.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

As folhas do N2 e do N3 estão no §11.

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

**Para o N1 bastam:** os dois fundos, `formigas`, `zuzu`, `flores` e `objetos`. A Pipa só aparece na abertura (sem ela o jogo funciona, com a reserva), e a capa vem por último. A linha 3 de `flores.png` (estrela) só entra no N3.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Os nomes FILA e GRADE, as frases e os balões são do código. As placas das estacas vêm **em branco**: o código desenha a flor da linha em cima. A única exceção é o título da capa.
- **As cores das flores são exatas e só delas:** amarelo `#FFD23F`, azul `#5AA9F0` e rosa `#F58CC0`. Nenhuma outra coisa do cenário usa essas três cores como cor principal (nada de flor amarela, azul ou rosa no fundo): uma flor do fundo com a cor de uma coluna confundiria a leitura.
- **As três flores têm silhuetas bem diferentes:** margarida (pétalas redondas em volta de um miolo), tulipa (copinho de três pontas) e estrela (cinco pétalas pontudas). O caule e a folhinha são iguais nas três.
- **As formigas variam só de tamanho**, e o tamanho é do código: a folha `formigas.png` tem uma formiga só, desenhada grande.
- **A Zuzu e a Pipa não usam amarelo-flor, azul-flor nem rosa-flor como cor principal**; a Zuzu é amarelo-mel `#F2B53A` com listras marrom-escuras.
- **Vista de cima, inclinada (3/4):** a câmera olha de cima, a ~40°. Fundos, formigas, flores e estacas com a mesma inclinação.
- Peça solta e centrada na célula, com cerca de 8 % de margem. Os bichos pisam no fundo da célula (a Zuzu, que voa, fica centrada).

---

## 3. `bg-trilha.png` — 1672 × 941, opaco

O chão da floresta, de cima. O código põe as formigas por cima.

| Região (em % da imagem) | O que tem |
|---|---|
| alto, 0–13 % da altura | grama calma e lisa (é onde fica o cabeçalho) |
| formigueiro: 4–20 % da largura, 62–86 % da altura | um montinho de terra com a entrada da toca virada para a direita |
| trilha: de 18 % a 100 % da largura, 69–80 % da altura | um caminho de terra batida, liso, que sai do formigueiro e corre reto para a direita |
| faixa do meio: 20–95 % da largura, 26–52 % da altura | grama lisa e calma, **vazia** (as formigas caem ali) |
| bordas e cantos de baixo | tufos de grama, cogumelos, pedrinhas, folhas caídas, raízes |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (mint, leaf green, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, NO white sticker keyline here — this is a full scene, not a sticker. A sunny forest floor seen from ABOVE at a 3/4 angle (camera about 40 degrees above the ground), crisp shapes, no painterly brushwork. The whole ground is soft fresh grass in mint and leaf green. The top 13% of the picture is plain calm grass with nothing on it. On the LEFT, from 4% to 20% of the width and from 62% to 86% of the height: a cute round ANTHILL, a mound of warm brown soil with a dark round tunnel entrance facing RIGHT. From the anthill a smooth flat DIRT TRAIL of light packed earth runs STRAIGHT to the RIGHT edge of the picture, between 69% and 80% of the height, with soft grassy borders; the trail is plain and empty. The middle band of the picture (from 20% to 95% of the width, from 26% to 52% of the height) is plain, calm, completely EMPTY grass. Only along the bottom edge, the left and right edges and the corners: little tufts of grass, small round brown mushrooms, smooth pebbles, a few fallen green leaves, a curved tree root. Bright, cheerful daylight.

DO NOT INCLUDE: ants, insects, bugs, bees, animals, people, characters, flowers in yellow, blue or pink, any flower blossoms, text, letters, numbers, signs, objects on the trail, objects in the middle band, strong perspective, side view, horizon, sky, trees trunks in the middle, night, scary or dark elements, red danger colors, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `bg-jardim.png` — 1672 × 941, opaco

A clareira das abelhas. O código desenha o canteiro (as casinhas e as estacas) no meio.

| Região (em % da imagem) | O que tem |
|---|---|
| alto, 0–13 % da altura | grama e copa de árvore calmas |
| meio: 18–74 % da largura, 25–90 % da altura | um gramado aparado, liso e **vazio** (o canteiro vai ali) |
| direita alta: 80–100 % da largura, 10–48 % da altura | o tronco e um galho grosso de uma árvore, com uma **colmeia** dourada pendurada |
| direita baixa: 76–96 % da largura, 76–95 % da altura | grama lisa e vazia (o montinho de flores caídas fica ali) |
| bordas da esquerda e de baixo | arbustos verdes redondos, pedrinhas, cogumelos |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (mint, leaf green, cream, warm brown, honey gold) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, NO white sticker keyline here — this is a full scene, not a sticker. A sunny forest clearing seen from ABOVE at a 3/4 angle (camera about 40 degrees above the ground), crisp shapes, no painterly brushwork. The top 13% of the picture is calm grass and soft treetop leaves. The big middle area (from 18% to 74% of the width, from 25% to 90% of the height) is a plain, neatly trimmed, completely EMPTY lawn in mint and leaf green. On the upper RIGHT (from 80% to 100% of the width, from 10% to 48% of the height): the trunk and one thick branch of a friendly tree, with a round golden BEEHIVE (honey gold #F2B53A, soft rounded rings, a small dark entrance hole) hanging from the branch. The lower right corner (from 76% to 96% of the width, from 76% to 95% of the height) is plain empty grass. Along the left edge and the bottom edge only: round green bushes, smooth pebbles, small brown mushrooms. Bright, cheerful daylight.

DO NOT INCLUDE: bees, insects, ants, animals, people, characters, flowers of any kind, flower blossoms, flower beds, garden plots, soil rectangles, fences, text, letters, numbers, signs, objects in the middle lawn, strong perspective, side view, horizon, sky, night, scary or dark elements, red danger colors, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `formigas.png` — 4 × 2 células de 256 (1024 × 512), alfa

Uma formiguinha chibi, **sempre virada para a ESQUERDA** (é para lá que fica o formigueiro), desenhada grande; o código encolhe para fazer as menores. Vermelho-tijolo `#C0503A`, cabeça grande e redonda, olhos enormes, duas antenas com bolinha na ponta, seis perninhas curtas. Nas células 0 a 5 e 7 ela segura **uma folha verde** no alto, com as duas patinhas da frente.

| Célula | Pose |
|---|---|
| 0 | parada, de perfil, folha no alto, sorrindo |
| 1 | andando, passo A (perninhas alternadas) |
| 2 | andando, passo B |
| 3 | sentada no chão, tonta, olhinhos em espiral, folha torta (espalhada pelo vento) |
| 4 | rolando no ar, de cabeça para baixo, segurando a folha (o vento levando) |
| 5 | susto: pulinho, antenas em pé, olhos arregalados, gotinha de suor |
| 6 | tropeço: caindo de cara para a frente, **sem folha**, patinhas abertas |
| 7 | comemorando: pulinho, folha erguida, olhos fechados de alegria |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep red-brown, dark green — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. The SAME cute chibi ANT in all eight cells, at the same scale: brick-red body (#C0503A) with a slightly darker red shade, a big round head, huge glossy dark eyes with white highlights, rosy cheeks, two antennae with little round tips, a small round thorax, a round abdomen, six short little legs. In EVERY cell her head points to the LEFT (she faces LEFT), about 80% of the cell wide, and her feet touch the bottom of the cell. In cells 1 to 6 and 8 she holds ONE fresh green leaf (#7CC957) above her head with her two front legs.
1. Standing in profile facing left, leaf held up, happy smile.
2. Walking to the left, legs in step A.
3. Walking to the left, legs in step B (the opposite legs forward).
4. Sitting on the ground, dizzy, spiral eyes, the leaf crooked above her.
5. Tumbling in the air upside down, still hugging the leaf, surprised face.
6. Startled: a little jump, antennae straight up, wide eyes, one sweat drop.
7. Tripping: falling forward on her face to the left, NO leaf, legs spread.
8. Celebrating: a little hop, leaf raised high, eyes closed as two happy arcs.

DO NOT INCLUDE: ants facing right, back views, front views, different ants, ants of different sizes, ants of other colors, scary insect details, mandibles with teeth, realistic insect anatomy, more than six legs, wings, a leaf in cell 7, a crown, clothes, hats, food other than the leaf, ground, grass, shadows on the ground, text, letters, numbers, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `zuzu.png` — 3 × 2 células de 256 (768 × 512), alfa

A abelha Zuzu, que carrega as flores de volta. Amarelo-mel `#F2B53A` com listras marrom-escuras, cabeça grande, olhos enormes, duas antenas, asinhas translúcidas azul-clarinhas. Virada **de frente, um pouco para a esquerda**. Ela **não segura nada** na folha: a flor é desenhada pelo código embaixo dela, presa nas patinhas.

| Célula | Pose |
|---|---|
| 0 | voando, asas para cima, sorrindo |
| 1 | voando, asas para baixo (com a 0, faz o bater de asas) |
| 2 | carregando: patinhas de baixo esticadas para baixo, como quem segura algo pendurado |
| 3 | comemorando: olhos fechados de alegria, bracinhos para cima, brilhinhos |
| 4 | assustada: olhos arregalados, boquinha em O, gotinha de suor |
| 5 | triste: orelhinhas/antenas caídas, olhos tristes, sem lágrimas |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 256 x 256 (total 768 x 512), read left to right, top row first. The SAME cute chibi BEE named Zuzu in all six cells, at the same scale, centered in the cell, about 75% of the cell: a round honey-gold body (#F2B53A) with two soft dark-brown stripes, a big round head, huge glossy dark eyes with white highlights, rosy cheeks, two antennae with little round tips, tiny arms and legs, two small rounded translucent pale-blue wings. Facing the viewer, turned slightly to the LEFT.
1. Flying, wings up, happy smile.
2. Flying, wings down, happy smile.
3. Carrying: her lower little legs stretched straight down as if holding something hanging below her (her hands are EMPTY), focused happy face.
4. Celebrating: eyes closed as two happy arcs, little arms up, small sparkles.
5. Startled: wide eyes, small round O mouth, one sweat drop.
6. Sad: antennae drooping, sad eyes, small frown, no tears.

DO NOT INCLUDE: a flower, a honey pot or anything in her hands, a stinger pointing at the viewer, scary insect details, realistic insect anatomy, more than one bee per cell, yellow flowers, blue or pink as main colors, clothes, hats, ground, shadows, text, letters, numbers, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `flores.png` — 3 × 3 células de 256 (768 × 768), alfa

Linha = **tipo**, coluna = **cor**. Todas com o mesmo caule verde, a mesma folhinha do lado esquerdo do caule e a mesma altura; a base do caule toca o fundo da célula.

| | amarela | azul | rosa |
|---|---|---|---|
| **margarida** | 0 | 1 | 2 |
| **tulipa** | 3 | 4 | 5 |
| **estrela** | 6 | 7 | 8 |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep gold, dark navy, deep pink — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 3 rows, each cell 256 x 256 (total 768 x 768), read left to right, top row first. Nine single cute FLOWERS, seen from the FRONT and slightly from above, all at exactly the same scale: every flower has the SAME straight green stem (#5FAE4F) with ONE small rounded leaf on the LEFT side of the stem, the stem base touching the bottom of the cell, and the flower head in the upper part of the cell, about 60% of the cell wide. No faces.
ROW 1 = DAISY: eight round petals around a round center.
ROW 2 = TULIP: a closed cup-shaped bloom with three rounded points on top.
ROW 3 = STAR FLOWER: five long pointed petals like a star around a small round center.
COLUMN 1 = YELLOW petals (#FFD23F), COLUMN 2 = BLUE petals (#5AA9F0), COLUMN 3 = PINK petals (#F58CC0). The petal color fills every petal; the daisy and star centers are a soft cream (#FFF3C4) in all colors, so the petal color is the only color that changes inside a row.

DO NOT INCLUDE: faces or eyes on the flowers, pots, vases, soil, ground, grass, bouquets, more than one flower per cell, flowers of different sizes, two-colored petals, red, orange or purple petals, leaves on the right side of the stem, bees, insects, text, letters, numbers, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `pipa.png` — 4 × 2 células de 256 × 320 (1024 × 640), alfa

A esquilinha Pipa, guardiã da floresta, que abre o jogo. Laranja-castanho `#E58A3A`, barriga creme, rabo enorme e fofo em forma de ponto de interrogação, olhos enormes, uma folhinha verde presa na orelha. Virada **de frente, um pouco para a direita**. Pisa no fundo da célula.

| Célula | Pose |
|---|---|
| 0 | parada, sorrindo, patinhas juntas |
| 1 | acenando com a patinha direita |
| 2 | falando: boca aberta, uma patinha erguida explicando |
| 3 | segurando-se contra o vento: inclinada, olhos apertados, pelo e rabo soprados para a direita |
| 4 | surpresa: patinhas no rosto, olhos arregalados |
| 5 | apontando para a direita, decidida |
| 6 | comemorando: pulinho, as duas patinhas para cima, olhos fechados de alegria |
| 7 | pulando de lado, rabo esticado (para a saída) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on fur; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 320 (total 1024 x 640), read left to right, top row first. The SAME cute chibi SQUIRREL girl named Pipa in all eight cells, at the same scale: warm orange-chestnut fur (#E58A3A), a cream belly and muzzle, a big round head, huge glossy brown eyes with white highlights, rosy cheeks, round ears with one small green leaf tucked behind the left ear, a HUGE fluffy curled tail, tiny paws. She is a little forest guardian, standing on her hind legs, facing the viewer turned slightly to the RIGHT, about 85% of the cell tall, feet touching the bottom of the cell.
1. Standing, happy smile, paws together.
2. Waving with her right paw.
3. Talking: mouth open, one paw raised as if explaining.
4. Bracing against a strong wind: leaning, eyes squeezed, fur and tail blown to the right.
5. Surprised: paws on her cheeks, wide eyes.
6. Pointing to the RIGHT, determined smile.
7. Celebrating: a little hop, both paws up, eyes closed as two happy arcs.
8. Hopping sideways to the right, tail stretched out behind her.

DO NOT INCLUDE: clothes, dresses, hats, glasses, acorns or food in her paws, other animals, a face turned to the left, back views, different squirrels, yellow, blue or pink as main colors, ground, shadows, text, letters, numbers, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. `objetos.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | estaca de madeira com uma **placa quadrada em branco** (creme), vista de frente | cabeça de **linha** do canteiro; o código desenha a silhueta da flor na placa |
| 1 | estaca de madeira **lisa**, sem nada | cabeça de **coluna**, embaixo do laço |
| 2 | uma **casinha do canteiro**: um quadrado de terra fofa, afundado na grama, visto de cima a 3/4 | cada lugar da grade |
| 3 | uma **folha verde** grande e solta, deitada | a folha que a formiga deixa cair |
| 4 | uma **folhinha** de vento pequena, de ponta, curvada | as folhas que a ventania leva |
| 5 | uma **pedrinha lisa** chata, cinza-creme, vista de cima | a marca do lugar da vez na fila |
| 6 | uma **nuvenzinha de poeira** redonda e fofa | a poeira das formigas marchando |
| 7 | um **laço de fita BRANCO**, com as duas pontas soltas | amarrado no alto da estaca lisa; o código **pinta** o laço com a cor da coluna (por isso ele vem branco puro) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Cute chunky garden and forest pieces, at a similar scale, each centered in its cell.
1. A short wooden garden STAKE seen from the front, with a BLANK square cream sign board nailed on top (the board is empty, nothing drawn or written on it). About 85% of the cell tall.
2. A short PLAIN wooden garden STAKE seen from the front, with nothing on it, the same wood and height as stake 1. About 85% of the cell tall.
3. One garden PLOT seen from ABOVE at a 3/4 angle (camera about 40 degrees above): a square patch of soft dark-brown tilled soil with rounded corners, slightly sunken into a thin rim of grass, empty. About 85% of the cell wide.
4. One big fresh green LEAF (#7CC957) lying flat, with a curved middle vein. About 70% of the cell.
5. One small curved green leaf tumbling in the wind, pointed tip, lighter green. About 40% of the cell.
6. One small smooth flat PEBBLE seen from above, pale grey-cream, oval. About 45% of the cell wide.
7. One small round fluffy puff of light-brown DUST, three soft bumps. About 50% of the cell.
8. One ribbon BOW in pure WHITE (#FFFFFF) with soft light-grey shading only, two loops and two short loose tails, seen from the front. About 55% of the cell wide.

DO NOT INCLUDE: text, letters, numbers, drawings or icons on the sign board, colors on the ribbon bow other than white and light grey, flowers on the stakes, flowers in the plot, seeds, sprouts, bright yellow, blue or pink petals, insects, characters, faces, ground under the pieces, shadows on the ground, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 10. `cover-ventania-na-floresta.png` — 1672 × 941, opaco, capa

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft pastel palette (mint, leaf green, cream, warm brown, honey gold) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, slimes, rainbow or framing.

A game cover illustration, 1672 x 941, landscape, painted edge to edge, NO white sticker keyline here — this is a full scene. At the TOP CENTER, a big title written exactly "Ventania na Floresta" in chunky rounded bubble letters in fresh leaf green and cream, with a thick dark-green outline, perfectly spelled. Below it: a sunny forest clearing where a playful gust of WIND (soft swirling white wind ribbons and tumbling green leaves) blows from left to right. PIPA, a cute chibi orange-chestnut squirrel girl with a cream belly, huge fluffy curled tail and a green leaf behind her ear, braces against the wind in the center with a determined smile. Around her, cute brick-red chibi ANTS holding green leaves tumble through the air, and ZUZU, a cute honey-gold chibi bee with dark-brown stripes, flies carrying a yellow daisy; a blue tulip and a pink daisy fly in the wind. In the lower left, a little anthill with a dirt trail; in the upper right, a golden beehive hanging from a tree branch. Bright, cheerful, adventurous mood; the main action must read at thumbnail size.

DO NOT INCLUDE: any other text, letters or numbers besides the title, misspelled title, logos, extra characters, people, scary storm, dark clouds, lightning, rain, night, sad faces, scary insects, realistic insect anatomy, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 11. As texturas do N2 e do N3

Pedido do usuário (20/10/2026), junto com o N2 e o N3 (PLANEJAMENTO §11). As mesmas regras do §2: nenhum texto na arte (os nomes das casas, as falas e o número/palavra dos pedaços soltos são do código, escritos sobre uma área lisa), anexar `references/35-chibi-voador.webp` em toda geração, cada prompt inteiro.

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-ninhos.png` | — | — | 1672 × 941 | opaco | FICHA: o galho grosso onde ficam os ninhos |
| `bg-teia.png` | — | — | 1672 × 941 | opaco | TEIA: o canto entre dois galhos |
| `bg-redemoinho.png` | — | — | 1672 × 941 | opaco | N3: a clareira do redemoinho |
| `filhotes.png` | 3 × 3 | 256 | 768 × 768 | sim | filhote: linha = cor da PENA, coluna = cor do BICO |
| `tece.png` | 3 × 2 | 256 | 768 × 512 | sim | a aranha Tecê em 6 poses |
| `bichos.png` | 4 × 2 | 256 | 1024 × 512 | sim | os 4 bichinhos da teia, contente e assustado |
| `objetos2.png` | 4 × 2 | 256 | 1024 × 512 | sim | ninho, ficha, galhinho, topete, ícones dos rótulos, montinho de folhas |
| `casas.png` | 3 × 2 | 256 | 768 × 512 | sim | as 5 casas do N3 (a 6ª célula fica vazia) |
| `pedacos.png` | 4 × 3 | 256 | 1024 × 768 | sim | os 11 pedaços do redemoinho (a 12ª fica vazia) |
| `bg-lagoa.png` | — | — | 1672 × 941 | opaco | N3 novo, PEIXES: a lagoa com a margem de areia (§11.11) |
| `bg-noite.png` | — | — | 1672 × 941 | opaco | N3 novo, VAGA-LUMES: a clareira à noite (§11.12) |
| `turma.png` | 4 × 4 | 256 | 1024 × 1024 | sim | N3 novo: patos, caracol, pedrinha, cogumelos, vaga-lumes, concha, ícones, cesta (§11.13) |
| `peixes.png` | 3 × 3 | 256 | 768 × 768 | sim | N3 novo: peixe, linha = cor do CORPO, coluna = cor do RABO (§11.14) |

**O N3 foi refeito em 21/10/2026** (redemoinho → cinco turmas da floresta: patinhos, cogumelos, peixes, vaga-lumes, caracol). `casas.png` e `pedacos.png` ficaram sem uso; o N3 usa `bg-redemoinho` (patos, cogumelos, caracol), `bg-lagoa`, `bg-noite`, `turma` e `peixes`.

**Cores fixas do N2:** a PENA e o BICO dos filhotes usam só **laranja `#F08A3C`**, **verde `#5DBB63`** e **roxo `#9B7BD8`**, chapados e bem distintos. Nada mais na cena do N2 usa essas três cores como cor principal.

### 11.1 `bg-ninhos.png` — 1672 × 941, opaco

| Região (% da imagem) | O que tem |
|---|---|
| alto, 0–13 % | copa de árvore calma |
| 8–96 % da largura, 34–46 % da altura | um **galho grosso** atravessando quase reto, com a parte de cima lisa (os ninhos pousam ali) |
| 10–92 % da largura, 47–74 % da altura | ar calmo, **vazio** (as fichas ficam penduradas ali) |
| 30–70 % da largura, 80–96 % da altura | um **montinho de folhas secas** no chão (os filhotes caem nele) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (mint, leaf green, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, NO white sticker keyline here — this is a full scene, not a sticker. Inside a friendly sunny tree, seen from the side with a gentle 3/4 angle, crisp shapes, no painterly brushwork. The top 13% is calm soft green treetop leaves. A THICK BROWN TREE BRANCH crosses the picture almost straight from 8% to 96% of the width, between 34% and 46% of the height, its top side smooth and flat enough for nests to sit on (but EMPTY, no nests). Below the branch, from 10% to 92% of the width and from 47% to 74% of the height, is calm open air with soft blurred leaves far behind, completely EMPTY. On the ground at the bottom, from 30% to 70% of the width and from 80% to 96% of the height, a soft cozy PILE of dry fallen leaves in warm browns and soft greens. Only along the left and right edges: leaves, small twigs, patches of sky between the leaves. Bright, cheerful daylight.

DO NOT INCLUDE: nests, birds, eggs, chicks, cards, papers, strings, ropes, flowers, orange, bright green or purple as the main color of anything small, insects, objects on the branch, objects in the empty air, text, letters, numbers, signs, people, characters, animals, strong perspective, horizon, night, scary or dark elements, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.2 `bg-teia.png` — 1672 × 941, opaco

| Região (% da imagem) | O que tem |
|---|---|
| alto, 0–13 % | folhas calmas |
| lados | dois galhos grossos, à esquerda (0–14 %) e à direita (86–100 %), formando um canto |
| 16–84 % da largura, 18–92 % da altura | ar calmo, liso, **vazio**, verde-sombra um pouco mais escuro, para os fios brancos aparecerem |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (mint, leaf green, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, NO white sticker keyline here — this is a full scene, not a sticker. A shady, cozy nook between two thick tree branches, seen from the front, crisp shapes, no painterly brushwork. A thick brown branch rises on the LEFT edge (0% to 14% of the width) and another on the RIGHT edge (86% to 100% of the width), framing the nook; the top 13% is calm overhanging leaves. The big middle area (from 16% to 84% of the width, from 18% to 92% of the height) is calm, smooth, EMPTY air in a soft medium shade-green with very soft blurred leaves far behind, slightly darker than the edges so thin white threads would stand out on it. A few small leaves only at the corners. Gentle dappled daylight.

DO NOT INCLUDE: spider webs, threads, strings, spiders, insects, bugs, ladybugs, butterflies, crickets, snails, twigs sticking into the middle, objects in the middle area, flowers, text, letters, numbers, signs, people, characters, animals, strong perspective, horizon, night, scary or dark elements, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.3 `bg-redemoinho.png` — 1672 × 941, opaco

| Região (% da imagem) | O que tem |
|---|---|
| alto, 0–13 % | céu e copas calmas |
| 25–75 % da largura, 18–62 % da altura | clareira aberta, calma, **vazia** (o redemoinho é do código) |
| 4–96 % da largura, 70–96 % da altura | grama baixa e lisa, **vazia** (as casas ficam ali, em fila) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (mint, leaf green, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, NO white sticker keyline here — this is a full scene, not a sticker. A wide, sunny forest clearing seen from a gentle 3/4 angle, crisp shapes, no painterly brushwork. The top 13% is a soft pale sky with calm round treetops. The middle of the picture (from 25% to 75% of the width, from 18% to 62% of the height) is open calm air over a soft lawn, completely EMPTY. The bottom band (from 4% to 96% of the width, from 70% to 96% of the height) is short, smooth, even mint-green grass, completely EMPTY and flat. Along the left and right edges only: round friendly trees, round bushes, smooth pebbles, small brown mushrooms. Bright, breezy, cheerful daylight with a few tiny leaves drifting.

DO NOT INCLUDE: tornado, whirlwind, wind swirls, storm, dark clouds, anthills, beehives, nests, spider webs, baskets, flower beds, flowers in yellow, blue or pink, objects in the middle, objects on the bottom band, text, letters, numbers, signs, people, characters, animals, strong perspective, horizon, night, scary or dark elements, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.4 `filhotes.png` — 3 × 3 células de 256 (768 × 768), alfa

Linha = cor da **pena** (o corpo todo), coluna = cor do **bico**. O mesmo filhote nas nove células, mesma pose, **sem topete** (o topete é peça à parte, `objetos2` célula 3, que o código põe na cabeça e pinta com a cor da pena).

| | bico laranja | bico verde | bico roxo |
|---|---|---|---|
| **pena laranja** | 0 | 1 | 2 |
| **pena verde** | 3 | 4 | 5 |
| **pena roxa** | 6 | 7 | 8 |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 3 rows, each cell 256 x 256 (total 768 x 768), read left to right, top row first. The SAME cute round chibi BABY BIRD (chick) in all nine cells, in exactly the same pose and scale: a round fluffy body sitting down, tiny wings, a big round head with huge glossy dark eyes with white highlights and rosy cheeks, a smooth round head top with NO tuft, a small pointed BEAK, two tiny feet. Facing the viewer, turned slightly to the LEFT, centered, about 70% of the cell, feet near the bottom of the cell.
ROW 1 = ORANGE feathers (#F08A3C) on the whole body and wings, ROW 2 = GREEN feathers (#5DBB63), ROW 3 = PURPLE feathers (#9B7BD8).
COLUMN 1 = ORANGE beak (#F08A3C), COLUMN 2 = GREEN beak (#5DBB63), COLUMN 3 = PURPLE beak (#9B7BD8).
The beak is clearly visible and big enough to read its color at a glance, and it keeps its color even when it matches the body: give the beak a thin darker outline so an orange beak on an orange body still reads as a beak. The belly is a soft cream in all cells; everything else follows the row color.

DO NOT INCLUDE: head tufts, crests, feathers sticking up on the head, different poses, different sizes, yellow beaks, other feather colors, two-colored bodies, patterns, nests, eggs, branches, adult birds, text, letters, numbers, items crossing cell borders, items cut by the cell edge, ground, shadows on the ground, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.5 `tece.png` — 3 × 2 células de 256 (768 × 512), alfa

A aranha Tecê, fofa e nada assustadora.

| Célula | Pose |
|---|---|
| 0 | parada, sorrindo |
| 1 | pendurada de cabeça para baixo num fio que sobe e termina numa bolinha no alto da célula |
| 2 | segurando a ponta de um fio com as patinhas da frente, puxando |
| 3 | comemorando |
| 4 | despencando, assustada, girando |
| 5 | tonta, sentada, olhinhos em espiral |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 256 x 256 (total 768 x 512), read left to right, top row first. The SAME cute, friendly, NOT scary chibi SPIDER named Tecê in all six cells, at the same scale, centered, about 70% of the cell: a soft round lilac-grey body (#A99BC4) with a cream belly spot, a big round head, huge glossy dark eyes with white highlights, rosy cheeks, a tiny smile, eight short chubby rounded little legs.
1. Standing, happy smile, facing the viewer.
2. Hanging upside-down from a single white thread that goes straight up and ends in a small round dot near the top of the cell, happy.
3. Holding the end of a short white thread with her two front legs, pulling it to the side, determined.
4. Celebrating, front legs up, eyes closed as happy arcs, little sparkles.
5. Falling and spinning, startled wide eyes, legs flailing.
6. Sitting dizzy, spiral eyes.

DO NOT INCLUDE: scary spiders, realistic spider anatomy, fangs, hairy legs, red eyes, many eyes, webs, flies, insects, black body, text, letters, numbers, items crossing cell borders, items cut by the cell edge, ground, shadows on the ground, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.6 `bichos.png` — 4 × 2 células de 256 (1024 × 512), alfa

Em cima, os quatro bichinhos da teia contentes; embaixo, os mesmos assustados. Cada um com uma cor própria bem diferente, para a criança dizer quem é quem sem ler.

| Célula | Bicho |
|---|---|
| 0 / 4 | joaninha vermelha com pintas pretas |
| 1 / 5 | borboleta azul-celeste |
| 2 / 6 | grilo verde-limão |
| 3 / 7 | caracol de casca marrom em espiral |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Four cute chibi bugs with big glossy eyes and rosy cheeks, each centered in its cell at about 65% of the cell, all at a similar size, each with its own clearly different main color.
TOP ROW, happy and calm: 1. a round red LADYBUG with black spots; 2. a sky-blue BUTTERFLY with round wings; 3. a lime-green CRICKET with long back legs; 4. a SNAIL with a brown spiral shell and a cream body.
BOTTOM ROW, the SAME four bugs in the same order, startled: a small jump, wide eyes, a tiny sweat drop.

DO NOT INCLUDE: scary bugs, realistic insect anatomy, spiders, ants, bees, flies, webs, threads, flowers, leaves under them, branches, text, letters, numbers, items crossing cell borders, items cut by the cell edge, ground, shadows on the ground, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.7 `objetos2.png` — 4 × 2 células de 256 (1024 × 512), alfa

**Ninho em camadas:** `ninho.png`, fornecido pelo usuário, é uma folha de **1 × 2 células de 256 × 256** (256 × 512). Frame 1: parte de trás; frame 2: borda da frente. O N2 desenha o pintinho entre as duas camadas. As células mantêm o canvas completo, sem recortes independentes, para conservar o alinhamento. O ninho de `objetos2` fica como reserva.

| Célula | Peça | Uso |
|---|---|---|
| 0 | **ninho** de gravetos, vazio, de lado a 3/4 | cada ninho no galho |
| 1 | **ficha**: cartãozinho creme em branco, furinho e barbante no alto | a ficha de cada ninho; o código desenha as linhas |
| 2 | **galhinho** curto com uma folhinha | onde cada bicho da teia fica |
| 3 | **topete** de três peninhas, **branco** | o código pinta e põe na cabeça do filhote e na ficha |
| 4 | ícone **PENA**, cinza-chumbo | rótulo da 1ª linha da ficha |
| 5 | ícone **BICO**, cinza-chumbo | rótulo da 2ª linha |
| 6 | ícone **TOPETE** (cabecinha de perfil com tufo), cinza-chumbo | rótulo da 3ª linha |
| 7 | **montinho de folhas** secas | onde os filhotes caem |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Cute chunky forest pieces, each centered in its cell.
1. A round cozy bird NEST made of woven brown twigs, EMPTY, seen from the side at a 3/4 angle so its open top is visible. About 80% of the cell wide.
2. A small blank cream PAPER CARD, portrait, with rounded corners, a little punched hole at the top and a short loop of brown string coming out of the hole. The card is completely EMPTY. About 60% of the cell wide, 80% tall.
3. A short brown TWIG sticking up at a slight angle, with one small green leaf. About 70% of the cell tall.
4. A little bird head TUFT: three soft feathers standing up in a fan, pure WHITE (#FFFFFF) with light-grey shading only. About 40% of the cell.
5. A simple FEATHER icon, flat, dark slate grey (#5B6470), no other color. About 55% of the cell.
6. A simple bird BEAK icon in profile (a small pointed triangle with a rounded base), flat, dark slate grey (#5B6470). About 45% of the cell.
7. A simple icon of a small bird HEAD in profile WITH a three-feather tuft on top, flat, dark slate grey (#5B6470). About 55% of the cell.
8. A soft cozy PILE of dry fallen leaves in warm browns and soft greens. About 85% of the cell wide.

DO NOT INCLUDE: text, letters, numbers, writing or drawings on the card, eggs, birds, chicks, colored tufts, colored icons, orange, bright green or purple, insects, characters, faces, items crossing cell borders, items cut by the cell edge, ground, shadows on the ground, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.8 `casas.png` — 3 × 2 células de 256 (768 × 512), alfa

As cinco casas do N3, cada uma lembrando **a forma** da sua organização. A 6ª célula fica **vazia**.

| Célula | Casa | Lembra |
|---|---|---|
| 0 | formigueiro com 3 formiguinhas em fila na porta, da maior para a menor | FILA |
| 1 | canteiro 2 × 2 com 4 florzinhas | GRADE |
| 2 | ninho com uma fichinha pendurada (duas linhas de ícone + cor) | FICHA |
| 3 | teia redonda com três pontinhos ligados | TEIA |
| 4 | cesta de vime aberta, vazia | SOLTO |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 256 x 256 (total 768 x 512), read left to right, top row first. Five cute chunky "homes", each centered in its cell at about 80% of the cell, all at a similar size, each sitting on its own flat base at the bottom of the cell; the SIXTH cell (bottom right) is completely EMPTY and transparent.
1. A round brown ANTHILL with a dark door, and three tiny cute brick-red ants standing in a LINE at the door from the BIGGEST to the SMALLEST.
2. A tiny square GARDEN BED of dark soil split in a 2 x 2 grid by little wooden borders, with one small flower in each square: top row a yellow daisy and a blue daisy, bottom row a yellow tulip and a blue tulip.
3. A round twig NEST with a small cream card hanging below it on a string; the card shows two rows, each with a small grey icon on the left and a round color dot on the right (orange, green).
4. A round silky SPIDER WEB in a small twig frame, with three little round dots on it joined by white threads.
5. An open woven wicker BASKET, warm honey color, EMPTY.
6. (empty cell)

DO NOT INCLUDE: text, letters, numbers, words, labels, characters with big faces (the tiny ants are fine), spiders, birds, eggs, extra objects, objects in the sixth cell, items crossing cell borders, items cut by the cell edge, ground, shadows on the ground, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.9 `pedacos.png` — 4 × 3 células de 256 (1024 × 768), alfa

Os pedaços do redemoinho: objetinhos da floresta que mostram a forma da organização sem legenda. Onde o pedaço é um número ou uma palavra, a área fica **lisa** e o código escreve. A 12ª célula fica **vazia**.

| Célula | Pedaço | Casa |
|---|---|---|
| 0 | 3 pedrinhas em fila, da maior para a menor, com setinhas | FILA |
| 1 | a lista da Pipa: folha com noz, bolota e semente uma embaixo da outra, com setinhas | FILA |
| 2 | gradinha 2 × 2 de madeira com uma florzinha em cada quadrado | GRADE |
| 3 | o tempo da semana: tabelinha 3 × 2 (sol e nuvem de chuva à esquerda) com ✓ em alguns cruzamentos | GRADE |
| 4 | cartãozinho: ícone de pena + bolinha laranja, ícone de bico + bolinha verde | FICHA |
| 5 | crachá do grilo: carinha do grilo, ícone de pata + **área lisa** (o código escreve 6), ícone de gota + bolinha verde | FICHA |
| 6 | joaninha e caracol ligados por um fio | TEIA |
| 7 | mapinha: 4 pedrinhas ligadas por trilhas tracejadas | TEIA |
| 8 | uma pedrinha lisa sozinha (o código escreve 7) | SOLTO |
| 9 | um balão de fala sozinho, vazio (o código escreve OI) | SOLTO |
| 10 | um solzinho nascendo atrás de um morrinho, com um ✓ verde | SOLTO |
| 11 | vazia | — |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 3 rows, each cell 256 x 256 (total 1024 x 768), read left to right, top row first. Eleven cute chunky little "pieces", each centered in its cell at about 75% of the cell, all at a similar size; the TWELFTH cell (bottom right) is completely EMPTY and transparent.
1. Three smooth pebbles in a straight row from the BIGGEST to the SMALLEST, with tiny arrows between them.
2. A long green leaf used as a list: a hazelnut, an acorn and a seed drawn ONE BELOW THE OTHER on it, with tiny down arrows between them.
3. A tiny 2 x 2 wooden grid frame with one small flower in each square (yellow daisy, blue daisy, yellow tulip, blue tulip).
4. A tiny weather chart on a wooden board: 3 columns and 2 rows of squares; on the left of the top row a little sun, on the left of the bottom row a little rain cloud; small green check marks in some of the squares.
5. A small cream card with two rows: a grey feather icon followed by an orange dot; a grey beak icon followed by a green dot.
6. A small cream badge card with a cute cricket face at the top and two rows below: a grey paw icon followed by an EMPTY smooth white rounded box; a grey paint-drop icon followed by a green dot.
7. A ladybug and a snail joined by one white thread.
8. A tiny map: four pebbles spread apart, joined by dashed dirt trails.
9. ONE big smooth flat grey-cream PEBBLE alone, with a smooth EMPTY face.
10. ONE empty white SPEECH BALLOON alone, rounded, with a small tail.
11. ONE little SUN rising behind a small green hill, with a big green check mark next to it.
12. (empty cell)

DO NOT INCLUDE: text, letters, numbers, words, writing inside the balloon, writing on the pebble, writing in the badge box, characters with big faces (the tiny cricket face on the badge is fine), extra objects, objects in the twelfth cell, items crossing cell borders, items cut by the cell edge, ground, shadows on the ground, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.11 `bg-lagoa.png` — 1672 × 941, opaco

Fase dos PEIXES: cada peixe mora numa concha com uma ficha embaixo; as conchas ficam em fila na areia molhada, e a água fica acima delas.

| Região (% da imagem) | O que tem |
|---|---|
| alto, 0–15 % | céu e copas, a margem de longe |
| 15–65 % da altura | água da lagoa, calma e clara, **vazia** (os peixes nadam ali) |
| 65–100 % da altura, 10–90 % da largura | margem de areia molhada, lisa, **vazia** (conchas e fichas ficam ali) |
| bordas esquerda e direita | taboas, folhas de junco, pedrinhas |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (mint, leaf green, cream, warm brown, soft sky blue) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, NO white sticker keyline here — this is a full scene, not a sticker. A calm forest POND seen from a gentle 3/4 angle, crisp shapes, no painterly brushwork. The top 15% is the far shore: a soft pale sky and calm round treetops. From 15% to 65% of the height, the pond water fills the whole width: clear soft sky-blue water (#86CDEA) with a slightly deeper band in the middle, a few gentle ripple rings and small white sparkles, completely EMPTY. From 65% down to the bottom, between 10% and 90% of the width, a smooth light SAND shore (wet beige sand), flat and completely EMPTY. Only on the left and right edges: cattails, reeds, round lily leaves near the shore, smooth pebbles. Bright, cheerful daylight.

DO NOT INCLUDE: fish, frogs, ducks, birds, shells, nests, lily pads in the middle of the water, objects in the middle of the water, objects on the sand band, boats, bridges, docks, text, letters, numbers, signs, people, characters, animals, orange, green or purple fish-like shapes, strong perspective, night, storm, scary or dark elements, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.12 `bg-noite.png` — 1672 × 941, opaco

Fase dos VAGA-LUMES: eles brilham numa roda no meio da tela e os fios de luz são do código. O fundo é **escuro e calmo** para as quatro luzes (amarela, verde, azul, rosa) saltarem.

| Região (% da imagem) | O que tem |
|---|---|
| alto, 0–40 % | céu azul-noite com estrelinhas e uma lua crescente no canto direito |
| 20–80 % da largura, 15–80 % da altura | clareira escura e lisa, **vazia** (a roda dos vaga-lumes) |
| 83–100 % da altura | grama escura baixa |
| bordas esquerda e direita | troncos e copas em silhueta azul-escura |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep navy, dark indigo, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, NO white sticker keyline here — this is a full scene, not a sticker. A cozy, friendly forest clearing at NIGHT, crisp shapes, no painterly brushwork. Deep calm navy-blue sky (#223156) with small white stars and a soft cream crescent moon in the top right corner. Along the left and right edges and along the top: tree trunks and round treetops as darker blue silhouettes (#141D38). The center (from 20% to 80% of the width, from 15% to 80% of the height) is open dark night air over a soft lawn, smooth and completely EMPTY, with no glowing things. The bottom 17% is short dark blue-green grass. Peaceful, sleepy, not scary.

DO NOT INCLUDE: fireflies, glowing dots, glowing lights, lanterns, campfire, light beams, glowing mushrooms, yellow, green, light-blue or pink glows, eyes in the dark, owls, animals, characters, objects in the center, text, letters, numbers, signs, people, scary or spooky elements, ghosts, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.13 `turma.png` — 4 × 4 células de 256 (1024 × 1024), alfa

A turma do N3 numa folha só. Os bichos pisam no fundo da célula; o resto fica centrado.

| Célula | Peça | Direção / detalhe |
|---|---|---|
| 0 | pata-mãe, branca-creme, bico e patas laranja | virada para a **esquerda** (os filhotes seguem atrás, à direita) |
| 1 | patinho amarelo com tufinho na cabeça | virado para a **esquerda**; o código faz três tamanhos |
| 2 | caracol de casca marrom em espiral | virado para a **direita** |
| 3 | pedrinha lisa, cinza-claro, achatada | **lisa**: o código escreve um número em cima |
| 4 | cogumelo de chapéu **redondo vermelho** `#E8574A`, com carinha no pé | |
| 5 | cogumelo de chapéu **redondo azul** `#5AA9F0` | o mesmo cogumelo, só o chapéu muda |
| 6 | cogumelo de chapéu **pontudo vermelho** | chapéu em cone |
| 7 | cogumelo de chapéu **pontudo azul** | |
| 8 | vaga-lume, barriga acesa **amarela** `#FFE45C` | o mesmo vaga-lume nas 4, só a luz muda |
| 9 | vaga-lume, luz **verde** `#8FF06A` | |
| 10 | vaga-lume, luz **azul** `#6FD2FF` | |
| 11 | vaga-lume, luz **rosa** `#FF8FD2` | |
| 12 | concha aberta em leque, rosa-pêssego | a "casa" do peixe |
| 13 | ícone cinza: corpo de peixe (oval com olho, sem rabo) | rótulo CORPO da ficha |
| 14 | ícone cinza: rabo de peixe sozinho (barbatana em V) | rótulo RABO da ficha |
| 15 | cesta de vime aberta, vazia | |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; rosy cheeks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 4 rows, each cell 256 x 256 (total 1024 x 1024), read left to right, top row first. Sixteen separate pieces, one per cell, each about 75% of its cell with clear empty margin; animals stand with their feet near the bottom of the cell, objects are centered.
ROW 1:
1. A MOTHER DUCK, cream-white feathers, orange beak and orange webbed feet, side view, walking, FACING LEFT, proud happy face.
2. A tiny round yellow DUCKLING with a little tuft on the head, orange beak and feet, side view, FACING LEFT, happy.
3. A cute SNAIL with a brown spiral shell and a cream body, side view, FACING RIGHT, happy.
4. A plain smooth flat light-grey PEBBLE, oval, seen from the front, with an EMPTY smooth face (nothing drawn on it).
ROW 2 — the SAME cute mushroom with a cream stem that has a tiny happy face (two dots and a smile), only the cap changes:
5. ROUND dome cap, RED (#E8574A) with white spots.
6. ROUND dome cap, BLUE (#5AA9F0) with white spots.
7. POINTED cone cap, RED (#E8574A) with white spots.
8. POINTED cone cap, BLUE (#5AA9F0) with white spots.
ROW 3 — the SAME cute chibi FIREFLY in all four, front view, chocolate-brown body, big glossy eyes, two little antennas, clear white wings, its round BELLY LANTERN filled with a flat bright color and NO halo or glow drawn around it (the game adds the glow); only the lantern color changes:
9. YELLOW light (#FFE45C). 10. GREEN light (#8FF06A). 11. LIGHT-BLUE light (#6FD2FF). 12. PINK light (#FF8FD2).
ROW 4:
13. An open fan-shaped SEASHELL, soft peach-pink (#F7C9B0), ribbed, seen from the front, like a little house.
14. A flat solid GREY icon (#8A9095) of a fish BODY only: a plain oval with one eye dot, NO tail, NO fins, NO face details.
15. A flat solid GREY icon (#8A9095) of a fish TAIL only: one V-shaped tail fin, nothing else.
16. An open woven wicker BASKET with a handle, warm honey color, EMPTY.

DO NOT INCLUDE: text, letters, numbers, writing on the pebble, colored icons in cells 14 and 15, faces on the icons, different mushroom stems, different firefly bodies, scary bugs, realistic insect anatomy, extra animals, fish, ponds, water, grass under the pieces, items crossing cell borders, items cut by the cell edge, ground, shadows on the ground, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.14 `peixes.png` — 3 × 3 células de 256 (768 × 768), alfa

Linha = cor do **corpo**, coluna = cor do **rabo**; o mesmo peixe nas nove, virado para a **esquerda**. São as cores do N2 (laranja, verde, roxo), e de novo é o rótulo da ficha que decide: *corpo laranja + rabo verde* é outro peixe que *corpo verde + rabo laranja*.

| | rabo laranja | rabo verde | rabo roxo |
|---|---|---|---|
| **corpo laranja** | 0 | 1 | 2 |
| **corpo verde** | 3 | 4 | 5 |
| **corpo roxo** | 6 | 7 | 8 |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark green, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; rosy cheeks; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 3 rows, each cell 256 x 256 (total 768 x 768), read left to right, top row first. The SAME cute round chibi FISH in all nine cells, in exactly the same pose and scale, side view, FACING LEFT, centered, about 75% of the cell width: a round chubby body with a small top fin, a big glossy eye on the left side, rosy cheek, small happy smile, and a big clearly separate V-shaped TAIL fin on the right.
ROW 1 = ORANGE body (#F08A3C), ROW 2 = GREEN body (#5DBB63), ROW 3 = PURPLE body (#9B7BD8). The small top fin follows the body color.
COLUMN 1 = ORANGE tail (#F08A3C), COLUMN 2 = GREEN tail (#5DBB63), COLUMN 3 = PURPLE tail (#9B7BD8).
The tail is big enough to read its color at a glance and keeps its color even when it matches the body: a thin darker outline separates the tail from the body so an orange tail on an orange body still reads as a tail. No stripes, no patterns, no belly of another color.

DO NOT INCLUDE: stripes, spots, patterns, two-colored bodies, other colors, yellow or blue fish, different poses, different sizes, fish facing right, bubbles, water, seaweed, shells, text, letters, numbers, items crossing cell borders, items cut by the cell edge, ground, shadows, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 11.10 Na entrega (N2/N3)

- Filhotes: conferir a cor da pena e do bico célula a célula contra a tabela; nenhum filhote com tufo.
- Casas e pedaços: a célula vazia de fato vazia; nada escrito.
- Medir nos fundos o galho, o montinho de folhas, o canto da teia e a faixa das casas, e ajustar `data/layout.ts`.

---

## 12. Na entrega (N1)

- Conferir se a formiga está virada para a **esquerda** em todas as células, e se só a célula 6 está sem folha.
- Conferir as três cores das flores contra os hex do §2, e se o miolo creme é igual nas três cores.
- Conferir se o caule das flores toca o fundo da célula em todas: é por ali que o código as "planta" na casinha.
- Medir nos fundos onde ficaram o formigueiro, a trilha, a colmeia e o gramado vazio, e ajustar `TRAIL`, `LINE`, `GRID` e `BEE` em `data/layout.ts`. A arte nunca cai exatamente nas porcentagens pedidas.
- Limpar o alfa baixo da borda antes de medir; o código mede cada célula com alfa > 96.
