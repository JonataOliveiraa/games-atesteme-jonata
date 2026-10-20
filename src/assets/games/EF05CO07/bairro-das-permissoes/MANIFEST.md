# Bairro das Permissões — manifesto dos assets (lote 1)

Originais: `outputs/bairro-das-permissoes/raw/`. Alfa limpo com corte dos pixels de baixa opacidade, abertura morfológica de 2 px e descarte de componentes soltos; cápsulas de movimento foram mantidas. A folha de casas foi separada por silhuetas inteiras antes de remontar a grade. Tamanhos em bytes dos PNGs finais.

## Arquivos

| Arquivo | Dimensões | Grade | Quadro | Peso | Escala da família |
|---|---:|---:|---:|---:|---|
| `crianca.png` | 768 × 768 | 4 × 4 | 192 × 192 | 298255 B | 0,600 uniforme desde o original |
| `casas.png` | 1536 × 768 | 4 × 2 | 384 × 384 | 894337 B | casas: x = 0,910; oficinas: x = 0,840; y calibrado pela placa e pela base da porta |
| `mochila.png` | 128 × 128 | 1 × 1 | 128 × 128 | 10390 B | 0,108 uniforme desde o original |

Os valores `dx`, `dy`, `w`, `h` são a caixa alfa (limiar > 16) relativa à célula. `base = dy + h`; `originX = (dx + w/2) / largura da célula`; `footPad = altura da célula - base`.

## crianca.png

Pé de todos os quadros em **(96, 176)**; referência de origem de Phaser (0,5; 0,9167). Os marcadores de movimento soltos pertencem à silhueta.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | frente, passo esquerdo | 54 | 16 | 84 | 160 | 176 | 0.5000 | 16 |
| 1 | frente, passagem | 54 | 20 | 84 | 156 | 176 | 0.5000 | 16 |
| 2 | frente, passo direito | 56 | 16 | 80 | 160 | 176 | 0.5000 | 16 |
| 3 | frente, passagem | 56 | 16 | 80 | 160 | 176 | 0.5000 | 16 |
| 4 | costas, passo esquerdo | 50 | 18 | 92 | 158 | 176 | 0.5000 | 16 |
| 5 | costas, passagem | 54 | 18 | 84 | 158 | 176 | 0.5000 | 16 |
| 6 | costas, passo direito | 50 | 18 | 92 | 158 | 176 | 0.5000 | 16 |
| 7 | costas, passagem | 54 | 17 | 84 | 159 | 176 | 0.5000 | 16 |
| 8 | lado direito, passo esquerdo | 36 | 21 | 120 | 155 | 176 | 0.5000 | 16 |
| 9 | lado direito, passagem | 38 | 20 | 116 | 156 | 176 | 0.5000 | 16 |
| 10 | lado direito, passo direito | 31 | 21 | 130 | 155 | 176 | 0.5000 | 16 |
| 11 | lado direito, passagem | 38 | 23 | 116 | 153 | 176 | 0.5000 | 16 |
| 12 | parada de frente | 54 | 18 | 84 | 158 | 176 | 0.5000 | 16 |
| 13 | parada de costas | 53 | 16 | 86 | 160 | 176 | 0.5000 | 16 |
| 14 | parada de lado direito | 55 | 18 | 82 | 158 | 176 | 0.5000 | 16 |
| 15 | derrapagem à direita | 24 | 29 | 144 | 147 | 176 | 0.5000 | 16 |

## casas.png

Placa branca redesenhada como círculo liso em **(192, 96)**, **diâmetro 116 px** em todas as células. Porta/portão centrado em **x = 192**, com a base em **y = 352**. A largura abaixo é medida na linha **y = 290** da célula, inclusive quando há maçaneta/listras.

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad | porta/portão em y=290 | placa (centro; diâmetro) |
|---:|---|---:|---:|---:|---:|---:|---:|---|---|
| 0 | casa amarela | 16 | 10 | 351 | 342 | 352 | 0.4987 | 32 | x=139–243 (105 px); pé (192,352) | (192,96); 116 px |
| 1 | casa rosa | 16 | 10 | 351 | 342 | 352 | 0.4987 | 32 | x=139–244 (106 px); pé (192,352) | (192,96); 116 px |
| 2 | casa azul-celeste | 16 | 10 | 351 | 342 | 352 | 0.4987 | 32 | x=139–243 (105 px); pé (192,352) | (192,96); 116 px |
| 3 | casa lilás | 16 | 10 | 352 | 342 | 352 | 0.5000 | 32 | x=138–244 (107 px); pé (192,352) | (192,96); 116 px |
| 4 | oficina fechada | 18 | 27 | 348 | 325 | 352 | 0.5000 | 32 | x=93–292 (200 px); pé (192,352) | (192,96); 116 px |
| 5 | oficina aberta | 19 | 28 | 348 | 324 | 352 | 0.5026 | 32 | x=90–293 (204 px); pé (192,352) | (192,96); 116 px |
| 6 | casa pêssego | 14 | 9 | 354 | 343 | 352 | 0.4974 | 32 | x=138–243 (106 px); pé (192,352) | (192,96); 116 px |
| 7 | casa água-clara | 14 | 9 | 354 | 343 | 352 | 0.4974 | 32 | x=137–242 (106 px); pé (192,352) | (192,96); 116 px |

