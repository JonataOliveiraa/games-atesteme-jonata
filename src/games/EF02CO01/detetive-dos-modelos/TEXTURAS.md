# Detetive dos Modelos — prompts das texturas

Destino: `src/assets/games/EF02CO01/detetive-dos-modelos/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Veículos, detetive, os três cenários (céu, estrada, mar), a sala e o pedestal
são textura. Moldura dos cartões, fita com o nome, bandeja, HUD, cadeado,
selos e pictogramas continuam em `Graphics`.

---

## 1. Arquivos entregues

| Arquivo | Grade | Tamanho | Uso |
|---|---|---|---|
| `veiculos.png` | 4 × 3 | 1024 × 768 | 12 veículos, quadro de 256 × 256 |
| `detetive.png` | 1 × 4 | 500 × 2000 | a mascote, quadro de 500 × 500 |
| `bg-ceu.png` | — | 1672 × 941 | cartão CÉU (recorte) e animação do voo (inteiro) |
| `bg-estrada.png` | — | 1672 × 941 | cartão ESTRADA (recorte) e animação na pista (inteiro) |
| `bg-mar.png` | — | 1672 × 941 | cartão ÁGUA (recorte) e animação no mar (inteiro) |
| `bg-sala.png` | — | 1672 × 941 | fundo do tabuleiro: parede e piso da sala |
| `pedestal.png` | — | 2048 × 768, alfa | prato de exposição sob o veículo |
| `cover-detetive-dos-modelos.png` | — | 1431 × 940 | capa do catálogo |

`detetive.png` não estava no pedido original; ver §13 do PLANEJAMENTO.

**Um cenário, dois usos (23/09/2026).** Cada cenário é uma cena lateral
inteira. A animação do teste mostra a imagem toda; o cartão mostra um recorte
dela (`CARD_VIEW` em `data/vehicles.ts`: centro e altura em frações da
imagem). O quarto de baixo do cartão fica sob a fita com o nome, então o
recorte põe no meio o que se lê: sol e nuvens, a faixa tracejada, o horizonte e
as ondas. O `bg-asfalto.png` antigo saiu. Os prompts ficaram no §10.

**A ordem dos quadros é contrato com o código.** O Phaser lê da esquerda para a
direita e de cima para baixo.

### `veiculos.png`

| Quadro | Veículo | media | motor | rodas |
|---|---|---|---|---|
| 0 | avião | air | sim | sim |
| 1 | carro | land | sim | sim |
| 2 | barco | water | não | não |
| 3 | bicicleta | land | não | sim |
| 4 | helicóptero | air | sim | não |
| 5 | ônibus | land | sim | sim |
| 6 | lancha | water | sim | não |
| 7 | foguete | air | sim | não |
| 8 | barco a vela | water | não | não |
| 9 | patinete | land | não | sim |
| 10 | trem | rail | sim | sim |
| 11 | hidroavião | air + water | sim | não |

### `detetive.png`

| Quadro | Pose | Quando aparece |
|---|---|---|
| 0 | com a lupa no olho | esperando a criança escolher |
| 1 | mão no queixo, pensativa | no erro |
| 2 | sorrindo | no acerto |
| 3 | comemorando, levantando o chapéu | no fim da fase |

---

## 2. Estilo comum

```
flat 2D cartoon vehicle illustration, first-grade and second-grade educational game
asset, simple toy-like shape, bold readable silhouette, thick dark outline, flat
colors, minimal detail, no brand, no text, transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, complex mechanical details,
brand logo, license plate, text, letters, numbers, words, watermark, signature, frame,
border, grid lines, UI panel, button, checkmark, x mark, cropped, cut off, white
background
```

Nada de letras, números, placas ou marcas nos veículos.

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| avião | `#4DA3FF` |
| carro | `#FF6B6B` |
| barco | `#2DD4BF` |
| bicicleta | `#F59E0B` |
| helicóptero | `#8B5CF6` |
| ônibus | `#FACC15` |
| lancha | `#06B6D4` |
| foguete | `#EF4444` |
| barco a vela | `#34D399` |
| patinete | `#A3E635` |
| trem | `#64748B` |
| hidroavião | `#60A5FA` |

## 5. Prompt do `veiculos.png` — 1024 × 768, grade 4 × 3

