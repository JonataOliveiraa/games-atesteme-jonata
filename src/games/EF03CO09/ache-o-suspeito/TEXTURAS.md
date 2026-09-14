# Ache o Suspeito — TEXTURAS.md

Este documento especifica a arte do jogo descrito em
[PLANEJAMENTO.md](./PLANEJAMENTO.md).

A câmera mostra diretamente a sala e as placas, como se fossem os olhos do
jogador. Não há corpo, mãos, lançador ou personagem em primeiro plano. Ao tocar
numa placa, uma bolinha de papel surge na borda inferior e voa automaticamente
até ela.

A “foto do usuário” é apenas o avatar fictício de Nina, personagem do jogo. O
jogo nunca solicita webcam, upload, nome ou fotografia real da criança.

---

## 0. Lista fechada de arquivos

| Arquivo | Dimensão | Grade | Fundo | Uso |
|---|---:|---:|---|---|
| `bg-sala-de-alvos.png` | 1672 × 941 | imagem única | opaco | sala de aula com janelas e área central livre |
| `bolinha-de-papel.png` | 1024 × 256 | 4 × 1 | transparente | surgimento, voo e impacto |
| `foto-usuario.png` | 256 × 256 | imagem única | transparente | avatar fictício identificado como VOCÊ |
| `destinos-da-rede.png` | 1024 × 512 | 4 × 2 | transparente | professora, grupo, site escolar e público |
| `dados-suspeitos.png` | 768 × 768 | 3 × 3 | transparente | pictogramas das informações |
| `cover-ache-o-suspeito.png` | 1672 × 941 | imagem única | opaco | capa fiel ao jogo |
| `placa-de-madeira.png` | 1600 × 700 | 2 × 1 | transparente | **PEDIDA — §7**, a moldura pendurada, larga e estreita |
| `bandeja-de-papeis.png` | 512 × 256 | imagem única | transparente | **PEDIDA — §7**, de onde a bolinha sai |

**Total: oito arquivos** — seis entregues, dois pedidos em §7.

Trajetória da bolinha, rastro, poeira da queda, faíscas, anel de mira, fios das
placas, faixa de dica, cadeado, HUD, vidas e estrelas são feitos em
`Phaser.GameObjects.Graphics` e `Phaser.Text`.

Não produzir texturas de:

- mãos ou braços;
- personagem visto de costas;
- estilingue, lançador ou qualquer arma;
- trilhos, ganchos, cordas ou suportes para perguntas;
- alvos desenhados sobre pessoas.

---

## 1. Leitura visual da tela

A tela deve ser entendida nesta ordem:

~~~text
JANELAS E SALA DE AULA
        ↓
PLACAS DIGITAIS FLUTUANDO NA ÁREA CENTRAL
        ↓
TOQUE DO JOGADOR EM UMA PLACA
        ↓
BOLINHA SURGE EMBAIXO E VOA SOZINHA
        ↓
IMPACTO NA PRÓPRIA PLACA
~~~

> **Revisto em 12/09/2026 (ver §7).** As placas passaram a ser objetos FÍSICOS
> pendurados por dois fios, porque elas caem quando a suspeita é acertada — e
> nada que flutue sozinho pode cair. O fundo continua sem trilhos, ganchos ou
> furos: quem desenha os fios é o código, e eles nascem da borda superior da
> própria placa.

### O alvo é a situação, nunca a pessoa

A placa inteira representa uma situação de compartilhamento. O título “Ache o
Suspeito” significa encontrar o compartilhamento suspeito ou arriscado. Pessoas
aparecem apenas dentro dos pictogramas que explicam origem e destino da
informação; nunca recebem mira ou impacto.

### O clique já escolhe e lança

Não existe mira manual, força, ângulo ou erro de pontaria. O jogador toca na
placa desejada e o código:

1. congela o movimento das placas;
2. cria a bolinha em `(640, 684)` no palco lógico de 1280 × 720;
3. faz uma curva suave até o centro da placa em cerca de 0,45 s;
4. mostra o impacto e avalia a escolha.

Assim, o desafio está em compreender o risco do compartilhamento, alinhado à
EF03CO09, e não em dominar física de lançamento.

---

## 2. Estilo comum

- ilustração 2D infantil;
- sala de aula acolhedora e reconhecível;
- formas largas, arredondadas e legíveis no celular;
- contorno azul-marinho escuro;
- cores planas e alegres;
- uma sombra suave;
- pequeno brilho vindo do alto à esquerda;
- luz natural entrando pelas janelas;
- tecnologia sem marcas;
- ambiente organizado, mas vivido;
- nenhuma aparência de estande de tiro;
- nenhuma renderização 3D ou fotorrealista.

O clima é de uma brincadeira escolar com bolinhas de papel. Não é uma cena de
combate, punição ou destruição.

---

## 3. Negativo comum

