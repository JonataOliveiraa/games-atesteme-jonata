# Kit do Solucionador — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO11/kit-do-solucionador/`

**Cinco arquivos para jogar, mais a capa do catálogo.**

> **`vila.png` saiu do jogo (20/09/2026).** Ele era uma paisagem pronta de
> 1870 × 841, e o mundo passou a ter **2560 de largura e a andar com o dedo**:
> esticar uma pintura para isso vira colagem, e a estrada, as casas e o círculo
> moram por cima dela de qualquer jeito. No lugar entraram **`ceu.png`** e
> **`arvore.png`**, e o resto do cenário — chão, morro, terraços, praça, coreto,
> igreja, arbustos e cercas — é **Graphics**, que é o que emenda sem costura com
> a estrada e com o círculo de alcance.

---

## O estilo: TRAÇO CHAPADO

As três imagens de referência vão anexadas em **TODAS** as gerações:

- [`references/20-traco-chapado-a.jpg`](../../../../references/20-traco-chapado-a.jpg)
- [`references/21-traco-chapado-b.webp`](../../../../references/21-traco-chapado-b.webp)
- [`references/22-traco-chapado-c.jpg`](../../../../references/22-traco-chapado-c.jpg)

> **Delas se tira o TRAÇO. Nada mais.** Contorno preto grosso e de espessura
> **uniforme** em volta de tudo, preenchimento **100 % chapado** por dentro, zero
> degradê, zero sombra, zero aerógrafo. Forma construída em geometria limpa —
> retas firmes, cantos nítidos, curvas seguras — e simplificada até a silhueta mais
> forte. Olho grande e simples, com linha de cílio preta pesada e íris chapada.
> Rosto reduzido ao mínimo. Cabelo e pano como **massas chapadas com pontas
> afiadas**, nunca fio a fio. Cartaz, não pintura.

E o que **não** se tira delas, escrito assim porque é o que o gerador vai copiar
se ninguém proibir:

| O que a referência tem | O que entra aqui |
|---|---|
| **rosa, magenta, néon, fluorescente** | **nada disso.** Ocre, areia, terracota e verde dessaturado (§1) |
| fundo xadrez, listras, estrelinhas, brilhos | fundo transparente ou cenário liso |
| corpos longos, pernas angulosas, salto alto | **corpo baixinho e redondo**, cabeça grande — é jogo de criança |
| roupa curta, meia-calça, pose insinuante | roupa simples de vila: avental, chapéu de palha, camisa xadrez |
| as personagens, os anjos, os demônios, as armas | nada disso existe neste jogo |

**A proporção NÃO vem da referência.** Esse é o erro mais provável de todas estas
gerações: a referência tem adultos de pernas compridas e o jogo é de 5º ano. A
proporção continua sendo **cabeça grande, corpo pequeno, tudo redondo e amigável**
— o que muda é só a linha e o preenchimento.

> **Esta é uma linha nova no catálogo.** Os jogos anteriores usam chibi de
> figurinha (`EF05CO10`), desenho de criança (`EF05CO08`), graphic novel
> (`EF05CO09`), contorno de tinta e vetor neon. Misturar duas num jogo só é o jeito
> mais rápido de ele sair com cara de colagem — então **este jogo é traço chapado do
> primeiro ao último arquivo**, e nenhum outro estilo entra aqui.

| | **traço chapado** *(este jogo)* | chibi de figurinha | desenho de criança |
|---|---|---|---|
| **contorno** | **preto, grosso, espessura uniforme** | escuro dessaturado, fino | hidrográfica trêmula |
| **preenchimento** | **100 % chapado, sem sombra nenhuma** | cel shading com um tom de sombra | chapado |
| **forma** | **geometria limpa, cantos nítidos** | arredondada e macia | ingênua |
| **silhueta** | segura pelo **próprio contorno preto** | keyline branca de adesivo | contorno preto |
| **olho** | grande, **cílio preto pesado**, íris chapada | enorme, com brilho | pontinho |

> **Sem keyline branca de adesivo neste jogo.** Ela existia no chibi para a figura
> se soltar do fundo; aqui o contorno preto grosso já faz esse trabalho, e uma borda
> branca por cima dele suja a linha.

