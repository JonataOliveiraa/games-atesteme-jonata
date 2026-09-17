# Revezamento em Lista — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO01/revezamento-em-lista/`

**Quatro arquivos para jogar, mais a capa do catálogo.**

> **O estilo é o da imagem de referência, e ela vai anexada em TODAS as
> gerações.** É a ilustração das três crianças dividindo o lanche com o menino e
> o cachorrinho: **pintura macia de livro infantil / filme de animação, sem
> contorno de tinta**. Os prompts abaixo mandam, na primeira linha, usar a
> imagem anexada como referência de estilo — o texto só descreve o que ela já
> mostra, para o caso de o gerador ignorar o anexo.
>
> **Este jogo sai da linha visual da família**, que é cartoon com contorno de
> tinta (Guardião Ético, Mesa de Edição, Expedição Pixel). É escolha do dono do
> projeto, e tem ganho e preço:
>
> - **ganho:** rosto e volume muito mais bonitos, e um acabamento de filme que
>   nenhum contorno dá;
> - **preço:** figura pequena sem contorno perde silhueta. Aqui isso é resolvido
>   no código, não na arte — a ficha tem moldura, sombra e fundo na cor do time
>   desenhados em `Graphics`, e a característica de cada nadador tem um
>   pictograma próprio ao lado do rosto. A arte pode ser macia porque o
>   contorno da leitura é o cartão, não o desenho.

> **O jogo roda inteiro com zero PNG.** A tira, os pinos, os números, o banco, o
> apito, a água, as raias e a espuma nascem em `Graphics`; as texturas só trocam
> os personagens e o fundo.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `nadadores.png` | 1536 × 1024 | 6 × 4 de 256 | alfa real | os seis nadadores: busto (a ficha) e três poses de nado |
| 2 | `rival.png` | 768 × 256 | 3 × 1 de 256 | alfa real | o time adversário — um nadador serve para todos |
| 3 | `tecnica.png` | 2500 × 550 | 5 × 1 de 500 × 550 | alfa real | a treinadora: 0–2 de perfil (jogo), 3–4 de frente (tutorial) |
| 4 | `bg-parque.png` | 1672 × 941 | imagem única | opaco | o parque aquático, com a piscina **vazia** |
| 5 | `cover-revezamento-em-lista.png` ✔ | 1672 × 941 | imagem única | opaco | a capa do catálogo, com letreiro |

**O #1 é o que carrega a mecânica**: a **linha 0** é a cara que aparece na ficha,
e é por ela que o Nível 3 pede (*"o de óculos cansou"*); as **linhas 1 a 3** são
a execução da lista, que é a prova do acerto.

**O #4 e o #3 podem esperar.** Sem o fundo, o parque é um degradê com
arquibancada em blocos; sem a técnica, o balão sai de uma silhueta.

### O que é `Graphics`, e por quê

- **a tira** — ficha, moldura, sombra, brilho de selecionada, o número da
  posição e o giro da renumeração;
- **os pinos numerados** e o acender do que está sob o dedo;
- **o banco e o cadeado**, o **apito** e os estados dele;
- **a água inteira** — raias, boias, ondulação, espuma, rastro, salpico, parede
  de chegada e blocos de partida;
- **o balão do pedido**, a seta e o pictograma da operação;
- **bolinhas de volta, vidas, estrelas, `?`, moldura da tela, bóia do erro,
  confete e a linha do tempo da reprise**.

> **Nenhuma letra e nenhum número em PNG nenhum.** O número da posição é a coisa
> que mais muda no jogo inteiro; um número pintado no desenho seria uma mentira
> parada por baixo do número de verdade.

---

## 1. As cinco regras que governam esta arte

> **1. O estilo é o da imagem anexada, e só dela.**

Pintura macia, sem contorno de tinta, luz quente e difusa, rosto expressivo de
olhos grandes e brilhantes, proporções fofas de criança. **Da imagem se tira o
ACABAMENTO, nunca a cena**: nem as três crianças, nem o menino sentado, nem o
cachorro, nem a calçada, nem o enquadramento.

> **2. Nenhum nadador traz água.**

