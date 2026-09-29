# Balão do Recado — texturas

Destino: `src/assets/games/EF01CO04/balao-do-recado/`
Planejamento: [PLANEJAMENTO.md](./PLANEJAMENTO.md) (§5 tela, §6 trechos e voo,
§8 entrega e mural, §13 textura × código).

A linha de arte é a **chibi de figurinha**, com a referência
`references/19-chibi-figurinhas.jpg` **anexada em toda geração**. É o padrão do
PADRAO-R3. Se você mandar uma imagem de estilo própria para este jogo (*Dúvida 5*
do plano), troque o bloco `STYLE` e a tabela abaixo. As grades e as células não
mudam. Cada prompt vem inteiro (estilo + corpo + negativo), pronto para copiar.

> **O elenco da referência entra no negativo.** Da folha de figurinhas sai só a
> técnica, nunca as personagens dela.

### Tabela de estilo — chibi de figurinha

| Critério | Contrato desta linha | Diferente de |
|---|---|---|
| Traço | limpo, nítido, uniforme, em azul-marinho dessaturado; nunca preto puro | vetor de conto (contorno no tom da cor) e desenho de criança (caneta trêmula) |
| Cor | paleta curta, chapada, **um** tom de sombra, nenhum degradê | vetor de conto (degradê macio) e chibi de rabisco (sem cor) |
| Olho | grande e brilhante, com um brilho forte | desenho de criança (pontinho) |
| Silhueta | peça com alfa ganha **keyline branca fina**; cena inteira (fundo, capa) não ganha | vetor de conto e graphic novel (sem keyline) |
| Proporção | chibi: cabeça grande, corpo pequeno; objetos simples e legíveis no tamanho do jogo | graphic novel (quase natural) |

**Paleta deste jogo:** azul-céu e creme no fundo; o balão em **coral, amarelo-sol
e menta**; lilás e verde-folha nos detalhes. O **amarelo do lápis** é conteúdo
(o recado diz "lápis amarelo"), então ele tem de ser amarelo sem dúvida.

## 1. Os arquivos

| Arquivo | Grade | Célula | Tamanho final | Alfa | Uso |
|---|---|---|---|---|---|
| `bg-bairro.png` | — | — | 2560 × 720, **emenda horizontal** | opaco | o céu e o bairro, rolando em `TileSprite` |
| `balao.png` | 2 × 2 | 512 × 512 | 1024 × 1024 | sim | o balão com a criança: calmo, queimando, comemorando, soprado |
| `destinos.png` | 3 × 3 | 512 × 512 | 1536 × 1536 | sim | colega (perto), vizinha (saiu) e vovó (longe): antes, feliz, estrago |
| `pecas.png` | 4 × 3 | 320 × 320 | 1280 × 960 | sim | anel, 3 formas, 3 desenhos de recado, cadeado, nuvem que sopra, pássaro, dedo, bilhete |
| `balao-2.png` | 2 × 1 | 512 × 512 | 1024 × 512 | sim | o mesmo balão: falando (mãos em concha) e com o tablet (§10) |
| `extras.png` | 4 × 3 | 256 × 256 | 1024 × 768 | sim | pensamento, sol, lua, caixa de correio com bandeirinha, 3 carimbos, rosto da vovó, plaquinha "saiu" (§10) |
| `destinos-2.png` | 3 × 2 | 512 × 512 | 1536 × 1024 | sim | N2: vizinha com o celular em casa (antes, feliz, 2 erros), envelopes caídos na colega e na vovó (§11) |
| `destinos-3.png` | 4 × 3 | 512 × 512 | 2048 × 1536 | sim | N3: vovó perto no banco, colega longe no barquinho, vizinha dormindo (§11) |
| `mural.png` | — | — | 960 × 600 | sim | mural de cortiça vazio |
| `cover-balao-do-recado.png` | — | — | 1672 × 941 | opaco | capa do catálogo, **com o título** |

**A ordem das células é contrato com o código** (`data/files.ts`,
`data/messages.ts`). Se trocar uma célula, avise o Ferro e a Brasa.

**O insubstituível:** as **3 formas com o miolo vazio** (`pecas` 1–3) e os **3
desenhos de recado** (`pecas` 4–6). O mesmo desenho dentro de três cascas
diferentes é a habilidade. O resto pode esperar numa reserva em código. Estas
seis células não podem.

**Opcional para o N1:** a célula 9 (pássaro), que só entra no N2. Ela está na
folha porque célula a mais na mesma folha não custa outra geração.

## 2. Regras para toda a arte

- Nenhum texto, número ou letra em nenhuma célula. A frase do recado, os
  letreiros e o carimbo são do jogo.
- Objeto solto e centrado na célula, com ~8% de margem, sem chão e sem sombra
  caída. Nada vaza para a célula vizinha. A exceção é o cenário de `destinos`, que
  encosta na borda de baixo (§5).
- **As 3 formas têm o miolo liso e vazio**: o balão de fala por dentro, a folha
  que sai do envelope e a tela do tablet. O código põe o desenho do recado ali.
  Se vier qualquer coisa desenhada no miolo, a célula volta.
- **As 3 formas têm o mesmo peso visual e o mesmo tamanho** e se leem a 64 px
  (ícone do cartão e carimbo) e a 200 px (troca de forma).
- Os desenhos de recado são **um objeto grande e simples** cada, que se lê a
  64 px, com o mesmo peso dos três.
- Sem vermelho de alerta: o cadeado é dourado e a nuvem que sopra é simpática.
- O balão e as pessoas olham na direção certa: **o balão voa para a DIREITA** e
  **quem recebe olha para a ESQUERDA** (de onde o balão chega).

## 3. `bg-bairro.png` — 2560 × 720, opaco, emenda horizontal

Um panorama só, que rola da direita para a esquerda sem parar. A borda esquerda
tem de **continuar** a direita. A Tesoura confere a emenda e, se precisar,
funde ~200 px nas pontas.

| Faixa | O que tem |
|---|---|
| y 0–130 | céu **calmo**, liso, porque o cartão do recado e o HUD ficam aqui |
| y 130–545 | céu aberto, azul claro, com poucas nuvens pequenas e **pálidas** (baixo contraste). É onde o balão e os anéis voam, e não pode ter pássaro, balão, pipa ou avião |
| y 545–720 | o **bairro**: casinhas coloridas de telhado arredondado, árvores redondas, um poste, e **uma escola** com um sininho no telhado mais ou menos em x 1400–1800. **Nada passa para cima de y 560**, nem chaminé, nem árvore, nem antena |

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full scene, not a sticker.

Use case: stylized-concept
Asset type: horizontally SEAMLESS scrolling panorama background for a Phaser 3 side-scrolling educational game for Brazilian children aged 6–7.
Primary request: create one opaque 2560 × 720 px panorama (exact 32:9 ratio; if the generator limits size, keep exactly 32:9) of a cute, calm Brazilian neighbourhood seen from the side, under a wide daytime sky. The image MUST tile horizontally: the left edge continues seamlessly into the right edge, with no building, tree or cloud cut in half at either edge. Preserve these exact functional bands: y 0–130 is a calm, plain light-blue sky with nothing in it; y 130–545 is an open light-blue sky with only a few small, pale, low-contrast rounded clouds, kept quiet because a balloon and rings fly over it; y 545–720 holds the neighbourhood — a row of small colourful houses with rounded roofs in coral, sunny yellow, mint, lilac and cream, round green trees, one little lamp post, and ONE friendly school building with a small bell on its roof somewhere between x 1400 and x 1800. NOTHING rises above y 560: no chimney, tree top, antenna, pole or roof crosses that line. Keep the houses simple and evenly spaced so the loop is not obvious.

