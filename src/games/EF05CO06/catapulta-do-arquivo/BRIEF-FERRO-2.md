# Brief do Ferro 2 — borda do chão e túneis com textura

Pedido do usuário: *"melhore a textura do mapa (e sua grama), a grama está sendo feita no graphics e nao parece bonita"*. Os prompts estão no `TEXTURAS.md` §14 e §15; a Aquarela está gerando e a Tesoura vai publicar. Faça o código já, com fallback.

## Contrato das peças novas

- `borda-campo.png`, `borda-praia.png`, `borda-serra.png` — **512 × 96, alfa**, repetível na horizontal. **A linha do chão fica em y = 36** do PNG: acima, tufos/montinhos; abaixo, a camada (até ~y 84) com borda de baixo irregular e transparente.
- `tunel-campo.png`, `tunel-praia.png`, `tunel-serra.png` — **128 × 256, opaco**, repetível na vertical.

## O que fazer

1. `data/files.ts`: `SCENERY[s]` ganha `edge` e `tunnel` (as chaves acima). Constantes `EDGE = { w: 512, h: 96, line: 36 }`.
2. `scenes/stage.ts`:
   - **borda**: troque os `strokePoints` de grama por `Phaser.GameObjects.Rope` com a textura da borda, seguindo cada linha do `map.ground`. A textura tem de **repetir** (não esticar): reamostre cada polilinha em pontos a cada ~16 px e corte em pedaços de 512 px de comprimento de arco, uma `Rope` por pedaço (a última, mais curta, usa só a parte do PNG que cabe: recorte de frame ou ajuste de UV). Os pontos ficam deslocados pela normal para que o **y 36 do PNG caia sobre a linha do chão** (a Rope centra a textura no caminho: desloque `48 − 36 = 12 px` para baixo na direção da normal). Nas quinas, a dobra da Rope basta; confira que não abre buraco nem fica dente feio (se ficar, arredonde a polilinha com um ou dois pontos extras na quina).
   - Nas bocas dos buracos a borda termina na quina (como hoje).
   - **túnel**: troque os `fillRect` dos túneis por um `TileSprite` com `tunnel` (largura da boca, do topo da boca até o fundo), com as duas linhas de contorno que já existem por cima. Mantenha a profundidade de desenho atual.
   - Mantenha o que for `Graphics` só para o contorno fino (a linha escura do chão pode sair se a borda já tiver contorno; veja como fica com o fallback e com o PNG).
3. `scenes/fallback.ts`: asse as 6 texturas novas em `Graphics`, com o mesmo contrato (borda com y 36 de linha, tufos arredondados em cima, camada de 40 px com borda de baixo ondulada; túnel escuro com pedrinhas), para o jogo ficar bonito mesmo sem PNG.
4. **Performance:** tudo assado/estático; nada redesenhado por quadro. Mapas de até 3000 px: confira quantas Ropes nascem (deve ficar em dezenas, não centenas).
5. Atualize o §5 do `PLANEJAMENTO.md` com os mapas novos do N1 (você comentou que está desatualizado) e acrescente no §6/§9 uma linha sobre a borda em Rope.

**Não mexa em:** `scenes/GameScene.ts`, `scenes/ball.ts`, `scenes/catapult.ts`, `scenes/order.ts`, `scenes/guide.ts`, `scenes/targets.ts`, `scenes/tap.ts`, `data/words.ts`, `data/levels.ts`, `data/layout.ts` (se precisar de constante de layout, ponha em `files.ts` ou me peça).

Rode `npx tsc --noEmit -p .` e responda com `maestri ask "Claude Code #4" "<resultado>"`.
