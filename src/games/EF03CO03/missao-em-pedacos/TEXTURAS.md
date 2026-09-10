# Missão em Pedaços - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF03CO03/missao-em-pedacos/`

---

## 0. Onde estamos

**Os três níveis estão prontos, jogáveis e com toda a arte entregue.** A pasta
tem dezesseis arquivos, todos medidos no arquivo entregue — e o código está
ancorado nessas medidas, não nas que foram pedidas.

| Arquivo | Medida real | O que é |
|---|---|---|
| `heroi.png` | 1500 x 900, grade 5 x 2 de **300 x 450** | a criança que corre, pula e carrega |
| `chao.png` | **1200 x 600**, grade 4 x 2 de **300** | ver a tabela dos quadros abaixo |
| `fundo-n1.png` | 2048 x 768 | o quintal ensolarado — fundo do nível 1 |
| `fundo-n2.png` | 2048 x 768 | a varanda ao amanhecer — fundo do nível 2 |
| `fundo-n3.png` | 2048 x 768 | o quintal à noite — fundo do nível 3 |
| `bancada.png` | 500 x 300 | a bancada no fim da trilha e da fase final |
| `itens-n1-a.png` | **1200 x 600**, grade 4 x 2 de **300** | os 8 objetos do bolo |
| `itens-n1-b.png` | **1200 x 600**, grade 4 x 2 de **300** | os 8 objetos do piquenique |
| `final-n1.png` | **1600 x 800**, grade 4 x 2 de **400** | os 8 estados das duas fases finais |
| `itens-n2-a.png` | **1200 x 600**, grade 4 x 2 de **300** | os 8 objetos do sanduíche |
| `itens-n2-b.png` | **1200 x 600**, grade 4 x 2 de **300** | os 8 objetos do café |
| `final-n2.png` | **1774 x 887**, grade 4 x 2 de **443,5** | os estados do café e do sanduíche |
| `itens-n3-a.png` | **1200 x 600**, grade 4 x 2 de **300** | os 8 objetos da fogueira e do lanche |
| `itens-n3-b.png` | **1200 x 600**, grade 4 x 2 de **300** | os 8 objetos da barraca e da cama |
| `final-n3.png` | **1600 x 800**, grade 4 x 2 de **400** | os estados da barraca e da fogueira |
| `lixo.png` | **768 x 256**, grade 3 x 1 de **256** | meia fedida, barata, peixe morto |

> **`lixo.png` veio de outro jogo, e foi COPIADA para cá.** O original mora em
> `EF02CO05/corrida-do-cotidiano/`; o `import.meta.glob` do `BootScene` só
> enxerga a pasta do próprio jogo, e cada jogo tem que ser dono do que carrega.
> Ela aposentou o `perigos.png`, que nunca chegou e não precisa mais chegar.

> **As folhas vieram em 300 e 400, não em 256 e 384.** O `BootScene` carrega
> `itens-*` com quadro de 300.

> **O `final-n2.png` chegou em 1774 x 887 — quadro de 443,5, fora da grade.**
> Em vez de recusar a folha, o `BootScene` parou de carregar `final-*` como
> spritesheet de quadro fixo: ele carrega como IMAGEM e corta a grade 4 x 2 em
> `create`, com a medida REAL do arquivo. Cada quadro entra com **1 px de
> margem** de cada lado — sem isso, o 443,5 deixava uma fatia do vizinho
> aparecendo na borda direita do resultado. Qualquer `final-*` futuro pode
> chegar em qualquer tamanho, desde que seja 4 colunas por 2 linhas.

> **As folhas de resultado agora têm DOIS empregos.** Além da fase final, elas
> são a arte das **estações** no mapa — escurecidas antes, acesas depois. Foi o
> que permitiu o café, a fogueira e a barraca acontecerem durante a corrida sem
> pedir nenhuma folha nova.

### `chao.png`, quadro a quadro

A segunda fileira chegou depois, e ela é o que fez o chão parecer chão.

| Quadro | Peça | Onde o jogo usa |
|---|---|---|
| 0 | bloco de terra com grama em cima | a fileira de cima do chão |
| 1 | ponta esquerda (a beirada do buraco) | as duas beiradas — a direita é esta espelhada |
| 2 | plataforma de madeira | as plataformas flutuantes |
| 3 | caixote | sem uso: o corte virou painel desenhado |
| 4 | **terra pura** | a fileira de baixo, cortada pela borda da tela |
| 5 | **pedra** | o obstáculo que empurra de lado e obriga o pulo |

O que ficou pendente e o `itens-n1.png` antigo saíram. O jogo foi refeito em
cima de outro corpo:

> **A missão é uma tarefa. A criança corta a tarefa no meio, virando duas
> missões menores; joga uma fase de parkour para cada metade, buscando os
> objetos daquela metade; e na FASE FINAL executa a tarefa com o que trouxe.**

