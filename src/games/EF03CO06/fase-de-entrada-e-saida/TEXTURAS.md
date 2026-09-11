# Fase de Entrada e Saída — TEXTURAS.md

Este documento especifica somente a arte do jogo descrito em
[PLANEJAMENTO.md](./PLANEJAMENTO.md).

A prioridade desta revisão é **reconhecimento imediato**. Nenhuma textura
principal pode parecer um aparelho inventado. Teclado deve parecer teclado,
microfone deve parecer microfone, monitor deve parecer monitor e o computador
central deve parecer uma torre de desktop amigável.

---

## 0. Estado e lista fechada

| Arquivo | Dimensão | Grade | Fundo | Função |
|---|---:|---:|---|---|
| `bg-laboratorio.png` | 1672 × 941 | imagem única | opaco | parede do laboratório |
| `personagem-lia.png` | 1024 × 256 | 4 × 1 | transparente | fonte humana da informação |
| `computador-central.png` | 1024 × 256 | 4 × 1 | transparente | recebe, processa e envia |
| `dispositivos-entrada.png` | 1024 × 512 | 4 × 2 | transparente | teclado, mouse, microfone e câmera |
| `dispositivos-saida.png` | 768 × 512 | 3 × 2 | transparente | monitor, alto-falante e impressora |
| `cover-fase-de-entrada-e-saida.png` | 1672 × 941 | imagem única | opaco | capa do catálogo |

**Total: seis arquivos.**

Ainda não considerar nenhuma arte anterior como aprovada. Em especial:

- a caixa metálica clara com três luzes não é o computador deste plano;
- o objeto marrom com manivela não é usado no jogo;
- não adaptar esses desenhos; gerar novamente a partir dos prompts abaixo.

A bancada, a porta, os cabos, as setas, os encaixes, os cartões, os balões,
os textos, as ondas, o papel e os desenhos são feitos em código. Não criar
arquivos extras para esses elementos.

---

## 1. Regra visual que não pode ser quebrada

A imagem deve comunicar a cadeia abaixo antes mesmo de a criança ler a frase:

**pessoa ou objeto no mundo → aparelho de entrada → computador → aparelho de
saída → resultado no mundo**

Três decisões sustentam essa leitura:

1. aparelhos conhecidos, com silhuetas escolares e domésticas;
2. entrada e saída em folhas separadas, nunca misturadas;
3. computador no centro, com porta azul à esquerda e porta laranja à direita.

As cores dos cabos mostram direção de movimento, não “certo” e “errado”.
Não pintar todos os dispositivos de entrada de azul nem todos os de saída de
laranja. Cada aparelho usa a mesma família de plástico claro e detalhes
azulados. A função é reconhecida pelo objeto e pelo efeito.

### Teste de silhueta

Antes de aprovar cada folha:

1. reduzir cada frame para 64 × 64;
2. esconder nome, cabo e brilho;
3. perguntar a uma pessoa o que é o objeto;
4. aceitar somente se reconhecer sem alternativas.

Metas:

| Frame | Resposta aceitável |
|---|---|
| computador central | computador, CPU ou torre de computador |
| teclado | teclado |
| mouse | mouse de computador |
| microfone | microfone |
| câmera | câmera ou máquina fotográfica |
| monitor | monitor ou tela de computador |
| alto-falante | caixa de som ou alto-falante |
| impressora | impressora |

“Máquina”, “caixa”, “robô”, “eletrodoméstico” ou “não sei” exigem refazer.

---

## 2. O que saiu da proposta anterior

### Gabinete metálico abstrato

O pedido anterior de “gabinete sem tela e sem rosto” retirou justamente os
sinais visuais que fariam o objeto parecer computador. O resultado ficou
próximo de quadro elétrico, cofre ou aparelho industrial.

Agora o computador central tem:

- silhueta vertical de torre de desktop;
- pequena unidade de DVD ou duas portas frontais;
- botão circular de energia;
- grade de ventilação;
- visor quadrado com rosto simples;
- base larga e estável;
- uma porta de cabo em cada lateral.

O visor de rosto mostra estado, mas **não é o monitor de saída**. Ele nunca
exibe foto, palavra ou conteúdo da tarefa. O rótulo COMPUTADOR é Phaser.Text.

### Caixinha com manivela

Ela parecia torradeira, rádio ou máquina desconhecida e exigia explicar uma
fonte sonora antes de explicar entrada e saída. Foi removida.

A fonte de som agora é Lia falando. A criança vê boca, microfone e
alto-falante na mesma composição. Ondas animadas em código tornam a cadeia
compreensível mesmo com o jogo no mudo.

---

## 3. Estilo comum

Todos os assets devem parecer parte do mesmo jogo:

- ilustração 2D infantil polida;
- formas largas, arredondadas e simples;
- contorno azul-marinho escuro, espessura consistente;
- vista frontal ou três quartos muito leve;
- luz vindo do alto à esquerda;
- áreas de cor amplas;
- no máximo uma sombra interna suave;
- um pequeno brilho pintado por objeto;
- contraste suficiente sobre fundo claro e escuro;
- proporções legíveis em tela de celular;
- sem textura fotográfica;
- sem excesso de parafusos, grades ou detalhes industriais.

A personagem é humana e cotidiana. Os aparelhos são objetos comuns, não
criaturas com braços e pernas. Somente o computador central pode ter um
pequeno rosto no visor, pois ele atua como guia de processamento.

---

## 4. Negativo comum

Adicionar ao final de todos os prompts quando necessário:

~~~text
Negative: text, letters, numbers, words, title, caption, brand logo, watermark,
signature, input label, output label, green correct check, red wrong X,
traffic-light colors, category-colored background, quiz answer marker,
floating arrows, cable, wire, plug touching another object, extra device,
merged devices, hybrid device, anthropomorphic peripheral, arms, legs,
realistic hands, visible grid lines, frame border, cell background, cropped,
cut off, inconsistent paired geometry, fake transparency, white background,
checkerboard painted into image, 3D render, photorealistic, realistic,
hyperdetail, metal grime, horror, dark scene, motion blur, lens flare.
~~~

Regras específicas têm precedência. A capa pode conter cabos porque é uma
ilustração completa; as folhas de sprites não podem.

---

## 5. Paleta

| Uso | Cor |
|---|---|
| contorno principal | `#203149` |
| plástico claro | `#DCE7EC` |
| plástico azul suave | `#6699BF` |
| área escura de tela | `#24364D` |
| cabo / pulso de entrada | `#43B8D8` |
| cabo / pulso de saída | `#F2A44A` |
| cobre discreto | `#C68B58` |
| madeira da bancada | `#B8875B` |
| parede creme | `#F3E5C8` |
| destaque âmbar de trava | `#F4B942` |
| roupa de Lia | coral `#E86F51` e azul `#4E7EA8` |

Azul e laranja aparecem nas portas laterais do computador e nos cabos em
Graphics. Não transformar o corpo inteiro de cada periférico em uma dessas
cores.

---

# 6. `bg-laboratorio.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão | 1672 × 941 |
| transparência | não; imagem totalmente opaca |
| câmera | frontal |
| função | parede e profundidade discreta |
| conteúdo interativo | nenhum |
| área calma central | x 10%–90%, y 18%–75% |

O fundo mostra uma sala de informática escolar clara, mas **sem computadores,
periféricos, mesas, cadeiras ou porta principal**. Esses elementos pertencem
ao código e precisam mudar de estado sem deixar fantasmas pintados.

Pode conter apenas:

- parede creme;
- rodapé azul;
- duas janelas altas e simples nas extremidades;
- dois pôsteres abstratos sem letras;
- prateleira muito alta com três caixas fechadas;
- chão claro discreto.

A região do fluxo deve ficar limpa. Nada atrás do computador central pode
parecer tela, porta, tomada ou aparelho.

## Prompt copiável

~~~text
A clean background for a children's educational computer-lab game, exactly
1672 by 941 pixels, landscape, fully opaque and filling the whole canvas.

Front-facing bright elementary-school technology classroom wall. Warm cream
wall #F3E5C8, soft pale blue baseboard, a calm light floor occupying the bottom
22 percent. One tall simple window near the far left edge and one near the far
right edge, both with soft daylight and no visible landscape details. Two tiny
abstract geometric posters high on the wall, without letters, numbers, icons
or recognizable devices. One very high narrow shelf with three closed plain
storage boxes.

Keep the broad central region from x=10 to 90 percent and y=18 to 75 percent
visually quiet, almost empty and evenly lit. This area will receive a character,
input devices, a computer tower, output devices, animated cables and a door
drawn by code. Do not paint any furniture or interactive object into it.

Flat 2D cartoon educational game background, chunky rounded architecture,
broad matte color fields, thick dark navy accents #203149 only on architectural
edges, gentle upper-left lighting, one soft ambient shadow, cheerful and calm,
excellent readability behind sprites, no visual clutter.

Negative: desk, table, workbench, chair, door, computer, computer tower,
monitor, television, keyboard, mouse, microphone, camera, speaker, printer,
cable, outlet, socket, text, letters, numbers, alphabet poster, logo, watermark,
character, child, robot, question card, green check, red X, strong perspective,
corridor, outdoor valley, cave, platformer, prison, dark room, horror, border,
white margin, 3D render, realistic, photorealistic, hyperdetail, lens flare.
~~~

## Conferência

- [ ] a bancada feita por código não duplica outra bancada;
- [ ] o computador central não fica sobre uma janela ou pôster;
- [ ] o cabeçalho continua legível;
- [ ] o fundo cobre 1280 × 720 com `cover` sem faixa vazia;
- [ ] não existe objeto que a criança tente tocar.

---

