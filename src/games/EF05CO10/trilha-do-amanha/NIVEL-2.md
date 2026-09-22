# Trilha do Amanhã — Nível 2: "Leve a encomenda"

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) · [TEXTURAS.md](./TEXTURAS.md) · [IMPLEMENTACAO.md](./IMPLEMENTACAO.md)

O nível 1 está construído e testado. Este documento é só o que **muda** nele.

---

## 1. A virada, em uma frase

> **A voz atravessou o rio. A caixa não atravessa.**

No nível 1 o menino tinha um recado e a voz dele não alcançava. No nível 2 ele
tem uma **coisa** — um remédio, um saco de sementes, uma caixa de giz — e agora
nem a voz resolve: o objeto precisa chegar lá **inteiro**.

O que ele escolhe na oficina deixa de levar a palavra dele e passa a levar o
**peso**. E o que impede não é mais o limite da pessoa: é o **caminho**.

| | Nível 1 | Nível 2 |
|---|---|---|
| o que precisa chegar | um recado | uma encomenda |
| quem é o menino | **mensageiro** | **entregador** |
| o que ele escolhe | megafone · telefone · carta | **carroça · barco · avião** |
| onde está o limite | **na pessoa** (não escuta, não tem telefone, fecha hoje) | **no caminho** (não tem estrada, não tem água, é pesado, é hoje) |
| a abertura | ele grita, e o balão cai no meio do caminho | ele **atira a caixa** por cima do rio, e ela **cai na água** |

A abertura é o espelho exata da do nível 1, e é de graça: o rio já existe, o
"plof" já existe. A caixa volta para a mão dele molhada — **nada se perde**, como
manda o §9 do planejamento.

## 2. Por que transporte, e não outra coisa

O §7 do `PLANEJAMENTO` já apontava para aqui, e a habilidade agradece:

- **mundo do trabalho**: é a mesma profissão, e é ela que muda de tamanho. O que
  um entregador alcança a pé, com uma carroça e com um avião são três mundos;
- **evolução da sociedade**: carroça → barco → avião é a linha do tempo do
  transporte sem precisar de data nenhuma na tela;
