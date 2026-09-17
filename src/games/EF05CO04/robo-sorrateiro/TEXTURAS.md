# Robô Sorrateiro — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO04/robo-sorrateiro/`

**Cinco arquivos para jogar, mais a capa do catálogo.**

> **O estilo é o da imagem de referência, e ela vai anexada em TODAS as
> gerações**: pintura macia de livro infantil / filme de animação, **sem
> contorno de tinta**. Cada prompt abaixo já vem inteiro — estilo, corpo e
> negativo —, para ser copiado e colado sem montar nada por cima.
>
> **Consequência no código:** sem contorno, figura pequena perde silhueta. Quem
> dá a borda é o `Graphics` — a carta tem moldura e sombra, a coruja tem aro, o
> robô tem um halo suave quando está escondido.

> **O jogo roda inteiro com zero PNG.** Cartas, trilho, aro de tempo, cone de
> visão, trajeto pontilhado, placas `SE?`, `zzz` e moldura nascem em `Graphics`; as
> texturas só trocam os personagens, os móveis e o fundo.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `robo.png` | 1280 × 256 | 5 × 1 de 256 | alfa real | o robô: parado, dois passos, agachado e polegar |
| 2 | `corujas.png` | 768 × 512 | 3 × 2 de 256 | alfa real | as três corujas, dormindo e acordadas |
| 3 | `moveis.png` | 1024 × 256 | 4 × 1 de 256 | alfa real | os esconderijos e a porta de saída |
| 4 | `moveis-com-robo-escondido.png` | 768 × 256 | 3 × 1 de 256 | alfa real | os MESMOS três esconderijos, com o robô dentro |
| 5 | `bg-biblioteca.png` | 1672 × 941 | imagem única | opaco | a biblioteca à noite, vista de cima, **com o meio livre** |
| 6 | `mel.png` | 2500 × 550 | 5 × 1 de 500 × 550 | alfa real | a inventora: 0–2 de perfil (jogo), 3–4 de frente (tutorial) |
| 7 | `cover-robo-sorrateiro.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

**O #2 é o que carrega a mecânica**: a coruja dormindo e a coruja acordada são a
condição do `SE` — se os dois estados não se distinguirem **de relance e de
longe**, o jogo inteiro para de funcionar.

**O #5 e o #6 podem esperar.** Sem o fundo, a sala é piso em degradê com
estantes em blocos; sem a Mel, o tutorial fala de uma silhueta.

### O que é `Graphics`, e por quê

- **as cartas** — moldura, as duas linhas e a linha que **acende** no passo em
  que ela decide;
- **o aro de tempo** da coruja e o **cone de visão**;
- **o trajeto pontilhado, as placas `SE?`, a faixa do trecho que acende e a marca da porta**;
- **a frase da missão no alto da tela** e o **balão de fala do robô**;
- **o `zzz`**, a poeirinha do passo, o halo de escondido;
- **bolinhas de sala, vidas, estrelas, `?`, moldura da tela e confete**.

> **Nenhuma letra em PNG nenhum.** O texto das cartas muda de nível para nível e
> acende por ramo; letra pintada no desenho vira lixo por baixo do texto de
> verdade.

---

## 1. As cinco regras que governam esta arte

> **1. Dormindo e acordada têm que se ler a 45 px.**

É o tamanho real da coruja no celular. A diferença não pode estar só nos olhos:
**dormindo** é olho fechado **e corpo murcho, cabeça baixa, penas para baixo**;
**acordada** é olho arregalado **e corpo esticado, cabeça alta, penas
eriçadas**. Tape a cara com o polegar — ainda tem que dar para dizer qual é
qual.

> **2. A coruja não é assustadora.**

Ela ri quando pega o robô, não grita. Nada de sobrancelha franzida, garra
aberta, bico escancarado ou olho vermelho. É brincadeira de esconde-esconde numa
biblioteca, não terror.

> **3. A biblioteca é noite ACOLHEDORA, não escuro.**

Luz quente de abajur, sombras azuis suaves, madeira e tapete. Se a sala ficar
escura, o robô some e o jogo fica triste — e o jogo é uma travessura.

> **4. O meio do fundo fica livre.**

O trajeto do robô mora entre `y=300` e `y=520` da grade, e as cartas sobem por
cima da sala inteira. Estante, lustre e pilha de livros ficam **nas bordas**; o
centro é chão.

> **5. Nenhum móvel traz o robô, e o robô não traz móvel.**

O robô se esconde **atrás** da caixa desenhada em cima dele pelo código. Se a
caixa vier com um robô dentro, ou o robô vier com uma caixa, não dá para
compor — e a pose de agachado precisa servir para os três esconderijos.

---

## 2. Estilo e paleta

### As DUAS imagens de referência vão anexadas em TODAS as gerações

São duas, e vão **juntas** nos seis prompts: a folha de figurinhas chibi e as
tirinhas da personagem de cabelo verde-azulado — guardar como
`references/16-chibi-figurinhas.jpg` e `references/17-chibi-tirinha.jpg`.

Em palavras, para o caso de o gerador ignorar o anexo: **chibi de figurinha**,
traço limpo de espessura uniforme num tom escuro dessaturado (**nunca preto
puro**), **cel shading chapado** — um único tom de sombra, nenhum degradê —,
cabeça grande e corpo pequeno, olhos enormes com um brilho, marquinhas de
emoção (brilhinhos, gota de suor, risquinhos de movimento), paleta curta com
uma cor de destaque sobre quase-branco e neutros escuros, e **contorno branco
de adesivo** em volta da silhueta.

> **O contorno branco de adesivo é só para o que tem alfa** — robô, corujas,
> móveis e Mel. O fundo da biblioteca e a capa são cena inteira: ali ele não
> entra, senão a sala vira uma figurinha colada na tela.

**O que isso muda no código:** com traço e keyline a figura pequena se destaca
sozinha. A carta em `Graphics` não precisa mais de borda grossa para salvar a
leitura — borda fina e fundo claro bastam, e o traço da arte é que carrega a
silhueta a 45 px.

### As cores do jogo

| Uso | Hex |
|---|---|
| madeira do piso | `#c99a63` |
| tapete | `#c96a5a` |
| parede/estante | `#6d5a73` |
| luz de abajur | `#ffd9ae` |
| sombra da noite (código) | `#3a3350` |
| trajeto pontilhado (código) | `#fff3d6` |
| placa `SE?` (código) | `#f4a259` |
| cone de visão (código) | `#ffe08a` |
| aro de tempo (código) | `#5ec8e8` |
| carta (código) | `#fffaf0` |
| ramo aceso (código) | `#4eaa78` |
| erro e TRAVA (código) | `#e36a5c` |
| contorno da carta (código) | `#2a3550` |

