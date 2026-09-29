# Estudo da 2ª rodada — lado da lógica (Ferro)

Fontes lidas a fundo: `EF15CO04/canteiro-de-obras`, `EF15CO03/achados-e-perdidos`,
`EF05CO09/guilda-dos-criadores`, `EF02CO01/detetive-dos-modelos` (PLANEJAMENTO.md,
types.ts, data/levels.ts, index.ts, BootScene, GameScene). De passagem
(PLANEJAMENTO.md + levels.ts): `EF01CO03/pulo-programado`, `EF01CO07/esconde-dados`,
`EF02CO04/fuga-do-laboratorio`.

## (a) Esqueleto comum REAL da 2ª rodada

- **Arquivos:** `index.ts` só com `[BootScene, GameScene]`, 1280×720 e `Scale.FIT`;
  `types.ts`; `data/{levels,layout,theme}.ts`, às vezes mais `files.ts`; um
  `scenes/<peça>.ts` por componente (`createX` devolve uma interface com `destroy`);
  `scenes/audio.ts`, `hud.ts` e o NPC (`tuca.ts`, `clerk.ts`, `detective.ts`);
  além de `PLANEJAMENTO.md` e `TEXTURAS.md`.
- **BootScene:** carrega as PNG de `src/assets/games/<COMP>/<slug>/*.png` com
  `import.meta.glob`, pula a capa, chama `createLoadingScreen` e `preloadLives`,
  e faz `start('GameScene', {level: faseInicial(this,1), points:0})`.
- **Níveis:** `LevelDef {level, <fases>[]}`, e o nome da lista muda por jogo
  (`phases`, `cases`, `sites`, `builds`). São 3 a 5 fases por nível. Nenhum jogo
  guarda gabarito: o veredito é uma função pura (`evaluate`, `avaliar`,
  `belongsTo`, `matchesZone`, `firstFailure`). Três dos 4 validam os níveis no
  import e reclamam no console em dev (a Guilda lança erro). Achados e
  Esconde-Dados têm `validateLevels(LEVELS)`, que também vigia se a pista
  entrega a resposta.
- **Ciclo do caso:** um único estado por jogo (`Phase` / `Mode` / `state`) decide
  se o toque vale, com uma linha no começo de cada handler. Não existe mais a
  flag `locked`. `startCase` faz `++gen`, e todo `await` é seguido de
  `if (gen !== this.gen) return`. O tabuleiro entra antes do tutorial.
- **Erro:** o jogo mostra o estrago acontecendo e o NPC diz o que a peça *disse*
  (nunca a resposta), depois volta à mesma decisão. No 2º erro, a peça certa
  brilha. `chargeOnce()`: um `WRONG_ANSWER` e um `lives.lose()` por caso. O
  Detetive cobra a cada erro.
- **Vitória:** `pointsFor(missed)` dá 10 ou 5, e o `CORRECT_ANSWER` sai no fim do
  caso. No fim do nível sai `GAME_COMPLETED{stage, totalStages: LEVELS.length}` e
  o `showLevelComplete`: `autoAdvance` com `restart({level+1, points, lives:
  livesLeft})`, ou botões no último nível.
- **Derrota:** só pelo `createLives`, que emite `GAME_OVER` sozinho. Nenhum dos 4
  usa barra de tempo.
- **Plataforma:** `GAME_READY` e um `CHECKPOINT` no `create`. `onCommand` trata
  `START_GAME` (se o stage for outro, faz restart) e `PAUSE_GAME`/`RESUME_GAME`
  (`scene.pause`/`resume`). `EventBus` ouve `mute-audio` e `show-tutorial`, com
  `off` no shutdown.
- **Stage:** é sempre `this.level.level`, e o nível sai de `faseInicial` (via
  `registry`).

## (b) Onde a 2ª rodada diverge da memória padrao-remake-jogo

1. O arquivo é `data/levels.ts` com validação, não `casos.ts`.
2. Entraram `faseInicial`, `vidasIniciais` e `createLives`; a memória não cita
   nenhum dos três.
3. A GameScene usa um estado único em vez de `locked`, e não existe `init` com
   `phase`.
