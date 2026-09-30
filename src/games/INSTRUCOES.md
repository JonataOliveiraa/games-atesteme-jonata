# Instruções Para Jogos

Este documento orienta a criação e manutenção dos jogos em `src/games`.
As regras abaixo valem para jogos novos e para ajustes em jogos existentes.

## Público

Os jogos são feitos para crianças do Ensino Fundamental I. A experiência deve
ser clara, acolhedora e fácil de entender sem explicações longas.

Priorize:

- comandos simples;
- pouco texto por tela;
- leitura fácil em celular;
- resposta imediata a cada toque;
- baixa carga cognitiva por fase.

## Começando Um Jogo Novo

Os jogos seguem o mesmo esqueleto. Comece copiando a forma, não inventando
outra — é o que faz um jogo novo parecer da mesma família e reusar tudo que já
está pronto.

```
src/games/<COMPETENCIA>/<slug>/
  index.ts            config do Phaser: 1280 × 720, as cenas
  types.ts            os tipos do jogo
  data/levels.ts      OS 3 NÍVEIS — ver "Estrutura Do Jogo"
  data/layout.ts      coordenadas, na grade de 1280 × 720
  data/theme.ts       as cores
  scenes/BootScene.ts carrega os assets e escolhe a fase inicial
  scenes/GameScene.ts o jogo
  scenes/UIScene.ts   o que fica por cima (opcional)
```

Pode sim criar arquivos extras, mas manntenha uma boa arquitetura

**A tela é 1280 × 720.** Toda coordenada do jogo é nessa grade; o
enquadramento em telas diferentes é resolvido fora, pelo `Scale.FIT`.

### Registre no catálogo, senão o jogo não existe

Sem uma entrada em `src/data/catalog.ts` o jogo não aparece na plataforma e
não pode ser embutido:

O `id` é o `NEXT_FREE_ID` do próprio `catalog.ts`, e o `NEXT_FREE_ID` anda um
logo em seguida. O id decide a rodada (`ROUNDS`, no fim do arquivo): a 3ª
rodada começa em 091.

```ts
{
  id: "091",
  slug: "caca-fonte-confiavel",
  module: "EF04CO08/caca-fonte-confiavel",   // a pasta, a partir de src/games
  skill: "EF04CO08",
  years: [4],
  status: "published",
  title: "Caça à Fonte Confiável",
  // ...capa, descrição, tags, order
}
```

### Não reescreva o que já existe

Quase tudo que um jogo precisa já está em `src/shared/`. Reimplementar é o jeito
mais rápido de sair diferente dos outros 49:

| Módulo | Para quê | Usado por |
|---|---|---|
| `loading/createLoadingScreen` | tela de carregamento | 49 |
| `level/faseInicial` | abrir na fase que a plataforma pediu | 49 |
| `hud/createLives` | a derrota: um erro, fim de jogo | 49 |
| `level/showLevelComplete` | painel de fim de nível | 48 |
| `tutorial/createTutorial` | o tutorial guiado | 47 |
| `effects/FX` | tremida, flash, espera | vários |
| `hud/createTimeBar` | barra de tempo | 7 |

**`faseInicial` não é opcional.** A plataforma manda `?stage=2` e o jogo tem que
abrir no nível 2. O valor chega pelo `registry` do Phaser, antes de qualquer
cena existir — pelo `START_GAME` seria tarde, com a cena já montada na fase 1:

```ts
// BootScene.create()
this.scene.start('GameScene', { level: faseInicial(this, 1) })
```

## Estrutura Do Jogo

Cada jogo deve ter 3 níveis.

Cada nível deve ter no máximo 5 fases, desafios, rodadas ou etapas jogáveis.
Se o conteúdo precisar de mais exemplos, distribua melhor entre os níveis ou
reduza a duração de cada interação.

Os níveis moram em `data/levels.ts`, e esse é o único lugar. Ao refazer um
jogo, reescreva esse arquivo — não crie um `casos.ts` ou `missions.ts` ao lado
dele. Dois arquivos exportando `LEVELS` na mesma pasta compilam, rodam e não
avisam nada: quem for ler depois abre o errado, e um `from '../data/levels'`
digitado por engano troca o conteúdo do jogo sem quebrar nada.

O loop principal deve ser simples e bem acabado:

1. o jogo apresenta uma situação;
2. a criança toma uma decisão ou executa uma ação;
3. o jogo responde com feedback visual e sonoro;
4. no acerto, o progresso avança; no erro, a partida termina (ver "A derrota");
5. ao concluir o nível, o jogo mostra fechamento claro e passa para o próximo.

