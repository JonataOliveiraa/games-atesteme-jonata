# Manifesto — Rota do Busão

Medido em 05/10/2026 com `sharp` (componentes conectados, alfa > 24), direto dos
PNGs entregues. Os tamanhos diferem do TEXTURAS.md, e o jogo **não reempacota**:
carrega cada folha como imagem e cria os quadros pelas caixas abaixo
(`data/files.ts`, `addFrames` na `BootScene`).

| arquivo | entregue | pedido | uso |
|---|---|---|---|
| `bg-rua.png` | 1672 × 941 | 1280 × 720 | fundo, escala 0,7656 |
| `cenario.png` | 1400 × 700 (4 × 2 de 350) | 2048 × 1024 (512) | 8 quadros por caixa medida |
| `onibus.png` | 1100 × 700, **sem grade** | 2048 × 1024 (2 × 2) | 4 quadros por caixa medida |
| `passageiros.png` | 1024 × 1024 (4 × 4 de 256) | igual | 14 quadros por caixa medida |
| `situacoes.png` | 1024 × 1024 (4 × 4 de 256) | igual | 14 quadros por caixa medida |
| `cover-rota-do-busao.png` | 1672 × 941 | igual | capa do catálogo e `public/og/rota-do-busao.jpg` (1200 × 630, 120 KB) |

## `onibus.png` (x, y, w, h)

| peça | caixa | dentro da caixa |
|---|---|---|
| bus | 22, 188, 517, 155 | de frente para a direita; 6 janelas (vidro de 40 px) com centro em x 57, 109, 161, 213, 265, 317 e y 58; porta (vidro) em 349, 36, 56 × 104; caixas de roda com centro em (94, 148) e (290, 148), roda de 76 px |
| stop | 692, 125, 284, 226 | placa em branco em 71, 60, 142 × 52 (larga e baixa: leva só a frase; a cena vai num cartão acima do ponto) |
| wheel | 203, 474, 130, 128 | calota de 5 parafusos |
| terminal | 647, 478, 395, 218 | arco com bandeirinhas |

## `cenario.png` (x, y, w, h)

houseA 13, 101, 331, 246 · houseB 410, 63, 259, 288 · houseC 709, 96, 338, 253 ·
tree 1124, 67, 230, 283 · school 0, 424, 345, 274 · market 389, 471, 293, 228 ·
square 727, 423, 306, 274 · lamp 1172, 425, 135, 275. O pé de todos fica na
base da caixa.

## `passageiros.png` (x, y, w, h)

| | | | |
|---|---|---|---|
| clock 26, 37, 199, 211 | fridge 299, 20, 182, 231 | speaker 544, 38, 208, 214 | phone 826, 30, 168, 223 |
| tv 7, 266, 234, 186 | microwave 246, 289, 226, 160 | computer 534, 310, 211, 196 | projector 789, 373, 226, 133 |
| camera 7, 573, 243, 193 | cardMachine 306, 514, 177, 231 | scale 540, 579, 221, 184 | trafficLight 844, 535, 128, 230 |
| pencil 68, 783, 117, 239 | wateringCan 263, 837, 248, 186 | — | — |

## `situacoes.png`

Grade limpa de 256, cada cena em ~247 × 247 a partir de (7 + 254·col, 7 + 254·lin),
com pequenos desvios medidos em `data/files.ts`. O Davi é o mesmo em todas, e
nenhuma cena mostra o aparelho que resolve.

## Fundo, em coordenadas de 1280 × 720

| faixa | y |
|---|---|
| telhados ao longe | ~420–498 |
| calçada | 499–579 |
| meio-fio | 580–587 |
| rua | 588–720 |
