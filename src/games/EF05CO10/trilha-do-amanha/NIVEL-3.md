# Trilha do Amanhã — Nível 3: "Veja por mim"

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) · [NIVEL-2.md](./NIVEL-2.md) · [TEXTURAS.md](./TEXTURAS.md) · [IMPLEMENTACAO.md](./IMPLEMENTACAO.md)

Os níveis 1 e 2 estão construídos e testados. Aqui está só o que **muda**.

---

## 1. O terceiro verbo

O jogo virou uma frase de três palavras, uma por nível:

| | o problema | o que ele escolhe | onde está o limite |
|---|---|---|---|
| **N1** | **falar** não chega | megafone · telefone · carta | na **pessoa** |
| **N2** | **levar** não atravessa | carroça · barco · avião | no **caminho** |
| **N3** | **ver** não alcança | luneta · lupa · detector | no que **precisa ser visto** |

> **Do outro lado do rio alguém faz uma pergunta que os olhos dele não respondem.**

O mensageiro vira **os olhos de outra pessoa** — que é, de novo, a mesma
profissão crescendo. E o eixo é novo de verdade: nos dois primeiros níveis a
coisa **ia até lá**; aqui ela **vem até ele**.

## 2. Por que instrumentos de ver

- **mundo do trabalho**: a parteira que precisa saber se a semente presta, o
  encanador que precisa achar o cano — são perguntas de trabalho, não de escola;
- **evolução da sociedade**: luneta, lupa e detector são três jeitos de esticar
  um sentido que o corpo tem e que não basta;
- **o exemplo oficial da BNCC vira jogada**, e não cartaz — ver o §5.

O teste da bolinha continua valendo: troque os três por bolinhas e acaba, porque
a escolha sai de saber que **luneta encurta distância, lupa aumenta tamanho e
detector atravessa o que cobre**.

## 3. Os três instrumentos (e o quarto)

| | encurta a distância | aumenta o miúdo | atravessa o que cobre |
|---|:---:|:---:|:---:|
| **luneta** | **sim** | não | não |
| **lupa** | não | **sim** | não |
| **detector** | não | não | **sim** |
| **celular** *(só na 3.3)* | **sim** | **sim** | não |

A luneta **não** aumenta o que está na mão, e a lupa **não** alcança o outro lado
do rio. É o par que a criança vai querer trocar, e é a lição.

```ts
type Instrumento = {
  id: 'luneta' | 'lupa' | 'detector' | 'celular'
  alcanca: boolean
  amplia: boolean
  atravessa: boolean
}

type Alvo = { id: string; distante: boolean; miudo: boolean; coberto: boolean }

function enxergar(i: Instrumento, a: Alvo): Entrega {
  if (a.distante && !i.alcanca)   return { kind: 'naoChegou', motivo: 'longeDemais' }
  if (a.miudo && !i.amplia)       return { kind: 'naoChegou', motivo: 'pequenoDemais' }
  if (a.coberto && !i.atravessa)  return { kind: 'naoChegou', motivo: 'escondido' }
  return { kind: 'chegou', quando: 'agora' }
}
```

## 4. As três fases

Tudo acontece **da margem**, como nos outros dois níveis: ele não anda até o
alvo, ele olha dali. O que muda é **onde está o que precisa ser visto**.

| Fase | A pergunta | O alvo, e onde | O limite | O que vê |
|---|---|---|---|---|
| **3.1** | *"Essa semente que eu te dei ainda presta?"* | a semente, **na mão dele** | **miúda** | lupa ✔ |
| **3.2** | *"O cano d'água passa por aí? Onde eu cavo?"* | o cano, **debaixo do chão da margem** | **coberto** | detector ✔ |
| **3.3** | *"Tem passarinho no ninho lá do meu lado?"* | o ninho, **no alto, na outra margem** | **distante** | luneta ✔ · celular ✔ |