# 7. `personagem-lia.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão total | 1024 × 256 |
| grade | 4 colunas × 1 linha |
| célula | 256 × 256 |
| transparência | alfa real |
| pivô | centro inferior |
| preenchimento | 82% da altura, 62% da largura |
| linha do chão | idêntica nos quatro frames |

Lia é uma criança de aproximadamente oito anos, com roupa cotidiana. Ela
representa o mundo exterior, não um avatar controlável.

| Frame | Estado | Uso |
|---:|---|---|
| 0 | esperando | apresentação e escolha |
| 1 | falando | fonte sonora |
| 2 | mostrando cartão branco | fonte visual; desenho é sobreposto em código |
| 3 | comemorando | fim do desafio |

O cartão do frame 2 precisa ter uma área interna branca plana e desobstruída.
O desenho de flor ou barco é renderizado depois, para permanecer idêntico ao
que aparece no monitor ou no papel.

Área útil sugerida do cartão dentro da célula:
`x=0,44–0,84; y=0,30–0,62`.

## Prompt copiável

~~~text
Sprite sheet with exactly 4 frames in one strict horizontal row.
Each frame is exactly 256 by 256 pixels; total image exactly 1024 by 256 pixels.
True transparent background, no visible grid, no cell background and no bleed.

The exact same friendly eight-year-old Brazilian school child named Lia in all
four frames. Medium-brown skin, dark curly hair tied in one high puff, coral
short-sleeve shirt #E86F51, blue overalls #4E7EA8, simple yellow sneakers.
Front-facing with a very slight three-quarter turn toward the right. Full body
visible, both feet on exactly the same baseline, same head size and body scale
in every frame. No cable or computer device attached to her.

Frames left to right:
1. WAITING: relaxed standing pose, friendly neutral expression, hands visible.
2. SPEAKING: same stance and scale, mouth open naturally as if saying a short
   sentence, one hand near the chest. No sound waves and no music notes.
3. SHOWING A CARD: Lia holds one large horizontal white card toward the viewer
   at chest height. The card has a thick dark navy border and a perfectly flat,
   empty, unobstructed white inner rectangle approximately x=44 to 84 percent
   and y=30 to 62 percent of the cell. Fingers stay outside the inner rectangle.
4. CELEBRATING: both hands lifted slightly, happy expression, feet still on the
   exact same baseline. No star, trophy, checkmark or confetti.

Flat 2D cartoon children's educational game character, chunky rounded shapes,
thick dark navy outline #203149, broad flat colors, one soft inner shadow,
small upper-left painted highlights, warm friendly face, readable at mobile
size, consistent proportions and visual weight.

Negative: text, letters, numbers, words, logo, watermark, signature, sound
waves, speech bubble, microphone, camera, keyboard, mouse, monitor, speaker,
printer, computer, cable, floating drawing already inside the card, flower,
boat, mountain, green check, red X, star, trophy, confetti, multiple children,
adult, cropped feet, cut off hair, moving ground line, different clothes,
different child, 3D render, realistic, photorealistic, hyperdetail, motion blur.
~~~

## Controles de qualidade

- [ ] é a mesma Lia nos quatro frames;
- [ ] pés não saltam ao trocar frame;
- [ ] cartão está inteiro e grande;
- [ ] área branca do cartão não tem brilho, mão ou sombra;
- [ ] falar é reconhecível pelo rosto, sem onda pintada;
- [ ] a personagem não carrega nenhum periférico.

---

# 8. `computador-central.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão total | 1024 × 256 |
| grade | 4 × 1 |
| célula | 256 × 256 |
| transparência | alfa real |
| pivô | centro inferior |
| preenchimento | 82% da altura, 76% da largura |
| função | processador central e guia |
| conteúdo proibido | foto, palavra, onda ou resposta |

O computador deve passar no teste “torre de desktop” sem rótulo. Não pedir
“gabinete genérico”. A combinação de botão de energia, portas frontais,
ventilação e forma vertical dá identidade ao objeto.

A tela quadrada pequena é apenas um rosto de estado, não o dispositivo de
saída do jogo. O monitor continua separado.

| Frame | Estado | Diferença permitida |
|---:|---|---|
| 0 | repouso | rosto atento; luzes apagadas |
| 1 | recebendo | porta lateral esquerda e um LED ciano acesos |
| 2 | processando | olhos concentrados; três pontos do próprio visor |
| 3 | enviando | porta lateral direita e um LED laranja acesos |

As duas portas laterais permanecem na mesma coordenada em todos os frames.
Guardar a posição real depois da entrega.

## Prompt copiável

~~~text
Sprite sheet with exactly 4 frames in one strict horizontal row.
Each frame is exactly 256 by 256 pixels; total image exactly 1024 by 256 pixels.
True transparent background, no visible grid lines, no cell backgrounds,
no bleed between frames.

