# Subida do Dia — texturas

Destino: `src/assets/games/EF01CO02/subida-do-dia/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 problemas e escadinhas, §12 textura × código).

A linha de arte é **chibi de rabisco**, uma linha nova, pedida pelo usuário
para este jogo. A referência é `references/29-chibi-rabisco.jpg`, **anexada em
toda geração**. Cada prompt abaixo vem inteiro (estilo + corpo + negativo),
pronto para copiar.

### Tabela de estilo: chibi de rabisco × as linhas vizinhas

| Critério | **Chibi de rabisco** (este jogo) | Chibi de figurinha (`19`) | Desenho de criança (`16`) |
|---|---|---|---|
| Traço | tinta **marrom-ameixa `#37161D`**, firme, com leve variação de espessura e ponta afinando, como caneta-pincel | azul-marinho, uniforme | hidrográfica trêmula, espessura irregular |
| Cor | **nenhuma** no personagem e nas peças: o miolo é a cor do papel `#FCF9C4`; só a bochecha é chapada `#E2C6C2` | chapada + 1 tom de sombra | 100% chapada, vazando o traço |
| Olho | emote: arco fechado, pontinho, bolão com 1 brilho, olho de choro | grande, brilhante, colorido | pontinho |
| Silhueta | poucas linhas, muito papel vazio; **sem keyline** | keyline branca | sem keyline |
| Proporção | cabeçona redonda, corpo mínimo | chibi | criança ingênua |
| Fundo | papel amarelinho liso | cena colorida | branco |

**A exceção de cor** (*Dúvidas*, item 3, do plano): nos **quadros dos problemas**
e nas **figuras dos passos**, só os materiais do conteúdo ganham **um pastel
chapado cada**, sem sombra, porque é neles que a criança lê o que aconteceu:

| Material | Cor | Material | Cor |
|---|---|---|---|
| água, rio | `#A9D8F0` | espuma, bolhas, requeijão | `#FFFFFF` |
| terra | `#C9A27E` | feijão | `#B98B6B` |
| broto, folhas | `#A8D59A` | tinta azul | `#8EC5F2` |
| pão | `#F2D59B` | quadrado do Tangram | `#F7D06B` |
| triângulo do Tangram | `#F4A3A3` | porta do Tangram | `#9CCFA0` |

O personagem, a escadinha, o cadeado, o dedo e o fundo **nunca** ganham cor.
Se o usuário recusar a exceção, apague o bloco `CONTENT COLOUR EXCEPTION` dos
prompts do §4 e do §6.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `crianca.png` | 3 × 2 | 384 × 384 | 1152 × 768 | sim | o personagem: 6 poses |
| `passos.png` | 6 × 5 | 256 × 256 | 1536 × 1280 | sim | as 28 figuras de passo |
| `pecas.png` | 4 × 2 | 320 × 320 | 1280 × 640 | sim | trilhos, degrau, degrau vazado, cadeado, dedo |
| `problemas-1.png` | 5 × 4 | 256 × 256 | 1280 × 1024 | sim | quadros de *lavar as mãos* e *plantar o feijão* |
| `problemas-2.png` | 5 × 4 | 256 × 256 | 1280 × 1024 | sim | quadros da *casinha de Tangram* e do *chapéu de papel* |
| `problemas-3.png` | 5 × 4 | 256 × 256 | 1280 × 1024 | sim | quadros de *ir até a vovó* e *calçar o tênis* |
| `problemas-4.png` | 5 × 4 | 256 × 256 | 1280 × 1024 | sim | quadros de *pintar o desenho* e *fazer o sanduíche* |
| `bg-papel.png` | — | — | 1280 × 720 | opaco | papel, nuvem vazia, moldura vazia do quadro, chão |
| `cover-subida-do-dia.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**Ordem de geração:** `crianca.png` **primeiro**. Ela vira a segunda imagem
anexada em `passos.png`, `problemas-3.png` (o mapinha da vovó) e na capa.

**A ordem das células é contrato com o código** (`data/files.ts`,
`data/steps.ts`, `data/problems.ts`). Se trocar uma célula, avise o Ferro e a Brasa.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. A palavra do passo, o nome
  do problema e as etiquetas `trocou!`/`faltou!` são texto do jogo.
- **Sprite com alfa:** o miolo da silhueta é **opaco, na cor do papel**
  `#FCF9C4`, e fora dela é transparente. Sem keyline branca. Assim a peça
  tapa o que está atrás sem parecer recortada.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão e sem sombra.
  Nada vaza para a célula vizinha.
- **Quadros do mesmo problema têm o mesmo enquadramento** (a mesma pia no mesmo
  lugar, o mesmo copinho no mesmo lugar). Entre um quadro e o próximo só muda o
  que o passo mudou. É isso que faz a troca parecer o passo acontecendo.
- **Figura de passo = a ação**, com mãos ou com o personagem; **quadro = o
  resultado**, só o objeto. Uma não pode ser confundida com a outra.
- As figuras de passo têm a mesma escala e o mesmo peso de traço, e nenhuma é
  mais chamativa que as outras: qualquer uma pode estar na escadinha errada.
- Legível a ~72 px, que é a figura no degrau com 4 degraus.

## 3. `crianca.png` — grade 3 × 2, célula 384 × 384

O personagem: uma criança chibi de uns 6 anos, cabeça enorme e redonda, **cabelo
curto repicado em tufinhos, sem nenhum fio-antena**, camiseta com uma
estrelinha, bermuda, tênis. Só traço e bochecha.

| Célula | Nome no código | Pose | Pivô |
|---|---|---|---|
| 0 | `kid-idle` | em pé, de frente, sorriso de olhos fechados em arco | pés em (192, 360) |
| 1 | `kid-climb-a` | de perfil 3/4 para a **esquerda**, subindo: mão esquerda no alto, pé direito no alto | mão alta em (150, 60); pés em (192, 360) |
| 2 | `kid-climb-b` | igual à 1, com os lados invertidos (mão direita no alto) | igual à 1 |
| 3 | `kid-slide` | escorregando para baixo, braços para cima, olhos redondos de susto e boquinha quadrada | centro em (192, 200) |
| 4 | `kid-oops` | sentado no chão, sorriso sem graça, uma gotinha de suor | base em (192, 360) |
| 5 | `kid-cheer` | pulando, braços para cima, olhos em arco e boca aberta de alegria | pés em (192, 360) |

