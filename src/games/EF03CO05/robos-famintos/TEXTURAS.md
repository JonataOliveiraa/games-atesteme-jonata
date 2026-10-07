# Robôs Famintos — texturas

Pasta de entrega: `src/assets/games/EF03CO05/robos-famintos/`

**Anexe em toda geração:** `references/33-chibi-icone.jpg`, a folha de ícones chibi (a mesma do
Cantinho do Tablet).

O jogo vai rodar antes de qualquer PNG: cada arquivo abaixo terá um desenho de reserva em
`Graphics`, na mesma grade (`scenes/fallback.ts`). Quando um PNG chega com o nome certo, ele toma
o lugar do desenho. Depois disso eu meço a arte e ajusto as posições.

## A linha de arte: chibi de ícone

| | Livro ilustrado (`34`) | Muse Dash | **Chibi de ícone (`33`)** |
|---|---|---|---|
| traço | quase nenhum, tom da própria cor | índigo/violeta fino | **marrom quente e fino, um pouco mais grosso na silhueta** |
| cor | pintura macia com granulado | chapada, 1 sombra, paleta neon doce | **cel shading macio: 1 tom de sombra + degradê leve + brilho de borda** |
| olho | íris castanha, 1 brilho grande | enorme, brilhos rosa e ciano | **enorme, íris em degradê, cílio de cima escuro, 2–3 brilhos** |
| proporção | cabeça ≈ 1/3 | chibi de jogo de ritmo | **cabeça ≈ metade da altura, corpo pequeno e macio** |
| keyline branca | não | não | **não** |

**O elenco da referência vai para o negativo.** A folha é de personagens de jogo de fantasia
(chapéu vermelho, tapa-olho, roupas de aventura), com marca d'água e cada cabeça num ladrilho
colorido. O gerador copia tudo isso se ninguém proibir.

**Nada do Angry Birds na arte.** A jogabilidade é de estilingue, mas o desenho não pode lembrar
os personagens de lá: pássaros, porquinhos verdes e caixotes de TNT vão para o negativo de todos
os prompts.

## O que é PNG e o que fica em código

| PNG (este arquivo) | `Graphics` (sempre) |
|---|---|
| fundo da sala com as 4 plataformas, 4 robôs × 4 caras, estilingue (inteiro e a haste da frente), saquinho, caixa, cartucho × 2, placa de nome, caixote, capa | **os dados dentro do cartucho** (barrinhas, grade de pontinhos, letras, tira de quadros), o que a pança mostra, elástico, pontilhado, rastro, farelos, notinhas, balões, véu, HUD, barrigas-estante |

**Duas janelas ficam vazias de propósito:** a **tela da pança** de cada robô e a **janela do
cartucho**. O jogo desenha os dados ali. Se a arte trouxer qualquer desenho nessas telas (nota
musical, foto, letra, ▶), a resposta fica entregue e a peça não serve.

## Arquivos

| Arquivo | Tamanho | Grade | Obrigatório? |
|---|---|---|---|
| `bg-sala.png` | 1280 × 720 | — | sim · **entregue a versão sem plataformas** (§5) |
| `cenario.png` | ~~1400 × 700~~ **1024 × 512** | ~~350~~ **4 × 2 células de 256** | sim · **entregue** (§6): as peças com que os mapas são montados; caixas e tamanhos no MANIFEST |
| `robos.png` | ~~1536 × 1536~~ **1280 × 1280** | ~~384~~ **4 × 4 células de 320** | sim (**insubstituível**: são os leitores) · **entregue** e reempacotado |
| `estilingue.png` | 1050 × 350 | 3 × 1 células de 350 | sim · **novo** (§7): estilingue de lado em 2 camadas + saquinho |
| `objetos.png` | ~~1024 × 512~~ **1400 × 700** | ~~256~~ **4 × 2 células de 350** | sim · **entregue** |
| `cover-robos-famintos.png` | 1280 × 720 | — | sim (capa do catálogo) · **entregue** |

