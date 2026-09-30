# Robô Sorrateiro — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO04 · 5º ano · Pensamento Computacional · Algoritmos com seleção condicional**

> **Correções ao briefing, antes de tudo.** O plano já segue com as trocas, para
> quem leu o briefing poder discordar com o documento na mão.
>
> 1. **A carta deixou de ser uma escolha de ramo e virou uma REGRA.** No
>    briefing, a carta escolhida decide *aquele* trecho e acabou. Aqui ela fica
>    valendo **a cada passo do trecho**, e a coruja acorda e dorme **enquanto o
>    robô anda** — então a mesma carta dispara o **ENTÃO** num passo e o
>    **SENÃO** no passo seguinte, na mesma travessia. É isso que faz a criança
>    ver a seleção condicional *acontecendo*, e não só ser escolhida.
> 2. **Duas cartas viram três, e a terceira não é boba.** Escolher entre a carta
>    certa e a invertida é cara ou coroa com uma opção obviamente ridícula. Entra
>    a carta **"esconder sempre"** — que para uma criança de 10 anos parece a
>    mais segura do mundo, e falha de um jeito novo: **o robô nunca chega**. É
>    ela que ensina que o SENÃO existe.
> 3. **Nada de "+15" na tela.** Número de ponto é proibido pelo INSTRUCOES: o que
>    a criança vê é o trecho vencido, a placa apagando e a bolinha da sala.

---

## 1. A história, e o jogo em três regras

**A biblioteca fechou e o robô precisa chegar à porta dos fundos.** As corujas
são as guardiãs: quando uma está acordada e vê o robô andando, ela pia e manda
ele de volta. O robô não tem medo — ele só **não sabe o que fazer quando a coruja
acorda**. Quem ensina é a criança, e ensina uma vez por trecho.

Essa frase fica **escrita no alto da tela o tempo inteiro**:

> **Leve o robô até a porta sem ser visto.**

As três regras do jogo, e não há uma quarta do primeiro ao último nível:

1. **O robô anda sozinho.** A criança nunca o controla com o dedo.
2. **Numa placa `SE?` o tempo para e ela ARMA uma carta** — e a carta vale
   para o trecho seguinte inteiro.
3. **A cada passo a carta decide, e a linha que decidiu ACENDE.**

~~~text
┌────────────────────────────────────────────────────────────────────────┐
│ ♥♥♥      Leve o robô até a porta sem ser visto.          ●●○      (?)  │
├────────────────────────────────────────────────────────────────────────┤
│                   ◜◝ o círculo de tempo                                │
│                  ╭────╮ zzz                          ╭──────────────╮  │
│                  │ 🦉 │                              │ Cuidado! Ela │  │
│                  ╰────╯                              │ vai acordar. │  │
│                                                      ╰───────╮╭─────╯  │
│   🤖 [SE?] ▨ · · · · ▨ · · · · · · · · · · · ▯ PORTA        │ MEL     │
│   robô placa                                                 (de perfil)│
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐   ┌──────────────────────────┐           │
│  │ SE    🦉◉ →  📦 ESCONDER │   │ SE    🦉◉ →  🤖 ANDAR    │           │
│  │ SENÃO 🦉z →  🤖 ANDAR    │   │ SENÃO 🦉z →  📦 ESCONDER │           │
│  └──────────────────────────┘   └──────────────────────────┘           │
└────────────────────────────────────────────────────────────────────────┘
~~~

Quando as cartas sobem, a **câmera fecha na coruja e no robô** e a Mel avisa o
que a guardiã está para fazer. As cartas ficam paradas no rodapé — as duas do
Nível 1 são a certa e a invertida:

~~~text
┌──────────────────────────┐  ┌──────────────────────────┐
│ SE    🦉◉ →  📦 ESCONDER │  │ SE    🦉◉ →  🤖 ANDAR    │
│ SENÃO 🦉z →  🤖 ANDAR    │  │ SENÃO 🦉z →  📦 ESCONDER │
└──────────────────────────┘  └──────────────────────────┘
          a certa                     a invertida
~~~

---

## 2. A habilidade, e o teste que ela precisa passar

> **(EF05CO04)** **Criar e simular** algoritmos representados em linguagem oral,
> escrita ou pictográfica, que incluam **sequências, repetições e seleções
> condicionais** para resolver problemas de forma independente e em colaboração.
>
> Objeto: **Algoritmos com seleção condicional.**

| O que a habilidade pede | Onde está na mecânica |
|---|---|
| **seleção condicional** | a carta É um `SE … ENTÃO … SENÃO …` inteiro, com os dois ramos escritos e desenhados |
| **criar** | a criança arma a carta do trecho **antes de saber** em que estado a coruja vai estar |
| **simular** | o robô executa na frente dela, passo a passo, e **o ramo que disparou acende no instante em que dispara** |
| **repetição** | a mesma carta é lida de novo **a cada passo** do trecho, e pisca junto com o passo |
| **sequência** | a sala é uma fila de trechos, e cada um roda depois do anterior |
| **resolver problema** | chegar à porta sem ser visto — com a coruja acordando na hora que ela quiser |

### O teste da bolinha

> Troque as corujas por bolinhas que mudam de cor sozinhas. O jogo muda?

**Não muda — e é esse o ponto.** Em EF05CO04 o conteúdo é a estrutura `SE /
SENÃO`, não a coruja; a coruja é o que dá **motivo** para a condição existir. O
que o teste precisa provar aqui é outra coisa: **que a criança não consegue
passar sem entender os dois ramos.** Três coisas garantem isso:

1. **A condição muda durante a travessia.** A coruja acorda e dorme enquanto o
   robô anda, então a carta dispara ENTÃO e SENÃO na **mesma** ida. Não existe
   "a resposta desta sala" para decorar — existe uma regra que se comporta bem
   nos dois estados.
2. **As três cartas falham de jeitos diferentes.** A invertida é **vista**; a
   "esconder sempre" **nunca chega**. Só a certa atravessa — e as duas falhas
   mostram, cada uma, metade da estrutura.
3. **O sorteio é por travessia.** O momento em que a coruja acorda muda a cada
   tentativa, então repetir a mesma tentativa não produz o mesmo filme.

### O que mudou em relação ao briefing

| Briefing | Aqui | Por quê |
|---|---|---|
| a carta decide o trecho uma vez | a carta é uma **regra por passo**, com `REPITA` escrito | é o que faz os dois ramos aparecerem na mesma travessia |
| 2 cartas (certa × invertida) | **3 cartas** a partir do Nível 2 | duas opções em que uma é ridícula é cara ou coroa |
| "+15" por trecho | trecho vencido, placa apagando, bolinha de sala | INSTRUCOES: nenhum número de ponto na tela |
| replay duplo no Nível 3 | **cortado** | o insight já acontece a cada travessia, e a sala desenhada duas vezes em meia tela não se lê num celular |
| rota dupla no Nível 3 | **cortada** | era uma quarta ideia (a carta mudando o caminho, e não a ação) no nível em que a criança deveria estar consolidando a primeira |

---

## 3. Como isso não vira o jogo irmão

`EF05CO04` já tem **Cidade das Decisões** publicado (`id 034`, `order 340`), e
há dois vizinhos que encostam no assunto. A tabela existe para o jogo não sair
parecido — o conceito da habilidade é o mesmo de propósito.

| Vizinho | Diferença obrigatória deste jogo |
|---|---|
| **Cidade das Decisões** (EF05CO04) | Lá a criança **monta o programa em blocos** e aperta RODAR, com o mundo sorteado antes e parado durante a execução. Aqui ela **arma uma regra pronta** e a condição **muda no meio da execução** — o mesmo SE dispara os dois ramos numa travessia só |
| **Corra Enquanto** (EF03CO02) | Lá a ficha é `ENQUANTO/ATÉ` com **uma** ação: o laço liga e desliga. Aqui a carta tem **dois ramos**, e o que se aprende é que o SENÃO também precisa estar certo |
| **Circuito da Verdade** (EF15CO03) | Lá a condição é composta (`E`, `OU`, `NÃO`). Aqui a condição é **uma só e simples** — o difícil não é a pergunta, é **o que fazer em cada resposta** |

---

## 4. A carta, e por que ela é uma REGRA

A carta é **uma tabela de dois casos**, e é a peça central do jogo:

~~~text
┌────────────────────────────────────┐
│  SE     🦉(acordada) →  📦 ESCONDER │  ← acende quando dispara
│  SENÃO  🦉(dormindo) →  🤖 ANDAR    │  ← acende quando dispara
└────────────────────────────────────┘
~~~

Quatro decisões de leitura, todas para a criança entender **sem ler muito**:

1. **O desenho vem antes da palavra.** Cada linha é coruja, seta e o que o robô
   faz. Quem não quiser ler entende pelos três desenhos.
2. **`SE` e `SENÃO` são rótulos pequenos, não frases.** É o nome do que ela
   está vendo — a palavra que a professora vai usar —, e não o texto a decifrar.
3. **A linha que decidiu ACENDE**, no instante do passo. É o coração do jogo:
   a criança vê a decisão acontecendo.
4. **Depois de escolhida, a carta fica no canto de baixo**, valendo, com as
   linhas acendendo. Não existe painel de plano nenhum além dela: a regra que
   está valendo é a única coisa que precisa estar à vista.

**A repetição não tem selo.** Ela se vê: a mesma carta decide a cada passo, e
pisca junto com o passo. Um carimbo escrito `REPITA A CADA PASSO` é vocabulário
de adulto por cima de uma coisa que já está acontecendo na tela.

## 5. O laço

~~~text
o robô anda sozinho pelo trajeto pontilhado
      │
      ▼
chega numa PLACA "SE?" → o mundo para; o trecho seguinte ACENDE no chão
                          e as cartas sobem
      │
      ├─ toque numa carta → ela vai para o trilho, ARMADA
      ▼
o trecho roda, passo a passo (0,55 s por passo):
      a cada passo → a coruja está acordada?
            ├─ sim → dispara o ramo do SIM   (o ramo ACENDE na carta)
            └─ não → dispara o ramo do NÃO   (o outro ramo ACENDE)
      │
      ├─ andou com a coruja acordada    → ela VÊ, pia, e o robô volta à placa
      ├─ escondeu dois ciclos sem andar → ele NUNCA CHEGA: a carta volta
      └─ chegou ao fim do trecho        → próxima placa, ou a porta
      │
      ▼
porta → reprise do trilho: "ESTE FOI O SEU PLANO!" → próxima sala
~~~

**A criança não aperta esconder.** Quem esconde é a regra que ela armou — se o
dedo pudesse salvar o robô, o jogo viraria reflexo e a carta viraria enfeite.

---

## 6. O que a criança vê e faz, momento a momento

Esta tabela é o contrato de clareza do jogo: **em nenhuma linha dela a criança
fica sem saber o que fazer ou o que acabou de acontecer.** O robô fala em balão
curto, de três a cinco palavras, sempre preso à cabeça dele; a Mel só fala na
trava e no tutorial, para as duas vozes nunca disputarem a tela.

