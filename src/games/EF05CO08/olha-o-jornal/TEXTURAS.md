# Olha o Jornal! — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO08/olha-o-jornal/`

**Cinco arquivos para jogar, mais a capa do catálogo.**

> **O estilo deste jogo é o DESENHO DE CRIANÇA**, escolhido pelo dono do projeto
> em 18/09/2026, e a referência é **uma imagem só**:
> [`references/16-desenho-de-crianca.jpg`](../../../../references/16-desenho-de-crianca.jpg)
> — as duas crianças jogando bola. **Ela vai anexada em TODAS as gerações.**
> Cada prompt abaixo já vem inteiro — estilo, corpo e negativo —, para ser
> copiado e colado sem montar nada por cima.
>
> **Este NÃO é o chibi de figurinha de `references/ESTILO.md`**, e a diferença
> não é de gosto, é de técnica: lá o traço é limpo e de espessura uniforme, tem
> `cel shading` de um tom, olho grande e brilhante e uma keyline branca de
> adesivo. Aqui o traço é de **caneta hidrográfica, trêmulo e de espessura
> irregular**, a cor é **chapada e sem uma sombra sequer**, o olho é um
> **pontinho preto** e **não existe keyline** — quem segura a silhueta é o
> próprio contorno preto.
>
> **Duas exigências do negativo antigo foram REMOVIDAS de todos os prompts**,
> porque agora elas brigam com a referência: `rough sketchy lines` e
> `uneven brush outlines`. Linha trêmula e de espessura desigual é exatamente o
> que se quer. Saiu também `western cartoon style`, que empurrava para o
> oposto do desenho ingênuo.

> **O jogo roda inteiro com zero PNG.** Os dois cartões de jornal, o lançador, a
> linha pontilhada, o estouro de papel, as setas, o botão, o cabeçalho, as
> vidas, as bolinhas, a plaquinha âmbar, o varal, as estrelas e o confete nascem
> em `Graphics`. As texturas só **trocam** o carteiro, as pessoas, o jornal que
> voa e os dois fundos.

> **A unidade de custo é o arquivo, não a peça.** As doze pessoas vêm numa folha
> só, e os quatro estados do carteiro em outra: uma folha de doze células custa
> uma geração, igual a um desenho solto.

---

## 1. O que os vizinhos já fizeram, e o que isso muda aqui

Esta habilidade é a mais povoada do catálogo, e duas das pastas vizinhas já têm
arte de **gente num bairro**. A conferência foi feita antes de escrever
qualquer prompt:

| Vizinho | O que ele já tem | O que isso obriga aqui |
|---|---|---|
| **`EF04CO08/duelo-das-fontes`** *(17/09/2026)* | `vizinhos.png` — seis vizinhos de meio corpo — e `bg-balcao.png`, que é **a praça do bairro** | é a habilidade-irmã e o mesmo cenário. **Não dá para reaproveitar** (o jogo está em *vetor chapado neon*, a linha aposentada em 17/09) e **não dá para repetir o enquadramento**: lá é **balcão de frente, meio corpo, cara a cara**; aqui é **praça de perfil, corpo inteiro, em grupos, com o céu livre para o arco**. São duas praças que não se parecem |
| | seis personagens nomeados: Nina, **Beto**, Zé, Rita, Caco, Sol | o `Beto Souza` que estava no planejamento virou **Tino Rocha**. Dois jogos vizinhos com um `Beto` que é *da prefeitura* num e *jornalista fraco* no outro confunde a criança que jogar os dois |
| **`EF05CO08/radar-de-confiabilidade`** *(publicado)* | `bg-feed.png`, dois mascotes e dez `thumb-*.png` de ~2 MB cada | é o irmão da **mesma habilidade**, e a arte dele é um **feed de celular**. Aqui não existe um único print de rede social: o suporte é **papel**, e é essa a separação visual entre os dois |
| **`EF02CO05/cidade-das-tecnologias`** | `location-*.png`, `bg-city-map.png` | já há uma cidade no catálogo, em traço antigo. Nenhuma peça serve |
| **`EF05CO05/raio-x-da-maquina`** *(o mais recente)* | — | é dele que sai a **forma deste arquivo**: lista com prioridade, contrato por arquivo, prompt copiável inteiro e conferência |

**A conclusão prática:** nada é reaproveitável, e o risco real não é falta de
arte — é **as duas praças do catálogo ficarem parecidas**. As três decisões que
separam esta daqui estão no §2.

---

## 2. As quatro regras que governam esta arte

> **1. O estado da pessoa tem de se ler a 51 px de altura.**

É o tamanho real dela no celular. O jogo inteiro é ver a informação chegar nas
pessoas — se `informado` e `confuso` só se diferenciam pela cara, o jogo perde a
cena que ele foi feito para ter. **Quem carrega o estado é a silhueta:**

| Estado | O que muda na SILHUETA | O que muda na cara |
|---|---|---|
| **desinformado** | **mãos vazias**, braços caídos, olhando para o lado | dois pontinhos, boca uma risquinha reta |
| **informado** | **um jornal aberto, branco e grande, na frente do peito** | olhos em arco alegre `^ ^`, boca aberta sorrindo, bochechas rosadas fortes |
| **confuso** | o **mesmo jornal, fechado e caído ao lado do corpo**, ombros curvados | olhos em bolinha vazia, boca em linha ondulada, um risquinho de sobrancelha levantada e uma gotinha |

Tape a cara com o polegar: ainda tem que dar para dizer qual é qual. O retângulo
branco na frente do peito é o que faz isso a 51 px.

**E neste estilo isso vale dobrado.** No chibi de figurinha o olho era grande e
brilhante e sozinho já contava o estado; aqui o olho é um **pontinho de caneta
que some a 51 px**. Sobram três coisas legíveis nesse tamanho: **o jornal, a
inclinação do corpo e a bochecha rosada.** É por isso que a bochecha entra no
contrato — ela é a mancha de cor que diz "essa pessoa está bem" de longe.

> **2. Confuso é DÚVIDA, nunca tristeza nem bronca.**

A pessoa acabou de receber uma notícia que não bate. Ela está **em dúvida** —
olhos em bolinha, boca ondulada, uma gotinha. Nada de choro, de cara fechada, de
dedo em riste nem de adulto ralhando: a criança errou uma escolha, não uma
pessoa. O negativo de todo prompt carrega isso.

