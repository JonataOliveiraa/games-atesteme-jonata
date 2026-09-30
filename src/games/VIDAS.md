# A derrota dos jogos — a regra e a varredura de 30/09/2026

Este arquivo era a anotação de trabalho das "vidas por jogo". Aquela regra
acabou. O que vale agora está em "A derrota: um erro, fim de jogo" do
[INSTRUCOES.md](./INSTRUCOES.md); aqui fica o resumo e o que a varredura dos
jogos achou.

## A regra, em quatro linhas

- Todo jogo tolera **um** erro. Errou uma decisão, ou o tempo acabou:
  `WRONG_ANSWER` + `lose()`, e o `GAME_OVER` sai de dentro do `lose()`.
- O jogo não sabe que vidas existem. Vida, bloqueio de 24 horas e desbloqueio
  são da plataforma.
- `shared/level/vidasIniciais.ts` devolve sempre 1. `?lives=` e o `lives` do
  `START_GAME` são ignorados. Os corações continuam ocultos.
- O `GAME_OVER` sai na hora e o toque é cortado no mesmo instante
  (`shared/bridge/partida.ts`). A tela espera 1,35 s
  (`ESPERA_PARA_VER_O_ERRO_MS`): o jogo segue mostrando o erro, e só então o
  Phaser congela e a plataforma cobre o jogo (no embed, "Fim de jogo" e
  `/reprove`; no protótipo, o modal). O bridge descarta qualquer resultado
  emitido depois do `GAME_OVER`.

## A varredura

Revisão por leitura do código dos 95 jogos que têm código, procurando onde a
regra falha.

**Estado em 30/09/2026:** os itens 1 (erro de decisão), 2 (guia), 4 (tempo) e
5 (código depois do `lose()`) foram corrigidos. O item 3 não é defeito, por
decisão. O que ainda está aberto vem marcado em cada item.

O ponto central está certo em quase todos: o `WRONG_ANSWER` e o `lose()` andam
juntos. Não apareceu nenhum caso de `WRONG_ANSWER` sem `lose()`. O que falha
fica nas bordas, e está abaixo por ordem de gravidade.

Limite da revisão: foi leitura dirigida (os pontos de erro, de tempo e o que
roda depois do `lose()`), sem jogar. Os tempos citados são soma das durações
lidas no código, não medição.

### 1. Erro de decisão que não encerra a partida — corrigido

A criança errava e o jogo seguia. Agora o erro encerra a partida em 14 dos 17
jogos da tabela, e numa segunda leva (decisão do dono do projeto, 30/09/2026)
em mais três:

- `robo-sorrateiro`: a sala 1-1 deixou de ser treino; a carta errada encerra
  em todas as salas;
- `desktop-digital-infantil`: concluir a ação num aplicativo que não é o da
  tarefa encerra na primeira vez (abrir para olhar continua de graça);
- `escolha-a-ferramenta-certa`: a justificativa errada com a ferramenta certa
  encerra a partida, em vez de só perder o bônus.

Ficou como estava:

- `kit-do-solucionador`: caminho ruim com a ferramenta certa continua
  grátis, à espera de decisão.

No `atelier-codigos-digitais` a saída foi cobrar a célula pintada com a tinta
errada, como no `pixel-secreto`.

A tabela abaixo descreve o que havia antes.

