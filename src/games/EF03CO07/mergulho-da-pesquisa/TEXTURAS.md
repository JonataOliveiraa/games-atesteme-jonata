# Mergulho da Pesquisa — texturas

Pasta de entrega: `src/assets/games/EF03CO07/mergulho-da-pesquisa/`

**Anexe em toda geração as três imagens:** `references/muse dash style.jpeg`,
`references/muse dash style 2.jpg` e `references/muse dash style 3.png`.

O jogo vai rodar antes de qualquer PNG: cada arquivo abaixo terá um desenho de reserva em
`Graphics`, na mesma grade (`scenes/fallback.ts`). Quando um PNG chega com o nome certo, ele toma
o lugar do desenho. Depois disso eu meço a arte e ajusto as posições.

## A linha de arte: Muse Dash

| | Chibi de ícone (`33`) | Livro ilustrado (`34`) | **Muse Dash** |
|---|---|---|---|
| traço | marrom quente e fino | quase nenhum | **índigo/violeta escuro, fino a médio; puxa para um tom mais escuro da cor vizinha** |
| cor | sombra macia com degradê leve | pintura macia com granulado | **chapada com 1 tom de sombra; degradê só na água, nos brilhos e nos olhos** |
| olho | íris em degradê, 2–3 brilhos | íris castanha, 1 brilho | **enorme, íris em degradê, brilhos rosa e ciano** |
| paleta | pastel quente | pastel quente | **neon doce: rosa-choque, água/ciano, lavanda, violeta, amarelo-limão** |
| enfeite | brilhinhos de 4 pontas | — | **estrelas de 5 pontas com contorno duplo, brilhos de 4 pontas, retícula leve nos fundos** |
| keyline branca | não | não | **não** |

**O elenco da referência vai para o negativo.** As imagens são de um jogo de ritmo com meninas
anime (a de maria-chiquinha verde-água ao estilo Hatsune Miku, a bruxinha loira de chapéu grande,
as atendentes de bar), copos de drinque, palco, plateia e o copyright "peropero" num canto. Aqui o
elenco é de **bichinhos mascote**, redondos e kawaii.

## O que é PNG e o que fica em código

| PNG (este arquivo) | `Graphics` (sempre) |
|---|---|
| 8 tipos de lugar, 21 achados, 2 submarinos × 2 quadros, bolha de ar cheia e estourada, 3 clientes × 4 poses, capa | **o mapa inteiro** (céu, mar, areia, cais e a pedra em pedaços, um mapa por fase), o escuro e o farol, a onda do sonar, o anel e a plaquinha dos lugares acesos, o painel do sonar nas duas caras, as fichas-palavra e os filtros (com texto), o cartão do achado aberto, balões, HUD, mural do fim |

**As palavras ficam em código.** Nenhuma folha traz texto: as fichas, os filtros, os pedidos e o
contador do sonar são escritos pelo jogo (as fichas ganham ícone, §9, mas a palavra continua embaixo).

## Arquivos

| Arquivo | Tamanho | Grade | Obrigatório? |
|---|---|---|---|
| ~~`bg-mar.png`~~ | — | — | **não usado**: o mapa é desenhado em código |
| ~~`leito.png`~~ | — | — | **não usado** (§7): o fundo e a pedra são desenhados em código |
| ~~`cais.png`~~ | — | — | **não usado** (§8): o cais é desenhado em código |
| `lugares.png` | 1024 × 512 | 4 × 2 células de 256 | **entregue** (veio 2048 × 1024; reduzido e reempacotado) |
| `achados.png` | 1024 × 1536 | 4 × 6 células de 256 | **entregue** (reempacotado: 3 itens vazavam da célula) |
| `submarinos.png` | 1024 × 512 | 4 × 2 células de 256 | **entregue** (veio 2048 × 1024; reduzido) |
| `clientes.png` | 1400 × 1050 | 4 × 3 células de **350** | **entregue** (reempacotado a 92 %: a foca vazava da célula; pé em y ≈ 324) |
| `cover-mergulho-da-pesquisa.png` | 1280 × 720 | — | sim (capa do catálogo) |
| `filtros.png` | 1024 × 1280 | 4 × 5 células de 256 | **entregue** (§9): o ícone de cada ficha do sonar (recentrado) |

