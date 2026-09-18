# O Dia Sem Internet — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO06/dia-sem-internet/`

**Seis arquivos, mais a capa. O jogo já roda sem nenhum deles.**

> **O jogo tem três níveis e DOIS mundos.** Os níveis 1 e 2 acontecem no quarto,
> em pé; o nível 3 acontece no ar, deitado, com o computador de um lado e o
> celular do outro. `computador.png`, `nuvem.png` e `arquivos.png` servem aos
> dois — só o `quarto.png` e o `pendrive.png` são do quarto, e só o
> `celular.png` é do ar.

> **Estado em 18/09/2026:** `arquivos.png`, `computador.png`, `nuvem.png`,
> `quarto.png` e `pendrive.png` chegaram e estão ligadas. **O `ceu.png` foi
> dispensado pelo usuário** — o degradê em `Graphics` ficou, e virou o céu
> oficial dos DOIS mundos (`scenes/sky.ts`). **Faltam `celular.png`, que o nível
> 3 desenha em retângulos enquanto não chega, e a capa.**
>
> Quatro coisas que a integração ensinou:
>
> - **o nome do arquivo é contrato com o `BootScene`.** A folha dos símbolos
>   chegou salva como `arquivos.png` mas o conteúdo era o computador; um PNG com
>   o nome errado é uma textura que nunca carrega e um placeholder que nunca sai;
> - **o miolo útil de cada moldura é uma FRAÇÃO da folha**, e é ela que ancora
>   os cartões. Medido: a tela vazia do monitor vai de 0,088 a 0,721 da altura; o
>   miolo da nuvem, de 0,218 a 0,848;
> - **`setDisplaySize` numa célula quadrada preserva a proporção do desenho.**
>   É por isso que os seis símbolos podem ter alturas diferentes na folha sem
>   nenhum deles sair esticado no cartão;
> - **mas uma folha inteira NÃO é uma célula.** O `pendrive.png` foi pedido
>   quadrado e chegou 709 × 354 — deitado. Desenhá-lo no quadrado do contrato
>   amassava o pen drive pela metade. Para folha única, a altura sai da largura
>   pela proporção da FOLHA QUE CHEGOU, e não pela que foi pedida.

> **Este jogo nasceu jogável com zero textura.** Céu, nuvem, computador, pen
> drive, cartões, cadeados, cabo, faíscas, botões e os seis símbolos são
> `Graphics`, e os símbolos moram em [`scenes/icons.ts`](./scenes/icons.ts). A
> arte abaixo só **troca**; se uma faltar, o jogo continua inteiro.

> **Estilo próprio, escrito dentro de cada prompt.** Nenhuma imagem de
> referência anexa. **Nada de chibi, nada de 3D.** Cada prompt já vem completo —
> estilo, corpo e negativo — para copiar e colar sem montar nada por cima.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é | Estado |
|---:|---|---:|---|---|---|---|
| 1 | `arquivos.png` | 768 × 512 | 3 × 2 de 256 | alfa | os seis símbolos | ✅ |
| 2 | `computador.png` | 1360 × 560 | única | alfa | o monitor, na mesa | ✅ |
| 3 | `nuvem.png` | 1360 × 440 | única | alfa | a nuvem, no céu | ✅ |
| 4 | `quarto.png` | 1672 × 941 | única | opaco | a metade de baixo do mundo | ✅ |
| 5 | ~~`ceu.png`~~ | — | — | — | **dispensado**: o degradê em `Graphics` ficou | ✖ |
| 6 | `pendrive.png` | 709 × 354 | única | alfa | o terceiro lugar | ✅ |
| 7 | **`celular.png`** | 640 × 960 | única | alfa | **o segundo aparelho, no nível 3** | ⬜ |
| 8 | `cover-dia-sem-internet.png` | 1672 × 941 | única | opaco | a capa do catálogo | ⬜ |

**O #1 é o que mais muda o jogo.** Os seis símbolos são o que a criança lê no
cartão e nos botões, e eles aparecem a **31 px reais** num celular de 390 px.

**O #7 é o único que falta para o jogo ficar inteiro.** O nível 3 desenha o
celular em retângulos enquanto ele não chega — joga certinho, mas é o único
objeto do jogo que ainda não tem folha própria, e ele fica lado a lado com o
`computador.png` na mesma tela.