| Personagem | Traço | Cor |
|---|---|---|
| robô (sem nome) | robô redondo, uma antena com bolinha, rodinha no lugar dos pés | `#7fd1c9` |
| Ru | coruja parda, peito listrado, poleiro da estante | `#b08968` |
| Nina | coruja branca, cara de coração, no lustre | `#f2e7d9` |
| Zé | coruja laranja, tufos nas orelhas, na pilha de livros | `#f2922e` |
| Mel | inventora de 10 anos, macacão e óculos na testa | `#5aa9e6` |

---

## 3. `robo.png` — o robô

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1280 × 256 |
| grade | 5 colunas × 1 linha; células de 256 × 256 |
| fundo | alfa real |
| escala | o mesmo robô, do mesmo tamanho, nas cinco células |
| direção | virado para a **direita** (o trajeto anda para a direita) |

| Quadro | Pose | Onde o jogo usa |
|---:|---|---|
| 0 | parado, olhando para a frente, anteninha reta | na placa `SE?`, enquanto a criança escolhe — é o quadro que carrega o balão de fala |
| 1 | passo com a perna/rodinha adiantada, corpo inclinado à frente | andar |
| 2 | passo contrário, antena balançando para trás | andar |
| 3 | **agachado**, braços na cabeça, olhos espiando para cima | sobra de reserva: quem mostra o robô escondido é a folha #4 |
| 4 | de pé, **polegar para cima**, olhos felizes | trecho vencido |

