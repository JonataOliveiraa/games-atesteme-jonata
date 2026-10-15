# Rastro da Notícia — texturas

Destino: `src/assets/games/EF04CO08/rastro-da-noticia/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 o laço, §5 a tela, §6 a rua).

**Linha de arte: chibi voador** (Dúvida 1 do plano). Anexe em **toda geração** a `references/35-chibi-voador.webp`, com os quatro meninos chibi voando entre nuvens, slimes e arco-íris.
- Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*.
- O elenco da referência vai no negativo de todos os prompts.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código nas mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `detetive.png` | 4 × 2 | 320 × 400 | 1280 × 800 | sim | o detetive: parado, 4 quadros de andar de lado, olhando para cima, comemorando, ops |
| `lia.png` | 4 × 2 | 320 × 400 | 1280 × 800 | sim | a Lia: parada, 4 quadros de andar de lado, lendo o celular, feliz, ops |
| `predios.png` | 3 × 2 | 480 × 520 | 1440 × 1040 | sim | as 6 fachadas-site, com a **tela em branco** e a **placa em branco** (o N1 usa 2: Escola e @zumzum; o N2 e o N3 usam as outras) |
| `logos.png` | 4 × 2 | 160 × 160 | 640 × 320 | sim | os 6 logos dos sites, o celular e a caneta |
| `ui.png` | 4 × 2 | 320 × 320 | 1280 × 640 | sim | botão de seta, botão da lupa, botão largo em branco, celular grande, joinha, mão de pare, aviãozinho de papel, bolinha de papel |
| `rua.png` | — | — | 1280 × 720 | opaco | o fundo da rua, **emendável dos lados** (o jogo repete na horizontal) |
| `patio.png` | — | — | 1280 × 720 | opaco | o **mundo de verdade**: o pátio da escola, onde a Lia recebe a notícia e onde a consequência acontece |
| `cover-rastro-da-noticia.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** O nome dos sites, a página, o rastro e os botões são escritos pelo código. A única exceção é o título da capa.
- **Tela e placa em branco.** Cada fachada tem uma tela grande, lisa e clara, onde o código desenha a página do site, e uma placa lisa em cima, onde o código põe o logo e o nome. Na tela não pode haver reflexo forte nem desenho.
- **Nenhum prédio parece "do bem" ou "do mal".** O perfil @zumzum é cinza e simples, mas é fofo e não assusta. Quem decide é a página, não a fachada.
- **Personagens andam de lado, olhando para a DIREITA.** O código espelha para a esquerda. No andar, o quadro 3 é o **espelho** do 1 e o 4 é o **espelho** do 2: cada passagem levanta uma perna **diferente** (ver a nota da `teo-andar` da Câmera na Trilha, que veio com as duas passagens iguais).
- Peça solta e centrada na célula, com cerca de 8 % de margem. **Fachada e personagem pisam no fundo da célula** (sem margem embaixo).

---

## 3. `detetive.png` — 4 × 2 células de 320 × 400 (1280 × 800), alfa

O detetive mirim: um menino chibi de pele morena, cabelo preto cacheado e curto, olhos grandes castanhos, um boné de detetive bege de aba curtinha, cachecol amarelo-mostarda, colete verde-água sobre camiseta branca, bermuda azul-marinho e tênis brancos de cadarço verde-água. Ele segura uma **lupa grande** de cabo de madeira na **mão direita**.

