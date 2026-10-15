# Quem Bate à Porta? — texturas

Destino: `src/assets/games/EF03CO09/quem-bate-a-porta/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 fácil e claro, §6 tela, §8 pedidos).

**Sem imagem de referência:** a linha é a **chibi voador** (a mesma do Portas do Computador), descrita toda em palavras no bloco STYLE de cada prompt. Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-sala.png` | — | — | 1280 × 720 | opaco | abertura: a Nina no sofá com o tablet |
| `bg-corredor.png` | — | — | 1280 × 720 | opaco | o corredor do aplicativo, sem portas, com nevoeiro à direita |
| `portas.png` | 4 × 2 | 300 × 460 | 1200 × 920 | sim | 5 portas fechadas, o vão aberto, portinha apagada e acesa |
| `pessoas.png` | 3 × 5 | 320 × 400 | 960 × 2000 | sim | vovó, turma, escola, desconhecido e Davi, 3 poses cada |
| `informacoes.png` | 3 × 3 | 256 | 768 × 768 | sim | os 9 pictogramas das informações |
| `pecas.png` | 4 × 2 | 256 | 1024 × 512 | sim | ícones dos botões, toc-toc, coração, estrela, lixeira |
| `cover-quem-bate-a-porta.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem e o conteúdo de cada célula não podem mudar.

**O que é indispensável para o N1:** `bg-corredor`, `portas`, `pessoas`, `informacoes` e `pecas`. O `bg-sala` pode vir depois (a abertura tem reserva), e a capa vem por último.

## 2. Regras deste jogo

- **Sem texto** em nenhuma célula: nomes, rótulos e palavras (ENDEREÇO, VOVÓ…) são do código. A única exceção é o **"?"** da porta e do avatar do desconhecido, e o título da capa.
- **Nada marca a resposta.** As portas têm o mesmo tamanho, o mesmo desenho e o mesmo brilho; só a cor muda. A do desconhecido é **cinza**, não escura nem assustadora. Os pictogramas têm todos o mesmo peso.
- **O desconhecido não assusta.** É um avatar de jogo, cinza, de capuz, com uma telinha no lugar do rosto mostrando um "?". Nada de monstro, máscara, sorriso maldoso ou sombra.
- **As pessoas seguram um celular** (é assim que pedem). A Nina só aparece no `bg-sala`.
- Peça solta e centrada na célula, com cerca de 8 % de margem, sem chão e sem sombra caída.

---

## 3. `bg-corredor.png` — 1280 × 720, opaco

O "dentro do aplicativo": um corredor fofo e claro, **sem nenhuma porta** (o código põe as portas). As portas vão ficar com o chão em y 560, nos x 140, 340, 540, 740 e 960, ocupando 170 × 300 cada; por isso a parede tem de estar **lisa e livre** de x 40 a 1050, entre y 240 e 560.

| Região | O que tem |
|---|---|
| y 0–560, x 0–1050 | parede lilás-clara com rodapé creme e uma faixa decorativa suave no alto (bolinhas, estrelinhas), lisa onde vão as portas |
| y 560–720 | piso de tábuas claras, com um tapete comprido menta ao longo do corredor |
| x 1050–1280 | o corredor **continua para longe e some num nevoeiro** azul-acinzentado claro; ali o código põe as portinhas cinzentas |
| detalhes | pequenos ícones de aplicativo flutuando no alto (balõezinhos de conversa vazios, coraçõezinhos), bem discretos, para dizer "isto é dentro do tablet" |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes.

A wide background for a children's game, 16:9 (1280 x 720), opaque, no characters and NO DOORS. It shows a cute, bright hallway inside a messaging app, seen straight from the front. The back wall is a soft pale lilac with a cream baseboard and a gentle decorative band of tiny dots and little stars near the top; the wall is PLAIN and EMPTY from the left edge to about 82% of the width (room for a row of doors that will be added later). The bottom 22% is a light wooden plank floor with a long mint-green runner rug along the hallway. On the RIGHT 18% of the image, the hallway goes on into the distance and fades into a soft, light grey-blue fog, calm and quiet, with nothing inside it. A few small, faint floating app symbols near the ceiling (empty chat bubbles, tiny hearts) say "this is inside a tablet". Calm, friendly, cozy mood.

DO NOT INCLUDE: doors, door frames, windows, people, characters, faces, animals, furniture in front of the wall, text, letters, numbers, logos, signs with words, dark corners, scary or gloomy elements, night, red danger colors, phones or tablets drawn as objects, fantasy decor, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `bg-sala.png` — 1280 × 720, opaco

A abertura. A câmera entra na tela do tablet, então **a tela do tablet tem de ser grande, clara e lisa**, mais ou menos no centro (entre x 500–780 e y 260–440).

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; characters with very big round heads (about half of the body height) on tiny soft chubby bodies with stubby limbs and lively poses, huge glossy eyes with a dark upper lash line, gradient irises and two or three bright highlights, small pink blush ovals, tiny expressive mouths.

A wide scene for a children's game, 16:9 (1280 x 720), opaque. A cozy living room in the afternoon. In the center, NINA, an 8-year-old girl with warm brown skin, dark curly hair in two round puffs, big brown eyes, a lilac T-shirt with a small mint-green leaf, mint shorts and white sneakers, sits on a soft mint sofa, holding a TABLET with both hands and turning it towards the viewer, smiling curiously. The tablet screen is BIG, centered in the picture, plain light lilac and EMPTY, with a soft glow. Around her: a cushion, a small plant, a window with soft daylight, a rug. Calm and warm.

DO NOT INCLUDE: anything on the tablet screen, apps, text, letters, numbers, logos, other people, animals, scary elements, night, red danger colors, fantasy outfits, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `portas.png` — 4 × 2 células de 300 × 460 (1200 × 920), alfa

As portas 0–4 são **o mesmo desenho** (porta de madeira arredondada no alto, com moldura, uma janelinha redonda e uma **plaquinha em branco** no alto, onde o código põe o ícone de quem é), mudando **só a cor**. Elas ficam de pé, de frente, ocupando a célula inteira menos 6 % de margem, com a base reta no fundo da célula.

O código abre a porta "achatando" a folha fechada para o lado da dobradiça e mostra o **vão aberto** (célula 5) atrás dela, com a pessoa dentro.

| Célula | Peça |
|---|---|
| 0 | porta **lilás** fechada (VOVÓ) |
| 1 | porta **verde-menta** fechada (TURMA) |
| 2 | porta **amarelo-clara** fechada (DAVI) |
| 3 | porta **coral-clara** fechada (ESCOLA) |
| 4 | porta **cinza-clara** fechada, com um **"?"** na plaquinha (DESCONHECIDO) |
| 5 | o **vão aberto**: só a moldura (sem folha), com o interior iluminado de luz creme, sem nada dentro |
| 6 | **portinha cinza pequena e apagada**, simples, desbotada (lá longe no nevoeiro) |
| 7 | a **mesma portinha acesa**: a janelinha brilhando em azul-claro, como uma tela acesa |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes.

A sprite sheet on a fully TRANSPARENT background, a grid of 4 columns x 2 rows, each cell 300 x 460 (total 1200 x 920), read left to right, top row first. Doors seen straight from the front, standing upright, each filling its cell with about 6% margin, the bottom edge flat at the bottom of the cell. Cells 1 to 5 are the EXACT SAME cute door design (a wooden door with a rounded top, a soft frame, one small round window, a round knob and a small BLANK name plate near the top), only the color changes:
1. The door painted soft LILAC, closed.
2. The same door painted MINT GREEN, closed.
3. The same door painted PALE YELLOW, closed.
4. The same door painted SOFT CORAL, closed.
5. The same door painted LIGHT GREY, closed, with a single white question mark "?" on its name plate. Calm and neutral, not dark or scary.
6. The SAME door frame, OPEN and EMPTY: only the frame with no door leaf, and a warm cream light inside the doorway, nothing and nobody in it.
7. A SMALL, simple light-grey door, faded, as if far away in fog, closed and unlit (drawn smaller, about 55% of the cell height, centered at the bottom).
8. The SAME small grey door, with its little window glowing soft light blue like a lit screen.

DO NOT INCLUDE: any text, letters or numbers other than the single "?" on door 5, names on the plates, people, faces, hands, animals, walls or floor around the doors, different door shapes between cells 1 to 5, different sizes between cells 1 to 6, dark or scary doors, locks, chains, red danger colors, colored backgrounds behind the doors, ground, shadows on the ground, items crossing cell borders, items cut by the cell edge, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `pessoas.png` — 3 × 5 células de 320 × 400 (960 × 2000), alfa

Quem aparece no vão da porta. **Corpo inteiro, de frente**, todos do mesmo tamanho, com os pés no mesmo ponto (95 % da altura da célula). Cada **linha** é uma pessoa; cada **coluna** é uma pose:

| Coluna | Pose | Quando |
|---|---|---|
| 0 | **pedindo**: segura um celular numa mão e acena/aponta para ele com a outra, sorriso simpático | a porta abre e a pessoa pede |
| 1 | **feliz**: os braços para cima ou abraçando o celular, olhos fechados de alegria | recebeu o que pediu (certo) |
| 2 | **triste**: ombros caídos, olhos marejados | ficou sem (erro), ou o Davi quando contaram o segredo dele |

| Linha | Quem |
|---|---|
| 0 | **VOVÓ**: cabelo branco num coque, óculos redondos, casaquinho lilás |
| 1 | **TURMA**: três crianças juntinhas (uma de óculos, uma de tranças, um de boné), dividindo o mesmo celular |
| 2 | **ESCOLA**: a professora, jovem, cabelo preso, blusa coral, crachá em branco |
| 3 | **DESCONHECIDO DO JOGO**: avatar de jogo cinza-claro, de capuz, com uma telinha no lugar do rosto mostrando um **"?"**. Na coluna 1 (feliz), a telinha mostra um sorrisinho; na coluna 2, em vez de triste, ele **levanta o celular** com linhas de "enviando" saindo (é o encaminhar) |
| 4 | **DAVI**: 8 anos, pele clara, cabelo castanho liso com franja, camiseta amarelo-clara. Na coluna 0, em vez de pedir, ele **responde** com a mão aberta, sorrindo |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; characters with very big round heads (about half of the body height) on tiny soft chubby bodies with stubby limbs and lively poses, huge glossy eyes with a dark upper lash line, gradient irises and two or three bright highlights, small pink blush ovals, tiny expressive mouths.

A character sprite sheet on a fully TRANSPARENT background, a grid of 3 columns x 5 rows, each cell 320 x 400 (total 960 x 2000), read left to right, top row first. Each ROW is one character in 3 poses; every character is full body, facing the viewer, the SAME size, feet on the same baseline at 95% of the cell height, centered.
Columns: 1 = ASKING: holding a smartphone in one hand and pointing at it with the other, friendly smile. 2 = HAPPY: arms up or hugging the phone, eyes closed with joy. 3 = SAD: shoulders down, teary eyes, small frown.
Rows:
1. GRANDMA: white hair in a bun, round glasses, a lilac cardigan.
2. THE CLASS: three cute kids standing close together sharing ONE phone (a girl with glasses, a girl with braids, a boy with a cap), drawn as one group that fits the cell.
3. THE TEACHER: a young woman with her hair tied up, a coral blouse and a blank name badge.
4. AN UNKNOWN GAME AVATAR: a light-grey hooded game character whose face is a small screen showing a white question mark "?". Calm and neutral, not scary. In column 2 the screen shows a tiny smile instead. In column 3, instead of being sad, the avatar HOLDS ITS PHONE UP HIGH with little "sending" lines coming out of it.
5. DAVI, an 8-year-old boy with light skin, straight brown hair with bangs and a pale-yellow T-shirt. In column 1, instead of asking, he ANSWERS with one open hand raised, smiling, phone in the other hand.

DO NOT INCLUDE: any text, letters or numbers other than the "?" on the avatar's face screen, writing on the phones' screens, villains, masks, hackers in dark clothes, evil grins, red danger colors, dark shadows, doors, walls, ground, shadows on the ground, scenery, colored backgrounds behind the characters, different sizes between cells, extra characters outside the class group, animals, fantasy outfits, armor, weapons, characters crossing cell borders, characters cut by the cell edge, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `informacoes.png` — 3 × 3 células de 256 (768 × 768), alfa

Os pictogramas que vão no balão do pedido, com a palavra embaixo (escrita pelo código). As informações do Davi (N2) usam os mesmos desenhos com o selo *"é do Davi"* do código, exceto o apelido e a foto com o amigo, que têm célula própria.

| Célula | Informação | Desenho |
|---|---|---|
| 0 | ENDEREÇO | casinha com uma **placa de número em branco** ao lado da porta |
| 1 | TELEFONE | celular fofo com o **teclado de números em branco** na tela |
| 2 | FOTO DO ROSTO | porta-retrato com o rosto sorridente de uma menina de cabelo cacheado em dois puffs (a Nina) |
| 3 | FOTO DO PASSEIO | foto de família na praia (adultos e criança, pequenos, sorrindo) |
| 4 | DESENHO | folha com desenho de giz de cera: um sol e um morrinho |
| 5 | COR FAVORITA | paleta de tinta com 3 gotas coloridas |
| 6 | APELIDO (do Davi) | etiqueta de nome em branco com uma estrelinha |
| 7 | FOTO COM O DAVI | foto de duas crianças sorrindo juntas (a Nina e o Davi) |
| 8 | **vazia** | — |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes.

An icon sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 3 rows, each cell 256 x 256 (total 768 x 768), read left to right, top row first. Cute, simple, chunky icons, all the SAME size (about 78% of the cell) and the same visual weight, centered, no ground, no shadow. None of them looks dangerous or sad.
Cells:
1. A small cute HOUSE with a blank number plate next to the door (no numbers).
2. A cute SMARTPHONE showing a blank number keypad (no digits).
3. A PICTURE FRAME with the smiling face of a girl with warm brown skin and dark curly hair in two puffs.
4. A PHOTO of a small happy family at the beach (two adults and a child, tiny and smiling).
5. A sheet of paper with a child's crayon DRAWING of a sun and a little hill.
6. A PAINT PALETTE with three colorful paint drops.
7. A blank NAME TAG with a little star (nothing written).
8. A PHOTO of two smiling kids together: a girl with dark curly puffs and a boy with straight brown hair with bangs.
9. EMPTY cell, fully transparent.

DO NOT INCLUDE: any text, letters, numbers or digits (not on the house, not on the phone, not on the tag), warning signs, red danger colors, skulls, sad or scary faces, hackers, masks, people other than inside the photos and the frame, different sizes between icons, anything in cell 9, colored backgrounds behind the icons, items crossing cell borders, items cut by the cell edge, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `pecas.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **aviãozinho de papel** branco, voando para a direita | ícone do ENVIAR; a informação voando |
| 1 | **caixinha** de presente creme **fechada**, com laço menta | ícone do NÃO ENVIAR |
| 2 | a **mesma caixinha aberta**, com brilho saindo | sem uso por enquanto (a célula fica para não mudar a grade) |
| 3 | **toc-toc**: três linhas curvas de impacto, como as de batida numa porta | quando alguém bate |
| 4 | **coração** rosa fofo | a pessoa recebeu (acerto) |
| 5 | **estrela** dourada | confete |
| 6 | **lixeira** fofa, de tampa | o APAGAR (N3) |
| 7 | **balão de conversa** com um **"?"** | ícone do PERGUNTAR (N2) |

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes.

