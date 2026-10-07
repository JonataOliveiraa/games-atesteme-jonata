# Pinball de Entrada e Saída — planejamento

Jogo **110** (o 109 foi de outra sessão) · EF03CO06 · 3º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF03CO06.md`
(a mesma colada no chat em 06/10/2026).
Padrão: `docs/rodada-3/PADRAO-R3.md` e `src/games/INSTRUCOES.md` ("A derrota").
Modelos: `EF03CO04/praia-dos-dados` (balão que espera o botão, tutorial por
partes, arte de reserva nas mesmas folhas) e `EF03CO05/robos-famintos` (ação
com a decisão separada da pontaria).

**Duas decisões do usuário (06/10/2026):**
1. **A entrada vira escolha.** Na ficha, a entrada era sempre o mesmo êmbolo,
   sem erro possível, e a criança só decidia a saída. Agora o N2 é a entrada, e
   o N3 junta as duas.
2. *"O jogo NÃO PODE SER CONFUSO, precisa de uma introdução por partes,
   esclarecimentos, visual, e ser claro no objetivo."* O §5 trata disso, e
   cada decisão do plano passa por ele antes da régua "simples e claro" (§16).

Regras fixas:
- **1 erro encerra**: `WRONG_ANSWER` + `lose()`, uma vez, com a cena do erro
  **antes** do `lose()`;
- o erro é **só de aparelho**: a bola que não foi mandada a lugar nenhum volta
  de graça (§8);
- N1, N2 e N3 planejados.

---

## 1. O jogo em uma frase

A mesa de pinball é **o computador por dentro**, e a bolinha é a
**informação**. O Nino faz um pedido (*"Quero OUVIR uma música!"*). A criança
toca no **aparelho de ENTRADA**, e a bola entra por ele. Ela bate no
**PROCESSADOR**, que se acende e transforma o que a bola carrega. Na descida, a
criança toca no **aparelho de SAÍDA**, o flipper manda a bola até ele, e o
aparelho funciona de verdade: o alto-falante toca a música.

## 2. A habilidade e os irmãos

> **(EF03CO06)** Reconhecer que, para um computador realizar tarefas, ele se
> comunica com o mundo exterior com o uso de interfaces físicas (dispositivos
> de entrada e saída).
>
> Exemplificar os diferentes tipos de dispositivos de entrada (teclado, mouse,
> microfone, sensores, antena etc.) e de dispositivos de saída (monitor,
> alto-falante, impressora etc.)

| O que a BNCC pede | Onde acontece |
|---|---|
| **o computador realiza tarefas** | a missão do Nino é uma tarefa (tocar música, mostrar o nome, imprimir o desenho) |
| **comunica-se com o mundo exterior** | a mesa é o computador; o Nino, de fora, é o mundo |
| **dispositivo de entrada** | a bola só entra por um aparelho de entrada: teclado, microfone, câmera (N2, N3) |
| **dispositivo de saída** | a bola só sai por um aparelho de saída: alto-falante, tela, impressora (N1, N3) |
| **interface física** | cada aparelho é um objeto grande, com nome escrito, que faz uma coisa que a criança vê acontecer |

**O teste da bolinha.** Troque os aparelhos por círculos iguais: o jogo deixa
de ter solução. O pedido diz uma **ação** (cantar, escrever, ouvir, ver no
papel), e só reconhecendo o aparelho que faz aquilo se acerta.

**Os irmãos:**

| Jogo | O que a criança faz |
|---|---|
| *Central de Entrada e Saída* (R1, 019) | **conecta** aparelhos ao computador |
| *Fase de Entrada e Saída* (R2, 065) | numa bancada parada, **escolhe 1 de 2 aparelhos** para completar o caminho da Lia |
| **Pinball de Entrada e Saída** (este) | **joga a informação pelo computador**: escolhe por onde ela entra, vê o processamento e escolhe por onde ela sai, com a bola andando |

A decisão é parecida com a da 065, mas a experiência não é: aqui o caminho
ENTRA → PROCESSA → SAI é **feito pela bola**, e a ordem não pode ser pulada. A
saída só acorda depois que o processador termina.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| entrada sempre o êmbolo-teclado, sem erro | N1: só o teclado. N2: **escolher** entre teclado, microfone e câmera. N3: escolher entrada **e** saída | decisão do usuário: a habilidade pede os dois lados |
| saída: tocar a metade da tela para bater o flipper na hora certa | **tocar no aparelho de saída**; o flipper bate sozinho quando a bola chega | o pedido de clareza: o toque é a resposta (o aparelho), e não sobra pontaria para errar a pergunta. É o "carregar antes, disparar no alcance" |
| segurar e soltar o êmbolo | tocar no aparelho de entrada (segurar comprime a mola, soltar lança; um toque rápido também lança) | os dois gestos funcionam; a força só muda o efeito |
| 5 missões por rodada | **4** por nível | criança de 3º ano; com a introdução por partes, 5 cansa |
| N2: 3 rampas, missões por função | N2 vira **a entrada** (a saída é sempre a tela); as missões por função ficam no N3 | um nível, um assunto |
| N3: missão encadeada (2 bolas: imprimir e mostrar) | N3: **entrada + saída** na mesma bola | é o caminho completo, que é a habilidade; 2 bolas seguidas somariam outro assunto |
| impressora junto com as outras desde o N2 | a impressora estreia **no meio do N1** (missões 3 e 4), com um balão só para ela | aparelho novo entra sozinho e apresentado |
| TRAVA: cadeado, saída cômica, flipper piscando, +5 ao destravar | **1 erro encerra**, com a consequência ligada à missão (a tela mostra a música **sem som**; o Nino: *"Eu queria OUVIR!"*) | INSTRUCOES "A derrota"; a consequência ensina mais que a piada solta (chapéu, pato) |
| após 2 travas a rampa certa acende | **sai** | com 1 erro não há segunda trava, e rampa acesa é pista que entrega |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | o exemplo virou a **apresentação por partes** (§5) | PADRAO-R3 §2 e o pedido de clareza |
| `?` abre painel ilustrado | `?` repete os balões principais | PADRAO-R3 |
| sensores, antena, mouse | **fora** | 3 entradas e 3 saídas, cada uma com uma função que a criança já viu |
| telemetria: pares confundidos | `CORRECT_ANSWER` por missão; `WRONG_ANSWER` no erro | a bridge não tem esses campos |
| fim: quadro de pares ENTRADA → SAÍDA | **mantido** (§9) | |

## 4. O laço

```
missão nova · o Nino pede no balão (pose que mostra a ação) [Ok]
        │
        ▼