### O que continua sendo `Graphics`, e por quê

- **o cartão** — ele muda de estado a cada toque (normal, trancado com cadeado,
  aberto em verde, pulsando). PNG não muda;
- **o cadeado**, que aparece sobre qualquer um dos seis;
- **o fio e o estalo** — ele se parte no meio de uma animação;
- **a faixa do pedido, a plaquinha âmbar, o cabeçalho, as vidas, as bolinhas de
  fase, o `?`, as faíscas, o confete e a moldura da tela.**

> **Nenhuma letra em PNG nenhum.** O nome do arquivo é texto de verdade, em caixa
> alta, e ele muda de cor quando o cartão tranca.

---

## 1. `arquivos.png` — os seis símbolos

### Contrato

- **768 × 512**, grade **3 × 2** de **256 × 256**, alfa real. (o prompt pedia
  1536 × 512; o gerador entregou 768 × 512, que é a mesma grade em metade da
  resolução e serve igual — o contrato é a GRADE, não o tamanho.)
- **A ordem dos quadros é o índice do frame, e é contrato com `data/files.ts`:**

| # | Arquivo | Cor de acento |
|---:|---|---|
| 0 | música | laranja |
| 1 | vídeo | azul-céu |
| 2 | foto | creme com lente navy |
| 3 | jogo | laranja |
| 4 | desenho | creme e azul-céu |
| 5 | dever | creme com linhas navy |

- **Sem moldura, sem cartão, sem papel por trás.** O cartão é `Graphics` e ele
  muda de cor a cada estado; um retângulo desenhado no PNG apareceria por cima
  do cartão trancado.
- Cada símbolo ocupa **~80 %** da célula. Eles aparecem a 31 px reais: forma
  grossa, sem detalhe pequeno.

### Prompt copiável

~~~text
STYLE — flat screen-print poster art, 2D only. Bold line art of even weight in a
dark desaturated navy, never pure black. FLAT blocked colour with exactly ONE
darker shade of the same hue for shadow, and no gradients anywhere. A light
halftone dot texture inside the shadow blocks only, like cheap poster ink.
Strong simple silhouettes that still read when shrunk to 31 px wide. A short
palette: warm orange, cream, sky blue, deep navy. A faint paper grain over the
whole image. Never cartoon-cute exaggeration.

Sprite sheet, 3 columns by 2 rows, 256x256 px per cell, same lighting and the
same scale in every cell, transparent background, no grid lines drawn, no cell
borders, no ground shadow.

Six everyday things a child keeps on a computer, each one alone and centred in
its own cell, each filling about 80 percent of the cell, each drawn as a single
bold object with NO frame, NO card, NO sheet and NO folder behind it. No faces,
no eyes. Read the cells left to right, top row first:

Row 1 — cell 1: a MUSIC NOTE, a double eighth note, thick and solid, warm
orange. Cell 2: a VIDEO, a rounded rectangle screen with one big play triangle
cut out of its middle, sky blue. Cell 3: a PHOTO, a simple camera seen from the
front with a big round lens and a small shutter button, cream body with a navy
lens.

Row 2 — cell 4: a GAME CONTROLLER seen from above, with a d-pad on the left and
two round buttons on the right, warm orange. Cell 5: a DRAWING, a paintbrush
crossed over a pencil in an X, cream and sky blue. Cell 6: a HOMEWORK SHEET, a
single sheet of paper with one folded corner and three thick horizontal lines on
it, cream with navy lines.

Keep every silhouette bold and distinct at 31 px wide: the note round and heavy,
the play triangle unmistakable, the camera boxy with a big lens, the controller
wide with two grips, the brush and pencil clearly crossed, the sheet with its
folded corner.

DO NOT INCLUDE: file icons, folders, document frames, cards, borders, rounded
squares behind the objects, faces, eyes, mouths, chibi, big head, 3D render,
CGI, isometric view, photorealistic, anime, manga, glossy highlights, gradients,
airbrush, soft shading, neon glow, drop shadow, ground shadow, pedestal, desk,
hands, text, letters, words, labels, digits, numbers, captions, watermark, logo,
user interface, buttons, panels, speech bubbles, arrows, stars, HUD, grid lines,
visible sprite-sheet borders, cell borders, gaps, cropped edges, white backing
in transparent assets.
~~~

