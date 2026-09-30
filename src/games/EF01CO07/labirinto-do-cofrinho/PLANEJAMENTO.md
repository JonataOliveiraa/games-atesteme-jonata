# Labirinto do Cofrinho — planejamento

Jogo **096** (o `NEXT_FREE_ID` de hoje; confirmar no registro) · EF01CO07 ·
1º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF01CO07.md`
(a mesma que foi colada no chat em 30/09/2026, sem revisão).
Padrão: `docs/rodada-3/PADRAO-R3.md`. Modelos: `EF01CO04/balao-do-recado` e
`EF01CO05/pescaria-dos-codigos`.
A ficha é a fonte. Só muda o que o padrão e as decisões anteriores obrigam (§3).
As escolhas que eram dúvidas já estão decididas (fim do arquivo, 30/09/2026).

**O que vem das decisões anteriores:**
- só o **N1**;
- **erro de decisão = errou, perdeu** (`WRONG_ANSWER` + `lose()`);
- **erro de mira não custa nada**;
- o **objetivo aparece antes do jogo**: onde está, o que falta e para onde vai;
- **nada marca o certo**, e a pista vem do conteúdo;
- o **dedo do guia nunca manda fazer o errado**.

O N2 e o N3 da ficha estão no §12.

---

## 1. O jogo em uma frase

A **Bia** leva na mochila o **cartão dos dados dela** (nome, foto, casa e
escola). A criança **arrasta o dedo** e a Bia segue o traço por um labirinto de
jardim, **longe das ondinhas do ímã curioso**, até a clareira do **cofre**. Lá
esperam duas pessoas: **quem cuida dela** (a mãe, que se despediu dela na
abertura) e **um desconhecido simpático**. **Um toque** na pessoa certa, e o
cartão entra girando no cofre.

Há um gesto de jogo, **arrastar**, e um toque só no fim, para escolher a pessoa
(regra 4 da ficha).

## 2. A habilidade e os irmãos

> **(EF01CO07)** Conhecer as possibilidades de uso seguro das tecnologias
> computacionais para proteção dos dados pessoais e para garantir a própria
> segurança.

| O que a BNCC pede | Onde acontece |
|---|---|
| **dados pessoais** | o cartão mostra nome, foto, casa e escola, no início e no fim |
| **proteção** | o caminho: os ímãs curiosos querem o cartão, e a criança escolhe a rota que passa longe deles |
| **uso seguro / a própria segurança** | a saída: o cartão só é mostrado para quem cuida da Bia, e o desconhecido simpático pede com um sorriso |

**O teste da bolinha:** troque o cartão por uma bolinha e os ímãs por
buracos, e o jogo vira só um labirinto. O que segura o sentido é que **o ímã
copia os dados** quando pega o cartão, e que **a pessoa errada fica sabendo** da
casa e da escola da Bia (§7). O estrago mostra os dados, não um "game over".

**Irmãos com a mesma habilidade:**
- *Guardiões dos Dados* (R1): a criança lê uma situação e escolhe uma atitude.
- *Esconde-Dados* (R2): leva o cartão por uma pracinha, escondendo-o da
  lanterna do curioso, e no portão escolhe entre quem cuida e o estranho.
  ⚠ **O fim é o mesmo jogo:** cartão, cofre, duas pessoas e a pista pela fala.
  O que muda é o caminho: aqui é um **labirinto guiado pelo dedo**, com uma
  **escolha de rota**, e lá é stealth por tempo. Segue assim (decisão 3).

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | não tem título; o exemplo virou a abertura (§8) e o guia visual (§9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia visual | PADRAO-R3 |
| ímã: TRAVA (cadeado, tocar no cartão recupera, o ímã dorme 3 s, +5) | **errou, perdeu**: o ímã puxa o cartão, **copia os dados** para a barriga dele e a partida acaba. **Antes disso**, a Bia **para na borda** das ondinhas e só entra se o dedo insistir (§7) | entrar no campo é escolha de rota, não escorregão (decisão 1) |
| pessoa errada: TRAVA ("só para quem cuida de mim!") até tocar na certa | **errou, perdeu**: o desconhecido lê o cartão, e a casa e a escola aparecem no pensamento dele | decisão do usuário na Garra, na Subida, no Balão e na Pescaria |
| após 2 travas, o caminho seguro pontilha | sai | com errou, perdeu não há segunda trava |
| **crachá verde** na pessoa de confiança | **sem crachá**. Quem cuida é **a mesma pessoa da abertura**, e ela chama a Bia pelo nome: *"Oi, Bia!"*. O desconhecido não sabe o nome: *"Me mostra o cartão?"* | um símbolo que marca o certo troca a pergunta por "toque no verde"; é a lição do escudo verde do Esconde-Dados (decisão 2) |
| 3 níveis | só o **N1** (`LEVELS.length === 1`); N2 e N3 no §12 | decisão do usuário nos pilotos |
| "Sessão = 2 labirintos" | o N1 tem **2 fases**, um labirinto por fase | — |
| painel 'o que você protegeu' + balão da regra de ouro | o cartão grande com os 4 dados e o letreiro **DADOS PROTEGIDOS!**. A regra de ouro vai na mensagem do `showLevelComplete` | 1º ano: no máximo 4 palavras por vez |
| sebes do labirinto | **blocos de arbusto** (PNG) montados pelo código, célula a célula | os dois labirintos têm desenhos diferentes; um fundo pintado não serve aos dois |
| personagem (andar, parar, negar) | andar em 3 direções, parada, feliz, "ih!" e mostrando o cartão. O "negar" é do N3 | — |
| sons | sintetizados em WebAudio (passos na grama, ímã, bocejo, fanfarra do cofre) | PADRAO-R3 |
| telemetria: travas de ímã, pedido-armadilha, escolha da pessoa | `CORRECT_ANSWER` na travessia limpa e na pessoa certa; `WRONG_ANSWER` no erro | a bridge não tem esses campos |

**Como li a ficha:**
- *"puxam o cartão quando ela passa a 1 corredor de distância"*: o **campo** do
  ímã são as células de caminho **vizinhas** ao nicho dele (em cruz). O campo
  aparece o tempo todo como ondinhas no chão.
- *"N1: pessoa de confiança óbvia"*: no N1, quem cuida é quem a criança **viu
  na abertura**, e a fala dela chama a Bia pelo nome. É fácil de propósito.
- *"4 personagens de saída/meio"*: no N1 são **mãe × vizinho simpático** (fase
  1) e **pai × mascote fofa** (fase 2). A professora fica para o N2.

## 4. O laço

```
abertura: a mãe (ou o pai) se despede da Bia na entrada e vai até o cofre
· o cartão sai da mochila grande, mostra os 4 dados e volta · o cofre pulsa
        │
        ▼
   a criança encosta o dedo na Bia e arrasta · ela segue pelo caminho,
   deixando um rastro colorido (sebe não se atravessa: ela para na parede)
        │
   o próximo passo cai nas ondinhas?
   ├─ não ──► anda
   └─ sim ──► PARA NA BORDA: o cartão treme na mochila, as ondinhas crescem
              ├─ o dedo volta ──► nada aconteceu
              └─ o dedo insiste 0,6 s ──► ENTRA: o ímã puxa o cartão, copia
                 os 4 dados para a barriga dele, faz cara de bobo
                 WRONG_ANSWER + lose() → done
        │ chegou à clareira sem entrar em ondinha (CORRECT_ANSWER, +10)
        ▼
   a Bia para · as duas pessoas falam: "Oi, Bia!" / "Me mostra o cartão?"
        │ toque numa pessoa
   ┌────┴──────────────────────┐
 quem cuida                 desconhecido
 o cartão entra girando     ele lê o cartão; casa e escola aparecem no
 no cofre, que fecha        pensamento dele · a Bia faz "ih!"
 (CORRECT_ANSWER, +20)      WRONG_ANSWER + lose() → done
        │
   fase 2 (pai × mascote) ou fim: DADOS PROTEGIDOS! → showLevelComplete
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`. Estes números são o contrato.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas em (40, 40), ocultas; 2 bolinhas das fases em (120, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas |
| grade do labirinto | 11 colunas × 7 linhas de **88 px**, origem (24, 100): x 24–992, y 100–716 | célula de caminho = gramado do fundo; célula de sebe = bloco de arbusto |
| clareira | x 992–1256, y 100–716 (calçada de pedrinhas pintada no fundo) | o cofre e as duas pessoas |
| cofre | (1150, 408), ~170 px | fechado → aberto → fechado |
| pessoas | (1150, 232) e (1150, 588), ~190 px; **quem fica em cima é sorteado** | balão de fala ao lado de cada uma, à esquerda |
| Bia | ~76 px, no centro da célula em que está | o cartão pequeno brilha acima do ombro (código) |
| entrada | célula (0, 3), à esquerda | a mãe/o pai se despede ali na abertura |
| saída | célula (10, 3), à direita | abre para a clareira; a Bia para em (1040, 408) |
| cartão grande | (640, 360), ~420 × 260 | na abertura e no fim, sobre um véu |
| letreiro | (640, 170) | **DADOS PROTEGIDOS!** (código, DynaPuff) |

**Densidade.** Durante o labirinto há **1 região tocável** (a Bia, com raio de
pega de 1,3 célula) mais o `?`. Na clareira, **2 alvos** (as pessoas, com zona
de 200 × 240 cada). Nunca os dois ao mesmo tempo.

**Toque no celular:** a célula tem 88 px, cerca de 27 px reais num telefone de
390 px. O dedo não precisa caber no corredor: a Bia **anda sozinha pelo
centro do caminho** na direção do dedo (§6), e o dedo só diz para onde ir.

**Teclado:** as setas andam uma célula por toque (segurar repete a cada 180 ms,
com a mesma parada na borda das ondinhas); `1` e `2` escolhem a pessoa de cima
e a de baixo; `H` repete o guia.

## 6. Labirintos, ímãs e o andar (`data/levels.ts`)

### O mapa

Cada labirinto é uma lista de strings, 11 × 7:

| Símbolo | Célula |
|---|---|
| `#` | sebe (bloco de arbusto) |
| `.` | caminho |
| `S` | entrada (caminho) |
| `E` | saída (caminho, abre para a clareira) |
| `M` | sebe com **nicho do ímã**, virado para o caminho vizinho |

