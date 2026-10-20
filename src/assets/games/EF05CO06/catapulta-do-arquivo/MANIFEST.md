# Catapulta do Arquivo — MANIFEST

Publicado em 20/10/2026 por Tesoura. Pacote de dezessete imagens: seis de ambiente, cinco de objetos/capa e seis bordas/túneis recebidas da Aquarela e editadas por Tesoura.

Destino absoluto: `D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/`.

## Ambientes — arquivos publicados

Os seis arquivos de ambiente abaixo são PNG sRGB, 8 bits por canal, RGB (3 canais), sem canal alfa e totalmente opacos.

| Arquivo | Nível | Medidas finais | Bytes | Uso |
|---|---|---|---:|---|
| [terra.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/terra.png>) | N1 | 256 × 256 px | 82301 | Terra marrom; repetível nos quatro lados |
| [areia.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/areia.png>) | N2 | 256 × 256 px | 97898 | Areia dourada; repetível nos quatro lados |
| [pedra.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/pedra.png>) | N3 | 256 × 256 px | 69243 | Pedra azul-lilás; repetível nos quatro lados |
| [bg-ceu.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/bg-ceu.png>) | N1 | 1280 × 720 px | 826399 | Céu diurno e morros; fundo fixo |
| [bg-praia.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/bg-praia.png>) | N2 | 1280 × 720 px | 1047478 | Fim de tarde e mar; fundo fixo |
| [bg-serra.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/bg-serra.png>) | N3 | 1280 × 720 px | 1159285 | Noite, lua e montanhas; fundo fixo |

## Objetos e capa — entrega da Aquarela em 20/10/2026

A pasta `D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/raw/` foi movida integralmente e mesclada, sem sobrescrever os brutos anteriores, em `D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/`. Não existe mais pasta raw dentro de src. Os brutos ficam em outputs. A versão atual da folha de aparelhos usa o bruto `D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/aparelhos-v3.png`, processado no contrato novo da seção Aparelhos v3 abaixo.

| Final | Medidas | Grade / conteúdo | Alfa | Bytes |
|---|---|---|---|---:|
| [pecas.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/pecas.png>) | 800 × 400 px | 4 × 2 células de 200 × 200 | RGBA, transparente | 218854 |
| [catapulta.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/catapulta.png>) | 320 × 320 px | 1 célula; objeto de 201 × 270 | RGBA, transparente | 68398 |
| [tabua.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/tabua.png>) | 772 × 40 px | Recorte justo, proporção preservada | RGBA, transparente | 36263 |
| [cover-catapulta-do-arquivo.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/cover-catapulta-do-arquivo.png>) | 1672 × 941 px | Cópia idêntica ao bruto | RGB, opaco | 1883647 |

### Peças: grade, limpeza e medidas por célula

Ordem de leitura: esquerda para direita, primeira linha antes da segunda. Cada ícone foi recortado e redimensionado mantendo a proporção, com a maior dimensão em 150 px (75% da célula), e centralizado. Coordenadas abaixo são locais à célula, origem no canto superior esquerdo.

| Índice | Conteúdo | Caixa visível (x, y, largura, altura) | Centro da caixa |
|---:|---|---|---|
| 0 | vídeo | (30, 25, 140, 150) | (99.5, 99.5) |
| 1 | foto | (25, 27, 150, 145) | (99.5, 99) |
| 2 | música | (25, 26, 150, 148) | (99.5, 99.5) |
| 3 | trabalho | (25, 26, 150, 147) | (99.5, 99) |
| 4 | bolinha do arquivo | (25, 26, 150, 147) | (99.5, 99) |
| 5 | brilho | (28, 25, 144, 150) | (99.5, 99.5) |
| 6 | mola | (25, 57, 150, 86) | (99.5, 99.5) |
| 7 | mola apertada | (25, 71, 150, 58) | (99.5, 99.5) |

