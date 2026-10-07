# Pinball de Entrada e Saída — texturas

Destino: `src/assets/games/EF03CO06/pinball-de-entrada-e-saida/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 clareza, §6 tela, §7
aparelhos e missões, §14 textura × código).

**Anexe em toda geração:** `references/35-chibi-voador.webp`, a ilustração de
chibis voando entre nuvens que você mandou em 06/10/2026. A linha é a **chibi
voador**, escolhida para este jogo. Cada prompt vem inteiro (estilo + corpo +
negativo), pronto para copiar.

> **O elenco da referência vai para o negativo.** A imagem é uma fanart de
> Genshin Impact: quatro meninos com roupas de fantasia, um com lenço roxo, um
> com flor e capa verde, um samurai de cabelo branco e vermelho, um ruivo de
> casaco. Há também slimes, nuvens, arco-íris e balões com símbolos. Se ninguém
> proibir, o gerador copia tudo isso.

### Tabela de estilo — chibi voador

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Traço | liso, de espessura média, num tom **mais escuro da própria cor** (marinho, marrom, verde-azulado); nunca preto puro | chibi de ícone (marrom quente fino) e pop chapado (marinho uniforme em tudo) |
| Cor | **chapada, com 1 tom de sombra macio** e quase nenhum degradê | chibi de ícone (degradê leve + brilho de borda) e livro ilustrado (pintura com granulado) |
| Olho | enorme, cílio de cima escuro, íris em degradê, 2–3 brilhos fortes | desenho de criança (pontinho) |
| Enfeite | **"+" brancos** de brilho no cabelo e no que é liso | Muse Dash (estrelas de 5 pontas) |
| Silhueta | sem keyline branca | chibi de figurinha (keyline) |
| Proporção | cabeça ≈ metade da altura, corpo gordinho de membros curtos, **poses cheias de movimento** | graphic novel (quase natural) |
| Paleta | pastel (lilás, verde-água, creme, marrom quente) com poucos acentos saturados | — |

**As quatro regras deste jogo (vêm do pedido "não pode ser confuso"):**
- **Cada aparelho se reconhece de longe.** Silhueta clássica e gorducha de
  brinquedo: o teclado tem teclas grandes, o microfone tem a cabeça redonda
  com grade, a câmera tem a lente bem grande. Os seis têm o **mesmo peso
  visual** e nenhum brilha mais.
- **Nada de azul forte ou laranja forte nos aparelhos.** Essas são as cores das
  faixas ENTRADA (azul) e SAÍDA (laranja), que o código desenha. Os aparelhos
  ficam em branco, cinza-claro, grafite e menta, com pequenos detalhes.
- **O Nino nunca aparece com um aparelho.** As poses mostram a **ação**
  (cantar, ouvir, mostrar o desenho), sem microfone, fone, câmera ou tela. Se
  o aparelho estivesse no desenho, ele entregaria a resposta.
- **A mesa vem vazia.** Trilhos, funis, flippers, bumpers e aparelhos entram
  por código ou por outra folha, nas posições que o jogo precisa.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-fliperama.png` | — | — | 1280 × 720 | opaco | sala de fliperama; o miolo fica calmo para a mesa |
| `mesa.png` | — | — | 600 × 660 | sim | a mesa-computador vazia (tampo + moldura) |
| `aparelhos.png` | 3 × 2 | 320 × 320 | 960 × 640 | sim | teclado, microfone, câmera / alto-falante, tela, impressora |
| `pecas.png` | 4 × 4 | 256 × 256 | 1024 × 1024 | sim | processador ×2, flipper, bola, mola, bumper, folha, estrela / 8 conteúdos |
| `nino.png` | 4 × 3 | 320 × 320 | 1280 × 960 | sim | 10 poses do Nino (2 células vazias) |
| `cover-pinball-de-entrada-e-saida.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`).

**Se a arte vier em outro tamanho**, ela é usada como veio: o jogo mede a caixa
de cada célula na carga (como na Praia dos Dados). O que **não pode** mudar é
a **grade**, a **ordem das células** e o que existe em cada uma.

**O insubstituível para o N1:** a mesa, os aparelhos, as peças e o Nino. O
fundo pode vir depois (a arte de reserva segura), e a capa vem por último.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula, nem nos aparelhos. Nomes,
  faixas, letras do ABC e o nome do Nino são do código.
