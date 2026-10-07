# Cantinho do Tablet — texturas

Pasta de entrega: `src/assets/games/EF02CO06/cantinho-do-tablet/`

**Anexe em toda geração:** `references/33-chibi-icone.jpg`. É a folha de ícones chibi que
você mandou em 05/10/2026.

O jogo já roda sem nenhum PNG: cada arquivo abaixo tem um desenho de reserva em `Graphics`,
na mesma grade (`scenes/fallback.ts`). Ao chegar um PNG com o nome certo, ele toma o lugar
do desenho. Depois disso eu meço a arte e ajusto as posições.

## A linha de arte: chibi de ícone

| | Chibi de figurinha (`19`) | Pop chapado (`30–32`) | **Chibi de ícone (`33`)** |
|---|---|---|---|
| traço | escuro dessaturado, uniforme | marinho, uniforme | **marrom quente e fino, um pouco mais grosso na silhueta** |
| cor | chapada, 1 tom de sombra | 100 % chapada | **cel shading macio: 1 tom de sombra + degradê leve + brilho de borda** |
| olho | enorme, 1 brilho | amendoado | **enorme, íris em degradê, cílio de cima escuro, 2–3 brilhos** |
| proporção | cabeça grande | esguia | **cabeça ≈ metade da altura, corpo pequeno e macio** |
| keyline branca | sim | não | **não** |

**O elenco da referência vai para o negativo.** A imagem é uma folha de personagens de jogo
de fantasia (chapéu vermelho, tapa-olho, roupas de aventura) com marca d'água. O gerador
copia tudo isso se ninguém proibir.

## O que é PNG e o que fica em código

| PNG (este arquivo) | `Graphics` (sempre) |
|---|---|
| fundo do quarto, janela com cortina, mesa, prateleira, tablet nos 4 humores, copo, tomada, selinho, Lia, Pipoca, Beto, capa | fio do carregador (curva que muda), raios de sol, brilho das coisas tocáveis, gotas, vapor, botão ▶ JOGAR, balões, HUD, cartaz de cuidados |

## Arquivos

| Arquivo | Tamanho | Grade | Obrigatório? |
|---|---|---|---|
| `bg-quarto.png` | 1280 × 720 | — | sim |
| `objetos.png` | 1280 × 960 | 4 × 3 células de 320 | sim (**insubstituível**: é a mecânica) |
| `personagens.png` | 1280 × 960 | 4 × 3 células de 320 | sim |
| `cover.png` | 1280 × 720 | — | sim (capa do catálogo) |
| `objetos-n2.png` | 1280 × 960 | 4 × 3 | **não usado** — os níveis agora reaproveitam o mesmo quarto |
| `objetos-n3.png` | 1280 × 960 | 4 × 3 | **não usado** — idem |

**Elenco (igual em todos os prompts):**
- **Lia** tem 7 anos. Pele morena média, cabelo castanho-escuro cacheado em dois puffs
  redondos presos com elásticos amarelos, olhos grandes cor de âmbar. Veste camiseta
  verde-menta com uma estrelinha amarela, short lilás e tênis brancos com cadarço menta.
- **Beto** é o irmãozinho dela, de 4 anos. Mesma pele, cabelo curto cacheado escuro, camiseta
  laranja, short azul-marinho e tênis vermelhos.
- **Pipoca** é um gato gordinho laranja e branco, com barriga e patas creme, olhos verdes
  grandes e rabo com a ponta branca.

---

## 1. `bg-quarto.png` — o quarto vazio

O palco. Janela, mesa, prateleira e tomada **não** entram, porque são objetos que mudam e vêm
da folha `objetos.png`. Por isso as áreas onde eles ficam têm de sair **lisas**.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big round heads on tiny soft bodies, huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, tiny simple mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

