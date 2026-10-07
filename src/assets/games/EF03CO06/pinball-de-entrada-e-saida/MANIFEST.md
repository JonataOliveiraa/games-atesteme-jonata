# Pinball de Entrada e Saída — o que chegou (06/10/2026)

| Arquivo | Tamanho | Grade | Célula | Conteúdo |
|---|---|---|---|---|
| `bg-fliperama.png` | 1672 × 941 | — | — | opaco; fliperamas nas bordas, parede lisa no meio, piso em y ≈ 700 |
| `mesa.png` | 598 × 657 | — | — | a mesa vazia, em **trapézio** (mais estreita em cima), tampo verde-água com circuito |
| `aparelhos.png` | 768 × 512 | 3 × 2 | 256 | teclado, microfone, câmera / alto-falante, tela apagada, impressora sem papel |
| `pecas.png` | 1024 × 1024 | 4 × 4 | 256 | chegou como `Sprite-0021.png` e foi **renomeado**; ordem certa |
| `lily.png` | 1200 × 960 | 4 × 3 | 300 × 320 | **a personagem virou a Lily** (menina loira, laço verde) no lugar do Nino; 10 poses na ordem, sem aparelho em nenhuma |

**Absorvido no código:**
- a folha da personagem passou a ser `lily` (`data/files.ts`);
- os textos e o crachá dizem **Lily** (`data/words.ts`, `scenes/art.ts`, catálogo e `gameInstructions`);
- a tela do monitor foi medida: centro em (0,527; 0,355) da caixa, com 80 % × 57 % (`SCREEN_AREA`);
- os aparelhos passaram a 118 px;
- a Lily ficou com 372 px, e o balão desceu para y 214.

**Limpeza feita na entrega:** alfa ≤ 24 zerado (49 mil px nas peças, 56 mil na
Lily) e pontinhos soltos apagados. Os originais ficaram no scratchpad da sessão
(`pinball-originais/`).

**Medidas:** o `addFrames` mede cada célula na carga. Na última medição as
referências eram 239 (aparelhos), 193 (chip apagado) e 306 (Lily pedindo).

**Falta:** `cover-pinball-de-entrada-e-saida.png` (capa com o título); com ela
vêm o `thumbnail` e o `public/og/pinball-de-entrada-e-saida.jpg`. O prompt da
capa ainda descreve o Nino: trocar para a Lily antes de gerar.
