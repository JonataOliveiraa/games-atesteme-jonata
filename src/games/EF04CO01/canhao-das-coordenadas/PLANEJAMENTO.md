# Canhão das Coordenadas — Planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

Proposta original: [1.md](./1.md)

**EF04CO01 · 4º ano · Pensamento Computacional · Matrizes e registros**

> **Mudança necessária no briefing:** manter o canhão de tinta e o mural de janelas, mas retirar o relógio de 90 segundos, o gesto de segurar e a grade de 6 × 6. Esses elementos cobrariam rapidez ou precisão de dedo e tornariam as células pequenas no celular. A grade permanece 4 × 4; os comandos, e não o tamanho do alvo, tornam-se mais desafiadores.

---

## 1. Habilidade e vínculo pedagógico

> (EF04CO01) Reconhecer objetos do mundo real e/ou digital que podem ser representados através de matrizes que estabelecem uma organização na qual cada componente está em uma posição definida por coordenadas, fazendo manipulações simples sobre estas representações.

Objeto: **Matrizes e registros**.

> O professor pode solicitar que os alunos construam o tabuleiro (usando uma matriz) e joguem a batalha naval, onde os tiros são dados informando as coordenadas no tabuleiro. Outra atividade que pode ser feita é apresentar diferentes fachadas de prédios e solicitar que os alunos representem a distribuição das janelas por matrizes, registrando nas correspondentes coordenadas as características de cada janela (por exemplo, aberta ou fechada, com cortina ou não, com persiana ou não). Com essas representações, os alunos podem fazer um jogo estilo 'cara a cara' onde cada jogador escolhe secretamente uma janela (por exemplo 2ª janela do 3º andar) e o adversário deve descobrir a janela escolhida pelo adversário. Para isso, os jogadores devem fazer perguntas, sobre as características das janelas, que permitam ir descartando janelas até descobrir a janela escolhida pelo adversário. O registro das janelas descartadas deve ser feito na matriz que representa a fachada do prédio.

O mural representa uma **fachada de 16 janelas**. Cada janela ocupa uma posição definida por **linha** (horizontal) e **coluna** (vertical). A criança localiza, lê e altera essas posições. Os quadrados pintados permanecem na matriz: ela consegue verificar a transformação que realizou, não apenas receber um aviso de acerto.

**Convenção fixa:** L = linha; C = coluna; ordem sempre **L2, C3**. A linha 1 é a de cima; a coluna 1 é a da esquerda. A convenção aparece ao lado da matriz e não muda entre níveis.

### Teste da bolinha

Se os números, a grade e a posição das janelas forem trocados por bolinhas sem significado, não será possível responder “L2, C3”, ler a coordenada de uma janela destacada ou mover uma pintura uma coluna à direita. A habilidade está na escolha e na mudança da matriz, não no splash de tinta.

### O que foi simplificado

| Briefing | Plano |
|---|---|
| 90 segundos e 12 pedidos por rodada | três murais por nível, 3–4 comandos cada, sem cronômetro |
| tocar e segurar 0,3 s | um toque, sem confirmação demorada |
| 4 × 4, 5 × 5 e 6 × 6 | 4 × 4 nos três níveis, grande no celular |
| nível 3 com pintar linha, coluna, trocar e copiar | dois verbos consistentes: **MOVER** e **COPIAR** uma janela pintada |
| figura pixel de 12–16 células | cada mural forma um padrão simples de janelas, exibido ao terminar |
| guia da linha e da coluna certas no primeiro erro | dica progressiva: primeiro conceito, depois pulso na resposta após duas tentativas |

Não haverá narração. “Ouça a coordenada” da frase inicial vira **“Leia a coordenada”**, porque o catálogo trabalha com texto e pictogramas sem depender de áudio.

---

## 2. Diferença para o jogo irmão

Já existe [Batalha das Coordenadas](../batalha-das-coordenadas/), publicado sob EF04CO01.

| Batalha das Coordenadas | Canhão das Coordenadas |
|---|---|
| mapa de tesouro; colunas A–D e linhas 1–4 | fachada de janelas; linhas 1–4 e colunas 1–4 |
| escavar uma posição ou descartar baús | pintar, copiar e mover estados de células |
| pistas levam à localização do tesouro | comando altera uma matriz visível e persistente |
| nível 3 é eliminação lógica | nível 3 é manipulação da representação |
| resultado é achar o tesouro | resultado é uma fachada transformada |

Se o novo jogo terminar sendo apenas “toque na coordenada anunciada” em todos os níveis, ele repetirá o irmão. **MOVER** e **COPIAR** são essenciais para a diferença e para o trecho “fazendo manipulações simples”.

