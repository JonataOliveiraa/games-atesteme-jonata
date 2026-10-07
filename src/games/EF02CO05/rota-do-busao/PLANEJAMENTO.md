# Rota do Busão — planejamento

Jogo **103** (o 102 virou o Cantinho do Tablet, de outra sessão) · EF02CO05 ·
2º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF02CO05.md`
(a mesma que foi colada no chat em 02/10/2026, sem revisão).
Padrão: `docs/rodada-3/PADRAO-R3.md` e `src/games/INSTRUCOES.md` ("A derrota").
Modelos: `EF02CO04/trem-peca-e-programa` (o mais recente: `createTutorial`,
arte medida, fases por bolinha) e `EF01CO06/maquina-dos-ajudantes` (situação
desenhada, um aparelho = uma coisa).

O plano segue a ficha e decide tudo pela régua "simples e claro" (§15).
- N1, N2 e N3 (o N2 e o N3 entraram em 05/10/2026, §12);
- **1 erro encerra**: `WRONG_ANSWER` + `lose()`, uma vez, com a cena do erro
  **antes** do `lose()`;
- tocar fora de um passageiro não custa nada.

**As duas dúvidas do §16 se resolveram** com a entrega das texturas e o pedido
"faça o jogo só com n1" (05/10/2026): ficou a ficha (opção a) e a linha chibi
de figurinha.

---

## 1. O jogo em uma frase

Um **busão escolar fofo** roda pelo bairro e para no ponto. O **letreiro do
ponto** mostra uma criança com um problema, como *"O sorvete vai derreter!"*.
No banco esperam **2 passageiros-tecnologia**, como a geladeira e a caixinha de
som, cada um com o nome embaixo. A criança **toca no passageiro que resolve**.
Ele vai até o letreiro e **resolve na frente dela**: a geladeira solta um ventinho
gelado e aparece o ✓. Depois ele embarca dando tchau e fica **acenando da
janela**.

São 6 paradas, e no fim da linha o mapa mostra cada problema e quem ajudou.

Um gesto só: **tocar** no passageiro.

## 2. A habilidade e os irmãos

> **(EF02CO05)** Reconhecer as características e usos das tecnologias
> computacionais no cotidiano dentro e fora da escola.

| O que a BNCC pede | Onde acontece |
|---|---|
| **usos** | cada parada é um uso do dia a dia (ver as horas, guardar o sorvete) e a criança liga ao aparelho que faz isso |
| **características** | cada passageiro **faz a sua ação** quando é tocado (notas, ventinho gelado, flash), e no erro ele diz o que faz: *"Eu toco música!"* |
| **no cotidiano** | as situações do N1 são de casa, coisas que a criança de 7 anos já viu |
| **dentro e fora da escola** | N2 traz a escola, N3 a praça e o mercado (§12) |

**O teste da bolinha:** se os passageiros fossem bolinhas sem desenho, não daria
para saber quem resolve o sorvete. O acerto depende de saber **para que serve**
cada aparelho.

**Irmãos com a mesma habilidade, e o problema (§16, dúvida 1):**

| Jogo | A decisão |
|---|---|
| *Cidade das Tecnologias* (R1, 012) | toca num prédio do mapa, lê a situação e escolhe entre 3 tecnologias, parado |
| *Corrida do Cotidiano* (R2, 057) | um balão mostra a situação; a criança escolhe entre **2 portões** com objetos enquanto corre; erro fecha o portão; no N3 há o portão **sem tecnologia** (regador); no fim, o mapa do bairro |
| **Rota do Busão** (esta ficha) | o letreiro mostra a situação; a criança escolhe entre **2–3 passageiros** com o ônibus parado; no N3 há o passageiro **sem tecnologia**; no fim, o mapa da rota |

A decisão é **a mesma da Corrida** (situação → objeto, entre 2, e o "sem
tecnologia" no N3), e o fim também (mapa). O que muda:
- o ônibus fica **parado** na hora de escolher: não há relógio;
- os objetos são **personagens** que fazem a própria ação;
- a turma se **acumula nas janelas**.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; o exemplo virou o tutorial (`createTutorial`, §9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 e o pedido de 02/10/2026 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre painel ilustrado | `?` pausa e repete os balões do tutorial | PADRAO-R3 |
| TRAVA: entra pela metade, cadeado, cena cômica 1,5 s, toca o certo e destrava (+5); após 2 travas o certo levanta a mão | **1 erro encerra**: o passageiro errado vai ao letreiro, tenta (faz a ação dele, que não resolve), aparece um **?** no letreiro e o balão com a frase-síntese (*"Eu toco música!"*), e então `WRONG_ANSWER` + `lose()` | INSTRUCOES "A derrota". Sem cadeado e sem segunda chance, a mão levantada não tem quando acontecer |
| "3 personagens no ponto" (gesto) × "2 por ponto" (N1) | N1 com **2**; N2 e N3 com **3** | a tabela de níveis da ficha |
| situações de casa: horas, comida gelada, música | as 3 da ficha **mais** falar com a vovó, ver desenho e esquentar a sopa, para fechar 6 paradas | a ficha só tem 3 situações de casa e pede 6 paradas |
| "guardar comida gelada" | **"O sorvete vai derreter!"** | é uma situação, não uma frase de adulto (Máquina dos Ajudantes) |
| liquidificador como distrator | **sai** | não é tecnologia computacional e ficaria do lado do "sem tecnologia" do N3 sem ser. Em vez dele, o micro-ondas, que tem painel e programa |
| 12 tecnologias + 2 sem tecnologia | **12 + 2** (§6) | mantido; duas tecnologias foram completadas (câmera e semáforo) |
| letreiro com a cena da situação | mantido, a cena em PNG **e** uma frase curta embaixo (*"Que horas são?"*) | o 2º ano lê frase curta com apoio do desenho |
| mapa final da rota | um **quadro em código** com a estrada pontilhada e 6 cartões situação → passageiro | não pede arte nova; o mapa pintado viraria uma folha a mais |
| 4 trechos de cidade em parallax | **um fundo só** (céu, calçada, rua) e os prédios passando como sprites: casas no N1; escola, mercado e praça (N2/N3) na mesma folha | um fundo serve aos 3 níveis; quem muda o trecho é o que passa |
| sons: motor, sininho, porta, chegada | sintetizados em WebAudio | PADRAO-R3 |
| telemetria por trecho e por situação | `CORRECT_ANSWER` por parada; `WRONG_ANSWER` no erro | a bridge não tem esses campos |

## 4. O laço

```
o busão anda (rua e casas passando, rodas girando) · o ponto chega da direita
· o busão freia e para
        │
        ▼
   o letreiro vira e mostra a situação (cena + frase)
   · os passageiros no banco olham para a frente, com o nome embaixo
        │ toque num passageiro (só agora vale)
        ▼
   ele pula do banco e vai até o letreiro · faz a ação dele
   ┌─────────────────┴──────────────────────────────┐
 resolve                                          não resolve
 a ação cobre a cena (notas, gelo, flash),        a ação não pega, um "?" pula no
 ✓ verde no letreiro, sininho,                    letreiro, balão "Eu toco música!"
 ele anda até a porta, a porta abre,              WRONG_ANSWER + lose() → done
 ele entra e aparece acenando na janela
 CORRECT_ANSWER (+10) · a bolinha da parada acende
        │
   ainda tem parada? ── sim ──► o busão buzina e segue; o ponto sai pela esquerda
        │ não (6)
   fim da linha: o terminal chega · a turma acena das 6 janelas
   · o mapa da rota (6 cartões) · showLevelComplete
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`. **Quando a arte chegar, o layout se ajusta
ao que for medido** (lição da Fábrica e do Trem).

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | 6 bolinhas das paradas em (194, 44), passo 30; `?` em (1220, 56), 96 × 96 | só as bolinhas |
| céu e prédios ao longe | y 0–520 | pintados no fundo, parados |
| prédios do trecho | pé em y 525, passando a meia velocidade | sprites (casas no N1) |
| calçada | y 520–600 | pintada lisa; as juntas andam por código |
| rua | y 600–720 | pintada lisa; as faixas tracejadas andam por código |
| **busão** | x 40–720, rodas tocando y 705, de frente para a **direita** | parado no lugar; quem anda é o mundo |
| 6 janelas | linha de janelas do busão (medidas) | quem embarcou aparece aqui, recortado pela janela |
| porta | perto da frente, x ≈ 640 (medida) | abre por código (retângulo escuro que cresce) |
| **ponto** | x 780–1260, pé na calçada em y 600 | o abrigo com o banco e a placa em branco |
| **letreiro** | placa do ponto, centro ≈ (1020, 270), ~300 × 220 | a cena da situação (~170 px) e a frase embaixo (26 px) |
| **passageiros** | no banco: 2 em x 920 e 1120 (N1); 3 em x 860, 1020, 1180 | ~160 px de altura, o nome numa plaquinha embaixo |
| balão do erro | acima do passageiro que tentou | ≤ 5 palavras |
| quadro do fim | (640, 380), 1000 × 440 | estrada pontilhada e 6 cartões |

**Densidade:** **2 alvos** no N1 e 3 no N2/N3, mais o `?`. Na tela, o letreiro
e os passageiros; o busão e as casas são cenário e não respondem ao toque.

**A zona de toque** de cada passageiro é uma caixa de ~160 × 220 sobre ele e o
nome. Tocar fora dela não faz nada.

**Teclado:** `1` `2` `3` escolhem o passageiro da esquerda para a direita; `H`
repete o tutorial.

## 6. Passageiros, situações e paradas (`data/`)

### Os passageiros (`data/riders.ts`)

| id | Nome na plaquinha | Tecnologia? | Ação (código) | Frase-síntese (balão) |
|---|---|---|---|---|
| `clock` | RELÓGIO | sim | os ponteiros giram, "tic-tac" | Eu mostro as horas! |
| `fridge` | GELADEIRA | sim | ventinho gelado com floquinhos | Eu deixo a comida gelada! |
| `speaker` | CAIXINHA DE SOM | sim | notas saindo | Eu toco música! |
| `phone` | CELULAR | sim | ondinhas de ligação | Eu ligo para quem está longe! |
| `tv` | TELEVISÃO | sim | a tela acende e pisca | Eu passo desenho! |
| `microwave` | MICRO-ONDAS | sim | ondinhas de calor | Eu esquento a comida! |
| `computer` | COMPUTADOR | sim | a tela acende com uma listinha | Eu guardo a lista da turma! |
| `projector` | PROJETOR | sim | um facho de luz | Eu mostro tudo na parede! |
| `camera` | CÂMERA | sim | flash | Eu tiro fotos! |
| `cardMachine` | MAQUININHA | sim | "bip" e o cartão passando | Eu pago com o cartão! |
| `scale` | BALANÇA | sim | o visor acende | Eu digo quanto pesa! |
| `trafficLight` | SEMÁFORO | sim | a luz verde acende | Eu aviso a hora de atravessar! |
| `pencil` | LÁPIS | **não** | um risquinho | Eu escrevo sem tomada! |
| `wateringCan` | REGADOR | **não** | gotinhas | Eu molho as plantas! |

### As situações (`data/situations.ts`)

Cada situação tem **um dono** (o passageiro certo) e uma frase curta para o
letreiro. A cena **nunca mostra o aparelho que resolve** (a regra está no
TEXTURAS).

| id | Frase no letreiro | Dono | Nível |
|---|---|---|---|
| `time` | Que horas são? | relógio | 1 |
| `iceCream` | O sorvete vai derreter! | geladeira | 1 |
| `music` | Quero ouvir música! | caixinha | 1 |
| `grandma` | Quero falar com a vovó! | celular | 1 |
| `cartoon` | Quero ver desenho! | televisão | 1 |
| `soup` | A sopa está fria! | micro-ondas | 1 |
| `rollCall` | Hora da chamada! | computador | 2 |
| `story` | A história na parede! | projetor | 2 |
| `photo` | Vamos tirar uma foto! | câmera | 2 (e o treino) |
| `fare` | Pagar a passagem! | maquininha | 3 |
| `fruit` | Quanto pesam as frutas? | balança | 3 |
| `cross` | Posso atravessar? | semáforo | 3 |
| `notebook` | Escrever no caderno! | lápis | 3 |
| `garden` | A flor está murcha! | regador | 3 |

### Quem mais resolve (`SOLVES`, a trava da resposta única)

Muitos aparelhos fazem mais de uma coisa. O celular mostra as horas, toca
música, passa desenho, tira foto e paga. A tabela `SOLVES` lista **todos** os
passageiros que resolvem cada situação, e a validação exige que, em cada
parada, **exatamente um** dos passageiros do banco esteja nela.

| situação | resolvem |
|---|---|
| `time` | relógio, celular, micro-ondas, computador |
| `iceCream` | geladeira |
| `music` | caixinha, celular, televisão, computador |
| `grandma` | celular, computador |
| `cartoon` | televisão, celular, computador, projetor |
| `soup` | micro-ondas |
| `rollCall` | computador, celular |
| `story` | projetor |
| `photo` | câmera, celular |
| `fare` | maquininha, celular |
| `fruit` | balança |
| `cross` | semáforo |
| `notebook` | lápis |
| `garden` | regador |

### As 6 paradas do N1 (`data/levels.ts`)

Pares óbvios, só passageiros de casa, e cada um aparece **uma vez como certo e
uma vez como errado**.

| Parada | Situação | Esquerda | Direita |
|---|---|---|---|
| 1 | Que horas são? | **relógio** | geladeira |
| 2 | Quero ouvir música! | micro-ondas | **caixinha** |
| 3 | Quero falar com a vovó! | relógio | **celular** |
| 4 | Quero ver desenho! | **televisão** | caixinha |
| 5 | A sopa está fria! | televisão | **micro-ondas** |
| 6 | O sorvete vai derreter! | **geladeira** | celular |

```ts
type RiderId = 'clock' | 'fridge' | ...
interface Rider { id: RiderId; name: string; tech: boolean; line: string; cell: number }
interface Situation { id: SituationId; text: string; owner: RiderId; cell: number }
interface StopDef { situation: SituationId; riders: RiderId[] }
interface LevelDef { level: number; stops: StopDef[]; ridersPerStop: 2 | 3 }

