# Cabo de Guerra da Verdade - EF03CO01

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

O robô levanta uma placa com o valor que ele quer — **VERDADEIRO** ou **FALSO** —
e uma frase com um buraco no meio. A criança escolhe a palavra que fecha o
buraco e faz a frase valer aquilo. Cada acerto puxa a corda para o lado dela.

> **O briefing NÃO passou no teste do irmão, e mudei a mecânica.** O jogo
> descrito — ler a frase e tocar em VERDADEIRO ou FALSO, com o NÃO destacado e
> cronômetro no nível 3 — já está publicado como **Tribunal do Verdadeiro ou
> Falso** (id 014), até com as mesmas frases oficiais da BNCC. O que mudou aqui
> é a **direção do raciocínio**: em vez de receber a frase e dizer o valor, a
> criança recebe o valor e monta a frase. Toda a moldura do briefing continua —
> arena, robô, corda, um toque só.

---

## 1. A habilidade, e os dois testes

> **(EF03CO01)** Associar os valores 'verdadeiro' e 'falso' a sentenças lógicas
> que dizem respeito a situações do dia a dia, **fazendo uso de termos que
> indicam negação**.

Objeto: **Lógica computacional.**

### O teste do irmão — o que reprovou o briefing

`EF03CO01` já tem jogo publicado: **Tribunal do Verdadeiro ou Falso** (id 014,
order 140). Ele lê a frase pronta, mostra o NÃO em destaque, oferece dois botões
gigantes VERDADEIRO e FALSO, tem `hasNegation` nos dados e cronômetro no nível
3. É, linha por linha, o briefing.

A saída está no próprio texto oficial, que tem dois verbos: **associar** valores
a sentenças, e **fazer uso** de termos de negação. O Tribunal pegou o primeiro.
Este pega o segundo.

| Jogo | O que a criança recebe | O que ela faz | A metade da habilidade |
|---|---|---|---|
| Tribunal do Verdadeiro ou Falso | a frase pronta | diz se vale V ou F | **associar** valor a sentença |
| Cabo de Guerra da Verdade | o valor pedido e a frase com um buraco | escolhe a palavra que faz a frase valer aquilo | **fazer uso** do termo de negação |

O Tribunal nunca pede para a criança *usar* o NÃO; este nunca pergunta o valor
de uma frase pronta.

### O teste da bolinha

> **Troque as frases por bolinhas coloridas. O jogo muda?**

Muda, e de um jeito mais forte que o briefing original. Ali, quem decidisse no
chute tinha 50% e podia chutar sempre o mesmo botão. Aqui a resposta depende de
**duas coisas ao mesmo tempo** — se o fato é verdadeiro e qual valor foi pedido:

| O fato em si | O robô pede | A palavra certa |
|---|---|---|
| verdadeiro | VERDADEIRO | **é** |
| verdadeiro | FALSO | **não é** |
| falso | VERDADEIRO | **não é** |
| falso | FALSO | **é** |

É uma tabela de verdade de bolso, e é exatamente "lógica computacional". Nenhuma
das duas palavras é a resposta mais frequente, então decorar não funciona: o
mesmo `não é` que acerta uma rodada erra a seguinte.

---

## 2. O laço

```
o robô levanta a placa: VERDADEIRO ou FALSO
→ a frase entra com um buraco no meio:  "O fogo [ ____ ] gelado"
→ duas cartas grandes embaixo:  É  |  NÃO É
→ a criança toca numa
   ↳ a frase fica com o valor pedido → a corda puxa para ela (+10)
   ↳ não fica → TRAVA: o balão explica em uma linha, o robô puxa um passo,
                 e a MESMA frase volta para o fim da fila
→ enquanto ela pensa, a barra do robô enche; cheia, ele puxa um passo
   e recomeça — a frase continua ali, esperando
→ corda no fim do lado dela: partida ganha
```

Controle: **um toque numa das duas cartas.** Nada mais. Sem arrastar, sem mira.

---

## 3. O que mudou do briefing, e por quê

| Briefing | Aqui | Motivo |
|---|---|---|
| dois botões VERDADEIRO / FALSO | duas cartas **É / NÃO É** | o outro já é o Tribunal |
| 6 a 8 sentenças por partida | **5 por nível** | o INSTRUCOES limita a 5 rodadas por nível |
| "placar final com taxa de acerto" | corda, troféu e estrelas | nenhum número na tela |
| robô responde certo em 6-8 s e ganha a rodada | a barra do robô **puxa um passo** e recomeça | ver abaixo |
| `NENHUM peixe voa (F — peixe-voador!)` | fora | ver abaixo |

