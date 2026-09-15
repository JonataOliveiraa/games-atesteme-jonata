# O Cofre dos Registros — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino futuro: `src/assets/games/EF04CO02/o-cofre-dos-registros/`

As imagens dão identidade ao cenário. **A ficha de campos nomeados é a parte jogável e permanece no código.** Nenhum gerador de imagem deve escrever CRIATURA, COR, LOCAL, SITUAÇÃO ou qualquer valor dentro dos PNGs.

---

## 0. Lista fechada

| # | Arquivo | Dimensão | Grade | Fundo | Uso | Produção |
|---:|---|---:|---:|---|---|---|
| 1 | `bg-posto-do-fundo-do-mar.png` | 1672 × 941 | imagem única | opaco | interior do posto de observação | primeiro corte |
| 2 | `cofre-do-arquivo.png` | 1024 × 512 | 2 × 1 de 512 | alfa real | cápsula-cofre fechada e aberta | primeiro corte |
| 3 | `criaturas-avistadas.png` | 768 × 256 | 3 × 1 de 256 | alfa real | polvo, peixe e caranguejo | primeiro corte |
| 4 | `cover-o-cofre-dos-registros.png` | 1672 × 941 | imagem única | opaco | capa do catálogo | por último |

**Total: quatro arquivos.** Nenhum foi gerado nesta etapa de planejamento.

### O que não é textura

- ficha, campos e rótulos;
- etiquetas com os valores;
- o aro de observação onde a criatura aparece;
- botão, moldura, `?`, cadeado e três trancas ativas;
- dica, seta, brilho, progresso, estrelas, medalha e balão;
- comparação antes/depois;
- fichas arquivadas no fim;
- relógio, pois **não há relógio no jogo**.

Tudo isso fica em `Graphics`/`Phaser.Text`. A interface precisa atualizar nomes e valores com nitidez; PNG com palavras inventadas seria um defeito pedagógico.

---

## 1. Regra visual que governa a arte

> **O fundo não pode conter uma ficha pronta nem indicar a resposta.**

A criança olha para uma criatura e para uma ficha com **campos nomeados pelo código**. O cenário não pode esconder valores em detalhes minúsculos: isso devolveria a “caça a pixels” que saiu do plano.

As três criaturas têm cores diferentes por identidade, mas os valores na bandeja são escritos com o mesmo acabamento. Não colorir `LARANJA` de laranja e `AMARELO` de amarelo como única pista. A palavra e o nome do campo precisam continuar necessários.

O cofre é um **cofre normal** — aqui, uma cápsula de arquivo com porta redonda de pressão — sem rosto, olhos, boca, braços ou personalidade de mascote. A porta abre quando três fichas ficam prontas. Os três ferrolhos são desenhados pelo jogo para avançarem independentemente do PNG.

### A água é escura de propósito

Este é o ponto que separa a arte aprovada da refeita. A ficha é papel creme `#FFF7E8`, a seleção é ciano `#43B8D8` e a TRAVA é âmbar `#F4B942`; os três moram **em cima** do cenário. Se a água vier turquesa clara e saturada, a ficha deixa de ser a coisa mais luminosa da tela e o contorno de seleção some dentro do azul do fundo.

Portanto: azul-petróleo escuro e dessaturado, `#0E3A52` a `#15556F`. Luz filtrada em feixes largos e discretos, nunca um mar de férias iluminado. O interior do posto tem luz quente própria, e é ela que torna o ambiente acolhedor em vez de sombrio.

Nada de terror: o posto é limpo, arredondado e habitado, não um destroço afundado, um submarino militar nem uma fossa abissal.

---

## 2. Estilo comum

~~~text
Flat polished 2D cartoon illustration for a Brazilian elementary-school
educational game, clear rounded silhouettes, thick dark-navy outline #203149,
broad matte colors, one soft shadow, small highlight from the upper left,
calm friendly undersea research setting, few details, high contrast and
readability at small mobile size. Sea creatures look like ordinary real
animals, never characters. No text baked into the art.
~~~

### Negativo comum