O quadro 3 é o mais importante: ele aparece **por trás** de um móvel, então o
que precisa se ver é a **parte de cima** — cabeça, antena e olhos.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
images: do NOT copy their characters, their clothes, their poses, their scenes
or their framing.

Draw ONE sprite sheet on a grid of 5 columns by 1 row, exactly 1280 by 256
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no gaps, no grid lines drawn.

The SAME small friendly robot in all five cells, same size and same lighting,
facing RIGHT: a round mint-green robot about as tall as a toddler, smooth soft
body, one antenna with a little ball on top, two big glossy eyes on a darker
screen-face, short stubby arms, a single wheel instead of feet. Cute, harmless,
curious.

Cell 1 — STANDING still, looking ahead, antenna straight.
Cell 2 — WALKING: leaning forward, wheel turned, one arm swinging.
Cell 3 — WALKING the other beat: antenna tilted back, other arm swinging.
Cell 4 — CROUCHING low and hiding: arms over the head, body squashed down, only
the head and antenna high, eyes looking UP and to the side, worried but amused.
Cell 5 — STANDING and giving a THUMBS UP with one arm, eyes happy and curved.

CRITICAL: the same robot at the same scale in every cell; nothing else in the
image — no box, no crate, no furniture, no floor, no shadow on the ground.
CRITICAL: cell 4 must read from its TOP HALF alone, because the game draws a
box in front of the lower half.

DO NOT INCLUDE: boxes, crates, baskets, plants, furniture, floor, ground
shadow, background, text, letters, numbers, logos, watermark, grid lines,
cell borders, gaps, speech bubbles, arrows, icons, sparks, lightning bolts,
weapons, angry face, scary face, red glowing eyes, sharp teeth, human child,
animal, painterly lineless illustration, soft airbrushed gradients, heavy
rendering, western cartoon style, rough sketchy lines, uneven brush
outlines, muddy colours, 3D render, photorealistic, blur, heavy noise, white
backing in transparent assets.
~~~

### Conferência

- [ ] 1280 × 256, células de 256 batendo, sem borda desenhada;
- [ ] é o mesmo robô nas cinco, do mesmo tamanho;
- [ ] o quadro 3 se entende **só pela metade de cima**;
- [ ] virado para a direita em todos;
- [ ] nenhum móvel, nenhum chão, nenhuma sombra no chão;
- [ ] a 120 px de altura na grade (36 px reais) ainda dá para ver a antena e os
      olhos.

---

## 4. `corujas.png` — a condição do jogo

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 768 × 512 |
| grade | 3 colunas × 2 linhas; células de 256 × 256 |
| fundo | alfa real |
| índice do quadro | `frame = linha × 3 + coluna` — é contrato com o código |
| escala | a mesma nas seis células |

| Coluna | Coruja | O que se vê |
|---:|---|---|
| 0 | **Ru** | parda, peito listrado de bege, sobrancelhas grossas |
| 1 | **Nina** | branca, disco facial em forma de coração |
| 2 | **Zé** | laranja, dois tufos de pena nas orelhas |

| Linha | Estado | O corpo inteiro muda |
|---:|---|---|
| 0 | **dormindo** | olhos fechados em arco, cabeça baixa entre os ombros, corpo murcho e arredondado, penas lisas para baixo |
| 1 | **acordada** | olhos bem abertos e brilhantes, cabeça alta, pescoço esticado, corpo mais alto e estreito, penas eriçadas |

A diferença entre as duas linhas é a **silhueta**, não a cara: é ela que a
criança vê a 45 px do outro lado da sala.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
images: do NOT copy their characters, their clothes, their poses, their scenes
or their framing.

Draw ONE sprite sheet on a grid of 3 columns by 2 rows, exactly 768 by 512
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no gaps, no grid lines drawn.

Three cute cartoon owls, one per column, drawn twice down their own column:
Column 1 — a brown owl with a cream striped chest and thick eyebrows.
Column 2 — a white owl with a heart-shaped face disc.
Column 3 — an orange owl with two feather tufts on its head.

Row 1 — ASLEEP: eyes closed as soft curved lines, head sunk low between the
shoulders, body rounded and squat, feathers smooth and drooping, peaceful smile.
Row 2 — AWAKE: eyes wide open, round and glossy, head lifted high on a stretched
neck, body taller and narrower, feathers puffed up and alert, curious face.