Evite mecânicas com muitas regras simultâneas. A dificuldade deve crescer por
combinação, ritmo, quantidade ou contexto, não por confusão de interface.

Sempre faça o jogo com apenas 1 NIVEL, para teste. Avise ao usuário que fez 1 nível só para teste, e mostre o resultado. 

## Tutorial

Todo jogo deve ter um tutorial curto.

O tutorial deve explicar apenas o que a criança precisa para começar a jogar.
Prefira uma demonstração guiada, com destaque visual no elemento relevante, em
vez de blocos grandes de texto.

Regras práticas:

- no máximo 3 a 5 passos;
- frases curtas;
- exemplos visuais sempre que possível;
- botão ou ícone `?` para repetir o tutorial;
- o tutorial não deve interromper demais o ritmo depois que a criança já sabe jogar.
- vc pode adicionar tambem tutorial puramente visual com animação. sem texto algum.

## Mobile Primeiro

A maioria das partidas acontece em dispositivos móveis. Todo jogo deve ser
desenhado primeiro para toque e telas pequenas.

Cuidados obrigatórios:

- alvos de toque grandes;
- botões distantes o bastante para evitar toque acidental;
- textos legíveis sem zoom;
- fonte maior que o padrão de interfaces desktop;
- layout sem elementos importantes nas bordas extremas;
- nenhum texto cortado em telas estreitas;
- nenhuma ação essencial dependente de hover ou teclado.

Quando houver dúvida entre caber mais informação ou deixar a tela mais clara,
escolha clareza.

## Visual

Os jogos devem ser visualmente atrativos, com acabamento consistente entre si.
Eles não precisam ser idênticos, mas devem parecer parte da mesma família.

Padrões recomendados:

- painéis com volume, brilho ou reflexo de luz;
- botões com estados visuais claros: normal, pressionado, desabilitado e destaque;
- componentes com contraste forte e leitura fácil;
- verde para confirmar, correto, sim, verdadeiro ou sucesso;
- vermelho para negar, errado, não, falso, perigo ou falha;
- amarelo/laranja para alerta, atenção ou dica;
- azul/ciano para informação, foco ou seleção;
- elementos importantes com profundidade, sombra ou contorno;
- feedback visual forte para acerto, erro, bloqueio e conclusão.

Evite telas estáticas demais. Mesmo interfaces simples devem ter pequenos sinais
de vida: entrada suave dos elementos, pulso em botões importantes, brilho em
áreas interativas ou movimento leve no cenário.

## Animação

As animações devem ser bem feitas e ajudar a entender o que aconteceu.

Use animação para:

- mostrar entrada e saída de elementos;
- confirmar toque;
- indicar acerto;
- indicar erro;
- guiar o olhar da criança;
- mostrar transição de fase;
- celebrar conclusão.

Evite animações longas demais ou que atrasem repetidamente a jogabilidade.
O ideal é que o jogo pareça vivo sem ficar lento.

## Áudio

Os jogos devem ter efeitos sonoros.

No mínimo, considere sons para:

- toque em botão;
- acerto;
- erro;
- conclusão de fase;
- conclusão do jogo;
- alerta ou bloqueio importante.

Os efeitos devem ser curtos, leves e não irritantes em repetição. Sempre respeite
os mecanismos de mudo/pausa existentes no projeto.

## Texto E Legibilidade

Use textos curtos, diretos e adequados para crianças.

Regras:

- frases pequenas;
- vocabulário simples;
- tamanho de fonte maior que o padrão web comum;
- contraste alto entre texto e fundo;
- evitar parágrafos dentro do canvas;
- nunca depender apenas de cor para explicar resultado.

Quando o jogo tiver termos técnicos, explique pelo contexto visual ou com uma
frase curta.

## Anotações

Nunca coloque comentários enormes no código. Toda anotação deve ser criada num arquivo .md separado na pasta do jogo.

## Pontuação

Nunca escreva pontos, acertos, erros ou porcentagem em texto na tela.

Isso vale principalmente para o painel de fim de nível: nada de frases como
`12 decisões certas · 80 pontos`. Criança do Fundamental I não lê placar; ela
lê que ganhou ou que precisa tentar de novo, e um número solto só serve para
comparar com o colega.

O progresso e o resultado devem aparecer de forma visual:

- estrelas, selos ou medalhas;
- barra ou bolinhas de fase concluída;
- o que ela juntou, montou ou consertou, mostrado na tela;
- animação de acerto no momento em que acontece.

Pontos continuam existindo no código, porque a plataforma os recebe pelo
`runtimeGameBridge`. O que não pode é virar texto para a criança.

# Olho Infantil