~~~text
text, letters, numbers, digits, words, name, date, label, station name,
coordinates, logo, watermark, signature, photograph of a real child,
person, diver, face on the safe, eyes on the hull, mouth, smile, mascot,
anthropomorphic object, cartoon eyes on animals, hidden collectible,
tiny clue, treasure chest, correct-answer glow, green check, red X,
prefilled form, card, UI panel, button, floating instruction,
visible sprite-sheet grid, cell borders, merged frames, cropped object,
white background in a transparent asset, fake transparency, painted
checkerboard, military submarine, torpedo, weapon, shark attack,
sunken wreck horror, murky black abyss, scary deep-sea monster,
bright saturated turquoise, 3D render, photorealistic, hyperdetail,
harsh horror lighting, motion blur, lens flare.
~~~

---

## 3. Paleta

| Uso | Hex |
|---|---|
| contorno | `#203149` |
| água profunda | `#0E3A52` |
| água média | `#15556F` |
| feixe de luz | `#2E8AA8` |
| casco claro | `#7E93A8` |
| casco escuro | `#41586F` |
| luz quente do interior | `#F0C99A` |
| vidro da escotilha | `#A9DCEA` |
| coral e alga do cenário | `#3FA089` |
| laranja do polvo | `#E2722F` |
| amarelo do peixe | `#F0C132` |
| vermelho do caranguejo | `#D9533F` |
| ciano de seleção (código) | `#43B8D8` |
| âmbar da TRAVA (código) | `#F4B942` |
| papel da ficha (código) | `#FFF7E8` |

As três últimas são cores de interface. O cenário não deve usá-las para insinuar a ordem das etiquetas, e o fundo não deve chegar perto do ciano de seleção: é por isso que o feixe de luz é `#2E8AA8` dessaturado, e não um turquesa vivo.

As três cores de criatura são **quentes**, contra uma água fria. É o que as faz aparecer no aro de observação sem precisar de brilho, seta ou moldura acesa.

---

# 4. `bg-posto-do-fundo-do-mar.png`

## Contrato

| Campo | Valor |
|---|---|
| dimensão | 1672 × 941 |
| opacidade | fundo completamente opaco |
| câmera | frontal, altura dos olhos |
| área calma esquerda | x 4%–40%, y 12%–76% |
| área calma direita | x 40%–96%, y 12%–79% |
| faixa inferior | y 79%–100%, pouco detalhe |
| objetos interativos pintados | nenhum |

O interior de um **pequeno posto de observação no fundo do mar**: casco de painéis arredondados, rebites suaves, bancada baixa e luz quente própria. Precisa comportar a cápsula-cofre separada à esquerda, o aro de observação com a criatura logo abaixo dela e a ficha grande à direita.

As escotilhas decorativas ficam **nas bordas extremas**, mostrando água escura, um feixe de luz e talvez uma silhueta distante de coral. Nenhuma escotilha pode cair dentro das áreas calmas: o aro onde a criatura aparece é desenhado pelo jogo, porque ele pisca e muda de estado, e um aro pintado no fundo brigaria com ele.

Não pintar criatura nenhuma em tamanho reconhecível. Um cardume minúsculo e desfocado ao longe é cenário; um polvo, um peixe ou um caranguejo legível é resposta pintada no fundo e reprova a textura.

### Prompt copiável

~~~text
Interior of a small friendly undersea research observation post,
background art, exactly 1672 by 941 pixels, landscape, fully opaque
edge to edge.

Front-facing room at a child's eye level. Rounded riveted hull panels
in muted steel blue-gray #7E93A8 and #41586F, a broad low-detail work
counter along the lower part, and warm interior lamp light #F0C99A that
makes the place feel cozy and inhabited. Two or three DECORATIVE round
portholes only at the FAR left and FAR right edges, showing calm DARK
desaturated deep water #0E3A52 to #15556F with one soft wide light beam
#2E8AA8 and a distant blurred hint of coral. Tidy anonymous storage
drawers and empty sample racks pushed to the far edges, none emphasized,
none looking collectible.

Reserve a calm uncluttered zone on the LEFT for a separate illustrated
archive safe and a large creature shown inside a code-drawn ring.
Reserve an even larger calm zone on the RIGHT for a separate interactive
record form. Keep the bottom 21 percent quiet so the game can draw three
big value tags there. Do not paint anything a child might try to click.

Flat polished 2D cartoon educational-game background, rounded forms,
dark navy outline #203149 on major structure, broad matte colors, one
soft shadow, small upper-left highlight, high contrast but low visual
noise, clear on mobile. Calm and welcoming, not gloomy.