The exact same unmistakable vertical desktop computer tower in every frame,
designed as a friendly processing mascot for an elementary-school game.
Front-facing pale blue-gray PC case #DCE7EC with dark navy outline #203149.
Clearly recognizable computer-tower silhouette: tall rounded rectangular case,
wide stable base, one circular power button near the upper front, two narrow
horizontal USB-like ports, one broad ventilation grille near the lower front,
and one small square dark status display near the top.

The small status display contains only a simple friendly face. It is a status
panel, not a monitor: never show a picture, word, document, waveform or task
content in it. A chunky blue input socket protrudes from the LEFT side of the
tower and a chunky orange output socket protrudes from the RIGHT side. Both
sockets stay at exactly the same height and coordinates in all frames.
No attached cables.

Frames left to right:
1. IDLE: neutral attentive face, side sockets and indicator lights unlit.
2. RECEIVING: identical tower and face position, left socket glowing cyan
   #43B8D8 and one tiny cyan indicator lit; right socket remains unlit.
3. PROCESSING: identical tower, both sockets softly unlit, face looks focused
   with three tiny neutral dots contained entirely inside its own status panel.
4. SENDING: identical tower and face position, right socket glowing orange
   #F2A44A and one tiny orange indicator lit; left socket remains unlit.

The body geometry, base, power button, grille, ports, display and side sockets
must align perfectly between frames. Only face expression and small lights
change. It must read immediately as a desktop PC tower, never as an electrical
cabinet, safe, refrigerator, toaster, boiler, battery or industrial machine.

Flat 2D cartoon educational game asset, chunky rounded shape, broad flat color
areas, thick dark navy outline, upper-left light, one soft inner shadow, one
small painted highlight, friendly but technically recognizable, readable at
64 pixels tall.

Negative: full-size monitor, laptop, tablet, television, blank industrial box,
electrical cabinet, fuse box, safe, refrigerator, toaster, server rack, robot
body, arms, legs, wheels, antenna, keyboard, mouse, microphone, camera,
speaker, printer, attached cable, plug, picture in status screen, word in
screen, text, letters, numbers, logo, watermark, green correct glow, red X,
different case geometry between frames, moving sockets, cropped, cut off,
white background, fake transparency, 3D render, realistic, photorealistic,
hyperdetail, grime, motion blur, lens flare.
~~~

## Testes obrigatórios

- [ ] três avaliadores reconhecem “computador/CPU/torre” em 64 × 64;
- [ ] ninguém responde apenas “caixa” ou “máquina”;
- [ ] botão de energia e ventilação estão visíveis;
- [ ] visor é pequeno o bastante para não competir com o monitor;
- [ ] porta esquerda e porta direita não mudam de posição;
- [ ] frame ativo não parece acerto ou erro.

Se falhar no teste, não tentar salvar com um rótulo dentro do PNG. Refazer a
silhueta; o rótulo em código é reforço, não remendo.

---

# 9. `dispositivos-entrada.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão total | 1024 × 512 |
| grade | 4 colunas × 2 linhas |
| célula | 256 × 256 |
| transparência | alfa real |
| linha 1 | repouso |
| linha 2 | atividade |
| ordem | teclado, mouse, microfone, câmera |

| Coluna | Neutro | Ativo | Aparelho | Alteração ativa |
|---:|---:|---:|---|---|
| 0 | 0 | 4 | teclado | três teclas levemente abaixadas |
| 1 | 1 | 5 | mouse | botão esquerdo abaixado |
| 2 | 2 | 6 | microfone | LED ciano discreto |
| 3 | 3 | 7 | câmera | obturador e LED ciano |

Todos devem ser periféricos externos separados, sem cabo pintado. Não misturar
monitor, alto-falante ou impressora nesta folha.

## Prompt copiável

~~~text
Sprite sheet with exactly 8 frames in a strict 4-column by 2-row grid.
Each frame is exactly 256 by 256 pixels; total image exactly 1024 by 512 pixels.
True transparent background. No visible grid lines, no cell background,
no labels and no bleed. One complete centered input device per frame.

Draw four familiar physical computer INPUT peripherals for a children's
educational game. All objects use pale blue-gray plastic #DCE7EC, dark slate
details #637B8C, small blue accents #6699BF and thick dark navy outline #203149.
Front-facing with only slight depth, stable baseline, about 78 percent cell
fill, broad readable silhouette, generous clear margins. No attached cables.

Top row, left to right, neutral:
1. KEYBOARD: one wide external desktop keyboard, rounded rectangular body,
   several rows of clearly separated blank keys and one long space bar. No
   letters or symbols on keys, no screen, no hand.
2. MOUSE: one standard external computer mouse, rounded oval body, clear seam
   between left and right buttons and one central scroll wheel. It must look
   like a computer mouse, not an animal and not a trackpad.
3. MICROPHONE: one familiar tabletop microphone with a large dark mesh capsule,
   short straight stem and broad stable round base. No speaker cone, camera
   lens or headphones.
