# Cabo Certo — texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF05CO05/cabo-certo/`
Planejamento: §4 o laço, §5 a demonstração, §6 o N1 e §9 a expansão N2/N3.

## Linha de arte

**Chibi de caderno** (troca solicitada pelo usuário em 20/10/2026). Anexe em **toda geração as DUAS referências**: `references/37-chibi-caderno-a.png` e `references/38-chibi-caderno-b.png`. Reaproveita a linha e o negativo de elenco de [Árvore da Família](../../EF05CO02/arvore-da-familia/TEXTURAS.md), adaptando a paleta para não entregar respostas.

- Traço fino a médio **marrom quente**, com a ponta afinando; nunca preto puro nem contorno grosso.
- Cores **chapadas e apagadas**, sem sombra, degradê, brilho pintado ou hachura de lápis.
- Onde houver rosto: olhos redondos escuros com 1–2 brilhos, boca pequena e bochecha com poucos tracinhos. **Só o gabinete pode ter rosto**; os aparelhos da folha são objetos sem rosto.
- Florzinhas/estrelinhas são enfeites raros, apenas onde pedidos; nunca no chão jogável ou nas folhas de peças.
- Peças opacas têm fundo **creme**. As peças com alfa ficam transparentes por fora e opacas por dentro.
- Todo prompt abaixo contém o STYLE completo, o corpo e o negativo completo do elenco: a menina de suéter vermelho e saia xadrez, as outras meninas, o machado, os pompons, o texto japonês e a assinatura SOORA. Usar só o estilo, sem copiar elenco ou objetos.

### Comparação com as vizinhas

| | **Chibi de caderno (37/38, este jogo)** | Vetor geométrico (23/24, linha anterior) | Doodle de lápis (39, Rio de Chocolate) |
|---|---|---|---|
| Traço | fino a médio, marrom quente, ponta afinando | sem contorno | grafite quase preto, rabiscado e às vezes dobrado |
| Cor | chapada e apagada, sem sombra | chapada e saturada, painéis geométricos | base opaca com hachura diagonal — vista |
| Rosto | só no gabinete: olho redondo escuro com brilhos e bochecha com tracinhos | objetos geométricos | dois pontinhos e sorriso de risquinho |
| Fundo opaco | creme, miolo calmo | branco/azul-claro | cena colorida, sem papel quadriculado |
| Contorno branco | só a mão de demonstração, por contrato de legibilidade | só a mão | não |

**O jogo já roda sem nenhum PNG.** A reserva em `scenes/fallback.ts` usa as mesmas chaves e grades. A linha nova — dos PNGs; trocar um arquivo no destino substitui a reserva sem alterar código.

**Ficam no código para sempre:** os cabos jogáveis (a curva com barriga), a bolinha de informação, o anel do plugue solto, o brilho do processador pensando, o conteúdo da tela do monitor, ondas do microfone, notas do alto-falante, faíscas, setas da borda, legenda da demonstração e todas as palavras dos aparelhos/tomadas. A capa — uma cena estática com os cabos previstos no briefing original; eles não entram nos sprites do jogo.

**Contrato N2/N3 confirmado pelo Atlas:** preservar aparelhos 0–6; acrescentar RAM em 7, hub em 8 e cartão SD em 9; células 10–11 vazias. Peças 0–3 preservadas; acrescentar tomada de memória turquesa em 4; células 5–7 vazias. No N2 as tomadas ficam só com o ícone, que precisa ler a 74 px.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `aparelhos.png` | 4 × 3 | 256 × 256 | 1024 × 768 | sim | 10 aparelhos + 2 células vazias, N1–N3 |
| `pecas.png` | 4 × 2 | 128 × 128 | 512 × 256 | sim | plugue + 4 tomadas + 3 células vazias |
| `computador.png` | — | — | 400 × 480 | sim | gabinete de frente com janela do processador; único aparelho com rosto permitido |
| `chao.png` | — | — | 2400 × 1350 | opaco | mapa inteiro, tapete creme liso e miolo vazio |
| `mao.png` | — | — | 256 × 256 | sim | mãozinha; ponto de toque na ponta do indicador |
| `cover-cabo-certo.png` | — | — | 1672 × 941 | opaco | capa com o título CABO CERTO |

