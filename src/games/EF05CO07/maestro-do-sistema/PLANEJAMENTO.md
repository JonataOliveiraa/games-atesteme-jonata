# Maestro do Sistema — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO07 · 5º ano · Mundo Digital · Sistema operacional**

> **Correções ao briefing, antes de tudo.** O plano já segue com as trocas, para
> quem leu o briefing poder discordar com o documento na mão.
>
> 1. **Não se arrasta nada.** O briefing pede arrastar a ficha até o programa.
>    Arrastar em tela de celular, com o dedo tapando o alvo, é o gesto que este
>    projeto já reprovou em outros jogos. Aqui o gesto é **um toque no
>    programa** — e a peça voa sozinha do atril até ele. É também o gesto do
>    maestro: ele aponta para o músico, não carrega o instrumento.
> 2. **A criança não escolhe a peça: escolhe DE QUEM É A VEZ.** Cada programa já
>    mostra no balão o que precisa. Adivinhar qual peça combina é o jogo irmão
>    (`EF05CO07/sistema-operacional`). O que este jogo cobra é o que só o
>    sistema operacional faz: **dar a vez** quando a peça é uma só, e
>    **encerrar** quem travou segurando a peça.
> 3. **Fora o cronômetro de 90 s, o medidor de "orquestra afinada" e a nota por
>    porcentagem.** Jogo de pensar não pede pressa, e número de ponto,
>    porcentagem ou placar é proibido pelo [INSTRUCOES](../../INSTRUCOES.md).
>    **O medidor virou a própria música** (§5): cada programa tocando acrescenta
>    uma camada, e a criança *ouve* se a orquestra está cheia.
> 4. **"+10 acerto / +5 depois da trava" continua existindo, no bridge.** Na
>    tela, não: o que a criança vê é a nota acendendo, o programa se curvando e
>    a bolinha da fase.
> 5. **As fichas não são três genéricas: é UMA de cada peça.** É a verdade do
>    computador — há um processador, um alto-falante, uma tela, um pente de
>    memória — e é o que faz a fila nascer sozinha, sem inventar escassez.
> 6. **O atril não é para consultar.** O estado mora **no balão do programa**
>    (§4): aceso quer dizer *pode tocar agora*, cinza quer dizer *espera*. A
>    criança decide olhando para **um lugar só**, e o atril fica como cena.

---

## 1. A história, e o jogo em três frases

**O computador é uma orquestra, e a criança é o maestro.** Os programas são os
músicos: cada um senta na sua cadeira e levanta um balão pedindo a peça de
hardware de que precisa para tocar. As peças são poucas — **uma de cada** — e
por isso alguém sempre espera.

Essa frase fica **escrita no alto da tela o tempo inteiro**:

> **Faça todos os programas tocarem.**

O jogo inteiro, do primeiro ao último nível, cabe em três frases — e **nenhuma
delas manda olhar para dois lugares**:

1. **Toque no balão aceso** — quem está aceso pode tocar agora.
2. **Se dois acenderem querendo a mesma peça, toca quem chegou antes na fila.**
3. **Quem treme travou e segura a peça — toque nele e aperte o X.**

~~~text
┌────────────────────────────────────────────────────────────────────────┐
│ ♥♥♥  NÍVEL 2 ──      Faça todos os programas tocarem.     FASES ●●○ (?)│
├────────────────────────────────────────────────────────────────────────┤
│       ╭──────╮             ╭──────╮             ╭┈┈┈┈┈┈╮               │
│       │  🔊  │  ← ACESO    │  ▣   │  ← ACESO    ┊  ▣   ┊ ← CINZA       │
│       ╰──┬───╯             ╰──┬───╯             ╰┈┈┬┈┈┈╯               │
│      MUSIQUINHA           JOGUINHO            DESENHO                  │
│      ♪ ♪ ♪ · ·            ♪ ♪ · · ·           · · · · ·  ← a partitura │
├────────────────────────────────────────────────────────────────────────┤
│  ESPERANDO →  (Desenho)                        ← quem chegou primeiro  │
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐                              ┌────────┐  │
│  │  ▣   │  │  🔊  │  │  🖥  │                              │ FÉRIAS │  │
│  └──────┘  └──────┘  └──────┘                              └────────┘  │
│   o atril — cena: mostra a peça saindo, o aro andando e ela voltando   │
└────────────────────────────────────────────────────────────────────────┘
~~~

A fase acaba quando **todas as partituras estão cheias** — e aí vem o showzinho
(§13): a batuta na mão da criança, o acorde final e o confete de papel.

---

## 2. A habilidade, e o teste que ela precisa passar

> **(EF05CO07)** **Reconhecer a necessidade de um sistema operacional** para a
> execução de programas e gerenciamento do hardware.
>
> Objeto: **Sistema operacional.**

| O que a habilidade pede | Onde está na mecânica |
|---|---|
| **necessidade** de um SO | o botão **FÉRIAS DO MAESTRO**: 3 s sem gerente, todos pedindo ao mesmo tempo e ninguém tocando — a prova pela ausência |
| **execução de programas** | um programa só toca **depois** de receber a peça; sem peça ele fica com o balão cinza, parado |
| **gerenciamento do hardware** | a peça é **uma só**, sai do atril, fica ocupada e **volta sozinha** quando o programa termina |
| funções do SO: **dispositivos** | as peças são processador, alto-falante, tela e memória, e cada programa precisa da sua |
| funções do SO: **espera e ordem** | a fila de espera, visível, com a regra "quem chegou antes" |
| funções do SO: **encerrar processo** | o programa travado segura a peça até o maestro encerrá-lo |
| **por que isso vale a pena** | a música em camadas (§5): quanto melhor o maestro gerencia, mais cheia a orquestra soa |

### O teste da bolinha

> Troque as peças de hardware por bolinhas coloridas. O jogo muda?

**Muda, e muda no lugar certo.** Se as peças fossem bolinhas infinitas, não
haveria fila, não haveria espera e não haveria nada para gerenciar — o jogo
viraria "toque em todo mundo". O que faz este jogo ser EF05CO07 não é o desenho
do chip: é **haver um só**, ele **sair de circulação** enquanto está em uso, e
**voltar** quando o programa acaba. É o recurso escasso e compartilhado que cria
o gerente.

O que o teste precisa provar aqui é isto: **a criança não consegue terminar a
fase sem decidir a ordem.** Três coisas garantem isso:

1. **Duas peças iguais não existem.** Dois programas que querem o processador
   têm que se revezar, e a decisão é de quem joga.
2. **A peça volta sozinha, mas só quando o dono acaba.** Nada do que a criança
   toca acelera isso — o que ela controla é *quem entra*, não *quanto dura*.
3. **O travado não devolve nada.** Enquanto ele estiver com a peça, a fila não
   anda, e a única saída é o maestro encerrar. É aqui que a criança descobre que
   o sistema operacional não é só um garçom: ele também **tira**.

### O que mudou em relação ao briefing

| Briefing | Aqui | Por quê |
|---|---|---|
| arrastar a ficha até o programa | **um toque no programa** | arrastar com o dedo em cima do alvo já foi reprovado neste projeto |
| a criança escolhe a peça | a criança escolhe **de quem é a vez** | escolher a peça é o jogo irmão; a ordem é o que só o SO faz |
| 3 fichas genéricas | **uma de cada peça** | é a verdade do hardware, e a fila nasce sem escassez inventada |
| rodada de 90 s + medidor de "afinada" | **sem relógio; o medidor é a MÚSICA** | INSTRUCOES: nada de porcentagem e nada de pressa em jogo de pensar |
| "+10" na tela, nota pela % | nota acendendo, showzinho, estrela no fim | INSTRUCOES: nenhum número de ponto na tela |
| relatório com "esperou 12 s" | relatório **desenhado**: a fita da fase, sem segundos | mesmo motivo |
| erro de peça errada | **não existe mais** (a peça não é escolhida) | sumiu junto com o gesto de arrastar |
| telemetria de tempo médio de fila | **cortada** | a plataforma só recebe o que está em `platformEvents`; inventar canal é mentira silenciosa |