Os jogos são jogados por crianças. Então apele pelo óbvio, pelo o que deve ser feito. As crianças não espera um jogo cheio de elemento visual confuso e textos, e esperando "jogue aí". Você deve fazer os jogos pensando na criança que vai jogar. O início está claro? Ao entrar no jogo, ele vai entender mais ou menos o que é pra fazer? 

Tudo isso importa muito. Deve ser priorizado o máximo possível o entendimento. Os jogos devem ser claros e concisos. Não adianta um jogo muito bem feito, mas ele é complexo, confuso, cheio de elementos visuauis estranhos ou até bugados.

## Conversa Com A Plataforma

O jogo não conhece a Atesteme. Ele só avisa o que aconteceu na partida. Quem
traduz isso em aprovado ou reprovado é a camada de embed, em
`src/pages/EmbedGamePage.tsx`. Nunca decida aprovação dentro do jogo.

Sempre use `runtimeGameBridge`. Existe um `gameBridge` parecido que só fala com
a própria página: um jogo que importa ele roda perfeito na tela e não entrega
nada para a plataforma. Nada denuncia o erro, e a criança joga sem receber nota.

```ts
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
```

### Nível é o que a plataforma chama de `stage`

Esta é a confusão mais fácil de cometer. `stage` é o número do **nível**, de 1 a
3 — não a fase, rodada ou desafio dentro do nível. Concluir o último nível é o
que aprova a criança.

Todo evento com `stage` usa o número do nível atual, começando em 1, nunca um
índice de array começando em 0.

### Declare quantos níveis o jogo tem

Sem isso a plataforma chuta 3. Hoje o chute acerta, porque todo jogo tem 3
níveis — mas é sorte, não garantia. Derive do próprio array de níveis, nunca
escreva o número na mão:

```ts
runtimeGameBridge.emit({
  type: 'GAME_COMPLETED',
  gameId: GAME_ID,
  stage: this.level.level,
  totalStages: LEVELS.length,
})
```

`LEVELS.length` continua certo se alguém mexer nos níveis; um `3` escrito na mão
vira mentira silenciosa.

### Os eventos

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, quando dá para jogar |
| `GAME_COMPLETED` | ao concluir **cada** nível, não só o último |
| `CORRECT_ANSWER` | a cada acerto real |
| `WRONG_ANSWER` | a cada erro real — e ele encerra a partida |
| `CHECKPOINT` | fim de nível ou marco de progresso |
| `GAME_OVER` | **não emita à mão** — sai do `lose()`, ver abaixo |

`WRONG_ANSWER` não é telemetria: ele anda sempre junto do `lose()`, e o `lose()`
encerra a partida. Não emita em erro de arrastar, toque fora ou tentativa
cancelada.

### A derrota: um erro, fim de jogo

Todo jogo tolera **um** erro. A criança errou uma decisão, ou o tempo acabou: a
partida termina ali. Não existe segunda chance dentro da partida, nem dica
depois de dois erros, nem "tente de novo". A segunda chance é jogar outra vez,
e quem decide quando isso é possível é a plataforma.

**O jogo não sabe que vidas existem.** Vida, bloqueio de 24 horas e desbloqueio
são da plataforma — o protótipo deste site (`src/context/GameContext.tsx`) e,
de verdade, a Atesteme. O jogo só diverte, testa a habilidade e avisa quando a
partida foi perdida.

O nome `lives` no código do jogo é histórico: é o contador de tolerância, e ele
vale sempre 1 (`shared/level/vidasIniciais.ts`). `?lives=` na URL e `lives` no
`START_GAME` são ignorados. Os corações ficam ocultos e assim permanecem.

```ts
// BootScene.preload()
preloadLives(this)

// GameScene.init()
this.livesTotal = vidasIniciais(this)
this.livesLeft = data?.lives ?? this.livesTotal

// GameScene.create() — FORA de container que sofra removeAll()
this.lives = createLives(this, {
    total: this.livesTotal,
    remaining: this.livesLeft,
    gameId: GAME_ID,
    x: 40, y: 40, size: 30,
    stage: () => this.level.level,
})
this.events.once('shutdown', () => this.lives.destroy())

// em TODO erro de decisão e no tempo esgotado, uma vez só
runtimeGameBridge.emit({
    type: 'WRONG_ANSWER',
    gameId: GAME_ID,
    stage: this.level.level,
    pointsEarned: -5,
})
this.lives.lose()
return   // a partida acabou: não avance, não reinicie, não reabra a pergunta
```

O `GAME_OVER` sai de dentro do `lose()`. Nenhum jogo o emite à mão, nem no
tempo esgotado: relógio no zero é `WRONG_ANSWER` + `lose()`, igual a qualquer
outro erro.

