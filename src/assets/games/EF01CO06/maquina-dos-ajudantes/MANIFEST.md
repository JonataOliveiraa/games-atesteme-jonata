# Máquina dos Ajudantes — manifesto dos assets

Coordenadas em pixels do PNG final, origem (0,0) no canto superior esquerdo. Caixas `(x0,y0,x1,y1)` usam os limites visuais aproximados quando indicadas com `≈`; caixas alfa das folhas são medidas com alfa > 16. Nas células, `dx,dy` são locais; `base=dy+h`, `originX=(dx+w/2)/frameWidth` e `footPad=frameHeight-base`. Alfa de fundo é zero nas três folhas e na máquina; células 7 e 8 de `pecas` são inteiramente transparentes.

| Arquivo | Tamanho | Grade / quadro | Conteúdo |
|---|---:|---|---|
| `bg-casinha.png` | 1280×720 | — | Quintal, varal, bancada, dois quartos; opaco |
| `maquina.png` | 640×980 | — | Máquina de presentes; alfa |
| `aparelhos.png` | 768×768 | 2×2; 384×384 | Relógio, caixa de som, telefone, tablet |
| `pessoas.png` | 1920×1728 | 5×3; 384×576 | Colunas: menino na cama, bebê no berço, menina no sofá, menino na poltrona, festa. Linhas: antes, ajudada, engraçada |
| `pecas.png` | 768×768 | 3×3; 256×256 | Presente, notas de festa, notas de ninar, coração, coelho, rosto da vovó, dedo; 7–8 vazias |
| `cover-maquina-dos-ajudantes.png` | 1672×941 | — | Capa com título “Máquina dos Ajudantes”; opaca |

## Cenário: `bg-casinha.png`

| Elemento | Medida no PNG |
|---|---|
| Quarto esquerdo, área interna visível | ≈ (742,286,955,568) |
| Quarto direito, área interna visível | ≈ (1009,286,1223,568) |
| Piso visível, quarto esquerdo | topo y≈494; até y≈568 |
| Piso visível, quarto direito | topo y≈494; até y≈568 |
| Tampo da bancada | x≈376–667; topo y≈527; superfície útil x≈400–640 |
| Pregadores, ponto inferior onde a foto pendura | ≈ (162,199), (294,215), (434,215), (579,195) |
| Corda | ponta esquerda (43,146), meio (350,190), ponta direita (658,144) |

Os quartos e o piso ficaram acima do y≈680 solicitado na arte crua; estas são as posições reais para montar a cena.

## Máquina: `maquina.png`

| Elemento | Medida no PNG |
|---|---|
| Centro da fenda vertical da ficha | ≈ (320,679) |
| Portinhola fechada, aro externo | ≈ (188,727,452,902) |
| Portinhola, painel coral móvel | ≈ (207,747,431,881) |

A fenda e a portinhola vieram no centro do gabinete, em vez das posições planejadas (470,520) e (500,800). Para acertar a animação, use as posições reais acima.

## Aparelhos: `aparelhos.png`

| Célula | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | despertador | 47 | 30 | 293 | 339 | 369 | 0,5039 | 15 |
| 1 | caixa de som | 41 | 33 | 297 | 336 | 369 | 0,4935 | 15 |
| 2 | telefone | 56 | 5 | 274 | 349 | 354 | 0,5026 | 30 |
| 3 | tablet | 48 | 17 | 297 | 336 | 353 | 0,5117 | 31 |

Tablet: caixa envolvente da área clara da tela em coordenadas locais ≈ `(109,55,318,306)`. A tela é inclinada, então o retângulo inclui parte da moldura; o polígono útil tem cantos aproximados `(110,72)`, `(276,55)`, `(318,282)`, `(147,306)`.

## Pessoas: `pessoas.png`

Todos os 15 pés dos móveis, ou dos participantes da festa, têm `base=560` e `footPad=16`. `Cabeça` é o centro aproximado da cabeça principal da célula; na festa é a cabeça da criança central. Os números de caixa alfa são da folha pronta.

