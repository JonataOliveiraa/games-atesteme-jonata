# Fase de Entrada e Saída - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF03CO06/fase-de-entrada-e-saida/`

**Versão: escape room de uma bancada.** Este documento substitui integralmente
a lista e os prompts da antiga versão de plataforma.

---

## 0. A lista

Cinco arquivos: um fundo, três folhas de objetos e a capa.
**Todos estão a gerar.** A pasta de assets deste jogo ainda não existe;
as medidas abaixo são pedidos de produção, não medidas de imagens entregues.

| # | Arquivo | Tamanho | Grade | Para quê | Quando | Prompt |
|---|---|---|---|---|---|---|
| 1 | `bg-bancada.png` | 1672 x 941 | — | parede do laboratório atrás da bancada | **primeiro** | seção 5 |
| 2 | `computador-guia.png` | 1024 x 256 | 4 x 1 de 256 | gabinete em quatro estados | **primeiro** | seção 6 |
| 3 | `aparelhos.png` | 1280 x 512 | 5 x 2 de 256 | cinco aparelhos, neutros e ativos | **primeiro** | seção 7 |
| 4 | `caixinha-de-som.png` | 768 x 256 | 3 x 1 de 256 | fonte sonora em três estados | depois do teste do nível 1 | seção 8 |
| 5 | `cover-fase-de-entrada-e-saida.png` | 1672 x 941 | — | capa do catálogo | por último | seção 9 |

Gerar as folhas inteiras. O nível 1 usa o gabinete e os cinco aparelhos, mesmo
que nem todos precisem animar em todas as tarefas. A caixinha só é necessária
para o som dos níveis 2 e 3; o placeholder permite testar a simulação antes.

**Nada de bancada, mesa, porta, fecho, encaixe, cabo, seta, botão, cartão,
balão, rótulo, estrela, papel, onda ou partícula nas folhas.** Tudo isso é
Graphics ou Phaser.Text. O fundo também não traz esses elementos embutidos.

A caixinha é um brinquedo-fonte de som, não um sexto periférico da bandeja.
A criança continua escolhendo somente entre os cinco aparelhos.

### O que deixa de ser pedido

A lista antiga do vale, corredor, interfaces básicas/ampliadas e sinais
básicos/ampliados foi aposentada. Não produzir esses arquivos para esta versão.
O nome computador-guia permanece, mas o prompt agora descreve um gabinete de
bancada, sem tela de conteúdo nem rosto. O prompt da capa também é novo.

Nenhum PNG foi apagado: não há arte entregue nesta pasta.

---

## 1. A regra que não pode ser quebrada

> **O resultado vem do programa; o aparelho não chega pintado com a resposta.**

A mesma impressora pode ser uma escolha útil para levar papel e inadequada
para ouvir uma gravação. Monitor e impressora podem mostrar a mesma imagem em
suportes diferentes. Nenhum aparelho tem borda verde, X, expressão triste,
cor de erro ou aspecto inferior.

Todos compartilham materiais, paleta e acabamento. Entrada e saída não são
separadas em famílias cromáticas nas texturas. Seus rótulos e setas aparecem
pelo código.

### As janelas precisam ficar vazias

- o monitor tem uma área plana livre para receber imagem ou onda;
- a impressora tem fenda livre para uma folha desenhada pelo código;
- a câmera tem lente e botão de captura, sem microfone integrado;
- o microfone não tem tela nem lente;
- o alto-falante não tem tela;
- o gabinete central mostra apenas luzes de funcionamento, nunca a foto.

A foto é renderizada pelo mesmo painter no suporte, monitor, papel e registro.
Se ela vier pintada no aparelho, a relação entre informação e resultado se perde.

### Estado ativo não é estado correto

Os frames ativos indicam funcionamento físico. O Monitor pode estar ativo
exibindo uma imagem quando o pedido era papel. A Impressora pode estar ativa
imprimindo quando o pedido era ver na tela.

Não adicionar check, estrela, brilho verde ou celebração aos frames ativos.

---

## 2. Estilo comum

