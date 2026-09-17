# Duelo das Fontes — TEXTURAS.md

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)
Destino: `src/assets/games/EF04CO08/duelo-das-fontes/`

**Cinco arquivos para jogar, mais a capa do catálogo.**

> **Revisão 3 — a direção de arte mudou.** O estilo deixou de ser o traço de
> graphic novel infantil da família e passou a ser **vetor chapado de animação**,
> a partir das imagens de referência que o usuário anexa às gerações: contorno
> preto grosso e uniforme, cor sólida sem degradê, paleta neon, estrelinhas de
> quatro pontas e xadrez. A lista de arquivos, as grades e os enquadramentos
> **não mudaram** — mudaram os cinco prompts, a paleta e o negativo. Ver §2.

> **Revisão 2.** A lista da revisão 1 tinha um guichê de persiana e oito selos de
> fonte. Com as janelas virando **vizinhos que levantam uma plaquinha**, o móvel
> saiu e entraram as **pessoas**; e como quem não sabe do assunto levanta **o
> próprio ícone** (§7 do planejamento), a folha de pictogramas caiu de 32 para 30
> células.

> **A unidade de custo é o arquivo, não a peça.** Uma folha com trinta células
> custa uma geração, igual a um desenho solto. Por isso os seis vizinhos vieram
> numa folha só, as quatro caras do robô em outra, e **todos** os pictogramas do
> jogo numa terceira.

> **O que muda de estado a cada quadro é `Graphics`.** A plaquinha que gira, o
> cadeado, o avião de papel, a bolinha amassada, o cesto, o clarão do megafone,
> os dois botões e **todo o texto** são desenhados pelo código. O jogo tem de ser
> jogável e vencível com **zero textura carregada** — e o robô continua inflando
> e murchando sem nenhum PNG, porque isso é `scaleY`.

---

## 0. A lista

| # | Arquivo | Dimensão | Grade | Fundo | O que é | Prioridade |
|---:|---|---:|---|---|---|---|
| 1 | `robo.png` | 1024 × 1024 | 2 × 2 de 512 | alfa real | o Espalha-Boato em quatro estados | **insubstituível** |
| 2 | `vizinhos.png` | 1152 × 768 | 3 × 2 de 384 | alfa real | os seis vizinhos, de meio corpo | **insubstituível** |
| 3 | `icones.png` | 1152 × 960 | 6 × 5 de 192 | alfa real | os 30 pictogramas do jogo inteiro | importante |
| 4 | `bg-balcao.png` | 1672 × 941 | imagem única | opaco | a praça do bairro com o balcão | importante |
| 5 | `botoes.png` | 512 × 512 | 2 × 2 de 256 | alfa real | os dois ícones dos botões, a mão do tutorial e o megafone | importante |
| 6 | `cover-duelo-das-fontes.png` | 1672 × 941 | imagem única | opaco | a capa do catálogo | por último |

**O #1 e o #2 são o jogo.** O robô é o adversário e o placar ao mesmo tempo; os
vizinhos são as fontes. O **#3 tem reserva** (círculo com a inicial) e o **#4
também** (degradê com uma faixa de madeira) — os dois podem chegar depois sem
travar nada.

> **Cada prompt das seções 3 a 8 é completo e se copia inteiro.** O estilo e o
> negativo já estão dentro de cada um. O único trabalho manual é **anexar as
> imagens de referência** junto com o texto.

### O que é `Graphics`, e por quê

- **o texto todo** — manchete (42 px) e plaquinhas (30 px): é texto de verdade,
  medido e quebrado pelo código;
- **a plaquinha e o giro dela** (`FX.flip`), e o balanço de quando ela chama a
  atenção no segundo erro;
- **os dois botões**, o cadeado, o bilhete âmbar, a faixa de recado;
- **o avião de papel**, a **bolinha amassada**, o **cesto**;
- **o clarão do megafone** e as nuvenzinhas que ele solta;
- e a interface de plataforma — cabeçalho, pílula, bolinhas de fase, vidas, `?`,
  estrelas, confete, moldura — que é igual nos 49 jogos.

> **Nenhuma letra em nenhum PNG.** Nem no jornal da Nina, nem na plaquinha, nem
> na placa da praça. Onde um desenho precisar parecer escrito, use **linhas
> cinzas onduladas**. Letra dentro do PNG vira lixo por baixo do texto de
> verdade, e aqui o texto de verdade é a mecânica.

---

## 1. As quatro regras que governam esta arte

> **1. O robô é engraçado, e nunca ameaçador.**

Vilão de desenho: barrigudo, antena torta, megafone no lugar de uma das mãos.
Ele insiste, ri quando consegue e murcha quando não. **Nunca aponta para quem
joga, nunca mostra dente de raiva, nunca tem olho vermelho.** Quando grita,
grita para o lado do bairro; no quadro `insiste`, o gesto aponta para o
**balcão**, para dentro da tela.

> **2. O robô é feito para ser esticado.**

Ele infla e murcha por `scaleY`/`scaleX`, ancorado nos pés. Por isso o desenho
tem de ter **corpo de balão**: tronco arredondado e liso, sem cinto, sem
faixa horizontal, sem detalhe que denuncie o esticão. Uma listra reta no peito
vira uma listra torta quando ele cresce.

> **3. Os seis vizinhos são gente comum do bairro.**

Meio corpo, virados levemente para o centro da tela, **de mãos livres** — quem
segura a plaquinha é o código, e a plaquinha é `Graphics`. Nada de crianças: são
adultos e adolescentes do bairro, cada um com uma peça de roupa ou objeto que
diga o que ele faz sem uma palavra.