A escala vertical de cada prédio foi ajustada em duas faixas contínuas para conservar a placa em y=96 e a base em y=352. Casas: fator superior 0,943–0,951 e inferior 1,004–1,020. Oficinas: superior 0,975 e inferior 1,051–1,056. A escala horizontal é única por família, como na tabela de arquivos.

## mochila.png

Margem superior e inferior de 10 px (7,8%); centro da caixa alfa em (64, 64).

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|
| 0 | mochila laranja | 17 | 10 | 94 | 108 | 118 | 0.5000 | 10 |

## Cores amostradas dos PNGs finais

Amostras de pixels reais após a limpeza e o redimensionamento (coordenadas locais do quadro):

| Elemento | Ponto | RGBA |
|---|---:|---|
| Camiseta da criança | (96,100) | #00BEFA / 254 |
| Bermuda da criança | (96,125) | #144A88 / 253 |
| Pele da criança | (96,73) | #FEB596 / 253 |
| Mochila nas costas | (95,88) do quadro 4 | #FC811C / 253 |
| Parede amarela | (100,275) do quadro 0 | #FCD029 / 253 |
| Telhado laranja | (192,20) do quadro 0 | #D86520 / 253 |
| Porta azul | (192,285) do quadro 0 | #10ADFB / 254 |
| Parede rosa | (100,275) do quadro 1 | #EF9DDB / 253 |
| Parede azul-celeste | (100,275) do quadro 2 | #76D9FC / 254 |
| Parede lilás | (100,275) do quadro 3 | #D4B9FB / 254 |
| Oficina, parede | (100,275) do quadro 4 | #C4C9D4 / 254 |
| Parede pêssego | (100,275) do quadro 6 | #FCC0A1 / 253 |
| Parede água-clara | (100,275) do quadro 7 | #A0F6FC / 254 |
| Mochila, aba | (64,45) | #FD9922 / 254 |
| Mochila, fivela | (64,70) | #FCD603 / 254 |
| Mochila, bolso | (64,90) | #E1500C / 254 |

## Observação da arte crua

Os originais têm gradientes e leve variação de cor dentro das formas, embora TEXTURAS.md peça cores chapadas. A edição eliminou sujeira e corrigiu geometria/alfa; redesenhar as formas seria necessário para deixá-las integralmente chapadas.

Os arquivos acima compõem o lote 1.


# Lote 2 — ícones e enfeites

Originais: `outputs/bairro-das-permissoes/raw/{icones,enfeites,enfeites2}.png`. Processamento com Node + sharp. Todas as silhuetas foram medidas na folha inteira antes de qualquer separação por célula. Recorte por componentes completos, sem pivôs para compensar cortes. Os nomes de arquivo em português são mantidos conforme o contrato explícito de TEXTURAS.md.

## Arquivos entregues

| Arquivo | Dimensões | Grade | frameWidth | frameHeight | Peso | Escala desde o original |
|---|---:|---:|---:|---:|---:|---|
| `icones.png` | 512 × 384 | 4 × 3 | 128 | 128 | 32672 B | maior eixo normalizado a 102 px (79,69% da célula); fatores abaixo |
| `enfeites.png` | 1024 × 512 | 4 × 2 | 256 | 256 | 40239 B | 0,528395 comum às duas folhas de enfeites |
| `enfeites2.png` | 1024 × 512 | 4 × 2 | 256 | 256 | 42576 B | 0,528395 comum às duas folhas de enfeites |

Escala de uso de referência: **1,0 por família**, pois os arquivos já estão no tamanho final de TEXTURAS.md. Os dois lotes de enfeites compartilham um fator de processamento de **214/405 = 0,528395**; preservam as proporções relativas de largura e altura dos objetos originais. Somente os ícones são normalizados individualmente, como solicitado, para cerca de 80% da célula. As dimensões de redimensionamento são arredondadas ao par mais próximo (até 1 px de diferença por eixo) para manter o centro alfa exatamente em x=128 / x=64. Não há upscale.

