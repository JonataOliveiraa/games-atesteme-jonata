# Operação Formiga — texturas

Destino: `src/assets/games/EF15CO04/operacao-formiga/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§3 o laço, §5 a tela, §6 as medidas).

**Com imagem de referência:** anexe em **toda geração** a `references/35-chibi-voador.webp`, a mesma linha da Ventania na Floresta (formigas, jardim e vento nos dois jogos). Todo bloco STYLE começa mandando usar a imagem anexada e termina em *"Take ONLY the art style"*. O elenco da referência vai no negativo de todos os prompts. Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar. Se quiser outra linha, é a Dúvida 1 do PLANEJAMENTO.

**O jogo já roda sem nenhum PNG.** A arte de reserva é desenhada em código (`scenes/fallback.ts`) nas mesmas folhas, grades e ordem de células daqui. Um PNG com o mesmo nome na pasta de destino substitui a reserva sem mudar código.

**Ficam no código, sempre:** o cabeçalho e o cartão do pedido, o joystick, o botão ✓, o medidor da fresta e do vento, o traço do corte, **a polpa** nas bordas cortadas, o contorno tracejado no prato, as listras do vento, os pontinhos de feromônio, as legendas, a faixa de erro e a mãozinha da demonstração.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `jardim.png` | — | — | 1672 × 941 (escalado para 1280 × 720) | opaco | o chão do jardim, de cima |
| `formiga.png` | 4 × 2 | 192 | 768 × 384 | sim | a formiga em 8 poses, virada para a **direita** |
| `rainha.png` | 3 × 1 | 256 | 768 × 256 | sim | a rainha em 3 poses, virada para a **esquerda** |
| `frutas.png` | 3 × 1 | 512 | 1536 × 512 | sim | morango, laranja e maçã verde, inteiros (**silhueta é contrato**, §6) |
| `cenario.png` | 4 × 2 | 256 | 1024 × 512 | sim | formigueiro, 3 pedras, prato, arbusto, tufo, dente-de-leão |
| `cover-operacao-formiga.png` | — | — | 1672 × 941 | opaco | capa **com o título** |

**A ordem das células é contrato com o código.** O tamanho pode variar, porque o jogo mede cada célula na carga, mas a grade, a ordem, o conteúdo e a **direção** de cada peça não podem mudar.

**Para o N1 bastam:** `jardim`, `formiga`, `rainha`, `frutas` e `cenario`. A capa vem por último. As folhas do N2 e do N3 estão no §9.

## 2. Regras deste jogo

- **Nenhum texto na arte.** Legendas, balões e números são do código. A única exceção é o título da capa.
- **Vista de cima, inclinada (3/4):** a câmera olha de cima, a ~40°. Jardim, pedras, formigueiro e prato com a mesma inclinação. **As frutas são a exceção: vistas bem de cima (90°)**, porque são cortadas em linha reta pela tela.
- **As frutas são cortadas pelo código.** A arte de cada fruta tem de **preencher exatamente a silhueta** do §6, e nada pode sair dela (cabinho, folhinha e sépalas ficam **dentro** do contorno). O que passar da silhueta some no recorte.
- **A formiga e a rainha não têm nada nas mãos.** O pedaço carregado é desenhado pelo código por cima da cabeça da formiga.
- **Cores que são da mecânica:** o vento é do código (listras brancas). Nada no jardim pode parecer vento (redemoinhos, linhas de movimento, folhas voando).
- **O muro é feito das pedras de `cenario.png`**, empilhadas pelo código. O fundo não tem muro, pedra grande, formigueiro, prato nem fruta.
- Peça solta e centrada na célula, com cerca de 8 % de margem. Bichos, pedras e formigueiro pisam no fundo da célula.

---

## 3. `jardim.png` — 1672 × 941, opaco

O chão do jardim, visto de cima. O código põe por cima o muro de pedras (no meio), a fruta (à esquerda), o formigueiro, a rainha e o prato (à direita).

| Região (em % da imagem) | O que tem |
|---|---|
| alto, 0–13 % da altura | grama calma e lisa (é onde fica o cabeçalho) |
| toda a área de jogo, 13–100 % | grama baixa e lisa, com manchas suaves de terra batida clara |
| uma trilha de terra | sai da esquerda (a ~45 % da altura), passa pelo meio (a ~60 %) e chega à direita (a ~75 %), larga e clara |
| só nas bordas e cantos | tufos de grama, trevos, pedrinhas pequenas, cogumelinhos |
| canto de baixo à esquerda (0–33 % da largura, 62–100 % da altura) | grama lisa e calma (fica o joystick) |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (dark green, deep brown, dark teal — never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft pastel palette (mint, leaf green, cream, warm brown) with a few clear saturated accents; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

A background for a children's game, 16:9 (1672 x 941), opaque, NO white sticker keyline here — this is a full scene, not a sticker. A sunny garden ground seen from ABOVE at a 3/4 angle (camera about 40 degrees above the ground), crisp shapes, no painterly brushwork. The whole ground is short soft grass in mint and leaf green, with a few soft patches of light packed earth. A wide, smooth, light-brown DIRT TRAIL enters from the left edge at about 45% of the height, curves gently through the middle at about 60% of the height and leaves through the right edge at about 75% of the height; the trail is plain and empty. The top 13% of the picture is plain calm grass with nothing on it. The bottom-left corner (left third of the width, lower 38% of the height) is plain calm grass. Only along the very edges and corners: little tufts of grass, clover leaves, tiny pebbles and small round brown mushrooms. Everything else is calm and empty, because characters and objects will be placed on top. Bright, cheerful daylight.

DO NOT INCLUDE: ants, insects, bugs, animals, people, characters, anthill, mound, big rocks, stone walls, fruits, strawberries, oranges, apples, plates, leaves lying in the middle, bushes in the middle, wind swirls, motion lines, flying leaves, text, letters, numbers, signs, objects on the trail, strong perspective, side view, horizon, sky, tree trunks, night, scary or dark elements, frames around the picture, the characters from the reference image (Genshin Impact fan-art boys: a dark-teal-haired boy with a diamond forehead mark and purple scarf, a dark-haired boy with braids, a white flower and a green cape, a white-and-red-haired samurai boy, a red-haired boy with a long coat), slimes, cloud creatures, floating clouds, rainbows, speech bubbles with symbols, white sticker keyline, watermarks, signatures, @handles, website names, harsh pure-black outlines, western cartoon style, sketchy rough lines, painterly realistic rendering, 3D render, photorealistic.
~~~

---

## 4. `formiga.png` — 4 × 2 células de 192 (768 × 384), alfa

Uma formiguinha chibi, **sempre virada para a DIREITA** (o código espelha para a esquerda), vista de lado com a mesma inclinação 3/4 do jardim. Marrom-avermelhada `#B5482F`, cabeça grande e redonda, olhos enormes e brilhantes, duas antenas com bolinha na ponta, três partes do corpo bem marcadas e seis perninhas curtas. Pisa a 10 px do fundo da célula.

