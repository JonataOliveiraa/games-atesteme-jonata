# Fábrica de Estampas — texturas

Destino: `src/assets/games/EF04CO03/fabrica-de-estampas/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§6 tela, §7 pedido, §8 tecido, §9 pergunta e varal).

**Com imagem de referência:** anexe em **toda geração** a `references/35-chibi-voador.webp` (os quatro meninos chibi voando entre nuvens, com slimes e arco-íris). Escolha do usuário em 13/10/2026, a mesma linha da Etiqueta Certa. Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*. O elenco da referência vai no negativo de todos os prompts. Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-estamparia.png` | — | — | 1672 × 941 (escalado para 1280 × 720) | opaco | a estamparia de frente, com o meio livre para o pedido, a esteira e os carimbos |
| `esteira.png` | 3 × 2 | 320 | 960 × 640 | sim | pedaço de esteira, janela de estampa, rolo liso, rolo fechado, corda do varal, gancho |
| `estampas.png` | 4 × 3 | 256 | 1024 × 768 | sim | 3 estampas, quadradinho de tecido, 3 estampas borradas, barra do tecido, botão, casa do botão, agulha, prendedor |
| `carimbos.png` | 3 × 2 | 320 | 960 × 640 | sim | 3 carimbos de madeira, 3 almofadas de tinta |
| `ui.png` | 3 × 2 | 384 | 1152 × 768 | sim | papel do pedido, moldura azul, moldura lilás, aba azul, aba lilás, etiqueta de resposta |
| `estampadora.png` | 2 × 2 | 400 × 520 | 800 × 1040 | sim | **opcional**: a estampadora em 4 poses |
| `cover-fabrica-de-estampas.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem e o conteúdo de cada célula não podem mudar.

**Para o N1 bastam:** o fundo, a esteira, as estampas, os carimbos e a `ui`. A estampadora é acabamento (sem ela o jogo funciona igual), e a capa vem por último.

## 2. Regras deste jogo

- **Nenhum texto na arte.** O número das abas (`3×`), a pergunta e os números das etiquetas são escritos pelo código. O papel, as abas e as etiquetas vêm **em branco**. A única exceção é o título da capa.
- **Três figuras, três silhuetas:** flor de 5 pétalas redondas (rosa), estrela de 5 pontas arredondadas (amarelo-ouro), coração (vermelho-coral). A estampa é a mesma em todo lugar: no tecido, no pedido, no carimbo e na pergunta.
- **Nada de flor, estrela ou coração no cenário**, nem como enfeite. Os tecidos da decoração são lisos, listrados ou de bolinha. Uma figura do jogo solta no fundo confundiria a leitura do pedido.
- **As molduras são azul e lilás**, cores que nenhuma figura usa. Elas são esticadas pelo código (`NineSlice`): espessura igual em toda a volta e nada no meio dos lados.
- **A vista é de frente, um pouco de cima**, igual em todas as folhas.
- Peça solta e centrada na célula, com cerca de 8 % de margem (menos as peças que vão de borda a borda, ditas em cada folha).

---

## 3. `bg-estamparia.png` — 1672 × 941, opaco

Uma estamparia artesanal aconchegante, vista de frente. O código põe o pedido, a esteira, o tecido, os carimbos e o varal por cima.

| Região (na escala 1280 × 720) | O que tem |
|---|---|
| alto, y 0–84 | parede creme lisa; o HUD fica ali. O canto de cima à direita (x 1150–1280) fica calmo, porque o `?` está lá |
| **centro do alto, x 290–990, y 78–245** | **parede lisa e vazia**: o papel do pedido fica por cima |
| cantos do alto, x 0–280 e x 1000–1280, y 84–320 | prateleiras de madeira com rolos de tecido liso, listrado e de bolinha, potes de tinta pastel, carretéis e uma plantinha; uma janela com sol à esquerda |
| **faixa do meio, y 300–450** | a borda de trás de um balcão comprido de madeira clara, **lisa e vazia**: a esteira passa ali |
| **bancada da frente, y 450–720** | tampo de madeira clara visto um pouco de cima; o meio (x 260–1020) **liso e vazio**: carimbos e etiquetas |
| canto de baixo à esquerda, x 0–250, y 440–720 | liso e calmo (a estampadora fica ali quando existir) |
| canto de baixo à direita, x 1030–1280, y 470–720 | uma cestinha com tecidos dobrados lisos e uns carretéis |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, the inside of a cute, cozy artisan fabric-stamping workshop, seen from the FRONT at eye level with a slight downward tilt (no strong perspective). The top 12% is a plain warm cream wall. The upper-CENTER area (from 23% to 77% of the width, from 11% to 34% of the height) is a plain, calm, completely EMPTY cream wall (a paper order will be pinned there). In the upper-left and upper-right areas (the outer 22% of the width on each side, from 12% to 44% of the height): rounded wooden shelves with rolled bolts of PLAIN, STRIPED and POLKA-DOT fabric in pastel colors, little glass jars of pastel ink, spools of thread and one small potted plant; a tall window with soft morning sunlight on the left side. The very top-right corner stays plain and calm. Across the middle of the picture (from 42% to 62% of the height, full width) runs the back edge of a long, plain light wooden counter, completely EMPTY (a conveyor belt will be placed on it). The bottom part (from 62% to 100% of the height) is the top of a front workbench of light warm wood seen slightly from above, plain and EMPTY in the center (from 20% to 80% of the width) and calm in the bottom-left corner; in the bottom-right corner, a small woven basket with folded plain fabrics and a few spools of thread. Bright, friendly, cozy mood.

DO NOT INCLUDE: flowers, stars or hearts anywhere (no flower, star or heart patterns on fabrics, jars, walls or decorations, no flower plants with blossoms), printed patterns with figures, conveyor belts, machines in the middle, stamps, ink pads, people, characters, animals, text, letters, numbers, signs with words, labels, logos, brand marks, strong perspective, top-down view, 3D render look, night, scary or dark elements, red danger colors, clutter in the empty areas, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `esteira.png` — 3 × 2 células de 320 (960 × 640), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **pedaço de esteira** na horizontal: lona cinza-azulada com frisos finos, entre dois trilhos de madeira clara. **Vai de borda a borda da célula** e se repete sem emenda | `TileSprite` de x −20 a 1300; os frisos andam quando o tecido anda |
| 1 | **janela de estampa**: uma moldura quadrada de madeira clara, de cantos redondos, em pé sobre dois pezinhos, com uma lampadinha quente acesa no meio da borda de cima. **O miolo da moldura é vazado** (transparente) | fica sobre a esteira em x 960, em volta do quadradinho da vez |
| 2 | **rolo de tecido liso**: uma bobina grande de tecido creme liso vista **de ponta** (um círculo com a espiral das camadas e o furo do eixo), num suporte de madeira | à direita (x 1170); a tira do tecido sai por baixo dele, para a esquerda |
| 3 | **rolo fechado**: o tecido pronto enrolado, também **de ponta** (círculo com espiral, menor), só o avesso creme à vista, com um laço de fita lilás em cima | o tecido enrolado na pergunta |
| 4 | **corda do varal**: um pedaço de corda bege fininha na horizontal, **de borda a borda**, repetível | `TileSprite` do varal |
| 5 | **gancho do varal**: uma argola de madeira presa num pino, com o nó da corda saindo para a DIREITA | as pontas do varal (o código espelha a da direita) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 320 x 320 (total 960 x 640), read left to right, top row first. Cute, chunky parts of a fabric-stamping workshop, all seen from the FRONT and slightly from above, at the same scale.
1. A straight HORIZONTAL piece of conveyor belt: a soft blue-grey canvas belt with thin ridges, between two rounded light-wood side rails, about 40% of the cell height, running from the LEFT EDGE to the RIGHT EDGE of the cell so it tiles seamlessly side by side.
2. A cute STAMPING WINDOW: a square frame of light wood with rounded corners (like a chunky picture frame), standing on two little feet, with a small warm glowing lamp on the middle of its top edge. The frame is OPEN: the whole area inside it is completely EMPTY and transparent (the fabric square will be seen through it). The opening is about 62% of the frame width. About 90% of the cell height.
3. A big ROLL of plain cream fabric seen END-ON: a round end showing the spiral of fabric layers and a small wooden core in the middle, resting on a small wooden stand. Plain fabric, no pattern. About 85% of the cell.
4. A smaller finished ROLLED-UP piece of fabric, also seen END-ON (a round end with the spiral of layers), showing only the plain cream back of the fabric, with a lilac ribbon bow tied on top. About 60% of the cell.
5. A thin beige ROPE (clothesline) running HORIZONTALLY from the LEFT EDGE to the RIGHT EDGE of the cell, centered in height, so it tiles seamlessly side by side.
6. A small wooden wall hook: a round wooden ring fixed on a short peg, with the knot of a beige rope coming out of it toward the RIGHT.

DO NOT INCLUDE: patterns on the fabric rolls, prints, flowers, stars, hearts, stamps, people, hands, text, letters, numbers, logos, labels, warning signs, filled or painted area inside the frame, backgrounds behind the items, floor, shadows on the ground, items crossing cell borders (except pieces 1 and 5 which touch the side edges as described), different scales between cells, top-down views, strong perspective, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `estampas.png` — 4 × 3 células de 256 (1024 × 768), alfa

A folha que mais aparece: as mesmas estampas servem ao tecido, ao pedido e às etiquetas.

| Célula | Peça | Uso |
|---|---|---|
| 0 | **estampa de flor**: 5 pétalas redondas em tinta **rosa**, miolo vazado | tecido, pedido, pergunta |
| 1 | **estampa de estrela**: 5 pontas arredondadas, tinta **amarelo-ouro**, cheia | idem |
| 2 | **estampa de coração**: tinta **vermelho-coral**, cheio | idem |
| 3 | **quadradinho de tecido**: linho creme ocupando **a célula inteira, de borda a borda**, com um pesponto pontilhado fininho perto dos 4 lados | a tira do tecido (repete na horizontal) |
| 4 | **flor borrada**: a mesma flor carimbada torta, com um borrão de um lado e 2–3 pingos | o erro |
| 5 | **estrela borrada** | o erro |
| 6 | **coração borrado** | o erro |
| 7 | **barra do tecido**: a ponta dobrada e costurada do linho, com franjinha à ESQUERDA; altura inteira da célula, ≈ 30 % da largura, **encostada na borda DIREITA** | o começo da tira |
| 8 | **botão de costura**: redondo, creme, 4 furos, uma cruzinha de linha branca | o botão costurado na aba a cada volta |
| 9 | **casa do botão**: um círculo de pontinhos de linha branca, vazio, do tamanho do botão | a casa vazia na aba |
| 10 | **agulha com linha azul**: na diagonal, com um rabinho de linha ondulado | corre por baixo da emenda |
| 11 | **prendedor de varal** de madeira, em pé, com a boca para BAIXO | um em cada emenda no varal |

As estampas (0–2 e 4–6) são **tinta de carimbo**: cor chapada com um granulado fininho **por dentro** da forma e contorno num tom mais escuro da própria tinta. Sem rosto, sem fundo de tecido atrás.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 3 rows, each cell 256 x 256 (total 1024 x 768), read left to right, top row first. Items for a children's fabric-stamping game, seen straight from the front, centered with about 8% margin unless said otherwise. Items 1, 2, 3, 5, 6 and 7 are RUBBER-STAMP INK PRINTS: one flat ink color with a very fine speckled stamp grain that stays INSIDE the shape, a crisp outline in a slightly darker tone of the same ink, no face, nothing behind them.
1. A FLOWER print: five round petals in PINK ink, the round center left empty (hollow).
2. A STAR print: a five-pointed star with softly rounded points, in GOLDEN-YELLOW ink, solid.
3. A HEART print in CORAL-RED ink, solid, chubby and round.
4. A square of cream LINEN fabric that fills the WHOLE cell from edge to edge, with a soft woven texture and a thin dotted running stitch just inside all four sides, so squares tile seamlessly side by side.
5. The same pink FLOWER print, but stamped crooked and SMUDGED: smeared to one side, with two or three small ink drops — clearly the same flower, just messy.
6. The same golden-yellow STAR print, crooked and SMUDGED the same way.
7. The same coral-red HEART print, crooked and SMUDGED the same way.
8. The folded, sewn HEM at the end of the same cream linen: a narrow vertical band about 30% of the cell width, the full cell height, touching the RIGHT edge of the cell, with a short soft fringe of threads on its LEFT side.
9. A round cream SEWING BUTTON with four holes and a small cross of white thread, about 60% of the cell.
10. An empty BUTTON SPOT: a circle made of short white running stitches, nothing inside, the same size as the button.
11. A cute silver SEWING NEEDLE lying diagonally, with a short wavy tail of blue thread.
12. A wooden CLOTHESPIN standing upright, its clip opening pointing DOWN.

DO NOT INCLUDE: faces or eyes on the prints, extra petals, six-pointed stars, sharp spiky stars, other figures or shapes, ink grain or speckles outside the shapes, fabric behind the prints (except item 4 and 8), text, letters, numbers, logos, hands, people, backgrounds behind the items, shadows on the ground, items crossing cell borders (except items 4 and 8 as described), items cut by the cell edge, different scales between the three prints, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `carimbos.png` — 3 × 2 células de 320 (960 × 640), alfa

O **mesmo carimbo de madeira**, mudando só a figura pintada na frente do bloco. A criança precisa ver de longe qual é qual.

| Célula | Peça |
|---|---|
| 0 | carimbo da **flor**: bloco de madeira clara com pegador redondo; na frente do bloco, a flor rosa grande; a borracha de baixo com um fiozinho de tinta rosa |
| 1 | carimbo da **estrela** (amarelo-ouro) |
| 2 | carimbo do **coração** (vermelho-coral) |
| 3 | **almofada de tinta rosa**: latinha redonda vista um pouco de cima, com a almofada de tinta dentro |
| 4 | almofada **amarelo-ouro** |
| 5 | almofada **vermelho-coral** |

O código põe cada carimbo em pé sobre a almofada da mesma cor, em x 400 · 640 · 880.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 320 x 320 (total 960 x 640), read left to right, top row first. All items seen from the front and slightly from above, at the same scale.
Top row: the SAME cute chunky wooden BLOCK STAMP three times (a rounded rectangular block of light wood with a big round wooden knob handle on top, about 80% of the cell height, centered). On the FRONT face of the block, one big simple figure is painted, and the rubber sole at the bottom shows a thin line of the same ink color:
1. a PINK five-petal flower with a hollow round center;
2. a GOLDEN-YELLOW five-pointed star with rounded points;
3. a CORAL-RED chubby heart.
Bottom row: the SAME small round metal INK PAD tin three times, seen slightly from above (oval top), the soft ink pad inside it colored:
4. pink;
5. golden yellow;
6. coral red.

DO NOT INCLUDE: faces or eyes on the stamps, other figures, two figures on one stamp, text, letters, numbers, logos, brand marks, hands, people, ink splashes, backgrounds behind the items, table, shadows on the ground, items crossing cell borders, items cut by the cell edge, different stamp shapes or sizes between cells, side views, top-down views, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `ui.png` — 3 × 2 células de 384 (1152 × 768), alfa

Peças **em branco**: o código escreve e estica por cima.

| Célula | Peça | Uso |
|---|---|---|
| 0 | **papel do pedido**: papel creme ≈ 2 : 1, cantos arredondados, dois alfinetes redondos perto dos cantos de cima, o resto vazio | o pedido (x 300–980, y 78–238) e o papel da pergunta; `NineSlice` |
| 1 | **moldura azul**: quadrado de cantos redondos feito de **fita de tecido azul** com um pesponto branco tracejado no meio da fita; espessura igual em toda a volta (≈ 12 % da célula); o miolo **transparente** | o laço de fora; `NineSlice` |
| 2 | **moldura lilás**: a mesma, em **lilás** | o laço de dentro (N3); `NineSlice` |
| 3 | **aba azul**: etiqueta de tecido em pé (≈ 4 : 5), cantos redondos, na mesma fita azul com borda pespontada, vazia | o `3×` e as casas de botão |
| 4 | **aba lilás**: a mesma, em lilás | a aba do laço de dentro |
| 5 | **etiqueta de resposta**: um retalho redondo e fofinho de tecido creme, com borda pespontada marrom-quente, vazio | as 3 respostas da pergunta |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 384 x 384 (total 1152 x 768), read left to right, top row first. Friendly fabric-and-paper panels for a children's fabric-stamping game, seen straight from the front, ALL COMPLETELY BLANK so the game can write on them and stretch them.
1. A blank cream PAPER CARD about 2:1 (about 92% of the cell width), softly rounded corners, a plain even edge, with two small round pushpins (one lilac, one mint) near the two TOP corners only; the rest is empty.
2. A square FRAME with rounded corners made of a soft BLUE fabric ribbon with a white dashed running stitch along the middle of the ribbon; the ribbon has the SAME thickness all around (about 12% of the cell); the whole inside of the frame is EMPTY and TRANSPARENT; nothing extra in the middle of the sides. About 90% of the cell.
3. The SAME frame in soft LILAC fabric ribbon with the same white stitch, the same size and thickness, empty and transparent inside.
4. A blank fabric LABEL TAG standing upright (about 4:5), rounded corners, in the same BLUE fabric with a white stitched border, empty face.
5. The SAME label tag in the same LILAC fabric, empty face.
6. A big ROUND puffy fabric PATCH in cream, like a soft cushion button, with a warm brown stitched border, empty face, about 85% of the cell.

DO NOT INCLUDE: any text, letters, numbers, words, lines for writing, icons, symbols, flowers, stars, hearts, buttons sewn on the tags, decorations in the middle of the frame sides, uneven ribbon thickness, filled frame insides, logos, faces, people, hands, backgrounds behind the items, shadows on the ground, items crossing cell borders, items cut by the cell edge, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `estampadora.png` — 2 × 2 células de 400 × 520 (800 × 1040), alfa — opcional

A dona da estamparia. Ela fica no canto de baixo à esquerda, virada para o meio da tela, e só reage (não é tocável).

| Célula | Pose | Quando |
|---|---|---|
| 0 | acenando, com um carimbinho na outra mão | a abertura do jogo |
| 1 | pensando: dedo no queixo, olhando para cima | durante a pergunta |
| 2 | comemorando: braços para cima, olhos fechados de alegria | a conferência certa |
| 3 | "ops": mãos nas bochechas, olhos arregalados, boca em "o" (surpresa leve, sem medo) | o erro |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes; very big round heads on small chubby bodies, huge glossy eyes with bright highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 2 rows, each cell 400 x 520 (total 800 x 1040), read left to right, top row first. The SAME cheerful chibi GIRL ARTISAN in four poses, full body, same size and same outfit in every cell, standing, turned three-quarters toward the RIGHT, centered with her feet near the bottom of the cell. She has warm brown skin, big curly dark hair tied up in a lilac headscarf with a little bow on top, rosy cheeks, a mint t-shirt, a short denim apron with a front pocket holding a spool of thread and a few tiny pastel ink dots on it, cream pants rolled at the ankles and small brown shoes.
1. Waving hello with one hand, holding a small wooden stamp in the other hand, big smile.
2. Thinking: one finger on her chin, looking up, small curious smile, hands otherwise empty.
3. Celebrating: both arms up, eyes closed with joy, a few small "+" sparkles around her.
4. A gentle "oops": both hands on her cheeks, eyes wide, mouth a small "o", lightly surprised (not scared).

DO NOT INCLUDE: flowers, stars or hearts on her clothes or hair, text, letters, numbers, logos on clothes, other characters, adults, animals, backgrounds behind her, ground, shadows on the ground, frames, square tiles behind her, items crossing cell borders, body cut by the cell edge, different sizes or outfits between cells, crying, scared or angry faces, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. `cover-fabrica-de-estampas.png` — 1672 × 941, opaco, com o título

A estamparia de frente: a estampadora bate um carimbo de flor numa tira de tecido sobre a esteira, que já mostra o padrão **flor, flor, estrela, flor, flor, estrela**. Atrás, um tecido pronto pendurado no varal. Na frente, os três carimbos nas almofadas. O título vai num letreiro no alto (memória *capa tem título*).

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes; very big round heads on small chubby bodies, huge glossy eyes with bright highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque. A bright, cozy artisan fabric-stamping workshop seen from the front. A cheerful chibi girl artisan (warm brown skin, big curly dark hair tied up in a lilac headscarf with a bow, mint t-shirt, short denim apron with tiny pastel ink dots) presses a wooden block stamp onto a long strip of cream fabric that lies on a conveyor belt; the fabric already shows a clear repeating printed pattern in a row: pink flower, pink flower, golden-yellow star, pink flower, pink flower, golden-yellow star. Behind her, a finished printed fabric hangs from a clothesline with wooden clothespins. In the foreground, three chunky wooden block stamps (a pink flower, a golden-yellow star and a coral-red heart painted on their fronts) stand on little round ink pads. Shelves with plain and striped fabric rolls and ink jars on the sides, soft morning sunlight. At the top center, a cute rounded fabric banner sign shows the title "Fábrica de Estampas" in big, bold, rounded, friendly letters, spelled exactly like that, with the accent on the first "a" of "Fábrica".

DO NOT INCLUDE: any other text besides the title, misspelled title, missing accent, extra letters, subtitles, numbers, logos, brand marks, faces on the stamps or prints, other figures in the prints besides flowers, stars and hearts, scary elements, night, red danger colors, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 10. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24) e os pontinhos soltos (essa linha vem com franja; nas estampas, o granulado tem de ficar dentro da forma).
2. Conferir:
   - **nenhuma letra** no papel, nas abas e nas etiquetas;
   - as 3 estampas com silhuetas bem diferentes, e as borradas reconhecíveis como a mesma figura;
   - **nenhuma flor, estrela ou coração** no fundo;
   - o miolo do arco da janela e das molduras **transparente**;
   - a esteira, o quadradinho de tecido e a corda repetindo sem emenda (se não repetirem, cortar o miolo e repetir só ele);
   - os 3 carimbos do mesmo formato, mudando só a figura.
3. Medir as bordas das molduras e do papel para os `NineSlice` (esquerda, direita, cima, baixo) e anotar.
4. Medir no fundo o vazio do pedido, o balcão da esteira e o meio da bancada, e ajustar `ORDER`, `BELT`, `WINDOW` e `STAMPS` no `data/layout.ts`.
5. Tirar as cores das estampas, das molduras e da tinta com `GetPixel` para o `theme.ts` (a emenda costurada usa o azul da moldura).
6. Anotar tudo no `MANIFEST.md` da pasta de assets.