| Momento | O que está aceso | O balão do robô | O que é tocável |
|---|---|---|---|
| **a sala começa** | a porta pisca duas vezes e o trajeto se desenha do robô até ela | *"Preciso chegar ali."* | nada |
| **o robô anda** | o trecho em que ele está | — | só o `?` |
| **chega na placa** | o mundo para, **o trecho seguinte acende**, as cartas sobem | *"E se ela acordar?"* | as 2 ou 3 cartas |
| **carta armada** | ela voa para o trilho, o selo `REPITA` começa a pulsar | *"Meu plano vale aqui!"* | nada |
| **cada passo** | o ramo que disparou acende; o robô anda ou se esconde | — | nada |
| **visto** | cone sólido, moldura vermelha, a carta reabre com o ramo culpado esmaecido | *"Ela me viu!"* | só a carta certa |
| **parado** | o robô espia da caixa e dá de ombros; a carta reabre | *"Assim eu nunca chego."* | só a carta certa |
| **trecho vencido** | a placa apaga e a carta brilha no trilho | *"Deu certo!"* | nada |
| **fim da sala** | reprise do trilho, carta por carta | — | o botão de seguir |

Nada de arrastar, nada de dois botões com a mesma silhueta: **as cartas são
grandes, diferentes entre si já na segunda linha, e ficam lado a lado**.

---

## 7. A grade: 1280 × 720

`Phaser.Scale.FIT`, coordenada absoluta em `data/layout.ts`. Coluna do celular =
`× 0,30` (aparelho de 390 px). Abaixo de ~40 px reais não serve para dedo de
criança.

| Faixa | y | Conteúdo | Tamanho na grade | No celular |
|---|---:|---|---:|---:|
| HUD | 0–92 | vidas (x 44), **o selo do nível** (x 208), a missão (x 648), **SALAS** com as bolinhas (x 1112), `?` (x 1216) | selo 150 × 48 · missão 27 · bolinha 22 | 45 × 14 · 8 · 7 px |
| Sala | 96–596 | piso, trajeto pontilhado, poleiros, esconderijos, porta | coruja 150 · robô 120 · porta 130 | 45 · 36 · 39 px |
| Plano | 604–716 | o trilho das cartas armadas | ficha 150 × 104 | 45 × 31 px |

A missão ocupa o meio do HUD porque é a única frase que **nunca muda**: a
criança que volta ao jogo depois de dois dias lê ali o que precisa fazer, sem
depender de ter visto o tutorial.

**As cartas de decisão sobem por cima da sala**, que escurece — menos a faixa do
trecho que elas governam:

| Item | Tamanho na grade | No celular |
|---|---:|---:|
| carta (3 na tela) | 320 × 300, vão de 40 | 96 × 90 px |
| carta (2 na tela) | 360 × 320, vão de 60 | 108 × 96 px |
| linha de texto da carta | 30 px | 9 px |
| pictograma dentro da carta | 68 px | 20 px |
| balão do robô | altura 72, largura conforme o texto | 22 px |

Três cartas de 320 + dois vãos de 40 = **1040**, centradas nos 1280 — sobra
120 px de margem de cada lado. O alvo de toque é a carta inteira.

**O aro de tempo** de cada coruja tem raio 54 e fica **acima** dela (centro em
`y_poleiro − 96`), nunca por cima do trajeto: quem olha a coruja precisa ver ao
mesmo tempo quanto falta para ela acordar.

**Nenhum painel corta a área de jogo.** O trilho do plano começa em `y=604` e a
sala termina em `y=596`; o trajeto do robô mora entre `y=320` e `y=520`, longe
das duas bordas — e o balão do robô sobe para `y≈250`, onde não há coruja.

---

## 8. Níveis e salas

**Fase = uma sala.** Três salas por nível, e a sala cresce dentro do nível.

| Nível | A ideia | Salas × trechos | Passos | Cartas | Corujas |
|---|---|---|---|---|---|
| **1** | o SE decide sozinho | 3 × 1 | 2, 3, 4 | 2 | Ru, sempre |
| **2** | o SENÃO também precisa estar certo | 3 salas: 1, 1 e **2** trechos | 3, 4, 3+3 | **3** (entra a "esconder sempre") | Ru e Nina |
| **3** | a mesma regra, a sala grande | 3 × **2** | 3+4, 4+4, 4+4 | 3 | Ru, Nina e Zé |

**Uma coruja POR TRECHO, e todas na tela ao mesmo tempo.** A sala de dois
trechos mostra as duas guardiãs, cada uma com o seu círculo de tempo andando no
ritmo dela. Quem manda no passo é só a do trecho de agora — mas a criança já vê
que o trecho seguinte tem outra dona, e que o ritmo vai ser outro.

**O Nível 3 não traz mecânica nova.** É o mesmo SE, com dois trechos por sala e
o Zé, que troca de estado depressa. Consolidar vale mais do que inventar uma
quarta ideia no fim do jogo.

### O elenco (`data/cast.ts`)

| Coruja | Onde | Ciclo | Traço |
|---|---|---|---|
| **Ru** | poleiro da estante | lento | parda, peito listrado |
| **Nina** | lustre | médio | branca, cara de coração |
| **Zé** | pilha de livros | rápido, curto | laranja, tufos nas orelhas |

Só **duas** corujas aparecem por sala, mesmo no Nível 3: três aros de tempo na
tela ao mesmo tempo é mais coisa para acompanhar do que a decisão exige.

**O robô não tem nome.** Ele é redondo, tem uma antena com bolinha e uma rodinha no lugar dos pés — e é sempre "o robô", na tela e no texto.
**Mel** é a inventora que explica o jogo no tutorial (§12) e fala na trava.

### As cartas prontas