Composition and technical constraints: straight-on side view, flat horizon, no perspective vanishing point; all listed bands respected; opaque; no white sticker keyline; no embedded user interface; seamless horizontal tile.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, people, children, animals, birds, hot-air balloons, kites, airplanes, rings, hoops, clouds with faces, sun with a face, rainbows, text, letters, words, labels, digits, numbers, signs with writing, school name, flags with symbols, captions, watermark, logo, title lettering, score, counter, HUD, buttons, question mark, speech bubbles, arrows, icons, anything above y 560 in the neighbourhood band, busy details in the sky, high-contrast clouds, objects cut at the left or right edge, visible seam, perspective view, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 4. `balao.png` — grade 2 × 2, célula 512 × 512

Um balão de ar quente redondo, com gomos **coral, amarelo-sol e menta**, e uma
cesta de vime. Dentro dela vai **uma criança chibi**, visível do peito para
cima: cabelo castanho-escuro curto e cachecol amarelo-sol. O queimador fica
entre a boca do balão e a cesta. Na lateral **esquerda** da cesta há **um
ganchinho de latão**, onde o código prende a cordinha do recado. **Tudo virado
para a DIREITA.**

| Célula | Nome no código | Pose | Medidas |
|---|---|---|---|
| 0 | `balloon-idle` | queimador apagado, a criança segura a borda da cesta e sorri | fundo da cesta em (256, 470); centro do conjunto em (256, 255); gancho em ~(175, 420) |
| 1 | `balloon-burn` | **chama gorda acesa** no queimador subindo para a boca do balão; a criança puxa a cordinha do queimador, animada | idem |
| 2 | `balloon-cheer` | queimador apagado, a criança com os dois braços para cima, brilhinhos em volta | idem |
| 3 | `balloon-blown` | queimador apagado, o balão **inclinado ~8° para a esquerda** (vento vindo da direita); a criança segura o cachecol, olhos arregalados e gotinha de suor, **surpresa, sem medo** | idem |

As medidas finais (centro, gancho e fundo da cesta) vão para o `MANIFEST.md`.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions, big head and little body; tiny cartoon emotion marks only where asked; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact character sprite sheet for a Phaser 3 side-scrolling educational game for Brazilian children aged 6–7.
Primary request: create ONE exact 2 columns × 2 rows sprite sheet on a transparent 1024 × 1024 px canvas. Every cell is exactly 512 × 512 px. Each drawing is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

The subject in every cell: one cute round hot-air balloon about 330 px wide, its envelope made of vertical gores in coral, sunny yellow and mint, a small burner frame under the balloon mouth, and a woven tan wicker basket hanging from four short ropes. In the basket, one cheerful chibi child visible from the chest up, short dark-brown hair and a sunny-yellow scarf, big glossy eyes. On the LEFT side of the basket, one small round brass hook, empty. The whole balloon faces and travels to the RIGHT. The basket bottom sits at local y = 470, horizontally centred at x = 256.

Exact cells, left to right and then top to bottom:
0. balloon-idle — burner OFF with no flame at all; the child holds the basket rim with both hands and smiles.
1. balloon-burn — burner ON with one plump rounded orange-and-yellow flame rising up into the balloon mouth; the child pulls the burner cord with one hand, excited happy face.
2. balloon-cheer — burner OFF, no flame; the child raises both arms high, eyes happy, a few tiny sparkle marks around.
3. balloon-blown — burner OFF, no flame; the whole balloon tilts about 8 degrees to the LEFT as if a gentle wind pushes from the right; the child holds the scarf, eyes wide and surprised with one small sweat drop, NOT scared, still cute.

Consistency constraints: all four cells show the IDENTICAL balloon, basket, hook and child with the same proportions, colours and scale; only flame, pose and expression change; the basket bottom lines up at local y = 470 in every cell.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a second child, adults, animals, a face on the balloon, sandbags, flags, banners, ropes hanging below the basket, a message, letter, envelope, phone or tablet in the basket, anything hanging from the hook, flame in cells 0, 2 and 3, smoke, clouds, sky, ground, floor, shadow, background, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark, facing left, fear, crying, falling, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

## 5. `destinos.png` — grade 3 × 3, célula 512 × 512

É onde a entrega acontece (DECISÕES 3–5 do plano). Cada **coluna** é um
destino, e a **distância** é o que decide a forma. Por isso a distância tem de se
ver no desenho, sem nenhuma cor de pista:

- **colega:** **perto**, uma janela grande que ocupa quase a célula toda;
- **vizinha:** média, a fachada do sobrado com a porta e a caixa de correio;
- **vovó:** **longe**, uma casinha pequena no alto de um morro.

Cada **linha** é um momento: 0 = antes da entrega, 1 = feliz (forma certa),
2 = estrago (forma errada). Nas 3 células da mesma coluna o **enquadramento é
idêntico**: parede, janela, porta, caixa e morro não saem do lugar, e só a
pessoa, as mãos e o detalhe da cena mudam. O código troca a célula sem o
cenário pular.

**O cenário encosta reto na borda de baixo da célula**, porque o código o põe de
pé no pé da tela, à direita. As outras três margens seguem os 8%. Quem aparece
olha para a **ESQUERDA**, de onde o balão chega.

**Pontos de entrega** (o código faz a forma voar até eles; medir no MANIFEST):
colega = a orelha esquerda, em ~(200, 200); vizinha = a boca da caixa de
correio, em ~(170, 360); vovó = a janela da casinha, em ~(330, 210).

| Célula | id | Cena |
|---|---|---|
| 0 | `friend-wait` | janela grande de escola, moldura menta, parede creme e amarelo-sol. O colega debruçado nela, **pertinho**, cabeça em ~(256, 200), com os **dois braços ocupados** abraçando uma caixa grande de lápis de cor. Olha para a esquerda, sorrindo, esperando |
| 1 | `neighbor-away` | fachada do sobrado coral: embaixo à esquerda a **porta** com uma **caixa de correio** presa ao lado dela, boca em ~(170, 360); em cima à direita uma janela **fechada**, com a cortina fechada e uma floreira. Ninguém à vista |
| 2 | `grandma-wait` | um **morro** verde que sobe da borda de baixo; no alto, **pequena e longe**, uma casinha azul-céu (~170 px de largura) com uma janela em ~(330, 210). Na janela, a vovó, **pequena**, segurando um **tablet** apagado, olhando para a esquerda |
| 3 | `friend-happy` | igual à 0; o colega **ouvindo**: olhos fechados em arco de alegria, sorriso grande, ainda abraçando a caixa de lápis, dois brilhinhos perto da orelha |
| 4 | `neighbor-back` | igual à 1; a vizinha **voltou**: em pé na porta, ao lado da caixa de correio aberta, lendo uma carta aberta nas mãos, sorriso grande. A janela de cima continua fechada |
| 5 | `grandma-happy` | igual à 2; a vovó **feliz vendo a tela** do tablet, que agora tem um brilho claro e liso (sem imagem), dois brilhinhos |
| 6 | `friend-fail-drop` | igual à 0; o colega continua com os braços ocupados pela caixa de lápis; **um tablet caiu** de tela para baixo no canteiro embaixo da janela, com uma nuvenzinha de poeira ("plof"); o colega olha para baixo, sem graça, com uma gotinha de suor |
| 7 | `neighbor-fail-empty` | igual à 1 (janela fechada, cortina fechada, **ninguém**); um **balãozinho de fala murcho**, vazio e caído no peitoril da janela; a caixa de correio vazia e fechada |
| 8 | `grandma-fail-far` | igual à 2; a vovó na janela com a **mão em concha atrás da orelha**, testa franzida, boca de "hã?" (**sem** ponto de interrogação desenhado); o tablet apagado na outra mão |

