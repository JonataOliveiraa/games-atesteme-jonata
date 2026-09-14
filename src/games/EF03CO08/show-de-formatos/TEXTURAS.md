# Show de Formatos — TEXTURAS.md

Este documento especifica a arte do jogo descrito em
[PLANEJAMENTO.md](./PLANEJAMENTO.md).

A arte deve comunicar **criação audiovisual**, não jogo de ritmo. O palco,
o telão e as luzes permanecem, mas não existem anel de timing, notas caindo,
pista de batida ou pad que precisa ser apertado no instante certo.

---

## 0. Lista fechada

| Arquivo | Dimensão | Grade | Fundo | Conteúdo |
|---|---:|---:|---|---|
| `bg-palco-escolar.png` | 1672 × 941 | imagem única | opaco | auditório escolar limpo |
| `apresentadora-duda.png` | 1024 × 256 | 4 × 1 | transparente | apresentadora do show |
| `cenas-do-show.png` | 1536 × 768 | 6 × 3 | transparente | 18 ilustrações temáticas |
| `sons-do-show.png` | 1024 × 512 | 4 × 2 | transparente | quatro fontes sonoras |
| `cover-show-de-formatos.png` | 1672 × 941 | imagem única | opaco | capa do catálogo |

**Total: cinco arquivos.**

Não gerar:

- anel de ritmo;
- contador 3–2–1;
- pads coloridos;
- notas descendo;
- barra de 30 segundos;
- telão como PNG;
- cortina animada como PNG;
- cartões com palavras;
- moldura de celular;
- galeria de clipes;
- botão, ?, estrela, cadeado ou HUD.

Esses itens foram removidos da mecânica ou pertencem ao código.

---

## 1. A regra que decide o visual

Cada cena final é composta por três coisas que devem parecer diferentes:

| Formato | Representação |
|---|---|
| IMAGEM | ilustração ocupando o telão |
| FRASE | faixa de texto feita em Phaser.Text |
| SOM | instrumento escolhido + equalizador animado |

A textura nunca deve fundir os três formatos num único quadro pronto. O código
precisa conseguir combinar qualquer imagem, qualquer frase válida do tema e
qualquer som.

### O que a arte não pode sugerir

- não existe uma opção visualmente “certa”;
- cenas A e B devem ter acabamento e atratividade equivalentes;
- instrumento ativo não ganha verde ou estrela;
- nenhuma frase pode estar desenhada dentro da ilustração;
- nenhuma imagem contém nota musical ou ícone de áudio;
- nenhuma escolha vem marcada pelo tema com cor-gabarito.

A autoria está na combinação. Se uma opção parecer melhor ou correta por causa
do brilho, o jogo deixa de ser expressivo.

---

## 2. Estilo comum

- ilustração 2D infantil, polida e plana;
- formas arredondadas e silhuetas amplas;
- contorno azul-marinho escuro;
- cores alegres sem neon excessivo;
- uma sombra suave e um pequeno brilho pintado;
- luz vinda do alto à esquerda;
- pouco detalhe interno;
- leitura forte a 64 px;
- diversidade brasileira sem estereótipos;
- ambiente escolar acolhedor;
- perspectiva frontal ou três quartos muito leve;
- nenhuma textura fotográfica.

As cenas dentro do telão podem ter mais cor que a interface, mas precisam
continuar simples o bastante para receber uma faixa de texto por cima.

---

## 3. Negativo comum

~~~text
Negative: text, letters, numbers, words, title, caption, speech text, brand
logo, watermark, signature, green correct check, red wrong X, answer marker,
quiz card, rhythm ring, timing circle, falling note, music lane, countdown,
score number, timer, progress bar, button, UI panel, frame label, visible grid
line, cell border, category-colored background, cropped, cut off, merged cells,
inconsistent repeated character, white background on transparent sprite sheet,
fake transparency, checkerboard painted into image, 3D render, photorealistic,
realistic, hyperdetail, glossy plastic, strong gradient, motion blur, lens flare.
~~~

---