| Nível | Carta certa | Distratores |
|---|---|---|
| 1 | `SE acordada → esconder; SENÃO → andar` | invertida |
| 2 | idem | invertida · `SE acordada → esconder; SENÃO → esconder` |
| 3 | idem | os dois mesmos |

**A carta certa é sempre a mesma frase.** Isso não é preguiça: o que a criança
tem de aprender é que *aquela* regra funciona em qualquer sala, com qualquer
coruja, em qualquer momento do ciclo — e ela só descobre isso vendo a mesma
carta vencer condições diferentes. O que fica difícil é a sala, não a leitura.

Frase-síntese do fim do jogo: **"O SE deixa o plano esperto: ele decide sozinho
conforme o que acontecer!"**

---

## 9. As regras, em código

A regra é uma função, e o veredito sai do estado **no instante do passo** — não
de um gabarito guardado na carta.

~~~ts
type Act = 'andar' | 'esconder'

interface Card {
    id: string
    /** O que a condição pergunta. */
    asks: 'acordada' | 'dormindo'
    then: Act
    otherwise: Act
    line: string          // o que a criança lê
}

interface StepWorld {
    awake: boolean        // a coruja daquele trecho, NESTE passo
    atHideout: boolean    // há esconderijo ao alcance
}

type Outcome = 'andou' | 'escondeu' | 'visto' | 'parado'

function stepOutcome(card: Card, w: StepWorld, stuckFor: number): Outcome {
    const yes = card.asks === 'acordada' ? w.awake : !w.awake
    const act = yes ? card.then : card.otherwise

    if (act === 'andar') return w.awake ? 'visto' : 'andou'
    return stuckFor >= STUCK_LIMIT ? 'parado' : 'escondeu'
}

/** A sala está vencida quando o robô chega à porta sem ser visto. */
const solved = (state: Room) => state.at === state.door && !state.caught
~~~

`STUCK_LIMIT` é **dois ciclos completos da coruja daquele trecho**: é o tempo
que a criança precisa para ver com os próprios olhos que o robô se escondeu
quando dava para andar. Menos que isso parece bug; mais que isso é espera.

Duas validações rodam ao carregar `LEVELS` e falham alto no dev:

1. **toda sala tem pelo menos uma carta que resolve** — simular as cartas contra
   um ciclo de coruja e conferir que a certa chega à porta em qualquer fase do
   ciclo, e que cada distrator falha em pelo menos uma;
2. **todo trecho tem esconderijo ao alcance** — uma carta certa que não tem onde
   esconder transforma o plano certo em derrota, e é o pior defeito possível.

---

## 10. O erro, a TRAVA e as vidas

**Errar de dedo não existe aqui**: o único toque que responde é a escolha da
carta. O que existe são **dois erros de cabeça**, e eles são diferentes:

| Erro | O que se vê | O que a coruja/robô faz | A frase da Mel |
|---|---|---|---|
| **visto** | o robô andou com a coruja acordada | o cone acende, ela pia (sem susto), ele volta à placa | *"Ela estava acordada, e o plano mandou andar."* |
| **parado** | dois ciclos escondido sem andar | ele espia da caixa e dá de ombros | *"Ele se escondeu até quando dava para andar."* |

A TRAVA, passo a passo:

1. o mundo para; moldura vermelha curta, sem estrondo;
2. **a carta que falhou reaparece com o ramo culpado esmaecido** e o outro
   aceso — a explicação está na própria carta, não num balão à parte;
3. a frase diz **qual** ramo errou e **por quê**, nunca "tente de novo" e nunca
   a resposta;
4. o robô volta à placa anterior e as cartas reabrem;
5. **segundo erro no mesmo trecho:** a carta certa **pisca**.

Custo: `WRONG_ANSWER` e uma vida, **uma vez por trecho** — o segundo erro do
mesmo trecho não cobra de novo, e o contador zera ao trocar de trecho.

**A primeira sala do Nível 1 era guiada** e o erro não cobrava. Isso saiu em
30/09/2026: com a regra de um erro só, a carta errada encerra a partida em
todas as salas, inclusive na primeira. A TRAVA acima (carta reaberta, segunda
tentativa, carta certa piscando) também não existe mais — ser visto ou ficar
parado emite `WRONG_ANSWER` e encerra.

**Nenhum estado sem saída:** ser visto devolve o robô à placa com a carta
reaberta; ficar parado devolve também; a sala nunca fica impossível porque toda
carta certa tem esconderijo ao alcance (§9).

---

## 11. Feedback

| Momento | O que acontece |
|---|---|
| a coruja vai acordar | o aro de tempo fecha, e nos últimos 25% ele pisca âmbar |
| ela acorda | olhos abrem, o `zzz` some, o **cone suave** acende sobre o trecho |
| toque na carta | ela afunda com `back`, sobe para o trilho e o resto desce |
| **cada passo** | o ramo que disparou **acende**; o outro fica apagado; o selo `REPITA` pulsa |
| som do ramo | **duas notas diferentes**: ENTÃO grave e curta, SENÃO aguda e curta — dá para ouvir o plano decidindo |
| andar | passinhos curtos, poeira mínima |
| esconder | o robô entra na caixa, a tampa balança, dois olhinhos espiando |
| visto | o cone fica sólido por um instante, pio bobo, moldura vermelha, volta à placa |
| trecho vencido | a placa apaga, a próxima acende e o trilho ganha a carta com um brilho |
| fim da sala | **reprise do trilho**: cada carta acende de novo, na ordem, com o ramo que disparou |
| fim do nível | `showLevelComplete`, estrelas, bolinhas de sala, tempo no subtítulo |

