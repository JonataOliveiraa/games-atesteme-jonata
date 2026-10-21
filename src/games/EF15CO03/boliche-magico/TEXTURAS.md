# Boliche Mágico — texturas

Destino: `src/assets/games/EF15CO03/boliche-magico/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 o laço, §5 a tela, §6 os pinos e a bola, §11 N2 e N3).

**Linha de arte: chibi voador** (a mesma do Circuito de Bolinha e da Ventania na Floresta). Anexe em **toda geração** a `references/35-chibi-voador.webp`. A `references/19-chibi-figurinhas.jpg`, que a 1ª versão deste arquivo pedia, não existe mais no disco.
- Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*.
- O elenco da referência (os quatro meninos de fanart de Genshin, slimes, nuvens, arco-íris, balões com símbolos) vai no negativo de todos os prompts.
- Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

| | chibi voador (este jogo) | chibi de figurinha (19) | doodle de lápis (39) |
|---|---|---|---|
| traço | liso, médio, num tom mais escuro da própria cor | uniforme, escuro dessaturado | grafite rabiscado |
| cor | chapada, 1 sombra macia, "+" brancos de brilho | chapada, 1 sombra | lápis com hachura |
| olho | grande, brilhante, com destaque | enorme, um brilho | dois pontinhos |
| silhueta | keyline branca só nos sprites | keyline branca | sem keyline |

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código (`scenes/fallback.ts`) nas mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

**Ficam no código, sempre:** o cabeçalho, a placa e as peças dela (termo, NÃO, E, OU), a bancada com as cartas e os botões, as marcas ✓ e ✗, o medidor de força, o rastro da bola, o "Zz", o rastelo, as estrelinhas de tontura, a poeira, o confete e a bolinha de toque.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `fundo.png` | — | — | 1280 × 720 | opaco | o boliche com a pista vista de lado (os três níveis) |
| `pinos.png` | 4 × 2 | 192 × 288 | 768 × 576 | sim | linha de cima: os corpos (azul, verde, vermelho); linha de baixo: os rostos |
| `enfeites.png` | 3 × 1 | 192 × 288 | 576 × 288 | sim | a estrela da barriga, os óculos e o travesseiro mágico |
| `bola.png` | 3 × 2 | 256 × 256 | 768 × 512 | sim | o corpo da Bola Mágica e os 5 rostos dela |
| `cover-boliche-magico.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

O pino pequeno do N2 e do N3 é o mesmo desenho em 72 % do tamanho: não há folha nova por nível.

**A ordem das células é contrato com o código**, e nesta folha também **a posição dentro da célula**: o rosto, a estrela e os óculos são camadas postas por cima do corpo, na mesma célula. Por isso:

- todo pino é desenhado **no mesmo lugar** da célula: base (os pezinhos) encostada a 10 px do fundo, centro em x 96;
- o centro da cabeça fica em **(96, 74)**, com raio ~54; o centro da barriga, em **(96, 200)**;
- os rostos (linha de baixo de `pinos.png`) são **só o rosto**, sem cabeça nem corpo, desenhados exatamente onde a cabeça está nas células de cima;
- a estrela fica centrada em **(96, 205)**, com ~64 px; os óculos, com as lentes em **(76, 74)** e **(116, 74)**; o travesseiro, centrado em **(96, 150)**, com ~150 × 80 px;
- na bola, o rosto é só o rosto, desenhado por cima do círculo do corpo, que ocupa a célula com ~8 % de margem.

Se a geração sair fora dessas posições, o artista reempacota (cada camada recortada e recolocada no ponto de contrato) em vez de regenerar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** A placa, as marcas e as falas são do código. A única exceção é o título da capa.
- **Os pinos são a resposta.** Cor, estrela e óculos têm de ser lidos de relance com o pino a 60 px de altura no celular. Nenhum pino tem chapéu, laço, roupa ou enfeite além dos pedidos.
- **As três cores dos pinos** são exatas e só delas: azul `#4F9BEA`, verde `#5CC46A`, vermelho `#EF5A5A`. As duas faixas do pescoço são brancas nos três.
- **A estrela é amarela** `#FFD23F`, grande, na barriga. **Os óculos são redondos e quase pretos** `#2B2440`, iguais em todos.
- **A bola é azul-noite** `#3B3F8F` com estrelinhas, nunca azul-claro, verde, vermelho ou violeta (violeta é o NÃO da placa).
- **O travesseiro é creme** `#FFF4DC` com bolinhas lilás: não usa as cores dos pinos, para não parecer atributo.
- **O cenário não usa as cores dos pinos com força** atrás da fila de pinos: ali a parede é clara e calma.
- **Vista de lado.** A pista é uma faixa horizontal de madeira; os pinos e a bola são vistos de frente, de pé sobre ela.

