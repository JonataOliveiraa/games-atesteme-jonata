# Dança Aninhada — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)  
Briefing recebido: [1.md](../../../assets/games/EF04CO03/danca-aninhada/1.md)  
Destino dos PNGs futuros: `src/assets/games/EF04CO03/danca-aninhada/`

**Esta etapa é planejamento, não geração de imagens.** O primeiro nível precisa funcionar com placeholders desenhados pelo Phaser. A arte final entra após o teste do usuário; a capa é o último item.

---

## 0. Lista fechada de entregáveis

| # | Arquivo | Dimensão exata | Grade | Fundo | Função | Ordem |
|---:|---|---:|---|---|---|---|
| 1 | `bg-palco-escolar.png` | 1672 × 941 | imagem única | opaco | palco acolhedor e áreas calmas para a interface | após validar N1 |
| 2 | `dancarino.png` | 1024 × 256 | 4 × 1 de 256 × 256 | alfa real | o **mesmo** dançarino em repouso, passo, palma e giro | após validar N1 |
| 3 | `icones-dos-movimentos.png` | 900 × 300 ✅ | 3 × 1 de 300 × 300 | alfa real | silhueta chapada de PASSO, PALMA e GIRO, tingida pelo código | **entregue** |
| 4 | `cover-danca-aninhada.png` | 1672 × 941 | imagem única | opaco | capa do catálogo | por último |

**Total: quatro PNGs.** Música e efeitos são gerados por WebAudio; não pedir MP3 ou WAV. A folha usa quatro quadros, não quatro personagens separados. Não criar arquivo de textura para cada movimento.

### Elementos que **não** são PNG

- molduras externa/interna de `REPITA`, título delas e contadores;
- comandos, rótulos, números, cartões de opções e espaços editáveis;
- tiras do pedido, molduras dos cartões e barras de refrão;
- lâmpada ACESA/APAGADA e feixe de luz interativo;
- botão DANÇAR, `?`, mudo, vidas, estrelas, progresso e tutorial;
- cadeado, dica, setas, brilho, partículas, sombra de seleção, replay;
- pisada no chão, nota musical e marca de palco que respondam ao algoritmo.

Os **pictogramas** saíram desta lista: são a mesma figura em quatro tamanhos e duas cores, e uma silhueta desenhada lê melhor que uma vetorial montada em código. Continuam sendo UM arquivo, em preto, tingido pelo jogo — ver §5.

As demais peças mudam conforme o programa e ficam em `Graphics`/`Phaser.Text`. **Nenhum texto deve estar embutido na imagem.** O pedido e a ficha são a parte pedagógica; precisam permanecer nítidos e editáveis.

---

## 1. Regra visual pedagógica

> **A imagem não deve tocar a dança nem mostrar o programa pronto pela criança.**

O fundo pode sugerir auditório escolar, mas não pode trazer sequência de passos no piso, marcas em grade, molduras aninhadas, setas, rótulos ou holofote apontando para uma opção. A ordem dos movimentos aparece só nos pictogramas desenhados pelo código; os limites dos laços aparecem só nas molduras do editor.

O dançarino não carrega placas com `PASSO`/`PALMA` nem roupa com cores que codifiquem as respostas. Seus quadros são **poses motoras**: a criança lê o movimento porque o corpo se move e porque o pictograma/rótulo do código acende, nunca por um PNG com palavra.

O cenário deve ser alegre sem competir com a ficha. A área do editor ocupa a maior parte da metade direita; nessa região, baixo detalhe e baixo contraste. Luzes de espetáculo muito fortes atrás de números pequenos fazem o jogo parecer bonito em tela cheia e ilegível no celular — reprovar esse fundo.

---

## 2. Estilo e paleta comum

Direção: **ilustração 2D limpa de jogo infantil**, formas arredondadas, silhuetas reconhecíveis a ~30% do tamanho lógico, contorno azul-marinho, grandes áreas de cor fosca, uma sombra suave e um brilho discreto vindo do alto à esquerda. Escola brasileira acolhedora; apresentação de turma, não boate, concurso competitivo ou show profissional.

