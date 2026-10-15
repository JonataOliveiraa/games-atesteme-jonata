# Câmera na Trilha — texturas

Destino: `src/assets/games/EF04CO06/camera-na-trilha/` (medidas da entrega no `MANIFEST.md` de lá)

**Entregues em 14/10/2026:** teo, teo-andar, natureza, cenario, cachoeira, camera-ui, ui, gruta e bosque. **Faltam:** `gruta-bichos.png` e a capa.
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§4 visor, §6 tela, §7 mapa, §8 pedidos).

**Com imagem de referência:** anexe em **toda geração** a `references/36-floresta-chapada.webp`. É a ilustração da floresta verde-azulada com uma moça de cabelo preto e um monstrinho rosa de olhos esbugalhados, com o título "Defining Game Style".
- Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*.
- O elenco da referência (a moça, o monstrinho, os tentáculos), o título e a marca d'água vão no negativo de todos os prompts.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

## O estilo: floresta chapada

Trocado em 14/10/2026, a pedido do usuário (antes era o chibi voador, `35`).

| | Floresta chapada (`36`, esta) | Chibi voador (`35`, a anterior) |
|---|---|---|
| contorno | **nenhum**: as formas se separam só pela cor e pelo tom | traço liso num tom mais escuro da cor |
| cor | chapada, com 1 tom de sombra e 1 de luz, borda macia e granulado bem leve | chapada, com 1 sombra macia |
| paleta | verde-azulado escuro, jade, menta enevoado, musgo lima, coral-rosado, salmão, rosa-claro e branco esverdeado | pastel lilás, verde-água e creme |
| luz | brilho suave nas superfícies claras; vagalumes só na capa | "+" brancos de brilho |
| gente | proporção estilizada, **não chibi**: cabeça grande (≈ 1/3), rosto de traços pequenos, bochecha rosada, cabelo em massas chapadas | cabeça ≈ metade do corpo, olhos enormes |
| keyline | nenhuma | nenhuma |

Cores medidas na referência: fundo enevoado `#5fbca3`, árvores do meio `#34856e`, chão `#1c5554`/`#2f7250`, sombra profunda `#0b3139`, musgo `#b7d15b`, coral `#be4a58`, salmão `#ffa193`, rosa-claro `#f3d7ec`, branco do vestido `#c7d5d0`, vagalume `#d7fee1`.

## 1. Os arquivos

| Arquivo | Nível | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|---|
| `teo.png` | todos | 4 × 2 | 320 | 1280 × 640 | sim | o Téo: 3 direções, 3 com o tablet erguido, comemorando, "ops" |
| `teo-andar.png` | todos | 4 × 3 | 350 × 450 | 1400 × 1350 | sim | o andar do Téo: 4 quadros de frente, 4 de costas, 4 de lado (§3.1) |
| `natureza.png` | N1 | 4 × 2 | 256 | 1024 × 512 | sim | os assuntos do prado: cogumelos, borboleta (2), girassol, sapo (2), pato, vitória-régia |
| `cenario.png` | N1, N3 | 4 × 2 | 320 | 1280 × 640 | sim | árvores, arbusto, pedra, tronco, juncos, píer, florzinhas |
| `cachoeira.png` | N1 | 2 × 1 | 512 | 1024 × 512 | sim | a cachoeira em 2 quadros |
| `camera-ui.png` | todos | 4 × 2 | 256 | 1024 × 512 | sim | disparar FOTO, gravar, parar, ícone câmera, ícone filmadora, lâmpada apagada/acesa, lupa |
| `ui.png` | todos | 3 × 2 | 640 × 480 | 1920 × 960 | sim | cartão do pedido, polaroide, moldura de filme, base e bolinha do joystick, botão em branco |
| `cover-camera-na-trilha.png` | — | — | — | 1672 × 941 | opaco | capa **com o título** |
| `gruta.png` | N2, N3 | 4 × 2 | 320 | 1280 × 640 | sim | estalagmite, cristais (2), pedra, poça, cogumelos que brilham (aceso / sob luz), cascalho |
| `gruta-bichos.png` | N2 | 4 × 2 | 256 | 1024 × 512 | sim | peixe-cego (2), vaga-lume (aceso / apagado), gota, respingo, musgo que brilha (aceso / sob luz) |
| `bosque.png` | N3 | 4 × 2 | 320 | 1280 × 640 | sim | árvore gigante, joaninha na folha, ninho, formigueiro, formiga, flor, abelha (2) |

