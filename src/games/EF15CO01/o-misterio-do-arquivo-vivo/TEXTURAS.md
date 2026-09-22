# O Mistério do Arquivo Vivo — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF15CO01/o-misterio-do-arquivo-vivo/`

**Quatro arquivos para os TRÊS níveis, mais a capa do catálogo.** Os níveis 2
e 3 não pediram arte nova — ver §8.

> **Tudo que existia nesta pasta foi descartado** junto com a terceira versão do
> jogo (§3 do `PLANEJAMENTO.md`). `coruja.png`, `centopeia.png`, `tico.png`,
> `acahdos.png` e `simbolos.png` **não são reaproveitados** — o jogo mudou de
> mecânica, e a arte antiga servia a móveis-bicho que não existem mais.

---

## O estilo: CHIBI DE FIGURINHA

A imagem de referência
[`references/19-chibi-figurinhas.jpg`](../../../../references/19-chibi-figurinhas.jpg)
vai anexada em **TODAS** as gerações. É a linha que o
[`references/ESTILO.md`](../../../../references/ESTILO.md) manda usar em jogo
novo, e é a mesma do `EF05CO10`.

> **A referência tem elenco de RPG anime, e ele vai para o negativo.** Tapa-olho,
> chifres, orelhas pontudas, cabelo enorme com enfeite, olho que brilha e marca
> d'água escrita: é o que o gerador copia se ninguém proibir. Todo prompt abaixo
> já fecha proibindo o elenco, não só pedindo "take ONLY the art style".

## As prateleiras são `Graphics`, e isso é decisão de engenharia

Na versão anterior as estruturas eram **móveis-bicho**: a grade 3 × 3 tinha de
ser desenhada dentro do vão da barriga de uma coruja, e o vão mudava de lugar
entre os quadros da folha. A grade desencaixava, e consertar isso custou duas
rodadas.

Agora **a prateleira e os buracos nascem em `Graphics`**, na mesma conta que
posiciona as peças. Eles encaixam sempre, em qualquer resolução, e a arte deixa
de ter um contrato de alinhamento para cumprir.

O "vivo" do título passa a morar no **arquivista** — um mascote que reage,
comemora e mostra a dica. É ele que dá cara ao jogo, e ele não tem nada
encaixando em cima.