**O relógio do robô não pode ganhar a rodada.** Se responder depois dele
significasse rodada perdida, a criança que pensa devagar nunca puxaria a corda —
e pensar devagar é o que este jogo pede. Aqui a barra cheia custa **um passo de
corda**, não a decisão: a frase continua na tela, esperando a resposta. Pressa
tira terreno; nunca tira a vez.

**O peixe-voador saiu.** O próprio briefing manda "sem pegadinhas de
interpretação" e depois propõe `NENHUM peixe voa` como falsa por causa do
peixe-voador. Uma criança de 8 anos que responde "verdadeiro" ali raciocinou
certo com o mundo que ela conhece, e seria punida por isso. Curiosidade boa,
pergunta ruim.

---

## 4. Clareza para criança

| Conceito | Como a tela mostra |
|---|---|
| "o robô quer esta verdade" | a placa dele, grande, verde para VERDADEIRO e laranja para FALSO |
| "falta uma palavra aqui" | o buraco na frase pulsa devagar |
| as duas escolhas | duas cartas gigantes, lado a lado, sempre nas mesmas posições |
| "acertei" | a corda anda, a torcida levanta, o marcador central passa da linha |
| "não é isso" | o balão do robô com uma linha, e a frase montada errada aparece riscada |
| progresso | a corda, e só ela |

A palavra de negação é **sempre da mesma cor** — a mesma em que ela aparece na
carta, na frase montada e no balão da explicação. É a única cor que se repete na
tela.

---

## 5. A grade: 1280 × 720

Coluna "No celular" = grade × 0,30 (aparelho de 390 px).

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 – 72 | pílula do nível, recado, `?` em (1218, 36), vidas | `?` toque 122 | 37 |
| Placa do robô | 92 – 176 | VERDADEIRO ou FALSO, em caixa alta | placa 300 × 84 | 90 × 25 |
| Frase | 196 – 330 | a frase com o buraco, centralizada | fonte 40 · buraco 210 × 76 | 12 · 63 × 23 |
| Arena | 330 – 520 | criança à esquerda, robô à direita, corda entre eles | figura 190 | 57 |
| Corda | 470 – 510 | trilho, marcador e as marcas dos passos | marcador 54 | 16 |
| Cartas | 545 – 690 | **É** e **NÃO É** | carta 420 × 130 | 126 × **39** |
| Barra do robô | 700 – 712 | o tempo de pensar dele | altura 12 | 4 |

As duas cartas ficam a **80 px uma da outra** — dedo de criança erra alvo
vizinho, e são as duas únicas coisas tocáveis da tela.

**O que não pode acontecer aqui:** nada pode cobrir a frase. Ela é o objeto da
decisão, e é a primeira coisa que a criança lê. O balão da explicação entra
ABAIXO dela, na faixa da arena, nunca por cima.

---

## 6. Níveis e rodadas

Três níveis, **cinco frases cada**. A frase que for errada volta para o fim da
fila, então o nível acaba quando as cinco tiverem sido vencidas.

| Nível | O robô pede | As cartas | A barra do robô | O que cresce |
|---|---|---|---|---|
| 1 | sempre **VERDADEIRO** | `é` / `não é` | 9 s | só o fato muda: às vezes o certo é `é`, às vezes `não é` |
| 2 | VERDADEIRO **e** FALSO | `é` / `não é` | 8 s | as quatro combinações da tabela |
| 3 | VERDADEIRO e FALSO | `sempre` / `nunca` · `todo` / `nenhum` | 7 s | o mesmo raciocínio com outras palavras de negação |

A escada tem um degrau claro por nível:

| Nível | O que decide a resposta | O que deixa de bastar |
|---|---|---|
| 1 | o fato é certo ou errado? | — |
| 2 | o fato **e** o valor pedido | olhar só a frase |
| 3 | reconhecer a negação em outra palavra | procurar a palavra "não" |

O nível 3 é onde `nunca` e `nenhum` deixam de ser vocabulário e viram operador:
`O peixe [nunca] anda na rua` é a mesma conta de `O peixe [não] anda na rua`.

