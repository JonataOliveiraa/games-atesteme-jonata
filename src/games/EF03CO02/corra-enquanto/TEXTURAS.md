# Corra Enquanto... - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF03CO02/corra-enquanto/`

---

## 0. A lista

Três arquivos para o jogo, mais a capa. É pouco de propósito: ficha, pedal,
linha do tempo, chuva, cadeado e rastro são `Graphics`, porque mudam de estado o
tempo todo e um PNG não muda.

| # | Arquivo | Tamanho | Grade | Para quê |
|---|---|---|---|---|
| 1 | `robo.png` | 280 x 1680 | 1 x 6 de 280 | o robô corredor, de lado |
| 2 | `sinais.png` | 1400 x 700 | 4 x 2 de 350 | os 8 estados das condições |
| 3 | `fundo.png` | 1920 x 720 | — | a pista, emendável na horizontal |
| 4 | `cover-corra-enquanto.png` | 1672 x 941 | — | capa do catálogo |

**Nada de painel, ficha, botão, moldura, seta, cadeado, estrela, balão ou
barra.** Tudo isso é `Graphics`.

---

## 1. Estilo comum

```
flat 2D cartoon educational game asset for children, simple rounded shapes, bold
readable silhouette, thick dark outline, bright friendly colors, minimal detail, flat
colors, one soft shadow, no text, transparent background
```

## 2. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, tiny details, brand logo, text,
letters, numbers, words, watermark, signature, frame, border, grid lines, cropped, cut
off, white background, motion blur
```

## 3. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| corpo do robô | `#CBD9E8` escuro `#7E97B0` |
| detalhe do robô | `#38BDF8` |
| luz do robô | `#FACC15` |
| verde de seguir | `#35D07F` |
| vermelho de parar | `#EF4444` |
| âmbar de alerta | `#F59E0B` |
| céu | `#7FCDF2` claro `#DFF3FF` |
| asfalto | `#6B7280` |
| grama | `#87BC62` |

---

## 4. `robo.png` - 280 x 1680, grade 1 x 6

Seis quadros de 280 x 280, empilhados numa coluna. **Visto de lado**, correndo
para a direita — este jogo é de perfil, não de perseguição.

O robô aparece a ~170 px de altura na grade, ~51 px reais no celular: a
silhueta é tudo.

```
Sprite sheet with 6 frames in a strict 1-column by 6-row grid, every frame exactly
280 by 280 pixels, transparent background.

The SAME friendly cartoon robot in all six frames, seen from the SIDE in profile,
facing and moving to the RIGHT. Rounded light-steel body #CBD9E8 with darker steel
#7E97B0 edges, a small blue #38BDF8 chest panel, one round yellow lamp #FACC15 on the
head, a stubby antenna, chunky legs with rounded feet. Thick dark outline #1F2A37,
flat colors, one soft shadow under the feet. The robot fills about 82% of the frame
height, centered horizontally, feet touching the bottom edge of the frame. Keep the
head at the same height in all six frames.

Frames, top to bottom:
1. RUN, contact: right leg forward and planted, left leg back, arms swinging opposite,
   leaning slightly forward.
2. RUN, passing: legs close together under the body, body slightly higher.
3. RUN, contact mirrored: left leg forward and planted, right leg back.
4. RUN, passing mirrored: legs together again, arms swinging the other way.
5. STANDING, waiting: upright, feet together, arms down, head straight, calm and
   patient, clearly not moving.
6. CELEBRATING: both arms raised, one foot lifted, head lamp bright, happy.

[estilo comum] [negativo comum]
```

Depois que chegar: **meça a caixa alfa de cada quadro** e ancore o layout na
linha dos pés. Os seis precisam bater na mesma linha.

---

## 5. `sinais.png` - 1400 x 700, grade 4 x 2

Oito quadros de 350 x 350. São os **estados das condições** — o que a criança
olha para decidir se a frase ainda vale. Cada dupla é o mesmo objeto ligado e
desligado, e a diferença entre os dois precisa ser visível a 45 px reais.

| Frame | Estado | Frame | Estado |
|---|---|---|---|
| 0 | nuvem chovendo | 4 | esteira ligada |
| 1 | nuvem sem chuva | 5 | esteira parada |
| 2 | semáforo verde | 6 | bandeira de chegada |
| 3 | semáforo vermelho | 7 | balde com marca |