A subida (1 e 2) é **para a esquerda** porque ele sobe pelo trilho da direita,
olhando para a escadinha.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn chibi doodle / emote-sketch line art; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO colour fill and NO shading: the inside of every shape is the warm pale-lemon paper colour #FCF9C4; the ONLY tone is a flat soft oval cheek blush in dusty rose #E2C6C2; super simple emote-like faces (closed-eye arcs, tiny dots, big round eyes with one small highlight, tiny mouths); huge round head on a tiny body; very few lines, lots of empty paper. Take ONLY the art style from the attached image: do NOT copy its character, hairstyle, framing or layout.

Use case: stylized-concept
Asset type: exact character pose sprite sheet for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create ONE exact 3 columns × 2 rows sprite sheet on a transparent 1152 × 768 px canvas. Every cell is exactly 384 × 384 px. Each pose is complete, isolated, centred in its own cell with at least 8% transparent margin. The inside of each silhouette is OPAQUE paper colour #FCF9C4; everything outside the silhouette is genuinely transparent. No white keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

The character: one cheerful gender-neutral chibi child about 6 years old, very big round head on a tiny body (about 2 heads tall), SHORT choppy hair made of a few rounded tufts with a light fringe and NO antenna hair strand, a plain T-shirt with one small star drawn on the chest, shorts, simple sneakers. Line and blush only.

Exact cells, left to right and then top to bottom:
0. kid-idle — standing, facing front, happy closed-eye arc smile, arms relaxed. Feet at local (192, 360).
1. kid-climb-a — three-quarter view facing LEFT, climbing an invisible ladder: LEFT hand reaching high, RIGHT knee raised, focused little smile. Do not draw the ladder. Feet at local (192, 360).
2. kid-climb-b — the same climbing pose mirrored in the limbs only (RIGHT hand high, LEFT knee raised), still facing LEFT, same scale and position.
3. kid-slide — sliding down with both arms up, round startled eyes and a tiny square open mouth, a few short speed lines above. Body centre at local (192, 200).
4. kid-oops — sitting on the floor with legs out, sheepish smile, one small sweat drop. Base at local (192, 360).
5. kid-cheer — jumping for joy, both arms up, happy closed-eye arcs, big open smile, two tiny sparkle marks.

Consistency constraints: all six cells are the IDENTICAL character with the same head size, hair tufts, clothes and line weight; only pose and expression change.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), antenna hair, ahoge, bob haircut, a second character, ladder, stairs, props, ground, floor, shadow, background, colour fills, coloured clothes, cel shading, shadow tones, gradients, glossy anime rendering, screen tones, hatching, white sticker keyline, pure black lines, grey lines, thick uniform vector outlines, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, speech bubbles, arrows, icons, question mark, crying, angry faces, pointing at the viewer, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, 3D render, photorealism, blur, heavy noise.
~~~

## 4. `passos.png` — grade 6 × 5, célula 256 × 256

Anexar `references/29-chibi-rabisco.jpg` (estilo) e a `crianca.png` aprovada (personagem).

| Célula | id | Palavra na tela | Figura (a ação) |
|---|---|---|---|
| 0 | `wash-tap` | abrir torneira | mãozinha girando o registro de uma torneira, um fiozinho de água saindo |
| 1 | `wash-soap` | ensaboar | duas mãos esfregando, cheias de espuma e bolhas |
| 2 | `wash-rinse` | enxaguar | duas mãos embaixo da água da torneira |
| 3 | `wash-dry` | secar | duas mãos secando numa toalhinha |
| 4 | `bean-soil` | pôr terra | pazinha despejando terra num copinho |
| 5 | `bean-hole` | buraquinho | um dedinho afundando na terra do copinho |
| 6 | `bean-seed` | pôr feijão | dedinhos soltando um feijão |
| 7 | `bean-water` | regar | regadorzinho molhando o copinho |
| 8 | `grandma-gate` | portão | o personagem abrindo um portãozinho |
| 9 | `grandma-bridge` | ponte | o personagem andando numa pontezinha sobre a água |
| 10 | `grandma-bakery` | padaria | o personagem acenando na frente de uma padariazinha (pão no toldo, sem letreiro) |
| 11 | `tangram-square` | quadrado | mãozinha pousando uma peça quadrada |
| 12 | `tangram-roof` | triângulo em cima | mãozinha pousando uma peça triangular por cima de um quadrado |
| 13 | `tangram-door` | porta | mãozinha encaixando uma peça-porta na frente do quadrado |
| 14 | `hat-half` | dobrar ao meio | mãos dobrando uma folha ao meio |
| 15 | `hat-corners` | dobrar os cantos | mãos dobrando as duas pontas de cima para o centro |
| 16 | `hat-brim` | dobrar a barra | mãos dobrando a faixa de baixo para cima |
| 17 | `paint-paper` | pôr o papel | mãos pondo uma folha em branco na mesa |
| 18 | `paint-open` | abrir a tinta | mãos girando a tampa de um potinho de tinta |
| 19 | `paint-dip` | molhar o pincel | pincel mergulhando no pote aberto |
| 20 | `paint-brush` | pintar | pincel pintando uma florzinha |
| 21 | `shoes-sock` | pôr a meia | mãos puxando uma meia no pé |
| 22 | `shoes-shoe` | calçar o tênis | mãos enfiando um tênis no pé de meia |
| 23 | `shoes-tie` | amarrar | mãos fazendo o laço do cadarço |
| 24 | `sandwich-bread` | pegar o pão | mão pegando uma fatia de pão |
| 25 | `sandwich-open` | abrir o pote | mãos girando a tampa de um pote de requeijão |
| 26 | `sandwich-spread` | passar requeijão | faquinha sem ponta passando requeijão no pão |
| 27 | `sandwich-close` | fechar | mão pondo a fatia de cima no sanduíche |
| 28 | — | — | vazia |
| 29 | — | — | vazia |

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn chibi doodle / emote-sketch line art; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO shading at all; the inside of every shape is the warm pale-lemon paper colour #FCF9C4; faces use only a flat soft oval cheek blush in dusty rose #E2C6C2; super simple shapes, very few lines, lots of empty paper. Take ONLY the art style from the first attached image: do NOT copy its character, hairstyle, framing or layout.
CHARACTER — THE SECOND ATTACHED IMAGE (crianca.png) IS THE CHARACTER REFERENCE: whenever the child appears, it is exactly this child. Hands are small, round, chibi, line-only.
CONTENT COLOUR EXCEPTION — only these materials get ONE flat pale pastel fill each, with no shading: water #A9D8F0; soap foam, bubbles and cream cheese #FFFFFF; soil #C9A27E; bean #B98B6B; sprout leaves #A8D59A; blue paint #8EC5F2; bread #F2D59B; tangram square #F7D06B; tangram triangle #F4A3A3; tangram door #9CCFA0. Everything else stays line on paper colour.

