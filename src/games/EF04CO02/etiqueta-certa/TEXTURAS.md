# Etiqueta Certa — texturas

Destino: `src/assets/games/EF04CO02/etiqueta-certa/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 fácil e claro, §6 tela, §7 etiqueta).

**Versão de trens (13/10/2026).** As folhas da esteira (`bg-galpao`, `esteira`, `caminhoes`, `pacotes`) saíram e nunca foram geradas.

**Com imagem de referência:** anexe em **toda geração** a `references/35-chibi-voador.webp` (os quatro meninos chibi voando entre nuvens, com slimes e arco-íris).
- Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*.
- O elenco da referência vai no negativo de todos os prompts.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-patio.png` | — | — | 1672 × 941 (escalado para 1280 × 720) | opaco | o chão do pátio de cargas, livre (o código desenha os trilhos) |
| `trilhos.png` | 4 × 2 | 256 | 1024 × 512 | sim | dormente, base da alavanca, cabo, sinal vermelho, sinal verde, botão, estrela, fumaça |
| `trens.png` | 4 × 2 | 320 | 1280 × 640 | sim | 3 locomotivas, vagão-plataforma, 4 caixotes |
| `galpoes.png` | 2 × 1 | 400 | 800 × 400 | sim | galpão de porta aberta, galpão de porta fechada |
| `ui.png` | 2 × 2 | 640 × 480 | 1280 × 960 | sim | etiqueta grande, placa da regra, recado, plaquinha |
| `cover-etiqueta-certa.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Os nomes dos campos, os valores, as cidades, a frase da placa e o "PARTIR" são escritos pelo código. A única exceção é o título da capa.
- **Nada de cor por campo e nada de ícone por cidade.** Os dois galpões são iguais, e as locomotivas mudam só de cor.
- **Os caixotes não mostram para onde vão:** todos têm a mesma fita e o mesmo adesivo branco em branco.
- **A vista é de cima, reta (top-down)**, igual em todas as folhas, porque o código **gira** o trem nas curvas. A locomotiva e o vagão apontam para a **DIREITA**.
- Peça solta e centrada na célula, com cerca de 8 % de margem.

---

## 3. `bg-patio.png` — 1672 × 941, opaco

O chão do pátio de cargas visto de cima. O código desenha por cima os trilhos, os galpões, o trem, a alavanca e os quadros, então **o chão tem de ficar calmo e vazio**.

| Região (na escala 1280 × 720) | O que tem |
|---|---|
| quase tudo | **chão de terra batida clara e cascalho fino**, liso e quente, com manchas suaves de grama baixa |
| faixa y 540–640, de x 0 a 1060 | chão liso (o trilho principal passa ali) |
| x 700–1060, y 260–620 | chão liso (a curva do trilho de cima) |
| x 60–540, y 100–430 | chão liso (o quadro da etiqueta fica por cima) |
| bordas | uma cerquinha baixa de madeira no alto, umas touceiras de flores e um poste de luz no canto de baixo à esquerda |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque: the GROUND of a cute, cozy freight train yard seen STRAIGHT FROM ABOVE (top-down view, no perspective). Almost the whole picture is calm, smooth, light warm packed dirt with fine pale gravel, with a few soft patches of short mint grass. Along the top edge, a low cute wooden fence. A few small flower tufts near the edges, and a cute lamp post seen from above in the bottom-left corner. The middle of the picture and a wide horizontal band across the lower part stay completely EMPTY and smooth (game pieces will be placed there). Bright, friendly morning mood, soft sunlight.

DO NOT INCLUDE: railway tracks, rails, sleepers, trains, wagons, buildings, sheds, roofs, platforms, roads, cars, people, characters, animals, boxes, crates, text, letters, numbers, signs with words, logos, brand marks, arrows on the ground, strong perspective, side view, 3D render look, night, scary or dark elements, red danger colors, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `trilhos.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Direção / uso |
|---|---|---|
| 0 | **dormente**: uma tábua de madeira só, comprida e estreita | **em pé** (o comprido na vertical): o código carimba os dormentes ao longo do trilho, atravessados |
| 1 | **base da alavanca**: caixinha de metal baixa e arredondada, vista de cima e um pouco de frente, com um furo no meio em cima | o código põe o cabo saindo dela |
| 2 | **cabo da alavanca**: haste de metal com uma bola vermelha na ponta | **em pé**, com a bola no alto: o código gira o cabo pela ponta de baixo |
| 3 | **sinal de trem** num poste baixo, com a luz de cima **vermelha acesa** e a de baixo apagada | sinal fechado |
| 4 | o mesmo sinal, com a luz de cima apagada e a de baixo **verde acesa** | sinal aberto |
| 5 | **botão grande** largo (≈ 3 : 1), verde, arredondado e fofo, **em branco** | o PARTIR; o código escreve a palavra |
| 6 | **estrela** dourada | acerto, confete |
| 7 | **fumacinha**: três nuvenzinhas brancas | a locomotiva soltando vapor |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Cute, chunky toy-like railway parts for a children's train yard game, each centered in its cell with about 8% margin, no ground, no shadow.
1. ONE wooden railway SLEEPER (tie) seen from above: a single long narrow warm-brown wooden plank standing VERTICALLY (long side up and down), with soft wood grain.
2. The BASE of a railway switch lever: a small, low, rounded metal box in soft lilac-grey, seen from above and slightly from the front, with a slot on top.
3. The HANDLE of the lever: a straight metal rod standing VERTICALLY, with a shiny round red knob on the TOP end; the bottom end is plain (it will sit in the base).
4. A cute short railway SIGNAL post with two round lights stacked: the TOP light glowing RED, the bottom light off (dark).
5. The SAME signal post: the top light off (dark), the BOTTOM light glowing GREEN.
6. A big, wide, rounded, puffy GREEN push BUTTON (about 3:1), seen from the front, with a soft highlight, its face completely BLANK.
7. A golden cute STAR with a soft shine.
8. A small puff of STEAM: three soft round white clouds.

