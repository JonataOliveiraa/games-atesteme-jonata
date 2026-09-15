# Pista Binária — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF04CO04 · 4º ano · Mundo Digital · Codificação da informação**

> **Revisão 5 (15/09/2026) — nível TEM fase, e o cabeçalho existe.** Faltavam as
> duas coisas mais básicas do catálogo: o jogo tinha níveis de uma entrega só, e
> o cabeçalho tinha um `?` num campo vazio. Agora cada nível tem **fases** (2, 3
> e 2), e o cabeçalho é o dos outros 49 — pílula do NÍVEL, bolinhas das FASES, o
> que fazer no meio, vidas e `?`. As bolinhas viraram o **álbum**: cada entrega
> concluída acende uma, e no fim do nível a nave leva as figurinhas embora.
>
> **Revisão 4 (15/09/2026) — os três níveis.** Entram o nível 2 (gatinho, fila
> mais rápida) e o nível 3, com **grade 6 × 6** — 36 pedaços em vez de 25. E a
> animação do fim foi refeita: a figurinha sai da máquina, a nave volta, **o
> desenho entra pela escotilha** e ela arranca com ele.
>
> **Revisão 3 (15/09/2026) — o tiro.** A revisão 2 tinha câmara para carregar,
> uma caixa por vez e escala de brinquedo. Agora **tocar É atirar**: a nave
> dispara o dígito, uma FILA de caixas vem vindo, e tudo encolheu para caber a
> fila na tela. No fim, o desenho sai da máquina como figurinha de papel e a
> nave leva embora.
>
> **Revisão 2 (15/09/2026) — o corte.** A revisão 1 tinha caderno, fita de
> dígitos, tablet, escudo, linha de luz, blocos lacrados e frases de trava:
> nove coisas na tela e texto em quase todas. Esta versão guarda a ideia e joga
> o resto fora. **Três coisas na tela, dois botões enormes, e nenhuma frase.**
> A arte anterior (as cinco texturas da pasta) foi descartada: entra um conjunto
> novo, com estilo próprio — ver [TEXTURAS.md](./TEXTURAS.md).

---

## 1. O jogo em três regras

1. **Uma FILA de caixas vem vindo. Dentro de cada uma: um quadrado CHEIO ou um BURACO VAZIO.**
2. **Toque no botão igual: `1` cheio ou `0` vazio — e a nave ATIRA aquele dígito.**
3. **O dígito certo abre a caixa, e o quadradinho vira um pedaço do desenho na máquina.**

Não existe mais nada para aprender, do primeiro ao último nível.

~~~text
┌──────────────────────────────────────────────────────────┐
│ ♥♥♥                                                  ?   │
│                                                          │
│  ┌────────┐                                              │
│  │MÁQUINA │   nave ➜  ①→        ▣      ▣      ▣   ← a fila│
│  │o desenho│                                             │
│  └────────┘                                              │
│                                                          │
│     ┌──────────┐              ┌──────────┐               │
│     │  ███  1  │              │  ▢    0  │               │
│     └──────────┘              └──────────┘               │
└──────────────────────────────────────────────────────────┘
~~~

**O botão é igual ao que está dentro do bloco.** A criança não traduz nada na
cabeça na primeira vez: ela acha na tela o desenho que acabou de ver chegando.
O `1` e o `0` estão ali do lado, e é assim que eles entram — de carona numa
forma que ela já entendeu.

---

## 2. A habilidade, e o teste que ela precisa passar

> **(EF04CO04)** Entender que para guardar, manipular e transmitir dados deve-se
> codificá-los de alguma forma que seja compreendida pela máquina (formato
> digital).
>
> Objeto: **Codificação da informação**. Exemplo oficial: a tabela ASCII.

O exemplo oficial é ASCII, e o ASCII já tem jogo publicado nesta habilidade
(§3). A frase é maior que o exemplo: fala em **guardar, manipular e transmitir**.
Este jogo fica com o verbo que o irmão não usa — **transmitir**.

