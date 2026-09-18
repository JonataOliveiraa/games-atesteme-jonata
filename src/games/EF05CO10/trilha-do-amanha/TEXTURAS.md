# Trilha do Amanhã — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO10/trilha-do-amanha/`

**Oito arquivos para jogar, mais a capa do catálogo.**

> **O estilo é o CHIBI DE FIGURINHA**, e a imagem de referência
> [`references/19-chibi-figurinhas.jpg`](../../../../references/19-chibi-figurinhas.jpg)
> vai anexada em **TODAS** as gerações. Cada prompt abaixo já vem inteiro —
> estilo, corpo e negativo —, para ser copiado e colado sem montar nada por cima.

> **A referência tem elenco marcante, e ele vai para o negativo.** A folha
> anexada é de personagens de RPG anime: tapa-olho, chifres, orelhas pontudas,
> roupa ornamentada, cabelo enorme com enfeites, olho que brilha. É o que o
> gerador copia se ninguém proibir, e por isso **todo prompt fecha proibindo o
> elenco**, não só "take ONLY the art style". A folha também tem marca d'água
> escrita — ela entra no negativo junto.

> **Este NÃO é o desenho de criança do `olha-o-jornal` nem o graphic novel do
> `guilda-dos-criadores`.** São três linhas vivas no catálogo, e misturar as três
> num jogo só é o jeito mais rápido de ele sair com cara de colagem:

| | **chibi de figurinha** *(este jogo)* | desenho de criança | graphic novel |
|---|---|---|---|
| **traço** | limpo, espessura **uniforme**, escuro dessaturado | hidrográfica trêmula, espessura irregular | tinta marrom, espessura **variável** |
| **cor** | cel shading **chapado**, um tom de sombra | 100 % chapada, **sem sombra** | cel shading macio, com rebote quente |
| **olho** | **enorme**, com um brilho | pontinho preto | grande, com íris, pupila e brilho |
| **silhueta** | **keyline branca de adesivo** | segura pelo contorno preto | segura pelo contorno de tinta |
| **proporção** | cabeça grande, corpo pequeno | ingênua, sem regra | cabeça **quase** natural, corpo de criança |

