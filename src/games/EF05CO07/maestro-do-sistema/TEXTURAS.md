# Maestro do Sistema — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO07/maestro-do-sistema/`

**Quatro arquivos para jogar, mais a capa do catálogo.**

> **Este jogo tem estilo próprio, e não usa imagem de referência.** Nada de
> anexar as folhas de figurinha dos outros jogos: aqui o estilo está **escrito
> por extenso dentro de cada prompt**, e é ele que vale. O estilo é **papel
> recortado de cartaz de concerto** — ilustração 2D chapada, feita de camadas de
> papel fosco, com textura de serigrafia. **Não é chibi e não é 3D**, e os dois
> aparecem na lista de negativos de todos os prompts.
>
> Cada prompt abaixo já vem inteiro — estilo, corpo e negativo —, para ser
> copiado e colado sem montar nada por cima.

> **Consequência no código:** papel recortado **não tem contorno**. Quem dá a
> silhueta é a sombra macia que o próprio recorte projeta — e ela vem **pintada
> dentro do PNG**. Por cima disso, o código põe uma sombra de chão sob cada
> programa, um aro em volta da peça em uso e um halo creme atrás de quem travou.

> **O jogo roda inteiro com zero PNG.** Partitura, balões, aro de uso, faixa da
> fila, X de encerrar, moldura, bolinhas de fase e confete nascem em `Graphics`;
> as texturas só trocam os personagens, as peças e o fundo.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `programas.png` | 1024 × 1024 | 4 × 4 de 256 | alfa real | os 4 programas, cada um nos 4 estados |
| 2 | `pecas.png` | 1024 × 256 | 4 × 1 de 256 | alfa real | as quatro peças de hardware do atril |
| 3 | `icones.png` | 768 × 256 | 3 × 1 de 256 | alfa real | a batuta, o guarda-sol das FÉRIAS e a nota quebrada |
| 4 | `bg-palco.png` | 1672 × 941 | imagem única | opaco | o palco da orquestra, **com o meio e a base livres** |
| 5 | `cover-maestro-do-sistema.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**O #1 é o que carrega a mecânica.** Pedindo, tocando, esperando e travado são
os quatro estados do jogo inteiro; se eles não se distinguirem **de relance e de
longe**, não existe fila, não existe travamento e não existe jogo.

**O #4 pode esperar.** Sem o fundo, o palco é degradê quente com uma cortina em
bloco e o assoalho em faixas — e o jogo continua jogável do começo ao fim.

### O que é `Graphics`, e por quê

- **a partitura** de cada programa, e a nota que **acende** a cada compasso;
- **o balão do pedido**, com o pictograma da peça dentro — e é ele que carrega o
  estado do jogo: **cheio e aceso** quer dizer *pode tocar agora*, **vazado e
  acinzentado** quer dizer *está esperando*. É a peça mais importante em
  `Graphics` do jogo inteiro, e ela sai de `canPlayNow`, nunca de lógica do
  desenho;
- **o refletor do palco**, que abre e fecha conforme quantos estão tocando;
- **o showzinho**: a cortina fechando, o acorde final e o confete de papel;
- **o aro de uso** em volta da peça no atril, e o contorno vazio do lugar dela;
- **a faixa ESPERANDO**, com as carinhas em ordem;
- **o X de encerrar**, a moldura da TRAVA e o halo de quem travou;
- **a missão no alto**, o selo do nível, as bolinhas de fase, vidas, estrelas,
  `?` e confete.

> **Nenhuma letra em PNG nenhum.** O nome dos programas e o texto dos balões
> mudam de nível para nível; letra pintada no desenho vira lixo por baixo do
> texto de verdade.

---

## 1. As cinco regras que governam esta arte

> **1. Os quatro estados têm que se ler a 51 px.**

É o tamanho real do programa no celular. A diferença **não pode estar na cara**:
a 51 px ninguém vê um olhinho. **Pedindo** é o corpo esticado para cima, olhando
para o alto; **tocando** é o corpo inclinado para a frente, em movimento;
**esperando** é o corpo murcho, encolhido, um tom mais apagado; **travado** é o
corpo torto, quebrado no meio, cinza. Tape a cara com o polegar — ainda tem que
dar para dizer qual é qual.

> **2. Programa é MÁQUINA, não bicho.**

Nada de orelha, rabo, pelo ou pata. Eles são aparelhinhos de papel: uma
consolinha, um radinho, uma prancheta, uma webcam. Bracinhos e perninhas de
papel são permitidos, e são o que dá a pose — mas o corpo é objeto.

> **3. O palco é luz quente de teatro, não escuro.**

Refletor dourado, cortina bordô, assoalho de madeira. Um palco escuro faz os
programas sumirem e transforma uma brincadeira de orquestra em sala vazia.

> **4. O meio e a base do fundo ficam livres.**

Os programas moram entre `y = 160` e `y = 500` da grade, e o atril ocupa
`y = 568` até embaixo. Cortina, refletores e plateia ficam **no alto e nas
laterais**; o centro é assoalho, e a faixa de baixo é lisa.

> **5. Nenhuma peça vem com programa, e nenhum programa vem com peça.**

A peça voa do atril até o programa, desenhada por cima dele pelo código. Se a
consolinha já vier com um chip na mão, a entrega deixa de significar alguma
coisa — e a mesma peça precisa servir para dois programas diferentes.

---

## 2. Estilo e paleta

### O estilo, por extenso (é ele que vai no prompt, não um anexo)

**Papel recortado de cartaz de concerto.** Ilustração 2D chapada que parece
montada com camadas de papel fosco: cada forma é um recorte separado, de borda
limpa, com uma **sombra macia logo embaixo** que faz as camadas parecerem
empilhadas. A cor é chapada e levemente granulada, como tinta de serigrafia em
papel áspero, com a fibra do papel aparecendo. **Sem contorno, sem traço de
caneta, sem degradê, sem aerógrafo, sem brilho de plástico.** Os personagens são
aparelhinhos construídos com formas geométricas simples — retângulos, círculos,
meias-luas —, em pé, com **proporção de aparelho de verdade**: nada de cabeça
grande em corpo pequeno, nada de olho enorme e brilhante.

**Por que este estilo, e não o dos outros jogos:** papel recortado é feito de
formas grandes e chapadas, e é o que melhor sobrevive a 51 px num celular; e a
textura de serigrafia dá a este jogo uma cara de **cartaz de concerto**, que é
exatamente a promessa do título.

### As cores do jogo

| Uso | Hex |
|---|---|
| papel do fundo / creme | `#f7efe1` |
| cortina bordô | `#8c3b4a` |
| sombra de palco (roxo profundo) | `#3d2b3f` |
| assoalho de madeira | `#c98f52` |
| refletor / dourado do acerto | `#e8b04b` |
| aro de uso (código) | `#3f8f8a` |
| faixa ESPERANDO (código) | `#9a8fa6` |
| TRAVA e travado (código) | `#c2553f` |
| nota apagada (código) | `#cfc3b2` |
| nota acesa (código) | `#e8b04b` |

