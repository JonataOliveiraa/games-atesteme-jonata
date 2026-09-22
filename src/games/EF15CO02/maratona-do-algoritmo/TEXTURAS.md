# Maratona do Algoritmo — prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF15CO02/maratona-do-algoritmo/`

**7 arquivos, 18 desenhos.**

> **O estilo deste jogo é o GRAPHIC NOVEL INFANTOJUVENIL**, o mesmo escolhido
> pelo dono do projeto em 18/09/2026 para [A Guilda dos
> Criadores](../../EF05CO09/guilda-dos-criadores/TEXTURAS.md), e a referência
> são **duas imagens** — as duas capas do *Elementary*:
> [`references/17-graphic-novel-a.webp`](../../../../references/17-graphic-novel-a.webp)
> e [`references/18-graphic-novel-b.png`](../../../../references/18-graphic-novel-b.png).
> **As duas vão anexadas em TODAS as gerações.** Cada prompt abaixo já vem
> inteiro — estilo, corpo e negativo —, para ser copiado e colado sem montar
> nada por cima.
>
> **Este NÃO é o chibi de figurinha de
> [`references/ESTILO.md`](../../../../references/ESTILO.md)**, e a diferença é
> de técnica:
>
> | | chibi de figurinha | **aqui** |
> |---|---|---|
> | traço | limpo, espessura uniforme | **firme, espessura VARIÁVEL** — grosso na silhueta, fino por dentro |
> | cor | cel shading de um tom | **cel shading macio + degradê de ambiente e luz quente de rebote** |
> | olho | enorme, com brilho | **grande, com íris, pupila e um brilho pequeno** |
> | silhueta | keyline branca de adesivo | **o próprio contorno**, marrom escuro — **sem keyline** |
> | proporção | cabeça grande, corpo pequeno | **cabeça um pouco maior que o natural, corpo de criança normal** |
>
> **Sem keyline branca em nenhum arquivo deste jogo**, nem nos que têm alfa: o
> contorno de tinta já segura a silhueta sozinho.

> **O elenco das capas de referência entra no NEGATIVO.** Elas são uma escola de
> criaturas — dragão, grifo, medusa, esqueleto, gárgulas —, e é exatamente o que
> o gerador vai copiar se ninguém proibir. O skatista deste jogo é uma **criança
> humana**. Por isso todo prompt fecha com `dragons, gryphons, medusas,
> skeletons, gargoyles, monsters, fantasy creatures, animal people, pointed elf
> ears, wings, horns`.

> **A interface roda com zero PNG.** Trajetória pontilhada, medalhões, cartas,
> placa do pedido, contador, VAI, cadeado, balão, estrelas, poeira e confete
> nascem em `Graphics`. As texturas trazem **o skatista, os obstáculos, quatro
> adereços de borda e o fundo** — e o fundo traz junto **o chão do jogo**: a
> pista pintada é a superfície onde o skatista roda, e o código não desenha
> concreto nenhum.

> **OS OBSTÁCULOS VIRARAM TEXTURA, e isso inverte uma regra deste documento.**
> Eles nasceram em `Graphics` porque **a regra lê a geometria deles**: o
> `trickPath` de `data/moves.ts` pergunta a altura do lábio da rampa para
> animar a subida, e arte que a física não conhece é arte que discorda do
> jogo. O risco não sumiu — ele mudou de lado.
>
> **A resposta é medir, não chutar.** Quando a folha chegar, a caixa alfa de
> cada quadro é medida e os números de `RAMP` e `LEDGE` em `data/layout.ts`
> passam a sair DO DESENHO. A regra continua com uma fonte só; ela é que se
> ajusta à arte, e não a arte que precisa acertar um pixel combinado. É a
> mesma conta que já foi feita para as rodas do skatista.

---

## 1. Por que folha em grade

O mesmo skatista aparece em oito poses. Pedir uma de cada vez — "faça a próxima
usando a anterior como referência" — é onde a consistência se perde: cada
geração sorteia capacete, proporção e cor de camiseta de novo, e na quinta pose
já é outra criança.

A folha em grade resolve de graça: o gerador desenha os oito quadros na mesma
passada, então tudo sai igual porque saiu junto. É também o formato que o
Phaser já carrega (`load.spritesheet`).