```text
Flat 2D cartoon educational game asset for children, chunky rounded shapes,
bold readable silhouette, thick dark navy outline #203149, friendly controlled
colors, broad flat color areas, one soft inner shadow, one small painted white
highlight, minimal detail, polished children's science-workshop style,
readable at small mobile size, no text.
```

O ambiente é uma oficina de brinquedos iluminada, com parede clara, madeira,
metal pintado e plástico fosco. Os equipamentos têm proporções reconhecíveis
e poucos detalhes. A descoberta vem de aparelhos físicos fáceis de identificar.

**Vista frontal**, com profundidade mínima. Isso permite sobrepor a mesma
imagem retangular na tela e no papel sem transformações de perspectiva.

---

## 3. Negativo comum

```text
3D render, realistic, photorealistic, hyperdetailed, tiny details, dark escape room,
horror, prison, weapon, cyberpunk, brand logo, text, letters, numbers, words,
watermark, signature, outer frame, border, grid lines, colored category card,
green checkmark, red X, correct answer cue, cropped, cut off, merged cells,
white background on sprite sheets, fake transparency, motion blur, lens flare.
```

Os prompts individuais já incluem estilo e negativo completos. Copiar um
bloco por pedido, sem precisar colar marcadores como [estilo comum].

Tabelas de frames começam em **0**, como no Phaser. Listas de frames dentro
dos prompts começam em **1**. A ordem é sempre esquerda para direita,
de cima para baixo.

Fundo e capa são opacos. Somente as três folhas de objetos pedem alfa real.

---

## 4. Paleta

| Uso | Hex | Aplicação |
|---|---|---|
| contorno | `#203149` | todos os objetos |
| plástico claro | `#DCE7EC` | câmera, monitor, impressora e gabinete |
| metal escuro | `#637B8C` | microfone, alto-falante, bases e parafusos |
| azul suave | `#6699BF` | detalhes distribuídos entre todos os aparelhos |
| cobre | `#C68B58` | pequenos detalhes, sem código de categoria |
| parede | `#E8E5D7` | cenário opaco |
| madeira | `#B8875B` | detalhe de cenário e mesa em código |
| tela vazia | `#243647` | somente área interna do monitor |
| luz de funcionamento | `#BDE4EF` | LEDs ativos, sem juízo de acerto |
| entrada em movimento | `#45B8D6` | Graphics |
| saída em movimento | `#F1A64A` | Graphics |
| foco | `#56B8FF` | Graphics |
| sucesso | `#35D07F` | Graphics |
| erro | `#EF6D68` | Graphics |
| trava e dica | `#E8AD49` | Graphics |

Câmera e impressora compartilham plástico claro e detalhe azul; microfone e
alto-falante compartilham metal escuro. A criança não pode separar entrada e
saída olhando apenas a cor.

Os desenhos montanha, flor e barco são conteúdo em código. Podem ter cores
naturais diferentes; essas cores não escolhem qual aparelho serve ao pedido.

---

## 5. `bg-bancada.png` - 1672 x 941

Uma parede de oficina clara. O computador, a mesa e a porta são colocados pelo
jogo. Não pintar um retângulo de mesa que depois precise emendar com Graphics.

| Região | Composição |
|---|---|
| topo, 0–22% | parede suave, pouca informação para header e ? |
| miolo, 22–72% | espaço livre para fonte, aparelhos e gabinete |
| lado direito, 75–98% da largura | parede limpa para receber a porta |
| base, 72–100% | parede um pouco mais escura, atrás da bandeja |
| decoração | cantos superiores, longe das áreas de decisão |

Prompt copiável:

```text
A polished 2D background for a children's educational tabletop escape-room game,
exactly 1672 by 941 pixels, landscape composition, fully opaque image filling
the entire canvas.

Show the interior back wall of a bright welcoming children's science workshop,
viewed straight from the front with almost no perspective distortion. Warm pale
cream wall #E8E5D7, a soft patch of daylight coming from outside the left edge,
and a few large simple decorative shapes near the upper corners: one small
wooden wall shelf with a potted plant, and a round plain ventilation grille.
The room should feel like a cheerful toy workshop, not a prison or a mystery
horror room.

Keep the central 70 percent of the wall empty and low contrast for the game to
place a computer, physical devices and connecting cables. Keep the rightmost
quarter of the wall clear so the game can draw a door there. Keep the lower
28 percent quiet and slightly darker behind the code-drawn workbench and
controls. Keep the upper 22 percent calm for the title and help control.
Do not draw the workbench, tabletop, floor line, door or any playable object.

Flat 2D cartoon educational background, chunky rounded shapes, friendly
controlled colors, broad flat color areas, one soft painted shadow, subtle
dark navy outline #203149 on the few decorations, minimal detail, polished
children's science-workshop art.

Negative: table, desk, workbench, countertop, chair, door, doorway, door frame,
lock, key, computer, monitor, printer, microphone, camera, speaker, device,
cable, wire, arrow, card, panel, button, text, letters, numbers, words, logo,
watermark, signature, border, grid lines, 3D render, realistic, photorealistic,
hyperdetail, horror, darkness, prison bars, maze, platform, runner, outdoor valley,
weapon, motion blur, lens flare.
```

Conferir a área da porta: deve ser parede contínua, sem quadro, prateleira ou
janela competindo com os três fechos.

---

## 6. `computador-guia.png` - 1024 x 256, grade 4 x 1

Quatro frames de 256 x 256. Gabinete compacto, sem monitor embutido e sem
personagem. As duas conexões ficam à esquerda e à direita em posição constante.

| Frame | Estado | O que muda |
|---|---|---|
| 0 | pronto | luzes discretas apagadas |
| 1 | recebendo | luz perto da porta esquerda acende |
| 2 | processando | três luzes centrais acesas |
| 3 | enviando | luz perto da porta direita acende |

Todas as luzes já existem na geometria do frame 0; apenas o preenchimento
luminoso muda. O corpo nunca infla, gira ou troca de proporção.

Prompt copiável:

```text
Sprite sheet with exactly 4 frames in a strict 4-column by 1-row grid.
Each frame is exactly 256 by 256 pixels; total image exactly 1024 by 256 pixels.
True transparent background, no visible grid lines, no cell backgrounds,
no object crossing between cells.

The exact same compact desktop computer cabinet in all four frames, viewed
straight from the front. Rounded pale blue-gray case #DCE7EC, dark navy outline
#203149, a low broad stable base, small blue #6699BF side details and copper
#C68B58 fasteners. It is a computer case, not a monitor or a robot. There is
NO screen, no face and no large display window. Three small circular physical
indicator lamps sit in one horizontal row on the front.

One round cable socket is visible near the middle of the left edge and another
identical round socket near the middle of the right edge. Keep both socket
centers at exactly the same coordinates in every frame. Approximate normalized
socket positions inside each cell are x=0.16 and x=0.84, y=0.60. No cables.
All frames have identical outline, base position, lamp positions and size.
Object fills about 80 percent of cell width, with transparent margin.

Frames from left to right:
1. READY: both socket indicators and the three front lamps are dim.
2. RECEIVING: the small indicator beside the left socket glows pale ice blue
   #BDE4EF. The other lamps remain dim.
3. PROCESSING: all three existing front lamps glow softly in pale ice blue.
   No gears, moving parts or floating symbols.
4. SENDING: the small indicator beside the right socket glows pale ice blue.
   The other lamps are dim.

Flat 2D cartoon educational game object for children, chunky rounded shapes,
thick dark navy outline, broad flat colors, one soft inner shadow, one small
painted highlight, minimal detail, upper-left lighting, readable silhouette.

Negative: monitor, screen, photograph, display content, face, eyes, mouth,
robot, arms, legs, laptop, keyboard, mouse, text, letters, numbers, binary code,
words, logo, watermark, signature, cable, wire, arrow, floating particles,
green success light, red error light, outer frame, border, grid lines, cropped,
cut off, merged cells, white background, fake transparency, 3D render,
realistic, photorealistic, hyperdetail, motion blur, lens flare.
```

### Depois de medir

Guardar em layout.ts os pontos reais dos soquetes após medir o alfa.
As coordenadas normalizadas do prompt orientam a arte; não substituem a
medição do arquivo entregue.

