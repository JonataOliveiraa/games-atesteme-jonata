# Expedição Pixel — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino futuro: `src/assets/games/EF04CO05/expedicao-pixel/`

**Três arquivos para jogar, mais a capa do catálogo.** Nenhum foi gerado. O nível
1 tem de estar jogável com `Graphics` antes de você gerar qualquer um.

> **A lição que essa lista já custou.** Numa tentativa anterior eu pedi quinze
> PNGs, um por objeto. A unidade de custo é o **arquivo**, não a peça: uma folha
> de oito células custa uma geração igual a um ícone solto. Então tudo que é
> pequeno e do mesmo estilo entra na mesma folha.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é |
|---:|---|---:|---|---|---|
| 1 | `bg-festa.png` | 1672 × 941 | imagem única | opaco | a praça à noite: céu vazio em cima, multidão e chão embaixo |
| 2 | `festa-pecas.png` | 1280 × 640 | 4 × 2 de 320 | alfa real | torneira ×2, foguete ×2, botão ×2, placa vazia, rampa |
| 3 | `mestre-npc.png` | 640 × 420 | 2 × 1 de 320 × 420 | alfa real | o mestre dos fogos: falando e comemorando |
| 4 | `cover-expedicao-pixel.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo |

O **#3 é opcional**: sem ele o balão de dica fala sozinho e o jogo roda igual.

### O que é `Graphics`, e por que

- **o estouro do fogo**, o rastro da subida, as faíscas e as estrelas que ficam
  no céu — a cor deles é a RESPOSTA, e tem de nascer da mesma função que pinta o
  foguete;
- o **brilho colorido** da torneira aberta e do corpo do foguete;
- o **círculo da cor pedida** na placa e o nome dela;
- os números `1 0 1` embaixo das torneiras e os rótulos VERMELHO/VERDE/AZUL;
- o cadeado da TRAVA, o balão de fala, cabeçalho, vidas, estrelas, `?`.

O jogo tem de rodar inteiro sem nenhum PNG carregado.

---

## 1. As três regras que governam a arte

> **1. Nada colorido no que o código vai tingir.**

O vidro da torneira aberta e o **corpo do foguete** vêm em **branco e cinza**. O
jogo aplica a cor da mistura por cima. Um foguete já pintado de laranja viraria
laranja-vezes-laranja e a cor que a criança montou deixaria de ser a cor que ela
vê. É a regra que mais dá errado quando não está escrita.

> **2. O céu chega VAZIO.**

Nenhum fogo, nenhuma estrela grande, nenhuma lua brilhante, nenhuma nuvem clara
na metade de cima. Tudo que acende lá é desenhado pelo jogo, e um fogo pintado no
fundo competiria com o da criança — ou pior, entregaria a resposta.

> **3. É festa, não guerra.**

Fogos de festa junina, em praça de cidade pequena: bandeirinhas, barracas,
telhados baixos, gente de todas as idades olhando para cima. Nada de canhão,
arma, míssil, explosão de fumaça preta, fogo destruindo coisa ou criança perto do
fogo. O clima é alegre e a noite é **azul-escura, não preta de terror**.

---

## 2. Estilo e paleta

Visual: **jogo 2D infantil polido**, formas arredondadas, áreas foscas amplas,
contorno firme, leitura fácil em celular. Noite azul com luz quente vindo das
barracas.

| Uso | Hex |
|---|---|
| contorno | `#20283a` |
| céu alto | `#111a2e` |
| céu no horizonte | `#28375a` |
| telhados e barracas | `#3d4a63` |
| madeira da mesa de comando | `#8a5f3c` |
| metal/latão dos mecanismos | `#c89b4b` |
| luz quente das lâmpadas da festa | `#f6c66b` |
| multidão (silhueta) | `#1a2234` |
| vidro apagado / corpo do foguete | `#d8dee4` |
| vermelho · verde · azul dos rótulos (código) | `#e5584f` · `#4eaa78` · `#4b8fe0` |
| acerto · TRAVA (código) | `#4eaa78` · `#e59a52` |

Os três rótulos têm cor **e** nome escrito; a placa escreve o nome da cor pedida.
É um jogo sobre cor e precisa ser jogável por uma criança daltônica.

### Negativo comum