> **4. O fundo é fundo.**

A metade de cima da tela leva a manchete e a faixa de recado por cima do cenário.
A arte ali é **chapada e sem detalhe fino** — blocos grandes de cor, nenhuma
textura. No jogo entra um véu (`A.veil`, **0,55**) e um blur mínimo
(`preFX.addBlur(..., 0.25)`).

**Neste estilo o véu trabalha mais e o blur trabalha menos**, e vale entender por
quê: cor chapada neon não perde força com desfoque, perde com véu; e borrar
contorno grosso lê como defeito de arte, não como profundidade. Quem escurece o
fundo é o véu — é ali que se mexe se a manchete não estiver saltando.

---

## 2. Estilo e paleta

### As imagens de referência vão anexadas em TODAS as gerações

**Este jogo sai da linha visual da família.** Os outros (Guardião Ético, Mesa de
Edição, Expedição Pixel) usam traço de graphic novel infantil, com contorno de
espessura variável e sombreado *cel*. Aqui a referência é **vetor chapado de
animação** — contorno preto grosso e uniforme, cor sólida sem degradê nenhum,
paleta neon, estrelinhas de quatro pontas e blocos de xadrez como enfeite.

É uma escolha do dono do projeto, e ela tem ganho e preço:

- **ganho:** é o estilo mais legível que existe para tela pequena. Contorno
  grosso e cor chapada sobrevivem a 390 px de largura melhor que qualquer
  sombreado — e num jogo cujo pictograma aparece a 16 px reais, isso é mecânica,
  não gosto;
- **preço:** o Duelo das Fontes não vai parecer irmão dos outros jogos do
  catálogo. Se um dia isso incomodar, o que muda são **os prompts deste
  arquivo** — o código não sabe de estilo nenhum.

**Anexe as mesmas imagens de referência em todas as gerações.** Guarde-as em
`references/` (fora de `src/`, para não entrar no bundle).

### As duas disciplinas, e as duas são obrigatórias

> **1. Da referência se tira o TRAÇO e a PALETA, nunca o elenco.**

As imagens são de uma série japonesa com personagens registrados e
reconhecíveis. O que se copia é **como a linha e a cor são feitas**. O que
**não** se copia, em nenhuma hipótese: os personagens, os penteados-assinatura,
as roupas, os anjos, os demônios, as auréolas, os chifres, as armas, o letreiro
e a composição de cartaz. Aqui os personagens são **gente comum de um bairro
brasileiro**, e o adversário é **um robô de sucata**.

> **2. A referência é de uma série adulta. O jogo é para crianças de 9 anos.**

O traço é perfeitamente infantil; o *design de personagem* da série não é. Então
os seis vizinhos entram com **roupa comum, cobrindo o corpo**: nada de salto
alto, barriga de fora, saia curta, lingerie, decote, pose de pin-up, pose de
quadril jogado, cigarro, bebida ou arma. Isso está no negativo de todos os
prompts, e é a única parte deste arquivo que não se negocia.

### A linha de estilo e o negativo já estão dentro de cada prompt

**Os cinco blocos das seções 3 a 7 são completos.** Copie o bloco inteiro,
anexe as imagens de referência, e gere. Não há nada para colar por cima.

O bloco abaixo é só a **fonte** desse pedaço comum, para quando um arquivo novo
precisar entrar na lista — e para você poder editar o estilo num lugar só e
repassar aos cinco.

~~~text
STYLE: match the drawing style of the ATTACHED REFERENCE IMAGES — flat vector
cartoon animation art: very thick, even black outlines of uniform weight; large
areas of flat solid colour with NO gradients, NO airbrush and almost no shading;
bold simplified geometric shapes; hair drawn as one sharp angular silhouette;
big round eyes with simple flat highlights; clean stylised bodies with long
simple limbs; a saturated neon palette of hot pink, magenta, cyan, electric
blue, yellow, white and black; four-pointed sparkle stars and chequerboard
blocks used as flat graphic accents.
Take ONLY the drawing style and the colour language from the references. Do NOT
copy their characters, their hairstyles, their outfits, their character colour
schemes, their logos, their title lettering, their poses or their subject
matter. All characters here are ordinary human Brazilians in ordinary everyday
clothes that cover the body.
~~~

### As cores do jogo

O jogo irmão da mesma habilidade (Caça à Fonte Confiável) é **biblioteca à
noite**, índigo escuro e madeira. Este é o oposto: **praça de bairro em neon
chapado**. Quem pegar os dois na trilha não vai achar que jogou o mesmo jogo.

| Uso | Hex |
|---|---|
| contorno (grosso, uniforme) | `#1b1626` |
| céu | `#4ec3f5` |
| faixa alta do horizonte | `#f45fb0` |
| casas do bairro | `#ffd84d` · `#ff7bbd` · `#8ad6ff` |
| calçada | `#f2ecff` |
| tampo do balcão | `#ffb03b` |
| frente do balcão | `#e0761c` |
| corpo do robô | `#b9c6d8` |
| detalhe do robô | `#ff3d7f` |
| papel da manchete (código) | `#fffdf5` |
| plaquinha (código) | `#ffe9a8` |
| ESPALHAR (código) | `#2f7dff` |
| SEGURAR (código) | `#a44dff` |
| acerto (código) | `#35d98a` |
| TRAVA e bilhete (código) | `#ffb020` |

**Os dois botões são azul e roxo, nunca verde e vermelho.** Verde é acerto e
âmbar é erro neste catálogo: um botão verde diria qual é a resposta certa antes
de a criança decidir.

