# Labirinto do Cofrinho — texturas

Destino: `src/assets/games/EF01CO07/labirinto-do-cofrinho/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 labirinto e
pessoas, §13 textura × código).

A linha de arte é a **chibi de figurinha**, como no Balão e na Pescaria, com a
referência `references/19-chibi-figurinhas.jpg` **anexada em toda geração**. Se
vier uma imagem de estilo própria, troque o bloco `STYLE` e a
tabela (decisão 4 do plano: fica a `19`). As grades e as células não mudam. Cada prompt vem inteiro (estilo +
corpo + negativo), pronto para copiar.

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

**O ângulo do jogo:** tudo é visto **de cima em ¾**, como num RPG fofo: o chão
aparece de cima, e as pessoas e os objetos aparecem um pouco de frente, com a
cabeça para o alto da tela. Os arbustos são **blocos vistos de cima**, que se
encaixam lado a lado.

**A regra das pessoas (pista que entrega):** a mãe, o pai, o vizinho e a
mascote têm **o mesmo tamanho, o mesmo sorriso e a mesma pose de espera**.
Ninguém tem crachá, distintivo, uniforme, cor de destaque, brilho ou aura. O
desconhecido é **simpático**, nunca vilão: sem óculos escuros, sem capuz, sem
sorriso malicioso.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-jardim.png` | — | — | 1280 × 720 | opaco | gramado de cima, a moldura de flores e a clareira de pedrinhas |
| `sebes.png` | 4 × 2 | 128 × 128 | 512 × 256 | sim | 4 blocos de arbusto, o nicho do ímã, 3 enfeites |
| `bia.png` | 4 × 3 | 256 × 256 | 1024 × 768 | sim | a Bia: andar (3 direções × 2), parada, feliz, "ih!", mostrando, 2 livres |
| `pessoas.png` | 4 × 2 | 320 × 320 | 1280 × 640 | sim | mãe, pai, vizinho, mascote: esperando e reagindo |
| `pecas.png` | 4 × 3 | 256 × 256 | 1024 × 768 | sim | ímã ×3, cartão, foto, casinha, escola, figurinha, cofre ×2, 1 livre, dedo |
| `cover-labirinto-do-cofrinho.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`,
`data/people.ts`). Se trocar uma célula, avise o Ferro e a Brasa.

**O insubstituível:** os **blocos de arbusto** (sem eles não há labirinto), o
**ímã** e o **cartão com foto, casinha e escola**. O cartão e os dados são
a habilidade.

**Opcional para o N1:** `pecas` 7 (figurinha, N3). Está na folha porque
célula a mais não custa outra geração.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. O nome **BIA** no cartão, os
  balões e o letreiro são do jogo.
- Objeto solto e centrado na célula, com ~8% de margem, sem sombra caída na
  célula. Nada vaza para a célula vizinha. **A exceção são os blocos de
  arbusto**, que vão até a borda da célula (§4).
- Sem vermelho de alerta e sem nada assustador: o ímã é **bobo**, o
  desconhecido é **simpático**.
- A Bia e as pessoas **cabem de pé na célula**, com os pés embaixo, e o pivô é o
  meio dos pés.

## 3. `bg-jardim.png` — 1280 × 720, opaco

| Região | O que tem |
|---|---|
| y 0–96 | faixa calma (HUD): gramado liso ou copas de árvore bem simples |
| **grade**, x 24–992, y 100–716 | **gramado liso, claro e uniforme**, visto de cima, com textura mínima. Os arbustos entram por código, então aqui não pode haver caminho, sebe, pedra, flor ou sombra: qualquer desenho nessa área brigaria com o labirinto |
| **clareira**, x 992–1256, y 100–716 | uma calçada redonda de **pedrinhas claras**, vazia (o cofre e as pessoas entram por código), com um arco de flores baixas na borda direita |
| bordas (x 0–24 e 1256–1280, y 716–720) | moldura fina de flores e folhas |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: full-screen top-down background for a Phaser 3 maze game for Brazilian children aged 6–7.
Primary request: create one opaque 1280 × 720 px top-down (three-quarter RPG) view of a sunny garden floor. Preserve these exact functional regions: the top band y 0–96 is calm, plain lawn or very simple round tree canopies; the large area x 24–992, y 100–716 is a PLAIN, LIGHT, EVEN lawn seen from above with only a very subtle flat grass texture — completely empty: no paths, no hedges, no stones, no flowers, no shadows, no objects, because maze hedges will be placed on it by code; on the right, x 992–1256, y 100–716, a round clearing of light pale paving pebbles, completely EMPTY, with a low arc of small flowers along its right edge; a thin frame of little flowers and leaves along the outer edges of the canvas.

