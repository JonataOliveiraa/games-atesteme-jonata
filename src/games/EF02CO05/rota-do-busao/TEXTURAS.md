# Rota do Busão — texturas

Destino: `src/assets/games/EF02CO05/rota-do-busao/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 passageiros e
situações, §13 textura × código).

A linha de arte é a **chibi de figurinha**, o padrão da rodada (sujeita à
dúvida 2 do PLANEJAMENTO). A referência `references/19-chibi-figurinhas.jpg` vai
**anexada em toda geração**. Cada prompt vem inteiro (estilo + corpo +
negativo), pronto para copiar.

> **O elenco da referência entra no negativo.** Da folha de figurinhas sai só a
> técnica, nunca as personagens dela.

### Tabela de estilo — chibi de figurinha

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Traço | limpo, nítido, uniforme, em azul-marinho dessaturado; nunca preto puro | vetor de conto (contorno no tom da cor) e desenho de criança (caneta trêmula) |
| Cor | paleta curta, chapada, **um** tom de sombra, nenhum degradê | vetor de conto (degradê macio) e chibi de rabisco (sem cor) |
| Olho | grande e brilhante, com um brilho forte | desenho de criança (pontinho) |
| Silhueta | peça com alfa ganha **keyline branca fina**; cena inteira (fundo, capa) não ganha | vetor de conto e graphic novel (sem keyline) |
| Proporção | chibi: cabeça grande, corpo pequeno; os aparelhos-passageiros são **o corpo inteiro**, com rosto, bracinhos e perninhas | graphic novel (quase natural) |

**As três regras deste jogo:**
- **Todos os passageiros têm o mesmo peso.** Mesmo tamanho (~200 px de altura),
  mesmo jeito de rosto, bracinhos e perninhas, mesma pose de espera, de frente.
  Nenhum brilha, tem borda especial ou cor de destaque. O **lápis** e o
  **regador** (sem tecnologia) são desenhados **igual** aos outros.
- **A cena da situação nunca mostra o que resolve.** *"Que horas são?"* não tem
  relógio em lugar nenhum; *"O sorvete vai derreter!"* não tem geladeira. A
  resposta é da criança.
- **O fundo é calmo e liso.** Calçada e rua sem juntas e sem faixas: elas andam
  por código e, pintadas, ficariam paradas enquanto o busão anda.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-rua.png` | — | — | 1280 × 720 | opaco | céu, telhados ao longe, calçada e rua lisas |
| `cenario.png` | 4 × 2 | 512 × 512 | 2048 × 1024 | sim | prédios que passam: casas, árvore, escola, mercadinho, coreto, poste |
| `onibus.png` | 2 × 2 | 1024 × 512 | 2048 × 1024 | sim | busão sem rodas, ponto, roda, terminal |
| `passageiros.png` | 4 × 4 | 256 × 256 | 1024 × 1024 | sim | os 14 passageiros |
| `situacoes.png` | 4 × 4 | 256 × 256 | 1024 × 1024 | sim | as 14 cenas do letreiro |
| `cover-rota-do-busao.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`,
`data/riders.ts`, `data/situations.ts`).

**Se a arte vier em outro tamanho**, ela é usada como veio: o código mede a
folha (MANIFEST) e o layout se ajusta. O que **não pode** mudar é a **ordem das
células** e o que existe em cada uma.

**O insubstituível para o N1:**
- o `bg-rua`;
- as casas, a árvore e o poste (`cenario` 0–3 e 7);
- o busão, o ponto e a roda (`onibus` 0–2);
- os 6 passageiros de casa (`passageiros` 0–5) e a câmera do treino (8);
- as 6 cenas de casa (`situacoes` 0–5) e a foto do treino (8).

O resto é N2/N3 ou acabamento (o terminal), e está nas folhas porque célula a
mais não custa outra geração.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. Frases, nomes, ✓ e "?" são
  do jogo. Telas, visores e relógios **sem dígitos**.
- Peça solta e centrada na célula, com ~8% de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha.
- **O busão vem sem rodas** (só as caixas de roda escuras), com as **6 janelas
  iguais, vazias e de vidro azul-claro liso**: o código mede cada janela e põe
  quem embarcou dentro dela.
- **A placa do ponto vem em branco** (creme liso): o código põe a cena e a
  frase.