4. CAMERA: one familiar compact still-photo camera with a large central round
   lens, small shutter button on top, simple viewfinder bump and short grip.
   No microphone mesh, tripod or phone shape.

Bottom row, left to right, active versions of the EXACT same devices:
5. KEYBOARD ACTIVE: same geometry and location as frame 1; three blank keys are
   pressed a few pixels down. No glowing word.
6. MOUSE ACTIVE: same geometry and location as frame 2; left button slightly
   pressed and scroll wheel unchanged. No cursor painted into the frame.
7. MICROPHONE ACTIVE: same geometry and location as frame 3; one tiny cyan
   indicator #43B8D8 is lit. No external sound waves.
8. CAMERA ACTIVE: same geometry and location as frame 4; shutter aperture
   changes slightly and one tiny cyan capture light is lit. No flash covering
   the lens and no photograph.

The active row is not a success row. Never add green glow, checkmark, smile,
reward or celebration. Device pairs must align perfectly when switched.

Flat 2D cartoon educational-game sprites, chunky rounded shapes, broad flat
colors, one soft inner shadow, small upper-left highlight, polished and
friendly, immediately recognizable at 64 pixels.

Negative: monitor, screen, television, laptop, speaker, loudspeaker, printer,
paper, combined keyboard and monitor, microphone shaped like speaker,
camera shaped like webcam, smartphone, game controller, joystick, cable, wire,
plug, visible text, letters, numbers, symbols on keys, logo, watermark,
input arrow, category badge, green check, red X, face, eyes, arms, legs,
animal mouse, realistic hand, grid line, border, cell background, cropped,
cut off, different paired scale, white background, fake transparency,
3D render, realistic, photorealistic, hyperdetail, motion blur, lens flare.
~~~

## Conferência por aparelho

### Teclado

- quatro fileiras percebidas;
- barra de espaço longa;
- nenhuma letra que possa ficar ilegível;
- largura maior que altura.

### Mouse

- dois botões e roda;
- não parecer controle remoto, sabonete ou animal;
- orientação vertical estável nos dois frames.

### Microfone

- malha no topo e pedestal claros;
- não parecer caixa de som;
- LED pequeno, nunca halo de resposta.

### Câmera

- lente dominante e botão superior;
- não parecer webcam integrada;
- nenhuma imagem dentro da lente.

---

# 10. `dispositivos-saida.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão total | 768 × 512 |
| grade | 3 colunas × 2 linhas |
| célula | 256 × 256 |
| transparência | alfa real |
| linha 1 | repouso |
| linha 2 | atividade |
| ordem | monitor, alto-falante, impressora |

| Coluna | Neutro | Ativo | Aparelho | Alteração ativa |
|---:|---:|---:|---|---|
| 0 | 0 | 3 | monitor | vidro um pouco mais claro |
| 1 | 1 | 4 | alto-falante | cone avança levemente |
| 2 | 2 | 5 | impressora | roletes giram |

O conteúdo do monitor, as ondas do alto-falante e a folha da impressora nunca
fazem parte da folha. O jogo os desenha conforme a informação atual.

### Áreas reservadas

| Aparelho | Área normalizada livre |
|---|---|
| monitor | vidro: x 0,17–0,83; y 0,19–0,62 |
| impressora | fenda: x 0,24–0,76; y 0,50–0,59 |
| alto-falante | centro do cone: aproximadamente x 0,50; y 0,50 |

Medir novamente na arte recebida e registrar a área real.

## Prompt copiável

~~~text
Sprite sheet with exactly 6 frames in a strict 3-column by 2-row grid.
Each frame is exactly 256 by 256 pixels; total image exactly 768 by 512 pixels.
True transparent background. No visible grid lines, no cell background,
no labels and no bleed. One complete centered output device per frame.

Draw three familiar physical computer OUTPUT peripherals for a children's
educational game. All objects use pale blue-gray plastic #DCE7EC, dark slate
details #637B8C, small blue accents #6699BF and thick dark navy outline #203149.
Front-facing with minimal depth, stable baseline, about 78 percent cell fill,
broad readable silhouette and generous clear margins. No attached cables.

Top row, left to right, neutral:
1. MONITOR: one separate wide desktop monitor with a thin rounded bezel and
   short stable stand. The inner dark glass is perfectly flat, rectangular,
   completely blank and unobstructed, approximately x=17 to 83 percent and
   y=19 to 62 percent of the cell. No glare streak crossing the inner glass.
2. SPEAKER: one separate desktop loudspeaker, a rounded rectangular cabinet
   with one large circular woofer and one smaller circular tweeter. Clearly a
   speaker box, not a microphone, radio, toaster or crank device.
3. PRINTER: one familiar compact desktop inkjet printer with paper input lid,
   broad front output slot and small empty output tray. The central slot stays
   open and unobstructed approximately x=24 to 76 percent and y=50 to 59
   percent. No sheet of paper inside or outside.