**O chão não tem folha.** A grama, a trilha, o lago, o riacho e as paredes da gruta são feitos em código e assados (§7 do plano).

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** FOTO, VÍDEO, LUZ, ZOOM, os nomes e as dicas são escritos pelo código. Só a capa tem o título.
- **Vista de cima inclinada (3/4)**, igual em todas as peças do mundo: vê-se o alto **e** a frente das coisas, como num RPG de aventura. Nunca de lado e nunca reto de cima.
- **Quem olha para um lado olha para a DIREITA** (o Téo de lado, o pato, o peixe, a formiga, a abelha). O código espelha para a esquerda.
- **As peças que trocam de quadro têm o mesmo tamanho e o mesmo lugar** nas duas células (borboleta, sapo, cachoeira, cogumelos, peixe, vaga-lume, musgo, abelha).
- Peça solta e centrada na célula, com cerca de 8 % de margem. Sem chão e sem sombra no chão (o código desenha a sombra).
- **Fundo transparente de verdade.** A referência é uma cena escura de floresta, e o gerador tende a copiar esse fundo. Por isso o negativo das folhas proíbe a floresta escura e os pontinhos de vagalume soltos.
- **O chão feito em código usa a paleta acima** desde que as folhas entraram (14/10/2026).
- A cor do **botão em branco** e dos ícones de modo continua clara, porque o código tinge o botão (menta para FOTO, lilás para VÍDEO).

---

## 3. `teo.png` — 4 × 2 células de 320 (1280 × 640), alfa

O **Téo**: menino de uns 9 anos, desenhado com proporção estilizada (cabeça ≈ 1/3 da altura, **sem ser chibi**). Tem **cabelo loiro dourado** bagunçado com um topete, **olhos verdes** pequenos e amendoados, bochecha rosada, e usa colete de explorador **coral-rosado** com bolsos sobre camiseta branco-esverdeada, bermuda azul-ardósia escura, tênis branco-esverdeados com cadarço coral e uma mochilinha caramelo. Segura um **tablet** de capinha lilás-clara.

| Célula | Pose |
|---|---|
| 0 | de **frente** (olhando para baixo da tela), em pé, tablet na mão ao lado do corpo |
| 1 | de **costas** (olhando para cima da tela), tablet na mão |
| 2 | de **lado, virado para a DIREITA**, no meio de um passo |
| 3 | de frente, **tablet erguido** na frente do rosto (vê-se o verso do tablet, com a lentezinha), fotografando |
| 4 | de costas, **tablet erguido** acima da cabeça (vê-se a tela acesa) |
| 5 | de lado (DIREITA), **tablet erguido** à frente |
| 6 | **comemorando**: de frente, os dois braços para cima, tablet numa das mãos, sorriso enorme |
| 7 | **"ops"**: de frente, mão na cabeça, gotinha de suor, sorriso sem graça |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; light-colored surfaces have a soft inner glow; characters with soft stylized proportions (NOT chibi), small simple facial features (small almond-shaped eyes, a tiny nose, a small mouth), a soft rosy blush, and hair drawn as big flat masses with a few lighter strands. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. The SAME boy in all 8 cells, same size, same outfit, full body, centered with about 8% margin, drawn for a cozy top-down adventure game (camera from above at about 45 degrees, so we see the top of his head and his front). The boy, TÉO, about 9 years old, stylized proportions with the head about one third of his height: messy GOLDEN BLOND hair with a little cowlick, small bright GREEN almond eyes, light skin with rosy cheeks, a coral-rose explorer vest with pockets over a mint-white T-shirt, dark slate-blue shorts, mint-white sneakers with coral laces, a small caramel backpack, holding a TABLET with a pale lilac case.
1. Facing DOWN (toward the viewer), standing, tablet held at his side, friendly smile.
2. Facing UP (back to the viewer), standing, tablet at his side, we see the backpack.
3. Facing RIGHT (side view of the body, head turned right), mid-step walking, tablet at his side.
4. Facing DOWN, holding the tablet UP in front of his face with both hands to take a photo (we see the back of the tablet with a small round camera lens), eyes peeking over it.
5. Facing UP (back to the viewer), holding the tablet UP above his head with both hands, its screen glowing softly toward us.
6. Facing RIGHT, holding the tablet up in front of him with both hands, taking a photo.
7. Facing DOWN, cheering: both arms up, tablet in one hand, huge happy smile, eyes closed in joy.
8. Facing DOWN, "oops": one hand scratching his head, a small sweat drop, an awkward little smile.

DO NOT INCLUDE: girls, women, other characters, animals, a camera other than the tablet, phones, backgrounds, ground, shadows on the ground, text, letters, numbers, logos or apps on the tablet, dark hair, brown hair, black hair, red hair, blue eyes, brown eyes, hats, glasses, flowers in the hair, different outfits between cells, different sizes between cells, items crossing cell borders, items cut by the cell edge, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, chibi proportions, huge anime eyes, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the dark forest background of the reference image, floating firefly specks, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

### 3.1 `teo-andar.png` — 4 × 3 células de 350 × 450 (1400 × 1350), alfa

O ciclo de andar, pedido em 14/10/2026. A célula é igual à da `teo.png`, e a escala bate. **Anexe as duas imagens:** a `references/36-floresta-chapada.webp` (estilo) e a `teo.png` (o personagem). Linha 1: andando de frente. Linha 2: de costas. Linha 3: de lado, para a direita.

Cada linha é um passo completo de 4 quadros:
- quadro 1: a perna A à frente;
- quadro 2: a passagem;
- quadro 3: a perna B à frente, o **espelho** do quadro 1;
- quadro 4: a passagem do outro lado.

