# Fábrica de Estampas — manifesto da arte

Entregue em 13/10/2026. Os originais ficaram em `outputs/fabrica-de-estampas/originais/`. Aqui estão as versões limpas: o alfa ≤ 24 foi zerado (a franja dessa linha de arte), e os pontinhos soltos com menos de 80 px também.

| Arquivo | Tamanho | Grade | Célula | Observação |
|---|---|---|---|---|
| `bg-estamparia.png` | 1672 × 941 | — | — | opaco. Na escala 1280 × 720: tampo do balcão em y 379–444, ladrilho escuro em 444–498, bancada a partir de 498. Prateleiras em x 115–387 e 1018–1280; cesto em x 1080–1280, y 459–681 |
| `esteira.png` | 1050 × 700 | 3 × 2 | 350 | a esteira tem rolinhos nas pontas e não vai de borda a borda. O código repete só o miolo entre dois sulcos (x 152–231 da célula, `TILE` em `data/files.ts`). Janela: o vão fica 19 px (6 % da altura) abaixo do centro da imagem e mede ≈ 195 × 183 |
| `estampas.png` | 1024 × 768 | 4 × 3 | 256 | o quadradinho de linho tem margem e cantos redondos (caixa 224 × 226); lado a lado vira tecido de retalhos |
| `carimbos.png` | 1050 × 700 | 3 × 2 | 350 | carimbos com caixa 255 × 330. Nas almofadas, a tinta fica 15 % acima do centro da lata, e é ali que o carimbo descansa |
| `ui.png` | 1050 × 700 | 3 × 2 | 350 | papel com alfinetes nos cantos (canto do NineSlice 0,36), molduras com fita de ≈ 36 px (0,19), abas com miolo creme (0,25). O número da aba e as casas de botão são tingidos com a cor da moldura |
| `estampadora.png` | 700 × 900 | 2 × 2 | 350 × 450 | poses acenando, pensando, comemorando e ops. Ancoradas pela base da célula, sem recorte, para os pés não pularem quando a pose troca |

Falta a capa: `cover-fabrica-de-estampas.png`.