ENTRADA acorda (só a fileira de cima pode ser tocada)
  a criança toca num aparelho de entrada
  ┌──────────────┴──────────────────────┐
aparelho certo                     aparelho errado (N2, N3)
a bola sai dele levando o que      a bola entra VAZIA (cinza, "?")
entrou (letras, voz, desenho)      o Nino: "A CÂMERA não pega a minha voz!"
        │                          WRONG_ANSWER + lose() → done
        ▼
PROCESSA: a bola bate no processador, que acende, "PROCESSANDO…" (0,5 s),
          e o que ela carrega se transforma (letras → música)
        │
        ▼
SAÍDA acorda (só a fileira de baixo) · a bola desce até os flippers
  a criança toca num aparelho de saída (pode trocar até a bola chegar)
  ┌──────────────┼───────────────────────────────┐
nenhum tocado   aparelho certo                aparelho errado
o flipper       o flipper manda a bola        a bola chega à saída errada,
devolve a bola  para ele: o aparelho          que faz a coisa errada (tela
ao processador  funciona (a música toca)      muda, música no papel)
(de graça)      CORRECT_ANSWER · bolinha      o Nino: "Eu queria OUVIR!"
                da missão acende              WRONG_ANSWER + lose() → done
        ▼
missão seguinte, ou fim: quadro ENTRA → PROCESSA → SAI + showLevelComplete
```

No N1, a entrada tem um aparelho só (o teclado), e o Nino **digita** o pedido.
No N2, a saída é sempre a tela, e a bola vai sozinha: a tela mostra o que
entrou.

## 5. Clareza: o pedido do usuário

O jogo tem de ser claro antes de ser difícil. Tudo abaixo é obrigatório e vai
na validação ou nas travas (§15).

### O que a tela diz sem palavras

- **A mesa lê de cima para baixo, como a frase.** Fileira de cima = ENTRADA,
  meio = PROCESSADOR, embaixo = SAÍDA. O painel da direita tem as mesmas três
  caixas, **na mesma altura** de cada fileira, ligadas por setas para baixo.
  Uma informação, um lugar.
- **Duas cores de categoria, sempre iguais.** Tudo que é entrada tem faixa
  **azul** com a palavra ENTRADA; tudo que é saída, faixa **laranja** com
  SAÍDA. É a categoria, e não a resposta: os três aparelhos da mesma fileira
  têm a mesma cor.
- **Todo aparelho tem o nome escrito**, grande e sempre visível (TECLADO,
  MICROFONE, CÂMERA, ALTO-FALANTE, TELA, IMPRESSORA). Ver a memória *ícone não
  diz o próprio nome*.
- **A bola mostra o que carrega.** Ao sair da entrada, ela leva o ícone do que
  entrou (letras, voz, desenho). No processador, o ícone **se transforma** no
  resultado (letras → nota musical). O processamento fica visível.
- **Só uma fileira acorda por vez.** Antes do lançamento, só as entradas estão
  coloridas e tocáveis; depois do processador, só as saídas. A outra fileira
  fica apagada (cinza claro, sem toque). A criança nunca vê seis alvos acesos.
- **O pedido é uma situação desenhada**, não um ícone para decifrar. O Nino
  aparece **fazendo** a ação (cantando, mão na orelha, mostrando o desenho),
  e o balão traz o verbo em maiúsculas (*"Quero OUVIR uma música!"*).
- **A escolha da saída aparece antes de valer.** Ao tocar numa saída, um
  caminho de luz liga o flipper àquele aparelho. Dá para trocar até a bola
  chegar.

### A apresentação por partes (N1, uma vez)

Cada parte é **uma frase**, com o recorte só no que ela cita, e uma
demonstração de verdade entre as frases. Sem mãozinha: véu escuro, recorte e
anel (memória *tutorial com createTutorial*).

| # | Recorte | Frase | Botão | O que acontece depois |
|---|---|---|---|---|
| 1 | a mesa inteira | *"Este pinball é um computador por dentro."* | Próximo | — |
| 2 | o Nino e o balão | *"O Nino pede alguma coisa ao computador."* | Próximo | o Nino pede: *"Quero OUVIR uma música!"* |
| 3 | o teclado (fileira de cima) | *"A informação ENTRA por um aparelho de entrada. Toque no teclado!"* | — (espera o toque no teclado; nada mais responde) | a bola sai do teclado com as letras |
| 4 | o processador, com a bola parada nele | *"O processador trabalha: as letras viraram música!"* | Próximo | a bola desce devagar |
| 5 | as saídas (fileira de baixo) | *"A informação SAI por um aparelho de saída. O Nino quer OUVIR: toque no alto-falante!"* | — (só o alto-falante responde) | o flipper manda a bola; o alto-falante toca |
| 6 | o painel da direita | *"Sempre assim: ENTRA, PROCESSA, SAI."* | Vamos jogar! | a missão 2 começa sem ajuda |

A missão 1 é o próprio treino e conta. **Antes da missão 3**, um balão só para
a novidade: recorte na impressora, *"Uma saída nova: a IMPRESSORA põe no
PAPEL."* (Ok).

### As estreias dos níveis 2 e 3

**N2 (a entrada vira escolha)**, antes da missão 1, por partes:
1. Recorte nas três entradas: *"Agora a informação pode entrar por três
   aparelhos."* (Próximo)
2. Recorte no teclado: *"O TECLADO leva LETRAS."* (Próximo)
3. Recorte no microfone: *"O MICROFONE leva a VOZ."* (Próximo)
4. Recorte na câmera: *"A CÂMERA leva a IMAGEM."* (Próximo)
5. Recorte no Nino: *"Leia o que o Nino vai fazer e escolha a entrada!"*
   (Vamos jogar!)

**N3 (as duas escolhas)**, um balão: recorte nas duas fileiras, *"Agora você
escolhe a ENTRADA e a SAÍDA."* (Vamos jogar!)

### Dá para entender o objetivo sem ler?

Quase todo. O Nino fazendo a ação, a bola andando de cima para baixo, o
aparelho funcionando e o painel acendendo em ordem contam a história. O verbo
do pedido é o que se lê, e o 3º ano lê.

## 6. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`. **Quando a arte chegar, o layout se ajusta
ao que for medido.**

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | 4 bolinhas das missões em (194, 44); `?` em (1220, 56) | só as bolinhas |
| **Nino** | pés em (175, 690), ~330 px | a pose da missão |
| **balão do pedido** | (175, 200), 300 × 170 | o verbo em maiúsculas + o ícone do que ele quer; espera o Ok |
| **mesa** | x 360–920, y 84–716 | a mesa-computador (PNG); trilhos, funis e luzes em código |
| fileira **ENTRADA** | aparelhos em y ≈ 170: x 640 (N1) ou 490 / 640 / 790 (N2, N3), 120 px | faixa azul "ENTRADA", nome embaixo de cada um |
| **processador** | (640, 370), 150 px | o bumper; "PROCESSANDO…" acima dele |
| flippers | (560, 545) e (720, 545); kicker central em (640, 560) quando há 3 saídas | batem sozinhos |
| fileira **SAÍDA** | aparelhos em y ≈ 650: x 530 / 750 (2 saídas) ou 470 / 640 / 810 (3), 120 px | faixa laranja "SAÍDA", nome embaixo |
| **painel do fluxo** | x 980–1250: ENTRADA (y 170), PROCESSA (y 370), SAÍDA (y 650), setas entre elas | acende na ordem; mostra o aparelho usado |
| zona de toque | cada aparelho acordado, 150 × 150 | só a fileira acordada responde |