Os três motivos aparecem: `pequenoDemais` na 3.1, `escondido` na 3.2,
`longeDemais` na 3.3.

Cada fase dá uma **mirada de câmera diferente** — a mão dele, o chão aos pés
dele, o outro lado do rio — e isso sai de graça: a câmera do §11.6 do
`IMPLEMENTACAO.md` já aceita um alvo e um tempo.

## 5. A 3.3 é onde a BNCC fecha

**Na 3.3 a bancada troca.** A lupa sai e entra o **celular de hoje**:

> luneta ✔ · celular ✔ · detector ✘

Duas respostas, como a 1.1 e a 2.1 — e desta vez a diferença entre elas **é o
assunto da habilidade**. O exemplo oficial da `EF05CO10` (um aparelho só fazendo
o que vários faziam) deixa de ser um cartaz no fim e vira **a última escolha que
a criança faz no jogo**.

A frase certa de cada uma diz a diferença:

- *"A luneta trouxe o galho lá de longe para perto dos meus olhos."*
- *"O celular fez o que a luneta faz, e ainda guardou a foto."*

Trocar a bancada **não custa código**: `fase.itens` já é por fase desde o N2.

## 6. O botão OLHAR, e o visor

O `USAR` da margem vira **`OLHAR`** — mesmo lugar, mesmo tamanho, mesma zona de
toque. É uma linha na tabela `ACTION` do `controles.ts`, e o teto de 4 alvos
continua de pé.

Ao tocar, a câmera vai até o alvo e **abre um visor redondo**: a tela escurece e
sobra um círculo, com a moldura do instrumento escolhido.

| | A moldura | O som |
|---|---|---|
| **luneta** | dois círculos que se juntam num, com um retículo fino em cruz | um "clique" de foco |
| **lupa** | um círculo com aro grosso e um cabo saindo na diagonal | um "tin" curto |
| **detector** | um círculo esverdeado com ondas concêntricas pulsando | um **bip** que acelera perto do alvo |
| **celular** | um retângulo de cantos vivos com os cantinhos de enquadramento | o "clec" do obturador |

**Dentro do círculo:**

- **acertou** — entra o quadro de `visoes.png` da fase, nítido e grande: o bicho
  na semente, o cano riscado debaixo da terra, o passarinho no ninho. É a
  "camada do mundo" que o §7 do `PLANEJAMENTO` prometeu;
- **errou** — o mesmo círculo, mas com o que o instrumento errado dá: uma mancha
  borrada e pequena demais. Tudo `Graphics`, nada de arte nova. **A criança vê o
  motivo antes de ler**, que é a regra do §9.

Depois do visor, a câmera fecha em quem perguntou e ela responde — o mesmo tempo
de sempre.

## 7. A abertura

O espelho das outras duas. Ele faz binóculo com as mãos, aperta os olhos, e o
`!` sobe:

> *"Daqui eu não vejo nada!"*

E a **cena de abertura** (§14.5 do `IMPLEMENTACAO.md`) roda na 3.1 como nos
outros níveis, com um tempo a mais: depois de atravessar o rio, a câmera
**tenta fechar no alvo e não consegue** — ela chega perto e a imagem fica
borrada. É o problema do nível em um movimento de câmera.

## 8. O que muda no código

Pouco, e é de propósito:

- **`types.ts`** — `Instrumento`, `Alvo`, e `MotivoFalha` ganha `longeDemais`,
  `pequenoDemais`, `escondido`;
- **`Item` ganha `cols` e `rows`** — a folha do N3 tem **quatro** colunas, e hoje
  três lugares chamam `cutSheet(item.sheet, 3, 2)` com o número na mão. É a única
  mudança estrutural do nível;
