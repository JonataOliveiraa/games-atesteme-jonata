# Achados e Perdidos — planejamento

**EF15CO03 · 1º ao 5º ano · Pensamento Computacional · Lógica computacional**

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

---

## 1. O jogo em uma frase

**Um bichinho perdido está no balcão. Pendure no cartaz as cartas que dizem a
VERDADE sobre ele, até o cartaz ficar completo.**

~~~text
 ●●○○○                                                        ?
───────────────────────────────────────────────────────────────
                            │   ┌──────── ACHEI! ────────┐
      ┌──┐   régua          │   │                        │
      │▓▓│    ▌             │   │   ▢ cor     ▢ chapéu   │
      └──┘   🐶  ▌          │   │                        │
   ──────────────────       │   └────────────────────────┘
        o balcão            │      os campos, apagados
───────────────────────────────────────────────────────────────
   ┌──────────┐  ┌──────────────┐  ┌──────────┐
   │ 🔵 AZUL  │  │ 🚫🟢 E 🎩    │  │ 🎩 CHAPÉU│      ← a mão, 3 cartas
   └──────────┘  └──────────────┘  └──────────┘
~~~

Um gesto só: **tocar numa carta da mão**. Nada de arrastar, nada de configurar.

## 2. A habilidade

> **(EF15CO03)** Realizar operações de negação, conjunção e disjunção sobre
> sentenças lógicas e valores 'verdadeiro' e 'falso'.

O exemplo oficial da BNCC é justamente o par `Cinco é maior que seis. (Falso)` /
`Cinco NÃO é maior que seis. (Verdadeiro)` — uma frase e o seu avesso, julgadas
contra um fato.

Aqui o fato **não é conhecimento prévio, é o bichinho na tela**. Toda carta é
decidida olhando: `é azul`, `NÃO tem chapéu`, `é verde E tem chapéu`. Isso é o
que faz o jogo servir ao 1º ano — não existe nada para saber de antes, só para
olhar. E é o que separa este jogo do Circuito da Verdade, onde a criança precisa
saber que o peixe vive na água antes de julgar a frase.

**Teste da bolinha:** troque os bichinhos por bolinhas iguais. O jogo acaba —
sem atributos visíveis não há termo para avaliar. Os atributos **são** os
termos, e é por isso que a habilidade está na mecânica e não na arte.

## 3. Como isso não vira os dois jogos irmãos

| | Portões Lógicos (EF05CO03) | Circuito da Verdade (EF15CO03) | **Achados e Perdidos** |
|---|---|---|---|
| A criança | **julga** uma frase que já está na tela | **julga** uma frase escrita | **escolhe o que dizer** entre as frases da mão |
| Quantas respostas certas | exatamente uma, sempre | uma | **várias** — a pergunta é *o que ainda falta dizer* |
| O fato vem de | a criaturinha que marcha | conhecimento de mundo | o bichinho parado no balcão |
| O E × OU aparece | entre duas ondas, na foto dos currais | como portão de circuito | **dentro de uma jogada só**: quantos campos a carta acende |
| O que sobra na tela | dois currais cheios | o parque aceso | **o cartaz que ela escreveu** |
| Ritmo | a criaturinha marcha, tem tempo | fase a fase | **nenhum relógio** |
| Público | 5º ano | 1º ao 5º | 1º ao 5º |

A frase curta: lá a criança **responde**; aqui ela **afirma**. E afirmar exige
decidir o valor verdade *antes* de abrir a boca — que é a operação que a
habilidade pede.

## 4. O que mudou do briefing, e por quê

O briefing era um trunfo: duelo contra um robô, melhor de 5, desempate por
medalha (E > OU > simples) e compra de 1 carta entre 2. Cinco coisas saíram, e
nenhuma por gosto.