---

## 3. `fundo.png` — 1280 × 720, opaco

O boliche infantil, com a pista atravessando a tela de lado. Medidas que o código usa:

| Faixa | y | O que tem |
|---|---|---|
| 0–96 | coberta pelo cabeçalho | o alto da parede (pode ter luzes) |
| 96–460 | a parede | de x 330 até a borda direita, entre y 140 e 225, o capô da máquina de pinos (sanefa escura de bolinhas); abaixo dele, clara e calma entre x 360 e 1180 (onde os pinos ficam de pé, com o "Zz" em cima) |
| 470–515 | o tampo da pista | madeira cor de mel, vista um pouco de cima, com as setinhas de mira |
| 515–560 | a frente da pista | a lateral da madeira, mais escura |
| 560–720 | o chão | carpete colorido; de 590 para baixo fica coberto pela bancada |

- **À esquerda** (x 30–170), a máquina de devolver bola, com a boca virada para a pista; a bola descansa em x 210, sobre o tampo. **Acima da bola, entre x 90 e 330 e y 260 e 440, a parede fica lisa**: ali aparece o medidor de força.
- **A pista vai até a borda direita**: a bola sai da tela por ali. O rastelo do jogo desce de dentro do capô.
- **Nenhuma bola, pino ou pessoa** desenhados: tudo isso é do jogo.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark plum, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (peach, cream, lavender, honey) with a few clear saturated accents; soft rounded chunky shapes; NO white sticker keyline here — this is a full scene, not a sticker. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

Wide background illustration for a children's game, 16:9, exactly 1280x720 px, opaque: the inside of a cheerful children's bowling alley seen STRAIGHT FROM THE SIDE. One long wooden bowling lane crosses the whole picture horizontally: its top surface is a honey-coloured wooden strip from y 470 to y 515 (seen slightly from above, with thin plank lines and three small aiming arrows), and its front side is a darker wooden band from y 515 to y 560. Below the lane, from y 560 to the bottom, a playful patterned carpet in soft purple with tiny confetti shapes. On the far left (x 30 to 170), a rounded ball-return machine in cream and teal, its mouth facing the lane at lane height. The lane runs all the way to the right edge of the picture. Above the right part of the lane, from x 330 to the right edge and from y 140 to y 225, hangs the dark plum valance of the pin machine, with a scalloped bottom edge and a row of small yellow lights. Above everything, the back wall: pale peach and cream panels and a row of warm round light bulbs near the very top; a few simple neon signs only high on the LEFT part of the wall, above y 250 and left of x 330 (a glowing crescent moon, a glowing star). The wall between x 90 and x 330 and between y 260 and y 440 is plain and light. The wall between x 360 and x 1180 and between y 230 and y 460 must stay calm, plain and light, because characters will stand there. No people, no bowling pins and no bowling balls anywhere in the picture.

DO NOT INCLUDE: bowling pins, bowling balls, people, characters, animals, text, letters, words, labels, digits, numbers, score screens, scoreboard, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows other than the small lane arrows, HUD, question mark button, white sticker keyline, pit at the end of the lane, perspective lane going into the distance, top-down view, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, signatures, @handles, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, soft airbrushed gradients, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines.
~~~

---

## 4. `pinos.png` — 4 × 2 células de 192 × 288 (768 × 576), alfa

| | coluna 0 | coluna 1 | coluna 2 | coluna 3 |
|---|---|---|---|---|
| **linha 0 · corpo** | pino **azul** | pino **verde** | pino **vermelho** | vazia |
| **linha 1 · rosto** | acordado | com sono | dormindo | tonto |

