# Rádio da Escola — texturas

Destino: `src/assets/games/EF05CO09/radio-da-escola/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 a tela, §6 o N1, §10 o N2 e o N3).

> **Linha de arte: POP CHAPADO** (escolha do usuário em 20/10/2026). Anexe em **toda geração** as três referências:
> - [`references/30-pop-chapado-a.jpg`](../../../../references/30-pop-chapado-a.jpg)
> - [`references/31-pop-chapado-b.jpg`](../../../../references/31-pop-chapado-b.jpg)
> - [`references/32-pop-chapado-c.webp`](../../../../references/32-pop-chapado-c.webp)
>
> Cada prompt abaixo vem inteiro (estilo + corpo + negativo), pronto para copiar.

| Critério | Pop chapado (este jogo) |
|---|---|
| Traço | contorno **azul-marinho quase preto** (`#1B1446`), de espessura **uniforme e média**, liso e confiante |
| Cor | **100 % chapada, sem sombra**. Degradê só em **brilho, luz e céu**. Paleta de bala: rosa-choque `#FF3FA4`, ciano elétrico `#2EC5FF`, amarelo-limão `#FFE14D`, violeta `#9B5CFF`, índigo `#3A2A8C`, menta `#3FD9A0` |
| Olho | grande, com **íris colorida, pupila pequena e cílio superior grosso** |
| Silhueta | formas **angulosas**, pontas afiadas, cabelo em mechas pontudas; **sem keyline branca** |
| Enfeite | **estrelinhas de 4 pontas** e explosões estreladas |

**O ambiente é um show no espaço** (pedido do usuário, 20/10/2026): *"o jogo é de música… o bg deveria ser algo meio roxo com estrelas e luzes e universo."* Nada de escola, sala ou estúdio.

**O elenco das referências vai no NEGATIVO de todos os prompts.** As imagens mostram moças-demônio vermelhas com chifre, uma loira de vestido vermelho, uma moça de cabelo comprido escuro com vestido preto, meias listradas e um gato de pelúcia, anjinhos de auréola, um homem de black power, um bichinho verde, um menino ruivo de fone, armas e poses adultas. Nada disso entra no jogo. **Os personagens daqui são crianças de 8 a 11 anos**, com proporção de criança (cabeça grande, braços e pernas curtos). A roupa de cantora da Duda é **de show infantil**: brilho e estrela, sem roupa curta, salto ou maquiagem.

**O jogo já roda sem nenhum PNG.** O N1 está desenhado em `Graphics` (`scenes/fallback.ts`), assado nas mesmas folhas e grades daqui. Um PNG com o nome daqui substitui a reserva sem mudar código.

