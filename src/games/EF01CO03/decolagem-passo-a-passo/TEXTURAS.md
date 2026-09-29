# Decolagem Passo a Passo — texturas

Destino: `src/assets/games/EF01CO03/decolagem-passo-a-passo/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 missões e mini-cenas, §12 textura × código).

## O estilo: VETOR DE CONTO

A referência de estilo é `references/28-vetor-de-conto-a.jpg`, anexada em
**todas** as gerações. Em `cartoes.png`, a referência de gesto
`references/mao-toque-angulo.png` também é anexada, apenas para o ângulo da mão.
O elenco das referências nunca entra na arte.

| | chibi de figurinha | desenho de criança | graphic novel | traço chapado | vetor geométrico | **vetor de conto deste jogo** |
|---|---|---|---|---|---|---|
| contorno | uniforme e escuro | trêmulo e irregular | variável, marrom escuro | preto grosso | nenhum | **médio, sempre mais escuro e saturado que a cor ao redor; nunca preto** |
| cor | chapada, 1 sombra | chapada, sem sombra | cel shading macio | chapada, sem degradê | chapada geométrica | **1 tom de cel shading + degradê macio nas formas grandes** |
| olho | enorme, brilho | ponto preto | grande, íris e brilho | ponto/oval simples | geométrico simples | **grande, íris colorida e um brilho** |
| silhueta | keyline branca | só o traço | sem keyline | só o traço | recorte sem traço | **sem keyline branca; o contorno colorido segura a forma** |
| proporção | chibi | ingênua infantil | criança natural | simplificada | modular | **roliça, amigável, sem cantos vivos** |

Paleta: verde-folha, azul-ardósia, areia, castanho, terracota e creme. A
referência tem dois elfos; por isso todos os negativos proíbem elfos, orelhas
pontudas, personagens de fantasia e os dois personagens da referência.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-base.png` | — | — | 1280 × 720 | opaco | céu e gramado com a plataforma no centro; nada de missão desenhado |
| `cena.png` | 4 × 4 | 320 × 320 | 1280 × 1280 | sim | as peças das 3 missões + fumaça, jato e poeira |
| `crianca.png` | 3 × 2 | 384 × 384 | 1152 × 768 | sim | a criança em 6 poses |
| `cartoes.png` | 4 × 4 | 256 × 256 | 1024 × 1024 | sim | 9 ícones de passo, corpo do cartão, vaga da régua, dedo |
| `faixa.png` | — | — | 1024 × 256 | sim | a faixa do letreiro, **vazia** (o texto é do jogo) |
| `cover-decolagem-passo-a-passo.png` | — | — | 1672 × 941 | opaco | capa **com o título** "Decolagem Passo a Passo" |

**A ordem das células é contrato com o código** (`data/files.ts`). Se trocar
uma célula, avise o Ferro e a Brasa.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula, **exceto o título da capa**.
- Objeto solto e centrado, com ~8% de margem, sem chão e sem sombra caída. Nada
  vaza para a célula vizinha.
- **Pares de estado com a mesma silhueta e a mesma base:** 0/1 (foguete), 2/3
  (bomba), 8/9 (balão), 12/13 (pipa). Trocar de estado não pode fazer o
  objeto pular.
- **Nenhum cartão marca o certo.** Os 9 ícones têm o mesmo peso visual e a
  mesma paleta, e nenhum parece "errado".
- Sem vermelho de alerta ou punição. O jato de combustível é azul ou roxo, nunca vermelho.
- O ícone precisa ser legível a ~96 px, que é o tamanho dele no cartão.

## 3. `bg-base.png` — 1280 × 720, opaco