| Jogo | O que acontece | Onde |
|---|---|---|
| `museu-das-estruturas` | cada erro só soma num contador; a cobrança sai no fim da tarefa, junto com o "Conseguiu!". Quem erra e não conclui nunca é cobrado. No nível 2, escolher a sala errada não conta nada | `GameScene.ts:1203-1219`, `:395-404` |
| `circuito-da-verdade` | resposta errada mostra dica e libera de novo; a 3ª dica entrega a resposta. A cobrança só sai no fim da fase | `GameScene.ts:1098-1126`, `:1134-1153` |
| `a-busca-do-bibliotecario` | o 1º erro de cada passo é de graça; só o 2º no mesmo passo cobra | `GameScene.ts:326-338` |
| `desktop-digital-infantil` | só o 3º desvio cobra; conta errada na calculadora e arquivo na gaveta errada não cobram | `GameScene.ts:504`, `apps/apps.ts:332-337`, `:480-486` |
| `revezamento-em-lista` | a única prova do nível 1 é "guiada", e prova guiada não cobra: o nível 1 inteiro tem erro grátis | `GameScene.ts:492`, `data/levels.ts:229-233` |
| `atelier-codigos-digitais` | pintar a célula errada nunca é erro; os níveis 1 e 2 não têm como perder | `GameScene.ts:341-374` |
| `curadoria-com-creditos` | selo que não é verde oferece "Refazer etiqueta" sem custo; só "Continuar assim" cobra | `GameScene.ts:779-782`, `:203-218` |
| `trilha-do-amanha` | frase errada em "O que mudou?" só baixa os pontos | `GameScene.ts:609-614` |
| `tradutor-da-maquina` | no nível 3, tocar na fileira que chegou certa só avisa | `GameScene.ts:292-297` |
| `escolha-a-ferramenta-certa` | na peneira do nível 3, marcar a tecnologia errada só treme; justificativa errada só perde bônus | `GameScene.ts:520-526`, `:1056` |
| `missao-em-pedacos` | começar pela metade errada (nível 3) e passo fora de ordem na fase final não cobram | `GameScene.ts:363-375`, `:822-827` |
| `kit-do-solucionador` | rota ruim com a ferramenta certa volta sem custo; ferramenta que vai fazer falta só avisa | `GameScene.ts:732-752`, `:533-541` |
| `corra-enquanto` | segurar o pedal depois que a condição ficou falsa é grátis: quem segura do início ao fim nunca perde | `GameScene.ts:320-329`, `:372-376` |
| `sistema-operacional` | tocar na peça certa sem energia (a resposta era NÃO DÁ) é grátis, e o NÃO DÁ pulsa | `GameScene.ts:476-481` |
| `robo-sorrateiro` | na sala guiada 1-1 a carta errada não cobra (e a certa pontua) | `GameScene.ts:644` |
| `bolhas-da-seguranca` | perigo que chega à borda fica preso, sem custo, e o toque atrasado ainda rende ponto | `GameScene.ts:315` |
| `esconde-dados` | ser pega pela lanterna no meio da corrida só devolve ao esconderijo | `GameScene.ts:662-684` |

Vários destes são escolha de desenho anotada no `PLANEJAMENTO.md` do jogo
("caminho ruim não é julgamento ruim", "demorar não é erro"). Com a regra nova,
cada um pede decisão: cobrar, ou declarar que aquilo não é erro.

Recusas sem custo que parecem corretas como estão: `caverna-dos-dados` (JUNTAR
incompleto), `detetives-da-busca` (busca que zera o mural), `formato-certo`
(arrasto para caixa de outro formato), `missao-arquivo-seguro` (nuvem sem
internet, arquivo que não cabe), `maestro-do-sistema` (peça ocupada).

### 2. O guia que pode encerrar a partida — corrigido

O primeiro toque ensinado era de verdade: se a criança tocava errado durante o
guia, caía no `lose()`. Agora o toque errado durante o guia é recusado sem
custo (em `garra-dos-grupos` a garra devolve o item à bandeja), e o guia
continua esperando. No `museu-das-estruturas` o estouro do relógio agora
espera o tutorial de sala fechar.

| Jogo | O que acontece | Onde |
|---|---|---|
| `garra-dos-grupos` | o agarre do treino guiado, com item errado, perde | `GameScene.ts:220-239`, `guide.ts:92` |
| `subida-do-dia` | no 1º degrau o guia aponta a carta certa mas as duas ficam tocáveis | `GameScene.ts:187-207`, `guide.ts:43-50` |
| `balao-do-recado` | a 1ª escolha de forma é guiada, e a forma errada perde | `GameScene.ts:509-520`, `guide.ts:137-146` |
| `canteiro-de-obras` | no guia da 1.1, a peça "menos uma" tocada perde | `GameScene.ts:332-368`, `:474` |
| `portoes-logicos` | toque durante a demonstração cancela a demo e vale como resposta | `GameScene.ts:333-350` |
| `museu-das-estruturas` | o relógio do nível 3 corre com o tutorial de sala aberto | `GameScene.ts:1610-1628` |

