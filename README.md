# Plataforma de Jogos Educativos - BNCC Computacao EF I

Plataforma web de jogos educativos para Computacao no Ensino Fundamental I, organizada por habilidades da BNCC Computacao, com arquitetura React + Phaser e comunicacao tipada entre plataforma e jogos.

O escopo curricular do projeto contempla **135 jogos/fases jogaveis**, derivados de 45 entradas curriculares com progressao em tres niveis: **N1**, **N2** e **N3**. Cada entrada curricular possui uma experiencia com dificuldade crescente, pensada para cobrir reconhecimento, aplicacao guiada e resolucao autonoma.

Publico-alvo: estudantes do 1o ao 5o ano do Ensino Fundamental.

## Visao Geral

A aplicacao e uma plataforma React que lista jogos, controla progresso, pontos, vidas, bloqueios e ranking local. Cada jogo roda em Phaser 3, isolado em sua propria pasta, com cenas, dados, assets e `GameConfig` independente.

A arquitetura atual separa tres conceitos que antes ficavam misturados:

| Conceito | Uso |
|---|---|
| `id` | Identidade interna estavel do jogo. Usado em progresso, vidas, bloqueios, ranking e historico. |
| `slug` | Identidade publica da URL `/jogos/:slug`. Pode mudar com alias de compatibilidade. |
| `module` | Caminho fisico do jogo em `src/games/<skill>/<slug>/index.ts`. |
| `skill` | Codigo curricular BNCC, como `EF03CO08`. E uma tag pedagogica, nao a identidade interna. |

Regra principal: **estado interno usa `game.id`; URL publica usa `game.slug`; carregamento usa `game.module`.**

## Escopo de Conteudo

O projeto trabalha com 135 experiencias jogaveis na progressao curricular:

| Grupo curricular | Entradas | Progressao | Total jogavel |
|---|---:|---:|---:|
| 1o ano | 7 | N1, N2, N3 | 21 |
| 2o ano | 6 | N1, N2, N3 | 18 |
| 3o ano | 9 | N1, N2, N3 | 27 |
| 4o ano | 8 | N1, N2, N3 | 24 |
| 5o ano | 11 | N1, N2, N3 | 33 |
| Transversal 1o-5o | 4 | N1, N2, N3 | 12 |
| Total | 45 | 3 niveis | 135 |

Codigos curriculares cobertos, sem listar nomes individuais dos jogos:

```txt
EF01CO01 a EF01CO07
EF02CO01 a EF02CO06
EF03CO01 a EF03CO09
EF04CO01 a EF04CO08
EF05CO01 a EF05CO11
EF15CO01 a EF15CO04
```

Eixos pedagogicos principais:

- Pensamento Computacional
- Mundo Digital
- Cultura Digital

## Stack

| Camada | Tecnologia |
|---|---|
| Plataforma | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Jogos | Phaser 3.90 |
| Rotas | React Router DOM 7 |
| Estado | React Context + `localStorage` |
| Assets | Imports Vite em `src/assets/games` |
| Comunicacao | Bridge tipada por `CustomEvent` ou `postMessage` |

## Scripts

```bash
npm install
npm run build
npm run lint
npm run preview
```

Durante desenvolvimento, o projeto tambem possui:

```bash
npm run dev
```

Use apenas quando for testar localmente. Para manutencao de codigo e documentacao, o fluxo recomendado e editar e validar com `npm run build`.

## Estrutura Atual

