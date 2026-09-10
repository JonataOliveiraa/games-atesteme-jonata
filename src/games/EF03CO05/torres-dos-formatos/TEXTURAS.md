# Torres dos Formatos - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF03CO05/torres-dos-formatos/`

---

## 0. A lista

Cinco arquivos: um fundo, três folhas de sprites e a capa. **Todos estão a
gerar**; as medidas abaixo são as solicitadas, ainda sem arquivos entregues
para medir.

| # | Arquivo | Tamanho | Grade | Para quê | Quando | Prompt |
|---|---|---|---|---|---|---|
| 1 | `bg-jardim-tecnologico.png` | 1672 x 941 | — | jardim atrás da trilha | **primeiro** | §5 |
| 2 | `formatos.png` | 800 x 800 | 2 x 2 de 400 | os quatro ícones de caixa | **primeiro** | §6 |
| 3 | `arquivo-criatura.png` | 1200 x 1200 | 4 x 4 de 300 | quatro formatos x quatro poses | **primeiro** | §7 |
| 4 | `conteudos.png` | 1024 x 768 | 4 x 3 de 256 | doze pictogramas de conteúdo | **primeiro** | §8 |
| 5 | `cover-torres-dos-formatos.png` | 1672 x 941 | — | capa do catálogo | por último | §9 |

Na primeira rodada, gerar os quatro arquivos marcados como **primeiro**.
As folhas são produzidas inteiras para manter o mesmo traço. No nível 1, o
código usa somente Data e Imagem nas torres e os frames 0–7 de conteúdo;
os demais quadros ficam disponíveis para a expansão após o teste.

**Nada de trilha, encaixe, bandeja, cartão, rótulo, botão, cadeado, raio,
seta, estrela, balão ou painel nos PNGs.** Esses elementos são Graphics e
texto Phaser. As próprias estruturas de dados também são desenhadas pelo
código a partir do conteúdo da onda.

---

## 1. A regra que não pode ser quebrada

> **O pictograma mostra o assunto; a estrutura dos dados decide o leitor.**

O mesmo livro pode aparecer como imagem, texto ou história gravada. O número
do frame de conteúdo nunca determina qual torre captura o arquivo. Nos casos
disfarçados, é a janela desenhada pelo código — campos, pixels, sequência ou
amostras — que revela a estrutura.

A criatura tem sempre o mesmo corpo neutro, sem cor ou símbolo de formato.
Nenhuma imagem disfarçada fica escura, suspeita ou menos bem desenhada que as
demais. A arte não marca uma resposta como certa ou errada.

As torres precisam ser reconhecíveis também pela forma do mecanismo:

- Data: três lentes alinhadas;
- Imagem: visor quadriculado;
- Texto: scanner horizontal;
- Áudio: agulha e arco de leitura.

A cor ajuda a localizar uma torre conhecida, mas não substitui sua silhueta.
Conferir as quatro em escala de cinza antes de aceitar a folha.

---

## 2. Estilo comum

```text
Flat 2D cartoon educational game asset for children, chunky rounded shapes,
bold readable silhouette, thick dark navy outline #21324A, cheerful controlled
colors, broad flat color areas, one soft inner shadow, one small white gloss
highlight, minimal detail, friendly polished storybook game art, readable at
small mobile size, no text.
```

Jardim tecnológico acolhedor: madeira pintada, cobre fosco, pedra clara e vidro
colorido. As torres são instrumentos de leitura com formas arredondadas.

## 3. Negativo comum

```text
3D render, realistic, photorealistic, hyperdetailed, tiny details, weapon, cannon,
turret, projectile, battle, enemy, scary, dark mood, brand logo, text, letters,
numbers, words, watermark, signature, outer frame, border, visible grid lines,
colored card background, cropped, cut off, merged cells, white background,
fake transparency, motion blur, lens flare.
```

Os blocos de estilo e negativo abaixo servem como referência comum. Cada prompt
por arquivo já inclui suas instruções completas: pode ser copiado sozinho, sem
substituir marcadores ou buscar trechos em outra seção.

Nas tabelas, os frames começam em **0**, como no Phaser. Nos prompts, a lista
começa em **1**; a ordem é a mesma: esquerda para direita, de cima para baixo.

