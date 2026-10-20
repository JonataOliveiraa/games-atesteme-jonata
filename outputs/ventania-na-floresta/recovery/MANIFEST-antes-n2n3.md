# Ventania na Floresta — N1 — MANIFEST

Publicado em 20/10/2026 por Tesoura. Sete PNGs preparados com sharp a partir dos brutos fornecidos, sem alterar código.

Destino absoluto: `D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO01/ventania-na-floresta/`.

Brutos preservados em `D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/raw/`. Contrato: seções 1 a 9 de [TEXTURAS.md](<D:/Documentos/Atesteme Jogos Fund 1/src/games/EF15CO01/ventania-na-floresta/TEXTURAS.md>). Processamento: `D:/Documentos/Atesteme Jogos Fund 1/node_modules/sharp` (0.35.4).

## Arquivos publicados

| Arquivo | Dimensões | Grade | Célula | Canais | Bytes |
|---|---|---|---|---|---:|
| [bg-trilha.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO01/ventania-na-floresta/bg-trilha.png>) | 1672 × 941 | — | — | RGB, opaco | 1651330 |
| [bg-jardim.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO01/ventania-na-floresta/bg-jardim.png>) | 1672 × 941 | — | — | RGB, opaco | 1679402 |
| [formigas.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO01/ventania-na-floresta/formigas.png>) | 1024 × 512 | 4 × 2 | 256 × 256 | RGBA, transparente | 542750 |
| [zuzu.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO01/ventania-na-floresta/zuzu.png>) | 768 × 512 | 3 × 2 | 256 × 256 | RGBA, transparente | 352773 |
| [flores.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO01/ventania-na-floresta/flores.png>) | 768 × 768 | 3 × 3 | 256 × 256 | RGBA, transparente | 286842 |
| [objetos.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO01/ventania-na-floresta/objetos.png>) | 1024 × 512 | 4 × 2 | 256 × 256 | RGBA, transparente | 282675 |
| [pipa.png](<D:/Documentos/Atesteme Jogos Fund 1/src/assets/games/EF15CO01/ventania-na-floresta/pipa.png>) | 1024 × 640 | 4 × 2 | 256 × 320 | RGBA, transparente | 597979 |

Todos os PNGs são sRGB, 8 bits por canal. Os dois fundos foram copiados integralmente: medidas nativas de 1672 × 941 e hashes idênticos aos brutos.

## Limpeza e posicionamento

As peças foram isoladas globalmente pelo alfa antes de separá-las em células: partes dos desenhos ultrapassavam as divisões nominais dos brutos. A ordem contratual foi preservada. Pixels com alfa <160 foram eliminados e o suporte restante tornado opaco; novo antialias foi gerado na redução Lanczos3. Após redimensionar, alfa <48 foi zerado. Em todos os pixels com alfa=0 o RGB também é (0,0,0).

A limpeza removeu pontinhos coloridos e o resíduo de baixa opacidade. Componentes de expressão e movimento com tamanho significativo foram mantidas e associadas à respectiva pose. Na Zuzu, o exterior do contorno branco foi limpo, inclusive o RGB escuro existente nos pixels transparentes; o keyline branco e as asas foram preservados. Não há fundo cinza nem névoa colorida externa nos finais.

As peças maiores têm limite de aproximadamente 215 px em células de 256 (cerca de 8% de margem lateral). A Pipa respeita o limite de 215 × 269 dentro da célula de 256 × 320. A proporção dos desenhos foi mantida; poses largas ocupam menos altura. Objetos pequenos seguem as proporções indicadas na seção 9.

Formigas e flores terminam em **y=255**; Pipa termina em **y=319**. Nessas folhas, a margem inferior é zero para a base da silhueta, incluindo seu keyline. Nas poses de queda/rotação, usa-se o limite inferior da silhueta. Zuzu e objetos são centralizados nos dois eixos. Dois traços inferiores de movimento da Pipa comemorando foram deslocados para cima para caber na célula com a base da personagem ancorada.

## Caixas reais das células

As caixas abaixo usam **alfa >96**, o mesmo limiar usado pelo código, com origem no canto superior esquerdo de cada célula. Formato **(x, y, largura, altura)** em pixels locais. Os extremos são inclusivos; último y = y + altura − 1. As caixas de todo alfa visível e as áreas das componentes também estão no JSON de validação.

### formigas.png

Grade 4 × 2, célula 256 × 256 px.

| Índice | Conteúdo | Caixa real, px | Último y / posição |
|---:|---|---|---|
| 0 | parada, folha erguida | **(28, 41, 201, 215)** | base y=255 |
| 1 | andando, passo A | **(23, 41, 211, 215)** | base y=255 |
| 2 | andando, passo B | **(27, 41, 203, 215)** | base y=255 |
| 3 | sentada, tonta | **(30, 41, 197, 215)** | base y=255 |
| 4 | rolando de cabeça para baixo | **(23, 41, 211, 215)** | base y=255 |
| 5 | susto, pulinho | **(27, 41, 202, 215)** | base y=255 |
| 6 | tropeço, sem folha | **(21, 134, 215, 122)** | base y=255 |
| 7 | comemorando, folha erguida | **(23, 41, 211, 215)** | base y=255 |