> **Nascem em `Graphics`:** o cabeçalho, as bolinhas de fase, o botão `?`, as
> vidas, **as quatro prateleiras** — fila, grade, ficha e teia — e **todos os
> buracos**; as etiquetas de linha e de coluna, os rótulos dos campos, os fios
> pontilhados, **as fichinhas** (a forma colorida com o bichinho em cima), os
> **cartões de fio**, a faixa do rodapé, as estrelas e o confete.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `coisas.png` | 768 × 512 | 3 × 2 de **256** | alfa real | **as seis coisas** que se põem em ordem de tamanho |
| 2 | `bichinhos.png` | 1536 × 512 | 3 × 1 de **512** | alfa real | coelho, peixe e abelha — linhas da grade, valores de campo e pontos da teia |
| 3 | `arquivista.png` | 1024 × 512 | 4 × 2 de **256** | alfa real | o mascote, em oito estados |
| 4 | `bg-arquivo.png` | 1672 × 941 | imagem única | opaco | o salão, **com o meio vazio** |
| 5 | `cover-o-misterio-do-arquivo-vivo.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**Ordem de geração:** o **1** primeiro, sozinho — sem as coisas não existe fase
1.1, e é ela que se testa antes de tudo. O **2** é pequeno e rápido, e destrava
as fases de grade. O **3** põe cara no jogo. O **4** tira o fundo do degradê, e
o **5** por último.

A capa também alimenta `public/og/o-misterio-do-arquivo-vivo.jpg` — mesma arte,
exportada em JPG para o compartilhamento.

---

## 1. As quatro regras que governam esta arte

### 1. Cada coisa tem de continuar legível a 45 px, e inteira a 190 px.

A mesma imagem é usada **em vários tamanhos na mesma tela**: na fase da fila, a
mesma coisa aparece quatro vezes, do menor ao maior. Isso significa duas
exigências ao mesmo tempo:

- **silhueta forte**, para sobreviver ao menor tamanho;
- **desenho limpo**, para aguentar ser ampliada sem virar mancha.

Então cada coisa é **uma forma grande e um acento de cor**, sem estampa, sem
textura e sem detalhe fino.

### 2. A coisa preenche a célula, e é centrada.

Este é o erro que custou a versão anterior. Se o desenho ocupar 60 % do quadro
de 256 e o resto for margem, o jogo pede 190 px e entrega 114 px de desenho.

**O objeto ocupa de 88 % a 94 % da célula**, centrado, com margem mínima e
igual dos quatro lados. Todas as seis coisas com **a mesma proporção de
preenchimento** — senão uma parece maior que a outra sem ser, e numa fase que é
*sobre tamanho* isso é o pior defeito possível.

### 3. Nada de chão, sombra, moldura ou cenário nas peças com alfa.

O fundo é desenhado em código. Um PNG com chão próprio cria emenda visível, e
uma sombra pintada briga com a sombra que o encaixe desenha.

### 4. O arquivista nunca dá bronca.

A criança errou uma posição, não uma pessoa. Nada de dedo em riste, cara
fechada, braços na cintura ou sobrancelha de raiva. O estado de erro dele é
**curiosidade**, não reprovação: cabeça inclinada, uma asa apontando de leve
para onde olhar.

### A conferência de estilo, que vale para os cinco arquivos

- [ ] contorno limpo, **espessura uniforme**, escuro dessaturado — nunca preto puro;
- [ ] `cel shading` **chapado**, um só tom de sombra, sem degradê;
- [ ] olhos grandes e brilhantes, com um brilho pequeno;
- [ ] **keyline branca de adesivo** em tudo que tem alfa — e **em nada** que é
      cena inteira (o fundo e a capa);
- [ ] **nenhuma letra, nenhum número**, em arquivo nenhum;
- [ ] **nenhuma criatura de RPG** — sem chifre, sem asa de morcego, sem orelha
      pontuda, sem tapa-olho;
- [ ] nenhum chão, nenhuma sombra e nenhum cenário nas peças com alfa.

---

## 2. `coisas.png` — as seis coisas

### Contrato da folha

- **768 × 512**, grade **3 × 2** de **256 × 256**, alfa real.
- **Cada fase da fila usa UMA coisa só**, repetida em quatro ou cinco tamanhos —
  o tamanho é dado em código, por escala. É por isso que não existem variantes
  de tamanho nesta folha. As coisas também viram **pontos da teia**, no nível 2.
- Por isso mesmo, **toda coisa aqui tem de ser algo que existe em tamanhos
  diferentes sem estranheza**: um ursinho pequeno e um grande são naturais; um
  par de óculos pequeno e um gigante, não.

| # | Coisa | Cor de acento |
|---:|---|---|
| 0 | ursinho de pelúcia, sentado | marrom |
| 1 | bola | vermelho e branco |
| 2 | livro fechado, de pé | roxo |
| 3 | caixa com laço | azul |
| 4 | vaso com uma plantinha | verde |
| 5 | chapéu de aba redonda | amarelo |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; big simple friendly shapes; a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
image: do NOT copy its characters, its clothes, its hair, its poses, its scenes
or its framing.

Sprite sheet, 3 columns by 2 rows, 256x256 px per cell, transparent background,
no grid lines drawn, no cell borders, no ground shadow.

Six simple objects from a school lost-and-found, drawn as clean chibi sticker
icons, each one seen from the front at a slight angle.

VERY IMPORTANT: each object must FILL ITS CELL, taking up about 90 percent of
the 256x256 square, centred, with only a thin even margin on all four sides. All
six objects must fill their cells by the SAME amount, so that none of them looks
bigger than another. Do not leave large empty space around any object.

Each object is ONE bold shape plus ONE accent colour, with no pattern, no
texture and no small detail, so it stays readable when shrunk to 45 pixels and
stays clean when enlarged.

Read the cells left to right, top row first:

Row 1 — cell 1: a TEDDY BEAR, warm brown, sitting with arms and legs out, a
friendly little face. Cell 2: a BALL, red and white, a simple sphere with one
curved band across it. Cell 3: a CLOSED BOOK standing upright, purple cover,
seen at a slight angle so the pages show along one edge, the cover completely
blank.

Row 2 — cell 4: a GIFT BOX, blue, a simple cube with a ribbon and a small bow on
top. Cell 5: a SMALL POTTED PLANT, terracotta pot with three round green leaves.
Cell 6: a ROUND-BRIMMED HAT, yellow, seen from the side at a slight angle so the
brim reads clearly.

Every silhouette must be different enough from the other five to be told apart
instantly at thumbnail size.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
brand logos, printed patterns, writing on the book cover, watermark, website
address, artist signature, title lettering, user interface, buttons, panels,
frames, speech bubbles, arrows, icons, stars, HUD,
ground, grass, floor, table, shelf, shadow under the objects, scenery,
several sizes of the same object, size comparisons, objects of different scales,
anime video game characters, character roster sheets, RPG costume props,
weapons, horns, wings, pointed elf ears, eyepatch,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets.
~~~

---

## 3. `bichinhos.png` — as três linhas da grade

### Contrato da folha

- **768 × 256**, grade **3 × 1** de **256 × 256**, alfa real.
- São as **etiquetas das linhas** da grade, e os mesmos três desenhos aparecem
  **dentro das nove fichinhas** que a criança encaixa — a fichinha é um disco
  colorido em `Graphics` com um destes por cima.
- É por isso que eles precisam ler **pequenos**: dentro da fichinha eles ficam
  com cerca de 70 px.

| # | Bichinho |
|---:|---|
| 0 | coelho |
| 1 | peixe |
| 2 | abelha |

- **Só a cabeça**, de frente, centrada, preenchendo ~90 % da célula.
- As três silhuetas se separam **sem cor nenhuma**: orelhas compridas,
  barbatana, listras com asinhas.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; big glossy expressive eyes with a bright
highlight; a short palette; a thin white sticker keyline around the whole
silhouette. Take ONLY the art style from the attached image: do NOT copy its
characters, its poses, its scenes or its framing.

Sprite sheet, 3 columns by 1 row, 256x256 px per cell, transparent background,
no grid lines drawn, no cell borders, no ground shadow.

Three simple animal HEADS used as label icons, front view, cute and friendly,
each one ONE bold shape with a single accent colour.

Each head must FILL ITS CELL, about 90 percent of the 256x256 square, centred,
with only a thin even margin. All three the same apparent size.

Cell 1: a RABBIT head, soft white and pink, with two long upright ears — the
ears are what makes it recognisable.
Cell 2: a FISH head seen from the front-side so the tail fin shows behind it,
soft blue, round eyes and small fins.
Cell 3: a BEE head with the round striped body just below it, yellow and dark
brown stripes, two small round wings and two antennae.

Each silhouette must be tellable from the other two in pure black, with no
colour at all, at 70 pixels.

DO NOT INCLUDE: owls, mice, centipedes, insects with many legs, frogs, spiders,
any animal other than the three asked for,
text, letters, words, labels, digits, numbers, captions, watermark, artist
signature, logo, user interface, buttons, panels, frames, speech bubbles,
arrows, icons, stars, HUD,
ground, grass, water, flowers, hive, scenery, shadow under the heads,
horns, pointed elf ears, ornate fantasy costume, glowing eyes,
anime video game characters, character roster sheets,
angry eyebrows, sharp teeth, menacing expression,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets.
~~~

---

## 4. `arquivista.png` — o mascote

### Contrato da folha

- **1024 × 512**, grade **4 × 2** de **256 × 256**, alfa real.
- **É ele o "vivo" do título.** As prateleiras são `Graphics`, então toda a
  personalidade do jogo passa por esta folha — vale caprichar aqui mais do que
  em qualquer outro arquivo.
- Ele mora no canto inferior esquerdo da tela, com cerca de 190 px.

| # | Quadro | Quando aparece |
|---:|---|---|
| 0 | **esperando** — de pé, asas juntas, sorriso pequeno | o estado normal |
| 1 | **apontando** — uma asa estendida para o lado, olhos atentos | quando a dica acende |
| 2 | **feliz** — olhos em arco, asas erguidas | a cada encaixe certo |
| 3 | **curioso** — cabeça inclinada, uma asa no queixo | no erro — **nunca bronca** |
| 4 | **comemorando** — pulando, as duas asas para cima | prateleira cheia |
| 5 | **espiando** — inclinado para a frente, uma asa sobre os olhos | enquanto a criança demora |
| 6 | **acenando** — uma asa acenando, corpo virado de leve | abertura da fase |
| 7 | **cochilando** — sentado, olhos fechados, bolha de sono | tela de fim de nível |

- **A mesma escala e a mesma linha de base nos oito quadros** (menos o 4, que
  está no ar, e o 7, que está sentado).
- Ele segura **nada** em quadro nenhum: não há objeto entrando na asa dele.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little body;
big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks
(small sparkles, a sweat drop, motion ticks); a short palette — one strong
accent colour over near-white and dark neutrals; a thin white sticker keyline
around the whole silhouette. Take ONLY the art style from the attached image: do
NOT copy its characters, its clothes, its hair, its poses, its scenes or its
framing.

Sprite sheet, 4 columns by 2 rows, 256x256 px per cell, the same character at
the same scale and the same lighting in every cell, transparent background, no
grid lines drawn, no cell borders, no ground shadow.

The same character in all eight cells: a small, round, very cute OWL ARCHIVIST.
Soft honey-brown feathers, a cream face and belly, a small orange beak, round
spectacles, and a little teal scarf around the neck. He is warm and encouraging
and NEVER scolds: no angry eyebrows, no sharp teeth, no wagging finger, and he
never points at the viewer. Keep the spectacles, the scarf and the feather
colour exactly the same in all eight cells.

Read the cells left to right, top row first:

Row 1 — cell 1: WAITING, standing front-facing, both wings tucked at his sides,
a small calm smile. Cell 2: POINTING, standing, ONE wing stretched out to the
side and slightly down, eyes wide and attentive, looking the same way the wing
points. Cell 3: HAPPY, eyes as upward arcs, beak open in a smile, both wings
raised in a small cheer, two tiny sparkles beside his head. Cell 4: CURIOUS,
head tilted to one side, one wingtip resting against his beak as if thinking, a
small question-mark-free puzzled look — interested, never disapproving.

Row 2 — cell 5: CELEBRATING, jumping with both feet off the ground, both wings
thrown up high, eyes shut with joy, mouth open laughing. Cell 6: PEEKING,
leaning forward, one wing shading his eyes, looking ahead, eyebrows raised with
gentle interest. Cell 7: WAVING, body turned slightly to one side, one wing
raised and waving, friendly open smile. Cell 8: NAPPING, sitting down curled
slightly, eyes closed as two calm curves, one small round sleep bubble at his
beak.

In every standing cell his feet must rest on exactly the same horizontal line
and his body must be the same size.

DO NOT INCLUDE: anything held in his wings, a book, a stamp, a key, a lantern, a
bag, a clipboard, a pen, furniture, shelves, weapons,
text, letters, words, labels, digits, numbers, captions, question marks,
watermark, website address, artist signature, logo, title lettering,
user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars,
HUD,
ground, grass, floor, perch, branch, scenery, shadow under the feet,
horns, bat wings, pointed elf ears, eyepatch, ornate fantasy costume, armour,
glowing eyes, long flowing anime hair, hair ornaments,
anime video game characters, character roster sheets, emote sheets,
sharp teeth, bared beak, angry eyebrows, frowning, scolding,
pointing at the viewer, crying, sad faces,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets.
~~~

---

## 5. `bg-arquivo.png` — o salão

### Contrato do arquivo

- **1672 × 941**, imagem única, **opaca**, sem alfa e **sem keyline branca** —
  é cena inteira, não adesivo.
- **O meio e a metade de baixo ficam vazios e calmos.** A bagunça ocupa a faixa
  de 90 a 300 e a prateleira a de 330 a 700: nada de estante, coluna, mesa ou
  janela forte atrás delas.
- **Nenhum móvel desenhado**, e principalmente **nenhuma prateleira** — a
  prateleira do jogo é `Graphics`, e uma pintada no fundo faria a criança tentar
  encaixar no lugar errado.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi illustration; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; a short warm palette of honey wood and soft teal.
NO white sticker keyline here — this is a full scene, not a sticker. Crisp
shapes, no painterly brushwork. Take ONLY the art style from the attached image:
do NOT copy its characters, its poses, its scenes or its framing.

Wide background illustration, 16:9, a cosy and slightly magical old ARCHIVE HALL
inside a school: warm honey wood walls, a soft teal painted dado rail low along
the bottom, dust motes floating in a warm shaft of light coming from the upper
left, a worn patterned rug on the floor.

THE ENTIRE MIDDLE AND LOWER PART OF THE IMAGE MUST BE EMPTY AND CALM: plain wall
and plain floor in soft low-contrast colours, with nothing drawn in them,
because the game pieces sit there. Keep every bit of scenery detail in the top
corners and along the very bottom edge.

No furniture of any kind: no shelves, no bookcases, no cabinets, no filing
drawers, no tables, no doors, no doorways, no archways, no ladders. No
characters, no animals, no people.

DO NOT INCLUDE: shelves, bookcases, cabinets, filing cabinets, drawers, tables,
doors, doorways, arches, ladders, books, boxes, crates, any furniture at all,
characters, people, animals, owls,
text, letters, words, labels, digits, numbers, captions, signs, watermark,
artist signature, logo, title lettering, user interface, buttons, panels,
frames, speech bubbles, arrows, icons, stars, HUD,
white sticker keyline, sticker border,
strong contrast in the centre, busy patterns, clutter,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
cropped edges.
~~~

---

## 6. `cover-o-misterio-do-arquivo-vivo.png` — a capa

### Contrato do arquivo

- **1672 × 941**, imagem única, **opaca**, sem keyline.
- **ENTREGUE em 21/09/2026**, e ela fugiu do prompt num ponto: traz o **título
  desenhado**. Ficou certo assim — é a convenção da casa (o `museu-das-estruturas`,
  o irmão, faz igual), e o card do catálogo põe o título **abaixo** da imagem, não
  por cima. Na página de detalhes a plataforma sobrepõe o título dela, e aí os dois
  aparecem — mas isso vale para **todos** os jogos do catálogo, não é deste.
- **A capa tem de mostrar o gesto do jogo**: coisas indo para os seus lugares.
  Ela aparece no catálogo ao lado do **Museu das Estruturas**, o jogo irmão da
  mesma habilidade — se mostrar só um salão bonito, os dois ficam iguais na
  grade.
- Tem de ler a **tamanho de miniatura**: uma fileira que cresce e uma grade que
  se enche, com o arquivista no meio.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi illustration; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; big heads, small rounded bodies; big glossy
expressive eyes with a bright highlight; a short warm palette of honey wood,
soft teal and coral. NO white sticker keyline here — this is a full scene, not a
sticker. Take ONLY the art style from the attached image: do NOT copy its
characters, its poses, its scenes or its framing.

Cover illustration, 16:9, for a children's game about putting things in order.
The main action must read at thumbnail size.

A cosy warm archive hall. In the middle stands a small round OWL ARCHIVIST with
round spectacles and a little teal scarf, both wings spread wide and a delighted
open-beak smile, as if he just finished tidying.

On the LEFT, a neat ROW OF FOUR TEDDY BEARS standing on a simple wooden ledge,
clearly ordered from the smallest on the left to the biggest on the right — the
size progression must be obvious at a glance.

On the RIGHT, a simple wooden frame divided into a 3 by 3 grid of nine square
compartments. Each compartment holds one round coloured disc with a tiny animal
face on it — rabbits in the top row, fish in the middle row, bees in the bottom
row; the discs in the left column are blue, the middle column green, the right
column red. The neat rows and columns must be obvious.

A few small objects still float in the air above, drifting down toward their
places, with little motion ticks behind them.

Warm honey wood, soft teal and coral accents. Everything is cheerful, tidy and
satisfying.

DO NOT INCLUDE: text, letters, words, title lettering, labels, digits, numbers,
captions, watermark, website address, artist signature, logo,
user interface, buttons, panels, speech bubbles, arrows, icons, stars, HUD,
progress bars,
a conveyor belt, machinery, gears, a factory, a chute,
bookshelves full of books, cabinets with faces, furniture with eyes,
doors, doorways, archways,
horns, bat wings, pointed elf ears, eyepatch, ornate fantasy costume, armour,
weapons, glowing eyes, anime video game characters, character roster sheets,
sharp teeth, angry faces, mess, chaos, things breaking,
white sticker keyline, sticker border,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
cropped edges.
~~~

---

## 7. Depois de gerar

1. **Meça o preenchimento das células.** Abra `coisas.png`, recorte as seis
   células e compare a caixa alfa de cada uma. Se uma ocupar 90 % e outra 65 %,
   a fase de tamanho fica mentindo — regere a menor. É a conferência mais
   importante desta folha, e a que a versão anterior não teve.
2. **Teste em preto.** Pinte `bichinhos.png` de preto chapado e reduza para
   70 px: os três ainda têm de ser reconhecíveis. Se não forem, o jogo está
   dependendo de cor.
3. **Teste a ampliação.** Ponha uma coisa a 190 px e olhe: contorno liso, sem
   serrilha, sem borrão. É o tamanho da peça na mão da criança.
4. **Meça a caixa alfa de cada quadro** do `arquivista.png` com o script do
   [`PLANEJAMENTO MODAL.md`](../../PLANEJAMENTO%20MODAL.md) §7 e ancore por
   `originY = 1`, com **uma escala só para a folha inteira**.
5. **Se não vier transparência**, peça sobre magenta `#FF00FF` chapado e remova
   a cor. Fundo branco é pior — branco é a cor da `keyline`.