| Região | O que tem |
|---|---|
| topo (y 0–82) | céu calmo, porque o HUD cobre a faixa |
| centro (x 380–940, y 150–700) | **vazio**, com o céu e uma plataforma/gramado no pé (base em y ≈ 660): é onde a cena monta a missão |
| esquerda (x 40–340) | calma, com pouco detalhe: ali ficam os cartões |
| direita (x 940–1240) | calma: ali fica a régua |
| geral | fim de tarde simpático de livro de histórias, poucas nuvens, sem personagem |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. NO white sticker keyline here — this is a full scene, not a sticker. Crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, elf ears, clothes, poses, scene or framing.

Wide 1280x720 opaque background illustration for a first-grade educational game. A calm friendly late-afternoon launch meadow under a warm storybook sky, with only a few soft rounded clouds. The top strip from y=0 to y=82 stays calm because the HUD covers it. The entire left zone x=40–340 and right zone x=940–1240 have very little low-contrast detail. Keep the central zone x=380–940, y=150–700 EMPTY except for sky and a simple broad grass launch platform at the bottom, its base around y=660. No mission object and no character anywhere. The scene must support overlaid rocket, balloon and kite sprites without visual clutter.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, people, children, rocket, balloon, kite, fuel pump, basket, stakes, cards, ruler, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, question mark button, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, busy scenery, buildings, vehicles, cropped edges, sad faces, crying, angry faces.
~~~

## 4. `cena.png` — grade 4 × 4, célula 320 × 320

Tudo na **mesma escala** de cenário. A base fica no pé da célula e o centro em x = 160.

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `rocket-open` | foguete de conto, de pé, com a **porta aberta** (vão escuro) |
| 1 | `rocket-closed` | o mesmo foguete com a **porta fechada** |
| 2 | `pump-empty` | bomba de combustível com a mangueira e o medidor **vazio** |
| 3 | `pump-full` | a mesma bomba com o medidor **cheio** |
| 4 | `flame` | chama do motor, em pé, só a chama |
| 5 | `smoke` | nuvem de fumaça fofa, cinza-clara |
| 6 | `splash` | jatinho/respingo de combustível (azul ou roxo) |
| 7 | `dust` | "puf" de poeira pequeno |
| 8 | `balloon-flat` | balão de ar quente **murcho**, o pano estendido no chão |
| 9 | `balloon-full` | o mesmo balão **cheio**, de pé, sem cesta, com as cordas penduradas |
| 10 | `basket` | cesta de vime vazia, vista de frente |
| 11 | `stakes` | duas estacas no chão com as cordas amarradas (seguram o balão) |
| 12 | `kite-ground` | pipa deitada no chão, com rabiola, **sem linha** |
| 13 | `kite-tied` | a mesma pipa com a **linha amarrada** e o carretel |
| 14 | `kite-fly` | a pipa no ar, inclinada, com a rabiola ao vento |
| 15 | `control-box` | caixinha de controle no chão com **um botão grande** (amarelo) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. Take ONLY the art style from the attached image: do NOT copy its characters, elf ears, clothes, poses, scene or framing.

Sprite sheet, EXACTLY 4 columns by 4 rows, 320x320 px per cell, total 1280x1280, genuinely transparent background, no grid lines drawn. Sixteen isolated scene pieces, one per cell, in this exact order left to right and top to bottom: 1 a friendly upright storybook rocket with its side door OPEN showing one dark doorway; 2 the EXACT same rocket at the same position and scale with its side door CLOSED; 3 a rounded fuel pump with hose and a clearly EMPTY analogue gauge; 4 the EXACT same pump with a clearly FULL gauge; 5 one upright rocket-engine flame by itself; 6 one fluffy light-grey smoke cloud; 7 one small blue-violet fuel jet and splash; 8 one small soft tan dust puff; 9 a deflated hot-air-balloon envelope laid flat, no basket; 10 the corresponding fully inflated upright balloon envelope, no basket, ropes hanging; 11 one empty wicker basket seen from the front; 12 two short ground stakes with balloon ropes tied to them; 13 one kite lying flat with tail, WITHOUT string; 14 the EXACT same kite at the same anchor and angle with a string tied on and a spool beside it; 15 the kite flying at an angle, tail blowing; 16 one small rounded ground control box with ONE large plain yellow button.

