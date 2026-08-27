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

# O jogo roda dentro de um iframe — inclusive para nos

Desde ago/2026 sao DUAS rotas, com um comportamento cada:

| Rota | O que e |
| --- | --- |
| `/jogos/<slug>` | **so o canvas.** Sem cabecalho, menu, titulo, capa ou botao. Existe para ser o `src` de um iframe. |
| `/iframe/<slug>` | **a plataforma de jogos:** pontos, vidas, modais, "Iniciar" e "Instrucoes" — e o jogo desenhado num iframe apontado para a rota de cima. |

A lista de jogos leva para `/iframe/<slug>`. A Atesteme aponta o iframe dela
para `/jogos/<slug>`.

Antes `/jogos/:slug` era uma rota com DOIS rostos, escolhidos por `?embed=1`.
Um endereco com dois comportamentos e facil de escrever e dificil de confiar:
"abri o link e veio diferente" vira investigacao toda vez, e quem integra nunca
sabe se esta vendo o que o outro lado vai ver. A query agora traz o CONTEXTO da
partida — ela ajusta a partida, nao troca a pagina.

E a MESMA montagem dos dois lados. A diferenca e o parametro:

| Quem embute | Query | Fim da partida |
| --- | --- | --- |
| A Atesteme | `?embed=1&id=<tentativa>&returnBase=<origem>` | navega para `<returnBase>/approve` ou `/reprove` |
| `/iframe/<slug>` | `?embed=1&inline=1` | nao navega: os pontos e modais sao da pagina hospedeira, e o resultado chega por evento |

**Por que fizemos isso.** Enquanto o Phaser era montado ao lado da pagina, o
caminho do iframe so era percorrido pelas paginas de teste — e caminho que
ninguem percorre no dia a dia quebra em silencio. Agora ele e o caminho normal:
se o embed quebrar, quebra primeiro aqui, para nos, e nao na apresentacao.

## As tres pecas

| Arquivo | Papel |
| --- | --- |
| `platform/components/IframeGameFrame.tsx` | monta o iframe, valida a origem, espera `GAME_READY` e so entao manda `START_GAME` |
| `platform/embed/embedParams.ts` | le `inline` junto com o resto da query, num lugar so |
| `shared/bridge/uiTunnel.ts` | faz o `EventBus` atravessar a parede do iframe |

## O tunel de interface, e por que ele precisou existir

Os eventos da partida (`GAME_READY`, `CHECKPOINT`, `GAME_COMPLETED`…) ja
atravessavam: e o contrato `platform-event`. O que NAO atravessava eram os
sinais de interface que o jogo e a pagina trocavam pelo `EventBus` — `exit-game`,
`close-game-modals`, o modal de vida extra do Pixel Secreto. `EventBus` e um
emissor em memoria, e memoria nao passa de uma janela para outra.

O tunel espelha os dois `EventBus` por um terceiro canal (`game-ui`). O ganho
esta no que NAO mudou: a `GameDetailsPage` continua com o `EventBus.on("exit-game")`
dela intacto, e os 45 jogos continuam com o `EventBus.emit("exit-game")` deles.
Nenhum dos dois sabe que ha uma parede no meio — foi o que permitiu mover o jogo
para dentro do iframe sem encostar em nenhum jogo.

A lista de sinais que atravessam e FECHADA. A maior parte do trafego do
`EventBus` e conversa interna do jogo (`timer-tick`, `mission-update`, `sparks` —
mais de trinta nomes), com as duas pontas dentro do mesmo Phaser; esses
continuam funcionando sozinhos e nao tem por que virar `postMessage`.

`game-ui` nao faz parte do contrato da plataforma. Quem embute de fora pode
ignora-lo inteiro sem perder nada.

## O depurador de eventos — tecla `Y`