~~~text
text, letters, words, labels, digits, numbers, RGB values, code,
fireworks in the sky, explosion in the sky, bright moon, big stars, light
clouds, colored glass, colored rocket body, rainbow,
cannon, gun, missile, weapon, war, soldier, black smoke, fire destroying
something, burning building, child holding fire, danger,
palette, color picker, slider, swatch, grid, matrix,
button UI, HUD, life icon, star rating, question mark, tutorial panel,
3D render, photorealistic, blur, lens flare, watermark, signature,
visible sprite-sheet grid, cropped edges, white backing in transparent assets,
painted checkerboard.
~~~

---

## 3. `bg-festa.png`

### Contrato

| Campo | Exigência |
|---|---|
| tamanho | 1672 × 941, paisagem, borda a borda |
| fundo | opaco |
| **céu vazio** | y 0%–48%: noite azul limpa, **sem nenhum fogo, lua ou estrela grande** |
| placa livre | x 2%–26%, y 8%–34%: céu liso, onde a placa da festa é desenhada |
| multidão | y 46%–56%: silhueta escura de gente olhando para cima |
| mesa livre | y 56%–100%: chão/palanque de baixo detalhe para a mesa de comando |
| clima | festa junina de cidade pequena, alegre, acolhedora |

O céu ocupa quase metade da imagem e é a peça mais importante: é a tela em branco
onde o jogo desenha. Pode ter um degradê suave do azul-escuro no topo para um
azul mais claro no horizonte, e **estrelinhas minúsculas, quase invisíveis** — se
houver dúvida, não coloque.

A cidade fica na linha do horizonte: telhados baixos, uma igrejinha, barracas com
lâmpadas quentes e **fileiras de bandeirinhas** atravessando. A multidão é uma
silhueta escura, sem rostos detalhados, de costas para quem joga.

### Prompt copiável

~~~text
A warm night-time Brazilian village festival background for a children's game,
exactly 1672 by 941 pixels, landscape and fully opaque. Cheerful "festa junina"
atmosphere: low rooftops, a small church tower, a few market stalls glowing with
warm bulb lights #f6c66b, and rows of little triangular bunting flags strung
across the horizon line. A dark silhouette crowd of people of all ages seen from
behind, looking UP at the sky, along y=46–56%.

THE TOP HALF MUST BE EMPTY SKY: a clean deep blue night, #111a2e at the top
fading to #28375a near the horizon, with at most a few tiny faint stars. NO
fireworks, NO explosions, NO big moon, NO bright stars, NO light clouds — the
game draws everything that glows up there, and anything painted would compete
with it.

Keep x=2–26%, y=8–34% as plain empty sky for a sign to be drawn on top. Keep the
bottom area y=56–100% as a quiet low-detail wooden platform or packed-earth
ground where a control table will be placed.

Polished flat 2D children's game art, rounded forms, broad matte color areas,
dark outline #20283a on major shapes, warm pools of light around the stalls.
Friendly and festive, never scary. Readable when scaled to a 390-pixel mobile
display.

Negative: fireworks, explosion, rocket in the sky, bright moon, large stars,
constellation, light clouds, smoke, cannon, gun, weapon, war, fire on buildings,
bonfire in the middle, child near fire, danger, control table, levers, taps,
buttons, rocket on the ground, sign, banner with text, letters, digits, numbers,
HUD, grid, 3D, photorealism, blur, white border, watermark.
~~~

### Conferência

- [ ] a metade de cima é céu **vazio**, sem um único fogo ou estrela grande;
- [ ] lê-se "festa de rua à noite" em dois segundos;
- [ ] a multidão está em silhueta, olhando para cima, sem rostos;
- [ ] há espaço liso no alto à esquerda para a placa;
- [ ] a faixa de baixo está calma para a mesa de comando;
- [ ] a noite é azul e alegre, não preta e assustadora.

---

## 4. `festa-pecas.png` — tudo que a criança toca

### Contrato da folha

| Campo | Exigência |
|---|---|
| canvas | 1280 × 640 |
| grade | 4 colunas × 2 linhas; células 320 × 320 |
| fundo | alfa real |
| estilo | todas as peças no mesmo traço, contorno e luz |

| Célula | Objeto | Exigência |
|---:|---|---|
| 1 · linha 1 | **torneira fechada** | válvula de latão com um bulbo de vidro **cinza e apagado** |
| 2 · linha 1 | **torneira aberta** | a MESMA válvula, com o bulbo **branco brilhante e sem cor** |
| 3 · linha 1 | **foguete na rampa** | corpo **branco/cinza**, apontando para cima e um pouco à direita |
| 4 · linha 1 | **foguete subindo** | o mesmo foguete, inclinado, com as aletas abertas |
| 1 · linha 2 | **botão solto** | botão vermelho grande e redondo, do tipo de apertar com a mão |
| 2 · linha 2 | **botão apertado** | o mesmo botão afundado no aro |
| 3 · linha 2 | **placa da festa vazia** | quadro de madeira com **miolo completamente liso e vazio** |
| 4 · linha 2 | **rampa de lançamento** | a base de madeira e metal onde o foguete se apoia |