Efeitos da casa usados: moldura da tela piscando, botão que afunda, item voando
para onde fica guardado (a carta até o trilho), brilho pela **silhueta do robô**
quando a dica precisa apontar — nunca um borrão amarelo cobrindo a sala.

### Pontuação e tempo

Nenhum número na tela. A criança vê bolinha de sala, a placa apagando, o trilho
que ela montou e a reprise. **Cronômetro que conta para cima** — jogo de pensar
não pede pressa —, mostrado só no subtítulo do painel de fim de nível
(`formatTime`).

Estrelas: 3 com 90% dos trechos certos de primeira, 2 com 70%, 1 abaixo. Pontos,
só pelo bridge: +10 de primeira, +5 depois da trava.

---

## 12. Tutorial — três passos, como nos jogos do 1º ao 3º ano

O tutorial é o `createTutorial` da casa: **três passos, uma frase curta em cada,
com o holofote na coisa de verdade da tela**. O jogo já está montado embaixo —
quando o tutorial sai, a criança toca e joga.

| Passo | A frase | O holofote |
|---:|---|---|
| 1 | "A coruja acorda e dorme sozinha." | a coruja, com o aro de tempo |
| 2 | "Escolha o que o robô faz em cada caso." | as duas cartas, com o dedo batendo numa |
| 3 | "Ele anda sozinho até a porta!" | a porta — e o botão **Vamos lá!** |

**Não existe cena de tutorial, nem inventora conduzindo, nem fala escrita letra
a letra.** A primeira versão tinha cinco tempos com a Mel de frente, painel e
botão PRÓXIMO — virou um filme antes do jogo, e o jogo já é curto o bastante
para se explicar jogando. O `?` do HUD chama os mesmos três passos.

**A Mel aparece pouco**: uma faixa com **uma frase** quando o plano falha. Ela
não conduz nada — quem conduz é a criança escolhendo a carta.

## 13. Antes da arte existir

O jogo tem que abrir e ser jogável do começo ao fim com **zero PNG**:

- robô = cápsula cinza com antena e dois olhos, tudo `Graphics`;
- coruja = círculo com dois olhos que fecham, e o `zzz` desenhado;
- esconderijo = caixa com tampa; porta = retângulo com maçaneta;
- sala = piso em degradê com tapete e estantes em blocos.

Texturas por `import.meta.glob` com lista `WANTED` no `BootScene` — nunca
`import` estático, que derruba o `vite build` por um arquivo ausente.

**Ordem de produção:** (1) sala, trajeto, robô andando e o ciclo da coruja;
(2) `levels.ts` **só com o Nível 1**, para avaliação — e avisar; (3) cartas,
ramos acendendo, trecho aceso e trilho; (4) as duas falhas e a trava; (5) missão
no HUD e balões do robô; (6) tutorial; (7) níveis 2 e 3; (8) texturas, medindo a
caixa alfa antes de ancorar o layout.

---

## 14. Arquitetura

~~~text
src/games/EF05CO04/robo-sorrateiro/
├── PLANEJAMENTO.md · TEXTURAS.md
├── index.ts            1280 × 720, FIT + CENTER_BOTH, [Boot, Game]
├── types.ts            Card, Act, Owl, Room, Outcome, Branch, Phase
├── data/
│   ├── layout.ts       as coordenadas do §7, com o porquê dos números
│   ├── theme.ts        cores, fontes, tamanhos
│   ├── cast.ts         as corujas, os ciclos e as três cartas
│   └── levels.ts       LEVELS + as funções do §9 + as validações
└── scenes/
    ├── BootScene.ts    import.meta.glob + createLoadingScreen + faseInicial
    ├── GameScene.ts    orquestra e não desenha nada; o tutorial é o da casa
    ├── room.ts         piso, trajeto, paradas, esconderijos e a porta
    ├── owl.ts          a coruja, o aro de tempo e o cone
    ├── robot.ts        o robô: andar, esconder, espiar, polegar — e o balão
    ├── cards.ts        as cartas de duas linhas e a linha que acende
    ├── mel.ts          a faixa de uma frase, quando o plano falha
    ├── hud.ts          a missão, as bolinhas de sala e o `?`
    └── audio.ts        WebAudio direto
~~~

**A `GameScene` não desenha.** Todo `createX` devolve
`{ container, ...métodos, destroy() }`. Identificadores em inglês, quase nenhum
comentário; só o texto que a criança lê fica em português.

~~~ts
type Phase = 'intro' | 'choosing' | 'running' | 'locked' | 'replay' | 'done'
~~~

Cuidados que já custaram caro neste projeto, e que este jogo encosta em todos:

- **congelar com flag**, nunca `scene.pause()` (o `?` e a trava usam a mesma);
- **`gen` protegendo todo `await`** — o trecho é uma sequência de passos, e uma
  trava no meio precisa matar a sequência anterior **na hora**;
- **o passo a passo tem geração própria**, como a volta do Revezamento: nada de
  um trecho velho continuar andando por cima do novo;
- **zona de toque é objeto solto da cena**, criada na posição definitiva e
  destruída na mão — as cartas nascem e morrem a cada placa;
- `setVisible(false)` **não** desliga toque: o interruptor é
  `zone.input.enabled = false`;
- **o saldo de vidas atravessa o `scene.restart`** (`lives: this.livesLeft`).

Reusar sem reimplementar: `createLoadingScreen`, `faseInicial`, `vidasIniciais`,
`createLives`, `showLevelComplete`, `FX`, `formatTime`, `runtimeGameBridge`.
`LEVELS` mora **só** em `data/levels.ts`.