---

## 3. Como isso não vira o jogo irmão

`EF05CO07` **já tem** `sistema-operacional` publicado (`id 037`, `order 370`), e
ele é o vizinho mais perigoso do catálogo inteiro: mesma habilidade, mesmos
programas pedindo coisas. A tabela abaixo é obrigação, não enfeite.

| Vizinho | Diferença obrigatória deste jogo |
|---|---|
| **Sistema Operacional** (EF05CO07) | Lá a criança toca **na peça**, e a pergunta é *qual peça, e ela pode agora?* — identificação e estado (livre, sem energia, ocupada, memória cheia). Aqui ela toca **no programa**, e a pergunta é *de quem é a vez, e quem precisa ser encerrado?*. Lá nada anda sozinho: cada pedido é um enigma parado. Aqui **a música continua tocando enquanto ela pensa** — o programa consome compassos, termina e devolve a peça por conta própria. E lá não existe som que meça nada: aqui **o resultado é audível** |
| **Monte seu Computador** (EF05CO05) | Lá a criança **monta** a máquina e classifica as partes. Aqui a máquina já está montada e ligada: o assunto é o uso das partes ao mesmo tempo, por programas diferentes |
| **Raio-X da Máquina** (EF05CO05) | Lá se olha para dentro e se nomeia o que faz o quê. Aqui o nome da peça já vem no balão — o difícil é a vez, não o nome |
| **Missão Arquivo Seguro** (EF05CO06) | Lá o assunto é **onde guardar** e como recuperar. Aqui arquivo não aparece: o recurso é o hardware em uso, e o tempo dele |
| **Revezamento em Lista** (EF05CO01) | Lá a criança **monta uma ordem antes** e vê a lista nadar. Aqui a ordem é decidida **durante**, uma vez a cada peça que se solta, e o mundo não espera a lista ficar pronta |

---

## 4. O gesto: um toque, e um lugar só para olhar

**Esta seção é a que faz o jogo ser fácil.** A regra é uma só, e ela mora no
balão:

> **Balão ACESO** — a peça que ele quer está livre: ele pode tocar agora.
> **Balão CINZA** — a peça que ele quer está na mão de outro: ele espera.

A criança **nunca precisa consultar o atril para decidir**. Ela olha para a
fileira de programas, vê o que está aceso e toca. O atril continua na tela — é
ele que mostra a peça saindo, o aro andando e ela voltando —, mas é **cena, não
consulta**. Foi a decisão que tirou do jogo o "olhe aqui, agora olhe lá embaixo,
agora volte".

| O que a criança toca | O que acontece |
|---|---|
| um programa de **balão aceso** | a batuta faz um arco, a peça voa do atril até ele e ele começa a tocar |
| um programa de **balão cinza** | ele dá de ombros e o aro da peça ocupada **pisca** lá embaixo, mostrando quem está com ela — nada de erro, nada de vida |
| um programa que **treme** (travado) | sobe um **X** grande em cima dele; tocar no X encerra, e a peça volta ao atril |
| um programa **tocando** (do Nível 3 em diante) | sobe o mesmo **X** — encerrar quem está bem é erro, e é um erro que a criança tem o direito de cometer |
| o botão **FÉRIAS** | 3 s de caos, uma vez por fase, sem custo nenhum |
| qualquer outro lugar | nada; o X aberto se fecha |

**Dois acesos ao mesmo tempo querendo a mesma peça é o único caso em que ela
precisa pensar** — e é aí que o mundo prende a respiração (§6) e a faixa da fila
acende.

**Nada de arrastar, nada de dois botões com a mesma silhueta.** Os programas são
alvos de 170 px na grade, afastados. **O atril não recebe toque nenhum**: as
peças não são botões, e é por isso que a decisão é sobre gente, e não sobre
objetos.

---

## 5. A música é o placar

Não existe medidor de "orquestra afinada" na tela. **Existe a música.**

| Quem está tocando | O que se ouve |
|---|---|
| ninguém | só o ar da sala, e um tec-tec baixinho de metrônomo |
| um programa | uma linha magra e sozinha |
| dois | melodia e acompanhamento: já é música |
| três ou mais | a orquestra cheia, com baixo, melodia e batida |

Cada programa tem a **sua camada** — o Joguinho faz a batida, a Musiquinha faz a
melodia, o Desenho faz o baixo, a Chamada de Vídeo entra com um sopro.

O que faz qualquer combinação soar afinada é a harmonia ser **uma só**: uma volta
de quatro compassos (dó · lá menor · fá · sol) de onde todas as camadas tiram as
notas. E cada compasso tem **quatro subdivisões** — uma nota por compasso não é
melodia, é metrônomo com altura. Na prática: a batida põe bumbo no 1 e no 3 e
chimbal no 2 e no 4; o baixo dá a fundamental e depois a quinta; a melodia toca
as quatro notas do acorde da vez, com um harmônico fraco uma oitava acima; e o
sopro sustenta terça e quinta pelo compasso inteiro.

**Som nunca derruba o jogo.** O `beat` roda dentro do `update` da cena, então
uma exceção do WebAudio — contexto suspenso, aba em segundo plano, política de
autoplay — sairia pelo `update` e pararia o loop. Toda nota nasce dentro de um
`try`: a falha aceitável é silêncio.

O palco responde junto: **quanto mais gente tocando, mais aberto e dourado fica o
refletor**. Um só tocando é um foco estreito; a orquestra cheia acende o palco
inteiro.

**Isso é prêmio, não exigência.** Ninguém perde vida, estrela ou fase por tocar
de um em um — as estrelas dependem só das TRAVAS (§11). A orquestra cheia é o
que a criança *quer*, não o que o jogo *cobra*, e é isso que transforma "entregar
peça" em "reger".

E é, por acaso, exatamente o que um sistema operacional de verdade tenta fazer:
manter o máximo possível de programas rodando ao mesmo tempo com o hardware que
tem.

---

## 6. O laço

~~~text
o compasso corre sozinho (1,4 s), e a cada compasso:
      │
      ├─ quem está tocando acende UMA nota da partitura
      ├─ quem acabou a partitura se curva e DEVOLVE a peça ao atril
      └─ quem o roteiro mandar levanta o balão e ENTRA NA FILA
      │
      ▼
uma peça volta ao atril
      │
      ├─ um só esperava por ela  → o balão dele ACENDE, e a vida segue
      └─ dois ou mais esperavam  → O MUNDO PRENDE A RESPIRAÇÃO:
                                    a música sustenta a nota, as partituras
                                    param, a faixa ESPERANDO acende e os dois
                                    balões pulsam — e nada anda até ela escolher
      │
      ▼
a criança toca num programa
      │
      ├─ balão aceso   → ele toca (se havia disputa, vale quem chegou antes)
      ├─ balão cinza   → ele dá de ombros; o aro da peça pisca lá embaixo
      └─ ele treme     → sobe o X; tocar no X devolve a peça
      │
      ▼
todas as partituras cheias → SHOWZINHO (§13) → próxima fase
~~~