**A ordem das células — contrato com o código.** Não reorganizar nem compactar as células vazias. Na geração bruta, a resolução pode variar proporcionalmente; a Tesoura ajusta a grade e as âncoras ao tamanho final. A tela do monitor e o ponto do dedo continuam nas coordenadas finais contratadas.

## 2. Regras deste jogo

- **Nenhum texto na arte**, incluindo teclas, chips, cartão SD, marcas e tomadas. A única exceção — o título **CABO CERTO** na capa.
- **Nenhum fio desenhado nos sprites do jogo**: aparelhos, gabinete, plugue, tomadas, mão e chão. O código desenha os cabos. Não desenhar tomadas no gabinete nem no hub: elas são sobrepostas pelo código. Trilhas impressas discretas da placa do CPU não são fios soltos.
- **Nenhum aparelho pode ter verde, laranja, roxo ou TURQUESA**, nem na placa interna, lente, tecla, etiqueta ou luzinha. São cores exclusivas das tomadas de ENTRADA, SAÍDA, ARMAZENAMENTO e MEMÓRIA, respectivamente. Verde-sálvia e azul-esverdeado também estão proibidos nos aparelhos. O aparelho deve ser identificado pela função, não pela cor.
- Aparelhos compartilham a mesma paleta neutra quente: **creme, cinza quente, cacau, tijolo apagado, mostarda leve só como acento**. RAM nunca tem a placa verde. Nenhum aparelho ganha brilho, halo ou cor mais chamativa que outro.
- A tomada de MEMÓRIA tem base **turquesa #2BB3C9**. As quatro tomadas mantém cor e ícone legíveis a 74 px, inclusive sem placa de texto no N2.
- **A tela do monitor vem apagada**, azul-noite chapado e vazio: centro **(128, 104)** na célula, retângulo **196 × 116**, bordas **x30..226, y46..162**. Nada pode ocupar seu interior; — ali que o código desenha.
- Peças de frente ou em três-quartos bem leve, sem perspectiva forte; peças soltas e centradas, cerca de 8% de margem, sem sombra no chão.
- **Ponta do indicador da mão em (87, 18)** no PNG 256 × 256. `HAND_TIP` usa aproximadamente 34% da largura e 7% da altura. A borda branca grossa externa — exclusiva da mão; o traço marrom dela continua fino a médio.

---

## 3. `aparelhos.png` — 4 × 3 células de 256 (1024 × 768), alfa