## 4. Paleta

| Uso | Cor |
|---|---|
| contorno | `#203149` |
| roxo do palco | `#6547A8` |
| azul do telão | `#356FA3` |
| ciano de seleção | `#43B8D8` |
| coral | `#E86F51` |
| amarelo de luz | `#F3C969` |
| creme | `#F5E9D2` |
| madeira do palco | `#A96F47` |
| fundo escuro do telão | `#17283C` |
| texto principal em código | `#FFFFFF` |
| texto escuro em código | `#203149` |

IMAGEM, FRASE e SOM podem ter pequenos acentos próprios no código, mas cartões
de conteúdo não usam verde/vermelho como julgamento.

---

# 5. `bg-palco-escolar.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão | 1672 × 941 |
| fundo | opaco |
| câmera | frontal |
| área central calma | x 16%–84%, y 12%–70% |
| chão do palco | y 72%–100% |
| conteúdo interativo | nenhum |

O fundo é um auditório escolar pequeno, não um show profissional gigantesco.
Deixar centro livre para o telão em Graphics. Duda fica à esquerda; os cartões
ficam na faixa inferior e não podem competir com detalhes pintados.

Pode conter:

- parede azul-petróleo suave;
- molduras acústicas geométricas sem texto;
- duas estruturas de refletor nas extremidades;
- chão de madeira;
- pequenas luzes laterais apagadas;
- fileira abstrata de cabeças da plateia somente no rodapé extremo.

Não conter telão, cortina móvel, texto, instrumentos ou imagem temática.

## Prompt copiável

~~~text
A clean background for a children's educational audiovisual creation game,
exactly 1672 by 941 pixels, landscape, fully opaque and filling the canvas.

Front-facing view of a small friendly elementary-school auditorium stage.
Deep but cheerful blue-purple back wall, simple rounded acoustic wall panels
near the far edges, two compact stage-light supports at the upper far corners,
and a warm wooden stage floor occupying the bottom 28 percent. A very subtle
row of tiny rounded audience silhouettes may appear only along the extreme
bottom edge, dark and secondary.

Keep the entire central area from x=16 to 84 percent and y=12 to 70 percent
calm, empty and evenly lit. A large digital screen, animated curtains, a child
presenter and content cards will be drawn there by the game. Leave the left
area from x=2 to 15 percent quiet enough for the presenter. No object should
look touchable.

Flat 2D cartoon children's educational game background, chunky rounded
architecture, thick dark navy outline #203149 on major edges, broad matte color
fields, soft upper-left lighting, one gentle ambient shadow, polished, joyful,
welcoming and uncluttered, readable behind bright UI.

Negative: screen, monitor, television, projection screen, curtain crossing the
center, microphone, camera, drum, shaker, bells, clapping hands, music note,
rhythm pad, timing ring, falling notes, text, letters, numbers, alphabet poster,
logo, watermark, character, child, host, interactive card, button, timer,
scoreboard, spotlight beam covering the center, concert crowd, stadium,
nightclub, dark horror stage, border, white margin, 3D render, realistic,
photorealistic, hyperdetail, lens flare.
~~~

## Conferência

- [ ] telão em código cabe sem cobrir decoração importante;
- [ ] apresentadora tem fundo calmo;
- [ ] faixa inferior aceita cartões grandes;
- [ ] não há objeto que pareça opção;
- [ ] capa 1280 × 720 por cover sem barras internas.

---

# 6. `apresentadora-duda.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão | 1024 × 256 |
| grade | 4 × 1 |
| célula | 256 × 256 |
| fundo | alfa real |
| pivô | centro inferior |
| linha do chão | idêntica |
| preenchimento | 84% da altura |

Duda apresenta e reage, mas não é a autora do clipe. Ela nunca segura uma
opção correta nem aponta para um dos dois cartões.

| Frame | Estado | Uso |
|---:|---|---|
| 0 | esperando | escolha em andamento |
| 1 | apresentando o telão | início da fase |
| 2 | acompanhando a música | reprodução |
| 3 | comemorando | cena guardada ou nível completo |

