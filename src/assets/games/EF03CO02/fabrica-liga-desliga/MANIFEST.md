# Manifesto — Fábrica Liga-Desliga

Medido em 05/10/2026 com `sharp` (componentes conectados, alfa > 24), direto dos
PNGs entregues. Os tamanhos diferem do TEXTURAS.md, e o jogo **não reempacota**:
carrega cada folha como imagem e cria os quadros pelas caixas abaixo
(`data/files.ts`, `addFrames` na `BootScene`).

| arquivo | entregue | pedido | uso |
|---|---|---|---|
| `bg-fabrica.png` | 1672 × 941 | 1280 × 720 | fundo, escala 0,81 (ver "Fundo, no jogo") |
| `forno.png` | 1200 × 500 (2 × 1 de 600 × 500) | 1024 × 512 | 2 quadros por caixa medida; **o forno veio sem rosto**; desde 05/10/2026 com os **dois túneis abertos** (sem o fundo) |
| `forno-entrada.png` | 1200 × 500, a mesma tela do `forno.png` | — (pedido pelo usuário) | o **fundo dos 4 túneis** (entrada e saída de cada forno), recortado pelas **mesmas caixas** do `forno.png` |
| `pecas.png` | 1200 × 1200 (4 × 4 de 300) | 1024 × 1024 (256) | 15 quadros por caixa medida |
| `cover-fabrica-liga-desliga.png` | 1672 × 941 | igual | capa do catálogo e `public/og/fabrica-liga-desliga.jpg` (1200 × 630, 111 KB) |

## `forno.png` (x, y, w, h)

| peça | caixa | dentro da caixa |
|---|---|---|
| ovenLit | 26, 29, 551, 467 | janela da porta com centro em (279, 306); chão dos túneis em y ≈ 378 |
| ovenOut | 630, 29, 549, 467 | o mesmo forno, janela escura |

**Duas camadas.** O `forno-entrada.png` vai **atrás** da massa e dos biscoitos (profundidade 5,5) e o `forno.png` **na frente** (10), no mesmo lugar, escala e quadro. Assim a bolinha aparece dentro do túnel, atrás do arco, e some atrás do corpo do forno. As duas camadas trocam de quadro, pulam e tremem juntas.

No jogo, o forno entra em escala 0,72, com o topo em y 191 e centrado em x 640:
o chão dos túneis bate na esteira (y 463) e a chaminé fica abaixo da ficha.

## `pecas.png` (x, y, w, h)

| | | | |
|---|---|---|---|
| dough 28, 78, 245, 214 | cookie 324, 91, 257, 199 | tray 603, 140, 308, 119 | switchOff 952, 50, 231, 253 |
| switchOn 36, 316, 231, 258 | chef 316, 315, 292, 282 | iconFlame 646, 338, 211, 241 | iconBelt 909, 373, 278, 190 |
| iconTray 10, 685, 285, 154 | iconWhistle 326, 654, 261, 207 | broken 621, 635, 262, 237 | potFull 911, 636, 283, 225 |
| potHalf 4, 961, 299, 223 | potEmpty 307, 958, 294, 226 | iconPot 623, 970, 267, 199 | — |

**Interruptores.** As duas caixas não têm o mesmo enquadramento: no ligado, a
bolinha vermelha sobe **acima** da caixa. O jogo ancora cada quadro pela base da
caixa (centro x 116; base em y 218 no desligado e 252 no ligado), para a caixa
não pular na troca. A lâmpada cinza fica em (165, 72) no desligado e (165, 95)
no ligado, com raio ~22; o verde é desenhado por cima pelo código.

## Fundo, no jogo

O fundo **não** é esticado para 1280 × 720. Ele entra em escala **0,81**,
deslocado 46 px para a esquerda (`VIEW` no `layout.ts`): assim a esteira, o
forno e as peças ficam maiores, e o que sai da tela é só o suporte do funil, a
ponta da mesinha e 42 px do chão. As posições abaixo já estão nesse enquadramento.

| peça pintada | onde |
|---|---|
| boca do funil | (151, 429) |
| faixa de cima da esteira | y 463–482, de x 76 a 1039 (as ripas que andam são do código) |
| rolos | centros em (77, 502) e (1026, 502) |
| tampo da mesinha | y 495, centro em x 1180 |
| linha do chão | y ≈ 559 |
