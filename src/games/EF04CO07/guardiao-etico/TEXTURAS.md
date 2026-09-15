# Guardião Ético — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF04CO07/guardiao-etico/`

**Quatro arquivos para jogar, mais a capa do catálogo.**

> **A unidade de custo é o arquivo, não o desenho.** Uma folha de dezesseis
> células custa a mesma geração que um ícone solto — então tudo que é pequeno e
> do mesmo estilo entra na mesma folha. É por isso que os nove destinos e os
> dezesseis quadros do elenco são dois arquivos, e não vinte e cinco.

> **Nada aqui é obrigatório para o jogo rodar.** Toda a interface é `Graphics` e
> há reserva desenhada para os quatro arquivos: o nível 1 é jogável e vencível
> com a pasta vazia. A arte entra para o jogo deixar de parecer interface e
> passar a parecer o clube.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `bg-clube.png` | 1672 × 941 | imagem única | opaco | a sala do clube: parede calma em cima, mesa de madeira embaixo |
| 2 | `colegas.png` | 1152 × 1152 | 4 × 4 de 288 | alfa real | os quatro colegas, cada um em quatro estados |
| 3 | `destinos.png` | 768 × 768 | 3 × 3 de 256 | alfa real | os nove lugares para onde uma cópia pode ir |
| 4 | `acervo.png` | 1024 × 1024 | 2 × 2 de 512 | alfa real | o que aparece DENTRO da cópia: o parque e o dragão |
| 5 | `cover-guardiao-etico.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**O #2 é o mais importante e o mais difícil.** A cara dos quatro é a regra do
jogo: se as quatro linhas não se lerem a 52 px de altura num celular, o jogo
perde a mecânica, não o acabamento.

O **#4 é o que pode esperar**: sem ele a cópia mostra um retângulo de reserva com
o nome do conteúdo e o jogo continua inteiro.

### O que é `Graphics`, e por quê

- **as três etiquetas**, porque elas são mostradores de estado — acesa, apagada,
  pulsando, e o pictograma muda de preenchimento junto;
- **a cópia** inteira: o cartão, a tarja que cobre os rostos, as tiras de marca
  que entram e saem, a sombra dela na mesa;
- **a porta do destino**, que abre, fecha e segura a cópia na soleira;
- **a prateleira** e cada cópia guardada — elas são o placar, e placar muda;
- o balão, o bilhete, o cadeado, o rabicho, o `?`, o cabeçalho, as vidas, as
  bolinhas de fase, as estrelas, as faíscas, o confete e a moldura da tela.

**A foto do passeio não é um PNG.** Ela é o parque (#4) com os quatro colegas
desenhados por cima, em pequeno, tirados da mesma folha #2 — porque os rostos
precisam poder **sumir atrás de uma tarja** quando a etiqueta `ROSTOS` está
apagada, e porque a mesma cara tem de aparecer na foto e na fileira de cima.

---

## 1. As quatro regras que governam esta arte

> **1. A cara é a mecânica.**

Nos quatro estados, o que muda é grande e legível de longe: ombros, braços,
cabeça, olhos. Nada de diferença que só exista na sobrancelha — no celular, a
figura tem 45 × 52 px reais, e uma sobrancelha ali não existe.

> **2. Nenhuma letra em nenhum arquivo.**

Nem na lista, nem no jornal, nem na camiseta de ninguém, nem no cartaz do pátio.
Letra dentro de PNG vira lixo por baixo do texto de verdade, e neste jogo o texto
é o que muda a cada toque. Onde o desenho precisar parecer escrito, use **linhas
cinzas onduladas**, como fazem as outras capas do catálogo.

> **3. Ninguém aponta, ninguém julga.**

Nenhum personagem faz cara de bravo com quem está jogando, nenhum dedo em riste,
nenhum `X` vermelho, nenhuma carinha chorando. O colega exposto **se protege**;
o colega contrariado **cruza os braços**. Este jogo não dá bronca em criança —
é a diferença entre ensinar ética e dar sermão.

> **4. O clube é dos meninos e meninas, não é um escritório.**

Sala de clube de jogos numa escola: mesa grande, tapete, caixas de jogo
empilhadas, um cartaz de cortiça vazio ao fundo. Nada de tela de computador com
interface, nada de janela de programa, nada de ícone de aplicativo.

---

## 2. Estilo e paleta

Visual: **jogo 2D infantil polido**, formas arredondadas, áreas foscas amplas,
contorno firme, leitura fácil em celular. Luz quente vinda de cima à esquerda.

| Uso | Hex |
|---|---|
| contorno | `#2a2233` |
| parede do clube | `#dfe6ee` |
| sombra na parede | `#c6d2e0` |
| madeira da mesa | `#8a5f3c` |
| tampo da mesa | `#a97a4f` |
| papel da cópia | `#fffaf0` |
| cortiça | `#c9a06a` |
| acerto (código) | `#4eaa78` |
| dica e TRAVA (código) | `#e59a52` |
| seleção e foco (código) | `#4b8fe0` |
| recusa (código) | `#d4626a` |