6. Exporte a capa também como `public/og/o-misterio-do-arquivo-vivo.jpg`.

---

## 8. Os níveis 2 e 3 — nenhuma folha nova

**Os três níveis rodam com os quatro arquivos desta lista.** A ficha e a teia,
que entram no nível 2, e as duas prateleiras lado a lado do nível 3 foram
construídas sem arte nova:

| O que o nível 2 e 3 pediram | De onde saiu |
|---|---|
| os **valores dos campos** da ficha | `bichinhos.png` para *qual bicho*; a cor e o tamanho são `Graphics` |
| os **rótulos dos campos** | pictogramas em `Graphics` — a patinha, as manchas, os círculos crescendo |
| os **pontos da teia** | `bichinhos.png` e `coisas.png`, os mesmos de sempre |
| os **fios** | cartão em `Graphics` com as duas pontas dentro |
| as duas prateleiras do nível 3 | as mesmas quatro, encolhidas para 62 % |

> **O `carinhas.png` saiu do plano.** A versão anterior deste documento previa
> seis rostos de criança para a ficha e a teia. Eles não são necessários: os
> três bichinhos já eram o elenco do jogo, e reusá-los como pontos da teia é
> **melhor** do que um elenco novo — a criança já conhece as caras do nível 1,
> e reconhecer o mesmo coelho em outra estrutura é parte do que se quer ensinar.

