# Subida do Dia — planejamento

Jogo **092** · EF01CO02 · 1º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: a **revisão de 28/09/2026**
(escadinhas de passos até a solução), que substitui a de `docs/rodada-3/EF01CO02.md`.
Padrão: `docs/rodada-3/PADRAO-R3.md`. Modelo: `src/games/EF01CO01/garra-dos-grupos/PLANEJAMENTO.md`.
A ficha é a fonte; só muda o que o padrão obriga (§3). O que é proposta minha está marcado e vai para as *Dúvidas*.

---

## 1. O jogo em uma frase

Embaixo, à esquerda, está o **problema** (mãos sujas de tinta, copinho vazio,
a casa da vovó do outro lado do rio). No alto, dentro de uma **nuvem**, está o
problema **resolvido**. Entre os dois há 2 ou 3 **escadinhas** lado a lado, cada
uma com 3 ou 4 degraus-figura lidos de baixo para cima. Só uma resolve. A
criança **toca numa escadinha** e o personagem sobe sozinho, degrau por degrau:
a cada degrau o passo **acontece** no quadro do problema. A certa chega à nuvem.
A trocada dá errado no passo trocado, e a incompleta para no degrau que falta.

Um gesto só: tocar numa escadinha inteira. Não há toque degrau a degrau nem arrasto.

## 2. A habilidade e os irmãos

> **(EF01CO02)** Identificar e seguir sequências de passos aplicados no dia a
> dia para resolver problemas.

| O que a BNCC pede | Onde acontece |
|---|---|
| **seguir** uma sequência | para escolher, a criança segue cada escadinha de cabeça, de baixo para cima; depois vê o personagem segui-la de verdade |
| **identificar** a sequência que resolve | só uma das escadinhas tem todos os passos, na ordem |
| aplicada **no dia a dia** | lavar as mãos, plantar feijão, ir até a vovó, dobrar um chapéu |
| **para resolver problemas** | o quadro começa com o problema e termina igual à nuvem, ou mostra onde deu errado |

**O teste da bolinha:** troque as figuras por bolinhas iguais e as escadinhas
ficam idênticas. A decisão mora inteira no **conteúdo** (secar antes de enxaguar
não funciona), nunca na cor, no tamanho ou na posição da escadinha.

