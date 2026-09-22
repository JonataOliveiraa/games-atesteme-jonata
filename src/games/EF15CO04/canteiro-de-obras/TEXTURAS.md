# Canteiro de Obras — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF15CO04/canteiro-de-obras/`

**Cinco arquivos para jogar, mais a capa do catálogo.**

---

## O estilo: VETOR DE CONTO

A referência é **uma imagem**, escolhida pelo dono do projeto em 22/09/2026, e
ela vai anexada em **TODAS** as gerações:

- [`references/28-vetor-de-conto-a.jpg`](../../../../references/28-vetor-de-conto-a.jpg)

Em uma frase: **vetor de livro infantil — contorno de espessura média que é
sempre um tom mais escuro da própria cor que ele cerca, nunca preto; cel
shading de um tom com um degradê macio por dentro das formas grandes; formas
roliças e paleta terrosa.**

> **O elenco da referência entra no NEGATIVO.** A imagem é um par de elfos, e é
> exatamente o que o gerador vai copiar se ninguém proibir. O que se tira dali é
> **a técnica**: o contorno colorido, o cel shading macio, o olho com íris e
> brilho, a forma roliça. Por isso todo prompt fecha com `elves, pointed elf
> ears, fantasy characters, the two characters from the reference image`.

**Esta é uma linha nova da casa.** Se um segundo jogo adotá-la, ela se muda para
`references/ESTILO-VETOR-DE-CONTO.md`, como já aconteceu com o chibi e com o
vetor geométrico. Enquanto for só este jogo, ela mora aqui.

| | chibi de figurinha (`ESTILO.md`) | desenho de criança (`EF05CO08`) | graphic novel (`EF05CO09`) | traço chapado (`EF15CO03`) | vetor geométrico (`ESTILO-VETOR-GEOMETRICO.md`) | **aqui** |
|---|---|---|---|---|---|---|
| contorno | limpo, espessura uniforme, escuro | trêmulo, irregular | firme, espessura variável, marrom | **preto grosso**, uniforme | **nenhum** | **médio e COLORIDO** — um tom mais escuro do preenchimento |
| sombra | cel shading de um tom | nenhuma | cel shading + degradê de ambiente | **nenhuma**, 100 % chapado | nenhuma | **um tom de sombra + degradê macio por dentro** |
| silhueta | keyline branca de adesivo | o contorno preto | o próprio contorno | o próprio contorno | nada em volta | **o próprio contorno colorido — sem keyline** |
| paleta | acento forte sobre quase-branco | primária de giz | ambiente quente | quatro cores-dado | saturada sobre branco | **terrosa: folha, ardósia, castanho, areia, creme** |

**Sem keyline branca em nenhum arquivo deste jogo**, nem nos que têm alfa.

> **O jogo roda inteiro com zero PNG.** O terreno, os lotes, as linhas
> pontilhadas, a tesoura, o chão de terra, a faixa, o cadeado, a setinha, o
> balão, a mãozinha, o cabeçalho, as vidas, as estrelas, o confete e a poeira
> nascem em `Graphics`. As texturas trazem **as peças, a Tuca e o fundo**.

> **Não existe caixa, ficha, prateleira nem etiqueta neste jogo** (§7 do
> `PLANEJAMENTO.md`). A peça é o desenho, solto no chão de terra, sem moldura e
> **sem o nome escrito embaixo**. Isso põe todo o peso na arte: é o desenho,
> sozinho, que tem de dizer o que a coisa é.

