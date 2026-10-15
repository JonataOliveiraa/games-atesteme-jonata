# Quem Bate à Porta? — assets

Texturas entregues em 08/10/2026. Os originais, antes da limpeza, estão no scratchpad da sessão (`originais-qbp/`). A limpeza zerou o alfa ≤ 24 e tirou as manchas soltas com menos de 150 px.

| Arquivo | Tamanho | Grade | Notas |
|---|---|---|---|
| `bg-corredor.png` | 1672 × 941 | — | escalado para 1280 × 720 (`setDisplaySize`) |
| `bg-sala.png` | 1672 × 941 | — | escalado para 1280 × 720; a tela do tablet fica em x 658–957, y 218–429 (na escala 1280) |
| `portas.png` | 1320 × 900 | 4 × 2 (330 × 450) | portas com 292 × 406; o vão aberto tem 309 × 407; as portinhas têm 177 × 249 |
| `pessoas.png` | 1050 × 1750 | 3 × 5 (350 × 350) | a altura de referência é a vovó (330); o desconhecido é menor (272–306) |
| `informacoes.png` | 1050 × 1050 | 3 × 3 (350) | a célula 8 está vazia |
| `pecas.png` | 1399 × 700 | 4 × 2 (≈350) | a caixinha aberta (célula 2) não é usada |

**Medidas que valem no `data/layout.ts`** (na escala 1280):

- **Corredor:**
  - a parede reta vai de x 0 a 1055;
  - a faixa decorada termina em y ≈ 157 e o rodapé termina em y ≈ 467, por isso `FLOOR` = 470.
- **Parede que some à direita:**
  - o rodapé vai de (1055, 467) a (1225, 387) e o alto vai de (1055, 167) a (1225, 290);
  - as 5 portinhas de `FAR` seguem essa linha, com 62 % da altura da parede ali;
  - elas ficam estreitadas (`FAR_SQUEEZE` = 0.55) para parecer em perspectiva.
- **Portas:**
  - altura 240, por isso a largura fica ≈ 172;
  - centros em x 186, 375, 565, 755 e 944;
  - a plaquinha fica a 185 px do chão (`plateDy`), e o que a porta recebe fica a 54 px (`badgeDy`).
- **Planos:**
  - o plano aberto tem zoom 1,12, centro (640, 335), e corta o chão vazio e as bordas;
  - o close da porta tem zoom 1,8, com a porta e o balão centrados juntos;
  - o plano do erro tem zoom 1,9, centro (1000, 385), com a porta do desconhecido e as portinhas acima da faixa.
- **Pessoas:** `PERSON.h` = 194 para a vovó. A turma encolhe para 0,8 (`PERSON_SCALE`) para caber no vão.
- **Tablet (`TABLET`):** centro (807, 323), 300 × 211.