Limpeza: pixels do bruto com alfa de 1 a 95 foram zerados (84.707 pixels nas oito células), removendo os respingos coloridos e a névoa de baixa opacidade. Após esse corte havia uma componente principal por célula; só ela foi mantida. Depois do redimensionamento, alfa abaixo de 24 foi zerado e valores a partir de 248 foram fechados em 255. Verificação final: uma única componente conectada por célula, nenhum pixel com alfa de 1 a 23, nenhum respingo solto visível.

### Catapulta: ocupação e pontas medidas

Célula de 320 × 320 px, transparente. Caixa visível: **(x=60, y=31, largura=201, altura=270)**; ocupa x=60…260 e y=31…300, inclusive. As duas rodas alcançam **y=300**. O objeto foi ampliado proporcionalmente a partir do recorte do bruto.

As ancoragens medidas no centro do topo de cada ponta do Y são:

| Ponta | Centro medido | Coordenada arredondada | Intervalo do topo (alfa ≥128) |
|---|---|---|---|
| Esquerda | **(88,5; 31)** | **(89, 31)** | x=81…96 na linha y=31 |
| Direita | **(233,5; 31)** | **(234, 31)** | x=227…240 na linha y=31 |

Medida tomada na primeira linha visível de cada topo, com alfa ≥128; o centro é o ponto médio do intervalo horizontal nessa linha. São coordenadas da célula final de 320 px, medidas na imagem publicada.

### Tábua: recorte, largura e pregos

O bruto já tinha fundo transparente. Recorte aproveitado: x=35, y=308, largura=2103, altura=109 px. A tábua foi ajustada para **40 px de altura**, mantendo a proporção: largura final **772 px**. Esta largura segue o pedido atual de preservar a proporção do bruto. A caixa visível ocupa o canvas inteiro (0, 0, 772, 40), com transparência nos cantos arredondados.

Pregos medidos pelo centro da região metálica: **esquerdo ≈(31, 19)** e **direito ≈(740, 19)**, em pixels do PNG final; precisão aproximada de 1 px. Estão a cerca de 31–32 px das extremidades.

### Capa

`cover-catapulta-do-arquivo.png`: **1672 × 941 px**, RGB opaco. Copiada sem redimensionamento nem edição; hash SHA-256 igual ao bruto.

### Conferência e rastreabilidade dos novos arquivos

Edição executada com `D:/Documentos/Atesteme Jogos Fund 1/node_modules/sharp` (0.35.4). Transparência e limpeza conferidas visualmente sobre quadriculado. Medidas, alfa, componentes e cópia da capa conferidos programaticamente.

- [pecas sobre fundo quadriculado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/pecas-checker.png>).
- [catapulta sobre fundo quadriculado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/catapulta-checker.png>).
- [tabua sobre fundo quadriculado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/tabua-checker.png>).
- [Processamento e caixas de origem](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/objetos-processamento.json>).
- [Validação e medidas finais](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/objetos-validation.json>).

| Arquivo | SHA-256 |
|---|---|
| pecas.png | `caca9d84ff8cddf0ad303bdbd50bb389cf2e108867f9ec70c4bc46378b50d3be` |
| catapulta.png | `a640cfa428f7ae6e17e9670f7cce7e1f9f13516914a07de0505f78cd12db9aa7` |
| tabua.png | `06474430d6ae4cee2d06a2fb07f5c476366ec149e7178ac409a2ab6a79858274` |
| cover-catapulta-do-arquivo.png | `2c8b7bd9516b3c5ea74e162e2df6d3493d0e54543e1c2e769d4c5653d625e987` |

## Aparelhos v3 — contrato novo, em pé sobre a superfície

Publicado em 20/10/2026: [aparelhos.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/aparelhos.png>), substituindo a folha anterior. PNG RGBA sRGB de **960 × 640 px**, grade **3 × 2**, células fixas de **320 × 320 px**, sem recorte adicional no código. Tamanho: 283939 bytes. Origem: [aparelhos-v3.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/aparelhos-v3.png>) (**1536 × 1024 px**), preservada sem alterações. Contrato: seção 7 de [TEXTURAS.md](<D:/Documentos/Atesteme Jogos Fund 1/src/games/EF05CO06/catapulta-do-arquivo/TEXTURAS.md>).