---

## 3. O jogo em uma frase

**Leia o pedido, toque na janela certa e veja o canhão de tinta pintar; depois use as coordenadas para copiar e mover pinturas na fachada.**

Gênero: **mira educativa sem violência / quebra-cabeça de matriz**.

O objeto é **um canhão normal de tinta**, sem rosto ou traços de personagem: cano de metal azul-escuro, boca circular, carreta de madeira e rodas grandes. Sua identidade vem da forma e do recuo mecânico. Ele não aponta para a resposta antes da escolha da criança. Não há tinta dirigida a pessoas, dano, munição, física livre nem teste de pontaria. O toque na célula ou no cartão de coordenada é a resposta; o canhão gira e pinta automaticamente.

---

## 4. Laço de jogo

~~~text
UMA FACHADA 4 × 4 APARECE
→ um pedido curto aparece à direita

A CRIANÇA TOCA
→ no nível 1, toca a janela da coordenada pedida
→ no nível 2, toca o cartão que nomeia a janela destacada
→ no nível 3, toca a janela de destino para MOVER ou COPIAR

O JOGO MOSTRA
→ linha e coluna acendem em sequência
→ canhão gira e lança uma gota de tinta
→ a matriz muda somente se a resposta corresponde ao pedido

DEPOIS DE 3 OU 4 PEDIDOS
→ a fachada pronta aparece inteira
→ inicia o próximo mural
~~~

**Fase = um mural/fachada completa.** Cada nível possui três fases, dentro do limite do catálogo. Não há tempo limite; o ritmo é de leitura.

---

## 5. Exemplo concreto: primeiro pedido

O mural mostra quatro linhas horizontais e quatro colunas verticais. Números **1, 2, 3, 4** aparecem em cima das colunas e à esquerda das linhas.

À direita, um cartão grande diz: **“Pinte L2, C3.”** Um pequeno exemplo fixo mostra **“linha → coluna”**, sem apontar a resposta.

A criança encontra a segunda linha e a terceira coluna e toca no cruzamento:

1. guia da linha 2 acende em azul;
2. guia da coluna 3 acende em azul;
3. o cruzamento recebe um contorno;
4. o canhão escolar gira sozinho;
5. uma gota colorida faz um arco curto;
6. a janela L2,C3 fica pintada;
7. aparece: **“Linha 2 com coluna 3: L2,C3.”**

Se tocar L3,C2, a tinta faz um respingo cinza que some. O mural não muda. A dica diz: **“L vem primeiro: procure a linha 2.”** A criança tenta de novo. Depois de duas escolhas diferentes incorretas no mesmo pedido, a célula correta pulsa.

---

## 6. Controle

**Gesto único: toque.** Mouse equivale a toque. Teclado pode ser apoio, mas não é necessário.

| Estado | Alvo tocável | Efeito |
|---|---|---|
| nível 1 | janela da matriz | responde à coordenada pedida |
| nível 2 | um dos três cartões de coordenada | nomeia a janela iluminada; ao acertar, ela é pintada |
| nível 3 | janela de destino | aplica MOVER ou COPIAR a partir da fonte destacada |
| qualquer nível | `?` | pausa e abre tutorial ilustrado |

Não há arraste, segurar, mira manual ou duplo toque. O canhão não é clicável. Tocar fora dos alvos não é erro.

No nível 3, o quadro destaca a **janela de origem** e a direção do movimento. A criança escolhe apenas o destino; não precisa selecionar origem e destino em dois passos.

---

## 7. Grade fixa — 1280 × 720

Usar `Phaser.Scale.FIT`. A geometria é a mesma nos três níveis.

| Faixa/peça | Caixa lógica | Conteúdo | No celular a 30% |
|---|---|---|---:|
| cabeçalho | (0, 0, 1280, 92) | vidas, três murais, mudo, `?` | 27,6 px de altura |
| cabeçalhos de coluna | (150, 104, 536, 42) | C1–C4, cada um alinhado à coluna | 40,2 px de largura por coluna |
| cabeçalhos de linha | (104, 150, 42, 536) | L1–L4, alinhados às linhas | 40,2 px de altura por linha |
| matriz | (150, 150, 536, 536) | 4 × 4 janelas | **40,2 × 40,2 px por célula** |
| cartão de pedido | (750, 140, 450, 95) | uma frase curta | 135 × 28,5 px |
| três opções do nível 2 | x750, y245/395/545, 450 × 136 cada | cartões de coordenada | **135 × 40,8 px cada** |
| canhão decorativo | (892, 455, 230, 230) | animação automática; sem toque | 69 × 69 px |
| `?` | (1138, 4, 128, 84) | tutorial | 38,4 × 25,2 px visíveis; hitbox 136 × 136 |
| faixa de feedback | (744, 235, 460, 112) | dica ou confirmação | 138 × 33,6 px |

