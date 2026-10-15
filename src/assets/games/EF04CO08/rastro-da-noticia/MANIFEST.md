# Rastro da Notícia — MANIFEST

Arte chegou em 15/10/2026, na linha **chibi voador** (TEXTURAS.md). Os originais estão em `outputs/rastro-da-noticia/originais/`.

## Limpeza

As cinco folhas com alfa (`detetive`, `lia`, `predios`, `logos`, `ui`) tinham uma névoa de pixels com alfa ≤ 24, que aparecia como pontinhos vermelhos no preto. Esses pixels foram zerados, e o resto não mudou. Nenhuma folha vaza para a célula vizinha: as corridas de colunas param antes de cada divisa.

## Medidas

O jogo mede a caixa alfa de cada célula na carga (`addFrames`, limiar 96), então o tamanho da folha pode mudar sem mexer no código.

| Arquivo | Tamanho | Célula | Observação |
|---|---|---|---|
| `detetive.png` | 1600 × 960 | 400 × 480 (pedido 320 × 400) | 4 × 2, ordem certa. Altura de referência do quadro 0 = 465. Andar 1–4: contato, passagem, contato, passagem |
| `lia.png` | 1600 × 960 | 400 × 480 | 4 × 2, ordem certa. O quadro 6 (feliz) já vem pulando: a caixa termina 31 px acima do fundo |
| `predios.png` | 1536 × 1024 | 512 × 512 (pedido 480 × 520) | 3 × 2. As fachadas não vêm centradas (a 1 e a 4 encostam à esquerda), por isso cada uma é ancorada pela própria caixa alfa e não pela célula |
| `logos.png` | 1024 × 512 | 256 × 256 | 4 × 2 |
| `ui.png` | 1024 × 512 | 256 × 256 | 4 × 2. O botão largo (2) é 246 × 110 (≈ 2,2 : 1, não 3 : 1) |
| `rua.png` | 1672 × 941 | — | opaco. O jogo repete com escala 720/941; o meio-fio fica em y ≈ 715–745 (548–570 na tela) e os pés pisam a calçada em 590 |
| `patio.png` | 1672 × 941 | — | opaco, esticado para 1280 × 720 (mesma proporção) |

### Tela e placa de cada fachada (px da célula de 512)

Medidas por preenchimento a partir do miolo creme (`FACADE.boards` em `data/layout.ts`). Na tela vale a caixa inteira menos 2 px; na placa, só a faixa reta, porque o alto das placas é arqueado.

| Célula | Site | Tela [x, y, w, h] | Placa [x, y, w, h] |
|---|---|---|---|
| 0 | Jornal do Bairro | 120, 215, 277, 117 | 126, 138, 265, 49 |
| 1 | Blog da Tia Nena | 76, 226, 302, 111 | 93, 159, 269, 40 |
| 2 | Grupo da Turma | 84, 220, 351, 133 | 86, 141, 345, 53 |
| 3 | Canal TopTudo | 112, 214, 302, 105 | 106, 136, 315, 49 |
| 4 | @zumzum | 73, 205, 305, 109 | 79, 127, 293, 49 |
| 5 | Site da Escola | 118, 212, 294, 106 | 133, 145, 265, 42 |

As telas vieram **mais baixas e largas** que o pedido (≈ 2,7 : 1, contra 400 × 224). A página é desenhada numa caixa de 400 de largura com a altura de cada tela e escalada para caber; ao olhar, a câmera aproxima até a tela ter ≈ 520 px (zoom ≈ 1,8).

### Celular (`ui` 3)

Tela clara dentro da caixa alfa (155 × 243), relativa ao centro: x −50, y −97, w 106, h 190 (`SCREEN` em `scenes/phone.ts`). O aparelho vem um pouco inclinado.

## Falta

- `cover-rastro-da-noticia.png` (capa com título) e o og.
