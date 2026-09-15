# Mesa de Edição — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF04CO06/mesa-de-edicao/`

**Quatro arquivos para jogar, mais a capa do catálogo.**

> **Os quatro chegaram em 15/09/2026, e as grades bateram.** As dimensões vieram
> diferentes das pedidas — `suportes` 1000 × 1000 (célula 500), `clientes`
> 1480 × 1040 (célula 370 × 520), `acervo` 1200 × 800 (célula 400), `bg-estudio`
> exatamente 1672 × 941. O jogo se guia pelos números **medidos**, que moram em
> `data/art.ts`. Falta só a **capa do catálogo** (§7).

> **A unidade de custo é o arquivo, não a peça.** Uma folha de oito células custa
> a mesma geração que um ícone solto — então tudo que é pequeno e do mesmo estilo
> entra na mesma folha. Foi assim que a lista de quinze PNGs de um jogo anterior
> virou cinco sem perder nada.

---

## 0. A lista

| # | Arquivo | Dimensão entregue | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `bg-estudio.png` ✔ | 1672 × 941 | imagem única | opaco | a sala do estúdio: parede lisa em cima, bancada de madeira embaixo |
| 2 | `suportes.png` ✔ | 1000 × 1000 | 2 × 2 de 500 | alfa real | onde a peça vive: quadro de cortiça, telão, celular, caixa da encomenda |
| 3 | `clientes.png` ✔ | 1480 × 1040 | 4 × 2 de 370 × 520 | alfa real | quatro clientes, cada um parado e comemorando |
| 4 | `acervo.png` ✔ | 1200 × 800 | 3 × 2 de 400 | alfa real | as seis ilustrações que entram DENTRO das peças |
| 5 | `cover-mesa-de-edicao.png` | 1672 × 941 | imagem única | opaco | **falta**: a capa do catálogo |

O **#4 é o único que pode esperar**: sem ele a peça mostra um retângulo de
reserva e o jogo continua jogável. Os outros três são o que faz a tela deixar de
parecer interface e virar estúdio.

### O que é `Graphics`, e por quê

- **os botões de ferramenta e os ícones dentro deles** — o `A` do LETRA cresce
  com o passo, o `A` do FORTE engrossa, as linhas do MEIO andam para o meio: são
  mostradores de estado, e um PNG não muda de estado;
- **o texto da peça** (título e frase), porque ele precisa ser texto de verdade,
  no tamanho de verdade, para poder **estourar a margem** e ser visto estourando;
- **o balão do pedido e o bilhete**, o cadeado da TRAVA, o `?`, o cabeçalho, as
  vidas, as bolinhas de fase, as estrelas;
- **o varal do mural** onde as peças entregues ficam penduradas: cordão, prendedor
  e a peça em miniatura, todos desenhados;
- **faíscas, confete, véu, brilho e a moldura da tela** que pisca no acerto.

O jogo tem de rodar inteiro sem nenhum PNG carregado.

---

## 1. As quatro regras que governam esta arte

> **1. Tudo que a criança edita chega VAZIO.**

O quadro de cortiça, o telão e o celular vêm com o miolo **completamente liso**.
Nada de cartaz desenhado dentro, nada de slide de exemplo, nada de vídeo tocando.
O que aparece ali é o jogo que desenha — e uma peça pintada no PNG competiria com
a peça de verdade, ou pior, entregaria a resposta.

> **2. Nenhuma letra em nenhum arquivo.**

Nem no cartaz, nem no telão, nem na camiseta do cliente, nem no acervo. Letra
dentro de PNG vira lixo por baixo do texto de verdade, e este é um jogo em que o
texto muda de tamanho a cada toque.

> **3. Os pares são a MESMA pessoa e a MESMA coisa.**

Cliente parado e cliente comemorando: mesma escala, mesma posição na célula,
mesmo ângulo, mesma roupa — só o rosto e os braços mudam. O jogo troca o quadro
sem mexer em nada, e qualquer deslocamento entre os dois vira um pulo.