O campo **não é desenhado no mapa**: ele sai do `M` (as células de caminho em
cruz ao lado dele). Assim o dado não tem como discordar do que a criança vê.

**Fase 1 (mãe × vizinho), exemplo que passa na validação:**

```
###########
#....#....#
#.##.#.#M.#
S.##...##.E
#.##.#.##.#
#....#....#
###########
```

Há duas rotas do mesmo tamanho. A **de cima à direita** passa pelas ondinhas
do ímã em (8, 2), que cobrem (8, 1) e (9, 2). A **de baixo** é
livre. **Não há becos**: todo caminho leva a algum lugar, para a criança não
se perder. As bifurcações em (1, 3), (6, 3) e (9, 3) ficam **fora** do campo.
Quem chega por baixo em (9, 3) tem as ondinhas logo acima, e é a parada na
borda que impede um escorregão do dedo.

**Fase 2 (pai × mascote):** o espelho vertical da fase 1, com o ímã embaixo e
a entrada e a saída no mesmo lugar. A rota segura passa a ser a de cima.

### O andar da Bia (segue o traço)

- **Pegar:** o toque só vale se cair a até 1,3 célula da Bia. Longe dela, ela
  pulsa ("me pegue aqui") e nada mais acontece.
- **Seguir:** enquanto o dedo está apertado, a célula-alvo é a célula de
  caminho debaixo do dedo. A Bia anda para ela **só por células vizinhas
  abertas**, pelo centro do corredor, a até 300 px/s. Nunca pula sebe e nunca
  procura caminho sozinha (não há BFS até o dedo): se o dedo passar por cima
  de uma sebe, ela **para** na parede e espera o dedo voltar.
