# Praia dos Dados — o que chegou (06/10/2026)

| Arquivo | Tamanho | Grade | Célula | Conteúdo |
|---|---|---|---|---|
| `bg-praia.png` | 1672 × 941 | — | — | opaco; torre à esquerda (x 0–410), espuma da beira em y ≈ 300–350 |
| `bg-praia-madeira.png` | 1672 × 941 | — | — | só a coluna da frente da cabine (x 146–182, y 262–475), na mesma tela do fundo; desenhada **por cima da Nina** (`DEPTH.cabin`), para ela ficar dentro da cabine |
| `banhistas.png` | 1800 × 800 | 6 × 2 | 300 × 400 | os 12 banhistas, na ordem e com os traços **exatos** da tabela (conferido um a um) |
| `cachorros.png` | 1600 × 1050 | 4 × 3 | 400 × 350 | Paçoca, Salsicha, Floco × sentado, correndo, pulando, chorando |
| `pecas.png` | 1400 × 700 | **4 × 2** | 350 | toalha, boné, chapéu, óculos / balde, boia, bola, pé de pato |
| `salva-vidas.png` | 1600 × 400 | **4 × 1** | 400 | Nina falando, comemorando, preocupada, rádio |

**Fora do contrato, e já absorvido no código:** o TEXTURAS pedia uma `pecas.png` só
(4 × 3, com a Nina e o rádio). Vieram duas folhas: `pecas` (4 × 2) e `salva-vidas`
(4 × 1). O `data/files.ts` e a arte de reserva seguem as duas.

**Limpeza feita na entrega:** as quatro folhas com alfa tinham franja vermelha
semitransparente e pontinhos soltos. Zerado o alfa ≤ 24 (61 mil px nos banhistas,
69 mil nos cachorros) e apagados os componentes com menos de 150 px. Os originais
ficaram no scratchpad da sessão (`praia-originais/`).

**Medidas:** não ficam escritas aqui. O `addFrames` mede cada célula na carga
(caixa do alfa > 128) e guarda a altura de referência da folha. Assim, uma folha
regerada com a mesma grade entra sem número novo. Na última medição:
- banhistas: referência 392 px (a moça de cabelo comprido);
- cachorros: 317 (Paçoca sentado);
- Nina: 399.

**Capa:** `cover-praia-dos-dados.png` (1672 × 941, título "Praia dos Dados" certo) chegou em 06/10/2026. Ela é o `thumbnail` no catálogo e gerou `public/og/praia-dos-dados.jpg` (1200 × 630, 147 KB).
