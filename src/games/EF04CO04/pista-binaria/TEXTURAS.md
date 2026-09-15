# Pista Binária — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Pasta: `src/assets/games/EF04CO04/pista-binaria/`

> **A arte chegou (15/09/2026), e o que veio não é o que foi pedido — está
> tudo medido no §9.** Bloco 800 × 400 em vez de 512 × 256, nave 1200 × 400 em
> vez de 1024 × 288, máquina 800 × 400 em vez de 1024 × 512. Os furos também
> mudaram de tamanho: o do bloco é 0,618 × 0,585 da célula (pedi 0,55) e a tela
> da máquina é 0,472 × 0,445 (pedi 0,62 quadrada). O código se guia pelos
> números medidos, em `data/art.ts`, e não pelos do pedido.

> **As cinco texturas antigas foram descartadas.** `tunel-faixa`,
> `nave-codificadora`, `bloco-de-dados`, `tablet-escolar` e `caderno-desenho`
> saem da pasta: eram neon vetorial genérico, do mesmo saco de mil jogos de
> nave, e duas delas nem existem mais na mecânica enxuta. Entra o conjunto
> abaixo, **cinco arquivos, um estilo só**.

---

## 1. O estilo: papel recortado

Tudo neste jogo é feito de **papel cortado e empilhado**, fotografado de frente,
com sombra curta e macia entre as camadas. Nada de brilho de vidro, nada de
neon, nada de gradiente de metal.

É essa escolha que dá identidade ao jogo, e ela não é enfeite: o jogo inteiro
fala de **quadradinho cheio** contra **buraco vazio**, e papel é a única
linguagem visual em que "cheio" e "furo" são a mesma coisa vista de dois jeitos.
O `1` é um pedacinho de papel colado; o `0` é o buraco que a tesoura deixou.

### As seis regras de estilo — valem para os cinco arquivos

1. **Papel fosco, com textura de fibra suave.** Nunca liso digital, nunca
   brilhante.
2. **Camadas com sombra curta**, uns 4 a 8 px, sempre para baixo e para a
   direita. É a sombra que separa as formas — **não existe contorno preto**.
3. **Bordas levemente irregulares**, como tesoura de mão. Sem serrilhado
   exagerado.
4. **Formas gordas e arredondadas**, poucas peças por objeto. Se uma peça de
   papel tem menos de 8 px na tela, ela não deve existir.
5. **Paleta fechada** (§2). Nenhuma cor fora dela, nenhum gradiente, nenhuma
   sombra colorida.
6. **Nenhuma letra, nenhum número, nenhuma linha de grade dentro do PNG.** Os
   dígitos do jogo são texto de verdade, desenhados por cima.

### O que NUNCA é textura

Botões, formas dentro dos botões, a proa carregada, o raio, os pixels da
máquina, a moldura que pisca, o cadeado, as estrelas, as vidas, os balões e todo
painel: **`Graphics`**. Mudam de cor e de estado a cada quadro, e um PNG não
muda. Com a interface em `Graphics`, o jogo continua jogável com zero textura
carregada.

**A regra da emenda** tem um lugar só aqui, e é importante: o quadradinho de
dentro do bloco é desenhado pelo código **dentro de um furo transparente do
PNG** (§4). O papel entrega a moldura; o código entrega o miolo. Nunca peça um
"bloco cheio" e um "bloco vazio" desenhados — o jogo precisa do mesmo bloco
cheio, vazio, fechado e travado.

---

## 2. Paleta

| Uso | Hex |
|---|---|
| fundo do túnel, papel mais escuro | `#16223F` |
| arcos do túnel, camadas do meio | `#23406B` · `#35789C` |
| papel creme (a base de tudo) | `#F6ECD4` |
| coral (a nave) | `#E8654F` |
| turquesa (a máquina) | `#35B3A6` |
| amarelo (só acento e chama) | `#F2B33D` |
| carvão (a tela da máquina) | `#2A2A33` |

**Cheio e vazio nunca se separam por cor** — se separam por forma: papel colado
contra furo. Nenhum arquivo pode trazer um par de cores sugerindo `1` e `0`.

### Negativo comum a todo prompt

~~~text
text, letters, words, numbers, digits, zero, one, binary code, grid lines,
sprite sheet borders, visible frame separators, checkerboard,
buttons, HUD, arrows, cursor, lock icon, stars, hearts, question mark,
progress bar, speech bubble, tutorial panel,
neon, glow, bloom, lens flare, glass, chrome, metallic shading, gradient mesh,
black cartoon outlines, thick ink contour, cel shading,
alien, monster, weapon, laser battle, explosion, wreckage, skull, scary face,
pitch darkness, horror, motion blur, 3D render, photorealistic, clay render,
watermark, signature, white backing behind transparent areas, cropped edges.
~~~