**Elenco (igual em todos os prompts):**
- **Pinguim repórter**: pinguim redondo, preto-azulado com barriga branca, bochecha rosa, boné
  amarelo-limão virado para trás e uma câmera fotográfica pendurada no pescoço.
- **Lontra professora**: lontra marrom-clara redonda, focinho creme, óculos redondos violeta, um
  lenço rosa-choque no pescoço.
- **Foca escritora**: foca cinza-lavanda redonda, bigodinhos, uma boina azul-água e um lápis
  atrás da orelha.

---

## 1. `bg-mar.png`: o cais e o mar vazio (não usado)

O mundo agora tem 5120 × 2160 (4 × 3 telas): o céu, o degradê do mar e as luzes são desenhados em
código, e o que é desenho de verdade vem das faixas dos §7 e §8.

O palco das 9 fases. Os lugares, o submarino e os clientes vêm de outras folhas, então o mar
precisa sair **vazio**: só água em degradê e areia. O jogo escurece o mar por cima e o farol
"acende" pedaços, por isso a água deve ser **clara e bonita** por baixo.

Zonas (aproximadas; depois eu meço):
- **cais** de madeira no alto à esquerda (x 0–260, y 90–250), com um poste e uma boia;
- **superfície** da água em y ≈ 240, de ponta a ponta;
- **mar aberto** de y 250 a 590, vazio;
- **fundo de areia** de y 590 a 720 (o painel do sonar fica por cima, em y 600–720).

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only in skies, water and glows; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow — over soft lavender; decorations of five-point stars with a double outline, four-point sparkles and soft glow; a light halftone-dot texture only in large background areas. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing. NO white sticker keyline here — this is a full scene, not a sticker.

SUBJECT — a cute underwater game level seen perfectly from the SIDE, like a 2D side-view aquarium cut. 16:9, 1280×720.
- Top strip (y 0–240): a soft lavender-pink sky with a few rounded clouds and tiny stars.
- Upper LEFT corner: a small cute wooden pier/dock painted aqua and pink (from x 0 to about x 260, its deck at about y 230), with one lamp post and a striped life ring; the deck is EMPTY (characters will stand there).
- A clean wavy water SURFACE line across the whole width at about y 240.
- The OPEN SEA from y 250 to y 590: a smooth vertical gradient from bright aqua near the surface to deep violet-blue near the bottom, a few soft light rays from the surface, tiny bubbles. It must stay EMPTY and calm: no rocks, no plants, no objects in the open water (game objects will be placed there).
- The SEA FLOOR from y 590 to y 720: smooth pastel sand with a gentle wavy top edge, a few tiny shells and pebbles near the very bottom only.

DO NOT INCLUDE: submarines, boats, fish schools, sharks, characters, people, animals, shipwrecks, caves, coral reefs, treasure chests, rocks or plants in the open water, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch with a big hat, bartender girls, anime idol girls, a bar, cocktails, bottles, glasses, a concert stage, stage lights, crowd silhouettes, microphones, music notes, neon city, copyright text, ©, logos, watermarks, signatures, @handles, website names, any text, letters or numbers, frames around the picture, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective ground lines converging, dark or scary deep sea.
~~~

---

## 2. `lugares.png`: os lugares do fundo do mar

Folha 1024 × 512, **fundo transparente**, 4 × 2 células de 256. Cada lugar "guarda" um achado (o
jogo põe a plaquinha em cima). Todos apoiados numa linha ≈ 16 px acima do pé da célula, com
~180 px de largura.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **linha 1** | naufrágio de barquinho | gruta na rocha | recife de coral | baú do tesouro aberto |
| **linha 2** | concha gigante aberta | ânfora/jarro tombado | farolzinho afundado | rocha com algas e estrela-do-mar |

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only on glossy highlights and glows; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; decorations of small five-point stars with a double outline and four-point sparkles. Take ONLY the art style: do NOT copy their characters, outfits, poses, scenes, logos or framing.

