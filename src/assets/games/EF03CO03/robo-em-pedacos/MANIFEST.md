# Robô em Pedaços — arte entregue (05/10/2026, linha livro ilustrado)

| Arquivo | Chegou | No jogo | O que foi feito |
|---|---|---|---|
| `bg-oficina.png` | 1672 × 941 | esticado para 1280 × 720 | nada; o tampo do elevador ficou em y ≈ 492 e x 122–721 (o plano dizia 612), e o layout foi ajustado |
| `modulos.png` | 1200 × 900, células de 300 | 1536 × 1152, células de **384** | reempacotado sem mudar escala: cada peça centrada na célula, y + 42; os braços acesos cruzavam a borda |
| `pontos.png` | 1024 × 1024, células de 256 | 768 × 768, células de **192** | limpo (granulado solto) e reduzido 0,75 |
| `nina.png` | 1400 × 480, células de 350 × 480 | 1536 × 512, células de **384 × 512** | cada pose centrada, pé em y = 490 |
| `cover-robo-em-pedacos.png` | 1672 × 941 | capa do catálogo | ligada no catálogo; OG em `public/og/robo-em-pedacos.jpg` |

Originais em `outputs/robo-em-pedacos/*-original.png`.

Medidas na célula de 384 (`data/files.ts → MODULE_ART`):

| Módulo | pé (bottom) | encaixe de cima (top) | pontos (N1 usa os 3 primeiros) |
|---|---|---|---|
| pernas | 311 | 81 | mola (113,212) · engrenagem (255,212) · parafuso (185,130) · fio (118,262) |
| corpo | 309 | 85 | parafuso (118,222) · fio (276,208) · botão (192,160) · mola (192,278) |
| cabeça | 308 | 71 | antena (192,94), sobre a antena da arte · olho (160,192) · lâmpada (292,212) · parafuso (252,262) |

Empilhamento por junta (`seat`, em pixels da célula, multiplicado pela escala 0,6 do elevador):
- **cintura 46**: o anel de baixo do corpo assenta sobre a placa do quadril e esconde o furo dela;
- **pescoço 38**: o pino da cabeça entra na gola do corpo.

**As peças acesas foram alinhadas às apagadas** pelo pé (cabeça desceu 5 px, corpo 2, braços subiram 8,
pernas 2, sapatos desceram 5). Sem isso a peça dava um pulinho ao acender.