Use case: stylized-concept
Asset type: exact step-picture sprite sheet for a Phaser 3 educational game about following steps to solve everyday problems.
Primary request: create ONE exact 6 columns × 5 rows sprite sheet on a transparent 1536 × 1280 px canvas. Every cell is exactly 256 × 256 px. Each picture is complete, isolated, centred in its own cell with at least 8% transparent margin. The inside of each silhouette is OPAQUE paper colour #FCF9C4 (or the listed pastel); everything outside is genuinely transparent. No white keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.
Framing lock: every cell shows ONE action with ONE or two big simple objects, close-up, the same scale and the same line weight; no background, no table surface, no floor. Each action must be readable at 72 px. No cell is more detailed or more colourful than the others.

Exact cells, left to right and then top to bottom:
0. a small hand turning the handle of a tap, a thin stream of water coming out.
1. two small hands rubbing together, covered in white foam and bubbles.
2. two small hands under the stream of water from a tap.
3. two small hands drying on a small towel.
4. a small trowel pouring soil into a little cup.
5. one small finger pushing a hole into the soil of a little cup.
6. small fingers dropping one bean.
7. a small watering can watering a little cup.
8. the child opening a small garden gate.
9. the child walking across a small wooden bridge over water.
10. the child waving in front of a tiny bakery with a bread drawing on its awning and NO sign lettering.
11. a small hand placing a square tangram piece.
12. a small hand placing a triangle tangram piece on top of a square.
13. a small hand fitting a small rectangular door piece onto the front of the square.
14. two small hands folding a plain blank sheet of paper in half.
15. two small hands folding the two top corners of a folded sheet down toward the centre.
16. two small hands folding the bottom strip of the paper upward.
17. two small hands placing a blank sheet of paper down.
18. two small hands twisting the lid off a small paint jar.
19. a paintbrush dipping into an open paint jar.
20. a paintbrush painting a simple flower.
21. two small hands pulling a sock onto a foot.
22. two small hands pushing a sneaker onto a socked foot.
23. two small hands tying a shoelace bow.
24. a small hand picking up one slice of bread.
25. two small hands twisting the lid off a round cream cheese jar.
26. a rounded child's butter knife spreading white cream cheese on a slice of bread.
27. a small hand placing the top slice of bread on a sandwich.
28. completely EMPTY and genuinely transparent reserved cell.
29. completely EMPTY and genuinely transparent reserved cell.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), antenna hair, ahoge, adults, a second child, animals, background scenery, table surfaces, floor, shadows, any colour other than the listed pastels, colour on hands or clothes, cel shading, shadow tones, gradients, glossy anime rendering, screen tones, hatching, white sticker keyline, pure black lines, grey lines, thick uniform vector outlines, sharp knife, text, letters, words, labels, signage, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, frames, plaques, speech bubbles, arrows, icons, check marks, crosses, question mark, objects in cells 28–29, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, 3D render, photorealism, blur, heavy noise.
~~~

## 5. `pecas.png` — grade 4 × 2, célula 320 × 320

| Célula | Nome no código | O quê | Pivô |
|---|---|---|---|
| 0 | `rails` | trecho de **dois trilhos verticais** de escadinha, sem degrau, afastados ~220 px, que **emendam em cima e embaixo** (vai num `tileSprite`) | centro |
| 1 | `rung` | **degrau-placa**: tábua larga com um miolo liso e vazio (a figura e a palavra entram por código), ~290 × 200 | centro |
| 2 | `rung-hollow` | **degrau vazado**: o mesmo contorno da 1, em traço tracejado, com o miolo aberto (só a borda) | centro |
| 3 | `lock` | cadeado fechado, gordinho, com carinha séria-fofa | centro |
| 4 | `guide-hand` | mãozinha no ângulo de `references/mao-toque-angulo.png`, só traço; `tipX`/`tipY` medidos depois | ponta do dedo |
| 5–7 | — | vazias | — |

Aqui não há cor nenhuma, só traço e papel. A escadinha certa e as erradas são
**as mesmas peças**.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn chibi doodle line art; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO colour fill and NO shading: the inside of every shape is the warm pale-lemon paper colour #FCF9C4; faces use only a flat soft oval cheek blush in dusty rose #E2C6C2; very few lines, lots of empty paper. Take ONLY the art style from the attached image: do NOT copy its character, framing or layout. A second attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 4.

Use case: stylized-concept
Asset type: exact ladder-pieces sprite sheet for a Phaser 3 educational game.
Primary request: create ONE exact 4 columns × 2 rows sprite sheet on a transparent 1280 × 640 px canvas. Every cell is exactly 320 × 320 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, except cell 0 which must touch the top and bottom cell edges. The inside of each silhouette is OPAQUE paper colour #FCF9C4; everything outside is genuinely transparent. No white keyline. No drawn grid, border or divider.

Exact cells, left to right and then top to bottom:
0. rails — two straight parallel vertical wooden ladder rails about 220 px apart, drawn as simple doodle planks with two or three tiny wood-grain strokes, NO rungs, perfectly vertical, touching the TOP and BOTTOM edges of the cell so the segment repeats seamlessly in a vertical tileSprite.
1. rung — one wide flat wooden plaque-step about 290 × 200 px, gently rounded corners, a thin inner border line, and a large completely EMPTY smooth centre (a picture and a word will be placed there by code).
2. rung-hollow — the EXACT same outline and size as cell 1 but drawn with a DASHED line and a completely open, empty centre, reading as a missing step.
3. lock — one plump closed padlock, front view, with a tiny serious-but-cute face (two dots and a small flat mouth).
4. guide-hand — one cute small chibi hand in the SAME line style, no fill colour other than paper: the index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT; the other three fingers fold into small descending steps on the RIGHT; the thumb folds inward; the short wrist descends toward the LOWER RIGHT. Exactly five digits. Crisp fingertip. No click lines, no sleeve, no face.
5. completely EMPTY and genuinely transparent reserved cell.
6. completely EMPTY and genuinely transparent reserved cell.
7. completely EMPTY and genuinely transparent reserved cell.

Consistency constraints: cells 1 and 2 register exactly in outer size and position; all pieces share the same line weight.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), characters, rungs in cell 0, pictures or marks inside the empty plaque, numbers on the steps, colour fills, wood colour, gold colour, cel shading, shadow tones, gradients, glossy rendering, hatching, white sticker keyline, pure black lines, grey lines, thick uniform vector outlines, click lines, radiating lines, extra fingers, missing fingers, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, speech bubbles, arrows, icons, question mark, objects in cells 5–7, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, ground, floor, shadow, 3D render, photorealism, blur, heavy noise.
~~~

## 6. Os quadros dos problemas — `problemas-1.png` a `-4.png`, grade 5 × 4, célula 256 × 256