| Célula | Linha/coluna | Conteúdo |
|---|---|---|
| 0 | 1/1 | **teclado** baixo, 4 fileiras de teclas vazias e barra de espaço comprida |
| 1 | 1/2 | **mouse** de cima, 2 botões e rodinha |
| 2 | 1/3 | **microfone** de cabeça redonda de grade, pedestal curto e base redonda |
| 3 | 1/4 | **câmera** de corpo arredondado, lente redonda grande e botão superior |
| 4 | 2/1 | **monitor**: tela apagada centro (128, 104), 196 × 116, pé curto e base |
| 5 | 2/2 | **alto-falante** em pé, cone pequeno em cima e grande embaixo |
| 6 | 2/3 | **pendrive** deitado, ponta metálica para a **ESQUERDA**, furinho de chaveiro |
| 7 | 2/4 | **MEMÓRIA RAM** deitada: placa comprida e baixa, 4 chips quadrados escuros em fila, dentes dourados embaixo e pequeno entalhe |
| 8 | 3/1 | **HUB** baixo e largo, vista frente-cima, 3 luzinhas em fila; sem furos/portas/fios |
| 9 | 3/2 | **cartão SD** em pé, canto superior direito cortado em diagonal, etiqueta lisa, contatos dourados em listras no topo |
| 10 | 3/3 | vazia, transparente |
| 11 | 3/4 | vazia, transparente |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading, NO gradients; soft rounded shapes. When a face is explicitly requested, use big round dark-brown eyes with one or two small white highlights, a small simple mouth, and soft rosy blush ovals with a few tiny diagonal hatch lines. Tiny doodle flowers or stars are rare accents only when requested. Warm muted palette adapted to this game: cream, warm grey, cocoa brown, dusty brick red, a little pale mustard; opaque backgrounds are warm cream. Green, orange, purple and turquoise are reserved for SOCKET PLATES and must NEVER color the devices, including their circuit boards and accents. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 3 rows, each cell 256 x 256 (total 1024 x 768), read left to right, top row first. One computer device per occupied cell, about 80% of the cell, centered with about 8% margin, front view with a very slight top-down tilt, no strong perspective. All devices are INANIMATE OBJECTS WITHOUT FACES. Use the SAME restricted warm neutral palette across all ten devices: cream, warm grey, cocoa brown, dusty brick red and small pale-mustard accents; no device may match any socket color. In particular the RAM circuit board is warm grey or cocoa, NEVER green. The camera lens and dark components are neutral cocoa/warm graphite; the monitor screen alone is dark navy because it is OFF. Paint the interiors fully opaque.
CELL 0, row 1 column 1: a low computer KEYBOARD, four rows of rounded square BLANK keys and a long space bar.
CELL 1, row 1 column 2: a computer MOUSE seen from above, two buttons and a scroll wheel.
CELL 2, row 1 column 3: a desk MICROPHONE, round mesh head on a short stand with a round base.
CELL 3, row 1 column 4: a small digital CAMERA, rounded rectangular body, one big round lens on the front and one button on top.
CELL 4, row 2 column 1: a computer MONITOR, wide screen with a thin bezel, short neck and base. The screen is OFF: a flat, EMPTY dark-night-blue rectangle with its center at EXACTLY (128, 104) within its cell, width 196 and height 116 (left 30, top 46, right 226, bottom 162). The screen interior is unobstructed; no face, reflection, border decoration or symbol inside it.
CELL 5, row 2 column 2: a LOUDSPEAKER standing upright, one large round cone below and one small cone above.
CELL 6, row 2 column 3: a USB FLASH DRIVE lying horizontally, capsule body, its metal plug pointing LEFT, one small keyring hole.
CELL 7, row 2 column 4: a RAM MEMORY MODULE lying horizontally, a long low circuit board in warm grey or cocoa with EXACTLY FOUR dark square chips in a single row; along its BOTTOM edge a row of pale-gold contact teeth with one small notch interrupting the teeth.
CELL 8, row 3 column 1: a HUB, a low wide rounded box seen from slightly above the front; EXACTLY THREE small round indicator lights in a row on its front, colored neutral cream or pale mustard. No holes or ports: game code adds the sockets.
CELL 9, row 3 column 2: an upright SD MEMORY CARD, a rounded rectangle with its TOP-RIGHT corner cut diagonally; a plain BLANK label and small gold contact stripes along the TOP.
CELL 10, row 3 column 3: EMPTY, completely transparent.
CELL 11, row 3 column 4: EMPTY, completely transparent.

DO NOT INCLUDE: faces, eyes, mouths, anthropomorphic devices, people, animals, text, letters, digits, symbols on keys, logos, labels with writing, green devices, sage devices, orange devices, purple devices, turquoise devices, teal devices, colored category clues on devices, cables, wires, drawn sockets or ports on devices, decorative flowers, decorative stars, lit monitor, screen contents, extra devices, objects in the last two cells, white sticker keyline, objects crossing cell borders, cropped objects, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, pom-poms, Japanese text, signatures, "SOORA", watermarks, pure-black outlines, thick or heavy outlines, uniform thick vector strokes, outline-free geometric vector construction, saturated neon colors, shading, gradients, cast shadows, drop shadows, glossy or airbrushed rendering, colored-pencil hatching, painterly rendering, 3D render, photorealistic, graph paper, graph-paper grid, visible sprite-sheet grid lines.
~~~

