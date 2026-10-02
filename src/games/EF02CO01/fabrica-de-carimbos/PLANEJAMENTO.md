# Fábrica de Carimbos — planejamento

Jogo **099** (registrado em 02/10/2026; o 098 virou o Robô Pintor) · EF02CO01 ·
2º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF02CO01.md`
(a mesma que foi colada no chat em 30/09/2026, sem revisão).
Padrão: `docs/rodada-3/PADRAO-R3.md` e `src/games/INSTRUCOES.md` ("A derrota").
Modelos: `EF01CO05/pescaria-dos-codigos` (esteira que dá a volta) e
`EF01CO01/base-dos-classificadores` (peça branca tingida, placa que diz a regra).

**Tudo decidido pela régua "simples e claro"** (o pedido do usuário no
Labirinto). Não há dúvidas abertas. As escolhas estão no §15.

- só o **N1**;
- **1 erro encerra**: `WRONG_ANSWER` + `lose()`, uma vez, com a cena do erro
  **antes** do `lose()`;
- **erro de dedo não custa nada**.

O N2 e o N3 da ficha estão no §12.

---

## 1. O jogo em uma frase

No alto da fábrica fica o **carimbo-modelo**, com **2 janelinhas**: cada uma
mostra um atributo que importa (ex.: **AZUL** e **PEQUENO**). Embaixo, a
**esteira** traz robôs de brinquedo um por um, e eles passam **debaixo do
carimbo**. Quando um robô está ali e a criança acha que ele combina, **um
toque**: o carimbo desce e **confere janelinha por janelinha** (✓ ✓). Aprovado,
o robô pula para a **caixa**. Achou os 3, a rodada acaba.

Um gesto só, **tocar**, e um lugar só para tocar: a janela debaixo do carimbo.

## 2. A habilidade e os irmãos

> **(EF02CO01)** Criar e comparar modelos (representações) de objetos,
> identificando padrões e atributos essenciais.

| O que a BNCC pede | Onde acontece |
|---|---|
| **modelo** (representação) | o carimbo: um retrato só com o que importa, em 2 janelinhas |
| **comparar** | cada carimbada confere o brinquedo com o modelo, **atributo por atributo**, à vista (✓/✗ um de cada vez) |
| **atributos essenciais** | a janelinha só mostra o que importa; o que **não** está no carimbo varia de propósito nos aprovados (a antena, a cor da bola) |
| **diferentes características, diferentes grupos** (exemplo oficial) | na fase 3 os **mesmos robôs** voltam com **outro carimbo** (cor + antena), e quem era aprovado na fase 1 agora é recusado |

**O teste da bolinha:** se o carimbo tivesse só um atributo, bastaria olhar a
cor e nada seria "conferir atributo por atributo". Por isso cada fase tem
distratores que **acertam um atributo e erram o outro** (§6), e a validação
cobra isso.

**Irmãos:** *Hangar dos Modelos* (R1: filtrar e agrupar veículos) e *Detetive
dos Modelos* (R2: testar o veículo no céu, na estrada ou na água). Aqui o
modelo é **um objeto na tela** (o carimbo) e comparar é **uma animação que
acontece** (as janelinhas conferindo). Nenhum dos dois tem isso.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | não tem título; o exemplo virou o guia visual (§9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia visual | PADRAO-R3 |
| algum ✗: TRAVA (cadeado, a janelinha pisca, tocar de novo solta, +5) | **1 erro encerra**: a janelinha que falhou pisca com o ✗ e um balão curto (*"O tamanho não bate!"*), e **depois** `WRONG_ANSWER` + `lose()` | INSTRUCOES "A derrota" |
| após 2 travas, etiqueta brilhante nos certos | sai | não existe segunda trava |
| "tocar no brinquedo da esteira" | só é tocável **o brinquedo que está debaixo do carimbo**, numa **janela de toque** grande (a zona iluminada). Os outros não respondem | com 1 erro encerrando, um toque que escorrega para o vizinho não pode julgar (INSTRUCOES, "toque único entre alvos vizinhos") |
| "3 s por item na área de toque" | cada brinquedo fica ~3 s na zona e **nunca há dois na zona** | é a mesma regra, com números |
| deixar passar um brinquedo | **não custa nada**: a esteira dá a volta (sai por um túnel à direita e volta pelo da esquerda), e o aprovado passa de novo | não há relógio; o que se mede é a comparação, não o reflexo |
| 3 níveis | só o **N1** (`LEVELS.length === 1`); N2 e N3 no §12 | INSTRUCOES: "Sempre faça o jogo com apenas 1 NIVEL, para teste" |
| rodada = 3 aprovados | o N1 tem **3 fases** (3 carimbos), cada uma com 3 aprovados entre 6 | a ficha não diz quantas rodadas; 3 é o padrão da rodada |
| "15 brinquedos com variações" | **peças brancas tingidas** pelo código (corpo do robô, bola) + peças que se encaixam (antena, listras) | a cor e o tamanho são exatos e nunca brigam com a arte; 4 PNGs de peça em vez de 15 |
| coleções: robôs, bonecas, bolas | N1 com **robôs e bolas**; as bonecas ficam para o N2 | a boneca pede cabelo, rosto e vestido tingido separado; 2 coleções já mostram a ideia |
| balão-síntese 'modelo é o retrato do que importa…' | letreiro **SÓ O QUE IMPORTA!** na cena; a síntese inteira na mensagem do `showLevelComplete` | máximo de 4 palavras por vez na cena |
| sons | sintetizados em WebAudio (esteira, carimbada de borracha, aprovado) | PADRAO-R3 |
| telemetria: aprovações de primeira, atributo com mais ✗, montagem, quase-iguais | `CORRECT_ANSWER` por aprovado; `WRONG_ANSWER` no erro | a bridge não tem esses campos |

## 4. O laço

```
fase nova · o carimbo desce do alto com as 2 janelinhas acesas (AZUL · PEQUENO)
· a caixa mostra 3 lugares vazios · a esteira liga
        │
        ▼
   os robôs andam da esquerda para a direita, em volta
   · o que está debaixo do carimbo fica numa zona iluminada
        │ toque na zona (só vale com um brinquedo nela)
        ▼
   a esteira para · o carimbo desce sobre o brinquedo
   · janelinha 1 confere: a marca do brinquedo sobe até ela → ✓ ou ✗
   · janelinha 2 confere → ✓ ou ✗
   ┌───────────────┴─────────────────┐
 ✓ ✓                               algum ✗
 carimba APROVADO (tum),           a janelinha do ✗ pisca, o balão diz qual
 o robô pula para a caixa,         atributo não bate (~1,2 s)
 um lugar enche                    WRONG_ANSWER + lose() → done
 CORRECT_ANSWER (+10)
        │
   3 na caixa? ── não ──► a esteira volta a andar
        │ sim
   caixa fechando · próxima fase, ou fim:
   a caixa com os 9 aprovados ao lado dos 3 carimbos · SÓ O QUE IMPORTA! ·
   showLevelComplete
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`. Estes números são o contrato. O pórtico
do carimbo, a estrutura da esteira, os dois túneis e o nicho da caixa vêm
**pintados no fundo**.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas em (40, 40), ocultas; 3 bolinhas das fases em (120, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas |
| carimbo | cabeça centrada em x 520; em cima em y 250, desce até y 430 | ~380 × 190 (célula de 512 em escala ~0,86), com 2 janelinhas de ~130 × 105 em x ≈ 443 e 597 (os centros saem da arte medida) |
| janelinha | pictograma de 56 px + palavra (DynaPuff 22) embaixo, dentro dos ~130 × 105 | ex.: bolinha azul + **AZUL**; dois robôs, o pequeno aceso + **PEQUENO** |
| esteira | faixa de x 60 a 1000, topo em y 540, 90 de altura | textura que rola (`TileSprite`) |
| túneis | esquerda x 0–90, direita x 970–1060, y 440–640 | os brinquedos entram e saem por eles |
| zona do carimbo | x 520 ± 135, y 380–650 (270 × 270) | luz suave no chão da esteira; **a região de toque** |
| brinquedos | centro em y 520; pequeno ~100 px, grande ~170 px | andam a 90 px/s, com 300 px entre eles |
| caixa | (1160, 520), ~200 × 190 | 3 lugares marcados na frente (bolinhas que enchem) |
| balão do erro | acima da janelinha que falhou | *"A cor não bate!"* / *"O tamanho não bate!"* |
| letreiro | (640, 150) | **SÓ O QUE IMPORTA!** |

**Densidade.** Há **uma região tocável** (a zona) mais o `?`. Na esteira, até
**3 brinquedos à vista** e **um aceso** de cada vez.

**Teclado:** `Espaço` carimba o que está na zona; `H` repete o guia.

## 6. Carimbos, brinquedos e a esteira (`data/levels.ts`)

### Os atributos

| Atributo | Valores | Como aparece no brinquedo | Pictograma da janelinha |
|---|---|---|---|
| `color` | azul, vermelho, amarelo | `tint` do corpo branco (as 3 cores da Base dos Classificadores) | bolinha da cor |
| `size` | pequeno, grande | escala 0,6 e 1,0 do mesmo PNG | dois robôs (ou duas bolas) lado a lado, o do tamanho pedido aceso |
| `antenna` | com, sem | a peça `antenna` encaixada na âncora da cabeça | o próprio PNG da antena |
| `stripes` | com, sem | a peça `stripes` por cima da bola, mesmo centro e mesma escala | a própria bola listrada, pequena |

### As 3 fases do N1

| Fase | Coleção | Carimbo | O que **não** importa (varia nos aprovados) |
|---|---|---|---|
| 1 | robôs | **AZUL** · **PEQUENO** | a antena |
| 2 | bolas | **LISTRAS** · **GRANDE** | a cor |
| 3 | robôs | **VERMELHO** · **ANTENA** | o tamanho |

Na fase 3, os **mesmos robôs** voltam com outro carimbo: é o "diferentes
características geram diferentes agrupamentos" do exemplo oficial.

### A fila de cada fase: 6 brinquedos, 3 aprovados

Exemplo da fase 1 (AZUL · PEQUENO):

| # | Brinquedo | Janelinhas | Papel |
|---|---|---|---|
| 1 | azul, pequeno, com antena | ✓ ✓ | aprovado |
| 2 | azul, grande, sem antena | ✓ ✗ | acerta a cor, erra o tamanho |
| 3 | azul, pequeno, sem antena | ✓ ✓ | aprovado (a antena não importa) |
| 4 | amarelo, pequeno, com antena | ✗ ✓ | acerta o tamanho, erra a cor |
| 5 | vermelho, grande, com antena | ✗ ✗ | distrator óbvio |
| 6 | azul, pequeno, com antena | ✓ ✓ | aprovado |

"Distratores óbvios" (ficha, N1): as diferenças são **grandes** (cor pura e
tamanho 0,6 × 1,0), nunca sutis. A sutileza (quase-iguais) é do N3.

```ts
type Attribute = 'color' | 'size' | 'antenna' | 'stripes'
type Collection = 'robot' | 'ball'
type Value = string
interface Toy { collection: Collection; color: 'blue' | 'red' | 'yellow'; size: 'small' | 'big'; antenna?: boolean; stripes?: boolean }
interface Stamp { windows: { attribute: Attribute; value: Value }[] }
interface PhaseDef { id: string; collection: Collection; stamp: Stamp; line: Toy[] }
interface LevelDef { level: number; phases: PhaseDef[]; speed: number; spacing: number; zone: number; build: false }