**1. O duelo, o desempate por medalha e o placar de rodadas.** A regra "se as
duas forem verdadeiras vence a mais exigente" produz a pior frase que este jogo
poderia dizer a uma criança: *a sua carta é verdadeira e você perdeu a rodada*.
"Exigência" é uma propriedade meta-lógica — quantos mundos satisfazem a frase —
e ela não está visível na mesa; do ponto de vista da criança a regra é sorteio.
Junte a isso o pedido de **nada de placares** e o duelo fica sem espinha: sem
contagem de rodadas, o robô não tem o que ganhar.

O que entra no lugar da "exigência" é a mesma lição, mas visível: **a carta com
E acende dois campos do cartaz de uma vez; a simples acende um.** A criança
conta com o olho, e ninguém precisa da palavra exigente.

**2. O relógio de 20 s.** A trava manda olhar termo a termo; o relógio manda
correr. Quem travou é justamente quem precisa de tempo, e era ele quem o
relógio punia. Neste jogo não existe tempo — como no Mistério do Arquivo Vivo.

**3. O deck-building (comprar 1 de 2, "a que combina com mais cenários").** É
raciocínio sobre o conjunto de mundos possíveis, um degrau acima de avaliar uma
frase contra uma figura, e sem retorno imediato: a consequência apareceria três
rodadas depois. Na prática a criança escolheria a mais bonita. A mão de 3 cartas
continua, e virou outra coisa — o recurso escasso da fase (§7).

**4. As medalhas de ouro/prata/bronze.** Vocabulário de prêmio para uma
propriedade lógica. O aprendizado provável seria *"jogue sempre a de ouro"*,
inclusive quando ela é falsa.

**5. O NÃO de frase inteira.** Não existe aqui: o NÃO só gruda num termo (§5).
O NÃO que vira a frase toda do avesso é o nível 3 dos Portões Lógicos, e
misturar os dois numa carta pequena de celular era ambiguidade garantida.

### Os quatro consertos pedidos

| # | Problema | Como o jogo resolve |
|---|---|---|
| 2 | `NÃO é verde E tem chapéu` é ambíguo: *(não verde) E chapéu* ou *não(verde E chapéu)* | o NÃO **nunca é palavra solta**: é um risco vermelho colado no ícone do termo, dentro da moldura daquele termo (§5) |
| 3 | o OU do dia a dia é exclusivo — *"mas ele não é verde!"* | quando os dois lados são verdadeiros, **os dois campos acendem**, e o balão diz `o OU aceita um, e aceita os dois` (§6) |
| 4 | mão sem nenhuma carta verdadeira: a criança perde sem ter errado | **toda mão fecha o cartaz inteiro** — garantido por teste, não por revisão a olho (§10) |
| 5 | `é azul` se refere ao bicho ou ao chapéu? | o cartaz tem **um campo por atributo**, e o acessório **nunca tem cor de atributo**: chapéu e óculos são sempre do mesmo marrom e do mesmo preto em todos os bichos (§9) |

## 5. A carta, e onde mora o NÃO

Uma carta é **uma fileira de termos**, nunca uma frase corrida. Cada termo é uma
moldura com ícone grande em cima e palavra embaixo; o operador fica numa
moldura própria, menor, entre os dois.

~~~text
  ┌──────────────────────────────────────┐
  │  ┌─────────┐   ┌───┐   ┌─────────┐   │
  │  │   🟢    │   │ E │   │   🎩    │   │
  │  │  ╱╱╱╱   │   └───┘   │         │   │    NÃO É VERDE  E  TEM CHAPÉU
  │  │NÃO VERDE│           │ CHAPÉU  │   │
  │  └─────────┘           └─────────┘   │
  └──────────────────────────────────────┘
       ▲ o risco vermelho fica DENTRO da moldura do termo
~~~

Três regras que não se negociam:

- **o risco vermelho atravessa o ícone**, e a palavra vem com `NÃO` na frente,
  em vermelho. Dois canais, porque o símbolo sozinho é vocabulário que a criança
  de 6 anos ainda não tem — é a lição do §14 dos Portões Lógicos, onde a tarja
  com "NÃO" em 13 px virava 4 px reais no celular;
- **o NÃO nunca fica fora de uma moldura de termo.** É isso, e só isso, que
  resolve a ambiguidade de escopo;
- **a fileira é montada por largura medida e encolhe para caber.**
  `NÃO TEM CHAPÉU E TEM ÓCULOS` é bem mais largo que `É AZUL`, e numa carta de
  tamanho fixo a palavra escorre para fora.

**A carta cresce para ser julgada.** Tocada, ela sobe da mão até o centro, acima
do balcão, e cresce — é lá que o ✓ e o ✗ aparecem, num tamanho que se lê. Julgar
dentro da carta pequena da mão seria pedir para a criança ler o que decide a
jogada no menor objeto da tela.

## 6. O OU, que é o conserto nº 3

O OU acende **o campo de cada lado que deu ✓**:

| Carta | O bicho | Resultado | O que acende | O balão |
|---|---|---|---|---|
| `é grande OU tem óculos` | grande **e** de óculos | verdadeira | **tamanho e óculos** | `os dois! o OU fica feliz com os dois` |
| `é amarelo OU tem chapéu` | amarelo, sem chapéu | verdadeira | só a cor | `basta um lado ser verdadeiro` |
| `é grande OU tem chapéu` | pequeno, sem chapéu | **falsa** | nada | `nenhum dos dois lados vale` |

A fase 3 do nível 2 existe só para a primeira linha dessa tabela acontecer: a
criança joga um OU esperando um campo e **acende dois**. É a correção do OU
exclusivo feita com festa, e não com bronca.

## 7. O laço

~~~text
o bichinho pousa no balcão · o cartaz abre com os campos apagados
→ a criança TOCA NUMA CARTA: ela sobe e cresce
→ os termos são conferidos no bichinho, um por um: ✓ ou ✗
→ VERDADEIRA: a carta voa para o cartaz e acende o campo de cada termo ✓
→ FALSA: TRAVA — o termo que falhou fica cinza, a carta volta para a mão
→ cartaz completo: ele sobe para o mural da praça, e vem o próximo bichinho
~~~

**A mão de 3 é o recurso da fase.** Não existe compra e não existe reposição: o
cartaz de hoje se resolve com estas três cartas. É daí que nasce a necessidade
do E — no nível 2 o cartaz tem 3 campos e **uma das três cartas é falsa**, então
as duas verdadeiras precisam dar conta de três campos, e isso só fecha se uma
delas acender dois. Ninguém explica o que é conjunção; a criança precisou de
uma. É a mesma engenharia da fita de cinco espaços da Maratona do Algoritmo.

## 8. Níveis, historinhas e cartazes

Cada nível abre com **uma historinha de três falas curtas, por cima do exemplo
animado de 5 s** — nunca sobre tela parada, e pulável a qualquer toque. Ela diz
o que vai ser discutido naquele nível, e o botão `?` repete.

### Nível 1 — "Achei um bichinho!" · o valor verdade e o NÃO

> 🗨️ *Um bichinho perdido apareceu no balcão.*
> 🗨️ *Para o dono reconhecer, o cartaz só pode dizer a verdade.*
> 🗨️ *Às vezes é mais fácil dizer o que ele **não** é.*

Dois campos por cartaz. Cartas de um termo só, com e sem NÃO.