## Prompt copiável

~~~text
Sprite sheet with exactly 4 frames in one strict horizontal row.
Each frame is exactly 256 by 256 pixels; total image exactly 1024 by 256 pixels.
True transparent background, no visible grid, no cell background and no bleed.

The exact same friendly nine-year-old Brazilian girl named Duda in all four
frames. Warm medium-brown skin, dark wavy shoulder-length hair held by one
small yellow headband, purple jacket #6547A8 over a cream shirt, coral trousers
#E86F51 and simple blue sneakers. Full body visible, front-facing with a slight
turn toward the right-side screen. Same body scale, head size, clothing,
hairstyle and foot baseline in every frame.

Frames left to right:
1. WAITING: relaxed pose with both hands visible, warm neutral expression.
2. PRESENTING: one open hand gestures broadly toward the right, without
   pointing at a specific answer and without holding any card.
3. ENJOYING THE SHOW: small dance pose, shoulders and hands moving gently,
   both feet remaining on the same baseline. No music notes.
4. CELEBRATING: both arms lifted, joyful expression, same scale and baseline.
   No trophy, star, checkmark or confetti inside the sprite.

Flat 2D cartoon children's educational game character, chunky rounded forms,
thick dark navy outline #203149, broad flat colors, one soft inner shadow,
small upper-left painted highlights, expressive friendly face, polished and
readable at small mobile size.

Negative: microphone in hand, camera, tablet, remote control, pointer stick,
answer card, text, letters, numbers, words, speech bubble, sound wave, music
note, rhythm ring, green check, red X, trophy, star, confetti, adult, multiple
children, different clothes, different hairstyle, different body size, moving
ground line, cropped feet, cut off hair, cell border, white background, fake
transparency, 3D render, realistic, photorealistic, hyperdetail, motion blur.
~~~

## Controles de qualidade

- [ ] mesma personagem nos quatro frames;
- [ ] pés alinhados;
- [ ] gesto de apresentação aponta para o telão, não para resposta;
- [ ] frame 2 funciona mesmo no mudo;
- [ ] nenhuma pose invade a célula vizinha;
- [ ] comemoração não carrega avaliação estética.

---

# 7. `cenas-do-show.png`

## Especificação geral

| Campo | Valor |
|---|---|
| dimensão | 1536 × 768 |
| grade | 6 colunas × 3 linhas |
| célula | 256 × 256 |
| fundo da folha | alfa real |
| conteúdo de cada célula | ilustração quadrada quase completa |
| margem | 8% |
| perspectiva | frontal ou três quartos leve |
| personagens | no máximo duas figuras pequenas por cena |
| texto | nenhum |

A ordem é contrato com `data/levels.ts`.

### Linha 0 — escola

| Frame | Cena |
|---:|---|
| 0 | portão escolar acolhedor ao amanhecer |
| 1 | sala de aula preparada para começar |
| 2 | pátio com amarelinha |
| 3 | quadra com bola |
| 4 | livro aberto em mesa de leitura |
| 5 | estante colorida de biblioteca |

### Linha 1 — casa

| Frame | Cena |
|---:|---|
| 6 | janela com sol da manhã |
| 7 | mesa de café simples |
| 8 | blocos de montar no tapete |
| 9 | quintal com corda e bola |
| 10 | janela com lua |
| 11 | cama com livro no criado-mudo |

### Linha 2 — bairro

| Frame | Cena |
|---:|---|
| 12 | rua residencial com casas |
| 13 | ciclovia arborizada |
| 14 | praça com árvores e banco |
| 15 | brinquedos de parquinho |
| 16 | barracas de feira |
| 17 | banca com frutas coloridas |

Cada par representa duas maneiras igualmente válidas de mostrar a mesma parte
do tema. Não fazer uma opção bonita e outra vazia, quebrada ou triste.

### Área para frase

A faixa de texto ficará no terço inferior. Em todas as cenas:

- manter `y=0,67–0,91` sem rostos, mãos ou objeto principal;
- permitir escurecimento translúcido em código;
- não desenhar placa, faixa, papel ou caixa nesse local;
- manter contraste visual moderado.

## Prompt copiável

~~~text
Sprite sheet with exactly 18 illustrated scenes in a strict 6-column by 3-row
grid. Each frame is exactly 256 by 256 pixels; total image exactly 1536 by
768 pixels. True transparent background outside each scene, no visible grid
lines, no cell labels, no bleed and no merged scenes.

Each cell contains one complete square digital illustration for a children's
audiovisual creation game. Keep an 8 percent transparent safety margin around
each illustration. All scenes use the exact same flat 2D cartoon style, thick
dark navy outline #203149, chunky rounded objects, broad colorful shapes, soft
upper-left light, one gentle inner shadow and minimal detail. Warm, ordinary
Brazilian childhood environments without brand logos or stereotypes.

The bottom band from y=67 to 91 percent inside EVERY cell must remain visually
calm and unobstructed. No face, hand, main object, sign, banner or high-contrast
pattern may occupy this band, because the game overlays a short sentence there.
Do not paint a text box; simply keep the composition calm.

Row 1, SCHOOL, left to right:
1. A welcoming small school entrance in early morning, open gate, low building,
   one tree and warm light. No school name or letters.
2. A cheerful classroom ready for the day, desks, blank board and sun through
   a window. No writing on the board.
3. A school courtyard with a large colorful hopscotch pattern made only from
   blank geometric squares, no numbers, and one small ball at the side.
4. A school sports court with one ball near the center, low fence and two
   distant child silhouettes playing, no uniform logos.
5. One large open picture book on a cozy reading table, pages containing only
   abstract colored shapes, no letters or words.
6. A colorful school-library bookshelf with recognizable book spines and one
   reading cushion, all book covers blank.

Row 2, HOME, left to right:
7. A cozy home window with morning sun, pale curtain and a small plant.
8. A simple breakfast table with fruit, cup and bread, no packaging or logo.
9. Colorful building blocks on a soft living-room rug, a small finished tower
   beside loose blocks.
10. A safe sunny backyard with jump rope, ball, grass and low wall, no child
    close-up.
11. A cozy window with moon and two stars outside, interior lamp softly lit.
12. A child's tidy bed with a closed picture book on a small bedside table,
    no text on cover and no sleeping person.

Row 3, NEIGHBORHOOD, left to right:
13. A friendly residential street with three different small houses, sidewalk,
    trees and no readable address.
14. A leafy bicycle path with one small bicycle parked safely, no rider and no
    traffic sign text.
15. A neighborhood square with broad trees, one bench and flower bed.
16. A small playground with slide and swing, two distant children playing,
    clear safe composition.
17. A cheerful open-air market with striped stalls and plain baskets, no price
    signs or writing.
18. A colorful fruit stand with bananas, oranges, apples and watermelon, no
    labels, numbers or vendor close-up.

The paired alternatives must have equal polish, brightness, detail and appeal.
No frame is the correct answer. Do not use green glow, red danger, arrows,
stars, checks or emotional judgment. Images are independent content pieces,
not interface cards.

Negative: text, letters, numbers, words, school name, street address, price,
brand, logo, watermark, signature, caption, speech bubble, music note, sound
wave, microphone, camera overlay, rhythm pad, timing ring, green check, red X,
answer highlight, border around individual scene, visible grid, cell number,
cropped main object, object crossing cells, overly busy bottom text band,
different art styles, dark horror mood, unsafe traffic, realistic identifiable
child portrait, white background around the full sheet, fake transparency,
3D render, realistic, photorealistic, hyperdetail, motion blur, lens flare.
~~~

## Controles de qualidade

- [ ] exatamente 18 células;
- [ ] a ordem coincide com as tabelas;
- [ ] pares têm o mesmo nível de acabamento;
- [ ] não há palavra legível;
- [ ] faixa inferior está livre em todos os frames;
- [ ] miniatura continua reconhecível a 72 × 72;
- [ ] nenhum frame inclui símbolo de som ou texto;
- [ ] rostos são pequenos e genéricos, nunca retratos identificáveis;
- [ ] não há borda de cartão pintada.

