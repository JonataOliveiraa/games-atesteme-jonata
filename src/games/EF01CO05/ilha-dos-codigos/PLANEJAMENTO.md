# Ilha dos Códigos — EF01CO05

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

O baú diz uma coisa num código. A criança **escreve a mesma coisa no outro
código**, na fechadura, e a chave abre o baú.

---

## 1. Duas mudanças em relação ao briefing, e o porquê

> **(EF01CO05)** Representar informação usando diferentes codificações.
> *Exemplo oficial:* mostrar que ao pintar as áreas de uma imagem com cores
> pré-definidas (codificação) uma imagem é recuperada (informação), ou mostrar
> a relação de uma música com suas notas musicais.

### O teste da bolinha reprova o laço do briefing

O briefing propõe: o baú mostra a pista, três cartões aparecem embaixo, a
criança toca no certo — com a legenda visível no canto e as distratoras "bem
diferentes". **Troque tudo por bolinhas coloridas sem significado e o jogo não
muda:** ela acha a linha da legenda, procura o desenho igual entre os três e
aponta. Isso é comparação visual, não codificação — dá para acertar tudo sem
nunca ter percebido que existe um código. E o que sobrar de dúvida, um em três
resolve no chute.

**A troca:** a fechadura do baú tem encaixes vazios, um para cada símbolo da
mensagem. Embaixo fica a **paleta do código de destino — o alfabeto inteiro,
não uma lista de candidatos**. Um toque põe o símbolo no próximo encaixe, um
toque no encaixe devolve. Com a fechadura cheia, a CHAVE acende; girar a chave é
o único momento que cobra.

Isso muda o que a criança faz: em vez de reconhecer a resposta desenhada na
tela, ela **produz** a mensagem, símbolo por símbolo, na ordem certa. Não existe
mais resposta para comparar, e o espaço de chute vai de 3 para 27 (três
símbolos) ou 81 (quatro).

### O segundo problema: o código de som do briefing não emenda

O briefing traz *1 batida = vermelho, 2 batidas = azul, 3 batidas = amarelo*.
Isso funciona com um símbolo por baú e quebra no primeiro baú de dois: três
batidas é "amarelo" ou é "vermelho + azul"? Código que conta não concatena, e a
mensagem de vários símbolos é justamente o que faz a habilidade aparecer.

**A troca:** o som vira **timbre**, um som por símbolo — que é o outro par que o
próprio briefing já traz (sol = chocalho, peixe = splash, lua = tambor). Três
sons em sequência são três símbolos, sem ambiguidade.

Com isso os três pares do briefing viram **um dicionário só**, de três colunas:

| Informação | figura | cor | som |
|---|---|---|---|
| SOL | sol | vermelho | chocalho |
| PEIXE | peixe | azul | splash |
| LUA | lua | amarelo | tambor |
| COCO *(entra no nível 3)* | coco | verde | madeira |

Cada nível escolhe **duas colunas**: som→cor, cor→figura, figura→som. São os
mesmos três pares do briefing, agora como vistas da mesma tabela — que é
exatamente o que a habilidade diz: a mesma informação, dita de jeitos
diferentes. O COCO é acréscimo nosso, e a seção 5 explica por que o nível 3
precisa dele.

### O que continua igual ao briefing

Ilha em tela única, trilha, três baús, o explorador que caminha sozinho, reouvir
a pista de graça tocando no baú, a legenda que vai sumindo de nível em nível, a
TRAVA no erro, o balão de "mesma informação, dois códigos" quando o baú abre, o
tesouro no fim, a frase-chave e os três pares de códigos. O gesto continua um
toque só.

---

## 2. Como isso não vira o Pixel Secreto

`EF01CO05` já tem jogo publicado: o **Pixel Secreto**, que é o exemplo oficial da
BNCC ao pé da letra — pintar a grade seguindo a legenda de cores até a imagem
aparecer. O briefing original, do jeito que estava, era o Pixel Secreto com
roupa de ilha: consultar a legenda e aplicar o código, célula por célula.

