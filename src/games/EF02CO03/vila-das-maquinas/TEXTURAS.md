# Vila das Máquinas - prompts das texturas

**2 arquivos de jogo + 1 background opcional + 1 capa.** Destino:
`src/assets/games/EF02CO03/vila-das-maquinas/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Este jogo deve usar pouca textura. A clareza vem dos pictogramas, comandos e
plaquinhas em `Graphics`. As texturas dão carisma às três máquinas e acabamento
ao cenário se necessário.

---

## 1. Arquivos

| Arquivo | Grade | Tamanho final | Uso |
|---|---|---|---|
| `maquinas.png` | 3 x 2 | 768 x 512 | três máquinas em repouso + três em ação |
| `icones-comandos.png` | 6 x 1 | 1536 x 256 | varrer, girar, voar, soltar, assar, apitar |
| `bg-vila.png` | - | 1280 x 720 | background opcional da vila |
| `cover-vila-das-maquinas.png` | - | 1024 x 576 | capa do catálogo |

Não pedir textura para moradores, balões, plaquinhas completas, botões,
catálogo, estrelas, cadeado ou UI.

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
| comandos | `#2DD4BF`, `#60A5FA`, `#F97316`, `#A78BFA` |

---

## 5. Prompts

### 5.1 `maquinas.png` - 768 x 512, grade 3 x 2

```
Sprite sheet with 6 frames in a strict 3-column by 2-row grid, every frame exactly
256 by 256 pixels, transparent background.

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

### 5.2 `icones-comandos.png` - 1536 x 256, grade 6 x 1

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

### 5.3 `bg-vila.png` - 1280 x 720, opcional

Use só se a vila em `Graphics` ficar visualmente pobre.

```
Full 1280 by 720 bright cozy village background for a children's educational game,
opaque image. Simple sunny village square with a few rounded houses, small sidewalk,
soft green ground, clear central area for mission animation, calm bottom area for
machine buttons drawn in code. No characters, no machines, no UI panels, no signs, no
text, no letters, no numbers. Friendly, clean, low detail.

[estilo comum] [negativo comum]
```

### 5.4 `cover-vila-das-maquinas.png` - 1024 x 576

```
Cover art for a children's educational game called Vila das Máquinas, 1024 by 576.

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
| moradores | bonecos simples com expressão e aceno |
| problemas | folhas, sofá, telhado, janela, pão cru, massa em pictogramas vetoriais |
| plaquinhas | retângulos, slots e brilho de comando |
| botões de máquina | áreas grandes com estado normal, pressionado e destacado |
| catálogo final | cartões em Graphics usando máquina + ícones |
| feedback | cadeado, selo, estrelas, brilho e partículas |
| tutorial | painel compartilhado e dedo animado em Graphics |

---

## 7. Sons

Sem arquivos de áudio. Sons sintetizados em WebAudio:

| Som | Síntese |
|---|---|
| toque | seno curto |
| robô-vassoura | ruído leve filtrado + pulso de motor |
| drone | zumbido suave oscilante |
| forninho | tom quente baixo + bip |
| comando acendendo | plim curto |
| erro | boing leve |
| fim de missão | acorde curto |
| fim de nível | fanfarra curta |

Todos respeitam `mute-audio`.

---

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `maquinas.png` e `icones-comandos.png` |
| Recorte | spritesheets com grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro |
| Peso alvo | `maquinas.png` até 320 KB; `icones-comandos.png` até 200 KB; `bg-vila.png` até 450 KB; capa até 400 KB |
| Sem | texto, número, marca, moldura, linha de grade, interface, corte |

Se a geração vier com fundo branco, refazer em magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 9. Ordem

1. Implementar vila, moradores, problemas e máquinas placeholder em Graphics.
2. Gerar `icones-comandos.png`.
3. Gerar `maquinas.png`.
4. Gerar `bg-vila.png` só se necessário.
5. Gerar `cover-vila-das-maquinas.png`.

O jogo deve continuar jogável sem as texturas. Elas melhoram carisma e leitura,
mas não podem ser dependência estrutural.