CRITICAL: the difference between the two rows must be readable from the
SILHOUETTE alone at very small size — the asleep owl is a squat round blob, the
awake owl is tall and alert. Not only the eyes.
CRITICAL: the owls are friendly and playful, never scary; they are playing
hide-and-seek with a robot.
CRITICAL: same scale in all six cells, each owl alone in its cell, sitting
upright, facing the viewer slightly turned to the left.

DO NOT INCLUDE: perches, branches, shelves, lamps, books, furniture, floor,
ground shadow, background, ZZZ letters, sleep bubbles, speech bubbles,
vision cones, text, letters, numbers, logos, watermark, grid lines, cell
borders, gaps, angry eyebrows, red eyes, open sharp beak, claws out, scary
face, horror mood, painterly lineless illustration, soft airbrushed
gradients, heavy rendering, western cartoon style, rough sketchy lines,
uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy
noise, white backing in transparent assets.
~~~

### Conferência

- [ ] 768 × 512, seis células iguais em escala;
- [ ] tapando a cara com o polegar, ainda dá para dizer quem dorme e quem está
      acordada;
- [ ] as três corujas se distinguem entre si a 45 px;
- [ ] nenhuma é assustadora;
- [ ] nada de poleiro, galho, `zzz` ou cone desenhado;
- [ ] transparência real, sem fundo branco.

---

## 5. `moveis.png` — onde o robô se esconde

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1024 × 256 |
| grade | 4 colunas × 1 linha; células de 256 × 256 |
| fundo | alfa real |
| quadros | 0 caixa de papelão · 1 cesto de roupa · 2 vaso de planta · 3 porta de saída |
| vista | de cima em três quartos, a mesma da sala |

Os três primeiros são **esconderijos**, e o robô aparece **atrás** deles: a
parte de baixo de cada um precisa ser cheia e opaca, sem vão por onde se veja o
chão. A porta é a chegada: fechada, com maçaneta, e um friso de luz embaixo.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; chunky simplified shapes with rounded corners; a
short palette — one strong accent colour over near-white and dark neutrals; a
thin white sticker keyline around the whole silhouette. Take ONLY the art style
from the attached images: do NOT copy their characters, their scenes or their
framing.

Draw ONE sprite sheet on a grid of 4 columns by 1 row, exactly 1024 by 256
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no gaps, no grid lines drawn.

Four cosy library objects, seen from a high three-quarter angle, each alone and
centred in its cell, at the same scale and with the same lighting:
Cell 1 — an open cardboard box, flaps folded outwards, empty inside.
Cell 2 — a round wicker laundry basket with a soft blanket hanging over the rim.
Cell 3 — a big potted plant with wide round leaves in a terracotta pot.
Cell 4 — a closed wooden door with a round handle and a warm strip of light
under it, seen straight on.

CRITICAL: cells 1 to 3 must be SOLID and opaque in their lower half — the game
hides a robot behind them, and any gap would show the floor through it.
CRITICAL: nothing inside the box or the basket; no character, no robot, no
animal anywhere in the image.

DO NOT INCLUDE: robot, characters, animals, owls, people, floor, rug, ground
shadow, background wall, text, letters, numbers, labels on the box, logos,
watermark, grid lines, cell borders, gaps, arrows, icons, painterly lineless
illustration, soft airbrushed gradients, heavy rendering, western cartoon
style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render,
photorealistic, blur, heavy noise, white backing in transparent assets.
~~~

### Conferência

- [ ] 1024 × 256, quatro células na mesma escala e na mesma luz;
- [ ] a metade de baixo dos três esconderijos é cheia;
- [ ] nada dentro da caixa nem do cesto;
- [ ] a porta lê como "saída" sem nenhuma placa escrita;
- [ ] transparência real.

---

## 6. `moveis-com-robo-escondido.png` — o robô dentro do móvel

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 768 × 256 |
| grade | 3 colunas × 1 linha; células de 256 × 256 |
| fundo | alfa real |
| ordem | **a mesma de `moveis.png`**: 0 caixa · 1 cesto · 2 vaso |
| enquadramento | cada móvel no MESMO tamanho e na mesma posição da folha sem robô |

