# Maratona do Algoritmo — EF15CO02

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

A criança monta a **linha** de manobras do skatista ANTES da descida, aperta
VAI, e assiste a linha dela rodar no parque.

---

## 1. A habilidade, e os dois testes

> **(EF15CO02)** Construir e simular algoritmos, de forma independente ou em
> colaboração, que resolvam problemas simples e do cotidiano com uso de
> sequências, seleções condicionais e repetições de instruções.

### O que muda em relação ao briefing

O briefing propõe um auto-runner: o corredor corre sozinho, o tempo desacelera
nos pontos marcados e a criança escolhe 1 carta entre 2-3 ali mesmo. **Isso não
constrói algoritmo nenhum** — é responder a uma pergunta de cada vez com a
resposta desenhada na tela, e o trilho do topo vira relatório do que já
aconteceu, não plano. É o mesmo laço que o
[Pulo Programado](../../EF01CO03/pulo-programado/PLANEJAMENTO.md) já descartou,
pelo mesmo motivo, e aqui o custo é maior: a habilidade pede **construir E
simular**, e escolher carta durante a corrida entrega só a simulação.

**A troca:** o parque inteiro fica visível, a criança monta a linha inteira na
fita do topo, e só então aperta VAI. E o nível **pede um resultado** — `🌀 × 3`
numa placa — em vez de só apresentar obstáculos para sobreviver. Com pedido, a
linha tem intenção; sem pedido, ela é reação ao chão.

O gênero muda de plataforma para **skate**, e o nome fica: a maratona é o dia
de campeonato, a sequência de descidas. Continua tudo que o briefing pedia —
sequência, REPITA, SE, tropeço cômico, trava, replay, ranking de plano curto.
Muda **quando** a criança escolhe: antes, e não durante.

### O teste da bolinha

> Troque as manobras por bolinhas coloridas sem significado. O jogo muda?

Muda, e quebra. Três regras deste jogo só existem porque aquilo é um skate num
parque:

- **girar só funciona no ar** — bolinha não tem ar;
- **a rampa grande dá mais tempo de ar que a rampinha** — a criança precisa
  OLHAR a geometria do parque para saber quantos giros cabem;
- **o corrimão molhado escorrega** — a condição mora no mundo, visível, e muda
  a cada descida.

Tire o skate e sobra ordenar cartas. É por isso que a regra do ar é o coração
do jogo, e não enfeite.

## 2. Como isso não vira a Academia dos Algoritmos

`EF15CO02` já tem um jogo publicado, a **Academia dos Algoritmos**, e ela já
tem pedido escrito (`request`), fita de tamanho fixo (`slots`) e as três peças
(`Piece = action | repeat | if`). Sem uma diferença estrutural, seriam dois
jogos iguais com cenário trocado.

| | Academia dos Algoritmos | Maratona do Algoritmo |
|---|---|---|
| O mundo é | estado simbólico: `inHand`, `facts` | geometria visível: rampa, corrimão, chão |
| A ordem importa porque | há **pré-condição** (pegar a escova antes de escovar) | há **tempo de ar** (o giro precisa de voo sobrando) |
| O recurso escasso é | o slot da fita | o **ar que a rampa te deu** |
| O pedido é | um fato booleano (`dentes-limpos`) | uma **contagem** (`3 giros`), que enche na sua frente |
| O que prova o acerto | o fato ficou verdadeiro | **o skatista desceu inteiro** e o contador fechou |
| O erro é | o passo recusa, com a frase do impedimento | **o tombo**, no lugar do parque onde a linha quebrou |
| A condição vem de | uma pergunta sobre o estado | o parque **sorteado a cada descida** |

A frase curta: lá o algoritmo é julgado por lógica de estado; aqui é julgado
pelo **corpo do skatista atravessando um espaço físico**, e o mundo aponta onde
quebrou. Isso é o que uma descida de skate faz e uma rotina de casa não faz.

## 3. O laço

```
    ler o PEDIDO  ──▶  montar a LINHA  ──▶  VAI!  ──▶  o skatista desce
          ▲                   ▲                              │
          │                   └─── trocar a manobra ◀─── caiu / não cumpriu
          │                                                  │
          └────────── próxima fase ◀───── pedido cumprido ────┘
```

**O pedido** fica no topo, em pictograma: `🌀 × 3`. Não é enunciado, é placa.
E ele tem um contador que **se preenche durante a descida**, giro por giro — é
a parte "simular" da habilidade, desenhada na tela enquanto acontece.