| Programa | Traço | Cor |
|---|---|---|
| **Joguinho** | consolinha de mão, dois botões redondos, telinha | `#3f8f8a` |
| **Musiquinha** | radinho com antena, mostrador redondo e grade de alto-falante | `#e2725b` |
| **Desenho** | prancheta com um clipe em cima e um pincel na mão | `#7a6bbd` |
| **Chamada de Vídeo** | webcam redonda num tripé de três pernas | `#6aa84f` |

| Peça | Cartão | Silhueta |
|---|---|---|
| **processador** | chip com perninhas | quadrado |
| **alto-falante** | cone com ondas | círculo |
| **tela** | monitor com pezinho | retângulo largo e baixo |
| **memória** | pente com um raio | retângulo alto e estreito |

As três primeiras aparecem já no Nível 1; **a memória só entra no Nível 3**. A
folha vem com as quatro de uma vez — quem decide quais estão no atril é
`data/fases.ts`.

---

## 3. `programas.png` — os quatro programas, nos quatro estados

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1024 × 1024 |
| grade | 4 colunas × 4 linhas; células de 256 × 256 |
| fundo | alfa real |
| índice do quadro | `frame = programa × 4 + estado` — é contrato com o código |
| escala | o mesmo personagem, do mesmo tamanho, nas quatro células da linha |
| direção | de frente, levemente virado para a esquerda (o atril fica embaixo) |

| Linha | Programa | Colunas (estados) |
|---:|---|---|
| 0 | Joguinho | 0 pedindo · 1 tocando · 2 esperando · 3 travado |
| 1 | Musiquinha | idem |
| 2 | Desenho | idem |
| 3 | Chamada de Vídeo | idem |