**06/10/2026:** fundo, robôs e objetos chegaram. O jogo lê as grades em negrito acima (a de 320 saiu do
reempacotamento dos robôs; a de 350 é a da entrega). Os robôs vieram olhando para a frente, e
ficou assim. Medidas e o que foi mexido estão em
`src/assets/games/EF03CO05/robos-famintos/MANIFEST.md`. Os prompts abaixo ficam como foram
usados; para gerar de novo, peça a grade nova.

**Elenco (igual em todos os prompts):** quatro robozinhos fofos, cada um com cabeça quadrada de
cantos bem arredondados (≈ metade da altura), olhos enormes brilhantes, bochechas rosadas e
**boca larga** que abre bem; corpo pequeno e redondo com uma **tela vazia na barriga**; braços
curtinhos e pés de bota.
- **Música:** lilás-lavanda, com um fone de ouvido grande e fofo na cabeça.
- **Foto:** pêssego-coral, com uma câmera pequena em cima da cabeça como chapéu (lente para a
  frente e uma lampadinha de flash).
- **Texto:** verde-menta, com óculos redondos grandes e um lápis espetado na cabeça como antena.
- **Vídeo:** azul-céu, com uma antena de TV de duas varetas com bolinhas na ponta.

---

## 1. `bg-sala.png`: a sala de máquinas com as plataformas (substituído pelo §5)

O palco dos três níveis. Os robôs ficam em **quatro plataformas em degrau** à direita, e o
estilingue e a caixa ficam no chão à esquerda (os dois vêm da folha `objetos.png`). O céu da sala
(a metade de cima, onde o arquivo voa) precisa sair **calmo e de pouco contraste**, para o
pontilhado e o cartucho se lerem por cima.

Posições aproximadas (centro do tampo de cada plataforma): P1 (720, 600), P2 (880, 520),
P3 (1040, 440), P4 (1190, 360). Chão em y ≈ 650. Depois eu meço onde a arte pôs cada tampo.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — soft rounded shapes, thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

SUBJECT — an EMPTY cute cozy "robot snack room" (a soft pastel machine room), seen perfectly straight-on from the side like a 2D game level (flat side view, no perspective tilt, no ceiling visible). 16:9, 1280×720.
- Back wall: soft pastel sky-blue fading to pale cream near the top, with a very subtle pattern of tiny rounded rivets and a few soft pastel pipes running horizontally ONLY along the very top edge and the very bottom of the wall. The big middle and upper area of the wall stays CALM, LIGHT and EMPTY (things will fly across it).
- Floor: warm light-honey rubber tiles filling the lower 10% of the image; the wall meets the floor at 90% of the height (y ≈ 650), a perfectly horizontal line across the whole picture.
- On the RIGHT half: a STAIRCASE OF FOUR chunky pastel platforms rising to the right, like big rounded stacked blocks of soft metal with cream tops and tiny bolts. Each platform has a FLAT, EMPTY top about 150 px wide. Approximate top centers: platform 1 at x 720, y 600 (a low block); platform 2 at x 880, y 520; platform 3 at x 1040, y 440; platform 4 at x 1190, y 360 (the tallest, near the right edge). The blocks are solid down to the floor and in soft colors (mint, butter yellow, lilac, peach), one color each. Leave about 220 px of EMPTY space above every platform top (robots will stand there).
- On the LEFT third: open empty floor (for a slingshot and a box that will be placed there), with a small round rug in soft coral on the floor and, against the far-left wall, a cute low cabinet with round knobs, cut by the left border.
- A couple of tiny decorations only near the edges: a round porthole window with a pale blue sky high on the far left wall, a little potted cactus on the floor at the far left corner.
- Soft warm light, gentle shading, calm and uncluttered so characters and flying objects placed on top stand out.

DO NOT INCLUDE: any robots, characters, people, animals, birds, pigs, a slingshot, boxes on the floor, cartridges, screens, monitors, TVs, computers, clocks, posters, music notes, letters, icons, any text, letters or numbers, Angry Birds characters, red birds, green pigs, TNT crates, wooden towers, the characters from the reference image, fantasy decor, square icon tiles, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective lines converging, busy patterns in the middle of the wall, dark or gloomy lighting.
~~~

