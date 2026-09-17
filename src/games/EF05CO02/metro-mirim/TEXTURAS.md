# Metrô Mirim — TEXTURAS.md

O que a arte precisa entregar, e o que ela **não** deve entregar.

Lado a lado com o [PLANEJAMENTO.md](./PLANEJAMENTO.md): lá estão os tamanhos na
grade de 1280 × 720, aqui está o contrato de cada arquivo.

---

## 0. A lista

Sete arquivos, nesta ordem de produção. Nada além disto é textura.

**A arte deste jogo está completa.**

| # | Arquivo | Tamanho | O que é | Status |
|---|---|---|---|---|
| 1 | `estacoes.png` | **1600 × 800** (4 × 2 de 400) | os oito prediozinhos que viram estação | ✔ medido |
| 2 | `passageiros.png` | **1400 × 800** (4 × 2 de 350) | quatro crianças, esperando e chegando | ✔ medido |
| 3 | `trem.png` | **500 × 200** | o trenzinho que percorre os trilhos | ✔ medido |
| 4 | `trilho-icone.png` | **400 × 400** | a **peça** de trilho: a que fica no estoque e a que se arrasta | ✔ medido |
| 5 | `trilho-tile.png` | **156 × 67** | o pedaço de via que **se repete** ao longo da ligação | ✔ |
| 6 | `bg-cidade.png` | **1672 × 941** | a cidade de brinquedo, lavada, sem ruas | ✔ |
| 7 | `cover-metro-mirim.png` | **1672 × 941** | a capa do card do catálogo | ✔ |

Os arquivos 4 e 5 são **duas coisas diferentes do mesmo objeto**, e é por isso
que são dois: a peça do estoque é um objeto inteiro que a criança pega com o
dedo (tem começo e fim, cabe na mão); o tile é um trecho de via sem começo nem
fim, que o código estica e repete ao longo de uma ligação de qualquer tamanho.
Usar a peça esticada daria um trilho borrachudo; usar o tile na bandeja daria
uma peça cortada no meio.

As entregas vieram em tamanhos diferentes do pedido, e isso não é problema: o
que o código usa é a **caixa alfa medida** de cada arquivo, guardada em
`data/art.ts`. Dois casos que valem registrar:

- a `passageiros.png` chegou com 1399 px de largura e foi normalizada para 1400
  — com 1399 a célula ficava em 349,75 px e o recorte escorregava de quadro em
  quadro;
- a `trilho-icone.png` tem o desenho **na diagonal, ocupando só a faixa do meio**
  do quadro (42 % da altura). Escalar pelo tamanho do arquivo deixaria a peça
  minúscula na bandeja; ela é escalada pela caixa medida, como as folhas.

O arquivo chegou como `trilho-icone.png` (e não `icone-trilho.png`): o código
aceita os dois nomes, e este documento passou a usar o nome que existe.

Tudo mora em `src/assets/games/EF05CO02/metro-mirim/`.

### O que é `Graphics`, e por quê

**Nunca peça arte para:** bandeja, botão PARTIR, balão do passageiro, pontinhos
de pressa, **a ligação possível tracejada**, o dormente redondo que tira o
trilho, halo de seleção, cadeado, moldura, bolinha de fase, estrela, listra de
obra, fumacinha, o diagrama final.

Dois motivos concretos:

- esses elementos **mudam de cor e de estado a cada toque** (possível → posto →
  em obra → destacado na TRAVA), e PNG não muda;
- com a interface em `Graphics`, **o jogo roda inteiro com zero textura
  carregada** — e é assim que ele é ajustado antes do primeiro desenho existir.

**O trilho é o caso de fronteira, e ele foi dividido em dois.** A aresta muda de
estado o tempo todo, então quem desenha o *estado* é o código: a casca escura
por baixo, o aceso âmbar quando o trem passa, o tracejado de quando ela ainda é
só possível. O que a arte entrega é a **matéria** dela — o §7, um trecho de via
que o código repete ao longo da ligação, e o §6, a peça inteira que a criança
pega na bandeja. Sem os dois o jogo continua jogável, com a via desenhada.

---

## 1. As três regras que governam esta arte

1. **O fundo é o mais apagado da tela.** Quem tem que saltar é a estação (o
   vértice) e o trilho (a aresta). Se o desenho da cidade competir com eles, a
   criança perde a rede de vista — e a rede é o jogo.