Três níveis, **duas tarefas por nível** — seis tarefas ao todo e doze viagens de
parkour. Metade das tarefas termina numa **fase final**, na bancada; a outra
metade termina em **estações**, pontos do mapa onde cada par de objetos é usado
onde ele serve. São três fases finais e doze estações.

---

## 1. A lista

### Já na pasta

| Arquivo | Estado |
|---|---|
| `heroi.png` | ✔ entregue |
| `chao.png` | ✔ entregue, com a segunda fileira |
| `fundo-n1.png` | ✔ entregue |
| `bancada.png` | ✔ entregue |
| `itens-n1-a.png` | ✔ entregue |
| `itens-n1-b.png` | ✔ entregue |
| `final-n1.png` | ✔ entregue |
| `itens-n2-a.png` | ✔ entregue — sanduíche |
| `itens-n2-b.png` | ✔ entregue — café |
| `final-n2.png` | ✔ entregue — 1774 x 887, fora da grade pedida |
| `itens-n3-a.png` | ✔ entregue — fogueira e lanche |
| `itens-n3-b.png` | ✔ entregue — barraca e cama |
| `final-n3.png` | ✔ entregue |
| `fundo-n2.png` | ✔ entregue |
| `fundo-n3.png` | ✔ entregue |
| `lixo.png` | ✔ entregue (copiada de outro jogo) |

### Os prompts deste documento

Os três do nível 1 ficam aqui como registro do que foi pedido; os oito de baixo
são o que falta. **A grade a pedir agora é a que chegou: 300 para item, 400
para resultado.**

| # | Arquivo | Tamanho | Grade | Para quê | § |
|---|---|---|---|---|---|
| 1 | `itens-n1-a.png` | ✔ 1200 x 600 | 4 x 2 de 300 | os 8 objetos do **bolo** | §4 |
| 2 | `itens-n1-b.png` | ✔ 1200 x 600 | 4 x 2 de 300 | os 8 objetos do **piquenique** | §5 |
| 3 | `final-n1.png` | ✔ 1600 x 800 | 4 x 2 de 400 | os estados das duas fases finais do N1 | §6 |
| 4 | `itens-n2-a.png` | ✔ 1200 x 600 | 4 x 2 de 300 | os 8 objetos do **sanduíche** | §7 |
| 5 | `itens-n2-b.png` | ✔ 1200 x 600 | 4 x 2 de 300 | os 8 objetos do **café** | §8 |
| 6 | `final-n2.png` | ✔ 1774 x 887 | 4 x 2 de 443,5 | os estados do café e do sanduíche | §9 |
| 7 | `itens-n3-a.png` | ✔ 1200 x 600 | 4 x 2 de 300 | os 8 objetos da **fogueira e do lanche** | §10 |
| 8 | `itens-n3-b.png` | ✔ 1200 x 600 | 4 x 2 de 300 | os 8 objetos da **barraca e da cama** | §11 |
| 9 | `final-n3.png` | ✔ 1600 x 800 | 4 x 2 de 400 | os estados da barraca e da fogueira | §12 |
| 10 | `fundo-n2.png` | ✔ 2048 x 768 | — | a varanda dos fundos, ao amanhecer | §13 |
| 11 | `fundo-n3.png` | ✔ 2048 x 768 | — | o quintal à noite | §14 |

> **O fundo NÃO precisa mais emendar consigo mesmo.** O `fundo-n1.png` entregue
> não emenda — repetido, a árvore da direita aparecia partida no meio da tela —
> e a saída foi aritmética: o fundo tem 1920 px na tela, a tela mostra 1280,
> sobram 640 de folga, e o fator de parallax é calculado para gastar essa folga
> exatamente ao longo do mapa. Uma cópia só, emenda nenhuma. Os prompts de §13
> e §14 ainda pedem bordas casadas porque é de graça, mas **não é requisito**.

### Ainda pendentes, de antes

| Arquivo | Tamanho | Para quê | § |
|---|---|---|---|
| `mesa.png` | 900 x 420 | a mesa do corte, onde os objetos esperam | §16 |
| `cover-missao-em-pedacos.png` | 1672 x 941 | capa do catálogo | §18 |

**Nada de painel, lugar de painel, etiqueta, prateleira, botão, seta, cadeado,
corrente, plaquinha, sombra, poeira, faísca, moldura, estrela ou confete dentro
das folhas.** Tudo isso é `Graphics`, porque muda de estado a cada toque e um
PNG não muda.

---

## 2. As duas regras que não podem ser quebradas

> **1. Itens da mesma parte não podem parecer parentes.**

Cada objeto na sua cor natural, silhuetas variadas dentro da mesma parte, sem
fundo, halo ou moldura por grupo. Se os quatro itens do bolo forem os únicos
objetos bege da folha, a criança enche o painel por cor e a decomposição
evapora. É por isso que, de propósito, a maçã da comida e a pipa da brincadeira
são vermelhas, e o chocolate do lanche é do mesmo marrom da lenha.

