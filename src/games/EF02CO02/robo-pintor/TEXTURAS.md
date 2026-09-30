# Robô Pintor — texturas

Destino: `src/assets/games/EF02CO02/robo-pintor/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 cercas, §13).

A linha de arte é o **vetor geométrico chapado** (escolha do usuário em
30/09/2026). As regras completas estão em
[`references/ESTILO-VETOR-GEOMETRICO.md`](../../../../references/ESTILO-VETOR-GEOMETRICO.md).
Em **toda geração** vão anexadas `references/23-vetor-geometrico-a.webp` e
`references/24-vetor-geometrico-b.png`. **Só na capa** entra também a
`26-vetor-geometrico-d.png`, que ensina a montar o grupo. Cada prompt vem inteiro
(estilo + corpo + negativo), pronto para copiar.

> **O elenco das referências entra no negativo.** As imagens são o elenco de uma
> marca (e o urso de uma delas). Daqui sai só a **técnica de construção**.

### Tabela de estilo — vetor geométrico

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Contorno | **nenhum**: a forma se separa pela cor | chibi de figurinha (traço azul-marinho) |
| Sombra | **nenhuma**; no máximo **um painel chapado** da mesma matiz, mais escuro | vetor de conto (degradê) |
| Construção | retângulos de canto redondo, cápsulas e círculos, com raio generoso e igual | desenho livre das outras linhas |
| Extremidades | mão e pé **soltos** do corpo, com vão; pé = cápsula deitada | todas as outras |
| Olho | quadrado arredondado branco, **pupila preta cheia**, um pontinho | chibi (olho com brilho grande) |
| Silhueta | **sem keyline branca**, nem nos arquivos com alfa | chibi de figurinha |
| Paleta | saturada e clara, poucas cores por figura, sobre branco | vetor de conto (terrosa) |

**A regra de cor deste jogo:** as 4 **tintas** (azul `#1CB0F6`, rosa `#FF86D0`,
verde-água `#2EC4A6`, amarelo `#FFC800`) são pintadas pelo código com `tint`
sobre peças **brancas**. O robô é **laranja `#FF9600` e cinza-claro `#E5E5E5`**,
o gato é **roxo-claro `#CE82FF`**, e a madeira crua é **bege `#F2D4A7`**. Nenhum
deles usa as cores das tintas.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-quintal.png` | — | — | 1280 × 720 | opaco | quintal, lousa vazia no cavalete, faixa da cerca livre |
| `robo.png` | 3 × 2 | 384 × 384 | 1152 × 768 | sim | o robô pintor, 6 poses |
| `cerca.png` | 4 × 1 | 256 × 512 | 1024 × 512 | sim | tábua crua, tábua pintada (branca), poste do fim, 1 livre |
| `pecas.png` | 4 × 3 | 256 × 256 | 1024 × 1024 | sim | cartão, laço, pincel, seta, gato dormindo, gato no pulo, respingo, lata, dedo, 3 livres |
| `cover-robo-pintor.png` | — | — | 1672 × 941 | opaco | capa, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`).

**O insubstituível:** as **tábuas** (`cerca` 0 e 1), que emendam uma na outra, e
o **gato** (`pecas` 4 e 5), que é a medida da precisão.

## 2. Regras para toda a arte

- **Nenhum texto, número ou letra.** Os números dos cartões são do código.
- **Nenhum contorno e nenhuma keyline branca**, em arquivo nenhum. Sem contorno,
  quem separa a figura do fundo é a cor. Por isso o robô laranja e o gato roxo
  ficam sobre o quintal claro, e o código põe um fundo sólido atrás do que for
  pequeno (cartões, lousa).
- **Nenhum degradê.** Cada área tem uma cor só.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão e sem sombra
  caída. A exceção são as tábuas (§4).
- **A tábua pintada, o respingo e a tinta da lata são BRANCOS**: o código aplica
  a cor com `tint`. Branco chapado, sem painel mais escuro, para o `tint` sair
  limpo.
