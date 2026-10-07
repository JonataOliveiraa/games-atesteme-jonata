# Ponte do Verdadeiro — texturas

Pasta de entrega: `src/assets/games/EF03CO01/ponte-do-verdadeiro/`

**Anexe em toda geração as três imagens:** `references/muse dash style.jpeg`,
`references/muse dash style 2.jpg` e `references/muse dash style 3.png`.

O jogo roda sem nenhum PNG: cada arquivo abaixo tem um desenho de reserva em `Graphics`, na
mesma grade (`scenes/fallback.ts`). Quando chega um PNG com o nome certo, ele toma o lugar do
desenho. Depois disso, meço a arte e ajusto as posições.

## A linha de arte: Muse Dash (linha nova)

| | Chibi de figurinha (`19`) | Chibi de ícone (`33`) | Pop chapado (`30–32`) | **Muse Dash** |
|---|---|---|---|---|
| traço | escuro dessaturado, uniforme | marrom quente e fino | marinho, uniforme | **índigo/violeta escuro, fino a médio; a linha puxa para um tom mais escuro da cor que ela cerca** |
| cor | chapada, 1 tom de sombra | sombra macia com degradê leve | 100 % chapada | **chapada com 1 tom de sombra; degradê só no cabelo, nos olhos e nos brilhos** |
| olho | enorme, 1 brilho | íris em degradê, 2–3 brilhos | amendoado | **enorme, íris em degradê, vários brilhos coloridos (rosa e ciano)** |
| proporção | cabeça grande | cabeça ≈ metade | esguia | **chibi, cabeça grande e pose cheia de energia** |
| paleta | curta, 1 destaque | pastel quente | bala | **neon doce: rosa-choque, água/ciano, lavanda, violeta, amarelo-limão sobre lavanda/índigo** |
| enfeite | marcas de emoção | brilhinhos de 4 pontas | estrelas de 4 pontas | **estrelas de 5 pontas com contorno duplo, brilhos de 4 pontas, retícula leve nos fundos** |
| keyline branca | sim | não | não | **não** |

**O elenco da referência vai para o negativo.** As imagens são de um jogo de ritmo com meninas
anime: uma de maria-chiquinha verde-água ao estilo Hatsune Miku, uma bruxinha loira de chapéu
grande e duas atendentes de bar. Há também copo de drinque, garrafas, palco, plateia, roupas
curtas, botas e salto alto, além do texto de copyright "© CFM ©2017-2023 peropero Ltd." no
canto. O gerador copia tudo isso se ninguém proibir. Aqui o elenco é de **bichinhos mascote**,
redondos e kawaii, como os bichinhos de fundo da imagem do bar.

## O que é PNG e o que fica em código

| PNG (este arquivo) | `Graphics` (sempre) |
|---|---|
| fundo (margens, riacho, torre com polia, guarita), tábua da ponte, placa vazia, alavanca em cima e embaixo, cadeado, sapo, coelho e pato nos 4 estados, castor em 4 poses, capa | texto da placa, carimbos VERDADE / FALSO, correntes, brilho de "dá para tocar", pop de estrelinhas, ondinhas, anel laranja do erro, balões, rótulo ABRIR, HUD, fichas do fim, cortina de estrela |

## Arquivos

| Arquivo | Tamanho | Grade | Obrigatório? |
|---|---|---|---|
| `bg-riacho.png` | 1280 × 720 | — | sim |
| `ponte.png` | 1280 × 960 | 2 faixas de 1280 × 320 + 4 células de 320 | sim |
| `bichinhos.png` | 1280 × 1280 | 4 × 4 células de 320 | sim (**insubstituível**: os estados são a mecânica) |
| `cover-ponte-do-verdadeiro.png` | 1280 × 720 | — | sim (capa do catálogo) |

Os três níveis usam a mesma arte. O que muda é a frase e a coisa da vez.

**Elenco e coisas (igual em todos os prompts):**
- **Sapo**: redondo e gordinho, verde-limão com barriga amarelo-clara, dois olhos grandes no alto
  da cabeça, bochecha rosa, em pé sobre perninhas curtas.
