# Trem Peça & Programa — texturas

Destino: `src/assets/games/EF02CO04/trem-peca-e-programa/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 itens, §13
textura × código).

A linha de arte é a **chibi de figurinha**, o padrão da rodada, com a
referência `references/19-chibi-figurinhas.jpg` **anexada em toda geração**.
Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

> **O elenco da referência entra no negativo.** Da folha de figurinhas sai só a
> técnica, nunca as personagens dela.

### Tabela de estilo — chibi de figurinha

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Traço | limpo, nítido, uniforme, em azul-marinho dessaturado; nunca preto puro | vetor de conto (contorno no tom da cor) e desenho de criança (caneta trêmula) |
| Cor | paleta curta, chapada, **um** tom de sombra, nenhum degradê | vetor de conto (degradê macio) e chibi de rabisco (sem cor) |
| Olho | grande e brilhante, com um brilho forte | desenho de criança (pontinho) |
| Silhueta | peça com alfa ganha **keyline branca fina**; cena inteira (fundo, capa) não ganha | vetor de conto e graphic novel (sem keyline) |
| Proporção | chibi: cabeça grande, corpo pequeno; objetos simples e legíveis no tamanho do jogo | graphic novel (quase natural) |

**As duas regras deste jogo:**
- **Peça é objeto, programa é ícone de app.** As peças (mouse, teclado…) são
  desenhadas como **objetos de verdade**, de lado, com volume. Os programas
  (joguinho, app de música…) são **ícones de app**: um quadrado de cantos bem
  redondos com um símbolo dentro, como na tela de um tablet. **Todos os ícones de
  app têm o mesmo formato e o mesmo tamanho**, e as peças têm o mesmo peso
  visual entre si. Nenhum grupo brilha, tem borda especial ou cor própria.
- **O símbolo de um app nunca é uma peça.** O app de fotos é uma montanha com
  sol, não uma câmera. O joguinho é um bonequinho pulando, não um controle. O
  app de música são notas, não uma caixinha.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-patio.png` | — | — | 1280 × 720 | opaco | pátio de trem de brinquedo, de frente, com funil, trilho e Y pintados |
| `itens.png` | 4 × 4 | 256 × 256 | 1024 × 1024 | sim | 13 itens + lâmina da agulha + 2 ícones de placa |
| `trem.png` | 2 × 2 | 512 × 512 | 1024 × 1024 | sim | vagão aberto, locomotiva, vagão-corrente, dedo do guia |
| `cover-trem-peca-e-programa.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts` e
`data/items.ts`).

**Se a arte vier em outro tamanho**, ela é usada como veio: o código mede a
folha (MANIFEST) e o layout se ajusta ao fundo. O que **não pode** mudar é a
**ordem das células** e o que existe em cada uma.

**O insubstituível:** os 8 itens do N1 (`itens` 0–3 e 7–10), o **vagão** e a
**locomotiva**. **Opcional para o N1:** `itens` 4–6, 11 e 12 (N2/N3, e a câmera
e o app de fotos do treino) e `trem` 2 (vagão-corrente, N3). Estão nas folhas
porque célula a mais não custa outra geração.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. Nomes, placas, bolinhas e o
  quadro-síntese são do jogo.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha.
- **O vagão vem vazio**, com a frente lisa (a placa entra por código). A
  **borda de cima da parede da frente** tem de ser uma linha reta e nítida: o
  código recorta o vagão ali, para o item cair **dentro** dele.
- **Os dois vagões são o mesmo desenho.** Não peça dois.

## 3. `bg-patio.png` — 1280 × 720, opaco

Um pátio ferroviário de brinquedo, visto de frente, com parede de madeira
clara, bandeirinhas e um céu de janela. O **trilho do item** desce do funil e
se divide em Y. Tudo o que se mexe (a agulha, o item, o trem) entra por código.

