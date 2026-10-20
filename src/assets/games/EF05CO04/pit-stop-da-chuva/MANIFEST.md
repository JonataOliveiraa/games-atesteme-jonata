# Pit Stop da Chuva — leva Aquarela

Geradas em 20/10/2026 com a ferramenta integrada de imagem. Cada geração usou o prompt completo da seção correspondente de `src/games/EF05CO04/pit-stop-da-chuva/TEXTURAS.md` e as duas referências `references/40-moda-chapada-a.png` e `references/41-moda-chapada-b.png` somente para o estilo.

| Arquivo | Tamanho | Grade | Alfa | Tratamento |
|---|---:|---|---|---|
| `autodromo.png` | 1280 × 520 | faixa contínua | céu | Seções verticais ajustadas; 0–60 transparente; metade direita espelhada para emenda horizontal exata. |
| `lama.png` | 1280 × 204 | faixa contínua | não | Seções 0–56, 56–64, 64–204 ajustadas; metade direita espelhada para emenda horizontal exata. |
| `tenda.png` | 600 × 360 | peça única | sim | Redimensionada e base encostada no fundo. |
| `karts.png` | 1536 × 512 | 4 × 2 de 384 × 256 | sim | Bruto 5 + 3; proporção conferida nas oito peças em 20/10/2026 (desvio máximo de 0,40% por rasterização). Arquivo preservado, escala herdada ≈0,77; alfa < 32 já zerado. |
| `motos.png` | 1536 × 512 | 4 × 2 de 384 × 256 | sim | REEMPACOTADA em 20/10/2026 diretamente de raw/motos.png: matriz uniforme [0,58, 0; 0, 0,58] nas oito peças, sem esticar; centro do entre-eixos alinhado; alfa < 32 zerado antes e depois da redução. |

## Células das folhas

Ordem das duas folhas, da esquerda para a direita, linha superior antes da inferior:

0. Kika parada.
1. Kika correndo.
2. Kika comemorando.
3. Kika tonta.
4. Kika preocupada.
5. Rival lilás.
6. Rival coral.
7. Veículo verde-menta vazio.

Os veículos estão voltados para a direita e não têm rodas. As diferenças de geometria já existentes nos brutos estão quantificadas na revisão abaixo; uma escala única não altera essas diferenças.

## Brutos

Os cinco PNGs originais, antes de redimensionar e reempacotar, estão em `raw/` com o mesmo nome dos finais.

## Complemento — trilha estreita (20/10/2026)

As duas gerações seguiram integralmente os prompts §13a e §13b do `TEXTURAS.md`, com as mesmas referências 40 e 41 usadas apenas como estilo.

| Arquivo | Tamanho | Grade | Alfa | Tratamento |
|---|---:|---|---|---|
| `trilha.png` | 1280 × 204 | faixa contínua | não | Pixels 0–64 copiados de `lama.png` para casar exatamente box e cerca; faixas 64–110, 110–160 e 160–204 ajustadas; metade direita espelhada para emenda horizontal exata. |
| `trilha-pecas.png` | 512 × 256 | 2 × 1 de 256 × 256 | sim | Placa na célula 0 e cone na 1, escala comum, bases alinhadas em y=238; franja de alfa abaixo de 32 zerada. |

Os brutos desta leva estão em `raw/trilha.png` e `raw/trilha-pecas.png`.

## Complemento — pneus de perfil (20/10/2026)

Uma geração integrada com o prompt integral do §6b de `TEXTURAS.md` e as duas referências 40/41 anexadas apenas para estilo. Bruto original 2172 × 724 em `raw/pneus.png` e `outputs/pit-stop-da-chuva/raw/pneus.png`. Final `pneus.png`: 1536 × 256, RGBA, 6 × 1 células de 256 × 256.

Reempacotado com sharp: centros ajustados pelos anéis concêntricos com precisão subpixel para (128,128), sem usar o centro do bbox; escala normalizada por tipo e leve correção de circularidade. Envelope nominal de 216 px (variação raster até 1 px); perfil puro, sem banda lateral ou espessura aparente. Alfa 1–31 zerado antes e depois da transformação; nenhuma célula encosta nas bordas.

| Célula | Conteúdo | Bbox alfa local (x0,y0,x1,y1) | Centro circular |
|---|---|---|---|
| 0 | Carro liso, faixa vermelha | 20, 21, 235, 235 | 128,128 |
| 1 | Carro chuva, faixa azul | 20, 21, 235, 235 | 128,128 |
| 2 | Carro cravos, faixa verde | 20, 21, 235, 235 | 128,128 |
| 3 | Carro chuva murcho, faixa azul | 19, 54, 237, 235 | deformado; base y=235 |
| 4 | Moto lisa, faixa vermelha e raios | 20, 20, 236, 236 | 128,128 |
| 5 | Moto chuva, faixa azul e raios | 21, 21, 235, 236 | 128,128 |

A murcha mantém a deformação e tem a mesma base raster (y=235) dos pneus redondos de carro. Pequenas irregularidades de traço da geração permanecem; não há perspectiva 3/4. Não foram editados código nem `pecas.png`.