| # | Bichinho | Campos | A mão |
|---|---|---|---|
| 1.1 | Bolota — azul, chapéu, grande | cor · chapéu | `é azul` · `tem chapéu` · `é vermelho` ✗ |
| 1.2 | Tico — azul, óculos, pequeno | cor · óculos | `NÃO é verde` · `tem óculos` · `tem chapéu` ✗ |
| 1.3 | Nina — verde, grande | cor · chapéu | `é verde` · `NÃO tem chapéu` · `tem óculos` ✗ |
| 1.4 | Pepe — vermelho, óculos, grande | cor · óculos | `NÃO é azul` · `tem óculos` · `NÃO tem óculos` ✗ |
| 1.5 | Mel — amarelo, chapéu, óculos, grande | cor · chapéu | `é amarelo` · `tem chapéu` · `NÃO é amarelo` ✗ |

A 1.3 é o exemplo da BNCC de pé: `NÃO tem chapéu` é informação boa para o
cartaz, e é verdadeira exatamente porque ele não tem. A 1.4 e a 1.5 põem o NÃO
do lado errado, que é onde a trava ensina.

### Nível 2 — "Duas coisas de uma vez" · o E e o OU

> 🗨️ *Hoje o balcão amanheceu cheio.*
> 🗨️ *Estas cartas dizem duas coisas de uma vez: o **E** quer as duas.*
> 🗨️ *O **OU** se contenta com uma — e fica feliz com as duas.*

Três campos por cartaz. A **régua** entra no balcão a partir daqui, porque
`é pequeno` só é julgável com um padrão ao lado — sem ela, "pequeno" depende de
comparar com um bicho que não está mais na tela. A ideia é emprestada do marco
de altura dos Portões Lógicos.

| # | Bichinho | Campos | A mão |
|---|---|---|---|
| 2.1 | Juju — verde, chapéu, óculos, pequeno | cor · chapéu · óculos | `é verde E tem chapéu` (2) · `tem óculos` · `é grande` ✗ |
| 2.2 | Rui — amarelo, pequeno | cor · chapéu · tamanho | `é amarelo OU tem chapéu` (1) · `NÃO tem chapéu` · `é pequeno` |
| 2.3 | Pepe — vermelho, óculos, grande | cor · óculos · tamanho | `é grande OU tem óculos` (**2**) · `NÃO é verde` · `é pequeno` ✗ |
| 2.4 | Mel — amarelo, chapéu, óculos, grande | cor · chapéu · óculos | `tem chapéu E tem óculos` (2) · `é amarelo` · `é verde E tem chapéu` ✗ |

A 2.2 mostra o OU com um lado falso e a carta ainda verdadeira. A 2.3 é a festa
dos dois lados. A 2.4 mostra um termo falso derrubando o E inteiro.

### Nível 3 — "Dois bichos quase iguais" · o NÃO dentro do E e do OU

> 🗨️ *Chegaram dois bichinhos parecidos de uma vez.*
> 🗨️ *Agora as cartas misturam o **NÃO** com o E e com o OU.*
> 🗨️ *Leia a carta inteira antes de pendurar.*

Quatro campos por cartaz. Duas cartas de dois termos fecham; a terceira é falsa.

| # | Bichinho | A mão |
|---|---|---|
| 3.1 | Tico — azul, óculos, pequeno | `NÃO é verde E é pequeno` · `NÃO tem chapéu E tem óculos` · `é grande OU tem chapéu` ✗ |
| 3.2 | Nina — verde, grande | `é verde E é grande` · `NÃO tem chapéu E NÃO tem óculos` · `NÃO é verde OU tem óculos` ✗ |
| 3.3 | Mel — amarelo, chapéu, óculos, grande | `NÃO é azul E tem chapéu` · `tem óculos E é grande` · `NÃO tem chapéu OU é pequeno` ✗ |
| 3.4 | Pepe — vermelho, óculos, grande | `NÃO é amarelo E é grande` · `NÃO tem chapéu E tem óculos` · `é pequeno OU tem chapéu` ✗ |

As cartas falsas do nível 3 são todas OU com **os dois lados falsos** — a única
forma de um OU ser falso, e a que a criança precisa ver para não sair achando
que OU é sempre verdadeiro.