**O véu do fundo sobe de 0,46 para 0,55, e o blur cai para 0,25.** A paleta é
neon: um bloco chapado de rosa-choque atrás de um texto branco de 42 px briga de
igual para igual, e é o véu que resolve. Já o blur precisa encolher — borrar
contorno grosso e cor chapada lê como defeito de arte, não como profundidade.

### O negativo — também já embutido nos cinco prompts

Está aqui inteiro para poder ser lido e discutido; nos prompts ele aparece depois
de `DO NOT INCLUDE:`.

~~~text
text, letters, words, labels, digits, numbers, captions, signature, watermark,
logo, brand, title lettering, comic cover layout,
user interface, app window, browser, toolbar, app icons, cursor, mouse pointer,
emoji, speech bubble, green check mark, red X mark, warning sign, thumbs up,
angels, demons, halos, horns, wings, tails, pointed ears, fantasy creatures,
twin tails, gothic lolita dress, striped thigh-high stockings, lingerie,
underwear, high heels, exposed midriff, short skirt, cleavage, bare legs,
pin-up pose, cocked hip, sultry expression, cigarette, alcohol,
guns, weapons, sword, fighting, punching, explosion,
angry robot, red glowing eyes, sharp teeth, robot pointing at the viewer,
scared child, crying child, scolding adult,
recognisable anime characters, copyrighted characters, fan art,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard on the alpha,
gradients, airbrush shading, soft shading, 3D render, photorealistic, blur,
lens flare, noise, paper grain, gradient banding.
~~~

Três blocos deste negativo merecem explicação:

- **`gradients, airbrush shading, soft shading, paper grain`** — é o que separa
  este estilo do resto do catálogo. Um degradê no meio de uma área chapada é o
  sinal de que o gerador escorregou de volta para o estilo antigo;
- **`angels, demons, twin tails, striped thigh-high stockings, high heels…`** —
  é o elenco da referência, e ele fica **fora**;
- **`weapon, fighting, punching`** — o briefing chama isto de luta, mas é disputa
  sem golpe nenhum: a única arma do adversário é um megafone.

> **Atenção ao fundo de recorte:** o `#FF00FF` deixou de servir como chroma key,
> porque magenta agora é **cor do jogo**. Se o gerador não entregar
> transparência real, peça sobre **verde `#00FF00`** e remova essa cor.

---

## 3. `robo.png` — o Espalha-Boato

**1024 × 1024 · grade 2 × 2 de 512 · alfa real · insubstituível**

Robô de sucata amigável, da cintura para cima, **virado para a esquerda** (o
balcão fica à esquerda dele na tela). Tronco arredondado e **liso**, chapas
rebitadas só nos ombros, antena torta com bolinha rosa-choque, **dois olhos
enormes e redondos, chapados, com um brilho branco simples**, boca de placa que
desliza. **No lugar da mão direita, um megafone** — apagado nos quatro quadros:
quem acende é o código.

No estilo novo ele é **uma silhueta geométrica de contorno grosso**: corpo em
cápsula, braços em tubo, nenhuma chapa com sombra. A graça vem da **forma**, não
do acabamento.

A ordem dos quadros **é o índice do frame**, e é contrato com o código:

| # | Nome | O que o desenho mostra |
|---:|---|---|
| 0 | `offers` | soprando: bochechas cheias, megafone baixo, empurrando um papel em branco para a esquerda |
| 1 | `insists` | **o quadro padrão**, o que mais aparece: sorriso torto de quem quer convencer, uma palma aberta apontando para a esquerda, dentro da tela |
| 2 | `laughs` | gargalhando, cabeça para trás, megafone erguido — o quadro de quando o boato passou |
| 3 | `deflated` | **murcho**: corpo amassado, ombros caídos, antena mole, boca de bico, olhos para baixo |

Regras deste arquivo:

- **o quadro 1 é o que vai ser esticado.** É ele que o código escala de 0,6 a
  1,3 para inflar e murchar, então é ele que precisa do tronco mais liso e
  simétrico. O quadro 3 é o fundo do poço, para o fim do nível;
- **a diferença entre os quadros é grande**: ombros, cabeça, braços, antena. Ele
  aparece a ~280 × 474 na grade (84 × 142 reais no celular), mas o que a criança
  lê de relance é a **silhueta**;
- **o megafone está no mesmo lugar e na mesma inclinação nos quatro quadros** — o
  código desenha o clarão saindo da boca dele, e um megafone que anda faz o
  clarão sair do lugar errado;
- **os pés apoiados na mesma linha** nos quatro quadros: a escala é ancorada na
  base, e um quadro com o pé mais alto faz o robô pular ao trocar de cara;
- **o papel do quadro 0 é um retângulo branco liso, sem escrita**, encostando na
  borda esquerda da célula;
- nada de fumaça, faísca ou raio desenhados: isso é `Graphics`.

~~~text
A friendly cartoon junk-robot character sheet, four poses in a 2x2 grid on a
transparent background, drawn as bold flat vector shapes with very thick even
black outlines and solid colour fills, no shading and no gradients.
The robot: shown from the waist up, facing LEFT, with a smooth capsule-shaped
grey-blue torso (no belts, no horizontal stripes, nothing that would distort if
the shape were stretched vertically), simple tube arms, one bent antenna with a
small hot-pink ball, two huge flat round eyes with a simple white highlight, and
a sliding plate mouth. His right hand is a MEGAPHONE, switched off, held at the
same angle and position in every frame. Comic and harmless, never scary. Feet
resting on the same ground line in all four frames.
The four poses, in this exact order, left to right, top row first:
1) blowing: cheeks puffed, megaphone low, pushing a blank white sheet of paper
   to the left;