- **Borda das ondinhas:** se a próxima célula é de campo, ela **para na borda**,
  o cartão treme na mochila e as ondinhas crescem. Ela só entra se o dedo
  continuar **dentro do campo por 0,6 s seguidos**. Soltar ou voltar cancela, e
  nada é emitido.
- **Saída:** ao entrar em `E`, ela anda sozinha até (1040, 408), o toque do
  labirinto desliga e as pessoas acordam.
- **Rastro:** bolinhas coloridas atrás dela, sumindo em 0,8 s.

```ts
type Cell = '#' | '.' | 'S' | 'E' | 'M'
type PersonId = 'mom' | 'dad' | 'teacher' | 'neighbor' | 'mascot'

interface Person { id: PersonId; trusted: boolean; line: string }
interface MazeDef { id: string; rows: string[]; trusted: PersonId; stranger: PersonId }
interface LevelDef { level: number; mazes: MazeDef[]; edgeHoldMs: number; speed: number; trap: null }

fieldOf(maze) => as células de caminho em cruz ao lado de cada `M`
canStep(maze, from, to) => to é vizinha de from (em cruz) e não é '#'/'M'
safePath(maze) => BFS de S a E sem pisar no campo
```

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- `mazes.length === 2` (≤ 5); 11 × 7; exatamente um `S` e um `E`, nas bordas
  esquerda e direita;
- N1: **exatamente 1 `M`** por labirinto, virado para um caminho, e `trap === null`;
- existe **caminho seguro** de `S` a `E`, e **também** um caminho que passa pelo
  campo (senão o ímã não é escolha);
