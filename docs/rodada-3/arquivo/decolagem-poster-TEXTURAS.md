# Decolagem Passo a Passo — texturas

Destino: `src/assets/games/EF01CO03/decolagem-passo-a-passo/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 adesivos e pôsteres, §13 textura × código).

A linha de arte é **vetor de conto**, da imagem que o usuário mandou:
`references/28-vetor-de-conto-a.jpg`, **anexada em toda geração**. É a mesma
linha do *Canteiro de Obras* (`EF15CO04`). Cada prompt abaixo vem inteiro
(estilo + corpo + negativo), pronto para copiar.

> **O elenco da referência entra no negativo.** A imagem é um par de elfos, e é
> exatamente o que o gerador copia se ninguém proibir. Daqui sai só a técnica.

### Tabela de estilo — vetor de conto

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Contorno | médio, uniforme, **sempre um tom mais escuro e mais saturado da cor que ele cerca**; nunca preto | chibi de figurinha (azul-marinho) e traço chapado (preto) |
| Sombra | cel shading de **um tom** + um degradê macio por dentro das formas grandes | chibi (sem degradê) e rabisco (sem cor) |
| Olho | grande, íris colorida, um brilho branco | chibi de rabisco (emote) |
| Silhueta | o próprio contorno colorido; **sem keyline branca** | chibi de figurinha |
| Forma e paleta | roliça, sem canto vivo; terrosa: folha, ardósia, castanho, terracota, areia, creme | vetor geométrico (saturado, sem contorno) |

**A exceção deste jogo: os adesivos têm borda branca.** Não é a keyline do
estilo: é o **corte do adesivo**, uma borda branca grossa e lisa em volta de cada
um, e é ela que faz a peça parecer adesivo. Só a `adesivos.png` tem essa borda
(*Dúvida 3* do plano).

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `adesivos.png` | 3 × 3 | 384 × 384 | 1152 × 1152 | sim | os 9 adesivos do N1 |
| `robo.png` | 3 × 2 | 384 × 384 | 1152 × 768 | sim | o robô-ajudante: 6 poses |
| `pecas.png` | 2 × 2 | 320 × 320 | 640 × 640 | sim | foguete da base, chama, dedo do guia |
| `bg-base.png` | — | — | 1280 × 720 | opaco | base espacial com o pôster vazio, a moldura do modelo, a fita, a cartela e a plataforma |
| `cover-decolagem-passo-a-passo.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`,
`data/stickers.ts`). Se trocar uma célula, avise o Ferro e a Brasa.

O modelo, as miniaturas da fita e as silhuetas-fantasma **não têm arquivo**:
são os próprios adesivos em outra escala ou tingidos.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. O letreiro SEU ALGORITMO!
  e os números da fita são texto do jogo.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha.
- **Cada adesivo é desenhado INTEIRO**, mesmo a parte que vai ficar tapada no
  pôster: o que fica na frente muda com a ordem, então nenhum pedaço pode faltar.
- **Os 9 adesivos têm o mesmo peso visual**: mesma borda branca, mesmo brilho,
  mesma saturação. Nenhum pode parecer "o primeiro" ou "o especial".
- Os adesivos são **grandes e simples**, para lerem a ~90 px na fita e na cartela,
  e para a sobreposição ficar óbvia no pôster.
- O fundo do pôster (no `bg-base`) é **azul-escuro liso**; os adesivos são claros
  e quentes, para saltarem dele.

## 3. `adesivos.png` — grade 3 × 3, célula 384 × 384

| Célula | id | Adesivo | Pôster |
|---|---|---|---|
| 0 | `planet` | planeta redondo terracota com 3 crateras e um brilho | Decolagem (atrás) |
| 1 | `rocket` | foguete **em pé**, creme e terracota, janelinha redonda, 3 aletas, **sem chama** | Decolagem (meio) |
| 2 | `smoke` | nuvem gorda de fumaça, cinza-creme, 4 ou 5 bolotas | Decolagem (frente) |
| 3 | `moon` | lua grande cor de areia, cheia de crateras, **sem rosto** | Astronauta (atrás) |
| 4 | `astronaut` | astronauta criança de corpo inteiro, de frente, braço direito estendido com a mão aberta, rosto visível no capacete | Astronauta (meio) |
| 5 | `flag` | bandeirinha lisa verde-folha num mastro curto (sem símbolo) | Astronauta (frente) |
| 6 | `crater` | cratera larga vista de lado, uma tigela rasa de rocha cinza-areia | Base Lunar (atrás) |
| 7 | `module` | módulo lunar de quatro pernas, ardósia e creme, com uma porta redonda | Base Lunar (meio) |
| 8 | `ladder` | escadinha de 4 degraus, dourada, levemente inclinada | Base Lunar (frente) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/28-vetor-de-conto-a.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, sand, cream; where there are eyes, they are big and expressive with a coloured iris and one white highlight. Take ONLY the art style from the attached image: do NOT copy its characters, their elf ears, their clothes, their poses, their scene or their framing.

Use case: stylized-concept
Asset type: exact space-sticker sprite sheet for a Phaser 3 educational game about sticking stickers in the right order (what is in front must be stuck later).
Primary request: create ONE exact 3 columns × 3 rows sprite sheet on a transparent 1152 × 1152 px canvas. Every cell is exactly 384 × 384 px. Each sticker is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its border. Nothing may cross a cell boundary. No drawn grid, border or divider.
STICKER LOOK: every object is a die-cut sticker — a THICK, smooth, even WHITE sticker border (about 12 px) follows its whole silhouette, plus one small soft glossy highlight streak. The white border is the same thickness on all nine stickers. Every object is drawn COMPLETE, with no part missing or cut, because in the game other stickers will overlap different parts of it. All nine share the same visual weight, saturation and scale feel; none looks special.

Exact cells, left to right and then top to bottom:
0. planet — one round terracotta planet with three soft craters and one highlight, no ring, no face.
1. rocket — one cute rocket standing perfectly UPRIGHT pointing up, cream body with terracotta nose and three terracotta fins, one round slate-blue window, NO flame and NO smoke.
2. smoke — one fat puffy smoke cloud made of four or five round warm-grey-cream puffs, wider than tall.
3. moon — one big round sand-coloured moon covered in craters, no face.
4. astronaut — one cute child astronaut, full body, front view, cream spacesuit with slate-blue details, round helmet with a clear visor showing a friendly face with big eyes (coloured iris, one highlight) and a small smile; the RIGHT arm stretched out to the side with the hand open, the left arm relaxed.
5. flag — one small plain leaf-green flag on a short chestnut pole, flag waving slightly, no symbol on it.
6. crater — one wide shallow crater seen from the side, a low bowl of grey-sand rock with a raised rim, wider than tall.
7. module — one cute lunar lander module on four bent legs, slate-blue and cream, with one round door on the front and one small antenna.
8. ladder — one short golden ladder with four rungs, leaning slightly to the right.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, faces on the planet or the moon, flame or smoke on the rocket, symbols or flags of countries, emblems, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars as separate objects, HUD, question mark, black outlines, uniform black ink lines, thin or uneven sticker borders, missing parts, cropped objects, painterly lineless illustration, heavy airbrushed rendering, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, drop shadow on the cell, ground shadow, base under the object, white backing in transparent areas, sad faces, crying, angry faces.
~~~

## 4. `robo.png` — grade 3 × 2, célula 384 × 384

O robô-ajudante: redondinho, ardósia e creme, cabeça com uma **telinha** onde
ficam os olhos grandes, uma anteninha com luz âmbar, braços curtos com mãos de
luva, dois pezinhos. **Virado 3/4 para a esquerda** (ele entra pela direita e
olha para os pôsteres).

| Célula | Nome no código | Pose | Pivô |
|---|---|---|---|
| 0 | `robot-idle` | parado, sorrindo | pés em (192, 360) |
| 1 | `robot-walk` | andando, um pé à frente, braços balançando | pés em (192, 360) |
| 2 | `robot-peek` | as duas mãos tapando os olhos, sorriso de brincadeira | pés em (192, 360) |
| 3 | `robot-point` | apontando para cima e para a esquerda, olhando para lá | pés em (192, 360); ponta do dedo ~(90, 60) |
| 4 | `robot-press` | os dois braços à frente, apertando algo contra uma parede invisível | pés em (192, 360) |
| 5 | `robot-cheer` | pulinho, braços para cima, olhos felizes, luz da antena acesa | pés em (192, 360) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/28-vetor-de-conto-a.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, sand, cream; where there are eyes, they are big and expressive with a coloured iris and one white highlight. Take ONLY the art style from the attached image: do NOT copy its characters, their elf ears, their clothes, their poses, their scene or their framing.

Use case: stylized-concept
Asset type: exact character pose sprite sheet for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create ONE exact 3 columns × 2 rows sprite sheet on a transparent 1152 × 768 px canvas. Every cell is exactly 384 × 384 px. Each pose is complete, isolated and centred in its own cell with at least 8% transparent margin. Nothing may cross a cell boundary. No drawn grid, border or divider. No white keyline.

The character: one friendly small helper robot, chubby and rounded, slate-blue and cream with small terracotta accents; a round head with a dark rounded screen as a face showing two big expressive eyes (warm amber iris, one white highlight each) and a small smile; one short antenna with a round amber light; short arms with round mitten hands; a round belly panel with one small dial; two short sturdy feet. About 1.8 heads tall. Always a three-quarter view FACING LEFT.

Exact cells, left to right and then top to bottom:
0. robot-idle — standing, relaxed, happy smile. Feet at local (192, 360).
1. robot-walk — walking to the left, one foot forward, arms swinging. Feet at local (192, 360).
2. robot-peek — both mitten hands covering its screen-eyes playfully, cheeky smile below the hands. Feet at local (192, 360).
3. robot-point — pointing UP and to the LEFT with one arm, eyes looking at the fingertip, curious smile. Feet at local (192, 360).
4. robot-press — both arms stretched forward, hands flat as if pressing something onto a wall, concentrated little smile. Feet at local (192, 360).
5. robot-cheer — a little jump with both arms up, happy closed-eye arcs on the screen, antenna light glowing. Feet at local (192, 360).

Consistency constraints: all six cells are the IDENTICAL robot with the same proportions, colours, face screen and scale; only pose and expression change; feet baselines line up at local y = 360.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, humans, a second robot, weapons, lasers, scary or menacing robot features, red glowing eyes, sharp claws, stickers, posters, props, ground, floor, shadow, background, text, letters, words, labels, digits, numbers on the dial, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, facing right, back view, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, sad faces, crying, angry faces.
~~~

## 5. `pecas.png` — grade 2 × 2, célula 320 × 320

| Célula | Nome no código | O quê | Pivô |
|---|---|---|---|
| 0 | `base-rocket` | o foguete da base, em pé, **maior e diferente** do adesivo: ardósia e creme, janelinha âmbar, aletas verde-folha, sem chama; ~180 × 290 | base em (160, 305) |
| 1 | `flame` | uma chama apontando para baixo, âmbar e creme, gorda | topo em (160, 20) |
| 2 | `guide-hand` | mãozinha no ângulo de `references/mao-toque-angulo.png`, no estilo desta linha; `tipX`/`tipY` medidos depois | ponta do dedo |
| 3 | — | vazia | — |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/28-vetor-de-conto-a.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, sand, cream. Take ONLY the art style from the attached image: do NOT copy its characters, their elf ears, their clothes, their poses, their scene or their framing. A second attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 2.

Use case: stylized-concept
Asset type: exact game-pieces sprite sheet for a Phaser 3 educational game.
Primary request: create ONE exact 2 columns × 2 rows sprite sheet on a transparent 640 × 640 px canvas. Every cell is exactly 320 × 320 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin. Nothing may cross a cell boundary. No drawn grid, border or divider. No white keyline.

Exact cells, left to right and then top to bottom:
0. base-rocket — one cute sturdy rocket standing perfectly upright, about 180 × 290 px, slate-blue body with cream bands, one round warm-amber window, three leaf-green fins, a rounded cream nose; NO flame and NO smoke; its base sits at local y = 305.
1. flame — one plump rocket flame pointing straight DOWN, warm amber outside and cream-yellow core, soft rounded tongues, its top edge at local y = 20 and centred.
2. guide-hand — one cute small child's hand in this style, warm light skin with a slightly darker warm outline: the index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT; the other three fingers fold into small descending steps on the RIGHT; the thumb folds inward; the short wrist descends toward the LOWER RIGHT. Exactly five digits. Crisp fingertip. No click lines, no sleeve.
3. completely EMPTY and genuinely transparent reserved cell.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, people, faces, flame attached to the rocket in cell 0, smoke, launch tower, ground, floor, shadow, stars, extra fingers, missing fingers, click lines, radiating lines, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, object in cell 3, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges.
~~~

## 6. `bg-base.png` — 1280 × 720, opaco

O interior de uma **base espacial simpática**: parede arredondada ardósia e
creme, uma janela redonda com estrelas, luzinhas âmbar. As peças fixas do jogo
vêm pintadas **vazias**:

| Região | O que tem |
|---|---|
| canto esquerdo do alto (40–220 × 15–75) e direito do alto (1150–1275 × 0–115) | calmos (bolinhas e `?`) |
| **fita**, de (330, 28) a (950, 112) | uma faixa longa de fita de papel creme, com as pontas recortadas em zigue-zague, **lisa e vazia** |
| **pôster**, de (110, 135) a (610, 545) | um pôster preso na parede com 4 pedacinhos de fita adesiva nos cantos; a face é **azul-escuro liso** com meia dúzia de pontinhos de estrela **só na borda**; o miolo (360 ± 235, 340 ± 190) **vazio** |
| **moldura do modelo**, de (660, 150) a (1010, 430) | uma prancheta/moldura de madeira castanha com o mesmo papel azul-escuro liso dentro, **vazio** |
| **cartela**, de (160, 565) a (900, 710) | uma folha de adesivos vazia (papel creme brilhante, cantos arredondados) em cima de uma mesa baixa |
| **plataforma**, x 1060–1270, y 380–470 | uma plataformazinha de lançamento redonda; **acima dela vazio** até y 110 (o foguete entra por código) |
| chão à direita, x 1040–1270, y 480–720 | calmo (o robô para ali) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/28-vetor-de-conto-a.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — slate blue, cream, sand, tan, chestnut brown, terracotta, touches of leaf green and warm amber. Take ONLY the art style from the attached image: do NOT copy its characters, their elf ears, their clothes, their poses, their scene or their framing. NO white keyline — this is a full background.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create one opaque 1280 × 720 px illustration of the inside of a cosy, friendly space base: rounded slate-blue and cream walls, a few warm amber lights, one round porthole window with stars placed where it does not touch any region below. Preserve these exact functional regions, all EMPTY: the top-left area x 40–220, y 15–75 and the top-right area x 1150–1275, y 0–115 are calm; a long strip of cream paper tape with zig-zag cut ends runs from (330, 28) to (950, 112), plain and EMPTY; a poster is pinned to the wall from (110, 135) to (610, 545) with four small pieces of tape on its corners, its face is plain deep slate-blue with only a few tiny star dots near its edges and a completely EMPTY centre; a small chestnut wooden frame or clipboard from (660, 150) to (1010, 430) holds the same plain deep slate-blue paper, completely EMPTY; an empty glossy cream sticker backing sheet with rounded corners lies on a low table from (160, 565) to (900, 710); on the right, a small round launch pad platform sits at x 1060–1270, y 380–470, and the space ABOVE it up to y 110 is empty wall or a big hatch opening to the starry sky with nothing standing there; the floor area x 1040–1270, y 480–720 is calm.

Composition and technical constraints: exact 16:9 canvas; straight-on view; all listed coordinates respected; the poster centre, the frame centre, the tape strip and the sticker sheet stay perfectly plain; opaque; no white keyline.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, people, astronauts, robots, rockets, planets or moons on the poster, stickers, pictures inside the poster or the frame, squares or slots drawn on the tape, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, busy details in the empty regions.
~~~

## 7. `cover-decolagem-passo-a-passo.png` — 1672 × 941, opaco

A capa: o robô-ajudante colando um adesivo de foguete num pôster de espaço, por
cima de um planeta já colado; a fita no alto com dois quadradinhos cheios; à
direita, um foguete decolando. Com o título `Decolagem Passo a Passo` no alto.
Anexar a referência `28` e a `robo.png` aprovada.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/28-vetor-de-conto-a.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — slate blue, cream, sand, tan, chestnut brown, terracotta, leaf green, warm amber; big expressive eyes with a coloured iris and one white highlight. Take ONLY the art style from the first attached image: do NOT copy its characters, their elf ears, their clothes, their poses, their scene or their framing. NO white keyline — this is a full cover.
CHARACTER — THE SECOND ATTACHED IMAGE (robo.png) IS THE CHARACTER REFERENCE: the robot on the cover is exactly this helper robot.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Decolagem Passo a Passo”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Decolagem Passo a Passo” in large chunky rounded playful multicolour letters with a thick darker-toned outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly four words, letter for letter and with capitalization exactly: D-e-c-o-l-a-g-e-m [space] P-a-s-s-o [space] a [space] P-a-s-s-o. No accent marks, extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, inside a cosy space base, the friendly helper robot is pressing a die-cut ROCKET sticker (thick white sticker border) onto a deep slate-blue space poster, so that the rocket overlaps and covers half of a terracotta PLANET sticker already stuck there; a fat puffy smoke sticker waits on a sticker sheet below. On the right, a real rocket lifts off from a small launch pad with a plump amber flame, puffy smoke and a few stars. Make "stickers stuck in layers, one on top of the other" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; main action large beneath it; complete robot, poster, stickers and rocket visible; opaque; no white keyline except the sticker borders; no written interface beyond the requested title.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, humans, a second robot, extra words, misspelled title, subtitle, punctuation, numbers, labels, captions, watermark, logo, score, HUD, buttons, question mark, speech bubbles, arrows, black outlines, uniform black ink lines, painterly lineless illustration, heavy airbrushed rendering, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, cropped title, cropped robot, cropped poster, cropped rocket.
~~~

## 8. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades exatas: `adesivos` 1152 × 1152, `robo` 1152 × 768, `pecas` 640 × 640;
- o corte medido por colunas na folha inteira, sem peça cruzando célula;
- **a borda branca dos 9 adesivos com a mesma espessura** (medir) e nenhum
  adesivo cortado ou faltando pedaço;
- o foguete do adesivo **em pé**, sem chama; a lua e o planeta sem rosto;
- o contorno de cada peça num tom da própria cor (se sair preto, volta);
- o robô igual nas 6 poses, virado para a **esquerda**, pés alinhados em y = 360;
- no `bg-base`, o miolo do pôster, da moldura, da fita e da cartela **lisos**, e
  nada em pé em cima da plataforma;
- `tipX`/`tipY` do dedo medidos;
- a grafia do título da capa conferida letra a letra;
- o `MANIFEST.md` publicado com a caixa medida de cada adesivo (é dela que sai a
  conta dos 25% de sobreposição).
