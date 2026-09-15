# Canhão das Coordenadas — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino futuro: `src/assets/games/EF04CO01/canhao-das-coordenadas/`

Este documento pede apenas o que a arte precisa entregar. A matriz, as coordenadas e a tinta são desenhadas pelo jogo, porque têm de mudar com cada resposta. **Não gerar texturas agora como condição para planejar:** o primeiro corte deve ser jogável com placeholders.

---

## 0. Lista fechada

| # | Arquivo | Dimensão | Grade | Fundo | Função | Quando |
|---:|---|---:|---:|---|---|---|
| 1 | `bg-patio-da-arte.png` | 1672 × 941 | imagem única | opaco | pátio escolar com parede vazia | após validar o protótipo |
| 2 | `canhao-de-tinta.png` | 1024 × 256 | 4 × 1 de 256 | alfa real | o mesmo canhão em quatro estados mecânicos | **entregue** |
| 3 | `cover-canhao-das-coordenadas.png` | 1672 × 941 | imagem única | opaco | capa do catálogo | por último |

**Total: três arquivos.**

A folha do canhão tem **a mesma peça** em todos os quadros, não quatro canhões diferentes. A capa deve ser produzida só depois da tela real estar aprovada.

### Não pedir como PNG

- grade, linhas e colunas;
- janelas individuais;
- números, `L` ou `C`;
- cartões de pedido e cartões de resposta;
- tinta cinza, splash, gota e rastro;
- setas de MOVER/COPIAR;
- cadeado, `?`, vidas, estrelas, balões;
- molduras, botões, barras e brilho.

Esses elementos mudam de estado, tamanho, cor ou texto e ficam em `Graphics` e `Phaser.Text`. O fundo não deve vir com uma matriz pronta, pois ela precisa ser pintada e manipulada pelo código.

---

## 1. Regra visual pedagógica

> **A arte não pode resolver a coordenada pela criança.**

A grade e os números são sobrepostos pelo código. Nenhuma janela do fundo pode estar marcada como certa, nenhuma célula pode ter brilho permanente e nenhuma cor pode identificar a próxima resposta. O canhão aponta para o mural somente **depois** do toque.

O objeto representado deve ser reconhecível: o mural 4 × 4 parece uma fachada de janelas. Entretanto, as janelas interativas são criadas pelo código dentro da área vazia do fundo. A imagem de cenário pode sugerir arquitetura escolar, mas não desenhar a fachada jogável.

O canhão é uma máquina de pintura amigável, não uma arma. Ele não lança pedra, projétil sólido ou tinta em pessoas. Só janelas desenhadas no mural recebem o efeito.

---

## 2. Estilo comum

~~~text
Flat polished 2D cartoon educational game art for children aged 9–10,
chunky rounded silhouettes, clear dark-navy outline #203149, broad matte color
areas, one soft inner shadow, one small upper-left highlight, warm Brazilian
schoolyard daylight, friendly and playful, minimal detail, readable when
scaled down to a 390-pixel-wide mobile screen.
~~~

### Negativo comum

~~~text
text, letters, digits, numbers, words, coordinates, label, logo, watermark,
signature, visible grid lines, drawn answer, green correct marker, red wrong X,
target on a person, handheld firearm, military cannon, tank,
ammunition, bullet, rock, explosion, fire, smoke cloud, damage, broken window,
injury, scary school, aggressive action, person being hit, 3D render,
photorealistic, realistic, hyperdetail, glossy plastic, dark horror lighting,
cropped object, cut off edge, outer frame, white background behind a
transparent sprite, fake transparency, checkerboard painted into the image,
motion blur, lens flare.
~~~

O negativo comum vale também para a capa. Qualquer texto da habilidade ou do
jogo é escrito pelo Phaser ou pela plataforma, jamais pelo gerador de imagem.

---

## 3. Paleta

| Uso | Hex |
|---|---|
| contorno | `#203149` |
| parede creme | `#F5E8D4` |
| piso claro | `#D9B987` |
| aço azul-escuro do canhão | `#344459` |
| azul de seleção (código) | `#43B8D8` |
| tinta principal (código) | `#38A4D4` |
| amarelo de atenção (código) | `#F4B942` |
| verde de confirmação (código) | `#4EAA78` |
| cinza de erro temporário (código) | `#9AA8B5` |
| madeira das rodas e carreta | `#98613F` |
| céu | `#AEE2F7` |
| folhagem | `#78BA78` |