**O mundo prende a respiração exatamente onde a criança precisa pensar.** Fora
desse instante o compasso corre, a música toca e nada exige nada dela — e nesse
instante o tempo para sozinho, sem aviso escrito, sem painel, sem botão de pausa.
É o mesmo truque do Robô Sorrateiro, que congela o mundo quando as cartas sobem.

**A criança não aperta "tocar" e nem "parar".** Quem toca é o programa, e quem
decide *quando ele pode* é ela. Se o dedo pudesse tocar a música, o jogo viraria
reflexo e o sistema operacional viraria enfeite.

**Demorar não custa nada.** Sem relógio, sem medidor: o que existe é um cutucão
gentil (§12) quando há uma vez para dar e ninguém a deu.

---

## 7. O que a criança vê e faz, momento a momento

Esta tabela é o contrato de clareza do jogo: **em nenhuma linha dela a criança
fica sem saber o que fazer ou o que acabou de acontecer.** O programa fala em
balão curto, de três a cinco palavras, sempre preso à cabeça dele.

| Momento | O que está aceso | O balão | O que é tocável |
|---|---|---|---|
| **a fase começa** | o palco acende cadeira por cadeira; o atril entra por baixo | — | nada, por 1 s |
| **um programa pede, com a peça livre** | o balão sobe **aceso**, e a peça correspondente pulsa no atril | *"Posso tocar!"* | **ele** |
| **um programa pede, com a peça ocupada** | o balão sobe **cinza**, e a carinha dele entra na faixa ESPERANDO | *"Vou esperar."* | ele (dá de ombros) |
| **peça entregue** | a batuta faz o arco, a peça escurece no atril e o aro começa a esvaziar | *"Já vou tocar!"* | os outros |
| **tocando** | uma nota acende a cada compasso; **a camada de música dele entra** | — | ele (só do N3 em diante, para o X) |
| **peça devolvida, um esperando** | ela voa de volta e **o balão dele acende sozinho** | *"Minha vez!"* | ele |
| **peça devolvida, dois esperando** | **o mundo prende a respiração**: faixa acesa, dois balões pulsando | — | só os dois |
| **furou a fila** | TRAVA: a faixa acende e o primeiro da fila dá um pulinho | *"Ele chegou antes de mim."* | só o primeiro da fila |
| **travou** | música falha, palco escurece meio segundo, ele treme e a nota dele **quebra no ar** | *"Travei!"* | ele → o X |
| **encerrado certo** | ele apaga com um puff, a peça volta voando e a fila anda | *"Já volto!"* | os outros |
| **encerrou quem tocava** | TRAVA: as notas já tocadas **apagam** e ele recomeça do zero | *"Eu estava tocando…"* | só o travado, se houver |
| **partitura cheia** | ele se levanta, se curva, e a peça volta ao atril | *"Terminei!"* | os outros |
| **fase vencida** | o showzinho (§13) | — | a batuta, e depois o botão de seguir |

---

## 8. A grade: 1280 × 720

`Phaser.Scale.FIT`, coordenada absoluta em `data/layout.ts`. Coluna do celular =
`× 0,30` (aparelho de 390 px). Abaixo de ~40 px reais não serve para dedo de
criança.

| Faixa | y | Conteúdo | Tamanho na grade | No celular |
|---|---:|---|---:|---:|
| HUD | 0–92 | vidas (x 44), selo do nível (x 208), a missão (x 640), **FASES** com as bolinhas (x 1112), `?` (x 1216) | selo 150 × 48 · missão 27 · bolinha 22 | 45 × 14 · 8 · 7 px |
| Palco | 96–500 | cadeiras, programas, balões, partituras | programa 170 · balão 120 × 96 · nota 22 | 51 · 36 × 29 · 7 px |
| Fila | 508–560 | a faixa **ESPERANDO** e as carinhas em ordem | carinha 46 | 14 px |
| Atril | 568–716 | as peças e o botão FÉRIAS | peça 180 × 140 · FÉRIAS 160 × 120 | 54 × 42 · 48 × 36 px |

**Quantas coisas a criança olha.** Duas: a fileira de programas e a faixa da
fila. O atril é a terceira, mas ela nunca *precisa* dele para decidir — e é por
isso que a conta de alvos simultâneos fecha (ver a nota de casa sobre densidade
de alvos no celular: o teto é 4).

**As cadeiras.** Três cadeiras em `x = 340, 640, 940`; a quarta (o convidado do
Nível 3) entra em `x = 1140`, e as outras três recuam 60 px para a esquerda para
abrir espaço — o convidado **chegando** é meio jogo do Nível 3, e ele precisa
caber sem apertar.

**O atril.** Três peças nos Níveis 1 e 2, quatro no 3. Quatro peças de 180 com
vãos de 36 = `4 × 180 + 3 × 36 = 828`, centradas em `x = 560` (de 146 a 974); com
três, a fileira encolhe e continua centrada no mesmo ponto. O **FÉRIAS** fica em
`x = 1150`, largura 160 (de 1070 a 1230): **96 px de vão** até a última peça, ou
29 px reais — é o botão mais perigoso da tela para um toque acidental, e por isso
é o único elemento da faixa que fica à direita, longe de tudo.

**O aro de uso** de cada peça tem raio 56 e mora **em volta da própria peça**, no
atril — nunca sobre o programa.

**A faixa da fila só existe quando há alguém esperando.** Ela entra deslizando de
baixo e sai quando esvazia: no Nível 1 ela nunca aparece.

---

## 9. Níveis e fases

**Fase = uma peça de música.** Três fases por nível, e a fase cresce dentro do
nível.

| Nível | A ideia | Programas | Peças no atril | Fila | Travamentos | FÉRIAS |
|---|---|---:|---|---|---:|---|
| **1** | pedido → peça → toca | 2 | **2**, e 3 só na fase 3 | não nasce | 0 | escondido |
| **2** | **a vez é de quem chegou antes** | 3 | **3** (justas) | nasce na fase 1 | 1, na fase 3 | botão liberado |
| **3** | **o travado segura a peça** | 3 + 1 convidado | **4** (entra a memória) | dois esperando ao mesmo tempo | 2 | apresentado no `?` |

**Cada nível acrescenta exatamente uma ideia, e nada mais.** O Nível 1 é aula:
sem fila, sem travamento, sem botão de férias, com peça sobrando e **sem a faixa
da fila na tela**. A criança vê o ciclo inteiro acontecer — pede, recebe, toca,
devolve — sem nenhuma decisão difícil por cima.

**A memória entra só no Nível 3.** Três peças de formatos bem diferentes já são o
bastante para aprender; a quarta chega junto com o convidado, quando a criança já
não precisa pensar no que é cada uma.

**A primeira fase do Nível 1 é guiada** (`guided: true`): o programa de balão
aceso ganha um **halo pulsando** depois de ~3 s sem toque, e ali nada custa vida.
Da segunda fase em diante a vida volta a valer.

### O elenco (`data/cast.ts`)

| Programa | O que pede | Camada de música | Traço | Cor |
|---|---|---|---|---|
| **Joguinho** | processador | a batida | consolinha de mão, dois botões redondos | `#3f8f8a` |
| **Musiquinha** | alto-falante | a melodia | radinho com antena e mostrador | `#e2725b` |
| **Desenho** | tela, e depois outra peça | o baixo | prancheta com um pincel na mão | `#7a6bbd` |
| **Chamada de Vídeo** (convidado, N3) | processador | um sopro | webcam redonda num tripé | `#6aa84f` |

