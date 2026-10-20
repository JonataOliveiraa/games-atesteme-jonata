# Pula-Pula na Internet — texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF05CO08/pula-pula-na-internet/`

**Este jogo não tem folha de textura. A arte final é o Graphics.** Decisão do usuário (20/10/2026): *"o jogo nem precisa de textura, ele é muito simples. Talvez só algumas imagens e estilo vetorial."* O celular, as abas, a nuvem, a antena, os ícones e o céu são formas simples (retângulo de canto redondo, cápsula, círculo), e é assim que o Graphics já os desenha em `scenes/fallback.ts`. Gerar imagem para eles só trocaria uma forma chapada por outra igual.

**Viram imagem só as fotos e a capa:**

| Arquivo | Tamanho | Alfa | Por quê |
|---|---|---|---|
| `foto-<nome>.png` (6 arquivos, §3) | gerar em 1200 × 780, entregar em 600 × 390 | opaco | as fotos que aparecem **dentro do cartão**. Cena (rua alagada, dinossauro, discos voadores) é o que o Graphics não desenha bem |
| `cover-pula-pula-na-internet.png` | 1672 × 941 | opaco | a capa do catálogo, **com o título** |

**Entregues em 20/10/2026** (as 6 fotos e a capa, geradas pelo Codex; ver `MANIFEST.md` na pasta de destino). O `BootScene` carrega cada `foto-<nome>.png` que existir na pasta; a que faltar usa a cena de reserva desenhada no Graphics (`scenes/fallback.ts`, mesmo nome de textura).

## 1. A linha de arte: vetor geométrico chapado

A mesma do Cabo Certo ([`references/ESTILO-VETOR-GEOMETRICO.md`](../../../../references/ESTILO-VETOR-GEOMETRICO.md)). Anexe em **toda geração** `references/23-vetor-geometrico-a.webp` e `references/24-vetor-geometrico-b.png`. Ela casa com o que o Graphics já desenha: forma chapada, sem contorno, sem sombra, cor saturada. O elenco das referências (a coruja verde, o urso, as pessoas da marca) vai no negativo.

O Graphics segue as mesmas regras, e é isso que mantém a foto e o resto do jogo na mesma família:
- **sem contorno** em nada; as formas se separam pela cor;
- **no máximo um painel chapado mais escuro** por peça;
- **raio de canto generoso e igual** em tudo;
- paleta curta e alegre.

## 2. Regras das fotos

- **Uma imagem por arquivo**, 1200 × 780, de ponta a ponta, sem moldura (o código põe a moldura branca).
- **Nenhum texto.** Nem placa, nem letreiro, nem marca d'água. A legenda e as pistas são do código.
- **As falsas mostram o absurdo** (pedido do usuário, 20/10/2026: invasão alienígena, dinossauro na rua…). Por isso existem também **fotos estranhas mas verdadeiras** (as capivaras na faixa, no N2): a foto sozinha nunca decide, quem decide são as três pistas. Se só as fotos falsas fossem estranhas, a imagem entregaria a resposta.
- **Nada assusta.** Absurdo é engraçado, não perigoso: ninguém ferido, ninguém fugindo em pânico, nenhum dente à mostra.
- Gente aparece pequena, de longe, com rosto simples.

## 3. As fotos, uma por prompt

**No máximo 6 fotos** (pedido do usuário, 20/10/2026): **1 no N1, 2 no N2, 3 no N3**. Os outros conteúdos são notícia ou mensagem, sem foto. A validação de `data/levels.ts` confere a conta (fotos do nível = número do nível) e que nenhuma foto se repete.

| Nível | Arquivo | Cena | Manchete · fonte | Resposta |
|---|---|---|---|---|
| N1 | `foto-alienigenas.png` | discos voadores na praça | *ALIENÍGENAS POUSARAM NA PRAÇA!!!* · Perfil @misterios | NÃO CONFIE (as três pistas ruins) |
| N2 | `foto-capivaras.png` | capivaras atravessando a faixa | *UAU!!! CAPIVARAS PARAM O TRÂNSITO NO LAGO!!!* · Grita Notícia | PODE CONFIAR (grita e é estranha, mas tem as três) |
| N2 | `foto-enchente.png` | rua alagada de verdade | *Olha a enchente na nossa rua HOJE!* · Perfil @noticiasja | NÃO CONFIE (a foto é de 2015) |
| N3 | `foto-dinossauro.png` | dinossauro no centro | *Dinossauro escapou do museu e passeia pelo centro* · Site Saber Tudo | NÃO CONFIE (copiou de perfil sem nome) |
| N3 | `foto-piscina.png` | piscina do clube, normal | *A piscina do clube fechou PARA SEMPRE!!!* · Perfil @fofoqueiro | NÃO CONFIE ("ouvi no vestiário") |
| N3 | `foto-lua.png` | lua cheia sobre telhados | *A lua cheia de ontem, vista do pátio* · Site da Escola | PODE CONFIAR |