### Negativo comum a todos os arquivos

~~~text
text, letters, words, labels, digits, numbers, captions, signature, watermark,
logo, brand, user interface, app window, browser, toolbar, menu bar, app icons,
computer screen with interface, cursor, mouse pointer, emoji, speech bubble,
thought bubble, red X mark, green check mark, warning sign, exclamation mark,
angry face pointing at the viewer, crying child, scolding adult,
HUD, life icon, heart meter, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard,
3D render, photorealistic, blur, lens flare, noise, gradient banding.
~~~

Se o gerador não entregar transparência real, peça sobre magenta `#FF00FF` e
remova a cor.

---

## 3. `bg-clube.png` — a sala do clube

### Contrato

| Campo | Exigência |
|---|---|
| tamanho | 1672 × 941, paisagem, borda a borda |
| fundo | opaco |
| **faixa dos colegas** | y 8 %–32 %, x 28 %–80 %: parede **lisa e vazia**, onde os quatro ficam de pé |
| **a mesa** | y 36 %–60 %: tampo de madeira atravessando a tela, **liso**, onde a cópia é desenhada |
| **coluna da direita** | x 78 %–100 %, y 8 %–60 %: parede calma, onde o jogo desenha a porta e a prateleira |
| **canto esquerdo** | x 0 %–26 %, y 10 %–38 %: parede calma, onde fica o balão |
| clima | clube de jogos de escola: caixas de jogo empilhadas no chão, tapete, uma plantinha |

Mais da metade da imagem é "lugar onde o jogo desenha". O que a arte entrega é a
**sala em volta** — e a mesa, que é a única coisa que encosta em desenho do
código.

> **A regra da emenda:** a cópia é `Graphics` deitada sobre a mesa que é PNG. Por
> isso o tampo tem de ser **liso, de tom uniforme e sem sombra pintada no meio**:
> a sombra da cópia é desenhada pelo jogo, e duas sombras diferentes na mesma
> madeira é a primeira coisa que o olho acha.

### Prompt copiável

~~~text
A cosy school game-club room background for a children's game, exactly 1672 by
941 pixels, landscape, fully opaque. Calm light blue-grey walls #dfe6ee, a warm
wooden floor with a soft round rug, a stack of closed plain board-game boxes in
the lower left corner, a small potted plant, warm light falling from the upper
left.

THE UPPER MIDDLE OF THE WALL MUST STAY EMPTY: from x=28% to x=80% and y=8% to
y=32% leave plain, clean, undecorated wall — no posters, no pictures, no shelves,
no windows. Characters will stand there.

The RIGHT COLUMN, x=78% to 100%, y=8% to 60%, must also stay plain empty wall,
and so must the LEFT CORNER, x=0% to 26%, y=10% to 38%. The game draws things
over both.

Across the middle, from y=36% to y=60%, there is a LARGE WOODEN TABLE seen from
the front, spanning the whole width: warm wood #a97a4f with a darker front edge
#8a5f3c, visible grain, one soft even highlight. Its surface must be COMPLETELY
EMPTY and FLAT — no objects, no papers, no cards, no painted shadows in the
middle of the tabletop.

Polished flat 2D children's game art, rounded shapes, broad matte colour areas,
dark outline #2a2233 on the major shapes, gentle warm ambient light. Friendly and
calm. Readable when scaled down to a 390-pixel-wide mobile display.

Negative: posters on the wall, framed pictures, windows, computer, monitor,
screen, interface, papers or objects on the table, painted shadows on the
tabletop, clutter, text, letters, numbers, logo, HUD, grid, 3D, photorealism,
blur, watermark.
~~~

### Conferência