### Teste de igualdade das opções

Mostrar cada par sem título e perguntar apenas “qual você prefere?”. É normal
haver preferências diferentes; o problema é todos apontarem a mesma porque a
outra parece incompleta, escura ou errada. Nesse caso, equilibrar a arte.

---

# 8. `sons-do-show.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão | 1024 × 512 |
| grade | 4 × 2 |
| célula | 256 × 256 |
| fundo | alfa real |
| linha 0 | repouso |
| linha 1 | tocando |
| ordem | sininhos, chocalho, tambor, palmas |

| Coluna | Frame neutro | Frame ativo | Som | Mudança |
|---:|---:|---:|---|---|
| 0 | 0 | 4 | sininhos | badalos mudam levemente |
| 1 | 1 | 5 | chocalho | inclinação pequena |
| 2 | 2 | 6 | tambor | baqueta encosta |
| 3 | 3 | 7 | palmas | mãos se aproximam |

As ondas e o equalizador são código. O estado ativo não significa acerto.

## Prompt copiável

~~~text
Sprite sheet with exactly 8 frames in a strict 4-column by 2-row grid.
Each frame is exactly 256 by 256 pixels; total image exactly 1024 by 512 pixels.
True transparent background, no visible grid lines, no cell background,
no text, no labels and no bleed. One centered sound-source object per frame.

Draw four familiar simple sound sources for a children's audiovisual creation
game. Consistent flat 2D cartoon style, thick dark navy outline #203149,
chunky rounded shapes, broad flat colors in purple #6547A8, coral #E86F51,
yellow #F3C969 and blue #356FA3, one soft inner shadow, small upper-left
highlight, about 74 percent cell fill and generous margins.

Top row, left to right, neutral:
1. BELLS: a pair of small hand bells joined by one simple curved handle,
   clearly recognizable, resting upright.
2. SHAKER: one familiar oval hand shaker with a short handle and simple color
   bands, resting diagonally.
3. DRUM: one small round children's hand drum with one separate padded
   drumstick hovering just above it, complete and centered.
4. CLAPPING HANDS: two simplified open hands facing each other with a clear
   gap, illustrated as a generic pictogram with no arms or identifiable person.

Bottom row, left to right, active versions of the EXACT same four:
5. BELLS PLAYING: same position and scale, internal clappers shifted slightly.
6. SHAKER PLAYING: same object and center, rotated only a few degrees.
7. DRUM PLAYING: same drum geometry, drumstick touching the drum surface.
8. CLAP PLAYING: same two hands and scale, palms touching gently.

Pairs must align and retain the same outer scale. No external motion lines,
sound waves, music notes, equalizer bars, green glow, checkmark, smile, star
or celebration. Active means playing, not correct.

Negative: microphone, speaker, headphones, radio, music box, crank, keyboard,
camera, monitor, printer, cable, musical note, clef, sound wave, equalizer,
text, letters, numbers, words, logo, watermark, category badge, green check,
red X, face, eyes, full person, realistic identifiable hands, extra fingers,
cropped drumstick, object crossing cells, visible grid, border, white
background, fake transparency, 3D render, realistic, photorealistic,
hyperdetail, motion blur, lens flare.
~~~

## Conferência

- [ ] os quatro sons são reconhecíveis sem legenda;
- [ ] pares alinham;
- [ ] mãos têm leitura de pictograma simples;
- [ ] tambor e baqueta cabem inteiros;
- [ ] nenhum frame contém nota ou onda;
- [ ] estado ativo não entrega avaliação.

Se palmas gerar mãos ruins ou ambíguas, substituir o quarto objeto por dois
blocos de percussão de madeira. Atualizar dados e planejamento juntos; não
aceitar mãos com anatomia estranha.

---

# 9. `cover-show-de-formatos.png`

## Objetivo