### 3. Erro na mecânica do jogo que encerra a partida — é de propósito

Com um erro só, estes reprovam por mira, tempo ou gesto. **Decisão do dono do
projeto (30/09/2026): quando o jogo é construído em cima daquela mecânica,
errar nela é perder, e é proposital** — a bolinha que acerta a plaquinha errada
no `ache-o-suspeito` conta. A lista fica como registro, não como pendência.
Os casos de baixo que não são a mecânica do jogo (botão em cima de outro,
toque duplo) ainda podem valer um ajuste, caso a caso.

**Resposta vazia — corrigido (30/09/2026).** Confirmar sem ter montado nada
deixou de valer como resposta errada: em `mapas-em-rede` o Confirmar fica
apagado sem ligação ou sem rota; em `tradutor-da-maquina` o ENVIAR fica
desligado com todas as lâmpadas apagadas (nenhuma letra da tabela vale zero);
em `expedicao-pixel` o LANÇAR com as três torneiras fechadas só faz as
torneiras pulsarem.

| Jogo | O que acontece | Onde |
|---|---|---|
| `missao-em-pedacos` | encostar no lixo durante a corrida de plataforma perde; o próprio plano chama o trecho de "de dedo" | `GameScene.ts:585-608` |
| `corrida-do-cotidiano` | portão sem toque é julgado pela faixa em que o corredor está | `GameScene.ts:232-234`, `:288-293` |
| `corrida-dos-parecidos` | item que chega ao carro é julgado pela faixa atual | `GameScene.ts:414-421` |
| `torres-dos-formatos` | todo arquivo nasce na pista errada; não chegar a tempo é pouso errado | `GameScene.ts:226-296` |
| `ache-o-suspeito` | com as placas andando, a bolinha acerta a vizinha da que foi mirada | `GameScene.ts:215-228`, `ball.ts:136-143` |
| `garra-dos-grupos`, `pescaria-dos-codigos` | o alvo é o que está mais perto no instante do toque, com tudo em movimento | `garra: GameScene.ts:252-292` |
| `pista-binaria` | toque duplo vira resposta para a caixa seguinte | `GameScene.ts:245-258` |
| `mapas-em-rede` | Confirmar com a rota vazia conta como resposta errada | `GameScene.ts:1063-1065`, `:1040-1056` |
| `tradutor-da-maquina` | ENVIAR com nenhuma chave acesa conta como resposta errada | `GameScene.ts:193-197` |
| `expedicao-pixel` | LANÇAR com a mistura em zero conta como resposta errada | `GameScene.ts:236-240` |
| `ilha-dos-codigos` | no nível 3 o alto-falante fica em cima do cartão: errar o botão de ouvir é responder | `options.ts:146-163` |
| `museu-vivo-do-computador`, `base-dos-classificadores`, `monte-seu-computador`, `missao-arquivo-seguro` | arrasto solto sobre o destino errado é julgado na hora, sem confirmar | `museu-vivo: GameScene.ts:517` · `base: :488-494` · `monte: :1228-1262` · `missao-arquivo: :659-672` |
| `arquiteto-das-missoes`, `guilda-dos-criadores`, `pixel-secreto` | um toque já é a resposta, sem confirmar, com alvos vizinhos | `arquiteto: GameScene.ts:362-388` · `guilda: :486-491` · `pixel: :956` |
| `corra-enquanto` | reapertar o pedal com a condição falsa perde, inclusive no quique do dedo | `GameScene.ts:386-410` |

### 4. O tempo — corrigido

Decisão do dono do projeto (30/09/2026): **tempo zerou, game over, em todos os
jogos.** O que mudou:

- as barras de bônus de `desfile-do-robo-repetidor` e
  `checklist-do-jogador-seguro` viraram prazo de verdade;
- em `cabo-de-guerra-da-verdade` o robô puxa a corda e a partida acaba;
- os 8 jogos que emitiam `GAME_OVER` à mão agora emitem `WRONG_ANSWER` e
  chamam o `lose()`, como qualquer erro; `mapas-em-rede` e `arena-da-logica`
  perderam o `GAME_OVER` repetido;
