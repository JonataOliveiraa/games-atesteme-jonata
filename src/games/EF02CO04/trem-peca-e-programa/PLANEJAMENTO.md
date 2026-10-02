# Trem Peça & Programa — planejamento

Jogo **100** (o `NEXT_FREE_ID` de hoje; confirmar no registro) · EF02CO04 ·
2º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF02CO04.md`
(a mesma que foi colada no chat em 02/10/2026, sem revisão).
Padrão: `docs/rodada-3/PADRAO-R3.md` e `src/games/INSTRUCOES.md` ("A derrota").
Modelos: `EF02CO01/fabrica-de-carimbos` (o mais recente, com a lição da caixa
recortada) e `EF01CO05/pescaria-dos-codigos`.

**Tudo decidido pela régua "simples e claro".** Não há dúvidas abertas. As
escolhas estão no §15.

- só o **N1**;
- **1 erro encerra**: `WRONG_ANSWER` + `lose()`, uma vez, com a cena do erro
  **antes** do `lose()`;
- **erro de dedo não custa nada**.

O N2 e o N3 da ficha estão no §12.

---

## 1. O jogo em uma frase

No alto do pátio, um **funil** solta um item por vez: um mouse, um joguinho, um
teclado, um app de música… O item desce pelo trilho e **para na agulha**, o
desvio em Y, crescendo com o **nome** embaixo. A criança **toca no lado** do
vagão certo. A agulha vira, e o item desliza para dentro do vagão.
- à **esquerda**, o vagão **PEÇAS** (*posso tocar*);
- à **direita**, o vagão **PROGRAMAS** (*dão ordens*).

Depois de 4 itens, o trem apita e parte. No fim, um programa **dá uma ordem** a
uma peça na frente da criança: o app de música manda, e a caixinha toca.

Um gesto só, **tocar**, e só dois lugares: a metade esquerda e a metade direita.

## 2. A habilidade e os irmãos

> **(EF02CO04)** Diferenciar componentes físicos (hardware) e programas que
> fornecem as instruções (software) para o hardware.

| O que a BNCC pede | Onde acontece |
|---|---|
| **componente físico** (hardware) | o vagão PEÇAS: o que dá para **pegar na mão** |
| **programa** (software) | o vagão PROGRAMAS: o que **dá ordens** e não se pega |
| **diferenciar** | cada item é uma decisão, e o erro mostra por quê ("Dá para pegar na mão?") |
| **que fornecem as instruções para o hardware** | no fim, o app de música manda as ordens e a caixinha obedece; o quadro diz *peça = HARDWARE, programa = SOFTWARE* |

**O teste da bolinha:** se os dois vagões recebessem qualquer coisa, a agulha
viraria enfeite. Por isso cada item tem **um** vagão certo, e o erro **mostra o
item sendo recusado pelo vagão** antes de acabar.

**Irmãos com a mesma habilidade:**
- *Museu Vivo do Computador* (R1): explorar peças e ver o que é hardware e o que
  é software.
- *Fuga do Laboratório* (R2): montar a máquina com uma peça na bandeja e um
  programa no leitor.

Aqui a ação é **classificar um por um, em sequência**. É o único que tem o
ritmo de esteira, e a decisão é sempre a mesma pergunta.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | não tem título; o exemplo virou o guia visual (§9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia visual | PADRAO-R3 |
| "tocar na tela alterna a agulha"; o item cai sozinho em 3 s e vale o lado em que a agulha estiver | o item **para na agulha e espera**. A criança **toca o lado** (metade esquerda = PEÇAS, metade direita = PROGRAMAS), e só então ele desce | com 1 erro encerrando, um "alternar" a mais ou um atraso viraria derrota por dedo. Esperar tira o relógio, e tocar o lado diz a escolha sem contar toques |
| lado errado: TRAVA (quica, cadeado, balão-dica, tocar o lado certo destrava, +5; após 2 travas o vagão certo acende) | **1 erro encerra**: o item escorrega para o vagão errado, o vagão o **cospe** e ele fica suspenso com o balão-dica, e **depois** `WRONG_ANSWER` + `lose()` | INSTRUCOES "A derrota" |
| rodada = 8 itens | **2 fases de 4 itens** (2 PEÇAS + 2 PROGRAMAS cada), e a cada fase o trem **parte** | o trem saindo é a recompensa; com 4 por viagem ela vem duas vezes |
| "item da vez mostrado grande com nome curto" | mantido: na agulha ele cresce, com o nome numa plaquinha | — |
| contador do vagão | **4 bolinhas** na lateral do vagão, que acendem | número escrito é leitura a mais |
| quadro final 'isso é HARDWARE / isso é SOFTWARE' | mantido, e antes dele uma **cena de ordem** (o app de música manda, a caixinha toca), sem toque | o "fornecem as instruções para o hardware" da BNCC aparece no N1 sem virar mecânica nova; o parear de verdade é do N3 |
| 3 níveis | só o **N1** (`LEVELS.length === 1`); N2 e N3 no §12 | INSTRUCOES |
| sons | sintetizados em WebAudio (queda, baque, apito, corrente) | PADRAO-R3 |
| telemetria: desvios de primeira, capciosos, pares | `CORRECT_ANSWER` por item; `WRONG_ANSWER` no erro | a bridge não tem esses campos |

## 4. O laço

```
fase nova · o trem entra pela direita (locomotiva + 2 vagões vazios) e para
· o funil acorda
        │
        ▼
   o funil solta o item · ele desce pelo trilho (~1,2 s)
   · para na agulha, cresce, a plaquinha com o nome aparece
   · as duas setinhas da agulha pulsam (esquerda e direita, iguais)
        │ toque na metade esquerda ou direita (só agora vale)
        ▼
   a agulha vira para o lado tocado · o item desliza pelo galho do Y
   ┌─────────────────┴───────────────────────┐
 vagão certo                             vagão errado
 cai dentro com baque macio,             cai, o vagão balança e COSPE o item,
 a bolinha do vagão acende,              que fica suspenso acima dele, com o
 apito curto                             balão-dica ("Dá para pegar na mão?")
 CORRECT_ANSWER (+10)                    WRONG_ANSWER + lose() → done
        │
   ainda tem item? ── sim ──► próximo item
        │ não (4)
   o trem apita e parte pela esquerda · fase 2, ou fim:
   cena de ordem (app de música → caixinha) · quadro PEÇA = HARDWARE /
   PROGRAMA = SOFTWARE · showLevelComplete
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`. O funil, o trilho vertical, o Y e a linha
de baixo vêm **pintados no fundo**. Quando a arte chegar, **o layout se ajusta
ao fundo medido** (lição da Fábrica), e não o contrário.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas em (40, 40), ocultas; 2 bolinhas das fases em (194, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas |
| funil | boca em (640, 150) | pintado; o item nasce aqui |
| trilho vertical | x 640, de y 170 até a agulha | pintado |
| agulha | pivô em (640, 360); a lâmina (PNG) gira ±28° | a peça que vira |
| item na agulha | centro (640, 300), ~150 px, e plaquinha com o nome em (640, 395) | o item "da vez" |
| galhos do Y | da agulha até a boca de cada vagão: (330, 520) e (950, 520) | pintados |
| vagão PEÇAS | centro (330, 600), ~300 × 150 | placa na frente: ícone de mão + **PEÇAS** + *posso tocar*; 4 bolinhas |
| vagão PROGRAMAS | centro (950, 600), ~300 × 150 | placa: ícone de ordens + **PROGRAMAS** + *dão ordens*; 4 bolinhas |
| locomotiva | (1180, 590), ~220 px, de frente para a direita | puxa os dois vagões |
| zona de toque | metade esquerda (x < 640) e metade direita (x ≥ 640), de y 110 a 720 | só valem com o item parado na agulha |
| balão-dica | acima do vagão onde o item ficou suspenso | ≤ 5 palavras |
| quadro final | (640, 330), 900 × 380 | as duas colunas e a frase-síntese |

**Densidade.** Há **2 regiões tocáveis** (as metades) mais o `?`. Na tela, o
item da vez e os 2 vagões.

**Teclado:** `←` escolhe PEÇAS, `→` escolhe PROGRAMAS, `H` repete o guia.

## 6. Itens e fases (`data/levels.ts`)

### Os itens (`data/items.ts`)

| id | Nome na plaquinha | Tipo | N1? | Observação |
|---|---|---|---|---|
| `mouse` | MOUSE | peça | sim | |
| `keyboard` | TECLADO | peça | sim | |
| `speaker` | CAIXINHA DE SOM | peça | sim | ganha a ordem no fim |
| `gamepad` | CONTROLE | peça | sim | |
| `screen` | TELA | peça | N2 | capcioso |
| `camera` | CÂMERA | peça | N3 | par do app de fotos |
| `robot` | ROBÔ | peça | N2 | capcioso |
| `game` | JOGUINHO | programa | sim | |
| `music` | APP DE MÚSICA | programa | sim | dá a ordem no fim |
| `paint` | APP DE DESENHO | programa | sim | |
| `alarm` | DESPERTADOR | programa | sim | o app, não o relógio de mesa |
| `photos` | APP DE FOTOS | programa | N3 | |
| `dance` | DANCINHA DO ROBÔ | programa | N2 | capcioso |

Os **programas** são desenhados como **ícone de app**: um quadradinho de cantos
redondos com o símbolo dentro, como na tela de um tablet. As **peças** são
desenhadas como **objeto**, de lado, com volume. Isso é o conteúdo (software não
tem corpo, só aparece como ícone), e não uma pista paralela: nenhuma cor, brilho,
borda ou som diferente separa os dois grupos. O símbolo de um app **nunca** é a
peça que ele usa (o app de fotos é uma montanha com sol, não uma câmera; o
joguinho é um bonequinho pulando, não um controle).

### As 2 fases do N1

| Fase | Itens (embaralhados no `startPhase`) |
|---|---|
| 1 | mouse · teclado · joguinho · app de música |
| 2 | caixinha de som · controle · app de desenho · despertador |

Regras do embaralhar: nunca 3 do mesmo tipo seguidos e, na fase 1, o primeiro
item é uma **peça** (o guia ensina com uma peça; a fase começa igual).

```ts
type Kind = 'part' | 'program'
interface Item { id: ItemId; name: string; kind: Kind; cell: number }
interface PhaseDef { id: string; items: ItemId[] }
interface LevelDef { level: number; phases: PhaseDef[]; dropMs: number; wait: boolean; pairs: [ItemId, ItemId][] }