### `foto-piscina.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated, cheerful palette. Take ONLY the construction technique: do NOT copy
any character, mascot, bird, bear or person from the reference images.

FORMAT: one single picture, fully OPAQUE, landscape 1200 x 780, full-bleed edge
to edge, no frame, no border, no rounded corners. Framed like a phone snapshot
taken from a few metres away, the kind of photo that gets posted online.

SCENE: a club's outdoor swimming pool on a sunny afternoon, seen from its edge.
A big turquoise rectangular pool with lighter capsule-shaped ripples and one
darker panel on the inner wall, a metal ladder made of two grey capsules with
two rungs, a light sand-coloured deck, three white lounge chairs in a row, a
red-and-white round umbrella, a small palm tree in a round pot, a light blue sky.
Nobody is swimming, but the pool is clean and completely normal: nothing broken,
nothing closed.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, words, numbers,
signs with writing, watermarks, frames, borders, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, warning tape, barriers, closed
signs, broken tiles, dirty water.
~~~

### `foto-enchente.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: one single picture, fully OPAQUE, landscape 1200 x 780, full-bleed edge
to edge, no frame, no border, no rounded corners. Framed like a phone snapshot
taken from a few metres away, the kind of photo that gets posted online. People
are small, seen from a distance, with simple dot eyes.

SCENE: a street of low, colourful rounded houses (peach, lilac, mint) with
rounded-triangle roofs, right after heavy rain. Calm brown water floods the
street up to the doors, with lighter capsule-shaped ripples. A tree stands half
in the water. Overcast grey-blue sky with flat grey clouds. One small red rowing
boat with two tiny people in yellow raincoats rows calmly down the street.
Nobody is in danger. It looks like a real, ordinary flood.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, words, numbers,
signs with writing, watermarks, frames, borders, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, sharks, animals, anything absurd,
people in the water, floating cars.
~~~

### `foto-lua.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated palette. Take ONLY the construction technique: do NOT copy any
character, mascot, bird, bear or person from the reference images.

FORMAT: one single picture, fully OPAQUE, landscape 1200 x 780, full-bleed edge
to edge, no frame, no border, no rounded corners. Framed like a phone snapshot
taken from the school yard, the kind of photo that gets posted online.

SCENE: a calm night over the school. A deep navy sky with small white dot stars
and one tiny four-point sparkle. A big pale cream full moon, high on the right,
with a few soft grey round craters and one darker crescent panel. Below, the dark
silhouette of rooftops with rounded-triangle roofs and one round tree, in a
darker navy, with three warm yellow lit windows. Quiet and peaceful.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, words, numbers,
signs with writing, watermarks, frames, borders, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, a face on the moon, planets,
spaceships, wolves, anything spooky.
~~~

### `foto-alienigenas.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated, cheerful palette. Take ONLY the construction technique: do NOT copy
any character, mascot, bird, bear or person from the reference images.

FORMAT: one single picture, fully OPAQUE, landscape 1200 x 780, full-bleed edge
to edge, no frame, no border, no rounded corners. Framed like a phone snapshot
taken from a few metres away, the kind of photo that goes viral online. People
are small, seen from a distance, with simple dot eyes.

SCENE: a small town square at dusk, with a round fountain in the middle,
benches and rounded lamp posts. Above it hover three shiny flying saucers: wide
silver capsules with a glass dome on top and a ring of round coloured lights
underneath. The nearest one shines a soft pale-green cone of light down onto the
fountain, and through its dome a cute little green alien with big round eyes
waves hello. Small townspeople at the edges of the square stop, look up and
point, curious and amazed. Purple and orange dusk sky with the first stars. It
should look exciting and obviously unbelievable, but friendly, never scary.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, words, numbers,
signs with writing, watermarks, frames, borders, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, weapons, lasers hitting people,
explosions, fire, destroyed buildings, scary monsters, tentacles, people running
in panic, blood.
~~~

### `foto-dinossauro.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated, cheerful palette. Take ONLY the construction technique: do NOT copy
any character, mascot, bird, bear or person from the reference images.

FORMAT: one single picture, fully OPAQUE, landscape 1200 x 780, full-bleed edge
to edge, no frame, no border, no rounded corners. Framed like a phone snapshot
taken from a sidewalk, the kind of photo that goes viral online. People are
small, seen from a distance, with simple dot eyes.

SCENE: a sunny downtown street with low pastel shops, a crosswalk of white
capsule stripes and two small rounded cars stopped at it. A huge, friendly
long-necked dinosaur — teal-green, built from capsules, with a lighter belly
panel and a calm smiling face — walks slowly down the middle of the street, its
head higher than the rooftops, nibbling leaves from a tall round street tree.
Small people on the sidewalks stop and look up in surprise, a few holding up
phones to take pictures. Light blue sky, round sun. Funny and obviously
unbelievable, never scary.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, words, numbers,
signs with writing, watermarks, frames, borders, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, T-rex, sharp teeth, roaring,
attacking, broken cars, crushed buildings, people running in fear, blood.
~~~