---

## 2. `robos.png`: os quatro leitores (insubstituível)

Folha 1536 × 1536, **fundo transparente**, 4 colunas × 4 linhas de células de 384 × 384.

| | col 1 — Música | col 2 — Foto | col 3 — Texto | col 4 — Vídeo |
|---|---|---|---|---|
| **linha 1: esperando** | calmo, sorriso de boca fechada | idem | idem | idem |
| **linha 2: boca aberta** | boca escancarada, olhos brilhando de fome | idem | idem | idem |
| **linha 3: mastigando** | bochechas cheias, olhos felizes ^ ^ | idem | idem | idem |
| **linha 4: blé** | língua de fora, olhos em espiral, careta | idem | idem | idem |

Regras de forma, porque o jogo depende delas:
- **o mesmo robô tem o mesmo tamanho, a mesma silhueta e o mesmo lugar** nas 4 linhas; só a cara
  (e um pouco a pose dos braços) muda;
- todos **virados um pouco para a ESQUERDA** (três quartos), olhando para a esquerda;
- pés apoiados numa linha ≈ 20 px acima do pé da célula; altura do robô ≈ 320 px com o enfeite
  da cabeça;
- a **tela da barriga**: um retângulo arredondado **vazio**, de cor clara chapada (creme bem
  claro), ≈ 150 × 110 px, no centro do corpo, igual nas 16 células. Sem reflexo forte e sem
  desenho dentro.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big rounded heads on tiny soft bodies, huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, small expressive mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles and emotion marks as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

FORMAT — a character sprite sheet, 1536×1536 px, TRANSPARENT background, a grid of 4 columns × 4 rows of 384×384 px cells. One robot per cell, fully inside its cell with at least 16 px of empty margin, nothing crossing into another cell, no grid lines, no background tiles. Each COLUMN is ONE robot; the four cells of a column show the SAME robot in the same size, same silhouette and same position, only the face (and a little of the arm pose) changes. Every robot is turned three-quarters to the LEFT, looking to the left. Feet rest on an invisible baseline about 20 px above the bottom of the cell. Each robot is about 320 px tall including its head accessory.

THE FOUR ROBOTS — cute little chibi robots: a big square head with very rounded corners (about half of the body height), huge glossy eyes, pink blush, and a WIDE mouth that can open very big; a small round body; short stubby arms; little boot feet. In the middle of each body there is a BELLY SCREEN: a rounded rectangle about 150×110 px, flat very light cream color, COMPLETELY EMPTY (no picture, no icon, no reflection, nothing drawn inside), in exactly the same place in all 16 cells.
- COLUMN 1, the MUSIC robot: soft lilac-lavender body, wearing big fluffy over-ear headphones on its head.
- COLUMN 2, the PHOTO robot: soft peach-coral body, a small cute camera sitting on top of its head like a hat (lens facing forward, a tiny flash bulb).
- COLUMN 3, the TEXT robot: soft mint-green body, big round glasses, a yellow pencil stuck on top of its head like an antenna.
- COLUMN 4, the VIDEO robot: soft sky-blue body, a two-rod TV antenna on its head with little round balls on the tips.

ROW 1 — WAITING: calm and friendly, mouth closed in a small smile, arms down.
ROW 2 — MOUTH WIDE OPEN: hungry and excited, the mouth opened VERY wide (a big round open mouth, you can see a little pink tongue inside), eyes sparkling, arms raised a little, leaning slightly forward to the left.
ROW 3 — CHEWING HAPPILY: cheeks puffed and full, eyes closed in happy upside-down U shapes, a tiny satisfied blush, little sparkles.
ROW 4 — YUCK: tongue sticking out, dizzy spiral eyes, a wavy grimace, a small sweat drop, as if it ate something that tastes funny (comic, not scary).