~~~text
Negative: text, letters, numbers, words, title, caption, real address,
phone number, school name, license plate characters, username, logo,
watermark, signature, hand, arm, body, first-person hands, child seen from
behind, launcher, slingshot, elastic band, gun, firearm, weapon, bow, arrow,
rock, stone, ammunition, physical question holder, hanging rail, card rail,
hook, clip, pin, cable holding a card, target on a person, crosshair on a face,
projectile toward a person, explosion, fire, broken glass, injury, blood,
hacker, hood, mask, criminal, scary stranger, red eyes, crying child, prison,
dark shooting range, carnival gun range, visible grid line, cell label,
border, cropped, cut off, merged cells, white background on transparent asset,
fake transparency, checkerboard painted into image, 3D render, realistic,
photorealistic, hyperdetail, glossy plastic, motion blur, lens flare.
~~~

---

## 4. Paleta

| Uso | Cor |
|---|---|
| contorno | `#203149` |
| azul principal | `#3B82C4` |
| ciano de movimento | `#43B8D8` |
| roxo secundário | `#7357A6` |
| coral | `#D9635C` |
| âmbar de atenção | `#F4B942` |
| verde da reciclagem | `#4EAA78` |
| papel | `#F5F3EA` |
| parede | `#F2E9D8` |
| madeira clara | `#C99466` |
| pele de Nina | `#B97852` |
| silhueta pública | `#8798AC` |

As placas começam sempre neutras. A arte não deve marcar previamente qual
opção é segura ou perigosa.

---

# 5. `bg-sala-de-alvos.png`

## Função

É o plano de fundo principal. Precisa comunicar imediatamente “sala de aula” e
oferecer uma grande área limpa para as placas digitais criadas pelo código.

| Campo | Valor |
|---|---|
| dimensão | 1672 × 941 |
| fundo | opaco |
| câmera | frontal, na altura dos olhos da criança |
| área livre principal | x 8%–92%, y 14%–69% |
| faixa de lançamento | x 35%–65%, y 88%–100% |
| conteúdo interativo pintado | nenhum |

## Composição

- duas janelas largas, uma em cada lateral, com céu claro e árvores suaves;
- parede escolar clara ocupando o centro;
- painel central grande de cortiça macia ou espuma, integrado à parede e vazio;
- quadro, estante baixa, carteiras ou materiais apenas nas bordas;
- chão de madeira clara aparecendo na faixa inferior;
- pequena caixa de reciclagem decorativa no canto, sem competir com o jogo;
- iluminação diurna, acolhedora e sem sombras dramáticas.

O painel central não é um suporte para as perguntas. Ele é somente parte
arquitetônica da parede e funciona como fundo visual. Não pode conter trilhos,
ganchos, prendedores, cordas, pinos, furos alinhados ou espaços marcados para
cartões.

Não pintar:

- placas, perguntas ou respostas;
- círculos de alvo, mira ou pontuação;
- bolinha de papel;
- pessoas, mãos ou braços;
- qualquer mecanismo que pareça segurar as placas.

## Prompt copiável

~~~text
A bright welcoming elementary-school classroom background for a harmless
children's educational paper-ball target activity, exactly 1672 by 941 pixels,
landscape, fully opaque and filling the entire canvas.

Front-facing view from a child's eye height. A warm cream classroom wall
#F2E9D8 fills the center. Place one broad empty soft cork or foam wall panel
integrated flat into the architecture, with rounded corners and no fixtures.
It is only a calm visual backdrop, not a holder. Add two large sunny classroom
windows, one near the far left and one near the far right, showing pale blue
sky, soft green tree shapes and daylight. Keep recognizable classroom details
such as a low bookshelf, a globe, stacked notebooks, pencil cups and the edges
of a few desks only at the extreme sides. Show a warm light wooden floor in
the lower 24 percent and a small friendly recycling bin at the far lower
right.

Keep x=8 to 92 percent and y=14 to 69 percent especially calm, broad and
unobstructed for two or three large digital question cards added later by the
game. Keep the lower center clear so a paper ball can appear and fly upward.
Nothing in the scene physically holds cards.

The mood is a playful supervised classroom challenge using harmless crumpled
paper, never combat and never a shooting range. Flat polished 2D children's
game illustration, chunky rounded architecture, thick dark navy accents
#203149, broad matte colors, gentle upper-left daylight, one soft ambient
shadow, friendly, readable and uncluttered.

Negative: message card, question panel, answer panel, text, letters, numbers,
target circle, bullseye, crosshair, score target, hanging rail, card rail,
hook, clip, clothespin, pin, rope, cable, wire holding anything, frame slots,
paper ball, projectile, hand, arm, person, child, player body, launcher,
slingshot, gun, firearm, weapon, rock, arrow, dark range, carnival booth,
prison, hacker, scary character, logo, watermark, button, HUD, border, white
margin, 3D render, realistic, photorealistic, hyperdetail, lens flare.
~~~

## Conferência

- [ ] parece claramente uma sala de aula;
- [ ] as duas janelas estão visíveis;
- [ ] o centro está livre e com bom contraste;
- [ ] não há trilhos, suportes, ganchos ou prendedores;
- [ ] não há placas ou alvos já desenhados;
- [ ] não há mãos, corpo ou personagem;
- [ ] o cenário é alegre e não agressivo;
- [ ] três placas de 320 × 310 cabem sem cobrir elementos importantes.