---

## 4. `pecas.png` — 4 × 2 células de 128 (512 × 256), alfa

| Célula | Linha/coluna | Conteúdo |
|---|---|---|
| 0 | 1/1 | **plugue** grafite quente deitado, 2 pinos metálicos para a **DIREITA**; sem fio |
| 1 | 1/2 | **ENTRADA**: placa redonda verde, furo escuro, seta branca para a **DIREITA** |
| 2 | 1/3 | **SAÍDA**: placa redonda laranja, furo escuro, seta branca para a **DIREITA** |
| 3 | 1/4 | **ARMAZENAMENTO**: placa redonda roxa, furo escuro, bauzinho branco |
| 4 | 2/1 | **MEMÓRIA**: placa redonda turquesa **#2BB3C9**, furo escuro, pente branco retangular com dentinhos embaixo |
| 5 | 2/2 | vazia, transparente |
| 6 | 2/3 | vazia, transparente |
| 7 | 2/4 | vazia, transparente |

A seta das duas primeiras tomadas aponta para a direita; a posição delas em relação ao computador dá o sentido de entrada/saída. Não inverter o desenho. Baú e pente não são texto e precisam ser distinguíveis a 74 px.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading, NO gradients; soft rounded shapes. When a face is explicitly requested, use big round dark-brown eyes with one or two small white highlights, a small simple mouth, and soft rosy blush ovals with a few tiny diagonal hatch lines. Tiny doodle flowers or stars are rare accents only when requested. Warm muted palette adapted to this game: cream, warm grey, cocoa brown, dusty brick red, a little pale mustard; opaque backgrounds are warm cream. Green, orange, purple and turquoise are reserved for SOCKET PLATES and must NEVER color the devices, including their circuit boards and accents. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2 rows, each cell 128 x 128 (total 512 x 256), read left to right, top row first. One object centered per occupied cell, about 80% of its cell wide, same visual weight, flat front view, opaque interiors. These colorful SOCKET PLATES are the ONLY objects permitted to use the reserved green, orange, purple and turquoise category colors. Their symbols must be large and clear at a displayed size of 74 px: pure cream-white solid silhouettes with only the detail needed for recognition, no writing. Warm-brown outlines remain thin-to-medium.
CELL 0, row 1 column 1: an electric PLUG, a warm graphite capsule lying horizontally, TWO short metal pins pointing RIGHT, no cord.
CELL 1, row 1 column 2: a round GREEN INPUT socket plate, one dark round hole and one large white arrow pointing RIGHT.
CELL 2, row 1 column 3: a round ORANGE OUTPUT socket plate, one dark round hole and one large white arrow pointing RIGHT.
CELL 3, row 1 column 4: a round PURPLE STORAGE socket plate, one dark round hole and a small clear WHITE TREASURE CHEST icon.
CELL 4, row 2 column 1: a round TURQUOISE MEMORY socket plate, exact base color #2BB3C9, one dark round hole and a large clear WHITE RAM MODULE icon: one horizontal rectangle with a row of little teeth along its BOTTOM edge.
CELL 5, row 2 column 2: EMPTY, completely transparent.
CELL 6, row 2 column 3: EMPTY, completely transparent.
CELL 7, row 2 column 4: EMPTY, completely transparent.

