# Vila das Máquinas - prompts das texturas

**5 folhas de jogo + 1 background + 1 capa.** Destino:
`src/assets/games/EF02CO03/vila-das-maquinas/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Este jogo usa pouca textura. A clareza vem dos pictogramas, comandos e
plaquinhas em `Graphics`. As texturas dão carisma às três máquinas e acabamento
ao cenário.

---

## 1. Arquivos

| Arquivo | Grade | Tamanho entregue | Quadro | Uso |
|---|---|---|---|---|
| `maquinas.png` | 3 x 2 | 900 x 600 | 300 x 300 | três máquinas em repouso + três em ação |
| `icones-comandos.png` | 6 x 1 | 1536 x 256 | 256 x 256 | varrer, girar, voar, soltar, assar, apitar |
| `itens.png` | 3 x 2 | 600 x 400 | 200 x 200 | folhas, massa e pacote — antes e depois |
| `morador.png` | 3 x 1 | 750 x 250 | 250 x 250 | morador pedindo, comemorando e preocupado |
| `gato-e-peixe.png` | 2 x 1 | 500 x 250 | 250 x 250 | o gatinho do telhado e o petisco do desejo |
| `bg-vila.png` | - | 1672 x 941 | - | fundo da vila |
| `cover-vila-das-maquinas.png` | - | 1672 x 941 | - | capa do catálogo |

O `BootScene` fatia as folhas pelo tamanho de quadro acima. Se uma folha for
regerada em outra resolução, o quadro muda junto — **o que vale é a grade**,
não o pixel. O `maquinas.png` foi pedido em 768 x 512 e veio em 900 x 600, e o
`frameHeight` escrito na mão a partir do pedido cortou as máquinas ao meio.
Confira a resolução ENTREGUE antes de declarar o quadro.

Não pedir textura para balões, plaquinhas completas, botões, catálogo,
estrelas, cadeado ou UI.

---

## 2. Estilo comum

```
flat 2D cartoon illustration, friendly educational game asset for children, simple
rounded shapes, bold readable silhouette, thick dark outline, bright warm colors,
minimal detail, flat colors, one soft shadow, no text, transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, complex machinery, scary robot,
industrial dark factory, tiny details, text, letters, numbers, words, watermark,
signature, frame, border, grid lines, UI panel, button, star icon, lock icon, cropped,
cut off, white background
```

Nada de texto, letras ou números dentro das texturas.

---

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| robô-vassoura | `#35D07F` |
| drone | `#4DA3FF` |
| forninho | `#F59E0B` |
| luz do forninho | `#FACC15` |
| vila | `#F7DFA8`, `#8BC6B0`, `#F06A6A` |
| comandos | `#2DD4BF`, `#A78BFA`, `#60A5FA`, `#38BDF8`, `#F97316`, `#FACC15` |
| folhas | `#E2903A`, `#D4643A`, `#C9A227` |
| massa crua | `#F1E2BF` |
| pão assado | `#D08B3F` |
| pacote | `#D9A465`, `#B87B3F` |
| petisco | `#F0A860` |
| morador: pele | `#F0C39B` |
| morador: cabelo | `#8A5A2B` |
| morador: camisa | `#5B8DEF` |

---

## 5. Prompts

### 5.1 `maquinas.png` - grade 3 x 2

```
Sprite sheet with 6 frames in a strict 3-column by 2-row grid, transparent background.

Three friendly simple machines for a second-grade educational game. Toy-like, rounded,
clear silhouette, thick dark outline #1F2A37, flat colors, no text, no letters, no
numbers. Same scale and centered with empty margin.

Frames, left to right, top row:
1. robot sweeper, green #35D07F, small round body, one visible brush underneath,
   friendly eye, wheels, clearly for sweeping.
2. delivery drone, blue #4DA3FF, four rotors, small hook underneath, friendly light,
   clearly flies.
3. small oven machine, orange #F59E0B, warm yellow window #FACC15, tiny feet, friendly
   light, clearly bakes.

Frames, left to right, bottom row:
4. same robot sweeper spinning and sweeping leaves, brush visible, no text.
5. same drone flying while dropping a small blank package, no text.
6. same oven glowing warmly with a small bread shape popping up, no text.

[estilo comum] [negativo comum]
```