---

# 6. `bolinha-de-papel.png`

## Função

É o único objeto visível do lançamento. Surge na parte inferior depois do
clique, cruza a tela automaticamente e atinge a placa selecionada.

| Campo | Valor |
|---|---|
| dimensão | 1024 × 256 |
| grade | 4 × 1 |
| célula | 256 × 256 |
| fundo | alfa real |
| pivô | centro |
| preenchimento | 62%–70% |

| Frame | Estado | Uso |
|---:|---|---|
| 0 | surgindo | início na borda inferior |
| 1 | voando | rotação inicial |
| 2 | voando | rotação intermediária |
| 3 | impacto | papel suavemente achatado |

Os frames 1 e 2 alternam durante o tween para sugerir giro. A trajetória e um
rastro ciano discreto são desenhados pelo código depois do toque; não fazem
parte do PNG.

## Prompt copiável

~~~text
Sprite sheet with exactly 4 harmless crumpled-paper-ball frames in one strict
horizontal row. Each frame is exactly 256 by 256 pixels; total image exactly
1024 by 256 pixels. True transparent background, no visible grid lines, no
cell backgrounds and no bleed.

The exact same white-cream school paper ball #F5F3EA appears in every frame.
Use a thick dark navy outline #203149, a soft irregular round silhouette,
four or five broad pale-blue fold lines, one soft inner shadow and one small
upper-left highlight. The paper is blank, with no writing or notebook lines.
Center each frame with generous margins and consistent visual mass.

Frames from left to right:
1. APPEARING: compact round crumpled ball, approximately 64 percent cell fill.
2. FLYING A: the same ball rotated about 30 degrees.
3. FLYING B: the same ball rotated about 75 degrees with all folds following
   the rotation.
4. IMPACT: the same soft paper ball compressed horizontally by about
   18 percent, intact and harmless, with no explosion or fragments.

No hand, arm, launcher, elastic, target, trail or speed line in any frame.

Negative: hand, fingers, arm, launcher, slingshot, elastic band, sheet of
paper, paper airplane, text, letters, numbers, notebook lines, newspaper,
rock, stone, snowball, baseball, ammunition, weapon, fire, explosion, torn
fragments, target, motion line, motion blur, logo, watermark, visible grid,
border, cropped, cut off, white background behind the ball, fake
transparency, 3D render, realistic, photorealistic, hyperdetail, lens flare.
~~~

## Conferência

- [ ] a bolinha aparece nos quatro frames;
- [ ] parece papel amassado, não pedra ou bola esportiva;
- [ ] os dois frames de voo mantêm a mesma identidade;
- [ ] o impacto é macio e sem explosão;
- [ ] não há mão, braço ou lançador;
- [ ] o fundo possui transparência real;
- [ ] continua reconhecível a 48 × 48.

---

# 7. `foto-usuario.png`

## Função e privacidade

É o pequeno avatar fictício exibido no HUD com o rótulo **VOCÊ**, criado pelo
código. Ele ajuda a criança a distinguir “meu dado” de “dado do colega”.

| Campo | Valor |
|---|---|
| dimensão | 256 × 256 |
| fundo | alfa real |
| conteúdo | retrato fictício de Nina |
| enquadramento | cabeça e ombros |
| moldura e texto | não incluídos |

Não oferecer webcam, seletor de arquivo, campo de nome, geração de rosto ou
armazenamento de imagem.

## Prompt copiável

~~~text
One square illustrated fictional user-profile avatar for a children's
educational digital-safety game, exactly 256 by 256 pixels, true transparent
background.

Friendly fictional eight-year-old Brazilian child Nina shown from the front,
head and shoulders only. Warm light-brown skin #B97852, short dark curly hair
with one small coral hair clip, teal T-shirt collar #3B9D9A, calm neutral
smile and direct friendly gaze. Centered, balanced and readable at 64 pixels.
No photographic realism.

No frame, badge, username, word or background card. The game adds a circular
HUD frame and the label VOCÊ in code. This is a supplied fictional character,
not a real child photograph.

Flat 2D cartoon portrait, chunky rounded shapes, thick dark navy outline
#203149, broad flat colors, one soft inner shadow and small upper-left
highlight, warm, inclusive and non-identifiable.

Negative: real photograph, photorealistic child, identifiable real person,
camera, webcam, upload icon, username, name, text, letters, numbers, address,
phone, school logo, social network logo, frame, circular badge, green check,
red X, target, crosshair, paper ball, launcher, frightened face, crying,
watermark, signature, cropped hair, cut off shoulders, white background,
fake transparency, 3D render, realistic, hyperdetail, lens flare.
~~~

## Conferência

- [ ] parece avatar ilustrado, não fotografia real;
- [ ] não contém moldura, nome ou texto;
- [ ] continua legível em 64 × 64;
- [ ] não contém mira ou bolinha;
- [ ] nunca sugere que o jogo pede uma foto real.

