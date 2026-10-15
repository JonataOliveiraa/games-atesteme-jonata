# Diário das Férias — texturas

Destino: `src/assets/games/EF03CO08/diario-das-ferias/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela e lugares da praia, §6 coisas e ciclos, §9 apresentação).

Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

## 1. A linha de arte: cartoon pastel leve

Pedido do usuário (08/10/2026): *"uma arte leve pastel, não tão puxada a chibi, mas é cartoon"*. Os prompts **não usam imagem de referência**: o estilo vai descrito só em palavras, no bloco STYLE de cada prompt.

| | Esta linha | Chibi voador (Portas) | Livro ilustrado (Robô em Pedaços) |
|---|---|---|---|
| **proporção** | criança de verdade, cabeça ≈ 1/3 da altura | cabeça ≈ metade do corpo | cabeça ≈ 1/3 |
| **olho** | pequeno, oval escuro com 1 brilhinho | enorme, íris em degradê, 2–3 brilhos | grande, íris castanha, 1 brilho grande |
| **traço** | fino a médio, liso, num tom mais escuro da própria cor | médio, tom mais escuro da própria cor | quase sem contorno |
| **cor** | chapada com 1 sombra macia; degradê só no céu e na água | chapada com 1 sombra | pintura macia com granulado |
| **paleta** | pastel arejado: pêssego, coral claro, menta, azul-céu, amarelo-manteiga, lilás, creme | lilás, verde-água, creme | pastel quente |
| **keyline branca** | não | não | não |

## 2. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | N1? |
|---|---|---|---|---|---|
| `bg-praia.png` | — | — | **panorama**, 2044 × 720 no jogo | opaco | **sim** (indispensável) |
| `coisas-praia.png` | 4 × 2 | 320 | 1280 × 640 | sim | **sim** (indispensável) |
| `interface.png` | 4 × 1 | 256 | 1024 × 256 | sim | sim |
| `duda.png` | 3 × 2 | 320 × 440 | 960 × 880 | sim | sim |
| `bg-teatrinho.png` | — | — | 1280 × 720 | opaco | sim |
| `cover-diario-das-ferias.png` | — | — | 1672 × 941 | opaco | por último |
| `bg-sitio.png` | — | — | panorama ≈ 2044 × 720 | opaco | **N2** |
| `coisas-sitio.png` | 4 × 2 | 320 | 1280 × 640 | sim | **N2** |
| `bg-acampamento.png` | — | — | panorama ≈ 2044 × 720 | opaco | **N3** |
| `coisas-noite.png` | 3 × 2 | 320 | 960 × 640 | sim | **N3** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga. A grade, a ordem e o que vai em cada célula não podem mudar.

**O que é indispensável para o N1:** o fundo da praia e as coisas. Sem eles, a foto (que é um recorte real da tela) sai com cara de reserva. A interface, a Duda e o teatrinho seguram com a arte de reserva por um tempo.

## 3. Regras deste jogo

- **Sem texto** em nenhuma folha, exceto o título da capa. FOTO, SOM, o título e as legendas da apresentação são escritos pelo código.
- **Nada de bicho ou pessoa escondido no fundo.** O passarinho do coqueiro, o sorveteiro atrás da duna e a música da cabana **não aparecem**: só se ouvem. Se o gerador desenhar um passarinho no coqueiro, a regra do jogo quebra, porque a FOTO passaria a "dever" funcionar.
- **Sem notas musicais nem linhas de som** em folha nenhuma: elas são o sinal de "isto faz barulho", e quem decide quando aparecem é o código.
- Os lugares fixos do fundo precisam estar **onde a tabela diz** (o código põe as coisas e os sons nesses pontos). Se vierem fora do lugar, ajusto o `layout.ts` pela arte, e não o contrário.
- Sprites soltos e centrados na célula, com ~8 % de margem, sem chão e sem sombra caída.

---

## 4. `bg-praia.png` — panorama, opaco

> **Mudou em 08/10/2026:** a praia é **mais larga que a tela** e a câmera passeia por ela. A arte entregue (2112 × 744) é usada inteira, reduzida para 720 de altura (2044 × 720). Os lugares de verdade estão no `MANIFEST.md` dos assets e no §13 do plano. As porcentagens abaixo são do pedido original (16:9).

Uma praia de dia, vista de frente como um palco. Os **lugares fixos** são onde as coisas acontecem. O quarto inferior esquerdo e o quarto inferior direito ficam **calmos** (areia lisa), porque o joystick e os botões ficam ali.

| Lugar | Onde (% da largura, % da altura) | Como tem de ser |
|---|---|---|
| céu | todo o alto, até ≈ 35 % | azul-céu pastel, 2–3 nuvens pequenas; **o lado direito do céu (60–80 %, 15–30 %) fica livre** para o arco-íris |
| coqueiro | tronco de ≈ 17 %, 70 % (o pé, na areia) até a copa; **copa cheia em 8–22 %, 14–36 %** | copa **densa e fechada**, grande o bastante para esconder um passarinho; sem passarinho; o pé fica **acima** do canto do joystick |
| mar | faixa de 35 % a 62 % da altura, atravessando a tela | azul-céu e menta, ondinhas calmas; o meio (45–60 % da largura) **livre** para o golfinho saltar |
| pedra no mar | ≈ 31 %, 46 % | uma pedra grande e arredondada na água rasa, com um pouco de espuma calma em volta |
| duna | ≈ 77 %, 58 % | uma duna **alta** de areia clara, com capim fino no alto; nada atrás dela à vista |
| cabana | ≈ 91 %, 46 % | cabaninha de praia de madeira clara, com a **janela fechada** (venezianas fechadas) e a porta fechada |
| areia | de ≈ 62 % da altura até embaixo | areia creme lisa; um **buraquinho** de toca de caranguejo em ≈ 47 %, 73 % e um lugar liso em ≈ 30 %, 69 % (castelo) |
| cantos de baixo | 0–22 % e 76–100 % da largura, 75–100 % da altura | **areia lisa, sem nada** (controles) |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade, very gentle gradients only in the sky and the water; simple rounded friendly shapes; airy pastel palette (peach, light coral, mint, sky blue, butter yellow, lilac, warm cream) with lots of light; clean and uncluttered.

A cheerful sunny BEACH background for a children's game, 16:9 (1280 x 720), opaque, seen straight from the front like a stage, no people and no animals. The sky fills the top third, pale sky blue with two or three small soft cream clouds; the RIGHT part of the sky (from 60% to 80% of the width, 15% to 30% of the height) is EMPTY and clear. On the LEFT, a coconut palm tree whose trunk stands on the sand at about 17% of the width and 70% of the height and leans up and slightly left, with a BIG, DENSE, FULL leafy crown around 8-22% of the width and 14-36% of the height (thick enough to hide a small bird, but no bird). A calm sea band crosses the picture from about 35% to 62% of the height, soft sky-blue and mint with gentle small waves; its middle (45% to 60% of the width) is open, empty water. A big rounded grey-lilac ROCK sits in the shallow water at about 31% of the width and 46% of the height, with a little calm foam around its base. On the right, a TALL smooth sand DUNE at about 77% of the width and 58% of the height, with a few thin grass blades on top. On the far right, a small light-wood beach HUT at about 91% of the width and 46% of the height, with its window shutters CLOSED and its door CLOSED. Below 62% of the height, smooth warm cream SAND: a small round crab hole at about 47% of the width and 73% of the height, and a plain flat empty spot at about 30% of the width and 69% of the height. The bottom-left corner (0-22% of the width) and the bottom-right corner (76-100% of the width), below 75% of the height, are plain smooth empty sand.

DO NOT INCLUDE: people, children, characters, animals, birds, seagulls, crabs, dolphins, fish, a rainbow, a sandcastle, an ice-cream cart, umbrellas, towels, toys, boats, music notes, sound lines, open windows, open door, signs, any text, letters or numbers, logos, objects in the bottom corners, big clouds, sunset or night, dark or saturated neon colors, chibi proportions, manga style, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, perspective lines converging, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

---

## 5. `coisas-praia.png` — 4 × 2 células de 320 (1280 × 640), alfa

As coisas que **aparecem e somem** na praia, por cima do fundo. Leitura da esquerda para a direita, linha de cima primeiro. As coisas que só se ouvem **não têm sprite**.

| Célula | Coisa | Desenho |
|---|---|---|
| 0 | **arco-íris** | arco pastel compacto (7 faixas suaves) com uma nuvenzinha creme em cada pé; ocupa a célula na largura |
| 1 | **caranguejo andando** | caranguejo coral-claro de lado, perninhas em passo, garras abertas, olhinhos em antenas, sorriso |
| 2 | **caranguejo assustado** | o mesmo caranguejo de frente, garras para cima, olhinhos arregalados (reação ao flash) |
| 3 | **golfinho saltando** | golfinho azul-céu/lilás no alto do salto, corpo em arco, gotas soltando da cauda |
| 4 | **golfinho mergulhando** | só a cauda e metade do corpo entrando na água, com respingos |
| 5 | **espirro de água** | coroa de água e gotas (sem bicho): o "splash" do golfinho e da onda |
| 6 | **castelo de areia** | castelinho creme com 3 torres, janelinhas e uma bandeirinha coral lisa (sem desenho) |
| 7 | **onda estourando** | uma onda menta-clara se quebrando para cima, espuma alta e cheia (sem a pedra: a pedra é do fundo) |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade, very gentle gradients only in water; simple rounded friendly shapes; airy pastel palette (peach, light coral, mint, sky blue, butter yellow, lilac, warm cream); simple cute cartoon animals with small dark dot eyes and a tiny highlight, not mascots with huge eyes.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. One item per cell, centered, about 80% of the cell, no ground, no cast shadow.
1. A compact pastel RAINBOW arch with seven soft bands and a small cream cloud at each foot, filling the cell width.
2. A cute light-coral CRAB seen from the side, walking, little legs mid-step, claws open, eyes on short stalks, small smile.
3. The SAME crab seen from the front, startled: both claws raised, eyes wide open.
4. A cute sky-blue and lilac DOLPHIN at the top of a jump, body curved in an arch, a few water drops falling from its tail.
5. The same dolphin DIVING: only the tail and the back half of the body entering a small patch of water, with splashes.
6. A water SPLASH alone: a crown of mint-white water with round drops flying up (no animal).
7. A small cream SANDCASTLE with three round towers, tiny windows and one small plain light-coral flag (blank flag).
8. A light mint OCEAN WAVE breaking upward with tall, full, bubbly white foam (no rock, no beach).

DO NOT INCLUDE: people, characters, other animals, birds, fish, a rock, sand ground under the items, beach background, sky, music notes, sound lines, any text, letters or numbers, drawings on the flag, faces on the rainbow, the castle or the wave, items crossing cell borders, items cut by the cell edge, different art styles between cells, dark or saturated neon colors, chibi proportions, huge anime eyes, sparkly eyes, manga style, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, colored backgrounds behind the items, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

---

## 6. `interface.png` — 4 × 1 células de 256 (1024 × 256), alfa

Os controles. O código escreve **FOTO** e **SOM** embaixo dos botões e desenha o afundar do toque. A moldura polaroide, o cartão de som e as páginas do diário são retângulos simples, feitos em `Graphics`.

| Célula | Peça | Desenho |
|---|---|---|
| 0 | **botão FOTO** | botão quadrado de cantos bem redondos, pêssego, com volume leve; no meio, uma **câmera fotográfica** fofa e simples (corpo creme, lente grande) |
| 1 | **botão SOM** | o mesmo botão, menta; no meio, um **microfone** fofo e simples (cabeça redonda gradeada, cabo curto) |
| 2 | **base do joystick** | disco grande creme-claro, translúcido no miolo, com uma borda macia e 4 setinhas discretas em relevo (cima, baixo, lados) |
| 3 | **bolinha do joystick** | bolinha pêssego com brilho suave e uma leve sombra embaixo |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade; simple rounded friendly shapes; airy pastel palette (peach, light coral, mint, sky blue, butter yellow, lilac, warm cream).

A small game UI sheet on a fully TRANSPARENT background: 4 items in a row, each in its own 256 x 256 cell (total 1024 x 256), centered, about 85% of the cell, no ground, no cast shadow outside the item.
1. A big chunky square game BUTTON with very rounded corners, soft peach color with a gentle raised look; in its center a cute, simple PHOTO CAMERA icon (cream body, big round lens).
2. The SAME button shape in soft mint; in its center a cute, simple MICROPHONE icon (round grilled head, short handle).
3. A large round JOYSTICK BASE: a pale cream disc with a soft rim, slightly see-through in the middle, with four small subtle embossed arrows (up, down, left, right).
4. A JOYSTICK KNOB: a peach ball with a soft highlight and a small soft shadow underneath.

DO NOT INCLUDE: any text, letters or numbers, words on the buttons, hands, fingers, people, phones, tablets, screens, music notes, sound waves, extra icons, items crossing cell borders, items cut by the cell edge, dark or saturated neon colors, glossy 3D plastic, heavy thick black outlines, pure-black lines, painterly brush texture, grain, 3D render, photorealistic, colored backgrounds behind the items, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

---

## 7. `duda.png` — 3 × 2 células de 320 × 440 (960 × 880), alfa

A **Duda**, 8 anos, de férias. Ela só aparece no começo, no fim (no palco) e no erro. Corpo inteiro, de frente, com o mesmo tamanho em todas as células e os pés na mesma linha (95 % da altura). O **tablet** é a ferramenta dela e aparece nas mãos dela.

**Desenho fixo:** pele morena-clara; cabelo castanho-escuro **cacheado, preso em dois pompons** no alto da cabeça; camiseta listrada coral-claro e creme; bermuda jeans clara; sandálias amarelo-manteiga; tablet de **capa menta**, com a tela voltada para ela (não vemos o que tem na tela).

| Célula | Pose |
|---|---|
| 0 | **sorrindo**: segura o tablet contra o peito com as duas mãos |
| 1 | **falando**: tablet numa mão, a outra levantada como quem explica, boca aberta |
| 2 | **comemorando**: pulando, tablet erguido numa mão, outro braço para cima, olhos fechados de alegria |
| 3 | **ops**: uma mão na boca, olhos arregalados, tablet na outra mão, corpo um pouco para trás |
| 4 | **apresentando**: tablet debaixo do braço, o outro braço estendido apontando para **a direita da imagem**, sorriso orgulhoso |
| 5 | **agradecendo**: pequena reverência, mãos juntas segurando o tablet na frente, olhos fechados, sorriso |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade; simple rounded friendly shapes; airy pastel palette (peach, light coral, mint, sky blue, butter yellow, lilac, warm cream); natural child proportions with the head about ONE THIRD of the body height, small simple eyes (small dark ovals with one tiny highlight), soft rosy cheeks, small simple expressive mouth.

A character sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 320 x 440 (total 960 x 880), read left to right, top row first. The SAME girl in every cell, full body, facing the viewer, centered, the same size in every cell, feet on the same baseline at 95% of the cell height. DUDA: an 8-year-old girl with light-brown skin, dark-brown CURLY hair tied in TWO PUFFS on top of her head, a light-coral and cream STRIPED T-shirt, light denim shorts and butter-yellow sandals. She holds a TABLET with a MINT case, screen facing her (we see only the back of the tablet).
1. Smiling, holding the tablet against her chest with both hands.
2. Talking: tablet in one hand, the other hand raised as if explaining, mouth open.
3. Celebrating: jumping, tablet raised in one hand, the other arm up, eyes closed with joy.
4. "Oops": one hand over her mouth, eyes wide, tablet in the other hand, leaning back a little.
5. Presenting: tablet tucked under one arm, the other arm stretched out pointing to the RIGHT side of the image, proud smile.
6. Thank you: a small bow, both hands holding the tablet in front, eyes closed, smiling.

DO NOT INCLUDE: chibi proportions, oversized head, huge anime eyes, sparkly eyes with multiple highlights, manga style, a visible tablet screen, pictures on the tablet, phones, cameras, microphones, headphones, bags, hats, sunglasses, other characters, animals, music notes, speech balloons, any text, letters or numbers, different outfits or hairstyles between cells, side or back views, ground, shadows on the ground, scenery, colored backgrounds behind the character, characters crossing cell borders, characters cut by the cell edge, dark or saturated neon colors, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

---

## 8. `bg-teatrinho.png` — 1280 × 720, opaco

O fim do nível: **a apresentação para a turma**. O código põe por cima as fotos e os cartões de som (no telão), o título, as fichas de título, a Duda e as palminhas.

| Região | Onde (% da largura, % da altura) | O que tem |
|---|---|---|
| **telão** | 27–73 %, 12–60 % | um retângulo **creme-claro, liso e vazio**, com moldura fina de madeira clara |
| cortinas | bordas esquerda e direita, e um bandô no alto | cortinas de teatro **pêssego-coral**, abertas e presas |
| palco | 0–100 %, 60–80 % | tablado de madeira clara; **o lado direito do palco (78–95 %) fica livre**, porque a Duda fica ali |
| plateia | 0–100 %, 80–100 % | cabeças de crianças **de costas**, com cabelos variados, em silhueta pastel, sem rosto |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade, very gentle gradients only on the curtains; simple rounded friendly shapes; airy pastel palette (peach, light coral, mint, sky blue, butter yellow, lilac, warm cream); clean and uncluttered.

A cozy SCHOOL THEATER STAGE background for a children's game, 16:9 (1280 x 720), opaque, seen straight from the audience, no characters on stage. Soft peach-coral theater curtains are open and tied on the left and right edges, with a matching scalloped valance across the top. In the center of the stage, from 27% to 73% of the width and from 12% to 60% of the height, a big BLANK projection SCREEN: plain, smooth, light cream, completely EMPTY, with a thin light-wood frame. Below it, a light wooden stage floor from 60% to 80% of the height; the right part of the stage floor (78% to 95% of the width) is clear and empty. At the bottom, from 80% to 100% of the height, the backs of the heads of a row of seated children in the audience, seen from behind, with varied pastel hair colors and styles, simple soft shapes, no faces visible.

DO NOT INCLUDE: anything on the screen, pictures, photos, projected images, any text, letters or numbers, signs, banners with words, logos, characters standing on the stage, teachers, puppets, faces in the audience, children facing the viewer, music notes, spotlights beams, dark theater, night colors, red velvet, dark or saturated neon colors, chibi proportions, manga style, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

---

## 9. `cover-diario-das-ferias.png` — 1672 × 941, opaco, com o título

Na praia, a Duda levanta o tablet para fotografar o golfinho no meio do salto. Um arco-íris aparece no céu. Do coqueiro saem notas musicais coloridas: o passarinho escondido canta (é o único lugar de todo o jogo em que a arte desenha notas). O título vai num letreiro no alto (memória *capa tem título*).

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade, very gentle gradients only in the sky and the water; simple rounded friendly shapes; airy pastel palette (peach, light coral, mint, sky blue, butter yellow, lilac, warm cream); natural child proportions with the head about ONE THIRD of the body height, small simple eyes (small dark ovals with one tiny highlight), soft rosy cheeks.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque, on a sunny pastel beach. In the front left, DUDA — an 8-year-old girl with light-brown skin, dark-brown curly hair tied in two puffs on top of her head, a light-coral and cream striped T-shirt, light denim shorts and butter-yellow sandals — happily holds up a tablet with a mint case to take a photo, seen from slightly behind her shoulder so we see the back of the tablet. In the sea in the center, a cute sky-blue and lilac dolphin leaps in an arch with water drops. A soft pastel rainbow shines in the sky on the right. On the left, a coconut palm with a full leafy crown, and a few small colorful MUSIC NOTES floating out of the leaves (a hidden bird singing, the bird is NOT visible). At the top center, a cute rounded sign shows the title "Diário das Férias" in big, bold, rounded, friendly letters, spelled exactly like that, with the accent on the "a" of "Diário" and on the "e" of "Férias".

DO NOT INCLUDE: any other text besides the title, misspelled title, missing accents, extra letters, subtitles, numbers, logos, brand names, a visible bird, other people, a theater, a stage, cameras or phones other than the tablet, dark or night scene, dark or saturated neon colors, chibi proportions, oversized heads, huge anime eyes, sparkly eyes, manga style, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

---

## 10. N2 e N3: o sítio e o acampamento

Os dois mundos são **panoramas largos**, iguais à praia: a câmera passeia por eles. O jogo usa **2044 × 720**, e qualquer panorama de cerca de **2,84 : 1** serve (a praia veio em 2112 × 744). A regra continua: **o que só se ouve não tem sprite**. Os bichos que se escondem não aparecem no fundo; quando saem, quem os mostra é a folha de coisas.

A tabela traz as posições em % da largura e da altura do panorama. Elas são as que o código usa hoje (arte de reserva). Se a arte chegar diferente, ajusto o código.

### 10a. `bg-sitio.png` — panorama ≈ 2044 × 720, opaco

| Lugar | Onde (% largura, % altura) | Como tem de ser |
|---|---|---|
| céu e morros | céu até ≈ 60 %; morrinhos verdes macios na linha do chão (≈ 60 %) | 3 ou 4 nuvens pequenas |
| lago com vitórias-régias | centro ≈ 15 %, 69 %; uma folha grande e redonda em ≈ 16 %, 65 % | água azul-clara, **sem sapo**; a folha vazia é onde o sapo aparece |
| capim alto | ≈ 3–10 %, 55–65 % (beira esquerda do lago) | capim fechado, **sem pato** |
| árvore com colmeia | copa em ≈ 27 %, 31 %; uma **colmeia** pendurada em ≈ 29 %, 33 % | **sem abelhas** à vista |
| jardim de flores | ≈ 30–42 %, 65–75 % | flores redondas pastel; **sem borboleta** |
| celeiro | ≈ 45–58 %, 24–64 % | celeiro vermelho-coral com **portas fechadas**; **sem galo** |
| estradinha de terra | ≈ 58–84 %, 58–64 % | faixa de terra clara na horizontal, **vazia** (o trator passa por cima) |
| pasto com cerca | ≈ 72–86 %, 65–74 % | cerca baixa de madeira; **sem vaca** (ela é sprite) |
| casinha de cachorro | ≈ 88 %, 60 % | porta em arco, escura por dentro, **sem cachorro** |
| casa do vovô | ≈ 96 %, 47 % | casinha branca de telhado azul, ao fundo |
| cantos de baixo | 0–22 % e 76–100 % da largura **da tela**, abaixo de 75 % | grama lisa (no panorama: a faixa de baixo toda é grama simples) |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade, very gentle gradients only in the sky and the water; simple rounded friendly shapes; airy pastel palette (peach, light coral, mint, sky blue, butter yellow, lilac, warm cream) with lots of light; clean and uncluttered.

A wide PANORAMIC background of a cheerful little FARM in daylight, about 2.84:1 (for example 2112 x 744), opaque, seen straight from the front like a long stage, no people and NO ANIMALS at all. Pale sky blue above with a few small soft cream clouds; soft rounded green hills along the ground line at about 60% of the height; below it, smooth light-green grass to the bottom edge. From left to right: at the far left, a clump of TALL thick reeds (3-10% of the width, 55-65% of the height); a small round blue POND centered at about 15% of the width and 69% of the height, with one big empty round lily pad at about 16% / 65%; a leafy TREE whose crown is at about 27% / 31% with a small round honey-colored BEEHIVE hanging in its leaves at about 29% / 33%; a small FLOWER GARDEN with round pastel flowers at 30-42% of the width near the bottom; a coral-red BARN with a white X on its CLOSED doors, from 45% to 58% of the width and 24% to 64% of the height; a pale empty DIRT ROAD crossing horizontally from 58% to 84% of the width at 58-64% of the height; a low wooden PASTURE FENCE from 72% to 86% of the width at 65-74% of the height, with empty grass behind it; a small DOGHOUSE with a dark arched door at about 88% / 60%; and a little white farmhouse with a blue roof far away at about 96% / 47%.

DO NOT INCLUDE: people, characters, animals of any kind, frogs, ducks, bees, butterflies, roosters, chickens, cows, dogs, horses, pigs, birds, tractors, cars, open barn doors, open doghouse with a dog inside, music notes, sound lines, any text, letters or numbers, signs, logos, night or sunset, dark or saturated neon colors, chibi proportions, manga style, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, perspective lines converging, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

### 10b. `coisas-sitio.png` — 4 × 2 células de 320 (1280 × 640), alfa

| Célula | Coisa | Desenho |
|---|---|---|
| 0 | **sapo** | sapinho verde sentado, de frente, sorrindo (aparece na folha do lago) |
| 1 | **borboleta** | borboleta de asas rosa e lilás abertas, vista de frente |
| 2 | **galo** | galo branco de crista vermelha e rabo colorido, andando de lado, virado para a **direita** |
| 3 | **vaca comendo** | vaca malhada de lado, cabeça **baixa** comendo capim, boca fechada |
| 4 | **vaca mugindo** | a **mesma** vaca, mesma pose do corpo, cabeça **erguida** e boca aberta em "O" |
| 5 | **cachorro** | cachorrinho caramelo sentado, feliz, de rabo para cima |
| 6 | **pato** | patinho amarelo nadando de lado, com uma ondinha de água embaixo |
| 7 | **trator** | tratorzinho vermelho de lado, virado para a **direita**, rodas pretas grandes atrás |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade, very gentle gradients only in water; simple rounded friendly shapes; airy pastel palette (peach, light coral, mint, sky blue, butter yellow, lilac, warm cream); simple cute cartoon animals with small dark dot eyes and a tiny highlight, not mascots with huge eyes.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 320 x 320 (total 1280 x 640), read left to right, top row first. One item per cell, centered, about 80% of the cell, no ground, no cast shadow.
1. A cute small green FROG sitting, facing the viewer, smiling.
2. A cute BUTTERFLY with open pink and lilac wings, seen from the front.
3. A white ROOSTER with a red comb and a colorful tail, walking, side view facing RIGHT.
4. A black-and-white spotted COW, side view facing LEFT, head DOWN eating a tuft of grass, mouth closed.
5. The SAME cow in the SAME body pose, side view facing LEFT, head RAISED with the mouth open in a round "O" (mooing).
6. A small caramel DOG sitting, happy, tail up, facing the viewer.
7. A small yellow DUCK swimming, side view facing LEFT, with a little ripple of water under it.
8. A small red TRACTOR, side view facing RIGHT, big black back wheels and small front wheels.

DO NOT INCLUDE: people, characters, other animals, grass ground under the items (except the small grass tuft of the cow and the water ripple of the duck), scenery, backgrounds, fences, barns, music notes, sound lines, speech balloons, any text, letters or numbers, items crossing cell borders, items cut by the cell edge, different art styles between cells, dark or saturated neon colors, chibi proportions, huge anime eyes, sparkly eyes, manga style, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, colored backgrounds behind the items, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

### 10c. `bg-acampamento.png` — panorama ≈ 2044 × 720, opaco

**À noite.** O fundo é escuro e macio (azul-marinho com lilás). Nada nele brilha: lua, fogo, vaga-lumes e lanterna são sprites, porque **o que tem luz é o que a foto pega**.

| Lugar | Onde (% largura, % altura) | Como tem de ser |
|---|---|---|
| céu | até ≈ 61 % | azul-marinho e lilás escuros, estrelinhas miúdas; **livre de lua** em ≈ 73 %, 19 % e **livre** em ≈ 29 %, 19 % (estrela cadente) |
| árvore grande | copa em ≈ 4–21 %, 5–47 %, tronco em ≈ 12 % | **silhueta escura**, sem coruja à vista |
| mato alto | ≈ 26–38 %, 64–75 % | capim escuro, **sem grilo** |
| barraca | ≈ 39–49 %, 47–67 % | barraca triangular azul-escura, **fechada**, **sem luz** |
| roda de pedras | ≈ 56 %, 72 % | pedras e um tronquinho, **sem fogo** |
| moitas | ≈ 82–91 %, 52–64 % | moitas escuras, **sem vaga-lumes** |
| lagoa | ≈ 91 %, 75 % | lagoa escura com um reflexo fraco, **sem sapo** |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (deep navy, dusty plum, dark teal — never pure black); flat colors with ONE soft shade, very gentle gradients only in the sky; simple rounded friendly shapes; a calm NIGHT version of a soft pastel palette (deep navy, muted lilac, dark teal, dusty blue); clean and uncluttered.

A wide PANORAMIC background of a cozy CAMPSITE at NIGHT, about 2.84:1 (for example 2112 x 744), opaque, seen straight from the front like a long stage, no people and no animals. A deep navy and soft lilac night sky down to about 61% of the height, with many tiny soft stars; the area around 73% of the width / 19% of the height and the area around 29% / 19% are clear sky (nothing there). Low dark rolling hills along the ground line, then dark grass to the bottom. From left to right: a big dark TREE in silhouette with a full round crown from 4% to 21% of the width (5% to 47% of the height); a patch of tall dark GRASS from 26% to 38% of the width near the bottom; a closed dark-blue triangular TENT from 39% to 49% of the width (47% to 67% of the height), with NO light inside; a small ring of stones with one small log at about 56% / 72%, with NO fire; dark round BUSHES from 82% to 91% of the width (52% to 64% of the height); and a small dark POND with a faint reflection at about 91% / 75%. Everything is dim and quiet; nothing glows.

DO NOT INCLUDE: the moon, moonlight glow, fire, flames, campfire glow, lanterns, lamps, flashlights, light coming from the tent, fireflies, glowing dots, shooting stars, people, characters, animals, owls, frogs, crickets, birds, music notes, sound lines, any text, letters or numbers, signs, logos, daylight, sunset colors, bright or saturated neon colors, chibi proportions, manga style, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, perspective lines converging, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

### 10d. `coisas-noite.png` — 3 × 2 células de 320 (960 × 640), alfa

| Célula | Coisa | Desenho |
|---|---|---|
| 0 | **lua** | lua cheia cremosa com crateras suaves e um halo de luz macio em volta |
| 1 | **vaga-lumes** | grupinho de 7 vaga-lumes: pontinhos verde-amarelos brilhando, cada um com halo |
| 2 | **fogueira A** | toras cruzadas com chamas laranja e amarelas, halo quente |
| 3 | **fogueira B** | as **mesmas** toras, chamas em outro formato (para piscar com a A) |
| 4 | **estrela cadente** | estrela amarela de 5 pontas com rastro de luz para a **esquerda** (ela anda para a direita) |
| 5 | **lanterna** | lanterna de camping acesa (alça, corpo verde, vidro aceso), com halo |

~~~text
STYLE — light, soft PASTEL CARTOON illustration for a children's picture-book app (NOT chibi, NOT anime). Clean smooth outlines of thin-to-medium even weight, drawn in a darker tone of each area's own color (warm brown, deep teal, dusty plum — never pure black); flat colors with ONE soft shade, soft glow halos only around the lights; simple rounded friendly shapes; warm glowing pastel tones (cream, butter yellow, soft orange, lime glow) that read well over a dark night background.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 320 x 320 (total 960 x 640), read left to right, top row first. One item per cell, centered, about 80% of the cell, each light with a soft transparent glow halo that stays INSIDE its cell, no ground, no cast shadow.
1. A full creamy MOON with soft craters and a gentle glow halo.
2. A small group of seven FIREFLIES: glowing lime-yellow dots, each with a soft halo.
3. A CAMPFIRE: crossed logs with orange and yellow flames and a warm glow (frame A).
4. The SAME campfire with the SAME logs, flames in a different shape (frame B, for flickering).
5. A yellow five-pointed SHOOTING STAR with a soft light trail behind it to the LEFT (it moves to the right).
6. A glowing camping LANTERN: handle on top, green body, bright warm glass, soft halo.

DO NOT INCLUDE: people, characters, animals, faces on the moon or the stars, a dark sky background, scenery, trees, tents, ground, music notes, any text, letters or numbers, glows crossing cell borders, items cut by the cell edge, different art styles between cells, harsh neon, chibi proportions, manga style, heavy thick black outlines, pure-black lines, painterly brush texture, grain, noise, airbrush, 3D render, photorealistic, colored backgrounds behind the items, white sticker keyline, watermarks, signatures, @handles, website names.
~~~

## 11. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24) e os pontinhos soltos.
2. Conferir célula por célula:
   - a ordem;
   - nenhum bicho escondido no fundo da praia;
   - nenhuma nota musical fora da capa;
   - a tela do tablet da Duda virada para ela;
   - o telão do teatrinho liso e vazio;
   - os cantos de baixo da praia livres.
3. Medir os lugares fixos do `bg-praia` (coqueiro, pedra, duna, cabana, toca, castelo) e ajustar o `data/layout.ts` à arte.
4. Anotar tudo no `MANIFEST.md` da pasta de assets.
