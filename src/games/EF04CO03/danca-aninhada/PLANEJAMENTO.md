# Dança Aninhada — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)  
Briefing recebido: [1.md](../../../assets/games/EF04CO03/danca-aninhada/1.md)

**EF04CO03 · 4º ano · Pensamento Computacional · Algoritmos com repetições simples e aninhadas**

> **Ajuste do briefing:** permanecem a dança, a música, os movimentos e as molduras que mostram o laço de fora e o de dentro. Saem o toque no tempo, a janela de 0,9 s, o aumento de BPM como dificuldade e a pergunta-relâmpago como prova principal. A criança agora **cria um roteiro pictográfico**, toca em **DANÇAR** e vê o dançarino **simular** o algoritmo. O erro de ritmo mediria reflexo; montar e testar os laços mede a habilidade.

---

## 1. Habilidade e evidência

> **(EF04CO03) Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências e repetições simples e aninhadas (iterações definidas e indefinidas), para resolver problemas de forma independente e em colaboração.**

Objeto: **Algoritmos com repetições simples e aninhadas**.

> Imaginando que alguém quer lavar as janelas de um prédio com 10 andares e 20 janelas por andar. A pessoas pode lavar as 20 janelas de um andar, e depois ir para o próximo andar (até chegar ao último andar). Este é um algoritmo que envolve uma repetição aninhada: A pessoa vai repetir 10 vezes a tarefa de lavar 20 janelas, que por sua vez, repete 20 vezes a tarefa de lavar uma janela.

No jogo, a criança cria um algoritmo em uma ficha de coreografia: escolhe movimentos, a ordem deles, quantas vezes repetir o bloco interno e quantas vezes repetir o bloco externo — ou a condição que encerra o bloco externo. O botão **DANÇAR** executa a ficha sem novos comandos da criança. Durante a execução, os blocos se acendem e seus contadores avançam. É possível ver se a dança corresponde ao pedido.

**Teste da bolinha.** No briefing, se os marcadores de movimento virassem bolinhas, bastaria tocar no tempo: o jogo continuaria igual. Nesta versão, retirar `REPITA`, `ATÉ`, os limites dos blocos ou a ordem dos movimentos impede montar a coreografia. Os movimentos poderiam até ser símbolos abstratos; para esta habilidade, o significado pedagógico está na **estrutura e execução do algoritmo**, não no nome do passo.

**Independência e colaboração.** A interação é individual e não exige dupla para funcionar. Em aula, dois alunos podem decidir juntos o roteiro antes do toque em DANÇAR e explicar por que o laço interno reinicia; isso não cria multiplayer nem exige cadastro.

---

## 2. Diferença para o jogo irmão

Há um jogo publicado para EF04CO03: [Prédio dos Laços](../predio-dos-lacos/). Ele programa a limpeza de janelas usando quantidade de andares e janelas por andar.

| Prédio dos Laços | Dança Aninhada |
|---|---|
| ajusta contadores para cobrir uma grade espacial | compõe uma **sequência ordenada de movimentos** |
| laço externo percorre andares; interno percorre janelas | laço externo percorre **refrões**; interno repete um movimento dentro de cada refrão |
| a prova é limpar tudo sem sobrar | a prova é executar a **ordem e agrupamento** do pedido |
| `ATÉ O TOPO` termina pelo espaço | `ATÉ A LUZ APAGAR` termina por um **sinal que muda durante a música** |
| números são a edição principal | movimentos, ordem, números e condição são editáveis |

Não usar janelas, quadrículas ou limpeza na dança. O irmão ensina repetição sobre uma matriz; este jogo ensina **coreografia como programa** e mostra a execução de uma sequência.

---

## 3. O jogo em uma frase

**Monte a coreografia com passos e blocos REPITA; aperte DANÇAR para descobrir se o dançarino faz o pedido do palco.**

Gênero: **quebra-cabeça musical de programação visual**. A música marca a simulação; a criança não precisa tocar no ritmo.

**Fase = um pedido de coreografia e uma ficha que deve ser criada e testada.** São três fases por nível, nove no planejamento. O primeiro corte implementa **somente o nível 1**, para teste do usuário.

---

## 4. O laço jogável

