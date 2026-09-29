# Manifesto de assets — Subida do Dia

Entrega N1. Medidas de alfa usam limiar `alpha > 16`. `dx`, `dy`, `base` e `footPad` são locais à célula; `originX = (dx + w/2) / frameWidth`. PNGs transparentes foram limpos e comprimidos com Sharp/Lanczos3. `problemas-4.png` não faz parte deste escopo.

## Arquivos

| arquivo | tamanho | grade | frame | alfa | peso |
|---|---:|---:|---:|---|---:|
| `crianca.png` | 1152×768 | 3×2 | 384×384 | transparente | 567.965 B |
| `pecas.png` | 1280×640 | 4×2 | 320×320 | transparente | 304.789 B |
| `passos.png` | 1536×1280 | 6×5 | 256×256 | transparente | 1.119.164 B |
| `problemas-1.png` | 1280×1024 | 5×4 | 256×256 | transparente | 890.845 B |
| `problemas-2.png` | 1280×1024 | 5×4 | 256×256 | transparente | 244.010 B |
| `problemas-3.png` | 1280×1024 | 5×4 | 256×256 | transparente | 652.239 B |
| `bg-papel.png` | 1280×720 | peça única | — | opaco, alfa 255 | 609.610 B |
| `cover-subida-do-dia.png` | 1672×941 | peça única | — | opaco, alfa 255 | 1.591.261 B |

O fundo foi reescalado diretamente para 16:9, sem corte. A capa permaneceu em seu tamanho final e conserva o título exato “Subida do Dia”. Os nomes em português foram mantidos por serem o contrato já declarado em `TEXTURAS.md` e no loader.

## Escalas e validações de empacote

- Criança: escala única `0,6505050505`; frames verticais com base em `y=360`, exceto `slide`, centralizado pela ação. `climb-a` e `climb-b` ficam em perfil 3/4 olhando/subindo para a esquerda, com mãos e joelhos alternados.
- Peças: trilhos normalizados a 320 px de altura e emenda vertical idêntica (`diferença absoluta` entre primeira e última scanline = `0`); degraus normalizados em conjunto para caixa 290×179; cadeado e mão-guia limitados pela mesma regra de 268 px na maior dimensão.
- Passos: escala única `0,9184549356`.
- Problemas 1: escala única `0,7508771930`.
- Problemas 2: escala única `0,7615658363`.
- Problemas 3: escala única `0,7508771930`.
- Todos os itens foram reempacotados inteiros e centralizados. As células declaradas vazias têm alfa zero.
- Revisão de limpeza: removidos traços soltos nas bordas de `problemas-1/2/3`
  e fragmentos residuais entre células de `passos`; células reservadas foram
  novamente verificadas com alfa zero.
- Registro dos quadros novos: `wash-fail-smear` alinhado pela pia aos quadros
  0–4; `bean-fail-buried` e `bean-fail-pool` alinhados pela xícara aos quadros
  10–18; `grandma-fail-gate` alinhado pelo mapa aos quadros 0–4. As bases dos
  objetos fixos ficaram no máximo a 2 px das bases vizinhas.
- Ponta real do indicador em `pecas.png`, quadro 4: `tipX=80`, `tipY=26` (faixa superior de alfa `x=77..83`); sem linhas de clique.

## Medição da folha inteira antes do corte

Corridas visuais usadas para impedir cortes na borda: criança colunas `79–466, 586–959, 1092–1474`, linhas `16–512, 532–994`; peças colunas `63–379, 454–874, 902–1320, 1409–1696`, linhas `0–443, 491–860`; passos X `27–221, 249–434, 463–682, 693–910, 917–1147, 1161–1357`, Y `9–524, 530–731, 749–933, 952–1123`, com corredores próprios para 0/1 e 4–7 por sobreposição vertical; problemas 1 X `25–293, 305–556, 566–834, 848–1112, 1117–1374`, Y `44–276, 304–554, 584–799, 840–1073`; problemas 2 corridas X `29–285, 307–554, 579–821, 854–1099, 1128–1385`, Y `69–287, 606–793`, com corredores de extração X `29,307,579,854,1128,1390` e Y `69,300,561,800,1121`; problemas 3 X `5–278, 287–555, 567–837, 845–1118, 1127–1394`, Y `71–300, 311–528, 646–828, 850–1086`.

## `crianca.png`

| i | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | idle | 68 | 50 | 247 | 311 | 360 | 0,4987 | 23 |
| 1 | climb-a: mão alta à esquerda, joelho à direita | 76 | 38 | 231 | 323 | 360 | 0,4987 | 23 |
| 2 | climb-b: mão alta à direita, joelho à esquerda | 94 | 38 | 196 | 323 | 360 | 0,5000 | 23 |
| 3 | slide | 66 | 52 | 252 | 297 | 348 | 0,5000 | 35 |
| 4 | oops | 70 | 96 | 244 | 265 | 360 | 0,5000 | 23 |
| 5 | cheer | 67 | 62 | 250 | 299 | 360 | 0,5000 | 23 |

## `pecas.png`