O pacote que representa “há uma informação guardada” é um pequeno desenho
em Graphics sobre o gabinete. Nunca sobrepor a fotografia ampliada ali.

---

## 7. `aparelhos.png` - 1280 x 512, grade 5 x 2

Dez frames de 256 x 256. As cinco colunas correspondem aos cinco aparelhos.
A primeira linha mostra repouso; a segunda, atividade.

| Coluna | Frame neutro | Frame ativo | Aparelho | Atividade |
|---|---|---|---|---|
| 0 | 0 | 5 | Câmera | obturador e indicador de captura |
| 1 | 1 | 6 | Microfone | pequeno indicador de captação |
| 2 | 2 | 7 | Monitor | iluminação interna discreta, conteúdo ainda vazio |
| 3 | 3 | 8 | Alto-falante | cone deslocado levemente |
| 4 | 4 | 9 | Impressora | roletes visíveis em outra posição |

A silhueta do monitor precisa continuar reconhecível com a tela em branco.
A impressora continua vazia mesmo ativa: a folha é animada pelo código.

### Áreas de sobreposição pedidas

Coordenadas em fração da célula, usadas como orientação artística:

| Área | x | y | largura | altura |
|---|---|---|---|---|
| vidro plano do Monitor | 0,18 | 0,20 | 0,64 | 0,44 |
| fenda de saída da Impressora | 0,25 | 0,55 | 0,50 | 0,08 |

Não escrever esses números na arte. Depois da entrega, medir e guardar as
áreas reais. O interior do monitor é plano e retangular; evitar perspectiva
que exija deformar a imagem.

Prompt copiável:

```text
Sprite sheet with exactly 10 frames in a strict 5-column by 2-row grid.
Each frame is exactly 256 by 256 pixels; total image exactly 1280 by 512 pixels.
True transparent background. One complete centered physical computer device
per frame. No visible grid lines, no cell background and no bleed.

Draw five familiar separate desktop peripherals for a children's educational
game, viewed straight from the front with minimal depth. Use the same material
palette across all devices: pale blue-gray plastic #DCE7EC, dark slate metal
#637B8C, small blue details #6699BF and a few copper accents #C68B58.
Do not use one color family for inputs and another for outputs.
Thick dark navy outline #203149, upper-left lighting, consistent visual weight.
Each object fills about 78 percent of its cell with generous clear margins.

Top row, left to right, neutral states:
1. CAMERA: a simple still-image camera with one large central round lens,
   rounded pale case and one small shutter button on top. No microphone grille,
   speaker, screen, picture, tripod or cable.
2. MICROPHONE: a separate tabletop microphone, dark rounded mesh capsule on a
   short sturdy stand, wide pale base and one tiny unlit indicator. No camera,
   lens, screen or cable.
3. MONITOR: a broad desktop monitor on a short stable stand. Front-facing flat
   rectangular dark glass, completely blank. The inner glass rectangle spans
   approximately x=18 to 82 percent and y=20 to 64 percent of the cell. Keep
   that entire area unobstructed, with no reflection streaks or icons.
4. SPEAKER: one separate desktop loudspeaker with a large round dark cone and
   a small round upper cone, stable rectangular rounded body. No screen,
   microphone, music note, waves or cable.
5. PRINTER: a compact pale printer with a broad front output slot, simple dark
   rollers and short empty output tray. Slot is horizontal and centered,
   approximately x=25 to 75 percent, y=55 to 63 percent. No paper anywhere.

Bottom row, left to right, active states of the EXACT same five devices:
6. CAMERA ACTIVE: same camera as frame 1, identical silhouette and position,
   lens shutter slightly changed and a tiny pale blue capture lamp lit.
7. MICROPHONE ACTIVE: same microphone as frame 2, identical silhouette and
   position, tiny pale blue indicator lit. No external sound waves.
8. MONITOR ACTIVE: same monitor as frame 3, identical frame, stand and inner
   glass coordinates. Glass is very slightly brighter but remains perfectly
   blank, flat and unobstructed.
9. SPEAKER ACTIVE: same speaker as frame 4, identical outer case and position,
   large cone shifted very slightly forward, no waves or music notes.
10. PRINTER ACTIVE: same printer as frame 5, identical case, slot and tray,
    rollers slightly rotated. No sheet, printed content or floating effects.

The five pairs must align perfectly when frames are switched. Only the small
mechanical change or indicator changes. Active does not mean correct: no green
glow, celebration, reward, star or facial expression.

Flat 2D cartoon educational game assets, chunky rounded shapes, bold readable
silhouettes, broad flat color areas, one soft inner shadow, one small painted
highlight outside the monitor glass, minimal detail, friendly workshop style.

Negative: text, letters, numbers, words, brand logo, watermark, signature,
screen image, screen writing, waveform on screen, monitor glare, printed page,
paper, cable, wire, input label, output label, category-colored background,
green correct mark, red X, happy face, sad face, arms, legs, integrated
microphone in camera, monitor with speaker grille, music notes, sound waves,
floating particles, outer frame, border, grid lines, cropped, cut off,
inconsistent paired geometry, merged cells, white background, fake transparency,
3D render, realistic, photorealistic, hyperdetail, motion blur, lens flare.
```