~~~text
PEDIDO APARECE EM PICTOGRAMAS AGRUPADOS
→ exemplo: dois refrões; em cada um, dois PASSOS e uma PALMA

A CRIANÇA MONTA A FICHA
→ toca num espaço vazio ou já preenchido da ficha
→ toca numa das opções grandes da bandeja
→ pode revisar qualquer espaço antes de dançar

TOCA EM DANÇAR
→ o algoritmo é simulado, não só comparado com um gabarito
→ o laço de dentro se acende a cada movimento e reinicia em cada refrão
→ o laço de fora avança ao terminar um refrão

SE CORRESPONDE AO PEDIDO
→ o palco acende uma parte do cenário; passa à próxima ficha

SE DIVERGE
→ pausa na primeira diferença, mostra pedido e execução lado a lado
→ destaca o espaço da ficha responsável; só a correção destrava
~~~

**Um gesto: tocar.** Não há arraste, segurar, teclado obrigatório, precisão temporal nem pergunta extra depois da apresentação. `DANÇAR` só fica ativo quando todos os espaços visíveis estão preenchidos. Antes de tocar nele, escolhas e cancelamentos não custam vida.

### Exemplo concreto do aninhamento

Pedido visual: **2 refrões**, cada um com **PASSO, PASSO, PALMA**. A criança constrói:

~~~text
REPITA 2 VEZES                 ← laço de fora: refrões
    REPITA 2 VEZES             ← laço de dentro: passos
        PASSO
    PALMA                      ← depois do laço de dentro
~~~

A dança executada é `PASSO, PASSO, PALMA | PASSO, PASSO, PALMA`. Ao começar o segundo refrão, o contador interno volta ao início. A barra vertical separa os refrões no pedido e na reprise; não é um comando adicional.

---

## 5. Tela fixa e leitura no celular

`1280 × 720`, `Phaser.Scale.FIT`, coordenadas centralizadas em `data/layout.ts`. Não recompor a tela em retrato: no celular de 390 px a escala aproximada é **0,30**. Reservar uma área calma para a ficha; o cenário não pode cobrir os blocos.

| Faixa | y lógico | Conteúdo | Alvo/tamanho lógico | No celular |
|---|---:|---|---:|---:|
| cabeçalho | 0–88 | vidas, três marcas de fase, mudo, `?` | `?` 136 × 136 de hitbox no canto direito | ~41 × 41 px |
| pedido | 96–198, x 40–1100 | tiras de movimentos agrupadas em refrões; frase curta | cada pictograma 116 × 88 | ~35 × 26 px; leitura reforçada por rótulo de 42 px |
| palco | 212–514, x 36–488 | dançarino, luz de parada e demonstração | dançarino até 220 px de altura | ~66 px |
| ficha | 212–514, x 514–1242 | bloco externo e, quando houver, bloco interno | espaço editável mínimo 150 × 136 | ~45 × 41 px |
| bandeja | 536–708, x 40–1020 | até três opções para **o espaço selecionado** | cada opção 302 × 142 | ~91 × 43 px |
| executar | 536–708, x 1040–1240 | botão `DANÇAR` | 190 × 142 | ~57 × 43 px |

Fonte mínima: 42 px lógicos em rótulos essenciais (~13 px físicos); opções 48 px (~14 px); pedido 42 px. A ficha nunca mostra mais de **dois níveis de moldura**. No N1 só a externa aparece. No N2/N3, a externa azul-clara envolve a interna âmbar; cada uma tem título escrito, não se explica só pela cor.

Os cartões de opção **não ficam todos na tela ao mesmo tempo**: tocar em `movimento`, `repetições`, `fim` ou `movimento final` troca a bandeja para até três escolhas daquele espaço. O espaço ativo tem contorno ciano e uma pequena seta. Nenhum alvo invisível amplia para regiões sem desenho.

A hitbox do `?` pode avançar até y 136 para atingir ~41 px físicos, mas fica à direita de x 1120; o pedido termina em x 1100 e não passa sob ela.

---

## 6. O que a criança vê e escolhe

O pedido mostra **o resultado desejado**, não o algoritmo pronto. Nos níveis definidos, os movimentos aparecem em tiras separadas por refrão. A criança vê quantas tiras existem e quantos passos iguais há em cada uma; precisa transformar isso em blocos.

