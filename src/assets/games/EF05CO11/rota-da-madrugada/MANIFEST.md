# Rota da Madrugada — MANIFEST

Conferência editorial dos 17 PNGs de TEXTURAS.md §3 e §5, concluída em 20/10/2026. Código não alterado. Brutos de geração preservados em `raw/*-raw.png`; versões recebidas dos artistas antes desta revisão em `raw/received/*.png`. Os manifestos N1 e N2/N3 dos artistas ficam como registro da entrega anterior; as medidas abaixo descrevem os arquivos finais revisados.

Medição: alfa > 16; coordenadas locais à célula, origem no canto superior esquerdo. `base = dy + h` (borda exclusiva), `footPad = frameHeight - base`, `originX = (dx + w/2) / frameWidth`. Base 384 significa último pixel ocupado na linha 383. As corridas de colunas foram verificadas na folha inteira e por faixa horizontal antes de recortar células.

As escalas indicadas são comuns aos quadros de cada família, aplicadas igualmente aos dois eixos. No uso, mantenha uma escala comum por folha; não normalize os quadros pela altura individual. Objetos de chão estão ancorados na base da célula. Ícones e volante ficam centralizados.

## ceu.png

- Tamanho: 1280 × 300 px; 267.246 bytes.
- Grade: 1 × 1; frameWidth=1280, frameHeight=300.
- Alfa: mínimo 255, máximo 255; imagem opaca.
- Bruto de geração: `raw/ceu-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/ceu.png`, 1280 × 300 px; SHA-256 `0218b8fdf3078ce0b37f500ed5966586d8aed44e699d41efcc0ec0d23a16fb9d`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [0…1279].
- Corridas finais: [0…1279].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | céu | 0 | 0 | 1280 | 300 | 300 | 0.500000 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#0c2f6b` em (100,50), alfa 255; `#3e3998` em (100,240), alfa 255; `#403996` em (100,299), alfa 255; `#fee8bb` em (1060,80), alfa 255.

## painel.png

- Tamanho: 1280 × 200 px; 162.188 bytes.
- Grade: 1 × 1; frameWidth=1280, frameHeight=200.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/painel-raw.png`, 1983 × 793 px.
- Versão recebida: `raw/received/painel.png`, 1280 × 200 px; SHA-256 `26eeca67d44ebaad126a6192fb9f6f3a34dcfedfb9fe774acfd19beb3618a5eb`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 2130 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [0…1279].
- Corridas finais: [0…1279].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | painel | 0 | 20 | 1280 | 180 | 200 | 0.500000 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#005996` em (640,170), alfa 254; `#004573` em (140,60), alfa 253.

## volante.png

- Tamanho: 384 × 384 px; 77.503 bytes.
- Grade: 1 × 1; frameWidth=384, frameHeight=384.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/volante-raw.png`, 1254 × 1254 px.
- Versão recebida: `raw/received/volante.png`, 384 × 384 px; SHA-256 `108362499c6134aa978e25d3b171460c36e0bb305412d909457e7e35e22a2215`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 2766 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [19…364].
- Corridas finais: [19…364].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | volante | 19 | 23 | 346 | 338 | 361 | 0.500000 | 23 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#27385c` em (192,24), alfa 255; `#fbfbfb` em (192,192), alfa 254; `#0f80e2` em (100,192), alfa 254.

## icones.png

- Tamanho: 768 × 192 px; 56.671 bytes.
- Grade: 4 × 1; frameWidth=192, frameHeight=192.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/icones-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/icones.png`, 768 × 192 px; SHA-256 `d41a2e9d65b16056dfe1f734f141e98c0bc49d594a87b9ea445ee647bddbaad5`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 2494 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [16…134], [138…176], [221…297], [301…354], [408…552], [597…746].
- Corridas finais: [16…134], [138…176], [221…297], [301…354], [408…552], [597…746].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | buzina | 16 | 51 | 161 | 90 | 141 | 0.502604 | 51 |
| 1 | farol | 29 | 48 | 134 | 97 | 145 | 0.500000 | 47 |
| 2 | mensagem | 24 | 34 | 145 | 125 | 159 | 0.502604 | 33 |
| 3 | limpador | 21 | 46 | 150 | 101 | 147 | 0.500000 | 45 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#fbb804` em (60,90), alfa 254; `#fcf7ef` em (260,85), alfa 254.

## cenario.png