Negative: safe, vault door, porthole in the central area, octopus,
fish, crab, turtle, any recognizable sea creature in the foreground,
seaweed across the center, treasure chest, shipwreck, diver, person,
face, eyes, mascot, record sheet, form, field, card, tag, button, lock,
arrow, hidden object, text, letters, numbers, station name, logo,
watermark, border, white margin, military submarine, torpedo, weapon,
shark, monster, murky black abyss, bright saturated turquoise,
3D render, realistic, photorealistic, hyperdetail, motion blur,
lens flare.
~~~

### Conferência

- [ ] comunica posto de pesquisa acolhedor, não destroço nem submarino militar;
- [ ] a água é escura e dessaturada, e o papel creme vai brilhar em cima;
- [ ] existe espaço visual para a cápsula-cofre separada;
- [ ] a ficha grande cabe à direita sem disputar contraste;
- [ ] nenhuma escotilha invade as áreas calmas;
- [ ] nenhuma criatura legível está pintada no fundo;
- [ ] a faixa inferior aceita etiquetas legíveis;
- [ ] não há textos ou marcas.

---

# 5. `cofre-do-arquivo.png`

## Contrato

| Campo | Valor |
|---|---|
| dimensão | 1024 × 512 |
| grade | 2 colunas × 1 linha |
| célula | 512 × 512 |
| fundo | alfa verdadeiro |
| preenchimento | 78%–84% da célula |
| ângulo | frontal em três quartos muito leve |
| base | mesma linha nos dois frames |

| Frame | Estado | O que o código acrescenta |
|---:|---|---|
| 0 | porta fechada | três ferrolhos sobrepostos em Graphics |
| 1 | porta aberta | fichas concluídas desenhadas ou animadas pelo jogo |

A cápsula-cofre é o arquivo de bordo do posto: um cofre compacto de casco claro `#7E93A8` com **porta redonda de pressão**, aro mais escuro `#41586F`, volante simples no centro e pés curtos. A porta redonda é o que faz o objeto ler “cofre” a cerca de 70 px reais — melhor do que uma porta retangular — e ao mesmo tempo pertencer ao fundo do mar.

Acolhedor e pequeno, nunca enorme, ameaçador ou militar. Sem rosto.

Os três ferrolhos **não fazem parte do PNG**. O jogo desenha três marcas sobre o aro e abre uma por fase. O PNG também não contém barras de progresso, números nem mostradores com escala.

A moldura externa, o volante e a base ficam na mesma posição em ambos os quadros. No frame aberto, a porta gira para a esquerda e o interior está vazio e iluminado por dentro, para o código inserir as fichas.

### Prompt copiável

~~~text
Sprite sheet of exactly TWO frames of the SAME small friendly undersea
ARCHIVE SAFE in a strict 2-column by 1-row grid. Each cell exactly 512
by 512 pixels, total canvas 1024 by 512 pixels. True transparent
background, no visible grid lines, no card backgrounds, no bleed.

The same compact archive capsule in both frames, shown mostly from the
front with just a slight three-quarter depth: muted steel blue-gray body
#7E93A8, a ROUND pressure door with a darker metal rim #41586F, one
simple central wheel handle, rounded corners, soft rivets and short
feet. Clear child-friendly silhouette at small size. Cozy, not
industrial, not military. No face, no eyes, no mouth, no anthropomorphic
features. No permanent lock icons, dials, gauges, keys or badges on the
door; the game draws three changing bolts over it.

LEFT FRAME — CLOSED: round door fully closed, broad clean front, empty
space across the door for three code-drawn bolts, wheel clearly visible.

RIGHT FRAME — OPEN: EXACT SAME outer body, same size, position, feet,
rim and camera angle; the round door swings open to the LEFT, revealing
a clean EMPTY warmly lit cream interior. No folders, treasure, paper or
objects inside; the game will add them.

Polished flat 2D cartoon game object, thick dark navy outline #203149,
broad matte colors, one soft shadow, upper-left highlight. Center each
safe with similar margins. The base contact line is identical in both
frames.