**Regra principal:** a perna que está na frente no quadro 1 está atrás no quadro 3.

Histórico:
- **1ª geração:** veio com **fantasmas** (cópias semitransparentes do Téo, em outras poses da `teo.png`).
- **2ª geração** (refeita em 14/10/2026): na linha de lado o Téo **mexia uma perna só**, sempre com a mesma perna na frente. Por isso o prompt abaixo descreve cada quadro e diz qual perna está onde.
- **3ª geração** (14/10/2026, com este prompt): as passadas (quadros 1 e 3) vieram certas, mas as duas passagens (quadros 2 e 4) vieram iguais, e o jogo contorna isso (ver o MANIFEST). Se for refazer, reforce que o quadro 4 é o **espelho** do quadro 2: no 2 levanta uma perna, no 4 levanta a outra.

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; characters with soft stylized proportions (NOT chibi), small simple facial features, a soft rosy blush, and hair drawn as big flat masses with a few lighter strands. Take ONLY the art style from the first image: do NOT copy its characters, creatures, forest scene, text or framing.

CHARACTER — USE THE SECOND ATTACHED IMAGE AS THE CHARACTER REFERENCE: draw EXACTLY the same boy, TÉO, with the same face, the same proportions, the same size and the same outfit as in that sheet: messy GOLDEN BLOND hair with a little cowlick, small bright GREEN almond eyes, rosy cheeks, a coral-rose explorer vest with pockets over a mint-white T-shirt, dark slate-blue shorts, mint-white sneakers with coral laces, a small caramel backpack, and a TABLET with a pale lilac case held in his RIGHT hand at his side in every frame. Use the second image ONLY for his look: do NOT copy its poses (no raised tablet, no cheering, no sweat drop).

A WALK CYCLE sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 3 rows, each cell 350 x 450 (total 1400 x 1350), read left to right, top row first. Drawn for a cozy top-down adventure game (camera from above at about 45 degrees, so we see the top of his head and his front). Each row is ONE full step cycle of a calm, cheerful walk (NOT running), in exactly 4 frames, and BOTH legs take turns: the leg that is in front in frame 1 is the leg that is behind in frame 3. Each cell contains ONE single fully opaque boy.

THE WALK, FRAME BY FRAME (the same rhythm in every row):
- Frame 1, CONTACT A: his LEFT leg is stretched forward with the heel touching the ground; his RIGHT leg is stretched back with only the toes touching the ground; legs clearly apart in a wide stride. His RIGHT arm (with the tablet) swings forward and his LEFT arm swings back.
- Frame 2, PASSING A: his LEFT foot is flat on the ground right under his body, carrying his weight, with the leg straight; his RIGHT knee is bent and the RIGHT foot is lifted off the ground, passing next to the left ankle on its way to the front. Arms close to the body. His head is a little higher than in frame 1.
- Frame 3, CONTACT B — THE MIRROR OF FRAME 1: now his RIGHT leg is stretched forward with the heel touching the ground and his LEFT leg is stretched back on its toes; wide stride. His LEFT arm swings forward and his RIGHT arm (with the tablet) swings back.
- Frame 4, PASSING B — THE MIRROR OF FRAME 2: his RIGHT foot is flat under his body carrying the weight; his LEFT knee is bent and the LEFT foot is lifted, passing next to the right ankle on its way to the front. Arms close to the body. Head a little higher.

Row 1: walking DOWN, toward the viewer (front view, we see his face). His LEFT leg is on the RIGHT side of the image and his RIGHT leg (and the tablet) on the LEFT side of the image. The forward foot is lower on the image and a bit bigger; the back foot is higher, shorter and partly hidden behind the other leg. In frame 1 the leg on the right side of the image is the forward one; in frame 3 the leg on the left side of the image is the forward one.
Row 2: walking UP, away from the viewer (back view, we see the backpack and the back of his head). His LEFT leg is on the LEFT side of the image and his RIGHT leg (and the tablet) on the RIGHT side. The forward foot is higher on the image and a bit smaller; the back foot is lower and shows the sole of the sneaker. In frame 1 the leg on the left side of the image is the forward one; in frame 3 the leg on the right side of the image is the forward one.
Row 3: walking to the RIGHT (side view, nose, chest and toes pointing to the right edge of the cell). His RIGHT side faces the viewer: his RIGHT leg is the NEAR leg (fully visible, normal colors) and the tablet hangs from the near hand; his LEFT leg is the FAR leg (behind the near leg, partly hidden, drawn one tone darker), and his left arm is mostly hidden behind the body. In frame 1 the FAR leg is in FRONT (toward the right edge) and the NEAR leg is BEHIND (toward the left edge); in frame 3 the NEAR leg is in FRONT and the FAR leg is BEHIND. Between frame 1 and frame 3 the two legs must clearly swap places, making an upside-down "V" that opens one way and then the other; in frames 2 and 4 the lifted knee points forward (to the right). The back leg must never stay frozen in the same pose.