A cor da pintura **não está dentro do canhão PNG**; o código desenha gota e pintura. Assim MOVER e COPIAR continuam visualmente coerentes com a mesma cor de estado.

---

# 4. `bg-patio-da-arte.png`

## Contrato

| Campo | Valor |
|---|---|
| dimensão | 1672 × 941 |
| fundo | opaco, tela inteira |
| composição | pátio de arte de uma escola |
| área principal livre | x 8%–57%, y 16%–95% |
| área de pedido/canhão livre | x 58%–94%, y 12%–95% |
| grid pintado | nenhum |
| objetos interativos pintados | nenhum |

O palco lógico é 1280 × 720. A matriz de 536 × 536 ficará em `(150,150)`;
portanto a arte deve ter uma **parede clara, ampla e pouco detalhada** nessa
região. Não pintar linhas, janelas, azulejos quadrados, quadros ou buracos ali.
O código colocará a fachada 4 × 4 por cima.

Na direita, deixar espaço para o cartão de pedido e o canhão separado. É
permitido mostrar estantes, pincéis ou latas de tinta **nas bordas**, mas nenhum
objeto deve parecer botão ou célula clicável.

### Prompt copiável

~~~text
A wide friendly elementary-school art courtyard background for a peaceful
coordinate-matrix painting game, exactly 1672 by 941 pixels, landscape,
fully opaque and filling the canvas edge to edge.

Front-facing camera at a child's eye height. A broad warm cream exterior
school wall #F5E8D4 fills most of the left and central scene. Keep the wall
from x=8 to 57 percent and y=16 to 95 percent especially flat, calm, even,
clean and EMPTY so a large interactive four-by-four window facade can be
drawn on top later by the game. The wall has no grid, windows, tiles, marks,
paint patches, target circles, signs or frames in this area.

At the far left edge show a soft leafy tree and a little afternoon sunlight.
At the far right edge, show a few recognizable school art supplies on a low
shelf: covered paint jars, broad brushes and folded paper, all small and
decorative. Near the upper right, show a partial classroom window far outside
the reserved play zones. Along the bottom, show a simple warm paved school
courtyard floor #D9B987. Keep the central-right region from x=58 to 94
percent calm enough for a large text prompt and a separate cartoon paint
machine sprite; do not draw that machine into the background.

Safe cheerful Brazilian school atmosphere, no children in the play field,
no shooting-range language or military imagery. Flat 2D cartoon game
background, rounded shapes, dark navy outline #203149 on major architectural
forms, broad matte colors, soft upper-left daylight, subtle shadow, friendly,
polished, readable on mobile.

Negative: wall grid, 4x4 cells, coordinate numbers, letters, labels,
painted windows, painted answer, target, bullseye, crosshair, cannon, machine,
gun, projectile, splatter, person, child, hand, military object, text,
school name, logo, watermark, hanging question card, button, HUD, border,
white margin, photorealistic, 3D render, hyperdetail, motion blur,
lens flare.
~~~

### Conferência

- [ ] a imagem comunica pátio de escola, não estande de tiro;
- [ ] o espaço esquerdo está realmente vazio para a matriz;
- [ ] não há grade ou janela pré-pintada nessa área;
- [ ] a região direita aceita pedido e canhão sem brigar com objetos do fundo;
- [ ] não há criança ou pessoa onde a tinta passará;
- [ ] nenhuma lata ou pincel parece clicável;
- [ ] o fundo não entrega respostas.

---

# 5. `canhao-de-tinta.png`

## Contrato

| Campo | Valor |
|---|---|
| dimensão | 1024 × 256 |
| grade | 4 colunas × 1 linha |
| célula | 256 × 256 |
| fundo | canal alfa real |
| enquadramento | lateral em três quartos, cano voltado para esquerda/superior |
| pivô do cano | eixo sobre as rodas; medir após entrega |
| preenchimento | aproximadamente 82% da célula |

### Identidade: canhão, não personagem

A folha entregue mostra **um canhão normal**, reconhecível de imediato:

1. **cano comprido de metal azul-escuro**, com boca circular aberta,
   apontando para a parte superior esquerda da tela;
2. **duas rodas grandes de madeira**, com raios largos;
3. **carreta de madeira** sustentando o cano entre as rodas.