isRight(stop, rider) => SITUATIONS[stop.situation].owner === rider
```

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- 6 paradas por nível, e `riders.length === ridersPerStop` em todas;
- em cada parada, o dono está no banco e **só ele** está em `SOLVES[situação]`;
- nenhuma situação se repete no nível;
- o certo fica à esquerda em 3 paradas e à direita em 3 (N1), e nunca 3
  seguidas do mesmo lado;
- N1: só passageiros e situações de casa, nenhum `tech: false`;
- N3: o dono é `tech: false` em **exatamente 2** paradas, e o lápis ou o
  regador aparece como errado em pelo menos uma;
- a frase do letreiro cabe (≤ 24 letras) e o nome cabe na plaquinha (≤ 15).

## 7. O erro

**Tocar no passageiro que não resolve = 1 erro, encerra.** A cena vem antes do
`lose()` e dura ~1,2 s:

1. Ele pula do banco e vai até o letreiro.
2. Faz **a ação dele**: a caixinha solta notas em cima de *"Que horas são?"*.
   A ação não "pega": as notas batem na placa e caem.
3. Um **?** grande pula no canto do letreiro, e o balão sai do passageiro com a
   frase-síntese: *"Eu toco música!"*.
4. `WRONG_ANSWER` + `lose()` e `if (this.lives.remaining <= 0) return`.

Sem vermelho de alerta e sem som áspero. O passageiro coça a cabeça.

**Não é erro:**
- tocar enquanto o busão anda, chega ou o passageiro caminha (é ignorado);
- tocar no banco vazio, no busão, no letreiro ou no HUD;
- o `?`.

**Pontos e estrelas:** +10 por parada (`CORRECT_ANSWER` quando o ✓ aparece).
**3 estrelas** ao concluir, porque concluir já significa zero erro.

**Pista que entrega (conferido):**
- os passageiros ficam no mesmo tamanho, sem brilho, e a mesma plaquinha de nome;
- o lado do certo varia e é validado (3 de cada lado);
- a cena da situação nunca desenha o aparelho que resolve;
- a ação de cada passageiro só aparece **depois** do toque;
- no N3, o lápis e o regador são desenhados igual aos outros (rosto, braços,
  pernas), sem marca de "sem tecnologia" no banco. A marca só aparece no quadro
  do fim.

## 8. O acerto, a viagem e o fim

**Acerto:** o passageiro vai ao letreiro e faz a ação **sobre a cena**. As notas
enchem a placa de *"Quero ouvir música!"*, e o ✓ verde carimba o canto. Toca o
sininho de cordinha. Ele desce até a porta, a porta abre, ele entra (some
encolhendo) e reaparece na **próxima janela livre**, acenando. A bolinha da
parada acende no HUD.

**A viagem (~2,4 s entre paradas):** o busão buzina ("fon-fon" fofo), as rodas
giram, a carroceria balança de leve, e as faixas da rua, as juntas da calçada
e as casas correm para a esquerda (as casas a meia velocidade). O ponto chega
pela direita e freia com o busão. Quem ficou no banco acena enquanto o ponto
sai pela esquerda.

**Fim do nível:**
1. O **terminal** chega no lugar do ponto (fim da linha). A turma das 6
   janelas acena junta.
2. O **mapa da rota** (quadro em código): uma estrada pontilhada com 6
   paradas, e em cada uma um cartão *cena da situação → passageiro*, que
   entram um por um com um "plim".
3. Confete e o `showLevelComplete`.

## 9. Tutorial (`createTutorial`, uma frase por balão)

Chave `ef02co05-l1`, com `teach(scene, key, steps)` como no Trem (`textSize 30`,
`once: false`, `safeTop 90`). A demonstração usa uma **parada de treino** que
não conta: *"Vamos tirar uma foto!"*, com a **câmera** e a **geladeira** no
banco (a câmera não é do N1).

1. O busão chega e para. Recorte no **letreiro**: *"O letreiro mostra o problema
   de alguém."* (Próximo)
2. Recorte nos **passageiros**: *"Estes passageiros são tecnologias. Cada um
   sabe fazer uma coisa."* (Próximo)
3. Recorte em letreiro + câmera, dedo tocando a câmera: *"Quem tira foto? A
   câmera! Toque nela."* (Ver) → a câmera vai ao letreiro, dá o flash, o ✓
   aparece, ela embarca e surge na janela.
4. Recorte na janela: *"Ela embarcou! Ajude todo mundo da viagem."* (Vamos
   começar!) → a câmera sai da janela, o ponto vai embora e a parada 1 chega.

O `?` pausa e repete os passos 1 e 2 e mais um: *"Toque no passageiro que
resolve o problema."* (Continuar). Depois a parada volta como estava.

**Dá para entender o objetivo sem ler?** Quase. A cena do letreiro e a ação do
passageiro mostram tudo, e a demonstração faz o caminho inteiro. As frases do
letreiro e os nomes são apoio para quem já lê.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| andando | rodas, balanço, faixas e casas correndo | motorzinho fofo em laço baixo |
| chegando | o ponto freia, o letreiro vira | chiado de freio + "plim" |
| toque | o passageiro pula do banco | "boing" curto |
| acerto | ação sobre a cena, ✓, embarque, aceno da janela | sininho de cordinha + porta "pssh" |
| erro | ação que não pega, "?", balão | duas notas descendo |
| partida | buzina, quem ficou acena | "fon-fon" |
| fim | terminal, turma acenando, mapa, confete | acorde de chegada |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · drive · arrive · choose · act · board · wrong · finale · done · panel`.
O toque só vale em `choose`. `startLevel` faz `++gen`, e todo `await` é seguido
de `if (gen !== this.gen) return`.