| Espaço da ficha | Opções possíveis | Função |
|---|---|---|
| `REPITA __ VEZES` externo | 2, 3, 4 | quantidade de refrões; só N1/N2 |
| `REPITA __ VEZES` interno | 2, 3, 4 | quantidade do movimento dentro de cada refrão; N2/N3 |
| `MOVIMENTO` | PASSO, PALMA, GIRO | ação dentro do laço |
| `DEPOIS` | PASSO, PALMA, GIRO | ação após o laço interno e antes da próxima volta externa |
| `REPITA ATÉ __` | LUZ APAGAR, LUZ ACENDER | condição de fim; só N3 |

Os espaços sem uso em determinada fase **não aparecem**. `PASSO`, `PALMA` e `GIRO` têm pictograma, palavra e pequena animação de prévia ao selecionar. Os números não aparecem como resposta colorida no pedido: são inferidos pela contagem dos pictogramas. Para editar, toca-se o espaço, depois a nova opção. O botão `DANÇAR` testa a ficha atual.

Na repetição **indefinida**, o pedido não informa quantos refrões haverá: **“Dance até a luz apagar.”** A luz começa acesa e apaga ao fim de um refrão; o algoritmo testa a condição **após** cada refrão completo. A quantidade de refrões executada varia entre apresentações, sem mudar o programa. Não há contador escondido que o jogador precise adivinhar.

---

## 7. Níveis e nove fases planejadas

As fases e sinais ficam só em `data/levels.ts`. Os movimentos de cada tira são dados, nunca um campo booleano `correct` em uma opção.

### Nível 1 — um laço simples

Começa com demonstração guiada e uma moldura. São escolhas pequenas, mas a criança cria o roteiro antes de vê-lo dançado.

| Fase | Pedido pictográfico | Ficha a construir | O que cresce |
|---|---|---|---|
| 1.1 | PASSO, PASSO, PASSO | `REPITA 3 VEZES [PASSO]` | escolhe ação e número |
| 1.2 | PALMA, PALMA, PALMA, PALMA | `REPITA 4 VEZES [PALMA]` | mesmo laço, outra ação e quantidade |
| 1.3 | PASSO, PALMA `|` PASSO, PALMA | `REPITA 2 VEZES [PASSO, PALMA]` | **sequência de duas ações** dentro do laço |

Na fase 1.3, a ficha externa tem dois espaços de movimento em ordem. A opção de repetir não cria `PALMA, PASSO` por conta própria; a criança decide cada posição.

### Nível 2 — laço dentro de laço

O pedido passa a ter **refrões**. O último movimento de cada refrão ocorre **fora** do laço interno, mas ainda **dentro** do externo. Na execução, a faixa do refrão avança apenas depois dele.

| Fase | Pedido | Ficha a construir | Sequência executada |
|---|---|---|---|
| 2.1 | 2 refrões: 2 PASSOS e 1 PALMA em cada | `2 × [2 × [PASSO], PALMA]` | P,P,Pa `|` P,P,Pa |
| 2.2 | 3 refrões: 2 PALMAS e 1 GIRO em cada | `3 × [2 × [PALMA], GIRO]` | Pa,Pa,G `|` Pa,Pa,G `|` Pa,Pa,G |
| 2.3 | 2 refrões: 3 PASSOS e 1 PALMA em cada | `2 × [3 × [PASSO], PALMA]` | P,P,P,Pa `|` P,P,P,Pa |

As tiras do pedido têm uma pequena separação **depois** da ação final. Isso deixa visível o agrupamento do refrão sem entregar as molduras do algoritmo. Usar `PASSO` por extenso na interface; as abreviações da última coluna são somente notação deste documento.

### Nível 3 — repetir até o sinal

A moldura externa troca o número por uma **condição**. O palco usa uma lâmpada grande com estados ACESA/APAGADA escritos; a troca é visível e sonora. Para demonstrar que o número não está no algoritmo, cada fase roda a **mesma ficha duas vezes**, com a lâmpada apagando depois de quantidades diferentes de refrões. A reprise é curta e automática; a criança não remonta a ficha entre as duas.

