# Praia dos Dados — texturas

Destino: `src/assets/games/EF03CO04/praia-dos-dados/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 elenco e dados,
§13 textura × código).

**Anexe em toda geração:** `references/33-chibi-icone.jpg`. A linha é a **chibi
de ícone**, e a escolha está sujeita à dúvida 2 do PLANEJAMENTO, porque a chibi
de figurinha (`19`) não está mais no disco. Cada prompt vem inteiro (estilo +
corpo + negativo), pronto para copiar.

> **O elenco da referência vai para o negativo.** A imagem é uma folha de
> personagens de jogo de fantasia (chapéu vermelho, tapa-olho, roupas de
> aventura), em ladrilhos quadrados e com marca d'água. Se ninguém proibir, o
> gerador copia tudo isso, inclusive os ladrilhos.

### Tabela de estilo — chibi de ícone

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Traço | marrom quente e fino, um pouco mais grosso na silhueta; nunca preto puro | pop chapado (marinho uniforme) e desenho de criança (caneta trêmula) |
| Cor | cel shading macio: 1 tom de sombra + degradê leve + brilho de borda | pop chapado (100 % chapada) e livro ilustrado (pintura com granulado) |
| Olho | enorme, íris em degradê, cílio de cima escuro, 2–3 brilhos | desenho de criança (pontinho) |
| Silhueta | sem keyline branca | chibi de figurinha (keyline) |
| Proporção | cabeça ≈ metade da altura, corpo pequeno e macio | graphic novel (quase natural) |

**As três regras deste jogo:**
- **Os traços dos banhistas são contrato.** Cada um tem exatamente a cabeça, os
  óculos, o objeto na mão e os pés da tabela. Um boné a mais, ou óculos que
  faltam, quebram a fase: a criança tiraria a pessoa certa e perderia. Cada
  traço tem de ser **grande e inconfundível** no tamanho do jogo (~200 px).
- **Ninguém se destaca.** Mesma pose, mesmo sorriso, mesma escala de cabeça e
  nenhum brilho especial, nem no dono.
- **Roupa nunca na cor de um objeto-dado.** Nada de roupa vermelha, azul,
  amarela ou verde-limão. As roupas são laranja, lilás, verde-água, rosa,
  roxo e branco.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-praia.png` | — | — | 1280 × 720 | opaco | céu, mar no alto, areia lisa, torre da salva-vidas à esquerda |
| `banhistas.png` | 6 × 2 | 256 × 384 | 1536 × 768 | sim | os 12 banhistas |
| `cachorros.png` | 4 × 3 | 256 × 256 | 1024 × 768 | sim | 3 cachorros × 4 poses |
| `pecas.png` | 4 × 3 | 256 × 256 | 1024 × 768 | sim | Nina × 3, rádio, toalha, 7 pictogramas |
| `cover-praia-dos-dados.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`).

**Se a arte vier em outro tamanho**, ela é usada como veio: o código mede a
folha (MANIFEST) e o layout se ajusta. O que **não pode** mudar é a **ordem das
células**, o que existe em cada uma e os **traços de cada banhista**.

**O insubstituível para o N1:** as quatro primeiras folhas. A capa vem por
último.

**Se o gerador errar muitos traços em `banhistas.png`**, gere em duas metades
de 3 × 2 (banhistas 0–5 e 6–11), com o mesmo prompt cortado na tabela. A
ordem continua a mesma.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. As fichas, os balões e o
  "PRÓXIMO DADO" são do jogo.
- Peça solta e centrada na célula, com ~6 % de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha.
- Os objetos-dado são **os mesmos** em todas as folhas: o boné vermelho dos
  banhistas é o boné vermelho do pictograma, e assim por diante.

