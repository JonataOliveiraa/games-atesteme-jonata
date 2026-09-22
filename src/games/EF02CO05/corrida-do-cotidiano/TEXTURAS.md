# Corrida do Cotidiano - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF02CO05/corrida-do-cotidiano/`

---

## 0. Estado dos arquivos

**O que já existe**, medido no arquivo entregue. Estes números mandam — os
tamanhos pedidos nos prompts abaixo eram só sugestão, e a arte veio em outra
escala:

| Arquivo | Tamanho | Grade | Medidas em [PISTA.md](./PISTA.md) |
|---|---|---|---|
| `corredor.png` | 280 x 1680 | 1 x 6 de 280 | §1.1 |
| `tecnologias.png` | 1400 x 1050 | 4 x 3 de 350 | ordem confere com o §6 |
| `grama.png` | 1672 x 941 | — | §1.3, horizonte curvo |
| `cone.png` | 512 x 512 | — | baliza a beira da pista, base em 98,4% |
| `moita.png` | 340 x 240 | — | idem, base em 94,6% |

O cenário veio **desmontado**: grama de um lado, cone e moita como objetos que
se movem. É melhor do que o fundo único que este documento pedia — o cone passa,
a moita passa — e joga a perspectiva toda para o código. Como isso é feito, e
onde estão os bugs, está em [PISTA.md](./PISTA.md).

**`casa.png` saiu do jogo**, pelo mesmo caminho do portão: o cenário é uma
pista de atletismo, e casa na beira de pista de corrida não existe. Ela está na
lista `SKIP` do `BootScene` e `cone.png` ocupou o lugar dela.

**`portao.png` saiu do jogo.** A placa dele era pequena demais para o objeto
da tecnologia (§15 do PLANEJAMENTO), e o portão virou duas placas de beira de
pista desenhadas em `Graphics`. O arquivo continua na pasta, mas o `BootScene`
não carrega — dá para apagar.

**`cover-corrida-do-cotidiano.png` foi refeita** junto com a pista: a primeira
versão mostrava a criança correndo no meio de uma rua de asfalto com casas dos
dois lados — o cenário que saiu do jogo — e ainda escrevia CONTIDIANO no lugar
de COTIDIANO. A capa de agora é a pista de borracha com os cones, e o título
está escrito certo.

**O que falta:**

| Arquivo | Tamanho | Grade | Para quê | Sem ele |
|---|---|---|---|---|
| `situacoes.png` | 3 x 350 x 350 | 3 x 3 | os 9 pictogramas do balão | o balão fica só com a frase |
| `mapa-bairro.png` | 1672 x 941 | — | o mapa do fim do trecho | mapa em `Graphics` |
| `arquibancada.png` | 340 x 240 | — | fundo dos trechos 2 e 3 | moita e tufo de grama |

A pista **não entra na lista**: ela é `Graphics`, desenhada por cima da grama, e
o motivo está no §9 do PISTA.

O jogo roda sem qualquer um deles — cada peça tem desenho de reserva (§14 do
PLANEJAMENTO) — e roda feio.

**Nada de painel, cartão, botão, moldura, seta, cadeado, estrela, balão, barra
ou brilho.** Tudo isso é `Graphics`, porque muda de cor e tamanho a cada estado
e porque é o que mantém o jogo jogável com zero textura carregada. Depois que o
portão saiu, **nenhuma** peça de interface é PNG.

---

## 1. Estilo comum

```
flat 2D cartoon educational game asset for children, simple rounded shapes, bold
readable silhouette, thick dark outline, bright friendly colors, minimal detail, flat
colors, one soft shadow, no text, transparent background
```

## 2. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, tiny details, brand logo, text,
letters, numbers, words, watermark, signature, frame, border, grid lines, cropped, cut
off, white background, motion blur, lens flare
```

Nada de texto, letra, número ou marca dentro da textura. O jogo escreve as
palavras por cima, com a fonte dele.

## 3. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| céu | `#8FD3F5` claro `#DFF3FF` |
| piso da pista | `#D4674A` escuro `#B95436` |
| borda da pista | `#93402A`, linhas `#FFF6DF` |
| grama | `#7FC96A` escura `#4E9A45` |
| cone | `#F07A2E` faixa `#F6E3C5` |
| portão certo / acerto | `#35D07F` |
| erro / alerta | `#F59E0B` |
| madeira do portão | `#C89A5B` escura `#8A6231` |
| metal do portão | `#CBD9E8` escuro `#7E97B0` |
| camiseta do corredor | `#FBBF24` |
| calça do corredor | `#3B82F6` |
| tênis do corredor | `#EF4444` |

