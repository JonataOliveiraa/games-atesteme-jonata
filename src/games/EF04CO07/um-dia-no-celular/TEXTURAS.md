# Um Dia no Celular — texturas

Destino: `src/assets/games/EF04CO07/um-dia-no-celular/` (medidas da entrega no `MANIFEST.md` de lá)
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 tela, §5 tarefas, §9 arte)

**Entregues em 14/10/2026:** nina, amigos, objetos, apps, adultos e os quatro fundos. O `celular.png` chegou em
outra forma, como três camadas alinhadas (`hand-layer1` palma, `hand-layer2` corpo, `hand-layer3` dedos), e o jogo
usa as três. **Falta:** a capa.

**O jogo já roda sem nenhum PNG.** Cada arquivo abaixo tem um desenho de reserva em `Graphics`, feito na mesma grade
em `scenes/fallback.ts`. Quando chegar um PNG com o nome certo, ele toma o lugar do desenho, e eu meço a arte e
ajusto as posições.

**Referência de estilo:** a linha padrão da 3ª rodada é o **chibi de figurinha**. Anexe em toda geração a imagem de
estilo que você escolher (Dúvida 2 do plano: `references/19-chibi-figurinhas.jpg` não está na pasta). Cada prompt
abaixo vem inteiro (estilo + corpo + negativo), pronto para copiar.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso | Prioridade |
|---|---|---|---|---|---|---|
| `nina.png` | 3 × 2 | 320 × 420 | 960 × 840 | sim | a Nina em 6 expressões | obrigatório |
| `amigos.png` | 4 × 3 | 320 × 420 | 1280 × 1260 | sim | Duda (2), Bia (3), Caio (3), Rafa (4) | obrigatório |
| `objetos.png` | 3 × 2 | 320 × 320 | 960 × 640 | sim | diário aberto, diário fechado, bolo, desenho, chave, lixeira | obrigatório |
| `celular.png` | 2 × 1 | 512 × 1024 | 1024 × 1024 | sim | o corpo do celular e a mão que segura | obrigatório |
| `apps.png` | 4 × 2 | 256 × 256 | 1024 × 512 | sim | os 8 ícones dos apps | obrigatório |
| `bg-sala.png` | — | — | 1280 × 720 | opaco | a sala de aula (tarefa 1) | obrigatório |
| `bg-patio.png` | — | — | 1280 × 720 | opaco | o pátio do recreio (tarefa 2) | obrigatório |
| `bg-quarto.png` | — | — | 1280 × 720 | opaco | o quarto (demonstração, tarefas 3 e 5; a noite é feita no código) | obrigatório |
| `bg-festa.png` | — | — | 1280 × 720 | opaco | a festa de aniversário (tarefa 4) | obrigatório |
| `adultos.png` | 3 × 1 | 256 × 256 | 768 × 256 | sim | rostos da Profª Ana, da Mãe e da Vovó (avatares da conversa) | acabamento |
| `objetos2.png` | 5 × 1 | 320 × 320 | 1600 × 320 | sim | moeda, cartaz em branco, envelope de propaganda, folha pautada, silhueta do desconhecido (§11) | N2 e N3 |
| `cover-um-dia-no-celular.png` | — | — | 1672 × 941 | opaco | capa **com o título** | depois do N1 aprovado |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a
grade, a ordem, o conteúdo e a direção de cada peça não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Nomes, falas, botões, horas e o conteúdo do diário são escritos pelo código. Só a capa tem o
  título.
- **As pessoas ficam de frente para quem joga**, em pé e de corpo inteiro, como se estivessem a dois passos de você. A
  câmera fica na altura dos olhos de uma criança, e não de cima.
- **A mesma pessoa tem o mesmo tamanho, a mesma roupa e o mesmo lugar em todas as células.** Muda só a expressão e os
  braços.
- **Cada criança tem uma cor própria**, para se reconhecer de longe: Nina coral, Duda verde, Bia roxo, Caio azul, Rafa
  laranja.
- **As expressões de "chateado" são de mágoa, nunca de raiva:** biquinho, sobrancelha caída, sem lágrima e sem dedo
  apontado.
- Peça solta e centrada na célula, com cerca de 8 % de margem. Sem chão e sem sombra no chão (o código desenha a
  sombra).