> Construir só o **nível 1** primeiro, por regra do projeto: um nível validado
> antes de expandir.

---

## 7. As regras, em código

```ts
export interface Statement {
    id: string
    /** A frase partida no buraco: 'O fogo', 'gelado'. */
    before: string
    after: string
    /** O fato, sem negação nenhuma, é verdadeiro? */
    factValue: boolean
    /** O que o robô pede nesta rodada. */
    asked: boolean
    explain: string
}

export type Token = 'plain' | 'negated'

/** A conta inteira do jogo: negar inverte, e é só isso. */
export const valueOf = (fact: boolean, token: Token) =>
    token === 'negated' ? !fact : fact

export const solves = (s: Statement, token: Token) =>
    valueOf(s.factValue, token) === s.asked
```

O veredito é **função do estado no instante do toque**, e não um campo `correta`
guardado na carta: a mesma carta `não é` acerta quando o fato é falso e o pedido
é VERDADEIRO, e erra quando o fato é falso e o pedido é FALSO.

Pontuação interna — nada disso vira texto na tela:

| Situação | Evento | Pontos | Vida | Corda |
|---|---|---|---|---|
| acertou de primeira | `CORRECT_ANSWER` | +10 | — | +1 para a criança |
| acertou a frase que tinha voltado | `CORRECT_ANSWER` | +5 | — | +1 para a criança |
| errou | `WRONG_ANSWER` | 0 | **−1** | +1 para o robô |
| a barra do robô encheu | — | 0 | — | +1 para o robô |

A barra cheia **não** emite `WRONG_ANSWER` e não custa vida: demorar não é
errar. Ela só tira terreno.

---

## 8. O erro, e a corda

**A TRAVA.** A frase montada errada aparece por inteiro, riscada, com o balão do
robô dizendo em uma linha o que aconteceu — `Com o NÃO, a frase vira falsa.` A
carta certa **não** é revelada. A frase volta para o fim da fila e a criança
segue para a próxima; quando ela voltar, vale +5. Depois de **dois** erros na
mesma frase, a carta certa pisca — é o padrão do catálogo.

**A corda nunca faz perder.** O robô puxa, mas a corda para na marca dele: não
existe derrota por cabo de guerra. Quem reprova é a vida, como em todos os 49
jogos, e a corda é o **progresso** — cinco marcas, uma por frase vencida.

Isso é decisão, não esquecimento. Um cabo de guerra que a criança pode perder
por lentidão criaria duas formas de falhar, e a segunda puniria justamente o
tempo de pensar que a habilidade exige.

O erro não pode ser:

| Não fazer | Motivo |
|---|---|
| revelar a carta certa na trava | ela responde a próxima no automático |
| som de buzina, robô rindo | o robô é adversário simpático, não valentão |
| descartar a frase errada | a criança sai sem ter vencido aquela |
| pegadinha de interpretação | erra quem raciocinou certo |

---

## 9. Feedback

| Momento | Visual | Som |
|---|---|---|
| a frase entra | as duas metades deslizam e o buraco pulsa | clique leve |
| toque na carta | a carta afunda e a palavra voa para o buraco | pop curto |
| a frase se completa | ela é lida inteira por meio segundo, com a negação na cor dela | — |
| acertou | a corda estala e anda, a criança se inclina, a torcida levanta | puxão + torcida |
| acertou em sequência | a corda anda com faísca e o marcador brilha | tom subindo |
| errou | a frase riscada, o robô puxa devagar, balão explicando | corda esticando, grave |
| barra do robô cheia | o robô dá um passo e o marcador recua uma marca | tique seco |
| frase que voltou, vencida | ela sai da fila com selo | plim de coleção |
| fim do nível | a corda inteira vem para o lado da criança, confete | fanfarra |

O robô **pensa em voz alta** com um tique-taque suave enquanto a barra enche. É
o único som contínuo do jogo, e ele para no instante do toque.

---

## 10. Tutorial

**Dois passos no nível 1, um em cada um dos outros.** Todos com o dedo batendo
no lugar, frase de uma linha.

O tutorial acontece dentro do jogo: a primeira frase já está na tela, parada, e
é nela que o holofote acende.