**Montar** — a paleta traz cartas prontas. Um toque na carta manda ela para o
próximo **medalhão** vazio; um toque num medalhão cheio devolve a manobra para
a paleta. **Nada de arrastar**: um toque põe, um toque tira, e é isso que dá a
reorganização sem exigir precisão de dedo.

**E o plano não mora numa faixa separada: ele é desenhado SOBRE o parque.** A
trajetória que o skatista vai percorrer aparece pontilhada por cima do
concreto, e o ícone de cada manobra fica pousado acima do seu marco, amarrado
a ele por um tracejado vertical. É o que o skate chama de *linha*. Três
consequências, e nenhuma é decoração:

1. o plano e o mundo dividem um espaço só, então "esta manobra pertence a este
   pedaço do parque" deixa de ser uma correspondência que a criança faz de
   cabeça entre duas faixas distantes da tela;
2. a trajetória é o **preview real** — ela escala na rampa e arqueia no ollie
   porque sai da mesma função que anima o skatista (`data/moves.ts`). Não
   existe um caminho previsto e outro executado;
3. a linha **cresce conforme ela monta**: firme até o primeiro marco vazio,
   pontilhado apagado dali em diante. A criança vê o quanto já decidiu sem um
   número na tela.

**Rodar** — o VAI só acende com o caminho cheio. O skatista percorre o parque
executando a manobra de cada espaço, na ordem.

**Errar** — ou ele cai numa manobra (e aquele espaço trava), ou ele desce
inteiro sem cumprir o pedido (e a placa do topo pisca com o contador parado).
São dois erros diferentes e precisam parecer diferentes — §7.

**Acertar** — ele fecha o caminho, comemora, e a fita é reprisada: cada carta
acende em sequência enquanto ele refaz a descida rapidinho, e o balão fecha com
**"Sequência, repetição e escolha: isso é um ALGORITMO!"**.

### A abertura do nível

Antes do laço existir, alguém precisa ser apresentado. A ordem é a de quem
recebe uma visita, e nenhum passo pode ser trocado de lugar:

```
  o skatista CHEGA rolando de fora da tela
        │
        ├─▶  "Oi! Meu nome é Téo."
        │
        ├─▶  "Esse é o meu amigo!"  ──▶  o fantasma APARECE ao lado
        │                                 (a palavra e a pessoa entram juntas)
        ├─▶  "Olha o caminho dele!"
        │
        ├─▶  o fantasma FAZ o percurso inteiro
        │
        ├─▶  "Agora faça igual!"
        │
        └─▶  só então o tutorial pede alguma coisa
```

**Ninguém é instruído antes de ter visto.** A primeira versão abria com o
tutorial dizendo "Olhe o que ele faz" sobre um parque parado — não havia
nenhum "ele" na tela para a frase apontar, nem nada acontecendo para olhar.
A criança lia uma instrução sobre o vazio.

As fases seguintes não repetem a apresentação: o Téo e o amigo já foram
apresentados, e refazer isso a cada fase viraria pedágio. Elas abrem direto
na demonstração.

## 4. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`, como os outros jogos. Não
existe layout relativo neste projeto: num celular em pé o jogo vira uma faixa
16:9 com tarja preta, ele não recompõe. Todo número é coordenada absoluta e
mora em `data/layout.ts`.

A coluna da direita é o tamanho físico aproximado num celular de 390 px de
largura (fator ≈ 0,30) — é esse número que decide se está legível e se dá para
tocar, não o da grade.

**São DUAS faixas, não três.** A faixa de quadradinhos no topo — que é o que
fazia este jogo parecer o Pulo Programado com outra pele — não existe: o plano
mora dentro do parque.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| O parque | 8 – 528 | chão em y 478 · medalhões em y 172, lado 96 · bolinhas de fase em (76, 48) · `?` em (1216, 48), raio 30 | skatista 150 · medalhão 96 | 45 px · 29 px |
| Paleta + VAI | 536 – 712 | cartas de 190 × 128, cy 624, x 250 / 478 / 706 · **VAI** em (1046, 624), raio 78 | carta 190 | 57 px |

**O medalhão é alvo secundário** (serve para devolver a manobra), e por isso
29 px reais passa. O alvo primário é a carta da paleta, com 57 px.