---

# 8. `destinos-da-rede.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão | 1024 × 512 |
| grade | 4 × 2 |
| célula | 256 × 256 |
| fundo | alfa real |
| linha 0 | aguardando |
| linha 1 | recebeu uma cópia |
| ordem | professora, grupo conhecido, site escolar, público desconhecido |

| Coluna | Neutro | Recebeu |
|---:|---:|---:|
| professora | 0 | 4 |
| grupo conhecido | 1 | 5 |
| site escolar | 2 | 6 |
| público desconhecido | 3 | 7 |

Esses ícones aparecem dentro das placas e na prévia de impacto. Pessoas são
destinos representados, nunca alvos físicos da bolinha.

## Prompt copiável

~~~text
Sprite sheet with exactly 8 digital-sharing destination icons in a strict
4-column by 2-row grid. Each frame is exactly 256 by 256 pixels; total image
exactly 1024 by 512 pixels. True transparent background, no visible grid
lines, no cell backgrounds, no labels and no bleed.

Consistent flat 2D cartoon style, chunky rounded forms, thick dark navy outline
#203149, broad flat colors, one soft inner shadow, upper-left highlight,
centered with equal visual weight and readable at 64 pixels.

Top row, waiting:
1. Friendly adult woman teacher bust with medium-brown skin, dark hair in a
   low bun, round blue glasses and yellow cardigan.
2. Compact group of three diverse friendly child bust portraits, clearly a
   known class group.
3. Simple browser-window pictogram containing a small school building and a
   blank image tile, with no web address or writing.
4. Cluster of three neutral gray-blue head-and-shoulder silhouettes #8798AC,
   each with a small abstract question-mark-shaped opening, calm and not scary.

Bottom row: received states of the exact same four, with identical geometry
and only a small cyan outline pulse around the complete icon. Receiving is not
automatically correct or wrong. Do not add a data token, check, cross, warning,
impact mark or target.

Negative: text, letters, numbers, school name, URL, logo, watermark,
smartphone, data token, address, phone, green check, red X, warning sign,
target, bullseye, crosshair, paper ball, projectile toward face, impact on
person, hacker, hood, mask, criminal, weapon, evil smile, red eyes, crying,
visible grid, border, cropped, cut off, different paired geometry, white
background, fake transparency, 3D render, realistic, photorealistic,
hyperdetail, motion blur.
~~~

## Conferência

- [ ] os pares neutro/recebeu alinham;
- [ ] nenhuma pessoa possui alvo ou marca de impacto;
- [ ] o público desconhecido é neutro, não assustador;
- [ ] o site escolar não contém escrita;
- [ ] o estado “recebeu” não entrega sozinho a resposta;
- [ ] todos os ícones funcionam a 64 × 64.

---

# 9. `dados-suspeitos.png`

## Especificação

| Campo | Valor |
|---|---|
| dimensão | 768 × 768 |
| grade | 3 × 3 |
| célula | 256 × 256 |
| fundo | alfa real |
| preenchimento | 68%–75% |

| Frame | Informação |
|---:|---|
| 0 | endereço: casa + localização |
| 1 | telefone sem número |
| 2 | localização ao vivo |
| 3 | rotina escolar |
| 4 | identificação de veículo |
| 5 | foto de grupo genérico |
| 6 | história ou apelido de colega |
| 7 | desenho ou projeto escolar |
| 8 | preferência simples |

## Prompt copiável

~~~text
Sprite sheet with exactly 9 information pictograms in a strict 3-column by
3-row grid. Each frame is exactly 256 by 256 pixels; total image exactly
768 by 768 pixels. True transparent background, no visible grid, no cell
backgrounds, no labels and no bleed.

Draw nine simple independent information-type pictograms for a children's
digital-safety game. Thick dark navy outline #203149, chunky rounded shapes,
broad flat colors, one soft inner shadow, small upper-left highlight, centered,
about 72 percent cell fill and readable at 64 pixels. No target or badge.

Row 1:
1. Small house beside a generic map pin, no address or number.
2. Telephone handset beside a blank contact card, no digits.
3. Generic child silhouette over a folded map with pin and location rings.

Row 2:
4. School building beside an analog clock with tick marks but no numbers or
   exact time.
5. Friendly car front with a completely blank license-plate rectangle.
6. Horizontal photo containing three generic diverse child bust silhouettes.

Row 3:
7. Two blank speech bubbles beside one gently uncomfortable face, no nickname.
8. Sheet with sun, mountain and abstract project shapes, no writing.
9. Friendly dog-face pictogram beside a coral heart, no name.

All frames have equal finish and do not mark safe or risky.

Negative: text, letters, numbers, real address, phone digits, exact clock time,
license plate characters, school name, signature, logo, watermark, green
check, red X, warning, lock, shield, target, bullseye, crosshair, paper ball,
category color background, identifiable face, hacker, hood, mask, criminal,
visible grid, border, cropped, cut off, merged cells, white background,
fake transparency, 3D render, realistic, photorealistic, hyperdetail,
motion blur, lens flare.
~~~