- Peça solta e centrada na célula, com ~8 % de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha.
- Aparelhos e peças de **frente** ou em 3/4 bem leve, para lerem no tamanho do
  jogo (~120 px).

---

## 3. `bg-fliperama.png` — 1280 × 720, opaco

Uma sala de fliperama aconchegante e clara, de dia. A mesa (600 × 660) fica no
meio, por cima do fundo, e o painel do fluxo na direita.

| Região (x) | O que tem |
|---|---|
| 0–340 | parede e piso; o piso começa em y ≈ 690 (o Nino fica em pé aqui) |
| 340–940 | parede **lisa e calma**: a mesa cobre essa área |
| 940–1280 | parede lisa e calma: o painel do fluxo fica aqui |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes; faces (only where asked) with big glossy eyes, bright highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A cozy, bright arcade room background for a children's game, 16:9 (1280 x 720), opaque, seen straight from the front, no characters. A soft lilac-and-mint wall with a few gentle round neon light strips near the ceiling (soft pastel glow, not dark), and a warm light-wood floor that starts near the bottom edge (the floor line at about 96% of the height). On the far left and far right edges only, the soft blurred sides of two cute rounded arcade cabinets, cut by the image border. The whole center of the image and the right third must be a CALM, PLAIN wall with even lighting, because a big pinball table and an information panel will be placed there by the game. Cheerful daytime mood, soft light.

DO NOT INCLUDE: people, characters, animals, a pinball table, pinball parts, balls, flippers, computers, monitors, keyboards, microphones, cameras, speakers, printers, posters with text, any text, letters or numbers, logos, neon signs with words, busy decorations in the center, dark night scene, black walls, harsh neon colors, strong blue or strong orange areas, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy decor, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective lines converging.
~~~

---

## 4. `mesa.png` — 600 × 660, alfa

A mesa de pinball **vista de cima**, de pé na tela (retrato), desenhada como um
**computador aberto**: o tampo tem um padrão bem suave de placa de circuito, e
a moldura lembra o gabinete de um computador fofo, com cantos redondos e
parafusos. Ela vem **vazia**: o jogo desenha trilhos, funis e flippers, e põe
os aparelhos nas fileiras de cima e de baixo.

| Região (y, na mesa) | O que tem |
|---|---|
| 0–40 | moldura de cima |
| 40–200 | tampo liso (aqui ficam as **entradas**) |
| 200–470 | tampo com o padrão de circuito mais visível, sem nada em cima (o **processador** vai no centro, em y ≈ 290) |
| 470–620 | tampo liso (aqui ficam os **flippers** e as **saídas**) |
| 620–660 | moldura de baixo |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes; faces (only where asked) with big glossy eyes, bright highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A single game asset on a fully TRANSPARENT background: an EMPTY pinball playfield seen straight from above, in portrait orientation (600 x 660), designed to look like the inside of a cute, friendly computer. A thick rounded frame like a soft pastel computer case (light grey and mint, with little round screws in the corners and two tiny vent slots on the sides). Inside the frame, a smooth flat playfield in a soft pale mint color with a very faint, low-contrast pattern of circuit-board lines (thin rounded traces and small dots), slightly more visible in the middle band of the playfield and almost invisible near the top and bottom. The playfield is completely EMPTY and evenly lit: no lanes, no rails, no ramps, no bumpers, no flippers, no holes, no targets, no balls, no devices. Centered in the image with a small margin, no ground and no cast shadow.

DO NOT INCLUDE: lanes, rails, ramps, tubes, bumpers, flippers, holes, drains, targets, balls, lights in specific spots, a plunger, a backglass, legs of the table, a side view, perspective tilt, keyboards, microphones, cameras, speakers, screens, printers, chips, characters, people, animals, any text, letters or numbers, logos, strong blue or strong orange areas, dark colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy decor, colored background behind the table, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `aparelhos.png` — 3 × 2 células de 320 (960 × 640), alfa

Linha de cima: as **entradas**. Linha de baixo: as **saídas**. Os seis têm o
mesmo tamanho na célula (~80 %) e o mesmo jeito de brinquedo gorducho.