**O que é do código e não vem em arte:** a pista em perspectiva, a linha de acerto, os fachos de luz, PERFEITO / BOA, o COMBO, o cabeçalho com o NO AR, as estrelas piscando e os dois fachos que varrem o palco.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `palco.png` | — | — | 1280 × 720 | opaco | o fundo: o palco do show no universo roxo |
| `duda.png` | 4 × 1 | 320 × 400 | 1280 × 400 | sim | a Duda, cantora, da cintura para cima, em 4 poses |
| `donos.png` | 6 × 4 | 256 | 1536 × 1024 | sim | os 8 donos das músicas (busto), 3 expressões cada |
| `capas.png` | 4 × 2 | 256 | 1024 × 512 | opaco | as 8 capas dos CDs |
| `ui.png` | 4 × 2 | 256 | 1024 × 512 | sim | nota, brilho de acerto, bilhete, estojo, disco, coração, moldura ao vivo, estrela |
| `cover-radio-da-escola.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**Para testar o N1 com arte bastam os cinco primeiros.** Os **insubstituíveis** são `donos.png` e `capas.png`: a criança reconhece o dono pelo rosto e o CD pela capa.

**A ordem das células é contrato com o código.** O tamanho pode variar (o jogo mede cada célula), mas a grade, a ordem e o conteúdo não. Em `duda.png` e `donos.png` a **posição dentro da célula também é contrato** (o código não recorta, para a figura não pular ao trocar de quadro): mesma escala e mesmo enquadramento em todas as células.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Título da música, nome do dono, bilhete, "NO AR", PERFEITO e COMBO são do código. Só a capa do jogo tem letreiro.
- **Nenhum CD parece "o certo".** Nenhuma capa tem cadeado, selo, check, X, cor de aviso ou brilho especial. Quem decide é o bilhete, que o código escreve. A capa mais chamativa (o foguete) é de propósito a de quem **não** deixa.
- **O meio do palco fica calmo.** A pista é desenhada por cima, do alto do centro (x 570–710, y 170) até embaixo (x 260–1020, y 600 e além). Ali o fundo é céu escuro e liso.
- Brancos e cinzas claros na nota, no brilho, na estrela e no selo do disco são **de propósito**: o código tinge.

---

## 3. `palco.png` — 1280 × 720, opaco

O fundo inteiro: **um palco de show flutuando no universo**.

| Região | O que tem |
|---|---|
| céu | universo **roxo e índigo** com nebulosas rosa e violeta, muitas estrelinhas de 4 pontas e pontinhos de luz; mais escuro e liso no **meio** (x 400–880), onde fica a pista |
| cantos de cima | duas **torres de luz** de show (treliças com refletores redondos), uma em cada canto, apontando para o centro; os fachos são do código |
| embaixo | a borda de uma **plataforma de palco** brilhante (ciano e rosa) atravessando a tela por volta de y 640 |
| cantos de baixo | a **plateia** em silhueta índigo escura, cabecinhas redondas, com **bastões de luz** rosa, ciano e amarelo para cima; só nos cantos (x 0–260 e x 1020–1280) |

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (two-color gradients only in the sky, glows and light); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; four-point sparkle accents and starbursts. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A full-frame game BACKGROUND, 1280 x 720, opaque, front view: a dreamy POP CONCERT STAGE FLOATING IN OUTER SPACE. The sky is a deep purple and indigo universe with soft hot-pink and violet nebula clouds, many four-point sparkle stars of different sizes and tiny dots of light; the CENTER of the image (x 400 to 880, from the top down to y 620) is darker and plain, a calm deep indigo sky with only a few tiny stars, because a note highway will be drawn on top of it. In the two TOP CORNERS, a show LIGHT TOWER each, a violet lattice truss with three round spotlights pointing toward the center (no beams drawn). Across the bottom, around y 640, the glowing front edge of a stage platform in electric cyan and hot pink. In the two BOTTOM CORNERS only (x 0 to 260 and x 1020 to 1280), a happy CROWD in dark indigo silhouette, small round heads, holding up glow sticks in hot pink, cyan and lemon yellow. No characters on the stage.

DO NOT INCLUDE: text, letters, numbers, logos, signs, screens with writing, a note highway, lanes, music notes in the center, light beams crossing the center, people on the stage, singers, microphones, instruments in the center, detailed faces in the crowd, school, classroom, houses, checkerboard backgrounds, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 4. `duda.png` — 4 × 1 células de 320 × 400 (1280 × 400), alfa

**Duda**, a cantora da rádio (≈ 10 anos), com **roupa de show infantil**: pele parda, cabelo crespo escuro preso num **pompom alto** com um elástico amarelo-limão e duas **presilhas de estrela**; **jaqueta curtinha violeta brilhante** com estrelinhas, sobre uma **blusa ciano** com uma estrela branca no peito; **microfone de cabeça** (headset fino rosa-choque com a bolinha do microfone perto da boca); munhequeiras rosa. **Da cabeça até a cintura**, cortada por uma linha reta na cintura, de frente, centrada, cerca de 88 % da altura da célula, **com a mesma escala e o mesmo lugar nas quatro** (o código não recorta). Ela entra e sai de cena deslizando, então a cintura cortada nunca aparece.

| Célula | Pose |
|---|---|
| 0 | **falando**: sorriso de boca aberta, uma mão acenando na altura do ombro |
| 1 | **cantando**: olhos fechados em arco, boca aberta cantando, uma mão no microfone de cabeça, duas notinhas musicais em volta |
| 2 | **susto**: olhos arregalados, as duas mãos perto das bochechas, uma gotinha de suor |
| 3 | **comemorando**: os dois braços para cima, olhos fechados, sorriso enorme, estrelinhas de 4 pontas em volta |

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; eyes with a big colored iris, small pupil and thick upper lashes; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game sprite sheet on a fully TRANSPARENT background: 4 columns x 1 row, each cell 320 x 400 (total 1280 x 400), left to right. The SAME character in all four cells, same size, same framing and same position: DUDA, a 10-year-old Brazilian girl who is a kids' POP SINGER, a CHILD with kid proportions (big head, short arms), warm brown skin, amber-brown eyes, dark coily hair tied in one high puff with a lemon-yellow scrunchie and two small star hair clips; a short shiny VIOLET stage jacket with little star sequins over an electric-cyan top with a white star on the chest; a thin hot-pink HEADSET MICROPHONE with the little mic near her mouth; hot-pink wristbands. Shown from the head down to the WAIST only, facing the viewer, centered, about 88% of the cell tall, the body cut by a straight line at the waist (never by the cell edge).
1. TALKING: open happy smile, one hand waving at shoulder height.
2. SINGING: eyes closed in happy arcs, mouth open singing, one hand touching the headset mic, two tiny music notes floating beside her.
3. STARTLED: wide eyes, both hands near her cheeks, one sweat drop.
4. CELEBRATING: both arms raised high, eyes closed, huge smile, a few four-point sparkles around.

DO NOT INCLUDE: legs, feet, stage, backgrounds, colored tiles, text, letters, other people, hand-held microphones with cables, headphones over the ears, a different hairstyle or outfit between cells, items crossing cell borders, adult woman, mature body, makeup, lipstick, earrings, crop top, short skirt, revealing clothes, suggestive poses, the characters from the reference images, orange-haired freckled boy with headphones, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 5. `donos.png` — 6 × 4 células de 256 (1536 × 1024), alfa

Os donos das músicas, em **busto** (cabeça e ombros), de frente, centrados, cerca de 84 % da célula, cortados por uma linha reta nos ombros, **com a mesma escala e o mesmo lugar em todas as células**. Eles aparecem dentro da **bolha ao vivo** (um círculo), então o rosto precisa ficar no **centro** da célula. **Cada fileira tem dois donos**: colunas 0–2 o primeiro, colunas 3–5 o segundo, sempre na ordem das expressões:

| Coluna (de cada dono) | Expressão |
|---|---|
| 0 / 3 | **ouvindo**: calmo, sorriso pequeno, olhando para a frente |
| 1 / 4 | **feliz dançando**: olhos fechados em arco, sorriso grande, cabeça inclinada, duas notinhas e estrelinhas |
| 2 / 5 | **bravo**: sobrancelhas para baixo, bochechas infladas, boca em bico, uma marquinha de raiva (o "cruzinho" de mangá) perto da testa |

| Fileira | Dono das colunas 0–2 | Dono das colunas 3–5 |
|---|---|---|
| 0 | **Bia** (≈ 10): pele parda-clara, cabelo preto liso e comprido com tiara rosa-choque, suéter amarelo-limão | **Téo** (≈ 9): pele clara, cabelo castanho-claro espetado, óculos redondos ciano, moletom índigo |
| 1 | **Malu** (≈ 10): pele negra, dois pompons de cabelo crespo, camiseta violeta com um gatinho pequeno | **Caio** (≈ 11): pele morena, cabelo preto cacheado curto, camiseta vermelha, munhequeira menta |
| 2 | **Iara** (≈ 11): pele morena-dourada, cabelo preto liso com franja reta, presilha de estrela, jaqueta ciano | **Juca** (≈ 9): pele parda, cabelo raspado preto, sorriso com uma janelinha de dente, camiseta listrada menta e branca |
| 3 | **Rosa** (≈ 8): pele bem clara, duas tranças ruivas, sardas, gola de vestido rosa-choque | **Zeca** (≈ 10): pele negra retinta, cabelo em twists curtos, boné amarelo-limão, camiseta branca |

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes, hair in pointed locks; eyes with a big colored iris, small pupil and thick upper lashes; small expressive marks (tiny music notes, four-point sparkles, a small manga anger mark) only where asked. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 6 columns x 4 rows, each cell 256 x 256 (total 1536 x 1024), read left to right, top row first. Every cell holds ONE head-and-shoulders BUST of a Brazilian schoolCHILD (kid proportions, round young face), facing the viewer, the FACE CENTERED in the cell, about 84% of the cell tall, cut by a straight line at the shoulders (never by the cell edge), same scale and same position in every cell, no frame, no background. Each ROW shows TWO different children: columns 1-3 are the first child, columns 4-6 the second child, and for each child the three columns are always the same three expressions in this order: (a) LISTENING, calm, small smile, looking at the viewer; (b) HAPPY DANCING, eyes closed in happy arcs, big smile, head tilted, two tiny music notes and four-point sparkles; (c) UPSET, eyebrows down, puffed cheeks, pouting mouth, one small manga anger mark near the forehead. Same child = same hair, skin and clothes in its three cells.
Row 1: BIA, about 10, light-brown skin, long straight black hair with a hot-pink headband, lemon-yellow sweater | TÉO, about 9, fair skin, spiky light-brown hair, round cyan glasses, indigo hoodie.
Row 2: MALU, about 10, dark-brown skin, two afro puffs, violet t-shirt with a tiny cat print | CAIO, about 11, tan skin, short curly black hair, red t-shirt, a mint wristband.
Row 3: IARA, about 11, golden-tan skin, straight black hair with a blunt fringe and a star hair clip, cyan jacket | JUCA, about 9, brown skin, black buzz cut, grin with one missing tooth, mint-and-white striped t-shirt.
Row 4: ROSA, about 8, very fair skin, two ginger braids, freckles, hot-pink dress collar | ZECA, about 10, deep dark skin, short twists, lemon-yellow cap, white t-shirt.

DO NOT INCLUDE: card frames, round frames, name tags, text, letters, numbers, backgrounds, colored tiles behind the busts, full bodies, hands covering faces, two people in one cell, items crossing cell borders, busts cut by the cell edge, adults, makeup, earrings, eyeshadow, different art styles between cells, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired freckled boy with headphones, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 6. `capas.png` — 4 × 2 células de 256 (1024 × 512), opaco

Capas de CD **quadradas**, cada uma preenchendo a célula de ponta a ponta, com um fundo chapado de uma cor própria. Uma ilustração simples e grande por capa, **sem letra nenhuma**.

| Célula | Música (dono) | A capa |
|---|---|---|
| 0 | Chuva no Telhado (Bia) | um telhado de telhas vermelhas sob nuvenzinhas, com gotas de chuva que viram notinhas musicais; fundo ciano |
| 1 | Parabéns, Vovó! (Téo) | um bolo de aniversário com uma vela e um coraçãozinho de crochê; fundo rosa-choque claro |
| 2 | Canção do Gato (Malu) | um gato laranja enrolado dormindo numa almofada, com notinhas saindo; fundo violeta |
| 3 | Batuque do Recreio (Caio) | dois tambores e um par de baquetas sobre o chão de lajotas do pátio; fundo amarelo-limão |
| 4 | Foguete Dançante (Iara) | um foguete brilhante subindo entre estrelas de 4 pontas e um globo de discoteca, a capa **mais chamativa** do jogo; fundo índigo com estrelas |
| 5 | Pula-Corda (Juca) | uma corda fazendo um arco e dois tênis pulando sobre uma amarelinha; fundo menta |
| 6 | Sapo Cantor (Rosa) | um sapo cantando de boca aberta numa vitória-régia; fundo verde-água |
| 7 | Assobio do Zeca (Zeca) | um passarinho assobiando num galho, com notinhas; fundo laranja-pêssego |

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (small two-color gradients only in shiny highlights); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game sprite sheet: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Every cell is ONE SQUARE MUSIC ALBUM COVER that fills the whole cell edge to edge, with its own flat background color and ONE big simple centered illustration, no text at all:
1. a red tiled ROOF under two small white clouds, with raindrops that turn into tiny music notes; electric-cyan background.
2. a BIRTHDAY CAKE with one candle and a small crocheted heart beside it; light hot-pink background.
3. an orange CAT curled up asleep on a round cushion, tiny music notes floating up; violet background.
4. two school DRUMS and a pair of drumsticks on courtyard floor tiles; lemon-yellow background.
5. a shiny ROCKET flying up among four-point stars next to a small disco ball, the brightest and most eye-catching cover of the set; deep indigo background with stars.
6. a JUMP ROPE making an arc over two sneakers jumping on a hopscotch; mint background.
7. a FROG singing with its mouth open on a lily pad; aqua-green background.
8. a small BIRD whistling on a branch with tiny music notes; peach-orange background.

DO NOT INCLUDE: text, letters, numbers, titles, band names, logos, barcodes, padlocks, check marks, X marks, warning signs, stickers, seals, badges, CD cases, CD discs, people, faces on objects, borders between cells, checkerboard backgrounds, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 7. `ui.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Observação |
|---|---|---|
| 0 | **nota**: uma barra **larga e baixa** (≈ 230 × 70), cantos bem arredondados, **branca** com uma faixa de brilho clara em cima e uma notinha cinza-clara no meio, contorno marinho | o código tinge e põe em perspectiva |
| 1 | **brilho de acerto**: uma explosão estrelada **branca** de 8 pontas, com estrelinhas de 4 pontas em volta | o código tinge, na linha de acerto |
| 2 | **bilhete**: um papelzinho de recado **em branco**, deitado (bem mais largo que alto, ≈ 240 × 110), branco-creme, com um pedaço de fita adesiva rosa-choque no alto | o código escreve |
| 3 | **estojo de CD vazio**: caixinha de CD de frente, quadrada, plástico transparente azulado, dobradiça fina à esquerda, **janela transparente** ocupando ~84 % do meio | a capa vai por baixo |
| 4 | **disco**: um CD visto de cima, prateado com faixas de arco-íris chapadas (rosa, ciano, limão, violeta), furo no meio, **selo redondo branco** liso (raio ≈ 36 % do disco) | o código põe a capa no selo |
| 5 | **coração** rosa-choque, gordinho | sobe da plateia |
| 6 | **moldura ao vivo**: um **anel** redondo grosso rosa-choque e violeta, **vazio por dentro** (transparente), com uma bolinha vermelha de "gravando" no alto à direita e duas estrelinhas | o dono aparece dentro |
| 7 | **estrela**: estrelinha de 4 pontas **branca**, gordinha | pisca no céu do palco |

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (small two-color gradients only in glows); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first, one centered object per cell with about 8% margin:
1. a RHYTHM-GAME NOTE: a wide, low, flat bar (about 230 x 70) with strongly rounded ends, WHITE, with a lighter shine stripe on top and a small light-grey music note symbol in the middle, navy outline.
2. a HIT SPARK: a WHITE eight-point starburst with a few small four-point sparkles around it.
3. a BLANK STICKY NOTE lying horizontally, much wider than tall (about 240 x 110), plain off-white paper with a strip of hot-pink washi tape on top, nothing written on it.
4. an EMPTY CD JEWEL CASE seen from the front, square, clear light-blue plastic with a thin hinge on the left side and a big TRANSPARENT window covering the middle 84% of the case.
5. a CD DISC seen from above: silver with a few flat rainbow bands (pink, cyan, lemon, violet), a center hole, and a plain WHITE round label in the middle (about 36% of the disc radius).
6. a chubby hot-pink HEART.
7. a LIVE FRAME: a thick round RING in hot pink and violet that is EMPTY and TRANSPARENT inside, with a small red "recording" dot on its upper right and two tiny four-point sparkles.
8. a chubby WHITE four-point STAR.