**Densidade:** no máximo **3 alvos** acordados ao mesmo tempo, sempre numa
fileira só, com 150 px entre centros. Mais o `?`.

**Teclado:** `1`, `2`, `3` tocam os aparelhos da fileira acordada (da esquerda
para a direita); `Espaço` ou `Enter` respondem o balão; `H` repete a ajuda.

## 7. Aparelhos, conteúdos e missões (`data/devices.ts`, `data/levels.ts`)

### Os aparelhos

| id | Fileira | Nome | O que leva | O que faz quando funciona |
|---|---|---|---|---|
| `keyboard` | entrada | TECLADO | **letras** | as teclas afundam |
| `mic` | entrada | MICROFONE | **voz** | ondinhas saem dele |
| `camera` | entrada | CÂMERA | **imagem** | flash |
| `speaker` | saída | ALTO-FALANTE | **som** | notas saem dele e a música toca |
| `screen` | saída | TELA | **imagem e texto** | a tela acende com o conteúdo |
| `printer` | saída | IMPRESSORA | **papel** | a folha sai com o conteúdo impresso |

### Os conteúdos (o ícone que a bola carrega)

`letters` (ABC), `voice` (ondas de voz), `drawing` (o desenho do Nino),
`music` (nota musical), `cartoon` (desenho animado), `story` (livro),
`invite` (convite), `name` (o nome NINO, escrito em código).

