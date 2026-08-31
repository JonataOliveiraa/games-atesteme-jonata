# Pulo Programado — prompts das texturas

**3 arquivos, 11 desenhos.** Destino:
`src/assets/games/EF01CO03/pulo-programado/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

---

## 1. Por que folha em grade

O mesmo coelho aparece em seis poses. Pedir uma de cada vez — "faça a próxima
usando a anterior como referência" — é onde a consistência se perde: cada
geração sorteia orelha, focinho e proporção de novo, e na quinta pose o coelho
já é outro bicho.

A folha em grade resolve de graça: o gerador desenha os seis quadros na mesma
passada, então tudo sai igual porque saiu junto. É também o formato que o
Phaser já carrega (`load.spritesheet`).

**A ordem dos quadros é o índice do frame.** O Phaser lê da esquerda para a
direita e de cima para baixo: o primeiro quadro é o frame 0. A ordem abaixo não
é sugestão de leitura, é contrato com o código.

## 2. Tamanho — pequeno de propósito

Cada quadro tem **256 × 256**. O coelho aparece a 150 px na grade de 1280 × 720,
o que num celular dá cerca de **45 px reais**; o obstáculo maior não passa de
120 px. Pedir 1024 × 1024 por desenho seria carregar megabytes para jogar fora
no `setScale`.

A regra que vale mais que a resolução: **se a criança não reconhece o desenho em
meio segundo a 45 px de altura, tem detalhe demais.** Silhueta forte, contorno
grosso, três ou quatro cores por objeto.

| Arquivo | Grade | Tamanho final | Quadros |
|---|---|---|---|
| `coelho.png` | 3 × 2 | 768 × 512 | 6 |
| `obstaculos.png` | 2 × 2 | 512 × 512 | 4 |
| `bg-campo.png` | — | 1280 × 720 | 1 (opaco) |

## 3. Estilo comum — cole no começo de todo prompt

```
flat 2D cartoon illustration, chibi style, big head small body, very simple shapes,
minimal detail, bold clean silhouette, thick soft rounded outline, flat colors with a
single soft shadow, even lighting, no gradients, kids educational game asset,
friendly and clear, transparent background
```

**`text, letters, numbers` é obrigatório.** Todo texto do jogo — nome das ações,
a palavra ALGORITMO, os balões — é desenhado pelo Phaser por cima, em português
e no tamanho certo. Letra dentro do PNG vira lixo por baixo do texto de verdade.

**`grid lines` também é obrigatório.** O gerador adora desenhar a moldura da
grade que você pediu; a grade é para você recortar, não para aparecer.

**`ground, floor line` importa aqui**: os obstáculos são plantados no chão que o
código desenha. Um pedaço de chão dentro do PNG cria duas linhas de terra que
não se encaixam.

## 5. Paleta — cite os hex no prompt

| Uso | Hex |
|---|---|
| Contorno / tinta escura | `#1B2333` |
| Pelo do coelho | `#F5EDE2` |
| Sombra do pelo | `#D9CBBA` |
| Orelha e focinho | `#FFB4C0` |
| Colete do coelho | `#5FD6C9` |
| Terra / buraco | `#8A5A34` |
| Madeira do tronco | `#A9713D` |
| Folha do galho | `#4EC46A` |
| Pedra do túnel | `#9AA7B4` |

## 6. Os três pedidos

### 6.1 `coelho.png` — 768 × 512, grade 3 × 2

As seis poses do coelho. Os quadros 1, 2 e 3 também aparecem **dentro das
cartas da paleta**, reduzidos — é assim que a carta mostra a ação sem depender
de a criança ler a palavra.

```
Sprite sheet with 6 frames in a strict 3-column by 2-row grid, every frame the same
size and perfectly aligned, transparent background.

THE SAME small rabbit in all six frames: cream fur #F5EDE2 with #D9CBBA shading, pink
inner ears and nose #FFB4C0, a small teal vest #5FD6C9, chibi proportions with a big
head, thick dark outline #1B2333, flat colors, few details. Always seen from the SIDE,
facing right, same size and same eye level in every frame, empty margin around it,
feet never touching the frame edge.

Frames, left to right then top to bottom:
1. walking: one leg forward, ears leaning back, cheerful open eyes.
2. jumping: body stretched upward, both hind legs tucked, ears up, joyful expression.
3. ducking: crouched low, head down, ears flattened along the back, eyes looking ahead.
4. bumping: pressed backwards, eyes closed, cheeks squished, small comic swirl of
   surprise, no injury and no sadness.
5. celebrating: standing, both front paws raised, big happy smile, ears up.
6. waiting: standing still, front paws together, calm friendly expression, looking
   right.

[estilo comum] [negativo comum]
```

### 6.2 `obstaculos.png` — 512 × 512, grade 2 × 2

