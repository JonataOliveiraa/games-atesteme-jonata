# Diário das Férias — MANIFEST

Medido em 08/10/2026. Os originais (fora do contrato) estão no scratchpad da sessão em `originais/`.

| Arquivo | Chegou | Ficou | O que foi feito |
|---|---|---|---|
| `bg-praia.png` | 2112 × 744 (panorama) | **2044 × 720**, opaco | só reduzido para 720 de altura: o jogo é um mundo largo e a câmera passeia (a versão emendada em 1280 ficou no scratchpad, `bg-praia-emendado-1280.png`) |
| `coisas-praia.png` | 1400 × 700 (4 × 2 de 350) | igual | alfa ≤ 24 zerado; cor da borda puxada dos vizinhos opacos (sem franja vermelha); gotinha do golfinho que invadia a célula 7 (x 1100–1160, y 350–372) apagada |
| `interface.png` | `interfacew.png`, 1400 × 350 (4 × 1 de 350) | renomeado | bolinha do joystick recortada em círculo (centro 1233, 170; raio 111), sem o pezinho; mesma limpeza de borda |
| `duda.png` | 1170 × 1300 (3 × 2 de 390 × 650) | igual | mesma limpeza de borda; 1 pontinho solto apagado |
| `bg-teatrinho.png` | 1672 × 941 | 1280 × 720, opaco | só reduzido |

## Lugares na praia (mundo de 2044 × 720)

| Lugar | Centro | Coisa |
|---|---|---|
| copa do coqueiro | (235, 160), copa x 0–465, y 0–337 | passarinho (notas de 235, 135) |
| pedra no mar | (603, 363), base y ≈ 399 | onda (pé do sprite em 603, 405) |
| toca | (940, 567) | caranguejo (centro 940, 520) |
| mar aberto | (1250, 330) | golfinho |
| céu | (1250, 170) | arco-íris |
| encosta da duna | notas de (1765, 265) | sorveteiro (coisa em 1720, 330) |
| cabana, janela fechada | (1896, 368) | música (coisa em 1930, 355) |
| areia, esquerda | (380, 525) | castelo |

## Teatrinho (1280 × 720)

Miolo creme do telão: x 331–949, y 74–394 → `STAGE.screen` = (640, 234, 618 × 320). Piso do palco y 436–528; plateia a partir de y 559; vasos nas bordas (x ≥ 1148 e x ≤ 130). Duda em (1080, pés 532), espelhada.

## Contrato das células (não mudar a ordem)

- `coisas-praia`: arco-íris, caranguejo andando, caranguejo assustado, golfinho no salto / golfinho mergulhando, espirro, castelo, onda.
- `interface`: FOTO, SOM, base do joystick, bolinha.
- `duda`: sorrindo, falando, comemorando / ops, apresentando (aponta para a direita da imagem), agradecendo.

## Sons

| Arquivo | Duração | Uso |
|---|---|---|
| `bird.mp3` | 2,0 s | canto do passarinho escondido no coqueiro (no lugar do som sintetizado). Toca inteiro uma vez por ciclo (canta 2 s, fica 3 s quieto) a **32 %** do volume (`SAMPLE_GAIN` em `scenes/audio.ts`), bem baixinho com a mira longe e mais forte com a mira perto e com o microfone sacado. Um `.mp3` com o nome de outra coisa (`icecream`, `music`, `wave`, `dolphin`) entra sozinho do mesmo jeito. |