FORMAT — a sprite sheet of UNDERWATER PLACES, 1024×512 px, TRANSPARENT background, a grid of 4 columns × 2 rows of 256×256 px cells. One place per cell, seen from the SIDE (2D game view), each about 180 px wide, resting on an invisible baseline about 16 px above the bottom of its cell, fully inside its cell with at least 12 px of margin. No grid lines, no water or background behind them. Each place is cute and inviting, not scary, and has an OPEN or empty spot in its middle (the game puts a small sign there).

ROW 1
1. A tiny cute SHIPWRECK: a small wooden boat lying tilted on the sand, a broken mast with a pink flag, a round porthole glowing softly.
2. A small rocky CAVE: a rounded violet rock with a dark cozy opening in the middle and a few aqua crystals.
3. A CORAL REEF: a bouquet of hot-pink, lemon and aqua corals with a little open gap in the middle.
4. An open TREASURE CHEST: a cute wooden chest with gold trim, its lid open, glowing softly inside (empty inside).

ROW 2
5. A giant open SEASHELL: a big pastel pink scallop shell, open, with a soft glow inside (no pearl).
6. A tipped-over clay AMPHORA jar lying on the sand, with a few bubbles coming out of its mouth.
7. A small sunken LIGHTHOUSE: a short striped pink-and-white lighthouse tower leaning slightly, its lamp glowing aqua.
8. A ROCK WITH SEAWEED: a rounded lavender rock with wavy green seaweed and a yellow starfish on it.

DO NOT INCLUDE: animals, fish, characters, submarines, pearls, coins, objects inside the chest or shell, any text, letters or numbers, signs, skulls, bones, scary or dark elements, water background, colored tiles behind the places, places crossing the cell borders, the characters from the reference images, Hatsune Miku, idol girls, a bar, cocktails, bottles, stage, microphones, music notes, copyright text, ©, logos, watermarks, signatures, @handles, website names, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 3. `achados.png`: o que se pesquisa (insubstituível)

Folha 1024 × 1536, **fundo transparente**, 4 × 6 células de 256. **O tipo tem de se ver na forma**,
porque o jogo pergunta o tipo:

| tipo | como aparece |
|---|---|
| **foto** | moldura branca de **polaroide** (borda grossa embaixo), figura dentro |
| **vídeo** | **telinha** com a borda de **fita de filme** (furinhos em cima e embaixo), figura dentro |
| **texto** | **folha de caderno** com várias **linhas de texto** (riscos, sem letras de verdade) e uma figurinha pequena num canto |
| **desenho** | **folha com desenho de giz de cera**, traço infantil, colorido |
| **objeto** | o próprio objeto (pelúcia, chinelo, boia, maquete), sem moldura |

Todos com ≈ 200 px, centrados, sem nada cruzando a célula.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **linha 1** | foto de tucano (pousado num galho) | foto de tucano **voando** | foto de tucano **de perto** (o bico enorme) | desenho de tucano |
| **linha 2** | tucano de pelúcia | chinelo de tucano | vídeo de tucano | texto sobre tucano |
| **linha 3** | vídeo de vulcão em **erupção** | vídeo de vulcão **parado** | foto de vulcão | maquete de vulcão |
| **linha 4** | desenho de vulcão | texto sobre vulcão | texto sobre baleia | texto sobre **filhote** de baleia |
| **linha 5** | foto de baleia | foto de baleia **pulando** | vídeo de baleia pulando | boia de baleia |
| **linha 6** | desenho de baleia | (vazia) | (vazia) | (vazia) |

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only on glossy highlights; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; small four-point sparkles as decoration. Animals are cute and rounded but still clearly the real animal (a toucan with its huge orange-yellow beak, a whale, a volcano). Take ONLY the art style: do NOT copy their characters, outfits, poses, scenes, logos or framing.