**Não existe texto fixo além do `?`.** Sem pílula de nível, sem rótulo de fase
e sem cronômetro: três bolinhas dizem onde a criança está, e o relógio conta
por dentro para aparecer uma vez só, no painel de fim de nível.

### O painel não pode cortar o voo — e o teto tem ZOOM

Foi o erro mais caro do Pulo Programado — o painel da paleta engoliu o coelho
no meio do pulo. Aqui o risco está em cima, e ele aconteceu na primeira versão:
o skatista atravessava o topo da máscara no ápice e só o shape aparecia acima
do muro.

**O teto não é o topo da tela, é `PARK.top` ampliado pelo foco.** Com o zoom
ligado, uma altura que cabia passa a não caber. Depois que a faixa da fita saiu
do topo o teto subiu para y 8 e a folga ficou grande, mas a conta continua
valendo — com o chão ancorado:

```
topo do sprite (mundo) = GROUND.y − 0,962 × size − A
topo na tela           = GROUND.y + zoom × (topo − GROUND.y)  ≥  PARK.top + 12
```

O `0,962` sai da caixa alfa medida no PNG (o desenho começa a 3,6 % do quadro e
as rodas terminam a 99,8 %). Com `size 150`, `zoom 1,08`, `PARK.top 8` e o chão
em 478, isso dá **A ≤ 274** — e daí os confortáveis `jumpH 165` e `rampH 195`.

**Mexer em qualquer um dos quatro números obriga a refazer esta conta.**

| Peça do parque | Tamanho | Ar que dá |
|---|---|---|
| Plano | duas setas pintadas no concreto | 0 |
| Caixote | 150 × 62 | 1 (ollie) |
| Rampa (quarter-pipe) | 168 × 110 | 1 no nível 1; 3 na mega, no nível 2 |

**O parque não rola, e o percurso inteiro cabe entre x 260 e 960.** A criança
precisa ver todos os marcos ao mesmo tempo para poder planejar. O foco da
descida aproxima 8 % e acompanha na horizontal, mas ele só entra DEPOIS do
VAI — enquanto ela monta, o parque está inteiro na tela.

**O foco não tem vinheta.** A primeira versão escurecia as bordas para
destacar a descida, e o que ela destacava mesmo era a própria camada escura:
a tela apagava justo no momento em que a criança mais queria olhar. O zoom
sozinho já diz "agora assista", e diz sem tirar luz de nada.

## 5. Níveis e fases

Três níveis, **três fases cada** — a fase é uma descida inteira. O limite do
[INSTRUCOES.md](../../INSTRUCOES.md) é 5 fases por nível. A fase cresce dentro
do nível, em vez de repetir a mesma coisa três vezes.

| Nível | O pedido vem como | Entra na paleta | Fita |
|---|---|---|---|
| 1 — Faça igual | o **fantasma** passa primeiro e mostra o caminho | EMPURRAR, SUBIR, PULAR | 3 · 4 · 5 |
| 2 — Do meu jeito | placa em pictograma (`🌀 × 3`) | + GIRAR, + `↻3× 🌀` | 5 |
| 3 — Tá molhado | placa + o parque **muda a cada descida** | + `SE 💧` | 5 |

**O nível 1 é o game of S.K.A.T.E.** Um skatista faz o caminho, o outro copia —
é a regra real do esporte, e "faz igual ele fez" é a instrução mais clara que
existe para uma criança de 6 anos. O fantasma é o próprio skatista em silhueta
translúcida, então isso não custa arte nova, e "fantasma" é palavra de skate.

**O nível 2 é onde a repetição nasce de necessidade, não de bônus.** A fase 3
pede `🌀 × 3` com a mega-rampa longe: a linha honesta é
`EMPURRAR, EMPURRAR, SUBIR, GIRAR, GIRAR, GIRAR` — **seis** manobras numa fita
de **cinco**. Não cabe. A criança trava, olha a paleta, e o `↻3× 🌀` está ali:
três espaços viram um. Ninguém explica o que é um laço; ela precisou de um.

**O nível 3 é onde a condicional nasce de necessidade.** O corrimão amanhece
molhado ou seco, **sorteado a cada descida**. Uma linha fixa acerta metade das
vezes — e a criança sente isso, porque ela desce duas vezes e vê o parque
diferente. A carta `SE 💧 → PULAR, senão SUBIR` é a que acerta sempre.

Fases prontas:

- **N1 F1** fantasma: `EMPURRAR, SUBIR, PULAR`
- **N1 F2** fantasma: `EMPURRAR, PULAR, EMPURRAR, SUBIR`
- **N1 F3** fantasma: `EMPURRAR, SUBIR, PULAR, EMPURRAR, SUBIR`
- **N2 F1** `🌀 × 1` — a rampinha basta; ensina que girar só funciona no ar
- **N2 F2** `🌀 × 3` — só a mega-rampa dá 3 de ar; ensina a ler o parque
- **N2 F3** `🌀 × 3` com a mega longe — estoura a fita, o `↻3×` resolve
- **N3 F1** `passar o corrimão` — só o SE, sem giro
- **N3 F2** `🌀 × 1` depois do corrimão — SE mais a regra do ar
- **N3 F3** `🌀 × 3` depois do corrimão — os dois SEs na paleta, um é isca

**Para teste, a implementação sai com o NÍVEL 2 só**, conforme o
[INSTRUCOES.md](../../INSTRUCOES.md). É o nível onde a mecânica aparece
inteira: pedido, regra do ar, leitura do parque e a fita estourando.

## 6. As regras, em código

O veredito **não é um gabarito guardado na carta**. É o resultado de rodar a
linha dentro do parque, manobra por manobra:

```
descer(linha, parque):
  s = { x: 0, velocidade: 0, ar: 0, giros: 0, caiuEm: null }

  para cada (i, manobra) em expandir(linha):        # ↻3×🌀 vira 🌀,🌀,🌀
    resultado = aplicar(manobra, s, parque)
    se resultado.travou:
      s.caiuEm = i                                  # o ÍNDICE do espaço culpado
      pare

aplicar(manobra, s, parque):
  EMPURRAR  → s.x += trecho; s.velocidade += 1
  SUBIR     → precisa de rampa em s.x, senão TOMBO
              s.ar = rampa.ar                       # mega 3 · rampinha 1
  PULAR     → s.ar = 1                              # ollie no plano, sempre cabe
  GIRAR     → se s.ar > 0: s.ar -= 1; s.giros += 1
              senão: TOMBO                          # "você já tava no chão"
  SE c → a/b → aplicar(parque.molhado ? a : b, ...)

cumpriu(pedido, s) = s.caiuEm == null && s.giros >= pedido.giros && s.x >= FIM
```

Três coisas que essa forma garante:

- **a mesma carta acerta ou erra dependendo de onde caiu na linha** — `GIRAR`
  no espaço 4 voa, no espaço 1 derruba. É isso que faz a ORDEM ser o conteúdo
  do jogo, e não a coleção de cartas;
- **o SE é resolvido no instante da descida**, lendo `parque.molhado` sorteado
  naquela descida — não existe resposta certa guardada em lugar nenhum;
- **nenhum estado sem saída**: o caminho é sempre editável, o VAI só depende de
  ela estar cheia, e nenhuma combinação de erro deixa a fase impossível.

## 7. O erro, e o que ele não pode ser

O catálogo manda travar no erro. Aqui existem **dois erros diferentes**, e
tratar os dois igual confunde a criança — um é "não dá", o outro é "não é isso
que eu pedi".

### Erro A — o tombo (tem um culpado)

1. o skatista cai, cômico, sem dano e sem vida perdida;
2. o mundo congela e **o espaço `caiuEm` da fita** ganha cadeado, brilho e um
   tremor;
3. o balão diz **o que aconteceu ali** (`Você ainda tava no chão!`), nunca
   "tente de novo" e nunca a resposta;
4. tocar naquele espaço devolve a carta; a fita volta a aceitar;
5. depois de dois tombos no mesmo espaço, a carta certa pisca na paleta;
6. o skatista volta ao começo e a linha roda inteira de novo — o programa roda
   inteiro, sempre. É isso que ensina que um algoritmo é uma coisa só.

### Erro B — desceu bonito e não cumpriu (não tem um culpado)

Ninguém cai, nada trava por espaço, porque **não existe um espaço culpado**:
faltou uma manobra na linha inteira. Então:

1. o contador da placa para onde parou e pisca — `2 de 3`;
2. o balão diz o que faltou (`Faltou um giro!`), sem dizer qual carta;
3. a fita inteira continua editável;
4. depois de duas descidas sem cumprir, a carta que resolve pisca na paleta.