A bridge segue o Trem: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` por parada, `WRONG_ANSWER` + `lose()` no erro, `CHECKPOINT`
com `progress = round(paradas / 6 × 100)`,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START. O jogo nunca emite `GAME_OVER` e nunca escreve
`isFinalStage`.

## 12. N2 e N3 (feitos em 05/10/2026; as paradas finais estão no histórico)

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **distratores que parecem certos**, e a escola | 3 passageiros por ponto; 3 paradas de casa e 3 de escola; o trecho troca as casas pela **escola** passando. Paradas, com o certo em negrito: chamada (**computador** · televisão · caixinha), história na parede (**projetor** · televisão · câmera), foto da turma (**câmera** · relógio · projetor), sopa fria (**micro-ondas** · geladeira · televisão), sorvete (**geladeira** · micro-ondas · caixinha), horas (**relógio** · caixinha · geladeira). A `SOLVES` garante que o distrator "quase" nunca resolve de verdade |
| 3 | **onde a tecnologia não está** | rota completa (casa → escola → praça → mercado passando); o **lápis** e o **regador** entram; são donos em 2 paradas (caderno, flor murcha) e errados em outras (ex.: *Pagar a passagem!* com **maquininha** · lápis · relógio). No mapa do fim, os cartões do lápis e do regador ganham a etiqueta **SEM TECNOLOGIA** |

## 13. Arquivos, texturas e quem mexe

| Lógica | Peças e apresentação |
|---|---|
| `types.ts`, `data/riders.ts`, `data/situations.ts` (com `SOLVES`), `data/levels.ts` (paradas, validação), `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (viagem, escolha, erro, fim) | `data/layout.ts`, `data/theme.ts`, `data/words.ts`, `scenes/street.ts` (fundo, faixas, juntas, prédios passando), `bus.ts` (busão, rodas, porta, janelas), `stop.ts` (ponto, letreiro, banco, plaquinhas), `rider.ts` (passageiro, ações, balão), `finale.ts` (terminal e mapa), `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi de figurinha**, `19`, sujeita à dúvida 2; prompts no
[TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-rua.png` | 1280 × 720 | céu, telhados ao longe, calçada e rua **lisas** |
| `cenario.png` | 4 × 2, 512 | 3 casas, árvore, escola, mercadinho, coreto da praça, poste com arbusto |
| `onibus.png` | 2 × 2, 1024 × 512 | busão sem rodas, ponto com placa em branco, roda, terminal |
| `passageiros.png` | 4 × 4, 256 | os 14 passageiros (12 + 2 sem tecnologia) |
| `situacoes.png` | 4 × 4, 256 | as 14 cenas de situação |
| `cover-rota-do-busao.png` | 1672 × 941 | capa **com o título** |

