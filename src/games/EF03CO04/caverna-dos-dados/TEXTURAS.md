# Caverna dos Dados - prompts das texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF03CO04/caverna-dos-dados/`

---

## 0. A lista

Sete arquivos: um fundo, duas folhas gerais, três folhas de dados e a capa.

| # | Arquivo | Tamanho | Grade | Para quê | Quando |
|---|---|---|---|---|---|
| 1 | `bg-caverna.png` | 1672 x 941 | — | a caverna dos dois modos | **primeiro** |
| 2 | `explorador.png` | 1400 x 1500 | 4 x 3 de 350 x 500 | dez poses, incluindo a picareta | **primeiro** |
| 3 | `objetos-caverna.png` | 1024 x 512 | 4 x 2 de 256 | bolsa, cristal especial e porta | **primeiro** |
| 4 | `dados-n1.png` | 1024 x 768 | 4 x 3 de 256 | onze pictogramas do nível 1 + reserva | **primeiro** |
| 5 | `dados-n2.png` | 1024 x 1024 | 4 x 4 de 256 | quinze pictogramas do nível 2 + reserva | depois |
| 6 | `dados-n3.png` | 1280 x 1024 | 5 x 4 de 256 | dezoito pictogramas do nível 3 + reservas | depois |
| 7 | `cover-caverna-dos-dados.png` | 1672 x 941 | — | capa do catálogo | por último |

Na primeira rodada, gerar **somente os quatro arquivos marcados como primeiro**.
O nível 1 precisa ser jogado e aprovado antes de produzir os outros.

> **O que chegou na rodada 1.** `bg-caverna` e `dados-n1` vieram no tamanho
> pedido. `explorador.png` veio em 1400 x 1000 (célula 350 x 500) e
> `objetos-caverna.png` em 1600 x 800 (célula 400 x 400). A grade e a **ordem
> dos quadros** — que é o contrato de verdade — bateram nos dois; só o lado da
> célula mudou, e ele mora no `SHEETS` do `BootScene`. Nada precisou ser
> refeito.
>
> **Rodada 2:** o `explorador.png` ganhou uma terceira linha com os quadros 8 e
> 9 (picareta erguida e batendo) e passou a 1400 x 1500. A mineração nasceu daí.
>
> **Rodada 3:** chegaram `dados-n2.png` (1024 x 1024), `dados-n3.png`
> (1280 x 1024) e a capa, os três no tamanho pedido e com a ordem dos quadros
> exatamente como as tabelas §9 e §10 mandam — conferido quadro a quadro no
> jogo. **As sete folhas estão entregues.** Achado bonito da folha n3: `7` e `8`
> viraram contagens de pedrinhas, respeitando o negativo que proíbe algarismos.

**Nada de altar, encaixe, ficha, rótulo, faixa, botão JUNTAR, cadeado, fio,
placa, seta VOLTAR, estrela, tutorial ou painel.** Tudo isso é `Graphics` e
texto Phaser, pois muda de estado, quantidade ou conteúdo a cada galeria.

---

## 1. A regra que não pode ser quebrada

> **A arte nunca revela quais dados pertencem à mesma informação.**

Corretos e intrusos têm exatamente a mesma moldura de código, peso visual,
saturação, brilho e acabamento. Não usar verde para os corretos, vermelho para
os intrusos, fundo por grupo, halo de família ou objetos corretos olhando uns
para os outros.

A criança separa `sábado`, `10h`, `praça` e `piquenique` de `bola` pelo que os
dados dizem, não pelo que a folha insinua. Se os quatro corretos forem azuis e
o intruso for vermelho, o jogo vira o teste da bolinha que o planejamento
reprovou.

Regras práticas:

- cada pictograma usa sua cor natural;
- cores repetidas ficam espalhadas entre dados corretos e intrusos;
- todos ocupam aproximadamente 76% do quadro;
- todos têm a mesma espessura de contorno e a mesma sombra;
- nenhum pictograma traz palavra, letra ou número;
- os rótulos `quarta`, `14h`, `festa azul` e outros são texto do código;
- a ordem dos quadros é contrato com `frame` em `data/levels.ts`.

---

## 2. Estilo comum

```text
Flat 2D cartoon educational game asset for children, chunky rounded shapes, bold
readable silhouette, thick dark navy outline #1F2A37, cheerful but controlled colors,
flat color areas with one soft inner shadow and one small white gloss highlight,
minimal detail, instantly readable at small mobile size, friendly polished storybook
game art, no text.
```

## 3. Negativo comum

```text
3D render, realistic, photorealistic, hyperdetailed, tiny details, horror, scary,
monster, skull, bones, weapon, fire, lava, angry face, dark black shadows, neon glare,
brand logo, text, letters, numbers, words, handwriting, watermark, signature, frame,
border, badge, colored card background, visible grid lines, cropped, cut off, merged
objects, white background, fake transparency, motion blur, lens flare.
```

---

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| pedra clara | `#6F86A0` |
| pedra escura | `#31465D` |
| sombra da caverna | `#182B3E` |
| cristal de dado | `#4FD1D9` |
| cristal aceso | `#9AF4EF` |
| couro da bolsa | `#C78B4A` |
| couro escuro | `#744629` |
| luz da porta | `#FFD36A` |
| seleção | `#38BDF8` |
| informação pronta | `#35D07F` |
| atenção e trava | `#F59E0B` |
| erro de borda | `#FB7185` |
| painel claro | `#FFF7E8` |

Verde, azul, âmbar e coral são principalmente cores do código. Os pictogramas
não são tingidos pelo veredito.

---

## 5. `bg-caverna.png` - 1672 x 941

Fundo opaco único. Ele aparece inteiro na exploração e recebe um véu escuro no
modo altar. Nenhum objeto interativo vem pintado nele.

A composição reserva:

| Área | Função |
|---|---|
| topo 0 - 11% | baixa informação visual, pois o header cobre |
| esquerda e centro | caminho largo e chão calmo para explorador e dados |
| direita | nicho vazio onde a porta de código/textura será posicionada |
| base 82 - 100% | pedra pouco detalhada, coberta pela bolsa na exploração |

Prompt copiável:

```text
A wide friendly cave background for a children's educational adventure game, exactly
1672 by 941 pixels, 16:9 landscape, opaque image filling the whole canvas edge to edge.

Side-view cave chamber with a broad gently curved stone path going from the left side
to a large EMPTY doorway niche on the right. Rounded blue-gray rock walls #31465D and
#6F86A0, soft turquoise mineral glow #4FD1D9, a few small amber crystals near the outer
edges, and warm golden light softly touching the stone around the empty doorway niche.
The cave feels cozy, curious and safe, never frightening.

Keep the entire middle of the path calm, open and low contrast because a child
character and large collectible data crystals will be drawn there. Keep the top 11%
simple and dark enough for a game header. Keep the bottom 18% as broad plain stone with
very little detail because a bag interface will cover it. Put decorative crystals only
near walls and corners; none may look like a collectible in the central play area.

Do NOT draw a door inside the niche. Do NOT draw an altar, character, backpack, data
crystal, card, slot, button, sign, parchment, UI panel or text. The doorway niche must
be empty so a separate animated stone door can be placed there by the game.

Flat 2D cartoon educational game background for children, chunky rounded rock shapes,
clean dark navy outlines #1F2A37 on major forms, controlled friendly colors, flat color
areas with soft shadows, polished storybook game art, instantly readable, no text.

Negative: 3D render, realistic, photorealistic, hyperdetailed, horror, scary cave,
monster, skull, bones, weapon, torch, open flame, lava, cliff, dangerous pit, black
void, harsh darkness, neon glare, clutter in the center, character, door, altar,
collectible, UI, text, letters, numbers, words, logo, watermark, signature, border,
frame, motion blur, lens flare.
```

