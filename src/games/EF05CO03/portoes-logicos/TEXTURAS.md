# Portões Lógicos — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO03/portoes-logicos/`

**Quatro arquivos para jogar, mais a capa do catálogo.**

> **Este jogo sai do estilo padrão do projeto, de propósito.** O
> `references/ESTILO.md` manda anexar a ilustração pintada das três crianças —
> pintura macia, volume aerografado, grão. Aqui o estilo é **chibi, chapado e
> simples, com contorno colorido**, e por isso **a imagem de referência antiga
> NÃO vai anexada**: ela brigaria com tudo que estes prompts pedem. Escolha do
> dono do projeto, decidida em 17/09/2026. Não “consertar” de volta.
>
> Ganho concreto, além do gosto: a criaturinha tem 42 px reais no celular. Forma
> grande, cor chapada e contorno próprio leem nesse tamanho; volume macio sem
> contorno vira mancha.

> **Ordem de geração:** faça a folha `criaturinhas.png` primeiro. Aprovada, ela
> passa a ser **o anexo de referência de estilo dos outros quatro prompts** — é
> assim que portão, curral, cenário e capa saem do mesmo mundo. Onde o prompt
> diz “the attached image”, é essa folha.

> **Os atributos das criaturinhas são a regra do jogo.** Se o gerador puser
> óculos em quem não deve ter, a lógica quebra em silêncio e a criança leva uma
> trava injusta. A conferência atributo por atributo é obrigatória, e quem manda
> é a arte: se a folha vier diferente, muda a tabela em `data/criaturas.ts`,
> nunca a folha.

> **O jogo roda inteiro com zero PNG.** A trilha, o marco de altura, as placas,
> a faixa `NÃO`, os carimbos, o cadeado, a poeira e a UI nascem em `Graphics`.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `criaturinhas.png` | 1280 × 512 | 5 × 2 de 256 | alfa real | as 8 criaturinhas + o chapéu e os óculos soltos |
| 2 | `portao.png` | 1024 × 512 | 2 × 1 de 512 | alfa real | o portão fechado e o portão aberto |
| 3 | `curral.png` | 512 × 420 | imagem única | alfa real | a cerca do curral, vazia — usada duas vezes |
| 4 | `bg-fazendinha.png` | 1920 × 1080 | imagem única | opaco | a fazendinha, **sem trilha e sem portão** |
| 5 | `cover-portoes-logicos.png` | 1:1 | imagem única | opaco | a capa do catálogo |

Cinco gerações. As oito criaturinhas cabem numa folha só porque **a célula é a
unidade de custo, não a personagem** — e as duas células que sobram na grade de
5 × 2 pagam os ícones de `chapéu` e `óculos` que vão dentro das placas.

**O #1 carrega a mecânica** e é o primeiro a ser gerado, porque vira a
referência dos outros. Cor, chapéu e óculos são os termos que a criança avalia.
O **tamanho não vem na arte**: as oito são desenhadas do mesmo tamanho e quem
encolhe as `pequena` é o código, para que a diferença seja exata e para que o
marco de altura ao lado da bifurcação sempre bata.

**O #4 pode esperar.** Sem ele, a fazendinha é um degradê de campo com morros em
blocos, e o jogo continua inteiro.

### O que é `Graphics`, e por quê

- **a trilha inteira** e a bifurcação — é por onde o tween anda, e um caminho
  pintado no fundo nunca bate no pixel com a criaturinha que caminha sobre ele;
- **o marco de altura**, com as listras e o traço da altura-limite;
- **a placa e tudo dentro dela**: ícones dos termos, a palavra do operador, a
  tarja pequena do `NÃO` de termo, a faixa vermelha do `NÃO` de frase, os ✓ e ✗
  que acendem termo a termo e os carimbos `VERDADEIRO` / `FALSO`;
- **o cadeado** da trava e o piscar do portão certo;
- poeira da marcha, festinha do curral, confete, balão, bolinhas de onda, `?`,
  estrelas.