### A conversa com a plataforma

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, com a primeira sala montada |
| `CORRECT_ANSWER` | a cada trecho vencido |
| `WRONG_ANSWER` | no primeiro erro de cada trecho — **nunca na sala guiada** |
| `CHECKPOINT` | a cada sala, `progress: Math.round(feitas / total * 100)` |
| `GAME_COMPLETED` | ao fim de **cada** nível, `stage: this.level.level`, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca à mão — é do `createLives` |

`stage` é o **nível**, de 1 a 3, nunca índice de array. Importar
`runtimeGameBridge`, nunca `gameBridge`. Nada de `isFinalStage` no jogo.

---

## 15. Registro

| Onde | O que |
|---|---|
| `src/data/catalog.ts` | id **`079`**, slug `robo-sorrateiro`, module `EF05CO04/robo-sorrateiro`, skill `EF05CO04`, `years: [5]`, `order: 345`, `status: "draft"`, `points: 90`, categoria `"Pensamento Computacional"`, ícone 🤖, tags `["condicional", "se-senão", "simular", "algoritmo"]` |
| `src/data/gameInstructions.ts` | três linhas novas, sob a chave `robo-sorrateiro` |
| `src/pages/GameDetailsPage.tsx` | acrescentar `robo-sorrateiro` ao `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` |
| `src/assets/games/EF05CO04/robo-sorrateiro/` | criar — ver [TEXTURAS.md](./TEXTURAS.md) |

> Conferir o `NEXT_FREE_ID` **na hora de registrar**: ele já esteve
> desatualizado, e um id repetido derruba a página inteira com
> `[catalog] id duplicado` — foi exatamente o que aconteceu aqui: a constante
> dizia `078` e o `078` já era do Portões Lógicos. O jogo ficou com o **`079`**,
> e a constante foi para `080`.

Descrição: *"A biblioteca fechou e o robô precisa chegar à porta. Ensine a ele o
que fazer quando a coruja acordar — e veja a regra decidir a cada passo."*

As três linhas de instrução:

1. "O robô anda sozinho até a placa SE — ali o tempo para e sobem as cartas."
2. "Cada carta é uma regra com duas partes: o que fazer SE a coruja acordar, e o que fazer SENÃO."
3. "A carta vale para o trecho inteiro: a cada passo ela decide, e o ramo que decidiu acende."

---

## 16. Critérios de aceite

### A criança entende sozinha

- [ ] a missão está escrita na tela **o tempo todo**, e diz o que fazer sem citar nenhuma peça do jogo;
- [ ] a tela tem quatro coisas: a sala, as corujas com o aro, o robô e o trilho do plano;
- [ ] ao subir as cartas, **o trecho que elas governam está aceso** e o resto da sala, escuro;
- [ ] a carta se lê inteira sem rolagem, com pictograma **e** palavra nos dois ramos;
- [ ] dá para ver o ramo acendendo **no passo em que ele dispara**;
- [ ] as duas falhas são distinguíveis **sem ler**: ser vista tem cone e pio; não chegar tem o robô espiando e dando de ombros;
- [ ] quem pula o tutorial toca numa carta antes de 8 segundos;
- [ ] nenhuma carta passa de 4 linhas de 26 caracteres, e nenhum balão do robô passa de 5 palavras.

### O jogo funciona

- [ ] `npx tsc --noEmit` limpo;
- [ ] `npx eslint src/games/EF05CO04/robo-sorrateiro --ext .ts` limpo;
- [ ] `?embed=1&inline=1&stage=1&points=0&lives=3`, três níveis jogados, um `GAME_COMPLETED` por nível no console;
- [ ] `faseInicial(this, 1)` — nenhum nível fixo esquecido no código;
- [ ] as duas travas foram **vistas acontecendo**, não só lidas;
- [ ] as validações de `levels.ts` falham alto quando uma sala não tem carta que resolve ou um trecho fica sem esconderijo;
- [ ] mudo funciona; o `?` congela e reabre; a retomada não dá salto;
- [ ] nenhum número de ponto, acerto ou erro na tela;
- [ ] nenhum gancho de depuração sobrando (`window.__algo`);
- [ ] nenhum comentário longo no código — a explicação mora aqui.

---

## 17. O que ficou para decidir

1. **O tamanho do trecho.** Quatro a seis passos é o que cabe num ciclo e meio
   de coruja. Se na prática a travessia ficar longa, encurtar o trecho antes de
   acelerar o passo — o passo lento é o que deixa ver o ramo acender.
2. **A carta "esconder sempre" no Nível 1.** Ela é a melhor distratora do jogo,
   mas duas cartas já bastam para o primeiro nível; ela entra no 2 e pode ser
   antecipada para a terceira sala do 1 se a criança estiver passando fácil.
3. **O balão do robô durante o trecho.** Hoje ele cala enquanto o plano roda, para
   não competir com o ramo que acende. Se na tela a criança não estiver olhando a
   carta, o balão volta com uma palavra só — *"andei"* / *"escondi"* — e some em
   meio segundo.

---

## 18. O que mudou na construção do Nível 1

O Nível 1 foi entregue com três salas e quatro trechos, e a tela corrigiu o
papel na hora em que cada peça apareceu. Fica aqui o que mudou, e por quê.

**A coruja subiu e as cartas desceram.** Do jeito planejado, as cartas abriam
em cima dela: a criança escolhia a regra sem ver o estado de quem a regra
pergunta. A coruja foi para `y=196` e as cartas para `y=390` — a cabeça dela e
o aro de tempo ficam acima da carta durante a escolha inteira.

**O vaso de planta saiu dos esconderijos.** Ele enche a célula toda e engole o
robô agachado: some até a antena. Sobraram caixa e cesto, que são baixos — e o
quadro agachado aparece, que é o contrato dele com o desenho.

