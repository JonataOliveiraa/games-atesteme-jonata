# Achados e Perdidos — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF15CO03/achados-e-perdidos/`

**Três arquivos para jogar, mais a capa do catálogo.**

---

## O estilo: TRAÇO CHAPADO

As três imagens de referência vão anexadas em **TODAS** as gerações:

- [`references/20-traco-chapado-a.jpg`](../../../../references/20-traco-chapado-a.jpg)
- [`references/21-traco-chapado-b.webp`](../../../../references/21-traco-chapado-b.webp)
- [`references/22-traco-chapado-c.jpg`](../../../../references/22-traco-chapado-c.jpg)

É a mesma linha do [Kit do Solucionador](../../EF05CO11/kit-do-solucionador/TEXTURAS.md),
e aqui ela **não é gosto, é requisito da mecânica**:

> Este jogo pergunta `é azul?`. Um bichinho com `cel shading`, degradê de
> ambiente e luz quente de rebote tem **vários** azuis — o azul da luz, o azul
> da sombra, o azul do reflexo. A criança olha e não tem o que responder.
> **Preenchimento 100 % chapado é o que faz a cor virar um fato**, e fato é do
> que a habilidade precisa.

Pelo mesmo motivo o **contorno preto grosso e de espessura uniforme**: o
bichinho é lido a 84 px reais no balcão e a **45 px** no retrato do cartaz, e é
o contorno que segura a figura nesse tamanho.

> **Este NÃO é o chibi de figurinha do
> [`references/ESTILO.md`](../../../../references/ESTILO.md), nem o graphic
> novel do `EF05CO09`/`EF15CO02`.** Misturar dois estilos num jogo só é o jeito
> mais rápido de ele sair com cara de colagem: **traço chapado do primeiro ao
> último arquivo**.

> **Sem keyline branca de adesivo**, nem nos arquivos com alfa. O contorno preto
> grosso já solta a figura do fundo, e uma borda branca por cima suja a linha.

> **O jogo roda inteiro com três PNG.** O balcão, a régua, o cartaz, os campos,
> as cartas, os termos, o risco vermelho do NÃO, as molduras de `E`/`OU`, os
> carimbos `FALSO`/`VERDADEIRO`, o cadeado, os balões, o cabeçalho, as
> bolinhas, as vidas, as estrelas e o confete nascem em `Graphics`. As texturas
> trazem **os bichinhos, a atendente e a praça**.

### Por que o balcão e a régua são `Graphics`

Os dois são **geometria que a regra lê**. O bichinho pousa numa superfície e a
régua ao lado dele é o que torna `é pequeno` julgável (§8 do `PLANEJAMENTO.md`).
Se a superfície vier pintada num PNG de fundo, a arte passa a ter um contrato de
alinhamento para cumprir — e foi exatamente esse contrato que custou duas
rodadas no Mistério do Arquivo Vivo, com a grade que não encaixava no vão da
coruja. Aqui o balcão, a régua e o pé do bichinho saem da **mesma conta**.