---

## 4. Paleta

| Papel | Cor |
|---|---|
| contorno | azul-marinho `#21324A` |
| jardim | verde `#86C96F` e verde-claro `#CBE8A8` |
| pedra da trilha | creme `#D9C8A5` |
| Data | âmbar `#F2B84B` |
| Imagem | ciano `#3DBBD3` |
| Texto | violeta `#8B6FD6` |
| Áudio | coral `#EE7B6A` |
| seleção | azul `#55B8FF` |
| trava | âmbar escuro `#C9822B`, nunca vermelho |

Seleção e trava pertencem ao código. Os pictogramas conservam cores naturais,
mesmo quando o conteúdo parece sugerir outro formato.

---

## 5. `bg-jardim-tecnologico.png` - 1672 x 941

Fundo opaco 16:9. Ele fornece atmosfera, mas não desenha nada cuja posição
precise coincidir com a lógica.

### Composição

- gramado baixo e luminoso;
- árvores arredondadas apenas nas bordas;
- oficina-estante discreta no canto superior direito;
- canteiros e cristais tecnológicos pequenos ao fundo;
- centro e terço inferior calmos para receber trilha e bandeja;
- parte superior com contraste baixo para o header;
- nenhuma curva que pareça ser o caminho jogável.

Prompt copiável:

```text
A polished 2D background for a children's educational strategy game, exactly 1672 by
941 pixels, 16:9 landscape, fully opaque image filling the whole canvas.

Show a welcoming technological garden in daylight, viewed from a gentle elevated
three-quarter angle. Soft rolling green lawn, rounded shrubs, a few broad friendly
trees kept near the far left and far right edges, small copper pipes carrying glowing
blue energy between flower beds, and a tiny open wooden sorting workshop in the upper
right background. The workshop has four empty rounded shelf cubbies with no symbols
and no objects inside.

Keep the central 70 percent of the image visually calm and mostly flat grass so the
game can draw its own curved path, towers and moving characters. Keep the lower 24
percent calm and slightly darker for a code-drawn control tray. Keep the upper 10
percent low contrast for a game header. Place decorative details only around the
outer edges and far background. No important object near any crop edge.

Flat 2D cartoon children's game art, chunky rounded shapes, thick dark navy outlines
#21324A, cheerful but controlled colors, broad color areas, one soft inner shadow,
small painted highlights, polished storybook quality, clear depth layers, no text.

Negative: road, path, trail, track, tower, turret, cannon, weapon, projectile, enemy,
monster, battle, castle, gate, file character, card, user interface, button, panel,
text, letters, numbers, words, logo, watermark, signature, 3D render, realistic,
photorealistic, isometric voxel art, hyperdetail, dark night, scary mood, red warning,
neon cyberpunk, visible frame, border, motion blur, lens flare.
```

O fundo **não pode ter trilha**. A curva real é Graphics e muda apenas se o
layout for ajustado durante o teste.

---

## 6. `formatos.png` - 800 x 800, grade 2 x 2

Oito quadros de 256 x 256. Linha superior: neutras. Linha inferior: as mesmas
torres lendo. Todas vistas no mesmo ângulo, apoiadas na mesma linha invisível e
com volume visual equivalente.

| Frame | Estado | Leitor |
|---:|---|---|
| 0 | nota musical | **som** |
| 1 | Aa | **texto** |
| 2 | foto | **imagem** |
| 3 | filme | **vídeo** |

Prompt copiável:

```text
Sprite sheet with exactly 8 frames in a strict 4-column by 2-row grid, every frame
exactly 256 by 256 pixels, total image exactly 1024 by 512 pixels, true transparent
background. One complete centered reader tower in every frame, no visible grid lines,
no cell backgrounds and no bleed between cells.

All eight objects are friendly non-combat reading machines for a children's
educational game. They share the same rounded pale stone base, dark navy outline
#21324A, simple copper joints and equivalent height and visual weight. Three-quarter
front view, light from upper left, same invisible ground baseline, about 80 percent
cell fill.

Top row, neutral states, left to right:
1. DATE READER: warm amber machine with exactly three round glass lenses arranged
   horizontally in a row, joined by one copper rail. No calendar page and no marks.
2. IMAGE READER: cyan machine with one large square glass viewing window divided only
   by raised empty frame bars into a four by three grid. No colored cells or picture.
3. TEXT READER: violet machine with one wide horizontal scanner slot and three small
   blank paper rollers underneath. No page, lines, letters or symbols.
4. AUDIO READER: coral machine with a curved arch and one central movable needle above
   a blank horizontal glass strip. No musical note and no waveform drawn.

Bottom row: exact same four machines in the exact same order, position, size and base.
They are active reading states:
5. DATE READER active: its three lenses glow softly from left to right, copper rail
   energized; preserve all geometry from frame 1.
6. IMAGE READER active: a broad soft cyan scanning gleam crosses the empty grid
   window; preserve all geometry from frame 2.
7. TEXT READER active: the scanner slot glows and the three rollers turn slightly;
   preserve all geometry from frame 3.
8. AUDIO READER active: the needle leans slightly to the right and the glass strip
   glows; preserve all geometry from frame 4.

Flat 2D cartoon educational game assets, chunky rounded silhouettes, thick dark navy
outline, cheerful controlled palette, flat colors with one soft inner shadow and one
small white gloss highlight, minimal mechanical detail, instantly readable at mobile
size. These are readers and laboratory instruments, never weapons.

Negative: 3D render, realistic, photorealistic, tower defense gun, turret, cannon,
weapon, barrel, arrow, missile, laser weapon, projectile, spikes, enemy, angry face,
castle tower, medieval tower, magic staff, calendar icon, picture icon, letter,
number, musical note, waveform, text, words, logo, watermark, signature, different
camera angles, different ground baselines, inconsistent scale, cropped base, cut off,
outer frame, border, visible grid lines, merged cells, colored card background, white
background, fake transparency, motion blur, lens flare.
```

### Conferência

- os frames 4–7 devem parecer estados dos frames 0–3, não novas máquinas;
- nenhuma lente pode conter número;
- a janela de Imagem pode ter divisórias, mas permanece vazia;
- Texto não pode trazer linhas que pareçam escrita;
- Áudio não pode usar nota musical como atalho.

---

## 7. `arquivo-criatura.png` - 1200 x 1200, grade 4 x 4

Um arquivo neutro em quatro poses. A janela de estrutura e o pictograma são
sobrepostos pelo código. O corpo não revela o formato.

| Frame | Pose |
|---:|---|
| linha 0 | 0-3 | **som**, roxo, alto-falante |
| linha 1 | 4-7 | **imagem**, verde, paisagem |
| linha 2 | 8-11 | **texto**, azul, linhas |
| linha 3 | 12-15 | **vídeo**, vermelho, play |
| poses, em cada linha | passo A, passo B, contente, sem caber |

Prompt copiável:

```text
Sprite sheet with exactly 4 frames in one strict horizontal row, every frame exactly
256 by 256 pixels, total image exactly 1024 by 256 pixels, true transparent background.
One complete centered friendly file creature per frame, no visible grid lines, no
cell background and no bleed.

The character is a neutral rounded cream paper pouch with a thick dark navy outline
#21324A, two tiny dark oval eyes near the upper corners, short rounded arms and short
rounded feet. Its entire central 64 percent is a large perfectly blank pale panel
reserved for code-drawn data structure and content. No folded page corner, no symbol,
no lines and no format clue. Same character, proportions, colors and lighting in all
four frames, three-quarter front view, same invisible ground baseline, about 78
percent cell fill.

Frames left to right:
1. WALK A: left foot forward, right arm forward, friendly curious expression, central
   panel completely blank.
2. WALK B: right foot forward, left arm forward, same head and body height, central
   panel completely blank.
3. READ: both feet together, arms gently lifted, happy open smile, one small sparkle
   beside the body but not over the blank central panel.
4. LOCKED: feet planted, hands touching the cheeks, concerned but calm expression,
   body tilted by only a few degrees, central panel completely blank. No padlock,
   warning symbol or tears; the code adds the lock.

Flat 2D cartoon educational game character, chunky rounded shape, thick dark navy
outline, flat cream color with one soft inner shadow and small white gloss highlight,
minimal detail, friendly for eight-year-old children, readable at small size.

Negative: text, letter, number, word, writing, paper lines, file extension, folded
corner, image icon, calendar icon, music note, waveform, pixel grid, folder, format
badge, logo, watermark, signature, sad crying face, angry face, evil, weapon, damage,
torn paper, red X, green check, padlock, colored card background, outer frame, border,
visible grid lines, merged cells, cropped feet, inconsistent scale, different ground
baselines, white background, fake transparency, 3D render, realistic, photorealistic,
motion blur, lens flare.
```