- [ ] a faixa de parede do meio está **vazia de verdade**;
- [ ] o tampo da mesa está limpo e de tom uniforme, sem sombra pintada;
- [ ] a coluna da direita e o canto esquerdo estão calmos;
- [ ] lê-se "clube de jogos" em dois segundos, e não "sala de aula".

---

## 4. `colegas.png` — os quatro, e a cara deles

**É o arquivo que carrega a mecânica.** Cada coluna é uma pessoa; cada linha é um
estado que o jogo troca dezenas de vezes por partida.

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1152 × 1152 |
| grade | 4 colunas × 4 linhas; células de 288 × 288 |
| fundo | alfa real |
| enquadramento | **meio corpo**, da cintura para cima, centrado, mesma escala nas 16 células |
| direção | todos virados ligeiramente para a **frente-esquerda**, na direção da mesa |

| Coluna | Personagem |
|---:|---|
| 1 | **Téo**, menino de 9 anos, cabelo escuro curto, camiseta listrada |
| 2 | **Bia**, menina de 10 anos, cabelo cacheado preso, jardineira |
| 3 | **Rafa**, menino de 10 anos, óculos, cabelo crespo, camiseta lisa verde |
| 4 | **Duda**, menina de 9 anos, tranças, camiseta com um dinossauro |

| Linha | Estado | O que o corpo faz | Quando o jogo usa |
|---:|---|---|---|
| 1 | **calmo** | de pé, ombros soltos, olhando para a mesa, sorriso leve | o tempo todo |
| 2 | **contente** | acena com uma das mãos, cabeça um pouco inclinada, sorriso grande | quando autorizou, e no acerto |
| 3 | **encolhido** | ombros para dentro, **as duas mãos cobrindo metade do rosto**, corpo um palmo menor, olhar para baixo | quando fica exposto |
| 4 | **chateado** | **braços cruzados**, boca de lado, sobrancelhas caídas, olhando para o lado | quando o pedido dele foi recusado |

Três exigências que decidem se a folha serve:

1. **As quatro células de uma coluna são a MESMA pessoa**: mesma roupa, mesma
   altura de cabeça, mesma distância da cintura à base da célula. O jogo troca o
   quadro no mesmo lugar, e qualquer deslocamento vira um pulo.
2. **Os estados 3 e 4 se leem pela silhueta.** Tape o rosto com o polegar: ainda
   dá para dizer qual é o encolhido e qual é o de braços cruzados. Se não der, a
   mecânica morre no celular.
3. **Ninguém acusa ninguém.** O encolhido se protege, o chateado se fecha. Nada
   de dedo apontado, nada de choro, nada de cara de bravo para quem joga.

### Prompt copiável

~~~text
Create ONE character sprite sheet on a grid of 4 columns by 4 rows, exactly 1152
by 1152 pixels, each cell exactly 288 by 288, TRUE transparent PNG background, no
cell borders and no gaps. Four friendly Brazilian children, each drawn FOUR times
down their own column, from the waist up, centred in the cell, all at the SAME
scale, all turned slightly towards the front-left.

Column 1 — Téo, a cheerful 9-year-old boy, short dark hair, striped t-shirt.
Column 2 — Bia, a 10-year-old girl, curly hair tied up, denim dungarees.
Column 3 — Rafa, a 10-year-old boy with glasses and short curly hair, plain green
t-shirt.
Column 4 — Duda, a 9-year-old girl with braids, t-shirt with a small dinosaur.

Row 1 (CALM) — standing relaxed, shoulders loose, looking down towards a table,
soft smile.
Row 2 (HAPPY) — waving with one hand, head slightly tilted, big warm smile.
Row 3 (SHRINKING BACK) — shoulders pulled in, BOTH HANDS COVERING HALF OF THE
FACE, body noticeably smaller and lower in the cell, eyes looking down,
uncomfortable but not crying.
Row 4 (UPSET) — ARMS FIRMLY CROSSED, mouth pressed to one side, eyebrows down,
looking away to the side, sulking but gentle.

CRITICAL: within each column all four drawings are the SAME child at the SAME
scale, same clothes, same head size, waist at the SAME height in the cell — only
pose and expression change. Rows 3 and 4 must be recognisable from the SILHOUETTE
alone, at very small size.

Polished flat 2D children's game art, rounded friendly proportions, broad matte
colours, dark outline #2a2233, soft upper-left light, very expressive faces and
body language, warm and kind. Nobody points at the viewer, nobody scolds, nobody
cries.

