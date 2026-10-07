# Ponte do Verdadeiro — arte entregue (05/10/2026)

Medidas pelo canal alfa (sharp). Os números entram em `data/files.ts` e `data/layout.ts`.

| Arquivo | Tamanho | Grade | Notas |
|---|---|---|---|
| `bg-riacho.png` | 1672 × 941 | — | exibido em 1280 × 720 (×0,766). Chão das duas margens em y 800 (jogo: 612). Margem de cá até x 730 (559); margem de lá a partir de 1184 (903). Pilastra x 1222–1305; polia com centro em (1303, 372), raio 42 (jogo: 997, 285, raio 31). |
| `ponte.png` | 900 × 800 | recortes à mão | tábua em `(0, 225, 900, 170)`: dobradiça (845, 339), anel (49, 290), topo da tábua em y 318. Placa em `(15, 488, 875, 232)`: face creme de (92, 575) a (797, 688). Risco solto de 2 px em y 479–480, que fica fora do recorte. |
| `outros.png` | 1200 × 400 | 3 células de 400 | alavanca em cima, alavanca embaixo e cadeado. A base da alavanca **não** está no mesmo lugar nas duas células (centro em x 221 e x 154); o pé fica em y 397. Centro do cadeado em (202,5, 211). |
| `bichinhos.png` | 1200 × 1200 | 4 × 4 células de 300 | nada vaza de célula. O corpo **desliza** entre os quadros da mesma linha (até 37 px quando entram o guarda-chuva ou o balão), então cada quadro tem pivô próprio em `ART.feet`, medido pela borda esquerda dos pés. Pés em y 291 (sapo), 295 (coelho), 291–294 (pato) e 281–282 (castor). |
| `cover-ponte-do-verdadeiro.png` | 1672 × 941 | — | título "Ponte do Verdadeiro" escrito certo. |
| `Sprite-.png` | 900 × 800 | — | **cópia exata** de `ponte.png` (mesmos bytes). O jogo não carrega esse arquivo, mas o build o copia. Pode ser apagado. |