DO NOT INCLUDE: faces, eyes, people, animals, text, labels, letters, digits, left-pointing arrows, upward arrows, downward arrows, plug pins pointing left, cord, cable, wire, extra sockets, objects in cells 5 through 7, white sticker keyline, decorative flowers, decorative stars, tiny illegible icons, objects crossing cell borders, cropped objects, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, pom-poms, Japanese text, signatures, "SOORA", watermarks, pure-black outlines, thick or heavy outlines, uniform thick vector strokes, outline-free geometric vector construction, saturated neon colors, shading, gradients, cast shadows, drop shadows, glossy or airbrushed rendering, colored-pencil hatching, painterly rendering, 3D render, photorealistic, graph paper, graph-paper grid, visible sprite-sheet grid lines.
~~~

---

## 5. `computador.png` — 400 × 480, alfa

Gabinete frontal creme com painéis cinza quente. Janela no terço superior: placa **cacau, sem verde**, chip grafite quente e pinos mostarda-dourados. A reserva usa janela x70..330, y55..245 e centro do chip em **(200, 150)**; preservar esse alinhamento com o brilho do código. Rosto pequeno abaixo da janela, sem cobrir o chip; botão redondo sem símbolo e duas frestas embaixo. Sem tomadas/portas desenhadas: o código posiciona as tomadas conforme o nível.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading, NO gradients; soft rounded shapes. When a face is explicitly requested, use big round dark-brown eyes with one or two small white highlights, a small simple mouth, and soft rosy blush ovals with a few tiny diagonal hatch lines. Tiny doodle flowers or stars are rare accents only when requested. Warm muted palette adapted to this game: cream, warm grey, cocoa brown, dusty brick red, a little pale mustard; opaque backgrounds are warm cream. Green, orange, purple and turquoise are reserved for SOCKET PLATES and must NEVER color the devices, including their circuit boards and accents. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A single game sprite on a fully TRANSPARENT background, 400 x 480: a friendly desktop computer TOWER seen EXACTLY FROM THE FRONT, upright, softly rounded corners, warm cream front and warm-grey side panels, cocoa-brown fine lineart. The tower is centered with small transparent margins. The upper third has a wide window into its interior: at the target size the window occupies x70 to330 and y55 to245, centered at (200, 150). It shows a COCOA-BROWN circuit board, NEVER green or teal, and a warm graphite SQUARE CPU CHIP centered at (200, 150), about124 x124, with small pale-mustard gold pins on ALL FOUR SIDES. Only sparse simple printed-circuit traces, no loose wires. The CPU itself has no face, words or symbols and stays clearly visible for the game's animated glow.
BELOW the window, on the cream front, a small sweet readable face: two round dark-brown eyes with one tiny white highlight each, a small curved smile, subtle rosy cheeks with two tiny diagonal cheek ticks. Keep this little face around y295 to320, away from the CPU window. Below it, a simple small round power button WITHOUT any symbol and TWO horizontal ventilation slots. No hands, arms, legs, sockets, ports, cables or text anywhere. Flat muted colors and a calm expression; this tower is the only device allowed a face.

DO NOT INCLUDE: green, sage, orange, purple, turquoise or teal on the tower or circuit board, a face on the CPU chip, face inside the window, extra characters, humans, animals, text, letters, digits, CPU lettering, logos, power-button glyph, sockets, ports, cables, external wires, loose internal wires, floating decorations, stars, flowers, white sticker keyline, strong perspective, tilted tower, side view, monitor instead of tower, cropped edges, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, pom-poms, Japanese text, signatures, "SOORA", watermarks, pure-black outlines, thick or heavy outlines, uniform thick vector strokes, outline-free geometric vector construction, saturated neon colors, shading, gradients, cast shadows, drop shadows, glossy or airbrushed rendering, colored-pencil hatching, painterly rendering, 3D render, photorealistic, graph paper, graph-paper grid, visible sprite-sheet grid lines.
~~~

---

## 6. `chao.png` — 2400 × 1350, opaco

