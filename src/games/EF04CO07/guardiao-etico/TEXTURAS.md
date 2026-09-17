# Guardião Ético — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF04CO07/guardiao-etico/`

**Cinco arquivos para jogar, mais a capa do catálogo.**

> **Revisão 2 (16/09/2026).** A lista da revisão 1 tinha cinco arquivos e incluía
> uma folha de nove destinos. Com o destino virando o **nível** — e não o pedido
> — os nove viraram três placas desenhadas em `Graphics`, e a folha saiu.

> **A lupa continua funcionando sem arte nenhuma.** Ela nasceu em `Graphics` —
> aro, cabo, vidro e brilho — e o `lupa.png` (§7) só troca esse desenho. O que
> NUNCA vem de PNG é o aumento: ele é o papel de verdade, por dentro do vidro.
> Também são `Graphics` o papel, as tarjas, os anéis, o cartão do achado, os
> botões da bancada, o carimbo e o selo.

> **Os cinco chegaram (16/09/2026), e as grades bateram.** Só a `lupa.png` veio
> com outro tamanho — 800 × 800 no lugar de 512 — e isso não atrapalhou nada,
> porque o jogo se guia pelo **buraco do vidro medido**, não pelo tamanho do
> arquivo: centro em 0,4025 × 0,3956 e raio 0,3019 da largura, guardados em
> `data/art.ts`. O vidro veio vazado de verdade: 179 371 pixels transparentes
> cercados por desenho. A **capa** chegou depois, também 1672 × 941, e já está
> na ficha do catálogo. **A arte deste jogo está completa.**

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `bg-mesa.png` ✔ | 1672 × 941 | imagem única | opaco | a mesa do guardião, com o mural da escola ao fundo |
| 2 | `colegas.png` ✔ | 1152 × 864 | 4 × 3 de 288 | alfa real | os quatro colegas, cada um em três estados |
| 3 | `acervo.png` ✔ | 1024 × 1024 | 2 × 2 de 512 | alfa real | as fotos e o desenho que ficam **colados** nos papéis |
| 4 | `ferramentas.png` ✔ | 512 × 512 | 2 × 2 de 256 | alfa real | os ícones da bancada: lupa, marcador, borracha, carimbo |
| 5 | `lupa.png` ✔ | **800 × 800** | imagem única | **alfa real, vidro vazado** | a lupa grande, a que a criança arrasta |
| 6 | `cover-guardiao-etico.png` ✔ | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**O #2 é o que carrega a mecânica**: é a cara de quem é dono que diz, debaixo da
lupa, se aquilo pode sair ou não. O **#4 é o que mais ajuda a criança a entender
o que fazer**, porque é o ícone da ferramenta escolhida. O **#3 e o #5 podem
esperar**: sem eles a foto vira um retângulo com moldura e a lupa continua sendo
a desenhada pelo código.

### O que é `Graphics`, e por quê

- **a lupa** — vidro, aro, cabo, reflexo e o aumento (máscara circular sobre uma
  cópia do papel em escala 1,9);
- **o papel e todo o texto dele**, porque o texto precisa ser texto de verdade:
  é ele que fica ilegível a 18 px e legível debaixo da lente;
- **as tarjas, os anéis e o cartão do achado**, que entram e saem a cada toque;
- **o carimbo, o selo, a placa do destino, o balão, o bilhete, o cadeado, o
  mural, o `?`, o cabeçalho, as vidas, as bolinhas, as estrelas, o confete e a
  moldura da tela**.

> **Nenhuma letra em nenhum PNG.** Aqui isso é mais grave que nos outros jogos: a
> lupa aumentaria uma letra **borrada** em vez de aumentar uma letra. Onde um
> desenho precisar parecer escrito, use **linhas cinzas onduladas**.

---

## 1. As três regras que governam esta arte

> **1. As fotos não têm gente pintada dentro.**

O parque e a quadra do #3 chegam **vazios**. As crianças que aparecem nas fotos
coladas nos papéis são desenhadas pelo jogo, com os sprites do #2 — porque o
rosto de alguém é um **item achável**, com caixa e posição conhecidas. Uma
criança pintada no PNG seria um rosto que o jogo não sabe onde está, e a lupa
passaria por cima dele sem achar nada.