DO NOT INCLUDE: anything drawn inside the belly screens (no music notes, no pictures, no photos, no letters, no play triangles, no icons, no bars, no grids, no glare), any text, letters, numbers or logos anywhere, music notes floating around, food, cartridges, birds, pigs, Angry Birds characters, humans, the characters from the reference image, Genshin Impact characters, red hats, eyepatches, fantasy items, weapons, scary or menacing robots, sharp teeth, square icon tiles, colored backgrounds behind the robots, robots crossing cell borders, different sizes between cells of the same column, robots facing right, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 3. `objetos.png`: estilingue, caixa, cartucho, placa e caixote

Folha 1024 × 512, **fundo transparente**, 4 colunas × 2 linhas de células de 256 × 256.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **linha 1** | estilingue inteiro (Y) | **só a haste da frente** do mesmo estilingue | saquinho do estilingue | caixa aberta com carinha |
| **linha 2** | cartucho parado | cartucho voando | placa de nome vazia | caixote |

Regras de forma:
- **células 1 e 2:** o estilingue é um Y de madeira de ≈ 230 px de altura, apoiado no pé da
  célula. A célula 2 é **a haste da esquerda** (a da frente), recortada, **no mesmo tamanho e no
  mesmo lugar** que ela ocupa na célula 1. O jogo desenha o arquivo entre as duas, e o elástico é
  feito em código;
- **células 5 e 6:** o mesmo cartucho, mesmo tamanho e mesmo lugar. A **janela** dele é um
  retângulo arredondado **vazio**, claro e chapado, cobrindo uns 70 % da frente. A carinha fica
  na faixa de cima, acima da janela;
- **célula 7:** placa larga (≈ 220 × 70 px) **lisa**, sem nada escrito. O jogo escreve o nome.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — soft rounded shapes, thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; glossy highlights; warm pastel palette; tiny four-point sparkles as decoration; faces (where asked) with huge glossy eyes, two or three white sparkle highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, poses or square-tile framing.

FORMAT — a sprite sheet of OBJECTS, 1024×512 px, TRANSPARENT background, a grid of 4 columns × 2 rows of 256×256 px cells. One object per cell, fully inside its cell with at least 12 px of empty margin, nothing crossing into another cell, no grid lines, no background tiles. Straight-on side view for everything. Objects that stand rest on an invisible baseline about 12 px above the bottom of their cell.

ROW 1
1. A cute wooden Y-shaped SLINGSHOT standing upright on its trunk: a short thick trunk and two rounded prongs going up, light-honey wood with soft pastel-mint wrapped bands near the top of each prong; about 230 px tall, resting on the baseline. NO rubber band, NO pouch (the game draws them).
2. ONLY THE LEFT PRONG of that same slingshot, cut out at the fork, in EXACTLY the same size and the same position it has in cell 1 (everything else in the cell transparent).
3. A small soft brown leather slingshot POUCH, a little rounded cup shape seen from the side, about 70 px wide, centered in the cell.
4. A cute open cardboard-and-pastel-metal BOX with its top flaps open, a happy chibi face on its front (big glossy eyes, blush, open smile), standing on the baseline, about 180 px wide and 150 px tall; the inside of the box is dark and EMPTY.

ROW 2
5. A cute DATA CARTRIDGE, like a chunky rounded memory card in pastel cream with a soft lilac border, about 190 px wide and 170 px tall, centered in the cell; a tiny chibi face (two big glossy eyes and a small smile) on the TOP strip; below it a big rounded rectangle WINDOW covering about 70% of the front, flat very light color, COMPLETELY EMPTY.
6. EXACTLY the same cartridge, same size and same position, flying: eyes squeezed shut in a happy ">  <" expression, a tiny open "wheee" mouth. The window is still COMPLETELY EMPTY.
7. A wide blank NAME PLATE, about 220×70 px, rounded corners, cream face with a soft wooden frame and two tiny bolts, completely blank (nothing written).
8. A small cute wooden CRATE, a cube about 120×120 px seen straight from the front, light-honey planks with a darker diagonal brace and soft rounded corners, resting on the baseline. No face.

