# A Guilda dos Criadores — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF05CO09/guilda-dos-criadores/`

**Quatro arquivos para jogar, mais a capa do catálogo.**

> **O estilo deste jogo é o GRAPHIC NOVEL INFANTOJUVENIL**, escolhido pelo dono
> do projeto em 18/09/2026, e a referência são **duas imagens** — as duas capas
> do *Elementary* que ele anexou:
> [`references/17-graphic-novel-a.webp`](../../../../references/17-graphic-novel-a.webp)
> e [`references/18-graphic-novel-b.png`](../../../../references/18-graphic-novel-b.png).
> **As duas vão anexadas em TODAS as gerações.** Cada prompt abaixo já vem
> inteiro — estilo, corpo e negativo —, para ser copiado e colado sem montar
> nada por cima.
>
> **Este NÃO é o chibi de figurinha de `references/ESTILO.md` nem o desenho de
> criança do `EF05CO08`**, e a diferença é de técnica:
>
> | | chibi de figurinha | desenho de criança | **aqui** |
> |---|---|---|---|
> | traço | limpo, espessura uniforme | trêmulo, espessura irregular | **firme, espessura VARIÁVEL** — grosso na silhueta, fino por dentro |
> | cor | cel shading de um tom | 100 % chapada, sem sombra | **cel shading macio + degradê de ambiente e luz quente de rebote** |
> | olho | enorme, com brilho | pontinho preto | **grande, com íris, pupila e um brilho pequeno** |
> | silhueta | keyline branca de adesivo | o próprio contorno preto | **o próprio contorno**, marrom escuro — **sem keyline** |
> | proporção | cabeça grande, corpo pequeno | cabeça grande, corpo pequeno | **cabeça um pouco maior que o natural, corpo de criança normal** |
>
> **Sem keyline branca em nenhum arquivo deste jogo**, nem nos que têm alfa: o
> contorno de tinta já segura a silhueta sozinho.

> **O elenco das capas de referência entra no NEGATIVO.** Elas são uma escola de
> criaturas — dragão, grifo, medusa, esqueleto, gárgulas —, e é exatamente o que
> o gerador vai copiar se ninguém proibir. Os artistas deste jogo são **crianças
> humanas**. Por isso todo prompt fecha com `dragons, gryphons, medusas,
> skeletons, gargoyles, monsters, fantasy creatures, animal people, pointed elf
> ears, wings, horns`.

> **O jogo roda inteiro com zero PNG.** O verso da obra, a plaquinha, a bandeja,
> o mural, os vãos, a moldura, a janelinha do autor, o balão, o cabeçalho, as
> vidas, as bolinhas, as estrelas e o confete nascem em `Graphics`. As texturas
> só **trocam** as obras, os artistas, os carimbos e o fundo.

> **A unidade de custo é o arquivo, não a peça.** As nove obras vêm numa folha
> só, os quatro artistas × quatro estados em outra, e os carimbos, os selos e as
> oito marcas de assinatura numa terceira: doze células custam uma geração,
> igual a um desenho solto.

---

## 1. O que os vizinhos já fizeram, e o que isso muda aqui

| Vizinho | O que ele já tem | O que isso obriga aqui |
|---|---|---|
| **`EF05CO09/curadoria-com-creditos`** *(publicado)* | `thumb-*.png` de mídias e uma etiqueta de crédito | é o irmão da **mesma habilidade**. Lá as mídias são **miniaturas de um acervo**, vistas pequenas e de cima; aqui a obra é **um objeto único na mesa, grande e virável**, e o jogo inteiro é o lado que aquele não tem: **o verso** |
| **`EF05CO08/olha-o-jornal`** *(18/09/2026)* | `pessoas.png`, `carteiro.png`, praça e banca | é de onde sai **a forma deste arquivo**. A arte não serve: é desenho de criança, e o elenco é de gente de bairro, não de crianças artistas |
| **`EF04CO06/estudio-producao-digital`** | um estúdio de produção | já existe um ateliê no catálogo, em traço antigo. Nenhuma peça serve |

**A conclusão prática:** nada é reaproveitável, e o risco real é **as obras
parecerem miniaturas de acervo**, como no irmão publicado. As três decisões que
separam esta arte daquela estão no §2.

---

## 2. As quatro regras que governam esta arte

> **1. A obra tem de parecer um OBJETO que se vira, não uma imagem de catálogo.**

Ela é vista **de frente e inteira**, ocupando a célula de ponta a ponta, sem
margem branca e sem moldura desenhada — a moldura é `Graphics`, porque ela
pisca, sobe e ganha sombra. O que faz a obra parecer objeto é o jogo: a moldura,
a sombra na mesa e a virada de 260 ms. A arte só não pode **atrapalhar**, e ela
atrapalha se vier com borda, com sombra pintada dentro ou com fundo de parede.