| Célula | Pose |
|---|---|
| 0 | **parado**, de lado, olhando para a DIREITA, com a lupa baixa ao lado do corpo |
| 1 | andar, quadro 1: perna **de perto** (a direita) à frente, perna de longe atrás |
| 2 | andar, quadro 2: perna de perto embaixo do corpo, perna de longe **levantada** passando |
| 3 | andar, quadro 3: o **espelho** do 1 (perna de longe à frente, perna de perto atrás) |
| 4 | andar, quadro 4: o **espelho** do 2 (perna de longe embaixo, perna de perto **levantada** passando) |
| 5 | **olhando para cima**, de **costas** (vê-se o boné por trás), a lupa erguida para o alto |
| 6 | **comemorando**, de frente, pulinho, a lupa para o alto |
| 7 | **ops**, de frente, as duas mãos nas bochechas, gotinha de suor |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 400 (total 1280 x 800), read left to right, top row first. The SAME cute chibi boy in every cell, a little kid DETECTIVE: warm brown skin, short curly black hair, big round brown eyes, a small beige detective cap with a short brim, a mustard-yellow scarf, a teal vest over a white T-shirt, navy shorts, white sneakers with teal laces, and a big round MAGNIFYING GLASS with a wooden handle held in his RIGHT hand. Head about half of his height. In every cell he is complete, centered horizontally, with the soles of his shoes touching the BOTTOM edge of the cell, one single fully opaque figure per cell, the same size in all cells.
1. Standing still, seen from the SIDE, facing RIGHT, relaxed, the magnifying glass held low at his side.
2. Walking to the RIGHT, side view, frame 1 (CONTACT A): his RIGHT leg (the NEAR leg, closer to the viewer) stretched forward with the heel touching the ground, his LEFT leg (the FAR leg, partly hidden, one tone darker) stretched back on its toes; the arm with the magnifying glass swings back.
3. Walking to the RIGHT, frame 2 (PASSING A): the NEAR leg straight under his body carrying the weight, the FAR leg bent and LIFTED, passing beside it; arms close to the body; head a little higher.
4. Walking to the RIGHT, frame 3 (CONTACT B) — THE MIRROR OF FRAME 1: now the FAR leg is forward with the heel down and the NEAR leg is back on its toes; the arm with the magnifying glass swings forward.
5. Walking to the RIGHT, frame 4 (PASSING B) — THE MIRROR OF FRAME 2: the FAR leg straight under the body carrying the weight, the NEAR leg bent and LIFTED, passing beside it; head a little higher.
6. Seen from the BACK (we see the back of his cap and scarf), looking UP at something high in front of him, raising the magnifying glass up high with his right arm.
7. Cheering, front view, a happy little jump, the magnifying glass raised high, big open smile, eyes closed happily.
8. "Oops" pose, front view, both hands on his cheeks, worried round eyes, a small sweat drop.
The walk frames 2 to 5 form ONE smooth walk cycle: between frames 2 and 4 the two legs clearly SWAP places, and frames 3 and 5 lift DIFFERENT legs.

DO NOT INCLUDE: the same leg forward in frames 2 and 4, the same leg lifted in frames 3 and 5, only one leg moving, a frozen back leg, three legs, extra or missing legs or arms, ghost duplicates, semi-transparent copies, onion-skin overlays, motion blur, speed lines, dust clouds, running poses, both feet in the air while walking, the magnifying glass switching hands, a different outfit or face between cells, different sizes between cells, ground, floor, shadows on the ground, backgrounds, other characters, pets, a smoking pipe, a trench coat, guns, weapons, handcuffs, text, letters, numbers, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `lia.png` — 4 × 2 células de 320 × 400 (1280 × 800), alfa

A amiga que recebe a notícia: uma menina chibi de pele clara bronzeada, cabelo castanho-escuro em **dois coquinhos fofos**, olhos grandes castanhos, moletom rosa-coral com um coraçãozinho, bermuda jeans azul-clara e tênis brancos de cadarço rosa. Ela segura um **celular de capinha verde-menta** na **mão direita**. É um pouco mais baixa que o detetive.