## Revisão de proporção e eixos — Tesoura, 20/10/2026

### Processamento e validação

- Destino desta revisão: somente motos.png e este MANIFEST.md; nenhum código editado. Karts.png permaneceu byte a byte idêntica.
- Ambos os brutos têm 2172 × 724 e distribuição 5 + 3, não uma grade 4 × 2. Foram examinadas as corridas de colunas na folha inteira e em faixas por linha antes dos recortes. Há peças atravessando divisões de uma grade hipotética: não se recortou pela grade final.
- Motos: corridas alfa ≥ 32 na faixa superior: 56–417, 508–871, 935–1298, 1366–1728, 1795–2157; na inferior: 64–478, 744–1153, 1498–1889. As oito peças inteiras foram isoladas e a ordem 0–7 preservada.
- Uma única escala **sX = sY = 0,58** para TODAS as motos. A transformação afim é diagonal e não contém rotação nem deformação. A translação se refere ao ponto médio dos eixos, aproximadamente (192, 202) na célula, e não ao centro alfa de cada pose. A escala também deixa espaço para pneus de raio 46 px dentro da altura de 256 px.
- Grade final das duas folhas: 1536 × 512, 4 × 2; frameWidth=384, frameHeight=256. Direção: direita em todas as células. Sem cortes nos limites.
- Franja de alfa < 32 zerada antes e depois do processamento da moto. Nas duas finais há **zero pixels com 0 < alfa < 32**, e nenhuma caixa alfa encosta na borda da célula.
- Peso: motos.png = 420719 bytes; karts.png = 692602 bytes. PNG RGBA, sem upscale.
- Karts: escala herdada ≈0,77 em ambos os eixos, confirmada pelas proporções dos oito componentes principais. Não havia achatamento a corrigir.

Comparação altura/largura do maior componente conectado de cada peça (alfa ≥ 32), excluindo apenas marcas decorativas desconectadas. Pequenas diferenças, abaixo de 0,46%, resultam da rasterização/limiar do contorno. A moto 0 passou de **313/362 = 0,8646** para **182/210 = 0,8667**.

| Quadro | Moto bruto H/W | Moto final H/W | Kart bruto H/W | Kart final H/W |
|---|---:|---:|---:|---:|
| 0 | 0.8646 | 0.8667 | 0.7056 | 0.7057 |
| 1 | 0.7967 | 0.7962 | 0.6708 | 0.6699 |
| 2 | 0.9505 | 0.9526 | 0.7136 | 0.7124 |
| 3 | 0.8760 | 0.8720 | 0.6615 | 0.6633 |
| 4 | 0.8595 | 0.8578 | 0.6919 | 0.6915 |
| 5 | 0.6819 | 0.6805 | 0.5902 | 0.5915 |
| 6 | 0.6659 | 0.6639 | 0.5871 | 0.5851 |
| 7 | 0.4719 | 0.4737 | 0.3134 | 0.3146 |

### Caixas alfa nas folhas finais

Coordenadas locais à célula, alfa ≥ 32. base=dy+h é exclusiva; footPad=256-base; originX=(dx+w/2)/384. A grade do jogo continua sendo a âncora; estes originX documentam a arte e não devem compensar o alinhamento do chassi.

**motos.png — escala única 0,58**

| Quadro | dx | dy | w | h | base | originX | footPad |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0 — Kika parada | 87 | 32 | 210 | 182 | 214 | 0.500000 | 42 |
| 1 — Kika correndo | 87 | 46 | 211 | 168 | 214 | 0.501302 | 42 |
| 2 — Kika comemorando | 86 | 13 | 211 | 201 | 214 | 0.498698 | 42 |
| 3 — Kika tonta | 87 | 25 | 211 | 189 | 214 | 0.501302 | 42 |
| 4 — Kika preocupada | 87 | 34 | 211 | 181 | 215 | 0.501302 | 41 |
| 5 — Rival lilás | 74 | 51 | 241 | 164 | 215 | 0.506510 | 41 |
| 6 — Rival coral | 76 | 57 | 238 | 158 | 215 | 0.507813 | 41 |
| 7 — Veículo vazio | 84 | 108 | 228 | 108 | 216 | 0.515625 | 40 |

**karts.png — escala herdada ≈0,77, arquivo preservado**

| Quadro | dx | dy | w | h | base | originX | footPad |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0 — Kika parada | 34 | 14 | 316 | 223 | 237 | 0.500000 | 19 |
| 1 — Kika correndo | 36 | 30 | 311 | 207 | 237 | 0.498698 | 19 |
| 2 — Kika comemorando | 39 | 6 | 306 | 231 | 237 | 0.500000 | 19 |
| 3 — Kika tonta | 44 | 10 | 297 | 227 | 237 | 0.501302 | 19 |
| 4 — Kika preocupada | 44 | 33 | 295 | 204 | 237 | 0.498698 | 19 |
| 5 — Rival lilás | 27 | 53 | 328 | 194 | 247 | 0.497396 | 9 |
| 6 — Rival coral | 30 | 58 | 323 | 189 | 247 | 0.498698 | 9 |
| 7 — Veículo vazio | 34 | 146 | 321 | 101 | 247 | 0.506510 | 9 |