A **voz caindo no meio do caminho** (vovó) é código: a forma voa e cai. Ela não
vai na célula.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions, big head and little body; tiny cartoon emotion marks only where asked; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: exact destination-scene sprite sheet for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create ONE exact 3 columns × 3 rows sprite sheet on a transparent 1536 × 1536 px canvas. Every cell is exactly 512 × 512 px. Each cell is one small scene whose bottom edge is cut perfectly straight and touches the BOTTOM edge of its cell; the top, left and right keep at least 8% transparent margin. Nothing crosses into a neighbouring cell. No drawn grid, border or divider. Every person looks to the LEFT.

DISTANCE LOCK — the three columns must read instantly as NEAR, MEDIUM and FAR:
Column 0 (NEAR): one big school window filling most of the cell, seen very close.
Column 1 (MEDIUM): the front of one small two-storey townhouse, whole facade visible.
Column 2 (FAR): a green hill rising from the bottom edge with one SMALL, distant little house on its top.

FRAMING LOCK: within each column all three rows use the IDENTICAL camera, size and position of wall, window, door, mailbox, hill and house; only the person, hands and the small described detail change.

Exact cells, left to right and then top to bottom:
0. friend-wait — a wide school window with a mint frame in a cream-and-sunny-yellow wall, seen very close; one chibi child classmate with curly black hair tied in two puffs and a mint T-shirt leans on the sill, head at about local (256, 200), BOTH ARMS hugging a big box of coloured pencils against the chest; looking left, warm smile, waiting.
1. neighbor-away — a coral two-storey townhouse facade: lower left a front door with a small wall mailbox beside it, the mailbox mouth at about local (170, 360); upper right one window CLOSED with its curtain drawn and a small flower box. Nobody visible.
2. grandma-wait — a green hill rising from the bottom edge; on its top, SMALL and far away, a sky-blue little house about 170 px wide with one window at about local (330, 210); in the window a small chibi grandmother with a white hair bun, round glasses and a coral shawl holds a dark, switched-off tablet, looking left.
3. friend-happy — same as cell 0; the classmate is listening happily: eyes closed in happy arcs, big smile, still hugging the pencil box, two tiny sparkle marks near the ear.
4. neighbor-back — same facade as cell 1; a friendly young woman with a hair bun and a lilac cardigan stands at the front door next to the open mailbox, reading an open letter held in both hands, big smile; the upstairs window stays closed.
5. grandma-happy — same as cell 2; the grandmother smiles broadly looking at the tablet, whose screen now glows a plain light colour with no picture, two tiny sparkle marks.
6. friend-fail-drop — same as cell 0; the classmate still hugs the pencil box with both arms; a tablet has fallen screen-down into the little flower bed below the window with a small puff of dust; the classmate looks down, embarrassed, one small sweat drop.
7. neighbor-fail-empty — same as cell 1: window closed, curtain drawn, nobody; one small deflated, empty speech-bubble shape lies limp on the window sill; the mailbox is closed and empty.
8. grandma-fail-far — same as cell 2; the grandmother cups one hand behind her ear, frowning slightly with a puzzled open mouth, the dark tablet in her other hand.

Consistency constraints: the classmate, the young woman and the grandmother are each the same character in every cell where they appear; the grandmother stays small and far in cells 2, 5 and 8 but her face and hand gesture must still read at 400 px.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, extra people, animals, hot-air balloons, envelopes in cells other than 4, tablets in cells 0, 1, 3, 4 and 7, phones, gifts, pictures or drawings on the tablet screen, drawings inside the speech bubble, question marks, exclamation marks, musical notes, sky, clouds, sun, street, cars, full neighbourhood, scene not touching the bottom edge, camera changes between cells of the same column, text, letters, words, labels, digits, numbers, signs, school name, house numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, arrows, icons, HUD, looking right, back view, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, red alarm colours, 3D render, photorealism, blur, lens flare, heavy noise, crying, angry faces.
~~~

## 6. `pecas.png` — grade 4 × 3, célula 320 × 320

| Célula | Nome no código | O quê | Observação |
|---|---|---|---|
| 0 | `ring` | anel grande **em pé**, visto um pouco de lado: uma elipse alta de ~120 × 270, aro grosso dourado-creme com fitinhas menta em 4 pontos; **o buraco é transparente** | o código corta ao meio (atrás/na frente) e clareia quando acende |
| 1 | `form-voice` | balão de fala redondo branco, rabinho embaixo à esquerda; na borda de cima, uma boquinha coral sorrindo e uma notinha musical pequenas; **miolo branco liso e vazio** (~150 px) | forma **voz** |
| 2 | `form-letter` | envelope kraft-creme, aba aberta, com um coraçãozinho coral de lacre; uma **folha branca lisa e vazia** saindo de dentro (~150 × 110 à vista) | forma **carta** |
| 3 | `form-screen` | tablet lilás deitado, cantos redondos, um botãozinho; **tela clara lisa e vazia** (~180 × 120) | forma **telinha** |
| 4 | `msg-party` | bolo de festa com cobertura rosa e **3 velinhas acesas**, e um varalzinho de bandeirinhas em cima | 'A festa é sábado!' |
| 5 | `msg-pencil` | um lápis **amarelo** grande, na diagonal, borracha rosa, ponta apontada | 'Traga o lápis amarelo' |
| 6 | `msg-practice` | bola de futebol ao lado de um despertador redondo (ponteiros, **sem números**) | 'O treino mudou de hora' |
| 7 | `lock` | cadeado dourado fofo, fechado | pendura na cesta na trava |
| 8 | `gust` | nuvem branca fofa de **bochechas cheias soprando para a ESQUERDA**, olhos fechados, com 3 redemoinhos de vento saindo da boca para a esquerda | o vento que devolve o balão |
| 9 | `bird` | passarinho redondo laranja-coral, bagunceiro, voando para a **ESQUERDA**, asas para cima, sorriso maroto | **N2 em diante**, opcional agora |
| 10 | `guide-hand` | mãozinha chibi no ângulo de `references/mao-toque-angulo.png` | `tipX`/`tipY` medidos no MANIFEST |
| 11 | `note` | bilhete de papel creme em pé (~200 × 250), **liso e vazio**, com uma tachinha coral no alto | vira bilhete do mural |

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight where there are eyes; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. The second attached image, references/mao-toque-angulo.png, is ONLY the angle reference for cell 10.

Use case: stylized-concept
Asset type: exact game-pieces sprite sheet for a Phaser 3 educational game about one message travelling in different forms (voice, letter, screen).
Primary request: create ONE exact 4 columns × 3 rows sprite sheet on a transparent 1280 × 960 px canvas. Every cell is exactly 320 × 320 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

Cells 1, 2 and 3 are the THREE FORMS of a message. They must have the same visual weight and size, read clearly at 64 px, and each has a PLAIN, FLAT, completely EMPTY inner area where the game will place a picture — never draw anything inside it.
Cells 4, 5 and 6 are the THREE MESSAGE PICTURES. Each is one big simple object, the same visual weight as the others, readable at 64 px.