Negative: face, eyes, eyebrows, mouth, smile, mascot, arms, person,
diver, bank vault with giant circular mechanism, prison door, torpedo
tube, airlock full of pipes, weapon, alarm light, gauge, dial, number,
letter, text, logo, watermark, three pre-drawn bolts, folder, paper,
treasure, coins, overflowing objects, different safe in second frame,
changed body shape, changed base, visible grid, border, cropped,
cut off, white background, fake transparency, 3D render, realistic,
photorealistic, hyperdetail, motion blur.
~~~

### Conferência

- [ ] os dois frames têm a mesma cápsula;
- [ ] casco externo, volante e pés alinham;
- [ ] porta fechada deixa espaço para três ferrolhos de código;
- [ ] interior aberto está vazio e iluminado;
- [ ] não há rosto, mostradores, números ou texto;
- [ ] a abertura da porta é reconhecível no celular;
- [ ] fundo é realmente transparente.

---

# 6. `criaturas-avistadas.png`

## Contrato

| Campo | Valor |
|---|---|
| dimensão | 768 × 256 |
| grade | 3 colunas × 1 linha |
| célula | 256 × 256 |
| fundo | alfa verdadeiro |
| margem | mínimo 9% em cada célula |
| ordem | polvo, peixe, caranguejo |

| Frame | Criatura | Cor principal | Texto da pista, no código |
|---:|---|---|---|
| 0 | polvo pequeno e calmo | laranja `#E2722F` | polvo laranja |
| 1 | peixe de recife, corpo alto | amarelo `#F0C132` | peixe amarelo |
| 2 | caranguejo redondo | vermelho `#D9533F` | caranguejo vermelho |

São **animais comuns, não personagens**: sem olhos de desenho animado grandes, sem sorriso, sem sobrancelha, sem pose de mascote. Olho simples de animal é aceitável e necessário para ler a silhueta; expressão facial não.

Nenhum PNG contém local, situação, bolha, etiqueta ou qualquer resposta. Não pintar coral, pedra, areia ou fundo junto da criatura — o `LOCAL` é campo da ficha, e desenhar o naufrágio embaixo do polvo entregaria a resposta de graça.

As três precisam de peso visual parecido mesmo com silhuetas diferentes: o polvo é mais alto, o caranguejo mais largo, o peixe intermediário.

### Prompt copiável

~~~text
A strict horizontal sprite sheet of exactly THREE ordinary friendly sea
creatures, each in one 256 by 256 square cell; total image 768 by 256
pixels. True transparent background, no visible grid lines, no cell
backgrounds and no bleed. One isolated complete creature centered in
each cell with at least nine percent transparent margin. Equal visual
weight and consistent flat 2D cartoon style.

Frame 1: one small ORANGE OCTOPUS #E2722F, rounded head, soft curling
arms, calm neutral pose, plain skin with no pattern.
Frame 2: one YELLOW REEF FISH #F0C132 with a tall rounded body, seen
from the side, simple fins, plain body with no stripes or markings.
Frame 3: one RED CRAB #D9533F, round shell seen slightly from above,
two simple claws, plain shell with no pattern.

These are real animals, not characters: simple small animal eye only,
no cartoon eyelashes, no eyebrows, no smiling mouth, no waving arms,
no human pose. Nothing around them: no coral, no rock, no sand, no
bubbles, no water, no seabed.

Thick dark navy outline #203149, broad matte colors, one soft shadow,
small upper-left highlight, recognizable at mobile size. Use natural
color variation, but never a green correct check or red wrong cross.

Negative: text, letters, numbers, name, label, speech bubble, coral,
rock, sand, seabed, bubbles, water background, shipwreck, big cartoon
eyes, eyelashes, eyebrows, smile, grin, mascot, human pose, waving,
hat, clothes, accessory, hands holding creatures, diver, extra
creature, pile of animals, different background color per frame,
visible grid, border, cropped, cut off, white background, fake
transparency, 3D render, realistic, photorealistic, hyperdetail,
motion blur, lens flare.
~~~

### Conferência

- [ ] exatamente três frames, na ordem;
- [ ] polvo, peixe e caranguejo reconhecíveis sem texto;
- [ ] nenhuma criatura tem expressão de personagem;
- [ ] nenhuma criatura traz coral, pedra ou fundo junto;
- [ ] nenhuma criatura contém letra, marca ou nome;
- [ ] todas possuem peso visual semelhante;
- [ ] a transparência é real e não há sangria.