Travar um espaço aqui seria mentira — a criança ficaria consertando a manobra
certa. E **ignorar não é responder**: descer com a fita cheia de `EMPURRAR` e
não cumprir nada conta como erro B, senão a criança aprende que não arriscar é
seguro.

Pontos pelo `runtimeGameBridge`: **+10** se a fase passa na primeira descida,
**+5** depois de conserto. Estrelas 90-70. **Nenhum número aparece na tela**,
conforme a seção Pontuação do [INSTRUCOES.md](../../INSTRUCOES.md) — a criança
vê estrela, selo, bolinha de fase e a linha que ela montou.

**O cronômetro conta para cima.** Barra que esvazia cobra pressa, e este jogo
cobra pensar antes de agir; as duas coisas juntas viram aflição. Ele mede a
partida, aparece no subtítulo do painel de fim de nível (`formatTime` de
`shared/hud/createTimeBar`), e para no tutorial e na reprise.

## 8. Feedback

| Momento | O que acontece |
|---|---|
| Carta escolhida | voa da paleta até o espaço, com "tuc" de encaixe |
| Caminho cheio | o VAI acende e pulsa — é o único convite da tela |
| Executando | o espaço do momento acende junto com o pedaço do parque |
| EMPURRAR | raspa do shape no concreto, poeirinha atrás |
| SUBIR / PULAR | deformação de mola, chiado do shape subindo a rampa |
| GIRAR | o skatista roda, rastro em arco, e **o contador da placa sobe** |
| `↻3×` | o número do laço gira 1·2·3 dentro da carta, em sincronia com os giros |
| `SE` dispara | a carta acende no instante em que o parque é lido |
| Tombo | tremor curto da câmera, estrelinhas de desenho, moldura pisca vermelha |
| Não cumpriu | a placa pisca, sem tremor e sem vermelho — é decepção, não acidente |
| Linha fechada | moldura pisca verde, confete, o skatista levanta o shape |
| Replay | as cartas acendem em sequência, a descida refeita em ~2 s, e o balão nomeia o ALGORITMO |

Áudio 100 % sintetizado em WebAudio, sem arquivo, como nos outros jogos: raspa
do shape (ruído passa-banda), mola do ollie, "tuc" da carta, tombo surdo, o
tique do contador e a fanfarra do replay. Respeita o `mute-audio` do
`EventBus`. O tique do `↻3×` sai do **mesmo relógio** que gira o skatista —
tween paralelo descola em minutos.

**Efeitos que o jogo usa:** moldura da tela piscando nas bordas; carta voando
para o espaço; botão afundando com `back` ease; brilho de vitória feito com a
**silhueta do próprio skatista**, não com um círculo genérico; e a reprise da
linha no fim da fase. O brilho de destaque é **contorno**, nunca borrão que
cobre meia tela — foi o erro do Ritmo da Rotina.

## 9. Antes da arte existir

`createTrickCard` — um cartão arredondado com o nome da manobra, no tamanho
final — entra no lugar de qualquer figura que falte. É o que deixa a fase
inteira jogável e ajustável antes do primeiro desenho chegar, e o que impede um
arquivo faltando de derrubar o `vite build`. As texturas entram por
`import.meta.glob`, **nunca** por `import` estático.

**O concreto não é textura do jogo — ele vem no fundo.** É a lição do Pulo
Programado: um PNG de concreto encostando num concreto desenhado mostra a
emenda, e é a primeira coisa que o olho acha. A pista pintada no `bg-parque` é
a única superfície, e o código não desenha chão nenhum.

**A rampa, a caixa e o corrimão SÃO textura** — decisão de 21/09/2026, depois
de as três nascerem em `Graphics`, e já entregues. Isso mexe com uma regra da
casa, e vale dizer como ela fica de pé:

> Geometria que a regra lê continua morando no código. O `trickPath` pergunta
> a altura do lábio da rampa para animar a subida, e uma arte que a física não
> conhece é uma arte que discorda do jogo. O que mudou foi **quem se ajusta a
> quem**: os números de `RAMP` e `LEDGE` passam a sair da MEDIÇÃO da caixa
> alfa do desenho, em vez de o desenho ter de acertar um número combinado.
> Continua havendo uma fonte só — ela é que agora começa no papel.

As medidas estão em `OBSTACLE_ART`, em `data/layout.ts`, e o `plantar()` do
`park` posiciona cada peça pela caixa alfa — não pelo quadro. Sem isso a rampa
ficaria deslocada do seu marco (o desenho começa a 6,5 % da esquerda do
arquivo) e o corrimão flutuaria meio corpo acima da pista (ele só ocupa a
metade de baixo do quadro dele).