FORMAT — a sprite sheet of SEARCH RESULTS, 1024×1536 px, TRANSPARENT background, a grid of 4 columns × 6 rows of 256×256 px cells. One item per cell, centered, about 200 px, fully inside its cell with at least 12 px of margin. Cells 22, 23 and 24 (row 6, columns 2–4) stay EMPTY. The MEDIUM of each item must be obvious from its shape:
- PHOTO = a white instant-photo (polaroid) frame with a thicker bottom border, the picture inside;
- VIDEO = a small rounded screen whose top and bottom edges are a film strip with little square holes, the picture inside;
- TEXT = a notebook page covered with several lines of scribbled text (just wavy lines, NO real letters) and one small picture in a corner;
- DRAWING = a sheet of paper with a childish wax-crayon drawing, bright and wobbly;
- OBJECT = the object itself, with no frame.

ROW 1 — 1. PHOTO of a toucan perched on a branch. 2. PHOTO of a toucan FLYING with open wings. 3. PHOTO of a toucan in CLOSE-UP, the huge beak filling the picture. 4. DRAWING of a toucan in crayon.
ROW 2 — 5. A toucan PLUSH TOY (soft, stitched seams, button eyes). 6. A FLIP-FLOP sandal decorated with a toucan. 7. VIDEO of a toucan on a branch. 8. TEXT page about toucans (small toucan picture in the corner).
ROW 3 — 9. VIDEO of a volcano ERUPTING with bright lava and smoke. 10. VIDEO of a calm volcano, NOT erupting. 11. PHOTO of a calm volcano. 12. A school MODEL of a volcano (papier-mâché on a little board).
ROW 4 — 13. DRAWING of a volcano in crayon. 14. TEXT page about volcanoes (small volcano picture in the corner). 15. TEXT page about whales (small whale picture in the corner). 16. TEXT page about a BABY whale (small picture of a mother whale with her calf in the corner).
ROW 5 — 17. PHOTO of a whale swimming. 18. PHOTO of a whale JUMPING out of the water. 19. VIDEO of a whale jumping. 20. An inflatable WHALE POOL FLOAT toy.
ROW 6 — 21. DRAWING of a whale in crayon. 22, 23, 24: empty.

DO NOT INCLUDE: any real letters, words, numbers or logos (text pages use only wavy lines), play-button triangles, user interface icons, watermarks on the photos, people, characters, the characters from the reference images, Hatsune Miku, idol girls, a bar, cocktails, bottles, stage, microphones, music notes, copyright text, ©, @handles, website names, colored tiles behind the items, items crossing the cell borders, two items in one cell, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines (except inside the crayon drawings), painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `submarinos.png`: os dois navegadores e o ar

Folha 1024 × 512, **fundo transparente**, 4 × 2 células de 256. Os dois submarinos são os
**navegadores**: precisam ser **bem diferentes** de cara (cor e forma), do mesmo tamanho
(≈ 200 × 120), virados para a **direita**, centrados na célula.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **linha 1** | submarino amarelo parado | submarino amarelo andando | submarino azul parado | submarino azul andando |
| **linha 2** | bolha de ar cheia | bolha de ar estourando | (vazia) | (vazia) |

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only on glossy highlights and glows; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; small four-point sparkles as decoration. Take ONLY the art style: do NOT copy their characters, outfits, poses, scenes, logos or framing.

FORMAT — a sprite sheet, 1024×512 px, TRANSPARENT background, a grid of 4 columns × 2 rows of 256×256 px cells, one item per cell, centered, fully inside its cell. No grid lines, no water behind. Cells 7 and 8 stay EMPTY.