DO NOT INCLUDE: text, letters, numbers, "LIVE" words, writing on the sticky note, album art inside the case, labels printed on the disc, faces inside the ring, padlocks, check marks, X marks, faces on objects, people, backgrounds, items crossing cell borders, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

---

## 8. O que medir quando a arte chegar

| Arquivo | Medida | Onde entra |
|---|---|---|
| `palco.png` | se o meio (x 400–880) ficou calmo; se a plateia invadiu a pista | `HIGHWAY` (se precisar, o véu da pista fica mais escuro) |
| `ui.png` | a proporção da nota; o raio do selo do disco (% do disco); a janela do estojo (% da caixa); o miolo vazio da moldura ao vivo | `NOTE`, `DISC.label`, `CRATE.window`, `LIVE.hole` |
| `duda.png` | a altura da figura e onde fica a cintura | `CUTIN` |
| `donos.png` | se o rosto ficou no centro da célula | `LIVE.face` |

---

## 9. `cover-radio-da-escola.png` — 1672 × 941, opaco

A capa do catálogo, **com o título escrito**: *Rádio da Escola*.

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (two-color gradients only in the sky, glows, light and the title letters); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; eyes with a big colored iris, small pupil and thick upper lashes; four-point sparkle accents and starbursts. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game COVER illustration, 1672 x 941, opaque, landscape. At the TOP CENTER, a big bold pop title that reads exactly "Rádio da Escola" (with the accent on the á), in chunky rounded letters with a hot-pink to violet fill, a navy outline and a white offset shadow, with a small red ON-AIR dot and a starburst beside it. Below, a pop concert stage floating in a purple and indigo universe full of nebulas, four-point stars and spotlight beams: DUDA, a 10-year-old Brazilian girl pop singer, a CHILD with kid proportions, warm brown skin, dark coily hair in one high puff with a lemon-yellow scrunchie and star hair clips, a short shiny violet stage jacket with star sequins over an electric-cyan top, a thin hot-pink headset microphone, eyes closed and singing happily, one arm raised; behind her a glowing four-lane rhythm-game note highway in perspective going up to a spinning shiny CD at the far end, with candy-colored note bars (pink, lemon, mint, cyan) flying down it; a happy crowd silhouette with glow sticks in the bottom corners and little hot-pink hearts floating up. Cheerful, clear, lots of breathing room around the title.

DO NOT INCLUDE: any other text besides the title, misspelled title, English words, "ON AIR" words, "NEW", "PERFECT", "COMBO", score numbers, logos, brand names, padlocks, warning signs, school, classroom, adult characters, makeup, earrings, revealing clothes, suggestive poses, the characters from the reference images, orange-haired freckled boy with headphones, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, ghosts, guns, weapons, swords, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~


## 10. Registro de geração — Aquarela, 20/10/2026

Gerado com `image_gen` integrado. As três referências `30-pop-chapado-a.jpg`, `31-pop-chapado-b.jpg` e `32-pop-chapado-c.webp` foram anexadas em todas as tentativas. Nenhum código alterado. Os originais selecionados são RGB opacos de **1672 × 941 px** (resolução retornada pelo gerador), preservados sem redimensionamento em `outputs/radio-da-escola/raw/`. Para uso final, `palco.png` tem tamanho nominal 1280 × 720 conforme §3; o original permanece intacto.

### `palco.png` — prompt completo da versão selecionada

Centro escuro e calmo; torres nos cantos superiores, nebulosas e estrelas nas laterais, plateia nos cantos inferiores, sem texto. As tentativas anteriores foram descartadas por plateia no centro e plataforma alta.

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (two-color gradients only in the sky, glows and light); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; four-point sparkle accents and starbursts. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A full-frame game BACKGROUND, 1280 x 720, opaque, front view: a dreamy POP CONCERT STAGE FLOATING IN OUTER SPACE. The sky is a deep purple and indigo universe with soft hot-pink and violet nebula clouds, many four-point sparkle stars of different sizes and tiny dots of light; the CENTER of the image (x 400 to 880, from the top down to y 620) is darker and plain, a calm deep indigo sky with only a few tiny stars, because a note highway will be drawn on top of it. In the two TOP CORNERS, a show LIGHT TOWER each, a violet lattice truss with three round spotlights pointing toward the center (no beams drawn). Across the bottom, around y 640, the glowing front edge of a stage platform in electric cyan and hot pink. In the two BOTTOM CORNERS only (x 0 to 260 and x 1020 to 1280), a happy CROWD in dark indigo silhouette, small round heads, holding up glow sticks in hot pink, cyan and lemon yellow. No characters on the stage.

DO NOT INCLUDE: text, letters, numbers, logos, signs, screens with writing, a note highway, lanes, music notes in the center, light beams crossing the center, people on the stage, singers, microphones, instruments in the center, detailed faces in the crowd, school, classroom, houses, checkerboard backgrounds, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

STRICT NORMALIZED LAYOUT, REGARDLESS OF OUTPUT PIXEL SIZE: the stage front rim must sit at 89% of total IMAGE HEIGHT measured from the top (y 640 on a 720-high canvas), a thin single horizontal cyan and pink edge. The dark indigo sky continues UNINTERRUPTED all the way down to 86% of IMAGE HEIGHT (y 620 on a 720-high canvas). The sky in the CENTRAL VERTICAL BAND between 31% and 69% of IMAGE WIDTH is almost uniform very dark indigo, without any large bright stars, nebula, decoration, planet, spotlight beam, floor or platform. Only 3–5 tiny dim pinprick stars in this whole band. The stage FLOOR occupies only the last 11% of image height, at the very bottom, and has a flat dark indigo fill, no bright filled foreground platform, no polygons, no wedges. CROWD: two small groups confined to the extreme bottom corners, leftmost 20% and rightmost 20% of IMAGE WIDTH. Absolutely no heads, hands or glowsticks in the broad bottom-middle 60% of image width. All nebula clouds and all large four-point stars stay inside the outermost 27% of image width on each side. No planets. No grain or texture, only clean flat fills.
~~~

### `cover-radio-da-escola.png` — prompt completo da versão selecionada