| A frase oficial | Onde está no jogo |
|---|---|
| **dados** | um desenho de 5 × 5 quadradinhos |
| **codificá-los** | cada quadradinho vira `1` (cheio) ou `0` (vazio) |
| **compreendida pela máquina** | só existem dois botões; não há terceira opção |
| **transmitir** | os pedaços saem um a um, **em ordem**, e a máquina remonta |
| **formato digital** | no fim, o desenho aparece inteiro, feito só de cheios e vazios |

### O teste da bolinha

> Troque os quadradinhos por bolinhas coloridas sem significado. O jogo muda?

**Muda e acaba.** Sem desenho não há o que enviar e a máquina não monta nada no
fim. O conteúdo não enfeita o bloco: ele é a origem de todo bit e é o prêmio.

**O briefing falhava aqui.** Com o código `1 0 1 1` escrito no topo e os trilhos
rotulados `1` e `0`, bastava trocar os dígitos por ● e ▲ e o jogo seria o mesmo:
copiar um símbolo para o trilho com o mesmo símbolo. Nada é codificado quando o
código já está pronto na tela. **A correção: o código sai do topo e vira o
desenho que a máquina monta.**

### O que mudou em relação ao briefing

| Briefing | Aqui | Por quê |
|---|---|---|
| dois trilhos; tocar alterna entre eles | dois botões enormes, parados no lugar | alternar exige lembrar onde se está; o botão mostra a escolha |
| o código em dígitos grandes no topo | não existe código na tela antes da resposta | é o que faz a criança codificar |
| figurinhas com códigos arbitrários | o código **é** o desenho | código arbitrário é senha, não codificação |
| portões de 2 s; perder o tempo é erro | o bloco **para e espera** se nada foi tocado | dedo lento não é erro de cabeça |
| nível 3 "chuva": memorizar o código | nível 3 é o mesmo jogo, mais rápido, e a criança escolhe o desenho | memorizar não é a habilidade |
| robô decodificador no fim da pista | a máquina, sempre visível à esquerda | ela precisa ver o desenho crescendo |

---

## 3. Como isso não vira o jogo irmão

| | O que já faz | O que este faz |
|---|---|---|
| **Tradutor da Máquina** (EF04CO04) | letra → número ASCII → sete chaves, com tabela sempre visível | nenhuma letra, nenhum número, nenhuma tabela |
| **Ateliê de Códigos Digitais** (EF04CO05) | grade parada na mesa: escolhe na legenda, toca a célula, corrige à vontade | a criança **nunca pinta**. Ela envia, um pedaço por vez, **na ordem** |

Restrições que valem para a implementação: **nada de legenda de tintas**, **nada
de tabela letra ↔ código**, **a grade da máquina não é tocável** (é consequência,
não mesa de trabalho) e **a ordem é visível** — o desenho enche da esquerda para
a direita, de cima para baixo.

---

## 4. O laço

~~~text
A FILA VEM VINDO         (várias caixas, sempre na mesma altura)
→ em cada uma: quadrado CHEIO ou BURACO VAZIO

A CRIANÇA TOCA UM BOTÃO
→ a nave ATIRA aquele dígito na hora, na caixa da frente
→ o tiro cruza a tela em um quarto de segundo

O DÍGITO BATE
     ↳ certo : a caixa se abre, o pedaço voa para a máquina, a fila anda
     ↳ errado: TRAVA — a fila inteira para e o botão certo pulsa

NINGUÉM ATIROU
→ a caixa da frente encosta e a fila ENGARRAFA atrás dela.
  Sem erro, sem custo: a pressa é a fila crescendo, não um relógio.

25 PEDAÇOS
→ a máquina remonta o desenho, ele vira FIGURINHA de papel
  e a nave leva embora
~~~

Um tiro por vez. Enquanto o dígito está no ar, os botões não disparam de novo —
é o que impede a criança de varrer os dois botões e acertar por sorte.

---

## 5. Controle — dois botões, e nada mais

| Alvo | O que faz |
|---|---|
| botão **cheio `1`** | atira o dígito 1 |
| botão **vazio `0`** | atira o dígito 0 |
| `?` | pausa e repete o tutorial |