| Uso | Cor |
|---|---|
| contorno | `#24334B` |
| cortina índigo escura | `#334365` |
| parede/painel neutro | `#53647A` |
| piso de madeira | `#B9865D` |
| luz quente ambiente | `#F4D8A0` |
| pele do dançarino | `#9B6347` |
| camiseta laranja | `#E6784C` |
| calça azul | `#3B5876` |
| ficha clara (código) | `#FFF8E8` |
| laço externo (código) | `#54B4D7` |
| laço interno (código) | `#F2BD58` |
| seleção (código) | `#43B8D8` |
| acerto (código) | `#4EAA78` |
| TRAVA (código) | `#E59A52` |

As cores de laço são reservadas ao código. O fundo não deve ter painéis ciano e âmbar nas mesmas posições da ficha, porque isso faria as molduras perderem a hierarquia. A distinção dos laços também é escrita como **FORA** e **DENTRO**; cor sozinha não é suficiente.

### Negativo comum para os três arquivos

~~~text
text, letters, words, digits, numbers, title, school name, labels,
watermark, signature, logo, command card, code block, loop bracket,
flowchart, arrows, playable beat markers, pre-drawn target sequence,
answer highlighted, green check, red X, HUD, button, tutorial panel,
life hearts, stars, grid lines, fixed spotlight target, disco nightclub,
concert crowd, laser beams, strobe lights, dark scary stage, violence,
weapons, microphone in hands, musical instrument blocking the body,
photorealism, 3D render, hyperdetail, glossy plastic, blur,
cropped limbs, cut off feet, cell borders, visible sprite-sheet grid,
white backing behind transparent sprite, painted checkerboard,
fake transparency.
~~~

---

## 3. `bg-palco-escolar.png`

### Contrato

| Campo | Exigência |
|---|---|
| dimensão | 1672 × 941, paisagem, preenchimento até as bordas |
| opacidade | totalmente opaco |
| câmera | frontal, um pouco acima do piso, sem perspectiva dramática |
| palco livre à esquerda | x 3%–40%, y 27%–75% |
| interface calma à direita | x 40%–98%, y 22%–100% |
| pedido no topo | x 3%–97%, y 13%–27%, sem detalhe de alto contraste |
| piso | faixa inferior contínua e simples, sem desenho de trilha |
| objetos interativos impressos | nenhum |

O dançarino separado é posicionado na área esquerda e apoia os pés no piso visual. A lâmpada de parada **não faz parte do fundo**: é desenhada pelo jogo para ligar e apagar. Isso é essencial no N3. A ficha e bandeja ficam à direita/embaixo; não preencher o espaço delas com instrumentos, cartazes, colegas ou portas brilhantes. O enquadramento 16:9 deve parecer uma sala de apresentações da escola mesmo sem texto.

### Prompt copiável

~~~text
A wide 2D background for a friendly Brazilian elementary-school dance
programming game, exactly 1672 by 941 pixels, landscape, opaque and filling
the canvas edge to edge. Front-facing view of a small SCHOOL AUDITORIUM
STAGE, not a nightclub and not a professional concert.

Left side: a simple warm wooden stage floor #B9865D and an EMPTY open area
from approximately x=3 to 40 percent, y=27 to 75 percent, where a separate
child dancer sprite will stand later. Do not paint any dancer into this
background. Behind the stage, soft indigo curtains #334365, understated warm
wall panels, one or two small decorative paper garlands very near the far
edges. Soft ambient school-day lighting #F4D8A0, no hard spotlight beam.

Right side from x=40 to 98 percent: visually calm, low-detail muted blue-gray
wall #53647A and a plain section of stage floor. This region must remain
quiet so a LARGE cream interactive program editor will be drawn over it.
Keep the whole upper band from y=13 to 27 percent calm for a wide target
pattern strip. Keep the bottom quarter low-detail for large option cards.
No object should look clickable or indicate a correct movement.