2) persuading: crooked grin, open palm gesturing to the LEFT, inside the frame;
3) laughing hard: head back, megaphone raised in triumph;
4) deflated: crumpled body, slumped shoulders, floppy antenna, pouting, eyes down.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGES — flat vector
cartoon animation art: very thick, even black outlines of uniform weight; large
areas of flat solid colour with NO gradients, NO airbrush and almost no shading;
bold simplified geometric shapes; hair drawn as one sharp angular silhouette;
big round eyes with simple flat highlights; clean stylised bodies with long
simple limbs; a saturated neon palette of hot pink, magenta, cyan, electric
blue, yellow, white and black; four-pointed sparkle stars and chequerboard
blocks used as flat graphic accents.
Take ONLY the drawing style and the colour language from the references. Do NOT
copy their characters, their hairstyles, their outfits, their character colour
schemes, their logos, their title lettering, their poses or their subject
matter. All characters here are ordinary human Brazilians in ordinary everyday
clothes that cover the body.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
signature, watermark, logo, brand, title lettering, comic cover layout,
user interface, app window, browser, toolbar, app icons, cursor, mouse pointer,
emoji, speech bubble, green check mark, red X mark, warning sign, thumbs up,
angels, demons, halos, horns, wings, tails, pointed ears, fantasy creatures,
twin tails, gothic lolita dress, striped thigh-high stockings, lingerie,
underwear, high heels, exposed midriff, short skirt, cleavage, bare legs,
pin-up pose, cocked hip, sultry expression, cigarette, alcohol,
guns, weapons, sword, fighting, punching, explosion,
angry robot, red glowing eyes, sharp teeth, robot pointing at the viewer,
scared child, crying child, scolding adult,
recognisable anime characters, copyrighted characters, fan art,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard on the alpha,
gradients, airbrush shading, soft shading, 3D render, photorealistic, blur,
lens flare, noise, paper grain, gradient banding.
~~~

---

## 4. `vizinhos.png` — os seis vizinhos

**1152 × 768 · grade 3 × 2 de 384 · alfa real · insubstituível**

Meio corpo, **de mãos livres e vazias**, levemente virados para o centro. Cada um
aparece a **296 × 160** na grade (89 × 48 reais): o que identifica é a **roupa, o
cabelo e a silhueta**, nunca um detalhe pequeno.

A ordem dos quadros **é o índice do frame**:

| # | id | Quem é | Como se reconhece |
|---:|---|---|---|
| 0 | `nina` | Nina, do jornal da escola | jovem, cabelo cacheado preso, colete com bolsos, lápis na orelha |
| 1 | `beto` | Beto, da prefeitura | homem de meia-idade, camisa de colarinho, crachá de cordão, bigode |
| 2 | `ze` | Zé, do grupo do bairro | senhor de boné, camiseta larga, chinelo de dedo à mostra no enquadramento |
| 3 | `rita` | Rita, do posto de saúde | mulher de jaleco branco, cabelo curto, estetoscópio no pescoço |
| 4 | `caco` | Caco, da cantina | homem robusto, avental e touca, pano no ombro |
| 5 | `sol` | Sol, do serviço do tempo | mulher jovem de capa de chuva amarela aberta, óculos, rabo de cavalo |

Regras deste arquivo:

- **as seis silhuetas são diferentes entre si** — altura de ombro, cabelo,
  volume da roupa. É a regra dos botões aplicada a gente: a criança distingue a
  forma antes de ler o nome;
- **cara simpática e neutra** nos seis. A reação (dar de ombros, levantar a mão)
  é feita com `FX` pelo código: tilt, bounce, um pulinho. Nenhum deles tem uma
  segunda expressão nesta folha;
- **mãos abaixadas, vazias, visíveis** — a plaquinha é desenhada na frente deles
  pelo código, e uma mão já segurando alguma coisa brigaria com ela;
- **nenhum deles olha para fora da tela**, e nenhum aponta para quem joga;
- nada de letra: nada de escrita no crachá do Beto, nada de logo no colete da
  Nina.

**Três regras que vieram junto com o estilo novo:**

- **o cabelo é uma silhueta só, angular e fechada** — não são fios, é uma forma
  recortada com contorno grosso. É o que mais "cola" o estilo da referência, e é
  também o que mais barato se lê a 48 px reais;
- **os olhos são grandes, chapados e redondos**, com um brilho branco simples.
  Sem cílio desenhado fio a fio, sem íris em degradê;
- **roupa comum e cobrindo o corpo, nos seis.** A referência é de uma série
  adulta, e é aqui que o gerador escorrega se o negativo não estiver colado
  junto. Calça e manga; nada de salto, barriga de fora ou decote.

~~~text
Six friendly Brazilian neighbourhood characters, waist-up portraits, hands down
and empty, each turned slightly toward the centre, on a transparent background,
laid out in a 3x2 grid. Drawn as bold flat vector shapes: very thick even black
outlines, solid flat colour fills, no shading and no gradients; hair drawn as one
sharp angular silhouette; big flat round eyes with a simple white highlight.
In this exact order, left to right, top row first:
1) a young woman with curly tied-back hair wearing a reporter vest with pockets
   and a pencil behind her ear;
2) a middle-aged man with a moustache in a collared shirt with a lanyard badge
   (badge blank, no text);
3) an older man in a cap and a loose t-shirt, relaxed posture;
4) a woman in a white medical coat with short hair and a stethoscope round her
   neck;