| Célula | Pose |
|---|---|
| 0 | **parada**, de lado, olhando para a DIREITA, o celular na altura do peito |
| 1–4 | os 4 quadros de andar, iguais aos do detetive (3 = espelho do 1, 4 = espelho do 2) |
| 5 | **lendo o celular**, de frente, olhando para baixo, o celular nas duas mãos |
| 6 | **feliz**, de frente, pulinho, os braços para o alto, o celular numa mão |
| 7 | **ops**, de frente, triste e preocupada, a mão na bochecha, o celular na outra |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 400 (total 1280 x 800), read left to right, top row first. The SAME cute chibi girl in every cell, LIA: light tan skin, dark brown hair in TWO fluffy round buns, big round brown eyes, rosy cheeks, a coral-pink hoodie with a small heart patch, light-blue denim shorts, white sneakers with pink laces, and a SMARTPHONE in a mint-green case held in her RIGHT hand. Head about half of her height, a little shorter than an average chibi boy. In every cell she is complete, centered horizontally, with the soles of her shoes touching the BOTTOM edge of the cell, one single fully opaque figure per cell, the same size in all cells.
1. Standing still, seen from the SIDE, facing RIGHT, holding the phone at chest height.
2. Walking to the RIGHT, side view, frame 1 (CONTACT A): her RIGHT leg (the NEAR leg) stretched forward with the heel down, her LEFT leg (the FAR leg, partly hidden, one tone darker) stretched back on its toes.
3. Walking to the RIGHT, frame 2 (PASSING A): the NEAR leg straight under her body, the FAR leg bent and LIFTED, passing beside it; head a little higher.
4. Walking to the RIGHT, frame 3 (CONTACT B) — THE MIRROR OF FRAME 1: the FAR leg forward with the heel down, the NEAR leg back on its toes.
5. Walking to the RIGHT, frame 4 (PASSING B) — THE MIRROR OF FRAME 2: the FAR leg straight under her body, the NEAR leg bent and LIFTED, passing beside it; head a little higher.
6. Front view, reading the phone held in both hands, looking down at it, curious.
7. Happy, front view, a little jump with both arms up, the phone in one hand, big smile.
8. "Oops" pose, front view, sad and worried, one hand on her cheek, the phone in the other hand.
The walk frames 2 to 5 form ONE smooth walk cycle: between frames 2 and 4 the two legs clearly SWAP places, and frames 3 and 5 lift DIFFERENT legs.

DO NOT INCLUDE: the same leg forward in frames 2 and 4, the same leg lifted in frames 3 and 5, only one leg moving, a frozen back leg, three legs, extra or missing legs or arms, ghost duplicates, semi-transparent copies, onion-skin overlays, motion blur, speed lines, running poses, the phone switching hands, a different outfit or face between cells, different sizes between cells, ground, floor, shadows on the ground, backgrounds, other characters, pets, text or apps on the phone screen, letters, numbers, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `predios.png` — 3 × 2 células de 480 × 520 (1440 × 1040), alfa

Seis fachadas vistas **de frente, retas** (sem perspectiva), cada uma ocupando a célula quase inteira e **pisando no fundo dela**. Todas têm, no mesmo lugar:

| Parte | Onde (na célula de 480 × 520) | O código põe |
|---|---|---|
| enfeite do telhado (antena, torre, telhas) | y ≈ 0–50 | — |
| **placa** lisa, clara, larga | y ≈ 56–104, x ≈ 70–410 | o logo e o nome do site |
| **tela** grande, lisa, clara, com moldura | y ≈ 114–338, x ≈ 40–440 | a página do site |
| **porta** | embaixo, no meio, y ≈ 400–520 | — |