**Todo lugar onde o robô para ganhou um móvel, inclusive a placa.** Sem isso a
primeira ordem de esconder pegava ele em pé no meio do chão, sem nada na
frente: parecia defeito, não esconderijo.

**O toque na carta muda a fase na hora.** Entre o toque e o primeiro passo há
quase um segundo de animação, e nesse buraco um segundo toque entrava por cima
e matava a jogada anterior pela geração.

**O tutorial reaberto pelo `?` nascia atrás do jogo.** A ordem das cenas é
`[Boot, Tutorial, Game]` e cena pausada continua desenhando, então ele abria
invisível. Agora o `?` chama `bringToTop`. **O mesmo defeito existia no
Revezamento em Lista** e foi corrigido junto.

**A máquina de escrever derrubava o jogo no PULAR.** `FX.type` completava o
texto no `destroy` do próprio `Text` — e ali a textura dele já não existe,
então `setText` estourava em `drawImage` de `null`. Agora o caminho de morte
só cancela; quem completa o texto é o `skip()` de verdade. A correção é em
`shared/effects/FX.ts` e vale para todos os jogos.

**A Mel do aviso mora dentro da faixa.** De corpo inteiro ela subia até o HUD e
saía cortada pela borda de cima da tela. Agora a figurinha inteira cabe no
painel.

**O `?` não aparece no tutorial** — ali ele não teria o que abrir, e ficava em
cima do PULAR.

**O id foi para `079`.** O `078` já era do Portões Lógicos, e id repetido
derruba a página inteira.

### O que a partida provou no navegador

- os cinco tempos do tutorial, com a coruja acordando e a mesma carta acendendo
  os dois ramos na mesma travessia;
- as três salas jogadas até a porta, com `CHECKPOINT` em 0, 25, 50, 75 e 100 e
  um `GAME_COMPLETED` de `stage 1` em `totalStages 1`;
- a trava de **ser vista**, com a carta reaberta e a frase dizendo qual ramo
  errou;
- a sala guiada **não** cobra vida nem emite `WRONG_ANSWER`; da segunda sala em
  diante cobra, e **uma vez só por trecho**;
- o `?` congela a partida, abre o tutorial por cima e devolve a cena no mesmo
  ponto.

---

## 19. A segunda passada: simplificar

A primeira versão jogável foi reprovada por ser complexa demais — "parece um
jogo de adulto". O que saiu, e por quê:

**O tutorial de cinco tempos morreu.** Era uma cena inteira com a Mel de
frente, fala escrita letra a letra e botão PRÓXIMO: um filme antes do jogo, e
parecido demais com o jogo vizinho. No lugar entrou o `createTutorial` da casa,
com **três frases curtas** e o holofote na coisa de verdade — o mesmo padrão
dos jogos do 1º ao 3º ano.

**O trilho do plano saiu da tela.** Com uma carta por sala ele repetia o que a
carta armada já mostrava, e enchia a tela de peça. A carta armada, parada no
canto de baixo com as linhas acendendo, **é** o plano.

**A carta perdeu metade das palavras.** Era `SE ela estiver ACORDADA` /
`ENTÃO ESCONDER` / `SENÃO ANDAR` mais um selo `REPITA A CADA PASSO` — quatro
linhas de texto. Virou uma tabela de duas linhas com desenho, seta e uma
palavra, e `SE`/`SENÃO` de rótulo pequeno.

**Cada sala do Nível 1 tem um trecho só.** A terceira tinha duas placas; a sala
cresce agora só no tamanho (3, 4 e 5 passos).

**Todo texto encolheu.** A missão é "Leve o robô até a porta sem ser visto."; o
erro de ser vista é "A coruja acordada vê quem anda."; o de ficar parado é
"Escondido o tempo todo, ele não chega." — frases de cinco a sete palavras, no
lugar das explicações de duas linhas.

---

## 20. A terceira passada: câmera, Mel e bicho vivo

**A câmera fecha na coruja e no robô quando as cartas sobem.** É o momento da
decisão, e ele agora tem enquadramento: a câmera aproxima (`1.22`) e centraliza
os dois enquanto as cartas ficam paradas embaixo. Isso só funciona com **duas
câmeras** — a de baixo dá o zoom na sala, a de cima desenha cartas, HUD, Mel e
tutorial em tamanho fixo. Sem isso a carta escolhida sairia da tela junto com o
zoom. A separação é por profundidade: tudo com `depth ≥ DEPTH.card` é interface.

O alvo vertical **não é o meio da tela**: é o meio da faixa que sobra ACIMA das
cartas — senão a câmera aproxima e esconde o robô atrás delas. E o centro é
preso dentro do fundo, para nunca aparecer borda preta.

**O flagra ganhou câmera também:** ser vista puxa a câmera para `1.45` com um
tranco curto. É o único momento em que o jogo dá um susto — e ele dura meio
segundo.

**A Mel voltou, pequena.** Ela mora no alto da direita e fala uma frase por vez:
*"Qual regra vale aqui?"* quando as cartas sobem, e o motivo do erro quando o
plano falha. Entra deslizando, dá um pulinho quando fala de novo, e some quando
o robô anda. Não existe mais painel de tutorial com ela.

**Dormir virou animação.** O peito sobe e desce devagar, o `zzz` sobe e some em
laço, e acordar dispara um anel de luz e uma respiração curta e atenta. O cone
de visão pulsa enquanto ela está acordada. Acrescentei também faísca na porta
quando o robô chega.

**A moldura amarela do começo da fase saiu.** Era o véu que escurecia a sala
fora do trecho; com um trecho por sala ele só desenhava uma borda em volta de
tudo, e parecia erro de tela.