> **O jogo roda inteiro com zero PNG.** Cabeçalho, botões `◀ ▶ PULAR USAR`,
> balões, cartelas de frase, painel da oficina, onda de som, seta guia, vidas,
> bolinhas, moldura do cartaz, estrelas e confete nascem em `Graphics`. As
> texturas só trocam o menino, as pessoas, as invenções e as três camadas do
> mundo. A reserva de cada uma está no §12 do `PLANEJAMENTO.md`.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `menino.png` | 1024 × 512 | 4 × 2 de 256 | alfa real | **o mensageiro**, oito quadros |
| 2 | `pessoas.png` | 512 × 768 | 2 × 3 de 256 | alfa real | as três pessoas, esperando e respondendo |
| 3 | `invencoes.png` | 768 × 512 | 3 × 2 de 256 | alfa real | **megafone, telefone, carta** — parada e em uso |
| 4 | `chao.png` | 768 × 192 | imagem única, **emendável** | opaco | a faixa de trilha que se repete |
| 5 | `trilha.png` | 1024 × 256 | 4 × 1 de 256 | alfa real | degrau, caixa, pedra, arbusto |
| 6 | `morros.png` | 1920 × 256 | imagem única, **emendável** | alfa real | a camada do meio |
| 7 | `ceu.png` | 1920 × 768 | 1 × 3 de 1920 × 256 | opaco | as três horas do dia |
| 8 | `oficina.png` | 512 × 512 | imagem única | alfa real | a casinha no fim da trilha |
| 9 | `cover-trilha-do-amanha.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**Ordem de geração:** 1, 3, 4 e 5 primeiro — são os quatro que fazem a fase 1.1
existir. O 2 vem depois (a fase 1.1 usa só a mãe, que é o primeiro par da folha),
e 6, 7, 8 e 9 fecham.

A capa também alimenta `public/og/trilha-do-amanha.jpg` — mesma arte, exportada em
JPG para o compartilhamento.

---

## 1. As cinco regras que governam esta arte

**1. A silhueta tem de ser lida a 36 px de altura.** É o tamanho real do menino
num celular de 390 px. Nada de detalhe que só existe no zoom: o boné é uma forma,
a bolsa é uma forma, e as duas se distinguem uma da outra de longe.

**2. As três invenções não podem ter a mesma silhueta.** Elas são a decisão do
jogo inteiro, e a criança escolhe uma olhando para o desenho:

| Invenção | A forma que a separa |
|---|---|
| **megafone** | um **cone** deitado, boca larga na frente, alça em cima |
| **telefone** | uma **caixa** com um fone deitado em cima e um disco redondo na frente |
| **carta** | um **envelope plano**, retângulo com a aba em V e um selinho no canto |

Cone, caixa e retângulo plano. Três formas que não se confundem nem em miniatura,
nem de costas para a luz.

**3. As invenções NÃO têm rosto.** É a única quebra deliberada da folha de
referência, e tem motivo: elas aparecem **na mão do menino**, e dois rostos chibi
disputando 72 px de tela viram mancha. O menino é quem olha; a invenção é um
objeto bonito e mudo.

**4. Nada de chão, sombra, grama ou cenário preso na figura.** O chão é o arquivo
4. Personagem com chão próprio cria uma emenda visível no instante em que ele
pisa na trilha de verdade.

**5. Nada de interface dentro do PNG.** Nem balão, nem `?`, nem seta, nem brilho
de estado, nem moldura. Tudo isso muda a cada toque e mora no `Graphics`.

### A paleta

| Elemento | Cor de acento | Por quê |
|---|---|---|
| o menino | **laranja-telha** no boné e na bolsa | é a única coisa que se move; precisa saltar do ocre da trilha |
| a trilha e a terra | **ocre e areia** | fundo quente e baixo de contraste, para o menino aparecer |
| o céu | **azul-claro**, virando pêssego no fim da tarde | é a hora do dia, e é o único degradê permitido no jogo |
| os morros | **verde-acinzentado dessaturado** | camada do meio: presente, nunca protagonista |
| **megafone** | **vermelho-coral** | |
| **telefone** | **azul-petróleo** | |
| **carta** | **creme** com selo vermelho | |

As três invenções têm cores que não se repetem em lugar nenhum do cenário. É o
que permite achá-las na bancada sem ler o nome — e o nome está lá embaixo de
qualquer jeito, grande, porque miniatura não ensina nome (§6 do `PLANEJAMENTO`).

---

## 2. `menino.png` — o mensageiro

### Contrato da folha

- **1024 × 512**, grade **4 colunas × 2 linhas** de **256 × 256**, alfa real.
- A ordem dos quadros é o índice do frame, e é contrato com `scenes/mensageiro.ts`:

| # | Quadro | Onde aparece |
|---:|---|---|
| 0 | **parado**, de perfil para a direita | quando ninguém está segurando botão |
| 1 | andar — contato, perna da frente esticada | ciclo de caminhada |
| 2 | andar — passagem, perna recolhida | ciclo de caminhada |
| 3 | andar — contato oposto | ciclo de caminhada |
| 4 | andar — passagem oposta | ciclo de caminhada |
| 5 | **pulo**, joelhos recolhidos, braços para cima | enquanto `body.velocity.y !== 0` |
| 6 | **chamando**, as duas mãos em concha na boca | a abertura de toda fase |
| 7 | **carregando**, um braço levantado segurando nada | a volta da oficina — a invenção entra por cima, em código |

- **Todos os oito quadros na mesma escala, na mesma luz e com os pés na MESMA
  linha.** O pé mais baixo de cada quadro (menos o 5, que está no ar) tem de cair
  no mesmo `y` da célula. É o que impede a figura de saltitar sozinha enquanto
  anda.
- **Perfil voltado para a DIREITA em todos os quadros.** A esquerda é o mesmo
  desenho espelhado em código (`setFlipX`).
- O quadro 7 segura **nada**: a mão fica fechada e levantada, e a invenção é
  desenhada por cima na posição da mão. Um menino por invenção seria três folhas.
- Depois de gerar, **meça a caixa alfa de cada quadro** (o script do
  `PLANEJAMENTO MODAL.md` §7) e ancore por `originY = 1` com o `footPad` medido,
  com **uma escala só para a folha inteira**, tirada da maior altura.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
image: do NOT copy its characters, its clothes, its hair, its poses, its scenes
or its framing.

Sprite sheet, 4 columns by 2 rows, 256x256 px per cell, the same character at
the same scale and the same lighting in every cell, transparent background, no
grid lines drawn, no cell borders, no ground shadow.

The same cheerful CHILD MESSENGER in all eight cells: a small boy about ten
years old, warm brown skin, short dark hair under a soft terracotta-orange cap,
a plain cream shirt, short brown trousers, simple shoes, and a small
terracotta-orange shoulder bag hanging at his hip. He is drawn in SIDE VIEW
facing RIGHT in every single cell. Keep the cap, the bag and the shirt exactly
the same in all eight cells.

Read the cells left to right, top row first:

Row 1 — cell 1: STANDING STILL, side view facing right, both feet flat on the
ground, arms relaxed at his sides, calm friendly face. Cell 2: WALKING, front
leg stretched forward with the heel touching down, back leg stretched behind,
arms swinging in opposition. Cell 3: WALKING, the back leg lifted and folded
under the body passing the standing leg, body a little higher. Cell 4: WALKING,
the mirrored contact step — the other leg stretched forward, arms swapped.

Row 2 — cell 5: WALKING, the mirrored passing step. Cell 6: JUMPING, both knees
pulled up under him, both arms raised, feet off the ground, a happy open mouth.
Cell 7: CALLING OUT, standing still, both hands cupped around his mouth, mouth
wide open, leaning slightly forward, eyebrows up. Cell 8: CARRYING, standing
still, one arm raised high with the hand CLOSED AND EMPTY as if holding
something that is not drawn, the other arm at his side, proud smile.

In every cell except the jump, the lowest foot must sit on exactly the same
horizontal line, so the character does not bob when the frames are played in
sequence. Keep the silhouette bold and simple: the cap, the bag and the legs
must still read when the cell is shrunk to 36 px tall.

DO NOT INCLUDE: anything held in his hands, a megaphone, a telephone, a letter,
a bag full of gear, a backpack, weapons, a sword, a staff, wings, horns, animal
ears, pointed elf ears, an eyepatch, ornate fantasy costume, armour, jewellery,
long flowing anime hair, hair ornaments, glowing eyes, a teenager, an adult,
ground, grass, road, shadow under the feet, scenery, sky,
anime video game characters, character roster sheets, emote sheets,
text, letters, words, labels, digits, numbers, captions, watermark, website
address, artist signature, logo, title lettering, user interface, buttons,
panels, frames, speech bubbles, arrows, icons, stars, HUD,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets,
sad faces, crying, angry faces, scolding adults, pointing at the viewer.
~~~

---

## 3. `pessoas.png` — quem está esperando o recado

### Contrato da folha

- **512 × 768**, grade **2 colunas × 3 linhas** de **256 × 256**, alfa real.
- **Uma pessoa por linha; a coluna é o estado.** Contrato com `data/levels.ts`:

| Linha | Quem | Coluna 1 — **esperando** | Coluna 2 — **respondendo** |
|---:|---|---|---|
| 1 | **a mãe**, na roça | de pé, uma mão na testa fazendo sombra, olhando ao longe | os dois braços para cima, sorrindo grande |
| 2 | **o Bento**, ajudante | de pé, caderninho e lápis nas mãos, olhando em volta | segura o papel aberto, sorrindo, um polegar para cima |
| 3 | **o seu Ari**, feirante | de pé atrás de um caixote de frutas, coçando a cabeça | os dois braços para cima, chapéu levantado |

- **Todas de frente, levemente de três quartos**, viradas para a esquerda (elas
  estão à esquerda do mundo, olhando para quem chega). As três na mesma escala e
  na mesma luz.
- **Os pés das seis células caem na mesma linha.** Elas pisam no mesmo chão.
- **O `?` de "não ouvi" não é desenhado** — ele nasce em `Graphics` acima da
  cabeça, porque pisca e some.
- **O Bento não ganha aparelho auditivo.** Não é omissão: a 36 px reais ele seria
  dois pixels, e o que a criança precisa ver dele é o **caderninho na mão** — o
  que ele *faz*, que é ler e escrever. A informação de que ele não escuta vem da
  fala do tutorial e do balão dele, não de um detalhe invisível.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
image: do NOT copy its characters, its clothes, its hair, its poses, its scenes
or its framing.

Sprite sheet, 2 columns by 3 rows, 256x256 px per cell, the same scale and the
same lighting in every cell, transparent background, no grid lines drawn, no
cell borders, no ground shadow.

Three different friendly village people, ONE PERSON PER ROW, each drawn twice:
the left cell is WAITING, the right cell is ANSWERING HAPPILY. Everyone is drawn
in three-quarter view turned slightly to the LEFT. Keep each person's clothes
and colours identical in both of their cells.

Row 1 — a FARMER MOTHER: a woman with brown skin, dark hair tied back under a
wide straw hat, a simple sage-green work dress and rolled sleeves. Left cell:
standing, one hand shading her eyes, looking into the distance, mouth slightly
open. Right cell: both arms raised high, big warm smile, eyes happy and closed.

Row 2 — a WORKSHOP HELPER BOY: a boy about twelve, light brown skin, short black
hair, a mustard-yellow apron over a white shirt, holding a small notebook in one
hand and a pencil in the other. Left cell: standing, looking around, notebook
held at his chest, calm curious face. Right cell: holding the notebook open
towards the viewer with both hands, big smile, one thumb up.

Row 3 — an OLD MARKET SELLER: a cheerful older man with a grey moustache, warm
dark skin, a soft blue shirt and a straw hat, standing behind a small wooden
crate of round fruit. Left cell: scratching the back of his head, puzzled but
good-humoured. Right cell: both arms raised, hat lifted in one hand, laughing.

All six cells share one ground line: the lowest foot of every person sits at the
same height in its cell. Keep every silhouette bold enough to read at 36 px
tall — the straw hat, the apron and the fruit crate are the three shapes that
tell them apart.

DO NOT INCLUDE: hearing aids, medical devices, sign language hands, sad or
pitying expressions, a megaphone, a telephone, a letter, envelopes,
horns, animal ears, pointed elf ears, an eyepatch, ornate fantasy costume,
armour, jewellery, long flowing anime hair, hair ornaments, glowing eyes,
anime video game characters, character roster sheets, emote sheets,
ground, grass, road, shadow under the feet, scenery, sky, buildings,
text, letters, words, labels, digits, numbers, captions, watermark, website
address, artist signature, logo, title lettering, user interface, buttons,
panels, frames, speech bubbles, arrows, icons, stars, HUD,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets,
crying, angry faces, scolding adults, pointing at the viewer.
~~~

---

## 4. `invencoes.png` — as três, e a decisão do jogo

### Contrato da folha

- **768 × 512**, grade **3 colunas × 2 linhas** de **256 × 256**, alfa real.
- **Uma invenção por coluna; a linha é o estado.** Contrato com `data/invencoes.ts`:

| | Coluna 1 — **megafone** | Coluna 2 — **telefone** | Coluna 3 — **carta** |
|---|---|---|---|
| Linha 1 · **parada** | de pé na bancada, boca para a direita | de pé, fone deitado no gancho | envelope fechado, deitado |
| Linha 2 · **em uso** | inclinado para a frente, boca aberta | fone erguido, fio esticado | envelope com a aba aberta e o papel meio para fora |

- **Sem rosto** — é a regra 3 do §1. Nenhuma das seis células tem olho, boca ou
  sobrancelha.
- **Na mesma escala relativa que elas têm na vida:** o megafone ocupa ~85 % da
  célula, o telefone ~80 %, a carta ~60 %. Tamanho é informação, e normalizar as
  três apaga a diferença.
- Vistas **de três quartos**, nada de perspectiva forte.
- A cor de acento de cada uma **não se repete em lugar nenhum do cenário** (§1).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; big bold simple shapes; a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
image: do NOT copy its characters, its clothes, its poses, its scenes or its
framing.

Sprite sheet, 3 columns by 2 rows, 256x256 px per cell, the same lighting in
every cell, transparent background, no grid lines drawn, no cell borders, no
ground shadow.

Three cute retro communication objects, ONE OBJECT PER COLUMN, each drawn twice:
the top row is the object AT REST, the bottom row is the object IN USE. Every
object is a plain object with NO FACE — no eyes, no mouth, no eyebrows. Drawn in
three-quarter view.

Column 1 — a HAND MEGAPHONE in coral red: a wide cone with a big round opening,
a small handle with a grip on top, a little button on the handle. Top cell: at
rest, standing upright, the wide opening pointing to the right. Bottom cell: in
use, tilted forward, the opening pushed towards the right.

Column 2 — an OLD DESK TELEPHONE in deep teal blue: a solid rectangular body
with a round dial on its front and a curved handset lying on a cradle on top.
Top cell: at rest, the handset resting on the cradle. Bottom cell: in use, the
handset lifted up above the body with a short curly cord stretching between
them.

Column 3 — a PAPER LETTER in cream white with a small red stamp in one corner: a
flat rectangular envelope with a triangular flap. Top cell: at rest, the
envelope closed and lying flat. Bottom cell: in use, the flap open and a folded
sheet of paper sliding halfway out.

Their three silhouettes must never be confused: the megaphone is a CONE, the
telephone is a BOX with a handset on top, the letter is a FLAT RECTANGLE. Keep
each one readable when the cell is shrunk to 72 px wide. Draw them at their
true relative sizes — the megaphone is the largest, the letter is the smallest.

DO NOT INCLUDE: faces on the objects, eyes, mouths, eyebrows, smiling objects,
cute mascots, hands holding the objects, arms, characters, mobile phones,
smartphones, screens, radios, computers, modern electronics,
ground, table, desk, shadow under the object, scenery, background,
horns, wings, animal ears, pointed elf ears, ornate fantasy decoration,
anime video game characters, character roster sheets, emote sheets,
text, letters, words, labels, digits, numbers, captions, handwriting on the
paper, stamps with writing, watermark, website address, artist signature, logo,
title lettering, user interface, buttons, panels, frames, speech bubbles,
arrows, icons, stars, HUD,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets.
~~~

---

## 5. `chao.png` — a faixa que se repete

### Contrato

- **768 × 192**, imagem única, **opaca**, e **emendável na horizontal**: a borda
  direita encosta na esquerda sem costura visível. É um `tileSprite` de 3840 de
  largura.
- **Só o chão.** Os 24 px de cima são a superfície pisável (terra batida clara);
  o resto é a terra de baixo, mais escura, com pedrinhas e raízes.
- **Nenhum objeto alto, nenhuma planta que suba, nenhuma sombra de nada.** Tudo
  que fica em cima da trilha é o arquivo 5.
- Contraste baixo e quente: é o que deixa o menino de laranja saltar.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: clean crisp line art of even weight in a dark desaturated
colour, never pure black; FLAT cel shading with ONE soft shadow tone and no
gradients; a short warm palette; crisp shapes, no painterly brushwork. NO white
sticker keyline here — this is a full scene, not a sticker. Take ONLY the art
style from the attached image: do NOT copy its characters, its poses, its
scenes or its framing.

A SEAMLESS HORIZONTAL GROUND STRIP, 768x192 px, meant to be tiled side by side
forever: the right edge must continue perfectly into the left edge with no visible
seam, no border and no vignette.

Side view cross-section of a dirt path: the top 24 px are the flat walkable
surface in pale warm sand colour with a soft darker line along its top edge; the
rest is packed ochre earth below, with a few small rounded pebbles, a couple of
thin root lines and two or three darker earth patches scattered irregularly so
the repeat is not obvious. Low contrast and warm throughout.

DO NOT INCLUDE: grass blades sticking up, plants, bushes, trees, flowers, rocks
taller than a pebble, boxes, crates, steps, fences, characters, animals, water,
sky, horizon, clouds, buildings, roads, tyre tracks, footprints,
white sticker keyline, sticker border, vignette, dark edges, frame,
text, letters, words, labels, digits, numbers, captions, watermark, website
address, artist signature, logo, user interface, buttons, panels, arrows, icons,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
rough sketchy lines, uneven brush outlines, muddy colours, 3D render,
photorealistic, blur, lens flare, heavy noise, visible tiling seam.
~~~

---

## 6. `trilha.png` — o que fica em cima da trilha

### Contrato da folha

- **1024 × 256**, grade **4 colunas × 1 linha** de **256 × 256**, alfa real.

| # | Objeto | Altura real | Serve para |
|---:|---|---:|---|
| 0 | **degrau** de pedra | **40 px** | o caminho alternativo de toda caixa (§6½ do `PLANEJAMENTO`) |
| 1 | **caixa** de madeira | **80 px** | o teto do pulo útil; é onde uma coisa pode ficar em cima |
| 2 | **pedra** arredondada | **56 px** | variedade; nada fica em cima dela |
| 3 | **arbusto** baixo | **48 px** | enfeite; não é sólido |

- **A altura de cada objeto dentro da célula é contrato**, não sugestão: o §8
  valida que nenhum obstáculo passa de 80 px, e o degrau existe para que o pulo
  nunca seja obrigatório.
- Todos **apoiados na base da célula**, sem sombra e sem chão próprio.
- Vistos **de lado**, na mesma luz do menino (luz vindo de cima e um pouco da
  esquerda).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; big bold simple shapes; a short warm palette; a
thin white sticker keyline around the whole silhouette. Take ONLY the art style
from the attached image: do NOT copy its characters, its poses, its scenes or
its framing.

Sprite sheet, 4 columns by 1 row, 256x256 px per cell, the same lighting in
every cell, transparent background, no grid lines drawn, no cell borders, no
ground shadow. Every object rests on the bottom edge of its own cell.

Four simple roadside objects, seen from the SIDE, lit from above and slightly
from the left:

Cell 1: a low flat STONE STEP, a single wide block of pale grey stone with a
softly chipped top, clearly short — about one fifth as tall as the cell.

Cell 2: a WOODEN CRATE, a cube of warm brown planks with visible boards and
darker corner braces, clearly taller than the step — about one third as tall as
the cell, with a flat top that something could stand on.

Cell 3: a rounded grey BOULDER, smooth, wider than it is tall, with one lighter
patch on top.

Cell 4: a small round BUSH of muted sage-green leaves, low and wide, no flowers.

All four must read as clearly different heights when lined up: the step is the
shortest, then the bush, then the boulder, and the crate is the tallest.

DO NOT INCLUDE: faces, eyes, characters, animals, people, grass under the
objects, ground, dirt, road, shadow under the objects, sky, background, scenery,
flowers, mushrooms, signs, fences, treasure, coins,
horns, wings, ornate fantasy decoration,
anime video game characters, character roster sheets, emote sheets,
text, letters, words, labels, digits, numbers, captions, watermark, website
address, artist signature, logo, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, HUD,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets.
~~~

---

## 7. `morros.png` — a camada do meio

### Contrato

- **1920 × 256**, alfa real (ela fica **sobre** o céu), **emendável na
  horizontal**, `scrollFactor 0,55`.
- **Só a linha de morros**, encostada na base da imagem. O topo da imagem é
  transparente.
- **Verde-acinzentado bem dessaturado, duas fileiras**: a de trás mais clara e
  mais azulada, a da frente um pouco mais escura. É a única profundidade do jogo,
  e ela não pode competir com nada.
- Nenhuma casa, nenhuma torre, nenhum caminho: a única construção do mundo é a
  oficina (arquivo 8), e ela entra separada.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: clean crisp line art of even weight in a dark desaturated
colour, never pure black; FLAT cel shading with ONE soft shadow tone and no
gradients; a short muted palette; crisp shapes, no painterly brushwork. NO white
sticker keyline here — this is a scenery layer, not a sticker. Take ONLY the art
style from the attached image: do NOT copy its characters, its poses, its scenes
or its framing.

A SEAMLESS HORIZONTAL SCENERY LAYER, 1920x256 px, transparent background, meant
to be tiled side by side forever: the right edge must continue perfectly into the
left edge with no visible seam.

Two overlapping rows of soft rolling HILLS sitting along the bottom of the
image, in muted desaturated sage green: the far row paler and slightly bluer,
the near row a little darker and a little taller, with a few simple clumps of
darker foliage along their tops. The hills fill only the lower part of the
image; everything above them is fully transparent. Gentle irregular heights so
the repeat does not read as a pattern. Very low contrast — this layer must sit
quietly behind everything else.

DO NOT INCLUDE: houses, huts, buildings, towers, windmills, fences, roads,
paths, bridges, characters, people, animals, birds, sky, clouds, sun, moon,
stars, water, rivers, lakes, foreground detail, large trees in front,
white sticker keyline, sticker border, vignette, dark edges, frame,
text, letters, words, labels, digits, numbers, captions, watermark, website
address, artist signature, logo, user interface, buttons, panels, arrows, icons,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
rough sketchy lines, uneven brush outlines, muddy colours, 3D render,
photorealistic, blur, lens flare, heavy noise, visible tiling seam.
~~~

---

## 8. `ceu.png` — as três horas do dia

### Contrato da folha

- **1920 × 768**, grade **1 coluna × 3 linhas** de **1920 × 256**, opaca. Cada
  linha é uma faixa emendável na horizontal.

| Linha | Fase | A hora |
|---:|---|---|
| 0 | **1.1** | **manhã** — azul-claro limpo, nuvens brancas altas e esparsas |
| 1 | **1.2** | **meio-dia** — azul mais forte, quase sem nuvem, luz alta |
| 2 | **1.3** | **fim de tarde** — pêssego virando lilás no alto, nuvens douradas baixas |

- É o **único degradê permitido no jogo** — e ele é vertical, dentro de cada
  faixa. Todo o resto é cel shading chapado.
- `scrollFactor 0,25`, sem nada que a criança precise olhar: nem sol desenhado,
  nem lua, nem pássaro. A lua da carta é `Graphics`, porque ela atravessa a tela
  numa animação.
- As três faixas têm de emendar **na horizontal**; não precisam emendar entre si.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: clean crisp shapes with flat colour; clouds drawn as simple
rounded shapes with ONE soft shadow tone and no heavy rendering; a short calm
palette; no painterly brushwork. NO white sticker keyline here — this is a
scenery layer, not a sticker. Take ONLY the art style from the attached image:
do NOT copy its characters, its poses, its scenes or its framing.

Sprite sheet, 1 column by 3 rows, 1920x256 px per cell, no grid lines drawn, no
cell borders. Each row is a SEAMLESS HORIZONTAL SKY STRIP: its right edge must
continue perfectly into its left edge with no visible seam.

Row 1 — MORNING SKY: clean light blue with a gentle vertical fade to paler blue
near the bottom, a few small white rounded clouds high up, widely and
irregularly spaced.

Row 2 — MIDDAY SKY: a stronger clear blue with a gentle vertical fade, almost no
clouds, just two or three very small flat white ones.

Row 3 — LATE AFTERNOON SKY: a warm peach glow along the bottom fading up into
soft lilac at the top, with a band of low golden clouds stretched horizontally
and irregularly spaced.

The vertical fade inside each strip is the only gradient allowed. Keep every
strip calm and low contrast: game characters will be drawn on top of it.

DO NOT INCLUDE: sun, moon, stars, rainbows, birds, aeroplanes, kites, balloons,
hills, mountains, trees, ground, horizon line, buildings, characters, people,
animals, rain, lightning, dramatic storm clouds,
white sticker keyline, sticker border, vignette, dark edges, frame,
text, letters, words, labels, digits, numbers, captions, watermark, website
address, artist signature, logo, user interface, buttons, panels, arrows, icons,
painterly lineless illustration, heavy rendering, rough sketchy lines, uneven
brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, visible tiling seam, grid lines, visible sprite-sheet borders.
~~~

---

## 9. `oficina.png` — a casinha no fim da trilha

### Contrato

- **512 × 512**, imagem única, alfa real, apoiada na base.
- É o **destino visível**: tem de ser reconhecível de longe, na borda da tela,
  quando a criança ainda está a duas telas de distância. Silhueta com um telhado
  inclinado e uma chaminé curta — a forma que diz "é ali".
- **Uma porta larga e aberta, escura por dentro.** É por ali que o menino entra,
  e é o escuro que faz o painel da oficina (que é `Graphics`) parecer a
  continuação natural da casinha.
- **Nada dentro dela.** As três invenções são o arquivo 3, desenhadas por cima em
  código. Uma bancada desenhada dentro da porta apareceria atrás do painel e
  brigaria com ele.
- Sem chão, sem sombra, sem cerca, sem caminho de pedrinhas na frente.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; big bold simple shapes; a short warm palette; a
thin white sticker keyline around the whole silhouette. Take ONLY the art style
from the attached image: do NOT copy its characters, its poses, its scenes or
its framing.

A single small WORKSHOP HUT, seen from the side and slightly in front, resting
on the bottom edge of a 512x512 transparent image, no ground and no shadow
drawn under it.

A cosy little wooden workshop: warm brown plank walls, a steep terracotta-red
sloped roof with a short stubby chimney, one round window on the side with
simple shutters, and ONE WIDE OPEN DOORWAY in the front whose inside is dark and
empty. A couple of simple tools — a saw and a hammer — hang flat on the outside
wall beside the door. The building is friendly and slightly chunky, never
realistic.

The silhouette must be recognisable from far away at the edge of a screen: keep
the sloped roof, the chimney and the wide dark doorway as the three clear shapes.

DO NOT INCLUDE: anything inside the doorway, a workbench, shelves, tools inside,
a megaphone, a telephone, a letter, characters, people, animals, ground, grass,
path, stepping stones, fence, garden, flowers, trees, sky, clouds, smoke,
shadow under the building, factory, smokestack, modern machinery, satellite
dish, antenna, power lines,
horns, wings, ornate fantasy decoration, fairy-tale mushroom house,
anime video game characters, character roster sheets, emote sheets,
text, letters, words, labels, digits, numbers, captions, signboard, shop sign,
watermark, website address, artist signature, logo, title lettering, user
interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
drop shadow, white backing in transparent assets.
~~~

---

## 10. `cover-trilha-do-amanha.png` — a capa

### Contrato

- **1672 × 941**, imagem única, opaca. **Sem texto** — o título entra no
  `Graphics` do catálogo.
- A capa tem de contar o jogo **em miniatura**: o menino no meio da trilha, de
  costas para quem olha, indo para a direita com o megafone levantado; ao longe,
  à esquerda, a figura pequena da mãe acenando; à direita, no alto da subida, a
  oficina. A leitura é *alguém lá longe, alguém indo buscar um jeito*.
- Céu de fim de tarde, que é o mais bonito dos três.
- **Nada de keyline branca** — é cena inteira.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: cute chibi art; clean crisp line art of even weight in a dark
desaturated colour, never pure black; FLAT cel shading with ONE soft shadow tone
and no gradients; small chibi proportions, big head and little body; big glossy
expressive eyes with a bright highlight; a short warm palette; crisp shapes, no
painterly brushwork. NO white sticker keyline here — this is a full scene, not a
sticker. Take ONLY the art style from the attached image: do NOT copy its
characters, its clothes, its hair, its poses, its scenes or its framing.

Wide cover illustration, 16:9, a warm late-afternoon scene that must read at
thumbnail size.

In the CENTRE, a small boy messenger about ten years old — warm brown skin, a
terracotta-orange cap, a cream shirt, a small orange shoulder bag — walking to
the right along a sandy dirt path, holding a coral-red megaphone raised in one
hand, looking back over his shoulder with a determined smile.

FAR LEFT and much smaller, on the other side of a wide shallow valley, a woman
in a straw hat waving with both arms.

UPPER RIGHT and smaller, at the top of the rising path, a cosy little wooden
workshop hut with a terracotta-red sloped roof and a wide dark doorway.

Behind everything, two rows of muted sage-green rolling hills and a peach and
lilac late-afternoon sky with low golden clouds. The empty middle band of the
sky stays calm and uncluttered.

The story must be readable at thumbnail size: someone far away on the left,
someone setting off to reach them on the right.

DO NOT INCLUDE: text, letters, words, title lettering, labels, digits, numbers,
captions, signboards, watermark, website address, artist signature, logo, user
interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD,
sound waves drawn in the air, telephone, envelope, drone, satellite, modern
technology, cars, power lines, crowds, many characters,
horns, wings, animal ears, pointed elf ears, an eyepatch, ornate fantasy
costume, armour, jewellery, long flowing anime hair, hair ornaments, glowing
eyes, teenagers, adults as the main figure,
anime video game characters, character roster sheets, emote sheets,
white sticker keyline, sticker border, vignette, dark edges, frame,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
sad faces, crying, angry faces, scolding adults, pointing at the viewer.
~~~

---

## 11. Depois de gerar

1. **Transparência.** Se o gerador não entregar alfa, peça sobre magenta
   `#FF00FF` chapado e remova a cor. Fundo branco é pior: branco é a cor da
   camisa, da carta e do `keyline`.