Sem espuma, sem respingo, sem bolha, sem sombra azul embaixo do corpo. A água é
`Graphics` e ondula; PNG com água própria cria a costura que o olho acha
primeiro — foi o buraco de terra do Pulo Programado.

> **3. A característica é uma mancha de cor, não um detalhe.**

A ficha tem 134 px na grade com a lista cheia: **40 px reais no celular**. Num
estilo sem contorno isso é ainda mais sério. Então a característica é listra
grossa, óculos enormes, cabelo solto, chama estampada — e o rosto entra sobre o
cartão colorido, que é quem dá a silhueta. Diferença que só existe na
sobrancelha não existe.

> **4. A Bia é alta DENTRO da célula.**

A altura é a característica dela, e é a única que a arte pode estragar sozinha.
Ela ocupa mais altura da célula que os outros cinco, inclusive no busto — e o
código **não** normaliza altura: ancora pelo queixo, medido por caixa alfa (§8).

> **5. Todo mundo veste camiseta de time. Esta é a regra que não se negocia.**

São crianças de 9 anos, e o assunto é natação: o gerador escorrega para maiô
justo, corpo à mostra e pose de modelo se não for barrado. Aqui o uniforme é
**camiseta de lycra de manga curta na cor do time, com bermuda de natação** —
roupa de verdade de criança em aula de natação, cobre o corpo e ainda resolve a
leitura, porque dá uma **área grande de cor** que identifica cada um a 40 px.
Isso está no negativo dos cinco prompts.

---

## 2. Estilo e paleta

### A imagem de referência vai anexada em TODAS as gerações

Guarde a ilustração das três crianças em `references/` — fora de `src/`, para
não entrar no bundle — como `references/16-criancas.jpg`, e **anexe sempre a
mesma**, nos cinco prompts. Os blocos das seções 3 a 7 já começam mandando usar
o anexo como referência de estilo; não há nada para colar por cima.

Em palavras, para o caso de o gerador ignorar o anexo:

- **pintura digital macia, sem contorno**: a forma nasce da luz e da cor, não de
  uma linha;
- **sombreado com aerógrafo**, bordas suaves, luz de contorno quente e uma
  segunda luz mais fria de rebote;
- **rosto semi-realista estilizado**: olhos grandes e brilhantes com reflexo
  nítido, nariz pequeno, boca pequena, bochecha rosada;
- **proporções fofas de criança**, cabeça grande, mãos e pés roliços;
- **paleta quente e lavada**: pêssego, coral, creme, verde-água, azul suave;
- **peles variadas e quentes**, crianças brasileiras comuns;
- **grão bem leve** e pontinhos de brilho no ar.

### As cores do jogo

| Uso | Hex |
|---|---|
| água clara (código) | `#5ec8e8` |
| água funda (código) | `#2f9fd0` |
| boia da raia (código) | `#f4a259` |
| azulejo da borda | `#f3e2cd` |
| céu | `#ffd9ae` |
| arquibancada | `#e9a58c` |
| ficha (código) | `#fffaf0` |
| ficha na mão (código) | `#ffe9a8` |
| pino e foco (código) | `#4b8fe0` |
| acerto (código) | `#4eaa78` |
| erro e TRAVA (código) | `#e36a5c` |
| dica (código) | `#e59a52` |
| contorno da ficha (código) | `#2a3550` |

A camiseta de cada nadador é a identidade dele, e é também a cor do cartão —
precisa vir na arte exatamente assim:

| Nadador | Característica | Camiseta |
|---|---|---|
| Nina | touca listrada vermelha e branca | `#ef5b4c` |
| Téo | óculos de natação enormes e amarelos | `#3f7fd6` |
| Bia | a mais alta | `#2fbfa8` |
| Lila | ruiva, sem touca | `#8a63d2` |
| Rafa | chama estampada no peito | `#f2922e` |
| Duda | touca de bolinhas | `#ef5fa0` |
| rival | touca azul-marinho lisa | `#2f4470` |

