# Passe da Mensagem — prompts das texturas

**3 arquivos, 12 desenhos.** Destino:
`src/assets/games/EF01CO04/passe-da-mensagem/`

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) ·
[PLANEJAMENTO MODAL.md](../../PLANEJAMENTO%20MODAL.md)

---

## 1. Por que folha em grade

Seis crianças do mesmo time aparecem na mesma tela. Pedir uma de cada vez —
"faça a próxima usando a anterior como referência" — é onde a consistência
morre: cada geração sorteia rosto, proporção e tom de uniforme de novo, e na
quinta a turma já é de outro colégio.

A folha em grade resolve de graça: o gerador desenha os seis quadros na mesma
passada, então o time sai uniforme porque saiu junto. É também o formato que o
Phaser carrega (`load.spritesheet`).

**A ordem dos quadros é o índice do frame.** O Phaser lê da esquerda para a
direita e de cima para baixo: o primeiro quadro é o frame 0. A ordem abaixo é
contrato com o código, não sugestão.

## 2. Tamanho — pequeno de propósito

**256 × 256 por quadro.** O jogador aparece a 150 px na grade de 1280 × 720, o
que num celular dá cerca de **45 px reais**; o desenho dentro da bola-mensagem fica
menor ainda. Pedir 1024 seria carregar megabytes para jogar fora no `setScale`.

A regra que vale mais que a resolução: **se a criança não reconhece o desenho
em meio segundo a 45 px de altura, tem detalhe demais.** Silhueta forte,
contorno grosso, três ou quatro cores por objeto.

| Arquivo | Grade | Tamanho final | Quadros |
|---|---|---|---|
| `time.png` | 3 × 2 | 768 × 512 | 6 |
| `assuntos.png` | 2 × 2 | 512 × 512 | 4 |
| `robo.png` | 2 × 1 | 512 × 256 | 2 |

## 3. Estilo comum — cole no começo de todo prompt

```
flat 2D cartoon illustration, chibi style, big head small body, very simple shapes,
minimal detail, bold clean silhouette, thick soft rounded outline, flat colors with a
single soft shadow, even lighting, no gradients, kids educational game asset,
friendly and clear, transparent background
```

## 4. Negativo comum — cole em todo prompt

```
3D render, 3d, octane, blender, glossy plastic, shiny, specular highlight, realistic
lighting, photorealistic, hyperdetailed, intricate, ornate, busy, cluttered, noise,
texture grain, sparkles, glow, lens flare, gradient mesh, text, letters, numbers,
words, watermark, signature, frame, border, grid lines, panel, sign, card, speech
bubble, ground, floor line, court lines, background scenery, cropped, cut off
```

**`text, letters, numbers` é obrigatório.** As frases do jogo são escritas pelo
Phaser no painel do topo, em português e no tamanho certo. Letra dentro do PNG
vira lixo por baixo do texto de verdade.

**`sign, card, speech bubble, envelope, phone` também é obrigatório aqui.** As
três cascas do recado são desenhadas pelo código em volta do mesmo quadro; se
vierem dentro do PNG, ficam duas molduras encaixadas e o desenho de dentro
deixa de ser idêntico nos três meios.

**`court lines, ground` importa:** a quadra é Graphics, e uma linha de quadra
dentro do sprite cria duas marcações que não se encaixam.

## 5. Paleta — cite os hex no prompt

| Uso | Hex |
|---|---|
| Contorno / tinta escura | `#1B2333` |
| Camisa do time | `#3FA9F5` |
| Detalhe da camisa | `#FFC42E` |
| Shorts | `#2B4C7E` |
| Corpo do robô | `#B9C4CE` |
| Detalhe do robô | `#FF8A7A` |
| Luz do robô | `#5ED2E8` |
| Bolo / festa | `#FFB4C0` |
| Lápis | `#FFC42E` |
| Relógio | `#5FD6C9` |
| Presente | `#B79BF0` |

---

## 6. Os três pedidos

### 6.1 `time.png` — 768 × 512, grade 3 × 2

Seis crianças do mesmo time, **vistas de cima e um pouco de frente** — é a
câmera da quadra: dá para ver o rosto e a camisa ao mesmo tempo. Elas ficam
paradas em quadra o jogo inteiro; a variação entre elas é de cabelo e tom de
pele, nunca de uniforme.

```
Sprite sheet with 6 frames in a strict 3-column by 2-row grid, every frame the same
size and perfectly aligned, transparent background.

Six different children of the same sports team, seen from a high three-quarter angle
(from above and slightly in front) so both the face and the shirt are visible. All
wear the SAME uniform: sky blue shirt #3FA9F5 with a yellow stripe #FFC42E and dark
blue shorts #2B4C7E, plus white sneakers. Chibi proportions with a big head, thick
dark outline #1B2333, flat colors, few details. Every child stands still with both
arms slightly open, ready to receive a ball, looking forward with a friendly smile.
Same size and same pose in every frame, centered, with empty margin around.

Frames, left to right then top to bottom, varying only hair and skin:
1. short curly black hair, dark brown skin.
2. straight brown hair in a ponytail, light brown skin.
3. short blond hair, fair skin.
4. two braids with dark hair, dark brown skin.
5. short red hair, freckles, fair skin.
6. black hair in a bun, light brown skin.

[estilo comum] [negativo comum]
```