> **A primeira entrega vai com o NÍVEL 1 só**, conforme a regra de teste do
> [INSTRUCOES.md](../../INSTRUCOES.md). Os níveis 2 e 3 ficam escritos aqui e em
> `data/levels.ts`, sem cena construída.

## 9. Os bichinhos

Oito, com atributos fixos. Um bichinho que muda de atributo entre cartazes
destrói a comparação que a criança faz de cabeça quando ele reaparece.

| # | Nome | Cor | Chapéu | Óculos | Tamanho |
|---:|---|---|:---:|:---:|---|
| 0 | Bolota | azul | sim | não | grande |
| 1 | Tico | azul | não | sim | pequeno |
| 2 | Juju | verde | sim | sim | pequeno |
| 3 | Nina | verde | não | não | grande |
| 4 | Pepe | vermelho | não | sim | grande |
| 5 | Tati | vermelho | sim | não | pequeno |
| 6 | Mel | amarelo | sim | sim | grande |
| 7 | Rui | amarelo | não | não | pequeno |

**O acessório nunca tem cor de atributo.** O chapéu é sempre do mesmo marrom e
os óculos são sempre do mesmo preto, nos oito. É o conserto nº 5 feito na arte:
com um chapéu vermelho na cabeça de um bicho azul, `é azul` e `NÃO é vermelho`
ficariam ambíguos, e nenhuma regra de código resolveria isso.

O outro meio do conserto nº 5 está no cartaz: ele tem **um campo por atributo**,
com o símbolo do atributo apagado dentro (gota de tinta, chapéu, óculos, régua).
A criança vê o que ainda falta dizer, e vê sobre **o que** cada campo fala.

**O campo aceso mostra o que foi dito, inclusive quando é um NÃO.** A 1.3 fecha
com o campo do chapéu aceso e o chapéu **riscado de vermelho** dentro dele: o
cartaz diz `não usa chapéu`, que é informação boa para quem procura. O risco no
campo é o mesmo risco da carta, no mesmo lugar do ícone — é assim que a criança
liga a carta que jogou ao que ficou escrito.

## 10. As regras, em código

Os níveis moram em `data/levels.ts`, e esse é o único lugar.

~~~ts
type Campo = 'cor' | 'chapeu' | 'oculos' | 'tamanho'
type Valor = 'azul' | 'verde' | 'vermelho' | 'amarelo'
           | 'chapeu' | 'oculos' | 'grande' | 'pequeno'

interface Termo { valor: Valor; negado: boolean }

interface Carta {
  id: string
  left: Termo
  op?: 'e' | 'ou'      // ausente = carta de um termo só
  right?: Termo
}

interface Cartaz {
  id: string
  bicho: string        // id em data/bichos.ts
  campos: Campo[]      // 2 no nível 1, 3 no 2, 4 no 3
  mao: string[]        // 3 ids de carta
}
~~~

**Nenhum gabarito nos dados.** O valor de cada carta é derivado no instante do
toque, contra o bichinho da fase:

~~~ts
const campoDe = (v: Valor): Campo => /* azul|verde|… → 'cor', grande|pequeno → 'tamanho', … */

const valeTermo = (t: Termo, b: Bicho) =>
  t.negado ? !tem(b, t.valor) : tem(b, t.valor)

function avaliar(c: Carta, b: Bicho): boolean {
  const l = valeTermo(c.left, b)
  if (!c.op || !c.right) return l
  const r = valeTermo(c.right, b)
  return c.op === 'e' ? l && r : l || r
}

// Uma carta verdadeira acende o campo de CADA termo que deu ✓.
function acende(c: Carta, b: Bicho): Campo[] {
  if (!avaliar(c, b)) return []
  const ts = [c.left, c.right].filter(Boolean) as Termo[]
  return ts.filter(t => valeTermo(t, b)).map(t => campoDe(t.valor))
}
~~~