### Os três controles de qualidade mais importantes

1. **Frames 2 e 7:** exatamente a mesma área útil de tela. Trocar o frame não
   pode mover ou redimensionar o desenho renderizado.
2. **Frames 4 e 9:** exatamente a mesma fenda. O papel nasce atrás da frente
   da impressora e passa pela fenda com máscara em Graphics.
3. **Todos os pares:** mesma escala e base. A função de um aparelho não muda
   porque o quadro ativo ganhou uma cor de acerto.

Tela e fenda são medidas antes de acertar o tamanho final na bancada. Não
corrigir o erro da folha arrastando manualmente o conteúdo a cada troca de frame.

---

## 8. `caixinha-de-som.png` - 768 x 256, grade 3 x 1

Produzir depois do teste do nível 1. Uma pequena caixinha de música com
manivela, usada como fonte sonora externa. Ela não se conecta ao computador;
o microfone precisa captar o som que chega pelo ar.

| Frame | Estado | Uso |
|---|---|---|
| 0 | parada | antes de apresentar a fonte |
| 1 | tocando A | manivela em uma posição |
| 2 | tocando B | manivela na posição seguinte |

A caixinha fica imóvel na bancada. Só a manivela muda, e as ondas são Graphics.
Não desenhar nota musical dentro do frame.

Prompt copiável:

```text
Sprite sheet with exactly 3 frames in a strict 3-column by 1-row grid.
Each frame is exactly 256 by 256 pixels; total image exactly 768 by 256 pixels.
True transparent background, no visible grid lines, no cell backgrounds,
no bleed between frames.

The exact same small hand-cranked wooden music box in all three frames.
Front-facing view, rounded warm wooden body #B8875B, pale metal top plate,
small dark ventilation slits and a short copper crank with a blue handle on
the right side. It is an acoustic toy that makes sound in the room, not a
computer peripheral: no plug, socket, electronic display or cable.
Thick dark navy outline #203149, upper-left lighting, one soft inner shadow
and one small painted highlight. Stable feet on the same baseline.
About 75 percent cell fill, including full crank and handle.

Frames left to right:
1. IDLE: crank handle resting downward, box completely still.
2. PLAYING A: same box and exact body position, crank handle rotated forward
   to a horizontal position.
3. PLAYING B: same box and exact body position, crank handle rotated upward.
Only the crank angle changes. Do not move, bounce, enlarge or tilt the body.

Flat 2D cartoon educational game object for children, chunky rounded shapes,
bold readable silhouette, friendly natural colors, minimal detail,
polished children's science-workshop style, readable at small mobile size.

Negative: text, letters, numbers, words, musical notes, clef, logo, watermark,
signature, sound waves, motion lines, electronic speaker cone, microphone,
plug, cable, socket, screen, computer button, face, eyes, arms, legs, hand,
green success glow, red error cue, particles, outer frame, border, grid lines,
cropped crank, cut off, merged cells, white background, fake transparency,
3D render, realistic, photorealistic, hyperdetail, motion blur, lens flare.
```