SUBJECT — an EMPTY cozy children's room, seen perfectly straight-on from the front like a theatre stage (flat front elevation, no perspective tilt, no ceiling visible). 16:9, 1280×720.
- Back wall: soft pastel peach with a very subtle pattern of tiny cream dots; a white baseboard along the bottom of the wall.
- Floor: warm light-honey wooden planks filling the lower 22% of the image (the wall meets the floor at 78% of the height, a perfectly horizontal line across the whole picture).
- A round soft mint-green rug lying flat on the floor, centered.
- Far left corner: a small potted plant on the floor with round leaves.
- Far right edge: an open doorway (pale wooden frame) showing a softly lit hallway, cut by the right border.
- Upper right of the wall: a small framed child's drawing of a sun and a house (simple shapes, no letters).
- KEEP THESE WALL AREAS PLAIN AND EMPTY: the whole upper-left third (a window will be placed there), the center of the wall above the rug (a table will be placed there), and the right-center wall between the drawing and the floor (a shelf and a wall socket will be placed there).
- Soft warm afternoon light, gentle shading, calm and uncluttered so objects placed on top stand out.

DO NOT INCLUDE: any characters, people, animals, a window, curtains, a table, a desk, shelves, wall sockets, cables, tablets, phones, screens, toys in the middle of the floor, a bed, furniture in the center, the characters from the reference image, Genshin Impact characters, fantasy decor, square icon tiles, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, any text, letters or numbers, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective floor lines converging, dark or gloomy lighting.
~~~

---

## 2. `objetos.png` — o que a criança toca (insubstituível)

Folha 1280 × 960, **fundo transparente**, 4 colunas × 3 linhas de células de 320 × 320.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **linha 1** | janela, cortina aberta, sol forte | janela, cortina fechada | mesa | prateleira |
| **linha 2** | tablet feliz | tablet molhado | tablet quente | tablet quebrado |
| **linha 3** | copo de suco | copo tombado | tomada com carregador | selinho |

Regras de forma, que o jogo depende delas:
- janela aberta e fechada **do mesmo tamanho e na mesma posição** na célula;
- os quatro tablets **iguais em tamanho, forma e lugar**; só o humor da tela muda;
- tablet, copo, mesa e tomada **apoiados no pé da célula** (≈ 20 px acima da borda de baixo).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — soft rounded shapes, thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; glossy highlights on glass and screens; warm pastel palette; tiny four-point sparkles as decoration; faces (where asked) with huge glossy eyes, two or three white sparkle highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, poses or square-tile framing.

FORMAT — a sprite sheet of OBJECTS, 1280×960 px, TRANSPARENT background, a grid of 4 columns × 3 rows of 320×320 px cells. One object per cell, centered, fully inside its cell with at least 16 px of empty margin, nothing crossing into another cell, no grid lines, no background tiles. Straight-on front view for everything (like a stage). Objects that stand rest on an invisible baseline about 20 px above the bottom of their cell.

ROW 1
1. A square window with a cream-white wooden frame and a cross divider, showing a bright blue sky with a BIG strong yellow sun with short rays in the upper part; two soft pink curtains are TIED OPEN to the left and right sides with little ribbons; a warm sunbeam glow spills out. Fills most of the cell.
2. EXACTLY the same window, same size and same position, but the two pink curtains are DRAWN SHUT and meet in the middle, hiding the sky and the sun; only a thin warm glow peeks around the edges of the frame.
3. A low wooden table seen from the front: one long rectangular light-honey wood top, two short sturdy legs visible, a small drawer with a round knob; the top is EMPTY and flat. As wide as the cell allows (about 290 px), short in height (about 95 px from the floor to the top).
4. A small floating wall shelf: one plank of light wood (about 240 px wide) with two small cream brackets underneath, empty, front view.

ROW 2 — the SAME tablet four times: a tablet standing upright on a small foldable stand, screen facing the viewer, inside a rounded mint-green protective case. Its screen shows a cute simple face (two big glossy eyes and a small mouth) that shows its mood. All four identical in size, shape and position; only the screen and the small effects change.
5. HAPPY: screen bright sky-blue, big smiling face, two tiny sparkles.
6. WET: orange juice splashed over the screen and case, orange drips running down, the face sad with a little tear.
7. HOT: screen turned bright red-orange, the face sweating with a wavy worried mouth, two little white steam puffs rising from the top.
8. BROKEN: a big zig-zag crack across the screen, the face with dizzy spiral eyes and a wobbly mouth, the stand slightly bent.