All pieces share the same scene scale, top-left light, outline weight and saturation. Each is centred at x=160 with its base near the bottom of its cell and about 8% clear margin on every side. Cells 1/2, 3/4, 9/10 and 13/14 are state pairs: preserve their common anchor, scale and shared silhouette so switching states never jumps. Every object stays completely inside its own cell. No ground, base plate or cast shadow. Fuel is blue or violet, never red.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, people, children, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, card frames, ruler, speech bubbles, arrows, stars, HUD, question mark, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, red warning colour, red fuel, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges, objects crossing cells, drop shadow, ground shadow, grass, dirt base, white backing, extra objects, sad faces, crying, angry faces.
~~~

## 5. `crianca.png` — grade 3 × 2, célula 384 × 384

É a mesma criança nas 6 poses, com a mesma escala e os pés na base (y ≈ 360).

| Célula | Nome no código | Pose |
|---|---|---|
| 0 | `kid-idle` | parada, sorrindo |
| 1 | `kid-cheer` | braços para cima, comemorando (também dentro da cesta) |
| 2 | `kid-run` | correndo de lado, com um braço para trás segurando algo |
| 3 | `kid-sooty` | rosto sujo de fuligem, tossindo, olhos em X fofos |
| 4 | `kid-oops` | surpresa, ombros encolhidos (jato, pipa caindo) |
| 5 | `kid-wave` | acenando para cima, com um pouco de pena (o balão foi embora) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside large shapes; rounded sturdy forms; big expressive eyes with a coloured iris and one white highlight; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. Take ONLY the art style from the attached image: do NOT copy its characters, elf ears, clothes, poses, scene or framing.

Sprite sheet, EXACTLY 3 columns by 2 rows, 384x384 px per cell, total 1152x768, genuinely transparent background, no grid lines drawn. The SAME Brazilian child, about seven years old, in all six cells: warm brown skin, short dark curly hair, slate-blue overalls over a cream T-shirt, terracotta sneakers, ordinary rounded human ears. Full body, same scale, same lighting, feet aligned near y=360, about 8% margin, nothing cropped. Six poses in this exact order left to right and top to bottom: 1 standing calmly and smiling; 2 cheering with both arms raised, compact pose that also fits inside a balloon basket; 3 running sideways, one arm trailing behind as if holding something; 4 face lightly smudged with soot, coughing, cute X-shaped closed eyes, comic rather than frightening; 5 surprised with shoulders tucked up, wide eyes, small round mouth; 6 looking and waving upward with gentle disappointed sympathy because a balloon flew away, not crying.

Emotion must read clearly from body pose, arms and mouth at small size. Keep the child's identity, clothes, proportions, anchor and colour palette identical in every cell. No object in the hands, no scenery, no ground and no cast shadow.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, pointed ears, medieval clothes, green tunic, weapons, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps, cropped body, inconsistent child, objects crossing cells, drop shadow, ground shadow, white backing, crying, fear, pain, anger, scolding, pointing at viewer.
~~~

## 6. `cartoes.png` — grade 4 × 4, célula 256 × 256

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `icon-fuel` | bico de combustível pingando uma gota |
| 1 | `icon-door` | porta de foguete fechando, com uma seta curva |
| 2 | `icon-button` | dedo apertando um botão grande |
| 3 | `icon-fill` | balão enchendo, com o foguinho embaixo |
| 4 | `icon-basket` | cesta subindo para prender no balão, com um gancho |
| 5 | `icon-ropes` | corda sendo solta de uma estaca (nó se desfazendo) |
| 6 | `icon-knot` | linha sendo amarrada na pipa (nó) |
| 7 | `icon-run` | pezinhos correndo com risquinhos de vento |
| 8 | `icon-release` | mão abrindo e a pipa subindo |
| 9 | `card` | corpo do cartão: retângulo arredondado de papel, paisagem, ~240 × 150, miolo liso e claro |
| 10 | `slot` | vaga da régua: a **mesma silhueta** do cartão, vazada ou em baixo-relevo |
| 11 | `guide-hand` | mãozinha com o **indicador para cima**; a ponta do dedo em (128, 20) |
| 12–15 | — | vazias (transparentes) |

