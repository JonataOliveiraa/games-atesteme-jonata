# Fábrica Liga-Desliga — planejamento

Jogo **104** (o `NEXT_FREE_ID` de hoje; confirmar no registro, porque outras
sessões também mexem) · EF03CO02 · 3º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF03CO02.md`
(a mesma que foi colada no chat em 05/10/2026, sem revisão).
Padrão: `docs/rodada-3/PADRAO-R3.md` e `src/games/INSTRUCOES.md` ("A derrota").
Modelos: `EF02CO05/rota-do-busao` (o mais recente, com `createTutorial`, foco e
arte medida) e `EF03CO02/corra-enquanto` (o irmão, que já resolveu os prazos do
laço com o dedo).

O plano segue a ficha e decide tudo pela régua "simples e claro" (§15):
- N1, N2 e N3 (o N2 e o N3 entraram em 05/10/2026; ver o histórico);
- **1 erro encerra**: `WRONG_ANSWER` + `lose()`, uma vez, com a cena do erro
  **antes** do `lose()`;
- o erro é de **laço**, não de dedo: só conta deixar a esteira rodando com a
  condição já falsa, e sempre depois de um aviso e de uma folga.

**Há duas dúvidas abertas no §16.** A primeira pode mudar a mecânica: a ficha
repete muito a *Corra Enquanto…* (R2). O TEXTURAS não espera por elas. O N1 foi
feito pela ficha (opção a) em 05/10/2026, sem resposta à dúvida 1.

---

## 1. O jogo em uma frase

Uma **fábrica de biscoitos** vista de lado. A esteira atravessa o **forno** no
meio da tela. No alto, a **ficha da regra** diz: *"ENQUANTO o forno estiver
ACESO → esteira LIGADA"*. Embaixo fica um **interruptor gigante**.

A massa crua cai do funil na esquerda. Quando o forno **acende**, a criança
toca o interruptor e a esteira anda: as bolinhas de massa entram no forno,
saem **douradas** e caem na bandeja. Uma **faísca** avisa que o forno vai
**apagar**. Quando a chama some, ela toca de novo e a esteira **para**. Se a
esteira continuar rodando no forno apagado, sai um biscoito **cru** e a
esteira emperra.

Um gesto só: **tocar** o interruptor. O mesmo botão liga e desliga.

## 2. A habilidade e os irmãos

> **(EF03CO02)** Criar e simular algoritmos representados em linguagem oral,
> escrita ou pictográfica, que incluam sequências e repetições simples com
> condição (iterações indefinidas), para resolver problemas de forma
> independente e em colaboração.

| O que a BNCC pede | Onde acontece |
|---|---|
| **repetição** | a esteira ligada é o laço: cada volta leva uma massa ao forno e devolve um biscoito |
| **com condição** | a ficha diz *enquanto o quê*; o forno (N1) e a bandeja (N2) mostram se a condição vale agora |
| **iteração indefinida** | ninguém sabe quantos biscoitos sairão; quem decide é o tempo que o forno fica aceso |
| **simular** | o dedo da criança executa o laço: liga quando a condição passa a valer e desliga quando para |
| linguagem **escrita e pictográfica** | a ficha tem a frase e os pictogramas (chama → esteira) |

**O teste da bolinha, com franqueza.** No N1 a regra é sempre *ligada ENQUANTO
aceso*. Se o forno fosse uma bolinha que fica laranja e cinza, a criança poderia
só copiar a cor sem ler, e o N1 viraria reflexo. O N1 é a entrada, e a leitura
de verdade vem depois:
- **N2:** o `ATÉ` com a **bandeja**. O forno fica aceso o tempo todo e quem para
  o laço é a **contagem** (6 biscoitos). A bolinha do forno não ajuda: é preciso
  ler a ficha e contar.
- **N3:** a ficha **troca no meio** do trecho, e copiar o forno passa a dar
  errado.

**Os irmãos, e o problema (§16, dúvida 1):**

| Jogo | O que a criança faz |
|---|---|
| *Labirinto do Enquanto* (R1, 015) | **monta** o laço (escolhe a condição) e prevê onde o robô para |
| *Corra Enquanto…* (R2, 060) | **segura o dedo** enquanto a condição vale (chuva, lâmpada, sinal) e solta quando muda; N1 `ENQUANTO`, N2 `ATÉ`, N3 misturado |
| **Fábrica Liga-Desliga** (esta ficha) | **liga e desliga** um interruptor enquanto a condição vale (forno) e para quando muda; N1 `ENQUANTO`, N2 `ATÉ`, N3 misturado |

A Fábrica é a Corra Enquanto com outro gesto (alternar em vez de segurar) e
outra ambientação. Os níveis são os mesmos. A diferença de conteúdo que ela traz
é o `ATÉ` da **bandeja**: uma condição que muda **pelo trabalho do próprio laço**
(cada volta põe um biscoito, e a bandeja enche). É o caso do exemplo oficial da
BNCC (*"enquanto a próxima posição estiver vazia, ande um passo"*: o passo é
que leva até o obstáculo). Na Corra Enquanto, todas as condições são coisas do
mundo (chuva, sinal), que mudam sozinhas.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; o exemplo virou o tutorial (`createTutorial`, §9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 e o pedido de 02/10/2026 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre painel ilustrado | `?` pausa a fábrica e repete os balões do tutorial | PADRAO-R3 |
| TRAVA: biscoito cru emperra com cadeado; desligar destrava (+5) | **1 erro encerra**: a esteira roda com o forno apagado além da folga → sai uma bolinha **crua**, a esteira emperra e treme, a ficha pisca → `WRONG_ANSWER` + `lose()` | INSTRUCOES "A derrota" |
| trecho = 20 s | trecho = **uma fornada**: o forno alterna aceso/apagado num roteiro de 3 a 4 mudanças, e a fase só fecha numa parada certa com a bandeja cheia (§6) | sem relógio, não há derrota por tempo; com a cota, ficar sempre desligado não vence |
| desligada com o forno aceso > 2 s: a produção para, a ficha pulsa | mantido, sem custo; a ficha pulsa e uma setinha aponta o interruptor | parar cedo é um erro de laço, mas cobrá-lo puniria a criança cautelosa; a cota já obriga a ligar |
| aviso de 1 s (faísca) antes de cada mudança | mantido, e mais uma **folga** depois da mudança (N1: 1,2 s) | o erro só pode vir de ler errado, não de reflexo |
| bônus de reflexo +5 | **sai** | as estrelas são sempre 3 (concluir é não errar), e o bônus não teria onde aparecer |
| +2 por biscoito | `CORRECT_ANSWER` (+10) a cada **parada certa** (desligar dentro da folga depois que a condição acabou) | um evento por decisão do laço, não por biscoito |
| "ENQUANTO chover farinha → peneira ligada" | **sai** | seria outra máquina e outra arte para a mesma ideia; o forno e a bandeja bastam |
| "ligada ATÉ o apito do chef" | só no **N3** | o N2 é só a bandeja (um assunto por nível) |
| fim: vitrine com a linha do tempo de liga/desliga sobre os estados do forno | mantido: a **linha do tempo** em código, com a faixa do forno (aceso/apagado) e a faixa da esteira (ligada/desligada) uma sobre a outra, e a fornada na vitrine | é o laço desenhado: as duas faixas coincidem |
| sons | sintetizados em WebAudio | PADRAO-R3 |
| telemetria: % ligado certo, reflexo, ENQUANTO × ATÉ | `CORRECT_ANSWER` por parada; `WRONG_ANSWER` no erro | a bridge não tem esses campos |

## 4. O laço

```
fase nova · a ficha da regra desce · o forno começa APAGADO · esteira parada
        │
        ▼
   ┌─► faísca no forno (1 s de aviso) · o forno ACENDE
   │        │ a criança toca o interruptor (cedo ou tarde, tanto faz)
   │        ▼
   │   esteira LIGADA: a massa cai do funil, entra no forno, sai dourada,
   │   cai na bandeja (o contador da fornada sobe)
   │        │
   │   faísca (1 s de aviso) · o forno APAGA · começa a FOLGA (N1: 1,2 s)
   │        │
   │   ┌────┴────────────────────────────┐
   │ desligou dentro da folga         a folga acabou com a esteira ligada
   │ CORRECT_ANSWER (+10)             uma bolinha sai CRUA do forno frio,
   │ a esteira para com um "tchuc"    a esteira emperra e treme, a ficha pisca
   │        │                         WRONG_ANSWER + lose() → done
   │   a bandeja já tem a fornada? ── não ──┐
   │        │ sim                           │
   └────────┼───────────────────────────────┘ (o forno volta a acender)
            ▼
   a bandeja sai para a vitrine · bolinha da fase acende · fase 2 ou fim:
   linha do tempo (forno × esteira) + vitrine + showLevelComplete