```
Sprite sheet with 12 frames in a strict 4-column by 3-row grid, every frame exactly
256 by 256 pixels, transparent background.

Twelve toy-like vehicles for a children's educational game. Each vehicle is centered,
large, full object visible, same scale, side or three-quarter view, thick dark outline
#1F2A37, flat colors, very simple shapes. Attributes must be easy to read at small
size: wings, wheels, propeller, sail, rails or boat hull clearly visible. No brands,
no text, no letters, no numbers.

Frames, left to right then top to bottom:
1. airplane, blue #4DA3FF, clear wings and small wheels.
2. car, red #FF6B6B, four wheels.
3. simple boat, teal #2DD4BF, hull only, no sail, no wheels.
4. bicycle, orange #F59E0B, two large wheels, no motor.
5. helicopter, purple #8B5CF6, top rotor, no wings.
6. bus, yellow #FACC15, many windows as simple blank shapes, wheels.
7. speedboat, cyan #06B6D4, motor at back, water vehicle silhouette.
8. rocket, red #EF4444, fins and flame shape, no wheels.
9. sailboat, green #34D399, sail and hull, no motor.
10. scooter, lime #A3E635, handlebar, two small wheels, no motor.
11. train, slate #64748B, front engine, wheels aligned, small rail hint under it.
12. seaplane, light blue #60A5FA, wings plus floating pontoons.

[estilo comum] [negativo comum]
```

## 6. O que fica em Graphics

| Elemento | Como é desenhado |
|---|---|
| trilho | dormentes e dois trilhos paralelos (nenhum nível usa) |
| oficina sem motor | bancada verde com brilho (nenhum nível usa) |
| NÃO COMBINA | cartão cinza com círculo proibido |
| céu, estrada e água sem textura | desenho de reserva, só se o PNG faltar |
| piso listrado e disco creme | desenho de reserva, só se `bg-sala` ou `pedestal` faltar |
| pictogramas | asa, roda, motor, água, trilho e estrada |
| cartões, bandeja, HUD, cadeado, dedo, poeira | tudo |

**Os cenários entram recortados dentro do cartão** com `setCrop` e uma máscara
de cantos arredondados; o recorte de cada um está em `CARD_VIEW`.

## 7. Sons

Sem arquivos. Tudo sintetizado em WebAudio, respeitando `mute-audio`:

| Som | Síntese |
|---|---|
| toque | seno curto |
| pegar veículo | pop com pitch ascendente |
| enviar | ruído filtrado subindo |
| voo | ruído filtrado longo + seno subindo |
| estrada | pulso grave + ruído baixo |
| água | ruído descendente + seno |
| sem motor | dois senos curtos |
| erro | dois quadrados graves descendo |
| fim de fase | fanfarra de quatro notas |

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `veiculos.png` e `detetive.png` |
| Recorte | grade exata, sem sangria entre quadros |
| Sem | texto, número, marca, placa, moldura, linha de grade, interface |

## 9. O que ainda não existe

Nada bloqueante. O jogo roda com tudo que já está na pasta. Se um arquivo for
removido, `textures.exists()` cobre: o veículo vira uma forma em Graphics com o
nome escrito, a detetive vira um círculo, os cartões voltam ao desenho em
Graphics, a sala vira o piso listrado e o pedestal vira o disco creme.

## 10. Cenários, sala e pedestal (23/09/2026)

Referência de estilo: **anexe `veiculos.png` e `detetive.png` em toda
geração** — a arte do próprio jogo é o estilo. Contorno escuro de espessura
firme, cor chapada com um tom de sombra, brilho branco pequeno, formas roliças
de brinquedo. Os cenários ficam um pouco mais claros e com contorno mais fino
que os veículos, para o veículo continuar sendo o que mais aparece.

| Arquivo | Onde a coisa importante mora |
|---|---|
| `bg-ceu.png` | sol em cima à direita, nuvens entre 30% e 70% da altura |
| `bg-estrada.png` | pista horizontal entre 64% e 90%, faixa tracejada a 77% |
| `bg-mar.png` | horizonte a 42%, ondas entre 50% e 95% |
| `bg-sala.png` | parede nos 53% de cima, piso embaixo, enfeites só nas bordas |
| `pedestal.png` | alfa, prato de exposição vazio |

### `bg-ceu.png` — 1920 × 1080

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: clean 2D cartoon for a children's game, bold dark outlines (deep navy-charcoal #1F2A37) of steady thickness, slightly thicker on the outer silhouette of each shape; bright saturated flat colors with exactly ONE darker cel-shade tone per color and small crisp white glossy highlight marks; chunky rounded toy-like shapes with very little detail. Take ONLY the art style — do NOT copy the vehicles, the detective girl, their poses or their framing. This is a BACKGROUND: make it slightly lighter and lower in contrast than the reference, with outlines a little thinner than the vehicles' outlines, so a vehicle sticker placed on top stays the most visible thing. Full-bleed scene, NO white sticker keyline.