Palette: fresh light greens, pale cream pebbles, soft pink, lilac and white flowers, warm sunny light. Friendly and calm.

Composition and technical constraints: exact 16:9 canvas; top-down three-quarter view; all listed regions respected; the lawn area is uniform so a grid of hedge blocks reads clearly on top of it; opaque; no white sticker keyline; no embedded user interface.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, children, animals, hedges, bushes or walls inside the lawn area, a drawn maze, paths or trails on the lawn, stepping stones on the lawn, safes, vaults, magnets, cards, benches, fountains, trees in the lawn area, shadows on the lawn, text, letters, words, labels, digits, numbers, signs, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, perspective vanishing point, side view, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, scary or dark elements.
~~~

## 4. `sebes.png` — grade 4 × 2, célula 128 × 128

Os **blocos de arbusto** são a sebe do labirinto: o código põe um em cada
célula `#`, e os vizinhos se encostam. Por isso cada bloco é um **arbusto
quadrado de cantos arredondados**, visto de cima em ¾, que **ocupa a célula
inteira** (margem de só 2–4 px). Assim, lado a lado, vira uma sebe contínua.
Sem keyline branca nos blocos, porque ela desenharia uma grade.

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `hedge-a` | bloco de arbusto verde, liso |
| 1 | `hedge-b` | o mesmo, com 3 florzinhas brancas |
| 2 | `hedge-c` | o mesmo, com 3 florzinhas rosa-claro |
| 3 | `hedge-d` | o mesmo, folhas um pouco mais claras em cima |
| 4 | `hedge-niche` | o mesmo bloco com um **nicho** redondo e escuro aberto no **lado de baixo** (a casinha do ímã); o código gira para os outros lados |
| 5 | `deco-stone` | pedrinha redonda de jardim (enfeite de clareira), **com** margem de 8% |
| 6 | `deco-flowers` | tufo de flores baixas, **com** margem de 8% |
| 7 | `deco-mushroom` | cogumelinho fofo, **com** margem de 8% |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline on cells 0–4, because they tile side by side.

Use case: stylized-concept
Asset type: exact top-down maze hedge tile sheet for a Phaser 3 maze game; the code places one hedge block per grid cell so that neighbouring blocks touch and form continuous hedges.
Primary request: create ONE exact 4 columns × 2 rows sprite sheet on a transparent 512 × 256 px canvas. Every cell is exactly 128 × 128 px. No drawn grid, border or divider.

Cells 0–4 are HEDGE BLOCKS seen from above in a cute three-quarter RPG view: each is one square leafy bush with softly rounded corners that FILLS ITS CELL almost completely (only 2–4 px transparent margin on every side), with a flat top of clustered round leaves and a slightly darker front face along the bottom edge. All five share the exact same size, shape, green and outline, so that placed side by side they read as one continuous low garden hedge.

Exact cells, left to right and then top to bottom:
0. hedge-a — plain fresh-green hedge block.
1. hedge-b — the same block with three tiny white flowers on top.
2. hedge-c — the same block with three tiny pale-pink flowers on top.
3. hedge-d — the same block with slightly lighter leaves on top.
4. hedge-niche — the same block with one round, dark, cosy hollow niche opening on its BOTTOM (front) face, about 60 px wide, empty inside.
5. deco-stone — one small round garden stone, centred with at least 8% margin and a thin white keyline.
6. deco-flowers — one small tuft of low flowers, centred with at least 8% margin and a thin white keyline.
7. deco-mushroom — one tiny cute mushroom, centred with at least 8% margin and a thin white keyline.

Palette: fresh greens, white and pale-pink flowers, soft cream and brown for the decorations.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, magnets, animals or objects inside the niche, gaps or padding larger than 4 px around cells 0–4, round bushes that do not fill the square, trees, trunks, fences, stone walls, paths, grass background, white keyline on cells 0–4, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, side view, grid lines, visible sprite-sheet borders, cell borders, white cell backing, cropped decorations in cells 5–7, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 5. `bia.png` — grade 4 × 3, célula 256 × 256

