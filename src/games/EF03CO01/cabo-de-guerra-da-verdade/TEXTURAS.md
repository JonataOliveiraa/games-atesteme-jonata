# Cabo de Guerra da Verdade - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

## 0. Estado dos arquivos

| Arquivo | Estado | Conteúdo |
|---|---|---|
| `dupla.png` | **a gerar** | a criança e o robô, 4 poses cada |
| `bg-arena.png` | **a gerar** | o pátio da escola onde a disputa acontece |

**Duas folhas, e só.** Tudo o mais é `Graphics`: a placa do robô, o cartão da
frase, o buraco, as duas cartas, a corda, o trilho, o marcador, a barra de
pensar, o balão, o risco da frase errada, a torcida e o confete. São coisas que
mudam de cor, tamanho ou estado a cada rodada, e PNG não muda — e sem textura
nenhuma o jogo continua jogável com os bonecos de reserva.

**A corda não é textura.** Ela estica entre dois pontos que se movem a cada
puxão; PNG esticado borra a trama e mostra a costura.

---

## 1. A regra que decide o tom

> **O robô é adversário, não vilão.**

Ele puxa a corda com força, mas sorri o tempo todo, tem olhos redondos e cores
claras. Nada de dentes, sobrancelha franzida, vermelho de alerta, faísca de
raiva ou postura ameaçadora.

O motivo é de mecânica, não de gosto: este jogo cobra tempo de pensar, e uma
criança que sente o adversário como ameaça responde no chute para se livrar. Um
robô simpático deixa ela pensar.

E os dois têm que parecer da **mesma turma** — mesma espessura de contorno,
mesma paleta de fundo, mesma altura de ombro. Se o robô sair maior e mais
detalhado, ele vira o dono da tela, e o dono da tela é a frase.

---

## 2. Estilo comum

```
flat 2D cartoon character for a children's educational game, chunky rounded shapes,
bold readable silhouette, thick dark navy outline #1F2A37, flat colors with one soft
inner shading and a small white gloss highlight, cheerful daylight palette, minimal
detail, friendly face, no text, transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, tiny details, scary, angry face,
sharp teeth, red glowing eyes, menacing pose, weapon, muscles, dark mood, brand logo,
text, letters, numbers, words, watermark, signature, outer frame, border, visible grid
lines, cropped, cut off, white background
```

---

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| criança | camiseta `#4FB0E8`, calça `#3B5570` |
| robô | corpo `#B8C6D6`, detalhe `#8B7BD8` |
| pele | `#F7C99A` |
| corda | `#D9A85F` (código) |
| verdadeiro | `#35D07F` (código) |
| falso | `#F59E0B` (código) |

As três últimas são do código. **Nenhum dos dois personagens pode chegar já
pintado de verde ou de laranja** — são as cores do valor pedido, e um personagem
nelas confunde quem está aprendendo a associar cor a valor.

---

## 5. `dupla.png` — 1400 x 700, grade 4 x 2

Oito quadros de 350. **A ordem é o índice do frame, e é contrato com o código.**

```
Sprite sheet with 8 frames in a strict 4-column by 2-row grid, every frame exactly
350 by 350 pixels, transparent background.

TOP ROW: the SAME cheerful child in all four frames, about 8 years old, seen from the
side in three-quarter view, facing RIGHT, wearing a light blue t-shirt and dark blue
trousers. Same size, same proportions and same colors in all four frames. The child
is holding a thick rope that leaves the frame on the right side at chest height, and
the rope is cut off at the frame edge.
1. child WAITING: standing straight, relaxed grip on the rope, calm friendly smile.
2. child PULLING: leaning back, both heels dug into the ground, arms bent, happy
   effort on the face, hair blown back a little.
3. child THINKING: one hand still on the rope, the other hand touching the chin,
   eyes looking up, curious.
4. child CELEBRATING: one arm raised high with an open hand, big smile, both feet
   off the ground in a small jump, the rope loose.

BOTTOM ROW: the SAME friendly robot in all four frames, the same height as the child,
seen from the side in three-quarter view, facing LEFT, light grey-blue rounded metal
body, soft purple details, two big round friendly eyes, a small antenna with a ball
on top, no mouth. Same size and same colors in all four frames. The robot is holding
the same thick rope, which leaves the frame on the LEFT side at chest height and is
cut off at the frame edge. The robot must look kind and playful in every frame, never
threatening.
5. robot WAITING: standing straight, relaxed grip, eyes calm.
6. robot PULLING: leaning back, arms bent, small effort lines, eyes squinting in a
   friendly way.
7. robot THINKING: one hand on the rope, the antenna ball glowing softly, eyes
   looking up, three small dots floating above the antenna.
8. robot CELEBRATING: both arms up, eyes turned into happy curves, a little hop.

Every figure is centered in its frame with about 8% empty margin, standing on an
invisible ground line at the same height in all eight frames.

[estilo comum] [negativo comum]
```

| Frame | Quem | Pose |
|---|---|---|
| 0 | criança | esperando |
| 1 | criança | puxando |
| 2 | criança | pensando |
| 3 | criança | comemorando |
| 4 | robô | esperando |
| 5 | robô | puxando |
| 6 | robô | pensando |
| 7 | robô | comemorando |

### As três coisas que mais estragam esta folha

1. **A linha do chão.** Se os pés mudarem de altura entre quadros, a troca de
   pose vira um pulinho. Peça a mesma linha nos oito e confira medindo.
2. **A corda desenhada dentro do quadro.** Ela precisa sair pela borda e ser
   cortada ali, porque quem desenha o trecho do meio é o código. Corda que
   termina dentro do quadro deixa um toco no ar.
3. **O robô crescer.** Ele tende a sair maior e mais detalhado que a criança.
   Mesma altura de ombro, mesmo peso de traço.

---

## 6. `bg-arena.png` — 1280 x 720

O pátio onde a disputa acontece.

```
A cheerful school courtyard seen straight from the front, wide flat composition, sunny
day, a low wall with colorful flags strung above it, two leafy trees at the sides, a
smooth ground area across the bottom third. Soft pastel colors, low contrast, and
NOTHING detailed in the middle of the image, because two characters and a large text
card will cover the center. No people, no crowd, no text, no banners with writing.

[estilo comum, mas sem contorno grosso] [negativo comum]
```

O miolo tem que ser calmo. É onde a frase e a corda vivem, e detalhe ali disputa
com a única coisa que a criança precisa ler.

**A torcida não vem no fundo.** Ela é `Graphics` — silhuetas simples que sobem e
descem no puxão. Torcida pintada no PNG fica parada justo no momento em que ela
deveria comemorar.

---

## 7. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real na `dupla.png` |
| Recorte | grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro |
| Peso alvo | `dupla.png` até 600 KB; `bg-arena.png` até 500 KB |
| Sem | texto, número, marca, moldura externa, linha de grade |

Se a geração vier com fundo branco, refazer sobre magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 8. Depois que a folha chegar

Medir a caixa alfa dos oito quadros e conferir duas coisas antes de ajustar o
layout: se a **linha do chão** bate nos oito, e se a **altura do peito** (onde a
corda sai) bate entre a criança e o robô. É dessa altura que o código tira o
ponto de partida da corda — se os dois não combinarem, a corda sai torta e o
puxão parece defeito de desenho.