> **2. A cara é a mecânica.**

Nos três estados, o que muda é grande: ombros, braços, cabeça. O colega aparece
na coluna da direita a **164 px** (49 px reais) — diferença que só existe na
sobrancelha não existe a esse tamanho.

> **3. A mesa é de trabalho, e é acolhedora.**

Mesa de guardião do mural: madeira clara, um pote de lápis, fita crepe, o mural
de cortiça na parede ao fundo. Nada de escritório, nada de tela de computador,
nada de cara de repartição.

---

## 2. Estilo e paleta

### A referência é uma imagem, e ela vai anexada em TODOS os prompts

O estilo deste jogo não é descrito só por palavras: ele é a imagem de referência
**"Elementary — Class of '26"**, que deve ser **anexada junto com o texto em cada
uma das gerações**. Guarde-a em `references/` (junto das outras do
projeto, fora de `src/`, para não entrar no bundle) — por exemplo
`references/13-elementary.png` — e anexe sempre a mesma.

Do que se trata, em palavras, para o caso de o gerador ignorar o anexo:

- **traço de graphic novel infantil**: contorno preto firme, de espessura
  variável — grosso na silhueta, fino dentro da figura;
- **cor chapada com sombreado de desenho animado**: duas ou três faixas de
  sombra, degradê suave dentro da área chapada, sem pintura realista;
- **paleta quente e saturada**, com vermelho, laranja e verde-água puxando o
  olho, e fundos mais lavados que as figuras;
- **rostos muito expressivos**, olhos grandes e arredondados, sobrancelha que
  conta a emoção sozinha;
- **formas encorpadas e arredondadas**, anatomia simplificada, mãos gordinhas;
- **textura leve de papel** por baixo, e o fundo com um padrão discreto de
  caderno, bem apagado.

> **Da referência se tira o TRAÇO, nunca o elenco.** A imagem tem dragão, elfa e
> criatura alada, e o nosso elenco é de **crianças brasileiras comuns**: nada de
> asa, orelha pontuda, chifre, cauda, focinho ou pele colorida. Também não se
> copia a composição de capa, o letreiro nem o enquadramento dela.

### Linha de estilo — cole em todos os prompts

~~~text
STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight (heavier on the silhouette, lighter inside), flat colour with clean
cel-shaded steps and soft gradients, warm saturated palette, very expressive
faces with large rounded eyes, chunky rounded shapes and simplified anatomy, a
faint paper grain. Take ONLY the drawing style from the reference: do NOT copy
its characters, its creatures, its cover layout, its lettering or its subject.
All characters here are ordinary human Brazilian schoolchildren — no wings, no
pointed ears, no horns, no tails, no animal or fantasy features.
~~~

### As cores do jogo

Visual: **jogo 2D infantil polido**, formas arredondadas, áreas chapadas amplas,
contorno firme, leitura fácil em celular. Luz quente vinda de cima à esquerda.

| Uso | Hex |
|---|---|
| contorno | `#2a2233` |
| parede | `#dfe6ee` |
| madeira da mesa | `#a97a4f` |
| frente da mesa | `#8a5f3c` |
| cortiça do mural | `#c9a06a` |
| papel (código) | `#fffaf0` |
| tarja (código) | `#2a2233` |
| achado e TRAVA (código) | `#e59a52` |
| acerto (código) | `#4eaa78` |
| foco (código) | `#4b8fe0` |

### Negativo comum a todos os arquivos

~~~text
text, letters, words, labels, digits, numbers, captions, signature, watermark,
logo, brand, user interface, app window, browser, toolbar, app icons,
computer screen with interface, cursor, mouse pointer, emoji, speech bubble,
red X mark, green check mark, warning sign,
angry face pointing at the viewer, crying child, scolding adult,
dragons, elves, griffins, wings, pointed ears, horns, tails, animal features,
fantasy creatures, comic book cover layout, title banner, lettering,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard,
3D render, photorealistic, blur, lens flare, noise, gradient banding.
~~~

**Nenhuma lupa no fundo, nos colegas ou no acervo.** A lupa do jogo é uma só, e
uma segunda pintada no cenário confundiria a criança sobre qual delas se move —
por isso `magnifying glass, lens, loupe` entra no negativo desses três arquivos.
Nos §6 e §7, ao contrário, a lupa é justamente o assunto.