- Tamanho: 1152 × 384 px; 114.245 bytes.
- Grade: 3 × 1; frameWidth=384, frameHeight=384.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/cenario-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/cenario.png`, 1152 × 384 px; SHA-256 `84b4047b3a08e789234303453d90b0f7a70c50ec8b7cf6a0d533bfbb382ce5a3`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 2810 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [105…279], [440…712], [825…1095].
- Corridas finais: [105…279], [440…712], [825…1095].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | poste | 105 | 31 | 175 | 353 | 384 | 0.501302 | 0 |
| 1 | árvore | 56 | 94 | 273 | 290 | 384 | 0.501302 | 0 |
| 2 | arbusto | 57 | 254 | 271 | 130 | 384 | 0.501302 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#013a74` em (145,280), alfa 254; `#00305d` em (235,90), alfa 254; `#06645a` em (570,210), alfa 254; `#07635b` em (960,330), alfa 254.

## casas.png

- Tamanho: 1152 × 768 px; 461.456 bytes.
- Grade: 3 × 2; frameWidth=384, frameHeight=384.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/casas-raw.png`, 1536 × 1024 px.
- Versão recebida: `raw/received/casas.png`, 1152 × 768 px; SHA-256 `f2c78acc38e5300d37933123c7f6b995f20392b9da0b6f374d47de133b3e5b65`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 6764 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; estados apagados derivados das casas acesas, mesma geometria e alfa pixel a pixel; somente os vidros amarelos foram escurecidos (10844 pixels); PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [54…330], [415…737], [836…1083].
- Corridas finais: [54…330], [415…737], [836…1083].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | lilás apagada | 54 | 138 | 277 | 246 | 384 | 0.501302 | 0 |
| 1 | menta apagada | 31 | 139 | 323 | 245 | 384 | 0.501302 | 0 |
| 2 | entrega apagada | 68 | 108 | 248 | 276 | 384 | 0.500000 | 0 |
| 3 | lilás acesa | 54 | 138 | 277 | 246 | 384 | 0.501302 | 0 |
| 4 | menta acesa | 31 | 139 | 323 | 245 | 384 | 0.501302 | 0 |
| 5 | entrega acesa | 68 | 108 | 248 | 276 | 384 | 0.500000 | 0 |

Janelas: caixas dos **vidros**, sem incluir a moldura; os montantes internos ficam dentro da caixa. Coordenadas locais à célula 384 × 384. As caixas são medidas por cor (vidro escuro ou amarelo) dentro de cada região, com alfa > 128.

| Quadro | Janela | x | y | w | h | Centro (x,y) |
|---:|---|---:|---:|---:|---:|---|
| 0 | esquerda | 108 | 278 | 38 | 52 | (127.0, 304.0) |
| 0 | direita | 169 | 278 | 37 | 51 | (187.5, 303.5) |
| 1 | retangular | 166 | 279 | 124 | 61 | (228.0, 309.5) |
| 2 | redonda | 163 | 197 | 59 | 59 | (192.5, 226.5) |
| 3 | esquerda | 108 | 278 | 37 | 51 | (126.5, 303.5) |
| 3 | direita | 169 | 278 | 37 | 51 | (187.5, 303.5) |
| 4 | retangular | 166 | 279 | 123 | 61 | (227.5, 309.5) |
| 5 | redonda | 163 | 197 | 59 | 59 | (192.5, 226.5) |

Na casa lilás só a janela esquerda acende. O quadro 5 acende a janela redonda da casa de entrega. A troca de quadro mantém a silhueta e a posição.

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#c19bbc` em (190,350), alfa 254; `#67496c` em (190,190), alfa 254; `#fddc63` em (116,674), alfa 254; `#1e2642` em (116,290), alfa 254.

## cachorro.png

- Tamanho: 768 × 256 px; 99.265 bytes.
- Grade: 3 × 1; frameWidth=256, frameHeight=256.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/cachorro-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/cachorro.png`, 768 × 256 px; SHA-256 `181d8189bf45d1e1e5ad894da869db9adbade49f7f91bac55ded5a99be262914`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 2750 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [29…227], [294…473], [533…747].
- Corridas finais: [29…227], [294…473], [533…747].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | dormindo | 29 | 143 | 199 | 113 | 256 | 0.501953 | 0 |
| 1 | acordado | 38 | 86 | 180 | 170 | 256 | 0.500000 | 0 |
| 2 | correndo | 21 | 95 | 215 | 161 | 256 | 0.501953 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#eba243` em (130,200), alfa 254; `#fce4bb` em (100,235), alfa 253.

## dona-cida.png