A **Bia**: menina chibi de uns 6 anos, **cabelo castanho-escuro em dois
coquinhos**, vestido verde-água, tênis brancos e uma **mochila amarela
pequena** nas costas. Vista em ¾ de cima, de pé, com ~200 px de altura e os pés
em (128, 236). **Nenhum cartão desenhado**: o cartão brilhando no ombro é do
código.

| Célula | Nome no código | Pose |
|---|---|---|
| 0 | `bia-down-a` | andando para **baixo** (de frente), pé esquerdo à frente |
| 1 | `bia-down-b` | andando para baixo, pé direito à frente |
| 2 | `bia-up-a` | andando para **cima** (de costas, a mochila à vista), pé esquerdo |
| 3 | `bia-up-b` | andando para cima, pé direito |
| 4 | `bia-side-a` | andando para a **DIREITA** de perfil, passo aberto (o código espelha para a esquerda) |
| 5 | `bia-side-b` | andando para a direita, passo fechado |
| 6 | `bia-idle` | parada de frente, sorriso tranquilo |
| 7 | `bia-happy` | pulinho de alegria, braços para cima, olhos felizes |
| 8 | `bia-oops` | "ih!": mãos na boca, olhos arregalados, uma gotinha; surpresa, **sem choro** |
| 9 | `bia-show` | de frente, as duas mãos estendidas **vazias** à frente, como quem entrega algo |
| 10 | — | vazia |
| 11 | — | vazia |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions, big head and little body; tiny cartoon emotion marks only where asked; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact top-down RPG-style character sprite sheet for a Phaser 3 maze game for Brazilian children aged 6–7.
Primary request: create ONE exact 4 columns × 3 rows sprite sheet on a transparent 1024 × 768 px canvas. Every cell is exactly 256 × 256 px. Each pose is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

The character: Bia, one cute chibi girl about 6 years old, about 200 px tall, dark-brown hair in two small buns, an aqua-green dress, white sneakers and one small sunny-yellow backpack on her back; seen in a cute three-quarter top-down RPG view; her feet at local (128, 236) in every cell. She carries NO card, paper or object in her hands in any cell.

Exact cells, left to right and then top to bottom:
0. bia-down-a — walking DOWN toward the viewer, left foot forward.
1. bia-down-b — walking down, right foot forward.
2. bia-up-a — walking UP away from the viewer, back view, the yellow backpack clearly visible, left foot forward.
3. bia-up-b — walking up, back view, right foot forward.
4. bia-side-a — walking to the RIGHT in profile, wide step, backpack visible on her back.
5. bia-side-b — walking to the right in profile, feet together mid-step.
6. bia-idle — standing, facing the viewer, calm smile.
7. bia-happy — a little happy jump, both arms up, happy closed eyes, tiny sparkles.
8. bia-oops — "oops": both hands over her mouth, eyes wide, one small sweat drop; surprised, NOT crying.
9. bia-show — facing the viewer, both hands stretched forward, EMPTY, as if handing something over.
10. completely EMPTY and genuinely transparent reserved cell.
11. completely EMPTY and genuinely transparent reserved cell.

Consistency constraints: all ten poses are the IDENTICAL girl with the same proportions, colours, hair, dress, backpack and scale; feet baselines at local y = 236.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a second character, cards, papers, phones, badges, objects in her hands, pets, ground, grass, shadow, background, walking to the left, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, crying, sad faces, angry faces, objects in cells 10 and 11, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 6. `pessoas.png` — grade 4 × 2, célula 320 × 320

As 4 pessoas que esperam na clareira, em ¾ de cima, **de corpo inteiro**,
~260 px de altura, com os pés em (160, 300), **viradas para a ESQUERDA** (de
onde a Bia chega). Na linha 0, a **mesma pose de espera**: de pé, mãos
juntas na frente e um sorriso suave. Ninguém pode parecer "o certo".

| Col. | Quem | Aparência |
|---|---|---|
| 0 | `mom` (mãe) | mulher de cabelo castanho-escuro preso, blusa lilás |
| 1 | `dad` (pai) | homem de cabelo curto castanho-escuro, camisa verde-folha |
| 2 | `neighbor` (vizinho simpático) | homem jovem de cabelo cacheado, camisa coral-clara |
| 3 | `mascot` (mascote fofa) | alguém fantasiado de urso-panda fofo, cabeça grande de pelúcia |