### As missões

`{ ask, pose, input, output, carries, becomes }`. A **entrada** e a **saída**
certas saem do verbo do pedido, e nunca de outra pista.

| Nível | # | O Nino diz | Pose | Entrada | Saída | A bola: entra → sai |
|---|---|---|---|---|---|---|
| 1 | 1 | *Quero OUVIR uma música!* | ouvindo | teclado | **alto-falante** | letras → música |
| 1 | 2 | *Quero VER um desenho animado!* | olhando | teclado | **tela** | letras → desenho animado |
| 1 | 3 | *Quero meu desenho no PAPEL!* | folha na mão | teclado | **impressora** (estreia) | letras → desenho |
| 1 | 4 | *Quero ESCUTAR uma história!* | ouvindo | teclado | **alto-falante** | letras → história |
| 2 | 1 | *Vou CANTAR uma música!* | cantando | **microfone** | tela | voz → voz |
| 2 | 2 | *Vou ESCREVER meu nome!* | escrevendo | **teclado** | tela | letras → nome |
| 2 | 3 | *Vou MOSTRAR meu desenho!* | mostrando | **câmera** | tela | desenho → desenho |
| 2 | 4 | *Vou FALAR um recado!* | falando | **microfone** | tela | voz → voz |
| 3 | 1 | *Vou CANTAR e quero OUVIR!* | cantando | **microfone** | **alto-falante** | voz → música |
| 3 | 2 | *Vou MOSTRAR meu desenho e quero no PAPEL!* | mostrando | **câmera** | **impressora** | desenho → desenho |
| 3 | 3 | *Vou ESCREVER meu nome e quero VER!* | escrevendo | **teclado** | **tela** | letras → nome |
| 3 | 4 | *Vou ESCREVER um convite e quero no PAPEL!* | escrevendo | **teclado** | **impressora** | letras → convite |