| Objeto | Desenho fixo |
|---|---|
| boné | boné de aba reta para a frente, **vermelho**, com botão branco no alto |
| chapéu | chapéu de palha cor de palha, aba redonda larga, fita marrom |
| óculos | óculos escuros **pretos e redondos**, sempre nos olhos (nunca na testa) |
| balde | balde de praia **azul** com alça, vazio, sem pazinha |
| boia | boia redonda inflável **amarela** (anel) |
| bola | bola de praia de gomos branco, vermelho, azul e amarelo |
| pé de pato | par de nadadeiras **verde-limão**, calçado nos dois pés |

---

## 3. `bg-praia.png` — 1280 × 720, opaco

O palco. Toalhas, banhistas, Nina, cachorro e rádio entram por código, e por
isso a areia da direita sai **lisa e vazia**.

| Região (x, y) | O que tem |
|---|---|
| 0–1280, 0–90 | céu azul-claro com 2 ou 3 nuvens macias |
| 0–1280, 90–210 | mar turquesa calmo, com ondinhas e a linha de espuma da beira quase reta em y ≈ 210 |
| 0–310, 90–720 | **torre da salva-vidas** de madeira, laranja e branca, com plataforma e guarda-corpo em y ≈ 360, escadinha até a areia, bandeirinha lisa no topo |
| 320–1280, 210–720 | **areia lisa**, clara, sem nada: é onde ficam as toalhas |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — soft rounded shapes, thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles as decoration. Take ONLY the art style: do NOT copy its characters, outfits, poses or square-tile framing.

A sunny, calm beach background for a children's game, 16:9 (1280 x 720), seen from a gentle high three-quarter view, opaque, no characters. Layout, from top to bottom:
- the top 12% is a light blue sky with two or three soft round clouds;
- below it, a horizontal band of calm turquoise sea (from about 12% to 29% of the height) with small soft wave lines and a nearly straight white foam line where it meets the sand;
- everything below the foam line is warm light sand, smooth and plain, with only a very subtle texture.
On the LEFT edge, occupying only the left quarter of the image (about 0–310 px wide), a cute wooden lifeguard tower painted orange and white: four legs standing on the sand, a square platform with a railing at about half the image height, a small ladder going down to the sand, and a small plain orange flag on top. The platform must be empty (a character will stand there later).
The whole right three quarters of the sand (from x ≈ 320 to the right edge, below the foam line) must be EMPTY and plain, with even lighting, because towels and people will be placed there by the game. Bright, friendly midday light, soft shadows only under the tower.

DO NOT INCLUDE: people, characters, animals, dogs, birds, towels, beach umbrellas, beach chairs, sandcastles, shells, starfish, buckets, balls, boats, surfboards, footprints, rocks, palm trees on the sand area, objects on the right three quarters of the sand, text on the tower or the flag, any text, letters or numbers, the characters from the reference image, fantasy decor, square icon tiles, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic, perspective lines converging, dark or gloomy lighting, sunset colors.
~~~

---

## 4. `banhistas.png` — 6 × 2 células de 256 × 384 (1536 × 768), alfa

Doze banhistas de pé, **de frente**, corpo inteiro, todos na **mesma pose**:
braços soltos ao lado do corpo, o objeto (se houver) seguro numa das mãos e
afastado do corpo para aparecer inteiro, sorriso leve. Pés no mesmo ponto em
todas as células (95 % da altura). Adultos ocupam ~88 % da altura da célula;
crianças, ~78 %; o Nico, ~70 %. A **cabeça tem o mesmo tamanho** em todos.