DO NOT INCLUDE: anything inside the cartridge windows (no music notes, no pictures, no letters, no bars, no grids, no play triangles, no icons), any text, letters, numbers or logos anywhere (not on the box, not on the plate, not on the cartridge), a rubber band on the slingshot, a stone in the pouch, birds, pigs, Angry Birds characters, TNT crates, weapons, robots, people, the characters from the reference image, Genshin Impact items, fantasy objects, square icon tiles, colored backgrounds behind the objects, objects crossing cell borders, a different size between cells 5 and 6, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `cover-robos-famintos.png`: a capa

Cena inteira com o título escrito, como toda capa ([[capa-tem-titulo]]).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big rounded heads on tiny soft bodies, huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, small expressive mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing. NO white sticker keyline here (this is a full scene).

SUBJECT — a game cover, 16:9, 1280×720, full scene with a background. A cozy pastel "robot snack room" seen from the side. On the left, a cute wooden Y-shaped slingshot pulled back, about to launch a cute pastel-cream data cartridge with a tiny happy face (its front window shows a simple grid of colored squares). The cartridge leaves a short curved dotted trail. On the right, FOUR cute chibi robots standing on top of little towers built from pastel blocks, tall columns, wooden planks, barrels and wooden crates, at different heights, all with their WIDE mouths open, hungry and excited, looking at the cartridge:
- a lilac-lavender robot wearing big fluffy headphones;
- a peach-coral robot with a small camera on top of its head like a hat;
- a mint-green robot with big round glasses and a yellow pencil on its head;
- a sky-blue robot with a two-rod TV antenna with little balls on the tips.
Each robot has a big square head with very rounded corners, huge glossy eyes, pink blush, a small round body with an empty light belly screen, stubby arms and boot feet. Little sparkles in the air.

TITLE — at the top center, big rounded bubbly cartoon lettering that reads exactly: Robôs Famintos
(with the circumflex on the "ô"), cream-white letters with a warm dark-brown outline and a soft lilac drop shadow, easy to read, fully inside the image with margin on all sides. The title is the ONLY text in the image.

DO NOT INCLUDE: any other text, letters, numbers, logos or captions besides the title, misspelled title, missing accent on "Robôs", Angry Birds characters, red birds, green pigs, TNT crates, wooden towers being knocked down, humans, the characters from the reference image, Genshin Impact characters, red hats, eyepatches, fantasy items, weapons, scary or menacing robots, sharp teeth, square icon tiles, frames or borders around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, dark or gloomy lighting.
~~~

---

## 5. `bg-sala.png` (nova versão): a sala vazia, sem plataformas

**Pedido de 06/10/2026:** os mapas agora são montados com peças de cenário (§6), e cada fase
tem um arranjo diferente. Por isso o fundo não pode ter plataformas, móveis nem nada na metade
direita: só parede e chão. Mantenha a cara da sala entregue (parede azul de placas rebitadas,
canos pastel no alto e no rodapé, escotilha, cômoda com cacto, tapete coral, piso de lajotas).
**Anexe também o `bg-sala.png` entregue** (o original está em
`outputs/robos-famintos/bg-sala-original.png`), para manter a mesma sala.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — soft rounded shapes, thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing. NO white sticker keyline here (this is a full scene).

SUBJECT — the SAME cute pastel "robot snack room" as the second attached image, redrawn EMPTY, seen perfectly straight-on from the side like a 2D game level (flat side view, no perspective tilt, no ceiling). 16:9, 1672×941 (or 1280×720).
- Back wall: soft sky-blue riveted metal panels fading to pale cream near the top, exactly like the attached room.
- Pastel pipes (peach and blue with lilac joints) along the very top edge and a horizontal pipe along the bottom of the wall, like the attached room; a vertical pipe at the far right edge may stay.
- Floor: warm light-honey tiles in the lower 20% of the image; the wall meets the floor in a perfectly horizontal line at about 76% of the height.
- Far LEFT only: the round porthole window high on the wall, the low cabinet with a small potted cactus, and the round coral rug on the floor (exactly as in the attached room).
- The whole MIDDLE and RIGHT of the room (from 35% of the width to the right edge) stays COMPLETELY EMPTY: plain wall and plain floor, nothing standing, nothing hanging (game pieces will be placed there).
- Calm, light, low contrast in the upper and middle wall (things will fly across it).