2. **Nenhuma linha que ligue dois lugares pode existir no desenho.** Nada de
   rua contínua, trilho pintado, ponte, calçadão ou caminho de terra entre
   quarteirões. Toda ligação na tela tem significado: ou é possível
   (tracejada), ou está construída (trilho). Uma linha decorativa vira
   promessa falsa.
3. **A folha vem inteira, numa geração só.** Os oito prediozinhos saem parecidos
   porque saíram juntos; pedir um de cada vez é onde a consistência morre por
   volta do quinto desenho.

---

## 2. Estilo e paleta

### A referência é uma imagem, e ela vai anexada em TODOS os prompts

Este jogo usa **a mesma imagem de referência do Guardião Ético** — *"Elementary
— Class of '26"* — anexada junto do texto em **cada** geração. Guarde-a em
`references/` (fora de `src/`, para não entrar no bundle), por exemplo
`references/elementary-class-26.png`, e anexe sempre a mesma. É o que faz os
dois jogos parecerem da mesma família.

Do que se trata, em palavras, para o caso de o gerador ignorar o anexo:

- **traço de graphic novel infantil**: contorno preto firme, de espessura
  variável — grosso na silhueta, fino dentro da figura;
- **cor chapada com sombreado de desenho animado**: duas ou três faixas de
  sombra, degradê suave dentro da área chapada, sem pintura realista;
- **paleta quente e saturada** nas figuras, e fundos bem mais lavados que elas;
- **rostos muito expressivos**, olhos grandes e arredondados;
- **formas encorpadas e arredondadas**, anatomia simplificada, mãos gordinhas;
- **textura leve de papel** por baixo.

> **Da referência se tira o TRAÇO, nunca o elenco.** A imagem tem criaturas de
> fantasia; o nosso elenco é de **crianças brasileiras comuns** e de
> **prediozinhos de cidade**: nada de asa, orelha pontuda, chifre, cauda ou
> pele colorida. Também não se copia a composição de capa, o letreiro nem o
> enquadramento dela.

### Linha de estilo — já vem dentro de cada prompt

Os prompts dos §3 a §9 são **copiáveis inteiros**: cada um já traz esta linha e
o negativo adaptado ao arquivo. O bloco abaixo fica aqui só como origem — para
conferir, corrigir de uma vez, ou montar um prompt novo.


~~~text
STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight (heavier on the silhouette, lighter inside), flat colour with clean
cel-shaded steps and soft gradients, warm saturated palette, very expressive
faces with large rounded eyes, chunky rounded shapes and simplified anatomy, a
faint paper grain. Take ONLY the drawing style from the reference: do NOT copy
its characters, its creatures, its cover layout, its lettering or its subject.
Everything here is an ordinary friendly Brazilian toy town and ordinary human
Brazilian schoolchildren — no wings, no pointed ears, no horns, no tails, no
animal or fantasy features.
~~~

### As cores do jogo

Luz quente vindo de cima à esquerda, formas arredondadas, leitura fácil em
celular.

| Uso | Hex |
|---|---|
| contorno | `#2a2233` |
| chão da cidade | `#e7eef3` |
| grama e praça | `#b9d8a3` |
| rio | `#8ec9ea` |
| quarteirão | `#d8ccbc` |
| plaquinha do nome e marca do chão (código) | `#fffaf0` |
| trilho posto (código) | `#55606e` |
| dormente (código) | `#a97a4f` |
| ligação possível (código) | `#9aa9b8` |
| seleção e foco (código) | `#4b8fe0` |
| chegou (código) | `#4eaa78` |
| obra e TRAVA (código) | `#e59a52` |
| negar (código) | `#d1584f` |

### Negativo comum — também já vem dentro de cada prompt

Cada prompt traz este negativo **com os acréscimos daquele arquivo no fim**, e
com as exceções que ele precisa: o §5 é o único que pode desenhar trem; §6, §7
e §9 são os únicos que podem desenhar trilho.