> **2. Em `final-nN.png`, o mesmo objeto tem que ser o MESMO objeto.**

Essas folhas mostram um estado virando o outro (chaleira fria → chaleira
apitando; pão inteiro → pão cortado → sanduíche). Se a chaleira mudar de
formato entre os quadros, a criança não lê "a água esquentou": ela lê "trocaram
a chaleira". Mesma cor, mesmo desenho, mesmo ângulo — muda só o que a etapa
mudou.

---

## 3. Estilo, negativo e paleta

### Estilo comum

```
flat 2D cartoon educational game asset for children, side view platformer style, simple
rounded shapes, bold readable silhouette, thick dark outline, bright friendly colors,
minimal detail, flat colors, one soft shadow, no text, transparent background
```

### Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, tiny details, brand logo, text,
letters, numbers, words, watermark, signature, frame, border, grid lines, cropped, cut
off, white background, motion blur
```

### Regra de grade (já embutida em cada prompt de folha)

```
Every frame contains ONE object, alone, centered, drawn at the same visual weight as the
others, filling about 80% of its frame. Nothing crosses the invisible line between two
frames. No frame is empty.
```

### Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| pele do herói | `#F5C9A6` |
| camiseta do herói | `#38BDF8` |
| calça do herói | `#3B5BA5` |
| mochila do herói | `#F59E0B` |
| terra | `#A9713F` escuro `#7A4E28` |
| grama | `#5FBB47` clara `#7FD35F` |
| madeira | `#C98B54` escura `#9A6A3C` |
| metal | `#C7CDD6` |
| céu de dia | `#9BD9F5` |
| céu de amanhecer | `#FFC48C` sobre `#7FB7E0` |
| céu de noite | `#22315E` estrelas `#FFF3C4` |
| fogo | `#FF8A3D` claro `#FFD166` |
| chocolate | `#5A3220` |
| verde do cheiro ruim | `#8FC93A` |
| lama | `#7A5C3E` |

---

# NÍVEL 1 — a festa no quintal

Fundo: `fundo-n1.png`, que já está na pasta.

| Tarefa | Corte 1 | Corte 2 |
|---|---|---|
| **Fazer o bolo** | a massa | a cobertura |
| **Arrumar o piquenique** | a comida | a brincadeira |

## 4. `itens-n1-a.png` ✔ — 1200 x 600, grade 4 x 2 de 300

A tarefa **fazer o bolo**, cortada no meio. Quadros 0 a 3 são a massa; 4 a 7 são
a cobertura. A criança não sabe disso: ela descobre pelo que os objetos fazem.

| Frame | Objeto | Parte |
|---|---|---|
| 0 | tigela azul com massa amarela dentro | massa |
| 1 | ovo branco inteiro | massa |
| 2 | saco de farinha de papel | massa |
| 3 | colher de pau | massa |
| 4 | pote de calda de chocolate | cobertura |
| 5 | saquinho de confeitos coloridos | cobertura |
| 6 | espátula de confeiteiro | cobertura |
| 7 | velinha de aniversário rosa listrada, apagada | cobertura |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 300
by 300 pixels, transparent background. Cartoon baking objects for a children's game.

Frames, left to right then top to bottom:
1. A round sky-blue mixing bowl seen from a three-quarter angle, filled to the rim with
   pale yellow cake batter, a small swirl on top.
2. A single whole white chicken egg standing upright, soft shadow on one side.
3. A tall paper flour sack, cream colored with a folded brown top, plump and rounded.
4. A long wooden spoon #C98B54 lying diagonally, round bowl at one end.
5. An open glass jar of dark brown chocolate frosting #5A3220 with a thick glossy drip
   running down the outside.
6. A small clear bag of round sprinkles in red, blue, green and yellow, tied at the neck
   with a white twist.
7. A metal cake spatula, light gray blade #C7CDD6 with a black handle, seen flat.
8. A birthday candle with pink and white diagonal stripes, unlit, standing upright.

Every frame contains ONE object, alone, centered, drawn at the same visual weight as the
others, filling about 80% of its frame. Nothing crosses the invisible line between two
frames. No frame is empty. The eight objects must NOT share a palette or a silhouette
family: each one keeps its own natural color.