A diferença que justifica os dois:

| | Pixel Secreto | Ilha dos Códigos |
|---|---|---|
| Direção | **decodificar**: código → imagem | **codificar**: informação → código |
| Códigos | um só, cor → célula | três, e sempre **um par por vez** |
| O que a criança produz | uma imagem que ela descobre | uma mensagem que ela escreve |
| O que prova o acerto | a figura fica reconhecível | a chave gira e o baú abre |
| A informação | está escondida no código | é conhecida, e muda de roupa |

E vale olhar também o **Passe da Mensagem** (EF01CO04), que é vizinho de
espírito: lá a criança **julga** se duas coisas dizem o mesmo. Aqui ela não julga
equivalência pronta — ela **constrói** a equivalência. Decodificar, julgar e
codificar são três verbos diferentes, e o catálogo passa a ter um jogo de cada.

---

## 3. O laço

```
   o explorador chega ao baú
             │
             ▼
   o baú DIZ a mensagem no código A  ◀── tocar no baú repete, de graça
             │
             ▼
   ela escreve no código B  ──▶  toque na paleta põe
        (a fechadura)       ◀──  toque no encaixe devolve
             │
             ▼
        gira a CHAVE ──── errou ──▶ TRAVA no primeiro encaixe errado
             │                            │
          acertou                    só ele destrava
             │                            │
             ▼                            └────────┐
   o baú abre, o balão mostra os dois códigos      │
   lado a lado, a peça voa para a trilha ◀─────────┘
             │
             ▼
   próximo baú  ·  ou  ·  fim do nível: a reprise dos três
```

**A chave é o único compromisso.** Pôr, tirar, trocar e reouvir não custam nada e
não têm limite — é assim que o jogo separa erro de dedo de erro de cabeça.

---

## 4. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`. Não existe layout relativo
neste projeto: num celular em pé o jogo vira uma faixa 16:9 com tarja preta, ele
não recompõe. Todo número abaixo é coordenada absoluta de `data/layout.ts`.

A última coluna é o tamanho físico aproximado num celular de 390 px de largura
(fator ≈ 0,30) — é ele que decide se dá para ler e para tocar.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| HUD | 0 – 86 | vidas em (40, 45) size 30 · `?` em (1210, 45) r 32 · botão LEGENDA em (1080, 45), 150 × 60 | `?` d 64 | 19 px |
| Ilha | 86 – 250 | mar até 178, areia até 250, trilha em y 232 · 3 baús pequenos em x 300 / 620 / 940 · explorador de 132, pés em 252 | baú 88 | 26 px |
| Pista (código A) | 250 – 390 | até 4 cartas de 120, passo 160, centro x 760, cy 316 · baú ativo em (232, 512), 264 de largura | carta 120 | 36 px |
| Fechadura (código B) | 390 – 540 | até 4 encaixes de 140, passo 160, centro x 760, cy 468 | encaixe 140 | **42 px** |
| Paleta e chave | 540 – 720 | painel a partir de 548, do tamanho do alfabeto · até 4 cartas de 160, passo 190, cy 634 · CHAVE em (1108, 634), r 78 | carta 160 | **48 px** |

86 + 164 + 140 + 150 + 180 = 720. **Nenhum painel cobre nada:** a pista termina em
376, o encaixe começa em 398, o painel da paleta começa em 548 e o encaixe mais
baixo termina em 538.

O baú ativo ocupa x 100 – 364. Com quatro símbolos a fileira começa em x 387; com
dois, em 610. Ele nunca encosta.

O `?` de raio 32 dá 19 px reais — é o tamanho da família (`HELP` do Pulo
Programado é r 30) e vale porque ele não é alvo de jogo. Os alvos de jogo são o
encaixe, a carta e a chave, e nenhum deles desce de 42 px reais.

### A regra que o layout inteiro serve