A hitbox do `?` é ampliada para pelo menos 40 px reais e não invade o cartão do pedido. Os cartões do nível 2 usam a área inteira de 136 px, não apenas o texto. Todos os alvos importantes cabem em toque infantil.

A área do canhão fica à direita e abaixo do pedido, nunca sobre a matriz. O arco da gota não encobre números nem texto; desaparece em menos de 0,6 s.

### Contraste e leitura

- números L/C no mínimo 42 px lógicos;
- pedido no mínimo 45 px lógicos;
- cartões do nível 2 no mínimo 48 px lógicos;
- no máximo duas linhas por pedido;
- nenhum texto dentro do PNG;
- linha e coluna distinguidas por **posição e rótulo**, nunca apenas por cor.

---

## 8. Níveis e conteúdo pronto

Todos os murais começam do zero, salvo a **janela de origem inicial** do nível 3. A posição dos pedidos não é sorteada; a sequência constrói um padrão verificável. Apenas os três cartões do modo inverso podem variar de ordem.

### Nível 1 — Localizar e pintar

A criança lê uma coordenada e toca a janela correspondente. Quatro pedidos por mural.

| Mural | Nome visual | Pedidos, na ordem | Padrão final |
|---|---|---|---|
| 1.1 | Quatro cantos | L1,C1 · L1,C4 · L4,C1 · L4,C4 | cantos acesos |
| 1.2 | Janela central | L2,C2 · L2,C3 · L3,C2 · L3,C3 | quadrado 2 × 2 |
| 1.3 | Coluna azul | L1,C2 · L2,C2 · L3,C2 · L4,C2 | uma coluna completa |

O resultado mostra a fachada inteira com as quatro janelas pintadas; pode escrever **“Você encontrou quatro posições na matriz.”** Não mostrar placar numérico de acertos ou pontos.

### Nível 2 — Ler uma posição

Uma janela da matriz pulsa em amarelo neutro. Aparecem três cartões grandes. A criança toca a coordenada que a identifica; então a janela é pintada automaticamente. Três pedidos por mural.

| Mural | Janelas destacadas, na ordem | Exemplo de distratores |
|---|---|---|
| 2.1 | L2,C3 · L3,C1 · L1,C4 | L3,C2 (inversão), L2,C2 (coluna vizinha) |
| 2.2 | L4,C2 · L1,C3 · L3,C4 | L2,C4 (inversão), L4,C3 (coluna vizinha) |
| 2.3 | L2,C1 · L4,C3 · L3,C2 | L1,C2 (inversão), L2,C2 (coluna vizinha) |

Quando linha e coluna são iguais, usar dois vizinhos diferentes em vez de gerar opções duplicadas. A opção correta não fica sempre no mesmo lugar.

### Nível 3 — Manipular a matriz

Uma janela já pintada aparece como **origem**. O pedido mostra **MOVER** ou **COPIAR** com seta grande. A criança toca **uma** janela de destino. Três pedidos por mural.

- **MOVER:** origem deixa de estar pintada; destino passa a estar pintado.
- **COPIAR:** origem continua pintada; destino também passa a estar pintado.
- Não há escolha de cor: só “pintada” e “sem tinta”. Isso mantém a operação compreensível.
- Toda origem fica destacada e todo destino correto começa vazio.

| Mural | Estado inicial | Pedido 1 | Pedido 2 | Pedido 3 |
|---|---|---|---|---|
| 3.1 | L2,C2 pintada | MOVER L2,C2 uma coluna à direita → L2,C3 | COPIAR L2,C3 uma linha abaixo → L3,C3 | MOVER L3,C3 uma coluna à esquerda → L3,C2 |
| 3.2 | L3,C4 pintada | MOVER L3,C4 uma linha acima → L2,C4 | COPIAR L2,C4 uma coluna à esquerda → L2,C3 | MOVER L2,C3 uma linha abaixo → L3,C3 |
| 3.3 | L4,C1 pintada | MOVER L4,C1 uma linha acima → L3,C1 | COPIAR L3,C1 uma coluna à direita → L3,C2 | MOVER L3,C2 uma linha acima → L2,C2 |

Exemplo de pedido visível, em duas linhas:
**“MOVER L2,C2”**

**“1 coluna →”**

O destino não é escrito na frase; a criança o deduz pela posição da origem e pela direção. O comentário após a ação explicita a transformação: **“A tinta saiu de L2,C2 e foi para L2,C3.”**

---