| Fase | Pedido | Ficha a construir | Ensaios automáticos |
|---|---|---|---|
| 3.1 | PASSO até a luz apagar | `REPITA ATÉ LUZ APAGAR [PASSO]` | sinal após 2 e depois 4 passos |
| 3.2 | a cada refrão, 2 PASSOS e 1 PALMA; até apagar | `REPITA ATÉ LUZ APAGAR [2 × [PASSO], PALMA]` | sinal após 2 e depois 3 refrões |
| 3.3 | a cada refrão, 2 PALMAS e 1 GIRO; até apagar | `REPITA ATÉ LUZ APAGAR [2 × [PALMA], GIRO]` | sinal após 3 e depois 2 refrões |

`ATÉ LUZ ACENDER` é distrator plausível: a luz já começa acesa, então esse algoritmo encerra depois do primeiro refrão, antes do sinal de parada pretendido. Nenhuma fase depende de velocidade de leitura. Um limite técnico de seis refrões protege contra laço sem fim; se ele for atingido, a cena para com feedback, nunca congela.

---

## 8. Regra em dados e simulação

Modelar a ficha como **árvore de comandos**, não como string decorativa. Uma repetição contém outra repetição ou ações; o N3 substitui o número do laço externo por uma condição. A ordem é parte do resultado.

~~~ts
type Move = 'step' | 'clap' | 'spin'
type Command =
  | { kind: 'move'; move: Move }
  | { kind: 'repeat'; times: number; body: Command[] }
  | { kind: 'repeatUntil'; signal: 'lightOff' | 'lightOn'; body: Command[] }

interface DanceRequest {
  id: string
  visiblePhrases?: Move[][]
  untilSignal?: 'lightOff'
  signalAfterPhrases?: [number, number]
}

function simulate(commands: Command[], signalPlan?: number): Move[] {
  // Executar a árvore na ordem; avaliar repeatUntil ao fim de cada volta.
  // Registrar também os limites dos blocos para iluminar a ficha no replay.
  return []
}

function solves(request: DanceRequest, program: Command): boolean {
  // N1/N2: comparar sequência E limites dos refrões do pedido.
  // N3: rodar o mesmo programa para os dois planos de sinal;
  // exigir parada no primeiro fim de refrão após a luz apagar.
  return false
}
~~~

O trecho acima é **pseudocódigo de contrato**, não implementação pronta. A função real deve ter limite de comandos/voltas, produzir um traço com `outerIteration`, `innerIteration`, `move`, `signal` e `stopped`, e ser testável sem animação. `GameScene` apenas anima esse traço. Uma mudança de nível ou pausa não pode alterar o resultado lógico do programa.

Validação de `LEVELS` ao carregar: três níveis, três fases cada; até dois níveis de repetição; no máximo doze movimentos por ensaio visível; toda fase tem solução; sem opção idêntica duplicada na bandeja; sequência do pedido e solução simulada coincidem; N3 tem dois planos de sinal diferentes; nenhum comando pode produzir execução infinita.

---

## 9. Erro, TRAVA e vidas

**Erro conceitual** é apertar DANÇAR com uma ficha completa que diverge do pedido. Erro de dedo é tocar fora, selecionar outro espaço, abrir `?` ou rever uma opção antes de dançar — não perde vida.

1. A simulação para **na primeira diferença**: movimento errado, repetição que acabou cedo, movimento a mais ou parada na condição errada.
2. Aparecem lado a lado o pictograma esperado e o movimento que saiu. A moldura/parte relevante da ficha ganha borda âmbar e cadeado desenhado por código. A frase é específica: “Neste refrão faltou um passo” ou “A luz ainda está acesa; o laço não deve parar”.
3. Apenas o espaço pertinente pode ser editado durante a TRAVA. Corrigi-lo destrava a ficha; a criança toca DANÇAR novamente para conferir. Outros campos mantêm seu valor.
4. Após duas tentativas incorretas **nesse mesmo espaço**, a opção correta pulsa. Não acelerar a música, encolher janela de toque ou punir demora.