~~~text
text, letters, words, labels, digits, numbers, captions, signage with writing,
signature, watermark, logo, brand, user interface, app window, browser,
toolbar, map pin, route line, dashed line, arrow, compass, legend,
railway tracks, train rails, subway map, roads, streets, paved paths, bridges,
crosswalks, power lines, any line connecting two buildings,
emoji, speech bubble, red X mark, green check mark, warning sign,
angry face, crying child, scolding adult,
dragons, elves, wings, pointed ears, horns, tails, animal features,
fantasy creatures, comic book cover layout, title banner, lettering,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the
cell, white backing in transparent assets, painted checkerboard,
3D render, isometric CAD, photorealistic, blur, lens flare, noise.
~~~

Se o gerador não entregar transparência real, peça sobre magenta `#FF00FF` e
remova a cor.

---

## 3. `estacoes.png` — os oito lugares

### Contrato da folha

| | |
|---|---|
| Arquivo | `estacoes.png` |
| Folha | **4 colunas × 2 linhas**, quadro de **256 × 256**, total 1024 × 512 |
| Fundo | **transparente de verdade** |
| Ordem dos quadros | é contrato com o código (`art: 0..7`) |

| Frame | Lugar | Como se reconhece de longe |
|---|---|---|
| 0 | **Escola** | prédio baixo de dois andares, telhado vermelho, bandeira no mastro, portão largo |
| 1 | **Praça** | coreto redondo com uma árvore grande ao lado e um banquinho |
| 2 | **Mercado** | mercearia com toldo listrado e caixotes de fruta na frente |
| 3 | **Biblioteca** | prediozinho com colunas e um livro gigante decorando a fachada |
| 4 | **Estádio** | arquibancada curva aberta, gramado verde, dois refletores |
| 5 | **Hospital** | prédio branco com uma cruz em relevo no frontão (cruz **em volume**, não desenhada como símbolo) |
| 6 | **Casa** | casinha simples com telhado de duas águas, janela e porta |
| 7 | **Estação central** | um pequeno terminal com marquise e um relógio redondo **sem ponteiros nem números** |

Cada prédio:

- **centralizado** no quadro, ocupando **~86 %** da largura;
- visto de frente com leve perspectiva de três quartos, **base apoiada em ~92 %
  da altura** do quadro (o código encosta essa base no chão do mapa);
- **sem chão, sem sombra projetada, sem moldura** — a sombra é do código;
- cores fortes e distintas entre si: a criança acerta o lugar pela **cor e pela
  silhueta**, antes de ler o rótulo.

### Prompt copiável

~~~text
A sprite sheet of eight cheerful toy-town buildings, arranged in a strict grid
of 4 columns by 2 rows, each cell exactly 256 x 256 pixels, on a fully
transparent background.

Reading order, left to right, top row then bottom row:
1) a small two-storey SCHOOL with a red roof, a wide gate and a flagpole;
2) a round PARK BANDSTAND with one big leafy tree beside it and a little bench;
3) a corner GROCERY SHOP with a striped awning and crates of fruit in front;
4) a small LIBRARY with columns and one oversized decorative book on the facade;
5) a tiny open STADIUM: a curved stand, green pitch, two floodlights;
6) a small white HOSPITAL with a raised sculpted cross on the pediment;
7) a simple HOUSE with a gabled roof, one window and a door;
8) a little TRAIN TERMINAL with a canopy and a plain round clock face with no
   hands and no numerals.

Each building is centred in its own cell, occupies about 86% of the cell width,
is seen from the front with a slight three-quarter tilt, and its base sits at
about 92% of the cell height. No ground, no cast shadow, no frame, no base
plate, no pedestal. Strong distinct colours so each building is recognisable by
silhouette and colour alone at thumbnail size.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight (heavier on the silhouette, lighter inside), flat colour with clean
cel-shaded steps and soft gradients, warm saturated palette, very expressive
faces with large rounded eyes, chunky rounded shapes and simplified anatomy, a
faint paper grain. Take ONLY the drawing style from the reference: do NOT copy
its characters, its creatures, its cover layout, its lettering or its subject.
Everything here is an ordinary friendly Brazilian toy town and ordinary human
Brazilian schoolchildren — no wings, no pointed ears, no horns, no tails, no
animal or fantasy features.

