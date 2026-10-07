# Robô em Pedaços — texturas

Destino: `src/assets/games/EF03CO03/robo-em-pedacos/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§4 fluxo, §6 níveis, §7 tela, §11 arte).

**Linha de arte: livro ilustrado.** O usuário trocou o vetor geométrico por esta linha em 05/10/2026,
antes de qualquer arte ser gerada.

**Anexe em toda geração:** `references/34-livro-ilustrado.jpg`.

Cada prompt abaixo vem inteiro (estilo + pedido + negativo), pronto para copiar. Arquivos, grades e
células **não mudaram**: o código já espera exatamente estes nomes e posições.

> **O elenco da referência entra no negativo.** A imagem mostra três crianças, um menino sentado num
> papelão e um cachorro, numa calçada. O gerador copia isso se ninguém proibir. Daqui sai **só o jeito
> de pintar**.

### Tabela de estilo

| Critério | **Livro ilustrado (`34`)** | Vetor geométrico (`23`/`24`) | Chibi de ícone (`33`) |
|---|---|---|---|
| Contorno | **quase nenhum**: a forma se separa pela cor e por uma linha fina e suave num tom mais escuro da própria cor | nenhum | marrom fino |
| Sombra | **pintura macia**: degradê suave, luz quente de rebote | nenhuma | cel shading macio |
| Textura | **granulado/pontilhado fino de aerógrafo** nas sombras e nas áreas grandes | nenhuma | nenhuma |
| Proporção | cabeça grande (≈ 1/3 da altura), corpo pequeno e roliço, **não é chibi extremo** | ~4 cabeças | cabeça = metade |
| Olho | grande, íris castanho-escura, um brilho branco grande, cílios curtos | quadrado branco, pupila cheia | enorme, degradê, vários brilhos |
| Paleta | pastel quente: pêssego, coral, verde-água, rosa, castanhos, creme | saturada sobre branco | pastel |

### A paleta do jogo

- **Robô:** placas **azul-céu suave**, detalhes **amarelo quente**, juntas **creme**, tela do rosto **grafite azulado**.
- **Robô apagado:** as **mesmas formas** em **cinza-azulado empoeirado**, luzes apagadas e tela escura.
- **Nina:** macacão **laranja** e bandana **roxa**.
- **Oficina:** creme, pêssego claro e madeira mel.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-oficina.png` | — | — | 1280 × 720 | opaco | oficina com o elevador vazio |
| `modulos.png` | 4 × 3 | 384 × 384 | 1536 × 1152 | sim | 5 módulos apagados/acesos + tomada desligada/ligada |
| `pontos.png` | 4 × 4 | 192 × 192 | 768 × 768 | sim | 8 tipos de ponto, **solto** e **firme** |
| `nina.png` | 4 × 1 | 384 × 512 | 1536 × 512 | sim | a mecânica, 4 poses |
| `cover-robo-em-pedacos.png` | — | — | 1672 × 941 | opaco | capa, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`).

**O que não pode faltar:**
- **`modulos.png` na mesma escala.** As peças empilham num robô só.
- **`pontos.png` com solto e firme bem diferentes pela forma.**

## 2. Regras para toda a arte

- **Nenhum texto, número, letra ou símbolo.** As etiquetas (CABEÇA, CORPO…) são do código.
- **O granulado fica DENTRO das formas.** Nos arquivos com alfa, nada de pontilhado, névoa, halo branco ou sombra fora do objeto: o fundo é 100% transparente.
- **Nenhum brilho, faísca, seta ou marca de movimento nos pontos SOLTOS.** O solto se reconhece pela **forma**: torto, pra fora, desencaixado.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão e sem sombra caída.
- **Os módulos são do mesmo robô, na mesma escala e de frente.** Apagado e aceso têm **forma idêntica**; só a cor e as luzes mudam.

---

## 3. `bg-oficina.png` — 1280 × 720, opaco

Oficina clara e acolhedora, vista de frente. O **elevador** é uma plataforma larga e baixa à esquerda
do centro (x ≈ 200–660, tampo em y ≈ 610), **vazia**. À direita fica o chão livre, onde o código
desenha os estrados. No canto de baixo à esquerda há espaço livre para a Nina.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette (peach, coral, soft teal, soft pink, honey wood, warm browns, creamy whites) with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — an EMPTY, cosy robot repair WORKSHOP seen straight-on from the front, like a stage (flat front elevation, no strong perspective). 16:9, 1280×720.
- Back wall in warm cream with a soft peach band; on the upper left a pegboard with a neat row of tools (wrench, screwdriver, pliers) painted softly; on the upper right a high wooden shelf with a few rounded boxes and spare gears.
- Floor: warm light-grey tiles filling the lower 18% of the image, meeting the wall in one horizontal line.
- On the LEFT-CENTER, a wide, low ROBOT LIFT PLATFORM (elevator): a rounded warm-yellow slab about 460 px wide, its top surface at about 85% of the image height, two short grey pistons underneath. The platform is EMPTY.
- The RIGHT HALF of the floor and wall is calm and EMPTY (the game draws four pallets there).
- The lower-left corner is EMPTY (a character stands there).
- Soft daylight from the left, gentle speckled shading, uncluttered so the robot and the parts placed on top stand out.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, pavement, a sandwich, a water bottle; robots, robot parts on the platform, people, characters, pallets, crates on the right half of the floor, a wall socket, power buttons; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, plastic look, photorealistic, harsh contrast, neon colours, dark or gloomy lighting, clutter; text, letters, words, labels, digits, numbers, captions, watermark, signature, title lettering, user interface, buttons, frames, speech bubbles, arrows, icons, stars, HUD.
~~~

---

## 4. `modulos.png` — grade 4 × 3, célula 384 × 384

O **Gigante** é um robô fofo, roliço e amigável, desmontado em módulos. **Todas as células têm a
mesma escala**: empilhados, os módulos formam um robô de ~3 cabeças de altura. Cada módulo tem um
**encaixe** visível (uma placa creme reta) onde se liga ao vizinho.

| Célula | Nome | Medida aproximada na célula |
|---|---|---|
| 0 | `head-off` cabeça apagada | 200 × 170, pino do pescoço embaixo |
| 1 | `body-off` corpo apagado | 230 × 190, placa de quadril embaixo, ombros em cima |
| 2 | `arms-off` braços apagados | 360 × 150, os dois braços ligados por uma barra de ombro |
| 3 | `legs-off` pernas apagadas | 200 × 170, placa de quadril em cima, pés embaixo |
| 4 | `head-on` cabeça acesa | igual à 0 |
| 5 | `body-on` corpo aceso | igual à 1 |
| 6 | `arms-on` braços acesos | igual à 2 |
| 7 | `legs-on` pernas acesas | igual à 3 |
| 8 | `shoes-off` sapatos-foguete apagados | 240 × 110, dois sapatos com bocal de foguete |
| 9 | `shoes-on` sapatos-foguete acesos | igual à 8 |
| 10 | `plug-off` tomada desligada | caixa de força com botão grande cinza |
| 11 | `plug-on` tomada ligada | igual à 10, botão amarelo e luzinha acesa |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes; eyes (where asked) are large and expressive with a dark iris and one big white highlight. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

Use case: stylized-concept
Asset type: exact sprite sheet of robot PARTS for a Phaser 3 educational game for children aged 8–9. Sprite sheet, 4 columns by 3 rows, 384x384 px per cell, ALL parts at the SAME scale (they stack into one robot), the same palette and the same soft lighting from the upper left, centred in its cell with even margins, TRANSPARENT background, no grid lines drawn, no cell borders.
Primary request: create ONE exact 4 × 3 sprite sheet on a transparent 1536 × 1152 px canvas. Every cell is exactly 384 × 384 px. Each part is complete, isolated, front view and centred in its own cell with at least 8% transparent margin. Nothing may cross a cell boundary. The speckle texture stays INSIDE each part; the background around the parts is fully transparent.

The robot ("the Giant"): a cute, chubby, friendly toy-like robot with softly painted metal. ON version: soft sky-blue plates, warm yellow details, creamy joints and connector plates, a dark blue-grey face screen. OFF version: IDENTICAL shapes in dusty blue-grey with darker grey joints, the face screen dark and empty, every small light switched off. Each part shows a creamy CONNECTOR PLATE where it joins its neighbour, so the parts clearly stack: legs at the bottom, body on the legs, arms on the shoulders, head on top.

Exact cells, left to right and then top to bottom:
0. head-off — a wide rounded-square head (about 200 × 170 px) with a short antenna and a small round lamp on top, a dark empty face screen, a short connector peg underneath. OFF colours.
1. body-off — a big rounded barrel-like torso (about 230 × 190 px) with a round chest button, a small hatch panel, two shoulder sockets on its upper sides and a flat hip plate underneath. OFF colours.
2. arms-off — BOTH arms as one piece (about 360 × 150 px): a horizontal creamy shoulder bar with one rounded arm hanging at each end and a round mitten hand at the end of each arm. OFF colours.
3. legs-off — two sturdy rounded legs (about 200 × 170 px) joined by a flat hip plate on top, a round knee joint on each, small rounded feet at the bottom. OFF colours.
4. head-on — the same head as cell 0, ON colours, the face screen showing two big friendly glowing eyes and a small smile, the top lamp lit warm yellow.
5. body-on — the same torso as cell 1, ON colours, the chest button lit warm yellow.
6. arms-on — the same arms as cell 2, ON colours.
7. legs-on — the same legs as cell 3, ON colours.
8. shoes-off — a pair of chunky rocket boots (about 240 × 110 px) side by side, each with a small round nozzle at the back and a socket on top for a leg. OFF colours.
9. shoes-on — the same rocket boots, ON colours, a small soft orange flame at each nozzle.
10. plug-off — a chunky wall power box (about 150 × 180 px) in warm light grey with one big round button, the button dull grey.
11. plug-on — the same power box, the big round button warm yellow and one small round indicator light lit.

Consistency constraints: cells 0–3 and 4–7 are pairwise IDENTICAL in shape, size and position; only colours and lights change. All parts share one scale so that, stacked, legs + body + head form one robot about three heads tall.

DO NOT INCLUDE: the children from the reference image, a dog, a street, cardboard; a fully assembled robot, people, Nina, tools, screws or wires loose around the parts, sparks, smoke, broken pieces, cracks, scary robot features, red glowing eyes, weapons, lasers; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, plastic look, photorealistic, harsh contrast, neon colours; grain, speckles, haze or glow OUTSIDE the parts, white halo, drop shadow, background colour; text, letters, words, labels, digits, numbers, power symbols, icons, captions, watermark, signature, user interface, frames, speech bubbles, arrows, stars, HUD; floor, ground, cast shadow; grid lines, visible sprite-sheet borders, cell borders, cropped edges.
~~~

---

## 5. `pontos.png` — grade 4 × 4, célula 192 × 192

Os pontos que ficam por cima do módulo no close. Cada tipo aparece duas vezes: **solto**
(célula par) e **firme** (célula ímpar), **do mesmo tamanho e na mesma posição**. A diferença é
de **forma**, sem brilho nenhum.

| Células | Tipo | Solto | Firme |
|---|---|---|---|
| 0 · 1 | parafuso | torto, metade pra fora | rente, reto |
| 2 · 3 | fio | ponta solta pendurada, plugue fora | plugue encaixado na tomadinha |
| 4 · 5 | mola | pulada pra fora, esticada torta | dentro do encaixe, reta |
| 6 · 7 | engrenagem | fora do pino, inclinada | no pino, reta |
| 8 · 9 | antena | dobrada pro lado | reta pra cima |
| 10 · 11 | lâmpada | desrosqueada, inclinada | rosqueada, reta |
| 12 · 13 | botão | saltado pra fora, torto | apertado no painel |
| 14 · 15 | olho | tampa entreaberta, torta | tampa fechada, reta |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black; rounded, chunky, friendly shapes. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

Use case: stylized-concept
Asset type: exact sprite sheet of small mechanical repair points for a Phaser 3 educational game for children aged 8–9. Sprite sheet, 4 columns by 4 rows, 192x192 px per cell, every item at the SAME scale, the same palette and the same soft lighting from the upper left, centred in its cell with even margins, TRANSPARENT background, no grid lines drawn, no cell borders.
Primary request: create ONE exact 4 × 4 sprite sheet on a transparent 768 × 768 px canvas. Every cell is exactly 192 × 192 px. Each item is a single small mechanical part, about 120–140 px, front view, centred, with at least 10% transparent margin. Nothing may cross a cell boundary. The speckle texture stays INSIDE each part; the background is fully transparent.

Each part appears TWICE in a row: first LOOSE (even cells), then FIRM (odd cells). LOOSE and FIRM of the same part have the SAME size, colours and position; the difference is ONLY the shape and pose — loose parts are visibly crooked, sticking out or unplugged; firm parts are straight, flush and seated. Colours: softly painted silver-grey metal, dark blue-grey holes and sockets, warm yellow accents, soft sky-blue wire insulation.

Exact cells, left to right and then top to bottom:
0. screw LOOSE — a big round-headed screw tilted about 30 degrees, half of its thread showing above a small round dark hole.
1. screw FIRM — the same screw sitting flush and straight in the hole, only the round head visible.
2. wire LOOSE — a short blue cable with its plug hanging out, dangling down beside a small dark socket.
3. wire FIRM — the same blue cable with its plug pushed straight into the socket.
4. spring LOOSE — a coil spring popped out of its round cup, stretched and leaning sideways.
5. spring FIRM — the same spring seated upright inside its round cup.
6. gear LOOSE — a yellow gear slid half off its grey pin, tilted.
7. gear FIRM — the same gear sitting flat and centred on its pin.
8. antenna LOOSE — a short antenna with a small ball tip, bent over sideways at its base.
9. antenna FIRM — the same antenna standing straight up.
10. bulb LOOSE — a small round yellow bulb unscrewed and leaning out of its grey socket.
11. bulb FIRM — the same bulb screwed straight down into the socket.
12. button LOOSE — a round yellow button popped out of its square grey panel, crooked.
13. button FIRM — the same button pressed flat into the panel.
14. eye cover LOOSE — a round grey hatch cover hanging half open and crooked over a dark round hole.
15. eye cover FIRM — the same round hatch cover closed flat and straight.

DO NOT INCLUDE: sparks, glows, flashes, motion lines, exclamation marks, warning colours on the loose parts, red highlights, arrows, stars; the children from the reference image, a dog, a street, cardboard; characters, hands, tools, wrenches, screwdrivers, robots, faces on the parts; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime style, 3D render, plastic look, photorealistic, harsh contrast, neon colours; grain, speckles, haze or glow OUTSIDE the parts, white halo, drop shadow, background colour; text, letters, words, labels, digits, numbers, icons, captions, watermark, signature, user interface, frames, HUD; floor, ground, cast shadow; grid lines, visible sprite-sheet borders, cell borders, cropped edges.
~~~

---

## 6. `nina.png` — grade 4 × 1, célula 384 × 512

**Nina**, a mecânica da oficina, uma menina de uns 9 anos. Ela só fala nos balões e reage, no
canto de baixo à esquerda. Os pés ficam em y = 490 em todas as células, e ela olha para a
**direita**, para o robô.

| Célula | Pose |
|---|---|
| 0 | falando, uma mão apontando para a direita |
| 1 | comemorando, chave inglesa no alto, boca aberta feliz |
| 2 | susto, mãos nas bochechas, olhos arregalados |
| 3 | parada, chave inglesa apoiada no ombro, sorriso |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black. Characters have big rounded heads (about a third of the body height) on small, soft, rounded bodies; large expressive almond eyes with dark brown irises, one big white highlight and short lashes; tiny noses, rosy cheeks, warm smiles; hair painted in soft clumps with a gentle shine; lively, friendly, slightly exaggerated poses. Warm pastel palette. Take ONLY the art style: do NOT copy the children, their faces, their clothes, the dog, the cardboard, the street or the composition of the reference.

Use case: stylized-concept
Asset type: exact character pose sprite sheet for a Phaser 3 educational game for children aged 8–9. Sprite sheet, 4 columns by 1 row, 384x512 px per cell, the SAME character in every cell at the SAME scale, the same palette and the same soft lighting from the upper left, centred in its cell with even margins, TRANSPARENT background, no grid lines drawn, no cell borders.
Primary request: create ONE exact 4 × 1 sprite sheet on a transparent 1536 × 512 px canvas. Every cell is exactly 384 × 512 px. Each pose is complete, full body (head to shoes), isolated and centred in its own cell with at least 8% transparent margin. Nothing may cross a cell boundary. Feet at local y = 490 in every cell. The character faces and looks to the RIGHT. The speckle texture stays INSIDE the figure; the background is fully transparent.

The character: NINA, a 9-year-old girl mechanic. Medium-brown skin, black curly hair in a high round puff tied with a purple bandana, warm brown eyes; an orange overall with one small pocket over a light-grey T-shirt, yellow sneakers.

Exact cells, left to right:
0. talking — one hand pointing to the right, mouth open in a friendly explanation.
1. cheering — a little jump, a silver wrench raised high in one hand, big open happy smile.
2. startled — both hands on her cheeks, eyes wide, eyebrows high, small round mouth.
3. standing — a silver wrench resting on her shoulder, the other hand on her hip, warm closed smile.

Consistency constraints: all four cells are the IDENTICAL girl with the same proportions, colours and scale; only pose and expression change; feet aligned at local y = 490.

DO NOT INCLUDE: the children from the reference image, a girl with a red bow, a girl in a denim overall, a boy in a pink tank top, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; robots, robot parts, a second character, adults; facing left, back view; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga eyes, extreme chibi proportions, 3D render, plastic look, photorealistic, harsh contrast, neon colours; grain, speckles, haze or glow OUTSIDE the figure, white halo, drop shadow, background colour; text, letters, words, labels, digits, numbers, captions, watermark, signature, user interface, frames, speech bubbles, arrows, icons, stars, HUD; floor, ground, props under the feet, cast shadow; grid lines, visible sprite-sheet borders, cell borders, cropped edges; sad faces, crying, angry faces.
~~~

---

## 7. `cover-robo-em-pedacos.png` — 1672 × 941, opaco

Capa com o **título escrito** ([[capa-tem-titulo]]).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: a modern children's picture-book digital illustration. Soft painterly rendering with smooth gradients, gentle warm shading and soft bounce light; a fine airbrushed SPECKLE / GRAIN texture inside the shadows and across large areas; almost no outlines — shapes are separated by colour and by thin, soft edge lines in a deeper tone of their own colour, never black. Characters have big rounded heads on small, soft bodies, large expressive eyes with dark brown irises and one big white highlight, rosy cheeks, warm smiles. Warm pastel palette with a soft, light atmosphere. Take ONLY the art style: do NOT copy the children, their clothes, the dog, the cardboard, the street or the composition of the reference.

SUBJECT — the cover of a children's game, 16:9, 1672×941, a full scene in a cosy, sunny robot repair workshop.
- In the centre, a big, cute, chubby friendly ROBOT ("the Giant") being put back together on a warm-yellow lift platform: soft sky-blue plates, warm yellow details, creamy joints, a dark face screen with two big friendly glowing eyes. Its legs and body are already in place; its HEAD is floating just above the body, about to click on; one arm floats beside the shoulder.
- NINA, a 9-year-old girl mechanic with medium-brown skin, black curly hair in a high puff tied with a purple bandana, an orange overall over a light-grey T-shirt and yellow sneakers, jumps beside the robot holding a silver wrench up high, cheering.
- A few spare parts (a gear, a spring, a screw) float around softly.
- TITLE at the top, big and readable: "Robô em Pedaços" in chunky, rounded, hand-lettered storybook letters, warm cream fill with a soft deep-blue edge and a gentle shadow. Spell it EXACTLY: R-o-b-ô e-m P-e-d-a-ç-o-s, with the circumflex on the ô and the cedilla on the ç.
- Bright, warm, friendly, the characters large in the frame.

DO NOT INCLUDE: any other text besides the title, misspelled title, missing accent on ô, missing cedilla on ç, extra letters, subtitles, logos; the children from the reference image, a girl with a red bow, a boy sitting on cardboard, a dog, a street, a sandwich, a water bottle; scary robot, red glowing eyes, weapons, lasers, broken or sad robot; black outlines, thick ink lines, comic inking, hard cel shading, flat geometric vector shapes, anime or manga style, 3D render, plastic look, photorealistic, harsh contrast, neon colours, dark or gloomy lighting; user interface, buttons, frames, speech bubbles, arrows, icons, stars, HUD, watermark, signature.
~~~

---

## 8. O que conferir quando a arte chegar

1. **Medir cada célula pelo canal alfa**: a caixa, o pé e o vão para a célula vizinha. Se alguma coisa cruzar a borda, reempacotar a folha.
2. **Conferir o fundo transparente.** Esta linha tem granulado, e o gerador costuma deixar pontinhos ou névoa fora do objeto. Limpar o alfa abaixo de ~16 antes de medir.
3. **`modulos.png`:** empilhar pernas + corpo + cabeça no código e conferir se os encaixes batem. Se não baterem, guardar o deslocamento por módulo em `data/files.ts` (`MODULE_ART`), sem regenerar.
4. **`pontos.png`:** conferir lado a lado que **solto e firme** de cada par se distinguem a ~90 px, o tamanho em que aparecem no close.
5. **`bg-oficina.png`:** medir o tampo do elevador e ajustar `layout.ts` à arte.