sideOf(kind) => kind === 'part' ? 'left' : 'right'
isRight(item, side) => sideOf(item.kind) === side
```

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- `phases.length === 2` (≤ 5), 4 itens por fase, **2 peças e 2 programas**;
- nenhum item se repete no nível;
- N1: nenhum item capcioso (`screen`, `robot`, `dance`), `wait === true`;
- a cena de ordem do fim (`music → speaker`) usa itens que **apareceram** no nível;
- todo programa tem um símbolo que não é peça (tabela fixa `SYMBOL_IS_PART = false`);
- o nome cabe na plaquinha (≤ 16 letras).

## 7. O erro

**Mandar o item para o vagão errado = 1 erro, encerra.** A cena vem antes do
`lose()` e dura ~1,2 s:

1. A agulha vira e o item desliza para o vagão escolhido.
2. Ele cai dentro, o vagão **balança** e **cospe** o item, que sobe e fica
   **suspenso** acima da borda, girando devagar.
3. Aparece o balão-dica, que é a pergunta da ficha:
   - peça no vagão PROGRAMAS: *"Dá para pegar na mão?"*;
   - programa no vagão PEÇAS: *"Isso dá ordens?"*.
4. `WRONG_ANSWER` + `lose()` e `if (this.lives.remaining <= 0) return`.

Sem vermelho de alerta e sem som áspero: o vagão faz um "boing" bobo.

**Não é erro:**
- tocar enquanto o item cai ou desliza (é ignorado);
- tocar no HUD;
- o `?`.

**Pontos e estrelas:** +10 por item (`CORRECT_ANSWER` quando ele cai no vagão).
**3 estrelas** ao concluir, porque concluir já significa zero erro.

**Pista que entrega (conferido):**
- os dois vagões são **o mesmo PNG**, e só a placa muda;
- as setinhas da agulha pulsam **iguais** dos dois lados;
- a agulha volta para o **meio** a cada item, sem lembrar o lado anterior;
- a única fonte da resposta é **o item** (objeto ou app) e o nome dele.

## 8. O acerto, a partida do trem e o fim

**Acerto:** o item cai no vagão com um baque macio e some lá dentro (fica a
pontinha aparecendo, como na caixa da Fábrica). A bolinha do vagão acende. A
locomotiva solta um apito curto e uma nuvenzinha de fumaça.

**Fim da fase (4 itens):** apito longo, as rodas giram, e o trem sai pela
esquerda. Um trem vazio entra pela direita para a fase 2.

**Fim do nível:**
1. O trem volta, parado, com os 8 itens.
2. **Cena de ordem** (~2 s, sem toque): o **app de música** sai do vagão
   PROGRAMAS e flutua ao lado da **caixinha de som**, que sai do vagão PEÇAS.
   Ondinhas de "ordem" vão do app até a caixinha, e a caixinha **toca**: notas
   saem dela e soa uma melodia.
3. O **quadro-síntese**: à esquerda, os itens de PEÇAS com **HARDWARE**; à
   direita, os de PROGRAMAS com **SOFTWARE**. Embaixo: *"Peça que a gente toca =
   HARDWARE. Programa que dá ordens = SOFTWARE."*
4. O trem parte, cai confete, e vem o `showLevelComplete`.

## 9. Guia visual (2º ano, visual com frase curta)

`shared/guide/createVisualGuide` com véu e dedo, chave `ef02co04-l1`, usando
**itens de treino que não contam** (um de cada tipo, fora das fases: `camera`
e `photos`). Não há passo de espera com o dedo pulsando.

1. **Os vagões.** O véu deixa os dois vagões acesos, um de cada vez, com a
   placa pulsando. Sem legenda (a placa já diz).
2. **Uma peça.** A câmera cai do funil e para na agulha. Legenda: **Dá para
   pegar? PEÇAS!** O dedo toca a metade esquerda, a agulha vira e a câmera cai
   no vagão PEÇAS.
3. **Um programa.** O app de fotos cai e para. Legenda: **Dá ordens?
   PROGRAMAS!** O dedo toca a metade direita, e o app cai em PROGRAMAS.
4. Os dois itens de treino somem dos vagões, e a fase 1 começa.

O `?` pausa e repete os passos 1 a 3. Depois o item da vez volta para a agulha,
esperando.

**Dá para entender o objetivo sem ler?** Quase. A placa de cada vagão tem
pictograma (mão / ordens), e o guia mostra os dois casos. O 2º ano lê
"PEÇAS"/"PROGRAMAS" com o apoio do pictograma.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| funil solta | o funil sacode, o item cai e quica na agulha | "plop" + assobio de queda |
| na agulha | o item cresce, a plaquinha sobe, as setinhas pulsam | "plim" curto |
| toque | a agulha vira com um "tchac", o item desliza | "tchac" de agulha + rodinha |
| acerto | baque macio, a bolinha acende, fumacinha | baque + apito curto "piuí" |
| erro | o vagão balança e cospe, o item fica suspenso, balão | "boing" + duas notas descendo |
| trem parte | rodas giram, fumaça, saída pela esquerda | apito longo + "tchuc-tchuc" |
| cena de ordem | ondinhas do app até a caixinha, notas saindo | melodia de 4 notas |
| fim | quadro, confete | acorde |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · drop · choose · slide · depart · finale · done · panel`.
O toque só vale em `choose`. `startPhase` faz `++gen`, e todo `await` é seguido
de `if (gen !== this.gen) return`.