| Célula | Pose |
|---|---|
| 0 | parada, sorrindo, patinhas no chão |
| 1 | andando, passo A (perninhas alternadas) |
| 2 | andando, passo B |
| 3 | carregando, parada: as duas patinhas da frente **levantadas acima da cabeça**, mãos vazias |
| 4 | carregando, passo A |
| 5 | carregando, passo B |
| 6 | feliz: olhos fechados em arco, boca aberta, patinhas para cima |
| 7 | esforço/ops: olhos apertados, gotinha de suor, corpo inclinado para frente empurrando |

**Contrato do carregar:** nas células 3, 4 e 5, as patinhas levantadas terminam em torno de **(110, 40)** da célula, e nada da formiga passa acima de y 28. O código põe o pedaço com o centro em (110, 34).

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; big glossy expressive eyes with a bright highlight; tiny cartoon emotion marks (a sweat drop); a thin white sticker keyline around every silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

Sprite sheet on a fully transparent background, 4 columns by 2 rows, 192x192 px per cell (768x384 px total), no grid lines drawn. The SAME cute chibi ant in 8 poses, always facing RIGHT, seen from the side at a slight 3/4 top-down angle, feet resting 10 px above the bottom of each cell. The ant is warm reddish-brown #B5482F, with a big round head, huge shiny eyes, two antennae ending in little balls, three clearly separated body parts and six short stubby legs. Cell 1: standing, smiling, all legs on the ground. Cell 2: walking, step A (legs alternating). Cell 3: walking, step B. Cell 4: standing and CARRYING, the two front legs raised high above the head with EMPTY hands, as if holding something big on top, nothing above y 28 of the cell. Cell 5: carrying, walking step A, same raised front legs. Cell 6: carrying, walking step B, same raised front legs. Cell 7: happy, eyes closed in happy arcs, open laughing mouth, front legs up. Cell 8: straining and oops, squeezed eyes, one sweat drop, body leaning forward as if pushing something stuck.