VERY IMPORTANT for animation: in all 12 cells the boy has the SAME size and the SAME proportions, is centered horizontally in his cell, and the sole of the foot that carries his weight rests on the SAME horizontal ground line, about 20 px above the bottom of the cell. Only the lifted foot leaves that line. Nothing crosses the cell borders.

DO NOT INCLUDE: only one leg moving, the same leg in front in frames 1 and 3, a frozen back leg, legs that never cross, both feet flat side by side in every frame, three legs, extra or missing legs, crossed or tangled legs, sliding feet, ghost duplicates, semi-transparent copies of the boy, onion-skin overlays, faded extra arms or legs, overlapping poses in one cell, girls, women, other characters, animals, a camera other than the tablet, phones, backgrounds, ground, floor, shadows on the ground, motion blur, speed lines, dust clouds, footprints, running poses, jumping, both feet in the air, the tablet raised to the face or above the head, the tablet switching hands, cheering arms, sweat drops, text, letters, numbers, logos or apps on the tablet, dark hair, brown hair, black hair, red hair, blue eyes, brown eyes, hats, glasses, flowers in the hair, a different face or outfit from the character reference, different sizes between cells, feet at different heights between frames, items crossing cell borders, items cut by the cell edge, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, chibi proportions, huge anime eyes, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the dark forest background of the style reference, floating firefly specks, red noise or speckles around the figure, the characters and creatures from the style reference (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 4. `natureza.png` — 4 × 2 células de 256 (1024 × 512), alfa

Os assuntos do prado, todos na vista 3/4.

| Célula | Peça | Uso |
|---|---|---|
| 0 | **cogumelos**: um tufinho de 3 cogumelos bege e marrom-claro | foto da demonstração |
| 1 | **borboleta** de asas **abertas**, coral-rosada e salmão, vista de cima | voa (quadro A) |
| 2 | a **mesma borboleta** com as asas **meio fechadas** | voa (quadro B) |
| 3 | **girassol** alto, a flor virada para cima e para a frente | foto |
| 4 | **sapo** verde-musgo **sentado**, fofo, de frente | foto e vídeo (parado) |
| 5 | o **mesmo sapo pulando**, esticado no ar, virado para a DIREITA | vídeo (o pulo) |
| 6 | **pato** branco-esverdeado **nadando**, virado para a DIREITA, com um anelzinho de água em volta | foto e vídeo |
| 7 | **vitória-régia**: folha redonda grande flutuando, vista de cima, com uma florzinha rosa-clara | onde o sapo senta |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; simple layered stylized shapes (rounded leaf masses, flowers with simple petals and a darker ring around the center); enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; light-colored surfaces have a soft inner glow. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Cute, round nature things for a cozy top-down adventure game (camera from above at about 45 degrees, so we see the top AND the front of each thing), each centered with about 8% margin, no ground, no shadow. Animals are cute round friendly animals with small simple faces, NOT people.
1. A little cluster of three mushrooms with beige caps, soft brown spots and mint-white stems.
2. A BUTTERFLY seen from above with its wings wide OPEN: coral-rose upper wings, salmon lower wings, small pale-pink spots, a dark teal body.
3. The SAME butterfly, same size and place, with its wings half CLOSED (raised and narrower).
4. A tall cheerful SUNFLOWER with warm yellow petals, a darker amber ring and a deep brown center, facing up and toward the viewer, a jade-green stem with two leaves.
5. A round lime-moss green FROG SITTING, facing the viewer, pale belly, big round friendly eyes.
6. The SAME frog JUMPING: stretched in the air, legs out behind, facing RIGHT.
7. A mint-white DUCK SWIMMING, facing RIGHT, with an amber beak and a small ring of aqua water ripples around it.
8. A big round floating jade-green WATER LILY PAD seen from above, with a lighter top highlight and one small pale-pink flower on it.

DO NOT INCLUDE: red mushrooms with white dots, toadstools, scary bugs, monsters, people, hands, text, letters, numbers, backgrounds, ground, grass patches, water areas, shadows on the ground, items crossing cell borders, items cut by the cell edge, different sizes between the two butterflies or the two frogs, side-view-only or straight-down-only drawings, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the dark forest background of the reference image, floating firefly specks, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 5. `cenario.png` — 4 × 2 células de 320 (1280 × 640), alfa

O que enfeita o mapa e tem colisão. Também volta no bosque do N3.

| Célula | Peça |
|---|---|
| 0 | **árvore grande**: copa redonda e fofa em camadas de folhagem, tronco curto embaixo |
| 1 | **árvore pequena** com frutinhas coral |
| 2 | **arbusto** redondo com florzinhas |
| 3 | **pedra grande** lisa e arredondada, com musgo |
| 4 | **tronco caído**, deitado na horizontal |
| 5 | **juncos**: touceira de capim alto de beira d'água |
| 6 | **píer** de madeira curto, **comprido na vertical** (o comprido de cima para baixo), visto de cima inclinado |
| 7 | **touceira de florzinhas** variadas (coral, salmão e rosa-claro) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; simple layered stylized shapes (big rounded leaf masses, moss slabs with a lighter lime top face and a darker side, flowers with simple petals and a darker ring around the center); enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; light-colored surfaces have a soft inner glow. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. Chunky nature props for a cozy top-down adventure game (camera from above at about 45 degrees, so we see the top AND the front of each thing), each centered with about 8% margin, no ground, no shadow.
1. A BIG TREE: a round, fluffy canopy built from layered flat leaf masses (dark teal underneath, jade in the middle, misty mint highlights on top), a short dark plum-brown trunk visible at the bottom.
2. A SMALL TREE with a rounder canopy in the same layered greens and a few small coral-rose fruits.
3. A round BUSH of layered jade leaf masses with tiny coral-rose and pale-pink flowers.
4. A big smooth rounded ROCK, blue-grey teal stone with a lighter top, and a lime moss slab on top.
5. A FALLEN LOG lying HORIZONTALLY, warm dark-brown bark, lime moss along its top, a small beige mushroom on its side.
6. A clump of tall REEDS (waterside grass): teal and lime blades with a few brown cattails.
7. A short wooden PIER (dock) seen from above at an angle, its long side going UP and DOWN (vertical), light warm wood planks with little posts.
8. A small clump of mixed little WILDFLOWERS (coral-rose, salmon and pale pink) with lime-green leaves.

DO NOT INCLUDE: animals, people, houses, fences, signs, text, letters, numbers, backgrounds, ground, grass areas around the props, water areas, shadows on the ground, a horizontal pier, items crossing cell borders, items cut by the cell edge, side-view-only or straight-down-only drawings, autumn or dead trees, tall dark forest trunks, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the dark forest background of the reference image, floating firefly specks, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 6. `cachoeira.png` — 2 × 1 células de 512 (1024 × 512), alfa

Uma cachoeira pequena caindo de uma **pedra** num **poço** redondo, na vista 3/4. Fica encostada na borda de cima do mapa. Os dois quadros são **iguais**, menos a água: as listras claras da água e a espuma mudam de lugar, para o código alternar e a água "correr".

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; simple layered stylized shapes (rounded stone masses, moss slabs with a lighter lime top face and a darker side); enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; light-colored surfaces have a soft inner glow. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 1 row, each cell 512 x 512 (total 1024 x 512). The SAME little WATERFALL in both cells, for a cozy top-down adventure game (camera from above at about 45 degrees): a rounded blue-grey teal rock ledge at the top with a few lime moss slabs, a ribbon of softly glowing aqua water falling down its front, and a small round pool at the bottom with mint-white foam. Centered, same size and same position in both cells.
1. Frame A: the falling water with mint-white streaks in one position, foam bubbles in one position.
2. Frame B: IDENTICAL rock and pool, only the water streaks and foam bubbles shifted a little (for a two-frame flowing animation).

DO NOT INCLUDE: people, animals, fish, trees, grass areas, background, sky, river going off the cell, different rocks between the two frames, different sizes between the frames, text, letters, numbers, items crossing cell borders, items cut by the cell edge, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the dark forest background of the reference image, floating firefly specks, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 7. `camera-ui.png` — 4 × 2 células de 256 (1024 × 512), alfa

Os botões e ícones do **app de câmera do tablet**, de frente e chapados. Servem aos três níveis (uma geração só).

| Célula | Peça | Uso |
|---|---|---|
| 0 | **disparar FOTO**: botão redondo branco-esverdeado grande, com anel menta-acinzentado | modo FOTO |
| 1 | **gravar**: o mesmo anel, com uma **bolinha vermelho-coral** no meio | modo VÍDEO, parado |
| 2 | **parar**: o mesmo anel, com um **quadradinho vermelho-coral** arredondado | gravando |
| 3 | ícone de **câmera fotográfica** verde-menta | o modo FOTO (no botão e no pedido) |
| 4 | ícone de **filmadora** lilás-clara | o modo VÍDEO |
| 5 | **lâmpada apagada** | LUZ desligada |
| 6 | a mesma **lâmpada acesa**, amarela, com raiozinhos | LUZ ligada |
| 7 | **lupa** | ZOOM |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; light-colored surfaces have a soft inner glow. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Simple chunky buttons and icons of a tablet CAMERA APP for a children's game, seen straight from the front, each centered with about 8% margin.
1. A big round mint-white shutter button with a soft pale mint-grey ring around it.
2. The SAME round button and ring with a solid coral-red DOT in the middle (record).
3. The SAME round button and ring with a small coral-red rounded SQUARE in the middle (stop).
4. A chunky PHOTO CAMERA icon, mint-green body with a big round lens.
5. A chunky VIDEO CAMERA (camcorder) icon, pale lilac body with a lens on the front.
6. A LIGHT BULB turned OFF, pale grey-mint glass.
7. The SAME light bulb turned ON, glowing warm yellow with a few short rays.
8. A chunky MAGNIFYING GLASS, warm brown handle, pale mint glass.

DO NOT INCLUDE: text, letters, numbers, words, plus or minus signs, arrows, check marks, X marks, app logos, brand marks, hands, people, phones, tablets, backgrounds behind the items, shadows on the ground, items crossing cell borders, items cut by the cell edge, red danger colors (except the record dot and stop square), black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, the dark forest background of the reference image, floating firefly specks, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 8. `ui.png` — 3 × 2 células de 640 × 480 (1920 × 960), alfa

Peças grandes e **em branco**: o código escreve e põe as fotos por cima.

| Célula | Peça | Uso |
|---|---|---|
| 0 | **cartão do pedido**: prancheta de papel branco-esverdeado **bem larga e baixa (≈ 6 : 1)**, com um prendedor verde-azulado no alto, vazia | **sem uso** desde 14/10/2026: o pedido mora no cabeçalho em faixas; a célula fica para não mudar a grade |
| 1 | **polaroide**: moldura branca de foto instantânea **quase quadrada (≈ 15 : 16)**; a área da foto, **vazia** em cinza-menta bem claro, é **4 : 3** e fica no alto, com borda fina dos lados e em cima (≈ 6 %) e mais grossa embaixo | a foto colando no pedido |
| 2 | **moldura de filme** (≈ 6 : 5): um pedaço de filme verde-azulado escuro com furinhos em cima e embaixo; a abertura do meio, **vazia**, é **4 : 3** | o vídeo rodando no pedido |
| 3 | **base do joystick**: disco redondo, macio e opaco, menta enevoado | o joystick |
| 4 | **bolinha do joystick**: bola redonda, jade | o joystick |
| 5 | **botão em branco**: quadradinho arredondado, **quase branco** (o código tinge), vazio | base do modo, da LUZ e do ZOOM |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; light-colored surfaces have a soft inner glow. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 640 x 480 (total 1920 x 960), read left to right, top row first. Big, clean, friendly panels for a children's nature-photography game, each centered with about 6% margin, seen straight from the front, ALL COMPLETELY BLANK so the game can place text and photos on them.
1. A VERY WIDE and LOW blank ORDER CARD (about 6:1): mint-white paper with a slightly darker lower lip, a small deep-teal clip at the top center, empty face.
2. A blank INSTANT PHOTO frame, almost square (about 15:16): a mint-white frame with thin side and top borders and a thicker bottom border; the photo area is 4:3, EMPTY and very light grey-mint.
3. A blank piece of FILM (about 6:5) with a 4:3 opening: a deep teal film strip with little rounded pale sprocket holes along the top and bottom, the middle opening EMPTY and very light grey-mint.
4. A round, soft JOYSTICK BASE: a flat misty-mint disc with a slightly lighter rim, opaque.
5. A round JOYSTICK KNOB: a jade-green ball with a lighter highlight on top.
6. A small blank BUTTON: a soft rounded square, almost white with a faint mint tint, a slightly darker lower lip, empty face.

DO NOT INCLUDE: any text, letters, numbers, words, icons, symbols, arrows, pictures inside the photo frame or the film, landscapes, people, hands, logos, brand marks, backgrounds behind the items, shadows on the ground, items crossing cell borders, items cut by the cell edge, red danger colors, saturated or dark button faces, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, the dark forest background of the reference image, floating firefly specks, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 9. `cover-camera-na-trilha.png` — 1672 × 941, opaco, com o título

O Téo, de tablet erguido, fotografando um sapo numa vitória-régia na beira de um lago encantado, com borboletas em volta, girassóis e, ao fundo, uma cachoeira pequena entre árvores em camadas. A luz é suave e verde-azulada, com vagalumes brilhando (só a capa os tem). O título vai num letreiro no alto (memória *capa tem título*).

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; layered depth like the reference (darker foreground silhouettes, lighter misty background layers, a big soft circle of light behind); enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; soft glowing light and tiny glowing firefly specks; characters with soft stylized proportions (NOT chibi), small simple facial features (small almond-shaped eyes, a tiny nose, a small mouth), a soft rosy blush, and hair drawn as big flat masses with a few lighter strands. Take ONLY the art style: do NOT copy its characters, creatures, scene, text or framing.

A cover illustration for a children's game, 16:9 (1672 x 941), opaque. An enchanted meadow by a little lake, in soft teal light, seen from above at a gentle angle; keep it friendly and bright enough for children, with the boy and the frog well lit. In the foreground, a boy about 9 years old with stylized proportions, messy GOLDEN BLOND hair and small bright GREEN almond eyes, a coral-rose explorer vest over a mint-white T-shirt, dark slate-blue shorts and a small caramel backpack, holds a pale-lilac-cased TABLET up with both hands, happily taking a photo of a round lime-green frog sitting on a big jade lily pad. Two coral-rose butterflies flutter around tall sunflowers; behind the lake, a small waterfall falls from a mossy rock into the water, between layered trees. Tiny glowing fireflies float in the air. At the top center, a rounded mint-white sign shows the title "Câmera na Trilha" in big, bold, rounded, friendly deep-teal letters, spelled exactly like that, with the accent on the "â".

DO NOT INCLUDE: any other text besides the title, misspelled title, missing accent, extra letters, subtitles, logos, brand marks, app icons on the tablet, other people, girls, women, dark or brown or black hair on the boy, blue eyes, hats, glasses, scary animals, monsters, tentacles, a gloomy or scary mood, red danger colors, frames around the picture, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, chibi proportions, huge anime eyes, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 10. N2: a gruta

O chão e as paredes da gruta são feitos em código (polígonos de pedra assados, como no Mergulho). O escuro também é do código. As folhas trazem o que está dentro.

### 10.1 `gruta.png` — 4 × 2 células de 320 (1280 × 640), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **estalagmite**: cone de pedra subindo do chão, com camadinhas | foto (N2 fase 3) |
| 1 | **cristais roxos** saindo de uma pedra | foto (N2 fase 1) |
| 2 | **cristais azuis** saindo de uma pedra | foto da demonstração |
| 3 | **pedra de gruta** arredondada | colisão, enfeite |
| 4 | **poça d'água** rasa e redonda, vista de cima inclinada | onde as gotas caem (vídeo) |
| 5 | **cogumelos que brilham**, ACESOS: 3 cogumelos de chapéu ciano emitindo luz própria, como vistos no escuro | foto com a luz apagada |
| 6 | os **mesmos cogumelos sob a luz**: cor pálida, **sem brilho** nenhum | como saem com a LUZ acesa |
| 7 | **cascalho**: montinho de pedrinhas | enfeite |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; simple layered stylized shapes (rounded stone masses, moss slabs with a lighter lime top face and a darker side); enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; glowing things have a soft halo of their own light. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. Chunky CAVE things for a cozy top-down adventure game (camera from above at about 45 degrees, so we see the top AND the front of each thing), each centered with about 8% margin, no ground, no shadow, drawn in normal light (the game darkens them).
1. A STALAGMITE: a rounded cone of blue-grey teal stone rising from the floor, with soft layered rings.
2. A cluster of PURPLE CRYSTALS growing out of a small blue-grey rock.
3. A cluster of BLUE CRYSTALS growing out of a small blue-grey rock.
4. A rounded CAVE ROCK, blue-grey teal stone with a lighter top.
5. A shallow round PUDDLE of clear aqua water seen from above at an angle, with a light mint rim.
6. Three GLOWING MUSHROOMS with cyan caps, shining with their OWN soft cyan light and a gentle glow halo, as seen in darkness.
7. The SAME three mushrooms, same size and place, under a flashlight: pale whitish-cyan caps with NO glow and NO halo.
8. A small pile of GRAVEL pebbles in blue-grey tones.

DO NOT INCLUDE: bats, spiders, scary creatures, monsters, skulls, bones, people, torches, lamps, text, letters, numbers, backgrounds, cave walls, ground areas, shadows on the ground, items crossing cell borders, items cut by the cell edge, different sizes between the two mushroom cells, red danger colors, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the dark forest background of the reference image, floating firefly specks, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

### 10.2 `gruta-bichos.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **peixe-cego**: peixinho rosado-claro, **sem olhos**, nadando para a DIREITA, visto de cima | vídeo (quadro A) |
| 1 | o mesmo peixe, com o rabo para o outro lado | vídeo (quadro B) |
| 2 | **vaga-lume ACESO**: besourinho com a cauda brilhando verde-menta | vídeo com a luz apagada |
| 3 | o mesmo vaga-lume **apagado** (sob a luz: sem brilho) | como sai com a LUZ acesa |
| 4 | **gota d'água** | cai do teto na poça |
| 5 | **respingo** pequeno | a gota batendo na poça |
| 6 | **musgo que brilha**, ACESO, numa pedrinha | demonstração (apague a LUZ) |
| 7 | o **mesmo musgo sob a luz**, sem brilho | demonstração |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; glowing things have a soft halo of their own light. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Cute, round CAVE creatures and details for a cozy top-down adventure game, each centered with about 8% margin, no ground, no shadow. Creatures are cute round friendly animals with small simple faces, NOT people, never scary.
1. A little pale-pink CAVE FISH with NO EYES (smooth face), seen from above, swimming to the RIGHT, tail curved left.
2. The SAME fish, same size and place, tail curved the other way.
3. A round FIREFLY with its tail GLOWING bright mint-green with a soft glow halo.
4. The SAME firefly, same size and place, with its tail NOT glowing (plain pale yellow-green), no halo.
5. One clear aqua WATER DROP.
6. A small water SPLASH: a little crown of aqua droplets.
7. A small blue-grey rock covered with GLOWING MOSS, shining soft lime-green with its own light and a gentle halo.
8. The SAME mossy rock, same size and place, under a flashlight: pale green moss with NO glow and NO halo.

DO NOT INCLUDE: fish with eyes, bats, spiders, scary creatures, monsters, teeth, people, text, letters, numbers, backgrounds, water areas, ground, shadows on the ground, items crossing cell borders, items cut by the cell edge, different sizes between paired cells, red danger colors, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the dark forest background of the reference image, loose floating firefly specks around the items, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 11. N3: o bosque

O bosque usa a `cenario.png` (árvores, arbustos, pedras) e, na grota, a `gruta.png` (cogumelos que brilham). A folha nova traz o que é **pequenininho** (pede zoom) e o que é **gigante** (pede o visor aberto).

### 11.1 `bosque.png` — 4 × 2 células de 320 (1280 × 640), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **árvore gigante**, velha, raízes grossas e copa enorme (bem maior que a árvore grande da `cenario`) | foto inteira (sem zoom) |
| 1 | **folha grande** com uma **joaninha pequenininha** em cima (vermelha de pintinhas pretas bem visíveis) | foto de perto (zoom) |
| 2 | **ninho** numa forquilha de galho, com **3 ovinhos azul-claros**, visto de cima | foto de perto (zoom) |
| 3 | **formigueiro**: montinho de terra com um furinho | de onde saem as formigas |
| 4 | **formiga** carregando um pedacinho de folha verde, andando para a DIREITA, vista de cima | o código faz a fila |
| 5 | **flor grande** coral-rosada, aberta para cima | onde a abelha pousa |
| 6 | **abelha** fofa de asas **abertas**, virada para a DIREITA | vídeo (quadro A) |
| 7 | a mesma abelha de asas **fechadas** | vídeo (quadro B) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: flat vector game illustration with NO outlines at all — every shape is separated only by color and value, never by a line; each shape is one flat fill plus one darker shade tone and one lighter highlight tone, with soft clean edges and a very faint grain; simple layered stylized shapes (big rounded leaf masses, moss slabs with a lighter lime top face and a darker side, flowers with simple petals and a darker ring around the center); enchanted-forest palette of deep teal, jade and emerald greens with misty mint, lime-moss highlights, warm coral-rose, salmon and pale-pink accents and cool mint-whites; light-colored surfaces have a soft inner glow. Take ONLY the art style: do NOT copy its characters, creatures, forest scene, text or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. Forest things for a cozy top-down adventure game (camera from above at about 45 degrees, so we see the top AND the front of each thing), each centered with about 8% margin, no ground, no shadow. Bugs and birds are cute round friendly animals with small simple faces, NOT people.
1. A GIANT old TREE filling the cell: thick dark plum-brown roots spreading at the bottom, a wide trunk and a HUGE round canopy of layered flat leaf masses (dark teal underneath, jade in the middle, misty mint on top).
2. A big jade-green LEAF with a TINY LADYBUG on it (bright red shell with clear black dots) — the ladybug is small compared to the leaf.
3. A small bird NEST in the fork of a branch, seen from above, with THREE light-blue EGGS inside.
4. A small ANTHILL: a little mound of soft brown earth with a hole on top.
5. One ANT seen from above, walking to the RIGHT, carrying a small piece of lime-green leaf over its head.
6. A big open coral-rose FLOWER facing up, with a darker ring and a salmon-yellow center.
7. A round BEE, facing RIGHT, wings OPEN.
8. The SAME bee, same size and place, wings CLOSED.

DO NOT INCLUDE: scary bugs, spiders, wasps with stingers shown, monsters, people, hands, birds outside the nest, text, letters, numbers, backgrounds, ground areas, grass areas, shadows on the ground, items crossing cell borders, items cut by the cell edge, different sizes between the two bee cells, a ladybug as big as the leaf, red danger colors (except the ladybug shell), tall dark forest trunks, black outlines, dark outlines, lineart, ink lines, outlined shapes, white sticker keyline, cel-shaded comic look, glossy plastic highlights, 3D render, photorealistic, painterly brush strokes, harsh pure-black shadows, the dark forest background of the reference image, floating firefly specks, the characters and creatures from the reference image (a young woman with long wavy black hair, pink flowers in her hair and a white dress; a round raspberry-pink monster with big googly eyes; pink tentacles hanging from above), the words "Defining Game Style", watermarks, "RetroStyleGames", signatures, @handles, website names.
~~~

---

## 12. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24), os pontinhos soltos e o granulado que tiver vazado para fora das formas.
2. Conferir:
   - **nenhuma letra** nos botões, no cartão, na polaroide e no filme;
   - **nenhum contorno escuro** e **fundo transparente de verdade**, sem a floresta escura da referência nem vagalumes soltos nas folhas;
   - o Téo **loiro de olhos verdes** nas 8 células, igual em todas, e o de lado virado para a **direita**;
   - tudo na vista **3/4** (nem de lado, nem reto de cima);
   - os pares do mesmo tamanho e no mesmo lugar (borboleta, sapo, cachoeira, cogumelos, peixe, vaga-lume, musgo, abelha);
   - o píer **em pé** (comprido na vertical) e o tronco **deitado**;
   - a joaninha **pequena** na folha, e a árvore gigante **bem maior** que a árvore grande;
   - o **botão em branco** quase branco, para o tingimento do código funcionar.
3. Passar o chão, a trilha e a água feitos em código para a paleta da referência (§ O estilo).
4. Medir o Téo (altura) e os assuntos (`size` em `data/subjects.ts`): as contas de "detalhe" e "inteiro" do N3 dependem disso.
5. Anotar tudo no `MANIFEST.md` da pasta de assets.
