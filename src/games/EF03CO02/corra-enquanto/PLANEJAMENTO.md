# Corra Enquanto... - EF03CO02

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

A criança escolhe a **regra do trecho** e depois é ela quem **roda o laço com o
dedo**: segurar é "a condição vale, repita"; soltar é "a condição parou de
valer, pare".

O robô só anda enquanto o dedo está na tela. O mundo muda no meio do caminho —
a chuva passa, o sinal fecha, a bandeira chega — e a regra que ela escolheu diz
o que fazer com isso.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF03CO02)** Criar e simular algoritmos representados em linguagem oral,
> escrita ou pictográfica, que incluam sequências e repetições simples com
> condição (iterações indefinidas), para resolver problemas de forma
> independente e em colaboração.

Objeto: **Algoritmos com repetições condicionais simples**.

### O teste da bolinha, e onde este jogo fica

> **Troque a chuva por uma bolinha que fica azul e vermelha. O jogo muda?**

Se a regra fosse sempre "segure enquanto a coisa está acontecendo", **não
mudaria**: seria reflexo puro, e a criança obedeceria a um sinal sem ler nada.

O que impede isso é a **polaridade da regra virar de trecho para trecho**. No
trecho da chuva o laço roda com o sinal LIGADO (`ENQUANTO estiver chovendo`);
no da esteira, roda com o sinal DESLIGADO (`ENQUANTO a esteira estiver parada`,
porque só dá para atravessar quando ela para). O mundo mostra o mesmo tipo de
mudança nos dois, e o dedo tem que fazer o **contrário** num e no outro. Sem ler
a frase não existe como saber qual é qual — a bolinha não resolve.

> **Uma ressalva honesta.** Houve uma versão em que a criança **escolhia** a
> regra entre duas fichas antes de correr, e era ela quem cobria o verbo
> *criar* do texto oficial. A tela foi removida a pedido — confundia mais do
> que ensinava. O jogo hoje cobre **simular** com força (é o dedo dela que
> testa a condição a cada instante e decide quantas voltas o laço dá) e cobre
> *criar* só de raspão, pela leitura da regra. Quem quiser o *criar* de volta
> tem o irmão, **Labirinto do Enquanto**, que é montagem pura — e os dois
> juntos fecham a habilidade.

| Campo | Valor no jogo |
|---|---|
| Código | `EF03CO02` |
| Ano | 3º ano |
| Unidade | Pensamento Computacional |
| Objeto | Algoritmos com repetições condicionais simples |
| Verbos da habilidade | criar **e** simular |
| Evidência de *criar* | escolher a ficha da regra antes de correr |
| Evidência de *simular* | segurar enquanto a condição vale e soltar quando ela deixa de valer |

O texto oficial diz que "o número de vezes em que a ação será repetida é
determinado pelo valor lógico da sentença". Aqui isso é literal: **quantos
passos o robô dá é decidido pelo dedo dela, testando a sentença a cada
instante.** Ninguém conta os passos antes; nem ela, nem o jogo.

---

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF03CO02: **Labirinto do Enquanto**.

| | Labirinto do Enquanto | Corra Enquanto... |
|---|---|---|
| Onde acontece | tabuleiro, parado | pista, em movimento |
| Quem testa a condição | o jogo, a cada volta do laço | **o dedo da criança** |
| O que ela faz | prevê o valor lógico e escolhe a condição | escolhe a regra e **executa** o laço |
| Tempo | nenhum: pensa antes, roda depois | o mundo muda enquanto ela executa |
| O erro | previu errado, e o robô prova | rodou uma volta a mais depois da condição virar falsa |

O irmão é **simulação mental**: ela imagina o laço rodando e diz onde ele para.
Este é **execução**: o laço roda no ritmo do mundo e ela é o interpretador.

Duas coisas que só existem aqui:

- **A condição muda no meio da execução.** No tabuleiro o mundo é estático; aqui
  a chuva começa e para enquanto o robô corre, que é o caso que faz a iteração
  ser *indefinida* de verdade.
