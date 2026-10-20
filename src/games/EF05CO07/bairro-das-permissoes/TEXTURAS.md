# Bairro das Permissões — texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF05CO07/bairro-das-permissoes/`
Planejamento: §4 o corpo, §5 o bairro, §6 o laço.

**Linha de arte: vetor geométrico chapado** ([`references/ESTILO-VETOR-GEOMETRICO.md`](../../../../references/ESTILO-VETOR-GEOMETRICO.md)), a mesma do Cabo Certo, o vizinho do 5º ano. Anexe em **toda geração** `references/23-vetor-geometrico-a.webp` (a fileira de gente andando: é a aula de corrida) e `references/24-vetor-geometrico-b.png`. O elenco das referências (a coruja verde, o urso, as pessoas) vai no negativo de todos os prompts.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código (`scenes/fallback.ts`) nas mesmas chaves, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

**Ficam no código para sempre:** as ruas, a praça e a cerca do bairro (dependem de onde as casas estão), a **placa** redonda do telhado com o ícone por cima, o nome de cada casa, a fumaça e a seta da casa que chama, a bolinha de luz que leva a peça, o pedido flutuando em cima da criança, o painel da porta com PODE e NÃO PODE, o carimbo NÃO, as poeirinhas do deslize, o *boing*, as setas da borda, a legenda da demonstração e todas as palavras.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `crianca.png` | 4 × 4 | 192 × 192 | 768 × 768 | sim | a criança: correndo de frente, de costas e de lado, parada e derrapando |
| `casas.png` | 3 × 2 | 384 × 384 | 1152 × 768 | sim | 4 casas de programa, a oficina fechada e a oficina aberta |
| `icones.png` | 4 × 3 | 128 × 128 | 512 × 384 | sim | os 12 ícones de programa e de peça |
| `enfeites.png` | 4 × 2 | 256 × 256 | 1024 × 512 | sim | árvores, arbusto, flores, banco, poste, chafariz |
| `grama.png` | — | — | 512 × 512 | opaco | o chão, **repetido** pelo bairro inteiro |
| `mao.png` | — | — | 256 × 256 | sim | a mãozinha da demonstração; a ponta do dedo é o ponto do toque |
| `cover-bairro-das-permissoes.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e os pontos marcados (o pé da criança, a placa e a porta da casa, a ponta do dedo) não podem mudar.

## 2. Regras deste jogo

- **Vista de cima-frente**, como num jogo de bairro de videogame: o chão é visto de cima, e casas, árvores e a criança são vistos de frente, um pouco de cima. Nada de isométrico, nada de vista de satélite.
- **Nenhum texto na arte.** Nome de casa, letra de placa, número de porta e marca são do código ou não existem. A única exceção é o título da capa.
- **A placa do telhado vem vazia.** Toda casa e oficina tem, no meio do telhado, um **círculo branco liso** de 116 px de diâmetro com centro em **(192, 96)** da célula. O código desenha o ícone ali. Se a arte desenhar alguma coisa na placa, a casa de FOTOS e a de LANTERNA ficam iguais.
- **A porta é o ponto de chegada.** O pé da porta (ou do portão) fica no **centro de baixo da célula, em (192, 352)**. É dali que o código mede se a criança chegou.
- **As duas famílias não se confundem nem de longe.** Casa de programa: casinha colorida, telhado de duas águas, porta redonda. Oficina de peça: galpão largo cinza-azulado, telhado reto, portão de enrolar. A silhueta separa as duas, não só a cor.
- **Nenhuma casa é verde ou vermelha.** Verde é do PODE e vermelho do NÃO PODE: se a casa da lanterna for vermelha, a cor parece dizer a resposta.
- **Nada de chão grudado.** Casa, árvore e criança vêm soltas, sem sombra no chão: o código desenha uma elipse de sombra embaixo de tudo.
- Peça solta e centrada na célula, com cerca de 8 % de margem (as casas encostam mais: 4 %).

### O bloco de estilo (começa todo prompt)

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
construction exactly: 100% flat vector built only from rounded rectangles,
capsules, circles and rounded trapezoids with one generous, even corner radius;
NO outlines at all, NO shading, NO gradients — shapes are separated only by
colour, with at most one flat darker panel of the same hue; a short, saturated,
high-key palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.
~~~

### O negativo (fecha todo prompt)

~~~text
DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos; outlines, black outlines, line
art, ink lines, white sticker keyline; gradients, soft shading, cel shading,
highlights, gloss, texture, grain, drop shadows, cast shadow on the ground; 3D
render, isometric, photorealistic, blur; chibi proportions, oversized baby head,
anime face, coloured irises, five separated fingers; text, letters, words,
labels, digits, numbers (except the cover title), signs with drawings, user
interface, buttons, speech bubbles, arrows, HUD; floor, ground, grass under the
objects (except grama.png); grid lines, visible sprite-sheet borders, cell
borders, cropped edges, white backing in transparent assets; sad faces, angry
faces.
~~~

---

## 3. `crianca.png` — 4 × 4 células de 192 × 192 (768 × 768), alfa

Uma criança de uns 10 anos, **a mesma em todas as células, na mesma escala**: cabelo castanho-escuro curto e volumoso, camiseta **azul-ciano** (a cor do sistema), bermuda azul-marinho, e **tênis brancos com uma rodinha amarela no calcanhar** (é o que explica o deslize). Corpo de **3,5 a 4 cabeças**, não chibi. **O pé apoiado fica em y = 176** da célula, centrado em x = 96: é a origem do sprite no código (0,5; 0,92). A cabeça não passa de y = 14.

| Linha | Células 0 → 3 |
|---|---|
| 0 | **correndo de frente** (vindo para a câmera): 4 quadros do ciclo — passo esquerdo, passagem, passo direito, passagem |
| 1 | **correndo de costas** (indo para longe): o mesmo ciclo, vendo a nuca |
| 2 | **correndo de lado, para a DIREITA**: o mesmo ciclo, de perfil (o código espelha para a esquerda) |
| 3 | **parada de frente** · **parada de costas** · **parada de lado (direita)** · **derrapando de lado (direita)**: corpo inclinado para trás, um pé esticado na frente, braços abertos para equilibrar |

Nos quadros de corrida, **cápsulas escuras pequenas soltas** atrás do pé de trás (a marca de movimento do estilo). No quadro de derrapagem, três cápsulas no chão atrás do tênis.

~~~text
[bloco STYLE]

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 4
rows, each cell 192 x 192 (total 768 x 768), read left to right, top row first.
The SAME character in every cell at the SAME scale, the same palette and the
same flat lighting, centred in its cell, no grid lines, no cell borders. The
standing foot always rests on the line y = 176 of its cell, centred at x = 96.
The character: a 10-year-old kid, about 3.5 to 4 heads tall (NOT chibi), short
fluffy dark-brown hair, a cyan-blue t-shirt, navy shorts, white sneakers with a
small yellow wheel at each heel. Squarish head with rounded corners, big white
rounded-square eyes with solid black pupils, a happy open smile. Hands and feet
float detached from the body with a small gap.
Row 1: RUNNING TOWARD THE VIEWER, 4 frames of a run cycle (left step, passing,
right step, passing).
Row 2: RUNNING AWAY FROM THE VIEWER, back view, the same 4-frame cycle.
Row 3: RUNNING TO THE RIGHT, side view, the same 4-frame cycle, a few small
detached dark capsules behind the back foot as motion ticks.
Row 4: standing still facing the viewer; standing still back view; standing
still side view facing right; SKIDDING to the right: body leaning back, one
foot stretched forward, arms open for balance, three small capsules on the line
behind the sneaker.
~~~

## 4. `casas.png` — 3 × 2 células de 384 × 384 (1152 × 768), alfa

| Célula | Conteúdo |
|---|---|
| 0 | **casa de programa amarela**: casinha de frente, telhado de duas águas laranja-queimado, porta **redonda** azul no meio de baixo, duas janelas redondas |
| 1 | **casa de programa rosa**: a mesma construção, telhado roxo, porta amarela |
| 2 | **casa de programa azul-celeste**: telhado azul-marinho, porta laranja |
| 3 | **casa de programa lilás**: telhado azul-ardósia, porta rosa |
| 4 | **oficina de peça, portão FECHADO**: galpão largo e baixo cinza-azulado, telhado reto com uma faixa, **portão de enrolar** de listras horizontais fechado até o chão |
| 5 | **oficina de peça, portão ABERTO**: a mesma oficina, o portão enrolado em cima e o vão escuro aparecendo, uma luzinha amarela lá dentro |

Em todas: **a placa vazia** (círculo branco liso, centro (192, 96), 116 px) no meio do telhado, e **a porta/portão com o pé em (192, 352)**. As oficinas 4 e 5 são **o mesmo desenho** com só o portão mudando: o código troca uma pela outra quando a criança chega.

~~~text
[bloco STYLE]

A game sprite sheet on a fully TRANSPARENT background: 3 columns x 2 rows, each
cell 384 x 384 (total 1152 x 768), read left to right, top row first. One
building per cell, seen from the front with a slight top-down tilt, filling
about 92% of the cell, no ground, no grass, no shadow, no text. EVERY building
has, in the middle of its roof or facade top, an EMPTY plain white circle 116 px
wide centred at (192, 96) of the cell — leave it blank. EVERY door or gate is
centred at the bottom, its bottom edge at y = 352. No building is green or red.
1. A cute small HOUSE, yellow walls, orange-brown gable roof, a ROUND blue door,
   two round windows.
2. The same house design, pink walls, purple roof, yellow round door.
3. The same house design, sky-blue walls, navy roof, orange round door.
4. The same house design, lilac walls, slate-blue roof, pink round door.
5. A wide low WORKSHOP building, blue-grey walls, a flat roof with one band, a
   big ROLLER SHUTTER gate with horizontal stripes, CLOSED down to the bottom.
6. The SAME workshop, identical, but the roller shutter is ROLLED UP showing a
   dark opening with a small warm yellow light inside.
~~~

## 5. `icones.png` — 4 × 3 células de 128 × 128 (512 × 384), alfa

O ícone vai na placa branca do telhado, no painel da porta e no pedido flutuando em cima da criança. Tem que ser lido **a 40 px** no celular: uma forma grande, duas cores, nada fino.

| Célula | Ícone | Família |
|---|---|---|
| 0 | **FOTOS**: moldura de quadro com montanha e sol | programa |
| 1 | **LANTERNA**: lanterna de mão deitada com o facho de luz em leque | programa |
| 2 | **CALCULADORA**: calculadora com 6 teclas redondas e o visor (sem número) | programa |
| 3 | **MÚSICA**: duas notas musicais unidas | programa |
| 4 | **MAPA**: mapinha dobrado com um alfinete (N2) | programa |
| 5 | **JOGUINHO**: controle de videogame com cruz e dois botões (N2) | programa |
| 6 | **CÂMERA**: câmera de lente grande | peça |
| 7 | **CONTATOS**: caderninho com o desenho de um bonequinho na capa | peça (guardado) |
| 8 | **MICROFONE**: microfone de cabeça redonda | peça |
| 9 | **ALTO-FALANTE**: caixa com dois cones redondos | peça |
| 10 | **VIDEOCHAMADA**: telinha com uma carinha e um balão (N2) | programa |
| 11 | **LOCALIZAÇÃO**: alfinete de mapa sozinho (N2) | peça |

~~~text
[bloco STYLE]

A game icon sheet on a fully TRANSPARENT background: 4 columns x 3 rows, each
cell 128 x 128 (total 512 x 384), read left to right, top row first. One bold
simple icon per cell, about 80% of the cell, centred, flat front view, readable
at 40 px: one big shape, two or three colours, no thin details, no text.
1. a picture frame with a mountain and a sun; 2. a hand flashlight lying
sideways with a fan-shaped light beam; 3. a calculator with six round keys and
a blank display; 4. two joined music notes; 5. a folded paper map with a pin;
6. a game controller with a cross pad and two buttons; 7. a camera with a big
round lens; 8. a small address book with a little person on the cover; 9. a
round-head microphone; 10. a loudspeaker box with two round cones; 11. a small
screen with a smiling face and a speech balloon; 12. a single map pin.
~~~

## 6. `enfeites.png` — 4 × 2 células de 256 × 256 (1024 × 512), alfa

| Célula | Conteúdo | No código |
|---|---|---|
| 0 | **árvore** de copa redonda verde, tronco marrom | obstáculo (bate) |
| 1 | **pinheiro** de três triângulos arredondados | obstáculo (bate) |
| 2 | **arbusto** baixo, redondo | enfeite (passa por cima) |
| 3 | **canteiro de flores**: três flores coloridas num tufo | enfeite |
| 4 | **banco de praça** de ripas, de frente | enfeite |
| 5 | **poste** de luz com a lâmpada redonda | enfeite |
| 6 | **chafariz** redondo de pedra com a água em leque, visto de cima-frente | obstáculo (o meio da praça) |
| 7 | vazia (transparente) | — |

O verde das árvores pode ser verde: árvore é árvore. Mas é um **verde-musgo** escuro, longe do verde-limão do botão PODE.

~~~text
[bloco STYLE]

A game sprite sheet on a fully TRANSPARENT background: 4 columns x 2 rows, each
cell 256 x 256 (total 1024 x 512). One object per cell, about 84% of the cell,
centred, seen from the front with a slight top-down tilt, no ground, no shadow,
no text. Foliage is a dark moss green, never lime green.
1. A tree with a big round canopy and a short brown trunk.
2. A pine tree made of three stacked rounded triangles.
3. A low round bush.
4. A small flower bed: three colourful flowers in a tuft of leaves.
5. A park bench made of slats, front view.
6. A street lamp with a round bulb.
7. A round stone FOUNTAIN with a fan of water, seen from the front and above.
8. Empty cell, fully transparent.
~~~

## 7. `grama.png` — 512 × 512, opaco, **repetível**

Um gramado verde-claro chapado com tufinhos e florzinhas espalhados **de leve**, sem nenhum objeto grande. **As bordas emendam**: o código repete a imagem pelo bairro inteiro (3000 × 1900 no N1), e qualquer coisa cortada na borda vira uma costura de 512 em 512.

~~~text
[bloco STYLE]

A seamless TILEABLE square texture, 512 x 512, fully opaque, seen from straight
above: a calm light-green lawn in flat colour with a few sparse small grass
tufts (capsules) and tiny dots of flowers, evenly scattered, nothing large,
nothing crossing the edges. The left edge must continue into the right edge and
the top into the bottom. No paths, no objects, no text.
~~~

## 8. `mao.png` — 256 × 256, alfa

A mesma mãozinha do Cabo Certo, e o mesmo contrato: indicador **para cima**, os outros dedos dobrados, pele clara chapada e **uma borda branca grossa** em volta (é a única peça com borda: ela passa por cima do bairro inteiro). **A ponta do indicador fica em (87, 18)** (`HAND_TIP` em `data/files.ts`). Se a do Cabo Certo já existir, copie o arquivo.

~~~text
[bloco STYLE]

A single game sprite on a fully TRANSPARENT background, 256 x 256: a small
child's hand pointing UP with the index finger, the other three fingers folded,
the thumb folded across the palm, the short wrist going down. Flat light skin
tone built from capsules and rounded rectangles, with ONE thick white outline
around the whole silhouette. The tip of the index finger is at x=87, y=18. No
sleeve, no click lines, no face, no text.
~~~

## 9. `cover-bairro-das-permissoes.png` — 1672 × 941, opaco

A criança de camiseta ciano correndo pela rua do bairro, derrapando de leve na curva com poeirinha atrás do tênis de rodinha; uma casinha colorida de um lado e uma oficina de portão aberto do outro, e entre as duas uma bolinha de luz voando. O título **BAIRRO DAS PERMISSÕES** em letras gordas e redondas no alto.

~~~text
[bloco STYLE]

Cover illustration, 1672 x 941, fully opaque: a cheerful flat-vector
neighbourhood street seen from the front and slightly above. In the middle a
10-year-old kid (cyan t-shirt, navy shorts, white sneakers with small yellow
heel wheels, NOT chibi) runs and skids around a corner, small capsules of dust
behind the sneakers. On the left a cute yellow house with a round door, on the
right a blue-grey workshop with its roller shutter open; a glowing ball of
light flies between them. Big round chunky title at the top: BAIRRO DAS
PERMISSÕES. One flat light-grey capsule as the only ground shadow, under the kid.
~~~

## 10. A conferência antes de colocar na pasta

- [ ] `crianca.png`: o pé no mesmo y em **todas** as células; a mesma altura de cabeça; quadros de lado olhando para a **direita**;
- [ ] `casas.png`: a placa branca **vazia** e no mesmo lugar nas 6 células; oficinas 4 e 5 iguais tirando o portão;
- [ ] nenhuma casa verde ou vermelha;
- [ ] `icones.png` legível com a imagem reduzida a 40 px;
- [ ] `grama.png` sem costura quando repetida 2 × 2;
- [ ] nenhum contorno, nenhum degradê, nenhuma letra (fora a capa), nenhuma coruja.
