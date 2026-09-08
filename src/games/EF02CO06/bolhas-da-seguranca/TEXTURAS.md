# Bolhas da Segurança - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

## 0. Estado dos arquivos

| Arquivo | Estado | Conteúdo |
|---|---|---|
| `situacoes.png` | **a gerar** | as 12 situações, 4 x 3 |
| `bg-quarto.png` | **opcional** | o quarto atrás do tablet gigante |

**Uma folha, e só.** Tudo o mais deste jogo é `Graphics`: a moldura do tablet, a
bolha, o estouro, o cadeado, o selinho, o selo SEGURO!, a fila de bolhas, o
balão, o confete. São coisas que mudam de cor e tamanho a cada estado, e PNG não
muda — e sem textura nenhuma o jogo continua jogável com os cartões de reserva.

---

## 1. A regra que decide se este jogo ensina

Esta é a exigência mais importante do documento, e ela não é de estilo: é de
mecânica.

> **Risco e seguro têm que ser desenhados exatamente do mesmo jeito.**

Mesma paleta, mesma luz, mesmo traço, mesmo enquadramento, mesmo humor. Nenhum
vermelho a mais no risco, nenhuma sombra pesada, nenhum brilho de alerta, nenhuma
cara assustada, nenhum raio, nenhuma exclamação. Nada de moldura colorida por
categoria.

O motivo: se o desenho denuncia o perigo pelo clima, a criança para de ler a
situação e passa a tocar no que parece feio. O jogo continua funcionando e para
de ensinar — vira "toque no escuro" com tema de segurança. **Quem tem que
denunciar o risco é o que está acontecendo na cena, não a arte.**

O teste, antes de aceitar a folha: cubra a cena com a mão, olhe só as cores e o
traço, e tente adivinhar quais são os quatro seguros. Se der para adivinhar,
refaça.

---

## 2. Estilo comum

```
flat 2D cartoon asset for a children's educational game, chunky rounded shapes, bold
readable silhouette, thick dark navy outline #1F2A37, flat colors with one soft inner
shading and a small white gloss highlight, cheerful daylight palette, minimal detail,
no text, transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, tiny details, scary, dark mood,
red alert glow, warning symbol, exclamation mark, lightning bolt, sad face, angry face,
skull, brand logo, text, letters, numbers, words, watermark, signature, outer frame,
border, visible grid lines, cropped, cut off, white background
```

O negativo carrega o peso da regra do §1: **é ele que impede o gerador de
"ajudar"** carimbando um alerta vermelho no risco.

---

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| aparelho | `#7DA9CE` / escuro `#3E6E97` |
| pele / mão | `#F7C99A` |
| madeira da mesa | `#C89A5B` |
| bolha | `#9BD8FF` (código) |
| selinho | `#FACC15` (código) |
| seguro | `#35D07F` (código) |

As três últimas são do código, não da folha: nenhum item pode chegar já pintado
de verde ou de amarelo.

---

## 5. `situacoes.png` — 1024 x 768, grade 4 x 3

Doze quadros de 256. **A ordem é o índice do frame, e é contrato com o código.**

```
Sprite sheet with 12 frames in a strict 4-column by 3-row grid, every frame exactly
256 by 256 pixels, transparent background.

Twelve small cartoon scenes about using a tablet, all drawn in the SAME friendly
daylight style, the SAME palette and the SAME cheerful mood. Every frame is a calm,
neutral little vignette, centered, filling about 80% of the frame with empty margin
around it. None of the frames may look dangerous, dark or alarming, and none may look
especially happy or rewarded: an adult must NOT be able to tell which scenes are the
risky ones just by the colors or the mood.

Frames, left to right then top to bottom:
1. a glass of water standing right next to a charging cable plugged into a tablet.
2. a tablet lying on a sunny windowsill under strong sunbeams.
3. a child's hand with sticky food on the fingers touching a tablet screen.
4. a tablet balanced half off the edge of a table, one corner hanging in the air.
5. a tablet screen showing a big blank pop-up card with a gift box on it, no words.
6. a child holding a tablet pressed very close to their face, almost touching the nose.
7. a pair of headphones with a volume slider pushed all the way to the far end.
8. a child using a tablet in a dark room, the only light coming from the screen.
9. a child sitting upright on a chair using a tablet, a lit lamp beside them.
10. a tablet inside a thick protective rubber case, seen from the front.
11. a child standing up and stretching their arms, a tablet resting on the table.
12. an adult and a child side by side looking at a tablet showing a blank progress bar.

[estilo comum] [negativo comum]
```

| Frame | Situação | Tipo |
|---|---|---|
| 0 | copo d'água perto do carregador | risco |
| 1 | aparelho no sol forte | risco |
| 2 | dedos melados na tela | risco |
| 3 | tablet na beirada da mesa | risco |
| 4 | aviso desconhecido com presente | risco |
| 5 | tela colada no rosto | risco |
| 6 | volume no máximo | risco |
| 7 | jogar no escuro | risco |
| 8 | sentada com luz acesa | seguro |
| 9 | capa protetora | seguro |
| 10 | pausa para alongar | seguro |
| 11 | adulto na atualização | seguro |

### Os dois pares que precisam se parecer

São o miolo do nível 3, e vale conferir um contra o outro antes de aceitar:

| Risco | Seguro | O que separa |
|---|---|---|
| 4 — aviso com presente, criança sozinha | 11 — aviso de atualização, adulto ao lado | **quem está junto** |
| 7 — escuro, só a luz da tela | 8 — sentada, com a luz acesa | **a luz do quarto** |

Os dois de cada linha têm que sair com o mesmo enquadramento e o mesmo tamanho
de tela. Se o aviso do 4 vier vermelho e o do 11 vier azul, a pegadinha morreu.

**Nenhum texto dentro das telinhas.** O quadro 4 e o quadro 11 mostram um cartão
e uma barra em branco; a palavra, quando existir, é o jogo que escreve por cima,
com a fonte dele.

---

## 6. `bg-quarto.png` — 1280 x 720, opcional

O quarto atrás do tablet gigante. Só entra se a moldura em `Graphics` ficar
solta demais no fundo liso.

```
A soft cartoon child's bedroom seen straight from the front, wide flat composition,
warm daylight from a window on the left, a wooden desk, a shelf with a few toys, a
plant, all drawn in gentle pastel colors with low contrast and no strong detail in the
middle of the image, because a large object will cover the center. Nothing alarming,
nothing on the desk that looks like a screen.

[estilo comum, mas sem contorno grosso] [negativo comum]
```

O miolo tem que ser calmo: é onde o tablet gigante fica, e detalhe ali só
disputa com as situações em voo.

---

## 7. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real na folha das situações |
| Recorte | grade exata, sem sangria entre quadros |
| Margem | cerca de 10% de área vazia por quadro |
| Peso alvo | `situacoes.png` até 500 KB |
| Sem | texto, número, marca, moldura externa, linha de grade |

Se a geração vier com fundo branco, refazer sobre magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso.

---

## 8. Depois que a folha chegar

Medir a caixa alfa de cada quadro e ancorar o voo por ela, não pelo centro do
quadro. Uma cena com margem maior de um lado voa torta se ninguém medir — e o
alvo de toque tem que cobrir o desenho, não a célula vazia.
