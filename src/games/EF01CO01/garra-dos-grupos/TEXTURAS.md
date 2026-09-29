# Garra dos Grupos — texturas

Destino: `src/assets/games/EF01CO01/garra-dos-grupos/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 itens, §12 textura × código).

**Este arquivo é o esqueleto.** Os prompts ficam com a Aquarela, que escreve um
bloco completo por arquivo (estilo + corpo + negativo). A linha de arte é
**chibi de figurinha**, com a referência em `references/19-chibi-figurinhas.jpg`.

### Tabela de estilo — linha chibi de figurinha

| Critério | Contrato desta linha |
|---|---|
| Referência | `references/19-chibi-figurinhas.jpg`, usada somente pelo estilo; o elenco da referência nunca entra no jogo |
| Traço | limpo, nítido, uniforme, em azul-marinho dessaturado; nunca preto puro |
| Cor | paleta curta; cor chapada com exatamente um tom de sombra; nenhum degradê |
| Olho / expressão | olhos grandes e brilhantes nos personagens; emoção legível com poucos sinais gráficos |
| Silhueta | formas simples e arredondadas; peça com alfa recebe keyline branca fina; cena inteira não recebe keyline |
| Proporção | chibi: cabeça grande, corpo pequeno; objetos simplificados e legíveis no tamanho real do jogo |

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-fliperama.png` | — | — | 1280 × 720 | opaco | gabinete da máquina, vitrine vazia, trilho, moldura do visor vazia |
| `bandeja.png` | — | — | 768 × 768 | sim | disco da bandeja visto **de cima**; gira dentro de um container achatado |
| `maquina.png` | 4 × 2 | 320 × 320 | 1280 × 640 | sim | garra (3 estados), cadeado, caixinha (fundo e frente), laço, gota de cor |
| `itens.png` | 4 × 4 | 256 × 256 | 1024 × 1024 | sim | 9 frutas, 3 formas neutras, cabo, dedo do guia |
| `cover-garra-dos-grupos.png` | — | — | 1672 × 941 | opaco | capa do catálogo (fora da cena) |

**A ordem das células é contrato com o código** (`data/files.ts` e
`data/items.ts`). Se trocar uma célula, avise o Ferro e a Brasa.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. O visor e o painel são texto do jogo.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha.
- **A cor do item é a resposta.** Cada fruta tem **uma** cor, chapada e
  inconfundível: vermelho, amarelo ou verde, sem degradê para outra cor e sem
  folha grande de outra cor. As três maçãs e as duas peras têm a **mesma
  silhueta**, e só a cor muda.
- As formas (8–10) são **brancas/cinza-claras com contorno escuro**, porque o
  código as pinta com `tint`. Não pode haver cor nelas.
- A caixinha e a bandeja são **neutras**: nenhuma das cores dos itens.
- Sem vermelho de alerta: o cadeado é amarelo/dourado.
- Legível a ~120 px, que é o tamanho do item no arco da frente.

## 3. `bg-fliperama.png` — 1280 × 720, opaco

| Região | O que tem |
|---|---|
| topo (y 0–82) | calmo, porque o HUD cobre essa faixa |
| visor (300, 92, 340 × 92) | **moldura vazia** de letreiro de fliperama; o miolo é liso e escuro para o texto do jogo |
| trilho (y ≈ 214, x 120–820) | barra metálica horizontal onde corre o carrinho da garra |
| vitrine (40–900 × 200–700) | vidro com reflexo leve nas bordas; o **centro é vazio** (a bandeja e os itens entram por código) |
| direita (920–1260) | lateral do gabinete com uma **prateleira/nicho vazio** onde a caixinha pousa (base em y ≈ 630) |
| moldura geral | gabinete colorido e fofo (luzinhas, cantos arredondados), sem personagem e sem item |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big friendly visual language; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: full-screen background for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create one opaque 1280 × 720 px illustration of the inside/front of a cute claw-machine arcade cabinet. The cabinet fills the canvas and is viewed straight on. Preserve these exact functional regions: y 0–82 is calm and low-detail for the HUD; at x 300–640 and y 92–184 place an EMPTY rounded arcade sign frame with a smooth dark blank centre for code-rendered content; at y about 214 from x 120–820 place a horizontal metal rail for the claw carriage; the glass display occupies x 40–900 and y 200–700, with only very subtle edge reflections and a completely EMPTY unobstructed centre; on the right, x 920–1260, place the cabinet side and an EMPTY shelf/niche where a box will sit, with its base around y 630. The cabinet frame is cute, colourful and rounded, using turquoise, lilac, warm cream and small amber accents. Add only a few soft decorative arcade lights around the outer frame. The empty glass area must remain visually quiet so moving sprites stay readable.

