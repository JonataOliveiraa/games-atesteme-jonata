# Rádio da Escola — MANIFEST dos assets

Entrega: 20/10/2026. Destino: `src/assets/games/EF05CO09/radio-da-escola/`. Originais preservados em `outputs/radio-da-escola/raw/`. Edição, prévias e medições em `outputs/radio-da-escola/editor/` no D:. Nenhum código alterado; nenhum commit ou push.

## Arquivos

| Arquivo | Dimensões | Grade | frameWidth | frameHeight | Alfa | Peso |
|---|---:|---:|---:|---:|---|---:|
| `palco.png` | 1280 × 720 | 1 × 1 | 1280 | 720 | opaco RGB | 328132 B |
| `duda.png` | 1280 × 400 | 4 × 1 | 320 | 400 | sim | 142980 B |
| `donos.png` | 1536 × 1024 | 6 × 4 | 256 | 256 | sim | 287667 B |
| `capas.png` | 1024 × 512 | 4 × 2 | 256 | 256 | opaco RGB | 178844 B |
| `ui.png` | 1024 × 512 | 4 × 2 | 256 | 256 | sim | 80551 B |
| `cover-radio-da-escola.png` | 1672 × 941 | 1 × 1 | 1672 | 941 | opaco RGB | 509254 B |

Nomes mantidos conforme contrato de TEXTURAS.md. Para todos os quadros, caixa alfa com limiar > 16: `dx`, `dy`, `w`, `h`; `base=dy+h` (borda inferior exclusiva); `originX=(dx+w/2)/frameWidth`; `footPad=frameHeight-base`. Escala de uso de referência: **1,0 para cada família**, pois os PNGs já estão nas dimensões finais. Valores derivados da caixa alfa não substituem a origem fixa dos bustos.

## Limpeza e reempacotamento

Folhas inteiras analisadas antes de medir células: corridas de colunas e linhas com alfa >16, extração de componentes completos e reempacotamento em grade exata. Alfa original ≤220 descartado; máscara solidificada, abertura morfológica circular para remover saliências, descarte de componentes minúsculos e redução Lanczos3. Pixels finais de alfa ≤16 zerados. Os componentes legítimos das expressões (notas, estrelas e marcas de raiva) foram preservados.

Duda: abertura de raio 1 px e componentes ≥200 px no original. UI: raio 2 px e componentes ≥200 px. Donos: após normalizar para a grade comum de 256 px, raio 1 px e componentes ≥40 px; 2 componentes espúrios descartados em donos-a. Nos opacos, não há franja de alfa; o filtro conservador de impulsos RGB isolados não encontrou pontinhos espúrios, mantendo as estrelas e luzes desenhadas. Capas foram separadas antes de redimensionar, evitando mistura nas junções.

## Escalas de processamento e âncoras

- **Palco:** original 1672×941 → 1280×720; fatores x=0,765550239 e y=0,765143464.
- **Capa:** 1672×941 preservados, escala 1,0, RGB opaco.
- **Capas:** grade original 1774×887; cada retângulo de 443/444 px foi reduzido diretamente a 256×256, sem gutters nem molduras acrescentadas.
- **Duda:** escala única 352/608=0,578947368; mesma janela de origem de 552×608 px nos quatro quadros, y=66…673. Cabeça/ombros ancorados pelo mesmo marco superior do cabelo (x≈129,36 local). Figura com 352 px (88%); topo=24, cintura reta em base=376 e footPad=24 em todos. Usar origem fixa (0,5;0,5) ou a mesma outra origem para a família; não recentrar pela caixa de cada pose.
- **UI:** cada símbolo independente normalizado ao maior eixo de 214 px (~83,6% da célula; ~8,2% de margem em cada lado do maior eixo). Fatores individuais na tabela; centro alfa sempre (128,128).
- **Donos:** densidade normalizada antes de escalar: donos-a 2172×724 →1536×512 (fator 128/181=0,707182320); donos-b já 1536×512 (1,0). Depois, **uma única escala 0,96** nas duas metades e em todos os personagens, sem normalizar cada rosto pela própria altura. Fatores desde os originais: a=0,678895028; b=0,960000000; nenhum upscale.

### Donos: enquadramento dos rostos