- **Os fundos têm a metade direita calma.** O celular fica na frente dela, então a ação do fundo (lousa, banco, mesa do
  bolo, cama) fica na metade esquerda e no meio.

---

## 3. `nina.png` — 3 × 2 células de 320 × 420 (960 × 840), alfa

A **Nina**: menina de 9 anos, pele morena quente, cabelo preto cacheado preso em **dois puffs** no alto da cabeça com
elásticos amarelos, olhos castanhos grandes, camiseta **coral** com uma estrelinha branca no peito, bermuda azul-jeans
e tênis brancos.

| Célula | Expressão |
|---|---|
| 0 | parada, sorriso tranquilo, braços soltos |
| 1 | **pose para foto**: sorriso grande, uma piscadinha, a mão fazendo o V ao lado do rosto |
| 2 | **susto, tapando o rosto**: as duas mãos na frente do rosto, os olhos espiando entre os dedos, gotinha de suor |
| 3 | **magoada**: biquinho, olhos baixos, sobrancelha caída, braços colados ao corpo (sem lágrima) |
| 4 | **careta**: língua de fora, olhos vesgos, as mãos fazendo orelhinhas atrás da cabeça (é a foto engraçada) |
| 5 | **feliz acenando**: um braço para cima acenando, sorriso aberto, olhos fechados de alegria |

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; small chibi proportions, big head and little body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks (small sparkles, a sweat drop, motion ticks); a short palette — one strong accent colour over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached images: do NOT copy their characters, their clothes, their poses, their scenes or their framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 320 x 420 (total 960 x 840), read left to right, top row first. The SAME girl in all 6 cells, same size, same outfit, FULL BODY, standing, FACING THE VIEWER, centered with about 8% margin, eye-level camera (not from above). The girl, NINA, 9 years old, chibi proportions: warm brown skin, black curly hair tied in TWO PUFFS on top of her head with YELLOW hair ties, big brown eyes, a CORAL T-shirt with a small white star on the chest, denim-blue shorts, white sneakers.
1. Standing relaxed, calm friendly smile, arms down.
2. Posing for a photo: big smile, one eye winking, one hand making a V (peace) sign next to her face.
3. Startled, hiding her face: both hands in front of her face, eyes peeking between the fingers, a small sweat drop.
4. Hurt and disappointed: a small pout, eyes looking down, eyebrows tilted, arms close to the body. No tears.
5. Making a silly face for a funny photo: tongue out, crossed eyes, both hands making bunny ears behind her head.
6. Happy, waving: one arm up waving, wide open smile, eyes closed with joy.

DO NOT INCLUDE: other characters, boys, adults, animals, phones, cameras, backgrounds, ground, floor, shadows on the ground, furniture, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars floating around, HUD, straight hair, blond hair, red hair, ponytail, hats, glasses, school uniform, different outfits between cells, different sizes between cells, side view, back view, top-down view, items crossing cell borders, cropped edges, grid lines, visible sprite-sheet borders, cell borders, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, drop shadow on the cell, white backing in transparent assets, crying, tears, angry faces, scolding, pointing at the viewer.
~~~

## 4. `amigos.png` — 4 × 3 células de 320 × 420 (1280 × 1260), alfa

Quatro amigos na mesma escala da Nina, com a mesma idade e a mesma altura.

- **Duda:** pele clara com sardas, cabelo **ruivo** curto em chanel, tiara verde, camiseta listrada **verde** e branca,
  short cáqui.
- **Bia:** pele clara-morena, cabelo castanho-escuro liso num **rabo de cavalo com laço roxo**, moletom **roxo**, calça
  cinza.
- **Caio:** pele morena clara, cabelo preto curtinho e cacheado, **óculos redondos**, camiseta **azul**.
- **Rafa:** pele clara, cabelo castanho espetado, **chapeuzinho de aniversário** listrado, camiseta **laranja**. Está
  com **bolo de chocolate e glacê no rosto** em todas as células.