> **O projeto fantasma não tem arquivo.** Ele é a própria peça de
> `pecas-*.png`, desenhada com `alpha 0,35`. É por isso que o §1 proíbe chão,
> base e sombra dentro da célula: o que estiver no PNG vai aparecer duas vezes
> na tela, uma vez como fantasma e outra como peça assentada.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `pecas-praca.png` | 1024 × 768 | 4 × 3 de **256** | alfa real | as 12 peças do projeto **Praça** |
| 2 | `bg-canteiro.png` | 1672 × 941 | imagem única | opaco | o canteiro de obras, **com o meio vazio** |
| 3 | `tuca.png` | 1280 × 320 | 4 × 1 de **320** | alfa real | a mestra de obras, em quatro estados |
| 4 | `pecas-festa.png` | 1024 × 768 | 4 × 3 de **256** | alfa real | as 12 peças do projeto **Festa Junina** |
| 5 | `pecas-horta.png` | 1024 × 768 | 4 × 3 de **256** | alfa real | as 12 peças do projeto **Horta** |
| 6 | `cover-canteiro-de-obras.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**Ordem de geração:** o **1** primeiro, sozinho — sem as peças da praça não
existe fase 1.1, e é ela que se testa antes de tudo. O **2** tira o jogo do
gradiente. O **3** põe gente em cena. O **4** e o **5** são os níveis seguintes.
O **6** por último.

A capa também alimenta `public/og/canteiro-de-obras.jpg` — mesma arte, exportada
em JPG para o compartilhamento.

**A ordem das células é contrato com o código.** O índice do frame sai da
posição da peça no array de `data/levels.ts`, lido da esquerda para a direita e
de cima para baixo — nunca escrito na mão. Mudar uma peça de lugar na folha sem
mudar o array troca o desenho de todas as seguintes.

---

## 1. As seis regras que governam esta arte

### 1. A peça é um OBJETO solto, e nada mais

Nada de chão, grama, calçada, base, pedestal, sombra projetada, moldura ou
fundo dentro da célula. O terreno é `Graphics` e a sombra da peça é desenhada
pelo código, medida na caixa alfa. Um PNG com chão próprio cria uma emenda
visível e aparece duas vezes, porque a mesma arte é reusada como projeto
fantasma.

### 2. A cor NÃO diz de qual obra a peça é

Esta é a regra mais importante do arquivo, e ela é contraintuitiva: seria fácil
pintar tudo do parquinho de vermelho e tudo do jardim de verde. **Não faça.**

O jogo pergunta *"esta peça é desta obra?"*, e a resposta tem de vir de **o que
a coisa é** — um balanço é do parquinho porque é um balanço. Com um código de
cor, a criança acerta tudo sem olhar para o projeto, e o jogo vira pareamento
de cor com tema de obra. O banco do jardim e a arquibancada da quadra são os
dois de madeira; as flores e as bandeirinhas são as duas coloridas. É de
propósito.

O que as doze peças de uma folha **têm** em comum é o peso: mesma saturação,
mesma luz, mesma espessura de contorno. Nenhuma mais berrante que as outras.

### 3. Uma perspectiva só, para as 36 peças

**Três-quartos alto, como um brinquedo em cima da mesa** — nem de frente
chapado, nem de cima. A luz vem **de cima e um pouco da esquerda** em todas as
células, das três folhas. Duas peças com ângulo diferente lado a lado no
chão leem como recorte de revista.

### 4. Tem de se ler a 51 px, e SEM legenda

A peça no chão mede 170 × 170 na grade, **51 px reais** num celular de 390 px, e
o fantasma dentro do pedaço fica ainda menor. **Não há etiqueta com o nome** em
lugar nenhum do jogo: o desenho é a única coisa que diz o que aquilo é.

O que carrega a peça é a **silhueta**: o escorregador é a rampa, o balanço é o
assento pendurado, o regador é o bico. Detalhe fino — parafuso, textura de
madeira, folhinha individual — some a 51 px e só suja a linha.

**O teste, e ele é de aceite:** encolha a folha inteira para 20 % e mostre uma
célula por vez para alguém que não leu este documento. Se a pessoa não disser o
nome da coisa em dois segundos, a célula volta para a fila.

### 5. A peça ocupa a célula

Cada desenho preenche **80 % a 90 %** da altura da célula, centrado, com a base
do objeto perto da borda de baixo. Não é escala de mundo: uma árvore e um
regador ocupam a mesma célula. O jogo desenha as duas no mesmo tamanho na tela,
e uma árvore minúscula no canto da célula apareceria minúscula na tela.

### 6. Nada de texto, nem dentro do desenho

A **plaquinha** da horta e a **placa** da barraca existem como objeto, mas **sem
uma única letra ou número** — rabisco, listra, símbolo. Letra dentro de PNG não
encolhe, não troca de idioma e não se lê a 51 px.

E não há para onde a palavra fugir: **este jogo não tem etiqueta em `Graphics`
nenhuma**. O que a peça não disser em desenho, não será dito.

---

## 2. O bloco de estilo, e o negativo

Os dois vão em **todos** os prompts deste arquivo, com a imagem de referência
anexada. Cada prompt abaixo já vem inteiro — estilo, corpo e negativo —, para
ser copiado e colado sem montar nada por cima.

### Estilo (começa o prompt)

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: friendly storybook vector cartoon; clean line art of even
medium weight, and every outline is a DARKER, slightly more saturated tone of
the colour it surrounds — never black; simple cel shading with ONE soft shadow
tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms
with no sharp corners; a warm earthy palette — leaf green, slate blue, tan,
chestnut brown, terracotta, cream; where there are eyes, they are big and
expressive with a coloured iris and one white highlight. Take ONLY the art
style from the attached image: do NOT copy its characters, their elf ears,
their clothes, their poses, their scene or their framing.
~~~

### Negativo (fecha o prompt)

~~~text
DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters
from the reference image, text, letters, words, labels, digits, numbers,
captions, watermark, logo, title lettering, user interface, buttons, panels,
frames, speech bubbles, arrows, icons, stars, HUD, question mark button,
black outlines, uniform black ink lines, white sticker keyline,
painterly lineless illustration, heavy airbrushed rendering, western cartoon
style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render,
photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet
borders, cell borders, gaps, cropped edges, drop shadow on the cell,
ground shadow, grass, dirt patch or base under the object,
white backing in transparent assets, construction workers, people,
sad faces, crying, angry faces, hard-hat safety signage.
~~~

Se o gerador não entregar transparência, peça sobre magenta `#FF00FF` chapado e
remova a cor. Fundo branco é pior: branco é cor de nuvem, de flor e de linha de
quadra.