- **Coelho**: redondo, branco com sombra lavanda, orelhas compridas com o miolo rosa (uma um
  pouco dobrada), nariz rosa, rabinho de algodão.
- **Pato**: patinho redondo amarelo-limão, bico e pés laranja, um topetinho.
- **Castor** (o guarda da ponte): gordinho, marrom, focinho creme, dois dentões, rabo chato
  escuro, colete menta com uma estrelinha e um apito no pescoço. **Sem chapéu**, porque chapéu é
  uma das coisas do jogo.
- **Chapéu**: chapéu de palha redondo, amarelo-claro, com fita rosa-choque e uma estrelinha.
- **Guarda-chuva**: aberto, azul-água com estrelinhas brancas, erguido acima da cabeça.
- **Balão**: redondo, rosa-choque com brilho, num barbante branco preso na mão.

---

## 1. `bg-riacho.png` — a margem, o riacho e a guarita

O palco, visto de lado, como num jogo de plataforma. **A ponte não entra**, porque ela gira e vem
da `ponte.png`. A placa, os bichinhos, o castor e a alavanca também ficam de fora, então os
lugares deles têm de sair **vazios**.

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only in skies, water and glows; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow — over soft lavender; decorations of five-point stars with a double outline, four-point sparkles and soft glow; a light halftone-dot texture only in large background areas. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing. NO white sticker keyline here — this is a full scene, not a sticker.

SUBJECT — a side-view 2D game stage (flat front elevation, like a platform game, no perspective tilt), 16:9, 1280×720: a dreamy candy-colored riverside in the daytime.
- Sky: soft lavender at the top fading to pale pink near the horizon; a few puffy pastel clouds ONLY in the top-left and top-right corners; tiny four-point sparkles; light halftone dots.
- Far background: low rounded hills in lavender and mint, a few round lollipop-shaped trees, all soft and low-contrast.
- NEAR BANK (left): fresh mint-aqua grass from the left edge to 47% of the width; its flat top is a perfectly horizontal line at 82% of the height; small pink, yellow and white flowers along the front edge and in the far-left corner; the bank ends at 47% with a rounded edge of soft violet-brown earth dropping into the water.
- RIVER (from 47% to 77% of the width): an open gap with sparkling aqua-cyan water, its surface at 88% of the height, gentle ripples, little sparkles and two small lily pads; the earth walls of both banks visible down to the water.
- FAR BANK (from 77% to the right edge): the same grass at the same height (82%). At its left edge (77%) a sturdy rounded stone pier where a drawbridge hinge will attach. Just behind the pier, a tall slim wooden tower post rising up to 28% of the height, with a round pulley wheel at the top. Further right, a cute small guard booth: a little wooden hut with a lavender roof, a yellow star on top, a round window and an open doorway, standing between 84% and 99% of the width; flower bushes at its base.
- KEEP THESE AREAS EMPTY AND PLAIN: the sky band from 12% to 34% of the height between 7% and 66% of the width (a sign will be placed there, so no clouds or trees there); the near-bank grass from 4% to 45% of the width (three characters will stand there); the whole gap over the river (a bridge will be placed there); the ground in front of the booth between 80% and 98% of the width (a beaver and a lever will be placed there).
- Bright, cheerful, calm and uncluttered, so the characters and the bridge placed on top stand out.

DO NOT INCLUDE: any bridge, planks over the water, a drawbridge, chains, a signboard, a lever, any characters, people, animals, frogs, rabbits, ducks, beavers, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch with a big hat, bartender girls, anime idol girls, a bar, cocktails, bottles, glasses, a concert stage, stage lights, crowd silhouettes, microphones, music notes, night scene, neon city, copyright text, ©, logos, watermarks, signatures, @handles, website names, any text, letters or numbers, frames around the picture, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective ground lines converging.
~~~

---

## 2. `ponte.png` — a ponte, a placa, a alavanca e o cadeado

Folha 1280 × 960, **fundo transparente**, em três faixas:

| Faixa | Altura | Conteúdo |
|---|---|---|
| 1 | y 0–320, largura toda | a **tábua da ponte levadiça**, deitada, vista de lado |
| 2 | y 320–640, largura toda | a **placa vazia**, de frente |
| 3 | y 640–960, 4 células de 320 | alavanca **em cima** · alavanca **embaixo** · cadeado · (vazia) |

Regras de forma das quais o jogo depende:
- a tábua fica **perfeitamente horizontal**, com o **anel da corrente na ponta esquerda** e o
  **disco da dobradiça na ponta direita**. O jogo gira a tábua em torno desse disco;
- a placa **sem nenhuma letra**: o texto é escrito pelo jogo;
- as duas alavancas com **a mesma base, no mesmo tamanho e no mesmo lugar**. Só o cabo muda.

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only on glossy highlights and glows; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; decorations of small five-point stars with a double outline and four-point sparkles. Take ONLY the art style: do NOT copy their characters, outfits, poses, scenes, logos or framing.

FORMAT — a sprite sheet of OBJECTS, 1280×960 px, TRANSPARENT background, arranged in three horizontal bands. Every object fully inside its own area with at least 16 px of empty margin, nothing crossing into another area, no grid lines, no background tiles, no cast shadows on the ground.

BAND 1 (top, y 0–320, the full 1280 width): ONE object — the deck of a cute wooden drawbridge lying PERFECTLY HORIZONTAL, seen exactly from the side, centered in the band, about 1050 px long. The deck is about 60 px thick, made of planks painted soft lavender with violet plank seams; on top of it runs a low cute railing about 90 px tall: round wooden posts with tiny yellow star knobs and a hot-pink rope railing between them. At the LEFT end of the deck, a round metal ring sticking up (where a chain is attached). At the RIGHT end, a big round metal hinge disk with a star-shaped bolt in its center.

BAND 2 (middle, y 320–640, the full 1280 width): ONE object — a wide EMPTY signboard seen perfectly from the front, centered, about 1100×250 px: a rounded-rectangle board with a plain smooth cream face (completely empty), a thick lavender wooden frame with a candy-pink inner trim, a small glossy yellow star badge on the top center of the frame, and two tiny four-point sparkles at opposite corners. Flat, front-facing, no posts, no ropes.

BAND 3 (bottom, y 640–960): four cells of 320×320, one object per cell, centered, standing on an invisible baseline about 20 px above the bottom of the cell.
1. LEVER UP: a cute lever on a small rounded box base (mint green with a hot-pink stripe and a tiny star), its metal handle pointing UP and slightly to the left, topped with a big round glossy hot-pink knob. About 200 px tall in total.
2. EXACTLY the same lever, same base, same size and same position, but the handle pulled DOWN to the right, the knob low.
3. A big cute padlock, closed, lemon-yellow body with a violet shackle and a star-shaped keyhole, glossy highlight. About 140 px tall. No face.
4. (empty — leave this cell fully transparent)

DO NOT INCLUDE: any text, letters, numbers or logos (not on the signboard, not on the lever), chains, characters, animals, hands, the characters from the reference images, Hatsune Miku, a blonde witch with a big hat, bartender girls, anime girls, cocktails, bottles, a stage, microphones, music notes, a tilted or curved bridge, a bridge with water or ground under it, a sign with posts or ropes, objects crossing their area, objects cut by the edge, different bases between the two levers, copyright text, ©, watermarks, signatures, @handles, website names, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 3. `bichinhos.png` — sapo, coelho, pato e o castor (insubstituível)

Folha 1280 × 1280, **fundo transparente**, 4 × 4 células de 320 × 320.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **sapo** | sem nada | de chapéu | com guarda-chuva | com balão |
| **coelho** | sem nada | de chapéu | com guarda-chuva | com balão |
| **pato** | sem nada | de chapéu | com guarda-chuva | com balão |
| **castor** | acenando, falando | comemorando | preocupado | apontando ← |