## 9. Regras em dados

`data/levels.ts` é o único arquivo com níveis e fases. O veredito deve ser derivado do comando e do estado atual, não de um `correctCellId` solto.

~~~ts
type Cell = { row: number; col: number }
type Shift = { row: -1 | 0 | 1; col: -1 | 0 | 1 }

type Task =
  | { kind: 'paint'; target: Cell }
  | { kind: 'read'; highlighted: Cell; options: [Cell, Cell, Cell] }
  | { kind: 'move' | 'copy'; source: Cell; shift: Shift }

interface Mural {
  id: string
  title: string
  initialPainted: Cell[]
  tasks: Task[]
}

interface Level {
  level: 1 | 2 | 3
  murals: [Mural, Mural, Mural]
}

const destinationOf = (task: Extract<Task, { source: Cell }>): Cell => ({
  row: task.source.row + task.shift.row,
  col: task.source.col + task.shift.col,
})

const sameCell = (a: Cell, b: Cell) =>
  a.row === b.row && a.col === b.col

const correct = (task: Task, chosen: Cell) =>
  task.kind === 'paint'
    ? sameCell(chosen, task.target)
    : task.kind === 'read'
      ? sameCell(chosen, task.highlighted)
      : sameCell(chosen, destinationOf(task))
~~~

Depois do acerto:

~~~text
PAINT:  painted[target] = true
READ:   painted[highlighted] = true
MOVE:   painted[source] = false; painted[destination] = true
COPY:   painted[source] = true;  painted[destination] = true
~~~

Validar ao carregar:

- três níveis, três murais por nível, no máximo quatro tarefas por mural;
- toda célula dentro da grade 4 × 4;
- opção correta presente uma única vez no trio de leitura;
- opções diferentes entre si;
- toda origem de MOVER/COPIAR pintada no instante da tarefa;
- destino de MOVER/COPIAR vazio e dentro da grade;
- deslocamento de apenas uma posição em uma direção;
- padrões finais exatamente iguais aos previstos;
- todos os textos cabem no limite visual.

---

## 10. Erro, TRAVA e vidas

Erro é apenas uma escolha de conteúdo diferente da resposta:

1. o canhão lança tinta cinza que não altera a fachada;
2. a escolha feita balança uma vez;
3. um cadeado âmbar e uma frase curta surgem à direita;
4. a tarefa não avança;
5. o jogo mostra como pensar, sem apontar a resposta de imediato;
6. a criança tenta de novo;
7. depois de duas escolhas incorretas naquela tarefa, a resposta correta pulsa;
8. somente a escolha correta destrava.

Dicas por tipo:

| Tipo | Primeira dica |
|---|---|
| pintar | “L é a linha horizontal. Procure a linha antes da coluna.” |
| ler | “Leia primeiro o número da esquerda; depois, o de cima.” |
| mover | “A tinta sai da origem. Conte só um passo na direção da seta.” |
| copiar | “A origem continua pintada. Conte um passo para a cópia.” |

O primeiro erro conceitual da tarefa emite `WRONG_ANSWER` e chama `lives.lose()`. Os toques incorretos seguintes enquanto a mesma tarefa está em TRAVA apenas intensificam a ajuda; não gastam vidas repetidas numa única dúvida. O contador de erros dessa tarefa zera ao acertar. Tocar fora, abrir `?`, tocar no canhão decorativo ou repetir a mesma célula sem mudança não custa vida.

Se as vidas acabarem, o componente compartilhado decide o `GAME_OVER`. Não emiti-lo manualmente.

---

## 11. Pontuação e resultado

- primeira resposta certa numa tarefa: **+10 internos**;
- resposta após TRAVA: **+5 internos**;
- a pontuação é normalizada para o painel compartilhado;
- estrelas seguem o critério 90/70 do catálogo;
- nenhum número de pontos, erros, acertos ou porcentagem aparece à criança.

Ao terminar um mural, afastar o pedido e mostrar a fachada inteira por 2 s, com as janelas pintadas na posição construída. Ao terminar o nível, mostrar os três murais lado a lado como pequenas fachadas, selo de conclusão e botão **CONTINUAR**. O resultado evidencia a matriz, não apenas a animação do canhão.

Frase final: **“Cada janela tem um lugar: linha e coluna ajudam a encontrar e mudar esse lugar.”**

---

## 12. Feedback e áudio