O cano é a peça dominante. A tinta aparece apenas como brilho ciano **dentro**
da boca no quadro de disparo; a gota que voa é desenhada pelo código. Não
adicionar tanque, emblema, topete, luzes ou outras peças ao PNG entregue.

**Proibido antropomorfizar:** sem rosto, olhos, boca, sobrancelhas, bochechas,
braços ou expressão. O interesse visual vem da silhueta clássica e
do movimento de apontar, recuar e assentar. O canhão não se move nem aponta
para a resposta antes do toque; ele reage apenas à janela escolhida.

É um objeto cenográfico de arte escolar. A tinta atinge somente a fachada;
não há pessoas no trajeto.

| Frame | Estado | Leitura visual |
|---:|---|---|
| 0 | repouso | cano inclinado para o mural |
| 1 | apontar | cano sobe cerca de 10° em torno do eixo; rodas e base imóveis |
| 2 | disparar | cano recua um pouco sobre a carreta; tinta brilha na boca, sem gota externa |
| 3 | assentar | cano volta à posição inicial; rodas e base no mesmo lugar |

Rodas, eixo e base permanecem no mesmo lugar entre quadros. Somente o cano e
o brilho ciano interno mudam. O código anima o pequeno giro/recuo e cria a gota
separadamente. O PNG **não inclui tinta no ar nem splash**.

### Prompt copiável

~~~text
A horizontal sprite sheet with exactly FOUR equal square frames in one
row, total image 1024 by 256 pixels, transparent PNG. Draw the SAME
NORMAL CANNON in each frame. Classic small cannon silhouette: substantial
dark blue-gray cast-metal barrel, clearly circular open muzzle pointing
diagonally up-left, simple wooden carriage, and TWO LARGE wooden spoked
wheels. The cannon is an inanimate object, not a character.

Frames left to right:
1. resting barrel;
2. barrel raised slightly to aim;
3. gentle backward recoil, with cyan paint glow ONLY inside the muzzle;
4. barrel settled to the resting angle.

Keep identical cannon geometry, materials, scale, perspective, wheel
positions and ground baseline in all four cells. The barrel, carriage
and wheels must remain recognizable at small size. Polished flat 2D
game art with clean bold outlines and broad shapes. Genuinely transparent
background, no cell borders or grid lines. No paint drop outside the
cannon; the game adds the flying paint separately.

Absolute negative: NO face, eyes, mouth, nose, eyebrows, cheeks, smile,
mascot, anthropomorphic features, arms, hands, person or creature.
Do not turn the cannon into a paint pot, robot or toy gun. No military
symbols, ammunition, explosion, fire, smoke, text, logo or watermark.
~~~

### Conferência

- [ ] são quatro quadros na ordem certa;
- [ ] a silhueta mostra cano, boca circular, carreta e rodas grandes;
- [ ] nenhum quadro tem rosto, olhos, boca ou traço de personagem;
- [ ] os quatro quadros mostram o mesmo canhão e as mesmas cores;
- [ ] as diferenças são ângulo, recuo e tinta interna;
- [ ] o canhão é de tinta escolar, sem visual militar;
- [ ] a boca aponta para a área da matriz, não para pessoas;
- [ ] base e rodas alinham entre quadros;
- [ ] não há tinta voando dentro da folha;
- [ ] o frame de repouso não indica a resposta certa;
- [ ] alfa é real;
- [ ] a silhueta permanece legível a aproximadamente 69 × 69 px no celular.

### Depois da entrega

A folha entregue mede **1024 × 256**, com quatro células de **256 × 256**,
alfa real e 312 KB. Foi gerada como tira 4 × 1 e recortada/redimensionada
sem alterar o desenho. Medir a caixa alfa dos quatro quadros na integração
e registrar o pivô do giro pelo eixo visível das rodas, não pelo centro da
célula transparente.

---

# 6. `cover-canhao-das-coordenadas.png`

## Função

A capa explica **matriz + ação** em uma imagem. Não deve ser apenas um canhão
diante de uma parede vazia. Precisa mostrar uma fachada quadriculada criada
pelo jogo, uma linha e coluna destacadas e um jato de tinta indo ao
cruzamento. A capa pode representar os elementos da interface como
ilustração, mas **sem letras ou números gerados**; a plataforma desenha o
título e o jogo desenha coordenadas nítidas em runtime.