| Linha | Pose |
|---|---|
| 0 — esperando | a pose igual para os quatro: de pé, mãos juntas na frente, sorriso suave |
| 1 — reagindo | **mãe e pai**: braços abertos, felizes, olhos fechados de alegria. **Vizinho e mascote**: segurando um cartão imaginário com as duas mãos na altura do peito (**mãos vazias**, o cartão entra pelo código), olhando para ele com cara curiosa e contente |

A mãe e o pai são **parecidos com a Bia** (o mesmo castanho-escuro de
cabelo), o que ajuda a ler "família" sem símbolo.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; chibi proportions, big head and little body; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact character sprite sheet for a Phaser 3 child-safety game; the child must decide who to trust ONLY from story context, so no character may look more trustworthy than another.
Primary request: create ONE exact 4 columns × 2 rows sprite sheet on a transparent 1280 × 640 px canvas. Every cell is exactly 320 × 320 px. Each figure is complete, full body, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider. Cute three-quarter top-down RPG view, every figure about 260 px tall with feet at local (160, 300), every figure facing and looking to the LEFT.

Columns (the same figure in both rows of a column):
Column 0 — mom: a friendly young mother, dark-brown hair tied back, lilac blouse, light trousers.
Column 1 — dad: a friendly young father, short dark-brown hair, leaf-green shirt, light trousers.
Column 2 — neighbor: a friendly young man, curly hair, soft coral shirt, light trousers; kind and pleasant, NOT suspicious.
Column 3 — mascot: a person in a cute fluffy panda costume with a big plush head and big friendly eyes.

Rows:
Row 0 — waiting: ALL FOUR in the SAME pose — standing, hands together in front, gentle smile. Same size, same warmth, same expression intensity.
Row 1 — reacting: mom and dad with arms open wide, happy closed eyes; neighbor and mascot holding an invisible card with both hands at chest height (hands EMPTY), looking at it with a curious, pleased face.

Consistency constraints: all four figures share the same scale, line weight, brightness and friendliness; nothing marks any of them as good or bad.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, badges, name tags, lanyards, ID cards, uniforms, halos, glows, green markers, shields, hearts on clothes, symbols, sunglasses, hoods, masks, villain features, sneaky smiles, frowns, scary faces, cards, phones or objects in the hands, children, the girl Bia, ground, shadow, background, facing right, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 7. `pecas.png` — grade 4 × 3, célula 256 × 256

| Célula | Nome no código | O quê | Observação |
|---|---|---|---|
| 0 | `magnet-awake` | ímã-ferradura fofo, lilás com pontas prateadas, **cara de bobo**: olhos grandes meio vesgos, língua de fora, sorriso torto | fica no nicho; ondinhas pelo código |
| 1 | `magnet-pull` | o mesmo ímã fazendo força, bochechas cheias, olhos apertados | quando puxa o cartão |
| 2 | `magnet-sleep` | o mesmo ímã dormindo, olhos fechados, bolha de nariz | fim da fase (enfeite) |
| 3 | `card` | um cartão de identidade infantil **vazio**: moldura arredondada creme com borda verde-água, um quadrado **vazio** à esquerda (a foto) e duas linhas vazias à direita | o código põe a foto, o **BIA**, a casinha e a escola |
| 4 | `photo` | retratinho quadrado da Bia (rosto e ombros, os dois coquinhos) | vai no cartão |
| 5 | `home` | casinha fofa com telhado coral | "onde eu moro" |
| 6 | `school` | escolinha fofa com um sino no telhado | "onde eu estudo" |
| 7 | `sticker` | figurinha brilhante de estrela | **N3** (a troca que a mascote oferece) |
| 8 | `vault-closed` | cofrinho-cofre fofo, verde-água e dourado, porta redonda com rodinha, **fechado** | na clareira |
| 9 | `vault-open` | o mesmo cofre com a porta **aberta**, o interior vazio e brilhando | mesma escala e base |
| 10 | — | vazia (sem cadeado: o ímã não tem trava, decisão 1 do plano) | — |
| 11 | `guide-hand` | mãozinha chibi no ângulo de `references/mao-toque-angulo.png` | `tipX`/`tipY` medidos no MANIFEST |

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight where there are eyes; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. The second attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 11.