5) a sturdy man in a kitchen apron and cap with a cloth over his shoulder;
6) a young woman in an open yellow raincoat with glasses and a ponytail.
All six wear ordinary modest everyday clothes that cover the body, with long
sleeves or trousers. Six clearly different silhouettes. Friendly neutral
expressions. Nobody looks at the viewer, nobody points at the viewer.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGES — flat vector
cartoon animation art: very thick, even black outlines of uniform weight; large
areas of flat solid colour with NO gradients, NO airbrush and almost no shading;
bold simplified geometric shapes; hair drawn as one sharp angular silhouette;
big round eyes with simple flat highlights; clean stylised bodies with long
simple limbs; a saturated neon palette of hot pink, magenta, cyan, electric
blue, yellow, white and black; four-pointed sparkle stars and chequerboard
blocks used as flat graphic accents.
Take ONLY the drawing style and the colour language from the references. Do NOT
copy their characters, their hairstyles, their outfits, their character colour
schemes, their logos, their title lettering, their poses or their subject
matter. All characters here are ordinary human Brazilians in ordinary everyday
clothes that cover the body.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
signature, watermark, logo, brand, title lettering, comic cover layout,
user interface, app window, browser, toolbar, app icons, cursor, mouse pointer,
emoji, speech bubble, green check mark, red X mark, warning sign, thumbs up,
angels, demons, halos, horns, wings, tails, pointed ears, fantasy creatures,
twin tails, gothic lolita dress, striped thigh-high stockings, lingerie,
underwear, high heels, exposed midriff, short skirt, cleavage, bare legs,
pin-up pose, cocked hip, sultry expression, cigarette, alcohol,
guns, weapons, sword, fighting, punching, explosion,
angry robot, red glowing eyes, sharp teeth, robot pointing at the viewer,
scared child, crying child, scolding adult,
recognisable anime characters, copyrighted characters, fan art,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard on the alpha,
gradients, airbrush shading, soft shading, 3D render, photorealistic, blur,
lens flare, noise, paper grain, gradient banding.
~~~

---

## 5. `icones.png` — os trinta pictogramas

**1152 × 960 · grade 6 × 5 de 192 · alfa real · importante (tem reserva)**

O pictograma aparece em dois lugares: **ao lado da manchete** (92 × 92 na grade)
e **na plaquinha do vizinho** (52 × 52). Ele **ajuda a ler**, e nunca responde
sozinho — daí as duas regras do §2 do planejamento: o ícone da manchete nunca
reaparece nas plaquinhas da rodada, e **quem não sabe do assunto levanta o
próprio ícone**.

Cada célula é uma **forma cheia, chapada, com contorno grosso**, sem cena e sem
fundo. Ordem por linha, e o índice é contrato com o código:

| Linha | # | Ícones |
|---|---|---|
| **1 — quem é cada vizinho** | 0–5 | `jornal` (jornal dobrado) · `prefeitura` (prédio com bandeirinha) · `grupo` (celular com três balõezinhos) · `saude` (estetoscópio) · `cantina` (prato com garfo) · `tempo` (sol grande) |
| **2 — as manchetes** | 6–11 | `quadra` (fachada de escola com um aro de basquete) · `neve` (floco) · `foguete` (foguete de garrafa) · `refri` (copo com canudo e bolhas) · `posto` (cruz de saúde) · `jacare` (jacaré de desenho) |
| **3 — as manchetes** | 12–14 | `ponte` (ponte de arco) · `guardachuva` (guarda-chuva aberto) · `museu` (quadro com moldura) |
| **3 — as respostas** | 15–17 | `bola` (bola de basquete) · `ferramenta` (chave inglesa) · `tenis` (par de tênis) |
| **4 — as respostas** | 18–23 | `piscina` (boia salva-vidas) · `termometro` (termômetro alto) · `ventilador` (ventilador de mesa) · `mochila` (mochila escolar) · `prancheta` (prancheta com clipe) · `olho` (olho aberto) |
| **5 — as respostas** | 24–29 | `agua` (copo de água) · `seringa` (seringa) · `obra` (cone de obra) · `chuva` (nuvem com gotas) · `ingresso` (ingresso picotado) · `orelha` (orelha com ondinhas de som) |

Regras deste arquivo:

- **todos legíveis a 52 px na grade (≈ 16 px reais).** Uma forma principal e no
  máximo um detalhe. Estetoscópio com tubo fino some; termômetro com escala
  numerada some duas vezes (e número é letra);
- **duas células nunca têm a mesma silhueta.** As duplas perigosas, que precisam
  ser conferidas de propósito: `tempo` (sol) × `chuva` (nuvem); `prefeitura`
  (prédio com bandeira) × `museu` (quadro com moldura) — por isso o museu virou
  um **quadro de arte**, e não uma fachada; `saude` (estetoscópio) × `posto`
  (cruz); `bola` × `piscina` (boia), que são dois círculos: a bola é riscada de
  gomos, a boia tem faixas e furo no meio;
- **nenhum ✓, nenhum ✗, nenhum símbolo de aprovação.** Este é o arquivo em que a
  tentação existe, e cair nela devolve o jogo ao briefing;
- **nada de cena**: `chuva` é uma nuvem com gotas, não uma rua molhada. Cena
  dentro de 52 px vira mancha;
- **cor viva e contorno preto grosso**, o mesmo em todos, para nenhum parecer
  mais importante que outro;
- **as quatro células que sobram ficam vazias**, reserva para a próxima manchete.