**É uma troca de peça, não uma sobreposição.** Quando a regra manda esconder, o
robô some e o móvel passa a ser este desenho. Por isso as duas folhas têm de
bater quadro a quadro: se a caixa daqui for maior que a de lá, o móvel dá um
pulo na hora de esconder.

**O rosto tem de aparecer.** A criança precisa ver QUEM se escondeu ali — olhos
e antena para fora, sempre. Foi essa folha que resolveu o problema antigo, em
que o robô ia para trás do móvel e sobrava só a antena.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; chunky simplified shapes with rounded corners; a
short palette — one strong accent colour over near-white and dark neutrals; a
thin white sticker keyline around the whole silhouette. Take ONLY the art style
from the attached images: do NOT copy their characters, their scenes or their
framing.

Draw ONE sprite sheet on a grid of 3 columns by 1 row, exactly 768 by 256
pixels, each cell exactly 256 by 256, TRUE transparent background, no cell
borders, no gaps, no grid lines drawn.

The SAME three cosy library objects as the other sheet, at the SAME size and
angle, but now with a small round mint-green robot hiding inside each one. The
robot has a smooth round body, one antenna with a little ball on top and two
big glossy eyes on a darker screen-face.
Cell 1 — an open cardboard box with the robot crouching inside it: head, eyes
and antenna above the rim, two little hands holding the edge.
Cell 2 — a round wicker laundry basket with a soft blanket over the rim and the
robot inside: head, eyes and antenna above the rim.
Cell 3 — a big potted plant with the robot crouching BESIDE the pot, half
hidden by the leaves: the whole head, the eyes and the antenna in plain view.

CRITICAL: in all three cells the robot's FACE must be fully visible — a child
has to see who is hiding there.
CRITICAL: same object, same size, same angle and same position in the cell as
in the sheet without the robot; only the robot is added.

DO NOT INCLUDE: other characters, owls, people, animals, floor, rug, ground
shadow, background wall, text, letters, numbers, labels, logos, watermark, grid
lines, cell borders, gaps, arrows, icons, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, western cartoon style, rough sketchy
lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur,
heavy noise, white backing in transparent assets.
~~~

### Conferência

- [ ] 768 × 256, células de 256 batendo, sem borda desenhada;
- [ ] a ordem é caixa, cesto, vaso — a mesma de `moveis.png`;
- [ ] o móvel tem o mesmo tamanho e a mesma posição das duas folhas (ponha uma
      por cima da outra: só o robô muda);
- [ ] os olhos e a antena aparecem nos três;
- [ ] a 104 px na grade (31 px reais) ainda dá para ver que tem alguém ali.

---

## 7. `bg-biblioteca.png` — a sala

### Contrato

| Campo | Exigência |
|---|---|
| dimensão | 1672 × 941 (16:9), opaco |
| vista | de cima em três quartos, como quem olha a sala do alto de uma escada |
| faixa do meio | **chão livre**: é por onde o robô anda |

Onde cada faixa cai, na grade de 1280 × 720:

| y na grade | O que cobre essa faixa | O que a arte precisa fazer |
|---:|---|---|
| 0–92 | o cabeçalho | pode ter estante e lustre, mas nada que peça atenção |
| 96–290 | os poleiros das corujas | prateleiras e móveis **bem nas bordas**, meio vazio |
| 300–520 | o trajeto do robô | **chão**: tapete e madeira, sem móvel nenhum |
| 530–596 | rodapé da sala | móveis baixos, sem contraste alto |
| 604–720 | o trilho do plano | fica coberto — pode ser chão liso |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: anime-style flat cel-shaded illustration; clean crisp line
art of even weight in a dark desaturated colour, never pure black; FLAT colour
fills with ONE soft shadow tone and no gradients; a short palette — warm accent
colours over near-white and dark neutrals; crisp shapes, no painterly
brushwork. NO white sticker keyline here — this is a full scene, not a sticker.
Take ONLY the art style from the attached images: do NOT copy their characters,
their scenes or their framing.