Polished flat 2D educational-game illustration, broad matte shapes,
rounded geometry, dark navy outline #24334B on major architecture,
one soft shadow, one subtle top-left highlight. Clear readable silhouette
when scaled to a 390-pixel mobile display. No text or interface in the art.

Negative: dancer, child, person, silhouette on stage, lamp, spotlight target,
step footprints, rhythm circles, dance floor squares, grid, arrows,
sequence of movements, nested rectangles, loop frame, count, word, sign,
poster, music notation, microphone, instrument, dense audience, bright
neon lights, disco ball, strobe, confetti over editor area, HUD, button,
border, white margins, logo, watermark, photorealism, 3D, blur.
~~~

### Verificação visual

- [ ] lê-se **palco escolar** de imediato, sem título;
- [ ] a esquerda aceita um personagem separado sem parecer vazia demais;
- [ ] a direita e o topo ficam calmos sob ficha e pedido;
- [ ] há piso contínuo para apoiar o pé do sprite;
- [ ] não há marcas que pareçam sequência, laço ou opção correta;
- [ ] não há lâmpada estática embutida;
- [ ] em 30% da escala, a ficha clara ainda será o foco.

---

## 4. `dancarino.png`

### Contrato de folha de sprites

| Campo | Exigência |
|---|---|
| canvas | 1024 × 256 |
| grade lógica | 4 colunas × 1 linha, 256 × 256 por célula |
| fundo | canal alfa verdadeiro, sem branco ou xadrez pintado |
| desenho | mesma criança em todas as células |
| câmera | corpo inteiro, frontal levemente em três quartos |
| escala na célula | corpo ~190–220 px de altura, 15–25 px de margem |
| linha dos pés | idêntica nos quatro quadros, exceto o pequeno deslocamento natural do passo |
| continuidade | mesmo cabelo, roupas, cores, proporções e luz |

Uma criança fictícia de cerca de 9–10 anos, pele castanha média, cabelo escuro curto e cacheado, camiseta laranja simples, calça azul-marinho e tênis claros. Aparência de aluno em apresentação escolar, não mascote exagerado ou adulto profissional. Rosto humano discreto e consistente; **não** criar uma expressão diferente para cada pose. Os braços e pés precisam ficar legíveis quando a figura for exibida a ~66 px físicos de altura.

| Frame (índice) | Pose | Uso no código |
|---:|---|---|
| 0 | repouso: braços soltos, pés apoiados | antes/depois da execução, pausa |
| 1 | passo lateral amplo: um pé ao lado, peso do corpo claro | `PASSO`; espelhar horizontalmente para alternar lado |
| 2 | palma: mãos juntas diante do peito, cotovelos visíveis | `PALMA`; um pulso de escala curta reforça o contato |
| 3 | giro: corpo em três quartos, um pé pivô, braços equilibrando | `GIRO`; o código faz rotação suave e volta ao repouso |

Sem notas musicais, rastro de movimento, brilho ou círculo em torno do corpo dentro do PNG. Esses efeitos dependem do tempo e são desenhados pelo jogo. A pose de giro não deve parecer queda; a de palma não pode esconder as mãos atrás do tronco.

### Prompt copiável