Show espacial com Duda em proporção infantil e roupa cobrindo o tronco, pista de quatro faixas, CD e plateia. Título conferido: **Rádio da Escola**, incluindo o acento agudo em **á**; nenhum outro texto. A primeira tentativa foi descartada por barriga exposta.

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (two-color gradients only in the sky, glows, light and the title letters); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; eyes with a big colored iris, small pupil and thick upper lashes; four-point sparkle accents and starbursts. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game COVER illustration, 1672 x 941, opaque, landscape. At the TOP CENTER, a big bold pop title that reads exactly "Rádio da Escola" (with the accent on the á), in chunky rounded letters with a hot-pink to violet fill, a navy outline and a white offset shadow, with a small red ON-AIR dot and a starburst beside it. Below, a pop concert stage floating in a purple and indigo universe full of nebulas, four-point stars and spotlight beams: DUDA, a 10-year-old Brazilian girl pop singer, a CHILD with kid proportions, warm brown skin, dark coily hair in one high puff with a lemon-yellow scrunchie and star hair clips, a short shiny violet stage jacket with star sequins over an electric-cyan top, a thin hot-pink headset microphone, eyes closed and singing happily, one arm raised; behind her a glowing four-lane rhythm-game note highway in perspective going up to a spinning shiny CD at the far end, with candy-colored note bars (pink, lemon, mint, cyan) flying down it; a happy crowd silhouette with glow sticks in the bottom corners and little hot-pink hearts floating up. Cheerful, clear, lots of breathing room around the title.

DO NOT INCLUDE: any other text besides the title, misspelled title, English words, "ON AIR" words, "NEW", "PERFECT", "COMBO", score numbers, logos, brand names, padlocks, warning signs, school, classroom, adult characters, makeup, earrings, revealing clothes, suggestive poses, the characters from the reference images, orange-haired freckled boy with headphones, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, ghosts, guns, weapons, swords, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

STRICT CHILD-COSTUME CHECK: Duda must look unmistakably 10 years old: large head, round young face, short child arms and child torso, no adult hourglass shape. Her electric-cyan top is a REGULAR FULL-LENGTH T-SHIRT that completely covers her belly and waist even with one arm raised; zero exposed midriff. Violet stage jacket worn over the full-length shirt, loose full-length violet trousers and flat sneakers if the lower body is visible. NO crop top, NO skirt, NO bare belly, NO makeup or glossy lips. All skin, hair and clothes have solid flat fills with no gradients and no shaded facets. Title must read exactly Rádio da Escola: R-á-d-i-o [space] d-a [space] E-s-c-o-l-a; acute accent above the first á, no other words.
~~~




## Registro de geração — Aquarela, 20/10/2026 (§6 e §7)

Ferramenta: image_gen integrada. As três referências POP CHAPADO 30, 31 e 32 foram anexadas em todas as tentativas. Originais selecionados preservados em outputs/radio-da-escola/raw/capas.png e raw/ui.png (1774 × 887). Versões normalizadas em outputs/radio-da-escola/capas.png e ui.png: 1024 × 512, grade 4 × 2, células exatas de 256 × 256, ordem do contrato. Sem alteração de código. Regeneradas as tentativas com sombras excessivas, cores nos brilhos tingíveis e nota cruzando célula.

### Prompt completo usado — capas.png

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (small two-color gradients only in shiny highlights); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game sprite sheet: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Every cell is ONE SQUARE MUSIC ALBUM COVER that fills the whole cell edge to edge, with its own flat background color and ONE big simple centered illustration, no text at all:
1. a red tiled ROOF under two small white clouds, with raindrops that turn into tiny music notes; electric-cyan background.
2. a BIRTHDAY CAKE with one candle and a small crocheted heart beside it; light hot-pink background.
3. an orange CAT curled up asleep on a round cushion, tiny music notes floating up; violet background.
4. two school DRUMS and a pair of drumsticks on courtyard floor tiles; lemon-yellow background.
5. a shiny ROCKET flying up among four-point stars next to a small disco ball, the brightest and most eye-catching cover of the set; deep indigo background with stars.
6. a JUMP ROPE making an arc over two sneakers jumping on a hopscotch; mint background.
7. a FROG singing with its mouth open on a lily pad; aqua-green background.
8. a small BIRD whistling on a branch with tiny music notes; peach-orange background.

DO NOT INCLUDE: text, letters, numbers, titles, band names, logos, barcodes, padlocks, check marks, X marks, warning signs, stickers, seals, badges, CD cases, CD discs, people, faces on objects, borders between cells, checkerboard backgrounds, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

STRICT FLAT ART REQUIREMENT: create this as a simple flat vector cartoon sprite atlas, not a polished painted illustration. All eight backgrounds must each be a SINGLE EXACT SOLID RGB COLOR, no gradients, no lighting, no texture/noise. Background swatches: cyan #2EC5FF, pink #FF8ED1, violet #9B5CFF, yellow #FFE14D, indigo #3A2A8C, mint #3FD9A0, aqua #39D9C5, peach #FFB07B. Likewise all objects have perfectly uniform solid fills per part and navy outlines. DO NOT shade the cloud bottoms, cat fur, cushion, cake frosting, drums, frog, leaves, or bird. Only the rocket and disco ball may have tiny two-color shiny accents. Keep the full exactly aligned 4x2 equal-square grid, edge-to-edge opaque cover backgrounds, no gaps or drawn borders. Only two empty shoes with the jump rope, NO legs. Use very simple readable large shapes, 2D clip art.
~~~

### Prompt completo usado — ui.png

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (small two-color gradients only in glows); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first, one centered object per cell with about 8% margin:
1. a RHYTHM-GAME NOTE: a wide, low, flat bar (about 230 x 70) with strongly rounded ends, WHITE, with a lighter shine stripe on top and a small light-grey music note symbol in the middle, navy outline.
2. a HIT SPARK: a WHITE eight-point starburst with a few small four-point sparkles around it.
3. a BLANK STICKY NOTE lying horizontally, much wider than tall (about 240 x 110), plain off-white paper with a strip of hot-pink washi tape on top, nothing written on it.
4. an EMPTY CD JEWEL CASE seen from the front, square, clear light-blue plastic with a thin hinge on the left side and a big TRANSPARENT window covering the middle 84% of the case.
5. a CD DISC seen from above: silver with a few flat rainbow bands (pink, cyan, lemon, violet), a center hole, and a plain WHITE round label in the middle (about 36% of the disc radius).
6. a chubby hot-pink HEART.
7. a LIVE FRAME: a thick round RING in hot pink and violet that is EMPTY and TRANSPARENT inside, with a small red "recording" dot on its upper right and two tiny four-point sparkles.
8. a chubby WHITE four-point STAR.

DO NOT INCLUDE: text, letters, numbers, "LIVE" words, writing on the sticky note, album art inside the case, labels printed on the disc, faces inside the ring, padlocks, check marks, X marks, faces on objects, people, backgrounds, items crossing cell borders, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

FINAL ATLAS CONSTRAINTS: use a rigid 4 columns x 2 rows grid. Exact equal square cells with one object each. Maintain a fully empty TRANSPARENT SAFETY GUTTER along every cell boundary: no pixel of any sprite can cross or touch these boundaries. Note and sticky note should be about 86% of their cell width, horizontally centered; slightly reduce width if needed to keep safe margins. All objects centered on their cell centers, with generous empty transparent margin. Keep the bar achromatic white and pale neutral grey including its shine stripe (not blue); hit burst and ALL accompanying small stars pure WHITE with thin navy outlines, no colored rims. Last star pure white with navy outline. All colored objects are flat solid fills, no lighting shadows or 3D gradients. Disc center label a plain opaque white circle around its truly transparent small center hole, label radius exactly 36 percent of disc radius. CD case has truly empty transparent square interior; live ring has truly empty transparent circular interior. No blue haze, streaks, or reflections in either hole. No background and no checkerboard.
~~~


## Registro de geração — donos-b.png, Aquarela, 20/10/2026

Solicitação do Maestro: somente Iara/Juca e Rosa/Zeca, em duas fileiras. Ferramenta image_gen integrada; anexadas em todas as tentativas as refs 30, 31, 32 e src/assets/games/EF05CO09/radio-da-escola/duda.png. Selecionada a segunda geração, que conserva a camiseta branca do Zeca. Arte gerada em C:/Users/teste123/.codex/generated_images/01a1597f-6cbc-7242-a413-621db11c763c/exec-06592986-19dc-4d92-b8de-36c95dd7932f.png. Enquadramentos montados com sharp a partir dos corredores vazios, com um único fator de escala para os 12 bustos e linha dos ombros alinhada. Entrega: outputs/radio-da-escola/raw/donos-b.png, 1536 × 512, alfa, 6 × 2 células exatas de 256 × 256. Conferência de alfa: nenhum busto/símbolo cruza bordas; ordem ouvindo / feliz dançando / bravo; sem texto ou moldura.