- **O `ATÉ`.** O irmão só fala `ENQUANTO`. Aqui a mesma mecânica roda com a
  condição invertida, e é a confusão entre os dois que o nível 3 cobra.

---

## 3. O laço

```
TRECHO COMEÇA PARADO
→ a REGRA do trecho aparece no topo e pulsa (1,5 s para ler)
→ o selo da condição entra, o pedal acende, o cronômetro anda
→ ela SEGURA o dedo                                          ← SIMULAR
   ↳ enquanto segura E a condição vale: o robô repete o passo e avança
   ↳ solta: o robô para; o mundo continua mudando
→ a condição VIRA (a chuva para, o sinal fecha, a bandeira chega)
   ↳ soltou dentro da janela: laço fechado certo, +bônus de reflexo
   ↳ continuou segurando além da janela: TRAVA
→ a condição volta a valer: ela segura de novo, o laço recomeça
→ fim do trecho: o robô comemora na bandeira e o próximo trecho começa
```

Controle: **um gesto**. Segurar. Nada de arrastar, nada de segundo botão,
nenhuma tela de menu antes de correr.

---

## 4. Clareza para criança

| Conceito | Como a tela mostra |
|---|---|
| a regra que estou rodando | a ficha grande no topo, o trecho inteiro, nunca some |
| a condição vale agora | o mundo mostra: chuva caindo, sinal verde, esteira andando |
| o laço está rodando | o robô corre, o pedal acende, um som contínuo suave |
| o laço parou | o robô para de pé, o pedal apaga, o som some |
| a condição mudou | o mundo muda **e** a ficha dá um pulso — dois avisos, não um |
| rodei uma volta a mais | cadeado no robô, mundo congelado, a ficha piscando |

O selo da condição **não tem cor de veredito**. Ele mostra o objeto — chuva,
esteira, sinal — e nunca diz se a regra vale agora. Se dissesse, a criança leria
a cor em vez da frase, e a regra viraria enfeite.

---

## 5. A grade: a regra em cima, o mundo no meio, o dedo embaixo

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. A coluna "No celular" usa
fator 0,30 (aparelho de 390 px de largura).

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 - 64 | pílula do nível, vidas, `?` — **sem texto durante a corrida** | `?` toque 116 x 116 | 35 x 35 |
| Cronômetro | 0 - 64 | a barra de tempo, no meio do cabeçalho | 300 x 20 | 90 x 6 |
| Ficha da regra | 72 - 172 | o objeto da condição, a palavra-chave num chip e o resto da frase | 860 x 100 | 258 x 30 |
| Mundo | 186 - 620 | o fundo rolando; o selo da condição em (1080, 302), 196 px | — | selo 59 |
| — pista, dentro dele | 507 - 620 | o asfalto da arte; o robô pisa em y = 596 | robô 168 de altura | 50 |
| Pedal | 632 - 706 | a barra SEGURE, que acende no toque | 900 x 74 | 270 x 22 |
| Zona de toque | 192 - 720 | a tela inteira abaixo da ficha | 1280 x 528 | 384 x 158 |

Os números da pista saíram da medição de `fundo.png`: a arte de 2048 x 768
entra num `tileSprite` de 1280 x 434 com escala 0,565, o que mostra a imagem
inteira e ainda dá a volta sem costura. Nessa escala o asfalto cai em 507 - 620.

**O pedal é o desenho da zona de toque.** A zona vale para tudo abaixo de
y = 200 — o dedo não precisa de pontaria —, mas existe um objeto desenhado
dizendo onde encostar, que é a regra do §4 do modal: ninguém adivinha o que não
se vê.

---

## 6. Níveis e fases

**Fase = um trecho.** Três trechos por nível, e o trecho dura de 12 a 18
segundos.

| Nível | Tipo de regra | Mudanças por trecho | Janela | Cronômetro |
|---|---|---|---|---|
| 1 | só `ENQUANTO`, com a polaridade virando entre trechos | 2 | 1,2 s | 2x o tempo ideal |
| 2 | só `ATÉ` | 3 | 1,0 s | 1,8x |
| 3 | `ENQUANTO` e `ATÉ` alternando | 4 | 0,8 s | 1,6x |