- **O pincel do robô tem as cerdas cinza-claro**, sem cor de tinta.
- O robô **anda para a DIREITA** e olha para a direita.

## 3. `bg-quintal.png` — 1280 × 720, opaco

| Região | O que tem |
|---|---|
| y 0–85 | céu calmo (HUD) |
| **lousa**, de (440, 90) a (840, 250) | uma lousa verde-escura de canto redondo, com moldura de madeira, num **cavalete** de cápsulas; o miolo **liso e vazio** |
| **faixa da cerca**, x 120–1200, y 260–580 | **vazia**: grama chapada e, ao fundo, a parede baixa e lisa de uma casa. Nada em pé aqui |
| chão | grama em y ≈ 560; florzinhas de círculos **só fora** da faixa da cerca |
| **faixa dos cartões**, y 580–720 | grama lisa e calma |
| resto | céu azul muito claro, 2 nuvens de cápsulas brancas, uma árvore redonda no canto esquerdo (x < 110) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES (references/23-vetor-geometrico-a.webp and references/24-vetor-geometrico-b.png) AS THE ART STYLE REFERENCE and match their construction exactly: flat geometric vector illustration, assembled only from rounded rectangles, capsules and circles with a large, even corner radius. NO OUTLINES anywhere — every shape is separated by colour alone; where a shape must read against a same-coloured shape, use ONE flat panel of a darker, slightly more saturated tone of the SAME hue, with a hard edge — never a gradient, never a line. 100% flat colour: no shading, no cel shadow, no gradient, no texture, no grain, no airbrush, no rim light, no gloss. Bright, high-chroma, high-key palette over light backgrounds. Take ONLY the art style and the construction from the attached images: do NOT copy their characters, faces, clothes, poses or groupings. NO white sticker keyline.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 educational game for Brazilian children aged 7–8. Wide background illustration, 16:9, built from the same flat geometric shapes, no characters, calm low-contrast areas where game elements will sit.
Primary request: create one opaque 1280 × 720 px, simple and cheerful backyard, seen straight on. Preserve these exact functional regions: y 0–85 is a calm plain very light blue sky; a dark-green rounded chalkboard with a light-wood frame standing on a small easel made of capsules, the board from (440, 90) to (840, 250), with a PLAIN, completely EMPTY surface; the wide band x 120–1200, y 260–580 is EMPTY — only flat grass and, far behind, the plain low wall of a house — because a fence, a robot and a cat will be placed there by the game; the grass line is at about y 560; the band y 580–720 is smooth calm grass; a few tiny flowers made of circles only outside the empty band; one round tree made of circles and a capsule trunk only at the far left (x < 110); two small clouds made of white capsules.

Palette rule: flat light greens, very light sky blue, white, light wood. No strong blue, pink, teal-green or yellow on objects.

Composition and technical constraints: exact 16:9 canvas; straight-on flat view; all listed coordinates respected; the chalkboard and the fence band stay completely empty; opaque.

DO NOT INCLUDE: green owl, owl mascot, bear, cartoon bird mascot, any character from the reference images, brand mascots, logos; people, animals, fences, planks, robots, cats, paint cans, brushes, drawings or chalk marks on the board, objects in the empty band; outlines, black outlines, line art, ink lines, strokes around shapes, sketchy lines, white sticker keyline; gradients, soft shading, cel shading, ambient occlusion, highlights, gloss, texture, grain, paper texture, painterly brushwork, airbrush; 3D render, isometric, perspective view, photorealistic, blur, depth of field, lens flare, noise; text, letters, words, labels, digits, numbers, captions, watermark, signature, title lettering, user interface, buttons, speech bubbles, arrows, icons, stars, HUD, question mark.
~~~

## 4. `cerca.png` — grade 4 × 1, célula 256 × 512

As tábuas se **emendam lado a lado** para formar cercas de 3 a 5. Cada célula é
**uma tábua** — um **retângulo alto de ponta redonda** (~130 × 400) — **com os
pedaços das 2 ripas horizontais** (cápsulas retas) saindo para a esquerda e para
a direita até a **borda da célula**, em y 190 e y 360. Duas células coladas
formam uma cerca contínua. A base da tábua fica em y 500.