### Prompt completo usado — donos-b.png

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes, hair in pointed locks; eyes with a big colored iris, small pupil and thick upper lashes; small expressive marks (tiny music notes, four-point sparkles, a small manga anger mark) only where asked. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 6 columns x 2 rows, each cell 256 x 256 (total 1536 x 512), read left to right, top row first. Every cell holds ONE head-and-shoulders BUST of a Brazilian schoolCHILD (kid proportions, round young face), facing the viewer, the FACE CENTERED in the cell, about 84% of the cell tall, cut by a straight line at the shoulders (never by the cell edge), same scale and same position in every cell, no frame, no background. Each ROW shows TWO different children: columns 1-3 are the first child, columns 4-6 the second child, and for each child the three columns are always the same three expressions in this order: (a) LISTENING, calm, small smile, looking at the viewer; (b) HAPPY DANCING, eyes closed in happy arcs, big smile, head tilted, two tiny music notes and four-point sparkles; (c) UPSET, eyebrows down, puffed cheeks, pouting mouth, one small manga anger mark near the forehead. Same child = same hair, skin and clothes in its three cells.
Row 1: IARA, about 11, golden-tan skin, straight black hair with a blunt fringe and a star hair clip, cyan jacket | JUCA, about 9, brown skin, black buzz cut, grin with one missing tooth, mint-and-white striped t-shirt.
Row 2: ROSA, about 8, very fair skin, two ginger braids, freckles, hot-pink dress collar | ZECA, about 10, deep dark skin, short twists, lemon-yellow cap, white t-shirt.

DO NOT INCLUDE: card frames, round frames, name tags, text, letters, numbers, backgrounds, colored tiles behind the busts, full bodies, hands covering faces, two people in one cell, items crossing cell borders, busts cut by the cell edge, adults, makeup, earrings, eyeshadow, different art styles between cells, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired freckled boy with headphones, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

PRODUCTION GRID — THIS IS ESSENTIAL: exactly 6 columns by 2 rows, 12 isolated busts. Treat each cell as a separate 256x256 transparent canvas. Each bust including ALL its hair, braids, hat, notes, sparkles and anger marks must fit inside x=24..232, y=20..235 OF ITS OWN CELL. Leave a clearly visible empty transparent corridor along ALL grid lines; absolutely no touching neighbors. Keep every FACE CENTER fixed at local (128,128) and shoulder cutoff on the straight horizontal line y=235. Use a compact narrow head-and-shoulder silhouette; do not spread Iara's hair or Rosa's braids wide. Even the widest hair/hat/symbol is comfortably INSIDE its cell. HAPPY faces may tilt slightly but stay on their same center. No torso below shoulders.

REFERENCE ROLES: images 1–3 are style only; image 4 (duda.png) is the approved game style, match its confident navy outline, flat colors, anime eyes and CHILD proportions, do not copy Duda's hair/clothes/identity. Four children only: Iara, Juca, Rosa, Zeca. All expression accessories remain small, close to the head, within the safety margins. Use flat solid fills without airbrushing, gradients, or shadows. No words, labels, panels, frames or grid lines drawn.

~~~


## Registro de geração — Aquarela, donos-a.png (20/10/2026)

Ferramenta: `image_gen` integrada. Recorte do contrato do §5 solicitado pelo Maestro: somente Bia | Téo e Malu | Caio, 6 colunas × 2 linhas, três expressões por criança. Referências anexadas em todas as tentativas: `references/30-pop-chapado-a.jpg`, `31-pop-chapado-b.jpg`, `32-pop-chapado-c.webp` e `src/assets/games/EF05CO09/radio-da-escola/duda.png`. A tentativa inicial foi regenerada por cabelos e símbolos atravessando limites das células. A versão selecionada usa também a tentativa anterior como alvo de correção, sem mudar o elenco.

Original preservado em `outputs/radio-da-escola/raw/donos-a.png`: **2172 × 724 px**, alfa, grade **6 × 2**, células de **362 × 362 px**, resolução retornada pelo gerador (nominal solicitado: 1536 × 512, células 256). Conferência visual: crianças em busto, sem texto ou moldura, identidade e roupa estáveis nos três quadros. Conferência de alfa: nenhuma das 12 células tem pixels com alfa ≥128 tocando a própria borda. Os cortes de ombros têm a mesma altura nos três quadros de cada criança. Nenhum código do jogo foi alterado.

Células, leitura da esquerda para a direita e de cima para baixo: 0 Bia ouvindo; 1 Bia feliz dançando; 2 Bia brava; 3 Téo ouvindo; 4 Téo feliz dançando; 5 Téo bravo; 6 Malu ouvindo; 7 Malu feliz dançando; 8 Malu brava; 9 Caio ouvindo; 10 Caio feliz dançando; 11 Caio bravo.

### Prompt completo usado — donos-a.png (versão selecionada)

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes, hair in pointed locks; eyes with a big colored iris, small pupil and thick upper lashes; small expressive marks (tiny music notes, four-point sparkles, a small manga anger mark) only where asked. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 6 columns x 2 rows, each cell 256 x 256 (total 1536 x 512), read left to right, top row first. Every cell holds ONE head-and-shoulders BUST of a Brazilian schoolCHILD (kid proportions, round young face), facing the viewer, the FACE CENTERED in the cell, about 84% of the cell tall, cut by a straight line at the shoulders (never by the cell edge), same scale and same position in every cell, no frame, no background. Each ROW shows TWO different children: columns 1-3 are the first child, columns 4-6 the second child, and for each child the three columns are always the same three expressions in this order: (a) LISTENING, calm, small smile, looking at the viewer; (b) HAPPY DANCING, eyes closed in happy arcs, big smile, head tilted, two tiny music notes and four-point sparkles; (c) UPSET, eyebrows down, puffed cheeks, pouting mouth, one small manga anger mark near the forehead. Same child = same hair, skin and clothes in its three cells.
Row 1: BIA, about 10, light-brown skin, long straight black hair with a hot-pink headband, lemon-yellow sweater | TÉO, about 9, fair skin, spiky light-brown hair, round cyan glasses, indigo hoodie.
Row 2: MALU, about 10, dark-brown skin, two afro puffs, violet t-shirt with a tiny cat print | CAIO, about 11, tan skin, short curly black hair, red t-shirt, a mint wristband.

DO NOT INCLUDE: card frames, round frames, name tags, text, letters, numbers, backgrounds, colored tiles behind the busts, full bodies, hands covering faces, two people in one cell, items crossing cell borders, busts cut by the cell edge, adults, makeup, earrings, eyeshadow, different art styles between cells, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired freckled boy with headphones, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

INPUT ROLES: Images 1–3 are the mandatory POP CHAPADO style references; image 4 is the game's Duda sheet and supplies the exact matching linework and rendering only. Image 5 is the 12-bust sheet to repair.
REPAIR THE SIDE MARGINS: The current image's children are too WIDE and hair and notes leak into neighboring cells. Keep 6 equal columns and 2 equal rows, preserve all twelve expressions and child identities. Every portrait must be NARROWER, with very generous clear transparent side gutters. The ENTIRE sprite including hair, shoulders and notes should occupy only about 72% of its own cell WIDTH while retaining about 84% of cell HEIGHT. Do not stretch or enlarge the heads. Keep the face centered in the cell and the same face scale and position across all expressions. Bia's long black hair hangs narrowly and straight down, never flaring sideways. Malu's two afro puffs are MUCH SMALLER and compact, no wider than her shoulders, no stray curls outside the cell. Téo's spiky hair and Caio's curls must stay compact too. All happy-expression music notes and sparkles are TINY, close beside the cheeks and above shoulders, never at a cell boundary. Keep the portraits' horizontal shoulder cutoffs all at the same relative height, leaving transparent margin below.
Draw only flat solid fills and smooth navy outlines, no shaded skin, no gradient hair, no glows or haze or white edging. No text. The empty gaps between cells are broad and fully transparent, not a colored backdrop. Exactly 12 busts in original order; no crop at any cell edge. The first row is Bia listening, Bia happy dancing, Bia upset, Téo listening, Téo happy dancing, Téo upset. The second row is Malu listening, Malu happy dancing, Malu upset, Caio listening, Caio happy dancing, Caio upset. Output requested 1536x512.
~~~

---

## 10. As folhas do N2 e do N3 (20/10/2026)

O N2 mostra 4 CDs por fase e o N3 mostra 6. Os donos e as capas do N1 voltam (o bilhete de cada um continua dizendo a mesma coisa sobre **tocar**), e entram **8 donos novos**, **11 capas novas** e os **ícones das batidas** do remix.

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `donos2.png` | 6 × 4 | 256 | 1536 × 1024 | sim | os 8 donos novos, 3 expressões cada (mesmo contrato do `donos.png`) |
| `capas2.png` | 4 × 3 | 256 | 1024 × 768 | opaco | as 11 capas novas (a 12ª fica lisa) |
| `ui2.png` | 4 × 2 | 256 | 1024 × 512 | sim | as 4 batidas do remix, a silhueta do dono desconhecido e 3 células vazias |

**Gere os donos em duas folhas de 6 × 2** (fileiras 1–2 e 3–4), como no `donos.png`: o gerador acerta melhor a grade assim, e o Editor junta as duas numa escala só.

### 10.1 `donos2.png` — 6 × 4 células de 256, alfa

O mesmo contrato do §5: busto de frente, rosto no centro da célula, ~84 % da célula, corte reto nos ombros, mesma escala e mesmo lugar em todas as células; colunas 0–2 o primeiro dono, 3–5 o segundo; expressões **ouvindo · feliz dançando · bravo**.