**Irmãos:** a *Trilha do Passo a Passo* (002) é quiz, e o *Ritmo da Rotina* (047)
bate o próximo passo no tempo do tambor, **um passo de cada vez**. Aqui a
criança julga a **sequência inteira** antes de agir e vê o algoritmo ser
executado, com o erro acontecendo no passo exato. É por isso que a ficha foi
revista: a versão anterior (tocar o próximo degrau) repetia o Ritmo da Rotina.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; o exemplo virou o guia visual (§9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia visual | PADRAO-R3, diretrizes |
| problema "na base", objetivo "no alto" | o problema fica num **quadro embaixo à esquerda**, com o personagem aos pés dele; a nuvem fica no alto, sobre as escadinhas | as escadinhas precisam da largura toda; o quadro é onde "cada passo acontece" |
| cenário muda com o problema (pia, janela, rio, mesa) | **um fundo só**, de papel; o que muda é o **quadro do problema**, que já traz a pia, o copinho, o rio | cenário por problema seriam 8 fundos; o quadro mostra o mesmo lugar e é o que a criança olha |
| "botão de novo problema" no fim da rodada | ▶ depois do replay; estrelas e jogar de novo só no fim do **nível** | PADRAO-R3 §2 |
| conteúdo: 5 problemas | **8 problemas**, 3 deles propostos (*pintar o desenho*, *calçar o tênis*, *fazer o sanduíche*), e versões de 3 e de 4 passos | cada nível pede 4 problemas diferentes, 12 no total; ver §6 e *Dúvidas* |
| trocada e faltando do chapéu, da casinha e da vovó não estão todas na ficha | escritas no §6 | a ficha só dá algumas |
| arte chibi de figurinha (PADRAO-R3) | **chibi de rabisco**, da imagem que o usuário mandou (`references/29-chibi-rabisco.jpg`) | pedido do usuário para este jogo |
| sons | os mesmos, sintetizados em WebAudio | PADRAO-R3 |
| pontos +10 / +5 | contados, nunca escritos | INSTRUCOES |
| telemetria: tipo de escadinha errada, posição do erro, problema com mais travas | só `CORRECT_ANSWER`/`WRONG_ANSWER` por problema | a bridge não tem esses campos; o dado (`kind`, `failsAt`) já existe para quando tiver |

**Leituras da ficha** (a ficha não diz, e eu li assim):
- *"Sessão = 4 problemas diferentes"*: cada nível tem **4 fases**, um problema por fase.
- **Onde a escadinha dá errado é dado**, não conta. A trocada de feijão
  (*regar antes do feijão*) só mostra o estrago quando o feijão cai seco por
  cima, um degrau depois da troca. Cada escadinha errada tem `failsAt` (o degrau
  onde a cena cômica acontece), e a validação cobra que ele não venha antes da troca.
- **Faltando:** o personagem sobe até o degrau de baixo do buraco e não alcança
  o de cima. Se o buraco é o 1º degrau (*sem abrir a torneira*), ele tenta do chão.
  A cena cômica mostra a consequência do passo que faltou.
- **"Erro no MEIO" (N3):** a própria ficha dá *abrir a torneira* como passo
  escondido, e ele é o 1º. Li assim: no N3 a **trocada nunca mexe no 1º degrau**
  (troca de vizinhos lá no meio ou no fim), e a **faltando é o passo que a gente
  esquece** (torneira, buraquinho, abrir o pote).
- **Escadinha travada não é tocável.** O toque nela só faz o cadeado balançar,
  sem cobrar nada. No N1, com 2 escadinhas, depois de uma trava só sobra a certa,
  então a regra "pisca após 2 travas" só existe no N2 e no N3.

## 4. O laço

```
problema no quadro · nuvem com o resolvido · 2–3 escadinhas
        ▲                                 │ toque numa escadinha
        │                                 ▼
        │       personagem vai até o pé dela e sobe; a cada degrau:
        │       o degrau acende + o passo acontece no quadro
        │          ┌──────────────────────┼─────────────────────────┐
        │        certa                 trocada                   faltando
        │   chega à nuvem, o     no degrau failsAt: cena     para embaixo do buraco,
        │   quadro fica igual    cômica de 1 s no quadro     estica, não alcança; cena
        │   a ela; fanfarrinha   (toalha vira espuma)        cômica da consequência
        │   (+10, ou +5 depois   └───────────┬──────────────────────┘
        │    de trava)            TRAVA: escorrega de volta sem cair, o quadro volta ao
        │          │              problema, cadeado na escadinha, o degrau do erro pisca;
        │          │              WRONG_ANSWER + lives.lose(), 1× por problema;
        │          │              2ª trava → a escadinha certa pisca
        │          │                          │ (espera um toque em outra escadinha)
        │          ▼                          └─────────────────────────┐
        │   replay: a certa acende de baixo para cima, ao lado das erradas, │
        │   cada errada com a etiqueta no degrau do erro (trocou! / faltou!) · ▶
        └── próximo problema, ou fim do nível → showLevelComplete (estrelas)
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`, que é da Brasa. Estes números são o contrato.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas (40, 40, ocultas); 4 bolinhas dos problemas em (170, 48); `?` em (1220, 56), 96 × 96 | |
| quadro do problema | moldura no fundo, de (30, 110) a (310, 410); imagem 240 × 240 em (170, 260) | o **estado atual** do problema: começa no problema, muda a cada degrau |
| nome do problema | (170, 438) | `Lavar as mãos` (texto do jogo, 1 linha) |
| personagem | pés em (170, 690), ~120 px | começa aqui, anda até o pé da escadinha tocada |
| nuvem | desenhada no fundo, centro (795, 105), 560 × 190; imagem 150 × 150 em (795, 110) | o **objetivo pronto** (a última imagem do quadro) |
| escadinhas | 3: centros x 490 / 795 / 1100; 2: x 640 / 950; trilhos de y 215 a 700, largura 260 | a coluna inteira da escadinha é o alvo do toque |
| degraus | 3 por escadinha: placas de 200 × 140 em y 620 / 470 / 320; 4 por escadinha: 200 × 110 em y 640 / 525 / 410 / 295 | figura (90 ou 72 px) + palavra curta embaixo |
| subida | o personagem sobe pelo **trilho da direita**, meio para fora | a placa fica toda à vista enquanto ele sobe |
| etiqueta | à esquerda do degrau do erro | `trocou!` / `faltou!` (código) |
| ▶ | (170, 620), 120 × 120 | só depois do replay; o personagem já está no alto |

**Densidade.** Durante o jogo há **2 ou 3 alvos** (as escadinhas, cada uma uma
faixa larga) mais o `?`. No fim do problema as escadinhas deixam de aceitar
toque e só o ▶ entra. O teto de 4 está respeitado. O que a criança lê: 6 a 12
figuras, sempre em colunas de baixo para cima, e 3 a 4 por coluna.

**Teclado:** `1` `2` `3` tocam as escadinhas da esquerda para a direita; `H`
repete o guia, como o `?`.

## 6. Problemas, versões e escadinhas (`data/levels.ts`)

### Os 8 problemas

| id | nome | problema → resolvido | origem |
|---|---|---|---|
| `wash` | Lavar as mãos | mãos sujas de tinta → mãos limpas e secas | ficha |
| `bean` | Plantar o feijão | copinho vazio → feijão brotando | ficha |
| `grandma` | Ir até a vovó | casa, rio no meio → porta da vovó | ficha |
| `tangram` | Casinha de Tangram | peças soltas → casinha montada | ficha |
| `hat` | Chapéu de papel | folha → chapéu | ficha |
| `paint` | Pintar o desenho | desenho em branco → desenho pintado | **proposta** |
| `shoes` | Calçar o tênis | pé descalço → tênis amarrado | **proposta** |
| `sandwich` | Fazer o sanduíche | prato vazio → sanduíche pronto | **proposta** |

### Os passos (`data/steps.ts`, 28 figuras)

| Problema | Passos (palavra curta na tela) |
|---|---|
| `wash` | abrir torneira · ensaboar · enxaguar · secar |
| `bean` | pôr terra · buraquinho · pôr feijão · regar |
| `grandma` | portão · ponte · padaria |
| `tangram` | quadrado · triângulo em cima · porta |
| `hat` | dobrar ao meio · dobrar os cantos · dobrar a barra |
| `paint` | pôr o papel · abrir a tinta · molhar o pincel · pintar |
| `shoes` | pôr a meia · calçar o tênis · amarrar |
| `sandwich` | pegar o pão · abrir o pote · passar requeijão · fechar |

### Os níveis

| Nível | Assunto | Escadinhas | Degraus | Problemas |
|---|---|---|---|---|
| 1 | **seguir** e achar a **troca** | 2: certa + trocada (2 passos trocados) | 3 | `wash`, `tangram`, `hat`, `grandma` |
| 2 | a escadinha **incompleta** | 3: certa + trocada + faltando (degrau vazado) | 3 | `bean`, `paint`, `shoes`, `sandwich` |
| 3 | o passo **escondido** | 3: certa + trocada de vizinhos + faltando | 4 | `wash`, `bean`, `paint`, `sandwich` |

O N3 volta a problemas conhecidos, agora com o passo que a gente esquece. É o
que a ficha pede (*abrir a torneira, fazer o buraquinho*). A **posição** das
escadinhas é sorteada a cada problema; o conteúdo delas é dado.

### As escadinhas (lidas de baixo para cima; `✕` = onde dá errado)

**N1** (2 escadinhas, 3 degraus)

| Problema | Certa | Trocada | ✕ | Cena cômica |
|---|---|---|---|---|
| `wash` | ensaboar → enxaguar → secar | ensaboar → **secar → enxaguar** | 2 | a toalha vira espuma (ficha) |
| `tangram` | quadrado → triângulo em cima → porta | **triângulo em cima → quadrado** → porta | 1 | o triângulo cai sem apoio (ficha) |
| `hat` | dobrar ao meio → dobrar os cantos → dobrar a barra | **dobrar os cantos → dobrar ao meio** → dobrar a barra | 1 | a folha vira aviãozinho e sai voando |
| `grandma` | portão → ponte → padaria | portão → **padaria → ponte** | 2 | ele vai para a padaria e o pé cai no rio: *splash* (a padaria fica do outro lado) |

**N2** (3 escadinhas, 3 degraus)

| Problema | Certa | Trocada · ✕ · cena | Faltando · ✕ · cena |
|---|---|---|---|
| `bean` | pôr terra → pôr feijão → regar | terra → **regar → feijão** · 3 · a água escorreu e o feijão fica seco por cima (ficha) | terra → ▢ → regar · 2 · regou terra sem nada: não brota (ficha) |
| `paint` | abrir a tinta → molhar o pincel → pintar | **molhar o pincel → abrir a tinta** → pintar · 1 · o pincel bate na tampa fechada | abrir a tinta → ▢ → pintar · 2 · pincel seco: risco apagadinho |
| `shoes` | pôr a meia → calçar o tênis → amarrar | **calçar o tênis → pôr a meia** → amarrar · 2 · a meia fica por cima do tênis | pôr a meia → ▢ → amarrar · 2 · o laço fica no ar, sem tênis |
| `sandwich` | pegar o pão → passar requeijão → fechar | pegar o pão → **fechar → passar requeijão** · 3 · o requeijão vai por fora | pegar o pão → ▢ → fechar · 2 · sanduíche vazio |

**N3** (3 escadinhas, 4 degraus)

| Problema | Certa | Trocada · ✕ · cena | Faltando · ✕ · cena |
|---|---|---|---|
| `wash` | abrir torneira → ensaboar → enxaguar → secar | torneira → **enxaguar → ensaboar** → secar · 4 · a toalha vira espuma | ▢ → ensaboar → enxaguar → secar · 1 · sem água, o sabão não sai da mão (ficha) |
| `bean` | pôr terra → buraquinho → pôr feijão → regar | terra → buraquinho → **regar → feijão** · 4 · feijão seco por cima | terra → ▢ → feijão → regar · 2 · o feijão fica por cima e a água o leva para fora (ficha) |
| `paint` | pôr o papel → abrir a tinta → molhar o pincel → pintar | papel → tinta → **pintar → molhar** · 3 · risco seco | papel → ▢ → molhar → pintar · 2 · o pincel bate na tampa |
| `sandwich` | pegar o pão → abrir o pote → passar requeijão → fechar | pão → pote → **fechar → passar** · 4 · requeijão por fora | pão → ▢ → passar → fechar · 2 · a faca bate na tampa do pote |

Várias cenas cômicas se repetem entre níveis de propósito: a mesma causa
produz o mesmo estrago, e é assim que a criança aprende o que cada passo faz.

```ts
type ProblemId = 'wash' | 'bean' | 'grandma' | 'tangram' | 'hat' | 'paint' | 'shoes' | 'sandwich'
interface StepDef { id: string; problem: ProblemId; label: string; cell: number }
interface ProblemDef { id: ProblemId; name: string; sheet: string; frames: Record<string, number> }
interface Ladder { kind: 'right' | 'swapped' | 'missing'; steps: (string | null)[]; states?: string[]; failsAt?: number; fail?: string }
interface PhaseDef { problem: ProblemId; start: string; states: string[]; ladders: Ladder[] }
interface LevelDef { level: number; ladders: 2 | 3; rungs: 3 | 4; phases: PhaseDef[] }

firstDiff(ladder, right) => number   // 1-based; a trava nunca acontece antes dele
```

`states[i]` é a imagem do quadro depois do degrau `i`; a última é a da nuvem.
Numa escadinha errada, os degraus antes da troca usam os estados da certa. Os
degraus **entre a troca e o `failsAt`** também mudam o quadro, e por isso a
escadinha traz `states` próprios, quase sempre reaproveitando quadros (na
trocada do feijão, *regar* sem feijão mostra o mesmo quadro de "terra molhada
sem nada" da faltando). A lista de quadros de cada problema está no TEXTURAS.md §6.
Nenhum gabarito à parte: a certa é a escadinha `kind: 'right'`, e é ela que
alimenta os estados.

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- `phases.length === 4` e os 4 problemas do nível são diferentes;
- cada escadinha tem `rungs` degraus; há `ladders` escadinhas, exatamente 1 `right`;
- N1: 1 `swapped`; N2 e N3: 1 `swapped` + 1 `missing`;
- `swapped` é a certa com **exatamente 2 posições trocadas**; no N3 elas são
  vizinhas e nenhuma é a 1ª;
- `missing` é a certa com **exatamente 1 passo** virado `null`;
- `failsAt ≥ firstDiff` (a trocada) e `failsAt === posição do null` (a faltando);
- `fail` e todos os `states` existem na folha do problema, e todo degrau subido
  antes do `failsAt` tem um quadro;
- todo passo é do problema da fase, e o nome cabe em 2 linhas (≤ 18 caracteres).

## 7. O erro e a TRAVA

É a trava da ficha e do PADRAO-R3 §3. **A Garra trocou a trava por "errou,
perdeu"** a pedido do usuário; aqui fico com a ficha até o usuário dizer
(*Dúvidas*, item 1). A troca, se vier, é pequena: `lose()` vira `loseAll()`.

- O personagem sobe executando os degraus de antes normalmente (o quadro muda
  a cada um). No degrau `failsAt` o degrau pisca e o quadro mostra a **cena
  cômica** por ~1 s (a toalha virando espuma), com um tremido e o som de
  madeira, nada áspero.
- Na faltando, ele chega ao degrau de baixo do buraco, **estica o braço e não
  alcança**; o quadro mostra a consequência.
- Ele **escorrega de volta** pelos trilhos, sem cair, e senta no chão com cara
  de "opa". O quadro volta ao problema.
- A escadinha ganha **cadeado** e o degrau do erro **continua piscando**: a dica
  é o próprio passo que deu errado, nunca "tente de novo".
- `WRONG_ANSWER` + `lives.lose()` **uma vez por problema** (`chargeOnce`).
- **2ª trava no mesmo problema:** a escadinha certa pisca até ser tocada.
- **Destrava tocando outra escadinha.** Ao acertar, os cadeados somem.
- Sem vermelho de punição: cadeado dourado, piscar amarelo.

**Não é erro:** tocar numa escadinha travada (só balança o cadeado); tocar
enquanto o personagem sobe ou escorrega (ignorado); o `?`.

**Pontos:** +10 no problema resolvido sem trava, +5 depois de trava.
`CORRECT_ANSWER` sai quando o personagem chega à nuvem. Estrelas: 3 com ≥ 90%
dos problemas de primeira, 2 com ≥ 70%, 1 ao concluir (`stars` do `showLevelComplete`).

**Pista que entrega (conferido):** as escadinhas têm a mesma madeira, a mesma
largura e o mesmo som; a posição da certa é sorteada; as figuras de um passo são
as mesmas em qualquer escadinha. **Uma pista fica de fora do meu controle:** o
degrau vazado marca a faltando antes de a criança ler (*Dúvidas*, item 4).

## 8. O replay do topo

No fim de cada problema, com o personagem na nuvem:
1. a escadinha certa acende degrau por degrau, de baixo para cima, e o quadro
   repassa os estados junto;
2. em cada errada, o degrau do erro ganha a etiqueta `trocou!` ou `faltou!` e
   pisca uma vez (os degraus trocados ganham uma setinha curva entre eles);
3. o ▶ entra.

## 9. Guia visual (1º ano, sem texto)

É o `shared/guide/createVisualGuide`, com véu, dedo e espera pelo gesto real.
Nenhuma frase aparece.

**Abertura do N1** (chave `ef01co02-l1` no `registry`), no 1º problema:
1. **O problema.** O véu deixa só o quadro aceso (mãos sujas) e o personagem aponta para ele.
2. **O objetivo.** O véu passa para a nuvem (mãos limpas), que pulsa. Uma
   setinha pontilhada sobe do quadro até a nuvem.
3. **Ler.** O véu abre as escadinhas. O dedo **desliza de baixo para cima** em
   cada uma, e cada degrau acende quando o dedo passa: é o gesto de ler.
4. **Demonstração (`demo`).** O dedo toca a **trocada**: o personagem sobe, a
   toalha vira espuma, ele escorrega e o cadeado aparece. Isso não emite nada.
   Depois o dedo toca a certa: ele sobe, as mãos ficam limpas, a nuvem comemora e
   o replay mostra `trocou!`. Esse problema conta no progresso, mas não dá pontos
   nem entra nas estrelas.
5. **A vez da criança.** No 2º problema o dedo só repete o deslizar de leitura
   uma vez em cada escadinha e sai. O guia termina no primeiro toque.

**Estreia do N2** (`ef01co02-l2`): no 1º problema, o véu deixa só o degrau
vazado da faltando e ele pulsa. Sem dedo e sem demonstração: o que ele faz a
criança descobre subindo.

**N3** não tem estreia: é a mesma mecânica com 4 degraus.

O `?` pausa, repete os passos 1 a 4 com um problema encenado e retoma.

**Dá para entender o objetivo sem ler?** Sim: o quadro (sujo) e a nuvem (limpo)
dizem o problema e a meta, o dedo mostra que se lê de baixo para cima, e a
demonstração mostra o erro e o acerto antes da criança tentar.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| toque | a escadinha afunda de leve; o personagem anda até o pé dela | passinhos |
| cada degrau | o degrau acende, o personagem sobe um degrau, o quadro troca com um "puf" | toc de subida, uma nota mais alta por degrau |
| certo no topo | o personagem pula na nuvem, o quadro e a nuvem ficam iguais, estrelinhas | fanfarrinha |
| cena cômica | o quadro treme 1 s com a imagem do estrago | "bóin" engraçado + madeira |
| escorregão | o personagem desliza pelos trilhos e senta | escorregão fofo (glissando descendo) |
| trava | cadeado + degrau do erro piscando | clique de cadeado |
| 2ª trava | a escadinha certa pisca | nenhum som novo |
| replay | degraus acendendo em ordem; etiquetas `trocou!`/`faltou!` | notas subindo |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · choose · climb · fail · replay · panel · done`.
O toque numa escadinha só vale em `choose`. `startPhase` faz `++gen`, e todo
`await` é seguido de `if (gen !== this.gen) return`.

A bridge segue o padrão da Garra: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER`/`WRONG_ANSWER` por problema, `CHECKPOINT` com
`progress = round(problemasFeitos / 4 × 100)`,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START/PAUSE/RESUME. O jogo nunca emite `GAME_OVER` e nunca
escreve `isFinalStage`. As vidas vêm do `createLives`; quando elas zeram, a cena
vai para `done`. O saldo atravessa o `restart`.

## 12. Arquivos, texturas e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts`, `data/steps.ts`, `data/problems.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` | `data/layout.ts`, `data/theme.ts`, `scenes/board.ts` (fundo, quadro, nuvem), `ladder.ts` (trilhos, degraus, vazado, cadeado, etiqueta), `kid.ts` (andar, subir, escorregar, comemorar), `replay.ts`, `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi de rabisco**; prompts no [TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-papel.png` | 1280 × 720 | papel amarelinho com a nuvem vazia no alto, a moldura vazia do quadro e a linha do chão |
| `crianca.png` | 3 × 2, 384 | parado, subindo A, subindo B, escorregando, sentado "opa", comemorando |
| `passos.png` | 6 × 5, 256 | as 28 figuras de passo |
| `pecas.png` | 4 × 2, 320 | trilhos (emenda vertical), degrau-placa, degrau vazado, cadeado, dedo do guia, 3 livres |
| `problemas-1.png` … `problemas-4.png` | 5 × 4, 256 | os quadros: 2 problemas por folha, com os estados e as cenas cômicas |
| `cover-subida-do-dia.png` | 1672 × 941 | capa **com o título** |

**Código:** a palavra de cada degrau (DynaPuff), o nome do problema, as
etiquetas `trocou!`/`faltou!`, a setinha pontilhada do guia, as bolinhas, o
`?`, o ▶, o piscar, as estrelinhas e o "puf" de troca do quadro.
**Antes da arte:** retângulos com o id, só para testar. Nunca é entrega.

**Registro:** id `092` (`NEXT_FREE_ID` vai para `093` no mesmo commit), slug
`subida-do-dia`, em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, 3 frases em
`gameInstructions.ts`, `public/og/subida-do-dia.jpg`.

## 13. Travas para quem mexer depois

- A ordem certa mora **só** na escadinha `right`. Nada no desenho dos degraus,
  da madeira ou da posição diz qual é a certa.
- Os quadros de um problema têm **o mesmo enquadramento**: trocar de estado é
  trocar a imagem sem o objeto pular de lugar. Se a Aquarela refizer um, refaz a linha.
- Se uma célula mudar de lugar numa folha, o `data/problems.ts` ou o
  `data/steps.ts` muda junto: o pior defeito deste jogo é o quadro mostrar um
  passo diferente do degrau que acendeu.
- `failsAt` é dado. Não calcule o ponto do erro na cena.

## MECÂNICA NOVA — "MONTE A ESCADA" (usuário, 28/09/2026, depois de ver o jogo) — vence TUDO acima

O usuário viu as 2 escadinhas lado a lado com figura + palavra e disse: *"essa
interface ta mt poluida, alem disso, tem mta coisa pro nivel 1. gostaria de um
zoom na criança no inicio do nivel. e deixe o jogo mais facil de entender"*.
As "escadinhas para escolher" (§1, §4, §5, §7, §8) **saem**. O jogo passa a ser:

- **Uma escada só, no centro.** O próximo degrau fica **vazio e brilhando**.
- Ao lado, **2 figuras grandes** (N1): o próximo passo certo e um passo errado.
  Posição sorteada. Sem palavra em lugar nenhum (nem no degrau, nem na figura).
- **Toque no certo:** a figura voa até o degrau e vira a placa dele, a criança
  sobe um degrau, e o passo **acontece** no quadro do problema.
- **Toque no errado:** a figura voa, o passo errado **acontece** no quadro (o
  estrago, cena cômica), a criança escorrega e senta, e **a partida acaba**
  (`WRONG_ANSWER` + `hud.lives.loseAll()`, igual à Garra).
- Degrau por degrau até o **objetivo no topo** (a nuvem com o resolvido).
- **Início de cada nível:** a câmera dá **zoom na criança** mostrando o problema
  (ex.: mãos sujas) com um **balão pequeno** com a imagem do objetivo; depois zoom out.
- **N1 = 3 problemas**, 3 degraus, 2 opções. No máximo 3 alvos na tela
  (2 figuras + `?`). **Só o N1 agora.**
- Planejado para depois (não fazer): N2 4 degraus e 2 opções; N3 4 degraus e
  3 opções, sendo uma delas um passo real do mesmo problema fora da ordem.

## N1 — Monte a escada: conteúdo (proposta do Ferro, aguarda aprovação)

**Os 3 problemas:** `wash` (lavar as mãos), `bean` (plantar o feijão) e
`grandma` (ir até a vovó). Os três são coisas que a criança já fez ou viu, e
em cada um a ordem é **física**: o passo fora da hora dá errado de verdade.
Ficaram de fora: `tangram`, porque só *quadrado → triângulo* é obrigatório
(porta antes do telhado não é erro), e `hat`, porque dobradura é abstrata
demais para o 1º ano.

Cada degrau tem: o quadro **antes** (o estado atual), o passo **certo** e o
quadro depois dele, e o passo **errado** e o quadro do **estrago**. As figuras
das opções são as células do `passos.png`. Nenhuma palavra.

### `wash` — Lavar as mãos · início `wash-tap` (torneira aberta, mãos sujas de tinta) · objetivo `wash-dry`

| Degrau | Antes | Certo → quadro | Errado → estrago | Por que dá errado |
|---|---|---|---|---|
| 1 | `wash-tap` | `wash-soap` → `wash-soapy` | `wash-dry` → **`wash-fail-smear`** (NOVO) | secou a mão suja: a toalha fica manchada de tinta azul e a mão continua suja |
| 2 | `wash-soapy` | `wash-rinse` → `wash-rinsed` | `wash-dry` → `wash-fail-towel` | secou com sabão: a toalha vira uma bola de espuma |
| 3 | `wash-rinsed` | `wash-dry` → `wash-dry` | `wash-soap` → `wash-soapy` (reuso) | ensaboou de novo a mão limpa: volta tudo a espumar |

### `bean` — Plantar o feijão · início `bean-empty` (copinho vazio) · objetivo `bean-sprout`

| Degrau | Antes | Certo → quadro | Errado → estrago | Por que dá errado |
|---|---|---|---|---|
| 1 | `bean-empty` | `bean-soil` → `bean-soil` | `bean-water` → **`bean-fail-pool`** (NOVO) | regou o copo vazio: vira um copo d'água com um patinho boiando, nada para plantar |
| 2 | `bean-soil` | `bean-seed` → `bean-seed` | `bean-water` → `bean-fail-nothing` | regou a terra sem feijão: terra molhada, nada plantado, gotinha triste |
| 3 | `bean-seed` | `bean-water` → `bean-watered` | `bean-soil` → **`bean-fail-buried`** (NOVO) | pôs terra de novo: a terra transborda em montanha e o feijão some lá no fundo |

No topo, o quadro passa de `bean-watered` para `bean-sprout` (brota), que é o da nuvem.

### `grandma` — Ir até a vovó · início `grandma-home` (na porta de casa) · objetivo `grandma-door`

| Degrau | Antes | Certo → quadro | Errado → estrago | Por que dá errado |
|---|---|---|---|---|
| 1 | `grandma-home` | `grandma-gate` → `grandma-gate` | `grandma-bridge` → **`grandma-fail-gate`** (NOVO) | foi para a ponte sem abrir o portão: dá de cara no portão fechado, "tóim", estrelinhas |
| 2 | `grandma-gate` | `grandma-bridge` → `grandma-bridge` | `grandma-bakery` → `grandma-fail-splash` | foi para a padaria sem a ponte: o pé cai no rio, *splash* |
| 3 | `grandma-bridge` | `grandma-bakery` → `grandma-door` | `grandma-gate` → `grandma-gate` (reuso) | voltou para o portão de casa: está longe da vovó de novo |

### Arte nova (o mínimo): 4 quadros, 1 deles opcional

Mesmo enquadramento dos outros quadros do problema (a pia, o copinho e o mapa
no mesmo lugar), pastel chapado só nos materiais, sem texto.

| id | folha / célula livre | Quadro |
|---|---|---|
| `wash-fail-smear` | `problemas-1`, célula 7 | a mesma pia com a torneira aberta; as duas mãos **ainda manchadas de azul**; a toalha pendurada **com borrões de tinta azul** e carinha de nojo |
| `bean-fail-pool` | `problemas-1`, célula 19 | o mesmo copinho **sem terra, cheio de água até a boca**, um patinho de borracha boiando, uma gotinha escorrendo |
| `bean-fail-buried` | `problemas-1`, célula 8 | o mesmo copinho com **uma montanha de terra** transbordando e caindo pelos lados; o feijão não aparece |
| `grandma-fail-gate` | `problemas-3`, célula 5 | o mesmo mapa; o personagem pequenino **amassado contra o portão fechado**, estrelinhas girando na cabeça |


### Dúvidas N1 (para o usuário)

1. **Último degrau com passo já feito.** No `wash` (ensaboar de novo) e no
   `grandma` (voltar ao portão) reaproveitei um quadro que já existe: a cena
   "volta para trás", com tremido e *bóin*. É claro, mas menos engraçado que
   um estrago novo. Serve, ou quer quadro novo nesses dois?
2. **`bean`, degrau 3.** "Pôr terra de novo" é o erro mais fraco: a criança pode
   achar que mais terra não faz mal. Alternativa sem arte nova: o errado vira
   `bean-seed` (pôr **outro** feijão) com o `bean-fail-nothing`... que também é
   fraco. Mantenho a montanha de terra (`bean-fail-buried`)?
3. As figuras de passo do feijão (`passos.png`) usam um **vasinho**, e os
   quadros usam uma **xícara**. No zoom isso aparece. Pedir à Aquarela para
   igualar, ou deixar?

### Tipo (combinado com a Brasa; a interface dos módulos é a dela, de 28/09)

```ts
interface RungDef { right: string; wrong: string; state: string; fail: string }
interface PhaseDef { problem: ProblemId; start: string; goal: string; rungs: RungDef[] }
interface LevelDef { level: number; options: 2; rungs: 3; phases: PhaseDef[] }
```

`right`/`wrong` são ids do `passos.png`; `state`/`fail`/`start`/`goal` são ids
dos quadros. A posição das 2 figuras é sorteada a cada degrau. `validateLevels`:
3 problemas diferentes; 3 degraus; `wrong` ≠ `right`; os dois passos são do
problema; todo quadro existe; `state` do último degrau (ou o `goal`) fecha o problema.

## Decisões do usuário (28/09/2026, 1ª versão) — valem onde não conflitam com a mecânica nova

1. **Escopo: só o N1.** `LEVELS` tem só o nível 1 (4 problemas: `wash`, `tangram`,
   `hat`, `grandma`). N2/N3, a escadinha `missing`, o degrau vazado e a
   `problemas-4.png` ficam para depois; a `validateLevels` cobre o que o N1 usa.
2. **Erro: "errou, perdeu", igual à Garra.** Não há trava, cadeado, destravar,
   brilho da certa após 2 travas nem +5. Na escadinha errada: o personagem sobe,
   a cena cômica acontece no `failsAt`, ele escorrega e senta (`kid-oops`), e aí
   `WRONG_ANSWER` + `hud.lives.loseAll()` (como `GameScene.lose()` da Garra); a
   cena vai para `done`. Acerto = +10. O guia visual continua demonstrando a
   trocada falhando (sem emitir nada) antes da certa.
3. **Cor:** pastel chapado **só** nos quadros dos problemas e nas figuras dos
   passos (a tabela do TEXTURAS.md); personagem, peças e fundo só traço.
4. Itens 2 e 4 das Dúvidas: não se aplicam agora (só N1).

## Dúvidas para o usuário (respondidas acima)

1. **Erro: trava ou "errou, perdeu"?** A ficha pede a trava (§7). Na Garra você
   trocou para "errou, perdeu". Sigo a trava, ou faço igual à Garra?
2. **Três problemas inventados.** Cada nível tem 4 problemas e a ficha dá 5.
   Propus *pintar o desenho*, *calçar o tênis* e *fazer o sanduíche* para o N2,
   e o N3 volta a *lavar*, *feijão*, *pintar* e *sanduíche* com 4 passos. Aprova?
3. **Cor.** A imagem de referência é só traço e bochecha. Mantive isso no
   personagem e nas peças, mas **os quadros dos problemas precisam de cor**
   (água, espuma, terra, tinta, requeijão): propus pastel chapado só neles. Pode?
4. **O degrau vazado entrega a faltando.** Com o buraco à vista, a criança
   descarta essa escadinha sem ler. A ficha pede o buraco, e eu o mantive. Uma
   saída para o N3 (*passo escondido*): a faltando vem **sem buraco**, com 3
   degraus espaçados na mesma altura das outras, e a criança tem de perceber
   que falta um passo. Mantenho o buraco nos dois níveis ou tiro no N3?
5. **Escopo:** faço os 3 níveis, ou só o N1, como no piloto da Garra?

## Histórico

- **28/09/2026.** Primeiro planejamento (tocar o próximo degrau da rotina).
- **28/09/2026, ficha revista pelo usuário.** O jogo passou a ser escolher a
  escadinha que resolve o problema: a versão anterior estava parecida demais
  com o *Ritmo da Rotina*. Arte trocada para o chibi de rabisco
  (`references/29-chibi-rabisco.jpg`). Plano e texturas refeitos do zero.
