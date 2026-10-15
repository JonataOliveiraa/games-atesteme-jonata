# Pixels Fujões — arte

Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§11 arte).

**Não há textura para gerar.** Desde 13/10/2026 (pedido do usuário: *"o jogo precisa nem de textura, vc msm pode fzr, já que é pixel art"*), toda a arte do jogo é pixel art desenhada pixel por pixel em `scenes/pixelart.ts`. Este arquivo guarda a paleta, a lista do que o código desenha e o prompt da capa, que é a única imagem de fora que o jogo ainda pode precisar.

## 1. Paleta "fliperama à noite" (`data/theme.ts`)

| Uso | Cor |
|---|---|
| fundo da vista geral | `#17122B` |
| tela do tablet (o fundo dentro da tela) | `#100C20` |
| contorno de tudo | `#0B0818` |
| painéis do cabeçalho: faixa 1 / faixa 2 / luz / aro | `#2B2152` / `#241B45` / `#3A2D6C` / `#5B46A8` |
| texto | `#F5F2FF` (e `#B9B0E0` para o secundário) |
| **pixel aceso (1)**: corpo / luz / sombra | `#FFD23F` / `#FFF2A8` / `#E0A21A` |
| **pixel apagado (0)**: corpo / luz / sombra | `#2C2752` / `#423B78` / `#221E42` |
| **cores do RGB (N2)**: vermelho 100 / verde 010 / azul 001 | `#FF5A5A` / `#58E06A` / `#5A86FF` |
| **misturas do RGB (N2)**: amarelo 110 (o mesmo do aceso) / ciano 011 / rosa 101 / branco 111 / apagado 000 (o mesmo do apagado) | `#FFD23F` / `#5FF2E6` / `#FF5FD6` / `#F5F2FF` / `#2C2752` |
| **plaquinha de letra (N3)**: papel / sombra | `#FFF4DC` / `#E2D2B4` |
| ciano (raio, mira travada, `?`) | `#3DE0FF` |
| rosa (botões 0 e 1, placa do nível) | `#FF4FA0` |
| verde (fase feita) | `#7EF06A` |
| laranja (erro) | `#FF8A3D` |
| capa do tablet | `#CFC9EC` |
| codificador | `#8E7CC3` |

O amarelo é cor de pixel (o aceso do N1 e o 110 do N2): número, mira e botão nunca são amarelos. As cores do RGB também aparecem nos números do combinado (cada 1 na cor da sua luz) e no aro das caixinhas do código.

## 2. O que o código desenha

| Peça | Tamanho de arte | Escala na tela | Onde |
|---|---|---|---|
| tablet (capa lilás, tela quase preta) | 128 × 96 | 4× (e 24× no zoom) | `tablet()` |
| fujão de pixel, um por cor (aceso, apagado e as cores do RGB): normal, piscando, susto, alegre | 16 × 16 (corpo 12) | conforme a distância | `fujao()` / `ensureFujao()` (assado quando a fase precisa) |
| fujão-letra (N3): plaquinha creme com a letra no meio e os olhinhos nos cantos de cima, nas 4 expressões | 16 × 16 | conforme a distância | `letterFujao()` / `ensureLetterFujao()` |
| caixinha do código (N2, N3): vazia, a da vez (aro branco) e cheia, com o aro na cor da luz | 9 × 11 | conforme o fujão | `ensureBox()` |
| lupa do N2: placa, o pixel amarelo e as três luzinhas (vermelha, verde, azul apagada) | sob medida | 4× | `scenes/subpixels.ts` (com `bakePanel`) |
| cronômetro: relógio de bolso em 8 posições do ponteiro, régua e gomos (branco, laranja e vermelho, de 1 a 3 linhas, e o vazio) | 11 × 13, 43 × 7 e 3 × 3 | 4× | `scenes/stopwatch.ts` |
| codificador parado e mandando | 48 × 40 | 4× | `coder()` |
| mira aberta e travada, botão e botão apertado, base e bolinha do joystick, buraco | 32 × 32 | 3× a 5× | `ui()` |
| placas: cabeçalho, nível, `?`, etiqueta, cartões (e o cartão aceso do N3, com aro ciano), faixa de erro | sob medida, em unidades de 4 px | 4× | `panelPix()` |
| casas em miniatura (combinado, ordem, fases) | 5 a 12 | 4× | `cellPix()` |
| fonte de texto (maiúsculas 5 × 7, acentos, cedilha, números, pontuação), um atlas por cor: branco, ciano, escuro, apagado, amarelo, vermelho, verde, azul | 6 × 12 por letra | 2× a 5× | `bakeFonts()` |
| números-imagem, caixinhas do raio-x e o pontinho branco da fumacinha (`pixel-ponto`) | 5 × 7, 16 × 16 e 1 × 1 | variável | `bakeGlyphs()` / `ensureArt()` |

Para mudar uma peça, mude o desenho em `pixelart.ts`; não há PNG para trocar.

## 3. `cover-pixels-fujoes.png` — 1672 × 941, opaco, com o título

A capa do catálogo. Ela pode vir deste prompt, ou também ser feita em pixel art pelo código (Dúvida 1 do plano). Se for gerar, use o prompt inteiro:

~~~text
STYLE — clean modern PIXEL ART for a cute children's game: every art pixel is a perfectly square, hard-edged block of the same size (about 8 x 8 image pixels), all aligned to ONE grid; NO anti-aliasing, NO blur, NO soft gradients, NO noisy dithering; a short fixed palette with flat fills and at most one shadow tone and one highlight tone per color; a 1-art-pixel outline in very dark indigo #0B0818; friendly shapes with corners rounded by 1–2 stepped pixels; a "night arcade" palette: deep purple background, neon cyan, hot pink and warm yellow accents; crisp and readable, like a polished indie pixel game.

A joyful pixel-art cover illustration for a children's game, 16:9 (1672 x 941), opaque, on a plain deep purple background (#17122B) with nothing else around. In the center, a light lilac tablet (#CFC9EC) seen from the front; its dark screen (#100C20) shows a pixel HEART made of big square pixels: the heart pixels are LIT warm yellow (#FFD23F) and the pixels around it are dark purple (#2C2752), with a few empty dark holes in the heart. Out of the screen jump four cute PIXEL CREATURES toward the viewer — two lit yellow and two dark purple with a thin light lilac outline — each a single square block with a tiny face and no arms or legs, bigger the closer they are. At the bottom center, a chunky lilac toy coding device (#8E7CC3) with pink side grips, seen from behind in first person, shoots a bright cyan beam (#3DE0FF) that carries a big blocky white pixel digit "1" toward one of the yellow creatures. At the top center, the title "PIXELS FUJÕES" in big, chunky, friendly white pixel-font letters with a pink shadow, spelled exactly like that, with the tilde on the Õ.

DO NOT INCLUDE: any other text besides the title and the single digit "1", misspelled title, missing tilde, extra letters, subtitles, logos, brand marks, people, hands, characters other than the pixel creatures, guns, real weapons, bullets, violence, blood, explosions, scary faces, red danger colors, black and white pixels, light or cream background, trees, plants, landscape, room furniture, frames around the picture, anti-aliasing, blurry edges, soft gradients, painterly shading, smooth vector art, mixed pixel sizes, half pixels, noisy dithering, JPEG artifacts, 3D render, photorealistic, watermarks, signatures, @handles.
~~~