---

## 3. `pecas-praca.png` — 1024 × 768, 4 × 3 de 256

As doze peças do projeto **Praça**, na ordem das células:

| # | Célula | A peça | De qual lote |
|---:|---|---|---|
| 0 | linha 1, col 1 | **escorregador** de parquinho, rampa curva | parquinho |
| 1 | linha 1, col 2 | **balanço** de assento único, em estrutura de A | parquinho |
| 2 | linha 1, col 3 | **gira-gira** redondo, com barras | parquinho |
| 3 | linha 1, col 4 | **árvore** pequena de copa redonda | jardim |
| 4 | linha 2, col 1 | **canteiro de flores** baixo, com quatro flores | jardim |
| 5 | linha 2, col 2 | **banco** de praça, de ripas | jardim |
| 6 | linha 2, col 3 | **fonte** redonda de dois pratos, com um fio d'água | fonte |
| 7 | linha 2, col 4 | **par de traves** de futebol, com rede | quadra |
| 8 | linha 3, col 1 | **cesta de basquete** com tabela | quadra |
| 9 | linha 3, col 2 | **arquibancada** de três degraus | quadra |
| 10 | linha 3, col 3 | **trecho de calçada** de bloquetes, retangular | calçada |
| 11 | linha 3, col 4 | **poste de luz** de praça, com luminária redonda | calçada |

**Prompt (copiar inteiro):**

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: friendly storybook vector cartoon; clean line art of even
medium weight, and every outline is a DARKER, slightly more saturated tone of
the colour it surrounds — never black; simple cel shading with ONE soft shadow
tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms
with no sharp corners; a warm earthy palette — leaf green, slate blue, tan,
chestnut brown, terracotta, cream. Take ONLY the art style from the attached
image: do NOT copy its characters, their elf ears, their clothes, their poses,
their scene or their framing.

Sprite sheet, 4 columns by 3 rows, 256x256 px per cell, transparent
background, no grid lines drawn. Twelve separate playground and park objects,
one per cell, in this exact order, left to right and top to bottom:
1 a curved playground slide, 2 a single-seat swing on an A-frame, 3 a round
playground merry-go-round with bars, 4 a small round-topped tree, 5 a low
flower bed with four flowers, 6 a slatted park bench, 7 a small round
two-tier fountain with a thin water jet, 8 a pair of small football goals with
netting, 9 a basketball hoop with backboard, 10 a three-step bleacher,
11 a rectangular patch of paving stones, 12 a park lamp post with a round
lantern.