DO NOT INCLUDE: text, letters, numbers, words on the button, symbols, arrows, icons, rails, whole tracks, trains, people, hands, backgrounds behind the items, ground, shadows on the ground, items crossing cell borders, items cut by the cell edge, different scales that make the parts unrecognizable, red danger colors (except the red knob and the red signal light), the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `trens.png` — 4 × 2 células de 320 (1280 × 640), alfa

Tudo **visto de cima, reto (top-down)**, apontando para a **DIREITA**, porque o código gira as peças nas curvas.

| Célula | Peça |
|---|---|
| 0 | **locomotiva coral**: baixinha e redonda, de brinquedo, a cabine atrás e a chaminé na frente (à direita) |
| 1 | a mesma locomotiva, **azul-céu** |
| 2 | a mesma locomotiva, **verde-menta** |
| 3 | **vagão-plataforma**: um piso de madeira com bordas de metal, **vazio** em cima, do mesmo comprimento da locomotiva |
| 4 | **caixote** de madeira clara **quadrado**, visto de cima, com a mesma fita bege e um **adesivo branco em branco** |
| 5 | caixote **largo e baixo**, mesma fita, mesmo adesivo |
| 6 | caixote **comprido**, mesma fita, mesmo adesivo |
| 7 | caixote **pequeno**, mesma fita, mesmo adesivo |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. Cute, rounded, toy-like freight train pieces seen STRAIGHT FROM ABOVE (top-down view, like a toy on a table seen from the ceiling), every vehicle pointing to the RIGHT (its front on the right side), centered, no ground, no shadow.
1. A small chubby toy LOCOMOTIVE in CORAL, seen from directly above, front pointing RIGHT: the round boiler with a little chimney at the front (right), the cab roof at the back (left), about 80% of the cell wide and 40% tall.
2. The SAME locomotive in SKY BLUE, same shape and size.
3. The SAME locomotive in MINT GREEN, same shape and size.
4. A flat freight WAGON seen from directly above, pointing RIGHT: a light wooden deck with rounded metal edges and little couplers at both ends, EMPTY on top, the same length and width as the locomotive.
5. A square light-wood CRATE seen from directly above, closed with a plain beige tape, with one BLANK white sticker label on top.
6. A WIDE, low crate seen from above, same wood, same tape, same blank white sticker.
7. A LONG crate seen from above, same wood, same tape, same blank white sticker.
8. A SMALL crate seen from above, same wood, same tape, same blank white sticker.

DO NOT INCLUDE: side views, front views, 3/4 perspective, rails, tracks, ground, background, shadows on the ground, passengers, people, drivers, faces or eyes on the trains or crates, text, letters, numbers, writing on the stickers, barcodes, logos, brand marks, colored tapes, different tape colors between crates, smoke, items crossing cell borders, items cut by the cell edge, different sizes between the three locomotives, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `galpoes.png` — 2 × 1 células de 400 (800 × 400), alfa

O mesmo galpão de carga, **visto de cima (top-down)**: um telhado quadrado e fofo, com a **porta grande do lado ESQUERDO** (por onde o trem entra). O código desenha o trilho entrando por baixo do telhado e põe o galpão por cima, então o trem some dentro dele. A plaquinha da cidade vem da `ui.png`.