Se o gerador não entregar transparência real, peça sobre magenta `#FF00FF` e
remova a cor.

---

## 3. `bg-mesa.png` — a mesa do guardião

### Contrato

| Campo | Exigência |
|---|---|
| tamanho | 1672 × 941, paisagem, borda a borda |
| fundo | opaco |
| **área do papel** | x 8 %–68 %, y 10 %–84 %: **tampo de mesa liso**, onde a folha é desenhada |
| **coluna da direita** | x 70 %–100 %, y 10 %–92 %: parede e um canto de mesa calmos |
| o mural | no alto à direita ou ao fundo, de cortiça, **vazio** |
| clima | cantinho de trabalho de escola: pote de lápis, rolo de fita crepe, uma plantinha |

Dois terços da imagem são "lugar onde o jogo desenha".

> **A regra da emenda:** o papel é `Graphics` deitado sobre a mesa que é PNG. Por
> isso o tampo tem de ser **liso, de tom uniforme e sem sombra pintada no meio** —
> a sombra da folha é desenhada pelo jogo, e duas sombras diferentes na mesma
> madeira é a primeira coisa que o olho acha.

### Prompt copiável

~~~text
STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight, flat colour with clean cel-shaded steps and soft gradients, warm
saturated palette, chunky rounded shapes, a faint paper grain. Take ONLY the
drawing style: do NOT copy its characters, creatures, cover layout or lettering.

A cosy school noticeboard-keeper's desk, seen from above at a slight angle, as a
background for a children's game. Exactly 1672 by 941 pixels, landscape, fully
opaque. Warm wooden desktop #a97a4f filling most of the frame, calm light
blue-grey wall #dfe6ee behind it, warm light from the upper left.

THE MAIN AREA MUST STAY EMPTY: from x=8% to x=68% and y=10% to y=84% the desktop
must be plain, flat, evenly lit wood — no papers, no objects, no painted shadows,
no highlights in the middle. The game draws a sheet of paper there.

Keep the RIGHT COLUMN, x=70% to 100%, calm as well: a little wall and a clean
corner of the desk, where a character will stand.

Around the edges, and only there: a cup with pencils, a roll of masking tape, a
small potted plant, and on the wall an EMPTY cork noticeboard with two round pins
and nothing pinned to it.

Dark ink outline #2a2233 on the major shapes, warm ambient light, friendly and
calm. Readable when scaled down to a 390-pixel-wide mobile display.

Negative: papers on the desk, notes, documents, clutter, painted shadows on the
desktop, magnifying glass, lens, loupe, computer, screen, interface, text, letters, numbers,
logo, HUD, grid, 3D, photorealism, blur, watermark.
~~~

### Conferência

- [ ] a área central do tampo está **vazia e de tom uniforme**;
- [ ] não há nenhuma lupa pintada;
- [ ] o mural de cortiça está vazio;
- [ ] a coluna da direita está calma;
- [ ] lê-se "mesa de trabalho de escola" em dois segundos.

---

## 4. `colegas.png` — quem traz, e quem é dono

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1152 × 864 |
| grade | 4 colunas × 3 linhas; células de 288 × 288 |
| fundo | alfa real |
| enquadramento | **meio corpo**, da cintura para cima, centrado, mesma escala nas 12 células |
| direção | virados ligeiramente para a **esquerda**, na direção do papel |

| Coluna | Personagem |
|---:|---|
| 1 | **Téo**, menino de 9 anos, cabelo escuro curto, camiseta listrada |
| 2 | **Bia**, menina de 10 anos, cabelo cacheado preso, jardineira |
| 3 | **Rafa**, menino de 10 anos, óculos, cabelo crespo, camiseta lisa verde |
| 4 | **Duda**, menina de 9 anos, tranças, camiseta com um dinossauro |

| Linha | Estado | O que o corpo faz | Onde o jogo usa |
|---:|---|---|---|
| 1 | **calmo** | de pé, mãos juntas, esperando, sorriso leve | quem trouxe o papel, o tempo todo |
| 2 | **contente** | acena com uma das mãos, sorriso grande | o autor quando a lupa acha a assinatura dele; e o acerto |
| 3 | **encolhido** | ombros para dentro, **mãos cobrindo metade do rosto**, corpo menor, olhar para baixo | o dono, no cartão do achado, quando aquele dado não pode sair |