## 3. `bg-rua.png` — 1280 × 720, opaco

Uma rua de bairro vista de lado, num dia bonito. Só o que **não se mexe**: o
céu, nuvens, telhados bem ao longe, a calçada e a rua. As casas da frente, o
ponto e o busão entram por código.

| Região | O que tem |
|---|---|
| y 0–100 | céu calmo (HUD) |
| y 100–520 | céu com poucas nuvens e, embaixo (y 380–520), uma fileira **bem clara e sem detalhe** de telhados e copas ao longe |
| calçada, y 520–600 | uma faixa **lisa** bege-clara, sem juntas, sem nada em cima |
| meio-fio | uma linha fina em y 600 |
| rua, y 600–720 | asfalto **liso** cinza-azulado suave, sem faixas pintadas |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: full-screen static background for a Phaser 3 side-scrolling bus game for Brazilian children aged 7–8.
Primary request: create one opaque 1280 × 720 px side view of a calm neighbourhood street on a sunny day. Preserve these exact horizontal bands: y 0–100 is calm plain sky; y 100–380 is sky with a few soft rounded clouds; y 380–520 is ONE low row of very pale, simple, low-detail distant rooftops and tree tops, almost a silhouette in light pastel tones; y 520–600 is a PLAIN flat light-beige sidewalk with NO paving joints, NO tiles and NOTHING standing on it; a thin curb line at y 600; y 600–720 is a PLAIN flat soft blue-grey asphalt road with NO lane markings, NO dashes and NO crossings. Everything is perfectly horizontal and straight-on, so the bands could scroll sideways.

Palette: sky blue, white clouds, pale lilac and pale mint distant rooftops, light beige sidewalk, soft blue-grey road, tiny touches of coral.

Composition and technical constraints: exact 16:9 canvas; straight-on side view; flat horizontal bands at the listed y positions; nothing in the foreground; opaque; no white sticker keyline; no embedded user interface.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, children, animals, buses, cars, vehicles, bus stops, benches, signs, traffic lights, lamp posts, trees or houses in the foreground, objects on the sidewalk, paving joints, tiles, lane markings, road dashes, zebra crossings, manholes, puddles, shadows of objects, text, letters, words, labels, digits, numbers, signs with writing, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, perspective vanishing point, road seen from above, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 4. `cenario.png` — grade 4 × 2, célula 512 × 512

Os prédios que **passam** atrás do ponto, a meia velocidade. Ficam um pouco
mais claros e calmos que os personagens, porque são cenário.

| Célula | Nome no código | O quê | Nível |
|---|---|---|---|
| 0 | `houseA` | casinha térrea, parede menta, telhado coral | 1 |
| 1 | `houseB` | sobradinho, parede lilás, telhado azul | 1 |
| 2 | `houseC` | casinha amarela com varandinha e vaso de flor | 1 |
| 3 | `tree` | árvore redonda e fofa | 1 |
| 4 | `school` | escolinha com sino no alto e janelas grandes (sem letreiro) | 2 |
| 5 | `market` | mercadinho com toldo listrado e caixotes de frutas | 3 |
| 6 | `square` | coreto da praça com canteiro de flores | 3 |
| 7 | `lamp` | poste de luz com um arbusto florido ao pé | 1 |

Todos de lado, com o **pé na mesma linha de base** (y ≈ 490 da célula), para
ficarem em pé na calçada.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette, slightly softer and lighter than foreground characters; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact scenery sprite sheet for a Phaser 3 side-scrolling street.
Primary request: create ONE exact 4 columns × 2 rows sprite sheet on a transparent 2048 × 1024 px canvas. Every cell is exactly 512 × 512 px. Each piece is complete, isolated and centred horizontally in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. All pieces are seen straight from the SIDE (front façade facing the viewer, no perspective) and all of them stand on the same baseline at local y ≈ 490, with no ground drawn.