Não existe carregar, mirar nem esperar: **tocar é atirar**. No computador,
**↑/W/1** e **↓/S/0** fazem o mesmo. **Nada de arrastar**, nada de zona de toque
fora do desenho do botão, nada que dependa de pontaria.

---

## 6. A grade: 1280 × 720

`Phaser.Scale.FIT`, coordenada absoluta em `data/layout.ts`. A última coluna é o
tamanho real num celular de 390 px (fator **0,30**).

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| cabeçalho | 0–92 | pílula do nível (20), bolinhas de fase (188+), título (660), vidas (1020), `?` (1206) | alvo 136 × 136 | 41 × 41 |
| cena | 100–420 | a máquina, a nave e a fila | — | — |
| — máquina | x 12–324, y 98–410 | 312 × 312; célula de **26** no 5 × 5, 21 no 6 × 6 | célula 26 | 7,8 |
| — nave | centro (420, 330) | 276 × 184, apontando para a direita | 276 | 83 |
| — fila | nasce em x 1360, encosta em x 660, vão de 232 | caixa 152; **quadradinho 76** | 76 | **23** |
| botões | 556–688 | cheio `1` em x 160–480; vazio `0` em x 800–1120 | **320 × 132** | **96 × 40** |

Quatro medidas que não se negociam:

- **O quadradinho dentro da caixa tem 76 px** (23 reais). É o que a criança lê
  antes de cada tiro, e é cheio-contra-buraco: forma, não cor.
- **Os botões têm 320 × 132 e 320 px de vão entre eles.** São o único gesto do
  jogo, e o vão é o que impede o toque trocado com o polegar.
- **A forma dentro do botão é igual à forma dentro da caixa.** É a instrução do
  jogo inteiro, e ela é desenhada, não escrita.
- **A grade da máquina mostra as 25 vagas vazias desde o começo.** Sem elas a
  tela é um retângulo preto e o progresso fica invisível no objeto que É o
  progresso — foi o primeiro conserto do teste no navegador.

---

## 7. Níveis e fases

**Fase = uma entrega: um desenho inteiro atravessando o túnel.** O nível acaba
quando todas as fases dele estão entregues.

| Nível | Fases | Grade | Pedaços por fase | Fila | O que cresce |
|---|---|---|---|---|---|
| **1** | 2 (casa, estrela) | 5 × 5 | 25 | 170 px/s | conhecer o jogo |
| **2** | 3 (gatinho, árvore, peixe) | 5 × 5 | 25 | 215 px/s | o ritmo, e mais uma entrega |
| **3** | 2 (foguete, robô) | **6 × 6** | **36** | 250 px/s | a mensagem maior |

A mecânica não muda uma vírgula do primeiro ao último: o que cresce é o tamanho
da mensagem, a quantidade de entregas e a velocidade da fila — dificuldade por
**ritmo e quantidade**, que é o que o `INSTRUCOES.md` autoriza, e não por
interface nova. Nenhum nível passa de 5 fases.

**Cada nível vale 30 pontos**, dividido pelas fases dele: 15 no nível de duas,
10 no de três. Os três fecham os **90** da ficha do catálogo — e continuam
fechando se alguém acrescentar ou tirar uma fase.

### O cabeçalho, no padrão da família

~~~text
[NÍVEL 1]  ●●        Envie o desenho              ♥♥♥        ( ? )
~~~

Pílula do nível à esquerda, **uma bolinha por fase** ao lado, o que fazer no
meio, vidas e `?` à direita — a mesma ordem do Canhão das Coordenadas e do
Cofre dos Registros. As bolinhas não são enfeite: são o **álbum**. Ao fim de
cada fase a figurinha voa da máquina para a bolinha e ela acende com o desenho
dentro; no fim do nível, elas saem de lá e entram na nave.

O `?` tem alvo de 136 px, bem maior que o desenho: `?` pequeno num canto é o
alvo que dedo de criança mais erra.

### Os desenhos