> **Nenhuma letra e nenhum número em PNG nenhum.** A placa é a coisa que mais
> muda no jogo: ela troca de frase a cada onda e acende parte por parte.

---

## 1. O bloco de estilo

Vem inteiro dentro de cada prompt — não tem que montar nada. Existem duas
versões, e a diferença é só o trecho das proporções.

**Versão personagem** (criaturinhas e capa):

```
STYLE — cute chibi children's-game illustration: big round head about one third
of the total height, tiny stubby body and limbs, large glossy eyes with a single
bright highlight, tiny simple mouth, round blushed cheeks. FLAT bright colours
with one soft simple shadow shape and one gentle highlight — no airbrushed
gradients, no texture, no grain. Very simple clean shapes, few details, no
patterns, no small props. Cheerful warm palette.
Every shape is enclosed by a soft COLOURED outline: a darker tone of that
shape's own colour, even weight, never black and never grey, so each figure
keeps a clear silhouette at small sizes.
```

**Versão objeto e cenário** (portão, curral, fazendinha):

```
STYLE — cute chibi children's-game illustration: very simple rounded chunky
shapes, FLAT bright colours with one soft simple shadow shape and one gentle
highlight — no airbrushed gradients, no texture, no grain. Few details, no
patterns, no clutter. Cheerful warm palette.
Every shape is enclosed by a soft COLOURED outline: a darker tone of that
shape's own colour, even weight, never black and never grey.
```

Da segunda geração em diante, o bloco ganha mais uma linha, já escrita nos
prompts: usar a folha das criaturinhas como referência de acabamento.

## 2. Ordem das células de `criaturinhas.png`

| Célula | Nome | Cor | Chapéu | Óculos | Tamanho (no código) |
|---:|---|---|:---:|:---:|---|
| 0 | Bibi | azul | sim | não | grande |
| 1 | Tuto | azul | não | sim | pequena |
| 2 | Zeca | azul | sim | sim | pequena |
| 3 | Mila | verde | não | não | grande |
| 4 | Nino | verde | sim | não | pequena |
| 5 | Pipa | vermelha | não | sim | grande |
| 6 | Lelê | vermelha | sim | não | pequena |
| 7 | Dudu | verde | não | sim | grande |
| 8 | — | ícone do termo `chapéu`: o chapéu sozinho | | | |
| 9 | — | ícone do termo `óculos`: os óculos sozinhos | | | |

A coluna do tamanho está aqui só para o desenvolvedor: **na folha, as oito têm
exatamente o mesmo tamanho.**

## 3. As três regras que governam esta arte

> **1. O acessório tem a mesma forma em todo mundo.**

A criança precisa reconhecer `chapéu` como *a mesma coisa* em qualquer
criaturinha, senão o termo deixa de ser um termo. Corpo, orelha, olho e boca
variam à vontade; **chapéu e óculos não** — e os das células 8 e 9 são
exatamente os mesmos modelos.

> **2. A cor do corpo é chapada e inequívoca.**

`é azul` vira discussão se o corpo for turquesa malhado. Azul, verde e vermelho
têm de ser separáveis de relance com a criaturinha reduzida a 42 px reais, e a
cor ocupa o corpo inteiro. O contorno é um tom mais escuro **dessa mesma cor** —
o azul tem contorno azul-escuro, nunca preto, senão as três cores encostam.

> **3. Ninguém traz chão.**

Sem sombra embaixo, sem grama, sem pedrinha, sem trecho de trilha. A trilha é
`Graphics` e as criaturinhas andam por cima dela; PNG com chão próprio cria a
emenda que o olho acha primeiro.

---

## 4. `criaturinhas.png` — as oito e os dois ícones

### Contrato da folha

- 5 × 2 células de 256 × 256, alfa real;
- mesma escala, mesmo nível dos olhos e mesma luz nas oito criaturinhas;
- corpo inteiro, pés dentro da célula — **o alinhamento no jogo é pelos pés**;
- de três quartos, viradas para a **direita**, que é o lado para onde marcham.