| Célula | Situação | dx | dy | w | h | base | Cabeça (x,y) | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---|---:|---:|
| 0 | cama, antes | 13 | 102 | 359 | 458 | 560 | ≈ (185,235) | 0,5013 | 16 |
| 1 | berço, antes | 15 | 118 | 353 | 442 | 560 | ≈ (191,240) | 0,4987 | 16 |
| 2 | sofá, antes | 12 | 118 | 360 | 442 | 560 | ≈ (192,242) | 0,5000 | 16 |
| 3 | poltrona, antes | 12 | 84 | 360 | 476 | 560 | ≈ (193,211) | 0,5000 | 16 |
| 4 | festa, antes | 12 | 158 | 360 | 402 | 560 | ≈ (193,277) | 0,5000 | 16 |
| 5 | cama, ajudada | 12 | 75 | 360 | 485 | 560 | ≈ (180,220) | 0,5000 | 16 |
| 6 | berço, ajudada | 17 | 173 | 350 | 387 | 560 | ≈ (191,282) | 0,5000 | 16 |
| 7 | sofá, ajudada | 12 | 105 | 360 | 455 | 560 | ≈ (192,224) | 0,5000 | 16 |
| 8 | poltrona, ajudada | 12 | 87 | 360 | 473 | 560 | ≈ (192,210) | 0,5000 | 16 |
| 9 | festa, ajudada | 12 | 153 | 360 | 407 | 560 | ≈ (193,277) | 0,5000 | 16 |
| 10 | cama, engraçada | 12 | 101 | 360 | 459 | 560 | ≈ (185,230) | 0,5000 | 16 |
| 11 | berço, engraçada | 12 | 132 | 360 | 428 | 560 | ≈ (191,258) | 0,5000 | 16 |
| 12 | sofá, engraçada | 12 | 117 | 360 | 443 | 560 | ≈ (192,240) | 0,5000 | 16 |
| 13 | poltrona, engraçada | 12 | 81 | 360 | 479 | 560 | ≈ (192,215) | 0,5000 | 16 |
| 14 | festa, engraçada | 12 | 150 | 360 | 410 | 560 | ≈ (193,277) | 0,5000 | 16 |

A folha original tinha objetos dos quartos 2–5 encostados ou sobrepostos na fronteira entre colunas. O reempacotamento seguiu a separação de menor alfa, mas pequenos contornos compartilhados permanecem: é um defeito da arte crua que edição por recorte não reconstrói perfeitamente.

## Peças: `pecas.png`

| Célula | Conteúdo | dx | dy | w | h | base | originX | footPad |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | presente | 15 | 14 | 225 | 228 | 242 | 0,4980 | 14 |
| 1 | notas de festa | 20 | 51 | 216 | 191 | 242 | 0,5000 | 14 |
| 2 | notas de ninar | 21 | 31 | 214 | 211 | 242 | 0,5000 | 14 |
| 3 | coração | 14 | 57 | 227 | 185 | 242 | 0,4980 | 14 |
| 4 | coelho | 25 | 14 | 206 | 228 | 242 | 0,5000 | 14 |
| 5 | rosto da vovó | 16 | 14 | 223 | 228 | 242 | 0,4980 | 14 |
| 6 | dedo guia | 40 | 17 | 175 | 225 | 242 | 0,4980 | 14 |
| 7 | vazia | — | — | 0 | 0 | — | — | — |
| 8 | vazia | — | — | 0 | 0 | — | — | — |

Ponta do indicador da célula 6: `tipX≈65`, `tipY≈19`, coordenadas locais. Resíduos que vazavam nas células 7–8 da folha crua foram removidos.

## Escala e cores

Escala de exibição única por família no contexto principal: máquina `0,5`; pessoas `≈0,66`; aparelhos na bancada `≈0,44` (para 170 px de quadro) e no varal `≈0,156` (para 60 px); peças conforme o tamanho do efeito, mantendo a mesma escala para todos os quadros usados juntos. O reempacotamento reduziu apenas objetos grandes para caber nas células; não houve ampliação.

Amostras pontuais por pixel da arte final, equivalentes a `GetPixel` em RGBA (RGB aqui): céu `#7FCDFC` em `(25,20)`; parede esquerda `#F9E9CF` em `(810,350)`; parede direita `#F8EAD1` em `(1050,350)`; piso `#F3BE87` em `(800,530)`; tampo `#D99564` em `(500,546)`; grama `#B7D66F` em `(80,450)`; gabinete turquesa `#65CFD5` em `(140,665)`; portinhola coral `#FC837C` em `(320,780)`; relógio amarelo `#FCD252` em `(100,110)`; caixa de som lilás `#A992D0` em `(500,170)`; telefone coral `#FD8577` em `(170,550)`; tela do tablet `#EDF6FB` em `(550,550)`; presente turquesa `#50C0C3` em `(70,130)`; coração coral `#FB786D` em `(120,390)`.