| Fileira | Dono das colunas 0–2 | Dono das colunas 3–5 |
|---|---|---|
| 0 | **Lia** (≈ 10): pele morena, cabelo cacheado castanho curto com faixa menta, jaqueta jeans azul | **Davi** (≈ 9): pele clara, cabelo loiro liso em tigelinha, camiseta laranja com um raio amarelo |
| 1 | **Nina** (≈ 11): pele negra, tranças longas com miçangas amarelas, moletom rosa-choque | **Beto** (≈ 10): pele parda, cabelo preto cacheado alto, fone de ouvido grande ciano **apoiado no pescoço**, camiseta violeta |
| 2 | **Gabi** (≈ 9): pele clara, cabelo castanho num coque bagunçado, óculos redondos violeta, macacão amarelo-limão | **Pedro** (≈ 11): pele negra retinta, cabelo raspado com uma linha desenhada do lado, camiseta ciano |
| 3 | **Kauã** (≈ 10): menino indígena brasileiro, pele morena, cabelo preto liso com franja reta, colar de sementes, camiseta menta com uma folha | **Sofia** (≈ 8): pele clara, cabelo preto liso curtinho (chanel) com um laço violeta, cardigã lilás |

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes, hair in pointed locks; eyes with a big colored iris, small pupil and thick upper lashes; small expressive marks (tiny music notes, four-point sparkles, a small manga anger mark) only where asked. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing. Match the drawing of the children in the attached donos.png sheet exactly (same head size, same line weight, same framing).

A game sprite sheet on a fully TRANSPARENT background: a grid of 6 columns x 2 rows, each cell 256 x 256 (total 1536 x 512), read left to right, top row first. Every cell holds ONE head-and-shoulders BUST of a Brazilian schoolCHILD (kid proportions, round young face), facing the viewer, the FACE CENTERED in the cell, about 84% of the cell tall, cut by a straight line at the shoulders (never by the cell edge), same scale and same position in every cell, lots of empty space between cells, no frame, no background. Each ROW shows TWO different children: columns 1-3 are the first child, columns 4-6 the second child, and for each child the three columns are always the same three expressions in this order: (a) LISTENING, calm, small smile, looking at the viewer; (b) HAPPY DANCING, eyes closed in happy arcs, big smile, head tilted, two tiny music notes and four-point sparkles; (c) UPSET, eyebrows down, puffed cheeks, pouting mouth, one small manga anger mark near the forehead. Same child = same hair, skin and clothes in its three cells.
[FOLHA A] Row 1: LIA, about 10, tan skin, short curly brown hair with a mint headband, blue denim jacket | DAVI, about 9, fair skin, straight blond bowl-cut hair, orange t-shirt with a yellow lightning bolt.
[FOLHA A] Row 2: NINA, about 11, dark-brown skin, long box braids with yellow beads, hot-pink hoodie | BETO, about 10, brown skin, tall curly black hair, big cyan headphones resting around his NECK, violet t-shirt.
[FOLHA B] Row 1: GABI, about 9, fair skin, messy brown top bun, round violet glasses, lemon-yellow overalls | PEDRO, about 11, deep dark skin, black buzz cut with one shaved line on the side, cyan t-shirt.
[FOLHA B] Row 2: KAUÃ, about 10, Brazilian Indigenous boy, warm tan skin, straight black hair with a blunt fringe, a seed necklace, mint t-shirt with a leaf print | SOFIA, about 8, fair skin, short straight black bob with a violet bow, lilac cardigan.

DO NOT INCLUDE: card frames, round frames, name tags, text, letters, numbers, backgrounds, colored tiles behind the busts, full bodies, hands covering faces, two people in one cell, items crossing cell borders, busts cut by the cell edge, adults, makeup, earrings, eyeshadow, different art styles between cells, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired freckled boy with headphones, headphones over the ears, feathered headdress, costume, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

### 10.2 `capas2.png` — 4 × 3 células de 256 (1024 × 768), opaco

As regras do §6: capa quadrada de ponta a ponta, fundo chapado próprio, uma ilustração grande, **nenhuma letra, nenhum selo, nenhum cadeado**. As três capas **sem bilhete** (8, 9, 10) são de propósito **as mais bonitas e chamativas** do jogo: quem não tem permissão não pode ganhar na capa.

| Célula | Música (dono) | A capa |
|---|---|---|
| 0 | Dança da Pipoca (Lia) | pipocas pulando de um balde listrado; fundo laranja |
| 1 | Robô Dançarino (Davi) | um robozinho redondo dançando com um braço para cima; fundo ciano |
| 2 | Samba da Bicicleta (Nina) | uma bicicleta com notinhas saindo das rodas; fundo rosa-choque |
| 3 | Trem da Madrugada (Beto) | um trenzinho passando na frente de uma lua grande; fundo índigo |
| 4 | Ciranda do Sol (Gabi) | um sol sorridente com flores em roda à volta; fundo amarelo-limão |
| 5 | Skate no Parque (Pedro) | um skate saltando sobre dois cones; fundo menta |
| 6 | Canto da Floresta (Kauã) | uma arara colorida num galho com folhas grandes; fundo verde-floresta |
| 7 | Valsa da Bailarina (Sofia) | um par de sapatilhas de balé com fitas; fundo lilás |
| 8 | (sem bilhete) | um **unicórnio** num arco-íris cheio de brilhos e estrelas, a capa mais bonita do jogo; fundo violeta |
| 9 | (sem bilhete) | um **dragãozinho** fofo tocando guitarra entre fogos de artifício; fundo índigo |
| 10 | (sem bilhete) | um **castelo de doces** com balas e pirulitos e um arco-íris; fundo rosa-claro |
| 11 | — | lisa: só fundo índigo chapado |

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (small two-color gradients only in shiny highlights); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing. Match the attached capas.png sheet exactly (same line weight, same flat fills, same framing).

A game sprite sheet: a grid of 4 columns x 3 rows, each cell 256 x 256 (total 1024 x 768), read left to right, top row first. Every cell is ONE SQUARE MUSIC ALBUM COVER that fills the whole cell edge to edge, with its own flat background color and ONE big simple centered illustration, no text at all:
1. POPCORN jumping out of a striped bucket; orange background.
2. a small round ROBOT dancing with one arm up; electric-cyan background.
3. a BICYCLE with tiny music notes flying from its wheels; hot-pink background.
4. a little TRAIN passing in front of a big moon; deep indigo background.
5. a smiling SUN with a ring of flowers dancing around it; lemon-yellow background.
6. a SKATEBOARD jumping over two traffic cones; mint background.
7. a colorful MACAW on a branch with big leaves; forest-green background.
8. a pair of BALLET SLIPPERS with ribbons; lilac background.
9. a UNICORN on a rainbow with lots of sparkles and stars, the most beautiful cover of the set; violet background.
10. a cute little DRAGON playing an electric guitar among fireworks; deep indigo background.
11. a CANDY CASTLE made of sweets and lollipops under a rainbow; light pink background.
12. EMPTY: plain flat deep indigo, nothing drawn.

DO NOT INCLUDE: text, letters, numbers, titles, band names, logos, barcodes, padlocks, check marks, X marks, warning signs, stickers, seals, badges, CD cases, CD discs, people, children, faces on objects other than the sun, robot, unicorn and dragon, borders between cells, checkerboard backgrounds, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

### 10.3 `ui2.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Observação |
|---|---|---|
| 0 | **bumbo**: tambor grande visto de frente, com a pele redonda | ícone da 1ª linha no remix |
| 1 | **caixa**: tambor baixo com duas baquetas cruzadas | 2ª linha |
| 2 | **palmas**: duas mãos batendo palma com três risquinhos | 3ª linha |
| 3 | **prato**: prato de bateria dourado num suporte, com dois risquinhos de som | 4ª linha |
| 4 | **dono desconhecido**: silhueta índigo-escura de uma criança em busto, **sem rosto**, com um grande ponto de interrogação branco no meio | aparece na bolha ao vivo do CD sem bilhete |
| 5–7 | vazias (transparentes) | — |

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (small two-color gradients only in glows); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing. Match the attached ui.png sheet exactly.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first, one centered object per cell with about 12% margin, bold and readable at 60 px:
1. a BASS DRUM seen from the front, a big round drum head, hot-pink shell.
2. a SNARE DRUM, low and wide, with two crossed drumsticks, cyan shell.
3. two HANDS CLAPPING with three small motion ticks, light skin tone.
4. a golden CYMBAL on a stand with two small sound ticks.
5. a faceless BUST SILHOUETTE of a child in flat dark indigo, with one big white QUESTION MARK in the middle of the head.
6. empty cell, fully transparent.
7. empty cell, fully transparent.
8. empty cell, fully transparent.

DO NOT INCLUDE: text, letters, numbers, words, faces on the silhouette, people with faces, backgrounds, items crossing cell borders, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~


