# Rio de Chocolate — texturas

Destino: `src/assets/games/EF05CO03/rio-de-chocolate/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 o laço, §5 a tela, §6 os doces).

**Linha de arte: doodle de lápis de cor** (pedido do usuário em 15/10/2026). Anexe em **toda geração** a `references/39-doodle-lapis-de-cor.webp`, a folha de rabiscos infantis em papel quadriculado (menina de marias-chiquinhas, menino de cabeça redonda, ursinho, arco-íris, casinha…).
- Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*.
- O elenco da referência, o papel quadriculado e a marca d'água "designed by freepik" vão no negativo de todos os prompts.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

**O rio é do código** (pedido do usuário): não há `rio.png`. O chocolate é desenhado em Graphics, e as margens deixam a água transparente.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código nas mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

## A linha, comparada às vizinhas

| | **Doodle de lápis de cor** (`39`, este jogo) | Desenho de criança (`16`) | Chibi de caderno (`37`, `38`) |
|---|---|---|---|
| Traço | lápis grafite quase preto (`#222220`), rabiscado, às vezes dobrado | hidrográfica preta, trêmula | marrom-escuro fino, com a ponta afinando |
| Cor | lápis de cor com a **hachura diagonal à vista**; a sombra é uma hachura mais escura da mesma cor | chapada, sem sombra, escapando do traço | chapada e apagada, sem sombra |
| Olho | dois pontinhos pretos | pontinho preto | redondo, escuro, com 1 ou 2 brilhos |
| Corpo | cabeça redonda grande, braços e pernas simples e finos | igual, mais torto | chibi um pouco alongado |
| Brilho | manchinhas brancas deixadas sem pintar | nenhum | nenhum |
| Contorno branco | não | não | não |

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `doces-redondos.png` | 3 × 3 | 256 | 768 × 768 | sim | os doces redondos: 3 cores × 3 coberturas |
| `doces-quadrados.png` | 3 × 3 | 256 | 768 × 768 | sim | os doces quadrados, na mesma ordem |
| `mel.png` | 4 × 2 | 256 × 320 | 1024 × 640 | sim | a Mel, virada para a **direita** |
| `margem-partida.png` | — | — | 640 × 720 | sim | a margem da **esquerda**, de onde a Mel sai |
| `margem-chegada.png` | — | — | 1280 × 720 | sim | a margem da **direita**, com a festa |
| `cover-rio-de-chocolate.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** A placa, as marcas ✓ e ✗ e as falas são do código. A única exceção é o título da capa.
- **Sem papel quadriculado.** A referência está desenhada em papel; aqui o fundo é **transparente** (ou a cena, nas peças opacas).
- **Pintura opaca por dentro do traço.** A hachura de lápis deixa o papel aparecer entre os riscos; com fundo transparente, esses buracos mostrariam o chocolate escuro através do doce. Por isso, embaixo dos riscos vai uma base lisa da cor clara, cobrindo toda a forma.
- **O doce é a resposta.** Cor, forma e cobertura têm de ser lidas de relance, com o doce a 100 px de largura. Nenhum doce tem rosto, laço, vela, fruta ou enfeite além da cobertura pedida, e nenhum brilha mais que outro.
- **As três cores dos doces** são exatas e só delas: rosa-chiclete `#F7A1C4`, verde-pistache `#93D47A` e **caramelo** `#C98A52`. O caramelo é bem mais claro que o rio `#5B3420`.
- **O granulado é branco, amarelo e azul.** Nunca rosa, verde ou marrom, para não misturar com a cor do doce.
- **A Mel e a festa não usam rosa, verde nem caramelo** como cor principal.
- **Vista de cima, inclinada (3/4):** a câmera olha de cima, a ~40°. Todos os doces mostram a face de cima e um pouco da lateral, com a mesma inclinação e a mesma altura de lateral.
- Peça solta e centrada na célula, com cerca de 8 % de margem. **A Mel pisa no fundo da célula.**

---

## 3. `doces-redondos.png` — 3 × 3 células de 256 (768 × 768), alfa

Linha = **cor**, coluna = **cobertura**.

| | granulado | listrado | liso |
|---|---|---|---|
| **rosa** | 0 | 1 | 2 |
| **verde** | 3 | 4 | 5 |
| **caramelo** | 6 | 7 | 8 |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a hand-drawn children's doodle in COLORED PENCIL and crayon; a sketchy charcoal-black pencil outline (#222220) of medium weight, slightly wobbly and sometimes doubled, like a quick hand sketch; color laid in with visible diagonal colored-pencil hatching strokes, and the shadow side hatched again in a darker shade of the same color; no smooth gradients; small white spots left unpainted as shine; bright, cheerful, saturated colors; simple rounded shapes. Take ONLY the art style: do NOT copy its characters, objects, layout or the graph paper.