```

**A folga começa quando a condição fica falsa** (o forno apaga), e não quando
a faísca aparece. Assim a criança tem o aviso (1 s) **mais** a folga (1,2 s) para
desligar: 2,2 s no N1. Ligar a esteira com o forno apagado também conta: se ela
rodar além da folga com o forno frio, sai uma bolinha crua. Ligar um pouquinho
antes de acender (dentro da folga) não custa nada.

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`. **Quando a arte chegar, o layout se ajusta
ao que for medido.**

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | 2 bolinhas das fases em (194, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas |
| **ficha da regra** | (640, 122), 780 × 100 | moldura em código, com 2 pictogramas do PNG (chama → esteira) e a frase em 2 partes: *ENQUANTO o forno estiver ACESO* / *esteira LIGADA* |
| funil da massa | pintado no fundo, à esquerda, com a boca em (150, 400) | a massa cai daqui |
| **esteira** | de x 90 a x 1060, faixa de cima em y 455–475 | pintada no fundo, **lisa**; as ripas que andam são do código |
| **forno** | centro (640, 390), ~400 × 340, com os túneis na altura da esteira | o PNG aceso/apagado fica **na frente** da esteira, e a massa some dentro dele |
| biscoitos na esteira | y 445, ~64 px | a massa vira biscoito ao passar pelo centro do forno aceso |
| **bandeja** | (1160, 505), ~190 × 70 | os biscoitos caem nela; no N2 aparecem 6 casinhas |
| contador da fornada | sobre a bandeja, (1160, 430) | *3 / 6* em código, grande |
| **interruptor** | (640, 640), ~220 × 130 | PNG desligado/ligado; a lâmpada de estado em código (verde/apagada) |
| zona de toque | o interruptor, 320 × 170 | só ele responde |
| balão do erro | acima do forno, (640, 205) | ≤ 6 palavras |

**Densidade:** **1 alvo** (o interruptor) e o `?`. Na tela também estão a ficha,
o forno e a bandeja, e cada um mostra uma coisa só.

**Teclado:** `Espaço` ou `Enter` aciona o interruptor; `H` repete o tutorial.

## 6. Regras, fases e roteiro (`data/levels.ts`)

### As regras (`data/rules.ts`)

```ts
type Watch = 'oven' | 'tray' | 'whistle'
interface Rule { id: RuleId; kind: 'while' | 'until'; watch: Watch; text: [string, string]; icon: IconId }
```

| id | Ficha | `kind` | O laço roda enquanto… | Nível |
|---|---|---|---|---|
| `ovenLit` | **ENQUANTO** o forno estiver ACESO → esteira LIGADA | while | o forno está aceso | 1, 2, 3 |
| `trayFull` | Esteira LIGADA **ATÉ** a bandeja ter 6 | until | a bandeja tem menos de 6 | 2, 3 |
| `whistle` | Esteira LIGADA **ATÉ** o apito do chef | until | o chef não apitou | 3 |

Como na Corra Enquanto, **`ATÉ` não tem código próprio**: é `ENQUANTO não`. A
cena pergunta uma coisa só, `running(rule, world)`, e é ela que liga a folga.

### O roteiro do forno (dado, não sorteio)

Cada fase traz o roteiro: uma lista de trechos `{ oven: 'lit' | 'out', ms }`, que
**se repete** até a cota fechar (a fase só termina numa parada certa com a
bandeja cheia).

### As 2 fases do N1

| Fase | Regra | Roteiro do forno | Cota | Folga | Biscoito a cada |
|---|---|---|---|---|---|
| 1 | `ovenLit` | apagado 2,5 s → aceso 6 s → apagado 4 s → aceso 6 s → apagado | 6 | 1,2 s | 1,4 s de esteira ligada |
| 2 | `ovenLit` | apagado 2 s → aceso 5,5 s → apagado 3,5 s → aceso 5,5 s → apagado | 6 | 1,2 s | 1,4 s |

Com a esteira ligada o tempo todo, cada trecho aceso dá 3 a 4 biscoitos. Em 2
trechos acesos a cota de 6 fecha, e o forno muda 4 vezes (a ficha pede 3 a 4).
Se a criança ligou tarde e a cota não fechou, o roteiro dá mais uma volta.

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- N1: só `ovenLit`; 2 fases; cada roteiro começa e termina **apagado**;
- cada trecho aceso ≥ 4 s e cada trecho apagado ≥ folga + 1 s (dá tempo de
  desligar e de ver a esteira parada);
- a faísca (1 s) cabe antes de cada mudança;
- com a esteira sempre ligada nos trechos acesos, a cota fecha em ≤ 2 voltas
  do roteiro;
- a frase da ficha cabe (2 partes de ≤ 30 letras).

## 7. O erro

**A esteira rodando com a condição falsa além da folga = 1 erro, encerra.** A
cena vem antes do `lose()` e dura ~1,2 s:

1. Uma bolinha de massa sai do forno **frio** do mesmo jeito que entrou, pálida.
2. A esteira **emperra**: as ripas param, ela treme, e a bolinha crua fica presa
   na saída do forno.
3. A ficha pisca, e o balão sai do forno: *"O forno apagou: desligue!"* (no N2:
   *"A bandeja encheu: desligue!"*).
4. `WRONG_ANSWER` + `lose()` e `if (this.lives.remaining <= 0) return`.

Sem vermelho de alerta e sem som áspero: a esteira faz um "tum-tum" engasgado.

**Não é erro:**
- deixar desligada com a condição verdadeira (a produção para; depois de 2 s a
  ficha pulsa e uma setinha aponta o interruptor);
- ligar e desligar várias vezes;
- ligar um pouco antes do forno acender (dentro da folga);
- tocar fora do interruptor, no HUD ou no `?`.

**Pontos e estrelas:** +10 por **parada certa** (`CORRECT_ANSWER` quando a
criança desliga dentro da folga, com a esteira tendo rodado naquele trecho).
**3 estrelas** ao concluir, porque concluir já significa zero erro.

**Pista que entrega (conferido):** o interruptor não pisca na hora de desligar
(só a faísca do **forno** avisa); a lâmpada do interruptor mostra o estado **da
esteira**, nunca o certo. No N2, o forno fica aceso e não dá aviso nenhum
quando a bandeja enche: a pista é a contagem.

## 8. O acerto, a fornada e o fim

**Esteira ligada:** as ripas correm, os rolos giram, a massa cai do funil com
um "ploft", entra no forno e sai **dourada** com 3 fiozinhos de cheiro
subindo. Ela cai na bandeja e o contador sobe (*4 / 6*).

**Parada certa:** "tchuc" do interruptor, a esteira para com um balanço leve,
um ✓ pequeno pisca no interruptor, e soa um "plim".

**Fim da fase:** a bandeja cheia desliza para a direita (para a vitrine) e
entra uma vazia. A bolinha da fase acende.

**Fim do nível:**
1. **A linha do tempo** (quadro em código): duas faixas, uma em cima da outra.
   - **Forno:** laranja (aceso) e cinza (apagado).
   - **Esteira:** verde (ligada) e branca (desligada).

   Onde as duas coincidem, a faixa ganha um contorno dourado. Embaixo vem a
   frase-síntese da ficha: *"A repetição continua ENQUANTO a condição vale — e
   para quando ela muda."*
2. **A vitrine:** os biscoitos da fornada aparecem em fileira, um a um, com
   "plim".
3. Confete e o `showLevelComplete`.

## 9. Tutorial (`createTutorial`, uma frase por balão)

Chave `ef03co02-l1`, com `teach(scene, key, steps)` como na Rota (`textSize 30`,
`once: false`, `safeTop 90`). A fábrica fica **parada** entre os balões, e só
anda nas demonstrações. O dedo nunca pulsa esperando o toque da criança
(memória *dedo cego em jogo de tempo*).

1. Recorte na **ficha**: *"A regra: ENQUANTO o forno estiver aceso, a esteira
   fica LIGADA."* (Próximo)
2. O forno acende. Recorte em forno + interruptor, dedo tocando o interruptor:
   *"O forno acendeu! Toque para ligar a esteira."* (Ver) → o interruptor liga,
   e a esteira roda ~2,5 s com 2 biscoitos dourando.
3. A faísca aparece e a fábrica pausa. Recorte no forno: *"Faísca! O forno vai
   apagar."* (Próximo) → o forno apaga.
4. Recorte no interruptor, dedo tocando: *"Apagou! Toque para desligar."* (Ver)
   → a esteira para, e o ✓ pisca.
5. Recorte no forno: *"Se a esteira rodar com o forno apagado, o biscoito sai
   cru."* (Vamos começar!) → os biscoitos do treino somem, a bandeja zera e a
   fase 1 começa com o forno apagado.

O `?` pausa a fábrica e repete os passos 1, 3 e 5 sem demonstração
(Continuar). Depois a fábrica volta de onde parou, e a folga em curso
recomeça inteira.

**Dá para entender o objetivo sem ler?** No N1, quase: o forno aceso/apagado e
a esteira andando/parada são pictóricos, e a demonstração faz o caminho todo. A
ficha é escrita para o 3º ano, com os pictogramas de apoio.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| faísca | estrelinhas saindo da porta do forno, a chama tremula | "tsss" curto |
| forno acende / apaga | a chama sobe com brilho / a chama encolhe e some, a janela escurece | "fuuum" / "fff" |
| interruptor | a alavanca troca (PNG), a lâmpada acende/apaga | "tchuc" |
| esteira ligada | ripas correndo, rolos girando, massa caindo | zumbido baixo em laço + "ploft" |
| biscoito pronto | dourado, fiozinhos de cheiro, cai na bandeja | "plim" + contador |
| parada certa | ✓ no interruptor | "plim" duplo |
| desligada com a condição verdadeira > 2 s | a ficha pulsa, setinha no interruptor | — |
| erro | bolinha crua, esteira emperra, a ficha pisca, balão | "tum-tum" engasgado + duas notas descendo |
| fim da fase | bandeja desliza para a vitrine | "vrum" curtinho |
| fim | linha do tempo, vitrine, confete | acorde |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · play · jam · shift · finale · done · panel`.
O interruptor só responde em `play`. A fábrica tem **relógio próprio** (`clock`,
em ms de jogo, que para no `guide`, `panel` e `jam`). O roteiro, a folga e o
espaçamento dos biscoitos andam por ele, e não por `time.now`, para o `?`
pausar de verdade.

A cada quadro em `play`, a cena faz:
- avança o roteiro do forno (`faísca` 1 s antes de cada troca);
- com a esteira ligada, move as ripas e os biscoitos, solta massa a cada 1,4 s
  de esteira e assa ou entrega o que cruza o forno e a ponta;
- `running = rule.kind === 'while' ? watched : !watched`;
- `wrongFor` cresce enquanto `belt && !running` e zera fora disso; se passar da
  folga, vem `jam()`;
- conta a parada certa no toque que desliga, se `!running` e o trecho rodou;
- fecha a fase quando a bandeja tem a cota e a esteira está desligada com
  `!running`.

A bridge segue a Rota: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` por parada certa, `WRONG_ANSWER` + `lose()` no erro,
`CHECKPOINT` com `progress = round(biscoitos / cotaTotal × 100)`,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START. O jogo nunca emite `GAME_OVER` e nunca escreve
`isFinalStage`.

## 12. N2 e N3 (o plano original; o que foi feito está no histórico)

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **o `ATÉ` da bandeja** | o forno fica **aceso** na fase da bandeja; a ficha é *"Esteira LIGADA ATÉ a bandeja ter 6"*; a bandeja mostra 6 casinhas, e quando a 6ª enche começa a folga (1 s); o 7º biscoito cairia no chão (erro). As fases alternam `ATÉ` (bandeja) e `ENQUANTO` (forno), com mudanças a cada ~4 s. Ficha nova para o balão do erro |
| 3 | **a regra que muda no meio** | a ficha **troca no meio** do trecho entre `ENQUANTO` (forno), `ATÉ` (bandeja) e `ATÉ o apito do chef` (o chef aparece na porta e apita, com balão). Antes da troca, a ficha balança 1 s. Mudanças a cada ~3 s, folga de 0,9 s |

## 13. Arquivos, texturas e quem mexe

| Lógica | Peças e apresentação |
|---|---|
| `types.ts`, `data/rules.ts`, `data/levels.ts` (roteiros, validação), `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (relógio, roteiro, folga, erro, fases) | `data/layout.ts`, `data/theme.ts`, `data/words.ts`, `scenes/factory.ts` (fundo, ripas, rolos, funil), `oven.ts` (forno, chama, faísca), `belt.ts` (biscoitos andando, assando, caindo), `tray.ts` (bandeja, contador, casinhas), `switch.ts` (interruptor, lâmpada), `card.ts` (ficha da regra), `finale.ts` (linha do tempo e vitrine), `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi de figurinha**, `19`, sujeita à dúvida 2; prompts no
[TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-fabrica.png` | 1280 × 720 | a fábrica com a **esteira lisa**, o funil da massa e a mesinha da bandeja **pintados**; o meio vazio para o forno |
| `forno.png` | 2 × 1, 512 | o forno **aceso** e **apagado**, com os túneis na altura da esteira |
| `pecas.png` | 4 × 4, 256 | massa crua, biscoito assado, bandeja, interruptor desligado e ligado, chef com apito, 4 pictogramas da ficha, biscoito quebrado e, para a opção (b) da dúvida 1, o pote de massa em 3 níveis com o pictograma dele |
| `cover-fabrica-liga-desliga.png` | 1672 × 941 | capa **com o título** |

**Código:**
- a moldura e a frase da ficha;
- as ripas que andam e os rolos girando;
- a faísca, os fiozinhos de cheiro e a lâmpada do interruptor;
- o contador e as casinhas da bandeja;
- o balão, o ✓, a setinha de dica;
- a linha do tempo, a vitrine, o confete, as bolinhas do HUD e o `?`.

**Antes da arte:** retângulos e círculos com o nome, só para testar.

**Registro:** id = `NEXT_FREE_ID` no commit (hoje **104**), que avança um. O slug
é `fabrica-liga-desliga`. O jogo entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`,
ganha 3 frases em `gameInstructions.ts` e `public/og/fabrica-liga-desliga.jpg`. A
categoria é **Pensamento Computacional**.

## 14. Travas para quem mexer depois

- O erro é **só** de laço: esteira rodando com a condição falsa **além da
  folga**. Parar cedo nunca encerra.
- Toda mudança de condição do mundo tem **faísca de 1 s antes**; a bandeja
  (N2) não precisa de aviso, porque a contagem está à vista.
- A lâmpada do interruptor mostra o estado da esteira, nunca a resposta.
- O relógio da fábrica é próprio e para no tutorial, no `?` e no erro.
- `ATÉ` é `ENQUANTO não`: uma função `running(rule, world)`, nenhum `if` por
  regra na cena.
- O roteiro do forno, a cota e a folga são dados do nível, validados no import.
- A cena do erro vem **antes** do `lose()` e cabe em ~1,2 s.
- O layout se ajusta à **arte medida** (túneis do forno, faixa da esteira, mesa
  da bandeja).

## 15. Decisões (régua "simples e claro")

1. **Fornada em vez de relógio:** a fase fecha com a cota e uma parada certa.
   Não há tempo para acabar, e ficar desligado não vence.
2. **Aviso + folga:** 1 s de faísca antes e 1,2 s de folga depois, porque o
   erro tem de ser de leitura do laço, não de reflexo.
3. **Parar cedo não custa nada:** a ficha pulsa e a setinha ajuda.
4. **Sem bônus de reflexo e sem +2 por biscoito:** um `CORRECT_ANSWER` por
   parada certa.
5. **Sem a peneira de farinha:** o forno e a bandeja bastam; o apito do chef só
   no N3.
6. **Linha do tempo no fim**, com as faixas do forno e da esteira uma sobre a
   outra, porque é o laço desenhado.

## 16. Dúvidas

1. **A ficha repete a *Corra Enquanto…* (R2, 060).** A mecânica é a mesma, só
   com outro gesto (alternar em vez de segurar), e os níveis também:
   `ENQUANTO`, depois `ATÉ`, depois misturado. Alternativas:
   - **(a) Manter a ficha.** O plano acima. A diferença real é o `ATÉ` da
     **bandeja**, a condição que muda pelo trabalho do próprio laço, mas ela só
     aparece no N2.
   - **(b) "A máquina conta"** (recomendado). Todas as condições passam a
     mudar **pelo próprio laço**, como no exemplo da BNCC, e nenhuma muda
     sozinha como chuva ou sinal:
     - N1: *ENQUANTO houver massa no pote*. O pote esvazia a cada biscoito, e
       com ele vazio é preciso desligar, senão a esteira roda vazia e queima.
     - N2: *ATÉ a bandeja ter 6*.
     - N3: as duas juntas, com a ficha mudando.

     Mesmo interruptor, mesma tela e as mesmas folhas, trocando o forno
     aceso/apagado por um pote de massa que esvazia. Assim deixa de ser reflexo
     já no N1 (é preciso **olhar o pote**) e não repete a Corra Enquanto, que é
     toda de condições do mundo.
   - **(c) "Escreva a regra"**. Antes de cada fornada, a criança **monta** a
     ficha (ENQUANTO / ATÉ + a condição), e a fábrica roda **sozinha** pela
     regra dela. Cobre o *criar* da habilidade, mas aproxima do *Labirinto do
     Enquanto* (R1), que já é montagem.
2. **A linha de arte.** O TEXTURAS está na **chibi de figurinha** (`19`), a
   padrão da rodada. Se quiser outra, troco só o bloco de estilo dos prompts.
   As folhas já servem às duas mecânicas: com a opção (b), o forno fica sempre
   aceso (usa só a célula 0 do `forno.png`) e entra o **pote de massa** que já
   está no `pecas.png` (células 11–14).

## Histórico

- **05/10/2026.** Primeiro planejamento, a partir da ficha original, com as
  duas dúvidas do §16.
- **05/10/2026, o N1 feito, todo em `Graphics`** (pedido: "faça o jogo só com
  n1. irei fazendo as texturas, então por hora use Graphics").
  - A dúvida 1 não foi respondida: segui a **ficha** (opção a, o forno). A
    opção (b) continua possível sem arte nova: o pote já está no `pecas.png`
    pedido, e a cena só pergunta `running(rule, world)`.
  - Id **104**, `NEXT_FREE_ID` foi para 105. No catálogo (Pensamento
    Computacional), em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` e com 3 frases em
    `gameInstructions.ts`. Ainda sem capa e sem OG.
  - Desenho em código: a fábrica, o funil, a esteira com ripas e rolos andando
    (`factory.ts`), o forno com chama, janela e rosto acordado/dormindo
    (`oven.ts`), a massa e o biscoito (`art.ts`, `line.ts`), a bandeja com 8
    lugares e o contador (`tray.ts`), o interruptor com alavanca e lâmpada
    (`switch.ts`), a ficha com os pictogramas (`card.ts`) e a linha do tempo com
    a vitrine (`finale.ts`). A `BootScene` já carrega os PNGs da pasta de assets
    quando eles chegarem.
  - Ritmo: esteira a 120 px/s, uma massa a cada 160 px (1 biscoito a cada
    1,33 s); 3 massas já na esteira no começo de cada fase. A cota é contada
    pelos biscoitos **assados**, e no fim da fase os que ainda estão na esteira
    vão para a bandeja sozinhos.
  - A setinha da dica (desligada com o forno aceso > 2 s) fica **ao lado** do
    interruptor; em cima dele, caía no rosto do forno e parecia um bico.
  - No tutorial, o balão do passo "Apagou! Toque para desligar." fica fixo em
    y 300, para o botão não cair dentro do recorte do interruptor.
  - Conferido no navegador:
    - o tutorial inteiro (a ficha, o forno acendendo, a demonstração com 2
      biscoitos, a faísca, o forno apagando, a esteira parando);
    - as 2 fornadas jogadas por um "dedo" de 450 ms de reação: 4
      `CORRECT_ANSWER`, a linha do tempo com o forno e a esteira juntos, a
      vitrine com 16 biscoitos e `GAME_COMPLETED {stage 1, totalStages 1}`;
    - o erro (a esteira ligada no forno apagado: o jam veio aos 1,18 s da folga
      de 1,2 s, com a bolinha crua, o balão *"O forno apagou: desligue!"*,
      `WRONG_ANSWER` e `GAME_OVER`);
    - a dica de "deixou desligado";
    - o `?`, que congela o relógio da fábrica.
- **05/10/2026, as texturas entraram** (pedido: "texturas adicionadas. adapte";
  em tamanhos diferentes do pedido, caixas medidas no `MANIFEST.md` dos assets e
  em `data/files.ts`).
  - O desenho em código saiu: o fundo, o funil, a esteira, a mesinha, o forno,
    a massa, o biscoito, a bandeja, o interruptor e os pictogramas da ficha
    vêm dos PNGs. Ficaram no código: as ripas da esteira e o giro dos rolos, a
    luz do forno aceso, a faísca, os fiozinhos de cheiro, a lâmpada verde do
    interruptor, o contador, a ficha (moldura e frase), o balão, a linha do
    tempo e a setinha da dica.
  - O layout seguiu o fundo: esteira de x 115 a 1026 com a faixa em y 438,
    funil em (186, 405), bandeja na mesinha em x 1159, interruptor com a base
    da caixa em y 706. A ficha subiu 6 px (y 118) para a chaminé caber.
  - **O forno veio sem rosto.** O aceso e o apagado continuam inconfundíveis
    pela porta (fogo × vidro escuro) e pela luz que o código acende atrás dele.
  - A bolinha crua do erro é a massa da folha, mais pálida.
  - No tutorial, os balões que falam só do forno (faísca, biscoito cru) foram
    para baixo dele (y 568), porque o forno da arte é mais alto que o desenho
    provisório e o botão caía no recorte.
  - A capa chegou junto (título com o "á" e o hífen conferidos) e virou a
    miniatura do catálogo e `public/og/fabrica-liga-desliga.jpg`.
  - Conferido no navegador: o tutorial com a arte, uma partida inteira (2
    fornadas, 4 paradas certas, `GAME_COMPLETED {1, 1}`, linha do tempo e
    vitrine) e o erro (o jam com o forno apagado).
- **05/10/2026, enquadramento revisto** (pedido: "reveja o enquadramento").
  - Antes, o fundo era esticado para 1280 × 720 (escala 0,7656): a cena ficava
    pequena e alta (esteira em y 438, massa de 56 px), a ficha encostava na
    janela pintada e sobrava chão vazio embaixo.
  - Agora o fundo entra em escala **0,81**, deslocado 46 px para a esquerda
    (`VIEW`). A escala não passa disso porque o funil (esquerda) e a mesinha
    (direita) têm de caber; o que sai da tela é o suporte do funil, a ponta da
    mesinha e 42 px do chão.
  - A esteira desceu para y 463 (de x 76 a 1039). A massa e o biscoito têm
    62 px, e o forno, escala 0,72 (topo em y 191). A bandeja vai na mesinha em
    x 1180, e a ficha ficou mais estreita (680 px) para não encostar na janela.
  - O interruptor ficou com a base em y 690 e escala 0,66. Desligado, a
    bolinha vermelha passa da caixa por baixo e com 0,72 saía da tela. Ligado,
    ela sobe e fica logo abaixo do pé do forno.
  - Conferido no navegador: ligado, desligado, o erro e uma partida inteira (5
    paradas certas, `GAME_COMPLETED {1, 1}`).
- **05/10/2026, túneis com fundo** (o usuário gerou `forno-entrada.png` e tirou
  o fundo dos túneis do `forno.png`: "desenhe forno-entrada embaixo, e forno
  por cima… assim o biscoito dará sensação que está entrando").
  - O `forno-entrada.png` tem a mesma tela do `forno.png` (1200 × 500) e é
    recortado pelas mesmas caixas (`ovenLit`/`ovenOut`). Fica atrás dos itens
    (profundidade 5,5), e o forno, na frente (10).
  - A luz do forno aceso desceu para trás da esteira, para não tingir a massa.
  - Conferido no navegador: a bolinha aparece dentro do túnel da esquerda, atrás
    do arco, e o biscoito sai pelo da direita.
- **05/10/2026, menos massa no N1, e o N2 e o N3** (pedido: "deixe menos massa
  de biscoito no n1 e faça n2 e n3").
  - **Menos massa:** uma bolinha a cada 220 px de esteira (era 160), ou 1 a
    cada 1,83 s. A fornada caiu de 8 para **6** biscoitos, e a bandeja agora tem
    **6 casinhas** desenhadas em todos os níveis (o número do `ATÉ` da ficha).
    O 2º trecho aceso do N1 foi para 5,6 s, para a cota fechar em 2 acesos.
  - **Fase = lista de trechos.** Cada trecho tem a sua regra (`steps` em
    `levels.ts`). O trecho fecha quando a esteira está desligada, a regra não
    vale mais e (no forno) a cota do trecho fechou. A cena continua perguntando
    só `running(rule, world)`, e a folga, a dica e o `CORRECT_ANSWER` valem
    para qualquer regra.
  - **N2, "Liga até encher"** (folga 1 s): bandeja → forno → bandeja. Na
    bandeja, a ficha é *"Esteira LIGADA / ATÉ a bandeja ter 6"* (para o ATÉ, a
    esteira vai em cima e a condição embaixo, sem a seta). O forno fica aceso e
    o contador conta a bandeja. Se a esteira rodar depois da 6ª, um biscoito
    cai no chão e quebra: *"A bandeja encheu: desligue!"*. No forno, aceso 4 s e
    apagado 4 s, com cota de 4.
  - **N3, "A regra muda"** (folga 0,9 s): fase 1 = forno (cota 2) → bandeja;
    fase 2 = apito do chef → forno (cota 2). Na troca, a ficha balança, sai e
    volta com a regra nova, e aparece o balão *"A regra mudou! Leia a ficha."*.
    O chef surge embaixo da janela 1 s antes de apitar (o aviso), e apita aos 5 s
    do trecho (*"PRIIII!"*); se a esteira rodar depois da folga, ele treme e vem
    *"O chef apitou: desligue!"*.
  - O primeiro ponto do N2 e do N3 traz um balão só (sem demonstração):
    *"Regra nova: ATÉ. Deixe a esteira ligada ATÉ a bandeja ter 6 biscoitos."* e
    *"Agora a regra muda no meio! Leia a ficha toda vez que ela balançar."*. O
    `?` lê a regra da vez e aponta o forno, a bandeja ou o chef.
  - Na linha do tempo, a faixa de cima vira **REGRA** (quando a regra manda
    ligar) no N2 e no N3; no N1 continua **FORNO**.
  - Validação nova: o N2 alterna `ATÉ` e `ENQUANTO` e não tem apito; o N3 tem o
    apito e uma fase com a regra mudando; regra repetida em trechos seguidos não
    vale; a cota de cada trecho de forno fecha em 2 acesos.
  - Conferido no navegador:
    - a validação sem problemas;
    - os três níveis seguidos com o "dedo" automático: `GAME_COMPLETED`
      {1, 3}, {2, 3} e {3, 3}, avançando sozinho;
    - a bandeja enchendo (6/6) e a parada certa;
    - a troca de regra no meio e o chef apitando;
    - a apresentação do N2;
    - o erro da bandeja (o biscoito quebrado no chão, `WRONG_ANSWER` e
      `GAME_OVER`).
