# Pescaria dos Códigos — planejamento

Jogo **095** (o `NEXT_FREE_ID` de hoje; confirmar no registro) · EF01CO05 ·
1º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF01CO05.md`
(a mesma que foi colada no chat em 29/09/2026, sem revisão).
Padrão: `docs/rodada-3/PADRAO-R3.md`. Modelos: `EF01CO01/garra-dos-grupos` e
`EF01CO04/balao-do-recado`.
A ficha é a fonte. Só muda o que o padrão obriga (§3). O que é proposta minha
está marcado e vai para as *Dúvidas*.

**Escopo e erro seguem o que você decidiu no Balão:** só o **N1**. **Pescar o
peixe errado é erro de decisão**, então vale errou, perdeu (`WRONG_ANSWER` +
`lives.loseAll()`). **Jogar o anzol na água vazia é erro de mira** e não custa
nada. O N2 e o N3 da ficha estão no §12.

---

## 1. O jogo em uma frase

Um barquinho está parado no lago. No mastro fica pendurado o **quadro-pista**,
que toca e mostra **batidas de tambor** (🥁🥁). Na **vela** está a legenda do
código: 1 batida = vermelho, 2 = azul, 3 = amarelo. Embaixo do barco nada uma
**fila de 4 peixes**, cada um com uma **mancha colorida na barriga**, e a fila
dá a volta sem parar. Quando um peixe entra no **facho de luz** embaixo do
anzol, **um toque** joga o anzol e fisga esse peixe. O certo é o peixe cuja cor
**traduz** as batidas. Ele pula no balde, e o quadro mostra os dois códigos lado
a lado: `🥁🥁 = 🔵`.

Um gesto só, **tocar**. Não há arrasto nem mira: o anzol desce sempre no mesmo
lugar, e quem escolhe o momento é a criança.

## 2. A habilidade e os irmãos

> **(EF01CO05)** Representar informação usando diferentes codificações.

| O que a BNCC pede | Onde acontece |
|---|---|
| a mesma **informação** | cada pista é uma coisa só (ex.: "o azul") |
| em **codificações diferentes** | a pista chega num código (batidas, que tocam e se veem) e a resposta está em outro (cor) |
| **representar** (traduzir) | a criança consulta a legenda da vela e procura, na fila, a mesma informação escrita no outro código |
| equivalência | no acerto, o quadro põe pista e tradução lado a lado com `=`; no fim, o balde mostra as 5 duplas |

**O teste da bolinha:** se a pista já viesse em cor, a criança só pareava cor
com cor e nada era traduzido. Por isso **o código da pista e o da resposta são
sempre diferentes**, e a validação cobra isso (§6).

**Irmãos com a mesma habilidade:**
- *Pixel Secreto* (R1): pintar a grade seguindo um código de cores.
- *Ilha dos Códigos* (R2): o baú dá a pista num código e a criança toca um de
  **3 cartões parados**. ⚠ **As tabelas são as mesmas** (batidas → cor → desenho
  → som), porque as duas fichas partem do mesmo exemplo. A diferença é a
  mecânica: aqui as opções **passam** e o acerto depende do **momento** do toque,
  como numa pescaria. Aviso na *Dúvida 3*.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | não tem título; o exemplo virou o guia visual (§9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia visual | PADRAO-R3 |
| peixe errado: TRAVA (anzol com cadeado, careta, legenda reacesa, tocar de novo solta, +5; bolhas no certo após 2 travas) | **errou, perdeu**: o peixe errado sobe fazendo careta, o quadro mostra `🥁🥁 ≠ 🔴`, a linha certa da vela acende, e a partida acaba (`WRONG_ANSWER` + `lives.loseAll()`) | decisão do usuário na Garra, na Subida e no Balão (*Dúvida 1*) |
| — | **anzol na água vazia não é erro**: ele desce, volta vazio, "blup", e nada é emitido | errar a mira nunca é resposta errada |
| "fisga o peixe que estiver passando" | um **facho de luz** embaixo do anzol acende o peixe que está dentro. O toque pesca **esse** peixe | a criança vê o que vai pescar antes de tocar; um escorregão de tempo não vira resposta errada |
| 3 níveis | só o **N1** (`LEVELS.length === 1`); N2 e N3 no §12 | decisão do usuário nos pilotos |
| "3 s por travessia" | um peixe entra no facho **a cada ~3 s** e fica ~1,6 s aceso | se o peixe atravessasse a tela inteira em 3 s, ficaria menos de meio segundo no facho |
| a pista continua até acertar | a fila **dá a volta**: quem saiu pela direita volta pela esquerda. Deixar o certo passar não custa nada, só esperar | é o "a pista continua" sem a trava |
| painel 'mesma coisa, dois códigos' e balão-síntese 'dá para dizer a mesma coisa com sons, cores e desenhos!' | letreiro **MESMA COISA, DOIS CÓDIGOS!** (4 palavras) sobre o balde. A síntese vai na mensagem do `showLevelComplete` | 1º ano: no máximo 4 palavras por vez |
| "10 peixes com marcas" | **um corpo de peixe** neutro (4 poses) + a **mancha** da barriga pintada pelo código | 10 desenhos de peixe viram pista (o bonito seria o certo); a marca é a única diferença |
| barquinho "normal/travado" | sem pose travada: o barco tem pescar, puxar, comemorar e "ih!" | não existe trava no N1 |
| sons | sintetizados em WebAudio (tambor, splash, molinete, blup) | PADRAO-R3 |
| telemetria: fisgada de primeira por par, uso do reouvir, dependência da legenda | só `CORRECT_ANSWER`/`WRONG_ANSWER` | a bridge não tem esses campos |

**Como li a ficha:**
- *"Rodada = 5 pistas"*: o N1 tem **5 fases**, uma pista por fase (o máximo do
  PADRAO-R3), com 5 bolinhas no HUD.
- *"4 peixes por pista"* com só 3 cores no código: **1 certo + 3 errados**, com
  as outras 2 cores do código (uma delas repetida). Nunca uma cor de fora do
  código: isso não testaria a tradução.
- *"quadro com 🥁🥁, tocável para reouvir"*: o quadro **mostra** os tambores e
  **toca** as batidas quando aparece e a cada toque nele. Cada tambor pulsa na
  sua batida. Ouvir e ver são a mesma pista (*Dúvida 4*).

## 4. O laço

```
pista nova · o quadro desce · 🥁🥁 toca e cada tambor pulsa na sua batida
        │ (tocar no quadro repete as batidas, sem custo)
        ▼
   a fila de 4 peixes nada da esquerda para a direita, em volta
   · o facho acende o peixe que está embaixo do anzol
        │ toque (fora do quadro e do ?)
        ▼
   o anzol desce reto no facho
   ┌───────────┬─────────────────────────┬──────────────────────────────┐
 facho vazio   peixe CERTO               peixe ERRADO
 volta vazio   sobe no molinete · pula   sobe no molinete fazendo careta ·
 "blup"        no balde (splash) ·       o quadro: 🥁🥁 ≠ 🔴 · a linha certa
 nada emitido  quadro: 🥁🥁 = 🔵 (2 s)    da vela acende · o barquinho "ih!"
        │      · a linha da vela brilha   WRONG_ANSWER + lives.loseAll() → done
        │      CORRECT_ANSWER (+10)
        └──────────┤
                   ▼
   ainda tem pista? ── sim ──► próxima pista (a fila troca de peixes)
                   │ não
   5 fichas saem do balde e se alinham · MESMA COISA, DOIS CÓDIGOS! ·
   confete · showLevelComplete
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`, que é da Brasa. Estes números são o contrato.
O lago, a margem e o píer vêm **pintados no fundo**.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas em (40, 40), ocultas; 5 bolinhas das pistas a partir de (230, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas, sem texto de fase |
| superfície da água | y = 400 | acima é céu e margem, abaixo é o lago por dentro (vista de lado) |
| barco | célula 512 em escala 0,8, centro em x 320, linha d'água local y 440 em y 400 | a criança pescando na proa, voltada para a direita |
| vela (legenda) | x 150–358, y 128–344, à esquerda do mastro (x 372) | 3 linhas: `🥁 → 🔴`, `🥁🥁 → 🔵`, `🥁🥁🥁 → 🟡` |
| quadro-pista | centro (790, 222), 320 × 172, pendurado por duas cordas do alto | as batidas da vez; **região tocável** para reouvir |
| ponta da vara | (492, 210) | a linha do anzol desce reta daqui |
| facho | x 492 ± 95, de y 404 até 720 | luz suave na água; acende o peixe cujo centro está dentro |
| fila de peixes | y 590; peixe com 160 px; 365 px entre eles; volta de 1 460 px | nadam para a direita; quem passa de x 1 370 volta em x −90, fora da tela |
| píer e balde | píer em x 1030–1290, tampo em y 388; balde em (1150, 390) | o peixe certo pula aqui dentro |
| letreiro | (640, 190) | **MESMA COISA, DOIS CÓDIGOS!** |
| fichas do fim | 5 em x 240 / 440 / 640 / 840 / 1040, y 360 | `[pista] = [tradução]` |

**Densidade.** Há **3 regiões tocáveis**: a tela (fisgar), o quadro (reouvir) e
o `?`. Na água há **4 peixes** ao mesmo tempo, que é o teto seguro, e **só um
fica aceso por vez**.

**Teclado:** `Espaço` fisga, `R` repete as batidas e `H` repete o guia, como o `?`.

## 6. Código, pistas e fila (`data/levels.ts`)

### O código do N1

| Batidas | Cor |
|---|---|
| 1 | vermelho |
| 2 | azul |
| 3 | amarelo |

A **mancha** da barriga é uma só em branco no PNG, e o código a pinta com
`tint`. As 3 cores ficam no `theme.ts` e são **puras e distantes**: vermelho
`#E53935`, azul `#1E88E5` e amarelo `#FDD835`. O corpo do peixe **não usa
nenhuma delas**.

