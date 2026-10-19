# Cabo Certo — texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF05CO05/cabo-certo/`
Planejamento: §3 o laço, §5 o mapa, §7 acerto e erro.

**Linha de arte: vetor geométrico chapado** ([`references/ESTILO-VETOR-GEOMETRICO.md`](../../../../references/ESTILO-VETOR-GEOMETRICO.md)). O jogo é feito de objetos, sem personagens, e essa linha monta tudo com retângulos de canto redondo, cápsulas e círculos, que é o desenho de um aparelho. Anexe em **toda geração** `references/23-vetor-geometrico-a.webp` e `references/24-vetor-geometrico-b.png`. O elenco das referências (a coruja verde, o urso, as pessoas) vai no negativo de todos os prompts.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código (`scenes/fallback.ts`) nas mesmas chaves, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

**Ficam no código para sempre:** os cabos (a curva com barriga), a bolinha de informação, o brilho do processador pensando, o que aparece na tela do monitor (letras, cursor, foto, notas), as ondas do microfone, as notas do alto-falante, as faíscas, as setas da borda e todas as palavras (ENTRADA, SAÍDA, ARMAZENAMENTO, PROCESSADOR e o nome de cada aparelho).

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `aparelhos.png` | 4 × 2 | 256 × 256 | 1024 × 512 | sim | os 7 aparelhos do mapa + 1 célula vazia |
| `pecas.png` | 4 × 1 | 128 × 128 | 512 × 128 | sim | o plugue e as 3 tomadas |
| `computador.png` | — | — | 400 × 480 | sim | o gabinete visto de frente, com a janela do processador |
| `chao.png` | — | — | 2400 × 1350 | opaco | o mapa inteiro: o chão do quarto de informática |
| `cover-cabo-certo.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a posição da tela do monitor não podem mudar.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Nome de aparelho, nome de tomada, marca e letra de tecla são do código ou não existem. A única exceção é o título da capa.
- **Nenhum aparelho com fio desenhado.** O código desenha o cabo, saindo do lado do aparelho virado para o computador.
- **Nenhum aparelho brilha mais que outro, e nenhum tem a cor de uma tomada.** Verde, laranja e roxo são das tomadas: se o microfone for verde, a cor entrega a resposta. Os aparelhos ficam em cinza-grafite, branco e azul-ardósia, com um acento pequeno de cor própria.
- **A tela do monitor vem apagada** (azul-noite chapado) e ocupa um retângulo fixo: centro em (128, 104) da célula, 196 × 116. É ali que o código escreve.
- Tudo de frente ou em três-quartos bem leve, sem perspectiva forte: é um mapa visto de cima-frente, como num jogo de tabuleiro.
- Peça solta e centrada na célula, com cerca de 8 % de margem.

---

## 3. `aparelhos.png` — 4 × 2 células de 256 × 256 (1024 × 512), alfa

| Célula | Conteúdo |
|---|---|
| 0 | **teclado**: retangular e baixo, teclas de quadradinho arredondado em 4 fileiras, uma barra de espaço comprida |
| 1 | **mouse**: cápsula em pé, de cima, dois botões e a rodinha |
| 2 | **microfone**: cabeça redonda de grade num pedestal curto com base redonda |
| 3 | **câmera**: corpo de retângulo arredondado, lente grande redonda na frente, botão em cima |
| 4 | **monitor**: tela larga com moldura fina, pé curto e base; **tela apagada** no retângulo do contrato |
| 5 | **alto-falante**: caixa em pé com dois cones redondos, um grande embaixo e um pequeno em cima |
| 6 | **pendrive**: corpo de cápsula com a ponta metálica para a esquerda, deitado, um furinho de chaveiro |
| 7 | vazia (transparente) |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
construction exactly: 100% flat vector built only from rounded rectangles,
capsules, circles and rounded trapezoids with one generous corner radius;
NO outlines at all, NO shading, NO gradients — shapes are separated only by
colour, with at most one flat darker panel; a short, saturated palette on
white. Take ONLY the construction technique: do NOT copy any character, mascot,
bird, bear or person from the reference images.

A game sprite sheet on a fully TRANSPARENT background: a grid of 4 columns x 2
rows, each cell 256 x 256 (total 1024 x 512), read left to right, top row
first. One computer device per cell, about 80% of the cell, centered, seen from
the front with a very slight top-down tilt, no cables, no wires, no text.
Devices are graphite grey, white and slate blue, each with one small accent
colour of its own (never green, orange or purple).
1. A low computer KEYBOARD with four rows of rounded square keys and a long space bar.
2. A computer MOUSE seen from above, two buttons and a scroll wheel.
3. A desk MICROPHONE: round mesh head on a short stand with a round base.
4. A small digital CAMERA: rounded body, big round lens on the front, a button on top.
5. A computer MONITOR: wide screen with a thin bezel, short neck and base. The
   screen is OFF, a flat dark navy rectangle, centered horizontally, its center
   at 104 px from the top of the cell, 196 x 116 px.
6. A LOUDSPEAKER box standing up, a big round cone below and a small one above.
7. A USB FLASH DRIVE lying sideways, capsule body, metal plug pointing LEFT, a
   small keyring hole.
8. Empty cell, fully transparent.
~~~

## 4. `pecas.png` — 4 × 1 células de 128 × 128 (512 × 128), alfa

| Célula | Conteúdo |
|---|---|
| 0 | **plugue**: cápsula grafite deitada com dois pinos metálicos para a **direita** (o código gira) |
| 1 | **tomada de ENTRADA**: placa redonda **verde** com um furo escuro e uma seta branca apontando para a **direita** (para dentro do computador, que fica à direita dela) |
| 2 | **tomada de SAÍDA**: placa redonda **laranja** com um furo escuro e uma seta branca apontando para a **direita** (para fora, o computador fica à esquerda dela) |
| 3 | **tomada de ARMAZENAMENTO**: placa redonda **roxa** com um furo escuro e um bauzinho branco |

~~~text
[mesmo bloco STYLE da seção 3]

A game sprite sheet on a fully TRANSPARENT background: 4 columns x 1 row, each
cell 128 x 128 (total 512 x 128). One object per cell, about 80% of the cell,
centered, flat front view, no text.
1. An electric PLUG: a graphite capsule lying sideways with two short metal
   pins pointing RIGHT.
2. A round GREEN socket plate with a dark round hole and a white arrow pointing RIGHT.
3. A round ORANGE socket plate with a dark round hole and a white arrow pointing RIGHT.
4. A round PURPLE socket plate with a dark round hole and a small white treasure chest.
~~~

## 5. `computador.png` — 400 × 480, alfa

O gabinete de pé, de frente, branco-gelo com laterais azul-ardósia. No terço de cima, uma **janela** larga mostrando por dentro uma placa verde-escura com o **chip** no meio: quadrado grafite com pernas douradas nos quatro lados. Embaixo da janela, o botão de ligar redondo e duas frestas de ventilação. **Sem tomadas desenhadas**: o código põe as tomadas nas bordas (4 à esquerda, 1 à direita, 1 embaixo).

~~~text
[mesmo bloco STYLE da seção 3]

A single game sprite on a fully TRANSPARENT background, 400 x 480: a friendly
desktop computer TOWER seen exactly from the front, ice-white with slate-blue
side panels, rounded corners. In its upper third a wide window shows the inside:
a dark green circuit board with a graphite square CPU chip in the middle, gold
pins on all four sides. Below the window a round power button and two
ventilation slots. No sockets, no cables, no text, no logo.
~~~

## 6. `chao.png` — 2400 × 1350, opaco

O chão de um quarto de informática visto de cima: tapete grande azul-claro com um quadriculado suave, uma mesa redonda clara no centro (onde o computador fica, em 1200 × 700) e móveis baixos só nas bordas (estante, vaso de planta, pufe). **O miolo fica limpo:** aparelhos e cabos andam por cima. Nada mais escuro que o tapete onde os cabos passam.

~~~text
[mesmo bloco STYLE da seção 3]

A wide game background, 2400 x 1350, fully opaque, seen from straight above: the
floor of a cheerful computer room. A big light-blue rug with a soft square
grid covers almost everything; a light round table sits exactly in the center.
Low furniture only along the borders: a bookshelf, a potted plant, a bean bag,
a small rug. The middle area stays calm and empty for game objects. No devices,
no cables, no people, no text.
~~~

## 7. `cover-cabo-certo.png` — 1672 × 941, opaco

O computador de pé no centro, sorridente, com cabos coloridos saindo dele para o teclado, o monitor (mostrando uma bolinha de luz), o microfone e o pendrive; o título **CABO CERTO** em letras gordas e redondas no alto.

~~~text
DO NOT INCLUDE (todos os prompts): green owl, owl mascot, cartoon bird mascot,
bear, people, any character from the reference images, brand mascots, logos,
text, letters, words, labels, digits, numbers (except the cover title), user
interface, buttons, speech bubbles, outlines, black ink lines, shading,
gradients, 3D render, photorealistic, glossy highlights, drop shadows, cables
on the devices, grid lines, visible sprite-sheet borders, cropped edges.
~~~