---

# 7. `cover-o-cofre-dos-registros.png`

## Função

A capa deve mostrar o laço aprovado: **uma criatura + uma ficha com espaços de campo + uma etiqueta sendo colocada + a cápsula-cofre começando a abrir**. Não deve sugerir caça a bichos escondidos nem arraste; a etiqueta pode estar visualmente sobre um campo, sem mão puxando.

O texto real `CRIATURA`, `COR`, `LOCAL` e os valores não são gerados na capa, porque textos de imagem costumam sair errados. A plataforma escreve o título; o jogo escreve as palavras exatas em runtime. Se for importante mostrar os nomes de campo na capa, compor depois a partir de uma captura aprovada da interface, não pedir ao gerador que invente letras.

| Campo | Valor |
|---|---|
| dimensão | 1672 × 941 |
| opacidade | fundo opaco |
| topo | 17% livre para o título |
| foco | ficha grande e etiqueta |
| cápsula-cofre | secundária, mas visível |
| texto | nenhum no PNG |

### Prompt copiável

~~~text
Cover illustration for a friendly children's educational game about
named fields in a record, exactly 1672 by 941 pixels, wide landscape,
fully opaque. No title and NO writing of any kind.

Inside a cozy small undersea research observation post, show one large
simple ORANGE OCTOPUS on the left as the creature being catalogued,
calmly framed by a plain round observation ring. At center-right, show
a large warm-cream record sheet with three CLEAR BLANK FIELD ROWS, all
the same neutral color and large enough for game text to be overlaid
later. One small orange value tag is settling gently into the matching
blank row. The row gains a restrained cyan outline only at the moment
of placement. On the far left behind the octopus, a compact blue-gray
ARCHIVE SAFE with a round pressure door has one of three small bolts
softly glowing and its door beginning to open. No facial features on
the safe, no cartoon face on the octopus.

Dark desaturated deep water beyond the hull, warm interior lamp light
inside, so the cream record sheet is the brightest thing in the image.
The story reads visually from creature to organized record to opening
safe. Keep the upper seventeen percent calm for the title rendered
separately by the platform. Flat polished 2D children's game art, dark
navy outlines #203149, broad matte colors, one gentle shadow, clear
composition on mobile.

Negative: title, text, letters, numbers, fake writing, filled-in record
values, many creatures to search, dragging hand, diver, person, face,
big cartoon eyes, smile, mascot, treasure chest, shipwreck, shark,
monster, military submarine, weapon, alarm, glowing correct answer
before action, green check, red X, logo, watermark, border, white
margin, cropped safe, bright saturated turquoise, photorealistic,
3D render, hyperdetail, motion blur.
~~~

### Conferência

- [ ] reconhece-se criatura, ficha e cápsula-cofre;
- [ ] a capa sugere **preencher**, não procurar bichos escondidos;
- [ ] a ficha não contém texto falso;
- [ ] a cápsula não possui rosto e a criatura não é personagem;
- [ ] o papel creme é o ponto mais claro da imagem;
- [ ] o topo aceita título;
- [ ] a capa retrata o jogo testado, não uma mecânica abandonada.

---

## 8. O que permanece em Graphics e Text

| Elemento | Motivo |
|---|---|
| quatro campos da ficha | número e valores variam |
| rótulos CRIATURA/COR/LOCAL/SITUAÇÃO | devem ser corretos e nítidos |
| aro de observação | pisca quando a criatura chega e não pode depender do fundo |
| etiqueta selecionada | muda de posição e estado |
| valores corretos ou antigos | vêm dos dados do nível |
| três ferrolhos | precisam abrir separadamente |
| TRAVA e dica | reagem à tentativa |
| comparação antes/depois | deriva da ficha editada |
| fichas dentro da cápsula | quantidade depende das fases concluídas |
| brilho, selo, estrelas, `?` | interface compartilhada |

Não fazer uma ficha “bonita” inteira como imagem e escrever valores por cima:
o texto ficaria preso a linhas inventadas pelo gerador e a atualização do N3
pareceria um remendo. A ficha deve ser uma só construção em Graphics/Text.

---

## 9. Fallback e carregamento

Sem arquivos, o nível 1 deve funcionar:

| Textura ausente | Fallback |
|---|---|
| posto | painéis de casco e bancada em Graphics, água escura em degradê |
| cápsula-cofre | círculo metálico com porta e três marcas em Graphics |
| criaturas | pictogramas geométricos + rótulo de texto |
| capa | não necessária para rodar; catálogo fica `draft` |

Não usar emoji como placeholder. O rótulo de texto é provisório e permanece
legível. A arte entra por `import.meta.glob`, nunca por import estático de
arquivo inexistente:

~~~ts
const ART = import.meta.glob(
  '../../../../assets/games/EF04CO02/o-cofre-dos-registros/*.png',
  { eager: true, import: 'default' },
) as Record<string, string>
~~~

`BootScene` ignora `cover-` e consulta `textures.exists(key)` antes de
usar cada sprite.

| Chave | Arquivo | Frame |
|---|---|---|
| `vault-room` | `bg-posto-do-fundo-do-mar.png` | imagem |
| `vault-safe` | `cofre-do-arquivo.png` | 512 × 512 |
| `vault-life` | `criaturas-avistadas.png` | 256 × 256 |

Frames:

~~~ts
const SAFE_FRAME = { closed: 0, open: 1 } as const
const LIFE_FRAME = { octopus: 0, fish: 1, crab: 2 } as const
~~~

---

## 10. Entrega técnica

| Item | Regra |
|---|---|
| formato | PNG-24 |
| alfa real | cápsula-cofre e criaturas |
| opaco | fundo e capa |
| grade | sem linhas ou sangria |
| margem nas folhas | mínimo 9% |
| texto/números em PNG | proibidos |
| iluminação | alto à esquerda |
| peso-alvo folha de criaturas | até 400 KB |
| peso-alvo folha da cápsula | até 700 KB |
| peso-alvo fundo/capa | até 1,5 MB |

Se o gerador entregar fundo branco em sprite transparente, refazer sobre
magenta `#FF00FF` e remover a cor, conferindo halos. Medir a caixa alfa
de todos os frames antes de ajustar `setScale` e origem. Não supor que
o desenho preenche toda a célula.

---

## 11. Ordem de produção

### Primeiro corte, só nível 1

1. implementar a interação com placeholders;
2. produzir `criaturas-avistadas.png`;
3. produzir `cofre-do-arquivo.png`;
4. produzir `bg-posto-do-fundo-do-mar.png`;
5. conferir no celular se o papel creme vence a água escura;
6. testar a ficha e a cápsula no celular.

### Após aprovação do nível 1

7. implementar N2 e N3 usando as mesmas três criaturas;
8. ajustar telas de correção e atualização;
9. produzir `cover-o-cofre-dos-registros.png` por último.

Não gerar pessoas, mergulhadores, baús, relógio ou criaturas adicionais
para “enriquecer” o cenário. Eles aumentariam volume sem mudar a habilidade.
A tartaruga que aparece como distrator no N2 é **palavra na etiqueta**, não
desenho: só três criaturas são ilustradas.

---

## 12. Checklist final

### Lista

- [ ] exatamente quatro arquivos planejados;
- [ ] fundo e capa opacos;
- [ ] cápsula-cofre 2 × 1 com alfa;
- [ ] criaturas 3 × 1 com alfa;
- [ ] nenhum PNG contém letra, número ou nome;
- [ ] jogo roda com zero PNG.

### BNCC e clareza

- [ ] os campos nomeados são código, não imagem;
- [ ] a ficha é grande no celular;
- [ ] nenhum PNG indica o campo correto;
- [ ] nenhuma criatura vem com o cenário do seu LOCAL junto;
- [ ] a cápsula abre depois do registro, nunca por tempo;
- [ ] não há bicho escondido ou arraste;
- [ ] o antes/depois do N3 é visível.

### Consistência de arte

- [ ] cápsula aberta e fechada são o mesmo objeto;
- [ ] base, volante e corpo alinham;
- [ ] interior aberto está livre para as fichas de código;
- [ ] três criaturas têm peso visual semelhante;
- [ ] nenhuma cápsula ou criatura tem rosto de personagem;
- [ ] a água é escura e dessaturada em todos os PNGs;
- [ ] fundo deixa livre a área da ficha e da bandeja;
- [ ] capa é feita depois do teste real.