Referência manual do ponto médio dos olhos/arcadas fixada em **(128,128)** em todas as células; a inclinação dos rostos é preservada. Traduções arredondadas ao pixel podem variar a âncora em até 0,5 px. Escala dos rostos preservada, sem girar, esticar ou redimensionar por personagem. A faixa inferior da roupa foi prolongada verticalmente em **14–36 px**, copiando a última linha sólida, para compensar as distâncias diferentes entre olhos e ombros nos originais; o corte reto fica em **y=236** (último pixel ocupado y=235), com **footPad=20** em todos. Os rostos e o cabelo não foram deformados.

Altura alfa média (incluindo enfeites): **215.08 px = 84.02% da célula**; intervalo 202–230 px, devido às diferenças naturais de cabelo/boné/pose. Uma escala comum preserva essas diferenças. Usar origem fixa (0,5;0,5) para a folha; a coluna originX abaixo é somente a medida da caixa alfa exigida pelo manifesto.

## Medidas por quadro

### palco.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | palco espacial | 0 | 0 | 1280 | 720 | 720 | 0.5000 | 0 |

### duda.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | falando | 22 | 24 | 267 | 352 | 376 | 0.4859 | 24 |
| 1 | cantando | 18 | 24 | 287 | 352 | 376 | 0.5047 | 24 |
| 2 | susto | 20 | 24 | 269 | 352 | 376 | 0.4828 | 24 |
| 3 | comemorando | 21 | 24 | 289 | 352 | 376 | 0.5172 | 24 |

### donos.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | Bia — ouvindo | 46 | 29 | 178 | 207 | 236 | 0.5273 | 20 |
| 1 | Bia — feliz dançando | 24 | 34 | 197 | 202 | 236 | 0.4785 | 20 |
| 2 | Bia — bravo | 44 | 24 | 179 | 212 | 236 | 0.5215 | 20 |
| 3 | Téo — ouvindo | 32 | 10 | 180 | 226 | 236 | 0.4766 | 20 |
| 4 | Téo — feliz dançando | 27 | 10 | 186 | 226 | 236 | 0.4688 | 20 |
| 5 | Téo — bravo | 40 | 6 | 172 | 230 | 236 | 0.4922 | 20 |
| 6 | Malu — ouvindo | 40 | 27 | 180 | 209 | 236 | 0.5078 | 20 |
| 7 | Malu — feliz dançando | 34 | 25 | 179 | 211 | 236 | 0.4824 | 20 |
| 8 | Malu — bravo | 38 | 30 | 178 | 206 | 236 | 0.4961 | 20 |
| 9 | Caio — ouvindo | 46 | 22 | 157 | 214 | 236 | 0.4863 | 20 |
| 10 | Caio — feliz dançando | 31 | 20 | 193 | 216 | 236 | 0.4980 | 20 |
| 11 | Caio — bravo | 51 | 17 | 156 | 219 | 236 | 0.5039 | 20 |
| 12 | Iara — ouvindo | 36 | 21 | 194 | 215 | 236 | 0.5195 | 20 |
| 13 | Iara — feliz dançando | 11 | 25 | 228 | 211 | 236 | 0.4883 | 20 |
| 14 | Iara — bravo | 33 | 20 | 193 | 216 | 236 | 0.5059 | 20 |
| 15 | Juca — ouvindo | 57 | 34 | 161 | 202 | 236 | 0.5371 | 20 |
| 16 | Juca — feliz dançando | 15 | 29 | 206 | 207 | 236 | 0.4609 | 20 |
| 17 | Juca — bravo | 46 | 22 | 154 | 214 | 236 | 0.4805 | 20 |
| 18 | Rosa — ouvindo | 36 | 16 | 196 | 220 | 236 | 0.5234 | 20 |
| 19 | Rosa — feliz dançando | 15 | 18 | 225 | 218 | 236 | 0.4980 | 20 |
| 20 | Rosa — bravo | 40 | 19 | 188 | 217 | 236 | 0.5234 | 20 |
| 21 | Zeca — ouvindo | 41 | 18 | 193 | 218 | 236 | 0.5371 | 20 |
| 22 | Zeca — feliz dançando | 15 | 20 | 221 | 216 | 236 | 0.4902 | 20 |
| 23 | Zeca — bravo | 49 | 6 | 187 | 230 | 236 | 0.5566 | 20 |