### 5.2 `icones-comandos.png` - grade 6 x 1

```
Sprite sheet with 6 frames in a strict 6-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

Six large command pictogram icons for a children's machine-instruction game. Each icon
uses simple bold shapes, thick dark outline #1F2A37, flat colors, centered with empty
margin, readable at small size. No text, no letters, no numbers.

Frames, left to right:
1. sweep command: broom brush making leaves move.
2. turn command: circular arrow around a small machine base.
3. fly command: upward arrow with tiny wings/cloud.
4. drop command: small package falling down from a hook.
5. bake command: warm oven glow with bread shape.
6. beep command: small bell or sound waves from a machine light.

[estilo comum] [negativo comum]
```

A ordem dos quadros é a ordem do enum `Command` em `data/machines.ts`. Trocar a
ordem da folha troca os ícones de todas as plaquinhas do jogo.

### 5.3 `itens.png` - grade 3 x 2

A linha de cima é o problema como a criança encontra; a de baixo é o mesmo
objeto depois que a máquina certa agiu. **As duas linhas têm que ser o MESMO
objeto**: mesma forma, mesmo tamanho, mesmo centro. O jogo troca um quadro pelo
outro em cima da mesa, e qualquer diferença de silhueta vira um pulo na tela.

```
Sprite sheet with 6 frames in a strict 3-column by 2-row grid, every frame square
and the same size, transparent background.

Six props for a children's educational village game. Simple bold shapes, thick dark
outline #1F2A37, flat colors, one soft shadow, centered in the frame with empty margin,
readable at small size. No text, no letters, no numbers.

Frames, left to right, top row - the problem:
1. a small pile of fallen autumn leaves lying on the ground, five or six leaves in
   warm orange #E2903A, red-orange #D4643A and yellow #C9A227, scattered and untidy.
2. a lump of raw bread dough on a wooden board, pale cream #F1E2BF, matte and flat,
   with three shallow diagonal score marks, clearly uncooked.
3. a closed cardboard delivery parcel, light kraft #D9A465 with darker tape cross
   #B87B3F, small and cube-shaped, clearly sealed.

Frames, left to right, bottom row - after the machine worked:
4. one single leaf on its own, warm orange #E2903A, same drawing style as the pile,
   centered, for scattering.
5. the SAME loaf as frame 2 but baked: golden brown #D08B3F, slightly puffed up and
   rounder, same silhouette and same board, with the same three score marks now open
   and darker.
6. the SAME parcel as frame 3 but open, flaps up, with a small orange fish-shaped cat
   treat #F0A860 sitting inside it.

[estilo comum] [negativo comum]
```

Cuidados que já custaram retrabalho em outra folha: o quadro 5 não pode ser um
pão diferente do quadro 2, e o peixinho do quadro 6 tem que caber dentro do
pacote sem sair da margem.

### 5.4 `morador.png` - grade 3 x 1

O morador vive num painel de 108 px de altura, então ele é **meio corpo**: cabeça,
tronco e o braço que acena. Perna nenhuma aparece.

```
Sprite sheet with 3 frames in a strict 3-column by 1-row grid, every frame square and
the same size, transparent background.

The same friendly village kid character in three expressions, half-body only: head,
torso and arms, cut at the waist, no legs. Round head, simple rounded body, thick dark
outline #1F2A37, flat colors, skin #F0C39B, short brown hair #8A5A2B, plain blue shirt
#5B8DEF. Same character, same size, same head position and same centering in all three
frames. No text, no letters, no numbers, no props, no speech bubble.

Frames, left to right:
1. asking for help: friendly open smile, one arm raised waving hello, the other arm
   down, eyebrows relaxed, looking straight ahead.
2. celebrating: big happy smile, eyes closed in joy, both arms raised up.
3. worried: small unsure mouth, raised eyebrows, one hand up near the cheek, head
   tilted slightly.

[estilo comum] [negativo comum]
```