Essa regra única — *acende o campo de cada termo verdadeiro* — vale igual para o
NÃO, para o E e para o OU, e é dela que sai o comportamento do §6 sem nenhum
caso especial escrito à mão.

### O teste que garante o conserto nº 4

Obrigatório, roda sobre `LEVELS` inteiro:

1. **todo cartaz fecha**: existe um subconjunto das 3 cartas da mão, todas
   verdadeiras para o bichinho, cuja união de `acende()` cobre `campos` inteiro;
2. **nenhum campo sobra**: nenhuma carta verdadeira da mão acende um campo que
   não está em `campos` — senão o cartaz ganharia uma linha que ele não pediu;
3. **duas cartas verdadeiras da mesma mão não acendem o mesmo campo**, para o
   caso "isso o cartaz já diz" ser raro (§11);
4. **cada nível tem pelo menos um cartaz com termo negado na mão** — a 1.1 é a
   fase do tutorial e é a única isenta, de propósito: o primeiro contato mostra
   o laço sem o NÃO em cima.

As doze mãos das §8 foram conferidas contra a tabela do §9 e passam nos quatro.

Mão conferida a olho envelhece na primeira vez que alguém mexer num bichinho.
Este teste é o que transforma "sempre tem uma opção de vencer" em garantia.

## 11. O erro, e os dois casos que não são erro

**Existe um erro só no jogo inteiro: pendurar uma carta falsa.** É mentir no
cartaz — e cartaz que mente traz o dono errado.

1. a carta **para no ar**, grande, e a avaliação acontece na frente da criança:
   cada termo pisca contra o bichinho e recebe ✓ ou ✗;
2. o termo que falhou **fica cinza com ✗**, e o carimbo `FALSO` aparece
   **abaixo** da fileira, nunca por cima — quem lê FALSO sem conseguir reler a
   frase perdeu a metade que ensina;
3. balão de **uma linha, menos de 35 caracteres**, dizendo a causa e nunca a
   solução: `tem chapéu, mas não é azul`;
4. a carta volta para a mão com um ✗ pequeno no canto — ela não some, e a
   criança pode reconferir por que aquela não servia;
5. `WRONG_ANSWER` e uma vida, por `createLives`;
6. **depois de 2 cartas falsas no mesmo cartaz, a carta certa pisca.**

| Balão | Quando |
|---|---|
| `faltou o chapéu dele` | E com um termo falso |
| `nenhum dos dois lados vale` | OU com os dois falsos |
| `o NÃO troca: dá o contrário` | o termo falhou por causa do NÃO |

### Os dois casos que não custam nada

- **olhar, e não jogar.** Não há relógio. O bichinho boceja, coça a orelha e
  espera o tempo que for.
- **uma carta verdadeira que não acrescenta nada** (todos os termos ✓ já estão
  no cartaz): volta com o balão `isso o cartaz já diz`, sem vida, sem
  `WRONG_ANSWER` e sem trava. O teste 3 do §10 faz disso um caso raro, mas o
  estado existe e precisa estar tratado.

Pontos pelo `runtimeGameBridge`: **+10** no cartaz fechado sem nenhuma carta
falsa, **+5** depois de trava. **Nenhum número na tela**, em lugar nenhum — o
que a criança vê é o cartaz enchendo, as bolinhas de fase e as estrelas no fim.

## 12. A tela

Grade fixa **1280 × 720** com `Phaser.Scale.FIT`. A coluna da direita é o
tamanho real aproximado num celular de 390 px (fator ≈ 0,30).

| Faixa | Região | Conteúdo | Tamanho | No celular |
|---|---|---|---:|---:|
| Cabeçalho | `0–80` | bolinhas de fase · `?` em `(1216, 44)` | `?` raio 30 | 18 px |
| O balcão | `x 40–580`, `y 100–440` | o bichinho, a régua atrás dele, a atendente ao lado | bichinho 280 px | 84 px |
| O cartaz | `x 620–1240`, `y 100–440` | faixa `ACHEI!`, o retrato pequeno, os campos | campo 150 × 150 | 45 px |
| A mão | `y 470–700` | 3 cartas, centros em `x 240 / 640 / 1040` | carta 380 × 230 | 114 px |
| Julgamento | centro, `y 120–400` | a carta tocada, ampliada | carta 620 × 300 | 186 px |