- **O corpo** é um pino de boliche fofo: cabeça redonda grande (centro (96, 74), raio ~54), pescoço fino com **duas faixas brancas**, barriga larga (centro (96, 200)) e dois pezinhos curtos embaixo. O corpo **não tem rosto**: a cabeça fica lisa, só com o brilho.
- **Os rostos** são só olhos, boca e bochechas, sem cabeça atrás, no lugar exato da cabeça:
  - **acordado:** olhos grandes e brilhantes, sorriso aberto, bochechas rosadas;
  - **com sono:** pálpebras pesadas, olhos quase fechados, boquinha de bocejo pequena;
  - **dormindo:** olhos fechados em arco, sorriso tranquilo;
  - **tonto:** olhos em espiral, boca ondulada.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, dark green, dark red — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background, 4 columns by 2 rows, 192x288 px per cell (768x576 px total), read left to right, top row first, no grid lines drawn. TOP ROW, three cute chibi bowling pins seen from the front, all identical in shape, size and position, only the body colour changes: cell 1 blue #4F9BEA, cell 2 green #5CC46A, cell 3 red #EF5A5A; cell 4 stays empty. Each pin: a big round head centred at x 96, y 74 of its cell (radius about 54 px), a thin neck with TWO WHITE STRIPES, a wide round belly centred at x 96, y 200, and two tiny stubby feet resting 10 px above the bottom of the cell. The head of the pins has NO FACE at all: no eyes, no mouth, only a small shine. BOTTOM ROW, four FACES ONLY (no head, no body, nothing behind them, transparent around the features), each drawn exactly where the head of a pin sits in the cells above (centred at x 96, y 74 of the cell), so it can be laid on top of any pin: cell 5 awake (big shiny eyes, open happy smile, pink cheeks); cell 6 sleepy (heavy half-closed eyelids, small yawning mouth, pink cheeks); cell 7 asleep (closed eyes drawn as gentle arcs, calm smile, pink cheeks); cell 8 dizzy (spiral eyes, wobbly mouth).

DO NOT INCLUDE: faces on the pins of the top row, hats, bows, clothes, stars on the pins, glasses, arms, hands, extra decorations, shadows on the ground, floor, background colour, white backing behind transparent areas, skin-coloured circles behind the faces, text, letters, words, labels, digits, numbers, watermark, logo, speech bubbles, Z letters, sleep symbols, arrows, icons, frames, user interface, grid lines, visible sprite-sheet borders, cell borders, cropped edges, sad crying faces, angry faces, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, signatures, @handles, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, soft airbrushed gradients, 3D render, photorealistic, blur.
~~~

---

## 5. `enfeites.png` — 3 × 1 células de 192 × 288 (576 × 288), alfa

| coluna 0 | coluna 1 | coluna 2 |
|---|---|---|
| **estrela** amarela `#FFD23F`, ~64 px, centrada em (96, 205) | **óculos** redondos quase pretos `#2B2440`, lentes em (76, 74) e (116, 74), com a ponte no meio | **travesseiro mágico** creme `#FFF4DC` com bolinhas lilás e duas estrelinhas, ~150 × 80 px, centrado em (96, 150), visto de frente |

Só o enfeite, sem pino atrás. A estrela e os óculos o código põe por cima do corpo; o travesseiro aparece com um "puf" embaixo da cabeça do pino com sono que a bola derrubou.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep gold, dark plum, warm brown — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background, 3 columns by 1 row, 192x288 px per cell (576x288 px total), no grid lines drawn. Cell 1: one big chunky five-pointed star in warm yellow #FFD23F with a small shine, about 64 px wide, centred at x 96, y 205 of the cell, nothing else in the cell. Cell 2: a pair of round cartoon glasses in near-black #2B2440, the two round lenses centred at x 76, y 74 and x 116, y 74 of the cell, joined by a short bridge, lenses clear and see-through (transparent inside), no arms visible, nothing else in the cell. Cell 3: one soft fluffy bed pillow seen from the front, cream #FFF4DC with small lilac polka dots and two tiny golden stars, puffy rounded corners, about 150 px wide and 80 px tall, centred at x 96, y 150 of the cell, nothing else in the cell. These are stickers that will be laid on top of or under a bowling pin, so draw ONLY the star, ONLY the glasses and ONLY the pillow.

DO NOT INCLUDE: bowling pins, heads, faces, eyes behind the glasses, bodies, extra stars, sparkles around the objects, coloured lenses, sunglasses, blankets, beds, people, shadows, floor, background colour, white backing behind transparent areas, text, letters, words, digits, numbers, watermark, logo, icons, frames, user interface, grid lines, visible sprite-sheet borders, cell borders, cropped edges, the characters from the reference image (Genshin Impact fan-art boys), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, signatures, @handles, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, soft airbrushed gradients, 3D render, photorealistic, blur.
~~~

---

## 6. `bola.png` — 3 × 2 células de 256 (768 × 512), alfa

| | coluna 0 | coluna 1 | coluna 2 |
|---|---|---|---|
| **linha 0** | **corpo** da bola, sem rosto | rosto **normal** | rosto **rolando** (esforço) |
| **linha 1** | rosto **feliz** | rosto **ops** | rosto **força** (prendendo o fôlego) |