Every object is drawn as a clean isolated toy-like model in the SAME
three-quarter high angle, with the light coming from the top left in every
cell. Each object fills 80-90% of its cell height, centred, its base near the
bottom edge of the cell. Same outline weight, same saturation and same light in
all twelve cells. Colours must NOT group the objects: do not colour-code them
by area.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters
from the reference image, text, letters, words, labels, digits, numbers,
captions, watermark, logo, title lettering, user interface, buttons, panels,
frames, speech bubbles, arrows, icons, stars, HUD, question mark button,
black outlines, uniform black ink lines, white sticker keyline,
painterly lineless illustration, heavy airbrushed rendering, western cartoon
style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render,
photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet
borders, cell borders, gaps, cropped edges, drop shadow on the cell,
ground shadow, grass, dirt patch or base under the object,
white backing in transparent assets, people, children playing,
sad faces, crying, angry faces.
~~~

---

## 4. `bg-canteiro.png` — 1672 × 941, imagem única

O canteiro de obras visto de frente, **com o meio inteiramente vazio**: o
terreno, os lotes, as linhas e o chão de terra são desenhados por cima, em `Graphics`.

O que a imagem tem de dar é **o lugar**: tapumes coloridos em volta, uma pilha
de material num canto, um cone, um carrinho de mão parado, telhado de lona ao
fundo, céu de fim de tarde. O que ela **não pode** ter é qualquer coisa no
retângulo central de `x 60–980`, `y 170–540` — o terreno mora lá.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: friendly storybook vector cartoon; clean line art of even
medium weight, and every outline is a DARKER, slightly more saturated tone of
the colour it surrounds — never black; simple cel shading with ONE soft shadow
tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms
with no sharp corners; a warm earthy palette — leaf green, slate blue, tan,
chestnut brown, terracotta, cream. NO white sticker keyline here — this is a
full scene, not a sticker. Crisp shapes, no painterly brushwork. Take ONLY the
art style from the attached image: do NOT copy its characters, their elf ears,
their clothes, their poses, their scene or their framing.

Wide background illustration, 16:9, of a friendly small construction site for a
town square: colourful wooden hoardings running along the far side, a tidy
stack of planks and bricks in one corner, a parked wheelbarrow, one traffic
cone, a small canvas canopy, warm late-afternoon sky. The WHOLE CENTRE of the
image is empty flat ground in calm low-contrast tones, because game elements
will be drawn on top of it. No characters anywhere.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters
from the reference image, text, letters, words, labels, digits, numbers,
captions, watermark, logo, title lettering, user interface, buttons, panels,
frames, speech bubbles, arrows, icons, stars, HUD, question mark button,
black outlines, uniform black ink lines, white sticker keyline,
painterly lineless illustration, heavy airbrushed rendering, western cartoon
style, rough sketchy lines, muddy colours, 3D render, photorealistic, blur,
lens flare, heavy noise, cranes, heavy machinery, scaffolding in the centre,
rubble, hazard tape, people, workers, sad faces, angry faces.
~~~

---

## 5. `tuca.png` — 1280 × 320, 4 × 1 de 320

A **Tuca**, mestra de obras: mulher adulta, capacete amarelo, macacão de brim,
camiseta, prancheta na mão. **Do peito para cima**, porque ela aparece em 260 px
de largura na tela — 78 px reais.

Quatro estados, nesta ordem, e o que carrega cada um a 78 px é **a pose dos
braços e a boca**, nunca a sobrancelha:

| # | Estado | Os braços | A cara |
|---:|---|---|---|
| 0 | **esperando** | braços cruzados, relaxada | sorriso pequeno |
| 1 | **explicando** | uma mão aberta para a frente, a outra com a prancheta | boca falando, gentil — **nunca brava** |
| 2 | **comemorando** | as duas mãos para cima, corpo inclinado à frente | olhos em arco alegre, boca aberta sorrindo |
| 3 | **apontando** | um braço esticado apontando para o lado, o outro na cintura | sobrancelhas no meio, boca pequena, curiosa |

**Meça o sprite, não chute.** Quando o arquivo chegar, varra o canal alfa célula
por célula e ancore por `originY = 1` com o `footPad` medido: a Tuca tem de
aparecer na mesma linha nos quatro estados, e 4 px de diferença já lê como
defeito. **Uma escala só** para os quatro, tirada da maior altura medida.

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: friendly storybook vector cartoon; clean line art of even
medium weight, and every outline is a DARKER, slightly more saturated tone of
the colour it surrounds — never black; simple cel shading with ONE soft shadow
tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms;
big expressive eyes with a coloured iris and one white highlight; a warm earthy
palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. Take
ONLY the art style from the attached image: do NOT copy its characters, their
elf ears, their clothes, their poses, their scene or their framing.