## Conferência

- [ ] nove frames na ordem;
- [ ] nenhum dado pessoal real aparece;
- [ ] nenhum pictograma recebe alvo;
- [ ] a foto usa rostos genéricos;
- [ ] relógio e placa não possuem caracteres;
- [ ] opções seguras e perigosas têm o mesmo acabamento.

---

# 10. `cover-ache-o-suspeito.png`

## Composição

A capa deve parecer a própria tela do jogo:

- sala de aula acolhedora, com janelas laterais;
- parede central livre;
- três placas digitais flutuando sem suportes;
- bolinha de papel voando da borda inferior até a placa central;
- pequeno avatar fictício no HUD;
- nenhuma mão, corpo, lançador ou personagem visto de costas;
- nenhuma pessoa usada como alvo.

A bolinha é o foco de ação. Uma curva ciana curta atrás dela pode sugerir o
movimento automático, mas não deve parecer mira ajustável.

## Prompt copiável

~~~text
A polished cover illustration for a children's educational digital-safety
game called Ache o Suspeito, exactly 1672 by 941 pixels, landscape, fully
opaque. Do not draw the title or any words.

Clean player-eye camera facing a cheerful elementary-school classroom. There
is no visible player body. Show two large sunny windows at the far left and
right, a warm cream wall, a broad empty soft cork or foam backdrop integrated
flat into the central wall, classroom shelves and desk edges only near the
sides, and a warm light wooden floor.

Three large rounded DIGITAL question cards float freely across the central
area. They have no rails, hooks, clips, cables, stands or physical holders.
The cards contain pictograms but no text:
- left: a child's drawing shared with a friendly teacher;
- center: a house-and-location information icon shared toward neutral
  unknown-public silhouettes;
- right: a school project shared with a school-site icon.

One clearly crumpled white-cream paper ball flies upward from the lower center
toward the CENTER CARD ITSELF. Show a short soft cyan curved motion trail behind
the ball. The center card begins to fold gently at one corner on impact.
Behind that card, small translucent copies of the house icon branch toward the
public-destination symbol, showing that shared information can spread. The
ball never travels toward a person or face.

At the upper-left, include one small circular profile HUD containing the
fictional illustrated portrait of Nina, a light-brown-skinned child with short
dark curly hair, coral hair clip and teal shirt. It is secondary to the action.
Keep the upper 12 percent calm enough for the platform title overlay.

Flat 2D cartoon children's educational game cover, chunky rounded shapes,
thick dark navy outline #203149, blue #3B82C4, cyan #43B8D8, purple #7357A6,
coral #D9635C and cream paper #F5F3EA, broad matte colors, gentle daylight,
one soft shadow, polished, playful, safe, inclusive and uncluttered. It must
read as a school activity with harmless crumpled paper, never a shooting range.

Negative: visible player, hand, fingers, arm, body, child seen from behind,
head or shoulders at bottom, launcher, slingshot, elastic band, gun, firearm,
weapon, bow, arrow, rock, stone, title, text, letters, numbers, address, phone
number, username, school name, logo, watermark, hanging rail, card rail, hook,
clip, pin, cable holding cards, card stand, bullseye on person, crosshair on
face, projectile toward person, explosion, fire, broken glass, injury,
frightened person, hacker, hood, mask, criminal, police, scary stranger, dark
shooting range, carnival booth, realistic photo, camera upload, green check,
red X, border, white margin, cropped ball, 3D render, photorealistic,
realistic, hyperdetail, motion blur, lens flare.
~~~

## Conferência

- [ ] a sala de aula e as janelas são reconhecíveis;
- [ ] não há mãos, braços, corpo ou personagem de costas;
- [ ] não há lançador;
- [ ] a bolinha de papel está grande e reconhecível;
- [ ] a bolinha termina na placa, não numa pessoa;
- [ ] as três placas flutuam sem trilhos ou suportes;
- [ ] o avatar fictício está presente no canto;
- [ ] a cena não parece agressiva;
- [ ] o topo aceita o título da plataforma.

---

# 11. O que permanece em Graphics e Text

| Elemento | Implementação | Motivo |
|---|---|---|
| placas digitais | painéis arredondados | quantidade e posição variam |
| texto das situações | `Phaser.Text` | precisa ser legível e editável |
| rótulos de origem/destino | texto + sprites | contexto muda por onda |
| consentimento | selo textual neutro | precisa ser explícito |
| fundo suave da placa | `Graphics` | estado visual varia |
| movimento das placas | tweens | níveis 2 e 3 |
| trajetória da bolinha | curva calculada | depende da placa tocada |
| rastro ciano | `Graphics` com fade | nasce somente depois do clique |
| hitbox | retângulo ampliado | acessibilidade |
| impacto na placa | squash, brilho e máscara | feedback imediato |
| placa dobrada | máscara/polígono | acerto pedagógico |
| caixa de reciclagem | `Graphics` | recebe a situação bloqueada |
| cópias no mapa de impacto | sprite do dado + curvas | mostra propagação |
| avatar no HUD | moldura + `foto-usuario` | identifica VOCÊ |
| cadeado e dica | `Graphics` + texto | padrão de TRAVA |
| HUD e resultado | componentes compartilhados | padrão do catálogo |

