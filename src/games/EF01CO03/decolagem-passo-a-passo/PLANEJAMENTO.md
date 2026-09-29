# Decolagem Passo a Passo — planejamento

Jogo **093** · EF01CO03 · 1º ano · 3ª rodada · **3 níveis × 3 missões**.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF01CO03.md`
(a original, cartões na régua). O plano do pôster de adesivos foi abandonado e está em
`docs/rodada-3/arquivo/`. Padrão: `docs/rodada-3/PADRAO-R3.md`. Molde: a Garra dos Grupos.

---

## 1. O jogo em uma frase

No centro está a missão: um foguete, um balão ou uma pipa, prontos para subir.
À esquerda ficam os **cartões-passo embaralhados**, no máximo 4. A criança toca
os cartões **na ordem em que precisam acontecer**. Cada cartão certo voa para a
**régua**, que enche de baixo para cima, e a cena executa aquele passo na hora.
Com a régua cheia a missão sobe, e a régua acende passo a passo com o letreiro
**SEU ALGORITMO!**

Um gesto só: tocar. Um passo fora de ordem, ou o cartão que não é da missão,
mostra em 1 s **por que não dá**, e a partida acaba.

## 2. A habilidade e os irmãos

> **(EF01CO03)** Reorganizar e criar sequências de passos em meios físicos ou
> digitais, relacionando essas sequências à palavra 'Algoritmos'.

| O que a BNCC pede | Onde acontece |
|---|---|
| **criar** uma sequência | N1–N3: escolher, cartão a cartão, o que vem agora |
| o que **pertence** à sequência | N2: o cartão intruso fica na bancada |
| **reorganizar** | N3: duas ordens funcionam, e no fim a régua mostra a outra também decolando |
| relacionar à palavra **algoritmo** | o replay da régua com o letreiro, no fim de cada missão |

**O teste da bolinha:** troque o foguete por bolinhas e a ordem perde o motivo.
Aqui a ordem vem do **mundo**: o motor não liga sem combustível, e a pipa não
sobe sem linha. É isso que a mini-cena do erro mostra.

**Irmãos:** a *Oficina dos Algoritmos* arrasta cartões para uma ordem gravada, e
o *Pulo Programado* monta o programa inteiro e só depois executa. Na Decolagem
**cada passo executa no toque**, e o erro aparece no passo.

**Um nível, um assunto (o gesto é sempre o mesmo):**

| Nível | Assunto | Cartões |
|---|---|---|
| N1 | criar a sequência (1 ordem) | 3 passos |
| N2 | o que **não** pertence | 3 passos + 1 intruso |
| N3 | **duas ordens** servem (reorganizar) | 4 passos |

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; o exemplo virou o guia visual (§9); o fim é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo | 1280 × 720, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia | PADRAO-R3 |
| TRAVA: cadeado, "ainda não!", destrava, +5, pulso após 2 travas | **errou, perdeu**: a mini-cena cômica de 1 s e depois `WRONG_ANSWER` + `hud.lives.loseAll()` | decisão do usuário (29/09/2026), igual à Garra |
| N1 = Missão Foguete | N1 = **Foguete, Balão e Pipa**, com 3 passos cada | 3 missões por nível |
| N2 = **4 passos** + 1 extra | N2 = **3 passos + 1 intruso** (4 cartões), nas 3 missões | decisão do usuário: teto de 4 alvos |
| N2 foguete: abastecer → fechar a porta → contagem → decolar | abastecer → fechar a porta → **contagem 3-2-1**; a contagem é o último cartão e dispara a decolagem | 3 passos; "decolar" é o resultado |
| intruso do N2: guarda-chuva | foguete **abrir guarda-chuva** (ficha) · balão **escovar os dentes** · pipa **tomar sorvete** | intrusos óbvios para o 1º ano: nada a ver com voar |
| N3 = **5 passos** + troca na régua | N3 = **4 passos com 2 ordens válidas**, **sem troca** | decisão do usuário: teto de 4 alvos e sem gesto novo |
| N3: 2 ordens = "abastecer antes ou depois de fechar a porta" | um **par de passos independentes** por missão; no foguete é **pôr o capacete ↔ abastecer** | no N1 fechar a porta antes de abastecer é erro (`door-hose`); o mundo não muda de regra entre níveis |
| N3: "o letreiro comenta" | no fim do N3, **sempre**: os 2 cartões do par trocam de lugar na régua, e o letreiro vira **TAMBÉM FUNCIONA!** | mostra as duas ordens, sem pedir gesto novo |
| letreiro longo | **SEU ALGORITMO!** | poucas palavras |
| "botão nova missão" | a próxima missão entra sozinha | igual à Garra |
| texto de fase no HUD | só bolinhas; a pílula `NÍVEL n/3` fica | memória *fase sem texto no HUD* |
| sons | WebAudio | PADRAO-R3 |
| telemetria | só `CORRECT_ANSWER`/`WRONG_ANSWER` | a bridge não tem os campos |
| arte | **vetor de conto**; capa **com título**; 2 folhas novas para o N2/N3 | decisão do usuário |

## 4. O laço

```
missão na cena · 3 ou 4 cartões embaralhados · régua vazia (3 ou 4 vagas)
      ▲                         │ toque num cartão
      │                         ▼
      │   é o intruso? ─ sim ─► mini-cena do intruso → WRONG_ANSWER + loseAll → done
      │                         │ não
      │          o passo pode acontecer agora? (canDo)
      │         ┌───────────────┴────────────────┐
      │        sim                              não
      │  cartão voa para a próxima vaga    mini-cena do passo que falta
      │  e a cena executa o passo; +10     → WRONG_ANSWER + loseAll → done
      │         │
      │   régua cheia? ── não ──► espera o próximo toque
      │         │ sim
      │   3-2-1 (se ainda não houve) · decolagem · replay · SEU ALGORITMO!
      │   N2: o intruso sai da bancada
      │   N3: o par troca de lugar na régua · TAMBÉM FUNCIONA!
      └── próxima missão, ou fim do nível → showLevelComplete (autoAdvance até o N3)