| Célula | Quem | Expressão |
|---|---|---|
| 0 | Duda | animada, segurando com as duas mãos um **diário roxo ABERTO** virado para quem joga, sorriso travesso |
| 1 | Duda | sem graça, mão atrás da cabeça, estendendo o **diário roxo FECHADO** com a outra mão |
| 2 | Bia | preocupada, procurando: mão na testa, olhando para os lados |
| 3 | Bia | aliviada e feliz, **abraçando o diário roxo fechado** junto ao peito, olhos fechados |
| 4 | Bia | magoada: biquinho, punhos fechados para baixo, sobrancelha caída (sem lágrima, sem raiva) |
| 5 | Caio | pedindo: mãos juntas na frente do peito, olhar esperançoso |
| 6 | Caio | joinha com a mão, sorriso aberto |
| 7 | Caio | sorriso maroto, segurando uma **chavinha dourada** na mão erguida |
| 8 | Rafa | comendo bolo, feliz e distraído, com a cara suja de bolo |
| 9 | Rafa | **"agora não!"**: as duas mãos abertas para a frente, bochechas coradas, cara suja de bolo, sem graça |
| 10 | Rafa | joinha, sorriso aberto, cara suja de bolo |
| 11 | Rafa | magoado, tapando metade do rosto com uma mão, cara suja de bolo |

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; small chibi proportions, big head and little body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks (small sparkles, a sweat drop, motion ticks); a short palette — one strong accent colour over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached images: do NOT copy their characters, their clothes, their poses, their scenes or their framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 3 rows, each cell 320 x 420 (total 1280 x 1260), read left to right, top row first. FOUR different 9-year-old kids, all at the SAME scale and the SAME height, each one FULL BODY, standing, FACING THE VIEWER, centered in its cell with about 8% margin, eye-level camera (not from above). Each kid keeps exactly the same look in all of their cells.
- DUDA (girl): light skin with freckles, short GINGER bob haircut with a green headband, a GREEN-and-white striped T-shirt, khaki shorts.
- BIA (girl): light-tan skin, long straight dark-brown hair in a PONYTAIL with a PURPLE bow, a PURPLE hoodie, grey trousers.
- CAIO (boy): light-brown skin, short black curly hair, ROUND GLASSES, a BLUE T-shirt, dark shorts.
- RAFA (boy): fair skin, spiky brown hair, a striped birthday PARTY HAT, an ORANGE T-shirt, with smudges of chocolate cake and white frosting on his cheeks and nose in all his cells.
Cells:
1. DUDA, excited and mischievous, holding with both hands an OPEN purple diary turned toward the viewer (we see two pages with doodled hearts and scribbled lines, no readable writing).
2. DUDA, embarrassed, one hand behind her head, the other hand holding out the CLOSED purple diary.
3. BIA, worried, searching: one hand on her forehead, looking to the side.
4. BIA, relieved and happy, HUGGING the closed purple diary against her chest, eyes closed.
5. BIA, hurt and disappointed: a pout, fists down at her sides, eyebrows tilted. No tears, not angry.
6. CAIO, asking a favour: hands pressed together in front of his chest, hopeful look.
7. CAIO, thumbs up, big open smile.
8. CAIO, cheeky grin, holding up a small GOLDEN KEY in one hand.
9. RAFA, happily eating a slice of cake, unaware, cake smudges on his face.
10. RAFA, "not now!": both open palms pushed toward the viewer, blushing, cake smudges on his face, embarrassed smile.
11. RAFA, thumbs up, big smile, cake smudges on his face.
12. RAFA, hurt, covering half of his face with one hand, cake smudges on his face.

DO NOT INCLUDE: adults, animals, extra kids, phones, cameras, backgrounds, ground, floor, shadows on the ground, furniture, tables, plates (except the cake slice in cell 9), text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, readable writing in the diary, school uniforms, the same outfit on two different kids, different sizes between cells, side view, back view, top-down view, items crossing cell borders, cropped edges, grid lines, visible sprite-sheet borders, cell borders, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, drop shadow on the cell, white backing in transparent assets, crying, tears, angry faces, scolding, pointing at the viewer.
~~~

## 5. `objetos.png` — 3 × 2 células de 320 (960 × 640), alfa