#### O que acontece depois do `lose()`

**O jogo tem 1,35 segundo de tela depois do `lose()`.** O `GAME_OVER` sai na
hora (o resultado não espera), e o toque é cortado no mesmo instante. A tela
espera: o jogo segue animando por `ESPERA_PARA_VER_O_ERRO_MS` (1,35 s, em
`shared/bridge/partida.ts`), e só então o Phaser congela e a plataforma cobre
o jogo — no embed entra o "Fim de jogo" e o iframe vai para `/reprove`
(`src/pages/EmbedGamePage.tsx`); na plataforma de jogos abre o modal de GAME
OVER.

Ou seja: **a cena do erro precisa caber em 1,35 segundo.** O que passar disso a
criança não vê.

Por isso:

- **a cena do erro é curta e visual.** A tremida, o estrago acontecendo, a
  opção certa acendendo de leve, uma frase de poucas palavras. Pode tocar
  antes do `lose()` (a ordem dos jogos da 3ª rodada — `garra-dos-grupos`,
  `subida-do-dia`, `balao-do-recado`: mostra, depois perde) ou logo depois
  dele, dentro do 1,35 s. Painel com texto longo ou botão "Entendi" não cabe;
- o jogo **não desenha** tela de game over, botão de tentar de novo nem
  contagem de tentativas;
- nada de `scene.restart`, próxima pergunta ou trava reabrindo depois do
  `lose()`. Logo depois dele: `if (this.lives.remaining <= 0) return`.

#### O que é erro, e o que não é

| Situação | Cobra? |
|---|---|
| escolheu a opção errada, confirmou a montagem errada | sim |
| deixou passar o que devia recusar, recusou o que devia aceitar | sim |
| o tempo acabou | sim |
| soltou o arrasto fora do alvo, tocou no vazio, errou a mira | **não** |
| toque duplo, toque durante uma animação, tentativa cancelada | **não** |
| qualquer coisa dentro do tutorial ou do treino guiado | **não** |

Erro de cabeça encerra; erro de dedo não emite nada e não chama `lose()`. Com
tolerância 1, confundir os dois reprova a criança por escorregar o dedo — então
o gesto físico precisa de trava (botão em vez de arrasto, zona de toque folgada,
bloqueio de repique), não de punição.

#### Os jeitos de quebrar a regra sem perceber

Todos abaixo foram achados em jogos prontos, na varredura de 30/09/2026
(a lista por jogo está em [VIDAS.md](./VIDAS.md)):

- **Erro tratado só com feedback.** A peça volta, a tela treme, a criança tenta
  de novo, e nada foi emitido. Se foi erro de decisão, é erro grátis.
- **Cobrar no fim da fase, e não na hora.** Somar erros num contador e só
  emitir quando a tarefa termina deixa a criança errar à vontade — e quem erra
  e não termina nunca é cobrado. O `lose()` sai no momento do erro.
- **Contador de perdão.** "O primeiro desvio não conta" não existe mais: o
  primeiro erro de decisão já encerra.
- **Fase "guiada" que não cobra.** Treino é o tutorial. Fase que pontua acerto
  também cobra erro; senão um nível inteiro fica sem derrota possível.
- **Guia em que o toque da criança é de verdade.** Se o guia espera o toque
  dela, só o alvo certo pode estar tocável — ou o toque errado é recusado sem
  `lose()`. Perder a partida no primeiro toque ensinado é o pior começo.
- **Código que segue depois do `lose()`.** Reabrir a pergunta, devolver a peça
  ou mostrar "Tente de novo" é fluxo de uma partida que já acabou. Logo depois
  do `lose()`: `if (this.lives.remaining <= 0) return`.
- **Explicação que não cabe no 1,35 segundo.** A plataforma cobre a tela 1,35 s
  depois do `lose()`: o porquê do erro que demora mais que isso nunca é visto.
  Se a cena é longa, mostre primeiro e perca depois.
- **Relógio que se perde.** Um `onTimeUp` que sai quando a tela está travada
  (tutorial do `?`, painel aberto) perde o estouro, e a fase segue sem tempo.
  Pause o relógio enquanto a tela estiver travada, e pare-o no instante em que
  a fase foi resolvida.
- **Barra de bônus com cara de prazo.** Se o relógio no zero não encerra, ele
  não pode parecer um prazo. Ou encerra, ou não é uma barra que esvazia.
- **Resposta vazia que vale como errada.** Confirmar, enviar ou lançar sem ter
  montado nada é toque prematuro: o botão fica desligado até haver o que julgar.