| Nível | Frase | O que o holofote acende |
|---|---|---|
| 1 | `O robô quer uma frase VERDADEIRA.` | a placa dele |
| 1 | `Escolha a palavra que faz isso.` | as duas cartas, com o dedo na certa |
| 2 | `Agora ele pede as duas coisas.` | a placa, mostrando FALSO |
| 3 | `NUNCA e NENHUM também negam.` | as cartas novas |

O `?` reabre e pausa. Sem narração.

---

## 11. Conteúdo pronto — nível 1

O robô pede sempre VERDADEIRO. Cinco frases, e o fato alterna: em três a criança
usa `é`, em duas usa `não é`.

| Frase | O fato | Carta certa | Explicação da trava |
|---|---|---|---|
| O gato ___ um animal | verdadeiro | `é` | `O gato é animal mesmo. Sem o NÃO.` |
| O fogo ___ gelado | falso | `não é` | `Fogo é quente. Precisa do NÃO.` |
| A água ___ molhada | verdadeiro | `é` | `A água molha. Sem o NÃO.` |
| O sol ___ visto de noite | falso | `não é` | `De noite não tem sol. Precisa do NÃO.` |
| A semana ___ de sete dias | verdadeiro | `é` | `São sete dias mesmo. Sem o NÃO.` |

Regra de conteúdo: **fato concreto do cotidiano, verificável por uma criança de
8 anos, sem exceção escondida.** Nada de "todo pássaro voa" (pinguim) nem de
"nenhum peixe voa" (peixe-voador).

Os níveis 2 e 3 usam o mesmo banco de fatos, com o pedido invertido e com
`sempre/nunca` e `todo/nenhum` no lugar das cartas — 5 frases cada, 15 no total.

---

## 12. O que é código, e o que é textura

**Textura:** a criança, o robô e o fundo da arena. Só isso.

**Código (Graphics):** a placa do robô, o cartão da frase, o buraco, as duas
cartas, a corda, o trilho, o marcador, a barra de pensar, o balão, o risco da
frase errada, o confete, a torcida (silhuetas simples que sobem e descem).

A corda é `Graphics` por um motivo prático: ela **muda de posição a cada rodada**
e precisa esticar entre dois pontos que se movem. PNG de corda não estica sem
borrar a trama.

---

## 13. Antes da arte existir

Criança e robô sem textura viram dois **bonecos de reserva em Graphics** — um
círculo de cabeça, um corpo arredondado, e a cor que os separa. O jogo é
jogável e ajustável antes do primeiro PNG, e as texturas entram por
`import.meta.glob`, nunca por `import` estático.

Ordem de produção:

1. o esqueleto jogável com bonecos de reserva e o nível 1;
2. `dupla.png`, a folha da criança e do robô;
3. `bg-arena.png`, se o fundo em `Graphics` ficar pobre.

---

## 14. Registro

```
src/games/EF03CO01/cabo-de-guerra-da-verdade/
src/assets/games/EF03CO01/cabo-de-guerra-da-verdade/
```

| Campo | Valor |
|---|---|
| `id` | `059` |
| `slug` | `cabo-de-guerra-da-verdade` |
| `module` | `EF03CO01/cabo-de-guerra-da-verdade` |
| `skill` | `EF03CO01` |
| `years` | `[3]` |
| `tags` | `["lógica", "negação", "disputa", "toque"]` |
| `order` | `145` |
| `points` | `55` |
| `icon` | `🪢` |

Também em `src/data/gameInstructions.ts` e no conjunto
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`.

---

## 15. Arquivos

```
types.ts             Statement, Token, Outcome, LevelDef
data/theme.ts        cores, fontes
data/layout.ts       W/H, placa, frase, arena, corda, cartas
data/statements.ts   as frases, valueOf() e solves()
data/levels.ts       LEVELS: as rodadas
scenes/BootScene.ts  glob + corte da folha + createLoadingScreen
scenes/GameScene.ts  orquestração. Não desenha nada.
scenes/arena.ts      fundo, torcida e o chão
scenes/fighters.ts   a criança e o robô, com as poses
scenes/rope.ts       corda, trilho e marcador
scenes/board.ts      a placa do robô e o cartão da frase com o buraco
scenes/cards.ts      as duas cartas
scenes/thinkBar.ts   a barra de pensar do robô
scenes/hud.ts        a barra fina do topo
scenes/audio.ts      WebAudio, sem arquivo
```

A `GameScene` não desenha: se ela precisar de um `fillRoundedRect`, falta um
módulo em `scenes/`.