| Momento | Visual | Som WebAudio |
|---|---|---|
| abrir mural | grade surge célula por célula | três notas leves |
| pedir posição | L e C do cartão acendem em ordem | clique duplo suave |
| tocar | célula ou cartão afunda e volta | toque curto |
| acerto | guia de linha, depois coluna; gota e splash | giro leve e toque de tinta |
| MOVER | tinta sai da origem e pousa no destino | whoosh curto |
| COPIAR | tinta se divide visualmente em duas | duas notas ascendentes |
| erro | tinta cinza some, cadeado âmbar | estalo neutro |
| segundo erro | resposta pulsa sem cobrir texto | pulso suave |
| mural completo | fachada se revela inteira | acorde breve |
| nível completo | três fachadas aparecem | celebração curta |

Sem arquivos de áudio obrigatórios; sintetizar em WebAudio e respeitar `mute-audio`. O jogo continua compreensível no mudo. Nenhum som simula arma, explosão ou perigo.

---

## 13. Tutorial

No máximo quatro passos, demonstrados na primeira fase:

1. **“Esta fachada é uma matriz.”** A grade surge.
2. **“L é linha: vai de lado.”** Uma linha acende.
3. **“C é coluna: vai de cima para baixo.”** Uma coluna acende.
4. **“Toque onde as duas se encontram.”** A célula exemplo pulsa; o canhão pinta.

O tutorial usa uma **célula demonstrativa**, sem consumir um dos pedidos avaliados. Pode ser pulado. O botão `?` reabre o painel e pausa tweens, entrada e som. Os níveis 2 e 3 mostram uma demonstração curta adicional apenas do novo verbo, sem repetir os quatro passos iniciais.

---

## 14. Texturas e placeholders

Três arquivos planejados:

1. `bg-patio-da-arte.png` — pátio escolar claro, parede vazia reservada para a matriz;
2. `canhao-de-tinta.png` — folha 4 × 1 do mesmo canhão de tinta, em repouso, apontando, recuando e assentando;
3. `cover-canhao-das-coordenadas.png` — capa, gerada por último.

**Matriz, janelas, números, cartões, gota, splash, tinta, seta, cadeado, bordas, dicas, mural concluído e HUD são Graphics/Text**, pois mudam de posição, estado ou conteúdo. A arte não pode pré-pintar coordenadas ou janelas: isso colocaria a resposta no fundo.

Sem PNG, o fundo vira pátio vetorial simples e o canhão vira um corpo azul arredondado. A grade e todas as ações permanecem jogáveis. Especificações e prompts em [TEXTURAS.md](./TEXTURAS.md).

---

## 15. Arquitetura e integração

~~~text
canhao-das-coordenadas/
├── 1.md
├── PLANEJAMENTO.md
├── TEXTURAS.md
├── index.ts
├── types.ts
├── data/
│   ├── layout.ts
│   ├── theme.ts
│   └── levels.ts
└── scenes/
    ├── BootScene.ts
    ├── GameScene.ts
    ├── drawFacade.ts
    ├── drawPrompt.ts
    ├── animateCannon.ts
    └── audio.ts
~~~

`GameScene` orquestra; os módulos `scenes/*.ts` desenham. Usar 1280 × 720, `Scale.FIT`, `createLoadingScreen`, `faseInicial`, `createLives`, `createTutorial`, `showLevelComplete` e `runtimeGameBridge`. Os assets são opcionais via `import.meta.glob`. Os níveis moram apenas em `data/levels.ts`.

Os eventos usam o número do nível atual, não o índice da fase:

- `GAME_READY` quando o jogo está interativo;
- `CORRECT_ANSWER` no acerto real;
- `WRONG_ANSWER` no primeiro erro conceitual da tarefa;
- `CHECKPOINT` ao concluir um mural ou nível;
- `GAME_COMPLETED` **ao fim de cada nível**, com `stage: this.level.level` e `totalStages: LEVELS.length`.

Vidas restantes atravessam a troca de nível por `scene.restart`. Nenhum `isFinalStage` fixo. Não registrar ou publicar antes do primeiro corte e do teste real.

### Registro futuro

- catálogo: slug `canhao-das-coordenadas`, module `EF04CO01/canhao-das-coordenadas`, skill `EF04CO01`, ano 4, status inicial `draft`;
- `src/data/gameInstructions.ts`: três frases curtas;
- `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` após existir tela própria;
- assets em `src/assets/games/EF04CO01/canhao-das-coordenadas/`.

---

## 16. Ordem de produção

**Primeiro corte: somente o nível 1**, como manda `INSTRUCOES.md`. Ele contém os três murais, toque na célula, pintura automática, erro/TRAVA, tutorial, `?`, vidas, mudo e resultado. Mostrar ao usuário para teste antes de implementar níveis 2 e 3.

Após a avaliação:

1. adicionar o modo inverso do nível 2;
2. adicionar MOVER/COPIAR do nível 3;
3. medir as caixas alfa do canhão;
4. produzir o fundo definitivo;
5. testar em celular;
6. produzir a capa por último.

---

## 17. Critérios de aceite

### BNCC

- [ ] a fachada é reconhecível como objeto real representado por matriz;
- [ ] cada janela tem linha e coluna;
- [ ] linha e coluna são identificáveis por rótulo e posição;
- [ ] nível 1 localiza por coordenada;
- [ ] nível 2 lê coordenada de posição destacada;
- [ ] nível 3 altera a representação por MOVER/COPIAR;
- [ ] as mudanças ficam registradas no mural.

### Experiência infantil

- [ ] um toque basta;
- [ ] não há cronômetro nem gesto de segurar;
- [ ] matriz 4 × 4 permanece legível em celular;
- [ ] nenhum pedido tem mais de duas linhas;
- [ ] o canhão anima a escolha, mas nunca exige pontaria;
- [ ] erro de toque fora da célula não gasta vida;
- [ ] dica explica o raciocínio;
- [ ] após dois erros a resposta pulsa;
- [ ] o resultado mostra a fachada construída.

### Escopo técnico

- [ ] três níveis planejados, três murais por nível;
- [ ] somente nível 1 no primeiro corte;
- [ ] níveis em `data/levels.ts`;
- [ ] três texturas, sem texto embutido;
- [ ] placeholders completos;
- [ ] áudio WebAudio e mudo;
- [ ] `faseInicial`, vidas e ponte de runtime compartilhados;
- [ ] nenhum ponto ou percentual escrito na tela;
- [ ] teste real antes da publicação.

---

## 18. Resumo da decisão

O jogo continua sendo um canhão de tinta escolar diante de um muro-matriz. A criança toca e vê a tinta acertar a janela escolhida. O que mudou foi a cobrança: sem tempo, sem segurar e sem células minúsculas. A progressão passa de **localizar** para **ler** e finalmente **mover/copiar** estados da matriz, que é a parte mais própria da EF04CO01.

---

## 19. O que foi construído (nível 1, 14/09/2026)

O primeiro corte do §16 está de pé e jogável: pátio, matriz 4 × 4 com rótulos,
cartão de pedido, traçado de linha e coluna, canhão que gira e dispara, tinta
que fica na janela, erro com TRAVA e dica, tutorial de quatro passos, `?`,
vidas, mudo e fachada revelada ao fim de cada mural.

Uma partida limpa do nível 1: 12 acertos, 120 pontos internos, nenhum erro, três
vidas intactas, 57 s.

### Arquivos

~~~text
index.ts            1280 × 720, Scale.FIT, scene: [BootScene, GameScene]
types.ts            Cell, Shift, Task (os três verbos), Mural, LevelDef, Mode
data/art.ts         as caixas alfa MEDIDAS da folha do canhão
data/layout.ts      W/H, DEPTH, HUD, GRID, PROMPT, HINT, CANNON
data/levels.ts      os três murais do nível 1
data/rules.ts       answerOf/correct/applyTask + validateLevels
scenes/BootScene    carrega as duas folhas, ignorando `cover-`
scenes/GameScene    orquestra; não desenha nada
scenes/yard         o pátio, com véu
scenes/facade       a matriz: janelas, rótulos, guias, tinta, pulso, revelação
scenes/prompt       cartão de pedido, convenção fixa e faixa de dica
scenes/cannon       giro, recuo, gota em arco e splash
scenes/hud          murais concluídos, nome do mural, vidas e `?`
scenes/audio        WebAudio, sem arquivo
~~~

Os nomes ficaram `facade.ts`, `prompt.ts` e `cannon.ts` em vez de `drawFacade`,
`drawPrompt` e `animateCannon`: cada um devolve `createX()` com `destroy()`,
que é a forma que os outros 49 jogos usam.

### A folha do canhão veio diferente do contrato

| §5 do TEXTURAS.md pedia | Veio |
|---|---|
| 1024 × 256 | **1725 × 450** |
| grade 4 × 1, células de 256 | **grade 3 × 1, células de 575** |
| quatro estados (repouso, mira, disparo, assentar) | **três** (repouso, disparo, fumaça) |
| cano voltado para a esquerda/superior | cano voltado para a **direita** |

Nada disso atrapalha, e o código se guiou pelo que chegou. O cano apontando
para a direita até ajuda: a matriz fica à esquerda e o canhão à direita, então
ele já olha para o alvo.

**As caixas alfa medidas**, que estão em `data/art.ts`:

~~~text
f0 repouso  x=132 y=145 w=310 h=272   base 417
f1 disparo  x=125 y=132 w=437 h=284   base 416
f2 fumaça   x=140 y= 95 w=415 h=334   base 429
~~~