| Região | O que tem |
|---|---|
| y 0–100 | faixa calma (HUD) |
| funil, x 560–720, y 60–160 | um funil grande de brinquedo, menta e creme, com a **boca embaixo em (640, 160)** |
| trilho vertical | um trilho de brinquedo (dois trilhos com dormentes) descendo de (640, 160) até (640, 340) |
| **ponto da agulha** | em (640, 360): **só a base redonda do desvio**, sem a lâmina (ela entra por código) |
| galhos do Y | dois trilhos descendo em diagonal: da agulha até (330, 510) e da agulha até (950, 510) |
| área dos vagões | x 140–1280, y 500–690: **vazia**, só a linha de trilho de baixo em y ≈ 685 atravessando a tela inteira |
| fundo | parede de madeira clara, bandeirinhas, duas janelas redondas e um sinaleiro fofo **fora** das áreas acima |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 sorting game for Brazilian children aged 7–8.
Primary request: create one opaque 1280 × 720 px straight-on front view of a cute toy railway yard indoors. Preserve these exact functional regions: y 0–100 is a calm plain band; at the top centre, x 560–720, y 60–160, a big cute toy funnel in mint and cream whose narrow mouth points DOWN and opens at (640, 160); from the funnel mouth a small toy track (two rails with little wooden sleepers) runs straight DOWN to (640, 340); at (640, 360) only a small round base plate of a track switch, with NO switch blade on it; from that point two toy tracks run diagonally down, one to (330, 510) on the left and one to (950, 510) on the right, forming a big Y; the whole area x 140–1280, y 500–690 is EMPTY except for one straight toy railway line running across the entire width at y ≈ 685. Around these regions: a warm light-wood wall, a string of small bunting flags, two round windows with sky, and one cute little railway signal light, all OUTSIDE the listed regions.

Palette: light wood, cream, mint, soft lilac, sky blue, small touches of coral.

Composition and technical constraints: exact 16:9 canvas; straight-on front view; all listed coordinates respected; the area for the wagons stays empty; opaque; no white sticker keyline; no embedded user interface.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, trains, locomotives, wagons, carriages, objects on the tracks, a switch blade or lever at the Y, computers, mice, keyboards, phones, tablets, app icons, toys on the floor, text, letters, words, labels, digits, numbers, signs with writing, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, perspective vanishing point, side view of the room, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 4. `itens.png` — grade 4 × 4, célula 256 × 256

| Célula | id | O quê | Tipo |
|---|---|---|---|
| 0 | `mouse` | mouse de computador com fio curto enrolado | peça |
| 1 | `keyboard` | tecladinho de computador, visto de cima e um pouco de frente | peça |
| 2 | `speaker` | caixinha de som redonda, com o alto-falante na frente | peça |
| 3 | `gamepad` | controle de videogame | peça |
| 4 | `screen` | tela de computador (monitor) **desligada**, tela cinza-escura lisa | peça (N2) |
| 5 | `camera` | câmera fotográfica fofa | peça (treino/N3) |
| 6 | `robot` | robozinho de brinquedo, parado | peça (N2) |
| 7 | `game` | **ícone de app**: um bonequinho pulando sobre plataformas | programa |
| 8 | `music` | **ícone de app**: duas notas musicais | programa |
| 9 | `paint` | **ícone de app**: um rabisco colorido com um pincel | programa |
| 10 | `alarm` | **ícone de app**: um sininho de alarme com "ondinhas" (sem relógio de mesa) | programa |
| 11 | `photos` | **ícone de app**: uma montanha com sol, de foto | programa (treino/N3) |
| 12 | `dance` | **ícone de app**: um robozinho dançando com notas | programa (N2) |
| 13 | `blade` | a **lâmina da agulha**: um pedaço curto de trilho de brinquedo (dois trilhos e 2 dormentes), **na vertical**, com uma argola de pivô no **topo** | código gira |
| 14 | `sign-hand` | pictograma da placa PEÇAS: uma mãozinha segurando (sem objeto) | placa |
| 15 | `sign-orders` | pictograma da placa PROGRAMAS: uma folhinha com três linhas que começam com setinhas ▶ (uma lista de ordens) | placa |

