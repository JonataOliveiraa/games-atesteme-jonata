# Portas do Computador — texturas

Destino: `src/assets/games/EF03CO06/portas-do-computador/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 fácil e claro, §5 tela, §6 personagens).

**Anexe em toda geração:** `references/35-chibi-voador.webp` (linha **chibi voador**, a mesma do Pinball). Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

> **O elenco da referência vai para o negativo.** A imagem é uma fanart de Genshin Impact: quatro meninos com roupas de fantasia, slimes, nuvens, arco-íris e balões com símbolos. Se ninguém proibir, o gerador copia tudo isso.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Situação |
|---|---|---|---|---|---|
| `aparelhos.png` | 3 × 2 | 256 | 768 × 512 | sim | **já existe** (copiar da pasta do Pinball): teclado, microfone, câmera / alto-falante, tela, impressora |
| `pecas.png` | 4 × 4 | 256 | 1024 × 1024 | sim | **já existe**: chip apagado e aceso, folha, estrela, nota, desenho… |
| `bg-mundo.png` | — | — | 1280 × 720 | opaco | **novo**: rua e jardim de dia |
| `computador.png` | — | — | ~400 × 560 | sim | **novo**: o gabinete, com a janela de vidro mostrando a placa |
| `informacoes.png` | 4 × 3 | 320 | 1280 × 960 | sim | **novo**: Notinha, Fotinho e Letrinha, 4 poses cada |
| `pessoas.png` | 3 × 3 | 320 | 960 × 960 | sim | **novo**: Vovó Rosa, Theo e Professora Bia, 3 poses cada |
| `pedidos.png` | 3 × 1 | 256 | 768 × 256 | sim | **novo**: orelha, olho, folha |
| `cover-portas-do-computador.png` | — | — | 1672 × 941 | opaco | **novo**, com o título |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem e o conteúdo de cada célula não podem mudar.

**O que é indispensável para o N1:** o computador e as informações. Fundo, pessoas e pedidos podem chegar depois (N2), porque a arte de reserva segura até lá. A capa vem por último.

## 2. Regras deste jogo

- **Sem azul forte e sem laranja forte** nos desenhos. São as cores das molduras de ENTRADA (azul) e SAÍDA (laranja), que o código desenha. Cor de categoria não pode aparecer como pista.
- **Ninguém segura aparelho.** Pessoas e informações aparecem sem microfone, fone, câmera, celular ou tela. O aparelho é só a porta.
- **Sem texto**, salvo duas exceções: o "A" da Letrinha e o título da capa. Nomes de portas, plaquinhas e pedidos são do código.
- Personagem solto e centrado na célula, com cerca de 8 % de margem, pés na mesma linha (95 % da altura da célula), sem chão e sem sombra caída.

---

## 3. `bg-mundo.png` — 1280 × 720, opaco

Uma rua de bairro, fofa, de dia. O computador (≈ 400 × 560) fica no meio, por cima do fundo. As informações chegam pela calçada da esquerda; as pessoas esperam no jardim da direita.

| Região | O que tem |
|---|---|
| x 0–380 | calçada larga que entra pela borda esquerda e vem até o centro; o chão fica em y ≈ 560 |
| x 380–900 | **área calma**: um pedaço liso de grama e céu (o computador cobre) |
| x 900–1280 | jardinzinho com um caminho até o centro; chão em y ≈ 560 |
| em cima | céu claro com poucas nuvens chapadas, **pequenas** e paradas nos cantos |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A cheerful daytime neighborhood background for a children's game, 16:9 (1280 x 720), opaque, seen straight from the front like a stage, no characters. The ground line is at about 78% of the height. On the LEFT third, a wide, clean, light-cream sidewalk path enters from the left edge and leads to the center, with a few small pastel bushes and a little lamp post near the left edge. On the RIGHT third, a small cozy garden with soft mint grass, a few round flowers and a light stone path leading from the right edge to the center. The CENTER of the image (from about 30% to 70% of the width) must be CALM and PLAIN: just smooth mint grass on the ground and clear pale sky above, because a big building will be placed there by the game. Pale lilac-and-mint sky with two or three small flat cream clouds near the top corners. Soft, even, happy light.

DO NOT INCLUDE: people, characters, animals, a house or building in the center, computers, monitors, keyboards, microphones, cameras, speakers, printers, antennas, phones, cars, traffic, any text, letters or numbers, signs with words, logos, busy details in the center, night scene, dark colors, strong blue or strong orange areas, big clouds, cloud creatures, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, rainbows, speech bubbles with symbols, fantasy decor, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective lines converging.
~~~

---

## 4. `computador.png` — cerca de 400 × 560, alfa

O **computador de verdade**, no meio da tela: um gabinete (torre) fofo, de frente, com uma **janela de vidro** que mostra a placa por dentro. Os aparelhos ficam do lado de fora, e o jogo desenha os **fios e as portas** na lateral esquerda. O jogo põe por cima:
- o **processador**, no encaixe vazio do meio da placa;
- as **6 luzes do objetivo**, na faixa escura do alto;
- os fios dos aparelhos, que chegam às bordas do gabinete.

| Região (na imagem) | O que tem |
|---|---|
| alto (≈ 3–20 %) | uma **faixa escura e lisa** na horizontal, onde ficam as 6 luzes (o código desenha as luzes) |
| meio (≈ 25–80 %) | **janela de vidro** retangular com a placa-mãe azul-escura, trilhas finas e um **encaixe quadrado vazio** no centro |
| baixo | botão de ligar redondo, grades de ventilação e dois pezinhos |
| bordas esquerda e direita | lisas, sem botão nem enfeite (os fios chegam aqui) |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A single game asset on a fully TRANSPARENT background: a cute, chunky desktop COMPUTER TOWER (PC case) seen straight from the front, portrait orientation (about 400 x 560). Soft light-grey and pale-lilac case with rounded corners and a thick friendly outline. Near the TOP, a plain smooth DARK horizontal strip across the front (completely empty, no lights drawn). In the MIDDLE, a big rectangular glass window with rounded corners showing the inside of the computer: a dark navy circuit board with thin soft circuit traces and small dots, and an EMPTY square socket in the center (nothing in the socket), with a soft glass reflection streak. At the BOTTOM, a round mint power button, a few horizontal vent slots and two small rounded feet. The left and right edges of the case are plain and smooth. Centered in the image, no ground, no cast shadow.

DO NOT INCLUDE: a chip or processor in the socket, fans, lights, LEDs, cables, wires, plugs, USB ports drawn on the edges, a monitor, a keyboard, a mouse, microphones, cameras, speakers, printers, a face on the computer, characters, people, animals, plants, a house, a roof, doors, any text, letters or numbers, logos, brand names, strong blue or strong orange areas, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy decor, colored background behind the computer, ground, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective, side view.
~~~

---

## 5. `informacoes.png` — 4 × 3 células de 320 (1280 × 960), alfa

Uma linha por personagem e uma coluna por pose. Os três têm o **mesmo tamanho** e o mesmo jeito: um objeto fofo com rostinho, bracinhos e perninhas curtos.

| Linha | Personagem | Desenho fixo |
|---|---|---|
| 0 | **Notinha** (SOM) | nota musical dupla, lilás brilhante; o rostinho fica na cabeça da nota de baixo |
| 1 | **Fotinho** (IMAGEM) | foto quadrada de moldura branca: em cima, uma paisagem (morro verde, sol, céu claro); o rostinho fica na faixa branca de baixo |
| 2 | **Letrinha** (LETRAS) | pecinha quadrada creme com cantos redondos e um **"A" grande lilás** em relevo; o rostinho fica embaixo do A |

| Coluna | Pose |
|---|---|
| 0 | **andando A**: um pé à frente, bracinhos balançando, sorriso |
| 1 | **andando B**: o outro pé à frente (forma o passo com a coluna 0) |
| 2 | **feliz**: pulando, bracinhos para cima, olhos fechados de alegria |
| 3 | **tonto**: depois de bater na porta errada; olhos em espiral, estrelinhas na cabeça, corpo inclinado |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; huge glossy eyes with two bright highlights, small pink blush ovals, tiny expressive mouths, lively poses. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 3 rows, each cell 320 x 320 (total 1280 x 960), read left to right, top row first. Three cute living-object characters, one per ROW, each with a little face, tiny stubby arms and two tiny feet. All three are the SAME size (about 75% of the cell height), centered, feet on the same baseline at 95% of the cell height.
ROW 1 — NOTINHA: a glossy lilac double music note (two joined eighth notes); her face is on the lower round note head.
ROW 2 — FOTINHO: a square instant photo with a white frame; the picture on top shows a simple landscape (a green hill, a yellow sun, a pale sky); his face is on the wide white strip at the bottom of the frame.
ROW 3 — LETRINHA: a rounded cream square letter tile with a big raised lilac capital letter "A" on the upper part of the front; her face is below the "A".
COLUMNS (the same 4 poses for every character):
1. Walking, one foot forward, little arms swinging, smiling.
2. Walking, the OTHER foot forward (the next step of column 1), smiling.
3. Happy: jumping with both little arms up, eyes closed with joy.
4. Dizzy: just bumped into something, swirly eyes, two tiny stars above the head, body tilted.

DO NOT INCLUDE: any text, letters or numbers other than the single letter "A" on Letrinha, other letters on Letrinha, words, microphones, cameras, keyboards, speakers, screens, printers, phones, headphones, devices of any kind, people, animals, extra characters, different sizes between rows, strong blue or strong orange areas, ground, shadows on the ground, colored backgrounds behind the characters, characters crossing cell borders, characters cut by the cell edge, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy outfits, weapons, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `pessoas.png` — 3 × 3 células de 320 (960 × 960), alfa

Quem **recebe** a informação (N2 e N3). Uma linha por pessoa e uma coluna por pose. Corpo inteiro, de frente, o mesmo tamanho nas três linhas (a vovó um pouquinho mais baixa, mas na mesma linha de pés). **Ninguém segura nada.**

| Linha | Pessoa | Desenho fixo |
|---|---|---|
| 0 | **Vovó Rosa** | cabelo branco curto e cacheado, óculos redondos, casaquinho rosa, saia lilás |
| 1 | **Theo** (8 anos) | pele morena-clara, cabelo preto arrepiado, moletom amarelo-claro, bermuda cinza, tênis brancos |
| 2 | **Professora Bia** | pele marrom-clara, cabelo castanho num coque, blusa lilás, saia creme, sapatilhas |

| Coluna | Pose |
|---|---|
| 0 | **esperando**: mãos juntas na frente do peito, sorriso esperançoso, olhando para a frente |
| 1 | **feliz**: dançando ou pulando, braços para cima, olhos fechados de alegria |
| 2 | **confusa**: cabeça inclinada, uma mão coçando a cabeça, boquinha torta |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; characters with very big round heads (about half of the body height) on tiny soft chubby bodies with stubby limbs and lively poses, huge glossy eyes with a dark upper lash line, gradient irises and two or three bright highlights, small pink blush ovals, tiny expressive mouths. Take ONLY the art style: do NOT copy its characters, outfits, hairstyles, scarves, clouds, slimes, rainbow, speech bubbles or framing.

A character sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 3 rows, each cell 320 x 320 (total 960 x 960), read left to right, top row first. Three chibi characters, one per ROW, full body, facing the viewer, centered, feet on the same baseline at 95% of the cell height, the same size in every cell of a row. Their hands are always EMPTY.
ROW 1 — GRANDMA ROSA: a sweet grandmother, short curly white hair, round glasses, a pink cardigan and a lilac skirt (slightly shorter than the others).
ROW 2 — THEO: an 8-year-old boy, light-brown skin, spiky black hair, a pale-yellow hoodie, grey shorts, white sneakers.
ROW 3 — TEACHER BIA: a young teacher, medium-brown skin, brown hair in a neat bun, a lilac blouse, a cream skirt, flat shoes.
COLUMNS (the same 3 poses for everyone):
1. Waiting: hands clasped in front of the chest, hopeful smile, looking at the viewer.
2. Happy: dancing or hopping with both arms up, eyes closed with joy.
3. Confused: head tilted, one hand scratching the head, crooked little mouth.

DO NOT INCLUDE: anything in their hands, microphones, headphones, earphones, cameras, phones, tablets, keyboards, computers, monitors, speakers, printers, paper, books, bags, music notes, sound waves, speech balloons, any text, letters or numbers, different outfits between cells of a row, side or back views, extra characters, animals, strong blue or strong orange clothes, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, fantasy outfits, armor, weapons, ground, shadows on the ground, scenery, colored backgrounds behind the characters, characters crossing cell borders, characters cut by the cell edge, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `pedidos.png` — 3 × 1 células de 256 (768 × 256), alfa

Os ícones que vão dentro do balão do pedido, ao lado do verbo. Mostram **o que a pessoa quer fazer**, e nunca o aparelho.

| Célula | Ícone | Pedido |
|---|---|---|
| 0 | **orelha** fofa de desenho, cor de pele clara, com 2 linhas curvas de som ao lado | OUVIR |
| 1 | **olho** fofo e grande, aberto, brilhante, com cílios | VER |
| 2 | **folha** de papel com o canto dobrado e um desenhinho simples (sol e casinha) | no PAPEL |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A small icon sheet on a fully TRANSPARENT background: 3 cute, simple icons in a row, each in its own 256 x 256 cell (total 768 x 256), the same size (about 75% of the cell), centered, no ground, no shadow.
1. A cute cartoon EAR in a light skin tone, seen from the side, with two small curved sound lines next to it.
2. A big cute cartoon EYE, wide open, with a glossy iris, two highlights and soft lashes.
3. A sheet of PAPER with a folded corner and a tiny simple crayon drawing on it (a sun and a little house).

DO NOT INCLUDE: faces, heads, people, hands, speakers, headphones, monitors, screens, glasses, printers, cameras, devices of any kind, music notes, any text, letters or numbers, strong blue or strong orange areas, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles, colored backgrounds behind the icons, items crossing cell borders, items cut by the cell edge, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. `cover-portas-do-computador.png` — 1672 × 941, opaco, com o título

No meio fica o computador: o gabinete com janela de vidro e o processador aceso, sorrindo. Do lado esquerdo, o microfone, a câmera e o teclado estão ligados nele por fios. A Notinha pula para dentro do microfone, e uma luz corre pelo fio até o computador. A Fotinho e a Letrinha esperam a vez na calçada, felizes. O título vai num letreiro no alto (memória *capa tem título*).

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on hair and shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; characters with very big round heads (about half of the body height) on tiny soft chubby bodies with stubby limbs and lively poses, huge glossy eyes with a dark upper lash line, gradient irises and two or three bright highlights, small pink blush ovals, tiny expressive mouths. Take ONLY the art style: do NOT copy its characters, outfits, hairstyles, scarves, clouds, slimes, rainbow, speech bubbles or framing.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque, on a sunny pastel neighborhood street. In the CENTER-RIGHT, a cute chunky desktop COMPUTER TOWER (light-grey and pale-lilac case) with a big glass window showing a dark navy circuit board and a glowing square processor chip with a tiny happy face. On the LEFT side of the computer, three devices are connected to it by short cables: a desk microphone, a photo camera and a chunky keyboard. NOTINHA — a cute lilac double music note with a little face, tiny arms and feet — happily jumps into the microphone, and a soft glowing light runs along the microphone cable into the computer. On the sidewalk in the front left, FOTINHO — a cute square instant photo with a little landscape picture, a face on the white bottom strip, tiny arms and feet — and LETRINHA — a cute cream letter tile with a big lilac letter "A" and a little face — wait in line, waving happily. At the top center, a cute rounded sign shows the title "Portas do Computador" in big, bold, rounded, friendly letters, spelled exactly like that.

DO NOT INCLUDE: any other text besides the title and the single letter "A" on Letrinha, misspelled title, extra letters, subtitles, numbers, scores, logos, brand names, people, children, girls, boys, a house, a building with a roof, doors, a pinball table, balls, flippers, dark or night scene, harsh neon, other characters, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, rainbows, speech bubbles with symbols, fantasy outfits, weapons, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 9. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24) e os pontinhos soltos (essa linha vem com franja).
2. Conferir célula por célula:
   - a ordem;
   - o "A" da Letrinha certo e sozinho;
   - ninguém segurando aparelho ou objeto;
   - o encaixe do processador vazio e a faixa de luzes lisa.
3. Medir o computador (janela, encaixe, faixa de luzes, bordas) e ajustar o `data/layout.ts`.
4. Anotar tudo no `MANIFEST.md` da pasta de assets.