| Estado | O corpo | A cor |
|---|---|---|
| **pedindo** | esticado para cima, braços erguidos, olhando para o alto | cheia |
| **tocando** | inclinado para a frente, um braço adiantado, em movimento | cheia, com um brilho de papel dourado atrás |
| **esperando** | murcho, encolhido, ombros caídos | um tom mais apagada |
| **travado** | torto, quebrado no meio, uma perna dobrada | cinza, sem cor nenhuma |

### Prompt copiável

~~~text
STYLE — CUT-PAPER CONCERT POSTER. Flat 2D illustration that looks built from
layers of matte construction paper: every shape is a separate paper cut-out with
a clean crisp edge and a soft dark shadow falling just beneath it, so the layers
read as stacked paper. Colours are flat and slightly grainy, like screen-print
ink on rough paper, with visible fine paper fibre. NO outlines, NO line art, NO
ink contour, NO gradients, NO airbrush, NO gloss. Warm concert-hall palette:
cream paper, burgundy, deep plum, stage wood, brass gold, teal, coral, violet
and leaf green. Characters are little machines built from simple geometric paper
shapes — rectangles, circles, half circles — standing upright with the honest
proportions of a real appliance, with tiny dot eyes cut from dark paper and a
small paper mouth. Friendly and calm. Do NOT use chibi or anime proportions, no
big head on a small body, no huge glossy eyes.

Draw ONE sprite sheet on a grid of 4 columns by 4 rows, exactly 1024 by 1024
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no gaps, no grid lines drawn.

Each ROW is one character, the SAME size and the SAME lighting across its four
cells. Each COLUMN is a state, in this order: 1 ASKING, 2 PLAYING, 3 WAITING,
4 FROZEN.

Row 1 — JOGUINHO, a teal handheld game console with a small screen, two round
buttons and a little cross pad, with short paper arms and legs.
Row 2 — MUSIQUINHA, a coral pocket radio with one antenna, a round dial and a
speaker grille, with short paper arms and legs.
Row 3 — DESENHO, a violet drawing clipboard with a paper clip on top, holding a
small brush, with short paper arms and legs.
Row 4 — CHAMADA DE VIDEO, a leaf-green round webcam on a three-legged tripod,
with short paper arms.

The four states, identical in meaning for every row:
ASKING — body stretched tall, both arms raised, looking up, full colour.
PLAYING — body leaning forward in motion, one arm swung ahead, full colour,
with a brass-gold paper burst cut out behind the body.
WAITING — body slumped and squashed down, shoulders low, colour one shade
paler.
FROZEN — body crooked and broken in the middle, one leg bent wrong, all colour
drained to flat grey.

CRITICAL: the four states must be told apart by the SHAPE OF THE BODY alone,
from far away, with the face covered — never only by the eyes.
CRITICAL: nothing else in the image — no hardware pieces, no chips, no screens
held in the hands, no chairs, no floor, no music notes, no speech bubbles.

DO NOT INCLUDE: chips, cards, screens, speakers, memory sticks, chairs, stands,
floor, stage, background, music notes, speech bubbles, text, letters, numbers,
logos, watermark, grid lines, cell borders, gaps, animal ears, tails, fur,
paws, chibi, anime, manga, big head small body, huge glossy eyes, kawaii
sticker, white sticker keyline, cel shading, line art, outlines, ink contour,
gradients, airbrush, gloss, bevel, 3D render, CGI, plastic look,
photorealistic, blur, digital noise, muddy colours.
~~~

### Conferência

- [ ] 1024 × 1024, células de 256 batendo, sem borda desenhada;
- [ ] é o mesmo personagem nas quatro células da linha, do mesmo tamanho;
- [ ] com a cara tapada, os quatro estados ainda se distinguem;
- [ ] a 170 px de altura na grade (51 px reais) dá para dizer quem está travado;
- [ ] nenhuma peça de hardware na mão de ninguém;
- [ ] nenhum contorno de caneta, nenhum degradê, nenhum brilho de plástico.

---

## 4. `pecas.png` — o hardware que se reveza

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1024 × 256 |
| grade | 4 colunas × 1 linha; células de 256 × 256 |
| fundo | alfa real |
| índice do quadro | `0 cpu · 1 speaker · 2 screen · 3 memory` — é contrato com o código |
| escala | cabem na mesma célula, mas **não têm o mesmo formato** |

