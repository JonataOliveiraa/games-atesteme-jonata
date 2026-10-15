# Corrida no Cabo — texturas

Destino: `src/assets/games/EF04CO04/corrida-no-cabo/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 o fio e o mergulho).

**Com imagem de referência:** anexe em **toda geração** a `references/35-chibi-voador.webp` (os quatro meninos chibi voando entre nuvens, com slimes e arco-íris). Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*. O elenco da referência (os quatro meninos, os slimes, as nuvens, o arco-íris e os balões de símbolo) vai no negativo de todos os prompts. Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

> Depende da Dúvida 1 do plano: se a linha mudar para Muse Dash, trocam só os blocos STYLE e o elenco do negativo.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `pista.png` | 3 × 2 | 360 | 1080 × 720 | sim | pedaço do tubo, conector, portal, brilho 1, brilho 0, sinal |
| `aparelhos.png` | 2 × 1 | 640 × 560 | 1280 × 560 | sim | notebook na mesinha, computador na mesinha |
| `pecas.png` | 4 × 2 | 256 | 1024 × 512 | sim | carrinho (de lado), carrinho freando, chaminha, brilho, estrela, coração, sol, foguete |
| `ui.png` | 3 × 2 | 480 × 300 | 1440 × 600 | sim | quadro do combinado, cartão, caixinha do visor, botão 1, botão 0, painel dos botões |
| `cover-corrida-no-cabo.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

> **Entregue em 13/10/2026** (medidas no `MANIFEST.md` da pasta de assets). A arte veio um pouco fora deste contrato, e o código foi ajustado a ela: `pista` em células de 350, `aparelhos` em células de 512 × 512, e a `ui` em **duas folhas**: `ui1.png` (5 × 1 de 350: botão 1, botão 0, caixinha, painel, cartão) e `ui2.png` (o quadro). Numa nova geração, siga estas folhas entregues.

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem e o conteúdo de cada célula não podem mudar.

**Não existe fundo.** A parede e o chão da vista geral e o fundo de dentro do fio são cores lisas, pintadas pelo código (pedido do usuário: nada de árvore nem cenário).

## 2. Regras deste jogo

- **Nenhum texto na arte.** Os números 1 e 0, os códigos e a palavra "Mande" são do código. Portal, botões, cartões e telas vêm **em branco**. A única exceção é a capa: o título e os números das portas.
- **Cor só por número, nunca por figura.** O amarelo é do 1 e o azul é do 0, e só no brilho e nos botões. Os cartões são todos iguais.
- **Tudo visto de lado (de frente)**: o tubo, o portal, o carrinho, os aparelhos.
- **O tubo é o mesmo nas duas escalas.** O jogo encolhe o pedaço do tubo até virar um fio fino entre os computadores e depois mergulha nele. Por isso o pedaço tem de repetir sem emenda e ter as bordas escuras em cima e embaixo, como um fio de verdade.
- Peça solta e centrada na célula, com cerca de 8 % de margem. As exceções são o pedaço do tubo, que encosta nas bordas da esquerda e da direita, e os pés das mesas, que tocam a borda de baixo.

---