Sprite sheet, 4 columns by 1 row, 320x320 px per cell, transparent background,
no grid lines drawn. The SAME friendly adult woman site foreman in every cell,
head and chest only, centred, at the same scale and the same lighting: warm
brown skin, hair tied back under a yellow hard hat, denim dungarees over a
simple shirt, a small clipboard. Four states, in this order:
1 waiting, arms folded, small calm smile;
2 explaining, one open hand held forward, the other holding the clipboard,
  mouth talking, gentle and never stern;
3 celebrating, both hands raised, leaning forward, happy arched eyes, open
  smiling mouth;
4 pointing, one arm stretched out to the side, the other hand on her hip,
  curious expression.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters
from the reference image, text, letters, words, labels, digits, numbers,
captions, watermark, logo, user interface, buttons, panels, frames, speech
bubbles, arrows, icons, stars, HUD, black outlines, uniform black ink lines,
white sticker keyline, painterly lineless illustration, heavy airbrushed
rendering, western cartoon style, rough sketchy lines, muddy colours, 3D
render, photorealistic, blur, lens flare, heavy noise, grid lines, visible
sprite-sheet borders, cell borders, gaps, cropped edges, drop shadow on the
cell, ground shadow, white backing in transparent assets, tools raised like
weapons, sad face, crying, angry face, scolding pose, pointing at the viewer.
~~~

---

## 6. `pecas-festa.png` — 1024 × 768, 4 × 3 de 256

As doze peças do projeto **Festa Junina**, na ordem das células:

| # | A peça | De qual lote |
|---:|---|---|
| 0 | **barraca** de festa, com toldo listrado | comes |
| 1 | **carrinho de pipoca** | comes |
| 2 | **bandeja de maçãs do amor** | comes |
| 3 | **tanque de pescaria**, redondo e raso | pescaria |
| 4 | **vara de pescar** de brincadeira, com ímã | pescaria |
| 5 | **peixinhos** de papelão, um grupinho | pescaria |
| 6 | **argolas** empilhadas | argolas |
| 7 | **fileira de garrafas** para acertar as argolas | argolas |
| 8 | **palco** de tablado baixo, com dois degraus | palco |
| 9 | **microfone** em pedestal | palco |
| 10 | **cordão de bandeirinhas** de papel | palco |
| 11 | **sanfona** apoiada | dança |

**Nada de fogo nesta folha.** A fogueira é a imagem mais óbvia de festa junina e
foi deixada de fora de propósito: chama acesa ao lado de um tanque de pescaria,
numa tela de criança de 6 anos, é uma pergunta que o jogo não vai responder. No
lugar dela entrou a **sanfona**, que diz festa junina igual e não queima
ninguém.

**As garrafas da barraca de argolas são garrafas de vidro lisas e vazias**, sem
rótulo e sem cor de bebida — daí `alcohol, beer bottles, wine, drink labels` no
negativo deste arquivo.

**Prompt (copiar inteiro):**

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: friendly storybook vector cartoon; clean line art of even
medium weight, and every outline is a DARKER, slightly more saturated tone of
the colour it surrounds — never black; simple cel shading with ONE soft shadow
tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms
with no sharp corners; a warm earthy palette — leaf green, slate blue, tan,
chestnut brown, terracotta, cream. Take ONLY the art style from the attached
image: do NOT copy its characters, their elf ears, their clothes, their poses,
their scene or their framing.

Sprite sheet, 4 columns by 3 rows, 256x256 px per cell, transparent
background, no grid lines drawn. Twelve separate objects from a Brazilian
village summer fair, one per cell, in this exact order, left to right and top
to bottom: 1 a small wooden fair stall with a striped awning, 2 a popcorn cart,
3 a tray of candy apples on sticks, 4 a round shallow tub for a toy fishing
game, 5 a toy fishing rod with a small magnet on the line, 6 a small group of
flat cardboard toy fish, 7 a stack of ring-toss rings, 8 a row of three plain
empty glass bottles for a ring-toss game, 9 a low two-step wooden stage
platform, 10 a microphone on a stand, 11 a hanging string of triangular paper
bunting flags, 12 an accordion resting on its side.