DO NOT INCLUDE: platforms, steps, blocks, boxes, crates, shelves, tables, furniture or objects in the middle or right of the room, robots, characters, people, animals, birds, pigs, a slingshot, screens, posters, signs, any text, letters or numbers, Angry Birds characters, the characters from the reference image, fantasy decor, square icon tiles, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective lines converging, dark or gloomy lighting.
~~~

---

## 6. `cenario.png`: as peças de montar os mapas (novo)

Folha 1400 × 700, **fundo transparente**, 4 colunas × 2 linhas de células de 350 × 350. Cada
peça é um **retângulo visto de frente**, porque o jogo usa o próprio retângulo como colisão: o
desenho tem de **encher a caixa** indicada (cantos arredondados podem, mas nada saindo dela). O
jogo estica cada peça para o tamanho dela na tela, então **a proporção importa mais que o
tamanho**.

| célula | peça | caixa na célula (x, y, largura × altura) | proporção | na tela |
|---|---|---|---|---|
| 1 | bloco largo | 25, 140, 300 × 184 | 1,63 : 1 | 124 × 76 |
| 2 | coluna alta | 120, 16, 110 × 318 | 1 : 2,9 | 52 × 150 |
| 3 | tábua comprida | 10, 156, 330 × 39 | 8,5 : 1 | 220 × 26 |
| 4 | palco (bloco grande com tampa) | 20, 124, 310 × 200 | 1,55 : 1 | 170 × 110 |
| 5 | tambor | 85, 82, 180 × 242 | 1 : 1,35 | 58 × 78 |
| 6 | cano deitado | 10, 139, 330 × 73 | 4,5 : 1 | 200 × 44 |
| 7 | tijolinho | 45, 156, 260 × 168 | 1,55 : 1 | 62 × 40 |
| 8 | (vazia) | — | — | — |

O caixote continua vindo da célula 8 de `objetos.png`. Os robôs ficam **em cima** das peças:
bloco, palco, tábua e tijolinho precisam de um tampo plano.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — soft rounded shapes, thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

FORMAT — a sprite sheet of BUILDING PIECES for a 2D side-view game, 1400×700 px, TRANSPARENT background, a grid of 4 columns × 2 rows of 350×350 px cells. One piece per cell, seen perfectly FLAT from the FRONT (no perspective, no top face visible except a thin lid strip, no tilt). Each piece is a RECTANGLE that exactly FILLS the box given for its cell (x, y, width × height in pixels inside the cell); nothing sticks out of that box, no shadow on the ground, no grid lines, no background tiles. Cell 8 stays EMPTY (fully transparent). All pieces belong to the same cute pastel machine room (soft metal, light wood, rivets, pastel paint).

ROW 1
1. WIDE BLOCK — box 25,140, 300×184: a chunky soft pastel-lilac metal block with a cream lid strip on top, small round rivets in the corners.
2. TALL COLUMN — box 120,16, 110×318: a tall pastel-peach metal column with a cream cap on top and a cream foot band at the bottom, a few rivets down the front.
3. LONG PLANK — box 10,156, 330×39: a long flat light-honey wooden plank seen from the front, wood grain lines and two tiny nails at each end.
4. STAGE BLOCK — box 20,124, 310×200: a big chunky pastel-mint metal block with a thick cream lid on top and rivets, like a little stage.

ROW 2
5. BARREL — box 85,82, 180×242: a cute upright pastel sky-blue metal drum seen from the front, with two lilac metal bands and a flat top rim.
6. PIPE — box 10,139, 330×73: a horizontal pastel peach pipe segment seen from the side, with blue joint rings near both ends, round caps at the ends.
7. SMALL BRICK — box 45,156, 260×168: a small chunky pastel butter-yellow block with a cream lid strip and two rivets.
8. (empty)

DO NOT INCLUDE: faces on the pieces, characters, robots, people, animals, birds, pigs, Angry Birds characters, TNT crates, explosives, ice blocks, stone blocks, any text, letters, numbers or logos, perspective or 3D boxes showing a top face, tilted pieces, pieces smaller than their box, pieces crossing their box or the cell border, drop shadows, colored backgrounds behind the pieces, the characters from the reference image, Genshin Impact items, fantasy objects, weapons, square icon tiles, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `estilingue.png`: o estilingue de lado, em 2 camadas (novo)

