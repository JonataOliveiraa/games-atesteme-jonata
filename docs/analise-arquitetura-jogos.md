# Análise da arquitetura dos jogos

_Levantamento estático realizado em 03/08/2026._

## Escopo e critério de recência

O projeto tem 37 diretórios em `src/games`. Para esta análise, “últimos cinco jogos” significa os cinco diretórios com alteração mais recente no workspace:

1. `EF05CO07` — 03/08/2026
2. `EF05CO06` — 29/07/2026
3. `EF03CO08` — 29/07/2026
4. `EF05CO05` — 29/07/2026
5. `EF05CO04` — 28/07/2026

`EF05CO07` ainda é um rascunho não versionado: somente `types.ts` tem conteúdo. As cenas, os níveis e o `data/layout.ts` ainda não existem. Portanto, as funcionalidades descritas para ele são uma intenção inferida das tipagens, não comportamento jogável.

## Arquitetura atual

```text
React (GameDetailsPage)
  -> GameFrame / PhaserCanvas
    -> configuração do jogo (index.ts)
      -> BootScene: carrega assets e gera texturas auxiliares
      -> GameScene: regras, estado, feedback e progressão
      -> UIScene: barra de missão, progresso, cronômetro e ajuda

GameScene <-> EventBus <-> UIScene
GameScene -> runtimeGameBridge -> plataforma React ou iframe
```

Cada jogo maduro segue, em geral, esta divisão:

| Área | Responsabilidade |
| --- | --- |
| `index.ts` | Configuração Phaser: canvas 1280×720, escala `FIT`, cenas e renderização. |
| `data/levels.ts` | Conteúdo pedagógico e sequência de desafios; deve conter dados, não desenho da tela. |
| `types.ts` | União de modos/IDs e contratos de cada desafio. |
| `data/theme.ts` e `data/layout.ts` | Tokens visuais e geometria reutilizada pelo jogo. |
| `BootScene.ts` | Pré-carregamento, tela de loading, animações e texturas geradas. |
| `GameScene.ts` | Estado da partida, interação, validação, pontuação, tutorial e conclusão. |
| `UIScene.ts` | HUD reativa, desacoplada da lógica por `EventBus`. |

## Componentes compartilhados

| Componente | Papel | Uso observado nos jogos recentes |
| --- | --- | --- |
| `shared/level/showLevelComplete.ts` | Modal de conclusão, avanço automático, botões e marcadores de progresso. | EF05CO04, EF05CO05 e EF05CO06. |
| `shared/tutorial/createTutorial.ts` | Tutorial em etapas com destaque, balão, ponteiro e persistência de visualização. | EF05CO04, EF05CO05 e EF05CO06. |
| `shared/loading/createLoadingScreen.ts` | Tela de carregamento tematizável, com barra de progresso e fundos gráficos. | EF05CO04, EF05CO05 e EF05CO06. |
| `shared/EventBus.ts` | Comunicação interna Phaser, sobretudo entre `GameScene` e `UIScene`. | EF05CO04–06; EF03CO08 o usa apenas para sair do jogo e deixa a `UIScene` vazia. |
| `shared/bridge/runtimeGameBridge.ts` | Emite eventos para React ou iframe e recebe comandos da plataforma. | EF03CO08 e EF05CO04–06. |
| `shared/contracts/*` | Tipos dos eventos e comandos trocados com a plataforma. | Base comum; há usos que ainda não respeitam integralmente o contrato. |

### `showLevelComplete`: contrato e comportamento

`showLevelComplete(scene, options)` cria uma camada de bloqueio e um modal Phaser. Ele aceita título, subtítulo, mensagem, cores, progresso, botões e avanço automático; devolve `{ destroy() }` para remover os objetos desenhados.

Pontos positivos:

- Centraliza a apresentação de sucesso, conclusão final e "quase lá".
- Calcula a altura do painel a partir do conteúdo, inclui quebra de linha e anima a entrada.
- O `overlay` interativo evita clique acidental no jogo por trás do modal.
- Dá liberdade visual por tema sem duplicar a estrutura do modal.

