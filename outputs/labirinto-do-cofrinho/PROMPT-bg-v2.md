# Labirinto do Cofrinho — fundo novo (`bg-jardim-v2.png`)

Pedido do usuário (30/09/2026): "crie um background legal baseado na arte dele".
Anexar, nesta ordem: `src/assets/games/EF01CO07/labirinto-do-cofrinho/bg-jardim.png` (fundo atual: regiões e paleta),
`src/assets/games/EF01CO07/labirinto-do-cofrinho/sebes.png` (os arbustos que vão EM CIMA do gramado),
`src/assets/games/EF01CO07/labirinto-do-cofrinho/bia.png` e `pecas.png` (a linha de arte do jogo).

Canvas: **1672 × 941**, opaco (o jogo reduz para 1280 × 720; as regiões abaixo já estão em px do canvas grande).

| Região (px do canvas 1672 × 941) | Regra |
|---|---|
| faixa do alto, y 0–125 | a parte "legal": fileira de copas redondas de árvore fofas, cerquinha branca de madeira baixa, 2–3 borboletas, passarinho num poste. Calma nas pontas: à esquerda (x 0–420) e à direita (x 1520–1672) só copas lisas, porque o HUD fica ali |
| **gramado do labirinto**, x 31–1296, y 131–935 | gramado claro, uniforme, liso, com textura mínima de trevinhos bem sutis espalhados por igual. NADA de caminho, pedra, flor, sombra ou objeto: as sebes entram por código |
| **pátio**, x 1296–1640, y 131–935 | pátio redondo de pedrinhas claras, meio VAZIO (cofre e pessoas entram por código em x≈1450 y 272, 505, 740). Charme só na BORDA: um arco de treliça com rosinhas no topo do pátio, vasinhos de flor e uma regadeira na borda direita, pedrinhas maiores de contorno |
| moldura | borda fina de folhas e flores (rosa, lilás, branco) nas bordas esquerda (x 0–31), direita (x 1640–1672) e de baixo (y 935–941) |

## Prompt

~~~text
STYLE — USE THE ATTACHED GAME IMAGES (bg-jardim.png, sebes.png, bia.png, pecas.png) AS THE ART STYLE REFERENCE and match their rendering exactly: cute chibi / kawaii top-down garden game art; clean crisp dark desaturated navy outlines, never pure black; simple rounded shapes; flat cel shading with ONE hard shadow tone; fresh light greens, pale cream pebbles, soft pink, lilac and white flowers, warm sunny light. The first attached image (bg-jardim.png) is the CURRENT background: keep its functional layout and palette, but make it much more charming. NO white sticker keyline — this is a full scene.

Use case: stylized-concept
Asset type: full-screen top-down (three-quarter RPG) background for a Phaser 3 maze game for Brazilian children aged 6–7.
Primary request: one opaque 1672 × 941 px sunny garden seen from above. Exact functional regions, in canvas pixels:
- TOP BAND y 0–125: a cheerful row of fluffy round tree canopies and a low white wooden picket fence, with two or three small butterflies and one little bird on a fence post; keep the far left (x 0–420) and far right (x 1520–1672) parts of this band calm, only plain canopies, because interface buttons sit there.
- MAZE LAWN x 31–1296, y 131–935: a light, even, uniform lawn seen from above, with only a very subtle, evenly spread tiny clover texture. It must stay COMPLETELY EMPTY and flat: no paths, no hedges, no stones, no flowers, no shadows, no objects, no stripes — maze hedge blocks will be placed on top by code.
- PATIO x 1296–1640, y 131–935: a round courtyard of light pale paving pebbles whose CENTRE stays completely EMPTY and flat (a safe and people are placed on it by code). Put the charm only on its rim: a small arched wooden trellis with little pink roses at the top of the patio, a few round flower pots and a small watering can along its right edge, slightly bigger border pebbles.
- FRAME: a thin border of leaves and small pink, lilac and white flowers along the left edge (x 0–31), the right edge (x 1640–1672) and the bottom edge.

Composition and technical constraints: exact 1672 × 941 canvas; top-down three-quarter view; all regions respected; the maze lawn uniform so a grid of hedge blocks reads clearly on it; the patio centre empty; opaque; no embedded user interface.

DO NOT INCLUDE: any character or person, children, animals other than the tiny butterflies and one bird in the top band, hedges or bushes inside the lawn area, a drawn maze, paths, trails or stepping stones on the lawn, mowing stripes, flowers or shadows on the lawn, safes, vaults, magnets, cards, houses, benches, fountains or objects in the patio centre, text, letters, words, labels, digits, numbers, signs, watermark, logo, title lettering, HUD, buttons, question mark, speech bubbles, arrows, icons, side view, perspective vanishing point, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, scary or dark elements.
~~~