O painel central precisa estar realmente vazio. Se o gerador insistir numa
folha com linhas ou dobra, refazer: qualquer marca pode virar uma pista falsa
de Texto.

---

## 8. `conteudos.png` - 1024 x 768, grade 4 x 3

Doze pictogramas que representam **o assunto armazenado**, não o formato. O
código coloca cada um dentro de uma janela Data, Imagem, Texto ou Áudio.

| Frame | Conteúdo | Uso principal |
|---:|---|---|
| 0 | festa | compromisso/Data |
| 1 | passeio escolar | compromisso/Data |
| 2 | consulta | compromisso/Data |
| 3 | treino | compromisso/Data |
| 4 | paisagem | Imagem evidente |
| 5 | flor | Imagem evidente |
| 6 | escola | Imagem evidente |
| 7 | bola | Imagem evidente |
| 8 | página de livro | Imagem disfarçada ou Texto |
| 9 | conversa em tela | Imagem disfarçada |
| 10 | criança lendo em voz alta | Áudio disfarçado |
| 11 | música escrita/desenhada | Texto disfarçado ou Áudio |

Prompt copiável:

```text
Sprite sheet with exactly 12 frames in a strict 4-column by 3-row grid, every frame
exactly 256 by 256 pixels, total image exactly 1024 by 768 pixels, true transparent
background. One large centered content pictogram per frame, no card, no file body, no
format frame, no visible grid lines and no bleed between cells. Equal visual weight,
about 72 percent cell fill, with transparent margin.

Frames, left to right then top to bottom:
1. A festive party table with one plain cake, two balloons and confetti, no candle
   number and no banner.
2. A yellow school bus beside one rounded green tree and a small backpack, destination
   panel blank.
3. A friendly clinic scene represented by a plain stethoscope beside a small blue
   appointment chair, no cross, label or medicine brand.
4. A children's sports practice represented by one ball, two soft cones and a whistle,
   no team logo.
5. A bright mountain landscape with sun, two hills and a small lake.
6. One large cheerful flower with five petals and two leaves.
7. A friendly school building with broad door and three windows, no sign, flag text or
   letters.
8. One striped playground ball with a tiny curved motion accent.
9. An open children's picture book seen from the front; both pages contain only broad
   gray decorative blocks and simple tiny illustration shapes, absolutely no readable
   writing, letters or numbers.
10. A small tablet or phone screen containing three rounded blank chat bubbles with no
    tails pointing outside the device and absolutely no writing.
11. A cheerful child in side view reading aloud from an open blank book toward a small
    tabletop microphone; two soft curved breath marks, no written page.
12. A sheet of blank music-like horizontal staff lines beside a small singing bird,
    but with no notes, clef, letters or symbols; the concept is a written song without
    any readable notation.

Flat 2D cartoon educational pictograms for children, chunky rounded shapes, bold
readable silhouettes, thick dark navy outline #21324A, natural varied colors, flat
color areas with one soft inner shadow and one small white gloss highlight, minimal
detail, consistent lighting and scale. All frames receive the same polish; disguised
items must not look suspicious or darker.

Negative: readable text, letters, alphabet, numbers, digits, words, handwriting,
caption, label, logo, watermark, signature, file extension, format badge, pixel grid,
waveform, calendar fields, data cells, green checkmark, red X, red warning, suspicious
glow, evil object, 3D render, realistic, photorealistic, hyperdetail, tiny illegible
marks, colored card background, outer frame, border, visible grid lines, merged cells,
cropped, cut off, white background, fake transparency, motion blur, lens flare.
```

### Uso sem transformar pictograma em resposta

Nos níveis 1 e 2, o conteúdo apoia a leitura. No nível 3, o mesmo frame pode
aparecer em estruturas diferentes:

- frame 8 dentro de pixels: uma **imagem de página**;
- frame 8 dentro de tokens: um **texto de história**;
- frame 10 dentro de amostras: uma **história gravada**;
- frame 11 dentro de tokens: um **texto sobre música**;
- frame 11 dentro de amostras: uma **música gravada**.

O payload em data/levels.ts, e não o número do frame, define o leitor. Essa
independência é obrigatória.

---

## 9. `cover-torres-dos-formatos.png` - 1672 x 941

Capa opaca, gerada por último. Deve mostrar a mecânica: estruturas chegando,
leitores diferentes e conteúdo sendo recuperado.

Prompt copiável:

```text
A polished colorful cover illustration for a children's educational strategy game,
exactly 1672 by 941 pixels, 16:9 landscape, fully opaque image filling the canvas.

In a welcoming technological garden, show a curved pale stone path traveling from the
lower left toward a friendly rounded gate on the right. Three cheerful cream-colored
file creatures walk along the path. Each creature has a large visible central panel:
one panel contains three blank ordered cells, one contains a colorful four-by-three
pixel mosaic, and one contains a simple abstract waveform made only of bars. Do not
put any letters or numbers in the cells.

Beside the path stand three friendly non-combat reader machines. The first has three
amber glass lenses aligned horizontally, the second has a cyan square grid viewer,
and the third has a coral arch and moving needle. Soft short reading beams connect
each machine to the matching structural panel. From the pixel creature, a small
mountain picture emerges as a glowing recovered information card and travels toward
an open sorting shelf in the upper right.

Make the action readable from left to right: structured files approach, specialized
readers inspect them, recovered information reaches the shelf. Leave calm sky and
foliage across the upper 18 percent for the platform title overlay. Keep all important
objects away from the extreme edges. The garden is joyful and strategic, never a
battlefield.

Flat 2D cartoon children's educational game cover, chunky rounded shapes, thick dark
navy outlines #21324A, cheerful controlled palette, broad flat color areas, one soft
inner shadow, small gloss highlights, polished storybook game art, dynamic but
uncluttered composition.

Negative: title, text, letters, numbers, words, logo, watermark, signature, 3D render,
realistic, photorealistic, hyperdetail, tower defense gun, turret, cannon, weapon,
projectile, explosion, enemy, monster, battle, castle siege, scary gate, angry face,
red warning, green checkmark, red X, user interface, button, panel, frame, border,
cropped object, motion blur, lens flare.
```

Não colocar o título na imagem. A plataforma escreve “Torres dos Formatos”.

---

## 10. O que continua em `Graphics`

| Elemento | Implementação |
|---|---|
| DIA, MÊS e ANO | Phaser.Text |
| valores das datas | Phaser.Text |
| pontos da imagem | Graphics, derivados do payload |
| fragmentos de texto | Phaser.Text |
| barras de áudio | Graphics, derivadas das amostras |
| VEM AÍ, COMEÇAR e frases | Phaser.Text |
| trilha e alcance | Graphics |
| bandeja e encaixes | Graphics |
| raios e varreduras | Graphics |
| portão, cadeado e gavetas | Graphics |
| progresso, vidas e ? | componentes compartilhados e Graphics |

Data, pixels, tokens e amostras são o conteúdo pedagógico. Se forem congelados
no PNG, a arte vira gabarito, dificulta variação e perde nitidez no celular.

---

## 11. Entrega

| Item | Especificação |
|---|---|
| Formato | PNG-24 |
| Transparência | alfa real em torres-leitoras, arquivo-criatura e conteudos |
| Imagens opacas | fundo e capa |
| Células | 256 x 256 em todas as folhas |
| Recorte | grade exata, sem sangria entre quadros |
| Margem | pelo menos 10%; manter o preenchimento pedido em cada prompt |
| Luz | alto à esquerda, igual em toda a folha |
| Contorno | consistente, aproximadamente 8–12 px na arte original |
| Peso alvo | até 800 KB por folha; até 1,5 MB no fundo e na capa |
| Sem | texto, letra, número, logo, moldura externa ou linha da grade |

Estados do mesmo objeto mantêm base, escala e posição. Nenhuma sombra pode
ser cortada pela célula. Conferir o recorte sobre fundo claro e escuro.

