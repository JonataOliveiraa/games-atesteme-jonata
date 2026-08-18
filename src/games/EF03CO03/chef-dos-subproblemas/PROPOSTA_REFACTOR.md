# Proposta de Replanejamento - Chef dos Subproblemas

Jogo: `Chef dos Subproblemas`
Habilidade: `EF03CO03`
Ano: `3º ano`
Eixo: Pensamento Computacional
Tema: Decomposição

## Correção de direção

A proposta anterior ficou complexa demais para a tela do jogo. Ela colocava bancada de cartões, estações e plano final competindo no mesmo espaço. Para criança do 3º ano isso vira três mini-interfaces com texto pequeno.

A nova direção é mais simples:

```text
uma tela, uma ação mental, ícones grandes
```

O jogo deve representar decomposição por ícones. A criança vê um pedido grande, divide esse pedido em partes menores e arrasta ícones para essas partes. O foco é visual, com pouco texto.

## Ideia central

O jogador ajuda o chef a quebrar pedidos grandes em partes menores.

Exemplo:

```text
Pedido grande: Café da manhã
Partes menores: Bebida, Sanduíche, Mesa
Ações: ferver água, pegar pão, colocar prato, passar manteiga
```

A criança não precisa ler blocos longos. Ela reconhece o problema por um ícone grande e organiza ícones menores em pratos, bandejas ou potes.

## Personagem guia

Haverá uma cozinheira como personagem de apoio. Ela não deve ocupar o centro da jogabilidade; a função dela é orientar no começo e reagir durante o jogo.

Uso por nível:

- `N1 - fase 1`: a cozinheira instrui passo a passo como dividir o pedido em pratos.
- `N2 - fase 1`: a cozinheira ensina a segunda camada: depois de dividir, organizar uma subreceita por vez.
- Demais fases: ela apenas assiste, comenta acertos, dá dicas curtas em erros e reage visualmente.

A cozinheira tem 8 imagens separadas:

```text
c1.png
c2.png
c3.png
c4.png
c5.png
c6.png
c7.png
c8.png
```

Mapeamento dos frames:

```text
c1 - neutro
c2 - neutro 2
c3 - dúvida / pensando
c4 - ok
c5 - feliz
c6 - provando comida
c7 - assustada / erro
c8 - perfeito / conclusão
```

Uso sugerido:

- `c1`: assistindo durante a fase;
- `c2`: idle alternativo para dar vida;
- `c3`: dica ou tutorial antes de uma ação nova;
- `c4`: pequeno acerto, encaixe correto ou confirmação;
- `c5`: fase resolvida;
- `c6`: simulação/teste do plano ou feedback divertido de comida;
- `c7`: erro, carta no lugar errado ou plano incompleto;
- `c8`: final de nível, missão perfeita ou conclusão do jogo.

Durante falas, alternar suavemente entre `c1` e `c2`, ou usar `c3` quando a fala for instrutiva. Não precisa animação complexa de boca.

## Princípios de interface

1. Uma tarefa por tela
   - Não mostrar cartões, estações e timeline ao mesmo tempo.
   - Cada etapa ocupa a tela inteira.

2. Ícone primeiro, texto depois
   - O ícone deve explicar a ação.
   - O texto serve só como apoio curto.

3. Alvos grandes
   - Pratos, bandejas e potes precisam ser grandes o suficiente para drag confortável.
   - Nada de slot pequeno com letra miúda.

4. Poucas opções por rodada
   - N1: 4 a 6 ícones.
   - N2: 6 a 8 ícones.
   - N3: 8 a 10 ícones, mas organizados em etapas, não todos exigindo leitura ao mesmo tempo.

5. Sem poluição no header
   - Header só mostra nível, fase, botão de tutorial e som.
   - A missão aparece em um quadro grande com ícone.

6. Nada de emoji
   - Botões e sinais simples devem ser feitos com `Graphics`.
   - Texturas ficam para personagem, fundo, pratos, bandejas e ícones de ação.

## Estrutura visual base

A tela principal deve parecer uma bancada de cozinha.