Negative: pointing fingers, angry faces towards the viewer, tears, crying,
scolding, red X marks, speech bubbles, emoji, held objects, phones, papers,
text, letters, numbers, logos on clothes, shadows painted on the ground, cell
borders, grid, 3D, photorealism, blur, watermark.
~~~

### Conferência

- [ ] as quatro células de cada coluna são inequivocamente a mesma criança;
- [ ] a cintura está na mesma altura nas 16 células;
- [ ] encolhido e chateado se distinguem **de silhueta**, com o rosto tapado;
- [ ] ninguém aponta, ninguém chora, ninguém repreende;
- [ ] a 52 px de altura (o tamanho real no celular) ainda dá para dizer quem está
      encolhido.

---

## 5. `destinos.png` — os nove lugares

Cada pedido mostra, na porta da direita, **para onde a cópia vai**. É a
informação que muda o veredito (§8 do planejamento), então o pictograma tem de
dizer o lugar sem uma letra.

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 768 × 768 |
| grade | 3 colunas × 3 linhas; células de 256 × 256 |
| fundo | alfa real |
| estilo | objetos isolados, mesma escala aparente, mesmo traço |

| Célula | Destino | Alcance | Desenho |
|---:|---|---|---|
| 1 | o mural da sala | turma | quadro de cortiça pequeno com dois prendedores, vazio |
| 2 | o caderno do clube | turma | caderno aberto, folhas lisas |
| 3 | o mural da festa | escola | quadro com bandeirinhas de festa junina em volta, vazio |
| 4 | o jornal da escola | escola | jornal dobrado, colunas indicadas por **linhas cinzas onduladas** |
| 5 | o cartaz do pátio | escola | cavalete com uma folha grande e lisa |
| 6 | o grupo dos pais | família | celular de frente, tela lisa com três balõezinhos vazios |
| 7 | a van do tio | fora | van escolar de perfil, amigável |
| 8 | o site de figurinhas | fora | tela de computador com um álbum de figurinhas aberto ao lado |
| 9 | o concurso da cidade | fora | um prédio de prefeitura simpático com uma faixa lisa e uma fita de prêmio |

Uma exigência: **os quatro "fora" não podem parecer maus.** A van é simpática, o
site é colorido, a prefeitura é alegre. O jogo não ensina que a internet é
perigosa — ensina que dado de outra pessoa não vai para longe sem ela combinar.

### Prompt copiável

~~~text
Create ONE icon sprite sheet on a grid of 3 columns by 3 rows, exactly 768 by 768
pixels, each cell exactly 256 by 256, TRUE transparent PNG background, no cell
borders and no gaps. Nine friendly objects in one consistent style, each centred
and filling most of its cell:

Cell 1 — a small empty cork notice board with two round pins, warm wooden frame.
Cell 2 — an open notebook with completely blank pages.
Cell 3 — an empty notice board framed by small triangular party bunting flags.
Cell 4 — a folded newspaper, its columns suggested ONLY by soft grey wavy lines,
never by letters.
Cell 5 — a wooden easel holding one large blank sheet of paper.
Cell 6 — a chunky friendly mobile phone seen from the front, plain screen with
three small EMPTY rounded chat bubbles.
Cell 7 — a cheerful little school van seen from the side.
Cell 8 — a friendly desktop computer screen next to an open sticker album with
blank colourful sticker shapes.
Cell 9 — a cheerful small town-hall building with a blank banner and a round
prize ribbon.

Polished flat 2D children's game art, rounded shapes, broad matte colours, dark
outline #2a2233, soft upper-left light, cheerful palette. All nine objects look
friendly and inviting — none of them should look dangerous, dark or scary.

Negative: text, letters, numbers, captions, app icons, interface elements inside
the phone or computer, warning signs, padlocks, dark or menacing atmosphere,
frames around the cells, grid, visible cell borders, 3D, photorealism, blur,
watermark.
~~~

### Conferência

- [ ] os nove se leem a 73 × 46 px reais, que é o tamanho da porta no celular;
- [ ] nenhum deles tem letra, nem no jornal, nem na faixa, nem na tela;
- [ ] os quatro de "fora" parecem simpáticos;
- [ ] o mural da sala e o mural da festa não se confundem.

---