Se o arquivo vier com fundo branco, refazer com alfa real; como alternativa,
pedir sobre magenta `#FF00FF` e remover a cor. Não aceitar transparência
falsa nem halo claro nas bordas.

---

## 12. Antes da arte existir

A implementação começa sem bloquear na arte.

| Ausência | Reserva |
|---|---|
| fundo | gradiente verde, silhuetas de árvores e pontos de luz |
| torres | base arredondada e mecanismo geométrico específico |
| criatura | papel creme com olhos, braços e painel vazio |
| conteúdo | pictogramas simples sem emoji: bolo, ônibus, flor, livro e microfone |

A reserva precisa conservar as mesmas caixas, pivôs e hitboxes da textura
final. Quando o PNG chegar, trocar a camada visual sem alterar regra, posição
ou interação.

Não usar emoji como arte provisória: o desenho varia por sistema, pode carregar
cor semântica indevida e não reproduz a composição final.

---

## 13. Como as texturas entram

As imagens entram por import.meta.glob, nunca por caminho estático:

```ts
const ART = import.meta.glob(
    '../../../../assets/games/EF03CO05/torres-dos-formatos/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>
```

BootScene:

- ignora todo arquivo cujo nome começa com cover-;
- carrega somente arquivos usados pelo nível disponível;
- registra torres-leitoras como 4 x 2;
- registra arquivo-criatura como 4 x 1;
- registra conteudos como 4 x 3;
- consulta textures.exists antes de usar qualquer chave;
- mantém createLoadingScreen até o nível estar pronto.

Ancoragem:

- torre: centro inferior na base visível;
- arquivo: centro inferior na linha comum dos pés;
- pictograma: centro do painel estrutural, sem receber input;
- fundo: cover, recortado pelo FIT da cena.

Medir a caixa alfa real de cada frame. Não ancorar supondo que o desenho ocupa
a célula inteira.

---

## 14. Ordem de produção

Primeira rodada, nível 1:

1. `torres-leitoras.png` — gerar a folha inteira; integrar frames 0, 1, 4 e 5;
2. `arquivo-criatura.png` — gerar e integrar as quatro poses;
3. `conteudos.png` — gerar a folha inteira; integrar frames 0–7;
4. `bg-jardim-tecnologico.png` — acrescentar o cenário;
5. entregar o nível 1 ao usuário para testar toque e legibilidade.

Depois da aprovação:

6. integrar os frames 2, 3, 6 e 7 das torres e 8–11 de conteúdo;
7. implementar e testar níveis 2 e 3;
8. gerar `cover-torres-dos-formatos.png`.

A folha inteira preserva consistência; o corte de um nível continua valendo
para a implementação. Se o teste mudar a identidade visual, atualizar os
prompts e regenerar as folhas afetadas antes da expansão.

---

## 15. Checklist de conferência

- [ ] existem exatamente cinco arquivos planejados;
- [ ] todas as dimensões e grades conferem;
- [ ] nenhum PNG contém texto, letra ou número;
- [ ] as torres parecem leitoras, não armas;
- [ ] as quatro torres são distinguíveis sem cor;
- [ ] estados ativo e neutro mantêm a mesma geometria;
- [ ] o corpo do arquivo não revela formato;
- [ ] o painel central da criatura está vazio;
- [ ] pictogramas mostram conteúdo, não formato;
- [ ] disfarces têm a mesma qualidade e brilho dos casos evidentes;
- [ ] folhas têm alfa verdadeiro e nenhuma sangria;
- [ ] fundo não contém trilha nem interface;
- [ ] capa mostra estrutura → leitor → informação recuperada;
- [ ] capa não contém título;
- [ ] reservas funcionam antes das texturas finais;
- [ ] nível 1 é testado antes de produzir a expansão.

---

## Estado em 10/09/2026

A mecânica virou queda em pistas, e a arte acompanhou:

- `torres-leitoras.png` **saiu** — não há mais torres;
- `arquivo-criatura.png` **foi refeito** em 1200 x 1200, grade 4 x 4: uma
  linha por formato e quatro poses em cada uma. A criatura já veste o ícone do
  formato dela, o que torna o nível 1 guiado de propósito;