check(stamp, toy) => stamp.windows.map(w => toy[w.attribute] === w.value)
approves(stamp, toy) => check(stamp, toy).every(Boolean)
toyInZone(line, offset, zone) => o índice do brinquedo cujo centro está a ≤ zone/2 do carimbo, ou null
```

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- `phases.length === 3` (≤ 5); 6 brinquedos por fila, **exatamente 3 aprovados**;
- N1: carimbo com **2** janelinhas, de atributos diferentes, que a coleção tem
  (robô: cor/tamanho/antena; bola: cor/tamanho/listras); `build === false`;
- em cada fila, **pelo menos um distrator acerta a janelinha 1 e erra a 2, e
  outro acerta a 2 e erra a 1**: sem isso, uma janelinha só bastaria;
- entre os aprovados, **o atributo que não está no carimbo varia** (senão ele
  vira pista);
- a fase 3 usa a mesma coleção de uma fase anterior, com carimbo diferente;
- `spacing ≥ zone + 30` (o centro de dois brinquedos nunca está na zona ao
  mesmo tempo; com 300 e 270 sobra 0,3 s de zona vazia entre eles), e o tempo
  na zona (`zone / speed`) fica entre 2,5 e 3,5 s;
- aprovados não ficam lado a lado na fila mais de uma vez por fase.

## 7. O erro

**Carimbar um brinquedo que não combina = 1 erro, encerra.** A cena vem antes
do `lose()` e dura ~1,2 s:

1. A esteira para e o carimbo desce sobre o brinquedo.
2. As janelinhas conferem uma por uma. A marca do brinquedo sobe até a
   janelinha (a bolinha da cor dele, a silhueta do tamanho dele), e acende ✓
   verde ou ✗.
3. A janelinha do ✗ **pisca**, e um balão curto diz qual atributo falhou:
   *"A cor não bate!"*, *"O tamanho não bate!"*, *"Falta a antena!"*, *"Faltam
   as listras!"*. Com dois ✗, vale a frase da primeira janelinha.
4. O carimbo sobe **sem carimbar**. `WRONG_ANSWER` + `lose()` e
   `if (this.lives.remaining <= 0) return`.

Sem vermelho de alerta: o ✗ é **azul-marinho**, porque o vermelho é uma cor de
brinquedo. Sem som áspero.

**Não é erro:**
- tocar com a zona vazia;
- tocar fora da zona;
- deixar um brinquedo passar (ele dá a volta);
- tocar enquanto o carimbo confere;
- o `?`.

**Pontos e estrelas:** +10 por aprovado (`CORRECT_ANSWER` quando ele cai na
caixa). **3 estrelas** ao concluir, porque concluir já significa zero erro.

**Pista que entrega (conferido):**
- a zona acende **qualquer** brinquedo que está nela, com a mesma luz;
- os aprovados não brilham, não pulam e não fazem som diferente na esteira;
- a ordem da fila é embaralhada no `startPhase` (com a regra dos aprovados não
  colados);
- a única fonte da resposta é **o carimbo + o brinquedo**, que é o conteúdo.

## 8. O acerto e o fim

**Acerto:** as duas janelinhas acendem ✓ ✓, uma de cada vez, com um "plim". O
carimbo **carimba** com um "tum" de borracha e deixa no brinquedo a marquinha
**APROVADO** (texto do código, em tinta verde, levemente torta). O brinquedo
pula em arco até a caixa, e um lugar da caixa se enche. A esteira volta a andar.

**Fim da fase:** a caixa fecha com uma fita, sai deslizando pela direita e
volta vazia. O carimbo sobe e desce com as janelinhas novas, que **acendem uma
por vez**, para a criança ver que o modelo mudou.

**Fim do nível:** os **3 carimbos** aparecem lado a lado, cada um com os 3
aprovados embaixo. O letreiro **SÓ O QUE IMPORTA!** salta e cai confete. Depois
vem o `showLevelComplete`, com a síntese da ficha na mensagem: *"Modelo é o
retrato do que importa: com ele dá para conferir qualquer um!"*

## 9. Guia visual (2º ano, visual com frase curta)

É o `shared/guide/createVisualGuide`, com véu, dedo e o gesto `tap`. A chave
no `registry` é `ef02co01-l1`. O guia usa um **brinquedo de treino** que não
conta, e a esteira **fica parada** enquanto o dedo age (a lição da Pescaria:
nada de dedo cego num jogo de momento).

1. **O modelo.** O véu deixa só o carimbo aceso. As janelinhas pulsam uma de
   cada vez. Legenda: **Isto é o que importa.**
2. **Deixa passar.** O véu abre a esteira e a zona. Um robô de treino **que não
   combina** (azul e grande) entra na zona e **para**. O dedo aparece, balança
   "não" e some. A esteira anda e ele passa.
3. **Carimba.** Um robô de treino **que combina** entra na zona e para. O dedo
   toca, o carimbo confere ✓ ✓ e carimba, e o robô vai para a caixa (e volta
   para fora dela: é treino). Legenda: **Toque no que combina!**
4. O guia fecha e a esteira de verdade liga. Não há passo de espera com o dedo
   pulsando.

O `?` pausa a esteira e repete os passos 1 a 3 com os brinquedos de treino.
Depois a fila volta exatamente para onde estava.

**Dá para entender o objetivo sem ler?** Sim. O passo 1 mostra o modelo, o 2
mostra que nem todo brinquedo serve e o 3 mostra o que acontece com o que serve.
As palavras das janelinhas (AZUL, PEQUENO) têm sempre o pictograma ao lado.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| esteira | a faixa rola, os brinquedos balançam de leve | zumbido baixo de motor |
| zona | luz suave no brinquedo da vez | nada |
| toque | a esteira para, o carimbo desce | "fsss" de pistão |
| conferência | a marca sobe até a janelinha, ✓ ou ✗ | "plim" (✓), "tuc" macio (✗) |
| aprovado | carimbada APROVADO, o brinquedo pula na caixa | "tum" de borracha + "ding" |
| erro | a janelinha pisca, balão curto | duas notas descendo, macias |
| troca de fase | a caixa fecha, as janelinhas novas acendem | fita + "plim-plim" |
| fim | carimbos com os aprovados, letreiro, confete | acorde |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · run · check · approve · swap · done · panel`.
O toque na zona só vale em `run`. `startPhase` faz `++gen`, e todo `await` é
seguido de `if (gen !== this.gen) return`.