Três exigências que decidem se a folha serve:

1. **As três células de uma coluna são a MESMA pessoa**: mesma roupa, mesma
   altura de cabeça, mesma distância da cintura à base. O jogo troca o quadro no
   mesmo lugar.
2. **A linha 3 se lê pela silhueta.** Tape o rosto com o polegar: ainda dá para
   dizer que aquela pessoa está se encolhendo. Ela aparece quando o papel volta
   sem carimbo, e é a linha que volta a valer muito nos níveis 2 e 3, quando o
   dono do dado estiver na própria foto.
3. **Ninguém acusa ninguém.** O dono se protege, e é só. Nada de dedo apontado,
   nada de choro, nada de cara de bravo para quem joga — este jogo não dá bronca
   em criança.

**Falta um quinto rosto, e ele não está aqui:** o "estranho", a criança de outra
turma que aparece no fundo de uma foto. Ele é desenhado em `Graphics`, de costas
e sem traço de rosto, exatamente porque **não é ninguém que a criança conheça** —
e é isso que o torna um dado que não pode ser publicado.

### Prompt copiável

~~~text
STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight, flat colour with clean cel-shaded steps, warm saturated palette, very
expressive faces with large rounded eyes, chunky rounded shapes and simplified
anatomy. Take ONLY the drawing style: do NOT copy its characters or creatures.
These are ordinary HUMAN Brazilian schoolchildren — no wings, no pointed ears,
no horns, no tails, no animal or fantasy features of any kind.

Create ONE character sprite sheet on a grid of 4 columns by 3 rows, exactly 1152
by 864 pixels, each cell exactly 288 by 288, TRUE transparent PNG background, no
cell borders and no gaps. Four friendly Brazilian children, each drawn THREE
times down their own column, from the waist up, centred in the cell, all at the
SAME scale, all turned slightly towards the LEFT.

Column 1 — Téo, a cheerful 9-year-old boy, short dark hair, striped t-shirt.
Column 2 — Bia, a 10-year-old girl, curly hair tied up, denim dungarees.
Column 3 — Rafa, a 10-year-old boy with glasses and short curly hair, plain green
t-shirt.
Column 4 — Duda, a 9-year-old girl with braids, t-shirt with a small dinosaur.

Row 1 (CALM) — standing, hands together, waiting politely, soft smile.
Row 2 (HAPPY) — waving with one hand, big warm smile, proud.
Row 3 (SHRINKING BACK) — shoulders pulled in, BOTH HANDS COVERING HALF OF THE
FACE, body noticeably smaller and lower in the cell, eyes down, uncomfortable but
not crying.

CRITICAL: within each column all three drawings are the SAME child at the SAME
scale, same clothes, same head size, waist at the SAME height in the cell — only
pose and expression change. Row 3 must be recognisable from the SILHOUETTE alone
at very small size.

Rounded friendly proportions, dark ink outline #2a2233, soft upper-left light,
warm and kind. Nobody holds anything, nobody points at the viewer, nobody scolds,
nobody cries.

Negative: wings, pointed ears, horns, tails, animal features, fantasy creatures,
pointing fingers, angry faces towards the viewer, tears, crying,
scolding, held objects, papers, phones, speech bubbles, emoji, text, letters,
numbers, logos on clothes, shadows painted on the ground, cell borders, grid, 3D,
photorealism, blur, watermark.
~~~

### Conferência

- [ ] as três células de cada coluna são inequivocamente a mesma criança;
- [ ] a cintura está na mesma altura nas 12 células;
- [ ] a linha 3 se distingue **de silhueta**, com o rosto tapado pelo polegar;
- [ ] ninguém aponta, ninguém chora, ninguém repreende;
- [ ] a 27 px (o retrato no cartão, no celular) ainda dá para dizer quem está
      se protegendo.

---

## 5. `acervo.png` — o que fica colado nos papéis

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1024 × 1024 |
| grade | 2 colunas × 2 linhas; células de 512 × 512 |
| fundo | alfa real |
| estilo | ilustração cheia, sem moldura, sem legenda |