Chão visto de cima, fundo e tapete **creme liso** para a linha nova; mantém o mapa inteiro e o miolo vazio exigidos no planejamento. Dois vasos pequenos só nos cantos distantes superior direito e inferior esquerdo, fora da tela do N1. Sem móveis, grade, textura de papel, enfeites ou objetos no miolo. A borda do tapete — fina e periférica.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading, NO gradients; soft rounded shapes. When a face is explicitly requested, use big round dark-brown eyes with one or two small white highlights, a small simple mouth, and soft rosy blush ovals with a few tiny diagonal hatch lines. Tiny doodle flowers or stars are rare accents only when requested. Warm muted palette adapted to this game: cream, warm grey, cocoa brown, dusty brick red, a little pale mustard; opaque backgrounds are warm cream. Green, orange, purple and turquoise are reserved for SOCKET PLATES and must NEVER color the devices, including their circuit boards and accents. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A wide game background, 2400 x 1350, fully OPAQUE, seen from STRAIGHT ABOVE: the floor of a calm computer room. A warm CREAM background with one huge PLAIN light warm-cream rug covering almost the entire canvas, rounded corners and only one delicate warm-brown perimeter line. The rug is a single uninterrupted FLAT color with NO shading, NO texture, NO pattern, NO grid and NO table. Only TWO SMALL POTTED PLANTS: one in the extreme TOP-RIGHT corner and one in the extreme BOTTOM-LEFT corner, each confined to the outermost 8% of the width and height. The pots are muted cocoa or dusty brick, the leaves muted sage; these plants are scenery, not devices. The entire central 84% of the canvas is completely EMPTY and calm for game objects and moving cables. The image fills every canvas edge. No furniture, no computer devices, no loose cables, no people and no text.

DO NOT INCLUDE: anything in the middle of the floor, devices, plugs, sockets, cables, wires, furniture, tables, chairs, shelves, people, animals, characters, faces, text, letters, digits, dark central rug, wood grain, planks, tiles, checkerboard, graph paper, patterns, rug motifs, rug fringe, pencil hatching, paper grain, paper wrinkles, scattered objects, flowers, stars, extra plants, white sticker keyline, horizon, walls, perspective view, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, pom-poms, Japanese text, signatures, "SOORA", watermarks, pure-black outlines, thick or heavy outlines, uniform thick vector strokes, outline-free geometric vector construction, saturated neon colors, shading, gradients, cast shadows, drop shadows, glossy or airbrushed rendering, colored-pencil hatching, painterly rendering, 3D render, photorealistic, graph paper, graph-paper grid, visible sprite-sheet grid lines.
~~~

---

## 7. `mao.png` — 256 × 256, alfa

Mãozinha de criança em desenho chibi: indicador para cima, três dedos dobrados, polegar cruzado na palma, punho saindo para baixo. Pele clara chapada e traço marrom quente fino a médio; **uma borda branca grossa externa** por contrato de legibilidade. Sem manga, rosto ou marcas de clique. Ponta do indicador em **(87, 18)** no final; ajustar sem cortar a ponta ou afinar a borda.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading, NO gradients; soft rounded shapes. When a face is explicitly requested, use big round dark-brown eyes with one or two small white highlights, a small simple mouth, and soft rosy blush ovals with a few tiny diagonal hatch lines. Tiny doodle flowers or stars are rare accents only when requested. Warm muted palette adapted to this game: cream, warm grey, cocoa brown, dusty brick red, a little pale mustard; opaque backgrounds are warm cream. Green, orange, purple and turquoise are reserved for SOCKET PLATES and must NEVER color the devices, including their circuit boards and accents. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A single game sprite on a fully TRANSPARENT background, 256 x 256: a small child's hand in the same soft chibi sketchbook linework as the references, pointing STRAIGHT UP with the INDEX finger. The other three fingers are FOLDED into the palm, and the thumb is folded ACROSS the palm; a short wrist extends DOWN. Soft rounded anatomy, flat light warm skin tone, fine-to-medium tapered WARM-BROWN interior and silhouette lines, no shadows. ONE thick WHITE outer keyline surrounds the WHOLE hand silhouette for visibility on top of devices, cables and the floor; the brown ink line inside this keyline remains thin, never thick black. This white keyline is the deliberate exception for this ONE asset only. At the final256 x256 size the TIP of the index finger is at EXACTLY x87, y18: this is the touch point. Keep the finger upright and preserve enough canvas to align this point; the wrist exits toward the bottom with no sleeve. One hand only, opaque skin interior.

