# Revezamento em Lista — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO01 · 5º ano · Pensamento Computacional · Listas e grafos**

> **Correções ao briefing, antes de tudo.** Três partes dele não passam nas
> regras do projeto e foram trocadas aqui — o plano já segue com a troca, para
> quem leu o briefing poder discordar com o documento na mão.
>
> 1. **Arrastar saiu.** O briefing pede "arrastar um nadador para a posição".
>    Arrastar é proibido por padrão neste projeto; virou **um toque pega, um
>    toque solta**.
> 2. **O placar contra a IA e o "+15" saíram.** Número na tela é proibido pelo
>    INSTRUCOES, e um adversário que não depende de nada que a criança fez é
>    decoração — a volta de 8 s virou a **execução da lista**, de ~0,6 s por
>    nadador, e a vantagem virou o rival ficando para trás.
> 3. **O "pedido livre: qualquer troca válida vale" saiu.** Isso não é regra:
>    pegar uma ficha e devolvê-la no mesmo lugar acertaria. Virou um pedido
>    aberto com **estado final conferível** — *quem tem a chama fecha a prova*.

---

## 1. O jogo em três regras

1. **A escalação embaixo é uma lista: o 1º nada primeiro, o último fecha.**
2. **Antes de cada volta a técnica pede uma mudança — tire, ponha ou mude de lugar.**
3. **Quando estiver como ela pediu, apite: a prova nada a SUA lista, na ordem dela.**

Não existe mais nada para aprender, do primeiro ao último nível.