**Código:**
- a frase do letreiro, as plaquinhas de nome, o ✓ e o "?";
- as ações dos passageiros (notas, floquinhos, ondinhas, facho, flash, gotinhas…);
- o balão, as faixas da rua e as juntas da calçada;
- a porta abrindo e o vidro sobre quem está na janela;
- o mapa do fim, o confete, as bolinhas do HUD e o `?`.

**Antes da arte:** retângulos e círculos com o nome, só para testar.

**Registro:** id = `NEXT_FREE_ID` no commit (hoje **102**), que avança um. O slug
é `rota-do-busao`. O jogo entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, ganha
3 frases em `gameInstructions.ts` e `public/og/rota-do-busao.jpg`. A categoria é
**Cultura Digital**.

## 14. Travas para quem mexer depois

- A resposta mora **só** no par situação → passageiro, e a `SOLVES` garante que
  **um único** passageiro do banco resolve.
- A cena da situação **nunca** desenha o aparelho que resolve.
- O toque **só vale com o busão parado** e o letreiro aceso (`mode === 'choose'`).
- A ação do passageiro aparece só **depois** do toque.
- A cena do erro vem **antes** do `lose()` e cabe em ~1,2 s.
- O layout se ajusta à **arte medida** (janelas, porta, placa do ponto).
- `ridersPerStop` e o trecho são dados do nível, não `if` na cena.