~~~text
    Create ONE horizontal 2D sprite sheet PNG with exactly FOUR equal square
    frames in a single row, total size 1024 by 256 pixels, each cell exactly
    256 by 256. REAL TRANSPARENT BACKGROUND. No visible cell grid, no borders,
    no labels. Draw THE SAME fictional Brazilian schoolchild dancer in every
    frame: about 9–10 years old, medium brown skin #9B6347, short dark curly
    hair, plain orange T-shirt #E6784C, navy trousers #3B5876 and light
    sneakers. Ordinary comfortable school clothes, friendly understated face.
    Full body, consistent proportions, same camera and top-left lighting.

    Left to right frames:
    0 idle, standing balanced with arms relaxed;
    1 clear sideways STEP with one foot extended and body weight shifted;
    2 CLAP with both hands touching visibly in front of chest;
    3 SPIN pose, torso turned about one quarter turn, one pivot foot and arms
    out for balance, not falling.

    Keep head size, outfit, hair, skin tone, sneaker shape and foot baseline
    consistent across all frames. Center the body in every square. Each entire
    figure must fit inside its cell with comfortable margins, with no limb
    crossing into another cell. Polished flat 2D cartoon game sprite, clear
    silhouette, rounded forms, broad matte colors, dark navy outline #24334B,
    one soft shadow, subtle upper-left highlight. Legible at small mobile size.

    Negative: different person in each frame, changed face, changed clothes,
    adult dancer, stage costume, mascot head, animal ears, microphone, props,
    text, labels, numerals, musical notes, motion trails, glow, shadow floor,
    background scene, white backdrop, fake checkerboard transparency, visible
    grid, cell border, cropped head, cropped shoes, extra fingers, duplicate
    arms, distorted limbs, 3D render, photorealism, blur, watermark.
~~~

### Verificação visual e técnica

- [ ] PNG realmente tem 1024 × 256, não uma folha de tamanho aproximado;
- [ ] são **quatro** células de 256, na ordem do contrato;
- [ ] cada quadro mostra a mesma criança, roupas e luz;
- [ ] pé e escala do corpo alinham entre quadros;
- [ ] passo, palma e giro distinguem-se sem legenda a ~66 px de altura;
- [ ] mãos não desaparecem na pose de palma;
- [ ] giro parece dança, não tropeço;
- [ ] nenhuma parte cruza os limites de outra célula;
- [ ] a transparência é alfa real, verificada sobre fundos claro **e** escuro;
- [ ] medir a caixa alfa por célula antes de fixar âncora e escala no Phaser.

Se o gerador produzir um quadro muito diferente, **reprovar a folha inteira** e refazer na mesma passada. Não pedir “o próximo frame” em geração isolada: a identidade costuma se perder. Se o PNG vier com fundo branco, pedir nova exportação sobre magenta `#FF00FF` para remoção cromática, e inspecionar bordas; não aceitar xadrez falso como alfa.

---

## 5. `icones-dos-movimentos.png`

### Contrato

| Campo | Exigência |
|---|---|
| canvas | 768 × 256 no pedido; **veio 900 × 300**, e serve |
| grade lógica | 3 colunas × 1 linha, quadradas |
| ordem | 0 PASSO, 1 PALMA, 2 GIRO |
| fundo | alfa verdadeiro, sem branco e sem xadrez pintado |
| cor | **uma só**: preto `#000000` chapado, sem contorno, sombra ou degradê |
| área segura | a figura cabe em 200 × 200 no centro da célula |
| espessura mínima | nada mais fino que 14 px na escala da célula |

### Por que preto, e por que uma folha só

Os três ícones aparecem em **quatro tamanhos** — 44 px no pedido, 66 px na
ficha, 84 px na bandeja e 96 px na legenda do ensaio — e em **duas cores**:
azul-marinho sobre papel claro e branco sobre o palco escurecido do ensaio.
Um PNG por cor seriam seis arquivos que precisariam concordar entre si.

Com a silhueta em preto, quem dá a cor é o `setTint` do Phaser: um arquivo e
uma linha de código. Por isso o pedido é de **silhueta chapada**, e não de
ilustração — qualquer sombra, brilho ou contorno de outra cor sobrevive ao
tint e reaparece como sujeira cinza sobre o papel claro.

Uma folha só, e não três arquivos, porque o que precisa concordar entre os
três é o **peso visual**: ícones gerados em passadas separadas voltam com
traços de espessuras diferentes, e na tira do pedido eles ficam lado a lado.