```txt
src/
  assets/
    games/
      <skill>/<slug>/              # Imagens, capas, fundos e sprites do jogo

  components/                      # Componentes React reutilizaveis
  context/                         # Estado global da plataforma
  data/
    catalog.ts                     # Fonte canonica do catalogo
    gameIndex.ts                   # Indices, resolvers e lazy loading dos jogos
    games.ts                       # Reexport/compatibilidade do catalogo atual

  games/
    <skill>/<slug>/
      index.ts                     # Export default Phaser.Types.Core.GameConfig
      types.ts                     # Tipos especificos do jogo
      data/                        # Niveis, missoes, desafios, blocos, layouts
      scenes/
        BootScene.ts               # Preload de assets e tela de carregamento
        GameScene.ts               # Logica principal do jogo
        UIScene.ts                 # HUD separado quando necessario

  pages/                           # Telas React da plataforma
  platform/components/
    GameFrame.tsx                  # Escolhe modo local ou iframe
    GameLauncher.tsx               # Monta Phaser local e envia START_GAME
    IframeGameFrame.tsx            # Renderiza iframe e usa postMessage
    PhaserCanvas.tsx               # Cria/destroi instancia Phaser.Game

  shared/
    bridge/                        # Bridges local/iframe/runtime
    contracts/                     # Tipos de comandos e eventos
    tutorial/                      # Tutorial compartilhado para cenas Phaser
    types/                         # Tipos compartilhados
    utils/                         # Persistencia auxiliar

  styles/
    global.css
```

## Catalogo e IDs Estaveis

`src/data/catalog.ts` e a fonte unica de verdade dos jogos. Cada entrada deve ter:

```ts
{
  id: "046",
  slug: "novo-jogo",
  module: "EF15CO02/novo-jogo",
  skill: "EF15CO02",
  years: [1, 2, 3, 4, 5],
  tags: ["algoritmos"],
  order: 460,
  status: "published",
  title: "Novo Jogo",
  description: "Descricao curta para o catalogo.",
  category: "Pensamento Computacional",
  points: 60,
  thumbnail,
}
```

Regras de manutencao:

- `id` e imutavel e nao deve ser reaproveitado.
- `slug` pode mudar, mas o valor antigo deve entrar em `aliases`.
- `module` deve apontar para uma pasta real em `src/games`.
- `order` controla exibicao; nao use `id` para ordenar curriculo.
- `skill` agrupa por habilidade BNCC, mas nao deve ser usado como chave de progresso.

`src/data/gameIndex.ts` cria indices por `id`, `slug` e `skill`, normaliza entradas legadas com `resolveGameId()` e carrega jogos por `import.meta.glob("../games/*/*/index.ts")`.

## Fluxo de Carregamento

1. Usuario acessa `/jogos/:slug`.
2. `GameDetailsPage` resolve o jogo com `getGameBySlug(slug)`.
3. Se o slug for alias, a rota pode ser normalizada para o slug canonico.
4. `loadGameConfig(game)` faz lazy load de `src/games/<module>/index.ts`.
5. `GameFrame` decide entre jogo local ou iframe.
6. `GameLauncher` ou `IframeGameFrame` envia `START_GAME`.
7. O jogo emite eventos de progresso para a plataforma.
8. `GameContext` normaliza `gameId` e persiste pontos, vidas, bloqueios e historico.

## Contratos de Comunicação

Comandos da plataforma para o jogo:

```ts
type PlatformCommand =
  | { type: "START_GAME"; gameId: string; points: number; stage: number; lives: number }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "UNLOCK_GAME"; gameId: string }
```

Eventos do jogo para a plataforma:

```ts
type PlatformEvent =
  | { type: "GAME_READY"; gameId: string }
  | { type: "CHECKPOINT"; gameId: string; progress: number; score: number; stage: number; hits?: number; errors?: number }
  | { type: "CORRECT_ANSWER"; gameId: string; pointsEarned: number; stage: number }
  | { type: "WRONG_ANSWER"; gameId: string; pointsEarned: number; stage: number }
  | { type: "GAME_OVER"; gameId: string; stage: number }
  | { type: "GAME_COMPLETED"; gameId: string; stage: number }
```

Mensagens iframe:

```ts
type IframePlatformCommandMessage = {
  channel: "platform-command"
  payload: PlatformCommand
}

type IframePlatformEventMessage = {
  channel: "platform-event"
  payload: PlatformEvent
}
```

## Bridge Local e Iframe

O jogo nao deve depender diretamente do React. Dentro do Phaser, use `runtimeGameBridge`:

```ts
runtimeGameBridge.emit({
  type: "CORRECT_ANSWER",
  gameId: GAME_ID,
  stage: currentLevel,
  pointsEarned: 20,
})
```

Para comandos:

```ts
this.unsubscribe = runtimeGameBridge.onCommand((command) => {
  if (command.type !== "START_GAME") return
  if (command.gameId !== GAME_ID) return
  this.startLevel(command.stage)
})
```

A bridge escolhe automaticamente o transporte:

- local: `CustomEvent` no mesmo documento;
- iframe: `window.postMessage` com `channel` e `payload`.

A plataforma tambem aceita eventos de jogos legados que ainda emitem slug/codigo antigo e normaliza para `id` estavel antes de gravar estado.

## Padrao de Um Jogo Phaser

Cada jogo deve exportar um `GameConfig`:

```ts
const Config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: "#000000",
  scene: [BootScene, GameScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

export default Config
```

Recomendações:

- `BootScene` carrega assets e inicia `GameScene`.
- `GameScene` contem regra, interacao, validacao e eventos de progresso.
- `UIScene` deve ser usada para HUD persistente, timer, tutorial ou controles globais quando fizer sentido.
- Use `src/shared/tutorial/createTutorial.ts` para tutoriais, evitando implementacoes isoladas por jogo.
- Hitboxes devem acompanhar o tamanho visual real do elemento, principalmente quando ha PNG redimensionado.
- Evite emojis como UI de jogo; prefira assets reais ou `Graphics` simples em Phaser.

## Estado e Persistencia

O estado da plataforma inclui:

- pontos do usuario;
- vidas por jogo;
- bloqueios temporarios;
- historico de eventos;
- progresso por fase;
- migracao de estados antigos.

A identidade persistida deve ser sempre o `id` estavel. Slugs e codigos BNCC sao aceitos apenas como entrada legada e convertidos com `resolveGameId()`.

## Assets

Assets de jogos ficam em:

```txt
src/assets/games/<skill>/<slug>/
```

Padrao recomendado:

```txt
cover-*.png
bg-*.png
item-*.png
character-*.png
icon-*.png
ui-*.png
effect-*.png
```

Como os assets sao importados por TypeScript/Vite, cada `BootScene` deve importar os arquivos reais e registrar chaves Phaser estaveis:

```ts
import bgUrl from "../../../../assets/games/EF03CO08/estudio-multiformato/bg-format-workshop.png"

this.load.image("bg-format-workshop", bgUrl)
```

# Integracao em Ambiente Flutter via Iframe

Uma solucao tecnica viavel e hospedar a plataforma de jogos como web build separado e integra-la ao Flutter por iframe. O Flutter fica dono de autenticacao, turma, usuario, sincronizacao remota e persistencia principal. O jogo web fica responsavel por renderizar e emitir eventos.

### Arquitetura Proposta

```txt
Flutter App
  ├─ Estado nativo: usuario, turma, token, tentativas, sincronizacao
  ├─ Web container
  │   └─ iframe / WebView apontando para a plataforma web
  └─ Bridge Dart <-> JavaScript por postMessage

Web Game Host
  ├─ React shell em modo embed
  ├─ GameFrame / IframeGameFrame
  ├─ Phaser Game
  └─ runtimeGameBridge
```

### URL de Embed

A plataforma pode expor uma rota dedicada:

```txt
https://games.exemplo.com/embed/:slug?sessionId=<uuid>&level=1&locale=pt-BR
```

Parametros recomendados:

| Parametro | Uso |
|---|---|
| `sessionId` | Correlaciona mensagens entre Flutter e iframe. |
| `level` | Nivel inicial solicitado pelo Flutter. |
| `locale` | Idioma/localizacao. |
| `embed=1` | Remove navegacao da plataforma e mostra somente o jogo. |

### Protocolo de Mensagens

Flutter -> iframe:

```json
{
  "channel": "platform-command",
  "payload": {
    "type": "START_GAME",
    "gameId": "023",
    "stage": 1,
    "points": 120,
    "lives": 3
  },
  "meta": {
    "sessionId": "b7f0...",
    "sentAt": 1780000000000
  }
}
```

