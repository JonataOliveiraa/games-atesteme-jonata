# Catapulta do Arquivo — texturas

Destino: `src/assets/games/EF05CO06/catapulta-do-arquivo/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§4 a tela, §5 os mapas, §6 a física, §12 N2 e N3).

**Hoje o jogo roda sem nenhum PNG.** O `scenes/fallback.ts` desenha em `Graphics` cada arquivo abaixo, com a mesma chave e a mesma grade. Um PNG com o nome do arquivo na pasta de destino substitui o desenho, sem mexer no código.

**Os mapas não têm imagem própria.** São mapas largos (2000 a 3000 px), e o relevo vem de `data/maps.ts`. A arte entra por peças que se repetem: o **chão** é uma textura repetível recortada pelo formato do relevo, a **tábua** estica até a largura de cada plataforma, e a borda de cima do chão (grama, areia, neve) e os túneis são desenhados pelo código.

**Cada nível tem um lugar:** N1 campo de dia, N2 praia no fim da tarde, N3 serra à noite. Por nível mudam só o fundo e a textura do chão; aparelhos, peças, tábua e catapulta são os mesmos.

## Estilo de arte — chibi voador

Referência: **`references/35-chibi-voador.webp`**, anexada em **toda** geração (escolha do usuário em 20/10/2026; antes o plano usava o pop chapado `30`).

| | Chibi voador (este jogo) |
|---|---|
| Traço | liso, espessura média, num **tom mais escuro da própria cor** (marinho, marrom, verde-azulado escuro), nunca preto |
| Cor | chapada com **1 sombra macia**, quase sem degradê |
| Brilho | "+" brancos pequenos em superfícies brilhantes (metal, plástico) |
| Paleta | pastel lilás, verde-água, creme, marrom quente + poucos acentos saturados |
| Forma | roliça, gordinha, cantos redondos |
| Keyline | **não** |

**A referência tem nuvens, arco-íris e slimes.** Nas folhas de objeto, as nuvens soltas vão no negativo; na célula da **nuvem** (aparelho) e nos fundos com céu, não, porque a nuvem é o próprio alvo. O elenco (quatro meninos de Genshin) vai no negativo de todo prompt.

## 1. Os arquivos

| Arquivo | Nível | Grade | Célula | Tamanho | Alfa | Recorte | Uso |
|---|---|---|---|---|---|---|---|
| `bg-ceu.png` | N1 | — | — | 1280 × 720 | opaco | — | céu fixo atrás de tudo (não anda com a câmera) |
| `terra.png` | N1 | — | — | 256 × 256 | opaco | — | a terra, **repetível sem emenda** nos quatro lados |
| `bg-praia.png` | N2 | — | — | 1280 × 720 | opaco | — | céu de fim de tarde com o mar ao fundo |
| `areia.png` | N2 | — | — | 256 × 256 | opaco | — | areia molhada, repetível |
| `bg-serra.png` | N3 | — | — | 1280 × 720 | opaco | — | céu de noite com lua e montanhas ao fundo |
| `pedra.png` | N3 | — | — | 256 × 256 | opaco | — | rocha cinza-azulada, repetível |
| `borda-campo.png` | N1 | — | — | 512 × 96 | sim | — | a grama em cima do chão; repete na horizontal e o código a dobra pelo relevo |
| `borda-praia.png` | N2 | — | — | 512 × 96 | sim | — | a crista de areia clara com areia molhada |
| `borda-serra.png` | N3 | — | — | 512 × 96 | sim | — | a camada de neve fofa |
| `tunel-campo.png` | N1 | — | — | 128 × 256 | opaco | — | a parede do túnel, repete na vertical |
| `tunel-praia.png` | N2 | — | — | 128 × 256 | opaco | — | idem, de areia escura |
| `tunel-serra.png` | N3 | — | — | 128 × 256 | opaco | — | idem, de pedra |
| `tabua.png` | todos | — | — | 240 × 40 | sim | — | a tábua; o código estica o miolo (cantos de 18 px) |
| `aparelhos.png` | todos | 3 × 2 | 320 | 960 × 640 | sim | **não** | computador (com o HD dentro), HD interno, pen drive, cartão, HD externo, nuvem — em pé, base em y 300 |
| `pecas.png` | todos | 4 × 2 | 200 | 800 × 400 | sim | sim | vídeo, foto, música, trabalho, bolinha do arquivo, brilho, mola, mola apertada |
| `catapulta.png` | todos | 1 × 1 | 320 | 320 × 320 | sim | **não** | a catapulta de elástico |
| `cover-catapulta-do-arquivo.png` | — | — | — | 1672 × 941 | opaco | — | capa **com o título** |

**A ordem das células é contrato** (`data/files.ts`). Nas folhas sem recorte, a posição dentro da célula também é.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Pedido, nomes e LOCAL/REMOTO são do código. Só a capa tem letreiro.
- **Nada na arte dá a resposta:** nenhum dispositivo tem rosto, seta, check, X ou cor de certo/errado.
- **O HD interno tem cara de peça de dentro** (metal nu, parafusos); **o HD externo tem cara de aparelho** (capa, pezinhos, luzinha, cabo).
- Tudo visto **de lado/de frente**, sem perspectiva forte.
- Os dispositivos aparecem também **miniaturizados no mapinha** (≈ 22 px): silhueta forte e cor clara ajudam.
- **Fundo calmo embaixo:** a metade de baixo dos fundos fica só com morros/mar/montanhas distantes e lisos, porque o chão do jogo é desenhado por cima.

---

## 3. `terra.png` — 256 × 256, opaco, repetível (N1)

Terra marrom quente com pedrinhas e manchinhas, **sem nada que denuncie a repetição** (nenhuma pedra grande, nenhuma linha). Ao lado de si mesma, nos quatro lados, não pode aparecer emenda.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A SEAMLESS TILEABLE texture, 256 x 256, opaque, filling the whole square edge to edge: warm milk-chocolate brown EARTH seen from the side, with small rounded pebbles (cream, light brown, soft lilac-grey) scattered evenly, each pebble with a thin darker-brown outline and one tiny shadow, plus a few soft darker-brown specks. It must tile with no visible seam on all four sides: pebbles that touch an edge continue on the opposite edge. Evenly spread, nothing bigger than 22 px.

DO NOT INCLUDE: visible seams, borders, frames, vignette, a big stone, rocks bigger than the others, lines, layers, strata, roots, worms, grass, sky, horizon, perspective, objects, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `areia.png` — 256 × 256, opaco, repetível (N2)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A SEAMLESS TILEABLE texture, 256 x 256, opaque, filling the whole square edge to edge: packed beach SAND seen from the side, warm golden-peach color, with tiny scattered shell bits (cream and soft pink), small round pebbles and a few soft darker-orange specks, each tiny piece with a thin darker outline. It must tile with no visible seam on all four sides: anything that touches an edge continues on the opposite edge. Evenly spread, nothing bigger than 20 px.

DO NOT INCLUDE: visible seams, borders, frames, vignette, big shells, starfish, crabs, footprints, waves, water, lines, layers, strata, grass, sky, horizon, perspective, objects, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `pedra.png` — 256 × 256, opaco, repetível (N3)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A SEAMLESS TILEABLE texture, 256 x 256, opaque, filling the whole square edge to edge: mountain ROCK seen from the side at night, a calm slate blue-grey with a soft lilac tint, made of small rounded stones packed together, each with a thin dark-navy outline and one soft shadow tone, plus a few tiny pale-blue crystal specks. It must tile with no visible seam on all four sides: stones that touch an edge continue on the opposite edge. Evenly spread, nothing bigger than 30 px, low contrast so it stays calm behind the game.

DO NOT INCLUDE: visible seams, borders, frames, vignette, one big boulder, cracks running across the tile, lines, layers, strata, snow, ice, grass, sky, horizon, perspective, glowing gems, objects, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `tabua.png` — 240 × 40, alfa

Uma tábua de madeira deitada, com contorno, um veio claro em cima e um preguinho em cada ponta. **As pontas (18 px de cada lado) não esticam**; o miolo sim, então ele precisa ser uniforme.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

One sprite, 240 x 40 (a wide 6:1 strip), fully TRANSPARENT background: a horizontal wooden PLANK seen exactly from the side, filling the whole width, honey-brown wood with a deep-brown outline, rounded ends, one light wood-grain line running straight along the top, a soft shadow tone along the bottom, and one small silver nail near each end (within 18 px of each end). Between the two nails the plank is perfectly UNIFORM (no knots, no marks) so it can be stretched.

DO NOT INCLUDE: knots, cracks, holes, bark, ropes, legs, supports, a shadow on the ground, perspective, a second plank, backgrounds, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `aparelhos.png` — 3 × 2 células de 320, alfa, sem recorte

**Refeita em 20/10/2026.** A primeira versão foi reprovada: *"a textura dos componentes são mt feias e não parece combinar com o do ambiente"*. Ela tinha traço escuro grosso, brilho de plástico, perspectiva de 3/4 e muito detalhe de peça real, ao lado de fundos macios e pastel. E agora os aparelhos **ficam em pé na superfície** (não mais no fundo de buracos), então cada um precisa de uma base reta.

**Para combinar com o ambiente:** a mesma mão dos fundos (`bg-ceu`, `bg-praia`, `bg-serra`): formas simples e roliças de brinquedo, **pouco detalhe**, traço médio no tom mais escuro da própria cor (nunca marinho-escuro em tudo), sombra chapada única e macia, a paleta pastel dos fundos (azul-céu, menta, sálvia, pêssego, lilás, creme). Vistos **de frente**, retos, sem 3/4.

| Célula | Peça | Contrato |
|---|---|---|
| 0 | **computador**: torre de pé com a tampa do lado aberta e o **HD visível lá dentro** | ≈ 200 × 280, base em y 300, centrado em x |
| 1 | **HD interno** sozinho (só para ícones e plaquinhas) | ≈ 160 × 110, base em y 300 |
| 2 | **pen drive** em pé, ponta USB para cima | ≈ 90 × 200, base em y 300 |
| 3 | **cartão de memória** em pé | ≈ 140 × 180, base em y 300 |
| 4 | **HD externo** em pé, com pezinhos e cabinho | ≈ 160 × 200, base em y 300 |
| 5 | **nuvem** fofa | ≈ 240 × 160, centrada (sem base) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (soft teal, warm brown, dusty lilac — never pure black, never one heavy dark navy line around everything); flat cel shading with ONE soft shadow tone and no gradients; a few small white "+" sparkle marks; soft pastel palette (sky blue, mint-teal, sage green, peach, lilac, cream) like a gentle storybook landscape; soft rounded chunky TOY-LIKE shapes with very few details. Take ONLY the art style: do NOT copy its characters, outfits, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 320 x 320 (total 960 x 640), read left to right, top row first, all at the same scale. Each object is seen straight from the FRONT (no 3/4 view, no perspective), simple and friendly like a cute toy, and STANDS UPRIGHT with its flat bottom resting exactly on the line y = 300 of its cell, horizontally centered.
1. A cute desktop COMPUTER TOWER, about 200 x 280, pale lilac-grey body with rounded corners, its side panel open so we see inside: a round mint fan at the top and, in the middle, a small silver HARD DRIVE plate with a cream label sitting in its slot. Two little round feet.
2. An INTERNAL HARD DRIVE alone, about 160 x 110: a simple rounded silver-grey plate with a blank cream label and four tiny screws, front view, resting flat on its long edge.
3. A USB PEN DRIVE standing UP, about 90 x 200: chunky mint-teal body, silver USB tip pointing UP, a small ring loop at the bottom side.
4. A MEMORY CARD standing up, about 140 x 180: soft lilac card with one cut top corner, a cream label area and a row of soft-gold contacts at the bottom.
5. An EXTERNAL HARD DRIVE standing up, about 160 x 200: a rounded peach-coral box with a soft cover, one tiny mint lamp, two rubber feet and a short cable curling at its side.
6. A fluffy white CLOUD, about 240 x 160, chubby with three puffs, a soft lilac shadow along its bottom, centered in the cell (it floats, no base).

DO NOT INCLUDE: dark backgrounds, glow, halo, colored aura, drop shadows, shadows on the ground, glossy plastic highlights, heavy thick dark outlines, realistic tech detail, cables between cells, 3/4 views, perspective, faces or eyes on objects, arrows, check marks, X marks, red or green highlights, text, letters, numbers, logos, labels with writing, screens, keyboards, people, hands, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, clouds with faces, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `pecas.png` — 4 × 2 células de 200, alfa, com recorte

| Célula | Peça |
|---|---|
| 0 | **vídeo**: claquete aberta |
| 1 | **foto**: fotinho com montanha e sol |
| 2 | **música**: nota dupla |
| 3 | **trabalho**: folha com linhas e lápis |
| 4 | **bolinha do arquivo**: esfera branca lisa com aro lilás, **vazia no meio** (o código põe o ícone do arquivo em cima) |
| 5 | **brilho**: estrelinha de 4 pontas amarela |
| 6 | **mola**: base de metal, molas, tampo coral — **solta**, larga (≈ 2,6 : 1 de largura por altura) |
| 7 | **mola apertada**: a mesma, comprimida (mais baixa) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 200 x 200 (total 800 x 400), read left to right, top row first. Chunky, centered icons at the same scale, each about 75% of its cell, with clear empty space between them.
1. An open movie CLAPPERBOARD, lilac and cream stripes.
2. A small PHOTO print with a white border, showing a green mountain and a yellow sun.
3. A double MUSIC NOTE in mint-teal.
4. A sheet of PAPER with a few grey lines and a yellow pencil lying across it.
5. A plain white BALL with a thick lilac ring around its edge and an EMPTY plain white middle (nothing drawn inside), one small "+" sparkle.
6. A sunny-yellow four-point STAR twinkle.
7. A cartoon SPRING PAD seen exactly from the side: grey metal base plate, three silver metal coils, a coral top plate, fully EXTENDED (about 2.6 times wider than tall).
8. The SAME spring pad SQUASHED down, coils compressed, the same width, about half as tall.

DO NOT INCLUDE: faces or eyes on objects, text, letters, numbers, play buttons, app icons, round tiles or backgrounds behind the icons, frames, shadows on the ground, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. `catapulta.png` — 1 célula de 320, alfa, sem recorte

Catapulta de madeira **de elástico** (um Y grande num carrinho de duas rodas), de frente. **As rodas tocam y = 300** da célula; **as pontas do Y ficam em (110, 30) e (210, 30)**: o código prende os elásticos ali. Sem elástico desenhado.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

One sprite, 320 x 320, fully TRANSPARENT background: a cute chunky wooden SLINGSHOT CATAPULT seen from the front: a big Y-shaped honey-brown wooden fork standing on a small mint-teal cart with two round wheels. The bottoms of the wheels touch y = 300 of the image; the two tips of the Y are at exactly (110, 30) and (210, 30), each tip with a small lilac wrap. NO rubber band and nothing between the two tips.

DO NOT INCLUDE: a rubber band, an elastic, a pouch, a ball, a stone, a projectile, ropes, a person, hands, ground, grass, shadow on the ground, backgrounds, text, letters, numbers, faces or eyes on the catapult, perspective views, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 10. `bg-ceu.png` — 1280 × 720, opaco (N1)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, slimes, rainbow, speech bubbles or framing.

A full game BACKGROUND, 1280 x 720, opaque, NO white sticker keyline here: a bright, soft daytime SKY in light sky-blue fading to a pale lilac near the horizon, a round sunny-yellow sun at the top right, two or three SMALL far-away decorative white clouds near the top, and a few tiny "+" sparkles. Along the lower part, from about y 420 down to the bottom, gentle rolling far-away HILLS in soft pastel mint and sage green, simple and smooth, getting a little darker toward the bottom. The middle of the image stays calm and open.

DO NOT INCLUDE: ground in the foreground, roads, trees in front, houses, buildings, computers, objects, people, animals, big clouds in the middle, rainbows, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, white sticker keyline.
~~~

---

## 11. `bg-praia.png` — 1280 × 720, opaco (N2)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, slimes, rainbow, speech bubbles or framing.

A full game BACKGROUND, 1280 x 720, opaque, NO white sticker keyline here: a seaside in the LATE AFTERNOON. The sky goes from soft lilac at the top to warm peach and pale coral near the horizon; a big round warm-orange sun sits low at the right, half above the sea line; two or three SMALL far-away decorative clouds tinted pink. From about y 430 down, a calm mint-teal SEA with a few simple wave lines and sparkles reflecting the sun, and two tiny far-away palm-tree islands on the left. The bottom of the image is just calm sea, no beach in the foreground. The middle of the image stays calm and open.

DO NOT INCLUDE: sand in the foreground, beach umbrellas, boats, people, animals, birds, buildings, objects, computers, big clouds in the middle, rainbows, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, white sticker keyline.
~~~

---

## 12. `bg-serra.png` — 1280 × 720, opaco (N3)

À noite as nuvens-alvo (brancas) e os aparelhos precisam saltar do fundo: céu escuro, mas **marinho-lilás**, não preto.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, slimes, rainbow, speech bubbles or framing.

A full game BACKGROUND, 1280 x 720, opaque, NO white sticker keyline here: a cozy MOUNTAIN NIGHT. The sky is a calm deep navy-lilac (never black) getting a little lighter violet toward the horizon, with many small "+" sparkle stars and tiny dots, and a big round cream MOON with a soft halo at the top left. From about y 400 down, layered far-away MOUNTAINS in soft indigo and dusty violet, with gentle snowy caps in pale lilac-white, simple smooth shapes, darker toward the bottom. The middle of the image stays calm and open.

DO NOT INCLUDE: ground in the foreground, trees in front, houses, cabins, lights, campfires, people, animals, owls, objects, computers, clouds in the middle, auroras, rainbows, pure black areas, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, white sticker keyline.
~~~

---

## 13. `cover-catapulta-do-arquivo.png` — 1672 × 941, opaco, com o título

**Refeita em 20/10/2026:** a primeira capa pôs um menino que não existe no jogo (*"a splash art do jogo coloca um personagem que nunca existiu no jogo, refaça"*). **Nenhuma pessoa:** só o que o jogo tem (catapulta, arquivo voando, aparelhos em pé na grama, túnel, tábua, mola, nuvem).

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks; soft pastel palette (sky blue, mint-teal, sage green, peach, lilac, cream) with a few clear saturated accents; soft rounded chunky toy-like shapes. Take ONLY the art style: do NOT copy its characters, outfits, slimes, rainbow, speech bubbles or framing.

A game COVER illustration, 1672 x 941, landscape, opaque, NO white sticker keyline here, seen from the side like a slice of the game world. A sunny pastel hilly landscape with soft green grass on top of brown earth. On the left, on a grassy hill, a chunky wooden SLINGSHOT CATAPULT (a big Y-shaped fork on a small mint-teal cart with two wheels) has just fired: a white BALL with a lilac ring and a little PHOTO icon on it flies in a big happy arc across the sky, leaving a trail of "+" sparkles. Across the landscape, cute toy-like storage devices STAND UPRIGHT on the grass: a lilac computer tower with its side open showing a hard drive inside, a mint USB pen drive standing up, a lilac memory card, a peach external hard drive. One round hole in the grass leads into a visible underground TUNNEL that curves through the earth and comes out further along. A wooden plank floats above a hill and a coral spring pad sits on the grass. High in the sky on the right floats a fluffy white CLOUD, the ball heading toward it. At the top center, a big rounded TITLE that reads exactly "Catapulta do Arquivo", in chunky colorful letters (lilac, mint-teal and sunny yellow) with a thick dark-navy outline and a slight volume, easy to read.

DO NOT INCLUDE: people, children, kids, characters, mascots, animals, hands, faces or eyes on objects, misspelled title, extra text, subtitles, logos, labels on the devices, arrows, check marks, X marks, weapons, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, rainbows, speech bubbles with symbols, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, white sticker keyline.
~~~

---

## 14. As bordas do chão — `borda-campo.png`, `borda-praia.png`, `borda-serra.png` (512 × 96, alfa)

Pedido do usuário (20/10/2026): a grama feita em `Graphics` não ficava bonita. A borda vira uma **faixa de textura** que o código repete ao longo do relevo e **dobra nas subidas e descidas** (uma `Rope` do Phaser), então:

- **Repetível na horizontal, sem emenda** (a ponta esquerda continua na direita).
- **A linha do chão fica em y = 36.** Acima dela (y 0–36) só o que sai para cima (folhinhas, tufos, montinhos de neve), com fundo transparente. Abaixo (y 36–~84) a camada (grama, areia clara, neve), com a **borda de baixo irregular** que termina em transparente: por baixo dela aparece a textura do chão.
- Nada grande e único (nenhuma flor gigante, nenhuma pedra): o desenho se repete a cada 512 px.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

One horizontal strip, 512 x 96, fully TRANSPARENT background, seen exactly from the side: the GRASSY TOP EDGE of a hill, to be repeated side by side. A lush, chunky band of fresh green GRASS whose top surface runs perfectly straight and horizontal at y = 36; from that line, small rounded grass tufts and blades stick UP (up to about y 6), in two greens with a lighter mint top highlight, a few tiny white and yellow flower dots. Below the line, the grass layer is about 40 px thick, with a soft darker-green shadow tone, and its BOTTOM edge is wavy and irregular (soft rounded drips of grass, a couple of tiny brown root lines) ending around y 84; below that everything is transparent. SEAMLESS HORIZONTALLY: the left edge continues exactly into the right edge. Evenly spread details, nothing big or unique.

DO NOT INCLUDE: dirt, soil, rocks, a full hill, sky, backgrounds, big flowers, mushrooms, trees, bushes, fences, insects, animals, people, perspective, a slanted surface, vignette, borders, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

One horizontal strip, 512 x 96, fully TRANSPARENT background, seen exactly from the side: the SANDY TOP EDGE of a beach dune, to be repeated side by side. The top surface runs perfectly straight and horizontal at y = 36; from that line only a few very small rounded sand bumps, tiny pink and cream shells and a couple of short beach-grass sprigs stick UP (up to about y 14). Below the line, a band of light cream-gold dry SAND about 20 px thick with soft ripple marks, then a band of slightly darker peach WET SAND about 20 px thick with a thin white foam-like line between them; the BOTTOM edge is wavy and irregular, ending around y 84; below that everything is transparent. SEAMLESS HORIZONTALLY: the left edge continues exactly into the right edge. Evenly spread details, nothing big or unique.

DO NOT INCLUDE: water, waves, sea, sky, backgrounds, starfish, crabs, umbrellas, palm trees, big shells, rocks, people, animals, perspective, a slanted surface, vignette, borders, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

One horizontal strip, 512 x 96, fully TRANSPARENT background, seen exactly from the side, at NIGHT: the SNOWY TOP EDGE of a mountain, to be repeated side by side. A soft, fluffy layer of SNOW whose top surface runs almost straight and horizontal at y = 36, with gentle rounded snow lumps rising up to about y 16 and a few tiny "+" sparkles; snow is pale lilac-white with a soft periwinkle shadow tone and a thin dark-navy outline. Below the line the snow layer is about 36 px thick, and its BOTTOM edge has soft rounded drips and a couple of tiny icicles, ending around y 84; below that everything is transparent. SEAMLESS HORIZONTALLY: the left edge continues exactly into the right edge. Evenly spread details, nothing big or unique.

DO NOT INCLUDE: rock, stone, ground, sky, stars, moon, backgrounds, trees, snowmen, footprints, people, animals, perspective, a slanted surface, vignette, borders, pure white glare, text, letters, numbers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 15. Os túneis — `tunel-campo.png`, `tunel-praia.png`, `tunel-serra.png` (128 × 256, opaco)

A parede de dentro do buraco, vista de frente, **repetível na vertical** (o código a repete do topo da boca até o fundo e põe o aparelho em cima). Mais escura que o chão, para o buraco ler como buraco.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A SEAMLESS TILEABLE texture, 128 x 256, opaque, filling the whole image edge to edge: the inside back wall of an underground TUNNEL seen from the front, in DARK cozy chocolate-brown earth (clearly darker than normal soil), with a few small rounded pebbles and thin curly roots, a slightly darker shadow tone at the far left and far right edges like a rounded shaft. It must tile with no visible seam from TOP to BOTTOM (anything that touches the top edge continues at the bottom edge). Low contrast and calm, nothing bigger than 24 px.

DO NOT INCLUDE: light at the end, objects, worms, animals, bones, treasure, ladders, lamps, sky, grass, text, letters, numbers, visible seams, borders, frames, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

`tunel-praia.png`: o mesmo prompt trocando o corpo por *"dark wet SAND tunnel wall, deep warm caramel-brown, tiny shell bits and small pebbles"* (e no negativo, *"water, sea"*). `tunel-serra.png`: *"dark mountain ROCK tunnel wall, deep indigo-slate stones packed together, a few tiny pale-blue crystal specks"* (e no negativo, *"glowing gems, snow"*).

---

## 16. Quando a arte chegar

1. Salve os PNGs com os nomes do §1 na pasta de destino.
2. Confira `terra.png`, `areia.png` e `pedra.png` repetidas (o código as usa em mapas de até 3000 px): emenda aparece na hora.
3. Confira as folhas sem recorte contra os contratos de posição (§7, §9).
4. Importe a capa no `src/data/catalog.ts` (`thumbnail`) e gere o og.