| Quadro | Peça | Silhueta obrigatória |
|---:|---|---|
| 0 | processador | **quadrado**, chip com perninhas nos quatro lados |
| 1 | alto-falante | **círculo**, cone com duas ondinhas saindo |
| 2 | tela | **retângulo largo e baixo**, monitor com pezinho |
| 3 | memória | **retângulo alto e estreito**, pente com um raio |

A silhueta é o contrato mais importante desta folha: a 54 px reais o pictograma
some, e o que a criança reconhece é o **formato**.

### Prompt copiável

~~~text
STYLE — CUT-PAPER CONCERT POSTER. Flat 2D illustration that looks built from
layers of matte construction paper: every shape is a separate paper cut-out with
a clean crisp edge and a soft dark shadow falling just beneath it. Colours are
flat and slightly grainy, like screen-print ink on rough paper, with visible
fine paper fibre. NO outlines, NO line art, NO ink contour, NO gradients, NO
airbrush, NO gloss. Warm concert-hall palette: cream paper, burgundy, deep plum,
brass gold and teal. Simple geometric paper shapes only. Do NOT use chibi or
anime styling.

Draw ONE sprite sheet on a grid of 4 columns by 1 row, exactly 1024 by 256
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no gaps, no grid lines drawn.

Four computer hardware parts, each as a flat paper cut-out object, each with a
DIFFERENT overall outline shape so they can be told apart as silhouettes:

Cell 1 — a PROCESSOR CHIP: a teal SQUARE with small legs on all four sides and a
simple cream spiral cut into the middle.
Cell 2 — a LOUDSPEAKER: a coral CIRCLE, a speaker cone seen from the front, with
two small curved sound waves cut from cream paper on one side.
Cell 3 — a SCREEN: a deep-plum WIDE LOW RECTANGLE, a small monitor with a little
foot, its display a flat cream rectangle.
Cell 4 — a MEMORY STICK: a violet TALL NARROW RECTANGLE, a memory board standing
upright with small gold contacts along the bottom and a cream lightning bolt cut
into the middle.

CRITICAL: the four outline shapes must be square, circle, wide rectangle and
tall rectangle — unmistakable from each other at thumbnail size.
CRITICAL: no hands, no characters, no table, no floor, nothing holding them.

DO NOT INCLUDE: hands, arms, characters, robots, faces, tables, shelves, floor,
stage, background, cables, plugs, sparks, text, letters, numbers, logos,
watermark, grid lines, cell borders, gaps, chibi, anime, manga, kawaii, white
sticker keyline, cel shading, line art, outlines, ink contour, gradients,
airbrush, gloss, bevel, 3D render, CGI, plastic look, photorealistic, blur,
digital noise, muddy colours.
~~~

### Conferência

- [ ] 1024 × 256, células de 256 batendo;
- [ ] as quatro silhuetas são quadrado, círculo, retângulo largo e retângulo alto;
- [ ] reduzidas a 54 px de largura, ainda se distinguem sem o pictograma;
- [ ] nenhuma mão, nenhum personagem, nenhuma mesa;
- [ ] a sombra de papel está colada na peça e não encosta na borda da célula.

---

## 5. `icones.png` — a batuta, as férias e a nota quebrada

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 768 × 256 |
| grade | 3 colunas × 1 linha; células de 256 × 256 |
| fundo | alfa real |
| índice do quadro | `0 batuta · 1 guarda-sol · 2 nota quebrada` |

| Quadro | O que é | Onde o jogo usa |
|---:|---|---|
| 0 | a **batuta** do maestro, na diagonal, ponta para cima e à direita | faz o arco do atril até o programa a cada entrega, e o cutucão da dica |
| 1 | um **guarda-sol de praia** listrado, fechado num tripé | o botão FÉRIAS DO MAESTRO |
| 2 | uma **nota musical quebrada** ao meio, cinza | sai de cima de quem travou |

### Prompt copiável

~~~text
STYLE — CUT-PAPER CONCERT POSTER. Flat 2D illustration that looks built from
layers of matte construction paper: every shape is a separate paper cut-out with
a clean crisp edge and a soft dark shadow falling just beneath it. Colours are
flat and slightly grainy, like screen-print ink on rough paper, with visible
fine paper fibre. NO outlines, NO line art, NO ink contour, NO gradients, NO
airbrush, NO gloss. Warm concert-hall palette: cream paper, burgundy, deep plum,
stage wood, brass gold and teal. Do NOT use chibi or anime styling.

Draw ONE sprite sheet on a grid of 3 columns by 1 row, exactly 768 by 256
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no gaps, no grid lines drawn.