| Campo | Valor |
|---|---|
| dimensão | 1672 × 941 |
| fundo | opaco |
| área de título | 0%–17% do alto, calma |
| elemento principal | mural 4 × 4 à esquerda |
| ação | gota indo a uma janela do mural |
| pessoas como alvo | nenhuma |

### Prompt copiável

~~~text
A polished cover illustration for a children's educational coordinate-matrix
painting game, exactly 1672 by 941 pixels, landscape, fully opaque.
Do not include title, writing, letters or numbers.

Cheerful Brazilian elementary-school art courtyard in warm daylight. On the
LEFT is a large clean four-by-four facade of sixteen equal square WINDOW
CELLS, like a simple school wall mural. The rows and columns are perfectly
aligned. The second horizontal row glows softly cyan, and the third vertical
column glows softly cyan; their single crossing cell receives one bright
blue splash of paint. A few other window cells have calm blue paint,
forming a simple visible pattern. Do not mark the crossing with a bullseye
or crosshair.

On the lower RIGHT stands the SAME normal cannon from the delivered sprite
sheet: substantial dark blue-gray cast-metal barrel, open circular muzzle,
simple wooden carriage and two large wooden spoked wheels. It has no face
or human traits. A single rounded blue
paint drop travels in a short gentle arc from its muzzle to the selected
WINDOW CELL, never toward a person. This is a colorful school-art cannon,
not a military scene. Keep art supplies near the far right edge,
tree foliage near the far left, warm cream school wall and paved floor.
No human character is needed.

The composition must immediately communicate: organized window matrix,
one row and one column, their crossing, then paint changing that exact
cell. Leave the upper 17 percent calm for a separate platform title overlay.
Keep all important objects clear of the extreme edges.

Flat polished 2D cartoon educational game art, rounded forms, dark navy
outline #203149, cream wall #F5E8D4, blue paint #38A4D4, cyan guide
#43B8D8, warm sun and soft shadows, playful, safe, crisp, not aggressive.

Negative: title, text, letters, digits, numbers, coordinate label,
real address, school name, logo, watermark, bullseye, crosshair, human
target, person struck, child struck, gun, firearm, military cannon,
artillery, ammunition, bullet, rocket, stone, explosion, fire, damage,
broken glass, scary shooting range, face, eyes, mouth, anthropomorphic
cannon, paint-pot mascot, different cannon design, red wrong X, green answer check,
misaligned cells, more or fewer than sixteen windows, visible sprite
sheet grid, border, white margin, cropped machine, 3D render,
photorealistic, realistic, hyperdetail, motion blur, lens flare.
~~~

### Conferência

- [ ] são exatamente quatro linhas e quatro colunas de janelas;
- [ ] linha, coluna e cruzamento estão visualmente legíveis;
- [ ] a gota termina numa janela, não numa pessoa;
- [ ] o canhão mantém metal azul-escuro, cano, boca, carreta e rodas de madeira da folha entregue;
- [ ] não há rosto, olhos ou boca;
- [ ] o canhão parece ferramenta escolar;
- [ ] não há letras, números ou título gerados;
- [ ] o topo aceita o nome escrito pela plataforma;
- [ ] a imagem lembra a jogabilidade real após o teste.

A capa pode ser ajustada para usar uma captura/composição do jogo aprovado se
a imagem gerada não mantiver a matriz rigorosamente 4 × 4. **Uma matriz
incorreta na capa é pior que uma capa simples.**

---

## 7. O que permanece em Graphics e Text

| Elemento | Por que não é PNG |
|---|---|
| fachada e 16 janelas | tamanho e estados mudam durante a partida |
| rótulos L1–L4/C1–C4 | precisam ser exatos e nítidos |
| guia de linha/coluna | deve acender conforme pedido ou escolha |
| pintura de cada janela | precisa ser adicionada, movida, copiada ou retirada |
| gota e arco | dependem da célula tocada |
| splash e tinta cinza | feedback temporário |
| cartões do nível 2 | texto das alternativas varia |
| seta e rótulo MOVER/COPIAR | dependem da origem e direção |
| cadeado e pulso da TRAVA | estados temporários |
| janelas finais em miniatura | derivadas da matriz real |
| tutorial, `?`, vidas, estrelas | sistema compartilhado |

Não criar uma folha com dezesseis janelas pré-pintadas. Isso impediria que o
mesmo mural mostrasse, com fidelidade, a cópia e a movimentação do nível 3.

---

## 8. Placeholder obrigatório