```

## 5. A tela (1280 × 720)

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | faixa 0–82 | pílula `NÍVEL n/3` + 3 bolinhas; `?` à direita |
| bancada | coluna x 70–310. 3 cartões: 240 × 150 em y 240 / 410 / 580. 4 cartões: o cartão encolhe para 120 de altura, em y 180 / 320 / 460 / 600 | cada baia isolada; a palavra nunca fica abaixo de 17 px |
| cena | centro (660, 430) | foguete · balão · pipa, com a criança sempre na cena |
| régua | coluna x 970–1210. 3 vagas (N1, N2) em y 600 / 450 / 300; 4 vagas (N3) de 110 em y 630 / 510 / 390 / 270 | enche de baixo para cima |
| letreiro | faixa em (660, 150) | só no replay |
| contagem | (660, 170) | 3-2-1 no céu livre |

**Densidade:** no máximo **4 alvos** (os cartões) mais o `?`, e eles diminuem a
cada acerto. No N2, o intruso é o único cartão que sobra na bancada, e sai
sozinho no fim.

## 6. Níveis, missões e a regra (`data/levels.ts`)

A ordem **não é gravada**. Cada passo diz do que ele precisa (`needs`). Um
passo pode acontecer quando tudo de que ele precisa já foi feito. Quando não
pode, o **primeiro `needs` que falta** escolhe a mini-cena. O intruso nunca
pode acontecer, e tem a mini-cena dele.

### As 9 missões (← = precisa de)

| # | Cena | Passos e `needs` | Ordens válidas | Intruso |
|---|---|---|---|---|
| **N1·1** | foguete | abastecer · fechar a porta ← abastecer · apertar o botão ← abastecer, porta | 1 | — |
| **N1·2** | balão | encher o balão · prender a cesta ← encher · soltar as cordas ← encher, cesta | 1 | — |
| **N1·3** | pipa | amarrar a linha · correr ← linha · soltar a pipa ← linha, correr | 1 | — |
| **N2·1** | foguete | abastecer · fechar a porta ← abastecer · **contagem 3-2-1** ← abastecer, porta | 1 | **abrir guarda-chuva** |
| **N2·2** | balão | encher o balão · prender a cesta ← encher · soltar as cordas ← encher, cesta | 1 | **escovar os dentes** |
| **N2·3** | pipa | amarrar a linha · correr ← linha · soltar a pipa ← linha, correr | 1 | **tomar sorvete** |
| **N3·1** | foguete | **pôr o capacete** · abastecer · fechar a porta ← abastecer, capacete · apertar o botão ← abastecer, porta | **2**: capacete ↔ abastecer | — |
| **N3·2** | balão | **pôr o capacete** · encher o balão · prender a cesta ← encher, capacete · soltar as cordas ← encher, cesta | **2**: capacete ↔ encher | — |
| **N3·3** | pipa | **pôr a rabiola** · amarrar a linha · correr ← linha, rabiola · soltar a pipa ← linha, correr | **2**: rabiola ↔ linha | — |

- O **N2 repete os passos do N1** (com a contagem no lugar do botão, como na
  ficha): o assunto novo é só o intruso.
- **N2·1:** o cartão "contagem 3-2-1" faz a contagem na hora, e a decolagem
  vem logo depois, sem uma 2ª contagem.
- **N3·1:** "fechar a porta" leva a criança para dentro, e ela precisa estar de capacete.
- **N3·2:** "prender a cesta" põe a criança na cesta (como no N1/N2), então precisa
  do balão cheio (regra do N1) e do capacete, igual ao "fechar a porta" do foguete no N3·1.
- **N3·3:** sem rabiola, a pipa rodopia e cai.

### As mini-cenas (1 s, cômicas, sem susto)

**Já existem (N1), e voltam no N2/N3:** `door-hose`, `cough-empty`,
`smoke-door`, `flat-cover`, `flat-nothing`, `fly-alone`, `run-alone`,
`kite-away`, `kite-drop`.

| Missão | Tocou | Faltava | Mini-cena |
|---|---|---|---|
| N2·1 | fechar a porta | abastecer | `door-hose` |
| N2·1 | contagem | abastecer | `cough-empty` (3-2-1 e o motor só tosse) |
| N2·1 | contagem | fechar a porta | `smoke-door` |
| N2·1 | abrir guarda-chuva | (intruso) | **`umbrella`**: a criança abre um guarda-chuva do lado do foguete, e nada acontece |
| N2·2 | (como N1·2) | | `flat-cover`, `flat-nothing`, `fly-alone` |
| N2·2 | escovar os dentes | (intruso) | **`toothbrush`**: a criança escova os dentes, faz espuma, e o balão fica murcho |
| N2·3 | (como N1·3) | | `run-alone`, `kite-away`, `kite-drop` |
| N2·3 | tomar sorvete | (intruso) | **`icecream`**: a criança toma um sorvete que pinga, e a pipa fica no chão |
| N3·1 | fechar a porta | abastecer | `door-hose` |
| N3·1 | fechar a porta | pôr o capacete | **`bonk`**: a criança vai entrar e bate a cabeça na porta, com estrelinhas, e volta |
| N3·1 | apertar o botão | abastecer / fechar a porta | `cough-empty` / `smoke-door` |
| N3·2 | prender a cesta | encher o balão | `flat-cover` |
| N3·2 | prender a cesta | pôr o capacete | `bonk` (a criança chega ao lado da cesta, tenta subir e bate a cabeça; volta) |
| N3·2 | soltar as cordas | encher / prender | `flat-nothing` / `fly-alone` |
| N3·3 | correr | amarrar a linha | `run-alone` |
| N3·3 | correr | pôr a rabiola | **`kite-spin`**: a criança corre, a pipa sem rabiola rodopia e cai |
| N3·3 | soltar a pipa | amarrar a linha / correr | `kite-away` / `kite-drop` |

São 5 mini-cenas novas: 3 de intruso, `bonk` (foguete e balão) e `kite-spin`.

```ts
type SceneId = 'rocket' | 'balloon' | 'kite'
interface StepDef { id: string; label: string; icon: IconRef; needs: string[] }
interface ExtraDef { id: string; label: string; icon: IconRef; scene: string }
interface FailDef { step: string; missing: string; scene: string }
interface MissionDef { id: string; scene: SceneId; steps: StepDef[]; fails: FailDef[]; extra?: ExtraDef; guide?: string }
interface LevelDef { level: number; missions: MissionDef[] }