A câmera pode capturar a imagem dessa caixinha no desafio 3.2. Usar uma
miniatura do frame 0 como fotografia; isso mostra que entrou uma imagem,
enquanto a gravação sonora continua faltando.

---

## 9. `cover-fase-de-entrada-e-saida.png` - 1672 x 941

Capa por último, depois de o usuário testar o nível 1. Mostrar a bancada,
uma experiência e a porta com progresso. Nenhum corredor nem percurso lateral.

O elemento central é o mesmo desenho aparecendo fora do computador e no
monitor após passar pela câmera.

Prompt copiável:

```text
A polished colorful cover illustration for a children's educational
single-workbench escape-room game, exactly 1672 by 941 pixels, landscape,
fully opaque image filling the canvas.

Inside a bright friendly toy science workshop, show one broad wooden workbench
viewed almost straight from the front. On the left of the workbench, a physical
drawing on a small stand shows one simple mountain with a sun. Beside it sits
a separate still-image camera with a large round lens. A short glowing cyan
cable connects the camera to a compact pale blue-gray computer cabinet in the
middle. The cabinet has three tiny indicator lamps and no display screen.

A short warm orange cable connects the cabinet to a separate desktop monitor
on the right. The monitor clearly shows the SAME mountain and sun drawing that
is on the physical stand. Small picture-like light packets along the cables
make the direction of information travel visible from the external drawing
through the camera and computer to the monitor.

A disconnected desktop loudspeaker and a small printer rest neatly near the
front of the workbench as alternative tools. They are equally polished and
neutral, with no wrong-answer marks. At the far right behind the workbench
stands a friendly rounded workshop door with three simple mechanical latches:
one latch is open, the other two are still closed. No numeric labels.

Leave calm pale wall across the top 18 percent for the platform title overlay.
Keep every important object inside generous margins. Clear uncluttered
composition, only one active circuit, no maze, no character and no floating
question cards. It should feel like hands-on discovery at a small toy workshop.

Flat 2D cartoon educational game cover for children, chunky rounded shapes,
thick dark navy outline #203149, pale blue-gray devices #DCE7EC, dark slate
metal #637B8C, blue accents #6699BF, warm wooden bench, broad flat colors,
one soft inner shadow and small painted highlights, polished friendly style.

Negative: title, text, letters, numbers, words, logo, watermark, signature,
green checkmark, red X, quiz panel, multiple rooms, platformer, runner,
outdoor valley, inventory grid, giant maze, trapped frightened child, prison,
horror, dark escape room, weapons, computer cabinet displaying the mountain,
camera with microphone, printer producing a key, speaker creating a bridge,
3D render, realistic, photorealistic, hyperdetail, border, grid lines,
cropped objects, motion blur, lens flare.
```

A capa é uma ilustração completa: nela, bancada, cabos e porta podem aparecer
pintados juntos. Essa exceção vale só para o catálogo; o fundo jogável continua
limpo e os componentes continuam separados.

---

## 10. O que continua em `Graphics`

| Elemento | Como produzir | Por quê |
|---|---|---|
| bancada | tampo e frente arredondados | área e profundidade acompanham o layout |
| porta | moldura simples, folha móvel e três fechos | abertura e progresso mudam |
| suporte externo | base e folha neutra | recebe qualquer desenho-fonte |
| montanha, flor, barco | painters simples reutilizáveis | preservar exatamente a mesma informação |
| cabos | curvas entre pontos medidos | aparelhos trocam, direção anima |
| portas e presilhas | pontos de conexão e marca de fixo | estado interativo |
| ondas | arcos e barras com timeline | sincronizar fonte e reprodução |
| pacote interno | miniatura simbólica sem revelar o conteúdo todo | computador guarda informação |
| papel impresso | retângulo e sombra com máscara | precisa sair pela fenda |
| vidro/conteúdo | imagem ou onda recortada sobre a área medida | resultado depende do payload |
| bandeja e cartões | fundos, hitboxes, nomes e EM USO | alternativa muda de posição e estado |
| USAR e REPETIR | botão desenhado e texto | normal, pressionado e desabilitado |
| pedido e dica | balão/texto na faixa reservada | muda a cada tarefa |
| trava | cadeado e contorno | bloqueio temporário, fora do PNG |
| ajuda, vidas e estrelas | componentes compartilhados | padrão do catálogo |