**A ordem dos quadros é o índice do frame.** O Phaser lê da esquerda para a
direita e de cima para baixo: o primeiro quadro é o frame 0. A ordem abaixo não
é sugestão de leitura, é contrato com o código.

## 2. Tamanho — pequeno de propósito

Cada quadro tem **256 × 256**, o mesmo da folha de objetos da Guilda. O
skatista aparece a 150 px na grade de 1280 × 720, o que num celular dá cerca de
**45 px reais**; os adereços não passam de 90 px. Pedir 1024 × 1024 por desenho
seria carregar megabytes para jogar fora no `setScale`.

A regra que vale mais que a resolução: **se a criança não reconhece a manobra
em meio segundo a 45 px de altura, tem detalhe demais.** Neste estilo quem
salva o pequeno é o **traço de espessura variável** — a linha grossa da
silhueta segura a figura sozinha, e por isso não existe keyline branca aqui.

| Arquivo | Grade | Célula entregue | Tamanho entregue | Quadros |
|---|---|---|---|---|
| `skatista.png` | 4 × 2 | 450 × 450 | 1800 × 900 | 8 |
| `rampa-p.png` | 1 × 1 | 800 × 330 | 800 × 330 | 1 |
| `rampa-g.png` | 1 × 1 | 900 × 500 | 900 × 500 | 1 |
| `outros-da-pista.png` | 2 × 1 | 800 × 300 | 1600 × 300 | 2 |
| `decor.png` | 2 × 2 | 400 × 400 | 800 × 800 | 4 |
| `bg-parque.png` | — | — | 1672 × 941 | 1 (opaco) |
| `cover-maratona-do-algoritmo.png` | — | — | 1672 × 941 | 1 (catálogo) |

**Os obstáculos vieram em três arquivos, e não numa folha 2 × 2.** Funciona
igual: as duas rampas entram como folha de UMA célula, para o código tratar
toda peça do mesmo jeito — `(chave, quadro)`, sem um caminho especial para
quem veio sozinho. A caixa e o corrimão dividem `outros-da-pista.png`.

**A capa não é textura de jogo.** Ela mora nesta pasta porque é o lugar dos
assets deste jogo, mas quem a usa é o catálogo — a `BootScene` a exclui do
`import.meta.glob`, senão seriam 2 MB baixados para nunca aparecerem em cena.

**Cada obstáculo PREENCHE a sua célula**, em vez de os quatro virem na mesma
escala. É o que o Pulo Programado já fazia com o `OBSTACLE_SPEC`: objeto baixo
e largo na mesma escala de um alto desperdiça três quartos da célula e perde
resolução justo nas peças pequenas. O tamanho de cada um na tela é decidido
pelo código, um por quadro — e tem de ser, porque é o código que sabe quanto
ar cada rampa dá.

## 3. Paleta — cite os hex no prompt

A tinta é **marrom escuro, nunca preto puro** — é a primeira coisa que separa
este estilo do traço antigo do catálogo.

| Uso | Hex |
|---|---|
| Contorno / tinta | `#3A2A22` |
| Camiseta | `#F4743B` |
| Calça | `#3E5C9A` |
| Capacete | `#F5C542` |
| Pele | `#E8B07D` |
| Shape do skate | `#7B4AE2` |
| Rodas | `#FFF3E0` |
| Metal e concreto dos obstáculos | `#9AA7B4` |
| Sombra dos obstáculos | `#6D7A86` |
| Lábio da rampa | `#F4743B` |
| Barra da caixa | `#F5C542` |
| Água / molhado *(Graphics)* | `#4FC3F7` |
| Verde do grafite | `#3FBF7F` |
| Céu | `#9FD8F2` |

A linha marcada *(Graphics)* **não vai em prompt nenhum**.

**O cinza-azulado dos obstáculos é requisito, não gosto.** A primeira rampa,
desenhada em `Graphics`, saiu bege como o concreto da pista e virou um recorte
branco sobre um chão branco: o objeto mais importante do parque era o mais
difícil de achar. A folha precisa nascer numa família de cor que CONTRASTA com
a pista pintada — por isso o negativo do prompt proíbe bege e cor de areia com
todas as letras.

---

## 4. Os quatro pedidos

### 4.1 `skatista.png` — 1024 × 512, grade 4 × 2

As oito poses. Os quadros **1, 2, 3 e 4 também aparecem dentro das cartas da
paleta**, reduzidos — é assim que a carta mostra a manobra sem depender de a
criança ler a palavra:

| Frame | Pose | Onde mais aparece |
|---|---|---|
| 0 | parado | esperando o VAI |
| 1 | empurrando | carta **EMPURRAR** |
| 2 | agachado na subida | carta **SUBIR** |
| 3 | no ar (ollie) | carta **PULAR** |
| 4 | girando, meio giro | carta **GIRAR** e carta `↻3×` |
| 5 | girando, três quartos | animação do giro, junto com o 4 |
| 6 | tombo | — |
| 7 | comemorando | — |

**Os quadros 4 e 5 precisam ter o mesmo centro do quadro 3.** É o par que faz o
giro ler como rotação; se o corpo escorregar de posição entre eles, o giro
treme em vez de girar, e não tem código que conserte isso depois.

**O fantasma do nível 1 é este mesmo sprite**, com alpha baixo e tinta fria
aplicados pelo Phaser. Não existe folha de fantasma a produzir.

#### Prompt copiável

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown #3A2A22, never pure black,
the line weight varying — heavier around the outer silhouette, finer for the
details inside; rich saturated colours; SOFT CEL SHADING, one clear shadow tone
plus a gentle ambient gradient and a warm bounce light, clean and graphic, never
painterly; warm friendly daylight. Head slightly larger than natural on a normal
child's body, NOT chibi. Big expressive eyes with an iris, a pupil and ONE small
highlight. Take ONLY the art style from the attached images: do NOT copy their
characters, their creatures, their clothes, their poses, their scene, their
lettering or their framing.

Sprite sheet, 4 columns by 2 rows, 256x256 px per cell, transparent background,
no grid lines drawn, no cell borders, no ground shadow.

THE SAME human child skateboarder in all eight cells: an orange t-shirt #F4743B,
blue trousers #3E5C9A, a yellow helmet #F5C542, warm skin #E8B07D, riding a
purple skateboard #7B4AE2 with cream wheels #FFF3E0. Always seen from the SIDE,
facing right, at the same size, the same eye level and the same lighting in
every cell, with empty margin around the figure, never touching the cell edge.
The helmet stays on in every cell.

Cells, left to right then top to bottom:
1. standing still on the board, both feet on it, calm friendly expression,
   looking right.
2. pushing: one foot on the board, the other reaching down and back as if
   pushing off, body leaning forward, cheerful open eyes.
3. crouching low on the board, knees deeply bent, arms out for balance, leaning
   forward, focused happy expression.
4. airborne: board and feet lifted together as one piece, body compact and
   tucked, arms out, joyful expression, clearly off the ground.
5. spinning halfway: the same airborne tuck rotated so the body is seen from
   behind, board still under the feet, arms tucked in.
6. spinning three quarters: the same airborne tuck rotated further, almost
   facing the viewer, board still under the feet, arms tucked in.
7. falling: sitting down backwards with the legs up, the board flipping away
   nearby, eyes closed, cheeks squished, a small comic swirl of surprise, no
   injury and no sadness.
8. celebrating: standing, one arm raised high, the board held up in the other
   hand, a big happy smile.

Cells 4, 5 and 6 must share the SAME centre and the SAME overall size, so the
three read as one rotation.

DO NOT INCLUDE: ground, floor line, concrete, skate park surface, ramp,
halfpipe, rail, cast shadow under the figure, motion blur, speed lines, spin
trails, dust, sparks, text, letters, words, labels, digits, numbers, captions,
watermark, logo, title lettering, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, HUD, white sticker keyline, painterly
lineless illustration, soft airbrushed gradients, heavy rendering, rough sketchy
wobbly outlines, child's felt-tip doodle style, anime or manga style, chibi
proportions, 3D render, photorealistic, dragons, gryphons, medusas, skeletons,
gargoyles, monsters, fantasy creatures, animal people, pointed elf ears, wings,
horns, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders,
cell borders, gaps, cropped edges, drop shadow on the cell, white backing in
transparent assets, helmet removed, injury, blood, sad face, crying.
~~~

#### Conferência

- [ ] 8 células, 4 × 2, na ordem da tabela;
- [ ] contorno **marrom escuro** com espessura variável, nunca preto puro;
- [ ] os quadros 4, 5 e 6 têm o **mesmo centro** — o giro não treme;
- [ ] o capacete está em todas as 8;
- [ ] reduza o quadro 3 e o quadro 4 a 160 px: dá para dizer qual é PULAR e
      qual é GIRAR?