~~~text
Thirty simple flat pictogram icons on a transparent background, arranged in a
6x5 grid, one icon per cell. Each icon is a single bold geometric shape drawn as
flat vector art: very thick even black outline, one or two solid flat colours,
absolutely no shading and no gradients. No scenes, no backgrounds, no text or
numbers anywhere.
Row 1: a folded newspaper; a small city hall building with a little flag; a
mobile phone with three chat bubbles; a stethoscope; a plate with a fork; a big
sun.
Row 2: a school facade with a basketball hoop; a snowflake; a bottle rocket; a
fizzy drink cup with a straw; a medical cross; a cartoon alligator.
Row 3: an arched bridge; an open umbrella; a framed painting; a basketball; a
wrench; a pair of sneakers.
Row 4: a ring-shaped life buoy; a tall thermometer; a desk fan; a school
backpack; a clipboard; an open eye.
Row 5: a glass of water; a syringe; a traffic cone; a cloud with raindrops; a
torn ticket stub; an ear with little sound waves.
Bold shapes, readable at very small size, all icons the same visual weight.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGES — flat vector
cartoon animation art: very thick, even black outlines of uniform weight; large
areas of flat solid colour with NO gradients, NO airbrush and almost no shading;
bold simplified geometric shapes; hair drawn as one sharp angular silhouette;
big round eyes with simple flat highlights; clean stylised bodies with long
simple limbs; a saturated neon palette of hot pink, magenta, cyan, electric
blue, yellow, white and black; four-pointed sparkle stars and chequerboard
blocks used as flat graphic accents.
Take ONLY the drawing style and the colour language from the references. Do NOT
copy their characters, their hairstyles, their outfits, their character colour
schemes, their logos, their title lettering, their poses or their subject
matter. All characters here are ordinary human Brazilians in ordinary everyday
clothes that cover the body.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
signature, watermark, logo, brand, title lettering, comic cover layout,
user interface, app window, browser, toolbar, app icons, cursor, mouse pointer,
emoji, speech bubble, green check mark, red X mark, warning sign, thumbs up,
angels, demons, halos, horns, wings, tails, pointed ears, fantasy creatures,
twin tails, gothic lolita dress, striped thigh-high stockings, lingerie,
underwear, high heels, exposed midriff, short skirt, cleavage, bare legs,
pin-up pose, cocked hip, sultry expression, cigarette, alcohol,
guns, weapons, sword, fighting, punching, explosion,
angry robot, red glowing eyes, sharp teeth, robot pointing at the viewer,
scared child, crying child, scolding adult,
recognisable anime characters, copyrighted characters, fan art,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard on the alpha,
gradients, airbrush shading, soft shading, 3D render, photorealistic, blur,
lens flare, noise, paper grain, gradient banding.
~~~

> **Se o gerador perder qualidade com trinta células**, parta em dois arquivos de
> 3 × 5 (`icones-a.png`, `icones-b.png`) mantendo a mesma ordem. São duas
> gerações, não trinta.

---

## 6. `bg-balcao.png` — a praça do bairro

**1672 × 941 · imagem única · opaco · importante (tem reserva)**

O balcão do bairro montado numa praça, em dia claro. A criança está do lado de
cá; os vizinhos encostam do outro lado; o robô fica de pé à direita.

| Onde | O quê |
|---|---|
| topo (0–35 % da altura) | céu **ciano chapado** com uma **faixa larga rosa-choque** atravessando, e uma fileira de **casinhas** como blocos amarelos, rosa e azuis |
| meio (35–58 %) | uma árvore estilizada à esquerda, um poste, a calçada — **e é onde os vizinhos vão ficar de pé**, então sem objeto nenhum |
| **baixo (58–100 %)** | o **tampo do balcão** laranja atravessando a tela inteira, com a frente num laranja mais escuro |
| terço direito | **vazio**: é onde o robô fica, e ele cresce |
| enfeites | estrelinhas de quatro pontas e um ou dois blocos de xadrez, **espalhados, poucos** |

Regras deste arquivo:

- **a metade de cima é calma, não lavada.** Neste estilo não existe "desbotado":
  existe **forma grande e poucos elementos**. A manchete e a faixa de recado são
  desenhadas por cima dela, e quem abaixa o fundo é o véu de 0,55;
- **as estrelinhas e o xadrez ficam longe do meio da tela.** Eles são o tempero
  do estilo, e no lugar errado viram ruído embaixo do texto: mande-os para os
  cantos de cima e para a beirada do balcão;
- **nenhuma pessoa** — os vizinhos são o #2, e uma figura pintada no fundo seria
  uma fonte que não dá para consultar;
- **nenhum jornal, nenhuma lupa, nenhuma tela** no cenário: são peças do jogo, e
  uma cópia pintada confundiria a criança sobre o que se toca;
- **o terço direito precisa de céu limpo até bem alto**: o robô inflado ocupa
  1,3 × a altura dele, e uma copa de árvore ali ficaria atravessada nele.