---

## 4. `corredor.png` - 400 x 2400, grade 1 x 6

Seis quadros de 400 x 400, empilhados numa coluna. O corredor aparece a ~200 px
de altura na grade, ~60 px reais no celular: a silhueta é tudo, detalhe de rosto
não sobrevive.

Visto **de trás**, levemente de cima, porque é um jogo de corrida em terceira
pessoa: a criança precisa ver o mesmo que o personagem vê.

```
Sprite sheet with 6 frames in a strict 1-column by 6-row grid, every frame exactly
400 by 400 pixels, transparent background.

The SAME cheerful cartoon child in all six frames, seen from BEHIND at a slight high
angle, as in a third-person running game. Short simple hair, yellow t-shirt #FBBF24,
blue shorts #3B82F6, red sneakers #EF4444, small backpack. Thick dark outline #1F2A37,
flat colors, one soft shadow under the feet. The child fills about 80% of the frame
height and is centered horizontally, feet touching the very bottom edge of the frame.
Keep the head at exactly the same height in all six frames.

Frames, top to bottom:
1. RUN, contact: right leg forward and planted, left leg back, arms swinging opposite.
2. RUN, passing: legs close together under the body, both arms mid-swing, body slightly
   higher.
3. RUN, contact mirrored: left leg forward and planted, right leg back.
4. RUN, passing mirrored: legs close together again, arms mid-swing the other way.
5. STOPPED, blocked: standing still, feet together, shoulders dropped, head tilted
   slightly down, arms hanging, a small disappointed but still friendly posture.
6. CELEBRATING: still seen from behind, both arms raised up in victory, one foot lifted,
   happy and bouncy.

[estilo comum] [negativo comum]
```

Depois que chegar: **meça a caixa alfa de cada quadro** e ancore o layout nela.
Os pés precisam bater na mesma linha nos seis quadros — é o que impede o
personagem de flutuar quando troca de animação.

---

## 5. ~~`portao.png`~~ - substituído por placas em `Graphics`

> **Não gerar de novo.** A placa do desenho entregue não comportava o objeto da
> tecnologia em tamanho legível no celular. O prompt fica como registro.

Dois quadros de 512 x 512. O portão nasce pequenininho no horizonte e chega a
340 x 300 px na grade, então precisa ler bem em 75 px de largura.

O objeto da tecnologia **não vem aqui**: o código desenha por cima, tirado de
`tecnologias.png`. O portão precisa ter a **placa lisa e vazia** onde ele
encaixa.

```
Sprite sheet with 2 frames in a strict 1-column by 2-row grid, every frame exactly
512 by 512 pixels, transparent background.

The SAME friendly cartoon garden gateway in both frames, seen straight from the front,
centered, standing on the ground line at the bottom of the frame. Two chunky rounded
side posts in warm wood #C89A5B with darker wood #8A6231 edges, joined by a wide
horizontal top beam. Thick dark outline #1F2A37, flat colors, one soft shadow at the
base. Cheerful and inviting, like the entrance of a garden, never a prison and never
scary.

Mounted on the top beam there is a large EMPTY signboard: a plain rounded rectangle of
about 230 by 180 pixels, flat light wood, completely blank inside, no drawing and no
text on it. Keep this signboard in EXACTLY the same position and size in both frames.

Frame 1 (top): GATE OPEN. The opening between the posts is completely EMPTY and fully
transparent, so the road shows through. Two small open door leaves are folded flat
against the outer side of each post. Small green leaves #35D07F growing at the base of
the posts.

Frame 2 (bottom): GATE CLOSED. The same gateway, with a chunky rounded barrier of
vertical bars in light steel #CBD9E8 filling the opening from the top beam down to the
ground, clearly blocking the way. The bars are thick and rounded, widely spaced, still
friendly. Two small amber #F59E0B rounded bumpers at the sides.

[estilo comum] [negativo comum]
```

---

## 6. `tecnologias.png` - 1024 x 768, grade 4 x 3

Doze quadros de 256 x 256, na ordem exata abaixo — **a ordem dos quadros é o
índice do frame, e é contrato com o código.**

Nove resolvem alguma situação do nível 1; três (liquidificador, ventilador,
vassoura) nunca resolvem nada e existem para serem o portão errado.