O que não pode variar entre os três quadros é a cabeça: se ela mudar de tamanho
ou de altura, o morador salta no painel quando o jogo troca a expressão.

### 5.5 `gato-e-peixe.png` - grade 2 x 1

O gatinho aparece grande no modo cena, então ele carrega expressão. O peixe é o
mesmo desenho nos dois estados do desejo: apagado e sem cor enquanto o petisco
não chegou, cheio quando chega — quem faz isso é o `tint`, não um segundo
quadro.

```
Sprite sheet with 2 frames in a strict 2-column by 1-row grid, every frame square and
the same size, transparent background.

Two props for a children's educational village game. Simple bold shapes, thick dark
outline #1F2A37, flat colors, centered with empty margin. No text, no letters, no
numbers.

Frames, left to right:
1. a cute grey tabby kitten sitting down, facing the viewer, big friendly eyes, small
   pink nose, tail curled to one side, calm and waiting.
2. a small plump orange fish seen from the side, cartoon treat shape, simple fin and
   tail, one round eye.

[estilo comum] [negativo comum]
```

### 5.6 `bg-vila.png`

```
Full bright cozy village background for a children's educational game, opaque image,
16:9. Simple sunny village square with a few rounded houses, small sidewalk, soft green
ground, clear central area for mission animation, calm bottom area for machine buttons
drawn in code. No characters, no machines, no UI panels, no signs, no text, no letters,
no numbers. Friendly, clean, low detail.

[estilo comum] [negativo comum]
```

O jogo cobre a faixa de baixo com o galpão e clareia o miolo com um véu, então o
fundo pode ser detalhado nas laterais e vazio no centro.

### 5.7 `cover-vila-das-maquinas.png`

```
Cover art for a children's educational game called Vila das Máquinas.

A cozy sunny village with three friendly machines: a robot sweeper cleaning leaves, a
small drone carrying a blank package, and a warm oven baking bread. Command pictogram
icons float near each machine, but no text, no letters, no numbers. Bright, playful,
clear, not industrial, no UI frame.

[estilo comum] [negativo comum]
```

---

## 6. O que fica em Graphics

| Elemento | Como desenhar |
|---|---|
| cenário do problema | mesa, calçada, casa, telhado, chaminé, fumaça e o balão do desejo |
| pictograma do pedido | todos vêm de sprite: `itens.png` e `gato-e-peixe.png` |
| plaquinhas | cartão com ícone, estados apagado, aceso e cinza |
| botões de máquina | bay de madeira com estado normal, pressionado, gasto e destaque |
| selos de missão | anel vazio, anel pulsando e selo cheio com a máquina |
| catálogo final | cartões com máquina, nome e as duas plaquinhas acesas |
| feedback | brilho, anéis, faíscas, estrelas e confete do `shared` |

---

## 7. Sons

Sem arquivos de áudio. Tudo sintetizado em WebAudio, em `scenes/audio.ts`:

| Som | Síntese |
|---|---|
| toque | seno curto |
| robô-vassoura | ruído filtrado varrendo + pulso de motor |
| drone | zumbido oscilante |
| forninho | tom quente baixo + bip |
| comando acendendo | plim curto subindo |
| erro | queda de tom com filtro |
| fim de missão | acorde curto |
| fim de nível | fanfarra |

Todos respeitam `mute-audio`.

---

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `maquinas.png` e `icones-comandos.png` |
| Recorte | spritesheets com grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro |
| Sem | texto, número, marca, moldura, linha de grade, interface, corte |