**Desligado por padrao.** `Y` liga e desliga, e avisa qual dos dois aconteceu
("🔔 ATIVADO" / "🔕 DESATIVADO"). Ligado, `platform/components/EventMonitor.tsx`
da um `alert()` quando o jogo anuncia que ficou **pronto**, que **venceu** ou
que **perdeu**:

```
🏆 GAME_COMPLETED — VENCEU O JOGO (ultima fase)
fase 3 de 3
pontos: 120
tentativa: inline-abc
jogo: 035
```

Existe porque esse trafego e invisivel: quando um evento nao sai, a tela
simplesmente nao reage, e "nao reagiu" tem uma duzia de causas. Foi assim com o
jogo travando ao errar — a plataforma nunca recebia o `GAME_OVER`, e nada na
tela dizia isso. Um alerta que NAO aparece responde a pergunta na hora.

- Alertam so `GAME_READY`, `GAME_COMPLETED` e `GAME_OVER`. `CHECKPOINT`,
  `CORRECT_ANSWER` e `WRONG_ANSWER` ficam de fora porque disparam a cada
  jogada — um `alert()` por acerto tornaria o jogo injogavel. **Todos** os
  eventos saem no console como `[evento local|iframe]`.
- Escuta os dois caminhos: o evento local (quando `/jogos/<slug>` e aberto
  direto) e o `postMessage` (quando o jogo esta no iframe de `/iframe/<slug>`).