ROW 1 — two very DIFFERENT cute submarines, both about 200×120 px, seen from the side and facing RIGHT, each with a big round window at the front (empty, glowing softly — no pilot), a small periscope and a lamp at the nose. Pairs (1–2, 3–4) are the same submarine in the same size and position.
1. YELLOW SUBMARINE, still: chubby lemon-yellow body, rounded like a bean, aqua fins, hot-pink stripes, a little propeller at the back.
2. The same yellow submarine MOVING: propeller spinning (motion blur arcs) and a short trail of bubbles behind.
3. BLUE SUBMARINE, still: a sleeker rounded aqua-and-violet body shaped like a little fish, with a lavender dorsal fin, star-shaped rivets and a different, rounder window.
4. The same blue submarine MOVING: propeller spinning and a short trail of bubbles behind.

ROW 2
5. An AIR BUBBLE: a round glossy aqua bubble with a white shine and a tiny star, about 80 px.
6. The same bubble POPPING: broken into a burst ring of tiny droplets and sparkles.

DO NOT INCLUDE: pilots, people, characters, animals, fish, the characters from the reference images, Hatsune Miku, idol girls, a bar, cocktails, bottles, stage, microphones, music notes, weapons, torpedoes, any text, letters, numbers or logos, flags with symbols, water background, colored tiles behind the items, items crossing the cell borders, white sticker keyline, copyright text, ©, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `clientes.png`: os três clientes do cais

Folha 1280 × 960, **fundo transparente**, 4 × 3 células de 320. Uma linha por cliente, e as quatro
células da linha são o **mesmo bichinho**, mesmo tamanho e lugar; só a pose muda. Todos em pé,
pés numa linha ≈ 20 px acima do pé da célula, ≈ 240 px de altura, virados um pouco para a
**direita** (para o mar).

| | col 1: pedindo | col 2: esperando | col 3: feliz | col 4: apontando o erro |
|---|---|---|---|---|
| **linha 1** | Pinguim repórter | | | |
| **linha 2** | Lontra professora | | | |
| **linha 3** | Foca escritora | | | |

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only in eyes and glossy highlights; huge glossy eyes with gradient irises and several bright colored highlights (pink and cyan), small blush, tiny expressive mouths; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; small four-point sparkles as decoration. Here the characters are ROUND KAWAII MASCOT ANIMALS (like the small mascot creatures in the background of the bar reference), NOT people. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing.

FORMAT — a character sprite sheet, 1280×960 px, TRANSPARENT background, a grid of 4 columns × 3 rows of 320×320 px cells. Each ROW is ONE character; the four cells of a row show the SAME character in the same size and position, only the pose and face change. Every character stands on an invisible baseline about 20 px above the bottom of its cell, about 240 px tall, turned three-quarters to the RIGHT. Fully inside the cell, no grid lines, no background.

ROW 1 — the PENGUIN REPORTER: a round blue-black penguin with a white belly, pink blush, a lemon-yellow cap worn backwards and a small photo camera hanging from its neck.
ROW 2 — the OTTER TEACHER: a round light-brown otter with a cream muzzle, round violet glasses and a hot-pink scarf.
ROW 3 — the SEAL WRITER: a round lavender-grey seal with whiskers, an aqua beret and a pencil behind its ear.

COLUMNS (same for every row):
1. ASKING: one flipper/paw raised as if calling, mouth open, excited.
2. WAITING: hands together, looking hopeful toward the right.
3. HAPPY: jumping a little, eyes closed in joy, sparkles around.
4. POINTING OUT A MISTAKE: one hand pointing down to the right, a puzzled frown, a small sweat drop (comic, not angry).

DO NOT INCLUDE: humans, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch with a big hat, bartender girls, anime idol girls, revealing clothes, high heels, a bar, cocktails, bottles, glasses of drinks, stage, microphones, music notes, any text, letters, numbers or logos, speech bubbles, colored tiles behind the characters, characters crossing the cell borders, different sizes between cells of the same row, characters facing left, copyright text, ©, watermarks, signatures, @handles, website names, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `cover-mergulho-da-pesquisa.png`: a capa

Cena inteira com o título escrito, como toda capa ([[capa-tem-titulo]]).

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only in water, glows and eyes; huge glossy eyes with gradient irises and pink and cyan highlights on the animals; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; five-point stars with a double outline and four-point sparkles. Characters are ROUND KAWAII MASCOT ANIMALS, NOT people. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing. NO white sticker keyline here (this is a full scene).