**Conferir:** o nicho direito precisa aceitar uma porta de aproximadamente
300 x 310 px na grade sem costura aparente. Nenhum cristal decorativo pode
ficar atrás dos pontos previstos para os dados.

---

## 6. `explorador.png` - 1400 x 1500, grade 4 x 3

Dez quadros de 350 x 500 (as duas últimas células da terceira linha ficam
vazias). O personagem aparece entre 150 e 190 px de altura na
grade, então a pose precisa ler pela silhueta.

| Frame | Pose | Uso |
|---|---|---|
| 0 | parado | espera junto ao dado |
| 1 | passo A | caminhada |
| 2 | passo B | caminhada |
| 3 | alcançando | coleta |
| 4 | curioso | informação incompleta |
| 5 | surpresa leve | fusão falhou |
| 6 | comemorando | porta aberta |
| 7 | entrando na luz | atravessar a porta |
| 8 | picareta erguida | minerar, golpe subindo |
| 9 | picareta batendo | minerar, golpe descendo |

Prompt copiável:

```text
Sprite sheet with exactly 8 frames in a strict 4-column by 2-row grid, every frame
exactly 350 by 350 pixels, total image exactly 1400 by 700 pixels, true transparent
background. No visible grid lines and no bleed between cells.

The SAME cheerful eight-year-old child cave explorer in every frame, facing RIGHT in a
side three-quarter view. Warm medium-brown skin, short curly dark hair, teal shirt
#4FD1D9, mustard shorts #D8A53C, comfortable dark blue shoes, and a small caramel
backpack #C78B4A. Friendly curious expression, child proportions, simple clothes, no
hat and no tool. Same size, same face, same clothing and same colors in all frames.

Frames, left to right then top to bottom:
1. IDLE: standing calmly, feet on the ground, looking ahead with a small smile.
2. WALK A: right foot forward, left arm forward, body leaning very slightly ahead.
3. WALK B: left foot forward, right arm forward, matching the same stride length.
4. COLLECT: leaning gently forward with the right hand reaching toward a floating
   object at chest height, left hand balancing behind, both feet still visible.
5. CURIOUS: standing with one hand under the chin, looking up at something in front,
   eyebrows raised, calm and thoughtful.
6. GENTLE SURPRISE: shoulders lifting slightly, open hands, friendly puzzled face,
   never sad or frightened.
7. CELEBRATE: both arms raised, broad smile, one foot lifted in a small joyful hop.
8. ENTER LIGHT: walking to the right with one hand shielding the eyes from warm light,
   seen slightly more from behind, backpack visible.

Center each figure horizontally. Keep about 8% transparent margin around the body.
Frames 1 through 7 must use exactly the same invisible ground baseline; the sole of
the lowest shoe touches that shared line. Keep the head at nearly the same height in
idle, walk, collect, curious and surprise poses.

Flat 2D cartoon character for a children's educational game, chunky rounded shapes,
bold readable silhouette, thick dark navy outline #1F2A37, flat colors with one soft
inner shadow and one small white gloss highlight, minimal detail, friendly polished
storybook game art, no text.

Negative: 3D render, realistic, photorealistic, adult proportions, teenager, helmet,
hat, weapon, sword, pickaxe, torch, open flame, scary face, crying, angry, dark mood,
extra limbs, missing fingers, inconsistent clothes, inconsistent skin or hair, cropped
body, cut off feet, different ground lines, motion blur, outer frame, border, visible
grid lines, merged cells, white background, fake transparency, text, letters, numbers,
words, logo, watermark, signature.
```

Depois que chegar, medir caixa alfa e a linha real dos pés em todos os quadros.
Se a caminhada mexer o corpo em `y`, a troca de frame vira um pulo.

---