DO NOT INCLUDE: objects in the hands, leaves, fruits, crumbs, crowns, clothes, hats, scarves, wings, extra legs, a second ant, shadows on the ground, floor, background colour, white backing behind transparent areas, text, letters, numbers, speech bubbles, icons, frames, user interface, grid lines, visible sprite-sheet borders, cell borders, cropped edges, scary insect realism, angry faces, crying faces, the characters from the reference image (Genshin Impact fan-art boys), slimes, clouds, rainbows, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, 3D render, photorealistic.
~~~

---

## 5. `rainha.png` — 3 × 1 células de 256 (768 × 256), alfa

A rainha do formigueiro, chibi, **virada para a ESQUERDA**, da mesma espécie da formiguinha mas maior e mais redonda, num tom mais escuro `#8E3B2A`, com uma **coroinha dourada** `#FFC93C` e uma capinha curta lilás `#B79CE6`. Pisa a 10 px do fundo da célula.

| Célula | Pose |
|---|---|
| 0 | normal: sorriso calmo, patinhas juntas |
| 1 | pedindo: uma patinha levantada apontando para a esquerda, boca aberta falando |
| 2 | feliz: olhos fechados em arco, boca aberta rindo, as duas patinhas para cima |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; big glossy expressive eyes with a bright highlight; a thin white sticker keyline around every silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

Sprite sheet on a fully transparent background, 3 columns by 1 row, 256x256 px per cell (768x256 px total), no grid lines drawn. The SAME cute chibi queen ant in 3 poses, always facing LEFT, seen from the side at a slight 3/4 top-down angle, feet resting 10 px above the bottom of each cell. She is plump and round, dark reddish-brown #8E3B2A, with a big round head, huge kind shiny eyes, two antennae ending in little balls, a small golden crown #FFC93C on her head and a short soft lilac cape #B79CE6. Cell 1: calm, gentle smile, front legs together. Cell 2: asking, one front leg raised pointing to the left, mouth open as if talking. Cell 3: happy, eyes closed in happy arcs, open laughing mouth, both front legs raised.

DO NOT INCLUDE: objects in the hands, food, fruits, leaves, scepter, throne, wings, extra legs, other ants, shadows on the ground, floor, background colour, white backing behind transparent areas, text, letters, numbers, speech bubbles, icons, frames, user interface, grid lines, visible sprite-sheet borders, cell borders, cropped edges, scary insect realism, angry faces, the characters from the reference image (Genshin Impact fan-art boys), slimes, clouds, rainbows, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, 3D render, photorealistic.
~~~

---

## 6. `frutas.png` — 3 × 1 células de 512 (1536 × 512), alfa — **silhueta é contrato**

As frutas **vistas bem de cima**, inteiras, cada uma centrada em **(256, 256)** da sua célula. O código recorta cada pedaço pelo polígono abaixo, então a arte tem de **encher exatamente** essa silhueta, sem nada para fora.

| Célula | Fruta | Silhueta (px da célula) | Cores |
|---|---|---|---|
| 0 | **morango** | "ovo" com a parte **larga em cima**: largura máxima ~378 (x 67–445) um pouco acima do meio, altura 410 (y 51–461), base arredondada | vermelho `#E8434F`, sementinhas amarelas, **sépalas verdes dentro do contorno**, no alto |
| 1 | **laranja** | círculo de raio 230 (x 26–486, y 26–486) | laranja `#F59A23`, casca com poros, um umbiguinho e **uma folhinha verde dentro do contorno**, no alto |
| 2 | **maçã verde** | "ovo" suave, largura ~412 (x 50–462), altura 388 (y 62–450), só um pouco mais larga em cima | verde-maçã `#8BD35A`, brilho, **cabinho e folhinha dentro do contorno**, no alto |