SUBJECT — a game cover, 16:9, 1280×720, full scene. A side-view cut of the sea: a cute chubby lemon-yellow submarine with aqua fins dives in the middle, sending out glowing aqua SONAR rings. The deep sea around is dark violet, and the sonar rings LIGHT UP a few spots on the sea floor — a tiny shipwreck, a coral reef and an open treasure chest — each glowing softly, while the rest of the sea stays in a soft darkness. Small glowing word-cards float near the submarine like bubbles (blank cards, no letters). At the upper left, on a small aqua-and-pink wooden pier, a round penguin with a backwards yellow cap and a little camera waves excitedly. Bubbles and sparkles everywhere.

TITLE — at the top center, big rounded bubbly cartoon lettering that reads exactly: Mergulho da Pesquisa
cream-white letters with a dark indigo outline and a hot-pink drop shadow, easy to read, fully inside the image with margin on all sides. The title is the ONLY text in the image.

DO NOT INCLUDE: any other text, letters, numbers, logos or captions besides the title, letters on the floating cards, misspelled title, humans, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch, bartender girls, anime idol girls, a bar, cocktails, bottles, stage, microphones, music notes, sharks, scary creatures, weapons, copyright text, ©, watermarks, signatures, @handles, website names, frames or borders around the picture, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `leito.png`: o fundo de areia (não usado)

O usuário preferiu o mapa todo em `Graphics` (06/10/2026): o fundo e a pedra em pedaços são
desenhados pelo jogo (`data/maps.ts` + `scenes/rocks.ts`). O prompt fica só de registro.

Faixa 1280 × 260, **fundo transparente em cima**: o jogo a repete lado a lado na largura do mundo
(5120 px), com o pé da faixa no fundo do mapa. Por isso a **borda esquerda e a direita precisam
emendar** sem costura.

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only in skies, water and glows; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; decorations of five-point stars with a double outline and four-point sparkles. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing.

FORMAT — a horizontally TILEABLE strip, 1280×260 px, TRANSPARENT above the sand. The left and right edges must match perfectly so the strip can repeat side by side with no visible seam.

SUBJECT — the cute sandy SEA FLOOR of a 2D side-view underwater game: a wavy pastel sand surface whose top edge sits around y 60–90 (gentle hills), filling down to the bottom of the strip; small rounded lavender rocks, a few pink and lemon corals, wavy green seaweed growing up to about 140 px tall, tiny shells and pebbles, a couple of small bubbles. Keep everything low and spaced out; the middle of the strip may have bare sand.

DO NOT INCLUDE: water background above the sand, fish, animals, characters, submarines, shipwrecks, treasure chests, caves, big rocks taller than 140 px, seams or cut objects at the left and right edges, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch with a big hat, bartender girls, anime idol girls, a bar, cocktails, bottles, glasses, a concert stage, stage lights, microphones, music notes, copyright text, ©, logos, watermarks, signatures, @handles, website names, any text, letters or numbers, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `cais.png`: o canto do cais (não usado)

Também desenhado em código. O prompt fica só de registro.

Imagem 640 × 360 que cobre o **canto de cima à esquerda** do mundo: céu, o cais de madeira e a
superfície da água. O cliente fica de pé no cais (deck em y ≈ 250) e o submarino sai da água logo
à direita. **Fundo transparente abaixo da superfície** (y > 270), porque o mar é desenhado pelo jogo.

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only in skies, water and glows; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; decorations of five-point stars with a double outline and four-point sparkles. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing.

FORMAT — 640×360 px, the upper-left corner of a 2D side-view game world. Opaque from y 0 to the water surface at about y 265; TRANSPARENT below y 270.

SUBJECT — a soft lavender-pink sky with a few rounded clouds and tiny stars; on the left, a small cute wooden PIER painted aqua and pink, its flat EMPTY deck at about y 250 reaching from x 0 to about x 380, with wooden posts going down into the water, a lamp post with a lemon-yellow lamp at its right end and a striped life ring hanging on it; a clean wavy water surface line across the whole width at about y 262.

