# Estudo da 2ª rodada — Apresentação (Brasa)

Jogos lidos a fundo: EF15CO04/canteiro-de-obras, EF15CO03/achados-e-perdidos, EF05CO09/guilda-dos-criadores, EF02CO01/detetive-dos-modelos. Tutoriais de 1º–2º ano: EF01CO03/pulo-programado, EF01CO01/corrida-dos-parecidos, EF02CO02/serie-do-campeao.

## (a) Como a apresentação é feita na 2ª rodada

- **Carregamento:** a `BootScene` lê os PNGs com `import.meta.glob` (nunca `import` estático), de `src/assets/games/<skill>/<slug>/*.png`. A chave é o nome do arquivo. O que começa com `cover` fica de fora, e as folhas de sprite são declaradas num mapa `SHEETS` em `data/files.ts`. Se faltar arte, o jogo continua jogável com fallback em Graphics. A tela é `createLoadingScreen` com as cores de `theme.ts`. Por fim, `preloadLives` e `scene.start('GameScene', { level: faseInicial(this,1) })`.
- **HUD:** um `scenes/hud.ts` próprio de cada jogo devolve `{ setProgress, celebrate, setHelpEnabled, destroy }`. Tem bolinhas de progresso em Graphics, o botão `?` com zona de 120px e `createLives` do shared. Não há texto fixo. As coordenadas ficam em `layout.HUD`.
- **Tutorial, dois modelos:**
  1. `createTutorial` do shared: passos com spotlight, balão e `pointer {tap:true}`. Usam esse modelo achados, detetive, pulo-programado, corrida-dos-parecidos e serie-do-campeao. A chave é `efXXcoYY-lN` e o replay vem de `EventBus 'show-tutorial'`.
  2. Guia feito à mão (canteiro, guilda): o `veil.ts` escurece a tela com 4 faixas em volta de um buraco, que desliza até o alvo sem bloquear o toque. O NPC fala e o código espera o gesto de verdade (`await this.wait('cut')`). A demonstração acontece no tabuleiro real, e `markTutorialSeen` registra que foi visto.
- **Mãozinha ociosa:** o `hint.ts` do canteiro, em Graphics, bate no alvo depois de 4s sem toque. Cada toque adia.
- **Fala do NPC:** cada jogo tem o seu (`tuca.ts`, `artist.ts`, `clerk.ts`, `detective.ts`). É um container com sprite de poses (`POSE` em files.ts: calm/talk/cheer/point), respiração/float/wiggle do FX e balão em Graphics. `say()` escreve letra a letra (`TYPE_MS`) e espera o botão Próximo; `beat()` é `say` + saída.
- **Fim de nível:** confete do FX, depois `showLevelComplete` com as cores do tema, `progress` e o botão JOGAR DE NOVO. Antes disso vai pelo bridge o `GAME_COMPLETED` (stage, totalStages, score, errors).
- **Áudio:** `scenes/audio.ts` de cada jogo, 100% WebAudio sintetizado, sem arquivo e sem narração. Sons nomeados (tap, toc, wrong suave, fanfare) e `setMuted` ligado ao `EventBus 'mute-audio'`.
- **Bridge:** emite `GAME_READY`, `CORRECT_ANSWER`, `WRONG_ANSWER` e checkpoints. Os comandos chegam por `runtimeGameBridge.onCommand`.
- **Catálogo:**
  - capa `cover-<slug>.png` importada em `catalog.ts` (campo `thumbnail`);
  - de 3 a 4 frases em `data/gameInstructions.ts` (`POR_SLUG`);
  - o slug entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` (`src/pages/GameDetailsPage.tsx:17`) quando o jogo tem painel de fim próprio;
  - `public/og/<slug>.jpg` como capa de compartilhamento;
  - avançar o `NEXT_FREE_ID`, que hoje está em "094".

## (b) Formato do TEXTURAS.md

- Cabeçalho com o destino em `src/assets/...` e o link para o PLANEJAMENTO.
- Tabela dos arquivos com nome, grade, tamanho e uso.
- As regras da arte: objeto solto, sem texto, legível a 51px, cor que não entrega a resposta.
- Bloco de ESTILO e bloco NEGATIVO em `~~~text`, em inglês, com a imagem de referência anexada.
- Uma seção por arquivo, com tabela célula a célula ("a ordem dos quadros é contrato com o código") e o prompt inteiro pronto para colar.
- Nota do fundo magenta quando não há transparência.
- Seção final "o que conferir quando a arte chegar".

## (c) O que eu reutilizaria direto do shared/

- `FX`: popIn, press, breathe/float/wiggle, ping, confetti, stars, `type`, `wait`, `all`.
- `createLoadingScreen`, `showLevelComplete`, `createLives` + `vidasIniciais`, `faseInicial`.
- `createTimeBar`, se houver tempo.
- `createTutorial`, com `textSize` 32 e `pointer.tap`.
- `tutorialStorage` (`wasTutorialSeen` / `markTutorialSeen`), `FONT_JOGO`, `EventBus`, `runtimeGameBridge`.
- Os construtores de veil, hint e NPC eu copiaria do canteiro, porque são o melhor molde e hoje não estão no shared.

## (d) Tutorial visual para 1º–2º ano

- Hoje, os 3 jogos de 1º–2º ano que olhei usam `createTutorial` com 3 a 4 frases de texto. É exatamente o que a diretriz quer evitar.
- Eu seguiria o modelo do canteiro sem o texto:
  1. O véu escurece a tela e o buraco desliza até a peça.
  2. A peça pulsa (`FX.breathe` + `ping`).
  3. Um dedo (a mão do `hint.ts`, ou um PNG de mão pedido ao Tesoura) toca de verdade, e o jogo executa a ação real uma vez: essa é a demonstração.
  4. O buraco volta para a peça, o dedo fica tocando em loop, e o código espera o toque da criança nesse alvo (`await wait(...)`).
  5. O acerto dispara `ping` + `stars` + som, e é essa a recompensa que ensina o objetivo.
- O NPC só aparece com um pictograma no balão (ex.: seta para o alvo, check), ou com uma frase de 3 a 4 palavras que espera o Próximo.
- O `?` do HUD repete essa mesma demonstração.
- Para usar em vários jogos, eu extrairia `veil` + `hint` para um `createVisualGuide` no shared, se o Orquestrador aprovar.

**Dúvida:** extraio veil/hint para o shared agora, ou copio por jogo como a 2ª rodada fez?