### O ritmo

| Parâmetro | N1 | Por quê |
|---|---|---|
| velocidade da fila | 120 px/s | um peixe no facho a cada ~3 s ("3 s por travessia") |
| espaço entre peixes | 365 px | 1 460 px na volta inteira ÷ 4 peixes (a volta acontece fora da tela) |
| facho | 190 px de largura, velocidade 120 px/s | cada peixe fica ~1,6 s aceso, e o facho fica ~1,5 s vazio entre dois |
| descida do anzol | 0,35 s | o peixe é **escolhido no toque** (o aceso), e o anzol o segue na descida |
| volta do anzol vazio | 0,6 s | toques nesse tempo são ignorados |

### As 5 pistas do N1

Sorteadas no `startLevel` com regras fixas: as 3 batidas (1, 2 e 3) aparecem
pelo menos uma vez, a mesma nunca vem duas vezes seguidas, e o lugar do peixe
certo na fila muda de uma pista para a outra. Exemplo:

| Fase | Pista | Fila (da frente para trás) |
|---|---|---|
| 1 | 🥁🥁 | 🔴 🟡 **🔵** 🔴 |
| 2 | 🥁 | 🟡 **🔴** 🔵 🟡 |
| 3 | 🥁🥁🥁 | 🔵 🔴 🔵 **🟡** |
| 4 | 🥁🥁 | **🔵** 🟡 🔴 🟡 |
| 5 | 🥁 | 🔵 🟡 **🔴** 🔵 |