Emitir `WRONG_ANSWER` e descontar **uma vida apenas na primeira execução conceitualmente errada da fase**; retries guiados dessa fase não descontam mais vida. `createLives` emite `GAME_OVER` no zero; o jogo não o emite manualmente. No acerto, `CORRECT_ANSWER` sai **uma vez por fase resolvida**, não uma vez por passo animado. A ajuda não corrige o programa automaticamente.

Um programa errado não fica rodando até o fim para, depois, mostrar “errado”: parar na primeira divergência é a evidência. No N3, o primeiro ensaio precisa estar correto antes do segundo iniciar; o segundo demonstra a mesma regra com outra duração.

---

## 10. Pontuação, progresso e fechamento

Cada fase concluída vale internamente +10 sem TRAVA ou +5 após TRAVA, máximo 90 nos nove pedidos. Estrelas do catálogo seguem os limiares 90/70. **Não mostrar pontos, porcentagens, contagem de acertos ou erros em texto.** O HUD mostra três marcas de fase por nível; cada coreografia concluída acende uma marca.

Fim de fase: reprise rápida, de até 4 s, com molduras acendendo na ordem. Fim de nível: três pequenos cartões com os roteiros criados e o dançarino faz uma pose final. No N3, a reprise mostra a **mesma ficha** interrompida por duas durações distintas da luz. Síntese curta: **“O bloco de dentro repete movimentos. O de fora repete o refrão — ou espera a luz apagar.”**

Telemetria local/agregada: primeiro espaço corrigido, confusão entre laço externo/interno, escolha da condição, uso de `?`, conclusão dos dois ensaios do N3. Não coletar voz, nome, imagem ou movimentos reais da criança.

---

## 11. Feedback visual e áudio

| Momento | Visual | WebAudio |
|---|---|---|
| selecionar espaço | espaço afunda e volta; bandeja troca | clique leve |
| escolher opção | cartão salta para a ficha; texto/pictograma entra | encaixe curto |
| começar ensaio | stage escurece em torno do dançarino; ficha fica legível | contagem suave de dois pulsos |
| passo/palma/giro | pose e pictograma correspondente; bloco interno pulsa | três timbres curtos distintos |
| fechar laço interno | contador interno zera para a próxima volta/refrão | nota ascendente discreta |
| fechar refrão externo | faixa do pedido ganha selo; contador externo avança | acorde curto |
| luz apaga | lâmpada muda de desenho e texto; dança termina **após** o refrão | click-off suave |
| erro | pausa, primeira diferença destacada; cadeado e dica | som neutro sem susto |
| concluir fase | foco no algoritmo criado, depois pose final | acorde de conclusão |

Um relógio único controla som e poses, para não descolar ritmo e animação. A música é **acompanhamento**, não critério de acerto; tempo por movimento fixo e confortável (~500 ms), opção de pular a reprise, sem BPM crescente. Pausar em `?` interrompe ambos e retoma do mesmo ponto. Respeitar `mute-audio` do `EventBus`. Todo sinal sonoro tem equivalente visual.

---

## 12. Tutorial e clareza de entrada

Exemplo animado de até 5 s, pulável, usa uma ficha de treino `2 × [PASSO]` e **não** conta como fase. Em seguida, tutorial de quatro passos:

1. “Veja os movimentos pedidos.” — destaca a tira do pedido.
2. “Toque num espaço da ficha.” — destaca o primeiro vazio.
3. “Escolha uma opção.” — mostra a bandeja.
4. “Toque DANÇAR para testar.” — mostra o botão e um pequeno ensaio.

Nos níveis 2 e 3, mostrar só a novidade: **“O laço de dentro reinicia em cada refrão”** e **“ATÉ para quando a luz apagar”**, respectivamente. O `?` fica sempre visível, pausa jogo/áudio/tweens e reabre a demonstração. Nada de parágrafos dentro do canvas.

---

## 13. Antes da arte existir

O jogo deve funcionar sem PNG: palco plano em `Graphics`, dançarino como boneco simples de círculos/linhas com rótulo **DANÇARINO**, movimentos como pictogramas vetoriais e palavras, molduras e cartões em `Graphics`/`Phaser.Text`. Texturas opcionais entram via `import.meta.glob`; import estático para imagem ainda inexistente quebra o build.