| Célula | Aparelho | Desenho fixo |
|---|---|---|
| 0 | **teclado** | teclado pequeno e gordinho, de frente em 3/4 leve, com teclas grandes **lisas** (sem letras) |
| 1 | **microfone** | microfone de mesa: cabeça redonda com grade, haste curta, base redonda |
| 2 | **câmera** | câmera de fotos fofa, de frente, com a **lente grande** no centro e o botão em cima |
| 3 | **alto-falante** | caixa de som em pé, de frente, com um cone grande e um pequeno |
| 4 | **tela** | monitor de frente, com a tela **apagada, lisa e grande** (grafite-escuro, um brilho no canto) e o pezinho |
| 5 | **impressora** | impressora de mesa, de frente, com a **fenda de saída do papel** bem visível e **sem papel** |

A área da tela (célula 4) tem de ser um retângulo liso, porque o jogo desenha
o conteúdo dentro dela.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes; faces (only where asked) with big glossy eyes, bright highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A sprite sheet on a fully TRANSPARENT background: 6 cute, chunky, toy-like computer devices in a grid of 3 columns x 2 rows, each in its own 320 x 320 cell (total 960 x 640), read left to right, top row first. All six have the SAME size (about 80% of the cell), the same soft rounded toy style and the same visual weight. Colors: white, light grey, graphite and soft mint, with tiny accents; NO strong blue and NO strong orange anywhere. Each device is seen from the front (or a very slight three-quarter view) and centered in its cell, with no ground and no shadow.
Cells:
1. A small chunky computer KEYBOARD with big rounded blank keys (no letters, no symbols on the keys).
2. A desk MICROPHONE: a round mesh head on a short stand with a round base.
3. A cute photo CAMERA seen from the front, with a big round lens in the center and a shutter button on top.
4. A standing LOUDSPEAKER box seen from the front, with one big speaker cone and one small one.
5. A computer MONITOR seen from the front on a small stand, its screen turned OFF: a large, flat, plain dark graphite rectangle with one soft glossy reflection in a corner (nothing displayed on it).
6. A desk PRINTER seen from the front, with a clearly visible paper output slot and NO paper in it.

DO NOT INCLUDE: letters, numbers or symbols on keys or buttons, anything displayed on the monitor, paper coming out of the printer, cables, wires, plugs, a computer tower, a mouse, headphones, music notes, sound waves, flashes, characters, people, hands, animals, faces on the devices, strong blue, strong orange, red, neon colors, any text, letters or numbers, logos, brand names, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy objects, weapons, colored backgrounds behind the devices, ground, shadows on the ground, devices crossing cell borders, devices cut by the cell edge, different sizes between devices, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `pecas.png` — 4 × 4 células de 256 (1024 × 1024), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **processador apagado**: chip quadrado fofo com pininhos dos 4 lados e um rostinho dormindo | o bumper do meio, em repouso |
| 1 | **processador aceso**: o **mesmo** chip, brilhando amarelo-claro, rostinho acordado e concentrado | quando a bola bate |
| 2 | **flipper** esquerdo: braço de pinball com o pino redondo do lado esquerdo | o direito é espelhado no código |
| 3 | **bolinha** de metal prateada, brilhante | a informação |
| 4 | **mola** do êmbolo, em pé, com o topo achatado | embaixo de cada entrada |
| 5 | **bumper pequeno** (cogumelo de pinball) em menta | enfeite dos lados do processador |
| 6 | **folha de papel em branco**, de frente | a folha que sai da impressora (o conteúdo é do código) |
| 7 | **estrela** dourada fofa | confete e acerto |
| 8 | **três pecinhas de letra em branco** (quadradinhos creme, lisos) | o conteúdo "letras" (o código escreve A, B, C) |
| 9 | **balão de fala com ondas de voz** | o conteúdo "voz" |
| 10 | **nota musical** dupla (colcheias) | o conteúdo "música" |
| 11 | **o desenho do Nino**: folha com uma casinha, uma árvore e um sol, em giz de cera | o conteúdo "desenho" |
| 12 | **personagem de desenho animado**: cabeça de um coelhinho fofo e sorridente | o conteúdo "desenho animado" |
| 13 | **livro de história** aberto, com uma estrelinha nas páginas | o conteúdo "história" |
| 14 | **convite de festa**: cartão com balões de festa desenhados | o conteúdo "convite" |
| 15 | **crachá em branco** (etiqueta com cordão) | o conteúdo "nome" (o código escreve NINO) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes; faces (only where asked) with big glossy eyes, bright highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A sprite sheet on a fully TRANSPARENT background, a grid of 4 columns x 4 rows, each cell 256 x 256 (total 1024 x 1024), read left to right, top row first. Each item centered in its cell with about 8% margin, no ground, no shadow.
Cells:
1. A cute square computer CHIP (processor) seen from above, soft lavender-grey, little metal pins on all four sides, with a tiny sleeping face (closed eyes).
2. The SAME chip, same size and position, now glowing soft light yellow with a gentle glow around it, the tiny face awake and concentrated (open eyes, determined little mouth).
3. A LEFT pinball FLIPPER seen from above: a rounded tapered arm in mint and white, with its round pivot on the LEFT end, pointing to the right and slightly down.
4. A shiny silver metal BALL with bright highlights.
5. A pinball plunger SPRING standing upright, with a flat round cap on top.
6. A small pinball pop BUMPER seen from a slight angle, soft mint with a white cap (mushroom shape).
7. A blank sheet of white PAPER seen from the front, slightly curled corner, nothing on it.
8. A golden cute STAR with a soft shine.
9. THREE small blank cream letter TILES in a row (rounded squares), completely plain, with NO letters on them.
10. A white speech BALLOON with three soft curved sound-wave lines coming out of it.
11. A double MUSIC NOTE (two joined eighth notes), glossy.
12. A child's crayon DRAWING on a sheet of paper: a little house, a tree and a sun, drawn in bright crayon strokes.
13. A cartoon CHARACTER HEAD: a cute smiling bunny, simple and round.
14. An open STORYBOOK with a tiny star on the pages.
15. A party INVITATION card with cute party balloons drawn on it (no text).
16. A blank NAME TAG badge on a lanyard, plain white, with nothing written on it.