## Limpeza e inspeção da folha inteira

Alfa original ≤ 220 descartado; máscara sólida submetida a abertura morfológica circular de raio 2 px e descarte de componentes conexos com menos de 200 pixels. Os jatos e quatro gotas do chafariz são componentes legítimos e foram preservados (sete componentes no total). O alfa restante foi solidificado antes de reduzir com Lanczos3; a antisserrilha final vem da redução, sem reaproveitar os pixels da franja colorida. Pixels finais de alfa ≤ 16 foram zerados.

Corridas globais de colunas e linhas no original, com alfa > 16 (extremos inclusivos):

| Folha | Dimensões originais | Colunas ocupadas | Linhas ocupadas |
|---|---:|---|---|
| `icones.png` | 1448 × 1086 | 72–350; 393–722; 767–1065; 1125–1387 | 89–379; 419–689; 728–1025 |
| `enfeites.png` | 1774 × 887 | 57–426; 517–808; 906–1286; 1356–1703 | 73–424; 467–834 |
| `enfeites2.png` | 1774 × 887 | 55–423; 502–851; 909–1278; 1334–1741 | 82–397; 467–844 |

Nenhuma corrida atravessa a fronteira nominal de coluna na folha original. A primeira linha de ícones chega a y=379, ultrapassando a fronteira nominal de y=362; por isso cada silhueta foi extraída inteira por componentes, em vez de cortar a grade original. A nova grade é exata e todas as caixas têm margem.

As tabelas abaixo foram medidas novamente nos PNGs finais, com alfa > 16. `base = dy+h` é a borda inferior exclusiva (o último pixel ocupado é base−1); `footPad = frameHeight−base`. Centro alfa dos ícones em (64,64); centro horizontal alfa dos enfeites em x=128 e base=240. Origens de referência dos enfeites: (0,5; 0,9375).

## icones.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad | Fator de redução |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | fotos | 21 | 13 | 86 | 102 | 115 | 0.5000 | 13 | 0.368231 |
| 1 | lanterna | 13 | 27 | 102 | 74 | 101 | 0.5000 | 27 | 0.323810 |
| 2 | calculadora | 18 | 13 | 92 | 102 | 115 | 0.5000 | 13 | 0.401575 |
| 3 | música | 13 | 13 | 102 | 102 | 115 | 0.5000 | 13 | 0.425000 |
| 4 | mapa | 13 | 15 | 102 | 98 | 113 | 0.5000 | 15 | 0.368231 |
| 5 | joguinho | 13 | 32 | 102 | 64 | 96 | 0.5000 | 32 | 0.311927 |
| 6 | câmera | 13 | 24 | 102 | 80 | 104 | 0.5000 | 24 | 0.360424 |
| 7 | contatos | 13 | 14 | 102 | 100 | 114 | 0.5000 | 14 | 0.408000 |
| 8 | microfone | 31 | 13 | 66 | 102 | 115 | 0.5000 | 13 | 0.356643 |
| 9 | alto-falante | 26 | 13 | 76 | 102 | 115 | 0.5000 | 13 | 0.360424 |
| 10 | videochamada | 13 | 17 | 102 | 94 | 111 | 0.5000 | 17 | 0.346939 |
| 11 | localização | 25 | 13 | 78 | 102 | 115 | 0.5000 | 13 | 0.408000 |

## enfeites.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | árvore | 32 | 56 | 192 | 184 | 240 | 0.5000 | 16 |
| 1 | pinheiro | 51 | 56 | 154 | 184 | 240 | 0.5000 | 16 |
| 2 | arbusto | 33 | 130 | 190 | 110 | 240 | 0.5000 | 16 |
| 3 | canteiro de flores | 37 | 96 | 182 | 144 | 240 | 0.5000 | 16 |
| 4 | banco | 32 | 98 | 192 | 142 | 240 | 0.5000 | 16 |
| 5 | poste de luz | 95 | 48 | 66 | 192 | 240 | 0.5000 | 16 |
| 6 | chafariz | 28 | 62 | 200 | 178 | 240 | 0.5000 | 16 |
| 7 | vazia, alfa=0 em todos os pixels | — | — | 0 | 0 | — | — | — |