A capa precisa mostrar que a criança **monta** uma apresentação usando três
formatos. Não deve parecer que ela está tentando acertar uma nota musical.

Composição:

- Duda apresenta o telão;
- uma imagem escolar aparece no telão;
- uma faixa branca vazia representa o lugar da frase;
- tambor e ondas/equalizador mostram som;
- três miniaturas concluídas aparecem como película;
- não há anel, cronômetro ou pad.

## Prompt copiável

~~~text
A polished cover illustration for a children's educational audiovisual
creation game, exactly 1672 by 941 pixels, landscape, fully opaque and filling
the canvas.

Show a small joyful elementary-school auditorium stage viewed from the front.
At the left stands Duda, a friendly nine-year-old Brazilian girl with warm
medium-brown skin, dark wavy shoulder-length hair, yellow headband, purple
jacket, cream shirt, coral trousers and blue sneakers. She presents the large
digital screen with an open hand.

At center, a large bright screen displays a colorful flat illustration of a
school courtyard with hopscotch and a ball. Across the calm lower part of the
screen is one clean rounded cream caption ribbon with NO text inside; it must
clearly look ready to receive a digital phrase, but remain blank.

At the right foreground, a small children's drum and shaker sit on a compact
sound console. Friendly cyan equalizer bars and small soft sound-wave arcs show
that audio is part of the presentation. Below the large screen, a simple
three-cell filmstrip displays three different tiny school-scene thumbnails,
showing that several created scenes form one clip.

Use a clear visual hierarchy: created image on the screen, blank caption layer
over it, visible sound source and equalizer beside it, filmstrip below. Duda is
the host, not a contestant answering a rhythm challenge. Leave the upper 18
percent calm and light enough for the platform title overlay.

Flat 2D cartoon children's educational game cover, chunky rounded shapes,
thick dark navy outline #203149, deep friendly purple stage #6547A8, bright
blue screen accents #356FA3, cyan selection glow #43B8D8, coral #E86F51,
yellow #F3C969, broad flat colors, soft upper-left lighting, one gentle inner
shadow, polished, inclusive, cheerful and uncluttered.

Negative: title, text, letters, numbers, words, logo, watermark, signature,
rhythm ring, timing circle, notes falling from top, rhythm lane, dance arrows,
countdown, timer, score, combo, four colored pads, green correct check, red X,
quiz cards, microphone in child's hand, singing contest, karaoke lyrics,
stadium concert, nightclub, dark crowd, frightened child, realistic photograph
inside screen, border, white margin, cropped important objects, 3D render,
realistic, photorealistic, hyperdetail, motion blur, lens flare.
~~~

## Conferência

- [ ] telão mostra imagem;
- [ ] faixa vazia sugere texto sem possuir texto;
- [ ] som aparece por instrumento e equalizador;
- [ ] película comunica sequência;
- [ ] não parece jogo de ritmo;
- [ ] topo aceita título externo;
- [ ] Duda coincide com a folha de personagem.

---

# 10. O que continua em Graphics e Phaser.Text

| Elemento | Como | Motivo |
|---|---|---|
| telão | moldura e área interna | muda entre edição e cinema |
| cortinas | duas formas laterais | abrem e fecham |
| película | três slots | estado muda por fase |
| aba IMAGEM | botão com pictograma desenhado | interativa |
| aba FRASE | botão e linhas abstratas | interativa |
| aba SOM | botão e barras | interativa |
| cartões | painéis e hitboxes | seleção e edição |
| frases | Phaser.Text | legível, variável e traduzível |
| equalizador | barras animadas | sincroniza com áudio |
| ondas | arcos | feedback no mudo |
| refletores | cones com alfa | respondem à reprodução |
| miniaturas | frame de `cenas-do-show` | reuso exato |
| botão APRESENTAR | Graphics + texto | habilita por estado |
| tutorial | compartilhado | padrão |
| progresso | três pontos/cenas | sem número de pontos |
| resultado | painel compartilhado | padrão |

### Pictogramas das camadas