## 6. `acervo.png` — o que aparece dentro da cópia

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1024 × 1024 |
| grade | 2 colunas × 2 linhas; células de 512 × 512 |
| fundo | alfa real |
| estilo | ilustração cheia, sem moldura, sem legenda |

| Célula | Imagem | Onde é usada |
|---:|---|---|
| 1 | **o parque do passeio**: gramado, árvores, um lago ao fundo, banco de praça — **e nenhuma pessoa** | o fundo da foto do nível 1; os quatro colegas entram por cima, desenhados pelo jogo |
| 2 | **o dragão do Rafa**: desenho de criança de 10 anos, giz de cera, dragão verde sorrindo | a peça do nível 3 |
| 3 | **a mesa da festa junina**: bolo, quentão, milho, bandeirinhas | reserva: o cabeçalho da lista do nível 2 |
| 4 | **a caixa de jogos do clube** | reserva |

Duas exigências:

1. **A célula 1 não tem gente.** Se vierem crianças pintadas no parque, os quatro
   sprites por cima viram oito crianças, e a tarja que cobre os rostos deixa
   quatro rostos descobertos — a mecânica inteira cai.
2. **A célula 2 tem de parecer feita por uma criança**, não por um ilustrador:
   traço trêmulo, cor saindo da linha, papel de caderno. É ela que faz a autoria
   do Rafa ser acreditável.

### Prompt copiável

~~~text
Create ONE sprite sheet on a grid of 2 columns by 2 rows, exactly 1024 by 1024
pixels, each cell exactly 512 by 512, TRUE transparent PNG background, no cell
borders and no gaps. Four illustrations, each centred and filling most of its
cell:

Cell 1 — a sunny park scene: green lawn, two or three round leafy trees, a small
lake in the background, one park bench. ABSOLUTELY NO PEOPLE, no children, no
adults, no animals — the park must be completely empty.

Cell 2 — a CHILD'S OWN DRAWING of a friendly green dragon, as if drawn with wax
crayons by a ten-year-old on a sheet of notebook paper: wobbly outlines, colour
going outside the lines, simple shapes, cheerful.

Cell 3 — a Brazilian June-festival table: a cake, a jug of hot spiced drink, corn
cobs, small triangular bunting flags above.

Cell 4 — a stack of closed, plain board-game boxes.

Cells 1, 3 and 4 in polished flat 2D children's game art, rounded shapes, broad
matte colours, dark outline #2a2233, soft upper-left light. Cell 2 deliberately
in a naive child's crayon style, clearly different from the others.

Negative: people in the park, children, figures, animals, text, letters, numbers,
captions, frames, picture borders, photo corners, drop shadows on the cell, grid,
visible cell borders, 3D, photorealism, blur, watermark.
~~~

---

## 7. `cover-guardiao-etico.png` — a capa

1672 × 941, opaca, no mesmo estilo. A cena: a **mesa do clube** vista de frente,
com uma foto de papel no meio e uma mão infantil pousada nela; os **quatro
colegas** atrás, três sorrindo e **uma com as mãos no rosto**; à direita, uma
portinhola de onde sai um envelope. Luz quente, clima de "peraí, deixa eu
pensar".

A capa precisa contar o jogo sem uma palavra: **tem gente dentro do que você vai
mandar.** Se o gerador insistir em escrever no papel, peça o papel com **manchas
e linhas onduladas** no lugar do texto — é assim que as outras capas do catálogo
resolvem.

---

## 8. Depois que a arte chegar

1. Medir a **caixa alfa** de cada quadro num canvas e ancorar o layout nela, em
   vez de chutar `setScale`. As dimensões entregues **nunca** batem com as
   pedidas: em outro jogo deste projeto vieram 1480 × 1040 no lugar de 1024 × 768,
   e o que salvou foi o jogo se guiar pelos números medidos, guardados num
   `data/art.ts`.
2. Conferir que a **cintura** dos 16 quadros do elenco cai na mesma fração da
   célula. Se não cair, corrigir no `data/art.ts` com um deslocamento por linha —
   nunca esticando o PNG.
3. Conferir no celular, com a tarja preta: o colega a 45 × 52 px reais ainda tem
   cara; a porta a 73 × 46 px ainda diz que lugar é aquele; a cópia a 168 × 79 px
   ainda mostra qual marca entrou.
4. **A reserva em `Graphics` fica.** É ela que mantém o jogo de pé quando um
   arquivo falta, e o `import.meta.glob` já prevê isso.