**A pista e a fechadura usam a mesma conta de posição** — `rowX(i, n)`, com o
mesmo passo e o mesmo centro. O símbolo 2 da pista fica exatamente em cima do
encaixe 2, sempre, com qualquer quantidade. Uma moldura arredondada envolve os
dois.

Essa coluna é o jogo. Ela diz, sem uma palavra, que aquilo em cima e aquilo
embaixo são **a mesma coisa dita de dois jeitos** — e é ela que a TRAVA acende em
vermelho quando a tradução daquela coluna está errada. Se em algum momento a
pista e a fechadura deixarem de ficar alinhadas, o jogo perdeu o argumento.

Com dois ou três símbolos o passo é 160 e o centro 760. **Com quatro, o passo cai
para 150 e o centro anda para 695**, senão a fileira entra no painel da legenda —
e as duas fileiras andam juntas, porque a conta é uma só.

### A ilha é fina de propósito

164 px de mar e areia parecem pouco para um jogo chamado Ilha dos Códigos, e são
suficientes: ali não se joga. A faixa carrega a ficção e o progresso ao mesmo
tempo — os três baús pequenos na trilha **são** as bolinhas de fase, e o
explorador caminhando entre eles é a barra de progresso. Um indicador separado no
topo seria dizer duas vezes a mesma coisa e roubar altura de quem precisa.

### Profundidade

```
scenery 0 · trilha 6 · baú pequeno 10 · explorador 20 · baú ativo 30
painel 60 · carta 70 · hud 80 · balão 100 · fx 120 · borda 140 · overlay 400
```

---

## 5. Níveis e fases

Três níveis, **três fases cada** — a fase é **um baú**. Nove baús no total.

| Nível | Par | Mensagens | Paleta | Legenda |
|---|---|---|---|---|
| 1 — Praia | som → cor | 2, 2, 3 símbolos | 3 cores | fixa, sempre visível |
| 2 — Trilha | cor → figura | 2, 3, 3 símbolos | 3 figuras | 5 s a cada baú, depois recolhe no botão |
| 3 — Gruta | figura → som | 3, 3, 4 símbolos | 4 sons | só no primeiro baú |

**O que cresce dentro do nível** é o tamanho da mensagem; **o que cresce entre os
níveis** são três coisas de uma vez: a mensagem, o quanto a legenda ajuda e a
direção da tradução.

**Por que o COCO entra no nível 3.** Com três palavras e mensagens de quatro
símbolos, o nível 3 seria só o nível 2 mais comprido. A quarta palavra amplia o
alfabeto na hora em que a legenda some, que é onde a criança passa de consultar
para lembrar. É o único acréscimo ao conteúdo pronto do briefing.

**No nível 3, tocar a carta da paleta toca o som dela** — e põe no encaixe. Não
são duas ações: como pôr e tirar não custam nada, experimentar já é ouvir. Quem
cobra é a chave, e só ela.

**A legenda nunca deixa de existir.** "Sem legenda" é o estado padrão da tela, e o
botão LEGENDA continua no topo o nível inteiro. Esconder de vez criaria uma
criança presa num baú que ela não teria mais como resolver — e nenhum estado pode
ficar sem saída. O jogo registra quantas vezes ela abriu, o que é uma medida boa;
o que não pode é virar castigo.

---

## 6. As regras, em código

O baú **não guarda um gabarito**. Ele guarda a mensagem em informação pura, e
cada código é uma vista dela:

```ts
type Word = 'SOL' | 'PEIXE' | 'BANANA' | 'COCO'
type Code = 'figura' | 'cor' | 'som'

const ISLAND: Record<Word, { figura: number; cor: number; som: SoundId }> = { ... }

interface Chest { message: Word[] }
interface Level { level: number; from: Code; to: Code; alphabet: Word[]; chests: Chest[] }
```

A pista desenha `chest.message` no código `from`; a paleta desenha
`level.alphabet` no código `to`; o encaixe guarda `Word`, nunca uma carta.