**Nada que a criança precise ver fica abaixo de 130 px nesta grade**, e o alvo
de toque é sempre a carta inteira — 380 px de largura, 114 px reais.

Os campos do cartaz ficam em fileira (2 e 3 campos) ou em grade 2 × 2 (4
campos), e a posição sai da **mesma conta** que leva o termo da carta até lá.
Campo desenhado por um número e carta animada por outro é como se desencaixa no
celular.

**Não existe texto fixo além do `?`.** Sem pílula de nível, sem rótulo de fase,
sem relógio: as bolinhas dizem onde ela está.

## 13. Feedback

| Momento | Visual | Som |
|---|---|---|
| o bichinho chega | pousa no balcão quicando, olha para os lados | plim curto |
| toque na carta | sobe e cresce para o centro | plup |
| conferência do termo | o chip pisca e **a parte do bichinho pulsa junto** — a cor, o chapéu, os óculos, a régua | tique agudo no ✓, grave no ✗ |
| operador resolve | a moldura do `E`/`OU` acende verde ou vermelha **depois** dos dois termos | clique |
| carta verdadeira | voa até o cartaz, o campo acende com a figura do termo | encaixe |
| OU com os dois lados ✓ | **os dois campos acendem em sequência**, com brilho extra | dois tiques subindo |
| carta falsa | para no ar, termo cinza com ✗, carimbo `FALSO` embaixo, volta girando devagar | nota grave curta, nunca agressiva |
| 2 falsas no mesmo cartaz | a carta certa pisca na mão | — |
| cartaz completo | o cartaz sobe para o mural da praça e o bichinho comemora | fanfarra curta |
| fim do nível | o mural com os cartazes do nível, estrelas 90 / 70 | selo |

**Sem narração.** Balão e pictograma, como no resto do catálogo. Áudio 100 %
sintetizado em WebAudio, sem arquivo, respeitando o `mute-audio` do `EventBus`.

## 14. Tutorial

Três passos, durante o exemplo animado, com as falas do §8. Uma mão desenhada
toca a carta verdadeira; ela sobe, acende o termo, voa para o campo. Depois toca
a falsa; ela mostra o ✗ e volta. Fim.

O `?` pausa o jogo, repete a demonstração e devolve a cena onde estava.

## 15. O que é textura e o que é código

| Textura (PNG) | Código (`Graphics`) |
|---|---|
| `bichos.png` — os 8 bichinhos, um quadro cada, atributos desenhados | **o cartaz e todos os campos** |
| `atendente.png` — a atendente do balcão, 4 estados | **as cartas, os termos, o risco do NÃO, os carimbos** |
| `bg-praca.png` — a praça atrás, com o meio vazio | **o balcão, a régua, o cadeado, o confete, o mural do fim** |
| a capa do catálogo | a UI de plataforma |

**O balcão e a régua também são `Graphics`**, e pelo mesmo motivo: são
geometria que a regra lê — o pé do bichinho e a marca da régua saem da mesma
conta, em vez de honrarem um contrato de alinhamento com um PNG de fundo.

O cartaz é `Graphics` por engenharia, não por economia: os campos precisam
nascer da mesma conta que faz a carta voar até eles (§12). E as cartas são
`Graphics` porque a fileira encolhe por largura medida (§5) — texto dentro de
PNG não encolhe.