> **2. A obra é bonita de propósito, e no nível 3 isso é a mecânica.**

A obra sem dono é a mais bonita do jogo, e a resposta certa é **não usar**. Se
ela for sem graça, o nível 3 não tenta ninguém e a lição não acontece. É a única
peça deste arquivo em que "caprichar" é requisito funcional, e não acabamento.

> **3. O artista tem de se ler a 90 px, na janelinha.**

Ele aparece **do peito para cima**, dentro de 300 × 300 na tela — 90 px reais no
celular. A essa altura, o que carrega o estado é a **pose dos braços e a boca**,
nunca a sobrancelha:

| Estado | Os braços | A cara |
|---|---|---|
| **esperando** | braços cruzados, relaxado | sorriso pequeno, olhos normais |
| **agradecendo** | **as duas mãos acenando para cima**, corpo inclinado à frente | olhos em arco alegre, boca aberta sorrindo |
| **explicando** | **uma mão aberta para a frente**, a outra segurando uma plaquinha pequena e vazia | sobrancelhas no meio, boca falando, gentil — **nunca bravo** |
| **confuso** | **as duas mãos abertas para os lados**, ombros erguidos | uma sobrancelha levantada, boca em linha ondulada, cabeça inclinada |

Tape a cara com o polegar: ainda tem que dar para dizer qual é qual.

> **4. Explicar e ficar confuso NUNCA são bronca.**

A criança errou uma escolha, não uma pessoa. Nada de dedo em riste, cara
fechada, braços na cintura ou adulto ralhando — e os artistas são **crianças**,
da mesma idade de quem joga, não professores. O negativo de todo prompt carrega
isso.

### A conferência de estilo, que vale para os cinco arquivos

- [ ] contorno de tinta **marrom escuro**, nunca preto puro, com espessura
      variável;
- [ ] **cel shading macio**: um tom de sombra bem definido, mais um degradê de
      ambiente suave — nem chapado, nem pintado;
- [ ] olhos grandes com íris, pupila e **um** brilho pequeno;
- [ ] cabeça um pouco maior que o natural sobre corpo de criança normal;
- [ ] **nenhuma keyline branca**, em arquivo nenhum;
- [ ] **nenhuma criatura de fantasia** — nem dragão, nem grifo, nem asa, nem
      orelha pontuda;
- [ ] **nenhuma letra**, exceto o `C` dentro do círculo do selo `©`.

---

