# Catapulta do Arquivo — texturas

Destino: `src/assets/games/EF05CO06/catapulta-do-arquivo/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§4 a tela, §5 os mapas, §6 a física).

**Hoje o jogo roda sem nenhum PNG.** O `scenes/fallback.ts` desenha em `Graphics` cada arquivo abaixo, com a mesma chave e a mesma grade. Um PNG com o nome do arquivo na pasta de destino substitui o desenho, sem mexer no código.

**Os mapas não têm imagem própria.** São quatro mapas largos (2000 a 2600 px), e o relevo vem de `data/maps.ts`. A arte entra por peças que se repetem: a **terra** é uma textura repetível recortada pelo formato do chão, a **tábua** estica até a largura de cada plataforma, e a grama e os túneis são desenhados pelo código.

**Com imagem de referência:** anexe em toda geração a `references/30-pop-chapado-a.jpg`. Todo prompt começa com o bloco STYLE e termina com o bloco negativo do §8.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho | Alfa | Recorte | Uso |
|---|---|---|---|---|---|---|
| `bg-ceu.png` | — | — | 1280 × 720 | opaco | — | céu fixo atrás de tudo (não anda com a câmera) |
| `terra.png` | — | — | 256 × 256 | opaco | — | a terra, **repetível sem emenda** nos quatro lados |
| `tabua.png` | — | — | 240 × 40 | sim | — | a tábua; o código estica o miolo (cantos de 18 px) |
| `aparelhos.png` | 3 × 2 | 320 | 960 × 640 | sim | **não** | gabinete aberto, HD interno, pen drive, cartão, HD externo, nuvem |
| `pecas.png` | 4 × 2 | 200 | 800 × 400 | sim | sim | vídeo, foto, música, trabalho, bolinha do arquivo, brilho, mola, mola apertada |
| `catapulta.png` | 1 × 1 | 320 | 320 × 320 | sim | **não** | a catapulta de elástico |
| `cover-catapulta-do-arquivo.png` | — | — | 1672 × 941 | opaco | — | capa com o título |

**A ordem das células é contrato** (`data/files.ts`). Nas folhas sem recorte, a posição dentro da célula também é.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Pedido, nomes e LOCAL/REMOTO são do código.
- **Nada na arte dá a resposta:** nenhum dispositivo tem rosto, seta, check, X ou cor de certo/errado.
- **O HD interno tem cara de peça de dentro** (metal nu, parafusos); **o HD externo tem cara de aparelho** (capa, pezinhos, luzinha, cabo).
- Tudo visto **de lado/de frente**, sem perspectiva forte.
- Os dispositivos aparecem também **miniaturizados no mapinha** (≈ 22 px): silhueta forte e cor clara ajudam.

## 3. `terra.png` — 256 × 256, opaco, repetível

Terra marrom quente com pedrinhas e manchinhas, **sem nada que denuncie a repetição** (nenhuma pedra grande, nenhuma linha). Ao lado de si mesma, nos quatro lados, não pode aparecer emenda.

## 4. `tabua.png` — 240 × 40, alfa

Uma tábua de madeira deitada, com contorno, um veio claro em cima e um preguinho em cada ponta. **As pontas (18 px de cada lado) não esticam**; o miolo sim, então ele precisa ser uniforme.

## 5. `aparelhos.png` — 3 × 2 células de 320, alfa, sem recorte

| Célula | Peça | Contrato |
|---|---|---|
| 0 | **gabinete aberto**, de frente, com ventoinha e um **compartimento vazio** | caixa ≈ 210 × 290 centrada; compartimento centrado em **(160, 175)**, ≈ 140 × 96 |
| 1 | **HD interno**: placa de metal nu, etiqueta lisa, 4 parafusos | ≈ 150 × 100, centrado (o código o encaixa no compartimento) |
| 2 | **pen drive** deitado, ponta USB à esquerda, argolinha | ≈ 200 × 90, centrado |
| 3 | **cartão de memória** em pé, canto cortado, contatos dourados | ≈ 120 × 150, centrado |
| 4 | **HD externo**: caixinha de capa arredondada, pezinhos, luzinha, toco de cabo | ≈ 170 × 120, centrado |
| 5 | **nuvem** fofa e branca, com sombra azulada embaixo | ≈ 240 × 160, centrada |

## 6. `pecas.png` — 4 × 2 células de 200, alfa, com recorte

| Célula | Peça |
|---|---|
| 0 | **vídeo**: claquete aberta |
| 1 | **foto**: fotinho com montanha e sol |
| 2 | **música**: nota dupla |
| 3 | **trabalho**: folha com linhas e lápis |
| 4 | **bolinha do arquivo**: esfera branca lisa com aro lilás, **vazia no meio** (o código põe o ícone do arquivo em cima) |
| 5 | **brilho**: estrelinha de 4 pontas amarela |
| 6 | **mola**: base de metal, molas, tampo coral — **solta**, alta (≈ 2,6 : 1 de largura por altura) |
| 7 | **mola apertada**: a mesma, comprimida (mais baixa) |

## 7. `catapulta.png` — 1 célula de 320, alfa, sem recorte

Catapulta de madeira **de elástico** (um Y grande num carrinho de duas rodas), de frente. **As rodas tocam y = 300** da célula; **as pontas do Y ficam em (110, 30) e (210, 30)**: o código prende os elásticos ali. Sem elástico desenhado.

## 8. Os prompts

### Bloco de estilo

~~~text
STYLE — USE THE ATTACHED IMAGE FOR THE LINE WORK ONLY. Match how it is DRAWN:
bold dark outlines of even, thick weight all the way around every shape; 100%
FLAT colour fill inside, with no gradients and at most one flat shadow tone;
clean, simple geometry with soft rounded corners. Friendly and poster-like,
like clean vector art for young children. Take ONLY the line and shape language
from the attached image: not its colours, characters, backgrounds or subject.

PALETTE: sky blue, fresh grass green, warm earth brown, cream, lilac, sunny
yellow, light grey metal, soft coral. Clear and cheerful, never neon.
~~~

### Bloco negativo

~~~text
DO NOT INCLUDE: text, letters, words, labels, digits, numbers, logos, brand
marks, watermark, signature, faces or eyes on objects, arrows, check marks, X
marks, red or green "right/wrong" colours, glowing outlines, user interface,
buttons, HUD, speech bubbles, people, animals, the characters from the attached
image, gradients, airbrushing, painterly rendering, rough sketchy lines, thin
hairline outlines, 3D render, photorealistic, blur, visible sprite-sheet borders,
cell borders, items crossing cell borders, white sticker keyline.
~~~

### `terra.png`

~~~text
[STYLE]

A SEAMLESS TILEABLE texture, 256 x 256, opaque: warm brown earth seen from the
side, with small scattered pebbles and soft darker specks. It must tile with no
visible seam on all four sides. No big stones, no lines, no grass, no horizon.

[NEGATIVE]
~~~

### `tabua.png`

~~~text
[STYLE]

One sprite, 240 x 40, fully TRANSPARENT background: a horizontal wooden PLANK
seen from the side, rounded ends, a light wood grain line along the top, one
small nail near each end. The middle part must be uniform so it can stretch.

[NEGATIVE]
~~~

### `aparelhos.png`

~~~text
[STYLE]

A sprite sheet on a fully TRANSPARENT background: 3 columns x 2 rows, each cell
320 x 320 (total 960 x 640), read left to right, top row first, same scale.
1. A desktop computer TOWER with the side panel removed: box about 210 x 290,
   a round fan, one EMPTY rectangular bay about 140 x 96 centred at x 160, y 175.
2. An INTERNAL HARD DRIVE: bare metal plate about 150 x 100, blank label, four
   screws, a connector on one edge.
3. A USB PEN DRIVE lying sideways, metal tip on the LEFT, a key-ring loop.
4. A MEMORY CARD standing upright, one cut corner, gold contacts.
5. An EXTERNAL HARD DRIVE: small rounded box, soft cover, rubber feet, one lit
   lamp, a short cable stub.
6. A fluffy white CLOUD, chubby and round, light blue flat shadow below.

[NEGATIVE]
~~~

### `pecas.png`

~~~text
[STYLE]

A sprite sheet on a fully TRANSPARENT background: 4 columns x 2 rows, each cell
200 x 200 (total 800 x 400). Chunky centred icons, same scale.
1. An open movie CLAPPERBOARD. 2. A small PHOTO with a mountain and a sun.
3. A double MUSIC NOTE. 4. A sheet of PAPER with lines and a pencil.
5. A plain white BALL with a lilac ring, EMPTY in the middle.
6. A yellow four-point STAR twinkle.
7. A cartoon SPRING PAD seen from the side: grey metal base, metal coils, a
   coral top plate, fully extended (wide and short, about 2.6 times wider than
   tall).
8. The SAME spring pad, squashed down (coils compressed).

[NEGATIVE]
~~~

### `catapulta.png`

~~~text
[STYLE]

One sprite, 320 x 320, fully TRANSPARENT background: a wooden SLINGSHOT
CATAPULT seen from the front — a big Y-shaped fork standing on a small cart with
two wheels. The wheels touch y = 300; the two tips of the Y are at (110, 30) and
(210, 30). NO rubber band drawn.

[NEGATIVE]
~~~

### `bg-ceu.png`

~~~text
[STYLE]

A full game background, 1280 x 720, opaque: a bright sky with a sun at the top
right, two or three small soft clouds (decoration, far away), and gentle green
hills along the lower half. No ground in the foreground, no objects, no people.

[NEGATIVE]
~~~

## 9. Quando a arte chegar

1. Salve os PNGs com os nomes do §1 na pasta de destino.
2. Confira `terra.png` repetida (o código a usa em mapas de até 2600 px): emenda aparece na hora.
3. Confira as folhas sem recorte contra os contratos de posição (§5, §7).
4. Gere a capa e importe no `src/data/catalog.ts` (`thumbnail`).