Cada folha tem **dois problemas**: o primeiro nas linhas 1–2 (células 0–9), o
segundo nas linhas 3–4 (células 10–19). Célula que sobra fica vazia.
Os quadros são o **resultado**, só o objeto, sem mãos. Na tabela, *estado* é o
que aparece depois de um passo certo; *estrago* é a cena cômica da escadinha errada.

**`problemas-1.png`**

| Célula | id | Quadro | Uso |
|---|---|---|---|
| 0 | `wash-dirty` | pia com torneira fechada; duas mãozinhas manchadas de tinta azul | início (4 passos) |
| 1 | `wash-tap` | a mesma, torneira aberta com água caindo, mãos ainda sujas | estado; início (3 passos) |
| 2 | `wash-soapy` | mãos cheias de espuma, água caindo | estado |
| 3 | `wash-rinsed` | mãos limpas e molhadas, gotinhas | estado |
| 4 | `wash-dry` | mãos limpas e secas, com brilhinho; toalha pendurada | **objetivo** |
| 5 | `wash-fail-towel` | a toalha virou uma bola de espuma, bolhas voando | estrago (secar antes de enxaguar) |
| 6 | `wash-fail-nowater` | torneira fechada e seca, sabão grudado nas mãos | estrago (sem abrir a torneira) |
| 7–9 | — | vazias | |
| 10 | `bean-empty` | copinho vazio na janela | início |
| 11 | `bean-soil` | copinho com terra | estado |
| 12 | `bean-hole` | copinho com terra e um buraquinho | estado |
| 13 | `bean-seed` | feijão enterradinho, só a pontinha aparecendo | estado |
| 14 | `bean-watered` | terra molhada escura com o feijão plantado, gotinhas | estado |
| 15 | `bean-sprout` | um broto verde com duas folhinhas saindo do copinho | **objetivo** |
| 16 | `bean-fail-dry` | feijão seco em cima da terra molhada, água escorrida pelo lado | estrago (regar antes do feijão) |
| 17 | `bean-fail-nothing` | terra molhada, nada plantado, uma gotinha triste | estrago (sem feijão); estado da trocada |
| 18 | `bean-fail-washed` | a água leva o feijão para fora do copinho | estrago (sem buraquinho) |
| 19 | — | vazia | |

**`problemas-2.png`**

| Célula | id | Quadro | Uso |
|---|---|---|---|
| 0 | `tangram-pieces` | quadrado, triângulo e porta soltos na mesa | início |
| 1 | `tangram-square` | só o quadrado no lugar | estado |
| 2 | `tangram-roof` | quadrado com o triângulo em cima | estado |
| 3 | `tangram-house` | casinha pronta: quadrado, telhado e porta | **objetivo** |
| 4 | `tangram-fail-fell` | o triângulo tombado de lado, sem nada embaixo | estrago (triângulo primeiro) |
| 5–9 | — | vazias | |
| 10 | `hat-sheet` | uma folha lisa em branco | início |
| 11 | `hat-half` | a folha dobrada ao meio | estado |
| 12 | `hat-corners` | o triângulo das pontas dobradas | estado |
| 13 | `hat-done` | o chapéu de papel pronto | **objetivo** |
| 14 | `hat-fail-plane` | a folha virou um aviãozinho de papel e sai voando | estrago (cantos antes do meio) |
| 15–19 | — | vazias | |

**`problemas-3.png`** (anexar também a `crianca.png`: o personagem aparece pequenininho no mapa)

| Célula | id | Quadro | Uso |
|---|---|---|---|
| 0 | `grandma-home` | mapinha visto de cima e de lado: à esquerda a casa do personagem com portão; um rio no meio com uma pontezinha; à direita a padaria e a casa da vovó. O personagem pequenino na porta de casa | início |
| 1 | `grandma-gate` | o mesmo mapa, o personagem no portão | estado |
| 2 | `grandma-bridge` | o personagem em cima da ponte | estado |
| 3 | `grandma-door` | o personagem na porta da vovó, a padaria logo atrás, coraçãozinho | **objetivo** |
| 4 | `grandma-fail-splash` | o personagem com o pé no rio, *splash*, longe da ponte, olhos de susto | estrago (padaria antes da ponte) |
| 5–9 | — | vazias | |
| 10 | `shoes-bare` | um pezinho descalço | início |
| 11 | `shoes-sock` | o pé de meia | estado |
| 12 | `shoes-on` | o tênis calçado, cadarço solto | estado |
| 13 | `shoes-tied` | o tênis com laço bonito | **objetivo** |
| 14 | `shoes-nosock` | o tênis no pé descalço, cadarço solto | estado da trocada |
| 15 | `shoes-fail-over` | a meia esticada por cima do tênis | estrago (tênis antes da meia) |
| 16 | `shoes-fail-nolace` | pé de meia com um laço de cadarço flutuando no ar, sem tênis | estrago (sem tênis) |
| 17–19 | — | vazias | |

**`problemas-4.png`**

| Célula | id | Quadro | Uso |
|---|---|---|---|
| 0 | `paint-table` | mesa vazia com um potinho de tinta fechado e um pincel | início (N3) |
| 1 | `paint-paper` | a mesma, com uma folha em branco (um desenho de flor só em traço) | estado |
| 2 | `paint-open` | pote aberto | estado |
| 3 | `paint-dipped` | pincel molhado de tinta azul | estado |
| 4 | `paint-done` | a flor pintada de azul | **objetivo** |
| 5 | `paint-fail-lid` | o pincel amassado na tampa fechada, tampa quicando | estrago (molhar o pincel com o pote fechado) |
| 6 | `paint-fail-dry` | um risco apagadinho, falhado, pincel seco com cerdas arrepiadas | estrago (pintar sem molhar o pincel) |
| 7 | `paint-fail-blob` | **NOVO (22/10)**: o pincel encharcado pingando, um borrão azul enorme tapando a flor | estrago (molhar de novo em vez de pintar) |
| 8–9 | — | vazias | |
| 10 | `sandwich-plate` | prato vazio, pote de requeijão fechado | início (N2) |
| 11 | `sandwich-plate-open` | prato vazio, pote aberto | reserva |
| 12 | `sandwich-slice` | uma fatia de pão no prato, pote fechado | estado |
| 13 | `sandwich-slice-open` | fatia no prato, pote aberto | estado |
| 14 | `sandwich-spread` | fatia com requeijão passado | estado |
| 15 | `sandwich-done` | sanduíche fechado, bonito | **objetivo** |
| 16 | `sandwich-fail-outside` | sanduíche fechado com requeijão lambuzado por cima e escorrendo | reserva |
| 17 | `sandwich-fail-empty` | duas fatias fechadas sem nada, fininhas | estrago (fechar sem passar) |
| 18 | `sandwich-fail-lid` | a faquinha amassada contra a tampa fechada | estrago (passar com o pote fechado) |
| 19 | `sandwich-fail-toomuch` | **NOVO (22/10)**: uma montanha de requeijão branco transbordando da fatia e escorrendo pelo prato | estrago (passar de novo em vez de fechar) |

