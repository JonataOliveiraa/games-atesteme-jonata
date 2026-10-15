# Câmera na Trilha — manifesto das texturas

Recebidas em 14/10/2026, na linha **floresta chapada** (`references/36-floresta-chapada.webp`). Prompts em `src/games/EF04CO06/camera-na-trilha/TEXTURAS.md`.

**Limpeza:** os PNGs vieram com pontinhos coloridos quase transparentes em volta dos desenhos (sobra do recorte). O alfa ≤ 24 foi zerado nas 8 folhas, e nenhum desenho perdeu parte. Os originais estão em `outputs/camera-na-trilha/originais/`.

## As folhas

O código mede cada célula na carga (`addFrames`), então os tamanhos fora do contrato não quebram nada. Grade, ordem e direção conferidas uma a uma.

| Arquivo | Tamanho | Grade | Célula | No N1 |
|---|---|---|---|---|
| `teo.png` | 1400 × 900 | 4 × 2 | 350 × 450 | sim |
| `teo-andar.png` | 1400 × 1350 | 4 × 3 | 350 × 450 | sim (andar: frente, costas, lado direito) |
| `natureza.png` | 1400 × 700 | 4 × 2 | 350 | sim |
| `cenario.png` | 1400 × 700 | 4 × 2 | 350 | sim |
| `cachoeira.png` | 1024 × 512 | 2 × 1 | 512 | sim |
| `camera-ui.png` | 1024 × 512 | 4 × 2 | 256 | sim |
| `ui.png` | 1350 × 900 | 3 × 2 | 450 | sim |
| `gruta.png` | 1400 × 700 | 4 × 2 | 350 | não (N2/N3, a carga pula) |
| `bosque.png` | 1400 × 700 | 4 × 2 | 350 | não (N3, a carga pula) |

**Faltam:** `cover-camera-na-trilha.png` e o `public/og/camera-na-trilha.jpg`.

**N2/N3 (14/10/2026):**
- `gruta-bichos.png` (1400 × 700, 4 × 2, células 350) teve o alfa ≤ 24 zerado.
- Os dois peixes vieram espelhados (um para cada lado), então o jogo usa só o da célula 0 e espelha no código.
- Na `gruta.png`, o halo do cogumelo aceso tinha duas faixas cortadas acima dele (linhas 352–414 da folha), que foram apagadas.
- A formiga da `bosque.png` olha para a esquerda, e o código espelha.
- Os originais estão em `outputs/camera-na-trilha/originais/`.

## Medidas que o código usa

| Peça | Medida na arte (px da folha) | No código |
|---|---|---|
| Téo | altura de referência 417 (células 0 e 1) | `HERO.height` = 142 |
| cartão do pedido (`ui` 0) | caixa 427 × 172, com prendedor | **não é usado** desde o cabeçalho em faixas (14/10/2026): o pedido mora direto na faixa |
| polaroide (`ui` 1) | caixa 297 × 283; foto em (20, 24), 260 × 197 | `POLAROID` |
| filme (`ui` 2) | caixa 384 × 269; abertura em (32, 50), **320 × 170 (16 : 9)** | `FILM`; o vídeo 4 : 3 é cortado em cima e embaixo |
| base do joystick (`ui` 3) | caixa 372 × 242, disco inclinado; furo com centro 45 px acima do centro da caixa, achatado (56 / 122) | `JOY.base` 180, `baseDY` 22, `tilt` 0,55 (a bolinha anda numa elipse) |
| botão em branco (`ui` 5) | 235 × 218 | `APP.modeH` 122; ícone em −26, texto em +20 |
| píer (`cenario` 6) | 247 × 320, diagonal: o meio do deque anda 45 px para a direita de baixo para cima e fica 10 px à direita do centro da caixa | `pier.skew` 32 e `pier.w` 104 no mapa, `PIER_DX` −7 |
| cachoeira | 454 × 458; queda da água em (295, 215) e poço em (285, 380) da célula, com um anel de pedras em volta | `FALL_AT` (dx −28, dy 198); poço em código r 70, colisão `cliff` r 166 |

**Mapa ajustado à arte:** a cachoeira foi para (2760, 300). No canto do mapa a câmera não centralizava, e o visor caía embaixo do minimapa e do botão de modo. O rio passou a sair de baixo do anel de pedras. O chão, a trilha e a água em código passaram para a paleta da referência.

**Cabeçalho em faixas (14/10/2026):** o usuário achou o alto da tela "jogado e bagunçado" (chip do nível, cartão com prendedor, minimapa e `?` soltos). Agora é uma faixa de ponta a ponta, com as cores tiradas da arte da UI: face `#ebf8e9`, borda `#a9dccc` e linha `#115c55`. Nela ficam o nível e as bolinhas à esquerda, o pedido centrado pela largura real do texto, e o minimapa e o `?` à direita, tudo no mesmo meio vertical (y 56) e separado por divisórias.

**`teo-andar.png` (14/10/2026):** veio com ruído vermelho e com **fantasmas**: cópias do Téo deslocadas e semitransparentes, com alfa entre 128 e 159, nas linhas de frente e de costas. Os fantasmas mostravam as poses da `teo.png` (tablet erguido, comemorando, "ops") e faziam a linha de costas parecer errada. Nessas duas linhas foi zerado tudo com alfa < 200, e na de lado o alfa ≤ 24; depois saíram as ilhas < 400 px. Sobraram três ciclos de andar limpos. Cada quadro é ancorado pelo centro da cabeça (`px`, medido na carga nos 28 % de cima, com alfa > 200) e pelos pés (o fundo da caixa). A escala usa a maior altura da linha (`h`), porque a linha de lado veio uns 6 % maior. O quadro troca a cada 26 px andados.

**`teo-andar.png`, 3ª geração (14/10/2026, refeita porque o Téo "mexia uma perna só"):**
- Veio sem fantasmas, mas com ruído vermelho de alfa ≤ 40 em volta (zerado).
- Na linha de frente, os pés passavam até 8 px da borda da célula, e a figura subiu 4–8 px.
- Os quadros 1 e 3 (passadas) trocam as pernas certo. Já os quadros 2 e 4 (passagem) vieram **iguais**: na de lado, é sempre a perna de trás que levanta; na de frente e na de costas, a mesma perna fica na frente em 3 dos 4 quadros, o que dá passo manco.
- Por isso, `WALK_CYCLE` em `data/files.ts`:
  - **frente e costas** usam só os quadros 1 e 3, um por passo de 52 px, com um sobe-e-desce de 4 px no meio do passo;
  - **de lado** usa os 4 quadros, 26 px cada, porque ali as duas passadas têm o mesmo contorno (pernas abertas), e sem a passagem (pernas juntas) ele pareceria deslizar.
- O original está em `outputs/camera-na-trilha/originais/teo-andar.png`, e o da 2ª geração em `teo-andar-anterior.png`.