| Célula | Imagem | Onde é usada |
|---:|---|---|
| 1 | **o parque do passeio**: gramado, árvores, um lago ao fundo, um banco — **e nenhuma pessoa** | a foto colada no papel 1.3 e no 3.3 |
| 2 | **a quadra de queimada**: piso de quadra, linhas do chão, uma bola parada, alambrado — **e nenhuma pessoa** | a foto do papel 1.2 |
| 3 | **o dragão do Rafa**: desenho de criança de 10 anos, giz de cera, dragão verde sorrindo | o desenho colado nos papéis 2.2 e 3.1 |
| 4 | **a mesa da festa junina**: bolo, quentão, milho, bandeirinhas | o papel 1.1 e reserva |

Duas exigências:

1. **As células 1 e 2 não têm gente.** As crianças que aparecem nessas fotos são
   sprites que o jogo posiciona — inclusive **o rosto que é um item achável**. Uma
   criança pintada no PNG viraria um rosto que a lupa nunca acha.
2. **A célula 3 tem de parecer feita por uma criança**, não por um ilustrador:
   traço trêmulo, cor saindo da linha. É ela que faz a autoria do Rafa ser
   acreditável — e a assinatura, que é o item que não se pode tapar, é escrita
   pelo jogo no cantinho, em texto de verdade.

### Prompt copiável

~~~text
STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight, flat colour with clean cel-shaded steps, warm saturated palette, chunky
rounded shapes. Take ONLY the drawing style: do NOT copy its characters,
creatures, cover layout or lettering. Cell 3 is the one exception below.

Create ONE sprite sheet on a grid of 2 columns by 2 rows, exactly 1024 by 1024
pixels, each cell exactly 512 by 512, TRUE transparent PNG background, no cell
borders and no gaps. Four illustrations, each centred and filling most of its
cell:

Cell 1 — a sunny park: green lawn, two or three round leafy trees, a small lake
in the background, one park bench. ABSOLUTELY NO PEOPLE, no children, no adults,
no animals — completely empty.

Cell 2 — an outdoor school ball court: flat court floor with painted line
markings, a simple fence behind, one ball resting on the ground. ABSOLUTELY NO
PEOPLE — completely empty.

Cell 3 — a CHILD'S OWN DRAWING of a friendly green dragon, as if drawn with wax
crayons by a ten-year-old: wobbly outlines, colour going outside the lines,
simple shapes, cheerful. No signature, no writing anywhere.

Cell 4 — a Brazilian June-festival table: a cake, a jug of hot spiced drink, corn
cobs, small triangular bunting flags above.

Cells 1, 2 and 4 follow the reference style above, with dark ink outline
#2a2233 and soft upper-left light. Cell 3 IGNORES the reference style on purpose
and is drawn in a naive child's crayon style, clearly different from the others.

Negative: people, children, figures, faces, animals, signatures, text, letters,
numbers, captions, frames, picture borders, photo corners, drop shadows on the
cell, grid, visible cell borders, 3D, photorealism, blur, watermark.
~~~

### Conferência

- [ ] as células 1 e 2 estão **vazias de gente**, sem exceção;
- [ ] o dragão parece desenho de criança, e não tem nenhuma assinatura pintada;
- [ ] as quatro se leem dentro de uma área de ~200 × 140 px do papel;
- [ ] transparência de verdade, sem borda branca em volta.

---

## 6. `ferramentas.png` — os ícones da bancada

A bancada tem três botões — **LUPA**, **MARCADOR** e **BORRACHA** — e a
ferramenta escolhida é o que o toque no papel FAZ. O botão inteiro (painel,
relevo, estado aceso e apagado) é `Graphics`; o que vem da arte é **só o ícone
dentro dele**, que aparece a 84 × 84 px na grade (25 px reais no celular).

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 512 × 512 |
| grade | 2 colunas × 2 linhas; células de 256 × 256 |
| fundo | alfa real |
| enquadramento | cada objeto **centrado e inteiro** na célula, com margem transparente |
| leitura | reconhecível a 25 px: silhueta clara, nada de detalhe fino |