### O que cada quadro é

| Frame | Ícone | Leitura |
|---:|---|---|
| 0 | `PASSO` | uma pegada vista de cima, com os cinco dedos separados |
| 1 | `PALMA` | duas mãos de frente, palmas se encontrando, com três traços curtos de estalo saindo do encontro |
| 2 | `GIRO` | uma seta circular quase fechada, com a ponta bem marcada |

Símbolos, e não bonequinhos fazendo o movimento: a ~35 px físicos num celular
uma figura humana inteira vira borrão, enquanto pegada, mãos e seta
sobrevivem. O corpo que dança é o sprite do §4; estes aqui são o vocabulário
escrito da coreografia.

### Prompt copiável

~~~text
Create ONE horizontal sprite sheet PNG of exactly THREE equal square icon
cells in a single row, total size 768 by 256 pixels, each cell exactly 256 by
256. REAL TRANSPARENT BACKGROUND (true alpha channel).

Every icon is a SOLID FLAT SILHOUETTE filled with PURE BLACK #000000 and
nothing else: no outline, no second color, no gray, no gradient, no shading,
no highlight, no drop shadow, no texture. Flat vector pictogram style, like a
clean mobile app icon set. Bold chunky shapes; no shape or gap thinner than 14
pixels at this size, so the icons survive being scaled down to 35 pixels.

Left to right:
cell 0 - a FOOTPRINT seen from above: the sole of a bare foot with five
separate round toes above it, standing upright, tilted a few degrees;
cell 1 - TWO HANDS clapping, seen from the front, both palms flat and
touching each other in the middle, thumbs visible on the outer edges, plus
THREE short straight impact strokes radiating upward and outward from the
point where the hands meet;
cell 2 - a ROTATION ARROW: one thick circular arc going almost all the way
around, about 300 degrees, with a clear solid triangular arrowhead at one end.

Center each icon inside its own 256 by 256 cell and keep every figure inside a
200 by 200 safe area, with equal visual weight and equal apparent size across
all three. Do not let any shape cross into a neighboring cell. No visible cell
borders, no separators, no grid lines.

Negative: color, colored fill, gray, gradient, shading, highlight, outline,
stroke of another color, drop shadow, glow, 3D, bevel, photorealism, texture,
noise, text, letters, numbers, labels, caption, watermark, logo, frame,
border, cell divider, grid, background, white background, colored background,
fake checkerboard transparency, human figure, full body, face, dancer,
musical notes, extra objects, more than three icons, uneven line weights,
thin hairlines, tiny details.
~~~

### Verificação

- [ ] o PNG tem 768 × 256 e o alfa é real, conferido sobre fundo claro **e** escuro;
- [ ] há exatamente três figuras, uma por célula, sem nada cruzando a divisa;
- [ ] a cor é uma só — nenhum pixel cinza ou colorido fora do antialiasing;
- [ ] os três têm o mesmo peso: nenhum parece mais fino ou menor que os outros;
- [ ] a 35 px de altura, pegada, mãos e seta ainda se distinguem sem legenda;
- [ ] tingidos de branco sobre o palco escurecido, os três continuam legíveis;
- [ ] medir a caixa alfa de cada célula antes de fixar a escala no Phaser.

Se um dos três voltar com espessura diferente dos outros, **reprovar a folha
inteira** e refazer na mesma passada — pedir "só o ícone do giro de novo" é
como o conjunto perde a unidade.

---


### O que veio, medido

A folha entregue tem **900 × 300**, três células de 300. O pedido dizia 768 ×
256 e isso não importa: o quadro sai da divisão da largura entregue por três,
no `BootScene`. Os 66 537 pixels opacos são `#000000` — as seis outras cores
que aparecem são antialiasing de um bit.

| Frame | Caixa alfa na célula | Tamanho |
|---:|---|---|
| 0 `PASSO` | x 90, y 22 | 136 × 260 |
| 1 `PALMA` | x 51, y 15 | 204 × 267 |
| 2 `GIRO` | x 40, y 32 | 219 × 238 |