2. **Meça a caixa alfa** de `menino.png`, `pessoas.png`, `invencoes.png` e
   `trilha.png` com o script do `PLANEJAMENTO MODAL.md` §7. Não estime.
   - do `menino.png` saem `originX` por quadro (centro da caixa, não da célula) e
     o `footPad` para `originY = 1`. Sem isso ele desliza de lado e afunda no chão
     a cada troca de quadro do andar;
   - de `trilha.png` sai a **altura real** de cada obstáculo, que o §8 do
     `PLANEJAMENTO` valida contra o teto de 80 px;
   - **uma escala só por folha**, tirada da maior altura medida.
3. **Amostre a cor** da arte com `GetPixel` no mesmo script. O `Graphics` do
   cabeçalho, dos botões e das cartelas tem de falar a mesma língua do PNG; cor
   escolhida à parte nunca casa.
4. **Teste a emenda** de `chao.png`, `morros.png` e das três faixas de `ceu.png`
   antes de aceitar: dois `tileSprite` lado a lado e a câmera andando os 3840.
5. **Olhe no celular, a 390 px**, antes de qualquer outra coisa: o menino a 36 px
   de altura e as três invenções a 72 px de largura. Se duas invenções se
   confundirem nesse tamanho, o problema é a silhueta, e é de graça consertar
   agora.