NEGATIVE: text, letters, words, labels, digits, numbers, captions, signage with
writing, signature, watermark, logo, brand, user interface, app window,
browser, toolbar, map pin, route line, dashed line, arrow, compass, legend,
railway tracks, train rails, subway map, roads, streets, paved paths, bridges,
crosswalks, power lines, any line connecting two buildings, emoji, speech
bubble, red X mark, green check mark, warning sign, angry face, crying child,
scolding adult, dragons, elves, wings, pointed ears, horns, tails, animal
features, fantasy creatures, comic book cover layout, title banner, lettering,
HUD, life icon, star rating, question mark button, tutorial panel, grid lines,
visible sprite-sheet borders, cropped edges, drop shadow on the cell, white
backing in transparent assets, painted checkerboard, 3D render, isometric CAD,
photorealistic, blur, lens flare, noise, no train, no people, no vehicles, no
fences between buildings, no ground plane.
~~~

### Conferência

- oito quadros, na ordem, sem nada encostando na borda da célula;
- silhuetas distintas a 120 px de largura (é o tamanho que o disco usa);
- fundo transparente de verdade (abra sobre magenta para ter certeza);
- nenhuma letra, nenhum número — nem no relógio, nem na fachada.

---

## 4. `passageiros.png` — quem espera e quem chega

### Contrato da folha

| | |
|---|---|
| Arquivo | `passageiros.png` |
| Folha | **4 colunas × 2 linhas**, quadro de **256 × 256** |
| Linha 1 (frames 0–3) | as quatro crianças **esperando** |
| Linha 2 (frames 4–7) | **as mesmas quatro, na mesma ordem**, chegando |

A ordem entre as linhas é contrato: o código troca `art` por `art + 4` no
instante em que o trem encosta. Se a segunda linha vier embaralhada, a criança
que embarcou não é a que desce.

| Frame | Quem | Esperando (linha 1) | Chegando (linha 2) |
|---|---|---|---|
| 0 / 4 | **Téo**, mochila azul | de pé, mochila nas costas, olhando para o lado, expectativa | acenando com os dois braços, sorriso grande |
| 1 / 5 | **Bia**, tranças e jaqueta amarela | de pé, mãos nos bolsos, ansiosa | pulando com um braço para cima |
| 2 / 6 | **Rafa**, cadeira de rodas, camiseta verde | esperando, mãos no aro | braços abertos, comemorando |
| 3 / 7 | **Duda**, cabelo cacheado, mochila vermelha | de pé na ponta dos pés, espiando | acenando com uma mão, a outra na alça da mochila |

Cada criança:

- corpo inteiro, **centralizada**, ocupando ~80 % da altura do quadro;
- **pés apoiados em ~94 %** da altura (o código encosta no chão ao lado da
  estação);
- **nenhuma delas carrega objeto que pareça controle de jogo** (nada de placa,
  celular, mapa ou seta);
- expressão calma e boa: ninguém bravo, ninguém chorando. Passageiro que não
  chega fica **esperando**, nunca com raiva.

### Prompt copiável

~~~text
A sprite sheet of four Brazilian schoolchildren, arranged in a strict grid of 4
columns by 2 rows, each cell exactly 256 x 256 pixels, transparent background.

TOP ROW - the four children WAITING, full body, standing (or seated in the
wheelchair), calm and hopeful:
1) TEO, short dark hair, blue backpack, looking to the side;
2) BIA, braided hair, yellow jacket, hands in pockets;
3) RAFA, in a manual wheelchair, green t-shirt, hands on the wheel rim;
4) DUDA, curly hair, red backpack, up on tiptoes, peeking.

BOTTOM ROW - THE SAME FOUR CHILDREN, IN THE SAME ORDER, same clothes, same hair,
same colours, now ARRIVING and happy:
5) Teo waving with both arms, big smile;
6) Bia jumping with one arm up;
7) Rafa with both arms open, celebrating;
8) Duda waving one hand, the other on the backpack strap.

Each child is centred in its own cell, about 80% of the cell height, feet (or
wheels) resting at about 94% of the cell height. No ground, no shadow, no
props, no held objects. Friendly faces, nobody angry, nobody crying.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight (heavier on the silhouette, lighter inside), flat colour with clean
cel-shaded steps and soft gradients, warm saturated palette, very expressive
faces with large rounded eyes, chunky rounded shapes and simplified anatomy, a
faint paper grain. Take ONLY the drawing style from the reference: do NOT copy
its characters, its creatures, its cover layout, its lettering or its subject.
All characters here are ordinary human Brazilian schoolchildren — no wings, no
pointed ears, no horns, no tails, no animal or fantasy features.

