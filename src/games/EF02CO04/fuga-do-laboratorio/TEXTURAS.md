# Fuga do Laboratório - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF02CO04/fuga-do-laboratorio/`

---

## 0. Estado dos arquivos

| Arquivo | Situação | Uso |
|---|---|---|
| `itens.png` | **pronto** | 16 itens: 8 peças, 8 programas |
| `mascote.png` | **pronto** | 4 expressões em retrato |
| `bg-laboratorio.png` | **pronto**, fica como está | cenário |
| `cover-fuga-do-laboratorio.png` | **pronto** | capa do catálogo |
| `chassi.png` | **a gerar** | o corpo da máquina, em 4 estados |
| `ui.png` | **a gerar** | bandeja, leitor, TESTAR, molduras |
| `moveis.png` | **a gerar** | prateleira de parede e rack dos itens |

O jogo roda sem os três novos: cada um tem desenho de reserva em `Graphics`.
Eles não são dependência estrutural — são a diferença entre "desenhado em
código" e laboratório de verdade.

### Por que `moveis.png` entrou na lista

O fundo não vai ser refeito, e a arte atual não tem onde apoiar os dois móveis
que a mecânica nova precisa: a prateleira alta onde as máquinas revividas ficam
morando, e o rack baixo de onde a criança tira as peças. Sem eles, esses dois
móveis viram retângulo arredondado desenhado em código, atravessados por cima
de uma mesa redonda que já existe na arte.

---

## 1. Estilo comum

```
flat 2D cartoon educational game asset for children, simple rounded shapes, bold
readable silhouette, thick dark outline, bright friendly colors, minimal detail, flat
colors, one soft shadow, no text, transparent background
```

## 2. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, dark scary laboratory, horror,
tiny details, brand logo, text, letters, numbers, words, watermark, signature, frame,
border, grid lines, cropped, cut off, white background
```

Nada de texto, letra, número ou marca dentro da textura. O jogo escreve as
palavras por cima, com a fonte dele.

## 3. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| peça / bandeja azul | `#38BDF8` / escuro `#0D7FB4` |
| programa / leitor roxo | `#A78BFA` / escuro `#6A48CF` |
| máquina ligada | `#35D07F` |
| máquina errada | `#F59E0B` |
| metal do chassi | `#CBD9E8` / escuro `#7E97B0` |
| madeira dos móveis | `#C89A5B` / escuro `#8A6231` |
| luz | `#FFF3C4` |

---

## 4. `chassi.png` - 1024 x 1024, grade 2 x 2

O corpo da máquina, **sem** a bandeja, sem o leitor e sem o botão — esses três
vêm de `ui.png` e são desenhados por cima, porque mudam de estado sozinhos. O
chassi tem que ter os **três vãos vazios** onde eles encaixam.

```
Sprite sheet with 4 frames in a strict 2-column by 2-row grid, every frame exactly
512 by 512 pixels, transparent background.

The SAME friendly cartoon laboratory machine in all four frames, seen straight from
the front, filling about 84% of the frame, standing on small rounded feet. Chunky
rounded metal body in light steel #CBD9E8 with darker steel #7E97B0 edges and a thick
dark outline #1F2A37. Rounded top with a little antenna and two small round lamps.

The machine body MUST contain three empty recessed openings, drawn as dark empty
sockets, and nothing inside them:
- a wide horizontal tray opening on the LOWER LEFT of the front panel, with a blue
  rim #38BDF8, about 190 by 130 pixels of empty space;
- a narrow vertical card slot opening on the LOWER RIGHT of the front panel, with a
  purple rim #A78BFA, about 150 by 150 pixels of empty space;
- a round empty button recess centered under them, about 130 pixels wide.
Keep these three openings in EXACTLY the same position in all four frames.

Above the openings there is a blank rounded display panel, dark and empty, with no
symbols and no text inside it.

Frames, left to right then top to bottom:
1. machine OFF: grey and dull, lamps dark, display dark, no light anywhere.
2. machine ON and waiting: lamps glowing soft yellow #FFF3C4, display faintly lit but
   still empty, friendly and inviting.
3. machine WORKING: lamps bright green #35D07F, body slightly brighter, small happy
   energy lines around the top, display glowing.
4. machine DOING IT WRONG: lamps amber #F59E0B, a small cartoon puff of grey smoke
   escaping from the top, body tilted feeling, still friendly and funny, never broken
   or scary.

[estilo comum] [negativo comum]
```

---

## 5. `ui.png` - 1024 x 768, grade 4 x 3

Doze quadros de 256 x 256. São as peças que encaixam no chassi e as molduras.