| Célula | id | Quem | Cabeça | Óculos escuros | Na mão | Pés |
|---|---|---|---|---|---|---|
| 0 | `leo` | menino de 8 anos, pele clara, cabelo castanho liso curto, sunga laranja | **boné** | **sim** | **balde** | descalço |
| 1 | `bia` | menina de 7 anos, pele negra, duas tranças pretas, maiô lilás | **boné** | não | **boia** | **pé de pato** |
| 2 | `ze` | vovô, pele morena, barba e bigode brancos, camisa branca aberta, bermuda verde-água | **chapéu** | **sim** | nada | descalço |
| 3 | `duda` | menina de 9 anos, pele clara, rabo de cavalo castanho-claro, maiô rosa | nada | **sim** | **bola** | **pé de pato** |
| 4 | `rafa` | menino de 8 anos, pele negra, cabelo crespo curto, sunga roxa | **chapéu** | não | **balde** | **pé de pato** |
| 5 | `mari` | moça de 20 anos, pele morena, cabelo cacheado comprido escuro, maiô verde-água | nada | não | **balde** | descalço |
| 6 | `beto` | tio gordinho, pele clara, bigode e cabelo pretos, regata branca, bermuda lilás com flores | **boné** | **sim** | nada | **pé de pato** |
| 7 | `mei` | menina de 6 anos, cabelo preto liso com franja, maiô laranja | **chapéu** | **sim** | **boia** | descalço |
| 8 | `caio` | menino de 7 anos, pele morena, cabelo castanho cacheado, sunga lilás | nada | não | **bola** | descalço |
| 9 | `nena` | vovó, pele negra, cabelo grisalho em coque, maiô rosa com sainha | **chapéu** | não | **bola** | **pé de pato** |
| 10 | `nico` | menino de 5 anos, pele clara, cabelo preto espetado, sunga verde-água | **boné** | não | nada | descalço |
| 11 | `tati` | adolescente de 15 anos, pele negra, black power redondo, maiô roxo | nada | **sim** | **boia** | **pé de pato** |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big round heads on tiny soft bodies, huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, tiny simple mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

A character sprite sheet on a fully TRANSPARENT background: 12 different beach-goers in a grid of 6 columns x 2 rows, each in its own 256 x 384 cell (total 1536 x 768), read left to right, top row first. Every character: full body, standing and facing the viewer, the SAME calm pose (arms relaxed at the sides, a gentle smile), feet on the same baseline at 95% of the cell height, head ≈ half of the body height, and ALL HEADS THE SAME SIZE. Adults fill about 88% of the cell height, children about 78%, the smallest boy about 70%. If a character holds an object, it hangs from one hand slightly away from the body so it is fully visible and never covers the face or the other objects. Modest beachwear: one-piece swimsuits for girls and women, swim trunks for boys, shirts on the adult men.

THE OBJECTS ARE THE SAME ON EVERYONE WHO HAS THEM: a RED baseball cap with a front brim and a white top button; a straw-colored wide round STRAW SUN HAT with a brown band; BLACK ROUND SUNGLASSES worn over the eyes; a BLUE sand bucket with a handle (empty, no shovel); a YELLOW round inflatable swim ring; a beach ball with white, red, blue and yellow segments; a pair of LIME-GREEN swim flippers worn on BOTH feet. Characters marked "no hat" show their hair; "no glasses" show their eyes; "empty hands" hold nothing; "barefoot" show bare feet. Clothing colors are ONLY orange, lilac, teal, pink, purple and white — never red, blue, yellow or lime green.

Cells (exactly these features, nothing added, nothing missing):
1. Boy, 8, light skin, short straight brown hair, orange swim trunks — RED CAP, SUNGLASSES, holding the BLUE BUCKET, barefoot.
2. Girl, 7, dark brown skin, two black braids, lilac swimsuit — RED CAP, no glasses, holding the YELLOW SWIM RING, LIME FLIPPERS.
3. Grandpa, tan skin, white beard and mustache, open white short-sleeve shirt, teal swim shorts — STRAW HAT, SUNGLASSES, empty hands, barefoot.
4. Girl, 9, light skin, light-brown ponytail, pink swimsuit — no hat, SUNGLASSES, holding the BEACH BALL, LIME FLIPPERS.
5. Boy, 8, dark brown skin, short black kinky hair, purple swim trunks — STRAW HAT, no glasses, holding the BLUE BUCKET, LIME FLIPPERS.
6. Young woman, 20, medium-brown skin, long dark curly hair, teal swimsuit — no hat, no glasses, holding the BLUE BUCKET, barefoot.
7. Chubby uncle, light skin, black mustache and short black hair, white tank top, lilac flowered swim shorts — RED CAP, SUNGLASSES, empty hands, LIME FLIPPERS.
8. Girl, 6, straight black hair with bangs, orange swimsuit — STRAW HAT, SUNGLASSES, holding the YELLOW SWIM RING, barefoot.
9. Boy, 7, tan skin, brown curly hair, lilac swim trunks — no hat, no glasses, holding the BEACH BALL, barefoot.
10. Grandma, dark brown skin, grey hair in a bun, pink swimsuit with a little skirt — STRAW HAT, no glasses, holding the BEACH BALL, LIME FLIPPERS.
11. Small boy, 5, light skin, spiky black hair, teal swim trunks — RED CAP, no glasses, empty hands, barefoot.
12. Teen girl, 15, dark brown skin, big round afro, purple swimsuit — no hat, SUNGLASSES, holding the YELLOW SWIM RING, LIME FLIPPERS.