**Pedido de 06/10/2026:** *"o estilingue deveria ter 2 camadas, e ser de ângulo de lado, e não de
frente"*. Como num jogo de estilingue visto de lado: as duas hastes aparecem uma atrás da outra,
um pouco afastadas, e o cartucho fica **entre** elas (a de trás atrás dele, a da frente na frente).
Por isso o estilingue vem em **duas camadas que se sobrepõem exatamente**. Anexe também o
`objetos.png` entregue, para a madeira e as faixas de menta saírem iguais.

Folha 1050 × 350, **fundo transparente**, 3 células de 350 × 350:

| célula | o quê | posição na célula |
|---|---|---|
| 1 | **camada de trás**: tronco + haste de TRÁS (a da direita, inclinada para a direita) | pé do tronco em (176, 330); forquilha em (176, 214); ponta da haste de trás em (214, 66) |
| 2 | **camada da frente**: SÓ a haste da FRENTE (a da esquerda), no lugar exato em que ela fica sobre a célula 1 | da forquilha (176, 214) até a ponta em (140, 78); todo o resto transparente |
| 3 | saquinho de couro visto de lado | centrado em (175, 175), ~120 × 80 |

Pondo a célula 2 por cima da 1, tem de sair o estilingue inteiro, sem degrau nem buraco na
forquilha. O elástico é feito pelo jogo: **não desenhe elástico**.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — soft rounded shapes, thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

FORMAT — a sprite sheet, 1050×350 px, TRANSPARENT background, 3 cells of 350×350 px in one row. No grid lines, no background tiles, no shadows on the ground. Match the light-honey wood and the soft mint wrapped bands of the slingshot in the second attached image.

The subject is a cute wooden Y-shaped SLINGSHOT seen FROM THE SIDE, like in a 2D side-view slingshot game: a short thick trunk standing upright, and the two prongs of the fork seen one behind the other — the BACK prong leans slightly to the right, the FRONT prong leans slightly to the left, both rising from the same fork point. Each prong has a soft mint band wrapped near its tip. About 270 px tall. NO rubber band, NO pouch on the slingshot.

CELL 1 — BACK LAYER: the trunk plus ONLY the BACK prong. The trunk stands with its foot at x 176, y 330 of the cell; the fork point is at x 176, y 214; the back prong goes from the fork up and slightly right to its tip at x 214, y 66. The back prong is a little darker (it is in the shade).
CELL 2 — FRONT LAYER: ONLY the FRONT prong, cut out at the fork, drawn in EXACTLY the position it has over cell 1: from the fork at x 176, y 214 up and slightly left to its tip at x 140, y 78. Everything else in the cell is transparent. Laid over cell 1 it must complete the slingshot seamlessly.
CELL 3 — POUCH: a small soft brown leather slingshot pouch seen from the side, like a little cup open to the right, centered at x 175, y 175, about 120×80 px.

DO NOT INCLUDE: a rubber band or elastic, a stone or object in the pouch, a front view or symmetrical Y seen from the front, two prongs side by side facing the viewer, hands, characters, birds, pigs, Angry Birds characters, robots, any text, letters, numbers or logos, colored backgrounds behind the pieces, pieces crossing the cell borders, the characters from the reference image, fantasy objects, weapons other than the toy slingshot, square icon tiles, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## Depois da entrega

1. Salvar os PNGs com **estes nomes exatos** na pasta de entrega.
2. Eu meço cada célula pelo canal alfa (caixa, pé, a tela da barriga, a janela do cartucho, peça
   que vaza para a vizinha). Se algo cruzar a borda ou mudar de lugar entre caras do mesmo robô,
   reempacoto a folha.
3. Ajusto `data/files.ts` (pé, tela e janela por quadro) e `data/layout.ts` (tampo das quatro
   plataformas, onde a arte deixou), sem regenerar. A validação da mira roda de novo com as
   posições novas.