| i | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | rails | 23 | 0 | 275 | 320 | 319 | 0,5016 | 0 |
| 1 | rung | 15 | 73 | 290 | 175 | 247 | 0,5000 | 72 |
| 2 | rung-hollow | 15 | 73 | 290 | 175 | 247 | 0,5000 | 72 |
| 3 | lock | 51 | 26 | 218 | 268 | 293 | 0,5000 | 26 |
| 4 | guide-hand | 61 | 26 | 200 | 269 | 294 | 0,5031 | 25 |
| 5 | vazio | — | — | — | — | — | — | — |
| 6 | vazio | — | — | — | — | — | — | — |
| 7 | vazio | — | — | — | — | — | — | — |

## `passos.png`

| i | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | torneira | 44 | 54 | 168 | 148 | 201 | 0,5000 | 54 |
| 1 | espuma | 43 | 68 | 171 | 118 | 185 | 0,5020 | 70 |
| 2 | enxágue | 57 | 29 | 143 | 198 | 226 | 0,5020 | 29 |
| 3 | toalha | 39 | 61 | 178 | 135 | 195 | 0,5000 | 60 |
| 4 | terra, xícara com alça | 48 | 31 | 160 | 195 | 225 | 0,5000 | 30 |
| 5 | furo, xícara com alça | 44 | 45 | 169 | 168 | 212 | 0,5020 | 43 |
| 6 | feijão, xícara com alça | 61 | 28 | 135 | 201 | 228 | 0,5020 | 27 |
| 7 | regar, xícara com alça | 43 | 35 | 170 | 196 | 230 | 0,5000 | 25 |
| 8 | portão | 25 | 28 | 194 | 200 | 227 | 0,4766 | 28 |
| 9 | ponte | 28 | 23 | 200 | 210 | 232 | 0,5000 | 23 |
| 10 | padaria | 27 | 24 | 202 | 208 | 231 | 0,5000 | 24 |
| 11 | quadrado | 56 | 56 | 145 | 145 | 200 | 0,5020 | 55 |
| 12 | triângulo sobre quadrado | 55 | 43 | 146 | 171 | 213 | 0,5000 | 42 |
| 13 | porta | 37 | 39 | 154 | 158 | 196 | 0,4453 | 59 |
| 14 | dobra ao meio | 21 | 51 | 195 | 154 | 204 | 0,4629 | 51 |
| 15 | dobra cantos | 32 | 47 | 193 | 136 | 182 | 0,5020 | 73 |
| 16 | dobra barra | 25 | 44 | 205 | 142 | 185 | 0,4980 | 70 |
| 17 | põe papel | 40 | 48 | 178 | 132 | 179 | 0,5039 | 76 |
| 18 | abre tinta | 41 | 53 | 174 | 149 | 201 | 0,5000 | 54 |
| 19 | molha pincel | 80 | 34 | 95 | 169 | 202 | 0,4980 | 53 |
| 20 | pinta flor | 33 | 58 | 190 | 139 | 196 | 0,5000 | 59 |
| 21 | meia | 46 | 47 | 165 | 162 | 208 | 0,5020 | 47 |
| 22 | tênis | 41 | 44 | 174 | 169 | 212 | 0,5000 | 43 |
| 23 | laço | 40 | 44 | 176 | 169 | 212 | 0,5000 | 43 |
| 24 | pão | 49 | 56 | 159 | 142 | 197 | 0,5020 | 58 |
| 25 | abre requeijão | 49 | 50 | 158 | 158 | 207 | 0,5000 | 48 |
| 26 | espalha | 35 | 59 | 185 | 137 | 195 | 0,4980 | 60 |
| 27 | fecha sanduíche | 49 | 50 | 160 | 158 | 207 | 0,5039 | 48 |
| 28 | vazio | — | — | — | — | — | — | — |
| 29 | vazio | — | — | — | — | — | — | — |

## `problemas-1.png`

| i | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | mãos sujas | 23 | 41 | 189 | 174 | 214 | 0,4590 | 41 |
| 1 | água | 33 | 40 | 190 | 174 | 213 | 0,5000 | 42 |
| 2 | espuma | 24 | 40 | 188 | 175 | 214 | 0,4609 | 41 |
| 3 | enxaguada | 25 | 40 | 189 | 175 | 214 | 0,4668 | 41 |
| 4 | seca | 32 | 40 | 193 | 176 | 215 | 0,5020 | 40 |
| 5 | toalha-espuma | 27 | 41 | 203 | 174 | 214 | 0,5020 | 41 |
| 6 | sabão-sem-água | 30 | 41 | 184 | 174 | 214 | 0,4766 | 41 |
| 7 | wash-fail-smear | 26 | 43 | 197 | 172 | 214 | 0,4863 | 41 |
| 8 | bean-fail-buried | 14 | 41 | 194 | 155 | 195 | 0,4336 | 60 |
| 9 | vazio | — | — | — | — | — | — | — |
| 10 | copo vazio | 48 | 64 | 160 | 130 | 193 | 0,5000 | 62 |
| 11 | terra | 48 | 63 | 160 | 131 | 193 | 0,5000 | 62 |
| 12 | furo | 49 | 63 | 160 | 131 | 193 | 0,5039 | 62 |
| 13 | feijão | 47 | 63 | 160 | 131 | 193 | 0,4961 | 62 |
| 14 | molhado | 48 | 47 | 160 | 162 | 208 | 0,5000 | 47 |
| 15 | broto | 47 | 49 | 162 | 157 | 205 | 0,5000 | 50 |
| 16 | feijão seco sobre terra molhada | 43 | 53 | 169 | 149 | 201 | 0,4980 | 54 |
| 17 | só terra molhada | 49 | 42 | 158 | 170 | 211 | 0,5000 | 44 |
| 18 | feijão expulso | 35 | 44 | 186 | 166 | 209 | 0,5000 | 46 |
| 19 | bean-fail-pool | 43 | 69 | 171 | 126 | 194 | 0,5020 | 61 |