~~~text
  N1  casa            estrela
      0 0 1 0 0       0 0 1 0 0
      0 1 1 1 0       1 1 1 1 1
      1 1 1 1 1       0 1 1 1 0
      1 1 0 1 1       0 1 0 1 0
      1 1 0 1 1       1 1 0 1 1

  N2  gatinho         árvore          peixe
      1 0 0 0 1       0 0 1 0 0       0 0 0 1 0
      1 1 1 1 1       0 1 1 1 0       0 1 1 1 1
      1 0 1 0 1       1 1 1 1 1       1 1 1 1 1
      1 1 1 1 1       0 0 1 0 0       0 1 1 1 1
      0 1 0 1 0       0 0 1 0 0       0 0 0 1 0

  N3  foguete             robô
      0 0 1 1 0 0         0 1 1 1 1 0
      0 1 1 1 1 0         1 0 1 1 0 1
      0 1 1 1 1 0         1 1 1 1 1 1
      0 1 1 1 1 0         0 1 1 1 1 0
      1 1 1 1 1 1         0 1 0 0 1 0
      0 1 0 0 1 0         1 1 0 0 1 1
~~~

Validação ao carregar: o nível tem de 1 a 5 fases; todas as fases do nível usam
a mesma grade, quadrada, de 5 ou 6; e cada desenho tem entre **35 % e 72 %** dos
quadradinhos cheios — menos que isso some no fundo, mais vira bloco de tinta.

---

## 8. A regra, em código

O bloco não guarda a resposta: ele pergunta ao desenho onde está.

~~~ts
type Bit = 0 | 1

interface Level {
    level: number
    title: string           // vira o titulo do painel de fim de nivel
    art: Bit[][]            // 5 x 5
    blockEvery: number      // ms entre blocos
    pick?: Bit[][][]        // so no N3: as duas opcoes de desenho
}

/** O que este pedaço vale. Sai do desenho, não do bloco. */
const expectedBit = (art: Bit[][], row: number, col: number): Bit => art[row][col]

/** O veredito, no instante do disparo. */
const solves = (loaded: Bit | null, art: Bit[][], row: number, col: number) =>
    loaded !== null && loaded === expectedBit(art, row, col)

const rowDone   = (col: number) => col >= 5
const levelDone = (row: number) => row >= 5
~~~

**O disparo julga o botão aceso, não a posição da nave** — guardar o veredito na
posição de um sprite em movimento é a armadilha nº 3 do
[PISTA.md](../../EF02CO05/corrida-do-cotidiano/PISTA.md): a criança toca 200 ms
antes, o tween ainda está no ar, e o jogo julga o estado errado com a decisão
certa.

**O encontro é testado por intervalo** (`prevX > STOP_X >= x`) com uma flag
`resolved` no bloco, nunca por igualdade, e `dt` é limitado a 50 ms — um quadro
longo (aba trocada, breakpoint) pularia a decisão inteira.

---

## 9. O erro — e nenhuma frase

Raio errado:

1. A caixa **treme e fica âmbar — e continua ABERTA**; a fila inteira para
   (flag de fase, **nunca** `scene.pause()`, que mataria tween, pulso e toque).
2. A moldura da tela pisca vermelha uma vez, nas bordas.
3. A caixa **não se fecha**: o que a criança precisa olhar depois do erro é
   justamente o quadradinho dela.
4. **O botão certo pulsa**, já na primeira vez. São duas opções e não há frase
   para ler: esconder a saída aqui seria só teimosia.
5. Atirar o dígito certo abre a caixa e a fila volta a andar. Sem limite de
   tentativas.

O que a trava **não** pode ser:

- **Demorar não trava.** Ninguém atirar não é resposta errada: a caixa encosta
  e a fila engarrafa atrás dela. Não custa vida, não emite nada.
- **Ignorar não é responder.** Sem tiro a fila não anda; a linha só avança com
  uma decisão.
- **Nenhum estado sem saída.** São dois botões: o que não foi é sempre o certo.

### Contabilidade

- **`WRONG_ANSWER` + `lives.lose()` uma vez por linha**, no primeiro erro
  daquela linha. Os seguintes na mesma linha não custam outra vida.