## 7. `objetos-caverna.png` - 1024 x 512, grade 4 x 2

Oito objetos/estados de 256 x 256, transparência real e a mesma luz.

| Frame | Objeto |
|---|---|
| 0 | bolsa fechada |
| 1 | bolsa aberta |
| 2 | cristal-base de dado, vazio |
| 3 | cristal grande fechado |
| 4 | cristal grande rachado |
| 5 | porta fechada |
| 6 | porta entreaberta |
| 7 | porta aberta |

Prompt copiável:

```text
Sprite sheet with exactly 8 frames in a strict 4-column by 2-row grid, every frame
exactly 256 by 256 pixels, total image exactly 1024 by 512 pixels, true transparent
background. One centered cave-game object per frame, no visible grid lines and no
bleed between cells.

Frames, left to right then top to bottom:
1. CLOSED BAG: a friendly rounded caramel leather explorer satchel #C78B4A, front
   view, flap closed, dark brown strap and one plain round clasp, no emblem.
2. OPEN BAG: the exact same satchel in the same position and size, flap lifted, wide
   dark opening visible, empty inside, no objects sticking out.
3. EMPTY DATA CRYSTAL: one chunky rounded turquoise crystal #4FD1D9 on a small gray
   stone base, front view, broad empty center area where the game can overlay an icon,
   no symbol inside and no glow outside the cell.
4. SEALED LARGE CRYSTAL: a larger pale cyan geode-like crystal standing closed on a
   stone base, faint warm light visible inside but nothing readable.
5. CRACKED LARGE CRYSTAL: the exact same large crystal, same size and base, opened by
   one broad crack with warm cyan light coming out, empty center for a separate icon.
6. CLOSED DOOR: a friendly rounded stone cave door seen straight from the front,
   blue-gray blocks, thick arched frame, plain circular empty seal at its center, shut.
7. HALF-OPEN DOOR: the exact same arch and outer frame in the exact same position,
   stone slab slid halfway aside, narrow warm golden passage visible.
8. OPEN DOOR: the exact same arch and frame, slab fully aside, broad warm golden
   passage visible, no character and no scenery inside.

All objects share the same flat 2D children's educational game style, chunky rounded
shapes, bold readable silhouette, thick dark navy outline #1F2A37, controlled friendly
colors, one soft inner shadow and one small gloss highlight, minimal detail. Every
object fills about 78% of its cell with transparent margin.

Negative: 3D render, realistic, photorealistic, hyperdetailed, horror, scary, skull,
bones, monster, weapon, fire, lava, sharp spikes, magic rune, readable symbol, keyhole,
text, letters, numbers, words, logo, watermark, signature, colored card background,
outer frame, border, visible grid lines, merged cells, cropped, cut off, white
background, fake transparency, motion blur, lens flare.
```

As três portas precisam manter a moldura externa imóvel. O código troca o frame
e anima a pedra; se o arco mudar de tamanho, a porta inteira salta.

---

## 8. `dados-n1.png` - 1024 x 768, grade 4 x 3

Doze pictogramas de 256 x 256. São **somente ícones**: o cristal, a ficha e o
rótulo vêm do código.

| Frame | Rótulo do código | Pictograma |
|---|---|---|
| 0 | quarta | página de calendário neutra |
| 1 | 14h | relógio analógico |
| 2 | festa azul | chapéu e confetes azuis |
| 3 | 7h | despertador analógico |
| 4 | cozinha | mesa e armário |
| 5 | café da manhã | tigela, copo e fruta |
| 6 | sapato | tênis infantil |
| 7 | 10h | segundo relógio analógico |
| 8 | pátio | banco e árvore escolar |
| 9 | recreio | bola e corda |
| 10 | travesseiro | travesseiro macio |
| 11 | reserva | três pedrinhas neutras |

Prompt copiável:

```text
Sprite sheet with exactly 12 frames in a strict 4-column by 3-row grid, every frame
exactly 256 by 256 pixels, total image exactly 1024 by 768 pixels, true transparent
background. One large centered pictogram per frame, no card, no crystal, no background,
no visible grid lines and no bleed between cells.

Twelve friendly everyday pictograms for a children's educational game. Each object
fills about 76% of its cell with equal visual weight. Use natural object colors spread
across the whole sheet; do not give related objects matching background colors or
matching halos.

Frames, left to right then top to bottom:
1. A plain tear-off CALENDAR PAGE with four small blank square marks, no weekday name,
   no letters and no numbers.
2. A round ANALOG CLOCK showing approximately two o'clock, plain face, two hands, no
   numbers and no tick labels.
3. A blue PARTY HAT with three small pieces of confetti, no writing.
4. A rounded ANALOG ALARM CLOCK showing approximately seven o'clock, no numbers.
5. A simple KITCHEN CORNER: one small table and one cabinet, no appliances and no text.
6. A BREAKFAST GROUP: bowl, cup and one banana together as a single readable pictogram.
7. One CHILD'S SNEAKER seen from the side, cheerful natural colors.
8. A second round ANALOG CLOCK showing approximately ten o'clock, different body color
   from frame 2, no numbers and no tick labels.
9. A SCHOOL YARD pictogram: one outdoor bench under a small leafy tree, no building text.
10. A PLAYTIME group: one striped ball beside a coiled jump rope.
11. One soft PILLOW seen from the front, rounded corners and one stitched edge with no
    pattern.
12. Three small neutral river STONES grouped loosely, used as a reserve pictogram.

Flat 2D cartoon educational game icons for children, chunky rounded shapes, bold
readable silhouettes, thick dark navy outline #1F2A37, cheerful controlled colors,
flat color areas with one soft inner shadow and one small white gloss highlight,
minimal detail, instantly readable at small mobile size, no text.

Negative: 3D render, realistic, photorealistic, hyperdetailed, tiny details, brand
logo, text, letters, numbers, digits, words, handwriting, watermark, signature, frame,
border, badge, colored card background, crystal, green correct cue, red wrong cue,
checkmark, X mark, visible grid lines, cropped, cut off, merged objects between cells,
white background, fake transparency, motion blur, lens flare.
```

**Cuidado:** relógio é apoio de categoria, não substituto do rótulo. O texto
`7h`, `10h` ou `14h` continua obrigatório na ficha.

---

## 9. `dados-n2.png` - 1024 x 1024, grade 4 x 4

Produzir somente depois do nível 1 aprovado.

| Frame | Rótulo | Frame | Rótulo |
|---|---|---|---|
| 0 | sábado | 8 | aniversário |
| 1 | 10h | 9 | presente |
| 2 | praça | 10 | 8h |
| 3 | piquenique | 11 | ônibus |
| 4 | bola | 12 | portão |
| 5 | dia 12 | 13 | escola |
| 6 | abril | 14 | recreio |
| 7 | casa | 15 | reserva |

Prompt copiável:

```text
Sprite sheet with exactly 16 frames in a strict 4-column by 4-row grid, every frame
exactly 256 by 256 pixels, total image exactly 1024 by 1024 pixels, true transparent
background. One large centered pictogram per frame, no card, no crystal, no background,
no visible grid lines and no bleed between cells.

Sixteen friendly everyday pictograms for a children's educational game, all with
equal visual weight and about 76% cell fill. Use natural colors and deliberately spread
similar colors across unrelated items. Related data must not share a halo, badge,
background shape or special palette.

Frames, left to right then top to bottom:
1. A plain weekly CALENDAR PAGE with one blank day square softly circled, no letters or
   numbers.
2. A round ANALOG CLOCK showing approximately ten o'clock, no numbers.
3. A public PARK SQUARE with one tree, one bench and a small fountain, no sign.
4. A PICNIC BASKET open beside a folded checkered cloth.
5. One striped PLAYGROUND BALL.
6. A tear-off CALENDAR PAGE with one blank square emphasized by shape only, no number.
7. A second CALENDAR PAGE with a small spring flower beside it, no month name.
8. A friendly small HOUSE with cream wall and red roof.
9. A BIRTHDAY CAKE with one candle and a little confetti, no number.
10. A wrapped GIFT BOX with ribbon.
11. A rounded ANALOG ALARM CLOCK showing approximately eight o'clock, no numbers.
12. A simple yellow SCHOOL BUS seen from the side, blank destination panel.
13. A SCHOOL GATE with two rounded posts and an open passage, no sign.
14. A SCHOOL BUILDING with broad door and two windows, no letters or flag text.
15. A PLAYTIME group: jump rope and spinning top together.
16. Three neutral rounded stones used as a reserve pictogram.

Flat 2D cartoon educational game icons for children, chunky rounded shapes, bold
readable silhouettes, thick dark navy outline #1F2A37, cheerful controlled colors,
flat color areas with one soft inner shadow and one small white gloss highlight,
minimal detail, instantly readable at small mobile size, no text.

Negative: 3D render, realistic, photorealistic, hyperdetailed, tiny details, brand
logo, text, letters, numbers, digits, words, handwriting, watermark, signature, frame,
border, badge, colored card background, crystal, green correct cue, red wrong cue,
checkmark, X mark, visible grid lines, cropped, cut off, merged cells, white background,
fake transparency, motion blur, lens flare.
```

---

## 10. `dados-n3.png` - 1280 x 1024, grade 5 x 4

Produzir somente depois do nível 1 aprovado. Vinte quadros: dezoito dados e
duas reservas.

| Frame | Rótulo | Frame | Rótulo |
|---|---|---|---|
| 0 | segunda | 10 | terça |
| 1 | 7 | 11 | campo |
| 2 | horas | 12 | domingo |
| 3 | acordar | 13 | 12h |
| 4 | 8 | 14 | casa da vó |
| 5 | dormir | 15 | almoço |
| 6 | sexta | 16 | sábado |
| 7 | 16h | 17 | casa da tia |
| 8 | quadra | 18 | reserva A |
| 9 | treino | 19 | reserva B |

Prompt copiável:

```text
Sprite sheet with exactly 20 frames in a strict 5-column by 4-row grid, every frame
exactly 256 by 256 pixels, total image exactly 1280 by 1024 pixels, true transparent
background. One large centered pictogram per frame, no card, no crystal, no background,
no visible grid lines and no bleed between cells.

Twenty friendly everyday pictograms for a children's educational game, all with equal
visual weight and about 76% cell fill. Several items are deliberately plausible
alternatives, so none may look suspicious, dangerous, faded, red, broken or less
polished. Use natural colors and spread similar colors across unrelated data.

Frames, left to right then top to bottom:
1. A weekly CALENDAR PAGE with the first blank weekday square softly marked by a small
   dot, no letters and no numbers.
2. Exactly SEVEN small round counting stones arranged in a clear group, no written digit.
3. A simple HOURGLASS with sand halfway through, no number.
4. A cheerful child silhouette sitting up in bed with morning sun behind, no face detail.
5. Exactly EIGHT small round counting stones arranged in a clear group, no written digit.
6. A crescent MOON beside a soft pillow, a calm sleeping pictogram.
7. A weekly CALENDAR PAGE with the fifth blank square softly marked by a dot, no text.
8. A round ANALOG CLOCK showing approximately four o'clock, no numbers.
9. A SCHOOL SPORTS COURT seen from a slight high angle, painted boundary lines and one
   basketball hoop, no writing.
10. A TRAINING group: whistle, two small cones and a ball.
11. A weekly CALENDAR PAGE with the second blank square softly marked by a dot, no text.
12. A green SPORTS FIELD with two small goal posts, no players and no writing.
13. A weekly CALENDAR PAGE with a small sun symbol above one blank square, no text.
14. A round ANALOG CLOCK showing twelve o'clock, no numbers.
15. A cozy small HOUSE with an older woman waving at the door, no sign.
16. A family LUNCH table with plates, rice bowl and salad, no people and no text.
17. A weekly CALENDAR PAGE with the sixth blank square softly marked by a dot, no text.
18. A second cozy HOUSE with a younger adult woman waving, different roof color but the
    same visual weight as frame 15, no sign.
19. Three neutral rounded stones used as reserve pictogram A.
20. One simple empty map pin shape carved from stone, reserve pictogram B, no symbol.

Flat 2D cartoon educational game icons for children, chunky rounded shapes, bold
readable silhouettes, thick dark navy outline #1F2A37, cheerful controlled colors,
flat color areas with one soft inner shadow and one small white gloss highlight,
minimal detail, instantly readable at small mobile size, no text.

Negative: 3D render, realistic, photorealistic, hyperdetailed, tiny details, brand
logo, text, letters, numbers, digits, words, handwriting, watermark, signature, frame,
border, badge, colored card background, crystal, green correct cue, red wrong cue,
checkmark, X mark, suspicious dark item, broken item, visible grid lines, cropped, cut
off, merged cells, white background, fake transparency, motion blur, lens flare.
```