DO NOT INCLUDE: any text, letters or numbers (not on the tiles, not on the name tag, not on the invitation, not on the book), logos, characters or people other than the bunny head in cell 13, faces on any item except cells 1, 2 and 13, hands, animals other than the bunny, computers, monitors, keyboards, microphones, speakers, printers, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy objects, weapons, colored backgrounds behind the items, shadows on the ground, items crossing cell borders, items cut by the cell edge, different sizes between cells 1 and 2, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `lily.png` (entregue; chegou como Lily, não como o Nino descrito abaixo) — 4 × 3 células de 320 (1280 × 960), alfa

**Nino** tem 8 anos. Pele morena média, cabelo castanho-escuro cacheado e
curto, olhos grandes castanhos. Veste camiseta **verde-menta** com uma
estrelinha amarela, bermuda **cinza** e tênis brancos. É o mesmo menino, do
mesmo tamanho, nas dez poses: corpo inteiro, de frente, pés no mesmo ponto
(95 % da altura da célula).

**Nenhuma pose tem aparelho**: nada de microfone, fone, câmera, teclado ou
tela. O lápis e o caderninho (célula 7), a folha em branco (5) e o desenho (8)
são os únicos objetos.

| Célula | Pose | Missão |
|---|---|---|
| 0 | **pedindo**: falando, uma mão aberta para cima, sorriso | neutra / apresentação |
| 1 | **feliz**: pulando, os dois braços para cima, olhos fechados de alegria | acerto |
| 2 | **triste**: ombros caídos, olhos marejados, boquinha para baixo | erro |
| 3 | **ouvindo**: mão em concha atrás da orelha, olhos fechados, sorriso | OUVIR / ESCUTAR |
| 4 | **olhando**: mão na testa como viseira, olhos brilhando, curioso | VER |
| 5 | **quer o papel**: segura uma **folha em branco** com as duas mãos, esperançoso | no PAPEL |
| 6 | **cantando**: boca bem aberta, uma mão no peito, outra aberta para o lado, olhos fechados | CANTAR |
| 7 | **escrevendo**: segura um caderninho e escreve com um lápis, concentrado | ESCREVER |
| 8 | **mostrando o desenho**: segura o desenho (casinha, árvore e sol) virado para a frente | MOSTRAR |
| 9 | **falando um recado**: as duas mãos em concha em volta da boca, chamando alguém | FALAR |
| 10, 11 | **vazias** (transparentes) | — |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; characters with very big round heads (about half of the body height) on tiny soft chubby bodies with stubby limbs and lively poses, huge glossy eyes with a dark upper lash line, gradient irises and two or three bright highlights, small pink blush ovals, tiny expressive mouths. Take ONLY the art style: do NOT copy its characters, outfits, hairstyles, scarves, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: the SAME boy in 10 poses, in a grid of 4 columns x 3 rows, each cell 320 x 320 (total 1280 x 960), read left to right, top row first; the last two cells (11 and 12) are EMPTY and fully transparent. The boy, NINO, is 8 years old: medium-brown skin, short dark-brown curly hair, big brown eyes, a mint-green T-shirt with a small yellow star, grey shorts and white sneakers. Full body, facing the viewer, head ≈ half of his height, the SAME size in every cell, feet on the same baseline at 95% of the cell height, centered.
Poses:
1. Asking: talking with a smile, one open hand raised palm up.
2. Happy: jumping with both arms up, eyes closed with joy, big open smile.
3. Sad: shoulders down, teary eyes, small frown.
4. Listening: one hand cupped behind his ear, eyes closed, gentle smile.
5. Looking: one hand over his eyebrows like a visor, sparkling curious eyes.
6. Wanting paper: holding a BLANK white sheet of paper with both hands in front of his chest, hopeful face.
7. Singing: mouth wide open, one hand on his chest, the other arm open to the side, eyes closed.
8. Writing: holding a small notebook and writing with a pencil, focused face.
9. Showing a drawing: holding up a crayon drawing (a little house, a tree and a sun) facing the viewer, proud smile.
10. Calling out a message: both hands cupped around his mouth, calling someone.
11. (empty)
12. (empty)