> **4. O estúdio é acolhedor, e não é um escritório.**

Sala clara de escola ou de fundo de quintal, madeira, plantinha, luz quente.
Nada de tela de computador com interface, nada de janela de programa, nada de
ícone de aplicativo — a ferramenta aqui é um botão de verdade numa bancada de
verdade, e é assim que uma criança de 9 anos entende o que está apertando.

---

## 2. Estilo e paleta

Visual: **jogo 2D infantil polido**, formas arredondadas, áreas foscas amplas,
contorno firme, leitura fácil em celular. Luz quente vinda de cima à esquerda.

| Uso | Hex |
|---|---|
| contorno | `#2a2233` |
| parede do estúdio | `#f0e3cd` |
| sombra na parede | `#dcc9ab` |
| madeira da bancada | `#8a5f3c` |
| tampo da bancada | `#a97a4f` |
| cortiça do quadro | `#c9a06a` |
| metal e plástico escuro | `#5c6472` |
| papel da peça | `#fffaf0` |
| acerto (código) | `#4eaa78` |
| dica e TRAVA (código) | `#e59a52` |
| seleção e foco (código) | `#4b8fe0` |

### Negativo comum a todos os arquivos

~~~text
text, letters, words, labels, digits, numbers, captions, signature, watermark,
logo, brand, user interface, app window, browser, toolbar, menu bar, icons,
computer screen with interface, keyboard shortcuts, cursor, mouse pointer,
poster already designed, slide with content, video already playing,
photo inside the frame, artwork inside the frame,
HUD, life icon, star rating, question mark button, tutorial panel, speech bubble,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard,
3D render, photorealistic, blur, lens flare, noise, gradient banding.
~~~

Se o gerador não entregar transparência real, peça sobre magenta `#FF00FF` e
remova a cor.

---

## 3. `bg-estudio.png` — a sala

### Contrato

| Campo | Exigência |
|---|---|
| tamanho | 1672 × 941, paisagem, borda a borda |
| fundo | opaco |
| **parede livre** | y 8%–68%, x 36%–98%: parede **lisa e vazia**, onde o suporte é desenhado |
| canto do cliente | x 2%–28%, y 25%–68%: chão e parede calmos, sem móvel alto |
| bancada | y 68%–100%: tampo de madeira de ponta a ponta, **liso**, onde os botões são desenhados |
| clima | oficina de escola: caixotes, uma plantinha, um rolo de fita, luz quente |

Três quartos da imagem são "lugar onde o jogo desenha". O que a arte entrega é a
**sala em volta**: o rodapé, a quina do teto, uma prateleira baixa no canto
direito com caixas de papelão fechadas, uma plantinha, e a madeira da bancada com
veio e brilho — e nada mais.

### Prompt copiável

~~~text
A cosy little craft-studio room background for a children's game, exactly 1672 by
941 pixels, landscape, fully opaque. It reads as a school workshop or a tidy
backyard studio: warm cream walls #f0e3cd, a soft wooden floor, a low shelf in
the far right corner with a few CLOSED plain cardboard boxes, a small potted
plant, a roll of tape, warm light falling from the upper left.

THE MIDDLE AND RIGHT OF THE WALL MUST STAY EMPTY: from x=36% to x=98% and y=8% to
y=68% leave plain, clean, undecorated wall — no posters, no pictures, no frames,
no shelves, no windows. The game draws a board there and anything painted would
fight with it.

Keep x=2–28%, y=25–68% quiet as well: plain floor and wall where a character will
stand.

The bottom third, y=68% to 100%, is a WOODEN WORKBENCH TOP seen from the front,
spanning the whole width: warm wood #a97a4f with a darker front edge #8a5f3c,
visible grain, one soft highlight. Its surface must be EMPTY and flat — no tools,
no buttons, no panels, no objects on it.