- **`CORRECT_ANSWER` uma vez por linha**: **+6** sem trava, **+3** com. Quinze
  linhas fecham **90**, o valor da ficha do catálogo. Estrelas 90/70.
- **Não são erro:** trocar de botão, apagar, deixar o bloco esperar, abrir o `?`.
- `createLives` decide o `GAME_OVER` no zero. O jogo nunca o emite.
- O contador de travas **zera no começo de cada linha**.

**Não há relógio.** O bloco que espera na proa é a garantia de que a velocidade
dá ritmo, nunca pressão.

---

## 10. Feedback — tudo desenhado, nada escrito

| Momento | Visual | Som |
|---|---|---|
| tocar no botão | ele afunda, pisca amarelo, e a nave dá um coice | nota **aguda** no `1`, **grave** no `0` |
| o tiro | um dígito de papel **girando** cruza a tela em ~0,25 s | estalo curto |
| caixa entrando | entra pela boca do túnel e ocupa seu lugar na fila | — |
| **certo** | faísca no impacto, a caixa se **desmancha em estilhaços de papel**, e o pedaço voa **em arco** até a célula, que pisca ao receber | blip (agudo para 1, grave para 0) |
| acertos seguidos | o brilho do disparo cresce a cada acerto | a nota sobe um degrau |
| **errado** | o dígito **bate e volta**, girando e caindo; moldura vermelha, caixa âmbar tremendo, fila parada, botão certo chamando | grave curto, **não alarme** |
| linha completa | a linha inteira da máquina pisca uma vez | acorde curto |
| **fim do nível** | a máquina cresce até o meio da tela e o desenho se remonta **pedaço por pedaço** | os 25 bits tocam como melodia |
| **fim de fase** | a máquina dá um pulo, a figurinha sai como papel e **voa para a bolinha** do cabeçalho, que acende com o desenho dentro | papel raspando + gole |
| **fim de nível** | a nave volta e as figurinhas **saem das bolinhas** e entram pela escotilha, uma a uma | papel, gole, fanfarra |
| **o arranque** | a nave dá um coice, estica e some para a direita com o desenho dentro | sopro grave subindo |
| painel | `showLevelComplete`, título curto, bolinhas de nível | fanfarra `[523, 659, 784, 1047]` |

O "uau" é o penúltimo: **os 25 sons que a criança produziu viram uma melodia
enquanto o desenho se monta.** Sai de graça, e é a prova de que aquilo era uma
mensagem.

Tudo em WebAudio, sem arquivo, respeitando `mute-audio`; tudo com equivalente
visual; nenhuma narração. O pulso do túnel sai do **mesmo relógio** que move os
blocos. E o brilho do disparo **não pode cobrir o bloco**.

---

## 11. Tutorial — para ver, não para ler

Antes do primeiro bloco, **uma demonstração muda de 5 s**: um bloco cheio entra,
uma mão-fantasma toca o botão `1`, a nave dispara, o pedaço voa e acende na
máquina. Depois a mesma coisa com um bloco vazio e o `0`. Sem uma palavra.

Em seguida, `createTutorial` com **dois passos de três palavras**, ponteiro
`tap`, recorte em cada botão:

1. *"Cheio é 1."*
2. *"Vazio é 0."*

**São as únicas seis palavras da tela de jogo.** O `?` repete a demonstração e os
dois passos. Nos níveis 2 e 3 não há passo novo: o jogo é o mesmo.

---

## 12. Antes da arte existir

Reserva em `Graphics` para tudo, no tamanho final: a nave vira uma cápsula com
bico à direita, o bloco vira uma moldura quadrada de 200 com o furo de 110, a
máquina vira um retângulo escuro com a grade, o túnel vira um gradiente com
arcos correndo. As texturas entram por `import.meta.glob` + `textures.exists()`,
nunca por `import` estático.

**O jogo tem de ser jogável com zero textura carregada.** Botões, formas, proa,
raio, pixels, moldura, cadeado, estrelas e todo painel são `Graphics` — mudam de
estado a cada quadro, e um PNG não muda.

---

## 13. Arquitetura