### Prompt copiável

~~~text
STYLE — cute chibi children's-game illustration: big round head about one third
of the total height, tiny stubby body and limbs, large glossy eyes with a single
bright highlight, tiny simple mouth, round blushed cheeks. FLAT bright colours
with one soft simple shadow shape and one gentle highlight — no airbrushed
gradients, no texture, no grain. Very simple clean shapes, few details, no
patterns, no small props. Cheerful warm palette.
Every shape is enclosed by a soft COLOURED outline: a darker tone of that
shape's own colour, even weight, never black and never grey, so each figure
keeps a clear silhouette at small sizes.

Sprite sheet, 5 columns by 2 rows, 256x256 px per cell, on a transparent
background, no ground, no shadow.

Cells 1 to 8 are eight cute chibi creatures, one per cell, full body, standing
on two short stubby legs, three-quarter view facing RIGHT, cheerful calm
expression, walking-ready pose. Every creature at the SAME size, the SAME eye
level and the SAME lighting. Each body is one single flat solid colour.
Cell 1: BLUE body, wearing a cap, no glasses.
Cell 2: BLUE body, no cap, wearing glasses.
Cell 3: BLUE body, wearing a cap, wearing glasses.
Cell 4: GREEN body, no cap, no glasses.
Cell 5: GREEN body, wearing a cap, no glasses.
Cell 6: RED body, no cap, wearing glasses.
Cell 7: RED body, wearing a cap, no glasses.
Cell 8: GREEN body, no cap, wearing glasses.
Cell 9: the same cap ALONE, no creature, three-quarter view, centred.
Cell 10: the same pair of glasses ALONE, no creature, front facing, centred.

CRITICAL: all eight creatures are exactly the same size. Do not make any of
them bigger or smaller than the others.
CRITICAL: the body colour is flat and solid and covers the whole body; blue,
green and red must be obviously different from each other, and each creature's
outline is a darker tone of its own body colour.
CRITICAL: every cap is the same shape and colour on every creature, and every
pair of glasses is the same shape on every creature, identical to cells 9 and 10.
CRITICAL: no creature wears any accessory that is not listed for its cell.
Vary body shape, ears, eyes and mouth freely so the eight look like different
individuals.

DO NOT INCLUDE: realistic proportions, small heads, tall slim bodies, adult
proportions, airbrushed gradients, soft painted rendering, textured brush
strokes, film grain, noise, semi-realistic faces, 3D render, photorealistic,
blur, lens flare, black ink outlines, grey outlines, dark neutral outlines,
heavy lineart, comic line art, anime style,
extra accessories, scarves, bows, ribbons, collars, hats other than the listed
cap, glasses other than the listed ones, patterned or spotted or striped
bodies, gradients across the body, creatures of different sizes,
ground, floor, grass, path, pebbles, shadow under the feet, background scenery,
held objects, wings, teeth, claws, scary features,
text, letters, words, labels, digits, numbers, captions, watermark, logo,
user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
cropped feet, drop shadow on the cell, white backing,
sad faces, crying, angry faces, monsters, pointing at the viewer.
~~~

### Conferência

- [ ] os oito atributos conferidos **um por um** contra a tabela da §2;
- [ ] nenhum acessório extra em ninguém;
- [ ] azul, verde e vermelho separáveis com a criaturinha reduzida a 42 px;
- [ ] contorno na cor do corpo, sem nenhum preto ou cinza na folha;
- [ ] chapéu e óculos com a mesma forma nas oito e iguais aos das células 9 e 10;
- [ ] as oito do **mesmo tamanho** na folha;
- [ ] todas viradas para a direita;
- [ ] pés inteiros dentro da célula, alfa real, sem chão e sem sombra;
- [ ] **aprovada? então ela vira o anexo dos quatro prompts seguintes.**

---

## 5. `portao.png` — o portão, fechado e aberto

### Contrato da folha