Polished flat 2D children's game art, rounded shapes, broad matte colour areas,
dark outline #2a2233 on the major shapes, gentle warm ambient light. Friendly and
calm. Readable when scaled down to a 390-pixel-wide mobile display.

Negative: posters on the wall, framed pictures, windows, computer, monitor,
screen, interface, app window, toolbar, buttons, tools on the bench, papers,
clutter on the workbench, text, letters, numbers, logo, HUD, grid, 3D,
photorealism, blur, watermark.
~~~

### Conferência

- [ ] a faixa de parede do meio para a direita está **vazia de verdade**;
- [ ] o tampo da bancada está limpo, sem uma única ferramenta pintada;
- [ ] há chão e parede calmos no canto esquerdo para o cliente ficar em pé;
- [ ] lê-se "oficina acolhedora" em dois segundos, e não "escritório".

---

## 4. `suportes.png` — onde a peça vive

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1024 × 1024 |
| grade | 2 colunas × 2 linhas; células de 512 × 512 |
| fundo | alfa real |
| estilo | os quatro objetos no mesmo traço, contorno e luz |

| Célula | Objeto | Exigência |
|---:|---|---|
| 1 · linha 1 | **quadro de cortiça vazio** (N1) | moldura de madeira, miolo de cortiça **completamente liso**, dois prendedores nos cantos de cima |
| 2 · linha 1 | **telão da sala vazio** (N2) | tela branca sobre tripé ou barra, miolo **branco puro e liso** |
| 1 · linha 2 | **celular em pé, tela vazia** (N3) | celular claro, vertical, tela **cinza-clara lisa**, sem ícone nenhum |
| 2 · linha 2 | **caixa da encomenda** | caixa de papelão aberta, tampas para fora, **vazia por dentro** |

> **Os três primeiros estão em uso, um por nível.** A caixa da encomenda ficou de
> reserva: a peça chega direto na parede, e uma caixa a mais na tela seria só
> decoração. Ela custa zero — estava na mesma folha.

Duas exigências que decidem se a folha serve:

1. **O miolo dos três suportes é liso.** Sem papel, sem slide, sem vídeo, sem
   moldura interna decorada, sem sombra desenhada no meio. É onde a peça nasce.
2. **Os três têm a mesma proporção de área útil**, aproximadamente 4 : 3 e
   centralizada na célula — o mesmo código posiciona a peça dentro dos três, e
   uma área útil de tamanho diferente em cada um viraria três layouts.

### Prompt copiável

~~~text
Create ONE sprite sheet on a grid of 2 columns by 2 rows, exactly 1024 by 1024
pixels, each cell exactly 512 by 512, TRUE transparent PNG background, no cell
borders and no gaps. Four props from the same cosy children's craft studio, one
consistent style: polished flat 2D children's game art, rounded forms, broad
matte colours, dark outline #2a2233, a single soft highlight from the upper left,
each object centred in its cell with transparent margins.

Cell 1 (top left) — an EMPTY cork notice board: a warm wooden frame around a
plain cork panel #c9a06a. The cork must be completely blank and flat: no pinned
paper, no notes, no drawings, no texture patches. Two small round pins at the top
corners.

Cell 2 (top right) — an EMPTY classroom projection screen: a clean white sheet
hanging from a simple dark bar, slight fabric roll at the top, small stand legs
if needed. The white area must be completely blank: no image, no slide, no light
beam, no logo.

Cell 3 (bottom left) — a friendly chunky mobile phone standing upright in a small
holder, seen straight on. The screen is a plain flat pale grey rectangle with
rounded corners and NOTHING on it: no icons, no apps, no video, no play button,
no notch content.

Cell 4 (bottom right) — an open cardboard delivery box seen from the front, flaps
folded outward, plain brown kraft card, completely EMPTY inside, one strip of
tape on the side.

All four should feel like objects from the same room and the same toy-like world.