A sprite sheet on a fully TRANSPARENT background, a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Each item centered in its cell with about 8% margin, no ground, no shadow.
Cells:
1. A white PAPER PLANE flying to the right, with a tiny motion swoosh.
2. A cute cream GIFT BOX, CLOSED, with a mint ribbon bow.
3. The SAME gift box, OPEN, with a soft glow and sparkles coming out.
4. KNOCK marks: three short curved impact lines, like the lines drawn when someone knocks on a door.
5. A cute pink HEART with a shine.
6. A golden cute STAR with a soft shine.
7. A cute small TRASH BIN with a lid.
8. A round chat BUBBLE with a single question mark "?" inside.

DO NOT INCLUDE: any text, letters or numbers other than the "?" in cell 8, faces on the items, people, hands, animals, doors, phones, red danger colors, colored backgrounds behind the items, ground, shadows on the ground, items crossing cell borders, items cut by the cell edge, different box sizes between cells 2 and 3, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. `cover-quem-bate-a-porta.png` — 1672 × 941, opaco, com o título

O corredor fofo do aplicativo, com a fileira de portas coloridas. Uma porta está aberta e a vovó acena de dentro com o celular; a Nina, na frente, segura o tablet e olha para ela, curiosa, com um aviãozinho de papel saindo do tablet. A porta cinza do desconhecido, com o "?", fica fechada mais adiante, e o corredor some no nevoeiro. O título vai num letreiro no alto (memória *capa tem título*).

