# Nave Multiuso — medidas da arte entregue

Medido com `sharp` (caixa do alfa > 40 em cada célula). Estas medidas valem no
lugar dos números do TEXTURAS, que eram o pedido. O código lê os valores em
`data/files.ts`.

| Arquivo | Tamanho | Grade | Célula |
|---|---|---|---|
| `nave.png` | 1350 × 600 | 3 × 1 | 450 × 600 |
| `zuri.png` | 1650 × 700 | 3 × 1 | 550 × 700 |
| `coisas.png` | 1400 × 1050 | 4 × 3 | 350 × 350 (a célula 6 é vazia) |
| `pecas.png` | 900 × 600 | 3 × 2 | 300 × 300 |
| `cenario.png` | 1200 × 900 | 4 × 3 | 300 × 300 (conteúdo de 230 a 280 px, perto do centro; a célula 11, a cerca, tem só 45 px de largura) |

## `nave.png`

- conteúdo: x 11–435, y 34–560, centro em (224, 297);
- bico: topo em **y 34**, centrado em x ≈ 223;
- motores: centros em x ≈ 150 e 296, a ±73 do meio, terminando em **y 560**;
- o funil do assoprador saiu **verde** e foi **recolorido para ciano** por
  script (só os pixels verdes de y < 260, matiz 196°), para casar com o botão e
  com a faixa. O original está em `outputs/nave-multiuso/nave-original.png`.

## `zuri.png`

O conteúdo vai de y ≈ 153 até a borda de baixo (698), e as larguras mudam por
célula: 489, 449 e 477. Na célula 2, o punho sobe até y 100.

## `coisas.png`

Larguras do conteúdo:

| Célula | Largura |
|---|---|
| 0 (folhas) | 287 |
| 1 (flor) | 115 |
| 2 (fogo) | 312 |
| 3 (árvore salva) | 249 |
| 4 (ovelha) | 198 |
| 5 (ovelha feliz) | 232 |
| 7 (folhas molhadas) | 297 |
| 8 (fogo grande) | 330 |
| 9 (ovelha molhada) | 263 |
| 10 (ovelha tonta) | 219 |
| 11 (folha) | 245 |

Os centros caem a até 15 px do meio da célula. O jogo exibe tudo a 0,5×.

## `pecas.png`

Os ícones têm de 160 a 285 px, centrados perto de (150, 160). Na tela ficam a
0,34× nos botões das ferramentas e a 0,28× nas setas.

## `coisas-espaco.png`, `coisas-lua.png` e `cenario-espaco.png`

As três vieram em 1400 × 1050 (células de 350). Problemas da entrega:
- as labaredas do robô (`coisas-lua` 2 e 8) e o anel do planeta
  (`cenario-espaco` 0) **passavam da borda da célula**;
- havia **sujeira solta** em volta das bolhas dos coelhinhos e da nebulosa.

**Reempacotadas por script** (`outputs/nave-multiuso/*-original.png` guarda os
originais). O script:
1. separa as manchas conectadas;
2. em cada célula, mantém o desenho principal e o que está a até 40 px dele;
3. descarta manchas menores que 10 px;
4. recentra tudo em **células de 420 × 420** (folhas de 1680 × 1260).

O tamanho do desenho na tela não mudou: `SCENERY_UNIT.space` usa 256/350, e as
coisas continuam a 0,5×. Na `coisas-lua`, um resto de brilho colado nas bolhas
dos coelhinhos 5 e 9 ficou, porque está encostado no desenho.

`cenario-lua.png` ainda não foi entregue: o código usa o desenho de reserva.