- **Julgar no instante de soltar.** Arrasto solto sobre o destino errado, ou
  toque único entre alvos vizinhos, encerra a partida por um escorregão. Dê um
  passo de confirmar, ou recuse o gesto sem cobrar.

O `progress` do `CHECKPOINT` é porcentagem de 0 a 100, arredondada:

```ts
progress: Math.round((concluidos / total) * 100)
```

**2. Nunca escreva `isFinalStage` no jogo.** Ele é calculado fora, comparando
`stage` com `totalStages`. Um `isFinalStage: true` fixo no código aprova a
criança no primeiro nível assim que alguém mover o emit de lugar.

**3. Nunca escreva o número do nível na mão.** `stage: 3` está certo hoje e
vira mentira no dia em que o jogo ganhar um quarto nível — a criança
terminaria o nível 3, o total seria 4, e ela nunca seria aprovada. Use
`this.level.level` para o atual e `LEVELS.length` para o total.

### Como conferir

Abra o jogo em `?embed=1&inline=1&stage=1&points=0` e jogue com o console
aberto. Se nenhum evento aparecer, o jogo está mudo.

Jogue os três níveis até o fim e confira que sai um `GAME_COMPLETED` por nível,
com `stage` 1, 2 e 3 — não só um no final.

Depois perca de propósito, uma vez de cada jeito que o jogo permite: cada tipo
de resposta errada, e o relógio até o zero. Em todos tem que sair um
`WRONG_ANSWER` seguido de um `GAME_OVER`, e o jogo tem que parar. Se a partida
continuou depois de um erro, achou um erro grátis.

## Código

O código dos jogos deve usar nomes em inglês para variáveis, funções, métodos,
classes e arquivos novos quando fizer sentido.

Use:

```ts
increaseScore()
showSuccessFeedback()
createAnswerButton()
currentLevel
remainingLives
```

Não use:

```ts
FuncaoQueAumentaOsPontos()
mostrarBotaoVerdadeiro()
faseAtualDoJogo
vidasRestantesDoJogador
```

Comentários devem ser poucos e úteis. Comente apenas quando a intenção não for
óbvia pelo nome, pela estrutura ou pelo contexto. Evite comentários que apenas
repitam o que o código já diz.

Prefira código organizado e legível a comentários longos.

## Critérios De Aceite

Antes de considerar um jogo pronto, confira:

- tem 3 níveis;
- cada nível tem no máximo 5 fases ou rodadas;
- roda bem em mobile;
- textos estão grandes e legíveis, por conta que o jogo será jogado no mobile;
- tutorial é curto;
- botões e áreas de toque são confortáveis;
- acertos, erros e conclusão têm feedback visual;
- há efeitos sonoros;
- as animações ajudam a jogabilidade;
- nenhuma tela mostra texto de pontos, acertos ou erros;
- nada de expressões. e nada de texto em inglês;
- não foram adicionados comentários desnecessários;
- está registrado em `src/data/catalog.ts`, com `module` apontando para a pasta;
- abre na fase certa com `faseInicial`, e não sempre no nível 1;
- usa os módulos de `src/shared/` em vez de reimplementar tutorial, carregamento
  ou painel de fim de nível;
- todo erro de decisão e o tempo esgotado emitem `WRONG_ANSWER` e chamam
  `lose()`, uma vez, e a partida para ali;
- erro de dedo (arrasto fora, toque no vazio, mira) não emite nem chama `lose()`;
- o jogo não desenha tela de game over nem "tentar de novo", e não emite
  `GAME_OVER` à mão;
- o jogo não lê vidas da plataforma: `vidasIniciais(this)`, sem padrão próprio;
- os níveis estão em `data/levels.ts`, e não há outro `LEVELS` na pasta;
- o jogo importa `runtimeGameBridge`, não `gameBridge`;
- `GAME_COMPLETED` sai ao fim de cada nível, com `totalStages: LEVELS.length`;
- `stage` é o número do nível, de 1 a 3, e não está escrito na mão;
- o jogo não escreve `isFinalStage` em lugar nenhum;
- não há contador de perdão: o primeiro erro de decisão encerra;
- jogou os três níveis e viu um `GAME_COMPLETED` por nível no console;
- perdeu de propósito de cada jeito possível e viu `WRONG_ANSWER` + `GAME_OVER`
  em todos.

# Importante

- Testes reais (interação, cliques, avaliação visual) é tudo pro usuário. O Claude será responsável por fazer codigos e corrigir bugs, praticando em rodadas. Fez um codigo completo corrigindo algo e adicionando algo? o usuário irá avaliar. Mecheu na interface? O usuário vai avaliar. E assim vai
- Nada de comentário no código