Antes da arte definitiva:

| Asset ausente | Desenho em código |
|---|---|
| `bg-patio-da-arte` | céu claro, parede creme vazia e faixa de chão |
| `canhao-de-tinta` | cano azul inclinado, boca larga, carreta de madeira e duas rodas grandes |
| capa | não exigida para protótipo; usar captura temporária, sem publicar |

A matriz e seus números já são de código e **não são placeholders**. Todos os
três murais do nível 1 devem funcionar sem PNG. Nenhum `import` estático de
asset ausente pode quebrar o build.

~~~ts
const ART = import.meta.glob(
    '../../../../assets/games/EF04CO01/canhao-das-coordenadas/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>
~~~

`BootScene` ignora `cover-` e usa `textures.exists(key)` antes de desenhar
cada asset opcional.

| Chave de textura | Arquivo | Carregamento |
|---|---|---|
| `coords-courtyard` | `bg-patio-da-arte.png` | imagem |
| `coords-cannon` | `canhao-de-tinta.png` | spritesheet 256 × 256 |

### Ordem dos frames do canhão

~~~ts
const CANNON_FRAME = {
    idle: 0,
    aim: 1,
    release: 2,
    settle: 3,
} as const
~~~

A capa é usada pelo catálogo, não pela `BootScene`.

---

## 9. Entrega técnica

| Item | Regra |
|---|---|
| formato | PNG-24 |
| opacos | fundo e capa |
| transparente | folha do canhão com canal alfa verdadeiro |
| grade da folha | 4 × 1, células idênticas de 256 × 256 |
| margem da folha | mínimo 8% em cada célula |
| texto dentro da arte | nenhum |
| linhas de grade da folha | nenhuma |
| sangria entre células | nenhuma |
| peso-alvo | folha até 500 KB; fundo/capa até 1,5 MB |
| iluminação | do alto à esquerda |

Se a geração vier com fundo branco, refazer sobre magenta `#FF00FF` e remover
a cor antes de integrar. Não aceitar transparência falsa.

Após receber a arte:

1. conferir tamanho e grade;
2. verificar canal alfa;
3. medir caixa alfa por frame;
4. alinhar a base visível do canhão entre estados;
5. testar a folha reduzida ao tamanho real de jogo;
6. conferir contraste dos números e cartões sobre o fundo;
7. testar escala de 30% em celular;
8. capturar a tela com erro, acerto e MOVER/COPIAR antes de aprovar a capa.

---

## 10. Ordem de produção

1. **Sem texturas:** implementar e testar o nível 1 com placeholders.
2. `canhao-de-tinta.png` entregue; integrar e medir os quatro quadros.
3. Produzir `bg-patio-da-arte.png` e conferir o espaço vazio da matriz.
4. Implementar níveis 2 e 3 após aprovação do primeiro corte.
5. Produzir `cover-canhao-das-coordenadas.png` usando a jogabilidade aprovada como referência.

Se a arte do fundo trouxer janelas já desenhadas na área interativa, rejeitar:
o jogo precisa controlar todas as 16 posições.

---

## 11. Checklist final

### Arquivos

- [ ] são exatamente três arquivos;
- [ ] folha do canhão tem quatro quadros alinhados;
- [ ] fundo e capa são opacos;
- [ ] canhão possui alfa real;
- [ ] não há texto, letra, número ou linha de folha gerada.

### Habilidade

- [ ] o fundo deixa espaço para uma fachada-matriz 4 × 4;
- [ ] nenhuma resposta é revelada pela arte;
- [ ] as janelas interativas pertencem ao código;
- [ ] MOVER retira tinta da origem e COPIAR preserva a origem;
- [ ] a capa mostra linha, coluna e cruzamento sem coordenada falsa.

### Segurança e clareza

- [ ] a máquina parece de pintura escolar, nunca militar;
- [ ] nenhuma pessoa é alvo;
- [ ] não há arma, explosão ou vidro quebrado;
- [ ] o arco da gota não atravessa o pedido;
- [ ] o canhão não parece botão clicável;
- [ ] o fundo não contém objetos que pareçam opções.

### Produção

- [ ] jogo funciona integralmente sem PNG;
- [ ] primeiro corte inclui só nível 1;
- [ ] tamanhos são testados a 30%;
- [ ] alfa e caixas dos frames são medidos;
- [ ] capa é produzida após aprovação visual e pedagógica.