### Prompt copiável

~~~text
STYLE — USE IMAGE 1 AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. Take ONLY the art style from Image 1: do NOT copy its characters, elf ears, clothes, poses, scene or framing. Use Image 2 ONLY as the exact gesture-and-angle reference for cell 12's guide hand.

Sprite sheet, EXACTLY 4 columns by 4 rows, 256x256 px per cell, total 1024x1024, genuinely transparent background, no grid lines drawn. One item per cell in this exact order left to right and top to bottom. Cells 1–9 are simple wordless step pictograms for first-grade children, bold silhouettes, minimal details and equal visual weight: 1 a fuel nozzle tilted down with one large drop; 2 a small rocket door visibly swinging closed with one broad curved motion arrow; 3 a fingertip pressing one large round yellow button; 4 a hot-air balloon changing from soft/low to full/upright with one small burner flame below; 5 a wicker basket rising toward two hanging balloon ropes, one large fastening hook; 6 a rope loosening from a short stake, the knot visibly opening; 7 a kite string being tied to the kite, one large simple knot; 8 a pair of running feet with two short wind marks; 9 an open hand releasing a kite that rises above it. Cell 10: the empty card body only, a rounded horizontal paper rectangle about 240x150, smooth light-cream centre, no icon and no writing. Cell 11: a ruler slot with EXACTLY the same outer silhouette and dimensions as the card body, recessed/vacant appearance, transparent or low-relief centre, no icon. Cell 12: one friendly guide hand, following Image 2's angle exactly — index finger points UP AND LEFT, the other fingers curl to the RIGHT, wrist extends DOWN AND RIGHT; fingertip must be at coordinate (128,20) in this 256x256 cell; no click rays or click lines. Cells 13, 14, 15 and 16 are COMPLETELY EMPTY transparent pixels.

Each pictogram must be recognisable at 96 px without any word. Use the same palette, outline weight, scale and visual density for all nine step icons; none may look correct, incorrect, selected or disabled. Every occupied item stays inside its cell with about 8% margin. No cast shadow, ground or white backing.

DO NOT INCLUDE: click rays, click lines, radiating marks around the guide finger, elves, pointed elf ears, fantasy characters, the two characters from Image 1, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, written instructions, user interface beyond the requested blank card and slot bodies, extra buttons, panels, frames, speech bubbles, stars, HUD, question mark, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, red alert colour, green check mark, red X, right/wrong symbols, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps between cells, cropped edges, objects crossing cells, drop shadow, ground shadow, white backing, anything in cells 13–16.
~~~

## 7. `faixa.png` — 1024 × 256

Fita/letreiro de festa, larga, com as pontas dobradas e o **miolo liso** para o
texto SEU ALGORITMO! Não leva nenhuma letra.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. Take ONLY the art style from the attached image: do NOT copy its characters, elf ears, clothes, poses, scene or framing.

One wide 1024x256 festive storybook ribbon banner on a genuinely transparent background. Long horizontal warm-cream centre with terracotta and slate-blue edging, rounded folded ribbon tails at both ends, gentle symmetrical volume, completely smooth and EMPTY middle reserved for game-rendered text. The whole ribbon fits inside the canvas with at least 8% margin. Front view, clean silhouette, no ground and no cast shadow.

DO NOT INCLUDE: elves, pointed elf ears, fantasy characters, the two characters from the reference image, people, faces, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, symbols, user interface, buttons, panels, extra frames, speech bubbles, arrows, icons, stars, HUD, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealistic, blur, lens flare, heavy noise, cropped ribbon tails, drop shadow, ground shadow, white backing.
~~~