- 2 × 1 células de 512 × 512, alfa real;
- célula 1 fechado, célula 2 aberto, **na mesma posição e com a mesma moldura**:
  o jogo troca de quadro e só a folha do portão pode ter mudado;
- **sem placa e sem tabuleta**. A placa é `Graphics` e fica ao lado.

### Prompt copiável

~~~text
STYLE — cute chibi children's-game illustration: very simple rounded chunky
shapes, FLAT bright colours with one soft simple shadow shape and one gentle
highlight — no airbrushed gradients, no texture, no grain. Few details, no
patterns, no clutter. Cheerful warm palette.
Every shape is enclosed by a soft COLOURED outline: a darker tone of that
shape's own colour, even weight, never black and never grey.
USE THE ATTACHED IMAGE as the reference for this exact finish: match its flat
colours, its outline weight and colour logic, and its level of simplicity.

Sprite sheet, 2 columns by 1 row, 512x512 px per cell, on a transparent
background, no ground, no shadow. A small friendly wooden farm gate set in a
simple chunky archway, seen straight on from the front, in warm wood tones,
built from very few simple rounded shapes.
Cell 1: the gate CLOSED, the wooden door filling the archway.
Cell 2: the exact same archway, with the gate OPEN, the wooden door swung
inward to one side, showing the empty opening.

CRITICAL: the archway is pixel-identical in both cells, in the same position
and at the same size. Only the wooden door moves.
CRITICAL: there is no sign, no board and no plaque anywhere on or above the
gate; the top of the archway is bare.

DO NOT INCLUDE: airbrushed gradients, soft painted rendering, textured brush
strokes, wood grain texture, film grain, noise, 3D render, photorealistic,
blur, lens flare, black ink outlines, grey outlines, heavy lineart,
sign, signboard, plaque, banner, nameplate, board above the gate, flags,
bunting, lanterns, characters, creatures, animals, people,
ground, floor, grass, path, fence continuing sideways, shadow, background
scenery,
text, letters, words, digits, numbers, watermark, logo, user interface,
arrows, icons, stars, padlock, chain, bolt,
grid lines, visible sprite-sheet borders, cell borders, cropped edges,
drop shadow on the cell, white backing.
~~~

### Conferência

- [ ] as duas células com a moldura na mesma posição — alternar os quadros não
      pode fazer o portão pular;
- [ ] mesmo peso de contorno das criaturinhas;
- [ ] nenhuma tabuleta, nenhum cadeado desenhado;
- [ ] o vão aberto mostra transparência, não fundo pintado;
- [ ] legível a 24 × 48 px reais.

---

## 6. `curral.png` — o curral vazio

### Contrato

Uma imagem só, usada nos dois currais. Cerca baixa em meia-lua, vista de frente
e ligeiramente de cima, **aberta para a esquerda** (é por onde as criaturinhas
entram). Vazia: quem enche é o código.

### Prompt copiável

~~~text
STYLE — cute chibi children's-game illustration: very simple rounded chunky
shapes, FLAT bright colours with one soft simple shadow shape and one gentle
highlight — no airbrushed gradients, no texture, no grain. Few details, no
patterns, no clutter. Cheerful warm palette.
Every shape is enclosed by a soft COLOURED outline: a darker tone of that
shape's own colour, even weight, never black and never grey.
USE THE ATTACHED IMAGE as the reference for this exact finish: match its flat
colours, its outline weight and colour logic, and its level of simplicity.

A small empty farm pen, seen from the front and slightly from above: a low
chunky rounded wooden fence curving like a half-moon, open on the LEFT side,
with a flat patch of soft green grass inside it. Warm wood tones and gentle
green, built from very few simple shapes. Isolated on a transparent background,
nothing outside the fence.

CRITICAL: the pen is completely EMPTY — no animals, no creatures, no people,
nothing standing inside it.
CRITICAL: the left side is open, with no fence closing it.
CRITICAL: the grass inside is a flat light colour, because up to eight
creatures will be drawn on top of it.

