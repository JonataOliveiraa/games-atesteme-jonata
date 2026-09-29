# Pescaria dos Códigos — manifesto das texturas

## Convenções de medição

- Coordenadas dos sprites são **locais à célula**, com origem `(0, 0)` no canto superior esquerdo.
- Caixas usam `[xMin, yMin, xMax, yMax]`, com limites inclusivos.
- Medições do fundo usam coordenadas globais da imagem.
- O alfa útil foi medido com `alpha >= 16`. Alfa abaixo disso foi removido; componentes isolados sem função visual também foram descartados.
- As folhas foram verificadas primeiro por ocupação de colunas na imagem inteira e depois por caixa de cada célula. Os sprites foram apenas transladados em pixels inteiros para centralização, sem escala ou redesenho.
- Em `peixes.png`, “largura do corpo” é a largura da componente alfa principal completa (inclui cauda, nadadeiras e keyline; exclui brilhos separados).
- O centro e o diâmetro da mancha usam a região branca pura do preenchimento. O diâmetro é a média dos diâmetros horizontal e vertical dessa região.

## Arquivos

| Arquivo | Tamanho | Grade/célula | Estado |
|---|---:|---:|---|
| `bg-lago.png` | 1280 × 720 | — | opaco, preservado |
| `barco.png` | 1536 × 1024 | 3 × 2 / 512 × 512 | alfa limpo, poses centralizadas |
| `peixes.png` | 1152 × 768 | 3 × 2 / 384 × 384 | ilhas removidas, poses centralizadas |
| `pecas.png` | 1280 × 960 | 4 × 3 / 320 × 320 | ilhas removidas, peças centralizadas |
| `cover-pescaria-dos-codigos.png` | 1672 × 941 | — | opaco, preservado |

## Ocupação por colunas da folha inteira

Intervalos inclusivos, medidos com `alpha >= 16`.

| Folha | Antes | Depois |
|---|---|---|
| `barco.png` | 22–509; 534–1019; 1046–1527 | 12–499; 525–1010; 1039–1520 |
| `peixes.png` | 26–373; 405–751; 772–1125 | 18–365; 403–749; 783–1136 |
| `pecas.png` | 32–318; 350–617; 686–947; 1021–1234 | 17–303; 346–613; 669–930; 1013–1226 |

Nenhuma ocupação atravessa os cortes verticais de célula: `512/1024` no barco, `384/768` nos peixes e `320/640/960` nas peças.

## `barco.png`

“Linha d'água” é a base alfa do casco. “Ponta da vara” é o extremo direito da componente principal. “Topo do mastro” é o extremo superior. A caixa útil da vela é a maior região creme contínua, livre do contorno.

| Pose | Caixa alfa | Linha d'água Y | Ponta da vara `(x,y)` | Topo do mastro `(x,y)` | Caixa útil da vela |
|---:|---|---:|---|---|---|
| 0 `boat-idle` | [13, 55, 498, 457] | 457 | (498, 256) | (269, 55) | [40, 104, 255, 346] |
| 1 `boat-cast` | [13, 55, 498, 457] | 457 | (498, 256) | (269, 55) | [40, 104, 255, 346] |
| 2 `boat-reel` | [15, 55, 496, 457] | 457 | (496, 265) | (270, 55) | [42, 104, 256, 346] |
| 3 `boat-cheer` | [12, 55, 499, 457] | 457 | (499, 260) | (268, 55) | [39, 104, 254, 346] |
| 4 `boat-oops` | [14, 55, 497, 457] | 457 | (497, 259) | (270, 55) | [41, 104, 256, 346] |
| 5 reservada | vazia | — | — | — | — |

## `peixes.png`

Nas poses 2 e 4, “boca” é o ponto superior da silhueta/keyline usado como âncora do anzol.

| Pose | Caixa alfa do corpo | Centro da mancha `(x,y)` | Diâmetro da mancha | Boca `(x,y)` | Largura do corpo |
|---:|---|---|---:|---|---:|
| 0 `fish-swim-a` | [25, 72, 359, 311] | (192, 207) | 92 px | — | 335 px |
| 1 `fish-swim-b` | [19, 75, 365, 309] | (201, 205) | 90 px | — | 347 px |
| 2 `fish-hooked` | [64, 41, 319, 342] | (196.5, 203.5) | 83 px | (211, 41) | 256 px |
| 3 `fish-happy` | [18, 71, 365, 305] | (201, 197.5) | 92.5 px | — | 348 px |
| 4 `fish-yuck` | [62, 36, 321, 348] | (195, 201) | 85 px | (220, 36) | 260 px |
| 5 `fish-gold` | [15, 72, 354, 312] | sem mancha | — | — | 340 px |

## `pecas.png`

| Célula | Nome | Caixa alfa |
|---:|---|---|
| 0 | `board` | [17, 53, 303, 267] |
| 1 | `drum` | [43, 35, 277, 284] |
| 2 | `mark` | [46, 46, 274, 274] |
| 3 | `hook` | [79, 32, 240, 288] |
| 4 | `bucket` | [33, 41, 286, 279] |
| 5 | `fig-sun` | [26, 29, 293, 290] |
| 6 | `fig-fish` | [29, 64, 290, 255] |
| 7 | `fig-banana` | [53, 41, 266, 278] |
| 8 | `rattle` | [54, 27, 266, 293] |
| 9 | `drop` | [68, 32, 251, 287] |
| 10 | `guide-hand` | [52, 19, 268, 301] |
| 11 | reservada | vazia |

- Célula 2, círculo branco: **229 px** de diâmetro alfa.
- Célula 10, ponta do indicador: **`tipX = 81`, `tipY = 19`**.

## `bg-lago.png`

| Marco | Medida global |
|---|---:|
| Linha d'água (centro visual) | `y = 354` |
| Faixa completa da ondulação da linha d'água | `y = 352–368` |
| Tampo do píer | `y = 313` |
| Início esquerdo do píer | `x = 1038` |

## Limpeza e empacotamento

- `barco.png`: removida a névoa cinza/escura semitransparente de baixo alfa e os pixels exteriores sem função; keyline, coração e brilhos intencionais preservados.
- `peixes.png` e `pecas.png`: removidas ilhas pequenas e pixels soltos; brilhos dos peixes e marcas de som do tambor preservados.
- Todos os objetos foram centralizados por sua caixa útil agregada dentro da própria célula.
- As células reservadas do barco (5) e das peças (11) estão integralmente transparentes.