- N1: o caminho seguro tem no máximo 1,25 × o tamanho do mais curto (sem atalho
  tentador; ele é do N2);
- N1: **sem becos**. Toda célula de caminho, fora `S` e `E`, tem pelo menos 2
  vizinhas abertas;
- **nenhuma célula de campo é bifurcação** (3 ou mais vizinhas abertas), nem é
  `S`, `E` ou vizinha deles: a criança nunca cai no campo ao virar uma esquina;
- `trusted` é pessoa de confiança e `stranger` não é (tabela `PEOPLE`);
- **a fala de quem cuida tem o nome da Bia, e a do desconhecido nunca tem**
  (a pista mora no conteúdo);
- quem cuida e o desconhecido não se repetem entre as duas fases.

### As pessoas (`data/people.ts`)

| id | Quem | Confiança | Fala (≤ 4 palavras) |
|---|---|---|---|
| `mom` | mãe | sim | *Oi, Bia! Guarda aqui.* |
| `dad` | pai | sim | *Oi, Bia! Guarda aqui.* |
| `teacher` | professora (N2) | sim | *Oi, Bia! Guarda aqui.* |
| `neighbor` | vizinho simpático | não | *Me mostra o cartão?* |
| `mascot` | mascote fofa | não | *Me mostra o cartão?* |

## 7. O erro

São duas decisões, e as duas acabam a partida (`GameScene.lose()`, como na Garra):

**Entrar nas ondinhas** (depois da parada na borda e dos 0,6 s de insistência):
1. O ímã acorda com cara de bobo e **puxa**: o cartão sai da mochila e gruda
   nele.
2. Os 4 dados (foto, nome, casa, escola) passam do cartão para a barriga do
   ímã, um por um, com um "plim" cada: **ele copiou os seus dados**.
3. A Bia faz "ih!". `WRONG_ANSWER` + `hud.lose()`, e a cena vai para
   `done`.

**Mostrar para o desconhecido:**
1. O cartão voa para as mãos dele, e ele lê sorrindo.
2. Num balão de pensamento aparecem **a casa e a escola** da Bia: **agora ele
   sabe onde ela mora e estuda**. Quem cuida põe a mão na testa.
3. A Bia faz "ih!". `WRONG_ANSWER` + `hud.lose()`, e a cena vai para
   `done`.

Sem susto: o ímã é bobo e o desconhecido é simpático. Não há vermelho de alerta
nem som áspero. O estrago é **o dado indo embora**.

**Não é erro:**
- tocar longe da Bia;
- arrastar por cima da sebe (ela para);
- chegar na borda das ondinhas e voltar;
- tocar nas pessoas antes de a Bia chegar;
- o `?`.

**Pontos e estrelas:** +10 pela travessia limpa (`CORRECT_ANSWER` ao chegar à
clareira) e +20 pela pessoa certa (`CORRECT_ANSWER`). **3 estrelas** ao concluir,
porque concluir já significa zero erro.

**Pista que entrega (conferido):**
- as duas pessoas têm **o mesmo tamanho, o mesmo sorriso e a mesma pose de
  espera**, e nenhuma tem crachá, cor, brilho ou moldura;
- o lado (em cima ou embaixo) é sorteado a cada fase;
- a pista é o **conteúdo**: quem cuida é a pessoa que se despediu da Bia na
  entrada, e ela sabe o nome dela;
- a rota segura não é destacada: as ondinhas mostram **onde está o perigo**,
  que é o conteúdo, e nada mostra por onde ir.

## 8. Abertura, chegada e fim

**Abertura** (a cada fase, uns 4 s, sem texto):
1. A Bia está na entrada com a mãe (fase 1) ou o pai (fase 2). Os dois se
   abraçam.
2. O **cartão sai da mochila grande**, no centro: foto, **BIA** (texto do
   código), casinha e escola. Ele volta para a mochila e fica brilhando.
3. A mãe acena e **anda por fora do labirinto** (pela borda de cima) até a
   clareira. Ela para ao lado do cofre, e o cofre pulsa. Um pontilhado liga a
   Bia ao cofre por 1 s, sem passar pelo labirinto, só para dizer "é pra lá".
4. As ondinhas do ímã pulsam uma vez.

**Chegada:** a Bia entra na clareira. O **desconhecido** chega andando de fininho
e para no outro lugar. O sorteio de cima e embaixo acontece **antes** de a mãe
parar lá, e os dois lugares são idênticos. Aparecem os dois balões de fala.