```
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly 350
by 350 pixels, transparent background.

Eight simple cartoon objects for a children's game, each alone and centered in its
frame, filling about 78% of the frame, seen straight from the front. Chunky rounded
shapes, thick dark outline #1F2A37, flat colors, one soft shadow. Instantly readable
at small size. No text, no letters, no numbers.

Frames, left to right then top to bottom:
1. A grey RAIN CLOUD with heavy blue raindrops falling from it, dark and busy.
2. The SAME cloud, now white and fluffy with NO raindrops at all, with a small bright
   sun peeking from behind it. Clearly the calm version of frame 1.
3. A TRAFFIC LIGHT box with three lamps: the bottom one glowing bright green #35D07F
   with a soft halo, the other two dark and dull.
4. The SAME traffic light with the TOP lamp glowing bright red #EF4444 with a soft
   halo, the other two dark and dull. Identical box and position to frame 3.
5. A short CONVEYOR BELT seen from the side, with rollers and an arrow-shaped tread
   pattern, drawn as clearly RUNNING: small motion marks above it and a bright green
   lamp on its motor.
6. The SAME conveyor belt clearly STOPPED: no motion marks, tread flat, the motor lamp
   dark and grey.
7. A CHECKERED FINISH FLAG on a pole, black and white squares, planted in a small
   rounded base, waving to the right.
8. A metal BUCKET seen from the front, half filled with blue water, with a single bold
   painted line across its middle showing the fill mark.

[estilo comum] [negativo comum]
```

**A dupla que mais importa é 2 e 3** (verde e vermelho): o jogo inteiro do nível
1 termina nelas, e elas precisam ser a mesma caixa com a lâmpada trocada, para a
criança comparar sem pensar.

---

## 6. `fundo.png` - 1920 x 720

A pista vista de lado, **rolando para a esquerda** enquanto o robô corre no
lugar. Um arquivo só, esticado e repetido pelo código.

**A emenda é a regra deste arquivo:** a borda esquerda tem que encaixar na
borda direita sem costura, porque o fundo dá a volta. Nada de prédio cortado
pela metade nas pontas.

```
A seamless side-scrolling background for a children's running game, 1920 by 720
pixels, seen from the side as a flat 2D platformer.

Top two thirds: a friendly city skyline far away — simple rounded buildings in muted
blue-grey, a few trees, no detail — over a bright sky #7FCDF2 fading to #DFF3FF near
the horizon. Middle: a band of green grass #87BC62 with small bushes. Bottom third: a
straight grey asphalt road #6B7280 running edge to edge, with a light kerb line along
its top and a simple repeating dash pattern along its middle.

The left edge and the right edge must match EXACTLY, so the image can tile
horizontally forever with no visible seam: no building, tree or bush may touch either
edge, and the road, kerb and grass bands must be at the same height on both edges.

Thick dark outline #1F2A37 on the big shapes, flat colors, warm daylight, calm and
uncluttered — the road area must stay clean and empty, because the robot runs there.

[estilo comum, sem transparência: a imagem é opaca] [negativo comum]
```

---

## 7. `cover-corra-enquanto.png` - 1672 x 941

```
A colorful cartoon cover illustration for a children's educational game, 1672 by 941
pixels. A friendly steel-and-blue cartoon robot running to the right along a sunny
city road, seen from the side, with a colorful speed trail behind it. Above the robot,
a big dark rain cloud pours rain on the left half of the image while the right half is
sunny and clear — the same road under two different weathers. A large cartoon hand
presses a glowing round pad at the bottom right corner. Bright, dynamic and inviting,
plenty of empty sky at the top.

Thick dark outline #1F2A37, flat colors, no text anywhere.

[estilo comum, sem transparência] [negativo comum]
```

---

## 8. O que continua em `Graphics`

| Elemento | Motivo |
|---|---|
| ficha da regra | muda de texto a cada trecho, e pulsa |
| pedal e linha do tempo | são estado puro: aceso, apagado, marcado |
| chuva | **liga e desliga** — é a própria condição |
| cadeado, poeira, rastro, faísca | efeito |
| moldura de acerto e erro, confete, véu | kit `FX` |
| barra do topo, pílula do nível, `?`, vidas | UI de plataforma, igual nos 50 jogos |

---

## 9. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | alfa real em `robo` e `sinais` |
| Sem transparência | `fundo` e `cover` são opacos |
| Recorte | grade exata, sem sangria entre quadros |
| Peso alvo | `robo` até 500 KB; `sinais` até 700 KB; `fundo` até 1,5 MB |
| Sem | texto, letra, número, marca, moldura externa, linha de grade |

Se vier com fundo branco, refazer sobre magenta `#FF00FF` e remover a cor.

---

## 10. Ordem

1. `sinais.png` — sem os estados não existe condição para testar.
2. `robo.png` — é quem executa o laço.
3. `fundo.png` — é o que dá a sensação de que o laço está andando.
4. `cover-corra-enquanto.png` — destrava o registro no catálogo.