| Frame | Objeto | Frame | Objeto |
|---|---|---|---|
| 0 | relógio | 6 | telefone |
| 1 | geladeira | 7 | câmera fotográfica |
| 2 | caixinha de som | 8 | computador |
| 3 | televisão | 9 | liquidificador |
| 4 | micro-ondas | 10 | ventilador |
| 5 | máquina de lavar | 11 | vassoura |

```
Sprite sheet with 12 frames in a strict 4-column by 3-row grid, every frame exactly
256 by 256 pixels, transparent background.

Twelve everyday household objects for a children's educational game, each one drawn
alone, centered in its frame, seen straight from the front, filling about 78% of the
frame with empty margin all around. All twelve in the SAME style and the same visual
weight: chunky rounded shapes, thick dark outline #1F2A37, flat colors, one soft
shadow. Simple and instantly recognizable by a 7 year old. No text, no letters, no
numbers, no digits on any screen or display, no brand logos.

Frames, left to right then top to bottom:
1. A round wall CLOCK with a plain white face, two simple hands and no numbers.
2. A tall two-door REFRIGERATOR in light blue, with two small handles.
3. A small portable BLUETOOTH SPEAKER, a rounded box with a mesh front and one knob,
   with two little music-note shapes floating beside it.
4. A flat-screen TELEVISION on a small stand, screen blank and dark, no image inside.
5. A MICROWAVE OVEN, a boxy appliance with a dark blank glass door and a handle.
6. A front-loading WASHING MACHINE with a big round blank window and a few soap bubbles.
7. A home TELEPHONE: a rounded base with a handset resting on top and a short curly cord.
8. A PHOTO CAMERA, a chunky rounded body with a big round lens and a flash bulb.
9. A desktop COMPUTER: a monitor with a blank dark screen, a keyboard in front of it and
   a small mouse.
10. A kitchen BLENDER: a motor base with a tall jar on top, with pieces of fruit inside.
11. An electric FAN with a round grille, three blades and a small base.
12. A wooden BROOM with straw bristles, standing upright.

[estilo comum] [negativo comum]
```

---

## 7. `situacoes.png` - 768 x 768, grade 3 x 3

Nove quadros de 256 x 256, um por situação do nível 1. Aparecem dentro do balão,
a 92 px na grade.

**A regra que manda neste arquivo:** o pictograma mostra a **necessidade**,
nunca o aparelho que resolve. Se a situação "que horas são" for desenhada com um
relógio, a criança combina desenho com desenho e o jogo deixa de ensinar
qualquer coisa. Nenhum dos nove quadros pode conter um objeto que apareça em
`tecnologias.png`.

| Frame | Situação | O que desenha |
|---|---|---|
| 0 | Que horas são? | criança apontando o pulso vazio, ombros levantados |
| 1 | Guardar a comida gelada | pote de comida tampado com um floco de neve ao lado |
| 2 | Ouvir uma música | criança com a mão em concha na orelha e notas musicais |
| 3 | Assistir ao desenho | criança sentada no tapete com pipoca, olhando para frente |
| 4 | Esquentar o leite | copo de leite com fumacinha subindo |
| 5 | Lavar a roupa suja | pilha de roupa amassada com manchas e uma moscona |
| 6 | Falar com a vó que mora longe | vovó acenando, com um coração e uma estradinha atrás |
| 7 | Guardar a foto do passeio | moldura de retrato vazia com um coração |
| 8 | Descobrir como se faz o bolo | tigela com ovos e farinha, criança dando de ombros |

```
Sprite sheet with 9 frames in a strict 3-column by 3-row grid, every frame exactly 256
by 256 pixels, transparent background.

Nine simple cartoon pictograms for a children's educational game, each one centered in
its frame, filling about 75% of the frame with empty margin all around, thick dark
outline #1F2A37, flat colors, one soft shadow, bright and friendly. Each pictogram
shows a NEED or a small everyday scene, never an appliance and never a machine. No
text, no letters, no numbers, no clocks, no screens, no electronic devices anywhere.

Frames, left to right then top to bottom:
1. A child pointing at their own bare wrist, shoulders shrugged, palms open, wondering.
2. A closed food container with a lid, with a single blue snowflake beside it.
3. A child cupping a hand behind their ear, with two music notes floating nearby.
4. A child sitting cross-legged on a rug holding a bowl of popcorn, looking forward and
   smiling, with nothing in front of them.
5. A tall glass of milk with three little curls of warm steam rising from it.
6. A messy pile of crumpled dirty clothes with a few stains and one cartoon fly.
7. A smiling grandmother waving, with a small heart above her and a tiny winding road
   behind her showing distance.
8. An empty rounded picture frame with a small heart inside it.
9. A mixing bowl with eggs, flour and a whisk, and a child beside it shrugging with open
   hands.

[estilo comum] [negativo comum]
```