- Tamanho: 512 × 256 px; 76.640 bytes.
- Grade: 2 × 1; frameWidth=256, frameHeight=256.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/dona-cida-raw.png`, 1774 × 887 px.
- Versão recebida: `raw/received/dona-cida.png`, 512 × 256 px; SHA-256 `7a4571932d7ddd811ac041b404a25fa8bf586bb996c9db513702807d44065a9b`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 1664 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [44…211], [323…444].
- Corridas finais: [44…211], [323…444].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | acenando | 44 | 20 | 168 | 236 | 256 | 0.500000 | 0 |
| 1 | com encomenda | 67 | 22 | 122 | 234 | 256 | 0.500000 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#834796` em (100,170), alfa 253; `#b87b9a` em (140,80), alfa 253; `#b8b7b8` em (130,40), alfa 254.

## limpador.png

- Tamanho: 512 × 64 px; 11.552 bytes.
- Grade: 1 × 1; frameWidth=512, frameHeight=64.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/limpador-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/limpador.png`, 512 × 64 px; SHA-256 `992b07305140f652cbabf8ed5689a2df340fc6e77c7c6abac028e46720a031eb`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 966 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [0…461].
- Corridas finais: [0…461].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | braço do limpador | 0 | 8 | 462 | 48 | 56 | 0.451172 | 8 |

Pivô de rotação: centro da tampa circular esquerda, **(24, 32) px**, fração **(0.046875, 0.500000)** da imagem 512 × 64. Tampa com caixa aproximada (0,8,48,48); a medida da caixa usa limites exclusivos para calcular o centro. Este pivô é diferente do centro da caixa alfa do braço inteiro. A origem de referência no TEXTURAS (0.06,0.5) fica 6,72 px à direita; entregue a medida ao programador para o ajuste no layout. Código não alterado.

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#39475e` em (24,32), alfa 254; `#39455d` em (10,32), alfa 253; `#1b2436` em (300,42), alfa 254.

## cover-rota-da-madrugada.png

- Tamanho: 1672 × 941 px; 1.718.765 bytes.
- Grade: 1 × 1; frameWidth=1672, frameHeight=941.
- Alfa: mínimo 255, máximo 255; imagem opaca.
- Bruto de geração: `raw/cover-rota-da-madrugada-raw.png`, 1672 × 941 px.
- Versão recebida: `raw/received/cover-rota-da-madrugada.png`, 1672 × 941 px; SHA-256 `4b120fb4eccfddd7fd7759e94605c2ff60e133be92274e88f62f3a94e0cbc82a`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [0…1671].
- Corridas finais: [0…1671].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | capa | 0 | 0 | 1672 | 941 | 941 | 0.500000 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#072a69` em (20,20), alfa 255; `#047987` em (832,690), alfa 255.

## icones2.png

- Tamanho: 768 × 192 px; 69.471 bytes.
- Grade: 4 × 1; frameWidth=192, frameHeight=192.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/icones2-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/icones2.png`, 768 × 192 px; SHA-256 `13808826bbcfc13d9712f3a45c0f3af126818c3bdee85a5f690aeeb205a84a7c`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 3064 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; centralização dos ícones inteiros, sem escala: c0: (-1,-27) px; c1: (0,-27) px; c2: (-1,-38) px; c3: (0,-10) px; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [29…48], [51…142], [145…163], [208…367], [400…560], [625…718].
- Corridas finais: [28…47], [50…141], [144…162], [208…367], [399…559], [625…718].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | GPS | 28 | 27 | 135 | 138 | 165 | 0.497396 | 27 |
| 1 | alto-falante | 16 | 27 | 160 | 138 | 165 | 0.500000 | 27 |
| 2 | mapa | 15 | 37 | 161 | 117 | 154 | 0.497396 | 38 |
| 3 | rádio | 49 | 9 | 94 | 173 | 182 | 0.500000 | 10 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#fcc31e` em (96,40), alfa 254; `#ffffff` em (65,145), alfa 255.

## ceu-serra.png

- Tamanho: 1280 × 300 px; 276.250 bytes.
- Grade: 1 × 1; frameWidth=1280, frameHeight=300.
- Alfa: mínimo 255, máximo 255; imagem opaca.
- Bruto de geração: `raw/ceu-serra-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/ceu-serra.png`, 1280 × 300 px; SHA-256 `d4f9c74fd00602168572a45f5364adddd1708c5701fd6f70ca73a33f59fe5683`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [0…1279].
- Corridas finais: [0…1279].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | céu e serra | 0 | 0 | 1280 | 300 | 300 | 0.500000 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#163270` em (100,50), alfa 255; `#124359` em (630,280), alfa 255.

## cenario2.png