## `problemas-2.png`

| i | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | peças | 20 | 79 | 189 | 100 | 178 | 0,4473 | 77 |
| 1 | quadrado | 24 | 70 | 184 | 116 | 185 | 0,4531 | 70 |
| 2 | +telhado | 22 | 47 | 185 | 164 | 210 | 0,4473 | 45 |
| 3 | casa | 33 | 44 | 189 | 168 | 211 | 0,4980 | 44 |
| 4 | triângulo tombado | 35 | 70 | 186 | 116 | 185 | 0,5000 | 70 |
| 5–9 | vazios | — | — | — | — | — | — | — |
| 10 | folha lisa | 31 | 85 | 195 | 86 | 170 | 0,5020 | 85 |
| 11 | meio/retângulo com dobra superior | 43 | 90 | 169 | 76 | 165 | 0,4980 | 90 |
| 12 | cantos superiores ao centro, faixa inferior solta | 57 | 56 | 143 | 143 | 198 | 0,5020 | 57 |
| 13 | chapéu triangular com barra dobrada | 42 | 76 | 172 | 104 | 179 | 0,5000 | 76 |
| 14 | avião | 30 | 62 | 196 | 132 | 193 | 0,5000 | 62 |
| 15–19 | vazios | — | — | — | — | — | — | — |

## `problemas-3.png`

| i | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | mapa/criança em casa | 23 | 50 | 201 | 157 | 206 | 0,4824 | 49 |
| 1 | no portão | 21 | 44 | 202 | 170 | 213 | 0,4766 | 42 |
| 2 | na ponte | 23 | 43 | 203 | 170 | 212 | 0,4863 | 43 |
| 3 | na vovó | 21 | 43 | 205 | 170 | 212 | 0,4824 | 43 |
| 4 | no rio | 27 | 44 | 201 | 170 | 213 | 0,4980 | 42 |
| 5 | grandma-fail-gate | 18 | 44 | 209 | 168 | 211 | 0,4785 | 44 |
| 6–9 | vazios | — | — | — | — | — | — | — |
| 10 | pé | 64 | 68 | 128 | 119 | 186 | 0,5000 | 69 |
| 11 | meia | 62 | 66 | 131 | 125 | 190 | 0,4980 | 65 |
| 12 | tênis solto | 49 | 59 | 157 | 137 | 195 | 0,4980 | 60 |
| 13 | tênis amarrado | 42 | 62 | 173 | 131 | 192 | 0,5020 | 63 |
| 14 | tênis sem meia | 50 | 60 | 156 | 134 | 193 | 0,5000 | 62 |
| 15 | meia por cima do tênis | 47 | 61 | 160 | 136 | 196 | 0,4961 | 59 |
| 16 | meia com laço flutuando | 52 | 40 | 152 | 174 | 213 | 0,5000 | 42 |
| 17–19 | vazios | — | — | — | — | — | — | — |

## Cores amostradas

Paleta dominante medida por pixel opaco e quantizada em passos RGB de 8 para casar `Graphics` sem perseguir ruído de antialiasing:

| arquivo | amostras dominantes |
|---|---|
| `crianca.png` | `#F8F8C0`, `#FFF8C0`, `#380810`, `#400010` |
| `pecas.png` | `#FFF8C0`, `#F8F8C0`, `#380818` |
| `passos.png` | `#F8F0C0`, `#F8F0C8`, `#280008`, `#F8D8A0` |
| `problemas-1.png` | `#F8F8C8`, `#F8F0C0`, `#200000`, `#280000` |
| `problemas-2.png` | `#F8F0C0`, `#F8F0B8`, `#F8D860`, `#F89898`, `#381010` |
| `problemas-3.png` | `#F8F0C0`, `#F8F8C0`, `#B0D8F0`, `#F8F0B8` |
| `bg-papel.png` | `#FFF8C0`, `#FFF8E0`, `#481828`; GetPixel `(640,400)=#FDF9C3`, linha `(640,638)=#52282E` |
| `cover-subida-do-dia.png` | `#FFF8C8`, `#400808`, `#FFF8D0` |