## 3. `pista.png` — 3 × 2 células de 360 (1080 × 720), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **pedaço do tubo**, visto de lado e na horizontal: borda lilás-acinzentada escura em cima e embaixo, miolo claro de vidro leitoso, uma faixa de brilho perto da borda de cima e um tracejado fraco no meio. Altura ≈ 42 % da célula, centrada. **Vai de borda a borda** na horizontal e repete sem emenda | o código dobra esse pedaço ao longo do fio (é a textura do fio fino e do tubo da corrida) |
| 1 | **conector**: o plugue do fim do fio, apontando para a DIREITA: anel escuro à esquerda, corpo de metal claro arredondado, quatro contatos dourados na ponta da direita | entra na porta do computador |
| 2 | **portal**, visto de lado: uma moldura em pé com **duas janelas abertas** (vazadas), uma em cima e outra embaixo. Tampa arredondada em cima, divisória no meio, tampa embaixo e duas hastes finas dos lados. Uma lampadinha **apagada** em cada tampa | o código escreve o 1 acima e o 0 abaixo |
| 3 | **brilho 1**: brilho amarelo-quente translúcido, redondo | a janela 1 acesa |
| 4 | **brilho 0**: o mesmo em azul-claro | a janela 0 acesa |
| 5 | **sinal**: uma bolinha de luz branca e amarela, pequena e brilhante | o sinal que sai do notebook antes do mergulho |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 360 x 360 (total 1080 x 720), read left to right, top row first. Parts of a cute cable seen FROM THE SIDE, all at the same scale.
1. A straight HORIZONTAL piece of a cable seen from the side, like a clear tube: a dark lilac-grey rim along the top edge and along the bottom edge, a light milky-glass inside, one soft white shine stripe near the top rim and a faint dashed line along the middle. It is about 42% of the cell height, vertically centered, and runs from the LEFT EDGE to the RIGHT EDGE of the cell so it tiles seamlessly side by side.
2. A cute cable CONNECTOR PLUG pointing to the RIGHT: a dark ring collar on the left, a rounded light metal body, and four small golden contacts at the right tip.
3. A cute GATE seen from the side, standing upright: a rounded frame with TWO OPEN WINDOWS (see-through holes), one in the upper half and one in the lower half; a rounded cap on top, a divider bar in the middle, a rounded cap at the bottom and two thin side bars. One small round lamp on the top cap and one on the bottom cap, both turned OFF (soft grey-cream).
4. A soft translucent WARM YELLOW glow: a round, gentle blob of light.
5. The same soft translucent glow in LIGHT BLUE.
6. A small bright SPARK of light: a glowing white dot with a warm yellow halo.

DO NOT INCLUDE: cars, vehicles, people, hands, computers, text, letters, numbers, digits, symbols on the gate, arrows, logos, warning signs, labels, lamps that are already lit on the gate, filled or glass-covered windows on the gate, backgrounds behind the items, ground, shadows on the ground, items crossing cell borders (except piece 1 which touches the left and right edges as described), different scales between cells, top-down views, strong perspective, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `aparelhos.png` — 2 × 1 células de 640 × 560 (1280 × 560), alfa

As duas pontas do fio, **de frente**, cada uma na sua mesinha. **Os pés da mesa encostam na borda de baixo da célula**, porque o jogo põe esse pé no chão. A tela vem **vazia e clara**: o código desenha a figura, a memória e o "?" nela.

| Célula | Peça | Uso |
|---|---|---|
| 0 | **notebook lilás aberto** numa mesinha de madeira, de frente. A tela ocupa ≈ 40 % da largura da célula, e há uma **entrada de cabo no lado DIREITO** da base do notebook | quem manda; a tela mostra a figura que vai ser mandada |
| 1 | **monitor verde-menta** numa mesinha de madeira, de frente, com a tela grande (≈ 70 % da largura da célula) e uma **entrada de cabo no lado ESQUERDO** do monitor, na altura do meio | quem recebe; a memória e a figura que chegou |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 2 columns x 1 row, each cell 640 x 560 (total 1280 x 560), read left to right. Two cute, chunky, toy-like computers seen FROM THE FRONT, each standing on its own small wooden desk. The desk legs touch the BOTTOM EDGE of the cell. Both at the same scale.
1. A rounded LILAC LAPTOP, open, standing on a small wooden desk, with an EMPTY light screen (plain pale cream-white, nothing on it, about 40% of the cell width) and a chunky keyboard. On the RIGHT side of the laptop base, one clear round cable socket.
2. A rounded MINT-GREEN DESKTOP MONITOR on a stand, on a small wooden desk, with a big EMPTY light screen (plain pale cream-white, nothing on it, about 70% of the cell width). On the LEFT side of the monitor, at mid height, one clear round cable socket.