- [ ] alfa real, sem chão, sem rampa, sem sombra caída;
- [ ] **nenhuma keyline branca**.

---

### 4.2 Os obstáculos — `rampa-p`, `rampa-g` e `outros-da-pista`

As quatro peças do parque, todas vistas de lado e apoiadas na linha de base do
rodapé do quadro. A rampa pequena e a caixa são do nível 1; a mega-rampa e o
corrimão entraram junto porque custavam a mesma geração e estão no
[PLANEJAMENTO.md](./PLANEJAMENTO.md).

| Peça | Arquivo | Quadro | Onde entra |
|---|---|---|---|
| rampa pequena | `rampa-p.png` | 0 | nível 1 — dá 1 de ar |
| mega-rampa | `rampa-g.png` | 0 | nível 2 — dá 3 de ar, para o `REPITA 3× GIRAR` |
| caixa | `outros-da-pista.png` | 0 | nível 1 — pede ollie |
| corrimão | `outros-da-pista.png` | 1 | nível 3 — é ele que amanhece molhado ou seco |

**A rampa SOBE DA ESQUERDA PARA A DIREITA, e a curva é CÔNCAVA.** É o erro que
o gerador comete se ninguém proibir — e é o mesmo que a versão em `Graphics`
cometeu: a curva fechava pelo lado errado e saía um seixo ovalado. Um
quarter-pipe tem base reta no chão, costas verticais à direita, e entre as duas
uma superfície que **afunda abaixo da diagonal** em vez de estufar por cima
dela. Estufada é um morro; afundada é uma transição.

**O marco `plano` continua sem textura.** Ele é duas setas pintadas no
concreto, em `Graphics`, e é de propósito: "não tem nada aqui" precisa parecer
não ter nada.

#### Prompt copiável

~~~text
STYLE - USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown #3A2A22, never pure black,
the line weight varying - heavier around the outer silhouette, finer for the
details inside; rich saturated colours; SOFT CEL SHADING, one clear shadow tone
plus a gentle ambient gradient and a warm bounce light, clean and graphic, never
painterly; warm friendly daylight coming from the upper left. Take ONLY the art
style from the attached images: do NOT copy their characters, their creatures,
their clothes, their poses, their scene, their lettering or their framing.

Sprite sheet, 2 columns by 2 rows, 256x256 px per cell, transparent background,
no grid lines drawn, no cell borders, no ground shadow.

Four skate park obstacles, each seen from the SIDE, each FILLING ITS OWN CELL
with about 8% empty margin around it, each resting on an imaginary baseline at
the very bottom of its cell. They are worn but cared for concrete and metal park
fixtures in cool grey-blue #9AA7B4 with darker grey-blue shading #6D7A86 - they
must NOT be beige, cream or sand coloured.

Cell 1 - a small quarter-pipe ramp that RISES FROM LEFT TO RIGHT. Its bottom
edge is flat along the baseline; its right side is a straight vertical back; and
the surface joining them is a CONCAVE curve that scoops downward, its hollow
side facing up and to the left, like the inside of a skate transition. The curve
must dip BELOW the straight diagonal between its two ends - it must never bulge
outward like a hill, a wedge or a triangle. A bright orange #F4743B metal coping
bar caps the top right edge where the curve ends.

Cell 2 - the same quarter-pipe ramp, clearly taller and wider: same shape, same
concave curve rising left to right, same materials, same orange coping bar. It
must read as the big brother of cell 1.

Cell 3 - a low wide concrete ledge box lying flat on the baseline, about four
times wider than it is tall, with a bright yellow #F5C542 metal grind bar capping
its entire top edge, and a few pale scuff marks on its front face.

Cell 4 - a metal handrail: one straight round bar running left to right, held up
by two simple angled legs that reach down to the baseline, polished grey-blue
metal with a bright highlight running along the top of the bar.