4. O tutorial mudou: Canteiro e Guilda trocaram o `createTutorial` por um guia
   com véu + NPC que para até o gesto real (`wait/mark`, `esperar/cumprir`). A
   chave de "já visto" fica em `tutorialStorage` ou no `registry`.
5. O `onCommand` também trata pausa, não só `START_GAME`.
6. O áudio saiu para `scenes/audio.ts` (`createAudio`).
7. O `CHECKPOINT.progress` não segue um padrão:
   - o Detetive calcula no jogo todo;
   - Achados e Guilda calculam por nível;
   - o Canteiro mistura os dois (`sitesDone/TOTAL_SITES`), o que dá errado quando
     existir N2.
8. Coisas que fogem da lei:
   - a Guilda tem identificadores em português e muitos comentários;
   - no fim da Guilda, "jogar de novo" usa `livesLeft` em vez de `livesTotal`.

## (c) Molde mínimo para um jogo da 3ª rodada

```
index.ts · types.ts · data/levels.ts (LEVELS + regra pura + validateLevels no import)
data/layout.ts · data/theme.ts · data/files.ts (SHEETS)
scenes/BootScene.ts · scenes/GameScene.ts (estado único, gen, chargeOnce, bridge, lives)
scenes/<peça>.ts (1–3 painters) · scenes/hud.ts · scenes/audio.ts · scenes/guide.ts (dedo/véu visual)
PLANEJAMENTO.md · TEXTURAS.md
```

O guia visual segue o modelo `wait/mark` do Canteiro, com o `createTutorial` só
no replay pelo `?`.

## (d) O que o PLANEJAMENTO.md sempre contém

- o jogo em uma frase;
- a habilidade da BNCC e "o teste da bolinha";
- como ele não vira o jogo irmão;
- o laço (em diagrama);
- a grade 1280×720;
- níveis e fases, com o assunto de cada nível;
- as regras em código e a validação;
- o erro, e os casos que não são erro;
- feedback e áudio;
- tutorial e `?`;
- o que é textura e o que é código, e o jogo antes da arte existir;
- telemetria e registro no catálogo, com um checklist de "antes de considerar
  pronto";
- travas para quem mexer depois;
- um histórico datado de "o que mudou na construção", que cresce a cada rodada.

## Bugs vistos na 2ª rodada

1. **Guilda — "jogar de novo" não devolve as vidas.**
   `src/games/EF05CO09/guilda-dos-criadores/scenes/GameScene.ts:768` faz
   `restart({ level: 1, points: 0, lives: this.livesLeft })`. O INSTRUCOES.md diz
   que só o recomeço do zero devolve as vidas cheias: deveria ser `this.livesTotal`.
2. **Canteiro — `progress` mistura escopo de nível e de jogo.**
   `src/games/EF15CO04/canteiro-de-obras/scenes/GameScene.ts:656-660` usa
   `done = final ? this.level.sites.length : this.sitesDone` sobre
   `TOTAL_SITES` (soma de todos os níveis). Hoje só existe o N1
   (`data/levels.ts:91`), então passa; quando N2/N3 entrarem, o progresso zera a
   cada nível e nunca chega a 100%.
3. **`progress` sem padrão entre jogos** (não é bug isolado, é inconsistência):
   Achados `scenes/GameScene.ts:582` e Guilda `scenes/GameScene.ts:807` calculam
   por nível (0–100 a cada nível); Detetive calcula sobre o jogo todo
   (`testsBefore` + `TOTAL_TESTS`). A plataforma recebe semânticas diferentes.
4. **Guilda — foge da lei de código.** Identificadores em português (`errou`
   `GameScene.ts:608`, `julgar` `:522`, `guiar` `:866`, `esperar`/`cumprir`,
   `avaliar` em `types.ts`) e blocos de comentário longos em `types.ts`,
   `data/levels.ts` e `GameScene.ts`, contra "nada de comentário no código" do
   INSTRUCOES.md.
5. **Detetive — cobra vida a cada erro.**
   `src/games/EF02CO01/detetive-dos-modelos/scenes/GameScene.ts:297` chama
   `penalize()` (WRONG_ANSWER + `lives.lose()`) em todo erro, enquanto os outros
   três cobram uma vez por caso (`chargeOnce`). Pode ser decisão, mas diverge do
   resto da rodada.