A âncora é UMA SÓ, tirada do centro do corpo no quadro de repouso, e vale para
os três. Centrar cada quadro pela sua própria caixa faria o canhão pular para a
esquerda e afundar 12 px no exato instante do tiro — o que cresce em f1 e f2 é
o jato e a fumaça, não a peça.

### Decisões que o planejamento deixou em aberto

| Onde | Plano | Feito | Motivo |
|---|---|---|---|
| traçado no erro | §5 descreve os guias só no acerto | linha e coluna acendem **sempre**, inclusive errando | é assim que a criança vê em coordenadas onde ela tocou, e descobre sozinha que trocou L com C |
| segunda dica | §10 pede ajuda crescente | a segunda frase diz qual célula ela tocou: "Você tocou L3, C2..." | nomear o erro na mesma convenção do pedido é mais útil que repetir o conceito |
| convenção L/C | §5 fala de um exemplo fixo ao lado do cartão | linha de texto fixa sob o pedido | o exemplo corria o risco de ser lido como resposta |
| cartão de pedido | fundo transparente | painel opaco | o fundo tem uma janela azul e uma estante de tintas nessa faixa |

### Erro, vidas e pontos

Como o §10 manda: a tinta sai cinza, não pinta, a janela balança, cadeado âmbar
com a dica do verbo, e a tarefa NÃO anda. Só o primeiro erro de cada tarefa
emite `WRONG_ANSWER` e gasta vida; insistir na mesma dúvida não soma castigo.
Depois de duas tentativas a resposta pulsa. Acerto de primeira vale 10, depois
da TRAVA vale 5.

`validateLevels()` roda no `create()` e SIMULA cada mural pedido a pedido, em
vez de só ler o arquivo: é a única forma de pegar uma tarefa de MOVER cuja
origem ainda não foi pintada, que é o erro que os níveis 2 e 3 vão poder
cometer.

### O que falta

1. Avaliação deste corte antes dos níveis 2 e 3, como o §16 exige.
2. `cover-canhao-das-coordenadas.png`. O catálogo entrou com o pátio como capa
   provisória e `status: "draft"`.
3. Teste com criança e no celular de verdade. Em paisagem de 844 px a célula
   fica com cerca de 88 px reais, bem acima do piso de toque.

---

## 20. O canhão virado, e o tiro refeito (14/09/2026)

### Ele estava atirando de costas

A folha veio com o cano voltado para a direita e o canhão mora à direita da
tela — então ele disparava para fora do pátio, de costas para a fachada. Um
`setFlipX` resolveu, e a animação inteira acompanhou: o recuo foi para o lado
oposto ao cano, a boca trocou de lado e a fumaça saiu junto.

`FACING` em `scenes/cannon.ts` é a única coisa a mudar se a arte um dia vier já
virada.

### O tiro ganhou três tempos

Antes era girar, trocar o quadro e soltar uma bolinha. Agora:

1. **Toma impulso.** O canhão agacha e recua um dedo, como quem puxa o braço.
   São 160 ms, o bastante para o olho registrar que algo vai acontecer.
2. **Dispara.** Recuo forte para o lado oposto ao cano, corpo esticado na
   direção do tiro, fumaça saindo da boca e uma tremida leve de câmera.
3. **Volta quicando** nas rodas com folga elástica — ao mesmo tempo em que a
   gota voa. Esperar o canhão assentar antes de soltar a tinta deixaria o tiro
   lento.

### A gota virou lágrima

Não é mais um círculo. A cauda sai de três círculos decrescentes atrás do
corpo, na direção da velocidade tirada da derivada da curva — o truque mais
barato de dar direção a algo redondo sem rotacionar um `Graphics` que desenha
em coordenadas de tela. Atrás dela ficam pingos que escorrem e somem.

No impacto, metade dos respingos voa em leque e a outra metade **escorre para
baixo**, porque tinta escorre. Sem isso o splash lê como fagulha, e a única
coisa que este jogo não pode parecer é explosão.

### Nota de método

Tentei capturar a animação congelando o laço do Phaser e avançando quadro a
quadro. Não funciona aqui: a sequência mistura tweens com `FX.wait`, que usa
temporizadores de cena, e avançar o laço com carimbos de tempo artificiais
desalinha os dois — o jogo parece travado quando na verdade só está esperando
um timer que nunca chega. O que funciona é pausar a cena no meio do voo
(`scene.pause()`) e capturar dali.

---

## 21. Níveis 2 e 3, e a cor que virou nome (14/09/2026)

O jogo está completo: localizar, ler e manipular.