Draw a wide horizontal background illustration, exactly 1672 by 941 pixels,
16:9, opaque: a cosy children's library at night, seen from a high
three-quarter angle, with NO characters and NO robot.

Around the edges: tall warm wooden bookshelves full of colourful books, a small
hanging lamp glowing warm, a stack of books on the floor in a corner, a window
with a calm night sky.
Across the whole middle of the image: an EMPTY wooden floor with a soft red rug,
clean and uncluttered, because the game walks a character along it.

CRITICAL: the middle horizontal band of the image must be empty floor — no
furniture, no objects, no strong pattern, nothing that competes for attention.
CRITICAL: night but COSY and warm, never dark, never gloomy, never scary. Lamp
light pools on the floor; shadows are soft and blue-violet, not black.

DO NOT INCLUDE: characters, people, children, robots, owls, birds, animals,
boxes, baskets, potted plants in the centre, text, letters, numbers, book
titles, signs, logos, watermark, user interface, dotted paths, stars,
arrows, icons, vision cones, dark horror mood, black shadows, high contrast
details in the centre, painterly lineless illustration, soft airbrushed
gradients, heavy rendering, western cartoon style, rough sketchy lines,
uneven brush outlines, muddy colours, 3D render, photorealistic, blur.
~~~

### Conferência

- [ ] 16:9, e nada importante nos 5% das bordas;
- [ ] a faixa do meio é chão limpo, de ponta a ponta;
- [ ] é noite, mas dá vontade de entrar;
- [ ] nenhum livro com título legível, nenhuma placa;
- [ ] nenhuma coruja e nenhum robô desenhados no fundo.

---

## 8. `mel.png` — a inventora que ensina

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 2500 × 550 |
| grade | 5 colunas × 1 linha; células de 500 × 550 |
| fundo | alfa real |
| enquadramento | da cintura para cima, na mesma escala nas cinco células |

| Quadro | Pose | Onde o jogo usa |
|---:|---|---|
| 0 | braços cruzados, **de perfil** para a direita | o pedido de cada sala |
| 1 | joinha, de perfil | o trecho vencido |
| 2 | mão levantada, de perfil | a trava e os avisos |
| 3 | **de frente**, mão no peito, explicando | a fala do tutorial |
| 4 | **de frente**, braços abertos, convidando | a pausa entre as falas |

Os três primeiros olham para o balão, que fica à direita deles. Os dois últimos
olham para a criança — é a diferença entre *pedir dentro do jogo* e *ensinar o
jogo*.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
images: do NOT copy their characters, their clothes, their poses, their scenes
or their framing.

Draw ONE sprite sheet on a grid of 5 columns by 1 row, exactly 2500 by 550
pixels, each cell exactly 500 by 550, TRUE transparent background, no cell
borders, no gaps, no grid lines drawn.

The SAME character in all five cells, same scale, from the waist up: a cheerful
Brazilian girl inventor about 10 years old, curly dark hair tied back, a pair of
round goggles pushed up on her forehead, a blue denim dungaree over a striped
shirt, a small screwdriver in the chest pocket. Warm, clever, friendly.

Cell 1 — arms crossed, calm, seen in PROFILE facing RIGHT.
Cell 2 — giving a THUMBS UP, seen in profile facing right, proud smile.
Cell 3 — one hand raised as if saying "wait", seen in profile facing right,
attentive but kind.
Cell 4 — FACING THE VIEWER, one hand on her chest, mouth open explaining
something, warm smile.
Cell 5 — FACING THE VIEWER, both arms open in an inviting gesture, big happy
smile.

CRITICAL: the same girl at the same scale in every cell; cells 1 to 3 in profile
looking right, cells 4 and 5 looking straight at the viewer.

DO NOT INCLUDE: robot, owls, animals, tools in her hands, furniture, floor,
ground shadow, background, text, letters, numbers, logos on clothes,
watermark, grid lines, cell borders, gaps, speech bubbles, arrows, icons,
scolding face, angry face, sad face, pointing at the viewer, adult
proportions, teenager, painterly lineless illustration, soft airbrushed
gradients, heavy rendering, western cartoon style, rough sketchy lines,
uneven brush outlines, muddy colours, 3D render, photorealistic, blur, heavy
noise, white backing in transparent assets.
~~~