### `foto-capivaras.png`

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated, cheerful palette. Take ONLY the construction technique: do NOT copy
any character, mascot, bird, bear or person from the reference images.

FORMAT: one single picture, fully OPAQUE, landscape 1200 x 780, full-bleed edge
to edge, no frame, no border, no rounded corners. Framed like a phone snapshot
taken from the side of the road, the kind of photo that gets posted online.
People are small, seen from a distance, with simple dot eyes.

SCENE: a park road beside a calm blue lake, green grass and round trees. A
family of capybaras — big rounded brown bodies, a darker brown back panel,
small round ears, calm faces — crosses a crosswalk of white capsule stripes in a
neat line, two little babies following at the end. A small rounded car and a
cyclist wait patiently. Sunny and ordinary: a little funny, but completely real.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, words, numbers,
signs with writing, watermarks, frames, borders, outlines, black ink lines,
shading, gradients, 3D render, photorealistic, people chasing the animals, cars
hitting animals, anything magical or impossible.
~~~

## 4. `cover-pula-pula-na-internet.png` — 1672 × 941, opaco

O celular turquesa de olhos grandes no meio de um pulo, subindo por abas de navegador brancas, com a floresta embaixo, o céu e as montanhas no meio e o espaço com planetas no alto; um jornal, um balão amarelo com exclamação e uma foto flutuando sobre abas douradas. O título **PULA-PULA NA INTERNET** no alto, centralizado, em letras grandes, redondas e coloridas com contorno escuro (a única exceção ao "sem contorno" e ao "sem texto").

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: 100% flat vector made only of rounded rectangles, capsules,
circles and rounded trapezoids, with one generous corner radius everywhere; NO
outlines, NO black ink lines, NO shading, NO gradients, NO textures — shapes are
separated only by colour, with at most one flat darker panel per object; a short,
saturated, cheerful palette. Take ONLY the construction technique: do NOT copy
any character, mascot, bird, bear or person from the reference images.

A wide game cover, 1672 x 941, fully opaque. In the middle, a cute turquoise
SMARTPHONE character with a dark screen showing a big friendly face, two little
loose round hands and two little coral feet, jumping up between floating white
browser-tab platforms. The background climbs from a flat green forest at the
bottom, through a blue sky with mountains and clouds in the middle, to deep
purple space with planets and stars at the top. Over golden platforms float a
folded newspaper, a yellow chat bubble with an exclamation mark and a small
framed photo. Big, round, colorful title "PULA-PULA NA INTERNET" centered at the
top, with a dark outline around the letters.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, other text besides the title,
outlines on the drawing, shading, gradients, 3D render, photorealistic.
~~~

## 5. O que fica no Graphics, e como se ajusta

Tudo o mais é desenhado em `scenes/fallback.ts`, e **é a arte final** (refeita em 20/10/2026, na reforma do cenário por altitude). Para mudar uma peça, mude ali:

| Chave | O que é | Função em `fallback.ts` |
|---|---|---|
| `celular` | o celular em 6 poses (subindo, caindo, lendo, feliz, triste, tonto): tela escura, olhos de quadrado arredondado, mãos e pés soltos; pé em y = 240 da célula | `phone` |
| `itens` | notícia, mensagem, foto (os ícones que flutuam) | `item` |
| `pistas` | pessoinha, calendário, alfinete de lugar | `clue` |
| `foto-<nome>` | as 6 cenas de reserva do cartão (enquanto cada `foto-<nome>.png` não chega) | `PHOTO_ART` |
| `plataformas` | aba clara, aba escura (espaço), aba dourada (a da notícia), topo — esticadas pelo meio, 48 px de ponta | `platform` |
| `base-floresta` `base-nuvem` `base-lua` | o chão de largada de cada nível | `groundForest` `groundCloud` `groundMoon` |
| `topo` | a antena com a estrela | `summit` |
| `ceu-*` | os 6 degradês do céu (4 × 256, esticados) | `gradient` |
| `estrelas` | a trama de estrelas do espaço | `stars` |
| `pinheiro-longe` `pinheiro-perto` `arvore-longe` `arvore-perto` | as árvores da floresta | `pine` `roundTree` |
| `montanhas` | as duas cordilheiras com neve e o vale | `mountains` |
| `nuvem-a/b/c` `passaros` `balao` `aviao` | o céu | `cloud` `birds` `balloon` `plane` |
| `terra` `lua` `planeta-a` `planeta-b` `planeta-anel` `satelite` `nebulosa` `asteroide` `foguete` `cometa` | o espaço | `earth` `moon` `planet` `ringed` `satellite` `nebula` `asteroid` `rocket` `comet` |
| `painel` | o véu translúcido dos lados da coluna | `panel` |

O código ainda aceita um PNG com qualquer uma dessas chaves na pasta de destino (ele substitui o desenho sem mexer em código), mas nenhuma está prevista. Onde cada enfeite aparece, e em que altitude, está em `data/scenery.ts`.