iframe -> Flutter:

```json
{
  "channel": "platform-event",
  "payload": {
    "type": "CHECKPOINT",
    "gameId": "023",
    "stage": 2,
    "progress": 0.66,
    "score": 80,
    "hits": 4,
    "errors": 1
  },
  "meta": {
    "sessionId": "b7f0...",
    "sentAt": 1780000005000
  }
}
```

O contrato atual ja usa `channel` e `payload`. O campo `meta` seria uma extensao recomendada para Flutter, porque facilita rastreio, segurança e correlacão de sessoes.

### Flutter Web com Iframe

Em Flutter Web, o container pode registrar um `HTMLIFrameElement` e ouvir `window.onMessage`:

```dart
// Exemplo conceitual para Flutter Web.
// A implementacao real depende da versao do Flutter e do pacote usado.

final iframe = HTMLIFrameElement()
  ..src = 'https://games.exemplo.com/embed/estudio-multiformato?embed=1&sessionId=$sessionId'
  ..style.border = '0'
  ..allow = 'autoplay; fullscreen';

window.onMessage.listen((event) {
  if (event.origin != 'https://games.exemplo.com') return;

  final data = event.data;
  if (data is! Map) return;
  if (data['channel'] != 'platform-event') return;

  final payload = data['payload'];
  // Validar schema e persistir progresso no backend Flutter.
});

void sendStartGame() {
  iframe.contentWindow?.postMessage({
    'channel': 'platform-command',
    'payload': {
      'type': 'START_GAME',
      'gameId': gameId,
      'stage': stage,
      'points': points,
      'lives': lives,
    },
    'meta': {
      'sessionId': sessionId,
      'sentAt': DateTime.now().millisecondsSinceEpoch,
    },
  }, 'https://games.exemplo.com');
}
```

### Flutter Mobile

Em mobile, iframe puro nao e o primitive natural. A abordagem mais robusta e usar um WebView carregando uma pagina wrapper que contem o mesmo host web do jogo (?) O protocolo permanece igual, mas a ponte passa por JavaScript channel do WebView:

```txt
Flutter Mobile
  -> WebView
     -> pagina wrapper web
        -> iframe do jogo ou montagem direta da rota embed
```

Duas opcoes:

1. **WebView direto na rota embed**: mais simples. Flutter conversa com a pagina por JavaScript channel e a pagina repassa para `runtimeGameBridge`.
2. **Wrapper com iframe interno**: mais proximo do Flutter Web. O wrapper valida mensagens, aplica `targetOrigin` e retransmite para o iframe do jogo.

Para mobile, a opcao 1 tende a ter menos pontos de falha. Para web, iframe direto e suficiente.

### Requisitos de Seguranca

- Nunca usar `targetOrigin: "*"` em producao.
- Validar `event.origin` e `event.source`.
- Incluir `sessionId` nas mensagens.
- Validar schema de `channel` e `payload` antes de persistir.
- Tratar eventos duplicados com idempotencia no backend.
- Definir timeout para `GAME_READY` e `START_GAME`.
- Versionar protocolo, por exemplo `protocolVersion: 1` em `meta`.

### Ciclo Recomendado

```txt
1. Flutter cria sessionId e abre iframe/embed.
2. Web emite GAME_READY quando Phaser terminou preload.
3. Flutter envia START_GAME.
4. Jogo emite CORRECT_ANSWER, WRONG_ANSWER, CHECKPOINT ou GAME_COMPLETED.
5. Flutter persiste no backend.
6. Flutter pode enviar PAUSE_GAME/RESUME_GAME conforme ciclo de app.
```

### Algumas observações

- Phaser precisa de gesto do usuario para audio em alguns navegadores.
- O iframe deve ter dimensoes estaveis e proporcao 16:9.
- Em WebView mobile, pause/resume deve acompanhar ciclo de vida do app.
- O jogo nao deve confiar em pontos enviados pelo cliente para ranking definitivo; o backend deve validar regras basicas.
- Para uso offline, Flutter pode enfileirar eventos e sincronizar depois, mas deve preservar ordem por `sentAt` e `sessionId`.

