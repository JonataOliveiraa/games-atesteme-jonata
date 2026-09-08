# Série do Campeão - prompts das texturas

**3 arquivos de jogo + 1 background + 1 capa.** Destino:
`src/assets/games/EF02CO02/serie-do-campeao/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Este jogo deve usar pouca textura. A clareza vem dos cartões, bolinhas e botões
em `Graphics`. A textura principal é o atleta, uma folha pequena de ícones dá
acabamento aos cartões e botões, e o background do ginásio pode entrar como
opcional se o desenho em `Graphics` ficar simples demais.

---

## 1. Arquivos

| Arquivo | Grade | Tamanho final | Uso |
|---|---|---|---|
| `atleta.png` | 5 x 1 | 1280 x 256 | parado, pulo, giro, comemora, atrapalhado |
| `treinadora.png` | 3 x 1 | 768 x 256 | parada, apitando, comemorando |
| `icones-serie.png` | 3 x 1 | 768 x 256 | pulo, giro, repetir |
| `bg-ginasio.png` | - | 1280 x 720 | background opcional do ginásio |
| `cover-serie-do-campeao.png` | - | 1024 x 576 | capa do catálogo |

Não pedir textura para juízes, botões, cartões, bolinhas, setas, medalhas,
estrelas, contador, cadeado, plaquinha ou UI. `icones-serie.png` é só o desenho
interno dos pictogramas, não o botão inteiro — e o selo de etapa cumprida NÃO
entra na folha: ele é a roseta desenhada em `icons.ts`, que precisa crescer com
uma animação e mudar de cor conforme o estado. `bg-ginasio.png` é opcional e não
pode conter elementos de interface.

---

## 2. Estilo comum

```
flat 2D cartoon illustration, chibi sports character for a children's educational
game, simple rounded shapes, bold readable silhouette, thick dark outline, bright
friendly colors, minimal detail, flat colors, one soft shadow, clear expression,
transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, complex anatomy, scary, angry,
competitive pressure, scoreboard, numbers, text, letters, words, watermark, signature,
frame, border, grid lines, UI panel, button, medal icon, star icon, cropped, cut off,
white background
```

Nada de letras, números, placar ou texto dentro da textura.

---

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| pele | `#B8754A` |
| cabelo | `#3B2A22` |
| camiseta | `#2DD4BF` |
| shorts | `#F59E0B` |
| tênis | `#4DA3FF` |
| detalhe de vitória | `#FACC15` |

---

## 5. Prompts

### 5.1 `atleta.png` - 1280 x 256, grade 5 x 1

```
Sprite sheet with 5 frames in a strict 5-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

The SAME child athlete in every frame, chibi proportions, teal shirt #2DD4BF, orange
shorts #F59E0B, blue sneakers #4DA3FF, warm medium-brown skin #B8754A, short dark hair
#3B2A22, thick dark outline #1F2A37, full body visible, centered with empty margin.
Friendly sports practice mood, no competition pressure.

Frames, left to right:
1. standing ready, smiling, knees slightly bent.
2. jumping upward, arms raised, feet off the ground.
3. spinning, one foot pivoting, arms open, curved motion hint around body but no text.
4. celebrating, arms up, big smile, small confetti shapes around body.
5. silly off-balance pose after a mistake, safe and funny, one foot lifted, surprised
   smile, no fear and no injury.

[estilo comum] [negativo comum]
```

### 5.2 `icones-serie.png` - 768 x 256, grade 3 x 1

```
Sprite sheet with 3 frames in a strict 3-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

Three large pictogram icons for a children's repetition algorithm game. Simple bold
shapes, thick dark outline #1F2A37, flat colors, readable at small size, centered
with empty margin. No text, no letters, no numbers.

Frames, left to right:
1. jump icon: simplified child silhouette or shoe jumping upward with a curved arrow.
2. spin icon: simplified child silhouette spinning with one circular arrow.
3. repeat icon: three small dots following a circular arrow, showing "do again".

[estilo comum] [negativo comum]
```

### 5.2.1 `treinadora.png` - 768 x 256, grade 3 x 1

```
Sprite sheet with 3 frames in a strict 3-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

The SAME young sports coach in every frame, chibi proportions, teal shirt #2DD4BF,
orange shorts #F59E0B, blue sneakers #4DA3FF, warm medium-brown skin #B8754A, dark
curly shoulder-length hair #3B2A22, a whistle on a cord around the neck, thick dark
outline #1F2A37, full body visible, centered with empty margin. Encouraging, never
strict.

Frames, left to right:
1. standing calmly, one hand on the hip, friendly smile.
2. blowing the whistle with one arm raised and the index finger pointing up, calling
   the next move.
3. celebrating, both arms up, jumping a little, small confetti shapes around body.

[estilo comum] [negativo comum]
```

### 5.3 `bg-ginasio.png` - 1280 x 720, opcional

Use só se o ginásio em `Graphics` ficar visualmente pobre.