> **O jogo roda inteiro com zero PNG.** O cabeçalho, o sol, as bandeirinhas, **a
> carta e o botão IR**, **o chão, o morro, os terraços, a praça, o coreto, a igreja,
> os arbustos e as cercas**, **a estrada**, **o círculo de alcance e o rastro**, as
> bifurcações, os balões, o painel do kit, o cartaz, as estrelas e o confete nascem
> em `Graphics`. As texturas só trocam as ferramentas, o céu, a árvore, as casinhas,
> a gente e o Sr. Exagero. A reserva de cada uma está no §12 do `PLANEJAMENTO.md`.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `ferramentas.png` | 1024 × 768 | 4 × 3 de **256** | alfa real | **as 12 ferramentas do baralho** |
| 2 | `ceu.png` | 1870 × 841 | imagem única, **emendável em x** | opaco | o céu com as nuvens |
| 2b | `arvore.png` | 256 × 256 | imagem única | alfa real | **uma** árvore, repetida pelo mundo |
| 3 | `casas.png` | 1536 × 512 | 3 × 1 de **512** | alfa real | a casinha em três estados |
| 4 | `gente.png` | 1536 × 256 | 6 × 1 de **256** | alfa real | quem acena na porta, e os quatro vizinhos |
| 5 | `exagero.png` | 1280 × 256 | 5 × 1 de **256** | alfa real | o Sr. Exagero em 4 expressões, e o carrinho |
| 6 | `cover-kit-do-solucionador.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**Ordem de geração:** o **3** primeiro, sozinho — sem casinha não existe corrida, e
a corrida é o que se testa antes de tudo (§12 do `PLANEJAMENTO.md`, passo 1). Depois
o **1**, que é o baralho. O **2** e o **2b** vestem o cenário, o **4** e o **5**
fecham o clima, e o **6** por último.

A capa também alimenta `public/og/kit-do-solucionador.jpg` — mesma arte, exportada
em JPG para o compartilhamento.

---

## 1. As sete regras que governam esta arte

**1. A ferramenta tem de ser lida a 38 × 26 px reais.** É o tamanho do desenho na
carta, num celular de 390 px. São **doze objetos** disputando esse tamanho: cada um é **uma forma grande e um acento de cor**, e nada mais. O
traço chapado ajuda aqui — contorno grosso e cor lisa é o que mais sobrevive à
miniatura.

**2. Nenhum objeto carrega letra, número, mostrador ou tela legível.** O que a
ferramenta faz não pode estar escrito nela — é a decisão que faz o jogo passar no
teste da bolinha (§2 do `PLANEJAMENTO.md`). A tela do celular do grupo da vila é uma
mancha de cor com três bolhas de conversa **sem texto dentro**.

**3. As doze silhuetas não podem se confundir duas a duas.**

| Ferramenta | A forma que a separa |
|---|---|
| **alto-falante do carro** | dois **cones** gêmeos amarrados no teto de um carro |
| **bicicleta do carteiro** | uma **bicicleta de perfil** com uma bolsa grande atrás |
| **bater na porta** | uma **mão fechada** batendo numa **porta** — a única mão do baralho |
| **o menino com o bilhete** | um **menino correndo** com um papelzinho na mão erguida |
| **o drone da escola** | um **X de quatro hélices** visto de três quartos — a única coisa que voa |
| **telão de estádio** | um **retângulo enorme sobre duas pernas de treliça** — largo, baixo, plantado |
| **sino da igreja** | um **sino** pendurado numa viga, inclinado |
| **quadro de avisos da praça** | um **quadro de cortiça em pé** com papeizinhos presos e um telhadinho |
| **o rádio da vila** | um **rádio de mesa** com uma **antena telescópica comprida** saindo |
| **o grupo da vila no celular** | um **celular em pé** com três bolhas de conversa saindo |
| **a impressora da secretaria** | uma **impressora** com uma **pilha grossa** de papel saindo |
| **o palpite do vizinho** | uma **cabeça de perfil** com um **ponto de interrogação** saindo |

Os pares de risco são dois, e cada um tem a sua separação:

- **rádio × celular**: a antena comprida do rádio é diagonal e a silhueta dele é
  deitada; o celular é um retângulo em pé. Deitado contra em pé, a 39 px.
- **quadro da praça × telão**: o quadro é alto e estreito com um telhadinho; o telão
  é largo e baixo sobre treliça. Alto contra largo.

**4. A cor não quer dizer nada, e isso é deliberado.** Não existe "a cor das coisas
que andam". Um esquema de cores por função seria um gabarito pintado na carta, e
desfaria tudo o que o §2 do `PLANEJAMENTO.md` gastou uma página para evitar. Cada
ferramenta tem a sua cor, escolhida só para separá-la das outras.

| Ferramenta | Cor |
|---|---|
| alto-falante do carro | vermelho-tijolo |
| bicicleta do carteiro | azul-céu acinzentado |
| bater na porta | madeira-mel |
| o menino com o bilhete | verde-oliva, papel creme |
| o drone da escola | branco-osso e grafite, uma luzinha vermelha |
| telão de estádio | azul-petróleo |
| sino da igreja | bronze |
| quadro de avisos da praça | cortiça, papeizinhos creme |
| o rádio da vila | mostarda-queimado |
| o grupo da vila no celular | ardósia, tela verde-clara |
| a impressora da secretaria | cinza-claro |
| o palpite do vizinho | cinza-quente |

**A paleta inteira do jogo é quente e dessaturada** — ocre, areia, terracota,
oliva, bronze, ardósia. **Nenhum rosa, nenhum magenta, nenhum néon.** É o oposto da
referência, e é de propósito: a única coisa que pode brilhar na tela é **a janela
amarela de uma casa que acabou de acender**, e ela não brilha se a vila inteira já
for colorida.

E a exigência que sai daí, e é **critério de aceite**: **num mesmo dia, duas
ferramentas do kit nunca têm cores vizinhas.** Os dias do §7 do `PLANEJAMENTO.md`
são a lista a conferir.

**5. Nada de chão, sombra, mesa ou cenário preso na ferramenta.** A carta é
`Graphics` e o objeto pousa dentro do anel. Objeto com chão próprio cria a emenda que
o `PLANEJAMENTO MODAL.md` §7 chama pelo nome.

**6. Nada de interface dentro do PNG.** Nem carta, nem anel, nem círculo, nem
estrada, nem balão, nem brilho de estado, nem estrelinha. **O anel é `Graphics` e o
círculo da vila também** — eles precisam ter exatamente o mesmo tom e a mesma
espessura, e isso só se garante desenhando os dois no mesmo lugar do código.

**7. As três ferramentas que não são tecnologia não podem parecer piores.** Bater na
porta, o sino e o quadro da praça são desenhados com o mesmo capricho, a mesma luz e
o mesmo peso de traço dos aparelhos. O sino da igreja é a **resposta certa do dia
1.1**; se ele sair mais sem graça que o telão, o jogo ensina o contrário do que quer.
A única que pode ter graça de piada é o palpite do vizinho, e a piada está na cara,
não no acabamento.

---

## Os dois blocos que abrem e fecham TODO prompt

Estão escritos uma vez aqui e repetidos inteiros em cada prompt abaixo, para poder
copiar e colar sem montar nada por cima.

### Bloco de estilo (começa o prompt)

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: bold black outlines of EVEN, THICK weight
all the way around every shape; 100% FLAT colour fill inside, with NO gradients,
NO cel shading, NO soft shadows, NO airbrushing and NO texture; forms built from
clean geometry — firm straight runs, crisp corners, confident curves —
simplified down to the strongest possible silhouette; big simple eyes drawn with
a heavy black lash line and a flat iris; faces reduced to the minimum, tiny or no
nose, one simple mouth line; hair and cloth as big flat masses with sharp points,
never strand-by-strand detail. Graphic and poster-like, like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes, their poses,
their backgrounds or their subject matter.

PROPORTIONS — NOT from the attached images. The attached images use long adult
bodies with long angular legs; ignore that completely. Everything here is short,
round and friendly, with a big head and a small body, drawn for young children.

PALETTE — IGNORE the attached images' colours entirely. This artwork is warm and
DESATURATED: ochre, sand, terracotta, olive, bronze and slate. There is NO pink,
NO magenta, NO neon and NO fluorescent colour anywhere in this project.
~~~

### Bloco negativo (fecha o prompt)

~~~text
DO NOT INCLUDE: pink, hot pink, magenta, fuchsia, purple-pink, neon colours,
fluorescent colours, acid colours, rainbow gradients, glowing outlines,
checkerboard patterns, striped backgrounds, star bursts, sparkles, twinkles,
confetti, halftone dots, long adult legs, high heels, stockings, short dresses,
bare midriff, cleavage, suggestive poses, guns, weapons, angels, demons, horns,
wings, magical girls, anime idol characters, the characters from the attached
images, text, letters, words, labels, digits, numbers, captions, watermark,
logo, title lettering, signature, user interface, buttons, panels, frames,
speech bubbles with text, arrows pointing at things, icons, HUD, brand marks,
gradients, cel shading, soft shadows, airbrushing, painterly lineless
illustration, heavy rendering, rough sketchy lines, uneven brush outlines, thin
hairline outlines, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps,
cropped edges, drop shadow on the cell, white backing in transparent assets,
white sticker keyline, sad faces, crying, angry faces, scolding adults, pointing
at the viewer.
~~~

---

## 2. `ferramentas.png` — as doze

### Contrato da folha

- **1024 × 768**, grade **4 colunas × 3 linhas** de **256 × 256**, alfa real.
- A ordem dos quadros é o índice do frame, e é contrato com `data/ferramentas.ts`:

| # | Objeto | # | Objeto |
|---:|---|---:|---|
| 0 | alto-falante do carro | 6 | sino da igreja |
| 1 | bicicleta do carteiro | 7 | quadro de avisos da praça |
| 2 | bater na porta | 8 | o rádio da vila |
| 3 | o menino com o bilhete | 9 | o grupo da vila no celular |
| 4 | o drone da escola | 10 | a impressora da secretaria |
| 5 | telão de estádio | 11 | o palpite do vizinho |

- **Quem anda tem um lado, e o código sabe qual é.** Cinco destes objetos viajam
  pela vila, e a vila corre da esquerda para a direita. O campo `frente` em
  `data/ferramentas.ts` diz para que lado o desenho olha PARADO, e a corrida
  espelha o sprite conforme o rumo — sem isso o carro de som atravessa os
  3600 px de ré, que foi exatamente o que aconteceu. A folha atual:

  | # | Objeto | `frente` |
  |---:|---|---|
  | 0 | alto-falante do carro | `esquerda` |
  | 1 | bicicleta do carteiro | `direita` |
  | 2 | bater na porta | — (é uma porta, não vira) |
  | 3 | o menino com o bilhete | `direita` |
  | 4 | o drone da escola | `esquerda` |

  Se a folha for gerada de novo e algum deles sair virado para o outro lado,
  **corrija o `frente`, e não a arte**: é um campo de uma palavra.

- **Todos com o mesmo peso de contorno.** No traço chapado a espessura da linha é a
  assinatura do estilo: se um objeto sair com linha mais fina que os outros, ele
  parece de outro jogo.
- **Cada objeto ocupa de 78 % a 92 % da célula**, centrado. O que manda é a **massa
  visível**, não a caixa: um sino pequeno e um telão largo têm de ter a mesma
  *presença* dentro do anel.
- Depois de gerar, **meça a caixa alfa de cada quadro** (o script do
  `PLANEJAMENTO MODAL.md` §7) e ancore no centro da caixa medida, com **uma escala só
  para a folha inteira**, tirada da maior dimensão.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: bold black outlines of EVEN, THICK weight
all the way around every shape; 100% FLAT colour fill inside, with NO gradients,
NO cel shading, NO soft shadows, NO airbrushing and NO texture; forms built from
clean geometry — firm straight runs, crisp corners, confident curves —
simplified down to the strongest possible silhouette. Graphic and poster-like,
like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes, their poses,
their backgrounds or their subject matter.

PALETTE — IGNORE the attached images' colours entirely. This artwork is warm and
DESATURATED: ochre, sand, terracotta, olive, bronze and slate. There is NO pink,
NO magenta, NO neon and NO fluorescent colour anywhere in this project.

SHEET — Sprite sheet, 4 columns by 3 rows, 256x256 px per cell, transparent
background, no grid lines drawn, every object with the SAME outline thickness,
each object centred in its cell and filling about 85% of it, no ground, no
shadow on the cell, no table, no scenery.

COLOUR — every object has its OWN colour. The colours do NOT form families and
must NOT group the objects by what they do. Give neighbouring cells clearly
different hues, all of them warm and desaturated.

THE TWELVE OBJECTS, in reading order, left to right, top row first:
1. a pair of twin loudspeaker horns strapped on the roof of a small car, brick
   red
2. a postman's bicycle seen from the side with a big satchel on the back, greyed
   sky blue
3. a closed hand knocking on a simple wooden door, honey-coloured wood
4. a small boy running with a folded paper note held up in one hand, olive green
   clothes, cream paper
5. a four-rotor quadcopter drone seen at three quarters, bone white and graphite
   body, one small red light
6. a huge wide flat outdoor stadium screen standing on two short lattice legs,
   petrol blue
7. a bronze church bell hanging from a wooden beam, tilted as if ringing
8. an upright cork noticeboard on a post with a tiny roof and small blank cream
   papers pinned on it, cork brown
9. a chunky tabletop radio lying wide, with one long telescopic antenna sticking
   out diagonally, burnt mustard
10. an upright mobile phone with three EMPTY speech bubbles floating out of it,
    slate grey body, pale green screen, NO text inside the bubbles
11. an office printer with a thick stack of blank cream paper coming out and
    spilling, light grey
12. a person's head in profile with a big question mark floating out of it, warm
    grey, slightly goofy expression

DO NOT INCLUDE: pink, hot pink, magenta, fuchsia, purple-pink, neon colours,
fluorescent colours, acid colours, rainbow gradients, glowing outlines,
checkerboard patterns, striped backgrounds, star bursts, sparkles, twinkles,
confetti, halftone dots, guns, weapons, angels, demons, horns, wings, magical
girls, anime idol characters, the characters from the attached images, text,
letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, signature, user interface, buttons, panels, frames, speech bubbles
with text, arrows pointing at things, icons, HUD, brand marks, readable screens,
readable dials, rings or circles or halos drawn around the objects, gradients,
cel shading, soft shadows, airbrushing, painterly lineless illustration, heavy
rendering, rough sketchy lines, uneven brush outlines, thin hairline outlines,
muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, grid
lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, drop
shadow on the cell, white backing in transparent assets, white sticker keyline.
~~~

> **Duas exceções, e as duas são de propósito.** O quadro 12 é um ponto de
> interrogação porque ali o `?` **é** o objeto — ele é grande, desenhado, e não se
> parece com o botão `?` do cabeçalho, que é branco num círculo. E o quadro 10 tem
> balões de fala, que o negativo proíbe em todos os outros: ali eles **são** o
> objeto, e têm de sair **vazios**.
>
> **E um perigo específico:** o negativo proíbe **anéis e círculos em volta dos
> objetos**. O círculo de alcance é `Graphics` e mora no MAPA, não na carta — um
> halo desenhado no PNG competiria com ele em doze lugares diferentes.

---

## 3. `ceu.png` e `arvore.png` — as duas únicas texturas de cenário

### `ceu.png`

- **1870 × 841**, imagem única, fundo **opaco**. No jogo ele entra como
  `tileSprite` preso na tela (`scrollFactor 0`), com a paralaxe feita na mão:
  `tilePositionX = scrollX * 0,22`. Só a faixa de cima é usada — o horizonte do
  jogo fica em y 400.
- **Tem de emendar em x.** A borda esquerda e a direita se encostam quando o
  mapa anda, e uma nuvem cortada no meio aparece duas vezes por travessia.
- **Céu liso e nuvens chapadas**, poucas e espalhadas. Nada de degradê: por baixo
  dele há um retângulo de cor sólida que é o que aparece se a textura faltar, e
  os dois não podem discordar.

### `arvore.png`

- **256 × 256**, alfa real, **uma árvore só**. Ela é colocada onze vezes no mundo,
  em escalas de 0,6 a 1, e é isso que faz o cenário ter profundidade sem custar
  uma folha de sprites.
- **Copa fechada e tronco curto**, lida a 60 px de altura. Sem chão, sem sombra,
  sem grama na base: o chão é Graphics e a emenda apareceria.
- **Sem contorno branco.** O contorno preto grosso já separa a árvore do morro.

### Prompt copiável — o céu

~~~text
STYLE — flat vector illustration, absolutely FLAT colour with NO gradient and
NO texture anywhere, clean geometric shapes, simple stylised clouds with crisp
straight edges.

SCENE — a plain daytime sky, 1870 by 841, a single flat medium blue, with a few
simple cream-white clouds spread far apart, mostly in the upper half. The clouds
are flat shapes with sharp edges, not fluffy.

CRITICAL — the LEFT and RIGHT edges must tile seamlessly: whatever touches the
left edge continues from the right edge. No cloud may be cut at either edge.

DO NOT INCLUDE: gradients, shading, sun, birds, ground, hills, buildings, text,
letters, numbers, watermark, logo, signature, frames, borders, noise, blur,
photorealism, pink, magenta, neon.
~~~

### Prompt copiável — a árvore

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY: bold black outlines of
even, thick weight; 100% FLAT colour fill with NO gradients, NO cel shading and
NO soft shadows; clean geometric shapes. Take ONLY the line and the shape
language from the attached images.

PALETTE — IGNORE the attached images' colours. Olive and moss green canopy,
warm brown trunk. No pink, no magenta, no neon.

SUBJECT — one single tree, seen from the front, centred, filling about 85% of a
256x256 square, transparent background. A full rounded canopy of flat green with
a black outline, and a short sturdy brown trunk with two or three branches.

DO NOT INCLUDE: ground, grass, soil, shadow, other trees, fences, text, letters,
numbers, watermark, logo, white sticker keyline, gradients, shading, blur,
photorealism, pink, magenta, neon.
~~~

## 4. `casas.png` — a casinha, em três estados

Este é o arquivo mais importante do jogo, e o menor. Dezesseis cópias dele ficam na
tela ao mesmo tempo, e **o jogo inteiro é ele mudando de estado**.

### Contrato

- **1536 × 512**, grade **3 × 1** de **512 × 512**, alfa real.
  *(A folha foi refeita nesse tamanho em 20/09/2026. O `cutSheet` divide o
  ARQUIVO entregue, não o contrato, então subir a resolução não pede código
  nenhum — só chega mais nítida.)*

| # | Estado | Quando |
|---:|---|---|
| 0 | **escura** — janelas apagadas, telhado em tom frio, tudo baixo de contraste | a casa que não precisa saber, e a que ainda não soube |
| 1 | **marcada** — a mesma casa, com a **porta aberta** e um trapézio de luz na soleira | quem precisa saber deste problema |
| 2 | **acesa** — as janelas **amarelas quentes**, a fumacinha saindo da chaminé | quem já soube |

- **É A MESMA CASA NOS TRÊS.** Mesmo telhado, mesma largura, mesma altura, mesma
  posição na célula, mesmo ângulo. Só muda a luz e a porta. Se a silhueta mudar entre
  os quadros, as dezesseis casas da vila vão **pular de forma** ao acender, e o
  efeito mais bonito do jogo vira defeito.
- **A luz é uma FORMA CHAPADA, não um brilho.** No traço chapado não existe glow: a
  janela acesa é um retângulo amarelo de borda preta, e a luz na soleira é um
  trapézio amarelo. É isso que faz o estado 2 gritar a 27 px — e glow desenhado no
  PNG brigaria com o `Graphics` que o jogo põe por cima.
- **A casa aparece a 88 px na grade — 26 px reais.** É telhado, parede, porta e duas
  janelas. Nada mais.
- **ELA É A ÚNICA CONSTRUÇÃO DO JOGO.** Havia um coreto e uma igreja desenhados em
  `Graphics` ao lado dela, e os dois saíram: prédio desenhado em código encostado
  na arte entregue vira outro jogo dentro do jogo. O cenário agora é chão,
  terreno e mobília — laje, banco, arbusto, cerca, poste —, e mais nada.
- **Uma casa só, sem variação.** A vila tem dezesseis iguais, e isso é a favor: o
  olho lê o padrão e enxerga a exceção, que é justamente quem acendeu.
- Os três quadros com a base na **mesma linha** da célula.

> **A antena e o sinalzinho NÃO entram nesta folha.** O rádio da vila acende as casas
> com antena, e o grupo no celular acende as que têm sinal (§7 do `PLANEJAMENTO.md`)
> — mas isso são **duas marquinhas em `Graphics` desenhadas por cima da casa**, não
> dois quadros novos. Três motivos, e os três são a mesma regra: quem tem antena muda
> de problema para problema; a marquinha precisa acender e apagar; e uma casa com
> antena colada no PNG seria uma **quarta silhueta**, que é exatamente o que o
> contrato acima proíbe.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: bold black outlines of EVEN, THICK weight
all the way around every shape; 100% FLAT colour fill inside, with NO gradients,
NO cel shading, NO soft shadows, NO glow, NO airbrushing and NO texture; forms
built from clean geometry — firm straight runs, crisp corners — simplified to
the strongest silhouette. Graphic and poster-like, like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters or their subject matter.

PALETTE — IGNORE the attached images' colours entirely. Warm and DESATURATED:
terracotta roof, sand walls, olive trim. The ONLY bright colour allowed is the
warm yellow of a lit window in the third cell. There is NO pink, NO magenta, NO
neon and NO fluorescent colour anywhere.

SHEET — Sprite sheet, 3 columns by 1 row, 512x512 px per cell, transparent
background, no grid lines drawn, no ground, no shadow on the cell.

THE SUBJECT — one simple little village house with a pitched terracotta roof, a
chimney, one front door and two windows, seen straight from the front. IT IS THE
EXACT SAME HOUSE IN ALL THREE CELLS: identical roof, identical width, identical
height, identical position in the cell, identical angle. Only the lighting and
the door change.

THE THREE CELLS, left to right:
1. the house asleep: door closed, windows dark and empty, cool muted colours,
   low contrast
2. the same house with its front door OPEN and a flat yellow trapezoid of light
   on the doorstep; windows still dark
3. the same house awake: both windows filled with FLAT warm yellow with a black
   outline, door closed, a small curl of smoke from the chimney

The light in cells 2 and 3 is a FLAT OUTLINED SHAPE, never a glow, never a
gradient, never a blur.

DO NOT INCLUDE: other houses, fences, gardens, roads, paths, people, animals,
pink, hot pink, magenta, fuchsia, neon colours, fluorescent colours, acid
colours, rainbow gradients, glowing outlines, glow, bloom, light rays,
checkerboard patterns, striped backgrounds, star bursts, sparkles, twinkles,
text, letters, words, labels, digits, numbers, captions, watermark, logo,
signature, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, HUD, different house shapes between cells, changed roof, changed size,
changed angle, gradients, cel shading, soft shadows, airbrushing, painterly
lineless illustration, heavy rendering, rough sketchy lines, uneven brush
outlines, thin hairline outlines, muddy colours, 3D render, photorealistic,
blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell
borders, gaps, cropped edges, drop shadow on the cell, white backing in
transparent assets, white sticker keyline.
~~~

---

## 5. `gente.png` — quem acena, e quem fala

**Este é o arquivo de maior risco da lista.** É o único com pessoas, e as
referências são de personagens adultas de pernas compridas, roupa curta e pose
insinuante. **Nada disso entra num jogo de 5º ano.** O bloco de proporção e o
negativo abaixo existem por causa deste arquivo, e eles são obrigatórios.

### Contrato

- **1536 × 256**, grade **6 × 1** de **256 × 256**, alfa real.

| # | Quadro | Onde aparece | Escala |
|---:|---|---|---|
| 0 | **esperando** — uma pessoinha na porta, braços soltos, olhando para os lados | em toda casa marcada | **78 px na grade** |
| 1 | **acenando de volta** — a mesma pessoinha com os dois braços para cima | no instante em que a casa acende | **78 px** |
| 2 | **dona Rosa** — senhora baixinha, coque no alto, avental | balão de fala | busto, ~120 px |
| 3 | **seu Nando** — senhor magro e alto, chapéu de palha de aba larga | balão de fala | busto |
| 4 | **o Téo** — menino pequeno, mochila, boné virado | balão de fala | busto |
| 5 | **seu Ari** — homem largo, camisa xadrez, chapéu de couro | balão de fala | busto |

- **Os quadros 0 e 1 são a MESMA pessoa**, genérica e sem traço marcante. Ela
  aparece a **78 px na grade — 23 px reais** (era 44, e a 13 px reais virava uma
  mancha: o morador é quem diz *"esta casa precisa saber"* e quem acena quando ela
  acende, e os dois momentos mais importantes do jogo aconteciam sem ninguém em
  cena). Mesmo a 23 px o rosto não conta: o que separa os dois quadros é a
  **posição dos braços**, e ela tem de ser legível de longe.
- Os quadros 2 a 5 são **bustos**, na mesma escala entre si, e aparecem sozinhos
  dentro de um balão. Aí sim o rosto conta — e é onde o olho de cílio pesado do traço
  chapado rende.
- Quadros 0 e 1 com os pés na mesma linha.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured or how their bodies are built: bold black
outlines of EVEN, THICK weight all the way around every shape; 100% FLAT colour
fill inside, with NO gradients, NO cel shading, NO soft shadows and NO
airbrushing; big simple eyes drawn with a heavy black lash line and a flat iris;
face reduced to the minimum, tiny or no nose, one simple mouth line; hair and
cloth as big flat masses with clean edges, never strand-by-strand detail.
Graphic and poster-like, like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes, their poses or
their subject matter.

PROPORTIONS — NOT from the attached images. The attached images use tall adult
bodies with long angular legs, high heels and short dresses; ignore ALL of that.
These are short, round, friendly village people drawn for young children: big
head, small body, plain modest everyday clothes, fully covered.

PALETTE — IGNORE the attached images' colours entirely. Warm and DESATURATED:
ochre, sand, terracotta, olive and slate. There is NO pink, NO magenta, NO neon
and NO fluorescent colour anywhere.

SHEET — Sprite sheet, 6 columns by 1 row, 256x256 px per cell, transparent
background, no grid lines drawn, no ground, no shadow.

CELLS 1 AND 2 — the SAME plain villager, full body, plain simple covered
clothes, no distinctive features, drawn so the pose reads purely from the arms:
1. standing calmly, arms down at the sides, looking to the side
2. the same person with BOTH ARMS RAISED HIGH, waving happily

CELLS 3 TO 6 — four different villagers, head and shoulders only, centred, all
at the same scale as each other, friendly neutral expressions:
3. a short round grandmother with a high bun and an apron
4. a tall thin old man in a wide straw hat
5. a small boy with a backpack strap and a cap turned backwards
6. a broad man in a checked shirt and a leather hat

DO NOT INCLUDE: long adult legs, high heels, stockings, short dresses, bare
midriff, cleavage, suggestive poses, sexualised figures, guns, weapons, angels,
demons, horns, wings, magical girls, anime idol characters, the characters from
the attached images, pink, hot pink, magenta, fuchsia, neon colours, fluorescent
colours, acid colours, rainbow gradients, glowing outlines, checkerboard
patterns, striped backgrounds, star bursts, sparkles, twinkles, text, letters,
words, labels, digits, numbers, captions, watermark, logo, signature, user
interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, houses,
doors, scenery, gradients, cel shading, soft shadows, airbrushing, painterly
lineless illustration, heavy rendering, rough sketchy lines, uneven brush
outlines, thin hairline outlines, muddy colours, 3D render, photorealistic,
blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell
borders, gaps, cropped edges, drop shadow on the cell, white backing in
transparent assets, white sticker keyline, sad faces, crying, angry faces,
scolding adults, pointing at the viewer.
~~~

---

## 6. `exagero.png` — o Sr. Exagero e o carrinho

### Contrato

- **1280 × 256**, grade **5 × 1** de **256 × 256**, alfa real.

| # | Quadro | Onde aparece |
|---:|---|---|
| 0 | **gabando-se**: peito estufado, uma mão apontando para cima | quando ele monta o kit, no começo do dia |
| 1 | **animado**: as duas mãos abertas, sorrisão | quando a criança usa a maior ferramenta e ela é a certa (dia 1.3) |
| 2 | **coçando a cabeça**: uma mão na nuca, boca torta | o fecho do dia, com o que sobrou no carrinho |
| 3 | **emburrado**: braços cruzados, sobrancelha baixa, **sem tristeza** | o fim do nível |
| 4 | **o carrinho vazio**: carrinho de feira de madeira, de perfil, virado para a esquerda | sempre que ele está em cena |

- Ele é um **vendedor simpático, nunca um vilão**. Sem bigode de mau, sem cartola,
  sem sorriso de lado. Um homem largo de paletó mostarda e chapéu, que gosta demais
  de coisa grande. O quadro 3 é **emburrado, não triste** — uma criança que vê o
  adulto do jogo entristecer aprende a coisa errada sobre ter errado.
- **O mostarda dele é o amarelo mais forte do jogo depois da janela acesa**, e é o
  único lugar em que uma cor pode chamar atenção fora da vila.
- **O carrinho vem vazio.** As ferramentas que sobram são desenhadas por cima em
  `Graphics`, porque elas mudam a cada dia.
- Quadros 0 a 3 na mesma escala, pés na mesma linha.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured or how their bodies are built: bold black
outlines of EVEN, THICK weight all the way around every shape; 100% FLAT colour
fill inside, with NO gradients, NO cel shading, NO soft shadows and NO
airbrushing; big simple eyes with a heavy black lash line and a flat iris; face
reduced to the minimum; clothes as big flat masses with clean edges. Graphic and
poster-like, like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their costumes or their poses.

PROPORTIONS — NOT from the attached images. Ignore their tall adult bodies and
long legs completely. This is a short, round, friendly character drawn for young
children: big head, small body, fully covered clothes.

PALETTE — IGNORE the attached images' colours entirely. Warm and DESATURATED,
with burnt mustard as the one accent. There is NO pink, NO magenta, NO neon and
NO fluorescent colour anywhere.

SHEET — Sprite sheet, 5 columns by 1 row, 256x256 px per cell, transparent
background, no grid lines drawn, the same character at the same scale in cells 1
to 4, feet on the same line, no ground, no shadow.

THE CHARACTER — a friendly broad market seller, full body, burnt mustard jacket
and a matching hat, cheerful and boastful, never a villain.

THE FIVE CELLS, left to right:
1. boasting: chest puffed out, one hand pointing proudly upwards
2. delighted: both hands open wide, big grin
3. scratching the back of his head, mouth crooked, mildly puzzled
4. arms crossed, one eyebrow down, grumpy but NOT sad
5. an empty wooden market handcart seen from the side, facing left, no person

DO NOT INCLUDE: long adult legs, high heels, short clothes, suggestive poses,
guns, weapons, angels, demons, horns, wings, anime idol characters, the
characters from the attached images, villain moustache, top hat, evil smirk,
menacing pose, money, coins, price tags, goods in the cart, pink, hot pink,
magenta, fuchsia, neon colours, fluorescent colours, acid colours, rainbow
gradients, glowing outlines, checkerboard patterns, striped backgrounds, star
bursts, sparkles, twinkles, text, letters, words, labels, digits, numbers,
captions, watermark, logo, signature, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, HUD, gradients, cel shading, soft shadows,
airbrushing, painterly lineless illustration, heavy rendering, rough sketchy
lines, uneven brush outlines, thin hairline outlines, muddy colours, 3D render,
photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet
borders, cell borders, gaps, cropped edges, drop shadow on the cell, white
backing in transparent assets, white sticker keyline, sad faces, crying, angry
faces, scolding adults, pointing at the viewer.
~~~

---

## 7. `cover-kit-do-solucionador.png` — a capa

**1672 × 941**, imagem única, opaca. A capa é **a vila vista de cima com o carro do
alto-falante passando na estrada**, e **um círculo de luz quente em volta dele**, com
as casas dentro do círculo **acesas** e as do morro, atrás, **escuras**. O Sr.
Exagero aparece pequeno no canto direito, com o carrinho.

A capa é a mecânica numa imagem: **um círculo que acende quem está dentro, e o morro
que ficou de fora.** É a única coisa que precisa sobreviver a 240 px de largura na
lista do catálogo.

**O círculo é uma forma chapada com contorno**, não um brilho — é o que o traço
chapado permite e é o que a torna legível em miniatura.

~~~text
STYLE — USE THE ATTACHED IMAGES FOR THE LINE WORK ONLY. Match how they are
DRAWN, never how they are coloured: black outlines of EVEN weight around every
shape; 100% FLAT colour fill inside, with NO gradients, NO cel shading, NO soft
shadows, NO glow and NO airbrushing; forms built from clean geometry, crisp
corners, confident curves, simplified to strong flat shapes. Graphic and
poster-like, like clean vector art.

TAKE ONLY THE LINE AND THE SHAPE LANGUAGE FROM THE ATTACHED IMAGES. Do NOT take
their colours, their palette, their characters, their backgrounds or their
subject matter.

PROPORTIONS — any people here are short, round and friendly, with big heads and
small bodies, fully covered. Ignore the attached images' tall adult bodies.

PALETTE — IGNORE the attached images' colours entirely. Warm and DESATURATED:
ochre, sand, terracotta and olive, late afternoon. The one bright colour is the
warm yellow of the lit windows and of the circle of light. There is NO pink, NO
magenta, NO neon and NO fluorescent colour anywhere.

SCENE — a small village seen from a high three-quarter angle. A dirt road runs
across the middle. On the road, a small car with a pair of twin brick red
loudspeaker horns strapped to its roof. A wide FLAT circle of warm golden
colour, with a clean outlined edge, spreads across the ground around the car —
a flat shape, not a glow and not a gradient. Every little house INSIDE the
circle has flat warm yellow windows and a tiny person waving at the door. Behind
and above, a green terraced hillside with four little houses that are clearly
DARK, windows unlit, outside the circle. In the bottom right corner, small, a
broad cheerful market seller in a burnt mustard jacket and hat beside a wooden
handcart, one hand pointing proudly upwards.

DO NOT INCLUDE: pink, hot pink, magenta, fuchsia, neon colours, fluorescent
colours, acid colours, rainbow gradients, glowing outlines, glow, bloom, light
rays, checkerboard patterns, striped backgrounds, star bursts, sparkles,
twinkles, long adult legs, high heels, short dresses, suggestive poses, guns,
weapons, angels, demons, anime idol characters, the characters from the attached
images, text, letters, words, labels, digits, numbers, captions, watermark,
logo, title lettering, signature, user interface, buttons, panels, frames,
speech bubbles, arrows pointing at things, icons, HUD, readable screens, brand
marks, gradients, cel shading, soft shadows, airbrushing, painterly lineless
illustration, heavy rendering, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise, white sticker
keyline.
~~~

---

## 8. Depois que a arte chegar

**Meça, não chute.** Uma execução no navegador, com o PNG desenhado num canvas,
devolvendo a caixa alfa de cada quadro em fração da célula.

| Folha | A pergunta |
|---|---|
| `ferramentas.png` | qual é a maior dimensão entre as 12? A escala da folha sai dela, e é **uma só** |
| `ferramentas.png` | algum objeto ocupa menos de 70 % da célula? Ele vai sumir dentro do anel |
| `casas.png` | **as três caixas alfa são iguais?** Se não forem, a casa muda de forma ao acender, e é defeito |
| `ceu.png` | a emenda em x é invisível? Arraste o mapa de ponta a ponta e olhe |
| `arvore.png` | a copa lê a 60 px, e não há chão nem sombra grudados? |
| `gente.png` | os quadros 0 e 1 têm os pés na mesma linha, e se distinguem só pelos braços? |
| `exagero.png` | o quadro 4 (o carrinho) tem escala própria — qual? |

E os três testes que não são de medida, e que são os que reprovam a folha:

> **Um — a miniatura.** Encolha `ferramentas.png` para 38 px de largura por quadro e
> olhe as doze juntas. Se duas viram a mesma mancha, a folha volta. 38 px é o tamanho
> real em que a criança vai decidir.
>
> **Dois — o contraste.** Ponha `casas.png` quadro 0 e quadro 2 lado a lado a 27 px
> de altura, sobre o ocre do chão. **O aceso tem de gritar.** Esse contraste é o
> feedback principal do jogo, e ele acontece dezesseis vezes por corrida.
>
> **Três — o teste do rosa.** Abra as cinco folhas juntas e procure um pixel rosa,
> magenta ou néon. **Não pode existir nenhum.** A referência é toda feita dessas
> cores e o gerador puxa para lá sem avisar; é o defeito mais provável de toda esta
> rodada, e o mais fácil de deixar passar porque "ficou bonito".

### Checagem final

- [ ] **nenhum pixel rosa, magenta, néon ou fluorescente em nenhuma das cinco folhas**;
- [ ] o contorno preto é grosso e de espessura uniforme nas folhas 1, 3, 4 e 5;
- [ ] **não há degradê, sombra suave nem glow em lugar nenhum** — tudo chapado;
- [ ] ninguém tem perna comprida de adulto, salto alto ou roupa curta;
- [ ] nenhuma personagem da referência apareceu em lugar nenhum;
- [ ] nenhuma letra, número ou tela legível nas 12 ferramentas — e os balões do
      celular estão **vazios**;
- [ ] **nenhum anel, círculo ou halo desenhado em volta de qualquer ferramenta**;
- [ ] as doze se distinguem a 39 px, com atenção aos dois pares de risco
      (rádio × celular, quadro × telão);
- [ ] **as cores não formam grupo**, e num mesmo dia do §7 duas ferramentas nunca têm
      cores vizinhas;
- [ ] o sino, o quadro da praça e a mão batendo têm o mesmo capricho dos aparelhos;
- [ ] `casas.png` tem a mesma silhueta nos três quadros, conferido pela caixa alfa;
- [ ] a luz da casa é uma forma chapada com contorno, nunca um brilho;
- [ ] a casa acesa grita sobre o fundo da vila a 27 px;
- [ ] `ceu.png` emenda em x sem nuvem cortada;
- [ ] `arvore.png` não tem chão, sombra nem grama na base;
- [ ] o Sr. Exagero não tem cara de vilão, e o quadro 3 é emburrado, não triste;
- [ ] transparência real nas folhas 1, 3, 4 e 5 — se o gerador só entregar fundo
      branco, peça sobre magenta `#FF00FF` e remova a cor **(e confira que nenhum
      resto de magenta ficou na borda)**;
- [ ] a capa lida a 240 px ainda mostra um círculo de luz e um morro escuro fora dele;
- [ ] `public/og/kit-do-solucionador.jpg` exportado da mesma arte.
