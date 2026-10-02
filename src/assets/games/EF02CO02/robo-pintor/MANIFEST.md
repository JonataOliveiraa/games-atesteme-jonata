# Manifesto de assets — Robô Pintor

Arte entregue em 02/10/2026, na linha **vetor geométrico**. Os originais estão
em `outputs/robo-pintor/raw/`. As medidas usam limiar `alpha > 16`, e as caixas
são locais à célula.

## Arquivos

| arquivo | tamanho | grade | célula | TEXTURAS pedia |
|---|---:|---:|---:|---|
| `bg-quintal.png` | 1672 × 941 | — | — | 1280 × 720 (mesma proporção 16:9; o jogo escala para 1280 × 720) |
| `robo.png` | 900 × 600 | 3 × 2 | 300 × 300 | 3 × 2 de 384 |
| `cerca.png` | 768 × 330 | 3 × 1 | 256 × 330 | 4 × 1 de 256 × 512 (a 4ª célula, vazia, não veio) |
| `pecas.png` | 1200 × 900 | 4 × 3 | 300 × 300 | 4 × 3 de 256 |

A ordem das células bate com o contrato. O código foi ajustado às medidas reais
(`data/files.ts`, `data/layout.ts`), e não houve reempacote.

## `bg-quintal.png` (medido na tela, depois de escalar para 1280 × 720)

- lousa: moldura de (440, 92) a (841, 262); **miolo verde** de (453, 106) a
  (828, 250), que é o `BOARD` do layout;
- a grama começa em y ≈ 318 (o TEXTURAS pedia ≈ 560). A cerca subiu para a base
  em y = 500, e o robô e o gato vieram junto.

## `robo.png`

| célula | pose | caixa (x · y) |
|---|---|---|
| 0 | idle | 40..293 · 29..297 |
| 1 | walk | 6..299 · 28..299 |
| 2 | paint | 46..299 · 31..298 |
| 3 | cheer | 19..296 · 36..299 |
| 4 | oops | 50..299 · 36..297 |
| 5 | puzzled | 0..297 · 37..298 |

- pés em **y = 297** (`ROBOT_CELL.foot`); escala no jogo **0,62** (~165 px);
- o pincel da célula 4 entrava **1 coluna** (x = 600 da folha) na célula 5. A
  coluna foi zerada (x 600–602, linhas 300–599, 55 px) no arquivo do jogo; o
  original está intacto em `outputs/`.

## `cerca.png`

| célula | peça | caixa (x · y) |
|---|---|---|
| 0 | tábua crua | 9..247 · 42..329 |
| 1 | tábua pintada (branca, **sem ripas**) | 32..220 · 43..329 (inclui os respingos) |
| 2 | poste do fim (ripas só à esquerda) | 2..189 · 43..329 |

- a base fica na borda de baixo (**y = 329**), e o topo em y ≈ 42;
- as ripas ficam em **y 143 e 252** e vão de x 9 a 247: **não encostam** na
  borda da célula (faltam 9 px de cada lado). Com `FENCE.scale` 0,66 e passo de
  150 px, as ripas de duas tábuas vizinhas se sobrepõem em ~7 px e a cerca fica
  contínua.

## `pecas.png`

| célula | peça | caixa (x · y) |
|---|---|---|
| 0 | cartão | 30..284 · 58..245 (faixa laranja em y ≈ 208..243) |
| 1 | laço ↻ | 27..260 · 19..275 |
| 2 | pincel | 37..266 · 12..268 |
| 3 | seta de andar | 49..267 · 66..282 |
| 4 | gato dormindo | 35..294 · 69..273 |
| 5 | gato no pulo | 28..271 · 6..296 |
| 6 | respingo (branco) | 38..258 · 51..280 |
| 7 | lata (branca) | 63..251 · 44..273 |
| 8 | dedo do guia | 52..248 · 29..283 — **ponta em (77, 34)** (`HAND`) |
| 9–11 | vazias | — |

- o cartão entra em escala 0,67; o número fica acima e as bolinhas logo abaixo
  dele, fora da faixa laranja;
- a seta de andar é cinza-escura e some no verde da lousa, por isso o código põe
  uma plaquinha clara atrás do pincel e da seta.

## Capa

- `cover-robo-pintor.png` chegou em 02/10/2026: 1672 × 941, com o título
  "Robô Pintor" (circunflexo conferido). Ela é o `thumbnail` do catálogo, e
  `public/og/robo-pintor.jpg` foi gerado dela (1200 × 630, 66 KB, recorte
  `cover`, com o título inteiro dentro).