DO NOT INCLUDE: any extra hats, caps, glasses or objects not listed for that cell, sunglasses on the forehead, regular (clear) glasses, sandals, flip-flops or shoes, a shovel in the bucket, two objects in one hand, objects covering faces, red, blue, yellow or lime-green clothing, bikinis, bare-chested adult men, suggestive poses, waving, jumping, different poses between characters, side or back views, bigger or brighter characters, a highlighted character, ground, sand, shadows on the ground, towels, scenery, colored backgrounds behind the characters, square icon tiles, characters crossing cell borders, characters cut by the cell edge, the characters from the reference image, Genshin Impact characters, a red hat with a feather, eyepatches, fantasy outfits, armor, weapons, any text, letters or numbers, watermarks, signatures, @handles, website names, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 5. `cachorros.png` — 4 × 3 células de 256 (1024 × 768), alfa

Uma linha por cachorro, uma coluna por pose. O mesmo cachorro tem o **mesmo
tamanho** nas quatro células.

| | 0 · sentado triste | 1 · correndo | 2 · pulando feliz | 3 · deitado chorando |
|---|---|---|---|---|
| **Paçoca** (linha 0) | vira-lata caramelo, peito branco, orelhas caídas | | | |
| **Salsicha** (linha 1) | salsichinha marrom-escuro, focinho e patinhas castanho-claros, orelhas compridas | | | |
| **Floco** (linha 2) | cachorrinho branco fofo e cacheado, nariz preto | | | |

- **0:** sentado, de lado em 3/4, olhando para a **direita**, orelhas baixas,
  olhar pidão;
- **1:** correndo para a **direita**, de perfil, patas esticadas, orelhas
  voando;
- **2:** de frente, pulando com as patinhas da frente para cima, língua de
  fora, olhos fechados de alegria, rabo abanando;
- **3:** deitado de barriga, queixo no chão, orelhas caídas, olhos grandes e
  marejados com uma lágrima.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big round heads on tiny soft bodies, huge glossy eyes with gradient irises and two or three white sparkle highlights, small pink blush ovals; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette. Here the characters are ROUND KAWAII PUPPIES, NOT people. Take ONLY the art style: do NOT copy its characters, outfits, poses or square-tile framing.

A sprite sheet on a fully TRANSPARENT background: 3 cute chibi puppies x 4 poses, in a grid of 4 columns x 3 rows, each cell 256 x 256 (total 1024 x 768). One ROW per puppy, one COLUMN per pose. The same puppy has the same size, colors and markings in its four cells.
Rows (puppies):
1. A caramel-orange Brazilian mutt puppy with a white chest patch and soft floppy ears.
2. A dark brown dachshund puppy with a long body, tan muzzle and tan paws, long floppy ears.
3. A fluffy curly white small puppy (poodle-like) with a black button nose.
Columns (poses):
1. Sitting, three-quarter view facing RIGHT, ears down, big pleading sad eyes.
2. Running to the RIGHT, side view, legs stretched, ears flying back.
3. Front view, jumping up happily with front paws raised, tongue out, eyes closed in joy, tail wagging (motion lines allowed only next to the tail).
4. Lying on its belly, chin on the ground, ears flat, big watery eyes with one small tear.
Each puppy centered in its cell with about 6% margin; no collars, no tags.

