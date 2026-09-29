# Manifesto de assets — Balão do Recado

Entrega completa do N1, atualizada com o lote complementar. Medidas de alfa usam limiar `alpha > 16`; `dx`, `dy`, `base` e `footPad` são locais à célula, com `originX = (dx + w/2) / frameWidth` e `footPad = frameHeight - 1 - base`. PNGs transparentes foram limpos e todos os arquivos foram comprimidos com Sharp/Lanczos3.

## Arquivos

| arquivo | tamanho | grade | frame | alfa | peso |
|---|---:|---:|---:|---|---:|
| `balao.png` | 1024×1024 | 2×2 | 512×512 | transparente | 707.882 B |
| `balao-2.png` | 1024×512 | 2×1 | 512×512 | transparente | 335.544 B |
| `destinos.png` | 1536×1536 | 3×3 | 512×512 | transparente | 2.013.972 B |
| `pecas.png` | 1280×960 | 4×3 | 320×320 | transparente | 887.710 B |
| `extras.png` | 1024×768 | 4×3 | 256×256 | transparente | 397.258 B |
| `bg-bairro.png` | 2560×720 | peça única / `TileSprite` | — | opaco | 1.044.675 B |
| `mural.png` | 960×600 | peça única | — | transparente | 567.348 B |
| `cover-balao-do-recado.png` | 1672×941 | peça única | — | opaco | 1.779.560 B |

## Escalas e validações de empacote

- Balão: escala única `0,7300509338`. As quatro poses foram extraídas inteiras da grade crua de 627 px, centralizadas pelo conjunto bola+cesta e alinhadas com o fundo da cesta em `y=470`.
- Balão 2: transformação única para os dois quadros, `scaleX=1,0000000000` e `scaleY=1,0463414634` (`429/410`). A correção vertical de 4,6% iguala a caixa da família original sem ampliar a largura: centro do conjunto `(256; 256,5)`, base `y=470` e gancho `(174; 398)` nos dois quadros. Assim a troca de textura não desloca o balão nem a cordinha.
- Destinos: escala única `1,2248803828` (`512/418`), exigida pelo contrato final de 512 px a partir da grade crua de 418 px. Cada célula lógica foi extraída inteira e redimensionada em uma única passagem Lanczos3, sem recorte lateral; nas três linhas de cada coluna foram preservados o mesmo `x`, a mesma escala e o mesmo enquadramento. Somente a translação vertical comum de base levou os cenários a `y=511` (`footPad=0`).
- Peças: escala única `0,7933884298`. Somente o quadro 1 foi substituído neste lote; os outros onze quadros finais foram preservados. A nova carinha e seu balão de fala foram recortados como um único conjunto inteiro e centralizados.
- Extras: escala única `1,0000000000`; a folha já chegou na grade final exata de 256 px, sem cruzamentos. Alfa residual `≤16` foi zerado e as células 9–11 foram confirmadas totalmente vazias.
- Anel: quadro 0 espelhado em torno de `x=159,5`; comparação RGBA das duas metades: diferença máxima `0`, soma `0`. Alfa no centro `(160,160) = 0`, portanto o buraco é realmente transparente.
- Mural: escala única `0,6265607264`; somente o componente conectado principal foi preservado, removendo resíduos de alfa externos. A cortiça permaneceu vazia.
- Fundo: o raw de 2103×748 foi ajustado para o contrato 2560×720. O céu ocupa `y=0..544`; o bairro começa em `y=545`. Uma fusão circular de 160 px nas pontas garante emenda horizontal; comparação entre a primeira e a última coluna RGB: diferença máxima `0`, soma `0`.
- Capa: permaneceu no tamanho final 1672×941. Título conferido visualmente como **“Balão do Recado”**, com o til de “Balão”.
- Revisão funcional: chama somente no quadro 1 do balão; lápis amarelo; relógio sem números; miolos dos quadros 1, 2, 3 e 11 de `pecas.png` livres para sobreposição; dedo sem linhas de clique. O novo quadro 1 tem carinha de perfil falando e balão pequeno com miolo liso.
- Revisão de destinos: ordem confirmada como linhas `antes / feliz / estrago` × colunas `colega-perto / vizinha-saiu / vovó-longe`; perto/médio/longe permanecem legíveis, todas as pessoas olham para a esquerda e nenhum quadro invade a célula vizinha.

## Medição da folha inteira antes do corte

Os raws foram medidos como folhas completas e por componentes conectados, antes de qualquer célula ser recortada.