- O polígono exato está em `data/fruits.ts`: x = a·sen t·(1 + e·cos t), y = −b·cos t, com (a, b, e) = morango (185, 205, 0,22), laranja (230, 230, 0), maçã (205, 194, 0,08).
- **Contorno escuro** em volta da casca, como os outros desenhos. **Sem polpa e sem fatia**: a polpa é desenhada pelo código só nas bordas cortadas.
- Se a geração sair maior ou menor, a Tesoura reescala a fruta até encostar na silhueta, sem regenerar. Se sair com cabinho para fora, a Tesoura apaga o que sobra.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; small white "+" sparkle marks on shiny surfaces; soft rounded chunky shapes. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

Sprite sheet on a fully transparent background, 3 columns by 1 row, 512x512 px per cell (1536x512 px total), no grid lines drawn. Three whole fruits seen STRAIGHT FROM ABOVE (top view, 90 degrees), each centred at x 256, y 256 of its cell, each filling its exact silhouette with a dark outline around the skin. Cell 1: a big strawberry, egg-shaped with the WIDE part at the top (about 378 px wide, 410 px tall, rounded bottom), bright red #E8434F with little yellow seeds, and its green leafy cap drawn INSIDE the top of the silhouette, nothing sticking out. Cell 2: an orange, a perfect circle of radius 230 px, orange #F59A23 with a dimpled peel, a small navel and one little green leaf drawn INSIDE the circle near the top, nothing sticking out. Cell 3: a green apple, a soft round egg shape slightly wider at the top (about 412 px wide, 388 px tall), apple green #8BD35A with a shine, and its short stem and small leaf drawn INSIDE the top of the silhouette, nothing sticking out. Whole fruits only, never cut.

DO NOT INCLUDE: cut fruits, slices, visible flesh, juice, bites, faces on the fruits, stems or leaves sticking out of the silhouette, plates, shadows, floor, background colour, white backing behind transparent areas, white sticker keyline, side view, perspective, text, letters, numbers, icons, frames, user interface, grid lines, visible sprite-sheet borders, cell borders, cropped edges, the characters from the reference image (Genshin Impact fan-art boys), slimes, clouds, rainbows, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, 3D render, photorealistic.
~~~

---

## 7. `cenario.png` — 4 × 2 células de 256 (1024 × 512), alfa

As coisas do jardim que o código posiciona. Mesma inclinação 3/4 do fundo. Cada peça pisa a ~10 px do fundo da célula (o prato fica centrado).

| Célula | Peça | Notas |
|---|---|---|
| 0 | **formigueiro** | montinho de terra marrom-quente, largo e baixo (~230 de largura), com um **buraco escuro redondo** no alto, um pouco acima do meio da célula (em ~(128, 150)) |
| 1 | **pedra A** | pedra cinza-quente arredondada, larga (~200 × 150), com musgo leve |
| 2 | **pedra B** | outra pedra, mais alta (~170 × 180) |
| 3 | **pedra C** | outra pedra, achatada (~210 × 130) |
| 4 | **prato** | uma folha redonda e lisa vista de cima, verde-clara, com a nervura bem suave, ocupando a célula com ~8 % de margem (o contorno da fruta é desenhado por cima) |
| 5 | **arbusto** | uma moitinha redonda e baixa, verde-escura com folhas, onde a fruta fica embaixo |
| 6 | **tufo** | um tufo de grama com dois trevos |
| 7 | **dente-de-leão** | um dente-de-leão branco, de bolinha, que fica perto do vento |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; soft rounded chunky shapes; a thin white sticker keyline around every silhouette. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

Sprite sheet on a fully transparent background, 4 columns by 2 rows, 256x256 px per cell (1024x512 px total), no grid lines drawn. Garden props seen from above at a 3/4 angle (about 40 degrees), each one alone and centred in its cell, resting about 10 px above the bottom of the cell. Cell 1: a cute low wide ANTHILL mound of warm brown soil, about 230 px wide, with one dark round tunnel hole on its top, a little above the middle of the cell. Cell 2: a rounded warm-grey stone, wide (about 200x150), with a little soft moss. Cell 3: another warm-grey stone, taller (about 170x180). Cell 4: another warm-grey stone, flat (about 210x130). Cell 5: a smooth round light-green LEAF seen from above, used as a plate, filling the cell with about 8% margin, with a very soft central vein, centred in the cell. Cell 6: a small round low dark-green BUSH with leaves. Cell 7: a small tuft of grass with two clover leaves. Cell 8: a white dandelion puff ball on a short stem.

