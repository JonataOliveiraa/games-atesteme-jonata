# Manobrista da Matriz — texturas

Destino: `src/assets/games/EF04CO01/manobrista-da-matriz/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 fácil e claro, §6 tela, §7 direção).

**Sem imagem de referência:** a linha é a **chibi voador** (a mesma do Portas do Computador e do Quem Bate à Porta), descrita toda em palavras no bloco STYLE de cada prompt. Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-patio.png` | — | — | 1280 × 720 (ou 1672 × 941) | opaco | o entorno do estacionamento, com o asfalto liso no meio |
| `carros.png` | 3 × 2 | 256 | 768 × 512 | sim | 6 carrinhos vistos de cima, nariz para cima |
| `controles.png` | 3 × 2 | 320 | 960 × 640 | sim | volante, pedais (soltos e apertados), botão ESTACIONAR |
| `pecas.png` | 4 × 2 | 256 | 1024 × 512 | sim | cone, tíquete, "pof", estrela, buzininha, farol, motorista, seta de pista |
| `cover-manobrista-da-matriz.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem e o conteúdo de cada célula não podem mudar.

**O que é indispensável para o N1:** o fundo, os carros e os controles. As peças podem vir depois, e a capa por último.

## 2. Regras deste jogo

- **As vagas, as linhas pintadas e os números NÃO vão na arte.** O código desenha a grade, porque ela muda de tamanho a cada nível (3×3, 3×4, 4×4). O fundo só traz o **asfalto liso**, sem faixas, no lugar do pátio.
- **Sem texto** em nenhuma célula, nem nos pedais e no botão: ACELERAR, RÉ e ESTACIONAR são escritos pelo código. A única exceção é o título da capa.
- **Os carros são vistos exatamente de cima** (planta, 90°), com o **nariz para cima**, todos do mesmo tamanho e do mesmo formato, mudando só a cor. Assim o código gira o carro para qualquer direção.
- **Os carrinhos são de brinquedo, fofos e arredondados.** Não têm rosto nem olhos (o motorista é peça separada) e não têm sombra caída.
- Peça solta e centrada na célula, com cerca de 8 % de margem.

---

## 3. `bg-patio.png` — 1280 × 720, opaco

Vista **exatamente de cima**, como o pátio do jogo. O código desenha as vagas por cima do asfalto.

| Região | O que tem |
|---|---|
| x 250–1050, y 100–700 | **asfalto cinza-azulado claro, liso e vazio**: sem faixas, sem números, sem setas, sem carros |
| contorno do asfalto | meio-fio creme arredondado |
| x 0–240 (esquerda) | grama com flores e duas árvores redondas vistas de cima; embaixo, um espaço livre de grama lisa (o volante fica ali) |
| x 1060–1280 (direita) | grama, um poste de luz e arbustos; embaixo, grama lisa (os pedais ficam ali) |
| embaixo à direita (≈ 1000, 700) | o **portão** de entrada do pátio: uma abertura no meio-fio com uma cancela listrada aberta |
| no alto (y 0–90) | uma faixa de calçada com pedrinhas e grama, sem nada escrito (o painel do pedido fica ali) |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes.

A background for a children's game, 16:9 (1280 x 720), opaque, seen EXACTLY FROM ABOVE (top-down, flat plan view, no perspective). In the CENTER, a big empty parking lot: a plain smooth light blue-grey asphalt rectangle (about 62% of the width and 83% of the height, from x 20% to 82% and y 14% to 97%), completely EMPTY and PLAIN, with a soft rounded cream curb around it. NO painted lines, NO parking spaces, NO numbers, NO arrows on the asphalt. At the bottom right corner of the lot, an entrance gap in the curb with a cute striped barrier gate lifted open. Around the lot, seen from above: soft green grass with little flowers, round tree crowns, small bushes and one lamp post; a strip of light paving stones along the top edge. The bottom-left and bottom-right grass corners are calm and plain (game buttons will go there). Bright, sunny, friendly mood.

DO NOT INCLUDE: painted parking lines, parking spaces, numbers, letters, text, signs with words, arrows on the ground, cars, vehicles, people, characters, animals, shadows of cars, perspective or 3D angle, side views, buildings in perspective, night, rain, scary or dark elements, red danger colors, fantasy decor, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `carros.png` — 3 × 2 células de 256 (768 × 512), alfa

O **mesmo carrinho de brinquedo**, visto **exatamente de cima**, com o **nariz para cima** (faróis no alto, lanternas embaixo), centrado e ocupando ≈ 50 % da largura e ≈ 85 % da altura da célula. Muda só a cor.

| Célula | Cor |
|---|---|
| 0 | vermelho-coral |
| 1 | azul-céu |
| 2 | amarelo |
| 3 | verde-menta |
| 4 | lilás |
| 5 | laranja |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes.

A sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 256 x 256 (total 768 x 512), read left to right, top row first. In every cell, the SAME cute rounded toy car seen EXACTLY FROM ABOVE (top-down plan view, 90 degrees), pointing UP: headlights at the top, tail lights at the bottom, a light-blue windshield and rear window, a rounded roof, four little dark wheels just peeking out at the sides. Same shape, same size (about half of the cell width and 85% of the cell height), centered. Only the body color changes:
1. coral red. 2. sky blue. 3. sunny yellow. 4. mint green. 5. lilac. 6. orange.

DO NOT INCLUDE: side views, front views, 3D angle, perspective, faces or eyes on the cars, drivers, people, text, letters, numbers, license plates with characters, logos, brand marks, different car shapes between cells, different sizes between cells, shadows on the ground, road, parking lines, background colors behind the cars, cars crossing cell borders, cars cut by the cell edge, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `controles.png` — 3 × 2 células de 320 (960 × 640), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **volante** de frente: aro grosso redondo, três raios e um botão de buzina no meio; o raio de baixo é mais grosso, para ver para onde está girado | o controle da esquerda |
| 1 | **pedal ACELERAR**: placa alta arredondada verde-menta com uma seta grande para cima | o pedal da direita |
| 2 | **pedal RÉ**: a mesma placa em laranja-claro com uma seta grande para baixo | o pedal do meio |
| 3 | **botão ESTACIONAR**: um botão largo e redondo azul com um grande "P" branco | aparece dentro da vaga |
| 4 | o **pedal ACELERAR apertado**: o mesmo, mais baixo e mais escuro, afundado | enquanto o dedo segura |
| 5 | o **pedal RÉ apertado** | enquanto o dedo segura |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 320 x 320 (total 960 x 640), read left to right, top row first. Big, chunky, friendly game controls for a children's car game, each centered with about 8% margin.
1. A cute STEERING WHEEL seen from the front: a thick round rim, three spokes, a round horn button in the middle; the bottom spoke is thicker so you can tell how it is turned. Fills about 90% of the cell.
2. A tall rounded GAS PEDAL plate in mint green with a big white arrow pointing UP on it.
3. The SAME pedal plate in light orange with a big white arrow pointing DOWN on it.
4. A wide round blue PARKING BUTTON with a big white letter "P" on it.
5. The mint GAS PEDAL from cell 2, PRESSED: slightly shorter and a bit darker, as if pushed down.
6. The orange pedal from cell 3, PRESSED in the same way.

DO NOT INCLUDE: any text or letters other than the single "P" in cell 4, numbers, hands, feet, people, cars, dashboards, car interiors, backgrounds behind the items, shadows on the ground, items crossing cell borders, items cut by the cell edge, different pedal shapes between cells 2, 3, 5 and 6, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `pecas.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **cone** laranja de trânsito visto de cima e um pouco de lado (fofo, listra branca) | marca a vaga do N2 |
| 1 | **tíquete** de estacionamento em branco (papelzinho creme com borda picotada e um furinho) | as 3 opções do N2; a coordenada é escrita pelo código |
| 2 | **"pof"**: nuvenzinha fofa de batida com 3 estrelinhas | quando o carro encosta |
| 3 | **estrela** dourada | acerto, confete |
| 4 | **buzininha**: ondas curvas de som saindo de um pontinho | o carro errado buzina |
| 5 | **farol aceso**: brilho amarelo em leque | o "bip-bip" do fim de nível |
| 6 | **motorista feliz**: criança chibi de boné, de corpo inteiro, acenando | desce do carro no acerto |
| 7 | **seta de pista** branca arredondada, apontando para cima | as setas de circulação que o código pinta no corredor |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes; the one character has a very big round head on a tiny chubby body, huge glossy eyes and small pink blush ovals.