| Célula | Site | Fachada |
|---|---|---|
| 0 | Jornal do Bairro | escritório azul-céu e creme, duas colunas baixas, toldo listrado, um jornal enrolado de enfeite na beira do telhado |
| 1 | Blog da Tia Nena | lojinha-casinha rosa, telhado arredondado de telhas em escama, floreiras nas janelinhas |
| 2 | Grupo da Turma | prédio verde-menta todo arredondado, com a forma de um **balão de conversa** (o rabinho no canto de baixo à esquerda) e janelas redondas |
| 3 | Canal TopTudo | estúdio coral com uma antena e uma parabólica no telhado, uma lâmpada vermelha de "no ar" sem letras e um refletor de lado |
| 4 | Perfil @zumzum | quiosque estreito cinza-lilás, toldo em capuz, as janelinhas de lado com a persiana fechada, quase sem enfeite. Simples e misterioso, mas **fofo, sem assustar** |
| 5 | Site da Escola | escola amarelo-manteiga com uma torrezinha de sino, uma bandeirinha lisa e degraus na porta |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 480 x 520 (total 1440 x 1040), read left to right, top row first. Six cute, chunky, toy-like little BUILDING FACADES for a side-scrolling street in a children's game, each seen STRAIGHT FROM THE FRONT (flat, no perspective), filling its cell almost completely and standing on the BOTTOM edge of the cell. EVERY facade has the same three parts in the same place: (a) near the top, a wide, plain, light SIGN BOARD, completely BLANK; (b) below it, a big flat light-cream SCREEN panel with a soft rounded frame, like a giant computer monitor built into the wall, about 85% of the facade width and 45% of its height, completely BLANK and evenly lit, with no reflections; (c) a door at the bottom center.
1. A NEWSPAPER office: sky-blue and cream walls, two short columns, a striped awning over the door, a rolled newspaper ornament on the roof edge.
2. A cozy BLOG cottage-shop: pink walls, a rounded roof with scalloped tiles, little flower boxes.
3. A mint-green rounded building shaped like a big CHAT BUBBLE (a little tail at the lower left corner), with round windows.
4. A coral TV STUDIO: a small antenna and a satellite dish on the roof, a small red "on air" lamp with no letters, a little spotlight on the side.
5. A narrow grey-lilac KIOSK with a hood-like awning and closed shutters on its little side windows, very plain, a bit mysterious but CUTE and friendly, not scary.
6. A butter-yellow SCHOOL with a small bell tower, a plain little flag and steps at the door.

DO NOT INCLUDE: text, letters, numbers, logos, symbols or pictures on the sign boards, anything drawn on the screens, reflections or glare on the screens, icons, brand marks, people, characters, faces on the buildings, animals, cars, streets, sidewalks, ground, grass, sky, backgrounds behind the buildings, shadows on the ground, side walls in perspective, 3/4 views, scary, dark or broken buildings, villains, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `logos.png` — 4 × 2 células de 160 (640 × 320), alfa

Símbolos soltos, sem ladrilho de fundo (o código desenha a fichinha por baixo). Eles aparecem pequenos no rastro e no mapa da rua (≈ 40 px), então precisam ser **simples e de silhueta clara**.

| Célula | Símbolo |
|---|---|
| 0 | jornal dobrado (Jornal do Bairro) |
| 1 | coração com um lápis (Blog da Tia Nena) |
| 2 | dois balões de conversa (Grupo da Turma) |
| 3 | botão de play numa telinha arredondada (Canal TopTudo) |
| 4 | silhueta cinza de cabeça com um "?" (Perfil @zumzum) |
| 5 | escolinha com bandeira (Site da Escola) |
| 6 | celular de capinha verde-menta (o celular da Lia) |
| 7 | caneta-tinteiro (quem escreveu) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game icon sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 160 x 160 (total 640 x 320), read left to right, top row first. Eight simple, bold, cute ICON SYMBOLS with very clear silhouettes that still read at 40 pixels, each centered with about 10% margin, NO background tile behind them.
1. A folded NEWSPAPER (sky blue and cream), with plain grey lines instead of text.
2. A pink HEART with a small yellow PENCIL crossing it.
3. TWO overlapping CHAT BUBBLES, one mint and one white.
4. A coral rounded little SCREEN with a white PLAY triangle in the middle.
5. A plain grey-lilac HEAD SILHOUETTE (no face) with a white QUESTION MARK on it.
6. A tiny butter-yellow SCHOOL building with a little flag.
7. A SMARTPHONE in a mint-green case, the screen plain and light.
8. A fountain PEN (navy with a gold tip).