Exact cells, left to right and then top to bottom:
0. ring — one big hoop standing upright, seen slightly from the side so it reads as a tall narrow ellipse about 120 × 270 px; a thick golden-cream rim with small mint ribbons tied at four points; the hole in the middle is completely TRANSPARENT.
1. form-voice — one round white speech bubble with a short tail at the bottom-left; on its upper rim, one tiny smiling coral mouth badge and one tiny music note; the inside is a plain flat white EMPTY area about 150 px across.
2. form-letter — one cream-kraft envelope with its flap open and a small coral heart seal; one plain white sheet of paper sticks up out of it, its visible part about 150 × 110 px, plain and EMPTY.
3. form-screen — one chunky lilac tablet lying horizontal, rounded corners, one small round button; its screen is a plain pale flat EMPTY area about 180 × 120 px.
4. msg-party — one birthday cake with pink frosting and three lit candles, with a tiny string of bunting flags above it.
5. msg-pencil — one big clearly YELLOW pencil lying diagonally, pink eraser, sharpened tip.
6. msg-practice — one soccer ball next to one round alarm clock with two hands and NO numbers.
7. lock — one cute golden padlock, closed, no face.
8. gust — one fluffy white cloud with puffed cheeks, closed eyes and pursed lips, blowing to the LEFT, with three small wind swirls coming out of its mouth to the left.
9. bird — one cheeky round coral-orange little bird flying to the LEFT, wings up, big eyes and a mischievous little grin.
10. guide-hand — use references/mao-toque-angulo.png ONLY as the angle and silhouette reference. Create one cute light-brown childlike chibi hand with the same dark uniform outline, one-tone flat cel shading and white sticker keyline as the other cells. The index finger is fully extended, points UP and leans 20–25 degrees toward the LEFT; its tip is crisp and clearly the touch point. The other THREE fingers fold into distinct descending steps on the RIGHT; the THUMB folds inward across the palm; the short bare wrist descends toward the LOWER RIGHT. Exactly five digits. No click lines, no face, no sleeve.
11. note — one small blank cream paper note standing upright, about 200 × 250 px, plain and EMPTY, with one coral pushpin at its top centre.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, anything drawn inside the empty areas of cells 1, 2, 3 and 11, pictures on the tablet screen, writing on the letter, mouths or faces on the tablet or envelope, numbers on the clock, a face on the lock, a face on the ring, a filled ring hole, a pencil that is not yellow, extra objects, extra hands, extra fingers, missing fingers, click lines, radiating lines, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons other than the tablet button, panels, frames, arrows, icons, HUD, question mark, red alert colour, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, ground, floor, drop shadow on the cell, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, crying, angry faces, pointing at the viewer.
~~~

## 7. `mural.png` — 960 × 600, alfa

Um mural de cortiça com moldura de madeira clara e cantos arredondados,
pendurado por um cordão em dois pregos no alto. A cortiça é **lisa e vazia**, e
os 3 bilhetes entram por código em x 400 / 640 / 880 (na tela), no terço do meio.

### Prompt copiável

~~~text
STYLE — USE THE ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.

Use case: stylized-concept
Asset type: single UI board sprite for a Phaser 3 educational game.
Primary request: create ONE cute cork message board on a transparent 960 × 600 px canvas, filling it with about 4% transparent margin: a wide rectangular board with a light honey-wood frame and softly rounded corners, hanging by one short cord from two small nails at its top edge. The warm cork surface inside the frame is plain, evenly textured with a few tiny flat speckles, and completely EMPTY, because the game pins notes onto it. Straight-on view.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, notes, papers, photos, pins, pictures, drawings, stickers, stamps on the cork, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, arrows, icons, HUD, question mark, wall, background, floor, shadow, perspective view, heavy wood grain, grid lines, cropped edges, white backing in transparent areas, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise.
~~~

## 8. `cover-balao-do-recado.png` — 1672 × 941, opaco

A capa mostra o balão da criança atravessando um anel dourado sobre o bairro,
com o **envelope** pendurado na cesta e um rastro colorido atrás. À direita, a
vovó acena da janela. Em cima vai o título `Balão do Recado`. Anexe a referência
`19` e as `balao.png` e `destinos.png` aprovadas.

### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions; short cohesive palette; crisp shapes, no painterly brushwork. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing. NO white sticker keyline here — this is a full cover, not a sticker.
CHARACTERS — THE SECOND ATTACHED IMAGE (balao.png) IS THE BALLOON AND CHILD REFERENCE, AND THE THIRD (destinos.png) IS THE GRANDMA REFERENCE: draw exactly these.

Use case: stylized-concept
Asset type: catalogue cover illustration for the educational game “Balão do Recado”.
Primary request: create one opaque 1672 × 941 px cover illustration. At the very top, horizontally centred, write the exact game title “Balão do Recado” in large chunky rounded playful multicolour letters with a thick dark outline and slight dimensional volume, readable at thumbnail size. Spelling lock: render exactly three words, letter for letter, with capitalization and the tilde exactly: B-a-l-ã-o [space] d-o [space] R-e-c-a-d-o. The “ã” in “Balão” MUST carry its tilde. No extra words, subtitle, punctuation, duplicated letters, omitted letters or alternate spelling. Below the title, over a cute colourful neighbourhood of small rounded houses and trees under a bright sky, the coral, sunny-yellow and mint hot-air balloon with the cheerful child in the basket is flying to the RIGHT straight THROUGH a big golden hoop with mint ribbons, its burner flame lit, a short colourful trail behind it; a small cream envelope hangs from a cord on the left side of the basket. On the right, the sweet grandmother leans out of her sky-blue house window, waving and smiling toward the balloon. Make "a balloon carrying a message through a hoop to someone waiting" readable at thumbnail size.

Composition and technical constraints: exact 1672 × 941 landscape cover; clean upper band for the complete title; title centred and fully inside the canvas; balloon large beneath it; complete balloon, hoop, envelope and grandmother visible; opaque; no white sticker keyline; no written interface beyond the requested title.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, other people, animals, birds, extra balloons, extra words, misspelled title, missing tilde, subtitle, punctuation, numbers, labels, captions, signs with writing, watermark, logo, score, HUD, buttons, question mark, speech bubbles, arrows, white sticker keyline, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, cropped title, cropped balloon, cropped grandmother, sad faces, crying, angry faces.
~~~

## 10. A comunicação acontecendo — `balao-2.png`, `extras.png` e a nova célula 1 de `pecas.png`

Da seção *A COMUNICAÇÃO ACONTECENDO* do plano. Cada modo ganha uma encenação na
entrega, e um **balão de pensamento** prova se o recado chegou: com o **mesmo
desenho** do bilhete, chegou; só com `?`, não chegou. O `?`, as ondas de som, o
arco de sinal e o desenho dentro do pensamento são **código**. As folhas abaixo
trazem só o que o código não desenha.

### 10.1 `balao-2.png` — grade 2 × 1, célula 512 × 512 (1024 × 512)

**Anexar** `references/19-chibi-figurinhas.jpg` (estilo) e a `balao.png` aprovada
(o balão e o menino). É o **mesmo balão, o mesmo menino e a mesma escala** da
`balao.png`: o fundo da cesta em y 470, centrado em x 256, e o gancho de latão
na lateral esquerda da cesta em ~(174, 398). Queimador apagado nas duas.

| Célula | Nome no código | Pose |
|---|---|---|
| 0 | `balloon-talk` | o menino se debruça na borda da cesta para a **DIREITA**, as duas mãos **em concha em volta da boca**, boca aberta chamando, olhos animados |
| 1 | `balloon-tablet` | o menino segura com as duas mãos um **tablet lilás** (o mesmo de `pecas` 3) virado para quem olha, na altura do peito; a **tela é clara, lisa e vazia** (~120 × 80 px, centro em ~(256, 372)): o código põe o rosto da vovó ali |

#### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions, big head and little body; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.
CHARACTER LOCK — THE SECOND ATTACHED IMAGE (balao.png) IS THE BALLOON AND CHILD REFERENCE: draw exactly this same hot-air balloon, basket, brass hook and child, with the same proportions, colours and scale.

Use case: stylized-concept
Asset type: exact character sprite sheet for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create ONE exact 2 columns × 1 row sprite sheet on a transparent 1024 × 512 px canvas. Every cell is exactly 512 × 512 px. Each drawing is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