- `formatos.png` **entrou**, 800 x 800, 2 x 2: som, texto, imagem e vídeo, na
  ordem que `FORMAT[...].icon` endereça. O PNG tem **fundo branco opaco**, e o
  jogo desenha um disco claro atrás dele para esse fundo virar parte da caixa;
- `bg-jardim-tecnologico.png` e `conteudos.png` continuam valendo como estão.

Falta a capa, que sai por último, retratando a mecânica aprovada.

---

## Rodada 3 — o galpão do nível 2 e a linha ninja

### `bg-galpao-triagem.png` — 1672 x 941, fundo do NÍVEL 2

Mesmo enquadramento do jardim: 16:9 opaco, centro calmo, topo 10% de baixo
contraste para o header e base 24% calma para os botões. O jogo desenha as
pistas, as caixas e as setas por cima; **o fundo não desenha nenhuma delas**.

Prompt copiável:

```text
A polished 2D background for a children's educational sorting game, exactly 1672 by
941 pixels, 16:9 landscape, fully opaque image filling the whole canvas.

Show the inside of a warm, tidy sorting warehouse for a friendly data workshop, seen
from a gentle straight-on angle. Wooden plank floor across the lower third, pale mint
and cream walls, tall wooden shelving units with empty rounded cubbies pushed to the
far left and far right edges, a few stacked wooden crates and rolled paper tubes in
the far corners, copper pipes carrying soft glowing blue light along the upper wall,
and two round windows high up letting warm daylight in.

Keep the central 70 percent of the image visually calm and mostly empty wall and
floor, because the game draws its own falling characters, lanes and boxes there. Keep
the lower 24 percent as plain wooden floor with very little detail. Keep the upper 10
percent low contrast for a game header. Put every decorative object near the outer
edges. No important object near any crop edge.

Flat 2D cartoon children's game art, chunky rounded shapes, thick dark navy outlines
#21324A, cheerful but controlled colors, broad flat color areas, one soft inner shadow,
small painted highlights, polished storybook quality, clear depth layers, no text.

Negative: conveyor belt, lane, track, arrow, chute, slide, tower, robot, machine arm,
file character, card, box in the center, user interface, button, panel, text, letters,
numbers, words, logo, watermark, signature, 3D render, realistic, photorealistic,
isometric voxel, hyperdetail, dark mood, night, red warning light, neon cyberpunk,
clutter in the center, visible frame, border, motion blur, lens flare.
```

**Chegou em 10/09/2026** e os níveis 2 e 3 já rodam nele. Sem o arquivo, a cena
cai no jardim: `data/levels.ts` diz qual textura cada nível usa.

### A quinta linha de `arquivo-criatura.png` — o ninja

A folha passou a 1200 x 1500, grade 4 x 5. A linha 4 (quadros 16 a 19) é o
**arquivo disfarçado**: preto, com faixa e máscara, e o painel do corpo vazio —
quem preenche esse painel é o código, com `? ? ?` antes da revelação e com a
estrutura sorteada depois dela. As quatro poses seguem a ordem das outras
linhas: passo A, passo B, contente, sem caber.

O código não depende dela para rodar: se a linha não existir, o ninja entra
tingido de cinza-azulado até se revelar.

### `arquivo-criatura-2.png` — a segunda pele, 1200 x 1200, grade 4 x 4

As mesmas quatro linhas na mesma ordem — som, imagem, texto, vídeo — com outros
bichos: **megafone**, **moldura de foto**, **envelope** e **fita**. As quatro
poses seguem a ordem de sempre.

Ela não é decoração, e não entra por acaso: a chance de um arquivo vir com a
segunda cara **cresce por nível** (`skinTwo` em `data/levels.ts`) — 20% no
nível 1, 55% no 2 e 85% no 3. Ver som ora como alto-falante, ora como megafone,
e texto ora como folha de linhas, ora como envelope, diz sem uma palavra que o
formato **não é o desenho** — é o jeito como o dado está guardado. E dizer isso
cada vez mais alto conforme o jogo avança é a própria progressão do nível.

Esta folha não tem a linha do ninja: ele mora só na primeira, e sorteia uma das
duas quando se revela.
