# Ilha dos Códigos — prompts das texturas

**4 arquivos, 11 desenhos — entregues.** Destino:
`src/assets/games/EF01CO05/ilha-dos-codigos/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

---

## 1. O que é textura, e o que nunca vai ser

**É textura:** o explorador, o baú, os quatro símbolos entalhados e o cenário da
ilha. Personagem, objeto com identidade e fundo.

**Nunca é textura:** painel, cartão, encaixe, cadeado, chave, moldura, seta,
`?`, estrela, balão, legenda, trilha, brilho, poeira, partícula, a onda do som e
os discos de cor. Tudo isso é `Graphics` do Phaser, por dois motivos concretos:
esses elementos mudam de cor e de tamanho a cada estado — e um PNG não muda —, e
manter a interface em Graphics deixa o jogo jogável com zero textura carregada.

**Os discos de cor e as ondas de som são código, e isso não é economia.** A cor
do símbolo é o próprio código do jogo; ela precisa vir de `data/island.ts`, o
mesmo lugar de onde vem a resposta certa. Cor que mora dentro de um PNG é uma
segunda fonte da verdade esperando divergir.

## 2. A regra que decide o desenho dos símbolos

**Os quatro símbolos são entalhes de pedra, todos da mesma cor.**

Parece detalhe de estilo e é regra de mecânica. No nível 2 a criança traduz
**cor → figura**: azul vira peixe, vermelho vira sol. Se o peixe do desenho for
azul e a banana for amarela, o PNG entrega a resposta e o código vira enfeite —
ela acerta pela cor natural do objeto sem nunca ter usado o código. E no nível 1
seria pior que isso: SOL é **vermelho** neste dicionário, então um sol amarelo
desenhado brigaria com a legenda na cara da criança.

A saída é o próprio tema: os símbolos são **medalhões entalhados na pedra da
ilha**, todos no mesmo tom de arenito, com o sulco escuro do entalhe. Nenhuma
cor a diferenciar — a diferença é só a **silhueta**, que é o que um código de
figura tem que ser.

Silhuetas escolhidas para não se confundirem a 36 px reais: disco com raios
(sol), corpo com cauda (peixe), meia-lua grossa (lua), círculo com três furos
(coco).

**A meia-lua chegou lendo como LUA, e o dicionário foi atrás dela.** O plano
chamava esse símbolo de banana; o desenho entregue é uma lua, e a criança lê o
que vê. Nada na mecânica depende de qual objeto é — mas uma palavra que o jogo
diz e a tela desmente atrapalha em tudo.

## 3. Por que folha em grade

O mesmo explorador aparece em três poses. Pedir uma de cada vez — "faça a próxima
usando a anterior como referência" — é onde a consistência se perde: cada geração
sorteia rosto, chapéu e proporção de novo, e na terceira pose ele já é outra
pessoa.

A folha em grade resolve de graça: o gerador desenha todos os quadros na mesma
passada, então tudo sai igual porque saiu junto. É também o formato que o Phaser
já carrega (`load.spritesheet`).

**A ordem dos quadros é o índice do frame.** O Phaser lê da esquerda para a
direita e de cima para baixo: o primeiro quadro é o frame 0. A ordem abaixo não é
sugestão de leitura, é contrato com o código.

## 4. Tamanho — pequeno de propósito

Nada aqui aparece grande: o baú ativo é 264 px na grade de 1280 × 720, o que num
celular dá cerca de **79 px reais**; o explorador é 132 px, ou **40 px reais**; os
baús da trilha são 88 px, **26 px reais**. Pedir 1024 × 1024 por desenho seria
carregar megabytes para jogar fora no `setScale`.

A regra que vale mais que a resolução: **se a criança não reconhece o desenho em
meio segundo a 40 px de altura, tem detalhe demais.** Silhueta forte, contorno
grosso, três ou quatro cores por objeto.

O que a arte ENTREGOU — e é isto que o `BootScene` carrega:

| Arquivo | Grade | Tamanho | Quadro | Quadros |
|---|---|---|---|---|
| `bg-ilha.png` | — | 1672 × 941 (16:9) | — | 1 |
| `explorador.png` | 1 × 3 | 250 × 1110 | 250 × 370 | 3 |
| `bau.png` | 1 × 3 | 300 × 750 | 300 × 250 | 3 |
| `simbolos-ilha.png` | 1 × 4 | 250 × 1000 | 250 × 250 | 4 |

As folhas vieram em COLUNA, e para o Phaser tanto faz: com a largura da folha
igual à do quadro, ler da esquerda para a direita e de cima para baixo dá a mesma
ordem. O que precisa bater é o `frameWidth`/`frameHeight` do `BootScene` com a
tabela acima — errar isso não dá erro, dá recorte torto.

## 5. Estilo comum — cole no começo de todo prompt

```
flat 2D cartoon illustration, chibi style, big head small body, very simple shapes,
minimal detail, bold clean silhouette, thick soft rounded outline, flat colors with a
single soft shadow, even lighting, no gradients, kids educational game asset,
friendly and clear, tropical island theme, transparent background
```

E o negativo, em todos:

```
text, letters, numbers, grid lines, watermark, signature, 3d render, photorealistic,
gradient background, drop shadow on the canvas
```

**`text, letters, numbers` é obrigatório.** Todo texto do jogo — a legenda, os
balões, a frase-chave — é desenhado pelo Phaser por cima, em português e no
tamanho certo. Letra dentro do PNG vira lixo por baixo do texto de verdade.

**`grid lines` também é obrigatório.** O gerador adora desenhar a moldura da
grade que você pediu; a grade é para recortar, não para aparecer.

**`ground, floor line, shadow` importa no explorador e no baú:** eles são
plantados na areia do fundo, e a sombra é uma elipse que o código desenha. Um
pedaço de chão dentro do PNG cria duas areias que não se encaixam.

Transparência real nos três arquivos de sprite. Se o gerador só entregar fundo
branco, peça sobre magenta `#FF00FF` e remova a cor depois.