### Caixas reais por célula

Coordenadas locais à célula de 320 px, origem no canto superior esquerdo. Caixas medidas em todos os pixels visíveis após a limpeza (alfa ≥48). Os extremos da caixa são inclusivos: último y = y + altura − 1. Ordem de leitura: esquerda para direita, primeira linha antes da segunda.

| Índice | Peça | Caixa (x, y, largura, altura), px | Centro X | Último y da base |
|---:|---|---|---:|---|
| 0 | computador | **(60, 21, 200, 280)** | 159.5 | 300 |
| 1 | HD interno | **(80, 191, 160, 110)** | 159.5 | 300 |
| 2 | pen drive | **(115, 101, 90, 200)** | 159.5 | 300 |
| 3 | cartão | **(90, 121, 140, 180)** | 159.5 | 300 |
| 4 | HD externo com cabo | **(80, 101, 160, 200)** | 159.5 | 300 |
| 5 | nuvem | **(40, 80, 240, 160)** | 159.5 | flutuante, centrada |

Os cinco aparelhos estão em pé, centrados horizontalmente em x=159,5 e com a base visível exatamente em **y=300**; as linhas y=301…319 são transparentes. O HD externo tem o cabo e o conector inteiros dentro da caixa de 160 × 200 px. A nuvem segue a exceção do contrato: **240 × 160 px**, centro **(159,5;159,5)**, flutuando no centro da célula.

O computador mostra o HD instalado dentro da tampa aberta, conforme a nova arte. A documentação desta folha corresponde às caixas do novo contrato em superfície.

### Remoção de halo e reempacotamento

Processamento com `D:/Documentos/Atesteme Jogos Fund 1/node_modules/sharp` (0.35.4). A máscara foi extraída do alfa: pixels com alfa <160 foram apagados; o suporte restante foi tornado opaco para eliminar a aura escura/colorida da borda. Foram removidos 43.277 pixels de alfa baixo e zerado o RGB oculto em 902.185 pixels já transparentes. As seis peças foram isoladas por componentes conectadas, preservando pés, argola e cabo.

Cada peça foi ajustada às dimensões alvo e recebeu novo antialias na redução Lanczos3. Depois da redução, alfa <48 foi zerado. As peças foram recortadas ao limite visível e ancoradas pela base medida; a nuvem foi centralizada nos dois eixos. Na composição final, RGB foi zerado em todos os pixels de alfa 0.

### Verificações

Conferência visual realizada sobre fundo claro e fundo escuro: contornos limpos, sem névoa externa. Verificações programáticas: grade e dimensões exatas, uma componente por célula, nenhuma peça cortada, cinco bases em y=300, nuvem centralizada, **zero pixels de alfa 1–47** e **zero RGB não nulo em alfa 0**. Os outros **16 PNGs publicados não foram alterados**. Nenhum código foi editado.

- [Prévia em fundo claro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/aparelhos-v3-claro.png>).
- [Prévia em fundo escuro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/aparelhos-v3-escuro.png>).
- [Processamento e caixas no bruto](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/aparelhos-v3-processamento.json>).
- [Validação das caixas e bases finais](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/aparelhos-v3-validation.json>).

SHA-256 final: `f615b9a77cac7a28bfbf088717293fa73ab6e1faf9fea12f715e44d03845c143`.

SHA-256 do bruto: `9d20288dff5df6402b084cd5aacc4b38a37b11e624963ae41260ef105c9d806e`.

A folha substituída e o MANIFEST anterior foram preservados para rastreabilidade em [aparelhos-v2-publicado.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/archive/aparelhos-v2-publicado.png>) e [MANIFEST-antes-aparelhos-v3.md](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/archive/MANIFEST-antes-aparelhos-v3.md>).

## Bordas e túneis — entrega de 20/10/2026