### O mesmo desenho nos quatro lugares

Não gerar uma montanha para o suporte e outra montanha para o monitor.
drawPicture(source.visualId) produz uma composição idêntica em quatro escalas:
fonte externa, resultado em tela, resultado no papel e registro do circuito.

Montanha: dois picos e um sol. Flor: cinco pétalas, miolo, haste e duas folhas.
Barco: casco, mastro e uma vela. Sem letras, senha, números ou contagem como
desafio adicional.

### Fluxo em modo mudo

As ondas visuais da caixinha e do alto-falante compartilham o mesmo padrão
de expansão. O destaque da fonte apaga antes da reprodução começar.
A imagem comunica onde o som está sendo captado ou reproduzido, sem exigir
áudio para decidir.

---

## 11. Entrega

| Item | Especificação |
|---|---|
| Formato | PNG-24 |
| Alfa | real nas três folhas de objetos |
| Opacos | fundo e capa |
| Células | 256 x 256 em todas as folhas |
| Quadros | gabinete 4; aparelhos 10; caixinha 3 |
| Ordem | esquerda para direita, depois linha seguinte |
| Recorte | sem sangria, corte de extremidade ou linha de grade |
| Margem | pelo menos 9%; respeitar preenchimento pedido |
| Luz | alto à esquerda |
| Peso alvo | até 800 KB por folha; até 1,5 MB no fundo e capa |
| Sem | texto, número, logo, marca, borda externa ou gabarito visual |

Se a geração entregar fundo branco, refazer com canal alfa. Como alternativa,
gerar sobre magenta `#FF00FF` e remover a cor. Conferir o resultado sobre
fundo claro e escuro antes de aceitar.

A grade é um contrato: 5 x 2 continua sendo 5 x 2 mesmo que o gerador entregue
uma escala maior. Registrar as dimensões reais antes de configurar o
carregador; não supor que o arquivo recebido mede o que o prompt pediu.

Não deformar a folha para corrigir células inconsistentes. Se um monitor
mudou de proporção entre neutro e ativo, corrigir a folha.

---

## 12. Antes da arte existir

O jogo precisa funcionar com zero texturas.

| Objeto ausente | Placeholder no tamanho final |
|---|---|
| fundo | parede creme e duas formas decorativas |
| gabinete | caixa arredondada, três LEDs e dois soquetes |
| câmera | corpo, lente e botão de captura |
| microfone | cápsula, haste e base |
| monitor | moldura, área escura e pé |
| alto-falante | caixa com dois cones |
| impressora | caixa e fenda com máscara para papel |
| caixinha | caixa de madeira com manivela |
| capa | não carregar no jogo; cadastrar quando disponível |

Cada aparelho continua com seu nome em Phaser.Text. Nada de emoji como
substituto gráfico. A ausência de PNG não altera função, posição, alvo ou
tempo da experiência.

O efeito de fluxo e os três resultados já devem estar completos nessa etapa.
A integração da arte troca a aparência, não a mecânica.

---

## 13. Como as texturas entram

```ts
const ART = import.meta.glob(
    '../../../../assets/games/EF03CO06/fase-de-entrada-e-saida/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>
```

BootScene ignora cover-, registra o que existir e mantém fallback para o que
faltar. Nenhum import estático aponta para PNG ainda não entregue.

| Chave local | Arquivo | Frame |
|---|---|---|
| bench-background | bg-bancada.png | imagem |
| bench-computer | computador-guia.png | 256 x 256 |
| bench-devices | aparelhos.png | 256 x 256 |
| bench-sound-source | caixinha-de-som.png | 256 x 256 |

O registro de dimensões e frames fica centralizado. Nenhuma cena inventa uma
nova ordem de quadros.

### Medição após receber