[estilo comum] [negativo comum]
```

## 5. `itens-n1-b.png` ✔ — 1200 x 600, grade 4 x 2 de 300

A tarefa **arrumar o piquenique**, cortada no meio.

| Frame | Objeto | Parte |
|---|---|---|
| 0 | sanduíche montado | comida |
| 1 | garrafa de suco de laranja | comida |
| 2 | maçã vermelha | comida |
| 3 | cacho de uvas roxas | comida |
| 4 | bola de futebol | brincadeira |
| 5 | bambolê azul e amarelo | brincadeira |
| 6 | pipa vermelha com rabiola | brincadeira |
| 7 | corda de pular enrolada | brincadeira |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 300
by 300 pixels, transparent background. Cartoon picnic and playtime objects for a
children's game.

Frames, left to right then top to bottom:
1. A closed sandwich seen from the side: two slices of pale bread with a green lettuce
   leaf and a red tomato slice poking out.
2. A glass bottle of orange juice with a red cap and a rounded body.
3. A single shiny red apple with a short brown stem and one green leaf.
4. A hanging bunch of purple grapes with a small green stem on top.
5. A classic soccer ball, white with black pentagons.
6. A hula hoop ring seen slightly tilted, painted in alternating blue #38BDF8 and yellow
   #F4C542 bands, hollow in the middle.
7. A red diamond kite with a green cross bar and a long wavy tail with three small bows,
   flying diagonally.
8. A jump rope coiled into a loose loop, cream cord with two red wooden handles.

Every frame contains ONE object, alone, centered, drawn at the same visual weight as the
others, filling about 80% of its frame. Nothing crosses the invisible line between two
frames. No frame is empty. The eight objects must NOT share a palette or a silhouette
family: each one keeps its own natural color.

[estilo comum] [negativo comum]
```

## 6. `final-n1.png` ✔ — 1600 x 800, grade 4 x 2 de 400

A **fase final** das duas tarefas: quadros 0 a 3 são o bolo se montando na
bancada, 4 a 7 são o piquenique. Cada quadro é o estado seguinte do anterior.

| Frame | Estado |
|---|---|
| 0 | forma de bolo vazia |
| 1 | a mesma forma com a massa crua dentro |
| 2 | o bolo assado, redondo e liso, fora da forma |
| 3 | o bolo coberto de chocolate, com confeitos e a velinha acesa |
| 4 | toalha xadrez dobrada |
| 5 | a mesma toalha estendida na grama, vazia |
| 6 | a toalha com a cesta aberta em cima |
| 7 | o piquenique posto: toalha, cesta, sanduíche, suco, uvas e a bola ao lado |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 400
by 400 pixels, transparent background. Cartoon step-by-step results for a children's
cooking and picnic game, seen from a slight three-quarter angle.

Frames 1 to 4 are the SAME cake, in four stages. Frames 5 to 8 are the SAME picnic
blanket, in four stages. Keep the object identical between its own stages: same shape,
same colors, same angle. Only the thing the step changed may change.

Frames, left to right then top to bottom:
1. An empty round cake pan, light gray metal #C7CDD6 with a fluted rim, seen from
   slightly above so the empty inside is visible.
2. The SAME cake pan, now filled with smooth pale yellow raw batter level with the rim.
3. The SAME cake, baked and turned out of the pan: a plain golden brown sponge, round,
   flat on top, no decoration, sitting on a white plate.
4. The SAME cake, now covered in glossy dark chocolate frosting with colorful sprinkles
   on top and one lit pink striped candle in the center, small warm glow on the flame.
5. A red and white checkered picnic blanket, folded into a neat square.
6. The SAME blanket, unfolded and spread flat on green grass, completely empty.
7. The SAME spread blanket with an open wicker picnic basket standing on it, lid up and
   empty.
8. The SAME spread blanket, now set: the basket, a sandwich, an orange juice bottle, a
   bunch of grapes on a plate, and a soccer ball resting on the grass at the edge.

Every frame contains ONE scene, alone, centered, filling about 85% of its frame. Nothing
crosses the invisible line between two frames. No frame is empty.

[estilo comum] [negativo comum]
```

---

# NÍVEL 2 — o café da manhã na varanda

Fundo: `fundo-n2.png` (§13).

Este é o nível que o texto oficial da habilidade descreve. A tarefa maior é
**servir o café da manhã**, e ela já chega partida em duas tarefas — o café e o
sanduíche —, cada uma cortada de novo no meio pela criança.

| Tarefa | Corte 1 | Corte 2 |
|---|---|---|
| **Passar o café** | esquentar a água | passar o café |
| **Fazer o sanduíche** | o pão | o recheio |

## 7. `itens-n2-a.png` ✔ — 1200 x 600, grade 4 x 2 de 300

| Frame | Objeto | Parte |
|---|---|---|
| 0 | jarra de vidro com água | esquentar a água |
| 1 | chaleira de metal | esquentar a água |
| 2 | caixa de fósforos | esquentar a água |
| 3 | luva de cozinha | esquentar a água |
| 4 | pacote de pó de café | passar o café |
| 5 | coador de pano com aro de madeira | passar o café |
| 6 | xícara branca com pires | passar o café |
| 7 | açucareiro de vidro | passar o café |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 300
by 300 pixels, transparent background. Cartoon breakfast and coffee objects for a
children's game.

Frames, left to right then top to bottom:
1. A clear glass pitcher with a handle, filled with pale blue water, one soft highlight
   on the glass.
2. A round metal kettle #9FB0C0 with a curved spout, a black handle and a small lid
   knob. Cold, no steam.
3. A closed box of matches, red with a dark striking strip along one side, standing at a
   slight angle.
4. A quilted oven mitt in green and white checks, thumb pointing up.
5. A dark brown paper bag of ground coffee, top rolled down, plump and standing.
6. A cloth coffee filter: a beige fabric cone hanging inside a round wooden ring #C98B54
   with a short handle.
7. A white ceramic cup on a white saucer, empty, seen from the side.
8. A small clear glass sugar bowl with a rounded lid, full of white sugar.

Every frame contains ONE object, alone, centered, drawn at the same visual weight as the
others, filling about 80% of its frame. Nothing crosses the invisible line between two
frames. No frame is empty. The eight objects must NOT share a palette or a silhouette
family: each one keeps its own natural color.

[estilo comum] [negativo comum]
```