Os **ícones de app (7–12)** são todos quadrados de cantos bem redondos, do
**mesmo tamanho (~180 px)**, cada um com um fundo de cor diferente e suave, e
o símbolo branco/creme dentro. As **peças (0–6)** ocupam ~190 px no lado maior.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact item sprite sheet for a Phaser 3 game where children sort physical devices (hardware) from apps (software).
Primary request: create ONE exact 4 columns × 4 rows sprite sheet on a transparent 1024 × 1024 px canvas. Every cell is exactly 256 × 256 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

TWO KINDS of items, kept visually consistent: cells 0–6 are PHYSICAL DEVICES drawn as real cute objects with volume, each about 190 px on its longest side; cells 7–12 are APP ICONS, each one a rounded-square tile of exactly the same shape and size (about 180 × 180 px, big corner radius), with its own soft background colour and one simple white-and-cream symbol inside. No item glows or has a special border. An app's symbol is NEVER a physical device.

Exact cells, left to right and then top to bottom:
0. mouse — one cute computer mouse with a short curled cable.
1. keyboard — one small computer keyboard seen from slightly above and in front, keys as plain rounded squares with no letters.
2. speaker — one cute round speaker with a big speaker cone on the front.
3. gamepad — one cute video game controller.
4. screen — one computer monitor on a small stand, screen OFF and plain dark grey.
5. camera — one cute photo camera.
6. robot — one small toy robot standing still, friendly face.
7. game app — an app tile with a tiny character jumping over two little platforms.
8. music app — an app tile with two music notes.
9. paint app — an app tile with a colourful scribble and a small paintbrush stroke.
10. alarm app — an app tile with a little bell and two small ring waves (no desk clock).
11. photos app — an app tile with a mountain and a sun, like a photo.
12. dance app — an app tile with a tiny robot silhouette dancing and two music notes.
13. blade — one short piece of toy railway track standing VERTICAL: two parallel rails with two small wooden sleepers, about 50 × 170 px, with a round pivot ring at its TOP end.
14. sign-hand — a simple pictogram of one cute open hand gently holding (no object in it), cream with navy outline.
15. sign-orders — a simple pictogram of a small sheet of paper with three short lines, each line starting with a small play-arrow ▶, cream with navy outline.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, text, letters, words, labels, digits, numbers, letters on the keyboard keys, logos, brand marks, app names, camera symbol on the photos app, game controller symbol on the game app, speaker symbol on the music app, clock face on the alarm app, phone or tablet frame around app icons, glowing app icons, special borders, a screen that is switched on, pictures on the screen, objects in the hand of cell 14, extra objects, captions, watermark, title lettering, user interface, buttons, panels, frames, speech bubbles, HUD, question mark, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

## 5. `trem.png` — grade 2 × 2, célula 512 × 512

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `wagon` | vagão de carga **aberto em cima**, de lado, vazio, ~420 × 220: caçamba de madeira clara com aro menta, 4 rodinhas. A **frente da caçamba é lisa** (a placa entra por código), e a **borda de cima da parede da frente é uma linha reta** |
| 1 | `engine` | locomotiva de brinquedo fofa, **de frente para a DIREITA**, ~440 × 300: caldeira lilás, cabine creme, chaminé, farol, rosto sorridente na frente, 4 rodas |
| 2 | `link` | vagão-corrente (N3): uma plataforma baixa, ~300 × 120, com uma correntinha prateada em cima |
| 3 | `guide-hand` | mãozinha chibi no ângulo de `references/mao-toque-angulo.png` |

As rodas de todos ficam na **mesma linha de base** (y ≈ 470 na célula), para
o trem andar alinhado no trilho.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight where there are eyes; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. The second attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 3.

Use case: stylized-concept
Asset type: exact toy-train sprite sheet for a Phaser 3 game.
Primary request: create ONE exact 2 columns × 2 rows sprite sheet on a transparent 1024 × 1024 px canvas. Every cell is exactly 512 × 512 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. The wheels of cells 0, 1 and 2 all rest on the same baseline at local y ≈ 470.