Seis PNGs preparados com sharp 0.35.4 a partir dos brutos da Aquarela em `D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/`, conforme as seções 14 e 15 de [TEXTURAS.md](<D:/Documentos/Atesteme Jogos Fund 1/src/games/EF05CO06/catapulta-do-arquivo/TEXTURAS.md>). Os brutos foram preservados.

| Arquivo publicado | Medidas | Alfa | Repetição | Bytes |
|---|---|---|---|---:|
| [borda-campo.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/borda-campo.png>) | 512 × 96 px | RGBA, transparente | horizontal | 54852 |
| [borda-praia.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/borda-praia.png>) | 512 × 96 px | RGBA, transparente | horizontal | 39657 |
| [borda-serra.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/borda-serra.png>) | 512 × 96 px | RGBA, transparente | horizontal | 36055 |
| [tunel-campo.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/tunel-campo.png>) | 128 × 256 px | RGB, opaco | vertical | 40153 |
| [tunel-praia.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/tunel-praia.png>) | 128 × 256 px | RGB, opaco | vertical | 52586 |
| [tunel-serra.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF05CO06/catapulta-do-arquivo/tunel-serra.png>) | 128 × 256 px | RGB, opaco | vertical | 41596 |

### Bordas: alinhamento e transparência

Canvas de 512 × 96 px. **Linha do chão em y=36**, por baixo dos tufos, conchas ou montinhos. A camada ocupa y=36…84, com contorno inferior irregular; **y=85…95 é inteiramente transparente**. A linha y=36 tem cobertura em todas as 512 colunas. Acima dela fica somente a arte saliente.

| Borda | Primeiro pixel visível | Último pixel visível | Linha do chão | Transparente a partir de |
|---|---:|---:|---:|---:|
| borda-campo.png | y=6 | y=84 | y=36 | y=85 |
| borda-praia.png | y=14 | y=84 | y=36 | y=85 |
| borda-serra.png | y=16 | y=84 | y=36 | y=85 |

A faixa útil foi separada em duas regiões para alinhar o chão sem achatar os tufos: parte superior até y=36 e camada inferior até y=84. Faixas do bruto utilizadas:

| Borda | Bruto | Topo útil | Linha de referência no bruto | Fim útil exclusivo |
|---|---|---:|---:|---:|
| borda-campo.png | 2172 × 724 | y=249 | y=333 | y=568 |
| borda-praia.png | 2048 × 768 | y=263 | y=333 | y=517 |
| borda-serra.png | 2048 × 768 | y=300 | y=344 | y=534 |

Limpeza antes de redimensionar: alfa <96 zerado em campo e praia; alfa <128 zerado na serra, removendo o brilho escuro/azulado externo. Depois do redimensionamento, alfa <48 foi zerado nas três bordas. O RGB foi zerado sempre que alfa=0. Validação final: nenhum pixel de alfa 1–47, nenhum RGB oculto em alfa 0 e nenhum pixel visível abaixo de y=84. Os contornos sólidos e a sombra interna da neve foram preservados.

Repetição horizontal: faixa de trabalho de 576 px, sobreposição de 64 px e corte de menor diferença de cor/alpha, usando cores premultiplicadas para não transportar halo para a transparência. Offset circular de **50% em X (256 px)** por recorte e recomposição com sharp, com inspeção do encontro após o deslocamento. O final mede 512 px e conserva o offset.

### Túneis

Canvas de **128 × 256 px**, RGB de três canais, totalmente opaco. Redimensionamento de trabalho a 128 × 288 px e reparo da repetição vertical com sobreposição de 32 px e corte de menor erro; offset circular de **50% em Y (128 px)** para inspeção. Os encontros topo/base são contínuos e a sombra lateral do poço foi preservada.

### Montagens conferidas

As três bordas foram conferidas com **três cópias lado a lado (1536 × 96 px)** sobre quadriculado. Cada túnel foi conferido com **três cópias empilhadas (128 × 768 px)**. Os encontros não exibem faixa reta ou corte aparente; a borda da serra foi também inspecionada ampliada, sem névoa azulada externa.