**Os verbos são fixos e cobrados na validação:**
- OUVIR/ESCUTAR → alto-falante;
- VER → tela;
- PAPEL → impressora;
- CANTAR/FALAR → microfone;
- ESCREVER → teclado;
- MOSTRAR (desenho) → câmera.

### Os níveis

| Nível | Assunto | Entrada | Saída | Bola |
|---|---|---|---|---|
| 1 | **a saída** | só o teclado | escolher: 2 aparelhos nas missões 1–2, 3 nas missões 3–4 | lenta: a descida dá 2,4 s para escolher |
| 2 | **a entrada** | escolher entre 3 | só a tela, sem escolha | a descida não pede nada |
| 3 | **o caminho todo** | escolher entre 3 | escolher entre 3 | mais viva: 1,8 s |

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- 4 missões por nível;
- o verbo do pedido aponta a entrada e a saída da missão (tabela acima);
- N1: entrada sempre o teclado; a impressora só a partir da missão 3; cada
  saída aparece ao menos uma vez;
- N2: saída sempre a tela; cada entrada aparece ao menos uma vez;
- N3: os 4 pares (entrada, saída) são diferentes; cada entrada e cada saída
  aparecem;
- a mesma resposta não se repete 3 vezes seguidas;
- o pedido cabe (≤ 34 letras por linha, 2 linhas).

## 8. O erro

**Entrada errada (N2, N3) = 1 erro, encerra.** A cena vem antes do `lose()` e
dura ~1,3 s:
1. A bola sai do aparelho tocado **vazia**: cinza, com um "?".
2. Ela desce até o processador, que pisca sem acender.
3. O Nino fica triste e diz o que não deu: *"O TECLADO não pega a minha voz!"*
   (aparelho tocado + o que precisava entrar).
4. `WRONG_ANSWER` + `lose()`.

**Saída errada = 1 erro, encerra.** A bola chega ao aparelho errado, e ele
**faz a coisa errada com a informação certa**:
- a tela mostra a nota musical em silêncio;
- a impressora solta uma folha com a música impressa;
- o alto-falante chia sem imagem nenhuma.

O Nino diz o que queria: *"Eu queria OUVIR!"* / *"Eu queria VER!"* / *"Eu queria
no PAPEL!"*. Depois, `WRONG_ANSWER` + `lose()`.

Sem vermelho e sem som áspero: um "blom" grave curto.

**Não é erro (é de graça):**
- não tocar em saída nenhuma: o flipper devolve a bola ao processador, ela
  processa de novo e desce outra vez. Depois de 2 voltas, o Nino lembra:
  *"Toque numa SAÍDA!"*;
- tocar na fileira apagada, no Nino, no painel ou na mesa;
- trocar a saída escolhida antes de a bola chegar.

**Pontos e estrelas:** `CORRECT_ANSWER` (+10) por missão. **3 estrelas** ao
concluir.

**Pista que entrega (conferido):**
- as entradas são iguais entre si, e as saídas também (mesma faixa, mesmo
  tamanho, mesmo brilho de "acordado");
- a pose do Nino mostra a **ação** (é o conteúdo), e nunca aponta para um
  aparelho;
- o caminho de luz só aparece **depois** do toque da criança.

## 9. O acerto e o fim

**Missão certa:** o aparelho funciona com animação e som próprios, o Nino
comemora, e a bolinha da missão acende no HUD. O painel mostra os dois
aparelhos usados (ícone pequeno nas caixas ENTRADA e SAÍDA).

**Fim do nível: o quadro dos caminhos.** Uma linha por missão:
[aparelho de entrada] → [processador] → [aparelho de saída], com a frase *"O
MICROFONE fez a voz ENTRAR, e o ALTO-FALANTE fez a música SAIR."*. Embaixo
vem a síntese da ficha: *"O computador conversa com o mundo: a informação ENTRA
por um aparelho, é PROCESSADA e SAI por outro."*. Depois, confete e o
`showLevelComplete`.

## 10. A bola e a mesa (sem motor de física)

A bola segue **trajetos desenhados** (`data/paths.ts`), percorridos por tween
com a velocidade do nível. Assim a jogada é sempre a mesma e a validação pode
garantir os tempos.
- **Lançamento:** de cada entrada sai um tubo curto que desce até o funil do
  processador.
- **Processador:** a bola bate, quica 2 vezes em volta, o bumper acende e
  aparece "PROCESSANDO…" (0,5 s). Depois o ícone troca e a bola cai pela
  saída de baixo.