**Acerto na pessoa:** o cartão sai girando da mochila, passa pela pessoa e entra
no cofre, que fecha com um "clac" e brilha. Fanfarra, e a Bia comemora.

**Fim do nível:** o cofre no centro, fechado, e em volta dele o **cartão grande
com os 4 dados**, cada um com um brilho. O letreiro **DADOS PROTEGIDOS!** salta e
cai confete. Depois vem o `showLevelComplete`, com a regra de ouro na mensagem:
*"Meus dados são meus tesouros: só mostro para quem cuida de mim."*

## 9. Guia visual (1º ano, sem texto)

É o `shared/guide/createVisualGuide`, com véu, dedo e espera pelo gesto real. A
chave no `registry` é `ef01co07-l1`. Ele roda depois da abertura da fase 1.
Usa o gesto `drag`, que já existe.

1. **O ímã** (`none`). O véu deixa aceso o ímã e as ondinhas. Um **cartão
   fantasma** (meio transparente) desliza pelo caminho ao lado e é puxado para
   o ímã, que sorri bobo, e rebobina. É a encenação do erro, e não emite nada.
2. **Demonstração** (`demo`, real). O véu abre a Bia e as 2 células à frente
   dela, que são do caminho **seguro**: o `S` sempre começa num trecho sem campo
   (validação). O dedo encosta na Bia e **arrasta** 2 células, e ela segue com o
   rastro. Esse movimento conta.
3. **A vez da criança** (`waitFor`). O dedo faz um `drag` curto **em cima da
   Bia**, sem apontar direção nenhuma, e espera até ela andar 1 célula. O dedo
   nunca aponta rota: quem escolhe o caminho é a criança.

O guia da clareira fica **sem dedo**: os dois balões aparecem e a criança toca.
O dedo passeando pelas duas pessoas apontaria o toque, mas não a escolha, e já
seria uma dica a mais. No `?`, o véu acende as duas pessoas e repete as falas.

O `?` no labirinto pausa e repete os passos 1 e 2 (a demonstração com um
fantasma da Bia, que não move a Bia de verdade).

**Dá para entender o objetivo sem ler?** Sim. A abertura mostra o cartão (o
que proteger), o cofre e a mãe indo para lá (para onde levar), e o guia mostra
o ímã pegando o cartão (do que fugir) e o dedo levando a Bia (como andar).

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| andar | a Bia anda na direção certa, rastro colorido | passinhos na grama (ruído curto filtrado) |
| parede | ela para e balança de leve | nada |
| borda das ondinhas | ela para, o cartão treme, as ondinhas crescem | zumbido baixo do ímã, subindo |
| ímã pega | o cartão voa e gruda; os dados passam para o ímã | "vuuump" + 4 plins |
| clareira | o desconhecido chega, os balões abrem | sininho |
| pessoa certa | o cartão gira até o cofre, "clac", brilho | fanfarra do cofre |
| pessoa errada | ele lê; casa e escola no pensamento | duas notas descendo, macias |
| ímã no fim da fase | boceja e dorme (enfeite, na festa) | bocejo |
| fim | cartão grande, letreiro, confete | acorde |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · walk · edge · arrive · choose · vault · done · panel`.
O arrasto só vale em `walk` e `edge`, e o toque nas pessoas só em `choose`.
`startMaze` faz `++gen`, e todo `await` é seguido de `if (gen !== this.gen) return`.

A borda é um estado (`edge`) com relógio próprio: entra quando o próximo passo é
de campo, e o relógio corre só enquanto o dedo está numa célula de campo. Ao
chegar a 0,6 s vira `lose('magnet')`, e se o dedo sai volta para `walk`.

A bridge segue a Garra: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` na travessia e na pessoa certa, `WRONG_ANSWER` no erro,
`CHECKPOINT` com `progress = round(fasesFeitas / 2 × 100)`,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START/PAUSE/RESUME. O jogo nunca emite `GAME_OVER` e nunca
escreve `isFinalStage`.

## 12. Depois do N1 (a ficha, pronta para quando vier)

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **o caminho curto nem sempre é o seguro** | 2 ímãs, e um **atalho** bem mais curto que passa pelo campo de um deles (o seguro fica até 2 × maior). Na saída, **professora × vizinho**: a professora não se despediu na abertura, a Bia a conhece da escola (a abertura mostra a escola no cartão, e a professora na janela dela) |
| 3 | **dizer não a um pedido fofo** | 3 ímãs, e a **mascote no meio do labirinto** oferecendo uma figurinha pelo cartão (*"Me mostra? Te dou isso!"*). A ficha pede um botão **NÃO**. Com um gesto só, a proposta é **passar direto por ela arrastando** (o NÃO é seguir andando), e mostrar é tocar nela. Decido quando o N3 entrar |