### A linha de estilo — já está dentro dos cinco prompts

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: soft painted children's-book / animated-film illustration
with NO ink outlines at all; volume built from soft airbrushed shading, gentle
warm rim light and a cooler bounce light; slightly stylised semi-realistic
faces with large glossy eyes and crisp highlights, small soft noses, round
blushed cheeks; chunky rounded child proportions; warm palette of peach, coral,
cream, teal and soft blue; warm varied skin tones; soft diffused daylight; a
very light grain. Same finish, same level of detail, same softness as the
attached image.
Take ONLY the art style from the attached image: do NOT copy its characters,
their clothes, their poses, its scene, its composition or its framing. All
characters here are ordinary Brazilian children, about 9 years old.
~~~

### O negativo — também já embutido nos cinco prompts

~~~text
DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
signature, watermark, logo, brand, title lettering,
user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars,
medals, scoreboard, timer, lane numbers, HUD, life icon, question mark button,
water, pool water, splashes, foam, bubbles, water droplets, wet reflections,
blue shadow under the body, lane ropes, starting blocks,
swimsuit, one-piece swimsuit, bikini, trunks only, bare torso, bare chest,
exposed midriff, tight swimwear, model pose, pin-up pose, cocked hip,
close-up of a body, sultry expression,
sad faces, crying, angry faces, villain expressions, scolding adults,
pointing at the viewer, adult proportions, teenagers, adults as swimmers,
black ink outlines, comic line art, cel-shading, flat vector art, anime style,
3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets,
painted checkerboard on the alpha.
~~~

Se o gerador não entregar transparência real, peça sobre magenta `#FF00FF`
chapado, **sem sombra e sem reflexo dessa cor no personagem**, e remova a cor.
Fundo branco é pior: branco é cor de touca, de dente e de listra, e o recorte
come pedaço do desenho.

---

## 3. `nadadores.png` — os seis, e a mecânica

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1536 × 1024 |
| grade | 6 colunas × 4 linhas; células de 256 × 256 |
| fundo | alfa real |
| índice do quadro | `frame = linha × 6 + coluna` — é contrato com o código |
| escala | a mesma nas 24 células, salvo a altura da Bia (regra 4) |

| Coluna | Nadador | O que se vê |
|---:|---|---|
| 0 | **Nina** | touca com listras grossas vermelhas e brancas, camiseta vermelha |
| 1 | **Téo** | óculos de natação enormes e amarelos, touca azul lisa, camiseta azul |
| 2 | **Bia** | a mais alta de todas, touca verde-água lisa, camiseta verde-água |
| 3 | **Lila** | ruiva, **sem touca**, cabelo preso num rabo de cavalo, camiseta roxa |
| 4 | **Rafa** | touca laranja lisa e uma chama estampada no peito da camiseta laranja |
| 5 | **Duda** | touca rosa de bolinhas brancas grandes, camiseta rosa |

| Linha | Pose | Enquadramento | Onde o jogo usa |
|---:|---|---|---|
| 0 | **busto** | cabeça e ombros, de frente, sorrindo | a ficha da tira e a do banco |
| 1 | **mergulho** | corpo inteiro de lado, braços esticados juntos à frente, em diagonal | a largada de cada perna |
| 2 | **braçada A** | de lado, horizontal, braço direito à frente, cabeça virada respirando | o nado |
| 3 | **braçada B** | de lado, horizontal, braço esquerdo à frente, cabeça baixa | o nado |

Nas linhas 1 a 3 todos nadam **para a direita** — é o sentido da raia.

Três exigências que decidem se a folha serve:

1. **As quatro células de uma coluna são a MESMA criança**: mesma touca, mesma
   cor de camiseta, mesmo tom de pele, mesmo cabelo.
2. **A linha 0 se lê a 40 px.** Reduza a folha a 16% e tape o nome com o dedo:
   ainda tem que dar para dizer quem é o de óculos, quem é a ruiva, quem é a
   listrada.
3. **A Bia é maior na célula** nas quatro linhas.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: soft painted children's-book / animated-film illustration
with NO ink outlines at all; volume built from soft airbrushed shading, gentle
warm rim light and a cooler bounce light; slightly stylised semi-realistic faces
with large glossy eyes and crisp highlights, small soft noses, round blushed
cheeks; chunky rounded child proportions; warm palette; warm varied skin tones;
soft diffused daylight; a very light grain.
Take ONLY the art style from the attached image: do NOT copy its characters,
their clothes, their poses, its scene or its framing.