- Tamanho: 1536 × 384 px; 163.481 bytes.
- Grade: 4 × 1; frameWidth=384, frameHeight=384.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/cenario2-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/cenario2.png`, 1536 × 384 px; SHA-256 `9dcef53974f7c77e6ea48c45f3a210b2c3116435f76fcdd65facae77d283f64f`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 5255 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [88…295], [488…663], [902…1017], [1236…1452].
- Corridas finais: [88…295], [488…663], [902…1017], [1236…1452].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | pinheiro | 88 | 89 | 208 | 295 | 384 | 0.500000 | 0 |
| 1 | placa de forquilha | 104 | 92 | 176 | 292 | 384 | 0.500000 | 0 |
| 2 | torre | 134 | 31 | 116 | 353 | 384 | 0.500000 | 0 |
| 3 | cavalete | 84 | 192 | 217 | 192 | 384 | 0.501302 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#034541` em (190,200), alfa 254; `#0c325f` em (570,280), alfa 254; `#fab715` em (570,140), alfa 254.

## vila-longe.png

- Tamanho: 1536 × 384 px; 140.330 bytes.
- Grade: 2 × 1; frameWidth=768, frameHeight=384.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/vila-longe-raw.png`, 2171 × 724 px.
- Versão recebida: `raw/received/vila-longe.png`, 1536 × 384 px; SHA-256 `a60273d2cf41bbd5349cf4b4953a1d6838892f56312694087b8c838894502b97`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 4512 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; vila apagada derivada da vila acesa, mesma geometria e alfa pixel a pixel; 13 aberturas amarelas escurecidas, incluindo a porta da igreja; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [63…704], [830…1474].
- Corridas finais: [62…706], [830…1474].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | vila apagada | 62 | 115 | 645 | 269 | 384 | 0.500651 | 0 |
| 1 | vila acesa | 62 | 115 | 645 | 269 | 384 | 0.500651 | 0 |

Janelas/aberturas luminosas: componentes amarelos medidos no quadro 1 (`R > 210, G > 155, B < 110, G−B > 110`, alfa > 128), ordenados por x e depois y. Caixas e centros em **pixels da célula 768 × 384**; no quadro 1 some 768 ao x para obter a coordenada da folha. O quadro 0 usa as mesmas posições após a correção.

| Índice | Abertura | x | y | w | h | Centro (x,y) | Centro normalizado (x/768,y/384) |
|---:|---|---:|---:|---:|---:|---|---|
| 0 | janela | 160 | 300 | 9 | 14 | 164.5, 307.0 | 0.214193, 0.799479 |
| 1 | janela | 177 | 300 | 9 | 14 | 181.5, 307.0 | 0.236328, 0.799479 |
| 2 | janela | 208 | 266 | 10 | 14 | 213.0, 273.0 | 0.277344, 0.710938 |
| 3 | janela | 226 | 266 | 9 | 14 | 230.5, 273.0 | 0.300130, 0.710938 |
| 4 | janela | 294 | 273 | 9 | 14 | 298.5, 280.0 | 0.388672, 0.729167 |
| 5 | janela | 313 | 273 | 10 | 14 | 318.0, 280.0 | 0.414063, 0.729167 |
| 6 | porta da igreja | 375 | 262 | 21 | 29 | 385.5, 276.5 | 0.501953, 0.720052 |
| 7 | janela redonda da igreja | 378 | 232 | 16 | 16 | 386.0, 240.0 | 0.502604, 0.625000 |
| 8 | janela | 432 | 246 | 10 | 15 | 437.0, 253.5 | 0.569010, 0.660156 |
| 9 | janela | 496 | 267 | 10 | 14 | 501.0, 274.0 | 0.652344, 0.713542 |
| 10 | janela | 521 | 267 | 10 | 14 | 526.0, 274.0 | 0.684896, 0.713542 |
| 11 | janela | 561 | 294 | 9 | 14 | 565.5, 301.0 | 0.736328, 0.783854 |
| 12 | janela | 578 | 294 | 9 | 14 | 582.5, 301.0 | 0.758464, 0.783854 |

A **5ª janela (índice 4)** está em `(298.5, 280.0)` px. O sino da torre não acende. Há 12 janelas mais a porta iluminada da igreja. A vila tem seis casas e a igreja, abaixo das cerca de nove casas pedidas no prompt; isso permanece como divergência da arte bruta.

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#024b5d` em (385,350), alfa 254; `#f8dcbd` em (1145,220), alfa 254; `#fbda0b` em (932,307), alfa 253; `#07254b` em (164,307), alfa 253.

## vaca.png