### capas.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | Chuva no Telhado — Bia | 0 | 0 | 256 | 256 | 256 | 0.5000 | 0 |
| 1 | Parabéns, Vovó! — Téo | 0 | 0 | 256 | 256 | 256 | 0.5000 | 0 |
| 2 | Canção do Gato — Malu | 0 | 0 | 256 | 256 | 256 | 0.5000 | 0 |
| 3 | Batuque do Recreio — Caio | 0 | 0 | 256 | 256 | 256 | 0.5000 | 0 |
| 4 | Foguete Dançante — Iara | 0 | 0 | 256 | 256 | 256 | 0.5000 | 0 |
| 5 | Pula-Corda — Juca | 0 | 0 | 256 | 256 | 256 | 0.5000 | 0 |
| 6 | Sapo Cantor — Rosa | 0 | 0 | 256 | 256 | 256 | 0.5000 | 0 |
| 7 | Assobio do Zeca — Zeca | 0 | 0 | 256 | 256 | 256 | 0.5000 | 0 |

### ui.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad | Fator |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | nota | 21 | 91 | 214 | 74 | 165 | 0.5000 | 91 | 0.558747 |
| 1 | brilho de acerto | 21 | 28 | 214 | 200 | 228 | 0.5000 | 28 | 0.625731 |
| 2 | bilhete | 21 | 70 | 214 | 116 | 186 | 0.5000 | 70 | 0.540404 |
| 3 | estojo de CD | 21 | 32 | 214 | 192 | 224 | 0.5000 | 32 | 0.584699 |
| 4 | disco | 21 | 22 | 214 | 212 | 234 | 0.5000 | 22 | 0.576819 |
| 5 | coração | 21 | 38 | 214 | 180 | 218 | 0.5000 | 38 | 0.616715 |
| 6 | moldura ao vivo | 21 | 22 | 214 | 212 | 234 | 0.5000 | 22 | 0.581522 |
| 7 | estrela | 25 | 21 | 206 | 214 | 235 | 0.5000 | 21 | 0.635015 |

### cover-radio-da-escola.png

| Quadro | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | capa — Rádio da Escola | 0 | 0 | 1672 | 941 | 941 | 0.5000 | 0 |

## UI — medidas para NOTE, DISC.label, CRATE.window e LIVE.hole

Coordenadas abaixo são locais da célula de 256 px; vazios identificados como componentes transparentes internos (alfa≤16, já zerado no PNG final). Percentuais relativos à caixa alfa do próprio objeto, não à célula.

| Elemento | Medida real | Proporção |
|---|---|---|
| Nota (quadro 0) | 214×74 px | **w/h=2,8919**, h/w=34,58% |
| Disco (quadro 4) | 214×212 px; raio externo médio=106,5 px | referência para o selo |
| Selo branco do disco | raio médio da área branca=43,625 px; contorno externo≈46 px; centro do furo≈(127,5;128,5) | **40,96%** do raio externo para o branco; ≈43,19% incluindo o contorno marinho |
| Furo do disco | caixa x=111, y=112, 34×34 px, transparente | diâmetro≈15,96% do disco |
| Estojo (quadro 3) | caixa x=21, y=32, 214×192 px | original levemente retangular; proporção preservada |
| Janela do estojo | principal vazio x=57, y=48, 164×162 px; centro=(138,5;128,5) | **76,64% da largura e 84,38% da altura** da caixa; área transparente principal=58,04% da área da caixa |
| Retângulo inteiramente livre da janela | x=79, y=72, 112×118 px | sem sobreposição das diagonais brancas/reflexos do original |
| Anel ao vivo (quadro 6) | caixa x=21, y=22, 214×212 px | diâmetro externo médio=213 px |
| Miolo transparente do anel | x=52, y=53, 151×150 px; centro≈(127;127,5) | **70,56% da largura / 70,75% da altura**; razão média de raios≈**70,66%** |

Selo do disco medido em 24 direções a cada 15°, usando o primeiro trecho branco neutro após o furo, sem incluir as faixas prateadas externas. Raio da área branca varia de 43 a 45 px. O selo não corresponde aos 36% nominais do prompt; usar a medida real acima. A janela tem diagonais opacas nas quinas e uma dobradiça larga à esquerda: seu centro está deslocado ~10,5 px para a direita do centro da célula.

## Palco e capa — conferência

O centro x=400…880 permanece escuro, com poucos pontos de luz; não há público na ampla região central. A linha luminosa da plataforma ficou em **y≈605…615**, acima dos 640 px nominais do prompt; abaixo dela há o piso escuro. Nas pontas inferiores, as silhuetas e bastões chegam aproximadamente a x≈290 e x≈990 (leitura visual), ultrapassando um pouco os limites 260/1020 pedidos para os cantos. O arquivo foi redimensionado conforme solicitado, mantendo a composição original.