NEGATIVE: text, letters, words, labels, digits, numbers, captions, signage with
writing, signature, watermark, logo, brand, user interface, app window,
browser, toolbar, map pin, route line, dashed line, arrow, compass, legend,
railway tracks, train rails, subway map, roads, streets, paved paths, bridges,
crosswalks, power lines, any line connecting two buildings, emoji, speech
bubble, red X mark, green check mark, warning sign, angry face, crying child,
scolding adult, dragons, elves, wings, pointed ears, horns, tails, animal
features, fantasy creatures, comic book cover layout, title banner, lettering,
HUD, life icon, star rating, question mark button, tutorial panel, grid lines,
visible sprite-sheet borders, cropped edges, drop shadow on the cell, white
backing in transparent assets, painted checkerboard, 3D render, isometric CAD,
photorealistic, blur, lens flare, noise, no held signs, no phones, no maps, no
tickets, no luggage other than the backpacks described, no adults, no ground
plane.
~~~

### Conferência

- a criança do frame 0 e a do frame 4 são **a mesma pessoa** (cabelo, roupa,
  cor) — este é o erro mais comum desta folha;
- ninguém encosta na borda da célula;
- cadeira de rodas desenhada com respeito e sem drama: é transporte, não tema.

---

## 5. `trem.png` — o trenzinho

### Contrato

| | |
|---|---|
| Arquivo | `trem.png` | 
| Tamanho | **256 × 256**, quadro único, transparente |
| Direção | **nariz apontando para a DIREITA** |

O código gira o sprite para alinhar com o trilho, então a pose tem que ser
perfeitamente lateral: um trenzinho de brinquedo de madeira, uma locomotiva
curtinha com um vagão só, janelas redondas, chaminé baixa, rodas visíveis.

- centralizado, ocupando ~88 % da largura;
- o **eixo das rodas em ~78 %** da altura do quadro: é essa linha que o código
  encosta no trilho;
- **sem trilho embaixo**, sem fumaça, sem chão, sem sombra;
- cor forte e única no jogo (vermelho-tomate com detalhe creme), para ele saltar
  contra qualquer estação.

### Prompt copiável

~~~text
A single friendly wooden toy train seen from a perfect side view, nose pointing
to the RIGHT: a stubby locomotive plus one short carriage, round windows, a low
chimney, chunky visible wheels. Tomato red with cream details. Centred, about
88% of the image width, with the wheel axles at about 78% of the image height.
Transparent background. No rails, no track, no ground, no cast shadow, no
smoke, no steam, no driver.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight (heavier on the silhouette, lighter inside), flat colour with clean
cel-shaded steps and soft gradients, warm saturated palette, chunky rounded
shapes and simplified forms, a faint paper grain. Take ONLY the drawing style
from the reference: do NOT copy its characters, its creatures, its cover
layout, its lettering or its subject. This is an ordinary friendly wooden toy
train — no face on it, no wings, no horns, no animal or fantasy features.

NEGATIVE: text, letters, words, labels, digits, numbers, captions, signage with
writing, signature, watermark, logo, brand, user interface, app window,
browser, toolbar, map pin, route line, dashed line, arrow, compass, legend,
railway tracks, train rails, subway map, roads, streets, paved paths, bridges,
crosswalks, power lines, any line connecting two buildings, emoji, speech
bubble, red X mark, green check mark, warning sign, angry face, crying child,
scolding adult, dragons, elves, wings, pointed ears, horns, tails, animal
features, fantasy creatures, comic book cover layout, title banner, lettering,
HUD, life icon, star rating, question mark button, tutorial panel, grid lines,
visible sprite-sheet borders, cropped edges, drop shadow on the cell, white
backing in transparent assets, painted checkerboard, 3D render, isometric CAD,
photorealistic, blur, lens flare, noise, no sleepers, no station, no motion
lines, no smoke, no cartoon face on the locomotive.
~~~

### Conferência

- girando o PNG 45° ele continua parecendo um trem de lado (se a pose tiver
  perspectiva, isso denuncia);
- o nariz aponta para a direita — se vier ao contrário, o trem anda de ré em
  metade dos trilhos.