- [borda-campo — três lado a lado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/borda-campo-3x-horizontal.png>); [encontro ampliado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/borda-campo-costura.png>).
- [borda-praia — três lado a lado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/borda-praia-3x-horizontal.png>); [encontro ampliado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/borda-praia-costura.png>).
- [borda-serra — três lado a lado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/borda-serra-3x-horizontal.png>); [encontro ampliado](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/borda-serra-costura.png>).
- [tunel-campo — três empilhados](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/tunel-campo-3x-vertical.png>).
- [tunel-praia — três empilhados](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/tunel-praia-3x-vertical.png>).
- [tunel-serra — três empilhados](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/tunel-serra-3x-vertical.png>).
- [Prancha conjunta das bordas](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/bordas-preview-3x.png>) e [prancha conjunta dos túneis](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/tuneis-preview-3x.png>).
- [Processamento e alinhamento](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/bordas-tuneis-processamento.json>) e [validação de medidas, alfa, emendas e hashes](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/bordas-tuneis-validation.json>).

As métricas dos encontros usam diferença média entre pixels vizinhos; não exigem igualdade das colunas/linhas opostas. As diferenças finais estão na ordem das variações internas e foram complementadas pela inspeção das montagens. Os **11 PNGs anteriores conservam os hashes registrados**. Nenhum código foi alterado.

| Arquivo | SHA-256 final |
|---|---|
| borda-campo.png | `693ec196d0bd45066755b0cfcc823c6f5e905d722c78973b67affddabd5f5aaf` |
| borda-praia.png | `08e5bad60049e84567449ec7d33bbcd476f7be45c656249db07423e14d13ffd5` |
| borda-serra.png | `930b11733864772a6eae2e50ebeacd9778d5476f5e14a6301d09051993c2c265` |
| tunel-campo.png | `cef4e9d6208053fe67b6d855160d8b6ffd5c6a20a9ef3266261ff0c5e0a9a7ed` |
| tunel-praia.png | `405b7e2a1cc3028ca077281ec8de539ea38860f45c313da46b44443d644df1f2` |
| tunel-serra.png | `f201c3418966a30404bff5c167fd7bbea48f482f70b9278a2ad17983074fbb94` |

Os hashes dos brutos também constam do JSON de validação.

## Geração e proveniência dos ambientes

Ferramenta utilizada: `image_gen` integrado, uma chamada por arquivo. Em todas as seis chamadas foi anexada a mesma [referência 35-chibi-voador.webp](<D:/Documentos/Atesteme Jogos Fund 1/references/35-chibi-voador.webp>). Foram usados integralmente, sem abreviar, os blocos de prompt das seções 3, 4, 5, 10, 11 e 12 de [TEXTURAS.md](<D:/Documentos/Atesteme Jogos Fund 1/src/games/EF05CO06/catapulta-do-arquivo/TEXTURAS.md>).

As cópias exatas dos prompts enviados e dos PNGs brutos estão preservadas no projeto:

| Final | Seção | Medidas do bruto | Prompt integral | Bruto |
|---|---:|---|---|---|
| terra.png | 3 | 1254 × 1254 px | [terra-prompt.txt](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/terra-prompt.txt>) | [terra.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/terra.png>) |
| areia.png | 4 | 1254 × 1254 px | [areia-prompt.txt](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/areia-prompt.txt>) | [areia.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/areia.png>) |
| pedra.png | 5 | 1254 × 1254 px | [pedra-prompt.txt](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/pedra-prompt.txt>) | [pedra.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/pedra.png>) |
| bg-ceu.png | 10 | 1672 × 941 px | [bg-ceu-prompt.txt](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/bg-ceu-prompt.txt>) | [bg-ceu.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/bg-ceu.png>) |
| bg-praia.png | 11 | 1672 × 941 px | [bg-praia-prompt.txt](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/bg-praia-prompt.txt>) | [bg-praia.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/bg-praia.png>) |
| bg-serra.png | 12 | 1673 × 940 px | [bg-serra-prompt.txt](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/bg-serra-prompt.txt>) | [bg-serra.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/bg-serra.png>) |