---

## 8. ~~`bg-casa.png`~~ - substituído por `grama.png` + objetos soltos

> **Não gerar.** A arte veio desmontada, e ficou melhor assim: `grama.png` é só
> o chão, o céu é gradiente em `Graphics`, o asfalto é `Graphics` por cima da
> grama, e casa e moita são objetos que se aproximam. O prompt abaixo fica como
> registro, e serve se um dia o trecho da escola ou da praça pedir um fundo
> chapado.

Um arquivo só, sem grade. **A pista vem desenhada aqui dentro**, e é o que evita
a costura entre o fundo em PNG e um chão em `Graphics`. O código desenha por
cima apenas as listras correndo e o brilho da faixa escolhida.

A geometria não é decoração, é contrato com o `layout.ts`:

| Elemento | Onde, em fração da imagem |
|---|---|
| linha do horizonte | 50% da altura |
| largura da pista no horizonte | 15% da largura, centrada |
| largura da pista embaixo | 69% da largura, centrada |
| calçadas | dos dois lados da pista, até as bordas |

```
A wide cartoon background for a children's running game, 1672 by 941 pixels, seen from
a runner's third-person point of view, looking straight down a residential street.

The horizon line is exactly at the middle height of the image. Above it: a bright
friendly sky #8FD3F5 fading to #DFF3FF near the horizon, a few soft rounded clouds, and
a row of simple cheerful cartoon houses along the horizon with warm cream walls #F6E3C5
and red roofs #E06C4F, small and low, none of them tall enough to reach the top of the
image.

Below the horizon: a straight ASPHALT ROAD in grey #6B7280 drawn in perspective as a
symmetrical trapezoid, narrow at the horizon (about 15% of the image width, centered)
and wide at the bottom edge (about 69% of the image width, centered), reaching the very
bottom of the image. The road surface is completely PLAIN: no lane markings, no stripes,
no arrows, no cracks, no text. On both sides of the road, cream sidewalks #E7D9C0 with a
simple raised curb, then green lawn #7FC96A filling the rest down to the bottom corners.
Low simple hedges and a couple of small trees along the sidewalks, far from the center.

Thick dark outline #1F2A37 on the big shapes, flat colors, warm daylight, calm and
uncluttered. The central area of the road must stay empty and clean, with nothing
standing on it.

[estilo comum, sem transparência: a imagem é opaca e preenche a moldura inteira]
[negativo comum]
```

`bg-escola.png` e `bg-praca.png` usam **exatamente o mesmo prompt**, trocando só
as casas do horizonte por um prédio de escola com pátio e bandeira, e por uma
praça com árvores grandes, banco e chafariz. A pista precisa ficar na mesma
posição e com a mesma largura nos três, senão o portão descola do asfalto na
troca de trecho.

---

## 9. ~~`cenario.png`~~ - substituído por `casa.png` e `moita.png`

> **Não gerar como folha.** Os objetos de beira de pista vieram em arquivo
> separado, um por objeto, que é o formato certo para coisa que se move sozinha.
> Se faltar variedade depois do nível 1 rodar, o próximo pedido é mais um
> arquivo solto (poste, banco, lixeira), no mesmo tamanho de 340 x 240 e com a
> base do desenho encostando na borda de baixo.

Seis quadros de 256 x 256. São os objetos que nascem no horizonte e passam
crescendo pelas laterais — é deles que vem a sensação de velocidade.

Cada objeto **apoiado exatamente na borda de baixo do quadro**: o código ancora
por baixo, e um pé flutuante vira objeto voando.

| Frame | Objeto | Frame | Objeto |
|---|---|---|---|
| 0 | poste de luz | 3 | banco de praça |
| 1 | árvore | 4 | lixeira |
| 2 | arbusto em vaso | 5 | caixa de correio |

