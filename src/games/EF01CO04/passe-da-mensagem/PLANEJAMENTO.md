# Passe da Mensagem — EF01CO04

> (EF01CO04) Reconhecer o que é a informação, que ela pode ser **armazenada**,
> **transmitida como mensagem por diversos meios** e **descrita em várias
> linguagens**.

O recado atravessa a quadra em dois passes e cai na caixa de quem está
esperando. A cada parada ele troca de meio — voz, carta, celular — e o desenho
lá dentro continua exatamente o mesmo.

Documento irmão: [TEXTURAS.md](./TEXTURAS.md).

---

## 1. A regra que manda em todo o resto: nada de leitura

Criança de 1º ano não lê frase de instrução. Então **nenhuma instrução do jogo
é texto**. O que ensina é:

| O que a criança precisa saber | Como o jogo diz, sem frase |
|---|---|
| o que é para levar | o desenho grande do recado, no painel |
| para quem é | o retrato do destinatário, no painel |
| que um leva ao outro | três setas amarelas piscando entre os dois |
| onde ela pode tocar | anel verde pulsando na base de cada alvo |
| para onde o recado vai | rastro de bolinhas correndo da bola até o alvo, com ponta de seta |
| quem tem o recado agora | holofote amarelo no chão dele |
| que o recado mudou de casca e não de conteúdo | a bola gira no lugar e vira outra casca, com o mesmo desenho dentro |
| que errou | ✕ vermelho gigante em cima de quem foi tocado |
| que era o outro | o retrato do painel pulsa; depois de 2 erros, um dedo aponta |
| quantas travessias faltam | as bolinhas de fase, embaixo da pílula do nível |
| que acertou | faíscas na chegada, o colega pula e a moldura da tela pisca em verde |
| que entregou | baforada de poeira no balde, torcida e a moldura piscando |

O único texto que sobra na tela de jogo é a **palavra do recado** (BOLO, LÁPIS,
PRESENTE, RELÓGIO) ao lado do desenho — uma palavra, não uma frase, e sempre
acompanhada da figura. Ela apoia a alfabetização em vez de exigi-la.

**Não existe faixa de instrução.** A versão anterior tinha uma barra de texto
que trocava de frase a cada etapa; era leitura obrigatória a cada toque, e saiu.

## 2. O exemplo animado, no lugar do tutorial escrito

Ao entrar no jogo roda **sempre** um **exemplo mudo de ~7 s**
(`scenes/demo.ts`): num painel com a mesma leitura do topo (recado → setas →
retrato), a bola sai de um colega, um dedo toca o segundo, ela voa, **gira e
vira outra casca na frente da criança**, o dedo toca o terceiro e ela cai no
balde levantando poeira. Um ✓ verde grande fecha a qualquer momento, e o botão
`?` reabre.

Ele **não é mais guardado** em `tutorialStorage` — abre em toda partida, a
pedido. E é o "exemplo animado 5 s (pulável)" da ficha do catálogo, o motivo de
este jogo **não usar** o `shared/tutorial/createTutorial`: aquele módulo é feito
de balões de texto.

## 3. O laço

1. o recado está com o colega de cima à esquerda; a bola flutua ao lado da cabeça dele;
2. um anel verde acende na base dos outros três colegas, e um rastro de bolinhas corre da bola até cada um;
3. um toque: a bola voa em arco (0,5 s);
4. ao chegar, ela **gira no lugar e vira outro meio** — sem painel nenhum;
5. agora os anéis e os rastros vão para os **dois baldes**; só um é o certo;
6. a bola cai no balde levantando poeira, e a bolinha da fase acende;
7. três travessias e o nível acaba.

O passo 3 se repete `passes` vezes: **duas** nos níveis 1 e 2, **três** no nível
3. O último passe é sempre a entrega no balde; os anteriores são de colega para
colega, e `targets()` decide isso por `step < passes - 1`.

## 4. Os três meios

| Meio | Como aparece | Cor |
|---|---|---|
| **Voz** | balão de fala branco com rabinho, aro ciano | ciano |
| **Carta** | envelope fechado, dobra em `V`, cartinha branca no meio | laranja |
| **Celular** | telefone com tela branca | roxo |

Nenhuma das três passa da própria caixa: sem aba para fora, sem ondinha para o
lado. É o que mantém o tamanho previsível quando a bola encosta no painel.

O desenho de dentro tem **sempre o mesmo tamanho e a mesma posição** nos três —
`ART = 0.42` do lado da casca, em `scenes/message.ts`. É essa igualdade que a
criança precisa notar; se ele encolhesse dentro do envelope, a casca passaria a
mudar o conteúdo, que é o contrário do que a habilidade diz.

Um módulo só desenha as três formas, e todo mundo bebe dele: a bola em quadra e
a bola do exemplo animado.