**As cartas ficaram grandes.** 560 × 211 na grade — 168 × 63 px reais num
celular de 390, muito acima do piso de 40. Elas ocupam o rodapé inteiro, e por
isso o enquadramento mudou de regra: **quem manda é o topo**. A coruja e o aro
aparecem inteiros logo abaixo do HUD, e o robô entra no que sobra — os pés dele
podem encostar atrás das cartas, porque ele se lê pela cabeça. Tentar caber os
dois por completo fazia a câmera AFASTAR quando a carta crescia, que é o
contrário do que a cena pede (e abria borda preta na tela).

**Esconder virou troca de peça.** Chegou a folha `moveis-com-robo-escondido`:
os mesmos três móveis com o robô espiando de dentro. Agora o robô some e o
móvel troca de desenho, em vez de o robô ir para trás dele por profundidade —
antes sobrava só a antena, e a criança não via QUEM tinha se escondido. Com
isso o vaso de planta voltou a ser esconderijo: no quadro dele o robô aparece
ao lado, e não engolido.

**A Mel avisa a coruja, e o balão dela subiu.** Ao lado, o balão cobria a
própria Mel; agora ele fica acima da cabeça e só a pontinha encosta no cabelo.
E ela deixou de ser enfeite: enquanto o plano roda, ela olha o círculo de tempo
e fala uma frase curta em cada virada — "Cuidado! Ela vai acordar.", "Acordou!
Agora não pode andar.", "Dormiu! Agora dá para andar." Uma frase por virada, sem
repetir. Na placa ela dá uma dica em rodízio, sempre sobre o que está na tela:
o círculo, a coruja, os dois casos — nunca "condição" nem "regra".

**A Mel está espelhada.** O quadro de perfil da folha olha para a direita, e ela
mora na borda direita: sem espelhar, ela falava virada para fora da tela.
Agora ela fica logo acima das cartas, olhando para elas.

**As salas encolheram:** 2, 3 e 4 passos (eram 3, 4 e 5), e a coruja Ru ficou
mais rápida (2,6 s dormindo / 1,8 s acordada). A sala 1 agora se atravessa em
poucos segundos.

---

## 21. A quarta passada: a travessia virou cena

O trecho deixou de ser uma animação corrida e passou a ser **uma sequência de
planos de câmera**. Cada passo acontece assim:

1. a linha da carta que vai decidir **acende** — a regra decide antes de o robô
   mexer;
2. se a coruja virou de estado, **a tela corta para ela**: a câmera vai até lá
   em `1,72`, ela acorda (encolhe, estufa as penas, abre os olhos, balança a
   cabeça, e o anel de luz se abre) ou dorme (assenta devagar e o `zzz` volta);
3. a tela **volta para o robô** em `1,42`, e só então ele anda ou se esconde —
   com a câmera correndo junto com ele.

**O relógio do mundo para durante o corte.** Sem isso a cena empurraria o plano
sozinha: a coruja podia mudar duas vezes enquanto a câmera passeava. Com a
pausa, cada passo avança exatamente `STEP_MS` — que é o mesmo que a simulação
de `levels.ts` usa, então o que a validação promete é o que a criança vê.

**O passo ficou bem mais lento** (900 ms, era 560). É o tempo de ler a linha que
acendeu, ver o corte e acompanhar a ação.

**A abertura do trecho é uma cena também:** assim que a carta é armada, a tela
mostra a coruja como ela está agora, e depois vai para o robô.

**Três coisas saíram da tela:**

- **o dedo** que apontava a carta certa na sala guiada — ele entregava a
  resposta antes de a criança pensar;
- **a placa "SE?"** no chão, um cartaz laranja solto no meio da sala que nada
  explicava; ficou só um pontinho marcando onde o robô para;
- **o quadro agachado do robô** como recurso de esconderijo, que já tinha sido
  substituído pela folha de móveis com ele dentro.

**O tutorial apresenta o robô primeiro.** São quatro passos agora: "Este é o
robô. Ele anda sozinho." → "A coruja acorda e dorme sozinha." → "Escolha o que o
robô faz em cada caso." → "Ele vai até a porta sem ser visto!". E o dedo do
tutorial saiu junto: ele batia sempre na carta da esquerda, que nem sempre é a
certa.

---

## 22. O header, e os níveis 2 e 3

**O header diz três coisas, da esquerda para a direita:** em que **nível** a
criança está (um selo laranja com `NÍVEL 2` e três tracinhos embaixo, um por
nível, acesos até onde ela chegou), **o que** ela tem de fazer (a missão, que
nunca muda) e **quantas salas** faltam neste nível (o rótulo `SALAS` com uma
bolinha para cada, verdes conforme vence). Nenhum número de ponto, nenhuma
porcentagem — o nível é um selo e as salas são bolinhas.

**O Nível 2 traz a terceira carta**, a "esconder sempre": para uma criança de 10
anos ela parece a mais segura do mundo, e falha de um jeito novo — o robô nunca
chega. É ela que ensina que o SENÃO também precisa estar certo. Com o passo em
900 ms, o limite de espera caiu para **5 passos parados**: 4,5 s é tempo de
sobra para ver que ele se escondeu quando dava para andar, e fica bem acima da
fase acordada mais longa (2,2 s da Nina).

**O Nível 3 é a sala grande:** dois trechos por sala, cada um com a sua
guardiã. Entra o Zé, que dorme 2,2 s e acorda 1,8 s — o ritmo mais apertado do
jogo.

**O progresso da plataforma passou a ser por nível.** `legsIn(level)` conta os
trechos daquele nível, e o `CHECKPOINT` divide por ele; antes a conta usava só
os trechos do Nível 1, e o progresso do 2 e do 3 teria saído errado.