- `balao.png` cru: 1254×1254, grade implícita 2×2 de 627 px. As caixas locais eram `x=139..549`, `74..486`, `139..551`, `60..473`, evidenciando deslocamentos laterais grandes entre poses, embora sem corte de objeto.
- `balao-2.png` cru: 1024×512, grade exata 2×1 de 512 px. Corridas X `125..420` e `601..896`; corrida Y comum `52..461`. Nenhum quadro cruza `x=512`.
- `destinos.png` cru: 1254×1254, grade lógica 3×3 de 418 px. Antes do corte, as corridas por coluna lógica eram: colega `x=30..400`, vizinha `x=6..412`, vovó `x=19..403`; por linha lógica: antes `y=16..399`, feliz `y=15..399`, estrago `y=9..397`. Nenhum cenário cru atravessava um múltiplo de 418 px. As células foram reempacotadas a partir dos nove recortes lógicos inteiros para preservar detalhes desconectados como brilhos, poeira e flores.
- `pecas.png` cru: 1448×1086, grade implícita 4×3 de 362 px. Os cruzamentos antigos continuam nas demais células; por isso somente a nova célula 1 (`x=380..705`, `y=68..294` dentro da folha) foi extraída deste raw e inserida na folha final já reempacotada. Ela própria não cruza borda.
- `extras.png` cru: 1024×768, grade exata 4×3 de 256 px. Corridas X `20..237`, `291..488`, `544..735`, `794..984`; corridas Y `42..235`, `276..491`, `532..747`. Nenhum objeto cruza múltiplos de 256 px; células 9–11 sem alfa.

## `balao.png`

O “centro” abaixo é o centro da caixa alfa do conjunto bola+cesta. O gancho é o centro medido do componente de latão na lateral esquerda; o quadro soprado desloca o gancho junto com a inclinação real da arte.

| i | quadro | dx | dy | w | h | base | originX | footPad | centro | gancho |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| 0 | balloon-idle | 106 | 42 | 300 | 429 | 470 | 0,5000 | 41 | (256; 256,5) | (174; 398) |
| 1 | balloon-burn | 105 | 41 | 302 | 430 | 470 | 0,5000 | 41 | (256; 256) | (170; 397) |
| 2 | balloon-cheer | 105 | 45 | 302 | 426 | 470 | 0,5000 | 41 | (256; 258) | (172; 398) |
| 3 | balloon-blown | 105 | 42 | 302 | 429 | 470 | 0,5000 | 41 | (256; 256,5) | (209; 406) |

## `balao-2.png`

| i | quadro | dx | dy | w | h | base | originX | footPad | centro | gancho |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| 0 | balloon-speak | 108 | 42 | 296 | 429 | 470 | 0,5000 | 41 | (256; 256,5) | (174; 398) |
| 1 | balloon-tablet | 108 | 42 | 296 | 429 | 470 | 0,5000 | 41 | (256; 256,5) | (174; 398) |

Tela útil do tablet no quadro 1, local à célula: `x=250`, `y=363`, `w=54`, `h=31`; centro `(277; 378,5)`. É a área segura para desenhar o rosto da vovó, sem cobrir a moldura.

## `destinos.png`

O ponto de entrega é local à célula e foi medido no detalhe funcional indicado em `TEXTURAS.md`: orelha esquerda do colega, boca da caixa de correio e janela da casinha. Como os cenários ocupam a célula até o chão, todos usam `originY=1` e `footPad=0`.

| i | quadro | dx | dy | w | h | base | originX | footPad | ponto de entrega |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---|
| 0 | friend-wait | 37 | 45 | 442 | 467 | 511 | 0,5039 | 0 | (165; 224) |
| 1 | neighbor-away | 8 | 41 | 498 | 471 | 511 | 0,5020 | 0 | (245; 367) |
| 2 | grandma-wait | 23 | 109 | 473 | 403 | 511 | 0,5068 | 0 | (363; 251) |
| 3 | friend-happy | 37 | 44 | 442 | 468 | 511 | 0,5039 | 0 | (165; 224) |
| 4 | neighbor-back | 8 | 40 | 499 | 472 | 511 | 0,5029 | 0 | (245; 367) |
| 5 | grandma-happy | 23 | 109 | 472 | 403 | 511 | 0,5059 | 0 | (363; 251) |
| 6 | friend-fail-drop | 37 | 40 | 454 | 472 | 511 | 0,5156 | 0 | (165; 224) |
| 7 | neighbor-fail-empty | 8 | 41 | 499 | 471 | 511 | 0,5029 | 0 | (245; 367) |
| 8 | grandma-fail-far | 23 | 109 | 473 | 403 | 511 | 0,5068 | 0 | (363; 251) |

## `pecas.png`