~~~text
A cartoon town square seen straight on, drawn as flat vector shapes with very
thick even black outlines and large areas of solid flat colour, no shading and
no gradients. A long counter in flat orange-yellow runs across the bottom 40% of
the image with a darker orange front panel. Behind it: a plain pale pavement, a
simple lamp post and a stylised tree on the far left, and a row of simple
neighbourhood houses as flat blocks of yellow, pink and light blue along the
horizon. The sky is flat cyan with one wide hot-pink horizontal band across the
upper area, plus a few small four-pointed sparkle stars and a couple of
chequerboard blocks as flat graphic accents. The right third is completely EMPTY
with clear open sky, leaving room for a tall character. The upper half is kept
simple and uncluttered, with big calm shapes and no fine detail. No people
anywhere.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGES — flat vector
cartoon animation art: very thick, even black outlines of uniform weight; large
areas of flat solid colour with NO gradients, NO airbrush and almost no shading;
bold simplified geometric shapes; hair drawn as one sharp angular silhouette;
big round eyes with simple flat highlights; clean stylised bodies with long
simple limbs; a saturated neon palette of hot pink, magenta, cyan, electric
blue, yellow, white and black; four-pointed sparkle stars and chequerboard
blocks used as flat graphic accents.
Take ONLY the drawing style and the colour language from the references. Do NOT
copy their characters, their hairstyles, their outfits, their character colour
schemes, their logos, their title lettering, their poses or their subject
matter. All characters here are ordinary human Brazilians in ordinary everyday
clothes that cover the body.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
signature, watermark, logo, brand, title lettering, comic cover layout,
user interface, app window, browser, toolbar, app icons, cursor, mouse pointer,
emoji, speech bubble, green check mark, red X mark, warning sign, thumbs up,
angels, demons, halos, horns, wings, tails, pointed ears, fantasy creatures,
twin tails, gothic lolita dress, striped thigh-high stockings, lingerie,
underwear, high heels, exposed midriff, short skirt, cleavage, bare legs,
pin-up pose, cocked hip, sultry expression, cigarette, alcohol,
guns, weapons, sword, fighting, punching, explosion,
angry robot, red glowing eyes, sharp teeth, robot pointing at the viewer,
scared child, crying child, scolding adult,
recognisable anime characters, copyrighted characters, fan art,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard on the alpha,
gradients, airbrush shading, soft shading, 3D render, photorealistic, blur,
lens flare, noise, paper grain, gradient banding.
~~~

---

## 7. `botoes.png` — os ícones dos botões, a mão e o megafone

**512 × 512 · grade 2 × 2 de 256 · alfa real · importante (tem reserva)**

Quatro desenhos pequenos que aparecem por cima da interface. Os dois primeiros
são o coração deste arquivo.

> **O botão mostra o que vai ACONTECER com o papel, não um símbolo de "sim" e
> "não".** Aperte PODE e o papel vira exatamente aquele aviãozinho e sai voando;
> aperte NÃO PODE e ele vira exatamente aquela bolinha amassada. O ícone é uma
> miniatura da animação que vem depois — foi assim que a Mesa de Edição resolveu
> o mesmo problema, e é o que dispensa a criança de aprender símbolo nenhum.

A ordem dos quadros **é o índice do frame**, e é contrato com o código:

| # | Nome | O que é | Onde aparece |
|---:|---|---|---|
| 0 | `plane` | **avião de papel branco voando para a direita**, com dois risquinhos de velocidade atrás | dentro do botão **PODE**, a 96 px |
| 1 | `ball` | **bolinha de papel amassado**, com vincos, caindo — um pouco achatada embaixo | dentro do botão **NÃO PODE**, a 96 px |
| 2 | `hand` | **mão de desenho apontando com o indicador**, dedo para cima e à esquerda, punho arredondado | o dedo do tutorial, a ~110 px |
| 3 | `megaphone` | **megafone rosa ligado**, boca para a direita, com três arcos de som saindo | reserva: o clarão do robô e a capa |

Regras deste arquivo:

- **os dois primeiros têm de ser reconhecíveis a 96 px na grade (≈ 29 px reais
  no celular).** Uma forma grande e cheia cada um, sem detalhe fino: o avião é
  três triângulos, a bolinha é um polígono irregular com três vincos;
- **as duas silhuetas são opostas de propósito** — uma é angular e aponta para
  um lado, a outra é redonda e fechada. É a regra dos dois botões: o ícone diz
  **qual botão é** antes de dizer o estado;
- **o papel dos dois é branco-creme**, o mesmo do papel da manchete — são a mesma
  folha, em dois destinos;
- **nada de ✓, ✗, joinha, polegar, seta de proibido ou círculo cortado.** É a
  tentação óbvia neste arquivo, e cair nela devolve o jogo ao briefing: o botão
  passaria a dizer "certo" e "errado" antes de a criança decidir;
- **a mão é de desenho, sem braço e sem manga**: só a mão, pele clara neutra,
  contorno preto grosso. Ela vai por cima de tudo, então precisa funcionar em
  qualquer fundo;
- **os quatro são desenhados de frente**, sem perspectiva e sem sombra projetada.

~~~text
Four separate cartoon icons on a transparent background, arranged in a 2x2 grid,
one icon per cell, drawn as bold flat vector shapes with very thick even black
outlines and solid flat colour, no shading, no gradients, no drop shadows.
In this exact order, left to right, top row first:
1) a white paper plane flying to the right, seen from the side, with two short
   speed lines behind it;
2) a crumpled ball of white paper with a few creases, slightly squashed at the
   bottom, as if it has just been dropped;
3) a cartoon hand pointing with the index finger, finger up and to the left,
   rounded fist, no arm and no sleeve, plain light skin tone;
4) a bright pink megaphone facing right, switched on, with three curved sound
   arcs coming out of the mouth.
