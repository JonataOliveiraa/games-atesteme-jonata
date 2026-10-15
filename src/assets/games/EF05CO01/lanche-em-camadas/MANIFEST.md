# Lanche em Camadas — arte entregue

Referência de estilo: `references/35-chibi-voador.webp`. Prompts: `src/games/EF05CO01/lanche-em-camadas/TEXTURAS.md`.
Aquarela gerou cozinha, ajudante, ingredientes, ui e capa; Guache gerou clientes e chef (15/10/2026). Brutos em `raw/`.

| Arquivo | Dimensões | Grade | Alfa | Tratamento |
|---|---:|---|---|---|
| `cozinha.png` | 1280 × 720 | — | não | — |
| `ajudante.png` | 1280 × 800 | 4 × 2, 320 × 400 | sim | a mão do quadro 4 (comemorando) vazava para o 5: o quadro 4 foi deslocado 20 px para a esquerda (`raw/ajudante-antes-do-ajuste.png`) |
| `ingredientes.png` | 1024 × 512 | 4 × 2, 256 | sim | franja de alfa baixo zerada |
| `clientes.png` | 960 × 1200 | 3 × 3, 320 × 400 | sim | escala única para os 9 quadros; pés no fundo da célula |
| `chef.png` | 1280 × 320 | 4 × 1, 320 | sim | escala única; bustos cortados retos no fundo |
| `ui.png` | 768 × 512 | 3 × 2, 256 | sim | cada peça reduzida a ~215 px de largura; no cartão (célula 1) o chapeuzinho da faixa foi apagado (ficava atrás do "1º") e um ponto solto em x ≥ 478 foi removido (`raw/ui-antes-do-ajuste.png`) |
| `cover-lanche-em-camadas.png` | 1672 × 941 | — | não | título "Lanche em Camadas"; og em `public/og/lanche-em-camadas.jpg` |

## Medidas usadas no código (`data/layout.ts`)

- **Cozinha:** a abertura da janela vai de x 405 a 900 e termina no peitoril em y 207; o peitoril ocupa x 356–950, y 206–236. O balcão começa em x ≈ 965 e tem o tampo em y 408–444.
  - O cabeçalho (0–96) tapa o alto da janela. Por isso o chef fica sentado no peitoril (`CHEF.y` 236, altura 150), e um recorte do próprio peitoril (`CHEF.sill`) é desenhado na frente dele.
  - O cliente fica atrás do balcão (`COUNTER.top` 410, x 1120).
  - O ajudante para antes do balcão (`HELPER.maxX` 900, `COUNTER.serveX` 880), e as colunas de queda foram para 200–900.
- **Ajudante:** quadro 0 com 384 px; as palmas ficam a 290 px do pé (0,755), na altura da testa. Com `HELPER.height` 240 as palmas ficam em 181, e `HELPER.hands` 222 apoia o fundo da bandeja nas palmas (a bandeja tapa só o topo do cabelo). Nos quadros sem braço levantado a bandeja vazia some; no erro o ajudante fica com os braços para cima segurando o lanche errado.
- **Faixa do erro:** embaixo (`BANNER.y` 650), para não tapar o balão do cliente e o chef.
- **Ingredientes:** encaixados pela largura (`LAYER.w` 176). As espessuras saem da arte: pão de baixo 76, pão de cima 137, carne 88, queijo 56, alface 82, tomate 54, ovo 79, picles 51 px na célula.
- **ui:** o cartão é mais largo que o de reserva, então `RECIPE.cardW` 84 e `gap` 12.