~~~text
src/games/EF04CO04/pista-binaria/
├── PLANEJAMENTO.md · TEXTURAS.md
├── index.ts          1280 × 720, Scale.FIT + CENTER_BOTH, [BootScene, GameScene]
├── types.ts          Bit, PhaseDef, LevelDef, Mode
├── data/
│   ├── layout.ts     as coordenadas do §6, com o porquê dos números
│   ├── theme.ts      cores, fontes, tamanhos
│   └── levels.ts     LEVELS + as funções puras do §8
└── scenes/
    ├── BootScene.ts  import.meta.glob + createLoadingScreen + faseInicial
    ├── GameScene.ts  orquestra e não desenha nada
    ├── tunnel.ts     o fundo e os arcos correndo
    ├── ship.ts       a nave, a proa carregada e o disparo
    ├── blocks.ts     o bloco: nascimento, voo, conversão e trava
    ├── machine.ts    a máquina, a grade e a remontagem do fim
    ├── controls.ts   os dois botões e o teclado
    ├── effects.ts    painters puros e FX locais
    └── audio.ts      WebAudio direto
~~~

**A `GameScene` não desenha.** Todo `createX` devolve `{ container, ...métodos,
destroy() }`.

~~~ts
type Phase = 'voando' | 'esperando' | 'disparando' | 'travado' | 'linhaFeita' | 'remontando' | 'pausado'
~~~

Cuidados que já custaram caro em jogo de corrida deste projeto: `dt` limitado a
50 ms; encontro por intervalo + flag `resolved`; congelar com flag `running` e
nunca `scene.pause()`; os arcos do túnel são uma lista de `x` que recicla,
**nunca** `tileSprite`; o quadradinho que voa vive no mesmo `Container` do bloco;
as zonas de toque dos botões são **zonas soltas de cena**, criadas na posição
definitiva, destruídas na mão no `destroy()`; `gen` protege todo `await`.

Reusar sem reimplementar: `createLoadingScreen`, `faseInicial`, `vidasIniciais`,
`createLives`, `createTutorial`, `showLevelComplete`, `FX`, `runtimeGameBridge`.
`LEVELS` mora só em `data/levels.ts`.

### A conversa com a plataforma

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, na primeira linha |
| `CORRECT_ANSWER` | uma vez por linha concluída |
| `WRONG_ANSWER` | no primeiro erro de cada linha |
| `CHECKPOINT` | a cada linha, `progress: Math.round(linhas / 15 * 100)` |
| `GAME_COMPLETED` | ao fim de **cada** nível, `stage: this.level.level`, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca à mão — é do `createLives` |

`stage` vem de `this.level.level`. Nunca escrever `isFinalStage`. O saldo de
vidas atravessa o `scene.restart` (`lives: this.livesLeft`).

---

## 14. Registro

| Onde | O que |
|---|---|
| `src/data/catalog.ts` | já existe (id `071`, order 265, `points: 90`, ícone 🚀, `draft`). **Falta o `thumbnail`** |
| `src/data/gameInstructions.ts` | **reescrever**: as linhas atuais descrevem a versão com caderno e fita. Três linhas bastam |
| `src/pages/GameDetailsPage.tsx` | acrescentar `pista-binaria` ao `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` |
| `src/assets/games/EF04CO04/pista-binaria/` | **as cinco texturas antigas saem**; entra o conjunto novo |

---

## 15. Produção, e o que ficou de fora

Os três níveis estão construídos e jogados. O que não entrou, de propósito:

- **a caixa lacrada** (o quadro fechado do `bloco.png`) continua sem uso no
  jogo: era a ideia de "sinal perdido" do nível 3, e o 6 × 6 já dá o degrau de
  dificuldade sem inventar uma regra nova;
- **nenhuma palavra nova na tela**: as seis do tutorial continuam sendo o texto
  inteiro do jogo.

---

## 16. Critérios de aceite

### É simples