The subject in both cells: the SAME cute round hot-air balloon from the reference, about 330 px wide, vertical gores in coral, sunny yellow and mint, a small burner frame with the burner OFF and no flame, a woven tan wicker basket on four short ropes, one small round brass hook on the LEFT side of the basket at about local (174, 398), empty. In the basket the SAME chibi child with short dark-brown hair and a sunny-yellow scarf. The whole balloon faces the RIGHT. The basket bottom sits at local y = 470, horizontally centred at x = 256.

Exact cells, left to right:
0. balloon-talk — the child leans forward over the basket rim toward the RIGHT, BOTH hands cupped around the open mouth as if calling out loud to someone far away, eyes bright and eager.
1. balloon-tablet — the child holds one chunky lilac tablet with both hands at chest height, the tablet turned to face the viewer; its screen is a PLAIN, FLAT, pale, completely EMPTY area about 120 × 80 px centred at about local (256, 372); the child smiles happily looking at it.

Consistency constraints: both cells show the IDENTICAL balloon, basket, hook and child as the reference and as each other; only the pose changes; the basket bottom lines up at local y = 470.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a second child, adults, animals, a face on the balloon, flame, smoke, sound waves, speech bubbles, signal arcs, anything drawn on the tablet screen, faces on the tablet screen, phones, letters, envelopes, anything hanging from the hook, sandbags, flags, clouds, sky, ground, shadow, background, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, arrows, icons, HUD, question mark, facing left, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, angry faces.
~~~

### 10.2 `extras.png` — grade 4 × 3, célula 256 × 256 (1024 × 768)

**Anexar** `references/19-chibi-figurinhas.jpg` (estilo) e a `destinos.png`
aprovada (a caixa de correio, a porta da vizinha e a vovó) e a `balao.png` (o menino da carinha da voz).

| Célula | Nome no código | O quê |
|---|---|---|
| 0 | `thought` | **balão de pensamento** vazio: uma nuvenzinha branca (~190 × 140) no alto à direita e **2 bolinhas** descendo para baixo à esquerda; o miolo da nuvem é **liso, branco e vazio** (o código põe o desenho ou o `?`) |
| 1 | `sun` | sol redondo amarelo-sol com raios curtos, carinha sorrindo de olhos fechados |
| 2 | `moon` | lua crescente creme com carinha dormindo e 2 estrelinhas |
| 3 | `mailbox-up` | a **mesma caixa de correio** de parede da vizinha em `destinos.png`, agora com uma **bandeirinha coral LEVANTADA** na lateral |
| 4 | `stamp-voice` | ícone de carimbo **carinha falando**: a cabeça do menino do balão de perfil para a direita, boca bem aberta, 3 arquinhos de som saindo da boca (a mesma carinha da célula 1 de `pecas`) |
| 5 | `stamp-letter` | ícone de carimbo **envelope** fechado, com um coraçãozinho |
| 6 | `stamp-screen` | ícone de carimbo **tablet** deitado, tela lisa |
| 8 | `away-sign` | **plaquinha de "saiu"** pendurada num prego por um cordãozinho, **sem texto**: um bonequinho andando para fora de uma portinha, com pegadinhas atrás. Vai na porta da vizinha, ~90 px de largura |
| 9 | `friend-face` | retrato de perto da colega menina, para a videochamada do N3 (§11.3) |
| 10 | `bird-flap` | opcional: o passarinho com as asas para baixo (§11.3) |
| 11 | — | vazia |
| 7 | `grandma-face` | retrato **de perto** da mesma vovó de `destinos.png` (coque branco, óculos redondos, xale coral), da altura dos ombros para cima, sorrindo e acenando, enquadrado para caber numa tela de videochamada |

Os **3 carimbos** (4–6) são ícones simples e **grossos**: contorno largo, no
máximo 2 cores chapadas, sem detalhe pequeno. Têm de se ler a **40 px**.

#### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight where there are eyes; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.
REFERENCE LOCK — THE SECOND ATTACHED IMAGE (destinos.png) shows the neighbour's wall mailbox, her front door and the grandmother: cell 3 is exactly that mailbox, and cell 7 is exactly that grandmother. THE THIRD ATTACHED IMAGE (balao.png) shows the boy in the balloon: the face in cell 4 is exactly that boy.

Use case: stylized-concept
Asset type: exact small-pieces sprite sheet for a Phaser 3 educational game about one message travelling by voice, letter and video call.
Primary request: create ONE exact 4 columns × 3 rows sprite sheet on a transparent 1024 × 768 px canvas. Every cell is exactly 256 × 256 px. Each piece is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

Exact cells, left to right and then top to bottom:
0. thought — one empty thought bubble: a soft white cloud shape about 190 × 140 px in the upper right of the cell, and two small white circles trailing down toward the lower left; the inside of the cloud is PLAIN, FLAT, white and completely EMPTY.
1. sun — one round sunny-yellow sun with short rounded rays and a happy face with closed smiling eyes.
2. moon — one cream crescent moon with a sleepy closed-eye face and two tiny stars beside it.
3. mailbox-up — the SAME small dark wall mailbox as the neighbour's in the reference, now with one small coral flag on its side RAISED straight up.
4. stamp-voice — one bold simple icon: the head of the SAME boy from balao.png (short dark-brown hair, sunny-yellow scarf collar) seen in side profile facing RIGHT, mouth wide open talking, with exactly three short curved sound arcs coming out of the mouth.
5. stamp-letter — one bold simple icon of a closed envelope with a small heart seal.
6. stamp-screen — one bold simple icon of a horizontal tablet with a plain flat screen.
7. grandma-face — a close head-and-shoulders portrait of the SAME grandmother from the reference (white hair bun, round glasses, coral shawl), smiling warmly and waving one hand, framed tight as if seen on a video-call screen, facing the viewer.
8. away-sign — one small wooden door sign about 90 px wide hanging from a nail by a little cord, with NO text: on it, one tiny simple stick-figure person walking out of a little door toward the right, with three small footprints behind; it means "went out".
9. completely EMPTY and genuinely transparent reserved cell.
10. completely EMPTY and genuinely transparent reserved cell.
11. completely EMPTY and genuinely transparent reserved cell.

Icon rule for cells 4, 5 and 6: thick chunky outline, at most two flat colours each, no small details, all three the same size and visual weight, clearly readable at 40 px.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, anything inside the thought bubble, question marks, exclamation marks, pictures on the tablet screen, writing on the envelope, faces on the envelope and tablet stamps, words or letters on the door sign, objects in cells 9–11, extra people, other grandmothers, animals, background scenery, sky, ground, shadow on the cell, circles or frames around the stamps, text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, arrows, HUD, red alert colour, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise, sad faces, crying, angry faces.
~~~

### 10.3 `pecas.png` — célula 1 refeita (`form-voice`)

**Revisão de 29/09/2026:** a versão com 3 ondinhas no balão foi **reprovada** (parecia sinal de celular). A voz agora é uma **carinha falando**: a cabeça do menino do balão, de perfil, boca aberta com 3 arquinhos de som, e um **balão de fala pequeno** saindo dela com o miolo vazio, onde o código põe o desenho. O carimbo da voz (`extras` 4) usa a mesma carinha.

Uma célula só, **320 × 320**, que a Tesoura compõe por cima da célula 1 da
folha atual. **Anexar** `references/19-chibi-figurinhas.jpg` (estilo), a
`pecas.png` atual (tamanho e peso das outras formas) e a `balao.png` (o menino).
A carinha fica embaixo à esquerda, com o centro da cabeça em ~(95, 205); o
balão de fala fica em cima à direita, com o centro em ~(205, 120) e ~170 × 150,
e o miolo **liso e vazio** (~110 px) em ~(205, 118). O centro e o tamanho reais
do miolo vão para o MANIFEST, e o `FORM_SLOT.voice` do código segue a medida.

#### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.
SIZE LOCK — THE SECOND ATTACHED IMAGE (pecas.png) shows the current game pieces: match the line weight, keyline, size and visual weight of its cells 2 and 3 (envelope and tablet) exactly.
CHARACTER LOCK — THE THIRD ATTACHED IMAGE (balao.png) shows the boy in the balloon: the face is exactly that boy.

Use case: stylized-concept
Asset type: one single game-piece cell for a Phaser 3 educational game.
Primary request: create ONE single 320 × 320 px transparent image showing SPEAKING: in the lower left, the head of the SAME boy from balao.png (short dark-brown hair, sunny-yellow scarf collar) seen in side profile facing RIGHT, mouth wide open talking, with exactly three short curved sound arcs coming out of the mouth, the head centred at about (95, 205); in the upper right, one small round white speech bubble about 170 × 150 px centred at about (205, 120), its short tail pointing down-left to the open mouth. The inside of the speech bubble is a PLAIN, FLAT, white, completely EMPTY area about 110 px across, centred at about (205, 118). At least 8% transparent margin including the keyline. The whole piece has the same size and visual weight as the envelope and the tablet.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, wi-fi symbols, signal bars, radio waves around the bubble, music notes, mouth badges, stickers, hearts, a body below the neck, hands, a second face, anything drawn inside the bubble, more or fewer than three sound arcs, text, letters, words, labels, digits, numbers, captions, watermark, logo, user interface, buttons, frames, arrows, icons, question mark, background, shadow on the canvas, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, muddy colours, 3D render, photorealism, blur, heavy noise.
~~~

### 10.4 Correção aprovada — voz sem leitura de Wi-Fi e placa `saiu`

Esta geração **substitui** a arte de voz descrita em 10.2/10.3. Em `pecas.png`,
a célula 1 passa a mostrar a carinha falando junto do balão pequeno vazio. Em
`extras.png`, a célula 4 usa a mesma carinha sem balão; a folha passa a 4 × 3,
com a placa sem texto na célula 8 e as células 9–11 vazias. Anexar
`references/19-chibi-figurinhas.jpg`, a `pecas.png` e a `extras.png` anteriores.

#### Prompt completo usado

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eye with one bright highlight; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around every separate silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.
SIZE AND WEIGHT LOCK — THE SECOND ATTACHED IMAGE (pecas.png) and THIRD ATTACHED IMAGE (extras.png) show the current game pieces. Match their dark-navy line weight, white sticker keyline, rounded forms, scale and visual weight.

Use case: stylized-concept
Asset type: exact replacement-pieces sprite sheet for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create ONE exact 3 columns × 1 row sprite sheet on a transparent 768 × 256 px canvas. Every cell is exactly 256 × 256 px. Each drawing is complete, isolated and centred in its own cell with at least 8% transparent margin, INCLUDING its keyline. Nothing may cross a cell boundary. No drawn grid, border or divider.

Exact cells, left to right:
0. form-voice — a cute simple chibi CHILD FACE shown clearly in SIDE PROFILE, facing RIGHT and speaking, with one large glossy eye visible, round cheek, and mouth VERY WIDE OPEN. Exactly three SHORT COMIC SPEECH MARKS leave directly from the open mouth toward the right: draw them as three separate, small, roughly parallel curved dashes of similar length, one above another, all pointing horizontally right. They are NOT nested, NOT concentric, NOT a fan, and NOT a wireless symbol. Farther to the RIGHT of those tiny speech marks, include one SMALL round white speech bubble with one short tail; its interior is PLAIN, LIGHT, FLAT and COMPLETELY EMPTY, large enough for game code to add a tiny message drawing. The face plus small speech bubble read as “a person speaking a message”.
1. stamp-voice — the EXACT SAME chibi child face from cell 0, again in clear SIDE PROFILE facing RIGHT, speaking with mouth VERY WIDE OPEN and exactly three SHORT COMIC SPEECH MARKS leaving directly from the mouth. Again they are three separate small roughly parallel curved dashes of similar length, stacked loosely, NOT nested, NOT concentric and NOT a wireless icon. Make the whole face an especially bold simplified icon, with thick outline and no small details, readable at 40 px. NO speech bubble in this cell.
2. gone-sign — one cute small hanging door sign with rounded corners, suspended by a short cord. The sign has NO TEXT. In its centre is one extremely simple bold pictogram of a little person walking OUT toward the right, plus two or three tiny footprints trailing behind toward the left. The pictogram must clearly mean “went out / left”, legible at 40 px.

Consistency constraint: cells 0 and 1 show the IDENTICAL face, profile direction, colours, open mouth and three mouth-origin comic speech marks; only the small empty speech bubble is omitted from cell 1.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, front-facing face, face looking left, full body in cells 0 or 1, nested arcs, concentric arcs, expanding arcs, wireless icon, Wi-Fi symbol, cellular signal, radio tower, phone, tablet, music notes, microphone, megaphone, sticker badge, sound marks detached from the mouth, sound marks around the whole face, anything drawn inside the speech bubble, writing on the sign, the word saiu, letters, words, labels, digits, numbers, captions, watermark, logo, question mark, exclamation mark, background, floor, wall, door, shadow on the canvas, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, muddy colours, 3D render, photorealism, blur, heavy noise.
~~~

## 11. N2 e N3 — `destinos-2.png`, `destinos-3.png` e as células novas de `extras.png`

Da seção *N2 e N3 — conteúdo* do plano (aprovada em 29/09/2026). **A colega é
MENINA** (a mesma de `destinos.png`: cabelo crespo preso em dois pompons,
camiseta menta). Todo prompt anexa `references/19-chibi-figurinhas.jpg` (estilo)
e a `destinos.png` aprovada (personagens e enquadramento): **a mesma colega, a
mesma vizinha, a mesma vovó e o mesmo sobrado**.

As regras de §5 continuam: cada célula é uma cena cujo pé **encosta reto na borda
de baixo**, quem aparece olha para a **ESQUERDA**, e o enquadramento é **idêntico**
entre as células da mesma cena (só a pessoa, as mãos e o detalhe mudam). Os
**pontos de entrega** e os **rostos** de cada cena vão para o MANIFEST (a
validação do alcance da voz usa o rosto e a caixa de quem recebe).

**Sem texto nenhum na arte.** O `zzz` da vizinha dormindo e a plaquinha "saiu" são
**código** (o `zzz` sobe da janela de cima; a plaquinha é a `extras` 8), não vão na célula.

### 11.1 `destinos-2.png` (N2) — grade 3 × 2, célula 512 × 512 (1536 × 1024)

Cada célula repete **exatamente** o enquadramento da coluna correspondente de
`destinos.png`: as células 0–2 são o sobrado da vizinha (coluna 1), a 3 é a janela
da colega (coluna 0) e a 4 é o morro da vovó (coluna 2).

| Célula | id | Cena |
|---|---|---|
| 0 | `neighbor-away-phone` | o sobrado de `neighbor-away` (casa apagada, plaquinha "saiu" é código), mas a cortina da **janela de cima aberta** e, lá dentro, numa mesinha, **o celular dela** deitado com a tela apagada. Porta fechada, caixa de correio, ninguém |
| 1 | `neighbor-back-phone` | igual à 0; a vizinha **voltou**: na porta, lendo a carta, sorriso grande (como `neighbor-back`) |
| 2 | `neighbor-fail-phone` | igual à 0; o celular na mesinha **tocando sozinho**: tela acesa clara e lisa, 3 tracinhos de vibração dos dois lados; ninguém em casa |
| 3 | `friend-fail-letter` | igual a `friend-wait` (a colega com os braços ocupados pela caixa de lápis); **um envelope caído** no canteiro embaixo da janela; ela olha para baixo, sem graça, com uma gotinha de suor |
| 4 | `grandma-fail-letter` | igual a `grandma-wait`; **um envelope caído** na grama no pé do morro; a vovó na janela olhando para longe, sem ver |
| 5 | `neighbor-fail-empty-phone` | igual à 0 (celular apagado na mesinha, ninguém); um **balãozinho de fala vazio e murcho** caído no peitoril da janela de cima |

#### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions, big head and little body; tiny cartoon emotion marks only where asked; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.
CHARACTER AND FRAMING LOCK — THE SECOND ATTACHED IMAGE (destinos.png) is the reference sheet of this game: its column 0 is the school window with the girl classmate (curly black hair in two puffs, mint T-shirt, hugging a box of coloured pencils), its column 1 is the neighbour's coral two-storey townhouse, and its column 2 is the green hill with the grandmother's small sky-blue house. Draw exactly these characters and places, with the SAME camera, size and position as the matching column.

Use case: stylized-concept
Asset type: exact destination-scene sprite sheet for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create ONE exact 3 columns × 2 rows sprite sheet on a transparent 1536 × 1024 px canvas. Every cell is exactly 512 × 512 px. Each cell is one small scene whose bottom edge is cut perfectly straight and touches the BOTTOM edge of its cell; the top, left and right keep at least 8% transparent margin. Nothing crosses into a neighbouring cell. No drawn grid, border or divider. Every person looks to the LEFT.

Exact cells, left to right and then top to bottom:
0. neighbor-away-phone — the neighbour's coral townhouse exactly as in reference column 1, the front door closed and the wall mailbox beside it; the curtain of the UPPER window is now OPEN and inside, on a small table, lies her mobile phone with a dark switched-off screen. Nobody visible.
1. neighbor-back-phone — same as cell 0; the friendly young woman with a hair bun and a lilac cardigan stands at the front door next to the open mailbox, reading an open letter held in both hands, big smile; the phone still lies on the table inside.
2. neighbor-fail-phone — same as cell 0; the phone on the table is RINGING on its own: its screen glows a plain light colour with no picture, and three short vibration marks on each side; nobody at home.
3. friend-fail-letter — the school window exactly as in reference column 0; the girl classmate still hugs the pencil box with both arms; one envelope has fallen into the little flower bed below the window; she looks down, embarrassed, with one small sweat drop.
4. grandma-fail-letter — the hill and small house exactly as in reference column 2, small and far; the grandmother at the window looks into the distance; one envelope lies fallen in the grass at the foot of the hill.
5. neighbor-fail-empty-phone — same as cell 0 (the dark phone on the table, nobody at home); one small, empty, deflated speech-bubble shape lies limp on the UPPER window sill.

Consistency constraints: every person and place is the SAME as in the reference sheet; the camera, size and position of each place are identical to its reference column; only the described details change.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a boy classmate, extra people, animals, hot-air balloons, speech bubbles, pictures or text on the phone screen, writing on the envelope or letter, question marks, exclamation marks, musical notes, sleep letters, sky, clouds, sun, street, cars, full neighbourhood, scene not touching the bottom edge, camera changes versus the reference columns, text, letters, words, labels, digits, numbers, signs, school name, house numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, arrows, icons, HUD, looking right, back view, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, red alarm colours, 3D render, photorealism, blur, lens flare, heavy noise, crying, angry faces.
~~~

### 11.2 `destinos-3.png` (N3) — grade 4 × 3, célula 512 × 512 (2048 × 1536)

**Cada LINHA é uma cena** e as colunas são **antes / feliz / erro 1 / erro 2**.
As situações trocam, as pessoas não: é para a criança ler a situação e não
decorar a pessoa. **A distância continua sendo a pista:** a vovó perto fica
**grande e perto** como a janela da colega em `destinos.png`, e a colega longe
fica **pequena e longe** como a casinha da vovó.

| Linha | Cena | 0 antes | 1 feliz | 2 erro 1 | 3 erro 2 |
|---|---|---|---|---|---|
| 0 | `grandma-near`: **a vovó veio visitar**. Um banco de praça **grande e perto** (ocupa quase a célula, como a janela da colega), a vovó sentada **tricotando com as duas mãos** (novelo de lã no colo); não há caixa de correio | esperando, sorrindo para a esquerda | ouvindo, olhos fechados em arco, ainda tricotando | `-fail-drop`: um celular escorregou e caiu na grama, a lã embolada no colo, cara sem graça | `-fail-letter`: um envelope caído no chão ao lado do banco, ela sem ver |
| 1 | `friend-far`: **a colega viajou**. O mar sobe da borda de baixo; **longe, pequena** (~170 px), num barquinho, a colega com um celular na mão; não há caixa de correio | esperando, celular apagado | olhando a tela acesa (clara e lisa, sem imagem), feliz | `-fail-far`: mão em concha atrás da orelha, testa franzida | `-fail-letter`: um envelope boiando na água perto do barquinho |
| 2 | `neighbor-asleep`: **a vizinha está dormindo**. O **mesmo sobrado** de `destinos.png`; a **janela de cima fechada** com a cortina fechada (é o quarto); pela janela de baixo, a cortina aberta e **o celular carregando** na mesinha (fio na tomada); caixa de correio na porta; ninguém à vista | dormindo (ninguém à vista) | a vizinha **na porta lendo a carta**, espreguiçando-se feliz, a cortina de cima aberta | `-fail-voice`: um balãozinho de fala vazio e murcho no peitoril da janela de cima | `-fail-phone`: o celular **tocando** na mesinha (tela acesa lisa, tracinhos de vibração), a janela de cima continua fechada |

#### Prompt copiável

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; small chibi proportions, big head and little body; tiny cartoon emotion marks only where asked; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.
CHARACTER LOCK — THE SECOND ATTACHED IMAGE (destinos.png) is the reference sheet of this game: the girl classmate (curly black hair in two puffs, mint T-shirt), the friendly young neighbour (hair bun, lilac cardigan) and her coral two-storey townhouse, and the grandmother (white hair bun, round glasses, coral shawl). Draw exactly these characters and this townhouse.

Use case: stylized-concept
Asset type: exact destination-scene sprite sheet for a Phaser 3 educational game for Brazilian children aged 6–7.
Primary request: create ONE exact 4 columns × 3 rows sprite sheet on a transparent 2048 × 1536 px canvas. Every cell is exactly 512 × 512 px. Each cell is one small scene whose bottom edge is cut perfectly straight and touches the BOTTOM edge of its cell; the top, left and right keep at least 8% transparent margin. Nothing crosses into a neighbouring cell. No drawn grid, border or divider. Every person looks to the LEFT.

Each ROW is ONE scene; the four columns are, left to right: before, happy, mistake 1, mistake 2. FRAMING LOCK: within each row the four cells use the IDENTICAL camera, size and position of every object; only the person, hands and the described detail change.
DISTANCE LOCK: row 0 is NEAR (big, filling most of the cell); row 1 is FAR (the person tiny and distant, about 170 px); row 2 is MEDIUM (the whole townhouse facade).

Row 0 — grandma-near: the grandmother sits on one big park bench seen very close, filling most of the cell, knitting with BOTH hands, a ball of yarn in her lap; no mailbox anywhere.
0. waiting, smiling, looking left.
1. listening happily, eyes closed in happy arcs, still knitting.
2. a mobile phone has slipped and fallen screen-down into the grass in front of the bench, the yarn tangled in her lap, embarrassed face, one small sweat drop.
3. one envelope lies fallen on the ground beside the bench; she has not noticed it.

