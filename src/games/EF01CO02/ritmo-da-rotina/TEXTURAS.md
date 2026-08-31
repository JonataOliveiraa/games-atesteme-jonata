# Ritmo da Rotina — prompts das texturas

**4 arquivos, 17 desenhos.** Destino:
`src/assets/games/EF01CO02/ritmo-da-rotina/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

---

## 1. Por que folha em grade, e não um pedido por desenho

A mesma criança aparece em 16 desenhos. Pedir um de cada vez — "faça o próximo
usando o anterior como referência" — é onde a consistência se perde: cada
geração é um sorteio novo de rosto, cabelo e proporção, e no oitavo desenho a
criança já é outra pessoa.

**Uma folha em grade resolve isso de graça**: o gerador desenha os seis quadros
na mesma passada, então cabeça, cor de pele, roupa e traço saem iguais porque
saíram juntos. É também o formato que o Phaser já carrega
(`load.spritesheet`), do mesmo jeito que Corrida dos Parecidos carrega as frutas
e as formas em folhas de 5 quadros.

**A ordem dos quadros é o índice do frame.** O Phaser lê da esquerda para a
direita e de cima para baixo: o primeiro quadro é o frame 0. A ordem listada
abaixo não é sugestão de leitura, é contrato com o código.

---

## 2. Tamanho — pequeno de propósito

Cada quadro tem **256 × 256**. A figura maior do jogo aparece a 240 px na grade
de 1280 × 720, o que num celular dá cerca de **73 px reais**; a miniatura do topo
dá 43 px. Pedir 1024 × 1024 por desenho seria carregar megabytes para depois
jogar 90 % fora no `setScale` — peso morto num jogo que roda no celular da
escola.

A regra que vale mais que a resolução: **se a criança não reconhece a ação em
meio segundo a 45 px de altura, tem detalhe demais.** Silhueta forte, contorno
grosso, três ou quatro cores por desenho.

| Arquivo | Grade | Tamanho final | Quadros |
|---|---|---|---|
| `acoes-manha.png` | 3 × 2 | 768 × 512 | 6 |
| `acoes-lanche.png` | 3 × 2 | 768 × 512 | 6 |
| `intrusos.png` | 2 × 2 | 512 × 512 | 4 |
| `tambor.png` | — | 512 × 512 | 1 |

---

## 3. Estilo comum — cole no começo de todo prompt

```
flat 2D cartoon illustration, chibi style, big head small body, very simple shapes,
minimal detail, bold clean silhouette, thick soft rounded outline, flat colors with a
single soft shadow, even lighting, no gradients, kids educational game asset,
friendly and clear, transparent background
```

## 4. Negativo comum — cole em todo prompt

```
3D render, 3d, octane, blender, glossy plastic, shiny, specular highlight, realistic
lighting, photorealistic, hyperdetailed, intricate, ornate, busy, cluttered, noise,
texture grain, sparkles, glow, lens flare, gradient mesh, text, letters, numbers,
words, watermark, signature, frame, border, grid lines, panel, background scenery,
drop shadow on background, cropped, cut off
```

**`text, letters, numbers` é obrigatório.** Todo texto do jogo — nome do passo,
nome da rotina, balões — é desenhado pelo Phaser por cima, em português e no
tamanho certo. Letra dentro do PNG vira lixo por baixo do texto de verdade.

**`grid lines` também é obrigatório.** O gerador adora desenhar a moldura da
grade que você pediu; a grade é para você recortar, não para aparecer.

## 5. Paleta — cite os hex no prompt

| Uso | Hex |
|---|---|
| Contorno / tinta escura | `#1B2333` |
| Pele | `#C68642` |
| Cabelo | `#4A2E1E` |
| Camiseta (casa) | `#4FD1C5` |
| Shorts (casa) | `#FF6B5A` |
| Uniforme — camiseta | `#F7FAFC` |
| Uniforme — gola e shorts | `#2E6FF0` |
| Tambor — corpo | `#E8503A` |
| Tambor — aro | `#FFC42E` |
| Tambor — couro | `#FFF1D6` |

---

## 6. Os quatro pedidos

### 6.1 `acoes-manha.png` — 768 × 512, grade 3 × 2

Cobre a rotina Manhã (nível 1) e a rotina Escola (nível 2).

```
Sprite sheet with 6 frames in a strict 3-column by 2-row grid, every frame the same
size and perfectly aligned, transparent background.

THE SAME CHILD in all six frames: medium-brown skin #C68642, short brown hair #4A2E1E,
teal t-shirt #4FD1C5 and coral shorts #FF6B5A (except where stated), chibi proportions,
thick dark outline #1B2333, flat colors, few details. Each frame centered at the same
character scale with empty margin around it. Full body visible, face always visible.

Frames, left to right then top to bottom:
1. waking up: sitting on a small bed with a coral blanket, eyes open, arms stretching.
2. brushing teeth: standing, blue toothbrush against the teeth, small white foam.
3. having breakfast: sitting at a small table, holding a yellow mug, one bread roll on
   a plate.
4. putting on the school uniform: white school shirt #F7FAFC with blue collar #2E6FF0
   and blue shorts, pushing one arm through the sleeve.
5. picking up the backpack: in uniform, lifting a yellow backpack by the strap, backpack
   beside the body, feet on the ground.
6. going to school: in uniform, yellow backpack on the back, walking to the right toward
   a tiny school entrance reduced to a door and a simple roof.

[estilo comum] [negativo comum]
```

### 6.2 `acoes-lanche.png` — 768 × 512, grade 3 × 2