- [ ] a tela tem **três** coisas: a máquina, o bloco que vem e os dois botões;
- [ ] existe **um** gesto: tocar num botão;
- [ ] a forma no botão é igual à forma no bloco, no mesmo tamanho;
- [ ] a tela de jogo tem **seis palavras**, e nenhuma frase;
- [ ] nada muda de interface do nível 1 ao 3;
- [ ] uma criança que entra sem ler nada acerta o primeiro bloco.

### É justo

- [ ] sem escolha, o bloco **espera**, e isso não custa nada;
- [ ] trocar de botão é ilimitado e grátis;
- [ ] no erro, o botão certo pulsa na primeira vez;
- [ ] uma vida por linha, no máximo, e o contador zera a cada linha;
- [ ] nenhum ponto, porcentagem ou contagem em texto na tela;
- [ ] o jogo roda inteiro sem nenhum PNG carregado.

### BNCC

- [ ] o código nunca aparece antes de a criança produzi-lo;
- [ ] cada pedaço sai de um desenho de verdade;
- [ ] os pedaços saem **em ordem**, e a ordem é visível na máquina;
- [ ] o fim do nível mostra o desenho remontado pedaço por pedaço;
- [ ] nenhuma tabela de letras e nenhuma legenda de tintas.

### Antes de dizer que está pronto

- [ ] `npx tsc --noEmit` limpo para os arquivos do jogo;
- [ ] `npx eslint src/games/EF04CO04/pista-binaria` limpo;
- [ ] uma linha inteira jogada no navegador, e a TRAVA vista acontecendo;
- [ ] mudo funciona; `?` repete a demonstração; retomada por `?stage=2`;
- [ ] `?embed=1&inline=1&stage=1&points=0&lives=3` com o console aberto: um
      `GAME_COMPLETED` por nível;
- [ ] nenhum gancho de depuração sobrou (`window.__algo`).

---

## 17. O que mudou na construção

### Revisão 5 — nível com fases, e o cabeçalho

16. **Nível passou a ter FASES.** Era um desenho por nível; agora
    `LevelDef.phases` é uma lista, e a fase é a unidade de tudo: é ela que vale
    ponto, que custa vida (uma, no primeiro erro dela) e que acende uma bolinha.
    O `CORRECT_ANSWER` saía por linha e agora sai por fase, que é o que a
    plataforma entende como resposta.
17. **Os pontos passaram a ser divididos pelas fases do nível** (30 ÷ fases), e
    não pelas linhas. Continua fechando 90 se alguém acrescentar uma fase.
18. **O cabeçalho foi refeito no padrão do catálogo** — antes tinha só o `?` num
    campo vazio. Agora: pílula do NÍVEL, bolinhas das fases, "Envie o desenho" no
    meio, vidas em 1020 e `?` com alvo de 136 px. As bolinhas são o álbum.
19. **A remontagem bit a bit saiu.** Ela era o "uau" quando havia uma entrega por
    nível; com sete entregas viraria uma cutscene repetida. O lugar dela é o som:
    cada acerto já toca a nota do dígito. O fim de fase ficou curto (pulo da
    máquina + figurinha voando para a bolinha) e o fim de NÍVEL ficou sendo a
    cena grande, com a nave recolhendo o álbum.

### Revisão 4 — os três níveis e a entrega

10. **A grade virou propriedade do NÍVEL.** Era uma constante `GRID = 5`; agora
    sai de `sizeOf(level)` e a máquina calcula o lado da célula para caber na
    altura do furo da tela. É o que permitiu o 6 × 6 do nível 3 sem tocar em
    mais nada.
11. **Os pontos passaram a ser divididos por linha**, e não fixos: cada nível
    vale 30, dividido pelo número de linhas. Sem isso, uma grade maior renderia
    mais pontos e o total estouraria os 90 da ficha.
12. **A vida continua sendo por linha**, num `Set` de linhas travadas — com a
    fila, caixas de linhas diferentes convivem na tela.
13. **A animação do fim foi refeita**: antes a figurinha encolhia ao lado da
    nave e as duas saíam juntas. Agora ela **entra pela escotilha** — e, para o
    encontro ser visível, o papel abre caminho para a direita (x 830) enquanto a
    máquina se despede: no primeiro teste a carta ocupava o meio da tela e a
    nave entrava por trás dela.