Carregamento por `import.meta.glob` com lista `WANTED` no `BootScene`, **nunca**
`import` estático: arte faltando não pode derrubar o `vite build`. Antes da arte
existir, o bichinho é um corpo arredondado na cor do atributo, com chapéu e
óculos em blocos e o tamanho pela escala — e o jogo é jogável inteiro assim.

## 16. Telemetria

- acerto por operador: **NÃO, E, OU**, separados;
- em carta falsa, **qual termo** falhou, e se falhou por causa do NÃO;
- quantos cartazes fechados sem nenhuma carta falsa;
- quantas vezes a criança jogou um OU e **acendeu dois campos** — é o indicador
  de que o OU inclusivo passou.

Olhar e não jogar **não emite nada**.

## 17. Registro

| Item | Valor |
|---|---|
| Pasta | `src/games/EF15CO03/achados-e-perdidos` |
| Assets | `src/assets/games/EF15CO03/achados-e-perdidos` |
| Slug | `achados-e-perdidos` |
| Módulo | `EF15CO03/achados-e-perdidos` |
| Título | `Achados e Perdidos` |
| Gênero | Cartas |
| Ícone | `🔎` |
| `order` | `445` (o Circuito da Verdade é 440, o Arquiteto das Missões é 450) |
| `years` | `[1, 2, 3, 4, 5]` |
| `tags` | `["lógica", "não", "e/ou", "verdadeiro e falso"]` |

**No README, a linha `EF15CO03 · Trunfo da Lógica · R2 · Cartas / deck-building
leve` muda** para `Achados e Perdidos · R2 · Cartas`.

Antes de considerar pronto:

- [ ] o teste do §10 passando sobre `LEVELS` inteiro;
- [ ] jogar o nível 1 inteiro com o mouse, do zero, sem chamar função por dentro;
- [ ] conferir que olhar sem jogar não emite `WRONG_ANSWER`;
- [ ] conferir que a carta "que o cartaz já diz" não tira vida;
- [ ] `?` pausa e devolve a cena no mesmo ponto;
- [ ] exemplo animado pulável em qualquer instante dos 5 s;
- [ ] entrada em `src/data/catalog.ts` e em `src/data/gameInstructions.ts`;
- [ ] slug em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`;
- [ ] `faseInicial` no `BootScene.create()`, e `?stage=2` abrindo no nível 2;
- [ ] vidas por `createLives`, com o saldo atravessando o `scene.restart`;
- [ ] `runtimeGameBridge` conferido no console com
      `?embed=1&inline=1&stage=1&points=0&lives=3`;
- [ ] `npx tsc --noEmit` e `npx eslint src/games/EF15CO03/achados-e-perdidos --ext .ts`.

## 18. Cinco travas, para quem mexer depois

1. **O NÃO só existe grudado num termo.** Um NÃO de frase inteira traz de volta
   a ambiguidade de escopo que o §5 comprou, e o jogo é para o 1º ano.
2. **Nenhum relógio, em nível nenhum.** A trava manda pensar; relógio manda
   correr; as duas coisas juntas viram aflição.
3. **Nenhum número na tela** — nem pontos, nem rodadas, nem placar de duelo.
4. **A mão é 3 e não se repõe dentro do cartaz.** É a escassez que faz a criança
   precisar do E. Repor a mão devolve o jogo a "jogue a carta fácil e siga".
5. **O gabarito não entra nos dados.** Tudo sai de `avaliar()` e `acende()`; uma
   tabela bicho × carta seria uma cópia que envelhece calada.

## 19. Histórico

| Data | O que aconteceu |
|---|---|
| 21/09/2026 | Briefing "Trunfo da Lógica": duelo contra robô, melhor de 5, desempate por medalha, compra de 1 entre 2. |
| 21/09/2026 | **Esta versão.** Saíram o duelo, o placar, o relógio, as medalhas e o deck-building (§4); entraram o cartaz, a mão como recurso escasso e os quatro consertos pedidos. O nome mudou junto: sem trunfo, não há trunfo no título. |