**A bochecha rosada não sai no `confuso`.** Ela fica, só menor: a pessoa não
ficou triste, ficou em dúvida, e apagar a bochecha faria o estado parecer
castigo.

> **3. O brilho de estado é `Graphics`, não desenho.**

O halo quente do `informado` e a plaquinha âmbar do `confuso` são desenhados
pelo código, porque acendem e apagam. O PNG entrega **pose + jornal +
expressão**, e as doze células vêm **igualmente chapadas**, sem uma sombra.
Nenhuma célula com glow, sombra no chão ou moldura.

**E aqui o `Graphics` tem de mudar junto com a arte.** Este estilo não tem
`cel shading` nem keyline, então a interface desenhada em código passa a
conviver com cor 100 % chapada: **borda preta trêmula não se imita em
`Graphics`**, e tentar deixaria a interface parecendo uma imitação pobre do
desenho. O caminho é o contrário — **cartão, botão e plaquinha ficam
deliberadamente lisos e retos**, em cor chapada da mesma paleta, e o contraste
entre a interface reta e o desenho torto vira proposital.

> **4. Nada de chão, calçada, banco ou praça grudado numa pessoa.**

O chão é `Graphics` e a sombra de cada pessoa é desenhada pelo código, com a
base medida na caixa alfa. Uma pessoa que vem com o próprio pedaço de calçada
cria a emenda que o olho acha primeiro.

**Neste estilo a sombra em `Graphics` é uma elipse chapada**, sem degradê e sem
transparência escalonada — uma sombra macia embaixo de um desenho de caneta
denuncia as duas coisas de uma vez.

### A conferência de estilo, que vale para os seis arquivos

Um gerador de imagem **quer** pôr sombrinha e brilho: é o padrão dele, e é o
primeiro jeito de esta arte chegar errada. Antes de aceitar qualquer arquivo:

- [ ] **nenhuma sombra e nenhum degradê em lugar nenhum** — cada área é uma cor
      chapada, e só;
- [ ] **nenhum brilho** no olho, no cabelo, na roupa ou no papel;
- [ ] o contorno é **preto, trêmulo e de espessura irregular** — se saiu liso e
      parelho, é outro estilo;
- [ ] a cor está **frouxa em relação ao traço**, escapando um pouco, como
      pintura de criança — e não perfeitamente contida dentro da linha;
- [ ] o olho é **pontinho preto**, nunca olho grande com brilho;
- [ ] **nenhuma keyline branca** em volta da silhueta: quem segura a figura é o
      contorno preto.

---