Regras de forma das quais o jogo depende:
- em cada uma das linhas de 1 a 3, o bichinho é **o mesmo nas 4 células**: mesmo tamanho,
  corpo, rosto, lugar e pé. **Só a coisa entra**, e no máximo o braço que a segura se mexe. O
  jogo troca de quadro no toque, e qualquer diferença no corpo vira um "pulo";
- corpo do bichinho com ≈ 190 px de altura e pés numa linha ≈ 20 px acima do pé da célula. O
  guarda-chuva e o balão podem subir até ≈ 16 px do topo da célula;
- o chapéu, o guarda-chuva e o balão são **iguais nos três bichinhos**: é a mesma coisa;
- bichinhos virados três-quartos para a **direita**, para a ponte. O castor, com ≈ 230 px, fica
  virado três-quartos para a **esquerda**, olhando para eles.

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only in eyes and glossy highlights; huge glossy eyes with gradient irises and several bright colored highlights (pink and cyan), small blush, tiny expressive mouths; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; small four-point sparkles as decoration. Here the characters are ROUND KAWAII MASCOT ANIMALS (like the small mascot creatures in the background of the bar reference), NOT people. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing.

FORMAT — a character sprite sheet, 1280×1280 px, TRANSPARENT background, a grid of 4 columns × 4 rows of 320×320 px cells. One full-body character per cell, centered, fully inside its cell with at least 16 px of empty margin, nothing crossing into another cell, no grid lines, no background tiles, no cast shadows. All feet rest on the same invisible baseline about 20 px above the bottom of each cell.

THE THREE ANIMALS (rows 1–3), each about 190 px tall (body only), standing upright, turned three-quarters to the RIGHT, calm happy face:
- FROG: round and chubby, lime green with a pale-yellow belly, two big glossy eyes on top of the head, pink blush, tiny smile, short legs, small hands.
- BUNNY: round, white with lavender shading, long upright ears with pink inner ears (one ear slightly bent), pink nose, cotton tail.
- DUCKLING: round, lemon yellow, orange beak and feet, a small tuft of feathers on the head.

THE THREE ITEMS, IDENTICAL on every animal:
- HAT: a round straw sun hat, pale yellow, with a hot-pink ribbon band and a tiny star.
- UMBRELLA: an OPEN aqua-cyan umbrella with small white stars, held up above the head with one hand.
- BALLOON: a round glossy hot-pink balloon on a white string held in one hand, floating above the head.

In each of rows 1–3 the animal is EXACTLY THE SAME in all four cells — same size, same body, same face, same position, same feet — only the item is added (only the arm holding the item may move). The umbrella and the balloon may rise above the head up to about 16 px from the top of the cell.

ROW 1 — FROG: 1 with nothing · 2 wearing the HAT · 3 holding the open UMBRELLA · 4 holding the BALLOON.
ROW 2 — BUNNY: 5 with nothing · 6 wearing the HAT (sitting between the ears) · 7 holding the open UMBRELLA · 8 holding the BALLOON.
ROW 3 — DUCKLING: 9 with nothing · 10 wearing the HAT · 11 holding the open UMBRELLA · 12 holding the BALLOON.

ROW 4 — BEAVER, the friendly bridge keeper, about 230 px tall, turned three-quarters to the LEFT: chubby brown beaver, cream muzzle, two big front teeth, flat dark-brown tail, a mint-green vest with a small yellow star badge, a little whistle on a string around the neck, NO hat.
13. Waving with one paw raised, mouth open as if talking, friendly.
14. Celebrating: both arms up, eyes closed in happy arcs, big open smile, little sparkles around.
15. Worried: both paws on the cheeks, eyebrows raised, one blue sweat drop.
16. Pointing to the LEFT with one arm stretched out, the other paw on the hip, kind smile.

DO NOT INCLUDE: people, humans, anime girls, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch with a big witch hat, bartender girls, idols, headphones, captain hats, hats on the beaver, any hat other than the straw sun hat, closed umbrellas, more than one balloon, different items between animals, different body sizes or poses inside the same row, suggestive poses, revealing clothes, high heels, boots, cocktails, bottles, a stage, microphones, music notes, scenery, ground, grass, water, extra characters, colored backgrounds behind the characters, characters crossing cell borders, characters cut by the cell edge, copyright text, ©, watermarks, signatures, @handles, website names, any text, letters or numbers, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `cover-ponte-do-verdadeiro.png` — capa