Se uma textura faltar, o jogo não para: o `park` desenha um vulto em
`Graphics` no lugar e a fase continua jogável.

Ordem de produção:

1. placeholder, parque em Graphics, caminho, paleta e VAI — N2 F1 jogável de
   ponta a ponta;
2. `descer()`, a regra do ar, o tombo e a trava por espaço;
3. a placa do pedido com contador ao vivo, e o erro B;
4. `↻3×`, o `SE` e o sorteio do corrimão;
5. replay com a palavra ALGORITMO, estrelas e painel de fim de nível;
6. arte real entrando no lugar dos cartões;
7. conferência: mudo, pausa pelo `?`, retomada sem salto, e a faixa 16:9 num
   celular em pé.

## 10. Registro

- pasta: `src/games/EF15CO02/maratona-do-algoritmo/`
- assets: `src/assets/games/EF15CO02/maratona-do-algoritmo/`
- slug `maratona-do-algoritmo`, módulo `EF15CO02/maratona-do-algoritmo`
- skill `EF15CO02`, `years: [1, 2, 3, 4, 5]`, ícone 🛹, `order: 435`
  (a Academia é 430 e o Circuito da Verdade é 440)
- tags: `["algoritmo", "repetição", "condicional"]`
- entra em `catalog.ts`, `gameInstructions.ts` e no conjunto
  `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` de `GameDetailsPage.tsx`
- `faseInicial` não é opcional: a plataforma manda `?stage=2` e o jogo abre no
  nível 2, pelo `registry`, na `BootScene.create()`

**No README, a linha do EF15CO02/R2 precisa mudar de gênero**: hoje diz
`Plataforma`, e passa a ser `Esporte (skate)`.

## 11. O que mudou na construção

Seis decisões saíram diferentes do que este documento previa, e o motivo de
cada uma:

**O plano saiu da faixa do topo e foi desenhado sobre o parque.** É a mudança
maior, e ela nasceu de uma constatação simples: com fita de quadradinhos em
cima, cartas embaixo e botão redondo no canto, este jogo tinha a MESMA silhueta
de tela do Pulo Programado — dois jogos diferentes que pareciam o mesmo com
outra pele. A trajetória pontilhada com os medalhões pousados nos marcos
resolve o parecido e melhora o ensino junto, pelos três motivos da §3.

**A geometria das manobras virou um módulo só, `data/moves.ts`.** A linha
desenhada e a animação do skatista precisam ser o mesmo caminho: se cada uma
tivesse a sua conta, a criança veria um percurso previsto e outro executado, e
o jogo inteiro depende de ela confiar que a linha que montou é a linha que vai
rodar. A primeira tentativa desenhava uma spline pelos pontos de parada, e a
spline **estourava nas curvas** — desenhava um caminho que o tween não faz.
Agora cada trecho é amostrado com a curva de aceleração do seu próprio tween.

**A vinheta do foco saiu.** Ela existia para destacar a descida, e o que
destacava mesmo era a camada escura: a tela apagava no momento em que a criança
mais queria olhar. Ficou só o zoom, que caiu de 12 % para 8 % — sutil de
propósito, porque agora não há nada competindo com ele.

**O segundo `bg-parque` mudou o chão do jogo.** O primeiro veio com rampas e
piso pintados dentro, e por isso o jogo desenhava um deck próprio na frente. O
fundo novo é uma pista limpa, então esse deck **saiu**: dois concretos
encostando é exatamente a emenda que o TEXTURAS.md manda evitar. Agora existe
uma superfície só, a que o desenho já trouxe, e os marcos são plantados direto
nela.

**A rampa ganhou material próprio.** Ela nascera nas cores do concreto e, com o
fundo limpo, virou um recorte branco sobre um chão branco — o objeto mais
importante do parque era o mais difícil de achar. Virou cinza-azulada com
contorno de tinta e lábio laranja. Pelo mesmo motivo o marco `plano` deixou de
ser uma barrinha clara e virou **duas setas pintadas no concreto**.

**O fantasma ficou mais transparente.** A 0,8 de alfa com tinta azul-clara ele
saía igual ao skatista de verdade, e a criança via dois meninos iguais sem
saber qual era a demonstração. Agora é 0,6 com azul forte.