- **nenhuma é melhor que a outra**: o avião é o mais novo e é o que **menos
  carrega**. É a regra do §2 do planejamento ("cada uma vence um limite
  diferente") funcionando de novo, e agora contra a intuição da criança.

O teste da bolinha continua valendo: troque os três veículos por bolinhas e o
jogo acaba, porque a escolha inteira sai de saber **que roda anda em estrada,
que casco anda em água e que asa passa por cima**.

## 3. Os três veículos

| | por onde vai | quanto leva | chega |
|---|---|---|---|
| **carroça** | só onde tem **estrada** | **pesado** | **amanhã** |
| **barco** | só onde tem **água** | **pesado** | hoje |
| **avião** | **por cima de tudo** | só o **leve** | agora |

Roda, vela e asa: três silhuetas que não se confundem a 72 px (§1 do
`TEXTURAS.md`).

```ts
type Via = 'estrada' | 'agua' | 'ar'

type Veiculo = {
  id: 'carroca' | 'barco' | 'aviao'
  nome: string
  via: Via
  levaPeso: boolean
  chegaEm: 'agora' | 'amanha'
}

type Destino = {
  id: string
  temEstrada: boolean
  temAgua: boolean
  prazo: 'agora' | 'amanha'
}

type Encomenda = { id: string; nome: string; pesada: boolean }
```

O veredito, na mesma forma do §8 do planejamento — a fase não guarda a resposta,
ela **cai da conta**:

```ts
function entregar(v: Veiculo, d: Destino, e: Encomenda): Entrega {
  if (v.via === 'estrada' && !d.temEstrada) return { kind: 'naoChegou', motivo: 'semEstrada' }
  if (v.via === 'agua' && !d.temAgua)       return { kind: 'naoChegou', motivo: 'semAgua' }
  if (e.pesada && !v.levaPeso)              return { kind: 'naoChegou', motivo: 'pesado' }
  if (d.prazo === 'agora' && v.chegaEm === 'amanha')
                                            return { kind: 'naoChegou', motivo: 'tarde' }
  return { kind: 'chegou', quando: v.chegaEm }
}
```

## 4. As três fases

| Fase | O que levar | Para quem, e onde | O limite | O que chega |
|---|---|---|---|---|
| **2.1** | o **remédio** (leve) | **Dona Zuma**, no posto do outro lado do rio | **não tem estrada** — o rio corta | barco ✔ · avião ✔ · carroça ✘ |
| **2.2** | o **saco de sementes** (pesado) | **Seu Nilo**, no galpão da estrada de terra | **o peso** | carroça ✔ · barco ✘ · avião ✘ |
| **2.3** | a **caixa de giz** (leve) | **Dona Rita**, na escola da serra, e a aula é hoje | **é no alto, e é hoje** | avião ✔ · carroça ✘ · barco ✘ |

Os quatro motivos aparecem: `semEstrada` na 2.1, `semAgua` e `pesado` na 2.2,
`tarde` e `semAgua` na 2.3. A validação do `levels.ts` exige todos, como no N1.

**A 2.1 aceita duas respostas**, igual à 1.1 — e é ali que mora o
"expressar-se": barco e avião chegam, mas um vai pela água e o outro passa por
cima, e a frase do fim diz qual diferença a criança viu.

### Os destinos, em dado

| | temEstrada | temAgua | prazo |
|---|---|---|---|
| posto (2.1) | não | **sim** | amanhã |
| galpão (2.2) | **sim** | não | amanhã |
| escola na serra (2.3) | **sim** | não | **agora** |

O galpão e a escola têm estrada; o que separa os dois é o relógio. É o que faz a
carroça falhar na 2.3 por **atraso**, e não por caminho — o limite novo da fase.

## 5. As frases do fim

Só as combinações que chegam precisam existir. Cada frase errada é verdadeira
sobre **outro veículo** ou **outra fase** (§7 do planejamento).

**2.1 · barco**
- *"O barco vai por onde a água vai."* ✔
- *"O barco passou por cima do rio."* — quem passa por cima é o avião
- *"O barco achou uma estrada até lá."* — quem precisa de estrada é a carroça

**2.1 · avião**
- *"O avião passou por cima do rio inteiro."* ✔
- *"O avião foi flutuando na água."* — quem vai na água é o barco
- *"O avião levou a carga mais pesada."* — ele só leva o que é leve

**2.2 · carroça**
- *"A carroça aguenta o peso, e tem estrada até lá."* ✔
- *"A carroça foi voando por cima do morro."* — quem voa é o avião
- *"A carroça chegou na mesma hora."* — ela é devagar; chegou no outro dia

**2.3 · avião**
- *"Só o avião chega hoje lá em cima."* ✔
- *"O avião subiu pela estrada da serra."* — ele foi por cima, não pela estrada
- *"O avião levou o mais pesado de todos."* — ele leva o leve

## 6. As falas de quem espera

| Motivo | Dona Zuma (posto) | Seu Nilo (galpão) | Dona Rita (escola) |
|---|---|---|---|
| `semEstrada` | "Aqui só se chega pela água." | — | — |
| `semAgua` | — | "Não passa rio nenhum aqui atrás." | "Aqui em cima não tem água." |
| `pesado` | — | "Isso não coube. Voltou pela metade." | — |
| `tarde` | — | — | "Chegou. Mas a aula foi ontem." |
| **chegou** | "O remédio chegou a tempo!" | "É isso! Já vou plantar." | "Giz novo! Pode começar a aula." |

## 7. O que muda no código

O nível 2 **não pede mecânica nova**. O laço é o mesmo: chamar, andar, entrar na
oficina, escolher, voltar, USAR, escolher a frase.

O que precisa mexer:

- **`types.ts`** — `Via`, `Veiculo`, `Destino`, `Encomenda`, e `MotivoFalha`
  ganha `semEstrada`, `semAgua`, `pesado`;
- **`data/levels.ts`** — a função `entregar` vira **duas**, uma por nível, ou uma
  só que recebe o par (invenção|veículo, pessoa|destino). *Recomendo duas
  funções separadas e um `Fase` com união discriminada por nível:* misturar os
  seis atributos numa conta só é o jeito mais rápido de a validação parar de
  pegar erro;
- **`data/veiculos.ts`** — novo, no molde de `invencoes.ts`;
- **`scenes/pessoa.ts`** — o espelhamento vira **por folha**. A do N1 veio virada
  para a esquerda e é espelhada em código; a nova vem virada para a direita e
  **não** deve ser espelhada (§11.5 do `IMPLEMENTACAO.md`);
- **`scenes/entrega.ts`** — três animações novas (§8 aqui);
- **`scenes/mundo.ts`** — desenha o `destinos.png` da fase na outra margem;
- **`scenes/BootScene.ts`** — as quatro folhas novas no `GRID`.

`LEVELS` passa a ter dois níveis, e `totalStages: LEVELS.length` continua certo
sozinho.

## 8. As três animações da entrega

A câmera já sabe acompanhar (§11.6 do `IMPLEMENTACAO.md`): a animação avisa o
alvo e a duração pelo `onTravel`, e a câmera vai junto, linear. O que muda é o
que ela acompanha — e agora é **um veículo atravessando o terreno**, que é o
assunto do nível.

| | O que se vê |
|---|---|
| **carroça** | ela sai rolando pela margem, as rodas girando. Sem estrada, ela **atola na beira do rio** e as rodas patinam; com estrada, ela some no horizonte e volta o aceno de longe |
| **barco** | desce a rampa, **balança na água** e cruza o rio deixando um V de espuma. Sem água, ele fica **arrastando na terra seca**, e para |
| **avião** | corre, **decola** e passa por cima de tudo, com a sombra correndo no chão embaixo. Pesado demais, ele corre, levanta um palmo e **volta a pousar** |

As três falhas são físicas e visíveis **antes** de qualquer texto — é a regra do
§9 do planejamento ("a criança vê o motivo antes de ler").

## 9. O cenário muda, e é isso que a criança vê primeiro

A trilha, o rio e a oficina continuam os mesmos — a criança já sabe o caminho, e
o que sobra de atenção vai para a escolha (§7 do planejamento).

**O que muda é a outra margem.** Cada fase põe um destino diferente lá, e o
destino carrega o próprio caminho:

- **2.1** — o **posto de saúde**, com a água batendo na frente dele;
- **2.2** — o **galpão**, com uma estrada de terra saindo dele e sumindo;
- **2.3** — a **escola na serra**, lá em cima, com a estradinha subindo em curva.

É uma folha só (`destinos.png`), e ela é o enunciado inteiro da fase em desenho:
olhando a outra margem, dá para dizer por onde se chega antes de ler qualquer
coisa.

A **hora do dia** também muda, como no N1, usando as três faixas do `ceu.png` que
já existem.

## 10. O tutorial

Um passo só, com a chave `ef05co10ta-l2` (§11 do planejamento):

> *"Agora não é recado, é coisa. E o caminho é que não deixa."*

## 11. As texturas novas

Quatro folhas, na ordem de prioridade. Os prompts inteiros, prontos para copiar,
estão no [TEXTURAS.md](./TEXTURAS.md), seções 12 a 15.

| # | Arquivo | Grade | Sem ela, o jogo… |
|---|---|---|---|
| 1 | `veiculos.png` | 3 × 2 de 256 | não tem escolha — é a decisão do nível |
| 2 | `pessoas-n2.png` | 2 × 3 de 256 | não tem para quem entregar |
| 3 | `destinos.png` | 3 × 1 de 512 | não tem cenário mudando; a outra margem fica vazia |
| 4 | `encomendas.png` | 3 × 1 de 256 | o "pesado" da 2.2 vira texto em vez de desenho |

As duas últimas têm reserva em `Graphics` e o nível continua jogável sem elas —
mas a 3 é justamente o que você pediu, o cenário mudando junto com a tecnologia,
e a 4 é o que faz o peso ser uma coisa que se vê.

## 12. O cartaz do fim do nível

Mesmo formato do N1, já simplificado: as três entregas lado a lado e uma frase.

> **O caminho mandava. Agora quem manda é o que a gente inventou.**

## 13. O que ficou para decidir

- **A carroça tem bicho?** Uma carroça puxada por um burrico diz "tecnologia
  antiga" na hora, mas é mais um personagem na folha e mais uma coisa para
  animar. O prompt está escrito **sem o bicho**, com um varal de puxar — se na
  arte ela ficar parecendo um carrinho de feira, o burrico entra.
- **O avião é de brinquedo?** Ele precisa parecer um monomotor de verdade, de
  trabalho, não um aviãozinho de papel. É o que separa "voar" de "fantasiar".
- **A 2.1 com duas respostas.** Se o nível inteiro ler como quiz, o remédio da
  2.1 vira **pesado** e sobra só o barco — mas aí se perde a única fase do nível
  em que a criança escolhe de verdade.