```text
+------------------------------------------------------------+
| Nível 1        Chef dos Subproblemas              ?   som   |
+------------------------------------------------------------+
|                                                            |
|                  [ ÍCONE GRANDE DO PEDIDO ]                |
|                    Preparar café da manhã                  |
|                                                            |
|      [ prato: Bebida ]        [ prato: Sanduíche ]          |
|                                                            |
|                                                            |
|   [ferver água] [pó de café] [pão] [queijo] [mexer]         |
|                                                            |
|                         [ Testar ]                         |
+------------------------------------------------------------+
```

Isso é uma tela só: pedido, pratos de destino e ícones arrastáveis. Não existe painel lateral, timeline pequena ou lista longa.

## Fluxo do jogo

Cada fase usa etapas sequenciais, não tudo na mesma tela.

### Etapa 1 - Dividir

A criança vê:

- um ícone grande do pedido;
- 2, 3 ou 4 pratos/bandejas representando subproblemas;
- ícones de ações na bancada.

Ela arrasta cada ação para o prato correto.

### Etapa 2 - Organizar

Aparece somente quando o nível exige ordem.

A criança foca em uma subreceita por vez. O prato aumenta no centro da tela e mostra 3 espaços grandes:

```text
+------------------------------------------------------------+
| Organize: Bebida                                           |
+------------------------------------------------------------+
|                                                            |
|             [ 1 ]        [ 2 ]        [ 3 ]                |
|                                                            |
|       [ferver água]   [colocar pó]   [servir]              |
|                                                            |
|                         [ Pronto ]                         |
+------------------------------------------------------------+
```

Depois que uma subreceita fica pronta, o jogo passa para a próxima. A criança não organiza todas ao mesmo tempo.

### Etapa 3 - Combinar

Aparece principalmente no N3.

As subreceitas prontas viram ícones grandes. A criança arrasta esses ícones para uma sequência simples ou para uma ação de `enquanto isso`.

A interface não deve ser uma linha do tempo técnica. Deve ser uma mesa de planejamento com poucos espaços grandes.

Exemplo simples:

```text
+------------------------------------------------------------+
| Monte o plano final                                        |
+------------------------------------------------------------+
|                                                            |
|        Primeiro          Enquanto espera          Depois    |
|      [          ]          [          ]          [       ]   |
|                                                            |
|     [ Bebida ]        [ Sanduíche ]        [ Mesa ]         |
|                                                            |
|                         [ Testar ]                         |
+------------------------------------------------------------+
```

Aqui a criança entende a intercalação visualmente: se algo demora ou espera, outra parte pode entrar no espaço `Enquanto espera`.

## Progressão pedagógica

## N1 - Separar em 2 partes

Objetivo:

Ensinar que um problema grande pode ser dividido em duas partes menores.

Interface:

- pedido grande no topo;
- 2 pratos grandes no centro;
- 4 a 6 ícones de ação na parte inferior;
- botão `Testar` só aparece quando todos os ícones foram colocados.

Exemplo:

Missão: `Preparar café da manhã`

Pratos:

- `Bebida`
- `Sanduíche`

Ícones de ação:

- ferver água;
- colocar café;
- mexer bebida;
- pegar pão;
- colocar queijo;
- fechar sanduíche.

Aprendizado:

- identificar partes menores;
- relacionar ações ao subproblema correto;
- entender que dividir ajuda a organizar.

Feedback:

- prato correto brilha;
- prato completo recebe selo visual feito com `Graphics`;
- ícone errado volta para a bancada;
- chef dá dica curta, por exemplo: `Esse passo combina mais com a bebida.`

## N2 - Separar e ordenar

Objetivo:

Ensinar que cada parte menor também pode ter uma sequência.

Interface:

A fase tem duas etapas bem separadas:

1. dividir ações em 3 pratos;
2. abrir cada prato em tela cheia para ordenar seus passos.

Exemplo:

Missão: `Preparar um piquenique`

Pratos:

- `Sanduíches`
- `Bebidas`
- `Cesto`

Depois de dividir, o jogo abre o prato `Sanduíches` no centro e mostra espaços grandes `1`, `2`, `3`. A criança ordena só aquela subreceita. Depois faz o mesmo com `Bebidas` e `Cesto`.

Aprendizado:

- separar antes de ordenar;
- perceber que uma subreceita tem começo, meio e fim;
- resolver partes menores uma de cada vez.

Feedback:

- passos encaixam com bounce;
- ordem errada treme;
- subreceita pronta vira um cartão grande com ícone;
- chef comemora com animação curta.

## N3 - Combinar partes com espera

Objetivo:

Ensinar que partes prontas podem ser combinadas de forma inteligente, especialmente quando uma parte tem espera.

Importante: não usar uma timeline técnica cheia de blocos pequenos. A criança deve trabalhar com ícones grandes de subreceita.

Interface:

Etapa 1: dividir ações em 3 ou 4 pratos.

Etapa 2: ordenar cada prato em foco, se necessário.

Etapa 3: combinar subreceitas em espaços grandes:

- `Primeiro`
- `Enquanto espera`
- `Depois`

Exemplo:

Missão: `Café da manhã rápido`

Subreceitas:

- `Bebida quente`
- `Sanduíche`
- `Mesa`

A subreceita `Bebida quente` tem um ícone de espera, usando `icone-ampulheta.png` se esse asset for entregue. Quando a criança coloca `Bebida quente` em `Primeiro`, o espaço `Enquanto espera` acende. Ela pode arrastar `Sanduíche` para esse espaço.

Aprendizado:

- perceber que uma parte pode ficar esperando;
- aproveitar a espera para resolver outra parte;
- combinar soluções pequenas em um plano melhor.

Feedback:

- o jogo mostra duas execuções simples: plano lento e plano melhor;
- o relógio é grande e visual, sem cálculo pequeno;
- a cozinheira aponta a economia: `Você usou a espera para adiantar outra parte.`

## Tutorial

Usar o componente compartilhado:

```ts
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
```

Tutorial N1:

1. `Este é o pedido grande.`
2. `Estes pratos são partes menores.`
3. `Arraste cada ícone para o prato certo.`
4. `Quando tudo estiver nos pratos, teste o plano.`

Esse tutorial aparece apenas na primeira fase do N1 e deve ser apresentado pela cozinheira. Ela fica em uma lateral segura da tela, apontando para cada área destacada.

Tutorial N2:

1. `Primeiro separe os ícones nos pratos.`
2. `Depois organize uma receita por vez.`
3. `Use 1, 2 e 3 para montar a ordem.`

Esse tutorial aparece apenas na primeira fase do N2. Ele explica a nova ação de ordenar uma subreceita em foco, sem repetir tudo que a criança já aprendeu no N1.

Tutorial N3:

1. `Algumas partes precisam esperar.`
2. `Use o espaço Enquanto espera para adiantar outra parte.`
3. `Teste e veja se o plano ficou mais rápido.`

No N3, não precisa de tutorial longo. A cozinheira pode dar uma fala curta antes da primeira fase e depois deixar a criança experimentar.

Regras:

- balões curtos;
- `safeTop` para não cobrir o HUD;
- destacar somente uma área por passo;
- botão `?` para rever tutorial;
- tutorial fica acima de qualquer HUD.
- falas comuns da cozinheira não substituem o tutorial: elas são comentários curtos de apoio.

## Modelo de jogo por estado

A `GameScene` pode controlar estados simples:

```ts
type PlayState =
  | 'intro'
  | 'split'
  | 'order-subtask'
  | 'combine'
  | 'simulate'
  | 'complete'
```

Cada estado desenha uma bancada diferente e limpa a anterior. Isso evita a sensação de três telas pequenas.

## Modelo de dados proposto

```ts
export type LevelNumber = 1 | 2 | 3

export type MissionMode =
  | 'split-only'
  | 'split-and-order'
  | 'split-order-combine'

export interface ActionIcon {
  id: string
  label: string
  iconKey: string
  subtaskId: string
  order?: number
  hasWait?: boolean
  hint?: string
}

export interface SubtaskPlate {
  id: string
  label: string
  iconKey: string
  actionIds: string[]
  ordered?: boolean
  hasWait?: boolean
}

export interface CombineSlot {
  id: 'first' | 'while-waiting' | 'after'
  label: string
  acceptsSubtaskIds?: string[]
}

export interface ChefMission {
  id: string
  level: LevelNumber
  mode: MissionMode
  title: string
  goalIconKey: string
  chefLine: string
  subtasks: SubtaskPlate[]
  actions: ActionIcon[]
  combineSlots?: CombineSlot[]
  expectedCombineOrder?: string[]
  successMessage: string
}
```