Row 1 — friend-far: calm sea water rising from the bottom edge; far away and SMALL (about 170 px), one little rowing boat with the girl classmate sitting in it holding a mobile phone; no mailbox anywhere.
4. waiting, the phone screen dark.
5. looking happily at the phone, its screen glowing a plain light colour with no picture.
6. one hand cupped behind her ear, slight frown, puzzled open mouth.
7. one envelope floating on the water near the boat.

Row 2 — neighbor-asleep: the SAME coral two-storey townhouse as in the reference, whole facade; the UPPER window is CLOSED with its curtain drawn (her bedroom); through the LOWER window, curtain open, a mobile phone lies on a small table charging with a cable to a wall socket; the wall mailbox beside the front door.
8. nobody visible; the phone screen dark.
9. the neighbour stands at the front door stretching happily, reading an open letter, the upper curtain now open.
10. one small, empty, deflated speech-bubble shape lies limp on the upper window sill; the upper window still closed.
11. the phone on the table is RINGING: screen glowing a plain light colour with no picture, three short vibration marks on each side; the upper window still closed.

Consistency constraints: the characters are the SAME as in the reference sheet in every cell where they appear; the tiny classmate in row 1 must still read as the girl with two hair puffs at 400 px.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a boy classmate, extra people, animals, hot-air balloons, pictures or text on phone screens, writing on the envelope or letter, sleep letters, Z letters, zzz, question marks, exclamation marks, musical notes, sky, clouds, sun, moon, cars, full neighbourhood, scene not touching the bottom edge, camera changes between cells of the same row, text, letters, words, labels, digits, numbers, signs, house numbers, captions, watermark, logo, title lettering, user interface, buttons, panels, frames, arrows, icons, HUD, looking right, back view, grid lines, visible sprite-sheet borders, cell borders, gaps, white cell backing, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, red alarm colours, 3D render, photorealism, blur, lens flare, heavy noise, crying, angry faces.
~~~

### 11.3 `extras.png` — células 9 e 10 (para compor na folha)

Duas imagens soltas de **256 × 256**, que a Tesoura compõe nas células vazias da
folha atual. **Anexar** `references/19-chibi-figurinhas.jpg`, a `extras.png`
atual (tamanho e peso, a célula 7 é o par da 9) e a `destinos.png` (a colega) —
e, para a célula 10, a `pecas.png` (o pássaro da célula 9).

| Célula | id | O quê |
|---|---|---|
| 9 | `friend-face` | retrato **de perto** da **mesma colega menina** de `destinos.png` (cabelo crespo preso em dois pompons, camiseta menta), dos ombros para cima, sorrindo e acenando, de frente, enquadrado como o `grandma-face` (célula 7), para a videochamada do N3 |
| 10 | `bird-flap` | **opcional:** o mesmo passarinho de `pecas` 9, voando para a ESQUERDA, com as **asas para baixo** (a 2ª pose do bater de asas), mesmo tamanho e mesma posição do corpo |
| 11 | — | vazia |

#### Prompt copiável — célula 9

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.
SIZE LOCK — THE SECOND ATTACHED IMAGE (extras.png) shows the current small pieces: match the size, framing and visual weight of its cell 7 (the grandmother's close portrait) exactly.
CHARACTER LOCK — THE THIRD ATTACHED IMAGE (destinos.png) shows the girl classmate: draw exactly this girl.

Use case: stylized-concept
Asset type: one single small piece for a Phaser 3 educational game.
Primary request: create ONE single 256 × 256 px transparent image: a close head-and-shoulders portrait of the SAME girl classmate from the reference (curly black hair tied in two puffs with mint scrunchies, mint T-shirt), smiling warmly and waving one hand, facing the viewer, framed tight as if seen on a video-call screen, the same size and framing as the grandmother portrait in cell 7 of the reference sheet. At least 8% transparent margin including the keyline.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a boy, extra people, the pencil box, a phone frame, a screen border, background, text, letters, words, labels, digits, numbers, captions, watermark, logo, user interface, buttons, arrows, icons, question mark, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, muddy colours, 3D render, photorealism, blur, heavy noise, sad faces.
~~~

#### Prompt copiável — célula 10 (opcional)

~~~text
STYLE — USE THE FIRST ATTACHED IMAGE references/19-chibi-figurinhas.jpg AS THE ART STYLE REFERENCE, and match its rendering exactly: cute chibi / kawaii anime game art; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE rounded shapes with few details; FLAT cel shading with exactly ONE hard-edged shadow tone and no gradients; big glossy expressive eyes with one bright highlight; short cohesive palette; crisp shapes, no painterly brushwork; a thin even white sticker keyline around the whole silhouette. Take ONLY the art style from the first attached image: do NOT copy its characters, clothes, poses, scenes, symbols or framing.
CHARACTER LOCK — THE SECOND ATTACHED IMAGE (pecas.png) shows the little bird in its cell 9: draw exactly this bird, same colours, body size and face.

Use case: stylized-concept
Asset type: one single animation pose for a Phaser 3 educational game.
Primary request: create ONE single 256 × 256 px transparent image: the SAME cheeky round coral-orange little bird from the reference, flying to the LEFT, with both wings pushed DOWN (the second pose of a wing flap), the body in the same size and position as in the reference, big eyes and a mischievous little grin. At least 8% transparent margin including the keyline.

DO NOT INCLUDE: any character or recognizable cast member from the style reference, a different bird, extra birds, wings up, flying right, background, sky, clouds, motion lines, text, letters, words, labels, digits, numbers, captions, watermark, logo, user interface, buttons, arrows, icons, cropped edges, painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, muddy colours, 3D render, photorealism, blur, heavy noise.
~~~

## 9. O que conferir quando a arte chegar (Tesoura / Ferro)

- as grades exatas: `balao` 1024 × 1024, `destinos` 1536 × 1536, `pecas`
  1280 × 960; o corte medido por colunas na folha inteira, sem peça cruzando
  célula;
- `bg-bairro` em 2560 × 720, **com a emenda testada** (a ponta direita colada na
  esquerda, lado a lado, sem degrau) e nada do bairro acima de y 560;
- **os miolos vazios** das células 1, 2, 3 e 11 de `pecas`, e o **buraco
  transparente** do anel (o alfa conferido pixel a pixel no centro);
- o lápis amarelo **amarelo**; o relógio sem números;
- o balão igual nas 4 poses, voltado para a **direita**, com chama **só** na célula 1;
  medir e registrar o centro do conjunto, o gancho e o fundo da cesta;
- em `destinos`, o cenário encostando na borda de baixo, o enquadramento
  idêntico nas 3 células de cada coluna, perto/médio/longe legíveis, todos
  olhando para a **esquerda**, e os 3 pontos de entrega medidos;
- `tipX`/`tipY` do dedo medidos;
- a grafia do título da capa conferida letra a letra, **com o til de "Balão"**;
- em `balao-2`, o balão e o menino idênticos à `balao.png` (cesta em y 470, gancho no mesmo lugar) e a tela do tablet vazia; em `extras`, o miolo do pensamento vazio e os 3 carimbos legíveis a 40 px; a nova célula 1 de `pecas` no mesmo lugar e tamanho da antiga;
- em `destinos-2` e `destinos-3`, o enquadramento idêntico ao da coluna/linha de referência, a colega menina e a vizinha iguais às de `destinos`, perto/longe legíveis, e o **rosto** e o **ponto de entrega** de cada cena medidos; em `extras`, as células 9 e 10 no tamanho das vizinhas;
- o `MANIFEST.md` publicado com as medidas acima. O centro do balão entra na
  folga do anel (PLANEJAMENTO §6).