## 15. Decisões (régua "simples e claro")

1. **O ônibus para e espera:** não há relógio, e a escolha é um toque no
   passageiro.
2. **O passageiro resolve na frente da criança** (a ação sobre a cena), no acerto
   e no erro. O erro mostra o que ele faz de verdade, o que vale pela "frase-síntese"
   da ficha.
3. **6 situações de casa no N1**, todas da vida da criança: as 3 da ficha mais
   vovó, desenho e sopa. Saem o liquidificador e a frase "guardar comida
   gelada".
4. **A tabela `SOLVES`** em vez de confiar no olho. O celular resolve quase tudo,
   então ele só entra como errado onde não resolve.
5. **Nomes escritos** embaixo dos passageiros e frase curta no letreiro: o 2º
   ano lê com apoio do desenho, e nenhum ícone fica sem nome.
6. **Mapa do fim em código**, e **um fundo só**, com os prédios passando.

## 16. Dúvidas

1. **A ficha repete a *Corrida do Cotidiano* (R2, 057).** A decisão é a mesma:
   uma situação, 2 objetos, e o "sem tecnologia" (o regador) no N3. O mapa no
   fim também é o mesmo. O plano acima segue a ficha. Alternativas:
   - **(a) Manter a ficha** (recomendado). Ela é calma (sem corrida e sem
     relógio), os objetos viram personagens que fazem a própria ação, e a turma
     se junta nas janelas. Para o 2º ano é a versão mais clara. A Corrida é a
     versão de reflexo.
   - **(b) "Onde ele desce?"** O passageiro embarca primeiro, fazendo a ação
     dele, e a criança escolhe **em que parada** ele desce: casa, escola,
     mercado ou praça. Isso é o *dentro e fora da escola* da BNCC. Os aparelhos
     que servem em todo lugar (o celular) ficam de fora. Muda o §4, o §6 e o
     letreiro (vira a placa do lugar); o TEXTURAS quase não muda.
   - **(c) "Quem não é tecnologia?"** Em cada ponto, 3 passageiros, e um deles
     (lápis, regador, livro, bola…) **não** embarca no "busão das tecnologias".
     É a ideia do N3 da ficha virando o jogo inteiro. Pede mais passageiros sem
     tecnologia e tira a situação do letreiro.