### Nível 1 — o dedo aprende o laço

| Trecho | Regra | O laço roda quando | Mudanças |
|---|---|---|---|
| 1 | `ENQUANTO estiver chovendo` | está chovendo | chove → para → volta |
| 2 | `ENQUANTO a esteira estiver parada` | a esteira está **parada** | parada → liga → para |
| 3 | `ENQUANTO o sinal estiver verde` | o sinal está verde | verde → vermelho → verde |

O trecho 2 é o que segura o jogo de pé: ele inverte o que o trecho 1 ensinou.
Quem decorou "segure quando estiver acontecendo alguma coisa" segura na hora
errada e trava — e é a leitura da frase, não o reflexo, que corrige.

### Nível 2 — o `ATÉ`

`ATÉ` é a mesma repetição com a condição negada, e é onde mora a confusão que a
telemetria pede para medir.

| Trecho | Problema | Regra certa | Ficha errada |
|---|---|---|---|
| 1 | chegar na linha de chegada | `corra ATÉ a bandeira` | `corra ATÉ o poste` |
| 2 | encher o balde | `encha ATÉ a marca` | `encha ATÉ transbordar` |
| 3 | pular corda no recreio | `pule ATÉ o apito` | `pule ATÉ cansar` |

A ficha errada do trecho 2 é a melhor do nível: segurar até transbordar é um
laço que roda **de propósito** uma volta a mais, e a criança vê a água derramar.

### Nível 3 — misturado

Quatro mudanças por trecho, janela de 0,8 s, e a ficha muda de tipo entre um
trecho e outro: `ENQUANTO o sinal estiver verde`, depois `corra ATÉ a bandeira`,
depois `ENQUANTO a esteira andar`. Três fichas na mesa, sempre com um `ENQUANTO`
e um `ATÉ` que descrevem o mesmo mundo.

---

## 7. As regras, em código

O veredito é **função do estado do mundo no instante do toque**, e nunca um
campo guardado na ficha:

```ts
export type RuleKind = 'enquanto' | 'ate'

export interface Rule {
    id: RuleId
    kind: RuleKind
    /** O que a frase observa: 'chuva', 'sinal', 'esteira', 'bandeira', 'balde'. */
    watches: SignalId
    /** O valor que mantém o laço rodando. */
    keepsWhile: boolean
}

/** A condição do laço, testada a cada quadro. */
export const holds = (rule: Rule, world: World) =>
    world.signal(rule.watches) === rule.keepsWhile

/** Só existe UM erro, e é este. */
export const isOverrun = (rule: Rule, world: World, holding: boolean) =>
    holding && !holds(rule, world)
```

`ENQUANTO chover` é `{ watches: 'chuva', keepsWhile: true }`. `ATÉ a bandeira` é
`{ watches: 'bandeira', keepsWhile: false }` — a mesma função, com o valor
trocado. É isso que faz `ATÉ` não precisar de código próprio: **`ATÉ` é
`ENQUANTO não`**, e o jogo prova isso sendo o mesmo teste.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| segurando com a condição valendo | — | +2 por segundo |
| soltou dentro da janela | `CORRECT_ANSWER` | +10 |
| soltou depois da trava | `CORRECT_ANSWER` | +5 |
| rodou volta a mais | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhum número de ponto, acerto ou porcentagem aparece na tela.

---

## 8. O erro, e o que ele NÃO é

**Existe um erro só: continuar segurando depois que a condição virou falsa.** É
a volta do laço que a regra proibia — o pecado exato que o texto oficial
descreve ("caso contrário, ele será interrompido").

A trava: o mundo congela, o robô ganha cadeado e poeirinha, a ficha da regra
pulsa, e **só soltar o dedo destrava**. Volta a correr com +5.

O que **não** é erro:

| Situação | Por quê |
|---|---|
| soltar cedo demais | o laço só parou antes; o mundo espera, a ficha pulsa, e ela segura de novo |
| demorar para retomar quando a condição volta | não fazer nada não roda volta nenhuma — não há o que punir |
| soltar dentro da janela | é a resposta certa, e a janela existe porque dedo de criança de 8 anos não é cronômetro |