DO NOT INCLUDE: anything on the screens, icons, windows, wallpapers, text, letters, numbers, logos, brand marks, apple logos, cables plugged in, mouse, phones, plants, mugs, pencil cups, lamps, decorations on the desks, people, hands, characters, backgrounds behind the items, wall, floor, shadows on the ground, items crossing cell borders, items cut by the cell edge (except the desk legs touching the bottom edge), different scales between cells, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `pecas.png` — 4 × 2 células de 256 (1024 × 512), alfa

| Célula | Peça | Uso |
|---|---|---|
| 0 | **carrinho visto de LADO**, apontando para a DIREITA: corrida fofo e baixinho, lilás e creme, bolha de vidro em cima (sem piloto), duas rodas, um aerofólio pequeno atrás e um farol na frente. Bem mais largo que alto (≈ 2 : 1) | o carrinho, dentro do tubo |
| 1 | o mesmo carrinho **freando**: luz de freio rosada acesa atrás | parado diante do portal |
| 2 | **chaminha do embalo**: chama pequena e fofa apontando para a ESQUERDA (sai de trás do carrinho) | o embalo |
| 3 | **brilho**: estrelinha de 4 pontas com faíscas | acerto |
| 4 | **estrela** dourada | figurinha |
| 5 | **coração** rosa | figurinha |
| 6 | **sol** laranja, só o disco com raios | figurinha |
| 7 | **foguete** branco e azul-céu, subindo | figurinha |

As quatro figurinhas têm **o mesmo tamanho e o mesmo traço** e se leem a 48 px. Não usam o amarelo-limão do 1 nem o azul do 0 como cor principal.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row first. Each item centered in its cell with about 8% margin, no ground, no shadow.
1. A cute, low, rounded RACE CAR seen FROM THE SIDE, pointing to the RIGHT, about twice as wide as it is tall: lilac and cream body, a clear bubble canopy on top with NO driver inside, two round wheels, a small rear spoiler on the left and one round headlight on the right.
2. The SAME race car, same size and angle, BRAKING: a soft pink brake light glowing at the back (left side).
3. A small cute FLAME puff pointing to the LEFT, like a booster flame coming out of the back of a toy car.
4. A cute 4-point SPARKLE star with a few tiny sparks around it.
5. A golden-amber STAR, simple sticker icon.
6. A pink HEART, simple sticker icon.
7. An orange SUN: a round disc with short rounded rays, simple sticker icon, no face.
8. A small white ROCKET with sky-blue fins and window, flying upward, simple sticker icon.
Items 5 to 8 are the same size and the same line weight, simple and readable at a small size.

DO NOT INCLUDE: drivers, people, faces or eyes on the car, faces on the sun, star or heart, text, letters, numbers, license plates with characters, logos, brand marks, racing numbers on the car, top-down views of the car, backgrounds behind the items, ground, road, shadows on the ground, items crossing cell borders, items cut by the cell edge, different car shapes between cells 1 and 2, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `ui.png` — 3 × 2 células de 480 × 300 (1440 × 600), alfa

Peças **em branco** e de frente. O quadro, o cartão e o painel são esticados pelo código (bordas de ≈ 36 px ficam intactas), então os cantos não podem ter enfeite que se deforme.