Use case: stylized-concept
Asset type: exact game-pieces sprite sheet for a Phaser 3 child data-safety maze game; nothing may be scary.
Primary request: create ONE exact 4 columns × 3 rows sprite sheet on a transparent 1024 × 768 px canvas. Every cell is exactly 256 × 256 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

Exact cells, left to right and then top to bottom:
0. magnet-awake — one cute horseshoe magnet, lilac body with silver tips, pointing up, with a SILLY goofy face: big slightly cross-eyed eyes, tongue sticking out, lopsided grin. Funny, never scary.
1. magnet-pull — the same magnet straining to pull, puffed cheeks, squeezed eyes, tiny effort marks.
2. magnet-sleep — the same magnet asleep, eyes closed, a small snot bubble, a peaceful sleeping face, no "Z" letters.
3. card — one EMPTY child ID card, landscape, rounded corners, cream face with an aqua-green border; on its left an EMPTY square frame for a photo; on its right two EMPTY rounded lines; nothing written or drawn inside.
4. photo — one small square portrait of a cute chibi girl with dark-brown hair in two small buns, face and shoulders, smiling, on a pale-aqua background.
5. home — one cute little house with a coral roof, a door and one window.
6. school — one cute little school building with a small bell on the roof.
7. sticker — one shiny star sticker, sunny yellow with a white glint.
8. vault-closed — one cute chunky safe, aqua-green with gold trim, a round door with a spoked wheel handle, CLOSED, front view, standing on its own short feet.
9. vault-open — the SAME safe at the SAME scale and baseline with its round door swung OPEN to the right, the inside empty and softly glowing cream.
10. completely EMPTY and genuinely transparent reserved cell.
11. guide-hand — use references/mao-toque-angulo.png ONLY as the angle and silhouette reference. Create one cute light-brown childlike chibi hand with the same dark uniform outline, one-tone flat cel shading and white sticker keyline as the other cells. The index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT; its tip is crisp and clearly the touch point. The other THREE fingers fold into distinct descending steps on the RIGHT; the THUMB folds inward across the palm; the short bare wrist descends toward the LOWER RIGHT. Exactly five digits. No click lines, no face, no sleeve.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, scary or angry magnets, sharp teeth, red alert colour, lightning, text, letters, words, names, labels, digits, numbers, barcodes, QR codes, writing or drawings inside the card, a photo inside the card, a lock on the safe, any padlock, money, coins or jewels inside the safe, object in cell 10, extra objects, extra hands, extra fingers, missing fingers, click lines, radiating lines, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, crying.
~~~

## 8. `cover-labirinto-do-cofrinho.png` — 1672 × 941, opaco

A capa: um labirinto de sebes baixas visto de cima em ¾. A Bia anda pelo
caminho deixando um rastro colorido, e o cartão brilha acima da mochila. Num
nicho da sebe, o ímã bobo estica as ondinhas, que não alcançam a Bia. Na
clareira, o cofre aberto brilha com a mãe acenando ao lado. Em cima vai o título
`Labirinto do Cofrinho`. Anexe a referência `19` e as `bia.png`, `pessoas.png`
e `pecas.png` aprovadas.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover, not a sticker.
CHARACTERS — THE OTHER ATTACHED IMAGES (bia.png, pessoas.png, pecas.png) ARE THE REFERENCES FOR BIA, HER MOM, THE MAGNET, THE CARD AND THE SAFE: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Labirinto do Cofrinho”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Labirinto do Cofrinho” in large chunky rounded playful multicolour letters with a thick dark outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly three words, letter for letter, with capitalization exactly: L-a-b-i-r-i-n-t-o [space] d-o [space] C-o-f-r-i-n-h-o. No accents, extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, a sunny garden maze of low square green hedges seen from above in a cute three-quarter view: Bia, the chibi girl with two hair buns, aqua-green dress and yellow backpack, walks along the path leaving a short colourful dotted trail, a small glowing ID card floating just above her backpack; in a hedge niche, the goofy lilac magnet stretches its soft wavy rings toward the path but they do not reach her; on the right, in a clearing of pale pebbles, the cute aqua-green safe stands open and glowing while her mom waves happily next to it. Make "guide the girl through the maze to keep her data card safe" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; Bia, the magnet, the safe and the mom large beneath it and fully visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, strangers, the neighbor, the mascot, scary elements, dark corridors, villains, badges, name tags, extra words, misspelled title, subtitle, punctuation, numbers, writing on the card, captions, signs with writing, watermark, logo, score, HUD, buttons, question mark, speech bubbles, arrows, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped girl, cropped safe, sad faces, crying, angry faces.
~~~