ROW 3
9. A clear drinking glass FULL of orange juice with a striped red-and-white bendy straw, standing upright.
10. The same glass TIPPED OVER on its side, lying on the baseline, with a small orange juice puddle spilling out of it.
11. A white wall socket plate (rounded square) with a small white charger plugged in; a short stub of white cable comes out of the bottom of the charger and ends cleanly after a few pixels (the game draws the rest of the cable).
12. A round sticker badge with a scalloped edge, mint green, with a big white checkmark and a tiny pink heart, plus one small sparkle. No text.

DO NOT INCLUDE: any text, letters, numbers or logos (not even on the screens, the badge or the socket), characters, people, animals, hands, the characters from the reference image, Genshin Impact items, fantasy objects, weapons, square icon tiles, colored backgrounds behind the objects, shadows that fill the cell, objects crossing cell borders, objects cut by the cell edge, different sizes between the four tablets, a different window size between cells 1 and 2, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 3. `personagens.png` — Lia, Pipoca e Beto

Folha 1280 × 960, **fundo transparente**, 4 × 3 células de 320 × 320.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **Lia** | esperando, animada | comemorando | assustada | apontando |
| **Pipoca** | sentado | pulando | farejando | assustado |
| **Beto** | correndo ← | tropeçando ← | acenando | "ops" |

Tamanhos dentro da célula: Lia ≈ 280 px de altura, Beto ≈ 230, Pipoca sentado ≈ 150. Os pés
ficam todos na mesma linha, ≈ 20 px acima do pé da célula. O Beto corre **para a esquerda**;
Lia e Pipoca olham **para a direita**.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big round heads on tiny soft bodies (the head is about half of the total height), huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, tiny simple mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouette; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; hair as big simple glossy clumps with a shine band; warm pastel palette; tiny four-point sparkles and emotion marks as decoration. Here the characters are drawn FULL BODY (head to shoes), not as head icons. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

FORMAT — a character sprite sheet, 1280×960 px, TRANSPARENT background, a grid of 4 columns × 3 rows of 320×320 px cells. One full-body pose per cell, centered, fully inside its cell with at least 16 px of empty margin, nothing crossing into another cell, no grid lines, no background tiles. All feet rest on the same invisible baseline about 20 px above the bottom of each cell. Keep the same character design, size and colors in every pose of the same character.

CAST
- LIA: a 7-year-old Brazilian girl with warm medium-brown skin, dark-brown curly hair in two round puffs tied with yellow hair ties, big amber-brown eyes; mint-green T-shirt with a small yellow star, lilac shorts, white sneakers with mint laces. About 280 px tall.
- PIPOCA: a chubby orange-and-white house cat with a cream belly and paws, big round green eyes, a short tail with a white tip. About 150 px tall when sitting.
- BETO: Lia's 4-year-old little brother, same warm medium-brown skin, short dark curly hair, orange T-shirt, navy-blue shorts, red sneakers. About 230 px tall.

ROW 1 — LIA, body turned three-quarters to the RIGHT
1. Waiting, excited: hands clasped under her chin, big hopeful smile, sparkly eyes.
2. Celebrating: both arms up high, eyes closed in a happy arc, big open smile, little sparkles around her.
3. Scared: both hands on her cheeks, mouth open in a round "O", eyebrows raised, one blue sweat drop.
4. Explaining: pointing to the right with one hand, the other hand on her hip, friendly smile.

ROW 2 — PIPOCA the cat, facing RIGHT
5. Sitting calmly, tail curled around the paws, content half-closed eyes.
6. Jumping: stretched out in mid-air in a leap toward the right, front paws forward, back legs extended, tail up (no ground under it, but keep it inside the cell).
7. Standing on four paws, head low and forward, sniffing curiously, tail up in a question-mark curve.
8. Startled: fur puffed up, back arched, tail bristled, eyes wide, tiny shock lines.

ROW 3 — BETO
9. Running to the LEFT: big happy stride, arms swinging, leaning forward, a small dust puff behind his heel.
10. Tripping to the LEFT: falling forward with both arms stretched out, one foot caught behind, surprised round mouth, eyes wide (body tilted about 30 degrees, still inside the cell).
11. Waving at the viewer with one hand, big toothy smile, standing.
12. "Oops": standing facing left, one hand covering his mouth, eyes wide and embarrassed, small blush.