| i | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | ring | 49 | 17 | 222 | 287 | 303 | 0,5000 | 16 |
| 1 | form-voice | 31 | 70 | 259 | 180 | 249 | 0,5016 | 70 |
| 2 | form-letter | 38 | 42 | 245 | 236 | 277 | 0,5016 | 42 |
| 3 | form-screen | 25 | 71 | 271 | 179 | 249 | 0,5016 | 70 |
| 4 | msg-party | 38 | 31 | 244 | 259 | 289 | 0,5000 | 30 |
| 5 | msg-pencil | 44 | 42 | 232 | 237 | 278 | 0,5000 | 41 |
| 6 | msg-practice | 13 | 67 | 294 | 187 | 253 | 0,5000 | 66 |
| 7 | lock | 66 | 33 | 189 | 254 | 286 | 0,5016 | 33 |
| 8 | gust | 16 | 62 | 288 | 197 | 258 | 0,5000 | 61 |
| 9 | bird | 21 | 53 | 279 | 214 | 266 | 0,5016 | 53 |
| 10 | guide-hand | 64 | 28 | 192 | 265 | 292 | 0,5000 | 27 |
| 11 | note | 53 | 34 | 215 | 253 | 286 | 0,5016 | 33 |

Ponta real do dedo no quadro 10: `tipX=89`, `tipY=28` (faixa superior de alfa em `x=84..93`).

Miolo útil do balão de fala no quadro 1, local à célula: `x=220`, `y=145`, `w=59`, `h=54`; centro `(249,5; 172)`. A caixa é conservadora e fica inteiramente dentro do contorno oval, sem pegar a cauda.

## `extras.png`

| i | quadro | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | thought | 41 | 53 | 197 | 183 | 235 | 0,5449 | 20 |
| 1 | sun | 35 | 42 | 198 | 193 | 234 | 0,5234 | 21 |
| 2 | moon | 46 | 58 | 172 | 176 | 233 | 0,5156 | 22 |
| 3 | mailbox | 47 | 65 | 162 | 153 | 217 | 0,5000 | 38 |
| 4 | stamp-voice | 20 | 20 | 215 | 216 | 235 | 0,4980 | 20 |
| 5 | stamp-letter | 42 | 77 | 179 | 120 | 196 | 0,5137 | 59 |
| 6 | stamp-tablet | 32 | 73 | 192 | 123 | 195 | 0,5000 | 60 |
| 7 | grandma-face | 26 | 23 | 191 | 191 | 213 | 0,4746 | 42 |
| 8 | away-sign | 29 | 20 | 198 | 216 | 235 | 0,5000 | 20 |
| 9–11 | vazios | — | — | — | — | — | — | — |

Miolo útil do pensamento no quadro 0, local à célula: `x=75`, `y=82`, `w=130`, `h=79`; centro `(140; 121,5)`. A caixa fica dentro do corpo principal da nuvem e exclui as bolhas da cauda.

## Cores amostradas (`GetPixel`)

| arquivo e ponto | cor |
|---|---|
| `balao.png` `(256,100)` menta | `#83D1B6` |
| `balao.png` `(150,150)` coral | `#F97864` |
| `balao.png` `(256,430)` vime | `#E1A46A` |
| `balao-2.png` `(256,100)` menta | `#80CFB6` |
| `balao-2.png` `(150,150)` coral | `#FB745F` |
| `balao-2.png` quadro 1 `(256,375)` tela do tablet | `#F9F1E5` |
| `pecas.png` `(105,130)` dourado-creme do anel | `#F5D591` |
| `pecas.png` `(1120,160)` tela clara | `#E8F1FB` |
| `pecas.png` quadro 1 `(240,165)` miolo da fala | `#F6F4F3` |
| `extras.png` `(140,120)` miolo do pensamento | `#F9F8F8` |
| `extras.png` quadro 1 `(134,130)` amarelo-sol | `#F8D36C` |
| `extras.png` quadro 3 `(132,150)` azul da caixa de correio | `#3F456C` |
| `extras.png` quadro 6 `(138,134)` azul da tela | `#82BAEB` |
| `destinos.png` dominante coral da fachada | `#F89078` |
| `destinos.png` dominante verde do morro | `#80B060` |
| `destinos.png` dominante contorno | `#383048` |
| `bg-bairro.png` `(1280,300)` céu | `#8ACCFB` |
| `bg-bairro.png` `(1280,600)` bairro/verde | `#85B37D` |
| `mural.png` `(480,300)` cortiça | `#CE905F` |
| `mural.png` `(480,65)` contorno | `#222240` |
| `cover-balao-do-recado.png` `(300,90)` coral do título | `#FD7667` |