```
Full 1280 by 720 background for a children's sports practice game, bright simple
school gym, opaque image. Clean center area for a child athlete, simple court floor,
soft wall colors, a few abstract audience dots far in the back, no detailed faces,
no scoreboard, no signs, no text, no letters, no numbers. Leave bottom area from y
520 to y 720 visually calm for large game buttons drawn in code. Friendly, playful,
not competitive.

[estilo comum] [negativo comum]
```

### 5.4 `cover-serie-do-campeao.png` - 1024 x 576

```
Cover art for a children's educational game called Série do Campeão, 1024 by 576.

A bright simple gym with a child athlete happily jumping and spinning. Large visual
routine cards float nearby showing only pictograms and empty/filled dots, no letters,
no numbers, no words. Friendly sports practice atmosphere, colorful, playful, no UI
frame, no scoreboard.

[estilo comum] [negativo comum]
```

---

## 6. O que fica em Graphics

| Elemento | Como desenhar |
|---|---|
| ginásio | usar `bg-ginasio.png` se existir; fallback em chão, linhas da quadra e arquibancada simples |
| treinadora | usar `treinadora.png`; fallback em boneco vetorial simples |
| plaquinha da treinadora | quadro em `Graphics` com o ícone do movimento dentro, some quando não há movimento pedido |
| cartões de algoritmo | retângulos, número em Phaser Text, bolinhas e ícone |
| selo de etapa cumprida | roseta em `Graphics`: recorte de pétalas, miolo verde e tique branco |
| ícones de pulo/giro | usar `icones-serie.png` se existir; fallback vetorial simples |
| cronômetro | `shared/hud/createTimeBar`, dentro da faixa do topo |
| botões | áreas grandes com estado normal, pressionado e destacado |
| feedback | selo, cadeado, brilho, confete e estrelas |
| replay | rastros e cópias transparentes do atleta |

---

## 7. Sons

Sem arquivos de áudio. Sons sintetizados em WebAudio:

| Som | Síntese |
|---|---|
| toque | seno curto |
| pulo | pop ascendente |
| giro | ruído filtrado em varredura curta |
| etapa completa | acorde de 2 notas |
| erro | boing leve |
| fim de série | fanfarra curta |

Todos respeitam `mute-audio`.

---

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `atleta.png` |
| Recorte | spritesheet com grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro |
| Peso alvo | `atleta.png` até 300 KB; `icones-serie.png` até 180 KB; `bg-ginasio.png` até 450 KB; capa até 400 KB |
| Sem | texto, número, placar, marca, moldura, linha de grade, interface, corte |

Se a geração vier com fundo branco, refazer em magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 9. Ordem

1. Implementar atleta placeholder em Graphics.
2. Implementar cartões, bolinhas e botões em Graphics.
3. Gerar `icones-serie.png`.
4. Gerar `atleta.png`.
5. Gerar `bg-ginasio.png` se o ginásio em Graphics precisar de mais acabamento.
6. Gerar `cover-serie-do-campeao.png`.

O jogo deve continuar jogável sem `atleta.png`, sem `icones-serie.png` e sem
`bg-ginasio.png`; as texturas melhoram o carisma, mas não podem ser dependência
estrutural.

---

## 10. O que foi entregue

| Arquivo | Pedido | Entregue | Situação |
|---|---|---|---|
| `atleta.png` | 1280 × 256, 5 × 1 | 1400 × 399, 5 × 1 | usado; quadros de 280 × 399 |
| `treinadora.png` | 768 × 256, 3 × 1 | 840 × 400, 3 × 1 | usado; quadros de 280 × 400 |
| `icones-serie.png` | 768 × 256, 3 × 1 | 384 × 128, 3 × 1 | usado; quadros de 128 × 128 |
| `bg-ginasio.png` | 1280 × 720 | 1672 × 941 | usado; entra por `cover`, centro limpo e base calma como pedido |
| `cover-serie-do-campeao.png` | 1024 × 576 | 1672 × 941 | usado no catálogo |

**O tamanho do quadro não está no código.** O `BootScene` carrega as folhas como
imagem simples e fatia os quadros dividindo a largura pelo número de colunas
(`ATHLETE_COLUMNS = 5`, `ICON_COLUMNS = 4`). Regerar uma folha em outra resolução
não quebra nada, desde que a grade e a ORDEM dos quadros continuem as mesmas:

- `atleta.png`: parado, pulo, giro, comemora, atrapalhado
- `treinadora.png`: parada, apitando, comemorando
- `icones-serie.png`: pulo, giro, repetir

O quadro `repetir` ainda não aparece na tela do nível 1 — ele está previsto para
o cartão de série com mais de uma etapa, nos níveis 2 e 3.

O selo de etapa cumprida saiu da folha e virou desenho: como ele nasce em escala
zero e cresce, e troca de cor conforme o cartão fecha, um PNG fixo ficava sempre
meio passo atrás do estado do cartão.