A bridge segue a Garra: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` por item, `WRONG_ANSWER` + `lose()` no erro, `CHECKPOINT` com
`progress = round(itensFeitos / 8 × 100)`,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START. O jogo nunca emite `GAME_OVER` e nunca escreve
`isFinalStage`.

## 12. Depois do N1 (a ficha, pronta para quando vier)

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **os capciosos** | a **TELA** é peça e o **app de desenho que aparece nela** é programa; o **robô** é peça e a **dancinha** é programa. Os pares capciosos vêm em sequência (a tela, depois o app nela). O item **não espera**: cai em 2,5 s, e a agulha pode ser escolhida durante a queda (fica marcada) e trocada até ele chegar (`wait: false`). Ficha nova: o balão-dica muda para o capcioso |
| 3 | **o programa dá ordens à peça** | queda em 2 s e, com os vagões cheios, a fase de **parear**: o programa e a peça que ele comanda (app de fotos → câmera, joguinho → controle, app de música → caixinha). Tocar no programa e depois na peça liga os dois com um vagão-corrente. A cena de ordem do N1 vira a recompensa de cada par |

## 13. Arquivos, texturas e quem mexe

| Lógica | Peças e apresentação |
|---|---|
| `types.ts`, `data/levels.ts` (fases, validação), `data/items.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (queda, escolha, erro, fases) | `data/layout.ts`, `data/theme.ts`, `scenes/yard.ts` (fundo, funil, trilhos), `switch.ts` (agulha e setinhas), `item.ts` (item, plaquinha), `train.ts` (locomotiva, vagões com placa e bolinhas, partida), `finale.ts` (cena de ordem e quadro), `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi de figurinha**, `19`; prompts no
[TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-patio.png` | 1280 × 720 | pátio de trem de brinquedo, de frente, com o funil, o trilho vertical, o Y e os trilhos de baixo **pintados** |
| `itens.png` | 4 × 4, 256 | os 13 itens + a lâmina da agulha + os 2 ícones das placas (mão, ordens) |
| `trem.png` | 2 × 2, 512 | vagão aberto (o mesmo para os dois), locomotiva, vagão-corrente (N3), dedo do guia |
| `cover-trem-peca-e-programa.png` | 1672 × 941 | capa **com o título** |