- nos 7 jogos em que o estouro se perdia com a tela travada (e no
  `museu-das-estruturas`), o estouro fica pendente e é cobrado assim que o
  tutorial ou o painel fecha;
- `serie-do-campeao`: o estouro durante uma animação é cobrado quando ela
  termina, se a etapa não tiver sido concluída;
- `museu-vivo-do-computador`: o relógio para quando a missão é resolvida;
- `museu-das-estruturas`: o relógio do nível 3 volta no segundo passo da
  fase (recomeça cheio a cada passo) e para quando a tarefa termina;
- `curadoria-com-creditos`: no mural, o tempo publicava a galeria como estava
  e podia até aprovar; agora encerra a partida.

O que ficou como estava, de propósito: em `guardioes-dos-dados`,
`montador-de-informacoes` e `fabrica-de-maquinas` o relógio só começa na
primeira ação da criança.

O que havia antes, para registro.

**Tempo que não encerrava:**

| Jogo | O que acontece | Onde |
|---|---|---|
| `desfile-do-robo-repetidor`, `checklist-do-jogador-seguro` | a barra é de bônus: no zero só some o bônus, mas parece prazo | `desfile: GameScene.ts:174-183` · `checklist: :582-586` |
| `cabo-de-guerra-da-verdade` | a barra do robô zera, ele puxa a corda e a rodada recomeça, sem custo e sem limite | `GameScene.ts:281-295` |
| `serie-do-campeao` | se o tempo zera durante uma animação, o relógio só reinicia | `GameScene.ts:342-352` |
| `museu-das-estruturas` | no nível 3 o relógio não volta no 2º passo da fase | `GameScene.ts:1430`, `:182` |
| `mapas-em-rede`, `arena-da-logica`, `escolha-a-ferramenta-certa`, `radar-de-confiabilidade`, `circuito-da-verdade`, `missao-arquivo-seguro`, `curadoria-com-creditos` | se o tempo zera com o tutorial ou um painel aberto, o estouro se perde e a fase segue sem relógio | o `if (this.locked) return` do `onTimeUp` de cada um |
| `museu-vivo-do-computador` | o relógio segue correndo ~2 s depois da missão resolvida e pode reprovar sem erro | `GameScene.ts:576-580`, `:744-755` |

**Tempo que encerra, mas com `GAME_OVER` à mão e sem `WRONG_ANSWER`:**
`guardioes-dos-dados` (`:1385-1396`), `vila-das-maquinas` (`:156-171`),
`corra-enquanto` (`:540-550`), `baralho-das-listas` (`:781-783`),
`sistema-operacional` (`:778-786`), `montador-de-informacoes` (`:1050-1062`),
`fabrica-de-maquinas` (`:1408-1425`), `trilha-do-passo-a-passo` (`:597-601`).
A partida encerra; só foge do contrato. Em `guardioes`, `montador` e `fabrica`
o relógio só começa na primeira ação da criança.

`mapas-em-rede` (`:1238`), `arena-da-logica` (`:1113`) e
`trilha-do-passo-a-passo` (`:672`) emitem `GAME_OVER` à mão **além** do
`lose()`; o bridge descarta o segundo.

### 5. O que roda depois do `lose()` — corrigido

O achado mais comum, em mais da metade dos jogos: o código seguia como se
houvesse segunda tentativa — reabria a pergunta, devolvia a peça, mostrava
"Tente de novo". Não mudava o resultado, porque a plataforma cobre a tela no
`GAME_OVER`; era fluxo de uma partida encerrada rodando por baixo.

Corrigido em 59 jogos com a mesma linha, `if (this.lives.remaining <= 0)
return`, posta depois do feedback imediato do erro e antes do que reabria o
jogo. Ficou de fora, de propósito:

- o painel de **tempo esgotado** de `sistema-operacional`,
  `baralho-das-listas` e `trilha-do-passo-a-passo` ficou para o item 4, e foi
  resolvido lá;
