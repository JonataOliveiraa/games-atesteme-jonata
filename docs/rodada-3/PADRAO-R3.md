# Padrão da 3ª rodada

A ficha de cada jogo é `docs/rodada-3/<CÓDIGO>.md`. Os padrões gerais do catálogo
estão em `INDICE.md`. Quando a ficha e este arquivo não concordam, **vale este
arquivo**. Quando este arquivo e `src/games/INSTRUCOES.md` não concordam, vale o
INSTRUCOES.md, com uma exceção: as vidas (item 3).

## Decisões do usuário (28/09/2026)

1. **Tela 1280×720 fixa, com `Scale.FIT`.** A ficha pede layout para paisagem e
   retrato; isso fica de fora. Botões com área de toque de pelo menos 96 px.
2. **O fluxo é o da plataforma.**
   - Não há tela de TÍTULO.
   - O "exemplo animado de 5 s" da ficha vira o **guia visual** da abertura: o
     dedo faz uma jogada de verdade e depois espera a criança fazer a dela.
   - O fim de nível é o `showLevelComplete`, com estrelas e JOGAR DE NOVO.
   - **Não existe TROCAR NÍVEL.** Os níveis andam em ordem, e concluir o N3 é o
     que aprova a criança.
3. **Quem decide a derrota é a plataforma, não o jogo.**
   - O usuário vai remover as vidas no futuro e passar a valer **1 erro =
     perdeu**. O jogo tem que estar pronto para isso sem precisar ser mexido.
   - No erro, o jogo mostra o que deu errado (a trava da ficha, o estrago) e
     emite **um `WRONG_ANSWER` por passo** (`chargeOnce`), seguido de
     `lives.lose()`, como na 2ª rodada, pelo `shared/hud/createLives.ts`.
   - Hoje o `createLives` conta as vidas e emite `GAME_OVER` no zero. Quando as
     vidas saírem, a mudança acontece **só no shared e na plataforma**, e vale
     para os 45 jogos de uma vez.
   - O jogo nunca emite `GAME_OVER` por conta própria e não tem uma regra de
     derrota só dele. A trava continua existindo, porque ela é o que a criança
     vê enquanto a plataforma não encerra a partida.
   - Estes jogos não têm barra de tempo que reprove.
4. **Primeiro um piloto, depois ondas de 2 jogos.** O piloto é o **091,
   EF01CO01, Garra dos Grupos**, **só com o N1**
   (`src/games/EF01CO01/garra-dos-grupos`). A Decolagem (EF01CO03) tem
   planejamento pronto, fica para depois e ganha outro id.

## Diretrizes que valem para todo jogo

- **Simples.** Um gesto e uma mecânica por jogo, com o objetivo entendido em
  segundos.
- **1º e 2º ano: guia VISUAL.** Véu escuro, destaque na peça, o dedo tocando, e
  uma frase de no máximo 4 palavras, ou nenhuma. Do 3º ano em diante, falas
  curtas que esperam o Próximo.
- **O `?` fica sempre visível.** Ele pausa o jogo e repete o guia visual.
- **Arte chibi / fofa / anime.** Olhos grandes, formas simples, muita expressão.
  A referência é `references/19-chibi-figurinhas.jpg`.
- **Trava no erro.**
  - A peça congela e aparece um cadeado.
  - A dica vem pelo conteúdo, nunca "tente de novo".
  - Depois do 2º erro no mesmo passo, a opção certa pisca.
- **Pontos.** +10 no acerto de primeira, +5 depois de uma trava. As estrelas
  são 3 com ≥90% de acertos de primeira, 2 com ≥70% e 1 quando o nível é
  concluído. Pontos nunca aparecem escritos na tela.
- **Níveis 1 a 3 usam a mesma mecânica.** Só mudam os parâmetros (velocidade,
  quantidade, distratores). Cada nível tem no máximo 5 fases.
- **Sem narração.** Só música e efeitos, sintetizados em WebAudio.

- **Sem texto de fase.** O progresso de fase aparece só nas bolinhas do HUD;
  nada de "FASE 2 DE 3" escrito (pedido do usuário, 28/09/2026).
- **Capa com título.** Toda capa (`cover-<slug>.png`) traz o **título do jogo
  escrito na imagem**: em cima, centralizado, letras grandes e coloridas, com
  contorno escuro. É o padrão das capas atuais. As outras folhas continuam sem
  texto.

## Molde de arquivos (o esqueleto real da 2ª rodada)

```
src/games/<CÓDIGO>/<slug>/
  index.ts            1280×720, Scale.FIT, [BootScene, GameScene]
  types.ts
  data/levels.ts      LEVELS + regra pura + validateLevels no import
  data/layout.ts  data/theme.ts  data/files.ts (SHEETS, POSE)
  scenes/BootScene.ts  import.meta.glob de src/assets/games/<CÓDIGO>/<slug>/*.png, faseInicial
  scenes/GameScene.ts  estado único, gen, bridge (sem lives)
  scenes/<peça>.ts  scenes/hud.ts  scenes/audio.ts
  PLANEJAMENTO.md  TEXTURAS.md
```

Os detalhes estão em `ESTUDO-R2-LOGICA.md` e `ESTUDO-R2-APRESENTACAO.md`. O guia
visual é o `shared/guide/createVisualGuide`: véu, dedo e espera pelo gesto
real.

## Registro no catálogo

- O `id` é o `NEXT_FREE_ID`, e o `NEXT_FREE_ID` avança um no mesmo commit.
- A capa `cover-<slug>.png` fica em `src/assets/games/<CÓDIGO>/<slug>/`.
- `gameInstructions.ts` recebe de 3 a 4 frases curtas.
- O slug entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`.
- `public/og/<slug>.jpg` é gerado com `scripts/gerar-og.mjs`.

## Fluxo do time

1. **Ferro** escreve o `PLANEJAMENTO.md` e o esqueleto do `TEXTURAS.md` (arquivos,
   grades, o que vai em cada célula). O Orquestrador revisa.
2. **Aquarela** escreve os prompts completos no `TEXTURAS.md` e gera as imagens
   em `outputs/<slug>/raw/`.
3. **Tesoura** reempacota e mede as imagens, entrega em
   `src/assets/games/<CÓDIGO>/<slug>/` e publica o `MANIFEST.md`.
4. **Ferro** faz a lógica e a GameScene. **Brasa** faz as peças, o HUD, o guia,
   o áudio e o registro no catálogo. Os dois combinam antes quem mexe em cada
   arquivo.
5. O Orquestrador revisa e faz o commit, e o usuário testa.