~~~text
┌────────────────────────────────────────────────────────────────────────┐
│ ♥♥♥     ●●○  as voltas desta prova                                (?)  │
├────────────────────────────────────────────────────────────────────────┤
│ ╭────╮ ╭────────────────────────────────────────────────────────────╮  │
│ │ 👩 │ │  A 2ª se cansou: TIRE ela da prova.                        │  │
│ ╰────╯ ╰────────────────────────────────────────────────────────────╯  │
├────────────────────────────────────────────────────────────────────────┤
│ ═══════════════════════════════════════════════════════════════════╗   │
│   ~~~~~~~  seu time  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  ║   │
│ ═══════════════════════════════════════════════════════════════════╣   │
│   ~~~~~~~  rival     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  ║   │
│ ═══════════════════════════════════════════════════════════════════╝   │
├────────────────────────────────────────────────────────────────────────┤
│ ╭──────╮  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐         ╭─────────╮  │
│ │BANCO │  │  1º   │ │  2º   │ │  3º   │ │  4º   │         │  APITO  │  │
│ │  ╰╮  │  │ Nina  │ │ Bia   │ │ Téo   │ │ Duda  │         │   ((•   │  │
│ ╰──────╯  └───────┘ └───────┘ └───────┘ └───────┘         ╰─────────╯  │
└────────────────────────────────────────────────────────────────────────┘
~~~

Quatro coisas na tela: **o pedido**, **a água**, **a tira da escalação** e **o
apito**. Mais o banco, que recebe quem sai.

Com uma ficha na mão a tira troca de cara — e é a única troca de cara do jogo:

~~~text
│ ╭──────╮         ┌───────┐         ┌───────┐   ╭ Téo ╮   ┌───────┐      │
│ │BANCO │  ╷1º╷   │  Nina │  ╷2º╷   │  Bia  │   ╰─────╯   │ Duda  │ ...  │
│ │ ←sair│  └───┘   └───────┘  └───┘  └───────┘   (na mão)  └───────┘      │
│ ╰──────╯   ▲ os pinos: onde ele ENTRA                                   │
~~~

---

## 2. A habilidade, e o teste que ela precisa passar

> **(EF05CO01)** Reconhecer objetos do mundo real e/ou digital que podem ser
> representados através de **listas** que estabelecem uma organização na qual há
> um **número variável de itens dispostos em sequência**, fazendo **manipulações
> simples** sobre estas representações.
>
> Objeto: **Listas e grafos.**

| O que a habilidade pede | Onde está na mecânica |
|---|---|
| **objeto do mundo real representado como lista** | a escalação de um revezamento: ninguém precisa explicar que ela tem ordem |
| **número variável de itens** | entra reserva, sai cansado; a tira tem 3, 4, 5 ou 6 fichas e **muda de tamanho durante a prova** |
| **dispostos em sequência** | a posição não é enfeite: ela é **quando** cada um nada, e a volta prova isso |
| **manipulações simples** | tirar, pôr, mudar de lugar — um pedido por volta |
| **sobre estas representações** | o que a criança mexe é a tira, não a água; a água é a consequência |

### O teste da bolinha

> Troque os nadadores por bolinhas coloridas sem significado. O jogo muda?

Nos Níveis 1 e 2, **não muda — e aqui isso não é defeito**: em EF05CO01 a lista
*é* o conteúdo. A bolinha é justamente a prova de que a habilidade está na
mecânica, e não na piscina.

Onde o teste morde é no resto do briefing, e é por isso que ele mudou:

| Parte do briefing | O que a bolinha revela | Correção |
|---|---|---|
| voltas de 8 s com placar da IA | 24 s de espera por prova, e um rival que não depende de nada que a criança fez | a volta **é a execução da lista**: cada ficha nada na ordem da tira, ~0,6 s cada |
| "vantagem visível (+15)" | número na tela | o rival fica para trás; a arquibancada levanta |
| N3 "qualquer troca válida vale" | um toque que devolve a ficha no mesmo lugar acertaria | estado final conferível: *a chama fecha a prova* |

### O risco de verdade deste jogo

Não é a bolinha: é o **pedido virar comando ditado** — "toque no 2º" e pronto,
sem olhar a lista. Três coisas seguram isso, e elas são a espinha do jogo:

1. **A renumeração é regra, não efeito.** Em toda prova há um par encadeado: o
   segundo pedido fala de uma posição que **só existe depois** da mudança do
   primeiro. Quem executou sem olhar erra o segundo.
2. **O Nível 3 pede por característica**, e a característica é calculada no
   instante do apito — `o mais alto DA ÁGUA` muda se o mais alto estiver no
   banco.
3. **Só o apito julga.** Pegar, soltar, desistir e refazer é de graça; o que
   custa é dizer "pronto". Isso separa erro de dedo de erro de cabeça.

---

## 3. Como isso não vira o jogo irmão

`EF05CO01` já tem jogo publicado: **Baralho das Listas** (`id 031`, `order 310`).
Ele cobre três das quatro tarefas do exemplo oficial; este cobre a outra metade
do enunciado.

| Baralho das Listas | Revezamento em Lista |
|---|---|
| A lista é **ordenada por valor**: existe um lugar certo por natureza, e a criança descobre qual | A lista é uma **sequência de execução**: nenhum lugar é certo por natureza; certo é o que a técnica pediu |
| Verbos: inserir na ordem, buscar, substituir por curinga | Verbos: remover, inserir em posição, mudar de lugar |
| A prova do acerto é a **conferência** — os vizinhos aparecem ao lado da carta | A prova do acerto é a **execução** — a volta nada a lista inteira, na ordem dela |
| A lista muda e para por aí | A **renumeração muda o significado do pedido seguinte** |
| O item é um valor (`7`), e valor não tem cara | O item é **alguém**, e no Nível 3 o pedido é por característica, não por número |
| Gesto: tocar no espaço entre duas cartas | Gesto: pegar uma ficha e soltar num pino; o apito fecha a volta |

Se as duas primeiras linhas dessa tabela não estivessem preenchidas, seriam o
mesmo jogo.

---

## 4. A tira, e por que ela é a peça central

A tira da escalação é o jogo. Ela precisa de três propriedades, e nenhuma é
enfeite:

1. **Numerada sempre.** O número fica na ficha, e é o que o pedido nomeia.
2. **Renumerando à vista.** Tirou o 2º? O 3º **vira** 2º, com o número girando.
   É o efeito mais importante do jogo inteiro, e tem som próprio (§11).
3. **De tamanho variável, sem quebrar o layout.** A largura da ficha é função da
   contagem (§7) — 3 fichas ficam gordas, 6 ficam magras, e ninguém sai da tela.

O banco fica na ponta esquerda, na borda da piscina: é para onde vai quem sai, e
de onde vem quem entra. Um reserva esperando no banco é a maneira de a criança
ver que a lista **pode crescer**, antes mesmo de o pedido falar nisso.

---

## 5. O laço

~~~text
a técnica pede uma mudança   (balão, 1 frase curta, com pictograma)
      │
      ├─ toque numa ficha (ou no reserva do banco) ──► ela sobe: NA MÃO
      │        │
      │        ├─ toque num pino numerado ──► entra ali, a tira RENUMERA
      │        ├─ toque no banco          ──► sai da água
      │        └─ toque nela de novo      ──► volta para onde estava
      │
      └─ toque no APITO ──► a volta nada a lista, da 1ª ficha à última
                 │
                 ├─ certo  → o time chega na frente, arquibancada, próxima volta
                 └─ errado → a volta se atrapalha À VISTA, a técnica para a
                             prova: TRAVA → conserta → renada

acabaram as voltas → reprise da tira, volta a volta → próxima prova
~~~

O ciclo é sempre o mesmo, do primeiro ao último nível. O que cresce é o tamanho
da lista e o tipo de pedido, nunca o número de regras.

---

## 6. Controle — um toque, sempre

| Estado | O que é tocável | O que acontece |
|---|---|---|
| **parado** | as fichas da tira, o reserva no banco, o apito, o `?` | ficha sobe · apito julga |
| **com ficha na mão** | os `N+1` pinos, o banco, a própria ficha | solta · remove · cancela |
| **nadando** | nada | o toque acelera a volta em 2× |
| **travado** | só o que destrava: a tira e o apito | ver §10 |

Três coisas que este jogo **não** faz, e cada uma custou caro em jogo deste
projeto:

- **não arrasta.** Um toque põe, um toque tira;
- **não usa duas metades do mesmo objeto.** O banco e o apito são dois objetos
  visíveis e separados, cada um com desenho próprio — nada de "X no canto da
  ficha";
- **não tem zona invisível.** Com a ficha na mão, os 880 px da tira são
  divididos em `N+1` faixas, cada uma com o seu pino desenhado no meio. Não
  existe ponto da tira que não pertença a um pino visível, e o pino sob o dedo
  acende antes de a criança soltar.

**A troca sai de dois movimentos.** `TROQUE o 1º com o 3º` não tem gesto
próprio: a criança move um, depois move o outro. O estado do meio do caminho não
é o pedido, e tudo bem — só o apito julga. É a operação mais difícil do jogo, e
está no §17 como o primeiro ponto a observar com criança.

---

## 7. A grade: 1280 × 720

`Phaser.Scale.FIT`, coordenada absoluta em `data/layout.ts`. Coluna do celular =
`× 0,30` (aparelho de 390 px). Abaixo de ~40 px reais não serve para dedo de
criança.

| Faixa | y | Conteúdo | Tamanho na grade | No celular |
|---|---:|---|---:|---:|
| HUD | 0–92 | vidas (x 40, y 40), bolinhas de volta ao centro, `?` (x 1216, y 46) | `?` 64 · vida 30 · bolinha 22 | 19 · 9 · 7 px |
| Pedido | 100–196 | técnica (x 60–184) e balão (x 200–1160) | balão 960 × 92 · frase 42 px | 288 × 28 · 13 px |
| Piscina | 206–486 | sua raia (214–346), raia rival (350–482), blocos em x 150, parede em x 1140 | nadador 96 px de altura | 29 px |
| Escalação | 496–688 | banco (x 40–160), fichas (x 180–1060), apito (x 1080–1240) | ficha 134–180 × 176 · apito 160 × 176 | 40–54 × 53 · 48 × 53 |
| Rodapé | 688–720 | reflexo, nada tocável | — | — |

**O passo da tira é função da contagem.** Os 880 px entre x 180 e x 1060:

| Fichas na água | Largura | Folga | No celular |
|---:|---:|---:|---:|
| 3 | 180 | 24 | 54 px |
| 4 | 164 | 20 | 49 px |
| 5 | 150 | 18 | 45 px |
| 6 | 134 | 16 | 40 px |

**A lista nunca passa de 6**, e não é gosto: com 7 a ficha cai para 118 px — 35
px reais, abaixo do dedo. `data/levels.ts` valida isso ao carregar.

**Os pinos, com a ficha na mão:** `N+1` faixas iguais nos mesmos 880 px. Com 5
fichas na água são 6 faixas de 146 px (44 px reais); com 3, são 4 faixas de 220.
O pior caso do jogo inteiro continua acima do limite.

**Nenhum painel corta a área de jogo.** O balão acaba em `y=196` e a água começa
em `y=206`; a água acaba em `y=486` e a tira começa em `y=496`. O nadador ocupa
96 px numa raia de 132, com folga para a espuma — nada de anel cortado pela
metade como em Ritmo da Rotina, nada de painel engolindo quem se move como em
Pulo Programado.

---

## 8. Níveis e fases

**Fase = uma prova. Volta = um pedido.** A prova cresce dentro do nível: 2
voltas, 3, 3. São 3 níveis × 3 provas (dentro do limite de 5 do INSTRUCOES), 24
voltas no jogo inteiro.

| Nível | A ideia | Lista | Provas | O que cresce |
|---|---|---:|---|---|
| **1** | A posição diz quando cada um nada | 3 → 4 | 2, 3, 3 voltas | pedido literal por posição: `REMOVA o 2º`, `o novato entra no FIM`, `a novata entra no COMEÇO`. A terceira prova traz o primeiro par encadeado |
| **2** | A posição tem número, e o número anda | 4 → 5 | 2, 3, 3 voltas | `TROQUE o 1º com o 3º`, `INSIRA na posição 2`, `o ÚLTIMO vira PRIMEIRO`. Todo par é encadeado |
| **3** | Quem é quem | 5 → 6 | 2, 3, 3 voltas | pedido por característica (`o de óculos cansou`, `a mais alta entra antes da ruiva`) e, na última volta, o pedido aberto |

### O elenco (`data/cast.ts`)

| Traço | Nome | O que se vê | Altura |
|---|---|---|---:|
| `listrada` | Nina | touca listrada vermelha e branca | 2 |
| `oculos` | Téo | óculos enormes amarelos | 3 |
| `alto` | Bia | claramente a mais alta | 5 |
| `ruiva` | Lila | cabelo ruivo solto, sem touca | 1 |
| `chama` | Rafa | chama estampada no peito — a mais rápida | 4 |
| `bolinhas` | Duda | touca de bolinhas | 2 |

A `altura` é dado, não desenho: é o que faz `o mais alto da água` ser uma função
e não um gabarito. Duas alturas iguais (Nina e Duda) existem de propósito, para
que a comparação nunca seja usada com as duas juntas sem a Bia.

### O par encadeado, que é o coração do jogo

~~~text
volta 1:  [Nina, Téo, Bia, Duda]   pedido: "a 2ª pessoa se cansou: TIRE ela"
                                   →  [Nina, Bia, Duda]
volta 2:  [Nina, Bia, Duda]        pedido: "agora a 2ª vai fechar a prova"
                                   →  quem é a 2ª AGORA? a Bia, não o Téo
~~~

### O pedido aberto, no fim do Nível 3

*"Quem tem a chama fecha a prova."* Vários caminhos de movimento chegam lá; o
veredito olha só o estado final. É a síntese: a lista é minha, eu mexo nela.

Frase de fecho do jogo, no painel: **"A escalação é uma LISTA: tem ordem, tem
posição, e a gente pode mexer nela."**

---

## 9. As regras, em código

A regra é uma função, nunca um campo. O veredito sai do estado no instante do
apito.

~~~ts
interface Request {
  verb: 'remove' | 'insert' | 'move' | 'swap' | 'open'
  line: string
  target(list: Swimmer[], bench: Swimmer[]): Swimmer | undefined
  solves(list: Swimmer[], start: Swimmer[]): boolean
  why: string
  firstStep(list: Swimmer[], start: Swimmer[]): Highlight
}

function judge(state: State): Verdict {
  const { list, start, request } = state
  if (request.solves(list, start)) return { kind: 'ok' }
  return { kind: 'wrong', where: request.firstStep(list, start), why: request.why }
}
~~~

`sameSequence` é o que garante que a manipulação foi **a pedida e nada além**:
mexer em mais alguém de brinde não passa, mesmo que o alvo tenha ficado no lugar
certo.

~~~ts
const sameSequence = (a: Swimmer[], b: Swimmer[]) =>
  a.length === b.length && a.every((s, i) => s.id === b[i].id)

const removeAt = (i: number): Request => ({
  verb: 'remove',
  target: () => undefined,
  solves: (list, start) => sameSequence(list, without(start, i)),
  ...
})

const removeByTrait = (trait: Trait): Request => ({
  verb: 'remove',
  target: list => list.find(s => s.trait === trait),
  solves: (list, start) => {
    const who = start.find(s => s.trait === trait)
    return !!who && sameSequence(list, start.filter(s => s.id !== who.id))
  },
  ...
})

const insertAt = (who: SwimmerId, i: number): Request => ({
  verb: 'insert',
  target: (_l, bench) => bench.find(s => s.id === who),
  solves: (list, start) => sameSequence(list, spliceIn(start, i, who)),
  ...
})

const swap = (i: number, j: number): Request => ({
  verb: 'swap',
  target: list => list[i],
  solves: (list, start) => sameSequence(list, swapped(start, i, j)),
  ...
})

const tallestBefore = (trait: Trait): Request => ({
  verb: 'move',
  target: list => list.reduce((a, b) => (b.height > a.height ? b : a)),
  solves: list => {
    const tall = list.reduce((a, b) => (b.height > a.height ? b : a))
    const ref = list.find(s => s.trait === trait)
    return !!ref && list.indexOf(tall) === list.indexOf(ref) - 1
  },
  ...
})

const flameAnchors: Request = {
  verb: 'open',
  target: list => list.find(s => s.trait === 'chama'),
  solves: (list, start) =>
    sameSet(list, start) && list[list.length - 1].trait === 'chama',
  ...
}
~~~

Duas validações rodam ao carregar `LEVELS`, e falham alto no dev:

1. **nenhuma lista passa de 6**, em nenhum momento de nenhuma prova;
2. **todo pedido é resolvível a partir do estado em que a prova chega nele** —
   simular a solução do autor e conferir que `solves` devolve `true`. Um pedido
   impossível no meio de uma prova é a pior coisa que este jogo pode ter, porque
   a criança fica tentando para sempre.

---

## 10. O erro, a TRAVA e as vidas

**Errar de dedo não é errar.** Pegar, soltar no pino errado, desistir, tirar e
recolocar: nada é julgado, nada custa vida.

**Ignorar não é responder.** Apitar sem mexer em nada é resposta errada — a
técnica pediu, e a prova nadou com a lista velha.

Passo a passo:

1. **A volta nada errado, à vista.** Quem está fora do lugar hesita no bloco
   ("não era minha vez") e a troca se perde; quem devia ter saído para no meio
   da raia. O rival passa.
2. **O mundo para** — flag, nunca `scene.pause()`. Moldura vermelha, apito da
   técnica, tremida curta.
3. **A ficha problemática ganha destaque** e o balão diz **qual** e **por quê**:
   *"O Téo continua na 2ª: era ele que ia sair."* Nunca "tente de novo", nunca a
   resposta.
4. **A tira volta ao estado do começo da volta** e o apito fica com cadeado até
   a lista estar certa.
5. **Segundo erro na mesma volta:** pisca **o primeiro passo** da solução — um
   pino ou uma ficha —, nunca a sequência inteira.

Custo: `WRONG_ANSWER` e uma vida, pelo `createLives`, **uma vez por volta** — o
segundo erro da mesma volta não cobra de novo. O contador de erros da volta
**zera ao trocar de volta**, senão o terceiro pedido herda a dica do primeiro e
a regra generosa vira a mais dura do jogo.

**Nenhum estado sem saída:**

- quem foi para o banco por engano volta: o banco é tocável sempre;
- a água nunca fica com menos de 2 — com 2 na água o banco aparece com cadeado
  e, tocado, explica em uma frase;
- cancelar é tocar de novo na ficha que está na mão;
- a volta errada sempre pode ser renadada; nada se perde para sempre.

---

## 11. Feedback

| Momento | O que acontece |
|---|---|
| toque na ficha | sobe com `back`, o número dela apaga, os pinos entram deslizando |
| dedo sobre um pino | o pino acende e mostra o número que a ficha vai receber |
| soltar no pino | desliza com **rastro d'água**, e a tira **renumera na hora**, um número girando por vez, da esquerda para a direita |
| som da renumeração | arpejo subindo, **uma nota por ficha**, no mesmo relógio do giro — é o som que prova que a lista se reorganizou |
| soltar no banco | a ficha voa até o banco, a toalha balança, a tira fecha o buraco e renumera |
| apito | o botão afunda e volta com `back`, os blocos acendem |
| volta certa | cada nadador nada a sua perna em **1,5 s**, com **o número dele em cima** e **a ficha dele acesa na tira**; no fim, moldura verde e a bolinha da volta acende |
| volta errada | hesitação no bloco, troca perdida, rival passa, moldura vermelha, bóia |
| fim da prova | **reprise da tira**: os estados da lista tocam em sequência, volta a volta — como começou → como terminou |
| fim do nível | `showLevelComplete`, estrelas, bolinhas de prova, tempo no subtítulo |

Efeitos da casa usados aqui: moldura da tela piscando nas bordas, botão que
afunda, item voando para onde fica guardado, rastro, **brilho pela silhueta do
nadador** quando a dica precisa apontar alguém (silhueta destaca ELE; círculo
destacaria só um lugar) e reprise no fim da fase.

E o contrário, que também é regra: **nada de brilho tomando a tela**. O destaque
da trava é contorno, não borrão — foi o erro do "pode bater" em Ritmo da Rotina,
que escondia justamente a figura a julgar.

### Pontuação e tempo

Nenhum número na tela. A criança vê bolinha de volta, estrela, a tira que ela
montou e a reprise.

**Cronômetro que conta para cima**, não barra que esvazia: jogo de pensar não
pede pressa, e contar posição com relógio correndo é cobrar a coisa errada. O
total entra no subtítulo do painel de fim de nível (`formatTime`).

Estrelas: 3 com 90% das voltas certas de primeira, 2 com 70%, 1 abaixo. Pontos
(só pelo bridge): +10 de primeira, +5 depois da trava.

---

## 12. Tutorial — uma CENA, com a treinadora de frente

O tutorial não é um balão por cima do jogo: é a **`TutorialScene`**, que roda
antes da partida. A treinadora aparece **de frente** (os quadros 3 e 4 da folha)
e explica o jogo no próprio cenário — a tira é a tira de verdade, a água é a
água de verdade, e **um dedo mostra cada toque** antes de a criança ter de
adivinhar qualquer coisa.

| Tempo | O que ela diz | O que acontece na tela |
|---:|---|---|
| 1 | "Oi! Eu sou a treinadora. Esta fila aqui embaixo é a sua ESCALAÇÃO." | as três fichas entram uma a uma e se numeram, com o arpejo |
| 2 | "A ordem da fila é a ordem de nadar: o 1º nada primeiro, e o último fecha." | ela sai de cena e a prova nada — cada nadador com o número em cima e a ficha dele acesa na tira |
| 3 | "Antes de cada volta eu peço uma mudança. Toque no nadador para PEGAR ele." | o dedo toca a 2ª ficha; ela sobe e os pinos abrem |
| 4 | "O BANCO tira ele da prova, e um número põe ele naquele lugar." → "Viu? Quem era o 3º virou o 2º." | o dedo toca o banco, a ficha voa e a tira **renumera à vista** |
| 5 | "Quando a fila estiver do jeito que eu pedi, aperte NADAR." | o dedo toca o apito e a prova acontece → botão **VAMOS NADAR!** |

Cada tempo espera o **PRÓXIMO**: nada corre no relógio da criança. O **PULAR**
fica no canto, para quem já sabe.

O `?` do jogo chama a mesma cena por cima da partida parada, e ela devolve a
cena ao terminar — o mesmo tutorial, nunca um texto diferente.

---

## 13. Antes da arte existir

O jogo tem que abrir e ser jogável do começo ao fim com **zero PNG**:

- ficha = cartão arredondado na cor da camiseta do nadador, com o nome e o
  pictograma do traço em `Graphics` (listras, óculos, chama, bolinhas, cabelo,
  seta para cima);
- nadador na água = cápsula na cor da camiseta, com a touca do traço;
- técnica = silhueta com prancheta;
- cenário = degradê de céu com arquibancada em blocos.

Texturas por `import.meta.glob` com lista `WANTED` no `BootScene` — nunca
`import` estático, que derruba o `vite build` por um arquivo que ainda não
existe.

**Ordem de produção:**

1. tira, pinos, banco, apito e renumeração, com placeholder;
2. `levels.ts` **só com o Nível 1**, para a avaliação do usuário (regra do
   INSTRUCOES: entregar 1 nível para teste e avisar);
3. a volta certa e a volta errada na água;
4. trava, vidas, bridge;
5. níveis 2 e 3;
6. texturas, medindo a caixa alfa antes de ancorar o layout.

---

## 14. Arquitetura

~~~text
src/games/EF05CO01/revezamento-em-lista/
├── PLANEJAMENTO.md · TEXTURAS.md
├── index.ts          1280 × 720, FIT + CENTER_BOTH, [Boot, Tutorial, Game]
├── types.ts          Swimmer, Request, Verdict, State, Trait
├── data/
│   ├── layout.ts     as coordenadas do §7, com o porquê dos números
│   ├── theme.ts      cores, fontes, tamanhos
│   ├── cast.ts       os seis nadadores, os traços e os recortes alfa medidos
│   └── levels.ts     LEVELS + as funções do §9 + as duas validações
└── scenes/
    ├── BootScene.ts     import.meta.glob + createLoadingScreen + faseInicial
    ├── TutorialScene.ts a treinadora de frente, em cinco tempos
    ├── GameScene.ts     orquestra e não desenha nada
    ├── teacher.ts    a treinadora grande, o painel de fala e os botões
    ├── finger.ts     o dedo que mostra o toque
    ├── roster.ts     a tira: fichas, pinos, banco, a renumeração
    ├── pool.ts       raias, nadadores, a volta certa e a errada
    ├── coach.ts      a técnica e o balão do pedido
    ├── whistle.ts    o apito e os estados dele
    ├── replay.ts     a reprise da lista no fim da prova
    ├── hud.ts        cabeçalho, bolinhas de volta, cronômetro
    ├── effects.ts    moldura, rastro, espuma, destaque por silhueta
    └── audio.ts      WebAudio direto
~~~

**A `GameScene` não desenha.** Todo `createX` devolve
`{ container, ...métodos, destroy() }`. Identificadores em inglês, quase nenhum
comentário; só o texto que a criança lê fica em português.

~~~ts
type Phase = 'briefing' | 'editing' | 'carrying' | 'swimming' | 'locked' | 'paused'
~~~

Cuidados que já custaram caro em jogos deste projeto, e que este jogo encosta em
todos:

- **congelar com flag**, nunca `scene.pause()` — o `?` e a trava usam a mesma;
- **`gen` protegendo todo `await`** (`const gen = ++this.gen`, e
  `if (gen !== this.gen) return` depois de cada espera). A volta é uma sequência
  de esperas de 0,6 s: sem isso, uma trava no meio da volta anterior repinta a
  seguinte;
- **zona de toque é objeto solto da cena**, criada na posição definitiva. A tira
  recria as zonas a cada renumeração, então elas precisam ser **destruídas na
  mão** no `destroy()` — zona velha invisível come o toque da nova;
- `setVisible(false)` **não** desliga toque: o interruptor é
  `zone.input.enabled = false`;
- o painter da ficha não pode ser escalado se desenhar em coordenada de tela: ou
  desenha em torno de (0,0), ou anima só alpha e posição;
- **o saldo de vidas atravessa o `scene.restart`** (`lives: this.livesLeft`);
  só o recomeço do zero devolve cheias.

Reusar sem reimplementar: `createLoadingScreen`, `faseInicial`, `vidasIniciais`,
`createLives`, `createTutorial`, `showLevelComplete`, `FX`, `formatTime`,
`runtimeGameBridge`. `LEVELS` mora **só** em `data/levels.ts`.

### A conversa com a plataforma

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, com a primeira tira montada |
| `CORRECT_ANSWER` | uma vez por volta resolvida |
| `WRONG_ANSWER` | no primeiro erro de cada volta |
| `CHECKPOINT` | a cada prova, `progress: Math.round(feitas / total * 100)` |
| `GAME_COMPLETED` | ao fim de **cada** nível, `stage: this.level.level`, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca à mão — é do `createLives` |

`stage` é o **nível**, de 1 a 3, nunca índice de array. Importar
`runtimeGameBridge`, nunca `gameBridge`. Nada de `isFinalStage` no jogo.

---

## 15. Registro

| Onde | O que |
|---|---|
| `src/data/catalog.ts` | id **`077`**, slug `revezamento-em-lista`, module `EF05CO01/revezamento-em-lista`, skill `EF05CO01`, `years: [5]`, `order: 315`, `status: "draft"`, `points: 90`, categoria `"Pensamento Computacional"`, ícone 🏊, tags `["lista", "posição", "inserir", "remover"]` |
| `src/data/gameInstructions.ts` | três linhas novas, sob a chave `revezamento-em-lista` |
| `src/pages/GameDetailsPage.tsx` | acrescentar `revezamento-em-lista` ao `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` |
| `src/assets/games/EF05CO01/revezamento-em-lista/` | criar — ver [TEXTURAS.md](./TEXTURAS.md) |

> O `NEXT_FREE_ID` do `catalog.ts` estava desatualizado: dizia `073`, mas
> `073`–`076` já estavam em uso (o `076` é o Metrô Mirim). O jogo entrou com
> `077` e a constante foi corrigida para `078`. O erro aparece na hora: o
> `gameIndex` derruba a página com `[catalog] id duplicado`.

Descrição: *"A escalação é uma lista. Tire o cansado, ponha o reserva, mude de
lugar — e veja a prova nadar exatamente na ordem que você montou."*

As três linhas de instrução:

1. "A escalação embaixo é a sua lista: o 1º nada primeiro, o último fecha a prova."
2. "Antes de cada volta a técnica pede uma mudança — toque no nadador para pegar e no lugar onde ele entra, ou no banco para ele sair."
3. "Quando a lista estiver como ela pediu, toque no apito: a prova nada a sua lista, na ordem dela."

---

## 16. Critérios de aceite

### A criança entende sozinha

- [ ] a tela tem quatro coisas: o pedido, a água, a tira e o apito;
- [ ] quem pula o tutorial toca numa ficha antes de 6 segundos;
- [ ] a renumeração é vista acontecendo na primeira mudança, com número girando
      e arpejo;
- [ ] o pedido nunca passa de duas linhas de 34 caracteres;
- [ ] apertar o apito trancado **ensina** em vez de punir: cadeado balança, nada
      é emitido;
- [ ] dá para dizer de quem é cada fala: balão com rabinho é a técnica.

### O jogo funciona

- [ ] `npx tsc --noEmit` limpo;
- [ ] `npx eslint src/games/EF05CO01/revezamento-em-lista --ext .ts` limpo;
- [ ] `?embed=1&inline=1&stage=1&points=0&lives=3`, três níveis jogados, um
      `GAME_COMPLETED` por nível no console;
- [ ] `faseInicial(this, 1)` — nenhum nível fixo esquecido no código;
- [ ] a trava foi **vista acontecendo**, não só lida;
- [ ] as duas validações de `levels.ts` falham alto quando alguém escreve uma
      prova impossível;
- [ ] mudo funciona; o `?` congela e reabre; a retomada não dá salto;
- [ ] nenhum número de ponto, acerto ou erro na tela;
- [ ] nenhum gancho de depuração sobrando (`window.__algo`);
- [ ] nenhum comentário longo no código — a explicação mora aqui.

---

## 17. O que ficou para decidir

1. **A troca em dois movimentos** (`TROQUE o 1º com o 3º`) é a operação mais
   difícil do jogo. Se travar demais no Nível 2, a saída é a dica do segundo
   erro mostrar o **primeiro** movimento — e, se ainda assim travar, cortar a
   troca do Nível 2 e deixá-la só no 3.
2. **`o mais alto DA ÁGUA`** com o mais alto no banco: é a melhor ideia do Nível
   3 e a mais fácil de virar armadilha. Depende de ver criança jogando.
3. **A duração da volta.** 0,6 s por perna com 6 nadadores dá ~3,9 s. Se parecer
   longo na repetição, encurtar a perna antes de cortar a reprise — é a reprise
   que mostra a lista evoluindo.
4. **O reserva no banco desde o começo da prova**, mesmo antes de o pedido falar
   dele: ajuda a criança a entender que a lista pode crescer, mas pode virar
   convite a mexer no que não foi pedido. Fica ligado, e se atrapalhar, sai.

---

## 18. O que mudou na construção (Nível 1, entrega de teste)

Esta entrega tem **um nível com uma prova só**, como manda o INSTRUCOES para
avaliação. As três voltas são os três verbos — tirar, pôr, mudar de lugar — e a
terceira depende da renumeração da segunda.

| O que o plano dizia | O que ficou | Por quê |
|---|---|---|
| a tira mantém as fichas do mesmo tamanho e os pinos aparecem entre elas | com alguém na mão a tira **se reorganiza**: as fichas encolhem para 0,86 e os pinos ocupam o espaço aberto (`carrySlots`) | jogando, o pino nascia por baixo da ficha e só aparecia uma fresta: não dava para ver onde soltar |
| as fichas continuam tocáveis o tempo todo | com alguém na mão, a zona das fichas **desliga** | com `topOnly`, a zona da ficha comia o toque do pino que estava embaixo dela |
| o banco é um alvo separado | a ficha que está **sentada no banco** também vale como banco enquanto há alguém na mão | o primeiro teste falhou exatamente aí: a ficha do reserva cobria o banco e o toque não fazia nada |
| o pino é um retângulo aceso | o pino mostra **o número que a ficha vai receber** (`1º`, `2º`, `3º`) | é o que liga o gesto à renumeração, que é a ideia do jogo |
| "COLOQUE o novato no FIM" | "ponha a **DUDA** no FIM" | na volta 2 o banco já tinha duas pessoas (o cansado da volta 1), e "o novato" virou ambíguo. Nome é o que a ficha mostra |
| cronômetro por `this.time.now` | `Date.now()` | em `create()` o relógio da cena ainda é 0, e o painel de fim mostrava `214:04` |
| as vidas aparecem no canto | as vidas **contam mas não aparecem** | é decisão do projeto: `VIDAS_VISIVEIS = false` em `shared/hud/createLives.ts`, para os 49 jogos |

Verificado no navegador, com o laço bombeado à mão (o painel congela o Phaser
quando está oculto):

- as três voltas nadam, a tira renumera a cada mudança e a reprise do fim
  aparece com a frase-síntese;
- apitar sem mexer **é erro**: a volta nada errado, o balão diz o porquê, a tira
  volta ao estado do começo da volta e uma vida vai embora — uma só, mesmo
  errando de novo;
- apitar com alguém na mão não pune: o apito balança e o balão pede para soltar;
- os eventos saem certos: `GAME_READY`, `CHECKPOINT` em 0 / 33 / 67 / 100,
  `CORRECT_ANSWER` por volta e `GAME_COMPLETED` com `stage: 1`,
  `totalStages: 1` e `isFinalStage` calculado fora do jogo;
- `npx tsc --noEmit` e `npx eslint` limpos para a pasta do jogo;
- nenhum gancho de depuração ficou no código.

**Falta para o jogo inteiro:** as provas 2 e 3 do Nível 1 e os Níveis 2 e 3 —
com eles, `LEVELS.length` passa a 3 e o `totalStages` acompanha sozinho.

### Rodada 2 — "confuso e sem didática"

O primeiro teste do usuário reprovou a clareza. As correções:

| Problema | Correção |
|---|---|
| ninguém explicava o jogo: o tutorial era um balão com holofote por cima de uma tela que a criança ainda não entendia | o tutorial virou **cena própria** (`TutorialScene`), com a treinadora **de frente** explicando em cinco tempos, cada um com a animação do que ela acabou de falar |
| a volta passava em 0,6 s por nadador e ninguém via o que acontecia | a perna passou para **1,5 s**, o nadador ficou maior (180 px) e a braçada bate mais devagar |
| não dava para ligar a fila ao que nadava | **o número acompanha quem está na água** e **a ficha dele acende na tira**, ao mesmo tempo |
| texto demais no topo | a linha de objetivo saiu do HUD; sobraram as bolinhas de volta e o `?` |
| o `?` abria um texto diferente do tutorial | o `?` chama **a mesma cena**, por cima do jogo parado |

A folha da treinadora passou a ter **cinco quadros** (2500 × 550): 0–2 de perfil,
para o jogo — pedindo, aprovando e mandando parar —, e 3–4 de frente, para o
tutorial.

### Rodada 3 — o "pulo bizarro" do tutorial

O tutorial executava coisa do nada: a volta começava sem aviso, o dedo tocava
invisível, a tela mexia sozinha. Foram **três defeitos de fluxo**, não um:

| Defeito | Por que acontecia | Correção |
|---|---|---|
| **o botão PRÓXIMO era clicável invisível** | ele é filho da treinadora; quando ela saía de cena (`alpha` do pai = 0), o alpha **local** do botão continuava 1 — e o clique olhava o alpha local | o clique olha uma **flag** (`ready`) e o alpha **do pai**; sair de cena desliga a zona |
| **o dedo tocava sem aparecer** | `hide()` era um tween solto; começar um `tap()` antes de ele acabar deixava dois tweens brigando pelo mesmo alpha, e o toque saía transparente — a ficha voava "sozinha" | o dedo **mata o tween anterior** antes de qualquer movimento, `hide()` é esperável e o `tap()` sempre parte de uma posição definida |
| **a volta continuava nadando depois de a cena virar** | `pool.lap()` não tinha geração própria: PULAR no meio, ou um tempo novo, não paravam as pernas já engatilhadas | a piscina ganhou **geração e `abort()`**; cada perna confere antes de nadar, e `clearWater()` para os tweens e esconde todo mundo |

E a causa raiz das três: **a conferência de "este tempo ainda vale?" estava
espalhada por vinte linhas do roteiro**, e bastava esquecer uma. Agora cada
tempo é uma **lista de passos** e quem confere é o runner, num lugar só:

~~~ts
for (const step of this.script[index]) {
    if (gen !== this.gen) return
    await step()
}
~~~

Mais duas travas: `cut()` (água parada, dedo fora, botão apagado) roda no começo
de **todo** tempo e no fim do tutorial; e o `?` não abre a cena duas vezes
(`if (this.scene.isActive('TutorialScene')) return`).

Conferido no navegador: PULAR no meio da volta corta as pernas e entrega o jogo
limpo; três toques no `?` abrem uma cena só; e o tutorial inteiro roda com o
dedo visível em todos os toques.

### Rodada 4 — o ritmo é da criança, e a fase 1 é aula

**O tutorial corria.** A frase aparecia pronta e, menos de um segundo depois, os
nadadores já estavam na água: ninguém tinha tempo de ler o que ia ser mostrado.
A correção não foi aumentar uma espera — foi **tirar o relógio do caminho**:

- **toda fala é ESCRITA letra a letra** (`FX.type`), e um toque em qualquer
  lugar da tela completa a linha para quem lê rápido;
- **o tempo PARA depois da fala**, com um botão que diz o que vai acontecer —
  `QUEM SÃO?`, `VER A PROVA`, `E COMO?`, `APITAR!`. A animação só roda quando a
  criança toca. Primeiro ela lê, depois ela pede para ver;
- cada tempo fecha com uma frase de reforço do que acabou de acontecer
  (*"Viu? Eles nadaram na ordem da fila, um de cada vez."*).

No código isso é um passo novo do runner, `waitTap(label)`, que devolve uma
promessa resolvida pelo toque. O runner continua sendo o único lugar que
confere a geração.

**O jogo se monta na frente da criança.** Ao sair do tutorial, a prova entra
encenada: cada nadador entra na fila, o reserva senta no banco, a fila se
numera e só então a treinadora faz o primeiro pedido — que também é escrito
letra a letra. Entrar com a tela pronta era o que fazia parecer que o jogo já
estava no meio.

**A fase 1 é uma aula, não uma prova** (`guided: true` na primeira prova):

| Na prova guiada | Por quê |
|---|---|
| a mão da treinadora aparece sozinha depois de ~3 s sem toque, e mostra **o próximo movimento** — a mesma mão do tutorial, no lugar certo | ninguém fica travado sem saber o que fazer |
| depois de um erro ela vem em ~1 s | é o momento em que a criança mais precisa |
| **o erro não custa vida e não emite `WRONG_ANSWER`** | na plataforma um implica o outro, e aqui o erro é aula. A trava e o "por quê" continuam |
| qualquer toque cancela a mão | quem já sabe não é interrompido |

Fora da prova guiada a mão não existe, e a vida volta a valer.