DO NOT INCLUDE: ants, insects, animals, characters, faces on the props, fruits, food on the plate, crowns, shadows on the ground outside the props, floor, background colour, white backing behind transparent areas, text, letters, numbers, icons, frames, user interface, grid lines, visible sprite-sheet borders, cell borders, cropped edges, wind swirls, motion lines, the characters from the reference image (Genshin Impact fan-art boys), slimes, clouds, rainbows, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, 3D render, photorealistic.
~~~

---

## 8. `cover-operacao-formiga.png` — 1672 × 941, opaco, **com o título**

A formiguinha no jardim, de cima (3/4), com uma fatia de morango no alto da cabeça, passando pela fresta entre duas pedras. Atrás dela, o morango cortado em fatias sob o arbusto; à frente, a rainha de coroinha sorrindo ao lado do formigueiro, com o morango quase inteiro remontado num prato de folha. Letreiro **Operação Formiga** no alto, centralizado (conferir o acento de "Operação").

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi anime sticker-comic illustration; clean, smooth lineart of medium weight drawn in a darker tone of each area's own color (never pure black); flat cel shading with ONE soft shadow tone and almost no gradients; big glossy expressive eyes with a bright highlight; small white "+" sparkle marks; soft pastel palette (mint, leaf green, cream, warm brown) with a few clear saturated accents; NO white sticker keyline here — this is a full scene, not a sticker. Take ONLY the art style: do NOT copy its characters, outfits, clouds, slimes, rainbow, speech bubbles or framing.

Cover illustration, 1672x941 px; the main action must read at thumbnail size. A sunny garden seen from above at a 3/4 angle. In the centre, a cute chibi reddish-brown ant with huge shiny eyes walks to the right through a narrow gap between two rounded grey stones, proudly carrying a big red strawberry slice above her head with her two front legs. On the left, under a small round bush, the rest of the strawberry lies cut into neat slices. On the right, next to a cute brown anthill, a plump queen ant with a small golden crown and a lilac cape smiles, beside a round green leaf plate where the strawberry is being put back together, one slice still missing. At the top centre, a big title lettering that reads exactly "Operação Formiga" (with the cedilla and the tilde), chunky rounded colourful letters with a thick dark outline and a slight volume, clearly readable.

DO NOT INCLUDE: any other text, misspelled title, extra letters, subtitles, digits, numbers, watermark, logo, user interface, buttons, joystick, panels, frames, speech bubbles, arrows, HUD, people, hands, scary insect realism, angry faces, crying faces, the characters from the reference image (Genshin Impact fan-art boys), slimes, cloud creatures, rainbows, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, heavy rendering, western cartoon style, rough sketchy lines, muddy colours, 3D render, photorealistic, blur, lens flare.
~~~

---

## 9. N2 e N3 (só quando o nível for feito)

| Arquivo | Grade | Célula | Nível | Conteúdo |
|---|---|---|---|---|
| `folhas.png` | 2 × 1 | 768 | N2 | duas folhas grandes vistas bem de cima, inteiras, **silhueta é contrato** como as frutas (convexas, o polígono vai para `data/fruits.ts` quando o N2 for desenhado) |
| `folha-gigante.png` | — | 1024 × 768 | N3 | a folha gigante limpa, vista de cima |
| `sujeira.png` | 4 × 1 | 128 | N3 | gota de orvalho, grão de terra, raminho seco, pétala murcha, para pôr por cima da folha (a raspadinha apaga) |
| `amigas.png` | 4 × 2 | 192 | N3 | uma formiga amiga (outra cor, `#6E8B3D`): cochilando, acordando, andando A/B, carregando A/B, feliz, empurrando |

Os prompts saem quando cada nível for planejado em detalhe, no mesmo formato dos de cima.