canDo · missingOf · failOf · available · validOrders(mission) · swappedPair(mission) · dealOrder(cards)
```

**`validateLevels` no import** (`console.error` em dev):
- **todo nível:** 3 missões com ids diferentes; no máximo **4 cartões**
  (passos + intruso); `needs` só aponta para passos da mesma missão e nenhum
  passo precisa de si mesmo; ícones únicos na missão, contando o intruso;
  palavras de até 18 caracteres; **toda combinação alcançável** (qualquer
  prefixo de qualquer ordem válida × cada passo que ainda não pode) tem o
  `FailDef` do primeiro `needs` que falta; nenhum `FailDef` sobra;
- **N1:** 3 passos, **1 ordem**, sem intruso; guia só na 1ª missão;
- **N2:** 3 passos, 1 ordem, **exatamente 1 intruso** (ícone próprio, mini-cena própria); sem guia;
- **N3:** 4 passos, **exatamente 2 ordens**, e as duas diferem só pela troca de
  **2 passos vizinhos** (é o par que troca no fim); sem intruso; sem guia.

## 7. O erro

É igual à Garra, e fica num ponto só (`GameScene.lose()`):
1. o cartão tocado dá um pulinho no lugar;
2. a cena toca a mini-cena (1 s);
3. `WRONG_ANSWER` e `hud.lives.loseAll()`; a cena vira `done` e nada mais aceita toque.

**Não é erro:** tocar enquanto algo anima (o toque é ignorado) e o `?`.

**Pontos:** +10 e `CORRECT_ANSWER` por cartão certo. Concluir significa zero
erros, então são sempre 3 estrelas.

**Pista que entrega (conferido):** todos os cartões, inclusive o intruso, têm o
mesmo corpo, a mesma cor e o mesmo tamanho, e a posição deles é sorteada. A
troca do par no N3 só acontece depois de a missão decolar.

## 8. A decolagem e o replay

1. a contagem **3-2-1** (no N2·1 ela já aconteceu no cartão);
2. a **decolagem**;
3. a régua acende vaga a vaga, de baixo para cima, e **SEU ALGORITMO!** desce;
4. no **N2** o intruso some da bancada; no **N3** os 2 cartões do par trocam de
   lugar na régua, as 4 vagas acendem de novo e o letreiro vira **TAMBÉM FUNCIONA!**;
5. a próxima missão entra sozinha. No fim de cada nível vem o
   `showLevelComplete`, com `autoAdvance` para o próximo; o N3 aprova.

## 9. Guia visual (só no N1·1, sem texto)

É o `createVisualGuide`, com a chave `ef01co03-l1` no `registry`: o véu na
missão, o dedo toca o 1º cartão uma vez (é um toque real, sem pontos), e o véu
sai. O N2 e o N3 não têm guia. O `?` repete a demonstração encenada em
qualquer nível.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| toque certo | o cartão voa para a vaga; a cena executa o passo | encaixe + nota subindo por vaga |
| toque errado / intruso | pulinho; mini-cena de 1 s | "bóin" + o som da cena |
| contagem / decolagem | 3·2·1 / subida | bips / whoosh |
| replay / letreiro | as vagas acendem; a faixa desce | notas subindo + fanfarrinha |
| N3, a outra ordem | o par troca de lugar na régua | "fuiim" + fanfarrinha |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

`mode`: `intro · guide · pick · busy · launch · done`. O toque num cartão só
vale em `pick`. `startMission` faz `++gen`, com `if (gen !== this.gen) return`
depois de todo `await`. `lose()` é o único ponto de derrota.

A bridge segue a Garra: `CORRECT_ANSWER` por cartão, `CHECKPOINT` por nível,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e
START/PAUSE/RESUME.

## 12. Arquivos

Sou o único programador, então todos os arquivos são meus: `types.ts`, `data/*`,
`scenes/*`, `index.ts` e `BootScene`. **Textura:** a arte nova vai em
`cartoes-2.png` e `cena-2.png`; as grades que já existem não mudam.
**Código:** as palavras, 3-2-1, os letreiros, as bolinhas, o `?`, o brilho e as
estrelinhas. **Antes da arte:** a célula que falta aparece como um retângulo
com o id, só para testar. Nunca é entrega.

## 13. Travas para quem mexer depois

- A ordem mora **só** nos `needs`. Nenhum desenho, cor ou posição de cartão diz qual é o próximo.
- Mini-cena nova = um `FailDef` novo; a validação avisa se falta ou se sobra.
- O par do N3 sai dos `needs`, e a validação exige que ele seja único e de passos vizinhos.
- `lose()` é o único lugar da regra de derrota.

## Dúvidas para o Orquestrador

1. (anteriores, sem resposta registrada) A Pipa como missão, o Balão do N1 sem
   "subir", e fechar a porta antes de abastecer como erro.

## Histórico

- **29/09/2026.** Planejamento novo (Ferro), a partir da ficha original (cartões
  na régua). O plano do pôster de adesivos foi abandonado e arquivado. Só o N1,
  com 3 missões. Errou, perdeu (igual à Garra). Arte vetor de conto.
- **29/09/2026, arte integrada (Ferro, agora o único programador).** As 6
  folhas do MANIFEST entraram no lugar das reservas em Graphics, que saíram do
  `stage`, do `bench` e do `ruler`.
  - As peças da cena apoiam os pés na base medida da célula (310/320).
  - A chama sai do bico do foguete (origem no topo da célula, y = 46).
  - O balão sobe 95 px ao encher, e a cesta encaixa embaixo dele.
  - A vaga da régua tem o tamanho do cartão encaixado, e o letreiro cabe em
    60% da faixa.
  - O fundo não tem plataforma, então a **base de lançamento do foguete é
    Graphics** (tampo e 2 pernas, parada), de propósito.
  - Capa do catálogo trocada pela definitiva, e `public/og/decolagem-passo-a-passo.jpg`
    gerado (1200 × 630, JPEG 82, 124 KB).
- **29/09/2026, encenação corrigida (teste da Lupa).**
  - **Foguete.** No passo "fechar a porta", a criança anda até o foguete e
    entra pela porta antes de ela fechar. A caixinha de botão saiu da cena,
    porque o botão fica dentro do foguete: o passo faz o foguete tremer e
    soltar fumacinha. Na decolagem só o foguete sobe. A chama nasce pequena no
    bico e só cresce quando o foguete já está acima da base, então nunca
    atravessa a plataforma.
  - **Balão.** Ao encher, o fogo do queimador acende (a chama da `cena.png`,
    virada para cima, entre a cesta e a boca do balão). Em "prender a cesta",
    a cesta vai para baixo do balão, as cordas aparecem, e a criança anda até
    ela e sobe na cesta. O balão decola com a criança dentro.
  - **Pipa.** A criança corre puxando a pipa. Ao soltar, a ponta da linha fica
    na mão dela e a pipa sobe presa à linha.
  - **Contagem 3-2-1** no céu livre, em (660, 180).
  - **HUD.** As vidas estão ocultas no projeto inteiro (`VIDAS_VISIVEIS =
    false`, no shared), então a pílula da direita agora abraça só o `?`. Se as
    vidas voltarem a aparecer, a pílula precisa crescer de novo.
- **29/09/2026, N2 e N3 planejados (pedido do usuário: "faça N2 e N3").** Id
  093 depois da renumeração do catálogo.
  - **N2:** 3 missões de 4 passos + 1 intruso (guarda-chuva, sorvete, bola).
  - **N3:** 3 missões de 5 passos com 2 ordens válidas (um par independente
    por missão) e a troca obrigatória na régua.
  - Bancada em grade 2 × 3 para 5 cartões, e régua com 3, 4 ou 5 vagas.
  - 14 mini-cenas novas; a arte nova vai em 2 folhas novas (`cartoes-2.png`,
    `cena-2.png`).
  - Guia só no N1·1. A validação agora é por nível (§6).
- **29/09/2026, N2/N3 refeitos (decisões do usuário).**
  - **Sem troca no N3:** só 2 ordens válidas, e no fim o par troca de lugar
    sozinho, com o letreiro **TAMBÉM FUNCIONA!**
  - **No máximo 4 cartões:** N2 = 3 passos + 1 intruso; N3 = 4 passos.
  - Intrusos óbvios: abrir guarda-chuva, escovar os dentes, tomar sorvete.
  - O "pôr o lanche" saiu; o par do balão virou encher ↔ subir na cesta.
  - São 6 mini-cenas novas, e a arte nova vai em 2 folhas (`cartoes-2.png`
    4 × 2 e `cena-2.png` 3 × 2).
- **29/09/2026, código do N2/N3 (Ferro).**
  - A validação por nível passa limpa nas 9 missões.
  - Bancada e régua se arrumam para 3 ou 4 cartões; o intruso pula, faz a
    mini-cena e sai da bancada no fim.
  - No fim do N3, o par troca de lugar e o letreiro vira TAMBÉM FUNCIONA!
  - As 6 mini-cenas novas estão feitas. Enquanto `cartoes-2`/`cena-2` não
    chegam, os ícones e objetos novos aparecem como reserva em Graphics
    (quadrado ou círculo dourado), e a pipa sem rabiola usa a pipa da
    `cena.png`.
- **29/09/2026, ajustes do teste da Lupa (N2/N3).**
  - **Par do balão (N3·2):** encher ↔ subir na cesta era contraintuitivo (a
    criança subia numa cesta solta). O par virou **capacete ↔ encher**, e
    "prender a cesta" exige os dois, no mesmo desenho do foguete. A mini-cena
    `basket-lift` e o passo "subir na cesta" saíram (o ícone `icon-climb` fica
    na folha, sem uso).
  - **Critério revisto** nos 3 pares, "tanto faz a ordem", óbvio para 6 anos e
    coerente com o N1/N2: capacete ↔ abastecer, capacete ↔ encher, rabiola ↔ linha.
  - **Intrusos:** o objeto (guarda-chuva, escova, sorvete) aparece na mão da
    criança e fica 1,2 s visível antes do "opa". Escova e sorvete cresceram
    (0,55 e 0,7).
  - **Derrota do balão:** no `bonk`, a criança para ao lado da cesta (120 px
    antes), sem se sobrepor a ela.