## 8. `itens-n2-b.png` ✔ — 1200 x 600, grade 4 x 2 de 300

| Frame | Objeto | Parte |
|---|---|---|
| 0 | pão francês | o pão |
| 1 | faca de mesa | o pão |
| 2 | tábua de madeira | o pão |
| 3 | potinho de manteiga | o pão |
| 4 | fatia de queijo | o recheio |
| 5 | fatia de presunto | o recheio |
| 6 | rodela de tomate | o recheio |
| 7 | folha de alface | o recheio |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 300
by 300 pixels, transparent background. Cartoon sandwich ingredients and kitchen tools
for a children's game.

Frames, left to right then top to bottom:
1. A whole golden crusty bread roll seen from the side, with a scored line along the
   top, uncut.
2. A table knife lying diagonally, light gray blade #C7CDD6 with a dark navy handle.
3. A rectangular wooden cutting board #C98B54 with a round hole at one end, seen from a
   slight angle, completely empty.
4. A small white tub of pale yellow butter with the lid off and a soft swirl on top.
5. A single square slice of bright yellow cheese with three round holes, one corner
   slightly curled.
6. A single oval slice of pink ham with a wavy edge, lying flat.
7. A round slice of red tomato seen from above, with the pale seed pattern inside.
8. A single ruffled green lettuce leaf, curled and airy.

Every frame contains ONE object, alone, centered, drawn at the same visual weight as the
others, filling about 80% of its frame. Nothing crosses the invisible line between two
frames. No frame is empty. The eight objects must NOT share a palette or a silhouette
family: each one keeps its own natural color.

[estilo comum] [negativo comum]
```

## 9. `final-n2.png` ✔ — chegou em 1774 x 887, grade 4 x 2 de 443,5

O que a criança executa na fase final: pega a água, joga na chaleira, esquenta,
passa no coador, enche a xícara. E, do outro lado, corta o pão, passa manteiga,
monta o sanduíche. **É a folha que mostra a receita acontecendo.**

| Frame | Estado |
|---|---|
| 0 | a chaleira fria, cheia de água, com a tampa aberta |
| 1 | a mesma chaleira no fogo, apitando, soltando vapor |
| 2 | o coador com pó de café sobre a xícara, a água quente passando |
| 3 | a xícara de café pronta, fumegando, com o açucareiro do lado |
| 4 | o pão inteiro na tábua |
| 5 | o mesmo pão aberto ao meio na tábua |
| 6 | as duas metades com manteiga passada |
| 7 | o sanduíche montado e fechado no prato |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 400
by 400 pixels, transparent background. Cartoon step-by-step breakfast preparation for a
children's game, seen from the side.

Frames 1 to 4 are the SAME kettle and cup, in four stages of making coffee. Frames 5 to
8 are the SAME bread roll on the SAME wooden board, in four stages of making a sandwich.
Keep every object identical between its own stages: same shape, same colors, same angle.
Only the thing the step changed may change.

Frames, left to right then top to bottom:
1. A round metal kettle #9FB0C0 with its lid open, full of pale blue water, standing
   cold on a small gray stove ring. No steam.
2. The SAME kettle, lid closed, on the SAME ring with orange flames #FF8A3D underneath,
   three curly white steam puffs rising from the spout.
3. A cloth filter in a wooden ring #C98B54 sitting on top of a white cup, dark brown
   coffee grounds inside, a thin stream of hot water pouring in from above and one steam
   curl.
4. The SAME white cup on its saucer, now full of dark coffee with a light crema ring,
   two steam curls rising, a small glass sugar bowl standing beside it.
5. A whole golden bread roll lying on a rectangular wooden cutting board #C98B54.
6. The SAME roll on the SAME board, now sliced open into two halves lying side by side,
   pale soft crumb facing up.
7. The SAME two halves on the SAME board, each spread with a thin layer of pale yellow
   butter, a table knife resting on the board edge.
8. The finished closed sandwich on a white plate: bread with yellow cheese, pink ham, a
   red tomato slice and a green lettuce leaf peeking out of the sides.

Every frame contains ONE scene, alone, centered, filling about 85% of its frame. Nothing
crosses the invisible line between two frames. No frame is empty.

[estilo comum] [negativo comum]
```