O brinquedo é escolhido **no toque** (`toyInZone` no `pointerdown`). Zona vazia
não faz nada.

A bridge segue a Garra: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` por aprovado, `WRONG_ANSWER` + `lose()` no erro,
`CHECKPOINT` com `progress = round(aprovados / 9 × 100)`,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START/PAUSE/RESUME. O jogo nunca emite `GAME_OVER` e nunca
escreve `isFinalStage`.

## 12. Depois do N1 (a ficha, pronta para quando vier)

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **criar o modelo** | chega um **bilhete ilustrado** (*"Quero robôs PEQUENOS e AZUIS"*, com o desenho). Antes de ligar a esteira, a criança monta o carimbo: cada janelinha mostra **3 opções** e ela toca a certa (2 toques). O bilhete tem um atributo **que não importa** (a cor dos olhos) e ele **não tem janelinha**: é o descarte. Montar errado = 1 erro. Entram as **bonecas** (chapéu, laço, cor). 8 brinquedos. `build: true` |
| 3 | **conferência fina** | carimbo de **3 janelinhas**, e 2 brinquedos **quase iguais** (diferem só na antena) entre 10 |

## 13. Arquivos, texturas e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts` (fases, `check`, `approves`, validação), `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (esteira, zona, conferência, erro) | `data/layout.ts`, `data/theme.ts`, `scenes/belt.ts` (esteira, túneis, volta), `toy.ts` (montar o brinquedo tingido), `stamp.ts` (carimbo, janelinhas, ✓/✗, APROVADO), `box.ts`, `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi de figurinha**, `19`; prompts no
[TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-fabrica.png` | 1280 × 720 | fábrica fofa: pórtico do carimbo, estrutura da esteira, 2 túneis, nicho da caixa |
| `esteira.png` | 512 × 96, emenda horizontal | a lona da esteira, que rola |
| `carimbo.png` | 2 × 1, 512 | cabeça do carimbo com 2 janelinhas vazias; com 3 (N3) |
| `pecas.png` | 4 × 2, 256 | corpo do robô (branco), antena, bola (branca), listras, caixa (fundo e frente), dedo, 1 livre |
| `cover-fabrica-de-carimbos.png` | 1672 × 941 | capa **com o título** |

**Código:** o `tint` e a escala dos brinquedos, os pictogramas das janelinhas
(montados com as próprias peças), as palavras, ✓/✗, a marca APROVADO, a luz
da zona, os balões, os lugares da caixa, o letreiro, o confete, as bolinhas, o
`?`.
**Antes da arte:** robô em retângulo e bola em círculo, tingidos, só para
testar. Isso nunca é a entrega.

**Registro:** id = `NEXT_FREE_ID` no commit (hoje **098**), que avança um. O slug
é `fabrica-de-carimbos`, entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, ganha
3 frases em `gameInstructions.ts` e `public/og/fabrica-de-carimbos.jpg`. A
categoria é **Pensamento Computacional**.

## 14. Travas para quem mexer depois

- A resposta mora **só** no carimbo e no brinquedo. Nenhuma luz, som ou lugar
  na fila diz qual é o aprovado.
- **Um brinquedo tocável por vez**, o da zona. Nunca torne a esteira inteira
  tocável.
- O corpo do robô e a bola são **brancos** no PNG. A cor vem **só** do `tint`,
  e as 3 cores são as mesmas do tema.
- O pictograma da janelinha é feito **com a própria peça** (antena, bola
  listrada, silhueta do robô). Nunca desenhe um ícone à parte.
- Toda fila tem distrator que acerta uma janelinha e erra a outra (validação).
- A cena do erro vem **antes** do `lose()` e cabe em ~1,2 s.
- `build` (montar o carimbo, N2) é dado do nível, não `if` na cena.

## 15. Decisões (régua "simples e claro")

1. **Um só lugar para tocar**, a zona debaixo do carimbo. Assim o erro é
   sempre de decisão, nunca de dedo.
2. **Deixar passar não custa nada**, porque a esteira dá a volta. Não há relógio.
3. **N1 com robôs e bolas.** As bonecas entram com o N2, junto com o bilhete.
4. **A fase 3 repete os robôs com outro carimbo**. É o exemplo oficial da BNCC
   ("diferentes características geram diferentes agrupamentos") num toque só.
5. **Palavra + pictograma** nas janelinhas: é 2º ano, a palavra ajuda, e o
   pictograma segura quem ainda não lê.
6. **Estilo chibi de figurinha (`19`)**, o padrão da rodada.

## Histórico

- **30/09/2026.** Primeiro planejamento, a partir da ficha original. Decidido
  sem dúvidas abertas, pela régua "simples e claro", e com a regra de derrota
  de 30/09 (1 erro encerra, a cena antes do `lose()`).
- **02/10/2026, o N1 feito, todo em `Graphics`** (pedido do usuário: "faça o
  jogo, só com n1… por hora só use o Graphics"; as texturas chegam depois).
  - Id **099**, no catálogo e em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, com 3
    frases em `gameInstructions.ts`. Ainda **sem capa** e sem OG.
  - Robô, bola, antena, listras, carimbo, caixa e fábrica são desenhados em
    `scenes/toy.ts`, `stamp.ts`, `box.ts` e `factory.ts`. A `BootScene` já lê
    `src/assets/games/EF02CO01/fabrica-de-carimbos/*.png`, e a `factory.ts` usa o
    `bg-fabrica` se ele existir. As peças ainda não trocam sozinhas pelo PNG:
    isso entra quando a arte chegar, medida no MANIFEST.
  - Escalas finais dos brinquedos: pequeno 0,55 e grande 0,9. O carimbo fica em
    y 215 e desce até encostar no brinquedo (o mais alto, o robô grande com
    antena, só deixa ~50 px de descida).
  - O ✓/✗ fica **no canto da janelinha**, e não em cima do brinquedo: o
    carimbo está em cima dele na hora da conferência. Cada janelinha manda um
    pontilhado até a parte do brinquedo que ela confere.
  - O `?` repete só o passo 1 (o modelo) e mostra a zona com a frase, sem dedo.
    A demonstração com os brinquedos de treino só roda na primeira vez.
  - Conferido no navegador: o guia inteiro, um erro (balão *"A cor não
    bate!"*, `WRONG_ANSWER` e `GAME_OVER`) e uma partida inteira (9 aprovados,
    os 3 carimbos no fim, `GAME_COMPLETED` com `totalStages: 1` e o painel com 3
    estrelas).
- **02/10/2026, as texturas entraram** (vieram em tamanhos diferentes do
  pedido; medidas e âncoras no `MANIFEST.md` dos assets e em `data/files.ts`).
  - O layout seguiu o **fundo**, e não o contrário: o carimbo foi para x 638 (o
    pistão pintado), a esteira para y ~490, a caixa para o nicho da direita
    (x 1182). Os túneis, a lona e o pórtico de `Graphics` só aparecem sem o
    fundo.
  - O carimbo ficou com escala 0,78 e o topo em y 66: é o maior que cabe entre
    os pilares e ainda deixa o robô grande com antena passar por baixo. As
    janelinhas ficaram com ~86 × 74, e as palavras encolheram para **ANTENA** e
    **LISTRAS** (sem "COM"), em 15 px.
  - Brinquedos menores: o grande tem ~110 px e o pequeno ~68 px. Na caixa eles
    entram em 0,8 e com o selo APROVADO apagado, para aparecerem por cima da
    frente.
  - No guia, o recorte cobre o carimbo **e** a zona, para a criança ver o ✓ ✓
    acontecendo; a legenda desce para o chão.
  - Capa no catálogo e `public/og/fabrica-de-carimbos.jpg` gerado.
- **02/10/2026, N2 e N3** (pedido do usuário: "adicione n2 e n3").
  - **N2 — montar o carimbo** (`build: true`, 3 fases, 8 brinquedos): um
    **bilhete** à esquerda diz o pedido (*"Quero robôs PEQUENOS e AZUIS."*) com
    o desenho. As janelinhas começam com **?**, e cada uma acende na sua vez
    com **3 fichas** embaixo do carimbo. Em cada fase, uma das fichas é **o que
    o desenho tem e o bilhete não pede** (a antena, a cor da bola, o tamanho):
    é o atributo para descartar. Ficha certa: a janelinha ganha o ✓ (+10,
    `CORRECT_ANSWER`). Ficha errada = 1 erro: a janelinha fica com ✗, o
    bilhete pulsa e o balão diz *"Isso não importa aqui!"* (atributo que não
    está no pedido) ou *"O pedido não é esse!"* (valor errado), e depois
    `lose()`. Com o carimbo pronto, a esteira roda igual ao N1.
  - **N3 — conferência fina** (3 fases, 10 brinquedos): carimbo de **3
    janelinhas** (a célula 1 do `carimbo.png`), montado com 3 toques, e na
    fila **quase iguais** que só erram uma janelinha. Fonte de 12 px nas
    janelinhas de 3.
  - Bonecas **não entraram**: não há arte delas, e robôs e bolas já dão os 3
    atributos. Ficam para uma folha nova, se você quiser.
  - Guia: o N1 continua com o treino na esteira; no N2 e no N3 (uma vez cada)
    o véu mostra o bilhete (*"Leia o pedido."*) e depois o carimbo com as
    fichas (*"Monte o carimbo!"*), **sem dedo apontando a ficha**. O `?`
    durante a montagem repete isso.
  - `validateLevels` cobra: o número de janelinhas e de brinquedos por nível;
    exatamente uma ficha certa por janelinha e nenhuma que seja a resposta de
    outra; no N2, uma ficha "do desenho, mas não pedida"; o bilhete escrevendo
    cada atributo do carimbo; o desenho passando no carimbo; e, no N3, pelo
    menos 2 quase iguais por fila.
  - O N1 deixou de ser o último: ele avança sozinho para o N2, e o N3 aprova.
  - Conferido no navegador: o N2 inteiro (6 janelinhas montadas, 9 aprovados,
    passagem para o N3), um erro na montagem do N3 (balão, `WRONG_ANSWER`,
    `GAME_OVER`), o N3 inteiro (`GAME_COMPLETED` com `stage: 3, totalStages: 3`)
    e o N1 ainda começando pelo guia.
- **02/10/2026, tutorial com texto** (pedido do usuário: "adicione texto nos
  tutoriais. um pouquinho. e comece a usar o componente de tutorial").
  - O guia mudo (`createVisualGuide`) saiu. Agora é o
    `shared/tutorial/createTutorial`, com balão de texto curto (30 px), recorte
    no que a frase cita e botão. As frases estão em `TEACH` (`data/words.ts`).
  - N1: *"O carimbo mostra o que importa: AZUL e PEQUENO."* → o robô de treino
    que não combina para na luz: *"Este não combina com o carimbo. Deixe
    passar!"* → o que combina: *"Este combina! Toque nele quando estiver na
    luz."* (com o dedo tocando) → **Ver**: a conferência e o carimbo acontecem
    de verdade.
  - N2/N3: *"Leia o pedido do bilhete."* → *"Toque na ficha que o pedido pede.
    O que ele não pede, não entra!"* (sem dedo apontando a ficha).
  - O `?` repete o carimbo e a zona (ou o bilhete e as fichas, na montagem).
  - Nos passos sobre a esteira o balão fica fixo em y 190, para o botão não
    cair dentro do recorte.
