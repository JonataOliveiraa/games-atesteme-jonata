# Circuito de Bolinha — MANIFEST de assets

Revisão Tesoura, 21/10/2026. 9 PNGs conferidos e instalados. Linha **CHIBI VOADOR**, referência `references/35-chibi-voador.webp`; nenhum PNG da referência 19 foi utilizado. Sem keyline branca: brilhos internos brancos foram preservados. Nenhum código foi editado.

## Convenções e conferência

Caixas medidas nos pixels finais com **alfa > 16**, coordenadas locais da célula. `base=dy+h` (limite inferior exclusivo), `footPad=frameHeight-base`, `originX=(dx+w/2)/frameWidth`. Uso recomendado de origem vertical: 1 para personagens e peças apoiadas. As caixas são medidas, não pivôs para esconder recortes. A mesa usa a linha do tampo descrita abaixo.

A folha inteira foi medida por corridas de colunas ANTES das células. Os originais de peças, Nico, UI e Pipoca ultrapassavam divisões nominais: cada objeto foi isolado inteiro e reempacotado. Pipoca foi isolada por componentes conexos para não levar pixels da vizinha nas caixas sobrepostas. Corridas das colunas dos finais e por faixa de linha constam abaixo. Nos blocos, a corrida contínua entre células é intencional: ocupam toda a largura.

## Exceção autorizada pelo maestro — somente os quatro blocos

O bruto corrigido ainda tinha caixas 501×466, 501×467, 501×467 e 503×467. **O maestro autorizou explicitamente a deformação de aproximadamente 7% apenas nesses quatro blocos** para obter quadrados e priorizar encaixe. Foram normalizados diretamente do bruto para 256×256, sem upscale; a compressão horizontal é um pouco maior que a vertical (razão relativa 1,073–1,077). Não se usou o intermediário 236×236. Cada bloco ocupa dx=0,dy=0,w=256,h=256,base=256: não há margem transparente vertical entre dois blocos; verificados os pixels centrais do topo e da base. Cantos arredondados da arte preservados. Todos os demais assets mantêm proporção com escala uniforme e arredondamento de no máximo um pixel.

## Escalas de edição por família

| Família | Escala do bruto para o final | Observação |
|---|---:|---|
| Nico (8 poses) | 0.61788618 | Uma escala única; poses não foram normalizadas individualmente |
| Pipoca (3 poses) | 0.40805369 | Mesma escala; bases 256; esquerda nas três poses |
| Caixa (2 estados) | 0.34343434 | Mesma escala e base 320; sem salto na abertura |
| Rampas | 0.55233853 | Célula 5 é espelho exato da célula 4, inclusive alfa |
| Sino | 0.58047493 | 240×220, base 256 |
| Bolinha | 0.52017937 | Sem ampliar a fonte |
| Páginas UI | 0.33270321 | Mesma escala das células 0 e 1 |
| Botões UI | 0.36251920 | Mesma escala das células 2 e 3 |
| Página SE | 0.32490013 | Página inteira centrada |
| Mesa | 0.38564542 | Proporção original mantida, sem esticar pernas |
| Quarto | ajuste uniforme para 1280×720 | Crop central subpixel pela diferença mínima de proporção |
| Capa | 1 | Original 1672×941 preservado, RGB opaco |

## Geometria para integração (sem alterar código)

- **Mesa:** imagem 720×320. Linha superior de apoio do tampo em **y=13 px**, horizontal na região central (aproximadamente x=40…680). `TABLE.imageTop=13` coincide com essa linha. Caixa alfa (0,13,720,230); pés até y=242, base exclusiva 243, margem inferior 77. Essa margem é necessária para manter a proporção do bruto de 1867×596 sem cortar peças da mesa nem esticar pernas. Não ancorar o tampo pela base alfa dos pés.
- **Rampa 4:** caixa alfa local (4,88,248,168). A canaleta é **curva** no desenho original; não virou uma reta por edição. Pontos de referência visuais aproximados do centro da canaleta, na célula de 256: (24,103), (48,123), (80,145), (112,164), (144,183), (176,203), (208,224), (236,228). Usar estes como referência de revisão visual do percurso; o raio da bolinha deve ser descontado pelo código. Rampa 5: espelhar x por `255-x`. Este formato curvo é uma limitação da arte bruta em relação ao triângulo reto do prompt, preservada sem deformação.
- **Sino:** copinho na frente à esquerda, centro aproximado da boca em **(51,217)** na célula 256×256; borda visual aproximadamente x=16…87 e y=205…224. Em relação à âncora da célula (128,256), offset aproximado (-77,-39); normalizado pela célula, x=-0,3008 e altura acima da base=0,1523. Se o carregador recortar pela caixa alfa do sino (8,36,240,220), o centro passa a aproximadamente (43,181).
- **Nico pose 2:** ponta das mãos vazias aproximadamente **(231,123)** na célula 256×320; offset da âncora da célula (128,320)=(103,-197). Para escala de célula 250/320, offset aproximado (80,5,-153,9). Conferir no jogo após qualquer recorte automático do carregador. Pés de todas as poses na base exclusiva 320.
- **Página SE:** dois bolsos, verde à esquerda e laranja à direita, ambos vazios; parte superior livre, sem texto.
- **UI célula 1:** miolo creme limitado a **alfa 40/255 (~15,7%)**, inclusive amostra central (384,96), preservando o tracejado cinza. Fonte preferida v1; v2 rejeitada não utilizada.

