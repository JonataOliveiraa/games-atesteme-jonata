# Fuga do Laboratório - prompts das texturas

**2 arquivos de jogo + 1 background opcional + 1 capa.** Destino:
`src/assets/games/EF02CO04/fuga-do-laboratorio/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Este jogo deve usar pouca textura. A interface de escape room fica em
`Graphics`: porta, fechaduras, gavetas, botões, mesa, setas e dicas. As texturas
principais são uma folha de itens para os cartões e uma mascote em portrait para
dar vida ao jogo.

---

## 1. Arquivos

| Arquivo | Grade | Tamanho final | Uso |
|---|---|---|---|
| `itens.png` | 4 x 4 | 1024 x 1024 | cartões de hardware e software |
| `mascote.png` | 4 x 1 | 1024 x 256 | menina loira em portrait: normal, apontando, feliz, dúvida |
| `bg-laboratorio.png` | - | 1280 x 720 | background opcional do laboratório |
| `cover-fuga-do-laboratorio.png` | - | 1024 x 576 | capa do catálogo |

Não pedir textura para gavetas, porta, fechaduras, botões, cadeado, estrelas,
mão, seta de comando, painel ou UI.

---

## 2. Estilo comum

```
flat 2D cartoon educational game asset for children, simple rounded shapes, bold
readable silhouette, thick dark outline, bright friendly colors, minimal detail, flat
colors, one soft shadow, no text, transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, dark scary laboratory, horror,
tiny details, brand logo, text, letters, numbers, words, watermark, signature, frame,
border, grid lines, UI panel, button, lock icon, star icon, cropped, cut off, white
background
```

Nada de texto, letras, números, marcas ou telas com palavras dentro da textura.

---

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| hardware azul | `#38BDF8` |
| software roxo | `#A78BFA` |
| acerto verde | `#35D07F` |
| laboratório claro | `#E0F2FE`, `#F7DFA8`, `#C4B5FD` |
| alerta suave | `#F59E0B` |
| cabelo da mascote | `#FACC15` |
| roupa da mascote | `#38BDF8` |

---

## 5. Prompts

### 5.1 `itens.png` - 1024 x 1024, grade 4 x 4

```
Sprite sheet with 16 frames in a strict 4-column by 4-row grid, every frame exactly
256 by 256 pixels, transparent background.

Sixteen simple cards/icons for a children's hardware and software game. Each object is
centered, large, full object visible, same scale, thick dark outline #1F2A37, flat
colors, very clear silhouette. Hardware items look physical and touchable. Software
items look like app tiles or screen symbols but contain no text, no letters, no
numbers.

Frames, left to right then top to bottom:
1. computer mouse, blue hardware style.
2. keyboard, blue hardware style, blank keys without letters.
3. monitor screen, blue hardware style, blank screen.
4. speaker box, blue hardware style.
5. camera, blue hardware style.
6. toy robot, blue hardware style.
7. game controller, blue hardware style.
8. printer, blue hardware style, no paper text.
9. music app tile, purple software style, musical note icon only.
10. drawing app tile, purple software style, brush icon only.
11. photo app tile, purple software style, mountain/photo icon only.
12. game app tile, purple software style, joystick icon only.
13. robot dance program tile, purple software style, robot silhouette with motion lines.
14. alarm program tile, purple software style, bell icon only.
15. browser app tile, purple software style, globe icon only.
16. text editor app tile, purple software style, pencil and blank page icon, no words.

[estilo comum] [negativo comum]
```

### 5.2 `mascote.png` - 1024 x 256, grade 4 x 1

```
Sprite sheet with 4 frames in a strict 4-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

The SAME blonde child mascot in every frame, portrait from clavicle up only, no full
body. Friendly second-grade guide character, light skin, blonde hair #FACC15, blue
shirt collar #38BDF8 visible at the bottom, thick dark outline #1F2A37, simple rounded
face, big readable expression, centered with empty margin. No text, no letters, no
numbers, no speech bubble.

Frames, left to right:
1. neutral friendly smile, looking at the player.
2. pointing to the right with one hand partly visible, helpful expression.
3. happy celebration, eyes bright, small safe confetti shapes around head.
4. thinking/confused expression, one eyebrow raised, hand near chin, gentle and not
   frustrated.

[estilo comum] [negativo comum]
```

### 5.3 `bg-laboratorio.png` - 1280 x 720, opcional

Use só se o laboratório em `Graphics` ficar visualmente pobre.

```
Full 1280 by 720 bright friendly children's laboratory background, opaque image.
Colorful escape room mood without fear: soft walls, simple shelves, round lamps,
friendly door shape in the back, clean central table area, calm bottom area for large
buttons drawn in code. Reserve a clean upper-left corner for a portrait mascot overlay.
No characters baked into the background, no UI panels, no readable signs, no text, no
letters, no numbers, no scary elements.

[estilo comum] [negativo comum]
```

### 5.4 `cover-fuga-do-laboratorio.png` - 1024 x 576

```
Cover art for a children's educational game called Fuga do Laboratório, 1024 by 576.

A bright friendly lab escape room with a big door opening, blue physical device icons
on one side and purple app program icons on the other. A blonde child mascot portrait
appears near the side, smiling and pointing toward the open door. Playful and clear,
no fear, no horror, no UI frame, no text, no letters, no numbers.

[estilo comum] [negativo comum]
```

---

## 6. O que fica em Graphics

| Elemento | Como desenhar |
|---|---|
| mesa | retângulos arredondados e sombra |
| porta | formas grandes com três fechaduras animadas |
| gavetas | azul para PEÇA, roxa para PROGRAMA, com estados |
| botões | áreas grandes com estado pressionado e destaque |
| dica de hardware | mão tocando o cartão |
| dica de software | seta saindo do app para uma peça |
| sala final | dois painéis e linhas luminosas de pareamento |
| feedback | cadeado, selo, estrelas, brilho e partículas |
| moldura da mascote | círculo/recorte e sombra em Graphics; PNG é só a personagem |

---

## 7. Sons

Sem arquivos de áudio. Sons sintetizados em WebAudio:

| Som | Síntese |
|---|---|
| toque | seno curto |
| cartão chegando | plim curto |
| gaveta certa | clique limpo |
| gaveta errada | boing macio |
| fechadura girando | ruído curto + clique |
| par correto | arpejo curto |
| porta abrindo | fanfarra curta |

Todos respeitam `mute-audio`.

---

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `itens.png` e `mascote.png` |
| Recorte | spritesheet com grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro |
| Peso alvo | `itens.png` até 420 KB; `mascote.png` até 220 KB; `bg-laboratorio.png` até 450 KB; capa até 400 KB |
| Sem | texto, número, marca, moldura, linha de grade, interface, corte |

Se a geração vier com fundo branco, refazer em magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 9. Ordem

1. Implementar laboratório, porta, gavetas e itens placeholder em Graphics.
2. Implementar portrait placeholder da mascote em Graphics.
3. Gerar `mascote.png`.
4. Gerar `itens.png`.
5. Gerar `bg-laboratorio.png` só se necessário.
6. Gerar `cover-fuga-do-laboratorio.png`.

O jogo deve continuar jogável sem as texturas. Elas melhoram leitura e carisma,
mas não podem ser dependência estrutural.