```ts
// -1 = a fechadura inteira está certa
function firstWrongSlot(message: Word[], lock: (Word | null)[]): number {
    for (let i = 0; i < message.length; i++) {
        if (lock[i] !== message[i]) return i
    }
    return -1
}

const keyIsReady = (lock: (Word | null)[]) => lock.every(slot => slot !== null)
```

**O veredito é sobre a informação, não sobre o desenho.** É isso que permite o
mesmo baú pedir uma resposta em cor no nível 1 e em som no nível 3 sem duplicar
dado nenhum — e é isso que impede alguém de "corrigir" o jogo comparando
texturas.

Os níveis moram em `data/levels.ts`, e só lá.

---

## 7. O erro

**Nada custa até a chave girar.** Pôr, tirar, trocar, reouvir a pista, reabrir a
legenda: livre e ilimitado. Dedo errado não é erro; mensagem errada é.

A chave gira e a conferência anda da esquerda para a direita, um encaixe a cada
120 ms, cada acerto acendendo com um clique. No primeiro que não bate ela para —
e é aí que a TRAVA acontece:

1. o mundo congela: paleta e chave param de responder;
2. **aquele** encaixe ganha cadeado e treme; a coluna dele fica vermelha;
3. o símbolo da pista logo acima dele pulsa e toca de novo;
4. a legenda reacende sozinha por 3 s;
5. o balão diz **qual** e **por quê**, nunca a resposta:
   `Aqui o baú disse o chocalho — e o chocalho não é isso.`
6. só o toque naquele encaixe destrava: o símbolo volta para a paleta;
7. os encaixes à esquerda já estavam certos e ficam travados no lugar; os à
   direita continuam como estavam, e podem ser mexidos;
8. a chave reacende quando a fechadura estiver cheia de novo.

**Depois de dois erros no mesmo encaixe, a carta certa pulsa na paleta.** O
contador é **por encaixe** e **zera quando aquele encaixe é resolvido** — sem
isso, o terceiro erro e todos os seguintes viram dica automática num jogo em que
a dica devia ser exceção.

Três coisas que a trava não pode ser:

- **não pode punir dedo.** Por isso pôr e tirar são gratuitos, e por isso não
  existe relógio: pressa aqui só produziria erro de dedo cobrado como erro de
  cabeça.
- **não pode dar a resposta.** A frase aponta a coluna e repete a pista. Quem diz
  a resposta é a legenda, que ela escolhe abrir.
- **não pode fechar a saída.** Encaixe travado destrava com um toque, a pista
  repete sempre, a legenda abre sempre. Não existe fechadura impossível.

O erro custa **uma vida por giro de chave errado**, nunca por toque.

---

## 8. Feedback

| Momento | O que acontece |
|---|---|
| Explorador chega ao baú | ele para, o baú pula uma vez e **diz a mensagem**: cada símbolo acende e soa em sequência |
| Toque na paleta | a carta afunda e volta (`Back.easeOut`), o símbolo voa até o encaixe, clique curto |
| Toque no encaixe cheio | o símbolo volta voando para a paleta, som leve de destravar |
| Fechadura cheia | a CHAVE acende, pulsa devagar e ganha brilho |
| Chave girando | conferência da esquerda para a direita, um clique por encaixe |
| Acerto | moldura verde da tela · a chave gira · o baú abre com luz · balão com a mensagem nos **dois códigos, um em cima do outro** e a frase-chave · a peça voa para o baú pequeno da trilha |
| Sequência de acertos | o brilho de abertura **cresce a cada baú aberto sem trava**, com o som subindo de tom |
| Erro | moldura vermelha · o baú chacoalha e continua fechado · o cadeado entra no encaixe culpado |
| Fim de nível | o explorador comemora com o **brilho na silhueta dele**, e a reprise mostra as três mensagens do nível nos dois códigos, uma a uma; depois o `showLevelComplete` com as estrelas |
| Fim do jogo | o tesouro da ilha abre com as quatro palavras nos três códigos |

O balão de acerto fecha sempre com a frase do briefing: **"A mesma coisa pode ser
dita com sons, cores ou desenhos!"**