---

## 6. `trilho-icone.png` — a peça que fica no estoque

### Contrato

| | |
|---|---|
| Arquivo | `trilho-icone.png` |
| Tamanho | **256 × 256**, quadro único, transparente |
| Papel | a peça na bandeja, a peça que a criança arrasta, e a que voa até o trilho |

É **um objeto**, não um trecho de linha: um pedacinho de via de brinquedo, com
começo e fim, do jeito que uma peça de trilho de madeira fica em cima da mesa.

- vista de cima com leve inclinação (uns 20°), deitada na horizontal;
- **dois trilhos e três ou quatro dormentes**, cantos arredondados, bem gordinha
  — ela aparece a 86 px na tela, e a 26 px reais no celular;
- centralizada, ocupando **~88 % da largura** e no máximo 55 % da altura;
- madeira quente nos dormentes, metal claro nos trilhos, contorno preto firme;
- **sem chão, sem sombra projetada, sem brita, sem moldura, sem placa.**

### Prompt copiável

~~~text
A single chunky wooden toy railway track piece, lying horizontally, seen from
above at a slight 20-degree tilt, as one standalone game token: two light metal
rails on three or four warm wooden sleepers, rounded corners, thick friendly
proportions. Centred in the image, about 88% of the width and no more than 55%
of the height. Fully transparent background. No ground, no ballast, no gravel,
no cast shadow, no frame, no base plate.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight (heavier on the silhouette, lighter inside), flat colour with clean
cel-shaded steps and soft gradients, warm saturated palette, chunky rounded
shapes, a faint paper grain. Take ONLY the drawing style from the reference: do
NOT copy its characters, its creatures, its cover layout, its lettering or its
subject. This is an ordinary friendly wooden toy railway piece — no face on it,
no wings, no horns, no animal or fantasy features.

NEGATIVE: text, letters, words, labels, digits, numbers, captions, signage with
writing, signature, watermark, logo, brand, user interface, app window,
browser, toolbar, map pin, route line, dashed line, arrow, compass, legend,
roads, streets, paved paths, bridges, crosswalks, power lines, emoji, speech
bubble, red X mark, green check mark, warning sign, angry face, crying child,
scolding adult, dragons, elves, wings, pointed ears, horns, tails, animal
features, fantasy creatures, comic book cover layout, title banner, lettering,
HUD, life icon, star rating, question mark button, tutorial panel, grid lines,
visible sprite-sheet borders, cropped edges, drop shadow on the cell, white
backing in transparent assets, painted checkerboard, 3D render, isometric CAD,
photorealistic, blur, lens flare, noise, no train, no station, no landscape, no
ballast, no curve, no switch, no junction, no perspective vanishing point.
~~~

### Conferência

- reduzida a 86 px de largura, ainda dá para contar os dormentes;
- não parece um pedaço cortado de uma linha comprida: tem ponta dos dois lados;
- fundo transparente de verdade (abra sobre magenta para conferir).

---

## 7. `trilho-tile.png` — o trecho que se repete

### Contrato

| | |
|---|---|
| Arquivo | `trilho-tile.png` |
| Tamanho | **256 × 96**, transparente só nas pontas se precisar |
| Papel | é ESTICADO e REPETIDO pelo código ao longo de cada ligação construída |

Este é o arquivo mais técnico do jogo, e o contrato é uma coisa só: **as bordas
esquerda e direita têm de casar**. O código põe um `TileSprite` do comprimento
exato da ligação e gira ele; se o desenho não emendar, aparece uma costura a
cada 256 px, repetida no mapa inteiro.

- via **reta**, vista de cima, perfeitamente horizontal;
- **dois trilhos paralelos** correndo de ponta a ponta, na mesma altura nas duas
  bordas, e **dormentes igualmente espaçados** — o espaçamento tem de continuar
  na emenda (nenhum dormente cortado pela metade na borda);
- o desenho ocupa a **altura inteira** do quadro: a via encosta em cima e
  embaixo, sem margem transparente, porque o código desenha uma casca escura
  por baixo e qualquer folga vira contorno duplo;
- sem sombra, sem brita, sem grama, sem começo nem fim.

### Prompt copiável