Cobre a rotina Lanche (nível 3). O quadro 6 não é passo de rotina: é a criança
comemorando, usada no tutorial e na reprise do fim de nível.

```
Sprite sheet with 6 frames in a strict 3-column by 2-row grid, every frame the same
size and perfectly aligned, transparent background.

THE SAME CHILD in all six frames: medium-brown skin #C68642, short brown hair #4A2E1E,
teal t-shirt #4FD1C5, coral shorts #FF6B5A, chibi proportions, thick dark outline
#1B2333, flat colors, few details. Each frame centered at the same character scale with
empty margin around it. Full body visible, face always visible.

Frames, left to right then top to bottom:
1. washing hands: in front of a small sink, rubbing hands under a thin stream of water,
   a few soap bubbles, no wall or bathroom around.
2. picking up bread: taking a bread roll out of a small basket on a narrow table, one
   hand holding the bread above the basket.
3. spreading butter: spreading yellow butter on an open bread roll with a blunt kids
   spatula, bread on a plate on a small table.
4. eating the snack: holding the bread roll with one small bite taken, bringing it to
   the mouth, calm expression, no mug and no basket.
5. putting away dishes: placing a clean plate on the shelf of a low open cupboard, the
   hand clearly reaching the shelf, few plates, compact furniture.
6. celebrating: standing, both arms raised up, big smile, nothing else in the frame.

[estilo comum] [negativo comum]
```

### 6.3 `intrusos.png` — 512 × 512, grade 2 × 2

**Os intrusos têm exatamente a mesma aparência das ações válidas.** Nada de X,
vermelho, cara de bravo ou símbolo de proibido: quem entrega a resposta no
desenho tira o jogo da criança. Eles não são coisas erradas — só não são o
próximo passo da rotina.

```
Sprite sheet with 4 frames in a strict 2-column by 2-row grid, every frame the same
size and perfectly aligned, transparent background.

THE SAME CHILD as the routine sheets: medium-brown skin #C68642, short brown hair
#4A2E1E, teal t-shirt #4FD1C5, coral shorts #FF6B5A, chibi proportions, thick dark
outline #1B2333, flat colors, few details. Same framing and same character scale as the
routine frames, calm neutral expression in every frame.

Frames, left to right then top to bottom:
1. holding an ice cream cone with one pink scoop.
2. playing with a ball, yellow and blue panels, the ball next to the foot.
3. sitting on a small stool watching a small television seen in three-quarter view,
   a simple geometric shape on the screen.
4. sitting on the floor pushing a small red toy car with one hand.

[estilo comum] [negativo comum]

Additional negative: warning sign, prohibition sign, red cross, X mark, angry face,
sad face, red highlight, forbidden symbol
```

### 6.4 `tambor.png` — 512 × 512, arquivo único

O tambor é o controle inteiro do jogo, e tem **duas zonas de toque**: o couro no
meio e o aro em volta. O desenho precisa deixar essa divisão óbvia de longe —
se couro e aro tiverem cor parecida, a criança não descobre que existem dois
toques. Os estados (apertado, aceso, piscando) são feitos em código.

```
A toy drum for small children, seen from the front and slightly from above, centered,
transparent background.

The top face is a wide, completely flat and empty cream drumhead #FFF1D6, taking most
of the shape. Around it, a THICK and clearly separated yellow rim #FFC42E, obviously a
different part from the drumhead. Below, a short coral body #E8503A with small teal
#4FD1C5 details. Compact silhouette, soft volume, thick dark outline #1B2333.

No drumsticks, no hands, no face, no legs, nothing resting on the drumhead.

[estilo comum] [negativo comum]
```

---

## 7. O que NÃO é textura

Não peça e não aceite: **X, cadeado, interrogação, estrelas, setas, carimbo de
feito, círculo-alvo, painel, cartão, moldura, trilha, brilho, faixa de progresso
ou fundo de cenário.**

Tudo isso é Graphics do Phaser, desenhado pelo código do jogo. É a mesma
separação de Corrida dos Parecidos, e ela existe por dois motivos concretos:
esses elementos mudam de cor e de tamanho a cada estado — e um PNG não muda —, e
manter o cenário e a interface em Graphics deixa o jogo inteiro jogável mesmo
com nenhuma textura carregada.

O cenário de quarto e de cozinha também é Graphics: formas chapadas nas
laterais, sem contraste, longe da faixa central.

---

## 8. Entrega

| | |
|---|---|
| Formato | PNG com transparência real (canal alfa, não fundo branco) |
| Recorte | os quadros precisam bater com a grade exata; sem sangria entre eles |
| Margem | ~8 % de área vazia dentro de cada quadro, para o desenho não encostar na borda |
| Sem | texto, número, moldura, linha de grade, sombra caída no fundo, corte |

**O recorte é a parte que costuma dar errado.** Gerador de imagem raramente
entrega grade perfeita e alfa limpo na primeira tentativa. O caminho prático:
gere a folha sobre um fundo chapado de magenta `#FF00FF` (que não existe na
paleta), remova a cor num editor e recorte para o tamanho exato da tabela da
§2. Uma folha com meio pixel de deslocamento faz todo frame do Phaser aparecer
com uma fatia do vizinho.

## 9. Ordem

**Mande `acoes-manha.png` e `tambor.png` primeiro.** Esses dois fecham o nível 1
inteiro e respondem a pergunta que importa: as ações continuam reconhecíveis
reduzidas a 43 px na faixa do topo? Se a resposta for não, o ajuste de traço
acontece em dois arquivos, não em dezessete.

`acoes-lanche.png` e `intrusos.png` vêm depois, com o mesmo prompt de referência
para a criança continuar sendo a mesma.