Negative: paper pinned on the board, notes, drawings, slide content, projected
image, light beam, video frame, play button, app icons, screen interface, text,
letters, numbers, logo, brand, decoration inside the empty areas, HUD, grid,
visible cell borders, 3D, photorealism, blur, watermark.
~~~

### Conferência

- [ ] os três miolos estão **lisos**, sem nada pintado dentro;
- [ ] a área útil dos três é parecida em proporção e está centrada;
- [ ] os quatro parecem do mesmo mundo e da mesma escala;
- [ ] transparência de verdade, sem borda branca em volta.

---

## 5. `clientes.png` — quem faz o pedido

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1024 × 768 |
| grade | 4 colunas × 2 linhas; células de 256 × 384 (retrato) |
| fundo | alfa real |
| enquadramento | de corpo inteiro, **os pés apoiados na base da célula** |
| direção | todos **virados para a direita**, olhando para onde a peça fica |

| Coluna | Personagem | Linha 1 (parado) | Linha 2 (comemorando) |
|---:|---|---|---|
| 1 | **Téo**, menino de 9 anos, mochila | de pé, mãos juntas, esperando | pulando, braços para cima, sorrisão |
| 2 | **Bia**, menina de 10 anos, cabelo cacheado | segurando uma pastinha | girando, braços abertos |
| 3 | **Dona Zilá**, professora, óculos, cardigã | de pé, uma mão no queixo | palmas, sorrindo |
| 4 | **Vovó Alzira**, senhora de cabelo branco | de pé, bengala, sorriso calmo | mãos no peito, emocionada |

Duas exigências:

1. **Cada coluna é a mesma pessoa duas vezes**: mesma altura, mesma roupa, mesma
   distância dos pés à base, mesmo tamanho de cabeça. O jogo troca o quadro no
   mesmo lugar.
2. **Ninguém segura nada que pareça a peça.** Nem cartaz, nem tablet, nem folha:
   a peça está na parede, e uma cópia na mão do cliente confundiria a criança.

### Prompt copiável

~~~text
Create ONE character sprite sheet on a grid of 4 columns by 2 rows, exactly 1024
by 768 pixels, each cell exactly 256 wide by 384 tall (portrait), TRUE
transparent PNG background, no cell borders and no gaps. Four friendly Brazilian
characters, each drawn TWICE in the same column: the top row calm and waiting,
the bottom row celebrating. Everyone faces slightly to the RIGHT.

Column 1 — Téo, a cheerful 9-year-old boy with short dark hair, striped t-shirt
and a small backpack. Top: standing, hands together, waiting politely. Bottom:
jumping with both arms up, huge smile.

Column 2 — Bia, a 10-year-old girl with curly hair and dungarees, holding a small
folder. Top: standing, holding the folder, hopeful. Bottom: spinning with arms
open, delighted.

Column 3 — Dona Zilá, a warm middle-aged teacher with glasses and a cardigan.
Top: standing, one hand on her chin, thinking. Bottom: clapping, smiling wide.

Column 4 — Vovó Alzira, an elderly lady with white hair, a flowery blouse and a
walking stick. Top: standing calmly, gentle smile. Bottom: both hands on her
chest, moved and happy.

CRITICAL: within each column the two drawings are the SAME person at the SAME
scale, the same outfit, the same head size, and the feet resting on the SAME
baseline at the bottom of the cell — only pose and expression change.

Polished flat 2D children's game art, rounded friendly proportions, broad matte
colours, dark outline #2a2233, soft upper-left light, expressive faces, warm and
welcoming. No one holds a poster, a sheet of paper, a tablet or a phone.

Negative: holding posters, holding paper, holding a tablet, holding a phone,
speech bubbles, text, letters, numbers, logos on clothes, props that look like
the game piece, shadows painted on the ground, cell borders, grid, 3D,
photorealism, blur, watermark.
~~~

### Conferência