Limitações a endereçar antes de ampliar seu uso:

1. `destroy()` não cancela o `delayedCall` de `autoAdvance`; o modal pode ser removido manualmente e ainda disparar a ação posterior.
2. Botões não ficam bloqueados após o primeiro clique, permitindo duas transições se houver toques repetidos.
3. A largura dos botões é estimada pelo número de caracteres. Rótulos longos ou três botões podem ultrapassar o painel de 556 px.
4. As constantes internas `W = 1280` e `H = 720` funcionam para o padrão atual, mas impedem reutilização em jogos com resolução lógica diferente.
5. O componente não oferece ícone/ilustração, atalho de teclado ou contrato explícito para fechar uma ação pendente; hoje esses recursos precisam ser implementados fora dele.

Recomendação: manter o componente como padrão, mas guardar o `TimerEvent`, tornar `destroy()` idempotente e cancelável, desativar todos os botões no primeiro clique e limitar/quebrar a linha de botões.

## Práticas encontradas

### Boas práticas consolidadas

- **Progressão orientada a dados.** EF05CO04–06 descrevem níveis e desafios em `data/levels.ts`, tipados por uniões discriminadas. Isso separa conteúdo pedagógico do código de interação.
- **Cenas com responsabilidade clara.** A combinação Boot/Game/UI reduz o acoplamento entre carregamento, regras e HUD.
- **Integração com a plataforma.** Os jogos mais recentes emitem `GAME_READY`, respostas certas/erradas, `CHECKPOINT`, `GAME_OVER` e `GAME_COMPLETED`; também liberam o listener de comandos no `shutdown`.
- **Feedback pedagógico.** Níveis alternam demonstração, prática guiada, contextualização e desafio final. Explicações e dicas fazem parte dos dados de cada fase.
- **Reuso visual recente.** EF05CO04–06 já usam as fábricas compartilhadas de loading, tutorial e conclusão.
- **Assets nomeados por domínio.** Imagens e texturas ficam separadas por código de jogo, o que facilita carregamento e manutenção.

### Oportunidades de padronização

- EF03CO08 mantém loading e modais de conclusão próprios; é o melhor candidato para migrar aos componentes compartilhados.
- EF05CO04 e EF05CO05 já chamam `createLoadingScreen`, porém ainda guardam métodos privados antigos de loading que não são chamados. Eles devem ser removidos após uma revisão visual.
- As três `UIScene` recentes repetem desenho de barra, pontos e botão de ajuda. Um `createMissionHud` parametrizável reduziria divergência, preservando apenas o tema e os textos de cada jogo.
- O contrato `PlatformEvent` precisa ser a fonte única de verdade. `FINISH_GAME` é emitido por EF05CO06, mas não pertence ao tipo aceito; `GAME_READY` também recebe `stage` em EF05CO06, embora o contrato atual não o permita.
- A checagem estática ainda não passa no repositório. Entre erros alheios a estes cinco, há problemas específicos em EF05CO04–07 listados na seção de riscos.

## Os cinco jogos mais recentes

| Código | Jogo | O que a criança faz | Progressão | Componentes compartilhados |
| --- | --- | --- | --- | --- |
| EF05CO07 | Ainda sem nome e sem implementação | O modelo de tipos indica um futuro jogo de gerenciamento de recursos do sistema: atender pedidos de programas, alocar memória, resolver conflito de uso e identificar o sistema adequado. | Foram previstos 3 níveis e fases `atender`, `memoria`, `conflito` e `sistemas`, com estabilidade e pontuação. Ainda não há níveis nem cenas. | Nenhum aplicado. |
| EF05CO06 | **Missão Arquivo Seguro** | Arrasta arquivos para disco, pendrive ou nuvem e justifica a escolha. Aprende armazenamento local/remoto, contexto, capacidade e backup. | N1 classifica destinos; N2 decide com base na situação; N3 cria cópias e recupera arquivos após acidentes. | Loading, tutorial, modal de conclusão, EventBus e ponte de plataforma. |
| EF03CO08 | **Estúdio Multiformato** | Escolhe o formato digital adequado, desenha ou compõe texto e publica produções em um mural. | N1 associa tarefa e formato; N2 cria e publica desenho/texto; N3 escolhe formato e conclui dois ciclos criativos. | EventBus para saída e ponte de plataforma; loading e modais ainda são locais. |
| EF05CO05 | **Monte seu Computador** | Monta um computador, associa peças às funções e testa entrada/saída, memória, armazenamento e boot. | N1 monta com silhuetas; N2 monta e responde questões; N3 faz classificação, múltipla escolha e montagem livre com prova final. | Loading, tutorial, modal de conclusão, EventBus e ponte de plataforma. |
| EF05CO04 | **Cidade das Decisões** | Simula programas numa cidade e trabalha os ramos `SE`/`SENÃO`, condições, sequências e repetição. | N1 prevê o ramo executado; N2 escolhe a condição correta; N3 monta o programa para vários cenários. | Loading, tutorial, modal de conclusão, EventBus e ponte de plataforma. |