Desenhar em código:

- IMAGEM: pequeno quadro com montanha e sol;
- FRASE: três linhas horizontais dentro de balão;
- SOM: três barras de equalizador.

Os pictogramas são sempre acompanhados da palavra. Não usar emoji, pois varia
entre sistemas e pode virar imagem com estilo incompatível.

### Composição no telão

Ordem de camadas:

1. fundo escuro do telão;
2. frame de `cenas-do-show.png` ajustado com contain;
3. leve vinheta inferior feita em Graphics;
4. faixa translúcida;
5. frase em Phaser.Text;
6. equalizador no canto superior direito;
7. reflexo discreto da tela;
8. máscara retangular da área útil.

A frase nunca deve cobrir o objeto principal porque os frames reservam o terço
inferior.

---

# 11. Antes da arte existir

O nível 1 deve ser jogável sem PNG.

| Asset ausente | Placeholder |
|---|---|
| fundo | parede roxa e chão de madeira |
| Duda | personagem de formas simples com nome |
| cena | quadro colorido com pictograma do tema |
| sininhos | dois círculos e alças |
| chocalho | oval com cabo |
| tambor | cilindro e baqueta |
| palmas | duas formas arredondadas |
| capa | não é carregada pelo jogo |

Nenhum placeholder usa emoji. As duas imagens de uma fase precisam continuar
visualmente diferentes mesmo quando são formas simples.

A reprodução final, edição, áudio, equalizador e tutorial devem estar completos
antes de integrar a arte. Textura troca aparência; não cria a mecânica.

---

# 12. Como carregar