- [ ] as duas linhas de cada coluna são inequivocamente a mesma pessoa;
- [ ] todos olham para a direita;
- [ ] os pés estão na mesma linha de base nas oito células;
- [ ] ninguém segura nada parecido com a peça;
- [ ] as caras de comemoração se leem a 81 px de altura no celular.

---

## 6. `acervo.png` — o que entra dentro da peça

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 768 × 512 |
| grade | 3 colunas × 2 linhas; células de 256 × 256 |
| fundo | alfa real |
| estilo | ilustração simples e cheia, sem moldura, sem legenda |

| Célula | Imagem | Onde é usada |
|---:|---|---|
| 1 | duas máscaras de teatro e uma cortina | 1.1, o convite da peça |
| 2 | canteiro com mudinhas e um regador | 1.2, o aviso da horta |
| 3 | fogueira de festa junina com bandeirinhas | 1.3, o convite da festa |
| 4 | feijão germinando num copo com algodão | 2.2, a aula de plantar |
| 5 | bolo de aniversário com velinhas | 3.3, o vídeo da vovó |
| 6 | turma de crianças numa trilha, de costas | reserva, mostra de fotos |

Uma exigência só, e é a mesma das outras folhas: **nenhuma letra, nenhum número,
nenhuma moldura**. Cada célula é a ilustração e o fundo transparente — a moldura
quem desenha é o jogo, porque ela muda de tamanho junto com a peça.

### Prompt copiável

~~~text
Create ONE sprite sheet on a grid of 3 columns by 2 rows, exactly 768 by 512
pixels, each cell exactly 256 by 256, TRUE transparent PNG background, no cell
borders and no gaps. Six simple children's-book illustrations in one consistent
style, each centred in its cell, each filling most of its cell:

Cell 1 — two theatre masks, one happy one sad, in front of a red stage curtain.
Cell 2 — a small vegetable bed with tiny green seedlings and a watering can.
Cell 3 — a friendly little bonfire with triangular bunting flags above it.
Cell 4 — a bean sprouting in a clear glass with cotton wool, small green leaves.
Cell 5 — a birthday cake with lit candles.
Cell 6 — a group of children walking a nature trail, seen from behind.

Polished flat 2D children's game art, rounded shapes, broad matte colours, dark
outline #2a2233, soft upper-left light, cheerful palette. No frames, no borders,
no captions, no backgrounds behind the objects — only the illustrated subject on
transparency.

Negative: text, letters, numbers, captions, signs, banners with writing, frames,
picture borders, photo corners, paper edges, drop shadows on the cell, grid,
visible cell borders, 3D, photorealism, blur, watermark.
~~~

---

## 7. `cover-mesa-de-edicao.png` — a capa

1672 × 941, opaca, no mesmo estilo. A cena: o **Téo** à esquerda apontando
animado para um cartaz de cortiça na parede, onde uma palavra grande e alegre
(desenhada como forma, **sem ser letra legível**) acabou de crescer; embaixo, a
bancada de madeira com três botões redondos coloridos. Luz quente, clima de "deu
certo".

Se o gerador insistir em escrever no cartaz, peça o cartaz com **blocos e
manchas** no lugar do texto — é assim que as outras capas do catálogo resolvem.

---

## 8. Depois que a arte chegar

1. Medir a **caixa alfa** de cada quadro num canvas e ancorar o layout nela, em
   vez de chutar `setScale` — em outro jogo isso revelou que os pés do
   personagem ficavam em 98,5 % da altura do quadro, e virou regra de posição.
2. Conferir que a **área útil** dos três suportes bate com o retângulo da peça
   do `data/layout.ts`; se não bater, mexer no layout, nunca esticar o PNG.
3. Conferir no celular: o cliente a 81 px de altura ainda tem cara; a peça a
   226 × 118 px ainda mostra a palavra crescendo.
4. Só então apagar os desenhos de reserva? **Não.** A reserva fica: é ela que
   mantém o jogo de pé quando um arquivo falta, e o `import.meta.glob` já prevê
   isso.