**Todas as palavras do jogo foram trocadas.** A primeira versão falava em
"linha", "manobra", "caixote" e "DROP" — quatro termos que uma criança de 6
anos não conhece. "Linha" para ela é linha de costura, "drop" nem é português,
e o botão mais importante da tela estava escrito em código. O jogo passou a
falar de **CAMINHO**, que é o que ela vê desenhado no chão, de **CAIXA**, de
**RAMPA** e de **VAI**.

| Antes | Agora |
|---|---|
| `DROP` | `VAI!` |
| `Olhe a linha dele.` | `Olhe o que ele faz.` |
| `Toque para montar a sua.` | `Toque para fazer igual.` |
| `Ela pousa neste anel.` | `A figura fica aqui.` |
| `Linha pronta? DROP!` | `Cheio? Aperte VAI!` |
| `Tinha um caixote aqui!` | `Aqui tem uma caixa!` |
| `A rampa pedia subir!` | `Aqui tem uma rampa!` |
| `Que linha!` · `Linha limpa!` | `Boa!` · `Que legal!` |
| `Uma ordem de manobras tem nome: ALGORITMO!` | `Esses passos na ordem certa têm um nome: ALGORITMO!` |

**A única palavra difícil que sobrou é ALGORITMO, e ela é difícil de
propósito**: é o nome que a habilidade manda ensinar, e ele só aparece no fim,
depois de a criança ter feito um.

**O nível ganhou uma abertura, e o tutorial perdeu um passo.** O primeiro
passo do tutorial dizia "Olhe o que ele faz" sobre um parque parado: sem
"ele" na tela e sem nada acontecendo. Quem apresenta o fantasma agora é a
ABERTURA — o skatista chega rolando, diz o nome, e o amigo aparece ao lado
enquanto a frase o nomeia. O tutorial ficou com três passos e só fala do que a
criança tem de FAZER.

Para isso o balão aprendeu a ter dono: `say(texto, cor, ms, atX)` ancora o
balão em quem fala, com o rabicho sobre a cabeça dele. Sem isso a fala de
apresentação saía do meio da tela apontando para o concreto vazio.

**A rampa virou um quarter-pipe de verdade.** Ela era um `arc` do Phaser
emendado com dois `lineTo`, e saía uma bolha ovalada — a curva fechava pelo
lado errado e o que se via era um seixo. Um quarter-pipe tem três lados —
base reta no chão, transição côncava, costas verticais — e o segredo é o
CENTRO da curva: ele fica no alto à esquerda, em `(left, base − h)`, e não no
pé da rampa. É essa escolha que faz a superfície afundar abaixo da diagonal
em vez de estufar por cima dela, que é o que uma transição é.

**A caixa ganhou volume.** Era um retângulo arredondado liso; agora tem a
barra de metal no topo (que é onde o skate raspa), a sombra do vão embaixo e
as marcas de raspão que qualquer caixa de parque tem depois de uma semana.

**Os obstáculos viraram textura, e a regra continuou mandando.** Rampa, caixa
e corrimão nasceram em `Graphics` porque o `trickPath` lê a altura do lábio, e
arte que a física não conhece é arte que discorda do jogo. Com a folha pronta,
o que mudou foi **quem se ajusta a quem**: as caixas alfa foram medidas e os
números de `RAMP` e `LEDGE` passaram a sair do desenho. `RAMP.h` virou 115, e
a subida termina exatamente no lábio desenhado — conferido rodando, o skatista
chega a **6 px** do ponto previsto.

Duas consequências caíram daí, e as duas mostram por que medir vale mais que
combinar:

- **o ollie abriu de 108 para 190 px antes do marco.** A caixa entregue tem
  240 px de largura, cinco vezes mais larga que alta; saltando a 108 px do
  centro dela, o skatista começaria a subir já em cima da borda esquerda e
  atravessaria a peça. Como o pontilhado sai da mesma função, ele abriu junto
  — sem uma linha a mais de código;
- **o `rollTo` deixou de aceitar destino para trás.** Um ollie agora termina
  190 px depois do seu marco, e o marco seguinte pode começar antes disso:
  pedir para "rolar até" um ponto já ultrapassado fazia o skatista andar de ré
  no meio do percurso. Agora ele simplesmente já chegou.

**A capa provisória saiu.** O `catalog.ts` usava o `bg-parque` no lugar dela; a
capa de verdade chegou e a `BootScene` a exclui do `import.meta.glob`, porque
ela é do catálogo e carregá-la no jogo seriam 2 MB baixados para nada.