A fila começa **já na água**, com o 1º peixe em x ≈ 400. O certo nunca é o
primeiro a entrar no facho na fase 1: a criança tem de ver um peixe errado
passar antes.

```ts
type Beats = 1 | 2 | 3
type Hue = 'red' | 'blue' | 'yellow'
type Figure = 'sun' | 'fish' | 'banana'
type Mark = { kind: 'beats'; n: Beats } | { kind: 'hue'; hue: Hue } | { kind: 'figure'; figure: Figure }
type CodeId = 'beats-hue' | 'hue-figure' | 'figure-sound'

interface CodeDef { id: CodeId; pairs: [Mark, Mark][] }
interface ClueDef { clue: Mark; school: Mark[] }
interface LevelDef { level: number; code: CodeId; clues: ClueDef[]; legend: 'always' | 'flash' | 'first'; speed: number; spacing: number; beam: number; goldFish: boolean }

translate(code, clue) => a marca que faz par com `clue` na tabela
isRight(code, clue, mark) => sameMark(translate(code, clue), mark)
fishInBeam(school, offset, beam) => o índice do peixe cujo centro está a ≤ beam/2 do anzol, ou null
```

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- `clues.length === 5` (≤ 5); o `kind` da pista **nunca** é o da resposta;
- toda marca existe na tabela do código, e a tabela tem ≤ 3 pares ("máx. 3
  símbolos por código");
- cada fila tem **4** peixes (N1), **exatamente 1** certo, e os errados são
  **outras marcas do mesmo código**, com as 2 aparecendo;
- as 3 batidas aparecem nas 5 pistas, e a mesma nunca vem duas vezes seguidas;
- o lugar do certo na fila não se repete em pistas seguidas;
- `spacing > beam + 170` (nunca dois peixes acesos juntos), e o tempo aceso
  (`(beam + 170) / speed`) fica ≥ 1,4 s;
- N1: `legend === 'always'` e `goldFish === false`.

## 7. O erro

**Peixe errado = errou, perdeu** (`GameScene.lose()`, como na Garra):

1. O anzol fisga o peixe aceso. O molinete gira e o peixe sobe **fazendo careta**
   (pose `fish-yuck`), pendurado na linha na frente do quadro.
2. O quadro se divide: as batidas de um lado, a mancha do peixe do outro, e um
   `≠` grande no meio. As batidas tocam de novo.
3. Na vela, a **linha que traduz a pista** acende e pulsa duas vezes. É a dica
   da ficha ("a legenda reacende"), que chega **depois** do erro, como
   confirmação, sem ter apontado nada antes.
4. A criança do barco faz "ih!". Sai o `WRONG_ANSWER` e roda
   `hud.lives.loseAll()`. A cena vai para `done`, e nenhum toque vale.

Sem vermelho de punição (o `≠` é azul-marinho) e sem som áspero.

**Não é erro:**
- tocar com o facho vazio: o anzol desce, volta vazio, "blup";
- deixar o peixe certo passar: ele dá a volta;
- tocar no quadro, que só repete as batidas;
- o `?`, e tocar enquanto o anzol está na água (é ignorado).

**Pontos:** +10 por pista acertada. `CORRECT_ANSWER` sai quando o peixe cai no
balde. **Estrelas:** 3 ao concluir, porque concluir já significa zero erro. O
valor vai no `stars` do `showLevelComplete`.

**Pista que entrega (conferido):**
- os 4 peixes têm **o mesmo corpo, a mesma cara e o mesmo tamanho**. Só a
  mancha muda;
- o facho acende **qualquer** peixe que está nele, certo ou errado, com a
  mesma luz;
- a vela mostra as 3 linhas iguais, e **nenhuma acende antes** do acerto ou do
  erro;
- o som da fila é o mesmo para todos, e o peixe certo não faz bolha nem brilha;
- a única fonte da resposta é **a pista + a legenda**, que é o conteúdo.

## 8. O acerto e o fim

**Acerto:**
1. O molinete gira e o peixe sobe feliz (`fish-happy`). No alto, ele salta num
   arco até o balde do píer: **splash**, gotinhas.
2. O quadro se divide: as batidas, um `=` e **a mancha na mesma cor**, lado a
   lado, por 2 s. As batidas tocam, e a mancha pisca uma vez em cada batida.
   É a tradução **acontecendo**: o mesmo número em som e em cor.
3. A linha da vela que foi usada brilha uma vez.
4. A criança do barco comemora. A bolinha da fase se enche.
5. A fila sai nadando pela direita, a próxima entra pela esquerda com peixes
   novos, e o quadro sobe e desce com a pista nova.

**Fim do nível:** do balde saltam **5 fichas** (`🥁🥁 = 🔵`, …), que se alinham no
meio da tela. O letreiro **MESMA COISA, DOIS CÓDIGOS!** salta e cai confete.
Depois vem o `showLevelComplete`, com a síntese da ficha na mensagem: *"Dá para
dizer a mesma coisa com sons, cores e desenhos!"*

## 9. Guia visual (1º ano, sem texto)

É o `shared/guide/createVisualGuide`, com véu, dedo e espera pelo gesto real. A
chave no `registry` é `ef01co05-l1`. Os gestos são só `tap` e `none`, que já
existem.

1. **A pista.** O véu deixa só o quadro aceso. As batidas tocam e cada tambor
   pulsa na sua. O dedo toca o quadro, e elas tocam de novo (é assim que se
   reouve).
2. **A legenda** (`none`). O véu abre a vela. O dedo desce pelas 3 linhas, e
   cada uma acende na sua vez enquanto as batidas dela tocam: 1, 2, 3. O dedo
   **não para** na linha da pista.
3. **Demonstração** (`demo`, uma pista de treino que não conta: 🥁). O véu abre a
   água e o facho. Um peixe azul passa aceso e o dedo **não toca**. Chega o
   vermelho, o dedo toca, e ele vai para o balde com o `🥁 = 🔴` no quadro.
4. **A vez da criança** (`waitFor`). A pista 1 de verdade desce e toca. O dedo
   pulsa sobre o **facho**, sem apontar peixe nenhum. O guia sai no primeiro
   toque, dê o que der.

Legenda do passo 3: **Pesque a mesma cor!** (4 palavras). Os outros passos não
têm texto.

O `?` pausa a fila e repete os passos 1 a 3 com uma pista de treino. Depois a
fila volta exatamente para onde estava.

**Dá para entender o objetivo sem ler?** Sim. O passo 1 mostra que o quadro
**fala** em batidas, o passo 2 mostra que a vela **traduz** cada batida numa
cor, e o passo 3 mostra que se pesca a cor da tradução, deixando passar a que
não é.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| pista | o quadro desce balançando; cada tambor pulsa | tum (tambor grave sintetizado), 1 a 3 vezes, 0,45 s entre elas |
| reouvir | o quadro dá um pulinho | as mesmas batidas |
| facho | o peixe dentro fica mais claro, com um aro de luz | nada, para não virar pista de ritmo |
| anzol desce | linha reta, o anzol mergulha | "fiu" + plop na água |
| vazio | o anzol volta, 3 bolhinhas | "blup" |
| fisgou | o molinete gira, o peixe sobe | trrrr de molinete |
| certo | salto até o balde, splash, `=` no quadro | splash + plim |
| errado | careta, `≠`, a linha da vela pulsa | "fom" macio, duas notas descendo |
| fim | 5 fichas, letreiro, confete | acorde |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · clue · fish · hook · catch · done · panel`.
O toque de fisgar só vale em `fish`. O do quadro vale em `clue` e em `fish`.
`startClue` faz `++gen`, e todo `await` é seguido de `if (gen !== this.gen) return`.

O peixe é **escolhido no toque**: `fishInBeam` na hora do `pointerdown`. O
anzol desce seguindo aquele peixe, e a resposta é dele. Se nenhum estiver no
facho, é o caso vazio.

A bridge segue a Garra: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` por pista, `WRONG_ANSWER` no erro, `CHECKPOINT` com
`progress = round(pistasFeitas / 5 × 100)`,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START/PAUSE/RESUME (PAUSE congela a fila e corta o som). O jogo
nunca emite `GAME_OVER` (quem emite é o `loseAll`) e nunca escreve
`isFinalStage`.

## 12. Depois do N1 (a ficha, pronta para quando vier)

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **outro par de códigos, sem muleta** | cor → figura (vermelho = sol, azul = peixe, amarelo = banana). A pista é uma mancha de cor no quadro, e a barriga dos peixes tem a figura. A legenda da vela aparece **só 5 s** por pista (`legend: 'flash'`). 5 peixes |
| 3 | **o som como código** | figura → som (sol = chocalho, peixe = splash, banana = tambor). A pista é uma figura (ou duas: sol + banana), e os peixes **não mostram nada**: cada um toca o seu som ao entrar no facho. **Peixe d'ouro** (`goldFish`): tocar nele toca o som uma vez por pista. Legenda só na 1ª pista (`legend: 'first'`) |

A ficha abre uma ponta no N3: com pistas de 2 símbolos, o peixe teria de
**tocar dois sons**. Decido isso quando o N3 entrar.

## 13. Arquivos, texturas e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts`, `data/codes.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (pistas, fila, facho, `fishInBeam`, erro) | `data/layout.ts`, `data/theme.ts`, `scenes/boat.ts` (barco, vara, linha, anzol, molinete), `sail.ts` (legenda), `board.ts` (quadro, `=`/`≠`), `school.ts` (fila, facho, mancha), `bucket.ts` (balde, splash, fichas), `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi de figurinha**, como o Balão; prompts no
[TEXTURAS.md](./TEXTURAS.md); *Dúvida 5*):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-lago.png` | 1280 × 720 | céu com nuvens, margem, o lago visto de lado e o píer à direita |
| `barco.png` | 3 × 2, 512 | barco com a vela lisa e a criança pescando: parado, jogando, puxando, comemorando, "ih!", 1 livre |
| `peixes.png` | 3 × 2, 384 | o peixe com a mancha branca: nadando A/B, fisgado, feliz, careta, **peixe d'ouro** (N3) |
| `pecas.png` | 4 × 3, 320 | quadro-pista, tambor, mancha, anzol, balde, sol, peixinho, banana, chocalho, gota de splash, dedo, 1 livre |
| `cover-pescaria-dos-codigos.png` | 1672 × 941 | capa **com o título** |

**Código:** a legenda da vela (ícones de `pecas` + setinha), a linha de pesca,
o facho, o `tint` da mancha, o aro de luz do peixe aceso, o `=`/`≠`, as fichas,
o letreiro, as bolhas, o splash (gotas de `pecas` em partículas), o confete, as
bolinhas, o `?`.
**Antes da arte:** peixes em elipse com a mancha em círculo, só para testar.
Isso nunca é a entrega.

**Registro:** id = `NEXT_FREE_ID` no commit (hoje **095**), que avança um. O slug
é `pescaria-dos-codigos`, entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, ganha
3 frases em `gameInstructions.ts` e `public/og/pescaria-dos-codigos.jpg`. A
categoria é **Mundo Digital**.

## 14. Travas para quem mexer depois

- A resposta mora **só** na tabela do código e na mancha. Nenhum brilho, bolha,
  som ou lugar da fila diz qual é o certo.
- Todos os peixes são **o mesmo PNG**. Nunca crie um peixe "especial" para o
  certo; o peixe d'ouro do N3 é uma ferramenta de ouvir, e **não é resposta**.
- O código da pista e o da resposta nunca são o mesmo.
- O peixe é escolhido **no toque**, pelo facho. Nunca decida pela posição de
  chegada do anzol.
- `legend` e `goldFish` são dados do nível, não `if` na cena.
- Se a arte do peixe mudar, a posição da mancha em cada pose é medida de novo
  (MANIFEST) e o `spacing > beam + largura` é conferido.

## Dúvidas para o usuário

1. **Erro:** segui o Balão. Peixe errado = **errou, perdeu**; anzol na água
   vazia não conta nada. Mantém?
2. **Facho:** para o "tempo certo" não virar castigo de coordenação, um facho
   de luz mostra qual peixe vai ser pescado antes do toque, e esse peixe é o
   escolhido. Pode, ou quer o anzol pegando só quem estiver embaixo no instante
   em que ele chega?
3. **Parecido com a Ilha dos Códigos (R2):** as tabelas (batidas → cor → desenho
   → som) são as mesmas, e muda só o gesto (pescar em vez de tocar num cartão
   parado). Segui a ficha. Quer que o N1 use outro par de códigos para se
   afastar da Ilha?
4. **A pista mostra os tambores** (🥁🥁) **e toca** as batidas, como a ficha
   diz. Com os tambores desenhados, dá para resolver sem ouvir, contando.
   Mantém, ou prefere o quadro mostrando só um alto-falante no N1?
5. **Estilo:** chibi de figurinha (`19`), como o Balão. Tem outra imagem para
   este jogo?

## Histórico

- **29/09/2026.** Primeiro planejamento, a partir da ficha original, com as
  decisões e as lições do Balão do Recado aplicadas.