Bottom row, left to right, active versions of the EXACT same devices:
4. MONITOR ACTIVE: identical case, stand and glass coordinates; inner glass
   becomes slightly brighter but remains perfectly blank and flat.
5. SPEAKER ACTIVE: identical case and position; large cone shifts forward by
   only a few pixels. No sound waves or music notes.
6. PRINTER ACTIVE: identical case, slot and tray; two small rollers change
   position slightly. No paper appears in the sprite.

Pairs must align perfectly. Active means mechanically operating, not correct.
No green glow, checkmark, smile, star, confetti or reward.

Flat 2D cartoon educational-game sprites, chunky rounded forms, broad flat
colors, one soft inner shadow, small upper-left painted highlight outside
reserved content areas, polished, friendly and recognizable at 64 pixels.

Negative: keyboard, mouse, microphone, camera, laptop, combined all-in-one
computer, television antenna, radio, crank, music box, toaster, document
already on screen, waveform on screen, word on screen, picture on screen,
paper, printed sheet, sound wave, music note, cable, wire, plug, text, letters,
numbers, logo, watermark, output arrow, category badge, green check, red X,
face, eyes, arms, legs, grid line, border, cell background, cropped, cut off,
different paired scale, white background, fake transparency, 3D render,
realistic, photorealistic, hyperdetail, motion blur, lens flare.
~~~

## Controles de qualidade

- [ ] monitor parece monitor, não TV ou tablet;
- [ ] tela útil é plana, vazia e igual nos frames 0 e 3;
- [ ] alto-falante tem cone evidente e não tem manivela;
- [ ] impressora tem tampa, fenda e bandeja;
- [ ] papel pode nascer atrás da máscara da fenda;
- [ ] os três são externos e separados;
- [ ] nenhum resultado da tarefa está pintado.

---

# 11. `cover-fase-de-entrada-e-saida.png`

## Objetivo da capa

A capa precisa parecer um jogo de entrada e saída sem depender do título.
Mostrar **uma única cadeia completa**, não uma coleção de aparelhos soltos.

Cena escolhida:

**Lia falando → microfone → computador → alto-falante reproduzindo.**

Uma segunda evidência discreta pode aparecer no fundo da bancada: câmera,
monitor e impressora desligados como ferramentas futuras. Não colocar duas
cadeias acesas ao mesmo tempo.

## Prompt copiável

~~~text
A polished cover illustration for a children's educational game about physical
computer input and output devices, exactly 1672 by 941 pixels, landscape,
fully opaque and filling the entire canvas.

In a bright friendly elementary-school computer lab, show one clear left-to-
right information chain across a broad wooden workbench.

Far left: the same friendly eight-year-old Brazilian child Lia, medium-brown
skin, dark curly hair in one high puff, coral shirt and blue overalls. She is
speaking toward a familiar tabletop MICROPHONE with a dark mesh capsule and
round base. Simple cyan sound-wave arcs travel from her mouth to the microphone.

Center: a clearly recognizable vertical DESKTOP COMPUTER TOWER, pale blue-gray
with circular power button, two front ports, lower ventilation grille and one
small friendly face status display. It must look like a PC tower, not an
industrial box. A cyan cable travels from the microphone into the LEFT socket
of the tower. Small cyan pulses move toward the computer.

Right: an orange cable leaves the RIGHT socket of the tower and reaches one
familiar DESKTOP LOUDSPEAKER with a large woofer and small tweeter. Warm orange
sound-wave arcs leave the speaker into the room, making the output visible.
Lia looks pleased but does not point at an answer.

At the far right, a rounded workshop door has three mechanical latches, one
open and two closed, showing game progress. A familiar camera, blank desktop
monitor, keyboard, mouse and compact printer can rest neatly and unlit along
the front edge of the bench as future tools. They must remain secondary and
must not have glowing cables.

Composition must read instantly from left to right:
human voice enters through microphone, passes through computer, exits through
speaker. Leave the top 18 percent calm and light for the platform title overlay.
Keep all important faces and devices away from crop margins.

Flat 2D cartoon children's educational game cover, chunky rounded shapes,
thick dark navy outlines #203149, pale blue-gray devices #DCE7EC, cyan input
signal #43B8D8, orange output signal #F2A44A, warm wood #B8875B, cream classroom
wall #F3E5C8, broad flat colors, one soft inner shadow, small painted highlights,
polished, friendly, clear and uncluttered.

Negative: title, text, letters, numbers, words, logo, watermark, signature,
blank electrical cabinet, safe, refrigerator, toaster, crank music box,
industrial machine, microphone shaped like speaker, speaker shaped like radio,
integrated all-in-one device, second active chain, tangled cables, arrows with
words, green check, red X, quiz cards, platformer, runner, outdoor valley,
cave, horror, prison, dark room, frightened child, 3D render, realistic,
photorealistic, hyperdetail, border, white margin, cropped devices, motion blur,
lens flare.
~~~