- **So na janela de cima.** O site se embute a si mesmo, entao o mesmo `App`
  roda duas vezes; sem esse corte cada evento daria dois alertas — e o `Y`
  alternaria duas vezes, voltando ao ponto de partida (ou seja: "nao acontece
  nada").
- **A tecla vale dentro do jogo tambem.** Assim que alguem clica no canvas, o
  `keydown` passa a ser entregue a janela DE DENTRO do iframe, e um ouvinte so
  aqui fora para de ver a tecla — o motivo mais provavel de o `Y` ter falhado
  na primeira versao. O ouvinte e registrado na fase de CAPTURA da `window` de
  cada documento (a primeirissima etapa do trajeto, antes de o Phaser ver a
  tecla), e uma varredura a cada 700ms religa quando o iframe e trocado.
- O `alert()` sai num `setTimeout(0)`: congelar dentro do tratamento da
  mensagem seguraria o `postMessage` no meio do caminho.

Em desenvolvimento a tecla vale sempre. Em producao, so com `?debug=1` na URL —
um `alert()` na cara de uma crianca no meio da atividade seria pior que o
problema que ele veio investigar.

Houve aqui um painel lateral com historico e contagem por tipo. Saiu: era mais
maquina do que a pergunta pedia.

## O caminho de volta

`MODO_DO_JOGO` no topo de `GameDetailsPage.tsx` aceita `"iframe"` ou `"local"`.
Trocar para `"local"` devolve a montagem antiga inteira, sem tocar em mais nada.
Esta ali de proposito: e uma linha de recuo se o iframe der problema perto de uma
data de entrega.

## A propria origem entra na allowlist sozinha

`getAllowedOrigins()` sempre inclui `window.location.origin`, alem do que vier
em `VITE_EMBED_ALLOWED_ORIGINS`. Nao e frouxidao: paginas de mesma origem ja
podem ler e escrever uma na outra sem `postMessage` nenhum, entao exigir
configuracao para o site falar consigo mesmo nao protege de nada.

E cobrava caro. O `.env.local` fixa `http://localhost:5173`; num dia em que a
5173 estava ocupada o Vite subiu na **5174**, e o navegador passou a descartar
TODO evento da partida com "target origin does not match the recipient window's
origin". O sintoma nao parecia em nada com a causa: **o jogo travava ao errar e
a tela de derrota nunca aparecia** — porque a plataforma jamais recebia o
`WRONG_ANSWER` nem o `GAME_OVER`. Trocar de porta nao pode quebrar o jogo.

A variavel continua obrigatoria para quem embute de FORA (a Atesteme): sem a
origem dela na lista, nenhum evento sai e nenhum comando entra.

## Uma mensagem so, quando da para saber o destino

`postMessage` exige um `targetOrigin` que bata com a origem real da janela de
destino. Como nao da para perguntar a origem de uma janela de outro dominio, a
saida era mandar uma mensagem por origem permitida — a certa e entregue, as
outras sao descartadas com um erro no console.

Quando a janela e da mesma origem da para saber: `janela.location.origin` e
legivel nesse caso e lanca `SecurityError` em qualquer outro. `origensDeDestino()`
usa isso para mandar UMA mensagem. Nao muda o que chega do outro lado; muda o
console, que antes virava uma parede de "Failed to execute 'postMessage'" a cada
evento da partida, varrendo para longe qualquer erro de verdade.

# Modo Embed — como a Atesteme abre um jogo

Esta secao descreve o que esta IMPLEMENTADO no repositorio. A secao seguinte,
sobre Flutter, e uma proposta anterior e mais ampla; onde as duas divergirem,
vale esta.

A plataforma Atesteme abre um jogo dentro de um `iframe`, passa o contexto por
query string e recebe o resultado de volta. **A Atesteme e dona de aluno,
competencia, tentativa, pontuacao oficial, estrelas e bloqueios. Este site e
dono de renderizar o jogo e relatar o que aconteceu.**

```html
<iframe
  src="https://jogos.atesteme.com/jogos/sistema-operacional?embed=1&attempt=6f1c…&stage=1&points=120&lives=3&returnBase=https%3A%2F%2Fedu.atesteme.com"
  width="100%" height="100%" frameborder="0"
  allow="autoplay; fullscreen"
></iframe>
```

Sem `embed=1`, a mesma URL continua abrindo a pagina normal do jogo, com
pontuacao, vidas e ranking. Nada do site atual muda.

## Parametros da query

| Parametro | Tipo | Obrigatorio | Uso |
|---|---|---|---|
| `embed` | `1` | sim, para o modo embed | Liga o modo embed. |
| `attempt` | string opaca | **sim** | ID da tentativa na Atesteme. Volta como eco em `meta.attempt`; o site nao interpreta. |
| `returnBase` | URL absoluta | **sim** | Origem que recebe o resultado. Precisa estar em `VITE_EMBED_ALLOWED_ORIGINS`. |
| `stage` | `1 \| 2 \| 3` | nao (1) | Fase inicial. Fora do intervalo cai para 1. |
| `points` | inteiro >= 0 | nao (0) | Pontuacao inicial exibida. So display. |
| `lives` | inteiro >= 1 | nao (3) | Tolerancia a erro da partida. |
| `locale` | BCP-47 | nao (`pt-BR`) | Idioma. |

`id` e aceito como sinonimo legado de `attempt`; se os dois vierem, `attempt`
vence.

**Duas classes de parametro, duas reacoes.** `stage`, `points`, `lives` e
`locale` sao ajustes: valor invalido vira o padrao e a partida comeca.
`attempt` e `returnBase` sao o contexto: sem eles a tela mostra um erro
legivel e **nao inicia** — jogar uma partida que ninguem consegue creditar e
pior que uma mensagem de erro.

Tudo isso e lido e validado em `src/platform/embed/embedParams.ts`, num lugar
so. Nenhum jogo le a query.

## O que o modo embed muda na tela

- So o jogo: sem cabecalho, menu, rodape, breadcrumb, ranking ou lista.
- Sem a economia do site: pontos globais, compra de vida e modais que levam
  para fora nao aparecem. Quem da recompensa e a Atesteme.
- **"Iniciar" e "Instrucoes" continuam.** Nao sao enfeite: sao a porta de
  entrada da crianca no jogo.
- Ocupa a viewport inteira, sem rolagem. A proporcao 16:9 quem preserva e o
  `Phaser.Scale.FIT` que os 45 jogos ja usam.

Para ver a pagina normal do mesmo jogo, tire o `embed=1` da URL. Nao ha
atalho de teclado: um segundo jeito de a tela estar, ligado por uma tecla, e o
tipo de estado que ninguem lembra na hora de investigar um problema.

## Contrato de saida

Envelope `{ channel: "platform-event", payload }`, como antes. Todo evento que
sai em modo embed carrega `meta`:

```ts
type EventMeta = {
  attempt: string;       // eco exato do parametro recebido
  gameId: string;        // game.id do catalogo (ex.: "037"), nunca o slug
  sentAt: number;
  protocolVersion: 1;
};
```

`GAME_COMPLETED` ganhou dois campos:

```ts
{
  type: "GAME_COMPLETED";
  gameId: string;
  stage: number;
  totalStages?: number;   // quantas fases o jogo tem
  isFinalStage?: boolean; // true so na ultima
  score?: number; errors?: number; durationMs?: number;
}
```

**Por que:** `GAME_COMPLETED` e emitido a cada fase, e sempre foi. Sem
`isFinalStage`, quem esta de fora nao distingue "terminou a fase 1" de
"terminou o jogo" — e aprovaria o aluno na primeira fase.

Os campos sao opcionais no tipo porque sao **opcionais para quem emite e
garantidos para quem recebe**: os 45 jogos continuam emitindo o que sabem, e
`src/shared/bridge/outgoingEvent.ts` completa `meta`, `totalStages` e
`isFinalStage` num lugar so, antes de o evento sair.

Ordem esperada numa partida:

```
GAME_READY → (CORRECT_ANSWER | WRONG_ANSWER | CHECKPOINT)* → GAME_COMPLETED(isFinalStage) | GAME_OVER
```

Comandos aceitos continuam `START_GAME`, `PAUSE_GAME`, `RESUME_GAME` e
`UNLOCK_GAME`, no envelope `{ channel: "platform-command", payload }`.

## Aprovado e reprovado

Alem do evento, o fim da partida navega o proprio iframe:

```
aprovado:  <returnBase>/approve?id=<attempt>
reprovado: <returnBase>/reprove?id=<attempt>
```

- **Quem navega e a camada de embed, nunca o jogo.** Os 45 jogos so emitem
  eventos; nenhum conhece a URL da Atesteme.
- `GAME_COMPLETED` com `isFinalStage: true` → `/approve`.
- `GAME_OVER`, **ou o esgotamento das `lives` recebidas na query**, →
  `/reprove`. Só 14 dos 45 jogos emitem `GAME_OVER` — o resto nao tem condicao
  de derrota, e inventar uma seria mexer na jogabilidade deles. Por isso a
  tolerancia a erro vem de fora, contada pelos `WRONG_ANSWER`.
- O evento sai antes; a navegacao acontece ~150ms depois e e a rede de
  seguranca para quando o listener da plataforma falhou.
- `window.location.assign`, nunca `window.top`.
- **Uma navegacao por partida.** Eventos de fim posteriores sao ignorados.
- `returnBase` fora da allowlist nao navega para lugar nenhum — sem essa
  checagem a query vira um redirecionamento aberto.

## Seguranca do canal

`VITE_EMBED_ALLOWED_ORIGINS` (lista separada por virgula) vale para as duas
pontas:

- os eventos sao enviados uma vez **por origem permitida**, com `targetOrigin`
  explicito. Nunca `"*"` — com `"*"`, qualquer pagina que embutisse este site
  receberia o desempenho do aluno;
- os comandos recebidos sao conferidos contra `event.origin` **antes** de o
  payload ser olhado, e so entao passam pelos type guards.

**Lista vazia nao e "liberado": e "nada entra e nada sai".** Um deploy que
esqueceu a variavel falha visivel, em vez de falhar aberto.

Copie o `.env.example` para `.env.local` antes de rodar local.

## Como o jogo se encaixa na caixa do iframe

Os 45 jogos sao desenhados numa tela **fixa de 1280x720**: cada `layout.ts` tem
coordenadas absolutas (o botao em x=1134, a peca em y=495). O Phaser roda em
`Scale.FIT`, que mantem essa tela e a ESCALA para caber no container,
preservando a proporcao 16:9.

**Consequencia: caixa que nao e 16:9 ganha faixa preta.** Isso nao e bug, e o
preco de o jogo ter formato proprio — e o preco de nao ter e alto:

| Modo do Phaser | O que faz | Serve aqui? |
|---|---|---|
| `FIT` (atual) | Escala mantendo 16:9, sobra faixa | **Sim.** Coordenadas fixas continuam validas. |
| `RESIZE` | O canvas vira o tamanho do container e o jogo recebe o novo tamanho | **Nao.** Exigiria reposicionar tudo a cada resize nos 45 jogos, que hoje escrevem posicao em numero absoluto. |
| `ENVELOP` | Preenche a caixa mantendo a proporcao, CORTANDO o que sobra | **Nao.** Corta as bordas — e e nelas que moram o botao (y=670) e os nomes das pecas (y=592). |

**Entao a alavanca nao e o modo de escala, e o formato da caixa.** Numa caixa
16:9 a faixa e zero. Recomendacao para quem embute:

```css
/* do lado da Atesteme */
.iframe-do-jogo {
  width: 100%;
  aspect-ratio: 16 / 9;   /* faixa preta = zero */
  border: 0;
}
```

Se a caixa precisar ter outro formato, o jogo continua jogavel e inteiro — so
aparece faixa. O que **nao** acontece em nenhum caso e o jogo cortar ou
deformar.

Para ver isso acontecendo com numero na mao, abra
**`/embed-sandbox.html`**: ele mostra o mesmo jogo numa caixa que voce
redimensiona (com presets de 16:9, 4:3, celular em pe, ultrawide) e le, de
dentro do iframe, o tamanho real do canvas, a escala aplicada, a faixa preta em
pixels e o aproveitamento da area.

## Rodando o embed localmente

```bash
cp .env.example .env.local   # ja vem com http://localhost:5173
npm run dev
```

Duas paginas de teste, com propositos diferentes:

- **`/embed-harness.html`** — o CONTRATO. Embute o iframe, monta a query, manda
  `START_GAME` e loga tudo que chega. Se funciona ali e nao funciona na
  plataforma, a diferenca esta do outro lado. A tecla `Y` esconde o painel e
  deixa so o jogo; o botao "Abrir sozinho" abre a mesma URL numa aba limpa,
  sem harness e sem iframe.
- **`/embed-sandbox.html`** — o ENQUADRAMENTO. A mesma URL numa caixa que voce
  redimensiona, com a medida do canvas lida de dentro do iframe.

As duas passam `returnBase = window.location.origin`, porque e a unica origem
que elas tem e a unica que esta na allowlist local. Entao, no fim da partida, o
iframe navega para o `/approve` ou `/reprove` **deste site** — e por isso as
duas rotas existem no `App.tsx`, em `src/pages/EmbedReturnPage.tsx`. Elas se
anunciam como "retorno simulado": as de verdade sao da Atesteme, e e para la
que o iframe vai em producao.

Sem essas rotas o React Router nao casava nada, renderizava `null`, e vencer ou
perder terminava em **tela branca** — o jogo certo, o contrato certo, e o fim
da partida com cara de crash.

# Deploy na AWS

Site estatico proprio, em dominio proprio, consumido por iframe.

| Peca | Configuracao |
|---|---|
| S3 | Bucket **privado**. Sem website hosting, sem ACL publica. |
| CloudFront | Origin Access Control apontando para o bucket. |
| ACM | Certificado em **us-east-1** (exigencia do CloudFront). |
| SPA | Custom error responses **403 e 404 → `/index.html` com status 200**. Sem isso, recarregar `/jogos/<slug>` dentro do iframe da 404. |
| Cache | `assets/*` com `public, max-age=31536000, immutable`; `index.html` com `no-cache`. |
| Vite | `base: '/'` — o site fica na raiz do dominio de jogos. |

**Header obrigatorio na resposta:**

```
Content-Security-Policy: frame-ancestors https://edu.atesteme.com https://*.atesteme.com;
```

Ele **restringe** quem pode embutir; nao e o que permite o embed. Um servidor
que nao manda header nenhum ja aceita ser embutido — o header existe para que
so a Atesteme consiga. **Nao usar `X-Frame-Options: DENY/SAMEORIGIN`** — ele
nao aceita lista de origens e derruba a integracao. Configure via CloudFront
Response Headers Policy.

Na AWS ele e obrigatorio por outro motivo: a Response Headers Policy padrao do
CloudFront pode injetar `X-Frame-Options`, e ai o iframe fica em branco de
verdade.

HTTPS e obrigatorio dos dois lados: iframe `http` dentro de pagina `https` e
bloqueado como conteudo misto.

O pipeline esta em `.github/workflows/deploy.yml`: `npm ci` → `npm run lint` →
`npm run build` → `s3 sync` → invalidacao do `index.html`. Credenciais por
**OIDC**, nao por chave estatica. Os assets sobem antes do `index.html` de
propósito: assim todo HTML publicado ja encontra o que ele pede.

A Vercel pode seguir como preview; a AWS passa a ser o endereco oficial.

# Previa de link (Open Graph)

Colar `https://games.atesteme.com/iframe/<slug>` no WhatsApp mostra a capa do
jogo, o titulo e a descricao. Vale para os 45.

**A restricao que decide tudo: o robo do WhatsApp NAO executa JavaScript.** Ele
baixa o HTML, procura as `<meta>` e vai embora. Como isto e uma SPA que serve o
mesmo `index.html` para toda rota, qualquer solucao que escreva as tags depois
— React Helmet e parentes — chega tarde: o robo ja foi. O HTML precisa JA estar
certo quando o servidor responde.

Dai as duas pecas:

| Peca | O que faz | Quando roda |
| --- | --- | --- |
| `scripts/gerar-og.mjs` | capa (1672x941, ~2MB) → `public/og/<slug>.jpg` (1200x630, ~130KB) | **a mao**, e o resultado e commitado |
| `scripts/gerar-paginas-og.mjs` | escreve `dist/iframe/<slug>.html` com as `<meta>` daquele jogo | no `npm run build` |

## Por que a imagem e redimensionada

As capas tem cerca de 2 MB. O WhatsApp desiste da previa acima de uns 300 KB —
e "desiste" quer dizer que o link aparece **sem imagem nenhuma**, sem erro e sem
aviso. Os JPEGs gerados ficam entre 98 e 182 KB.

## Por que a geracao de imagem fica FORA do build

Redimensionar exige `sharp`, que traz binario nativo por plataforma — a mesma
familia de dependencia que quebrou o `npm ci` na integracao continua. Manter
isso longe do caminho do build e deliberado.

Quando uma capa mudar:

```bash
npm install --no-save sharp && npm run og:imagens
```

Commite `public/og/` junto. O build so copia.

## Por que gerar no build, e nao numa funcao serverless

Uma funcao no Vercel resolveria, mas o plano e publicar como site estatico em
S3 + CloudFront, onde funcao nao existe. Gerar no build funciona nos dois, nao
custa nada em tempo de resposta e nao tem o que quebrar em producao.

O roteamento continua igual: o `vercel.json` manda tudo para `/index.html`, mas
o sistema de arquivos e consultado ANTES do rewrite, entao `/iframe/<slug>`
encontra o arquivo gerado. Como o conteudo e o mesmo `index.html` (mesmos
scripts, mesmos caminhos de asset), o React sobe igual.

**Cada pagina e escrita em duas formas**, `iframe/<slug>.html` e
`iframe/<slug>/index.html`: um servidor procura uma, outro procura a outra, e a
forma errada cai no fallback de SPA — o link funciona, mas a previa sai com o
titulo e a imagem do site inteiro. Aconteceu no `vite preview` (com barra final
vinha a certa, sem barra vinha a generica), e so aparece olhando o HTML cru,
porque a tela fica identica nos dois casos.

## O endereco precisa ser absoluto

`og:image` com caminho relativo nao rende imagem nenhuma — o robo nao tem como
resolver. O padrao e `https://games.atesteme.com`; para outro dominio:

```bash
VITE_SITE_URL=https://outro.exemplo.com npm run build
```

## Como conferir sem publicar

Depois de publicar, os validadores oficiais mostram o que cada um enxerga (e o
do Facebook tem um botao de limpar cache, util quando a previa fica velha):

- <https://developers.facebook.com/tools/debug/>
- <https://cards-dev.twitter.com/validator>

O WhatsApp cacheia a previa por bastante tempo. Se mudar a imagem depois de
alguem ja ter colado o link, acrescente `?v=2` para forcar.

# Deploy na Vercel

A Vercel e o endereco de preview, e e de la que a plataforma vai puxar o jogo
enquanto a AWS nao estiver de pe. O `vercel.json` na raiz tem uma linha so, e
ela resolve o unico problema que impede o embed de abrir:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Por que isso e obrigatorio.** A plataforma nao navega pela home: ela poe
`https://<projeto>.vercel.app/jogos/<slug>?embed=1&…` direto no `src` do
iframe. Isso e um deep link frio, e `dist/jogos/<slug>/index.html` nao existe —
quem resolve `jogos/:slug` e o React Router, no cliente (`src/App.tsx`). Sem o
rewrite a Vercel devolve 404 e o iframe mostra a pagina de erro dela. E o mesmo
problema que a AWS resolve com "403 e 404 → `/index.html`", na tabela acima.

O rewrite nao engole os arquivos estaticos: na Vercel o sistema de arquivos e
consultado antes, entao `/embed-harness.html`, `/embed-sandbox.html`,
`/assets/*` e `/games/*` continuam sendo servidos como sempre.

**A segunda peca e uma variavel de ambiente, nao um arquivo.**
`VITE_EMBED_ALLOWED_ORIGINS` precisa conter a origem da plataforma nas
Environment Variables do projeto na Vercel. Isso nao e endurecimento opcional:
`validarEmbed` confere o `returnBase` contra essa lista antes de montar o jogo,
e lista vazia significa "nada entra e nada sai" por decisao explicita — sem a
variavel, a crianca ve "Endereco de retorno nao autorizado" no lugar do jogo.

E como o prefixo e `VITE_`, ela e lida **no build**: o valor vira texto dentro
do pacote. Mudar a lista exige um redeploy; trocar a variavel no painel e
recarregar nao muda nada.

Opcional, e so quando alguem pedir: o `frame-ancestors` da secao anterior vale
aqui tambem, como bloco `headers` no mesmo `vercel.json`. A Vercel nao manda
`X-Frame-Options` por conta propria, entao o embed funciona sem ele — o header
serve para impedir que qualquer outro site embuta os jogos.

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
| EF05CO07 | Sistema Operacional | R1 | Simulação de gerenciamento de recursos |
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
| `mapas-em-rede` | `BootScene.create()` chama `this.scene.launch('UIScene')`, mas o `index.ts` registra só `[BootScene, GameScene]` — a UIScene foi aposentada e o arquivo `scenes/UIScene.ts` ficou morto. O Phaser ignora a chamada, então não quebra; é lixo a remover. |

---

Fonte única de verdade do catálogo em código: [`src/data/catalog.ts`](src/data/catalog.ts).