### Ordem visual durante o clique

1. o movimento das placas pausa;
2. a placa tocada recebe contorno ciano curto;
3. `bolinha-de-papel` frame 0 surge em `(640, 684)`;
4. a bolinha percorre uma curva até o centro da placa;
5. frames 1 e 2 alternam para sugerir rotação;
6. um rastro ciano discreto desaparece atrás dela;
7. no contato, usa frame 3 por 100 ms;
8. o jogo mostra acerto ou TRAVA;
9. nenhuma mão ou ferramenta aparece em qualquer etapa.

A trajetória é determinística. Depois de escolhida a placa, a bolinha sempre
atinge aquela placa.

---

# 12. Antes da arte existir

O nível 1 deve funcionar integralmente com placeholders:

| Objeto | Placeholder |
|---|---|
| fundo | sala clara, duas janelas e parede central vazia |
| bolinha | círculo creme irregular com quatro linhas de dobra |
| foto do usuário | busto fictício com rótulo VOCÊ |
| destinos | bustos e janela escolar simplificados |
| dados | pictogramas vetoriais simples |
| placas | retângulos arredondados flutuantes |

Nenhum placeholder usa emoji. Não desenhar trilhos, suportes, mãos ou
lançador nem temporariamente, pois esses elementos ensinariam a composição
errada antes da arte definitiva.

Testar primeiro:

- clique em qualquer ponto da placa;
- congelamento do movimento;
- curva automática da bolinha;
- impacto garantido no centro da placa;
- leitura confortável antes do movimento;
- TRAVA conceitual sem erro de pontaria;
- escala de 30% em celular.

---

# 13. Como carregar