Exact cells, left to right and then top to bottom:
0. houseA — one small cute single-storey house, mint walls, coral roof, a door and two windows, about 420 px wide and 400 px tall.
1. houseB — one small cute two-storey house, lilac walls, blue roof, about 380 px wide and 460 px tall.
2. houseC — one small cute yellow house with a little porch and a flower pot, about 420 px wide and 400 px tall.
3. tree — one round fluffy cute tree with a short trunk, about 300 px wide and 440 px tall.
4. school — one small cute school building with a little bell tower on top and big windows, a plain wall where a sign would be, about 460 px wide and 460 px tall.
5. market — one small cute corner grocery shop with a striped awning and crates of fruit in front, about 460 px wide and 400 px tall.
6. square — one cute little park bandstand (gazebo) with a round flower bed around its base, about 440 px wide and 420 px tall.
7. lamp — one cute street lamp post with a small flowering bush at its foot, about 200 px wide and 460 px tall.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, children, animals, faces on the buildings, vehicles, buses, bus stops, benches, traffic lights, text, letters, words, labels, digits, numbers, shop names, school name, signs with writing, logos, captions, watermark, title lettering, user interface, buttons, panels, frames, speech bubbles, HUD, question mark, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, grass strip, sidewalk, floor, drop shadow on the cell, perspective, buildings seen from a corner, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 5. `onibus.png` — grade 2 × 2, célula 1024 × 512

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `bus` | busão escolar fofo **de lado, de frente para a DIREITA**, ~900 × 380, **sem rodas** (duas caixas de roda escuras e vazias). Amarelo, com rosto na frente (faróis-olhos e sorriso no para-choque). **6 janelas iguais em fila**, vazias, de vidro azul-claro liso. A **porta** fica perto da frente: fechada, de duas folhas de vidro |
| 1 | `stop` | ponto de ônibus de frente: telhadinho, duas colunas, um **banco comprido** e, no alto, uma **placa grande em branco** (creme liso, ~300 × 220), ~480 × 470 |
| 2 | `wheel` | uma roda do busão de frente, ~170 px, com calota de **5 parafusos** (para o giro aparecer) |
| 3 | `terminal` | terminal de ônibus fofo de frente: um telhado em arco sobre duas colunas, com bandeirinhas, ~620 × 460 (o fim da linha) |

O **pé do ponto** e o **pé do terminal** ficam na base da célula (y ≈ 490).

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight where there are eyes; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact vehicle and street-furniture sprite sheet for a Phaser 3 game.
Primary request: create ONE exact 2 columns × 2 rows sprite sheet on a transparent 2048 × 1024 px canvas. Every cell is exactly 1024 × 512 px (wide cells). Each piece is complete, isolated and centred in its own cell with at least 6% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

Exact cells, left to right and then top to bottom:
0. bus — one cute yellow school bus seen exactly from the SIDE, facing RIGHT, about 900 × 380 px, WITHOUT WHEELS: where the two wheels would be there are two plain dark empty half-round wheel arches. The front on the right has a friendly face: two round headlights as big glossy eyes and a smile on the bumper. Along the upper body, SIX identical rectangular windows with rounded corners in one straight row, all EMPTY, each glass a plain flat light-blue with at most one small white shine stripe, nobody inside. Near the front, one closed folding door with two tall glass panels. A thin mint stripe along the body.
1. stop — one cute bus stop shelter seen from the FRONT, about 480 × 470 px, its feet at the bottom of the cell: a small rounded roof, two posts, one long empty bench, and high up under the roof one big BLANK sign panel, plain flat cream with a navy outline and nothing on it, about 300 × 220 px.
2. wheel — one bus wheel seen straight from the side, about 170 px round: dark rubber tyre, light hubcap with exactly five bolts.
3. terminal — one cute bus terminal seen from the FRONT, about 620 × 460 px, its feet at the bottom of the cell: a big rounded arch roof on two posts, with a string of small bunting flags.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, driver, passengers, people or faces in the windows, wheels on the bus, open door, anything on the stop sign panel, pictures or symbols on the sign, route number, destination display, text, letters, words, labels, digits, numbers, logos, brand marks, school name, captions, watermark, title lettering, user interface, buttons, panels other than the blank sign, speech bubbles, arrows, icons, HUD, question mark, road, ground, floor, shadow, background, a bus facing left, a bus seen from the front or from above, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

## 6. `passageiros.png` — grade 4 × 4, célula 256 × 256

Cada aparelho é **um personagem inteiro**: o rosto no próprio corpo (olhos
grandes, bochechinha, sorriso), dois bracinhos e duas perninhas, de pé e de
frente, esperando contente. Todos com ~200 px de altura.