DO NOT INCLUDE: airbrushed gradients, soft painted rendering, textured brush
strokes, grass texture, film grain, noise, 3D render, photorealistic, blur,
black ink outlines, grey outlines, heavy lineart,
animals, creatures, people, characters, sign, signboard, plaque, nameplate,
gate, trough, hay bale, bucket, flowers in the way,
surrounding landscape, sky, shadow outside the fence,
text, letters, words, digits, numbers, watermark, logo, user interface,
arrows, icons, stars,
cropped edges, white backing in the transparent area.
~~~

### Conferência

- [ ] vazio de verdade;
- [ ] aberto à esquerda;
- [ ] a grama de dentro é clara e chapada o bastante para oito criaturinhas por
      cima;
- [ ] alfa real fora da cerca.

---

## 7. `bg-fazendinha.png` — a fazendinha

### Contrato

16:9, opaco, **sem trilha, sem portão, sem curral e sem criaturinha**. Só o
campo. Tudo que o jogo desenha por cima precisa de um fundo calmo: a faixa do
meio recebe a trilha e as duas placas grandes, e a direita recebe os currais.

Num estilo chapado, “calmo” é literal: poucas faixas de cor, sem textura de
grama, sem nuvem detalhada.

### Prompt copiável

~~~text
STYLE — cute chibi children's-game illustration: very simple rounded chunky
shapes, FLAT bright colours with one soft simple shadow shape and one gentle
highlight — no airbrushed gradients, no texture, no grain. Few details, no
patterns, no clutter. Cheerful warm palette.
Every shape is enclosed by a soft COLOURED outline: a darker tone of that
shape's own colour, even weight, never black and never grey.
USE THE ATTACHED IMAGE as the reference for this exact finish: match its flat
colours, its outline weight and colour logic, and its level of simplicity.

Draw a wide horizontal background illustration, 16:9, opaque, of a cheerful
little countryside farm on a sunny morning, seen straight on, with NO
characters at all, built from very few flat bands of colour.
Top band: a flat warm sky with two or three simple rounded clouds, and soft
rounded green hills, with a couple of simple round trees far away.
Middle and bottom bands: one wide open field of FLAT soft green, running from
edge to edge, with no texture and no detail.

CRITICAL: there is NO path, NO track, NO road and NO trail of any kind. The
field is unbroken flat green.
CRITICAL: there is no gate, no pen, no fence, no barn and no building anywhere.
CRITICAL: the middle of the image and the whole right half will be covered by
game elements, so they must be flat, calm and free of any detail.

DO NOT INCLUDE: airbrushed gradients, soft painted rendering, textured brush
strokes, grass texture, flowers scattered in the field, film grain, noise,
3D render, photorealistic, blur, lens flare, black ink outlines, grey outlines,
heavy lineart,
path, dirt track, road, trail, stepping stones, fences, gates, pens, barns,
houses, windmills, haystacks, characters, creatures, animals, people,
silhouettes, signs, banners, flags with writing,
text, letters, words, digits, numbers, watermark, logo, user interface,
high contrast details in the centre or on the right, dark shadows.
~~~

### Conferência

- [ ] nenhum caminho pintado — a trilha é `Graphics` e não pode disputar com
      outro caminho no fundo;
- [ ] metade direita chapada o bastante para dois currais e duas placas grandes;
- [ ] 16:9, nada importante nos 5 % das bordas;
- [ ] mesmo peso de contorno e mesma simplicidade das criaturinhas.

---

## 8. `cover-portoes-logicos.png` — a capa

### Contrato

A capa mostra **a escolha**: uma criaturinha diante de dois portões. Uma capa de
fazendinha bonita não diz que jogo é este.

### Prompt copiável