| Célula | Ícone | Exigência |
|---:|---|---|
| 1 · linha 1 | **lupa** | de lado, vidro para cima à esquerda e cabo de madeira para baixo à direita — **a mesma lupa do jogo, em miniatura** |
| 2 · linha 1 | **marcador** | caneta marca-texto grossa, de ponta chanfrada, inclinada, com tampa; a ponta é escura |
| 1 · linha 2 | **borracha** | borracha de escola chanfrada, clara com uma faixa azul, inclinada, com farelinhos soltos |
| 2 · linha 2 | **carimbo** | carimbo de madeira de cabo redondo, visto de lado, com a almofada embaixo |

> **O carimbo é reserva.** O botão CARIMBAR é desenhado pelo código; a célula
> custa zero porque está na mesma folha, e serve se um dia ele virar arte.

### Prompt copiável

~~~text
STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight, flat colour with clean cel-shaded steps, warm saturated palette, chunky
rounded shapes. Take ONLY the drawing style: do NOT copy its characters,
creatures, cover layout or lettering.

Create ONE icon sprite sheet on a grid of 2 columns by 2 rows, exactly 512 by
512 pixels, each cell exactly 256 by 256, TRUE transparent PNG background, no
cell borders and no gaps. Four chunky school-desk objects, each centred in its
cell with a small transparent margin, each drawn at a slight three-quarter
angle, all lit from the upper left:

Cell 1 (top left) — a classic MAGNIFYING GLASS seen from the side: a round lens
with pale blue-white glass, a thick dark metal rim, and a warm wooden handle
pointing to the lower right.

Cell 2 (top right) — a fat HIGHLIGHTER MARKER pen, tilted, with a chisel tip
pointing to the lower left, a coloured barrel and a small cap ring; the tip is
dark, as if it draws a black bar.

Cell 3 (bottom left) — a chunky school ERASER, tilted, pale cream with a blue
band across it, softly rounded corners, three tiny eraser crumbs beside it.

Cell 4 (bottom right) — a wooden RUBBER STAMP seen from the side: a round wooden
knob handle on top, a wider base, and a dark ink pad surface underneath.

Each object must read clearly at 25 pixels wide: bold silhouette, few internal
details, strong contrast against transparency.

Negative: text, letters, numbers, labels, brand names, hands holding the
objects, backgrounds, panels, buttons, frames around the objects, drop shadows
on the cell, grid, visible cell borders, 3D, photorealism, blur, watermark.
~~~

### Conferência

- [ ] os quatro se leem a 25 px de largura;
- [ ] a lupa do ícone é a mesma lupa do jogo (vidro claro, aro escuro, cabo de madeira);
- [ ] nenhum deles tem mão segurando, nem fundo, nem moldura;
- [ ] transparência de verdade.

---

## 7. `lupa.png` — a lupa que a criança arrasta

A lupa é o gesto principal do jogo. Ela já existe desenhada em `Graphics` e
continua funcionando assim; esta arte **substitui só o aro, o cabo e o brilho** —
o aumento continua sendo o papel de verdade, desenhado por dentro do vidro.

> **Esta é a exigência que decide tudo: o miolo do vidro é VAZADO.** Se o vidro
> vier pintado, mesmo que claro, ele tapa o que a lupa aumenta e o jogo perde a
> mecânica. Alfa zero no centro.

### Contrato

| Campo | Exigência |
|---|---|
| canvas | 512 × 512 |
| fundo | alfa real |
| **o vidro** | círculo **completamente transparente**, centrado em 42 % × 42 % do canvas, com raio de **30 % da largura** |
| o aro | anel escuro com brilho metálico em volta desse círculo, espessura ~5 % da largura |
| o cabo | sai do aro na diagonal para **baixo à direita**, madeira quente, com uma virola de metal na emenda |
| o brilho | um risco branco fino **na borda de dentro do aro**, no canto de cima à esquerda — nunca atravessando o meio do vidro |

Os números de posição são o contrato com o código: o jogo ancora a arte pelo
**centro do vidro**, não pelo centro do PNG. Se vierem diferentes, eles são
medidos e corrigidos em `data/art.ts` — nunca esticando o PNG.

### Prompt copiável