**O Desenho é o único que pede duas vezes**, e em momentos diferentes: no Nível 2
ele pede a **tela** e depois o **processador** — que é justamente o que o
Joguinho está usando, e é assim que a fila nasce. No Nível 3 o segundo pedido
dele passa a ser a **memória**.

**O convidado surpresa chega no meio da fase**, com a fila já formada, e **entra
no fim dela**. É a lição do Nível 3 em uma imagem: chegar depois não fura a vez
de ninguém.

### As peças (`data/cast.ts`)

| Peça | Pictograma | Silhueta do cartão | Entra em |
|---|---|---|---|
| **processador** | chip | quadrado | Nível 1 |
| **alto-falante** | nota | círculo | Nível 1 |
| **tela** | retângulo | cartão largo e baixo | Nível 1 |
| **memória** | raio | cartão alto e estreito | Nível 3 |

**Quatro silhuetas diferentes, de propósito.** A 54 px reais o pictograma some, e
o que a criança reconhece é o **formato**.

Frase-síntese do fim do jogo: **"O sistema operacional é o maestro: ele dá a vez
a cada programa e encerra o que travou."**

---

## 10. As regras, em código

O veredito sai do **estado do palco no instante do toque** — não de um gabarito
guardado na fase.

~~~ts
type Piece = 'cpu' | 'speaker' | 'screen' | 'memory'

type ProgramState = 'idle' | 'asking' | 'waiting' | 'playing' | 'frozen' | 'done'

interface Ask { at: number; piece: Piece; notes: number }

interface Slot {
    id: string
    asks: Ask[]
    next: number
    state: ProgramState
    holds?: Piece
    played: number
    askedAt?: number       // o compasso em que entrou na fila — é a ORDEM
}

type Verdict = 'served' | 'busy' | 'skip-queue' | 'closed' | 'closed-healthy' | 'none'

/** O balão aceso é isto, e nada mais: a peça dele está livre. */
const canPlayNow = (w: World, s: Slot) =>
    s.state === 'waiting' && !w.busy.has(s.asks[s.next].piece)

/** Quem chegou antes, entre os que esperam a MESMA peça. */
function queueHead(w: World, piece: Piece): string | undefined {
    return w.slots
        .filter(s => s.state === 'waiting' && s.asks[s.next].piece === piece)
        .sort((a, b) => (a.askedAt ?? 0) - (b.askedAt ?? 0))[0]?.id
}

/** O mundo prende a respiração quando a escolha tem dono. */
const mustHold = (w: World) =>
    PIECES.some(p => !w.busy.has(p) && w.slots
        .filter(s => s.state === 'waiting' && s.asks[s.next].piece === p).length > 1)

function judgeServe(w: World, id: string): Verdict {
    const s = w.slots.find(x => x.id === id)
    if (!s || s.state !== 'waiting') return 'none'
    if (!canPlayNow(w, s)) return 'busy'
    return queueHead(w, s.asks[s.next].piece) === id ? 'served' : 'skip-queue'
}

function judgeClose(w: World, id: string): Verdict {
    const s = w.slots.find(x => x.id === id)
    if (!s) return 'none'
    if (s.state === 'frozen') return 'closed'
    return s.state === 'playing' ? 'closed-healthy' : 'none'
}
~~~

**`askedAt` é o compasso do pedido, e é a única coisa que decide a ordem.** Não
existe "o certo desta fase": existe uma regra que a criança lê na faixa
ESPERANDO, da esquerda para a direita.

**`canPlayNow` é a fonte única do balão.** O desenho do balão não pode ter lógica
própria: aceso e cinza saem daqui, senão um dia o balão mente.

Três validações rodam ao carregar `FASES` e falham alto no dev:

1. **toda fase termina** — simular um maestro perfeito (sempre o primeiro da
   fila, encerrar o travado assim que ele treme) e conferir que todas as
   partituras enchem;
2. **nenhum beco sem saída** — em nenhum compasso pode existir um estado com
   **zero balões acesos e zero programas tocando**; se houver, tem que haver um
   travado na tela, porque encerrar é a saída;
3. **todo travamento segura uma peça** — um programa que trava sem nada na mão
   não ensina nada e vira enfeite que treme.

---

## 11. O erro, a TRAVA e as vidas

**Errar de dedo não existe aqui**: tocar num programa de balão cinza é
*informação*, não erro — ele dá de ombros e o aro da peça pisca. O que existe são
**dois erros de cabeça**, e eles são diferentes:

| Erro | Quando é possível | O que se vê | A frase |
|---|---|---|---|
| **furou a fila** | só quando dois acesos disputam a mesma peça | a faixa ESPERANDO acende e o primeiro dá um pulinho | *"Ele chegou antes. A vez é dele."* |
| **encerrou quem tocava** | só do Nível 3 em diante, onde o X existe | as notas já tocadas apagam e o programa recomeça do zero | *"Ele estava tocando bem. Encerre só quem travou."* |

**Os dois erros são impossíveis nos níveis em que a criança ainda não aprendeu a
regra.** No Nível 1 não há disputa e não há X: não há como perder vida.

A TRAVA, passo a passo:

1. a música baixa e o compasso para; moldura âmbar curta, sem estrondo;
2. **a explicação aparece na peça que errou**, não num painel à parte — a faixa
   da fila, ou o programa que perdeu as notas;
3. a frase diz **o que** estava errado, nunca "tente de novo" e nunca a resposta;
4. só a jogada certa destrava: o primeiro da fila, ou o travado;
5. **segundo erro na mesma fase:** a jogada certa **pisca**.

Custo: `WRONG_ANSWER` e uma vida, **uma vez por fase** — o segundo erro da mesma
fase não cobra de novo, e **o contador zera ao trocar de fase**.

**Nenhum estado sem saída:** furar a fila não move nada (a peça continua livre);
encerrar quem tocava devolve o programa ao início da partitura, mas ele continua
podendo tocar. A fase nunca fica impossível — a validação 2 do §10 é exatamente
essa promessa, conferida no carregamento.

---

## 12. Feedback, e os bonequinhos vivos

| Momento | O que acontece |
|---|---|
| um programa pede | o balão sobe com um "pop", **aceso ou cinza**, e a peça correspondente pulsa no atril |
| toque certo | a **batuta** faz um arco do atril até o programa, e a peça voa atrás dela |
| a peça sai do atril | o lugar dela fica com o contorno vazio e o **aro** começa a esvaziar |
| tocando | **uma nota acende por compasso**, e a camada de música dele entra (§5) |
| dois tocando juntos | eles **se olham e se cutucam**, e o refletor abre mais |
| balão cinza tocado | o programa dá de ombros e o aro da peça em uso pisca duas vezes |
| esperando há muito tempo | ele **suspira**, e o que está tocando ao lado olha para ele |
| a peça volta | ela voa de volta ao lugar, o aro enche e quem vai poder tocar **pula uma vez** |
| **travou** | a música **falha feio**, o palco escurece meio segundo, ele treme e a nota dele **quebra no ar** |
| X | o X sobe com `back`, e o toque nele faz um puff e devolve a peça |
| partitura cheia | ele se levanta, se curva, e a partitura dele fica dourada |
| fase vencida | o showzinho (§13) |
| fim do nível | `showLevelComplete`, estrelas, bolinhas de fase, tempo no subtítulo |

**Travar tem que gritar.** Perceber que alguma coisa **parou** é muito mais
difícil, para uma criança, do que perceber que alguma coisa **aconteceu** — e o
jogo inteiro do Nível 3 depende de ela reparar. Por isso o travamento não é
discreto: falha na música, escurecida no palco, tremor e nota quebrada. Ela não
precisa "reparar"; o jogo avisa.