DO NOT INCLUDE: square or rounded icon tiles behind the symbols, app-icon backgrounds, text, letters, real words, numbers, brand logos, real app logos, faces, characters, people, shadows on the ground, items crossing cell borders, items cut by the cell edge, tiny details that disappear at small size, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols other than the two chat bubbles of icon 3, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `ui.png` — 4 × 2 células de 320 (1280 × 640), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | botão **redondo** creme com uma **seta grossa apontando para a DIREITA** | ▶; o código espelha para o ◀ |
| 1 | botão **redondo** verde-água com uma **lupa** | OLHAR |
| 2 | botão **largo** (≈ 3 : 1), creme, arredondado e fofo, **em branco** | PODE CONFIAR / NÃO CONFIE (o código escreve e põe o ícone) |
| 3 | **celular grande** em pé, capinha verde-menta, a **tela lisa e clara** | a mensagem que chegou para a Lia |
| 4 | mão de **joinha** 👍 | ícone do PODE CONFIAR |
| 5 | **mão aberta** de "pare" ✋ | ícone do NÃO CONFIE |
| 6 | **aviãozinho de papel** branco, voando para a direita | a página indo para a Lia / o boato se espalhando |
| 7 | **bolinha de papel amassado** | a mensagem do boato jogada fora |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. Cute, puffy, chunky interface pieces for a children's game, each centered with about 8% margin, no ground, no shadow.
1. A big ROUND cream push button with a thick, rounded teal ARROW pointing to the RIGHT, soft highlight.
2. A big ROUND teal push button with a white MAGNIFYING GLASS on it, soft highlight.
3. A WIDE, rounded, puffy cream push button (about 3:1), seen from the front, with a soft highlight, its face completely BLANK.
4. A big SMARTPHONE standing upright, in a mint-green case, with a plain, evenly lit light screen (completely BLANK), about 60% of the cell tall.
5. A cute cartoon THUMBS-UP hand, warm skin tone.
6. A cute cartoon OPEN PALM "stop" hand, warm skin tone, facing the viewer.
7. A white PAPER PLANE flying to the RIGHT, with a soft fold shading.
8. A small ball of CRUMPLED white PAPER.

DO NOT INCLUDE: text, letters, numbers, words on the buttons, apps or notifications on the phone screen, extra symbols, check marks, X marks, red or green "right/wrong" colors on the buttons, faces on the objects, people, characters, backgrounds behind the items, ground, shadows on the ground, items crossing cell borders, items cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `rua.png` — 1280 × 720, opaco, emendável dos lados

O fundo atrás dos prédios. O jogo **repete esta imagem na horizontal** ao longo de 4240 px, então a borda esquerda tem de continuar exatamente na direita.

| Região (y) | O que tem |
|---|---|
| 0–110 | céu azul-claro liso, um pouco mais claro embaixo (o cabeçalho cobre parte) |
| 110–520 | ao longe, uma fileira **baixa e clarinha** de prédios e árvores de cidade, em tons pastel lavados, com pouco contraste. É o fundo do fundo, porque os prédios-site ficam na frente |
| 520–590 | uma faixa de canteiro: grama baixa e arbustinhos redondos |
| 590–720 | **calçada** de pedrinhas creme, com o meio-fio na beira de baixo. Calma, sem buraco e sem desenho no chão (os controles ficam por cima) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's side-scrolling game, 1280 x 720, opaque, SEAMLESSLY TILEABLE LEFT TO RIGHT (the left edge continues exactly into the right edge). A calm, cute town street seen straight from the SIDE. Top: a plain, soft light-blue sky, slightly lighter near the horizon. Middle (from about 15% to 72% of the height): far away, a LOW row of pale, washed-out pastel town buildings and round trees with very low contrast, like a soft backdrop. Above the sidewalk (about 72% to 82%): a strip of short grass with little round bushes. Bottom (from about 82% down): a calm cream cobblestone SIDEWALK with a simple curb at the very bottom edge. Bright, friendly morning mood. Everything in the middle must stay soft and quiet, because the game places big buildings in front of it.

DO NOT INCLUDE: big buildings in the foreground, shops, signs, text, letters, numbers, logos, people, characters, animals, cars, bikes, street lamps in the foreground, holes or drawings on the sidewalk, strong contrast in the backdrop, perspective streets going into the distance, night, rain, a seam or a cut at the left or right edge, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8.1 `patio.png` — 1280 × 720, opaco