## enfeites2.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | laguinho | 32 | 166 | 192 | 74 | 240 | 0.5000 | 16 |
| 1 | pedras | 36 | 126 | 184 | 114 | 240 | 0.5000 | 16 |
| 2 | escorregador | 31 | 76 | 194 | 164 | 240 | 0.5000 | 16 |
| 3 | gangorra | 21 | 144 | 214 | 96 | 240 | 0.5000 | 16 |
| 4 | carrinho de sorvete | 41 | 42 | 174 | 198 | 240 | 0.5000 | 16 |
| 5 | hidrante | 64 | 98 | 128 | 142 | 240 | 0.5000 | 16 |
| 6 | caixa de correio | 67 | 66 | 122 | 174 | 240 | 0.5000 | 16 |
| 7 | canteiro grande | 23 | 114 | 210 | 126 | 240 | 0.5000 | 16 |

## Cores do lote 2 — pixels reais

Amostras GetPixel dos PNGs finais; coordenadas locais de cada quadro.

| Arquivo | Quadro | Elemento | Ponto local | RGBA |
|---|---:|---|---|---|
| icones.png | 0 | fotos: céu | (64,55) | #5AD5FC / 255 |
| icones.png | 1 | lanterna: corpo | (40,64) | #0189F6 / 255 |
| icones.png | 2 | calculadora: corpo | (25,105) | #6F33C1 / 255 |
| icones.png | 3 | música: haste | (82,30) | #FC3B43 / 255 |
| icones.png | 4 | mapa: painel | (30,76) | #12C1FD / 255 |
| icones.png | 5 | joguinho: corpo | (70,55) | #612FB1 / 255 |
| icones.png | 6 | câmera: corpo | (32,90) | #0189F6 / 255 |
| icones.png | 7 | contatos: capa | (75,30) | #FDAD01 / 255 |
| icones.png | 8 | microfone: cabeça | (64,28) | #3D3C3B / 255 |
| icones.png | 9 | alto-falante: caixa | (35,40) | #3B3A3A / 255 |
| icones.png | 10 | videochamada: moldura | (20,65) | #18C4FD / 255 |
| icones.png | 11 | localização: alfinete | (64,85) | #FC3B43 / 255 |
| enfeites.png | 0 | árvore: copa | (128,90) | #3B772A / 255 |
| enfeites.png | 0 | árvore: tronco | (128,220) | #7C4426 / 255 |
| enfeites.png | 1 | pinheiro: copa | (128,160) | #2D662E / 255 |
| enfeites.png | 2 | arbusto | (128,185) | #367731 / 255 |
| enfeites.png | 3 | flor central: miolo | (128,130) | #FDC104 / 255 |
| enfeites.png | 4 | banco: madeira | (128,170) | #D37539 / 255 |
| enfeites.png | 5 | poste: lâmpada | (128,75) | #FCF3C8 / 255 |
| enfeites.png | 6 | chafariz: água | (128,140) | #3AC6F8 / 255 |
| enfeites.png | 6 | chafariz: pedra | (80,225) | #8F9CA8 / 255 |
| enfeites2.png | 0 | lago: água | (128,210) | #2BBAFD / 255 |
| enfeites2.png | 1 | pedra grande | (128,180) | #999A9F / 255 |
| enfeites2.png | 2 | escorregador | (128,150) | #FDC310 / 255 |
| enfeites2.png | 3 | gangorra | (128,188) | #FE6D1B / 255 |
| enfeites2.png | 4 | carrinho: corpo | (100,190) | #068AEF / 255 |
| enfeites2.png | 5 | hidrante: corpo | (90,190) | #FDA501 / 255 |
| enfeites2.png | 6 | caixa de correio | (128,130) | #1B89FC / 255 |
| enfeites2.png | 7 | canteiro: madeira | (128,210) | #B36E46 / 255 |


## Validação e limites da arte

Conferidos: dimensões e ordem dos 28 quadros; célula vazia com alfa=0; caixas alfa medidas nos arquivos finais; enfeites com centro x=128, base=240 e footPad=16; ícones com centro (64,64) e maior eixo de 102 px; leitura visual dos ícones em células de 40 px; ausência de pontinhos e franja colorida nas prévias sobre fundo claro. Os três arquivos somam 115487 B, contra 2078689 B dos originais (redução de 94,44%).

Pendente da arte original: há gradientes, variação de cor e leve irregularidade nas bordas das formas, contrariando o vetor integralmente chapado de TEXTURAS.md. A limpeza de alfa e o reempacotamento não corrigem esse estilo; exigiria redesenho da Aquarela. Nenhum código foi editado. Sem outras pendências deste lote.