**Os bonequinhos são gente, não estados.** O cutuco entre dois que tocam juntos,
o suspiro de quem espera, o pulinho de quem vai entrar — são três animaçõezinhas
baratas, e são o que faz criança gostar de um jogo. Sem elas o palco é um painel
de status com pernas.

**O cutucão.** Depois de ~6 s com um balão aceso e nenhum toque, o programa ganha
um **halo pulsando**; depois de ~12 s, a batuta faz um arco pequeno na direção
dele. **Nenhum dedo desenhado apontando** — este projeto já tirou esse dedo de um
jogo, e não o traz de volta.

### Pontuação e tempo

Nenhum número na tela. A criança vê partitura, fila, bolinha de fase e estrela —
e **ouve** a orquestra. **Cronômetro que conta para cima**, mostrado só no
subtítulo do painel de fim de nível (`formatTime`).

Estrelas: **3** sem nenhuma TRAVA no nível, **2** com uma ou duas, **1** acima
disso. A orquestra cheia **não** entra na conta (§5). Pontos, só pelo bridge:
+10 na jogada certa de primeira, +5 depois da trava.

---

## 13. O fim da música

A fase não pode simplesmente acabar. **Ela tem que ter aplauso** — e o aplauso é
o fim da peça, não uma tarefa nova.

1. a última nota acende e a partitura daquele programa fica **dourada na hora**;
2. ele se curva, e **só então** devolve a peça, que volta voando ao atril;
3. dois segundos e meio de respiro — é o tempo de a música acabar de verdade;
4. a cortina fecha um pouco;
5. o **acorde final** soa com todas as camadas juntas, confete de papel recortado
   cai, e os programas se curvam em fila;
6. a bolinha da fase acende no HUD;
7. a **fita da fase** sobe, e a criança segue no `Continuar`.

> **Não existe "toque para reger" no fim.** A primeira versão pedia um toque para
> dar a batida final depois de a música já ter acabado — um gesto sem função, no
> momento em que não havia mais nada para reger. O acorde entra sozinho, junto
> com a reverência.

### A fita: quem tocou, e quando

Uma tirinha curta com **uma faixa por programa**, em faixas de papel coloridas
lado a lado, como um rolo de pianola. Sem segundos, sem porcentagem, sem "a
Musiquinha esperou 12 s".

Três coisas fazem a fita ser legível — e sem elas ela era só duas barras
pontilhadas que a criança tentava decifrar:

- **a carinha de quem tocou abre cada faixa**, tirada da própria folha de arte;
- **o título diz o que se está vendo**: `QUEM TOCOU, E QUANDO`;
- **uma frase lê o desenho em voz alta**, que é a única parte que ela precisa
  mesmo entender: *"Teve hora em que os dois tocaram juntos!"* ou *"Cada um tocou
  na sua vez."*

---

## 14. O experimento das FÉRIAS

É a única peça do jogo que não serve para ganhar: serve para **provar**. E,
sendo o botão que toda criança vai apertar primeiro, tem que ser **engraçado**.

| Campo | Decisão |
|---|---|
| quando existe | do **Nível 2** em diante, uma vez por fase |
| o que faz | 3 s em que **ninguém obedece** |
| o que custa | **nada** — nem vida, nem estrela, nem progresso; o palco volta exatamente como estava |
| como acaba | sozinho, com a batuta voltando e meio segundo de silêncio antes de a música retomar |
| onde é explicado | no painel do `?` do **Nível 3**, como experimento |

O que acontece nos três segundos, e cada coisa é uma piada visual:

- **todos os balões sobem ao mesmo tempo** e se empilham, um por cima do outro,
  até não caber mais;
- **as peças pulam do atril** e ficam girando no ar, sem ir para ninguém;
- **a música desafina**: as camadas tocam todas ao mesmo tempo, fora do
  compasso, e o metrônomo enlouquece;
- **nenhuma nota acende** em partitura nenhuma;
- um balão grande no meio da tela: *"Sem maestro, todo mundo pede e ninguém
  toca!"*

**Ele não pode ser obrigatório.** Uma criança que nunca apertar o botão termina o
jogo igual; quem apertar leva a única imagem do jogo em que o sistema operacional
aparece **pela falta dele** — e vai querer mostrar para alguém. É o argumento da
habilidade em três segundos, e ele tem que ser gratuito para ser honesto.

---

## 15. A abertura, e o `?`

**A criança precisa de três coisas antes de tocar em qualquer lugar:** que o
palco é um computador, que os bonecos são os programas, e que **sem peça
ninguém toca**. Nada disso cabe num painel de texto — então o palco acende, os
programas **entram andando**, os balões sobem, a música não vem, e só aí ela vê
a primeira entrega acontecer de verdade.

| Tempo | O que acontece | A legenda |
|---:|---|---|
| # | O que acontece | A legenda | Espera |
|---:|---|---|---|
| 1 | palco apagado, a câmera afastando devagar | *"Dentro do computador tem uma orquestra."* | **Continuar** |
| 2 | os cinco refletores acendem um a um, a câmera varre | — | 1,5 s |
| 3 | o atril sobe, e a câmera desce com ele | — | 1,0 s |
| 4 | **os programas entram andando** pelas laterais, aos pulinhos, com a câmera acompanhando | *"Estes são os programas."* | **Continuar** |
| 5 | os balões sobem, com o desenho da peça | *"Cada um pede uma peça para tocar."* | **Continuar** |
| 6 | a câmera desce ao atril (zoom 1,45) e as peças piscam uma a uma | *"Só existe uma peça de cada."* | **Continuar** |
| 7 | abre; os programas **murcham** e nada toca | *"Sem peça, ninguém toca."* | **Continuar** |
| 8 | a batuta aparece grande no meio do palco | *"Quem dá a vez é você, o maestro."* | **Continuar** |
| 9 | fecha no primeiro; **anel de toque**, duas vezes | *"Toque no programa!"* | **Dar a vez** |
| 10 | a entrega de verdade: batuta, a peça voando (zoom 1,26) | — | 1,6 s |
| 11 | dois compassos correm: notas acendendo e a música entrando | *"Pronto: ele está tocando!"* | **Continuar** |
| 12 | abre para o palco inteiro | *"Agora é com você."* | **Vamos!** |

**Quem manda no tempo de leitura é a criança.** Nenhuma frase sai da tela por
conta do relógio: o botão aparece **depois** de a animação daquele tempo
acontecer, e espera o toque. Os tempos sem legenda — as luzes, o atril subindo,
a entrega — continuam no relógio, porque ali não há nada para ler.

**A legenda mora embaixo, não em cima.** O balão do pedido ocupa de `y = 108` a
`y = 232`, exatamente onde a legenda estava: a frase dizia *"cada um pede uma
peça"* enquanto escondia os pedidos. O par legenda + botão passou para
`y = 580` e `y = 668`, sobre a faixa do atril. Os dois únicos tempos que usam o
lugar de cima são o **primeiro** (palco escuro, não há o que tapar) e o do
**atril**, que é o único em que a faixa de baixo é o assunto — e ali a legenda só
entra depois de a câmera terminar de descer.

**E cada toque tem um alvo.** O botão grande, embaixo da legenda, adianta uma
frase; o pequeno do canto de baixo à direita (`pular ▸`) sai da abertura. A
versão anterior usava "toque em qualquer lugar" para pular, o que deixou de
fazer sentido no instante em que existiu um botão de avançar.

Dois tempos carregam sozinhos o porquê do jogo, e são os dois que faltavam na
primeira versão:

- **"Só existe uma peça de cada" (13,1 s)** — é o fato que faz o jogo existir.
  Sem escassez não há fila, não há espera e não há nada para gerenciar; a
  abertura falava das peças sem nunca dizer que elas eram poucas.
- **"Quem dá a vez é você, o maestro" (19,0 s)** — o jogo se chama Maestro do
  Sistema e nunca dizia à criança que o maestro era ela. A batuta entra em cena
  nesse tempo, grande, antes de qualquer pedido de toque.

O resto é visual: onze tempos, nove legendas curtas, e três deles sem texto
nenhum.

**A abertura abre o nível, toda vez.** Não existe "já viu, não mostra mais": ela
é a cena de abertura do jogo, e quem já sabe sai dela pelo `pular ▸`, que aparece
no canto 1,2 s depois do começo — nem antes, senão o clique que abriu o jogo
pularia tudo.

Pular não deixa o mundo pela metade: `close()` põe os programas no lugar,
levanta os balões que faltarem, faz a primeira entrega e corta a câmera para o
plano aberto. O compasso fica parado o tempo todo — menos nos dois compassos que
a própria abertura manda rodar, para a música começar na frente dela.

**Nenhum dedo desenhado.** O que marca onde tocar é um **anel** que expande e
some, duas vezes, em cima do programa.

**Duas câmeras, separadas pela profundidade** (`>= DEPTH.hud` é interface): o
palco aproxima, e HUD, vidas, legenda, tutorial e fim de nível ficam parados.
Fora do exemplo o zoom é sempre 1 — e é por isso que o toque nos programas, que
moram na câmera de baixo, nunca sai do lugar.

### O `?` repete a abertura

Não há painel de passos: **o `?` roda a abertura de novo**. A explicação deste
jogo é a cena — o palco acendendo, os programas entrando, o silêncio sem peça —,
e um holofote com duas frases era justamente o que não explicava nada.

Como a abertura mexe no mundo (ela levanta os balões e faz a primeira entrega),
repetir significa **recomeçar a música da vez**: `startFase(faseIndex, true)`.
São uns vinte segundos, é o preço certo por uma criança que se perdeu, e é a
única forma de a explicação continuar sendo a mesma que ela viu na primeira vez.

**Nada fica guardado entre partidas.** A abertura roda sempre que o nível
começa, e o `?` a chama de novo a qualquer momento — o jogo não grava nada em
`localStorage`.

Nos níveis 2 e 3 a abertura ganha a cena nova da vez: a fila, e o travado com o
X.

---

## 16. Antes da arte existir

O jogo tem que abrir e ser jogável do começo ao fim com **zero PNG**:

- programa = retângulo arredondado na cor dele, com dois olhinhos e uma boca, e
  o corpo mudando de altura e de inclinação por estado;
- balão = bolha com o pictograma da peça em `Graphics`, cheia (aceso) ou vazada
  e acinzentada (cinza);
- peça = cartão com o pictograma em `Graphics` (quadrado, círculo, retângulo
  largo, retângulo alto);
- partitura = pauta de cinco riscos com as bolinhas das notas;
- palco = degradê quente com uma cortina em bloco e o assoalho em faixas.

**A música não é placeholder.** As camadas do §5 nascem em WebAudio, junto com o
resto do jogo, e não dependem de arquivo nenhum — elas são o placar.

Texturas por `import.meta.glob` com lista `WANTED` no `BootScene` — nunca
`import` estático, que derruba o `vite build` por um arquivo ausente.

**Ordem de produção:** (1) palco, cadeiras, compasso correndo e a partitura
acendendo; (2) `fases.ts` **só com o Nível 1**, para avaliação — e avisar; (3)
atril, peça saindo e voltando, aro de uso, e o balão aceso/cinza; (4) as camadas
de música; (5) fila, o mundo prendendo a respiração e a regra da vez; (6)
travamento, X e as duas TRAVAS; (7) HUD, balões e tutorial; (8) showzinho e fita
da fase; (9) FÉRIAS; (10) níveis 2 e 3; (11) texturas, medindo a caixa alfa antes
de ancorar o layout.

---

## 17. Arquitetura

~~~text
src/games/EF05CO07/maestro-do-sistema/
├── PLANEJAMENTO.md · TEXTURAS.md
├── index.ts            1280 × 720, FIT + CENTER_BOTH, [Boot, Tutorial, Game]
├── types.ts            Piece, ProgramState, Ask, Slot, Verdict, FaseDef, Phase
├── data/
│   ├── layout.ts       as coordenadas do §8, com o porquê dos números
│   ├── theme.ts        cores, fontes, tamanhos
│   ├── cast.ts         os programas, as peças e as camadas de música
│   └── fases.ts        FASES + as funções do §10 + as validações
└── scenes/
    ├── BootScene.ts    import.meta.glob + createLoadingScreen + faseInicial
    ├── GameScene.ts    orquestra e não desenha nada; o tutorial é o da casa
    ├── stage.ts        o palco, as cadeiras e o refletor que abre
    ├── program.ts      um programa: balão, partitura, estados, reações e X
    ├── desk.ts         o atril: as peças, o aro de uso, a peça voando
    ├── queue.ts        a faixa ESPERANDO
    ├── baton.ts        a batuta, o arco e a batida final
    ├── encore.ts       o showzinho e a fita da fase
    ├── hud.ts          a missão, as bolinhas de fase e o `?`
    └── audio.ts        WebAudio direto — as camadas que somam
~~~

**A `GameScene` não desenha.** Todo `createX` devolve
`{ container, ...métodos, destroy() }`. Identificadores em inglês, quase nenhum
comentário; só o texto que a criança lê fica em português.

~~~ts
type Phase = 'intro' | 'running' | 'hold' | 'locked' | 'ferias' | 'encore' | 'done'
~~~

`hold` é o mundo prendendo a respiração (§6): o compasso para, a música sustenta
e o toque continua ligado. Não é `locked` — ali não houve erro nenhum.

Cuidados que já custaram caro neste projeto, e que este jogo encosta em quase
todos:

- **congelar com flag**, nunca `scene.pause()` — o `?`, a TRAVA, o `hold` e as
  FÉRIAS usam a mesma;
- **o compasso é um relógio próprio**, somado em `update(_t, delta)` e ignorado
  enquanto a flag está ligada: assim é impossível a música andar durante o
  tutorial, a TRAVA, o `hold` ou o showzinho;
- **`gen` protegendo todo `await`** — uma TRAVA no meio de uma entrega precisa
  matar a sequência anterior na hora;
- **zona de toque é objeto solto da cena**, criada na posição definitiva e
  destruída na mão; o X nasce e morre a cada toque;
- `setVisible(false)` **não** desliga toque: o interruptor é
  `zone.input.enabled = false`;
- **o saldo de vidas atravessa o `scene.restart`** (`lives: this.livesLeft`);
- **`scene.bringToTop('TutorialScene')`** ao reabrir pelo `?` — cena pausada
  continua renderizando, e sem isso o tutorial reabre invisível.

Reusar sem reimplementar: `createLoadingScreen`, `faseInicial`, `vidasIniciais`,
`createLives`, `createTutorial`, `showLevelComplete`, `FX`, `formatTime`,
`runtimeGameBridge`. `FASES` mora **só** em `data/fases.ts`.

### A conversa com a plataforma

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, com a primeira fase montada |
| `CORRECT_ANSWER` | a cada entrega certa e a cada travado encerrado certo |
| `WRONG_ANSWER` | no primeiro erro de cada fase — **nunca na fase guiada** |
| `CHECKPOINT` | a cada fase, `progress: Math.round(feitas / total * 100)` |
| `GAME_COMPLETED` | ao fim de **cada** nível, `stage: this.level.level`, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca à mão — é do `createLives` |