### 6.2 `assuntos.png` — 512 × 512, grade 2 × 2

Os quatro recados. Cada um aparece **quatro vezes no jogo**: grande no painel do
topo, dentro da bola-mensagem nos três meios (balão de voz, envelope, celular),
no balão de comparação e no mural. Por isso são objetos isolados, sem cenário e
sem mão segurando.

```
Sprite sheet with 4 frames in a strict 2-column by 2-row grid, every frame the same
size and perfectly aligned, transparent background.

Four simple objects for a kids message game, each centered and alone in its frame, all
drawn at the same visual weight, thick dark outline #1B2333, flat colors, three or
four colors each, no hands and no scenery.

Frames, left to right then top to bottom:
1. a birthday cake with one lit candle, pink frosting #FFB4C0, seen from the side.
2. a yellow pencil #FFC42E with a sharpened tip, lying at a slight diagonal.
3. a round wall clock with a teal rim #5FD6C9 and two simple hands.
4. a wrapped gift box with a purple ribbon #B79BF0 and a bow on top.

[estilo comum] [negativo comum]
```

### 6.3 `robo.png` — 512 × 256, grade 2 × 1

O robô interceptador. Ele não anda e não persegue ninguém: aparece só quando o
passe erra, pega a bola e devolve. Por isso são duas poses e nada mais — e a
cara dele é boba, nunca ameaçadora. Errar aqui é uma piada, não um castigo.

```
Sprite sheet with 2 frames side by side in a strict 2-column by 1-row grid, both
frames the same size and perfectly aligned, transparent background.

The same small friendly robot in both frames: rounded light grey body #B9C4CE with
coral details #FF8A7A, one big round cyan visor #5ED2E8 as a face, short arms, and a
single wheel instead of legs. Chibi proportions, thick dark outline #1B2333, flat
colors, few details. Same size and same eye level in both frames, centered, empty
margin around. Silly and harmless, never scary or angry.

Frames, left to right:
1. standing still, arms down, calm neutral visor with two simple dots as eyes.
2. holding a ball up with both arms above the head, visor showing a goofy pleased
   expression, body tilted slightly back.

[estilo comum] [negativo comum]

Additional negative: angry, menacing, weapon, red eyes, sharp edges, sparks
```

---

## 7. O que NÃO é textura

Não peça e não aceite: **quadra, linhas da quadra, caminho, seta, ✕, balão de
voz, envelope, telefone, caixa de correio, mural, moldura, retrato,
interrogação, estrela, brilho, confete, bola.**

Tudo isso é Graphics do Phaser. Vale a mesma separação de Corrida dos
Parecidos, Ritmo da Rotina e Pulo Programado, e por dois motivos concretos:
esses elementos mudam de cor e de tamanho a cada estado — e um PNG não muda —,
e manter a interface em Graphics deixa o jogo jogável com nenhuma textura
carregada.

**Três merecem nota, porque é onde o pedido de textura costuma escapar:**

- **os três meios** (balão de voz, envelope, celular) são cascas desenhadas em
  volta do MESMO quadro de `assuntos.png`. Em PNG, cada meio precisaria de uma
  arte por recado — doze arquivos para dizer o que o código diz com três
  funções, e sem a garantia de que o desenho de dentro é idêntico, que é a
  lição inteira;
- **os caminhos** mudam de verde para vermelho a cada frame, conforme o robô
  anda. PNG não muda de cor;
- **os retratos** dos destinatários são recortes da própria folha de
  personagens, feitos com `setCrop`. Nada de arte extra.

## 8. Entrega

| | |
|---|---|
| Formato | PNG com transparência real (canal alfa, não fundo branco) |
| Recorte | os quadros precisam bater com a grade exata; sem sangria entre eles |
| Margem | ~8 % de área vazia dentro de cada quadro |
| Sem | texto, número, moldura, linha de grade, chão, quadra, sombra caída no fundo |

**O recorte é a parte que costuma dar errado.** Gerador de imagem raramente
entrega grade perfeita e alfa limpo de primeira. O caminho prático: gere a
folha sobre um fundo chapado de magenta `#FF00FF` (que não existe na paleta),
remova a cor num editor e recorte para o tamanho exato da tabela da §2. Meio
pixel de deslocamento faz todo frame do Phaser aparecer com uma fatia do
vizinho.

Depois de entregar, **meça a caixa alfa de cada quadro no navegador** e ancore
o layout nela em vez de estimar — é o que evitou o "personagem flutuando" em
Pulo Programado. O procedimento está na §7 do
[PLANEJAMENTO MODAL.md](../../PLANEJAMENTO%20MODAL.md).

## 9. Ordem

**Mande `assuntos.png` primeiro.** Ele sozinho responde a pergunta que decide o
jogo: o bolo continua reconhecível a 44 px, dentro de um envelope e dentro de
um celular? Se a resposta for não, o ajuste de traço acontece num arquivo, não
em três — e é a igualdade desse desenho nos três meios que o jogo ensina.

`time.png` vem em seguida, que é o que fecha a primeira fase jogável com arte
real. O robô pode vir por último: ele só aparece no erro, e um retângulo cinza
segura o lugar até lá.