## Como Adicionar um Novo Jogo

1. Criar pasta:

```txt
src/games/<skill>/<slug>/
```

2. Criar assets:

```txt
src/assets/games/<skill>/<slug>/
```

3. Implementar:

```txt
index.ts
scenes/BootScene.ts
scenes/GameScene.ts
scenes/UIScene.ts
data/levels.ts
types.ts
```

4. Registrar no catalogo:

```ts
// src/data/catalog.ts
{
  id: "046",
  slug: "novo-jogo",
  module: "EF01CO01/novo-jogo",
  skill: "EF01CO01",
  order: 15,
  status: "published",
  ...
}
```

5. Validar:

```bash
npm run build
```

Nao adicionar mapas manuais de slug para loader. O carregamento deve continuar passando por `gameIndex.ts`.

## Qualidade e Padroes de UI dos Jogos

- Interface em 1280x720, com escala `Phaser.Scale.FIT`.
- Textos curtos, legiveis e com `wordWrap` controlado.
- Botoes com hitbox compativel com o visual.
- Tutorial curto no inicio, usando componente compartilhado.
- Feedback imediato para acerto, erro e conclusao.
- Animacoes devem explicar estado, nao apenas decorar.
- Evitar elementos sobrepostos em resolucoes menores.
- Preferir assets reais ou `Graphics`; evitar emoji como UI.

## Build e Deploy

Build local:

```bash
npm run build
```

Saida:

```txt
dist/
```

O build e estatico e pode ser servido por qualquer hosting HTTP. Para integracao iframe/Flutter, o deploy deve configurar corretamente:

- HTTPS obrigatorio;
- CORS conforme necessidade dos assets;
- `Content-Security-Policy` permitindo o dominio Flutter host em `frame-ancestors`;
- cache agressivo para assets versionados;
- sem cache forte para `index.html`.

Exemplo de CSP para permitir embed por um app web especifico:

```http
Content-Security-Policy: frame-ancestors 'self' https://app.exemplo.com
```

## Documentos Relacionados

- `docs/migracao-catalogo-ids.md`: detalhes da migracao para IDs estaveis.
- `docs/analise-arquitetura-jogos.md`: analise arquitetural anterior do projeto.

# Lista dos jogos

## Catálogo — 90 jogos

45 habilidades BNCC, 2 jogos por habilidade (duas rodadas de concepção):

- **R1** — catálogo original: níveis 1-3, mecânicas de montagem e edição. É o que está implementado em `src/games/`. S
- **R2** — versão hipercasual (v3): 1 gesto por jogo, sem montagem, sessão de 2-5 min, trava no erro, botão `?` de instruções, sem narração, computador e celular.