| Célula | id | O quê | Tecnologia? |
|---|---|---|---|
| 0 | `clock` | relógio redondo de parede com ponteiros e tracinhos, **sem números** | sim |
| 1 | `fridge` | geladeira de duas portas | sim |
| 2 | `speaker` | caixinha de som redonda com o alto-falante na frente | sim |
| 3 | `phone` | celular em pé, com a tela de bolinhas coloridas de app (sem letras) | sim |
| 4 | `tv` | televisão de tela plana em pezinho, tela desligada azul-escura | sim |
| 5 | `microwave` | micro-ondas com a porta de vidro à esquerda e o painel de botões à direita | sim |
| 6 | `computer` | computador: monitor com o tecladinho na frente | sim |
| 7 | `projector` | projetor com a lente redonda na frente | sim |
| 8 | `camera` | câmera fotográfica | sim |
| 9 | `cardMachine` | maquininha de cartão com um cartão encaixado em cima | sim |
| 10 | `scale` | balança eletrônica de mercado com o pratinho em cima e o visor **apagado** | sim |
| 11 | `trafficLight` | semáforo de pedestre baixinho, de três luzes, a de baixo verde | sim |
| 12 | `pencil` | lápis amarelo em pé, de ponta para cima | **não** |
| 13 | `wateringCan` | regador | **não** |
| 14 | — | **vazia** | — |
| 15 | — | **vazia** | — |

O rosto fica **no corpo do aparelho**. Na TV, no celular e no computador o
rosto fica **na moldura ou no corpo, nunca na tela**, para a tela poder acender
por código.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small rosy cheeks; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact character sprite sheet for a Phaser 3 game where cute everyday devices wait at a bus stop.
Primary request: create ONE exact 4 columns × 4 rows sprite sheet on a transparent 1024 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each character is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. Cells 14 and 15 stay COMPLETELY EMPTY and transparent.

ALL fourteen characters follow ONE recipe so they look like the same family: the object itself is the whole body; a friendly face with two big glossy eyes, small rosy cheeks and a small smile is drawn ON the object's body; two short stubby arms resting at the sides; two short stubby legs standing; facing the viewer; happy waiting pose; each about 200 px tall. No character glows, has a special border, a badge or a different style. The pencil and the watering can are drawn exactly like the others.

Exact cells, left to right and then top to bottom:
0. clock — a round wall clock with two hands and small tick marks, NO numerals; the face is on the clock body below the hands.
1. fridge — a two-door refrigerator.
2. speaker — a round speaker with a big speaker cone on the front.
3. phone — a standing smartphone whose screen shows a few colourful rounded app dots, no letters; the face is on the phone's lower frame, not on the screen.
4. tv — a flat-screen television on a small stand, screen OFF and plain dark blue; the face is on the TV's lower frame, not on the screen.
5. microwave — a microwave oven with a glass door on the left and a small button panel on the right, no digits.
6. computer — a computer monitor with a small keyboard in front of it, screen OFF and plain dark blue; the face is on the monitor's lower frame, not on the screen.
7. projector — a small video projector with one round lens on its front.
8. camera — a cute photo camera.
9. cardMachine — a small card payment machine with a card inserted at the top, blank grey display.
10. scale — an electronic grocery scale with a round pan on top and a blank dark display, no digits.
11. trafficLight — a short pedestrian traffic light with three lamps, only the bottom one lit green.
12. pencil — a yellow pencil standing upright, point up.
13. wateringCan — a watering can.
14. EMPTY.
15. EMPTY.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, humans, children, animals, hair, clothes, hats, text, letters, words, labels, digits, numbers on the clock, numbers on displays, letters on keys, logos, brand marks, app names, faces drawn on screens, pictures on the TV or computer screen, cartoons on screens, glowing characters, special borders, badges, plug cables, extra objects, characters in cells 14 or 15, captions, watermark, title lettering, user interface, buttons, panels, frames, speech bubbles, HUD, question mark, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, bench, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

## 7. `situacoes.png` — grade 4 × 4, célula 256 × 256

Cada célula é uma **cena pequena num quadradinho de cantos redondos** (~230 px),
com fundo próprio, que vai dentro da placa do ponto. Sempre **a mesma criança**:
o Davi, de cabelo cacheado castanho-escuro, pele morena-clara, camiseta amarela
e bermuda azul. A cena mostra **o problema**, nunca o aparelho que resolve.