---

# NÍVEL 3 — acampar no quintal, à noite

Fundo: `fundo-n3.png` (§14).

| Tarefa | Corte 1 | Corte 2 |
|---|---|---|
| **Montar a barraca** | a barraca | a cama |
| **Fazer o lanche na fogueira** | a fogueira | o lanche |

No nível 3 a segunda parte tem **cadeado**: não dá para assar o marshmallow
antes de a fogueira estar acesa, nem arrumar a cama antes de a barraca estar em
pé. É a dependência entre partes.

## 10. `itens-n3-a.png` ✔ — 1200 x 600, grade 4 x 2 de 300

| Frame | Objeto | Parte |
|---|---|---|
| 0 | lona da barraca enrolada | a barraca |
| 1 | vareta de alumínio | a barraca |
| 2 | estaca laranja | a barraca |
| 3 | martelinho de borracha | a barraca |
| 4 | saco de dormir enrolado | a cama |
| 5 | travesseiro | a cama |
| 6 | colchonete enrolado | a cama |
| 7 | lanterna vermelha | a cama |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 300
by 300 pixels, transparent background. Cartoon camping gear for a children's game.

Frames, left to right then top to bottom:
1. A rolled up dark green tent canvas, tied with two black straps, lying horizontally.
2. A straight silver aluminum tent pole #C7CDD6 with a joint in the middle, standing
   diagonally.
3. A single orange plastic tent stake with a hooked top, pointing down.
4. A rubber mallet with a chunky yellow head and a black handle.
5. A rolled up blue sleeping bag with a lighter blue lining showing at the open end,
   tied with one strap.
6. A soft white pillow with a single gray stripe, plump, seen from the front.
7. A rolled up purple foam sleeping mat, the spiral visible at the end, standing
   upright.
8. A red hand flashlight lying at an angle, with a clear lens at one end and a small
   black switch on the body. Turned off.

Every frame contains ONE object, alone, centered, drawn at the same visual weight as the
others, filling about 80% of its frame. Nothing crosses the invisible line between two
frames. No frame is empty. The eight objects must NOT share a palette or a silhouette
family: each one keeps its own natural color.

[estilo comum] [negativo comum]
```

## 11. `itens-n3-b.png` ✔ — 1200 x 600, grade 4 x 2 de 300

| Frame | Objeto | Parte |
|---|---|---|
| 0 | feixe de gravetos | a fogueira |
| 1 | tora de lenha | a fogueira |
| 2 | caixa de fósforos | a fogueira |
| 3 | pedra de contorno | a fogueira |
| 4 | saco de marshmallows | o lanche |
| 5 | espeto de metal | o lanche |
| 6 | pacote de biscoitos | o lanche |
| 7 | barra de chocolate | o lanche |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 300
by 300 pixels, transparent background. Cartoon campfire and snack objects for a
children's game.

Frames, left to right then top to bottom:
1. A small bundle of thin light brown twigs #C08B52, tied in the middle with string.
2. A short thick log of dark brown firewood #7A4E28 seen from a three-quarter angle,
   with visible rings on the cut end.
3. A closed box of matches, red with a dark striking strip along one side.
4. A single rounded gray river stone #98A2AE with a lighter top highlight.
5. An open clear bag of white and pink marshmallows, a few visible inside.
6. A long thin metal skewer #C7CDD6 lying diagonally, with a small looped handle at one
   end.
7. A blue paper packet of round biscuits, top torn open with two biscuits sliding out.
8. A bar of dark chocolate #5A3220 with its squares scored, one corner of the silver
   wrapper folded back.

Every frame contains ONE object, alone, centered, drawn at the same visual weight as the
others, filling about 80% of its frame. Nothing crosses the invisible line between two
frames. No frame is empty. The eight objects must NOT share a palette or a silhouette
family: each one keeps its own natural color.

[estilo comum] [negativo comum]
```

## 12. `final-n3.png` ✔ — 1600 x 800, grade 4 x 2 de 400

| Frame | Estado |
|---|---|
| 0 | a lona estendida no chão com as estacas ao lado |
| 1 | a barraca armada, fechada |
| 2 | a mesma barraca com a porta aberta, vazia por dentro |
| 3 | a mesma barraca com a cama arrumada dentro e a lanterna acesa |
| 4 | os gravetos e as pedras montados, apagados |
| 5 | a mesma fogueira acesa |
| 6 | o marshmallow branco no espeto, sobre a fogueira |
| 7 | o lanche pronto: marshmallow tostado entre dois biscoitos com chocolate |