## Arquivos finais e caixas por célula

### `quarto.png`

1280×720 px; grade 1×1; frameWidth=1280, frameHeight=720; alfa 255…255; 383204 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | quarto sem mesa | 0 | 0 | 1280 | 720 | 720 | 0.5 | 0 |

Corridas na folha inteira: `[[0,1279]]`. Por faixa de linha: `[[[0,1279]]]`.

SHA-256: `493bf663196354c9f42e2b04c1ea85e54b95563a9019d4dee69c0f20790b26af`.

### `mesa.png`

720×320 px; grade 1×1; frameWidth=720, frameHeight=320; alfa 0…255; 40557 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | mesa frontal | 0 | 13 | 720 | 230 | 243 | 0.5 | 77 |

Corridas na folha inteira: `[[0,719]]`. Por faixa de linha: `[[[0,719]]]`.

SHA-256: `a6ef0696fc8dccd27aeaf3e4c2ca3e9dc0fa1a0e46c169a658b117ef03228446`.

### `pecas.png`

1024×512 px; grade 4×2; frameWidth=256, frameHeight=256; alfa 0…254; 117396 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | bloco amarelo | 0 | 0 | 256 | 256 | 256 | 0.5 | 0 |
| 1 | bloco azul | 0 | 0 | 256 | 256 | 256 | 0.5 | 0 |
| 2 | bloco verde | 0 | 0 | 256 | 256 | 256 | 0.5 | 0 |
| 3 | bloco coral | 0 | 0 | 256 | 256 | 256 | 0.5 | 0 |
| 4 | rampa descendo à direita | 4 | 88 | 248 | 168 | 256 | 0.5 | 0 |
| 5 | rampa descendo à esquerda (espelho exato da 4) | 4 | 88 | 248 | 168 | 256 | 0.5 | 0 |
| 6 | sino com copinho à esquerda | 8 | 36 | 240 | 220 | 256 | 0.5 | 0 |
| 7 | bolinha | 70 | 140 | 115 | 116 | 256 | 0.498047 | 0 |

Corridas na folha inteira: `[[0,1023]]`. Por faixa de linha: `[[[0,1023]],[[4,251],[260,507],[520,759],[838,952]]]`.

SHA-256: `6c8401b8b44e84817fc066dd254fd9328e62aaa5036d15545d8f977d24e90b6f`.

### `nico.png`

1024×640 px; grade 4×2; frameWidth=256, frameHeight=320; alfa 0…255; 166214 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | parado | 38 | 23 | 180 | 297 | 320 | 0.5 | 0 |
| 1 | segurando caixa | 26 | 16 | 203 | 304 | 320 | 0.498047 | 0 |
| 2 | pondo peça / mãos vazias | 17 | 28 | 221 | 292 | 320 | 0.498047 | 0 |
| 3 | comemorando | 21 | 32 | 213 | 288 | 320 | 0.498047 | 0 |
| 4 | ops | 27 | 30 | 201 | 290 | 320 | 0.498047 | 0 |
| 5 | lendo manual | 36 | 31 | 183 | 289 | 320 | 0.498047 | 0 |
| 6 | soltando bolinha | 14 | 35 | 227 | 285 | 320 | 0.498047 | 0 |
| 7 | pensando | 40 | 26 | 175 | 294 | 320 | 0.498047 | 0 |

Corridas na folha inteira: `[[27,227],[282,484],[526,752],[789,1001]]`. Por faixa de linha: `[[[38,217],[282,484],[529,749],[789,1001]],[[27,227],[292,474],[526,752],[808,982]]]`.

SHA-256: `86c9ed4998280fee6c0a298fd1d3a3e013f3cdc10dbf75b2c759f60943336578`.

### `caixa.png`

768×320 px; grade 2×1; frameWidth=384, frameHeight=320; alfa 0…255; 53679 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | fechada | 39 | 154 | 306 | 166 | 320 | 0.5 | 0 |
| 1 | aberta | 43 | 59 | 297 | 261 | 320 | 0.498698 | 0 |

Corridas na folha inteira: `[[39,344],[427,723]]`. Por faixa de linha: `[[[39,344],[427,723]]]`.

SHA-256: `f164f9b8b0742ac71941accc06dfd581dda35d394c39ae4f878db41664e54384`.

### `ui.png`