Exact cells, left to right and then top to bottom:
0. wagon — one cute open-top toy freight wagon seen from the side, EMPTY, about 420 × 220 px: a light-wood box body with a mint rim and four small round wheels. Its front face is PLAIN and flat (no decoration, a sign will be added by code), and the top edge of the front wall is one straight, crisp horizontal line. The inside back wall is visible above it, plain.
1. engine — one cute toy steam locomotive facing RIGHT, about 440 × 300 px: lilac boiler, cream cabin, a small chimney, a round headlight and a friendly smiling face on the front, four wheels.
2. link — one low flat toy platform car, about 300 × 120 px, with a small silver chain lying on top, two wheels.
3. guide-hand — use references/mao-toque-angulo.png ONLY as the angle and silhouette reference. Create one cute light-brown childlike chibi hand with the same dark uniform outline, one-tone flat cel shading and white sticker keyline as the other cells. The index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT; its tip is crisp and clearly the touch point. The other THREE fingers fold into distinct descending steps on the RIGHT; the THUMB folds inward across the palm; the short bare wrist descends toward the LOWER RIGHT. Exactly five digits. No click lines, no face, no sleeve.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, cargo, items or objects inside the wagon, decorations or signs on the wagon front, two different wagons, a locomotive facing left, smoke clouds, tracks, rails, ground, floor, shadow, background, text, letters, words, labels, digits, numbers, logos, captions, watermark, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, extra fingers, missing fingers, click lines, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

## 6. `cover-trem-peca-e-programa.png` — 1672 × 941, opaco

A capa: o pátio de brinquedo com o funil no alto soltando um **mouse**, que
desce pelo Y para o vagão da esquerda; no vagão da direita já há **ícones de
app** (notas, bonequinho pulando). A locomotiva fofa puxa os dois vagões. Em
cima vai o título `Trem Peça & Programa`. Anexe a referência `19` e as
`itens.png` e `trem.png` aprovadas.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover, not a sticker.
OBJECTS — THE OTHER ATTACHED IMAGES (itens.png and trem.png) ARE THE REFERENCES FOR THE ITEMS, THE WAGONS AND THE LOCOMOTIVE: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Trem Peça & Programa”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Trem Peça & Programa” in large chunky rounded playful multicolour letters with a thick dark outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly these words and symbol, letter for letter, with capitalization and the cedilla exactly: T-r-e-m [space] P-e-ç-a [space] & [space] P-r-o-g-r-a-m-a. The “ç” in “Peça” MUST carry its cedilla, and the ampersand “&” must appear between “Peça” and “Programa”. No extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, a cute indoor toy railway yard seen from the front: a big mint toy funnel at the top drops a cute computer mouse onto a small toy track that splits in a Y; the mouse is sliding down the LEFT branch toward an open wooden wagon that already holds a small keyboard; the RIGHT branch leads to an identical open wagon that holds two rounded-square app icons (music notes, a tiny jumping character); a cute lilac toy locomotive with a smiling face pulls both wagons. Make "sort each item into the right wagon" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; funnel, Y track, both wagons and the locomotive large beneath it and fully visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, extra words, misspelled title, missing cedilla, missing ampersand, subtitle, punctuation, numbers, labels or words on the wagons, app names, logos, brand marks, captions, signs with writing, watermark, score, HUD, buttons, question mark, speech bubbles, arrows, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped train, cropped funnel, sad faces, crying, angry faces.
~~~

## 7. O que conferir quando a arte chegar

- as grades (ou o tamanho que vier, medido): `itens` 4 × 4, `trem` 2 × 2; o
  corte medido por colunas na folha inteira, sem peça cruzando célula;
- os **ícones de app (7–12) do mesmo formato e tamanho**, e nenhum símbolo de
  app que seja uma peça;
- as peças sem brilho especial e sem borda diferente dos apps;
- a **lâmina da agulha** (13) na vertical, com o pivô no topo (medir o pivô);
- no vagão, **a linha da borda de cima da parede da frente** (medir o y: é
  onde o código recorta) e a frente lisa;
- a locomotiva virada para a **direita**; as rodas na mesma base nas 3 células;
- no `bg-patio`, a **boca do funil**, o **ponto da agulha** e as **pontas do Y**
  medidos em 1280 × 720 (o layout se ajusta a eles), e a área dos vagões vazia;
- `tipX`/`tipY` do dedo;
- a grafia do título da capa, **com o "ç" e o "&"**.