The first two must read instantly at very small size: one big simple shape each,
with opposite silhouettes — the plane angular and pointing sideways, the ball
round and closed. Both papers are the same warm white.
No check marks, no crosses, no thumbs up or down, no prohibition signs.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGES — flat vector
cartoon animation art: very thick, even black outlines of uniform weight; large
areas of flat solid colour with NO gradients, NO airbrush and almost no shading;
bold simplified geometric shapes; hair drawn as one sharp angular silhouette;
big round eyes with simple flat highlights; clean stylised bodies with long
simple limbs; a saturated neon palette of hot pink, magenta, cyan, electric
blue, yellow, white and black; four-pointed sparkle stars and chequerboard
blocks used as flat graphic accents.
Take ONLY the drawing style and the colour language from the references. Do NOT
copy their characters, their hairstyles, their outfits, their character colour
schemes, their logos, their title lettering, their poses or their subject
matter. All characters here are ordinary human Brazilians in ordinary everyday
clothes that cover the body.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
signature, watermark, logo, brand, title lettering, comic cover layout,
user interface, app window, browser, toolbar, app icons, cursor, mouse pointer,
emoji, speech bubble, green check mark, red X mark, warning sign, thumbs up,
thumbs down, prohibition sign, crossed circle,
angels, demons, halos, horns, wings, tails, pointed ears, fantasy creatures,
twin tails, gothic lolita dress, striped thigh-high stockings, lingerie,
underwear, high heels, exposed midriff, short skirt, cleavage, bare legs,
pin-up pose, cocked hip, sultry expression, cigarette, alcohol,
guns, weapons, sword, fighting, punching, explosion,
angry robot, red glowing eyes, sharp teeth, robot pointing at the viewer,
scared child, crying child, scolding adult,
recognisable anime characters, copyrighted characters, fan art,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard on the alpha,
gradients, airbrush shading, soft shading, 3D render, photorealistic, blur,
lens flare, noise, paper grain, gradient banding.
~~~

---

## 8. `cover-duelo-das-fontes.png` — a capa

**1672 × 941 · imagem única · opaco · por último**

A capa é lida a ~300 px de largura no catálogo, e tem que dizer o jogo num
relance: **o robô grande de megafone erguido de um lado, um papel voando, e os
vizinhos do outro lado com as plaquinhas levantadas.**

- composição em diagonal, do megafone (direita, alto) para as plaquinhas
  (esquerda, baixo);
- as plaquinhas aparecem **em branco** — nada escrito;
- **nenhuma letra, nem o título do jogo** — a plataforma escreve o título por
  cima;
- nada de interface, nada de estrela, nada de `?`;
- o mesmo robô do #1 e os mesmos vizinhos do #2, mesma paleta do #6.

~~~text
Cover illustration, 16:9, drawn as bold flat vector art with very thick even
black outlines and solid flat colour, no shading and no gradients. On the right,
a big friendly cartoon junk robot raising his megaphone hand; a blank sheet of
paper flying on a diagonal from the megaphone toward the lower left, where three
neighbourhood characters stand behind an orange counter holding up small BLANK
signs. Behind them a flat cyan and hot-pink town square with four-pointed sparkle
stars and chequerboard blocks as graphic accents.
No text anywhere, no interface elements, nobody looking at the viewer.

STYLE: match the drawing style of the ATTACHED REFERENCE IMAGES — flat vector
cartoon animation art: very thick, even black outlines of uniform weight; large
areas of flat solid colour with NO gradients, NO airbrush and almost no shading;
bold simplified geometric shapes; hair drawn as one sharp angular silhouette;
big round eyes with simple flat highlights; clean stylised bodies with long
simple limbs; a saturated neon palette of hot pink, magenta, cyan, electric
blue, yellow, white and black; four-pointed sparkle stars and chequerboard
blocks used as flat graphic accents.
Take ONLY the drawing style and the colour language from the references. Do NOT
copy their characters, their hairstyles, their outfits, their character colour
schemes, their logos, their title lettering, their poses or their subject
matter. All characters here are ordinary human Brazilians in ordinary everyday
clothes that cover the body.

DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
signature, watermark, logo, brand, title lettering, comic cover layout,
user interface, app window, browser, toolbar, app icons, cursor, mouse pointer,
emoji, speech bubble, green check mark, red X mark, warning sign, thumbs up,
angels, demons, halos, horns, wings, tails, pointed ears, fantasy creatures,
twin tails, gothic lolita dress, striped thigh-high stockings, lingerie,
underwear, high heels, exposed midriff, short skirt, cleavage, bare legs,
pin-up pose, cocked hip, sultry expression, cigarette, alcohol,
guns, weapons, sword, fighting, punching, explosion,
angry robot, red glowing eyes, sharp teeth, robot pointing at the viewer,
scared child, crying child, scolding adult,
recognisable anime characters, copyrighted characters, fan art,
HUD, life icon, star rating, question mark button, tutorial panel,
grid lines, visible sprite-sheet borders, cropped edges, drop shadow on the cell,
white backing in transparent assets, painted checkerboard on the alpha,
gradients, airbrush shading, soft shading, 3D render, photorealistic, blur,
lens flare, noise, paper grain, gradient banding.
~~~

---

## 9. Depois que a arte chegar

**Meça o sprite, não chute.** Desenhe cada PNG num canvas e tire a caixa alfa de
cada quadro, em fração da célula; ancore o layout nela. É uma execução no
navegador e economiza meia hora de tentativa e erro.

O que medir aqui, especificamente:

- **a linha do chão do robô** nos quatro quadros: é o ponto de ancoragem da
  escala que infla e murcha, e os quatro valores têm de bater. Se não baterem, o
  robô pula ao trocar de cara;
- **a ponta do megafone**, de onde saem o clarão e as nuvenzinhas;
- **a linha da cintura dos seis vizinhos**: é onde o tampo do balcão corta, e ela
  precisa ser a mesma nos seis, senão um fica boiando;
- **a caixa útil de cada ícone**, para o pictograma da manchete (92 px) e o da
  plaquinha (52 px) ficarem ópticamente do mesmo tamanho apesar de silhuetas
  diferentes.

Carregamento: `import.meta.glob` + `textures.exists()` no `BootScene`, **nunca
`import` estático**. Cada peça mantém o desenho de reserva em `Graphics`, e o
jogo tem de abrir, jogar e vencer o nível 1 inteiro com a pasta de assets vazia.