Os frames 0, 6, 10, 12 e 16 dependem do rótulo Phaser para dizer o dia. A
marcação visual apenas diferencia as folhas; ela não precisa codificar um
calendário universal.

---

## 11. `cover-caverna-dos-dados.png` - 1672 x 941

A capa mostra a mecânica, não apenas uma criança dentro de uma caverna. Três
fichas relacionadas convergem para uma faixa de luz; uma quarta ficha fica na
bolsa; a porta começa a abrir.

Prompt copiável:

```text
A polished colorful cover illustration for a children's educational adventure game,
exactly 1672 by 941 pixels, 16:9 landscape, opaque image filling the whole canvas.

Inside a cozy blue-gray crystal cave, a cheerful eight-year-old child explorer stands
on the lower left, seen in three-quarter view, touching one of three large floating
turquoise data crystals. The three crystals show clear pictograms only: a blank
calendar page, an analog clock with no numbers, and a blue party hat. Thin cyan light
threads connect these three crystals and merge into one broad glowing golden parchment
strip in the center. The strip is completely blank, with no writing.

On the right, a friendly rounded stone door is beginning to slide open, warm golden
light coming through. Near the child's open caramel bag at the bottom, one separate
sneaker pictogram remains unconnected, drawn with the same quality and brightness as
the other data so it does not look evil or wrong.

Composition must clearly show the action from left to right: separate data crystals,
their light joining into one information strip, then the opening door. Leave calm dark
space across the upper 18% for the platform title overlay. Keep every important object
away from the extreme edges.

Flat 2D cartoon educational game cover for children, chunky rounded shapes, bold
readable silhouette, thick dark navy outline #1F2A37, cheerful controlled colors,
flat color areas with one soft inner shadow and small gloss highlights, polished
storybook adventure art, dynamic but uncluttered.

Negative: text, letters, numbers, words, title, logo, watermark, signature, 3D render,
realistic, photorealistic, hyperdetailed, horror, scary cave, monster, skull, bones,
weapon, torch, open flame, lava, dangerous pit, angry child, red evil sneaker, green
checkmark, red X, UI panel, button, frame, border, motion blur, lens flare, cropped
character, objects touching the image edge.
```

Sem título dentro da imagem. A plataforma escreve “Caverna dos Dados”.

---

## 12. O que continua em `Graphics`