- **O corpo** é uma bola de boliche azul-noite `#3B3F8F`, redonda, ocupando a célula com ~8 % de margem, com **três furos** de dedo em cima à direita e algumas **estrelinhas** douradas espalhadas. Ele gira quando a bola rola, e é por isso que não tem rosto.
- **Os rostos** são só olhos, boca e bochechas, no centro da bola (um pouco abaixo do meio), e ficam sempre de pé:
  - **normal:** olhos grandes e brilhantes, sorriso simpático;
  - **rolando:** olhos determinados olhando para a direita, boca firme;
  - **feliz:** olhos fechados de alegria (arcos para cima), boca aberta rindo;
  - **ops:** olhos arregalados, boca pequena em "o", uma gotinha de suor;
  - **força:** olhos apertados em "> <", bochechas estufadas e bem vermelhas, boca fechada prendendo o ar (aparece enquanto o medidor de força corre).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep gold — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks (a sweat drop); soft rounded chunky shapes; a thin white sticker keyline around the whole silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background, 3 columns by 2 rows, 256x256 px per cell (768x512 px total), read left to right, top row first, no grid lines drawn. Cell 1: a round bowling ball, deep night blue #3B3F8F, filling the cell with about 8% margin, with three finger holes on its upper right and a few tiny golden stars sprinkled on it, and NO FACE. Cells 2 to 6 are FACES ONLY (no ball behind them, nothing else, transparent around the features), each drawn exactly where the centre of the ball sits in cell 1, slightly below the middle, so it can be laid on top of the ball; the features are light-coloured enough to read on the night-blue ball (white eyes with dark pupils, pink cheeks, a light pink mouth): cell 2 normal (big shiny eyes, friendly smile, pink cheeks); cell 3 rolling (determined eyes looking to the right, firm mouth); cell 4 happy (eyes closed in happy upward arcs, open laughing mouth); cell 5 oops (wide surprised eyes, small round mouth, one small sweat drop); cell 6 power (eyes squeezed shut like "> <", puffed-out bright red cheeks, mouth pressed shut holding its breath).

DO NOT INCLUDE: arms, hands, legs, hats, wands, magic sparkles around the ball, motion lines, a face on cell 1, a ball behind the faces of cells 2 to 6, bowling pins, floor, shadows, background colour, white backing behind transparent areas, text, letters, words, digits, numbers, watermark, logo, speech bubbles, icons, frames, user interface, grid lines, visible sprite-sheet borders, cell borders, cropped edges, angry faces, crying faces, the characters from the reference image (Genshin Impact fan-art boys), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, signatures, @handles, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, soft airbrushed gradients, 3D render, photorealistic, blur.
~~~

---

## 7. `cover-boliche-magico.png` — 1672 × 941, opaco, **com o título**

A Bola Mágica rolando pela pista com um rastro de estrelinhas; à frente, um pino com sono caindo feliz num travesseiro, um pino acordado pulando por cima da bola e outro já dormindo. Letreiro **Boliche Mágico** no alto, centralizado (conferir o acento de "Mágico").

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (deep brown, dark navy, dark plum — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks; soft pastel palette with a few clear saturated accents; soft rounded chunky shapes; NO white sticker keyline here — this is a full scene, not a sticker. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

Cover illustration, 1672x941 px, opaque; the main action must read at thumbnail size. A cheerful children's bowling alley seen from the side, with a honey-coloured wooden lane crossing the picture. On the left, a cute round bowling ball character, deep night blue with tiny golden stars and three finger holes, with big shiny eyes and a determined smile, rolling to the right and leaving a short trail of little golden stars. In front of it, a row of cute chibi bowling pins with big round heads, white neck stripes and tiny feet: one blue pin with a big yellow star on its belly is gently falling backwards with closed sleepy eyes and a happy smile onto a fluffy cream pillow with lilac dots; one green pin with round black glasses is joyfully jumping high over the ball; one red pin is already lying down asleep with a calm smile, its head on a pillow. Pale peach wall with warm round light bulbs at the top. At the top centre, a big title lettering that reads exactly "Boliche Mágico" (with the accent on the a), chunky rounded colourful letters with a thick dark outline and a slight volume, clearly readable.

DO NOT INCLUDE: any other text, misspelled title, extra letters, subtitles, digits, numbers, scoreboard, watermark, logo, user interface, buttons, panels, frames, speech bubbles, arrows, HUD, people, hands, hats on the pins, angry faces, crying faces, scary scenes, perspective lane going into the distance, white sticker keyline, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, signatures, @handles, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, soft airbrushed gradients, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise.
~~~