512×384 px; grade 2×2; frameWidth=256, frameHeight=192; alfa 0…255; 53657 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | página | 21 | 16 | 214 | 176 | 192 | 0.5 | 0 |
| 1 | slot translúcido tracejado | 23 | 16 | 210 | 176 | 192 | 0.5 | 0 |
| 2 | MONTAR ligado / sem texto | 10 | 75 | 236 | 117 | 192 | 0.5 | 0 |
| 3 | MONTAR desligado / sem texto | 10 | 75 | 236 | 117 | 192 | 0.5 | 0 |

Corridas na folha inteira: `[[10,245],[266,501]]`. Por faixa de linha: `[[[21,234],[279,488]],[[10,245],[266,501]]]`.

SHA-256: `cda4c50e9c750966614d4453e2f30eb54615629fc4704ea76ffa5dc4b980b8c2`.

### `pipoca.png`

960×256 px; grade 3×1; frameWidth=320, frameHeight=256; alfa 0…255; 87342 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | dormindo | 36 | 72 | 247 | 184 | 256 | 0.498437 | 0 |
| 1 | acordando num pulo | 8 | 18 | 304 | 238 | 256 | 0.5 | 0 |
| 2 | andando à esquerda | 20 | 26 | 279 | 230 | 256 | 0.498437 | 0 |

Corridas na folha inteira: `[[36,282],[328,631],[660,938]]`. Por faixa de linha: `[[[36,282],[328,631],[660,938]]]`.

SHA-256: `4bb751d4e2cb9d5b38824e57e1f689f4032a0afa5284ce58747ad02442d799d7`.

### `pagina-se.png`

512×256 px; grade 1×1; frameWidth=512, frameHeight=256; alfa 0…255; 57144 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | bolso verde à esquerda / laranja à direita | 12 | 9 | 488 | 237 | 246 | 0.5 | 10 |

Corridas na folha inteira: `[[12,499]]`. Por faixa de linha: `[[[12,499]]]`.

SHA-256: `6ef1e0518e50556ad8c3382a6ac8b935cd4523351539d6b0989103d6aa041ada`.

### `cover-circuito-de-bolinha.png`

1672×941 px; grade 1×1; frameWidth=1672, frameHeight=941; alfa 255…255; 446166 bytes.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | capa com título Circuito de Bolinha | 0 | 0 | 1672 | 941 | 941 | 0.5 | 0 |

Corridas na folha inteira: `[[0,1671]]`. Por faixa de linha: `[[[0,1671]]]`.

SHA-256: `f0a0dd938a244ed823871b73ca15b1d069cbe0d86a1cf6b68c8321fff31773bc`.

## Cores amostradas com System.Drawing.GetPixel

Coordenadas absolutas no PNG final; são amostras reais para aproximar Graphics, não os hex nominais do prompt.

| Arquivo | Pixel (x,y) | Cor | Alfa | Uso |
|---|---|---|---:|---|
| pecas.png | 45,70 | #FBCE49 | 254 | amarelo |
| pecas.png | 310,60 | #4EA1FB | 254 | azul |
| pecas.png | 560,70 | #8AD16F | 254 | verde |
| pecas.png | 810,70 | #FC8E6A | 254 | coral |
| pecas.png | 100,460 | #BEA4EB | 254 | lilás da rampa |
| pecas.png | 100,419 | #8167A8 | 254 | canaleta |
| mesa.png | 360,38 | #F9CE94 | 254 | madeira clara |
| mesa.png | 45,130 | #ADDBBE | 254 | perna mint |
| nico.png | 140,245 | #576A89 | 254 | jeans |
| ui.png | 384,96 | #FBF6E8 | 40 | miolo translúcido do slot |
| ui.png | 165,335 | #59CD88 | 253 | botão ligado |
| pipoca.png | 200,150 | #E8905B | 254 | sombra laranja |

## Procedência e pendências

Originais preservados exclusivamente em `D:/claude-temp/circuito-raw/`: quarto-raw.png, mesa-raw.png, pecas-raw.png, blocos-raw.png, nico-raw.png, caixa-raw.png, ui-raw-v1.png, pipoca-raw-v1.png, pagina-se-raw-v1.png e cover-circuito-de-bolinha-raw-v1.png. Nenhum original foi salvo em C: ou outputs/ do repositório por esta edição. Prompts Aquarela: `D:/claude-temp/circuito-raw/geracao-aquarela-prompts.md`. Registros de recorte e escala: `D:/claude-temp/circuito-edit/pack-nico-ui.json` e `pack-remaining.json`. Scripts temporários fora do repositório.

Nenhum asset está pendente. Pendência de integração para o maestro/Ferro: revisar o percurso curvo da canaleta e o ponto de chegada no copinho usando as medidas acima; jogar os três níveis para conferir o carregador que recorta alfa. Não foram modificados código, TEXTURAS ou configuração, nem feito commit/push.