Composition and technical constraints: exact 16:9 canvas; straight-on orthographic-like view; all listed coordinates respected; no claw, no cable, no tray, no box, no fruit, no geometric shape, no character and no object inside the vitrine; opaque background; no white sticker keyline; no important detail under the HUD band; no embedded user interface.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, claw, cable, chain, rotating tray, box, ribbon, lock, fruit, food, geometric pieces, toys, prizes, people, animals, central reflections that obstruct sprites, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped cabinet edges.
~~~

## 4. `bandeja.png` — 768 × 768

Disco giratório visto **de cima**: prato raso com borda grossa e raios ou
gomos suaves para o giro aparecer. Tem cor neutra (lilás-claro ou creme) e não
tem nenhum item. O código achata o disco para ≈ 720 × 220.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; a thin white sticker keyline around the complete outer silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: isolated rotating tray sprite for a Phaser 3 educational game.
Primary request: create one perfectly centred circular shallow rotating display tray seen from directly above. It is a broad low plate with a thick rounded rim and eight subtle radial wedges/ribs so its rotation remains visible after the game squashes it into an ellipse. Use only neutral pale lilac, warm cream, very light grey and a dark desaturated navy outline. It must not use any answer colours: no red, bright yellow, green, blue or pink. Keep the centre clean and empty so item sprites can sit over it.

Composition and technical constraints: one isolated complete object on a genuinely transparent 768 × 768 px square canvas; exact top-down view, not tilted and not perspective; circular silhouette; centred with at least 8% transparent margin on every side including the white keyline; no ground, no floor, no cast shadow, no item, no scenery; thin white sticker keyline around only the outer silhouette.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, fruit, food, geometric pieces, toys, prizes, claw, cable, chain, box, ribbon, lock, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, question mark, red, saturated yellow, green, blue, pink, perspective view, side view, oval source art, ground, floor, drop shadow, white backing, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped edges.
~~~

## 5. `maquina.png` — grade 4 × 2, célula 320 × 320

| Célula | Nome no código | O quê | Pivô |
|---|---|---|---|
| 0 | `claw-open` | garra de fliperama chibi, **três dedos abertos**, com carrinho em cima | engate do cabo em (160, 24) |
| 1 | `claw-closed` | a mesma garra, **dedos fechados**, com o vão para segurar um item | engate (160, 24); centro do item preso em (160, 250) |
| 2 | `claw-stuck` | a mesma garra fechada, com **cara de tensa** (gotinha, tremidinha), sem cadeado | igual à 1 |
| 3 | `lock` | cadeado fechado, gordinho, dourado, com brilho, ~60% da célula | centro |
| 4 | `box-back` | caixinha transparente de acrílico, **parte de trás e fundo** (os itens caem na frente dela) | base em (160, 300) |
| 5 | `box-front` | a mesma caixinha, **só a frente** de vidro com reflexo, que casa pixel a pixel com a 4 | base em (160, 300) |
| 6 | `ribbon` | laço de fita para fechar a caixinha, visto de frente | centro |
| 7 | `color-drop` | gota/mancha de tinta **branca com contorno**, para o `tint` do visor e do balão | centro |

Células 0–2: a mesma garra, na mesma escala e com o mesmo engate.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; tiny readable emotion marks; short cohesive palette; a thin white sticker keyline around the complete silhouette of each isolated piece. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact machine-parts sprite sheet for a Phaser 3 educational game.
Primary request: create ONE exact 4 columns × 2 rows sprite sheet on a transparent 1280 × 640 px canvas. Every cell is exactly 320 × 320 px. Every piece must be complete, isolated, centred in its own cell and contained with at least 8% transparent margin, including keyline and emotion marks. Nothing may cross a cell boundary. No drawn grid, border or divider. Use neutral polished metal, pale lilac, warm cream, transparent-glass cues and dark desaturated navy outlines. Do not use the answer colours red, bright yellow, green, blue or pink except that the lock in cell 3 is explicitly golden yellow.

Exact cells, left to right and then top to bottom:
0. claw-open — cute arcade claw with the top carriage included and exactly three rounded metal fingers OPEN. Cable attachment point centred at local coordinate (160, 24).
1. claw-closed — the SAME claw, same scale, silhouette, carriage and attachment point, with three fingers CLOSED but leaving a clear central space for an item whose centre will be at local coordinate (160, 250).
2. claw-stuck — the SAME closed claw as cell 1, same position and scale, looking tense through one small sweat drop and two tiny trembling motion ticks; NO lock attached.
3. lock — one plump CLOSED golden padlock, front view, with one small highlight, occupying about 60% of the cell.
4. box-back — transparent neutral acrylic collection box, showing ONLY its back wall, side walls and bottom; open front layering area; straight-on view; base aligned at local y = 300.
5. box-front — ONLY the front glass wall and front rim of the exact same box, matching cell 4 pixel-for-pixel in outer width, height, perspective and base at local y = 300; transparent centre so sprites can appear behind it.
6. ribbon — one neat cute neutral cream-and-lilac gift bow/ribbon viewed straight from the front, isolated.
7. color-drop — one solid WHITE paint droplet/blob with dark outline and white keyline, no coloured shading, prepared to receive Phaser tint.

