# Esconde-Dados - prompts das texturas

**2 arquivos de jogo + 1 capa.** Destino:
`src/assets/games/EF01CO07/esconde-dados/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Este jogo deve usar pouca textura. A pracinha, os esconderijos, a lanterna, o
cartão, o cofre, os escudos e os pictogramas saem em `Graphics`. As texturas
existem só para dar identidade humana aos personagens e para a capa do catálogo.

---

## 1. Arquivos

| Arquivo | Grade | Tamanho final | Uso |
|---|---|---|---|
| `crianca.png` | 4 x 1 | 1024 x 256 | personagem principal: parado, correndo, escondido, recusando |
| `pessoas.png` | 5 x 1 | 1280 x 256 | adulto confiável 1, adulto confiável 2, pessoa curiosa, avatar de app, adulto neutro |
| `cover-esconde-dados.png` | - | 1024 x 576 | capa do catálogo |

Não pedir textura para cenário, cartão, cofre, esconderijo, lanterna, cone de
luz, escudo, cadeado, botões, estrelas, balões ou UI.

---

## 2. Estilo comum

```
flat 2D cartoon illustration, chibi style for a first-grade educational game,
simple rounded shapes, bold readable silhouette, thick dark outline, warm friendly
colors, minimal detail, flat colors, one soft shadow, clear face expression,
transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, scary, threatening, dark horror,
police, weapon, chase scene, danger symbol, text, letters, numbers, words, watermark,
signature, frame, border, grid lines, UI panel, button, speech bubble, lock icon,
star icon, cropped, cut off, white background
```

Nada de texto dentro da imagem. Nenhum nome, número de telefone, endereço ou
nome de escola pode aparecer em textura.

---

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| pele clara | `#F2B28C` |
| pele média | `#B8754A` |
| cabelo escuro | `#3B2A22` |
| camiseta criança | `#4DA3FF` |
| short criança | `#FFB84D` |
| adulto confiável | `#2FBF71` |
| pessoa curiosa | `#8B8F98` |
| avatar de app | `#8B5CF6` |
| destaque seguro | `#35D07F` |

---

## 5. Prompts

### 5.1 `crianca.png` - 1024 x 256, grade 4 x 1

```
Sprite sheet with 4 frames in a strict 4-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

The SAME first-grade child in all frames: friendly chibi proportions, blue shirt
#4DA3FF, yellow shorts #FFB84D, simple sneakers, thick dark outline #1F2A37, clear
face, full body visible, centered with empty margin. A small data card peeks from a
front pocket in every frame, shown only as a blank card with a shield pictogram, no
text, no letters, no numbers.

Frames, left to right:
1. standing carefully, one hand holding the pocket with the card.
2. running to the right, happy focused face, arms moving.
3. hiding crouched behind an implied low shape, only upper body visible, finger near
   lips in a quiet gesture, no fear.
4. refusing politely with one big open hand forward, calm face, card protected in
   pocket.

[estilo comum] [negativo comum]
```

### 5.2 `pessoas.png` - 1280 x 256, grade 5 x 1

```
Sprite sheet with 5 frames in a strict 5-column by 1-row grid, every frame exactly
256 by 256 pixels, transparent background.

Five friendly simplified characters for a child online safety game, same style and
scale, full body visible, centered with empty margin, thick dark outline #1F2A37, no
text, no letters, no numbers.

Frames, left to right:
1. trusted parent or caregiver, warm smile, green clothing #2FBF71, open welcoming
   posture, small blank shield badge with no symbol text.
2. trusted teacher, warm smile, green detail #2FBF71, simple lanyard badge with a
   shield pictogram only, no letters.
3. unknown curious adult, friendly but neutral, gray clothing #8B8F98, one hand asking
   to see something, no scary expression.
4. app avatar on a rounded square base, purple #8B5CF6, smiling screen face, offering
   a small blank sticker card, no letters.
5. neutral adult silhouette, friendly, beige and blue clothing, no badge, used as a
   distractor.

[estilo comum] [negativo comum]
```

### 5.3 `cover-esconde-dados.png` - 1024 x 576

```
Cover art for a first-grade educational game named Esconde-Dados, 1024 by 576.

A friendly child in a sunny playground protects a glowing blank data card in a pocket
while moving between simple hiding spots. A soft yellow flashlight cone is visible in
the background, a green shield and a small safe appear near a trusted adult. Bright,
safe, playful, no fear, no chase, no UI frame, no text, no letters, no numbers.

[estilo comum] [negativo comum]
```

---

## 6. O que fica em Graphics

| Elemento | Como desenhar |
|---|---|
| pracinha | céu, chão, árvores simples e portão com retângulos e curvas |
| esconderijos | moita, banco, placa e caixa com formas vetoriais |
| curioso | corpo geométrico simples, olho, lanterna presa ao braço |
| lanterna | cone amarelo translúcido com borda suave |
| cartão | retângulo arredondado com pictograma do dado atual |
| dados pessoais | ícones: rosto, casa, mochila, telefone sem números, retrato |
| cofre | retângulos arredondados, porta, brilho e animação de abrir |
| escudo | shape vetorial, verde seguro ou dourado final |
| UI | HUD, tutorial, botões, progresso, brilho, cadeado, estrelas |

O curioso pode ser totalmente em Graphics para economizar textura. Ele precisa
ser simpático e previsível: a lanterna é o obstáculo, não o personagem.

---

## 7. Sons

Sem arquivos de áudio. Sons sintetizados em WebAudio:

| Som | Síntese |
|---|---|
| toque | seno curto |
| corrida | ruído leve com filtro alto |
| esconderijo | pop macio |
| visto pela luz | boing curto + risada leve sintetizada |
| bloqueio de dado | tom grave curto |
| cofre abrindo | arpejo ascendente |
| fim de nível | fanfarra curta |

Todos respeitam `mute-audio`.

---

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `crianca.png` e `pessoas.png` |
| Recorte | spritesheets com grade exata, sem sangria entre quadros |
| Margem | cerca de 8% de área vazia por quadro |
| Peso alvo | sprites até 250 KB cada; capa até 400 KB |
| Sem | texto, número, marca, moldura, linha de grade, interface, corte |

Se a geração vier com fundo branco, refazer em magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 9. Ordem

1. Implementar todos os placeholders em Graphics.
2. Gerar `crianca.png`.
3. Gerar `pessoas.png`.
4. Gerar `cofre.png` — tira HORIZONTAL, 4 quadros de 256 × 256, na ordem
   fechado, entreaberto, meio aberto, escancarado. A porta gira para a
   DIREITA e o corpo fica parado, senão o cofre pula de lugar ao abrir.
5. Só depois gerar `cover-esconde-dados.png`.

O jogo deve continuar publicável mesmo se apenas a capa existir. As sprites
melhoram o acabamento, mas não podem ser dependência estrutural.