## 6. Paleta — cite os hex no prompt

| Uso | Hex |
|---|---|
| Contorno / tinta escura | `#1B2333` |
| Areia clara | `#F2DFB6` |
| Areia sombra | `#D8BE8C` |
| Pedra do entalhe | `#E4D2AE` |
| Sulco do entalhe | `#9C8358` |
| Mar raso | `#5FD6C9` |
| Mar fundo | `#1F8FA8` |
| Céu | `#BFE9F5` |
| Folha de palmeira | `#3FA05A` |
| Madeira do baú | `#A9663B` |
| Ferragem do baú | `#E7B84F` |
| Pele do explorador | `#F0C9A0` |
| Camisa do explorador | `#E86A5A` |
| Chapéu do explorador | `#F2DFB6` |

As **cores do código** (vermelho `#E5484D`, azul `#3E7BFA`, amarelo `#F5C542`,
verde `#3FA05A`) não aparecem em textura nenhuma: elas vivem em `data/island.ts`
e são pintadas em Graphics. Ver a seção 2.

---

## 7. `bg-ilha.png` — 1672 × 941, proporção 16:9

Um desenho só, e ele carrega a ficção inteira do jogo. Como é 16:9 exato, ele
entra em 1280 × 720 sem deformar.

**O que precisa acontecer onde:** o mar e o céu ficam na faixa de cima, a areia
clara vem logo abaixo, e **o resto é superfície calma** — areia molhada escura —
porque ali por cima vêm os painéis da pista, da fechadura e da paleta. Fundo
agitado embaixo é ruído por trás do que a criança tem que ler.

**O desenho entregue entra deslocado 120 px para cima** (`BG.dy`), porque a areia
clara dele cai em y 330 e a trilha do jogo está em y 232. A faixa que sobra
embaixo é pintada com a cor chapada do pé do desenho, e o topo transparente é
resolvido por um retângulo de céu — emenda de cor lisa, que some. Um desenho
novo pode zerar esse deslocamento se puser a areia clara na altura certa.

**Nada de trilha, baú, personagem ou painel desenhado no fundo.** A trilha é
Graphics, os baús e o explorador são sprites que andam. Fundo com baú pintado dá
baú que não abre.

```
top third: calm tropical sea with soft flat wave lines, light sky, two small
palm trees at the far left and far right edges; middle band: warm light sand;
bottom two thirds: calm dark wet sand surface, almost empty, very low contrast,
no objects
```

Negativo, além do comum: `chest, treasure chest, person, character, path, trail,
stepping stones, ui panel, frame, border`.

## 8. `explorador.png` — 1 × 3, 250 × 1110, 3 quadros

Criança exploradora, chapéu de aba mole, mochila pequena. Sempre de perfil para a
direita, que é o sentido em que ela caminha na trilha.

| Frame | Pose |
|---|---|
| 0 | parada, de perfil, olhando para a frente |
| 1 | andando, uma perna à frente |
| 2 | comemorando: dois braços para cima, boca aberta, pulinho |

A caminhada alterna os quadros 0 e 1 a 6 fps enquanto ela anda de um baú para o
outro; o 2 entra no fim de nível, quando o brilho de vitória usa a **silhueta
dele**, e não um círculo genérico. Três poses bastam: com duas alternando, o
passo lê como passo.