DO NOT INCLUDE: the characters from the reference image, Genshin Impact characters, blond hair, red hats, berets, eyepatches, capes, fantasy armor, jewels, weapons, elf ears, wings, adults, extra characters, tablets or phones in their hands, furniture, floor, scenery, square icon tiles, colored backgrounds behind the characters, cast shadows, poses crossing cell borders, characters cut by the cell edge, white sticker keyline, watermarks, signatures, @handles, website names, any text, letters or numbers, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `cover.png` — capa

16:9, cena inteira, **com o título escrito** ([[capa-tem-titulo]]).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big round heads on tiny soft bodies, huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, tiny simple mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; hair as big simple glossy clumps with a shine band; warm pastel palette; tiny four-point sparkles as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

SUBJECT — the cover of a children's game, 16:9, 1280×720, a full scene.
- A cozy pastel-peach children's room seen straight-on. In the center, a low light-wood table; IN THE MIDDLE of the table a tablet in a mint-green case stands on a small stand, its screen shows a happy smiling face and little music notes floating out.
- LIA, a 7-year-old Brazilian girl with warm medium-brown skin, dark-brown curly hair in two round puffs with yellow hair ties, big amber-brown eyes, mint-green T-shirt with a small yellow star and lilac shorts, stands at the left of the table with both arms up, celebrating, full body, big happy smile.
- PIPOCA, a chubby orange-and-white cat with green eyes, peeks from the right side of the table.
- On a small wall shelf at the right, a glass of orange juice with a striped straw, safely far from the tablet. Pink curtains on a window at the left are closed, with a warm glow around them. A white charger cable runs neatly along the baseboard.
- Small mint-green round sticker badges with white checkmarks float around the scene like rewards.
- TITLE at the top center, big and readable: "Cantinho do Tablet" in chunky rounded bubble letters, cream fill with a warm dark-brown outline and a soft mint-green drop shadow, a tiny sparkle on the first letter. Spell it EXACTLY: C-a-n-t-i-n-h-o d-o T-a-b-l-e-t.
- Bright, warm, friendly, uncluttered, the characters large in the frame.

DO NOT INCLUDE: any other text besides the title, misspelled title, extra letters, subtitles, logos, the characters from the reference image, Genshin Impact characters, blond hair, red hats, berets, eyepatches, fantasy armor, weapons, adults, a juice glass next to the tablet, a tablet at the table edge, cables across the floor, open curtains with harsh sun on the tablet, square icon tiles, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, dark or gloomy lighting.
~~~

---

## 5. `objetos-n2.png` — não usado (ideia antiga de N2, guardada para outro jogo)

Só quando o N2 for feito. A grade é igual à do `objetos.png`.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **linha 1** | luminária acesa | luminária apagada | relógio da pausa ligado | relógio da pausa desligado |
| **linha 2** | fone com volume alto | fone com volume no meio | suporte do tablet (vazio) | pufe |
| **linha 3** | Lia com olhos cansados | Lia com a mão no ouvido | Lia se alongando | Lia sentada jogando |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big round heads on tiny soft bodies, huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, tiny simple mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles and emotion marks as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

FORMAT — a sprite sheet, 1280×960 px, TRANSPARENT background, a grid of 4 columns × 3 rows of 320×320 px cells. One item per cell, centered, fully inside its cell with at least 16 px of empty margin, nothing crossing into another cell, no grid lines, no background tiles. Straight-on front view. Standing items rest on an invisible baseline about 20 px above the bottom of their cell. Pairs (1–2, 3–4, 5–6) are the SAME object in the same size and position, only the state changes.

LIA (rows 3): a 7-year-old Brazilian girl with warm medium-brown skin, dark-brown curly hair in two round puffs with yellow hair ties, big amber-brown eyes; mint-green T-shirt with a small yellow star, lilac shorts, white sneakers with mint laces; full body, about 280 px tall, turned three-quarters to the right.

ROW 1
1. A cute round desk lamp in pastel yellow, TURNED ON: the bulb glowing warm, a soft cone of light.
2. The same lamp TURNED OFF: bulb grey, no glow.
3. A round pastel-pink alarm clock with two little bells and a small sleeping-cat face on the dial, SWITCHED ON: a small glowing green dot on top and tiny "ready" sparkles.
4. The same clock SWITCHED OFF: the dot grey, no sparkles.