DO NOT INCLUDE: characters, people, animals, boats, submarines, anything standing on the deck, underwater scenery, fish, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch with a big hat, bartender girls, anime idol girls, a bar, cocktails, bottles, glasses, a concert stage, stage lights, microphones, music notes, copyright text, ©, logos, watermarks, signatures, @handles, website names, any text, letters or numbers, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. `filtros.png`: os ícones das fichas do sonar (novo)

Pedido do usuário em 06/10/2026: uma folha só, em que **cada ícone mostra o que aquela ficha filtra**.
A palavra continua escrita pelo jogo embaixo do ícone (ícone sozinho não diz o próprio nome), por
isso a folha não traz texto.

Folha 1024 × 1280, **fundo transparente**, 4 × 5 células de 256. Cada ícone com ≈ 200 px, centrado.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **linha 1** | TUCANO: cabeça de tucano, bico enorme | VULCÃO: vulcãozinho calmo com fumaça | BALEIA: baleia azul com esguicho | FOTO: polaroide com céu e sol |
| **linha 2** | VÍDEO: telinha com borda de fita de filme | TEXTO: folha de caderno com linhas onduladas | DESENHO: folha com rabisco de giz + um giz | PELÚCIA: ursinho com costuras |
| **linha 3** | CHINELO: par de chinelos de dedo | MAQUETE: casinha de papel numa base de papelão | BOIA: boia listrada redonda | VOANDO: asas abertas com risquinhos |
| **linha 4** | DE PERTO: lupa | ERUPÇÃO: estouro de lava (sem montanha) | PARADO: nuvem dormindo | PULANDO: arco pontilhado + respingo |
| **linha 5** | FILHOTE: mamadeira | (vazia) | (vazia) | (vazia) |

O N1 usa 10 (linhas 1–2, maquete e boia); o resto é do N2/N3.

Para o ícone **não entregar o achado**:
- ícone de **assunto** mostra só o bicho/coisa, sem moldura de foto, fita ou folha;
- ícone de **tipo** usa a mesma forma dos achados (polaroide, fita, folha) mas **sem assunto dentro**;
- ícone de **detalhe** não mostra bicho nenhum.

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only on glossy highlights; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; at most one or two tiny four-point sparkles per icon. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing.

FORMAT — a sprite sheet of SEARCH-FILTER ICONS, 1024×1280 px, TRANSPARENT background, a grid of 4 columns × 5 rows of 256×256 px cells. ONE icon per cell, centered, about 200 px at its largest side, fully inside its cell with at least 20 px of empty margin. Cells 18, 19 and 20 (row 5, columns 2–4) stay EMPTY. No grid lines, no background shape behind the icons (no circle, badge, tile or card). All icons are one family: same size, same line weight, same framing. Each icon must read instantly at a tiny size (64 px on a phone button): one big bold silhouette, few details, strong contrast on both white and dark violet backgrounds. Each icon shows WHAT ITS FILTER KEEPS:
- TOPIC icons (1–3) show only the animal or thing itself, with NO photo frame, film strip or paper around it;
- MEDIUM icons (4–11) show only the medium, EMPTY of any toucan, volcano or whale — the photo and video only show a plain pastel sky;
- DETAIL icons (12–17) show only the idea, with NO animal at all.

ROW 1
1. TOUCAN: a cute chibi toucan, head and chest only, turned three-quarters to the right, its HUGE glossy orange-and-lemon beak with a dark tip, black body, white-cream throat, big glossy eye with pink and cyan highlights.
2. VOLCANO: a small rounded violet-brown cone with a crater, a lemon-orange glow inside, a few lava drips and ONE small round puff of lavender smoke above; a tiny patch of green at its foot.
3. WHALE: a chubby blue whale seen from the side facing right, cream grooved belly, small happy eye, tail curled up, a small aqua water spout above its head.
4. PHOTO: a single white instant photo (polaroid), the BOTTOM border much thicker, slightly tilted; inside only a pastel sky with a smiling lemon sun and one round cloud.