14. **O arranque perdeu um recuo.** `Back.easeIn` puxa a nave para trás antes de
    disparar, e o passo anterior já é um recuo: duas puxadas seguidas faziam a
    nave parecer indecisa. Virou `Cubic.easeIn`.
15. **Animações novas no meio do jogo:** o dígito gira em voo; no erro ele bate
    e volta girando; no acerto a caixa se desmancha em estilhaços de papel e o
    pedaço voa em arco; a célula da máquina pisca ao receber; e cada caixa da
    fila flutua com a sua própria fase — juntas, elas pareciam um acordeão.

### Revisão 3 — o primeiro corte

O primeiro corte (só o nível 1, uma fase) foi montado e jogado inteiro no
navegador. O que saiu diferente do plano, e por quê:

1. **A trava não fecha mais a caixa.** O plano mandava trocar para o quadro
   fechado do PNG; na tela isso escondia o quadradinho exatamente no instante em
   que a criança precisa olhar para ele. Agora a caixa fica aberta, âmbar e
   tremendo — e o quadro fechado ficou reservado para a caixa lacrada do
   nível 3.
2. **O botão certo pulsa já no primeiro erro**, não no segundo. São duas opções
   e não existe frase para ler: esconder a saída seria só teimosia.
3. **A grade da máquina mostra as 25 vagas desde o começo.** Sem elas a tela era
   um retângulo preto, e não havia como adivinhar que aquilo ia virar alguma
   coisa.
4. **A escala inteira encolheu** (revisão 3), para caber uma FILA de caixas na
   tela: caixa 200 → 152, botões 500 × 248 → 320 × 132, máquina 380 → 312.
5. **Carregar virou atirar.** A câmara da nave sumiu: tocar dispara o dígito na
   hora. O "esperar" continua existindo, mas agora é a fila engarrafando — a
   pressa aparece sem nenhum relógio e sem nenhum castigo.
6. **Um tiro por vez.** Sem isso dava para varrer os dois botões e acertar por
   sorte.
7. **O veredito é recalculado no impacto**, a partir do desenho e da posição da
   caixa — não de um campo guardado no tiro. É a regra-função do §8 valendo
   também para o objeto que voa.
8. **A vida é por LINHA, num `Set` de linhas travadas**, e não numa flag só:
   com a fila, caixas de linhas diferentes convivem na tela ao mesmo tempo.
9. **O fim ganhou a figurinha.** Remontar o desenho dentro da tela preta
   terminava a mensagem onde ela começou; agora o desenho vira papel, sai da
   máquina e a nave leva embora.

### O que o teste no navegador confirmou

Os três níveis jogados de ponta a ponta, fase por fase: fila andando e
engarrafando, tiro girando, dígito errado batendo e voltando, TRAVA vista
acontecendo, estilhaços, pedaço voando em arco, a figurinha indo para a bolinha
no fim de cada fase, a fase seguinte começando com a máquina limpa, o 6 × 6 do
nível 3 cabendo na tela, a passagem automática de nível carregando o saldo, e o
fim de nível inteiro — a nave voltando, as figurinhas saindo do álbum e entrando
pela escotilha uma a uma, e o arranque.

No console: `GAME_READY`, `CHECKPOINT` com progresso por fase (0, 50, 100),
`WRONG_ANSWER` nos erros propositais, um `CORRECT_ANSWER` por FASE (15, 15 no
nível de duas; 10 em cada no de três) e um `GAME_COMPLETED` por nível com
`totalStages: 3`. O placar fechou em **90** exatos.

**Sobre testar no painel do navegador:** ele só desenha quadro quando alguém
tira screenshot, e o laço do Phaser fica congelado no meio. Para andar de
verdade é preciso bombear `game.loop.step(t)` com um relógio próprio — e, para
ver ANIMAÇÃO, congelar o `requestAnimationFrame` antes, senão o relógio real e
o bombeado brigam e os tweens terminam num quadro só. A cena é alcançável pelo
fiber do React a partir do `canvas`, o que dispensa gancho de depuração no
código do jogo.