Cell 1 — a CONDUCTOR'S BATON lying on a diagonal, tip pointing up and to the
right: a slim cream paper stick with a small dark wooden handle.
Cell 2 — a closed striped BEACH UMBRELLA in burgundy and cream, leaning on a
small wooden pole, a tiny paper sun cut out behind it.
Cell 3 — a MUSIC NOTE SNAPPED IN HALF, flat grey paper, the two broken halves
slightly apart with a small jagged paper crack between them.

CRITICAL: each object alone in its cell, centred, nothing else around it.

DO NOT INCLUDE: hands, arms, characters, faces, floor, stage, background, text,
letters, numbers, logos, watermark, grid lines, cell borders, gaps, chibi,
anime, manga, kawaii, white sticker keyline, cel shading, line art, outlines,
ink contour, gradients, airbrush, gloss, bevel, 3D render, CGI, plastic look,
photorealistic, blur, digital noise, muddy colours.
~~~

### Conferência

- [ ] 768 × 256, células de 256 batendo;
- [ ] a batuta se lê na diagonal, e a ponta dá para apontar com ela;
- [ ] o guarda-sol se entende a 48 px reais, dentro do botão;
- [ ] a nota quebrada parece quebrada, e não só torta.

---

## 6. `bg-palco.png` — o palco da orquestra

### Contrato

| Campo | Exigência |
|---|---|
| dimensão | 1672 × 941, opaco |
| enquadramento | plateia atrás, palco de frente, **visto de frente e de leve por cima** |
| o que **não** pode ter | nenhum músico, nenhuma cadeira ocupada, nenhum instrumento, nenhuma letra |
| zona livre | a faixa central entre 20% e 70% da altura, e **toda a faixa de baixo**, a partir de 78% |

A faixa de baixo é do atril, e o centro é onde os programas moram. O fundo tem
que ficar **calmo** nessas duas áreas: cortina, refletores e plateia ficam no
alto e nas laterais.

### Prompt copiável

~~~text
STYLE — CUT-PAPER CONCERT POSTER. Flat 2D illustration that looks built from
layers of matte construction paper: every shape is a separate paper cut-out with
a clean crisp edge and a soft shadow where one layer sits over another. Colours
are flat and slightly grainy, like screen-print ink on rough paper, with visible
fine paper fibre. NO outlines, NO line art, NO ink contour, NO gradients, NO
airbrush, NO gloss. Warm concert-hall palette: cream paper, burgundy curtain,
deep plum shadow, warm wood stage, brass gold light. Do NOT use chibi or anime
styling.

Draw one horizontal background illustration, 1672 by 941 pixels, opaque: the
stage of a small, cosy concert hall, seen from the front and slightly from
above.

Heavy burgundy paper curtains gathered at the top left and top right corners. A
row of warm brass stage lights along the very top, each throwing a soft cut-paper
cone of pale gold. A warm wooden stage floor made of flat paper planks filling
the middle and lower part of the image. A hint of a dark plum audience area far
behind, suggested only as flat paper shapes.

CRITICAL: the CENTRE of the image and the WHOLE BOTTOM STRIP must stay calm and
almost empty — plain wooden floor — because characters and a music stand are
drawn on top of them by the game.
CRITICAL: NO musicians, NO people, NO chairs with anyone on them, NO instruments,
NO music stands, NO text of any kind.

DO NOT INCLUDE: musicians, people, faces, animals, instruments, violins, pianos,
music stands, sheet music, chairs in the centre, text, letters, numbers, logos,
watermark, user interface, buttons, dark horror mood, black shadows, cluttered
composition, chibi, anime, manga, kawaii, cel shading, line art, outlines, ink
contour, gradients, airbrush, gloss, bevel, 3D render, CGI, plastic look,
photorealistic, blur, digital noise, muddy colours.
~~~

### Conferência

- [ ] 1672 × 941, opaco;
- [ ] o centro e a faixa de baixo estão quase vazios;
- [ ] nenhum músico, nenhum instrumento, nenhuma letra;
- [ ] um programa violeta e um teal, colados por cima do assoalho, continuam se
      destacando;
- [ ] não é escuro: dá para ver o palco inteiro sem apertar os olhos.

---

## 7. `cover-maestro-do-sistema.png` — a capa

### Contrato

| Campo | Exigência |
|---|---|
| dimensão | 1672 × 941, opaco |
| o que precisa ler em miniatura | **os aparelhinhos no palco e a batuta apontando para um deles** |