| Célula | id | A cena | Não pode aparecer |
|---|---|---|---|
| 0 | `time` | Davi de pijama, com a mochila nas costas, olhando para os lados, preocupado, um "?" no alto | relógio, celular, despertador |
| 1 | `iceCream` | Davi segurando uma casquinha de sorvete pingando, num dia de sol, aflito | geladeira, freezer |
| 2 | `music` | Davi na pose de dançar, numa sala quieta, com um balãozinho de nota musical | caixinha, rádio, fone, celular |
| 3 | `grandma` | Davi abraçando um porta-retratos com a foto da vovó, com saudade, um coraçãozinho | telefone, celular, computador |
| 4 | `cartoon` | Davi sentado no sofá com um pote de pipoca, olhando para a frente, entediado | televisão, tela, tablet |
| 5 | `soup` | Davi à mesa com uma tigela de sopa com floquinhos de gelo, tremendo de frio | micro-ondas, fogão |
| 6 | `rollCall` | uma professora sorridente na frente de 3 crianças de braço levantado, numa sala de aula | computador, prancheta com tela |
| 7 | `story` | a professora segurando um livrinho fechado, e as crianças olhando para uma parede grande e vazia | projetor, tela, televisão |
| 8 | `photo` | Davi e uma amiga posando, sorrindo e fazendo "paz e amor" | câmera, celular |
| 9 | `fare` | Davi de mãos dadas com a mãe na roleta de entrada de um ônibus | maquininha, cartão, dinheiro |
| 10 | `fruit` | uma banca com uma pilha de bananas e maçãs e a vendedora sorrindo, um "?" no alto | balança |
| 11 | `cross` | Davi de mãos dadas com o pai na beira de uma faixa de pedestres, carros passando | semáforo, sinal |
| 12 | `notebook` | Davi na carteira da escola com o caderno aberto e a página em branco, pensando | lápis, caneta, computador |
| 13 | `garden` | uma flor murcha num canteiro de terra seca, e Davi agachado, triste | regador, mangueira, água |
| 14 | — | **vazia** | — |
| 15 | — | **vazia** | — |

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; clear readable emotions with small emotion marks; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every tile. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact sprite sheet of small situation vignettes for a Phaser 3 game; each vignette shows an everyday PROBLEM that a device could solve, but never the device.
Primary request: create ONE exact 4 columns × 4 rows sprite sheet on a transparent 1024 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each cell holds ONE square vignette tile with big rounded corners, about 230 × 230 px, with its own simple soft background inside, complete, isolated and centred in its cell, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. Cells 14 and 15 stay COMPLETELY EMPTY and transparent.

The SAME chibi boy appears in every vignette where he is mentioned: Davi, curly dark-brown hair, light-brown skin, yellow t-shirt, blue shorts, big glossy eyes. Keep his design identical across all cells. Each vignette shows the PROBLEM only; the device that would solve it must NOT appear anywhere in that vignette.

Exact cells, left to right and then top to bottom:
0. time — Davi in pajamas with a school backpack on, looking around, worried, one small question mark above him. NO clock, phone or alarm anywhere.
1. iceCream — Davi holding an ice-cream cone that is melting and dripping, a hot sun, worried face. NO fridge or freezer.
2. music — Davi in a dancing pose in a quiet room, a small thought bubble with one music note. NO speaker, radio, headphones or phone.
3. grandma — Davi hugging a picture frame with a photo of his smiling grandma, missing her, a small heart. NO phone or computer.
4. cartoon — Davi sitting on a sofa holding a bowl of popcorn, looking straight ahead, bored. NO television, screen or tablet.
5. soup — Davi at a table with a bowl of soup covered with tiny ice crystals and frosty wisps, shivering. NO microwave or stove.
6. rollCall — a smiling teacher at the front of a classroom and three small children raising their hands. NO computer.
7. story — the teacher holding a small closed storybook and children looking at a big EMPTY blank wall. NO projector, screen or television.
8. photo — Davi and a girl friend posing side by side, smiling, making peace signs. NO camera or phone.
9. fare — Davi holding his mother's hand at the turnstile at the entrance of a bus. NO card machine, card or money.
10. fruit — a market stall with a pile of bananas and apples and a smiling woman vendor, one small question mark above. NO scale.
11. cross — Davi holding his father's hand at the edge of a zebra crossing with a cute car passing. NO traffic light or signal.
12. notebook — Davi at a school desk with an open notebook showing a blank page, thinking, hands empty. NO pencil, pen or computer.
13. garden — one wilted droopy flower in a dry soil flower bed, Davi crouching beside it, sad. NO watering can, hose or water.
14. EMPTY.
15. EMPTY.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, clocks, phones, televisions, screens, tablets, computers, speakers, radios, headphones, fridges, microwaves, stoves, projectors, cameras, card machines, cards, money, scales, traffic lights, pencils, pens, watering cans, hoses, devices of any kind, a different boy in different cells, text, letters, words, labels, digits, numbers, writing in the notebook, writing on the board, logos, captions, watermark, title lettering, user interface, buttons, speech bubbles with words, arrows, HUD, vignettes in cells 14 or 15, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, scary scenes, crying hard, angry faces.
~~~