- `batalha-das-coordenadas`, `oficina-dos-algoritmos` e `mesa-de-edicao`:
  depois do `lose()` só resta o aviso do erro, nada reabre;
- os dois casos de `lose()` fora de hora, logo abaixo.

**O que sobra deste item é o inverso:** como a tela é coberta no `GAME_OVER`,
todo feedback que vem depois do `lose()` não é visto. Na maioria dos jogos
antigos a explicação do erro (a frase do porquê, o item culpado piscando) vem
depois. Para a criança ver por que perdeu, a cena tem de tocar antes do
`lose()`, como nos jogos da 3ª rodada — e isso é reordenar jogo a jogo, não
uma linha.

Os jogos em que isso foi achado:

- **Painel ou botão de nova tentativa na tela:** `trilha-do-passo-a-passo`,
  `sistema-operacional`, `estudio-multiformato`, `baralho-das-listas`,
  `mapas-em-rede`, `arena-da-logica`, `caca-fonte-confiavel`,
  `missao-etica-digital`, `missao-arquivo-seguro`, `checklist-do-jogador-seguro`,
  `cidade-das-tecnologias`, `escolha-a-ferramenta-certa`, `radar-de-confiabilidade`,
  `circuito-da-verdade`, `museu-das-estruturas`, `curadoria-com-creditos`,
  `futuro-em-cena`, `guilda-dos-criadores`.
- **Pergunta ou bancada reaberta:** `corrida-do-cotidiano`, `ache-o-suspeito`,
  `pista-binaria`, `vila-das-maquinas`, `canhao-das-coordenadas`,
  `torres-dos-formatos`, `detetive-dos-modelos`, `missao-em-pedacos`,
  `atelier-codigos-digitais`, `pulo-programado`, `ilha-dos-codigos`,
  `desfile-do-robo-repetidor`, `corra-enquanto`, `danca-aninhada`,
  `caverna-dos-dados`, `duelo-das-fontes`, `chef-dos-subproblemas`,
  `central-de-entrada-e-saida`, `a-busca-do-bibliotecario`, `arquivo-dos-registros`,
  `expedicao-pixel`, `meu-bichinho-conectado`, `esconde-dados`,
  `batalha-das-coordenadas`, `revezamento-em-lista`, `arquiteto-das-missoes`,
  `formato-certo`, `tradutor-da-maquina`, `corrida-dos-parecidos`,
  `ritmo-da-rotina`, `passe-da-mensagem`, `serie-do-campeao`,
  `academia-dos-algoritmos`, `canteiro-de-obras`, `estudio-producao-digital`,
  `o-misterio-do-arquivo-vivo`, `maratona-do-algoritmo`, `base-dos-classificadores`,
  `fase-de-entrada-e-saida`, `predio-dos-lacos`, `raio-x-da-maquina`,
  `oficina-dos-algoritmos`, `o-cofre-dos-registros`, `mesa-de-edicao`.
- **`lose()` cedo demais ou tarde demais:** em `olha-o-jornal` e
  `dia-sem-internet` o `lose()` sai antes da explicação, e o congelamento pode
  cortá-la; em `a-busca-do-bibliotecario` ele só sai ~2 s depois do toque, com a
  tela já restaurada.
- **Teclado:** o corte de toque não alcança o teclado. Em
  `corrida-do-cotidiano`, `pista-binaria` e `torres-dos-formatos` ainda dá para
  agir pelas setas até o jogo congelar (1,35 s).