Draw ONE character sprite sheet on a grid of 6 columns by 4 rows, exactly 1536
by 1024 pixels, each cell exactly 256 by 256, TRUE transparent background, no
cell borders, no gaps, no grid lines drawn.

Six cheerful Brazilian children, about 9 years old, on a swimming team. Every
child wears a SHORT-SLEEVED TEAM RASH GUARD SHIRT in their own colour with
knee-length swim shorts — proper modest swim-class clothing that covers the
body. Each column is one child, drawn four times down that column: same child,
same cap, same shirt colour, same skin tone, same hair in all four cells.

Column 1 — girl in a swim cap with thick red and white stripes, red shirt.
Column 2 — boy wearing huge yellow swim goggles, plain blue cap, blue shirt.
Column 3 — girl who is clearly TALLER than every other child here, longer neck
and higher shoulders, plain teal cap, teal shirt.
Column 4 — red-haired girl with NO cap at all, ginger hair in a low ponytail,
freckles, purple shirt.
Column 5 — girl in a plain orange cap, with a small flame printed on the chest
of her orange shirt.
Column 6 — boy in a pink cap covered with big white polka dots, pink shirt.

Each row is one pose, the same for all six columns:
Row 1 — BUST: head and shoulders only, facing the viewer, warm smile, centred.
Row 2 — DIVE: full body seen from the side, arms stretched forward together,
body in a diagonal, heading to the RIGHT.
Row 3 — STROKE A: full body from the side, horizontal, swimming to the RIGHT,
right arm reaching forward, head turned sideways taking a breath.
Row 4 — STROKE B: full body from the side, horizontal, swimming to the RIGHT,
left arm reaching forward, head down.

CRITICAL: all six children are drawn at the SAME scale in every row, EXCEPT the
child in column 3, who must read as visibly taller in all four of her cells.
CRITICAL: each child must be recognisable by a single loud feature at very small
size — only column 2 wears goggles, only column 4 has no cap.
CRITICAL: there is NO WATER anywhere in this image — no pool, no splashes, no
foam, no bubbles, no droplets, no blue shadow under the swimmers.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
signature, watermark, logo, brand, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, medals, scoreboard, lane numbers,
water, pool water, splashes, foam, bubbles, water droplets, wet reflections,
blue shadow under the body, lane ropes, starting blocks,
swimsuit, one-piece swimsuit, bikini, trunks only, bare torso, bare chest,
exposed midriff, tight swimwear, model pose, pin-up pose, close-up of a body,
goggles on any child except column 2, a cap on column 4,
sad faces, crying, angry faces, adult proportions, teenagers, adults,
black ink outlines, comic line art, cel-shading, flat vector art, anime style,
3D render, photorealistic, blur, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets.
~~~

### Se a folha de 24 células voltar bagunçada

Gere em duas passadas, com o **mesmo bloco de estilo e as mesmas seis descrições
de coluna**, e monte depois no canvas de 1536 × 1024:

- **passada A:** `6 columns by 1 row, 1536 by 256` — só a linha do busto;
- **passada B:** `6 columns by 3 rows, 1536 by 768` — as três poses de nado.