~~~text
A seamless horizontally tileable texture strip of straight toy railway track,
256 x 96 pixels, seen from directly above (flat top-down, no perspective). Two
parallel light metal rails run the full width from edge to edge, at exactly the
same height on the left and right borders, over evenly spaced warm wooden
sleepers. The sleeper spacing must continue across the repeat: no sleeper is
cut at the left or right edge, and the left and right edges must match exactly
so the image can be repeated horizontally with no visible seam. The track fills
the entire height of the image, touching the top and bottom edges.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight, flat colour with clean cel-shaded steps, warm saturated palette, chunky
rounded shapes, a faint paper grain. Take ONLY the drawing style from the
reference: do NOT copy its characters, its creatures, its cover layout, its
lettering or its subject.

NEGATIVE: text, letters, words, labels, digits, numbers, captions, signage with
writing, signature, watermark, logo, brand, user interface, app window,
browser, toolbar, map pin, route line, dashed line, arrow, compass, legend,
roads, streets, paved paths, bridges, crosswalks, power lines, emoji, speech
bubble, red X mark, green check mark, warning sign, dragons, elves, wings,
pointed ears, horns, tails, animal features, fantasy creatures, comic book
cover layout, title banner, lettering, HUD, life icon, star rating, question
mark button, tutorial panel, grid lines, visible tile borders, cropped edges,
drop shadow, white backing in transparent assets, painted checkerboard, 3D
render, isometric CAD, photorealistic, blur, lens flare, noise, perspective,
vanishing point, curve, switch, junction, train, station, grass, gravel,
ballast, ground, scenery.
~~~

### Conferência

**Antes de aceitar, teste a emenda**: ponha o PNG duas vezes lado a lado num
editor. Se a linha do trilho pular, ou se aparecer um dormente mais estreito na
junção, volta. É a única conferência que importa neste arquivo.

E confira que a via toca o topo e a base do quadro — margem transparente aqui
vira uma listra escura ao longo de todos os trilhos do jogo.

---

## 8. `bg-cidade.png` — a cidade, apagada

### Contrato

| | |
|---|---|
| Arquivo | `bg-cidade.png` |
| Tamanho | **1280 × 720**, sem transparência |
| Papel | ser o mais quieto da tela |

O que precisa ter:

- vista de cima com leve inclinação, como maquete de brinquedo;
- **quarteirões, gramados, um rio atravessando e uma pracinha**, em cores
  lavadas (o rio é a desculpa visual de "aqui não dá para ligar");
- **os oito lugares do §3 NÃO aparecem aqui** — quem desenha estação é o sprite;
- a faixa de **y 0 a 82** e a de **y 560 a 720** ficam cobertas por HUD e
  bancada: nada importante ali;
- nenhuma linha ligando nada (ver §1, regra 2).

Contraste: o fundo deve ficar **pelo menos duas vezes mais claro** que o trilho
`#55606e`. Se o desenho vier escuro ou saturado, peça de novo — não conserte com
alpha no código, porque aí a cidade vira cinza sujo.

### Prompt copiável

~~~text
A very soft, washed-out top-down view of a tiny toy town, seen from above with a
slight tilt, as a flat game background, 1280 x 720, wide format.

It shows pale city blocks with generic little rooftops, patches of grass, a
small round plaza, scattered trees, and one gentle blue river crossing the scene
diagonally. Everything is low contrast and desaturated, like a painted board
game map, so that bright pieces placed on top of it stand out.

IMPORTANT: no roads, no streets, no paths, no railway lines, no bridges, and no
line of any kind connecting two places. No landmark buildings: only small
anonymous rooftops. Keep the top 80 pixels and the bottom 160 pixels visually
calm and empty.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight, flat colour with clean cel-shaded steps and soft gradients, chunky
rounded shapes, a faint paper grain — BUT with much lower saturation and much
softer contrast than the reference, because this is a background that pieces
will sit on top of. Take ONLY the drawing style from the reference: do NOT copy
its characters, its creatures, its cover layout, its lettering or its subject.