DO NOT INCLUDE: collars, name tags, leashes, clothes, people, hands, other animals, cats, ground, sand, grass, shadows on the ground, scenery, food, bones, toys, colored backgrounds behind the puppies, square icon tiles, puppies crossing cell borders, puppies cut by the cell edge, different sizes of the same puppy between cells, poses facing LEFT in columns 1 and 2, the characters from the reference image, Genshin Impact creatures, fantasy creatures, wings, horns, any text, letters or numbers, watermarks, signatures, @handles, website names, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 6. `pecas.png` — 4 × 3 células de 256 (1024 × 768), alfa

| Célula | Peça |
|---|---|
| 0 | **Nina falando no rádio**: corpo inteiro, de pé, virada em 3/4 para a direita, rádio na orelha, a outra mão apontando para a direita |
| 1 | **Nina comemorando**: braços para cima, olhos fechados de alegria, rádio numa das mãos |
| 2 | **Nina preocupada**: mãos nas bochechas, sobrancelhas aflitas, rádio numa das mãos |
| 3 | **rádio grande** (o botão do N3): walkie-talkie em pé, de frente, cinza-escuro com detalhes laranja, antena curta, grade de alto-falante e **um botão redondo branco grande** no meio |
| 4 | **toalha** estendida, vista do alto em 3/4 (trapézio largo), listras brancas e verde-água, vazia |
| 5 | boné vermelho |
| 6 | chapéu de palha |
| 7 | óculos escuros pretos redondos |
| 8 | balde azul |
| 9 | boia amarela |
| 10 | bola de praia |
| 11 | par de pés de pato verde-limão |

**Nina** é salva-vidas jovem: pele morena, cabelo escuro preso num coque alto,
regata laranja de salva-vidas **sem escrita**, short branco, apito prateado no
cordão e walkie-talkie cinza-escuro. Não usa boné, chapéu nem óculos: ela não é
suspeita, e não pode parecer.

Os pictogramas (5–11) são o objeto sozinho, de frente, grande na célula, igual
ao dos banhistas (tabela do §2).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — soft rounded shapes, thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; glossy highlights on plastic and glass; warm pastel palette; the character has a very big round head on a tiny soft body, huge glossy eyes with gradient irises, a dark upper lash line, two or three white sparkle highlights and small pink blush ovals. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

A sprite sheet on a fully TRANSPARENT background, a grid of 4 columns x 3 rows, each cell 256 x 256 (total 1024 x 768), read left to right, top row first. Each item centered in its cell with about 6% margin.
The character NINA is a young lifeguard woman: medium-brown skin, dark hair in a high bun, an orange lifeguard tank top with NO text or logo, white shorts, bare feet, a silver whistle on a cord around her neck, and a dark grey walkie-talkie. She wears NO cap, NO hat and NO sunglasses. Full body, head ≈ half of her height, the same size in cells 1–3.
Cells:
1. Nina talking on the walkie-talkie: standing, three-quarter view turned to the RIGHT, the radio held at her ear, the other hand pointing to the right, mouth open talking.
2. Nina celebrating: both arms raised, eyes closed in joy, big smile, the radio in one raised hand.
3. Nina worried: both hands on her cheeks, worried eyebrows, small open mouth, the radio in one hand.
4. A big chunky walkie-talkie standing upright, front view: dark grey body with orange side accents, a short antenna, a speaker grille, and ONE big round WHITE push button in the middle. No screen, no text.
5. A beach towel spread flat on the ground, seen from a high three-quarter view (a wide trapezoid, about three times wider than tall), white and teal stripes, slightly soft corners, empty.
6. A RED baseball cap with a front brim and a white top button, three-quarter front view.
7. A straw-colored wide round STRAW SUN HAT with a brown band.
8. A pair of BLACK ROUND SUNGLASSES, front view.
9. A BLUE sand bucket with a handle, empty, no shovel.
10. A YELLOW round inflatable swim ring.
11. A beach ball with white, red, blue and yellow segments.
12. A pair of LIME-GREEN swim flippers side by side, seen from above.