**Código:** a placa do vagão (fundo, ícone do PNG, palavras), as bolinhas, a
plaquinha do nome, as setinhas da agulha, o balão-dica, as ondinhas de ordem, as
notas, a fumaça, o quadro-síntese, o confete, as bolinhas do HUD e o `?`. O
vagão é **um PNG desenhado duas vezes** (inteiro atrás do item e recortado da
borda da frente para baixo na frente dele), como a caixa da Fábrica.
**Antes da arte:** retângulos e círculos com o nome, só para testar.

**Registro:** id = `NEXT_FREE_ID` no commit (hoje **100**), que avança um. O slug
é `trem-peca-e-programa`, entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, ganha
3 frases em `gameInstructions.ts` e `public/og/trem-peca-e-programa.jpg`. A
categoria é **Mundo Digital**.

## 14. Travas para quem mexer depois

- A resposta mora **só** no item (`kind`). Os dois vagões são iguais, as
  setinhas são iguais, e a agulha volta ao meio.
- O toque **só vale com o item parado** na agulha (`mode === 'choose'`).
- O item de programa é sempre **ícone de app**, e o símbolo dele nunca é uma peça.
- A cena do erro vem **antes** do `lose()` e cabe em ~1,2 s.
- O layout se ajusta ao **fundo medido** quando a arte chegar.
- `wait` e `dropMs` são dados do nível, não `if` na cena.