NEGATIVE: text, letters, words, labels, digits, numbers, captions, signage with
writing, signature, watermark, logo, brand, user interface, app window,
browser, toolbar, map pin, route line, dashed line, arrow, compass, legend,
railway tracks, train rails, subway map, roads, streets, paved paths, bridges,
crosswalks, power lines, any line connecting two buildings, emoji, speech
bubble, red X mark, green check mark, warning sign, angry face, crying child,
scolding adult, dragons, elves, wings, pointed ears, horns, tails, animal
features, fantasy creatures, comic book cover layout, title banner, lettering,
HUD, life icon, star rating, question mark button, tutorial panel, grid lines,
visible sprite-sheet borders, cropped edges, drop shadow on the cell, white
backing in transparent assets, painted checkerboard, 3D render, isometric CAD,
photorealistic, blur, lens flare, noise, no cars, no people, no trains, no
landmark buildings, no strong shadows, no vignette.
~~~

### Conferência

- ponha por cima, em teste, um trilho `#55606e` e uma ligação tracejada
  `#9aa9b8`: os dois têm que ser lidos sem esforço em qualquer ponto do mapa;
- procure com o olho qualquer linha que ligue duas coisas. Se existir, volta.

---

## 9. `cover-metro-mirim.png` — a capa

| | |
|---|---|
| Arquivo | `cover-metro-mirim.png` |
| Tamanho | **1672 × 941** (16:9, é o tamanho das outras capas) |
| Onde | `src/assets/games/EF05CO02/metro-mirim/`, importada em `catalog.ts` |

A capa é o único lugar onde a cidade pode ser bonita e forte: mesa de brinquedo
vista de cima, três ou quatro prediozinhos coloridos, o trenzinho vermelho
correndo por um trilho, e duas crianças do §4 acenando ao lado. Cores quentes,
sem texto nenhum — o título entra no card do catálogo.

~~~text
Cover art, 16:9: a cheerful toy-town tabletop seen from a high three-quarter
angle. Three or four colourful little buildings (a school with a red roof, a
grocery with a striped awning, a bandstand), a stubby red wooden toy train
running along a short curved track between two of them, and two Brazilian
schoolchildren beside it, waving, delighted. Warm saturated colours, soft depth,
a friendly sunny afternoon feeling. No text anywhere.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGE — children's
graphic-novel / animated-cartoon art: confident black ink outlines of varying
weight (heavier on the silhouette, lighter inside), flat colour with clean
cel-shaded steps and soft gradients, warm saturated palette, very expressive
faces with large rounded eyes, chunky rounded shapes and simplified anatomy, a
faint paper grain. Take ONLY the drawing style from the reference: do NOT copy
its characters, its creatures, its cover layout, its lettering or its subject.
All characters here are ordinary human Brazilian schoolchildren — no wings, no
pointed ears, no horns, no tails, no animal or fantasy features.

NEGATIVE: text, letters, words, labels, digits, numbers, captions, signage with
writing, signature, watermark, logo, brand, title, lettering, title banner,
comic book cover layout, user interface, app window, browser, toolbar, UI
frame, map pin, route line, dashed line, arrow, compass, legend, subway map,
emoji, speech bubble, red X mark, green check mark, warning sign, angry face,
crying child, scolding adult, dragons, elves, wings, pointed ears, horns,
tails, animal features, fantasy creatures, HUD, life icon, star rating,
question mark button, grid lines, 3D render, isometric CAD, photorealistic,
blur, lens flare, noise.
~~~

---

## 10. Depois que a arte chegar

Meça a caixa alfa de cada quadro e ancore o layout nela — é uma execução no
navegador e economiza meia hora de tentativa e erro. O resultado vira
`data/art.ts`, junto com o comentário do que foi medido:

```js
// desenha o PNG num canvas e devolve a caixa alfa de cada quadro,
// em fração da célula: { x, y, w, h } com 0..1
```

O que o código precisa saber de cada folha:

| Folha | O que a medição decide |
|---|---|
| `estacoes.png` | a escala para o prédio caber em 120 px dentro do disco de 140, e onde está a **base** dele (o `origin` vertical) |
| `passageiros.png` | a escala para a criança ter ~110 px de altura ao lado da estação, e a linha dos **pés** |
| `trem.png` | o **eixo das rodas**, que é o ponto que anda em cima do trilho |

Nada disso vira número chutado no `layout.ts`: `art.ts` guarda a fração medida,
e o `layout.ts` guarda o tamanho final que o jogo quer.

E a lista do §0 vira ✔ só quando o arquivo estiver na pasta **e** medido.