## 8. `cover-rota-do-busao.png` — 1672 × 941, opaco

A capa mostra a rua do bairro com o **busão amarelo** parado no ponto. A
**caixinha de som** pula do banco para embarcar, dando tchau, e a **geladeira**
e o **relógio** já acenam das janelas. A placa do ponto mostra o Davi dançando.
O título vai em cima. Anexe a referência `19` e as folhas `onibus.png`,
`passageiros.png` e `situacoes.png` aprovadas.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover, not a sticker.
OBJECTS — THE OTHER ATTACHED IMAGES (onibus.png, passageiros.png and situacoes.png) ARE THE REFERENCES FOR THE BUS, THE BUS STOP, THE DEVICE CHARACTERS AND THE BOY DAVI: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Rota do Busão”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Rota do Busão” in large chunky rounded playful multicolour letters with a thick dark outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly these three words, letter for letter, with capitalization and the accent exactly: R-o-t-a [space] d-o [space] B-u-s-ã-o. The “ã” in “Busão” MUST carry its tilde. No extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, a sunny neighbourhood street seen from the side: the cute yellow school bus with a smiling face, facing right, is stopped at a cute bus stop; the round speaker character hops off the bench toward the bus door, waving goodbye; the fridge character and the clock character already wave happily from two of the bus windows; the blank sign of the bus stop shows the small vignette of Davi dancing with a music-note thought bubble; one more device character (the microwave) still waits on the bench. Make "help the right device get on the bus" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; bus, bus stop and characters large beneath it and fully visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, adult drivers, extra words, misspelled title, missing tilde, subtitle, punctuation, numbers, route numbers, destination display, words on the bus, words on the sign, labels, logos, brand marks, school name, captions, signs with writing, watermark, score, HUD, buttons, question mark, speech bubbles with words, arrows, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped bus, sad faces, crying, angry faces.
~~~

## 9. O que conferir quando a arte chegar

- as grades (ou o tamanho que vier, medido): `cenario` 4 × 2, `onibus` 2 × 2
  de células largas, `passageiros` e `situacoes` 4 × 4; o corte medido na folha
  inteira, sem peça cruzando célula;
- no `bus`: **as 6 janelas** (medir a caixa de cada uma, porque é onde quem
  embarca aparece), **a porta** (medir: é onde o código abre o vão) e as **2
  caixas de roda** (medir o centro: é onde as rodas giram); de frente para a
  **direita**;
- no `stop`: **a placa em branco** (medir: é onde entram a cena e a frase) e a
  **altura do banco** (onde os passageiros pisam);
- os passageiros **do mesmo tamanho e da mesma receita**, o lápis e o regador
  sem diferença de estilo, e nenhum dígito em relógio, visor ou tecla;
- em cada cena de situação, **nenhum aparelho** que resolva a cena, e o Davi
  igual em todas;
- no `bg-rua`: a calçada e a rua **lisas** (sem juntas e sem faixas), e as
  linhas da calçada (y 520) e do meio-fio (y 600) medidas em 1280 × 720;
- a base comum do `cenario` (y ≈ 490 da célula);
- a grafia do título da capa, **com o "ã"**.