> **Nota da construção:** o quadro do BURACO acabou não sendo usado — ele é
> desenhado em Graphics junto com o chão, porque um PNG de terra encostando
> numa terra desenhada mostra a emenda. A PEDRA que entrou no lugar do tronco
> erguido também é Graphics, pelo mesmo motivo: ela vive apoiada na grama
> desenhada.
>
> Valem os quadros 1 (tronco), 2 (galho) e 3 (túnel). O galho é usado DUAS
> vezes por marco, em ângulos diferentes, para o conjunto ler como ramagem
> descendo de uma árvore fora da tela — antes um tronco em Graphics o
> segurava, e o pedido foi que fosse só galho.

Quatro obstáculos. O quinto marco do briefing, o **caminho livre**, não tem
textura: ele é só a pegada no chão desenhada em Graphics, e é de propósito —
"não tem nada aqui" precisa parecer não ter nada.

Todos vistos de lado, na mesma escala e apoiados numa linha de base imaginária,
para plantarem no chão do jogo sem flutuar nem afundar.

```
Sprite sheet with 4 frames in a strict 2-column by 2-row grid, every frame the same
size and perfectly aligned, transparent background.

Four side-view obstacles for a kids platform game, all drawn at the same scale, each
sitting on an imaginary baseline at the bottom of its frame, thick dark outline
#1B2333, flat colors, few details, no ground and no floor line under them.

Frames, left to right then top to bottom:
1. a hole in the ground: a dark brown pit #8A5A34 seen from the side, with two small
   raised earth lips at its edges, clearly a gap to jump over.
2. a low hanging branch: a horizontal wooden branch #A9713D with a few round green
   leaves #4EC46A, hanging from the top of the frame, low enough to duck under, the
   trunk it comes from not visible.
3. a fallen log: a short round wooden log #A9713D lying across, visible growth rings
   on the near end, clearly a thing to jump over.
4. a small stone tunnel: a low rounded arch of grey stones #9AA7B4 with a dark opening,
   short and wide, clearly a thing to duck through.

[estilo comum] [negativo comum]
```

### 6.3 `bg-campo.png` — 1280 × 720, PNG opaco

Fundo de tela cheia. Como em Ritmo da Rotina, o código joga um véu leve por
cima e desenha o chão e os marcos; a arte é o cenário, não a pista.

```
Horizontal 16:9 illustrated background: a sunny meadow seen from the side, for a kids
platform game.

Soft rolling green hills in the distance, a few round bushes and two simple trees near
the left and right edges, small white daisies scattered on the grass, a warm blue sky
with three fluffy clouds, gentle morning light.

The whole middle horizontal band is open sky and plain grass with NO tall objects, so
game pieces can move across it. Trees and bushes only near the left and right edges.

flat 2D cartoon illustration, chibi style, simple rounded shapes, thick soft outline
#1B2333, flat colors with one soft shadow per object, warm cheerful palette, kids
storybook art, kids educational game background.

Negative: 3D render, glossy, photorealistic, hyperdetailed, noise, text, letters,
numbers, watermark, frame, border, people, characters, animals, path, road, platform,
harsh black shadows, dark scene, night
```

---

## 7. O que NÃO é textura

Não peça e não aceite: **cartas de ação, setas, cadeado, interrogação, estrelas,
balões, moldura, trilha, quadrados da sequência, botão VAI, chão, marcos,
poeira, estrelinhas do esbarrão ou brilho.**

Tudo isso é Graphics do Phaser. É a mesma separação de Corrida dos Parecidos e
Ritmo da Rotina, e ela existe por dois motivos concretos: esses elementos mudam
de cor e de tamanho a cada estado — e um PNG não muda —, e manter a interface em
Graphics deixa o jogo inteiro jogável mesmo com nenhuma textura carregada.

**As cartas da paleta merecem uma nota**, porque é onde o pedido de textura
costuma escapar: a carta é um retângulo desenhado pelo código, com a palavra
escrita pelo Phaser e, dentro dela, **o quadro do próprio coelho** (pulando,
abaixando ou andando) em miniatura. Não existe arte de carta a produzir.

## 8. Entrega

| | |
|---|---|
| Formato | PNG com transparência real nas duas folhas; o fundo é opaco |
| Recorte | os quadros precisam bater com a grade exata; sem sangria entre eles |
| Margem | ~8 % de área vazia dentro de cada quadro |
| Sem | texto, número, moldura, linha de grade, chão, sombra caída no fundo |

**O recorte é a parte que costuma dar errado.** Gerador de imagem raramente
entrega grade perfeita e alfa limpo de primeira. O caminho prático: gere a folha
sobre um fundo chapado de magenta `#FF00FF` (que não existe na paleta), remova a
cor num editor e recorte para o tamanho exato da tabela da §2. Meio pixel de
deslocamento faz todo frame do Phaser aparecer com uma fatia do vizinho.

## 9. Ordem

**Mande `coelho.png` primeiro.** Ele sozinho responde a pergunta que importa: as
poses continuam reconhecíveis a 45 px, e dá para distinguir PULAR de ABAIXAR
dentro de uma carta de 200 px? Se a resposta for não, o ajuste de traço acontece
num arquivo, não em três.

`obstaculos.png` vem em seguida — é ele que fecha a primeira fase jogável com
arte real. O fundo pode vir por último; o campo em Graphics segura o jogo até lá.