~~~ts
const ART = import.meta.glob(
    '../../../../assets/games/EF03CO09/ache-o-suspeito/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>
~~~

`BootScene` ignora `cover-` e mantém fallback.

| Chave | Arquivo | Frame |
|---|---|---|
| `suspect-classroom` | `bg-sala-de-alvos.png` | imagem |
| `suspect-paper-ball` | `bolinha-de-papel.png` | 256 × 256 |
| `suspect-user-photo` | `foto-usuario.png` | imagem |
| `suspect-destinations` | `destinos-da-rede.png` | 256 × 256 |
| `suspect-data` | `dados-suspeitos.png` | 256 × 256 |

### Frames

~~~ts
const PAPER_BALL_FRAME = {
    appearing: 0,
    flyingA: 1,
    flyingB: 2,
    impact: 3,
} as const

const DESTINATION_FRAME = {
    teacher: 0,
    knownGroup: 1,
    schoolSite: 2,
    unknownPublic: 3,
} as const
~~~

Somar 4 ao destino para usar o estado “recebeu”.

---

# 14. Medição e integração

Após receber os assets:

1. confirmar todas as dimensões;
2. verificar alfa real nos quatro arquivos transparentes;
3. testar a bolinha a 48, 64 e 84 px;
4. comparar a identidade visual dos quatro frames;
5. confirmar que o fundo deixa as placas legíveis;
6. testar duas placas grandes nas posições do nível 1;
7. testar três placas nas posições dos níveis 2 e 3;
8. verificar se janelas e objetos laterais não parecem clicáveis;
9. testar os pictogramas de dado e destino a 64 px;
10. testar tudo a 30% de escala;
11. validar contraste em modo de movimento reduzido;
12. guardar medidas em `data/layout.ts`.

### Teste de leitura da câmera

Mostrar apenas o fundo e perguntar:

- “Onde estamos?”
- “Você vê alguma mão ou pessoa na frente?”
- “Onde podem aparecer as perguntas?”

Respostas esperadas: “numa sala de aula”, “não” e “na parede/área do meio”.

### Teste do gesto

Mostrar uma onda e pedir: “acerte a situação perigosa”. A criança deve tocar
diretamente na placa. Se tentar puxar um objeto invisível ou procurar uma arma,
a demonstração visual ainda está ambígua.

---

# 15. Entrega técnica

| Item | Regra |
|---|---|
| formato | PNG-24 |
| alfa | real em bolinha, foto, destinos e dados |
| opacos | fundo e capa |
| célula | 256 × 256 |
| margem interna | mínimo 9% |
| texto dentro de PNG | proibido |
| linha de grade | proibida |
| iluminação | alto à esquerda |
| peso por folha | até 1 MB |
| peso por opaco | até 1,5 MB |

Se precisar remover fundo, usar magenta `#FF00FF` provisoriamente e conferir
halos antes da entrega. Redimensionar folhas inteiras, nunca células separadas.

---

# 16. Ordem de produção

### Rodada 1 — jogabilidade sem arte

1. criar sala, janelas e placas com `Graphics`;
2. criar placeholder da bolinha;
3. implementar clique direto;
4. implementar voo automático;
5. confirmar que não há erro de pontaria;
6. testar leitura em celular.

### Rodada 2 — assets pedagógicos

7. produzir `bolinha-de-papel.png`;
8. produzir `foto-usuario.png`;
9. produzir `dados-suspeitos.png`;
10. produzir `destinos-da-rede.png`;
11. integrar as três ondas do nível 1.

### Rodada 3 — ambiente

12. produzir `bg-sala-de-alvos.png`;
13. testar contraste real das placas;
14. verificar janelas e área central;
15. remover qualquer detalhe que pareça suporte ou alvo físico.

### Rodada 4 — acabamento

16. fazer teste com criança/adulto mediador;
17. ajustar tamanho da bolinha e tempo do voo;
18. produzir `cover-ache-o-suspeito.png` por último;
19. conferir fidelidade entre capa e jogo.

Não produzir o movimento dos níveis seguintes antes de aprovar o nível 1
estático e o entendimento da habilidade.

---

# 17. Checklist final

## Lista e câmera

- [ ] existem exatamente seis arquivos;
- [ ] há uma textura própria da bolinha de papel;
- [ ] há um avatar fictício do usuário;
- [ ] não há textura de mão, braço ou corpo;
- [ ] não há textura de lançador;
- [ ] não há personagem de costas;
- [ ] não existe captura de foto real.

## Cenário

- [ ] é uma sala de aula clara;
- [ ] há janelas visíveis;
- [ ] a parede central está livre;
- [ ] não há trilhos, suportes, ganchos ou prendedores;
- [ ] não há perguntas pintadas no fundo;
- [ ] não há círculos de alvo ou mira;
- [ ] o cenário não parece agressivo.

## Bolinha e interação

- [ ] a bolinha parece papel amassado;
- [ ] surge na borda inferior após o clique;
- [ ] voa automaticamente até a placa tocada;
- [ ] sempre atinge a placa selecionada;
- [ ] não há força ou ângulo manual;
- [ ] não há tiro perdido;
- [ ] o impacto não explode nem quebra objetos.

## Segurança pedagógica

- [ ] somente a placa recebe o impacto;
- [ ] nenhuma pessoa recebe mira ou bolinha;
- [ ] “suspeito” significa situação de compartilhamento;
- [ ] desconhecidos são representados de modo neutro;
- [ ] opções seguras e perigosas começam com visual igual;
- [ ] a consequência mostra o alcance da informação;
- [ ] o avatar não contém dado real.

## Folhas e integração

- [ ] bolinha 4 × 1;
- [ ] destinos 4 × 2;
- [ ] dados 3 × 3;
- [ ] frames estão na ordem;
- [ ] transparência é real;
- [ ] nenhum PNG contém texto ou linhas de grade;
- [ ] o jogo funciona com placeholders;
- [ ] o nível 1 é validado antes dos movimentos.

## Capa

- [ ] mostra sala de aula e janelas;
- [ ] mostra três placas sem suportes;
- [ ] mostra uma bolinha em voo;
- [ ] não mostra mãos, corpo ou lançador;
- [ ] a bolinha termina na placa;
- [ ] nenhuma pessoa é alvo;
- [ ] o avatar fictício aparece como elemento secundário;
- [ ] o topo fica livre para o título.

---

## 18. Resumo visual para geração

A imagem principal deve mostrar exatamente o que o jogador verá:

- uma sala de aula acolhedora com janelas;
- uma parede central limpa;
- duas ou três placas digitais flutuantes, sem estruturas segurando;
- uma bolinha de papel surgindo de baixo e voando sozinha até a placa tocada;
- um pequeno avatar fictício no HUD.

Se aparecer mão, braço, personagem, lançador, trilho ou suporte, a imagem não
atende ao jogo. Se a bolinha não parecer papel amassado ou estiver indo em
direção a uma pessoa, a imagem também deve ser rejeitada.

---

# 7. Folhas pedidas pela mecânica de arremesso (12/09/2026)

A mecânica mudou: as informações deixaram de ser cartões e viraram **placas
penduradas**, que recebem a bolinha e **caem** quando são a suspeita. A bolinha
deixou de nascer a cada tiro e passou a morar numa **bandeja**, de onde a
criança a puxa para trás e solta.

Duas peças novas ficaram em `Graphics` só porque o jogo precisa rodar antes da
arte chegar. **As duas são móveis parados que a criança lê como objeto, então as
duas são textura.** O desenho de reserva está no código e continua funcionando
se as folhas não vierem — mas reserva é reserva, não entrega.

O que NÃO vira textura, e por quê: os fios são duas linhas retas que o balanço
já move; a trajetória, o rastro, a poeira e as faíscas nascem e morrem em menos
de um segundo; a faixa de dica e o cabeçalho são a UI de plataforma, igual nos
49 jogos.

---

## 7.1 `placa-de-madeira.png` — 1600 × 700, grade 2 × 1, fundo transparente

### Função

A moldura pendurada no quadro da sala. O jogo desenha DENTRO dela o pictograma
do dado, a frase e a tira de destino — a textura é só a madeira e o papel
vazio, nunca o texto.

Dois quadros porque a placa tem duas larguras: o nível 1 mostra duas placas
grandes, os níveis 2 e 3 mostram três placas estreitas.

| Quadro | Célula | Proporção do corpo útil | Onde aparece |
|---:|---|---|---|
| 0 | 800 × 700 | 356 × 268 mais moldura de 17 | níveis com 2 placas |
| 1 | 800 × 700 | 245 × 268 mais moldura de 17 | níveis com 3 placas |

### Composição

- moldura de madeira clara, larga e chanfrada, com veio horizontal suave;
- borda inferior um tom mais escura, como se a luz viesse de cima;
- quatro parafusos redondos, um em cada canto da moldura;
- duas argolas metálicas no topo, onde os fios prendem — centradas a 22 px de
  cada ponta da moldura;
- por dentro, uma chapa de papel claro quase branco, com o canto superior
  levemente destacado;
- a área de papel precisa ficar LIMPA: nada de linhas, pautas, ícones ou
  sombras fortes, porque é ali que o texto do jogo entra;
- sombra própria suave por fora, deslocada para baixo e para a direita.

### Prompt copiável

~~~text
Folha de sprites 1600x700 px, grade 2 colunas x 1 linha, células de 800x700,
fundo totalmente transparente, ilustração vetorial infantil, traço escuro
uniforme, cores chapadas, sem gradiente forte, sem texto.

Cada célula mostra UMA placa de aviso escolar pendurada, vista de frente,
centrada na célula:

Célula 1 (esquerda): placa LARGA, formato deitado, corpo interno de proporção
aproximada 4:3.
Célula 2 (direita): placa ESTREITA, formato quase quadrado em pé, corpo interno
de proporção aproximada 9:10.

As duas têm exatamente os mesmos elementos:
- moldura de madeira clara cor caramelo, larga, cantos arredondados, com veios
  horizontais discretos em tom mais escuro;
- a faixa inferior da moldura um pouco mais escura que o resto;
- quatro parafusos circulares metálicos, um em cada canto da moldura;
- duas argolas metálicas pequenas no topo da moldura, próximas das pontas, como
  pontos de pendurar;
- painel interno de papel branco levemente creme, liso e VAZIO, sem nenhuma
  escrita, linha, pauta, ícone ou desenho;
- sombra suave por baixo da placa.

Nada de corda, fio, barbante, gancho, prego ou parede: só a placa recortada no
transparente. Sem pessoas, sem mãos, sem setas, sem alvo de tiro, sem números.
~~~

### Conferência

- [ ] as duas células dividem exatamente 800 px cada;
- [ ] o painel branco está completamente vazio;
- [ ] não há fio nem prego desenhado;
- [ ] as argolas ficam no topo da moldura, não no papel;
- [ ] o fundo é transparente de verdade, não branco.

---

## 7.2 `bandeja-de-papeis.png` — 512 × 256, imagem única, fundo transparente

### Função

A bandeja no chão da sala, de onde a bolinha de papel sai quando a criança toca
em JOGAR. Ela não é botão: quem dispara é a barra de controle logo abaixo.

O jogo desenha a bolinha ATIVA por cima dela, então a bandeja precisa de espaço
visual no centro para essa bolinha aparecer.

### Composição

- bandeja rasa de madeira clara, vista de cima e um pouco de frente, como uma
  caixinha de papéis de carteira escolar;
- dentro dela, duas ou três bolinhas de papel amassado PARADAS, encostadas nas
  bordas, deixando o centro livre;
- borda frontal levemente mais escura, dando profundidade;
- sombra elíptica suave embaixo.

### Prompt copiável

~~~text
Imagem única 512x256 px, fundo totalmente transparente, ilustração vetorial
infantil, traço escuro uniforme, cores chapadas, sem texto.

Uma bandeja rasa de madeira clara cor caramelo, vista de cima e ligeiramente de
frente, ocupando a largura da imagem e a metade inferior da altura. Cantos
arredondados. A borda da frente é um tom mais escura que o interior.

Dentro da bandeja, duas ou três bolinhas de papel branco amassado, pequenas,
paradas e encostadas nas laterais da bandeja — o CENTRO da bandeja fica livre,
sem nada em cima.

Sombra elíptica suave sob a bandeja.

Sem pessoas, sem mãos, sem estilingue, sem elástico, sem arma, sem alvo, sem
setas, sem texto, sem chão ou parede ao redor.
~~~

### Conferência

- [ ] o centro da bandeja está livre para a bolinha do jogo entrar ali;
- [ ] as bolinhas desenhadas são discretas e não competem com a bolinha ativa;
- [ ] não existe elástico, forquilha ou qualquer coisa que leia como estilingue;
- [ ] o fundo é transparente.