| Elemento | Motivo |
|---|---|
| cristal-base e ficha | recebem qualquer pictograma e mudam com seleção |
| rótulos dos dados | texto precisa ser correto e nítido |
| altar e encaixes | quantidade muda de 3 para 4 |
| centro JUNTAR | botão tem normal, pressionado, bloqueado e destaque |
| fios de relação | ligam posições que mudam |
| faixa quebrada e faixa pronta | cresce com a seleção e recebe frase real |
| cadeado e fumaça | estado transitório da trava |
| VOLTAR e dica do escondido | só existem no nível 3 |
| header, diário, `?` e vidas | interface compartilhada |
| estrelas, confete e painel final | estado e celebração |

A porta é textura porque tem identidade de cenário e três poses fixas. A luz
que sai dela é `Graphics`, pois cresce durante a abertura e precisa recortar a
silhueta do explorador.

---

## 13. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `explorador`, `objetos-caverna` e `dados-nN` |
| Sem transparência | `bg-caverna` e `cover` são opacos |
| Recorte | grade exata, sem sangria entre quadros |
| Margem | 8% no explorador; 12% nos pictogramas |
| Peso alvo | folhas até 800 KB; fundo e capa até 1,5 MB |
| Sem | texto, letra, número, logo, moldura externa ou linha de grade |

Se a geração vier com fundo branco, refazer sobre magenta `#FF00FF` e remover a
cor. Não aceitar alfa falso nem halo claro ao redor do recorte.

---

## 14. Como as texturas entram

Por `import.meta.glob`, nunca por import estático:

```ts
const ART = import.meta.glob(
    '../../../../assets/games/EF03CO04/caverna-dos-dados/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>
```

O `BootScene` ignora `cover-`, carrega somente o que o nível presente usa e
registra as folhas com suas grades. Todo consumo consulta
`textures.exists(key)`; sem PNG, entram as reservas descritas no planejamento.

Depois que cada folha chegar, medir a caixa alfa por quadro:

- pés e topo do explorador;
- moldura externa das três portas;
- base real da bolsa;
- centro visível de cada pictograma;
- sangria entre células.

Ancorar pelo desenho visível, não pelo limite da célula.

---

## 15. Ordem de produção

Primeira rodada, nível 1:

1. `dados-n1.png` — é o conteúdo da decisão;
2. `explorador.png` — carrega coleta e reação;
3. `objetos-caverna.png` — bolsa e porta;
4. `bg-caverna.png` — identidade do mundo.

Depois de o usuário jogar e aprovar:

5. `dados-n2.png`;
6. `dados-n3.png`;
7. `cover-caverna-dos-dados.png`.

> **Estado em 10/09/2026.** Tudo entregue: as sete folhas existem e os três
> níveis rodam com os pictogramas certos. A reserva de código (rótulo
> centralizado e fonte maior quando a folha falta) continua no `word.ts` — é a
> rede para um nível novo entrar antes da arte dele.

A capa vem por último para retratar o jogo que realmente sobreviveu ao teste,
não uma mecânica que mudou durante a construção.

---

## 16. Checklist de conferência

- [ ] existem exatamente sete arquivos planejados;
- [ ] cada prompt informa tamanho, grade, ordem e negativo;
- [ ] nenhum PNG contém texto, letra ou número;
- [ ] correto e intruso têm o mesmo peso visual;
- [ ] itens relacionados não compartilham halo, moldura ou código de cor;
- [ ] fundo não contém porta, altar, personagem ou coletável;
- [ ] nicho do fundo aceita a porta separada;
- [ ] explorador mantém roupa, proporção e linha do chão;
- [ ] porta mantém a moldura externa nos três frames;
- [ ] folhas têm transparência real e grade sem sangria;
- [ ] rótulos continuam legíveis quando sobrepostos pelo Phaser;
- [ ] caixas alfa foram medidas antes de acertar escala e origem;
- [ ] somente assets do nível 1 são produzidos na primeira rodada;
- [ ] capa é feita por último e mostra dados virando informação.