Every object is drawn as a clean isolated toy-like model in the SAME
three-quarter high angle, with the light coming from the top left in every
cell. Each object fills 80-90% of its cell height, centred, its base near the
bottom edge of the cell. Same outline weight, same saturation and same light in
all twelve cells. Colours must NOT group the objects: do not colour-code them
by area. Each object must be recognisable on its own at thumbnail size, with no
label of any kind.

DO NOT INCLUDE: fire, flames, bonfire, candles, lanterns with flames, smoke,
alcohol, beer bottles, wine, drink labels, elves, pointed elf ears, fantasy
characters, the two characters from the reference image, text, letters, words,
labels, digits, numbers, captions, watermark, logo, title lettering, user
interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD,
question mark button, black outlines, uniform black ink lines, white sticker
keyline, painterly lineless illustration, heavy airbrushed rendering, western
cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D
render, photorealistic, blur, lens flare, heavy noise, grid lines, visible
sprite-sheet borders, cell borders, gaps, cropped edges, drop shadow on the
cell, ground shadow, grass, dirt patch or base under the object, white backing
in transparent assets, people, children, sad faces, crying, angry faces.
~~~

---

## 7. `pecas-horta.png` — 1024 × 768, 4 × 3 de 256

As doze peças do projeto **Horta**, na ordem das células:

| # | A peça | De qual lote |
|---:|---|---|
| 0 | **caixote de madeira** de canteiro, vazio | canteiro |
| 1 | **mudas** em bandeja | canteiro |
| 2 | **plaquinha** de canteiro, em branco | canteiro |
| 3 | **regador** | cuidado |
| 4 | **mangueira** enrolada | cuidado |
| 5 | **espantalho** simpático | cuidado |
| 6 | **balde** | regador |
| 7 | **torneira de jardim** com registro | mangueira |
| 8 | **casinha de passarinho** em poste | bichos |
| 9 | **trecho de cerca** baixa, de ripas | cerca |
| 10 | **saquinho de sementes**, sem escrita | plantio |
| 11 | **enxada** pequena, encostada | terra |

**A plaquinha vai em branco e o saquinho de sementes não tem escrita nenhuma.**
São as duas peças em que o gerador vai querer escrever, e neste jogo não existe
texto em lugar nenhum — nem no PNG, nem em `Graphics` (regra 6 do §1). A
plaquinha se lê pela forma: estaca com uma pá de madeira em cima.

**As duas peças mais difíceis desta folha são o balde e o regador**, porque a
silhueta é parecida a 51 px. O regador tem de vir com **o bico comprido bem
destacado e a alça de arco por cima**; o balde é liso, mais largo em cima, com
alça fina. Se as duas não se separarem no teste da regra 4, o balde vira **um
balde de cor viva com aro de metal**.

**Prompt (copiar inteiro):**

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: friendly storybook vector cartoon; clean line art of even
medium weight, and every outline is a DARKER, slightly more saturated tone of
the colour it surrounds — never black; simple cel shading with ONE soft shadow
tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms
with no sharp corners; a warm earthy palette — leaf green, slate blue, tan,
chestnut brown, terracotta, cream. Take ONLY the art style from the attached
image: do NOT copy its characters, their elf ears, their clothes, their poses,
their scene or their framing.

Sprite sheet, 4 columns by 3 rows, 256x256 px per cell, transparent
background, no grid lines drawn. Twelve separate objects from a small school
vegetable garden, one per cell, in this exact order, left to right and top to
bottom: 1 an empty wooden planter box, 2 a tray of small green seedlings, 3 a
completely blank wooden plant label stake, 4 a watering can with a long spout
and an arched handle, 5 a coiled garden hose, 6 a friendly smiling scarecrow on
a short pole, 7 a plain bucket with a thin handle, 8 a garden tap with a round
valve on a short pipe, 9 a birdhouse on a post, 10 a short section of low
picket fence, 11 a small blank seed packet with no writing at all, 12 a small
gardening hoe.