DO NOT INCLUDE: ground, floor, floor line, concrete slab under the objects,
paving, grass, skate park surface, cast shadow on the ground, people, characters,
skateboards, skaters, beige or sand coloured obstacles, wedge shaped ramps,
triangular ramps, convex or bulging ramp surfaces, ramps rising from right to
left, text, letters, words, labels, digits, numbers, captions, watermark, logo,
title lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, stars, HUD, white sticker keyline, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, rough sketchy wobbly outlines, child's
felt-tip doodle style, anime or manga style, 3D render, photorealistic, dragons,
gryphons, medusas, skeletons, gargoyles, monsters, fantasy creatures, blur, lens
flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps,
cropped edges, drop shadow on the cell, white backing in transparent assets.
~~~

#### Conferência

- [ ] 4 células, 2 × 2, na ordem da tabela;
- [ ] **as duas rampas sobem da esquerda para a direita**;
- [ ] **a curva das duas afunda**, não estufa — encoste uma régua imaginária
      entre o pé e o lábio: o desenho tem de passar por baixo dela;
- [ ] a mega-rampa é visivelmente maior que a pequena;
- [ ] nada de bege: as quatro peças destacam do concreto da pista;
- [ ] **nenhum chão, nenhuma sombra caída** — elas vão ser plantadas na pista
      pintada, e um pedaço de piso dentro do PNG cria duas pistas encostando;
- [ ] alfa real, cada peça apoiada no rodapé da sua célula.

#### O que a medição devolveu

As caixas alfa foram medidas e moram em `OBSTACLE_ART`, em `data/layout.ts`.
**Os números do jogo saíram do desenho, e não o contrário:**

| Peça | Caixa alfa no quadro | Proporção | Na tela |
|---|---|---|---|
| rampa pequena | x 6,5–88,6 % · y 1,2–99,7 % | 2,02 : 1 | 232 × 115 |
| mega-rampa | x 6,1–92,0 % · y 3,2–99,8 % | 1,60 : 1 | 288 × 180 |
| caixa | x 0,6–99,4 % · y 48,7–97,7 % | 5,37 : 1 | 240 × 45 |
| corrimão | x 1,0–99,1 % · y 41,7–98,3 % | 4,62 : 1 | 250 × 54 |

**Nenhuma peça foi esticada para caber num número redondo.** A caixa é 5,4
vezes mais larga que alta, e é assim que ela entra: deformar a arte para
salvar uma conta é trocar o problema de lugar.

Duas consequências mecânicas caíram daí:

- **`RAMP.h` virou 115** (era 110 chutado), e com ele a subida do `trickPath`
  termina exatamente no lábio desenhado — conferido rodando: o skatista chega
  a 6 px do lábio;
- **o ollie abriu de 108 para 190 px antes do marco.** A caixa entregue tem
  240 px de largura, e saltando a 108 px do centro dela o skatista começaria a
  subir já em cima da borda esquerda. Como o desenho da trajetória sai da
  mesma função, o pontilhado abriu junto.

---

### 4.3 `decor.png` — 512 × 512, grade 2 × 2

Quatro adereços de parque de skate. Eles são **decoração pura**: o código os
espalha nas bordas do parque, longe da linha por onde o skatista passa. Nenhum
deles participa da regra — quem participa (rampa, corrimão) é `Graphics`.

Todos vistos de lado, na mesma escala, apoiados numa linha de base imaginária,
para plantarem no concreto desenhado sem flutuar nem afundar.

#### Prompt copiável

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown #3A2A22, never pure black,
the line weight varying — heavier around the outer silhouette, finer for the
details inside; rich saturated colours; SOFT CEL SHADING, one clear shadow tone
plus a gentle ambient gradient and a warm bounce light, clean and graphic, never
painterly; warm friendly daylight. Take ONLY the art style from the attached
images: do NOT copy their characters, their creatures, their clothes, their
poses, their scene, their lettering or their framing.

Sprite sheet, 2 columns by 2 rows, 256x256 px per cell, transparent background,
each object centred in its own cell, no grid lines drawn, no cell borders, no
ground shadow.

Four side-view skate park props, all drawn at the same scale, each sitting on an
imaginary baseline at the bottom of its cell, with empty margin around it:
cell 1: a traffic cone, orange #F4743B with a white band, friendly rounded
shape.
cell 2: a park bench seen from the side, warm wooden slats and simple dark metal
legs.
cell 3: a potted plant: a round leafy green bush #3FBF7F in a terracotta pot.
cell 4: a portable speaker: a small boxy speaker with two round grilles and a
carry handle, grey body with a green accent #3FBF7F.