Planejar três imagens: fundo do palco, folha do dançarino e capa. **Molduras, números, cartões, lâmpada, luz, estrelas, efeitos, setas, botões e pictogramas de comando não são texturas.** Ver contratos e prompts em [TEXTURAS.md](./TEXTURAS.md). Produzir a capa por último.

---

## 14. Arquitetura, registro e produção

~~~text
src/games/EF04CO03/danca-aninhada/
├── PLANEJAMENTO.md
├── TEXTURAS.md
├── index.ts
├── types.ts
├── data/
│   ├── levels.ts
│   ├── layout.ts
│   └── theme.ts
└── scenes/
    ├── BootScene.ts
    ├── GameScene.ts
    ├── drawStage.ts
    ├── drawRequest.ts
    ├── drawProgram.ts
    ├── drawOptions.ts
    └── audio.ts
~~~

`data/levels.ts` é o único lugar com `LEVELS` e regras/dados de fase. `GameScene` orquestra, os módulos desenham. `index.ts`: `1280 × 720` e `Scale.FIT`. Reusar `createLoadingScreen`, `faseInicial`, `createLives`, `createTutorial`, `showLevelComplete` e `runtimeGameBridge`. `BootScene` usa `faseInicial(this, 1)` para atender `?stage=`.

Eventos: `GAME_READY` quando interativo; `CORRECT_ANSWER` ao resolver pedido; `WRONG_ANSWER` no primeiro erro conceitual da fase; `CHECKPOINT` no avanço; `GAME_COMPLETED` ao fim **de cada nível**, com `stage: this.level.level` e `totalStages: LEVELS.length`. Não escrever `isFinalStage`. Vidas restantes atravessam `scene.restart`; não emitir `GAME_OVER` manualmente.

Registro futuro, só quando houver protótipo: `src/data/catalog.ts` com slug `danca-aninhada`, module `EF04CO03/danca-aninhada`, skill `EF04CO03`, ano 4, status inicial `draft`; `src/data/gameInstructions.ts`; `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` quando houver tela própria. Não tocar no jogo publicado `predio-dos-lacos`.

**Primeiro corte: somente N1**, três pedidos, editor simples, botão DANÇAR, simulação, feedback, TRAVA, vidas, `?`, mudo e conclusão do nível. O usuário faz o teste real. Só depois entram o aninhamento N2, o sinal indefinido N3 e a arte final. Conferir `npx tsc --noEmit`, ESLint da pasta e a emissão de eventos quando o código existir; este documento **não** afirma que esses testes já ocorreram.

---

## 15. Critérios de aceite

### Pedagogia

- [ ] a criança escolhe movimentos/ordem e completa um roteiro **antes** da execução;
- [ ] `REPITA` simples produz a sequência pedida no N1;
- [ ] N2 mostra e executa um laço **dentro** de outro, com reinício visível do interno;
- [ ] N3 para por condição que muda durante a execução, sem número pré-fixado no programa;
- [ ] a simulação, não uma pergunta posterior, prova o roteiro;
- [ ] trocar o roteiro muda de verdade a dança.

### Criança e interface

- [ ] entrada clara: pedido → ficha → opções → DANÇAR;
- [ ] só toque, sem reflexo, arraste ou tempo limite;
- [ ] no máximo três opções grandes por espaço;
- [ ] pedido e ficha permanecem legíveis durante a execução;
- [ ] erro aponta a primeira diferença e tem saída;
- [ ] `?` acessível e pausa sincronizada;
- [ ] nenhum ponto, porcentagem ou expressão em inglês aparece no canvas;
- [ ] áudio tem mudo e equivalente visual.

### Escopo

- [ ] três níveis × três fases **planejados**;
- [ ] somente N1 implementado antes de teste do usuário;
- [ ] jogo jogável sem textura;
- [ ] capa só após validar a tela real;
- [ ] eventos, vidas e `stage` seguem os módulos compartilhados.

## 16. Decisão

**Dança Aninhada deixa de ser um jogo de acertar batidas e passa a ser um jogo de criar e simular coreografias.** A música continua dando personalidade, mas a habilidade EF04CO03 é a própria ação da criança: construir uma sequência, colocar uma repetição dentro de outra e observar quando um laço termina por número ou por condição.