Every object is drawn as a clean isolated toy-like model in the SAME
three-quarter high angle, with the light coming from the top left in every
cell. Each object fills 80-90% of its cell height, centred, its base near the
bottom edge of the cell. Same outline weight, same saturation and same light in
all twelve cells. The watering can and the bucket must read as clearly
different silhouettes at thumbnail size. Colours must NOT group the objects: do
not colour-code them by area. Each object must be recognisable on its own at
thumbnail size, with no label of any kind.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters
from the reference image, text, letters, words, labels, digits, numbers,
captions, handwriting on the plant stake or the seed packet, watermark, logo,
title lettering, user interface, buttons, panels, frames, speech bubbles,
arrows, icons, stars, HUD, question mark button, black outlines, uniform black
ink lines, white sticker keyline, painterly lineless illustration, heavy
airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush
outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy
noise, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped
edges, drop shadow on the cell, ground shadow, grass, dirt patch or base under
the object, white backing in transparent assets, people, children, insects,
sad faces, crying, angry faces, creepy scarecrow.
~~~

---

## 8. `cover-canteiro-de-obras.png` — 1672 × 941

A capa precisa dizer o jogo **no tamanho de miniatura**, e o jogo é *o grande
virando pedaços pequenos*. A cena: o terreno da praça **partido em três
pedaços afastados**, cada um com uma obra dentro — um pronto e colorido, um
pela metade, um ainda em projeto transparente —, e a Tuca de lado, sorrindo,
com a prancheta. A faixa de inauguração aparece no alto, apagada.

O que **não** pode entrar: nenhuma letra, nenhum número, nenhum botão, nenhuma
estrela. A capa é arte; o título vem do catálogo.

**Prompt (copiar inteiro):**

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: friendly storybook vector cartoon; clean line art of even
medium weight, and every outline is a DARKER, slightly more saturated tone of
the colour it surrounds — never black; simple cel shading with ONE soft shadow
tone plus a gentle soft gradient inside the large shapes; rounded sturdy forms
with no sharp corners; a warm earthy palette — leaf green, slate blue, tan,
chestnut brown, terracotta, cream; big expressive eyes with a coloured iris and
one white highlight. NO white sticker keyline here — this is a full scene, not
a sticker. Crisp shapes, no painterly brushwork. Take ONLY the art style from
the attached image: do NOT copy its characters, their elf ears, their clothes,
their poses, their scene or their framing.

Cover illustration, 16:9; the main action must read at thumbnail size. A small
town square seen slightly from above, its ground SPLIT INTO THREE SEPARATED
SLABS with clear gaps between them: the left slab is finished and colourful
with a slide and a swing, the middle slab is half built, the right slab is
still only a faint transparent blueprint drawing of a garden. A friendly adult
woman site foreman stands at the right edge, smiling, yellow hard hat, denim
dungarees, holding a clipboard. A plain festive ribbon banner hangs across the
top of the scene. Warm late-afternoon light, calm background of colourful
wooden hoardings.

DO NOT INCLUDE: cranes, heavy machinery, scaffolding, rubble, hazard tape,
elves, pointed elf ears, fantasy characters, the two characters from the
reference image, text, letters, words, labels, digits, numbers, captions,
watermark, logo, title lettering, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, HUD, black outlines, uniform black ink
lines, white sticker keyline, painterly lineless illustration, heavy airbrushed
rendering, western cartoon style, rough sketchy lines, muddy colours, 3D
render, photorealistic, blur, lens flare, heavy noise, sad faces, crying,
angry faces.
~~~

A mesma arte, exportada em JPG, vira `public/og/canteiro-de-obras.jpg`.

---

## 9. O que conferir quando a arte chegar

- [ ] **nenhuma peça tem chão, base ou sombra** dentro da célula;
- [ ] as doze peças de cada folha têm **o mesmo ângulo e a mesma luz**;
- [ ] **nenhuma cor agrupa as peças por obra** (regra 2 do §1);
- [ ] cada peça se lê a **51 px e sem legenda** — o teste da regra 4 do §1,
      feito com alguém que não leu este documento;
- [ ] **nenhuma letra ou número** em nenhum arquivo, inclusive na plaquinha, no
      saquinho de sementes e na barraca;
- [ ] a Tuca fica **na mesma linha** nos quatro estados, medida no canal alfa;
- [ ] o **meio do `bg-canteiro.png` está vazio**, de `x 60` a `x 980` e de
      `y 170` a `y 540` na grade de 1280 × 720;
- [ ] nenhum arquivo tem **keyline branca**;
- [ ] contorno **colorido**, nunca preto, em todos os arquivos;
- [ ] a capa se entende a 240 px de largura.
