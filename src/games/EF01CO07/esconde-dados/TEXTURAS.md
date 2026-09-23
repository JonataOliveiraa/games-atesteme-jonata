# Esconde-Dados - prompts das texturas

**2 arquivos de jogo + 1 capa.** Destino:
`src/assets/games/EF01CO07/esconde-dados/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Este jogo deve usar pouca textura. A pracinha, os esconderijos, a lanterna, o
cartão, o cofre, os escudos e os pictogramas saem em `Graphics`. As texturas
existem só para dar identidade humana aos personagens e para a capa do catálogo.

> **Superado em 23/09/2026 — ver §0.** Com personagens, moita, árvore e cofre
> ilustrados, os ícones em `Graphics` passaram a ser as peças mais pobres da
> tela, e o usuário os reprovou como amadores.

---

## 0. Estado dos arquivos

**O que já existe**, medido nos arquivos entregues:

| Arquivo | Tamanho | Grade |
|---|---|---|
| `crianca.png` | 450 x 1800 | 1 x 4 de 450, vertical |
| `pessoas.png` | 450 x 2250 | 1 x 5 de 450, vertical |
| `cofre.png` | 1024 x 256 | 4 x 1 de 256 |
| `seguranca.png` | 304 x 396 | — |
| `arvore.png` | 400 x 400 | — |
| `moita.png` | 280 x 165 | — |
| `cover-esconde-dados.png` | — | — |
| `dados.png` | 768 x 512 | 3 x 2 de 256 |
| `simbolos.png` | 768 x 512 | 3 x 2 de 256 |

**Os ícones chegaram em 23/09/2026**, na METADE do tamanho pedido (1536 x 1024
com células de 512). O cartão da abertura sai com 210 px de altura a partir de
um corpo de 206 px — dá, sem ampliar. Se um dia vierem de novo em 512, o
`BootScene` (quadro 256) e as caixas de `effects.ts` (medidas em pixels do
quadro) mudam juntos.

| Arquivo | Quadros | Substitui |
|---|---|---|
| `dados.png` | 0 nome · 1 foto · 2 endereço · 3 escola · 4 telefone · 5 cartão em branco | `drawDataIcon`, `paintCard` (cartão da abertura e das mãos) |
| `simbolos.png` | 0 escudo verde · 1 escudo apagado · 2 cadeado aberto · 3 cadeado fechado · 4 olho · 5 mão de "não" | `drawShield`, `paintShieldSlot`, `drawPadlock`, ícones dos balões e do botão NÃO |

Cada quadro é centrado pela **caixa alfa medida** (`DATA_BOX`, `CARD_BOX`,
`SYMBOL_BOX` em `effects.ts`), e o `size` pedido é o maior lado dela. Duas
exceções: o cartão é medido pelo corpo, sem a estrelinha; e os cadeados pelo
corpo, sem a alça — aberto e fechado trocam de quadro no meio da animação, e
centrados pela caixa inteira o corpo pularia quando a alça desce. Os desenhos
antigos continuam como reserva, por `textures.exists()`.

**Continuam em `Graphics`:** a seta verde sobre a moita e o "play" da pílula
(sinal de estado, que acende e apaga), o chip do cartão no header (é pílula com
texto), balões, pílulas, cone, brilhos e raios do cofre.

### 0.1 A linha de arte deste jogo

É a **linha própria do Esconde-Dados**, anterior às seis de `references/`. A
referência que vai anexada em toda geração são **os PNGs do próprio jogo** —
não as imagens de `references/`.

| | Esconde-Dados | Chibi de figurinha (NÃO é esta) |
|---|---|---|
| traço | grosso, uniforme, azul-marinho quase preto `#000819`, ponta redonda de caneta | fino, uniforme, escuro dessaturado |
| cor | chapada e saturada, um tom de sombra embaixo/à direita e um risco de brilho branco | chapada, um tom de sombra |
| olho | pontinho ou arco, bochecha rosada redonda | enorme, com brilho |
| silhueta | o próprio contorno escuro, **sem keyline branca** | keyline branca de adesivo |
| proporção | cabeça grande sobre corpo de criança, formas roliças | cabeça enorme, corpo mínimo |