## 8. `cover-decolagem-passo-a-passo.png` — 1672 × 941, opaco

A capa do catálogo: o foguete decolando da base, a criança comemorando e 3
cartões-passo flutuando. No alto, o **letreiro "Decolagem Passo a Passo"**, com
letras gordinhas, contorno escuro e leve volume. Confira a grafia letra a letra.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside large shapes; rounded sturdy forms with no sharp corners; big expressive eyes with a coloured iris and one white highlight; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. NO white sticker keyline here — this is a full scene, not a sticker. Crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, elf ears, clothes, poses, scene or framing.

Opaque 1672x941 landscape cover illustration for a children's educational game; the main action and title must read at thumbnail size. A friendly rounded rocket launches upward from a grassy storybook platform at warm late afternoon, with one clean flame and soft light-grey smoke. In the lower foreground, the same Brazilian child with warm brown skin, short dark curly hair, slate-blue overalls, cream T-shirt and terracotta sneakers celebrates with both arms raised. Three equal blank rounded step cards float in a clear sequence near the action, each with one large wordless pictogram: fuel nozzle, closing rocket door, finger pressing a yellow button. Leave a clean high-contrast title zone across the upper centre.

TEXT, VERBATIM: "Decolagem Passo a Passo". Render exactly these four words, letter for letter: D-e-c-o-l-a-g-e-m / P-a-s-s-o / a / P-a-s-s-o. Place the title at the TOP, centred, very large rounded chunky colourful letters, thick dark coloured outline, slight dimensional volume, highly legible at thumbnail size. No other text anywhere.

DO NOT INCLUDE: misspelled title, missing word, duplicated word, extra text, subtitle, letters on cards, digits, numbers, captions, watermark, logo, elves, pointed elf ears, fantasy characters, the two characters from the reference image, medieval clothes, multiple children, extra rockets, balloon, kite, user interface, buttons, panels, frames, speech bubbles, arrows, stars, HUD, question mark, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, red alert colour, 3D render, photorealistic, blur, lens flare, heavy noise, sad faces, crying, angry faces, frightening explosion, fire covering the child.
~~~

## 9. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades exatas: 1280 × 1280, 1152 × 768 e 1024 × 1024;
- o corte medido por colunas na folha inteira;
- os pares 0/1, 2/3, 8/9 e 12/13 casando no pivô;
- nenhum texto fora da capa, e o título da capa sem erro;
- a ponta do dedo em (128, 20) e as caixas 9/10 iguais;
- o `MANIFEST.md` publicado com o pivô de cada célula.

---

## 10. N2 e N3 — folhas novas (esqueleto, sem prompts)

As grades que já existem **não mudam**. A arte nova do N2/N3 vai em 2 folhas
novas, na mesma linha **vetor de conto**, na mesma escala e na mesma paleta das
folhas do N1. Planejamento: PLANEJAMENTO.md §6.

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `cartoes-2.png` | 4 × 2 | 256 × 256 | 1024 × 512 | sim | ícones dos 4 passos novos e dos 3 intrusos |
| `cena-2.png` | 3 × 2 | 320 × 320 | 960 × 640 | sim | objetos de mão dos intrusos, o capacete e a pipa sem rabiola |

Regras que valem nas duas:
- nenhum texto, número ou letra (a "contagem" é uma mão com dedos, não número);
- **os intrusos não podem parecer errados**: mesmo peso visual, mesma paleta e
  mesmo acabamento dos ícones de passo, sem cinza nem "apagado";
- os ícones são legíveis a ~80 px, o tamanho no cartão de 4;
- os objetos da `cena-2` ficam na escala da `cena.png` (a criança tem ~224 px),
  com a base no pé da célula e o centro em x = 160.

### 10.1 `cartoes-2.png` — grade 4 × 2, célula 256 × 256