Então o `bg-praca.png` é só a praça **atrás** do balcão, e a metade de baixo
dele fica vazia.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `bichos.png` | 1024 × 512 | 4 × 2 de **256** | alfa real | **os oito bichinhos**, um por quadro |
| 2 | `atendente.png` | 1024 × 256 | 4 × 1 de **256** | alfa real | a atendente do balcão, em quatro estados |
| 3 | `bg-praca.png` | 1672 × 941 | imagem única | opaco | a praça atrás do balcão, **com o meio vazio** |
| 4 | `cover-achados-e-perdidos.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**Ordem de geração:** o **1** primeiro, sozinho — sem os bichinhos não existe
fase 1.1, e é ela que se testa antes de tudo. O **3** tira o jogo do degradê de
fundo. O **2** põe cara no balcão. O **4** por último.

A capa também alimenta `public/og/achados-e-perdidos.jpg` — mesma arte,
exportada em JPG para o compartilhamento.

---

## 1. As oito regras que governam esta arte

### 1. A cor é DADO, não decoração

Quatro cores, e só quatro: **azul, verde, vermelho, amarelo**. Cada bichinho tem
**uma** delas, chapada, do focinho à ponta do rabo.

| Cor | Tom | Valor em cinza |
|---|---|---|
| amarelo | amarelo-ouro | o mais claro |
| verde | verde-folha | claro-médio |
| azul | azul-médio | médio-escuro |
| vermelho | vermelho-tijolo | o mais escuro |

**Os quatro valores são diferentes de propósito.** Verde e vermelho são o par
que uma criança daltônica não separa, e a segunda pista não pode ser a palavra
escrita — boa parte do público do 1º ano não lê. Então a pista é o **valor**: em
escala de cinza os quatro continuam distinguíveis, e isso é critério de aceite.

O que os quatro têm em comum é **o peso**: mesma saturação, mesmo brilho de
tinta, nenhum mais berrante que os outros. Um vermelho néon ao lado de um verde
apagado faria a criança achar que vermelho é "mais" alguma coisa.

E por isso **a praça é dessaturada** — ocre, areia, madeira, pedra. Na tela, a
única cor forte é a do bichinho, que é a cor sobre a qual se pergunta.

### 2. O bichinho é de UMA cor só

Sem manchas, sem barriga clara, sem orelha de dois tons, sem estampa, sem
listra, sem gradiente e sem sombra. Corpo, orelhas, patas e rabo na mesma tinta.

Por cima dela existem **três coisas, e só três**: o contorno preto, os olhos e a
boca. Uma barriga creme — que é o reflexo de todo bichinho fofo — já bastaria
para `é azul` virar discussão.

### 3. O acessório é sempre o mesmo, e nunca tem cor de atributo

O **chapéu** é sempre o mesmo chapéu: aba redonda, marrom-madeira, em todos os
que o usam. Os **óculos** são sempre os mesmos: armação preta redonda.

É o conserto nº 5 do `PLANEJAMENTO.md` feito na arte. Com um chapéu vermelho na
cabeça de um bicho azul, `é azul` e `NÃO é vermelho` ficam ambíguos, e nenhuma
regra de código conserta isso depois.

Chapéu e óculos são **termos**, não personalidade: nada de laço, cachecol,
mochila, coleira, flor na orelha ou qualquer outro adereço em quadro nenhum.

### 4. O tamanho NÃO está na arte

Os oito ocupam a célula igual. `grande` e `pequeno` são **escala em código**,
lidos contra a régua desenhada em `Graphics`.

Se um bichinho sair desenhado maior que os outros, as fases 2.2, 2.3 e o nível
3 inteiro passam a mentir — e mentem num jogo cuja única regra é dizer a
verdade. Depois de gerar, **meça a caixa alfa dos oito quadros** e confirme que
a diferença entre o maior e o menor fica abaixo de 3 %.

### 5. Os oito são o MESMO bichinho

Mesma espécie, mesma pose, mesma cara, mesmo tamanho. **A única diferença entre
dois quadros são os atributos**: a cor, o chapéu e os óculos.

Orelha diferente, rabo diferente, cara brava, boca aberta — qualquer diferença a
mais vira um termo que a criança tenta usar e o jogo não tem. O elenco inteiro
é uma tabela de quatro colunas, e a arte é a tabela.

### 6. Nada de chão, sombra ou cenário nos arquivos com alfa

O balcão é `Graphics` e o bichinho pousa nele. PNG com chão próprio cria a
emenda que o
[`PLANEJAMENTO MODAL.md`](../../PLANEJAMENTO%20MODAL.md) §7 chama pelo nome.

### 7. Nada de interface dentro do PNG

Sem carta, sem cartaz, sem campo, sem ✓, sem ✗, sem moldura, sem balão, sem
seta, sem estrela, sem brilho de estado. Tudo isso muda a cada toque e mora no
`Graphics`.

**E nenhum papel pregado em lugar nenhum da praça.** O cartaz do jogo é a única
coisa em forma de cartaz que pode existir na tela.

### 8. A atendente não usa chapéu, não usa óculos, e não veste as quatro cores

Ela divide a tela com o bichinho sobre o qual a criança está respondendo
`tem chapéu?`. Se ela estiver de boné, ou de óculos, ou de macacão azul, a
pergunta ganha dois sujeitos possíveis.

Avental creme, camisa marrom-clara, cabelo escuro, e nada na cabeça nem no
rosto.

**E ela nunca dá bronca.** O erro é uma carta falsa, não uma pessoa errada: o
estado de erro dela é **curiosidade** — cabeça inclinada, mão no queixo —,
nunca dedo em riste, cara fechada ou sobrancelha de raiva.

### A conferência de estilo, que vale para os quatro arquivos

- [ ] contorno **preto, grosso, espessura uniforme** em volta de tudo;
- [ ] preenchimento **100 % chapado** — zero degradê, zero sombra, zero aerógrafo;
- [ ] forma de geometria limpa, silhueta simplificada;
- [ ] olho grande e simples, com linha de cílio preta pesada;
- [ ] **nenhuma letra, nenhum número**, em arquivo nenhum;
- [ ] **nenhuma keyline branca**;
- [ ] nenhum chão, nenhuma sombra e nenhum cenário nos arquivos com alfa;
- [ ] nenhum rosa, magenta, néon ou fluorescente em lugar nenhum.

---

## Os dois blocos que abrem e fecham TODO prompt

Escritos uma vez aqui e repetidos inteiros em cada prompt abaixo, para copiar e
colar sem montar nada por cima.

### Bloco de estilo (começa o prompt)

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: bold black outlines of EVEN, THICK weight
all the way around every shape; 100% FLAT colour fill inside, with NO gradients,
NO cel shading, NO soft shadows, NO airbrushing and NO texture; forms built from
clean geometry — firm straight runs, crisp corners, confident curves —
simplified down to the strongest possible silhouette; big simple eyes drawn with
a heavy black lash line and a flat iris; faces reduced to the minimum, tiny or no
nose, one simple mouth line. Graphic and poster-like, like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes, their poses,
their backgrounds or their subject matter.

PROPORTIONS — NOT from the attached images. The attached images use long adult
bodies with long angular legs; ignore that completely. Everything here is short,
round and friendly, with a big head and a small body, drawn for young children.

PALETTE — IGNORE the attached images' colours entirely. Only four strong colours
exist in this game — golden yellow, leaf green, medium blue and brick red — and
they are used ONLY on the little creatures' bodies. Everything else is warm and
desaturated: cream, sand, ochre, wood brown and stone grey. There is NO pink, NO
magenta, NO neon and NO fluorescent colour anywhere in this project.
~~~

### Bloco negativo (fecha o prompt)

~~~text
DO NOT INCLUDE: pink, hot pink, magenta, fuchsia, neon colours, fluorescent
colours, acid colours, rainbow gradients, glowing outlines, checkerboard
patterns, striped backgrounds, star bursts, sparkles, twinkles, confetti,
halftone dots, long adult legs, high heels, stockings, short dresses, bare
midriff, cleavage, suggestive poses, guns, weapons, angels, demons, horns,
wings, magical girls, anime idol characters, the characters from the attached
images, text, letters, words, labels, digits, numbers, captions, watermark,
logo, title lettering, signature, user interface, buttons, panels, frames,
speech bubbles with text, arrows pointing at things, icons, HUD, brand marks,
gradients, cel shading, soft shadows, airbrushing, painterly lineless
illustration, heavy rendering, rough sketchy lines, uneven brush outlines, thin
hairline outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps,
cropped edges, drop shadow on the cell, white backing in transparent assets,
white sticker keyline, sad faces, crying, angry faces, scolding adults, pointing
at the viewer.
~~~

---

## 2. `bichos.png` — os oito

### Contrato da folha

- **1024 × 512**, grade **4 colunas × 2 linhas** de **256 × 256**, alfa real.
- A ordem dos quadros é o índice do frame, e é **contrato com
  `data/bichos.ts`** — mexer na ordem da folha sem mexer no arquivo troca os
  atributos de todos os cartazes de uma vez, calado:

| # | Nome | Cor | Chapéu | Óculos |
|---:|---|---|:---:|:---:|
| 0 | Bolota | azul | **sim** | não |
| 1 | Tico | azul | não | **sim** |
| 2 | Juju | verde | **sim** | **sim** |
| 3 | Nina | verde | não | não |
| 4 | Pepe | vermelho | não | **sim** |
| 5 | Tati | vermelho | **sim** | não |
| 6 | Mel | amarelo | **sim** | **sim** |
| 7 | Rui | amarelo | não | não |

- **O tamanho não está aqui** (regra 4). Os oito preenchem **de 88 % a 92 %** da
  célula, centrados, com a mesma margem nos quatro lados.
- **Mesmo bichinho nos oito quadros** (regra 5): mesma espécie, mesma pose de
  frente, mesma cara calma e contente, mesma linha de base dos pés.
- Chapéu marrom idêntico nos quatro que o usam; óculos pretos idênticos nos
  quatro que os usam (regra 3).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: bold black outlines of EVEN, THICK weight
all the way around every shape; 100% FLAT colour fill inside, with NO gradients,
NO cel shading, NO soft shadows, NO airbrushing and NO texture; forms built from
clean geometry — firm straight runs, crisp corners, confident curves —
simplified down to the strongest possible silhouette; big simple eyes drawn with
a heavy black lash line and a flat iris; faces reduced to the minimum, tiny or no
nose, one simple mouth line. Graphic and poster-like, like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes, their poses,
their backgrounds or their subject matter.

PROPORTIONS — NOT from the attached images: short, round and friendly, with a
big head and a small body, drawn for young children.

SHEET — Sprite sheet, 4 columns by 2 rows, 256x256 px per cell, transparent
background, no grid lines drawn, no cell borders, no ground shadow, every cell
with the SAME outline thickness.

THE SAME little creature appears in ALL EIGHT cells: a small round fluffy
critter seen from the front, standing on two short legs, with two round ears, a
short round tail, a calm happy face, big simple eyes and one small smile line.
Same species, same pose, same face, same size in every single cell — the feet
rest on exactly the same horizontal line in all eight.

EACH CREATURE IS ONE SINGLE FLAT COLOUR, from nose to tail: body, ears, legs and
tail all in the SAME flat fill, with nothing on top of it except the black
outline, the eyes and the mouth. No belly patch, no lighter chest, no two-tone
ears, no spots, no stripes, no pattern, no shading of any kind.

Only two accessories exist, and they are IDENTICAL every time they appear:
- THE HAT: always the same simple round-brimmed hat in flat WOOD BROWN.
- THE GLASSES: always the same simple round spectacles with a flat BLACK frame.
Neither accessory ever uses yellow, green, blue or red.

Read the cells left to right, top row first:

Row 1 — cell 1: a MEDIUM BLUE creature wearing the brown hat, no glasses.
Cell 2: a MEDIUM BLUE creature wearing the black round glasses, no hat.
Cell 3: a LEAF GREEN creature wearing BOTH the brown hat and the black glasses.
Cell 4: a LEAF GREEN creature with no hat and no glasses.

Row 2 — cell 5: a BRICK RED creature wearing the black round glasses, no hat.
Cell 6: a BRICK RED creature wearing the brown hat, no glasses.
Cell 7: a GOLDEN YELLOW creature wearing BOTH the brown hat and the black
glasses. Cell 8: a GOLDEN YELLOW creature with no hat and no glasses.

The four body colours must stay clearly different from each other even when the
image is converted to greyscale: golden yellow is the lightest, then leaf green,
then medium blue, and brick red is the darkest.

Each creature must FILL ITS CELL, about 90 percent of the 256x256 square,
centred, with only a thin even margin on all four sides. All eight fill their
cells by the SAME amount — none of them may look bigger than another.

DO NOT INCLUDE: creatures of different sizes, size comparisons, big and small
versions, different animal species, different poses, different faces, scarves,
bows, collars, backpacks, flowers, bells, ribbons, any accessory other than the
brown hat and the black glasses, coloured hats, coloured glasses, belly patches,
chest markings, spots, stripes, patterns, two-tone bodies,
pink, hot pink, magenta, fuchsia, neon colours, fluorescent colours, rainbow
gradients, glowing outlines, checkerboard patterns, star bursts, sparkles,
confetti, horns, wings, pointed elf ears, fangs, claws,
text, letters, words, labels, digits, numbers, captions, watermark, logo,
signature, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, HUD, check marks, crosses,
ground, grass, floor, counter, table, scenery, shadow under the feet,
gradients, cel shading, soft shadows, airbrushing, painterly lineless
illustration, heavy rendering, rough sketchy lines, uneven brush outlines, thin
hairline outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps,
cropped edges, drop shadow on the cell, white backing in transparent assets,
white sticker keyline, sad faces, crying, angry faces.
~~~

---

## 3. `atendente.png` — quem atende o balcão

### Contrato da folha

- **1024 × 256**, grade **4 colunas × 1 linha** de **256 × 256**, alfa real.
- Mora no canto esquerdo do balcão, com cerca de **190 px** na grade do jogo.
- **Sem chapéu, sem óculos, e sem nenhuma das quatro cores na roupa** (regra 8).
- Mesma escala e mesma linha de base nos quatro quadros.

| # | Quadro | Quando aparece |
|---:|---|---|
| 0 | **esperando** — de pé, mãos juntas, sorriso pequeno | o estado normal |
| 1 | **apontando** — uma mão estendida para o lado, olhos atentos | quando a dica acende, e depois de duas cartas falsas |
| 2 | **feliz** — olhos em arco, as duas mãos erguidas | a cada campo aceso, e no cartaz completo |
| 3 | **curiosa** — cabeça inclinada, uma mão no queixo | na carta falsa — **nunca bronca** |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: bold black outlines of EVEN, THICK weight
all the way around every shape; 100% FLAT colour fill inside, with NO gradients,
NO cel shading, NO soft shadows, NO airbrushing and NO texture; forms built from
clean geometry — firm straight runs, crisp corners, confident curves —
simplified down to the strongest possible silhouette; big simple eyes drawn with
a heavy black lash line and a flat iris; faces reduced to the minimum, tiny or no
nose, one simple mouth line; hair as big flat masses with sharp points, never
strand-by-strand detail. Graphic and poster-like, like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes, their poses,
their backgrounds or their subject matter.

PROPORTIONS — NOT from the attached images. Short, round and friendly, with a
big head and a small body, drawn for young children.

PALETTE — warm and desaturated only: cream, sand, ochre, wood brown and stone
grey. NO yellow, NO green, NO blue and NO red anywhere on this character.

SHEET — Sprite sheet, 4 columns by 1 row, 256x256 px per cell, the same
character at the same scale and the same lighting in every cell, transparent
background, no grid lines drawn, no cell borders, no ground shadow.

The same character in all four cells: a warm, friendly young LOST-AND-FOUND
CLERK. Short and round, big head, dark hair tied back in a simple shape, a cream
apron over a light brown shirt. NOTHING on the head and NOTHING on the face: no
hat, no cap, no headband, no glasses. The clerk is encouraging and NEVER scolds.

Read the cells left to right:

Cell 1: WAITING, standing front-facing, hands together in front, a small calm
smile. Cell 2: POINTING, standing, ONE arm stretched out to the side and
slightly down, eyes wide and attentive, looking the same way the hand points.
Cell 3: HAPPY, eyes as upward arcs, mouth open in a smile, both hands raised in
a small cheer. Cell 4: CURIOUS, head tilted to one side, one hand resting
against the chin as if thinking, an interested puzzled look — never
disapproving.

In every cell the feet rest on exactly the same horizontal line and the body is
the same size. The clerk holds NOTHING in any cell.

DO NOT INCLUDE: hats, caps, headbands, glasses, spectacles, anything on the head
or face, yellow clothing, green clothing, blue clothing, red clothing, anything
held in the hands, a clipboard, a pen, a notebook, a box, a parcel, a counter, a
desk, furniture,
pink, hot pink, magenta, fuchsia, neon colours, fluorescent colours, rainbow
gradients, glowing outlines, sparkles, confetti, long adult legs, high heels,
short dresses, suggestive poses, horns, wings, pointed elf ears,
text, letters, words, labels, digits, numbers, captions, watermark, logo,
signature, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, HUD,
ground, floor, scenery, shadow under the feet,
gradients, cel shading, soft shadows, airbrushing, painterly lineless
illustration, heavy rendering, rough sketchy lines, uneven brush outlines, thin
hairline outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps,
cropped edges, drop shadow on the cell, white backing in transparent assets,
white sticker keyline, sad faces, crying, angry faces, scolding adults, wagging
finger, pointing at the viewer.
~~~

---

## 4. `bg-praca.png` — a praça

### Contrato do arquivo

- **1672 × 941**, imagem única, **opaca**, sem alfa e **sem keyline**.
- **O meio e a metade de baixo ficam vazios e calmos.** O bichinho, o cartaz e a
  mão de cartas ocupam de `y 100` a `y 700` da grade de 720: nada de barraca,
  poste, árvore ou janela forte atrás deles.
- **Nenhum balcão desenhado** — ele é `Graphics`, e um balcão pintado no fundo
  faria a criança procurar o bichinho no lugar errado.
- **Nenhum papel, cartaz, mural, quadro de avisos ou placa** em lugar nenhum.
  O cartaz do jogo é o único cartaz da tela.
- Paleta dessaturada (regra 1): ocre, areia, pedra e madeira. A cor forte da
  tela é o bichinho.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: bold black outlines of EVEN, THICK weight
all the way around every shape; 100% FLAT colour fill inside, with NO gradients,
NO cel shading, NO soft shadows, NO airbrushing and NO texture; forms built from
clean geometry — firm straight runs, crisp corners, confident curves —
simplified down to the strongest possible silhouette. Graphic and poster-like,
like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes, their poses,
their backgrounds or their subject matter.

PALETTE — warm and DESATURATED: ochre, sand, stone grey and wood brown, under a
pale warm sky. NO strong yellow, green, blue or red anywhere, because the only
strong colour on screen belongs to the game pieces drawn on top.

Wide background illustration, 16:9: a calm, cosy little TOWN SQUARE on a sunny
morning, seen straight on — a low stone wall, simple rounded rooftops far away
at the top, a pale sky, and a plain paved ground.

THE ENTIRE MIDDLE AND LOWER PART OF THE IMAGE MUST BE EMPTY AND CALM: plain
wall and plain paving in soft low-contrast colours, with nothing drawn in them,
because the game pieces sit there. Keep every bit of scenery detail in the top
corners and along the very top edge.

No counter, no desk, no table, no booth and no kiosk of any kind. No paper, no
poster, no notice board, no pinned notes, no signs and no banners anywhere. No
characters, no people and no animals.

DO NOT INCLUDE: counters, desks, tables, booths, kiosks, market stalls, shelves,
boxes, crates, furniture of any kind, posters, papers, notice boards, pinned
notes, signs, banners, flags, bunting, lamp posts, big trees in the centre,
characters, people, animals,
pink, hot pink, magenta, fuchsia, neon colours, fluorescent colours, rainbow
gradients, glowing outlines, sparkles, confetti,
text, letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, signature, user interface, buttons, panels, frames, speech bubbles,
arrows, icons, HUD,
white sticker keyline, sticker border, strong contrast in the centre, busy
patterns, clutter,
gradients, cel shading, soft shadows, airbrushing, painterly lineless
illustration, heavy rendering, rough sketchy lines, uneven brush outlines, thin
hairline outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, cropped edges.
~~~

---

## 5. `cover-achados-e-perdidos.png` — a capa

### Contrato do arquivo

- **1672 × 941**, imagem única, **opaca**, sem keyline.
- **A capa tem de mostrar o gesto do jogo**: uma carta com uma figura sendo
  pendurada num cartaz, ao lado do bichinho de quem ela fala.
- Ela aparece na grade do catálogo **ao lado de dois jogos de lógica**: o
  [Circuito da Verdade](../circuito-da-verdade), que é um parque de diversões
  aceso, e os [Portões Lógicos](../../EF05CO03/portoes-logicos), que são dois
  portões numa trilha. Nada de circuito, lâmpada, portão, trilha ou curral —
  senão os três viram o mesmo bloco na grade.
- Tem de ler a **tamanho de miniatura**: o cartaz à direita, o bichinho à
  esquerda, e uma carta no ar entre os dois.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: bold black outlines of EVEN, THICK weight
all the way around every shape; 100% FLAT colour fill inside, with NO gradients,
NO cel shading, NO soft shadows, NO airbrushing and NO texture; forms built from
clean geometry — firm straight runs, crisp corners, confident curves —
simplified down to the strongest possible silhouette; big simple eyes drawn with
a heavy black lash line and a flat iris. Graphic and poster-like, like clean
vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes, their poses,
their backgrounds or their subject matter.

PROPORTIONS — NOT from the attached images: short, round and friendly, with big
heads and small bodies, drawn for young children.

Cover illustration, 16:9, for a children's logic game about describing a lost
pet truthfully. The main action must read at thumbnail size. The scene is a calm
town square in warm desaturated ochre, sand and stone, so that the only strong
colours are on the creature and on the cards.

On the LEFT, sitting on a simple wooden counter, a small round fluffy MEDIUM
BLUE creature wearing a flat BROWN round-brimmed hat, seen from the front, with
a calm happy face. Beside it stands a simple wooden height ruler.

Behind the counter stands a warm, friendly young LOST-AND-FOUND CLERK with dark
hair tied back and a cream apron, smiling, one hand raised in a small cheer.
Nothing on the clerk's head and no glasses on the clerk's face.

On the RIGHT hangs a simple wooden board with two empty square slots on it. Two
big rounded CARDS float in the air between the creature and the board, as if
being hung: one card shows a flat BLUE PAINT DROP, the other shows the same
flat BROWN HAT. The cards are completely blank apart from those two pictures —
no writing of any kind.

Everything is cheerful, tidy and satisfying.

DO NOT INCLUDE: circuits, wires, light bulbs, lamps, switches, levers, logic
gates, fairground rides, ferris wheels, carousels, roller coasters, gates,
doors, fences, pens, paths, trails, marching creatures,
check marks, crosses, question marks, exclamation marks, mathematical symbols,
text, letters, words, title lettering, labels, digits, numbers, captions,
watermark, website address, signature, logo, user interface, buttons, panels,
speech bubbles, arrows, icons, stars, HUD, progress bars,
several creatures of different sizes, size comparisons, spots, stripes, belly
patches, coloured hats, coloured glasses,
pink, hot pink, magenta, fuchsia, neon colours, fluorescent colours, rainbow
gradients, glowing outlines, sparkles, confetti,
horns, wings, pointed elf ears, weapons, monsters, fantasy creatures,
white sticker keyline, sticker border,
gradients, cel shading, soft shadows, airbrushing, painterly lineless
illustration, heavy rendering, rough sketchy lines, uneven brush outlines, thin
hairline outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, cropped edges, mess, chaos, sad faces, crying, angry faces.
~~~

---

## 6. Depois de gerar

1. **Meça a caixa alfa dos oito quadros** de `bichos.png` com o script do
   [`PLANEJAMENTO MODAL.md`](../../PLANEJAMENTO%20MODAL.md) §7. A diferença
   entre o maior e o menor tem de ficar **abaixo de 3 %** — é a regra 4, e é a
   que faz as fases de tamanho não mentirem. Ancore por `originY = 1`, com
   **uma escala só para a folha inteira**.
2. **Teste em cinza.** Converta `bichos.png` para escala de cinza: os quatro
   tons de corpo têm de continuar distinguíveis, com o amarelo mais claro e o
   vermelho mais escuro. Se verde e vermelho saírem no mesmo cinza, regere —
   é a única pista que a criança daltônica e não alfabetizada tem.
3. **Teste a 45 px.** Reduza um bichinho ao tamanho do retrato do cartaz: o
   chapéu e os óculos ainda têm de ser vistos. Se sumirem, engrosse a armação e
   a aba, nunca a cor.
4. **Confira o acessório repetido.** Recorte os quatro chapéus e sobreponha:
   têm de ser o mesmo desenho e o mesmo marrom. O mesmo para os quatro pares de
   óculos. É a regra 3, e é o conserto nº 5 do `PLANEJAMENTO.md`.
5. **Confira a cor única.** Pegue o conta-gotas em três pontos de um bichinho —
   orelha, barriga e pata. Os três têm de dar **o mesmo valor**.
6. **Se não vier transparência**, peça sobre magenta `#FF00FF` chapado e remova
   a cor. Fundo branco é pior, porque branco é a cor do olho e do dente.
7. Exporte a capa também como `public/og/achados-e-perdidos.jpg`.

---

## 7. Registro

| Data | O que aconteceu |
|---|---|
| 21/09/2026 | Primeira versão, junto com o `PLANEJAMENTO.md`. Estilo **traço chapado** (refs 20-22), escolhido pelo requisito do §topo: preenchimento chapado é o que faz `é azul?` ter uma resposta. Três arquivos e a capa. |