- **Descida:** do processador até os flippers. Essa é a janela da escolha (N1
  2,4 s, N3 1,8 s).
- **Flipper:** com uma saída escolhida, o flipper (ou o kicker do meio) bate, e
  a bola segue a rampa até o aparelho. Sem escolha, a bola quica de volta para
  o processador.
- **Enfeite que não decide:** 2 bumpers pequenos de cada lado do processador
  acendem quando a bola passa perto.

## 11. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| entrada tocada | a mola comprime e solta; a bola sai com o ícone | "tchoc" de mola |
| processador | bumper aceso, "PROCESSANDO…", ícone transforma | "blip-blip" |
| saída escolhida | caminho de luz flipper → aparelho | "tic" |
| flipper | o braço bate | "tac" |
| alto-falante | notas saindo, o cone pulsa | 4 notas de melodia |
| tela | a tela acende com o conteúdo | "plim" |
| impressora | a folha sai com o conteúdo | "zzt-zzt" |
| bola volta (sem escolha) | quica no flipper e sobe | "boing" |
| erro | bola vazia / aparelho fazendo a coisa errada; o Nino triste | "blom" + duas notas descendo |
| fim | quadro, confete | acorde |

## 12. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`:
`intro · guide · ask · input · travel · output · result · jam · finale · done ·
panel`.
- `input`: só a fileira de entrada aceita toque.
- `output`: só a fileira de saída aceita toque, e só enquanto a bola desce
  (`armed` guarda a escolha; tocar de novo troca).
- `travel`: nada aceita toque.

`gen` em todo `await`. A bridge segue a Praia: `GAME_READY` e `CHECKPOINT` no
`create`, `CORRECT_ANSWER` por missão, `WRONG_ANSWER` + `lose()` no erro,
`CHECKPOINT` com `progress = round(missõesFeitas / 4 × 100)`,
`GAME_COMPLETED {stage, totalStages: 3}` e o `onCommand` de START.

## 13. N2 e N3

Estão no §7 (missões e validação) e no §5 (estreias). Usam a mesma mesa e as
mesmas folhas; muda o que acorda em cada fileira.

## 14. Arquivos, texturas e quem mexe

| Lógica | Peças e apresentação |
|---|---|
| `types.ts`, `data/devices.ts`, `data/levels.ts` (missões, verbos, validação), `data/paths.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` | `data/layout.ts`, `data/theme.ts`, `data/words.ts`, `scenes/table.ts` (mesa, trilhos, flippers, bumpers), `ball.ts`, `devices.ts` (aparelhos, faixas, nomes, efeitos), `processor.ts`, `flow.ts` (painel), `kid.ts` (Nino e balão), `finale.ts`, `hud.ts`, `guide.ts`, `audio.ts`, `fallback.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi voador**, `35`, escolhida pelo usuário; prompts no
[TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-fliperama.png` | 1280 × 720 | sala de fliperama aconchegante, com o miolo **liso** onde fica a mesa |
| `mesa.png` | 1 imagem, ~600 × 660 | a mesa-computador **vazia**: tampo e moldura, sem trilho, sem aparelho, sem bumper |
| `aparelhos.png` | 3 × 2, 320 | teclado, microfone, câmera / alto-falante, tela (apagada), impressora |
| `pecas.png` | 4 × 4, 256 | processador apagado e aceso, flipper, bola, mola, bumper pequeno, folha em branco, estrela / 8 conteúdos |
| `nino.png` | 4 × 3, 320 | 10 poses do Nino |
| `cover-pinball-de-entrada-e-saida.png` | 1672 × 941 | capa **com o título** |

**Código:**
- trilhos e funis (linhas de neon);
- as faixas ENTRADA/SAÍDA e os nomes;
- o caminho de luz;
- "PROCESSANDO…";
- o painel do fluxo;
- o balão do Nino;
- as notas que saem do alto-falante;
- o conteúdo dentro da tela e na folha;
- o quadro do fim, o HUD e o `?`.

**Antes da arte:** a arte de reserva (`scenes/fallback.ts`) é desenhada nas
**mesmas folhas e grades**, como na Praia, para o PNG entrar sem código novo.

**Registro:**
- id = `NEXT_FREE_ID` no commit (**110**); o `NEXT_FREE_ID` foi para 111;
- slug `pinball-de-entrada-e-saida`, categoria **Mundo Digital**, ordem 196 (logo
  depois da Fase de Entrada e Saída, 195);
- entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`;
- 3 frases em `gameInstructions.ts`;
- `public/og/pinball-de-entrada-e-saida.jpg`.

## 15. Travas para quem mexer depois

- **Uma fileira acordada por vez.** Entrada antes do lançamento, saída depois
  do processador. Nunca as duas.
- **O processador nunca é pulado**, nem na volta de graça, e o ícone da bola
  sempre se transforma nele.
- A entrada e a saída certas vêm **do verbo** do pedido. O verbo e o aparelho
  são cobrados na validação.
- Todo aparelho tem **o nome escrito** e a faixa da categoria. As faixas são
  iguais dentro da fileira.
- Não escolher saída **nunca** é erro: a bola volta ao processador.
- A cena do erro vem **antes** do `lose()` e cabe em ~1,3 s.
- O balão do Nino espera o Ok, e os toques na mesa ficam travados durante ele.
- Os trajetos da bola são dados (`data/paths.ts`), ajustados à arte medida.

## 16. Decisões (régua "simples e claro", depois da clareza)

1. **Tocar no aparelho de saída**, e não na metade da tela: a resposta é o
   aparelho, e o flipper bate sozinho.
2. **Entrada é toque também** (segurar e soltar só enfeita).
3. **4 missões por nível.**
4. **N2 com a saída fixa na tela**, para a entrada ser o único assunto.
5. **A impressora estreia no N1**, nas missões 3 e 4, com balão próprio.
6. **Erro com a consequência da missão**, sem as piadas soltas da ficha.
7. ~~Sem física de verdade~~ (trocado em 06/10/2026 por física Matter e flippers da criança; ver o histórico).
8. **Personagem fixo, o Nino**, que pede com o corpo (a pose é o desenho da
   ação).

## 17. Dúvidas

1. ~~A linha de arte.~~ **Resolvida em 06/10/2026:** chibi voador (`references/35-chibi-voador.webp`), mandada pelo usuário.
2. **O nome do personagem.** *Nino*: menino de 8 anos. A Lia já é da Fase de
   Entrada e Saída (065) e do Cantinho, por isso não repeti. Trocar o nome não
   muda nada além do `words.ts` e do prompt.

## Histórico

- **06/10/2026** — plano e texturas. O usuário escolheu a entrada como escolha
  e pediu que o jogo não seja confuso; a apresentação por partes (§5) nasceu
  daí.
- **06/10/2026** — o jogo em `Graphics`, com N1, N2 e N3. O usuário só queria o N1, mas aceitou os três.
  - A arte de reserva (`scenes/fallback.ts`) usa as mesmas folhas e grades do TEXTURAS. O `addFrames` mede a caixa de cada célula na carga, então o PNG entra sem código novo.
  - Ajustes do teste: a fileira apresentada acende antes do balão que fala dela; o processador fica aceso durante o balão dele, e as letras viram música só depois do *Ver*; o balão do Nino é limpo entre missões; depois de 2 voltas sem saída, o lembrete some e o pedido volta.
  - Conferido no navegador: o tutorial do N1 completo, a estreia da impressora, N1 → N2 → N3 seguidos (`GAME_COMPLETED` 1, 2 e 3), o quadro do fim, as 2 voltas de graça, a saída errada (a tela mostra a música em silêncio, *"Eu queria OUVIR!"* → `WRONG_ANSWER` + `GAME_OVER`) e a entrada errada (bola vazia com "?", *"O TECLADO não pega a minha voz!"*).
  - Registro: id 110, `gameInstructions` (3 frases), `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`. Faltam a capa e o og.
- **06/10/2026** — linha de arte trocada para a **chibi voador** (`references/35-chibi-voador.webp`). Mudaram só o bloco de estilo e o elenco no negativo dos 6 prompts; grades, células e código ficam iguais.
- **06/10/2026** — texturas no jogo. A personagem chegou como **Lily** (`lily.png`, menina loira), no lugar do Nino, e os textos seguiram (a dúvida 2 fechou assim). A `pecas.png` veio como `Sprite-0021.png` e foi renomeada. As folhas foram limpas de franja, a tela do monitor foi medida, os aparelhos foram para 118 px e a Lily para 372. N2 → N3 jogados de novo com a arte (`GAME_COMPLETED` 2 e 3). Detalhes no `MANIFEST.md` da pasta de assets. Falta a capa.
- **06/10/2026** — **refeito como mesa de verdade.** O usuário: *"o jogo ta mt chato e sem graça, e tambem mt confuso, nem sei oq ta acontecendo na tela. seria bom fazer a mesa com graphics"*. Diagnóstico: a criança só tocava num aparelho e assistia (bola em trilho, flippers automáticos), e a mesa desenhada não combinava com o caminho da bola. Ele escolheu "de verdade":
  - **física Matter**: a bola cai da entrada escolhida, um funil a leva sempre ao chip (o processador nunca é pulado), e ela quica em 2 bumpers e nas paredes;
  - **os flippers são da criança**: um toque na metade esquerda ou direita da tela (ou ← →) bate o flipper daquele lado;
  - **a saída é uma porta**: depois do processador, tocar num aparelho de saída abre a porta só dele (barra amarela com setas), e o chute do flipper puxa a bola um pouco para a porta aberta (no tutorial, puxa toda);
  - **a bola na porta aberta errada encerra a partida**, e a bola que cai no ralo volta de graça, da mesma entrada (e passa pelo chip de novo);
  - a **mesa é Graphics** (`scenes/table.ts`), dividida nas 3 faixas coloridas, com rótulos ENTRADA → PROCESSADOR → SAÍDA à direita. O painel antigo saiu, e a `mesa.png` deixou de ser usada;
  - nenhum texto diz "pinball" (pedido do usuário: criança de 2026 não conhece). A mesa é "mesa";
  - conferido: o tutorial completo até os flippers, o ralo grátis, a porta errada (*"Eu queria no PAPEL!"*), e N1, N2 e N3 jogados por um robô de flipper (`GAME_COMPLETED` 1, 2 e 3).
- **06/10/2026** — **aparelhos plugados.** O usuário: *"a ideia do jogo realmente é mt boa… liliy deve vim para falar so no inicio e fim das fases, alem que a interface da mesa deveria ser mais bonita. e ta meio aleatorio e estranho vc clicar no teclado dai ele ir pro processador e gerar uma bolinha… acho que o jogo fugiu do conceito da habilidade… coloque alguns zoons ease in out e transiction"*. Ele escolheu "aparelhos plugados":
  - **os aparelhos saem da mesa.** A mesa é a caixa do computador; as ENTRADAS ficam do lado de fora à esquerda e as SAÍDAS à direita, cada uma com **lugar fixo, fio próprio e porta própria** na parede (`SLOT` em `data/layout.ts`). Esquerda → meio → direita lê como a frase ENTRA → PROCESSA → SAI. É o "comunica-se com o mundo exterior por interfaces físicas" da BNCC, desenhado;
  - **a informação nasce do uso do aparelho**: tocar no teclado dá zoom nele, as teclas batem, as letras saem, correm acesas pelo fio e só então viram a bolinha, na porta de entrada. Na saída, a bolinha entra na porta aberta, corre pelo fio até o aparelho, e ele funciona com zoom;
  - **a bolinha espera no processador** até a criança escolher a saída (modo `choose`): decidir e mirar ficam separados; no N2 a porta abre sozinha;
  - **a Lily só fala no começo e no fim do nível**, em close, com o fundo escurecido (`kid.ts`). No meio, o pedido fica no **visor** em cima da mesa (`visor.ts`), que também mostra a dica do ralo e o motivo do erro (*"O TECLADO não pega a voz!"*, *"A Lily queria VER!"*);
  - **câmera com zoom e Sine.easeInOut** (`frame()` em `GameScene.ts`): close na Lily, no visor a cada pedido, no aparelho de entrada, no processador e no aparelho de saída; o HUD some no close. Tutorial só no plano aberto;
  - **mesa nova**: tampo de placa de circuito (trilhas e pontos), moldura lilás com trilho cromado, guias de borracha, estilingues rosa, anel de luz no chip e setas que acendem. O desenho fixo é gravado numa `RenderTexture` uma vez só;
  - o chute do flipper compensa a queda da gravidade na mira da porta (no tutorial a primeira bola entra);
  - conferido: o N1 inteiro com o tutorial (0 bolinhas no ralo com o robô de flipper, Lily no fim, quadro e nível completo), o N2 com a entrada errada (bola "?", processador falha, *"O TECLADO não pega a voz!"*, `GAME_OVER`), o N3 com a saída errada (*"A Lily queria VER!"*) e o ralo grátis com a dica.