As três **alturas** batem — 260, 267 e 238 — e as larguras não, porque as
formas são diferentes. Por isso a escala do código vem da altura e a âncora,
do centro da caixa: esticar cada célula para um quadrado achataria a seta do
giro e espremeria a pegada. As medidas estão em `data/art.ts`; trocar a folha
é medir de novo e editar aquela tabela.

---
## 6. `cover-danca-aninhada.png`

### Contrato

| Campo | Exigência |
|---|---|
| dimensão | 1672 × 941, paisagem |
| fundo | opaco, tela inteira |
| assunto | o mesmo palco e a mesma criança, em momento de apresentação |
| título/descrição | nenhum texto; a plataforma sobrepõe o nome |
| composição | dançarino bem legível à esquerda, espaço calmo para título/interface à direita |

A capa não é screenshot do editor e não tenta explicar o algoritmo desenhando blocos de código falsos. Ela apresenta a fantasia de palco escolar; o próprio jogo ensinará as molduras. Produzir **apenas após** decidir se o fundo e o dançarino finais funcionam juntos na tela real. A identidade da criança deve ser a mesma do spritesheet aprovado.

### Prompt copiável

~~~text
Cover illustration for the SAME friendly Brazilian elementary-school dance
programming game as the approved stage background and approved dancer
sprite, exactly 1672 by 941 pixels, landscape, fully opaque. Show the SAME
fictional schoolchild dancer with medium brown skin, short dark curly hair,
plain orange shirt, navy trousers and light sneakers, performing a clear
joyful sideways step on a small warm wooden SCHOOL auditorium stage. Indigo
curtains, gentle warm light, a few simple paper garlands near the edges.
Polished flat 2D children's game art, clear silhouette, broad matte shapes,
dark navy outline, friendly and calm. Keep the RIGHT half quiet for title
overlay by the catalog. This is a single cover illustration, not a sprite
sheet and not a gameplay screenshot.

Negative: text, title, letters, numbers, school name, logo, watermark,
algorithm cards, code blocks, nested frames, fake game UI, rhythm markers,
extra dancer, audience covering the dancer, nightclub, concert lasers,
strobe, microphone, photorealism, 3D, blur, white margin.
~~~

### Verificação

- [ ] mesma criança e mesma direção de arte do jogo;
- [ ] corpo e gesto reconhecíveis em miniatura;
- [ ] a capa não promete jogo de tocar no ritmo;
- [ ] não há texto ou blocos de algoritmo pré-renderizados;
- [ ] sobra área tranquila para o nome do catálogo.

---

## 7. Integração e fallback

No primeiro corte, o `BootScene` procura PNGs por `import.meta.glob` e carrega só o que existe. A folha de ícones é fatiada em três colunas iguais a partir da **largura entregue**, e não de um 256 escrito no código — a folha do dançarino já veio com outra medida, e largura fixa quebraria a próxima do mesmo jeito. Sem ela, `moveIcon` desenha os três pictogramas em `Graphics`, nas mesmas caixas. Se não existir nenhum, usa fundo, corpo simplificado, pictogramas e efeitos em `Graphics`/`Phaser.Text` com **as mesmas caixas de layout**. O placeholder não deve mudar a lógica nem a área clicável.

Quando a folha chegar, medir a caixa alfa de cada célula, conferir linha do pé e ancorar o sprite pela base. O quadro do dançarino é **visual**, nunca hitbox de resposta. O toque acontece só nos espaços da ficha, opções grandes, DANÇAR e `?`. A luz de parada e os contadores ficam no código e devem continuar visíveis sobre qualquer arte.

Ordem de produção e aceitação: **protótipo jogável N1 → teste do usuário → fundo → folha de dançarino → ajuste da tela real → capa**. Nenhum desses PNGs foi produzido por este planejamento.