### Prompt copiável

~~~text
STYLE — CUT-PAPER CONCERT POSTER. Flat 2D illustration that looks built from
layers of matte construction paper: every shape is a separate paper cut-out with
a clean crisp edge and a soft shadow just beneath it. Colours are flat and
slightly grainy, like screen-print ink on rough paper, with visible fine paper
fibre. NO outlines, NO line art, NO ink contour, NO gradients, NO airbrush, NO
gloss. Warm concert-hall palette: cream paper, burgundy curtain, deep plum, warm
wood stage, brass gold, teal, coral and violet. Characters are little machines
built from simple geometric paper shapes, standing upright with the honest
proportions of a real appliance, with tiny dot eyes cut from dark paper. Do NOT
use chibi or anime proportions, no big head on a small body, no huge glossy
eyes.

Draw a horizontal cover illustration, 1672 by 941 pixels, opaque, for a
children's educational game about how an operating system shares the computer's
hardware between programs.

Three little machine characters stand on a warm wooden stage under burgundy
paper curtains and brass stage lights: a teal handheld game console, a coral
pocket radio and a violet drawing clipboard, each with short paper arms and
legs. The radio is leaning forward, playing, with a brass-gold paper burst
behind it. The console holds both arms up, asking. The clipboard waits, slumped
a little to one side. In the foreground, at the bottom, a cream conductor's
baton points up toward the console, and beside it a low music stand holds three
flat paper hardware cards: a teal square chip, a coral circle speaker and a
plum wide rectangle screen.

CRITICAL: what must read at thumbnail size is the LITTLE MACHINES ON A STAGE and
the BATON pointing at one of them — the whole idea of the game in one glance.
CRITICAL: warm, playful and calm; no crowd, no clutter.

DO NOT INCLUDE: text, letters, numbers, title lettering, logos, watermark, user
interface, buttons, progress bars, human hands, human people, animals,
instruments, violins, pianos, dark horror mood, black shadows, cluttered
composition, chibi, anime, manga, kawaii, white sticker keyline, cel shading,
line art, outlines, ink contour, gradients, airbrush, gloss, bevel, 3D render,
CGI, plastic look, photorealistic, blur, digital noise, muddy colours.
~~~

### Conferência

- [ ] em 200 px de largura ainda se veem os três aparelhinhos e a batuta;
- [ ] nenhuma letra, nenhum número;
- [ ] os personagens parecem os mesmos da folha 1, e as peças, os mesmos da 2;
- [ ] serve de origem para `public/og/maestro-do-sistema.jpg` (1200 × 630,
      recorte central, até 300 KB).

---

## 8. Depois que a arte chegar

**Meça o sprite, não chute.** Meça a caixa alfa de cada quadro e guarde o
resultado em `data/cast.ts`, em fração da célula:

- o **programa** é ancorado pela base dos pés, para os quatro estados pisarem na
  mesma linha do assoalho;
- o estado **travado** é torto de propósito: ancore pela base, não pelo centro,
  senão ele "pula" ao travar;
- o estado **esperando** é mais baixo que os outros de propósito, e é o assoalho
  que tem de ficar fixo;
- a **peça** é ancorada pelo centro, porque ela voa de um lado ao outro da tela;
- se um arquivo for trocado, **as caixas são medidas de novo**.

Depois da medição:

- [ ] os quatro estados do mesmo programa pisam na mesma linha;
- [ ] a peça voando do atril até o programa passa por cima de tudo, sem sumir
      atrás da faixa da fila;
- [ ] a folha aparece na lista `WANTED` do `BootScene`, carregada por
      `import.meta.glob`, e nenhum `import` estático aponta para arte;
- [ ] tirando os PNGs da pasta, o jogo continua abrindo e jogável com o
      placeholder de `Graphics`;
- [ ] a capa não é carregada dentro da partida (o `BootScene` ignora `cover-`).

### Placeholder, enquanto não existir PNG

- programa = retângulo arredondado na cor dele, com dois olhinhos e uma boca — e
  o corpo muda de altura e de inclinação por estado;
- peça = cartão com o pictograma em `Graphics`, nos quatro formatos do §4;
- batuta = risco creme na diagonal; guarda-sol = triângulo listrado; nota
  quebrada = duas metades de bolinha com um risco no meio;
- palco = degradê quente com uma cortina em bloco e o assoalho em faixas.