### Conferência

- [ ] 6 quadros, na ordem da tabela;
- [ ] **nenhuma moldura, cartão ou papel** atrás dos símbolos;
- [ ] a nota e o controle são laranjas, o play é azul, a folha é creme;
- [ ] cada um se lê a 31 px;
- [ ] alfa real, sem letra.

---

## 2. `computador.png` — a moldura de baixo

### Contrato

- **1360 × 560**, imagem única, alfa real.
- **A tela tem de sair VAZIA.** É ali que o código planta os cartões, e é ali
  que a área de trabalho é desenhada por baixo deles.
- A moldura aparece a **216 × 69 px reais**: bezel grosso o bastante para se ver.

### Prompt copiável

~~~text
STYLE — flat screen-print poster art, 2D only. Bold line art of even weight in a
dark desaturated navy, never pure black. FLAT blocked colour with exactly ONE
darker shade of the same hue for shadow, and no gradients anywhere. A light
halftone dot texture inside the shadow blocks only. A short palette: warm
orange, cream, sky blue, deep navy. A faint paper grain. Never cartoon-cute.

A single object on a transparent background, 1360 x 560 px: a wide desktop
COMPUTER MONITOR seen straight from the front, filling the whole image, standing
on a short neck and a flat wide foot at the bottom.

CRITICAL: the screen area is COMPLETELY EMPTY — one flat, smooth, very pale
rectangle with nothing drawn inside it at all. No icons, no windows, no
wallpaper, no reflection, no glare, no scan lines, no logo. That empty rectangle
must have softly rounded corners and must take up most of the image.

The bezel around the screen is deep navy and fairly thin, with a single small
round power lamp in warm orange at the bottom right of the bezel. The neck and
the foot are deep navy.

DO NOT INCLUDE: anything inside the screen, icons, windows, desktop wallpaper,
cursor, reflection, glare, scan lines, curved glass, faces, eyes, chibi, 3D
render, CGI, isometric view, perspective, photorealistic, anime, manga, glossy
highlights, gradients, airbrush, soft shading, neon glow, keyboard, mouse,
cables, power cord, desk, table, wall, ground shadow, text, letters, words,
brand names, digits, numbers, watermark, logo, buttons, panels, arrows, stars,
HUD, borders, cropped edges, white backing in transparent assets.
~~~

### Conferência

- [ ] a tela está completamente vazia — nada desenhado dentro dela;
- [ ] o bezel é navy e se lê a 216 px de largura;
- [ ] há um pé e um pescoço;
- [ ] sem teclado, sem mouse, sem fio, sem mesa;
- [ ] alfa real, sem letra.

---

## 3. `nuvem.png` — a moldura de cima

### Contrato

- **1360 × 440**, imagem única, alfa real.
- **O miolo também sai vazio**, e largo o bastante para dois cartões lado a lado.
- O código **tinge** esta imagem de cinza quando o fio arrebenta, então ela tem
  de ser clara o suficiente para escurecer bem.

### Prompt copiável

~~~text
STYLE — flat screen-print poster art, 2D only. Bold line art of even weight in a
dark desaturated navy, never pure black. FLAT blocked colour with exactly ONE
darker shade of the same hue for shadow, and no gradients anywhere. A light
halftone dot texture inside the shadow blocks only. A short palette: warm
orange, cream, sky blue, deep navy. A faint paper grain. Never cartoon-cute.

A single object on a transparent background, 1360 x 440 px: one WIDE CLOUD seen
from the front, filling the whole image, drawn as a long horizontal cloud with
four or five big rounded bumps along its top edge and a flat soft bottom edge.
The cloud is pale sky blue with a bold navy outline.

CRITICAL: the middle of the cloud is COMPLETELY EMPTY — a large flat pale area
with nothing drawn inside it at all. No icons, no symbols, no rain, no faces.
That empty middle must be wide enough to hold two square pictures side by side.

On the top right bump there is one small straight antenna with three curved
signal arcs rising from its tip, in warm orange.