### Conferência

- [ ] 2500 × 550, cinco células na mesma escala;
- [ ] é a mesma menina nas cinco, mesma roupa e mesmo cabelo;
- [ ] 0 a 2 de perfil para a direita; 3 e 4 de frente;
- [ ] nada nas mãos além do gesto;
- [ ] a 390 px de altura (117 px reais) a explicação da célula 4 se lê no rosto.

---

## 9. `cover-robo-sorrateiro.png` — a capa

### Contrato

| Campo | Exigência |
|---|---|
| dimensão | 1672 × 941, opaco |
| o que precisa ler em miniatura | **o robô na ponta dos pés e a coruja olhando** |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi anime illustration with FLAT cel shading; clean
crisp line art of even weight in a dark desaturated colour, never pure black;
ONE soft shadow tone and no gradients; small chibi proportions, big glossy
expressive eyes with a bright highlight; a short palette — one strong accent
colour over near-white and dark neutrals. NO white sticker keyline here — this
is a full illustration, not a sticker. Take ONLY the art style from the
attached images: do NOT copy their characters, their clothes, their poses,
their scenes or their framing.

Draw a horizontal cover illustration, 1672 by 941 pixels, opaque, for a
children's educational game about IF/ELSE rules.

A small round mint-green robot with one antenna tiptoes across a cosy night
library floor, looking up over its shoulder with a mischievous smile. On a
bookshelf above, one brown owl sleeps curled up while a white owl is wide awake
and watching, head high. Warm lamp light, soft blue-violet shadows, books and a
red rug.

CRITICAL: what must read at thumbnail size is the ROBOT SNEAKING and the AWAKE
OWL WATCHING it — the whole idea of the game in one glance.
CRITICAL: playful and funny, never scary; the owls are amused, not angry.

DO NOT INCLUDE: text, letters, numbers, title lettering, logos, watermark,
user interface, buttons, cards, arrows, vision cones, dark horror mood,
black shadows, angry or scary owls, sharp claws, red eyes, cluttered
composition, painterly lineless illustration, soft airbrushed gradients,
heavy rendering, western cartoon style, rough sketchy lines, uneven brush
outlines, muddy colours, 3D render, photorealistic, blur.
~~~

### Conferência

- [ ] em 200 px de largura ainda se vê o robô de fininho e a coruja acordada;
- [ ] nenhuma letra, nenhum número;
- [ ] o robô e as corujas parecem os mesmos das folhas 1 e 2.

---

## 10. Depois que a arte chegar

**Meça o sprite, não chute.** Meça a caixa alfa de cada quadro e guarde o
resultado em `data/cast.ts`, em fração da célula:

- o **robô** é ancorado pela base da rodinha, para os cinco quadros pisarem na
  mesma linha do chão;
- o quadro **agachado** é ancorado pelo topo da cabeça, porque é a parte que
  fica visível acima do móvel;
- a **coruja** é ancorada pela base das patas: dormindo e acordada têm alturas
  diferentes de propósito, e é o poleiro que tem de ficar fixo;
- se um arquivo for trocado, **as caixas são medidas de novo**.

Depois da medição:

- [ ] o robô agachado, com o móvel na frente, deixa ver cabeça, antena e olhos;
- [ ] a coruja acordada é visivelmente mais alta que a dormindo, no mesmo poleiro;
- [ ] a folha aparece na lista `WANTED` do `BootScene`, carregada por
      `import.meta.glob`, e nenhum `import` estático aponta para arte;
- [ ] tirando os PNGs da pasta, o jogo continua abrindo e jogável com o
      placeholder de `Graphics`;
- [ ] a capa não é carregada dentro da partida (o `BootScene` ignora `cover-`).

### Placeholder, enquanto não existir PNG

- robô = cápsula na cor do time com antena e dois olhos;
- coruja = círculo com dois olhos que fecham, e o corpo encolhe quando dorme;
- esconderijo = caixa com tampa; porta = retângulo com maçaneta;
- sala = piso em degradê com tapete e estantes em blocos.