SCENE — full-bleed 16:9 landscape, 1920x1080, side view, camera level with the clouds. A wide open daytime sky: sky blue #8FD4FF at the top becoming lighter #BFE8FF near the bottom, painted as two or three FLAT color bands, not an airbrushed gradient. A round cartoon sun in soft yellow #FFE07A with one lighter ring, in the upper right (about 80% across, 20% down). Five or six chunky fluffy cartoon clouds, white with one pale blue-grey shade tone and a dark outline, spread across the band between 30% and 70% of the height, with generous clear sky between them. A few thin white curved wind lines drifting to the right. At most a thin strip of soft distant green hilltops along the bottom 8% of the image, nothing else on the ground.
The center of the picture (30% to 70% of the width, 35% to 60% of the height) must stay mostly open sky: a flying vehicle will be placed there. The image must still clearly read as "the sky" when cropped to a 4:3 box around its center.

DO NOT INCLUDE: airplanes, helicopters, rockets, birds, balloons, kites, any vehicle, people, the detective girl, characters, city skyline, buildings, towers, rainbow, moon, stars, night, sunset colors, storm clouds, rain, text, letters, numbers, words, logo, watermark, signature, frame, border, UI, buttons, painterly lineless illustration, soft airbrushed gradients, heavy rendering, texture noise, grain, blur, depth of field, 3D render, photorealistic, white sticker keyline.
~~~

### `bg-estrada.png` — 1920 × 1080

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: clean 2D cartoon for a children's game, bold dark outlines (deep navy-charcoal #1F2A37) of steady thickness, slightly thicker on the outer silhouette of each shape; bright saturated flat colors with exactly ONE darker cel-shade tone per color and small crisp white glossy highlight marks; chunky rounded toy-like shapes with very little detail. Take ONLY the art style — do NOT copy the vehicles, the detective girl, their poses or their framing. This is a BACKGROUND: make it slightly lighter and lower in contrast than the reference, with outlines a little thinner than the vehicles' outlines, so a vehicle sticker placed on top stays the most visible thing. Full-bleed scene, NO white sticker keyline.

SCENE — full-bleed 16:9 landscape, 1920x1080, pure SIDE VIEW at ground level, looking at the road from the side. Horizontal layers from top to bottom:
- 0% to 40%: light sky #BFE6FF with two small cartoon clouds, flat color bands;
- 40% to 58%: far away, soft rounded green hills and a few round cartoon trees;
- 58% to 64%: grass verge #7FC96B with one darker green shade tone and a thin light curb on top of the road edge;
- 64% to 90%: a wide, straight, flat, HORIZONTAL asphalt road crossing the whole width, blue-grey #8B96A5 with one darker shade tone, a dark outline on both edges, and a dashed white center line of chunky rounded rectangles running left to right at about 77% of the height;
- 90% to 100%: a strip of grass.
The road is the main subject: long, straight, completely empty. A car will be placed driving on it with its wheels at about 88% of the height. The road must still read clearly when the image is cropped to a 4:3 box centered on the road.

DO NOT INCLUDE: cars, buses, bicycles, scooters, trucks, any vehicle, traffic, people, the detective girl, characters, animals, traffic signs, road signs, traffic lights, crosswalk, houses, buildings, city, road vanishing into the distance, perspective road, curved road, puddles, cracks, text, letters, numbers, words, logo, watermark, signature, frame, border, UI, buttons, painterly lineless illustration, soft airbrushed gradients, heavy rendering, texture noise, grain, blur, depth of field, 3D render, photorealistic, white sticker keyline.
~~~

### `bg-mar.png` — 1920 × 1080

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: clean 2D cartoon for a children's game, bold dark outlines (deep navy-charcoal #1F2A37) of steady thickness, slightly thicker on the outer silhouette of each shape; bright saturated flat colors with exactly ONE darker cel-shade tone per color and small crisp white glossy highlight marks; chunky rounded toy-like shapes with very little detail. Take ONLY the art style — do NOT copy the vehicles, the detective girl, their poses or their framing. This is a BACKGROUND: make it slightly lighter and lower in contrast than the reference, with outlines a little thinner than the vehicles' outlines, so a vehicle sticker placed on top stays the most visible thing. Full-bleed scene, NO white sticker keyline.

