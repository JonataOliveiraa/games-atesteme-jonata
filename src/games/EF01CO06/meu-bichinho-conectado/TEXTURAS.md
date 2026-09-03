# Meu Bichinho Conectado — prompts das texturas

**7 arquivos, 26 desenhos.** Destino:
`src/assets/games/EF01CO06/meu-bichinho-conectado/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

---

## 1. Regra visual

O jogo precisa ser legível para 1º ano em uma faixa 16:9 reduzida no celular.
As texturas devem ter silhueta forte, poucos detalhes e expressões fáceis de ler
em tamanho pequeno.

O pedido do bichinho não pode depender de leitura. O asset mais importante,
depois do próprio bichinho e dos aparelhos, é a folha `pedidos.png`: cinco
pictogramas grandes que dizem "história", "vovó", "chuva", "lanche" e "fotos"
sem texto.

Use folha de sprites para manter consistência. A ordem dos quadros é contrato
com o código: o Phaser lê da esquerda para a direita e de cima para baixo.

---

## 2. Tamanho

| Arquivo | Grade | Tamanho final | Quadros |
|---|---|---|---|
| `bichinho.png` | 5 × 1 | 1280 × 256 | 5 emoções do bichinho principal |
| `bichinhos-amigos.png` | 3 × 1 | 768 × 256 | 3 bichinhos extras |
| `artefatos.png` | 4 × 2 | 1024 × 512 | 4 artefatos em repouso + 4 em uso |
| `pedidos.png` | 5 × 1 | 1280 × 256 | 5 pictogramas de necessidade |
| `bg-quarto.png` | — | 1280 × 720 | cenário opaco |
| `prateleira.png` | — | 420 × 560 | prateleira vazia |
| `cover-meu-bichinho-conectado.png` | — | 1024 × 576 | capa do catálogo |

Cada quadro de spritesheet tem **256 × 256**. Os artefatos aparecem com cerca
de 96 a 120 px na grade, então detalhes miúdos desaparecem no celular.

---

## 3. Estilo comum — cole no começo de todo prompt

```
flat 2D cartoon illustration, cozy preschool educational game asset, very simple
rounded shapes, bold clean silhouette, thick soft dark outline, warm friendly colors,
clear readable expression, minimal detail, flat colors with one soft shadow, even
lighting, transparent background when not a full background
```

## 4. Negativo comum — cole em todo prompt

```
3D render, 3d, realistic, photorealistic, hyperdetailed, intricate, ornate, cluttered,
busy background, tiny details, glossy plastic, strong gradients, neon glow, lens flare,
sparkles, text, letters, numbers, words, watermark, signature, frame, border, grid
lines, UI panel, button, speech bubble, question mark, lock icon, star icon, cropped,
cut off, white background
```

`text, letters, numbers` é obrigatório. Todo texto em português será desenhado
pelo Phaser.

---

## 5. Paleta — cite os hex no prompt

| Uso | Hex |
|---|---|
| contorno escuro | `#1F2A37` |
| fundo parede | `#F7DFA8` |
| chão | `#8BC6B0` |
| tapete | `#F06A6A` |
| bichinho principal | `#7CC7FF` |
| bichinhos extras | `#FFD166`, `#A78BFA`, `#6EE7B7` |
| tablet | `#2F3A4A`, tela `#74D9FF` |
| telefone | `#FF7A59` |
| relógio | `#FFC857` |
| caixinha de som | `#6B7CFF` |
| madeira da prateleira | `#A86B3C` |
| chuva | `#4DA3FF` |
| coração | `#F25F5C` |
| livro | `#B985FF` |

---

## 6. Os pedidos de arte

### 6.1 `bichinho.png` — 1280 × 256, grade 5 × 1

```
Sprite sheet with 5 frames in a strict 5-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

The SAME small round digital pet in all frames: soft blue body #7CC7FF, big eyes,
tiny ears, short arms, tiny feet, thick dark outline #1F2A37, chibi proportions,
simple readable face, centered with empty margin, full body visible.

Frames, left to right:
1. neutral and curious, looking forward.
2. asking for help, one hand raised, hopeful face.
3. happy, both arms up, open smile.
4. confused after wrong device, tilted head, small squint.
5. celebrating, jumping, cheeks lifted, joyful face.

[estilo comum] [negativo comum]
```

### 6.2 `bichinhos-amigos.png` — 768 × 256, grade 3 × 1

Usado no pedido coletivo do nível 2+.

```
Sprite sheet with 3 frames in a strict 3-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

Three small digital pets matching the main pet style but clearly different colors.
Each frame has one full body pet centered with empty margin, same scale, big eyes,
tiny ears, short arms, friendly expression, thick dark outline #1F2A37.

Frames, left to right:
1. yellow pet #FFD166, excited, leaning slightly left.
2. purple pet #A78BFA, smiling calmly, holding hands near chest.
3. green pet #6EE7B7, happy, leaning slightly right.

[estilo comum] [negativo comum]
```

### 6.3 `artefatos.png` — 1024 × 512, grade 4 × 2

Linha 1: artefatos em repouso para a prateleira. Linha 2: artefatos em uso
para a microcena de acerto.