A game sprite sheet on a fully TRANSPARENT background (no paper, no grid): a grid of 3 columns x 3 rows, each cell 256 x 256 (total 768 x 768), read left to right, top row first. Nine ROUND candy-shop sweets: fat round petit-four cakes, like a thick round cookie-cake, seen from ABOVE at a 3/4 angle (camera about 40 degrees above), so each one shows its round TOP FACE as a wide oval and a short straight SIDE band below it. All nine have exactly the same size, the same tilt and the same side height: about 80% of the cell wide, the top face oval about 45% of the cell tall, the side band about 15% of the cell tall, centered in the cell. Inside the outline every sweet is painted SOLID: a smooth opaque base of its color under the pencil hatching, with no transparent gaps. No plate, no faces.
ROW 1 = bubblegum PINK (#F7A1C4), ROW 2 = pistachio GREEN (#93D47A), ROW 3 = CARAMEL light brown (#C98A52). The color covers the whole sweet, top and side; the side is hatched one shade darker.
COLUMN 1 = SPRINKLES: about fifteen short rod sprinkles in WHITE, YELLOW and BLUE scattered over the top face.
COLUMN 2 = STRIPES: three wavy cream-colored icing drizzle lines across the top face, evenly spaced.
COLUMN 3 = PLAIN: just the hatched top face with one white unpainted shine spot, nothing else.

DO NOT INCLUDE: faces or eyes on the sweets, bows, candles, cherries, fruit, cream swirls, sprinkles in pink, green or brown, square sweets, sweets of different sizes, top-down flat views, side views, see-through gaps between the pencil strokes, plates, napkins, hands, characters, text, letters, numbers, shadows on the ground, items crossing cell borders, items cut by the cell edge, the graph-paper background or any grid lines, the doodles from the reference image (a blonde girl with pigtails in a pink dress, a round-headed boy in a yellow shirt, a teddy bear, a rainbow, a smiling sun, a cloud, an umbrella, a ladybug, a whale, a snail, a dog, a bunny, a turtle, a kite, a little house), the "designed by freepik" watermark, watermarks, signatures, @handles, website names, white sticker keyline, smooth clean vector lines, flat digital fills, glossy airbrushed gradients, anime eyes, 3D render, photorealistic.
~~~

---

## 4. `doces-quadrados.png` — 3 × 3 células de 256 (768 × 768), alfa

A mesma ordem dos redondos (linha = cor, coluna = cobertura), e **a mesma inclinação e altura de lateral**: lado a lado, um redondo e um quadrado têm de parecer da mesma família.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a hand-drawn children's doodle in COLORED PENCIL and crayon; a sketchy charcoal-black pencil outline (#222220) of medium weight, slightly wobbly and sometimes doubled, like a quick hand sketch; color laid in with visible diagonal colored-pencil hatching strokes, and the shadow side hatched again in a darker shade of the same color; no smooth gradients; small white spots left unpainted as shine; bright, cheerful, saturated colors; simple rounded shapes. Take ONLY the art style: do NOT copy its characters, objects, layout or the graph paper.

A game sprite sheet on a fully TRANSPARENT background (no paper, no grid): a grid of 3 columns x 3 rows, each cell 256 x 256 (total 768 x 768), read left to right, top row first. Nine SQUARE candy-shop sweets: thick square petit-four cakes with slightly rounded corners, seen from ABOVE at a 3/4 angle (camera about 40 degrees above), so each one shows its square TOP FACE as a wide rounded rectangle and a short straight SIDE band below it. All nine have exactly the same size, the same tilt and the same side height: about 75% of the cell wide, the top face about 45% of the cell tall, the side band about 15% of the cell tall, centered in the cell. Inside the outline every sweet is painted SOLID: a smooth opaque base of its color under the pencil hatching, with no transparent gaps. No plate, no faces.
ROW 1 = bubblegum PINK (#F7A1C4), ROW 2 = pistachio GREEN (#93D47A), ROW 3 = CARAMEL light brown (#C98A52). The color covers the whole sweet, top and side; the side is hatched one shade darker.
COLUMN 1 = SPRINKLES: about fifteen short rod sprinkles in WHITE, YELLOW and BLUE scattered over the top face.
COLUMN 2 = STRIPES: three wavy cream-colored icing drizzle lines across the top face, evenly spaced.
COLUMN 3 = PLAIN: just the hatched top face with one white unpainted shine spot, nothing else.

DO NOT INCLUDE: faces or eyes on the sweets, bows, candles, cherries, fruit, cream swirls, sprinkles in pink, green or brown, round sweets, sweets of different sizes, cubes seen from a corner, top-down flat views, side views, see-through gaps between the pencil strokes, plates, napkins, hands, characters, text, letters, numbers, shadows on the ground, items crossing cell borders, items cut by the cell edge, the graph-paper background or any grid lines, the doodles from the reference image (a blonde girl with pigtails in a pink dress, a round-headed boy in a yellow shirt, a teddy bear, a rainbow, a smiling sun, a cloud, an umbrella, a ladybug, a whale, a snail, a dog, a bunny, a turtle, a kite, a little house), the "designed by freepik" watermark, watermarks, signatures, @handles, website names, white sticker keyline, smooth clean vector lines, flat digital fills, glossy airbrushed gradients, anime eyes, 3D render, photorealistic.
~~~

---

## 5. `mel.png` — 4 × 2 células de 256 × 320 (1024 × 640), alfa

A Mel, aprendiz de confeiteira, desenhada como as crianças da referência: cabeça redonda e grande, dois pontinhos pretos de olho, um risquinho de sorriso, bochechas rosadas redondas, braços e pernas simples. Pele morena clara, cabelo castanho-escuro num rabo de cavalo alto, uma **touca de confeiteira branca** pequena e alta, camiseta azul-céu, **avental amarelo-baunilha**, legging lilás e tênis brancos. Em todos os quadros ela está **virada para a direita** (é para lá que ela pula), e pisa no fundo da célula.

| Célula | Pose |
|---|---|
| 0 | parada, sorrindo, braços soltos |
| 1 | agachada para pular: joelhos dobrados, braços para trás |
| 2 | no ar: corpo esticado para a direita, braços para cima, pés juntos |
| 3 | pousando: agachadinha, braços abertos para os lados, equilibrando |
| 4 | comemorando: pulinho, os dois punhos para cima, olhos fechados de alegria |
| 5 | ops: caindo para trás, braços para cima, boca aberta, olhos arregalados |
| 6 | **no chocolate**: afundada até a cintura numa poça redonda de chocolate (a poça faz parte do desenho e fica no fundo da célula), lambuzada de chocolate na cabeça e nos braços, careta triste |
| 7 | testando com o pé: corpo inclinado para trás, apoiada na perna de trás, a perna da frente esticada para a direita com a ponta do pé estendida |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a hand-drawn children's doodle in COLORED PENCIL and crayon; a sketchy charcoal-black pencil outline (#222220) of medium weight, slightly wobbly and sometimes doubled, like a quick hand sketch; color laid in with visible diagonal colored-pencil hatching strokes, and the shadow side hatched again in a darker shade of the same color; no smooth gradients; small white spots left unpainted as shine; bright, cheerful, saturated colors; simple rounded shapes; faces drawn as two small black dot eyes, a thin curved smile line and round pink cheeks. Take ONLY the art style: do NOT copy its characters, objects, layout or the graph paper.

A game sprite sheet on a fully TRANSPARENT background (no paper, no grid): a grid of 4 columns x 2 rows, each cell 256 x 320 (total 1024 x 640), read left to right, top row first. The same girl in all eight cells: MEL, a cheerful apprentice pastry chef drawn like a simple kid doodle — a big round head, two black dot eyes, a thin curved smile, round pink cheeks, light-brown skin, dark-brown hair in a high scribbly ponytail, a small tall WHITE pastry chef hat, a sky-blue t-shirt, a vanilla-yellow apron, lilac leggings, white shoes, simple thin arms and legs. In EVERY cell her body is turned to the RIGHT (eyes and smile on the right side of the face), about 85% of the cell tall, and her feet touch the bottom of the cell. Inside the outline she is painted SOLID, with no transparent gaps between the pencil strokes.
1. Standing still, smiling, arms relaxed.
2. Crouching to jump: knees bent, arms swung back.
3. Mid-air jump to the right: body stretched toward the right, both arms up, feet together.
4. Landing: small crouch, both arms spread wide to the sides for balance.
5. Celebrating: a little hop, both fists up, eyes closed as two happy arcs.
6. Oops: falling backwards, arms up, mouth open as a small round O, eyes as two bigger dots.
7. Sunk in chocolate: only her body from the waist up sticks out of a round puddle of dark chocolate (#5B3420) that sits at the bottom of the cell; chocolate drips on her hat, hair and arms; a sad upside-down smile.
8. Testing with her foot: leaning back on her back leg, the front leg stretched out to the right with the tip of the toe pointed, arms out for balance, a curious little round mouth.

DO NOT INCLUDE: pink, green or caramel clothes, a dress, pigtails, blonde hair, other characters, food in her hands, a spoon, a whisk, a face turned to the left, back views, cells with a different girl, the puddle in any cell except cell 7, see-through gaps between the pencil strokes, text, letters, numbers, ground lines, shadows on the ground, items crossing cell borders, items cut by the cell edge, the graph-paper background or any grid lines, the doodles from the reference image (a blonde girl with pigtails in a pink dress, a round-headed boy in a yellow shirt, a teddy bear, a rainbow, a smiling sun, a cloud, an umbrella, a ladybug, a whale, a snail, a dog, a bunny, a turtle, a kite, a little house), the "designed by freepik" watermark, watermarks, signatures, @handles, website names, white sticker keyline, smooth clean vector lines, flat digital fills, glossy airbrushed gradients, anime eyes with big irises, 3D render, photorealistic.
~~~

---

## 6. `margem-partida.png` — 640 × 720, alfa

A margem da **esquerda**. A beira do rio é uma linha ondulada **vertical**, entre 560 e 620 px da esquerda; à direita dela, tudo transparente (o rio do código aparece ali). A faixa de chão junto da beira (de 420 a 560 px) fica **livre**: é por ali que a Mel anda de cima para baixo.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a hand-drawn children's doodle in COLORED PENCIL and crayon; a sketchy charcoal-black pencil outline (#222220) of medium weight, slightly wobbly and sometimes doubled; color laid in with visible diagonal colored-pencil hatching strokes, and the shadow side hatched again in a darker shade of the same color; no smooth gradients; small white spots left unpainted as shine; bright, cheerful, saturated colors; simple rounded shapes. Take ONLY the art style: do NOT copy its characters, objects, layout or the graph paper.

A game background piece, 640 x 720, on a TRANSPARENT background (no paper, no grid), seen from above at a 3/4 angle: the LEFT BANK of a chocolate river in a candy land. The ground is a big golden COOKIE (#E9B872) hatched in colored pencil over a solid opaque base, with a few chocolate-chip dots and small cream sugar-grass tufts. The shoreline is a wavy VERTICAL edge between 560 and 620 px from the left, drawn with the black pencil line, a darker brown hatched wet rim and a thin cream foam line; everything to the right of the shoreline is fully transparent. The strip of ground from 420 to 560 px from the left is clear and walkable. A few low decorations stay left of 400 px: two red-and-white candy-cane posts, gumdrop bushes in blue, yellow and lilac, small round lollipop flowers.

DO NOT INCLUDE: the river water itself, sweets floating, bridges, characters, animals, signs, tables, text, letters, numbers, pink, green or caramel gumdrops, tall objects near the shoreline, a horizon, sky, see-through gaps in the ground, the graph-paper background or any grid lines, the doodles from the reference image (a blonde girl with pigtails in a pink dress, a round-headed boy in a yellow shirt, a teddy bear, a rainbow, a smiling sun, a cloud, an umbrella, a ladybug, a whale, a snail, a dog, a bunny, a turtle, a kite, a little house), the "designed by freepik" watermark, watermarks, signatures, @handles, website names, white sticker keyline, smooth clean vector lines, flat digital fills, glossy airbrushed gradients, 3D render, photorealistic.
~~~

---

## 7. `margem-chegada.png` — 1280 × 720, alfa

A margem da **direita**, com a festa. A beira do rio é uma linha ondulada **vertical** entre 20 e 70 px da esquerda; à esquerda dela, transparente. A Mel pousa em x ≈ 80 a 200, y ≈ 450: esse pedaço fica livre. A festa fica no meio (x 400 a 900) e **abaixo de y 130**, porque o alto da tela é do cabeçalho.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a hand-drawn children's doodle in COLORED PENCIL and crayon; a sketchy charcoal-black pencil outline (#222220) of medium weight, slightly wobbly and sometimes doubled; color laid in with visible diagonal colored-pencil hatching strokes, and the shadow side hatched again in a darker shade of the same color; no smooth gradients; small white spots left unpainted as shine; bright, cheerful, saturated colors; simple rounded shapes. Take ONLY the art style: do NOT copy its characters, objects, layout or the graph paper.

A game background piece, 1280 x 720, on a TRANSPARENT background (no paper, no grid), seen from above at a 3/4 angle: the RIGHT BANK of a chocolate river in a candy land, where a party is ready. The ground is a big golden COOKIE (#E9B872) hatched in colored pencil over a solid opaque base, with small cream sugar-grass tufts. The shoreline is a wavy VERTICAL edge between 20 and 70 px from the left, drawn with the black pencil line, a darker brown hatched wet rim and a thin cream foam line; everything left of it is fully transparent. The area from 80 to 220 px from the left, around the vertical middle, is clear ground. In the middle (x 400 to 900, below y 130): a round party table with a white tablecloth and a big three-tier vanilla CAKE with blue and yellow decorations and a yellow star on top, a string of triangle bunting flags in blue, yellow, lilac and white across the scene, a bunch of blue and yellow balloons tied to the table, two gift boxes.

DO NOT INCLUDE: the river water itself, sweets floating, people, characters, animals, text, letters, numbers, writing on the cake, pink, green or caramel as main colors, anything above y 120, a horizon, sky, see-through gaps in the ground, the graph-paper background or any grid lines, the doodles from the reference image (a blonde girl with pigtails in a pink dress, a round-headed boy in a yellow shirt, a teddy bear, a rainbow, a smiling sun, a cloud, an umbrella, a ladybug, a whale, a snail, a dog, a bunny, a turtle, a kite, a little house), the "designed by freepik" watermark, watermarks, signatures, @handles, website names, white sticker keyline, smooth clean vector lines, flat digital fills, glossy airbrushed gradients, 3D render, photorealistic.
~~~

---

## 8. `cover-rio-de-chocolate.png` — 1672 × 941, opaco, capa

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a hand-drawn children's doodle in COLORED PENCIL and crayon; a sketchy charcoal-black pencil outline (#222220) of medium weight, slightly wobbly and sometimes doubled; color laid in with visible diagonal colored-pencil hatching strokes, and the shadow side hatched again in a darker shade of the same color; no smooth gradients; small white spots left unpainted as shine; bright, cheerful, saturated colors; simple rounded shapes; faces drawn as two small black dot eyes, a thin curved smile line and round pink cheeks. Take ONLY the art style: do NOT copy its characters, objects or layout.

A game cover illustration, 1672 x 941, landscape, painted edge to edge. At the TOP CENTER, a big title written exactly "Rio de Chocolate" in chunky hand-drawn bubble letters colored in with crayon in cream and vanilla yellow, with a thick black pencil outline, perfectly spelled. Below it: a river of melted dark chocolate (#5B3420) flows across the scene seen from above at a 3/4 angle, with round and square sweets floating on it in a row — pink, pistachio-green and caramel petit-fours, some with white-yellow-blue sprinkles, some with cream drizzle stripes, some plain. MEL, a cheerful apprentice pastry chef drawn like a simple kid doodle (big round head, dot eyes, rosy cheeks, light-brown skin, dark-brown high ponytail, small tall white chef hat, sky-blue t-shirt, vanilla-yellow apron, lilac leggings, white shoes), is mid-jump from one sweet to the next, arms up, laughing. One sweet behind her is sinking with a little chocolate splash. On the right bank of golden cookie ground, a party table with a three-tier vanilla cake, bunting flags and balloons in blue and yellow.

DO NOT INCLUDE: any other text, letters or numbers besides the title, misspelled title, logos, extra characters, adults, animals, faces on the sweets, the graph-paper background or any grid lines, the doodles from the reference image (a blonde girl with pigtails in a pink dress, a round-headed boy in a yellow shirt, a teddy bear, a rainbow, a smiling sun, a cloud, an umbrella, a ladybug, a whale, a snail, a dog, a bunny, a turtle, a kite, a little house), the "designed by freepik" watermark, watermarks, signatures, @handles, website names, white sticker keyline, smooth clean vector lines, flat digital fills, glossy airbrushed gradients, anime eyes, 3D render, photorealistic.
~~~

---

## 9. Na entrega

- Conferir se os doces e a Mel estão **opacos por dentro**: buraco de alfa entre os riscos de lápis mostra o chocolate através. Se vier vazado, preencher por baixo antes de medir.
- Limpar o alfa baixo da borda (o lápis deixa franja) antes de medir; o código mede cada célula com alfa > 96.
- Conferir se a **face de cima** de todos os doces fica na mesma altura relativa: é nela que a Mel pisa (`SWEET.top` em `data/layout.ts`).
- Conferir as três cores dos doces contra os hex do §2, e o granulado sem rosa, verde ou marrom.
- Conferir se a Mel está virada para a **direita** em todas as células, e se a poça só aparece na célula 6.
- Conferir onde ficou a beira do rio nas duas margens e ajustar `BANK` em `data/layout.ts` se precisar.