```
Sprite sheet with 6 frames in a strict 3-column by 2-row grid, every frame exactly 256
by 256 pixels, transparent background.

Six simple cartoon street objects for a children's game, each one alone and centered
horizontally, seen straight from the front, standing with its base touching the very
bottom edge of its own frame. Thick dark outline #1F2A37, flat colors, one soft shadow
at the base, no ground plate under them.

Frames, left to right then top to bottom:
1. A STREET LAMP: a slim pole with a rounded lamp head, tall and simple.
2. A TREE: a straight brown trunk with a big round green canopy #7FC96A.
3. A POTTED BUSH: a terracotta pot with a rounded green shrub in it.
4. A PARK BENCH seen from the front, wooden slats and dark metal legs.
5. A TRASH BIN: a rounded green bin with a lid and a small handle.
6. A MAILBOX: a rounded box on a short post, in warm blue.

[estilo comum] [negativo comum]
```

---

## 10. `mapa-bairro.png` - 1672 x 941

A tela do fim do trecho. O mapa vem **vazio**: o código faz cada tecnologia
reconhecida voar e cair no lugar dela.

```
A cheerful cartoon neighborhood map for a children's game, 1672 by 941 pixels, seen
from above at a slight tilt, like a friendly board game board.

A curving street runs across the map and connects three clearly separated places, well
apart from each other: a small HOUSE with a red roof on the left, a SCHOOL building with
a yard in the middle, and a small PARK with trees, a bench and a fountain on the right.
Around them, green lawns, a few tiny generic rooftops, and simple trees.

Beside each of the three places there are THREE empty round plaques, drawn as plain
light circles with a soft dark rim and nothing inside them, arranged in a small row and
clearly waiting to be filled. Nine empty circles in total, all the same size, all
completely blank.

Thick dark outline #1F2A37, flat colors, warm daylight, soft and welcoming, plenty of
open space, no clutter, no text anywhere.

[estilo comum, sem transparência] [negativo comum]
```

---

## 11. `cover-corrida-do-cotidiano.png` - 1672 x 941

A capa do catálogo. É a única imagem que pode ter mais detalhe, porque nunca
aparece dentro do jogo. **Entregue**, na segunda versão: a primeira era de rua
com casas.

```
A colorful cartoon cover illustration for a children's educational game, 1672 by 941
pixels. A cheerful child seen from behind, running down a sunny two-lane athletics
running track with a terracotta red rubber surface and continuous white lane lines,
towards two big friendly wooden gateways standing side by side across the track. Each
gateway has a large blank signboard on its top beam: the left one shows a simple wall
clock, the right one shows a kitchen blender. Rows of bright orange traffic cones line
both edges of the track. Warm daylight, green lawn and low bushes beyond the cones,
soft green hills on the horizon, no houses and no street anywhere, dynamic and
inviting, plenty of empty sky at the top.

Thick dark outline #1F2A37, flat colors, bright and friendly, no text anywhere.

[estilo comum, sem transparência] [negativo comum]
```

---

## 12. O que continua em `Graphics`

Deliberadamente, porque é estado ou efeito, e PNG não muda de cor:

| Elemento | Motivo |
|---|---|
| balão da situação e plaquinha da trava | mudam de tamanho com a frase, e entram e saem |
| marcas da pista e brilho da raia acesa | são o movimento, e mudam a cada quadro |
| luz do portão abrindo, poeira, rastro | efeito |
| moldura verde do acerto e vermelha do erro | kit `FX` compartilhado |
| cadeado, seta, estrela, confete, véu | idem |
| barra do topo, pílula do nível, `?`, vidas | UI de plataforma, igual nos 49 jogos |

---

## 13. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `corredor`, `portao`, `tecnologias`, `situacoes`, `cenario` |
| Sem transparência | `bg-*`, `mapa-bairro`, `cover` são opacos |
| Recorte | grade exata, sem sangria entre quadros |
| Margem | cerca de 10% de área vazia por quadro nas folhas de objeto |
| Peso alvo | folhas até 600 KB; fundos até 1,5 MB |
| Sem | texto, letra, número, marca, moldura externa, linha de grade |

Se a geração vier com fundo branco, refazer sobre magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso: fundo branco atrás do corredor vira um retângulo
branco correndo pela pista.

---

## 14. Ordem

Entregues: `corredor`, `portao`, `tecnologias`, `grama`, `cone`, `moita`.

O que falta, em ordem:

1. `situacoes.png` — é a pergunta, e é o único que o nível 1 ainda sente falta.
2. `cover-corrida-do-cotidiano.png` — destrava o registro no catálogo.
3. `mapa-bairro.png` — a tela de fim de trecho.

Depois do nível 1 rodar e ser aprovado: os objetos de beira de pista da escola e
da praça.