## Registro de geração — Aquarela, capas2.png e ui2.png (20/10/2026)

Ferramenta: `image_gen` integrada. Referências anexadas em todas as tentativas, nesta ordem: `references/30-pop-chapado-a.jpg`, `31-pop-chapado-b.jpg`, `32-pop-chapado-c.webp`, `src/assets/games/EF05CO09/radio-da-escola/capas.png` e `ui.png`.

Originais preservados sem redimensionamento em `outputs/radio-da-escola/raw/`:

- `capas2.png`: RGB opaco, **1448 × 1086 px**, grade **4 × 3**, células **362 × 362 px**. Uma geração. Ilustrações na ordem do §10.2; sem texto, selos, cadeados ou marcas de permissão.
- `ui2.png`: RGBA, **1774 × 887 px**, distribuição **4 × 2**. A primeira tentativa foi descartada por pixels visíveis nas divisórias e símbolos invadindo células vizinhas; a segunda foi selecionada. Todos os cinco ícones têm seus pixels com alfa ≥128 dentro de suas células, sem tocar nas divisórias. Células 5–7 sem desenho visível; há apenas resíduos com alfa máximo **1/255** nessas células (limpeza fina a cargo do Editor ao preparar o tamanho nominal). O tamanho retornado não é divisível por 4 em pixels inteiros; ao preparar 1024 × 512, o Editor deve preservar as divisórias proporcionais de 25% e 50%.

Tamanhos nominais para integração: `capas2.png` 1024 × 768 e `ui2.png` 1024 × 512, células 256. Nenhum código alterado. Sem erro de espaço no disco C:.

Células de `capas2.png` (esquerda para direita, linha de cima primeiro): 0 pipocas no balde listrado; 1 robô dançando; 2 bicicleta com notas musicais; 3 trem diante da lua; 4 sol sorridente cercado por flores; 5 skate sobre dois cones; 6 arara no galho com folhas; 7 sapatilhas de balé com fitas; 8 unicórnio e arco-íris; 9 dragão com guitarra e fogos; 10 castelo de doces e arco-íris; 11 fundo índigo liso.

Células de `ui2.png`: 0 bumbo rosa; 1 caixa ciano e baquetas cruzadas; 2 mãos batendo palmas e três sinais de movimento; 3 prato dourado no suporte e dois sinais de som; 4 busto infantil índigo sem rosto com interrogação branca; 5–7 sem desenho.

### Prompt completo usado — capas2.png

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (small two-color gradients only in shiny highlights); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes with sharp points; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing. Match the attached capas.png sheet exactly (same line weight, same flat fills, same framing).

A game sprite sheet: a grid of 4 columns x 3 rows, each cell 256 x 256 (total 1024 x 768), read left to right, top row first. Every cell is ONE SQUARE MUSIC ALBUM COVER that fills the whole cell edge to edge, with its own flat background color and ONE big simple centered illustration, no text at all:
1. POPCORN jumping out of a striped bucket; orange background.
2. a small round ROBOT dancing with one arm up; electric-cyan background.
3. a BICYCLE with tiny music notes flying from its wheels; hot-pink background.
4. a little TRAIN passing in front of a big moon; deep indigo background.
5. a smiling SUN with a ring of flowers dancing around it; lemon-yellow background.
6. a SKATEBOARD jumping over two traffic cones; mint background.
7. a colorful MACAW on a branch with big leaves; forest-green background.
8. a pair of BALLET SLIPPERS with ribbons; lilac background.
9. a UNICORN on a rainbow with lots of sparkles and stars, the most beautiful cover of the set; violet background.
10. a cute little DRAGON playing an electric guitar among fireworks; deep indigo background.
11. a CANDY CASTLE made of sweets and lollipops under a rainbow; light pink background.
12. EMPTY: plain flat deep indigo, nothing drawn.

DO NOT INCLUDE: text, letters, numbers, titles, band names, logos, barcodes, padlocks, check marks, X marks, warning signs, stickers, seals, badges, CD cases, CD discs, people, children, faces on objects other than the sun, robot, unicorn and dragon, borders between cells, checkerboard backgrounds, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.
~~~

### Prompt completo usado — ui2.png (versão selecionada)

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading (small two-color gradients only in glows); super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes; four-point sparkle accents. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing. Match the attached ui.png sheet exactly.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first, one centered object per cell with about 12% margin, bold and readable at 60 px:
1. a BASS DRUM seen from the front, a big round drum head, hot-pink shell.
2. a SNARE DRUM, low and wide, with two crossed drumsticks, cyan shell.
3. two HANDS CLAPPING with three small motion ticks, light skin tone.
4. a golden CYMBAL on a stand with two small sound ticks.
5. a faceless BUST SILHOUETTE of a child in flat dark indigo, with one big white QUESTION MARK in the middle of the head.
6. empty cell, fully transparent.
7. empty cell, fully transparent.
8. empty cell, fully transparent.

DO NOT INCLUDE: text, letters, numbers, words, faces on the silhouette, people with faces, backgrounds, items crossing cell borders, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired boy with headphones, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

STRICT SPRITE-SHEET VALIDATION: exactly FOUR EQUAL COLUMNS and TWO EQUAL ROWS. Make every visible sprite COMPACT, only 65–72% of its cell width and height, perfectly CENTERED with generous transparent gutters on all four sides. The entire visible object, including sound ticks and sparkle accents, stays INSIDE this central 72% box; absolutely no visible or faint pixels on any cell boundary. Do not add extra floating sparkles beside the unknown-child silhouette; the silhouette is just a solid dark-indigo child's bust and a white question mark. Top row left to right: bass drum, snare with crossed sticks, clapping hands, cymbal. Bottom row: unknown child's bust ONLY in the FIRST cell; the other THREE cells have zero objects and are completely clear alpha=0, with no haze, no glow, no stray dots or speckles. Keep only three small motion ticks with the hands and two sound ticks with the cymbal, positioned close to the object so they never approach cell edges. Same crisp navy outline and flat fills as ui.png. Use the three first reference images for style only, the fourth reference capas.png for matching color and outlines, and the fifth reference ui.png for matching the UI-icon rendering only. Do not copy the original ui.png objects. Requested final canvas 1024 x 512 pixels.
~~~




## Registro de geração — Aquarela, donos2-a.png (N2/N3, 20/10/2026)

Ferramenta: `image_gen` integrada. Gerada somente a **FOLHA A** do §10.1: Lia | Davi e Nina | Beto, grade 6 × 2. As referências `30-pop-chapado-a.jpg`, `31-pop-chapado-b.jpg`, `32-pop-chapado-c.webp` e o `src/assets/games/EF05CO09/radio-da-escola/donos.png` atual foram anexados em todas as tentativas. A segunda geração corrigiu o cabelo do Davi para tigelinha, uniformizou os olhos verdes abertos da Lia e compactou o topo do cabelo do Beto; os fones permanecem no pescoço nas três expressões.

Original selecionado preservado em `outputs/radio-da-escola/raw/donos2-a.png`: **2172 × 724 px**, alfa; grade **6 × 2**, células quadradas de **362 × 362 px**, resolução retornada pelo gerador. Tamanho nominal do contrato para o Editor: **1536 × 512**, células de 256. Conferência: 12 bustos infantis, mesma escala e cortes de ombros alinhados nas três expressões de cada dono, sem texto, moldura, selo, cadeado ou sinal de permissão. Conferência de alfa: nenhuma das 12 células apresenta pixels com alfa ≥128 tocando a borda. Nenhum erro de espaço ocorreu. Código intacto.

Células: 0 Lia ouvindo; 1 Lia feliz dançando; 2 Lia brava; 3 Davi ouvindo; 4 Davi feliz dançando; 5 Davi bravo; 6 Nina ouvindo; 7 Nina feliz dançando; 8 Nina brava; 9 Beto ouvindo; 10 Beto feliz dançando; 11 Beto bravo.

### Prompt completo usado — donos2-a.png (versão selecionada)

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes, hair in pointed locks; eyes with a big colored iris, small pupil and thick upper lashes; small expressive marks (tiny music notes, four-point sparkles, a small manga anger mark) only where asked. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing. Match the drawing of the children in the attached donos.png sheet exactly (same head size, same line weight, same framing).