DO NOT INCLUDE: a cap, hat or sunglasses on Nina, text or logos on her tank top, a red lifeguard uniform, a swimsuit on Nina, a lifeguard buoy, extra characters, other people, animals, hands holding the objects in cells 4–12, a shovel, sand inside the bucket, a screen or text on the walkie-talkie, more than one button, ground, sand, shadows on the ground, colored backgrounds behind the objects, square icon tiles, objects crossing cell borders, objects cut by the cell edge, the characters from the reference image, Genshin Impact items, a red hat with a feather, eyepatches, fantasy objects, weapons, any text, letters or numbers, watermarks, signatures, @handles, website names, white sticker keyline, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 7. `cover-praia-dos-dados.png` — 1672 × 941, opaco, com o título

A cena do jogo no melhor momento: o Paçoca correndo para o colo do dono, e a
Nina comemorando na torre. O título **Praia dos Dados** vai num letreiro no
alto (memória *capa tem título*).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime "icon" illustration — very big round heads on tiny soft bodies, huge glossy eyes with gradient irises, a dark upper lash line and two or three white sparkle highlights, small pink blush ovals, tiny simple mouths; thin clean lineart in warm dark brown (never pure black), a little thicker on the outer silhouettes; soft anime cel shading with one shadow tone plus a gentle gradient and small rim highlights; warm pastel palette; tiny four-point sparkles as decoration. Take ONLY the art style: do NOT copy its characters, outfits, hats, eyepatches, poses or square-tile framing.

A joyful cover illustration for a children's game, 16:9 (1672 x 941), opaque, a sunny beach seen from a gentle high three-quarter view: light blue sky with soft clouds, a turquoise sea with a white foam line in the upper part, warm light sand below.
On the left, an orange-and-white wooden lifeguard tower; on its platform stands NINA, a young lifeguard woman with medium-brown skin, dark hair in a high bun, an orange lifeguard tank top with no text, white shorts and a silver whistle, cheering with both arms up and a dark grey walkie-talkie in one hand (no cap, no hat, no sunglasses).
In the center, a caramel-orange mutt puppy with a white chest patch runs happily across the sand, ears flying, toward a smiling boy on the right: 8 years old, light skin, short brown hair, orange swim trunks, a RED baseball cap, BLACK ROUND SUNGLASSES and a BLUE sand bucket in one hand, kneeling on a white-and-teal striped towel with his arms open. Small hearts float between them.
In the background, two or three small beach-goers on towels (one with a straw hat, one with a yellow swim ring), smaller and calmer, so the boy and the puppy are clearly the focus.
At the top center, a cute wooden beach sign with rope edges shows the title "Praia dos Dados" in big, bold, rounded, friendly letters, spelled exactly like that.

DO NOT INCLUDE: any other text besides the title, misspelled title, extra letters, subtitles, a red lifeguard uniform, a cap or sunglasses on Nina, text on clothes, a treasure chest, a metal detector, a kiosk, cards with words, numbers, dark or gloomy lighting, sunset colors, crowds, the characters from the reference image, Genshin Impact characters, a red hat with a feather, eyepatches, fantasy outfits, weapons, bikinis, suggestive poses, square icon tiles, frames around the picture, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 8. Quando a arte chegar

1. Medir cada folha com componentes conexos (alfa > 24) e anotar as caixas no
   `MANIFEST.md` desta pasta de assets.
2. **Conferir os traços dos 12 banhistas um a um** contra a tabela do §4. Se
   algum vier errado, ou o banhista é regerado, ou a tabela do
   `data/cast.ts` muda e a validação diz quais fases deixaram de funcionar.
3. Conferir que os pictogramas batem com os objetos dos banhistas.
4. Ajustar o `data/layout.ts` à torre medida (plataforma da Nina) e ao tamanho
   real dos banhistas.