DO NOT INCLUDE: ground, floor line, concrete, skate park surface, ramp, rail,
cast shadow under the objects, people, hands holding the objects, skateboards,
text, letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, stars, HUD, white sticker keyline, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, rough sketchy wobbly outlines, child's
felt-tip doodle style, anime or manga style, 3D render, photorealistic, dragons,
gryphons, medusas, skeletons, gargoyles, monsters, fantasy creatures, blur, lens
flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders,
gaps, cropped edges, drop shadow on the cell, white backing in transparent
assets.
~~~

#### Conferência

- [ ] 4 células, 2 × 2, na ordem da tabela;
- [ ] os quatro apoiados na **mesma linha de base**, na mesma escala;
- [ ] mesma tinta marrom e mesmo cel shading do `skatista.png`;
- [ ] alfa real, sem chão e sem sombra caída.

---

### 4.4 `bg-parque.png` — 1280 × 720, PNG opaco

Fundo de tela cheia. O código joga um véu leve por cima e desenha o concreto,
as rampas e o corrimão; a arte é **o cenário atrás**, não a pista.

**A faixa do meio precisa estar limpa.** É por onde o skatista voa — o ápice do
giro triplo chega a `y ≈ 215`, quase no topo da tela. Qualquer coisa alta ali
(árvore, poste, prédio) briga com a silhueta dele justo no momento em que a
criança precisa contar os giros.

**Aqui não existe keyline nem alfa**: é cena inteira, com formas nítidas e sem
pincelada. E o cenário vem **um pouco mais claro e menos saturado** que o
skatista, para ele se destacar sem precisar de contorno extra.

#### Prompt copiável

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown #3A2A22, never pure black,
the line weight varying; SOFT CEL SHADING, one clear shadow tone plus a gentle
ambient gradient and a warm bounce light, clean and graphic, never painterly;
warm friendly afternoon light. This is a FULL SCENE, not a sticker: no white
keyline anywhere, crisp shapes, no painterly brushwork. Keep the whole
background slightly lighter and less saturated than a foreground character would
be. Take ONLY the art style from the attached images: do NOT copy their
characters, their creatures, their clothes, their poses, their scene, their
lettering or their framing.

Wide background illustration, 16:9, 1280x720, opaque, filled edge to edge.

A sunny outdoor skate park seen from the side, empty of people. A warm blue sky
#9FD8F2 with three soft clouds; a row of low round green bushes #3FBF7F and two
short leafy trees near the far LEFT and far RIGHT edges only; a long low painted
wall along the bottom third with simple abstract green #3FBF7F and orange
#F4743B shapes like friendly graffiti; a distant skyline of very low rounded
hills; gentle afternoon light.

The entire upper and middle horizontal band is open sky with NO tall objects at
all, so a character can fly across it. Trees and bushes only near the left and
right edges, and never taller than the bottom third. Calm low-contrast areas
where game elements will sit.

DO NOT INCLUDE: people, characters, children, skateboards, skaters, ramps,
halfpipes, rails, concrete floor, skate park surface, bowls, paths, roads,
platforms, tall buildings, poles, lamp posts, fences in the middle band, text,
letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, stars, HUD, white sticker keyline, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, rough sketchy wobbly outlines, child's
felt-tip doodle style, anime or manga style, 3D render, photorealistic, dragons,
gryphons, medusas, skeletons, gargoyles, monsters, fantasy creatures, blur, lens
flare, heavy noise, grid lines, frames, borders, harsh black shadows, dark
scene, night.
~~~

#### Conferência

- [ ] 1280 × 720, opaco, preenchido de ponta a ponta;
- [ ] a faixa acima de `y = 470` está **vazia de coisa alta** — cole o quadro 4
      do skatista em `y ≈ 215` e veja se a silhueta continua legível;
- [ ] **nenhuma rampa, corrimão ou piso de pista dentro do PNG**;
- [ ] mais claro e menos saturado que o skatista;
- [ ] sem keyline, sem moldura, sem pincelada.

---

## 5. O que NÃO é textura

Não peça e não aceite: **cartas da paleta, trajetória pontilhada, medalhões,
anéis vazios, setas do marco `plano`, placa do pedido, contador, cadeado,
interrogação, estrelas, balões, moldura, botão VAI, cronômetro, poeira,
confete, rastro do giro, estrelinhas do tombo ou brilho.**

