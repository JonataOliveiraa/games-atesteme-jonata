# Pescaria dos Códigos — texturas

Destino: `src/assets/games/EF01CO05/pescaria-dos-codigos/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 código e fila,
§13 textura × código).

A linha de arte é a **chibi de figurinha**, a mesma do Balão do Recado, com a
referência `references/19-chibi-figurinhas.jpg` **anexada em toda geração**. Se
vier uma imagem de estilo própria (*Dúvida 5*), troque o bloco `STYLE` e a
tabela. As grades e as células não mudam. Cada prompt vem inteiro (estilo +
corpo + negativo), pronto para copiar.

> **O elenco da referência entra no negativo.** Da folha de figurinhas sai só a
> técnica, nunca as personagens dela.

### Tabela de estilo — chibi de figurinha

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Traço | limpo, nítido, uniforme, em azul-marinho dessaturado; nunca preto puro | vetor de conto (contorno no tom da cor) e desenho de criança (caneta trêmula) |
| Cor | paleta curta, chapada, **um** tom de sombra, nenhum degradê | vetor de conto (degradê macio) e chibi de rabisco (sem cor) |
| Olho | grande e brilhante, com um brilho forte | desenho de criança (pontinho) |
| Silhueta | peça com alfa ganha **keyline branca fina**; cena inteira (fundo, capa) não ganha | vetor de conto e graphic novel (sem keyline) |
| Proporção | chibi: cabeça grande, corpo pequeno; objetos simples e legíveis no tamanho do jogo | graphic novel (quase natural) |

**A regra de cor deste jogo:** **vermelho, azul e amarelo são o código.** Nada
na arte pode usar essas três cores com força: nem o peixe, nem o barco, nem a
vela, nem o balde. A paleta da arte é **verde-água, lilás, creme, areia,
madeira clara, coral-claro e verde-folha**. A cor do código só entra pelo
`tint` da mancha, no código.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-lago.png` | — | — | 1280 × 720 | opaco | céu, margem, lago visto de lado e píer |
| `barco.png` | 3 × 2 | 512 × 512 | 1536 × 1024 | sim | barco com a vela lisa e a criança: 5 poses + 1 livre |
| `peixes.png` | 3 × 2 | 384 × 384 | 1152 × 768 | sim | o peixe com a mancha branca: 5 poses + peixe d'ouro |
| `pecas.png` | 4 × 3 | 320 × 320 | 1280 × 960 | sim | quadro, tambor, mancha, anzol, balde, 3 figuras, chocalho, gota, dedo, 1 livre |
| `cover-pescaria-dos-codigos.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`,
`data/codes.ts`). Se trocar uma célula, avise o Ferro e a Brasa.

**O insubstituível:** o **peixe com a mancha branca vazia** (`peixes` 0–4), o
**tambor** e a **mancha** (`pecas` 1 e 2) e a **vela lisa** do barco. A mancha
recebe a cor do código, e o tambor é a pista. Sem eles não há código para
traduzir.

**Opcional para o N1:** `peixes` 5 (peixe d'ouro) e `pecas` 5–9 (as figuras, o
chocalho e a gota, usados no N2/N3). Estão nas folhas porque célula a mais não
custa outra geração.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. A legenda e as fichas são do
  jogo.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha.
- **Sem vermelho, azul ou amarelo fortes** em arte nenhuma (veja a regra de cor
  acima). A água é **verde-água**, não azul.
- **A mancha do peixe é BRANCA pura e lisa**, um círculo grande na lateral da
  barriga, com o mesmo contorno do resto. O código a pinta de vermelho, azul ou
  amarelo com `tint`, e o contorno escuro continua escuro.
- **A vela do barco é lisa e creme-clara**, sem listra e sem desenho, porque a
  legenda é escrita nela.
- **O quadro-pista é liso por dentro**: o código põe os tambores ali.
- Todos os peixes olham e nadam para a **DIREITA**. O barco e a criança também
  olham para a **direita**, onde a vara aponta para a água.