ROW 2
5. Over-ear kids headphones in lilac with a big volume slider on the side pushed all the way UP, three big loud sound-wave arcs coming out.
6. The same headphones with the slider in the MIDDLE, one small soft sound-wave arc.
7. A small empty foldable tablet stand in light wood.
8. A round soft mint-green floor cushion (pouf).

ROW 3
9. LIA rubbing her tired eyes with both fists, droopy eyelids, a small dizzy swirl.
10. LIA covering one ear with her hand, wincing, eyes squeezed shut.
11. LIA stretching both arms up high, eyes closed, relaxed smile.
12. LIA sitting cross-legged on the floor, looking to the right with a happy smile, hands on her knees.

DO NOT INCLUDE: any text, letters, numbers or logos (not on the clock, not on the headphones), clock hands showing a specific time with numbers, the characters from the reference image, Genshin Impact characters, blond hair, red hats, eyepatches, fantasy items, weapons, extra characters, square icon tiles, colored backgrounds behind the items, objects crossing cell borders, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `objetos-n3.png` — não usado (ideia antiga de N3, guardada para outro jogo)

Só quando o N3 for feito.

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| **linha 1** | Lia de mão molhada | Lia secando a mão na toalha | toalha no gancho | — |
| **linha 2** | tomada com benjamim cheio | tomada só com o carregador | faísca (fumacinha) | — |
| **linha 3** | travesseiro com tablet embaixo | travesseiro sozinho | mesinha de cabeceira | tablet carregando na mesinha |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big round heads on tiny soft bodies, huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, tiny simple mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles and emotion marks as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

FORMAT — a sprite sheet, 1280×960 px, TRANSPARENT background, a grid of 4 columns × 3 rows of 320×320 px cells. One item per cell, centered, fully inside its cell with at least 16 px of empty margin, nothing crossing into another cell, no grid lines, no background tiles. Straight-on front view. Standing items rest on an invisible baseline about 20 px above the bottom of their cell. Cells 4 and 8 stay EMPTY (fully transparent).

LIA: a 7-year-old Brazilian girl with warm medium-brown skin, dark-brown curly hair in two round puffs with yellow hair ties, big amber-brown eyes; mint-green T-shirt with a small yellow star, lilac shorts, white sneakers with mint laces; full body, about 280 px tall, turned three-quarters to the right.

ROW 1
1. LIA just out of the bath, her hands dripping with big blue water drops, holding them up and smiling (hair slightly damp).
2. LIA drying her hands on a fluffy yellow towel, happy.
3. A fluffy yellow towel hanging on a small round wall hook.
4. (empty)

ROW 2
5. A white wall socket with a power strip (multi-plug adapter) overloaded with five plugs and tangled cables, looking strained.
6. The same white wall socket with only one small white charger plugged in, neat.
7. A small cartoon puff of grey smoke with two tiny orange sparks (an "overheat" effect, cute, not scary).
8. (empty)

ROW 3
9. A soft white pillow with a tablet in a mint-green case peeking out from UNDER it, a white charging cable coming out, little heat wavy lines.
10. The same pillow alone, fluffy.
11. A small light-wood bedside table, empty top.
12. The same bedside table with the tablet in the mint-green case lying flat on top, charging, its screen showing a calm sleeping face.

DO NOT INCLUDE: fire, flames, electrocution, lightning bolts hitting people, scary injuries, any text, letters, numbers or logos, the characters from the reference image, Genshin Impact characters, blond hair, red hats, eyepatches, fantasy items, weapons, extra characters, square icon tiles, colored backgrounds behind the items, objects crossing cell borders, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## Depois da entrega

1. Salvar os PNGs com **estes nomes exatos** na pasta de entrega.
2. Eu meço cada célula pelo canal alfa (caixa, pé, objeto que vaza para a vizinha). Se algo
   cruzar a borda, reempacoto a folha.
3. Ajusto `data/files.ts` (pé e escala por quadro) e `data/layout.ts` (mesa, prateleira e
   janela no lugar onde a arte deixou espaço), sem regenerar.