O **mundo de verdade**, em close (14/10/2026, pedido *"ainda tá sem contexto"*). A notícia chega no celular da Lia aqui, o detetive mergulha no celular para investigar na cidade da internet, e a consequência acontece aqui quando ele volta. O código põe por cima a Lia (300 px, em x ≈ 760), o detetive (330 px, em x ≈ 1040), o celular grande (à esquerda, x ≈ 330) e o balão da Lia. Por isso o fundo tem de ser **calmo**.

| Região | O que tem |
|---|---|
| 0–96 (y) | céu (o cabeçalho cobre) |
| fundo | a parede clara da escola, com janelas e bandeirinhas, e uma árvore no canto esquerdo |
| chão (y 560–720) | piso de pátio liso, onde os dois pisam (os pés ficam em y ≈ 664) |
| x 180–480 | liso, porque o celular grande fica por cima |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 1280 x 720, opaque: a cute, calm SCHOOL COURTYARD seen straight from the SIDE, at eye level, like a stage. In the back, the light cream wall of a friendly school building with a row of big windows, a little arched doorway and a string of small colorful pennant flags. A round leafy tree on the far left. The lower part (bottom 22%) is a smooth, light courtyard floor of pale paving stones where characters will stand. Bright, sunny school-morning mood. The middle and the area from the center to the right must stay quiet and open (two characters will stand there), and the left-center area must stay plain (a big phone card will be drawn there).

DO NOT INCLUDE: people, children, teachers, characters, animals, benches or objects in the middle, text, letters, numbers, signs with words, school name, logos, posters with writing, phones, screens, buildings in the foreground, strong perspective, night, rain, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. `cover-rastro-da-noticia.png` — 1672 × 941, opaco, com o título

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A cover illustration for a children's game, 16:9 (1672 x 941), opaque. At the TOP, a big, bold, friendly title lettering that reads exactly "Rastro da Notícia" (Portuguese, with the accent on the "i"), in chunky rounded letters, cream with a teal outline. Below: a cute side-view town street where every little building has a big glowing screen on its facade, like a website. A chibi kid DETECTIVE boy (warm brown skin, short curly black hair, small beige detective cap, mustard scarf, teal vest, navy shorts) walks forward holding up a big magnifying glass, following a trail of flying paper copies of the same news sheet that hop from screen to screen, each copy a bit more exaggerated (more exclamation marks drawn as simple strokes, no readable words). Behind him, his friend LIA (chibi girl, two fluffy dark-brown hair buns, coral-pink hoodie) looks at her mint smartphone, curious. Bright, adventurous, friendly mood.

DO NOT INCLUDE: any text other than the title "Rastro da Notícia", readable words on the papers or screens, misspelled title, extra titles, logos, real app logos, brand marks, guns, weapons, villains, scary elements, night, rain, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 10. Quando a arte chegar

- Medir cada folha por colunas antes de medir por célula (objeto que vaza para a célula vizinha pede reempacotar) e zerar a franja de alfa baixo.
- **Andar:** medir os dois tênis por quadro e, de lado, a cor da canela. Se as passagens (quadros 2 e 4) vierem iguais, ver o contorno usado na Câmera na Trilha (`WALK_CYCLE`).
- **Fachadas:** a tela e a placa nunca vêm no lugar pedido. Medir o retângulo claro de cada fachada e ajustar `FACADE.screen`/`FACADE.sign` em `data/layout.ts` (um por célula, se preciso).
- Registrar medidas e limpezas no `MANIFEST.md` da pasta de assets.
- **N2 e N3 (15/10/2026):** usam as 6 fachadas e os 6 logos que já estão nas folhas. O calendário da linha *quando:* do N3 é desenhado em código (`CAL` em `scenes/art.ts`); se um dia vier arte, cabe numa célula nova de `logos.png`. A `rua.png` não emenda nas bordas, então o jogo a repete **espelhada** a cada tela; uma versão emendável de verdade só melhora a variedade.