### zuzu.png

Grade 3 × 2, célula 256 × 256 px.

| Índice | Conteúdo | Caixa real, px | Último y / posição |
|---:|---|---|---|
| 0 | voando, asas para cima | **(21, 23, 215, 210)** | centro (128, 127.5) |
| 1 | voando, asas para baixo | **(21, 40, 215, 177)** | centro (128, 128) |
| 2 | carregando, patas esticadas | **(42, 21, 172, 215)** | centro (127.5, 128) |
| 3 | comemorando | **(21, 21, 215, 214)** | centro (128, 127.5) |
| 4 | assustada | **(21, 30, 215, 197)** | centro (128, 128) |
| 5 | triste | **(21, 25, 215, 206)** | centro (128, 127.5) |

### flores.png

Grade 3 × 3, célula 256 × 256 px.

| Índice | Conteúdo | Caixa real, px | Último y / posição |
|---:|---|---|---|
| 0 | margarida amarela | **(37, 41, 182, 215)** | base y=255 |
| 1 | margarida azul | **(36, 41, 184, 215)** | base y=255 |
| 2 | margarida rosa | **(37, 41, 182, 215)** | base y=255 |
| 3 | tulipa amarela | **(55, 41, 146, 215)** | base y=255 |
| 4 | tulipa azul | **(55, 41, 147, 215)** | base y=255 |
| 5 | tulipa rosa | **(55, 41, 146, 215)** | base y=255 |
| 6 | estrela amarela | **(38, 41, 181, 215)** | base y=255 |
| 7 | estrela azul | **(38, 41, 181, 215)** | base y=255 |
| 8 | estrela rosa | **(37, 41, 182, 215)** | base y=255 |

### objetos.png

Grade 4 × 2, célula 256 × 256 px.

| Índice | Conteúdo | Caixa real, px | Último y / posição |
|---:|---|---|---|
| 0 | estaca com placa em branco | **(53, 20, 151, 217)** | centro (128, 128) |
| 1 | estaca lisa | **(87, 20, 83, 217)** | centro (128, 128) |
| 2 | casinha de terra do canteiro | **(20, 41, 217, 174)** | centro (128, 127.5) |
| 3 | folha verde grande | **(39, 42, 179, 172)** | centro (128, 127.5) |
| 4 | folhinha de vento | **(77, 86, 102, 84)** | centro (127.5, 127.5) |
| 5 | pedrinha / marca da fila | **(71, 90, 115, 76)** | centro (128, 127.5) |
| 6 | poeira | **(64, 74, 128, 108)** | centro (127.5, 127.5) |
| 7 | laço branco | **(58, 78, 141, 100)** | centro (128, 127.5) |

### pipa.png

Grade 4 × 2, célula 256 × 320 px.

| Índice | Conteúdo | Caixa real, px | Último y / posição |
|---:|---|---|---|
| 0 | parada | **(21, 85, 215, 235)** | base y=319 |
| 1 | acenando | **(21, 98, 215, 222)** | base y=319 |
| 2 | falando | **(21, 92, 215, 228)** | base y=319 |
| 3 | segurando-se contra o vento | **(21, 114, 215, 206)** | base y=319 |
| 4 | surpresa | **(21, 84, 215, 236)** | base y=319 |
| 5 | apontando para a direita | **(21, 107, 215, 213)** | base y=319 |
| 6 | comemorando | **(21, 88, 215, 232)** | base y=319 |
| 7 | pulando de lado | **(21, 132, 215, 188)** | base y=319 |

## Cores das flores

Coluna 0: **#FFD23F**; coluna 1: **#5AA9F0**; coluna 2: **#F58CC0**. Linha 0: margarida; linha 1: tulipa; linha 2: estrela. Os caules alcançam y=255 em todas as nove células.

As pétalas receberam remapeamento relativo ao tom dominante de cada cor, com preenchimento principal no hex exato. A transição para as sombras é suave; contornos, brilhos e diferenças relativas das sombras foram mantidos. O miolo creme foi protegido por máscara própria, e o caule/folha verdes foram preservados. A referência antes da recoloração está em [flores-antes-recolorir.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/flores-antes-recolorir.png>).

| Célula | Flor | Hex base | Pixels com o hex exato |
|---:|---|---|---:|
| 0 | margarida amarela | `#FFD23F` | 12009 |
| 1 | margarida azul | `#5AA9F0` | 12071 |
| 2 | margarida rosa | `#F58CC0` | 11833 |
| 3 | tulipa amarela | `#FFD23F` | 9966 |
| 4 | tulipa azul | `#5AA9F0` | 10374 |
| 5 | tulipa rosa | `#F58CC0` | 10334 |
| 6 | estrela amarela | `#FFD23F` | 8909 |
| 7 | estrela azul | `#5AA9F0` | 8876 |
| 8 | estrela rosa | `#F58CC0` | 8849 |

Comparação com a referência anterior à recoloração: **12.794 pixels creme** e **19.745 pixels verdes** conferidos; **zero alterações** nesses conjuntos. A cor base é exata; sombra e contorno têm os tons derivados necessários para preservar o desenho.