Consistency constraints: cells 0, 1 and 2 are the identical machine with only finger state and tiny expression marks changed; same lighting and exact attachment anchor. Cells 4 and 5 are two compositing layers of one identical box and must register exactly. All glass is neutral and nearly colourless. All pieces use the same line weight and lighting.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, extra claws, a fourth claw finger, items held by the claw, attached cable or chain, lock in cell 2, coloured paint in cell 7, coloured box, coloured glass, fruit, food, geometric pieces, toys, prizes, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, question mark, red alert colour, green, blue, pink, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 6. `itens.png` — grade 4 × 4, célula 256 × 256

| Célula | Nome no código | Tipo | Cor |
|---|---|---|---|
| 0 | `apple-red` | maçã | vermelho |
| 1 | `apple-yellow` | maçã | amarelo |
| 2 | `apple-green` | maçã | verde |
| 3 | `strawberry` | morango | vermelho |
| 4 | `cherry` | cereja (par) | vermelho |
| 5 | `banana` | banana | amarelo |
| 6 | `pear-yellow` | pera | amarelo |
| 7 | `pear-green` | pera | verde |
| 8 | `shape-circle` | círculo | neutro (`tint`) |
| 9 | `shape-square` | quadrado | neutro (`tint`) |
| 10 | `shape-triangle` | triângulo | neutro (`tint`) |
| 11 | `grape-green` | cacho de uva | verde |
| 12 | `cable` | trecho de cabo/corrente **vertical que emenda** em cima e embaixo (vai num `tileSprite`) | cinza metálico |
| 13 | `guide-hand` | mãozinha chibi no ângulo de `references/mao-toque-angulo.png`: indicador para cima e ~20–25° à esquerda, dedos dobrados em degraus à direita, polegar para dentro e pulso descendo à direita; `tipX`/`tipY` medidos após a troca | pele clara, contorno |
| 14 | — | vazia (transparente), reservada para o N2/N3 | — |
| 15 | — | vazia (transparente), reservada para o N2/N3 | — |

Os itens podem ter carinha fofa (olhos e bochecha), e a carinha é igual em
todos, para não virar pista. As formas 8–10 têm a mesma carinha.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi sticker art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with very few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; tiny identical cute faces with glossy navy eyes and one white highlight; short cohesive palette; a thin white sticker keyline around the complete silhouette of each isolated piece. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact item sprite sheet for a Phaser 3 educational game about grouping by colour.
Primary request: create ONE exact 4 columns × 4 rows sprite sheet on a transparent 1024 × 1024 px canvas. Every cell is exactly 256 × 256 px. Every object must be complete, isolated, upright, centred and contained inside its own cell with at least 8% transparent margin on all sides including the white keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. Keep all objects at a consistent readable scale. The colour is the educational answer and MUST be unmistakable.

Locked answer-colour palette: RED = #E8423C; YELLOW = #FFD23F (clear lemon/golden yellow, never orange); GREEN = #57C14F (clear leaf green, never yellow-green or teal); BLUE = #3D8EF0; PINK = #FF86C4. Use exactly these hues for the main body of the corresponding item, with only one slightly darker same-hue flat shadow. Never blend one answer colour into another. Stems and tiny leaf/calyx details are dark neutral brown or dark desaturated navy, never green on red/yellow fruit. Give cells 0–11 the same tiny neutral navy face in the same visual weight so expression never becomes a clue; no coloured blush.