| Célula | Peça |
|---|---|
| 0 | galpão com a porta da esquerda **aberta** (escuro lá dentro) |
| 1 | o mesmo galpão com a porta **fechada** (porta de enrolar creme) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 1 row, each cell 400 x 400 (total 800 x 400). The SAME cute, rounded, toy-like freight WAREHOUSE seen STRAIGHT FROM ABOVE (top-down view): a square soft-lilac roof with gentle ridges and a little round vent, about 80% of the cell, centered. On its LEFT side there is one big doorway where a train enters.
1. The warehouse with the LEFT doorway wide OPEN, showing a dark cozy inside.
2. The SAME warehouse with the LEFT doorway CLOSED by a cream roll-up shutter.

DO NOT INCLUDE: side views, front views, strong perspective, rails, tracks, trains, people, signs, plaques, text, letters, numbers, logos, brand marks, windows with symbols, ground, background, shadows on the ground, items crossing cell borders, items cut by the cell edge, different sizes between the two cells, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `ui.png` — 2 × 2 células de 640 × 480 (1280 × 960), alfa

Peças grandes e **em branco**: o código escreve tudo por cima.

| Célula | Peça | Uso |
|---|---|---|
| 0 | **etiqueta grande**: papel creme retangular (≈ 3 : 2), cantos arredondados, borda de cima picotada, uma faixa fina de código de barras no pé, e o resto **vazio** | o quadro da etiqueta; o código escreve 3–4 linhas de campo |
| 1 | **placa da regra**: tábua larga (≈ 6 : 1) pendurada por duas correntinhas, vazia | o "Separe pelo PARA" no alto |
| 2 | **recado**: bilhete amarelinho preso com um alfinete redondo, vazio | o recado do N3 |
| 3 | **plaquinha**: placa arredondada larga (≈ 5 : 2) em dois pezinhos, vazia | a cidade de cada galpão |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 2 rows, each cell 640 x 480 (total 1280 x 960), read left to right, top row first. Big, clean, friendly panels for a children's freight train yard game, each centered with about 6% margin, seen straight from the front, ALL COMPLETELY BLANK so the game can write on them.
1. A big blank SHIPPING LABEL: a cream paper rectangle about 3:2, rounded corners, a perforated top edge, one thin barcode strip along the bottom edge (just bars), and a large EMPTY area for writing.
2. A wide blank hanging SIGN BOARD (about 6:1), soft wood with rounded corners, hanging from two little chains at the top, empty face.
3. A blank NOTE: a small square of light yellow paper pinned with a round pushpin at the top, slightly curled corner, empty.
4. A small blank PLAQUE (about 5:2): a rounded cream sign on two little legs, with a soft border, empty face.

DO NOT INCLUDE: any text, letters, numbers, words, field names, lines for writing, icons, symbols, logos, brand marks, stamps, faces, people, hands, trains, backgrounds behind the items, shadows on the ground, items crossing cell borders, items cut by the cell edge, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `cover-etiqueta-certa.png` — 1672 × 941, opaco, com o título

Um pátio de cargas alegre, visto de cima e um pouco inclinado: uma locomotiva coral puxa um vagão com um caixote etiquetado, os trilhos se dividem numa chave, e uma criança chibi vira a alavanca. Dois galpões fofos esperam no fim dos trilhos. O título vai num letreiro no alto (memória *capa tem título*).

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes; very big round heads on small chubby bodies, huge glossy eyes with bright highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque. A bright, cozy freight train yard seen from above at a gentle angle: a cute chubby coral toy locomotive puffing little white steam clouds pulls a flat wagon carrying a light-wood crate with a big cream shipping label (only blank lines on it). In front of it the tracks split at a switch into two branches, each going to a cute lilac-roofed warehouse. In the foreground, a happy chibi kid in overalls and a cap pulls a railway switch lever with a red knob, smiling. A green signal light glows. Sunny sky, soft light. At the top center, a cute rounded sign shows the title "Etiqueta Certa" in big, bold, rounded, friendly letters, spelled exactly like that.

DO NOT INCLUDE: any other text besides the title, writing on the label, city names, numbers, misspelled title, extra letters, subtitles, logos, brand marks, passengers, passenger cars, city streets, faces on the trains or crates, colored tapes on the crates, scary elements, night, red danger colors, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24) e os pontinhos soltos.
2. Conferir:
   - **nenhuma letra** no botão, na etiqueta, na placa e na plaquinha;
   - a locomotiva e o vagão **vistos de cima e apontando para a direita**;
   - o dormente e o cabo da alavanca **em pé**;
   - os 4 caixotes com a mesma fita e o mesmo adesivo;
   - a porta do galpão do lado esquerdo.