Os caminhos originais das gerações estão em [generations.json](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/generations.json>).

## Edição com sharp

Processamento executado com `D:/Documentos/Atesteme Jogos Fund 1/node_modules/sharp` (0.35.4).

- Fundos: redimensionamento Lanczos3 para 1280 × 720 px, sem corte da composição, e remoção do canal alfa.
- Terra e areia: redução a 288 × 288 px; reparo dos encontros horizontal e vertical por sobreposição de 32 px e escolha de caminhos de menor diferença de cor, resultando em uma textura periódica de 256 × 256 px. O reparo preserva o traço, sem faixa larga desfocada.
- Pedra: redução do bruto a 144 × 144 px para diminuir as pedras; recomposição por retalhos de 80 px e sobreposição de 24 px, seguida do mesmo reparo periódico nas duas direções. A composição final não é a simples repetição de um subtile de 128 px.
- Offset circular de 50% nas duas direções: 128 px em X e Y, por extração e recomposição dos quatro quadrantes com sharp. As antigas bordas passam ao centro para inspeção. A textura publicada conserva esse offset; a posição inicial é indiferente para seu uso repetível.
- Exportação final sem transparência, PNG RGB com compressão sem perda.

## Conferência

As três texturas foram montadas em grades 3 × 3 de 768 × 768 px e inspecionadas visualmente. Os encontros nos quatro lados estão contínuos, sem faixas ou cortes retos aparentes. Os três fundos finais também foram inspecionados na prancha conjunta.

- [terra — grade 3×3](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/terra-3x3.png>); [inspeção ampliada após offset](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/terra-offset50-inspecao.png>).
- [areia — grade 3×3](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/areia-3x3.png>); [inspeção ampliada após offset](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/areia-offset50-inspecao.png>).
- [pedra — grade 3×3](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/pedra-3x3.png>); [inspeção ampliada após offset](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/pedra-offset50-inspecao.png>).
- [Prévia conjunta dos fundos](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/fundos-preview.png>).
- [Medidas, opacidade, hashes e métricas de borda](<D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/qa/validation.json>).

As métricas de borda registram diferenças entre pixels vizinhos na escala RGB 0–255; continuidade de textura não exige que colunas opostas sejam idênticas. As diferenças dos encontros finais são da mesma ordem das variações internas e foram complementadas pela inspeção das grades.

## SHA-256 dos finais

| Arquivo | SHA-256 |
|---|---|
| terra.png | `f4af01ff500871de07cf8a6ead2647c218dc1f39a4aac8a0807afd516136d81a` |
| areia.png | `689da6c4e9e45b7fc9c7d3c6669f11656b804a7d3860f0b1f42553e7238ff5b5` |
| pedra.png | `ceea7a7913dd3e0da2a842d6ff120cbb21beb9c2283cd27ea286024461ae4196` |
| bg-ceu.png | `c6219fde12348a40a5bfec75a2265bd6902e664f6099d9514e9c01670b78e921` |
| bg-praia.png | `d340b83c6acd5f06373d174023b84e1fe75113923a0ff576ad66a41f1f6cbbdc` |
| bg-serra.png | `a99cb91e9c75a51ed2ee28c9a22672cf7c02bced79da814565e67de38fba384f` |

Escopo do pacote publicado: seis PNGs de ambiente, peças, catapulta, tábua, capa, aparelhos, três bordas, três túneis e este MANIFEST. Brutos e conferências estão em `D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/`. A versão v3 de `aparelhos.png` está publicada; seu bruto transparente `D:/Documentos/Atesteme Jogos Fund 1/outputs/catapulta-do-arquivo/raw/aparelhos-v3.png` permanece em outputs. Código do jogo não foi alterado; nenhum commit foi criado.