### Nível 2 — ler a posição

A janela pulsa em amarelo neutro e três cartões oferecem coordenadas. Cada trio
traz a resposta, a **inversão** dela e uma vizinha de coluna. A inversão é o
distrator que importa: é o erro que o jogo inteiro existe para desfazer, e
escondê-lo das opções deixaria a criança acertar sem decidir. A ordem do trio é
sorteada a cada tarefa.

Os cartões ficaram **em linha**, e não empilhados como o §7 previa. Empilhados,
três cartões de 136 px mais o pedido, a dica e o canhão não cabem nos 620 px de
altura da direita: ou o cartão encolhia para 84 px — 25 px reais num celular,
abaixo do alvo tocável — ou o canhão saía da tela. Deitados, cada um fica com
142 × 124, que a 30% dá 43 × 37 px reais.

### Nível 3 — e a decisão sobre cor

O §8 tinha decidido uma cor só, para MOVER e COPIAR não virarem escolha de cor.
**A regra continua**: a criança nunca escolhe tinta. O que mudou é que cada
mancha tem a SUA cor, e isso resolve o problema que a decisão original criava.

Com tudo azul, mover e copiar terminam iguais na tela: uma célula pintada a
mais. Com cor, vê-se a laranja SAIR de um lugar e chegar no outro, e a verde
continuar onde estava enquanto a cópia aparece ao lado. A cor deixou de ser
enfeite e virou o NOME da mancha — o pedido diz "MOVER L1, C1", a criança olha,
vê que o que mora ali é laranja, e depois vê a laranja chegar do outro lado.

Cada mural começa com três manchas de cores diferentes e cada pedido mexe em
uma delas, então cada disparo sai com uma cor diferente. Em mover e copiar a
cor vem SEMPRE da origem, nunca do disparo: é isso que mantém a operação
legível.

No acerto de um MOVER a origem esvazia **antes** de o destino encher. Sem esse
intervalo, a tinta pareceria ter brotado no destino em vez de ter saído dali.

### O que mudou na estrutura

`painted` deixou de ser `Set<string>` e virou `Map<string, number>`: cada célula
pintada guarda qual tinta está nela. Sem isso o nível 3 não teria como fazer a
mancha laranja continuar laranja ao mudar de lugar.

`scenes/cards.ts` é novo, e só o nível 2 usa.

### O tutorial passou a mudar com o nível

O §13 pedia isso e o primeiro corte não fazia: os níveis 2 e 3 mostram só o
verbo novo, sem repetir os quatro passos de linha e coluna. Quem chega ao nível
3 já sabe ler uma coordenada; o que ela ainda não viu é a tinta mudar de lugar.

### Conferido

| Nível | Tarefas | Resultado |
|---|---|---|
| 1 | 12 pinturas | 120 pontos, nenhum erro |
| 2 | 9 leituras | 90 pontos, nenhum erro |
| 3 | 9 manipulações | 90 pontos, nenhum erro |

A partida inteira, com as passagens automáticas entre níveis, fecha em 300
pontos com as três vidas. `validateLevels()` roda limpo nos três, simulando cada
mural pedido a pedido.

### O que falta

1. `cover-canhao-das-coordenadas.png`, e tirar o `status: "draft"`.
2. Teste com criança, principalmente no nível 3.
3. Medir o contraste das cinco tintas em tela de celular sob sol.

---

## 22. O nível no cabeçalho (14/09/2026)

O cabeçalho mostrava os murais concluídos, mas não em que NÍVEL a criança
estava. Os pontos contam murais **dentro** do nível e reiniciam a cada um, de
modo que três pontos apagados significavam a mesma coisa no nível 1 e no
nível 3 — e quem voltasse ao jogo no dia seguinte não tinha como saber onde
havia parado.

Entrou uma pílula `NÍVEL n` no canto esquerdo, 132 × 48, texto de 19 px.

### Por que sem o total

O catálogo tem dois formatos. `NÍVEL n` aparece em trinta jogos; `NÍVEL n de
N`, em quinze. A divisão é geracional: o segundo é da leva EF02/EF03, e a leva
nova — EF04, EF05, EF15 — usa o primeiro quase sem exceção, deixando o total
para a barra de progresso da tela de conclusão.

O vizinho direto decidiu o empate: **Batalha das Coordenadas**, do mesmo
EF04CO01, escreve `NÍVEL ${level}` em pílula de 19 px. Dois jogos da mesma
habilidade com cabeçalhos diferentes seria o pior dos dois mundos.

Os pontos dos murais correram de 56 para 188 (a pílula termina em 152) e o
nome do mural foi de 400 para o centro da tela, longe dos dois.