| Célula | Objeto |
|---|---|
| 0 | o **diário roxo ABERTO**, visto de frente e um pouco de cima, com corações rabiscados e linhas de "letra" ilegível nas duas páginas, um cadeado de coração pendurado e aberto |
| 1 | o **diário roxo FECHADO**, com o cadeado de coração fechado |
| 2 | o **bolo de aniversário**: dois andares de chocolate com glacê branco, granulado colorido e 3 velinhas acesas, num prato |
| 3 | o **seu desenho**: uma folha de papel com arco-íris, sol sorridente e uma casinha feitos com giz de cera |
| 4 | uma **chave dourada** fofa, grande, com um coraçãozinho no cabo |
| 5 | uma **lixeira** cinza-lilás de pedal, com a tampa aberta |

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; simple rounded shapes; a short palette — one strong accent colour over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached images: do NOT copy their characters, their objects, their scenes or their framing.

An object sprite sheet on a fully TRANSPARENT background: a single row of 5 columns, each cell 320 x 320 (total 1600 x 320), read left to right. One object per cell, centered with about 8% margin, front view slightly from above, all at a friendly readable size.
1. A PURPLE diary lying OPEN, both pages visible, covered with doodled hearts and wavy scribble lines that look like handwriting but are NOT readable, a small heart-shaped padlock hanging open from the cover.
2. The same PURPLE diary CLOSED, with the heart-shaped padlock locked.
3. A two-tier chocolate BIRTHDAY CAKE with white frosting drips, colourful sprinkles and three lit candles, on a round plate.
4. A child's DRAWING: a sheet of white paper with a crayon rainbow, a smiling sun and a little house with a red roof, drawn in wobbly crayon strokes.
5. A cute big GOLDEN KEY with a little heart on its handle.
6. A rounded grey-lilac PEDAL TRASH BIN with its lid open.

DO NOT INCLUDE: people, hands, animals, phones, backgrounds, tables, floor, shadows on the ground, text, letters, words, labels, readable writing, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, items crossing cell borders, cropped edges, grid lines, visible sprite-sheet borders, cell borders, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, drop shadow on the cell, white backing in transparent assets.
~~~

## 6. `celular.png` — 2 × 1 células de 512 × 1024 (1024 × 1024), alfa