DO NOT INCLUDE: anything inside the cloud, icons, symbols, rain, lightning,
faces, eyes, mouths, chibi, 3D render, CGI, fluffy airbrushed clouds,
photorealistic, anime, manga, glossy highlights, gradients, soft shading, neon
glow, sky background, other clouds, sun, birds, ground shadow, text, letters,
words, digits, numbers, watermark, logo, buttons, panels, arrows, stars, HUD,
borders, cropped edges, white backing in transparent assets.
~~~

### Conferência

- [ ] o miolo está vazio e cabe dois cartões;
- [ ] a antena com as três ondinhas existe e é laranja;
- [ ] a nuvem é clara (ela vai ser tingida de cinza no estalo);
- [ ] alfa real, sem letra.

---

## 4. `quarto.png` — o fundo

### Contrato

- **1672 × 941**, imagem única, **opaca**.
- **O centro tem de ficar limpo**: é onde a nuvem, o fio e o computador moram.
- Nasce dessaturada, para os cartões serem a coisa mais colorida da tela.

### Prompt copiável

~~~text
STYLE — flat screen-print poster art, 2D only. Bold line art of even weight in a
dark desaturated navy, never pure black. FLAT blocked colour with exactly ONE
darker shade of the same hue for shadow, and no gradients anywhere. A light
halftone dot texture inside the shadow blocks only. A short palette: warm
orange, cream, sky blue, deep navy. A faint paper grain. Never cartoon-cute.

A single opaque background image, 1672 x 941 px, of a simple child's bedroom
seen straight from the front, with a wooden desk running across the lower part
of the image.

Composition rules, and they matter more than the scenery:
- The WHOLE CENTRE of the image must stay EMPTY and calm — a plain pale wall
  with nothing on it. No posters, no shelves, no window, no lamp, no pictures
  cross the middle.
- The BOTTOM FIFTH is the desk: one flat warm wooden surface running edge to
  edge, with a thin darker edge line. Nothing on the desk.
- The FAR LEFT and FAR RIGHT edges only may carry a little scenery, hugging the
  borders: on the left a tall narrow bookshelf silhouette, on the right the edge
  of a curtain. Both must be low contrast and must not reach the centre.

The whole image is slightly desaturated and low contrast, so that brightly
coloured objects placed on top of it stand out.

DO NOT INCLUDE: a computer, a monitor, a screen, a keyboard, a mouse, a cloud,
people, characters, faces, animals, posters or pictures in the centre, a window
in the centre, a lamp in the centre, clutter on the desk, high contrast, dark
areas, strong shadows, vignette, chibi, 3D render, CGI, perspective vanishing
points, photorealistic, anime, manga, gradients, airbrush, neon glow, lens
flare, text, letters, words, digits, numbers, watermark, logo, user interface,
buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, grid lines,
borders, cropped edges.
~~~

### Conferência

- [ ] o centro está vazio — a nuvem e o computador não encostam em nada;
- [ ] a mesa corre de borda a borda e está limpa;
- [ ] **nenhum computador desenhado no fundo** (ele é o jogo);
- [ ] opaco, 1672 × 941.

---

## 5. ~~`ceu.png`~~ — dispensado

**O usuário viu o degradê rodando e disse que estava bom.** Ele fica, e virou o
céu oficial dos DOIS mundos: [`scenes/sky.ts`](./scenes/sky.ts), chamado pelo
quarto e pelo ar.

A decisão é boa por um motivo que não é só economia: **um céu liso não tem nada
para uma folha desenhar.** O que ele precisa é acabar em creme para casar com a
parede do quarto e com o chão do mundo do ar, e quarenta faixas interpoladas
fazem isso melhor do que um PNG, porque a altura muda entre os dois mundos e o
degradê se estica sem costura.

O `BootScene` continua aceitando um `ceu.png` se um dia aparecer — mas nada no
jogo espera por ele.

---
## 6. `pendrive.png` — o terceiro lugar

### Contrato

- Pedido 512 × 512; **chegou 709 × 354**, deitado, e o código se ajustou: a
  folha é desenhada com `DRIVE.w` × `DRIVE.h` na proporção medida (2,003 : 1).
  O pen drive em si ocupa x 0,055–0,962 e y 0,234–0,777 da folha.
