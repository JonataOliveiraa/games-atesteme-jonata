# Portas do Computador — assets (06/10/2026)

| Arquivo | Situação |
|---|---|
| `aparelhos.png` | copiado do Pinball (768 × 512, 3 × 2): teclado, microfone, câmera / alto-falante, tela, impressora |
| `pecas.png` | copiado do Pinball (1024 × 1024, 4 × 4); o jogo usa o chip apagado (0) e aceso (1) |
| `lily.png` | copiado do Pinball (1200 × 960, 4 × 3); começo e fim do nível |
| `bg-mundo.png` | **falta**: por enquanto é a arte de reserva em `Graphics` (`scenes/fallback.ts`) |
| `computador.png` | **falta**: arte de reserva (o gabinete) |
| `informacoes.png` | **falta**: arte de reserva (Notinha, Fotinho, Letrinha × 4 poses, na grade 4 × 3 de 320) |
| `pessoas.png`, `pedidos.png` | só para o N2/N3 |
| `cover-portas-do-computador.png` | **falta** |

Os PNGs que faltam entram sem mexer no código: mesma chave, mesma grade. O `addFrames` mede cada célula na carga. Quando o computador chegar, medir a janela, o encaixe e a faixa de luzes e ajustar `COMPUTER`, `WINDOW`, `CHIP`, `GOAL` e `DOOR_AT` em `data/layout.ts`.