```
3 frames stacked in one column, same child explorer in every frame, side view
facing right, floppy explorer hat, small backpack, shorts; frame order: standing
idle, walking with one leg forward, celebrating with both arms raised and a small
hop
```

Negativo, além do comum: `ground, floor line, shadow, front view, different
characters, changing outfit`.

## 9. `bau.png` — 1 × 3, 300 × 750, 3 quadros

O mesmo baú em três estados. Madeira roliça, ferragem grossa, cadeado **não**
desenhado — o cadeado é Graphics, porque ele acende, treme e some.

| Frame | Estado |
|---|---|
| 0 | fechado |
| 1 | entreaberto, uma fresta de luz |
| 2 | aberto de todo, tampa para trás, interior vazio |

Interior vazio de propósito: o que sai de dentro (a peça do tesouro, o brilho) é
desenhado pelo código, para poder voar até a trilha.

O mesmo arquivo serve ao baú grande (264 px) e aos três pequenos da trilha
(88 px). Por isso o desenho tem que aguentar 26 px reais: silhueta de baú,
tampa arredondada, três tábuas, duas cintas de metal, e acabou.

**A 26 px reais, aberto e fechado quase não se distinguem** — por isso o jogo
pousa uma peça de tesouro em cima do baú aberto da trilha. O desenho não precisa
resolver isso sozinho.

```
3 frames stacked in one column, same wooden treasure chest in all three, front
view, chunky rounded lid, thick metal bands, no lock, no keyhole; frame order:
closed, slightly open with a thin light gap, fully open with the lid tilted back
and an empty inside
```

Negativo, além do comum: `padlock, keyhole, key, coins, gems, ground, floor line,
shadow, sparkles`.

## 10. `simbolos-ilha.png` — 1 × 4, 250 × 1000, 4 quadros

Os quatro símbolos do código de figura, **todos entalhados na mesma pedra** — ver
a seção 2, que é a razão de o arquivo existir assim.

| Frame | Palavra | Silhueta |
|---|---|---|
| 0 | SOL | disco com oito raios triangulares |
| 1 | PEIXE | corpo de gota com cauda em V |
| 2 | LUA | meia-lua grossa, com as duas pontas viradas |
| 3 | COCO | círculo com três furos em triângulo |

A ordem é contrato: `frame === ISLAND_WORDS.indexOf(word)`.

Cada quadro é um **medalhão redondo de pedra**, do mesmo tamanho e do mesmo tom,
com o símbolo em sulco escuro. Sem cor que diferencie, sem moldura decorada
(a moldura do cartão é Graphics e muda de estado).

```
4 frames stacked in one column, four round sandstone medallions of the exact same
size, color and material, each with one simple symbol carved as a dark groove;
frame order: sun disc with eight triangular rays, simple fish with a V tail,
thick crescent moon, circle with three small holes; all four in identical stone
tones
```

Negativo, além do comum: `color difference between frames, yellow sun, blue fish,
yellow moon, brown coconut, painted symbols, decorative frame, ornate border`.

---

## 11. Antes de a arte existir, e depois que ela chegar

**Antes:** cada símbolo tem placeholder de código no tamanho final — cartão
arredondado do tema, glifo em Graphics (disco com raios, gota, arco, círculo com
furos) e o nome embaixo. As texturas entram por `import.meta.glob`, **nunca** por
`import` estático: arquivo que ainda não existe derruba o `vite build` inteiro.

**Depois:** meça a caixa alfa de cada quadro em vez de chutar o `setOrigin`. É uma
execução que economiza meia hora de tentativa e erro — desenhe o PNG num canvas,
varra o alfa de cada célula da grade e leia a caixa de cada quadro em fração da
célula.

O que a medição desta arte devolveu:

| Folha | Base do desenho na célula | Origem usada |
|---|---|---|
| `explorador.png` | 0,978 a 0,984 | `setOrigin(0.5, 0.98)` |
| `bau.png` | 0,940 a 0,952 | `setOrigin(0.5, 0.95)` |
| `simbolos-ilha.png` | centrado, ~0,92 de lado | `setOrigin(0.5)` |

É daí que sai **"o desenho encosta no fundo da célula, então o código ancora
pelos pés"**: o explorador pisa em y 252 e o baú senta em y 512 sem nenhum
deslocamento inventado. E como o baú aberto (frame 2) só cresce para CIMA — topo
em 0,004 contra 0,068 do fechado —, abrir não mexe na base nem invade a faixa da
ilha.