**Brilho não pode cobrir o assunto.** A luz do baú aberto sai por trás dele e para
na altura da pista; ela nunca passa por cima da fileira de encaixes, que é o que
a criança está olhando.

---

## 9. Áudio

Tudo sintetizado em WebAudio, sem arquivo, como no resto do projeto. O que separa
um bip de um som de jogo é o envelope e o filtro.

| Som | Como |
|---|---|
| chocalho (SOL) | ruído branco em passa-alta ~4 kHz, três grãos de 40 ms, decaimento rápido |
| splash (PEIXE) | ruído em passa-baixa com corte descendente de 2 kHz a 300 Hz, 260 ms |
| tambor (BANANA) | seno de 160 Hz caindo para 60 Hz em 90 ms, ataque de 3 ms |
| madeira (COCO) | dois pulsos curtos de onda quadrada em 900 Hz, passa-banda estreito |
| carta / encaixe | clique de 30 ms, triângulo em 700 Hz |
| chave girando | serra curta subindo, 200 → 500 Hz |
| baú abrindo | madeira grave mais um acorde de três notas ascendentes |
| trava | seno de 90 Hz com queda, mais um ruído seco de metal |

**O som nunca é o único canal.** Todo símbolo sonoro tem desenho próprio — uma
onda, um grafismo, que não é a figura da palavra. Quem joga no mudo joga inteiro,
lendo a onda; e isso encosta no exemplo oficial da BNCC, que é justamente a música
e suas notas: o desenho da onda é a partitura do som.

Respeitar `mute-audio` do `EventBus`.

---

## 10. Antes da arte existir

Todo símbolo tem **placeholder de código**, no tamanho final: um cartão
arredondado com a cor do tema e um glifo em Graphics — círculo com raios para o
sol, gota para o peixe, arco para a banana, círculo com três furos para o coco — e
o nome embaixo. O jogo é jogável e ajustável com zero textura carregada.

As texturas entram por `import.meta.glob`, **nunca** por `import` estático: um
arquivo que ainda não existe derruba o `vite build` inteiro.

Ordem de produção:

1. layout, tema e níveis com placeholders — o jogo já joga;
2. fechadura, paleta e chave; a trava vista acontecendo;
3. bridge, vidas e fim de nível;
4. áudio;
5. as texturas entram por último, e nenhuma coordenada muda por causa delas.

---

## 11. A conversa com a plataforma

O jogo não decide aprovação. Ele importa `runtimeGameBridge` — nunca o
`gameBridge`.

| Evento | Quando | Campos |
|---|---|---|
| `GAME_READY` | uma vez, quando dá para jogar | — |
| `CORRECT_ANSWER` | baú aberto | `pointsEarned` 10 se a chave acertou de primeira, 5 se veio depois de trava |
| `WRONG_ANSWER` | giro de chave errado | `pointsEarned: 0`; logo depois, `lives.lose()` |
| `CHECKPOINT` | a cada baú aberto | `progress: Math.round(baúsAbertos / totalDeBaús * 100)`, com o total derivado de `LEVELS` |
| `GAME_COMPLETED` | ao fim de **cada** nível | `stage: this.level.level`, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca à mão | quem emite é o `createLives`, no zero |

O `GAME_COMPLETED` sai **antes** do `if (!isLastLevel)`, senão os níveis 1 e 2
nunca chegam à plataforma. `stage` é o número do nível, tirado de
`this.level.level`; `isFinalStage` não se escreve aqui — quem calcula é o
`outgoingEvent`. Não há tempo esgotado, então não existe o caso de `GAME_OVER` por
conta própria.

As vidas vêm de `?lives=` e valem a partida inteira: `preloadLives` no
`BootScene`, `vidasIniciais` no `init`, `createLives` fora de qualquer container
que sofra `removeAll()`, e o saldo (`this.livesLeft`) atravessa todo
`scene.restart` que troca de nível. Só o recomeçar do zero devolve cheias.

O jogo abre no nível que a plataforma pediu, com `faseInicial(this, 1)` no
`BootScene`.