~~~text
STYLE — cute chibi children's-game illustration: big round head about one third
of the total height, tiny stubby body and limbs, large glossy eyes with a single
bright highlight, tiny simple mouth, round blushed cheeks. FLAT bright colours
with one soft simple shadow shape and one gentle highlight — no airbrushed
gradients, no texture, no grain. Very simple clean shapes, few details, no
patterns. Cheerful warm palette.
Every shape is enclosed by a soft COLOURED outline: a darker tone of that
shape's own colour, even weight, never black and never grey.
USE THE ATTACHED IMAGE as the reference for this exact finish, and draw the
creature in the same style as the creatures in it.

Cover illustration; the main action must read at thumbnail size. A cute chibi
blue creature wearing a cap stands on a flat green farm field at a fork, seen
from behind and slightly to the side, looking up at TWO wooden farm gates side
by side — one on the left and one on the right — each with a big empty blank
wooden board above it. Behind each gate, a small fenced pen. Sunny morning,
warm and inviting, very few simple shapes.

CRITICAL: the two boards above the gates are completely BLANK — no writing, no
symbols, no drawings on them.
CRITICAL: the moment of choosing between the two gates is the subject and must
be obvious in a small thumbnail.

DO NOT INCLUDE: airbrushed gradients, soft painted rendering, textured brush
strokes, film grain, noise, realistic proportions, small heads, 3D render,
photorealistic, blur, lens flare, black ink outlines, grey outlines,
heavy lineart,
text, letters, words, title lettering, captions, digits, numbers, symbols or
drawings on the boards, watermark, logo, user interface, buttons, panels,
speech bubbles, arrows, icons, stars, HUD,
a single gate, crowds of creatures, humans, adults,
sad faces, crying, angry faces, scary creatures, pointing at the viewer.
~~~

### Conferência

- [ ] dois portões e uma criaturinha decidindo, legíveis a 200 px de largura;
- [ ] as tabuletas em branco, sem uma letra;
- [ ] a criaturinha reconhecível como uma das oito da folha.

---

## 9. Escala no jogo

| Tipo | Tamanho na grade | No celular (≈ 0,30) |
|---|---:|---:|
| Criaturinha grande, na trilha | 140 px de altura útil | 42 px |
| Criaturinha pequena, na trilha | 95 px (escala `0,68`) | 29 px |
| Criaturinha na fila da onda | 56 px | 17 px |
| Criaturinha dentro do curral | 48 px | 14 px |
| Ícone de termo dentro da placa | 62 px | 19 px |
| Portão | 80 × 160 px | 24 × 48 px |
| Curral | 240 × 190 px | 72 × 57 px |

Cada célula é medida por **caixa alfa**, não pelo tamanho do PNG: a criaturinha
de chapéu é mais alta que a sem chapéu dentro da mesma célula de 256, e alinhar
pelo topo do arquivo faria a fila subir e descer a cada criaturinha. **O
alinhamento é pelos pés.**

A escala `0,68` da criaturinha pequena é o número que o marco de altura tem de
conversar: o traço do marco fica exatamente entre as duas alturas, para que
`é pequena` seja uma leitura e não um palpite.

**O contorno não escala.** Uma criaturinha desenhada com contorno de 6 px na
célula de 256 chega ao curral com menos de 1 px de contorno e some. Quem fica
pequeno — fila e curral — ganha em `Graphics` um contorno próprio de 2 px na
cor escura do corpo, por cima do sprite reduzido.

## 10. Placeholder, enquanto não existir PNG

- criaturinha vira um corpo arredondado na cor do atributo, com contorno num tom
  mais escuro da mesma cor, chapéu e óculos em blocos e o tamanho pela mesma
  escala da versão final;
- portão vira moldura chapada com duas folhas que abrem;
- curral vira cerca de postes em meia-lua;
- cenário vira duas faixas chapadas, céu e campo.

O reserva deste jogo é honesto de propósito: num estilo chapado com contorno, o
que o `Graphics` desenha e o que a arte entrega são quase a mesma linguagem, e
dá para jogar e avaliar a mecânica antes de a primeira imagem existir.

Carregamento por `import.meta.glob` com `WANTED` no `BootScene`. Arte ausente
não pode quebrar `vite build`.