## 3. `bg-lago.png` — 1280 × 720, opaco

| Região | O que tem |
|---|---|
| y 0–110 | céu calmo e liso (HUD) |
| y 110–400 | céu com poucas nuvens fofas, e uma margem baixa de morrinhos verdes e árvores redondas **no fundo**, só **fora** de x 150–900, com a linha da margem em y ≈ 360–400. **Entre x 150 e x 900 nada sobe acima de y 330**, porque é onde ficam a vela, o mastro e o quadro |
| **píer**, x 1030–1280, tampo y 388–410 | um píer de madeira clara entrando no lago pela direita, com estacas descendo na água; o tampo em y ≈ 388, **vazio** (o balde entra por código) |
| linha d'água | y = 400, reta, com uma ondinha suave |
| y 400–720 | o lago **por dentro**, visto de lado: verde-água claro em cima escurecendo em faixas chapadas para baixo; algumas plantinhas e pedrinhas **só no fundo** (y 680–720) |
| faixa dos peixes, y 480–690 | **lisa e calma**, sem planta, pedra, bolha ou peixe |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 fishing game for Brazilian children aged 6–7.
Primary request: create one opaque 1280 × 720 px side-view cross-section of a calm, cute lake. Preserve these exact functional regions: y 0–110 is a calm plain sky; from y 110 to 400, a soft sky with a few fluffy clouds and, far in the background, a low shore of gentle green hills and round trees ONLY at the left edge (x 0–150) and on the right (x 900–1280), whose shoreline sits around y 360–400 — between x 150 and x 900 there are NO hills and NOTHING rises above y 330, only open sky down to the water; on the right, a light-wood pier enters the lake from the right edge, spanning x 1030–1280, its plank top at about y 388 (plank from y 388 to 410) and completely EMPTY, standing on a few wooden posts that go down into the water; the water surface is a straight line at y = 400 with one gentle ripple; below it, from y 400 to 720, the inside of the lake seen from the side, in flat bands of light aqua-green getting deeper aqua-green toward the bottom; a few simple water plants and pebbles ONLY along the very bottom, y 680–720; the band y 480–690 is completely calm and empty.

Palette rule: aqua-green water (NOT blue), soft sky, leaf-green hills, light wood, cream and lilac accents. No strong red, no strong blue and no strong yellow anywhere, because those three colours are reserved for the game's code.

Composition and technical constraints: exact 16:9 canvas; straight-on side view; flat water line at y = 400; all listed coordinates respected; opaque; no white sticker keyline; no embedded user interface.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, boats, fishing rods, fish, animals, birds, ducks, frogs, bubbles, buckets on the pier, objects on the pier, a sun with a face, strong red, strong blue, strong yellow, blue water, text, letters, words, labels, digits, numbers, signs, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, plants or rocks in the middle of the water, tall trees in the centre, perspective view, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 4. `barco.png` — grade 3 × 2, célula 512 × 512

Um barquinho de madeira clara, redondinho, com **um mastro** um pouco à direita
do meio e **uma vela grande, lisa e creme-clara** à **esquerda** do mastro. A
vela é quase quadrada, com **~260 × 270 px** na célula, porque a legenda do
código é escrita nela. Na **proa (direita)** fica uma **criança chibi**
sentada, de cabelo castanho-claro curto e chapéu de pescador verde-água,
segurando uma **vara de pesca** que aponta para a direita e para baixo, sobre
a água.