**Nenhum número na tela.** Pontos, acertos e erros existem no código e saem pelo
bridge; a criança vê estrela, peça de tesouro e baú aberto. O relógio conta por
dentro só para o `durationMs` e para o subtítulo do fim de nível — **não aparece
durante a partida**, porque este é um jogo de pensar e mostrar o tempo correndo
empurraria para o chute.

Do que o briefing queria medir, o bridge carrega acerto de primeira (pelo
`pointsEarned`) e erros. Reouvir a pista e abrir a legenda ficam no jogo: eles não
têm campo no contrato, e inventar um seria mentir para quem recebe.

O briefing pede +15 no acerto e a própria seção de padrões do catálogo pede +10.
Vale o catálogo: **+10 de primeira, +5 depois da trava**. Como nada disso vira
texto na tela, a escolha só aparece na nota.

---

## 12. Registro

Pasta: `src/games/EF01CO05/ilha-dos-codigos/`
Assets: `src/assets/games/EF01CO05/ilha-dos-codigos/`

**`src/data/catalog.ts`** — o `id` segue a criação (o último é 049); o `order`
senta ao lado do irmão, que é o Pixel Secreto em 50:

```ts
{
  id: "050",
  slug: "ilha-dos-codigos",
  module: "EF01CO05/ilha-dos-codigos",
  skill: "EF01CO05",
  years: [1],
  tags: ["código", "cor", "som", "toque"],
  order: 48,
  status: "published",
  title: "Ilha dos Códigos",
  description:
    "Escreva na fechadura do baú a mesma mensagem em outro código e abra o tesouro da ilha.",
  category: "Mundo Digital",
  points: 60,
  icon: "🗝️",
  thumbnail: ilhaDosCodigosThumbnail,
}
```

**`src/data/gameInstructions.ts`**

```ts
"ilha-dos-codigos": [
  "O baú diz uma mensagem com sons, cores ou desenhos.",
  "Toque na paleta para escrever a mesma mensagem no outro código.",
  "Com a fechadura cheia, gire a chave para abrir o baú.",
],
```

**`src/pages/GameDetailsPage.tsx`** — acrescentar `"ilha-dos-codigos"` ao
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`.

### O esqueleto de arquivos

```
src/games/EF01CO05/ilha-dos-codigos/
    PLANEJAMENTO.md
    TEXTURAS.md
    index.ts             config do Phaser (FIT, 1280 × 720)
    types.ts             Word, Code, Chest, Level
    data/island.ts       o dicionário: as palavras nos três códigos
    data/layout.ts       toda coordenada, com o porquê
    data/theme.ts        cores, fontes, tamanhos
    data/levels.ts       os 3 níveis e os 9 baús
    scenes/BootScene.ts  glob das texturas e a tela de carregamento
    scenes/GameScene.ts  orquestração — não desenha nada
    scenes/island.ts     mar, trilha, baús pequenos, explorador
    scenes/clue.ts       a fileira da pista e o baú ativo
    scenes/lock.ts       a fechadura, os encaixes e a chave
    scenes/palette.ts    o alfabeto do código de destino
    scenes/legend.ts     o painel da legenda e o botão
    scenes/symbols.ts    desenha uma Word em qualquer código (placeholder junto)
    scenes/audio.ts      os sons sintetizados
    scenes/recap.ts      a reprise do fim de nível