## Conferência

- [ ] a fala nasce em Lia;
- [ ] microfone aparece antes do computador;
- [ ] alto-falante aparece depois;
- [ ] sinais têm sentidos coerentes;
- [ ] computador passa no teste de torre;
- [ ] não existe caixinha com manivela;
- [ ] título pode ser sobreposto sem cobrir a cadeia;
- [ ] a porta parece progresso, não dispositivo de saída.

---

# 12. O que permanece em Graphics e Text

| Elemento | Implementação | Motivo |
|---|---|---|
| bancada | formas arredondadas | adapta ao layout |
| porta e fechos | Graphics + tween | progresso muda |
| rótulos | Phaser.Text | nitidez e localização |
| setas | Graphics | direção permanente |
| cabos | curvas | pontos dependem do aparelho |
| pulsos | círculos/tweens | mostram movimento |
| encaixes | formas com presilha | estado editável/fixo |
| cartões | Graphics + texto | opções e trava |
| desenhos | funções `drawPicture` | mesma imagem em todos os suportes |
| cursor | Graphics | resultado do mouse |
| letras digitadas | Phaser.Text | conteúdo variável |
| tela do monitor | máscara + conteúdo | saída depende do desafio |
| ondas de voz | arcos animados | modo mudo |
| papel | retângulo com máscara | sai pela fenda real |
| cadeado | Graphics | padrão de TRAVA |
| ajuda | componentes compartilhados | acessibilidade |
| vidas e estrelas | componentes compartilhados | padrão do catálogo |

### O mesmo conteúdo em todos os lugares

`drawPicture('flower')` desenha a mesma flor:

- no cartão segurado por Lia;
- na miniatura interna do computador;
- na tela do monitor;
- na folha impressa;
- no quadro final.

Não gerar versões diferentes da flor. Isso evita ensinar que “imagem” significa
apenas cor parecida.

### Camadas

Da mais baixa para a mais alta:

1. fundo;
2. bancada e porta;
3. cabos apagados;
4. personagem e aparelhos;
5. conteúdo dentro de tela/cartão/papel;
6. pulsos e ondas;
7. cartões e pedido;
8. trava;
9. ajuda.

Conteúdo de tela usa máscara retangular medida após receber o PNG. Papel começa
atrás da face da impressora e cruza a fenda; não deve surgir na frente inteira.

---

# 13. Antes de qualquer PNG existir

O nível 1 deve funcionar por completo com placeholders feitos em código.

| Objeto | Placeholder reconhecível |
|---|---|
| Lia | cabeça, cabelo, corpo e boca |
| computador | torre vertical, energia, portas, grade e visor |
| teclado | caixa larga com fileiras de teclas |
| mouse | oval com dois botões e roda |
| microfone | cápsula, haste e base |
| câmera | corpo, lente grande e botão |
| monitor | moldura, tela vazia e pé |
| alto-falante | caixa com dois cones |
| impressora | tampa, fenda e bandeja |

Cada placeholder recebe nome em Phaser.Text. Não usar emoji. A falta de arte
não muda hitbox, posição, capacidade, tempo ou regra.

Se o placeholder do computador já parecer apenas uma caixa, corrigir antes de
gerar a textura. A arte não deve esconder um problema de composição.

---

# 14. Como carregar e medir