**Os obstáculos saíram desta lista** — eles são o `obstaculos.png` da §4.2. O
que os trouxe para cá não foi capricho: o `trickPath` lê a altura do lábio da
rampa, e por isso a geometria continua morando no código. A diferença é quem
se ajusta a quem — agora os números de `layout.ts` saem da medição do desenho,
em vez de o desenho ter de acertar um número combinado.

**O concreto da pista é a exceção, e ela mudou na construção.** O primeiro
fundo veio com rampas e piso próprios e o jogo desenhava o seu deck por cima;
o fundo atual é uma pista limpa, então **o chão do jogo é o chão pintado** e o
código não desenha concreto nenhum. Duas superfícies encostando é a emenda que
esta seção existe para evitar — e a forma de não ter emenda é ter uma
superfície só.

Tudo isso é `Graphics` do Phaser, e aqui são três motivos, não dois:

1. esses elementos **mudam de cor e de tamanho a cada estado**, e um PNG não
   muda;
2. manter a interface em `Graphics` deixa o jogo inteiro jogável mesmo com
   nenhuma textura carregada;
3. **a rampa é lida pela regra.** O `descer()` do
   [PLANEJAMENTO.md](./PLANEJAMENTO.md) pergunta onde fica o lábio da rampa e
   quanto ar ela dá. Geometria que a regra consulta é geometria que o código
   desenha — senão a arte e a física discordam e ninguém descobre até a criança
   cair no ar.

**As cartas da paleta e os medalhões merecem uma nota**, porque é onde o pedido
de textura costuma escapar: os dois são retângulos desenhados pelo código, com
**o quadro do próprio skatista** (quadros 1 a 4) em miniatura dentro. A carta
leva a palavra escrita pelo Phaser; o medalhão, que fica sobre o parque, não
leva palavra nenhuma. A carta `↻3× 🌀` é o mesmo retângulo com o quadro 4 e um
número que gira, em `Graphics`. A carta `SE 💧` é o retângulo partido ao meio,
com dois quadros pequenos. **Não existe arte de carta a produzir.**

## 6. Entrega

| | |
|---|---|
| Formato | PNG com transparência real nas duas folhas; o fundo é opaco |
| Recorte | os quadros precisam bater com a grade exata; sem sangria entre eles |
| Margem | ~8 % de área vazia dentro de cada quadro |
| Sem | texto, número, moldura, linha de grade, chão, rampa, keyline, sombra caída |

**O recorte é a parte que costuma dar errado.** Gerador de imagem raramente
entrega grade perfeita e alfa limpo de primeira. O caminho prático: gere a
folha sobre um fundo chapado de magenta `#FF00FF` (que não existe na paleta),
remova a cor num editor e recorte para o tamanho exato da tabela da §2. Meio
pixel de deslocamento faz todo frame do Phaser aparecer com uma fatia do
vizinho. Fundo branco é pior: branco é cor de roda, de banda do cone e de nuvem.

**Meça a caixa alfa antes de ancorar o layout.** Depois que a folha chegar,
desenhe o PNG num canvas e meça a caixa de cada quadro em fração da célula. Em
Pulo Programado isso revelou que as patas do coelho ficam em 98,5 % da altura
do quadro. Aqui os dois números que interessam são: **onde ficam as rodas no
quadro 1** (é o que planta o skatista no concreto) e **se os quadros 3, 4 e 5
têm o mesmo centro** (é o que faz o giro não tremer). São dois minutos no
navegador e economizam meia hora de tentativa e erro.

## 7. Ordem

**Mande `skatista.png` primeiro.** Ele sozinho responde as duas perguntas que
importam: as poses continuam reconhecíveis a 45 px, e dá para distinguir SUBIR
de PULAR de GIRAR dentro de uma carta de 160 px? Se a resposta for não, o
ajuste de traço acontece num arquivo, não em quatro.

`obstaculos.png` vem em seguida, e é o que tem mais chance de precisar de uma
segunda rodada: a curva côncava da rampa é a coisa mais fácil de o gerador
errar, e é a que mais muda o jogo quando erra. **Enquanto ele não chegar, as
peças em `Graphics` continuam de pé** — é o placeholder deste arquivo, e ele
já é jogável.

`bg-parque.png` é o terceiro, porque ele traz o chão. O `decor.png` pode vir
por último: são adereços de borda, e a pista funciona sem eles.