### Prompt copiável — `problemas-1.png`

~~~text
STYLE — USE THE ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn chibi doodle / emote-sketch line art; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO shading at all; the inside of every shape is the warm pale-lemon paper colour #FCF9C4; tiny cute emote faces are allowed on objects only where listed; very few lines, lots of empty paper. Take ONLY the art style from the attached image: do NOT copy its character, framing or layout.
CONTENT COLOUR EXCEPTION — only these materials get ONE flat pale pastel fill each, with no shading: water #A9D8F0; soap foam and bubbles #FFFFFF; soil #C9A27E; bean #B98B6B; sprout leaves #A8D59A; blue paint stains #8EC5F2. Everything else stays line on paper colour.

Use case: stylized-concept
Asset type: exact problem-state vignette sprite sheet for a Phaser 3 educational game; each vignette shows the RESULT after a step, like frames of a tiny animation.
Primary request: create ONE exact 5 columns × 4 rows sprite sheet on a transparent 1280 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each vignette is complete, isolated and centred in its own cell with at least 8% transparent margin; the inside of each vignette is OPAQUE paper colour #FCF9C4 (or the listed pastel) and the outside is genuinely transparent. No white keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. No hands of a person reaching in, except the child's own hands in cells 0–6.
FRAMING LOCK: cells 0–7 are frames of ONE scene (a small sink with a tap and two small child hands) with the IDENTICAL camera, size and position of sink, tap and hands; only the described change differs. Cells 10–19 are frames of ONE scene (one small cup on a windowsill ledge) with the IDENTICAL camera, size and position of the cup; only the described change differs.

Exact cells, left to right and then top to bottom:
0. small sink, tap CLOSED, two small child hands with blue paint stains.
1. same, tap OPEN with a stream of water, hands still stained.
2. same, water running, hands covered in white foam and bubbles.
3. same, hands clean and wet with a few water drops.
4. same, tap closed, hands clean and dry with two tiny sparkles, a small towel hanging beside.
5. same sink, the towel has turned into a big puffy ball of white foam, bubbles flying, hands still foamy — a funny mishap.
6. same sink, tap CLOSED and dry, white soap stuck on the hands, one tiny sweat drop — a funny mishap.
7. completely EMPTY and transparent.
8. completely EMPTY and transparent.
9. completely EMPTY and transparent.
10. one small empty cup.
11. the same cup filled with soil.
12. the same cup, soil with one small hole in the middle.
13. the same cup, one bean planted in the soil with only its tip showing.
14. the same cup, dark wet soil with the bean planted, a few water drops.
15. the same cup with one small green sprout with two round leaves and a tiny happy face.
16. the same cup, a dry bean lying ON TOP of wet soil, water spilled down the side of the cup — a funny mishap.
17. the same cup, wet soil with nothing planted, one small sad water drop.
18. the same cup, a splash of water carrying the bean over the rim and out of the cup — a funny mishap.
19. completely EMPTY and transparent.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), faces of people, adults, animals, background scenery, walls, floor, shadows, colours other than the listed pastels, cel shading, shadow tones, gradients, glossy rendering, screen tones, hatching, white sticker keyline, pure black lines, grey lines, thick uniform vector outlines, camera changes between frames of the same scene, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, speech bubbles, arrows, icons, check marks, crosses, question mark, objects in empty cells, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, 3D render, photorealism, blur, heavy noise.
~~~

### Prompt copiável — `problemas-2.png`

~~~text
STYLE — USE THE ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn chibi doodle / emote-sketch line art; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO shading at all; the inside of every shape is the warm pale-lemon paper colour #FCF9C4; tiny cute emote faces are allowed on objects only where listed; very few lines, lots of empty paper. Take ONLY the art style from the attached image: do NOT copy its character, framing or layout.
CONTENT COLOUR EXCEPTION — only these materials get ONE flat pale pastel fill each, with no shading: tangram square #F7D06B; tangram triangle #F4A3A3; tangram door #9CCFA0. The paper sheet and the paper hat stay paper colour. Everything else stays line on paper colour.

Use case: stylized-concept
Asset type: exact problem-state vignette sprite sheet for a Phaser 3 educational game; each vignette shows the RESULT after a step, like frames of a tiny animation.
Primary request: create ONE exact 5 columns × 4 rows sprite sheet on a transparent 1280 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each vignette is complete, isolated and centred in its own cell with at least 8% transparent margin; the inside of each vignette is OPAQUE paper colour #FCF9C4 (or the listed pastel) and the outside is genuinely transparent. No white keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. No hands.
FRAMING LOCK: cells 0–4 are frames of ONE scene (a small table top seen from the front) with the IDENTICAL camera and table position; only the pieces change. Cells 10–14 are frames of ONE scene (a sheet of paper centred) with the IDENTICAL camera; only the fold changes.

Exact cells, left to right and then top to bottom:
0. on the small table: one square piece, one triangle piece and one small rectangular door piece lying loose, apart.
1. only the square piece standing upright in the centre (the others gone).
2. the square with the triangle sitting on top as a roof.
3. the finished little house: square, triangle roof and the door on the front, with a tiny happy face in the door window.
4. the triangle alone tipped over on its side where the house should be, one tiny sweat drop — a funny mishap.
5. completely EMPTY and transparent.
6. completely EMPTY and transparent.
7. completely EMPTY and transparent.
8. completely EMPTY and transparent.
9. completely EMPTY and transparent.
10. one flat plain blank rectangular sheet of paper.
11. the same sheet folded in half.
12. the folded sheet with both top corners folded down into a triangle.
13. the finished folded paper hat, standing, with a tiny happy face.
14. the sheet folded into a paper airplane flying away with a few speed lines — a funny mishap.
15. completely EMPTY and transparent.
16. completely EMPTY and transparent.
17. completely EMPTY and transparent.
18. completely EMPTY and transparent.
19. completely EMPTY and transparent.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), people, hands, animals, background scenery, walls, floor, shadows, printed newspaper, writing on the paper, colours other than the listed pastels, cel shading, shadow tones, gradients, glossy rendering, screen tones, hatching, white sticker keyline, pure black lines, grey lines, thick uniform vector outlines, camera changes between frames of the same scene, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, speech bubbles, arrows, icons, check marks, crosses, question mark, objects in empty cells, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, 3D render, photorealism, blur, heavy noise.
~~~