## 15. Decisões (régua "simples e claro")

1. **O item espera na agulha**, e a criança toca o lado. Assim não há relógio e
   não há "alternar" contando toques: o lado tocado é a resposta.
2. **2 fases de 4**, com o trem partindo duas vezes, no lugar de uma fila de 8.
3. **Programa = ícone de app, peça = objeto.** É assim que o software aparece
   para a criança. Os capciosos (a tela e o app nela) ficam para o N2.
4. **Bolinhas no vagão**, e não número.
5. **A cena de ordem no fim do N1**, sem toque: mostra o software mandando no
   hardware sem trazer a mecânica de parear, que é do N3.
6. **Estilo chibi de figurinha (`19`)**, o padrão da rodada.

## Histórico

- **02/10/2026.** Primeiro planejamento, a partir da ficha original, sem
  dúvidas abertas.
- **02/10/2026, o N1 feito, todo em `Graphics`** (pedido do usuário: "faça o
  jogo… com apenas n1, use Graphics como antes. as texturas eu irei fazer").
  - Id **101** (o 100 virou a Oficina de Papel, de outra sessão);
    `NEXT_FREE_ID` foi para 102. No catálogo, em
    `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` e com 3 frases em
    `gameInstructions.ts`. Ainda **sem capa** e sem OG.
  - Desenho em código: o pátio, o funil e os trilhos em `scenes/yard.ts`, a
    agulha em `switch.ts`, os 13 itens em `art.ts` (peças como objeto,
    programas como ícone de app), o trem com as placas e as bolinhas em
    `train.ts`, a cena de ordem e o quadro em `finale.ts`. A `BootScene` já lê
    `src/assets/games/EF02CO04/trem-peca-e-programa/*.png`, e o `yard.ts` usa o
    `bg-patio` se ele existir. As outras peças trocam pelo PNG quando a arte
    chegar, medida.
  - Posições finais (diferem um pouco do §5): agulha em (640, 412), item
    esperando em (640, 262), plaquinha do nome em (640, 356), bocas dos vagões
    em (330, 520) e (950, 520), topo dos vagões em y 548. A plaquinha de cada
    vagão tem 248 px, com o título em 22 px.
  - O item cai no vagão por cima da parede da frente (o vagão é desenhado em
    duas camadas, atrás e na frente da carga), e só a pontinha aparece.
  - Conferido no navegador: o guia inteiro (a câmera vai para PEÇAS, o app de
    fotos para PROGRAMAS, e a carga do treino some), as duas viagens (8 itens,
    o trem parte e volta), a cena de ordem, o quadro-síntese, o painel com 3
    estrelas e `GAME_COMPLETED` com `totalStages: 1`; e um erro (o mouse no
    vagão PROGRAMAS: o vagão cospe, o balão *"Dá para pegar na mão?"*,
    `WRONG_ANSWER` e `GAME_OVER`).
- **02/10/2026, tutorial com texto** (pedido do usuário: "adicione texto nos
  tutoriais. um pouquinho. e comece a usar o componente de tutorial").
  - O guia mudo saiu; agora é o `shared/tutorial/createTutorial`, com as frases
    em `TEACH` (`data/words.ts`): *"Este vagão leva as PEÇAS: coisas que dá
    para pegar na mão."* → *"Este leva os PROGRAMAS: eles dão ordens para as
    peças."* → a câmera cai: *"A câmera dá para pegar na mão? Dá! Toque do lado
    das PEÇAS."* (dedo no vagão, botão **Ver**, e ela desliza de verdade) → o
    app de fotos: *"O app de fotos não se pega: ele dá ordens. Lado dos
    PROGRAMAS!"*.
  - O `?` repete os dois vagões e *"O item espera aqui. Toque no lado do vagão
    certo."*
- **02/10/2026, as texturas entraram** (em tamanhos e grades diferentes do
  pedido; caixas medidas no `MANIFEST.md` dos assets e em `data/files.ts`).
  - `itens.png` (células de 313,5 px) e `trem.png` (sem grade) não viram
    spritesheet: são carregadas como imagem e ganham quadros pelas caixas
    medidas (`addFrames`).
  - O layout seguiu o **fundo**: funil em (640, 145), agulha em (640, 320), as
    pontas do Y em (383, 475) e (896, 475) — que viraram o centro dos vagões —,
    rodas em y 660. O item espera em (640, 226), com 165 px, e o nome em
    (640, 388); as setinhas foram para cima dos galhos do Y.
  - O vagão é o mesmo PNG duas vezes (inteiro atrás da carga e recortado da
    parede da frente para baixo na frente), em 280 px; a locomotiva tem 175 px
    de altura, e a fumaça sai da chaminé medida.
  - As **bolinhas de contagem dos vagões saíram**: não cabiam na frente do
    vagão desenhado, e os itens aparecendo dentro já mostram quantos foram.
  - A placa de cada vagão usa os ícones `signHand`/`signOrders` da folha.
  - A mão do guia não veio no `trem.png`; o tutorial usa o ponteiro padrão do
    `createTutorial`.