## 3. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é | Prioridade |
|---:|---|---:|---|---|---|---|
| 1 | **`obras.png`** | 1536 × 1056 | **3 × 3** de 512 × 352 | **opaco** | as 9 obras | **insubstituível** |
| 2 | `artistas.png` | **1200 × 1200** | 4 × 4 de **300** | alfa real | 4 artistas × 4 estados | importante |
| 3 | `carimbos-e-marcas.png` | 1024 × 768 | 4 × 3 de 256 | alfa real | 2 objetos, 2 selos e 8 marcas | importante |
| 4 | `bg-salao.png` | 1672 × 941 | imagem única | opaco | o salão da guilda, **com o meio vazio** | pode esperar |
| 5 | `cover-guilda-dos-criadores.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo | por último |

**O #1 é o jogo.** Sem as obras não há o que creditar, e é a única peça que a
criança olha por muito tempo.

**O #3 vem logo atrás**, porque a **marca de assinatura** é a resposta da fase
1.1: a marca que está desenhada no verso e a que a criança toca na bandeja são a
**mesma célula deste PNG**, na mesma escala. Se uma fosse `Graphics` e a outra
PNG, elas não seriam idênticas — e comparar as duas é o jogo inteiro.

**O #2 pode esperar um pouco**: sem os artistas, a janelinha mostra uma cápsula
com a inicial, e o nível 1 é avaliável assim. Perde-se a piada do autor errado,
que é o melhor momento do erro.

**O #4 pode esperar mais**: sem ele o salão é um degradê do tema com uma faixa
de mesa.

### O que continua sendo `Graphics`, e por quê

- **o verso inteiro da obra** — o bilhete, o filete e o arranjo mudam a cada
  fase, e PNG não muda. **O selo e a marca são estampados por cima**, do
  arquivo #3;
- **a plaquinha e a tinta que o carimbo deixa** — a tinta nasce, cresce e some;
- **a moldura da obra, a sombra dela na mesa, o mural e os três vãos** — a
  sombra é desenhada pelo código com a base medida, nunca pintada no PNG;
- **a bandeja e as peças de letra** — elas trocam de letra a cada fase;
- **a janelinha do autor, o balão, a plaquinha âmbar**, o cabeçalho, as
  bolinhas, as vidas, o `?`, as estrelas, o confete e as faíscas;
- **a caixa de fotos** — ela está pintada dentro do `bg-salao.png` e não é
  objeto: a obra só desliza de cima dela.

**A interface não imita o traço da arte.** O cabeçalho, a bandeja e a plaquinha
ficam lisos, retos e de canto redondo, de propósito — `Graphics` tentando imitar
tinta variável sai torto, e a separação entre "o que é o jogo" e "o que é o
mundo" fica mais clara assim.

---

## 4. `obras.png` — as nove obras

### Contrato da folha

- **1536 × 1056**, grade **3 colunas × 3 linhas** de **512 × 352**, **fundo
  opaco** (a obra preenche a célula inteira).
- **A linha é o nível, a coluna é a fase:** `frame = nível × 3 + fase`.
- Cada célula é **a obra e nada mais**: sem moldura, sem borda, sem margem
  branca, sem sombra, sem parede atrás, sem fita adesiva, sem cantoneira.
- Na tela ela aparece a **460 × 300** — e a 138 × 90 no celular.

| Frame | Fase | A obra |
|---:|---|---|
| 0 | 1.1 | o pôr do sol atrás de um varal de roupas |
| 1 | 1.2 | um gato listrado dormindo dentro de uma caixa de papelão |
| 2 | 1.3 | os canteiros da horta da escola |
| 3 | 2.1 | *a música da chuva* — a janela molhada, que é a capa dela |
| 4 | 2.2 | o pé chutando a bola no campinho de terra |
| 5 | 2.3 | o foguete desenhado a lápis de cor |
| 6 | 3.1 | **a foto misteriosa** — a ponte de pedra na neblina |
| 7 | 3.2 | o retrato antigo de duas pessoas de costas, de mãos dadas |
| 8 | 3.3 | o barquinho no mar, no fim da tarde |

**A linha 2 é a linha das obras sem dono**, e as três têm de ser as mais
bonitas da folha. **O frame 5 é um desenho dentro do desenho**: ele tem de
parecer feito a lápis de cor sobre papel, com o papel visível — é a única
célula com textura de material.

### Prompt copiável

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown, never pure black, the line
weight varying — heavier around the outer silhouette, finer for the details
inside; rich saturated colours; SOFT CEL SHADING, one clear shadow tone plus a
gentle ambient gradient and a warm bounce light, clean and graphic, never
painterly; warm friendly daylight. Take ONLY the art style from the attached
images: do NOT copy their characters, their creatures, their clothes, their
poses, their scene, their lettering or their framing.

Sprite sheet, 3 columns by 3 rows, 512x352 px per cell, landscape cells, opaque
backgrounds, every cell filled edge to edge with its own picture, no grid lines
drawn, no cell borders, no white margins, no frames around the pictures.

Nine separate pictures, each one a complete little artwork by itself, all in the
same style and the same level of finish:

Row 1, cell 1: an orange sunset sky behind a backyard washing line with a few
clothes pegged on it, seen from below.
Row 1, cell 2: a striped tabby cat curled up asleep inside a cardboard box on a
wooden floor.
Row 1, cell 3: the vegetable beds of a school garden, neat rows of lettuce and
small seedlings in dark soil, a watering can at the edge.
Row 2, cell 1: a window from the inside on a rainy day, water running down the
glass, a warm mug on the sill, the street outside blurred and blue.
Row 2, cell 2: a close low view of a foot kicking a football on a bare dirt
pitch, dust rising.
Row 2, cell 3: a rocket drawn in coloured pencil on a sheet of paper — this cell
alone must look like a hand drawing on visible paper grain, with pencil strokes
and slightly uneven colour.
Row 3, cell 1: a stone bridge in morning mist over still water, soft and
beautiful, the most striking picture of the whole sheet.
Row 3, cell 2: an old faded portrait photograph of two people seen from behind,
holding hands, warm washed-out colours.
Row 3, cell 3: a small wooden boat far out on a calm sea at the end of the
afternoon, long golden light.

The three pictures in the bottom row must be the most beautiful ones on the
sheet. No people's faces anywhere. Every picture reads clearly at 138x90 px.

DO NOT INCLUDE: frames, borders, picture frames, mounts, mats, passe-partout,
white margins, drop shadows, tape, corner tabs, pins, easels, walls behind the
pictures, a gallery, a desk or table under the pictures, hands holding the
pictures, faces, portraits facing the viewer, signatures, text, letters, words,
labels, digits, numbers, captions, watermark, logo, title lettering, user
interface, buttons, panels, speech bubbles, arrows, icons, HUD, painterly
lineless illustration, soft airbrushed gradients, heavy rendering, rough sketchy
wobbly outlines, child's felt-tip doodle style, totally flat colour with no
shading at all, white sticker keyline, anime or manga style, chibi
super-deformed proportions, 3D render, photorealistic, dragons, gryphons,
medusas, skeletons, gargoyles, monsters, fantasy creatures, animal people,
pointed elf ears, wings, horns, blur, lens flare, heavy noise, grid lines,
visible sprite-sheet borders, cell borders, gaps, cropped edges.
~~~

### Conferência

- [ ] 9 células, 3 × 3, na ordem `nível × 3 + fase`;
- [ ] cada célula **preenchida de ponta a ponta**, sem margem e sem moldura;
- [ ] **nenhuma sombra e nenhuma borda pintada** — as duas são `Graphics`;
- [ ] o frame 5 parece lápis de cor sobre papel, e é o único assim;
- [ ] as três da linha 2 são as mais bonitas da folha;
- [ ] nenhuma assinatura pintada dentro da obra — a assinatura mora no verso;
- [ ] reduza a 138 × 90 px: dá para dizer o que cada uma é?

---

## 5. `artistas.png` — as quatro crianças artistas

### Contrato da folha

- **1200 × 1200**, grade **4 colunas × 4 linhas** de **300 × 300**, alfa real.
  *(a folha chegou assim em 18/09/2026; o pedido original era 256. Quem manda é
  o arquivo — a grade vive em `data/files.ts`.)*
- **Do peito para cima**, de frente com um leve três-quartos, centralizado na
  célula.
- **A linha é o artista, a coluna é o estado**, e o índice é contrato com o
  código: `frame = artista × 4 + estado`.
- Na tela, dentro da janelinha de 300 × 300 — **90 px reais** no celular.

| Linha | Quem é | Como se reconhece a 90 px |
|---:|---|---|
| 0 | **Lia** | tranças escuras com fitas amarelas, camiseta verde, sardas |
| 1 | **Tom** | cabelo ruivo espetado, óculos redondos grandes, camiseta listrada |
| 2 | **Nina** | cabelo cacheado volumoso preso com uma bandana, jardineira jeans |
| 3 | **Davi** | careca de corte baixinho, camiseta azul com um bolso, sorriso largo |

| Coluna | Estado | Frame da Lia |
|---:|---|---:|
| 0 | esperando | 0 |
| 1 | agradecendo | 1 |
| 2 | explicando | 2 |
| 3 | confuso | 3 |

**Os quatro se separam por cabelo e cor de camiseta** — nunca por um detalhe
pequeno. A 90 px, um brinco ou um bolso não existem, e é por isso que o Davi
tem a cabeça raspada: é a silhueta mais distinta das quatro.

**A camiseta e o cabelo são os mesmos nas quatro células da linha.** Se um
acessório mudar entre colunas, a troca de estado vira um pulo.

### Prompt copiável

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown, never pure black, the line
weight varying — heavier around the outer silhouette, finer for the details
inside; rich saturated colours; SOFT CEL SHADING, one clear shadow tone plus a
gentle ambient gradient and a warm bounce light, clean and graphic, never
painterly; expressive cartoon faces with large round eyes showing a clear iris,
a pupil and one small highlight, thick shaped eyebrows, wide open mouths; a
head slightly larger than natural on a normal kid body, with chunky simple
hands. Take ONLY the art style from the attached images: do NOT copy their
characters, their creatures, their clothes, their poses, their scene, their
lettering or their framing.

Sprite sheet, 4 columns by 4 rows, 300x300 px per cell, the same drawing style
and the same scale in every cell, transparent background, no grid lines drawn,
no cell borders, no ground shadow.

Four different human kid artists, about ten years old, shown from the chest up,
facing the viewer at a slight three-quarter angle, centred in the cell. Each ROW
is the SAME child four times, with the same hair and the same t-shirt in all
four cells — only the arms, the hands and the face change across the row.

Row 1: a girl with dark braided hair tied with yellow ribbons, freckles, a green
t-shirt.
Row 2: a boy with spiky red hair and big round glasses, a striped t-shirt.
Row 3: a girl with big voluminous curly hair held back by a bandana, denim
dungarees over a plain top.
Row 4: a boy with a closely shaved head, a wide smile, a blue t-shirt with a
chest pocket.

Column 1 — WAITING: arms folded across the chest, relaxed, a small closed smile,
eyes looking straight ahead.
Column 2 — THANKING: both hands raised and waving happily, leaning slightly
towards the viewer, eyes drawn as happy upward curves, big open smiling mouth.
Column 3 — EXPLAINING: one hand open and turned up towards the viewer, the other
holding a small blank wooden sign at chest height, eyebrows level, mouth open
mid-sentence, a kind patient expression — friendly, never telling anyone off.
Column 4 — PUZZLED: both hands open and turned up out to the sides, shoulders
raised in a shrug, head tilted, one eyebrow raised, mouth a small wavy unsure
line. This is honest confusion, not anger and not sadness.

The difference between the four cells of a row must read at 90 px tall: the arms
carry the state, not the eyebrows.

DO NOT INCLUDE: scolding, telling off, angry faces, frowns, crossed eyebrows,
hands on hips, a pointing finger, wagging a finger at the viewer, crying, tears,
adults, teachers, grown-ups, full body, legs, ground, floor, shadow under the
figure, scenery, walls, furniture behind the children, different hair or
different clothes between cells of the same row, writing on the wooden sign,
text, letters, words, labels, digits, numbers, captions, watermark, logo, title
lettering, user interface, buttons, panels, frames, speech bubbles, arrows,
icons, HUD, glow, halo, coloured light on the characters, painterly lineless
illustration, soft airbrushed gradients, heavy rendering, rough sketchy wobbly
outlines, child's felt-tip doodle style, totally flat colour with no shading at
all, white sticker keyline, anime or manga style, chibi super-deformed
proportions, 3D render, photorealistic, dragons, gryphons, medusas, skeletons,
gargoyles, monsters, fantasy creatures, animal people, pointed elf ears, wings,
horns, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders,
cell borders, gaps, cropped edges, drop shadow on the cell, white backing in
transparent assets.
~~~

### Conferência

- [ ] 16 células, 4 × 4 de 300, na ordem `artista × 4 + estado`;
- [ ] a mesma criança nas quatro células da linha: mesmo cabelo, mesma camiseta;
- [ ] **reduza a 90 px** e tape a cara: dá para dizer qual estado é qual só pelos
      braços?
- [ ] a plaquinha da coluna 2 está **vazia**, sem uma letra;
- [ ] "explicando" e "confuso" são gentis — ninguém está bravo;
- [ ] são **crianças**, não adultos, e nenhuma é criatura;
- [ ] alfa real, sem chão, sem sombra, sem halo.

---

## 6. `carimbos-e-marcas.png` — os carimbos, os selos e as assinaturas

### Contrato da folha

- **1024 × 768**, grade **4 colunas × 3 linhas** de **256 × 256**, alfa real.
- **A linha 0 são objetos e selos; as linhas 1 e 2 são as oito marcas de
  assinatura.**

| Frame | O que é | Onde aparece |
|---:|---|---|
| 0 | **o carimbo de madeira**, de três quartos, com a **face de borracha vazia** | na bandeja, e afundando na plaquinha |
| 1 | **a campainha de balcão**, de metal | na bandeja, do nível 2 em diante |
| 2 | **o selo `©`** — um círculo grosso com um `C` dentro | no verso da obra, e na tinta da plaquinha |
| 3 | **o selo do cadeado** — um cadeado fechado, de frente | no verso da obra, no nível 2 |
| 4–7 | as marcas: **sol · raio · estrela · coração** | no verso, na bandeja e na plaquinha |
| 8–11 | as marcas: **gato · lua · folha · peixe** | idem |

**A face do carimbo é VAZIA, e isso não é economia.** É o mesmo corpo de madeira
para o `©` do nível 1 e para a marca da própria criança no nível 3 — quem pinta
a face é o `Graphics`, com o frame do selo por cima. Um carimbo com o `©` gravado
serviria a um nível só.

**As oito marcas são tinta, não objeto.** Elas são chapadas, de **uma cor só**,
com o mesmo traço firme mas **sem sombra nenhuma** — é o contrário do resto da
folha, e é de propósito: marca de assinatura é o que ficou no papel.

**A marca tem de ser reconhecível a 90 px** dentro da peça da bandeja, e as oito
têm de ser distinguíveis **entre si** nesse tamanho: sol e estrela são o par
mais arriscado, então o sol leva raios retos e miolo cheio, e a estrela é de
cinco pontas e vazada.

### Prompt copiável

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown, never pure black, the line
weight varying — heavier around the outer silhouette, finer for the details
inside; rich saturated colours; SOFT CEL SHADING, one clear shadow tone plus a
gentle ambient gradient and a warm bounce light, clean and graphic, never
painterly. Take ONLY the art style from the attached images: do NOT copy their
characters, their creatures, their clothes, their poses, their scene, their
lettering or their framing.

Sprite sheet, 4 columns by 3 rows, 256x256 px per cell, transparent background,
each object centred in its own cell, no grid lines drawn, no cell borders, no
ground shadow.

Row 1 — four objects, drawn with the full shading described above:
cell 1: a wooden hand stamp seen at a three-quarter angle, a rounded wooden
handle on a square base, the rubber stamping face turned towards the viewer and
COMPLETELY BLANK — no mark, no letter, no engraving on it at all.
cell 2: a round metal desk bell, the kind with a button on top, shiny brass.
cell 3: a copyright seal — one thick circle outline with a single letter C
centred inside it, drawn as a bold graphic mark, not as typography.
cell 4: a closed padlock seen from the front, chunky and simple, the shackle
shut.

Rows 2 and 3 — eight signature marks. These are INK MARKS, not objects: each one
is a single flat solid colour with the same confident outline but with NO
shading, NO gradient and NO highlight, like a mark pressed onto paper. Each one
fills most of its cell and is simple enough to recognise at 90 px:
cell 5: a sun with straight rays and a solid filled centre.
cell 6: a lightning bolt.
cell 7: a five-pointed star, outlined and hollow in the middle.
cell 8: a heart.
cell 9: a simple cat face, two ears, whiskers, no body.
cell 10: a crescent moon.
cell 11: a single leaf with a centre vein.
cell 12: a small fish seen from the side.

The eight marks must be clearly distinguishable from each other at 90 px: keep
the sun and the star different, the sun filled and rayed, the star hollow.

DO NOT INCLUDE: any mark, letter, symbol or engraving on the face of the wooden
stamp, ink on the stamp, a stamped impression on the ground, paper, desk, table,
ink pad, hands holding the objects, shading on the eight marks in rows 2 and 3,
gradients on those marks, highlights on those marks, any letters or words
anywhere except the single letter C inside the circle in cell 3, digits,
numbers, labels, captions, watermark, logo, title lettering, user interface,
buttons, panels, frames, speech bubbles, arrows, HUD, glow, halo, painterly
lineless illustration, soft airbrushed gradients, heavy rendering, rough sketchy
wobbly outlines, child's felt-tip doodle style, white sticker keyline, anime or
manga style, 3D render, photorealistic, dragons, gryphons, medusas, skeletons,
gargoyles, monsters, fantasy creatures, blur, lens flare, heavy noise, grid
lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, drop
shadow on the cell, white backing in transparent assets.
~~~

### Conferência

- [ ] 12 células, 4 × 3, na ordem da tabela;
- [ ] **a face do carimbo está vazia** — nenhuma marca gravada nela;
- [ ] o `C` do frame 2 é a **única letra da folha inteira**;
- [ ] as oito marcas são **chapadas**, sem uma sombra sequer;
- [ ] reduza as oito a 90 px: dá para distinguir sol de estrela?
- [ ] alfa real, sem chão, sem sombra, sem halo.

---

## 7. `bg-salao.png` — o salão da guilda

### Contrato

- **1672 × 941**, imagem única, opaca. O jogo mostra 1280 × 720 dela — a folga
  é o que sobra fora do quadro no `Scale.FIT`.
- **O meio tem de estar vazio.** A obra, a plaquinha e a bandeja ocupam de
  `y 220` a `y 720` no centro, e o que estiver pintado ali vai ficar escondido
  atrás de peça de jogo o tempo todo.
- O fundo leva um `preFX.addBlur` fraquíssimo e um véu por cima — então ele tem
  de funcionar **escurecido e levemente fora de foco**.

| Faixa da tela | O que tem de estar lá |
|---|---|
| **y 0–82** | o alto da parede, que fica sob o cabeçalho — **liso** |
| **y 86–212** | **a parede do mural**, limpa e clara: é onde os três vãos vão ser desenhados, e ela não pode ter quadro nenhum pendurado |
| **y 220–530** | **vazio** — só a parede continuando, desfocada |
| **y 530–720** | **o tampo da mesa de trabalho**, de madeira clara, atravessando a tela inteira |
| **x 0–300, y 300–560** | **a caixa de fotos**: uma caixa de papelão aberta sobre a mesa, com algumas obras espiando para fora |
| **canto superior** | bandeirinhas de festa cruzando o alto da parede, sem descer do y 212 |

### Prompt copiável

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown, never pure black, the line
weight varying — heavier around the outer silhouette, finer for the details
inside; rich saturated colours; SOFT CEL SHADING, one clear shadow tone plus a
gentle ambient gradient and a warm bounce light, clean and graphic, never
painterly; warm friendly daylight. Take ONLY the art style from the attached
images: do NOT copy their characters, their creatures, their clothes, their
poses, their scene, their lettering or their framing. NO white sticker keyline
here — this is a full scene, not a cut-out.

A single wide background illustration, 1672x941, of an empty children's makers
club hall set up for a party, seen straight on from the front, as a flat stage
with no perspective vanishing into the distance.

The top third is a clean pale wall with nothing hanging on it — completely bare,
smooth and empty, brightly lit. Paper party bunting is strung across the very
top of the wall only, near the ceiling, and does not hang down into the middle
of the picture.

The middle of the picture is EMPTY: just the same bare wall continuing
downwards, with nothing in front of it.

The bottom third is a long light wooden worktable running the full width of the
picture, seen from the front, its surface clean and clear.

On the far left, standing on the table, an open cardboard box with a few
pictures inside it, their backs to the viewer, leaning out of the box.

The entire centre and right of the table are clear and empty. The picture has to
still read when it is darkened and slightly out of focus.

DO NOT INCLUDE: anything in the middle of the picture, pictures or frames hanging
on the wall, banners, heraldic shields, crests, coats of arms, tapestries,
medieval guild hall, tavern, castle interior, stone walls, torches, posters,
shelves, clutter, plants, lamps hanging down, people,
children, faces, hands, chairs, easels, a second table, deep perspective, a
vanishing point, a tilted camera, text, letters, words, labels, digits, numbers,
captions, watermark, logo, title lettering, user interface, buttons, panels,
frames, speech bubbles, arrows, icons, HUD, question mark button, painterly
lineless illustration, soft airbrushed gradients, heavy rendering, rough sketchy
wobbly outlines, child's felt-tip doodle style, white sticker keyline, anime or
manga style, 3D render, photorealistic, dragons, gryphons, medusas, skeletons,
gargoyles, monsters, fantasy creatures, blur, lens flare, heavy noise, vignette,
dark corners.
~~~

### Conferência

- [ ] a parede de `y 86` a `y 212` está **inteiramente vazia** — nenhum quadro;
- [ ] o centro está vazio de `y 220` a `y 530`;
- [ ] o tampo da mesa atravessa a tela inteira e está limpo à direita;
- [ ] a caixa está à esquerda, sobre a mesa, e não passa de `x 300`;
- [ ] as bandeirinhas não descem do `y 212`;
- [ ] escureça 50 % e desfoque de leve: ainda se lê?

---

## 8. `cover-guilda-dos-criadores.png` — a capa do catálogo

### Contrato

- **1672 × 941**, imagem única, opaca. Ela aparece como miniatura no índice, e
  o título vem por cima em HTML — **nenhuma letra na imagem**.
- A capa tem de contar o jogo numa olhada: **uma criança virando uma obra e
  achando a assinatura atrás**.

### Prompt copiável

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: a modern middle-grade graphic novel / animated show style.
Confident smooth ink outlines in a warm dark brown, never pure black, the line
weight varying — heavier around the outer silhouette, finer for the details
inside; rich saturated colours; SOFT CEL SHADING, one clear shadow tone plus a
gentle ambient gradient and a warm bounce light, clean and graphic, never
painterly; expressive cartoon faces with large round eyes showing a clear iris,
a pupil and one small highlight, thick shaped eyebrows, wide open mouths; a head
slightly larger than natural on a normal kid body, with chunky simple hands;
warm friendly daylight. Take ONLY the art style from the attached images: do NOT
copy their characters, their creatures, their clothes, their poses, their scene,
their lettering or their framing. NO white sticker keyline here — this is a full
scene, not a cut-out.

A single cover illustration, 1672x941, landscape.

A human girl of about ten with dark braided hair tied with yellow ribbons,
freckles and a green t-shirt, standing behind a light wooden worktable, holding
a picture up with both hands and turning it around towards herself. She is
seeing the BACK of the picture for the first time and her face is lighting up
with surprise and delight — eyebrows up, big open smile.

The back of the picture is turned towards the viewer: a plain pale card back
with one bold hand-drawn sun mark inked on it, near the top, and nothing else on
it. Only that one sun mark — no writing of any kind.

Behind her, a clean pale wall with three empty picture spaces marked out on it
and one picture already hung, with a small blank golden plaque under it. Paper
party bunting across the top of the wall. On the table beside her, an open
cardboard box with more pictures leaning out of it, and a wooden hand stamp.

This is a children's makers club hall dressed for a party — warm and homemade,
never a medieval guild, a tavern or a fantasy hall.

Warm, celebratory, curious. The picture reads at thumbnail size: the girl, the
turned picture and the sun mark on its back are the three things that must be
clear.

DO NOT INCLUDE: writing on the back of the picture, a signature in letters, a
name, text, letters, words, labels, digits, numbers, captions, watermark, logo,
title lettering, user interface, buttons, panels, frames, speech bubbles,
arrows, icons, HUD, question mark button, other children, adults, teachers,
crowds, deep perspective, a tilted camera, painterly lineless illustration, soft
airbrushed gradients, heavy rendering, rough sketchy wobbly outlines, child's
felt-tip doodle style, white sticker keyline, anime or manga style, chibi
super-deformed proportions, 3D render, photorealistic, dragons, gryphons,
medusas, skeletons, gargoyles, monsters, fantasy creatures, animal people,
pointed elf ears, wings, horns, blur, lens flare, heavy noise, vignette.
~~~

### Conferência

- [ ] a menina é a Lia da linha 0 de `artistas.png` — mesmas tranças, mesmas
      fitas, mesma camiseta;
- [ ] o verso está virado para o espectador e tem **só a marca do sol**;
- [ ] **nenhuma letra na imagem**;
- [ ] a 320 × 180 px: dá para ver que ela está virando alguma coisa?

---

## 9. Depois que a arte chegar

1. **Meça a caixa alfa de `artistas.png`** célula por célula, com o script de
   `System.Drawing` do `EF05CO08`: `originX = (dx + w/2) / 256` por célula, e
   **uma escala só para os quatro**, tirada da maior altura medida. Sem isso o
   artista escorrega de lado a cada troca de estado, como se ele andasse dentro
   da janelinha.
2. **`carimbos-e-marcas.png` é o contrário**: ancore pelo **centro da célula**,
   não pela caixa alfa. As oito marcas têm massas diferentes, e ancorar pelo
   alfa faria a assinatura do verso pousar num lugar diferente da assinatura da
   bandeja — que é justamente a comparação que o jogo pede.
3. **Amostre a cor** da madeira da mesa e da parede com `GetPixel`, no mesmo
   script, e leve para `data/theme.ts`: a moldura, a plaquinha e a bandeja em
   `Graphics` têm de falar a mesma língua do PNG.
4. **Confira a marca nos dois lugares ao mesmo tempo**: ponha a fase 1.1 na
   tela, vire a obra e compare o sol do verso com o sol da bandeja. Se não forem
   idênticos em tamanho e cor, a fase mais fácil do jogo vira a mais difícil.
5. **Apague uma textura de cada vez** e jogue o nível 1 inteiro: o jogo tem de
   continuar avaliável com qualquer uma faltando, e com todas faltando.

---

## 10. O que a arte obrigou, depois de chegar (18/09/2026)

As quatro folhas foram geradas e o nível 1 foi codificado em cima delas. Três
coisas ficaram diferentes do que este documento pedia:

- **`artistas.png` veio 1200 × 1200**, célula de 300. A grade real está em
  `data/files.ts`, e as 16 caixas alfa medidas estão em `ARTIST_BOX`, no
  `layout.ts`. O `originX` varia de **0,462 a 0,530** — 10 px de deriva lateral
  se o artista fosse ancorado pelo centro da célula, o bastante para ele parecer
  andar dentro da janelinha a cada troca de estado.
- **O carimbo (frame 0) veio com a face de borracha virada para baixo**, e não
  de frente como o contrato pedia. Não atrapalha: a face continua vazia, a peça
  se lê como carimbo na bandeja, e a tinta que ela deixa na plaquinha continua
  sendo o frame 2 (o selo `©`) desenhado por cima. **Não precisa regerar.**
- **A obra encolheu para 416 × 286 na tela** (de 448 × 308) para as plaquinhas
  douradas do mural não ficarem escondidas atrás dela. A célula de `obras.png`
  não mudou — 512 × 352, proporção 1,4545 —, só o tamanho de exibição.

**As cores do `Graphics` saíram do `GetPixel` no `bg-salao.png`** e estão em
`data/theme.ts`: parede `#FAF1D8`, tampo `#FAC37C`, frente da mesa `#9C5F34`,
risco da madeira `#6B3818`, papelão `#DBA26A`. A borda do tampo cai em **y 536**
na tela, e é ela que fixa onde a plaquinha pousa e onde a prateleira da bandeja
começa.

**Ainda falta** `cover-guilda-dos-criadores.png` (§8). Sem ela o jogo aparece no
catálogo sem miniatura — funciona, mas fica sem capa no índice.