16:9, cena inteira, **com o título escrito** ([[capa-tem-titulo]]).

### Prompt copiável

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: Muse Dash–like cute chibi anime game art; clean lineart of thin-to-medium weight in dark indigo/violet (never pure black), the lines taking a darker shade of the color they surround; flat cel shading with one hard-edged shadow tone, soft gradients only in sky, water, eyes and glows; huge glossy eyes with gradient irises and several bright colored highlights; candy-neon palette — hot pink, aqua/cyan, lavender, violet, lemon yellow; five-point stars with a double outline, four-point sparkles, soft glow and light halftone dots in the background. Here the characters are ROUND KAWAII MASCOT ANIMALS, not people. Take ONLY the art style: do NOT copy their characters, outfits, hairstyles, poses, scenes, logos or framing. NO white sticker keyline here — this is a full cover, not a sticker.

SUBJECT — the cover of a children's game, 16:9, 1280×720, a full scene seen from the side.
- A dreamy candy riverside in the daytime: lavender-to-pink sky, mint-aqua grass with pink and yellow flowers on both banks, sparkling aqua-cyan water in between.
- A cute wooden drawbridge with lavender planks and a hot-pink rope railing is LOWERED across the river, its chains running up to a slim tower with a pulley on the right bank.
- Three round kawaii mascot animals hop happily across the bridge from left to right: a chubby lime-green FROG wearing a pale-yellow straw sun hat with a pink ribbon, a white-and-lavender BUNNY holding a glossy hot-pink balloon, and a lemon-yellow DUCKLING holding an open aqua umbrella with white stars.
- On the right bank, next to a little guard booth with a lavender roof, a chubby brown BEAVER in a mint-green vest with a whistle (no hat) cheers with both arms up beside a cute lever with a pink knob.
- Above the bridge floats an empty cream signboard with a lavender frame and a big glowing mint-green check mark on it.
- Stars with double outlines and sparkles burst around the scene.
- TITLE at the top center, big and readable: "Ponte do Verdadeiro" in chunky rounded bubble letters, white fill, a hot-pink outline with an outer aqua outline, a soft violet drop shadow and a small yellow star on the first letter. Spell it EXACTLY: P-o-n-t-e d-o V-e-r-d-a-d-e-i-r-o.
- Bright, cheerful, uncluttered, the animals large in the frame.

DO NOT INCLUDE: any other text besides the title, misspelled title, extra letters, subtitles, letters on the signboard, people, humans, anime girls, the characters from the reference images, Hatsune Miku, teal twin-tails, a blonde witch with a big hat, bartender girls, idols, a bar, cocktails, bottles, a concert stage, crowd silhouettes, microphones, music notes, night scene, a hat on the beaver, a raised or broken bridge, red X marks, copyright text, ©, logos, watermarks, signatures, @handles, website names, frames around the picture, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, dark or gloomy lighting.
~~~

---

## Depois da entrega

1. Salvar os PNGs com **estes nomes exatos** na pasta de entrega.
2. Medir antes de encaixar ([[padrao-remake-jogo]]):
   - a folha inteira por colunas, para ver se algo vaza de uma célula para outra (o guarda-chuva
     e o balão são os suspeitos). Se vazar, reempacotar;
   - por célula: caixa alfa, pé e pivô;
   - na tábua: a ponta da dobradiça e o anel;
   - no fundo: a borda das duas margens, a pilastra e a polia.
3. Ajustar `data/files.ts` (pé, escala e pivô por quadro) e `data/layout.ts` (o vão do riacho
   decide o comprimento da tábua; a dobradiça vai na pilastra; as correntes saem da polia) à
   arte, sem regenerar.
4. Se o corpo do bichinho mudar entre as células da mesma linha, ancorar pela base da célula, e
   não pela caixa alfa (é um objeto de vários quadros). Se mudar demais, pedir só aquela linha de
   novo.
