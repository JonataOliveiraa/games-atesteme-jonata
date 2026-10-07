# Robôs Famintos — manifesto da arte

Entregue em 06/10/2026. Os originais estão em `outputs/robos-famintos/*-original.png`.

| Arquivo | Chegou | No jogo | O que foi feito |
|---|---|---|---|
| `bg-sala.png` | 1672 × 941 | esticado para 1280 × 720 (× 0,7656) | nada |
| `robos.png` | 1200 × 1200, grade de 300 com peças cruzando a borda | **1280 × 1280, 4 × 4 de 320** | reempacotado por peças conectadas; pé em y 304; cada coluna alinhada pelo centro da barriga |
| `objetos.png` | 1400 × 700, 4 × 2 de 350 | igual | nada; o contrato passou a ser 350 |
| `cover-robos-famintos.png` | 1672 × 941 | catálogo + `public/og/robos-famintos.jpg` (1200 × 630) | entregue 06/10/2026; nada mexido |

## Medidas (em pixels da célula)

**Robôs** (`ROBOT_ART` em `data/files.ts`)
- pé: 304. Altura útil ~270 (topo de 13 a 45, conforme o enfeite da cabeça).
- centro da barriga em x: música 151, os outros 160. É o `originX` do sprite. A coluna da
  música não cabe em 160 sem cortar o fone.
- barriga (o retângulo creme): ~70 × 46. O jogo desenha 66 × 40, centrado no y medido de cada
  quadro (`bellyY`, de 247 a 260), e a tela acompanha a troca de cara.
- boca: ~20 px à esquerda do centro da barriga, y ≈ 178.
- **Os robôs olham para a frente**, e não para a esquerda como o prompt pedia. Ficou assim.

**Objetos** (`*_ART` em `data/files.ts`)
- estilingue: pé 326; capas de menta em (47–126, 79–142) e (227–307, 77–134); elástico preso em
  (100, 110) e (255, 108); repouso do saquinho em (177, 122). A célula 2 (haste da frente) **não
  é usada**: o cartucho fica na frente do estilingue.
- saquinho: centro (173, 208).
- caixa: pé 326; borda da boca y 150.
- cartucho: 293 × 253; janela creme em (61–272, 152–277), centro (166, 214).
- placa: face creme (25–327, 142–236), centro (176, 190).
- caixote: 227 × 215, pé 291.

**Fundo** (coordenadas do jogo)
- plataformas, centro x / pé do robô / borda da tampa: P1 714 / 493 / 476, P2 883 / 439 / 423,
  P3 1044 / 377 / 360, P4 1201 / 314 / 298; largura 165.
- chão (estilingue, caixa, caixotes, queda): y 600.

## Escalas (`data/layout.ts`)

robô 0,7 · estilingue 0,6 · cartucho 0,48 no estilingue, 0,42 voando, 0,16 na fila · caixa 0,43 ·
placa 0,39 · caixote 0,28.

A validação da mira (`validateLevels`) rodou de novo com essas posições: no pior caso, o robô mais
longe recebe 60 puxões amostrados (o mínimo é 10).

## 06/10/2026 — mapas de peças

As plataformas pintadas no fundo saíram do jogo. O `bg-sala.png` daqui é **provisório**: a entrega
com as plataformas cobertas por parede (x 357–820 da própria imagem, em duas cópias a partir de
y 225), chão (x 525–820) e o cano da direita estendido. As medidas de plataforma acima não valem
mais. Falta o fundo novo (TEXTURAS §5) e a folha `cenario.png` (TEXTURAS §6); até lá as peças são
`Graphics`. O caixote do mapa usa a célula 8 de `objetos.png`, caixa (70, 76, 228 × 216).

## 06/10/2026 — fundo novo e `cenario.png`

- `bg-sala.png` novo (1672 × 941), sala vazia, sem plataformas. Substituiu o provisório; nada foi
  mexido. Parede encontra o chão em y ≈ 700 da imagem (536 no jogo); as peças ficam no chão do
  jogo em y 600, à frente da parede. Original em `outputs/robos-famintos/bg-sala-v2-original.png`.
- `cenario.png` chegou em **1024 × 512, 4 × 2 de 256** (pedido: 350). Nada cruza a célula; a 8
  veio vazia, como pedido. Três peças vieram com outra proporção, então o tamanho no jogo seguiu
  a arte (sem esticar):

| peça | caixa na célula (x, y, l × a) | proporção | no jogo |
|---|---|---|---|
| bloco | 3, 77, 249 × 145 | 1,72 | 124 × 72 |
| coluna | 80, 2, 93 × 252 | 1 : 2,71 | 55 × 150 |
| tábua | 10, 114, 237 × 45 | 5,3 (pedido 8,5) | 220 × 42 |
| palco | 6, 82, 245 × 161 | 1,52 | 170 × 112 |
| tambor | 52, 24, 141 × 228 | 1 : 1,62 (pedido 1 : 1,35) | 56 × 90 |
| cano | 4, 90, 249 × 91 | 2,7 (pedido 4,5) | 150 × 55 |
| tijolinho | 29, 80, 199 × 126 | 1,58 | 62 × 39 |

Mapas revalidados: no pior caso o robô mais difícil recebe 78 puxões amostrados (mínimo 10).