| Célula | Peça | Uso |
|---|---|---|
| 0 | **quadro do combinado**: papel creme largo (≈ 4 : 1), cantos arredondados, vazio | o combinado |
| 1 | **cartão**: cartãozinho creme (≈ 2 : 1), cantos arredondados e borda lilás macia, vazio | cada linha do combinado |
| 2 | **caixinha do visor**: quadradinho arredondado, fundo azul-marinho fundo, vazio | cada número do visor e da memória |
| 3 | **botão 1**: botão redondo grande de fliperama, **amarelo-quente**, brilhante, face lisa | o botão 1 |
| 4 | **botão 0**: o mesmo botão em **azul** | o botão 0 |
| 5 | **painel dos botões**: painel creme alto e estreito (≈ 1 : 2,3), cantos bem arredondados, borda lilás | onde ficam os dois botões, à esquerda |

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A game UI sprite sheet on a fully TRANSPARENT background: a grid of 3 columns x 2 rows, each cell 480 x 300 (total 1440 x 600), read left to right, top row first. Big, clean, friendly UI pieces for a children's game, each centered with about 6% margin, seen straight from the front, ALL COMPLETELY BLANK so the game can write on them. Keep the corners simple (no pins, no ornaments), because the game stretches the middle of pieces 1, 2 and 6.
1. A wide blank BOARD (about 4:1): cream paper with rounded corners and a soft darker rim, empty face.
2. A small blank CARD (about 2:1): cream with rounded corners and a soft lilac border, empty face.
3. A small rounded-square SLOT: a deep navy inset box with a soft rim, empty.
4. A big round glossy ARCADE BUTTON in WARM YELLOW, seen from the front, with a plain empty face.
5. The SAME big round glossy arcade button in BLUE, plain empty face.
6. A tall narrow blank PANEL (about 1:2.3): cream with very rounded corners and a soft lilac border, empty face.

DO NOT INCLUDE: any text, letters, numbers, digits, words, icons, symbols, emojis, pins, ribbons, corner ornaments, people, faces, characters, logos, brand marks, backgrounds behind the items, shadows on the ground, items crossing cell borders, items cut by the cell edge, red danger colors, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `cover-corrida-no-cabo.png` — 1672 × 941, opaco, com o título

Um notebook lilás e um monitor verde-menta, cada um na sua mesinha, ligados por um fio fino que cede entre as mesas. Uma lupa enorme (ou um círculo de zoom) sobre o meio do fio mostra o que tem dentro: o carrinho correndo no tubo e passando por um portal com a janela 1 acesa em amarelo e a janela 0 em azul. No monitor aparece uma estrela dourada. Fundo liso, sem cenário. O título vai num letreiro no alto (memória *capa tem título*).

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark navy, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (lilac, mint-teal, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque, on a plain soft lavender background with nothing else around. On the left, a rounded lilac laptop on a small wooden desk; on the right, a rounded mint-green monitor on a small wooden desk, its screen showing a big golden star. A THIN cable connects the two computers and sags gently between the desks. In the middle, a big round zoom bubble (like a magnifying view) shows the INSIDE of that cable as a wide clear tube: a cute lilac-and-cream race car zooms through it, passing a gate with two windows; the top window glows warm yellow with the digit 1 above it, the bottom window glows blue with the digit 0 below it. At the top center, a cute rounded sign shows the title "Corrida no Cabo" in big, bold, rounded, friendly letters, spelled exactly like that.

DO NOT INCLUDE: any other text besides the title and the two digits by the gate, misspelled title, extra letters, subtitles, numbers on the car, logos, brand marks, apple logos, driver inside the car, faces on the car, people, characters, trees, plants, houses, landscape, sky, room furniture other than the two small desks, scary elements, night, red danger colors, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. Quando a arte chegar

1. Limpar o alfa baixo (≤ 24) e os pontinhos soltos (essa linha vem com franja).
2. Conferir:
   - **nenhum número nem letra** no portal, nos botões, nos cartões, no quadro e nas telas;
   - o portal com as duas janelas **vazadas** e as lâmpadas **apagadas**;
   - o pedaço do tubo repetindo sem emenda (se não repetir, cortar o miolo e repetir só ele);
   - o carrinho de lado, igual nos quadros 0 e 1;
   - os pés das mesas encostando na borda de baixo.
3. Medir no portal o centro das duas janelas e ajustar `PLAY.lane` e `GATE.overhang` no `data/layout.ts` para o carrinho passar no meio das janelas.
4. Medir nos aparelhos a área da tela e o centro de cada entrada de cabo, e ajustar `LAPTOP` e `COMPUTER` (em coordenadas da célula de 640 × 560).
5. Anotar tudo no `MANIFEST.md` da pasta de assets.