~~~text
STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight, flat colour with clean cel-shaded steps, warm saturated palette, chunky
rounded shapes. Take ONLY the drawing style: do NOT copy its characters,
creatures, cover layout or lettering.

A single big cartoon MAGNIFYING GLASS, exactly 512 by 512 pixels, TRUE
transparent PNG background, seen straight on, tilted so the handle points to the
lower right.

CRITICAL: the inside of the lens must be COMPLETELY EMPTY AND TRANSPARENT — no
glass colour, no tint, no shine across the middle, no reflection, no white fill,
nothing at all. It is a hole. A drawing will be shown through it.

The empty circular hole is centred at 42% across and 42% down the canvas and its
radius is 30% of the canvas width. Around that hole: a thick dark metal ring with
a soft chrome gradient, a darker outline on both edges, and a thin white
highlight arc on the INNER edge of the ring at the upper left only.

The handle leaves the ring diagonally towards the lower right: a short metal
ferrule with two rings, then a warm wooden grip with a rounded end and visible
grain, thick and chunky like a toy.

Friendly, sturdy, toy-like. No hand holding it, no background, no surface, no
shadow cast on anything.

Negative: glass fill, tinted lens, reflections across the lens, shine over the
middle, white circle inside the ring, magnified content drawn inside, hand,
fingers, background, desk, paper, shadow, text, letters, numbers, sparkles,
3D render, photorealism, blur, watermark.
~~~

### Conferência

- [ ] o meio do vidro é **transparente de verdade** (abra num editor e confirme alfa 0);
- [ ] o brilho está na borda de dentro, e não atravessando o vidro;
- [ ] o cabo aponta para baixo à direita;
- [ ] não há mão, mesa, sombra nem fundo;
- [ ] a lupa inteira ainda se lê com o vidro medindo 208 px na grade.

---

## 8. `cover-guardiao-etico.png` — a capa

1672 × 941, opaca, com a mesma imagem de referência anexada e a mesma linha de
estilo do §2 — e é a única das quatro em que a composição pode ser mais de capa,
com a figura maior e a luz mais dramática. A cena: a **mesa de madeira** vista de frente
com um papel grande no meio, uma **lupa** pousada em cima dele aumentando um
pedaço (aqui a lupa **pode** ser desenhada — é capa, não é jogo), o mural de
cortiça ao fundo e o **Téo** no canto direito, esperando com o sorriso de quem
trouxe. Luz quente, clima de "deixa eu conferir".

A capa precisa contar o jogo sem uma palavra: **alguém olhando de perto antes de
publicar.** Se o gerador insistir em escrever no papel, peça o papel com
**linhas onduladas e manchas** no lugar do texto — é assim que as outras capas do
catálogo resolvem.

---

## 9. Depois que a arte chegar

1. **Pôr os quatro arquivos lado a lado com a referência** e conferir que são do
   mesmo mundo: espessura de contorno, número de faixas de sombra e temperatura
   da cor. Se um deles sair mais lavado ou mais duro que os outros, refaça esse —
   arquivo fora de tom estraga o conjunto mais do que arquivo faltando.
2. Medir a **caixa alfa** de cada quadro num canvas e ancorar o layout nela, em
   vez de chutar `setScale`. As dimensões entregues **nunca** batem com as
   pedidas: em outro jogo deste projeto vieram 1480 × 1040 no lugar de
   1024 × 768, e o que salvou foi o jogo se guiar pelos números medidos, guardados
   num `data/art.ts`.
3. Conferir que a **cintura** dos 12 quadros cai na mesma fração da célula; se
   não cair, corrigir com um deslocamento por linha no `data/art.ts`, nunca
   esticando o PNG.
4. Conferir no celular, com a tarja preta: o colega da coluna da direita a
   49 px ainda tem cara; a foto colada no papel ainda se entende a 200 × 140 px
   da grade (60 × 42 reais).
5. Passar a lupa por cima de cada foto colada e confirmar que **o aumento de 1,9 ×
   não borra o PNG** a ponto de parecer defeito. Se borrar, a foto do papel entra
   em resolução maior — nunca o aumento diminui, porque é ele que faz o jogo.
6. **A reserva em `Graphics` fica.** É ela que mantém o jogo de pé quando um
   arquivo falta, e o `import.meta.glob` já prevê isso.