## Adoção dos componentes nos jogos recentes

| Jogo | Loading compartilhado | Tutorial compartilhado | Modal compartilhado | HUD em `UIScene` | Ponte de plataforma |
| --- | --- | --- | --- | --- | --- |
| EF05CO07 | — | — | — | — | — |
| EF05CO06 | Sim | Sim | Sim | Sim | Sim |
| EF03CO08 | Não, local | Não | Não, local | Não, cena vazia | Sim, somente eventos |
| EF05CO05 | Sim, com método legado restante | Sim | Sim | Sim | Sim |
| EF05CO04 | Sim, com método legado restante | Sim | Sim | Sim | Sim |

## Riscos e prioridades

1. **P0 — concluir ou isolar EF05CO07.** O `index.ts` importa `data/layout` inexistente e cenas sem export. A checagem TypeScript falha por isso. Enquanto estiver em construção, ele não deve receber metadados/loader de jogo jogável; quando for ativado, precisa de layout, `LEVELS`, `BootScene`, `GameScene`, `UIScene`, assets e integração com a plataforma.
2. **P1 — corrigir o contrato da plataforma no EF05CO06.** Substituir/normalizar `FINISH_GAME`, remover ou tipar `stage` em `GAME_READY` e corrigir o acesso a `Rect.radius`. Isso evita eventos que parecem válidos em execução, mas não são válidos para o TypeScript.
3. **P1 — estabilizar o modal compartilhado.** Implementar cancelamento de `autoAdvance` e proteção contra clique duplo antes de migrar EF03CO08.
4. **P2 — migrar EF03CO08.** Reutilizar `createLoadingScreen`, `createTutorial` e `showLevelComplete`, preservando somente os elementos realmente específicos, como confete e o mural. A `UIScene` pode passar a exibir a missão ou ser removida se não for necessária.
5. **P2 — remover código legado e corrigir avisos locais.** EF05CO04 tem comparações de estados inconsistentes em `data/conditions.ts`; EF05CO04–06 também têm imports, variáveis ou métodos não usados.
6. **P2 — validar cada jogo em três camadas.** Para cada novo código: (a) `npx tsc -p tsconfig.app.json --noEmit`, (b) `npm run lint` e (c) teste manual de início, tutorial, acerto, erro, timeout, avanço, reinício e saída.

## Estado da validação

Em 03/08/2026, `npx tsc -p tsconfig.app.json --noEmit` falha para o repositório inteiro. Há erros históricos em diversos jogos fora deste recorte. No conjunto analisado, os principais são:

- **EF05CO07:** import de layout inexistente e três cenas vazias, sem exports.
- **EF05CO06:** evento `FINISH_GAME` fora do contrato, `stage` inválido em `GAME_READY`, propriedade `radius` inexistente e itens não usados.
- **EF05CO05:** método de loading legado e variáveis locais não usados.
- **EF05CO04:** comparações de estado impossíveis em `data/conditions.ts`, método de loading legado e variável não usada.
- **EF03CO08:** alguns campos/métodos não usados; não há erro de contrato de plataforma neste recorte.

Esta documentação descreve o estado atual do código e não altera a implementação dos jogos.