Três exigências que decidem se a folha serve:

1. **O bulbo da torneira e o corpo do foguete não têm cor.** Branco e cinza
   apenas. A cor entra por cima, em código — é o jogo inteiro.
2. **A torneira fechada e a aberta são a mesma torneira**, mesma escala, mesma
   posição, mesmo ângulo: só o bulbo muda. Idem para o botão.
3. **A placa é um quadro vazio.** O círculo da cor pedida e o nome dela são
   desenhados por cima; qualquer coisa no miolo brigaria com eles.

### Prompt copiável

~~~text
Create ONE sprite sheet on a grid of 4 columns by 2 rows, exactly 1280 by 640
pixels, each cell exactly 320 by 320, TRUE transparent PNG background, no cell
borders and no gaps. Eight props from the same cheerful village-festival
fireworks stand, in one consistent style: polished flat 2D children's game art,
rounded forms, broad matte colors, dark outline #20283a, one soft upper-left
highlight, each object centered in its cell with transparent margins.

TOP ROW
Cell 1 — a chunky brass valve tap #c89b4b mounted on a small wooden block, with
a round GLASS BULB on top that is COLORLESS and unlit: pale cool grey #d8dee4,
matte, switched off.
Cell 2 — the EXACT SAME tap, same size, angle and position, with the bulb now
GLOWING BRIGHT WHITE. Still completely colorless: no red, no green, no blue, no
warm yellow — the game paints the color on top.
Cell 3 — a small friendly firework rocket resting on its stand, pointing up and
slightly to the right. Its body is a smooth COLORLESS white-and-grey capsule
#d8dee4 with a brass nose cone, small fins and a short fuse. No paint, no
stripes, no pattern on the body.
Cell 4 — the SAME rocket in flight: same body, tilted more steeply, fins spread,
nose up. No flame, no smoke trail, no sparks — the game draws those.

BOTTOM ROW
Cell 5 — a big round red push button with a brass ring, the kind you slam with
your palm, seen slightly from above, in its raised position.
Cell 6 — the SAME button pressed down into its ring. Same ring position and
scale; only the cap moves.
Cell 7 — an empty wooden festival SIGN BOARD: a rounded rectangular plank with a
simple frame and two small hanging hooks at the top. Its inner area is
COMPLETELY BLANK and flat — no writing, no drawing, no circle, no decoration
inside the frame.
Cell 8 — a simple wooden-and-metal launch stand or ramp, empty, the kind the
rocket in cell 3 would rest on.

Absolute negative: colored glass, red bulb, green bulb, blue bulb, warm yellow
glow, rainbow, painted rocket, striped rocket, colored rocket body, flame,
smoke, sparks, fire, explosion, text, letters, digits, numbers, symbols, arrows,
drawing inside the sign, circle inside the sign, weapon, cannon, missile,
different scale between the paired cells, white backdrop, painted checkerboard,
fake alpha, 3D render, photorealism, blur, cropped objects, watermark, visible
sprite-sheet grid.
~~~

### Conferência

- [ ] oito células de 320 × 320 exatas, na ordem da tabela;
- [ ] o bulbo aceso e o corpo do foguete não têm **um pixel colorido**;
- [ ] torneira fechada/aberta e botão solto/apertado são o mesmo objeto;
- [ ] o miolo da placa está liso e vazio;
- [ ] o foguete não tem chama, fumaça nem faísca;
- [ ] tudo legível a ~60 px físicos no celular.

---

## 5. `mestre-npc.png` (opcional)

### Contrato

| Campo | Exigência |
|---|---|
| canvas | 640 × 420 |
| grade | 2 × 1 de 320 × 420 |
| fundo | alfa real |
| exibição | ~200 × 260 px lógicos, no canto da mesa |

O **mestre dos fogos**: uma pessoa simpática da festa, com chapéu de palha e
camisa xadrez, de corpo inteiro, virada para o centro da tela. Ele é quem fala no
balão da dica — e é só isso: não é o gesto do jogo.

| Quadro | Estado |
|---:|---|
| 0 | falando, uma mão apontando para o céu |
| 1 | comemorando, braços erguidos, sorrindo |