| Célula | Nome no código | O quê | Usado em |
|---|---|---|---|
| 0 | `icon-count` | mão com **3 dedos levantados**, contando | N2·1 contagem 3-2-1 |
| 1 | `icon-umbrella` | guarda-chuva abrindo | N2·1 **intruso** |
| 2 | `icon-toothbrush` | escova de dentes com pasta | N2·2 **intruso** |
| 3 | `icon-icecream` | casquinha de sorvete | N2·3 **intruso** |
| 4 | `icon-helmet` | capacete de astronauta | N3·1 pôr o capacete |
| 5 | `icon-climb` | pezinho subindo na borda de uma cesta de vime | sem uso desde o ajuste do N3·2 (29/09) |
| 6 | `icon-tail` | rabiola sendo amarrada na ponta da pipa | N3·3 pôr a rabiola |
| 7 | — | vazia (transparente) | — |

### Prompt copiável

~~~text
STYLE — USE IMAGE 1 AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. Take ONLY the art style from Image 1: do NOT copy its characters, elf ears, clothes, poses, scene or framing. Use Images 2 and 3 as the exact references for the existing game's rendering, palette, outline weight, visual density, scale and polish.

Sprite sheet, EXACTLY 4 columns by 2 rows, 256x256 px per cell, total 1024x512, genuinely transparent background, no grid lines drawn. Seven isolated wordless pictograms, one per cell, in this exact order left to right and top to bottom: 1 one friendly hand showing EXACTLY THREE raised fingers for counting, with no numeral; 2 one umbrella opening, shown as a clear useful action rather than a mistake; 3 one toothbrush with a small neat stripe of toothpaste; 4 one ice-cream cone with one rounded scoop; 5 one astronaut helmet, front view; 6 one small foot stepping upward over the rim of a wicker balloon basket; 7 one colourful ribbon tail being tied to the bottom tip of a kite, with one large readable knot; 8 COMPLETELY EMPTY transparent pixels.

Cells 1–7 are equally valid-looking step icons for first-grade children: bold silhouettes, minimal details, equal visual weight, same saturation, same finish and readable at about 80 px. The umbrella, toothbrush and ice cream are distractors but must look just as polished, colourful and correct as the real steps — never greyed out, damaged, crossed out or visually marked as wrong. Each occupied item is centred in its cell and stays completely inside it with about 8% clear margin. No cast shadow, ground, card frame or white backing.

DO NOT INCLUDE: numeral 3, written counting, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, wrong-answer marks, red X, green check mark, warning symbols, disabled or greyed-out treatment, sad or damaged objects, elves, pointed elf ears, fantasy characters, the two characters from Image 1, people, children, extra hands, extra fingers, fewer or more than three raised fingers in cell 1, extra objects, user interface, cards, buttons, panels, frames, speech bubbles, arrows, stars, HUD, question mark, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, red alert colour, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps between cells, cropped edges, objects crossing cells, drop shadow, ground shadow, white backing, anything in cell 8.
~~~

### 10.2 `cena-2.png` — grade 3 × 2, célula 320 × 320

| Célula | Nome no código | O quê | Usado em |
|---|---|---|---|
| 0 | `umbrella` | guarda-chuva **aberto**, com o cabo embaixo, para a mão da criança | mini-cena `umbrella` |
| 1 | `toothbrush` | escova de dentes com espuma, para a mão da criança | mini-cena `toothbrush` |
| 2 | `icecream` | casquinha de sorvete com uma gota escorrendo, para a mão | mini-cena `icecream` |
| 3 | `helmet` | capacete de astronauta sozinho, visto de frente, para encaixar na cabeça da criança | N3·1 pôr o capacete, `bonk` |
| 4 | `kite-bare` | a pipa da `cena.png` **sem rabiola**, deitada, sem linha; mesma silhueta e base da `kite-ground` | N3·3 antes da rabiola |
| 5 | `kite-bare-tied` | a mesma pipa sem rabiola, **com linha e carretel**; mesma silhueta da `kite-tied` | N3·3 linha antes da rabiola, `kite-spin` |