### Prompt copiável — `problemas-3.png`

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn chibi doodle / emote-sketch line art; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO shading at all; the inside of every shape is the warm pale-lemon paper colour #FCF9C4; faces use only a flat soft oval cheek blush in dusty rose #E2C6C2; very few lines, lots of empty paper. Take ONLY the art style from the first attached image: do NOT copy its character, framing or layout.
CHARACTER — THE SECOND ATTACHED IMAGE (crianca.png) IS THE CHARACTER REFERENCE: the tiny child on the map in cells 0–4 is exactly this child, drawn very small.
CONTENT COLOUR EXCEPTION — only water and the river get ONE flat pale pastel fill #A9D8F0, with no shading. Everything else stays line on paper colour.

Use case: stylized-concept
Asset type: exact problem-state vignette sprite sheet for a Phaser 3 educational game; each vignette shows the RESULT after a step, like frames of a tiny animation.
Primary request: create ONE exact 5 columns × 4 rows sprite sheet on a transparent 1280 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each vignette is complete, isolated and centred in its own cell with at least 8% transparent margin; the inside of each vignette is OPAQUE paper colour #FCF9C4 (or the listed pastel) and the outside is genuinely transparent. No white keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.
FRAMING LOCK: cells 0–4 are frames of ONE tiny map (a rounded island-shaped vignette seen from a high three-quarter view): on the LEFT the child's small house with a garden gate; in the MIDDLE a river running from top to bottom with ONE small wooden bridge at the centre; on the RIGHT a tiny bakery with a bread drawing on the awning and grandma's small house with a heart on the door. Identical camera and layout in cells 0–4; only the tiny child moves. Cells 10–16 are frames of ONE scene (one small child's foot in side view, same position) with the IDENTICAL camera; only the sock, sneaker and lace change.

Exact cells, left to right and then top to bottom:
0. the map; the tiny child at the door of its own house.
1. the map; the tiny child at the garden gate.
2. the map; the tiny child standing on the bridge over the river.
3. the map; the tiny child at grandma's door, the bakery just behind, one small heart above.
4. the map; the tiny child stepping into the river far from the bridge, a big water splash, round startled eyes — a funny mishap.
5. completely EMPTY and transparent.
6. completely EMPTY and transparent.
7. completely EMPTY and transparent.
8. completely EMPTY and transparent.
9. completely EMPTY and transparent.
10. one small bare foot.
11. the same foot wearing a sock.
12. the same foot in a sneaker over the sock, laces loose.
13. the same sneaker with a neat lace bow and a tiny sparkle.
14. the same sneaker on the BARE foot (no sock visible at the ankle), laces loose.
15. the sock stretched OVER the outside of the sneaker, looking silly — a funny mishap.
16. the foot in a sock only, with a lace bow floating in the air above it and no sneaker — a funny mishap.
17. completely EMPTY and transparent.
18. completely EMPTY and transparent.
19. completely EMPTY and transparent.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), antenna hair, adults, grandma figure, animals, cars, roads with markings, extra bridges, bakery sign lettering, background outside the vignettes, shadows, colours other than the listed pastel, cel shading, shadow tones, gradients, glossy rendering, screen tones, hatching, white sticker keyline, pure black lines, grey lines, thick uniform vector outlines, camera changes between frames of the same scene, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, speech bubbles, arrows, icons, check marks, crosses, question mark, objects in empty cells, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, 3D render, photorealism, blur, heavy noise.
~~~

### Prompt copiável — `problemas-4.png`

~~~text
STYLE — USE THE ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn chibi doodle / emote-sketch line art; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO shading at all; the inside of every shape is the warm pale-lemon paper colour #FCF9C4; tiny cute emote faces are allowed on objects only where listed; very few lines, lots of empty paper. Take ONLY the art style from the attached image: do NOT copy its character, framing or layout.
CONTENT COLOUR EXCEPTION — only these materials get ONE flat pale pastel fill each, with no shading: blue paint #8EC5F2; bread #F2D59B; cream cheese #FFFFFF. Everything else stays line on paper colour.

Use case: stylized-concept
Asset type: exact problem-state vignette sprite sheet for a Phaser 3 educational game; each vignette shows the RESULT after a step, like frames of a tiny animation.
Primary request: create ONE exact 5 columns × 4 rows sprite sheet on a transparent 1280 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each vignette is complete, isolated and centred in its own cell with at least 8% transparent margin; the inside of each vignette is OPAQUE paper colour #FCF9C4 (or the listed pastel) and the outside is genuinely transparent. No white keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. No hands.
FRAMING LOCK: cells 0–7 are frames of ONE scene (a small table top with a paint jar on the right and a paintbrush) with the IDENTICAL camera and positions; only the described change differs. Cells 10–19 are frames of ONE scene (a small round plate in the centre and a round cream cheese jar on the right) with the IDENTICAL camera and positions; only the described change differs.

Exact cells, left to right and then top to bottom:
0. small table with a CLOSED paint jar and a clean paintbrush, no paper.
1. same, plus one sheet of paper with a simple flower drawn in line only.
2. same, the paint jar OPEN with blue paint inside.
3. same, the paintbrush tip wet with blue paint.
4. same, the flower on the paper painted blue, with a tiny sparkle.
5. same, the paintbrush squashed against the CLOSED jar lid, the lid bouncing, a tiny comic impact star — a funny mishap.
6. same, a faint patchy broken dry stroke on the paper and a dry brush with frizzy bristles — a funny mishap.
7. same, the paintbrush dripping wet with far too much blue paint and one huge blue paint blob covering the flower on the paper, a few drips — a funny mishap.
8. completely EMPTY and transparent.
9. completely EMPTY and transparent.
10. empty plate, cream cheese jar CLOSED.
11. empty plate, cream cheese jar OPEN.
12. one slice of bread on the plate, jar CLOSED.
13. one slice of bread on the plate, jar OPEN.
14. the slice spread with white cream cheese, jar open.
15. a finished closed sandwich on the plate with a tiny happy face.
16. a closed sandwich with white cream cheese smeared messily ON TOP and dripping down the sides — a funny mishap.
17. a closed sandwich that is thin and empty inside, the two slices flat together, one tiny sweat drop.
18. a rounded child's butter knife bent against the CLOSED jar lid, a tiny comic impact star — a funny mishap.
19. the slice of bread on the plate buried under a huge tall mountain of white cream cheese overflowing the slice and sliding onto the plate, jar open — a funny mishap.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), people, hands, animals, sharp knife, background scenery, walls, floor, shadows, colours other than the listed pastels, other paint colours, cel shading, shadow tones, gradients, glossy rendering, screen tones, hatching, white sticker keyline, pure black lines, grey lines, thick uniform vector outlines, camera changes between frames of the same scene, jar labels, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, speech bubbles, arrows, icons, check marks, crosses, question mark, objects in empty cells, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, 3D render, photorealism, blur, heavy noise.
~~~