```text
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 400
by 400 pixels, transparent background. Cartoon step-by-step camping results for a
children's game, seen from the side in neutral lighting.

Frames 1 to 4 are the SAME tent, in four stages. Frames 5 to 8 are the SAME campfire, in
four stages. Keep the object identical between its own stages: same shape, same colors,
same angle. Only the thing the step changed may change.

Frames, left to right then top to bottom:
1. A dark green tent canvas lying flat and unfolded on the ground, wrinkled, with three
   orange stakes and one silver pole placed neatly beside it.
2. The SAME canvas now standing as a pitched A-frame tent, dark green with a lighter
   green trim, door flap zipped shut, stakes in the ground at the corners.
3. The SAME tent with the front door flap rolled open, showing an empty dark interior.
4. The SAME open tent, now with a blue sleeping bag unrolled inside, a white pillow at
   the back and a red flashlight switched ON casting a soft warm pool of light.
5. A ring of gray river stones with a neat stack of light brown twigs and one dark log
   inside. Unlit, no flame.
6. The SAME stone ring and wood, now burning: bright orange and yellow flames #FF8A3D
   and #FFD166 rising, a few small sparks, warm glow on the stones.
7. The SAME burning campfire with a long metal skewer held over it, one white
   marshmallow on the tip, still pale.
8. A finished s'more on a white napkin: a golden toasted marshmallow squeezed between
   two round biscuits with a slab of dark chocolate, slightly melting at the edges.

Every frame contains ONE scene, alone, centered, filling about 85% of its frame. Nothing
crosses the invisible line between two frames. No frame is empty.

[estilo comum] [negativo comum]
```

---

# OS FUNDOS

Os três fundos são **o mesmo quintal em três horas do dia**: manhã de festa,
amanhecer do café e noite de acampamento. Isso não é enfeite — é o que faz o
`chao.png` de terra e grama continuar servindo aos três níveis, e é o que dá ao
jogo a sensação de um dia inteiro na mesma casa.

Os dois valem a mesma regra do `fundo-n1.png`:

- 2048 x 768, preenchendo a tela toda de borda a borda;
- **emenda consigo mesmo**: a borda esquerda continua a direita, porque a
  imagem se repete enquanto a câmera anda pelo mapa de 3200 px;
- **o terço de baixo fica escondido atrás dos blocos do chão** — nada
  importante ali;
- **sem contorno escuro** nos elementos distantes: é fundo, e não pode competir
  com o herói e com os itens que passam na frente.

## 13. `fundo-n2.png` ✔ — 2048 x 768

A varanda dos fundos da casa, ao amanhecer. É onde o café da manhã é feito: a
porta da cozinha aberta, a horta ao lado e a torneira do jardim de onde sai a
água que vai para a chaleira.

```text
Wide flat 2D cartoon background for a children's platformer, 2048 by 768 pixels,
filling the whole canvas edge to edge. The back porch of a friendly house at SUNRISE.

Warm dawn sky: a soft gradient from peach #FFC48C near the horizon up to light blue
#7FB7E0, with two or three long flat clouds tinted pink and a low round sun near the
left. On the left third, the back wall of a simple house with an OPEN kitchen door and a
lit window, a couple of steps and a low wooden porch rail. In the middle, a garden tap
on a short pipe with a watering can beside it, a vegetable patch with rows of small
leafy plants, and a stack of firewood against the wall. On the right, two leafy trees
and a wooden fence running across the middle distance, with a clothesline between them.

Everything soft and low contrast, clearly BACKGROUND: no dark outlines on the far
elements, muted warm colors, nothing sharp that would compete with the characters in
front. The LEFT and RIGHT edges must match so the image can be repeated seamlessly side
by side. The bottom third must be plain, empty ground color with nothing drawn on it.

[negativo comum]
```

## 14. `fundo-n3.png` ✔ — 2048 x 768

O mesmo quintal, à noite. Precisa ser **escuro e ainda assim legível**: se o
fundo virar preto, o contorno navy do herói some dentro dele.

```text
Wide flat 2D cartoon background for a children's platformer, 2048 by 768 pixels,
filling the whole canvas edge to edge. A friendly backyard at NIGHT, calm and safe,
never scary.

Deep blue night sky #22315E fading to a slightly lighter blue #35497F near the horizon,
scattered small cream stars #FFF3C4 and a large round pale moon in the upper right with
a soft halo. On the left third, the same simple house wall in blue silhouette with ONE
warmly lit yellow window. Across the scene: rounded bushes and two leafy trees in dark
blue-green silhouette #2C4A44, a wooden fence in dark blue, and a few small yellow
fireflies floating between the bushes. A faint warm orange glow low on the right, as if
a campfire were just out of frame.

Keep the whole image at MEDIUM darkness, never black: the characters in front are
outlined in dark navy #1F2A37 and must stay readable against it. Everything soft and low
contrast, clearly BACKGROUND, no dark outlines on the far elements. The LEFT and RIGHT
edges must match so the image can be repeated seamlessly side by side. The bottom third
must be plain, empty dark ground color with nothing drawn on it.

[negativo comum]
```

