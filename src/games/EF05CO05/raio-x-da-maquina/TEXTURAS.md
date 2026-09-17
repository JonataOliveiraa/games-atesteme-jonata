# Raio-X da Máquina — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO05/raio-x-da-maquina/`

**Quatro arquivos para jogar, mais a capa do catálogo.**

> **O estilo é o de `references/ESTILO.md` — chibi de figurinha —, e as DUAS
> imagens de referência (`16-chibi-figurinhas.jpg` e `17-chibi-tirinha.jpg`) vão
> anexadas em TODAS as gerações.** Cada prompt abaixo já vem inteiro — estilo,
> corpo e negativo —, para ser copiado e colado sem montar nada por cima.

> **O raio-X não é o desenho. O raio-X é o `Graphics`.** As peças são objetos
> fofos de cor cheia; quem faz parecer radiografia é o fundo azul-escuro da tela,
> o brilho ciano atrás de cada peça, as linhas de varredura e a faixa de luz que
> desce. Pedir "silhueta de raio-X" ao gerador entrega cinza em cinza, e aí as
> quinze peças ficam iguais no celular — que é exatamente o que este jogo não
> pode ser.

> **O jogo roda inteiro com zero PNG.** Tela, baias, carimbos, vistos,
> plaquinhas, placa do pedido, botão, cabeçalho, vidas, bolinhas, estrelas e
> confete nascem em `Graphics`; as texturas só trocam as peças, a máquina, a Lia
> e o fundo.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `pecas.png` | 1280 × 768 | 5 × 3 de 256 | alfa real | **as quinze peças**, na ordem do `pecas.ts` |
| 2 | `maquina.png` | 512 × 256 | 2 × 1 de 256 | alfa real | o computador: apagado e ligado |
| 3 | `lia.png` | 768 × 256 | 3 × 1 de 256 | alfa real | a técnica da oficina: neutra, alegre, pensativa |
| 4 | `bg-oficina.png` | 1672 × 941 | imagem única | opaco | a oficina, **com o meio livre e escuro** |
| 5 | **`coisas.png`** | 1024 × 256 | 4 × 1 de 256 | alfa real | o que o computador manipula: desenho, foto, música, texto |
| 6 | **`rostos.png`** | 768 × 256 | 3 × 1 de 256 | alfa real | os três rostos que a câmera fotografa |
| 7 | `cover-raio-x-da-maquina.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**Os itens 5 e 6 nasceram com os desafios de peça** (§7½ do planejamento). Eles
são os objetos que a criança manipula nos mini-jogos: o arquivo que cai no baú, a
coisa aberta na memória, o desenho que a tela revela, o rosto que a câmera
enquadra. Hoje o jogo roda com retângulos coloridos no lugar deles — jogável,
mas é justamente aí que a arte muda tudo, porque **o desafio é sobre o que a
peça FAZ com aquele objeto**.

**O #1 é o jogo inteiro.** Se duas peças de categorias diferentes se parecerem a
66 px, a criança erra por desenho e não por conteúdo — e o jogo passa a medir a
vista dela.

**O #3 e o #4 podem esperar.** Sem a Lia, o pedido sai de uma cápsula com cabeça
redonda; sem o fundo, a oficina é um degradê escuro com uma faixa de bancada. O
nível 1 é avaliado assim, antes de existir arte.

**Antes de gerar o #3:** confira se já existe uma Lia utilizável em
`src/assets/games/`. A arte anterior a 17/09/2026 está em outra linha de traço e
**não serve** — se a que existir for antiga, gere esta.

### O que é `Graphics`, e por quê

- **a tela do raio-X** — fundo azul-escuro, linhas de varredura, moldura, e a
  faixa de luz que desce quando a máquina entra;
- **a baia** — retângulo com borda que muda de cor a cada estado: parada,
  tocada, certa, errada, marcada, pulsando;
- **o brilho ciano atrás da peça**, que acende quando a baia acende;
- **o carimbo** e a letra dele, **o visto** do nível 3, **a plaquinha âmbar**;
- **a placa do pedido**, o balão, o botão LIBERAR, o cadeado;
- **as três luzinhas de progresso** em cima da máquina;
- **cabeçalho, vidas, bolinhas de fase, estrelas, `?`, moldura e confete.**

> **Nenhuma letra em PNG nenhum.** O nome da peça muda de estado (aparece só no
> acerto, e no nível 2 aparece errado de propósito); letra pintada no desenho
> vira lixo por baixo do texto de verdade.

---

## 1. As quatro regras que governam esta arte

> **1. A silhueta separa as categorias a 66 px.**

É o tamanho real da peça no celular. Tape a cor com o polegar: ainda tem que dar
para dizer que aquilo é um chip e não um pente. Os pares que precisam ser
inconfundíveis:

| Par | O que os separa |
|---|---|
| **pente (memória) × disco (armazenamento)** | pente é **comprido e baixo, com dentinhos embaixo**; disco é **quadrado e gordo, com um círculo dentro** |
| **teclado (entrada) × tela (saída)** | teclado é **baixo, todo picotado de teclas**; tela é **alta, com uma face lisa e um pé** |
| **chip (processador) × cartão (armazenamento)** | chip é **quadrado com perninhas nos quatro lados**; cartão é **retângulo liso com um canto cortado** |
| **cooler (nenhuma) × disco** | cooler é **redondo com pás**; disco é retangular |

> **2. Cada categoria tem uma cor de acento, e ela é lei.**

O código não vai tingir nada — a cor tem de vir no desenho. É o segundo canal de
leitura, depois da silhueta, e é o que faz o álbum do fim de nível se organizar
sozinho aos olhos:

| Categoria | Cor de acento | As peças |
|---|---|---|
| entrada | **azul** | teclado, mouse, microfone, câmera |
| processador | **laranja** | chip |
| memória | **roxo** | pente |
| armazenamento | **verde** | disco, pendrive, cartão |
| saída | **ciano claro** | tela, alto-falante, impressora |
| nenhuma | **cinza-amarelado apagado** | cooler, fonte, cabo |

**Os três intrusos são os únicos sem cor viva.** Eles precisam parecer parte da
máquina e ainda assim não chamar — é o que torna justo o fato de nunca serem
resposta.

> **3. As peças são fofas, e elas falam.**

Cada peça diz uma frase em primeira pessoa quando a criança erra nela (*"Eu
esqueço tudo quando desliga"*). Então todas têm **olhos grandes e uma boquinha**,
com expressão simpática e neutra. Nada de cara brava, triste ou de dedo em riste:
a peça está explicando o que ela faz, não dando bronca.

> **4. Nada de cabo solto, sombra no chão ou pedaço de placa-mãe grudado.**

Cada peça está **sozinha**, recortada, sem fio saindo, sem base e sem sombra —
menos o `cabo`, que é a peça-intruso e aí o fio é o desenho. O fundo é desenhado
em código; PNG com chão próprio cria uma emenda visível.

---

## 2. `pecas.png` — as quinze peças

### Contrato da folha

- **1280 × 768**, grade **5 colunas × 3 linhas** de **256 × 256**, alfa real.
- **A ordem dos quadros é o índice do frame, e é contrato com `data/pecas.ts`:**

| # | Peça | Categoria | Cor |
|---:|---|---|---|
| 0 | teclado | entrada | azul |
| 1 | mouse | entrada | azul |
| 2 | microfone | entrada | azul |
| 3 | câmera | entrada | azul |
| 4 | chip | processador | laranja |
| 5 | pente de memória | memória | roxo |
| 6 | disco (HD) | armazenamento | verde |
| 7 | pendrive | armazenamento | verde |
| 8 | cartão de memória | armazenamento | verde |
| 9 | tela | saída | ciano |
| 10 | alto-falante | saída | ciano |
| 11 | impressora | saída | ciano |
| 12 | cooler | nenhuma | cinza |
| 13 | fonte | nenhuma | cinza |
| 14 | cabo | nenhuma | cinza |

- **Todas na mesma escala e na mesma luz.** A peça maior (a tela) ocupa ~90 % da
  célula; a menor (o cartão) ocupa ~55 %. Isso é de propósito: tamanho relativo é
  informação, e normalizar tudo apaga.
- Vista **de frente, levemente de três quartos**, sem perspectiva forte.
- Depois de gerar, **meça a caixa alfa de cada quadro** (o script de
  `PLANEJAMENTO MODAL.md` §7) e ancore o layout por ela, com **uma escala só para
  a folha inteira**, tirada da maior altura medida.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
images: do NOT copy their characters, their clothes, their poses, their scenes
or their framing.

Sprite sheet, 5 columns by 3 rows, 256x256 px per cell, same lighting and the
same scale in every cell, transparent background, no grid lines drawn, no cell
borders, no ground shadow.

Fifteen cute chibi computer parts, each one alone and centred in its own cell,
each with big friendly eyes and a small smiling mouth, each isolated with
nothing attached to it — no wires trailing off, no socket, no board underneath.
Read the cells left to right, top row first:

Row 1 — cell 1: a small flat KEYBOARD, wide and low, its top face covered in
tiny square keys, accent colour blue. Cell 2: a rounded MOUSE, egg shaped seen
from above with a split down the middle and a little wheel, accent colour blue.
Cell 3: a chunky desk MICROPHONE, a rounded capsule head on a short stubby
stand, accent colour blue. Cell 4: a small WEBCAM, a ball with a big round lens
on a short clip foot, accent colour blue. Cell 5: a PROCESSOR CHIP, a thick
square tile with a printed square pattern on top and short metal legs sticking
out of all four sides, accent colour orange.

Row 2 — cell 6: a MEMORY STICK, a long low narrow rectangular board lying
horizontally, a row of small black blocks along its top and a row of little gold
teeth along its bottom edge, accent colour purple. Cell 7: a HARD DRIVE, a thick
chunky square metal box with a round disc shape visible on its top face, accent
colour green. Cell 8: a USB FLASH DRIVE, a small stubby body with a metal
connector at one end, accent colour green. Cell 9: a MEMORY CARD, a small thin
flat rectangle with one corner cut off at an angle, accent colour green. Cell
10: a MONITOR, a tall screen with a smooth bright face on a short neck and a
flat foot, accent colour light cyan.

Row 3 — cell 11: a SPEAKER, a box with one big round cone and one small round
cone on its front, accent colour light cyan. Cell 12: a small PRINTER, a wide
box with a sheet of blank paper coming out of a slot on top, accent colour light
cyan. Cell 13: a COOLING FAN, a square frame with a round hub and four wide
curved blades, accent colour muted grey with a faint warm tint. Cell 14: a POWER
SUPPLY, a plain metal box with a round plug socket on its front, accent colour
muted grey with a faint warm tint. Cell 15: a CABLE, a short coiled wire with a
plug at each end, accent colour muted grey with a faint warm tint.

The first twelve parts have clear saturated accent colours. The last three —
fan, power supply, cable — are deliberately dull and greyish so they do not
compete. Every silhouette must stay recognisable when the cell is shrunk to
66 px wide: keep shapes bold and simple, keep the keyboard low and the monitor
tall, keep the memory stick long and thin and the hard drive square and thick.

DO NOT INCLUDE: X-ray look, radiograph, greyscale silhouettes, glass or
transparent bodies, glowing outlines, neon rim light, circuit board under the
parts, motherboard, wires trailing out of the parts, cables plugged into
anything, ground shadow, pedestal, table, angry faces, sad faces, crying,
text, letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, stars, HUD, question mark button, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, western cartoon style, rough sketchy
lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur,
lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders,
gaps, cropped edges, drop shadow on the cell, white backing in transparent
assets.
~~~

### Conferência

- [ ] 15 quadros, na ordem da tabela, nenhum quadro vazio;
- [ ] pente **comprido e baixo**, disco **quadrado e gordo** — os dois lado a lado
      não se confundem a 66 px;
- [ ] teclado baixo, tela alta;
- [ ] chip com perninhas nos quatro lados;
- [ ] as quatro entradas são azuis, as três saídas são ciano, os três de guardar
      são verdes;
- [ ] cooler, fonte e cabo apagados, sem cor viva;
- [ ] todas com olhos e boquinha simpática, nenhuma brava;
- [ ] nenhum fio saindo, exceto no cabo;
- [ ] alfa real, sem borda de célula, sem letra.

---

## 3. `maquina.png` — o computador da fase

### Contrato

- **512 × 256**, grade **2 × 1** de **256 × 256**, alfa real.
- **Quadro 0 — apagada.** É como a máquina entra: tela escura, luzinhas
  apagadas, expressão de sono.
- **Quadro 1 — ligada.** É o prêmio da fase: tela acesa, olhos abertos e
  sorrindo. **Os dois quadros têm exatamente o mesmo contorno e a mesma posição**
  — só mudam a cara e a luz. Se a silhueta mudar, a troca vira um pulo.
- Ela aparece a **84 × 39 px reais**, pequena. A diferença entre apagada e ligada
  tem de se ler nesse tamanho: não basta o olho, a **tela toda** muda de valor.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
images: do NOT copy their characters, their clothes, their poses, their scenes
or their framing.

Sprite sheet, 2 columns by 1 row, 256x256 px per cell, same lighting and the
same scale in both cells, transparent background, no grid lines drawn, no cell
borders, no ground shadow.

The SAME cute chibi all-in-one desktop computer in both cells: a friendly boxy
monitor with a wide screen face, sitting on a small flat foot, with a row of
three tiny round lamps along its bottom edge. Its accent colour is a warm
yellow. The outline, the size and the position must be IDENTICAL in both cells —
only the face and the light change.

Cell 1 — OFF: the screen face is dark and flat, the three little lamps are dull
and unlit, the eyes are closed in a sleepy curve, the mouth is a small calm
line.

Cell 2 — ON: the screen face is bright and pale, the three little lamps glow
warm, the eyes are wide open and glossy with a highlight, the mouth is a happy
open smile, and two tiny sparkles float near the top corners.

The difference between the two cells must read at 84 px wide: the whole screen
face changes from dark to bright, not only the eyes.

DO NOT INCLUDE: a separate keyboard, a separate mouse, cables, power cord, desk,
table, wall, ground shadow, open case, visible internal parts, X-ray look,
greyscale silhouette, different pose between the two cells, different size
between the two cells, angry face, sad face, crying, text, letters, words,
labels, digits, numbers, captions, watermark, logo, title lettering, user
interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD,
question mark button, painterly lineless illustration, soft airbrushed
gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven
brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps,
cropped edges, drop shadow on the cell, white backing in transparent assets.
~~~

### Conferência

- [ ] os dois quadros com o mesmo contorno, no mesmo lugar da célula;
- [ ] apagada × ligada se lê a 84 px, pela tela e não só pelos olhos;
- [ ] as três luzinhas existem no desenho e não são o `Graphics` (o `Graphics`
      só acende um halo em cima delas);
- [ ] sem teclado, sem mouse, sem fio, sem mesa.

---

## 4. `lia.png` — a técnica da oficina

### Contrato

- **768 × 256**, grade **3 × 1** de **256 × 256**, alfa real.
- **Busto, cabeça e ombros**, virada para a direita — ela olha para o pedido e
  para a tela do raio-X, que estão à direita dela.
- Três estados, e eles são o tom da fala:

| # | Estado | Quando aparece |
|---:|---|---|
| 0 | **neutra atenta** | enquanto o pedido está na tela |
| 1 | **alegre** | acerto, e a máquina ligando |
| 2 | **pensativa** | a TRAVA: mão no queixo, sem cara de bronca |

- O quadro 2 é o que mais erra: pensativa **não é** decepcionada. A criança
  acabou de errar, e a técnica está pensando junto com ela.
- Ela aparece a **45 × 39 px reais**. Só a expressão precisa se ler; o uniforme
  não.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
images: do NOT copy their characters, their clothes, their poses, their scenes
or their framing.

Sprite sheet, 3 columns by 1 row, 256x256 px per cell, the same character at the
same scale and lighting in every cell, transparent background, no grid lines
drawn, no cell borders, no ground shadow. Head and shoulders only, centred,
turned slightly to the RIGHT in all three cells.

The same young repair technician in all three cells: a cheerful chibi girl with
warm brown skin, short dark curly hair held back by a headband, and a pair of
safety goggles pushed up on her forehead. She wears a simple work apron over a
plain shirt; the apron is the accent colour, a warm teal.

Cell 1 — NEUTRAL AND ATTENTIVE: calm friendly face, eyes open and looking
slightly right, small closed smile.

Cell 2 — DELIGHTED: eyes bright and curved with joy, wide open smile, one hand
raised near her shoulder with a thumbs up, two tiny sparkles beside her head.

Cell 3 — THINKING: one hand resting under her chin, eyes looking up and to the
side, mouth a small thoughtful line, one tiny question-mark-free thought curl
above her head. She is curious and patient, NOT disappointed and NOT scolding.

DO NOT INCLUDE: full body, legs, hands holding tools, a machine, a desk, a
workbench, a wall, ground shadow, a different character between cells, a
different hairstyle between cells, disappointed face, frowning, scolding,
pointing a finger at the viewer, crossed arms, sad face, crying, angry face,
text, letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, stars, HUD, question mark button, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, western cartoon style, rough sketchy
lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur,
lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders,
gaps, cropped edges, drop shadow on the cell, white backing in transparent
assets.
~~~

### Conferência

- [ ] a mesma menina nos três quadros, mesmo cabelo, mesmo avental;
- [ ] virada para a direita nos três;
- [ ] o quadro 2 é pensativa, não decepcionada;
- [ ] a expressão se lê a 45 px;
- [ ] busto só, sem mãos segurando ferramenta, sem bancada.

---

## 5. `bg-oficina.png` — a oficina

### Contrato

- **1672 × 941**, imagem única, opaca, 16:9.
- **O meio e a faixa de baixo têm de ficar livres e escuros.** A tela do raio-X
  ocupa de `y=244` a `y=706` na grade de 720 — ou seja, **os dois terços de baixo
  da imagem**. O que estiver ali vai receber um véu de 0,46 e um `blur` fraco, e
  ainda assim qualquer desenho detalhado brigaria com as baias.
- A ação do cenário fica **na faixa de cima**, que é justamente onde o cabeçalho
  e a placa do pedido vão por cima — então ela também precisa ser calma.
- É **cena inteira**: sai o `keyline` branco, entram `crisp shapes`.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; a short palette — one strong accent colour over
near-white and dark neutrals; crisp shapes, no painterly brushwork. NO white
sticker keyline here — this is a full scene, not a sticker. Take ONLY the art
style from the attached images: do NOT copy their characters, their clothes,
their poses, their scenes or their framing.

Wide background illustration, 16:9, no characters anywhere, calm low-contrast
areas where game elements will sit.

A cosy little computer repair workshop at night, seen straight on. The room is
dark and deep blue-teal overall, lit by a few small warm lamps. Along the TOP
third: a back wall with open wooden shelves holding neatly stacked boxes and
spare parts, a couple of small hanging lamps, and a soft glow. The MIDDLE and
BOTTOM two thirds are an almost empty dark workbench surface and dark floor —
broad, flat, uncluttered, very low contrast, with nothing but a faint rim of
light along the bench edge and a gentle vignette in the corners.

The bottom two thirds must stay visually quiet and dark: no objects, no tools,
no clutter, no bright patches there. A dark teal panel will be drawn on top of
that area by the game.

DO NOT INCLUDE: people, characters, hands, computers in the centre, monitors,
screens, any object in the lower two thirds, tools on the bench, scattered
parts on the bench, bright light in the centre, strong pattern on the floor,
white sticker keyline, text, letters, words, labels, digits, numbers, captions,
watermark, logo, title lettering, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, HUD, question mark button, painterly
lineless illustration, soft airbrushed gradients, heavy rendering, western
cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D
render, photorealistic, blur, lens flare, heavy noise, grid lines, cropped
edges.
~~~

### Conferência

- [ ] os dois terços de baixo estão escuros, lisos e vazios;
- [ ] nenhum personagem;
- [ ] nenhuma tela acesa competindo com a tela do raio-X;
- [ ] sem contorno branco de adesivo em volta da cena.

---

## 5½. `coisas.png` — o que o computador manipula

### Contrato da folha

- **1024 × 256**, grade **4 colunas × 1 linha** de **256 × 256**, alfa real.
- **A ordem dos quadros é contrato com `scenes/trials/stage.ts`:**

| # | Objeto | Cor de acento | Onde aparece |
|---:|---|---|---|
| 0 | **desenho** (um desenho de criança numa folha) | verde | o arquivo que cai no baú do disco · **o desenho que a tela revela** |
| 1 | **foto** (uma foto impressa, com moldura branca) | laranja | o que a memória segura · o que o pendrive copia |
| 2 | **música** (uma nota musical num quadradinho) | roxo | o que a memória segura |
| 3 | **texto** (uma folha escrita, com linhas, sem letras de verdade) | azul | o que a memória segura · o que o pendrive copia |

- **O quadro 0 é o mais importante e tem uso duplo.** Ele aparece pequeno (104 px)
  como arquivo e **grande (276 px) dentro do monitor**, revelado faixa por faixa.
  Então ele tem de ser uma **cena legível**: um desenho de criança com céu, sol,
  uma árvore e uma casinha — e não um ícone abstrato. Descoberto em três faixas
  horizontais, cada faixa precisa mostrar alguma coisa.
- Os quatro são objetos, **não têm rosto** — as peças é que são personagens. Aqui
  a graça é o objeto ser fofo e reconhecível, nada mais.
- Vista de frente, sem perspectiva, todos na mesma escala.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; big glossy highlights; tiny cartoon emotion marks
(small sparkles); a short palette — one strong accent colour over near-white and
dark neutrals; a thin white sticker keyline around the whole silhouette. Take
ONLY the art style from the attached images: do NOT copy their characters, their
clothes, their poses, their scenes or their framing.

Sprite sheet, 4 columns by 1 row, 256x256 px per cell, same lighting and the
same scale in every cell, transparent background, no grid lines drawn, no cell
borders, no ground shadow.

Four cute objects that a computer handles, each one alone and centred in its own
cell, each seen straight on with no perspective. These are OBJECTS, not
characters: none of them has eyes or a face.

Cell 1: a CHILD'S DRAWING on a square sheet of paper, seen flat from the front,
filling the cell. The drawing shows a simple bright scene: blue sky across the
top with a yellow sun in the upper left, a green grassy ground across the
bottom, one round green tree with a brown trunk on the right, and a small house
with a triangular roof on the left. Crayon-simple shapes, cheerful, clearly
drawn by a kid. The paper has a soft white border. Accent colour green.

Cell 2: a PRINTED PHOTO, a square instant photo with a thick white border, the
picture inside showing a simple warm orange sunset over a dark hill. Accent
colour orange.

Cell 3: a MUSIC FILE, a rounded square tile in purple with one big white musical
note centred on it, and two tiny sparkles at a corner. Accent colour purple.

Cell 4: a TEXT DOCUMENT, a white sheet of paper with a folded top-right corner
and five evenly spaced horizontal blue ruled lines standing in for writing —
lines only, absolutely no readable letters. Accent colour blue.

Every object must stay recognisable when the cell is shrunk to 30 px wide: bold
simple silhouettes, strong single accent colour each, high contrast against a
dark background.

DO NOT INCLUDE: faces, eyes, mouths, characters, hands, readable writing,
handwriting, signatures, cropped objects, objects touching the cell edges,
ground shadow, table, desk, X-ray look, greyscale, text, letters, words, labels,
digits, numbers, captions, watermark, logo, title lettering, user interface,
buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, question
mark button, painterly lineless illustration, soft airbrushed gradients, heavy
rendering, western cartoon style, rough sketchy lines, uneven brush outlines,
muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, grid
lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, drop
shadow on the cell, white backing in transparent assets.
~~~

### Conferência

- [ ] 4 quadros na ordem: desenho, foto, música, texto;
- [ ] o quadro 0 é uma **cena**, e cada terço horizontal dele tem conteúdo;
- [ ] nenhum deles tem rosto;
- [ ] nenhuma letra de verdade no documento;
- [ ] cada um se reconhece a 30 px de largura;
- [ ] alfa real, sem borda de célula.

---

## 5¾. `rostos.png` — quem a câmera fotografa

### Contrato da folha

- **768 × 256**, grade **3 colunas × 1 linha** de **256 × 256**, alfa real.
- **Três crianças diferentes**, busto, **de frente**, posando para a foto e
  sorrindo. É o desafio da câmera: o rosto passeia pelo visor e a criança aperta
  o botão quando ele entra na moldura.
- Elas aparecem a **190 px** na grade, **57 px reais** no celular — então o que
  precisa se ler é a **silhueta do cabelo e a cor da roupa**, não o detalhe.
- Ninguém olha para o lado, ninguém está de costas: a graça é o rosto estar
  enquadrado.
- Três aparências claramente diferentes entre si (cabelo e tom de pele), porque
  elas se alternam.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little body;
big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks
(small sparkles); a short palette — one strong accent colour over near-white and
dark neutrals; a thin white sticker keyline around the whole silhouette. Take
ONLY the art style from the attached images: do NOT copy their characters, their
clothes, their poses, their scenes or their framing.

Sprite sheet, 3 columns by 1 row, 256x256 px per cell, the same scale and
lighting in every cell, transparent background, no grid lines drawn, no cell
borders, no ground shadow. Head and shoulders only, centred, facing straight
forward in all three cells, each one smiling and posing for a photo.

Cell 1: a girl with dark brown skin and big round curly hair, wearing a coral
red t-shirt, wide happy smile.

Cell 2: a boy with light tan skin and straight black hair with a fringe, wearing
a teal t-shirt and round glasses, cheerful closed-mouth smile.

Cell 3: a child with medium brown skin and short wavy blond hair held by a
yellow headband, wearing a purple t-shirt, open laughing smile.

All three are clearly different from one another at a glance: hair silhouette
and shirt colour are what must read when the cell is shrunk to 57 px wide. Keep
the shoulders inside the cell with a small margin.

DO NOT INCLUDE: full body, arms, hands, legs, looking sideways, turned away,
profile view, back view, sad faces, crying, angry faces, hats covering the face,
masks, a background, a wall, a floor, ground shadow, a photo frame around them,
text, letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, stars, HUD, question mark button, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, western cartoon style, rough sketchy
lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur,
lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders,
gaps, cropped edges, drop shadow on the cell, white backing in transparent
assets.
~~~

### Conferência

- [ ] 3 crianças diferentes, todas de frente e sorrindo;
- [ ] cabelo e cor da camiseta separam as três a 57 px;
- [ ] busto só, ombros dentro da célula;
- [ ] sem fundo, sem moldura, sem sombra;
- [ ] alfa real.

---

## 6. `cover-raio-x-da-maquina.png` — a capa

### Contrato

- **1672 × 941**, imagem única, opaca.
- **A ação tem de se ler em miniatura**, no tamanho de um cartão de catálogo. A
  ação deste jogo é uma: **um computador dentro de um raio-X, e as peças fofas
  aparecendo dentro dele.**
- Cena inteira: sem `keyline`.
- A Lia pode aparecer, pequena e de lado. O computador é o herói.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; a short palette — one
strong accent colour over near-white and dark neutrals; crisp shapes, no
painterly brushwork. NO white sticker keyline here — this is a full scene, not a
sticker. Take ONLY the art style from the attached images: do NOT copy their
characters, their clothes, their poses, their scenes or their framing.

Cover illustration; the main action must read at thumbnail size.

A cute chibi all-in-one desktop computer with a friendly face stands in the
centre, inside a glowing scanner arch, and a bright cyan beam of light sweeps
down across it. Where the beam passes, the computer's body turns see-through and
reveals four cute chibi parts floating inside it, each with big eyes: an orange
square chip, a purple long thin memory stick, a green chunky hard drive box and
a blue little keyboard. The parts are full colour and cheerful, not grey
silhouettes.

At the lower left, small and seen from behind at three-quarters, a young chibi
repair technician girl in a warm teal apron with goggles pushed up on her
forehead watches the scan. The background is a dark blue-teal workshop at night,
quiet and out of the way. Warm lamp glow in the upper corners, cyan glow from
the scanner in the middle.

DO NOT INCLUDE: greyscale X-ray silhouettes, bone imagery, skeleton, hospital,
medical equipment, an open computer case with realistic motherboard, cables,
white sticker keyline, the technician's face, a crowd, text, letters, words,
labels, digits, numbers, captions, watermark, logo, title lettering, user
interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD,
question mark button, painterly lineless illustration, soft airbrushed
gradients, heavy rendering, western cartoon style, rough sketchy lines, uneven
brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, grid lines, cropped edges.
~~~

### Conferência

- [ ] em miniatura dá para ver: computador + feixe + peças dentro;
- [ ] as peças de dentro estão coloridas, não cinzas;
- [ ] nada de imagem médica, osso ou hospital;
- [ ] a técnica é pequena e não rouba o centro.

---

## 7. Depois que a arte chegar

1. **Meça a caixa alfa** de cada quadro de `pecas.png` e de `maquina.png` com o
   script de `PLANEJAMENTO MODAL.md` §7. Guarde `dx`, `dy`, `w`, `h` e a base.
2. **Uma escala só para a folha de peças**, tirada da maior altura medida —
   normalizar cada peça pela própria altura apaga o tamanho relativo, que aqui é
   informação (a tela é grande, o cartão é pequeno).
3. `originX` sai do **centro da caixa alfa**, não do centro da célula, senão a
   peça desliza de lado a cada troca de fase.
4. **`maquina.png` é a exceção:** os dois quadros são o mesmo objeto em dois
   estados, então ancore pela **célula**, não pela caixa alfa — ancorar pelo alfa
   faz a máquina pular quando a tela acende.
5. **Amostre a cor** de cada categoria direto do PNG com `GetPixel` e ponha os
   valores em `data/theme.ts`. A borda da baia, o carimbo e a coluna do álbum têm
   de falar a mesma língua do desenho; cor escolhida à parte nunca casa.
6. Confira as peças **no celular**, a 66 px, com a tela do raio-X por trás. O
   par pente × disco é o teste: se você hesitar, o desenho volta.