DO NOT INCLUDE: face, eyes, mouth, sleeve, glove, second hand, extra fingers, six fingers, missing thumb, middle finger pointing up, two raised fingers, sideways finger, left-pointing finger, click lines, touch ripples, sparkles, stars, flowers, text, letters, digits, logo, cables, wires, objects held in the hand, shading, dark thick keyline instead of white, cropped index fingertip, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, pom-poms, Japanese text, signatures, "SOORA", watermarks, pure-black outlines, thick or heavy outlines, uniform thick vector strokes, outline-free geometric vector construction, saturated neon colors, shading, gradients, cast shadows, drop shadows, glossy or airbrushed rendering, colored-pencil hatching, painterly rendering, 3D render, photorealistic, graph paper, graph-paper grid, visible sprite-sheet grid lines.
~~~

---

## 8. `cover-cabo-certo.png` — 1672 × 941, opaco

Título **CABO CERTO**, exatamente assim, no alto; fundo creme. Gabinete sorridente central na mesma linha do sprite; teclado, monitor, microfone e pendrive em volta, sem rosto e em neutros quentes. Capa mantém os cabos coloridos da cena prevista no briefing original: teclado e microfone verdes (entrada), monitor laranja (saída), pendrive roxo (armazenamento); as cores de tomada nunca passam para os corpos dos aparelhos. Monitor com uma bolinha clara de informação. Nenhuma outra palavra.

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: cute doodle chibi sketchbook illustration; thin-to-medium hand-inked lineart in a very dark warm brown (never pure black), slightly tapered at the ends; flat, muted colors with NO shading, NO gradients; soft rounded shapes. When a face is explicitly requested, use big round dark-brown eyes with one or two small white highlights, a small simple mouth, and soft rosy blush ovals with a few tiny diagonal hatch lines. Tiny doodle flowers or stars are rare accents only when requested. Warm muted palette adapted to this game: cream, warm grey, cocoa brown, dusty brick red, a little pale mustard; opaque backgrounds are warm cream. Green, orange, purple and turquoise are reserved for SOCKET PLATES and must NEVER color the devices, including their circuit boards and accents. Take ONLY the art style: do NOT copy their characters, outfits, poses, props or handwriting.

A game COVER illustration, 1672 x 941, landscape, fully opaque, on a warm CREAM background. At the TOP CENTER a large clear title written EXACTLY "CABO CERTO" in uppercase rounded hand-lettered letters, warm cocoa and muted brick with small pale-mustard accents; fine-to-medium warm-brown outline, flat color, no thick black border or 3D volume. This title is the ONLY text anywhere.
Below the title, the same friendly upright desktop TOWER COMPUTER is central: warm-cream front, warm-grey panels, upper window with cocoa circuit board and a warm-graphite CPU chip with pale-gold pins on all four sides, a small cute face BELOW the window with round dark-brown eyes, one or two tiny eye highlights and cheek ticks. Arrange a keyboard at left, a microphone at lower left, a wide monitor at right and a horizontal USB flash drive below right, all OBJECTS WITHOUT FACES in the SAME restricted warm-neutral palette: cream, warm grey, cocoa, dusty brick, sparse pale mustard. No device is green, orange, purple or turquoise, not even a tiny indicator or circuit board. Blank keyboard keys; the monitor's dark-night-blue screen contains just ONE small cream-white dot of light, no face, lettering or interface.
A few simple curving COLORFUL INFORMATION CABLES visually link these four devices to the central tower, as a static cover scene: green, orange and purple belong only to the connection cables and socket plates, never to the device bodies. Match function to connection color: KEYBOARD and MICROPHONE use GREEN input cables; MONITOR uses an ORANGE output cable; USB FLASH DRIVE uses a PURPLE storage cable. Keep the cables well spaced, easy to follow, with no tangled knot. The cover is the only illustration with drawn connecting cables; game sprites have none. No people. Only one or two tiny hand-inked star accents in the free cream space, no clutter.