### Prompt copiável

~~~text
STYLE — USE IMAGE 1 AS THE ART STYLE REFERENCE, and match its rendering exactly: friendly storybook vector cartoon; clean line art of even medium weight, and every outline is a DARKER, slightly more saturated tone of the colour it surrounds — never black; simple cel shading with ONE soft shadow tone plus a gentle soft gradient inside large shapes; rounded sturdy forms with no sharp corners; a warm earthy palette — leaf green, slate blue, tan, chestnut brown, terracotta, cream. Take ONLY the art style from Image 1: do NOT copy its characters, elf ears, clothes, poses, scene or framing. Use Images 2 and 3 as the exact references for the existing game's rendering, palette, outline weight, visual density, scale and polish. For cells 5 and 6, copy the kite body silhouette, size, angle, anchor and spool treatment from cells 13 and 14 of Image 3, removing only the ribbon tail.

Sprite sheet, EXACTLY 3 columns by 2 rows, 320x320 px per cell, total 960x640, genuinely transparent background, no grid lines drawn. Six isolated scene objects, one per cell, in this exact order left to right and top to bottom: 1 an OPEN umbrella with its curved handle below, sized to be held by the child; 2 one toothbrush with a small mound of white foam around the bristles, sized for the child's hand; 3 one ice-cream cone with a rounded scoop and one visible drip running down, sized for the child's hand; 4 one astronaut helmet alone, perfectly front-facing, with a clear open visor area, sized to fit over the child's head; 5 the exact same diamond kite body as the grounded kite in Image 3, lying flat at the same angle and anchor, but WITHOUT ribbon tail and WITHOUT string; 6 the exact same tailless diamond kite at the same angle and anchor, WITH a tied string leading to the same wooden spool treatment as Image 3, but still WITHOUT ribbon tail.

All six objects use the exact scene scale of Image 3: the child is about 224 px tall in game, so the first three are believable hand-held props and the helmet fits the child's head. Centre every object at x=160 with its base near the bottom of its cell, while keeping about 8% clear margin and nothing cropped. Cells 5 and 6 are a state pair and must preserve the same kite silhouette, dimensions, rotation and pivot as cells 13 and 14 of Image 3 so swapping states never makes the kite jump. The umbrella, toothbrush and ice cream are distractors but must look just as polished, colourful and correct as every other scene object — never greyed out, damaged or marked as wrong. No ground, base plate, cast shadow or white backing.

DO NOT INCLUDE: kite ribbon tail, kite bows, streamers or tassels in cells 5 and 6, string or spool in cell 5, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, wrong-answer marks, red X, green check mark, warning symbols, disabled or greyed-out treatment, sad or damaged objects, elves, pointed elf ears, fantasy characters, the two characters from Image 1, people, children, hands holding the objects, extra objects, user interface, cards, buttons, panels, frames, speech bubbles, arrows, stars, HUD, question mark, black outlines, uniform black ink lines, white sticker keyline, painterly lineless illustration, heavy airbrushed rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, red alert colour, 3D render, photorealistic, blur, lens flare, heavy noise, grid lines, visible sprite-sheet borders, cell borders, gaps between cells, cropped edges, objects crossing cells, drop shadow, ground shadow, grass, dirt base, white backing.
~~~

As células 4 e 5 casam no pivô com as células 12 e 13 da `cena.png`: a rabiola
"aparece" trocando a célula, sem a pipa pular.

### 10.3 O que conferir quando a arte chegar

- as grades exatas: 1024 × 512 e 960 × 640;
- nenhum número (a célula 0 é mão, não "3");
- os 3 intrusos com o mesmo acabamento dos ícones de passo;
- as pipas sem rabiola casando no pivô com as da `cena.png`;
- o `MANIFEST.md` atualizado com as 2 folhas novas.