Essa assimetria é de propósito: **o laço rodar a menos é hesitação; rodar a mais
é quebrar a regra.** Punir os dois igual transformaria um jogo de raciocínio num
jogo de reflexo — que é justamente o que o §1 corrigiu.

Depois de **dois erros no mesmo trecho**, a ficha certa fica pulsando desde a
mudança seguinte. O contador zera no começo de cada trecho.

---

## 9. Feedback

| Momento | Visual | Som |
|---|---|---|
| fichas na mesa | entram de baixo, uma de cada vez | plim por ficha |
| escolheu | a ficha voa para o topo e as outras caem | acorde curto |
| segurando certo | rastro colorido atrás do robô, pedal aceso pulsando | zumbido contínuo, suave |
| a condição vira | o mundo muda e a ficha dá um pulso branco | **duas notas descendo, bem audível** |
| soltou na janela | faísca no pedal e um selo na linha do tempo | plim agudo |
| trava | cadeado, poeira, mundo congelado, ficha piscando | acorde descendo + baque |
| destravou | o cadeado abre e ele arranca | mola |
| fim do trecho | a linha do tempo se ilumina e a frase-síntese aparece | fanfarra curta |

O som contínuo do laço é o efeito mais importante do jogo: **ele começa quando o
dedo encosta e para quando o dedo sai.** É a repetição virando som — e é o que
faz a criança perceber que existe algo rodando, e não só um boneco andando.

---

## 10. Tutorial: demonstração de 2 s, sem texto

Uma mão aparece, encosta no pedal e **segura**: o robô corre, o rastro sai, o
pedal acende. A chuva para; a mão solta; o robô para. A mão some.

Nenhuma palavra, nenhum botão de avançar. O `?` repete.

---

## 11. Textura e Graphics

**É textura:** o robô, os objetos de condição (nuvem, sinal, esteira, bandeira,
balde) e o fundo da pista. Estão no [TEXTURAS.md](./TEXTURAS.md).

**É Graphics:** ficha de regra, pedal, linha do tempo, balão, cadeado, rastro,
chuva, poeira, faísca, moldura de acerto e erro, barra do topo, vidas e painel
de fim de nível.

A chuva é `Graphics` de propósito: ela **liga e desliga**, e é o próprio estado
da condição. Um PNG de chuva não para de chover.

---

## 12. Registro

```
src/games/EF03CO02/corra-enquanto/
src/assets/games/EF03CO02/corra-enquanto/
```

| Campo | Valor |
|---|---|
| `id` | `060` |
| `slug` | `corra-enquanto` |
| `module` | `EF03CO02/corra-enquanto` |
| `skill` | `EF03CO02` |
| `years` | `[3]` |
| `tags` | `["laço", "enquanto", "condição", "segurar"]` |
| `order` | `155` |
| `points` | `60` |
| `icon` | `⏳` |