2. **A linha de arte.** O TEXTURAS está na **chibi de figurinha** (`19`), a
   padrão da rodada. Se quiser outra, troco só o bloco de estilo dos prompts.

## Histórico

- **02/10/2026.** Primeiro planejamento, a partir da ficha original, com as
  duas dúvidas do §16.
- **05/10/2026, o N1 feito, já com a arte** (pedido: "texturas adicionadas.
  faça o jogo só com n1").
  - Id **103**, `NEXT_FREE_ID` foi para 104. No catálogo, em
    `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` e com 3 frases em
    `gameInstructions.ts`. A capa chegou no mesmo dia (título com o "ã" conferido): virou a miniatura do catálogo e `public/og/rota-do-busao.jpg`.
  - As folhas vieram em outros tamanhos (`onibus.png` sem grade); caixas
    medidas no `MANIFEST.md` dos assets e em `data/files.ts`.
  - **A placa do ponto veio larga e baixa** (142 × 52): ela leva só a frase, e a
    cena da situação virou um **cartão acima do ponto** (184 px), que é onde o
    ✓ e o "?" aparecem. Os passageiros ficam **na calçada, na frente do
    banco**, com o nome numa plaquinha embaixo.
  - Posições finais: busão de x 24 a ~696, rodas no chão em y 702; ponto em
    x 985 com o pé em y 545; cartão em (985, 152); passageiros em x 890 e 1075,
    pé em y 576; as casas passam a meia velocidade com o pé em y 504.
  - A ação de cada passageiro são 6 figurinhas (notas, floquinhos, ondinhas,
    luz…) voando até o cartão: entram no acerto e caem no erro.
  - Conferido no navegador: o tutorial inteiro (letreiro, passageiros, a câmera
    resolvendo a foto, embarcando e acenando da janela), as 6 paradas, o
    terminal com a turma nas janelas, o mapa da rota, o painel "Fim da linha!"
    com 3 estrelas e `GAME_COMPLETED {stage 1, totalStages 1}`; o erro (a
    geladeira em *"Que horas são?"*: "?" no cartão, o balão *"Eu deixo a comida
    gelada!"*, `WRONG_ANSWER` e `GAME_OVER`); e o `?`.
- **05/10/2026, foco e embarque** (pedido: "as casinhas e todo resto do plano de
  fundo deveria ser menos destacado… quando o jogo pedir pro jogador escolher…
  deixe mais focado nas opções… e quando o objeto for subir no busão, coloque
  uma animação").
  - O fundo e as casas ganharam uma **névoa clara** fixa (42%), e as casas
    ficaram menores (escala 0,85).
  - Na escolha, um **véu escuro** (50%) apaga o busão e o cenário; ficam acesos
    só o cartão do problema, a placa com a frase e os passageiros (o ponto foi
    para cima do véu). O véu sai depois do ✓; no erro ele fica.
  - **Embarque:** o passageiro vai **pulando** até a porta (passinhos com som),
    a porta abre, ele **acena tchau**, **sobe o degrau** de um salto, o busão
    afunda de leve com o peso, ele entra pela porta, toca o sininho e ele
    aparece acenando na janela.
- **05/10/2026, N2 e N3** (pedido: "faz n2 e n3").
  - **N2, em casa e na escola:** 3 passageiros por ponto, 3 paradas de casa e 3
    de escola, a escola passando no cenário. Paradas (certo em negrito): chamada
    (televisão · **computador** · caixinha), sopa (**micro-ondas** · geladeira ·
    televisão), história na parede (televisão · câmera · **projetor**), sorvete
    (caixinha · **geladeira** · micro-ondas), foto (projetor · relógio ·
    **câmera**), horas (**relógio** · caixinha · geladeira).
  - **N3, a rota completa:** casa → escola → praça → mercado. Música (lápis ·
    **caixinha** · geladeira), caderno (computador · projetor · **lápis**),
    atravessar (câmera · regador · **semáforo**), flor murcha (**regador** ·
    celular · semáforo), passagem (**maquininha** · lápis · relógio), frutas
    (regador · **balança** · maquininha). O lápis e o regador são donos em 2
    paradas e errados em 4; no mapa do fim eles ganham a etiqueta **SEM
    TECNOLOGIA**.
  - **Apresentação curta** no 1º ponto do N2 e do N3 (um balão sobre os
    passageiros, sem demonstração): *"Agora são 3 passageiros, e alguns quase
    servem. Olhe bem!"* e *"O lápis e o regador não são tecnologia, mas às vezes
    são eles que resolvem!"*. O treino da câmera fica só no N1, e por isso a
    foto pode entrar no N2.
  - Com 3 passageiros: x 825, 985 e 1145, nome em 15 px, toque de 150 px de largura.
  - Validação nova: o N2 não sai de casa e escola e tem 3 de escola; sem
    tecnologia só no N3, com 2 donos e pelo menos um errado; o N3 passa por
    casa, escola e cidade; com 3 passageiros, o certo ocupa as 3 posições.
  - Conferido no navegador: a validação sem problemas; o N2 inteiro
    (`GAME_COMPLETED {2, 3}`, avançando sozinho), o N3 inteiro (mapa com as
    etiquetas, "Fim da linha!", JOGAR DE NOVO, `GAME_COMPLETED {3, 3}`) e um erro
    no N3 (o lápis em *"Quero ouvir música!"*: *"Eu escrevo sem tomada!"*,
    `WRONG_ANSWER` e `GAME_OVER`).