A game sprite sheet on a fully TRANSPARENT background: a grid of 6 columns x 2 rows, each cell 256 x 256 (total 1536 x 512), read left to right, top row first. Every cell holds ONE head-and-shoulders BUST of a Brazilian schoolCHILD (kid proportions, round young face), facing the viewer, the FACE CENTERED in the cell, about 84% of the cell tall, cut by a straight line at the shoulders (never by the cell edge), same scale and same position in every cell, lots of empty space between cells, no frame, no background. Each ROW shows TWO different children: columns 1-3 are the first child, columns 4-6 the second child, and for each child the three columns are always the same three expressions in this order: (a) LISTENING, calm, small smile, looking at the viewer; (b) HAPPY DANCING, eyes closed in happy arcs, big smile, head tilted, two tiny music notes and four-point sparkles; (c) UPSET, eyebrows down, puffed cheeks, pouting mouth, one small manga anger mark near the forehead. Same child = same hair, skin and clothes in its three cells.
Row 1: LIA, about 10, tan skin, short curly brown hair with a mint headband, blue denim jacket | DAVI, about 9, fair skin, straight blond bowl-cut hair, orange t-shirt with a yellow lightning bolt.
Row 2: NINA, about 11, dark-brown skin, long box braids with yellow beads, hot-pink hoodie | BETO, about 10, brown skin, tall curly black hair, big cyan headphones resting around his NECK, violet t-shirt.

DO NOT INCLUDE: card frames, round frames, name tags, text, letters, numbers, backgrounds, colored tiles behind the busts, full bodies, hands covering faces, two people in one cell, items crossing cell borders, busts cut by the cell edge, adults, makeup, earrings, eyeshadow, different art styles between cells, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired freckled boy with headphones, headphones over the ears, feathered headdress, costume, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

INPUT ROLES: Images 1–3 are the required POP CHAPADO style references. Image 4 is the approved existing donos.png style. Image 5 is the 12-bust FOLHA A EDIT TARGET to correct. Preserve its exact two-row layout, all twelve expressions, scale, face anchors, shoulder cutoffs, transparent margins, clothing and all four children's identities.
MAKE THESE SMALL CORRECTIONS ONLY:
1. DAVI, the blond boy in the top row's last three columns: replace the spiky hair with a true STRAIGHT BLOND BOWL CUT in all three expressions. A simple compact rounded dome with a level blunt fringe over the eyebrows, hair cut evenly around the head; NO spikes, NO upward tuft, NO cowlick, NO windswept locks. Keep his face, cyan-blue eyes, orange shirt and yellow lightning print exactly as they are. The bowl cut is an explicit exception to the general pointed-hair style; outline can be stylized and geometric but the haircut must unmistakably be a rounded bowl cut.
2. LIA in top row columns 1 and 3: make both of her visible irises the SAME green as her listening portrait. Keep the face shape, mint headband, brown curls and blue denim jacket identical. Happy closed eyes stay closed.
3. BETO in all three bottom-row right columns: compact the VERY TOP of his tall curly hair slightly so it has clear empty transparent margin above it inside each cell; keep the face and cyan headphones anchored exactly where they already are, headphones ALWAYS around the neck.
Keep Nina's long dark box braids with yellow beads and hot-pink hoodie exactly as in the target. Keep the generous empty transparent gutters. All notes/sparkles small and fully inside their cells. No text, names, seals, badges, padlocks, checkmarks or X symbols. No colored background, halo, shadows or white keyline. Flat solid skin, hair and clothes, without shaded facets or gradients. Exactly 6 equal columns by 2 equal rows; requested output 1536x512.
~~~




## Registro de geração — donos2-b.png, Aquarela, 20/10/2026

Somente FOLHA B do §10.1: Gabi/Pedro, Kauã/Sofia; ordem ouvindo, feliz dançando, bravo para cada criança. Ferramenta image_gen integrada. Referências 30, 31, 32 e donos.png anexadas em todas as tentativas. Regenerações corrigiram pintura facial indesejada, óculos ausentes na expressão feliz da Gabi e estampa não solicitada na camiseta do Pedro. Na correção final também foi anexada a tentativa anterior como alvo de edição. Nenhum erro de espaço em disco ocorreu.

Origem selecionada: C:/Users/teste123/.codex/generated_images/01a1597f-6cbc-7242-a413-621db11c763c/exec-1722da05-e893-411a-9fb3-e8eba015397e.png. Resolução retornada: 2172 × 724, alfa, células de 362. Entrega normalizada com uma escala única, corredores transparentes e corte de ombros alinhado: outputs/radio-da-escola/raw/donos2-b.png, 1536 × 512, grade 6 × 2, células de 256. Conferidos: 12 bustos, nenhum texto, nenhum selo/cadeado, nenhum elemento cruzando a própria célula. Removidos resíduos de alfa abaixo de 32 (artefatos transparentes entre células), preservando as figuras. Nenhum código alterado.

### Prompt completo usado — donos2-b.png

~~~text
STYLE — USE THE THREE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: flat pop cartoon in the style of a 2010s TV anime with western-cartoon graphic design; clean deep navy-black outline (#1B1446) of even medium thickness; 100% flat color fills with NO shading; super-saturated candy palette (hot pink #FF3FA4, electric cyan #2EC5FF, lemon yellow #FFE14D, violet #9B5CFF, indigo #3A2A8C, fresh mint #3FD9A0); angular stylized shapes, hair in pointed locks; eyes with a big colored iris, small pupil and thick upper lashes; small expressive marks (tiny music notes, four-point sparkles, a small manga anger mark) only where asked. Take ONLY the art style; do NOT copy their characters, poses, scenes, logo or framing. Match the drawing of the children in the attached donos.png sheet exactly (same head size, same line weight, same framing).

A game sprite sheet on a fully TRANSPARENT background: a grid of 6 columns x 2 rows, each cell 256 x 256 (total 1536 x 512), read left to right, top row first. Every cell holds ONE head-and-shoulders BUST of a Brazilian schoolCHILD (kid proportions, round young face), facing the viewer, the FACE CENTERED in the cell, about 84% of the cell tall, cut by a straight line at the shoulders (never by the cell edge), same scale and same position in every cell, lots of empty space between cells, no frame, no background. Each ROW shows TWO different children: columns 1-3 are the first child, columns 4-6 the second child, and for each child the three columns are always the same three expressions in this order: (a) LISTENING, calm, small smile, looking at the viewer; (b) HAPPY DANCING, eyes closed in happy arcs, big smile, head tilted, two tiny music notes and four-point sparkles; (c) UPSET, eyebrows down, puffed cheeks, pouting mouth, one small manga anger mark near the forehead. Same child = same hair, skin and clothes in its three cells.
Row 1: GABI, about 9, fair skin, messy brown top bun, round violet glasses, lemon-yellow overalls | PEDRO, about 11, deep dark skin, black buzz cut with one shaved line on the side, cyan t-shirt.
Row 2: KAUÃ, about 10, Brazilian Indigenous boy, warm tan skin, straight black hair with a blunt fringe, a seed necklace, mint t-shirt with a leaf print | SOFIA, about 8, fair skin, short straight black bob with a violet bow, lilac cardigan.

DO NOT INCLUDE: card frames, round frames, name tags, text, letters, numbers, backgrounds, colored tiles behind the busts, full bodies, hands covering faces, two people in one cell, items crossing cell borders, busts cut by the cell edge, adults, makeup, earrings, eyeshadow, different art styles between cells, the characters from the reference images, red-skinned demon girls, horns, blonde girl in red dress, long dark-haired girl in black dress with striped stockings, cat plush, angel halos, afro man, green dog creature, orange-haired freckled boy with headphones, headphones over the ears, feathered headdress, costume, ghosts, guns, weapons, swords, logos, watermark, painterly rendering, soft airbrushed shading, multi-tone cel shading, 3D render, photorealistic, rough sketchy lines, white sticker keyline.

REFERENCE ROLES: the first three attached images are style references only. The fourth attached image, donos.png, is the approved game rendering to match. The fifth image is the latest FOLHA B attempt to CORRECT, retaining these four child identities and this exact 6x2 ordering.

REPAIR TWO IDENTITY ERRORS while keeping all other requested traits: (1) GABI must wear the IDENTICAL round VIOLET GLASSES in ALL THREE portraits, including HAPPY DANCING. In the happy portrait draw her closed smiling eyes clearly INSIDE the two round violet eyeglass lenses, with the bridge and side arms present; never remove her glasses. (2) PEDRO wears a COMPLETELY PLAIN SOLID CYAN T-SHIRT in ALL THREE portraits: remove the white rectangular chest patch. No rectangles, labels, badges, print, text or decoration anywhere on Pedro's shirt. His close black buzz cut has just one subtle shaved line at one side, identical across his portraits.

KAUÃ has ordinary modern mint shirt with a leaf print and his seed necklace, plain tan cheeks: no face paint, no stripes, no tattoos, no extra cultural props, no costume. SOFIA has the same black bob, violet bow and lilac cardigan in all three. Gabi has fair skin, brown messy top bun, round violet glasses and lemon yellow overalls in all three.

Maintain compact narrow silhouettes and large transparent gaps between cells. All twelve shoulder cuts align, same face scale and face center within the three expressions of each child. Keep every strand of hair, bow, bun and small expression symbol strictly inside its own cell with empty margins all around. No full bodies, no lettering, no seals, no padlocks. Flat solid color fills, no shading or gradients. Exact 6 columns x 2 rows, 1536x512 requested.

~~~