Também em `src/data/gameInstructions.ts` e no conjunto
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`.

---

## 13. Arquivos

```
types.ts                Rule, RuleKind, SignalId, World, Stretch, Change
data/theme.ts           cores, fontes
data/layout.ts          as faixas da grade, o x do robô, o pedal
data/rules.ts           as fichas, holds(), isOverrun(), a frase-síntese
data/levels.ts          LEVELS: os trechos, as mudanças e as janelas
scenes/BootScene.ts     glob das texturas + createLoadingScreen
scenes/GameScene.ts     orquestração. Não desenha nada.
scenes/world.ts         fundo rolando, clima, e o SINAL de cada condição
scenes/robot.ts         o robô: correr, parar, travar, comemorar
scenes/card.ts          a ficha da regra: na mesa e no topo
scenes/pedal.ts         o pedal e a zona de toque
scenes/timeline.ts      o registro do trecho
scenes/trava.ts         cadeado, congelamento e destrave
scenes/hud.ts           a barra fina
scenes/audio.ts         WebAudio, sem arquivo
```

**A GameScene não desenha.** Se ela precisar de um `fillRoundedRect`, falta um
painter em `scenes/`.

---

## 14. Antes da arte existir

| Faltando | Reserva |
|---|---|
| `robo.png` | boneco de cápsulas com pernas alternando |
| `sinais.png` | círculo com a inicial do sinal |
| `fundo.png` | céu em gradiente e faixa de chão |

Toda textura entra por `import.meta.glob` e é consumida com
`textures.exists()`: o jogo abre e é jogável com zero PNG na pasta.

---

## 15. O que mudou na construção

**A escolha da ficha ganhou trava própria.** O plano dizia que a ficha errada
fazia o laço rodar errado e a criança via a consequência. Na prática isso pede
dois modelos de mundo rodando ao mesmo tempo — e uma criança de 8 anos correndo
sob uma regra que ela mesma escolheu errado não entende o que está vendo. A
ficha errada agora treme, custa uma vida e as fichas continuam na mesa; depois
de dois erros, a certa pisca. É o padrão de trava do catálogo, aplicado à
escolha em vez da execução.

**Os quadros do robô foram registrados na mão.** A folha entregue tem 6 quadros
de alturas diferentes (253 a 269 px), então cortar em grade fixa faria o robô
escorregar de quadro em quadro. O `BootScene` mede... na verdade não mede: usa
uma tabela tirada da medição do arquivo, e o TEXTURAS registra isso.

**O balanço da corrida veio no desenho**, como no outro corredor do projeto: o
código não acrescenta bob nenhum.

**O fundo é um `tileSprite` de 1280 x 420** com escala 0,547, que mostra a arte
inteira e dá a volta sem costura. A pista da arte cai em y 497-606, e é por isso
que o robô pisa em 580.

**A tela de escolha da regra saiu**, a pedido, depois de jogada: confundia mais
do que ensinava. A regra do trecho agora já vem posta, aparece no topo e pulsa
por 1,5 s antes do laço começar. O que entrou no lugar dela, para o jogo não
virar reflexo, foi a **inversão de polaridade entre trechos** (§1).

**O resumo do fim de trecho e a linha do tempo saíram** pelo mesmo motivo:
eram painel e faixa competindo com o que importa. O fim de trecho agora é o
robô comemorando na bandeira, estrelas e o próximo trecho.

**Entrou o cronômetro** (`shared/hud/createTimeBar`), no meio do cabeçalho, com
o dobro do tempo ideal do trecho. Ele existe para não deixar a partida parar,
não para apressar: quem espera direito na condição falsa gasta tempo previsto,
e só quem simplesmente não joga chega no zero. No zero sai `GAME_OVER` — o
único caso em que este jogo emite isso por conta própria.

**O id do catálogo virou 060**: 058 e 059 já tinham dono quando o jogo entrou.

**A zona de toque do pedal matava o jogo.** Ela cobria a tela inteira abaixo de
y = 192 num `depth` acima das fichas; com `input.topOnly`, o Phaser entregava o
toque só para ela — e como o pedal fica desativado na hora de escolher, o
primeiro gesto do jogo não fazia nada. A zona desceu para logo acima do cenário,
e desativar o pedal agora solta o input de vez (`disableInteractive`).

**A tela foi esvaziada depois do primeiro teste.** Estava com cinco faixas
empilhadas e cinco blocos de texto ao mesmo tempo. Saíram: a frase do problema
no header (a ficha e a bandeira já dizem), a pílula do verbo na ficha (o robô
correndo é o verbo) e a linha do tempo durante a corrida. O que sobrou na tela
enquanto se joga é a regra, o selo da condição e o pedal — e o pedal ficou
verde e sozinho na base, que é o jeito de dizer "encoste aqui" sem escrever.

**O selo da condição não tem cor de veredito.** Ele já foi verde quando a
condição valia; isso entregava a resposta e devolvia o jogo ao teste da
bolinha. Agora é sempre creme: o que muda é o OBJETO desenhado, e ler o objeto
contra a frase é o trabalho da criança. Para a mudança não passar batida, ela
ganhou clarão na tela, onda saindo do selo, pulso na ficha e o som de duas
notas.