**As bolinhas da trajetória ficaram pálidas e passaram a andar.** Paradas e
escuras elas competiam com o skatista e com os obstáculos — viravam um traço
grosso atravessando a tela. Agora desfilam para a frente, uma a cada 55 ms,
com alfa 0,45 quando o trecho já foi decidido e 0,22 quando não. É o desenho
universal de "por aqui", e **é o movimento que chama o olho, não a tinta**:
foi isso que permitiu baixar a opacidade quase pela metade sem a linha sumir.

**A conta do voo foi refeita, e ela é a lição mais cara deste jogo.** O plano
previa fita de 140 px, zoom de 18 % e ollie de 150. Na tela o skatista
atravessava o teto da máscara no ápice e só o shape aparecia acima do muro — o
mesmo erro do Pulo Programado, invertido: lá o painel de baixo engoliu o
coelho, aqui o de cima cortou o ollie. **O teto não é o topo da tela, é
`PARK.top` ampliado pelo zoom.** A fita encolheu para 120, o zoom caiu para
12 % e o voo ficou em 130 (ollie) e 142 (rampa). Medido no navegador: o ponto
mais alto do sprite chega a 141 px de tela contra um teto de 128 — 13 px de
folga. A fórmula está escrita em `SKATER`, e mexer em qualquer um dos quatro
números obriga a refazê-la.

**O foco não faz panorâmica vertical.** A primeira versão centrava o skatista
na tela nos dois eixos, e isso subia a imagem junto com ele — o ollie batia no
teto ainda mais cedo. Agora o eixo vertical fica ancorado na linha do chão
(`GROUND.y × (1 − zoom)`): o deck não se mexe e todo o crescimento vai para
cima, que é para onde ele voa. Só a horizontal acompanha, com folga travada
nas bordas.

**Não existe HUD escrito.** O plano previa pílula de "NÍVEL 1/3", rótulo de
"FASE 1 DE 3" e cronômetro visível. Saíram os três: sobraram as **bolinhas de
fase**, que dizem a mesma coisa sem uma palavra. O relógio continua contando
para cima por dentro e aparece uma vez só, no subtítulo do painel de fim de
nível. Com isso a única palavra permanente da tela é o `?`, e as únicas outras
são os três nomes das manobras nas cartas.

**As folhas vieram maiores que o pedido.** `skatista.png` chegou em 450 × 450
por célula e `decor.png` em 400 × 400, no lugar dos 256 do TEXTURAS.md. A grade
está certa (4 × 2 e 2 × 2) e o `setDisplaySize` resolve o resto — o número que
o `load.spritesheet` precisa é o do arquivo, não o do documento. As caixas alfa
foram medidas: rodas a 99,8 % da altura no quadro 0, tombo terminando em
91,1 %, e os quadros 3/4/5 com centros a 50,2 / 48,2 / 52,2 % — os dois últimos
ganharam correção em `FRAME_NUDGE` para o giro do nível 2 não tremer.

### O que ficou pendente

- **Níveis 2 e 3.** Só o nível 1 foi construído, conforme o
  [INSTRUCOES.md](../../INSTRUCOES.md). `GIRAR`, `REPITA 3×`, o `SE` e o
  corrimão molhado estão desenhados nas §5 e §6 e não foram implementados.
- **A capa do catálogo.** A entrada usa `bg-parque.png` como provisório,
  marcado com comentário no `catalog.ts`.
- **O `decor.png`.** Só dois dos quatro adereços entram em cena (o cone e a
  caixa de som, nas bordas). O banco e o vaso ficaram de fora porque o meio da
  pista precisa estar limpo para a trajetória ser lida.
- **O `obstaculos.png`.** Pedido em 21/09/2026 com quatro peças — rampa, mega-
  rampa, caixa e corrimão —, sendo que as duas últimas só entram nos níveis 2
  e 3. Até ele chegar, as quatro seguem desenhadas em `Graphics`, e quando
  chegar é a medição da caixa alfa que define `RAMP.h`, `MEGA.h` e `LEDGE`.
- **O erro B** (descer inteiro sem cumprir o pedido) não existe no nível 1,
  porque no nível 1 o pedido é a linha do fantasma e todo erro tem um espaço
  culpado. Ele entra junto com a placa de pedido, no nível 2.