**22/10/2026:** `problemas-4.png` é a única folha que falta para o N2 (sanduíche) e o N3 (pintar). Enquanto não chega, o jogo mostra caixas de reserva com o id do quadro.

## 7. `bg-papel.png` — 1280 × 720, opaco

| Região | O que tem |
|---|---|
| todo o fundo | papel amarelinho liso `#FCF9C4`, com 6–8 rabisquinhos (estrelinha, pontinhos, espiral) **só nas bordas** |
| HUD (y 0–90, fora da nuvem) | calmo |
| nuvem, centro (795, 105), 560 × 190 | nuvem de rabisco, miolo um tom mais claro `#FFFDE8` e **vazio** (o objetivo entra por código) |
| quadro, de (30, 110) a (310, 410) | moldura de rabisco, tipo quadrinho com cantos arredondados, miolo `#FFFDE8` **vazio** |
| chão | uma linha de rabisco de ponta a ponta em y ≈ 700, com 3 ou 4 tufinhos |
| escadinhas (x 340–1250, y 200–700) | **vazio e calmo**: só papel |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn doodle line art on warm pale-lemon paper; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO shading, no gradients; very few lines, lots of empty paper. Take ONLY the art style from the attached image: do NOT copy its character, faces, framing or layout. NO white keyline — this is a full background.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create one opaque 1280 × 720 px background of plain warm pale-lemon paper #FCF9C4, like the paper in the reference image. Preserve these exact functional regions: y 0–90 outside the cloud stays calm; draw ONE large hand-drawn doodle cloud centred at (795, 105), about 560 × 190 px, whose inside is a slightly lighter cream #FFFDE8 and COMPLETELY EMPTY; draw ONE hand-drawn doodle picture frame with rounded corners from (30, 110) to (310, 410), inside slightly lighter cream #FFFDE8 and COMPLETELY EMPTY; draw one wobbly doodle ground line across the whole width at about y 700 with three or four tiny grass tufts; the area x 340–1250, y 200–700 stays COMPLETELY EMPTY plain paper. Add only 6–8 tiny doodles (little stars, dots, a small spiral) near the outer edges of the canvas, away from every listed region.

Composition and technical constraints: exact 16:9 canvas; opaque; flat paper colour; all listed coordinates respected; the empty regions stay perfectly quiet so ladders and sprites stay readable.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), characters, faces, people, animals, ladders, stairs, steps, sinks, cups, objects inside the cloud or the frame, sun, moon, colour fills other than the paper and the lighter cream, paper texture noise, stains, shading, gradients, vignette, white keyline, pure black lines, grey lines, thick uniform vector outlines, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, 3D render, photorealism, blur, heavy noise.
~~~

## 8. `cover-subida-do-dia.png` — 1672 × 941, opaco