| Célula | Peça |
|---|---|
| 0 | o **corpo do celular**, de frente, em pé: capinha **lilás** arredondada, bordas grossas e fofas, um furinho de câmera no alto, botões laterais. **A tela é preta lisa (#000000), sem nada desenhado**, e ocupa quase tudo: margem de 5 % dos lados e 4 % em cima e embaixo. |
| 1 | a **mão direita de uma criança** (pele média) na pose de **segurar um celular invisível** pela parte de baixo e pelo lado direito: a palma embaixo, o polegar subindo pela lateral direita e os outros dedos curvados na lateral esquerda, com o espaço do celular vazio no meio |

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached images: do NOT copy their characters, their objects, their scenes or their framing.

A sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 1 row, each cell 512 x 1024 (total 1024 x 1024).
1. A cute SMARTPHONE seen straight from the front, standing upright, centered: a rounded soft LILAC protective case with thick friendly bezels, rounded corners, a tiny front camera hole at the top, small side buttons. The SCREEN is a perfectly flat, empty, solid BLACK (#000000) rounded rectangle that fills almost the whole front (about 5% margin left and right, 4% top and bottom). Nothing on the screen.
2. A child's RIGHT HAND (medium skin tone) in the pose of holding a smartphone from below and from the right side, but WITHOUT the phone: palm at the bottom, thumb going up along where the right edge of the phone would be, the other fingers curled along where the left edge would be, an empty phone-shaped space in the middle. Seen from the front, the same scale as the phone in cell 1.

DO NOT INCLUDE: anything on the screen, apps, icons, wallpaper, reflections, glare, notch with sensors, brand logos, apple logo, text, letters, words, labels, digits, numbers, captions, watermark, title lettering, user interface, buttons drawn on the screen, a phone inside the hand, two hands, arms, sleeves, people, backgrounds, table, shadows on the ground, items crossing cell borders, cropped edges, grid lines, visible sprite-sheet borders, cell borders, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, 3D render, photorealistic, blur, lens flare, heavy noise, drop shadow on the cell, white backing in transparent assets.
~~~

## 7. `apps.png` — 4 × 2 células de 256 (1024 × 512), alfa

Ícones de app, quadrados de cantos bem arredondados, cada um com uma cor e um desenho simples, **sem letra**.

| Célula | App | Desenho | Cor |
|---|---|---|---|
| 0 | Câmera | uma câmera fofa com lente grande | rosa |
| 1 | Galeria | uma montanha com um sol (uma foto) | amarelo |
| 2 | Conversas | dois balões de conversa | verde-menta |
| 3 | Bichinho | a carinha de um pintinho | laranja |
| 4 | Música | uma nota musical | azul-celeste |
| 5 | Ajustes | uma engrenagem | cinza-lilás |
| 6 | Lanterna | uma lanterna com um raio de luz | azul-marinho com amarelo (N3) |
| 7 | Mapa | um alfinete de mapa sobre um mapinha | verde (N2) |

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; simple rounded chunky shapes. Take ONLY the art style from the attached images: do NOT copy their characters, their objects, their scenes or their framing.

An APP ICON sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Each cell is ONE cute smartphone app icon: a rounded square (squircle) with very rounded corners, filling about 84% of the cell, centered, one flat colour background with one soft shadow tone, and one simple cute white-and-colour symbol in the middle. All 8 icons the same size and the same shape.
1. CAMERA app: pink squircle, a cute little camera with a big round lens.
2. GALLERY app: yellow squircle, a tiny landscape photo — a hill and a round sun.
3. CHAT app: mint-green squircle, two overlapping speech balloons.
4. PET GAME app: orange squircle, the round smiling face of a baby chick.
5. MUSIC app: sky-blue squircle, a musical note.
6. SETTINGS app: grey-lilac squircle, a gear.
7. FLASHLIGHT app: navy-blue squircle, a small flashlight with a yellow beam.
8. MAP app: green squircle, a red map pin over a folded mini map.

DO NOT INCLUDE: text, letters, words, labels, app names, digits, numbers, captions, watermark, brand logos, real app logos (no Instagram, WhatsApp, Google, Apple or any real brand), notification badges, people, hands, phones, backgrounds, items crossing cell borders, cropped edges, grid lines, visible sprite-sheet borders, cell borders, glossy 3D icons, skeuomorphic textures, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, 3D render, photorealistic, blur, lens flare, heavy noise, drop shadow on the cell, white backing in transparent assets.
~~~

## 8. Os fundos — 1280 × 720, opacos

Os quatro usam o mesmo bloco de estilo, sem a borda branca de adesivo (cena inteira). **A metade direita é calma**,
porque o celular fica na frente dela. Ninguém aparece no fundo, nem pessoa nem bicho.

### 8.1 `bg-sala.png`

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; a short soft palette; crisp shapes, no painterly brushwork; NO white sticker keyline here — this is a full scene, not a sticker. Take ONLY the art style from the attached images: do NOT copy their characters, their scenes or their framing.

Wide background illustration, 16:9 (1280 x 720), eye-level view from a child's height: a bright, cheerful ELEMENTARY SCHOOL CLASSROOM in the morning. On the LEFT half: a green chalkboard with a few chalk doodles (a sun, a flower, wavy lines — no letters), a cork board with colourful paper drawings pinned to it, a window with morning light. In the MIDDLE: a couple of small kids' desks with chairs, pencil cases and books on them, seen from close. The RIGHT half is calm and soft: a plain pastel wall and a bookshelf softly out of the way, with low contrast, because a phone will cover it. Warm mint, butter-yellow and coral palette. Empty room, no people.

DO NOT INCLUDE: people, kids, teachers, animals, characters, text, letters, words, alphabet posters, readable writing, digits, numbers, clocks with numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, phones, top-down view, fisheye, dark lighting, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, white sticker keyline.
~~~

### 8.2 `bg-patio.png`

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; a short soft palette; crisp shapes, no painterly brushwork; NO white sticker keyline here — this is a full scene, not a sticker. Take ONLY the art style from the attached images: do NOT copy their characters, their scenes or their framing.

Wide background illustration, 16:9 (1280 x 720), eye-level view from a child's height: a sunny SCHOOL PLAYGROUND at recess. On the LEFT half: a wooden bench under a leafy tree, a colourful hopscotch drawn on the ground (just coloured squares, no numbers), a low fence with flowers. In the MIDDLE: the school wall with a mural of simple painted shapes. The RIGHT half is calm and soft: open sky and a soft distant wall with low contrast, because a phone will cover it. Bright sky blue, leaf green and butter-yellow palette. No people.

DO NOT INCLUDE: people, kids, teachers, animals, characters, text, letters, words, numbers on the hopscotch, readable writing, digits, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, phones, top-down view, fisheye, dark lighting, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, white sticker keyline.
~~~

### 8.3 `bg-quarto.png`

A noite é feita no código (um véu azul-escuro e a luz da janela), então o quarto é desenhado **de dia, à tarde**.

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; a short soft palette; crisp shapes, no painterly brushwork; NO white sticker keyline here — this is a full scene, not a sticker. Take ONLY the art style from the attached images: do NOT copy their characters, their scenes or their framing.

Wide background illustration, 16:9 (1280 x 720), eye-level view from a child's height: a cozy CHILD'S BEDROOM in the afternoon. On the LEFT half: a bed with a star-pattern blanket and a plush toy, a window with soft afternoon light and curtains. In the MIDDLE: a small desk with a lamp, crayons in a cup and an empty space on the desk top. The RIGHT half is calm and soft: a plain pastel lilac wall with a small framed picture and low contrast, because a phone will cover it. Lilac, mint and peach palette. Empty room, no people.

DO NOT INCLUDE: people, kids, adults, animals, pets, characters, text, letters, words, readable writing, posters with writing, digits, numbers, clocks with numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, phones, tablets, night sky, darkness, top-down view, fisheye, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, white sticker keyline.
~~~

### 8.4 `bg-festa.png`

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; a short soft palette; crisp shapes, no painterly brushwork; NO white sticker keyline here — this is a full scene, not a sticker. Take ONLY the art style from the attached images: do NOT copy their characters, their scenes or their framing.

Wide background illustration, 16:9 (1280 x 720), eye-level view from a child's height: a kid's BIRTHDAY PARTY in a living room in the late afternoon. On the LEFT half: bunches of colourful balloons, a paper garland of triangle flags across the wall, a gift box pile. In the MIDDLE: a party table with a colourful tablecloth, cups, a bowl of candy and EMPTY space in the centre of the table (the cake is placed by the game). The RIGHT half is calm and soft: a plain warm wall with low contrast, because a phone will cover it. Orange, pink and sky-blue palette. No people.

DO NOT INCLUDE: people, kids, adults, animals, characters, a cake, text, letters, words, "happy birthday" banners, readable writing, digits, numbers, number candles, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, phones, top-down view, fisheye, dark lighting, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, white sticker keyline.
~~~

## 9. `adultos.png` — 3 × 1 células de 256 (768 × 256), alfa — acabamento

Rostos para os avatares redondos da conversa e do pedido. Até chegarem, o código desenha rostos simples.

| Célula | Quem |
|---|---|
| 0 | **Profª Ana**: coque castanho, óculos, cardigã verde-azulado, sorriso gentil |
| 1 | **Mãe**: cabelo preto cacheado solto, brinco pequeno, blusa amarela, sorriso |
| 2 | **Vovó**: cabelo branco num coque, óculos redondos, xale rosa, sorriso de olhos fechados |

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; big glossy expressive eyes with a bright highlight; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached images: do NOT copy their characters, their clothes, their poses, their scenes or their framing.

A sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 1 row, each cell 256 x 256 (total 768 x 256). HEAD AND SHOULDERS only, facing the viewer, centered, each one friendly and smiling, all at the same scale.
1. A young female TEACHER: brown hair in a bun, glasses, a teal cardigan, a kind smile.
2. A MOTHER: loose black curly hair, small earrings, a yellow blouse, a warm smile.
3. A GRANDMOTHER: white hair in a bun, round glasses, a pink shawl, a closed-eye happy smile.

DO NOT INCLUDE: kids, men, animals, full bodies, hands, phones, backgrounds, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, frames, circles behind the heads, speech bubbles, icons, items crossing cell borders, cropped edges, grid lines, visible sprite-sheet borders, cell borders, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, 3D render, photorealistic, blur, heavy noise, drop shadow on the cell, white backing in transparent assets, angry faces, scolding.
~~~

## 10. `cover-um-dia-no-celular.png` — capa (1672 × 941, opaca)

Depende da Dúvida 1 (o nome). Anexe também `nina.png` e `celular.png`, para os personagens baterem.

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; big glossy expressive eyes with a bright highlight; a short cheerful palette; crisp shapes, no painterly brushwork; NO white sticker keyline around the scene — this is a full scene, not a sticker. Take ONLY the art style from the attached style images; use the attached character sheets only for the girl NINA and the lilac phone.

Cover illustration, 16:9 (1672 x 941); the main action must read at thumbnail size. A big cute LILAC SMARTPHONE in the centre-right, held by a child's hand, its screen glowing and showing a simple chat with two speech balloons and a photo of a smiling girl. Around the phone, floating like cute stickers: a photo, a speech balloon, a golden key with a heart and a purple diary with a heart padlock — the data that lives in the phone. On the left, NINA (warm brown skin, black curly hair in two puffs with yellow ties, coral T-shirt with a star) making a V sign and smiling, and behind her, smaller, three friends waving (a ginger girl in green, a girl with a purple bow, a boy with round glasses in blue). Soft lilac-to-mint sky background with a few sparkles. At the TOP CENTRE, the title "Um Dia no Celular" in big chunky rounded colourful letters (violet, coral and mint) with a dark outline and a white outer stroke, perfectly spelled in Portuguese.

DO NOT INCLUDE: any other text, misspelled title, extra letters, subtitles, watermark, logo, brand logos, real app logos, user interface buttons, HUD, question mark button, stars rating, scary or sad faces, crying, angry faces, adults scolding, dark lighting, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise.
~~~

## 11. `objetos2.png` — 5 × 1 células de 320 (1600 × 320), alfa — N2 e N3

Peças novas do N2 e do N3. Até chegarem, o código desenha a reserva na mesma grade. O mapa do N3 não está aqui: ele é desenhado no código (só campo e ruas), a pedido do usuário em 15/10/2026.

| Célula | Objeto | Onde entra |
|---|---|---|
| 0 | uma **moeda dourada** fofa, grossa, com uma patinha estampada | N3, as 500 moedas do Bichinho |
| 1 | um **cartaz de papel em branco** preso com fita nos cantos, com uma faixa colorida no alto (vazia) | N3, o cartaz da Feira |
| 2 | um **envelope de propaganda** roxo com um megafone e estrelinhas | N3, a propaganda que chega aos amigos |
| 3 | uma **folha de caderno pautada** com espiral à esquerda, sem nada escrito | N2, a lista da turma |
| 4 | uma **silhueta cinza de pessoa** (cabeça e ombros), com capuz, rosto em sombra, sem olhos | N2, o desconhecido |

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone and no gradients; simple rounded shapes; a short palette — one strong accent colour over near-white and dark neutrals; a thin white sticker keyline around the whole silhouette. Take ONLY the art style from the attached images: do NOT copy their characters, their objects, their scenes or their framing.

An object sprite sheet on a fully TRANSPARENT background: a single row of 5 columns, each cell 320 x 320 (total 1600 x 320), read left to right. One object per cell, centered with about 8% margin, front view, all at a friendly readable size.
1. A cute thick GOLDEN COIN seen from the front, with a little paw print stamped in the middle and a shiny highlight.
2. A blank PAPER POSTER, portrait, held by colourful tape pieces at the four corners, with an empty coloured band across the top (no writing at all).
3. A purple SPAM ENVELOPE with a small megaphone sticking out and a few sparkles around it.
4. A sheet of LINED NOTEBOOK PAPER, portrait, with a spiral binding on the left side and blue lines, completely EMPTY (no writing).
5. A grey SILHOUETTE of a person, head and shoulders, wearing a hood, the face only a dark shadow with no eyes and no mouth — a mysterious unknown sender, not scary.

DO NOT INCLUDE: people's faces (except the shadowed silhouette in cell 5), hands, phones, backgrounds, tables, floor, shadows on the ground, text, letters, words, labels, readable writing, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, map pins, street names, scary or creepy features, items crossing cell borders, cropped edges, grid lines, visible sprite-sheet borders, cell borders, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, drop shadow on the cell, white backing in transparent assets.
~~~