Título da capa conferido visualmente: **Rádio da Escola**, com acento no á. A capa original traz também um microfone de mão, além do headset.

## Corridas das folhas inteiras (originais)

Extremos inclusivos, alfa>16. Nenhuma silhueta foi recortada pela fronteira nominal de célula.

| Folha | Colunas ocupadas | Linhas ocupadas |
|---|---|---|
| duda.png | 45–509; 578–1074; 1116–1580; 1652–2149 | 65–680 |
| ui.png | 30–416; 493–841; 912–1309; 1368–1736 | 53–385; 463–833 |
| donos-a.png | 73–340; 403–702; 775–1041; 1127–1395; 1493–1779; 1863–2120 | 41–344; 390–685 |
| donos-b.png | 24–232; 262–505; 538–747; 798–1000; 1030–1266; 1309–1505 | 33–234; 283–490 |

## Cores amostradas — GetPixel

Pixels reais dos PNGs finais; coordenadas locais por quadro.

| Arquivo | Quadro | Elemento | Ponto local | RGBA |
|---|---:|---|---|---|
| palco.png | 0 | céu central | (640,300) | #1C0B5A / 255 |
| palco.png | 0 | borda ciano | (640,610) | #21FAFF / 255 |
| palco.png | 0 | borda rosa | (640,615) | #F718C6 / 255 |
| duda.png | 0 | camiseta | (200,350) | #1BC4FD / 255 |
| duda.png | 0 | pele | (180,190) | #D27153 / 255 |
| ui.png | 0 | nota: branco | (80,140) | #FCFDFD / 255 |
| ui.png | 0 | nota: símbolo cinza | (128,128) | #CAC9CB / 255 |
| ui.png | 2 | bilhete: papel | (110,140) | #FCF7E7 / 255 |
| ui.png | 4 | disco: selo branco | (128,95) | #FCFDFD / 255 |
| ui.png | 5 | coração | (120,110) | #FB2C9A / 255 |
| ui.png | 6 | anel: rosa | (128,30) | #FD2E9D / 255 |
| donos.png | 0 | Bia: roupa | (128,225) | #FADF43 / 255 |
| donos.png | 3 | Téo: roupa | (128,225) | #3626A1 / 255 |
| donos.png | 6 | Malu: roupa | (128,225) | #130E3E / 255 |
| donos.png | 9 | Caio: roupa | (128,225) | #F91B4B / 255 |
| donos.png | 12 | Iara: roupa | (90,225) | #06C3FB / 255 |
| donos.png | 15 | Juca: roupa | (128,225) | #F3F3F4 / 255 |
| donos.png | 18 | Rosa: roupa | (128,225) | #FA2886 / 255 |
| donos.png | 21 | Zeca: roupa | (128,225) | #F3F3F4 / 255 |
| capas.png | 0 | fundo da capa | (8,8) | #21B4FE / 255 |
| capas.png | 1 | fundo da capa | (8,8) | #FC7BD5 / 255 |
| capas.png | 2 | fundo da capa | (8,8) | #8B54FC / 255 |
| capas.png | 3 | fundo da capa | (8,8) | #FEE64B / 255 |
| capas.png | 4 | fundo da capa | (8,8) | #26238D / 255 |
| capas.png | 5 | fundo da capa | (8,8) | #33E0A7 / 255 |
| capas.png | 6 | fundo da capa | (8,8) | #35E0CC / 255 |
| capas.png | 7 | fundo da capa | (8,8) | #FDAF72 / 255 |

## Validação e limites

Conferidos por leitura dos PNGs finais: dimensões, canais RGB/RGBA, ordem dos quadros, caixas alfa, margem nas bordas, base e faixa transparente inferior dos 24 donos, cintura dos quatro quadros da Duda e vazios da UI. Prévias sobre fundo claro inspecionadas visualmente.

Os originais têm variações de cor, pequenos sombreados e irregularidades de contorno, apesar do pedido de cor integralmente chapada. A limpeza de alfa não redesenha essas áreas. Em especial, a silhueta do cabelo da Iara feliz tem uma pequena reentrância clara no alto, e os enfeites de notas/estrelas do primeiro lote têm traço mais fino. Corrigir integralmente esses aspectos exigiria retoque de desenho ou regeneração. Sem pendências de montagem; todos os seis PNGs estão prontos.
