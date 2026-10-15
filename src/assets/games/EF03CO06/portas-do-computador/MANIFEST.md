# Portas do Computador — assets

| Arquivo | Tamanho | Grade | Situação |
|---|---|---|---|
| `aparelhos.png` | 768 × 512 | 3 × 2 | copiado do Pinball: teclado, microfone, câmera / alto-falante, tela, impressora |
| `pecas.png` | 1024 × 1024 | 4 × 4 | copiado do Pinball; o jogo usa o chip apagado (0) e aceso (1) |
| `bg-mundo.png` | 1672 × 941 | — | entregue em 06/10; o chão fica em y ≈ 650 (na tela, y ≈ 498); calçada à esquerda, jardim à direita |
| `computador.png` | 530 × 742 | — | entregue em 06/10 (medidas abaixo) |
| `informacoes.png` | 1024 × 768 | 4 × 3 (256) | entregue em 06/10: Notinha, Fotinho e Letrinha × andando A, andando B, feliz, tonto, na ordem certa |
| `pessoas.png` | 1050 × 1350 | 3 × 3 (350 × 450) | entregue em 08/10: Vovó, Theo e Professora × esperando, feliz, confusa. Em uso no N2/N3 (quem recebe, à direita) |
| `pedidos.png` | 1050 × 350 | 3 × 1 (350) | entregue em 08/10: orelha, olho, folha. Em uso no N2/N3 (o ícone do balão do pedido) |
| `cover-portas-do-computador.png` | — | — | **falta** |

**Limpeza (08/10/2026):**
- o alfa ≤ 24 foi zerado:
  - `computador`: 2 mil px;
  - `informacoes`: 34 mil px;
  - `pessoas`: 56 mil px;
  - `pedidos`: 4 mil px;
- pontinhos soltos foram apagados;
- os originais estão no scratchpad da sessão (`portas-originais/`);
- as "manchas vermelhas" que aparecem na pré-visualização sobre fundo preto são cor de pixel transparente: sobre fundo claro não aparecem.

**Medidas do `computador.png` (no PNG → na tela, escala 0,8086, base em y 700):**

| Parte | No PNG | Na tela |
|---|---|---|
| corpo | x 18–513 | x 441–841 (`COMPUTER.side` = 200) |
| faixa escura das luzes | y 92–134, x 80–450 | centro em y 191 (`GOAL`) |
| janela de vidro | x 95–440, y 175–535 | centro em (642, 387), 279 × 291 (`WINDOW`) |
| encaixe do processador | centro em (262, 345) | (638, 379) (`CHIP`) |