```
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly
256 by 256 pixels, transparent background. Same camera angle and scale across all
frames. Each device is large, simple, front-facing three-quarter view, centered with
empty margin, thick dark outline #1F2A37.

Frames, left to right, top row:
1. small bluetooth speaker, rounded rectangle, purple-blue body #6B7CFF, two simple
   speaker circles, no brand, no letters.
2. tablet, dark frame #2F3A4A, bright cyan screen #74D9FF, no content text.
3. simple phone for calling, coral body #FF7A59, big receiver shape, friendly toy-like
   look, clearly for voice calls, not a modern smartphone.
4. round digital watch or clock, yellow case #FFC857, simple hands only, no numbers.

Frames, left to right, bottom row:
5. same speaker with three colored sound waves coming out.
6. same tablet showing three tiny photo cards and a sun/cloud pictogram, no text.
7. same phone with a soft curved call line and a small heart icon, no portrait text.
8. same watch with hands highlighted and a small snack pictogram beside it, no numbers.

[estilo comum] [negativo comum]
```

### 6.4 `pedidos.png` — 1280 × 256, grade 5 × 1

Os pictogramas são o idioma principal do jogo. Precisam funcionar sem legenda.

```
Sprite sheet with 5 frames in a strict 5-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

Five large simple need pictograms for a first-grade educational game. Each pictogram
is centered, very readable, made of a few bold shapes, thick dark outline #1F2A37,
flat colors, no text, no letters, no numbers.

Frames, left to right:
1. story: open purple book #B985FF with three sound waves above it, suggesting hearing
   a story.
2. grandma call: friendly older woman's face inside a round portrait frame with a red
   heart #F25F5C beside it, no words.
3. weather rain: blue cloud #4DA3FF with three raindrops and a small yellow sun peeking
   behind it.
4. snack time: small plate with sandwich and fruit, plus a simple clock hand shape
   behind the plate, no numbers.
5. party photos: three overlapping photo cards with simple confetti shapes and three
   tiny pet silhouettes looking at them.

[estilo comum] [negativo comum]
```

### 6.5 `bg-quarto.png` — 1280 × 720

O quarto é cenário, não interface. Ele deve deixar o centro livre para o
bichinho e a direita livre para a prateleira.

```
Full 1280 by 720 cozy children's bedroom background for a 2D educational game, opaque
image, no transparency.

Warm simple room with wall color #F7DFA8, floor #8BC6B0, a soft red rug #F06A6A in the
center, a small window on the left, a few rounded toy shapes far in the background,
very low visual contrast behind the central play area. Leave the center area from x
260 to x 850 visually clean for the pet. Leave the right area from x 880 to x 1260
simple and uncluttered for a shelf overlay. No UI panels, no speech bubbles, no
devices, no characters, no text. 

[estilo comum] [negativo comum]
```

### 6.6 `prateleira.png` — 420 × 560

A prateleira segura os artefatos, mas os estados de toque, brilho e trava são
Graphics.

```
A simple empty wooden shelf for a children's room, 420 by 560 pixels, transparent
background. Four large rounded cubbies stacked vertically, warm wood #A86B3C, thick
dark outline #1F2A37, soft flat shadow, very simple shape, enough empty space inside
each cubby for one large device icon. No objects on the shelf, no labels, no text, no
buttons, no glow.

[estilo comum] [negativo comum]
```

### 6.7 `cover-meu-bichinho-conectado.png` — 1024 × 576

```
Cover art for a children's educational game called Meu Bichinho Conectado, 1024 by
576, full image.

The blue digital pet is in a cozy bedroom, smiling in the center, with the four
devices around it: speaker, tablet, phone, and watch. The tablet shows a simple photo
pictogram, the speaker has sound waves, the phone has a call line, the watch has hands
only. Add the five need pictograms as playful floating stickers around the pet, but no
UI frame. Warm colorful composition, clear first-grade friendly shapes, no text, no
letters, no numbers.

[estilo comum] [negativo comum]
```

---

## 7. O que NÃO é textura

Não pedir e não aceitar como PNG:

| Elemento | Motivo |
|---|---|
| corações | mudam de vazio para cheio e precisam acender em código |
| botão `?` | é controle de interface, não arte |
| cadeado da trava | estado dinâmico |
| balões de pedido | são molduras de interface; o pictograma vem de `pedidos.png` |
| brilho de dica | varia por nicho e por estado |
| moldura verde/vermelha | efeito de feedback |
| estrelas e painel final | padrão compartilhado do catálogo |
| texto dos pedidos | deve ser Phaser Text, legível e editável |

Tudo isso fica em Graphics ou módulo compartilhado.

---

## 8. Sons

Sem arquivos de áudio. Sons sintetizados em WebAudio:

| Som | Síntese |
|---|---|
| toque em artefato | seno curto com queda rápida |
| acerto | acorde curto de 3 notas |
| erro | ruído filtrado grave + queda |
| caixinha | três notas agudas |
| tablet | arpejo digital leve |
| telefone | dois pulsos tipo chamada |
| relógio | dois tic-tacs curtos |
| fim de nível | fanfarra curta |

Todos respeitam `mute-audio`.

---

## 9. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real nos sprites e na prateleira |
| Recorte | spritesheets com grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro |
| Peso alvo | sprites até 300 KB; fundo até 500 KB; capa até 400 KB |
| Sem | texto, número, marca, moldura, linha de grade, interface, corte |

Se a geração vier com fundo branco, refazer em magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 10. Ordem

1. `bichinho.png`
2. `artefatos.png`
3. `pedidos.png`
4. `bg-quarto.png`
5. `prateleira.png`
6. `bichinhos-amigos.png`
7. `cover-meu-bichinho-conectado.png`

`bichinho.png`, `artefatos.png` e `pedidos.png` fecham o nível 1 inteiro. Eles
devem vir antes porque testam a pergunta mais importante: a criança reconhece a
necessidade e o aparelho a cerca de 70 px reais de largura no celular?