| Célula | id | O quê |
|---|---|---|
| 0 | `board-raw` | tábua **bege `#F2D4A7`** chapada, com 2 risquinhos-cápsula mais escuros de veio e 2 preguinhos-círculo |
| 1 | `board-paint` | **só a tábua, SEM as ripas**, no mesmo lugar e tamanho da célula 0, em **BRANCO puro**, com 2 escorridinhas em cápsula e 3 respingos-círculo brancos. Ela é posta por cima da tábua crua, e as ripas cruas continuam aparecendo atrás; se as ripas viessem nela, a tinta vazaria para a tábua vizinha (o código tinge) |
| 2 | `post-end` | o **poste do fim**, mais largo, bege, com as ripas saindo **só para a esquerda** |
| 3 | — | vazia |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES (references/23-vetor-geometrico-a.webp and references/24-vetor-geometrico-b.png) AS THE ART STYLE REFERENCE and match their construction exactly: flat geometric vector illustration, assembled only from rounded rectangles, capsules and circles with a large, even corner radius. NO OUTLINES anywhere — every shape is separated by colour alone; where a shape must read against a same-coloured shape, use ONE flat panel of a darker, slightly more saturated tone of the SAME hue, with a hard edge — never a gradient, never a line. 100% flat colour: no shading, no cel shadow, no gradient, no texture, no grain, no airbrush, no rim light, no gloss. Take ONLY the art style and the construction from the attached images: do NOT copy their characters, faces, clothes, poses or groupings. NO white sticker keyline.

Use case: stylized-concept
Asset type: exact TILEABLE fence-piece sprite sheet for a Phaser 3 game; the game places cells side by side to build fences of 3 to 5 planks.
Primary request: create ONE exact 4 columns × 1 row sprite sheet on a transparent 1024 × 512 px canvas. Every cell is exactly 256 × 512 px (portrait). Cells 0 and 1: one upright fence plank — a tall rounded-top rectangle about 130 px wide and 400 px tall — its bottom at local y = 500, centred horizontally; two horizontal rails, straight flat capsules, pass behind it at local y = 190 and y = 360 and extend EXACTLY to the left and right edges of the cell, so that two cells placed side by side join into one continuous fence. Cell 2 ends the fence: a wider rounded-top post, with the two rails extending ONLY to the left edge. Nothing else crosses a cell boundary. No drawn grid, border or divider.