DO NOT INCLUDE: a microphone, headphones, earphones, a camera, a phone, a tablet, a keyboard, a computer, a monitor, a speaker, a printer, music notes, sound waves, speech balloons, any text, letters or numbers (not on the notebook, not on the paper), different outfits between cells, different hair between cells, different sizes between cells, side or back views, extra characters, girls, adults, animals, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy outfits, armor, weapons, ground, shadows on the ground, scenery, colored backgrounds behind the boy, characters crossing cell borders, characters cut by the cell edge, anything drawn in cells 11 and 12, watermarks, signatures, @handles, website names, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `cover-pinball-de-entrada-e-saida.png` — 1672 × 941, opaco, com o título

A Lily comemora ao lado da mesa-computador. A bolinha brilhante corre pela
mesa: entrou pelo microfone em cima, passou pelo processador aceso no meio, e
o alto-falante embaixo solta notas musicais. O título vai num letreiro de
fliperama no alto (memória *capa tem título*).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; characters with very big round heads (about half of the body height) on tiny soft chubby bodies with stubby limbs and lively poses, huge glossy eyes with a dark upper lash line, gradient irises and two or three bright highlights, small pink blush ovals, tiny expressive mouths. Take ONLY the art style: do NOT copy its characters, outfits, hairstyles, scarves, clouds, slimes, rainbow, speech bubbles or framing.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque, in a cozy bright arcade room with soft pastel neon. In the center-right, a cute pinball table seen from above at a gentle angle, designed like the inside of a friendly computer (pale mint playfield with faint circuit lines, a soft pastel computer-case frame). At the TOP of the table, a cute desk microphone; in the MIDDLE, a glowing square computer chip with a tiny happy face, acting as the central bumper; at the BOTTOM, a standing loudspeaker sending out colorful music notes. A shiny silver ball races along a glowing trail from the microphone, through the chip, down to the speaker. On the left, LILY, an 8-year-old girl with long, fluffy, wavy golden-blonde hair, a big mint-green bow on the side of her head, huge blue eyes, a mint-green T-shirt with a yellow star, dark grey shorts and mint-and-white sneakers, jumps with both arms up, cheering. At the top center, a cute rounded arcade marquee sign shows the title "Pinball de Entrada e Saída" in big, bold, rounded, friendly letters, spelled exactly like that, with the accent on "Saída".

DO NOT INCLUDE: any other text besides the title, misspelled title, missing accent, extra letters, subtitles, numbers, scores, logos, a dark or night scene, black background, harsh neon, other characters, boys, adults, animals, a padlock, a hat or a duck coming out of devices, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy outfits, weapons, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24) e os pontinhos soltos, como na Praia (as folhas
   dessa linha vêm com franja).
2. Conferir célula por célula: a ordem, a tela apagada e lisa, a impressora sem
   papel, o Nino **sem aparelho** em nenhuma pose, as pecinhas e o crachá **sem
   letras**.
3. Ajustar o `data/layout.ts` e os trajetos (`data/paths.ts`) à mesa medida.
4. Anotar tudo no `MANIFEST.md` da pasta de assets.