Esse modelo mantém a ideia principal: ícones e pratos. A ordem e a combinação são recursos extras, não uma interface paralela permanente.

## Texturas necessárias

Esta é a lista real de assets disponíveis para o remake. A UI estrutural continua por `Graphics`: pratos, bandejas, slots, botões, setas, check, X, balões, som/tutorial e estados de brilho.

### Fundo e capa

```text
bg-chef-bancada.png
cover-chef-dos-subproblemas.png
```

### Cozinheira

```text
c1.png
c2.png
c3.png
c4.png
c5.png
c6.png
c7.png
c8.png
```

Mapeamento:

```text
c1 - neutro
c2 - neutro 2
c3 - dúvida
c4 - ok
c5 - feliz
c6 - provando comida
c7 - assustada
c8 - perfeito
```

### Ícones de missão

```text
icon-missao-cafe-manha.png
icone-missao-lancheira.png
icone-missao-piquenique.png
```

Observação: há uma diferença de prefixo entre `icon-missao-cafe-manha.png` e os outros `icone-missao-*`. O código deve carregar exatamente esses nomes ou normalizar as chaves no `BootScene`.

### Ícones de comida e ação

```text
icone-agua.png
icone-ampulheta.png
icone-bolo.png
icone-cafe.png
icone-copo.png
icone-guardanapo.png
icone-ingredientes.png
icone-maca.png
icone-manteiga.png
icone-panela.png
icone-pao.png
icone-prato.png
icone-queijo.png
icone-suco.png
icone-talher.png
```

Esses ícones são o material arrastável principal. Eles devem aparecer grandes, com pouca legenda, e com hitbox do mesmo tamanho visual.

## Paleta enviada

```text
#050504 - tinta profunda / sombra
#f0bc59 - destaque quente / botões principais
#f7f6f2 - painel claro / texto sobre fundo escuro
#9b8aab - apoio lavanda / contorno secundário
#6d7b55 - verde cozinha / acerto
#abb97f - verde claro / estado pronto
```

Pode usar cores derivadas quando precisar de contraste, principalmente para texto, borda e estados de erro. A paleta não precisa limitar tudo; ela deve orientar a identidade visual.

## Animações importantes

- ícones entram na bancada em cascata;
- ícone levanta e cresce ao arrastar;
- prato de destino pulsa quando aceita o ícone;
- ícone encaixa com bounce;
- prato completo fecha com brilho;
- no N2, prato completo abre no centro para ordenar;
- no N3, subreceita com espera mostra ampulheta grande;
- espaço `Enquanto espera` acende quando pode ser usado;
- cozinheira troca de imagem conforme fala, acerto, erro e dica.

## Completion

Usar o helper compartilhado:

```ts
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
```

Não desenhar manualmente telas finais dentro da `GameScene`.

Fim do jogo deve ter:

- `Jogar novamente`;
- `Voltar`.

## Critérios de qualidade

O remake deve estar pronto quando:

- a tela principal tiver ícones grandes e pouca leitura;
- o jogo não mostrar três interfaces simultâneas;
- N1 focar em dividir;
- N2 focar em dividir e ordenar uma subreceita por vez;
- N3 focar em combinar usando espera, sem timeline técnica pequena;
- todo tutorial usar `createTutorial`;
- telas finais usarem `showLevelComplete`;
- não houver emoji;
- hitboxes baterem com os elementos visuais;
- botões tiverem bloqueio contra clique múltiplo;
- o jogo enviar eventos do `runtimeGameBridge` como os outros jogos.

## Decisão final

O jogo deve ser sobre arrastar ícones para decompor tarefas, não sobre gerenciar painéis.

A melhor estrutura é:

```text
pedido grande -> pratos de subproblema -> ícones arrastáveis -> foco em uma parte -> teste animado
```

Assim a criança entende decomposição visualmente, sem precisar lidar com uma interface comprimida.