Não peça um nadador por vez. Pedir de um em um ("agora faça o próximo igual ao
anterior") é onde a consistência morre, e aqui ela é a mecânica: seis crianças
que precisam parecer do mesmo time.

### Conferência

- [ ] o acabamento é o da imagem anexada: macio, sem contorno de tinta, luz
      quente — se voltou com linha preta em volta das figuras, o prompt não foi
      seguido;
- [ ] 1536 × 1024, células de 256 batendo, sem borda desenhada;
- [ ] as quatro células de cada coluna são inequivocamente a mesma criança;
- [ ] a coluna 3 é visivelmente mais alta nas quatro linhas;
- [ ] a coluna 4 é a única sem touca; a coluna 2, a única de óculos;
- [ ] todos de camiseta de time, corpo coberto;
- [ ] nenhuma gota, espuma ou sombra azul em célula nenhuma;
- [ ] reduzindo a folha a 16%, ainda dá para dizer quem é quem pela linha 0;
- [ ] todos nadam para a **direita** nas linhas 1 a 3;
- [ ] transparência real, sem fundo branco por baixo.

---

## 4. `rival.png` — o outro time

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 768 × 256 |
| grade | 3 colunas × 1 linha; células de 256 × 256 |
| fundo | alfa real |
| quadros | 0 mergulho · 1 braçada A · 2 braçada B |

Um nadador só serve para o time inteiro: na raia de baixo eles se revezam, e a
criança nunca precisa distinguir um do outro. A touca azul-marinho é a única
coisa que os identifica — o rival não é personagem, é ritmo.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: soft painted children's-book / animated-film illustration
with NO ink outlines at all; soft airbrushed shading, warm rim light, large
glossy eyes with crisp highlights, small soft nose, round blushed cheeks, chunky
rounded child proportions, warm palette, soft diffused daylight, very light
grain. Take ONLY the art style from the attached image: do NOT copy its
characters, their clothes, their poses or its scene.

Draw ONE sprite sheet on a grid of 3 columns by 1 row, exactly 768 by 256
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no grid lines.

The SAME child in all three cells: a Brazilian child of about 9 years old on a
swimming team, wearing a plain NAVY BLUE swim cap and a short-sleeved NAVY BLUE
team rash guard shirt with knee-length swim shorts — modest swim-class clothing
that covers the body. Focused and friendly, never angry, never mocking.

Cell 1 — DIVE: full body from the side, arms stretched forward together, body in
a diagonal, heading to the RIGHT.
Cell 2 — STROKE A: horizontal, swimming to the RIGHT, right arm forward, head
turned sideways breathing.
Cell 3 — STROKE B: horizontal, swimming to the RIGHT, left arm forward, head
down.

CRITICAL: same child, same scale in all three cells.
CRITICAL: NO WATER anywhere — no pool, no splashes, no foam, no bubbles, no
droplets, no blue shadow under the body.

DO NOT INCLUDE: water, pool, splashes, foam, bubbles, droplets, blue shadow,
lane ropes, text, letters, numbers, logos, watermark, grid lines, cell borders,
swimsuit, bare torso, bare chest, exposed midriff, model pose,
angry or mocking face, villain look, adult proportions, teenager,
black ink outlines, comic line art, cel-shading, flat vector art, anime style,
3D render, photorealistic, blur.
~~~

### Conferência

- [ ] o mesmo acabamento macio do `nadadores.png`;
- [ ] 768 × 256, três células iguais em escala;
- [ ] a mesma criança nas três, de touca azul-marinho e camiseta do time;
- [ ] simpática e concentrada — nada de vilão;
- [ ] nada azul debaixo do corpo, nenhuma gota;
- [ ] nada para a direita.

---

## 5. `tecnica.png` — quem faz o pedido

### Contrato da folha (entregue)

| Campo | Exigência |
|---|---|
| canvas | 2500 × 550 |
| grade | 5 colunas × 1 linha; células de 500 × 550 |
| fundo | alfa real |
| enquadramento | da cintura para cima, na mesma escala nas cinco células |

| Quadro | Pose | Onde o jogo usa |
|---:|---|---|
| 0 | braços cruzados, **de perfil** para a direita | o pedido de cada volta |
| 1 | joinha, de perfil | a volta certa |
| 2 | mão levantada, de perfil | a trava e os avisos |
| 3 | **de frente**, mão no peito, explicando | a fala do tutorial |
| 4 | **de frente**, braços abertos, convidando | a pausa entre as falas do tutorial |

Os três primeiros olham para o balão, que fica à direita deles. Os dois últimos
olham para a criança — é a diferença entre *a treinadora pedindo dentro do jogo*
e *a treinadora ensinando o jogo*.

O balão sai dela, então ela olha para onde o texto está. A prancheta pode
aparecer, mas **em branco** — o que está escrito é o pedido, e o pedido é texto
de verdade, no balão.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: soft painted children's-book / animated-film illustration
with NO ink outlines at all; soft airbrushed shading, warm rim light, large
glossy eyes with crisp highlights, round blushed cheeks, warm palette, soft
diffused daylight, very light grain. Take ONLY the art style from the attached
image: do NOT copy its characters, their clothes, their poses or its scene.

Draw ONE sprite sheet on a grid of 2 columns by 1 row, exactly 512 by 256
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no grid lines.

The SAME character in both cells, same scale, waist up, turned slightly to the
RIGHT: a young, warm, friendly Brazilian swimming coach, hair in a bun, teal
sports polo shirt, a whistle hanging on her neck, holding a small blank
clipboard.
Cell 1 — TALKING: explaining, open friendly smile, one hand pointing at the
clipboard.
Cell 2 — CHEERING: both arms up, eyes closed with joy, big happy smile.

CRITICAL: the clipboard is completely BLANK — no writing, no lines, no numbers.

DO NOT INCLUDE: text, letters, numbers, writing on the clipboard, speech
bubbles, logos, watermark, grid lines, cell borders, whistle in the mouth,
angry or scolding expression, pointing at the viewer, ground shadow,
white background, black ink outlines, comic line art, cel-shading, flat vector
art, anime style, 3D render, photorealistic, blur.
~~~

### Conferência

- [ ] o mesmo acabamento macio das outras duas folhas;
- [ ] 512 × 256, as duas células na mesma escala;
- [ ] a mesma pessoa nas duas, mesma roupa e mesmo cabelo;
- [ ] prancheta em branco, sem um risco;
- [ ] virada para a direita, sem apontar para quem joga;
- [ ] a 124 px de altura (37 px reais) a alegria da célula 1 ainda se lê.

---

## 6. `bg-parque.png` — o parque, com a piscina vazia

### Contrato

| Campo | Exigência |
|---|---|
| dimensão | 1672 × 941 (16:9), opaco |
| faixa de cima | céu e arquibancada com plateia em silhueta suave |
| faixa do meio | a piscina **vazia**, só o azulejo do fundo, azul-claro liso |
| faixa de baixo | borda molhada de azulejo bege, uma toalha dobrada num canto |

Onde cada faixa vai parar, na grade de 1280 × 720:

| y na grade | O que cobre essa faixa | O que a arte precisa fazer |
|---:|---|---|
| 100–196 | o balão do pedido | ficar calma, de baixo contraste: a frase mora aqui |
| 206–486 | a água inteira, em `Graphics` | só o azulejo do fundo, **nada de água pintada** |
| 496–688 | a tira da escalação | borda molhada, sem objeto chamativo |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: soft painted children's-book / animated-film illustration
with NO ink outlines at all; soft airbrushed shading, warm diffused afternoon
light, warm palette of peach, coral, cream and teal, very light grain. Take
ONLY the art style from the attached image: do NOT copy its characters, its
scene or its framing.

Draw a wide horizontal background illustration, exactly 1672 by 941 pixels,
16:9, opaque, of a cheerful children's water park on a sunny afternoon, seen
from the side, with NO characters at all.

Top band: warm sky with soft clouds, and a small stand of bleachers with a crowd
suggested only as soft blurred silhouettes.
Middle band: the swimming pool completely EMPTY — no water at all — showing only
its plain light blue tiled floor and walls.
Bottom band: the wet beige tiled pool deck, with a folded towel in one corner.

CRITICAL: the middle and top bands will be covered by game elements, so they
must be calm, low contrast and free of eye-catching detail.
CRITICAL: the pool holds NO WATER — no blue surface, no ripples, no reflections,
no lane ropes, no lane markings.

DO NOT INCLUDE: water, ripples, reflections, lane ropes, lane markings,
swimmers, people in focus, characters, text, letters, numbers, scoreboard,
signs, flags with writing, logos, watermark, user interface,
high contrast details in the centre, dark shadows, black ink outlines,
comic line art, cel-shading, flat vector art, 3D render, photorealistic, blur.
~~~

### Conferência

- [ ] o mesmo acabamento macio dos personagens — fundo e figura têm que parecer
      do mesmo filme;
- [ ] 16:9, e nada importante nos 5% das bordas;
- [ ] a piscina está **vazia**, sem uma gota e sem raia desenhada;
- [ ] a faixa do balão é calma o bastante para uma frase por cima;
- [ ] nenhuma pessoa em foco, nenhum rosto legível na arquibancada;
- [ ] nenhuma placa, bandeira ou letreiro.

---

## 7. `cover-revezamento-em-lista.png` — a capa

### Contrato

| Campo | Exigência |
|---|---|
| dimensão | 1672 × 941, opaco |
| o que precisa ler em miniatura | **uma fila de crianças em ordem, e uma entrando no meio dela** |

A capa não é uma piscina bonita: é a lista. Se em tamanho de miniatura a pessoa
não vir uma fila com alguém entrando nela, a capa falhou.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its
rendering exactly: soft painted children's-book / animated-film illustration
with NO ink outlines at all; soft airbrushed shading, warm rim light, large
glossy expressive eyes, round blushed cheeks, chunky rounded child proportions,
warm palette, soft diffused daylight, very light grain. Take ONLY the art style
from the attached image: do NOT copy its characters, their clothes, their poses,
its scene or its framing.

Draw a horizontal cover illustration, 1672 by 941 pixels, opaque, for a
children's educational game about lists.

Three cheerful Brazilian child swimmers, about 9 years old, in different
coloured swim caps and short-sleeved team rash guard shirts, stand lined up in a
row along the pool edge, in the order they will swim, smiling. A fourth child
swimmer is in mid-air, being placed INTO THE MIDDLE of that line. Beside them a
young coach in a teal sports polo points at the spot in the line. Behind them, a
swimming pool with lanes and soft blurred bleachers.

CRITICAL: the thing that must read at thumbnail size is the LINE of children in
order and the one entering the middle of it.

DO NOT INCLUDE: text, letters, numbers, title lettering, logos, watermark, user
interface, buttons, scoreboard, medals, swimsuit, bare torso, exposed midriff,
model pose, cluttered composition, sad or angry faces, adult proportions,
black ink outlines, comic line art, cel-shading, flat vector art, anime style,
3D render, photorealistic, blur.
~~~

### Conferência

- [ ] em 200 px de largura ainda se vê a fila e quem entra nela;
- [ ] nenhuma letra, nenhum número;
- [ ] as crianças parecem do mesmo time do `nadadores.png`.

---

## 8. Depois que a arte chegar

**Meça o sprite, não chute.** Meça a caixa alfa de cada quadro e guarde o
resultado em `data/cast.ts`, em fração da célula. O layout se ancora nisso, e
não no tamanho do arquivo:

- o **busto** é ancorado pelo queixo, para a Bia continuar mais alta sem empurrar
  as outras fichas para baixo;
- o **nado** é ancorado pela linha do quadril, que define a altura do corpo
  dentro da raia;
- se um arquivo for trocado, **as caixas são medidas de novo** — margem
  transparente diferente move tudo.

Depois da medição:

- [ ] o busto mais alto e o mais baixo não estouram a ficha de 176 px;
- [ ] os três quadros de nado do mesmo nadador têm a mesma linha de quadril;
- [ ] a folha aparece na lista `WANTED` do `BootScene`, carregada por
      `import.meta.glob`, e nenhum `import` estático aponta para arte;
- [ ] tirando os PNGs da pasta, o jogo continua abrindo e jogável com o
      placeholder de `Graphics`;
- [ ] o peso somado da pasta fica abaixo de 1,5 MB.

**Um ajuste que o estilo macio exige no código:** como o desenho não traz
contorno, a ficha precisa dar a silhueta. O cartão entra com fundo na cor do
time, borda de 3 px em `#2a3550`, sombra projetada e o pictograma da
característica ao lado do rosto. Sem isso, seis rostos macios lado a lado a 40
px viram seis manchas parecidas.

### Placeholder, enquanto não existir PNG

- ficha = cartão arredondado na cor da camiseta, com o nome e o pictograma da
  característica desenhado (listras, óculos, chama, bolinhas, cabelo, seta para
  cima);
- nadador na água = cápsula na cor da camiseta, com a touca da característica;
- técnica = silhueta com prancheta;
- cenário = degradê de céu com arquibancada em blocos.