### Prompt copiável

~~~text
A horizontal two-frame sprite sheet of the SAME friendly Brazilian festival
fireworks master, exactly 640 by 420 pixels, two equal 320 by 420 cells in one
row, TRUE transparent PNG background, no cell borders. Full body, three-quarter
view, facing toward the center of the screen. A cheerful adult in a straw hat and
a checked shirt, simple work trousers and boots, warm brown skin — a friendly
village festival character, never a soldier and never holding fire.

LEFT frame 0 TALKING: standing, one hand pointing up at the sky, mouth open in a
friendly explanation.
RIGHT frame 1 CHEERING: EXACTLY the same character, same scale and eye height,
both arms raised, big happy smile.

Polished flat 2D children's educational-game character art, rounded shapes, broad
matte colors, dark outline #20283a, simple facial features, one soft shadow.
Center the figure in each cell, feet at the same height in both frames.

Absolute negative: fire in hand, torch, lit rocket in hand, match, lighter,
weapon, gun, uniform, soldier, scared expression, danger, text, logo, speech
bubble, different scale between frames, different eye height, white backdrop,
painted checkerboard, fake alpha, 3D render, photorealism, blur, cropped figure,
watermark, visible sprite-sheet grid.
~~~

### Conferência

- [ ] mesma altura de olhos e mesmos pés nos dois quadros;
- [ ] não segura fogo, fósforo nem nada aceso;
- [ ] parece gente da festa, não militar;
- [ ] legível a ~60 px de largura no celular.

---

## 6. `cover-expedicao-pixel.png`

A capa **pode** mostrar fogos à vontade: é ilustração, não peça de jogo. A imagem
que vende é a praça vista de longe com **três fogos de cores diferentes abrindo
no céu ao mesmo tempo** e a multidão olhando.

### Prompt copiável

~~~text
Wide cover illustration for the SAME cheerful Brazilian village festival game as
the approved background, exactly 1672 by 941 pixels, landscape and fully opaque.
A warm night village square with low rooftops, glowing stalls and rows of bunting
flags; a silhouette crowd of all ages seen from behind, looking up. In the deep
blue sky above, THREE big fireworks burst at once in clearly different colors —
one red, one green, one blue — each opening in clean rounded petals with falling
sparks. Joyful, warm and safe.

Polished flat 2D children's game art, rounded shapes, broad matte colors, dark
outline, readable as a small thumbnail. Leave a quiet area for a catalog title
overlay. No game interface of any kind.

Negative: text, title, letters, digits, numbers, RGB values, code, sliders,
palette, color picker, bars, grid, buttons, HUD, cannon, gun, missile, weapon,
war, soldier, black smoke, burning building, child near fire, danger, scary
night, 3D, photorealism, blur, white border, watermark.
~~~

### Conferência

- [ ] entende-se "festa com fogos" em miniatura;
- [ ] os três fogos têm cores claramente diferentes;
- [ ] não há número, barra, interface nem arma;
- [ ] a área para o título continua livre.

---

## 7. Integração, fallback e ordem

Antes de qualquer PNG: céu em degradê de `Graphics`, multidão em silhueta de
retângulos arredondados, mesa em planos de cor, torneira como válvula com bulbo,
foguete como cápsula com aletas, botão como círculo com aro. O desenho de reserva
já ocupa as dimensões lógicas finais e **já usa o mesmo caminho de cor** da arte
final: `toColor(mix)` é a única fonte de cor do jogo, com ou sem textura.

No `BootScene`, descobrir texturas opcionais por `import.meta.glob`, sem import
estático para arquivos que ainda não existem. Depois de integrar, **medir a caixa
alfa** de cada peça e reposicionar tudo **pela geografia do fundo entregue** — não
pelos números do §5 do planejamento. Isso já custou caro duas vezes: o fundo
manda, o layout obedece.

Dois testes obrigatórios quando a arte chegar:

1. **Saturação zero** no bulbo aceso e no corpo do foguete. Um matiz escondido no
   cinza é o bug mais caro deste jogo, e ele não aparece na tela: aparece como
   "a cor está estranha".
2. **As nove cores das nove rodadas** tingidas no mesmo foguete, lado a lado:
   as nove precisam ser distinguíveis, e cada uma tem de bater com a cor
   calculada.

Ordem: **N1 funcional com desenho de reserva → teste do usuário → fundo da festa
→ folha de peças → mestre (se quiser) → capa.**