1. conferir dimensões totais e grade;
2. calcular caixa alfa de cada frame;
3. comparar pares neutro/ativo;
4. medir os dois soquetes do gabinete;
5. medir área útil do Monitor nos frames 2 e 7;
6. medir fenda da Impressora nos frames 4 e 9;
7. guardar medidas normalizadas em layout.ts;
8. desenhar o mesmo conteúdo nos dois estados sem deslocamento;
9. conferir escala de celular antes de reduzir fontes ou alvos.

### Pivôs e camadas

- aparelho: base real, centralizada na área de encaixe;
- gabinete: centro inferior pela base;
- caixinha: centro inferior, base imóvel entre frames;
- fundo: centralizado e ajustado para cobrir 1280 x 720, sem rolagem;
- cabos atrás dos aparelhos, pulsos sobre os cabos;
- conteúdo do Monitor sobre o vidro, dentro da máscara;
- papel sobe atrás da frente da Impressora e aparece pela fenda;
- ajuda por cima de tudo, preservando ? e controle de fechar.

O registro de final usa miniaturas das mesmas instâncias visuais reconstruídas
dos dados, sem captura de tela nem imagem gerada adicional.

---

## 14. Ordem de produção

Primeira rodada, nível 1:

1. `aparelhos.png` — os dez frames juntos;
2. `computador-guia.png` — quatro estados com soquetes fixos;
3. `bg-bancada.png` — parede limpa;
4. integrar os três desafios do nível 1 e entregar ao usuário.

Depois do teste:

5. ajustar geometria, máscaras e escala conforme a avaliação;
6. `caixinha-de-som.png` — três estados, para níveis 2 e 3;
7. integrar os seis desafios restantes com os mesmos aparelhos;
8. `cover-fase-de-entrada-e-saida.png` por último.

O nível 1 não depende da fonte sonora definitiva. O Alto-falante já aparece
como alternativa física, mas os desafios sonoros ficam para depois.
Os cinco aparelhos da folha são reutilizados; não criar folhas “nível 2” e
“nível 3” para repetir os mesmos objetos.

---

## 15. Checklist de conferência

### Lista e identidade

- [ ] exatamente cinco arquivos previstos;
- [ ] nenhum corredor, vale, motor, sensor ou folha ampliada nova;
- [ ] fundo limpo, sem bancada nem porta embutida;
- [ ] gabinete sem monitor de conteúdo;
- [ ] aparelhos com as mesmas cores materiais, sem separar entrada e saída;
- [ ] dispositivo ativo não recebe marca de acerto.

### Folhas

- [ ] gabinete 4 x 1, aparelhos 5 x 2, caixinha 3 x 1;
- [ ] frames batem com os índices da tabela;
- [ ] todos os objetos têm alfa real e margem;
- [ ] nenhum texto, letra, número ou linha de grade;
- [ ] mesma base e silhueta nos pares;
- [ ] soquetes do gabinete não se movem;
- [ ] Monitor livre e retangular nos frames 2 e 7;
- [ ] fenda da Impressora livre nos frames 4 e 9;
- [ ] caixinha muda só a manivela.

### Integração

- [ ] nome e hitbox pertencem ao código;
- [ ] foto do suporte é a mesma do Monitor e do papel;
- [ ] papel sai pela fenda sem cortar o desenho;
- [ ] ondas são código e respeitam pausa/mudo;
- [ ] arte ausente não quebra experiência nem confirmação;
- [ ] modo mudo mantém a relação fonte → captura → reprodução;
- [ ] nenhum periférico real é acessado;
- [ ] capa retrata somente a bancada aprovada;
- [ ] teste do nível 1 precede a expansão.

---

## 16. Registro da revisão

Oito arquivos da proposta de plataforma deram lugar a cinco na bancada.
O corredor e as folhas ampliadas saíram do planejamento; o gabinete perdeu
a tela que poderia competir com o Monitor externo. A folha aparelhos reúne
os cinco dispositivos em estados neutros e ativos, e uma caixinha serve
como única fonte sonora.

Esta revisão altera especificações e prompts. Ainda não há assets gerados
nem medições reais a registrar. Quando chegarem, acrescentar a medida recebida,
a grade conferida e qualquer adaptação feita no carregador.