## Coordenadas dos fundos em 1280 × 720

As imagens publicadas continuam em 1672 × 941. As coordenadas desta seção se referem à escala de jogo **1280 × 720** (fatores X=1280/1672 e Y=720/941). Caixas de corpo e gramados são medições visuais aproximadas, com tolerância de 5–10 px; entradas foram segmentadas por cor e confirmadas visualmente. Gramado livre significa área útil sem obstáculos grandes; a arte conserva pequenos tufos decorativos.

### bg-trilha.png

| Região | Caixa (x, y, largura, altura), px | Centro / referência |
|---|---|---|
| Formigueiro, montinho visível | **(0, 326, 301, 225)** | aproximadamente (150,438); cortado parcialmente pela borda esquerda |
| Entrada escura do formigueiro | **(200, 417, 44, 90)** | **(221,5;461,5)** |
| Envelope da trilha visível | **(280, 436, 1000, 135)** | eixo na tabela abaixo |
| Gramado central útil | **(320, 130, 740, 235)** | entre a vegetação das bordas e a trilha |

A trilha tem leve inclinação/curvatura; eixo medido pela faixa de terra: 

| X | Y do eixo |
|---:|---:|
| 280 | 473 |
| 320 | 484.5 |
| 400 | 489.5 |
| 640 | 502 |
| 900 | 515.5 |
| 1100 | 521 |
| 1270 | 514 |

Prancha medida: [trilha-coordenadas-1280x720.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/trilha-coordenadas-1280x720.png>).

### bg-jardim.png

| Região | Caixa (x, y, largura, altura), px | Centro / referência |
|---|---|---|
| Colmeia, corpo e contorno | **(999, 91, 139, 141)** | **(1068;161,5)** |
| Entrada escura da colmeia | **(1026, 163, 26, 34)** | **(1038,5;179,5)** |
| Gramado livre útil para o canteiro | **(350, 175, 610, 415)** | **(655;382,5)** |
| Gramado inferior direito / flores caídas | **(985, 490, 220, 130)** | área livre sob a árvore |

Prancha medida: [jardim-coordenadas-1280x720.png](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/jardim-coordenadas-1280x720.png>). Dados: [cenarios-1280x720.json](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/cenarios-1280x720.json>).

## Conferência e rastreabilidade

As cinco folhas foram inspecionadas sobre fundo claro e escuro: transparência limpa e keylines preservados, sem halo. A direção das formigas permanece para a esquerda; a célula 6 é a pose sem folha. Os demais conteúdos e a ordem de poses foram preservados.

- formigas.png: [fundo claro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/formigas-claro.png>) e [fundo escuro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/formigas-escuro.png>).
- zuzu.png: [fundo claro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/zuzu-claro.png>) e [fundo escuro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/zuzu-escuro.png>).
- flores.png: [fundo claro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/flores-claro.png>) e [fundo escuro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/flores-escuro.png>).
- objetos.png: [fundo claro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/objetos-claro.png>) e [fundo escuro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/objetos-escuro.png>).
- pipa.png: [fundo claro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/pipa-claro.png>) e [fundo escuro](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/pipa-escuro.png>).
- [Prancha conjunta das folhas](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/folhas-conferencia.png>).
- [Processamento: caixas nos brutos, limpeza e recoloração](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/processamento-n1.json>).
- [Validação: dimensões, alfa, caixas, bases e cores](<D:/Documentos/Atesteme Jogos Fund 1/outputs/ventania-na-floresta/qa/validation-n1.json>).

Verificação automática concluída: 39 células medidas, dimensões finais e grades corretas; bases no fundo conforme o contrato; Zuzu e objetos centrados; zero pixels com alfa 1–47; zero RGB oculto em alfa 0; nenhuma ilha menor que 4 pixels no limiar de medição; hex exatos presentes em todas as flores; miolos creme e verde preservados. Os fundos opacos são idênticos aos brutos.

| Arquivo | SHA-256 final |
|---|---|
| bg-trilha.png | `55ef3dbc788d863605a6ebf210228f10cb8f95980d29c4d63597bfdd5d1664cd` |
| bg-jardim.png | `ae7c9f4e8c61dd6f9db4e29e66801ec7f837c2ab9a7bef885c27417468bd64fd` |
| formigas.png | `f57bb3a919e5d565d2c55e7f9dda8ff3e5571c31348ae31409214070440cc274` |
| zuzu.png | `6df527e51e82de151e428d56a3dcf601c71b302b42ffd621d595e619595802cd` |
| flores.png | `067282857fe33e393db66631ab7161f2ec08e88b054c10f028c6b5adfa90694c` |
| objetos.png | `b052a32a36f09884f0e34218530e80f5d12abb4e7b35d00b1990551834c729fc` |
| pipa.png | `251080893f33c4737b651cf5be4276805385e4898b2c788a0653bc7ba8ef05c0` |

Escopo: sete PNGs do N1 e este MANIFEST. Brutos e conferências ficam em outputs. Nenhum código foi editado e nenhum commit foi criado.