Textos que descrevem a regra antiga e ficaram na tela ou no tutorial:
`mapas-em-rede` ("dá para tentar quantas vezes quiser"),
`desfile-do-robo-repetidor` ("é só corrigir"), `tribunal-do-verdadeiro-ou-falso`
("3 julgamentos errados seguidos"), `sistema-operacional` ("As três luzes
apagaram"), `labirinto-do-enquanto` ("Três tentativas seguidas").

### 6. Sem achado

`correio-multimidia`, `hangar-dos-modelos`, `labirinto-do-enquanto`,
`guardiao-etico`, `fuga-do-laboratorio`, `metro-mirim`,
`tribunal-do-verdadeiro-ou-falso`, `detetives-da-busca`,
`investigacao-dados-risco`, `achados-e-perdidos`, `maestro-do-sistema`,
`cidade-das-decisoes`, `decolagem-passo-a-passo`, `show-de-formatos`.

`cidade-das-decisoes` tem um ponto para decidir: a "condição constante" cobra
o erro depois de o programa funcionar na tela (`GameScene.ts:1516-1529`).

### Fora da varredura

`maquina-dos-ajudantes` e `labirinto-do-cofrinho` só têm planejamento, sem
código.

## A limpeza (30/09/2026)

Depois dos consertos, o código da regra antiga foi removido:

- o que rodava depois da derrota em 53 jogos: reabrir a pergunta, devolver a
  peça, a dica depois de dois erros, a frase de "tente de novo";
- as telas de derrota próprias de `trilha-do-passo-a-passo`,
  `sistema-operacional`, `estudio-multiformato`, `museu-vivo-do-computador`,
  `baralho-das-listas`, `labirinto-do-enquanto`, `cidade-das-decisoes`,
  `monte-seu-computador`, `missao-arquivo-seguro`,
  `tribunal-do-verdadeiro-ou-falso` e `curadoria-com-creditos`;
- no `pixel-secreto`, as telas de "vida extra" e de bloqueio da plataforma;
- os textos que a criança ainda lia e que prometiam segunda tentativa, nos
  tutoriais de `desfile-do-robo-repetidor`, `curadoria-com-creditos` e
  `tribunal-do-verdadeiro-ou-falso`, e em 13 linhas de
  `src/data/gameInstructions.ts`.

**Junto saiu a explicação do erro que vinha depois da derrota** (a frase do
porquê, o item culpado piscando). Ela já não era vista, porque a plataforma
cobre a tela no `GAME_OVER`. Os textos continuam nos arquivos de `data/` de
cada jogo e o código antigo está no histórico do git; para a criança ver por
que perdeu, a cena tem de ser reescrita na ordem "mostra, depois perde".

O que ficou, de propósito:

- os painéis genéricos de fim de fase (`showFeedback(correct, …)`) ainda têm o
  ramo do erro, que não é mais chamado;
- contadores como `stalled`, `tries` e `missesHere`, e os métodos de dica
  dentro dos componentes (`palette.hint`, `lanes.hint` e parecidos);
- `canteiro-de-obras`: a segunda tentativa continua viva no guia da 1.1, onde
  o erro não cobra;
- os sinais `pixel-secret-*` em `shared/bridge/uiTunnel.ts` e na
  `GameDetailsPage`, que ninguém mais dispara;
- o ajuste de posição dos corações (tecla M) e o `lives-positions.json`.

## O 1,35 segundo para ver o erro (30/09/2026)

Tudo acima foi escrito quando a plataforma cobria a tela no instante do
`GAME_OVER` (150 ms no embed). Isso mudou: a tela agora espera
`ESPERA_PARA_VER_O_ERRO_MS` (1,35 s, em `shared/bridge/partida.ts`) antes de
congelar e ser coberta. O resultado continua saindo na hora — o evento e o
bloqueio não esperam.

Consequência para a limpeza: a explicação curta do erro que vinha depois do
`lose()` **voltaria a ser vista**, e ela foi removida junto com a segunda
tentativa. O que vale trazer de volta é o que cabe em 1,35 s — acender a opção
certa, a frase curta do porquê —, e não as dicas "depois de dois erros" nem os
painéis com botão. Candidatos, pelo que a limpeza tirou:

- **acender a resposta certa:** `canhao-das-coordenadas`, `ache-o-suspeito`,
  `pista-binaria`, `o-cofre-dos-registros`, `fase-de-entrada-e-saida`,
  `a-busca-do-bibliotecario`, `raio-x-da-maquina`, `corrida-dos-parecidos`,
  `ritmo-da-rotina`;
- **frase curta do porquê:** `pulo-programado`, `maratona-do-algoritmo`,
  `expedicao-pixel`, `estudio-producao-digital`, `atelier-codigos-digitais`,
  `torres-dos-formatos`, `duelo-das-fontes`.

Nada disso foi restaurado ainda.