## 9. Registro

| Data | O que aconteceu |
|---|---|
| 20/09/2026 | Primeira versão do arquivo, para os móveis-bicho da mecânica de estantes. |
| 21/09/2026 | Ajustado para a mecânica de esteira: mudaram os estados dos bichos, o Tico e a capa. |
| 21/09/2026 | **Capa entregue e implementada:** registrada em `src/data/catalog.ts` como `thumbnail`, e o JPG de compartilhamento gerado em `public/og/o-misterio-do-arquivo-vivo.jpg` (119 KB, dentro do limite de 300 KB do WhatsApp). A `BootScene` ignora arquivos `cover*`, então os 2 MB não entram no carregamento do jogo. |
| 21/09/2026 | Níveis 2 e 3 construídos **sem nenhuma arte nova** (§8). O `carinhas.png` e o `coisas-2.png`, que estavam previstos, foram cortados: os três bichinhos já servem de ponto da teia e de valor de campo, e reconhecê-los em outra estrutura é parte da lição. |
| 21/09/2026 | **Refeito do zero.** O jogo virou encaixe (§2 do `PLANEJAMENTO.md`) e **a arte anterior foi descartada inteira** por decisão do dono do projeto. A mudança estrutural: **as prateleiras e os buracos passaram a ser `Graphics`**, porque o vão da barriga da coruja nunca batia com a grade desenhada por cima — a arte deixou de ter contrato de alinhamento. O "vivo" do título mudou de endereço: saiu dos móveis e foi para o **arquivista**. De sete arquivos para cinco. |