A roda é fixa — voz → carta → celular — e cada travessia começa uma casa
adiante, então os três meios aparecem em ordens diferentes a cada travessia.

`mediaChain(runIndex, passes)` devolve `passes + 1` cascas, girando a roda. Nos
níveis de dois passes isso dá as três cascas; no nível 3, de três passes, dá
**quatro** — e a quarta é a primeira de novo. A roda fecha, e é essa volta que
faz o nível 3 valer.

**A troca é só o giro da bola**, no lugar onde ela está: encolhe girando,
troca de casca invisível e volta girando (`spinInto`, em `scenes/ball.ts`).
Existia antes um painel `casca A = casca B` que parava a partida a cada passe;
saiu a pedido, e a prova passou a ser ver a troca acontecer.

**As cascas são desenhadas em medida relativa ao tamanho**, nunca em pixels
absolutos: a mesma função desenha a bola de 86 px em quadra e a de 78 px do
exemplo, e um `r - 14` escrito na mão vira raio negativo na menor das duas.

## 5. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`.

| Faixa | y | Conteúdo |
|---|---|---|
| Painel | 8 – 146 | nível + fases · recado · setas · destinatário · `?` |
| Quadra | 156 – 716 | 4 colegas, 2 destinatários com suas caixas |

Posições (x, y do **pé**):

| Quem | Onde |
|---|---|
| Colegas | (250, 380) · (250, 660) · (610, 380) · (610, 660) |
| Destinatários | (1090, 400) · (1090, 668) |
| Balde de cada um | `pé + (−98, −64)`, 138 × 138, sprite `balde.png` |

Personagem com 210 px de altura. A bola fica em `pé + (118, −150)`, com 86 px — ao lado da
cabeça, não no pé: passe que sai do pé parece chute, e o que este jogo faz é
**entregar**.

**Do lado do destinatário a âncora inverte**: `pé + (−98, −122)`, que é a boca
do balde. Sem isso a bola pousava do lado de fora, passando por cima de quem
deveria receber.

Zonas de toque de 240 × 250 centradas em `pé − 105`, sem encostar uma na outra.

## 6. Níveis

São **três níveis**, em [data/levels.ts](./data/levels.ts). `totalStages` sai de
`LEVELS.length`, e o número de toques de cada nível sai de `runs × passes` — não
existe nenhum número de fase escrito na mão.

| Nível | Recado | Destinatário certo | Passes | Travessias |
|---|---|---|---|---|
| 1 | o mesmo nas 3 travessias | sempre o de cima (`movingGoal: false`) | 2 | 3 |
| 2 | um diferente a cada travessia (`sameSubject: false`) | alterna (`movingGoal: true`) | 2 | 3 |
| 3 | um diferente a cada travessia | alterna | **3** | 3 |

Cada nível acrescenta **um eixo, e um só**:

- **1 → 2:** as duas pontas do painel passam a mudar a cada travessia — o
  desenho da esquerda e o rosto da direita. Só aí o retrato começa a valer: com
  o balde certo fixo, dava para acertar sem nunca olhar para ele.
- **2 → 3:** entra **uma parada a mais no caminho**. São três passes, e com
  isso a roda dos meios **fecha**: `voz → carta → celular → voz`. O recado volta
  para a casca em que começou, com o mesmo desenho dentro. É a prova mais forte
  que este jogo consegue dar da habilidade — a informação atravessou três meios,
  voltou ao primeiro e continua sendo a mesma.

São **6 toques** no nível 1, **6** no 2, **9** no 3 — **21 na partida inteira**,
que é o denominador do `CHECKPOINT`.

**O exemplo animado não repete entre níveis.** Ele abre ao *entrar no jogo*, e a
passagem do nível 1 para o 2 manda `demo: false` no `scene.restart` — quem já
viu a demonstração há vinte segundos não precisa vê-la de novo. Recomeçar do
zero ("Jogar de novo") e entrar direto num nível pela plataforma mandam
`demo: true`.

### Por que não tem robô

A ficha do catálogo tem um robô interceptador, e ele foi **removido a pedido**.
Sem ele nenhum passe entre colegas pode dar errado — então o erro do jogo é o
que a ficha guardava para o nível 3: **entregar no balde errado**. Por isso os
dois baldes existem desde o nível 1; sem eles o nível 1 não teria jogada errada
nenhuma.

No nível 1 esse erro é possível mas improvável, porque o balde certo não muda.
É o nível 2 que cobra a leitura do retrato.

## 7. O erro

Um erro só é possível: tocar na caixa errada. TRAVA no padrão do catálogo, e
**sem uma palavra**:

1. ✕ vermelho do tamanho do corpo em cima de quem foi tocado, e ele se inclina;
2. moldura vermelha piscando nas bordas da tela; a câmera treme;
3. o retrato do painel pulsa com um anel — "era este aqui";
4. **depois de 2 erros na mesma parada**, um dedo grande aponta a caixa certa.

Custa uma vida (`WRONG_ANSWER` + `lives.lose()`), e quem reprova é o
`shared/hud/createLives` no zero — nunca o jogo.

Pontos: **+10** de primeira, **+5** depois de erro. **Nenhum número na tela.**

## 8. O progresso

No canto esquerdo do painel: a pílula **NÍVEL x de y** e, embaixo dela, uma
bolinha por travessia. A bolinha entregue vira verde com um ✓ branco, com anel
e faíscas no momento em que acende.

Antes ali existia um **mural** — uma cartinha por travessia entregue, com o
desenho do recado e os três carimbos dos meios. Ele mostrava a informação
**armazenada**, que é a terceira afirmação da habilidade, mas ocupava o triplo
do espaço e foi trocado a pedido por um indicador de nível e fases. Se a
terceira afirmação precisar voltar à tela, o lugar dela é o painel de fim de
nível, não o topo.

## 9. Se for mexer, leia isto

**Este jogo não usa `FX.wait`. Use `pause()` de `scenes/timing.ts`.**

`FX.wait` marca o tempo pelo relógio da cena (`scene.time.delayedCall`), e aqui
ele **nunca resolve** — a promessa fica pendurada para sempre, o `await` do
`GameScene` não volta e o jogo congela sem uma linha no console. Foi o que
travou o passe, o que deixou o exemplo animado parado na primeira tela e o que
teria travado o erro (o `deny` da quadra também esperava por ele). `pause()`
mede o mesmo tempo com um tween num objeto de rascunho, que funciona.

Enquanto a causa não estiver resolvida no `shared/effects/FX`, **qualquer
espera nova neste jogo é `pause()`** — um `FX.wait` que entre aqui volta a
travar tudo.

**Toda animação da bola ainda passa por `settled()`** (`scenes/timing.ts`), por
um motivo diferente: um tween morto no meio **não dispara `onComplete`**, e a
promessa do `FX.to` também fica pendurada. `settled` corre a animação contra um
`pause()` um pouco mais longo, e o laço sempre segue.

**O laço do exemplo animado só começa no primeiro `update`**
(`scene.events.once(UPDATE, ...)` em `scenes/demo.ts`), nunca direto do
`create()`.

**A bola tem dois contêineres empilhados de propósito**: `pulse` respira parado,
`skin` faz a virada de casca. Eram um só, e o `FX.kill` da respiração matava a
virada no meio.

**A palavra do recado é o único texto da quadra.** Se for preciso acrescentar
alguma explicação, ela é pictograma — não frase.

**Nada de casca pode sair da própria caixa.** O envelope tinha uma aba
desenhada acima do corpo, e no colega de cima da quadra ela subia até encostar
no painel do topo. A dobra agora é uma linha `V` dentro do corpo. A mesma
regra vale para o selo de acerto, que é preso em `badgeY()` dentro da quadra.

## 10. Conversa com a plataforma

`runtimeGameBridge`, sempre. `stage` é o número do nível;
`totalStages: LEVELS.length`. `GAME_COMPLETED` sai ao fim de **cada** nível.
`GAME_OVER` nunca sai do jogo — quem emite é o `createLives`.

## 11. Registro

- pasta: `src/games/EF01CO04/passe-da-mensagem/`
- assets: `src/assets/games/EF01CO04/passe-da-mensagem/`
- slug `passe-da-mensagem`, módulo `EF01CO04/passe-da-mensagem`, ícone ⚽
- registrado em `catalog.ts`, `gameInstructions.ts` e em
  `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` de `GameDetailsPage.tsx`

| Arquivo | Responsabilidade |
|---|---|
| `data/levels.ts` | os níveis, os recados, a roda dos meios |
| `data/layout.ts` | toda coordenada, na grade de 1280 × 720 |
| `scenes/message.ts` | as três cascas, os carimbos e o retrato |
| `scenes/icons.ts` | dedo, ✕, ✓, ★, seta, chevron, selos e botão `?` |
| `scenes/court.ts` | quadra, colegas, destinatários, caixas e zonas de toque |
| `scenes/guides.ts` | o rastro de bolinhas e o anel de cada alvo |
| `scenes/ball.ts` | a bola-recado e o painel `casca = casca` |
| `scenes/header.ts` | o painel do topo, o nível e as fases |
| `scenes/demo.ts` | o exemplo animado mudo |
| `scenes/timing.ts` | `pause()` e `settled()` — as esperas do jogo |
| `scenes/edge.ts` | a moldura que pisca nas bordas |
| `scenes/GameScene.ts` | o laço, o erro e a conversa com a plataforma |