### Como ficou (30/09/2026)

**N2, o atalho.** Dois labirintos com um corredor reto no meio, de S a E (10
passos), e **2 ímãs** pendurados sobre ele. As rotas seguras dão a volta por
cima ou por baixo (14 passos). Com o alcance de 4 casas, tocar lá na frente no
corredor faz o caminho sair lilás e a Bia parar na borda: o atalho mostra o
perigo sozinho. A validação exige, com `shortcut: true`, que o caminho mais
curto passe pelo campo e que o seguro tenha no máximo o dobro.
- Fase A: **professora × vizinho**. A professora faz a abertura (se despede e
  vai ao cofre) e diz *"Oi, Bia! Sou a prô."*. **Falta a arte dela**: até a
  `professora.png` chegar (§ "Pedido de arte" no TEXTURAS), ela aparece
  desenhada em código.
- Fase B: mãe × mascote.

**N3, o pedido no caminho.** Os mapas do N2 com uma **casinha `T`** ao lado
de uma passagem obrigatória. Na fase A ela fica embaixo da passagem antes da
saída, com a mascote; na fase B, embaixo da passagem logo depois da entrada,
com o vizinho. Quem pede nunca é o desconhecido da saída da mesma fase.
- Ao chegar à passagem, a Bia para, a pessoa mostra a **figurinha** e diz
  *"Psiu, menina! Me dá seu cartão? Te dou uma figurinha!"*.
- **Tocar em qualquer outro lugar = NÃO**: a Bia balança a cabeça, segue para o
  lugar tocado, e quem pediu fica chateado (`CORRECT_ANSWER`, +10).
- **Tocar na pessoa = mostrar**: o cartão vai para a mão dela, a casa e a
  escola aparecem no pensamento, e a partida termina (`WRONG_ANSWER` +
  `lose()`).
- O toque só vale depois de a fala terminar de ser escrita.
- **Ficaram 2 ímãs, e não 3.** Com o nicho do ímã abrindo só para baixo (a
  arte), um 3º ímã sempre criava beco ou fechava a rota segura. O assunto do N3
  é o pedido, e o terceiro ímã não mudaria a lição.

A validação cobre: o número de ímãs por nível, o atalho (N2 e N3), nenhum beco
em nenhum nível, e o pedido só no N3 e em todo labirinto do N3. Ela também
confere que a casinha fica ao lado de uma passagem obrigatória e longe do
campo, e que quem pede não é de confiança e não sabe o nome da Bia.