## 8b. Pedido de arte — `professora.png` (N2)

A professora é quem cuida da Bia na fase A do N2, e **não existe na
`pessoas.png`**. Até esta folha chegar, ela é desenhada em código.

| Arquivo | Grade | Célula | Tamanho final | Alfa |
|---|---|---|---|---|
| `professora.png` | 2 × 1 | 256 × 256 | 512 × 256 | sim |

| Célula | Pose | Igual a |
|---|---|---|
| 0 | esperando: de pé, mãos juntas na frente, sorriso suave | linha 0 da `pessoas.png` |
| 1 | comemorando: braços abertos, olhos fechados de alegria | mãe e pai da linha 1 |

Mesma escala, traço e escala de cor das outras pessoas, pés embaixo da
célula, virada para a esquerda. **Sem crachá, apito, régua ou qualquer
objeto de professora na mão**: quem ela é aparece só na fala.

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; chibi proportions, big head and little body; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. The second attached image, pessoas.png, is the reference for scale, line and palette: the new figure must look like one more member of that same sheet.

Use case: stylized-concept
Asset type: exact character sprite sheet for a Phaser 3 child-safety game.
Primary request: create ONE exact 2 columns × 1 row sprite sheet on a transparent 512 × 256 px canvas. Every cell is exactly 256 × 256 px. Each figure is complete, full body, isolated and centred in its own cell with at least 6% transparent margin, INCLUDING its keyline, feet near the bottom of the cell. Cute three-quarter top-down RPG view, facing and looking to the LEFT, the same size as the adults in pessoas.png.

The character: a friendly young teacher, black curly hair tied in a low bun, a sunny-yellow cardigan over a white blouse, light trousers.

Exact cells, left to right:
0. waiting — standing, hands together in front, gentle smile (the SAME pose as row 0 of pessoas.png).
1. cheering — arms open wide, happy closed eyes, open smile (the SAME pose as mom and dad in row 1 of pessoas.png).

DO NOT INCLUDE: any character or recognizable cast member from the style reference, badges, name tags, lanyards, whistles, rulers, books, apples, chalk, glasses, objects in the hands, halos, glows, symbols, children, background, ground, shadow, text, letters, words, labels, digits, numbers, captions, watermark, logo, user interface, frames, speech bubbles, arrows, icons, grid lines, visible sprite-sheet borders, cell borders, cropped edges, facing right, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, 3D render, photorealism, blur.
~~~

Depois de chegar: medir a caixa alfa das 2 células e pôr `cx`/`feet` em
`TEACHER_ART` (`data/files.ts`), como foi feito com a `pessoas.png`.

## 9. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades exatas: `sebes` 512 × 256, `bia` 1024 × 768, `pessoas` 1280 × 640,
  `pecas` 1024 × 768; o corte medido por colunas na folha inteira, sem peça
  cruzando célula;
- **os blocos de sebe (0–4) enchendo a célula** (margem ≤ 4 px) e iguais entre
  si: montar uma fileira de 5 lado a lado e conferir que vira uma sebe contínua,
  sem emenda nem grade;
- o nicho da célula 4 **aberto para baixo**;
- no `bg-jardim`, a área da grade **lisa** (nenhum caminho, sebe ou sombra) e
  a clareira vazia;
- a Bia igual nas 10 poses, com os pés em y = 236, **sem cartão** desenhado, e
  andando de lado para a **direita**;
- as 4 pessoas **com a mesma pose, o mesmo tamanho e o mesmo sorriso** na linha
  0, **sem crachá** nem distintivo, olhando para a **esquerda**, com os pés
  em y = 300 e as mãos vazias na linha 1;
- o cartão **vazio**; o cofre aberto e o fechado na mesma escala e na mesma
  base;
- o ímã **bobo**, nunca bravo;
- `tipX`/`tipY` do dedo medidos;
- a grafia do título da capa conferida letra a letra.
