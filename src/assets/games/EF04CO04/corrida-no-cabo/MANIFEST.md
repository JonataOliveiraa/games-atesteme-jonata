# Corrida no Cabo — assets

Entregues em 13/10/2026. Alfa ≤ 24 zerado em todas as folhas (sobra de geração), e uma coluna de 1 px do tubo que vazava para a célula do conector foi apagada. Originais guardados fora do repositório.

| Arquivo | Tamanho | Grade | Células |
|---|---|---|---|
| `pista.png` | 1050 × 700 | 3 × 2 (350) | 0 tubo · 1 conector · 2 portal · 3 brilho 1 · 4 brilho 0 · 5 sinal |
| `aparelhos.png` | 1024 × 512 | 2 × 1 (512) | 0 notebook na mesinha · 1 monitor na mesinha (sem recorte) |
| `pecas.png` | 1024 × 512 | 4 × 2 (256) | 0 carrinho · 1 freando · 2 chaminha · 3 brilho · 4 estrela · 5 coração · 6 sol · 7 foguete |
| `ui1.png` | 1750 × 350 | 5 × 1 (350) | 0 botão 1 · 1 botão 0 · 2 caixinha · 3 painel · 4 cartão |
| `ui2.png` | 1050 × 350 | 1 × 1 | 0 quadro (não usado depois do cabeçalho em faixas; fica como reserva) |
| `car1.mp3` | — | — | motor (copiado do Manobrista) |

## Medidas (na célula da arte)

- **Tubo** (pista 0): faixa y 117–243 (127 px), de borda a borda; miolo claro ≈ y 137–220. Vira a textura `cabo-tubo` com 190 px de altura (`PLAY.tube`).
- **Conector** (pista 1): caixa x 49–308, y 98–263; contatos na ponta direita. Mostrado com 1,06 × a altura do tubo; o carrinho entra nele 40 px depois da boca.
- **Portal** (pista 2): caixa x 87–231, y 16–329. Janelas: de cima y 96–164, de baixo y 187–255 (meio entre elas y 175,5; distância 91); vão horizontal x 126–192 (centro 159). Escala = 2 × `PLAY.lane` / 91. Constantes em `GATE_ART`.
- **Brilhos e sinal** (pista 3–5): recortados com o halo inteiro (`soft`), senão saem quadrados.
- **Notebook** (aparelhos 0): tela x 133–388, y 138–280; entrada do cabo (423, 349); pé da mesa y 506.
- **Monitor** (aparelhos 1): tela x 104–415, y 100–281; entrada do cabo (76, 210); pé da mesa y 505.
- Mesa: escala 0,775, pé no chão (y 690). Entradas na tela: notebook (399, 568), monitor (871, 461).
- **Carrinho** (pecas 0): 245 × 135; mostrado com 96 px de largura (53 de altura, cabe na janela de 51 px do portal).
- **Cartão e painel** (ui1 4 e 3): esticados pelo meio (nineslice) com cantos de 46/56 px e escala 0,4/0,5.