```
Sprite sheet with 12 frames in a strict 4-column by 3-row grid, every frame exactly
256 by 256 pixels, transparent background.

Chunky cartoon interface parts for a children's laboratory game, thick dark outline
#1F2A37, flat colors, one soft shadow, each part centered with empty margin. No text,
no letters, no numbers anywhere.

Frames, left to right then top to bottom:

1. BLUE TRAY, empty: a wide open pull-out tray in blue #38BDF8 with a darker blue rim
   #0D7FB4, seen from the front, clearly a place where you PUT a physical thing, with
   a small hand-shaped engraving on its front lip.
2. BLUE TRAY, loaded: the same tray, closed and glowing, a soft light spilling from
   the seam, small blue sparkles.
3. BLUE TRAY, refusing: the same tray, tilted slightly open and pushing outward, with
   two small amber #F59E0B motion arrows pointing away from it.
4. PURPLE CARD READER, empty: a narrow vertical slot in purple #A78BFA with a darker
   purple rim #6A48CF, a small arrow engraving pointing INTO the slot, clearly a place
   where you FEED an instruction card.
5. PURPLE CARD READER, loaded: the same reader, glowing, small purple light rays
   coming out of the slot going upward.
6. PURPLE CARD READER, refusing: the same reader, with two small amber #F59E0B motion
   arrows pointing away from the slot.
7. BIG ROUND BUTTON, off: a large chunky round push button in dull grey #7E97B0 with a
   raised rim, a simple play triangle engraved in the middle, unlit.
8. BIG ROUND BUTTON, on: the same button in bright green #35D07F, glowing, the play
   triangle bright, a soft light halo around it, clearly begging to be pressed.
9. BIG ROUND BUTTON, pressed: the same green button pushed down into its rim, flatter,
   with a small ring of light escaping around the edge.
10. WALL SCREEN FRAME: an empty round wall-mounted screen bezel in light steel
    #CBD9E8, thick rim, two small screws, completely EMPTY and transparent in the
    middle so a character portrait shows through.
11. SHELF NICHE, empty: a shallow empty rounded alcove seen from the front, warm wood
    #C89A5B inside, darker #8A6231 at the back, empty and waiting.
12. SHELF NICHE, occupied: the same alcove with a warm glow inside it and a few small
    light sparkles, still empty in the middle so an object can be drawn inside.

[estilo comum] [negativo comum]
```

---

## 6. `moveis.png` - 1024 x 512, grade 1 x 2

Dois móveis largos, um por linha. Eles são esticados na horizontal pelo jogo,
então o desenho precisa aguentar um pouco de alongamento — nada de detalhe fino
repetido nem de coisa reconhecível no meio.

```
Sprite sheet with 2 frames in a strict 1-column by 2-row grid, every frame exactly
1024 by 256 pixels, transparent background.

Two wide cartoon laboratory furniture pieces for a children's game, seen straight from
the front, thick dark outline #1F2A37, warm wood #C89A5B with darker wood #8A6231,
light steel #CBD9E8 brackets, flat colors, one soft shadow. No objects standing on
them, no text, no letters, no numbers.

Frame 1 (top row): a long WALL SHELF, a single horizontal plank with a raised back
panel and two metal brackets underneath, wide and empty, designed to hold three
objects side by side. Simple and repetitive along its length.

Frame 2 (bottom row): a long LOW PARTS RACK, a workbench front with a wide flat top
and a row of shallow slots along its face, wide and empty, designed for small objects
to sit in a row. Simple and repetitive along its length.

[estilo comum] [negativo comum]
```

---

## 7. O que continua em Graphics

Deliberadamente, porque é efeito e não móvel:

| Elemento | Motivo |
|---|---|
| ondas de som, faísca, flash, papel saindo | são o RESULTADO do TESTAR, e resultado é movimento |
| rabisco do erro engraçado | idem |
| símbolo do pedido no visor | quatro glifos simples, e mudam a cada montagem |
| brilho, estrelas, confete, véu | kit `FX` compartilhado |
| barra do header e pílula do nível | UI de plataforma, igual nos 49 jogos |

---

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real nos três |
| Recorte | grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro em `ui.png` |
| Peso alvo | `chassi.png` até 500 KB; `ui.png` até 400 KB; `moveis.png` até 300 KB |
| Sem | texto, número, marca, moldura externa, linha de grade |

Se a geração vier com fundo branco, refazer em magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 9. Ordem

1. `chassi.png` — é a estrela da tela.
2. `ui.png` — é o que faz o encaixe parecer encaixe.
3. `moveis.png` — é o que tira os dois móveis do `Graphics`.