- Ele fica **na mesa**, à direita do computador, e aparece a **70 px reais** num
  celular de 390 px: silhueta grossa, sem detalhe pequeno.
- Sem cabo, sem tampa, sem chaveiro — ele é um objeto sozinho sobre a mesa.

> **Se for refeito, a proporção é que manda.** Uma folha nova com outra razão
> largura/altura muda `DRIVE.w`/`DRIVE.h` em `data/layout.ts`, e mais nada.

### Prompt copiável

~~~text
STYLE — flat screen-print poster art, 2D only. Bold line art of even weight in a
dark desaturated navy, never pure black. FLAT blocked colour with exactly ONE
darker shade of the same hue for shadow, and no gradients anywhere. A light
halftone dot texture inside the shadow blocks only. A short palette: warm
orange, cream, sky blue, deep navy. A faint paper grain. Never cartoon-cute.

A single object on a transparent background, 512 x 512 px: one USB FLASH DRIVE
lying flat, seen from slightly above and from the side, filling about 85 percent
of the image.

Its body is a stubby rounded rectangle in warm orange with a cream stripe along
the top, and a flat silver metal connector sticking out of one end, pointing to
the left. There is one small navy loop hole at the far right end. A single tiny
cream highlight sits on the top face.

Keep the silhouette bold and readable when shrunk to 45 px wide: a thick body
and a clearly separate metal connector.

DO NOT INCLUDE: a cable, a cap, a lanyard, a keyring chain, a hand, a computer,
a desk, a table, a socket, a port, faces, eyes, chibi, 3D render, CGI,
photorealistic, anime, manga, glossy highlights, gradients, airbrush, soft
shading, neon glow, drop shadow, ground shadow, text, letters, words, brand
names, digits, numbers, watermark, logo, buttons, panels, frames, arrows, stars,
HUD, borders, cropped edges, white backing in transparent assets.
~~~

### Conferência

- [x] o conector de metal se separa do corpo a 70 px;
- [x] sem cabo, sem tampa, sem chaveiro, sem mesa;
- [x] alfa real, sem letra.

---


## 7. `celular.png` — o segundo aparelho, no nível 3

### Contrato

- **640 × 960**, imagem única, alfa real, **em pé**.
- Ele é o par do `computador.png`: no nível 3 os dois ficam lado a lado no mesmo
  chão, e a nuvem alcança os dois por onda. **Mesmo peso de traço, mesmo estilo,
  mesma família** — se um parecer mais "sério" que o outro, a criança lê uma
  hierarquia que não existe.
- **A tela tem de sair VAZIA**, como a do monitor: é ali que o código planta o
  cartão do arquivo guardado. Hoje o código usa o miolo do retângulo; quando a
  folha chegar, eu meço a caixa alfa e ancoro na fração medida.
- **Um cartão só cabe ali dentro**, e a validação do `levels.ts` cobra isso. A
  tela precisa ter pelo menos **60 %** da altura da folha e **75 %** da largura.
- Ele aparece a **60 px de largura reais** num celular de 390 px: silhueta
  grossa, sem detalhe pequeno.
- **Sem mão segurando, sem mesa, sem suporte.** Ele fica em pé no chão, sozinho.

### Prompt copiável

~~~text
STYLE — flat screen-print poster art, 2D only. Bold line art of even weight in a
dark desaturated navy, never pure black. FLAT blocked colour with exactly ONE
darker shade of the same hue for shadow, and no gradients anywhere. A light
halftone dot texture inside the shadow blocks only. A short palette: warm
orange, cream, sky blue, deep navy. A faint paper grain. Never cartoon-cute.

A single object on a transparent background, 640 x 960 px, portrait: one MOBILE
PHONE standing upright, seen straight from the front, filling about 88 percent
of the image height and centred.

Its body is a tall rounded rectangle in deep navy with a thick even outline. Its
SCREEN IS COMPLETELY EMPTY: one flat pale blue-grey rectangle with softly
rounded corners, no icons, no apps, no clock, no bars, no widgets, no reflection
and no glare on it. The screen fills at least 75 percent of the body width and
60 percent of the body height. Above the screen there is one small horizontal
cream speaker slot. Below the screen there is one thin cream circle outline for
the home button. One narrow warm orange stripe runs down the left edge of the
body as an accent.