ROW 2
5. VIDEO: a small rounded screen, wider than tall, whose top and bottom edges are a dark violet FILM STRIP with little square cream holes; inside only a pastel sky with one cloud and a tiny star.
6. TEXT: a cream notebook page, taller than wide, punched holes on the left edge, 5 or 6 lines of writing drawn as violet WAVY LINES (no real letters), top-right corner folded.
7. DRAWING: a sheet of paper with a childish WAX-CRAYON drawing (a wobbly pink heart, a wobbly lemon star, colorful scribbles with crayon texture) and ONE fat hot-pink crayon lying across its corner.
8. PLUSH: a soft lavender TEDDY BEAR plush sitting, visible stitched seams, button eyes, a small pink heart patch on its tummy.

ROW 3
9. FLIP-FLOPS: a pair of plain flip-flop sandals seen from above, aqua soles, hot-pink straps, one tiny lemon flower.
10. SCHOOL MODEL: a small diorama on a square cardboard base in three-quarter view — a tiny papier-mâché house with a pink roof, a round paper tree and a green felt lawn; the edges of the base clearly visible.
11. POOL RING: a plain round inflatable swim ring, donut shape with a hole, hot-pink and white stripes, glossy shine.
12. FLYING: a pair of OPEN WINGS spread wide (white-lavender feathers, joined in the middle, no body) with three curved aqua motion lines on each side.

ROW 4
13. CLOSE-UP: a big MAGNIFYING GLASS tilted right, hot-pink rim, violet handle, light aqua lens with a big white shine, nothing seen through it.
14. ERUPTION: a BURST OF LAVA shooting upward like a fountain — bright orange and lemon molten blobs and drops flying up and out from one point at the bottom, a few sparks; NO mountain under it.
15. STILL / CALM: a small round lavender CLOUD with a calm SLEEPING face (closed curved eyes, tiny smile, pink blush) and two tiny round bubbles beside it.
16. JUMPING: a curved DOTTED ARC going up and over, starting from a big aqua WATER SPLASH crown with flying droplets at the bottom left, ending in a small sparkle at the top right.

ROW 5
17. BABY: a cute BABY BOTTLE with a soft lavender nipple, a hot-pink cap ring and white milk inside, a small pink heart printed on it.
18, 19, 20: empty.

DO NOT INCLUDE: toucans, volcanoes or whales anywhere except in icons 1, 2 and 3; animal-shaped plush, sandals or pool floats; a camera, a phone, a television with legs or antenna, play-button triangles, a clapperboard, a film reel, a pencil, paintbrushes, a box of crayons, an eye inside the magnifying glass, a volcano cone under the lava, the letter Z or ZZZ, a dolphin, fish, frogs or any animal jumping, a baby, a pacifier with a face, any text, letters, words, numbers or logos, real letters on the notebook lines, speech bubbles, user-interface buttons, background tiles, round badges or cards behind the icons, grid lines, icons crossing the cell borders, two icons in one cell, people, characters, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch with a big hat, bartender girls, anime idol girls, a bar, cocktails, wine or soda bottles, drinking glasses, stage, microphones, music notes, copyright text, ©, watermarks, signatures, @handles, website names, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines (except the crayon scribbles in icon 7), painterly realistic rendering, 3D render, photorealistic, tiny fussy details that disappear at small size.
~~~

---

## Depois da entrega

Os originais, como chegaram, ficam em `outputs/mergulho-da-pesquisa/*-original.png`.

1. Salvar os PNGs com **estes nomes exatos** na pasta de entrega.
2. Eu meço cada célula pelo canal alfa (caixa, pé, peça que vaza para a vizinha). Se algo cruzar
   a borda, reempacoto a folha.
3. Ajusto `data/files.ts` e `data/layout.ts` (cais, superfície, fundo de areia, tamanho dos
   lugares) sem regenerar, e rodo de novo a validação dos mares.
