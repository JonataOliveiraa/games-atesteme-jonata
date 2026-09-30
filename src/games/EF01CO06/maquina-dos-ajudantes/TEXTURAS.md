# Máquina dos Ajudantes — texturas

Destino: `src/assets/games/EF01CO06/maquina-dos-ajudantes/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 aparelhos,
pessoas e rodadas, §13 textura × código).

A linha de arte é a **chibi de figurinha**, como no Balão e na Pescaria, com a
referência `references/19-chibi-figurinhas.jpg` **anexada em toda geração**
(*Dúvida 1* do plano). Cada prompt vem inteiro, pronto para copiar.

> **O elenco da referência entra no negativo.** Da folha de figurinhas sai só a
> técnica.

### Tabela de estilo — chibi de figurinha

| Critério | Contrato desta linha |
|---|---|
| Traço | limpo, uniforme, azul-marinho dessaturado; nunca preto puro |
| Cor | paleta curta, chapada, **um** tom de sombra, sem degradê |
| Olho | grande e brilhante, com um brilho forte |
| Silhueta | peça com alfa ganha **keyline branca fina**; fundo e capa não |
| Proporção | chibi: cabeça grande, corpo pequeno; tudo simples e legível pequeno |

**Paleta:** céu e quintal claros, casinha **creme e coral**, máquina **turquesa e
coral** com dourado. Os 4 aparelhos têm **cores diferentes** entre si:
despertador amarelo-sol, caixinha lilás, telefone coral, tablet azul-acinzentado.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-casinha.png` | — | — | 1280 × 720 | opaco | quintal, varal, bancada e a casinha com 2 quartos vazios |
| `maquina.png` | — | — | 640 × 980 | sim | a máquina de fichas (entra em escala 0,5) |
| `aparelhos.png` | 2 × 2 | 384 × 384 | 768 × 768 | sim | despertador, caixinha, telefone, tablet |
| `pessoas.png` | 5 × 3 | 384 × 576 | 1920 × 1728 | sim | 5 situações × antes, ajudada, engraçada |
| `pecas.png` | 3 × 3 | 256 × 256 | 768 × 768 | sim | presente, notas, ninar, coração, coelhinho, vovó, dedo |
| `cover-maquina-dos-ajudantes.png` | — | — | 1672 × 941 | opaco | capa, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`,
`data/devices.ts`).

**O insubstituível:** `pessoas.png`. A necessidade é a **situação desenhada**
(dormindo na cama, bebê chorando no berço, com a foto da vovó, bocejando), e
sem ela não há o que decidir.

## 2. Regras para toda a arte

- **Nenhum texto, número ou letra**, em lugar nenhum. O despertador não tem
  números, e o telefone não tem teclas numeradas. O "zzz" do sono é feito pelo
  código.
- **Simples.** Cada coisa se lê num olhar, por uma criança de 6 anos.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão desenhado
  (os móveis das pessoas **são** a base delas) e sem sombra caída.
- **Os aparelhos não têm rosto**, e ninguém aponta para nada.
- A **tela do tablet é lisa e vazia**, porque o coelhinho entra por código.
- As pessoas ficam **de frente ou em 3/4**, e não olham para um lado
  específico: o lado do quarto muda a cada rodada.

## 3. `bg-casinha.png` — 1280 × 720, opaco

| Região | O que tem |
|---|---|
| y 0–95 | céu calmo e liso (HUD) |
| **varal**, de (60, 100) a (640, 190) | um varal de corda entre dois postinhos, com **4 pregadores de madeira vazios** em x 140 / 280 / 420 / 560 |
| **lugar da máquina**, x 50–370, y 210–700 | **vazio**: grama e um pedaço de cerca baixa ao fundo |
| **bancada**, tampo em (520, 580), ~200 × 30 | uma mesinha baixa de madeira, com o tampo **vazio** |
| **casinha**, de (690, 110) a (1260, 700) | uma casinha em **corte**, como casa de bonecas: telhado coral em cima (y 110–260) e **2 quartos lado a lado, vazios**, A de (715, 270) a (970, 680) e B de (990, 270) a (1245, 680). As duas paredes têm o **mesmo papel de parede creme** liso, e o piso de madeira clara fica em y ≈ 680 |
| resto | quintal gramado, um céu azul-claro com 2 nuvens, flores pequenas |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create one opaque 1280 × 720 px, very simple and cheerful illustration of a sunny backyard, seen straight on. Preserve these exact functional regions: y 0–95 is a calm plain light-blue sky; a clothesline on a rope between two small posts runs from (60, 100) to (640, 190) with FOUR EMPTY wooden clothespins at x 140, 280, 420 and 560; the area x 50–370, y 210–700 is EMPTY — just grass and a low fence far behind — because a machine will stand there; one small low wooden table with an EMPTY top centred at (520, 580), about 200 px wide; on the right, a cute little house shown in CROSS-SECTION like a dollhouse, from (690, 110) to (1260, 700): a coral roof on top (y 110–260) and, below it, TWO EMPTY ROOMS side by side — room A from (715, 270) to (970, 680) and room B from (990, 270) to (1245, 680) — both with the SAME plain cream wallpaper and the same light wooden floor at about y 680, and absolutely nothing inside them. The rest is soft green grass, a few tiny flowers and two small clouds.

Composition and technical constraints: exact 16:9 canvas; straight-on view; all listed coordinates respected; the two rooms, the table top and the machine area stay completely empty and plain; the two rooms look identical; opaque; no white sticker keyline; no embedded user interface.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, children, babies, animals, furniture inside the rooms, beds, cribs, sofas, lamps, windows with scenery inside the rooms, pictures on the walls, devices, clocks, phones, tablets, speakers, machines, gifts, clothes on the clothesline, objects on the table, different wallpapers in the two rooms, text, letters, words, labels, digits, numbers, signs, captions, watermark, logo, title lettering, score, HUD, buttons, question mark, speech bubbles, arrows, icons, busy details, perspective view, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 4. `maquina.png` — 640 × 980, alfa

Uma máquina de fichas fofa, de parquinho, vista de frente. Entra em **escala
0,5**. As coordenadas abaixo são **na imagem**.

| Parte | Na imagem | O que tem |
|---|---|---|
| corpo | a imagem inteira, com ~3% de margem; a base encosta embaixo | gabinete arredondado **turquesa e coral**, borda dourada, luzinhas redondas no topo |
| **cúpula** | de (120, 90) a (520, 420) | uma cúpula de vidro com **3 presentes embrulhados** fechados dentro (coral, lilás, amarelo), sem nada que mostre o que há neles |
| **fenda** | centro (470, 520) | uma fenda dourada de ficha |
| **portinhola** | centro (500, 800), ~180 × 150 | portinhola **fechada**, embaixo à direita, com dobradiça em cima (ela abre para cima) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: single machine sprite for a Phaser 3 educational game.
Primary request: create ONE cute playground gift machine, seen perfectly straight on, on a transparent 640 × 980 px canvas, filling it with about 3% transparent margin; its base touches the bottom edge. A rounded chunky cabinet in turquoise and coral with golden trims and a row of small round lights on top. In canvas pixels: a round glass dome from (120, 90) to (520, 420) with THREE closed wrapped gift boxes inside (coral, lilac and sunny yellow, with ribbons) that give no hint of their contents; one golden coin slot centred at (470, 520); one small CLOSED hatch door centred at (500, 800), about 180 × 150 px, hinged at its top. The rest of the front is simple and quiet.

Composition and technical constraints: straight-on view; all listed coordinates respected; transparent background.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, buttons, joysticks, levers, screens, devices, clocks, phones, tablets, speakers, opened gifts, claw, candy, coins outside the slot, text, letters, words, labels, digits, numbers, price tags, captions, watermark, logo, title lettering, user interface, HUD, question mark, speech bubbles, arrows, background, floor, shadow on the canvas, perspective view, cropped machine, white backing, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 5. `aparelhos.png` — grade 2 × 2, célula 384 × 384

Aparelhos **de verdade**, fofos, sem rosto, reconhecíveis a 60 px (no varal)
e a 170 px (na bancada).

| Célula | id | Aparelho |
|---|---|---|
| 0 | `clock` | despertador **amarelo-sol** de 2 sininhos, com pezinhos; mostrador branco com **4 risquinhos** e 2 ponteiros, **sem números** |
| 1 | `speaker` | caixinha de som **lilás**, redondinha, com a tela de tecido na frente |
| 2 | `phone` | telefone de casa sem fio **coral**: o fone em pé na base, com botõezinhos **sem número** |
| 3 | `tablet` | tablet **azul-acinzentado** em pé, com a **tela clara lisa e vazia** |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact device sprite sheet for a Phaser 3 educational game for 6-year-olds.
Primary request: create ONE exact 2 columns × 2 rows sprite sheet on a transparent 768 × 768 px canvas. Every cell is exactly 384 × 384 px. Each device is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. The devices are cute but REAL, instantly recognizable at 60 px, with NO faces, the same visual weight and about the same size, and each has its own colour.

Exact cells, left to right and then top to bottom:
0. clock — one SUNNY-YELLOW twin-bell alarm clock on little feet, a white face with only four small tick marks and two hands, NO numbers.
1. speaker — one small LILAC round portable speaker with a fabric grille on the front.
2. phone — one CORAL cordless home phone: the handset standing in its base, with small plain round keys and NO numbers.
3. tablet — one BLUE-GREY tablet standing upright, rounded corners, with a PLAIN, FLAT, completely EMPTY light screen.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, faces or eyes on the devices, pictures on the screen, numbers on the clock, numbers on the keys, smartphones, headphones, cables, sound waves, music notes, extra devices, hands, people, text, letters, words, labels, digits, numbers, brand logos, captions, watermark, logo, title lettering, user interface, panels, frames, speech bubbles, arrows, icons, HUD, question mark, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 6. `pessoas.png` — grade 5 × 3, célula 384 × 576

Cada célula é **o conteúdo de um quarto**: a pessoa **e os móveis dela**. Os pés
dos móveis ficam em **y = 560** em todas as células, e o conjunto fica dentro
de ~340 × 520. O quarto é pintado no fundo, e a célula entra em escala ~0,66.

| Col. | id | Quem e os móveis |
|---|---|---|
| 0 | `sleeper` | menino de pijama azul-claro numa **caminha** de madeira, com travesseiro e cobertor |
| 1 | `baby` | **bebê** de macacão amarelo-claro dentro de um **berço** de grades brancas |
| 2 | `missing-grandma` | menina de trancinhas num **sofazinho** verde-água, segurando um **porta-retrato com a vovó** (coque branco, óculos redondos, xale coral) |
| 3 | `bored` | menino de boné verde-água, jogado numa **poltrona** coral |
| 4 | `party` | **3 crianças** de chapéu de festa, lado a lado, com 2 balões atrás (só o treino e o N2) |

| Linha | Estado | Como cada um fica |
|---|---|---|
| 0 — antes | a necessidade | dormindo de boca aberta · chorando com lagriminhas de desenho · olhando a foto com saudade (sobrancelhas tristinhas) · bocejando enorme, largado · as 3 paradas, de braços caídos, sem graça |
| 1 — ajudada | resolvido | sentado na cama, espreguiçando, feliz · dormindo sorrindo, com o polegar na boca · rindo e acenando, com a foto no colo · rindo muito, com as mãos na barriga · as 3 dançando |
| 2 — engraçada | não resolveu | dormindo **mais**, babando, com uma bolha no nariz · chorando **mais alto**, com a boca enorme e as lágrimas espirrando (engraçado, não triste) · confusa, cabeça de lado · confuso, cabeça de lado · as 3 tapando os ouvidos e rindo |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions, big head and little body; tiny cartoon emotion marks only where asked; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact character-with-furniture sprite sheet for a Phaser 3 educational game for 6-year-olds; each cell is the content of one small room.
Primary request: create ONE exact 5 columns × 3 rows sprite sheet on a transparent 1920 × 1728 px canvas. Every cell is exactly 384 × 576 px (portrait). Each cell shows one character together with their own furniture, complete, isolated and centred, fitting inside about 340 × 520 px with transparent margin, INCLUDING its keyline. The bottom of the furniture rests at local y = 560 in EVERY cell. Nothing may cross a cell boundary. No drawn grid, border, wall or floor. Characters face the viewer or three-quarter view, never point at anything, and never look strongly to one side.

Columns (the same character and furniture in all three rows of a column):
Column 0 — sleeper: a small boy in light-blue pyjamas in a small wooden bed with a pillow and a blanket.
Column 1 — baby: a baby in a pale-yellow onesie inside a crib with white bars.
Column 2 — missing-grandma: a girl with little braids sitting on a small aqua-green sofa, holding a framed photo of her grandma (a sweet grandmother with a white hair bun, round glasses and a coral shawl, visible inside the frame).
Column 3 — bored: a boy in an aqua-green cap slumped in a coral armchair.
Column 4 — party: three small children in party hats standing side by side with two balloons behind them.

Rows:
Row 0 — before (the need): the boy sleeps with his mouth open; the baby cries with cartoon tears; the girl looks at the photo with wistful, missing-someone eyebrows; the boy yawns hugely, slumped; the three children stand still, arms hanging, bored.
Row 1 — helped (solved): the boy sits up in bed stretching, happy; the baby sleeps smiling with a thumb in the mouth; the girl laughs and waves, the photo in her lap; the boy laughs hard holding his belly; the three children dance.
Row 2 — funny (not solved): the boy sleeps EVEN deeper, drooling, with a snot bubble; the baby cries even louder with a huge open mouth and tears squirting out comically, funny not sad; the girl tilts her head, puzzled; the boy tilts his head, puzzled; the three children cover their ears, laughing.

Consistency constraints: within each column all three rows show the IDENTICAL character and furniture with the same proportions, colours and scale; only pose and expression change; furniture bottoms line up at local y = 560 in all fifteen cells.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, devices, clocks, alarm clocks, phones, tablets, speakers, TVs, headphones, extra people, animals, walls, floors, windows, room backgrounds, pointing hands, speech bubbles, thought bubbles, question marks, the letter Z, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, arrows, icons, HUD, scary or truly sad crying, angry faces, drop shadow on the cell, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 7. `pecas.png` — grade 3 × 3, célula 256 × 256

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `gift` | caixa de presente **coral** com laço **turquesa**, fechada |
| 1 | `notes-party` | 2 notas musicais coloridas, pulando (música animada) |
| 2 | `notes-lullaby` | uma **lua crescente** sonolenta com uma nota musical lilás (música de ninar) |
| 3 | `heart` | coração coral |
| 4 | `bunny` | um **coelhinho de desenho animado** pulando, de corpo inteiro (vai na tela do tablet) |
| 5 | `grandma-face` | o **rostinho da vovó** sorrindo (a mesma do porta-retrato) dentro de um círculo (sai do telefone) |
| 6 | `guide-hand` | mãozinha chibi no ângulo de `references/mao-toque-angulo.png` |
| 7–8 | — | vazias |

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. The second attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 6.

Use case: stylized-concept
Asset type: exact game-pieces sprite sheet for a Phaser 3 educational game for 6-year-olds.
Primary request: create ONE exact 3 columns × 3 rows sprite sheet on a transparent 768 × 768 px canvas. Every cell is exactly 256 × 256 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

Exact cells, left to right and then top to bottom:
0. gift — one closed coral gift box with a turquoise ribbon and bow.
1. notes-party — two bouncy colourful musical notes, lively.
2. notes-lullaby — one sleepy crescent moon with closed eyes and one small lilac musical note beside it.
3. heart — one coral heart.
4. bunny — one cute cartoon bunny jumping, full body, like a character from a kids' cartoon.
5. grandma-face — the smiling face of a sweet grandmother with a white hair bun, round glasses and a coral shawl, inside a round frame.
6. guide-hand — use references/mao-toque-angulo.png ONLY as the angle and silhouette reference. Create one cute light-brown childlike chibi hand with the same dark uniform outline, one-tone flat cel shading and white sticker keyline as the other cells. The index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT; its tip is crisp and clearly the touch point. The other THREE fingers fold into distinct descending steps on the RIGHT; the THUMB folds inward across the palm; the short bare wrist descends toward the LOWER RIGHT. Exactly five digits. No click lines, no face, no sleeve.
7, 8. completely EMPTY and genuinely transparent reserved cells.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, devices, clocks, phones, tablets, speakers, screens, opened gift, extra objects, extra hands, extra fingers, missing fingers, click lines, radiating lines, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, panels, frames other than the round frame in cell 5, arrows, HUD, question mark, objects in cells 7 and 8, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, crying, angry faces, pointing at the viewer.
~~~

## 8. `cover-maquina-dos-ajudantes.png` — 1672 × 941, opaco

Na capa, a máquina de presentes no quintal, com a portinhola aberta e um
presente estourando em confete, de onde sai o **despertador tocando**. À
direita, a casinha em corte: o menino **acorda feliz** na caminha. Em cima vai o
título `Máquina dos Ajudantes`. Anexe a referência `19` e as folhas aprovadas.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover, not a sticker.
REFERENCES — THE OTHER ATTACHED IMAGES (maquina.png, aparelhos.png, pessoas.png) ARE THE MACHINE, DEVICE AND CHARACTER REFERENCES: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Máquina dos Ajudantes”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Máquina dos Ajudantes” in large chunky rounded playful multicolour letters with a thick dark outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly three words, letter for letter, with capitalization and the accent exactly: M-á-q-u-i-n-a [space] d-o-s [space] A-j-u-d-a-n-t-e-s. The “á” in “Máquina” MUST carry its acute accent. No extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, in a sunny backyard: on the left, the cute turquoise-and-coral gift machine with its glass dome of wrapped gifts; its hatch is open and a coral gift box is bursting open in confetti, revealing the sunny-yellow alarm clock ringing with little ring lines. On the right, a cute dollhouse-style cross-section of a small house: in one room, the boy in light-blue pyjamas sits up in his bed stretching happily, just woken up. Make "open the surprise, see what it does, and it helps someone" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; machine, clock and boy large beneath it and fully visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, other people, animals, extra words, misspelled title, missing accent, subtitle, punctuation, numbers, the letter Z, labels, captions, signs with writing, watermark, logo, score, HUD, question mark, speech bubbles, arrows, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped machine, cropped house, sad faces, angry faces.
~~~

## 9. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades: `aparelhos` 768 × 768, `pessoas` 1920 × 1728 (célula 384 × 576),
  `pecas` 768 × 768; o corte medido na folha inteira, sem peça cruzando célula;
- `bg-casinha`: os **2 quartos vazios e iguais**, a bancada e a área da máquina
  vazias, e os 4 pregadores nos x do §3;
- `maquina`: a fenda e a portinhola onde o §4 diz (registrar as posições reais);
- os aparelhos reconhecíveis a **60 px**, sem rosto e sem números; a tela do
  tablet lisa;
- `pessoas`: a base dos móveis em y = 560 nas 15 células; a necessidade lida
  **num olhar** na linha 0 (dormindo, chorando, com saudade, entediado); o choro
  do bebê engraçado, nunca assustador;
- `tipX`/`tipY` do dedo medidos;
- a grafia do título da capa, **com o acento de "Máquina"**.
