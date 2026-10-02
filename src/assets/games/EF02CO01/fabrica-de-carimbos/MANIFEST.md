# Manifesto — Fábrica de Carimbos

Medido em 02/10/2026 com `sharp` (alfa > 24), direto dos PNGs entregues. Os
tamanhos diferem do TEXTURAS.md; o código usa estas medidas
(`data/files.ts`, `ART`), sem reempacotar as folhas.

| arquivo | entregue | pedido | uso |
|---|---|---|---|
| `bg-fabrica.png` | 1672 × 941 | 1280 × 720 | fundo, escala 0,7656 (cabe exato no 16:9) |
| `esteira.png` | 2048 × 768, 8 ripas a cada ~250 px | 512 × 96 | `TileSprite` sobre a lona do fundo, escala X 64/250 e Y 58/768 |
| `carimbo.png` | 1024 × 386, 2 células de 512 × 386 | 1024 × 512 | cabeça do carimbo, escala 0,78 |
| `pecas.png` | 1200 × 600, 4 × 2 células de 300 | 1024 × 512 (256) | peças dos brinquedos, caixa, dedo |
| `cover-fabrica-de-carimbos.png` | 1672 × 941 | 1672 × 941 | capa do catálogo e `public/og` |

## `pecas.png` (célula 300 × 300)

| célula | peça | caixa (x, y, w, h) | âncora usada |
|---|---|---|---|
| 0 | robô branco | 18, 43, 265, 247 | pés em (150, 290); altura 247 |
| 1 | antena | 96, 39, 102, 244 | base em (146,5; 283) |
| 2 | bola branca | 24, 41, 240, 232 | centro (143,5; 156,5), diâmetro ~236 |
| 3 | listras | 15, 39, 247, 234 | centro (138; 155,5), largura 247, escalada para a largura da bola |
| 4 | caixa aberta **inteira**, com abas | 4, 84, 295, 179 | base em (151, 263); a parede da frente começa em y 176 (borda de cima dela em 177–179) |
| 5 | caixa inteira, sem abas | 9, 127, 283, 135 | **não usada** |

As células 4 e 5 vieram como caixas inteiras, e não como "fundo" e "frente".
O jogo usa só a 4, duas vezes: inteira atrás dos brinquedos e recortada de
y 176 para baixo (`setCrop`) na frente deles. Assim o brinquedo fica dentro.
| 6 | dedo | 53, 30, 201, 240 | ponta em (76, 30) |
| 7 | vazia | — | — |

## `carimbo.png` (célula 512 × 386)

| célula | caixa | janelinhas (centro; miolo ~110 × 95) |
|---|---|---|
| 0 (2 janelas) | 41, 35, 430, 346 | (175,5; 214) e (334; 212) |
| 1 (3 janelas, N3) | 16, 35, 475, 346 | (126; 214), (252,5; 214), (379,5; 215) |

O topo do encaixe (y 35) é a origem da cabeça no jogo; a base da borracha fica
em y 381.

## Fundo, em coordenadas de 1280 × 720

| peça pintada | onde |
|---|---|
| pórtico | x 360–920; pilares por dentro em x 413–865; pistão em x 637, até y 268 |
| esteira | rolos em x 107 e 1004; topo da lona em y ~490 |
| túneis | esquerda x 0–157; direita x 980–1080 |
| nicho da caixa | x 1080–1280, tapete em y ~567 |