3. Medir o vagão e a locomotiva (comprimento) e ajustar `TRAIN` no `data/layout.ts`. Medir a porta do galpão e ajustar `SHED.door`.
4. Anotar tudo no `MANIFEST.md` da pasta de assets.

---

## 10. N2 e N3: o pátio largo e o carimbo (13/10/2026)

O N2 e o N3 usam **as mesmas folhas do N1** (trilhos, trens, galpões, `ui`) e mais duas:
- **o chão largo não tem folha nova.** O código repete a `bg-patio.png` lado a lado, espelhando uma cópia sim, outra não, para as emendas casarem;
- **a etiqueta vira uma faixa comprida** no alto da tela, porque o mapa se arrasta para o lado e precisa da tela toda embaixo;
- **o carimbo** (N3) ganha folha própria.

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `etiqueta-longa.png` | 1 × 1 | — | ≈ 1600 × 230 (o código mede pelo alfa) | sim | a etiqueta do trem parado no N2/N3: 4 campos lado a lado |
| `carimbo.png` | 2 × 2 | 320 | 640 × 640 | sim | carimbo de mão, marca de tinta, posto do carimbo, botão lilás |

### 10.1 `etiqueta-longa.png`: uma peça só, alfa

A mesma etiqueta creme da `ui.png` (célula 0), só que **muito comprida e baixa (≈ 7 : 1)**:
- borda de cima picotada;
- uma faixa fina de código de barras **na ponta direita** (não embaixo);
- o resto **vazio**: o código escreve NOME, PARA, DE e PESO lado a lado.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A single game UI piece on a fully TRANSPARENT background, centered, with about 4% margin: a very LONG and LOW blank SHIPPING LABEL, about 7:1 (much wider than tall), cream paper with softly rounded corners, a small perforated edge along the top, one short thin barcode strip standing at the far RIGHT end (just bars), and a huge EMPTY area for writing, seen straight from the front. Same paper, colors and line style as a cute cozy freight-yard game.

DO NOT INCLUDE: any text, letters, numbers, words, field names, lines for writing, boxes or columns drawn on the paper, icons, symbols, logos, brand marks, stamps, faces, people, hands, backgrounds behind the label, shadows on the ground, a square or tall label, the label cut by the edge, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

### 10.2 `carimbo.png`: 2 × 2 células de 320 (640 × 640), alfa

| Célula | Peça | Direção / uso |
|---|---|---|
| 0 | **carimbo de mão**: cabo de madeira com uma bola lilás no alto e a borracha embaixo, visto de frente | **em pé**, com a borracha para baixo: o código o faz descer na etiqueta |
| 1 | **marca de tinta**: um círculo roxo de carimbo, só o anel com um pontilhado dentro, **sem letra** | fica ao lado do valor carimbado |
| 2 | **posto do carimbo** visto de cima: casinha pequena de telhado menta, com um balcão na frente (lado de baixo) | fica ao lado do trilho, perto do sinal; o recado fica preso nele |
| 3 | **botão grande** largo (≈ 3 : 1), **lilás**, arredondado e fofo, **em branco** | o CARIMBAR; o código escreve a palavra |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 2 rows, each cell 320 x 320 (total 640 x 640), read left to right, top row first. Cute, chunky toy-like pieces for a children's freight train yard game, each centered in its cell with about 8% margin, no ground, no shadow.
1. A cute RUBBER STAMP standing upright, seen from the front: a warm wooden handle with a round shiny LILAC knob on TOP and the flat rubber pad at the BOTTOM.
2. An INK STAMP MARK: one round PURPLE ink ring, slightly uneven like a real stamp print, with a dotted circle inside, the middle EMPTY (no letters, no symbols).
3. A tiny STAMP BOOTH seen STRAIGHT FROM ABOVE (top-down view): a small square hut with a soft MINT roof with gentle ridges, and a little wooden counter sticking out of its BOTTOM side.
4. A big, wide, rounded, puffy LILAC push BUTTON (about 3:1), seen from the front, with a soft highlight, its face completely BLANK.

DO NOT INCLUDE: text, letters, numbers, words on the button or inside the stamp mark, symbols, check marks, X marks, arrows, icons, hands, people, trains, rails, backgrounds behind the items, ground, shadows on the ground, items crossing cell borders, items cut by the cell edge, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

**Quando chegar, conferir:**
- a etiqueta longa está **vazia e deitada**;
- a marca de tinta não tem letra;
- o botão é **lilás** (não pode parecer o PARTIR verde).