`stage` é o **nível**, de 1 a 3, nunca índice de array. Importar
`runtimeGameBridge`, nunca `gameBridge`. Nada de `isFinalStage` no jogo.

---

## 18. Registro

| Onde | O que |
|---|---|
| `src/data/catalog.ts` | id **`081`**, slug `maestro-do-sistema`, module `EF05CO07/maestro-do-sistema`, skill `EF05CO07`, `years: [5]`, `order: 375`, `status: "draft"`, `points: 90`, categoria `"Mundo Digital"`, ícone 🎼, tags `["sistema operacional", "hardware", "processos", "fila"]` |
| `src/data/gameInstructions.ts` | três linhas novas, sob a chave `maestro-do-sistema` |
| `src/pages/GameDetailsPage.tsx` | acrescentar `maestro-do-sistema` ao `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` |
| `src/assets/games/EF05CO07/maestro-do-sistema/` | criar — ver [TEXTURAS.md](./TEXTURAS.md) |
| `public/og/maestro-do-sistema.jpg` | 1200 × 630, até 300 KB, gerada a partir da capa — **a pasta é versionada; o build só copia** |

> Conferir o `NEXT_FREE_ID` **na hora de registrar**: ele já esteve desatualizado
> neste projeto e um id repetido derruba a página inteira com
> `[catalog] id duplicado`. Hoje a constante diz `081`; se ela continuar certa, o
> jogo fica com o `081` e ela vai para `082`.

Descrição: *"O computador é uma orquestra e você é o maestro: toque no programa
aceso, respeite a fila e encerre quem travou — quanto melhor você reger, mais
cheia a orquestra soa."*

As três linhas de instrução:

1. "Cada programa levanta um balão: aceso quer dizer que a peça dele está livre."
2. "Toque no balão aceso e ele começa a tocar — a peça volta sozinha quando ele termina."
3. "Se dois acenderem querendo a mesma peça, toca quem chegou antes; e quem travar segura a peça até você encerrar."

---

## 19. Critérios de aceite

### A criança entende sozinha

- [ ] a missão está escrita na tela **o tempo todo**, e diz o que fazer sem citar nenhuma peça do jogo;
- [ ] **dá para jogar a fase inteira sem olhar para o atril** — o balão aceso basta;
- [ ] dá para saber, sem ler, **quem pode tocar, quem está tocando, quem espera e quem travou**;
- [ ] aceso e cinza se distinguem **sem depender da cor** (o cinza é vazado e menor);
- [ ] as peças se distinguem pelo **formato do cartão**, não só pelo pictograma;
- [ ] o travamento é percebido **sem ninguém avisar por escrito**;
- [ ] com um só tocando a música soa magra, e com três soa cheia — a diferença é óbvia de ouvido;
- [ ] quem pula o tutorial toca num programa antes de 8 segundos;
- [ ] nenhum balão passa de 5 palavras, e nenhuma frase de TRAVA passa de 8;
- [ ] tocar num programa que espera **nunca** parece punição.

### O jogo funciona

- [ ] `npx tsc --noEmit` limpo;
- [ ] `npx eslint src/games/EF05CO07/maestro-do-sistema --ext .ts` limpo;
- [ ] `?embed=1&inline=1&stage=1&points=0&lives=3`, três níveis jogados, um `GAME_COMPLETED` por nível no console;
- [ ] `faseInicial(this, 1)` — nenhum nível fixo esquecido no código;
- [ ] **no Nível 1 é impossível perder vida** — não há disputa e não há X;
- [ ] as duas TRAVAS foram **vistas acontecendo**, não só lidas;
- [ ] o `hold` dispara em **toda** disputa e em nenhuma situação sem disputa;
- [ ] o balão sai de `canPlayNow`, e não de lógica própria do desenho;
- [ ] as validações de `fases.ts` falham alto quando uma fase não termina, quando existe beco sem saída ou quando um travamento não segura peça;
- [ ] o compasso **para** durante tutorial, TRAVA, `hold`, `?`, FÉRIAS e showzinho;
- [ ] as FÉRIAS devolvem o palco exatamente como estava, e não custam nada;
- [ ] mudo funciona — **e com o som desligado o jogo continua jogável** (a música é prêmio, não informação necessária);
- [ ] o `?` congela e reabre por cima; a retomada não dá salto;
- [ ] nenhum número de ponto, acerto ou erro na tela;
- [ ] nenhum gancho de depuração sobrando (`window.__algo`);
- [ ] nenhum comentário longo no código — a explicação mora aqui.

---

## 20. O que ficou para decidir

1. **A mãozinha do dono.** De vez em quando o balão de um programa ganharia uma
   mãozinha: *a pessoa que está usando o computador clicou nesse agora*, e ele
   passa na frente da fila. É verdade — é assim que o sistema operacional
   prioriza o programa em primeiro plano —, e seria a reviravolta do Nível 3. Mas
   mexe na regra "quem chegou antes", que a criança acabou de aprender. **Fica
   fora da primeira versão**, e entra só se o Nível 3 se mostrar morno.
2. **O tamanho do compasso.** 1,4 s é o palpite: rápido o bastante para a música
   parecer viva, lento o bastante para a nota acendendo ser vista. Se na tela
   ficar afobado, alongar o compasso antes de encurtar as partituras.
3. **A orquestra cheia e as estrelas.** Hoje ela não conta (§5), de propósito: se
   contasse, viraria cobrança e o jogo perderia a calma. Se na prática a criança
   ignorar a música e tocar de um em um o tempo todo, a terceira estrela pode
   passar a pedir "pelo menos uma vez dois tocando juntos" — o mínimo que prova
   que ela percebeu.
4. **O X em quem está tocando.** Hoje ele existe do Nível 3 em diante, e encerrar
   quem está bem custa uma vida. Se na prática a criança fizer isso por
   curiosidade e se sentir castigada, a primeira vez do nível vira aviso sem
   custo, e a segunda cobra.
5. **A quarta cadeira.** O convidado do Nível 3 entra em `x = 1140` com as outras
   recuando. Se o palco ficar apertado no celular, o convidado **ocupa** uma
   cadeira vazia em vez de acrescentar uma quarta posição.
6. **As camadas somando.** Duas camadas tocando juntas precisam soar bem em
   qualquer combinação — se não soarem, elas viram a mesma base com timbres
   diferentes por programa, e a harmonia passa a ser o timbre, não a melodia.

---

## 21. O que mudou na construção do Nível 1

O Nível 1 foi construído sozinho, para avaliação. O que a tela ensinou:

**1. O tutorial de painéis não explicava o jogo — mostrava peças soltas.**
Quatro passos com holofote diziam *o que é cada coisa*, e a criança continuava
sem saber *o que fazer*. A primeira troca foi um exemplo animado de oito
segundos; **ainda era rápido demais para acompanhar, e não dizia para que serve
o jogo**. Virou a **abertura do §15**: vinte e quatro segundos, o palco
acendendo, os programas entrando andando e — o beat que faltava — **o silêncio
com todo mundo murcho, sem peça**. O `createTutorial` ficou só no `?`, com duas
frases.

**0c. A peça voltava enquanto o programa ainda estava tocando.** O `release`
mandava a peça de volta ao atril no mesmo instante em que a última nota acendia,
com a reverência acontecendo depois. A ordem agora é a da vida: a nota soa, ele
se curva, e só então devolve. E o `send` passou a partir **sempre do encaixe**,
porque nos níveis com fila a peça pode ainda estar voltando de uma entrega
anterior quando a criança dá a vez para o próximo.