Exact cells, left to right and then top to bottom:
0. apple-red — one round apple, main body exact RED #E8423C.
1. apple-yellow — the EXACT SAME apple silhouette as cell 0, main body exact YELLOW #FFD23F, unmistakably yellow and not orange.
2. apple-green — the EXACT SAME apple silhouette as cells 0–1, main body exact GREEN #57C14F, unmistakably green and not yellow.
3. strawberry — one strawberry, main body exact RED #E8423C; seeds are tiny warm cream; calyx is tiny dark neutral, not green.
4. cherry — one pair of cherries, both exact RED #E8423C; stems are dark neutral.
5. banana — one simple curved banana, main body exact YELLOW #FFD23F, not orange and no green tips.
6. pear-yellow — one pear, main body exact YELLOW #FFD23F; neutral dark stem.
7. pear-green — the EXACT SAME pear silhouette as cell 6, main body exact GREEN #57C14F; neutral dark stem.
8. shape-circle — one thick simple circle token in neutral near-white #F4F1EA with only a light neutral-grey #D6DAE2 shadow and dark outline; absolutely no chromatic colour because code will tint it.
9. shape-square — one thick simple rounded square token with the exact same neutral near-white and grey treatment as cell 8; absolutely no chromatic colour.
10. shape-triangle — one thick simple rounded triangle token with the exact same neutral near-white and grey treatment as cells 8–9; absolutely no chromatic colour.
11. grape-green — one compact grape cluster; every grape exact GREEN #57C14F; stem and tiny leaf are dark neutral, not another green.
12. cable — one straight vertical repeating cable/chain segment in neutral metallic grey, exactly centred, touching the TOP and BOTTOM cell edges seamlessly so it can repeat in a vertical tileSprite; no white keyline at the top/bottom seam.
13. guide-hand — use `references/mao-toque-angulo.png` ONLY as the angle and silhouette reference. Create one cute light-brown childlike chibi hand matching the exact skin tone, dark uniform outline, one-tone flat cel shading and white sticker keyline of the other cells in this sheet. The index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT from vertical; its tip is crisp and clearly defined as the touch point. The other THREE fingers are folded into distinct descending stair steps on the RIGHT side; the THUMB folds inward at the base across the palm; the rounded palm and short bare wrist descend diagonally toward the LOWER RIGHT. Exactly five digits total. Keep the complete hand and keyline inside the cell with at least 8% transparent margin. Do not copy the reference's click/radiating lines. No face and no sleeve. After replacing the cell, measure and record the real fingertip coordinates as `tipX` and `tipY` in `MANIFEST.md`.
14. completely EMPTY and genuinely transparent reserved cell.
15. completely EMPTY and genuinely transparent reserved cell.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, mixed-colour fruit, ambiguous colour, orange apple, orange banana, yellow-green apple, teal-green fruit, purple grapes, green calyx on the strawberry, green leaf on red or yellow fruit, coloured cheeks, chromatic colour in cells 8–10, hue shifts, gradients between hues, extra fruit, extra shapes, extra hands, extra fingers, missing fingers, click lines, radiating lines, motion marks, face or sleeve on the guide hand, object in cells 14 or 15, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, stars, HUD, question mark, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, crying, angry faces, pointing at the viewer.
~~~

## 7. `cover-garra-dos-grupos.png` — 1672 × 941, opaco

A capa do catálogo: a máquina de garra chibi segurando uma maçã vermelha sobre
uma caixinha cheia de coisas vermelhas, com frutas e formas coloridas na
bandeja. Com o título `Garra dos Grupos` no alto.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes only on the tiny item faces; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover scene, not a sticker.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Garra dos Grupos”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Garra dos Grupos” in large chunky rounded playful multicolour letters with a thick dark navy outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly three words, letter for letter and with capitalization exactly: G-a-r-r-a [space] d-o-s [space] G-r-u-p-o-s. No accent marks, extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Show a cute colourful arcade claw machine in a dynamic straight-on three-quarter composition. The claw is the clear focal point, happily holding one unmistakably RED #E8423C apple above a transparent neutral collection box. Inside the box, visibly group five different red things, including red fruit and one simple red geometric token, communicating “same colour, different kinds”. On the rotating tray below, show a small readable assortment of yellow #FFD23F, green #57C14F, blue #3D8EF0 and pink #FF86C4 fruit/geometric pieces as contrasting distractors. Make the grouping action immediately readable at thumbnail size. Use a playful arcade palette around the machine, with turquoise, lilac, cream and amber frame accents. Keep a clear visual separation between the red group in the box and the multicolour items remaining on the tray.

Composition and technical constraints: exact 1672 × 941 landscape cover; reserve a clean upper band for the complete title; title centred and fully inside the canvas; main action large beneath it; lower the claw slightly if needed; complete claw, red apple, box and tray visible; no cropped focal objects; opaque full scene; no white sticker keyline; no character; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, mascot, astronaut, extra words, misspelled title, subtitle, punctuation, labels, digits, numbers, captions, watermark, logo, score, counter, HUD, buttons, question mark, speech bubbles, arrows, instructional icons, wrong-colour item inside the red group box, ambiguous orange-red apple, coloured box glass, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped claw, cropped apple, cropped box.
~~~

## 8. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades exatas: 1280 × 640 e 1024 × 1024; `bandeja` 768 × 768;
- o corte medido por colunas na folha inteira, sem objeto cruzando célula;
- 0/1/2 e 4/5 da `maquina.png` casando no pivô;
- a **cor de cada fruta** conferida contra a tabela do §6: se uma maçã "amarela"
  sair laranja, ela volta;
- as formas e a gota sem cor nenhuma (o `tint` precisa de base clara);
- o `cable` emendando sem costura e a ponta do dedo em (128, 20);
- o `MANIFEST.md` publicado com o pivô medido de cada célula.