Keep the silhouette bold and readable when shrunk to 60 px wide: a plain tall
rounded slab with one big empty screen.

DO NOT INCLUDE: anything drawn inside the screen, app icons, home screen,
wallpaper, a clock, a status bar, signal bars, a battery, wifi arcs, notches,
front cameras, a hand, fingers, a person, a table, a desk, a stand, a dock, a
charging cable, earphones, faces, eyes, chibi, 3D render, CGI, isometric view,
photorealistic, anime, manga, glossy highlights, screen glare, gradients,
airbrush, soft shading, neon glow, drop shadow, ground shadow, text, letters,
words, brand names, digits, numbers, watermark, logo, buttons, panels, frames,
arrows, stars, HUD, borders, cropped edges, white backing in transparent assets.
~~~

### Conferência

- [ ] a tela está **vazia**, sem ícone, relógio ou barrinha de sinal;
- [ ] a tela tem ao menos 75 % da largura e 60 % da altura do corpo;
- [ ] nenhuma onda de wi-fi desenhada — **o leque de sinal é `Graphics`**, porque
      ele apaga e ganha um X quando o aparelho perde o alcance;
- [ ] sem mão, sem mesa, sem suporte;
- [ ] ao lado do `computador.png`, os dois parecem da mesma família;
- [ ] alfa real, sem letra.

---

## 8. `cover-dia-sem-internet.png` — a capa

### Contrato

- **1672 × 941**, opaca, no mesmo estilo.
- A capa **pode** ter o que o fundo proíbe: aqui o computador, a nuvem e o fio
  aparecem — e o fio está arrebentando.
- **Sem uma letra.** O título vem do catálogo, por cima.

### Prompt copiável

~~~text
STYLE — flat screen-print poster art, 2D only. Bold line art of even weight in a
dark desaturated navy, never pure black. FLAT blocked colour with exactly ONE
darker shade of the same hue for shadow, and no gradients anywhere. A light
halftone dot texture inside the shadow blocks only. A short palette: warm
orange, cream, sky blue, deep navy. A faint paper grain. Never cartoon-cute.

A single opaque poster image, 1672 x 941 px, of a child's bedroom wall.

In the upper half, a wide pale sky-blue CLOUD with a small orange antenna on
top. Inside the cloud, two square cards, and both cards have a big navy PADLOCK
over them.

In the lower half, a wide desktop COMPUTER MONITOR seen from the front. Inside
its screen, two square cards with bright symbols on them: a warm orange music
note and a cream sheet of paper. These two are clearly lit and open.

Between the cloud and the monitor, a thick cable runs vertically and it is
SNAPPED IN THE MIDDLE, the two frayed ends pulled apart, with a burst of bright
golden sparks at the break.

The wall behind is a plain pale surface, and a warm wooden desk runs along the
very bottom edge.

DO NOT INCLUDE: people, characters, faces, animals, hands, chibi, 3D render,
CGI, photorealistic, anime, manga, glossy highlights, gradients, airbrush, soft
shading, neon glow, lens flare, smoke, fire, a keyboard, a mouse, clutter, text,
letters, words, title lettering, labels, digits, numbers, watermark, logo, user
interface, buttons, panels, frames, speech bubbles, arrows, HUD, grid lines,
borders, cropped edges.
~~~

### Conferência

- [ ] o fio está partido no meio, com faíscas;
- [ ] os dois cartões da nuvem têm cadeado; os dois do monitor estão acesos;
- [ ] nenhuma pessoa;
- [ ] **nenhuma letra na imagem**;
- [ ] opaco, 1672 × 941.

---

## 9. Depois que a arte chegar

**Meça a caixa alfa de cada quadro antes de ancorar qualquer coisa.** O que essa
medida decide aqui:

- **onde a tela vazia do monitor começa e acaba** — é o retângulo em que os
  cartões se plantam, e errar isso põe cartão em cima do bezel;
- **onde o miolo da nuvem começa e acaba** — idem;
- **uma escala só para a folha de símbolos**, tirada da maior altura medida.

E a troca no código é pequena: `shelf.ts` já procura `arquivos`, `computador`,
`nuvem` e `quarto` com `textures.exists()`, e cai no `Graphics` quando não acha.
