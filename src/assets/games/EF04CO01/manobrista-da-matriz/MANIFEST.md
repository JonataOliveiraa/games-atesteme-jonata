# Manobrista da Matriz — assets

Texturas entregues em 09/10/2026. A capa `cover-manobrista-da-matriz.png` (1672 × 941, com o título) é o `thumbnail` do catálogo, e `public/og/manobrista-da-matriz.jpg` (1200 × 630, 163 KB) foi gerado com os parâmetros do `scripts/gerar-og.mjs`. Os originais, antes da limpeza, estão no scratchpad da sessão (`originais-mm/`). A limpeza zerou o alfa ≤ 24 e não achou manchas soltas.

| Arquivo | Tamanho | Grade | Notas |
|---|---|---|---|
| `bg-patio.png` | 1672 × 941 | — | escalado para 1280 × 720 |
| `carros.png` | 1200 × 1100 | 3 × 2 (400 × 550) | carros de 328 × 484 com retrovisores; o jogo usa `CAR.len` = 84 de comprimento |
| `controles.png` | 1050 × 700 | 3 × 2 (350) | os pedais apertados (células 4 e 5) são mais baixos (≈ 277 contra 319), e o código mantém a escala do solto |
| `pecas.png` | 1400 × 700 | 4 × 2 (350) | o **farol (célula 5) aponta para a DIREITA**, e o código gira −90°; o motorista encosta no alto da célula |

**Medidas do fundo** (na escala 1280):
- **asfalto:** x 200–1081, y 103–651 (`YARD`);
- **saída do portão:** x 958–1030, descendo do asfalto até a borda (`GATE.x` = 994);
- **grama livre:** à esquerda (x < 200) ficam a plaquinha da convenção e o volante; à direita (x > 1081), o ESTACIONAR e os pedais.

**A grade cabe no asfalto:** vagas de 130 × 96, corredor de 82, começando em x 395, y 124. O último corredor termina no meio-fio de baixo (y 651). As placas das colunas ficam no meio-fio de cima (y 100), e as das linhas em x 352.

## Sons (09/10/2026)

Três gravações de motor em loop, entregues pelo usuário: mp3 estéreo, 48 kHz, 2,25 s cada, sem silêncio nas pontas.

**Elas servem para variar o som entre os carros:** cada carro usa uma só. O pedido 1 toca `car1`, o 2 toca `car2`, o 3 toca `car3`, e depois a sequência volta ao começo (`index % ENGINE_VOICES`). O carro da demonstração usa o `car1`.

O som do carro (`engineOn(sound)` / `engineSpeed` em `scenes/audio.ts`) sobe de tom (0,85× a 1,2×) e de volume com a velocidade. Liga quando o carro entra e desliga ao estacionar. O `car1` entra com volume 0,32 e os outros com 0,5, porque ele é bem mais alto (RMS 0,49 contra ≈ 0,30).