---

# O QUE JÁ ESTAVA PEDIDO

## 16. `mesa.png` — 900 x 420

A mesa do plano, onde os oito objetos da tarefa esperam a criança dividir. O
**tampo tem que estar no alto da imagem**: o jogo apoia os objetos na linha do
tampo e desenha a sombra deles ali.

```text
A single cartoon wooden garden table seen straight from the SIDE-FRONT, 900 by 420
pixels, transparent background. Warm wood #C98B54 with darker planks #9A6A3C, a thick
flat top, two sturdy legs with a crossbar. Thick dark navy outline #1F2A37, flat colors,
one soft shadow under the legs.

The TABLE TOP must be a straight horizontal surface across the FULL width of the image
and its upper edge must sit at about 8% of the image height, so objects placed on it
line up. The top is completely EMPTY — nothing on it. No tablecloth, no objects, no
text.

[estilo comum] [negativo comum]
```

## 18. `cover-missao-em-pedacos.png` ✔ — 1672 x 941

A capa mostra **o jogo**: o herói de mochila laranja no meio de um pulo, sobre
um bloco de terra com grama, com dois itens flutuando à frente dele (a chaleira
e o pão) e um buraco no chão à direita. Fundo de quintal claro, mesmo traço das
outras peças. Sem texto — o título entra por cima, na plataforma.

---

## 19. Como as texturas entram

Por `import.meta.glob`, nunca por `import` estático:

```ts
const ART = import.meta.glob('../../../../assets/games/EF03CO03/missao-em-pedacos/*.png', {
    eager: true, import: 'default',
}) as Record<string, string>
```

| Prefixo | Como carrega |
|---|---|
| `itens-nN-a`, `itens-nN-b` | `spritesheet` de **300 x 300** |
| `final-nN` | `spritesheet` de **400 x 400** |
| `heroi` | `spritesheet` de **300 x 450** |
| `chao` | `spritesheet` de **300 x 300** |
| `lixo` | `spritesheet` de **256 x 256** |
| `fundo-nN`, `bancada`, `mesa` | `image` |

O `BootScene` carrega só o que o nível em jogo usa — o conjunto sai dos próprios
dados (`task.sheetKey`, `task.finalKey`), então uma folha nova entra em jogo só
por aparecer no `levels.ts`.

Tudo consumido com `textures.exists(key)`: **sem PNG nenhum na pasta, o jogo
abre e é jogável** com as reservas de `Graphics`.

| Faltando | Reserva |
|---|---|
| `itens-nN-*` | o nome do objeto escrito, no lugar do desenho |
| `final-nN` | a pilha dos objetos usados crescendo na bancada |
| `fundo-n2` | gradiente de amanhecer |
| `fundo-n3` | gradiente de noite com pontinhos claros |
| `mesa` | mesa desenhada: tampo grosso, saia e duas pernas |
| `lixo` | meia cinza com três ondinhas verdes |

A reserva de `final-nN` merece uma linha: ela não é um retângulo com texto. Os
objetos que a criança usa **ficam na bancada, em duas fileiras**, e a pilha que
cresce conta a história no lugar do desenho do resultado. Quando a folha existe,
os objetos desaparecem dentro do resultado e é ele que muda.

---

## 20. Quando as folhas chegarem

1. **Meça a caixa alfa de cada quadro** antes de ancorar qualquer coisa. Foi o
   que salvou o `heroi.png` (veio em 300 x 450, não em 256, com os pés em 91,2%
   da altura do quadro) e o `chao.png` (veio com quatro quadros, sem a ponta
   direita, que o jogo resolve espelhando a ponta esquerda).
2. **Confira a regra 1 na folha inteira**, não item por item: ponha os oito
   lado a lado e pergunte se dá para separar as duas partes só pela cor. Se
   der, a folha volta.
3. **Confira a regra 2 nas folhas `final-nN`**: os quatro quadros de uma
   sequência têm que parecer o mesmo objeto mudando, e não quatro objetos.
4. **Não confie na medida pedida.** O `final-n2.png` chegou em 1774 x 887 e o
   carregador teve que passar a cortar a grade pela medida real do arquivo, com
   1 px de margem por quadro. Vale para qualquer folha nova.

---

## 21. O que ainda falta

**Nada de obrigatório.** Os dois fundos chegaram e os três níveis rodam com a
arte completa.

O `mesa.png` (§16) continua opcional: a mesa do corte é desenhada em
`Graphics`, e ela já está legível.

> **Os fundos não precisam emendar, e não emendam.** O parallax é calculado,
> não fixo: `min(0,35, folga / rolagem)`, com folga de 640 px. Como os mapas
> cresceram para 6.480 e 6.840, o fator caiu para cerca de 0,12 — o fundo anda
> mais devagar, que é justamente o que "longe" quer dizer, e uma cópia só cobre
> a fase inteira.
