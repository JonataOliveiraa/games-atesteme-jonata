# Manifesto — Trem Peça & Programa

Medido em 02/10/2026 com `sharp` (componentes conectados, alfa > 24), direto dos
PNGs entregues. Os tamanhos diferem do TEXTURAS.md, e o jogo **não reempacota**:
carrega cada folha como imagem e cria os quadros pelas caixas abaixo
(`data/files.ts`, `addFrames` na `BootScene`).

| arquivo | entregue | pedido | uso |
|---|---|---|---|
| `bg-patio.png` | 1672 × 941 | 1280 × 720 | fundo, escala 0,7656 |
| `itens.png` | 1254 × 1254 (células de 313,5, não inteiras) | 1024 × 1024 (256) | 16 quadros por caixa medida |
| `trem.png` | 700 × 700, **sem grade** | 1024 × 1024 (2 × 2, 512) | 3 quadros por caixa medida; **a mão do guia não veio** |

## `itens.png` (x, y, w, h)

| peça | caixa | | peça | caixa |
|---|---|---|---|---|
| mouse | 23, 25, 270, 284 | | game | 951, 345, 280, 272 |
| keyboard | 305, 77, 331, 213 | | music | 27, 646, 277, 268 |
| speaker | 652, 49, 266, 257 | | paint | 340, 646, 273, 269 |
| gamepad | 943, 70, 298, 233 | | alarm | 643, 646, 274, 268 |
| screen | 23, 345, 286, 272 | | photos | 951, 646, 275, 268 |
| camera | 331, 375, 301, 236 | | dance | 26, 937, 279, 271 |
| robot | 664, 324, 254, 304 | | blade | 395, 930, 154, 287 (argola do pivô em 77, 25) |
| signHand | 636, 1014, 288, 165 | | signOrders | 980, 950, 229, 254 |

Cada item entra com o lado maior em 150 px de unidade (165 px na agulha).

## `trem.png` (x, y, w, h)

| peça | caixa | observação |
|---|---|---|
| wagon | 5, 152, 340, 167 | a parede da frente começa 38 px abaixo do topo (linhas escuras do aro em 192–193); o jogo desenha o vagão inteiro atrás da carga e de novo recortado (`setCrop`) dali para baixo na frente |
| engine | 359, 70, 337, 257 | de frente para a direita; chaminé em (231, 5) da caixa |
| link | 5, 549, 339, 123 | vagão-corrente, só no N3 |

## Fundo, em coordenadas de 1280 × 720

| peça pintada | onde |
|---|---|
| boca do funil | (639, 145) |
| pivô da agulha | (639, 320) |
| pontas do Y | (383, 475) e (896, 475) — são os centros dos vagões |
| trilho de baixo | rodas em y ≈ 660 |
| sinaleiro | à esquerda, x ≈ 46 (fora do caminho do trem) |