Cores medidas na arte: pele `#FAD2AC`, cabelo `#ED6715`, camiseta `#218CFB`,
short `#FCB625`, cofre `#4A5D7C`.

**O rosto que aparece no "nome" e na "foto" é o do menino de cabelo laranja**:
o cartão diz "Este cartão tem a SUA FOTO", e a criança que joga é ele. Por isso
`dados.png` leva `crianca.png` anexada e NÃO põe o menino no negativo — e
`simbolos.png`, que não tem gente, põe.

### 0.2 `dados.png` — 1536 x 1024, grade 3 x 2

Anexar: **`crianca.png` e `cofre.png`**.

Os ícones aparecem de 35 px (dentro do escudo do header) a 124 px (cartão da
abertura). O que decide é o tamanho pequeno: silhueta grossa, pouco detalhe, e
a casa e a escola com formas diferentes, não só cores.

#### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cheerful children's cartoon clipart for a first-grade game;
THICK clean outline of even weight in a very dark navy, almost black (#000819),
with rounded line ends, like a thick felt-tip marker; bright saturated FLAT
colours, each shape with ONE darker shade tone on its lower-right side and a
small white shine mark on its upper-left side, no gradients; chunky rounded
shapes, no sharp corners, very few details; small inner detail strokes in the
same dark outline colour. NO white sticker keyline — the dark outline is the
edge of every object. Take ONLY the art style from the attached images, with
ONE exception: the boy's face, described below. Do NOT copy the safe, the
poses or the bush.

ICON SPRITE SHEET — 6 game icons in a strict grid of 3 columns by 2 rows,
1536 x 1024 pixels, every cell exactly 512 x 512, fully transparent background.
Each object is centred in its cell and fills about 75% of it, front view, flat
and straight (no tilt, no perspective), with wide empty transparent space
around it. No grid lines. All six share the same outline weight, the same scale
and the same lighting, as one icon family. They will be shown as small as 40
pixels, so every silhouette must be chunky, simple and instantly readable.

These are the PERSONAL DATA of the orange-haired boy in the attached reference
(messy orange hair #ED6715, skin #FAD2AC, rosy round cheeks, big happy smile,
blue t-shirt #218CFB). Wherever a face appears, it is HIS face, head and
shoulders only, simplified.

Cells, left to right, top row first:
1. NAME — a horizontal ID name tag: rounded rectangle, cream body #FFF8EC, a
   blue header band #218CFB and a small clip slot at the top; on the left a
   round portrait of the boy's face; on the right two thick grey wavy scribble
   lines that suggest handwriting — scribbles only, NOT letters.
2. PHOTO — a square instant photo with a thick white frame, wider at the
   bottom; inside, a light sky-blue background #BFE7FF with the boy's head and
   shoulders, smiling.
3. HOME ADDRESS — a small cosy house, tall and narrow: warm yellow walls
   #FFC857, pointed terracotta roof #E8743B, a white door and one round window;
   a big red map location pin #E14B4B stands above the roof, slightly to the
   right.
4. SCHOOL — a WIDE low schoolhouse: red-brick walls #D9573B with white trim and
   two white windows, a small white bell tower with a golden bell in the middle
   of the roof, a little green flag on top, and a small blue kid's backpack
   #218CFB leaning at the front-left corner. Clearly wider and different in
   shape from the house.
5. PHONE NUMBER — a smartphone standing upright, dark slate body #3B4A5E, light
   blue screen with a round green call-handset symbol #2FBF71 in the middle and
   a row of five white dots below it that hide the number — dots only, NO
   digits.
6. BLANK DATA CARD — a precious collectible card in portrait format (width to
   height 5:6), rounded corners, cream face #FFF8EC, thick golden rim #F5C542
   with a darker gold edge #D99A1F, and one small four-point sparkle on the
   top-right corner of the rim. The whole centre of the card is EMPTY flat
   cream with nothing drawn on it — the game places a picture there.

DO NOT INCLUDE: text, letters, words, readable writing, names, digits, numbers,
street names, school names, logos, brand marks, watermark, signature, grid
lines, cell borders, frames around the cells, UI panels, buttons, speech
bubbles, background scene, ground, floor, drop shadows under the objects,
full-body characters, other people, the teacher, the robot guard, the purple
app avatar, bushes, trees, safes, white sticker keyline, thin lines, sketchy
lines, tiny details, soft airbrushed gradients, painterly rendering, glossy 3D,
3D render, photorealistic, isometric or perspective view, tilted objects,
objects cropped or touching the cell edge.
~~~

### 0.3 `simbolos.png` — 1536 x 1024, grade 3 x 2

Anexar: **`cofre.png` e `moita.png`** (objetos, sem gente).

Os pares 1-2 e 3-4 trocam de quadro no meio de uma animação — o escudo que
enche no header, o cadeado que fecha na frente do cofre. Se o desenho mudar de
lugar dentro da célula, ele pula na troca; por isso o prompt exige a mesma
posição e só muda o que precisa mudar.

#### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cheerful children's cartoon clipart for a first-grade game;
THICK clean outline of even weight in a very dark navy, almost black (#000819),
with rounded line ends, like a thick felt-tip marker; bright saturated FLAT
colours, each shape with ONE darker shade tone on its lower-right side and a
small white shine mark on its upper-left side, no gradients; chunky rounded
shapes, no sharp corners, very few details; small inner detail strokes in the
same dark outline colour. NO white sticker keyline — the dark outline is the
edge of every object. Take ONLY the art style from the attached images: do NOT
copy the safe or the bush.

ICON SPRITE SHEET — 6 game symbols in a strict grid of 3 columns by 2 rows,
1536 x 1024 pixels, every cell exactly 512 x 512, fully transparent background.
Each object is centred in its cell and fills about 75% of it, front view, flat
and straight (no tilt, no perspective), with wide empty transparent space
around it. No grid lines. All six share the same outline weight, the same scale
and the same lighting, as one icon family. They will be shown as small as 40
pixels, so every silhouette must be chunky, simple and instantly readable.

Cells, left to right, top row first:
1. TRUST SHIELD — a friendly chunky shield: flat top with rounded corners,
   straight sides that curve into a soft point at the bottom. A thick
   safe-green rim #2FBF71 with a darker green edge #1F9A57 around a large
   lighter mint-green inner plate #A8EBC4, and a white shine on the upper
   left. The inner plate is EMPTY and takes about 70% of the shield — the game
   places a picture there.
2. EMPTY SHIELD — EXACTLY the same shield as cell 1, same outline, same size
   and same position inside the cell, but not earned yet: pale cream plate
   #FFF8EC and light beige rim #E8DCC6. Only the colours change.
3. OPEN PADLOCK — a chunky golden padlock body #F5C542 with a darker gold edge
   #D99A1F and a round dark keyhole; the steel-grey shackle #9FB0C4 is lifted
   up and swung open to the left.
4. CLOSED PADLOCK — EXACTLY the same padlock body as cell 3, same size and same
   position inside the cell, with the shackle down and locked into the body.
   Only the shackle changes.
5. LOOKING EYE — one single big cartoon eye, almond shaped, white, with a
   dark-brown iris #3B2A22, a large white highlight and three short eyelash
   strokes on top; curious and friendly, never scary. Just the eye, no face.
6. "NO" HAND — a friendly open hand, palm facing the viewer, fingers together
   pointing up, thumb out to the side, warm child skin #FAD2AC, two short palm
   crease strokes, ending at the wrist, in front of a round coral-red disc
   #E14B4B with a darker red rim #B83232 — the calm, universal "stop, don't"
   gesture.

DO NOT INCLUDE: text, letters, words, digits, numbers, check marks, crosses,
stars or pictures inside the shields, logos, watermark, signature, grid lines,
cell borders, frames around the cells, UI panels, buttons, speech bubbles,
background scene, ground, drop shadows, people, children, faces, full
characters, the orange-haired boy, the teacher, the robot guard, the purple app
avatar, arm or sleeve on the hand, keys, chains, bushes, trees, safes, white
sticker keyline, thin lines, sketchy lines, tiny details, soft airbrushed
gradients, painterly rendering, chrome reflections, glossy 3D, 3D render,
photorealistic, isometric or perspective view, tilted objects, objects cropped
or touching the cell edge.
~~~

### 0.4 Depois que chegar

- Se vier com fundo branco, refazer pedindo fundo magenta `#FF00FF` chapado e
  remover a cor. Branco não serve: é a cor da moldura da foto e do olho.
- Medir a caixa alfa de cada célula e centrar pela caixa, não pela célula. Nos
  pares escudo e cadeado, ancorar os dois quadros pela MESMA caixa (a do
  primeiro), senão a troca pula.
- Cada peça continua com o desenho de `Graphics` como reserva, por
  `textures.exists()`: o jogo roda sem as folhas.

---

## 1. Arquivos

| Arquivo | Grade | Tamanho final | Uso |
|---|---|---|---|
| `crianca.png` | 4 x 1 | 1024 x 256 | personagem principal: parado, correndo, escondido, recusando |
| `pessoas.png` | 5 x 1 | 1280 x 256 | adulto confiável 1, adulto confiável 2, pessoa curiosa, avatar de app, adulto neutro |
| `cover-esconde-dados.png` | - | 1024 x 576 | capa do catálogo |

Não pedir textura para cenário, cartão, cofre, esconderijo, lanterna, cone de
luz, escudo, cadeado, botões, estrelas, balões ou UI. *(Valeu até a arte
chegar: cofre, cartão, escudo, cadeado e pictogramas viraram textura — §0.)*

---

## 2. Estilo comum

```
flat 2D cartoon illustration, chibi style for a first-grade educational game,
simple rounded shapes, bold readable silhouette, thick dark outline, warm friendly
colors, minimal detail, flat colors, one soft shadow, clear face expression,
transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, scary, threatening, dark horror,
police, weapon, chase scene, danger symbol, text, letters, numbers, words, watermark,
signature, frame, border, grid lines, UI panel, button, speech bubble, lock icon,
star icon, cropped, cut off, white background
```

Nada de texto dentro da imagem. Nenhum nome, número de telefone, endereço ou
nome de escola pode aparecer em textura.

---

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| pele clara | `#F2B28C` |
| pele média | `#B8754A` |
| cabelo escuro | `#3B2A22` |
| camiseta criança | `#4DA3FF` |
| short criança | `#FFB84D` |
| adulto confiável | `#2FBF71` |
| pessoa curiosa | `#8B8F98` |
| avatar de app | `#8B5CF6` |
| destaque seguro | `#35D07F` |

---

## 5. Prompts

### 5.1 `crianca.png` - 1024 x 256, grade 4 x 1

```
Sprite sheet with 4 frames in a strict 4-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

The SAME first-grade child in all frames: friendly chibi proportions, blue shirt
#4DA3FF, yellow shorts #FFB84D, simple sneakers, thick dark outline #1F2A37, clear
face, full body visible, centered with empty margin. A small data card peeks from a
front pocket in every frame, shown only as a blank card with a shield pictogram, no
text, no letters, no numbers.

Frames, left to right:
1. standing carefully, one hand holding the pocket with the card.
2. running to the right, happy focused face, arms moving.
3. hiding crouched behind an implied low shape, only upper body visible, finger near
   lips in a quiet gesture, no fear.
4. refusing politely with one big open hand forward, calm face, card protected in
   pocket.

[estilo comum] [negativo comum]
```

### 5.2 `pessoas.png` - 1280 x 256, grade 5 x 1

```
Sprite sheet with 5 frames in a strict 5-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

Five friendly simplified characters for a child online safety game, same style and
scale, full body visible, centered with empty margin, thick dark outline #1F2A37, no
text, no letters, no numbers.

Frames, left to right:
1. trusted parent or caregiver, warm smile, green clothing #2FBF71, open welcoming
   posture, small blank shield badge with no symbol text.
2. trusted teacher, warm smile, green detail #2FBF71, simple lanyard badge with a
   shield pictogram only, no letters.
3. unknown curious adult, friendly but neutral, gray clothing #8B8F98, one hand asking
   to see something, no scary expression.
4. app avatar on a rounded square base, purple #8B5CF6, smiling screen face, offering
   a small blank sticker card, no letters.
5. neutral adult silhouette, friendly, beige and blue clothing, no badge, used as a
   distractor.

[estilo comum] [negativo comum]
```

### 5.3 `cover-esconde-dados.png` - 1024 x 576

```
Cover art for a first-grade educational game named Esconde-Dados, 1024 by 576.

A friendly child in a sunny playground protects a glowing blank data card in a pocket
while moving between simple hiding spots. A soft yellow flashlight cone is visible in
the background, a green shield and a small safe appear near a trusted adult. Bright,
safe, playful, no fear, no chase, no UI frame, no text, no letters, no numbers.

[estilo comum] [negativo comum]
```

---

## 6. O que fica em Graphics

| Elemento | Como desenhar |
|---|---|
| pracinha | céu, chão, árvores simples e portão com retângulos e curvas |
| esconderijos | moita, banco, placa e caixa com formas vetoriais |
| curioso | corpo geométrico simples, olho, lanterna presa ao braço |
| lanterna | cone amarelo translúcido com borda suave |
| cartão | retângulo arredondado com pictograma do dado atual |
| dados pessoais | ícones: rosto, casa, mochila, telefone sem números, retrato |
| cofre | retângulos arredondados, porta, brilho e animação de abrir |
| escudo | shape vetorial, verde seguro ou dourado final |
| UI | HUD, tutorial, botões, progresso, brilho, cadeado, estrelas |

O curioso pode ser totalmente em Graphics para economizar textura. Ele precisa
ser simpático e previsível: a lanterna é o obstáculo, não o personagem.

---

## 7. Sons

Sem arquivos de áudio. Sons sintetizados em WebAudio:

| Som | Síntese |
|---|---|
| toque | seno curto |
| corrida | ruído leve com filtro alto |
| esconderijo | pop macio |
| visto pela luz | boing curto + risada leve sintetizada |
| bloqueio de dado | tom grave curto |
| cofre abrindo | arpejo ascendente |
| fim de nível | fanfarra curta |

Todos respeitam `mute-audio`.

---

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `crianca.png` e `pessoas.png` |
| Recorte | spritesheets com grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro |
| Peso alvo | sprites até 250 KB cada; capa até 400 KB |
| Sem | texto, número, marca, moldura, linha de grade, interface, corte |

Se a geração vier com fundo branco, refazer em magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 9. Ordem

1. Implementar todos os placeholders em Graphics.
2. Gerar `crianca.png`.
3. Gerar `pessoas.png`.
4. Gerar `cofre.png` — tira HORIZONTAL, 4 quadros de 256 × 256, na ordem
   fechado, entreaberto, meio aberto, escancarado. A porta gira para a
   DIREITA e o corpo fica parado, senão o cofre pula de lugar ao abrir.
5. Só depois gerar `cover-esconde-dados.png`.

O jogo deve continuar publicável mesmo se apenas a capa existir. As sprites
melhoram o acabamento, mas não podem ser dependência estrutural.