DO NOT INCLUDE: any text except CABO CERTO, misspelled title, lowercase title, subtitles, letters on keys, labels, numbers, brands, logos, user interface, speech bubbles, people, humans, animals, anthropomorphic peripheral devices, face on the monitor, faces on keyboard or microphone or flash drive, green devices, sage devices, orange devices, purple devices, turquoise devices, teal devices, tangled cables, photorealistic components, busy room, clutter, white sticker keyline, thick title outline, 3D lettering, the characters from the reference images (a girl with long wavy black hair in a red turtleneck, plaid mini skirt and lace-up black boots carrying a tote bag; a mint-green-haired girl in an oversized red hoodie; a blonde twin-tailed girl in a grey sweater; a pink-haired cheerleader with yellow pom-poms; a blonde girl in a black dress with small horns; a black-haired maid girl holding a battle axe), weapons, axes, pom-poms, Japanese text, signatures, "SOORA", watermarks, pure-black outlines, thick or heavy outlines, uniform thick vector strokes, outline-free geometric vector construction, saturated neon colors, shading, gradients, cast shadows, drop shadows, glossy or airbrushed rendering, colored-pencil hatching, painterly rendering, 3D render, photorealistic, graph paper, graph-paper grid, visible sprite-sheet grid lines.
~~~

---

## 9. Conferência e entrega

1. Confirmar referências 37 e 38 anexadas em **toda** geração; traço marrom quente fino a médio, cores chapadas/apagadas, sem sombras/degradês/contorno preto grosso. Não aceitar elenco, roupas, props, letra japonesa ou SOORA das referências.
2. Conferir grades e ordem: aparelhos 4 × 3, 0–9 ocupadas, 10–11 vazias; peças 4 × 2, 0–4 ocupadas, 5–7 vazias. Não compactar células vazias.
3. Conferir **nenhum verde/laranja/roxo/turquesa nos aparelhos**, inclusive RAM, circuito interno, câmera, hub e cartão. Nenhum rosto fora do gabinete.
4. Conferir tela do monitor apagada e vazia, centro (128, 104), 196 × 116; alinhar precisamente após a geração. Ponta do pendrive para a esquerda; pinos do plugue e setas para a direita; SD com corte superior direito; RAM com 4 chips e dentes inferiores; hub com 3 luzinhas e sem portas.
5. Tomadas: verde/laranja/roxa/turquesa#2BB3C9; setas, baú e pente brancos distinguíveis a 74 px. Nenhuma letra.
6. Conferir chip do gabinete em (200, 150) e mão com ponta em (87, 18), sem alterar as âncoras do código.
7. Manter pintura opaca no interior dos sprites e limpar a franja do alfa. Fundo transparente real nos quatro sprites/folhas; chão e capa totalmente opacos. **Nenhum fio desenhado nos sprites do jogo.**
8. Chão 2400 × 1350 creme, liso, miolo vazio, dois vasos só nos cantos. Capa 1672 × 941 com título CABO CERTO correto e único texto.
9. Ordem de geração: computador, chão, mão, capa; depois aparelhos e peças conforme contrato Atlas acima. Guardar brutos e variações em `scratchpad/cabo-raw/`, registrar prompts/tentativas e enviar cada selecionado imediatamente — Tesoura. A Tesoura ajusta dimensões, grade, âncoras, alfa e compressão, sem mudar conteúdo/ordem.