Exact cells, left to right:
0. board-raw — the plank in flat beige wood (#F2D4A7) with two short darker capsule marks as wood grain and two small circle nails; the rails in the same beige with one slightly darker flat tone.
1. board-paint — ONLY the plank, WITHOUT any rails, exactly the same shape, size and position as the plank in cell 0, in pure flat WHITE, with two small capsule-shaped paint drips and three small white splatter circles; no darker panel on it (the game lays it over cell 0 and tints it with colour, so the raw rails of cell 0 stay visible behind it).
2. post-end — the wider end post in the same flat beige, rails only to the left.
3. completely EMPTY and genuinely transparent reserved cell.

Consistency constraints: the plank in cells 0 and 1 has exactly the same shape, size and position; cell 1 has NO rails; rails meet the cell edges at the same heights in cells 0 and 2.

DO NOT INCLUDE: green owl, owl mascot, bear, any character from the reference images, brand mascots, logos; grass, ground, flowers, cats, robots, paint cans, brushes, coloured paint in cells 0–2; outlines, black outlines, line art, strokes around shapes, white sticker keyline; gradients, shading, highlights, gloss, texture, grain, realistic wood texture, painterly brushwork; 3D render, perspective, photorealistic, blur, noise; text, letters, words, labels, digits, numbers, captions, watermark, signature, title lettering, user interface, buttons, speech bubbles, arrows, icons, stars, HUD, question mark; object in cell 3; drop shadow, grid lines, visible sprite-sheet borders, gaps between rails and cell edges, white backing in transparent areas.
~~~

## 5. `robo.png` — grade 3 × 2, célula 384 × 384

Um robozinho pintor fofo montado com formas: **cabeça** = retângulo de canto
redondo **cinza-claro** com uma **telinha escura** onde ficam os **olhos da linha**
(quadrados arredondados brancos, pupila preta cheia); uma **anteninha** em cápsula
com uma bolinha laranja; uma **boina** de pintor laranja; **corpo** = trapézio
**laranja** de canto redondo com um painel mais escuro; **braços** em cápsula de
espessura constante e **mãos-luva soltas** do braço, com vão; **pés** = cápsulas
deitadas cinza-escuras soltas, sem perna. Numa das mãos, um **pincel** de cabo
de madeira com cerdas **cinza-claro**. **~3 cabeças de altura** (é um robô, não
uma pessoa). Virado para a **DIREITA**. Pés em y = 360 em todas as células.

| Célula | Nome | Pose |
|---|---|---|
| 0 | `robot-idle` | parado, pincel para cima, sorriso-cápsula |
| 1 | `robot-walk` | passo largo para a direita, fora de eixo, com 2 cápsulas de movimento atrás do pé |
| 2 | `robot-paint` | braço esticado para a frente, pincelando para baixo |
| 3 | `robot-cheer` | pulinho, pincel no alto, boca aberta feliz, cápsulas de movimento |
| 4 | `robot-oops` | mão-luva na frente da boca, olhos arregalados, uma gota-cápsula azul-clara de suor |
| 5 | `robot-puzzled` | cabeça inclinada, uma sobrancelha-cápsula levantada, boca-cápsula torta |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES (references/23-vetor-geometrico-a.webp and references/24-vetor-geometrico-b.png) AS THE ART STYLE REFERENCE and match their construction exactly: flat geometric vector character illustration, assembled only from rounded rectangles, capsules and circles with a large, even corner radius. NO OUTLINES anywhere — every shape is separated by colour alone; where a shape must read against a same-coloured shape, use ONE flat panel of a darker, slightly more saturated tone of the SAME hue, with a hard edge — never a gradient, never a line. 100% flat colour: no shading, no cel shadow, no gradient, no texture, no grain, no airbrush, no rim light, no gloss. Arms are capsules of constant thickness that do not taper. Hands and feet float DETACHED from the body, with a clean gap of background between them. Feet are small flat horizontal capsules with no ankle. Eyes are large white rounded squares with a big solid black pupil and one tiny white dot; eyebrows are separate solid capsules; an open mouth is one solid dark-maroon shape; a closed smile is a thick capsule stroke with round caps. Hands are mitten shapes with a thumb. Exaggerated, off-balance poses, plus a few small detached dark capsules as motion ticks. Bright, high-chroma palette. Take ONLY the art style and the construction from the attached images: do NOT copy their characters, faces, clothes, poses or groupings. NO white sticker keyline.

Use case: stylized-concept
Asset type: exact character pose sprite sheet for a Phaser 3 educational game for children aged 7–8. Sprite sheet, 3 columns by 2 rows, 384x384 px per cell, the SAME character in every cell at the SAME scale, the same palette and the same flat lighting, centred in its cell with even margins, transparent background, no grid lines drawn, no cell borders.
Primary request: create ONE exact 3 columns × 2 rows sprite sheet on a transparent 1152 × 768 px canvas. Every cell is exactly 384 × 384 px. Each pose is complete, isolated and centred in its own cell with at least 8% transparent margin. Nothing may cross a cell boundary.

The character: one cute small painter ROBOT built from shapes — a light-grey (#E5E5E5) rounded-rectangle head with a dark rounded screen as a face, showing the style's eyes (white rounded squares, solid black pupils); one short capsule antenna with a small orange ball on top; an orange (#FF9600) painter's beret; an orange rounded-trapezoid body with one slightly darker orange panel; capsule arms of constant thickness; mitten hands floating detached from the arms; small dark-grey (#4B4B4B) capsule feet floating detached below the body, with no legs. One hand holds a paintbrush with a light-wood handle and LIGHT-GREY bristles (no paint colour). About 3 heads tall. Always facing and moving to the RIGHT. Feet at local y = 360 in every cell.

Exact cells, left to right and then top to bottom:
0. robot-idle — standing, brush held up, closed capsule smile.
1. robot-walk — a big off-balance step to the right, with two small dark motion capsules behind the back foot.
2. robot-paint — arm stretched forward, brushing downward in front of it.
3. robot-cheer — a little jump, brush raised high, open happy mouth, a few motion capsules.
4. robot-oops — one mitten in front of its mouth, eyes wide, one small light-blue capsule sweat drop.
5. robot-puzzled — head tilted, one capsule eyebrow raised, a crooked capsule mouth.

Consistency constraints: all six cells are the IDENTICAL robot with the same proportions, colours and scale; only pose and expression change; feet aligned at local y = 360.

DO NOT INCLUDE: green owl, owl mascot, bear, cartoon bird mascot, any character from the reference images, brand mascots, logos; humans, people, a second robot, cats, fences, paint cans, coloured paint on the brush or the robot, weapons, lasers, scary robot features, red glowing eyes, blue or pink or teal-green or yellow body colours; facing left, back view; outlines, black outlines, line art, ink lines, strokes around shapes, sketchy lines, white sticker keyline; gradients, soft shading, cel shading, ambient occlusion, highlights, gloss, rim light, texture, grain, painterly brushwork, airbrush, drop shadow on the figure; 3D render, clay render, isometric, photorealistic, blur, lens flare, noise; anime face, manga eyes, coloured irises, tapered limbs; text, letters, words, labels, digits, numbers, captions, watermark, signature, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, question mark; background scenery, floor, ground, cast shadow on the ground; grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, white backing in transparent assets; sad faces, crying, angry faces.
~~~

## 6. `pecas.png` — grade 4 × 3, célula 256 × 256

| Célula | Nome | O quê |
|---|---|---|
| 0 | `card` | cartão **branco** de canto bem redondo (~200 × 150), com uma faixa-cápsula laranja embaixo, **liso e vazio** (o número e as bolinhas entram por código) |
| 1 | `loop` | uma **seta circular** grossa, laranja, feita de cápsula curva com a ponta triangular de canto redondo, dando a volta quase completa (↻): o "de novo" |
| 2 | `brush` | ícone de **pincel**: cabo-cápsula de madeira, cerdas cinza-claro (passo "pinte") |
| 3 | `step` | ícone de **seta para a direita** de canto redondo, com dois **pezinhos-cápsula** embaixo (passo "ande") |
| 4 | `cat-sleep` | **gato roxo-claro** feito de formas, dormindo enrolado numa almofada-cápsula cinza; olhos fechados em cápsula |
| 5 | `cat-jump` | o mesmo gato **de pé, num pulo de susto**: corpo esticado, patas soltas, olhos arregalados (quadrados brancos, pupila preta), boca aberta, cápsulas de movimento; **sem tinta** (as manchas entram por código) |
| 6 | `splat` | um **respingo de tinta BRANCO** chapado: um círculo com 4 gotinhas-círculo em volta |
| 7 | `can` | lata de tinta aberta, vista de frente: cilindro cinza-claro chapado, com a tinta **branca** na boca e uma escorridinha-cápsula branca |
| 8 | `guide-hand` | mão-luva do estilo no ângulo de `references/mao-toque-angulo.png` |
| 9–11 | — | vazias |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES (references/23-vetor-geometrico-a.webp and references/24-vetor-geometrico-b.png) AS THE ART STYLE REFERENCE and match their construction exactly: flat geometric vector illustration, assembled only from rounded rectangles, capsules and circles with a large, even corner radius. NO OUTLINES anywhere — every shape is separated by colour alone; where a shape must read against a same-coloured shape, use ONE flat panel of a darker, slightly more saturated tone of the SAME hue, with a hard edge — never a gradient, never a line. 100% flat colour: no shading, no cel shadow, no gradient, no texture, no grain, no airbrush, no rim light, no gloss. Eyes are large white rounded squares with a big solid black pupil and one tiny white dot; closed eyes are thick capsule strokes; an open mouth is one solid dark-maroon shape. Bright, high-chroma palette. Take ONLY the art style and the construction from the attached images: do NOT copy their characters, faces, clothes, poses or groupings. NO white sticker keyline. The third attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 8.

Use case: stylized-concept
Asset type: exact game-pieces sprite sheet for a Phaser 3 educational game about a painter robot.
Primary request: create ONE exact 4 columns × 3 rows sprite sheet on a transparent 1024 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin. Nothing may cross a cell boundary. No drawn grid, border or divider.

Exact cells, left to right and then top to bottom:
0. card — one white card with very rounded corners, about 200 × 150 px, with one orange (#FF9600) capsule strip along its bottom edge, PLAIN and completely EMPTY otherwise.
1. loop — one thick orange circular "repeat" arrow: a curved capsule going almost all the way around, ending in a rounded triangular arrowhead.
2. brush — one simple paintbrush icon: a light-wood capsule handle and light-grey bristles.
3. step — one simple rounded arrow pointing RIGHT with two small capsule footprints under it, dark grey.
4. cat-sleep — one cute cat built from shapes in light purple (#CE82FF), curled up asleep on a flat grey capsule cushion, closed eyes as capsule strokes, peaceful.
5. cat-jump — the SAME light-purple cat standing up in a funny startled jump: body stretched, detached paws, eyes wide (white rounded squares with black pupils), mouth open, a few dark motion capsules; NO paint on it.
6. splat — one flat pure WHITE paint splat: one circle with four small detached circle droplets around it.
7. can — one open paint can seen from the front: a flat light-grey cylinder with pure WHITE paint at its mouth and one white capsule drip down its side.
8. guide-hand — use references/mao-toque-angulo.png ONLY as the angle and silhouette reference. Create one mitten-style hand in this flat geometric style, light-brown skin, with the index finger as a separate straight capsule fully extended, pointing UP and leaning 20–25 degrees toward the LEFT, its tip clearly the touch point; the other fingers folded into the mitten on the RIGHT; the thumb as a small capsule folded inward; the short wrist capsule descending toward the LOWER RIGHT. No sleeve, no click lines.
9, 10, 11. completely EMPTY and genuinely transparent reserved cells.

Palette rule: orange #FF9600, light grey #E5E5E5, dark grey #4B4B4B, light purple #CE82FF, light wood; cells 6 and 7 carry pure white paint for tinting. No strong blue, pink, teal-green or yellow anywhere.

DO NOT INCLUDE: green owl, owl mascot, bear, cartoon bird mascot, any character from the reference images, brand mascots, logos; anything inside the card, numbers, dots, coloured paint, paint on the cat, extra animals, robots, people, extra objects, extra hands, click lines, radiating lines; outlines, black outlines, line art, ink lines, strokes around shapes, sketchy lines, white sticker keyline; gradients, soft shading, cel shading, highlights, gloss, texture, grain, painterly brushwork, airbrush; 3D render, isometric, photorealistic, blur, noise; text, letters, words, labels, digits, captions, watermark, signature, title lettering, user interface, panels, frames, speech bubbles, stars, HUD, question mark; objects in cells 9–11; grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, white backing in transparent areas; ground, floor, drop shadow on the cell; sad faces, crying, angry faces.
~~~

## 7. `cover-robo-pintor.png` — 1672 × 941, opaco

Na capa, o robô pintor está no meio de uma cerca: as tábuas atrás dele já estão
**coloridas** (azul, rosa, verde-água) e as da frente ainda estão cruas. No fim
da cerca, o gato roxo dorme. Na lousa aparece o laço ↻ com o pincel e a seta.
Em cima vai o título `Robô Pintor`. Anexe as refs `23`, `24` e **`26`** e as
folhas aprovadas.

### Prompt copiável

~~~text
STYLE — USE THE FIRST THREE ATTACHED IMAGES (references/23-vetor-geometrico-a.webp, references/24-vetor-geometrico-b.png and references/26-vetor-geometrico-d.png) AS THE ART STYLE REFERENCE and match their construction exactly: flat geometric vector illustration, assembled only from rounded rectangles, capsules and circles with a large, even corner radius. NO OUTLINES anywhere — every shape is separated by colour alone; where needed, ONE flat panel of a darker tone of the SAME hue, with a hard edge — never a gradient, never a line. 100% flat colour: no shading, no gradient, no texture, no gloss. Detached hands and feet, white rounded-square eyes with solid black pupils, small dark motion capsules. Bright, high-chroma, high-key palette. Take ONLY the art style and the construction from the reference images: do NOT copy their characters, faces, clothes, poses or groupings. NO white sticker keyline.
REFERENCES — THE OTHER ATTACHED IMAGES (robo.png, cerca.png, pecas.png) ARE THE ROBOT, FENCE AND CAT REFERENCES: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Robô Pintor”; the main action must read at thumbnail size; one flat light-grey capsule as the only ground shadow.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Robô Pintor” in large chunky rounded letters in ONE solid colour (orange #FF9600) with no outline, readable at thumbnail size. Spelling lock: render exactly two words, letter for letter, with capitalization and the accent exactly: R-o-b-ô [space] P-i-n-t-o-r. The “ô” in “Robô” MUST carry its circumflex accent. No extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, in a flat, simple, sunny backyard, the cute orange-and-light-grey painter robot with its beret stands in the middle of a wooden fence in an energetic off-balance pose, brushing one plank: the planks BEHIND it are freshly painted in flat blue (#1CB0F6), pink (#FF86D0) and teal-green (#2EC4A6), the planks in FRONT of it are still plain beige wood; at the end of the fence the light-purple cat sleeps on a grey cushion; on a small easel above, a dark-green chalkboard shows an orange circular repeat arrow around a brush icon and a right-arrow icon. Make "the robot repeats: paint, step, paint, step" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; robot, fence, cat and board large beneath it and fully visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: green owl, owl mascot, bear, cartoon bird mascot, any character from the reference images, brand mascots, logos; people, other animals; extra words, misspelled title, missing accent, subtitle, punctuation, numbers on the board, captions, signs with writing, watermark, signature, score, HUD, question mark, speech bubbles; outlines, black outlines, line art, strokes around shapes, sketchy lines, white sticker keyline; gradients, soft shading, cel shading, highlights, gloss, texture, grain, painterly brushwork, airbrush; 3D render, isometric, photorealistic, blur, lens flare, noise; cropped title, cropped robot, cropped fence; sad faces, crying, angry faces.
~~~

## 8. O que conferir quando a arte chegar (Tesoura / Ferro)

- a conferência da linha (`ESTILO-VETOR-GEOMETRICO.md` §2): **nenhum contorno,
  nenhum degradê, nenhuma keyline**, mão e pé soltos, pupila preta cheia, nenhuma
  coruja e nenhum urso, nenhuma letra;
- as grades: `robo` 1152 × 768, `cerca` 1024 × 512 (célula 256 × 512), `pecas`
  1024 × 1024; nenhuma peça cruzando célula;
- **as tábuas emendam**: colar a célula 0 com ela mesma e com o poste (2), e as ripas
  têm de continuar sem degrau (medir y das ripas nas bordas);
- a célula 1 (pintada) **sem ripas**, e em cima da célula 0 no mesmo lugar;
- a tábua pintada, o respingo e a lata **brancos chapados**, e testar o `tint`
  nas 4 tintas;
- o robô igual nas 6 poses, virado para a **direita**, pés em y = 360, pincel
  cinza; nenhuma cor das tintas nele;
- o gato roxo igual nas duas células;
- na `bg-quintal`, a lousa lisa e a faixa da cerca vazia;
- como não há contorno, conferir o robô laranja e o gato roxo **sobre a grama**
  do fundo: eles têm de se destacar sem ajuda;
- `tipX`/`tipY` do dedo medidos;
- a grafia do título da capa, **com o circunflexo de "Robô"**.