---

## 3. A lista

| # | Arquivo | Canvas | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `tunel.png` | 1672 × 941 | única | **opaco** | o túnel de arcos de papel |
| 2 | `nave.png` | 1024 × 288 | 2 × 1 de 512 × 288 | alfa real | a nave: chama curta / chama longa |
| 3 | `bloco.png` | 512 × 256 | 2 × 1 de 256 × 256 | alfa real | o bloco: aberto / fechado |
| 4 | `maquina.png` | 1024 × 512 | 2 × 1 de 512 × 512 | alfa real | a máquina: parada / recebendo |
| 5 | `cover-pista-binaria.png` | 1672 × 941 | única | opaco | a capa do catálogo |

Cinco arquivos, e **quatro deles são folhas ou fundos de uma geração só**. Peça
os quadros sempre na mesma passada: pedir um de cada vez ("agora faça o próximo
usando o anterior") é onde a consistência morre.

**A ordem dos quadros é o índice do frame, e é contrato com o código.**

---

## 4. `bloco.png` — o arquivo que é a mecânica

Se um só arquivo pudesse existir, seria este: é o objeto que a criança lê antes
de cada decisão.

| Campo | Exigência |
|---|---|
| canvas | 512 × 256, **2 × 1** de 256 × 256 |
| frame **0** | bloco **aberto** — moldura de papel creme, com o furo no meio |
| frame **1** | bloco **fechado** — a mesma moldura com uma tampa de papel cobrindo o furo |
| **furo do frame 0** | quadrado **transparente**, centrado, **0,55 da célula** (141 × 141 de 256), cantos levemente arredondados |
| exibição | 200 × 200 na grade do jogo → o furo dá **110 px** (33 px reais no celular) |
| caixa alfa | o bloco ocupa ~0,90 da célula, centrado, com folga igual dos quatro lados |

O furo precisa ser **transparência de verdade e retangular**, porque é lá que o
código desenha o quadradinho cheio (papel coral colado) ou deixa ver o túnel
(vazio). Como o código usa os dois quadros:

| Situação | Quadro | O que o código faz |
|---|---|---|
| bloco vindo | 0 | pinta o quadradinho dentro do furo, ou deixa vazado |
| bloco travado | 1 | `tint` âmbar + tremida |
| bloco convertido | 0 | pulso e o quadradinho voa para a máquina |

### Prompt

~~~text
Create ONE horizontal two-frame sprite sheet, exactly 512 by 256 pixels: two
cells of 256 by 256, side by side, no borders and no gaps between them, fully
TRANSPARENT background.

Style: cut-paper collage. Every shape is a piece of matte textured paper, cut
with scissors, layered with a short soft drop shadow down-right. No outlines, no
gloss, no glow, no gradients.

LEFT cell (frame 0): a chunky square frame made of cream paper (#F6ECD4) over a
slightly darker paper backing, like a thick picture mount. The MIDDLE of the
frame is a real EMPTY SQUARE HOLE, fully transparent, centered, its side equal to
55 percent of the cell, with softly rounded corners. Four small paper corner tabs
in muted blue (#35789C) hold the frame together, one at each corner, outside the
hole.

RIGHT cell (frame 1): exactly the same frame, same size and same position, but
the hole is COVERED by a single flat paper lid in the same cream, cut slightly
larger than the hole, with its own soft shadow so it clearly reads as a lid
placed on top. No hole visible in this cell.

Both cells centered, same scale, about 90 percent of the cell, equal margin on
all four sides.
~~~

Mais o negativo comum do §2, acrescentando: `filled square inside the hole,
colored center, pattern inside the hole, second hole, open lid, hinge`.

---

## 5. `nave.png`

| Campo | Exigência |
|---|---|
| canvas | 1024 × 288, **2 × 1** de 512 × 288 |
| frame **0** | chama **curta** |
| frame **1** | chama **longa** |
| direção | **aponta para a direita**, sempre. O código nunca espelha |
| proa | os ~90 px da frente ficam **livres de detalhe**: é onde o código acende a carga |
| exibição | 280 × 158 |

Duas coisas que o desenho não deve ter: **janela com piloto** (a nave é o
codificador, não um personagem com rosto) e **qualquer marca de `1` ou `0`**.

### Prompt

~~~text
Create ONE horizontal two-frame sprite sheet, exactly 1024 by 288 pixels: two
cells of 512 by 288, side by side, no borders and no gaps, fully TRANSPARENT
background.

Style: cut-paper collage. Matte textured paper pieces, scissor-cut edges,
layered with short soft drop shadows down-right. No outlines, no gloss, no glow,
no gradients, no metal.

Subject: a small friendly delivery rocket seen from the SIDE, pointing RIGHT,
built from a few chunky paper pieces: a coral (#E8654F) rounded body, a cream
(#F6ECD4) nose cone at the right, one cream fin below and one behind, and a
muted blue (#35789C) band across the middle. A small round turquoise (#35B3A6)
paper porthole near the middle of the body, plain and empty.

LEFT cell (frame 0): a SHORT flame of layered yellow (#F2B33D) and coral paper
behind the tail, at the left.
RIGHT cell (frame 1): exactly the same rocket in exactly the same position and
scale, with a LONGER flame, about twice the length. Nothing else changes between
the two cells.

Keep the front 15 percent of the rocket simple and free of detail. The rocket
fills about 85 percent of the cell width, vertically centered.
~~~

Mais o negativo do §2, acrescentando: `pilot, face, eyes, character inside,
cockpit with a person, smoke trail, speed lines, planets, stars in the
background`.

---

## 6. `maquina.png` — quem recebe

| Campo | Exigência |
|---|---|
| canvas | 1024 × 512, **2 × 1** de 512 × 512 |
| frame **0** | **parada** — a lâmpada de papel apagada (creme) |
| frame **1** | **recebendo** — a mesma lâmpada em amarelo |
| **tela** | quadrado **transparente**, **0,62 da célula** (317 × 317), centrado em (0,50 · 0,47) |
| exibição | 356 × 320 → tela de ~221 px → grade 5 × 5 com célula de **44 px** |
| na remontagem | a máquina cresce até ~620 px e a célula passa de 76 px |

**A tela é um furo, não um retângulo pintado.** O código desenha o painel escuro
(`#2A2A33`) e os 25 quadradinhos dentro dele — assim ele controla cor, brilho e
a animação de remontagem sem brigar com o PNG. Quadrada porque a grade é 5 × 5:
uma tela deitada desperdiçaria metade da altura e encolheria a célula.

A máquina é um **aparelho de mesa, fofo e pesado**: corpo turquesa, pés curtos,
uma antena de papel torta em cima, e uma lâmpada redonda ao lado da tela.

### Prompt

~~~text
Create ONE horizontal two-frame sprite sheet, exactly 1024 by 512 pixels: two
cells of 512 by 512, side by side, no borders and no gaps, fully TRANSPARENT
background.

Style: cut-paper collage. Matte textured paper, scissor-cut edges, layered with
short soft drop shadows down-right. No outlines, no gloss, no glow, no
gradients.

Subject: a friendly chunky desktop machine seen from the FRONT, built from paper
pieces: a rounded turquoise (#35B3A6) body with two short cream feet, a slightly
crooked thin paper antenna on top with a small coral ball at its tip, and a small
round paper lamp on the body at the LEFT of the screen area.

The machine has a large SQUARE SCREEN OPENING in the middle: a real fully
TRANSPARENT square hole with softly rounded corners, its side equal to 62 percent
of the cell, horizontally centered and placed slightly above the vertical center.
A thin cream paper bezel surrounds the hole. Nothing inside the hole.

LEFT cell (frame 0): the round lamp is plain cream, switched off.
RIGHT cell (frame 1): exactly the same machine, identical position and scale,
with the lamp in bright yellow (#F2B33D) and a couple of tiny yellow paper rays
around it. Nothing else changes.

The machine fills about 88 percent of the cell, centered.
~~~

Mais o negativo do §2, acrescentando: `screen content, pixels, mosaic, image on
the screen, dark rectangle instead of a hole, keyboard, cables, dials, wheels,
face on the machine`.

---

## 7. `tunel.png` — o fundo

| Campo | Exigência |
|---|---|
| canvas | **1672 × 941** — proporção 1,777, a mesma da tela. **Sem recorte** |
| fundo | opaco |
| composição | arcos de papel em camadas, abrindo do centro-direita para fora |
| faixa proibida | **y de 200 a 340 e x acima de 700 ficam calmos**: é o corredor do bloco |
| esquerda | um pouco mais escura: é onde a máquina fica, e ela precisa se destacar |

O fundo é **parado**. A sensação de velocidade vem de arcos desenhados em
`Graphics` correndo por cima — um PNG rolando (`tileSprite`) descola do mundo
assim que a velocidade muda ou o jogo congela na trava.

### Prompt

~~~text
Create ONE horizontal illustration, exactly 1672 by 941 pixels, fully opaque.

Style: cut-paper collage diorama. Layers of matte textured paper stacked with
short soft drop shadows, scissor-cut edges. No outlines, no gloss, no neon, no
glow, no gradients, no stars.

Scene: a long tunnel made of nested paper arches, seen from inside. The arches
get smaller toward a calm opening in the RIGHT-CENTER of the image, like looking
down a paper tube. Use four or five depth layers, from deep navy (#16223F) at the
outer edge, through blue (#23406B) and muted blue (#35789C), to a soft cream
(#F6ECD4) glow at the far opening. A few small coral (#E8654F) and yellow
(#F2B33D) paper confetti shapes float near the bottom corners.

The middle band of the image — the horizontal strip between 20 and 40 percent of
the height — must stay CALM and uncluttered: no shapes, no confetti, just flat
tunnel layers. The left third is slightly darker than the rest.

Keep the outer 6 percent of every edge free of important detail.
~~~

---

## 8. `cover-pista-binaria.png` — a capa

A ficha do catálogo (`id: "071"`) está sem `thumbnail`. A capa não bloqueia o
jogo: bloqueia a vitrine. Mesmo estilo, cena mais solta, **sem interface**.

### Prompt

~~~text
Create ONE horizontal illustration, exactly 1672 by 941 pixels, fully opaque.

Style: cut-paper collage diorama. Matte textured paper layers, scissor-cut
edges, short soft drop shadows. No outlines, no gloss, no neon, no glow, no
gradients.

Scene: inside a tunnel of nested paper arches (deep navy #16223F to muted blue
#35789C), a small coral (#E8654F) paper rocket with a cream nose flies to the
RIGHT, a short yellow paper flame behind it. Ahead of it, a chunky cream paper
square frame floats, with one small coral paper square sitting inside it. Behind
the rocket, on the LEFT, a friendly turquoise (#35B3A6) paper machine with a
crooked antenna shows a dark square screen where a few chunky cream paper squares
are arranged in an incomplete mosaic, as if a picture were being assembled.

Warm, calm and playful, made for young children. Keep the outer 6 percent of
every edge free of important detail.
~~~

---

## 9. O que a arte entregou, medido

Medido pelo canal alfa, arquivo por arquivo. É por estes números que
`data/art.ts` e `data/layout.ts` se guiam:

| Arquivo | Canvas | Grade | Caixa alfa | Furo transparente |
|---|---:|---|---|---|
| `bloco.png` | 800 × 400 | 2 × 1 de 400 | f0 (6,14) 394 × 383 · f1 (0,14) 400 × 383 | f0 (78,88) **247 × 234**, 99,3 % retangular, centro (0,502 · 0,511) |
| `nave.png` | 1200 × 400 | 2 × 1 de 600 | f0 (57,82) 535 × 293 · f1 (22,84) 577 × 291 | — (a escotilha é pintada) |
| `maquina.png` | 800 × 400 | 2 × 1 de 400 | (27,3) 348 × 395 | (115,133) **189 × 178**, 98 % retangular, centro (0,522 · 0,554) |
| `tunel.png` | 1672 × 941 | única | opaco | — |

Três consequências práticas:

- **O furo do bloco não é quadrado nem centrado** (247 × 234, centro em 0,502 ·
  0,511). O quadradinho usa o MENOR lado e o centro medido, senão nasce oval e
  encostado na borda de baixo.
- **A tela da máquina é menor do que o pedido** e está deslocada para a direita
  e para baixo. A grade 5 × 5 cabe pela ALTURA (178 nativos), o que dá célula de
  33 px nativos.
- **A nave anda 5 px entre os quadros** (a chama longa empurra a caixa alfa). A
  proa é o ponto de saída do tiro, e ele sai de uma constante de `layout.ts`, não
  da caixa do quadro — senão o tiro tremeria junto com o motor.

---

## 10. Contratos que o código assume

Se a arte for refeita um dia, é isto que não pode mudar em silêncio:

1. **A ordem dos quadros**: bloco `0 = aberto, 1 = fechado`; nave `0 = chama
   curta, 1 = chama longa`; máquina `0 = parada, 1 = recebendo`.
   O quadro fechado do bloco **não** é usado na trava (a caixa travada fica
   aberta, de propósito): ele existe para a caixa lacrada do nível 3.
2. **O furo do bloco** continua transparente, quadrado, centrado e em 0,55 da
   célula. É onde o quadradinho mora.
3. **A tela da máquina** continua um furo quadrado de 0,62 da célula. É onde o
   desenho mora.
4. **A nave continua apontando para a direita**, com a proa livre.
5. **Nenhum arquivo traz dígito, letra ou linha de grade.**
6. **O fundo continua 16:9**, e nada essencial nos 6 % das bordas.

Quando os arquivos chegarem, medir a caixa alfa e os furos de cada quadro antes
de escrever o `layout.ts` — é uma execução e economiza meia hora de tentativa e
erro.