## 3. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é | Prioridade |
|---:|---|---:|---|---|---|---|
| 1 | **`pessoas.png`** | 768 × 1024 | **3 × 4** de 256 | alfa real | as 4 pessoas × 3 estados | **insubstituível** |
| 2 | `carteiro.png` | 1024 × 256 | 4 × 1 de 256 | alfa real | o carteiro, em 4 estados | importante |
| 3 | `jornal-voando.png` | 768 × 256 | 3 × 1 de 256 | alfa real | o jornal no ar, em 3 quadros | importante |
| 4 | `bg-praca.png` | 1672 × 941 | imagem única | opaco | a praça, **com o céu livre** | importante |
| 5 | `bg-banca.png` | 1672 × 941 | imagem única | opaco | a banca, **com o meio vazio** | pode esperar |
| 6 | `cover-olha-o-jornal.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo | por último |

**O #1 é o jogo.** Os três estados são o feedback inteiro da tela B, e são a
única coisa que mostra o custo de espalhar sem conferir.

**O #4 e o #5 podem esperar.** Sem eles a praça é um degradê de céu com uma
faixa de chão, e a banca é um degradê com uma faixa de bancada — o nível 1 é
avaliável assim. **O #2 também**: sem o carteiro, os dois jornais simplesmente
caem na mesa.

### O que continua sendo `Graphics`, e por quê

- **os dois cartões de jornal** — nome, manchete, as três linhas de pista e a
  tarja "já espalhamos esse" mudam a cada fase, e PNG não muda. **Nenhuma letra
  em PNG nenhum**, em lugar nenhum deste jogo;
- **os três pictogramas das linhas de pista** (quem escreveu, quando, de onde
  tirou) — são interface e vivem em `scenes/icons.ts`;
- **o lançador, a linha pontilhada da mira e o estouro de papel** — o estouro é
  partícula, e partícula é código;
- **as duas setas e o botão redondo**, o cabeçalho, as bolinhas de fase, as
  vidas, o `?`, a plaquinha âmbar, o varal do jornal do dia, as estrelas, a
  moldura que pisca e o confete.

---

## 4. `pessoas.png` — as quatro pessoas da praça

### Contrato da folha

- **768 × 1024**, grade **3 colunas × 4 linhas** de **256 × 256**, alfa real.
- **Corpo inteiro**, em pé, de frente com um leve três-quartos.
- Cada pessoa aparece a **~170 px de altura na grade** — **51 px reais**.
- **A linha é a pessoa, a coluna é o estado**, e o índice do quadro é contrato
  com o código: `frame = pessoa × 3 + estado`.

| Linha | Quem é | Como se reconhece a 51 px |
|---:|---|---|
| 0 | **criança de boné** | boné vermelho virado para a frente, mochila nas costas, baixinha |
| 1 | **senhora da feira** | coque grisalho alto, vestido florido comprido, sacola de feira na mão |
| 2 | **rapaz alto** | o mais alto dos quatro, camiseta verde-água, boné virado para trás |
| 3 | **moça de macacão** | cabelo cacheado volumoso, macacão azul, fone no pescoço |

| Coluna | Estado | Frame da pessoa 0 |
|---:|---|---:|
| 0 | desinformado | 0 |
| 1 | informado | 1 |
| 2 | confuso | 2 |

**Os quatro se separam pela altura, pelo cabelo e pela cor da roupa** — nunca
por um detalhe pequeno. A 51 px, um brinco ou um bolso não existem.

**A sacola da senhora e a mochila da criança são parte do corpo dela**, nos três
estados, e nunca mudam de mão: se um acessório sumir entre as colunas, a troca
de estado vira um pulo.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. One single wobbly
hand-drawn black outline of uneven thickness, like a marker pen held by a kid;
FLAT solid bright colours with NO shading, NO gradients and NO highlights
anywhere; the colour filled in loosely, the colour blocks sitting slightly off
the outline like a colouring book filled in by hand; naive simple faces — two
small solid black dot eyes, a big open happy mouth, a round pink blush circle on
each cheek; hair drawn as loose scribbled loops; simple rounded arms and legs
with small hands and feet; a big head on a small body. Take ONLY the art style
from the attached image: do NOT copy its characters, their clothes, their poses,
their scene or its framing.

Sprite sheet, 3 columns by 4 rows, 256x256 px per cell, the same flat drawing
style and the same scale in every cell, transparent background, no grid lines
drawn, no cell borders, no ground shadow.

Four different doodle townspeople, full body, standing, facing the viewer at a
slight three-quarter angle. Each ROW is the SAME person three times, with the
same clothes, the same accessory and the same height in all three cells — only
the pose, the hands and the face change across the row.

Row 1: a short kid in a red cap worn forwards, with a small backpack.
Row 2: a friendly grandmother, grey scribbled hair in a high bun, long flowery
dress, a woven market bag in one hand.
Row 3: the tallest of the four, a young man in a soft teal-green t-shirt and a
cap worn backwards.
Row 4: a young woman with big scribbled curly hair, blue dungarees, over ear
headphones resting around her neck.

Column 1 — UNINFORMED: empty hands, arms relaxed down at the sides, head turned
slightly away, two plain dot eyes, mouth a short straight line, small pale blush
circles.
Column 2 — INFORMED: holding a big open newspaper up in front of the chest with
both hands, the newspaper a large plain pale cream sheet with only a few soft
grey bars suggesting columns and absolutely no readable letters; the eyes drawn
as two happy upward curves, a big open smiling mouth, strong round pink blush
circles.
Column 3 — PUZZLED: the same newspaper now folded shut and hanging down at one
side, shoulders slightly slumped, head tilted; the eyes drawn as two small empty
circles, the mouth a small wavy unsure line, one short raised eyebrow stroke and
a single cartoon sweat drop near the temple, the blush circles still there but
smaller. This is DOUBT, not sadness: no tears, no frown, no anger.

The difference between the three cells of a row must read at 51 px tall: the big
pale newspaper held up in front of the chest is the main silhouette change, and
the blush is the colour that carries the mood.

DO NOT INCLUDE: shading, cel shading, shadows on the figures, gradients, glossy
highlights, smooth even vector outlines, thin elegant line art, anime or manga
eyes, big glossy eyes with highlights, white sticker keyline, ground, pavement,
kerb, bench, square, park, buildings, plants, any scenery behind or under the
people, ground shadow, glow, halo, coloured light on the characters, readable
letters on the newspaper, headlines, different height or different clothes
between cells of the same row, a missing or swapped accessory between cells,
crying, tears, sad faces, angry faces, scolding adults, pointing at the viewer,
phones, screens, tablets, text, letters, words, labels, digits, numbers,
captions, watermark, logo, title lettering, user interface, buttons, panels,
frames, speech bubbles, arrows, icons, stars, HUD, question mark button,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, grid
lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, drop
shadow on the cell, white backing in transparent assets.
~~~

### Conferência

- [ ] 12 células, 3 colunas × 4 linhas, na ordem `pessoa × 3 + estado`;
- [ ] a mesma pessoa nas três células da linha: mesma altura, mesma roupa, mesmo
      acessório na mesma mão;
- [ ] **reduza a 51 px de altura** e confira: dá para dizer qual é qual sem ver
      a cara?
- [ ] o jornal aberto é pálido e **sem uma letra**;
- [ ] confuso está em dúvida, não triste nem bravo;
- [ ] os quatro se separam por altura, cabelo e cor de roupa;
- [ ] alfa real, sem chão, sem sombra, sem halo.

---

## 5. `carteiro.png` — o carteiro

### Contrato da folha

- **1024 × 256**, grade **4 × 1** de **256 × 256**, alfa real.
- **Corpo inteiro**, virado para a direita: ele olha para os dois jornais e para
  a praça, que estão à direita dele.
- Aparece a **200 × 230 na grade** (60 × 69 reais). Não é alvo de toque — ele é
  quem dá o dono à pergunta.
- **A ordem dos quadros é o índice do frame:**

| # | Estado | Quando aparece |
|---:|---|---|
| 0 | **entregando** | a tela A: os dois braços estendidos, oferecendo |
| 1 | **mirando** | a tela B: de lado, mão em pala sobre os olhos, olhando o arco |
| 2 | **comemorando** | todos informados: braços para cima, boné pulando |
| 3 | **cabisbaixo** | a virada do jornal fraco: boné na mão, olhando para baixo |

**O quadro 3 é o único do jogo com decepção, e ela é dele, não da criança.** Ele
é o adulto que também espalhou — ombros caídos, boné tirado, um meio sorriso
constrangido. Nunca cara de bronca, nunca olhando para quem joga.

**A bolsa de correio fica no mesmo ombro nos quatro quadros.**

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. One single wobbly
hand-drawn black outline of uneven thickness, like a marker pen held by a kid;
FLAT solid bright colours with NO shading, NO gradients and NO highlights
anywhere; the colour filled in loosely, the colour blocks sitting slightly off
the outline like a colouring book filled in by hand; naive simple faces — two
small solid black dot eyes, a big open happy mouth, a round pink blush circle on
each cheek; hair drawn as loose scribbled loops; simple rounded arms and legs
with small hands and feet; a big head on a small body. Take ONLY the art style
from the attached image: do NOT copy its characters, their clothes, their poses,
their scene or its framing.

Sprite sheet, 4 columns by 1 row, 256x256 px per cell, the same character at the
same scale and the same flat drawing style in every cell, transparent
background, no grid lines drawn, no cell borders, no ground shadow.

The SAME doodle postal carrier in all four cells: full body, a cheerful young
letter carrier in a warm mustard-yellow uniform shirt and dark shorts, with a
soft postal cap and a big canvas mail satchel hanging on the LEFT shoulder in
every single cell. Turned slightly to the right in every cell.

Cell 1 — HANDING OVER: both arms held out forward, palms up, offering something;
big open smile, dot eyes, strong pink blush circles.
Cell 2 — AIMING: standing side on, one hand shading the eyes like a visor,
looking up and to the right, mouth a small determined line.
Cell 3 — CHEERING: both arms thrown up, cap lifting slightly off the head, the
eyes drawn as two happy upward curves, big open smile, three tiny straight
motion ticks around him.
Cell 4 — CRESTFALLEN: cap held in both hands at chest height, head lowered,
shoulders dropped, the eyes two small empty circles, a small embarrassed wavy
smile and a single cartoon sweat drop. He is sheepish about his own mistake,
NOT angry and NOT scolding. The blush circles stay.

The satchel must stay on the same shoulder and the uniform must be identical in
all four cells.

DO NOT INCLUDE: shading, cel shading, shadows on the figure, gradients, glossy
highlights, smooth even vector outlines, thin elegant line art, anime or manga
eyes, big glossy eyes with highlights, white sticker keyline, newspapers,
letters, envelopes, parcels or any object in his hands, bicycle, mail van,
postbox, ground, pavement, buildings, scenery, ground shadow, a different
uniform or a different satchel side between cells, crying, tears, angry face,
scolding, wagging finger, pointing at the viewer, text, letters, words, labels,
digits, numbers, captions, watermark, logo, title lettering, user interface,
buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, question
mark button, painterly lineless illustration, soft airbrushed gradients, heavy
rendering, muddy colours, 3D render, photorealistic, blur, lens flare, heavy
noise, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped
edges, drop shadow on the cell, white backing in transparent assets.
~~~

### Conferência

- [ ] 4 quadros, na ordem entregando · mirando · comemorando · cabisbaixo;
- [ ] a bolsa no mesmo ombro nos quatro;
- [ ] **as mãos vazias no quadro 0** — o jornal é `Graphics` e entra por cima;
- [ ] o quadro 3 é constrangido, não bravo nem chorando;
- [ ] alfa real, sem chão, sem sombra.

---

## 6. `jornal-voando.png` — o jornal no ar

### Contrato da folha

- **768 × 256**, grade **3 × 1** de **256 × 256**, alfa real.
- Aparece a **~90 px na grade** (27 px reais) e **gira** durante o voo, então
  ele tem de se ler como jornal por silhueta, em qualquer ângulo.
- **Sem cara e sem olhos.** É a única peça deste jogo que não é personagem: ele
  é o que a criança lançou, e dar olhos a ele faria a criança achar que está
  arremessando alguém.

| # | Quadro | Quando |
|---:|---|---|
| 0 | **dobrado** | no lançador e durante o voo |
| 1 | **abrindo** | o quadro do impacto, folhas começando a soltar |
| 2 | **aberto** | 120 ms depois, aberto no ar antes de virar partícula |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. One single wobbly
hand-drawn black outline of uneven thickness, like a marker pen held by a kid;
FLAT solid bright colours with NO shading, NO gradients and NO highlights
anywhere; the colour filled in loosely, the colour blocks sitting slightly off
the outline like a colouring book filled in by hand. Take ONLY the art style
from the attached image: do NOT copy its characters, their clothes, their poses,
their scene or its framing.

Sprite sheet, 3 columns by 1 row, 256x256 px per cell, the same object at the
same scale and the same flat drawing style in every cell, transparent
background, no grid lines drawn, no cell borders, no ground shadow.

The same rolled newspaper in three stages, drawn as a simple object with no face
and no eyes. The paper is a warm pale cream, with a few soft grey bars hinting at
printed columns and absolutely no readable letters. A thin red paper band is
wrapped around it in cell 1. Keep the loose colour offset small on this one: it
is drawn very small in the game and a wide gap between line and colour turns
into dirt.

Cell 1 — FOLDED: a tidy rolled newspaper seen at a slight angle, compact, the
red band around its middle.
Cell 2 — OPENING: the band has snapped, the roll is bursting open, the outer
sheet flaring out and two loose pages beginning to fly off.
Cell 3 — OPEN: fully open in mid air, the big spread sheet wide and curved, with
four loose pages fanning away from it.

The object must still read as a newspaper at 27 px and from any rotation angle.

DO NOT INCLUDE: shading, cel shading, shadows on the object, gradients, glossy
highlights, smooth even vector outlines, thin elegant line art, white sticker
keyline, face, eyes, mouth, arms, legs, readable letters, headlines, photographs
on the paper, hands holding it, ground, table, scenery, motion blur, speed
lines, ground shadow, text, letters, words, labels, digits, numbers, captions,
watermark, logo, title lettering, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, HUD, question mark button, painterly
lineless illustration, soft airbrushed gradients, heavy rendering, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines,
visible sprite-sheet borders, cell borders, gaps, cropped edges, drop shadow on
the cell, white backing in transparent assets.
~~~

### Conferência

- [ ] 3 quadros, dobrado · abrindo · aberto;
- [ ] **sem cara e sem olhos**;
- [ ] sem uma letra legível;
- [ ] a 27 px ainda parece jornal;
- [ ] alfa real.

---

## 7. `bg-praca.png` — a praça

### Contrato

- **1672 × 941**, imagem única, opaca, 16:9.
- **Neste estilo o fundo é o risco maior do jogo.** Traço trêmulo e cor chapada
  numa cena inteira viram ruído depressa, e por cima dele passam o arco, as
  pessoas e dois botões. A regra é **desenhar MENOS do que parece pouco**: céu
  liso sem nuvem rabiscada, casinhas só nas bordas, calçada sem uma junta.
- **O contorno preto do cenário é mais fino que o das pessoas.** É o que mantém
  a figura na frente e o cenário atrás, já que aqui não há sombra nem desfoque
  para separar os planos.
- **O desenho é uma faixa de chão embaixo e céu limpo em cima** — é por esse céu
  que o jornal voa, e ele não pode ter nada:

| Faixa da tela | y | O que pode ter |
|---|---:|---|
| **céu** | 82–430 | **nada** além de céu, nuvem baixa e o alto de uns prédios bem à direita e bem à esquerda. É o corredor do arco |
| **chão e grupos** | 390–560 | o coreto, as árvores e um banco — **e nenhum deles em x 560–1200**, onde ficam as pessoas |
| **calçada da frente** | 560–720 | uma faixa de calçada **calma e de valor uniforme**: é onde moram as setas e o botão |

- **O canto esquerdo (x 0–340) fica livre e claro**: ali ficam o lançador e as
  duas setas.
- **É a segunda praça do catálogo.** A do `duelo-das-fontes` é um **balcão visto
  de frente**, à noite, em neon. Esta é **vista de lado, de dia**, larga e com
  céu — as duas não podem ser confundidas numa lista de capas.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. Wobbly hand-drawn black
outlines of uneven thickness, like a marker pen held by a kid; FLAT solid bright
colours with NO shading, NO gradients and NO highlights anywhere; the colour
filled in loosely, sitting slightly off the outline like a colouring book filled
in by hand. Here the outlines must be THINNER and calmer than on a character,
because this is the backdrop everything else is drawn on top of. Take ONLY the
art style from the attached image: do NOT copy its characters, their poses,
their scene or its framing.

Wide background illustration, 16:9, seen from the side like a flat stage, very
simple and sparse, with large calm empty areas where game elements will sit.

A cheerful small-town square on a bright clear morning. The top 45 percent of
the image is EMPTY open sky, one single flat pale blue with nothing drawn in it
at all — no clouds, no birds, no wires, no balloons. Low pastel townhouses drawn
as simple flat boxes with square windows, and two or three round lollipop trees,
sit ONLY at the far left edge and the far right edge, leaving the whole middle of
the skyline open. A little bandstand with a round roof sits at the right hand
side, low down, and one park bench sits near it.

The lower third is a wide, plain pavement in one flat warm light grey, with no
paving joints drawn at all, completely free of objects, benches, bins, lamp
posts and planters.

The far left of the image, ground level, is clear open pavement with nothing
standing on it.

Everything is evenly lit and completely flat: no shadows anywhere in the scene.

DO NOT INCLUDE: shading, cel shading, cast shadows, gradients, glossy
highlights, textured paper, crayon texture, pencil hatching, scribbled fill,
clouds, people, characters, animals, birds, cars, bicycles, market stalls, lamp
posts, bins, fountains, statues, flagpoles, banners, bunting, overhead wires,
paving lines, anything in the middle of the sky, anything in the middle of the
pavement, night, neon, glowing signs, shop signage, a service counter, a kiosk,
white sticker keyline, text, letters, words, labels, digits, numbers, captions,
watermark, logo, title lettering, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, HUD, question mark button, painterly
lineless illustration, soft airbrushed gradients, heavy rendering, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise, cropped
edges.
~~~

### Conferência

- [ ] o céu do meio está **vazio** — nada cruza o corredor do arco;
- [ ] nada em pé entre x 560 e 1200 na faixa do chão;
- [ ] o canto esquerdo do chão está livre;
- [ ] a calçada da frente é uniforme e clara o bastante para as setas e o botão
      se lerem por cima;
- [ ] é de dia, de lado, e **não parece o balcão do `duelo-das-fontes`**;
- [ ] nenhuma pessoa no desenho.

---

## 8. `bg-banca.png` — a banca do carteiro

### Contrato

- **1672 × 941**, imagem única, opaca, 16:9. Contorno fino, como o da praça.
- **O meio é vazio.** Os dois cartões de jornal ocupam de x 230 a 1150 e de
  y 165 a 635 — quase a tela inteira. O fundo é o que aparece **em volta** e,
  por baixo dos cartões, ele não é visto.
- Serve para dar **lugar** à leitura: uma banca de jornais na esquina, bem cedo,
  com a persiana meio aberta. Silêncio e nenhum movimento.
- **Escuro e dessaturado o suficiente** para dois cartões quase brancos pousarem
  em cima sem disputar.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. Wobbly hand-drawn black
outlines of uneven thickness, like a marker pen held by a kid; FLAT solid
colours with NO shading, NO gradients and NO highlights anywhere; the colour
filled in loosely, sitting slightly off the outline like a colouring book filled
in by hand. Here the outlines must be THINNER and calmer than on a character,
because this is the backdrop everything else is drawn on top of. Take ONLY the
art style from the attached image: do NOT copy its characters, their poses,
their scene or its framing.

Wide background illustration, 16:9, with a large calm empty area across the
whole centre where game elements will sit.

The inside of a cosy little corner newspaper kiosk, seen straight on. A warm
wooden counter runs across the bottom of the image, drawn as one flat band.
Behind it, simple wooden shelves with square pigeonholes line ONLY the far left
and far right edges. The entire centre of the image is a plain flat wooden wall
in one single muted colour, with nothing drawn on it at all.

The whole scene uses deep muted colours — dark warm browns and a dusty blue —
and stays low contrast, so that bright pale cards placed over the centre will
stand out strongly against it.

DO NOT INCLUDE: shading, cel shading, cast shadows, gradients, glossy
highlights, wood grain texture, crayon texture, pencil hatching, scribbled fill,
people, characters, hands, newspapers, magazines, stacks of paper, posters,
pinned notes, price cards, clocks, anything hanging in the centre, bright
colours in the centre, busy patterns, strong highlights in the middle, night
neon, glowing signs, text, letters, words, labels, digits, numbers, captions,
watermark, logo, title lettering, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, HUD, question mark button, white sticker
keyline, painterly lineless illustration, soft airbrushed gradients, heavy
rendering, muddy colours, 3D render, photorealistic, blur, lens flare, heavy
noise, cropped edges.
~~~

### Conferência

- [ ] o centro está vazio e é o mais escuro da imagem;
- [ ] **nenhum jornal desenhado** — os jornais são `Graphics` e entram por cima;
- [ ] um cartão quase branco de 420 × 470 pousa em cima e se destaca;
- [ ] nenhuma pessoa no desenho.

---

## 9. `cover-olha-o-jornal.png` — a capa

### Contrato

- **1672 × 941**, imagem única, opaca.
- **A ação tem de se ler em miniatura.** A ação deste jogo é uma: **um jornal
  voando num arco por cima de uma praça, e as pessoas levantando o jornal
  embaixo.**
- O carteiro pode aparecer, pequeno, no canto esquerdo, com o braço recém
  lançado. Quem é o herói é **o arco**.
- Uma `.jpg` da mesma arte vai para `public/og/olha-o-jornal.jpg`, como os outros
  48 jogos.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. One single wobbly
hand-drawn black outline of uneven thickness, like a marker pen held by a kid;
FLAT solid bright colours with NO shading, NO gradients and NO highlights
anywhere; the colour filled in loosely, the colour blocks sitting slightly off
the outline like a colouring book filled in by hand; naive simple faces — two
small solid black dot eyes, a big open happy mouth, a round pink blush circle on
each cheek; hair drawn as loose scribbled loops; a big head on a small body.
Take ONLY the art style from the attached image: do NOT copy its characters,
their clothes, their poses, their scene or its framing.

Cover illustration; the main action must read at thumbnail size.

A bright small-town square seen from the side. A rolled newspaper flies through
the open blue sky in a big clear arc from the lower left towards the right,
trailing a few loose pale pages behind it; the arc is drawn as a simple dotted
curve. At the lower left, small, a cheerful doodle postal carrier in a
mustard-yellow uniform and postal cap has just thrown it, one arm still
following through, a big open grin. On the right, a little group of three doodle
townspeople — a kid in a red cap, a grandmother with a high grey bun, a tall
young man in a teal-green t-shirt — hold a big open pale newspaper up together,
mouths open in delight and strong pink blush circles on every cheek. Flat pale
blue sky with nothing in the middle of it, simple pastel houses low at the left
and right edges.

DO NOT INCLUDE: shading, cel shading, cast shadows, gradients, glossy
highlights, smooth even vector outlines, anime or manga eyes, big glossy eyes
with highlights, white sticker keyline, throwing at people's heads, anyone being
hit, anyone falling over, impact stars, explosion, smoke, debris, sad or
frightened faces, readable letters or headlines on any newspaper, phones,
screens, night, neon, a service counter, a kiosk, text, letters, words, labels,
digits, numbers, captions, watermark, logo, title lettering, user interface,
buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, question
mark button, painterly lineless illustration, soft airbrushed gradients, heavy
rendering, muddy colours, 3D render, photorealistic, blur, lens flare, heavy
noise, grid lines, cropped edges.
~~~

### Conferência

- [ ] em miniatura dá para ver: o arco + o jornal + as pessoas lendo;
- [ ] ninguém é atingido, ninguém cai, não há estilhaço nem explosão;
- [ ] o carteiro é pequeno e não rouba o centro;
- [ ] nenhuma letra legível em nenhum jornal.

---

## 10. Arte do nível 2 e 3 — pedida em 18/09/2026

Duas mudanças pedidas pelo dono do projeto depois de jogar o nível 1:

1. **Cada nível tem a sua praça.** O `bg-praca.png` fica no nível 1; entram
   `bg-escola.png` (nível 2) e `bg-rua.png` (nível 3).
2. **Quem arremessa é o carteiro**, não um carrinho. O carrinho em `Graphics`
   sai, e o `carteiro.png` é **refeito inteiro** com as poses do arremesso.

| # | Arquivo | Dimensão | Grade | Fundo | O que é | Estado |
|---:|---|---:|---|---|---|---|
| 7 | **`carteiro.png`** *(refaz o #2)* | **1200 × 800** | **4 × 2** de **300 × 400** | alfa real | as 8 poses, **inclusive o arremesso** | ✅ |
| 8 | `bg-escola.png` | 1672 × 941 | imagem única | opaco | o pátio da escola — nível 2 | ✅ |
| 9 | `bg-rua.png` | 1672 × 941 | imagem única | opaco | a rua da prefeitura e do posto — nível 3 | ⬜ **falta** |

> **O que a entrega de 18/09/2026 ensinou:**
>
> - **`carteiro.png` veio 1200 × 800**, célula de 300 × 400, e não o quadrado de
>   256 que o contrato pedia. Deu certo, mas obrigou a tirar todo
>   `setDisplaySize` quadrado do código — a largura passa a sair da altura pela
>   proporção 3:4. **Célula não quadrada é aceitável; achatar não.**
> - **`bg-escola.png` veio com a linha do chão em 0,7354**, não em 0,70. Em vez
>   de regerar, o código passou a guardar a fração **por fundo** (`BACKDROPS`) e
>   a recalcular o chão a cada nível. A exigência abaixo continua valendo como
>   pedido — mas agora ela não é mais fatal.
> - **`pessoas.png` foi regerado** e as quatro pessoas ganharam alturas
>   diferentes de verdade (216 a 253 px de alfa). **Arte regerada invalida toda
>   medida**: o `PEOPLE_BOX` teve de ser refeito inteiro, e a folha nova tinha o
>   mesmo nome e o mesmo tamanho da antiga.

> **A REGRA QUE NÃO PODE SER QUEBRADA NOS DOIS FUNDOS NOVOS: a linha do chão
> fica em 0,70 da altura da folha**, igual à do `bg-praca.png` (medido: 0,7024).
> É esse número que vira o `GROUND_Y = 506` do código, e é onde os pés de todo
> mundo pousam. Um horizonte 40 px mais alto num nível põe a praça inteira
> flutuando.

> **E os três fundos têm o mesmo esqueleto:** metade de cima é céu VAZIO (é o
> corredor do arco), o cenário mora nas bordas e é baixo, o terço de baixo é
> chão liso, e o canto inferior esquerdo fica livre — é onde o carteiro fica de
> pé para arremessar.

---

### 10.1 `carteiro.png` — as oito poses

**1024 × 512 · grade 4 × 2 de 256 · alfa real · insubstituível**

Substitui a folha de 4 quadros. **Tem de ser uma geração só**: os quadros do
arremesso pedidos à parte chegariam com outra roupa, outro boné e outro tamanho.

A ordem é row-major e é contrato com o código:

| # | Linha/coluna | Pose | Onde aparece |
|---:|---|---|---|
| 0 | 1ª, 1ª | **entregando** | tela da banca: os dois braços oferecendo |
| 1 | 1ª, 2ª | **pronto** | praça: jornal enrolado na mão, olhando para o alto à direita |
| 2 | 1ª, 3ª | **armando** | o braço vai para trás |
| 3 | 1ª, 4ª | **soltando** | braço esticado para a frente e para cima, jornal saindo |
| 4 | 2ª, 1ª | **acompanhando** | o braço cruza o corpo, tronco torcido |
| 5 | 2ª, 2ª | **recarregando** | tirando outro jornal da bolsa |
| 6 | 2ª, 3ª | **comemorando** | braços para cima, boné pulando |
| 7 | 2ª, 4ª | **cabisbaixo** | boné nas mãos, cabeça baixa |

**Os quadros 2, 3 e 4 são um movimento só**, e nos três **os pés ficam no mesmo
lugar**: quem gira é o tronco e o braço. Se ele andar de lado entre os quadros,
o arremesso vira um pulo.

**No quadro 3 a mão tem de estar alta e à frente**, na altura da cabeça ou acima
— é dali que o jornal sai, e é essa a posição que o código vai medir para achar
o ponto de largada do arco.

#### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. One single wobbly
hand-drawn black outline of uneven thickness, like a marker pen held by a kid;
FLAT solid bright colours with NO shading, NO gradients and NO highlights
anywhere; the colour filled in loosely, the colour blocks sitting slightly off
the outline like a colouring book filled in by hand; naive simple faces — two
small solid black dot eyes, a big open happy mouth, a round pink blush circle on
each cheek; hair drawn as loose scribbled loops; simple rounded arms and legs
with small hands and feet; a big head on a small body. Take ONLY the art style
from the attached image: do NOT copy its characters, their clothes, their poses,
their scene or its framing.

Sprite sheet, 4 columns by 2 rows, 256x256 px per cell, the same character at
the same scale and the same flat drawing style in every cell, transparent
background, no grid lines drawn, no cell borders, no ground shadow.

The SAME cheerful young postal carrier in all eight cells: full body, a
mustard-yellow uniform shirt, dark navy shorts, brown shoes, a soft navy and
yellow postal cap, and a big pale canvas mail satchel hanging across the body on
the LEFT shoulder in every single cell. He faces to the RIGHT in every cell. The
uniform, the cap, the satchel and his height must be identical in all eight
cells.

Cell 1 — OFFERING: both arms held out forward, palms up, offering something, big
open smile, strong pink blush circles.
Cell 2 — READY: standing upright, a rolled newspaper held in his right hand down
by his side, looking up and to the upper right, mouth a small determined line.
Cell 3 — WIND UP: the right arm swung back behind his head, the rolled newspaper
next to his ear, body leaning back slightly, eyes narrowed in concentration.
Cell 4 — RELEASE: the right arm thrown forward and UPWARD at about forty degrees,
fully extended, the open hand HIGH, at head height or above, the rolled newspaper
just leaving the fingertips, body leaning forward, mouth open in effort, two
small straight motion ticks behind the arm.
Cell 5 — FOLLOW THROUGH: the right arm swung down and across the body, torso
twisted, hand empty, a happy open smile.
Cell 6 — RELOADING: reaching into the mail satchel with one hand and pulling out
another rolled newspaper, looking down at the bag.
Cell 7 — CHEERING: both arms thrown up, cap lifting slightly off the head, eyes
drawn as two happy upward curves, big open smile, three tiny motion ticks.
Cell 8 — CRESTFALLEN: cap held in both hands at chest height, head lowered,
shoulders dropped, eyes two small empty circles, small embarrassed wavy smile and
a single cartoon sweat drop. Sheepish about his own mistake, NOT angry and NOT
scolding.

Cells 3, 4 and 5 are one single throwing motion: HIS FEET MUST STAY IN EXACTLY
THE SAME PLACE in those three cells, only the torso and the arm move.

DO NOT INCLUDE: shading, cel shading, shadows on the figure, gradients, glossy
highlights, smooth even vector outlines, thin elegant line art, anime or manga
eyes, big glossy eyes with highlights, white sticker keyline, a bicycle, a mail
van, a postbox, a cart, a trolley, a slingshot, a catapult, a bat, a ball,
ground, pavement, buildings, scenery, ground shadow, a different uniform or a
different satchel side between cells, feet moving between the throwing cells,
crying, tears, angry face, scolding, wagging finger, pointing at the viewer,
text, letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, stars, HUD, question mark button, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, muddy colours, 3D render, photorealistic,
blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell
borders, gaps, cropped edges, drop shadow on the cell, white backing in
transparent assets.
~~~

#### Conferência

- [ ] 8 células, 4 colunas × 2 linhas, na ordem da tabela;
- [ ] mesma roupa, mesmo boné, mesma bolsa no mesmo ombro nas oito;
- [ ] **os pés no mesmo lugar nos quadros 3, 4 e 5**;
- [ ] no quadro 4 a mão está ALTA e à frente, na altura da cabeça ou acima;
- [ ] as mãos vazias no quadro 1 — o jornal da banca é `Graphics`;
- [ ] sem carrinho, sem estilingue, sem bicicleta;
- [ ] alfa real, sem chão, sem sombra.

---

### 10.2 `bg-escola.png` — o pátio da escola (nível 2)

**1672 × 941 · imagem única · opaco · importante**

- **A linha do chão em 0,70 da altura**, igual à do nível 1.
- O nível 2 fala da quadra, dos robôs da escola e do ônibus: o lugar é o
  **pátio**, visto de lado, de manhã.
- Bordas: o prédio da escola à direita, um muro baixo com portão à esquerda.
  **Nada alto no meio** e **nada em pé no canto inferior esquerdo**, onde fica o
  carteiro.
- Precisa **não se parecer com a praça**: lá era pastel com coreto e árvores
  redondas; aqui o chão é **quadra pintada** e a cor dominante é outra.

#### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. Wobbly hand-drawn black
outlines of uneven thickness, like a marker pen held by a kid; FLAT solid bright
colours with NO shading, NO gradients and NO highlights anywhere; the colour
filled in loosely, sitting slightly off the outline like a colouring book filled
in by hand. Here the outlines must be THINNER and calmer than on a character,
because this is the backdrop everything else is drawn on top of. Take ONLY the
art style from the attached image: do NOT copy its characters, their poses,
their scene or its framing.

Wide background illustration, 16:9, seen from the side like a flat stage, very
simple and sparse, with large calm empty areas where game elements will sit.

A cheerful primary school yard on a bright clear morning, seen straight from the
side. THE GROUND LINE — where the back wall meets the yard floor — MUST SIT AT
EXACTLY 70 PERCENT OF THE IMAGE HEIGHT, running straight across the whole width.

Above that line, the top 45 percent of the image is EMPTY open sky in one single
flat pale blue with nothing drawn in it at all — no clouds, no birds, no wires,
no flags in the middle. A long low plain wall runs along the back. A simple
two-storey school building with square windows and a small pitched roof sits
ONLY at the far RIGHT edge. A low wall with a simple metal gate and one tall
thin flagpole with a plain flag sits ONLY at the far LEFT edge. A basketball
hoop on a post stands low on the right, close to the building.

Below the ground line, the lower third is a wide flat sports court floor in a
soft terracotta orange, with two thin white painted court lines and a simple
painted centre circle, and nothing else on it — no benches, no bins, no cones,
no balls.

The far LEFT of the image at ground level is clear open court with nothing
standing on it.

Everything is evenly lit and completely flat: no shadows anywhere in the scene.

DO NOT INCLUDE: shading, cel shading, cast shadows, gradients, glossy
highlights, textured paper, crayon texture, pencil hatching, scribbled fill,
clouds, people, children, characters, animals, birds, cars, bicycles, balls,
cones, benches, bins, lamp posts, trees in the middle, a bandstand, a gazebo, a
park, anything in the middle of the sky, anything standing in the middle of the
court, anything standing at the lower left, night, neon, glowing signs, text,
letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, stars, HUD, question mark button, white sticker keyline, painterly
lineless illustration, soft airbrushed gradients, heavy rendering, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise, cropped
edges.
~~~

#### Conferência

- [ ] **a linha do chão bate em 0,70 da altura** — meça antes de aceitar;
- [ ] o céu do meio está vazio;
- [ ] o canto inferior esquerdo está livre;
- [ ] o chão de quadra é liso e claro o bastante para os controles por cima;
- [ ] **não parece a praça do nível 1**;
- [ ] nenhuma pessoa no desenho.

---

### 10.3 `bg-rua.png` — a rua da prefeitura e do posto (nível 3)

**1672 × 941 · imagem única · opaco · importante**

- **A linha do chão em 0,70 da altura.**
- O nível 3 é sobre **de onde a notícia veio**, e as duas origens fortes são a
  prefeitura e o posto de saúde. Então elas ficam desenhadas na tela o tempo
  todo, uma de cada lado — a criança decide olhando para as duas.
- Fim de tarde, céu mais quente: o terceiro nível tem de parecer outra hora do
  dia.

#### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: a child's felt-tip doodle drawing. Wobbly hand-drawn black
outlines of uneven thickness, like a marker pen held by a kid; FLAT solid bright
colours with NO shading, NO gradients and NO highlights anywhere; the colour
filled in loosely, sitting slightly off the outline like a colouring book filled
in by hand. Here the outlines must be THINNER and calmer than on a character,
because this is the backdrop everything else is drawn on top of. Take ONLY the
art style from the attached image: do NOT copy its characters, their poses,
their scene or its framing.

Wide background illustration, 16:9, seen from the side like a flat stage, very
simple and sparse, with large calm empty areas where game elements will sit.

A quiet small-town street in the late afternoon, seen straight from the side.
THE GROUND LINE — where the buildings meet the pavement — MUST SIT AT EXACTLY 70
PERCENT OF THE IMAGE HEIGHT, running straight across the whole width.

Above that line, the top 45 percent of the image is EMPTY open sky in one single
flat warm peachy orange with nothing drawn in it at all — no clouds, no birds,
no wires, no sun disc in the middle.

At the far LEFT edge stands a small town hall: a simple pale civic building with
four thin columns, a low triangular pediment and a plain round clock face with no
numbers and no hands. At the far RIGHT edge stands a small health centre: a
simple flat white building with a wide doorway and a plain red cross shape on its
front wall. Between them, only a low plain garden wall and two very short square
hedges, all well below the middle of the image.

Below the ground line, the lower third is a wide flat pavement in one flat warm
grey, completely empty — no kerb stones drawn, no paving joints, no benches, no
bins, no lamp posts, no cars.

The far LEFT of the image at ground level is clear open pavement with nothing
standing on it.

Everything is evenly lit and completely flat: no shadows anywhere in the scene,
even though it is late afternoon.

DO NOT INCLUDE: shading, cel shading, cast shadows, long shadows, gradients,
glossy highlights, sunset gradient in the sky, textured paper, crayon texture,
pencil hatching, scribbled fill, clouds, people, characters, animals, birds,
cars, bicycles, ambulances, market stalls, lamp posts, bins, fountains, statues,
trees in the middle, a bandstand, a gazebo, a school, a basketball hoop,
anything in the middle of the sky, anything standing in the middle of the
pavement, anything standing at the lower left, night, neon, glowing signs, shop
signage, text, letters, words, labels, digits, numbers, captions, clock numbers,
clock hands, watermark, logo, title lettering, user interface, buttons, panels,
frames, speech bubbles, arrows, icons, stars, HUD, question mark button, white
sticker keyline, painterly lineless illustration, soft airbrushed gradients,
heavy rendering, muddy colours, 3D render, photorealistic, blur, lens flare,
heavy noise, cropped edges.
~~~

#### Conferência

- [ ] **a linha do chão bate em 0,70 da altura**;
- [ ] o céu do meio está vazio, e é laranja quente — outra hora do dia;
- [ ] dá para reconhecer **prefeitura à esquerda** e **posto de saúde à
      direita** sem uma letra escrita;
- [ ] o canto inferior esquerdo está livre;
- [ ] nenhuma pessoa no desenho.

---

## 11. Depois que a arte chegar

1. **Meça a caixa alfa** das doze células de `pessoas.png` e dos quatro quadros
   de `carteiro.png` com o script do `PLANEJAMENTO MODAL.md` §7. Guarde `dx`,
   `dy`, `w`, `h` e a **base** de cada uma.
2. **`originY = 1` com o `footPad` medido**: as doze pessoas têm de pisar na
   mesma linha de chão. Quatro px de diferença numa fila de três já lê como
   defeito de desenho.
3. **`originX` sai do centro da caixa alfa**, não do centro da célula — senão a
   pessoa **desliza de lado** quando troca de estado, e no estado `informado`,
   que é mais largo por causa do jornal, isso é garantido se você ancorar pela
   célula.
4. **Uma escala só para a família**, tirada da **maior** altura medida. O rapaz
   alto tem de continuar sendo o mais alto: normalizar cada pessoa pela própria
   altura apaga os quatro tipos.
5. **`carteiro.png` é a exceção:** são quatro estados do mesmo corpo, então
   ancore pela **célula**, não pela caixa alfa — no quadro `comemorando` os
   braços sobem e a caixa alfa cresce para cima, e ancorar por ela faria o
   carteiro afundar no chão a cada comemoração.
6. **Amostre a cor** do uniforme do carteiro e das quatro roupas direto do PNG
   com `GetPixel` e ponha os valores em `data/theme.ts`. O halo do `informado`,
   a plaquinha âmbar e o varal têm de falar a mesma língua do desenho.
7. **Confira no celular**, com a praça por trás: **reduza `pessoas.png` a 51 px
   de altura** e olhe as três colunas de uma linha. Se você hesitar entre
   `informado` e `confuso`, o desenho volta — é essa distinção que o jogo
   inteiro existe para mostrar.