No jogo, a célula entra em **x 320, com a linha d'água em y 400, escala 0,8**
(origem no centro de x e na linha d'água). Local → mundo:
`x = 320 + (lx − 256) · 0,8`, `y = 400 + (ly − 440) · 0,8`.

**Quatro medidas são iguais nas 6 células** e são contrato com o código
(`data/layout.ts`):
- a **linha d'água** do casco em y = 440 local;
- a **vela** ocupando local **x ~43–303, y ~100–370** (é o `SAIL` do mundo,
  x 150–358, y 128–344), lisa até a borda;
- o **mastro à DIREITA da vela**, em local x ~321, com a ponta em local
  y ~75;
- a **ponta da vara** em ~(471, 203) local (é o `ROD_TIP` do mundo, 492, 210).

O código desenha a linha de pesca a partir da ponta da vara. **Não desenhe
linha nem anzol.** O quadro-pista **não** sai do mastro: ele fica pendurado
por cordas que descem do alto da tela, à direita do barco.

| Célula | Nome no código | Pose |
|---|---|---|
| 0 | `boat-idle` | segurando a vara com as duas mãos, olhando para a água, sorriso calmo |
| 1 | `boat-cast` | inclinada para a frente, olhos atentos, como quem acabou de jogar o anzol |
| 2 | `boat-reel` | uma mão girando o molinete, a vara envergada, carinha de esforço fofo |
| 3 | `boat-cheer` | um braço para cima (a outra mão na vara), olhos felizes, brilhinhos |
| 4 | `boat-oops` | "ih!": mão na bochecha, boca em "o", uma gotinha de suor; **sem choro** |
| 5 | — | vazia (transparente) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions, big head and little body; tiny cartoon emotion marks only where asked; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact character-in-boat sprite sheet for a Phaser 3 fishing game for Brazilian children aged 6–7.
Primary request: create ONE exact 3 columns × 2 rows sprite sheet on a transparent 1536 × 1024 px canvas. Every cell is exactly 512 × 512 px. Each drawing is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

The subject in cells 0–4: one cute small rounded rowing boat of light honey wood, seen from the side, facing RIGHT; its hull waterline is a straight line at local y = 440 (nothing is drawn below the hull). One wooden mast stands a little to the right of the middle, at local x ≈ 321, with its top at about local (321, 75). One LARGE, almost square, PLAIN light-cream sail hangs to the LEFT of the mast, filling the box from local x ≈ 43 to 303 and y ≈ 100 to 370 (about 260 × 270 px), completely flat and EMPTY — no stripes, no patches, no pattern, no symbol — because the game writes on it. At the bow (right), one chibi child sits holding a simple fishing rod: short light-brown hair, an aqua-green bucket fishing hat, a lilac T-shirt. The rod points to the RIGHT and slightly down over the water, with its tip at about local (471, 203) in EVERY cell. There is NO fishing line and NO hook — the rod simply ends at its tip. A small round reel sits on the rod near the child's hands.

Exact cells, left to right and then top to bottom:
0. boat-idle — holding the rod with both hands, looking down at the water to the right, calm smile.
1. boat-cast — leaning slightly forward, eyes focused and eager, as if the hook has just been dropped.
2. boat-reel — one hand turning the reel, the rod slightly bent, cute effortful face.
3. boat-cheer — one arm raised high, the other hand still on the rod, happy closed eyes, a few tiny sparkle marks.
4. boat-oops — one hand on the cheek, mouth a small round "o", one small sweat drop; surprised, NOT crying, NOT sad.
5. completely EMPTY and genuinely transparent reserved cell.

Consistency constraints: cells 0–4 show the IDENTICAL boat, mast, sail and child with the same proportions, colours and scale; only the child's arms and expression (and the slight rod bend in cell 2) change; waterline at local y = 440, sail box at local x 43–303 / y 100–370, rod tip near local (471, 203) and mast top near local (321, 75) in all five cells.

Palette rule: light wood, cream sail, aqua-green, lilac, leaf green, soft coral skin tones. No strong red, no strong blue and no strong yellow anywhere.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a second person, animals, fish, fishing line, hook, bait, bucket, oars, flags, pennants, a board or sign hanging from the mast, anything drawn on the sail, stripes on the sail, water, waves, splash, reflection, ground, shadow, background, strong red, strong blue, strong yellow, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, facing left, object in cell 5, crying, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, angry faces.
~~~

## 5. `peixes.png` — grade 3 × 2, célula 384 × 384

**Um peixe só**, repetido em todas as poses: redondinho, **prata-lilás** com
nadadeiras **verde-água**, olhos grandes, bochechinha. Na lateral da barriga
fica **uma mancha BRANCA pura, redonda, grande (~90 px), lisa**, com o mesmo
contorno. É ela que o código pinta com a cor do código. O corpo tem **~260 ×
170 px** na pose nadando e olha para a **DIREITA**.

**A mancha é contrato:** o centro dela é medido em cada pose e vai para o
`MANIFEST.md`. Nas poses 0 e 1, fica em ~(180, 200).

| Célula | Nome no código | Pose |
|---|---|---|
| 0 | `fish-swim-a` | nadando para a direita, cauda para cima, boquinha fechada |
| 1 | `fish-swim-b` | igual, cauda para baixo (o código alterna A/B) |
| 2 | `fish-hooked` | na vertical, **boca para cima** (onde o anzol pega), olhos arregalados de surpresa fofa |
| 3 | `fish-happy` | curvado em arco, como quem pula, olhos felizes, brilhinhos |
| 4 | `fish-yuck` | na vertical, boca para cima, **careta engraçada**: olhos apertados e língua de fora; **sem choro, sem raiva** |
| 5 | `fish-gold` | o **peixe d'ouro** do N3: o mesmo corpo **dourado-âmbar**, com uma coroinha e brilhos, nadando para a direita, **sem mancha** |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; tiny cartoon emotion marks only where asked; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact fish pose sprite sheet for a Phaser 3 fishing game about codes; the game tints one white patch on the fish with a code colour.
Primary request: create ONE exact 3 columns × 2 rows sprite sheet on a transparent 1152 × 768 px canvas. Every cell is exactly 384 × 384 px. Each fish is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

The fish in cells 0–4: ONE cute chubby round fish, about 260 × 170 px when swimming, silver-lilac body with aqua-green fins and tail, big glossy eyes, small soft cheek. On the side of its belly there is ONE large ROUND patch of PURE FLAT WHITE, about 90 px across, with the same dark outline as the body and absolutely nothing inside it — the game will colour it. In cells 0 and 1 the patch centre is at about local (180, 200). The fish faces RIGHT.

Exact cells, left to right and then top to bottom:
0. fish-swim-a — swimming to the right, tail flicked UP, mouth closed, calm cute face.
1. fish-swim-b — identical, tail flicked DOWN.
2. fish-hooked — the fish vertical with its MOUTH POINTING UP (where a hook would hold it), eyes wide in cute surprise; the white patch still clearly visible on its side.
3. fish-happy — the body curved in a jumping arc, happy closed eyes, a few tiny sparkle marks; the white patch visible.
4. fish-yuck — vertical, mouth pointing up, a funny grimace: squeezed eyes and tongue sticking out; silly, NOT crying and NOT angry; the white patch visible.
5. fish-gold — the SAME fish body in shiny golden-amber with a tiny crown and a few sparkles, swimming to the right, and NO white patch.

Consistency constraints: cells 0–4 are the IDENTICAL fish with the same proportions, colours, face and patch size; only pose and expression change; the white patch is always a clean circle of pure white, fully visible and never covered by a fin.

Palette rule: silver-lilac, aqua-green, cream, soft pink cheeks; the golden fish is amber-gold. No strong red, no strong blue and no strong yellow on cells 0–4, and nothing coloured inside the white patch.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, colour inside the white patch, a patch in cell 5, symbols, dots, stripes or spots on the body, hooks, fishing line, bubbles, water, splash, other sea creatures, strong red, strong blue, strong yellow on cells 0–4, sharp teeth, scary fish, crying, angry faces, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, facing left, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 6. `pecas.png` — grade 4 × 3, célula 320 × 320

| Célula | Nome no código | O quê | Observação |
|---|---|---|---|
| 0 | `board` | quadro-pista: uma lousinha de moldura de madeira clara, deitada (~280 × 190), com duas argolas em cima para a corda; o **miolo verde-escuro liso e vazio** | o código põe os tambores e o `=`/`≠` aqui |
| 1 | `drum` | um **tamborzinho** de lado, lilás com aro de madeira, com **uma baqueta batendo** no couro e 2 risquinhos de som. Ele diz "batida" | a pista (1 a 3 cópias) e a legenda |
| 2 | `mark` | a **mancha**: um círculo **branco puro** e liso, com o contorno escuro | ganha `tint` vermelho, azul ou amarelo |
| 3 | `hook` | anzol prateado fofo, com uma argolinha no alto, **sem isca** | a ponta da linha |
| 4 | `bucket` | balde de madeira clara com aro verde-água, cheio de água até perto da borda, visto de lado | o código o corta em trás/frente para o peixe entrar |
| 5 | `fig-sun` | um sol simples, redondo, **sem rosto** | N2 (a cor dele vem do desenho: laranja-dourado) |
| 6 | `fig-fish` | um peixinho simples de ícone, de lado | N2 |
| 7 | `fig-banana` | uma banana simples | N2 |
| 8 | `rattle` | um chocalho de criança | N3 (ícone de som) |
| 9 | `drop` | uma gota d'água grande, verde-água clara | o splash (partículas) |
| 10 | `guide-hand` | mãozinha chibi no ângulo de `references/mao-toque-angulo.png` | `tipX`/`tipY` medidos no MANIFEST |
| 11 | — | vazia | — |

As figuras do N2 (5–7) **vão ser as respostas** do N2, então têm o mesmo
tamanho e o mesmo peso, e nenhuma é mais bonita que as outras.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. The second attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 10.

Use case: stylized-concept
Asset type: exact game-pieces sprite sheet for a Phaser 3 fishing game about codes (drum beats, colours, pictures).
Primary request: create ONE exact 4 columns × 3 rows sprite sheet on a transparent 1280 × 960 px canvas. Every cell is exactly 320 × 320 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

Exact cells, left to right and then top to bottom:
0. board — one small landscape chalkboard about 280 × 190 px with a light-wood frame and two small metal rings on its top edge; its inside is a PLAIN, FLAT, completely EMPTY dark-green surface with nothing on it.
1. drum — one small cute drum seen from the side, lilac body with light-wood hoops, one wooden drumstick striking the drumhead, and two tiny short sound ticks above the hit; it must clearly read as "one drum beat" at 48 px.
2. mark — one clean circle of PURE FLAT WHITE, about 220 px across, with the same dark outline and nothing inside; no shading, no highlight.
3. hook — one cute silver fishing hook with a small ring at its top, no bait, no line.
4. bucket — one light-wood bucket with aqua-green metal hoops, seen from the side, filled with light aqua-green water up near its rim; empty of fish.
5. fig-sun — one simple round sun with short rounded rays, warm orange-gold, NO face.
6. fig-fish — one simple icon-like little fish seen from the side, soft coral-orange, no face details beyond one dot eye.
7. fig-banana — one simple banana, soft golden, one small brown tip.
8. rattle — one child's baby rattle with a round head and a short handle, lilac and cream.
9. drop — one big single water drop, light aqua-green with one highlight.
10. guide-hand — use references/mao-toque-angulo.png ONLY as the angle and silhouette reference. Create one cute light-brown childlike chibi hand with the same dark uniform outline, one-tone flat cel shading and white sticker keyline as the other cells. The index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT; its tip is crisp and clearly the touch point. The other THREE fingers fold into distinct descending steps on the RIGHT; the THUMB folds inward across the palm; the short bare wrist descends toward the LOWER RIGHT. Exactly five digits. No click lines, no face, no sleeve.
11. completely EMPTY and genuinely transparent reserved cell.

Consistency constraints: cells 5, 6 and 7 are future answers — same size, same visual weight, equally cute, none more detailed than the others.

Palette rule: light wood, lilac, cream, aqua-green, dark board green. Only cells 5–7 may use their own warm colours, softly. No strong red, strong blue or strong yellow anywhere, and nothing inside the white circle of cell 2.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, anything drawn inside the board, chalk marks, numbers on the board, colour inside the white circle, a face on the sun, a face on any object, fish inside the bucket, bait on the hook, fishing line, more than one drum, extra objects, extra hands, extra fingers, missing fingers, click lines, radiating lines, strong red, strong blue, strong yellow, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, arrows, icons, HUD, question mark, object in cell 11, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, crying, angry faces, pointing at the viewer.
~~~

## 7. `cover-pescaria-dos-codigos.png` — 1672 × 941, opaco

Na capa, a criança do barco puxa um peixe com a mancha **azul**. Pendurado por
cordas que descem do alto, ao lado do barco, o quadro mostra **dois tambores**. Embaixo, na água, nadam peixes com
manchas vermelha, azul e amarela. Em cima vai o título
`Pescaria dos Códigos`. Anexe a referência `19` e as `barco.png` e
`peixes.png` aprovadas.

Na capa, **as três cores do código aparecem de propósito**. É a única imagem
em que elas ficam pintadas na arte.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover, not a sticker.
CHARACTERS — THE SECOND ATTACHED IMAGE (barco.png) IS THE BOAT AND CHILD REFERENCE, AND THE THIRD (peixes.png) IS THE FISH REFERENCE: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Pescaria dos Códigos”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Pescaria dos Códigos” in large chunky rounded playful multicolour letters with a thick dark outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly three words, letter for letter, with capitalization and the accent exactly: P-e-s-c-a-r-i-a [space] d-o-s [space] C-ó-d-i-g-o-s. The “ó” in “Códigos” MUST carry its acute accent. No extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, a calm aqua-green lake seen half above and half below the water line: the cute light-wood boat with its plain cream sail floats on the surface, and the chibi child in the aqua-green bucket hat happily reels up one round silver-lilac fish whose round belly patch is BLUE; beside the boat, a small chalkboard hangs on two ropes coming down from the top of the picture (NOT from the mast), showing TWO small drum pictures and nothing else; under the water, a row of the same round fish swims to the right, their belly patches clearly RED, BLUE and YELLOW. Make "match the drum beats to the right colour fish" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; boat, child, board and fish row large beneath it and fully visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, other people, other animals, sharks, scary fish, extra words, misspelled title, missing accent, subtitle, punctuation, numbers on the board, letters on the board, drawings on the sail, captions, signs with writing, watermark, logo, score, HUD, buttons, question mark, speech bubbles, arrows, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped boat, cropped fish, sad faces, crying, angry faces.
~~~

## 8. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades exatas: `barco` 1536 × 1024, `peixes` 1152 × 768, `pecas` 1280 × 960;
  o corte medido por colunas na folha inteira, sem peça cruzando célula;
- **nenhum vermelho, azul ou amarelo forte** no fundo, no barco, no peixe, no
  quadro ou no balde (medir a saturação das áreas grandes). A água é verde-água;
- a **mancha branca** do peixe: branca pura, lisa, redonda e inteira nas poses
  0–4, **centro medido por pose** no MANIFEST; testar o `tint` nas 3 cores
  (vermelho, azul, amarelo) e conferir se o contorno continua escuro;
- a **vela lisa** e o **miolo do quadro liso**; a caixa útil da vela medida
  (para caber `🥁🥁🥁 → ●`);
- no barco, a linha d'água em y = 440, a vela em local x 43–303 / y 100–370,
  o mastro à direita da vela (x ~321, topo y ~75) e a ponta da vara em
  ~(471, 203) **iguais nas 5 poses** (medir e registrar); nenhuma linha ou
  anzol desenhado;
- o peixe olhando para a **direita**; a boca para cima nas poses 2 e 4;
- o **tambor** lendo como "batida" a 48 px;
- no `bg-lago`, a faixa dos peixes (y 480–690) lisa, a linha d'água em y 400,
  nenhum morro entre x 150 e 900 acima de y 330 e o tampo do píer (y ~388)
  vazio;
- `tipX`/`tipY` do dedo medidos;
- a grafia do título da capa conferida letra a letra, **com o acento de
  "Códigos"**.