- **`data/instrumentos.ts`** — novo, no molde de `veiculos.ts`;
- **`data/levels.ts`** — `enxergar()` e `faseOlhar()`, mais o terceiro `LEVELS`;
- **`scenes/controles.ts`** — o rótulo `OLHAR` na tabela `ACTION`;
- **`scenes/visor.ts`** — novo: o recorte redondo, as quatro molduras e a arte
  revelada. É o único arquivo de verdade novo do nível;
- **`scenes/entrega.ts`** — `play` desvia para o visor quando o item é um
  instrumento.

`LEVELS.length` passa a 3 e `totalStages` continua se ajustando sozinho.

## 9. As pessoas: a volta dos três do N1

**Recomendo não gerar folha nova.** No N3 quem pergunta são **a mãe, o Bento e o
seu Ari** — os mesmos do nível 1, agora do outro lado da mesma margem, e agora
são eles que precisam dele.

Três razões:

1. **fecha a história**: o menino que não conseguia falar com eles virou os olhos
   deles. Três níveis, os mesmos vizinhos, uma trajetória;
2. **custa zero de arte** — `pessoas.png` já está medida e funcionando;
3. o quadro "respondendo" de cada um **já serve**: eles levantam os braços quando
   ele acerta a resposta.

O Bento, que lê e não escuta, é quem pede o **cano debaixo da terra** (3.2) — a
pergunta dele chega por escrito numa placa, e isso amarra o que a 1.2 ensinou.

Se você quiser rostos novos assim mesmo, o prompt é o mesmo do `pessoas-n2.png`
(§13 do `TEXTURAS.md`) com outro elenco — mas eu não gastaria a folha aqui.

## 10. As texturas novas

Duas, e a segunda é pequena. Os prompts estão no
[TEXTURAS.md](./TEXTURAS.md), seções 16 e 17.

| # | Arquivo | Grade | Sem ela, o jogo… |
|---|---|---|---|
| 1 | `instrumentos.png` | **4 × 2** de 256 | não tem escolha — é a decisão do nível |
| 2 | `visoes.png` | 3 × 1 de 512 | o visor abre vazio: some a recompensa de ter escolhido certo |

A `visoes.png` tem reserva em `Graphics` (uma silhueta chapada dentro do
círculo), então o nível roda sem ela — mas ela é justamente o "uau" do nível, o
momento em que o mundo mostra uma camada que não estava lá.

## 11. O cartaz do fim

Este é o último nível, então o cartaz fecha o jogo inteiro. As três entregas dos
três níveis não cabem lado a lado; o que cabe é **um verbo por coluna**:

| falar | levar | ver |
|---|---|---|
| a carta na mão da mãe | o barco chegando no posto | a luneta apontada para o galho |

E embaixo, uma linha só:

> **Inventaram um jeito para cada coisa que o corpo não dá conta.**

E o último quadro, o exemplo oficial devolvido à criança: **o celular que ela
acabou de usar na 3.3**, com três setinhas — falar longe, levar o recado,
enxergar o que está longe. Agora ele cabe ali porque **ela já usou**, e não porque
o jogo afirmou.

## 12. O que ficou para decidir

- **O detector é de metal ou é um "detector" genérico?** Um detector de metal é
  concreto e a criança conhece de praia — mas um cano d'água de PVC não é metal.
  O prompt está escrito para um **detector de cano**, com a bobina redonda de
  sempre; se ficar estranho, o alvo da 3.2 vira uma **moeda** ou uma **chave**.
- **O celular na bancada do N3.** Ele é o fecho da habilidade, mas é também a
  única coisa moderna do jogo inteiro, e pode roubar a cena. Se na primeira
  jogada a criança escolher o celular nas três fases sem olhar, ele sai da 3.3 e
  volta para o cartaz.
- **Três fases sem duas respostas, menos a 3.3.** A 3.1 e a 3.2 têm resposta
  única — diferente do N1 e do N2, onde a primeira fase já aceitava duas. Aqui a
  escolha dupla foi guardada para o fim de propósito, porque ela vale mais como
  fecho do jogo do que como abertura do nível.