### Rodas: medidas locais da célula 7 (veículo vazio)

Centros/raios em pixels, com precisão prática de aproximadamente ±1 px. No kart, ajuste circular da borda interna dos arcos (alfa ≥ 128); os dois arcos não têm o mesmo raio nem exatamente a mesma altura. Na moto, centro do pequeno círculo do eixo traseiro na balança e do eixo dianteiro no garfo, medidos na folha final; não confundir esses pequenos círculos de fixação com o raio do pneu. Como não há arcos circulares completos na moto, **46 px é o raio de pneu estimado pelo espaço livre sob o para-lama dianteiro**, comum às duas rodas.

| Veículo | Centro traseiro x,y | Centro dianteiro x,y | Raio traseiro | Raio dianteiro | Base alfa do chassi (exclusiva) |
|---|---|---|---:|---:|---:|
| Carro / kart | 99,84; 237,86 | 287,78; 240,70 | 30,10 | 26,37 | 247 |
| Moto | 104,5; 201,7 | 278,6; 203,4 | 46 (pneu estimado) | 46 (pneu estimado) | 216 |

Frações individuais do kart: traseiro (0,2600; 0,9292), raio/256=0,1176; dianteiro (0,7494; 0,9402), raio/256=0,1030. Frações individuais da moto: traseiro (0,2721; 0,7879), dianteiro (0,7255; 0,7945); raio/256=0,1797 para ambos.

O código atual usa um único axleFY e wheelFR. A tabela seguinte usa a média das alturas dos dois eixos e, no kart, a média dos dois raios. wheelFR é **raio dividido por frameHeight (256)**. Para o contrato de chão em scenes/car.ts, **bottomFY=(axleY+wheelRadius)/256**: é a base dos pneus montados. A base alfa do PNG é registrada separadamente em chassisBottomFY e não deve ser confundida com o chão. O kart montado ultrapassa o fundo da célula, o que é permitido porque os pneus são imagens separadas.

| GEOMETRY | rearFX | frontFX | axleFY | wheelFR | bottomFY (chão dos pneus) | chassisBottomFY (base alfa) |
|---|---:|---:|---:|---:|---:|---:|
| carro | 0.2600 | 0.7494 | 0.9347 | 0.1103 | 1.0450 | 0.964844 |
| moto | 0.2721 | 0.7255 | 0.7912 | 0.1797 | 0.9709 | 0.843750 |

### Limitações presentes no bruto

**Os chassis originais não são geometricamente idênticos.** A edição preserva uma escala uniforme comum e alinha o ponto médio do entre-eixos; não deforma nem normaliza cada veículo individualmente. Na moto, o entre-eixos bruto é de aproximadamente 273 px nas poses da Kika, 310–311 px nos rivais e 300 px na vazia. Após s=0,58, isso resulta em aproximadamente 158–159 px, 180–181 px e 174 px, respectivamente. Portanto, não é possível fazer os dois eixos coincidirem nas oito células simultaneamente só com translação e uma escala comum. Aumentar/reduzir cada peça por separado ou esticar o chassi violaria a exigência de preservar as proporções. Fazer todos os chassis idênticos exigiria redesenho/substituição da arte de base, com revisão das poses.

Nas cinco motos da Kika os eixos ficam aproximadamente em x=113 e x=271, nos rivais em x=102 e x=282, e na vazia em x=105 e x=279; o nível médio dos eixos permanece em y≈202. A geometria da célula 7 é referência medida, não uma alegação de coincidência dos demais quadros.

No kart preservado, a base alfa é y=237 nas células 0–4 e y=247 nas células 5–7; os arcos têm variações de tamanho/posição já presentes no material recebido. O teste pedido não encontrou deformação de proporção; essa folha não foi modificada. Uma geometria fixa baseada na célula 7 continua sendo uma aproximação para as demais.

### Cores amostradas com System.Drawing.GetPixel

Pontos locais da célula 7, amostrados no PNG final. Valores sem tratamento de cor adicional.

| Folha | Uso | x,y | RGB | Alfa |
|---|---|---|---|---:|
| motos.png | verde do corpo | 175,152 | #9EC7A3 | 253 |
| motos.png | amarelo-manteiga | 195,160 | #FBE7A2 | 253 |
| motos.png | cinza do motor | 180,201 | #79756F | 253 |
| karts.png | verde do corpo | 146,218 | #95BE9E | 255 |
| karts.png | amarelo-manteiga | 170,216 | #FADF9E | 255 |
| karts.png | banco | 180,195 | #525351 | 255 |
| karts.png | contorno | 210,245 | #1E120D | 255 |

SHA-256 motos.png: 0a549179895dc740f016806e11f7de175aa50e77e25760fb4034498ced622117

SHA-256 karts.png (preservado): 4cefa69814d53ff8acf8e79dbd764e3a90bc151677f106a42aad043725f4acbc
