# Um Dia no Celular — manifesto das texturas

Recebidas em 14/10/2026. Os prompts estão em `src/games/EF04CO07/um-dia-no-celular/TEXTURAS.md`.

**Limpeza:** as folhas com alfa vieram com manchas coloridas quase transparentes em volta das figuras (sobra do
recorte).
- Em todas as folhas, o alfa ≤ 24 foi zerado.
- Em `nina` e `amigos` também saíram os grupinhos soltos com menos de 2000 px (27 e 3234 px). Nenhuma figura perdeu
  parte.
- Na `hand-layer3` os três dedinhos são grupos pequenos de verdade, então ali só o alfa baixo foi zerado.
- Os originais estão em `outputs/um-dia-no-celular/originais/`.

| Arquivo | Tamanho | Grade | Célula | Observação |
|---|---|---|---|---|
| `nina.png` | 1341 × 1100 | 3 × 2 | 447 × 550 | figuras de 525–541 px de altura, todas dentro da célula |
| `amigos.png` | 1280 × 1350 | 4 × 3 | 320 × 450 | Duda (0–1), Bia (2–4), Caio (5–7), Rafa (8–11), na ordem do contrato |
| `objetos.png` | 1200 × 800 | 3 × 2 | 400 × 400 | diário aberto, diário fechado, bolo, desenho, chave, lixeira |
| `apps.png` | 1024 × 512 | 4 × 2 | 256 × 256 | só 4 entram no N1: câmera, conversas, galeria, bichinho |
| `adultos.png` | 1536 × 512 | 3 × 1 | 512 × 512 | Profª Ana, Mãe, Vovó (avatares redondos) |
| `bg-sala/patio/quarto/festa.png` | 1672 × 941 | — | — | 16:9, exibidos em 1280 × 720 |
| `hand-layer1.png` | 330 × 537 | — | — | a palma, **atrás** do celular |
| `hand-layer2.png` | 330 × 537 | — | — | o corpo do celular, com a tela preta |
| `hand-layer3.png` | 330 × 537 | — | — | os três dedinhos e o polegar, **na frente** de tudo |

## O celular (no lugar do `celular.png` do TEXTURAS)

As três camadas chegaram alinhadas no mesmo quadro, e o jogo as empilha: palma → corpo → tela do jogo → dedos.

- **Corpo:** x 55, y 34, 223 × 428.
- **Tela preta:** x 80, y 65, 173 × 367, cantos de 17.
- O polegar invade 5 px da borda direita da tela (y 186–350). Os dedinhos encostam na borda esquerda sem invadir.
- **No jogo** (`data/layout.ts`, `PHONE_ART`): escala 1,59, corpo a partir de (833, 76). A tela fica em
  (872, 125), com 275 × 584 e cantos de 27, e todas as telas do celular foram refeitas nessa largura. A borda de
  baixo do corpo e a palma ficam fora da tela.
- O celular foi para a direita (centro x 1010) para os dedinhos (x ≥ 781) não baterem nas falas, que agora vão até
  x 764.

## Onde cada peça encaixa no cenário

- **Bolo** (`objetos` 2): na toalhinha do meio da mesa da festa, em (688, 420), com 168 px.
- **Desenho** (`objetos` 3): na escrivaninha do quarto, em (708, 342), com 112 px.
- **Visor:** o fundo do visor e das fotos é um recorte desfocado do mesmo fundo, centrado em quem está sendo
  fotografado (`FOCUS` em `scenes/art.ts`).
- **Pessoas:** os pés ficam em y 712, e a pose mais alta de cada folha mede 486 px. A âncora de cada quadro é o meio
  das pernas (os 20 % de baixo da figura), para a pessoa não pular de lado quando troca de expressão.

**Faltam:** `cover-um-dia-no-celular.png` e o `public/og/um-dia-no-celular.jpg`.