**0b. A peça voltava MAIOR do que saiu.** O sprite nasce de `setDisplaySize`,
então o `scale` dele não é 1 — é o que couber na célula. Os tweens do atril
vinham da época do `Graphics` e animavam para `scale: 1`, devolvendo a peça ao
tamanho cheio da folha. Cada peça agora guarda a sua escala de repouso e todo
tween é relativo a ela.

**0a. A fase acabava com corte seco.** `faseDone` fica verdadeiro no instante em
que a **última nota acende**, e a cortina do showzinho entrava por cima do
programa ainda se curvando e da peça ainda voltando ao atril. Entrou uma pausa
de **1,9 s** no topo do `finishFase`, e as partituras passaram a ficar douradas
no compasso em que o programa termina — e não lá no fim, durante a reverência.
São os dois segundos em que a música acaba, antes de a cortina se mexer.

**0. A folha `pecas.png` chegou e ficou uma hora sem ser usada.** O `BootScene`
carregava a folha, mas o atril e o balão continuavam chamando `drawPiece` — o
placeholder de `Graphics`. Só a batuta (`icones.png`) tinha sido ligada. Entrou
`makePiece()`, que devolve o recorte de papel quando a folha existe e o desenho
em `Graphics` quando não existe, e agora os dois lugares usam a mesma peça.
A âncora passou a ser o centro da caixa alfa de cada quadro, e isso escondeu o
defeito de verdade da folha (ver **0b**).

**0b. A tela saía cortada e torta no atril.** O monitor da folha entregue tinha
260 px de largura numa célula de 256 e ia de x 526 a 785: o quadro 2 cortava a
moldura direita, e o pé ficava fora do meio do que sobrava. Os 15 px que
vazavam caíam na borda esquerda do quadro 3 — era isso, e não a memória
"encostada à esquerda", que puxava a caixa alfa dela para o lado. A folha foi
reempacotada: cada peça inteira, centrada na própria célula, e só o monitor
reduzido (0,93) para caber. Com todo centro no meio da célula, a tabela de
âncoras saiu e o sprite usa a origem padrão. O contrato em `TEXTURAS.md` agora
exige a peça inteira dentro da célula, com margem.

**1a. A abertura longa nasceu com a câmera parada, e isso parecia bug.** Medindo
o zoom e o `scrollX` quadro a quadro, os **nove primeiros segundos** não tinham
movimento nenhum de câmera: um cartaz com texto, e depois os bonecos entrando
num plano geral fixo — de longe e pequenos. A regra que saiu daí: **todo tempo
da abertura tem um movimento**, nem que seja um afastamento lento por baixo da
legenda. Hoje a câmera afasta na frase de abertura, varre o palco junto com os
refletores acendendo, desce com o atril, **acompanha cada programa entrando**,
fecha nos balões, desce ao atril, abre no silêncio e fecha de novo no toque.

**1c. O "pular" matava a abertura antes de ela começar.** A zona de pular cobre
a tela inteira e estava armada desde o primeiro frame — só que o jogo abre logo
depois de um clique no **INICIAR** da plataforma. Um clique a mais, ou o segundo
de um duplo, pulava os vinte e quatro segundos inteiros. A zona passou a armar
**1,5 s depois** (`input.enabled = false` até um `delayedCall`).

**1c-bis. A abertura não guarda "já vista", e isso foi um erro corrigido.** Eu
tinha pendurado ela no `markTutorialSeen`/`wasTutorialSeen` da casa por analogia
com o `createTutorial` — decisão minha, que não estava em plano nenhum. O efeito
foi péssimo: depois da primeira vez a abertura sumia para sempre naquele
navegador, e voltar a vê-la exigia apagar uma chave de `localStorage` na mão.
**A abertura agora roda toda vez que o nível começa**, e quem já sabe sai dela
com um toque — que é o que o botão de pular existe para fazer.

**1d. A entrega da abertura não pontua.** Quem faz aquela jogada é o jogo, não a
criança — `deliver(id, demo = true)` não soma ponto nem emite `CORRECT_ANSWER`.
Antes a plataforma mostrava um "+5 pontos" por uma jogada que ninguém fez.

**1b. Andar precisou de um jeito de andar.** A folha tem quatro quadros e
nenhum é de caminhada. O `walkIn` usa o quadro de braços erguidos e move o
boneco com **pulinhos** (um tween de `y` em yoyo) e uma inclinação alternando
para o lado da entrada — lê como "entrando em cena" sem quadro novo. A partitura
some enquanto ele anda e volta quando ele pisa na cadeira, senão ela fica
sozinha na cadeira vazia.

O quadro tem que ser **forçado** para o de braços erguidos durante a caminhada.
Deixar o `frameFor(state)` decidir dava o quadro de descanso — que é murcho, de
ombros caídos e cara triste —, e um boneco murcho atravessando o palco parece
cansado, não animado. O quadro certo volta a valer no instante em que ele pisa
na cadeira.

**2. Peça no atril sem dono é enfeite para decifrar.** A `tela` estava no atril
das três fases e ninguém a pedia antes da fase 3. Saiu: as fases 1 e 2 têm
**duas peças**, e a terceira chega na fase 3, junto com o programa que vai
querer ela.

**3. Duas câmeras, e o zoom só existe no exemplo.** O corte é `DEPTH.hud`. Fora
do exemplo a câmera volta com `cutWide()` — corte seco, não tween —, porque o
Phaser resolve o toque pela câmera de cima, e um zoom sobrando na de baixo
deslocaria o alvo dos programas.

**4. A folha de arte pede âncora por quadro.** Os quatro estados do mesmo
programa têm alturas diferentes de propósito (`esperando` é mais baixo,
`travado` é torto). A base do alfa foi medida quadro a quadro e mora em
`data/cast.ts` (`FOOT`); sem isso o boneco pula ao mudar de estado.

**5. Medidas que a tela corrigiu.** O boneco subiu de 210 para **250** na
célula, os pés desceram para `y = 470`, o balão foi para `-300` e o atril passou
a terminar em `H - 12` — ele estava desenhado até `y = 748` e vazava pela borda
de baixo.

**6. O `Phase` ganhou `demo`.** O compasso só anda em `running`; `demo`, `hold`,
`locked` e `encore` congelam o mundo com a mesma flag.

### O que a partida provou no navegador

- o ciclo inteiro roda: pede → recebe → toca (nota por compasso) → devolve;
- duas camadas de música soando juntas quando os dois tocam ao mesmo tempo, com
  o refletor abrindo;
- o aro da peça em uso esvaziando no atril e a peça voltando voando;
- o showzinho: cortina, batuta na mão da criança, acorde, confete, e a **fita**
  mostrando quem tocou quando — nela dá para ver, sem número nenhum, se a
  orquestra ficou cheia ou se tocou de um em um;
- `GAME_COMPLETED` ao fim do nível, com o painel da casa;
- `npx tsc --noEmit` e `npx eslint` limpos na pasta.

### O que fica esperando os níveis 2 e 3

`LEVELS` tem **só o Nível 1**, então `totalStages` é 1 e o HUD mostra um traço
só. A fila (`queue.ts`), o X de encerrar, o travamento e o botão FÉRIAS ainda
não existem na tela — mas as regras deles já estão em `data/fases.ts`
(`queueHead`, `mustHold`, `judgeServe`, `judgeClose`) e as validações já cobrem
beco sem saída e travamento sem peça.