A sprite sheet on a fully TRANSPARENT background, a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Each item centered in its cell with about 8% margin, no ground, no shadow.
1. A cute orange TRAFFIC CONE with one white stripe.
2. A blank cream PARKING TICKET: a small paper slip with a perforated edge on one side and a little round hole, nothing written on it.
3. A soft white BUMP PUFF cloud with three tiny yellow stars, like a gentle "poof".
4. A golden cute STAR with a soft shine.
5. HONK marks: three curved sound waves coming out of a small dot.
6. A soft yellow HEADLIGHT GLOW: a fan-shaped beam of light.
7. A happy chibi DRIVER kid with a cap, full body, waving one hand.
8. A white rounded ROAD ARROW pointing up, as painted on the ground.

DO NOT INCLUDE: any text, letters or numbers (the ticket stays blank), cars, roads, backgrounds behind the items, ground, shadows on the ground, extra characters, scary elements, red danger colors, items crossing cell borders, items cut by the cell edge, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `cover-manobrista-da-matriz.png` — 1672 × 941, opaco, com o título

Um estacionamento alegre visto de cima, com as vagas em fileiras e colunas e números grandes pintados nas bordas (só na capa: *1, 2, 3* nas linhas, à esquerda, e *1, 2, 3, 4* nas colunas, no alto). Carrinhos coloridos estacionados, e um carrinho amarelo entrando numa vaga com rastro de movimento. Num canto, um volante e dois pedais fofos. O título vai num letreiro no alto (memória *capa tem título*).

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque. A bright, friendly parking lot seen from above at a gentle angle: parking spaces arranged in neat ROWS and COLUMNS, with big round number signs painted on the ground: 1, 2, 3 down the left side (one per row) and 1, 2, 3, 4 along the top (one per column). Cute rounded toy cars in pastel colors (coral, sky blue, mint, lilac, orange) are parked in some spaces. A sunny yellow toy car is driving into one empty space, with little motion lines and a sparkle. In the bottom corner, a cute steering wheel and two rounded pedals (mint with an up arrow, orange with a down arrow). Green grass, round trees and a lifted striped barrier gate around the lot. At the top center, a cute rounded sign shows the title "Manobrista da Matriz" in big, bold, rounded, friendly letters, spelled exactly like that.

DO NOT INCLUDE: any other text besides the title and the small row and column numbers, misspelled title, extra letters, subtitles, logos, brand marks, license plates with characters, people with scary faces, faces on the cars, traffic accidents, police, night, rain, red danger colors, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24) e os pontinhos soltos (essa linha vem com franja).
2. Conferir:
   - os carros exatamente de cima, de nariz para cima, todos do mesmo formato;
   - nenhuma letra nos pedais (só o "P" no botão);
   - o asfalto do fundo liso, sem faixas.
3. Medir o asfalto, o portão e os cantos livres no fundo, e ajustar `YARD`, `GATE`, `WHEEL` e `PEDALS` no `data/layout.ts`.
4. Anotar tudo no `MANIFEST.md` da pasta de assets.