- Tamanho: 768 × 256 px; 100.936 bytes.
- Grade: 3 × 1; frameWidth=256, frameHeight=256.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/vaca-raw.png`, 2172 × 724 px.
- Versão recebida: `raw/received/vaca.png`, 768 × 256 px; SHA-256 `2382910dbf6590e3c7ee91ad4a177e6266d8f44040a01bc2d8786e8443d514ee`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 3290 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [62…194], [309…458], [533…747].
- Corridas finais: [62…194], [309…458], [533…747].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | parada | 62 | 83 | 133 | 173 | 256 | 0.501953 | 0 |
| 1 | assustada | 53 | 81 | 150 | 175 | 256 | 0.500000 | 0 |
| 2 | saindo | 21 | 91 | 215 | 165 | 256 | 0.501953 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#fba69c` em (120,150), alfa 254; `#fce9d2` em (120,110), alfa 254; `#fcb70e` em (120,190), alfa 253.

## guincho.png

- Tamanho: 1024 × 512 px; 355.551 bytes.
- Grade: 2 × 1; frameWidth=512, frameHeight=512.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/guincho-raw.png`, 1774 × 887 px.
- Versão recebida: `raw/received/guincho.png`, 1024 × 512 px; SHA-256 `4d4436cd01c109d914b492bbf1fb652fd7f3839b65c6babdb495251cc3fe7d28`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 5657 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [42…470], [554…982].
- Corridas finais: [42…470], [554…982].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | frente | 42 | 56 | 429 | 456 | 512 | 0.500977 | 0 |
| 1 | costas | 42 | 57 | 429 | 455 | 512 | 0.500977 | 0 |

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#f9e6ca` em (170,160), alfa 254; `#fbe663` em (125,350), alfa 254; `#353335` em (100,480), alfa 254.

## mapa.png

- Tamanho: 768 × 512 px; 306.864 bytes.
- Grade: 1 × 1; frameWidth=768, frameHeight=512.
- Alfa: mínimo 0, máximo 255; fundo transparente.
- Bruto de geração: `raw/mapa-raw.png`, 1536 × 1024 px.
- Versão recebida: `raw/received/mapa.png`, 768 × 512 px; SHA-256 `90eed3e3c0460e1a1acb98faaa042170766d9a286497be882df59a42b897a656`.
- Tratamento editorial: escala de edição 1,000000 (nenhum redimensionamento); remoção de 32844 pixels residuais com alfa de 1 a 16; RGB dos pixels totalmente transparentes zerado; PNG otimizado sem quantização de cores.
- Corridas de colunas na versão recebida: [39…729].
- Corridas finais: [39…729].

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | mapa aberto | 39 | 54 | 691 | 405 | 459 | 0.500651 | 53 |

Estrada em Y: pontos medidos no PNG final; frações em relação à **imagem inteira 768 × 512**, incluindo as margens transparentes. A boca fica na borda inferior do papel, não na borda do PNG. Pontas arredondadas são representadas pelo centro do término; posição visual tem tolerância de cerca de 2 px.

| Ponto | x | y | x/768 | y/512 |
|---|---:|---:|---:|---:|
| Boca inferior da estrada | 386 | 427 | 0.502604 | 0.833984 |
| Centro da bifurcação | 390 | 289 | 0.507813 | 0.564453 |
| Ponta esquerda (centro da terminação) | 213 | 121 | 0.277344 | 0.236328 |
| Ponta direita (centro da terminação) | 573 | 129 | 0.746094 | 0.251953 |

Guia opcional do eixo das curvas (px): tronco `(386,427) → (386,350) → (390,300) → (390,289)`; esquerda `(390,289) → (369,272) → (319,240) → (282,210) → (257,180) → (227,140) → (213,121)`; direita `(390,289) → (414,275) → (437,250) → (492,210) → (524,180) → (561,140) → (573,129)`. Interpole suavemente entre os pontos.

Cores amostradas com `System.Drawing.Bitmap.GetPixel` (coordenadas da folha final; RGB exato, alfa de 0 a 255): `#fdf1d4` em (100,400), alfa 255; `#79cafc` em (100,190), alfa 255; `#fbf9f6` em (386,400), alfa 255.

## Pendências e defeitos de origem

Os 17 PNGs foram conferidos. Sem pendência de arquivo ou corte de peça. Divergências de geração que edição editorial não resolve: a vila tem seis casas mais a igreja, em vez de cerca de nove; há variação tonal/textura suave em áreas que o prompt pedia chapadas e pequenas diferenças de desenho entre poses da vaca. Os estados apagado/aceso de casas e vila foram corrigidos para compartilhar a mesma silhueta. As medidas de janelas e pivô estão prontas para integração pelo Orquestrador/Ferro; nenhum código foi modificado.