~~~text
STYLE — cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; characters with very big round heads (about half of the body height) on tiny soft chubby bodies with stubby limbs and lively poses, huge glossy eyes with a dark upper lash line, gradient irises and two or three bright highlights, small pink blush ovals, tiny expressive mouths.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque. A cute, bright hallway inside a messaging app: a pale lilac wall with a row of rounded wooden doors in pastel colors (lilac, mint, pale yellow, coral), each with a small round window and a blank name plate. One door is OPEN, and a sweet GRANDMA with white hair in a bun, round glasses and a lilac cardigan waves happily from the doorway, holding a smartphone. In the front left, NINA, an 8-year-old girl with warm brown skin, dark curly hair in two round puffs, a lilac T-shirt with a small mint leaf, mint shorts and white sneakers, holds a tablet and looks at the grandma with a curious smile; a little white paper plane flies out of her tablet towards the open door. Further right, a light-grey door with a "?" on its plate stays closed, and the hallway fades into a soft grey-blue fog. At the top center, a cute rounded sign shows the title "Quem Bate à Porta?" in big, bold, rounded, friendly letters, spelled exactly like that, with the accent on the "à" and the question mark.

DO NOT INCLUDE: any other text besides the title, misspelled title, missing accent, extra letters, subtitles, numbers, logos, scary elements, villains, dark shadows, night, red danger colors, other characters, fantasy outfits, weapons, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 10. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24) e os pontinhos soltos (essa linha vem com franja).
2. Conferir célula por célula:
   - a ordem;
   - as portas 0–4 com o mesmo desenho e o mesmo tamanho;
   - nenhum número ou letra além dos "?";
   - o desconhecido sem cara de mau;
   - a parede do corredor lisa onde vão as portas.
3. Medir o vão da porta (célula 5) e a plaquinha, e ajustar `DOOR`, `PLATE` e `PERSON` no `data/layout.ts`; medir a tela do tablet no `bg-sala` para o zoom de abertura.
4. Anotar tudo no `MANIFEST.md` da pasta de assets.