SCENE — full-bleed 16:9 landscape, 1920x1080, SIDE VIEW at water level. From 0% to 42% of the height: open light sky #BFEFFF with two small cartoon clouds, flat color bands. A straight horizon line at 42%. Below it the sea fills the rest of the image: turquoise #7FE3EF near the horizon, getting deeper in flat bands through #4FD2E4 down to #2AB8D2 at the bottom. Four or five rows of chunky cartoon waves drawn as rounded scallops with a dark outline and small white foam caps, spread evenly between 50% and 95% of the height: calm and friendly, never stormy.
A floating boat will be placed on the water in the center at about 65% of the height, so the band between 55% and 75% must be clean, readable water with one gentle wave line to float on. The image must still clearly read as "water" when cropped to a 4:3 box around its center.

DO NOT INCLUDE: boats, ships, sailboats, speedboats, any vehicle, people, swimmers, the detective girl, characters, fish, dolphins, whales, birds, sea animals, islands, lighthouse, beach, sand, rocks, storm, big crashing waves, underwater view, text, letters, numbers, words, logo, watermark, signature, frame, border, UI, buttons, painterly lineless illustration, soft airbrushed gradients, heavy rendering, texture noise, grain, blur, depth of field, 3D render, photorealistic, white sticker keyline.
~~~

### `bg-sala.png` — 1920 × 1080

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: clean 2D cartoon for a children's game, bold dark outlines (deep navy-charcoal #1F2A37) of steady thickness, slightly thicker on the outer silhouette of each shape; bright saturated flat colors with exactly ONE darker cel-shade tone per color and small crisp white glossy highlight marks; chunky rounded toy-like shapes with very little detail. Take ONLY the art style — do NOT copy the vehicles, the detective girl, their poses or their framing. This is a BACKGROUND: make it clearly lighter and lower in contrast than the reference, with thinner outlines, so the game pieces placed on top stand out. Full-bleed scene, NO white sticker keyline.

SCENE — full-bleed 16:9 landscape, 1920x1080, straight front view of the inside of a cozy kid detective's workshop, completely empty. The WALL fills the top 53% of the image: warm cream wallpaper #F3E6C8 with a very subtle vertical stripe in one slightly darker tone, and a wooden skirting board along its bottom edge. The FLOOR fills the bottom 47%: warm honey wooden planks #C8A273 with a darker plank tone #B38F61, planks running left to right, seen almost flat.
Decorations ONLY at the far left and far right edges (the outer 12% of each side): on the left, a coat rack and a potted plant; on the right, a small cork board with blank pinned paper notes joined by a red string, and a simple round wall lamp. Everything between 14% and 86% of the width must stay plain wall and plain floor: game cards, a turntable and a sticker album are placed on top of it. Calm, cheerful, daylight.

DO NOT INCLUDE: writing on the notes, maps, photos of people, faces, the detective girl, characters, people, vehicles, toys, desks, tables or furniture in the center, windows, doors in the center, clutter, busy patterns, strong shadows, dark or night mood, text, letters, numbers, words, logo, watermark, signature, frame, border, UI, buttons, painterly lineless illustration, soft airbrushed gradients, heavy rendering, texture noise, grain, blur, depth of field, 3D render, photorealistic, white sticker keyline.
~~~

### `pedestal.png` — 1024 × 384, alfa

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their rendering exactly: clean 2D cartoon for a children's game, bold dark outlines (deep navy-charcoal #1F2A37) of steady thickness, slightly thicker on the outer silhouette; bright saturated flat colors with exactly ONE darker cel-shade tone per color and small crisp white glossy highlight marks; chunky rounded toy-like shapes with very little detail. Take ONLY the art style — do NOT copy the vehicles, the detective girl, their poses or their framing. No white sticker keyline: the dark outline holds the silhouette.

ASSET — one single object on a real TRANSPARENT background, 1024x384: a round, low exhibition turntable, like a toy display stand, seen from the front with a slight top-down angle. A wide flat elliptical top in cream #FFF6E4 with a soft yellow inner circle #FFD66B, a thick side band in warm wood #C8A273 with one darker tone, a dark outline all around, and a small crisp white highlight on the front rim. Empty on top. Centered, filling the width with a small margin. No cast shadow on the ground (the game draws it).

DO NOT INCLUDE: vehicles or any object on top, people, the detective girl, characters, text, letters, numbers, logo, watermark, frame, border, background color, white background, fake checkerboard transparency pattern, cast shadow, painterly lineless illustration, soft airbrushed gradients, 3D render, photorealistic, white sticker keyline.
~~~