A capa: duas escadinhas lado a lado sobre o papel; numa, o personagem sobe
feliz rumo à nuvem com duas mãos limpas brilhando; na outra, um cadeado e uma
toalha virada espuma. Com o título `Subida do Dia` no alto. Anexar
`references/29-chibi-rabisco.jpg` e a `crianca.png`.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/29-chibi-rabisco.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: hand-drawn chibi doodle / emote-sketch line art on warm pale-lemon paper #FCF9C4; confident ink strokes in ONE dark maroon-brown colour #37161D, never pure black, with slight natural thickness variation and tapered ends like a brush pen; NO shading, no gradients; faces use only a flat soft oval cheek blush in dusty rose #E2C6C2; super simple emote-like faces; very few lines, lots of empty paper. Take ONLY the art style from the first attached image: do NOT copy its character, framing or layout. NO white keyline — this is a full cover.
CHARACTER — THE SECOND ATTACHED IMAGE (crianca.png) IS THE CHARACTER REFERENCE: the child on the cover is exactly this child.
CONTENT COLOUR EXCEPTION — only water and soap foam get a flat pale pastel (#A9D8F0 and #FFFFFF); the title may be colourful.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Subida do Dia”.
Primary request: create one opaque 1672 × 941 px cover illustration on pale-lemon paper. At the very top, horizontally centred, write the exact game title “Subida do Dia” in large chunky rounded playful letters, each letter filled with a soft pastel colour and outlined with a thick dark maroon-brown #37161D line, readable at thumbnail size. Spelling lock: render exactly three words, letter for letter and with capitalization exactly: S-u-b-i-d-a [space] d-o [space] D-i-a. No accent marks, extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, two simple doodle wooden ladders stand side by side, each with three plaque-steps carrying tiny line-drawn pictures (hands with foam, hands under water, hands on a towel). On the LEFT ladder a small closed padlock hangs and a towel has turned into a puffy ball of foam. On the RIGHT ladder the child is happily climbing near the top toward a big doodle cloud; inside the cloud, two clean hands with sparkles. At the bottom, a small doodle sink. Make "pick the right ladder of steps" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; main action large beneath it; complete child, both ladders and the cloud visible; opaque; no white keyline; no written interface beyond the requested title.

DO NOT INCLUDE: the character from the style reference (a girl with a shoulder-length bob haircut and one curled antenna hair strand), antenna hair, a second child, adults, animals, extra words, misspelled title, subtitle, punctuation, words or letters on the steps, numbers, labels, captions, watermark, logo, score, HUD, buttons, question mark, speech bubbles, arrows, colour fills on the child or the ladders, cel shading, shadow tones, gradients, glossy anime rendering, screen tones, hatching, white sticker keyline, pure black lines, grey lines, thick uniform vector outlines, 3D render, photorealism, blur, heavy noise, cropped title, cropped child, cropped ladders.
~~~

## 9. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades exatas: `crianca` 1152 × 768, `passos` 1536 × 1280, `pecas` 1280 × 640,
  `problemas-*` 1280 × 1024;
- o corte medido por colunas na folha inteira, sem figura cruzando célula;
- **o miolo opaco na cor do papel** em toda célula (sem buraco transparente
  dentro da silhueta) e nenhum fundo fora dela;
- traço `#37161D` (medir: se sair preto ou cinza, volta) e nenhuma cor fora da
  bochecha e da tabela de materiais;
- o personagem **sem o fio-antena** da referência, igual nas 6 poses e no mapinha;
- em cada problema, os quadros **sobrepostos** casam: pia, copinho, mesa, prato
  e pé no mesmo lugar em todas as células da mesma linha (medir o centro do objeto fixo);
- cada estrago bate com a tabela do §6 (se a toalha não virar espuma, volta);
- `rails` emendando sem costura; `rung` e `rung-hollow` do mesmo tamanho;
  o miolo do `rung` liso e vazio, medido de ponta a ponta;
- `tipX`/`tipY` do dedo medidos;
- a grafia do título da capa conferida letra a letra;
- o `MANIFEST.md` publicado com o pivô medido de cada célula.

## 10. Adições da mecânica N1 — 28/09/2026

Prompts finais usados para inserir os novos estragos e alinhar as figuras de
passo do feijão à xícara dos quadros. Em todos os casos, as folhas raw citadas
foram anexadas como referência de enquadramento, junto de
`references/29-chibi-rabisco.jpg`.

### `problemas-1.png` — células 7, 8 e 19

~~~text
Use case: precise-object-edit
Asset type: three replacement problem-state sprites for specific empty cells in problemas-1.png.
Input images: Image 1 is the current problemas-1.png framing reference. Match EXACTLY its sink camera and scale for the wash sprite and its handled cup camera, scale, handle position and baseline for both bean sprites. Image 2 is the chibi doodle style reference only; do not copy its character.

Create ONE exact 3 columns × 1 row transparent sprite strip. Each cell contains one complete isolated vignette, centred with margin, no grid or borders, nothing crossing cells.

Cell 0 — wash-fail-smear: the SAME small sink, tap, towel position and two child hands as the wash frames in Image 1. Tap OPEN with one flat pale-blue water stream #A9D8F0. Both hands are STILL visibly stained with flat blue paint #8EC5F2. The hanging towel has several obvious flat blue paint smears and a tiny disgusted face: squeezed eyes and a small wavy mouth. Keep the sink and hands in exactly the same framing as neighbouring wash frames.

Cell 1 — bean-fail-buried: the SAME handled cup as the bean frames in Image 1, same front camera, size, handle on the right and baseline. A huge rounded mountain of flat brown soil #C9A27E rises well above the rim, visibly overflowing and tumbling down both outer sides of the cup in small clumps. No bean visible anywhere. No water.

Cell 2 — bean-fail-pool: the SAME handled cup, same front camera, size, handle and baseline. The cup contains NO soil and is filled with flat pale-blue water #A9D8F0 all the way to the rim. One tiny simple rubber duck floats clearly on the water, drawn in line and pale-lemon paper fill only. One single blue droplet runs down the outside of the cup.

Style: confident tapered brush-pen line in dark maroon-brown #37161D; inside ordinary objects is opaque warm pale-lemon paper #FCF9C4. CONTENT COLOUR EXCEPTION only: water #A9D8F0, blue paint #8EC5F2, soil #C9A27E; flat fills only, no shading or gradients. Transparent outside each vignette.

DO NOT INCLUDE: text, letters, labels, numbers, captions, people, faces of people, style-reference girl, antenna hair, background, walls, floor, table, windowsill, shadows, white keyline, other colours, yellow duck fill, beans in cells 1 or 2, soil in cell 2, closed tap in cell 0, clean hands in cell 0, grid lines, cell borders, cropped edges, 3D render, photorealism.
~~~

### `problemas-3.png` — célula 5

~~~text
Use case: precise-object-edit
Asset type: one replacement problem-state sprite for problemas-3.png cell 5.
Input images: Image 1 is the current problemas-3.png framing reference. Reproduce EXACTLY the same rounded island-map vignette, high three-quarter camera, scale and layout used in cells 0–4: child's house and CLOSED garden gate on the LEFT, vertical pale-blue river through the MIDDLE with one bridge, bakery and grandma's house on the RIGHT. Image 2 is the chibi doodle style reference only; do not copy its girl.

Primary request: create ONE complete isolated map vignette on a transparent background. It is the same map and same framing as Image 1. The tiny child has tried to leave without opening the gate and is comically SQUASHED FLAT against the CLOSED gate directly in front of the child's house on the left. Show the tiny child's face pressed against the bars, compressed pose, startled eyes, and three small doodle stars circling above the head. The gate is visibly shut across the path. The child must match the tiny child already present in the map frames, with short choppy hair and no antenna strand.

Style: dark maroon-brown #37161D tapered doodle line, opaque pale-lemon #FCF9C4 inside the vignette. CONTENT COLOUR EXCEPTION: only the river/water is one flat pale pastel blue #A9D8F0. No shading, gradients or other colours. Transparent outside the rounded map vignette.

DO NOT INCLUDE: text, letters, words, captions, sound-effect lettering, open gate, child beyond the gate, extra child, adults, grandma figure, style-reference girl, antenna hair, extra bridge, cars, road markings, background outside map, shadow, white keyline, grid, border, cropped map, 3D render, photorealism.
~~~

### `passos.png` — células 4–7

~~~text
Use case: precise-object-edit
Asset type: four replacement step-picture sprites for passos.png cells 4, 5, 6 and 7.
Input images: Image 1 is the current passos.png reference; match the exact close-up action framing, object scale, hand style and line weight of its other step pictures. Image 2 is problemas-1.png; copy the SAME handled cup used in its bean frames: round pale-lemon cup, front view, handle on the RIGHT. Image 3 is the chibi doodle style reference only.

Create ONE exact 4 columns × 1 row transparent sprite strip. Each cell contains one complete close-up action, centred with equal scale and margin, no grid or borders. The SAME handled cup appears in all four cells at the same size, camera and position. It must be a cup with a clear right-side handle, NEVER a flowerpot or handleless pot.

Cells left to right:
0 / replacement cell 4, pôr terra: a small rounded hand trowel pours flat brown soil #C9A27E into the handled cup.
1 / replacement cell 5, buraquinho: one small round child finger presses a clear small hole into the soil inside the handled cup.
2 / replacement cell 6, pôr feijão: small round fingers release exactly ONE flat brown bean #B98B6B toward the soil in the handled cup.
3 / replacement cell 7, regar: a small watering can pours a short flat pale-blue water stream #A9D8F0 into the soil in the handled cup.

Style: dark maroon-brown #37161D tapered brush-pen line; hands, cup, trowel and watering can have opaque warm pale-lemon #FCF9C4 fill. CONTENT COLOUR EXCEPTION only: soil #C9A27E, bean #B98B6B, water #A9D8F0; flat fill, no shading or gradients. Transparent outside.

DO NOT INCLUDE: flowerpot, plant pot, handleless container, saucer, plant, sprout, extra bean, text, letters, labels, numbers, arrows, background, table, floor, shadows, white keyline, blue watering-can body, other colours, faces, people, style-reference girl, antenna hair, grid lines, borders, cropped objects or cell overflow.
~~~