| Tag | Jogo | R | Gênero / mecânica |
| --- | --- | --- | --- |
| EF01CO01 | Base dos Classificadores | R1 | Classificação por arrastar e soltar |
| EF01CO01 | Corrida dos Parecidos | R2 | Corrida (endless runner) |
| EF01CO02 | Trilha do Passo a Passo | R1 | Execução sequencial guiada |
| EF01CO02 | Ritmo da Rotina | R2 | Ritmo / música |
| EF01CO03 | Oficina dos Algoritmos | R1 | Puzzle de ordenação lógica |
| EF01CO03 | Pulo Programado | R2 | Plataforma |
| EF01CO04 | Correio Multimídia | R1 | Simulação de transmissão de informação |
| EF01CO04 | Passe da Mensagem | R2 | Esporte |
| EF01CO05 | Pixel Secreto | R1 | Color by code / decodificação visual |
| EF01CO05 | Ilha dos Códigos | R2 | Aventura / exploração |
| EF01CO06 | Desktop Digital Infantil | R1 | Simulação de interface / sandbox orientado |
| EF01CO06 | Meu Bichinho Conectado | R2 | Simulador de vida |
| EF01CO07 | Guardiões dos Dados | R1 | Tomada de decisão contextual |
| EF01CO07 | Esconde-Dados | R2 | Stealth infantil |
| EF02CO01 | Hangar dos Modelos | R1 | Modelagem por filtros e comparação |
| EF02CO01 | Detetive dos Modelos | R2 | Point-and-click / mistério |
| EF02CO02 | Desfile do Robô Repetidor | R1 | Programação por blocos com repetição definida |
| EF02CO02 | Série do Campeão | R2 | Esporte |
| EF02CO03 | Fábrica de Máquinas | R1 | Seleção de máquina e sequência de comandos |
| EF02CO03 | Vila das Máquinas | R2 | RPG leve (micro-missões) |
| EF02CO04 | Museu Vivo do Computador | R1 | Pareamento conceitual |
| EF02CO04 | Fuga do Laboratório | R2 | Escape room individual |
| EF02CO05 | Cidade das Tecnologias | R1 | Escolha contextual de ferramenta |
| EF02CO05 | Corrida do Cotidiano | R2 | Corrida (endless runner) |
| EF02CO06 | Checklist do Jogador Seguro | R1 | Configuração segura por checklist |
| EF02CO06 | Bolhas da Segurança | R2 | FPS adaptado (mira, sem violência) |
| EF03CO01 | Tribunal do Verdadeiro ou Falso | R1 | Quiz lógico contextual |
| EF03CO01 | Cabo de Guerra da Verdade | R2 | Luta como disputa (vs IA) |
| EF03CO02 | Labirinto do Enquanto | R1 | Programação condicional com laço indefinido |
| EF03CO02 | Corra Enquanto... | R2 | Corrida (endless runner) |
| EF03CO03 | Chef dos Subproblemas | R1 | Planejamento modular |
| EF03CO03 | Missão em Pedaços | R2 | Estratégia por turnos |
| EF03CO04 | Montador de Informações | R1 | Montagem estruturada de dados |
| EF03CO04 | Caverna dos Dados | R2 | Aventura / exploração |
| EF03CO05 | Formato Certo | R1 | Matching entre informação e formato |
| EF03CO05 | Torres dos Formatos | R2 | Tower defense |
| EF03CO06 | Central de Entrada e Saída | R1 | Conexão funcional de periféricos |
| EF03CO06 | Fase de Entrada e Saída | R2 | Plataforma |
| EF03CO07 | Detetives da Busca | R1 | Busca guiada com refinamento |
| EF03CO07 | A Busca do Bibliotecário | R2 | RPG leve (micro-missões) |
| EF03CO08 | Estúdio Multiformato | R1 | Criação livre orientada |
| EF03CO08 | Show de Formatos | R2 | Ritmo / música |
| EF03CO09 | Investigação: Dados em Risco | R1 | Jogo investigativo por evidências |
| EF03CO09 | Um Dia Online | R2 | Simulador de vida |
| EF04CO01 | Batalha das Coordenadas | R1 | Tabuleiro matricial por coordenadas |
| EF04CO01 | Canhão de Coordenadas | R2 | FPS adaptado (mira, sem violência) |
| EF04CO02 | Arquivo dos Registros | R1 | Consulta e filtragem de registros |
| EF04CO02 | O Cofre dos Registros | R2 | Escape room individual |
| EF04CO03 | Prédio dos Laços | R1 | Programação por blocos com laços aninhados |
| EF04CO03 | Dança Aninhada | R2 | Ritmo / música |
| EF04CO04 | Tradutor da Máquina | R1 | Conversão simbólica |
| EF04CO04 | Pista Binária | R2 | Corrida (endless runner) |
| EF04CO05 | Ateliê de Códigos Digitais | R1 | Oficinas de codificação |
| EF04CO05 | Expedição Pixel | R2 | Aventura / exploração |
| EF04CO06 | Estúdio de Produção Digital | R1 | Produção de conteúdo em editor |
| EF04CO06 | Estúdio Tycoon Mirim | R2 | City builder / gestão |
| EF04CO07 | Missão Ética Digital | R1 | Decisão ética baseada em regras |
| EF04CO07 | Guardião Ético | R2 | Estratégia por turnos |
| EF04CO08 | Caça à Fonte Confiável | R1 | Comparação crítica de fontes |
| EF04CO08 | Duelo das Fontes | R2 | Luta como disputa (vs IA) |
| EF05CO01 | Baralho das Listas | R1 | Manipulação de lista ordenada |
| EF05CO01 | Revezamento em Lista | R2 | Esporte |
| EF05CO02 | Mapas em Rede | R1 | Modelagem e navegação em grafo |
| EF05CO02 | Metrô Mirim | R2 | City builder / gestão |
| EF05CO03 | Arena da Lógica | R1 | Resolução de expressões lógicas |
| EF05CO03 | Portões Lógicos | R2 | Tower defense |
| EF05CO04 | Cidade das Decisões | R1 | Programação por blocos com seleção condicional |
| EF05CO04 | Robô Sorrateiro | R2 | Stealth infantil |
| EF05CO05 | Monte seu Computador | R1 | Montagem funcional |
| EF05CO05 | Dentro da Máquina | R2 | Plataforma |
| EF05CO06 | Missão Arquivo Seguro | R1 | Gestão de armazenamento |
| EF05CO06 | Arremesso na Nuvem | R2 | Esporte |
| EF05CO07 | Controlador do Sistema | R1 | Simulação de gerenciamento de recursos |
| EF05CO07 | Maestro do Sistema | R2 | Simulador de vida |
| EF05CO08 | Radar de Confiabilidade | R1 | Avaliação crítica de conteúdo |
| EF05CO08 | Caça-Boatos | R2 | FPS adaptado (mira, sem violência) |
| EF05CO09 | Curadoria com Créditos | R1 | Curadoria e atribuição de créditos |
| EF05CO09 | A Guilda dos Criadores | R2 | RPG leve (micro-missões) |
| EF05CO10 | Futuro em Cena | R1 | Storytelling digital |
| EF05CO10 | Oficina do Amanhã | R2 | Sandbox de construção criativa |
| EF05CO11 | Escolha a Ferramenta Certa | R1 | Tomada de decisão multicritério |
| EF05CO11 | Kit do Solucionador | R2 | Estratégia por turnos |
| EF15CO01 | Museu das Estruturas | R1 | Metajogo de seleção de representação |
| EF15CO01 | O Mistério do Arquivo Vivo | R2 | Point-and-click / mistério |
| EF15CO02 | Academia dos Algoritmos | R1 | Programação em progressão curricular |
| EF15CO02 | Maratona do Algoritmo | R2 | Plataforma |
| EF15CO03 | Circuito da Verdade | R1 | Circuito lógico |
| EF15CO03 | Trunfo da Lógica | R2 | Cartas / deck-building leve |
| EF15CO04 | Arquiteto das Missões | R1 | Planejamento por decomposição |
| EF15CO04 | Canteiro de Obras | R2 | City builder / gestão |

Anos por prefixo da tag: `EF01` = 1º ano · `EF02` = 2º · `EF03` = 3º · `EF04` = 4º · `EF05` = 5º · `EF15` = 1º ao 5º.

---

## Divergências a resolver

| Onde | Divergência |
| --- | --- |
| EF05CO07 | A planilha R1 traz "Controlador do Sistema"; `catalog.ts` (id 037) usa "Sistema Operacional". |
| EF05CO11 | As planilhas grafam o código como `EF05CO011` (3 dígitos). O correto é `EF05CO11`, como está em `catalog.ts`. |
| `arena-da-logica` | `GameDetailsPage.tsx` lista o slug com acento (`arena-da-lógica`) em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`; o catálogo usa `arena-da-logica`. Não casa. |

---

Fonte única de verdade do catálogo em código: [`src/data/catalog.ts`](src/data/catalog.ts).