## 13. Arquivos, texturas e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts` (mapas, `fieldOf`, `canStep`, `safePath`, validação), `data/people.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (andar, borda, erro, escolha) | `data/layout.ts`, `data/theme.ts`, `scenes/maze.ts` (blocos de sebe, ondinhas), `bia.ts` (andar, rastro, cartão no ombro), `magnet.ts`, `people.ts` (pessoas e balões), `vault.ts`, `card.ts` (cartão grande), `intro.ts`, `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi de figurinha**; prompts no
[TEXTURAS.md](./TEXTURAS.md); decisão 4):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-jardim.png` | 1280 × 720 | gramado visto de cima, a moldura de flores e a clareira de pedrinhas à direita |
| `sebes.png` | 4 × 2, 128 | blocos de arbusto (4 variações), o nicho do ímã, 3 enfeites |
| `bia.png` | 4 × 3, 256 | a Bia de cima em ¾: andar de frente, de costas e de lado (2 quadros cada), parada, feliz, "ih!", mostrando o cartão, 2 livres |
| `pessoas.png` | 4 × 2, 320 | mãe, pai, vizinho, mascote: esperando e reagindo |
| `pecas.png` | 4 × 3, 256 | ímã (3 estados), cartão vazio, foto da Bia, casinha, escola, figurinha (N3), cofre fechado e aberto, 1 livre, dedo |
| `cover-labirinto-do-cofrinho.png` | 1672 × 941 | capa **com o título** |

**Código:** as ondinhas (arcos concêntricos), o rastro, o cartão montado (moldura
+ foto + **BIA** + casinha + escola), os balões de fala e de pensamento, o
pontilhado da abertura, o letreiro, o confete, as bolinhas, o `?`.
**Antes da arte:** quadrados verdes nas sebes e círculos nas pessoas, só para
testar. Isso nunca é a entrega.

**Registro:** id = `NEXT_FREE_ID` no commit (hoje **096**), que avança um. O slug
é `labirinto-do-cofrinho`, entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, ganha
3 frases em `gameInstructions.ts` e `public/og/labirinto-do-cofrinho.jpg`. A
categoria é **Cultura Digital**.

## 14. Travas para quem mexer depois

- O campo **sempre** sai do `M`. Nunca desenhe ondinhas à mão nem guarde o
  campo no mapa.
- Nenhuma célula de campo pode ser esquina de decisão, nem vizinha da entrada
  ou da saída (validação). É isso que faz a entrada no campo ser escolha.
- A borda das ondinhas **para** a Bia antes de ela entrar. Não tire essa parada:
  sem ela, um escorregão do dedo vira derrota.
- A Bia acha o caminho só **dentro do alcance** (`reach`, 4 casas) e prefere o
  lado seguro. Se o único caminho passa pelas ondinhas, ela **para na borda** e
  só entra com um segundo toque, dado depois de ela parar (`edgeHoldMs`). Não
  tire esse segundo toque: sem ele, tocar do outro lado das ondinhas já seria
  derrota.
- Quem cuida se distingue **só** pelo conteúdo (a abertura e o nome na fala).
  Nada de crachá, cor, brilho ou lado fixo.
- `trap` (a mascote no meio, do N3) é dado do nível, não `if` na cena.

## Decisões (30/09/2026)

O usuário mandou decidir, com uma régua só: *"o jogo deve ser simples e claro,
pq são crianças do primeiro ano escolar jogando"*. Cada escolha abaixo passa
por ela.

1. **Ímã = errou, perdeu**, com a **parada na borda**. É uma regra só para os
   dois erros ("pegaram seus dados, acabou"), sem cadeado, sem recuperar e sem
   ímã dormindo, que eram três coisas a mais para aprender. A parada na borda
   é invisível como regra: a criança só vê a Bia parar antes das ondinhas, e
   isso já diz "cuidado". Todo erro é `WRONG_ANSWER` + `lose()`, uma vez
   (a tolerância é 1 erro, `vidasIniciais`).
2. **Sem crachá verde.** Quem cuida é a pessoa que a criança **viu se despedir
   da Bia** na abertura, e ela **chama a Bia pelo nome**. É a leitura mais
   simples que não entrega a resposta por cor.
3. **O fim fica como na ficha**, mesmo parecido com o Esconde-Dados. Mudar o
   fim seria inventar mecânica. A diferença que importa para a criança está no
   caminho: o labirinto no dedo.
4. **Estilo: chibi de figurinha (`19`)**, o padrão da rodada, como o TEXTURAS
   já está.

**Simplificações que entraram junto:**
- o labirinto do N1 **não tem becos**: todo caminho leva a algum lugar
  (validação);
- saíram o cadeado e a recuperação do cartão (o `lock` do `pecas.png` virou
  célula vazia);
- as duas rotas do N1 têm o mesmo tamanho: a única diferença entre elas é o
  ímã.

## Histórico

- **30/09/2026.** Primeiro planejamento, a partir da ficha original, com as
  decisões e as lições do Balão e da Pescaria aplicadas. A Máquina dos
  Ajudantes (EF01CO06) foi pulada porque você mandou esta ficha.
- **30/09/2026, decisões.** As 4 dúvidas foram decididas pela régua "simples e
  claro para o 1º ano" (acima). O mapa de exemplo perdeu os becos.
- **30/09/2026, código do N1.** O id é **097**: a Máquina dos Ajudantes ficou
  com o 096, e o `NEXT_FREE_ID` foi para 098. O que mudou em relação ao plano:
  - **Falas.** O usuário pediu que ficasse claro quem é suspeito. Quem cuida
    diz o nome da Bia e quem é: *"Oi, Bia! Sou a mamãe. Guarda no cofre!"*. O
    desconhecido não sabe o nome e pede o que não se pede: *"Psiu, menina! Me
    dá seu cartão? É segredo!"* (o vizinho) e *"… Te dou um doce!"* (a
    mascote). A pista continua sendo só o conteúdo, sem crachá, cor ou lado fixo.
  - **Balão.** Ele cresce com o texto enquanto a fala é escrita (letra a
    letra), com a ponta presa na boca de quem fala. Se passar da borda
    esquerda, ele encolhe.
  - **Ímã.** O nicho da `sebes.png` abre só para baixo, então o ímã fica numa
    sebe acima do corredor nas duas fases: na fase 1 ele está na borda de cima,
    em (8, 0), e o campo é só (8, 1). A validação exige o nicho virado para
    baixo.
  - **Arte medida.** O `bg-jardim` chegou com 1672 × 941 e é escalado para
    1280 × 720. `pessoas` e `sebes` vieram em células de 256, e não de 320 e
    128. A `sebes.png` tem 1023 px de largura, então os quadros são cortados na
    mão no `BootScene`. A clareira do fundo fica em x ≈ 940–1263, e o cofre e as
    pessoas foram para x = 1110.
  - **Ainda em Graphics:** o ímã, o cartão, o cofre e o dedo do guia, porque a
    `pecas.png` não chegou. A capa também falta.
- **30/09/2026, peças, animação e celular.**
  - A `pecas.png` chegou com 1448 × 1086 (células de 362), e as peças passam
    da linha da grade. Os quadros são cortados pelas caixas medidas
    (`PIECE_BOX` em `data/files.ts`), não pela grade. A ponta do dedo fica em
    (30, 16) no quadro `hand`.
  - A Bia agora tem 104 px e uma luz amarela pulsando sob os pés. O passo é
    medido pela distância andada, não pelo relógio: troca de quadro a cada 24
    px, com um pulinho, um balanço de 5° e poeirinha a cada passo. As pessoas
    andam balançando.
  - **Celular.** O toque vale em qualquer lugar do labirinto, e não só em cima
    da Bia: ela anda na direção do dedo, sempre pelo corredor. Deitado, o
    telefone mostra o jogo com 667 × 375 px, e cada casa fica com uns 46 px.
    A parada na borda das ondinhas continua exigindo o dedo 0,6 s no campo.
- **30/09/2026, abertura em close.** A mãe (ou o pai) aparecia por baixo do
  sprite da Bia. Agora a câmera aproxima 2× os dois na entrada, lado a lado e
  frente a frente, com os pés na mesma linha. O abraço e o cartão acontecem ali,
  com o cartão flutuando ao lado deles, e o cartãozinho do ombro some enquanto
  isso. Depois a câmera se afasta e a pessoa vai para o cofre. O HUD some
  durante o close (`scenes/camera.ts`).
- **30/09/2026, a escolha em foco.** Quando a Bia chega, a câmera aproxima
  1,2× na clareira, enquanto o desconhecido entra. Na hora de escolher:
  - aparece o texto **"Escolha a pessoa confiável"** (pedido do usuário);
  - **as duas pessoas** ganham o mesmo sinal amarelo de "dá para tocar": um
    anel nos pés e uma setinha ao lado. O sinal é igual nas duas, então não
    entrega a resposta; a pista continua sendo só a fala.
  - O HUD tem câmera própria (`createUiCamera`), então o `?` continua visível e
    tocável no zoom. O `?` da clareira agora repete as duas falas ali mesmo, sem
    véu. Depois do cofre, a câmera volta a 1× antes das bolinhas comemorarem.
  - O HUD se esconde no fim do nível, porque a câmera dele desenha por cima do
    painel.
- **30/09/2026, andar tocando (estilo MMORPG).** Pedido do usuário: *"clica,
  tem o indicador e o caminho tomado, com limite de alcance"*. O arrasto saiu
  (o §6 "O andar da Bia" descreve a versão antiga):
  - com a Bia parada, as casas a até **4 passos** ficam acesas;
  - tocar numa casa acesa põe um **marcador amarelo** nela e desenha o
    **caminho pontilhado**, e ela anda por ele (os pontos somem conforme ela
    passa). Segurar e arrastar muda o destino;
  - tocar longe demais, ou numa sebe, mostra um **X** e ela não anda;
  - o caminho **prefere o lado seguro** quando há um dentro do alcance. Se o
    único caminho passa pelas ondinhas, os pontinhos ficam lilás ali, e ela
    **para na borda**. Um segundo toque, dado pelo menos 0,6 s depois de ela
    parar, faz ela entrar. Tocar em outro lugar faz ela voltar;
  - no guia, o dedo **toca** duas casas à frente, e o treino acende só a área
    alcançável, sem dedo;
  - setas do teclado: uma casa por toque, com a mesma borda.
  - **Depois (mesmo dia), mais visível**, a pedido do usuário (*"aparece uma
    linha... com limite de alcance claro"*):
    - o caminho virou uma **linha contínua** branca com contorno, que cresce
      da Bia até o destino em 0,26 s, sai dos pés dela e encurta enquanto ela
      anda. No trecho das ondinhas a linha é lilás;
    - o alcance ganhou um **contorno amarelo pulsando** em volta da área toda,
      com as casas acesas por dentro. Tocar fora faz o contorno piscar junto
      com o X.