~~~ts
const ART = import.meta.glob(
    '../../../../assets/games/EF03CO06/fase-de-entrada-e-saida/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>
~~~

`BootScene` ignora arquivos `cover-`, registra somente os existentes e mantém
fallback para ausentes.

| Chave | Arquivo | Frame |
|---|---|---|
| `io-background` | `bg-laboratorio.png` | imagem |
| `io-lia` | `personagem-lia.png` | 256 × 256 |
| `io-computer` | `computador-central.png` | 256 × 256 |
| `io-inputs` | `dispositivos-entrada.png` | 256 × 256 |
| `io-outputs` | `dispositivos-saida.png` | 256 × 256 |

### Índices

~~~ts
const LIA_FRAME = {
    idle: 0,
    speaking: 1,
    showingCard: 2,
    celebrating: 3,
} as const

const COMPUTER_FRAME = {
    idle: 0,
    receiving: 1,
    processing: 2,
    sending: 3,
} as const

const INPUT_FRAME = {
    keyboard: 0,
    mouse: 1,
    microphone: 2,
    camera: 3,
} as const

const OUTPUT_FRAME = {
    monitor: 0,
    speaker: 1,
    printer: 2,
} as const
~~~

Somar 4 para estado ativo de entrada e 3 para estado ativo de saída.

### Medição obrigatória após entrega

1. confirmar dimensão total e divisibilidade por 256;
2. verificar alfa real em fundo claro e escuro;
3. calcular caixa alfa de cada frame;
4. comparar geometria neutra/ativa;
5. medir pés e cartão de Lia;
6. medir portas laterais do computador;
7. medir vidro útil do monitor;
8. medir centro do cone do alto-falante;
9. medir fenda da impressora;
10. registrar tudo em `layout.ts`;
11. testar a 100% e a 30% de escala.

Não compensar frame torto com offsets diferentes espalhados pela cena. Corrigir
a folha ou guardar uma única tabela centralizada de pivôs.

---

# 15. Entrega técnica

| Item | Regra |
|---|---|
| formato | PNG-24 |
| alfa | real nas quatro folhas de sprites |
| opacos | fundo e capa |
| célula | exatamente 256 × 256 |
| margem interna | mínimo 9% |
| sangria | nenhuma |
| iluminação | alto à esquerda |
| contorno | mesma espessura aparente |
| texto no PNG | nenhum |
| fundo quadriculado pintado | proibido |
| peso alvo | até 900 KB por folha; até 1,5 MB por imagem opaca |

Se o gerador retornar resolução maior, redimensionar a folha inteira mantendo
a grade exata. Não redimensionar células separadamente.

Se retornar fundo branco, não aceitar como transparência. Gerar novamente com
alfa ou usar fundo magenta uniforme para remoção técnica, conferindo halos.

---

# 16. Ordem de produção

### Rodada 1 — provar a leitura

1. `dispositivos-entrada.png`;
2. `dispositivos-saida.png`;
3. executar teste de silhueta em 64 × 64;
4. corrigir objetos ambíguos antes de gerar os demais.

### Rodada 2 — montar o nível 1

5. `computador-central.png`;
6. `personagem-lia.png`;
7. integrar os três desafios do nível 1 com placeholders para fundo;
8. testar fluxo, máscaras, TRAVA e celular.

### Rodada 3 — acabamento

9. `bg-laboratorio.png`;
10. fazer teste real com o usuário;
11. ajustar escalas e posições;
12. `cover-fase-de-entrada-e-saida.png` por último.

Não gerar a capa antes de o computador e os periféricos serem aprovados. A capa
reutiliza as identidades visuais definitivas.

---

# 17. Checklist final

## Lista e organização

- [ ] exatamente seis arquivos;
- [ ] entradas e saídas estão em folhas diferentes;
- [ ] não existe `caixinha-de-som.png`;
- [ ] não existe folha genérica `aparelhos.png`;
- [ ] não existe “gabinete sem rosto”;
- [ ] nomes e categorias são código, não pixels.

## Reconhecimento

- [ ] computador parece torre de desktop;
- [ ] teclado tem teclas e barra de espaço;
- [ ] mouse tem dois botões e roda;
- [ ] microfone tem cápsula e pedestal;
- [ ] câmera tem lente e botão;
- [ ] monitor tem tela e pé;
- [ ] alto-falante tem cones;
- [ ] impressora tem tampa, fenda e bandeja;
- [ ] todos passam no teste a 64 × 64.

## Folhas

- [ ] Lia: 4 × 1;
- [ ] computador: 4 × 1;
- [ ] entradas: 4 × 2;
- [ ] saídas: 3 × 2;
- [ ] pares neutro/ativo têm mesma geometria;
- [ ] não há linha de grade ou fundo branco;
- [ ] nenhum ativo indica acerto;
- [ ] áreas de monitor, cartão e fenda estão livres.

## Integração

- [ ] MUNDO → ENTRADA → COMPUTADOR → SAÍDA → MUNDO permanece visível;
- [ ] pulsos azuis entram e laranja saem;
- [ ] o mesmo desenho aparece na fonte e no resultado;
- [ ] voz e reprodução são distintas no tempo;
- [ ] papel nasce atrás da impressora;
- [ ] o jogo funciona no mudo;
- [ ] nenhuma permissão real é solicitada;
- [ ] asset ausente usa fallback;
- [ ] hitboxes continuam grandes no celular.

## Capa

- [ ] Lia fala para o microfone;
- [ ] microfone liga à esquerda do computador;
- [ ] alto-falante liga à direita;
- [ ] computador é reconhecível;
- [ ] cadeia é única e legível;
- [ ] porta é apenas progresso;
- [ ] não há texto embutido;
- [ ] não há objeto com manivela.

---

## 18. Resumo para quem vai gerar a arte

Se houver dúvida, seguir esta ordem mental:

1. desenhe objetos que uma criança já viu;
2. teste cada silhueta pequena;
3. separe ENTRADA e SAÍDA em arquivos;
4. deixe efeitos e palavras para o código;
5. mantenha o computador central claramente reconhecível;
6. mostre uma pessoa falando na capa;
7. descarte qualquer resultado parecido com caixa industrial, torradeira,
   rádio de manivela ou aparelho de função desconhecida.

A arte não precisa ensinar sozinha toda a BNCC, mas não pode exigir uma aula
para que o jogador descubra o que cada objeto representa.