```

**A GameScene não desenha.** Se ela precisar de um `fillRoundedRect`, falta um
módulo em `scenes/`.

### O tutorial

Três passos, com destaque visual e sem parágrafo (`createTutorial`):

1. o baú acende — *"O baú diz uma mensagem."*
2. uma carta da paleta acende — *"Toque para escrever a mesma mensagem aqui."*
3. a chave acende — *"Fechadura cheia? Gire a chave."*

O `?` do topo pausa e reabre o tutorial a qualquer momento.

---

## 13. Antes de considerar pronto

- [ ] `npx tsc --noEmit` limpo para os arquivos do jogo
- [ ] `npx eslint src/games/EF01CO05/ilha-dos-codigos` limpo
- [ ] jogou os três níveis inteiros no navegador
- [ ] a trava foi vista acontecendo, e o encaixe travado destravou com um toque
- [ ] o contador de dois erros zerou depois de o encaixe ser resolvido
- [ ] jogou um baú inteiro **no mudo**, só pela onda desenhada
- [ ] a coluna da pista bate com a do encaixe em 2, 3 e 4 símbolos
- [ ] mudo funciona; `?` pausa e reabre o tutorial; retomada sem salto
- [ ] `lives=1` reprova de verdade no nível 2
- [ ] um `GAME_COMPLETED` por nível no console, com `stage` 1, 2 e 3
- [ ] nenhum número de ponto na tela
- [ ] nenhum gancho de depuração sobrou (`window.__algo`)

---

## 14. O que mudou na construção

**A banana virou LUA.** A arte entregou o terceiro medalhão como uma meia-lua
grossa — que é o que o prompt pedia — e a criança lê "lua", não "banana". O
dicionário seguiu o desenho em vez de o desenho perseguir o dicionário: nada na
mecânica depende de qual objeto é, e insistir em chamar de banana o que se vê
como lua só criaria uma palavra que o jogo diz e a tela desmente.

**A arte veio com menos quadros, e o layout foi atrás dela.** O explorador tem 3
poses (parado, andando, comemorando), não 6; a caminhada alterna dois quadros a
6 fps e funciona. Os quadros também não são 256 × 256: baú 300 × 250, explorador
250 × 370, símbolos 250 × 250. A medição da caixa alfa mostrou tudo encostando no
fundo da célula (0,94 a 0,98), daí `setOrigin(0.5, 0.98)` no explorador e
`(0.5, 0.95)` no baú — o baú aberto cresce para cima e não mexe na base.

**O fundo sobe 120 px.** `bg-ilha.png` é 16:9 exato, mas a faixa de areia clara
dele cai em y 330 — no meio da área de jogo. Subindo o desenho, a areia vira a
trilha em y 232 e o resto da tela fica sendo a areia molhada lisa, que é o fundo
certo para os painéis. Os 120 px que sobram embaixo são pintados com a mesma cor
chapada do pé do desenho.

**A linha virou moldura.** O plano ligava a pista ao encaixe com uma linha fina
na vertical. Não bastava: rodando, as duas fileiras continuavam lendo como duas
listas soltas. A coluna passou a ser uma moldura arredondada envolvendo o par,
atrás de tudo — e é ela que fica verde no acerto e vermelha na trava.

**O cadeado saiu do centro do encaixe.** No centro ele cobria justamente o
símbolo que a criança tinha acabado de pôr, que é o que ela precisa olhar para
entender o erro. Foi para o canto de cima.

**A legenda ganhou `sticky`.** O `peek(3000)` da trava fechava a legenda do
nível 1, que é fixa — a trava acabava tirando o apoio em vez de dar. No modo
fixo o prazo é ignorado.

**A peça do tesouro fica.** Ela voava para o baú da trilha e sumia, deixando só
a troca de quadro do baú — que a 26 px reais é quase o mesmo desenho. A peça
agora fica pousada em cima, flutuando: é o brilho parado que se lê de longe.

**O tutorial é um por partida, não um por nível.** A chave era
`ef01co05-ilha-l${nível}`, como no Pulo Programado, e isso repetia os mesmos três
passos a cada troca de nível. A mecânica não muda entre os níveis — só o par de
códigos —, então a chave virou `ef01co05-ilha`.

**O painel da paleta nasce do tamanho do alfabeto.** Fixo em 920 px, ele sobrava
vazio dos dois lados com três cartas e parecia defeito.

### O que ficou faltando

A **capa** (`cover-ilha-dos-codigos.png`) para o cartão do catálogo. A entrada
está registrada sem `thumbnail`, que é opcional no tipo `Game`.