~~~ts
const ART = import.meta.glob(
    '../../../../assets/games/EF03CO08/show-de-formatos/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>
~~~

`BootScene` ignora `cover-` e mantém fallback para arquivos ausentes.

| Chave | Arquivo | Frame |
|---|---|---|
| `show-background` | `bg-palco-escolar.png` | imagem |
| `show-host` | `apresentadora-duda.png` | 256 × 256 |
| `show-scenes` | `cenas-do-show.png` | 256 × 256 |
| `show-sounds` | `sons-do-show.png` | 256 × 256 |

### Índices

~~~ts
const HOST_FRAME = {
    idle: 0,
    presenting: 1,
    dancing: 2,
    celebrating: 3,
} as const

const SOUND_FRAME = {
    bells: 0,
    shaker: 1,
    drum: 2,
    claps: 3,
} as const
~~~

Estado ativo soma 4 ao frame de som.

Os frames das cenas são dados explícitos em `data/levels.ts`. Não inferir frame
pela posição textual do tema.

---

# 13. Medição e integração

Depois de receber as folhas:

1. confirmar dimensões exatas;
2. verificar divisibilidade por 256;
3. conferir alfa em fundos claro e escuro;
4. medir caixa alfa de Duda em todos os frames;
5. comparar linha dos pés;
6. medir caixa de cada instrumento;
7. comparar pares neutro/ativo;
8. conferir margem e faixa inferior das 18 cenas;
9. testar miniaturas a 72 × 72;
10. testar telão a 760 × 300;
11. testar tudo com escala visual de 30%.

Registrar pivôs e áreas em `data/layout.ts`. Não espalhar correções de offset
por GameScene.

### Filtros e escalas

- usar filtro linear nas cenas ampliadas;
- não esticar quadrado para preencher telão largo;
- usar contain e completar laterais com cor média do tema;
- miniaturas usam center-crop somente se o objeto principal não for cortado;
- Duda ancora no centro inferior;
- instrumentos ancoram pelo centro visual;
- fundo usa cover.

---

# 14. Entrega técnica

| Item | Regra |
|---|---|
| formato | PNG-24 |
| alfa | real nas três folhas de sprites |
| opacos | fundo e capa |
| células | exatamente 256 × 256 |
| iluminação | alto à esquerda |
| linha de grade | proibida |
| texto no PNG | proibido |
| logos e marcas | proibidos |
| margem | mínimo de 8% |
| sangria entre frames | nenhuma |
| peso alvo de folha | até 1,2 MB |
| peso alvo opaco | até 1,5 MB |

Se o gerador entregar imagem maior, redimensionar a folha inteira. Não cortar
e redimensionar células individualmente, pois isso quebra consistência.

Se não houver alfa real, gerar sobre magenta `#FF00FF` e remover tecnicamente.
Verificar halos claros e escuros antes de aceitar.

---

# 15. Ordem de produção

### Rodada 1 — validar a mecânica

1. construir placeholders;
2. implementar as três cenas do nível 1;
3. verificar edição e reprodução;
4. testar no celular e no mudo.

### Rodada 2 — conteúdo essencial

5. gerar `cenas-do-show.png`;
6. validar 18 frames, miniaturas e área de frase;
7. gerar `sons-do-show.png`;
8. validar reconhecimento e alinhamento.

### Rodada 3 — identidade

9. gerar `apresentadora-duda.png`;
10. gerar `bg-palco-escolar.png`;
11. integrar e realizar teste com usuário;
12. ajustar composição.

### Rodada 4 — catálogo

13. gerar `cover-show-de-formatos.png` somente depois do teste;
14. conferir que a capa não parece jogo de ritmo;
15. cadastrar quando o nível 1 estiver aprovado.

A arte de casa e bairro pode estar na mesma folha desde o começo, mas não
autoriza implementar níveis 2 e 3 antes do teste do nível 1.

---

# 16. Checklist final

## Lista

- [ ] exatamente cinco arquivos;
- [ ] nenhuma textura de pad ou anel;
- [ ] nenhuma textura de botão, painel ou telão;
- [ ] áudio é sintetizado, sem WAV/MP3 obrigatório;
- [ ] frases são texto do Phaser.

## Fundo

- [ ] centro vazio;
- [ ] área de Duda limpa;
- [ ] faixa inferior não compete com cartões;
- [ ] nenhum objeto parece interativo.

## Duda

- [ ] quatro frames;
- [ ] identidade e escala consistentes;
- [ ] pés alinhados;
- [ ] não aponta para resposta;
- [ ] não segura microfone ou cartão correto.

## Cenas

- [ ] grade 6 × 3;
- [ ] 18 frames na ordem;
- [ ] pares igualmente atraentes;
- [ ] nenhum texto;
- [ ] faixa inferior calma;
- [ ] leitura boa em miniatura;
- [ ] nenhuma marca de gabarito.

## Sons

- [ ] grade 4 × 2;
- [ ] objetos reconhecíveis;
- [ ] neutro/ativo alinhados;
- [ ] nenhum som tem nota pintada;
- [ ] ativo não significa correto;
- [ ] alternativa para palmas está documentada.

## Capa

- [ ] comunica imagem + frase + som;
- [ ] película comunica microclipe;
- [ ] não possui anel, BPM, timer ou notas caindo;
- [ ] Duda coincide com a folha;
- [ ] não há texto embutido;
- [ ] topo preserva espaço para título.

## Integração

- [ ] jogo funciona sem qualquer textura;
- [ ] conteúdo selecionado aparece exatamente na reprise;
- [ ] frase não cobre objeto principal;
- [ ] mudo mantém equalizador;
- [ ] prévia de som anterior é interrompida;
- [ ] edição não duplica pontos;
- [ ] nenhuma escolha estética gera erro;
- [ ] nenhum dado pessoal é solicitado.

---

## 17. Resumo para geração

O visual é de um pequeno estúdio de apresentação escolar. A criança não tenta
acompanhar uma música; ela dirige o que será mostrado.

Gerar apenas:

1. ambiente;
2. apresentadora;
3. imagens que podem ser combinadas;
4. objetos que representam as trilhas;
5. capa mostrando os três formatos juntos.

Sempre que um resultado parecer “jogo de apertar no ritmo”, remover anéis,
notas, pistas e cronômetros. Sempre que uma alternativa parecer a resposta
certa, equilibrar brilho, detalhe e emoção entre as opções.
